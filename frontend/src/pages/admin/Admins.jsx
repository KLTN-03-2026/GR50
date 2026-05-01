import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import axios from 'axios';
import { UserPlus, Shield, Trash2, Eye, EyeOff, Building2, Globe, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function AdminsManagement() {
  const { token, user } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    admin_type: 'FACILITY_ADMIN',
    facility_id: '',
    permissions: {
      can_manage_doctors: true,
      can_manage_staff: true,
      can_manage_patients: true,
      can_view_stats: true,
      can_manage_payments: false,
      can_manage_specialties: false,
      can_create_admins: false
    }
  });
  const [facilities, setFacilities] = useState([]);


  const currentUserPermissions = user?.admin_permissions || {};

  useEffect(() => {
    fetchAdmins();
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await axios.get(`${API}/facilities`);
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };


  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API}/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Không thể tải danh sách admin');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/admin/create-admin`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Tạo tài khoản admin thành công!');
      setShowCreateForm(false);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        admin_type: 'FACILITY_ADMIN',
        facility_id: '',
        permissions: {
          can_manage_doctors: true,
          can_manage_staff: true,
          can_manage_patients: true,
          can_view_stats: true,
          can_manage_payments: false,
          can_manage_specialties: false,
          can_create_admins: false
        }
      });
      fetchAdmins();

    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể tạo admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId, adminEmail) => {
    if (!window.confirm(`Bạn có chắc muốn xóa admin ${adminEmail}?`)) return;

    try {
      await axios.delete(`${API}/admin/delete-admin/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa admin thành công');
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể xóa admin');
    }
  };

  const handleUpdatePermissions = async (adminId, permissions) => {
    try {
      await axios.put(
        `${API}/admin/update-permissions`,
        { admin_id: adminId, permissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cập nhật quyền thành công');
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể cập nhật quyền');
    }
  };

  const canCreateAdmins = currentUserPermissions.can_create_admins === true || user?.admin_type === 'SUPER_ADMIN';


  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Admin</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Quản lý tài khoản và phân quyền admin</p>
            </div>
            {canCreateAdmins && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Tạo Admin Mới
              </Button>
            )}
          </div>

          {/* Create Admin Form */}
          {showCreateForm && canCreateAdmins && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Tạo tài khoản Admin mới</h2>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Họ và tên</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-teal-600 font-bold uppercase text-xs tracking-widest">Cấu hình vai trò</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>Loại Admin</Label>
                        <Select 
                          value={formData.admin_type} 
                          onValueChange={(val) => setFormData({ ...formData, admin_type: val, facility_id: val === 'SUPER_ADMIN' ? '' : formData.facility_id })}
                        >
                          <SelectTrigger className="mt-2 bg-gray-50 border-none rounded-xl">
                            <SelectValue placeholder="Chọn loại admin" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-xl">
                            <SelectItem value="SUPER_ADMIN" className="rounded-lg">Super Admin (Toàn hệ thống)</SelectItem>
                            <SelectItem value="FACILITY_ADMIN" className="rounded-lg">Facility Admin (Theo cơ sở)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.admin_type === 'FACILITY_ADMIN' && (
                        <div>
                          <Label>Cơ sở y tế phụ trách</Label>
                          <Select 
                            value={formData.facility_id} 
                            onValueChange={(val) => setFormData({ ...formData, facility_id: val })}
                          >
                            <SelectTrigger className="mt-2 bg-gray-50 border-none rounded-xl">
                              <SelectValue placeholder="Chọn cơ sở y tế" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-xl">
                              {facilities.map(f => (
                                <SelectItem key={f.id} value={f.id.toString()} className="rounded-lg">{f.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-teal-600 font-bold uppercase text-xs tracking-widest">Phạm vi quyền hạn</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors">
                        <Checkbox
                          id="can_manage_doctors"
                          checked={formData.permissions.can_manage_doctors}
                          onCheckedChange={(checked) => setFormData({ ...formData, permissions: { ...formData.permissions, can_manage_doctors: checked }})}
                        />
                        <label htmlFor="can_manage_doctors" className="text-sm cursor-pointer font-medium">Quản lý bác sĩ</label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors">
                        <Checkbox
                          id="can_manage_staff"
                          checked={formData.permissions.can_manage_staff}
                          onCheckedChange={(checked) => setFormData({ ...formData, permissions: { ...formData.permissions, can_manage_staff: checked }})}
                        />
                        <label htmlFor="can_manage_staff" className="text-sm cursor-pointer font-medium">Quản lý nhân viên</label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors">
                        <Checkbox
                          id="can_manage_patients"
                          checked={formData.permissions.can_manage_patients}
                          onCheckedChange={(checked) => setFormData({ ...formData, permissions: { ...formData.permissions, can_manage_patients: checked }})}
                        />
                        <label htmlFor="can_manage_patients" className="text-sm cursor-pointer font-medium">Quản lý bệnh nhân</label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors">
                        <Checkbox
                          id="can_view_stats"
                          checked={formData.permissions.can_view_stats}
                          onCheckedChange={(checked) => setFormData({ ...formData, permissions: { ...formData.permissions, can_view_stats: checked }})}
                        />
                        <label htmlFor="can_view_stats" className="text-sm cursor-pointer font-medium">Xem thống kê</label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors">
                        <Checkbox
                          id="can_manage_payments"
                          checked={formData.permissions.can_manage_payments}
                          onCheckedChange={(checked) => setFormData({ ...formData, permissions: { ...formData.permissions, can_manage_payments: checked }})}
                        />
                        <label htmlFor="can_manage_payments" className="text-sm cursor-pointer font-medium">Quản lý thanh toán</label>
                      </div>
                      {formData.admin_type === 'SUPER_ADMIN' && (
                        <div className="flex items-center space-x-2 p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
                          <Checkbox
                            id="can_create_admins"
                            checked={formData.permissions.can_create_admins}
                            onCheckedChange={(checked) => setFormData({ ...formData, permissions: { ...formData.permissions, can_create_admins: checked }})}
                          />
                          <label htmlFor="can_create_admins" className="text-sm cursor-pointer font-bold text-indigo-700">Quản lý Admin khác</label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="bg-gradient-to-r from-teal-500 to-cyan-500">
                    {loading ? 'Đang tạo...' : 'Tạo Admin'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Admin List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Danh sách Admin</h2>
            <div className="space-y-4">
              {admins.map((admin) => (
                <AdminCard
                  key={admin.id}
                  admin={admin}
                  currentUserId={user?.id}
                  canCreateAdmins={canCreateAdmins}
                  onDelete={handleDeleteAdmin}
                  onUpdatePermissions={handleUpdatePermissions}
                />
              ))}
              {admins.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Chưa có admin nào khác</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function AdminCard({ admin, currentUserId, canCreateAdmins, onDelete, onUpdatePermissions }) {
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState(admin.admin_permissions || {});

  const isCurrentUser = admin.id === currentUserId;

  const handleSavePermissions = () => {
    onUpdatePermissions(admin.id, permissions);
    setShowPermissions(false);
  };

  return (
    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
            {admin.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {admin.full_name}
              </h3>
              {admin.admin_type === 'SUPER_ADMIN' ? (
                <Badge className="bg-indigo-100 text-indigo-700 border-none text-[10px] uppercase font-black">Super Admin</Badge>
              ) : (
                <Badge className="bg-teal-100 text-teal-700 border-none text-[10px] uppercase font-black">Facility Admin</Badge>
              )}
              {isCurrentUser && <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] uppercase font-black">Bạn</Badge>}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{admin.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] flex items-center gap-1 text-gray-500 uppercase font-bold">
                <Building2 className="w-3 h-3" /> {admin.assigned_facility || 'Toàn hệ thống'}
              </span>
              <span className="text-[10px] flex items-center gap-1 text-gray-500 uppercase font-bold">
                <Globe className="w-3 h-3" /> {new Date(admin.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        
        <div className="flex gap-2">
          {canCreateAdmins && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPermissions(!showPermissions)}
            >
              <Shield className="w-4 h-4 mr-1" />
              Phân quyền
            </Button>
          )}
          {!isCurrentUser && canCreateAdmins && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(admin.id, admin.email)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {showPermissions && canCreateAdmins && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <h4 className="font-semibold text-sm">Chỉnh sửa phân quyền</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`perm_create_${admin.id}`}
                checked={permissions.can_create_admins || false}
                onCheckedChange={(checked) => setPermissions({ ...permissions, can_create_admins: checked })}
              />
              <label htmlFor={`perm_create_${admin.id}`} className="text-sm cursor-pointer">
                Tạo và quản lý admin khác
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`perm_doctors_${admin.id}`}
                checked={permissions.can_manage_doctors !== false}
                onCheckedChange={(checked) => setPermissions({ ...permissions, can_manage_doctors: checked })}
              />
              <label htmlFor={`perm_doctors_${admin.id}`} className="text-sm cursor-pointer">
                Quản lý bác sĩ
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`perm_patients_${admin.id}`}
                checked={permissions.can_manage_patients !== false}
                onCheckedChange={(checked) => setPermissions({ ...permissions, can_manage_patients: checked })}
              />
              <label htmlFor={`perm_patients_${admin.id}`} className="text-sm cursor-pointer">
                Quản lý bệnh nhân
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`perm_stats_${admin.id}`}
                checked={permissions.can_view_stats !== false}
                onCheckedChange={(checked) => setPermissions({ ...permissions, can_view_stats: checked })}
              />
              <label htmlFor={`perm_stats_${admin.id}`} className="text-sm cursor-pointer">
                Xem thống kê
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleSavePermissions} className="bg-gradient-to-r from-teal-500 to-cyan-500">
              Lưu
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowPermissions(false)}>
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
