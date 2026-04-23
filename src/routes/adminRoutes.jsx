import React from "react";
import { Route } from "react-router-dom";
import {
  Dashboard, Doctors, Patients, Stats, Admins,
  CreateAccounts, Payments, Reports, SystemSettings, AIDiagnoses, Specialties
} from "@/modules/admin";

export default function adminRoutes(ProtectedRoute) {
  return (
    <>
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><Doctors /></ProtectedRoute>} />
      <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><Patients /></ProtectedRoute>} />
      <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={['admin']}><Stats /></ProtectedRoute>} />
      <Route path="/admin/admins" element={<ProtectedRoute allowedRoles={['admin']}><Admins /></ProtectedRoute>} />
      <Route path="/admin/create-accounts" element={<ProtectedRoute allowedRoles={['admin']}><CreateAccounts /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><Payments /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/admin/system-settings" element={<ProtectedRoute allowedRoles={['admin']}><SystemSettings /></ProtectedRoute>} />
      <Route path="/admin/ai-diagnoses" element={<ProtectedRoute allowedRoles={['admin']}><AIDiagnoses /></ProtectedRoute>} />
      <Route path="/admin/specialties" element={<ProtectedRoute allowedRoles={['admin']}><Specialties /></ProtectedRoute>} />
    </>
  );
}
