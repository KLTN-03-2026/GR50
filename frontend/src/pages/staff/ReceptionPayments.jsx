import React, { useState, useEffect, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  Filter,
  Banknote,
  QrCode,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ReceptionPayments() {
  const { token } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/staff/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices', error);
      toast.error('Lỗi khi tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method) => {
    if (!selectedInvoice) return;
    setProcessing(true);
    try {
      await axios.put(`${API}/staff/invoices/${selectedInvoice.id}/pay`, 
        { paymentMethod: method },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Đã ghi nhận thanh toán bằng ${method === 'cash' ? 'tiền mặt' : 'chuyển khoản'}`);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khi xử lý thanh toán');
    } finally {
      setProcessing(false);
    }
  };

  const paidCount = invoices.filter(i => i.status === 'PAID' || i.status === 'ThanhCong').length;
  const waitingCount = invoices.filter(i => i.status === 'ISSUED' || i.status === 'UNPAID' || i.status === 'ChoThanhToan' || i.status === 'PENDING').length;
  const errorCount = invoices.filter(i => i.status === 'FAILED' || i.status === 'CANCELLED' || i.status === 'Huy').length;

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Theo Dõi Thanh Toán</h1>
          <p className="text-gray-500 dark:text-gray-400">Hỗ trợ thanh toán trực tiếp và quản lý hóa đơn của bệnh nhân.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md bg-emerald-50 dark:bg-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-2xl text-white">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Đã thanh toán</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{paidCount} ca</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500 rounded-2xl text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Chờ thanh toán</p>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{waitingCount} ca</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500 rounded-2xl text-white">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Lỗi / Pending</p>
                  <p className="text-2xl font-black text-red-700 dark:text-red-300">{errorCount} ca</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl dark:bg-gray-800 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Danh sách hóa đơn gần đây</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Tìm hóa đơn..." className="pl-9 w-64 rounded-xl h-10" />
                </div>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã HĐ</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Số tiền</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {loading ? (
                    <tr><td colSpan="6" className="p-8 text-center animate-pulse">Đang tải dữ liệu...</td></tr>
                  ) : invoices.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chưa có giao dịch nào hôm nay.</td></tr>
                  ) : invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-teal-600 dark:text-teal-400 font-bold">#INV-{inv.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{inv.patient_name}</div>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`rounded-full border-none ${
                          inv.status === 'ThanhCong' || inv.status === 'PAID' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(inv.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="rounded-xl hover:bg-teal-50 hover:text-teal-600" onClick={() => setSelectedInvoice(inv)}>
                          <FileText className="w-4 h-4 mr-2" /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Detail Modal */}
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Chi tiết hóa đơn #INV-{selectedInvoice?.id}
                </span>
                <Badge className={
                    selectedInvoice?.status === 'PAID' || selectedInvoice?.status === 'ThanhCong' 
                    ? 'bg-emerald-100 text-emerald-700 border-none' 
                    : 'bg-amber-100 text-amber-700 border-none'
                }>
                  {selectedInvoice?.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6 py-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Bệnh nhân</p>
                    <p className="font-bold text-lg">{selectedInvoice.patient_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng cộng thanh toán</p>
                    <p className="font-black text-2xl text-teal-600">{formatCurrency(selectedInvoice.amount)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3">Chi tiết phí</h4>
                  <div className="space-y-3 bg-white border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí khám bệnh</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.fees?.phiKham)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí dịch vụ / Cận lâm sàng</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.fees?.phiDichVu)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền thuốc</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.fees?.phiThuoc)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Giảm giá</span>
                      <span className="font-medium">-{formatCurrency(selectedInvoice.fees?.giamGia)}</span>
                    </div>
                    <div className="pt-3 border-t flex justify-between font-bold text-lg">
                      <span>Tổng cộng</span>
                      <span className="text-teal-600">{formatCurrency(selectedInvoice.amount)}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.note && (
                  <div>
                    <h4 className="font-bold mb-2">Ghi chú</h4>
                    <p className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">{selectedInvoice.note}</p>
                  </div>
                )}

                {/* Actions */}
                {(selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'ThanhCong') ? (
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-bold">Hỗ trợ thanh toán trực tiếp</h4>
                    <div className="flex gap-4">
                      <Button 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                        size="lg"
                        onClick={() => handlePayment('cash')}
                        disabled={processing}
                      >
                        <Banknote className="w-5 h-5 mr-2" />
                        Thu tiền mặt
                      </Button>
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700" 
                        size="lg"
                        onClick={() => handlePayment('transfer')}
                        disabled={processing}
                      >
                        <QrCode className="w-5 h-5 mr-2" />
                        Xác nhận chuyển khoản
                      </Button>
                    </div>
                    <p className="text-xs text-center text-gray-500">Bệnh nhân cũng có thể tự thanh toán qua ứng dụng sau khi hóa đơn được chốt.</p>
                  </div>
                ) : (
                  <div className="border-t pt-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                      <Check className="w-5 h-5" /> Đã hoàn tất thanh toán
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
