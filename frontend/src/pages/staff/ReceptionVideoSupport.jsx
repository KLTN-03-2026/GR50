import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import ChatService from '@/services/ChatService';
import { 
  Video, 
  Monitor, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Search,
  Wifi,
  Users,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ReceptionVideoSupport() {
  const { token, currentFacility } = useContext(AuthContext);

  const navigate = useNavigate();
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && currentFacility) {
        fetchSessions();
    }
  }, [currentFacility, token]);


  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/staff/online-consultations?facility_id=${currentFacility.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveSessions(response.data);

    } catch (error) {
      console.error('Failed to fetch online sessions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportEnter = async (appointmentId) => {
    try {
      toast.loading('Đang kết nối phòng...', { id: 'enter-room' });
      const conv = await ChatService.getOrCreateAppointmentConversation(token, appointmentId);
      toast.dismiss('enter-room');
      navigate(`/staff/conversation/${conv.id}`);
    } catch (error) {
      console.error('Error entering room:', error);
      toast.error('Không thể vào phòng hỗ trợ', { id: 'enter-room' });
    }
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hỗ Trợ Khám Online</h1>
          <p className="text-gray-500 dark:text-gray-400">Giám sát và hỗ trợ kỹ thuật cho các buổi khám từ xa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSessions.map((session) => (
            <Card key={session.id} className="border-none shadow-lg dark:bg-gray-800 rounded-3xl overflow-hidden group">
              <CardHeader className="bg-gray-50 dark:bg-gray-700/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-teal-600" />
                  <span className="font-bold text-sm">Phòng khám #{session.id}</span>
                </div>
                <Badge className={session.status === 'In Progress' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                  {session.status === 'In Progress' ? 'Đang diễn ra' : 'Chờ bắt đầu'}
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{session.patient}</span>
                    </div>
                    <span className="text-xs text-gray-400">Bệnh nhân</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{session.doctor}</span>
                    </div>
                    <span className="text-xs text-gray-400">Bác sĩ</span>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-emerald-500" />
                      <span>Kết nối: {session.quality}</span>
                    </div>
                    <span>Bắt đầu: 10:00 AM</span>
                  </div>

                  <div className="pt-6 flex gap-2">
                    <Button 
                      onClick={() => handleSupportEnter(session.id)}
                      className="flex-1 rounded-xl bg-teal-500 hover:bg-teal-600 text-white shadow-md"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Hỗ trợ vào phòng
                    </Button>
                    <Button 
                      onClick={() => handleSupportEnter(session.id)}
                      variant="outline" 
                      size="icon" 
                      className="rounded-xl"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
