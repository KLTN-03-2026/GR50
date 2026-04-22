import React, { useState, useEffect } from "react";
import "@/App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FloatingChatButton from '@/components/FloatingChatButton';
import PatientDashboard from "@/pages/patient/Dashboard";
import AIHistory from "@/pages/patient/AIHistory";
import SearchDoctors from "@/pages/patient/SearchDoctors";
import PatientAppointments from "@/pages/patient/Appointments";
import PatientChat from "@/pages/patient/Chat";
import PatientChatList from "@/pages/patient/ChatList";
import PatientConversations from "@/pages/patient/Conversations";
import PatientConversationChat from "@/pages/patient/ConversationChat";
import PatientUnifiedChat from "@/pages/patient/UnifiedChat";
import PatientPayments from "@/pages/patient/Payments";
import PaymentProcess from "@/pages/patient/PaymentProcess";
import PatientDoctorDetails from "@/pages/patient/DoctorDetails";
import PatientAccountSettings from "@/pages/patient/AccountSettings";
import DoctorDashboard from "@/pages/doctor/Dashboard";
import DoctorProfile from "@/pages/doctor/Profile";
import DoctorSchedule from "@/pages/doctor/Schedule";
import DoctorAppointments from "@/pages/doctor/Appointments";
import DoctorChat from "@/pages/doctor/Chat";
import DoctorChatList from "@/pages/doctor/ChatList";
import DoctorUnifiedChat from "@/pages/doctor/UnifiedChat";
import DoctorConversationChat from "@/pages/doctor/ConversationChat";
import PatientMedicalRecords from "@/pages/patient/MedicalRecords";
import DoctorMedicalRecords from "@/pages/doctor/MedicalRecords";
import DoctorAIDiagnoses from "@/pages/doctor/AIDiagnoses";
import DoctorServiceSettings from "@/pages/doctor/ServiceSettings";
import VideoConsultation from "@/pages/VideoConsultation";

// Admin Pages
// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminDoctors from "@/pages/admin/Doctors";
import AdminPatients from "@/pages/admin/Patients";
import AdminStats from "@/pages/admin/Stats";
import AdminsManagement from "@/pages/admin/Admins";
import CreateAccounts from "@/pages/admin/CreateAccounts";
import AdminPayments from "@/pages/admin/Payments";
import AdminReports from "@/pages/admin/Reports";
import SystemSettings from "@/pages/admin/SystemSettings";
import AIDiagnoses from "@/pages/admin/AIDiagnoses";
import AdminSpecialties from "@/pages/admin/Specialties";

// Staff Pages
import StaffDashboard from "@/pages/staff/StaffDashboard";
import ReceptionPatients from "@/pages/staff/ReceptionPatients";
import ReceptionAppointments from "@/pages/staff/ReceptionAppointments";
import ReceptionBookingAssist from "@/pages/staff/ReceptionBookingAssist";
import ReceptionPayments from "@/pages/staff/ReceptionPayments";
import StaffUnifiedChat from "@/pages/staff/StaffUnifiedChat";
import ReceptionTriageQueue from "@/pages/staff/ReceptionTriageQueue";
import ReceptionVideoSupport from "@/pages/staff/ReceptionVideoSupport";

import { AuthContext } from "@/contexts/AuthContext";
import { API } from "@/config";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ServiceDetail from "@/pages/services/ServiceDetail";
import SpecialtyDetail from "@/pages/specialties/SpecialtyDetail";
import FacilityDetail from "@/pages/facilities/FacilityDetail";
import Services from "@/pages/Services";
import Specialties from "@/pages/Specialties";
import Facilities from "@/pages/Facilities";
import Doctors from "@/pages/Doctors";
import DoctorDetail from "@/pages/DoctorDetail";
import ForceChangePassword from "@/pages/auth/ForceChangePassword";


