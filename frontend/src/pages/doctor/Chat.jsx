import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Image as ImageIcon, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

export default function DoctorChat() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    markAsRead();

    const baseUrl = API.split('/api')[0] || 'http://localhost:8001';
    const newSocket = io(baseUrl);

    newSocket.emit('join_conversation', appointmentId);

    newSocket.on('receive_message', (message) => {
      setMessages(prev => {
        // Prevent duplicate messages if sender already added it directly
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      newSocket.off('receive_message');
      newSocket.close();
    };
  }, [appointmentId, token]);

  const markAsRead = async () => {
    if (!token) return;
    try {
      await axios.put(`${API}/chat/read/${appointmentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/chat/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file quá lớn. Tối đa 10MB');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
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
      toast.error('Không thể tải ảnh lên');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage();
        if (!imageUrl) return; // Upload failed
      }

      await axios.post(`${API}/chat/send`, {
        appointment_id: appointmentId,
        message: newMessage || '',
        image_url: imageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add message dynamically to UI to prevent waiting for socket roundtrip
      setNewMessage('');
      handleRemoveImage();
    } catch (error) {
      toast.error('Không thể gửi tin nhắn');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button data-testid="back-btn" variant="ghost" onClick={() => navigate('/doctor/appointments')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
              <h1 className="text-2xl font-bold text-white">Tư vấn bệnh nhân</h1>
            </div>

            <div className="h-[500px] overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
              {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Đang tải...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Chưa có tin nhắn nào</p>
              ) : (
                messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user?.id} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {imagePreview && (
              <div className="border-t p-4 bg-gray-50 dark:bg-gray-800">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Input
                data-testid="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1"
                disabled={uploading}
              />
              <Button
                data-testid="send-btn"
                type="submit"
                className="bg-gradient-to-r from-teal-500 to-cyan-500"
                disabled={uploading || (!newMessage.trim() && !selectedImage)}
              >
                {uploading ? '...' : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isOwn
          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}>
        <p className="font-semibold text-sm mb-1">{message.sender_name}</p>
        {message.image_url && (
          <img
            src={`${API}${message.image_url}`}
            alt="Shared image"
            className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90"
            onClick={() => window.open(`${API}${message.image_url}`, '_blank')}
          />
        )}
        {message.message && <p>{message.message}</p>}
        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
          {new Date(message.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
