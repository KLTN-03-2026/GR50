import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Stethoscope, Video, FileText, TestTube, Brain, Heart,
    Pill, Activity, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const comprehensiveServices = [
    { icon: Stethoscope, name: 'Khám Chuyên khoa', color: 'from-blue-500 to-cyan-500', slug: 'specialist-examination', description: 'Khám và điều trị với các bác sĩ chuyên khoa hàng đầu.' },
    { icon: Video, name: 'Khám từ xa', color: 'from-green-500 to-emerald-500', slug: 'remote-examination', description: 'Tư vấn sức khỏe trực tuyến qua video call.' },
    { icon: FileText, name: 'Khám tổng quát', color: 'from-purple-500 to-pink-500', slug: 'general-examination', description: 'Kiểm tra sức khỏe định kỳ và tầm soát bệnh.' },
    { icon: TestTube, name: 'Xét nghiệm y học', color: 'from-orange-500 to-red-500', slug: 'medical-testing', description: 'Dịch vụ xét nghiệm tại nhà hoặc tại cơ sở y tế.' },
    { icon: Brain, name: 'Sức khỏe tinh thần', color: 'from-indigo-500 to-blue-500', slug: 'mental-health', description: 'Tư vấn và điều trị các vấn đề tâm lý.' },
    { icon: Activity, name: 'Khám nha khoa', color: 'from-teal-500 to-green-500', slug: 'dental', description: 'Chăm sóc sức khỏe răng miệng toàn diện.' },
    { icon: Heart, name: 'Gói Phẫu thuật', color: 'from-red-500 to-pink-500', slug: 'surgery', description: 'Các gói phẫu thuật trọn gói với chi phí hợp lý.' },
    { icon: Pill, name: 'Sống khỏe Tiểu đường', color: 'from-yellow-500 to-orange-500', slug: 'diabetes-care', description: 'Chăm sóc và theo dõi bệnh nhân tiểu đường.' },
];

export default function Services() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dịch vụ toàn diện</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {comprehensiveServices.map((service, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(`/services/${service.slug}`)}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition cursor-pointer group border border-gray-100 dark:border-gray-700"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300 shadow-lg`}>
                                <service.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
