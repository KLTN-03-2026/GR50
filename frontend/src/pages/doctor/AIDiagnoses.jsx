import React, { useState, useEffect, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { 
  Activity, 
  Search, 
  User,
  Clock,
  Brain,
  Filter,
  CheckCircle2,
  Sparkles,
  ClipboardCheck,
  Stethoscope as StethoscopeIcon,
  ShieldCheck,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function DoctorAIDiagnoses() {
  const { token, user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  
  const [reconForm, setReconForm] = useState({
    doctorSymptomsObserved: '',
    preliminaryDiagnosis: '',
    doctorFinalConclusion: '',
    testOrders: '',
    priorityLevelActual: 'NORMAL',
    doctorSpecialtyId: null
  });

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    if (selectedSession) {
        setReconForm({
            doctorSymptomsObserved: selectedSession.symptoms || '',
            preliminaryDiagnosis: selectedSession.aiSummary || '',
            doctorFinalConclusion: '',
            testOrders: '',
            priorityLevelActual: 'NORMAL',
            doctorSpecialtyId: null
        });
    }
  }, [selectedSession]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/ai/recent-diagnoses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (e) {
      toast.error("Không thể tải danh sách AI");
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (result) => {
    try {
      await axios.post(`${API}/ai/sessions/${selectedSession.id}/reconcile`, {
        reconciliationResult: result,
        ...reconForm,
        doctorNote: reconForm.doctorFinalConclusion,
        isAiSuggestionUseful: result !== 'MISMATCH',
        trainingCandidate: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Đã hoàn thành đối soát AI");
      setSelectedSession(null);
      fetchData();
    } catch (e) {
      const errorMsg = e.response?.data?.detail || e.response?.data?.error || "Lỗi khi gửi đối soát";
      toast.error(errorMsg);
    }
  };

  const filteredData = data.filter(item => 
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.displaySessionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8">
            <Activity className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lịch sử Chẩn đoán AI & Phân công</h1>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-4">
            <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-slate-700">Danh sách chẩn đoán gần đây</CardTitle>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        placeholder="Tìm bệnh nhân..." 
                        className="pl-9 h-9 text-sm border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="h-12 border-slate-100">
                  <TableHead className="font-medium text-slate-500 text-xs pl-8">Thời gian</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs">Bệnh nhân</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs">Triệu chứng</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs">Chẩn đoán sơ bộ</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs">Chuyên khoa gợi ý</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs">Trạng thái</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs text-right pr-8">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={7} className="h-40 text-center text-slate-400">Đang tải dữ liệu...</TableCell></TableRow>
                ) : filteredData.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="h-40 text-center text-slate-400 font-medium">Không tìm thấy dữ liệu phù hợp</TableCell></TableRow>
                ) : filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 border-slate-100 h-20 transition-colors">
                    <TableCell className="pl-8 text-[13px] text-slate-600">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-[13px]">{item.patientName}</span>
                                <span className="text-[11px] text-slate-400">{item.patientEmail || item.userEmail || 'patient@gmail.com'}</span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                        <p className="text-[13px] text-slate-600 line-clamp-2 leading-relaxed">{item.symptoms}</p>
                    </TableCell>
                    <TableCell>
                        <span className="text-[13px] font-bold text-purple-600 italic">
                            {item.aiSummary || 'Chưa có chẩn đoán'}
                        </span>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none px-3 py-1 text-[11px] font-bold rounded-lg">
                            {item.suggestedSpecialty}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 text-[11px] font-bold w-fit">
                                Đã gửi BS
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-medium ml-1">
                                {item.assignedDoctorName || `BS. ${user?.full_name}`}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                        <button 
                            onClick={() => setSelectedSession(item)}
                            className="text-[13px] font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                            Xem & Gửi
                        </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                        <ShieldCheck className="w-4 h-4" /> Thẩm định chuyên môn lâm sàng
                    </div>
                    <DialogTitle className="text-2xl font-bold">Đối soát Phiên #{selectedSession?.displaySessionId}</DialogTitle>
                </div>
                <Badge className="bg-amber-500 text-white border-none px-4 py-1.5 font-bold">CHỜ ĐỐI SOÁT</Badge>
            </div>

            <div className="p-8 grid grid-cols-2 gap-8 bg-white">
                {/* AI Section */}
                <div className="space-y-6 border-r border-slate-100 pr-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Brain className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-900">AI Gợi ý & Phân tích</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Triệu chứng khai báo</label>
                                <p className="text-[13px] font-bold text-slate-700 italic">"{selectedSession?.symptoms}"</p>
                            </div>
                            <div className="pt-4 border-t border-slate-200 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                    <label className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Tóm tắt sơ bộ từ AI</label>
                                </div>
                                <div className="p-4 rounded-xl bg-indigo-600 text-white font-bold italic text-sm shadow-lg shadow-indigo-100">
                                    "{selectedSession?.aiSummary}"
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                                        {selectedSession?.suggestedSpecialty}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctor Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <StethoscopeIcon className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-900">Kết quả từ Bác sĩ</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                <ClipboardCheck className="w-4 h-4" /> Triệu chứng ghi nhận
                            </label>
                            <textarea 
                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-600 transition-all"
                                placeholder="Ghi nhận triệu chứng thực tế..."
                                rows={2}
                                value={reconForm.doctorSymptomsObserved}
                                onChange={(e) => setReconForm({...reconForm, doctorSymptomsObserved: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Ưu tiên thực tế
                                </label>
                                <Select value={reconForm.priorityLevelActual} onValueChange={(val) => setReconForm({...reconForm, priorityLevelActual: val})}>
                                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-slate-700">
                                        <SelectValue placeholder="Ưu tiên" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                        <SelectItem value="NORMAL">Bình thường</SelectItem>
                                        <SelectItem value="PRIORITY">Ưu tiên</SelectItem>
                                        <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Chẩn đoán sơ bộ
                                </label>
                                <Input 
                                    className="rounded-xl h-12 bg-slate-50 border-none font-bold text-slate-700"
                                    placeholder="Chẩn đoán của BS..."
                                    value={reconForm.preliminaryDiagnosis}
                                    onChange={(e) => setReconForm({...reconForm, preliminaryDiagnosis: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Xác nhận độ chính xác của AI</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'MATCH_EXACT', label: 'KHỚP HOÀN TOÀN', color: 'bg-emerald-600', icon: CheckCircle2 },
                                    { id: 'MISMATCH', label: 'SAI LỆCH AI', color: 'bg-red-600', icon: XCircle }
                                ].map((opt) => (
                                    <Button 
                                        key={opt.id}
                                        onClick={() => handleReconcile(opt.id)}
                                        className={`h-16 rounded-xl flex flex-col gap-1 font-bold text-[10px] shadow-lg transition-all hover:scale-105 active:scale-95 ${opt.color} text-white`}
                                    >
                                        <opt.icon className="w-4 h-4" /> {opt.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-8 bg-slate-50 flex justify-between items-center border-t border-slate-100 rounded-b-3xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic max-w-sm">
                    Dữ liệu đối soát sẽ được lưu trữ để huấn luyện mô hình MediSched Intelligence.
                </p>
                <div className="flex gap-3">
                    <Button variant="ghost" className="rounded-xl font-bold text-slate-400 px-6 h-12" onClick={() => setSelectedSession(null)}>HỦY</Button>
                    <Button 
                        onClick={() => handleReconcile('MATCH_EXACT')}
                        className="rounded-xl px-8 h-12 bg-slate-900 text-white font-bold text-sm hover:bg-black shadow-xl"
                    >
                        LƯU & HOÀN TẤT
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function StatsCard({ title, value, icon: Icon, color, desc }) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
           <div className={`p-3 rounded-xl ${color} text-white shadow-sm`}>
              <Icon className="w-6 h-6" />
           </div>
           <div className="text-3xl font-bold text-slate-900">
             {value}
           </div>
        </div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</h4>
        <p className="text-[10px] text-slate-500 font-medium opacity-60 tracking-tight">{desc}</p>
      </CardContent>
    </Card>
  );
}
