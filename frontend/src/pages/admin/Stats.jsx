import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { 
  Users, Calendar, CheckCircle, XCircle, Clock, TrendingUp, 
  DollarSign, Activity, Building2, Filter, Download, 
  ArrowUpRight, ArrowDownRight, Stethoscope
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const COLORS = ['#0D9488', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];

export default function AdminStats() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    facility_id: ''
  });

  useEffect(() => {
    fetchFacilities();
    fetchStats();
  }, []);

  const fetchFacilities = async () => {
    try {
      const res = await axios.get(`${API}/facilities`);
      setFacilities(res.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.facility_id) params.append('facility_id', filters.facility_id);

      const response = await axios.get(`${API}/admin/detailed-stats?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Không thể tải thống kê chi tiết');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchStats();
  };

  if (loading && !stats) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 animate-pulse">Đang tổng hợp dữ liệu hệ thống...</p>
           </div>
        </div>
      </Layout>
    );
  }

  const appointmentData = stats ? [
    { name: 'Hoàn thành', value: stats.appointments.completed },
    { name: 'Đang chờ', value: stats.appointments.pending },
    { name: 'Đã hủy', value: stats.appointments.cancelled },
    { name: 'Đã xác nhận', value: stats.appointments.confirmed },
  ] : [];

  const consultationTypeData = stats ? [
    { name: 'Online', value: stats.appointments.online },
    { name: 'Trực tiếp', value: stats.appointments.offline },
  ] : [];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                <Activity className="text-teal-500" />
                Thống kê Hệ thống
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Theo dõi hiệu suất vận hành và doanh thu MediSched AI</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-2">
                 <Filter size={16} className="text-gray-400" />
                 <input 
                    type="date" 
                    name="from"
                    value={filters.from}
                    onChange={handleFilterChange}
                    className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer"
                 />
                 <span className="text-gray-300">|</span>
                 <input 
                    type="date" 
                    name="to"
                    value={filters.to}
                    onChange={handleFilterChange}
                    className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer"
                 />
               </div>
               <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
               <select 
                 name="facility_id"
                 value={filters.facility_id}
                 onChange={handleFilterChange}
                 className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer max-w-[200px]"
               >
                 <option value="">Tất cả cơ sở</option>
                 {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
               </select>
               <Button onClick={applyFilters} size="sm" className="bg-teal-600 hover:bg-teal-700">
                 Áp dụng
               </Button>
            </div>
          </div>

          <AnimatePresence mode='wait'>
            {stats && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Tổng Doanh thu" 
                    value={`${stats.revenue.total.toLocaleString()} đ`}
                    icon={<DollarSign />}
                    color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                    trend="+12.5%"
                  />
                  <StatCard 
                    title="Tổng Lịch hẹn" 
                    value={stats.appointments.total}
                    icon={<Calendar />}
                    color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    trend="+8.2%"
                  />
                  <StatCard 
                    title="Bệnh nhân mới" 
                    value={stats.users.patients}
                    icon={<Users />}
                    color="text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                    trend="+15.1%"
                  />
                  <StatCard 
                    title="Tư vấn AI" 
                    value={stats.ai.total_sessions}
                    icon={<Activity />}
                    color="text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                    trend="+24.3%"
                  />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <TrendingUp size={20} className="text-teal-500" />
                      Xu hướng Doanh thu (6 tháng gần nhất)
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.revenue.by_period}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6">Trạng thái lịch hẹn</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={appointmentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {appointmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Building2 size={20} className="text-blue-500" />
                      Lịch hẹn theo Chuyên khoa
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.specialties} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" axisLine={false} tickLine={false} hide />
                          <YAxis dataKey="specialty" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={120} />
                          <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="doctor_count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6">Loại hình khám</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                       <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={consultationTypeData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {consultationTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#0D9488' : '#3B82F6'} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: AI & Facilities Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-orange-500" />
                        Phễu chuyển đổi AI (Conversion)
                      </h3>
                      <div className="space-y-6">
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-sm text-gray-500">Tổng phiên tư vấn</p>
                               <p className="text-2xl font-bold">{stats.ai.total_sessions}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-sm text-gray-500">Chuyển đổi thành công</p>
                               <p className="text-2xl font-bold text-teal-600">{stats.ai.converted_to_booking}</p>
                            </div>
                         </div>
                         <div className="w-full bg-gray-100 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(stats.ai.converted_to_booking / (stats.ai.total_sessions || 1)) * 100}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="bg-teal-500 h-full"
                            />
                         </div>
                         <p className="text-sm text-center text-gray-500 italic">
                            Tỷ lệ chuyển đổi: {((stats.ai.converted_to_booking / (stats.ai.total_sessions || 1)) * 100).toFixed(1)}%
                         </p>
                      </div>
                   </div>

                   <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Building2 size={20} className="text-indigo-500" />
                        Xếp hạng hiệu suất Cơ sở
                      </h3>
                      <div className="space-y-4">
                         {stats.facilities.slice(0, 5).map((f, i) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40">
                              <div className="flex items-center gap-3">
                                 <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">{i+1}</span>
                                 <p className="font-medium text-sm">{f.TenPhongKham}</p>
                              </div>
                              <p className="text-sm font-bold">{f.count || 0} lịch hẹn</p>

                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon, color, trend }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
          <ArrowUpRight size={14} />
          {trend}
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
