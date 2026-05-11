const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const { NguoiDung, AITuVanPhien, AITuVanTinNhan, AIConsultationSession, ChuyenKhoa, BacSi, BenhNhan, PhongKham } = require('../models');
const aiChatService = require('../services/aiChat.service');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetryAndFallback(keys, contents, isVision, preferredModel = 'gemini-2.5-flash') {
  // If it's a vision request, we might still fallback to gemini-2.5-flash as it supports vision well
  const models = [preferredModel, 'gemini-2.5-pro'];
  const maxRetries = 2;
  const retryableStatuses = [429, 500, 503];

  const promptLength = JSON.stringify(contents).length;

  for (const key of keys) {
    if (!key) continue;
    const genAI = new GoogleGenerativeAI(key);
    
    for (let i = 0; i < models.length; i++) {
      const modelName = models[i];
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.2
            }
          });
          const result = await model.generateContent(contents);
          return result;
        } catch (error) {
          const status = error?.status;
          const isRetryable = retryableStatuses.includes(status);

          console.error("AI Chat Error Details:", {
            at: new Date().toISOString(),
            route: "chat",
            model: modelName,
            retryCount: attempt,
            status: status,
            statusText: error?.statusText,
            promptLength: promptLength,
            isVision: isVision,
            message: error?.message
          });

          if (!isRetryable || attempt === maxRetries) {
            break; // Fallback to next model, or next key
          }

          const delay = Math.pow(2, attempt) * 1000;
          await wait(delay);
          attempt++;
        }
      }
    }
  }
  throw new Error("Tất cả API keys và models đều quá tải hoặc gặp sự cố.");
}

// Auto-reload .env before call
function getGeminiApiKey() {
  delete require.cache[require.resolve('dotenv')];
  require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
  return process.env.GEMINI_API_KEY;
}

const jwt = require('jsonwebtoken'); // Added for decoding token inside public chat route

exports.analyzeSymptoms = async (req, res) => {
  try {
    const symptoms = req.body.symptoms || req.body.message;
    if (!symptoms) return res.status(400).json({ detail: 'Missing symptoms' });

    const apiKey = getGeminiApiKey();
    const keys = [apiKey].filter(Boolean);
    if (keys.length === 0) return res.status(500).json({ detail: 'Chưa cấu hình API Key' });

    const prompt = `Bạn là trợ lý AI y tế trực tuyến. Triệu chứng: "${symptoms}". Đưa ra gợi ý chuyên khoa và lời khuyên ngắn gọn. KHÔNG CHẨN ĐOÁN.`;
    const result = await generateWithRetryAndFallback(keys, prompt, false, 'gemini-2.5-flash');
    const response = await result.response;
    res.json({ result: response.text() });
  } catch (error) {
    res.status(500).json({ detail: 'AI Error: ' + error.message });
  }
};

