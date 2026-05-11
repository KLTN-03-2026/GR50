import { useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import Layout from '../../components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, FileText, BarChart, Shield, UserPlus, 
  CreditCard, ClipboardList, Activity, Stethoscope, 
  Settings, Brain 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-foreground p-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('welcomeAdmin')} {user?.full_name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{t('manageSystem')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.admin_type === 'SUPER_ADMIN' ? (
              <>
                <QuickActionCard
                  icon={<Shield className="w-8 h-8" />}
                  title="Quản lý Admin cơ sở"
                  description="Quản lý tài khoản quản trị cho từng cơ sở y tế"
                  onClick={() => navigate('/admin/admins')}
                />
                <QuickActionCard
                  icon={<Stethoscope className="w-8 h-8" />}
                  title="Danh mục hệ thống"
                  description="Quản lý chuyên khoa, dịch vụ dùng chung"
                  onClick={() => navigate('/admin/specialties')}
                />
                <QuickActionCard
                  icon={<Activity className="w-8 h-8" />}
                  title="Cấu hình AI"
                  description="Giám sát và cấu hình dịch vụ AI toàn hệ thống"
                  onClick={() => navigate('/admin/ai-diagnoses')}
                />
                <QuickActionCard
                  icon={<Settings className="w-8 h-8" />}
                  title="Cấu hình hệ thống"
                  description="Cài đặt tham số, bảo mật và nhật ký hệ thống"
                  onClick={() => navigate('/admin/system-settings')}
                />
              </>
            ) : (
              <>
                <QuickActionCard
                  icon={<Users className="w-8 h-8" />}
                  title={t('manageDoctors')}
                  description={t('manageDoctorsDesc')}
                  onClick={() => navigate('/admin/doctors')}
                />
                <QuickActionCard
                  icon={<UserPlus className="w-8 h-8" />}
                  title="Tạo tài khoản"
                  description="Cấp tài khoản cho Bác sĩ và Nhân viên mới"
                  onClick={() => navigate('/admin/create-accounts')}
                />
                <QuickActionCard
                  icon={<FileText className="w-8 h-8" />}
                  title={t('patientList')}
                  description={t('patientListDesc')}
                  onClick={() => navigate('/admin/patients')}
                />
                <QuickActionCard
                  icon={<BarChart className="w-8 h-8" />}
                  title={t('statistics')}
                  description={t('statisticsDesc')}
                  onClick={() => navigate('/admin/stats')}
                />
                <QuickActionCard
                  icon={<CreditCard className="w-8 h-8" />}
                  title={t('payments')}
                  description="Quản lý doanh thu và đối soát giao dịch"
                  onClick={() => navigate('/admin/payments')}
                />
                <QuickActionCard
                  icon={<ClipboardList className="w-8 h-8" />}
                  title="Báo cáo vận hành"
                  description="Xem báo cáo chi tiết về lịch hẹn và doanh thu"
                  onClick={() => navigate('/admin/reports')}
                />
                <QuickActionCard
                   icon={<Brain className="w-8 h-8" />}
                   title="Dữ liệu AI"
                   description="Giám sát chẩn đoán và điều phối AI"
                   onClick={() => navigate('/admin/ai-diagnoses')}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function QuickActionCard({ icon, title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-1 transition-colors duration-300"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
