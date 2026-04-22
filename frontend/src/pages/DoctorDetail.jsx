import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Star, MapPin, Clock, DollarSign, User, ArrowLeft, Mail, Phone } from 'lucide-react';
import BookingDialog from '@/components/BookingDialog';

export default function DoctorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
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

    const handleActionGate = (action) => {
        if (!user) {
            toast.info(`Vui lòng đăng nhập để ${action}`);
            navigate(`/login?redirect=/doctors/${id}`);
            return false;
        }
        return true;
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!handleActionGate('đánh giá')) return;

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

    const handleBookingClick = () => {
        if (!handleActionGate('đặt lịch khám')) return;
        setShowBooking(true);
    };

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        if (avatarPath.startsWith('http')) return avatarPath;
        return `${API.replace('/api', '')}${avatarPath}`;
    };

    if (loading) return <div className="p-6 text-center">Đang tải...</div>;
    if (!doctor) return <div className="p-6 text-center">Không tìm thấy bác sĩ</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Header / Navigation Bar (Simplified or reuse your app header if needed) */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                    </Button>
                    <span className="font-bold text-gray-900 dark:text-white">Chi tiết bác sĩ</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Basic Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 shadow-xl overflow-hidden ring-4 ring-white dark:ring-gray-700">
                                    {doctor.avatar ? (
                                        <img src={getAvatarUrl(doctor.avatar)} alt={doctor.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        doctor.full_name?.charAt(0) || 'D'
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="mb-4">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{doctor.full_name}</h1>
                                        <p className="text-cyan-600 dark:text-cyan-400 font-semibold text-lg">{doctor.specialty_name || doctor.Specialty?.name}</p>
                                    </div>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-2xl flex items-center gap-2 border border-yellow-100 dark:border-yellow-900/30">
                                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                            <span className="font-bold text-yellow-700 dark:text-yellow-400">{doctor.average_rating || 0}</span>
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">({doctor.review_count || 0} đánh giá)</span>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl flex items-center gap-2 border border-blue-100 dark:border-blue-900/30">
                                            <Clock className="w-5 h-5 text-blue-500" />
                                            <span className="font-semibold text-blue-700 dark:text-blue-400">{doctor.experience_years || 0} năm kinh nghiệm</span>
                                        </div>
                                    </div>

                                    <div className="prose dark:prose-invert max-w-none">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Giới thiệu</h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                            {doctor.bio || 'Chưa có thông tin giới thiệu.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Đánh giá từ bệnh nhân</h3>
                            {doctor.reviews && doctor.reviews.length > 0 ? (
                                <div className="space-y-8">
                                    {doctor.reviews.map((review) => (
                                        <div key={review.id} className="group relative">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {review.Patient?.avatar ? (
                                                        <img src={getAvatarUrl(review.Patient.avatar)} alt="User" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 dark:text-white">{review.Patient?.full_name || 'Bệnh nhân'}</h4>
                                                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 dark:text-gray-600'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                                                        {review.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500">Chưa có đánh giá nào cho bác sĩ này.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Actions & Fees */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-cyan-100 dark:border-cyan-900/30 sticky top-24">
                            <div className="mb-8">
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Phí tư vấn</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor.consultation_fee)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Địa điểm</p>
                                        <p className="font-medium text-sm">
                                            {doctor.facilities?.find(f => f.is_primary)?.address || doctor.facilities?.[0]?.address || 'Chăm sóc tại cơ sở y tế'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Đặt lịch</p>
                                        <p className="font-medium">Sẵn sàng ngay</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleBookingClick}
                                className="w-full py-8 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl shadow-cyan-500/20 rounded-2xl transform hover:scale-[1.02] transition-all"
                            >
                                Đặt lịch khám ngay
                            </Button>

                            {!user && (
                                <p className="text-center text-xs text-gray-500 mt-4">
                                    * Vui lòng đăng nhập để thực hiện đặt lịch
                                </p>
                            )}
                        </div>

                        {/* Review Form Component */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Viết đánh giá</h3>
                            {!user ? (
                                <div className="bg-cyan-50 dark:bg-cyan-900/10 p-6 rounded-2xl border border-cyan-100 dark:border-cyan-900/30 text-center">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                        Vui lòng đăng nhập để gửi đánh giá cho bác sĩ này.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(`/login?redirect=/doctors/${id}`)}
                                        className="w-full border-cyan-500 text-cyan-600 rounded-xl"
                                    >
                                        Đăng nhập ngay
                                    </Button>
                                </div>
                            ) : doctor.can_review ? (
                                <form onSubmit={handleSubmitReview} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Chọn số sao</label>
                                        <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl justify-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                                >
                                                    <Star
                                                        className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-200 dark:text-gray-700'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nhận xét của bạn</label>
                                        <Textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Chia sẻ trải nghiệm khám bệnh của bạn tại đây..."
                                            className="rounded-2xl min-h-[120px] bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="w-full py-6 rounded-2xl border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-400 font-bold"
                                        disabled={submittingReview}
                                    >
                                        {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                    </Button>
                                </form>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                                    <p className="text-gray-500 text-sm">
                                        Bạn chỉ có thể đánh giá sau khi đã hoàn tất khám với bác sĩ này.
                                    </p>
                                </div>
                            )}
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
            )}
        </div>
    );
}
