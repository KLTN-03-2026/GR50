import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Phone, Clock, Star } from 'lucide-react';

// Mock data for facilities (matching LandingPage.js)
const facilitiesData = {
    1: {
        id: 1,
        name: 'Bệnh viện Đa khoa Quốc tế',
        image: 'https://images.unsplash.com/photo-1533042789716-e9a9c97cf4ee',
        address: 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
        phone: '1900-1111',
        hours: '7:00 - 17:00 (Thứ 2 - Thứ 7)',
        description: 'Bệnh viện Đa khoa Quốc tế là một trong những cơ sở y tế hàng đầu tại Việt Nam, cung cấp dịch vụ khám chữa bệnh chất lượng cao với đội ngũ bác sĩ giỏi và trang thiết bị hiện đại.',
        specialties: ['Tim mạch', 'Thần kinh', 'Cơ xương khớp', 'Nhi khoa', 'Sản phụ khoa']
    },
    2: {
        id: 2,
        name: 'Phòng khám Đa khoa Gia đình',
        image: 'https://images.unsplash.com/photo-1597807037496-c56a1d8bc29a',
        address: 'Số 10, Nguyễn Văn Linh, Quận 7, TP.HCM',
        phone: '1900-2222',
        hours: '8:00 - 20:00 (Cả tuần)',
        description: 'Phòng khám Đa khoa Gia đình mang đến dịch vụ chăm sóc sức khỏe toàn diện cho mọi thành viên trong gia đình bạn. Không gian thân thiện, dịch vụ chuyên nghiệp.',
        specialties: ['Nhi khoa', 'Tai Mũi Họng', 'Da liễu', 'Nội tổng quát']
    },
    3: {
        id: 3,
        name: 'Trung tâm Y tế chuyên sâu',
        image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc',
        address: 'Số 5, Lê Duẩn, Đống Đa, Hà Nội',
        phone: '1900-3333',
        hours: '7:30 - 16:30 (Thứ 2 - Thứ 6)',
        description: 'Trung tâm Y tế chuyên sâu tập trung vào chẩn đoán và điều trị các bệnh lý phức tạp. Chúng tôi hợp tác với các chuyên gia đầu ngành để mang lại hiệu quả điều trị tốt nhất.',
        specialties: ['Ung bướu', 'Tiêu hóa', 'Hô hấp', 'Nội tiết']
    }
};

export default function FacilityDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const facility = facilitiesData[id];

    if (!facility) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center flex-col">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy cơ sở y tế</h1>
                    <Button onClick={() => navigate('/')}>Về trang chủ</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
                {/* Hero Section */}
                <div className="relative h-[400px] w-full overflow-hidden">
                    <img
                        src={facility.image}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pb-12 px-4 sm:px-8">
                        <div className="max-w-7xl mx-auto w-full">
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{facility.name}</h1>
                            <div className="flex flex-col md:flex-row gap-4 text-white/90">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    <span>{facility.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>{facility.hours}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="absolute top-4 left-4 text-white hover:bg-white/20"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" /> Quay lại
                    </Button>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="md:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Giới thiệu</h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {facility.description}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chuyên khoa</h2>
                                <div className="flex flex-wrap gap-2">
                                    {facility.specialties.map((spec, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full font-medium text-sm"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thông tin liên hệ</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Hotline</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{facility.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Địa chỉ</p>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{facility.address}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                    Đặt lịch khám
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
