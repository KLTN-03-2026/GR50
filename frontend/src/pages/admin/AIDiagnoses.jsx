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
  ExternalLink,
  Brain,
  Filter
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
import { toast } from 'sonner';

export default function AdminAIDiagnoses() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

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

  const filteredData = data.filter(item => 
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.displaySessionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (sessionId) => {
    try {
      await axios.post(`${API}/ai/sessions/${sessionId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Đã phê duyệt và gửi thông tin cho bác sĩ chuyên khoa");
      setSelectedSession(null);
      fetchData(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.detail || "Lỗi khi phê duyệt");
    }
  };

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
                                BS. {item.assignedDoctorName || 'Bùi Đức Anh'}
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

      {/* Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-2xl rounded-2xl border-none shadow-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <Brain className="w-6 h-6 text-indigo-600" />
                    Chi tiết Phiên Chẩn đoán AI
                </DialogTitle>
            </DialogHeader>
            {selectedSession && (
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bệnh nhân</p>
                            <p className="font-bold text-slate-900">{selectedSession.patientName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thời gian</p>
                            <p className="font-bold text-slate-900">{new Date(selectedSession.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Triệu chứng khai báo</p>
                        <p className="text-sm text-slate-700 bg-white border border-slate-100 p-4 rounded-xl leading-relaxed italic">
                            "{selectedSession.symptoms}"
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chẩn đoán AI</p>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-sm font-bold text-purple-700 italic">"{selectedSession.aiSummary}"</p>
                            <div className="mt-3 flex items-center gap-2">
                                <Badge className="bg-purple-600 text-white border-none">{selectedSession.suggestedSpecialty}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setSelectedSession(null)} className="rounded-xl px-6">Đóng</Button>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6"
                            onClick={() => handleApprove(selectedSession.id)}
                        >
                            Phê duyệt & Gửi bác sĩ
                        </Button>
                    </div>
                </div>
            )}
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
