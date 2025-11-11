#!/bin/bash

# Script chạy MediSchedule local - macOS/Linux
# Chạy bằng: bash run_local.sh

echo "🏥 =================================="
echo "🏥  MEDISCHEDULE - CHẠY LOCAL"
echo "🏥 =================================="
echo ""

# Kiểm tra MySQL
echo "🔍 Kiểm tra MySQL..."
if ! mysql -u root -p190705 -e "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ MySQL không chạy hoặc password sai!"
    echo "Vui lòng:"
    echo "  1. Khởi động MySQL: brew services start mysql (macOS) hoặc sudo systemctl start mysql (Linux)"
    echo "  2. Đặt password root: 190705"
    exit 1
fi
echo "✅ MySQL đang chạy"

# Kiểm tra database
echo ""
echo "🔍 Kiểm tra database medischedule..."
if ! mysql -u root -p190705 -e "USE medischedule;" > /dev/null 2>&1; then
    echo "⚠️  Database chưa tồn tại, đang tạo..."
    mysql -u root -p190705 -e "CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    cd backend
    python create_tables.py
    python create_admin_mysql.py
    python create_sample_data_mysql.py
    cd ..
    echo "✅ Database đã được tạo và có dữ liệu mẫu"
else
    echo "✅ Database đã tồn tại"
fi

# Kiểm tra Python dependencies
echo ""
echo "🔍 Kiểm tra Python dependencies..."
if ! pip show fastapi > /dev/null 2>&1; then
    echo "⚠️  Đang cài đặt Python packages..."
    cd backend
    pip install -r requirements.txt
    cd ..
fi
echo "✅ Python dependencies OK"

# Kiểm tra Node dependencies
echo ""
echo "🔍 Kiểm tra Node dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Đang cài đặt Node packages..."
    cd frontend
    yarn install
    cd ..
fi
echo "✅ Node dependencies OK"

echo ""
echo "🚀 =================================="
echo "🚀  ĐANG KHỞI ĐỘNG ỨNG DỤNG..."
echo "🚀 =================================="
echo ""

# Tạo file log
mkdir -p logs

# Chạy backend
echo "🐍 Khởi động Backend (port 8001)..."
cd backend
python server.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✅ Backend PID: $BACKEND_PID"

# Đợi backend khởi động
sleep 3

# Kiểm tra backend
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ Backend đã sẵn sàng: http://localhost:8001"
else
    echo "❌ Backend không khởi động được! Xem log: tail -f logs/backend.log"
    exit 1
fi

# Chạy frontend
echo ""
echo "⚛️  Khởi động Frontend (port 3000)..."
cd frontend
yarn start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend PID: $FRONTEND_PID"

echo ""
echo "🎉 =================================="
echo "🎉  ỨNG DỤNG ĐÃ CHẠY THÀNH CÔNG!"
echo "🎉 =================================="
echo ""
echo "📍 Frontend:  http://localhost:3000"
echo "📍 Backend:   http://localhost:8001"
echo "📍 API Docs:  http://localhost:8001/docs"
echo ""
echo "👥 TÀI KHOẢN TEST:"
echo "   Admin:    admin@medischedule.com / 12345678"
echo "   Doctor:   doctor1@test.com / 12345678"
echo "   Patient:  patient1@test.com / 12345678"
echo ""
echo "📝 Xem log:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 Dừng ứng dụng:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Hoặc tạo file stop.sh:"
echo "   echo 'kill $BACKEND_PID $FRONTEND_PID' > stop.sh"
echo ""

# Lưu PIDs để dễ dừng
echo "#!/bin/bash" > stop.sh
echo "echo 'Đang dừng ứng dụng...'" >> stop.sh
echo "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" >> stop.sh
echo "echo 'Đã dừng!'" >> stop.sh
chmod +x stop.sh

echo "💡 Chạy './stop.sh' để dừng ứng dụng"
echo ""

# Đợi cho đến khi user nhấn Ctrl+C
trap "echo ''; echo '🛑 Đang dừng...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Đã dừng!'; exit 0" INT
echo "⏳ Ứng dụng đang chạy... (Nhấn Ctrl+C để dừng)"
wait
