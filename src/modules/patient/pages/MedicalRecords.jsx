import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Calendar, User, Stethoscope, Pill, Download } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Layout from '@/components/Layout';

export default function MedicalRecords() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API}/medical-records/patient`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching medical records:', error);
            toast.error('Không thể tải hồ sơ bệnh án');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Layout><div className="p-8 text-center">Đang tải...</div></Layout>;
    }

    return (
        <Layout>
            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Hồ sơ bệnh án điện tử
                </h1>

                {records.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Bạn chưa có hồ sơ bệnh án nào.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {records.map((record) => (
                            <Card key={record.id} className="hover:shadow-lg transition cursor-pointer" onClick={() => setSelectedRecord(record)}>
                                <CardHeader className="bg-blue-50 dark:bg-gray-800 border-b">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(record.date), 'dd/MM/yyyy', { locale: vi })}
                                            </p>
                                            <CardTitle className="text-lg mt-2 text-blue-700">
                                                {record.diagnosis}
                                            </CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">BS. {record.Doctor?.full_name}</span>
                                    </div>
                                    {record.notes && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {record.notes}
                                        </p>
                                    )}
                                    <Button className="w-full mt-2" variant="outline">
                                        Xem chi tiết
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-blue-700 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Chi tiết hồ sơ bệnh án
                            </DialogTitle>
                        </DialogHeader>

                        {selectedRecord && (
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày khám</p>
                                        <p className="font-medium">{format(new Date(selectedRecord.date), 'dd/MM/yyyy', { locale: vi })}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Bác sĩ</p>
                                        <p className="font-medium">{selectedRecord.Doctor?.full_name}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold flex items-center gap-2 text-gray-700">
                                        <Stethoscope className="w-4 h-4" />
                                        Chẩn đoán
                                    </h3>
                                    <div className="p-3 bg-blue-50 rounded-md text-blue-900">
                                        {selectedRecord.diagnosis}
                                    </div>
                                </div>

                                {selectedRecord.prescription && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2 text-gray-700">
                                            <Pill className="w-4 h-4" />
                                            Đơn thuốc
                                        </h3>
                                        <div className="p-3 bg-green-50 rounded-md text-green-900 whitespace-pre-line">
                                            {selectedRecord.prescription}
                                        </div>
                                    </div>
                                )}

                                {selectedRecord.notes && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-gray-700">Ghi chú</h3>
                                        <p className="text-gray-600">{selectedRecord.notes}</p>
                                    </div>
                                )}

                                {selectedRecord.file_url && (
                                    <div className="pt-4 border-t">
                                        <Button variant="outline" className="flex items-center gap-2" onClick={() => window.open(selectedRecord.file_url, '_blank')}>
                                            <Download className="w-4 h-4" />
                                            Tải tài liệu đính kèm
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
