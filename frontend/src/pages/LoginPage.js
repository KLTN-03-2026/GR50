import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthContext, API } from '@/App';
import { toast } from 'sonner';
import axios from 'axios';
import { Calendar, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { getErrorMessage } from '@/utils/errorHandler';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: localStorage.getItem('rememberedEmail') || '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginPayload = {
        login: formData.email,
        password: formData.password
      };
      
      const response = await axios.post(`${API}/auth/login`, loginPayload);
      const { token, user } = response.data;
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      login(token, user);
      toast.success(t('loginSuccess'));
      
      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'department_head') navigate('/department-head/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (error) {
      let errorMessage = t('loginFailed');
      
      if (error.response?.status === 401) {
        errorMessage = getErrorMessage(error, t('invalidCredentials'));
      }
      
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

          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">{t('login')}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative mt-2">
                <Input
                  data-testid="password-input"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pr-10"
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t('rememberMe')}
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700">
                {t('forgotPassword')}
              </Link>
            </div>

            <Button data-testid="submit-login-btn" type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              {loading ? t('loading') : t('login')}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="text-teal-600 hover:text-teal-700 font-semibold">
              {t('registerNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
