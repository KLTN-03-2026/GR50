import React, { useState, useEffect, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { 
  Search, 
  Stethoscope, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon, 
  ChevronRight,
  Filter,
  Star,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { useLocation } from 'react-router-dom';

export default function ReceptionBookingAssist() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromUrl = queryParams.get('patientId');

  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  
  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);

  useEffect(() => {
    fetchData();
    if (patientIdFromUrl) {
      fetchPatientInfo();
    }
  }, [patientIdFromUrl]);

  const fetchPatientInfo = async () => {
    try {
      const res = await axios.get(`${API}/staff/patients/${patientIdFromUrl}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientInfo(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, specRes] = await Promise.all([
        axios.get(`${API}/doctors`),
        axios.get(`${API}/specialties`)
      ]);
      setDoctors(docRes.data);
      setSpecialties(specRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Lỗi khi tải dữ liệu bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (doctorId, date) => {
    try {
      const res = await axios.get(`${API}/appointments/slots?doctorId=${doctorId}&date=${date}`);
      setAvailableSlots(res.data);
    } catch (e) { toast.error('Không thể lấy lịch trống'); }
  };

  const handleOpenBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
    fetchSlots(doctor.id, bookingDate);
  };

  const handleCreateBooking = async () => {
    if (!selectedSlot || !patientIdFromUrl) {
      toast.error('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    try {
      await axios.post(`${API}/staff/appointments`, {
        patientId: patientIdFromUrl,
        slotId: selectedSlot.id,
        note: 'Đặt bởi nhân viên hỗ trợ'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tạo lịch hẹn thành công!');
      setShowBookingModal(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khi tạo lịch hẹn');
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty_id === parseInt(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hỗ Trợ Đặt Lịch</h1>
            {patientInfo && (
              <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Đang hỗ trợ: {patientInfo.full_name} (ID: {patientInfo.id})
              </Badge>
            )}
            <p className="text-gray-500 dark:text-gray-400 mt-1">Tìm kiếm bác sĩ và tạo lịch hẹn nhanh cho bệnh nhân.</p>
          </div>
        </div>

        {/* ... (Search bar remains same) */}
        <Card className="border-none shadow-md dark:bg-gray-800 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="Tìm bác sĩ theo tên..." 
                  className="pl-10 h-12 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <select 
                  className="w-full h-12 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 px-4 focus:ring-2 focus:ring-teal-500 outline-none"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option value="all">Tất cả chuyên khoa</option>
                  {specialties.map(s => (
                    <option key={s.Id_ChuyenKhoa} value={s.Id_ChuyenKhoa}>{s.TenChuyenKhoa}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />)
          ) : filteredDoctors.map((doc) => (
            <Card key={doc.id} className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 dark:bg-gray-800 rounded-3xl group overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  {/* ... (Doctor info same) */}
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 dark:border-gray-700">
                      <img 
                        src={doc.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.full_name)}&background=random`} 
                        alt={doc.full_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <Badge className="bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-none mb-1">
                        {doc.specialty_name}
                      </Badge>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {doc.full_name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">4.9 (120+)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{doc.experience_years} năm kinh nghiệm</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doc.consultation_fee)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleOpenBooking(doc)}
                    className="w-full mt-8 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg transition-all py-6"
                  >
                    Hỗ trợ tạo lịch hẹn
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <Card className="w-full max-w-2xl border-none shadow-2xl dark:bg-gray-800 animate-in zoom-in-95 duration-200 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <CalendarIcon className="w-7 h-7" />
                Tạo Lịch Hẹn Hỗ Trợ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Bác sĩ</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">BS. {selectedDoctor?.full_name}</p>
                    <p className="text-sm text-teal-600 font-medium">{selectedDoctor?.specialty_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Bệnh nhân</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{patientInfo?.full_name || 'Đang tải...'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider block">Chọn ngày khám</label>
                  <Input 
                    type="date" 
                    value={bookingDate} 
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      fetchSlots(selectedDoctor.id, e.target.value);
                    }}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider block">Chọn khung giờ trống</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-xl h-12 transition-all ${selectedSlot?.id === slot.id ? 'bg-teal-600 border-none shadow-md' : ''}`}
                      >
                        {slot.time}
                      </Button>
                    ))
                  ) : (
                    <div className="col-span-full py-6 text-center text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                      Không có khung giờ nào khả dụng trong ngày này.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 dark:border-gray-700">
                <Button variant="ghost" onClick={() => setShowBookingModal(false)} className="rounded-xl px-8 h-12">Hủy</Button>
                <Button 
                  onClick={handleCreateBooking}
                  disabled={!selectedSlot}
                  className="bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl px-10 h-12 shadow-lg hover:shadow-xl transition-all"
                >
                  Xác nhận đặt lịch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}
