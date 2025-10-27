# 🤖 CÀI ĐẶT AI FEATURES (TÙY CHỌN)

## ⚠️ Lưu ý quan trọng

**AI Features là TÙY CHỌN** - Ứng dụng vẫn chạy hoàn toàn bình thường mà không cần AI!

Các tính năng AI bao gồm:
- 🤖 AI Health Chatbot
- 🤖 AI Doctor Recommendation  
- 🤖 Conversation Summarization

Nếu bạn **KHÔNG** cần các tính năng AI, **BỎ QUA** file này!

---

## 📋 Yêu cầu cho AI Features

Để sử dụng AI features, bạn cần:

1. **OpenAI API Key** hoặc **Emergent LLM Key**
2. **emergentintegrations** package (optional)

---

## 🚀 CÁCH 1: Dùng OpenAI API Key trực tiếp (Khuyến nghị)

### Bước 1: Lấy OpenAI API Key

1. Đăng ký tài khoản tại: https://platform.openai.com/
2. Vào: https://platform.openai.com/api-keys
3. Click "Create new secret key"
4. Copy key (bắt đầu bằng `sk-...`)

### Bước 2: Cấu hình

Thêm vào file `backend/.env`:

```env
# OpenAI API Key
EMERGENT_LLM_KEY=sk-your-openai-api-key-here
```

### Bước 3: Cài đặt OpenAI package (đã có trong requirements.txt)

```bash
pip install openai>=1.0.0
```

✅ **XONG!** AI features sẽ hoạt động với OpenAI API.

---

## 🚀 CÁCH 2: Dùng Emergent LLM Key (Universal Key)

### Về Emergent LLM Key:

**Emergent LLM Key** là một universal key có thể dùng với:
- ✅ OpenAI (GPT-4, GPT-4o, etc.)
- ✅ Anthropic (Claude)
- ✅ Google (Gemini)

### Bước 1: Lấy Emergent LLM Key

**Nếu bạn đang dùng Emergent Platform:**
1. Click vào profile icon (góc trên phải)
2. Chọn "Universal Key"
3. Copy key

### Bước 2: Cài đặt emergentintegrations package

⚠️ **Lưu ý:** Package này chỉ có trên Emergent platform hoặc cần URL đặc biệt.

**Trên Emergent Platform:**
```bash
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

**Trên máy local Windows:**
Package này có thể không cài được. Khuyến nghị dùng **CÁCH 1** (OpenAI API Key trực tiếp).

### Bước 3: Cấu hình

Thêm vào file `backend/.env`:

```env
# Emergent LLM Key
EMERGENT_LLM_KEY=your-emergent-llm-key-here
```

---

## ❌ KHÔNG CẦN AI FEATURES?

Nếu bạn không muốn dùng AI features:

### Bước 1: Bỏ qua AI endpoints

Các API endpoint AI vẫn có nhưng sẽ trả về lỗi khi call:
- `/api/ai/chat` - AI Health Chatbot
- `/api/ai/recommend-doctor` - Doctor recommendation
- `/api/ai/summarize-conversation/{id}` - Conversation summary

### Bước 2: Không cần cấu hình gì

File `.env` có thể để:
```env
EMERGENT_LLM_KEY=your-emergent-llm-key-here
```

Hoặc xóa dòng này đi cũng được.

### Bước 3: App vẫn chạy bình thường

✅ **TẤT CẢ TÍNH NĂNG CHÍNH VẪN HOẠT ĐỘNG:**
- ✅ Admin quản lý
- ✅ Department Head
- ✅ Doctor dashboard
- ✅ Patient đặt lịch
- ✅ Chat giữa doctor-patient
- ✅ Payment system
- ✅ Tất cả CRUD operations

**Chỉ 3 API endpoints AI không hoạt động** - không ảnh hưởng gì!

---

## 🧪 TEST AI FEATURES

### Test với Swagger UI

1. Chạy backend: `python server.py`
2. Mở: http://localhost:8001/api/docs
3. Test endpoints:
   - `/api/ai/chat` - POST với message
   - `/api/ai/recommend-doctor` - POST với symptoms
   - `/api/ai/summarize-conversation/{id}` - POST với appointment_id

### Kiểm tra có hoạt động:

**Nếu API Key hợp lệ:**
```json
{
  "message": "AI response here..."
}
```

**Nếu không có API Key hoặc sai:**
```json
{
  "detail": "AI service not configured"
}
```

---

## 📊 TỔNG KẾT

| Scenario | Cần làm gì | AI Features |
|----------|-----------|-------------|
| **Không cần AI** | Không làm gì | ❌ Không hoạt động |
| **Có OpenAI Key** | Thêm key vào .env | ✅ Hoạt động |
| **Có Emergent Key** | Cài emergentintegrations + thêm key | ✅ Hoạt động |

---

## 💡 KHUYẾN NGHỊ

**Cho người dùng thông thường (local development):**
→ **KHÔNG CẦN** cài AI features
→ Ứng dụng chạy hoàn hảo mà không cần AI

**Cho developer muốn test AI:**
→ Dùng **OpenAI API Key** (Cách 1)
→ Đơn giản nhất, không cần emergentintegrations

**Trên Emergent Platform:**
→ Dùng **Emergent LLM Key** (Cách 2)
→ Universal key, dùng được nhiều LLM

---

## 🐛 Troubleshooting

### Lỗi: "emergentintegrations not found"

**Giải pháp:**
- Dùng OpenAI API Key trực tiếp (Cách 1)
- Không cần cài emergentintegrations

### Lỗi: "AI service not configured"

**Giải pháp:**
- Kiểm tra `EMERGENT_LLM_KEY` trong `.env`
- Đảm bảo key hợp lệ
- Restart backend server

### Lỗi: "OpenAI API quota exceeded"

**Giải pháp:**
- Kiểm tra OpenAI account balance
- Upgrade OpenAI plan
- Hoặc tắt AI features

---

## ✅ KẾT LUẬN

**AI Features là OPTIONAL** - Bạn có thể:

✅ Chạy app mà không cần AI (khuyến nghị cho local)
✅ Thêm OpenAI Key nếu muốn test AI
✅ Dùng Emergent Key nếu có (trên platform)

**Ứng dụng chính hoạt động độc lập với AI!**

---

**File:** `AI_FEATURES_OPTIONAL.md`
**Last updated:** January 2025
