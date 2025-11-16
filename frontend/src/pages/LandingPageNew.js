import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/App';
import { 
  Calendar, Users, MessageSquare, Shield, Search, 
  Stethoscope, Video, FileText, TestTube, Brain, Heart,
  Baby, Eye, Pill, Activity, ChevronRight, Star, MapPin,
  Phone, Mail, Facebook, Twitter, Youtube, Instagram
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

// Mock data cho các chuyên khoa (10 chuyên khoa)
const specialties = [
  { 
    id: 1, 
    name: 'Cơ Xương Khớp', 
    name_en: 'Orthopedics',
    image: 'https://images.unsplash.com/photo-1560306990-18fa759c8713',
    description: 'Khám và điều trị các bệnh về xương, khớp, cột sống'
  },
  { 
    id: 2, 
    name: 'Tim mạch', 
    name_en: 'Cardiology',
    image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435',
    description: 'Chẩn đoán và điều trị các bệnh về tim mạch'
  },
  { 
    id: 3, 
    name: 'Thần kinh', 
    name_en: 'Neurology',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc',
    description: 'Điều trị các bệnh lý thần kinh, đau đầu, đột quỵ'
  },
  { 
    id: 4, 
    name: 'Nhi khoa', 
    name_en: 'Pediatrics',
    image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b',
    description: 'Chăm sóc sức khỏe toàn diện cho trẻ em'
  },
  { 
    id: 5, 
    name: 'Da liễu', 
    name_en: 'Dermatology',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d',
    description: 'Điều trị các bệnh về da, mụn, dị ứng da'
  },
  { 
    id: 6, 
    name: 'Nha khoa', 
    name_en: 'Dentistry',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95',
    description: 'Khám và điều trị các bệnh về răng miệng'
  },
  { 
    id: 7, 
    name: 'Sản Phụ khoa', 
    name_en: 'Gynecology',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309',
    description: 'Chăm sóc sức khỏe phụ nữ và thai sản'
  },
  { 
    id: 8, 
    name: 'Tiêu hóa', 
    name_en: 'Gastroenterology',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67',
    description: 'Điều trị các bệnh về dạ dày, ruột, gan'
  },
  { 
    id: 9, 
    name: 'Tai Mũi Họng', 
    name_en: 'ENT',
    image: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab',
    description: 'Khám và điều trị bệnh tai mũi họng'
  },
  { 
    id: 10, 
    name: 'Nội khoa tổng quát', 
    name_en: 'General Medicine',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133',
    description: 'Khám và điều trị các bệnh nội khoa'
  },
];

// Mock data bác sĩ nổi bật
const featuredDoctors = [
  {
    id: 1,
    name: 'Bác sĩ Chuyên khoa II Nguyễn Văn A',
    specialty: 'Tim mạch',
    image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31',
    experience: '15 năm',
    fee: '300.000đ'
  },
  {
    id: 2,
    name: 'Tiến sĩ, Bác sĩ Trần Thị B',
    specialty: 'Nhi khoa',
    image: 'https://images.pexels.com/photos/6075005/pexels-photo-6075005.jpeg',
    experience: '12 năm',
    fee: '250.000đ'
  },
  {
    id: 3,
    name: 'Phó Giáo sư Lê Văn C',
    specialty: 'Thần kinh',
    image: 'https://images.pexels.com/photos/6075001/pexels-photo-6075001.jpeg',
    experience: '20 năm',
    fee: '350.000đ'
  },
];

// Mock data cơ sở y tế
const facilities = [
  {
    id: 1,
    name: 'Bệnh viện Đa khoa Quốc tế',
    image: 'https://images.unsplash.com/photo-1533042789716-e9a9c97cf4ee',
    address: 'Hà Nội',
  },
  {
    id: 2,
    name: 'Phòng khám Đa khoa Gia đình',
    image: 'https://images.unsplash.com/photo-1597807037496-c56a1d8bc29a',
    address: 'TP.HCM',
  },
  {
    id: 3,
    name: 'Trung tâm Y tế chuyên sâu',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc',
    address: 'Hà Nội',
  },
];

// Dịch vụ toàn diện
const comprehensiveServices = [
  { icon: Stethoscope, name: 'Khám Chuyên khoa', color: 'from-blue-500 to-cyan-500' },
  { icon: Video, name: 'Khám từ xa', color: 'from-green-500 to-emerald-500' },
  { icon: FileText, name: 'Khám tổng quát', color: 'from-purple-500 to-pink-500' },
  { icon: TestTube, name: 'Xét nghiệm y học', color: 'from-orange-500 to-red-500' },
  { icon: Brain, name: 'Sức khỏe tinh thần', color: 'from-indigo-500 to-blue-500' },
  { icon: Activity, name: 'Khám nha khoa', color: 'from-teal-500 to-green-500' },
  { icon: Heart, name: 'Gói Phẫu thuật', color: 'from-red-500 to-pink-500' },
  { icon: Pill, name: 'Sống khỏe Tiểu đường', color: 'from-yellow-500 to-orange-500' },
];

export default function LandingPageNew() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (user) {
      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'department_head') navigate('/department-head/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">
                BookingCare
              </span>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#dich-vu" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition">Dịch vụ</a>
              <a href="#chuyen-khoa" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition">Chuyên khoa</a>
              <a href="#bac-si" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition">Bác sĩ</a>
              <a href="#co-so" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition">Cơ sở y tế</a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageToggle />
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
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-cyan-50 via-cyan-100 to-cyan-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Services Section */}
      <section id="dich-vu" className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dịch vụ toàn diện</h2>
            <button className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
              Xem thêm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comprehensiveServices.map((service, index) => (
              <div
                key={index}
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
      </section>

      {/* Specialties Section */}
      <section id="chuyen-khoa" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Chuyên khoa</h2>
            <button className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
              Xem thêm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {specialties.map((specialty) => (
              <div
                key={specialty.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={specialty.image}
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
      </section>

      {/* Featured Doctors Section */}
      <section id="bac-si" className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bác sĩ nổi bật</h2>
            <button className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
              Xem thêm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{doctor.name}</h3>
                  <p className="text-cyan-600 font-medium mb-3">{doctor.specialty}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {doctor.experience}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{doctor.fee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Facilities Section */}
      <section id="co-so" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cơ sở y tế uy tín</h2>
            <button className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1">
              Xem thêm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={facility.image}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{facility.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {facility.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telemedicine Section */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white space-y-6">
            <h2 className="text-4xl font-bold">Khám bệnh từ xa</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Kết nối với bác sĩ chuyên khoa qua video call, tiện lợi và hiệu quả
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-teal-600 hover:bg-gray-100 text-lg px-8"
              >
                Đặt lịch ngay
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
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
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-lg px-12"
          >
            Đăng ký miễn phí
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">BookingCare</span>
              </div>
              <p className="text-gray-400 text-sm">
                Nền tảng đặt lịch khám bệnh hàng đầu Việt Nam
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Dịch vụ</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-yellow-400">Khám chuyên khoa</a></li>
                <li><a href="#" className="hover:text-yellow-400">Khám từ xa</a></li>
                <li><a href="#" className="hover:text-yellow-400">Xét nghiệm</a></li>
                <li><a href="#" className="hover:text-yellow-400">Gói phẫu thuật</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-yellow-400">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-yellow-400">Hướng dẫn đặt lịch</a></li>
                <li><a href="#" className="hover:text-yellow-400">Chính sách</a></li>
                <li><a href="#" className="hover:text-yellow-400">Điều khoản</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>1900-xxxx</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>support@bookingcare.vn</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Hà Nội, Việt Nam</span>
                </li>
              </ul>
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-yellow-500 flex items-center justify-center transition">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-yellow-500 flex items-center justify-center transition">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-yellow-500 flex items-center justify-center transition">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-yellow-500 flex items-center justify-center transition">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 BookingCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
