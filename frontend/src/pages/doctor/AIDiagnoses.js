import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, User, Activity, CheckCircle, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

export default function DoctorAIDiagnoses() {
    const navigate = useNavigate();
    const [diagnoses, setDiagnoses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

    useEffect(() => {
        fetchDiagnoses();
    }, []);

    const fetchDiagnoses = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch pending diagnoses AND assigned to me
            const [pendingRes, assignedRes] = await Promise.all([
                axios.get(`${API}/ai/diagnoses?status=pending`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/ai/diagnoses?type=assigned&status=assigned`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            // Combine and sort by date
            const combined = [...pendingRes.data, ...assignedRes.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setDiagnoses(combined);
        } catch (error) {
            console.error('Error fetching diagnoses:', error);
            toast.error("Không thể tải danh sách chẩn đoán");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/ai/diagnoses/${id}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã tiếp nhận bệnh nhân thành công");
            setSelectedDiagnosis(null);
            fetchDiagnoses(); // Refresh list
        } catch (error) {
            console.error('Error accepting diagnosis:', error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tiếp nhận");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn từ chối ca bệnh này?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/ai/diagnoses/${id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã từ chối tiếp nhận");
            fetchDiagnoses();
        } catch (error) {
            console.error('Error rejecting diagnosis:', error);
            toast.error("Không thể từ chối");
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <Layout>
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="w-8 h-8 text-purple-600" />
                        Danh sách Chẩn đoán từ AI (Cần tiếp nhận)
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Bệnh nhân chờ tư vấn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Bệnh nhân</TableHead>
                                    <TableHead>Triệu chứng</TableHead>
                                    <TableHead>Chẩn đoán sơ bộ</TableHead>
                                    <TableHead>Chuyên khoa</TableHead>
                                    <TableHead>Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {diagnoses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            Chưa có dữ liệu chẩn đoán nào.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    diagnoses.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.User?.full_name}</div>
                                                <div className="text-xs text-gray-500">{item.User?.email}</div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={item.symptoms}>
                                                {item.symptoms}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate font-medium text-purple-700">
                                                {item.diagnosis}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                    {item.specialty}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedDiagnosis(item)}
                                                    >
                                                        Xem & Tiếp nhận
                                                    </Button>
                                                    {item.status === 'assigned' && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleReject(item.id)}
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={!!selectedDiagnosis} onOpenChange={(open) => !open && setSelectedDiagnosis(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl text-purple-700">
                                <Brain className="w-6 h-6" />
                                Chi tiết chẩn đoán & Tiếp nhận
                            </DialogTitle>
                        </DialogHeader>

                        {selectedDiagnosis && (
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-500">Bệnh nhân</p>
                                        <p className="font-medium text-lg">{selectedDiagnosis.User?.full_name}</p>
                                        <p className="text-sm text-gray-600">{selectedDiagnosis.User?.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Thời gian tạo</p>
                                        <p className="font-medium">
                                            {format(new Date(selectedDiagnosis.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold flex items-center gap-2 text-gray-700">
                                        <Activity className="w-4 h-4" />
                                        Triệu chứng
                                    </h3>
                                    <div className="p-4 bg-white border rounded-md text-gray-800">
                                        {selectedDiagnosis.symptoms}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-purple-700">Chẩn đoán AI</h3>
                                        <div className="p-4 bg-purple-50 rounded-md text-purple-900 border border-purple-100">
                                            {selectedDiagnosis.diagnosis}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-blue-700">Chuyên khoa</h3>
                                        <div className="p-4 bg-blue-50 rounded-md text-blue-900 border border-blue-100">
                                            {selectedDiagnosis.specialty}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-green-700">Lời khuyên từ AI</h3>
                                    <div className="p-4 bg-green-50 rounded-md text-green-900 border border-green-100 whitespace-pre-line">
                                        {selectedDiagnosis.advice}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setSelectedDiagnosis(null)}>
                                        Đóng
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleAccept(selectedDiagnosis.id)}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Tiếp nhận bệnh nhân
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
