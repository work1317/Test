import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from "../../utils/axiosInstance";

function AppointmentReschedule ({ show, handleClose, appointmentId, onRescheduleSuccess }) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (show) {
      setNewDate('');
      setNewTime('');
    }
  }, [show]);

  const handleRescheduleSubmit = () => {
    if (!newDate || !newTime) {
      alert("Please provide both a new date and time.");
      return;
    }

    api.post(`/appointments/reschedule-appointment/${appointmentId}/`, {
      date: newDate,
      time: newTime
    })
      .then((response) => {
        alert("Appointment rescheduled successfully.");
        onRescheduleSuccess?.(response.data.data); // 👈 Call parent with updated date/time
      })
      .catch(error => {
        alert("Failed to reschedule: " + (error.response?.data?.message || error.message));
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Reschedule Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="rescheduleDate">
            <Form.Label>New Date</Form.Label>
            <Form.Control
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="rescheduleTime">
            <Form.Label>New Time</Form.Label>
            <Form.Control
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleRescheduleSubmit}>Confirm Reschedule</Button>
      </Modal.Footer>
    </Modal>
  );
}


export default AppointmentReschedule;
