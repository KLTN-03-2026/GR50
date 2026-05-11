import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Loader2, Sparkles, BrainCircuit, MapPin, Navigation, PhoneCall, CalendarPlus, AlertTriangle, X, History, Image as ImageIcon, Paperclip, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import MapDirections from '@/components/map/MapDirections';

export default function AIChat({ isFloating = false, onClose }) {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI y tế MediSched AI. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [sessionId, setSessionId] = useState(null);

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
      // Gọi tới endpoint mới với location data và sessionId
      const response = await axios.post(
        `${API}/ai/chat-session`,
        { 
          message: userMessage,
          latitude: location?.lat,
          longitude: location?.lng,
          sessionId: sessionId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiData = response.data.data;
      if (aiData.sessionId && !sessionId) {
        setSessionId(aiData.sessionId);
      }
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiData.reply,
        raw: aiData
      }]);
    } catch (error) {
      console.error('AI Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Hiện tại hệ thống AI đang ở chế độ demo. Bạn có thể mô tả triệu chứng như đau đầu, sốt, ho, đau bụng để tôi gợi ý chuyên khoa phù hợp.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (selectedDestination && location) {
    return (
      <div className="flex flex-col h-full relative">
        <MapDirections 
          origin={location} 
          destination={{ lat: selectedDestination.lat, lng: selectedDestination.lng }} 
          destinationName={selectedDestination.name}
          onBack={() => setSelectedDestination(null)} 
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden ${isFloating ? '' : 'rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800'}`}>
      {/* Header */}
      <div className="bg-[#13b4b9] px-4 py-3 flex items-center justify-between text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-black flex items-center justify-center border-2 border-[#13b4b9]">
             <img src="/ai-chat-icon.png" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-[15px] leading-tight">
              Trợ lý AI y tế
            </h3>
            <p className="text-[11px] text-white/90 leading-tight">
              Phân tích đa phương tiện 24/7
            </p>
          </div>
        </div>
        
        {isFloating && onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`
              max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-[14px] leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-[#13b4b9] text-white rounded-br-sm' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
              }
            `}>
              <div className="whitespace-pre-wrap">{msg.content}</div>  {/* Render Rich UI for AI Response */}
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
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                <Button 
                                                  size="sm" 
                                                  variant="outline" 
                                                  className="h-8 text-[11px] font-medium border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-2" 
                                                  onClick={() => window.open(`/facility/${facility.facility_id}`, '_blank')}
                                                >
                                                    Xem chi tiết
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline" 
                                                  className="h-8 text-[11px] font-medium border-teal-200 text-teal-700 hover:bg-teal-50 px-2" 
                                                  onClick={() => {
                                                    if (location && facility.lat && facility.lng) {
                                                      setSelectedDestination({
                                                        lat: facility.lat,
                                                        lng: facility.lng,
                                                        name: facility.name
                                                      });
                                                    } else {
                                                      window.open(facility.maps_url, '_blank');
                                                    }
                                                  }}
                                                >
                                                    <MapPin className="w-3 h-3 mr-1" /> Chỉ đường
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  className="col-span-2 h-8 text-[12px] font-medium bg-[#13b4b9] hover:bg-[#0ca3a8] text-white shadow-sm px-2"
                                                  onClick={() => window.open(`/patient/search-doctors?facility_id=${facility.facility_id}`, '_blank')}
                                                >
                                                    <CalendarPlus className="w-3.5 h-3.5 mr-1.5" /> Đặt lịch khám
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
          <div className="flex justify-start animate-pulse">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#13b4b9]" />
              <span className="text-sm text-gray-500">Đang phân tích...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-10 relative shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        {location === null && (
            <div className="mb-3">
                <div className="text-[10px] text-amber-500 mb-2 flex items-center gap-1 justify-center">
                    <AlertTriangle className="w-3 h-3" /> Không thể lấy vị trí tự động. Bạn có thể nhập địa chỉ thủ công để tìm bệnh viện gần nhất.
                </div>
                <div className="flex gap-2">
                    <Input 
                        id="manual-address-input"
                        placeholder="Nhập địa chỉ hiện tại của bạn..."
                        className="text-xs h-8"
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.target.value.trim();
                                if (!val) return;
                                try {
                                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}`);
                                    const data = await res.json();
                                    if (data && data.length > 0) {
                                        setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                                        toast.success("Đã cập nhật vị trí");
                                    } else {
                                        toast.error("Không tìm thấy địa chỉ này");
                                    }
                                } catch (error) {
                                    toast.error("Lỗi khi tìm vị trí");
                                }
                            }
                        }}
                    />
                    <Button 
                        size="sm" 
                        className="h-8 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
                        onClick={async () => {
                            const val = document.getElementById('manual-address-input')?.value.trim();
                            if (!val) return;
                            try {
                                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}`);
                                const data = await res.json();
                                if (data && data.length > 0) {
                                    setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                                    toast.success("Đã cập nhật vị trí");
                                } else {
                                    toast.error("Không tìm thấy địa chỉ này");
                                }
                            } catch (error) {
                                toast.error("Lỗi khi tìm vị trí");
                            }
                        }}
                    >
                        Cập nhật
                    </Button>
                </div>
            </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800 p-1.5 rounded-full border border-gray-200 dark:border-gray-700 transition-all mx-2 mb-2">
          <div className="flex gap-2 text-gray-400 pl-3">
            <button type="button" className="hover:text-gray-600 transition-colors"><ImageIcon className="w-4 h-4" /></button>
            <button type="button" className="hover:text-gray-600 transition-colors"><Paperclip className="w-4 h-4" /></button>
          </div>
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập triệu chứng..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm shadow-none px-2 text-gray-700 h-8"
          />
          <div className="flex gap-3 text-gray-400 items-center pr-1">
             <button type="button" className="hover:text-gray-600 transition-colors"><Mic className="w-4 h-4" /></button>
             <Button 
                type="submit" 
                disabled={!input.trim() || loading}
                className={`w-8 h-8 rounded-full shadow-none shrink-0 p-0 flex items-center justify-center transition-colors ${input.trim() && !loading ? 'bg-[#13b4b9] hover:bg-[#0ca3a8] text-white' : 'bg-gray-200 text-white'}`}
              >
                <Send className="w-4 h-4" />
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
