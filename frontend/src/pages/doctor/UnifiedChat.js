import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Bot, User, Send, Loader2, Search, Plus, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// --- AI Chat Component ---
function AIChatTab() {
  const { user, token } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/ai/chat`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('AI Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 flex items-center gap-3 text-white">
        <div className="bg-white/20 p-2 rounded-full">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Trợ lý AI</h3>
          <p className="text-xs text-teal-100 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Luôn sẵn sàng hỗ trợ
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'}
            `}>
              {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </div>
            <div className={`
              max-w-[80%] rounded-2xl px-6 py-3 text-base leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none'}
            `}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-6 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
              <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSend} className="flex gap-3">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi trợ lý AI..."
            className="flex-1 h-12 text-base focus-visible:ring-teal-500"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="h-12 w-12 bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// --- Conversations Component ---
function ConversationsTab() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [patients, setPatients] = useState([]);
  const [departmentHeads, setDepartmentHeads] = useState([]);
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'dept_heads'
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

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API}/patients/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Không thể tải danh sách bệnh nhân');
    }
  };

  const fetchDepartmentHeads = async () => {
    try {
      const response = await axios.get(`${API}/doctors/department-heads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartmentHeads(response.data);
    } catch (error) {
      console.error('Error fetching department heads:', error);
      toast.error('Không thể tải danh sách trưởng khoa');
    }
  };

  const handleNewConversation = async (userId, type = 'patient') => {
    setCreatingChat(true);
    try {
      const payload = type === 'patient' 
        ? { patient_id: userId }
        : { doctor_id: userId }; // For Dept Head, we send doctor_id
        
      const response = await axios.post(
        `${API}/conversations/create`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Đã tạo cuộc hội thoại mới!');
      setShowPatientSelector(false);
      
      // Navigate to the new conversation
      navigate(`/doctor/conversation/${response.data.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error(error.response?.data?.detail || 'Không thể tạo cuộc hội thoại');
    } finally {
      setCreatingChat(false);
    }
  };

  const openPatientSelector = () => {
    setShowPatientSelector(true);
    fetchPatients();
    fetchDepartmentHeads();
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDeptHeads = departmentHeads.filter(dh =>
    dh.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dh.email && dh.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Danh sách hội thoại</h2>
        <Dialog open={showPatientSelector} onOpenChange={setShowPatientSelector}>
          <DialogTrigger asChild>
            <Button 
              onClick={openPatientSelector}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Cuộc hội thoại mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Chọn người để trò chuyện</DialogTitle>
            </DialogHeader>
            
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                className={`pb-2 px-4 font-medium ${activeTab === 'patients' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('patients')}
              >
                Bệnh nhân
              </button>
              <button
                className={`pb-2 px-4 font-medium ${activeTab === 'dept_heads' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('dept_heads')}
              >
                Trưởng khoa
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder={activeTab === 'patients' ? "Tìm kiếm bệnh nhân..." : "Tìm kiếm trưởng khoa..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {activeTab === 'patients' ? (
                  <>
                    {filteredPatients.map(patient => (
                      <UserCard 
                        key={patient.id} 
                        user={patient} 
                        onSelect={(id) => handleNewConversation(id, 'patient')}
                        creating={creatingChat}
                      />
                    ))}
                    {filteredPatients.length === 0 && (
                      <p className="text-center text-gray-500 py-8">Không tìm thấy bệnh nhân</p>
                    )}
                  </>
                ) : (
                  <>
                    {filteredDeptHeads.map(dh => (
                      <UserCard 
                        key={dh.id} 
                        user={dh} 
                        onSelect={(id) => handleNewConversation(id, 'dept_head')}
                        creating={creatingChat}
                      />
                    ))}
                    {filteredDeptHeads.length === 0 && (
                      <p className="text-center text-gray-500 py-8">Không tìm thấy trưởng khoa</p>
                    )}
                  </>
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
          <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chưa có cuộc hội thoại</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Bắt đầu cuộc hội thoại mới
          </p>
          <Button 
            onClick={openPatientSelector}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo cuộc hội thoại mới
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
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
  );
}

function ConversationCard({ conversation, navigate, formatTime }) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-teal-500"
      onClick={() => navigate(`/doctor/conversation/${conversation.id}`)}
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
              {conversation.other_user_name || 'Người dùng'}
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
        
        <MessageCircle className="w-6 h-6 text-teal-500 flex-shrink-0" />
      </div>
    </div>
  );
}

function UserCard({ user, onSelect, creating }) {
  return (
    <div 
      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-all border border-transparent hover:border-teal-500"
      onClick={() => !creating && onSelect(user.id)}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
            {user.full_name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {user.email}
          </p>
          {user.phone && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.phone}
            </p>
          )}
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

// --- Main Unified Page ---
export default function DoctorUnifiedChat() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('conversations'); // 'ai' or 'conversations'

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trung tâm Tin nhắn</h1>
            <p className="text-gray-600 dark:text-gray-400">Quản lý trò chuyện với Bệnh nhân, Trưởng khoa và AI</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-1">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`pb-3 px-4 font-medium transition-all relative ${
                activeTab === 'conversations' 
                  ? 'text-teal-600 dark:text-teal-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Trò chuyện
              {activeTab === 'conversations' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-3 px-4 font-medium transition-all relative ${
                activeTab === 'ai' 
                  ? 'text-teal-600 dark:text-teal-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Trợ lý AI
              {activeTab === 'ai' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 rounded-t-full"></span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {activeTab === 'ai' ? <AIChatTab /> : <ConversationsTab />}
          </div>
        </div>
      </div>
    </Layout>
  );
}
