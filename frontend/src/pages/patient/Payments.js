import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, API } from '@/App';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { CreditCard, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';

export default function PatientPayments() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API}/payments/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      toast.error('Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment) => {
    navigate(`/patient/payment/${payment.id}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử thanh toán</h1>
            <Button onClick={() => navigate('/patient/appointments')} variant="outline">
              Quay lại lịch hẹn
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Đang tải...</p>
          ) : payments.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <CreditCard className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có giao dịch</h2>
              <p className="text-gray-600 mb-6">Bạn chưa có giao dịch thanh toán nào</p>
              <Button onClick={() => navigate('/patient/appointments')} className="bg-gradient-to-r from-teal-500 to-cyan-500">
                Xem lịch hẹn
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map(payment => (
                <PaymentCard key={payment.id} payment={payment} onPayNow={handlePayNow} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function PaymentCard({ payment, onPayNow }) {
  const statusConfig = {
    pending: {
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      text: 'Chờ thanh toán'
    },
    processing: {
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'Đang xử lý'
    },
    completed: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      text: 'Thành công'
    },
    failed: {
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-red-100 text-red-800 border-red-200',
      text: 'Thất bại'
    },
    refunded: {
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      text: 'Đã hoàn tiền'
    }
  };

  const config = statusConfig[payment.status] || statusConfig.pending;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-bold text-xl text-gray-900">Thanh toán cho: {payment.doctor_name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${config.color}`}>
              {config.icon}
              {config.text}
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-gray-600">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Số tiền: <span className="font-bold text-teal-600">{payment.amount.toLocaleString()} VNĐ</span>
            </p>
            <p className="text-gray-600 text-sm">
              Phương thức: {getPaymentMethodName(payment.payment_method)}
            </p>
            {payment.transaction_id && (
              <p className="text-gray-600 text-sm">
                Mã GD: {payment.transaction_id}
              </p>
            )}
            <p className="text-gray-500 text-xs">
              Ngày tạo: {new Date(payment.created_at).toLocaleString('vi-VN')}
            </p>
            {payment.payment_date && (
              <p className="text-gray-500 text-xs">
                Ngày thanh toán: {new Date(payment.payment_date).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
        
        {payment.status === 'pending' && (
          <Button 
            onClick={() => onPayNow(payment)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            Thanh toán ngay
          </Button>
        )}
      </div>
    </div>
  );
}

function getPaymentMethodName(method) {
  const methods = {
    'mock_card': 'Thẻ tín dụng/ghi nợ',
    'mock_wallet': 'Ví điện tử',
    'mock_bank': 'Chuyển khoản ngân hàng'
  };
  return methods[method] || method;
}
