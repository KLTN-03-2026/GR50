import { useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { AuthContext } from '@/App';
import Layout from '../../components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, FileText, BarChart, Shield, UserPlus } from 'lucide-react';
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
            <QuickActionCard
              icon={<UserPlus className="w-8 h-8" />}
              title={t('createAccount')}
              description={t('createAccountDesc')}
              onClick={() => navigate('/admin/create-accounts')}
            />
            <QuickActionCard
              icon={<Users className="w-8 h-8" />}
              title={t('manageDoctors')}
              description={t('manageDoctorsDesc')}
              onClick={() => navigate('/admin/doctors')}
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
            {user?.admin_permissions?.can_create_admins && (
              <QuickActionCard
                icon={<Shield className="w-8 h-8" />}
                title={t('manageAdmins')}
                description={t('manageAdminsDesc')}
                onClick={() => navigate('/admin/admins')}
              />
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
      className="bg-card text-card-foreground rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-1 transition-colors duration-300"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
