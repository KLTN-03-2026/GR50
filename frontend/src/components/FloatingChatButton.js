import React, { useState, useContext } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { AuthContext } from '@/App';
import { useNavigate } from 'react-router-dom';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Don't show for non-logged-in users
  if (!user) return null;

  const handleChatNavigation = () => {
    // Navigate based on role
    if (user.role === 'patient' || user.role === 'doctor') {
      navigate(`/${user.role}/appointments`);
    } else if (user.role === 'department_head') {
      // Department head can view doctors and patients
      navigate('/department-head/dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard');
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleChatNavigation}
          className="group relative bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          title="Mở chat"
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {user.role === 'patient' && 'Chat với bác sĩ'}
            {user.role === 'doctor' && 'Chat với bệnh nhân'}
            {user.role === 'department_head' && 'Xem danh sách'}
            {user.role === 'admin' && 'Quản lý hệ thống'}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    </>
  );
}
