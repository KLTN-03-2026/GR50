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
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function BookingDialog({ doctor, open, onClose, token, aiDiagnosis }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        appointment_type: "in_person",
        appointment_date: "",
        appointment_time: "",
        symptoms: "",
        ai_diagnosis: aiDiagnosis || "",
    });
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

            toast.success("Đặt lịch thành công! Vui lòng thanh toán để xác nhận.");
            onClose();

            if (appointmentRes.data.payment_id) {
                navigate(`/patient/payment/${appointmentRes.data.payment_id}`);
            } else {
                navigate("/patient/appointments");
            }
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
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
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
