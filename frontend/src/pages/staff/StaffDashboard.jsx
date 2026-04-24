import React, { useState, useEffect, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  UserCheck,
  CreditCard,
  Building,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { token, user, currentFacility, changeFacility } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  useEffect(() => {
    if (token && currentFacility) {
        fetchStats();
    }
  }, [currentFacility, token]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const url = `${API}/staff/dashboard-stats?facility_id=${currentFacility.id}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail || 'Bạn không có quyền truy cập cơ sở này.');
      } else {
        console.error('Failed to fetch stats', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityChange = (facId) => {
      const facility = user.facilities.find(f => f.id.toString() === facId);
      if (facility) {
          changeFacility(facility);
      }
  };

  if (!user?.facilities || user.facilities.length === 0) {
      return (
          <Layout>
              <div className="min-h-[80vh] flex items-center justify-center p-6">
                  <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl overflow-hidden">
                      <div className="bg-red-500 h-2 w-full" />
                      <CardContent className="p-8 text-center space-y-6">
                          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                              <AlertCircle className="w-10 h-10 text-red-500" />
                          </div>
                          <div className="space-y-2">
                              <h2 className="text-2xl font-black text-gray-900">Truy cập bị từ chối</h2>
                              <p className="text-gray-500">Tài khoản nhân viên của bạn chưa được gán cho bất kỳ cơ sở y tế nào hoặc tài khoản đã bị vô hiệu hóa.</p>
                          </div>
                          <p className="text-sm text-gray-400">Vui lòng liên hệ Quản trị viên hệ thống để được cấp quyền vận hành.</p>
                          <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate('/')}>Quay lại trang chủ</Button>
                      </CardContent>
                  </Card>
              </div>
          </Layout>
      );
  }

  const statCards = [
    { 
      title: 'Hẹn hôm nay', 
      value: stats?.appointments_today || 0, 
      icon: Calendar, 
      color: 'bg-blue-500', 
      desc: 'Tổng số lịch hẹn tại cơ sở' 
    },
    { 
      title: 'Đang chờ khám', 
      value: stats?.waiting_patients || 0, 
      icon: Clock, 
      color: 'bg-amber-500', 
      desc: 'Bệnh nhân đã check-in' 
    },
    { 
      title: 'Bác sĩ trực', 
      value: stats?.active_doctors || 0, 
      icon: UserCheck, 
      color: 'bg-emerald-500', 
      desc: 'Bác sĩ có lịch tại cơ sở' 
    },
    { 
      title: 'Chờ xác nhận', 
      value: stats?.pending_confirmations || 0, 
      icon: Activity, 
      color: 'bg-indigo-500', 
      desc: 'Lịch hẹn chưa duyệt' 
    }
  ];

  return (
    <Layout>
      <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-teal-600 font-bold text-sm uppercase tracking-widest">
                <ShieldCheck size={16} />
                Phạm vi vận hành
             </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
               {currentFacility?.name || 'Đang tải...'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Điều phối hoạt động khám chữa bệnh tại chi nhánh hiện tại.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Button 
                  onClick={() => navigate('/staff/patients')}
                  className="bg-teal-600 hover:bg-teal-700 shadow-md transition-all rounded-xl h-10"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Tiếp nhận mới
                </Button>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all dark:bg-gray-800 group rounded-3xl bg-white">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-current/20 transform group-hover:rotate-6 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">{stat.title}</h3>
                    <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                      {loading ? (
                          <div className="h-9 w-16 bg-gray-100 animate-pulse rounded-lg" />
                      ) : stat.value}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{stat.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity List */}
          <Card className="lg:col-span-2 border-none shadow-sm dark:bg-gray-800 rounded-3xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">Hàng chờ Vận hành</CardTitle>
                <CardDescription>Bệnh nhân đang có mặt tại cơ sở hôm nay</CardDescription>
              </div>
              <Button variant="ghost" className="text-teal-600 font-bold" onClick={() => navigate('/staff/appointments')}>
                 Xem tất cả <ChevronRight size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />)
                ) : stats?.recent_activity?.length > 0 ? (
                  stats.recent_activity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-teal-100 hover:bg-teal-50/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex flex-col items-center justify-center font-black">
                           <span className="text-[8px] uppercase opacity-60">STT</span>
                           <span className="text-lg leading-tight">{item.queue_number || '--'}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-teal-700 transition-colors">{item.patient_name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                             <span className="font-bold text-teal-600">{item.code}</span>
                             <span className="text-gray-300">|</span> 
                             <Stethoscope size={12} /> {item.specialty} 
                             <span className="text-gray-300">|</span> 
                             <Clock size={12} /> {item.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.status === 'CHECKED_IN' ? 'bg-indigo-100 text-indigo-700' : 
                          item.status === 'IN_PROGRESS' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>

                        <Button size="sm" variant="outline" className="rounded-lg border-gray-200" onClick={() => navigate('/staff/appointments')}>Chi tiết</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 space-y-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-medium">Chưa có lịch hẹn nào tại cơ sở này hôm nay.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Sidebar Widgets */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-teal-600 to-cyan-700 text-white rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Activity size={80} />
              </div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Vận hành Cơ sở
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold opacity-80">
                      <span>CÔNG SUẤT PHỤC VỤ</span>
                      <span>45%</span>
                   </div>
                   <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-white h-full w-[45%]" />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-white/10 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold opacity-70 uppercase">Phòng trống</p>
                      <p className="text-xl font-black">12</p>
                   </div>
                   <div className="bg-white/10 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold opacity-70 uppercase">Lễ tân online</p>
                      <p className="text-xl font-black">04</p>
                   </div>
                </div>

                <Button 
                  onClick={() => setIsLoadModalOpen(true)}
                  className="w-full bg-white text-teal-700 hover:bg-teal-50 border-none font-black rounded-xl"
                >
                  Chi tiết kỹ thuật
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm dark:bg-gray-800 rounded-3xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  Cần xử lý ngay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => navigate('/staff/payments')}>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Thanh toán</p>
                    <ArrowUpRight size={14} className="text-amber-500" />
                  </div>
                  <p className="text-lg font-black text-amber-900 dark:text-white mt-1">{stats?.unpaid_invoices_count || 0} Hóa đơn treo</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => navigate('/staff/triage-queue')}>
                   <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">AI Triage</p>
                    <ArrowUpRight size={14} className="text-blue-500" />
                  </div>
                  <p className="text-lg font-black text-blue-900 mt-1">Hàng chờ phân ca</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* System Load Detail Modal */}
      <Dialog open={isLoadModalOpen} onOpenChange={setIsLoadModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Activity className="w-6 h-6 text-teal-500" />
              Chỉ số Hệ thống
            </DialogTitle>
            <DialogDescription className="font-medium">
              Thông số kỹ thuật của cụm máy chủ và dịch vụ AI.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <LoadIndicator label="CPU Usage" value="24%" color="text-teal-600" />
              <LoadIndicator label="Memory" value="1.2 GB" color="text-blue-600" />
              <LoadIndicator label="DB Latency" value="12ms" color="text-amber-600" />
              <LoadIndicator label="Active Req" value="42 r/s" color="text-indigo-600" />
            </div>

            <div className="space-y-4 pt-2">
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                    <span>Database Status</span>
                    <span className="text-emerald-500">Healthy</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[95%]" />
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                    <span>AI Service</span>
                    <span className="text-blue-500">Ready</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[88%]" />
                  </div>
               </div>
            </div>

            <Button className="w-full rounded-2xl h-12 bg-gray-900 hover:bg-black font-bold text-white mt-4" onClick={() => setIsLoadModalOpen(false)}>
              Đóng thông tin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function LoadIndicator({ label, value, color }) {
    return (
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group hover:bg-white hover:shadow-md transition-all">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
        </div>
    );
}

function ChevronRight({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
    )
}
