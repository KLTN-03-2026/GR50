import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Clock, 
  AlertCircle, 
  Building, 
  Video, 
  MessageSquare, 
  FileText, 
  Stethoscope, 
  Video as VideoIcon,
  Search,
  Settings,
  Sparkles,
  ChevronRight,
  Zap,
  ShieldCheck,
  LayoutDashboard,
  Brain,
  Activity
} from 'lucide-react';
import Layout from '@/components/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, token, currentFacility } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(user?.facilities?.[0]?.id?.toString() || '');

  useEffect(() => {
    if (token && user?.id) fetchData();
  }, [selectedFacility, user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const facilityQuery = selectedFacility && selectedFacility !== 'all' && selectedFacility !== '' ? `?facility_id=${selectedFacility}` : '';
      const url = `${API}/appointments/my${facilityQuery}`;
      const [appointmentsRes, profileRes] = await Promise.all([
        axios.get(url, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/doctors/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAppointments(appointmentsRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !token) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-gray-400 uppercase text-xs tracking-widest animate-pulse">Đang đồng bộ dữ liệu bác sĩ...</p>
        </div>
      </div>
    );
  }

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const todayCount = appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length;

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
        
        {/* Luxury Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-teal-600 font-black text-[10px] uppercase tracking-[0.3em]">
                <div className="p-1.5 bg-teal-100 rounded-lg">
                    <LayoutDashboard className="w-4 h-4 fill-teal-600" />
                </div>
                MediSched Clinical Hub
             </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">
              Chào buổi sáng, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">BS. {user?.full_name}</span>!
            </h1>
            <p className="text-gray-500 font-medium text-lg italic">"{user?.specialty_name || 'Bác sĩ nội khoa'} • {currentFacility?.name || 'Cơ sở y tế liên kết'}"</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center bg-white/80 backdrop-blur-xl p-3 rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-white/50">
                <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className={`w-3 h-3 rounded-full ${profile?.TrangThaiVanHanh === 'AVAILABLE' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-red-500'} animate-pulse`} />
                  <Select 
                    value={profile?.TrangThaiVanHanh || 'AVAILABLE'} 
                    onValueChange={async (val) => {
                      try {
                        await axios.put(`${API}/doctors/operational-status`, { status: val }, { headers: { Authorization: `Bearer ${token}` } });
                        fetchData();
                        toast.success(`Đã chuyển sang trạng thái ${val}`);
                      } catch (e) { toast.error("Không thể cập nhật trạng thái"); }
                    }}
                  >
                    <SelectTrigger className="w-[140px] border-none bg-transparent h-auto p-0 focus:ring-0 shadow-none text-xs font-black uppercase tracking-[0.2em] text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl overflow-hidden">
                      <SelectItem value="AVAILABLE" className="font-black text-[10px] py-3 tracking-widest">🟢 SẴN SÀNG</SelectItem>
                      <SelectItem value="BUSY" className="font-black text-[10px] py-3 tracking-widest">🔴 ĐANG KHÁM</SelectItem>
                      <SelectItem value="ON_BREAK" className="font-black text-[10px] py-3 tracking-widest">🟡 NGHỈ NGƠI</SelectItem>
                      <SelectItem value="OFFLINE" className="font-black text-[10px] py-3 tracking-widest">⚪ NGOẠI TUYẾN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-10 w-px bg-gray-100 mx-2" />

                {user?.facilities && user.facilities.length > 0 && (
                    <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                        <SelectTrigger className="w-[240px] bg-transparent border-none focus:ring-0 font-black text-xs uppercase tracking-widest text-gray-500 hover:text-teal-600 transition-colors">
                            <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-teal-500" />
                                <SelectValue placeholder="CƠ SỞ Y TẾ" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl overflow-hidden">
                            {user.facilities.map((fac) => (
                            <SelectItem key={fac.id} value={fac.id.toString()} className="font-black text-[10px] py-3 tracking-widest">
                                {fac.name.toUpperCase()}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-gray-400 hover:text-teal-600 hover:bg-teal-50" onClick={() => navigate('/doctor/profile')}>
                    <Settings className="w-6 h-6" />
                </Button>
          </div>
        </div>

        {/* High-Impact Verification Banner */}
        {profile?.status === 'pending' && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3rem] p-10 shadow-2xl shadow-orange-200 flex items-center gap-8 animate-in zoom-in duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl text-white shrink-0 border border-white/20">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-3xl font-black text-white tracking-tight leading-none">Chờ phê duyệt vận hành</h3>
              <p className="text-white/80 font-bold text-lg max-w-2xl">Hồ sơ chuyên môn của bạn đang được hội đồng quản trị thẩm định. Bạn có thể thiết lập lịch khám nhưng chưa thể tiếp nhận bệnh nhân trực tuyến.</p>
            </div>
            <Button onClick={() => navigate('/doctor/profile')} className="bg-white text-orange-600 hover:bg-orange-50 font-black rounded-2xl px-10 h-16 shadow-2xl transition-all active:scale-95">
              HOÀN THIỆN HỒ SƠ
            </Button>
          </div>
        )}

        {/* Stats Grid - Luxury Soft UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatsCard title="Lịch hôm nay" value={todayCount} icon={Calendar} color="bg-teal-500" desc="Sẵn sàng khám bệnh" />
          <StatsCard title="Chờ xác nhận" value={pendingCount} icon={Clock} color="bg-amber-500" desc="Yêu cầu đặt lịch mới" />
          <StatsCard title="Hiệu suất tháng" value={appointments.length} icon={Activity} color="bg-blue-600" desc="Bệnh nhân đã tiếp nhận" />
          <StatsCard title="Chẩn đoán AI" value={appointments.filter(a => a.ai_diagnosis).length} icon={Brain} color="bg-indigo-600" desc="Hỗ trợ phân tích triệu chứng" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">
            {/* Clinical Tools - Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ClinicalToolCard
                  title="Phòng khám Video"
                  desc="Khai thác triệu chứng qua Telehealth, kê đơn điện tử và chia sẻ cận lâm sàng."
                  icon={VideoIcon}
                  color="from-blue-600 to-indigo-700"
                  onClick={() => navigate('/doctor/appointments')}
                  badge="HD LIVE"
              />
              <ClinicalToolCard
                  title="Hệ thống Chat 2.0"
                  desc="Tư vấn bệnh lý trực tiếp, hỗ trợ gửi tài liệu y khoa và mẫu câu trả lời nhanh."
                  icon={MessageSquare}
                  color="from-teal-600 to-cyan-700"
                  onClick={() => navigate('/doctor/conversations')}
                  badge="STABLE"
              />
              <ClinicalToolCard
                  title="Lịch sử Bệnh án"
                  desc="Truy xuất dữ liệu lâm sàng, tiền sử dị ứng và lịch sử dùng thuốc của bệnh nhân."
                  icon={FileText}
                  color="from-emerald-600 to-teal-700"
                  onClick={() => navigate('/doctor/medical-records')}
              />
              <ClinicalToolCard
                  title="Thẩm định AI"
                  desc="Phê duyệt các gợi ý phân tích từ AI MediSched để cải thiện độ chính xác lâm sàng."
                  icon={Brain}
                  color="from-indigo-600 to-purple-700"
                  onClick={() => navigate('/doctor/ai-diagnoses')}
                  badge="INTELLIGENCE"
              />
            </div>

            {/* Reception List - Premium Aesthetic */}
            <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] rounded-[3rem] bg-white overflow-hidden p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tiếp nhận lâm sàng</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-teal-500" /> Bệnh nhân gần đây nhất
                  </p>
                </div>
                <Button variant="ghost" className="text-teal-600 font-black text-xs uppercase tracking-widest hover:bg-teal-50 rounded-2xl h-12 px-6" onClick={() => navigate('/doctor/appointments')}>
                  Tất cả hồ sơ <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50/50 animate-pulse rounded-3xl" />)}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/30 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
                    <Calendar className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Không có lịch tiếp nhận</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-6 rounded-[2rem] border border-transparent hover:border-teal-100 hover:bg-teal-50/30 transition-all group cursor-pointer" onClick={() => navigate('/doctor/appointments')}>
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600 flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-105 transition-transform">
                          {apt.patient_name?.charAt(0) || 'P'}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-gray-900 group-hover:text-teal-700 transition-colors text-lg tracking-tight">{apt.patient_name}</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5" /> {apt.appointment_time}
                            </div>
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-gray-100 text-gray-400">{apt.appointment_type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         {apt.ai_diagnosis && <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] tracking-widest">AI CHECKED</Badge>}
                         <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                           <ChevronRight className="w-6 h-6 text-teal-600" />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            
            <Card className="border-none shadow-2xl bg-[#0F172A] text-white rounded-[3rem] overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-125 transition-transform duration-700" />
              <CardContent className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                   <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/10">
                      <Calendar className="w-7 h-7 text-teal-400" />
                   </div>
                   <Badge className="bg-teal-500/20 text-teal-400 border-none font-black text-[10px] px-3 tracking-widest">OP-CONSOLE</Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Cấu hình Vận hành</h3>
                  <p className="text-gray-400 font-medium leading-relaxed">Quản lý thời lượng khám bệnh và đồng bộ lịch biểu của bạn.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/5">
                    <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Thời lượng</p>
                    <p className="text-3xl font-black text-white">{user?.appointment_duration || '20'}<span className="text-xs ml-1 opacity-50">m</span></p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/5">
                    <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Hạn ngạch</p>
                    <p className="text-3xl font-black text-white">{user?.max_patients || '15'}<span className="text-xs ml-1 opacity-50">/ca</span></p>
                  </div>
                </div>
                <Button onClick={() => navigate('/doctor/schedule')} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black h-16 rounded-2xl shadow-2xl shadow-teal-500/20 transition-all active:scale-95">
                  THIẾT LẬP LỊCH BIỂU
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] rounded-[3rem] bg-white p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase text-[11px] tracking-widest">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        Gợi ý Lâm sàng AI
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                </div>
                
                <div className="space-y-4">
                  {appointments.filter(a => a.ai_diagnosis).length > 0 ? (
                    appointments.filter(a => a.ai_diagnosis).slice(0, 2).map(apt => (
                      <div key={apt.id} className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 group cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-100" onClick={() => navigate('/doctor/ai-diagnoses')}>
                        <p className="text-[10px] font-black text-indigo-600 uppercase mb-2 tracking-widest flex items-center justify-between">
                            {apt.patient_name}
                            <ChevronRight className="w-3 h-3" />
                        </p>
                        <p className="text-sm text-gray-700 font-bold leading-relaxed line-clamp-2 italic">"{apt.ai_diagnosis}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-gray-50/50 rounded-3xl border border-gray-100">
                      <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Đang cập nhật...</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full rounded-2xl border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white font-black text-xs uppercase tracking-widest h-14 transition-all" onClick={() => navigate('/doctor/ai-diagnoses')}>
                    Tất cả phân tích AI
                  </Button>
                </div>
            </Card>

          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatsCard({ title, value, icon: Icon, color, desc }) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
           <div className={`w-16 h-16 rounded-[1.5rem] ${color} text-white shadow-2xl shadow-current/20 flex items-center justify-center group-hover:rotate-6 transition-transform duration-500`}>
              <Icon className="w-8 h-8" />
           </div>
           <div className="text-5xl font-black text-gray-900 tracking-tighter">
             {value}
           </div>
        </div>
        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</h4>
        <p className="text-xs text-gray-500 font-bold opacity-60 tracking-tight">{desc}</p>
      </CardContent>
    </Card>
  );
}

function ClinicalToolCard({ title, desc, icon: Icon, color, onClick, badge }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.08)] hover:border-teal-200 transition-all group cursor-pointer relative overflow-hidden h-full flex flex-col justify-between animate-in zoom-in duration-500"
    >
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-bl-full`} />
      
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:-rotate-6 transition-transform duration-500`}>
            <Icon className="w-10 h-10" />
          </div>
          {badge && (
            <Badge className="bg-teal-50 text-teal-600 border-teal-100 font-black text-[10px] px-3 h-6 tracking-[0.2em]">{badge}</Badge>
          )}
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-teal-600 transition-colors tracking-tight leading-none">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed font-bold opacity-80">{desc}</p>
      </div>

      <div className="mt-10 flex items-center gap-3 text-teal-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
        Truy cập hệ thống <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
