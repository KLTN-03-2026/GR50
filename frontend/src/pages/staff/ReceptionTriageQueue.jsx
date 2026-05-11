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
  Clock,
  Zap,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ReceptionTriageQueue() {
  const { token, currentFacility } = useContext(AuthContext);

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [pushingId, setPushingId] = useState(null);

  useEffect(() => {
    if (token && currentFacility) {
        fetchQueue();
        const interval = setInterval(fetchQueue, 10000); // Auto refresh every 10s
        return () => clearInterval(interval);
    }
  }, [currentFacility, token]);

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`${API}/queues?facility_id=${currentFacility.id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setQueue(res.data);
    } catch (error) {
      console.error('Failed to fetch queue', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePushNext = async (appointmentId) => {
    setPushingId(appointmentId);
    try {
        const res = await axios.post(`${API}/queues/${appointmentId}/push-next`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(res.data.message);
        fetchQueue();
    } catch (error) {
        const msg = error.response?.data?.detail || "Không thể điều phối bệnh nhân này";
        toast.error(msg);
    } finally {
        setPushingId(null);
    }
  };

  const getPriorityBadge = (level) => {
    switch (level) {
      case 'URGENT': return 'bg-red-500 text-white shadow-red-200';
      case 'HIGH': return 'bg-orange-500 text-white shadow-orange-200';
      case 'MEDIUM': return 'bg-blue-500 text-white shadow-blue-200';
      default: return 'bg-gray-400 text-white shadow-gray-200';
    }
  };

  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-1">
               <Zap className="w-4 h-4 fill-indigo-600" />
               Hệ thống điều phối 2.0
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Hàng Đợi Ưu Tiên</h1>
            <p className="text-gray-500 font-medium">Điều phối bệnh nhân theo điểm số triage AI và cấp độ ưu tiên vận hành.</p>
          </div>
          
          <div className="flex gap-4">
             <Card className="border-none shadow-sm px-6 py-3 rounded-2xl flex items-center gap-4 bg-white">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                   {queue.length}
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Đang chờ</p>
                   <p className="font-black text-gray-900">Tổng lượt khám</p>
                </div>
             </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
           <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-gray-50/80">
                       <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="w-[80px] font-black text-gray-400 uppercase text-[10px] px-8 py-6">Thứ tự</TableHead>
                          <TableHead className="font-black text-gray-400 uppercase text-[10px]">Bệnh nhân</TableHead>
                          <TableHead className="font-black text-gray-400 uppercase text-[10px]">Cấp ưu tiên</TableHead>
                          <TableHead className="font-black text-gray-400 uppercase text-[10px]">Điểm / Lý do</TableHead>
                          <TableHead className="font-black text-gray-400 uppercase text-[10px]">Thời gian chờ</TableHead>
                          <TableHead className="font-black text-gray-400 uppercase text-[10px]">Hình thức</TableHead>
                          <TableHead className="text-right px-8 font-black text-gray-400 uppercase text-[10px]">Hành động</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {loading ? (
                          <TableRow><TableCell colSpan={7} className="text-center py-20 font-medium text-gray-400">Đang tải dữ liệu hàng đợi...</TableCell></TableRow>
                       ) : queue.length === 0 ? (
                          <TableRow><TableCell colSpan={7} className="text-center py-20 font-medium text-gray-400 italic">Chưa có bệnh nhân nào trong hàng đợi hôm nay.</TableCell></TableRow>
                       ) : (
                          queue.map((item, idx) => (
                             <TableRow key={item.appointment_id} className="group hover:bg-indigo-50/30 transition-colors border-gray-50">
                                <TableCell className="px-8 font-black text-2xl text-gray-300 group-hover:text-indigo-600 transition-colors">
                                   {item.rank}
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                         {item.patient_name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="font-bold text-gray-900">{item.patient_name}</p>
                                         <p className="text-[10px] font-medium text-gray-400 uppercase">Mã: {item.code}</p>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <Badge className={`rounded-lg border-none font-black text-[10px] px-2 py-1 shadow-md ${getPriorityBadge(item.priority_level)}`}>
                                      {item.priority_level}
                                   </Badge>
                                </TableCell>
                                <TableCell>
                                   <div className="space-y-1">
                                      <p className="font-black text-indigo-600">{item.priority_score} điểm</p>
                                      <p className="text-[10px] text-gray-500 font-medium line-clamp-1 italic">{item.priority_reason}</p>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-1.5 text-gray-600 font-bold">
                                      <Clock className="w-3.5 h-3.5" />
                                      {item.wait_time} phút
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <Badge variant="outline" className="rounded-lg border-gray-200 text-gray-500 font-black text-[9px] uppercase tracking-tighter">
                                      {item.type}
                                   </Badge>
                                </TableCell>
                                <TableCell className="text-right px-8">
                                   <div className="flex justify-end gap-2">
                                      <Button 
                                         variant="ghost" 
                                         size="sm" 
                                         className="rounded-xl text-gray-400 hover:text-indigo-600"
                                         onClick={() => setSelectedApt(item)}
                                      >
                                         Chi tiết
                                      </Button>
                                      <Button 
                                         size="sm" 
                                         className={`rounded-xl font-bold shadow-lg transition-all ${item.status === 'IN_PROGRESS' ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                         disabled={pushingId === item.appointment_id || item.status === 'IN_PROGRESS'}
                                         onClick={() => handlePushNext(item.appointment_id)}
                                      >
                                         {item.status === 'IN_PROGRESS' ? (
                                            <><UserCheck className="w-4 h-4 mr-1" /> Đã vào khám</>
                                         ) : (
                                            <><ArrowRight className="w-4 h-4 mr-1" /> Đẩy lượt kế</>
                                         )}
                                      </Button>
                                   </div>
                                </TableCell>
                             </TableRow>
                          ))
                       )}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>

        {/* Priority Detail Modal */}
        <Dialog open={!!selectedApt} onOpenChange={() => setSelectedApt(null)}>
           <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-3xl p-0 overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white">
                 <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                       <Brain className="w-6 h-6 fill-white/20" />
                       <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Phân tích ưu tiên AI</p>
                    </div>
                    <DialogTitle className="text-3xl font-black">{selectedApt?.patient_name}</DialogTitle>
                 </DialogHeader>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gray-50 border-none rounded-2xl p-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Mã lịch hẹn</p>
                       <p className="font-black text-gray-900">{selectedApt?.code}</p>
                    </Card>
                    <Card className="bg-gray-50 border-none rounded-2xl p-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Hình thức</p>
                       <p className="font-black text-gray-900 uppercase">{selectedApt?.type}</p>
                    </Card>
                 </div>

                 <div className="space-y-4">
                    <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Cơ cấu điểm ưu tiên ({selectedApt?.priority_score}đ)</h3>
                    <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[1.5rem] space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-600">Điểm Triage (AI):</span>
                          <span className="font-black text-indigo-700">+ {selectedApt?.priority_score > 40 ? '40' : '20'}đ</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-600">Thời gian chờ:</span>
                          <span className="font-black text-indigo-700">+ {selectedApt?.wait_time}đ</span>
                       </div>
                       <div className="pt-4 border-t border-indigo-100">
                          <p className="text-xs font-bold text-indigo-600 mb-1 uppercase">Lý do hệ thống:</p>
                          <p className="text-sm text-gray-700 font-medium leading-relaxed italic">"{selectedApt?.priority_reason}"</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 flex justify-end gap-3">
                    <Button variant="outline" className="rounded-xl font-bold" onClick={() => setSelectedApt(null)}>Đóng</Button>
                    <Button className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                        handlePushNext(selectedApt.appointment_id);
                        setSelectedApt(null);
                    }}>Đẩy lượt ngay</Button>
                 </div>
              </div>
           </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