exports.suggestPatientAI = async (req, res) => {
    try {
        const { symptoms, facility_id } = req.body;
        if (!symptoms) return res.status(400).json({ detail: 'Vui lòng nhập triệu chứng' });

        const apiKey = getGeminiApiKey();
        const keys = [apiKey].filter(Boolean);
        if (keys.length === 0) return res.status(500).json({ detail: 'Chưa cấu hình API Key' });

        // Fetch specialties and doctors for context
        const specialties = await ChuyenKhoa.findAll({ attributes: ['Id_ChuyenKhoa', 'TenChuyenKhoa'] });
        
        const prompt = `Bạn là trợ lý điều phối y tế AI cho hệ thống MediSched.
        Nhiệm vụ: Phân tích triệu chứng của bệnh nhân và gợi ý chuyên khoa, mức độ ưu tiên.
        QUY TẮC TUYỆT ĐỐI:
        1. KHÔNG được chẩn đoán bệnh (Không nói "Bạn bị bệnh X").
        2. CHỈ ĐƯỢC gợi ý (Dùng cụm từ "Dựa trên thông tin bạn cung cấp, hệ thống gợi ý...").
        3. Cảnh báo thông tin chỉ mang tính tham khảo.
        4. Trả về kết quả dưới dạng JSON có cấu trúc sau:
        {
          "summary": "Tóm tắt triệu chứng ngắn gọn",
          "suggested_specialty_name": "Tên chuyên khoa phù hợp nhất từ danh sách",
          "priority_level": "LOW/MEDIUM/HIGH/URGENT",
          "reason": "Lý do gợi ý chuyên khoa này (Ngắn gọn)",
          "advice": "Lời khuyên hướng dẫn đặt lịch (Không phải lời khuyên điều trị)"
        }

        Danh sách chuyên khoa có sẵn: ${specialties.map(s => s.TenChuyenKhoa).join(', ')}
        Triệu chứng bệnh nhân: "${symptoms}"`;

        const result = await generateWithRetryAndFallback(keys, prompt, false, 'gemini-2.5-flash');
        const aiResponse = await result.response;
        let aiJson;
        try {
            const text = aiResponse.text().replace(/```json/g, '').replace(/```/g, '').trim();
            aiJson = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI JSON:", aiResponse.text());
            return res.status(500).json({ detail: 'AI trả về định dạng không hợp lệ. Vui lòng thử lại.' });
        }

        // Find specialty ID
        const matchedSpecialty = specialties.find(s => s.TenChuyenKhoa.toLowerCase().includes(aiJson.suggested_specialty_name.toLowerCase()));
        
        // Find suggested doctors in this specialty
        let suggestedDoctor = null;
        if (matchedSpecialty) {
            suggestedDoctor = await BacSi.findOne({ 
                where: { Id_ChuyenKhoa: matchedSpecialty.Id_ChuyenKhoa, TrangThai: 'HoatDong' },
                include: [NguoiDung]
            });
        }

        // Save session if user is logged in
        let session = null;
        if (req.user) {
            const benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } });
            const user = await NguoiDung.findByPk(req.user.id);
            const age = user.NgaySinh ? new Date().getFullYear() - new Date(user.NgaySinh).getFullYear() : null;

            session = await AIConsultationSession.create({
                patientId: benhnhan?.Id_BenhNhan,
                facilityId: facility_id,
                status: 'SUGGESTED',
                source: 'WEB'
            });
            
            // Also need to create Input and Result for the new 2.0 structure
            const { AIConsultationInput, AIConsultationResult } = require('../models');
            await AIConsultationInput.create({
                aiSessionId: session.id,
                symptoms: symptoms,
                severityLevel: aiJson.priority_level === 'URGENT' ? 'URGENT' : (aiJson.priority_level === 'HIGH' ? 'HIGH' : 'MEDIUM')
            });

            await AIConsultationResult.create({
                aiSessionId: session.id,
                summary: aiJson.reason,
                preliminarySuggestion: aiJson.advice,
                priorityLevel: aiJson.priority_level === 'URGENT' ? 'URGENT' : (aiJson.priority_level === 'HIGH' ? 'PRIORITY' : 'NORMAL'),
                confidenceScore: 0.8
            });
        }

        res.json({
            session_id: session?.id,
            ...aiJson,
            suggested_doctor: suggestedDoctor ? {
                id: suggestedDoctor.Id_BacSi,
                full_name: `${suggestedDoctor.NguoiDung.Ho} ${suggestedDoctor.NguoiDung.Ten}`,
                specialty: matchedSpecialty?.TenChuyenKhoa
            } : null
        });

    } catch (error) {
        console.error('suggestPatientAI error:', error);
        res.status(500).json({ detail: 'Lỗi hệ thống AI' });
    }
};

exports.getPatientAIHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await AIConsultationSession.findAll({
            where: { user_id: userId },
            include: [
                { model: ChuyenKhoa, as: 'suggestedSpecialty' },
                { model: BacSi, as: 'suggestedDoctor', include: [NguoiDung] },
                { model: PhongKham, as: 'suggestedFacility' }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ detail: 'Lỗi lấy lịch sử AI' });
    }
};

