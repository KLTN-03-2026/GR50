import React, { useState, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import ConversationList from '@/components/chat/ConversationList';
import ConversationChat from '@/components/chat/ConversationChat';
import AIChat from '@/components/chat/AIChat';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Users, ShieldAlert, Bot, BadgeCheck, Sparkles } from 'lucide-react';

export default function DoctorUnifiedChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' or 'ai'

  return (
    <Layout>
      <div className="h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                Hệ thống Hội chẩn & Trao đổi
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800">
                  <BadgeCheck className="w-4 h-4" />
                  Bác sĩ Chuyên khoa
                </div>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý bệnh nhân, hội chẩn nội bộ và hỗ trợ chuyên môn.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-1">
            <button
              onClick={() => { setActiveTab('conversations'); navigate('/doctor/conversations'); }}
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
                  <ConversationList role="doctor" />
                </div>

                {/* Main Chat Area */}
                <div className={`
                  ${id ? 'flex' : 'hidden lg:flex'} 
                  flex-1 flex-col h-full
                `}>
                  {id ? (
                    <ConversationChat role="doctor" />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full flex items-center justify-center mb-6">
                        <Users className="w-12 h-12 text-blue-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Kênh giao tiếp chuyên môn</h2>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                        Chọn một bệnh nhân đang chờ khám hoặc mở kênh hội chẩn với các đồng nghiệp và nhân viên y tế.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                        <FeatureCard 
                          icon={MessageSquare} 
                          title="Bệnh nhân" 
                          desc="Trao đổi với bệnh nhân theo lịch hẹn"
                          color="bg-teal-500"
                        />
                        <FeatureCard 
                          icon={ShieldAlert} 
                          title="Nội bộ" 
                          desc="Trao đổi điều phối với điều dưỡng/NV"
                          color="bg-purple-500"
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

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-left hover:bg-white dark:hover:bg-gray-800 transition-all group cursor-pointer border-b-4 hover:border-b-teal-500 transition-all duration-300">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-1.5">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
