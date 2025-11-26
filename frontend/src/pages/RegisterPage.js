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
    role: 'patient',
    specialty_id: ''
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
      // Validate specialty for doctor
      if (formData.role === 'doctor' && !formData.specialty_id) {
        toast.error(language === 'vi' ? 'Vui lòng chọn chuyên khoa' : 'Please select a specialty');
        setLoading(false);
        return;
      }

      // Prepare data - remove specialty_id if not doctor
      const submitData = { ...formData };
      if (formData.role !== 'doctor') {
        delete submitData.specialty_id;
      }

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

            <div>
              <Label htmlFor="role" className="dark:text-gray-200">{t('accountType')}</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value, specialty_id: '' })}
              >
                <SelectTrigger data-testid="role-select" className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem data-testid="role-patient" value="patient" className="dark:text-white">{t('patient')}</SelectItem>
                  <SelectItem data-testid="role-doctor" value="doctor" className="dark:text-white">{t('doctor')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show specialty selection only for doctors */}
            {formData.role === 'doctor' && (
              <div>
                <Label htmlFor="specialty" className="dark:text-gray-200">{t('specialty')}</Label>
                <Select 
                  value={formData.specialty_id} 
                  onValueChange={(value) => setFormData({ ...formData, specialty_id: value })}
                >
                  <SelectTrigger data-testid="specialty-select" className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder={t('selectSpecialty')} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id} className="dark:text-white">
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button data-testid="submit-register-btn" type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              {loading ? t('loading') : t('register')}
            </Button>
          </form>

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
