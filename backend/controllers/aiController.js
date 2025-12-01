const { GoogleGenerativeAI } = require("@google/generative-ai");
const { AIDiagnosis, User, Doctor } = require('../models');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    // Fallback to Mock AI if API key is missing
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found. Using Mock AI for chat.');
      return res.json({ response: getMockChatResponse(message) });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Bạn là một trợ lý y tế ảo hữu ích. Hãy trả lời ngắn gọn, súc tích và tập trung vào vấn đề sức khỏe. Luôn nhắc nhở người dùng đi khám bác sĩ nếu triệu chứng nghiêm trọng." }],
        },
        {
          role: "model",
          parts: [{ text: "Vâng, tôi hiểu. Tôi sẽ đóng vai trò là trợ lý y tế ảo, cung cấp thông tin hữu ích và luôn khuyến cáo người dùng tìm kiếm sự chăm sóc y tế chuyên nghiệp khi cần thiết." }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();
    res.json({ response });

  } catch (error) {
    console.error('AI Chat error:', error);
    // Fallback to mock on error too
    res.json({ response: getMockChatResponse(req.body.message) });
  }
};

exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const userId = req.user.id; // Assumes authMiddleware is used

    // Fallback to Mock AI if API key is missing
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found. Using Mock AI for analysis.');
      const mockResult = getMockAnalysisResponse(symptoms);

      // Save mock result too for testing
      await AIDiagnosis.create({
        user_id: userId,
        symptoms: symptoms,
        diagnosis: "Mock Diagnosis",
        advice: "Mock Advice",
        specialty: "General",
        full_response: mockResult
      });

      return res.json({ result: mockResult });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
      Dựa trên các triệu chứng sau: "${symptoms}", hãy cung cấp:
      1. Chẩn đoán sơ bộ (có thể là gì).
      2. Lời khuyên (nên làm gì, kiêng gì).
      3. Chuyên khoa y tế phù hợp để đi khám.
      
      Hãy định dạng câu trả lời rõ ràng, ngắn gọn.
      Bắt đầu bằng "**Chẩn đoán sơ bộ (AI):**", tiếp theo là "**Lời khuyên:**" và "**Chuyên khoa gợi ý:**".
      Kết thúc bằng câu cảnh báo: "*Lưu ý: Đây chỉ là tham khảo từ AI, không thay thế chẩn đoán của bác sĩ.*"
    `;

    const result = await model.generateContent(prompt);
    const aiResult = result.response.text();

    // Attempt to parse the AI result to extract fields (simple regex or split)
    let diagnosis = "AI Diagnosis";
    let advice = "AI Advice";
    let specialty = "General";

    try {
      const diagMatch = aiResult.match(/\*\*Chẩn đoán sơ bộ \(AI\):\*\*(.*?)(?=\*\*Lời khuyên:\*\*)/s);
      const adviceMatch = aiResult.match(/\*\*Lời khuyên:\*\*(.*?)(?=\*\*Chuyên khoa gợi ý:\*\*)/s);
      const specMatch = aiResult.match(/\*\*Chuyên khoa gợi ý:\*\*(.*?)(?=\*Lưu ý:)/s);

      if (diagMatch) diagnosis = diagMatch[1].trim();
      if (adviceMatch) advice = adviceMatch[1].trim();
      if (specMatch) specialty = specMatch[1].trim();
    } catch (e) {
      console.error("Error parsing AI response", e);
    }

    // Save to Database
    await AIDiagnosis.create({
      user_id: userId,
      symptoms: symptoms,
      diagnosis: diagnosis,
      advice: advice,
      specialty: specialty,
      full_response: aiResult
    });

    res.json({ result: aiResult });

  } catch (error) {
    console.error('AI Analysis error:', error);
    // Fallback to mock on error too
    res.json({ result: getMockAnalysisResponse(req.body.symptoms) });
  }
};

exports.getDiagnoses = async (req, res) => {
  try {
    const { role, id } = req.user;
    let whereClause = {};

    if (role === 'patient') {
      whereClause.user_id = id;
    } else if (role === 'doctor') {
      // Doctors see diagnoses assigned to them OR all (depending on requirement). 
      // Let's show assigned ones + unassigned ones that match their specialty? 
      // For now, let's show all for simplicity, or filtered by doctor_id if assigned.
      // User asked to "send to doctor", so doctor should see what's assigned.
      // But maybe they want to see pool of patients?
      // Let's allow passing a query param ?type=assigned
      if (req.query.type === 'assigned') {
        whereClause.doctor_id = (await Doctor.findOne({ where: { user_id: id } })).id;
      }

      if (req.query.status) {
        whereClause.status = req.query.status;
      }
    }

    const diagnoses = await AIDiagnosis.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['full_name', 'email']
        },
        {
          model: Doctor,
          include: [{ model: User, attributes: ['full_name'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(diagnoses);
  } catch (error) {
    console.error('Get diagnoses error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.assignDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id } = req.body;

    const diagnosis = await AIDiagnosis.findByPk(id);
    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    diagnosis.doctor_id = doctor_id;
    diagnosis.status = 'assigned';
    await diagnosis.save();

    res.json({ message: 'Doctor assigned successfully', diagnosis });
  } catch (error) {
    console.error('Assign doctor error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.acceptDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the doctor profile associated with this user
    const doctor = await Doctor.findOne({ where: { user_id: userId } });
    if (!doctor) {
      return res.status(403).json({ message: 'Only doctors can accept diagnoses' });
    }

    const diagnosis = await AIDiagnosis.findByPk(id);
    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    // Check if already assigned
    if (diagnosis.status !== 'pending' && diagnosis.doctor_id !== doctor.id) {
      return res.status(400).json({ message: 'Diagnosis already assigned to another doctor' });
    }

    diagnosis.doctor_id = doctor.id;
    diagnosis.status = 'assigned';
    await diagnosis.save();

    res.json({ message: 'Diagnosis accepted successfully', diagnosis });
  } catch (error) {
    console.error('Accept diagnosis error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.rejectDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ where: { user_id: userId } });
    if (!doctor) {
      return res.status(403).json({ message: 'Only doctors can reject diagnoses' });
    }

    const diagnosis = await AIDiagnosis.findByPk(id);
    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    // Can only reject if it's assigned to this doctor
    if (diagnosis.doctor_id !== doctor.id) {
      return res.status(403).json({ message: 'Cannot reject diagnosis assigned to another doctor' });
    }

    // Reset to pending and clear doctor_id
    diagnosis.doctor_id = null;
    diagnosis.status = 'pending';
    await diagnosis.save();

    res.json({ message: 'Diagnosis rejected successfully', diagnosis });
  } catch (error) {
    console.error('Reject diagnosis error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

// --- Mock Helper Functions ---
function getMockChatResponse(message) {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('đau đầu') || lowerMsg.includes('nhức đầu')) {
    return "Đau đầu có thể do nhiều nguyên nhân như căng thẳng, thiếu ngủ, hoặc mất nước. Bạn nên nghỉ ngơi, uống đủ nước. Nếu đau kéo dài, hãy đặt lịch khám với bác sĩ Nội thần kinh.";
  } else if (lowerMsg.includes('sốt')) {
    return "Nếu bạn bị sốt, hãy theo dõi nhiệt độ thường xuyên. Uống nhiều nước và nghỉ ngơi. Nếu sốt cao trên 39 độ hoặc kéo dài quá 3 ngày, hãy đi khám ngay.";
  } else if (lowerMsg.includes('đau bụng')) {
    return "Đau bụng có vị trí cụ thể không? Nếu đau dữ dội hoặc kèm nôn mửa, hãy đến cơ sở y tế gần nhất. Với đau nhẹ, hãy thử ăn nhẹ và tránh đồ cay nóng.";
  } else if (lowerMsg.includes('mệt') || lowerMsg.includes('mệt mỏi')) {
    return "Mệt mỏi có thể là dấu hiệu của việc làm việc quá sức hoặc thiếu chất. Hãy đảm bảo bạn ngủ đủ 7-8 tiếng mỗi ngày và ăn uống đầy đủ dinh dưỡng.";
  } else if (lowerMsg.includes('xin chào') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
    return "Xin chào! Tôi có thể giúp gì cho sức khỏe của bạn hôm nay?";
  } else if (lowerMsg.includes('cảm ơn')) {
    return "Không có chi! Chúc bạn luôn khỏe mạnh.";
  }
  return "Tôi là trợ lý ảo y tế. Bạn có thể hỏi tôi về các triệu chứng thông thường, lịch khám, hoặc thông tin bác sĩ.";
}

function getMockAnalysisResponse(symptoms) {
  let diagnosis = "Không xác định";
  let advice = "Vui lòng đến cơ sở y tế để kiểm tra.";
  let specialty = "Đa khoa";

  const lowerSym = symptoms.toLowerCase();

  if (lowerSym.includes('đau đầu') || lowerSym.includes('chóng mặt')) {
    diagnosis = "Có thể là đau nửa đầu hoặc căng thẳng thần kinh.";
    advice = "Nghỉ ngơi nơi yên tĩnh, tránh ánh sáng mạnh. Theo dõi huyết áp.";
    specialty = "Thần kinh";
  } else if (lowerSym.includes('sốt') || lowerSym.includes('ho') || lowerSym.includes('đau họng')) {
    diagnosis = "Nghi ngờ nhiễm trùng đường hô hấp trên.";
    advice = "Uống nhiều nước, giữ ấm, súc miệng nước muối.";
    specialty = "Tai Mũi Họng";
  } else if (lowerSym.includes('đau bụng') || lowerSym.includes('buồn nôn')) {
    diagnosis = "Rối loạn tiêu hóa hoặc viêm dạ dày.";
    advice = "Ăn thức ăn nhẹ, tránh đồ dầu mỡ, cay nóng.";
    specialty = "Tiêu hóa";
  } else if (lowerSym.includes('đau ngực') || lowerSym.includes('khó thở')) {
    diagnosis = "Cảnh báo: Có thể liên quan đến tim mạch hoặc hô hấp.";
    advice = "Cần đi khám ngay lập tức. Tránh vận động mạnh.";
    specialty = "Tim mạch";
  } else if (lowerSym.includes('đau lưng') || lowerSym.includes('đau khớp')) {
    diagnosis = "Có thể là thoái hóa cột sống hoặc viêm khớp.";
    advice = "Tránh mang vác nặng, tập các bài tập nhẹ nhàng.";
    specialty = "Cơ Xương Khớp";
  }

  return `
    **Chẩn đoán sơ bộ (AI):** ${diagnosis}
    **Lời khuyên:** ${advice}
    **Chuyên khoa gợi ý:** ${specialty}
    
    *Lưu ý: Đây chỉ là tham khảo từ AI (Chế độ Mock), không thay thế chẩn đoán của bác sĩ.*
  `;
}
