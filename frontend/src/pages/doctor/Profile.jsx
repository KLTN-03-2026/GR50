import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { User } from 'lucide-react';

export default function DoctorProfile() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    specialty_id: '',
    bio: '',
    experience_years: 0,
    consultation_fee: 0,
    degree: '',
    workplace: '',
    certificate_number: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, specialtiesRes] = await Promise.all([
        axios.get(`${API}/doctors/profile/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/specialties`)
      ]);
      setProfile(profileRes.data);
      setSpecialties(specialtiesRes.data);
      setFormData({
        specialty_id: profileRes.data.specialty_id || '',
        bio: profileRes.data.bio || '',
        experience_years: profileRes.data.experience_years || 0,
        consultation_fee: profileRes.data.consultation_fee || 0,
        degree: profileRes.data.degree || '',
        workplace: profileRes.data.workplace || '',
        certificate_number: profileRes.data.certificate_number || ''
      });
    } catch (error) {
      toast.error('Không thể tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API}/doctors/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cập nhật hồ sơ thành công!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http') || avatarPath.startsWith('blob:')) return avatarPath;
    if (avatarPath.startsWith('/images/')) return avatarPath;
    return `${API.replace('/api', '')}${avatarPath}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Hồ sơ bác sĩ</h1>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg">
                  {profile?.avatar ? (
                    <img 
                      src={getAvatarUrl(profile.avatar)} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    user?.full_name?.charAt(0) || 'D'
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('avatar', file);
                      setUploading(true);
                      try {
                        await axios.post(`${API}/auth/update-avatar`, formData, {
                          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
                        });
                        toast.success('Cập nhật ảnh đại diện thành công');
                        fetchData();
                      } catch (error) {
                        toast.error('Lỗi khi tải ảnh lên');
                      } finally {
                        setUploading(false);
                      }
                    }} 
                  />
                  <span className="text-xs font-medium">{uploading ? '...' : 'Đổi ảnh'}</span>
                </label>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.full_name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                {profile && (
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${profile.status === 'approved' ? 'bg-green-100 text-green-800' :
                    profile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {profile.status === 'approved' ? 'Đã duyệt' :
                      profile.status === 'pending' ? 'Chờ duyệt' : 'Đã từ chối'}
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="specialty_id">Chuyên khoa *</Label>
                <Select value={formData.specialty_id} onValueChange={(v) => setFormData({ ...formData, specialty_id: v })}>
                  <SelectTrigger data-testid="specialty-select" className="mt-2">
                    <SelectValue placeholder="Chọn chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="degree">Học hàm / Học vị</Label>
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="VD: Thạc sĩ, Bác sĩ CKI..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="certificate_number">Số CCHN</Label>
                  <Input
                    id="certificate_number"
                    value={formData.certificate_number}
                    onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                    placeholder="Số chứng chỉ hành nghề"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="workplace">Nơi đào tạo / Công tác</Label>
                <Input
                  id="workplace"
                  value={formData.workplace}
                  onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                  placeholder="VD: Đại học Y Hà Nội, Bệnh viện Bạch Mai..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="bio">Giới thiệu chuyên môn & Thế mạnh</Label>
                <Textarea
                  data-testid="bio-input"
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Giới thiệu về bản thân, kinh nghiệm, các thế mạnh chuyên môn..."
                  className="mt-2"
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="experience_years">Số năm kinh nghiệm</Label>
                <Input
                  data-testid="experience-input"
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="consultation_fee">Phí tư vấn (VNĐ)</Label>
                <Input
                  data-testid="fee-input"
                  id="consultation_fee"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
                  className="mt-2"
                />
              </div>

              <Button data-testid="save-profile-btn" type="submit" disabled={saving} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </form>
          </div>

          {/* Reviews Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Đánh giá từ bệnh nhân</h2>

            {profile?.reviews && profile.reviews.length > 0 ? (
              <div className="space-y-6">
                {profile.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {review.Patient?.avatar ? (
                          <img src={review.Patient.avatar} alt={review.Patient.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{review.Patient?.full_name || 'Người dùng ẩn danh'}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có đánh giá nào từ bệnh nhân.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
