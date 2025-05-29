import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";
import api from "../../utils/axiosInstance";
import styles from "../css/ProcessPrescription.module.css";
 
const ProcessPrescription = ({ show, handleClose, patient_id, onUpdate }) => {
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState("");
 
  useEffect(() => {
    if (patient_id && show) {
      setPrescriptionData([]);
      setQuantities({});
      api
        .get(`records/prescription/${patient_id}/`)
        .then((response) => {
          if (response.data.success === 1) {
            setPrescriptionData(response.data.data);
          } else {
            alert("Failed to fetch prescription details.");
          }
        })
        .catch((error) => {
          console.error("Error fetching prescription:", error);
        });
    }
  }, [patient_id, show]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prescriptionData.length) return;
 
    const updatedData = prescriptionData
      .filter((pres) => quantities[pres.id] && quantities[pres.id] !== "")
      .map((pres) => ({
        medication_name: pres.medication_name,
        quantity: parseInt(quantities[pres.id]),
      }));
 
    if (updatedData.length === 0) {
      setMessage("Please enter quantity for at least one medicine to process.");
      return;
    }
 
    try {
      const response = await api.put(
        `records/prescription/${patient_id}/`,
        updatedData
      );
 
      setMessage("Prescription(s) processed successfully.");
      if (onUpdate) onUpdate();
      handleClose();
    } catch (error) {
      console.error("Error submitting prescription:", error);
      setMessage("Failed to process prescription(s).");
    }
  };
 
 
  if (!show) return null;
 
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Process Prescription</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!prescriptionData.length ? (
          <div className="text-center my-4">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Fetching prescriptions...</p>
          </div>
        ) : (
          <>
            {prescriptionData.map((pres) => (
              <div key={pres.id} className={`p-2 mb-3 ${styles.medicinecard}`}>
                <Row>
                  <Col>
                    <strong>{pres.patient_name}</strong>
                  </Col>
                  <Col className="text-end" xs="auto">
                    Date: {new Date().toLocaleDateString()}
                  </Col>
                </Row>
                <Row>
                  <p className="text-muted">Prescription ID: {pres.id}</p>
                </Row>
                <div className={`p-4 ${styles.medicine}`}>
                  <Row>
                    <Col>
                      <h6 className="mb-0">{pres.medication_name}</h6>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center ms-3">
                      <p className="mb-0 me-3">{pres.dosage}</p>
                      <div
                        style={{
                          backgroundColor: "#CFDEFF",
                          borderRadius: "20px",
                          padding: "2px 10px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            marginRight: "4px",
                            color: "#2563EB",
                          }}
                        >
                          Qty:
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={quantities[pres.id] || ""}
                          onChange={(e) =>
                            setQuantities({
                              ...quantities,
                              [pres.id]: e.target.value,
                            })
                          }
                          style={{
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            width: "45px",
                            textAlign: "center",
                            fontSize: "14px",
                            color: "#2563EB",
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <p className="text-muted">{pres.summary}</p>
                  </Row>
                  <Row>
                    <Col>
                      <span className="text-muted">Stock Available</span>
                    </Col>
                    <Col xs="auto">
                      <span style={{ color: "#16A34A" }}>
                        {pres.stock_quantity || "0"} units
                      </span>
                    </Col>
                  </Row>
                </div>
              </div>
            ))}
 
            {message && <p className="text-center mt-3">{message}</p>}
 
            <Row>
              <Col className="text-end p-1 me-1">
                <button className={`m-4 ${styles.cancel}`} onClick={handleClose}>
                  Cancel
                </button>
                <button className={styles.complete} onClick={handleSubmit}>
                  Complete Processing
                </button>
              </Col>
            </Row>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};
 
export default ProcessPrescription;