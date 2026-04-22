import React, { useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import ConversationList from '@/components/chat/ConversationList';
import ConversationChat from '@/components/chat/ConversationChat';
import { useParams } from 'react-router-dom';
import { MessageSquare, Headset, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function StaffUnifiedChat() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  return (
    <Layout>
      <div className="h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                Trung tâm Hỗ trợ Khách hàng
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold border border-teal-100 dark:border-teal-800">
                  <Headset className="w-4 h-4" />
                  Nhân viên Tiếp nhận
                </div>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Hỗ trợ bệnh nhân về đặt lịch, thanh toán và các vấn đề hành chính.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Đang nhận yêu cầu</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Sidebar / List */}
            <div className={`
              ${id ? 'hidden lg:flex' : 'flex'} 
              w-full lg:w-96 flex-col h-full
            `}>
              <ConversationList role="staff" />
            </div>

            {/* Main Chat Area */}
            <div className={`
              ${id ? 'flex' : 'hidden lg:flex'} 
              flex-1 flex-col h-full
            `}>
              {id ? (
                <ConversationChat role="staff" />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 rounded-full flex items-center justify-center mb-6">
                    <Headset className="w-12 h-12 text-teal-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Sẵn sàng hỗ trợ</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                    Chọn một yêu cầu hỗ trợ từ danh sách bên trái hoặc mở kênh trao đổi nội bộ với bác sĩ.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                    <FeatureCard 
                      icon={MessageSquare} 
                      title="Support Case" 
                      desc="Hỗ trợ bệnh nhân giải quyết vấn đề"
                      color="bg-blue-500"
                    />
                    <FeatureCard 
                      icon={CheckCircle2} 
                      title="Giải quyết" 
                      desc="Đóng case sau khi hoàn thành"
                      color="bg-green-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-left hover:bg-white dark:hover:bg-gray-800 transition-all group cursor-pointer">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-1.5">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
