import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Search, Star, MapPin } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Doctors() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterDoctors();
    }, [searchQuery, selectedSpecialty, doctors]);

    const fetchData = async () => {
        try {
            const [doctorsRes, specialtiesRes] = await Promise.all([
                axios.get(`${API}/doctors`),
                axios.get(`${API}/specialties`)
            ]);
            setDoctors(doctorsRes.data);
            setFilteredDoctors(doctorsRes.data);
            setSpecialties(specialtiesRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const filterDoctors = () => {
        let filtered = doctors;

        if (selectedSpecialty !== 'all') {
            filtered = filtered.filter(d => d.specialty_id === parseInt(selectedSpecialty));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(d =>
                d.full_name.toLowerCase().includes(query) ||
                (d.specialty_name && d.specialty_name.toLowerCase().includes(query))
            );
        }

        setFilteredDoctors(filtered);
    };

    const handleBook = (doctorId) => {
        if (user) {
            // If logged in, go to patient dashboard or open booking dialog
            // For now, let's navigate to the doctor detail page which has booking
            navigate(`/patient/doctor/${doctorId}`);
        } else {
            toast.info("Vui lòng đăng nhập để đặt lịch khám");
            navigate(`/login?redirect=/doctors/${doctorId}`);
        }
    };

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        if (avatarPath.startsWith('http')) return avatarPath;
        return `${API.replace('/api', '')}${avatarPath}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate(-1)}>
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đội ngũ Bác sĩ</h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Tìm kiếm</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Tìm theo tên bác sĩ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Chuyên khoa</label>
                            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn chuyên khoa" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                                    {specialties.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Đang tải...</div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Không tìm thấy bác sĩ nào phù hợp</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
                            <div
                                key={doctor.id}
                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition border border-gray-100 dark:border-gray-700 flex flex-col"
                            >
                                <div
                                    className="aspect-[4/3] relative overflow-hidden cursor-pointer"
                                    onClick={() => navigate(`/doctors/${doctor.id}`)}
                                >
                                    <img
                                        src={getAvatarUrl(doctor.avatar) || 'https://via.placeholder.com/300'}
                                        alt={doctor.full_name}
                                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{doctor.full_name}</h3>
                                    <p className="text-cyan-600 font-medium mb-3">{doctor.specialty_name || 'Bác sĩ chuyên khoa'}</p>

                                    <div className="space-y-2 mb-4 flex-1">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Star className="w-4 h-4 text-yellow-400 mr-2 fill-yellow-400" />
                                            <span>{doctor.experience_years} năm kinh nghiệm</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor.consultation_fee)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleBook(doctor.id)}
                                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                                    >
                                        Đặt lịch khám
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
