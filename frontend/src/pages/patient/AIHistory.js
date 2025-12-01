import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Calendar, Activity, Stethoscope, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

export default function AIHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            // Reusing the same endpoint, backend filters by user_id for patients
            const response = await axios.get(`${API}/ai/diagnoses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error("Không thể tải lịch sử tư vấn");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="space-y-6 container mx-auto p-6 max-w-5xl">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 pl-0 hover:bg-transparent hover:text-purple-700 mb-2">
                <ArrowLeft className="w-5 h-5" />
                Quay lại
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-700">
                <Brain className="w-8 h-8" />
                Lịch sử Tư vấn AI
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách các lần tư vấn trước đây</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Triệu chứng</TableHead>
                                <TableHead>Chẩn đoán sơ bộ</TableHead>
                                <TableHead>Chuyên khoa</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Chi tiết</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Bạn chưa có lịch sử tư vấn nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={item.symptoms}>
                                            {item.symptoms}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate font-medium">
                                            {item.diagnosis}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                {item.specialty}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                                    item.status === 'assigned' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                                        'bg-green-100 text-green-800 hover:bg-green-100'
                                            }>
                                                {item.status === 'pending' ? 'Chờ tiếp nhận' :
                                                    item.status === 'assigned' ? 'Đã tiếp nhận' : 'Đã xem'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedItem(item)}
                                            >
                                                Xem
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-purple-700">
                            <Brain className="w-6 h-6" />
                            Chi tiết kết quả tư vấn
                        </DialogTitle>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-6 py-4">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Thời gian tư vấn</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedItem.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                </div>
                                <Badge className={
                                    selectedItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        selectedItem.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                }>
                                    {selectedItem.status === 'pending' ? 'Chờ bác sĩ tiếp nhận' :
                                        selectedItem.status === 'assigned' ? 'Bác sĩ đã tiếp nhận' : 'Hoàn thành'}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2 text-gray-700">
                                    <Activity className="w-4 h-4" />
                                    Triệu chứng đã mô tả
                                </h3>
                                <div className="p-4 bg-white border rounded-md text-gray-800">
                                    {selectedItem.symptoms}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-purple-700">Chẩn đoán từ AI</h3>
                                    <div className="p-4 bg-purple-50 rounded-md text-purple-900 border border-purple-100">
                                        {selectedItem.diagnosis}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-blue-700">Chuyên khoa gợi ý</h3>
                                    <div className="p-4 bg-blue-50 rounded-md text-blue-900 border border-blue-100">
                                        {selectedItem.specialty}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-green-700">Lời khuyên</h3>
                                <div className="p-4 bg-green-50 rounded-md text-green-900 border border-green-100 whitespace-pre-line">
                                    {selectedItem.advice}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
