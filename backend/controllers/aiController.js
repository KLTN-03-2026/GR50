const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const { NguoiDung, AITuVanPhien, AITuVanTinNhan } = require('../models');
const aiChatService = require('../services/aiChat.service');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetryAndFallback(keys, contents, isVision, preferredModel = 'gemini-1.5-flash') {
  // If it's a vision request, we might still fallback to gemini-1.5-flash as it supports vision well
  const models = [preferredModel, 'gemini-1.5-pro'];
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
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  return process.env.GEMINI_API_KEY;
}

const jwt = require('jsonwebtoken'); // Added for decoding token inside public chat route

exports.analyzeSymptoms = async (req, res) => {
  try {
    const symptoms = req.body.symptoms || req.body.message;
    if (!symptoms) {
      return res.status(400).json({ detail: 'Missing symptoms or message parameter' });
    }

    const apiKey = getGeminiApiKey();
    const fallbackKey = process.env.GEMINI_API_KEY_FALLBACK || 'AIzaSyCAFj8gcyd56LjkUV7qVmuuRmDdgii8eQw';
    const keys = [];
    if (apiKey) keys.push(apiKey);
    if (fallbackKey && fallbackKey !== apiKey) keys.push(fallbackKey);

    if (keys.length === 0) return res.status(500).json({ detail: 'Chưa cấu hình GEMINI_API_KEY' });

    const prompt = `Bạn là trợ lý AI y tế trực tuyến phân loại triệu chứng ban đầu.
      Tôi đang có các triệu chứng sau: "${symptoms}".
      Dựa vào mô tả này, hãy đưa ra:
      1. Chẩn đoán sơ bộ chi tiết dựa vào triệu chứng.
      2. Phân tích nguyên nhân có thể và lời khuyên chăm sóc ban đầu.
      3. Gợi ý tôi nên khám chuyên khoa nào.
      Tuyệt đối KHÔNG ĐƯA RA CÁC ĐỊNH DẠNG ĐƯỢC CHUẨN HOÁ MARKDOWN HAY LIST NHƯ * HAY #. Trả về đúng format text thuần tuý sau:
      Chẩn đoán sơ bộ: ...
      Lời khuyên: ... (Ngắn gọn, súc tích, tối đa 50 từ)
      Chuyên khoa gợi ý: ...`;

    const result = await generateWithRetryAndFallback(keys, prompt, false, process.env.GEMINI_MODEL || 'gemini-1.5-flash');
    const response = await result.response;
    const text = response.text();

    res.json({ result: text });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ detail: 'Có lỗi xảy ra khi gọi AI Gemini: ' + error.message });
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
    const fallbackKey = process.env.GEMINI_API_KEY_FALLBACK || 'AIzaSyCAFj8gcyd56LjkUV7qVmuuRmDdgii8eQw';
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

    const result = await generateWithRetryAndFallback(keys, contents, !!image, process.env.GEMINI_MODEL || 'gemini-1.5-flash');
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
    const diagnoses = await AITuVanPhien.findAll({
      include: [
        { model: NguoiDung, as: 'nguoiDung', attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'Email'] },
        {
          model: require('../models').BacSi,
          as: 'phuTrach',
          include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }]
        }
      ],
      order: [['NgayCapNhat', 'DESC']]
    });

    const result = diagnoses.map(d => ({
      id: d.Id_AITuVanPhien,
      createdAt: d.NgayTao,
      updatedAt: d.NgayCapNhat,
      symptoms: d.TrieuChungTomTat || d.TieuDe || 'Chưa có thông tin',
      diagnosis: d.ChuanDoanSoBo || 'Chưa có chẩn đoán',
      advice: d.LoiKhuyen,
      specialty: d.GoiYChuyenKhoa,
      priority: d.MucDoUuTien,
      status: d.TrangThaiChuyenGiao,
      User: d.nguoiDung ? {
        full_name: `${d.nguoiDung.Ho} ${d.nguoiDung.Ten}`,
        email: d.nguoiDung.Email
      } : null,
      Doctor: d.phuTrach ? {
        id: d.phuTrach.Id_BacSi,
        User: {
          full_name: `${d.phuTrach.NguoiDung.Ho} ${d.phuTrach.NguoiDung.Ten}`
        }
      } : null
    }));
    res.json(result);
  } catch (error) {
    console.error('getDiagnoses error:', error);
    res.status(500).json({ detail: 'Lỗi khi lấy danh sách chẩn đoán' });
  }
};

exports.assignDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id } = req.body;

    const session = await AITuVanPhien.findByPk(id);
    if (!session) return res.status(404).json({ detail: 'Không tìm thấy phiên' });

    session.Id_BacSi_PhuTrach = doctor_id;
    session.TrangThaiChuyenGiao = 'assigned';
    await session.save();

    res.json({ message: 'Đã phân công bác sĩ', session });
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

