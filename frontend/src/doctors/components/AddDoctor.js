import axios from "axios";
import React, { useState } from "react";
import { Button, Form, Modal, Row, Col, Dropdown,Alert } from "react-bootstrap";
import api from "../../utils/axiosInstance";

const AddDoctor = ({ show, handleClose, refreshDoctor }) => {
  const [formData, setFormData] = useState({
    d_name: "",
    d_department: "",
    d_phn_no: "",
    d_email: "",
    d_ward_no: "",
    d_available_days: [],
    d_start_time: "",
    d_end_time: "",
    d_education_info: "",
    d_certifications: "",
    is_guest: false,
  });

  const [errors, setErrors] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [close, setClose] = useState(true)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.d_name.trim()) newErrors.d_name = "Name is required";
    if (!formData.d_department.trim()) newErrors.d_department = "Department is required";
    if (!formData.d_phn_no.match(/^\d{10}$/)) newErrors.d_phn_no = "Enter a valid 10-digit mobile number";
    if (!formData.d_email.match(/^\S+@\S+\.\S+$/)) newErrors.d_email = "Enter a valid email address";
    if (!formData.d_ward_no.trim()) newErrors.d_ward_no = "Room number is required";
    if (formData.d_available_days.length === 0) newErrors.d_available_days = "Select available days";
    if (!formData.d_start_time) newErrors.d_start_time = "Select start time";
    if (!formData.d_end_time) newErrors.d_end_time = "Select end time";
    if (!formData.d_education_info.trim()) newErrors.d_education_info= "Enter education details";
    if (!formData.d_certifications.trim()) newErrors.d_certifications = "Enter certifications";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
    const handleSubmit = async (e) => {
      e.preventDefault();
    
      try {
        const response = await api.post('doctors/doctors/create/', formData);
        console.log('Doctor created:', response.data);
        window.dispatchEvent(new Event('refreshAddDoctor'))
        alert("Doctor added")
        // Do success handling like closing modal or resetting form
        await refreshDoctor()
        handleClose(); 

      } 
      catch (error) {
        if (error.response) {
          console.error('Error data:', error.response.data);
        }
       else {
          console.error('Error creating doctor:', error);
        }
      }
    };
    
  const daysOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleSelect = (day) => {
    const updatedDays = formData.d_available_days.includes(day)
      ? formData.d_available_days.filter((d) => d !== day)
      : [...formData.d_available_days, day];

    setFormData({ ...formData, d_available_days: updatedDays });
  };

  return (
    
    <Modal show={show} onHide={handleClose} size="lg" centered>  
       <Modal.Header closeButton >
        <Modal.Title>Add Doctor</Modal.Title>
      </Modal.Header> 

      <Modal.Body>
        {successMessage && (
      <Alert variant="success" onClose={() => setSuccessMessage("")} dismissible>
        {successMessage}
      </Alert>
    )}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Enter Name</Form.Label>
                <Form.Control
                  type="text"
                  name="d_name"
                  placeholder="Enter your name"
                  value={formData.d_name}
                  onChange={handleChange}
                  isInvalid={!!errors.d_name}
                />
                <Form.Control.Feedback type="invalid">{errors.d_name}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group>
                  <Form.Label>Department</Form.Label>
                  <Form.Select  name="d_department" value={formData.d_department} isInvalid={!!errors.d_department} onChange={handleChange} >
                    <option value=""  > Select department</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="ENT">ENT</option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="Dermatology">Dermatology</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.d_department}</Form.Control.Feedback>
                </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="text"
                  name="d_phn_no"
                  placeholder="Enter mobile number"
                  value={formData.d_phn_no}
                  onChange={handleChange}
                  isInvalid={!!errors.d_phn_no}
                />
                <Form.Control.Feedback type="invalid">{errors.d_phn_no}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email ID</Form.Label>
                <Form.Control
                  type="email"
                  name="d_email"
                  placeholder="Enter email address"
                  value={formData.d_email}
                  onChange={handleChange}
                  isInvalid={!!errors.d_email}
                />
                <Form.Control.Feedback type="invalid">{errors.d_email}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
          <Col md={4}>
              <Form.Group>
                <Form.Label>Room Number</Form.Label>
                <Form.Control
                  type="text"
                  name="d_ward_no"
                  placeholder="Enter room number"
                  value={formData.d_ward_no}
                  onChange={handleChange}
                  isInvalid={!!errors.d_ward_no}
                />
                <Form.Control.Feedback type="invalid">{errors.d_ward_no}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  name="d_start_time"
                  value={formData.d_start_time}
                  onChange={handleChange}
                  isInvalid={!!errors.d_start_time}
                />
                <Form.Control.Feedback type="invalid">{errors.d_start_time}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  name="d_end_time"
                  value={formData.d_end_time}
                  onChange={handleChange}
                  isInvalid={!!errors.d_end_time}
                />
                <Form.Control.Feedback type="invalid">{errors.d_end_time}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={9}>
              <Form.Group>
                <Form.Label>Available Days</Form.Label>
                <Dropdown show={dropdownOpen} onToggle={() => setDropdownOpen(!dropdownOpen)}>
                  <Dropdown.Toggle variant="light" className="w-100">
                    {formData.d_available_days.length > 0 ? formData.d_available_days.join(", ") : "Select days"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ width: "100%", maxHeight: "200px", overflow: "scroll" }}>
                    {daysOptions.map((day) => (
                      <Dropdown.Item key={day} as="button" className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          label={day}
                          checked={formData.d_available_days.includes(day)}
                          onChange={() => handleSelect(day)}
                        />
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                {errors.d_available_days && <div className="text-danger">{errors.d_available_days}</div>}
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Education Information</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="d_education_info"
              value={formData.d_education_info}
              onChange={handleChange}
              isInvalid={!!errors.d_education_info}
            />
            <Form.Control.Feedback type="invalid">{errors.d_education_info}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Certifications</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="d_certifications"
              value={formData.d_certifications}
              onChange={handleChange}
              isInvalid={!!errors.d_certifications}
            />
            <Form.Control.Feedback type="invalid">{errors.d_certifications}</Form.Control.Feedback>
              <Form.Group className="mb-3 d-flex flex-row">
           <Form.Label style={{padding:"10px"}}> Guest...? </Form.Label>
            <Form.Check
              type="checkbox"
              name="is_guest"
              style={{paddingTop:"12px"}}
              checked={formData.is_guest || false}
              onChange={(e) =>
                setFormData({ ...formData, is_guest: e.target.checked })
              }
            />

       
          </Form.Group>
          </Form.Group>

          <div className="d-flex flex-row justify-content-end">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit" className="ms-2">
              Submit Details
            </Button>
            
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddDoctor;
  