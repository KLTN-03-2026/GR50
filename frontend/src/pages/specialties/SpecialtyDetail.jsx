import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/config';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, MapPin } from 'lucide-react';

export default function SpecialtyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [specialty, setSpecialty] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch specialty details
            // Note: If backend doesn't support getById yet, we might need to filter from getAll or add endpoint
            // Assuming we added endpoint or will add it. For now let's try to fetch list and find.
            // Actually, let's assume we added the endpoint /specialties/:id in backend.
            const specialtyRes = await axios.get(`${API}/specialties/${id}`);
            setSpecialty(specialtyRes.data);

            // Fetch doctors for this specialty
            const doctorsRes = await axios.get(`${API}/doctors?specialty_id=${id}`);
            setDoctors(doctorsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <p>Đang tải...</p>
                </div>
            </Layout>
        );
    }

    if (!specialty) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center flex-col">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy chuyên khoa</h1>
                    <Button onClick={() => navigate('/')}>Về trang chủ</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20 mb-4 pl-0"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft className="w-6 h-6 mr-2" /> Quay lại
                        </Button>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{specialty.name}</h1>
                        <p className="text-lg opacity-90 max-w-2xl">{specialty.description}</p>
                    </div>
                </div>

                {/* Doctors List */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-h-[400px]">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Danh sách bác sĩ {specialty.name}
                        </h2>

                        {doctors.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">Chưa có bác sĩ nào thuộc chuyên khoa này.</p>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {doctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className="border rounded-xl p-4 hover:shadow-md transition bg-white dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                                {doctor.avatar ? (
                                                    <img src={doctor.avatar} alt={doctor.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-cyan-100 text-cyan-600 font-bold text-xl">
                                                        {doctor.full_name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                                    {doctor.full_name}
                                                </h3>
                                                <p className="text-sm text-cyan-600 mb-2">{specialty.name}</p>

                                                {doctor.experience_years > 0 && (
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                                        <span>{doctor.experience_years} năm kinh nghiệm</span>
                                                    </div>
                                                )}

                                                <div className="mt-4">
                                                    <Button
                                                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                                                        onClick={() => navigate(`/doctors/${doctor.user_id}`)}
                                                    >
                                                        Đặt lịch khám
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
