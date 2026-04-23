import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Home, User, BarChart, FileText, MessageSquare, Settings, Shield, UserPlus, LogOut, CreditCard, MessagesSquare, Activity, Brain, Stethoscope } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { API } from '@/config';
export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.pathname.split('/')[1];
  const { user, token, logout } = useContext(AuthContext);
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const patientLinks = [
    { path: '/patient/dashboard', icon: Home, label: t('home') },
    { path: '/patient/search-doctors', icon: Users, label: t('findDoctor') },
    { path: '/patient/appointments', icon: Calendar, label: t('appointments') },
    { path: '/patient/payments', icon: CreditCard, label: t('payments') },
    { path: '/patient/medical-records', icon: FileText, label: 'Hồ sơ bệnh án' },
    { path: '#', target: 'chat', icon: Brain, label: 'Tư vấn AI' },
    { path: '/patient/ai-history', icon: Activity, label: 'Lịch sử AI' },
    { path: '/patient/messages', icon: MessageSquare, label: 'Tin nhắn' },
    { path: '/patient/account-settings', icon: Settings, label: 'Cài đặt tài khoản' }
  ];

  const doctorLinks = [
    { path: '/doctor/dashboard', icon: Home, label: t('home') },
    { path: '/doctor/appointments', icon: Calendar, label: t('appointments') },
    { path: '/doctor/medical-records', icon: FileText, label: 'Hồ sơ bệnh án' },
    { path: '/doctor/conversations', icon: MessagesSquare, label: 'Tin nhắn' },
    { path: '/doctor/profile', icon: User, label: t('profile') },
    { path: '/doctor/schedule', icon: Clock, label: t('schedule') },
    { path: '/doctor/ai-diagnoses', icon: Brain, label: 'Chẩn đoán AI' },
    { path: '/doctor/service-settings', icon: Settings, label: 'Cài đặt dịch vụ' }
  ];

  let adminLinks = [
    { path: '/admin/dashboard', icon: Home, label: t('home') },
    { path: '/admin/create-accounts', icon: UserPlus, label: t('createAccounts') },
    { path: '/admin/doctors', icon: Users, label: t('doctors') },
    { path: '/admin/patients', icon: FileText, label: t('patients') },
    { path: '/admin/stats', icon: BarChart, label: t('stats') },
    { path: '/admin/payments', icon: CreditCard, label: t('payments') },
    { path: '/admin/reports', icon: FileText, label: 'Báo cáo' },
    { path: '/admin/ai-diagnoses', icon: Brain, label: 'Chẩn đoán AI' },
    { path: '/admin/specialties', icon: Stethoscope, label: 'Chuyên khoa' },
    { path: '/admin/system-settings', icon: Settings, label: 'Cài đặt hệ thống' }
  ];

  // Add Admins management link if user has permission
  if (role === 'admin' && user?.admin_permissions?.can_create_admins) {
    adminLinks.push({ path: '/admin/admins', icon: Shield, label: t('admins') });
  }


  const staffLinks = [
    { path: '/staff/dashboard', icon: Home, label: 'Dashboard vận hành' },
    { path: '/staff/patients', icon: Users, label: 'Tiếp nhận bệnh nhân' },
    { path: '/staff/appointments', icon: Calendar, label: 'Điều phối lịch khám' },
    { path: '/staff/booking-assist', icon: UserPlus, label: 'Hỗ trợ đặt lịch khám' },
    { path: '/staff/triage-queue', icon: Activity, label: 'Hàng chờ AI Triage' },
    { path: '/staff/payments', icon: CreditCard, label: 'Hỗ trợ thanh toán' },
    { path: '/staff/messages', icon: MessageSquare, label: 'Hỗ trợ giao tiếp' },
    { path: '/staff/video-support', icon: Brain, label: 'Hỗ trợ khám online' },
  ];

  const links = role === 'patient' ? patientLinks
    : role === 'doctor' ? doctorLinks
      : role === 'staff' ? staffLinks
        : role === 'admin' ? adminLinks : [];

  if (links.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-xl fixed h-full z-50 flex flex-col">
        <div className="p-6 flex-1">
          <Link
            to={role === 'admin' ? '/admin/dashboard' : role === 'doctor' ? '/doctor/dashboard' : role === 'staff' ? '/staff/dashboard' : '/'}
            className="flex items-center gap-2 mb-8 justify-center cursor-pointer"
          >
            <img src="/logo.png" alt="MediSched AI Logo" className="h-14 w-auto object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              MediSched AI
            </span>
          </Link>

          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.target === 'chat' ? '#' : link.path}
                  onClick={(e) => {
                    if (link.target === 'chat') {
                      e.preventDefault();
                      window.dispatchEvent(new Event('toggle-floating-chat'));
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${isActive && !link.target
                    ? 'bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-end items-center gap-3 transition-colors duration-300">
          {user && <NotificationDropdown token={token} />}
          <ThemeToggle />
          <LanguageToggle />
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
          >
            <LogOut className="w-4 h-4" />
            {t('logout')}
          </Button>
        </header>

        {/* Page Content */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}

function NotificationDropdown({ token }) {
  const [notifications, setNotifications] = React.useState([]);
  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to parse notifications');
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API}/notifications/mark-read/all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) { }
  };

  const unreadCount = notifications.filter(n => !n.DaDoc).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600">
            <h3 className="font-bold text-gray-800 dark:text-white">Thông báo ({unreadCount})</h3>
            <button onClick={markAllAsRead} className="text-xs text-teal-600 hover:text-teal-700 font-medium">Đánh dấu đã đọc</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">Chưa có thông báo nào</div>
            ) : (
              notifications.map(n => (
                <div key={n.Id_ThongBao} className={`p-4 border-b border-gray-50 dark:border-gray-700 flex flex-col gap-1 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${!n.DaDoc ? 'bg-teal-50/50 dark:bg-teal-900/20' : ''}`}>
                  <p className={`text-sm ${!n.DaDoc ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{n.NoiDung}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
