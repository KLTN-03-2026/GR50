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
import { User, Mail, Phone, ShieldCheck, GraduationCap, Briefcase, Award, Building2, Star, CheckCircle2, XCircle, Clock, Globe, FileText, ExternalLink, Info, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
    training: '',
    workplace: '',
    certificate_number: '',
    languages: 'Tiếng Việt',
    services: '',
    certificates: []
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
        training: profileRes.data.training || '',
        workplace: profileRes.data.workplace || '',
        certificate_number: profileRes.data.certificate_number || '',
        languages: profileRes.data.languages || 'Tiếng Việt',
        services: profileRes.data.services || '',
        certificates: profileRes.data.certificates || []
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

  const statusConfig = {
    ChoDuyet: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    DaDuyet: { label: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ShieldCheck },
    TuChoi: { label: 'Đã từ chối', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle }
  };

  const currentStatus = statusConfig[profile?.approval_status] || statusConfig.ChoDuyet;

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Block: Basic Info */}
          <Card className="border-none shadow-xl shadow-blue-500/5 rounded-3xl overflow-hidden bg-white">
            <div className="h-32 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />
            <CardContent className="relative pt-0 pb-8 px-8">
              <div className="flex flex-col md:flex-row items-end gap-6 -mt-16">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-3xl border-4 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                    {profile?.avatar ? (
                      <img src={getAvatarUrl(profile.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-teal-50 flex items-center justify-center text-teal-600 text-4xl font-black">
                        {user?.full_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 p-3 bg-white hover:bg-teal-50 text-teal-600 rounded-2xl shadow-xl border border-teal-100 cursor-pointer transition-all active:scale-95 group">
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
                        } catch (error) { toast.error('Lỗi khi tải ảnh lên'); } finally { setUploading(false); }
                      }} 
                    />
                    {uploading ? <Clock className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
                  </label>
                </div>

                <div className="flex-1 space-y-2 pb-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.full_name}</h1>
                    <Badge variant="outline" className={`${currentStatus.color} rounded-xl px-4 py-1.5 font-bold uppercase tracking-widest text-[10px] border flex items-center gap-2`}>
                      <currentStatus.icon className="w-3.5 h-3.5" />
                      {currentStatus.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-teal-500" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-500" />
                      <span>{user?.phone || 'Chưa cập nhật SĐT'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-500" />
                      <span>ID: BS-{profile?.id?.toString().padStart(4, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="bg-white border p-1 rounded-2xl h-14 mb-8 shadow-sm">
              <TabsTrigger value="info" className="rounded-xl px-8 font-bold data-[state=active]:bg-teal-500 data-[state=active]:text-white">Hồ sơ chuyên môn</TabsTrigger>
              <TabsTrigger value="facilities" className="rounded-xl px-8 font-bold data-[state=active]:bg-teal-500 data-[state=active]:text-white">Cơ sở làm việc</TabsTrigger>
              <TabsTrigger value="docs" className="rounded-xl px-8 font-bold data-[state=active]:bg-teal-500 data-[state=active]:text-white">Tài liệu xác thực</TabsTrigger>
              <TabsTrigger value="performance" className="rounded-xl px-8 font-bold data-[state=active]:bg-teal-500 data-[state=active]:text-white">Hiệu suất & Đánh giá</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-teal-600">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-black text-slate-800">Thông tin chuyên môn</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-slate-500 font-bold text-xs uppercase">Chuyên khoa chính *</Label>
                          <Select value={formData.specialty_id} onValueChange={(v) => setFormData({ ...formData, specialty_id: v })}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none">
                              <SelectValue placeholder="Chọn chuyên khoa" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                              {specialties.map(s => (
                                <SelectItem key={s.id} value={s.id.toString()} className="rounded-lg">{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-500 font-bold text-xs uppercase">Học hàm / Học vị</Label>
                          <Input
                            value={formData.degree}
                            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                            placeholder="VD: Thạc sĩ, Bác sĩ CKI..."
                            className="h-12 rounded-xl bg-slate-50 border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-500 font-bold text-xs uppercase">Số năm kinh nghiệm</Label>
                          <Input
                            type="number"
                            value={formData.experience_years}
                            onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                            className="h-12 rounded-xl bg-slate-50 border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-500 font-bold text-xs uppercase">Số CCHN</Label>
                          <Input
                            value={formData.certificate_number}
                            onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                            placeholder="Số chứng chỉ hành nghề"
                            className="h-12 rounded-xl bg-slate-50 border-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-500 font-bold text-xs uppercase">Nơi đào tạo / Công tác</Label>
                        <Input
                          value={formData.workplace}
                          onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                          placeholder="Bệnh viện, Đại học Y..."
                          className="h-12 rounded-xl bg-slate-50 border-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-500 font-bold text-xs uppercase">Giới thiệu thế mạnh</Label>
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Mô tả kỹ năng chuyên sâu..."
                          className="rounded-xl bg-slate-50 border-none min-h-[120px]"
                        />
                      </div>

                      <Button 
                        onClick={handleSubmit} 
                        disabled={saving} 
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:shadow-lg hover:shadow-teal-500/20 font-black uppercase tracking-widest text-sm transition-all"
                      >
                        {saving ? 'Đang cập nhật...' : 'Lưu hồ sơ chuyên môn'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-8">
                  <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b">
                      <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-teal-600" /> Ngôn ngữ & Dịch vụ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-slate-500 font-bold text-xs uppercase">Ngôn ngữ hỗ trợ</Label>
                        <Input 
                          value={formData.languages} 
                          onChange={(e) => setFormData({...formData, languages: e.target.value})} 
                          placeholder="Tiếng Việt, Tiếng Anh..." 
                          className="rounded-xl bg-slate-50 border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-500 font-bold text-xs uppercase">Dịch vụ cung cấp</Label>
                        <Textarea 
                          value={formData.services} 
                          onChange={(e) => setFormData({...formData, services: e.target.value})} 
                          placeholder="Khám tổng quát, Tư vấn tâm lý..." 
                          className="rounded-xl bg-slate-50 border-none"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl">
                          <Activity className="w-6 h-6 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-white/60 font-bold uppercase text-[10px] tracking-widest">Trạng thái nhận lịch</p>
                          <h3 className="text-xl font-black">Sẵn sàng nhận lịch</h3>
                        </div>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/60">Tư vấn Online</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Đang mở</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/60">Khám tại chỗ</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Đang mở</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="facilities">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile?.facilities?.map((f) => (
                  <Card key={f.id} className={`border-none shadow-lg rounded-3xl overflow-hidden ${f.is_primary ? 'ring-2 ring-teal-500' : ''}`}>
                    <CardHeader className="p-6 pb-0">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                          <Building2 className="w-6 h-6 text-teal-600" />
                        </div>
                        {f.is_primary && <Badge className="bg-teal-500 text-white">Cơ sở chính</Badge>}
                      </div>
                      <CardTitle className="mt-4 text-xl font-black text-slate-800">{f.name}</CardTitle>
                      <CardDescription className="font-medium text-slate-500 mt-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {f.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase">Khám trực tiếp</span>
                          {f.supports_offline ? (
                            <span className="text-sm font-black text-slate-700">{new Intl.NumberFormat('vi-VN').format(f.fee_offline)} VNĐ</span>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Không hỗ trợ</Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase">Tư vấn Online</span>
                          {f.supports_online ? (
                            <span className="text-sm font-black text-slate-700">{new Intl.NumberFormat('vi-VN').format(f.fee_online)} VNĐ</span>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Không hỗ trợ</Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="w-full justify-center py-2 rounded-xl text-emerald-600 bg-emerald-50 border-emerald-100 font-bold">
                        Đang hoạt động
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="docs">
              <Card className="border-none shadow-lg rounded-3xl overflow-hidden max-w-2xl">
                <CardHeader className="bg-slate-50 border-b p-8">
                  <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <Award className="w-7 h-7 text-teal-600" /> Hồ sơ năng lực & Chứng chỉ
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-base">
                    Cung cấp minh chứng chuyên môn để được duyệt hồ sơ nhận lịch khám toàn hệ thống.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    {formData.certificates.map((url, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-100 group shadow-sm">
                        <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" className="text-white hover:text-teal-400" onClick={() => window.open(url)}>
                            <ExternalLink className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <label className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all flex flex-col items-center justify-center cursor-pointer group">
                      <FileText className="w-8 h-8 text-slate-400 group-hover:text-teal-500 mb-2" />
                      <span className="text-xs font-bold text-slate-500 group-hover:text-teal-600 uppercase">Tải lên tài liệu</span>
                      <input type="file" className="hidden" />
                    </label>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-500">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Quy trình duyệt hồ sơ</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        Hồ sơ sẽ được bộ phận chuyên môn của <strong>MediSched AI</strong> kiểm duyệt trong vòng 24-48h làm việc. 
                        Mọi thay đổi sau khi được duyệt sẽ cần duyệt lại.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <div className="grid lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-1 border-none shadow-lg rounded-3xl overflow-hidden">
                  <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                      <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-900">{profile?.average_rating || '5.0'}</h2>
                      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Điểm đánh giá trung bình</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(profile?.average_rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-slate-400 text-xs font-medium">Dựa trên {profile?.review_count || 0} lượt phản hồi</p>
                  </CardContent>
                </Card>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Tổng lượt khám', value: '1,248', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Tỷ lệ hoàn thành', value: '98.5%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Tỷ lệ phản hồi', value: '15 phút', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' }
                  ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-md rounded-3xl p-6 flex flex-col justify-between">
                      <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">{stat.label}</p>
                      </div>
                    </Card>
                  ))}

                  <Card className="md:col-span-3 border-none shadow-md rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-slate-800">Đánh giá chi tiết</h3>
                      <Select defaultValue="newest">
                        <SelectTrigger className="w-40 bg-slate-50 border-none rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Mới nhất</SelectItem>
                          <SelectItem value="highest">Cao nhất</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-6">
                      {profile?.reviews?.map((r) => (
                        <div key={r.id} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                          <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white">
                            {r.Patient?.avatar ? <img src={r.Patient.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><User /></div>}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-900">{r.Patient?.full_name}</h4>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} />)}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <p className="text-slate-600 text-sm mt-2 leading-relaxed italic">"{r.comment}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
