import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Calendar, User, Download, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import axios from 'axios';
import { API } from '@/config';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Layout from '@/components/Layout';

export default function DoctorMedicalRecords() {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            setFilteredRecords(records.filter(r =>
                r.Patient?.full_name?.toLowerCase().includes(lower) ||
                r.diagnosis?.toLowerCase().includes(lower)
            ));
        } else {
            setFilteredRecords(records);
        }
    }, [searchTerm, records]);

    const fetchRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API}/medical-records/doctor`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecords(response.data);
            setFilteredRecords(response.data);
        } catch (error) {
            console.error('Error fetching medical records:', error);
            toast.error('Không thể tải hồ sơ bệnh án');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (fileUrl) => {
        if (!fileUrl) return;
        // Assuming fileUrl is relative like /uploads/...
        const fullUrl = `${API.replace('/api', '')}${fileUrl}`;
        window.open(fullUrl, '_blank');
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FileText className="w-8 h-8 text-teal-600" />
                            Quản lý hồ sơ bệnh án
                        </h1>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Tìm theo tên bệnh nhân..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Chưa có hồ sơ bệnh án nào.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRecords.map((record) => (
                                <Card key={record.id} className="hover:shadow-lg transition-shadow duration-300 border-t-4 border-t-teal-500">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {record.date ? format(new Date(record.date), 'dd/MM/yyyy') : 'N/A'}
                                                </p>
                                                <CardTitle className="text-lg font-bold text-teal-700 line-clamp-1">
                                                    {record.diagnosis}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div className="bg-white dark:bg-gray-600 p-2 rounded-full shadow-sm">
                                                    <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Bệnh nhân</p>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {record.Patient?.full_name || 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-900"
                                                        onClick={() => setSelectedRecord(record)}
                                                    >
                                                        Xem chi tiết
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-bold text-teal-700 flex items-center gap-2">
                                                            <FileText className="w-6 h-6" />
                                                            Chi tiết hồ sơ bệnh án
                                                        </DialogTitle>
                                                    </DialogHeader>

                                                    <div className="space-y-6 py-4">
                                                        <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                                            <div>
                                                                <p className="text-sm text-gray-500">Bệnh nhân</p>
                                                                <p className="font-semibold text-lg">{record.Patient?.full_name}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Ngày khám</p>
                                                                <p className="font-semibold text-lg">
                                                                    {record.date ? format(new Date(record.date), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
                                                                </p>
                                                            </div>
                                                            {record.Appointment && (
                                                                <div className="col-span-2 border-t pt-2 mt-2">
                                                                    <p className="text-sm text-gray-500">Lịch hẹn liên quan</p>
                                                                    <p className="font-medium">
                                                                        {record.Appointment.appointment_time} - {record.Appointment.appointment_date}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                                <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                                                                Chẩn đoán
                                                            </h3>
                                                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{record.diagnosis}</p>
                                                            </div>
                                                        </div>

                                                        {record.prescription && (
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                                                    Đơn thuốc
                                                                </h3>
                                                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{record.prescription}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {record.notes && (
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                                    <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                                                                    Ghi chú / Lời dặn
                                                                </h3>
                                                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{record.notes}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {record.file_url && (
                                                            <div className="flex justify-end pt-4 border-t">
                                                                <Button
                                                                    onClick={() => handleDownload(record.file_url)}
                                                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                                                >
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Tải xuống hồ sơ đính kèm
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
