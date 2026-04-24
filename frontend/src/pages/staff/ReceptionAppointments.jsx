import React, { useState, useEffect, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle,
  Timer,
  ArrowRightLeft,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function ReceptionAppointments() {
  const { token, currentFacility } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  useEffect(() => {
    if (token && currentFacility) {
        fetchAppointments();
    }
  }, [currentFacility, token]);


  const fetchAppointments = async (query = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/staff/appointments?facility_id=${currentFacility.id}&query=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);

    } catch (error) {
      console.error('Failed to fetch appointments', error);
      toast.error('Lỗi khi tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/staff/appointments/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Đã cập nhật trạng thái: ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleCheckIn = async (id) => {
    try {
      const response = await axios.post(`${API}/staff/appointments/${id}/check-in`, {
          facility_id: currentFacility.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Check-in thành công! Số thứ tự: ${response.data.queue_number}`);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khi check-in');
    }
  };


  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'ChoXacNhan': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'DaXacNhan': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'CONFIRMED': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'CHECKED_IN': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'IN_PROGRESS': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'DaKham': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'COMPLETED': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      'CANCELLED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Huy': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return <Badge className={`rounded-full border-none px-3 ${styles[status] || 'bg-gray-100'}`}>{status}</Badge>;
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Điều Phối Lịch Khám</h1>
            <p className="text-gray-500 dark:text-gray-400">Theo dõi, check-in và điều phối bệnh nhân đến bác sĩ.</p>
          </div>
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-gray-900 text-white rounded-xl' : 'rounded-xl'}
            >
              <ListIcon className="w-4 h-4 mr-2" /> Danh sách
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-gray-900 text-white rounded-xl' : 'rounded-xl'}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Lưới
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex-1 relative max-w-xl">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input 
               type="text" 
               placeholder="Tìm kiếm theo mã, tên, SĐT hoặc email bệnh nhân..."
               onChange={(e) => fetchAppointments(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all text-sm"
             />
           </div>
           <div className="flex gap-3">
             {['all', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].map(s => (
               <Button 
                 key={s} 
                 variant="ghost" 
                 size="sm"
                 className="rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-700"
               >
                 {s}
               </Button>
             ))}
           </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
            {appointments.map((appt) => (
              <Card key={appt.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all dark:bg-gray-800 group rounded-3xl">
                <CardContent className="p-0">
                  <div className={`p-6 ${viewMode === 'list' ? 'flex flex-col md:flex-row md:items-center justify-between gap-6' : ''}`}>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-900/30">
                        {appt.STT_HangCho ? (
                            <>
                                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">STT</span>
                                <span className="text-xl font-black text-teal-700 dark:text-teal-300">{appt.STT_HangCho}</span>
                            </>
                        ) : (
                            <>
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">GIỜ</span>
                                <span className="text-lg font-black text-blue-700 dark:text-blue-300">{appt.time?.substring(0, 5) || '8:30'}</span>
                            </>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{appt.patient_name || appt.BenhNhan?.NguoiDung ? `${appt.BenhNhan.NguoiDung.Ho} ${appt.BenhNhan.NguoiDung.Ten}` : 'N/A'}</h3>
                          {getStatusBadge(appt.TrangThai || appt.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1 font-medium text-teal-600 dark:text-teal-400">
                            <Stethoscope className="w-3 h-3" /> BS. {appt.doctor_name || appt.LichKham?.BacSi?.NguoiDung ? `${appt.LichKham.BacSi.NguoiDung.Ho} ${appt.LichKham.BacSi.NguoiDung.Ten}` : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {appt.MaDatLich}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {['PENDING', 'CONFIRMED', 'ChoXacNhan', 'DaXacNhan'].includes(appt.TrangThai || appt.status) && (
                        <Button 
                          onClick={() => handleCheckIn(appt.id || appt.Id_DatLich)}
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all px-8 font-bold"
                        >
                          Check-in ngay
                        </Button>
                      )}

                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 h-10 w-10">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-2xl border-gray-100 dark:border-gray-700">
                          <DropdownMenuLabel>Hành động vận hành</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" onClick={() => updateStatus(appt.id, 'CHECKED_IN')}>
                            <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Đánh dấu đã đến
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" onClick={() => updateStatus(appt.id, 'IN_PROGRESS')}>
                            <Timer className="w-4 h-4 text-emerald-500" /> Chuyển vào khám
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                            <ArrowRightLeft className="w-4 h-4 text-blue-500" /> Đổi bác sĩ / Điều phối
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg gap-2 text-red-600 dark:text-red-400 cursor-pointer" onClick={() => updateStatus(appt.id, 'CANCELLED')}>
                            <XCircle className="w-4 h-4" /> Hủy lịch hẹn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
