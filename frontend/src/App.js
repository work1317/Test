import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './LoginPage/LoginPage';
import LaoutPage from './dashboard/components/LaoutPage';
import DashBoardPage from './dashboard/DashboardPage';
import DoctorsPage from './doctors/DoctorsPage';
import PatientManagement from './patients/components/PatientManagement';
import RecordLab from './records/components/RecordLab';
import Notifications from './Notifications/components/Notifications';
import ForgotPasswordPage from './LoginPage/ForgotPasswordPage';
import AppointmentPage from './Appointment/componnets/Appointment'
import LabsPage from './Labs/components/Labtest.jsx'
import PharmacyDashboard from './pharmacy/components/PharmacyDashboard.js';
import Invoice from './Invoice/components/InvoiceGenerator.jsx'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route index element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="login" element={
            <LoginPage />
          } />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Doctor", "Receptionist", "Pharmacy", "Lab","Nurse", "DMO"]}>
              <LaoutPage />
            </ProtectedRoute>
          }>
            <Route index element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Doctor", "Receptionist", "Pharmacy", "Lab","Nurse", "DMO"]}>
              <DashBoardPage />
              </ProtectedRoute>} />
            <Route path="dashboard" element={<Navigate to="/dashboard" replace />}/>
            <Route path="doctors" element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Doctor", "DMO"]}>
              <DoctorsPage />
              </ProtectedRoute>} />
            <Route path="patients" element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Doctor","DMO"]} >
              <PatientManagement />
              </ProtectedRoute>} />
            <Route path="records" element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Doctor", "Nurse","DMO"]}>
              <RecordLab />
              </ProtectedRoute>} />
            <Route path="notifications" element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
              <Notifications />
              </ProtectedRoute>} />
            <Route path="appointments" element={
              <ProtectedRoute allowedRoles={["Super Admin","Admin", "Receptionist"]}>
              <AppointmentPage />
              </ProtectedRoute>} />
            <Route path="lab" element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Lab"]}>
              <LabsPage />
              </ProtectedRoute>} />
            <Route path="pharmacy" element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Pharmacy"]}>
              <PharmacyDashboard/>
              </ProtectedRoute>}/>
            <Route path="invoice" element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Receptionist"]}>
              <Invoice/>
              </ProtectedRoute>}/>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
