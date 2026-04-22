import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API } from '@/config';
import { AuthContext } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, Stethoscope } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
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

export default function AdminSpecialties() {
    const { token } = useContext(AuthContext);
    const { t } = useLanguage();
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchSpecialties();
    }, []);

    const fetchSpecialties = async () => {
        try {
            const response = await axios.get(`${API}/specialties`);
            setSpecialties(response.data);
        } catch (error) {
            toast.error('Không thể tải chuyên khoa');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (specialty = null) => {
        setEditingSpecialty(specialty);
        if (specialty) {
            setFormData({ name: specialty.name, description: specialty.description || '' });
        } else {
            setFormData({ name: '', description: '' });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return toast.error('Vui lòng nhập tên chuyên khoa');

        try {
            if (editingSpecialty) {
                await axios.put(`${API}/specialties/${editingSpecialty.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Cập nhật thành công');
            } else {
                await axios.post(`${API}/specialties`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Thêm mới thành công');
            }
            setDialogOpen(false);
            fetchSpecialties();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa chuyên khoa này?')) return;
        try {
            await axios.delete(`${API}/specialties/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Xóa thành công');
            fetchSpecialties();
        } catch (error) {
            toast.error('Không thể xóa chuyên khoa');
        }
    };

    if (loading) return <Layout><div className="p-6">Đang tải...</div></Layout>;

    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                        <Stethoscope className="w-6 h-6 text-teal-600" />
                        Quản lý Chuyên khoa
                    </h1>
                    <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-teal-500 to-cyan-500">
                        <Plus className="w-4 h-4 mr-2" /> Thêm Chuyên khoa
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">ID</TableHead>
                                <TableHead>Tên Chuyên Khoa</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {specialties.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">Chưa có chuyên khoa nào</TableCell>
                                </TableRow>
                            ) : (
                                specialties.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium dark:text-gray-200">{s.id}</TableCell>
                                        <TableCell className="font-semibold dark:text-gray-200">{s.name}</TableCell>
                                        <TableCell className="max-w-xs truncate dark:text-gray-400">{s.description}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(s)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingSpecialty ? 'Sửa Chuyên khoa' : 'Thêm Chuyên khoa mới'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tên Chuyên khoa</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="VD: Nhi khoa"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mô tả chi tiết</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Mô tả chức năng..."
                                rows={3}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                            <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white">Lưu</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
