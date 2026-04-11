const { GoogleGenerativeAI } = require("@google/generative-ai");

// Thay YOUR_API_KEY bằng API key bạn vừa copy
const genAI = new GoogleGenerativeAI("AIzaSyDSpCTItZ5Aylr3DEzVNTp3qp1NT31Quhg");

async function testAPI() {
    try {
        // Chọn model gemini-1.5-flash (phiên bản nhanh, nhẹ và phổ biến nhất hiện nay)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Xin chào, bạn có nhận được tin nhắn này không? Hãy trả lời ngắn gọn trong 1 câu nhé.";

        console.log("⏳ Đang gửi yêu cầu đến Gemini...");

        // Gửi yêu cầu
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("\n===============================");
        console.log("🎉 KẾT QUẢ TỪ GEMINI:");
        console.log(text);
        console.log("===============================\n");

    } catch (error) {
        console.error("\n❌ CÓ LỖI XẢY RA (Bạn hãy kiểm tra lại API Key xem copy đúng chưa nhé):");
        console.error(error.message);
    }
}

// Chạy hàm test
testAPI();
