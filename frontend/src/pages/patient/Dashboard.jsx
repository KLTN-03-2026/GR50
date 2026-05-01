import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Clock, Brain, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    aiSessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aptRes, statsRes] = await Promise.all([
        axios.get(`${API}/appointments/my`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/patients/dashboard-stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAppointments(aptRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextAppointment = appointments.find(a => a.status === 'confirmed' || a.status === 'pending');
  const recentAppointments = appointments.filter(a => a.id !== nextAppointment?.id).slice(0, 3);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('greeting')}, {user?.full_name}!</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{t('welcomeToMediSchedule')}</p>
          </div>

          {/* Statistics Component (Rule 12.5) */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-l-4 border-l-teal-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm font-semibold">Lịch hẹn sắp tới</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.upcomingAppointments}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-l-4 border-l-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm font-semibold">Đã hoàn thành</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.completedAppointments}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border-l-4 border-l-purple-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm font-semibold">Phiên tư vấn AI</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.aiSessions}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Brain className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid md:grid-cols-3 gap-8">

            {/* Left Column: Next Appointment + Recent */}
            <div className="md:col-span-2 space-y-8">

              {/* Next Appointment Card */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <Activity className="w-32 h-32" />
                </div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6" /> Lịch khám sắp tới
                </h2>

                {loading ? (
                  <p>Đang tải...</p>
                ) : nextAppointment ? (
                  <div>
                    <h3 className="text-3xl font-bold mb-2">{nextAppointment.doctor_name || 'Bác sĩ'}</h3>
                    <p className="text-teal-100 text-lg mb-6">
                      {nextAppointment.appointment_date} - {nextAppointment.appointment_time} ({nextAppointment.appointment_type === 'online' ? 'Online' : 'Trực tiếp'})
                    </p>
                    <div className="flex gap-4">
                      {nextAppointment.status === 'pending' && (
                        <Button onClick={() => navigate(`/patient/appointments`)} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-none">
                          Chờ xác nhận / Thanh toán
                        </Button>
                      )}
                      {nextAppointment.status === 'confirmed' && nextAppointment.appointment_type === 'online' && (
                        <Button onClick={() => navigate(`/patient/appointments`)} className="bg-white text-teal-600 hover:bg-teal-50">
                          Vào phòng khám
                        </Button>
                      )}
                      {nextAppointment.status === 'confirmed' && nextAppointment.appointment_type !== 'online' && (
                        <Button variant="outline" className="bg-white/20 text-white border-none cursor-default">
                          Đã xác nhận
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-teal-100 text-lg mb-6">Bạn chưa có lịch khám sắp tới nào.</p>
                    <Button onClick={() => navigate('/patient/search-doctors')} className="bg-white text-teal-600 hover:bg-teal-50">
                      Đặt lịch khám ngay
                    </Button>
                  </div>
                )}
              </div>

              {/* Recent Appointments */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lịch sử khám bệnh</h2>
                  <Button variant="outline" onClick={() => navigate('/patient/appointments')}>
                    Xem tất cả
                  </Button>
                </div>

                {!loading && recentAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Không có lịch sử khám bệnh cũ.</p>
                ) : (
                  <div className="space-y-4">
                    {recentAppointments.map(apt => (
                      <AppointmentCard key={apt.id} appointment={apt} navigate={navigate} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Quick Actions */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thao tác nhanh</h2>
              <QuickActionCard
                icon={<Search className="w-7 h-7" />}
                title={t('findDoctor')}
                description="Tìm bác sĩ phù hợp theo chuyên khoa"
                onClick={() => navigate('/patient/search-doctors')}
                gradient="from-blue-500 to-indigo-500"
              />
              <QuickActionCard
                icon={<Brain className="w-7 h-7" />}
                title="Tư vấn AI"
                description="Kiểm tra triệu chứng sơ bộ với Trí tuệ Nhân tạo"
                onClick={() => window.dispatchEvent(new Event('toggle-floating-chat'))}
                gradient="from-purple-500 to-pink-500"
              />
              <QuickActionCard
                icon={<Calendar className="w-7 h-7" />}
                title="Quản lý Lịch hẹn"
                description="Hủy lịch, thanh toán, hoặc gọi video"
                onClick={() => navigate('/patient/appointments')}
                gradient="from-teal-500 to-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function QuickActionCard({ icon, title, description, onClick, gradient }) {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 h-full flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="text-gray-900 dark:text-white font-bold">{title}</h3>
          <p className="text-gray-500 text-sm leading-tight mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, navigate }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  const statusText = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành'
  };

  return (
    <div className="border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{appointment.doctor_name || 'Bác sĩ'}</h3>
        <p className="text-teal-600 text-xs font-semibold">{appointment.specialty_name}</p>
        <p className="text-gray-500 text-sm mt-1">
          {appointment.facility_name} • {appointment.appointment_date} - {appointment.appointment_time}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[appointment.status]}`}>
          {statusText[appointment.status]}
        </span>
      </div>
    </div>
  );
}
