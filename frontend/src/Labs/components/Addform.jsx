import React, { useContext, useRef } from "react";
 
import styles from "../css/Addform.module.css";
 
import "bootstrap/dist/css/bootstrap.min.css";
 
import { Form, Button, Col, Row } from "react-bootstrap";
 
import { forms } from "./Labtest";
 
import { FaArrowLeft } from "react-icons/fa";
 
function Addform({ handlerClose, saveForms,patients }) {
  const { formsData, setFormsData } = useContext(forms);
  const fileInputRef = useRef(null);
 
  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger file input click
  };
 
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      setFormsData((prev) => ({
        ...prev,
        upload: file,
      }));
    } else {
      console.log("No file selected.");
    }
  };
 

  const formsChanges = (e) => {
  const { name, type, checked, value, files } = e.target;
  const newValue = type === "checkbox" || type === "switch" ? checked : value;

  setFormsData((prevState) => {
    const updatedData = {
      ...prevState,
      [name]: files ? files[0] : newValue,
    };

    // Auto-fill patient details when patient ID is entered
    if (name === "patient") {
      const selectedPatient = patients.find(
        (p) => p.patient_id?.toLowerCase() === value.toLowerCase()
      );

      if (selectedPatient) {
        updatedData.patient_name = selectedPatient.patient_name;
        updatedData.requested_by =  selectedPatient.doctor_name
      }
    }

    return updatedData;
  });
};


 
  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        <h3 className="mb-4">
          <FaArrowLeft
            style={{ marginRight: "0.5rem" }}
            onClick={handlerClose}
          />
          Enter Test Results
        </h3>
      </div>
      <div className={styles.mod}>
        <div className={styles.models}>
          <div style={{ width: "30rem", padding: "1rem" }}>
            <h2>Test Information</h2>
            <h5 style={{ color: "lightgray" }}>Details about the test</h5>
            <Form style={{ padding: "1rem" }}>
              <Form.Group className="mb-3 d-flex justify-content-between align-items-center flex-wrap">
                <Form.Label className={styles.label}>Patient ID:</Form.Label>
                <Form.Control
                  className={styles.field}
                  type="text"
                  name="patient"
                  value={formsData.patient}
                  onChange={formsChanges}
                  placeholder="Enter your ID"
                />
              </Form.Group>
 
              <Form.Group className="mb-3 d-flex justify-content-between align-items-center flex-wrap">
                <Form.Label className={styles.label}>Patient Name:</Form.Label>
                <Form.Control
                  className={styles.field}
                  type="text"
                  name="patient_name"
                  value={formsData.patient_name}
                  onChange={formsChanges}
                  placeholder="Enter your Name"
                  readOnly
                />
              </Form.Group>
 
              <Form.Group className="mb-3 d-flex justify-content-between align-items-center flex-wrap">
                <Form.Label className={styles.label}>
                  Requested Test:
                </Form.Label>
                <Form.Control
                  className={styles.field}
                  type="text"
                  name="requested_test"
                  value={formsData.requested_test}
                  onChange={formsChanges}
                  placeholder="Enter your Requested Test"
                />
              </Form.Group>
 
              <Form.Group className="mb-3 d-flex justify-content-between align-items-center flex-wrap">
                <Form.Label className={styles.label}>Requested by:</Form.Label>
                <Form.Control
                  className={styles.field}
                  name="requested_by"
                  value={formsData.requested_by}
                  onChange={formsChanges}
                  readOnly
                />
              </Form.Group>
 
              <Form.Group className="mb-3 d-flex justify-content-between align-items-center flex-wrap">
                <Form.Label className={styles.label}>Request Date:</Form.Label>
                <Form.Control
                  className={styles.field}
                  name="request_date"
                  value={formsData.request_date}
                  onChange={formsChanges}
                  type="date"
                />
              </Form.Group>
 
              <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
                <Form.Label className={styles.label}>Priority:</Form.Label>
                <Form.Select
                  className={styles.select}
                  name="priority"
                  value={formsData.priority}
                  onChange={formsChanges}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Normal">Normal</option>
                </Form.Select>
              </Form.Group>
 
              <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
                <Form.Label className={styles.label}>Status:</Form.Label>
                <Form.Select
                  className={styles.select}
                  name="status"
                  value={formsData.status}
                  onChange={formsChanges}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Form.Group>
 
              <Form.Group className="mb-3 d-flex justify-content-between align-items-center flex-wrap">
                <Form.Label className={styles.label}>Notes :</Form.Label>
                <Form.Control
                  className={styles.field}
                  name="notes"
                  value={formsData.notes}
                  onChange={formsChanges}
                  type="text"
                  placeholder="Enter your notes"
                />
              </Form.Group>
            </Form>
          </div>
        </div>
 
        <div style={{ padding: "1rem", width: "30rem", marginBottom: "3rem" }}>
          <div
            style={{ padding: "1rem", width: "30rem", marginBottom: "3rem" }}
          >
            <div className={styles.resultCard}>
              <h3 className={styles.title}>Result Information</h3>
              <p className={styles.subtitle}>
                Information about the test results
              </p>
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className={styles.fl1}>User ID</Form.Label>
                      <Form.Control
                        name="user_id"
                        value={formsData.user_id}
                        onChange={formsChanges}
                        className={styles.formscon}
                        type="text"
                        placeholder="LAB-1235"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className={styles.fl1}>User Name</Form.Label>
                      <Form.Control
                        name="user_name"
                        value={formsData.user_name}
                        onChange={formsChanges}
                        className={styles.formscon}
                        type="text"
                        placeholder="Sarah Johnson"
                      />
                    </Form.Group>
                  </Col>
                </Row>
 
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className={styles.fl1}>Test Date</Form.Label>
                      <Form.Control
                        name="test_date"
                        value={formsData.test_date}
                        onChange={formsChanges}
                        type="date"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className={styles.fl1}>Test Time</Form.Label>
                      <Form.Control
                        name="test_time"
                        value={formsData.test_time}
                        onChange={formsChanges}
                        className={styles.formscon}
                        type="time"
                      />
                    </Form.Group>
                  </Col>
                </Row>
 
                <Form.Group className="mb-3">
                  <Form.Label className={styles.fl1}>Summary</Form.Label>
                  <Form.Control
                    name="summary"
                    value={formsData.summary}
                    onChange={formsChanges}
                    type="text"
                    placeholder="Brief Interpretation of result"
                  />
                </Form.Group>
 
                <Form.Group className="mb-3">
                  <Form.Label className={styles.fl1}>Test Type</Form.Label>
                  <Form.Control
                    name="test_type"
                    value={formsData.test_type} // Controlled value
                     onChange={formsChanges}
                  >
                  </Form.Control>
                </Form.Group>
 
                <div className={styles.bottomRow}>
                  <div className={styles.toggleLabel}>
                    <Form.Check
                      name="flag"
                      value={formsData.flag}
                      onChange={formsChanges}
                      type="switch"
                      id="flag-critical"
                    />
                    <span className={styles.criticalText}>
                      Flag as abnormal/critical
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    <div className={styles.actions}>
                      <div className={styles.fileUploadWrapper}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className={styles.hiddenInput}
                        />
                        <button
                          type="button"
                          onClick={handleButtonClick}
                          className={styles.uploadButton}
                        >
                          Upload File
                        </button>
                      </div>
 
                      <Button onClick={saveForms} variant="primary">
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Addform;