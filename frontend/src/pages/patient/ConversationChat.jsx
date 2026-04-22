import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Image as ImageIcon, X, User, Video } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientConversationChat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);

  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchConversation();
    fetchMessages();

    // Poll for new messages and status every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchMessages(true); // silent fetch
      fetchConversation(true); // silent fetch for status update
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async (silent = false) => {
    if (conversationId === 'ai') {
      setConversation({ other_user_name: 'Trợ lý AI y tế', last_message_at: new Date() });
      return;
    }
    try {
      const response = await axios.get(`${API}/conversations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const conv = response.data.find(c => c.id === parseInt(conversationId));
      setConversation(conv);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      if (!silent) {
        toast.error('Không thể tải thông tin cuộc hội thoại');
      }
    }
  };

  const fetchMessages = async (silent = false) => {
    if (conversationId === 'ai') {
      // Load AI History
      try {
        const res = await axios.get(`${API}/ai/history`, { headers: { Authorization: `Bearer ${token}` } });
        setMessages([
          { id: 'welcome', message: 'Tôi là trợ lý AI, bạn hãy nhập triệu chứng để tôi tư vấn nhé.', sender_id: 'ai', sender_name: 'Trợ lý AI', createdAt: new Date() },
          ...res.data.map(h => ({
            id: `ai-${h.id}`,
            message: `Hỏi: ${h.symptoms}\n\nTrợ lý: ${h.diagnosis}`,
            sender_id: 'ai',
            sender_name: 'Trợ lý AI',
            createdAt: new Date()
          }))
        ]);
      } catch (err) { }
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API}/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (!silent) {
        toast.error('Không thể tải tin nhắn');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Kích thước file phải nhỏ hơn 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file hình ảnh');
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await axios.post(`${API}/chat/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Không thể tải lên hình ảnh');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !selectedImage) {
      return;
    }

    setSending(true);

    if (conversationId === 'ai') {
      const userMsg = newMessage.trim();
      setMessages(prev => [...prev, { id: Date.now(), message: userMsg, sender_id: user?.id, sender_name: 'Bạn', createdAt: new Date() }]);
      setNewMessage('');
      try {
        const response = await axios.post(`${API}/ai/chat`, { message: userMsg }, { headers: { Authorization: `Bearer ${token}` } });
        setMessages(prev => [...prev, { id: Date.now() + 1, message: response.data.result, sender_id: 'ai', sender_name: 'Trợ lý AI', createdAt: new Date() }]);
      } catch (err) {
        toast.error('Có lỗi từ AI');
      }
      setSending(false);
      return;
    }

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage();
        if (!imageUrl && !newMessage.trim()) {
          // If image upload failed and no text, abort
          setSending(false);
          return;
        }
      }

      // Send message
      await axios.post(
        `${API}/conversations/${conversationId}/send`,
        {
          message: newMessage.trim() || '📷 Hình ảnh',
          image_url: imageUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      handleRemoveImage();
      fetchMessages(true);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleVideoCall = () => {
    navigate(`/video/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Vừa truy cập';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 5) return 'Đang hoạt động';
    if (diffMins < 60) return `Hoạt động ${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`;
    return `Hoạt động ${date.toLocaleDateString('vi-VN')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 flex items-center gap-4 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/patient/messages', { state: { activeTab: 'doctor' } })}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">
              {conversation?.other_user_name || 'Đang tải...'}
            </h2>
            <p className="text-white/80 text-sm">
              {conversation ? formatLastActive(conversation.last_message_at) : '...'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleVideoCall}
          className="text-white hover:bg-white/20 rounded-full"
          title="Gọi video"
        >
          <Video className="w-6 h-6" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Chưa có tin nhắn nào</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Hãy gửi tin nhắn để bắt đầu cuộc hội thoại
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} currentUserId={user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
            className="text-gray-600 dark:text-gray-400 hover:text-teal-500"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn ..."
            disabled={sending || uploading}
            className="flex-1"
          />

          <Button
            type="submit"
            disabled={(!newMessage.trim() && !selectedImage) || sending || uploading}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            {sending || uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, currentUserId }) {
  const isOwn = message.sender_id === currentUserId;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-2">
            {message.sender_name || 'BITHUB'}
          </p>
        )}

        <div
          className={`rounded-2xl px-4 py-2 ${isOwn
            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-tr-none'
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md rounded-tl-none'
            }`}
        >
          {message.image_url && (
            <div className="mb-2">
              <img
                src={`${API}${message.image_url}`}
                alt="Shared"
                className="rounded-lg max-w-full cursor-pointer hover:opacity-90"
                onClick={() => window.open(`${API}${message.image_url}`, '_blank')}
              />
            </div>
          )}

          {message.message && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
          )}

          <div className={`flex items-center justify-end gap-1 mt-1`}>
            <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
              {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {isOwn && (
              <span className="text-[10px] text-white/70 ml-1">
                {message.is_read ? '• Đã xem' : '• Đã gửi'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
