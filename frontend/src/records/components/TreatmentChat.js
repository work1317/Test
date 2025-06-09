import React, { useState } from "react";
import api from "../../utils/axiosInstance";
import { Form, Row, Col, Card } from "react-bootstrap";
import { Icon } from "@iconify/react";
import styles from '../css/TreatmentChat.module.css';

const TreatmentChat = ({ handleClose,patientId }) => {
  const [medicines, setMedicines] = useState([]);
  const [medicineDetails, setMedicineDetails] = useState({
    medicine_name: "",
    hrs_drops_mins: "",
    dose: "",
    time: "",
    medicine_details: "",
  });

  const handleChange = (e) => {
    setMedicineDetails({ ...medicineDetails, [e.target.name]: e.target.value });
  };

  // Function to add medicine
  const handleAddMedicine = () => {
    if (
      medicineDetails.medicine_name &&
      medicineDetails.hrs_drops_mins &&
      medicineDetails.dose &&
      medicineDetails.time &&
      medicineDetails.medicine_details
    ) {
      setMedicines([...medicines, medicineDetails]);
      setMedicineDetails({ medicine_name: "", hrs_drops_mins: "", dose: "", time: "", medicine_details: "" });
    } else {
      alert("Please fill all fields before adding medicine.");
    }
  };

  // Function to save data via POST request
  const handleSave = async () => {
    try {
    const response = await api.post("/records/create-treatment-chart/", 
      {
        patient: patientId,
        medicines: medicines, // only send this
      }, {
        headers: { "Content-Type": "application/json" },
      }
    );
     window.dispatchEvent(new Event("refreshTreatmentChat"));
      console.log("Saved Medicines Response:", response.data);
      alert("Medicines saved successfully!");
      setMedicines([]);  // Clear the list after saving
      handleClose();  // Close the form if needed
    } catch (error) {
      console.error("Error submitting data:", error.response?.data || error.message);
      alert("An error occurred while saving medicines.");
    }
  };
  

  return (
    <div className="container px-5 pb-4">
      <Form>
        <Card className="p-4 mb-4 mt-4">
          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <button type="button" className="btn btn-primary" onClick={handleAddMedicine}>
                <Icon icon="ic:baseline-add-circle-outline" width="20" height="20" /> Add Medicine
              </button>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Medicine Name</Form.Label>
                <Form.Control
                  type="text"
                  name="medicine_name"
                  value={medicineDetails.medicine_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Hrs/Drops/Mins</Form.Label>
                <Form.Control
                  type="text"
                  name="hrs_drops_mins"
                  value={medicineDetails.hrs_drops_mins}
                  onChange={handleChange}
                  
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Dose</Form.Label>
                <Form.Control
                  type="text"
                  name="dose"
                  value={medicineDetails.dose}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={medicineDetails.time}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Medicine Details</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="medicine_details"
              value={medicineDetails.medicine_details}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Card>

        {/* Display added medicines */}
        {medicines.length > 0 && (
          <div className="mb-3">
            {medicines.map((med, index) => (
              <Card key={index} className="p-3 mb-2 shadow-sm">
                <Row>
                  <Col>
                    <h6>{med.medicine_name}</h6>
                    <p className="text-muted">Time: {med.time}</p>
                    <p>{med.medicine_details}</p>
                  </Col>
                  <Col xs="auto">
                    <span className="text-muted">{med.dose}</span>
                  </Col>
                </Row>
                <div>
                  <span className="badge bg-light text-dark">{med.hrs_drops_mins}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Row>
          <div className={`d-flex justify-content-end gap-4 ${styles.submit}`}>
            <button type="button" className={styles.cancel} onClick={handleClose}>Cancel</button>
            <button type="button" className={styles.savebutton} onClick={handleSave}>Save</button>
          </div>
        </Row>
      </Form>
    </div>
  );
};

export default TreatmentChat;