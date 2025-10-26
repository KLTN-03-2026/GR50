import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext, API } from '@/App';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Wallet, Building, ArrowLeft, CheckCircle, Copy, Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export default function PaymentProcess() {
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const { token } = useContext(AuthContext);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mock_card');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    card_number: '4111111111111111',
    card_holder: 'NGUYEN VAN A',
    expiry: '12/25',
    cvv: '123',
    // Bank transfer fields
    bank_account_number: '',
    bank_account_name: '',
    bank_name: '',
    bank_branch: ''
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
        payment_method: paymentMethod,
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Đã sao chép!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate VietQR data
  const generateVietQRData = () => {
    const bankAccount = '1017592879600097'; // Example account number
    const bankCode = '970422'; // VietinBank code
    const amount = payment?.amount || 0;
    const description = `HD${paymentId.slice(-8)}`;
    
    // VietQR format: https://img.vietqr.io/image/[BANK]-[ACCOUNT]-[TEMPLATE].jpg?amount=[AMOUNT]&addInfo=[DESCRIPTION]
    return `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact.jpg?amount=${amount}&addInfo=${description}&accountName=MEDISCHEDULE`;
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
                    <div className="text-center py-4">
                      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          💳 Thanh toán
                        </h3>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <p className="text-sm text-gray-600">Mã đơn hàng:</p>
                          <code className="bg-white px-3 py-1 rounded-lg text-teal-600 font-mono text-sm font-bold">
                            HD{paymentId.slice(-8)}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`HD${paymentId.slice(-8)}`)}
                            className="p-1 hover:bg-white rounded transition-colors"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                          </button>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">Tổng tiền:</p>
                          <p className="text-3xl font-bold text-teal-600">{payment.amount.toLocaleString()} VNĐ</p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-lg mb-4 inline-block">
                        <div className="bg-white p-4 rounded-xl border-4 border-teal-500">
                          <img 
                            src={generateVietQRData()}
                            alt="VietQR Code"
                            className="w-64 h-64 mx-auto"
                            onError={(e) => {
                              // Fallback to QR code if image fails
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div style={{display: 'none'}}>
                            <QRCodeSVG 
                              value={`VietQR|970422|1017592879600097|${payment.amount}|HD${paymentId.slice(-8)}|MEDISCHEDULE`}
                              size={256}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-left bg-blue-50 rounded-xl p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Quét mã QR để thanh toán:</p>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                          <li>Mở ứng dụng ngân hàng của bạn</li>
                          <li>Chọn chức năng quét mã QR</li>
                          <li>Quét mã QR phía trên</li>
                          <li>Xác nhận thông tin và thanh toán</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'mock_bank' && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Building className="w-5 h-5 text-blue-600" />
                          Thông tin chuyển khoản
                        </h3>
                        
                        <div className="bg-white rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ngân hàng:</span>
                            <span className="font-semibold text-gray-900">VietinBank</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Chi nhánh:</span>
                            <span className="font-semibold text-gray-900">Hà Nội</span>
                          </div>
                          <div className="flex justify-between items-center border-t pt-3">
                            <span className="text-sm text-gray-600">Số tài khoản:</span>
                            <div className="flex items-center gap-2">
                              <code className="font-mono font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded">
                                1017592879600097
                              </code>
                              <button
                                type="button"
                                onClick={() => copyToClipboard('1017592879600097')}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Chủ tài khoản:</span>
                            <span className="font-semibold text-gray-900">MEDISCHEDULE</span>
                          </div>
                          <div className="flex justify-between items-center border-t pt-3">
                            <span className="text-sm text-gray-600">Số tiền:</span>
                            <span className="text-xl font-bold text-teal-600">{payment.amount.toLocaleString()} VNĐ</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Nội dung:</span>
                            <div className="flex items-center gap-2">
                              <code className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                                HD{paymentId.slice(-8)}
                              </code>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(`HD${paymentId.slice(-8)}`)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800 font-medium mb-2">⚠️ Lưu ý quan trọng:</p>
                        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                          <li>Vui lòng chuyển <strong>ĐÚNG số tiền</strong> {payment.amount.toLocaleString()} VNĐ</li>
                          <li>Ghi <strong>ĐÚNG nội dung</strong> HD{paymentId.slice(-8)} để hệ thống xác nhận tự động</li>
                          <li>Sau khi chuyển khoản, vui lòng nhấn "Hoàn tất thanh toán" bên dưới</li>
                        </ul>
                      </div>
                    </div>
                  )}

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
                        {paymentMethod === 'mock_bank' || paymentMethod === 'mock_wallet' 
                          ? 'Hoàn tất thanh toán'
                          : `Thanh toán ${payment.amount.toLocaleString()} VNĐ`
                        }
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
