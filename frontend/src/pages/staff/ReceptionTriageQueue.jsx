import React, { useState, useEffect, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { 
  Activity, 
  Brain, 
  ArrowRight, 
  Search, 
  Filter, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Send,
  User,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ReceptionTriageQueue() {
  const { token, currentFacility } = useContext(AuthContext);

  const [triageItems, setTriageItems] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (token && currentFacility) {
        fetchData();
    }
  }, [currentFacility, token]);


  const fetchData = async () => {
    try {
      const [triageRes, doctorsRes] = await Promise.all([
        axios.get(`${API}/staff/triage-queue?facility_id=${currentFacility.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/staff/doctors-coord?facility_id=${currentFacility.id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTriageItems(triageRes.data);

      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Không thể lấy dữ liệu phân loại hoặc danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedDoctorId) {
        toast.error("Vui lòng chọn bác sĩ");
        return;
    }

    setAssigning(true);
    try {
        await axios.post(`${API}/staff/triage/assign-doctor`,
            { triageId: selectedItem.id, doctorId: selectedDoctorId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Đã phân công bác sĩ thành công");
        setSelectedItem(null);
        setSelectedDoctorId('');
        fetchData(); // Refresh list
    } catch (error) {
        console.error('Error assigning doctor:', error);
        toast.error("Có lỗi xảy ra khi phân công bác sĩ");
    } finally {
        setAssigning(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hàng Chờ AI Triage</h1>
          <p className="text-gray-500 dark:text-gray-400">Xem kết quả phân loại từ AI để điều phối bệnh nhân đến đúng chuyên khoa.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Triage List */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="text-center py-12">Đang tải dữ liệu triage...</div>
            ) : triageItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-3xl">
                Không có bệnh nhân nào trong hàng chờ phân loại.
              </div>
            ) : triageItems
                .filter(item => {
                    if (filterPriority === 'high') {
                        return item.priority?.toLowerCase() === 'critical' || item.priority?.toLowerCase() === 'high' || item.priority?.toLowerCase() === 'cao' || item.priority?.toLowerCase() === 'khẩn cấp';
                    }
                    return true;
                })
                .map((item) => (
              <Card key={item.id} className="border-none shadow-lg hover:shadow-xl transition-all dark:bg-gray-800 rounded-3xl overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className={`w-2 md:w-3 ${getPriorityColor(item.priority)}`} />
                    <div className="p-6 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold">
                            {item.patient_name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{item.patient_name}</h3>
                            <Badge variant="outline" className={`mt-1 border-none ${getPriorityBadge(item.priority)}`}>
                              Ưu tiên: {item.priority || 'Bình thường'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                          <Activity className="w-4 h-4" />
                          Phân loại: <span className="text-teal-600 dark:text-teal-400 font-bold">{item.suggested_specialty || 'Chưa xác định'}</span>
                        </div>
                      </div>

                      <div className="mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                           <Brain className="w-5 h-5 text-purple-500 mt-1" />
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tóm tắt triệu chứng / Chẩn đoán</p>
                            <p className="text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">{item.summary}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button 
                          className="flex-1 rounded-xl bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 text-white"
                          onClick={() => setSelectedItem(item)}
                        >
                          Xem chi tiết & Điều phối
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column: Stats & Legends */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg dark:bg-gray-800 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg">Tình trạng phân loại</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${filterPriority === 'high' ? 'bg-red-100 ring-2 ring-red-400' : 'bg-red-50 hover:bg-red-100'} dark:bg-red-950/30`}
                  onClick={() => setFilterPriority(filterPriority === 'high' ? 'all' : 'high')}
                >
                  <span className="text-red-700 dark:text-red-400 font-bold text-sm">Cần ưu tiên</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-black">
                    {triageItems.filter(i => i.priority?.toLowerCase() === 'critical' || i.priority?.toLowerCase() === 'high' || i.priority?.toLowerCase() === 'cao' || i.priority?.toLowerCase() === 'khẩn cấp').length}
                  </span>
                </div>
                <div 
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${filterPriority === 'all' ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-blue-50 hover:bg-blue-100'} dark:bg-blue-950/30`}
                  onClick={() => setFilterPriority('all')}
                >
                  <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">Đang chờ (Tất cả)</span>
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-black">{triageItems.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-3xl">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg">AI Phân Luồng</h3>
                <p className="text-sm opacity-90">Sử dụng kết quả AI để tối ưu hóa thời gian chờ cho bệnh nhân.</p>
                <Button 
                  className="w-full bg-white text-indigo-600 hover:bg-gray-100 border-none"
                  onClick={() => setShowReport(true)}
                >
                  Xem báo cáo hiệu quả
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detail and Assignment Modal */}
        <Dialog open={!!selectedItem} onOpenChange={(open) => {
            if (!open) {
                setSelectedItem(null);
                setSelectedDoctorId('');
            }
        }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-teal-700">
                        <Activity className="w-6 h-6" />
                        Chi tiết phân loại AI & Điều phối
                    </DialogTitle>
                </DialogHeader>

                {selectedItem && (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">Bệnh nhân</p>
                                <p className="font-medium text-lg">{selectedItem.patient_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Cập nhật cuối</p>
                                <p className="font-medium">
                                    {selectedItem.time ? format(new Date(selectedItem.time), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-gray-700">
                                <Activity className="w-4 h-4" />
                                Tóm tắt triệu chứng
                            </h3>
                            <div className="p-4 bg-white border rounded-md text-gray-800 whitespace-pre-wrap">
                                {selectedItem.summary}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-purple-700">Chẩn đoán sơ bộ AI</h3>
                                <div className="p-4 bg-purple-50 rounded-md text-purple-900 border border-purple-100 h-full">
                                    {selectedItem.diagnosis}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-blue-700">Chuyên khoa gợi ý</h3>
                                <div className="p-4 bg-blue-50 rounded-md text-blue-900 border border-blue-100 font-medium h-full">
                                    {selectedItem.suggested_specialty}
                                </div>
                            </div>
                        </div>

                        {/* Assign Doctor Section */}
                        <div className="pt-6 border-t space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-gray-800">
                                <Send className="w-4 h-4" />
                                Điều phối cho Bác sĩ phụ trách
                            </h3>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Chọn bác sĩ trực</label>
                                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Chọn bác sĩ ${selectedItem.suggested_specialty !== 'Nội tổng hợp' ? `chuyên khoa ${selectedItem.suggested_specialty}` : ''}...`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors.map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                    BS. {doctor.full_name} - {doctor.specialty || 'Chưa rõ'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                    onClick={handleAssignDoctor}
                                    disabled={assigning || !selectedDoctorId}
                                >
                                    {assigning ? 'Đang điều phối...' : 'Chuyển ca khám'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>

        {/* AI Efficiency Report Modal */}
        <Dialog open={showReport} onOpenChange={setShowReport}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-indigo-700">
                        <Brain className="w-6 h-6" />
                        Báo cáo hiệu quả AI Triage
                    </DialogTitle>
                    <CardDescription>Thống kê số liệu hệ thống AI phân luồng trong tháng này</CardDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-xl text-center">
                            <p className="text-sm font-medium text-indigo-600 mb-1">Đã tiếp nhận</p>
                            <p className="text-3xl font-black text-indigo-700">1,284</p>
                            <p className="text-xs text-indigo-500 mt-1">ca bệnh</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl text-center">
                            <p className="text-sm font-medium text-green-600 mb-1">Độ chính xác</p>
                            <p className="text-3xl font-black text-green-700">94.2%</p>
                            <p className="text-xs text-green-500 mt-1">chuyên khoa</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl text-center">
                            <p className="text-sm font-medium text-purple-600 mb-1">Thời gian tiết kiệm</p>
                            <p className="text-3xl font-black text-purple-700">320</p>
                            <p className="text-xs text-purple-500 mt-1">giờ làm việc</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h4 className="font-semibold text-gray-800 mb-3">Lợi ích mang lại:</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                <span>Giảm 60% thời gian chờ đợi ở khâu lấy số và phân loại ban đầu.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                <span>Phát hiện sớm và đánh dấu cảnh báo đỏ cho 42 ca cấp cứu khẩn cấp.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                <span>Giảm 85% tải công việc khai thác bệnh sử cho nhân viên lễ tân.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t text-center">
                        <Button onClick={() => setShowReport(false)} className="bg-indigo-600 hover:bg-indigo-700">Đóng báo cáo</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
