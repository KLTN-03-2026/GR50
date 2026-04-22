import React, { useState } from "react";
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
    const [formData, setFormData] = useState({
        facility_id: doctor?.facilities?.[0]?.id || "",
        appointment_type: "in_person",
        appointment_date: "",
        appointment_time: "",
        symptoms: "",
        ai_diagnosis: aiDiagnosis || "",
    });

    React.useEffect(() => {
        if (open && doctor) {
            setFormData(prev => ({
                ...prev,
                facility_id: prev.facility_id || doctor.facilities?.[0]?.id || "",
                ai_diagnosis: prev.ai_diagnosis || aiDiagnosis || ""
            }));
        }
    }, [open, doctor, aiDiagnosis]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const appointmentRes = await axios.post(
                `${API}/appointments`,
                {
                    ...formData,
                    doctor_id: doctor.user_id,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success("Đặt lịch thành công! Vui lòng chờ xác nhận.");
            onClose();
            navigate("/patient/appointments");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Đặt lịch thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Đặt lịch với {doctor.full_name}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Biểu mẫu đặt lịch khám với bác sĩ.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {doctor.facilities && doctor.facilities.length > 0 && (
                        <div>
                            <Label>Cơ sở y tế</Label>
                            <Select
                                value={formData.facility_id ? formData.facility_id.toString() : undefined}
                                onValueChange={(v) =>
                                    setFormData({ ...formData, facility_id: parseInt(v) })
                                }
                                required
                            >
                                <SelectTrigger data-testid="facility-select" className="mt-2">
                                    <SelectValue placeholder="Chọn cơ sở" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctor.facilities.map((fac) => (
                                        <SelectItem key={fac.id} value={fac.id.toString()}>
                                            {fac.name} - {fac.address}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <Label>Loại hình khám</Label>
                        <Select
                            value={formData.appointment_type}
                            onValueChange={(v) =>
                                setFormData({ ...formData, appointment_type: v })
                            }
                        >
                            <SelectTrigger data-testid="appointment-type-select" className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="in_person">Khám trực tiếp</SelectItem>
                                <SelectItem value="online">Tư vấn online</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Ngày khám</Label>
                        <Input
                            data-testid="appointment-date-input"
                            type="date"
                            value={formData.appointment_date}
                            onChange={(e) =>
                                setFormData({ ...formData, appointment_date: e.target.value })
                            }
                            required
                            className="mt-2"
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    <div>
                        <Label>Giờ khám</Label>
                        <Input
                            data-testid="appointment-time-input"
                            type="time"
                            value={formData.appointment_time}
                            onChange={(e) =>
                                setFormData({ ...formData, appointment_time: e.target.value })
                            }
                            required
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label>Triệu chứng</Label>
                        <Textarea
                            data-testid="symptoms-input"
                            value={formData.symptoms}
                            onChange={(e) =>
                                setFormData({ ...formData, symptoms: e.target.value })
                            }
                            placeholder="Mô tả triệu chứng của bạn..."
                            className="mt-2"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            data-testid="cancel-booking-btn"
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            data-testid="confirm-booking-btn"
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500"
                        >
                            {loading ? "Đang xử lý..." : "Xác nhận"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
