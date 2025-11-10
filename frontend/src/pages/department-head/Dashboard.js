import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, UserCheck, UserPlus, Calendar, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function DepartmentHeadDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/department-head/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-2xl ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('departmentHeadDashboard')}</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={Users}
              title={t('totalDoctors')}
              value={stats?.total_doctors || 0}
              subtitle={`${stats?.approved_doctors || 0} ${t('approved')}`}
              color="bg-gradient-to-br from-teal-500 to-cyan-500"
              onClick={() => navigate('/department-head/doctors')}
            />
            
            <StatCard
              icon={UserCheck}
              title={t('approvedDoctors')}
              value={stats?.approved_doctors || 0}
              subtitle={`${stats?.pending_doctors || 0} ${t('pending')}`}
              color="bg-gradient-to-br from-green-500 to-emerald-500"
              onClick={() => navigate('/department-head/doctors')}
            />
            
            <StatCard
              icon={UserPlus}
              title={t('totalPatients')}
              value={stats?.total_patients || 0}
              color="bg-gradient-to-br from-purple-500 to-pink-500"
              onClick={() => navigate('/department-head/patients')}
            />
            
            <StatCard
              icon={Calendar}
              title={t('totalAppointments')}
              value={stats?.total_appointments || 0}
              color="bg-gradient-to-br from-orange-500 to-red-500"
            />
            
            <StatCard
              icon={ClipboardCheck}
              title={t('completedAppointments')}
              value={stats?.completed_appointments || 0}
              color="bg-gradient-to-br from-teal-500 to-blue-500"
            />
            
            <StatCard
              icon={TrendingUp}
              title={t('successRate')}
              value={stats?.total_appointments > 0 
                ? `${Math.round((stats?.completed_appointments / stats?.total_appointments) * 100)}%`
                : '0%'}
              color="bg-gradient-to-br from-indigo-500 to-purple-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('quickActions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/department-head/create-accounts')}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                <span>{t('createAccount')}</span>
              </button>
              
              <button
                onClick={() => navigate('/department-head/doctors')}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Users className="w-5 h-5" />
                <span>{t('manageDoctors')}</span>
              </button>
              
              <button
                onClick={() => navigate('/department-head/patients')}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Users className="w-5 h-5" />
                <span>{t('managePatients')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
