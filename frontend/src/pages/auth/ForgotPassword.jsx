import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API } from '@/config';
import { toast } from 'sonner';
import axios from 'axios';
import { KeyRound, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [contact, setContact] = useState('');
    const [otp, setOtp] = useState('');
    const [resetId, setResetId] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const sendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API}/auth/forgot-password`, { contact });
            toast.success(res.data.message || 'Mã xác minh đã được gửi');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API}/auth/verify-otp`, { contact, otp });
            toast.success(res.data.message || 'Xác minh thành công');
            setResetId(res.data.resetId);
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${API}/auth/reset-password`, {
                resetId,
                newPassword,
                confirmPassword,
            });
            toast.success(res.data.message || 'Đổi mật khẩu thành công');
            setStep(4);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transition-all">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <KeyRound className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-gray-800 dark:text-white">MediSchedule</span>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Quên mật khẩu</h2>

                    {step === 1 && (
                        <form onSubmit={sendOtp} className="space-y-6">
                            <div>
                                <Label htmlFor="contact">Email hoặc số điện thoại</Label>
                                <div className="relative mt-2">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="contact"
                                        type="text"
                                        placeholder="Nhập email hoặc số điện thoại"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                                {loading ? 'Đang gửi...' : 'Gửi mã xác minh'}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={verifyOtp} className="space-y-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                                Vui lòng nhập mã OTP đã được gửi đến <span className="font-semibold">{contact}</span>
                            </p>
                            <div>
                                <Label htmlFor="otp">Mã OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Nhập mã 6 số"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    required
                                    className="mt-2 text-center text-xl tracking-[0.5em]"
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                                {loading ? 'Đang xác minh...' : 'Xác minh mã'}
                            </Button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={resetPassword} className="space-y-6">
                            <div>
                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Nhập tối thiểu 6 ký tự"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Nhập lại mật khẩu mới"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </Button>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-16 h-16 text-teal-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Thành công!</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Mật khẩu của bạn đã được thay đổi thành công.
                            </p>
                            <Button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                                Quay lại Đăng nhập
                            </Button>
                        </div>
                    )}

                    {step < 4 && (
                        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            <button onClick={() => navigate('/login')} className="hover:text-teal-600 hover:underline">
                                Trở về trang Đăng nhập
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
