import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { API } from '@/config';
import { AuthContext } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, MapPin } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function SystemSettings() {
    const { token } = useContext(AuthContext);
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingClinic, setEditingClinic] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        logo_url: '',
        banner_url: '',
        google_map_url: ''
    });

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            const response = await axios.get(`${API}/clinics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClinics(response.data);
        } catch (error) {
            console.error('Error fetching clinics:', error);
            toast.error('Không thể tải danh sách phòng khám');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (clinic = null) => {
        setEditingClinic(clinic);
        if (clinic) {
            setFormData({
                name: clinic.TenPhongKham || '',
                phone: clinic.SoDienThoai || '',
                email: clinic.Email || '',
                address: clinic.DiaChi || '',
                logo_url: clinic.UrlLogo || '',
                banner_url: clinic.UrlBanner || '',
                google_map_url: clinic.GoogleMapUrl || ''
            });
        } else {
            setFormData({ name: '', phone: '', email: '', address: '', logo_url: '', banner_url: '', google_map_url: '' });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return toast.error('Vui lòng nhập tên phòng khám');

        try {
            if (editingClinic) {
                await axios.put(`${API}/clinics/${editingClinic.Id_PhongKham}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Cập nhật phòng khám thành công');
            } else {
                await axios.post(`${API}/clinics`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Thêm phòng khám mới thành công');
            }
            setDialogOpen(false);
            fetchClinics();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phòng khám này không?')) return;
        try {
            await axios.delete(`${API}/clinics/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đã xóa phòng khám');
            fetchClinics();
        } catch (error) {
            console.error('Delete err', error);
            toast.error('Không thể xóa phòng khám');
        }
    };

    if (loading) return <Layout><div className="p-6">Đang tải...</div></Layout>;

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold dark:text-white">Quản lý Phòng khám & Cơ sở y tế</h1>
                    <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-teal-500 to-cyan-500">
                        <Plus className="w-4 h-4 mr-2" /> Thêm Cơ sở
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">ID</TableHead>
                                <TableHead>Tên cơ sở / Phòng khám</TableHead>
                                <TableHead>Số điện thoại</TableHead>
                                <TableHead>Địa chỉ</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clinics.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">Chưa có cơ sở nào được tạo</TableCell>
                                </TableRow>
                            ) : (
                                clinics.map((item) => (
                                    <TableRow key={item.Id_PhongKham}>
                                        <TableCell className="font-medium dark:text-gray-200">{item.Id_PhongKham}</TableCell>
                                        <TableCell className="font-bold text-teal-700 dark:text-teal-400">
                                            {item.TenPhongKham}
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">{item.SoDienThoai}</TableCell>
                                        <TableCell className="dark:text-gray-300 max-w-xs truncate" title={item.DiaChi}>{item.DiaChi}</TableCell>
                                        <TableCell className="text-right">
                                            {item.GoogleMapUrl && (
                                                <Button variant="ghost" size="icon" onClick={() => window.open(item.GoogleMapUrl, '_blank')} className="text-emerald-500 hover:bg-emerald-50 mr-1" title="Google Maps">
                                                    <MapPin className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)} className="text-blue-500 hover:bg-blue-50 mr-1">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.Id_PhongKham)} className="text-red-500 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Dialog Thêm / Sửa */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>{editingClinic ? 'Cập nhật Phòng khám' : 'Thêm Phòng khám mới'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label>Tên Phòng khám / Cơ sở</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="VD: Phòng khám Đa khoa Quốc tế"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Số điện thoại</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="VD: 1900 1234"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="VD: contact@phongkham.com"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Địa chỉ</Label>
                                    <Textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Nhập địa chỉ đầy đủ"
                                        rows={2}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Đường dẫn Google Map</Label>
                                    <Input
                                        value={formData.google_map_url}
                                        onChange={(e) => setFormData({ ...formData, google_map_url: e.target.value })}
                                        placeholder="https://goo.gl/maps/..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL Ảnh Logo</Label>
                                    <Input
                                        value={formData.logo_url}
                                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL Ảnh Banner</Label>
                                    <Input
                                        value={formData.banner_url}
                                        onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                                        placeholder="https://example.com/banner.png"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-4 mt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                                <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white">Lưu thông tin</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
