import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { toast } from 'sonner';
import { Settings, Save, CheckCircle2, DollarSign, Clock, LayoutTemplate } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ServiceSettings() {
    const { token, user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        consultation_fee: 0,
        appointment_duration: 30, // default 30 mins
        max_patients_per_session: 10
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API}/doctors/my-service-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setFormData({
                    consultation_fee: response.data.consultation_fee || 0,
                    appointment_duration: response.data.appointment_duration || 30,
                    max_patients_per_session: response.data.max_patients_per_session || 10
                });
            }
        } catch (error) {
            toast.error('Không thể tải thông tin dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (formData.consultation_fee < 0) {
            toast.error('Phí tư vấn không hợp lệ');
            return;
        }
        setSaving(true);
        try {
            await axios.put(`${API}/doctors/my-service-settings`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đã lưu cài đặt dịch vụ thành công.');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Lỗi khi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Layout><div className="p-6 text-center text-gray-500">Đang tải...</div></Layout>;
    }

    // Format currency
    const formatCurrency = (value) => {
        if (!value) return "0";
        return parseInt(value, 10).toLocaleString('vi-VN');
    };

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <Settings className="w-8 h-8 text-teal-600" />
                            Cài đặt Dịch vụ
                        </h1>
                        <p className="text-gray-500 mt-2">Định cấu hình phí khám và các tham số lịch khám cho bệnh nhân.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-3">
                            <DollarSign className="w-5 h-5 text-teal-500" /> Cấu hình Chi phí
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="consultation_fee">Phí tư vấn (VNĐ) mỗi ca khám</Label>
                            <div className="relative">
                                <Input
                                    id="consultation_fee"
                                    type="number"
                                    min="0"
                                    step="10000"
                                    value={formData.consultation_fee}
                                    onChange={(e) => setFormData({ ...formData, consultation_fee: parseInt(e.target.value) || 0 })}
                                    className="pl-4 pr-12 text-lg font-medium"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 font-semibold">
                                    đ
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Hiển thị cho bệnh nhân: <span className="font-bold text-teal-600">{formatCurrency(formData.consultation_fee)} VNĐ</span>. Lưu ý: Thay đổi chỉ áp dụng cho lịch đặt mới.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-3">
                            <LayoutTemplate className="w-5 h-5 text-teal-500" /> Tham số Lịch khám
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="appointment_duration">Thời lượng trung bình 1 ca khám (Phút)</Label>
                                <div className="relative">
                                    <Input
                                        id="appointment_duration"
                                        type="number"
                                        min="10"
                                        max="120"
                                        step="5"
                                        value={formData.appointment_duration}
                                        onChange={(e) => setFormData({ ...formData, appointment_duration: parseInt(e.target.value) || 30 })}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                                        Phút
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_patients_per_session">Số bệnh nhân tối đa mỗi khung giờ</Label>
                                <Input
                                    id="max_patients_per_session"
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formData.max_patients_per_session}
                                    onChange={(e) => setFormData({ ...formData, max_patients_per_session: parseInt(e.target.value) || 10 })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Sử dụng để giới hạn lượng booking tránh quá tải.</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg text-white font-semibold py-6 px-10 text-lg rounded-xl flex items-center gap-3"
                        >
                            {saving ? 'Đang lưu...' : (
                                <>
                                    <Save className="w-5 h-5" /> Lưu Cài Đặt Dịch Vụ
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
