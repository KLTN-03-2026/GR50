import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { 
    Search, 
    Users, 
    History, 
    FileText, 
    CreditCard, 
    Activity, 
    Calendar,
    ChevronRight,
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
    Brain
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPatientArchive() {
  const { token } = useContext(AuthContext);
  const { t } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [archiveData, setArchiveData] = useState(null);
  const [fetchingArchive, setFetchingArchive] = useState(false);

  useEffect(() => {
    fetchArchiveIndex();
  }, []);

  const fetchArchiveIndex = async (query = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/patients/archive/search`, {
        params: { query },
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data);
    } catch (error) {
      toast.error('Không thể tải kho lưu trữ bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArchiveIndex(searchQuery);
  };

  const viewPatientArchive = async (patientId) => {
    setSelectedPatientId(patientId);
    setFetchingArchive(true);
    try {
      const response = await axios.get(`${API}/admin/patients/archive/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // NEW: Fetch AI history for this patient
      const aiResponse = await axios.get(`${API}/ai/recent-diagnoses`, {
        params: { patientId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setArchiveData({
          ...response.data,
          aiHistory: aiResponse.data
      });
    } catch (error) {
      toast.error('Lỗi khi tải hồ sơ chi tiết');
      setSelectedPatientId(null);
    } finally {
      setFetchingArchive(false);
    }
  };

  if (selectedPatientId && archiveData) {
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Button 
                        variant="ghost" 
                        onClick={() => { setSelectedPatientId(null); setArchiveData(null); }}
                        className="mb-6 hover:bg-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="lg:col-span-1 border-0 shadow-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
                            <CardContent className="pt-6 text-center">
                                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-black mx-auto mb-4 border-4 border-white/30">
                                    {archiveData.patientInfo?.NguoiDung?.HoTen?.charAt(0) || 'P'}
                                </div>
                                <h2 className="text-2xl font-bold">{archiveData.patientInfo?.NguoiDung?.HoTen}</h2>
                                <p className="text-teal-100 mb-4">{archiveData.summary.displayPatientId}</p>
                                <div className="space-y-2 text-left bg-black/10 p-4 rounded-xl text-sm">
                                    <p><span className="opacity-70">SĐT:</span> {archiveData.patientInfo?.NguoiDung?.SoDienThoai}</p>
                                    <p><span className="opacity-70">Email:</span> {archiveData.patientInfo?.NguoiDung?.Email}</p>
                                    <p><span className="opacity-70">Ngày sinh:</span> {new Date(archiveData.patientInfo?.NguoiDung?.NgaySinh).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                             <StatCard label="Tổng lượt khám" value={archiveData.summary.totalAppointments} icon={<Calendar className="text-teal-500" />} color="bg-teal-50" />
                             <StatCard label="Đã hoàn thành" value={archiveData.summary.completedAppointments} icon={<CheckCircle2 className="text-blue-500" />} color="bg-blue-50" />
                             <StatCard label="Giao dịch" value={archiveData.summary.totalTransactions} icon={<CreditCard className="text-purple-500" />} color="bg-purple-50" />
                        </div>
                    </div>

                    <Tabs defaultValue="appointments" className="w-full">
                        <TabsList className="bg-white p-1 rounded-xl shadow-sm mb-6 border w-full justify-start overflow-x-auto h-auto">
                            <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                                <Clock className="w-4 h-4 mr-2" /> Lịch sử đặt lịch
                            </TabsTrigger>
                            <TabsTrigger value="records" className="rounded-lg data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                                <FileText className="w-4 h-4 mr-2" /> Hồ sơ bệnh án
                            </TabsTrigger>
                            <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                                <CreditCard className="w-4 h-4 mr-2" /> Thanh toán & Hóa đơn
                            </TabsTrigger>
                            <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                                <Brain className="w-4 h-4 mr-2" /> Dữ liệu AI
                            </TabsTrigger>
                            <TabsTrigger value="cancellations" className="rounded-lg data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                                <XCircle className="w-4 h-4 mr-2" /> Biên lai hủy
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="appointments">
                            <ArchiveTable 
                                columns={['Mã', 'Ngày khám', 'Bác sĩ', 'Trạng thái', 'Chi phí']}
                                data={archiveData.appointments}
                                renderRow={(item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-teal-700">{item.snapshotData.MaDatLich}</td>
                                        <td className="px-6 py-4">{new Date(item.snapshotData.ThoiDiemDat).toLocaleString('vi-VN')}</td>
                                        <td className="px-6 py-4">{item.snapshotData.BacSi?.NguoiDung?.HoTen || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={item.snapshotData.TrangThai === 'COMPLETED' ? 'success' : 'secondary'}>
                                                {item.snapshotData.TrangThai}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{(parseFloat(item.snapshotData.GiaTien) || 0).toLocaleString()} VNĐ</td>
                                    </tr>
                                )}
                            />
                        </TabsContent>

                        <TabsContent value="records">
                             <ArchiveTable 
                                columns={['Mã HS', 'Chẩn đoán', 'Điều trị', 'Ngày lưu', 'Lưu bởi']}
                                data={archiveData.medicalRecords}
                                renderRow={(item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-blue-700">HS-{item.sourceId}</td>
                                        <td className="px-6 py-4 italic">"{item.snapshotData.ChanDoan}"</td>
                                        <td className="px-6 py-4 truncate max-w-xs">{item.snapshotData.KeHoachDieuTri}</td>
                                        <td className="px-6 py-4 text-xs">{new Date(item.archivedAt).toLocaleString('vi-VN')}</td>
                                        <td className="px-6 py-4"><Badge variant="outline">{item.archivedBy}</Badge></td>
                                    </tr>
                                )}
                             />
                        </TabsContent>

                        <TabsContent value="billing">
                             <ArchiveTable 
                                columns={['Mã Giao dịch', 'Ngày', 'Số tiền', 'Loại', 'Trạng thái']}
                                data={archiveData.payments}
                                renderRow={(item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-xs">{item.snapshotData.MaGiaoDich}</td>
                                        <td className="px-6 py-4">{new Date(item.snapshotData.ThoiDiemThanhToan).toLocaleString('vi-VN')}</td>
                                        <td className="px-6 py-4 font-bold text-green-600">{(parseFloat(item.snapshotData.SoTien) || 0).toLocaleString()} VNĐ</td>
                                        <td className="px-6 py-4">{item.snapshotData.PhuongThuc}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={item.snapshotData.TrangThai === 'PAID' ? 'success' : 'warning'}>
                                                {item.snapshotData.TrangThai}
                                            </Badge>
                                        </td>
                                    </tr>
                                )}
                             />
                        </TabsContent>

                        <TabsContent value="ai">
                             <ArchiveTable 
                                columns={['Thời điểm', 'Triệu chứng', 'Gợi ý AI', 'Chuyên khoa', 'Trạng thái']}
                                data={archiveData.aiHistory}
                                renderRow={(item) => (
                                    <tr key={item.id} className="border-b hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-xs">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                                                <span className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[150px]">
                                            <p className="text-xs font-medium text-gray-500 line-clamp-2 italic">"{item.symptoms}"</p>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <p className="text-xs font-black text-indigo-600 line-clamp-2">"{item.aiSummary}"</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="border-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-tighter">
                                                {item.suggestedSpecialty}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                item.status === 'RECONCILED_MATCHED' ? 'text-emerald-600' :
                                                item.status === 'RECONCILED_MISMATCH' ? 'text-red-600' :
                                                'text-amber-600'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                )}
                             />
                        </TabsContent>

                        <TabsContent value="cancellations">
                             <ArchiveTable 
                                columns={['Mã Biên lai', 'Lý do', 'Ngày hủy', 'Phí gốc', 'Khấu trừ']}
                                data={archiveData.cancellations}
                                renderRow={(item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50 text-red-700">
                                        <td className="px-6 py-4 font-bold">{item.snapshotData.receiptCode}</td>
                                        <td className="px-6 py-4">{item.snapshotData.reason}</td>
                                        <td className="px-6 py-4">{new Date(item.snapshotData.cancelTime).toLocaleString('vi-VN')}</td>
                                        <td className="px-6 py-4">{(parseFloat(item.snapshotData.originalFee) || 0).toLocaleString()} VNĐ</td>
                                        <td className="px-6 py-4 font-black">{(parseFloat(item.snapshotData.penaltyAmount) || 0).toLocaleString()} VNĐ</td>
                                    </tr>
                                )}
                             />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <History className="w-10 h-10 text-teal-600" />
                    Kho lưu trữ hồ sơ bệnh nhân
                </h1>
                <p className="text-gray-500 mt-1">Tra cứu lịch sử khám, bệnh án và giao dịch toàn diện.</p>
            </div>
          </div>

          {/* Search Box */}
          <Card className="border-0 shadow-lg rounded-3xl overflow-hidden mb-8">
            <CardContent className="p-0">
                <form onSubmit={handleSearch} className="flex items-center bg-white">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Nhập Patient ID (PAT-...), Họ tên hoặc Số điện thoại..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 h-16 pl-16 pr-6 text-lg rounded-none"
                        />
                    </div>
                    <Button type="submit" className="h-16 px-10 bg-teal-600 hover:bg-teal-700 rounded-none text-lg">
                        Tra cứu
                    </Button>
                </form>
            </CardContent>
          </Card>

          {/* Archive List */}
          <div className="grid grid-cols-1 gap-4">
             {loading ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                    <Activity className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Đang tìm kiếm trong kho lưu trữ...</p>
                </div>
             ) : patients.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-200">
                    <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">Không tìm thấy kết quả</h3>
                    <p className="text-gray-400">Vui lòng kiểm tra lại ID bệnh nhân hoặc thông tin tìm kiếm.</p>
                </div>
             ) : (
                patients.map(patient => (
                    <Card 
                        key={patient.id} 
                        className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() => viewPatientArchive(patient.patientId)}
                    >
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row md:items-center">
                                <div className="p-6 flex-1 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 font-black text-2xl group-hover:scale-110 transition-transform">
                                        {patient.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-xl font-bold text-gray-900">{patient.fullName}</h4>
                                            <Badge variant="outline" className="text-teal-600 border-teal-200">
                                                {patient.displayPatientId}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> {patient.phone}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Lần cuối: {patient.latestVisitAt ? new Date(patient.latestVisitAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 flex gap-8 border-l border-gray-100">
                                     <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Tổng lịch</p>
                                        <p className="text-lg font-black text-gray-700">{patient.totalAppointments}</p>
                                     </div>
                                     <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Đã khám</p>
                                        <p className="text-lg font-black text-blue-600">{patient.completedAppointments}</p>
                                     </div>
                                     <div className="flex items-center">
                                        <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                                     </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
             )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, icon, color }) {
    return (
        <Card className={`border-0 shadow-lg ${color}`}>
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold opacity-60 uppercase">{label}</span>
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        {icon}
                    </div>
                </div>
                <p className="text-3xl font-black text-gray-900">{value}</p>
            </CardContent>
        </Card>
    );
}

function ArchiveTable({ columns, data, renderRow }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed">
                <Info className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400">Không có dữ liệu trong kho lưu trữ cho mục này.</p>
            </div>
        );
    }
    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        {columns.map(col => (
                            <th key={col} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(renderRow)}
                </tbody>
            </table>
        </div>
    );
}
