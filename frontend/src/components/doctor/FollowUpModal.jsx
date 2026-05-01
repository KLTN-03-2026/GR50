import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, MapPin, Video, FileText } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config';
import { toast } from 'sonner';

export default function FollowUpModal({ record, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'in-person',
        symptoms: 'Tái khám theo chỉ định',
        notes: '',
        facility_id: record.Id_PhongKham || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.appointment_date || !formData.appointment_time) {
            toast.error('Vui lòng chọn ngày và giờ tái khám');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/medical-records/${record.id}/follow-up`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đã đặt lịch tái khám thành công');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error creating follow-up:', error);
            toast.error(error.response?.data?.detail || 'Không thể đặt lịch tái khám');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-4">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Đặt lịch tái khám
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-teal-700 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6" />
                        Lên lịch tái khám
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-teal-600" />
                                Ngày tái khám
                            </label>
                            <Input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.appointment_date}
                                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-teal-600" />
                                Giờ tái khám
                            </label>
                            <Input
                                type="time"
                                value={formData.appointment_time}
                                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hình thức khám</label>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant={formData.appointment_type === 'in-person' ? 'default' : 'outline'}
                                className={formData.appointment_type === 'in-person' ? 'bg-teal-600' : 'border-teal-200'}
                                onClick={() => setFormData({ ...formData, appointment_type: 'in-person' })}
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                Tại phòng khám
                            </Button>
                            <Button
                                type="button"
                                variant={formData.appointment_type === 'online' ? 'default' : 'outline'}
                                className={formData.appointment_type === 'online' ? 'bg-teal-600' : 'border-teal-200'}
                                onClick={() => setFormData({ ...formData, appointment_type: 'online' })}
                            >
                                <Video className="w-4 h-4 mr-2" />
                                Khám Online
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-600" />
                            Lý do tái khám
                        </label>
                        <Input
                            placeholder="Ví dụ: Kiểm tra tình trạng họng sau 7 ngày"
                            value={formData.symptoms}
                            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ghi chú / Dặn dò thêm</label>
                        <Textarea
                            placeholder="Yêu cầu chuẩn bị trước khi tái khám..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
