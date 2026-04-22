import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Phone, Clock, Star, User } from 'lucide-react';
import { API } from '@/config';
import axios from 'axios';

export default function FacilityDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const response = await axios.get(`${API}/facilities/${id}`);
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching facility details:', error);
                setLoading(false);
            }
        };
        fetchFacility();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <p>Đang tải thông tin...</p>
                </div>
            </Layout>
        );
    }

    if (!data || !data.facility) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center flex-col">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy cơ sở y tế</h1>
                    <Button onClick={() => navigate('/')}>Về trang chủ</Button>
                </div>
            </Layout>
        );
    }

    const { facility, doctors } = data;
    // Derive specialities from doctors
    const specialties = Array.from(new Set(doctors.map(d => d.specialty_name).filter(Boolean)));

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
                {/* Hero Section */}
                <div className="relative h-[400px] w-full overflow-hidden">
                    <img
                        src={facility.banner_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'}
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
                                    <span>8:00 - 17:00 (Thứ 2 - Thứ 7)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="absolute top-4 left-4 text-white hover:bg-white/20"
                        onClick={() => navigate(-1)}
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
                                    {facility.description || 'Chưa có thông tin giới thiệu.'}
                                </p>
                            </div>

                            {specialties.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chuyên khoa nổi bật</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {specialties.map((spec, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full font-medium text-sm"
                                            >
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Doctors List */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Danh sách bác sĩ ({doctors.length})</h2>
                                <div className="space-y-4">
                                    {doctors.length === 0 ? (
                                        <p className="text-gray-500">Chưa có bác sĩ nào thuộc cơ sở này.</p>
                                    ) : (
                                        doctors.map((doctor) => (
                                            <div key={doctor.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:shadow-md transition bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                                                <div className="h-16 w-16 bg-blue-100 rounded-full flex-shrink-0 overflow-hidden">
                                                    <img src={doctor.avatar} alt={doctor.full_name} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{doctor.full_name}</h3>
                                                    <p className="text-cyan-600 text-sm font-medium">{doctor.specialty_name}</p>
                                                    <p className="text-gray-500 text-sm mt-1">{doctor.experience_years} năm kinh nghiệm</p>
                                                </div>
                                                <Button onClick={() => navigate(`/doctors/${doctor.id}`)} variant="outline">Xem hồ sơ</Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thông tin liên hệ</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Hotline</p>
                                            <p className="font-bold text-gray-900 dark:text-white">1900-1111</p>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
