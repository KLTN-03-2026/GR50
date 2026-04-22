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
  Building
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

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [selectedFacility, setSelectedFacility] = useState(user?.facilities?.[0]?.id?.toString() || 'all');
  const [stats, setStats] = useState({
    appointments_today: 0,
    waiting_patients: 0,
    active_doctors: 0,
    pending_confirmations: 0,
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  useEffect(() => {
    if (token) fetchStats();
  }, [selectedFacility]);

  const fetchStats = async () => {
    try {
      const facilityQuery = selectedFacility && selectedFacility !== 'all' ? `?facility_id=${selectedFacility}` : '';
      const url = `${API}/staff/dashboard-stats${facilityQuery}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Hẹn hôm nay', 
      value: stats.appointments_today, 
      icon: Calendar, 
      color: 'bg-blue-500', 
      desc: 'Tổng số lịch hẹn trong ngày' 
    },
    { 
      title: 'Đang chờ khám', 
      value: stats.waiting_patients, 
      icon: Clock, 
      color: 'bg-amber-500', 
      desc: 'Bệnh nhân đã check-in' 
    },
    { 
      title: 'Bác sĩ trực', 
      value: stats.active_doctors, 
      icon: UserCheck, 
      color: 'bg-emerald-500', 
      desc: 'Bác sĩ đang sẵn sàng' 
    },
    { 
      title: 'Chờ xác nhận', 
      value: stats.pending_confirmations, 
      icon: Activity, 
      color: 'bg-indigo-500', 
      desc: 'Yêu cầu đặt lịch mới' 
    }
  ];

  return (
    <Layout>
      <div className="p-8 space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Vận Hành</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Tổng quan hoạt động tiếp nhận và điều phối hôm nay.</p>
          </div>
          <div className="flex gap-3 items-center">
            {user?.facilities && user.facilities.length > 0 && (
                <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                  <SelectTrigger className="w-[200px] bg-white">
                    <Building className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Tất cả cơ sở" />
                  </SelectTrigger>
                  <SelectContent>
                    {user.facilities.length > 1 && <SelectItem value="all">Tất cả cơ sở</SelectItem>}
                    {user.facilities.map((fac) => (
                      <SelectItem key={fac.id} value={fac.id.toString()}>
                        {fac.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            )}
            <Button 
              onClick={() => navigate('/staff/patients')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md hover:shadow-lg transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              Tiếp nhận mới
            </Button>
            <Button variant="outline" className="dark:bg-gray-800" onClick={() => window.print()}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all dark:bg-gray-800 group">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center text-emerald-500 text-sm font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      +12%
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.title}</h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {loading ? '...' : stat.value}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{stat.desc}</p>
                  </div>
                </div>
                <div className={`h-1 w-full ${stat.color} opacity-20`} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-none shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Luồng vận hành hôm nay</CardTitle>
              <CardDescription>Danh sách bệnh nhân vừa check-in hoặc đang chờ điều phối</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_activity?.length > 0 ? (
                  stats.recent_activity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-sm">
                          {item.patient_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{item.patient_name}</p>
                          <p className="text-xs text-gray-500">{item.specialty} • {item.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => navigate('/staff/appointments')}>Điều phối</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-gray-500">Chưa có hoạt động nào hôm nay.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Helpers */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-teal-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Trạng thái hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm opacity-90">Hệ thống đang hoạt động ổn định. Tải hiện tại: <strong>{stats.system_status}</strong></p>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[35%]" />
                </div>
                <Button 
                  onClick={() => setIsLoadModalOpen(true)}
                  className="w-full bg-white text-blue-600 hover:bg-gray-100 border-none font-bold"
                >
                  Xem chi tiết tải
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  Cần chú ý
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.late_appointments_count > 0 && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{stats.late_appointments_count} ca trễ giờ khám</p>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900" onClick={() => navigate('/staff/payments')}>
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium cursor-pointer">{stats.unpaid_invoices_count} hóa đơn chưa thanh toán</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* System Load Detail Modal */}
      <Dialog open={isLoadModalOpen} onOpenChange={setIsLoadModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              Chi Tiết Tải Hệ Thống
            </DialogTitle>
            <DialogDescription>
              Thông số vận hành thực tế của máy chủ và cơ sở dữ liệu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">CPU Usage</p>
                <p className="text-xl font-black text-blue-600">24%</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Memory</p>
                <p className="text-xl font-black text-emerald-600">1.2 GB / 4 GB</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">DB Latency</p>
                <p className="text-xl font-black text-amber-600">12ms</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Active Req</p>
                <p className="text-xl font-black text-indigo-600">42 req/s</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tình trạng Database</span>
                <span className="text-emerald-500 font-bold">Ổn định (Healthy)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[95%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tình trạng AI Service</span>
                <span className="text-blue-500 font-bold">Sẵn sàng (Ready)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[88%]" />
              </div>
            </div>

            <Button className="w-full rounded-xl bg-gray-900 dark:bg-gray-700 hover:bg-gray-800" onClick={() => setIsLoadModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
