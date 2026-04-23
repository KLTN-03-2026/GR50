import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, CreditCard, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';

export default function AdminPayments() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchQuery, statusFilter, data]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
      setFilteredPayments(response.data.payments);
    } catch (error) {
      toast.error('Không thể tải dữ liệu thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    if (!data) return;

    let filtered = data.payments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6 flex items-center justify-center">
          <p className="text-red-500">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Quản lý thanh toán</h1>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon={<DollarSign className="w-8 h-8" />}
              title="Tổng doanh thu"
              value={`${data.stats.total_revenue.toLocaleString()} VNĐ`}
              color="green"
            />
            <StatsCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="Đã thanh toán"
              value={data.stats.completed_payments}
              color="teal"
            />
            <StatsCard
              icon={<Clock className="w-8 h-8" />}
              title="Chờ thanh toán"
              value={data.stats.pending_payments}
              color="yellow"
            />
            <StatsCard
              icon={<CreditCard className="w-8 h-8" />}
              title="Tổng giao dịch"
              value={data.stats.total_payments}
              color="blue"
            />
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Tìm theo tên bệnh nhân, bác sĩ, mã GD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ thanh toán</SelectItem>
                  <SelectItem value="completed">Đã thanh toán</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Mã GD</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Bệnh nhân</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Bác sĩ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Số tiền</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Phương thức</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        Không tìm thấy giao dịch
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(payment => (
                      <PaymentRow key={payment.payment_id} payment={payment} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatsCard({ icon, title, value, color }) {
  const colorClasses = {
    green: 'from-green-500 to-emerald-500',
    teal: 'from-teal-500 to-cyan-500',
    yellow: 'from-yellow-500 to-orange-500',
    blue: 'from-blue-500 to-indigo-500'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-600 dark:text-gray-300 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function PaymentRow({ payment }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ thanh toán' },
    processing: { color: 'bg-blue-100 text-blue-800', text: 'Đang xử lý' },
    completed: { color: 'bg-green-100 text-green-800', text: 'Thành công' },
    failed: { color: 'bg-red-100 text-red-800', text: 'Thất bại' },
    refunded: { color: 'bg-purple-100 text-purple-800', text: 'Đã hoàn tiền' }
  };

  const status = statusConfig[payment.status] || statusConfig.pending;

  const methodNames = {
    'mock_card': 'Thẻ',
    'mock_wallet': 'Ví điện tử',
    'mock_bank': 'Ngân hàng'
  };

  return (
    <tr className="hover:bg-gray-50 dark:bg-gray-800">
      <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
        {payment.transaction_id || '-'}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{payment.patient_name}</td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{payment.doctor_name}</td>
      <td className="px-6 py-4 text-sm font-semibold text-teal-600">
        {payment.amount.toLocaleString()} VNĐ
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
        {methodNames[payment.payment_method] || payment.payment_method}
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
          {status.text}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
        {new Date(payment.created_at).toLocaleDateString('vi-VN')}
      </td>
    </tr>
  );
}
