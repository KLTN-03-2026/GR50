import React from "react";
import { Route } from "react-router-dom";
import {
  Dashboard, AIHistory, SearchDoctors, Appointments, Chat, ChatList,
  UnifiedChat, Payments, PaymentProcess, DoctorDetails, MedicalRecords, AccountSettings
} from "@/modules/patient";
import VideoConsultation from "@/pages/VideoConsultation";

export default function patientRoutes(ProtectedRoute) {
  return (
    <>
      <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><Dashboard /></ProtectedRoute>} />
      <Route path="/patient/video-consultation/:id" element={<ProtectedRoute allowedRoles={['patient']}><VideoConsultation /></ProtectedRoute>} />
      <Route path="/patient/search-doctors" element={<ProtectedRoute allowedRoles={['patient']}><SearchDoctors /></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><Appointments /></ProtectedRoute>} />
      <Route path="/patient/chat" element={<ProtectedRoute allowedRoles={['patient']}><ChatList /></ProtectedRoute>} />
      <Route path="/patient/chat/:appointmentId" element={<ProtectedRoute allowedRoles={['patient']}><Chat /></ProtectedRoute>} />
      <Route path="/patient/ai-history" element={<ProtectedRoute allowedRoles={['patient']}><AIHistory /></ProtectedRoute>} />
      <Route path="/patient/conversations" element={<ProtectedRoute allowedRoles={['patient']}><UnifiedChat /></ProtectedRoute>} />
      <Route path="/patient/conversation/:id" element={<ProtectedRoute allowedRoles={['patient']}><UnifiedChat /></ProtectedRoute>} />
      <Route path="/patient/messages" element={<ProtectedRoute allowedRoles={['patient']}><UnifiedChat /></ProtectedRoute>} />
      <Route path="/patient/payments" element={<ProtectedRoute allowedRoles={['patient']}><Payments /></ProtectedRoute>} />
      <Route path="/patient/payment/:paymentId" element={<ProtectedRoute allowedRoles={['patient']}><PaymentProcess /></ProtectedRoute>} />
      <Route path="/patient/doctor/:id" element={<ProtectedRoute allowedRoles={['patient']}><DoctorDetails /></ProtectedRoute>} />
      <Route path="/patient/medical-records" element={<ProtectedRoute allowedRoles={['patient']}><MedicalRecords /></ProtectedRoute>} />
      <Route path="/patient/account-settings" element={<ProtectedRoute allowedRoles={['patient']}><AccountSettings /></ProtectedRoute>} />
    </>
  );
}
