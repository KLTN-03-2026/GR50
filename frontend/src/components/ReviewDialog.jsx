import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config';
import { AuthContext } from '@/contexts/AuthContext';

export default function ReviewDialog({ open, onOpenChange, doctorId, doctorName, appointmentId, onSuccess }) {

    const { token } = useContext(AuthContext);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (open && doctorId) {
            fetchReview();
        }
    }, [open, doctorId]);

    const fetchReview = async () => {
        setFetching(true);
        try {
            const response = await axios.get(`${API}/doctors/${doctorId}/review`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setExistingReview(response.data);
                setRating(response.data.rating);
                setComment(response.data.comment);
            } else {
                setExistingReview(null);
                setRating(5);
                setComment('');
            }
        } catch (error) {
            console.error('Error fetching review:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async () => {
        if (!comment.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        setLoading(true);
        try {
            if (existingReview) {
                // Update
                await axios.put(`${API}/doctors/${doctorId}/reviews`, {
                    rating,
                    comment,
                    review_id: existingReview.Id_DanhGia
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Cập nhật đánh giá thành công');
            } else {
                // Create
                await axios.post(`${API}/doctors/${doctorId}/reviews`, {
                    rating,
                    comment,
                    appointment_id: appointmentId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Gửi đánh giá thành công');
            }
            if (onSuccess) onSuccess();
            onOpenChange(false);
        } catch (error) {

            toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Đánh giá bác sĩ {doctorName}</DialogTitle>
                </DialogHeader>

                {fetching ? (
                    <div className="py-8 text-center text-gray-500">Đang tải...</div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nhận xét của bạn</label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm khám bệnh của bạn..."
                                rows={4}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || fetching} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                        {loading ? 'Đang gửi...' : (existingReview ? 'Cập nhật' : 'Gửi đánh giá')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
