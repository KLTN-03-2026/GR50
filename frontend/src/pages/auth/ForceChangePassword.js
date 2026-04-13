import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForceChangePassword() {
    const { token, logout, login } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error(t('passwordsDoNotMatch'));
        }
        if (formData.newPassword.length < 6) {
            return toast.error(t('passwordTooShort'));
        }

        setLoading(true);
        try {
            await axios.post(`${API}/auth/force-change-password`,
                { new_password: formData.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(t('passwordUpdateSuccess'));

            // Clear flag and continue
            localStorage.removeItem('mustChangePassword');
            window.location.href = '/login'; // Re-login to be safe or just redirect
        } catch (error) {
            toast.error(error.response?.data?.detail || t('updateError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 text-center">{t('changePasswordRequired')}</h2>
                    <p className="text-gray-600 text-center mt-2">{t('forceChangePasswordDesc')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">{t('newPassword')}</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-6 rounded-2xl flex items-center justify-center gap-2"
                    >
                        {loading ? t('processing') : (
                            <>
                                {t('updatePassword')}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>

                    <button
                        type="button"
                        onClick={logout}
                        className="w-full text-center text-gray-500 hover:text-gray-700 text-sm mt-4"
                    >
                        {t('logout')}
                    </button>
                </form>
            </div>
        </div>
    );
}
