const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const { NguoiDung } = require('../models');
const aiChatService = require('../services/aiChat.service');

// Auto-reload .env before call
function getGeminiApiKey() {
  delete require.cache[require.resolve('dotenv')];
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  return process.env.GEMINI_API_KEY;
}

exports.analyzeSymptoms = async (req, res) => {
  try {
    const symptoms = req.body.symptoms || req.body.message;
    if (!symptoms) {
      return res.status(400).json({ detail: 'Missing symptoms or message parameter' });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(500).json({ detail: 'Chưa cấu hình GEMINI_API_KEY trong file .env!' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const prompt = `
      Tôi đang có các triệu chứng sau: "${symptoms}".
      Bạn là một trợ lý y tế ảo. Dựa vào mô tả này, hãy đưa ra:
      1. Chẩn đoán sơ bộ (Ngắn gọn 1-2 câu).
      2. Lời khuyên tư vấn cơ bản (Ví dụ: uống nhiều nước, cần đi khám ngay, v.v.).
      3. Gợi ý tôi nên khám chuyên khoa nào.
      Tuyệt đối KHÔNG ĐƯA RA CÁC ĐỊNH DẠNG ĐƯỢC CHUẨN HOÁ MARKDOWN HAY LIST NHƯ * HAY #. Trả về đúng format text thuần tuý sau:
      Chẩn đoán sơ bộ: ...
      Lời khuyên: ...
      Chuyên khoa gợi ý: ...
    `;

    const result = await model.generateContent(prompt);
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
    const { message, image } = req.body;
    if (!message && !image) return res.status(400).json({ detail: 'Missing message or image' });

    const apiKey = getGeminiApiKey();
    if (!apiKey) return res.status(500).json({ detail: 'Chưa cấu hình GEMINI_API_KEY' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const promptText = `Bạn là trợ lý AI y tế của MediSchedule.
QUY TẮC BẮT BUỘC:
- Trả lời TỐI ĐA 3-4 câu, thẳng vào vấn đề, KHÔNG liệt kê dài dòng.
- Nếu người dùng chào → chào lại ngắn gọn + hỏi triệu chứng.
- Nếu hỏi về triệu chứng → gợi ý chuyên khoa ngay.
- Nếu có ảnh → nhận xét ngắn gọn + khuyên đi khám.
- Luôn kết thúc bằng: "Thông tin chỉ mang tính tham khảo."
Người dùng nói: "${message || 'Tôi gửi một hình ảnh'}".`;

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

    const result = await model.generateContent(contents);
    res.json({ result: result.response.text() });
  } catch (error) {
    console.error('AI Chat Error:', error);
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

exports.getDiagnoses = async (req, res) => { res.json([]); };
exports.assignDoctor = async (req, res) => { res.json({}); };
exports.acceptDiagnosis = async (req, res) => { res.json({}); };
exports.rejectDiagnosis = async (req, res) => { res.json({}); };

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

