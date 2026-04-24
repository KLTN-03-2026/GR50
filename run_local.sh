#!/bin/bash

# Script chạy MediSchedule local - macOS/Linux
# Chạy bằng: bash run_local.sh

echo "🏥 =================================="
echo "🏥  MEDISCHEDULE - CHẠY LOCAL"
echo "🏥 =================================="
echo ""

# Configuration
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_PORT=8001
FRONTEND_PORT=3050

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js không được tìm thấy! Vui lòng cài đặt từ https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js: $(node -v)"

# Kiểm tra MySQL
echo "🔍 Kiểm tra MySQL..."
if ! mysqladmin -u root ping &> /dev/null; then
    echo "❌ MySQL không chạy!"
    echo "Vui lòng khởi động MySQL (XAMPP/MariaDB/Brew)."
    exit 1
fi
echo "✅ MySQL đang chạy"

# Kiểm tra Backend dependencies
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "⚠️  Đang cài đặt Backend dependencies..."
    cd $BACKEND_DIR && npm install && cd ..
fi
echo "✅ Backend dependencies OK"

# Kiểm tra Frontend dependencies
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "⚠️  Đang cài đặt Frontend dependencies..."
    cd $FRONTEND_DIR && npm install && cd ..
fi
echo "✅ Frontend dependencies OK"

echo ""
echo "🚀 ĐANG KHỞI ĐỘNG ỨNG DỤNG..."
echo ""

# Chạy backend
cd $BACKEND_DIR
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✅ Backend (Port $BACKEND_PORT) PID: $BACKEND_PID"

# Đợi backend
sleep 3

# Chạy frontend
cd $FRONTEND_DIR
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend (Port $FRONTEND_PORT) PID: $FRONTEND_PID"

echo ""
echo "🎉 ỨNG DỤNG ĐÃ CHẠY!"
echo "📍 Frontend: http://localhost:$FRONTEND_PORT"
echo "📍 Backend:  http://localhost:$BACKEND_PORT"
echo ""
echo "💡 Nhấn Ctrl+C để dừng cả 2 dịch vụ."

# Dọn dẹp khi thoát
trap "kill $BACKEND_PID $FRONTEND_PID; echo '🛑 Đã dừng ứng dụng.'; exit" INT
wait
