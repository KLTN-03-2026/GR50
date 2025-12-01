import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '@/config';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function SystemSettings() {
    const [settings, setSettings] = useState({
        hospital_name: '',
        hospital_address: '',
        hospital_phone: '',
        hospital_email: '',
        banner_image: '',
        logo_image: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API}/system`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Merge with defaults to ensure controlled inputs
            setSettings(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Không thể tải cài đặt');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/system`, settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Cập nhật cài đặt thành công');
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Lỗi khi cập nhật cài đặt');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Layout><div className="p-6">Đang tải...</div></Layout>;

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Cài đặt hệ thống</h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Thông tin phòng khám</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hospital_name">Tên phòng khám</Label>
                                    <Input
                                        id="hospital_name"
                                        name="hospital_name"
                                        value={settings.hospital_name}
                                        onChange={handleChange}
                                        placeholder="VD: Phòng khám Đa khoa MediSchedule"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hospital_phone">Số điện thoại</Label>
                                    <Input
                                        id="hospital_phone"
                                        name="hospital_phone"
                                        value={settings.hospital_phone}
                                        onChange={handleChange}
                                        placeholder="VD: 1900 1234"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hospital_email">Email liên hệ</Label>
                                    <Input
                                        id="hospital_email"
                                        name="hospital_email"
                                        value={settings.hospital_email}
                                        onChange={handleChange}
                                        placeholder="contact@medischedule.com"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="hospital_address">Địa chỉ</Label>
                                    <Textarea
                                        id="hospital_address"
                                        name="hospital_address"
                                        value={settings.hospital_address}
                                        onChange={handleChange}
                                        placeholder="VD: 123 Đường ABC, Quận XYZ, TP.HCM"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Hình ảnh & Giao diện</h2>

                            <div className="space-y-2">
                                <Label htmlFor="logo_image">URL Logo</Label>
                                <Input
                                    id="logo_image"
                                    name="logo_image"
                                    value={settings.logo_image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/logo.png"
                                />
                                {settings.logo_image && (
                                    <div className="mt-2">
                                        <img src={settings.logo_image} alt="Logo Preview" className="h-12 object-contain" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="banner_image">URL Banner Trang chủ</Label>
                                <Input
                                    id="banner_image"
                                    name="banner_image"
                                    value={settings.banner_image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/banner.jpg"
                                />
                                {settings.banner_image && (
                                    <div className="mt-2">
                                        <img src={settings.banner_image} alt="Banner Preview" className="w-full h-48 object-cover rounded-lg" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving} className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