function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [mustChangePassword, setMustChangePassword] = useState(localStorage.getItem("mustChangePassword") === "true");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    console.log("Fetching current user...");
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // 5 seconds timeout
      });
      console.log("User fetched successfully", response.data);
      setUser(response.data);
      if (response.data.must_change_password) {
        setMustChangePassword(true);
        localStorage.setItem("mustChangePassword", "true");
      }

    } catch (error) {
      console.error("Failed to fetch user", error);
      logout();
    } finally {
      console.log("Loading set to false");
      setLoading(false);
    }
  };

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    if (userData.must_change_password) {
      localStorage.setItem("mustChangePassword", "true");
      setMustChangePassword(true);
    } else {
      localStorage.removeItem("mustChangePassword");
      setMustChangePassword(false);
    }
    setToken(newToken);
    setUser(userData);
  };


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("mustChangePassword");
    setToken(null);
    setUser(null);
    setMustChangePassword(false);
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!token) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" />;
    if (mustChangePassword) return <Navigate to="/force-change-password" />;
    return children;
  };

  const ForceChangePasswordRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    if (!mustChangePassword) return <Navigate to="/" />;
    return children;
  };


  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthContext.Provider value={{ user, token, login, logout }}>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/force-change-password" element={<ForceChangePasswordRoute><ForceChangePassword /></ForceChangePasswordRoute>} />



              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/specialty/:id" element={<SpecialtyDetail />} />
              <Route path="/facility/:id" element={<FacilityDetail />} />

              {/* Public List Pages */}
              <Route path="/services" element={<Services />} />
              <Route path="/specialties" element={<Specialties />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:id" element={<DoctorDetail />} />

              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
              <Route path="/video/:id" element={<ProtectedRoute><VideoConsultation /></ProtectedRoute>} />
              <Route path="/patient/video-consultation/:id" element={<ProtectedRoute allowedRoles={['patient']}><VideoConsultation /></ProtectedRoute>} />
              <Route path="/patient/search-doctors" element={<ProtectedRoute allowedRoles={['patient']}><SearchDoctors /></ProtectedRoute>} />
              <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointments /></ProtectedRoute>} />
              <Route path="/patient/chat" element={<ProtectedRoute allowedRoles={['patient']}><PatientChatList /></ProtectedRoute>} />
              <Route path="/patient/chat/:appointmentId" element={<ProtectedRoute allowedRoles={['patient']}><PatientChat /></ProtectedRoute>} />
              <Route path="/patient/ai-history" element={<ProtectedRoute allowedRoles={['patient']}><AIHistory /></ProtectedRoute>} />
              <Route path="/patient/conversations" element={<ProtectedRoute allowedRoles={['patient']}><PatientUnifiedChat /></ProtectedRoute>} />
              <Route path="/patient/conversation/:id" element={<ProtectedRoute allowedRoles={['patient']}><PatientUnifiedChat /></ProtectedRoute>} />
              <Route path="/patient/messages" element={<ProtectedRoute allowedRoles={['patient']}><PatientUnifiedChat /></ProtectedRoute>} />
              <Route path="/patient/payments" element={<ProtectedRoute allowedRoles={['patient']}><PatientPayments /></ProtectedRoute>} />
              <Route path="/patient/payment/:paymentId" element={<ProtectedRoute allowedRoles={['patient']}><PaymentProcess /></ProtectedRoute>} />
              <Route path="/patient/doctor/:id" element={<ProtectedRoute allowedRoles={['patient']}><PatientDoctorDetails /></ProtectedRoute>} />
              <Route path="/patient/medical-records" element={<ProtectedRoute allowedRoles={['patient']}><PatientMedicalRecords /></ProtectedRoute>} />
              <Route path="/patient/account-settings" element={<ProtectedRoute allowedRoles={['patient']}><PatientAccountSettings /></ProtectedRoute>} />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />


              <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
              <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorSchedule /></ProtectedRoute>} />
              <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
              <Route path="/doctor/chat" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorChatList /></ProtectedRoute>} />
              <Route path="/doctor/chat/:appointmentId" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorChat /></ProtectedRoute>} />
              <Route path="/doctor/conversations" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorUnifiedChat /></ProtectedRoute>} />
              <Route path="/doctor/conversation/:id" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorUnifiedChat /></ProtectedRoute>} />
              <Route path="/doctor/video-consultation/:id" element={<ProtectedRoute allowedRoles={['doctor']}><VideoConsultation /></ProtectedRoute>} />
              <Route path="/doctor/medical-records" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorMedicalRecords /></ProtectedRoute>} />
              <Route path="/doctor/ai-diagnoses" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAIDiagnoses /></ProtectedRoute>} />
              <Route path="/doctor/service-settings" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorServiceSettings /></ProtectedRoute>} />


              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />


              <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AdminDoctors /></ProtectedRoute>} />
              <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><AdminPatients /></ProtectedRoute>} />
              <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={['admin']}><AdminStats /></ProtectedRoute>} />
              <Route path="/admin/admins" element={<ProtectedRoute allowedRoles={['admin']}><AdminsManagement /></ProtectedRoute>} />
              <Route path="/admin/create-accounts" element={<ProtectedRoute allowedRoles={['admin']}><CreateAccounts /></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
              <Route path="/admin/system-settings" element={<ProtectedRoute allowedRoles={['admin']}><SystemSettings /></ProtectedRoute>} />
              <Route path="/admin/ai-diagnoses" element={<ProtectedRoute allowedRoles={['admin']}><AIDiagnoses /></ProtectedRoute>} />
              <Route path="/admin/specialties" element={<ProtectedRoute allowedRoles={['admin']}><AdminSpecialties /></ProtectedRoute>} />


              {/* Staff Routes */}
              <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
              <Route path="/staff/patients" element={<ProtectedRoute allowedRoles={['staff']}><ReceptionPatients /></ProtectedRoute>} />
              <Route path="/staff/appointments" element={<ProtectedRoute allowedRoles={['staff']}><ReceptionAppointments /></ProtectedRoute>} />
              <Route path="/staff/booking-assist" element={<ProtectedRoute allowedRoles={['staff']}><ReceptionBookingAssist /></ProtectedRoute>} />
              <Route path="/staff/payments" element={<ProtectedRoute allowedRoles={['staff']}><ReceptionPayments /></ProtectedRoute>} />
              <Route path="/staff/messages" element={<ProtectedRoute allowedRoles={['staff']}><StaffUnifiedChat /></ProtectedRoute>} />
              <Route path="/staff/conversation/:id" element={<ProtectedRoute allowedRoles={['staff']}><StaffUnifiedChat /></ProtectedRoute>} />
              <Route path="/staff/triage-queue" element={<ProtectedRoute allowedRoles={['staff']}><ReceptionTriageQueue /></ProtectedRoute>} />
              <Route path="/staff/video-support" element={<ProtectedRoute allowedRoles={['staff']}><ReceptionVideoSupport /></ProtectedRoute>} />
              <Route path="/staff/video-support/:id" element={<ProtectedRoute allowedRoles={['staff']}><VideoConsultation /></ProtectedRoute>} />
              <Route path="/staff/video-consultation/:id" element={<ProtectedRoute allowedRoles={['staff']}><VideoConsultation /></ProtectedRoute>} />
            </Routes>
            <FloatingChatButton />
            <Toaster position="top-right" />
          </div>
        </AuthContext.Provider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
