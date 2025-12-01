import React, { useState, useEffect } from "react";
import "@/App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FloatingChatButton from "@/components/FloatingChatButton";
import PatientDashboard from "@/pages/patient/Dashboard";
import AIConsultation from "@/pages/patient/AIConsultation";
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

// Department Head Pages
import DepartmentHeadDashboard from "@/pages/department-head/Dashboard";
import DepartmentHeadCreateAccounts from "@/pages/department-head/CreateAccounts";
import DepartmentHeadDoctors from "@/pages/department-head/Doctors";
import DepartmentHeadPatients from "@/pages/department-head/Patients";
import DepartmentHeadUnifiedChat from "@/pages/department-head/UnifiedChat";
import DepartmentHeadConversationChat from "@/pages/department-head/ConversationChat";

import { AuthContext } from "@/contexts/AuthContext";
import { API } from "@/config";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ServiceDetail from "@/pages/services/ServiceDetail";
import SpecialtyDetail from "@/pages/specialties/SpecialtyDetail";
import FacilityDetail from "@/pages/facilities/FacilityDetail";
import Services from "@/pages/Services";
import Specialties from "@/pages/Specialties";
import Facilities from "@/pages/Facilities";
import Doctors from "@/pages/Doctors";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
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
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

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

              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/specialty/:id" element={<SpecialtyDetail />} />
              <Route path="/facility/:id" element={<FacilityDetail />} />

              {/* Public List Pages */}
              <Route path="/services" element={<Services />} />
              <Route path="/specialties" element={<Specialties />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/doctors" element={<Doctors />} />

              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={user?.role === "patient" ? <PatientDashboard /> : <Navigate to="/login" />} />
              <Route path="/patient/search-doctors" element={user?.role === "patient" ? <SearchDoctors /> : <Navigate to="/login" />} />
              <Route path="/patient/appointments" element={user?.role === "patient" ? <PatientAppointments /> : <Navigate to="/login" />} />
              <Route path="/patient/chat" element={user?.role === "patient" ? <PatientChatList /> : <Navigate to="/login" />} />
              <Route path="/patient/chat/:appointmentId" element={user?.role === "patient" ? <PatientChat /> : <Navigate to="/login" />} />
              <Route path="/patient/ai-consultation" element={user?.role === "patient" ? <AIConsultation /> : <Navigate to="/login" />} />
              <Route path="/patient/ai-history" element={user?.role === "patient" ? <AIHistory /> : <Navigate to="/login" />} />
              <Route path="/patient/conversations" element={user?.role === "patient" ? <PatientConversations /> : <Navigate to="/login" />} />
              <Route path="/patient/conversation/:conversationId" element={user?.role === "patient" ? <PatientConversationChat /> : <Navigate to="/login" />} />
              <Route path="/patient/messages" element={user?.role === "patient" ? <PatientUnifiedChat /> : <Navigate to="/login" />} />
              <Route path="/patient/payments" element={user?.role === "patient" ? <PatientPayments /> : <Navigate to="/login" />} />
              <Route path="/patient/payment/:paymentId" element={user?.role === "patient" ? <PaymentProcess /> : <Navigate to="/login" />} />
              <Route path="/patient/doctor/:id" element={user?.role === "patient" ? <PatientDoctorDetails /> : <Navigate to="/login" />} />
              <Route path="/patient/medical-records" element={user?.role === "patient" ? <PatientMedicalRecords /> : <Navigate to="/login" />} />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={user?.role === "doctor" ? <DoctorDashboard /> : <Navigate to="/login" />} />
              <Route path="/doctor/profile" element={user?.role === "doctor" ? <DoctorProfile /> : <Navigate to="/login" />} />
              <Route path="/doctor/schedule" element={user?.role === "doctor" ? <DoctorSchedule /> : <Navigate to="/login" />} />
              <Route path="/doctor/appointments" element={user?.role === "doctor" ? <DoctorAppointments /> : <Navigate to="/login" />} />
              <Route path="/doctor/chat" element={user?.role === "doctor" ? <DoctorChatList /> : <Navigate to="/login" />} />
              <Route path="/doctor/chat/:appointmentId" element={user?.role === "doctor" ? <DoctorChat /> : <Navigate to="/login" />} />
              <Route path="/doctor/conversations" element={user?.role === "doctor" ? <DoctorUnifiedChat /> : <Navigate to="/login" />} />
              <Route path="/doctor/conversation/:conversationId" element={user?.role === "doctor" ? <DoctorConversationChat /> : <Navigate to="/login" />} />
              <Route path="/doctor/medical-records" element={user?.role === "doctor" ? <DoctorMedicalRecords /> : <Navigate to="/login" />} />
              <Route path="/doctor/ai-diagnoses" element={user?.role === "doctor" ? <DoctorAIDiagnoses /> : <Navigate to="/login" />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} />
              <Route path="/admin/doctors" element={user?.role === "admin" ? <AdminDoctors /> : <Navigate to="/login" />} />
              <Route path="/admin/patients" element={user?.role === "admin" ? <AdminPatients /> : <Navigate to="/login" />} />
              <Route path="/admin/stats" element={user?.role === "admin" ? <AdminStats /> : <Navigate to="/login" />} />
              <Route path="/admin/admins" element={user?.role === "admin" ? <AdminsManagement /> : <Navigate to="/login" />} />
              <Route path="/admin/create-accounts" element={user?.role === "admin" ? <CreateAccounts /> : <Navigate to="/login" />} />
              <Route path="/admin/payments" element={user?.role === "admin" ? <AdminPayments /> : <Navigate to="/login" />} />
              <Route path="/admin/reports" element={user?.role === "admin" ? <AdminReports /> : <Navigate to="/login" />} />
              <Route path="/admin/settings" element={user?.role === "admin" ? <SystemSettings /> : <Navigate to="/login" />} />
              <Route path="/admin/ai-diagnoses" element={user?.role === "admin" ? <AIDiagnoses /> : <Navigate to="/login" />} />

              {/* Department Head Routes */}
              <Route path="/department-head/dashboard" element={user?.role === "department_head" ? <DepartmentHeadDashboard /> : <Navigate to="/login" />} />
              <Route path="/department-head/create-accounts" element={user?.role === "department_head" ? <DepartmentHeadCreateAccounts /> : <Navigate to="/login" />} />
              <Route path="/department-head/doctors" element={user?.role === "department_head" ? <DepartmentHeadDoctors /> : <Navigate to="/login" />} />
              <Route path="/department-head/patients" element={user?.role === "department_head" ? <DepartmentHeadPatients /> : <Navigate to="/login" />} />
              <Route path="/department-head/conversations" element={user?.role === "department_head" ? <DepartmentHeadUnifiedChat /> : <Navigate to="/login" />} />
              <Route path="/department-head/conversation/:conversationId" element={user?.role === "department_head" ? <DepartmentHeadConversationChat /> : <Navigate to="/login" />} />
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
