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
import { 
  UserPlus, Eye, EyeOff, Users, Stethoscope, Shield, 
  Building2, Plus, Trash2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getErrorMessage } from '@/utils/errorHandler';

export default function CreateAccounts() {
  const { token } = useContext(AuthContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [facilities, setFacilities] = useState([]);
  
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
    // Staff fields
    employee_code: '',
    position_title: '',
    // Multi-facility selection
    selectedFacilities: [] 
  });

  useEffect(() => {
    fetchSpecialties();
    fetchFacilities();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${API}/specialties`);
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await axios.get(`${API}/facilities`);
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const handleAddFacility = () => {
    if (formData.selectedFacilities.length >= facilities.length) return;
    
    const newFacilityAssignment = {
      facility_id: '',
      is_active: true,
      // For doctors
      is_primary: formData.selectedFacilities.length === 0,
      supports_online: true,
      supports_offline: true,
      consultation_fee_online: 0,
      consultation_fee_offline: 0,
      // For staff
      can_reception: false,
      can_booking_assist: false,
      can_manage_appointments: false,
      can_handle_payments: false,
      can_support_chat: false,
      can_access_triage_queue: false,
      can_video_support: false
    };

    setFormData({
      ...formData,
      selectedFacilities: [...formData.selectedFacilities, newFacilityAssignment]
    });
  };

  const handleRemoveFacility = (index) => {
    const updated = [...formData.selectedFacilities];
    updated.splice(index, 1);
    setFormData({ ...formData, selectedFacilities: updated });
  };

  const handleFacilityChange = (index, field, value) => {
    const updated = [...formData.selectedFacilities];
    updated[index][field] = value;
    
    // Ensure only one primary facility
    if (field === 'is_primary' && value === true) {
      updated.forEach((f, i) => {
        if (i !== index) f.is_primary = false;
      });
    }
    
    setFormData({ ...formData, selectedFacilities: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error('Vui lòng chọn loại tài khoản');
      return;
    }

    // Validation: Doctor and Staff MUST have at least 1 facility
    if (['doctor', 'staff'].includes(selectedRole)) {
      if (formData.selectedFacilities.length === 0) {
        toast.error(`Vui lòng gán ít nhất một cơ sở y tế cho ${selectedRole === 'doctor' ? 'Bác sĩ' : 'Nhân viên'}`);
        return;
      }
      
      const incomplete = formData.selectedFacilities.some(f => !f.facility_id);
      if (incomplete) {
        toast.error('Vui lòng chọn tên cơ sở cho tất cả các mục đã gán');
        return;
      }

      if (selectedRole === 'doctor' && !formData.specialty_id) {
        toast.error('Vui lòng chọn chuyên khoa cho bác sĩ');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        role: selectedRole,
        facilities: formData.selectedFacilities
      };

      if (selectedRole === 'doctor') {
        payload.specialty_id = formData.specialty_id;
        payload.bio = formData.bio;
        payload.experience_years = parseInt(formData.experience_years) || 0;
      }

      if (selectedRole === 'staff') {
        payload.employee_code = formData.employee_code;
        payload.position_title = formData.position_title;
      }

      await axios.post(`${API}/admin/create-user`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Tạo tài khoản ${getRoleName(selectedRole)} thành công!`);
      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tạo tài khoản'));
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
      employee_code: '',
      position_title: '',
      selectedFacilities: []
    });
  };

  const getRoleName = (role) => {
    const names = { patient: 'Bệnh nhân', doctor: 'Bác sĩ', staff: 'Nhân viên' };
    return names[role] || role;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Tạo Tài Khoản</h1>
            <p className="text-gray-600 dark:text-gray-400">Gán quyền và cơ sở y tế cho đội ngũ nhân sự</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <Label className="text-lg font-bold mb-4 block">1. Chọn loại tài khoản</Label>
            <div className="grid md:grid-cols-3 gap-4">
              <RoleCard
                icon={<Users />}
                title="Bệnh nhân"
                selected={selectedRole === 'patient'}
                onClick={() => setSelectedRole('patient')}
              />
              <RoleCard
                icon={<Stethoscope />}
                title="Bác sĩ"
                selected={selectedRole === 'doctor'}
                onClick={() => setSelectedRole('doctor')}
              />
              <RoleCard
                icon={<Shield />}
                title="Nhân viên / Lễ tân"
                selected={selectedRole === 'staff'}
                onClick={() => setSelectedRole('staff')}
              />
            </div>
          </div>

          {selectedRole && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section A: Basic Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <UserPlus className="w-5 h-5" />
                   </div>
                   Thông tin cơ bản
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Họ và tên *</Label>
                    <Input 
                      value={formData.full_name} 
                      onChange={e => setFormData({...formData, full_name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mật khẩu tạm *</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Section B/C: Doctor Specifics */}
              {selectedRole === 'doctor' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    Thông tin chuyên môn
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Chuyên khoa chính *</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                        value={formData.specialty_id}
                        onChange={e => setFormData({...formData, specialty_id: e.target.value})}
                        required
                      >
                        <option value="">Chọn chuyên khoa</option>
                        {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Số năm kinh nghiệm</Label>
                      <Input 
                        type="number" 
                        value={formData.experience_years} 
                        onChange={e => setFormData({...formData, experience_years: e.target.value})} 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Giới thiệu ngắn</Label>
                      <textarea 
                        className="w-full p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[100px]"
                        value={formData.bio}
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section B/C: Staff Specifics */}
              {selectedRole === 'staff' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                        <Shield className="w-5 h-5" />
                    </div>
                    Thông tin nhân sự
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Mã nhân viên</Label>
                      <Input 
                        placeholder="Ví dụ: STF-123"
                        value={formData.employee_code} 
                        onChange={e => setFormData({...formData, employee_code: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Chức danh</Label>
                      <Input 
                        placeholder="Ví dụ: Lễ tân trưởng"
                        value={formData.position_title} 
                        onChange={e => setFormData({...formData, position_title: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section D: Multi-facility Assignment */}
              {['doctor', 'staff'].includes(selectedRole) && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                          <Building2 className="w-5 h-5" />
                      </div>
                      Gán cơ sở y tế & Phân quyền
                    </h2>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddFacility}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <Plus size={16} className="mr-1" /> Thêm cơ sở
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {formData.selectedFacilities.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed rounded-xl bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-gray-500 italic">Chưa có cơ sở nào được gán. Bấm nút "Thêm cơ sở" để bắt đầu.</p>
                      </div>
                    ) : (
                      formData.selectedFacilities.map((assignment, idx) => (
                        <div key={idx} className="p-5 border rounded-xl relative bg-white dark:bg-gray-800/50 hover:border-orange-300 transition-colors">
                          <button 
                            type="button"
                            onClick={() => handleRemoveFacility(idx)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>

                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <Label>Tên cơ sở y tế *</Label>
                              <select 
                                className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                value={assignment.facility_id}
                                onChange={e => handleFacilityChange(idx, 'facility_id', e.target.value)}
                                required
                              >
                                <option value="">Chọn cơ sở</option>
                                {facilities.map(f => (
                                  <option 
                                    key={f.id} 
                                    value={f.id}
                                    disabled={formData.selectedFacilities.some((sf, sidx) => sf.facility_id === f.id && sidx !== idx)}
                                  >
                                    {f.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-6 md:col-span-2 pt-8">
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`primary-${idx}`} 
                                  checked={assignment.is_primary}
                                  onCheckedChange={val => handleFacilityChange(idx, 'is_primary', val)}
                                />
                                <Label htmlFor={`primary-${idx}`} className="cursor-pointer">Cơ sở chính</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`active-${idx}`} 
                                  checked={assignment.is_active}
                                  onCheckedChange={val => handleFacilityChange(idx, 'is_active', val)}
                                />
                                <Label htmlFor={`active-${idx}`} className="cursor-pointer">Kích hoạt tại cơ sở</Label>
                              </div>
                            </div>

                            {/* Role Specific Settings Per Facility */}
                            {selectedRole === 'doctor' && (
                              <div className="md:col-span-3 grid md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-dashed">
                                <div className="space-y-4">
                                  <Label className="text-teal-600 font-bold block mb-2">Hình thức khám</Label>
                                  <div className="flex gap-6">
                                    <div className="flex items-center gap-2">
                                      <Checkbox 
                                        id={`online-${idx}`} 
                                        checked={assignment.supports_online}
                                        onCheckedChange={val => handleFacilityChange(idx, 'supports_online', val)}
                                      />
                                      <Label htmlFor={`online-${idx}`}>Khám Online</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Checkbox 
                                        id={`offline-${idx}`} 
                                        checked={assignment.supports_offline}
                                        onCheckedChange={val => handleFacilityChange(idx, 'supports_offline', val)}
                                      />
                                      <Label htmlFor={`offline-${idx}`}>Khám Trực tiếp</Label>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Phí Online</Label>
                                    <Input 
                                      type="number" 
                                      value={assignment.consultation_fee_online}
                                      onChange={e => handleFacilityChange(idx, 'consultation_fee_online', e.target.value)}
                                      placeholder="VNĐ"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Phí Trực tiếp</Label>
                                    <Input 
                                      type="number" 
                                      value={assignment.consultation_fee_offline}
                                      onChange={e => handleFacilityChange(idx, 'consultation_fee_offline', e.target.value)}
                                      placeholder="VNĐ"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedRole === 'staff' && (
                              <div className="md:col-span-3 mt-4 pt-4 border-t border-dashed">
                                <Label className="text-indigo-600 font-bold block mb-4">Quyền vận hành tại cơ sở này</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                                  <PermissionToggle 
                                    label="Tiếp nhận bệnh" 
                                    checked={assignment.can_reception}
                                    onChange={val => handleFacilityChange(idx, 'can_reception', val)}
                                  />
                                  <PermissionToggle 
                                    label="Hỗ trợ đặt lịch" 
                                    checked={assignment.can_booking_assist}
                                    onChange={val => handleFacilityChange(idx, 'can_booking_assist', val)}
                                  />
                                  <PermissionToggle 
                                    label="Điều phối lịch" 
                                    checked={assignment.can_manage_appointments}
                                    onChange={val => handleFacilityChange(idx, 'can_manage_appointments', val)}
                                  />
                                  <PermissionToggle 
                                    label="Hỗ trợ thanh toán" 
                                    checked={assignment.can_handle_payments}
                                    onChange={val => handleFacilityChange(idx, 'can_handle_payments', val)}
                                  />
                                  <PermissionToggle 
                                    label="Support Chat" 
                                    checked={assignment.can_support_chat}
                                    onChange={val => handleFacilityChange(idx, 'can_support_chat', val)}
                                  />
                                  <PermissionToggle 
                                    label="Triage Queue" 
                                    checked={assignment.can_access_triage_queue}
                                    onChange={val => handleFacilityChange(idx, 'can_access_triage_queue', val)}
                                  />
                                  <PermissionToggle 
                                    label="Video Support" 
                                    checked={assignment.can_video_support}
                                    onChange={val => handleFacilityChange(idx, 'can_video_support', val)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pb-12">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="px-8"
                >
                  Hủy / Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 px-10 shadow-lg shadow-cyan-500/20"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} />
                      Tạo & Kích hoạt tài khoản
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

function RoleCard({ icon, title, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
        selected 
          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-800'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
        selected 
          ? 'bg-cyan-500 text-white' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
      }`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <h3 className={`font-bold text-lg ${selected ? 'text-cyan-700 dark:text-cyan-400' : 'text-gray-900 dark:text-white'}`}>
        {title}
      </h3>
    </div>
  );
}

function PermissionToggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/40 p-2 px-3 rounded-lg border border-gray-100 dark:border-gray-800">
      <Checkbox 
        id={label} 
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor={label} className="text-xs cursor-pointer select-none">{label}</Label>
    </div>
  );
}
