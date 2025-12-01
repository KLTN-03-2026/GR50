import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MessageSquare, Video } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';

import ReviewDialog from '@/components/ReviewDialog';
import { Star } from 'lucide-react';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    doctorId: null,
    doctorName: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      toast.error('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (doctorId, doctorName) => {
    setReviewDialog({
      open: true,
      doctorId,
      doctorName
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lịch hẹn của tôi</h1>
            <Button data-testid="search-doctors-btn" onClick={() => navigate('/patient/search-doctors')} className="bg-gradient-to-r from-teal-500 to-cyan-500">
              Đặt lịch mới
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Đang tải...</p>
          ) : appointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center">
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chưa có lịch hẹn</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Bắt đầu tìm kiếm bác sĩ và đặt lịch khám</p>
              <Button data-testid="start-search-btn" onClick={() => navigate('/patient/search-doctors')} className="bg-gradient-to-r from-teal-500 to-cyan-500">
                Tìm bác sĩ ngay
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  navigate={navigate}
                  onReview={() => handleOpenReview(apt.doctor_id, apt.doctor_name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ReviewDialog
        open={reviewDialog.open}
        onOpenChange={(open) => setReviewDialog(prev => ({ ...prev, open }))}
        doctorId={reviewDialog.doctorId}
        doctorName={reviewDialog.doctorName}
      />
    </Layout>
  );
}

function AppointmentCard({ appointment, navigate, onReview }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const statusText = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{appointment.doctor_name || 'Bác sĩ'}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[appointment.status]}`}>
              {statusText[appointment.status]}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4 inline mr-2" />
              {appointment.appointment_date}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 inline mr-2" />
              {appointment.appointment_time}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Loại: <span className="font-semibold">{appointment.appointment_type === 'online' ? 'Tư vấn online' : 'Khám trực tiếp'}</span>
            </p>
            {appointment.symptoms && (
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Triệu chứng: {appointment.symptoms}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {appointment.status === 'completed' && (
            <Button
              onClick={onReview}
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <Star className="w-4 h-4 mr-2" />
              Đánh giá
            </Button>
          )}

          {appointment.appointment_type === 'online' && (appointment.status === 'confirmed' || appointment.status === 'completed') && (
            <>
              <Button
                data-testid={`chat-btn-${appointment.id}`}
                onClick={() => navigate(`/patient/chat/${appointment.id}`)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button
                onClick={() => window.open(`https://meet.jit.si/bookingcare-appointment-${appointment.id}`, '_blank')}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Video className="w-4 h-4 mr-2" />
                Gọi Video
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
