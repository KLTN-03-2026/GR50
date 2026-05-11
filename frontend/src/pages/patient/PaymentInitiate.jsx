import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, Wallet, Building, ArrowLeft, CheckCircle, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export default function PaymentInitiate() {
    const navigate = useNavigate();
    const { appointmentId } = useParams();
    const { token } = useContext(AuthContext);
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initiating, setInitiating] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('BANK_QR');
    const [policyAccepted, setPolicyAccepted] = useState(true);
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchAppointment();
    }, [appointmentId]);

    const fetchAppointment = async () => {
        try {
            const response = await axios.get(`${API}/appointments/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const apt = response.data.find(a => a.id.toString() === appointmentId);
            if (!apt) throw new Error('Not found');
            setAppointment(apt);
        } catch (error) {
            toast.error('Không tìm thấy thông tin lịch hẹn');
            navigate('/patient/appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleInitiate = async () => {
        if (!policyAccepted) {
            toast.error('Vui lòng chấp nhận chính sách thanh toán');
            return;
        }

        setInitiating(true);
        try {
            const response = await axios.post(`${API}/payments/appointments/${appointmentId}/initiate`, {
                paymentMethod,
                policyAccepted: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPaymentRequest(response.data);
            toast.success('Yêu cầu thanh toán đã được tạo');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Lỗi khởi tạo thanh toán');
        } finally {
            setInitiating(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Đã sao chép!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Simulated Webhook for Demo
    const simulateWebhook = async () => {
        if (!paymentRequest) return;
        setInitiating(true);
        try {
            await axios.post(`${API}/payments/webhooks/bank`, {
                orderId: paymentRequest.paymentId,
                transactionId: `DEMO-${Date.now()}`,
                amount: paymentRequest.amount,
                content: paymentRequest.transferContent,
                status: 'SUCCESS'
            });
            toast.success('Hệ thống đã nhận được tiền! Đang cập nhật lịch hẹn...');
            setTimeout(() => navigate('/patient/appointments'), 2000);
        } catch (error) {
            toast.error('Lỗi mô phỏng thanh toán');
        } finally {
            setInitiating(false);
        }
    };

    if (loading) return <Layout><div className="p-8 text-center">Đang tải...</div></Layout>;

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <Button variant="ghost" onClick={() => navigate('/patient/appointments')} className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                    </Button>

                    {!paymentRequest ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <Card className="p-8 border-none shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <CreditCard className="text-blue-600" /> Chọn phương thức thanh toán
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                        <MethodCard 
                                            active={paymentMethod === 'BANK_QR'} 
                                            onClick={() => setPaymentMethod('BANK_QR')}
                                            icon={<Building className="w-8 h-8" />}
                                            title="Chuyển khoản / Quét mã QR"
                                            desc="Xác nhận nhanh 1-2 phút"
                                        />
                                        <MethodCard 
                                            active={paymentMethod === 'VNPAY'} 
                                            onClick={() => setPaymentMethod('VNPAY')}
                                            icon={<Wallet className="w-8 h-8" />}
                                            title="Cổng VNPAY / Ví điện tử"
                                            desc="ATM, Thẻ quốc tế, Ví Momo"
                                        />
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 mb-8">
                                        <div className="flex gap-3">
                                            <ShieldCheck className="text-blue-600 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Cam kết bảo mật</p>
                                                <p className="text-xs text-blue-800/80 dark:text-blue-200/80">Thông tin giao dịch của bạn được mã hóa 256-bit theo tiêu chuẩn PCI DSS.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 mb-8">
                                        <input 
                                            type="checkbox" 
                                            id="policy" 
                                            className="mt-1" 
                                            checked={policyAccepted}
                                            onChange={(e) => setPolicyAccepted(e.target.checked)}
                                        />
                                        <label htmlFor="policy" className="text-sm text-slate-600 dark:text-slate-400">
                                            Tôi đồng ý với <span className="text-blue-600 cursor-pointer">Chính sách đặt lịch và hoàn tiền</span> của MediSched AI. Lịch hẹn chỉ có hiệu lực sau khi thanh toán thành công.
                                        </label>
                                    </div>

                                    <Button 
                                        onClick={handleInitiate}
                                        disabled={initiating}
                                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-2xl"
                                    >
                                        {initiating ? "Đang xử lý..." : "Tiến hành thanh toán"}
                                    </Button>
                                </Card>
                            </div>

                            <div className="md:col-span-1">
                                <Card className="p-6 border-none shadow-xl bg-white dark:bg-slate-800 rounded-3xl sticky top-6">
                                    <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Mã lịch hẹn:</span>
                                            <span className="font-bold">{appointment.code}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Bác sĩ:</span>
                                            <span className="font-medium">{appointment.doctor_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Ngày khám:</span>
                                            <span>{appointment.appointment_date}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Giờ khám:</span>
                                            <span>{appointment.appointment_time}</span>
                                        </div>
                                        <hr className="border-slate-100 dark:border-slate-700" />
                                        <div className="flex justify-between items-end">
                                            <span className="text-slate-500">Tổng cộng:</span>
                                            <span className="text-2xl font-black text-blue-600">500.000đ</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <Card className="max-w-2xl mx-auto p-8 border-none shadow-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] text-center">
                            <div className="mb-8">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold">Đang chờ thanh toán</h2>
                                <p className="text-slate-500">Vui lòng quét mã bên dưới để hoàn tất</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl mb-8 border border-slate-100 dark:border-slate-700">
                                <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4 border-2 border-blue-500">
                                    <img src={paymentRequest.qrCodeUrl} alt="QR" className="w-64 h-64 mx-auto" />
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3 text-left max-w-sm mx-auto">
                                    <div className="flex justify-between bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
                                        <span className="text-xs text-slate-500">Số tiền:</span>
                                        <span className="font-bold text-blue-600">{paymentRequest.amount.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex justify-between bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
                                        <span className="text-xs text-slate-500">Nội dung:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{paymentRequest.transferContent}</span>
                                            <button onClick={() => copyToClipboard(paymentRequest.transferContent)} className="text-blue-500 hover:text-blue-600">
                                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 justify-center text-amber-600 text-sm font-medium bg-amber-50 dark:bg-amber-900/20 py-2 rounded-full">
                                    <AlertCircle size={16} /> QR hết hạn sau 15:00 phút
                                </div>
                                <Button 
                                    onClick={simulateWebhook}
                                    disabled={initiating}
                                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold"
                                >
                                    {initiating ? "Đang kiểm tra..." : "Tôi đã chuyển khoản thành công"}
                                </Button>
                                <p className="text-xs text-slate-400">Nếu bạn đã chuyển khoản mà hệ thống chưa cập nhật, vui lòng đợi 1-3 phút hoặc liên hệ Hotline: 1900 1234</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function MethodCard({ active, onClick, icon, title, desc }) {
    return (
        <div 
            onClick={onClick}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${
                active 
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 ring-4 ring-blue-500/10' 
                : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
        >
            <div className={`${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {icon}
            </div>
            <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
            {active && (
                <div className="absolute top-4 right-4 text-blue-600">
                    <CheckCircle size={20} fill="currentColor" className="text-blue-600 bg-white rounded-full" />
                </div>
            )}
        </div>
    );
}

function Clock(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
}
