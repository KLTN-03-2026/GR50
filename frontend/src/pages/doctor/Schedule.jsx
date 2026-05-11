import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Plus, Clock, Building2, Globe, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DoctorSchedule() {
  const { token } = useContext(AuthContext);
  const [facilitySchedules, setFacilitySchedules] = useState([]);
  const [onlineSchedules, setOnlineSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API}/doctors/my-schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFacilitySchedules(response.data.facilitySchedules || []);
      setOnlineSchedules(response.data.onlineSchedules || []);
    } catch (error) {
      toast.error('Không thể tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  const addOnlineRow = () => {
    setOnlineSchedules([...onlineSchedules, { 
      id: `new-${Date.now()}`, 
      dayOfWeek: 1, 
      startTime: '08:00', 
      endTime: '17:00' 
    }]);
  };

  const updateOnlineRow = (idx, field, value) => {
    const newSched = [...onlineSchedules];
    newSched[idx][field] = value;
    setOnlineSchedules(newSched);
  };

  const saveOnlineSchedule = async () => {
    setSaving(true);
    try {
      const payload = onlineSchedules.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: (s.startTime?.substring(0, 5) || "08:00") + ":00",
        endTime: (s.endTime?.substring(0, 5) || "17:00") + ":00"
      }));

      await axios.put(`${API}/doctors/online-slots/bulk`, { slots: payload }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Lịch làm việc đã được cập nhật thành công!');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khi cập nhật lịch làm việc');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em]">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <Clock className="w-4 h-4 fill-indigo-600" />
              </div>
              MediSched Operation Console • Schedule Management
            </div>
            <h1 className="text-5xl font-black tracking-tight text-gray-900 leading-none">
              Quản lý <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Lịch làm việc</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-xl text-lg italic">
              "Tối ưu hóa thời gian khám bệnh, tách biệt lịch trực tại cơ sở và tư vấn từ xa."
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl p-3 rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-white/50">
             <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                <span>Tuần hiện tại</span>
             </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StatsCard title="Lịch tại cơ sở" value={facilitySchedules.length} icon={Building2} color="bg-indigo-600" desc="Điểm khám cố định" />
            <StatsCard title="Lịch Online" value={onlineSchedules.length} icon={Globe} color="bg-teal-500" desc="Tư vấn từ xa" />
            <StatsCard title="Tổng khung giờ" value={facilitySchedules.length + onlineSchedules.length} icon={Clock} color="bg-blue-600" desc="Năng suất làm việc" />
        </div>

        <Tabs defaultValue="facility" className="space-y-8">
          <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl w-full md:w-auto inline-flex shadow-inner">
            <TabsTrigger 
              value="facility" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm px-8 py-2.5 font-bold transition-all"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Lịch tại cơ sở
            </TabsTrigger>
            <TabsTrigger 
              value="online" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm px-8 py-2.5 font-bold transition-all"
            >
              <Globe className="w-4 h-4 mr-2" />
              Tư vấn Online
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facility" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-lg shadow-indigo-100/50 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b bg-indigo-50/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 rounded-2xl">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Lịch trực tại cơ sở y tế</CardTitle>
                    <CardDescription>Các ca khám trực tiếp được phân công bởi Quản trị viên.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-8">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800 font-medium">
                    Đây là lịch làm việc cố định do Cơ sở y tế sắp xếp. Bác sĩ không thể tự ý thay đổi hoặc xóa các khung giờ này. Vui lòng liên hệ Admin nếu có sai sót.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facilitySchedules.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                      <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Chưa có lịch phân công</h3>
                      <p className="text-slate-500">Quản trị viên chưa gán lịch khám cho bạn tại cơ sở nào.</p>
                    </div>
                  ) : (
                    facilitySchedules.map((s) => (
                      <div key={s.id} className="group relative bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
                        <div className="flex justify-between items-center mb-4">
                          <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md shadow-indigo-200">
                            {dayNames[s.dayOfWeek]}
                          </div>
                          <div className="flex items-center text-slate-700 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-xl">
                            <Clock className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                            {s.startTime?.substring(0, 5) || '??:??'} - {s.endTime?.substring(0, 5) || '??:??'}
                          </div>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                          {s.facility?.TenPhongKham}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-slate-500 font-medium">
                            <div className="w-2 h-2 bg-slate-300 rounded-full mr-2"></div>
                            Phòng khám: <span className="text-slate-900 ml-1">{s.roomId || 'Sảnh chờ'}</span>
                          </div>
                          {s.specialty && (
                            <div className="flex items-center text-sm text-slate-500 font-medium">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                              Chuyên khoa: <span className="text-indigo-600 ml-1 font-bold">{s.specialty.TenChuyenKhoa}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="online" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-2xl shadow-indigo-100/50 rounded-[3rem] overflow-hidden bg-white/90 backdrop-blur-md">
              <CardHeader className="p-10 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-teal-100 rounded-[1.5rem]">
                      <Globe className="w-8 h-8 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-gray-900">Lịch tư vấn Online</CardTitle>
                      <CardDescription className="text-gray-500 font-medium">Tùy chỉnh khung giờ bạn có thể hỗ trợ bệnh nhân từ xa.</CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={addOnlineRow}
                    className="rounded-2xl h-14 px-8 bg-teal-500 hover:bg-teal-600 text-white font-black shadow-lg shadow-teal-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    THÊM KHUNG GIỜ
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-6">
                <div className="space-y-4">
                  {onlineSchedules.map((s, idx) => (
                    <div key={s.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/50">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày</label>
                        <Select 
                          value={s.dayOfWeek.toString()} 
                          onValueChange={(val) => updateOnlineRow(idx, 'dayOfWeek', parseInt(val))}
                        >
                          <SelectTrigger className="h-14 rounded-2xl border-none bg-white shadow-sm font-bold text-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            {dayNames.map((name, i) => (
                              <SelectItem key={i} value={i.toString()} className="rounded-xl font-medium">
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giờ bắt đầu</label>
                        <div className="relative">
                          <Input 
                            type="time" 
                            value={s.startTime?.substring(0, 5) || ''}
                            onChange={(e) => updateOnlineRow(idx, 'startTime', e.target.value)}
                            className="h-14 rounded-2xl border-none bg-white shadow-sm font-bold text-gray-700 pr-12 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                          />
                          <Clock className="w-5 h-5 text-gray-300 absolute right-4 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giờ kết thúc</label>
                        <div className="relative">
                          <Input 
                            type="time" 
                            value={s.endTime?.substring(0, 5) || ''}
                            onChange={(e) => updateOnlineRow(idx, 'endTime', e.target.value)}
                            className="h-14 rounded-2xl border-none bg-white shadow-sm font-bold text-gray-700 pr-12 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                          />
                          <Clock className="w-5 h-5 text-gray-300 absolute right-4 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 flex justify-center">
                  <Button 
                    onClick={saveOnlineSchedule}
                    disabled={saving}
                    className="w-full md:w-auto rounded-3xl h-16 px-20 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-black text-lg shadow-2xl shadow-teal-200 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu lịch làm việc'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
