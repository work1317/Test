
import React, { useEffect, useState } from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import api from "../../utils/axiosInstance";
import styles from '../css/AppointmentDetailsModal.module.css';
import AppointmentReschedule from './AppointmentReschedule'; // 👈 Import it

function AppointmentDetailsModal({ show, handleClose, appointmentId }) {
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false); // 👈 New state

  useEffect(() => {
    if (show && appointmentId) {
      api.get(`/appointments/get-appointments/${appointmentId}/`)
        .then(response => {
          setAppointmentDetails(response.data.data.appointment);
        })
        .catch(error => {
          console.error('Error fetching appointment details:', error);
        });
    }
  }, [show, appointmentId]);

  const handleCancelAppointment = () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      api.post(`/appointments/cancel-appointment/${appointmentId}/`)
        .then(() => {
          alert("Appointment cancelled successfully.");
          handleClose();
        })
        .catch(error => {
          alert("Failed to cancel appointment: " + (error.response?.data?.message || error.message));
        });
    }
  };

  if (!appointmentDetails) return null;

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          {/* Display appointment details here as before */}
          <Row className={styles.infoRow}>
            <Col className={styles.infoCol}>
              <span className={styles.label}>Patient</span>
              <span className={styles.value}>
                {appointmentDetails.patient_name}<br />
                ID: {appointmentDetails.patient_id}
              </span>
            </Col>
            <Col className={styles.infoCol}>
              <span className={styles.label}>Doctor</span>
              <span className={styles.value}>
                {appointmentDetails.doctor_name}<br />
                ID: {appointmentDetails.doctor_id}
              </span>
            </Col>
          </Row>
          <Row className={styles.infoRow}>
            <Col className={styles.infoCol}>
              <span className={styles.label}>Date & Time</span>
              <span className={styles.value}>{appointmentDetails.date}</span><br></br>
              <span className={styles.value}>{appointmentDetails.time}</span>
            </Col>
            <Col className={styles.infoCol}>
              <span className={styles.label}>Department</span>
              <span className={styles.value}>{appointmentDetails.department}</span>
            </Col>
          </Row>
          <Row className={styles.infoRow}>
            <Col className={styles.infoCol}>
              <span className={styles.label}>Type</span>
              <span className={styles.value}>{appointmentDetails.appointment_type}</span>
            </Col>
          </Row>
          <Row className={styles.infoRow}>
            <Col className={styles.infoCol}>
              <span className={styles.label}>Notes</span>
              <span className={styles.value}>{appointmentDetails.notes || 'N/A'}</span>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className={styles.modalFooter}>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button className={styles.cancelButton} onClick={handleCancelAppointment}>Cancel Appointment</Button>
          <Button className={styles.rescheduleButton} onClick={() => setShowRescheduleModal(true)}>Reschedule</Button>
        </Modal.Footer>
      </Modal>

      {/* Reschedule Modal */}
      <AppointmentReschedule
        show={showRescheduleModal}
        handleClose={() => setShowRescheduleModal(false)}
        appointmentId={appointmentId}
        onRescheduleSuccess={(updatedData) => {
    // Update the displayed appointment details
    setAppointmentDetails(prev => ({
      ...prev,
      date: updatedData.date,
      time: updatedData.time
    }));
    setShowRescheduleModal(false);
  }}
      />
    </>
  );
}

export default AppointmentDetailsModal;
