import React, { useState, useEffect, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { 
  Brain, 
  Sparkles, 
  ShieldCheck, 
  Stethoscope, 
  Zap, 
  Clock, 
  History,
  AlertTriangle,
  User,
  Heart,
  ChevronRight,
  Activity,
  Calendar,
  Activity as PulseIcon,
  Search
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function AIConsultation() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: '',
    symptomDuration: 'LESS_THAN_3_DAYS',
    severityLevel: 'NORMAL',
    bodyArea: '',
    preferredVisitType: 'OFFLINE',
    preferredFacilityId: 1
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('consult'); // 'consult' or 'history'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/ai/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async () => {
    if (!formData.symptoms.trim()) {
        toast.error("Vui lòng nhập triệu chứng của bạn");
        return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/ai/suggest`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      fetchHistory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Lỗi xử lý tư vấn AI");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (level) => {
    const map = {
      'URGENT': { label: 'KHẨN CẤP', color: 'bg-red-600' },
      'PRIORITY': { label: 'ƯU TIÊN', color: 'bg-orange-500' },
      'NORMAL': { label: 'BÌNH THƯỜNG', color: 'bg-blue-500' }
    };
    const s = map[level] || map['NORMAL'];
    return <Badge className={`${s.color} text-white border-none font-bold text-[9px] px-2 py-0.5`}>{s.label}</Badge>;
  };

  const filteredHistory = history.filter(item => 
    item.displaySessionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.AIConsultationInput?.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        
        {/* Warning Disclaimer */}
        <div className="bg-amber-50 border-b border-amber-100 py-3 px-8 sticky top-0 z-30 backdrop-blur-md bg-white/70">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tighter">
                    Kết quả AI chỉ mang tính chất tham khảo. Không thay thế chẩn đoán, tư vấn hoặc chỉ định điều trị của bác sĩ chuyên môn.
                </p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-700">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-3">
                    <PulseIcon className="w-8 h-8 text-purple-600" />
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lịch sử Chẩn đoán AI & Tư vấn</h1>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('consult')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'consult' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        TƯ VẤN MỚI
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        LỊCH SỬ AI
                    </button>
                </div>
            </div>

            {activeTab === 'consult' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Consultation Form - Keeping existing logic but refining style */}
                    <div className="lg:col-span-5">
                        <Card className="border-slate-200 shadow-sm rounded-2xl p-8 bg-white">
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-bold uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                                        <Zap className="w-4 h-4" /> Khai báo triệu chứng
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Triệu chứng chính</label>
                                        <textarea 
                                            className="w-full p-4 rounded-xl bg-slate-50 border-none text-slate-800 font-bold text-sm focus:ring-2 focus:ring-indigo-600 transition-all min-h-[100px]"
                                            placeholder="Bạn đang cảm thấy thế nào?..."
                                            value={formData.symptoms}
                                            onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thời gian</label>
                                            <Select value={formData.symptomDuration} onValueChange={(val) => setFormData({...formData, symptomDuration: val})}>
                                                <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-none font-bold text-slate-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                                    <SelectItem value="LESS_THAN_3_DAYS">Dưới 3 ngày</SelectItem>
                                                    <SelectItem value="3_TO_7_DAYS">3 - 7 ngày</SelectItem>
                                                    <SelectItem value="1_TO_4_WEEKS">1 - 4 tuần</SelectItem>
                                                    <SelectItem value="CHRONIC">Kéo dài</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mức độ</label>
                                            <Select value={formData.severityLevel} onValueChange={(val) => setFormData({...formData, severityLevel: val})}>
                                                <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-none font-bold text-slate-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                                    <SelectItem value="NORMAL">Bình thường</SelectItem>
                                                    <SelectItem value="HIGH">Nặng</SelectItem>
                                                    <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full h-14 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-xl transition-all active:scale-95"
                                >
                                    {loading ? 'ĐANG PHÂN TÍCH...' : 'NHẬN GỢI Ý TỪ AI'}
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* AI Result Card */}
                    <div className="lg:col-span-7">
                        {!result ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl opacity-40">
                                <Brain size={48} className="text-slate-300 mb-4" />
                                <p className="font-bold text-slate-400 text-sm">Nhập triệu chứng để bắt đầu tư vấn AI</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                <Card className="border-none shadow-lg rounded-3xl bg-slate-900 text-white p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5">
                                        <PulseIcon size={120} />
                                    </div>
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Kết quả phân tích</p>
                                                <h2 className="text-2xl font-bold">Chẩn đoán sơ bộ AI</h2>
                                            </div>
                                            {getPriorityBadge(result.AIConsultationResult?.priorityLevel)}
                                        </div>
                                        <p className="text-lg font-bold italic leading-relaxed text-indigo-100 border-l-4 border-indigo-500 pl-4 py-2">
                                            "{result.AIConsultationResult?.summary}"
                                        </p>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-slate-500">Lời khuyên</label>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed">{result.AIConsultationResult?.preliminarySuggestion}</p>
                                        </div>
                                    </div>
                                </Card>

                                <div className="grid grid-cols-2 gap-6">
                                    <Card className="border-slate-100 shadow-sm rounded-2xl p-6">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4">Chuyên khoa gợi ý</h4>
                                        <div className="space-y-3">
                                            {result.suggestedSpecialties?.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-xs font-bold text-slate-700">{s.specialtyName}</span>
                                                    <Badge className="bg-indigo-600 text-[9px]">{Math.round(s.confidenceScore * 100)}%</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                    <Card className="border-slate-100 shadow-sm rounded-2xl p-6">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4">Mã phiên của bạn</h4>
                                        <div className="p-4 bg-indigo-50 rounded-xl text-center">
                                            <p className="text-xl font-bold text-indigo-600 tracking-tighter">#{result.displaySessionId}</p>
                                            <p className="text-[9px] font-bold text-indigo-400 mt-1 uppercase">Sử dụng khi đặt lịch</p>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* History Tab with New Table Design */
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 py-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-bold text-slate-700">Lịch sử tư vấn gần đây</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                    placeholder="Tìm mã phiên..." 
                                    className="pl-9 h-9 text-xs border-slate-200"
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
                                    <TableHead className="font-medium text-slate-500 text-xs">Mã phiên</TableHead>
                                    <TableHead className="font-medium text-slate-500 text-xs">Triệu chứng</TableHead>
                                    <TableHead className="font-medium text-slate-500 text-xs">Chẩn đoán AI</TableHead>
                                    <TableHead className="font-medium text-slate-500 text-xs">Chuyên khoa</TableHead>
                                    <TableHead className="font-medium text-slate-500 text-xs">Ưu tiên</TableHead>
                                    <TableHead className="font-medium text-slate-500 text-xs text-right pr-8">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHistory.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="h-40 text-center text-slate-300 font-medium italic">Chưa có lịch sử tư vấn</TableCell></TableRow>
                                ) : filteredHistory.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 border-slate-100 h-20 transition-colors">
                                        <TableCell className="pl-8 text-[12px] text-slate-500">
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-slate-900 text-sm tracking-tight">#{item.displaySessionId}</span>
                                        </TableCell>
                                        <TableCell className="max-w-[150px]">
                                            <p className="text-[12px] text-slate-600 line-clamp-1 italic">"{item.AIConsultationInput?.symptoms}"</p>
                                        </TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <span className="text-[12px] font-bold text-purple-600 italic line-clamp-1">
                                                {item.AIConsultationResult?.summary || 'Chưa có chẩn đoán'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-3 py-1 text-[10px] font-bold rounded-lg">
                                                {item.suggestedSpecialty || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getPriorityBadge(item.AIConsultationResult?.priorityLevel)}
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <button 
                                                onClick={() => {
                                                    setResult(item);
                                                    setActiveTab('consult');
                                                }}
                                                className="text-[12px] font-bold text-slate-900 hover:text-indigo-600"
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
            )}
        </div>
      </div>
    </Layout>
  );
}
