import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MessageSquare, Bot, User } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import CreateMedicalRecordDialog from '@/components/CreateMedicalRecordDialog';
import { FileText, Video, Trash2 } from 'lucide-react';
import ChatService from '@/services/ChatService';
import PatientProfileDialog from '@/components/PatientProfileDialog';


export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [medicalRecordDialog, setMedicalRecordDialog] = useState({
    open: false,
    appointment: null
  });
  const [completeExamDialog, setCompleteExamDialog] = useState({
    open: false,
    appointment: null
  });
  const [profileDialog, setProfileDialog] = useState({
    open: false,
    patientId: null
  });


  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [statusFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
      setFilteredAppointments(response.data);
    } catch (error) {
      toast.error('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (statusFilter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(a => a.status === statusFilter));
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.put(`${API}/appointments/${appointmentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cập nhật trạng thái thành công!');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Cập nhật thất bại');
    }
  };

  const handleHideAppointment = async (appointmentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn này khỏi danh sách?')) return;
    try {
      await axios.delete(`${API}/appointments/${appointmentId}/hide`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa lịch hẹn khỏi danh sách');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể xóa lịch hẹn');
    }
  };

  const handleOpenMedicalRecord = (appointment) => {
    setMedicalRecordDialog({
      open: true,
      appointment
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý lịch hẹn</h1>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="checked_in">Bệnh nhân đến</SelectItem>
                <SelectItem value="in_progress">Đang khám</SelectItem>
                <SelectItem value="completed">Đã khám xong</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Đang tải...</p>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center">
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không có lịch hẹn</h2>
              <p className="text-gray-600 dark:text-gray-300">Không tìm thấy lịch hẹn phù hợp với bộ lọc</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onStatusChange={handleStatusChange}
                  navigate={navigate}
                  onOpenMedicalRecord={() => handleOpenMedicalRecord(apt)}
                  onCompleteExam={() => setCompleteExamDialog({ open: true, appointment: apt })}
                  onViewProfile={(patientId) => setProfileDialog({ open: true, patientId })}
                  onHide={() => handleHideAppointment(apt.id)}
                />

              ))}
            </div>
          )}
        </div>
      </div>

      <CreateMedicalRecordDialog
        open={medicalRecordDialog.open}
        onOpenChange={(open) => setMedicalRecordDialog(prev => ({ ...prev, open }))}
        appointment={medicalRecordDialog.appointment}
      />

      {completeExamDialog.appointment && (
        <CompleteExamDialog
          open={completeExamDialog.open}
          onOpenChange={(open) => setCompleteExamDialog(prev => ({ ...prev, open }))}
          appointment={completeExamDialog.appointment}
          onCompleted={() => {
            setCompleteExamDialog({ open: false, appointment: null });
            fetchAppointments();
          }}
        />
      )}

      <PatientProfileDialog
        open={profileDialog.open}
        onOpenChange={(open) => setProfileDialog(prev => ({ ...prev, open }))}
        patientId={profileDialog.patientId}
        reason={`Doctor viewing patient during appointment management`}
      />
    </Layout>

  );
}

function AppointmentCard({ appointment, onStatusChange, navigate, onOpenMedicalRecord, onCompleteExam, onViewProfile, onHide }) {

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    checked_in: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    no_show: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusText = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    checked_in: 'Đã đến khám',
    in_progress: 'Đang khám',
    completed: 'Đã khám xong',
    cancelled: 'Đã hủy',
    no_show: 'Không đến'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all relative overflow-hidden">
      {appointment.queue_number && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-2 rounded-bl-2xl shadow-md flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase opacity-80">STT</span>
            <span className="text-xl font-black">{appointment.queue_number}</span>
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{appointment.patient_name || 'Bệnh nhân'}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[appointment.status]}`}>
              {statusText[appointment.status]}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
               Mã: {appointment.code}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4 inline mr-2" />
              {appointment.appointment_date}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 inline mr-2" />
              {appointment.appointment_time}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Loại: <span className="font-semibold">{appointment.appointment_type === 'online' ? 'Tư vấn online' : 'Khám trực tiếp'}</span>
            </p>
            {appointment.symptoms && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Triệu chứng:</p>
                <p className="text-gray-600 dark:text-gray-300">{appointment.symptoms}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50"
            onClick={() => onViewProfile(appointment.patient_id || appointment.Id_BenhNhan)}
          >
            <User className="w-4 h-4 mr-2" />
            Hồ sơ
          </Button>
          {(appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'no_show') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onHide}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
          )}
        </div>
      </div>



      <div className="flex gap-3">
        {appointment.status === 'pending' && (
          <>
            <Button
              data-testid={`confirm-${appointment.id}`}
              onClick={() => onStatusChange(appointment.id, 'confirmed')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Xác nhận
            </Button>
            <Button
              data-testid={`cancel-${appointment.id}`}
              onClick={() => onStatusChange(appointment.id, 'cancelled')}
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              Hủy
            </Button>
          </>
        )}
        {(appointment.status === 'confirmed' || appointment.status === 'checked_in') && (
          <Button
            data-testid={`start-${appointment.id}`}
            onClick={() => onStatusChange(appointment.id, 'in_progress')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            Bắt đầu khám
          </Button>
        )}
        {(appointment.status === 'in_progress' || appointment.status === 'checked_in') && (
          <Button
            data-testid={`complete-${appointment.id}`}
            onClick={onCompleteExam}
            className="flex-1 bg-green-600 hover:bg-green-700 shadow-md"
          >
            Hoàn thành khám
          </Button>
        )}
        {(appointment.status === 'confirmed' || appointment.status === 'in_progress' || appointment.status === 'completed') && (
          <>
            <DiagnosisDialog appointment={appointment} onUpdate={() => window.location.reload()} />
            <Button
              onClick={onOpenMedicalRecord}
              variant="outline"
              className="flex-1 border-teal-300 text-teal-600 hover:bg-teal-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Tạo HSBA
            </Button>
          </>
        )}
        {appointment.appointment_type === 'online' && (appointment.status === 'confirmed' || appointment.status === 'in_progress' || appointment.status === 'completed') && (
          <div className="flex gap-2 flex-1">
            <Button
              data-testid={`chat-${appointment.id}`}
              onClick={async () => {
                console.log("CLICK CHAT appointment:", appointment);
                try {
                  const conv = await ChatService.getOrCreateAppointmentConversation(token, appointment.id);
                  navigate(`/doctor/conversation/${conv.id}`);
                } catch (error) {
                  console.error("Open chat error:", error?.response?.data || error);
                  toast.error(error.response?.data?.detail || error.response?.data?.message || 'Không thể mở chat với bệnh nhân');
                }
              }}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 shadow-md"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button
              data-testid={`video-${appointment.id}`}
              variant="outline"
              className="bg-indigo-500 hover:bg-indigo-600 text-white border-0"
              onClick={async () => {
                try {
                  // First ensure conversation exists
                  const conv = await ChatService.getOrCreateAppointmentConversation(token, appointment.id);
                  // Then start call using that conversation ID
                  const session = await ChatService.startCall(token, conv.id, 'video');
                  navigate(`/doctor/video-consultation/${session.id}`);
                } catch (error) {
                  console.error('Start video call error:', error);
                  // Fallback demo
                  toast.success('Mở phòng hội chẩn dự phòng (Demo Mode)');
                  navigate(`/doctor/video-consultation/${appointment.id}`);
                }
              }}
            >
              <Video className="w-4 h-4 mr-2" /> Video
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { Input } from '@/components/ui/input';

export function CompleteExamDialog({ open, onOpenChange, appointment, onCompleted }) {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [systemServices, setSystemServices] = useState([]);
  const [systemMedicines, setSystemMedicines] = useState([]);

  const [diagnosis, setDiagnosis] = useState(appointment.final_diagnosis || appointment.symptoms || '');
  const [clinicalNote, setClinicalNote] = useState('');
  
  const [selectedServices, setSelectedServices] = useState([]); // { serviceId, note, price }
  const [prescriptionItems, setPrescriptionItems] = useState([]); // { medicineId, quantity, dosage, days, usage, price, name }
  const [prescriptionNote, setPrescriptionNote] = useState('');

  useEffect(() => {
    if (open) {
      fetchMasterData();
    }
  }, [open]);

  const fetchMasterData = async () => {
    setDataLoading(true);
    try {
      const [svcRes, medRes] = await Promise.all([
        axios.get(`${API}/system/services`),
        axios.get(`${API}/system/medicines`)
      ]);
      setSystemServices(svcRes.data);
      setSystemMedicines(medRes.data);
    } catch (err) {
      toast.error('Lỗi tải danh mục dịch vụ/thuốc');
    } finally {
      setDataLoading(false);
    }
  };

  const baseFee = parseFloat(appointment.GiaTien) || 200000;
  const clinicalTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const medicineTotal = prescriptionItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = baseFee + clinicalTotal; // Medicine is not added to total until patient confirms

  const handleAddService = (e) => {
    const serviceId = parseInt(e.target.value);
    if (!serviceId) return;
    const svc = systemServices.find(s => s.Id_DichVu === serviceId);
    if (svc && !selectedServices.find(s => s.serviceId === serviceId)) {
        setSelectedServices([...selectedServices, { serviceId: svc.Id_DichVu, note: '', price: Number(svc.DonGia), name: svc.TenDichVu }]);
    }
    e.target.value = "";
  };

  const handleAddMedicine = (e) => {
    const medId = parseInt(e.target.value);
    if (!medId) return;
    const med = systemMedicines.find(m => m.Id_Thuoc === medId);
    if (med && !prescriptionItems.find(m => m.medicineId === medId)) {
        setPrescriptionItems([...prescriptionItems, { 
            medicineId: med.Id_Thuoc, 
            name: med.TenThuoc,
            price: Number(med.DonGia),
            quantity: 1, 
            dosage: '', 
            days: 1, 
            usage: '' 
        }]);
    }
    e.target.value = "";
  };

  const removeService = (id) => setSelectedServices(selectedServices.filter(s => s.serviceId !== id));
  const removeMedicine = (id) => setPrescriptionItems(prescriptionItems.filter(m => m.medicineId !== id));

  const updateMedItem = (id, field, value) => {
      setPrescriptionItems(prescriptionItems.map(item => item.medicineId === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
        toast.error('Vui lòng nhập chẩn đoán');
        return;
    }

    setLoading(true);
    try {
      const payload = {
          diagnosis,
          clinicalNote,
          services: selectedServices.map(s => ({ serviceId: s.serviceId, note: s.note })),
          prescription: prescriptionItems.length > 0 ? {
              note: prescriptionNote,
              items: prescriptionItems.map(m => ({
                  medicineId: m.medicineId,
                  quantity: m.quantity,
                  dosage: m.dosage,
                  days: m.days,
                  usage: m.usage
              }))
          } : null
      };

      const response = await axios.put(`${API}/appointments/${appointment.id}/complete`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(response.data.message || 'Đã hoàn thành khám và tạo hóa đơn!');
      onCompleted();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Lỗi khi hoàn thành khám');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Hoàn thành khám</DialogTitle>
        </DialogHeader>
        
        {dataLoading ? (
            <div className="p-4 text-center">Đang tải danh mục...</div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex justify-between">
                    <p className="text-sm text-teal-800">
                        <strong>Bệnh nhân:</strong> {appointment.patient_name}<br/>
                        <strong>Mã lịch:</strong> {appointment.code}
                    </p>
                    <p className="text-sm font-bold text-teal-800 text-right">
                        Phí khám (Mặc định):<br/>{baseFee.toLocaleString()} VNĐ
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold border-b pb-2">1. Thông tin Lâm Sàng</h3>
                        <div>
                            <Label>Chẩn đoán bệnh <span className="text-red-500">*</span></Label>
                            <Textarea required value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Kết luận khám..." />
                        </div>
                        <div>
                            <Label>Ghi chú lâm sàng</Label>
                            <Textarea value={clinicalNote} onChange={(e) => setClinicalNote(e.target.value)} placeholder="Tình trạng, lời khuyên..." rows={3} />
                        </div>

                        <h3 className="font-bold border-b pb-2 mt-6">2. Chỉ định Cận Lâm Sàng</h3>
                        <select className="w-full p-2 border rounded-md" onChange={handleAddService} defaultValue="">
                            <option value="" disabled>-- Chọn dịch vụ chỉ định --</option>
                            {systemServices.map(s => (
                                <option key={s.Id_DichVu} value={s.Id_DichVu}>{s.TenDichVu} - {Number(s.DonGia).toLocaleString()}đ</option>
                            ))}
                        </select>
                        {selectedServices.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg space-y-2 mt-2 border">
                                {selectedServices.map(s => (
                                    <div key={s.serviceId} className="flex flex-col gap-1 pb-2 border-b last:border-0">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm">{s.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">{s.price.toLocaleString()}đ</span>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeService(s.serviceId)} className="h-6 px-2 text-red-500">X</Button>
                                            </div>
                                        </div>
                                        <Input size="sm" className="h-7 text-xs" placeholder="Ghi chú thêm..." value={s.note} onChange={(e) => setSelectedServices(selectedServices.map(xs => xs.serviceId === s.serviceId ? {...xs, note: e.target.value} : xs))} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold border-b pb-2">3. Đơn Thuốc</h3>
                        <select className="w-full p-2 border rounded-md" onChange={handleAddMedicine} defaultValue="">
                            <option value="" disabled>-- Thêm thuốc vào đơn --</option>
                            {systemMedicines.map(m => (
                                <option key={m.Id_Thuoc} value={m.Id_Thuoc}>{m.TenThuoc} ({m.HamLuong}) - {Number(m.DonGia).toLocaleString()}đ</option>
                            ))}
                        </select>
                        
                        {prescriptionItems.length > 0 && (
                            <div className="bg-blue-50 p-3 rounded-lg space-y-3 mt-2 border border-blue-100 max-h-[300px] overflow-y-auto">
                                {prescriptionItems.map(m => (
                                    <div key={m.medicineId} className="bg-white p-2 rounded shadow-sm flex flex-col gap-2">
                                        <div className="flex justify-between font-semibold text-sm">
                                            <span>{m.name}</span>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeMedicine(m.medicineId)} className="h-6 px-2 text-red-500">X</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Label className="text-[10px]">Số lượng</Label>
                                                <Input type="number" min="1" className="h-7 text-xs" value={m.quantity} onChange={(e) => updateMedItem(m.medicineId, 'quantity', e.target.value)} />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-[10px]">Số ngày</Label>
                                                <Input type="number" min="1" className="h-7 text-xs" value={m.days} onChange={(e) => updateMedItem(m.medicineId, 'days', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Label className="text-[10px]">Liều dùng</Label>
                                                <Input className="h-7 text-xs" placeholder="VD: 2 viên/lần" value={m.dosage} onChange={(e) => updateMedItem(m.medicineId, 'dosage', e.target.value)} />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-[10px]">Cách dùng</Label>
                                                <Input className="h-7 text-xs" placeholder="VD: Sau ăn" value={m.usage} onChange={(e) => updateMedItem(m.medicineId, 'usage', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div>
                                    <Label className="text-xs">Lời dặn của bác sĩ</Label>
                                    <Textarea value={prescriptionNote} onChange={(e) => setPrescriptionNote(e.target.value)} placeholder="Dặn dò thêm..." rows={2} className="text-sm" />
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-gray-900 rounded-xl text-white mt-4">
                            <h4 className="font-bold mb-2 text-sm border-b border-gray-700 pb-2">TỔNG KẾT TẠM TÍNH</h4>
                            <div className="flex justify-between mb-1 text-sm opacity-80">
                                <span>Phí khám:</span>
                                <span>{baseFee.toLocaleString()} đ</span>
                            </div>
                            <div className="flex justify-between mb-1 text-sm opacity-80">
                                <span>Cận lâm sàng:</span>
                                <span>{clinicalTotal.toLocaleString()} đ</span>
                            </div>
                            <div className="flex justify-between mb-2 text-sm opacity-80 text-yellow-400">
                                <span>Tiền thuốc (Dự kiến):</span>
                                <span>+{medicineTotal.toLocaleString()} đ</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2 text-green-400">
                                <span>Cần thu bệnh nhân (Trừ thuốc):</span>
                                <span>{totalAmount.toLocaleString()} đ</span>
                            </div>
                            <p className="text-[10px] opacity-60 mt-1 italic">* Tiền thuốc sẽ chỉ được cộng vào hóa đơn nếu bệnh nhân lấy thuốc.</p>
                        </div>

                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 min-w-[200px]">
                        {loading ? 'Đang xử lý...' : 'HOÀN THÀNH KHÁM'}
                    </Button>
                </div>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DiagnosisDialog({ appointment, onUpdate }) {
  const { token } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [finalDiagnosis, setFinalDiagnosis] = useState(appointment.final_diagnosis || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/appointments/${appointment.id}/diagnosis`,
        { final_diagnosis: finalDiagnosis },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cập nhật chẩn đoán thành công');
      setOpen(false);
      onUpdate();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50">
          Chẩn đoán
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chẩn đoán & Kết luận</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {appointment.ai_diagnosis && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Gợi ý từ AI
              </h4>
              <p className="text-sm text-blue-700 whitespace-pre-wrap">{appointment.ai_diagnosis}</p>
            </div>
          )}

          <div>
            <Label>Chẩn đoán của bác sĩ</Label>
            <Textarea
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="Nhập kết luận khám bệnh..."
              className="mt-2 min-h-[150px]"
            />
          </div>

          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Đang lưu...' : 'Lưu chẩn đoán'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
