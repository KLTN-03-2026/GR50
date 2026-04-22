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
            summary: parsed.summary || fallbackMessage.slice(0, 200),
            diagnosis: parsed.diagnosis || '',
            advice: parsed.advice || '',
            priority: parsed.priority || 'normal',
            emergency: !!parsed.emergency,
            recommended_specialty: parsed.recommended_specialty || 'Nội tổng quát',
            recommended_action: parsed.recommended_action || 'Theo dõi thêm',
            raw: parsed,
        };
    }
    return {
        reply: rawText || 'Hiện chưa thể phân tích triệu chứng. Vui lòng thử lại sau.',
        summary: fallbackMessage.slice(0, 200),
        diagnosis: '',
        advice: '',
        priority: 'normal',
        emergency: false,
        recommended_specialty: 'Nội tổng quát',
        recommended_action: 'Theo dõi thêm',
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
    const primaryKey = process.env.GEMINI_API_KEY;
    const fallbackKey = process.env.GEMINI_API_KEY_FALLBACK || 'AIzaSyCAFj8gcyd56LjkUV7qVmuuRmDdgii8eQw';
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const base = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';

    if (!primaryKey && !fallbackKey) throw new Error('Chưa cấu hình GEMINI_API_KEY');

    const prompt = `${buildSystemInstruction()}\n\n${buildUserPrompt(message, history)}`;

    const makeRequest = async (key) => {
        const response = await axios.post(
            `${base}/models/${model}:generateContent`,
            { contents: [{ parts: [{ text: prompt }] }] },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': key,
                },
                timeout: 30000,
            }
        );
        return response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    };

    try {
        return await makeRequest(primaryKey || fallbackKey);
    } catch (error) {
        console.warn('Primary Gemini API key failed, attempting fallback key...', error?.response?.data || error.message);
        if (primaryKey && fallbackKey && primaryKey !== fallbackKey) {
            try {
                return await makeRequest(fallbackKey);
            } catch (fallbackErr) {
                console.error('Fallback Gemini API key also failed', fallbackErr?.response?.data || fallbackErr.message);
                throw fallbackErr;
            }
        }
        throw error;
    }
}

// ─── Moderation ───────────────────────────────────────────────────────────────

async function saveModerationIfNeeded(userMessage, aiReply, result) {
    if (result.priority !== 'emergency' && !result.emergency) return;
    try {
        await NoiDungChoDuyet.create({
            CauHoiNguoiDung: userMessage,
            PhanHoiAI: aiReply,
            TuKhoaPhatHien: `${result.recommended_specialty || ''},${result.priority || ''},high-risk`,
            TrangThai: 'ChoDuyet',
        });
    } catch (err) {
        console.error('saveModerationIfNeeded error:', err.message);
    }
}

// ─── Location & Facility Matching ─────────────────────────────────────────────

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

async function findNearbyFacilities(lat, lng, specialty) {
    const { PhongKham } = require('../models');
    try {
        // Find all clinics for now. In a real system, you'd filter by specialty/status.
        const clinics = await PhongKham.findAll();
        let facilities = clinics.map(c => {
            let distance = null;
            let time = null;
            // Assuming we have lat/lng on the model, if not, we generate a mock distance based on ID
            // For this implementation, we will mock distances if the model lacks real coordinates.
            if (lat && lng && c.Latitude && c.Longitude) {
                distance = getDistanceFromLatLonInKm(lat, lng, c.Latitude, c.Longitude);
            } else if (lat && lng) {
                // Mock distance between 1km and 10km if real coordinates are missing
                distance = (c.Id_PhongKham % 10) + 1.5; 
            }
            
            if (distance !== null) {
                time = Math.round((distance / 30) * 60); // Assuming 30km/h average speed in city
            }

            return {
                facility_id: c.Id_PhongKham,
                name: c.TenPhongKham,
                address: c.DiaChi,
                distance_km: distance ? parseFloat(distance.toFixed(1)) : null,
                estimated_travel_time_min: time,
                route_type: time && time < 15 ? 'fastest' : 'nearest',
                maps_url: c.GoogleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.TenPhongKham + ' ' + c.DiaChi)}`
            };
        });

        if (lat && lng) {
            facilities = facilities.sort((a, b) => a.distance_km - b.distance_km);
        }
        
        return facilities.slice(0, 3); // Return top 3
    } catch (error) {
        console.error("Error finding nearby facilities:", error);
        return [];
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

    // ─── Find Nearby Facilities ───
    const nearbyFacilities = await findNearbyFacilities(payload.latitude, payload.longitude, result.recommended_specialty);

    const enrichedJson = {
        ...result.raw,
        nearby_facilities: nearbyFacilities,
        cta: {
            book_now: true,
            open_map: true,
            call_facility: true
        }
    };

    await AITuVanTinNhan.create({
        Id_AITuVanPhien: session.Id_AITuVanPhien,
        VaiTro: 'assistant',
        NoiDung: result.reply,
        RawJson: enrichedJson,
    });

    await session.update({
        TrieuChungTomTat: result.summary,
        GoiYChuyenKhoa: result.recommended_specialty,
        MucDoUuTien: result.priority,
        ChuanDoanSoBo: result.diagnosis,
        LoiKhuyen: result.advice,
        Id_PhongKham: nearbyFacilities.length > 0 ? nearbyFacilities[0].facility_id : null,
        TrangThai: 'DangHoatDong',
    });

    await saveModerationIfNeeded(payload.message.trim(), result.reply, result);

    return {
        sessionId: session.Id_AITuVanPhien,
        reply: result.reply,
        summary: result.summary,
        diagnosis: result.diagnosis,
        advice: result.advice,
        priority: result.priority,
        emergency: result.emergency,
        recommended_specialty: result.recommended_specialty,
        recommended_action: result.recommended_action,
        nearby_facilities: nearbyFacilities,
        cta: enrichedJson.cta
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
