import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import { toast } from 'sonner';
import axios from 'axios';
import { Calendar, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { getErrorMessage } from '@/utils/errorHandler';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGoogleLogin } from '@react-oauth/google';



export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone: '',
    date_of_birth: '',
    role: 'patient'
  });

  // Fetch specialties when component mounts
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get(`${API}/specialties`);
        console.log('Fetched specialties:', response.data);
        setSpecialties(response.data);
      } catch (error) {
        console.error('Error fetching specialties:', error);
        toast.error('Không thể tải danh sách chuyên khoa');
      }
    };
    fetchSpecialties();
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = { ...formData };

      const response = await axios.post(`${API}/auth/register`, submitData);
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/google-login`, {
        accessToken: credentialResponse.access_token
      });
      const { token, user } = response.data;
      login(token, user);
      toast.success(t('registerSuccess'));

      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (error) {
      toast.error(t('registerFailed'));
      console.error('Google Auth Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: (codeResponse) => handleGoogleSuccess(codeResponse),
    onError: (error) => toast.error(t('registerFailed')),
    flow: 'implicit'
  });

  const handleSocialAuth = (type) => {
    if (type === 'google') {
      googleLoginHandler();
      return;
    }
    if (type === 'facebook') {
      if (window.FB) {
        window.FB.login((response) => handleFacebookLogin(response), { scope: 'public_profile,email' });
      } else {
        toast.error('Facebook SDK not loaded');
      }
      return;
    }
    toast.info(t('socialLoginNeedsConfig'), {
      icon: '🔐',
      duration: 4000
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md">
        <Button data-testid="back-to-home-btn" variant="ghost" onClick={() => navigate('/')} className="mb-6 dark:text-gray-200 dark:hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToHome')}
        </Button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-800 dark:text-white">Đặt Lịch Khám Bệnh</span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">{t('registerAccount')}</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="full_name" className="dark:text-gray-200">{t('fullName')}</Label>
              <Input
                data-testid="fullname-input"
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="username" className="dark:text-gray-200">{t('username')}</Label>
              <Input
                data-testid="username-input"
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="email" className="dark:text-gray-200">{t('email')}</Label>
              <Input
                data-testid="email-input"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="dark:text-gray-200">{t('phone')}</Label>
              <Input
                data-testid="phone-input"
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="password" className="dark:text-gray-200">{t('password')}</Label>
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
                  className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
              <Label htmlFor="date_of_birth" className="dark:text-gray-200">{t('dateOfBirth')} ({t('optional')})</Label>
              <Input
                data-testid="dob-input"
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Removed Account Type and Specialty selections */}

            <Button data-testid="submit-register-btn" type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              {loading ? t('loading') : t('register')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  {t('orRegisterWith')}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth('google')}
                className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth('facebook')}
                className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 hover:text-[#1877F2]"
              >

                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold">
              {t('loginNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
