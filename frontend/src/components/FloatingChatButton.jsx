import React, { useState, useEffect, useContext, useRef } from 'react';
import { X, Send, Mic, MicOff, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import axios from 'axios';
import { API } from '@/config';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: 1, text: 'Xin chào! Tôi là trợ lý AI y tế MediSched AI. Tôi có thể giúp gì cho bạn?', sender: 'ai'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { token, user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);
  const fileInputRef = useRef(null);
  const isSendingRef = useRef(false);
  const lastMessageRef = useRef({ text: '', time: 0 });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-floating-chat', handleToggle);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'vi-VN';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => window.removeEventListener('toggle-floating-chat', handleToggle);
  }, []);

  if (user?.role && user.role !== 'patient') return null;

  const toggleListen = (e) => {
    e.preventDefault();
    if (!recognition.current) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!");
      return;
    }
    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset
  };

  const clearImage = () => setSelectedImage(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    if (isSendingRef.current || cooldown) return;

    const userMsg = input.trim();
    const imgBase64 = selectedImage;
    const now = Date.now();

    if (userMsg === lastMessageRef.current.text && !selectedImage) {
      if (now - lastMessageRef.current.time < 3000) {
        return; // Prevent sending the same message within 3 seconds
      }
    }

    lastMessageRef.current = { text: userMsg, time: now };

    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, image: imgBase64, sender: 'user' }]);
    setInput('');
    setSelectedImage(null);

    isSendingRef.current = true;
    setLoading(true);

    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await axios.post(
        `${API}/ai/chat`,
        { message: userMsg, image: imgBase64 || undefined },
        { headers }
      );
      const aiResponse = response.data?.result || 'Không có phản hồi từ AI.';
      setMessages(prev => [...prev, { id: Date.now(), text: aiResponse, sender: 'ai' }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errMsg = error?.response?.data?.message || error?.response?.data?.detail || 'Xin lỗi, AI hệ thống hiện đang bảo trì hoặc xảy ra lỗi.';
      setMessages(prev => [...prev, { id: Date.now(), text: errMsg, sender: 'ai' }]);
    } finally {
      setLoading(false);
      setCooldown(true);
      setTimeout(() => {
        isSendingRef.current = false;
        setCooldown(false);
      }, 1000);
    }
  };

  const renderMessageText = (text, isUser) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`${isUser ? 'text-teal-100 hover:text-white' : 'text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300'} underline break-all`}
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const insertUrlPattern = () => {
    setInput(prev => prev + (prev ? ' ' : '') + 'https://');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50 overflow-hidden border-2 border-teal-500 hover:ring-4 hover:ring-teal-200"
      >
        {isOpen ? (
          <X className="w-8 h-8 text-teal-600" />
        ) : (
          <img src="/ai-chat-icon.png" alt="AI Chat" className="w-full h-full object-cover" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[550px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 shrink-0 shadow-sm z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/ai-chat-icon.png" alt="AI Avatar" className="w-10 h-10 rounded-full border border-white/50 object-cover shadow-sm" />
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    Trợ lý AI y tế
                    {isListening && <span className="flex w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
                  </h3>
                  <p className="text-teal-50 text-xs text-opacity-90">Phân tích đa phương tiện 24/7</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 rounded-tl-none'}`}>
                  {msg.image && (
                    <img src={msg.image} alt="User sent" className="w-full h-auto rounded-lg mb-2 border border-white/20 shadow-sm" />
                  )}
                  {msg.text && (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{renderMessageText(msg.text, msg.sender === 'user')}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview Area */}
          {selectedImage && (
            <div className="px-3 pt-2 pb-1 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
              <div className="relative inline-block border border-gray-200 dark:border-gray-600 rounded-lg p-1 bg-gray-50 dark:bg-gray-900">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded shadow-sm" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:scale-110 transition shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
            <div className={`flex gap-1.5 items-center bg-gray-50 dark:bg-gray-900 rounded-full px-1.5 py-1.5 border ${selectedImage ? 'border-teal-300 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-gray-700'} focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all`}>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition shrink-0 ${selectedImage ? 'text-teal-600 bg-teal-100' : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-gray-800'}`}
                title="Đính kèm ảnh mụn / phim X-quang"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />

              <button
                type="button"
                onClick={insertUrlPattern}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition shrink-0 dark:hover:bg-gray-800"
                title="Chèn URL bằng tay"
              >
                <LinkIcon className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Đang nghe..." : "Nhập triệu chứng..."}
                className="flex-1 bg-transparent px-1 text-sm focus:outline-none dark:text-white"
              />

              <button
                type="button"
                onClick={toggleListen}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition shrink-0 ${isListening ? 'text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/30' : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-gray-800'}`}
                title="Đọc kết quả bằng giọng nói"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || loading || cooldown || isSendingRef.current}
                className="w-8 h-8 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center shrink-0 transition text-white shadow-sm"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
