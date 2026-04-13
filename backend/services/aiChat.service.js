const axios = require('axios');
const { AITuVanPhien, AITuVanTinNhan, NoiDungChoDuyet } = require('../models');
const { buildSystemInstruction, buildUserPrompt } = require('../utils/aiPromptBuilder');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeParseJson(text) {
    // Gemini đôi khi wrap JSON trong ```json ... ```
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

function normalizeAIResult(rawText, fallbackMessage) {
    const parsed = safeParseJson(rawText);
    if (parsed && parsed.reply) {
        return {
            reply: parsed.reply,
            suggestedSpecialty: parsed.suggestedSpecialty || 'Nội tổng quát',
            priority: parsed.priority || 'TrungBinh',
            needsEmergency: !!parsed.needsEmergency,
            summary: parsed.summary || fallbackMessage.slice(0, 200),
            raw: parsed,
        };
    }
    return {
        reply: rawText || 'Hiện chưa thể phân tích triệu chứng. Vui lòng thử lại sau.',
        suggestedSpecialty: 'Nội tổng quát',
        priority: 'TrungBinh',
        needsEmergency: false,
        summary: fallbackMessage.slice(0, 200),
        raw: { rawText },
    };
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function findOrCreateSession(userId, sessionId, message) {
    if (sessionId) {
        const session = await AITuVanPhien.findOne({
            where: {
                Id_AITuVanPhien: sessionId,
                Id_NguoiDung: userId,
                TrangThai: ['DangHoatDong', 'DaDong'],
            },
        });
        if (!session) throw new Error('Không tìm thấy phiên tư vấn AI');
        return session;
    }
    return AITuVanPhien.create({
        Id_NguoiDung: userId,
        TieuDe: message.trim().slice(0, 80),
        TrangThai: 'DangHoatDong',
    });
}

async function getSessionHistory(sessionId) {
    return AITuVanTinNhan.findAll({
        where: { Id_AITuVanPhien: sessionId },
        order: [['NgayTao', 'ASC']],
    });
}

// ─── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(message, history) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const base = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';

    if (!apiKey) throw new Error('Chưa cấu hình GEMINI_API_KEY trong .env');

    const prompt = `${buildSystemInstruction()}\n\n${buildUserPrompt(message, history)}`;

    const response = await axios.post(
        `${base}/models/${model}:generateContent`,
        { contents: [{ parts: [{ text: prompt }] }] },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            timeout: 30000,
        }
    );

    return response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ─── Moderation ───────────────────────────────────────────────────────────────

async function saveModerationIfNeeded(userMessage, aiReply, result) {
    if (result.priority !== 'KhanCap' && !result.needsEmergency) return;
    try {
        await NoiDungChoDuyet.create({
            CauHoiNguoiDung: userMessage,
            PhanHoiAI: aiReply,
            TuKhoaPhatHien: `${result.suggestedSpecialty || ''},${result.priority || ''},high-risk`,
            TrangThai: 'ChoDuyet',
        });
    } catch (err) {
        console.error('saveModerationIfNeeded error:', err.message);
    }
}

// ─── Exported service functions ───────────────────────────────────────────────

async function chatSession(currentUser, payload) {
    const userId = currentUser.id || currentUser.Id_NguoiDung;
    const session = await findOrCreateSession(userId, payload.sessionId, payload.message);

    const history = await getSessionHistory(session.Id_AITuVanPhien);

    await AITuVanTinNhan.create({
        Id_AITuVanPhien: session.Id_AITuVanPhien,
        VaiTro: 'user',
        NoiDung: payload.message.trim(),
    });

    const rawText = await callGemini(payload.message.trim(), history);
    const result = normalizeAIResult(rawText, payload.message.trim());

    await AITuVanTinNhan.create({
        Id_AITuVanPhien: session.Id_AITuVanPhien,
        VaiTro: 'assistant',
        NoiDung: result.reply,
        RawJson: result.raw,
    });

    await session.update({
        TrieuChungTomTat: result.summary,
        GoiYChuyenKhoa: result.suggestedSpecialty,
        MucDoUuTien: result.priority,
        TrangThai: 'DangHoatDong',
    });

    await saveModerationIfNeeded(payload.message.trim(), result.reply, result);

    return {
        sessionId: session.Id_AITuVanPhien,
        reply: result.reply,
        suggestedSpecialty: result.suggestedSpecialty,
        priority: result.priority,
        needsEmergency: result.needsEmergency,
        summary: result.summary,
    };
}

async function getSessions(currentUser) {
    const userId = currentUser.id || currentUser.Id_NguoiDung;
    return AITuVanPhien.findAll({
        where: {
            Id_NguoiDung: userId,
            TrangThai: ['DangHoatDong', 'DaDong'],
        },
        order: [['NgayCapNhat', 'DESC'], ['NgayTao', 'DESC']],
    });
}

async function getSessionDetail(currentUser, sessionId) {
    const userId = currentUser.id || currentUser.Id_NguoiDung;
    const session = await AITuVanPhien.findOne({
        where: {
            Id_AITuVanPhien: sessionId,
            Id_NguoiDung: userId,
            TrangThai: ['DangHoatDong', 'DaDong'],
        },
        include: [{ model: AITuVanTinNhan, as: 'messages' }],
        order: [[{ model: AITuVanTinNhan, as: 'messages' }, 'NgayTao', 'ASC']],
    });
    if (!session) throw new Error('Không tìm thấy phiên tư vấn AI');
    return session;
}

async function deleteSession(currentUser, sessionId) {
    const userId = currentUser.id || currentUser.Id_NguoiDung;
    const session = await AITuVanPhien.findOne({
        where: { Id_AITuVanPhien: sessionId, Id_NguoiDung: userId },
    });
    if (!session) throw new Error('Không tìm thấy phiên tư vấn AI');
    await session.update({ TrangThai: 'DaAn' });
    return true;
}

module.exports = {
    chatSession,
    getSessions,
    getSessionDetail,
    deleteSession,
};
