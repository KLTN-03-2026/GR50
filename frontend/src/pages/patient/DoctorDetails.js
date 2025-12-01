import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Star, MapPin, Clock, DollarSign, User, ArrowLeft, Mail, Phone } from 'lucide-react';
import Layout from '@/components/Layout';
import BookingDialog from '@/components/BookingDialog';

export default function DoctorDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showBooking, setShowBooking] = useState(false);

    useEffect(() => {
        fetchDoctorDetails();
    }, [id]);

    const fetchDoctorDetails = async () => {
        try {
            const response = await axios.get(`${API}/doctors/${id}`);
            setDoctor(response.data);
        } catch (error) {
            toast.error('Không thể tải thông tin bác sĩ');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }
        setSubmittingReview(true);
        try {
            await axios.post(`${API}/doctors/${id}/reviews`, {
                rating: reviewRating,
                comment: reviewComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đánh giá thành công!');
            setReviewComment('');
            fetchDoctorDetails(); // Refresh to show new review
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Lỗi khi gửi đánh giá');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <Layout><div className="p-6 text-center">Đang tải...</div></Layout>;
    if (!doctor) return <Layout><div className="p-6 text-center">Không tìm thấy bác sĩ</div></Layout>;

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                    </Button>

                    {/* Doctor Profile Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 shadow-lg overflow-hidden">
                                {doctor.avatar ? (
                                    <img src={doctor.avatar} alt={doctor.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    doctor.full_name?.charAt(0) || 'D'
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{doctor.full_name}</h1>
                                        <p className="text-teal-600 font-semibold text-lg mb-4">{doctor.Specialty?.name}</p>
                                    </div>
                                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                        <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                                        <span className="font-bold text-yellow-700">{doctor.average_rating || 0}</span>
                                        <span className="text-gray-500 text-sm ml-1">({doctor.review_count} đánh giá)</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {doctor.experience_years > 0 && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                                            <Clock className="w-5 h-5 mr-2 text-teal-500" />
                                            <span>{doctor.experience_years} năm kinh nghiệm</span>
                                        </div>
                                    )}
                                    {doctor.consultation_fee > 0 && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                                            <DollarSign className="w-5 h-5 mr-2 text-teal-500" />
                                            <span>Phí tư vấn: {parseInt(doctor.consultation_fee).toLocaleString()} VNĐ</span>
                                        </div>
                                    )}
                                </div>

                                <div className="prose dark:prose-invert max-w-none">
                                    <h3 className="text-lg font-semibold mb-2">Giới thiệu</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{doctor.bio || 'Chưa có thông tin giới thiệu.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info & Booking */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{doctor.User?.email}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                <p className="font-medium">{doctor.User?.phone}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Địa chỉ</p>
                                <p className="font-medium">{doctor.User?.address || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mb-8">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                            onClick={() => setShowBooking(true)}
                        >
                            Đặt lịch khám ngay
                        </Button>
                    </div>

                    {/* Reviews Section */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Review Form */}
                        <div className="md:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6">
                                <h3 className="text-xl font-bold mb-4">Viết đánh giá</h3>
                                <form onSubmit={handleSubmitReview}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="focus:outline-none"
                                                >
                                                    <Star
                                                        className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Nhận xét</label>
                                        <Textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Chia sẻ trải nghiệm của bạn..."
                                            rows={4}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={submittingReview}>
                                        {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="md:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold mb-6">Đánh giá từ bệnh nhân</h3>
                                {doctor.reviews && doctor.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {doctor.reviews.map((review) => (
                                            <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                        {review.Patient?.avatar ? (
                                                            <img src={review.Patient.avatar} alt="User" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-6 h-6 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-semibold">{review.Patient?.full_name || 'Người dùng ẩn danh'}</h4>
                                                                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                                            </div>
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">Chưa có đánh giá nào.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showBooking && (
                <BookingDialog
                    doctor={doctor}
                    open={showBooking}
                    onClose={() => setShowBooking(false)}
                    token={token}
                />
            )
            }
        </Layout >
    );
}
