import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8002';

export default function Patients() {
  const { t } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/department-head/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data);
    } catch (error) {
      toast.error(t('errorFetchingPatients'));
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
    }

    setFilteredPatients(filtered);
  };

  const handleDelete = async (patientId, patientName) => {
    if (!window.confirm(`${t('confirmDeleteUser')} ${patientName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/department-head/remove-patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('userDeleted'));
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('cannotDeleteUser'));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('patientManagement')}</h1>

          {/* Search */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('searchPatients')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Patients List */}
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{t('loading')}</p>
          ) : filteredPatients.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">{t('fullName')}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t('email')}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t('registeredDate')}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, index) => (
                    <tr key={patient.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-teal-50 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {patient.full_name?.charAt(0) || 'P'}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{patient.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {patient.email}
                        {patient.password_display && (
                          <div className="text-xs font-mono mt-1 opacity-80">
                            PW: <span className="text-blue-600 font-bold">{patient.password_display}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => handleDelete(patient.id, patient.full_name)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t('remove')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
            {t('totalPatients')}: <span className="font-bold text-teal-600">{filteredPatients.length}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
