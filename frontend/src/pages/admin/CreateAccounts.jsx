import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import axios from 'axios';
import { UserPlus, Eye, EyeOff, Users, Stethoscope, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getErrorMessage } from '@/utils/errorHandler';

export default function CreateAccounts() {
  const { token } = useContext(AuthContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    // Doctor fields
    specialty_id: '',
    bio: '',
    experience_years: 0,
    consultation_fee: 0,
    specialty_id: '',
    bio: '',
    experience_years: 0,
    consultation_fee: 0,
  });

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${API}/specialties`);
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate role selection
    if (!selectedRole) {
      toast.error(t('pleaseSelectRole') || 'Vui lòng chọn loại tài khoản');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: selectedRole,
        phone: formData.phone || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        address: formData.address || undefined
      };

      if (selectedRole === 'doctor') {
        payload.specialty_id = formData.specialty_id;
        payload.bio = formData.bio;
        payload.experience_years = parseInt(formData.experience_years) || 0;
        payload.consultation_fee = parseFloat(formData.consultation_fee) || 0;
      }

      if (selectedRole === 'staff') {
        // Staff role doesn't require specific additional payload fields for now
      }

      await axios.post(`${API}/admin/create-user`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`${t('createSuccess')} ${getRoleName(selectedRole)}!`);
      resetForm();
    } catch (error) {
      const errorMessage = getErrorMessage(error, t('createError'));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRole('');
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      date_of_birth: '',
      address: '',
      specialty_id: '',
      bio: '',
      experience_years: 0,
      specialty_id: '',
      bio: '',
      experience_years: 0,
      consultation_fee: 0,
    });
  };

  const getRoleName = (role) => {
    const names = {
      patient: t('patient'),
      doctor: t('doctor'),
      staff: t('staff')
    };
    return names[role] || role;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('createAccount')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{t('createAccountDesc')}</p>
          </div>

          {/* Role Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <Label className="mb-4 block text-lg font-semibold">{t('selectAccountType')}</Label>
            <div className="grid md:grid-cols-3 gap-4">
              <RoleCard
                icon={<Users className="w-8 h-8" />}
                title={t('patient')}
                role="patient"
                selected={selectedRole === 'patient'}
                onClick={() => setSelectedRole('patient')}
              />
              <RoleCard
                icon={<Stethoscope className="w-8 h-8" />}
                title={t('doctor')}
                role="doctor"
                selected={selectedRole === 'doctor'}
                onClick={() => setSelectedRole('doctor')}
              />
              <RoleCard
                icon={<Shield className="w-8 h-8" />}
                title={t('staff')}
                role="staff"
                selected={selectedRole === 'staff'}
                onClick={() => setSelectedRole('staff')}
              />
            </div>
          </div>

          {/* Create Account Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">{t('accountInfo')} {getRoleName(selectedRole)}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">{t('basicInfo')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">{t('fullName')} *</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">{t('password')} *</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">{t('dateOfBirth')}</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">{t('address')}</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Doctor Specific Fields */}
              {['doctor'].includes(selectedRole) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">{t('doctorInfo')}</h3>
                  <div>
                    <Label htmlFor="specialty_id">{t('specialty')} *</Label>
                    <select
                      id="specialty_id"
                      value={formData.specialty_id}
                      onChange={(e) => setFormData({ ...formData, specialty_id: e.target.value })}
                      required
                      className="mt-2 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">{t('selectSpecialty')}</option>
                      {specialties.map((specialty) => (
                        <option key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="bio">{t('bio')}</Label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="mt-2 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience_years">{t('experienceYears')}</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        value={formData.experience_years}
                        onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="consultation_fee">{t('consultationFee')}</Label>
                      <Input
                        id="consultation_fee"
                        type="number"
                        min="0"
                        value={formData.consultation_fee}
                        onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Additional Info (Optional) */}
              {selectedRole === 'staff' && (
                <div className="space-y-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                   <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Lưu ý:</strong> Tài khoản Nhân viên / Lễ tân sẽ có quyền tiếp nhận bệnh nhân, điều phối lịch khám và hỗ trợ vận hành tuyến đầu. Không bao gồm quyền quản lý nhân sự hay chuyên môn.
                   </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? t('creating') : t('createAccount')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('reset')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function RoleCard({ icon, title, role, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selected
          ? 'border-teal-500 bg-teal-50 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${selected
          ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
        {icon}
      </div>
      <h3 className={`font-semibold ${selected ? 'text-teal-700 dark:text-teal-400' : 'text-gray-900 dark:text-gray-100'}`}>
        {title}
      </h3>
    </div>
  );
}
