import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Plus, Search, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function DepartmentHeadConversations() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDoctorSelector, setShowDoctorSelector] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/conversations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Không thể tải danh sách cuộc hội thoại');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Using existing endpoint to get doctors
      const response = await axios.get(`${API}/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Không thể tải danh sách bác sĩ');
    }
  };

  const handleNewConversation = async (doctorId) => {
    setCreatingChat(true);
    try {
      // Dept Head chatting with Doctor -> send doctor_id as target
      // In create_conversation logic: if Dept Head sends doctor_id, it treats it as target
      const response = await axios.post(
        `${API}/conversations/create`,
        { doctor_id: doctorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Đã tạo cuộc hội thoại mới!');
      setShowDoctorSelector(false);
      
      // Navigate to the new conversation
      navigate(`/department-head/conversation/${response.data.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error(error.response?.data?.detail || 'Không thể tạo cuộc hội thoại');
    } finally {
      setCreatingChat(false);
    }
  };

  const openDoctorSelector = () => {
    setShowDoctorSelector(true);
    fetchDoctors();
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.email && doctor.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cuộc hội thoại</h1>
              <p className="text-gray-600 dark:text-gray-400">Trò chuyện với bác sĩ</p>
            </div>
            
            <Dialog open={showDoctorSelector} onOpenChange={setShowDoctorSelector}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openDoctorSelector}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Cuộc hội thoại mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Chọn bác sĩ để trò chuyện</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Tìm kiếm bác sĩ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {filteredDoctors.map(doctor => (
                      <DoctorCard 
                        key={doctor.user_id || doctor.id} 
                        doctor={doctor} 
                        onSelect={handleNewConversation}
                        creating={creatingChat}
                      />
                    ))}
                    
                    {filteredDoctors.length === 0 && (
                      <p className="text-center text-gray-500 py-8">Không tìm thấy bác sĩ</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center">
              <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chưa có cuộc hội thoại</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Bắt đầu cuộc hội thoại mới với bác sĩ
              </p>
              <Button 
                onClick={openDoctorSelector}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tạo cuộc hội thoại mới
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map(conversation => (
                <ConversationCard 
                  key={conversation.id} 
                  conversation={conversation} 
                  navigate={navigate}
                  formatTime={formatRelativeTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ConversationCard({ conversation, navigate, formatTime }) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-teal-500"
      onClick={() => navigate(`/department-head/conversation/${conversation.id}`)}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
              {conversation.other_user_name || 'Bác sĩ'}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
              <Clock className="w-3 h-3 inline mr-1" />
              {formatTime(conversation.last_message_at)}
            </span>
          </div>
          
          {conversation.last_message && (
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {conversation.last_message}
            </p>
          )}
          
          {!conversation.last_message && (
            <p className="text-sm text-gray-400 italic">Bắt đầu cuộc hội thoại...</p>
          )}
        </div>
        
        <MessageSquare className="w-6 h-6 text-teal-500 flex-shrink-0" />
      </div>
    </div>
  );
}

function DoctorCard({ doctor, onSelect, creating }) {
  return (
    <div 
      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-all border border-transparent hover:border-teal-500"
      onClick={() => !creating && onSelect(doctor.user_id || doctor.id)}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
            {doctor.full_name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {doctor.specialty_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {doctor.email}
          </p>
        </div>
        
        {creating ? (
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent"></div>
        ) : (
          <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
            Chọn
          </Button>
        )}
      </div>
    </div>
  );
}
