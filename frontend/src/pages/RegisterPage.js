import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthContext, API } from '@/App';
import { toast } from 'sonner';
import axios from 'axios';
import { Calendar, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { getErrorMessage } from '@/utils/errorHandler';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    role: 'patient'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      const { token, user } = response.data;
      
      login(token, user);
      toast.success(t('registerSuccess'));
      
      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'department_head') navigate('/department-head/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (error) {
      const errorMessage = getErrorMessage(error, t('registerFailed'));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Button data-testid="back-to-home-btn" variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToHome')}
        </Button>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-800">MediSchedule</span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">{t('registerAccount')}</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="full_name">{t('fullName')}</Label>
              <Input
                data-testid="fullname-input"
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="username">{t('username')}</Label>
              <Input
                data-testid="username-input"
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                data-testid="email-input"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                data-testid="phone-input"
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative mt-2">
                <Input
                  data-testid="password-input"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('minPasswordLength')}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="date_of_birth">{t('dateOfBirth')} ({t('optional')})</Label>
              <Input
                data-testid="dob-input"
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="address">{t('address')} ({t('optional')})</Label>
              <Input
                data-testid="address-input"
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="role">{t('accountType')}</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger data-testid="role-select" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem data-testid="role-patient" value="patient">{t('patient')}</SelectItem>
                  <SelectItem data-testid="role-doctor" value="doctor">{t('doctor')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button data-testid="submit-register-btn" type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              {loading ? t('loading') : t('register')}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
              {t('loginNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
