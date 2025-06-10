import React, { useState } from "react";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import api from "../../utils/axiosInstance";
import PatientRegister from "../css/PatientRegistration.module.css";
import { useNotifications } from "../../dashboard/components/NotificationContext";

const PatientRegistration = ({ show, handleClose, refreshPatient }) => {
  const {fetchNotifications, onNotificationClick} =  useNotifications()
  const [formData, setFormData] = useState({
    patient_name: "",
    doctor:"",
    age: "",
    gender: "",
    email: "",
    phno: "",
    appointment_type: "",
    blood_group: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!formData.patient_name.trim()) newErrors.patient_name = "Patient name is required";
    if (!formData.age.trim() || isNaN(formData.age) || formData.age <= 0) newErrors.age = "Valid age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Enter a valid email address";
    if (!formData.doctor.trim()) newErrors.doctor = "Doctor name is required";
    if (!formData.phno.match(/^\d{10}$/)) newErrors.phno = "Enter a valid 10-digit mobile number";
    if (!formData.appointment_type.trim()) newErrors.appointment_type = "Select appointment type";
    if (!formData.blood_group.trim()) newErrors.blood_group = "Select blood group";
    if (!formData.notes.trim()) newErrors.notes = "Enter additional notes";

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setLoading(true);
    setError({});
  
  try {
    const response = await api.post(
      "/patients/create/",
      formData
    );
    await fetchNotifications();
    await onNotificationClick();
    console.log("API Response:", response);
    alert(response.data.message)
    // window.location.href = "/notifications";
    if (
      (response.status === 200 || response.status === 201) &&
      response.data.success === 1
    ) {
      await refreshPatient()
      setUserDetails({
        patient_id: response.data.data.patient_details.patient_id,
        patient_name: response.data.data.patient_details.patient_name,
        age: response.data.data.patient_details.age,
      });

      setShowUserModal(true);

      // Reset form and close modal
      setFormData({
        patient_name: "",
        doctor:"",
        age: "",
        gender: "",
        email: "",
        phno: "",
        appointment_type: "",
        blood_group: "",
        notes: "",
      });

      handleClose();
    }
    //  else {
    //   setError("Something went wrong. Please try again.");
    // }
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    setError("Registration failed. Please check the details and try again.");
    alert(error.response.data)
  } finally {
    setLoading(false);
  }
};

const onClose = () => {
   setFormData({
        patient_name: "",
        doctor:"",
        age: "",
        gender: "",
        email: "",
        phno: "",
        appointment_type: "",
        blood_group: "",
        notes: "",
      });
      handleClose();
}
  
  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Patient Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {error && typeof error === "string" && <p className="text-danger">{error}</p>}
          <Form onSubmit={handleSubmit} className="p-3">
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="patient_name"
                    value={formData.patient_name}
                    onChange={handleChange}
                    isInvalid={!!error.patient_name}
                  />
                  <Form.Control.Feedback type="invalid">{error.patient_name}</Form.Control.Feedback>
                </Form.Group>
                
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Doctor</Form.Label>
                  <Form.Control
                    type="text"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    isInvalid={!!error.doctor}
                  />
                <Form.Control.Feedback type="invalid">{error.doctor}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Mobile Number</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="tel"
                      name="phno"
                      value={formData.phno}
                      onChange={handleChange}
                      autoComplete="off"
                      isInvalid={!!error.phno}
                    />
                <Form.Control.Feedback type="invalid">{error.phno}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email Id</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!error.email}
                  />
                <Form.Control.Feedback type="invalid">{error.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Age</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      isInvalid={!!error.age}
                    />
                <Form.Control.Feedback type="invalid">{error.age}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Form.Select name="gender" value={formData.gender} onChange={handleChange} isInvalid={!!error.gender}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </Form.Select>
                <Form.Control.Feedback type="invalid">{error.gender}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Appointment Type</Form.Label>
                  <Form.Select name="appointment_type" value={formData.appointment_type} onChange={handleChange}  isInvalid={!!error.appointment_type}>
                    <option value="">Select Type</option>
                    <option value="inpatient">In-Patient</option>
                    <option value="outpatient">Out-Patient</option>
                    <option value="casuality">Casuality</option>
                  </Form.Select>
                <Form.Control.Feedback type="invalid">{error.appointment_type}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select name="blood_group" value={formData.blood_group} onChange={handleChange} isInvalid={!!error.blood_group}>
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Form.Select>
                <Form.Control.Feedback type="invalid">{error.blood_group}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add additional notes..."
                isInvalid={!!error.notes}
              />
            <Form.Control.Feedback type="invalid">{error.notes}</Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-end gap-3 ps-5 mt-1">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={loading} className={PatientRegister.submitbutton}>
                {loading ? <Spinner as="span" animation="border" size="sm" /> : "Submit"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* User Details Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registration Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userDetails ? (
            <>
              <p><strong>Patient ID:</strong> {userDetails.patient_id}</p>
              <p><strong>Patient Name:</strong> {userDetails.patient_name}</p>
              <p><strong>Age:</strong> {userDetails.age}</p>
            </>
          ) : (
            <p>Loading user details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PatientRegistration;



