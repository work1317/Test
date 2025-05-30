import React, { useState } from "react";
import api from "../../utils/axiosInstance";
import { Form, Row, Col } from "react-bootstrap";
import styles from "../css/NursingNote.module.css";

const NursingNote = ({ handleClose, patientId }) => {
  const [notes, setNotes] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Patient ID:", patientId); // Debug patient ID
    console.log("Notes:", notes);

    if (!patientId) {
      console.error("No patient selected!");
      return;
    }

    try {
      const response = await api.post(
        `/records/create-nursing-notes/`,
        { patient: patientId, description: notes },
        { headers: { "Content-Type": "application/json" } }
      );
       window.dispatchEvent(new Event("refreshNursingNote"));
      console.log("API Response:", response.data);
      alert("Nursing note saved successfully!");
      handleClose();
    } catch (error) {
      console.error("Error saving nursing note:", error);
      alert(error.response.data.message)
    }
  };

  

  return (
    <Form onSubmit={handleSave}>
      <div className={styles.main}>
        <Row>
          <Form.Label className={styles.nursingtext}>Nursing Notes</Form.Label>
        </Row>
        <Row>
          <Col>
            <Form.Group className={styles.inputbox}>
              <Form.Label className={styles.descriptiontext}>
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                placeholder="Enter Feedback Details..."
                className={styles.textbox}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <div className="d-flex justify-content-end gap- px-4 pb-5">
            <Form>
              <button
                type="button"
                className={`pl-4 mx-4 ${styles.cancel}`}
                onClick={handleClose}
              >
                Cancel
              </button>
            </Form>
            <button type="submit" className={`pl-4 ${styles.savebutton}`}>
              Save
            </button>
          </div>
        </Row>
      </div>
    </Form>
  );
};

export default NursingNote;