import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, CheckCircle, XCircle, Trash2, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Doctors() {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, statusFilter]);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/department-head/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (error) {
      toast.error(t('errorFetchingDoctors'));
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.user_info?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.user_info?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doctor => doctor.status === statusFilter);
    }

    setFilteredDoctors(filtered);
  };

  const handleApprove = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/department-head/approve-doctor/${doctorId}?status=approved`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('doctorApprovedSuccess'));
      fetchDoctors();
    } catch (error) {
      toast.error(t('errorApprovingDoctor'));
    }
  };

  const handleReject = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/department-head/approve-doctor/${doctorId}?status=rejected`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('doctorRejectedSuccess'));
      fetchDoctors();
    } catch (error) {
      toast.error(t('errorRejectingDoctor'));
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm(t('confirmDeleteDoctor'))) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/department-head/remove-doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('doctorDeletedSuccess'));
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('errorDeletingDoctor'));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('manageDoctors')}</h1>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder={t('searchDoctors')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStatus')}</SelectItem>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="approved">{t('approved')}</SelectItem>
                    <SelectItem value="rejected">{t('rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{t('loading')}</p>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('noDoctorsFound')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map(doctor => (
                <DoctorCard 
                  key={doctor.user_id} 
                  doctor={doctor} 
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete} 
                  t={t} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function DoctorCard({ doctor, onApprove, onReject, onDelete, t }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4 flex-1">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {doctor.user_info?.full_name?.charAt(0) || 'D'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">{doctor.user_info?.full_name || t('doctor')}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusColors[doctor.status]}`}>
                {statusIcons[doctor.status]}
                {t(doctor.status)}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{doctor.user_info?.email}</p>
            {doctor.specialty_name && (
              <p className="text-teal-600 font-semibold mb-2">{t('specialty')}: {doctor.specialty_name}</p>
            )}
            {doctor.bio && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">{doctor.bio}</p>
            )}
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
              {doctor.experience_years > 0 && (
                <span>{doctor.experience_years} {t('years')} {t('experience')}</span>
              )}
              {doctor.consultation_fee > 0 && (
                <span>{t('fee')}: {doctor.consultation_fee.toLocaleString()} VNĐ</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {doctor.status === 'pending' && (
            <>
              <Button 
                onClick={() => onApprove(doctor.user_id)} 
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {t('approve')}
              </Button>
              <Button 
                onClick={() => onReject(doctor.user_id)} 
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                {t('reject')}
              </Button>
            </>
          )}
          <Button 
            onClick={() => handleDelete(doctor.user_id)} 
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t('remove')}
          </Button>
        </div>
      </div>
    </div>
  );
  
  function handleDelete(userId) {
    if (!window.confirm(t('confirmDeleteDoctor'))) return;
    onDelete(userId);
  }
}
