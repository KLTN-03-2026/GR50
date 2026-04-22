import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Save, HeartPulse, Camera, Phone, Mail, Droplets } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AccountSettings() {
    const { token, user } = useContext(AuthContext);
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        ho: '',
        ten: '',
        email: '',
        so_dien_thoai: '',
        gioi_tinh: '',
        ngay_sinh: '',
        avatar: '',
        nhom_mau: '',
        tien_su_benh: '',
        nguoi_lien_he: '',
        sdt_lien_he: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API}/patients/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData(response.data);
        } catch (error) {
            toast.error('Không thể tải thông tin hồ sơ.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            toast.loading('Đang lưu thông tin...', { id: 'save-profile' });
            await axios.put(`${API}/patients/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Lưu hồ sơ thành công!', { id: 'save-profile' });
        } catch (error) {
            toast.error('Lỗi khi lưu hồ sơ.', { id: 'save-profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Layout><div className="flex justify-center items-center h-full">Đang tải cấu hình...</div></Layout>;

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">

                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <User className="w-8 h-8 text-teal-600" />
                                Cài đặt Hồ sơ Bệnh nhân
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Cập nhật thông tin cá nhân và dữ liệu y tế của bạn.</p>
                        </div>
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg px-8">
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Cột 1: Thông tin cơ bản */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white border-b pb-4">
                                <User className="w-5 h-5 text-teal-500" />
                                Thông tin Cơ bản
                            </h2>

                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ho">Họ</Label>
                                        <Input id="ho" name="ho" value={formData.ho || ''} onChange={handleChange} className="bg-gray-50 focus:bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ten">Tên</Label>
                                        <Input id="ten" name="ten" value={formData.ten || ''} onChange={handleChange} className="bg-gray-50 focus:bg-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email đăng nhập (Không thể sửa)</Label>
                                    <Input id="email" name="email" value={formData.email || ''} disabled className="bg-gray-100 cursor-not-allowed" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="so_dien_thoai">Số điện thoại cá nhân</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input id="so_dien_thoai" name="so_dien_thoai" value={formData.so_dien_thoai || ''} onChange={handleChange} className="pl-10 bg-gray-50 focus:bg-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ngay_sinh">Ngày sinh</Label>
                                        <Input id="ngay_sinh" name="ngay_sinh" type="date" value={formData.ngay_sinh || ''} onChange={handleChange} className="bg-gray-50 focus:bg-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gioi_tinh">Giới tính</Label>
                                    <select
                                        id="gioi_tinh"
                                        name="gioi_tinh"
                                        value={formData.gioi_tinh || ''}
                                        onChange={handleChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nu">Nữ</option>
                                        <option value="Khac">Khác</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Cột 2: Thông tin Y tế */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white border-b pb-4">
                                <HeartPulse className="w-5 h-5 text-red-500" />
                                Dữ liệu Y tế & Khẩn cấp
                            </h2>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="nhom_mau">Nhóm máu</Label>
                                    <div className="relative">
                                        <Droplets className="absolute left-3 top-3 w-4 h-4 text-red-400" />
                                        <Input id="nhom_mau" name="nhom_mau" placeholder="A+, B-, O+, AB" value={formData.nhom_mau || ''} onChange={handleChange} className="pl-10 bg-gray-50 focus:bg-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tien_su_benh">Tiền sử bệnh lý (Dành cho bác sĩ tham khảo)</Label>
                                    <Textarea
                                        id="tien_su_benh"
                                        name="tien_su_benh"
                                        placeholder="Các bệnh từng mắc, dị ứng thuốc..."
                                        value={formData.tien_su_benh || ''}
                                        onChange={handleChange}
                                        className="bg-gray-50 focus:bg-white h-24 resize-none"
                                    />
                                </div>

                                <div className="pt-4 border-t mt-4 border-gray-100 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 text-sm uppercase tracking-wider">Thông tin liên hệ khẩn cấp</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nguoi_lien_he">Tên người liên hệ (Người thân)</Label>
                                            <Input id="nguoi_lien_he" name="nguoi_lien_he" value={formData.nguoi_lien_he || ''} onChange={handleChange} className="bg-gray-50 focus:bg-white" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sdt_lien_he">Số điện thoại khẩn cấp</Label>
                                            <Input id="sdt_lien_he" name="sdt_lien_he" value={formData.sdt_lien_he || ''} onChange={handleChange} className="bg-gray-50 focus:bg-white" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
