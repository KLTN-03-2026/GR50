import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Home, User, BarChart, FileText, MessageSquare, Settings, Shield, UserPlus, LogOut, CreditCard, MessagesSquare } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.pathname.split('/')[1];
  const { user, logout } = useContext(AuthContext);
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
    { path: '/patient/messages', icon: MessageSquare, label: 'Tin nhắn' }
  ];

  const doctorLinks = [
    { path: '/doctor/dashboard', icon: Home, label: t('home') },
    { path: '/doctor/appointments', icon: Calendar, label: t('appointments') },
    { path: '/doctor/conversations', icon: MessagesSquare, label: 'Tin nhắn' },
    { path: '/doctor/profile', icon: User, label: t('profile') },
    { path: '/doctor/schedule', icon: Clock, label: t('schedule') }
  ];

  let adminLinks = [
    { path: '/admin/dashboard', icon: Home, label: t('home') },
    { path: '/admin/create-accounts', icon: UserPlus, label: t('createAccounts') },
    { path: '/admin/doctors', icon: Users, label: t('doctors') },
    { path: '/admin/patients', icon: FileText, label: t('patients') },
    { path: '/admin/stats', icon: BarChart, label: t('stats') },
    { path: '/admin/payments', icon: CreditCard, label: t('payments') }
  ];

  // Add Admins management link if user has permission
  if (role === 'admin' && user?.admin_permissions?.can_create_admins) {
    adminLinks.push({ path: '/admin/admins', icon: Shield, label: t('admins') });
  }

  const departmentHeadLinks = [
    { path: '/department-head/dashboard', icon: Home, label: t('home') },
    { path: '/department-head/create-accounts', icon: UserPlus, label: t('createAccounts') },
    { path: '/department-head/doctors', icon: Users, label: t('doctors') },
    { path: '/department-head/patients', icon: FileText, label: t('patients') },
    { path: '/department-head/conversations', icon: MessagesSquare, label: 'Tin nhắn' }
  ];

  const links = role === 'patient' ? patientLinks 
    : role === 'doctor' ? doctorLinks 
    : role === 'department-head' ? departmentHeadLinks
    : role === 'admin' ? adminLinks : [];

  if (links.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-xl fixed h-full z-10 flex flex-col">
        <div className="p-6 flex-1">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">Đặt Lịch Khám Bệnh</span>
          </Link>

          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-${link.path.split('/').pop()}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
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
