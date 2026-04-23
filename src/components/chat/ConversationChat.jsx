import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import ChatService from '@/services/ChatService';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/config';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  Phone, 
  MoreVertical, 
  ChevronLeft,
  User,
  Loader2,
  Check,
  CheckCheck,
  Calendar,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ConversationChat({ role = 'patient' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    // Initialize Socket
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_conversation', id);
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
      if (message.sender_id !== user.id) {
        ChatService.markAsRead(token, id);
      }
    });

    newSocket.on('call_started', (data) => {
      toast.info('Cuộc gọi đang diễn ra...', {
        action: {
          label: 'Tham gia',
          onClick: () => navigate(`/${role}/video-consultation/${data.callSession.id}`)
        }
      });
    });

    return () => newSocket.disconnect();
  }, [id, user.id, token, role, navigate]);

  useEffect(() => {
    fetchData();
  }, [id, token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const convData = await ChatService.getConversationDetails(token, id);
      setConversation(convData);
      
      const msgsData = await ChatService.getMessages(token, id);
      setMessages(msgsData);
      
      ChatService.markAsRead(token, id);
    } catch (error) {
      console.error('Fetch chat error:', error);
      toast.error('Không thể tải nội dung cuộc hội thoại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    try {
      setSending(true);
      await ChatService.sendMessage(token, id, { content: input });
      setInput('');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleStartCall = async (type) => {
    try {
      const session = await ChatService.startCall(token, id, type);
      navigate(`/${role}/video-consultation/${session.id}`);
    } catch (error) {
      console.error('Start call error:', error);
      toast.error('Không thể bắt đầu cuộc gọi');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
        <p className="text-gray-500 font-medium">Đang kết nối...</p>
      </div>
    );
  }

  const otherParticipant = conversation?.participants.find(p => p.user_id !== user.id)?.user;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20">
              {otherParticipant?.AnhDaiDien ? (
                <img src={otherParticipant.AnhDaiDien} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                otherParticipant?.Ten?.charAt(0) || '?'
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {otherParticipant ? `${otherParticipant.Ho} ${otherParticipant.Ten}` : conversation?.title}
            </h3>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
              Đang trực tuyến
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation?.conversation_type === 'appointment_chat' && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleStartCall('audio')}
                className="text-gray-500 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full"
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleStartCall('video')}
                className="text-gray-500 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full"
              >
                <Video className="w-5 h-5" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="text-gray-500 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Appointment Context Info */}
      {conversation?.appointment && (
        <div className="px-6 py-2 bg-teal-50 dark:bg-teal-900/10 border-b border-teal-100 dark:border-teal-900/20 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">
              Lịch hẹn: {conversation.appointment.ThoiGianBatDau 
                ? format(new Date(conversation.appointment.ThoiGianBatDau), 'HH:mm - dd/MM/yyyy') 
                : conversation.appointment.MaDatLich || `#${conversation.appointment.Id_DatLich}`}
            </span>
          </div>
          <Button variant="link" size="sm" className="text-teal-600 p-0 h-auto font-semibold">
            Xem chi tiết
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/30"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((msg, idx) => {
          const isMine = msg.sender_id === user.id;
          const msgDate = new Date(msg.created_at || msg.createdAt || Date.now());
          const prevMsgDate = idx > 0 ? new Date(messages[idx-1].created_at || messages[idx-1].createdAt || Date.now()) : null;
          const showTime = idx === 0 || msgDate - prevMsgDate > 300000; // 5 mins

          if (msg.message_type === 'call_event') {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-1.5 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="space-y-1">
              {showTime && (
                <div className="text-center text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold mb-3">
                  {format(msgDate, 'HH:mm, dd MMMM', { locale: vi })}
                </div>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                <div className={`flex max-w-[80%] gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 self-end mb-1 overflow-hidden">
                      {msg.sender?.AnhDaiDien ? (
                        <img src={msg.sender.AnhDaiDien} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 m-1.5 text-gray-400" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    <div className={`
                      px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${isMine 
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'}
                    `}>
                      {msg.content}
                    </div>
                    
                    <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {format(msgDate, 'HH:mm')}
                      </span>
                      {isMine && (
                        <div className="text-teal-500">
                          {msg.DaDoc ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 focus-within:border-teal-500 dark:focus-within:border-teal-500 transition-all">
          <div className="flex gap-1 px-1">
            <Button type="button" variant="ghost" size="icon" className="w-10 h-10 rounded-full text-gray-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="w-10 h-10 rounded-full text-gray-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20">
              <ImageIcon className="w-5 h-5" />
            </Button>
          </div>
          
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base py-6 h-10"
          />
          
          <Button 
            type="submit" 
            disabled={!input.trim() || sending}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white w-12 h-12 rounded-xl shadow-lg shadow-teal-500/20 shrink-0"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
