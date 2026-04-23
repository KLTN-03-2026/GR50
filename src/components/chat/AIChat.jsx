import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Loader2, Sparkles, BrainCircuit, MapPin, Navigation, PhoneCall, CalendarPlus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function AIChat() {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI y tế MediSched. Tôi có thể giúp bạn phân tích triệu chứng hoặc giải đáp thắc mắc về y khoa. Bạn đang cảm thấy thế nào?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Xin quyền truy cập vị trí ngay khi mở chat
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied or unavailable", error);
        }
      );
    }
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Gọi tới endpoint mới với location data
      const response = await axios.post(
        `${API}/ai/chat-session`,
        { 
          message: userMessage,
          latitude: location?.lat,
          longitude: location?.lng
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiData = response.data.data;
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiData.reply,
        raw: aiData
      }]);
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2">
              Trợ lý AI Triage
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </h3>
            <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Thông minh & Phân luồng tự động
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`
              w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-1
              ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}
            `}>
              {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </div>
            
            <div className={`flex flex-col gap-3 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`
                rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'}
                `}>
                {msg.content}
                </div>

                {/* Render Rich UI for AI Response */}
                {msg.raw && (
                    <div className="w-full space-y-3 pl-2">
                        {/* Priority Badge */}
                        {msg.raw.priority === 'emergency' && (
                            <Badge variant="destructive" className="animate-pulse flex gap-1 w-max">
                                <AlertTriangle className="w-3 h-3" /> Cấp cứu khẩn cấp
                            </Badge>
                        )}
                        {msg.raw.priority === 'urgent' && (
                            <Badge className="bg-amber-500 hover:bg-amber-600 flex gap-1 w-max text-white">
                                <AlertTriangle className="w-3 h-3" /> Cần khám sớm
                            </Badge>
                        )}

                        {/* Specialty Recommendation */}
                        {msg.raw.recommended_specialty && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg text-xs font-medium border border-indigo-100 dark:border-indigo-800 inline-block">
                                Chuyên khoa đề xuất: {msg.raw.recommended_specialty}
                            </div>
                        )}

                        {/* Nearby Facilities UI */}
                        {msg.raw.nearby_facilities && msg.raw.nearby_facilities.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cơ sở y tế gần bạn nhất</p>
                                <div className="flex flex-col gap-2">
                                    {msg.raw.nearby_facilities.map(facility => (
                                        <Card key={facility.facility_id} className="p-3 border-teal-100 dark:border-teal-900 hover:border-teal-300 transition-colors bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h4 className="font-bold text-teal-800 dark:text-teal-400 text-sm">{facility.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1" title={facility.address}>{facility.address}</p>
                                                    {facility.distance_km && (
                                                        <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                                                            <Navigation className="w-3 h-3" /> 
                                                            Cách {facility.distance_km} km ({facility.estimated_travel_time_min} phút - tuyến {facility.route_type === 'fastest' ? 'nhanh nhất' : 'gần nhất'})
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <Button size="sm" variant="outline" className="h-8 text-xs flex-1 border-teal-200 text-teal-700 hover:bg-teal-50" onClick={() => window.open(facility.maps_url, '_blank')}>
                                                    <MapPin className="w-3 h-3 mr-1" /> Chỉ đường
                                                </Button>
                                                <Button size="sm" className="h-8 text-xs flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md shadow-teal-500/20">
                                                    <CalendarPlus className="w-3 h-3 mr-1" /> Đặt lịch
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-6 h-6" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              <span className="text-sm text-gray-400 font-medium">AI đang phân tích triệu chứng...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-10 relative shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        {location === null && (
            <div className="text-[10px] text-amber-500 mb-2 flex items-center gap-1 justify-center">
                <AlertTriangle className="w-3 h-3" /> Vui lòng cấp quyền vị trí để AI tìm bệnh viện gần nhất
            </div>
        )}
        <form onSubmit={handleSend} className="flex gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 focus-within:border-purple-500 transition-all">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mô tả triệu chứng hoặc câu hỏi của bạn..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base shadow-none"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/20 shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
