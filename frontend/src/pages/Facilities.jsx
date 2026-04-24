import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { API } from '@/config';
import axios from 'axios';

export default function Facilities() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const response = await axios.get(`${API}/facilities`);
                setFacilities(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching facilities:', error);
                setLoading(false);
            }
        };
        fetchFacilities();
    }, []);

    const filteredFacilities = facilities.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.address && f.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate(-1)}>
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cơ sở y tế</h1>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Tìm kiếm cơ sở y tế..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Đang tải danh sách cơ sở y tế...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredFacilities.map((facility) => (
                            <div
                                key={facility.id}
                                onClick={() => navigate(`/facility/${facility.id}`)}
                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer group border border-gray-100 dark:border-gray-700 flex flex-col"
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={facility.logo_url || facility.banner_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'}
                                        alt={facility.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{facility.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-3">
                                        <MapPin className="w-4 h-4" />
                                        {facility.address}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {facility.description}
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
