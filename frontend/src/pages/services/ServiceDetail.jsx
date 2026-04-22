import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Calendar, Phone, Shield } from 'lucide-react';

const servicesData = {
    'specialist-examination': {
        title: 'Khám Chuyên khoa',
        description: 'Dịch vụ khám chuyên khoa với đội ngũ bác sĩ hàng đầu, trang thiết bị hiện đại.',
        features: [
            'Đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm',
            'Trang thiết bị chẩn đoán hiện đại',
            'Quy trình khám nhanh chóng, chuyên nghiệp',
            'Tư vấn điều trị phác đồ chuẩn y khoa'
        ],
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000',
        details: 'Chúng tôi cung cấp dịch vụ khám cho nhiều chuyên khoa khác nhau như: Tim mạch, Thần kinh, Cơ xương khớp, Tiêu hóa, v.v. Bệnh nhân sẽ được thăm khám kỹ lưỡng và tư vấn phương pháp điều trị phù hợp nhất.'
    },
    'remote-examination': {
        title: 'Khám từ xa',
        description: 'Kết nối với bác sĩ mọi lúc mọi nơi qua video call.',
        features: [
            'Tiết kiệm thời gian di chuyển',
            'Tư vấn trực tuyến qua Video Call',
            'Nhận đơn thuốc điện tử',
            'Theo dõi sức khỏe tại nhà'
        ],
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000',
        details: 'Dịch vụ khám từ xa (Telemedicine) giúp bệnh nhân dễ dàng tiếp cận với dịch vụ y tế chất lượng cao mà không cần đến bệnh viện. Phù hợp cho các bệnh lý mãn tính, tái khám hoặc tư vấn sức khỏe ban đầu.'
    },
    'general-examination': {
        title: 'Khám tổng quát',
        description: 'Đánh giá tình trạng sức khỏe toàn diện, phát hiện sớm các nguy cơ.',
        features: [
            'Gói khám đa dạng, phù hợp nhiều đối tượng',
            'Xét nghiệm máu, nước tiểu, chẩn đoán hình ảnh',
            'Tầm soát ung thư và các bệnh lý tiềm ẩn',
            'Bác sĩ tư vấn chi tiết kết quả'
        ],
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1000',
        details: 'Khám sức khỏe tổng quát định kỳ là cách tốt nhất để bảo vệ sức khỏe của bạn. Chúng tôi cung cấp các gói khám từ cơ bản đến nâng cao, giúp phát hiện sớm các bất thường và có biện pháp can thiệp kịp thời.'
    },
    'medical-testing': {
        title: 'Xét nghiệm y học',
        description: 'Dịch vụ xét nghiệm chính xác, nhanh chóng với hệ thống máy móc tự động.',
        features: [
            'Hệ thống xét nghiệm tự động hoàn toàn',
            'Kết quả chính xác, độ tin cậy cao',
            'Trả kết quả nhanh chóng (online/tại chỗ)',
            'Lấy mẫu tại nhà (theo yêu cầu)'
        ],
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1000',
        details: 'Trung tâm xét nghiệm đạt chuẩn quốc tế, thực hiện đầy đủ các loại xét nghiệm huyết học, sinh hóa, miễn dịch, vi sinh... hỗ trợ đắc lực cho công tác chẩn đoán và điều trị.'
    },
    'mental-health': {
        title: 'Sức khỏe tinh thần',
        description: 'Chăm sóc sức khỏe tâm lý với các chuyên gia tâm lý, bác sĩ tâm thần.',
        features: [
            'Tư vấn tâm lý chuyên sâu',
            'Điều trị rối loạn lo âu, trầm cảm, stress',
            'Liệu pháp tâm lý cá nhân và nhóm',
            'Bảo mật thông tin tuyệt đối'
        ],
        image: 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000',
        details: 'Sức khỏe tinh thần cũng quan trọng như sức khỏe thể chất. Chúng tôi lắng nghe, thấu hiểu và đồng hành cùng bạn vượt qua những khó khăn về tâm lý để tìm lại sự cân bằng trong cuộc sống.'
    },
    'dental': {
        title: 'Khám nha khoa',
        description: 'Chăm sóc răng miệng toàn diện: nha khoa tổng quát, thẩm mỹ và phục hình.',
        features: [
            'Trang thiết bị nha khoa hiện đại',
            'Vô trùng tuyệt đối',
            'Nha khoa thẩm mỹ (niềng răng, bọc sứ)',
            'Điều trị bệnh lý răng miệng không đau'
        ],
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1000',
        details: 'Nụ cười tự tin bắt đầu từ hàm răng khỏe mạnh. Dịch vụ nha khoa của chúng tôi bao gồm cạo vôi răng, trám răng, nhổ răng, tẩy trắng răng, phục hình răng sứ và cấy ghép Implant.'
    },
    'surgery': {
        title: 'Gói Phẫu thuật',
        description: 'Các gói phẫu thuật trọn gói, an toàn, chi phí hợp lý.',
        features: [
            'Phòng mổ vô khuẩn một chiều',
            'Đội ngũ phẫu thuật viên tay nghề cao',
            'Chăm sóc hậu phẫu chu đáo',
            'Chi phí minh bạch, trọn gói'
        ],
        image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000',
        details: 'Chúng tôi cung cấp các gói phẫu thuật cho nhiều chuyên khoa: ngoại tổng quát, chấn thương chỉnh hình, sản phụ khoa, tai mũi họng... với quy trình an toàn và hồi phục nhanh.'
    },
    'diabetes-care': {
        title: 'Sống khỏe Tiểu đường',
        description: 'Chương trình quản lý và chăm sóc toàn diện cho người bệnh tiểu đường.',
        features: [
            'Theo dõi đường huyết liên tục',
            'Tư vấn dinh dưỡng chuyên biệt',
            'Hướng dẫn tập luyện phù hợp',
            'Phòng ngừa biến chứng tiểu đường'
        ],
        image: 'https://images.unsplash.com/photo-1576091160550-21878bf01847?auto=format&fit=crop&q=80&w=1000',
        details: 'Tiểu đường là bệnh mãn tính cần quản lý suốt đời. Chương trình "Sống khỏe Tiểu đường" giúp người bệnh kiểm soát tốt đường huyết, thay đổi lối sống tích cực và tận hưởng cuộc sống khỏe mạnh.'
    }
};

export default function ServiceDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const service = servicesData[slug];

    if (!service) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Dịch vụ không tồn tại</h1>
                        <Button onClick={() => navigate('/')}>Về trang chủ</Button>
                    </div>
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
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
                            <p className="text-xl max-w-2xl mx-auto">{service.description}</p>
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

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                    Chi tiết dịch vụ
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                    {service.details}
                                </p>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Tại sao chọn chúng tôi?
                                </h3>
                                <ul className="space-y-4">
                                    {service.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-8 h-fit">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Đăng ký tư vấn
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Hotline tư vấn</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">1900-1234</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Đặt lịch khám</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">24/7</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Cam kết</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">Bảo mật & Uy tín</p>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-6 text-lg"
                                        onClick={() => navigate('/doctors')}
                                    >
                                        Đặt lịch ngay
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
