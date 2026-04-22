import React, { useState, useEffect, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { 
  MessageSquare, 
  Send, 
  User, 
  Search, 
  Clock, 
  CheckCheck,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function ReceptionSupportChat() {
  const { token } = useContext(AuthContext);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/staff/support-conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-120px)] p-8">
        <div className="flex h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Chat List */}
          <div className="w-80 border-r border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4">Tin nhắn hỗ trợ</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Tìm hội thoại..." className="pl-9 rounded-xl h-10 bg-gray-50 dark:bg-gray-900 border-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${activeChat?.id === chat.id ? 'bg-teal-50/50 dark:bg-teal-900/20 border-r-4 border-teal-500' : ''}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                    {chat.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm truncate">{chat.name}</h4>
                      <span className="text-[10px] text-gray-400 uppercase">{chat.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{chat.lastMsg}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {chat.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-gray-900/10">
            {activeChat ? (
              <>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center font-bold text-teal-600 dark:text-teal-400">
                      {activeChat.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold">{activeChat.name}</h3>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-xs text-gray-400">Đang trực tuyến</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="flex justify-center">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-gray-400 border-gray-200">Hôm nay</Badge>
                  </div>
                  
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0">P</div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700">
                      <p className="text-sm">Chào bạn, tôi muốn hỏi về quy trình khám online ạ.</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">10:30 AM</span>
                    </div>
                  </div>

                  <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                    <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0">S</div>
                    <div className="bg-teal-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md">
                      <p className="text-sm">Dạ chào bạn, quy trình khám online gồm 3 bước: Đăng ký lịch, Thanh toán và Vào phòng video khi đến giờ ạ.</p>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <span className="text-[10px] opacity-70">10:32 AM</span>
                        <CheckCheck className="w-3 h-3 opacity-70" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-teal-500">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input 
                      placeholder="Nhập nội dung tin nhắn..." 
                      className="border-none bg-transparent focus-visible:ring-0 shadow-none"
                    />
                    <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-teal-500">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button className="rounded-xl bg-teal-500 hover:bg-teal-600 text-white shadow-lg w-12 h-12 p-0">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <p className="text-sm font-medium">Chọn một hội thoại để bắt đầu hỗ trợ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
