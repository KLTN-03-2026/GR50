import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Search, Trash2, Shield, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminStaffs() {
  const { token } = useContext(AuthContext);
  const { t } = useLanguage();
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffs();
  }, []);

  useEffect(() => {
    filterStaffs();
  }, [statusFilter, searchQuery, staffs]);

  const fetchStaffs = async () => {
    try {
      const response = await axios.get(`${API}/admin/staffs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffs(response.data);
      setFilteredStaffs(response.data);
    } catch (error) {
      toast.error('Lỗi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const filterStaffs = () => {
    let filtered = staffs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.employee_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStaffs(filtered);
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`${t('confirmDeleteUser')} ${userName}?`)) return;

    try {
      await axios.delete(`${API}/admin/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('userDeleted'));
      fetchStaffs();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('cannotDeleteUser'));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Quản lý Nhân viên / Lễ tân</h1>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Tìm kiếm nhân viên (Tên, Email, Mã NV)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Staff List */}
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{t('loading')}</p>
          ) : filteredStaffs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredStaffs.map(staff => (
                <StaffCard key={staff.id} staff={staff} onDelete={handleDelete} t={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StaffCard({ staff, onDelete, t }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {staff.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{staff.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[staff.status] || statusColors.inactive}`}>
                {staff.status === 'active' ? 'Hoạt động' : 'Ngừng HĐ'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{staff.email}</p>
            <p className="text-sm font-medium text-indigo-600">Mã NV: {staff.employee_code}</p>
          </div>
        </div>

        <Button
          onClick={() => onDelete(staff.user_id, staff.name)}
          variant="ghost"
          className="text-red-500 hover:bg-red-50 hover:text-red-700 p-2 h-auto"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-500" />
          <span>Chức danh: <strong>{staff.position || 'Nhân viên lễ tân'}</strong></span>
        </div>
        
        {staff.facilities?.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-2">
            <div className="flex items-center gap-2 mb-2 font-medium text-gray-700 dark:text-gray-200">
              <Building2 className="w-4 h-4 text-teal-500" />
              <span>Cơ sở y tế được phân công:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {staff.facilities.map(f => (
                <li key={f.id}>
                  <span className="font-semibold text-gray-800 dark:text-white">{f.name}</span>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {f.can_reception && <span className="mr-2 inline-block bg-teal-100 text-teal-800 px-1.5 rounded">Tiếp đón</span>}
                    {f.can_payment && <span className="inline-block bg-blue-100 text-blue-800 px-1.5 rounded">Thu ngân</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
