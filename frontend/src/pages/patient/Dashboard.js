import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, API } from '@/App';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('greeting')}, {user?.full_name}!</h1>
            <p className="text-gray-600 mt-1">{t('welcomeToMediSchedule')}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <QuickActionCard
              icon={<Search className="w-8 h-8" />}
              title={t('findDoctor')}
              description={t('findDoctorDesc')}
              onClick={() => navigate('/patient/search-doctors')}
              testId="search-doctors-card"
            />
            <QuickActionCard
              icon={<Calendar className="w-8 h-8" />}
              title={t('appointments')}
              description={t('appointmentsDesc')}
              onClick={() => navigate('/patient/appointments')}
              testId="appointments-card"
            />
            <QuickActionCard
              icon={<Clock className="w-8 h-8" />}
              title={t('history')}
              description={t('historyDesc')}
              onClick={() => navigate('/patient/appointments')}
              testId="history-card"
            />
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('recentAppointments')}</h2>
              <Button data-testid="view-all-appointments-btn" variant="outline" onClick={() => navigate('/patient/appointments')}>
                {t('viewAll')}
              </Button>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-8">{t('loading')}</p>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{t('noAppointmentsYet')}</p>
                <Button data-testid="book-now-btn" onClick={() => navigate('/patient/search-doctors')} className="bg-gradient-to-r from-teal-500 to-cyan-500">
                  {t('bookNow')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} token={token} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function QuickActionCard({ icon, title, description, onClick, testId }) {
  return (
    <div
      data-testid={testId}
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-1"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function AppointmentCard({ appointment, token }) {
  const navigate = useNavigate();
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
    <div className="border border-gray-200 rounded-xl p-4 hover:border-teal-300 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-lg text-gray-900">{appointment.doctor_name || 'Bác sĩ'}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[appointment.status]}`}>
              {statusText[appointment.status]}
            </span>
          </div>
          <p className="text-gray-600 mb-1">
            <Clock className="w-4 h-4 inline mr-2" />
            {appointment.appointment_date} - {appointment.appointment_time}
          </p>
          <p className="text-gray-500 text-sm">
            Loại: {appointment.appointment_type === 'online' ? 'Tư vấn online' : 'Khám trực tiếp'}
          </p>
        </div>
        {appointment.appointment_type === 'online' && appointment.status === 'confirmed' && (
          <Button data-testid={`chat-btn-${appointment.id}`} size="sm" onClick={() => navigate(`/patient/chat/${appointment.id}`)} className="bg-gradient-to-r from-teal-500 to-cyan-500">
            Chat
          </Button>
        )}
      </div>
    </div>
  );
}
