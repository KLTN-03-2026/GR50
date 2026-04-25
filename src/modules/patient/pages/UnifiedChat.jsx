import React, { useState, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import ConversationList from '@/components/chat/ConversationList';
import ConversationChat from '@/components/chat/ConversationChat';
import AIChat from '@/components/chat/AIChat';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Bot, Info, ShieldCheck, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export default function PatientUnifiedChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' or 'ai'

  return (
    <Layout>
      <div className="h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                Trung tâm Tư vấn
                <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50 dark:bg-teal-900/20 px-3 py-1">
                  Trực tuyến 24/7
                </Badge>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Trao đổi trực tiếp với Bác sĩ và Đội ngũ hỗ trợ của chúng tôi.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-bold">
                <ShieldCheck className="w-4 h-4" />
                Bảo mật SSL
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-1">
            <button
              onClick={() => { setActiveTab('conversations'); navigate('/patient/messages'); }}
              className={`pb-3 px-4 font-medium transition-all relative ${
                activeTab === 'conversations' 
                  ? 'text-teal-600 dark:text-teal-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Hội thoại
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
              <Sparkles className="w-3.5 h-3.5 ml-1.5 inline-block text-yellow-500" />
              {activeTab === 'ai' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 rounded-t-full"></span>
              )}
            </button>
          </div>

          <div className="flex-1 flex gap-6 overflow-hidden">
            {activeTab === 'ai' ? (
              <div className="flex-1">
                <AIChat />
              </div>
            ) : (
              <>
                {/* Sidebar / List */}
                <div className={`
                  ${id ? 'hidden lg:flex' : 'flex'} 
                  w-full lg:w-96 flex-col h-full
                `}>
                  <ConversationList role="patient" />
                </div>

                {/* Main Chat Area */}
                <div className={`
                  ${id ? 'flex' : 'hidden lg:flex'} 
                  flex-1 flex-col h-full
                `}>
                  {id ? (
                    <ConversationChat role="patient" />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare className="w-12 h-12 text-teal-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Chọn một cuộc hội thoại</h2>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                        Chọn một bác sĩ từ danh sách bên trái hoặc liên hệ với bộ phận hỗ trợ nếu bạn cần trợ giúp hành chính.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                        <FeatureCard 
                          icon={Bot} 
                          title="Trợ lý AI" 
                          desc="Phân tích triệu chứng tức thì với AI"
                          color="bg-purple-500"
                          onClick={() => setActiveTab('ai')}
                        />
                        <FeatureCard 
                          icon={Info} 
                          title="Hỗ trợ 24/7" 
                          desc="Giải đáp thắc mắc về thủ tục"
                          color="bg-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon: Icon, title, desc, color, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-left hover:bg-white dark:hover:bg-gray-800 transition-all group cursor-pointer"
    >
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
