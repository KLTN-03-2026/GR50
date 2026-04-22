import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import axios from 'axios';
import { toast } from 'sonner';
import { specialtyImageMap } from '@/utils/specialtyImages';
import {
  Calendar, Users, MessageSquare, Shield, Search,
  Stethoscope, Video, FileText, TestTube, Brain, Heart,
  Baby, Eye, Pill, Activity, ChevronRight, Star, MapPin,
  Phone, Mail, Facebook, Twitter, Youtube, Instagram,
  LogOut, User as UserIcon, Camera, Upload, LayoutDashboard,
  Syringe, Hand
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Mock data cho các chuyên khoa (10 chuyên khoa)
// Mock data removed in favor of API
// const specialties = [...];

// Mock data bác sĩ nổi bật
// Mock data bác sĩ nổi bật (Removed in favor of real data)
// const featuredDoctors = [...];

// Mock data cơ sở y tế
// Mock data cơ sở y tế


// Dịch vụ toàn diện
const comprehensiveServices = [
  { icon: Stethoscope, name: 'Khám Chuyên khoa', color: 'from-blue-500 to-cyan-500', slug: 'specialist-examination' },
  { icon: Video, name: 'Khám từ xa', color: 'from-green-500 to-emerald-500', slug: 'remote-examination' },
  { icon: FileText, name: 'Khám tổng quát', color: 'from-purple-500 to-pink-500', slug: 'general-examination' },
  { icon: TestTube, name: 'Xét nghiệm y học', color: 'from-orange-500 to-red-500', slug: 'medical-testing' },
  { icon: Brain, name: 'Sức khỏe tinh thần', color: 'from-indigo-500 to-blue-500', slug: 'mental-health' },
  { icon: Activity, name: 'Khám nha khoa', color: 'from-teal-500 to-green-500', slug: 'dental' },
  { icon: Heart, name: 'Gói Phẫu thuật', color: 'from-red-500 to-pink-500', slug: 'surgery' },
  { icon: Pill, name: 'Sống khỏe Tiểu đường', color: 'from-yellow-500 to-orange-500', slug: 'diabetes-care' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout, login } = useContext(AuthContext);
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [systemSettings, setSystemSettings] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    fetchSystemSettings();
    fetchDoctors();
    fetchSpecialties();
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'doctor') navigate('/doctor/dashboard', { replace: true });
      else if (user.role === 'staff') navigate('/staff/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const fetchSpecialties = async () => {
    try {
      const res = await axios.get(`${API}/specialties`);
      setSpecialties(res.data.slice(0, 10)); // Limit to 10 like mock data
    } catch (error) {
      console.error("Failed to fetch specialties", error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await axios.get(`${API}/clinics`);
      setFacilities(res.data.slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch facilities", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API}/doctors`);
      setDoctors(res.data.slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await axios.get(`${API}/system/public`);
      setSystemSettings(res.data);
    } catch (error) {
      console.error("Failed to fetch system settings", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  const handleDashboard = () => {
    if (!user) return;
    if (user.role === 'patient') navigate('/patient/dashboard');
    else if (user.role === 'doctor') navigate('/doctor/dashboard');
    else if (user.role === 'admin') navigate('/admin/dashboard');
    else if (user.role === 'staff') navigate('/staff/dashboard');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/profile/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      login(token, response.data.user);
      toast.success('Cập nhật ảnh đại diện thành công');
      setShowAvatarDialog(false);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi cập nhật ảnh');
    } finally {
      setUploading(false);
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${API.replace('/api', '')}${avatarPath}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="MediSched AI Logo" className="h-14 w-auto object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent animate-pulse">
                MediSched AI
              </span>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#dich-vu" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition font-bold">Dịch vụ</a>
              <a href="#chuyen-khoa" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition font-bold">Chuyên khoa</a>
              <a href="#bac-si" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition font-bold">Bác sĩ</a>
              <a href="#co-so" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition font-bold">Cơ sở y tế</a>
              <button
                onClick={() => {
                  if (!user) {
                    toast.info("Vui lòng đăng nhập để sử dụng Tư vấn AI");
                    navigate('/login');
                  } else {
                    window.dispatchEvent(new Event('toggle-floating-chat'));
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100 font-bold transition-colors dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50"
              >
                <Brain className="w-4 h-4" />
                <span>Tư vấn AI</span>
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageToggle />

              {user ? (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDashboard}
                    className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-400 font-bold hidden md:flex"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Trang cá nhân
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.full_name} />
                          <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.full_name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowAvatarDialog(true)}>
                        <Camera className="mr-2 h-4 w-4" />
                        <span>Đổi ảnh đại diện</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-400"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white"
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-cyan-50 via-cyan-100 to-cyan-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 py-16 relative overflow-hidden">
        {/* Decorative Icons */}
        <div className="absolute top-10 left-10 md:left-20 animate-bounce duration-[3000ms] hidden md:block opacity-90">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl transform -rotate-12 border border-cyan-100 dark:border-gray-700">
            <div className="relative w-24 h-24">
              <img
                src="/doctor-waving.png"
                alt="Doctor Waving"
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 mt-2 text-center">Bác sĩ sẵn sàng</p>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 md:right-20 animate-bounce duration-[4000ms] hidden md:block opacity-80">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl transform rotate-12 border border-red-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Syringe className="w-10 h-10 text-red-500" />
              <div className="w-3 h-3 bg-red-400 rounded-full animate-ping" />
            </div>
            <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-2 text-center">Tiêm chủng an toàn</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Nền tảng đặt lịch khám bệnh
              <span className="block mt-2 bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">
                Chăm sóc sức khỏe toàn diện
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Kết nối người dùng với dịch vụ y tế chất lượng, hiệu quả và tin cậy
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm bệnh viện, phòng khám, bác sĩ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 rounded-full border-2 border-cyan-300 focus:border-cyan-500 focus:outline-none text-lg dark:bg-gray-700 dark:text-white dark:border-cyan-600"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full hover:from-cyan-500 hover:to-cyan-700 transition">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="mt-8 flex justify-center animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
                <Button
                  onClick={() => {
                    if (!user) {
                      toast.info("Vui lòng đăng nhập để sử dụng Tư vấn AI");
                      navigate('/login');
                    } else {
                      window.dispatchEvent(new Event('toggle-floating-chat'));
                    }
                  }}
                  className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl hover:shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300 text-lg px-8 py-6 h-auto rounded-full group border-0"
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 skew-x-12 -translate-x-full"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <Brain className="w-6 h-6 animate-pulse" />
                    <span className="font-bold">Tư vấn sức khỏe AI miễn phí</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Comprehensive Services Section */}
      < section id="dich-vu" className="py-16 bg-gray-50 dark:bg-gray-800/50" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dịch vụ toàn diện</h2>
            <button
              onClick={() => navigate('/services')}
              className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
            >
              Xem thêm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comprehensiveServices.map((service, index) => (
              <div
                key={index}
                onClick={() => navigate(`/services/${service.slug}`)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Specialties Section */}
      < section id="chuyen-khoa" className="py-16" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Chuyên khoa</h2>
            <button
              onClick={() => navigate('/specialties')}
              className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
            >
              Xem thêm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {specialties.map((specialty) => (
              <div
                key={specialty.id}
                onClick={() => navigate(`/specialty/${specialty.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={specialty.image || specialtyImageMap[specialty.name] || 'https://via.placeholder.com/300'}
                    alt={specialty.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg">{specialty.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {specialty.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Featured Doctors Section */}
      < section id="bac-si" className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bác sĩ nổi bật</h2>
            <button
              onClick={() => navigate('/doctors')}
              className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
            >
              Xem thêm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => navigate(`/doctors/${doctor.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={getAvatarUrl(doctor.avatar) || 'https://via.placeholder.com/300'}
                    alt={doctor.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{doctor.full_name}</h3>
                  <p className="text-cyan-600 font-medium mb-3">{doctor.specialty_name || 'Bác sĩ chuyên khoa'}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {doctor.experience_years} năm
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      <span className="font-semibold text-cyan-600">Phí: </span>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctor.consultation_fee)}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                     {doctor.facilities && doctor.facilities.length > 0 ? (
                       <div className="flex items-start gap-2 text-sm">
                         <MapPin className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                         <div>
                           {doctor.facilities.length === 1 ? (
                             <>
                               <p className="text-gray-700 dark:text-gray-300">
                                 <span className="font-medium">Cơ sở: </span>
                                 {doctor.facilities[0].name}
                               </p>
                               <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate max-w-[200px]">
                                 {doctor.facilities[0].address}
                               </p>
                             </>
                           ) : (
                             <>
                               <p className="text-gray-700 dark:text-gray-300 font-medium">Khám tại {doctor.facilities.length} cơ sở</p>
                               <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate max-w-[200px]">
                                 Chính: {doctor.facilities.find(f => f.is_primary)?.name || doctor.facilities[0].name}
                               </p>
                             </>
                           )}
                         </div>
                       </div>
                     ) : (
                       <p className="text-sm text-gray-500 italic">Chưa có thông tin cơ sở</p>
                     )}
                  </div>

                  <div className="mt-4 flex gap-2">
                     <Button 
                        variant="outline" 
                        className="w-full text-xs"
                        onClick={(e) => { e.stopPropagation(); navigate(`/doctors/${doctor.id}`); }}
                     >
                       Xem chi tiết
                     </Button>
                     <Button 
                        className="w-full text-xs bg-cyan-600 hover:bg-cyan-700"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (!user) {
                            toast.info("Vui lòng đăng nhập để đặt lịch");
                            navigate('/login');
                            return;
                          }
                          navigate(`/patient/doctor/${doctor.id}`);
                        }}
                     >
                       {doctor.facilities?.length > 1 ? 'Chọn cơ sở' : 'Đặt lịch'}
                     </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Medical Facilities Section */}
      < section id="co-so" className="py-16" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cơ sở y tế uy tín</h2>
            <button
              onClick={() => navigate('/facilities')}
              className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
            >
              Xem thêm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                onClick={() => facility.GoogleMapUrl ? window.open(facility.GoogleMapUrl, '_blank') : null}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={facility.UrlBanner || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d'}
                    alt={facility.TenPhongKham}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{facility.TenPhongKham}</h3>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {facility.DiaChi}
                  </p>
                  {facility.GoogleMapUrl && (
                    <p className="text-sm text-cyan-600 mt-2 font-medium">Bấm để xem trên Google Maps</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Telemedicine Section */}
      < section className="py-16 bg-gradient-to-r from-teal-500 to-cyan-500" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white space-y-6">
            <h2 className="text-4xl font-bold">Khám bệnh từ xa</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Kết nối với bác sĩ chuyên khoa qua video call, tiện lợi và hiệu quả
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Button
                size="lg"
                onClick={() => {
                  if (!user) {
                    toast.info("Vui lòng đăng nhập để đặt lịch khám");
                    navigate('/login?redirect=/doctors');
                  } else {
                    navigate('/patient/dashboard');
                  }
                }}
                className="bg-white text-teal-600 hover:bg-gray-100 text-lg px-8"
              >
                Đặt lịch ngay
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/services')}
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </section >

      {/* Call to Action Section */}
      < section className="py-20 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-gray-800 dark:to-gray-700" >
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Sẵn sàng chăm sóc sức khỏe của bạn?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Đăng ký ngay hôm nay để trải nghiệm dịch vụ y tế chất lượng
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white text-lg px-12"
          >
            Đăng ký miễn phí
          </Button>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-gray-900 text-white py-12" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">MediSched AI_GR50</span>
              </div>
              <p className="text-gray-400 text-sm">
                Đồ án Tốt nghiệp Đại học
                <br></br>
                Đội ngũ phát triển MediSched AI _Nhóm 50_KLTN_ĐẠI HỌC DUY TÂN _2026
                <br></br>
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Dịch vụ</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400">Khám chuyên khoa</a></li>
                <li><a href="#" className="hover:text-cyan-400">Khám từ xa</a></li>
                <li><a href="#" className="hover:text-cyan-400">Xét nghiệm</a></li>
                <li><a href="#" className="hover:text-cyan-400">Gói phẫu thuật</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-cyan-400">Hướng dẫn đặt lịch</a></li>
                <li><a href="#" className="hover:text-cyan-400">Chính sách</a></li>
                <li><a href="#" className="hover:text-cyan-400">Điều khoản</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{systemSettings.hospital_phone || '0905-xxx-xxx'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{systemSettings.hospital_email || 'azy@gmail.com'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{systemSettings.hospital_address || 'Đà Nẵng, Việt Nam'}</span>
                </li>
              </ul>
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-cyan-500 flex items-center justify-center transition">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-cyan-500 flex items-center justify-center transition">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-cyan-500 flex items-center justify-center transition">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-cyan-500 flex items-center justify-center transition">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 MediSched AI. All rights reserved.</p>
          </div>
        </div>
      </footer >

      {/* Avatar Upload Dialog */}
      < Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog} >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi ảnh đại diện</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <Avatar className="h-32 w-32 border-4 border-gray-100">
              <AvatarImage src={getAvatarUrl(user?.avatar)} />
              <AvatarFallback className="text-4xl">{user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="avatar">Chọn ảnh mới</Label>
              <Input
                ref={fileInputRef}
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-muted-foreground animate-pulse">Đang tải lên...</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog >
    </div >
  );
}
