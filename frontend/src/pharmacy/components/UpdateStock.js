import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import api from "../../utils/axiosInstance";
import styles from '../css/AddMedication.module.css';

function UpdateStock({ medicationId, show, handleClose }) {
  const [formValues, setFormValues] = useState({
    medication_name: '',
    category: '',
    manufacturer: '',
    strength: '',
    stock_quantity: '',
    unit_price: '',
    mrp: '',
    expiry_date: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (medicationId && show) {
      setLoading(true);
      api.get(`/pharmacy/update_medicine/${medicationId}/`)
        .then(res => {
          const data = res.data.data;
          setFormValues({
            medication_name: data.medication_name,
            category: data.category,
            manufacturer: data.manufacturer,
            strength: data.strength,
            stock_quantity: data.stock_quantity,
            unit_price: data.unit_price,
            mrp: data.mrp,
            expiry_date: data.expiry_date,
            description: data.description
          });
        })
        .catch(err => {
          console.error("Error fetching medication:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [medicationId, show]);
  
  const handleChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    api.put(`/pharmacy/update_medicine/${medicationId}/`, formValues)
      .then(res => {
        console.log('UpdateStock response',res);
        alert("Medication updated successfully!");
         window.dispatchEvent(new Event("refreshUpdateStock"));
        handleClose();
      })
      .catch(err => {
        console.error("Update failed:", err);
        alert("Failed to update medication.");
      });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Update Medication</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Medication Name</Form.Label>
              <Form.Control
                type="text"
                value={formValues.medication_name}
                onChange={(e) => handleChange('medication_name', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                value={formValues.category}
                onChange={(e) => handleChange('category', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Manufacturer</Form.Label>
              <Form.Control
                type="text"
                value={formValues.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Strength</Form.Label>
              <Form.Control
                type="text"
                value={formValues.strength}
                onChange={(e) => handleChange('strength', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type="number"
                value={formValues.stock_quantity}
                onChange={(e) => handleChange('stock_quantity', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unit Price</Form.Label>
              <Form.Control
                type="text"
                value={formValues.unit_price}
                onChange={(e) => handleChange('unit_price', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>MRP</Form.Label>
              <Form.Control
                type="text"
                value={formValues.mrp}
                onChange={(e) => handleChange('mrp', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="date"
                value={formValues.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formValues.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} className={styles.Addbutton}>Update</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UpdateStock;
