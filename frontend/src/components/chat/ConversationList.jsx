import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import ChatService from '@/services/ChatService';
import { 
  MessageCircle, 
  Search, 
  Clock, 
  User, 
  Calendar, 
  ShieldAlert, 
  HelpCircle,
  MoreVertical,
  CheckCheck,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const CONVERSATION_TYPES = {
  appointment_chat: { label: 'Khám bệnh', icon: Calendar, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  support_chat: { label: 'Hỗ trợ', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  internal_chat: { label: 'Nội bộ', icon: ShieldAlert, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' }
};

export default function ConversationList({ role = 'patient' }) {
  const navigate = useNavigate();
  const { user, token, currentFacility } = useContext(AuthContext);

  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchConversations();
  }, [token, activeFilter, currentFacility]);


  const fetchConversations = async () => {
    try {
      setLoading(true);
      const type = activeFilter === 'all' ? null : activeFilter;
      const facilityId = (role === 'staff' || user?.role === 'staff') ? currentFacility?.id : null;
      const data = await ChatService.getMyConversations(token, type, facilityId);
      setConversations(data);

    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.conversation_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
      {/* Header & Search */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tin nhắn</h2>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Filter className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
          <Input 
            placeholder="Tìm kiếm cuộc hội thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-0 focus-visible:ring-2 focus-visible:ring-teal-500 rounded-2xl h-11"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <FilterBadge active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>Tất cả</FilterBadge>
          <FilterBadge active={activeFilter === 'appointment_chat'} onClick={() => setActiveFilter('appointment_chat')}>Khám bệnh</FilterBadge>
          <FilterBadge active={activeFilter === 'support_chat'} onClick={() => setActiveFilter('support_chat')}>Hỗ trợ</FilterBadge>
          {role !== 'patient' && (
            <FilterBadge active={activeFilter === 'internal_chat'} onClick={() => setActiveFilter('internal_chat')}>Nội bộ</FilterBadge>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {loading ? (
          Array(5).fill(0).map((_, i) => <ConversationSkeleton key={i} />)
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map(conv => (
            <ConversationItem 
              key={conv.id} 
              conversation={conv} 
              onClick={() => navigate(`/${role}/conversation/${conv.id}`)}
              currentUserId={user.id}
            />
          ))
        ) : (
          <div className="text-center py-12 px-6">
            <div className="bg-gray-50 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">Không tìm thấy hội thoại</h3>
            <p className="text-gray-500 text-sm">Bạn chưa có cuộc hội thoại nào trong danh mục này.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterBadge({ children, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`
        px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap
        ${active 
          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
      `}
    >
      {children}
    </button>
  );
}

function ConversationItem({ conversation, onClick, currentUserId }) {
  const typeInfo = CONVERSATION_TYPES[conversation.conversation_type] || CONVERSATION_TYPES.support_chat;
  const TypeIcon = typeInfo.icon;
  
  const lastMessage = conversation.messages?.[0];
  const participant = conversation.participants?.find(p => p.user_id !== currentUserId) || conversation.participants?.[0];
  
  return (
    <div 
      onClick={onClick}
      className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-400 overflow-hidden shadow-sm">
          {participant?.user?.AnhDaiDien ? (
            <img src={participant.user.AnhDaiDien} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-7 h-7" />
          )}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${typeInfo.bg} flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm`}>
          <TypeIcon className={`w-3.5 h-3.5 ${typeInfo.color}`} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-gray-900 dark:text-white truncate">
            {conversation.title || 'Cuộc hội thoại'}
          </h4>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight whitespace-nowrap ml-2">
            {conversation.last_message_at ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true, locale: vi }) : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
            {lastMessage?.sender_id === currentUserId && <span className="font-semibold text-teal-600 mr-1">Bạn:</span>}
            {lastMessage?.content || <span className="italic">Chưa có tin nhắn nào</span>}
          </p>
          {conversation.unread_count > 0 && (
            <Badge className="bg-teal-500 hover:bg-teal-500 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full animate-pulse">
              {conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
      </div>
    </div>
  );
}
