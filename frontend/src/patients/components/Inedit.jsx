import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import api from "../../utils/axiosInstance";

function Inedit({ show, handleClose, patientId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formValues, setFormValues] = useState({
    patient_name: "",
    doctor_name: "",
    appointment_type: "",
    diagnosis: "",
    notes: "",
    ward_no: "",
    age: "",
    gender: "",
    phno: "",
    email: "",
    blood_group: ""
  });

  useEffect(() => {
    if (patientId && show) {
      setLoading(true);
      api
        .get(`/patients/update/${patientId}/`)
        .then((res) => {
          console.log("GET response:", res);
          if (res.data.success === 1) {
            const data = res.data.data;
            console.log("Status",res.data.status)
            setFormValues({
              patient_name: data.patient_name || "",
              doctor_name: data.doctor_name || "",
              appointment_type: data.appointment_type || "",
              diagnosis: data.diagnosis || "",
              notes: data.notes || "",
              ward_no: data.ward_no || "",
              age: data.age || "",
              gender: data.gender || "",
              phno: data.phno || "",
              email: data.email || "",
              blood_group: data.blood_group || ""
            });
          } else {
            setError("Patient not found.");
          }
        })
        .catch((err) => {
          console.error("GET error:", err);
          setError("Failed to fetch patient data.");
        })
        .finally(() => setLoading(false));
    }
  }, [patientId, show]);

  const handleChange = (e) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
   

    // Only send fields that exist in PatientUpdateSerializer
    const updatePayload = {
      patient_name: formValues.patient_name,
      doctor_name: formValues.doctor_name,
      appointment_type: formValues.appointment_type,
      diagnosis: formValues.diagnosis,
      notes: formValues.notes,
      ward_no: formValues.ward_no,
      age: formValues.age,
      gender: formValues.gender,
      phno: formValues.phno
    };

    api
      .put(`/patients/update/${patientId}/`, updatePayload)
      .then((res) => {
        console.log("PUT response:", res);
        if (res.data.success === 1) {
          alert(res.data.message);
          handleClose();
        } else {
          setError(res.data.message || "Failed to update.");
        }
      })
      .catch((err) => {
        console.error("PUT error:", err);
        setError("Failed to update patient.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Patient</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <p className="text-danger">{error}</p>}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="patient_name"
                    value={formValues.patient_name}
                    onChange={handleChange}
                    required readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Doctor Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="doctor_name"
                    value={formValues.doctor_name}
                    onChange={handleChange}
                    required readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Appointment Type</Form.Label>
                  <Form.Select
                    name="appointment_type"
                    value={formValues.appointment_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="inpatient">In-Patient</option>
                    <option value="outpatient">Out-Patient</option>
                    <option value="casuality">Casualty</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ward Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="ward_no"
                    value={formValues.ward_no}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Form.Control
                    type="text"
                    name="gender"
                    value={formValues.gender}
                    onChange={handleChange} readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phno"
                    value={formValues.phno}
                    onChange={handleChange} readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control
                type="text"
                name="diagnosis"
                value={formValues.diagnosis}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                value={formValues.notes}
                onChange={handleChange}
                rows={3} readOnly
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-3">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default Inedit;
