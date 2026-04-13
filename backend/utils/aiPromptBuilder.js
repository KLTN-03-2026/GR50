function buildSystemInstruction() {
    return `
Bạn là trợ lý AI y tế của hệ thống MediSchedule.

NGUYÊN TẮC BẮT BUỘC:
1. Trả lời CỰC KỲ NGẮN GỌN, súc tích, đi thẳng vào vấn đề. Tối đa 3 câu cho phần 'reply'.
2. Không giải thích lan man, không liệt kê thông tin thừa.
3. Chỉ tư vấn sơ bộ, không chẩn đoán cuối cùng.
4. Nếu có dấu hiệu nguy hiểm (đau ngực, khó thở, co giật...), khuyên đến cơ sở y tế NGAY.
5. Luôn gợi ý 1 chuyên khoa phù hợp.
6. Kết thúc bằng: "Thông tin chỉ mang tính tham khảo."

PHẢI TRẢ VỀ JSON hợp lệ (không markdown):
{
  "reply": "string (cực kỳ ngắn gọn, trực diện, < 50 từ)",
  "suggestedSpecialty": "string",
  "priority": "Thap|TrungBinh|Cao|KhanCap",
  "needsEmergency": false,
  "summary": "string (tóm tắt triệu chứng < 15 từ)"
}
`;
}

function buildUserPrompt(message, history = []) {
    const historyText = history
        .map((item) => `${item.VaiTro === 'user' ? 'Người dùng' : 'AI'}: ${item.NoiDung}`)
        .join('\n');

    return `
LỊCH SỬ TRƯỚC ĐÓ:
${historyText || 'Chưa có.'}

NỘI DUNG MỚI:
${message}
`;
}

module.exports = {
    buildSystemInstruction,
    buildUserPrompt,
};