exports.chat = async (req, res) => {
  try {
    const { message, image, historyText } = req.body;
    if (!message && !image) return res.status(400).json({ detail: 'Missing message or image' });

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_123');
        userId = decoded.sub;
      } catch (err) {
        // Invalid token, continue as guest
      }
    }

    const apiKey = getGeminiApiKey();
    const fallbackKey = process.env.GEMINI_API_KEY_FALLBACK || 'AIzaSyCiCTDxrMosJCyje-X0IxV9apdTjIC7KYs';
    const keys = [];
    if (apiKey) keys.push(apiKey);
    if (fallbackKey && fallbackKey !== apiKey) keys.push(fallbackKey);

    if (keys.length === 0) return res.status(500).json({ detail: 'Chưa cấu hình GEMINI_API_KEY' });

    const promptText = `Bạn là trợ lý AI y tế trực tuyến phân loại triệu chứng ban đầu.
Quy tắc bắt buộc:
- Không chào hỏi dài dòng, không bày tỏ cảm xúc dư thừa (VD: bỏ ngay các câu như 'Tôi rất tiếc khi nghe bạn bị...', 'Đau bụng là một triệu chứng phổ biến...').
- Đi thẳng vào trọng tâm: Đặt ngay 1 đến tối đa 2 câu hỏi thiết thực nhất để làm rõ triệu chứng.
- Câu trả lời tối đa không quá 50 từ. Ngắn gọn, súc tích và chuyên nghiệp.
- Tuyệt đối KHÔNG yêu cầu người dùng cung cấp vị trí địa lý hoặc địa chỉ để tìm cơ sở y tế (vì hệ thống đã tự động định vị ngầm).

LỊCH SỬ TRƯỚC ĐÓ:
${historyText || 'Chưa có'}

NỘI DUNG MỚI TỪ NGƯỜI DÙNG:
"${message || 'Tôi gửi một hình ảnh'}"`;

    let contents = [promptText];

    if (image) {
      const mimeType = image.split(';')[0].split(':')[1];
      const base64Data = image.split(',')[1];
      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }


    let session = null;

    if (userId) {
      session = await AITuVanPhien.findOne({
        where: { Id_NguoiDung: userId, TrangThai: 'DangHoatDong' },
        order: [['NgayCapNhat', 'DESC']]
      });

      if (!session) {
        session = await AITuVanPhien.create({
          Id_NguoiDung: userId,
          TieuDe: message ? message.substring(0, 80) : 'Tư vấn nhanh qua Popup',
          TrangThai: 'DangHoatDong'
        });
      }

      await AITuVanTinNhan.create({
        Id_AITuVanPhien: session.Id_AITuVanPhien,
        VaiTro: 'user',
        NoiDung: message || 'Ghi chú: Có đính kèm hình ảnh'
      });
    }

    const result = await generateWithRetryAndFallback(keys, contents, !!image, process.env.GEMINI_MODEL || 'gemini-2.5-flash');
    const aiText = result.response.text();

    if (session) {
      await AITuVanTinNhan.create({
        Id_AITuVanPhien: session.Id_AITuVanPhien,
        VaiTro: 'assistant',
        NoiDung: aiText
      });
      session.NgayCapNhat = new Date();
      await session.save();
    }

    res.json({ result: aiText });
  } catch (error) {
    if ([429, 500, 503].includes(error?.status)) {
      return res.status(503).json({
        message: 'AI đang quá tải tạm thời. Vui lòng thử lại sau ít phút.',
        detail: 'AI đang quá tải tạm thời. Vui lòng thử lại sau ít phút.', // keep detail for compatibility just in case
        code: 'AI_TEMPORARILY_UNAVAILABLE'
      });
    }

    res.status(500).json({ detail: 'Có lỗi xảy ra khi gọi AI Gemini: ' + error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    // Legacy endpoint, returning empty as frontend uses /sessions now
    res.json([]);
  } catch (err) {
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getDiagnoses = async (req, res) => {
  try {
    // 1. Fetch from AITuVanPhien (Chat Sessions)
    const chatDiagnoses = await AITuVanPhien.findAll({
      include: [
        { model: NguoiDung, as: 'aituvanUser', attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'Email'] },
        {
          model: BacSi,
          as: 'phuTrach',
          include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }]
        }
      ],
      order: [['NgayCapNhat', 'DESC']]
    });

    // 2. Fetch from AIConsultationSession (Booking Suggestions)
    const bookingConsultations = await AIConsultationSession.findAll({
        include: [
            { model: BenhNhan, include: [{ model: NguoiDung, attributes: ['Ho', 'Ten', 'Email'] }] },
            { model: require('../models').AIConsultationInput },
            { model: require('../models').AIConsultationResult }
        ],
        order: [['createdAt', 'DESC']]
    });

    // 3. Map and Combine
    const chatResults = chatDiagnoses.map(d => ({
      id: d.Id_AITuVanPhien,
      type: 'chat',
      createdAt: d.NgayTao,
      updatedAt: d.NgayCapNhat,
      symptoms: d.TrieuChungTomTat || d.TieuDe || 'Chưa có thông tin',
      diagnosis: d.ChuanDoanSoBo || 'Chưa có chẩn đoán',
      advice: d.LoiKhuyen,
      specialty: d.GoiYChuyenKhoa,
      priority: d.MucDoUuTien,
      status: d.TrangThaiChuyenGiao,
      User: d.aituvanUser ? {
        full_name: `${d.aituvanUser.Ho} ${d.aituvanUser.Ten}`,
        email: d.aituvanUser.Email
      } : null,
      Doctor: d.phuTrach ? {
        id: d.phuTrach.Id_BacSi,
        User: {
          full_name: `${d.phuTrach.NguoiDung.Ho} ${d.phuTrach.NguoiDung.Ten}`
        }
      } : null
    }));

    const bookingResults = bookingConsultations.map(d => ({
        id: d.id,
        type: 'booking',
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        symptoms: d.AIConsultationInput?.symptoms || 'Tư vấn AI',
        diagnosis: d.AIConsultationResult?.summary || 'Phân tích triệu chứng',
        advice: d.AIConsultationResult?.preliminarySuggestion || 'Bệnh nhân đang chờ đặt lịch',
        specialty: 'Liên quan triệu chứng',
        priority: d.AIConsultationResult?.priorityLevel || 'NORMAL',
        status: d.status,
        User: d.BenhNhan ? {
          full_name: `${d.BenhNhan.NguoiDung?.Ho || ''} ${d.BenhNhan.NguoiDung?.Ten || ''}`.trim(),
          email: d.BenhNhan.NguoiDung?.Email
        } : null,
        Doctor: null
    }));

    const result = [...chatResults, ...bookingResults].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(result);
  } catch (error) {
    console.error('getDiagnoses error:', error);
    res.status(500).json({ detail: 'Lỗi khi lấy danh sách chẩn đoán: ' + error.message });
  }
};

