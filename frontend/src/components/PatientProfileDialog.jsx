import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Droplets, 
  HeartPulse, 
  AlertCircle,
  ShieldCheck,
  Activity,
  UserCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function PatientProfileDialog({ open, onOpenChange, patientId, reason = 'Medical inquiry' }) {
  const { token, user: currentUser } = useContext(AuthContext);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && patientId) {
      fetchPatientDetail();
    }
  }, [open, patientId]);

  const fetchPatientDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/patients/${patientId}?reason=${encodeURIComponent(reason)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientData(response.data);
    } catch (error) {
      console.error('Failed to fetch patient detail', error);
    } finally {
      setLoading(false);
    }
  };

  if (!patientData && loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <div className="h-64 flex items-center justify-center bg-gray-50">
            <Activity className="w-8 h-8 text-teal-500 animate-pulse" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!patientData) return null;

  const isHidden = (val) => val === 'HIDDEN' || !val;
  const isEmergencyOnly = (val) => val?.includes('Emergency only');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl dark:bg-gray-900">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-8 text-white relative">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30">
              {patientData.avatar ? (
                <img src={patientData.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{patientData.ho} {patientData.ten}</h2>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-none hover:bg-white/30 backdrop-blur-sm">ID: P-{patientData.id}</Badge>
                <Badge className="bg-teal-400 text-teal-900 border-none font-bold">Bệnh nhân</Badge>
              </div>
            </div>
          </div>
          <UserCheck className="absolute top-8 right-8 w-12 h-12 text-white/10" />
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Thông tin cơ bản */}
          <section>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              Thông tin Cơ bản
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Số điện thoại
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{patientData.so_dien_thoai || 'Chưa cập nhật'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{patientData.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Ngày sinh
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {patientData.ngay_sinh ? new Date(patientData.ngay_sinh).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Giới tính</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{patientData.gioi_tinh || 'Khác'}</p>
              </div>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Dữ liệu Y tế & Khẩn cấp */}
          <section>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-red-500" />
              Dữ liệu Y tế & Khẩn cấp
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase">Nhóm máu</p>
                    <p className={`text-lg font-black ${isEmergencyOnly(patientData.nhom_mau) ? 'text-gray-400 italic text-sm' : 'text-red-700 dark:text-red-300'}`}>
                      {patientData.nhom_mau === 'HIDDEN' ? 'Quyền truy cập hạn chế' : patientData.nhom_mau}
                    </p>
                  </div>
                </div>
                {isEmergencyOnly(patientData.nhom_mau) && (
                  <Badge variant="outline" className="text-red-600 border-red-200">Emergency Only</Badge>
                )}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-teal-500" />
                  Tiền sử bệnh lý
                </h4>
                {isHidden(patientData.tien_su_benh) ? (
                  <div className="flex items-center gap-2 text-gray-400 italic text-sm py-2">
                    <AlertCircle className="w-4 h-4" />
                    Chỉ dành cho bác sĩ điều trị
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {patientData.tien_su_benh}
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Liên hệ khẩn cấp
                </h4>
                {isHidden(patientData.nguoi_lien_he) ? (
                  <div className="text-gray-400 italic text-sm">Hạn chế truy cập</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-blue-500 uppercase font-bold">Người thân</p>
                      <p className="font-bold text-blue-900 dark:text-blue-100">{patientData.nguoi_lien_he}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-500 uppercase font-bold">SĐT Khẩn cấp</p>
                      <p className="font-bold text-blue-900 dark:text-blue-100">{patientData.sdt_lien_he}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-center">
           <p className="text-[10px] text-gray-400 italic">
             Mọi truy cập dữ liệu nhạy cảm đều được ghi log để đảm bảo an toàn thông tin (Privacy Rule Compliance)
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
