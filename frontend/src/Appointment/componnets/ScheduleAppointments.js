import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import api from "../../utils/axiosInstance";
import styles from "../css/ScheduleAppointments.module.css";
import { useNotifications } from "../../dashboard/components/NotificationContext";

const ScheduleAppointments = ({ show, handleClose }) => {
  const { fetchNotifications, onNotificationClick } = useNotifications();

  const [formData, setFormData] = useState({
    patient_name: "", age: "", gender: "", email: "", doctor: "", appointment_id: "", patient: "",
    date: "", time: "", phno: "", appointment_type: "", blood_group: "", notes: "", ward_no: "", diagnosis: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: "" }); // clear individual field error on change
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.patient_name.trim()) newErrors.patient_name = "Patient name is required";
    if (!formData.age.trim() || isNaN(formData.age) || formData.age <= 0) newErrors.age = "Valid age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Enter a valid email address";
    if (!formData.doctor.trim()) newErrors.doctor = "Doctor name is required";
    if (!formData.date) newErrors.date = "Select an appointment date";
    if (!formData.time) newErrors.time = "Select an appointment time";
    if (!formData.phno.match(/^\d{10}$/)) newErrors.phno = "Enter a valid 10-digit mobile number";
    if (!formData.appointment_type.trim()) newErrors.appointment_type = "Select appointment type";
    if (!formData.blood_group.trim()) newErrors.blood_group = "Select blood group";
    if (!formData.notes.trim()) newErrors.notes = "Enter additional notes";

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/appointments/create-appointments/", formData);

      if (response.data.success === 1) {
        setMessage("Appointment registered successfully");
        await fetchNotifications();
        await onNotificationClick();
        handleClose();

        // Clear form after close
        setTimeout(() => {
          setFormData({
            patient_name: "", age: "", gender: "", email: "", doctor: "", appointment_id: "", patient: "",
            date: "", time: "", phno: "", appointment_type: "", blood_group: "", notes: "", ward_no: "", diagnosis: "",
          });
          setMessage("");
        }, 300);
      } else {
        alert(response.data.message)
        // setMessage(response.data.message || "Failed to register appointment");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Failed to register appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Schedule New Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && (
          <p className={`text-${message.toLowerCase().includes("fail") ? "danger" : "success"}`}>
            {message}
          </p>
        )}
        <Form onSubmit={handleSubmit} className="p-3">
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Patient Name</Form.Label>
                <Form.Control
                  type="text" name="patient_name" value={formData.patient_name}
                  onChange={handleChange} isInvalid={!!error.patient_name}
                />
                <Form.Control.Feedback type="invalid">{error.patient_name}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Doctor</Form.Label>
                <Form.Control
                  type="text" name="doctor" value={formData.doctor}
                  onChange={handleChange} isInvalid={!!error.doctor}
                />
                <Form.Control.Feedback type="invalid">{error.doctor}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="tel" name="phno" value={formData.phno}
                  onChange={handleChange} isInvalid={!!error.phno}
                />
                <Form.Control.Feedback type="invalid">{error.phno}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} isInvalid={!!error.email}
                />
                <Form.Control.Feedback type="invalid">{error.email}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number" name="age" value={formData.age}
                  onChange={handleChange} isInvalid={!!error.age}
                />
                <Form.Control.Feedback type="invalid">{error.age}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender" value={formData.gender}
                  onChange={handleChange} isInvalid={!!error.gender}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{error.gender}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="time" name="time" value={formData.time}
                  onChange={handleChange} isInvalid={!!error.time}
                />
                <Form.Control.Feedback type="invalid">{error.time}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Appointment Type</Form.Label>
                <Form.Select
                  name="appointment_type" value={formData.appointment_type}
                  onChange={handleChange} isInvalid={!!error.appointment_type}
                >
                  <option value="">Select Type</option>
                  <option value="inpatient">In-Patient</option>
                  <option value="outpatient">Out-Patient</option>
                  <option value="casuality">Casualty</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{error.appointment_type}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Blood Group</Form.Label>
                <Form.Select
                  name="blood_group" value={formData.blood_group}
                  onChange={handleChange} isInvalid={!!error.blood_group}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{error.blood_group}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date" name="date" value={formData.date}
                  onChange={handleChange} isInvalid={!!error.date}
                />
                <Form.Control.Feedback type="invalid">{error.date}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea" rows={3} name="notes" value={formData.notes}
              onChange={handleChange} placeholder="Add additional notes..."
              isInvalid={!!error.notes}
            />
            <Form.Control.Feedback type="invalid">{error.notes}</Form.Control.Feedback>
          </Form.Group>

          <div className="d-flex justify-content-end gap-3 ps-5 mt-1">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading} className={styles.submitbutton}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : "Submit"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ScheduleAppointments;
