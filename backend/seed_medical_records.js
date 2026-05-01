const { DatLich, HoSoBenhAn, BenhNhan, BacSi, NguoiDung, ChuyenKhoa, PhongKham } = require('./models');

async function seedDetailedRecordsForce() {
    try {
        console.log('Fetching all completed appointments...');
        
        const appointments = await DatLich.findAll({
            where: {
                TrangThai: ['DaKham', 'COMPLETED']
            },
            include: [
                { model: BacSi, include: [ChuyenKhoa, NguoiDung] },
                { model: BenhNhan, include: [NguoiDung] },
                { model: PhongKham, as: 'Clinic' }
            ]
        });

        console.log(`Found ${appointments.length} appointments to update/create detailed records.`);

        const medicalData = {
            'Nội tổng quát': [
                {
                    diagnosis: 'Viêm họng cấp tính (J02)',
                    prescription: '1. Amoxicillin 500mg: 2 viên/ngày (sáng 1, chiều 1) sau ăn.\n2. Paracetamol 500mg: 1 viên khi sốt > 38.5 độ.\n3. Alpha-Choay: 4 viên/ngày (ngậm dưới lưỡi).',
                    notes: 'Súc miệng bằng nước muối sinh lý 3-4 lần/ngày. Tránh uống nước đá và thực phẩm cay nóng.'
                },
                {
                    diagnosis: 'Viêm dạ dày cấp do HP (K29.1)',
                    prescription: '1. Esomeprazole 40mg: 1 viên trước ăn sáng 30p.\n2. Amoxicillin 1g + Clarithromycin 500mg: Uống sau ăn.\n3. Phosphalugel: 1 gói khi đau thượng vị.',
                    notes: 'Ăn chín uống sôi. Chia nhỏ bữa ăn. Kiêng rượu bia, thuốc lá, đồ chua cay.'
                },
                {
                    diagnosis: 'Tăng huyết áp vô căn (I10)',
                    prescription: '1. Amlodipine 5mg: 1 viên uống sáng.\n2. Losartan 50mg: 1 viên uống chiều.',
                    notes: 'Ăn nhạt, hạn chế muối. Tập thể dục nhẹ nhàng đều đặn. Theo dõi huyết áp tại nhà hàng ngày.'
                }
            ],
            'Nhi khoa': [
                {
                    diagnosis: 'Sốt siêu vi (B34.9)',
                    prescription: '1. Hapacol 250mg: 1 gói khi sốt > 38.5 độ (cách mỗi 4-6h).\n2. Oresol: Pha đúng tỉ lệ uống thay nước cả ngày.\n3. Vitamin C siro: 5ml/ngày.',
                    notes: 'Cho trẻ mặc quần áo thoáng mát. Theo dõi sát nhiệt độ. Nếu sốt cao co giật cần đưa đi cấp cứu ngay.'
                },
                {
                    diagnosis: 'Viêm phế quản co thắt (J20)',
                    prescription: '1. Ventolin siro: 2.5ml/lần x 3 lần/ngày.\n2. Augmentin 250mg: 1 gói x 2 lần/ngày sau ăn.\n3. Desloratadine siro: 2.5ml tối.',
                    notes: 'Vỗ rung lồng ngực cho trẻ dễ khạc đờm. Giữ ấm cổ và ngực.'
                },
                {
                    diagnosis: 'Rối loạn tiêu hóa (K59)',
                    prescription: '1. Enterogermina: 2 ống/ngày uống.\n2. ZinC: 1 gói/ngày.',
                    notes: 'Cho trẻ ăn cháo loãng, thức ăn dễ tiêu. Tránh sữa tươi khi đang tiêu chảy.'
                }
            ],
            'Da liễu': [
                {
                    diagnosis: 'Viêm da cơ địa (L20)',
                    prescription: '1. Cetirizine 10mg: 1 viên tối.\n2. Kem bôi Clobetasol: Bôi vùng da tổn thương 2 lần/ngày (mỏng).\n3. Sữa tắm chuyên dụng cho da nhạy cảm (Cetaphil/Cerave).',
                    notes: 'Tránh tiếp xúc với hóa chất, xà phòng mạnh. Giữ ẩm da thường xuyên bằng kem dưỡng.'
                },
                {
                    diagnosis: 'Mụn trứng cá mức độ trung bình (L70)',
                    prescription: '1. Doxycycline 100mg: 1 viên sáng sau ăn.\n2. Adapalene gel: Bôi mỏng vùng mụn buổi tối.\n3. Sữa rửa mặt trị mụn.',
                    notes: 'Hạn chế đồ ngọt, dầu mỡ. Không thức khuya. Không tự ý nặn mụn.'
                }
            ],
            'Sản phụ khoa': [
                {
                    diagnosis: 'Khám thai định kỳ 12 tuần',
                    prescription: '1. Elevit: 1 viên/ngày.\n2. Sắt + Acid Folic: 1 viên/ngày.',
                    notes: 'Chế độ ăn giàu dinh dưỡng. Tránh vận động mạnh. Tái khám sau 4 tuần để làm xét nghiệm sàng lọc.'
                }
            ],
            'Tim mạch': [
                {
                    diagnosis: 'Thiếu máu cơ tim (I20)',
                    prescription: '1. Nitroglycerin 2.5mg: 1 viên/ngày.\n2. Aspirin 81mg: 1 viên/ngày sau ăn.',
                    notes: 'Tránh xúc động mạnh, làm việc quá sức. Mang theo thuốc hạ huyết áp dự phòng.'
                }
            ]
        };

        let createdCount = 0;
        let updatedCount = 0;

        for (const apt of appointments) {
            const specialty = apt.BacSi?.ChuyenKhoa?.TenChuyenKhoa || 'Nội tổng quát';
            const dataPool = medicalData[specialty] || medicalData['Nội tổng quát'];
            const randomData = dataPool[Math.floor(Math.random() * dataPool.length)];

            const recordData = {
                Id_DatLich: apt.Id_DatLich,
                Id_BenhNhan: apt.Id_BenhNhan,
                Id_BacSi: apt.Id_BacSi,
                Id_PhongKham: apt.Id_PhongKham,
                ChanDoan: randomData.diagnosis,
                KeHoachDieuTri: randomData.prescription,
                GhiChu: randomData.notes,
                TrieuChungChuQuan: apt.TrieuChungSoBo || 'Mệt mỏi, khó chịu trong người, triệu chứng kéo dài 2-3 ngày.',
                KhamLamSang: 'Huyết áp ổn định (120/80 mmHg), nhịp tim 75 lần/phút. Tim phổi bình thường, bụng mềm, không có dấu hiệu thần kinh khu trú.',
                DanhGia: 'Tình trạng tiến triển ổn định theo phác đồ. Bệnh nhân có đáp ứng tốt với các chỉ định lâm sàng.'
            };

            const [record, created] = await HoSoBenhAn.findOrCreate({
                where: { Id_DatLich: apt.Id_DatLich },
                defaults: recordData
            });

            if (!created) {
                await record.update(recordData);
                updatedCount++;
            } else {
                createdCount++;
            }
        }

        console.log(`Summary: Created ${createdCount}, Updated ${updatedCount} detailed medical records.`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding medical records error:', error);
        process.exit(1);
    }
}

seedDetailedRecordsForce();
