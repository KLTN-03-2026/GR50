import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import { API } from "@/config";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, MapPin, Star, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import BookingDialog from "@/components/BookingDialog";

export default function SearchDoctors() {
  const { token } = useContext(AuthContext);
  const location = useLocation(); // Add useLocation
  const [specialties, setSpecialties] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedFacility, setSelectedFacility] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiDiagnosis, setAiDiagnosis] = useState(null); // State for AI diagnosis

  useEffect(() => {
    fetchData();
    if (location.state?.aiDiagnosis) {
      setAiDiagnosis(location.state.aiDiagnosis);
      toast.info("Đã nhận kết quả phân tích từ AI. Hãy chọn bác sĩ để đặt lịch.");
    }
  }, [location.state]);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchQuery, selectedSpecialty, selectedFacility]);

  // ... (rest of fetchData and filterDoctors)

  const fetchData = async () => {
    try {
      const [specialtiesRes, doctorsRes, facilitiesRes] = await Promise.all([
        axios.get(`${API}/specialties`),
        axios.get(`${API}/doctors`),
        axios.get(`${API}/clinics`),
      ]);
      setSpecialties(specialtiesRes.data);
      setFacilities(facilitiesRes.data);
      setDoctors(doctorsRes.data);
      setFilteredDoctors(doctorsRes.data);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((d) => d.specialty_id === selectedSpecialty);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.specialty_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFacility !== "all") {
      filtered = filtered.filter((d) => 
        d.facilities && d.facilities.some(f => f.id.toString() === selectedFacility.toString())
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Tìm kiếm bác sĩ
          </h1>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Tìm kiếm</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    data-testid="search-input"
                    placeholder="Tìm theo tên bác sĩ hoặc chuyên khoa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Chuyên khoa</Label>
                <Select
                  value={selectedSpecialty}
                  onValueChange={setSelectedSpecialty}
                >
                  <SelectTrigger
                    data-testid="specialty-filter"
                    className="mt-2"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                    {specialties.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Cơ sở y tế</Label>
                <Select
                  value={selectedFacility}
                  onValueChange={setSelectedFacility}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả cơ sở y tế</SelectItem>
                    {facilities.map((f) => (
                      <SelectItem key={f.Id_PhongKham} value={f.Id_PhongKham.toString()}>
                        {f.TenPhongKham}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Đang tải...
            </p>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Không tìm thấy bác sĩ phù hợp
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.user_id}
                  doctor={doctor}
                  onBook={handleBookAppointment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      {showBooking && selectedDoctor && (
        <BookingDialog
          doctor={selectedDoctor}
          open={showBooking}
          onClose={() => {
            setShowBooking(false);
            setSelectedDoctor(null);
          }}
          token={token}
          aiDiagnosis={aiDiagnosis} // Pass AI diagnosis
        />
      )}
    </Layout>
  );
}

function DoctorCard({ doctor, onBook }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
          {doctor.full_name?.charAt(0) || "D"}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {doctor.full_name || "Bác sĩ"}
          </h3>
          <p className="text-teal-600 text-sm">
            {doctor.specialty_name || "Chuyên khoa"}
          </p>
        </div>
      </div>

      {doctor.bio && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {doctor.bio}
        </p>
      )}

      <div className="space-y-2 mb-4">
        {doctor.experience_years > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <Star className="w-4 h-4 inline mr-2 text-yellow-500" />
            {doctor.experience_years} năm kinh nghiệm
          </p>
        )}
        {doctor.consultation_fee > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-teal-600">Phí tư vấn: </span> 
            {doctor.consultation_fee.toLocaleString()} VNĐ
          </p>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
           {doctor.facilities && doctor.facilities.length > 0 ? (
             <div className="flex items-start gap-2 text-sm">
               <MapPin className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
               <div>
                 {doctor.facilities.length === 1 ? (
                   <>
                     <p className="text-gray-700 dark:text-gray-300">
                       <span className="font-medium">Cơ sở: </span>
                       {doctor.facilities[0].name}
                     </p>
                     <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                       {doctor.facilities[0].address}
                     </p>
                   </>
                 ) : (
                   <>
                     <p className="text-gray-700 dark:text-gray-300 font-medium">Khám tại {doctor.facilities.length} cơ sở</p>
                     <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
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
      </div>


      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(`/patient/doctor/${doctor.id}`)}
          className="w-full"
        >
          Xem chi tiết
        </Button>
        <Button
          data-testid={`book-doctor-${doctor.user_id}`}
          onClick={() => {
            if (!doctor.facilities || doctor.facilities.length === 0) {
              toast.warning('Bác sĩ chưa có cơ sở y tế');
              return;
            }
            onBook(doctor);
          }}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
        >
          {doctor.facilities?.length > 1 ? 'Chọn cơ sở' : 'Đặt lịch'}
        </Button>
      </div>
    </div>
  );
}


