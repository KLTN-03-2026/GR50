import React, { useState } from "react";
import { Calendar, Clock, MapPin, User as UserIcon, Phone, Mail, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function BookingDialog({ doctor, open, onClose, token, aiDiagnosis }) {
    const navigate = useNavigate();
    const [step, setStep] = useState("booking_info"); // booking_info, guest_info, otp_verify, success
    const [loading, setLoading] = useState(false);
    const [guestAppointmentId, setGuestAppointmentId] = useState(null);
    const [otp, setOtp] = useState("");

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        if (avatarPath.startsWith('http') || avatarPath.startsWith('blob:')) return avatarPath;
        if (avatarPath.startsWith('/images/')) return avatarPath;
        return `${API.replace('/api', '')}${avatarPath}`;
    };

    const [formData, setFormData] = useState({
        facility_id: doctor?.facilities?.[0]?.id || "",
        appointment_type: "in_person",
        appointment_date: "",
        appointment_time: "",
        symptoms: "",
        ai_diagnosis: aiDiagnosis || "",
    });

    const [guestData, setGuestData] = useState({
        full_name: "",
        phone: "",
        email: "",
        date_of_birth: "",
        gender: "Nam"
    });

    React.useEffect(() => {
        if (open && doctor) {
            setFormData(prev => ({
                ...prev,
                facility_id: prev.facility_id || doctor.facilities?.[0]?.id || "",
                ai_diagnosis: prev.ai_diagnosis || aiDiagnosis || ""
            }));
            setStep("booking_info");
        }
    }, [open, doctor, aiDiagnosis]);

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        if (token) {
            // Logged in user - proceed directly
            createAuthenticatedBooking();
        } else {
            // Guest user - go to next step
            setStep("guest_info");
        }
    };

    const createAuthenticatedBooking = async () => {
        setLoading(true);
        try {
            await axios.post(
                `${API}/appointments`,
                { ...formData, doctor_id: doctor.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Đặt lịch thành công!");
            onClose();
            navigate("/patient/appointments");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Đặt lịch thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleGuestInfoSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API}/appointments/guest`, {
                ...formData,
                ...guestData,
                doctor_id: doctor.id
            });
            setStep("success");
            toast.success("Đặt lịch thành công!");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Lỗi khi tạo lịch hẹn khách");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API}/appointments/guest/verify`, {
                appointment_id: guestAppointmentId,
                otp: otp
            });
            setStep("success");
            toast.success("Xác thực thành công!");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Mã OTP không hợp lệ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" translate="no">
                <DialogHeader>
                    <DialogTitle>
                        {step === "success" ? "Đặt lịch thành công!" : `Đặt lịch với ${doctor?.full_name}`}
                    </DialogTitle>
                    <DialogDescription className="text-xs" asChild>
                        <div>
                            <span className={step === "booking_info" ? "inline" : "hidden"}>Chọn thông tin khám bệnh phù hợp.</span>
                            <span className={step === "guest_info" ? "inline" : "hidden"}>Vui lòng nhập thông tin cá nhân để hoàn tất đặt lịch nhanh.</span>
                            <span className={step === "otp_verify" ? "inline" : "hidden"}>Nhập mã OTP vừa được gửi đến {guestData.phone || guestData.email}</span>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div key="booking_info" className={step === "booking_info" ? "block" : "hidden"}>
                    <form onSubmit={handleInitialSubmit} className="space-y-6">
                        {/* Facility & Service Selection */}
                        <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {doctor?.facilities && doctor.facilities.length > 0 && (
                                <div>
                                    <Label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Chọn cơ sở y tế</Label>
                                    <Select
                                        value={formData.facility_id?.toString()}
                                        onValueChange={(v) => setFormData({ ...formData, facility_id: parseInt(v) })}
                                        required
                                    >
                                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 h-12 rounded-xl">
                                            <SelectValue placeholder="Chọn cơ sở khám" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctor.facilities.map((fac) => (
                                                <SelectItem key={fac.id} value={fac.id.toString()}>
                                                    <div className="flex flex-col items-start py-1">
                                                        <span className="font-bold">{fac.name}</span>
                                                        <span className="text-[10px] text-gray-500">{fac.address}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Hình thức khám</Label>
                                    <Select
                                        value={formData.appointment_type}
                                        onValueChange={(v) => setFormData({ ...formData, appointment_type: v })}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="in_person">Trực tiếp tại phòng khám</SelectItem>
                                            <SelectItem value="online">Tư vấn video trực tuyến</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Ngày khám</Label>
                                    <Input
                                        type="date"
                                        value={formData.appointment_date}
                                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                        required
                                        className="bg-white dark:bg-gray-800 border-gray-200 h-12 rounded-xl"
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Giờ khám mong muốn</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="time"
                                        value={formData.appointment_time}
                                        onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                                        required
                                        className="bg-white dark:bg-gray-800 border-gray-200 h-12 rounded-xl pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-gray-500 uppercase block">Triệu chứng hoặc Lý do khám</Label>
                            <Textarea
                                value={formData.symptoms}
                                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                placeholder="Hãy mô tả tình trạng sức khỏe của bạn để bác sĩ chuẩn bị tốt hơn..."
                                className="rounded-2xl min-h-[100px] border-gray-200 bg-white dark:bg-gray-800"
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl">Hủy bỏ</Button>
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className="flex-2 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 font-bold shadow-lg shadow-teal-500/20"
                            >
                                {token ? "Xác nhận đặt lịch" : "Tiếp theo: Nhập thông tin bệnh nhân"}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </form>
                </div>

                <div key="guest_info" className={step === "guest_info" ? "block" : "hidden"}>
                    <div className="space-y-6">
                        {/* Doctor Summary Card */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                            <div className="w-16 h-16 rounded-full bg-teal-500 flex-shrink-0 overflow-hidden shadow-md">
                                {doctor?.avatar ? (
                                    <img src={getAvatarUrl(doctor.avatar)} className="w-full h-full object-cover" alt="Doctor" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">D</div>
                                )}
                            </div>
                            <div className="text-sm">
                                <div className="text-blue-600 font-bold uppercase text-[10px]">ĐẶT LỊCH KHÁM</div>
                                <div className="font-bold text-gray-900 dark:text-white">{doctor?.full_name}</div>
                                <div className="text-gray-600 dark:text-gray-400 text-xs">
                                    <Calendar className="w-3 h-3 inline mr-1" /> <span>{formData.appointment_time}</span> - <span>{formData.appointment_date ? new Date(formData.appointment_date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : ""}</span>
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-1 italic">
                                    <MapPin className="w-3 h-3 inline mr-1" /> <span>{doctor?.facilities?.find(f => f.id === formData.facility_id)?.name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Consultation Fee Info */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                             <div className="flex items-center gap-2 mb-2">
                                 <div className="w-4 h-4 rounded-full border-2 border-cyan-500 flex items-center justify-center">
                                     <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                                 </div>
                                 <span className="text-sm font-semibold">Giá khám: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor?.consultation_fee || 0)}</span>
                             </div>
                        </div>

                        {/* Guest Booking Form */}
                        <form onSubmit={handleGuestInfoSubmit} className="space-y-4">
                            <div className="flex gap-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="radio" name="booking_for" defaultChecked className="text-cyan-600" />
                                    <span>Đặt cho mình</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer opacity-50">
                                    <input type="radio" name="booking_for" disabled className="text-cyan-600" />
                                    <span>Đặt cho người thân</span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        value={guestData.full_name}
                                        onChange={(e) => setGuestData({ ...guestData, full_name: e.target.value })}
                                        required
                                        className="pl-10"
                                        placeholder="Họ tên bệnh nhân (bắt buộc)"
                                    />
                                    <div className="text-[10px] text-gray-400 mt-1">Hãy ghi rõ Họ và Tên, viết hoa những chữ cái đầu tiên</div>
                                </div>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="radio" checked={guestData.gender === 'Nam'} onChange={() => setGuestData({ ...guestData, gender: 'Nam' })} className="text-cyan-600" />
                                        <span>Nam</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="radio" checked={guestData.gender === 'Nu'} onChange={() => setGuestData({ ...guestData, gender: 'Nu' })} className="text-cyan-600" />
                                        <span>Nữ</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            value={guestData.phone}
                                            onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                                            required
                                            className="pl-10"
                                            placeholder="Số điện thoại liên hệ"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="email"
                                            value={guestData.email}
                                            onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                                            className="pl-10"
                                            placeholder="Địa chỉ email"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="date"
                                        value={guestData.date_of_birth}
                                        onChange={(e) => setGuestData({ ...guestData, date_of_birth: e.target.value })}
                                        required
                                        className="pl-10"
                                        placeholder="Ngày sinh (bắt buộc)"
                                    />
                                </div>

                                <div className="relative">
                                    <Label className="text-xs text-gray-500 mb-1 block">Lý do khám / Triệu chứng</Label>
                                    <Textarea
                                        value={formData.symptoms}
                                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                        placeholder="Mô tả triệu chứng của bạn..."
                                        className="min-h-[80px]"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl space-y-2">
                                <div className="text-xs font-bold text-blue-600 uppercase">Hình thức thanh toán</div>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" checked readOnly className="text-cyan-600" />
                                    <span>Thanh toán sau tại cơ sở y tế</span>
                                </label>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>Giá khám</span>
                                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor?.consultation_fee || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Phí đặt lịch</span>
                                        <span className="text-green-600 font-bold">Miễn phí</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                                        <span>Tổng cộng</span>
                                        <span className="text-red-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor?.consultation_fee || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg border border-cyan-100 dark:border-cyan-900/30">
                                <div className="text-[10px] text-cyan-800 dark:text-cyan-300">
                                    <b>LƯU Ý:</b> <span>Thông tin quý khách cung cấp sẽ được sử dụng để làm hồ sơ khám bệnh. Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setStep("booking_info")} className="flex-1">Quay lại</Button>
                                <Button type="submit" disabled={loading} className="flex-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold h-12 shadow-md shadow-yellow-500/20">
                                    {loading ? "Đang xử lý..." : "Xác nhận đặt khám"}
                                </Button>
                            </div>
                            <div className="text-[10px] text-center text-gray-500">
                                Bằng việc nhấn xác nhận đặt khám, bạn đã hoàn toàn đồng ý với <span className="text-cyan-600 underline">Điều khoản sử dụng</span> dịch vụ của chúng tôi.
                            </div>
                        </form>
                    </div>
                </div>

                <div key="booking_otp_verify_step" className={step === "otp_verify" ? "block" : "hidden"}>
                    <form onSubmit={handleOtpVerify} className="space-y-6 py-4">
                        <div className="text-center">
                            <Label className="text-lg font-bold mb-4 block">Nhập mã xác thực</Label>
                            <Input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="text-center text-3xl tracking-[1em] h-16 font-bold"
                                maxLength={6}
                                placeholder="000000"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="ghost" onClick={() => setStep("guest_info")} className="flex-1">Quay lại</Button>
                            <Button type="submit" disabled={loading || otp.length < 6} className="flex-1 bg-teal-600">
                                {loading ? "Đang xác thực..." : "Xác nhận đặt lịch"}
                            </Button>
                        </div>
                    </form>
                </div>

                <div key="success" className={step === "success" ? "block" : "hidden"}>
                    <div className="text-center py-8 space-y-6">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">Đặt lịch thành công!</h3>
                            <div className="text-gray-600">Lịch hẹn của bạn đang chờ cơ sở y tế xác nhận. Bạn có thể tra cứu lịch hẹn bằng số điện thoại vừa đăng ký.</div>
                        </div>
                        <div className="pt-4 space-y-3">
                            <Button onClick={() => navigate("/login")} className="w-full bg-teal-600">
                                Đăng nhập để quản lý lịch hẹn
                            </Button>
                            <Button variant="outline" onClick={onClose} className="w-full">
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

