exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Simple keyword-based response system (Mock AI)
    let response = "Tôi là trợ lý ảo y tế. Bạn có thể hỏi tôi về các triệu chứng thông thường, lịch khám, hoặc thông tin bác sĩ.";
    
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('đau đầu') || lowerMsg.includes('nhức đầu')) {
      response = "Đau đầu có thể do nhiều nguyên nhân như căng thẳng, thiếu ngủ, hoặc mất nước. Bạn nên nghỉ ngơi, uống đủ nước. Nếu đau kéo dài, hãy đặt lịch khám với bác sĩ Nội thần kinh.";
    } else if (lowerMsg.includes('sốt')) {
      response = "Nếu bạn bị sốt, hãy theo dõi nhiệt độ thường xuyên. Uống nhiều nước và nghỉ ngơi. Nếu sốt cao trên 39 độ hoặc kéo dài quá 3 ngày, hãy đi khám ngay.";
    } else if (lowerMsg.includes('đau bụng')) {
      response = "Đau bụng có vị trí cụ thể không? Nếu đau dữ dội hoặc kèm nôn mửa, hãy đến cơ sở y tế gần nhất. Với đau nhẹ, hãy thử ăn nhẹ và tránh đồ cay nóng.";
    } else if (lowerMsg.includes('mệt') || lowerMsg.includes('mệt mỏi')) {
      response = "Mệt mỏi có thể là dấu hiệu của việc làm việc quá sức hoặc thiếu chất. Hãy đảm bảo bạn ngủ đủ 7-8 tiếng mỗi ngày và ăn uống đầy đủ dinh dưỡng.";
    } else if (lowerMsg.includes('xin chào') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
      response = "Xin chào! Tôi có thể giúp gì cho sức khỏe của bạn hôm nay?";
    } else if (lowerMsg.includes('cảm ơn')) {
      response = "Không có chi! Chúc bạn luôn khỏe mạnh.";
    }

    // Simulate network delay for realism
    setTimeout(() => {
      res.json({ response });
    }, 1000);

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
