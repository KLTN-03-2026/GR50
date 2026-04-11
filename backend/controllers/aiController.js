const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const { NguoiDung, NoiDungChoDuyet } = require('../models');

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // Save to NoiDungChoDuyet for admin history
    await NoiDungChoDuyet.create({
      CauHoiNguoiDung: symptoms,
      PhanHoiAI: text,
      TuKhoaPhatHien: '',
      TrangThai: 'ChoDuyet'
    });

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const promptText = `Bạn là trợ lý ảo y tế của BookingCare. 
Người dùng nói: "${message || 'Tôi gửi một hình ảnh'}".
Trách nhiệm của bạn: phân tích ngắn gọn, thân thiện và hữu ích. ${image ? 'Người dùng có đính kèm hình ảnh (da liễu, x-quang, chẩn đoán, v.v.), hãy quan sát hình ảnh và đưa ra nhận định y khoa cơ bản đồng thời luôn khuyên họ đi khám bác sĩ.' : 'Đặc biệt nếu họ chào, hãy chào lại và hỏi họ cần hỗ trợ y tế gì.'}`;

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
    // Return pending items from NoiDungChoDuyet mapped as history
    const history = await NoiDungChoDuyet.findAll();
    res.json(history.map(h => ({
      id: h.Id_NoiDungChoDuyet,
      symptoms: h.CauHoiNguoiDung,
      diagnosis: h.PhanHoiAI,
      advice: 'Đang chờ bác sĩ duyệt'
    })));
  } catch (err) {
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getDiagnoses = async (req, res) => { res.json([]); };
exports.assignDoctor = async (req, res) => { res.json({}); };
exports.acceptDiagnosis = async (req, res) => { res.json({}); };
exports.rejectDiagnosis = async (req, res) => { res.json({}); };
