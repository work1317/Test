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
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <LaoutPage />
            </ProtectedRoute>
          }>
            <Route index element={<DashBoardPage />} />
            <Route path="dashboard" element={<Navigate to="/dashboard" replace />}/>
            <Route path="doctors" element={<DoctorsPage />} />
            <Route path="patients" element={<PatientManagement />} />
            <Route path="records" element={<RecordLab />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="appointments" element={<AppointmentPage />} />
            <Route path="lab" element={<LabsPage />} />
            <Route path="pharmacy" element={<PharmacyDashboard/>}/>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
