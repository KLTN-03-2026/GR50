import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext, API } from '@/App';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Wallet, Building, ArrowLeft, CheckCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';

export default function PaymentProcess() {
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const { token } = useContext(AuthContext);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mock_card');
  const [formData, setFormData] = useState({
    card_number: '4111111111111111',
    card_holder: 'NGUYEN VAN A',
    expiry: '12/25',
    cvv: '123'
  });

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const response = await axios.get(`${API}/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayment(response.data);
      setPaymentMethod(response.data.payment_method);
    } catch (error) {
      toast.error('Không thể tải thông tin thanh toán');
      navigate('/patient/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await axios.post(`${API}/payments/${paymentId}/process`, {
        ...formData,
        success: true // Mock: always success for demo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'completed') {
        toast.success('Thanh toán thành công!');
        setTimeout(() => {
          navigate('/patient/payments');
        }, 2000);
      } else {
        toast.error('Thanh toán thất bại!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Thanh toán thất bại');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6 flex items-center justify-center">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  if (!payment || payment.status !== 'pending') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Không thể thanh toán</h2>
              <p className="text-gray-600 mb-6">
                {payment?.status === 'completed' ? 'Thanh toán này đã được xử lý' : 'Thanh toán không hợp lệ'}
              </p>
              <Button onClick={() => navigate('/patient/payments')}>
                Quay lại lịch sử thanh toán
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/patient/payments')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Payment Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin thanh toán</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Bác sĩ</p>
                    <p className="font-semibold text-gray-900">{payment.doctor_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bệnh nhân</p>
                    <p className="font-semibold text-gray-900">{payment.patient_name}</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="text-2xl font-bold text-teal-600">{payment.amount.toLocaleString()} VNĐ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>

                {/* Payment Method Selection */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <PaymentMethodButton
                    icon={<CreditCard className="w-6 h-6" />}
                    label="Thẻ tín dụng"
                    value="mock_card"
                    selected={paymentMethod === 'mock_card'}
                    onClick={() => setPaymentMethod('mock_card')}
                  />
                  <PaymentMethodButton
                    icon={<Wallet className="w-6 h-6" />}
                    label="Ví điện tử"
                    value="mock_wallet"
                    selected={paymentMethod === 'mock_wallet'}
                    onClick={() => setPaymentMethod('mock_wallet')}
                  />
                  <PaymentMethodButton
                    icon={<Building className="w-6 h-6" />}
                    label="Ngân hàng"
                    value="mock_bank"
                    selected={paymentMethod === 'mock_bank'}
                    onClick={() => setPaymentMethod('mock_bank')}
                  />
                </div>

                {/* Payment Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {paymentMethod === 'mock_card' && (
                    <>
                      <div>
                        <Label htmlFor="card_number">Số thẻ</Label>
                        <Input
                          id="card_number"
                          value={formData.card_number}
                          onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                          placeholder="1234 5678 9012 3456"
                          maxLength="16"
                          required
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Demo: 4111111111111111</p>
                      </div>

                      <div>
                        <Label htmlFor="card_holder">Tên chủ thẻ</Label>
                        <Input
                          id="card_holder"
                          value={formData.card_holder}
                          onChange={(e) => setFormData({ ...formData, card_holder: e.target.value })}
                          placeholder="NGUYEN VAN A"
                          required
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Ngày hết hạn</Label>
                          <Input
                            id="expiry"
                            value={formData.expiry}
                            onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                            placeholder="MM/YY"
                            maxLength="5"
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            value={formData.cvv}
                            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                            placeholder="123"
                            maxLength="3"
                            required
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'mock_wallet' && (
                    <div className="text-center py-8">
                      <Wallet className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Ví điện tử demo - Nhấn thanh toán để hoàn tất
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'mock_bank' && (
                    <div className="text-center py-8">
                      <Building className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Chuyển khoản ngân hàng demo - Nhấn thanh toán để hoàn tất
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Demo Mode:</strong> Đây là hệ thống thanh toán giả lập. Không có giao dịch thật được thực hiện.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-lg py-6"
                  >
                    {processing ? (
                      'Đang xử lý...'
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Thanh toán {payment.amount.toLocaleString()} VNĐ
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function PaymentMethodButton({ icon, label, value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-teal-500 bg-teal-50'
          : 'border-gray-200 hover:border-teal-300'
      }`}
    >
      <div className={`${selected ? 'text-teal-600' : 'text-gray-600'}`}>
        {icon}
      </div>
      <p className={`text-sm mt-2 font-medium ${selected ? 'text-teal-900' : 'text-gray-700'}`}>
        {label}
      </p>
    </button>
  );
}
