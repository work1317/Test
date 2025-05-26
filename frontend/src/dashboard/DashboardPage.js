import React, { useState } from 'react';
import { Container, Row} from 'react-bootstrap';
import MainDashBoard from '../dashboard/components/MainDashBoard';
import PatientManagement from '../patients/components/PatientManagement';
import RecordLab from '../records/components/RecordLab';
import Notifications from '../Notifications/components/Notifications';
import DoctorsPage from '../doctors/DoctorsPage';
import AppointmentPage from '../Appointment/componnets/Appointment';
import LabsPage from '../Labs/components/Labtest'
import PharmacyDashboard from '../pharmacy/components/PharmacyDashboard';
import Invoice from '../Invoice/components/InvoiceGenerator'

const DashBoardPage = () => {
  const [selectedPage, setSelectedPage] = useState("dashboard");

  const renderContent = () => {
    switch (selectedPage) {
      case "dashboard":
        return <MainDashBoard />; 
      case "doctors":
        return <DoctorsPage />;
      case "patients":
        return <PatientManagement />;
      case "records":
        return <RecordLab />;
      case "notifications":
        return <Notifications />;
      case "appointments":
        return <AppointmentPage/>;
      case "lab":
        return <LabsPage/>;
      case "pharmacy":
        return <PharmacyDashboard/>;
      case "invoice":
        return <Invoice />
      default:
        return <h2>Welcome to the Dashboard</h2>;
    }
  };

  return (
    <Container fluid>
      <Row >
          {renderContent()}
      </Row>
    </Container>
  );
};

export default DashBoardPage;
