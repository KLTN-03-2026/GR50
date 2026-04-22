import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Activity, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

export default function AIDiagnoses() {
    const [diagnoses, setDiagnoses] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [diagnosesRes, doctorsRes] = await Promise.all([
                axios.get(`${API}/ai/diagnoses`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/doctors`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setDiagnoses(diagnosesRes.data);
            setDoctors(doctorsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignDoctor = async () => {
        if (!selectedDoctorId) {
            toast.error("Vui lòng chọn bác sĩ");
            return;
        }

        setAssigning(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/ai/diagnoses/${selectedDiagnosis.id}/assign`,
                { doctor_id: selectedDoctorId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Đã gửi chẩn đoán cho bác sĩ thành công");
            setSelectedDiagnosis(null);
            setSelectedDoctorId('');
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Error assigning doctor:', error);
            toast.error("Có lỗi xảy ra khi gửi cho bác sĩ");
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <Layout>
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="w-8 h-8 text-purple-600" />
                    Lịch sử Chẩn đoán AI & Phân công
                </h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách chẩn đoán gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Bệnh nhân</TableHead>
                                    <TableHead>Triệu chứng</TableHead>
                                    <TableHead>Chẩn đoán sơ bộ</TableHead>
                                    <TableHead>Chuyên khoa gợi ý</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {diagnoses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">{item.User?.full_name}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 ml-6">{item.User?.email}</div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={item.symptoms}>
                                                {item.symptoms}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate font-medium text-purple-700" title={item.diagnosis}>
                                                {item.diagnosis}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {item.specialty}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                                        item.status === 'assigned' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                                            'bg-green-100 text-green-800 hover:bg-green-100'
                                                }>
                                                    {item.status === 'pending' ? 'Chờ xử lý' :
                                                        item.status === 'assigned' ? 'Đã gửi BS' : 'Hoàn thành'}
                                                </Badge>
                                                {item.Doctor && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <Link to={`/doctors/${item.Doctor.id}`} className="hover:text-purple-600 hover:underline">
                                                            BS. {item.Doctor.User?.full_name}
                                                        </Link>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedDiagnosis(item)}
                                                >
                                                    Xem & Gửi
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={!!selectedDiagnosis} onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDiagnosis(null);
                        setSelectedDoctorId('');
                    }
                }}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl text-purple-700">
                                <Activity className="w-6 h-6" />
                                Chi tiết chẩn đoán & Gửi bác sĩ
                            </DialogTitle>
                        </DialogHeader>

                        {selectedDiagnosis && (
                            <div className="space-y-6 py-4">
                                {/* ... (Existing details view) ... */}
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
                                        Triệu chứng mô tả
                                    </h3>
                                    <div className="p-4 bg-white border rounded-md text-gray-800">
                                        {selectedDiagnosis.symptoms}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-purple-700">Chẩn đoán sơ bộ</h3>
                                        <div className="p-4 bg-purple-50 rounded-md text-purple-900 border border-purple-100">
                                            {selectedDiagnosis.diagnosis}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-blue-700">Chuyên khoa gợi ý</h3>
                                        <div className="p-4 bg-blue-50 rounded-md text-blue-900 border border-blue-100 font-medium">
                                            {selectedDiagnosis.specialty}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-green-700">Lời khuyên</h3>
                                    <div className="p-4 bg-green-50 rounded-md text-green-900 border border-green-100 whitespace-pre-line">
                                        {selectedDiagnosis.advice}
                                    </div>
                                </div>

                                {/* Assign Doctor Section */}
                                <div className="pt-6 border-t space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2 text-gray-800">
                                        <Send className="w-4 h-4" />
                                        Gửi thông tin cho bác sĩ phụ trách
                                    </h3>
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Chọn bác sĩ</label>
                                            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn bác sĩ để gửi thông tin..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {doctors.map((doctor) => (
                                                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                            BS. {doctor.User?.full_name} - {doctor.Specialty?.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                            onClick={handleAssignDoctor}
                                            disabled={assigning || !selectedDoctorId}
                                        >
                                            {assigning ? 'Đang gửi...' : 'Gửi cho bác sĩ'}
                                        </Button>
                                    </div>
                                    {selectedDiagnosis.status === 'assigned' && (
                                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                                            <CheckCircle className="w-4 h-4" />
                                            Đã gửi cho BS. {selectedDiagnosis.Doctor?.User?.full_name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
