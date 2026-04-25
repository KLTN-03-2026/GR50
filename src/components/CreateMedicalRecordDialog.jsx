import React, { useState, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config';
import { AuthContext } from '@/contexts/AuthContext';
import { Upload, FileText } from 'lucide-react';

export default function CreateMedicalRecordDialog({ open, onOpenChange, appointment, onSuccess }) {
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        diagnosis: '',
        prescription: '',
        notes: ''
    });
    const [file, setFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.diagnosis) {
            toast.error('Vui lòng nhập chẩn đoán');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('patient_id', appointment.patient_id);
            data.append('appointment_id', appointment.id);
            data.append('diagnosis', formData.diagnosis);
            data.append('prescription', formData.prescription);
            data.append('notes', formData.notes);
            if (file) {
                data.append('file', file);
            }

            await axios.post(`${API}/medical-records`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Tạo hồ sơ bệnh án thành công');
            onOpenChange(false);
            setFormData({ diagnosis: '', prescription: '', notes: '' });
            setFile(null);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Create record error:', error);
            toast.error('Không thể tạo hồ sơ bệnh án');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Tạo hồ sơ bệnh án - {appointment?.patient_name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="diagnosis">Chẩn đoán bệnh <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="diagnosis"
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleChange}
                            placeholder="Nhập chẩn đoán..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prescription">Đơn thuốc</Label>
                        <Textarea
                            id="prescription"
                            name="prescription"
                            value={formData.prescription}
                            onChange={handleChange}
                            placeholder="Nhập đơn thuốc..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú / Lời dặn</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Ghi chú thêm..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tải lên hồ sơ / Kết quả xét nghiệm</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <div className="flex flex-col items-center gap-2">
                                {file ? (
                                    <>
                                        <FileText className="w-8 h-8 text-teal-500" />
                                        <span className="text-sm font-medium text-teal-700">{file.name}</span>
                                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <span className="text-sm text-gray-600">Kéo thả hoặc click để tải lên</span>
                                        <span className="text-xs text-gray-400">PDF, Images, Word (Max 10MB)</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                            {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
