import React, { useState, useEffect, useContext } from 'react';
import Layout from '@/components/Layout';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  User, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon,
  MapPin,
  ChevronRight,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import PatientProfileDialog from '@/components/PatientProfileDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReceptionPatients() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterReceived, setFilterReceived] = useState(false);
  
  // Form state for new patient
  const [formData, setFormData] = useState({
    id: null,
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Nam',
    address: ''
  });

  const [profileDialog, setProfileDialog] = useState({
    open: false,
    patientId: null
  });

  useEffect(() => {
    fetchPatients();
  }, [filterReceived]);

  const fetchPatients = async (query = searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/staff/patients/search?query=${query}&received=${filterReceived}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients', error);
      toast.error('Không thể lấy danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/staff/patients`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Tạo tài khoản thành công! Mật khẩu tạm thời: ${response.data.temp_password}`);
      setShowAddModal(false);
      resetForm();
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khi tạo tài khoản');
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/staff/patients/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cập nhật thông tin bệnh nhân thành công');
      setShowEditModal(false);
      resetForm();
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khi cập nhật');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) return;
    try {
      await axios.delete(`${API}/staff/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xóa bệnh nhân thành công');
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể xóa bệnh nhân này');
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      full_name: '',
      email: '',
      phone: '',
      dob: '',
      gender: 'Nam',
      address: ''
    });
  };

  const openEditModal = (patient) => {
    setFormData({
      id: patient.id,
      full_name: patient.full_name,
      email: patient.email,
      phone: patient.phone,
      dob: patient.dob ? patient.dob.split('T')[0] : '',
      gender: patient.gender || 'Nam',
      address: patient.address || ''
    });
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tiếp Nhận Bệnh Nhân</h1>
            <p className="text-gray-500 dark:text-gray-400">Tra cứu và quản lý hồ sơ hành chính bệnh nhân.</p>
          </div>
          <Button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Đăng ký bệnh nhân mới
          </Button>
        </div>

        {/* Search Bar & Filters */}
        <Card className="border-none shadow-md dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="Tìm theo tên, SĐT hoặc email..." 
                    className="pl-10 h-12 rounded-xl dark:bg-gray-700 dark:border-gray-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-12 px-8 rounded-xl bg-gray-900 dark:bg-teal-600 hover:bg-gray-800">
                  Tìm kiếm
                </Button>
              </form>
              <Button 
                variant={filterReceived ? "default" : "outline"}
                onClick={() => setFilterReceived(!filterReceived)}
                className={`h-12 rounded-xl px-6 flex items-center gap-2 ${filterReceived ? 'bg-teal-600 text-white' : ''}`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {filterReceived ? "Đang lọc: Đã tiếp nhận" : "Lọc đã tiếp nhận"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />)
          ) : patients.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500">
              Không tìm thấy bệnh nhân nào.
            </div>
          ) : (
            patients.map((patient) => (
              <Card key={patient.id} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 dark:bg-gray-800 rounded-3xl relative">
                {patient.is_received && (
                  <div className="absolute top-4 right-12">
                    <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-none">
                      Đã tiếp nhận
                    </Badge>
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 flex items-center justify-center">
                          <User className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors">
                            {patient.full_name}
                          </h3>
                          <Badge variant="secondary" className="mt-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            ID: P-{patient.id}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem onClick={() => openEditModal(patient)} className="gap-2 cursor-pointer">
                            <Edit2 className="w-4 h-4 text-blue-500" /> Sửa thông tin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePatient(patient.id)} className="gap-2 text-red-600 cursor-pointer">
                            <Trash2 className="w-4 h-4" /> Xóa bệnh nhân
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4 text-teal-500" />
                        {patient.phone || 'Chưa cập nhật'}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 text-teal-500" />
                        {patient.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4 text-teal-500" />
                        {patient.dob ? new Date(patient.dob).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <Button 
                        onClick={() => setProfileDialog({ open: true, patientId: patient.id })}
                        className="flex-1 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 hover:text-teal-700 border-none transition-colors"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Hồ sơ
                      </Button>

                      <Button 
                        onClick={() => navigate(`/staff/booking-assist?patientId=${patient.id}`)}
                        className="flex-1 rounded-xl bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        Tiếp nhận
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl dark:bg-gray-800 animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                {showAddModal ? "Đăng Ký Bệnh Nhân" : "Cập Nhật Thông Tin"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={showAddModal ? handleCreatePatient : handleUpdatePatient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Họ và tên *</label>
                    <Input 
                      required
                      placeholder="Nguyễn Văn A" 
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số điện thoại *</label>
                    <Input 
                      required
                      placeholder="0912345678" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                      type="email"
                      placeholder="email@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giới tính</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày sinh</label>
                    <Input 
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Địa chỉ</label>
                    <Input 
                      placeholder="Số nhà, Tên đường, Phường/Xã..." 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <Button type="button" variant="ghost" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Hủy</Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-8">
                    {showAddModal ? "Xác nhận đăng ký" : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <PatientProfileDialog 
        open={profileDialog.open}
        onOpenChange={(open) => setProfileDialog(prev => ({ ...prev, open }))}
        patientId={profileDialog.patientId}
        reason="Receptionist viewing patient profile for administrative support"
      />
    </Layout>
  );
}
