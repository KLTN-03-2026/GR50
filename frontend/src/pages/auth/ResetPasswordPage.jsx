import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API } from '@/config';
import { toast } from 'sonner';
import axios from 'axios';
import { KeyRound } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            toast.error('Token không hợp lệ hoặc bị thiếu.');
            navigate('/login');
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API}/auth/reset-password`, { token, newPassword });
            toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra, token có thể đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <KeyRound className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-gray-800">MediSchedule</span>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Đặt lại mật khẩu</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="newPassword">Mật khẩu mới</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="mt-2"
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                            {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