exports.assignDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id, type } = req.body; // Added type to distinguish between models

    if (type === 'booking') {
        const session = await AIConsultationSession.findByPk(id);
        if (!session) return res.status(404).json({ detail: 'Không tìm thấy phiên tư vấn' });
        
        session.assigned_doctor_id = doctor_id;
        session.dispatch_status = 'assigned';
        await session.save();
        return res.json({ message: 'Đã phân công bác sĩ cho phiên tư vấn', session });
    }

    const session = await AITuVanPhien.findByPk(id);
    if (!session) return res.status(404).json({ detail: 'Không tìm thấy phiên chat' });

    session.Id_BacSi_PhuTrach = doctor_id;
    session.TrangThaiChuyenGiao = 'assigned';
    await session.save();

    res.json({ message: 'Đã phân công bác sĩ cho phiên chat', session });
  } catch (error) {
    console.error('assignDoctor error:', error);
    res.status(500).json({ detail: 'Lỗi phân công bác sĩ' });
  }
};

exports.acceptDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const { BacSi } = require('../models');

    const doctor = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
    if (!doctor) return res.status(403).json({ detail: 'Doctor profile required' });

    const session = await AITuVanPhien.findByPk(id);
    if (!session) return res.status(404).json({ detail: 'Không tìm thấy phiên' });

    session.Id_BacSi_PhuTrach = doctor.Id_BacSi;
    session.TrangThaiChuyenGiao = 'assigned';
    await session.save();

    res.json({ message: 'Đã tiếp nhận bệnh nhân thành công', session });
  } catch (error) {
    res.status(500).json({ detail: 'Lỗi khi tiếp nhận' });
  }
};

exports.rejectDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await AITuVanPhien.findByPk(id);
    if (!session) return res.status(404).json({ detail: 'Không tìm thấy phiên' });

    session.Id_BacSi_PhuTrach = null;
    session.TrangThaiChuyenGiao = 'pending';
    await session.save();

    res.json({ message: 'Đã từ chối tiếp nhận', session });
  } catch (error) {
    res.status(500).json({ detail: 'Lỗi khi từ chối' });
  }
};

// ─── AI Chat Session (PB12 / PB13) ───────────────────────────────────────────

exports.chatSession = async (req, res) => {
  try {
    const result = await aiChatService.chatSession(req.user, req.body);
    return res.status(200).json({ success: true, message: 'Lấy phản hồi AI thành công', data: result });
  } catch (error) {
    console.error('chatSession error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Không thể xử lý tư vấn AI' });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const result = await aiChatService.getSessions(req.user);
    return res.status(200).json({ success: true, message: 'Lấy lịch sử tư vấn AI thành công', data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Không thể lấy lịch sử tư vấn AI' });
  }
};

exports.getSessionDetail = async (req, res) => {
  try {
    const result = await aiChatService.getSessionDetail(req.user, req.params.id);
    return res.status(200).json({ success: true, message: 'Lấy chi tiết phiên tư vấn AI thành công', data: result });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message || 'Không tìm thấy phiên tư vấn AI' });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    await aiChatService.deleteSession(req.user, req.params.id);
    return res.status(200).json({ success: true, message: 'Ẩn phiên tư vấn AI thành công' });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message || 'Không thể ẩn phiên tư vấn AI' });
  }
};

