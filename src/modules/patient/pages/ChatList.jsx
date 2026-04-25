import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { MessageSquare, Calendar, Clock, User } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';

export default function PatientChatList() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
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
      // Chỉ lấy các appointment có thể chat (online và đã confirmed/completed)
      const chatableAppointments = response.data.filter(
        apt => apt.appointment_type === 'online' && 
               (apt.status === 'confirmed' || apt.status === 'completed')
      );
      setAppointments(chatableAppointments);
    } catch (error) {
      toast.error('Không thể tải danh sách chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tin nhắn</h1>
            <Button onClick={() => navigate('/patient/appointments')} variant="outline">
              Quay lại lịch hẹn
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Đang tải...</p>
          ) : appointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center">
              <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chưa có cuộc trò chuyện</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Bạn cần có lịch hẹn online được xác nhận để có thể chat với bác sĩ
              </p>
              <Button onClick={() => navigate('/patient/search-doctors')} className="bg-gradient-to-r from-teal-500 to-cyan-500">
                Đặt lịch ngay
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(apt => (
                <ChatCard key={apt.id} appointment={apt} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ChatCard({ appointment, navigate }) {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const statusText = {
    confirmed: 'Đang hoạt động',
    completed: 'Đã hoàn thành'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
         onClick={() => navigate(`/patient/chat/${appointment.id}`)}>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">{appointment.doctor_name || 'Bác sĩ'}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[appointment.status]}`}>
                {statusText[appointment.status]}
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <Calendar className="w-4 h-4 inline mr-2" />
                {appointment.appointment_date}
              </p>
              <p>
                <Clock className="w-4 h-4 inline mr-2" />
                {appointment.appointment_time}
              </p>
            </div>
          </div>
        </div>
        
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-500">
          <MessageSquare className="w-4 h-4 mr-2" />
          Mở chat
        </Button>
      </div>
    </div>
  );
}
