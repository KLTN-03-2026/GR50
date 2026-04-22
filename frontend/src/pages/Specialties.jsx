import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/config';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { specialtyImageMap } from '@/utils/specialtyImages';

export default function Specialties() {
    const navigate = useNavigate();
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSpecialties();
    }, []);

    const fetchSpecialties = async () => {
        try {
            const res = await axios.get(`${API}/specialties`);
            setSpecialties(res.data);
        } catch (error) {
            console.error("Failed to fetch specialties", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSpecialties = specialties.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate(-1)}>
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chuyên khoa</h1>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Tìm kiếm chuyên khoa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Đang tải...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredSpecialties.map((specialty) => (
                            <div
                                key={specialty.id}
                                onClick={() => navigate(`/specialty/${specialty.id}`)}
                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer group border border-gray-100 dark:border-gray-700"
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={specialty.image || specialtyImageMap[specialty.name] || 'https://via.placeholder.com/300'}
                                        alt={specialty.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-white font-bold text-lg">{specialty.name}</h3>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                        {specialty.description || 'Chưa có mô tả'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
