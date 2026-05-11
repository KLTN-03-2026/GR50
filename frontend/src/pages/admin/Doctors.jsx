import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Search, CheckCircle, XCircle, Clock, Trash2, Calendar, Plus, Building2, Stethoscope } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminDoctors() {
  const { token, user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Schedule Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [statusFilter, searchQuery, doctors]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API}/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (error) {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleApprove = async (doctorId, status) => {
    try {
      await axios.put(`${API}/admin/doctors/${doctorId}/approve?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(status === 'approved' ? t('updateSuccess') : t('updateSuccess'));
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('updateError'));
    }
  };

  const handleDelete = async (doctorId, doctorName) => {
    if (!window.confirm(`${t('confirmDeleteUser')} ${doctorName}?`)) return;

    try {
      await axios.delete(`${API}/admin/delete-user/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('userDeleted'));
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('cannotDeleteUser'));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Quản lý <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600">{t('doctorManagement')}</span>
            </h1>
            <Button 
              onClick={() => setShowQuickSchedule(true)}
              className="rounded-2xl h-14 px-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              PHÂN CÔNG LỊCH NHANH (BẰNG ID)
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    data-testid="search-input"
                    placeholder={t('searchDoctors')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="approved">{t('approved')}</SelectItem>
                    <SelectItem value="rejected">{t('rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{t('loading')}</p>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map(doctor => (
                <DoctorCard 
                  key={doctor.user_id} 
                  doctor={doctor} 
                  onApprove={handleApprove} 
                  onDelete={handleDelete} 
                  onManageSchedule={(doc) => {
                    setSelectedDoctor(doc);
                    setShowScheduleModal(true);
                  }}
                  t={t} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showScheduleModal && selectedDoctor && (
        <DoctorScheduleModal 
          doctor={selectedDoctor} 
          open={showScheduleModal} 
          onClose={() => setShowScheduleModal(false)}
          token={token}
          adminUser={user}
        />
      )}

      {showQuickSchedule && (
        <QuickScheduleModal 
          open={showQuickSchedule} 
          onClose={() => setShowQuickSchedule(false)}
          token={token}
          adminUser={user}
        />
      )}
    </Layout>
  );
}

function DoctorCard({ doctor, onApprove, onDelete, onManageSchedule, t }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-transparent hover:border-teal-100">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="flex gap-4 flex-1">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
            {doctor.full_name?.charAt(0) || 'D'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">{doctor.full_name || t('doctor')}</h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${statusColors[doctor.status]}`}>
                {statusIcons[doctor.status]}
                {t(doctor.status)}
              </span>
            </div>
            {doctor.email && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-medium">
                {doctor.email}
              </p>
            )}

            {doctor.specialty_name && (
              <p className="text-teal-600 font-bold text-sm mb-2 flex items-center gap-1">
                <Stethoscope className="w-4 h-4" />
                {t('specialty')}: {doctor.specialty_name}
              </p>
            )}
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-2 font-bold uppercase tracking-wider">
              {doctor.experience_years > 0 && (
                <span className="bg-gray-50 px-2 py-0.5 rounded-md">{doctor.experience_years} {t('years')} {t('experience')}</span>
              )}
              {doctor.consultation_fee > 0 && (
                <span className="bg-gray-50 px-2 py-0.5 rounded-md text-indigo-600">{t('fee')}: {doctor.consultation_fee.toLocaleString()} VNĐ</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            onClick={() => onManageSchedule(doctor)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-1.5" />
            Quản lý lịch
          </Button>

          {doctor.status === 'pending' && (
            <>
              <Button
                data-testid={`approve-${doctor.user_id}`}
                onClick={() => onApprove(doctor.user_id, 'approved')}
                className="bg-teal-600 hover:bg-teal-700"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {t('approve')}
              </Button>
              <Button
                data-testid={`reject-${doctor.user_id}`}
                onClick={() => onApprove(doctor.user_id, 'rejected')}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                {t('reject')}
              </Button>
            </>
          )}
          <Button
            onClick={() => onDelete(doctor.user_id, doctor.full_name)}
            variant="ghost"
            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuickScheduleModal({ open, onClose, token, adminUser }) {
  const [doctorId, setDoctorId] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [searching, setSearching] = useState(false);

  const fetchDoctorInfo = async () => {
    if (!doctorId) return;
    setSearching(true);
    try {
      const res = await axios.get(`${API}/doctors/${doctorId}`);
      setDoctorInfo(res.data);
    } catch (error) {
      toast.error('Không tìm thấy bác sĩ với ID này');
      setDoctorInfo(null);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xl">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-gray-900">Phân công lịch theo ID</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium text-lg italic">
                "Nhập ID bác sĩ để bắt đầu phân công lịch trực tại cơ sở."
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          <div className="flex gap-4 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-[10px] font-black uppercase text-indigo-400 ml-1">Nhập ID Bác sĩ</Label>
              <Input 
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="VD: 5"
                className="h-14 rounded-2xl border-none bg-white shadow-sm font-black text-xl text-indigo-600"
              />
            </div>
            <Button 
              onClick={fetchDoctorInfo}
              disabled={searching || !doctorId}
              className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200"
            >
              {searching ? 'Đang tìm...' : 'KIỂM TRA'}
            </Button>
          </div>

          {doctorInfo ? (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-4 p-6 bg-white rounded-[2rem] border-2 border-teal-100 shadow-xl shadow-teal-50 mb-8">
                <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white text-2xl font-black">
                  {doctorInfo.full_name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900">{doctorInfo.full_name}</h4>
                  <p className="text-teal-600 font-bold text-sm uppercase tracking-wider">{doctorInfo.specialty_name}</p>
                </div>
              </div>

              <DoctorScheduleModalContent 
                doctor={{ id: doctorId, full_name: doctorInfo.full_name, specialty_name: doctorInfo.specialty_name }}
                token={token}
                adminUser={adminUser}
              />
            </div>
          ) : doctorId && !searching && (
            <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
              <Clock className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">Vui lòng nhập ID bác sĩ hợp lệ để tiếp tục.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DoctorScheduleModal({ doctor, open, onClose, token, adminUser }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-gray-900">Phân công lịch khám</DialogTitle>
              <DialogDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-1">
                Bác sĩ: {doctor.full_name} (ID: {doctor.id})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DoctorScheduleModalContent doctor={doctor} token={token} adminUser={adminUser} />
      </DialogContent>
    </Dialog>
  );
}

function DoctorScheduleModalContent({ doctor, token, adminUser }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [facilities, setFacilities] = useState([]);
  
  const [newSchedule, setNewSchedule] = useState({
    doctor_id: doctor.id,
    facility_id: adminUser.facility_id || '',
    specialty_id: '',
    room_id: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '11:30',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: ''
  });

  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  useEffect(() => {
    fetchData();
  }, [doctor.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, specRes, facRes] = await Promise.all([
        axios.get(`${API}/admin/doctor-schedules?doctor_id=${doctor.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/specialties`),
        axios.get(`${API}/facilities`)
      ]);
      setSchedules(schedRes.data);
      setSpecialties(specRes.data);
      setFacilities(facRes.data);
      
      const doctorSpecialty = specRes.data.find(s => s.name === doctor.specialty_name);
      setNewSchedule(prev => ({
        ...prev,
        doctor_id: doctor.id,
        specialty_id: doctorSpecialty?.id || ''
      }));

    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu lịch trình');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/doctor-schedules`, newSchedule, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Thêm lịch khám thành công');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khi thêm lịch');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Xóa lịch làm việc này?')) return;
    try {
      await axios.delete(`${API}/admin/doctor-schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa lịch làm việc');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa lịch');
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Add Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm lịch mới
          </h3>
          
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500 ml-1">Cơ sở y tế</Label>
              <Select 
                value={newSchedule.facility_id?.toString()} 
                onValueChange={(v) => setNewSchedule({...newSchedule, facility_id: parseInt(v)})}
                disabled={!!adminUser.facility_id}
              >
                <SelectTrigger className="rounded-xl border-none bg-white shadow-sm h-11 font-bold">
                  <SelectValue placeholder="Chọn cơ sở" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  {facilities.map(f => (
                    <SelectItem key={f.id} value={f.id?.toString()}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500 ml-1">Chuyên khoa</Label>
              <Select 
                value={newSchedule.specialty_id?.toString()} 
                onValueChange={(v) => setNewSchedule({...newSchedule, specialty_id: parseInt(v)})}
              >
                <SelectTrigger className="rounded-xl border-none bg-white shadow-sm h-11 font-bold">
                  <SelectValue placeholder="Chọn chuyên khoa" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  {specialties.map(s => (
                    <SelectItem key={s.id} value={s.id?.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 ml-1">Thứ</Label>
                <Select 
                  value={newSchedule.dayOfWeek?.toString()} 
                  onValueChange={(v) => setNewSchedule({...newSchedule, dayOfWeek: parseInt(v)})}
                >
                  <SelectTrigger className="rounded-xl border-none bg-white shadow-sm h-11 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {[1,2,3,4,5,6,0].map(d => (
                      <SelectItem key={d} value={d.toString()}>{dayNames[d]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 ml-1">Phòng (Room ID)</Label>
                <Input 
                  className="rounded-xl border-none bg-white shadow-sm h-11 font-bold"
                  value={newSchedule.room_id}
                  onChange={(e) => setNewSchedule({...newSchedule, room_id: e.target.value})}
                  placeholder="VD: P101"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 ml-1">Giờ bắt đầu</Label>
                <Input 
                  type="time" 
                  className="rounded-xl border-none bg-white shadow-sm h-11 font-bold"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 ml-1">Giờ kết thúc</Label>
                <Input 
                  type="time" 
                  className="rounded-xl border-none bg-white shadow-sm h-11 font-bold"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!newSchedule.facility_id || !newSchedule.specialty_id}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-black shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              PHÂN CÔNG NGAY
            </Button>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-3 space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
          <span>Danh sách lịch đã gán</span>
          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[9px]">{schedules.length} LỊCH</span>
        </h3>

        {loading ? (
          <div className="py-20 text-center text-gray-300 font-bold">Đang tải lịch...</div>
        ) : schedules.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">Chưa có lịch khám nào được gán.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map(s => (
              <div key={s.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-black leading-none">
                    <span className="text-[8px] uppercase">{s.dayOfWeek !== undefined && dayNames[s.dayOfWeek] ? dayNames[s.dayOfWeek].substring(0, 3) : '??'}</span>
                    <span className="text-sm">{s.dayOfWeek === 0 ? 'CN' : (s.dayOfWeek !== undefined ? s.dayOfWeek + 1 : '?')}</span>
                  </div>
                  <div>
                    <div className="font-black text-gray-900 flex items-center gap-2">
                      {s.startTime?.substring(0, 5) || '??:??'} - {s.endTime?.substring(0, 5) || '??:??'}
                      {s.room_id && <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase tracking-tighter">Phòng {s.room_id}</span>}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {s.facility?.TenPhongKham}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteSchedule(s.id)}
                  className="text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
