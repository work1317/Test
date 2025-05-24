import React, { useState } from "react";
import api from "../../utils/axiosInstance";
import { Form, Row, Col } from "react-bootstrap";
import styles from "../css/ProgressNotes.module.css";

const ProgressNotes = ({ handleClose,patientId }) => {
  const [status, setStatus] = useState(""); 

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Patient ID:", patientId); // Debug patient ID
    console.log("Status:", status);

    if (!patientId) {
      alert ("Patient ID is missing.");
      return;
  }

    try {
      const response = await api.post("/records/create-progress-note/", {
        patient_id: patientId, status: status.toLocaleLowerCase(),
      },
      { headers: { "Content-Type": "application/json" } }
     
    );

      console.log("API Response:", response.data);
      alert("Progress note saved successfully!");
      handleClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save progress note.");
    }
  };

  return (
    <div className="container mx-3">
      <Form className={styles.main} onSubmit={handleSave}>
        <Row className="justify-content-start justify-content-between mt-4 mb-4 ms-2">
          {["Critical", "Serious", "Moderate", "Mild", "Recovered", "Stable", "Deteriorating", "Improving"].map(
            (statusOption, index) => (
              <Col xs={6} md={1} key={index} className={styles.radioCol}>
                <Form.Check
                  inline
                  label={statusOption}
                  name="status"
                  type="radio"
                  id={`radio-${index}`}
                  value={statusOption}
                  onChange={handleStatusChange} // Handle selection change
                  className={`fs-5 ${styles.nenu}`}
                  required
                />
              </Col>
            )
          )}
        </Row>
        <Row>
          <div className={`d-flex justify-content-end gap-4 ps-5 ${styles.sumbit}`}>
            <button type="button" className={`px-2 ${styles.cancel}`} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={styles.savebutton}>
              Save
            </button>
          </div>
        </Row>
      </Form>
    </div>
  );
};

export default ProgressNotes;
