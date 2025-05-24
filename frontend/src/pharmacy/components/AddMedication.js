import React, { useState } from "react";
import api from "../../utils/axiosInstance";
import { Modal, Form, Row, Col } from "react-bootstrap";
import styles from "../css/AddMedication.module.css";

const AddMedication = ({ show, handleClose,onMedicationAdded }) => {
  const [formData, setFormData] = useState({
    medication_name: "",
    category: "",
    manufacturer: "",
    strength: "",
    stock_quantity: "",
    unit_price: "",
    mrp: "",
    expiry_date: "",
    description: "",
  });

  //const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const payload = {
      ...formData,
      stock_quantity: parseInt(formData.stock_quantity, 10),
      unit_price: parseFloat(formData.unit_price),
      expiry_date: formData.expiry_date ? formData.expiry_date : null,
      mrp: parseFloat(formData.mrp),
    };
  
    try {
      const response = await api.post("/pharmacy/add_medicine/", payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
        console.log(response)
      if (response.data.success === 1) {
        alert("Medication successfully added!");
        if (onMedicationAdded) {
          onMedicationAdded(); // This will re-fetch stats in PharmacyDashboard
        }
        setFormData({medication_name: "",
          category: "",
          manufacturer: "",
          strength: "",
          stock_quantity: "",
          unit_price: "",
          mrp: "",
          expiry_date: "",
          description: "",})
        handleClose();
      } else if (response.data.success === 0) {
        alert(response.data.message);
      } else {
        alert("Failed to add medication.");
      }
  
    } catch (error) {
      console.error("Axios Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal"
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Medication</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Medication Name</Form.Label>
                <Form.Control
                  name="medication_name"
                  value={formData.medication_name}
                  placeholder="Enter medication name"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Control
                  name="category"
                  value={formData.category}
                  placeholder="Enter category"
                  onChange={handleChange}
                  
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Manufacturer</Form.Label>
                <Form.Control
                  name="manufacturer"
                  value={formData.manufacturer}
                  placeholder="Enter manufacturer"
                  onChange={handleChange}
                  
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Strength</Form.Label>
                <Form.Control
                  name="strength"
                  value={formData.strength}
                  placeholder="e.g., 500mg"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Stock Quantity</Form.Label>
                <Form.Control
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  type="number"
                  placeholder="Enter quantity"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Unit Price</Form.Label>
                <Form.Control
                  name="unit_price"
                  value={formData.unit_price}
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  onChange={handleChange}
                  
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>MRP</Form.Label>
                <Form.Control
                  name="mrp"
                  value={formData.mrp}
                  type="number"
                  step="0.01"
                  placeholder="Enter MRP"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  name="expiry_date"
                  value={formData.expiry_date}
                  type="date"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              value={formData.description}
              rows={3}
              name="description"
              onChange={handleChange}
              placeholder="Enter medication description..."
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-4 ps-5">
            <button type="button" className={styles.cancel} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={styles.Addbutton}>
              Add Medication
            </button>
          </div>
        </Form>

        {/* {message && <p className="text-center mt-3 text-info">{message}</p>} */}
      </Modal.Body>
    </Modal>
  );
};

export default AddMedication;
