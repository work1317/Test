import React from "react";
import styles from "../css/InvoiceViewResult.module.css";
import { Button, Row, Col } from "react-bootstrap";
import { FaDownload,FaMicroscope } from "react-icons/fa";
import { LuCircleX } from "react-icons/lu";

function InvoiceViewresult({ handlerClose, inSelectForm, selectedResult }) {
  return (
    <div>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex  align-items-center">
              <div className="rounded-circle bg-light p-2 me-3">
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#e6eaf2",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FaMicroscope size={32} color="#3f51b5" />
                </div>
              </div>
              <div>
                <h5 className="mb-0">{inSelectForm.test_name}</h5>
                <small className="text-muted">
                  Lab Result - {inSelectForm.date}
                </small>
              </div>
            </div>
            <div className={styles.modCos} onClick={handlerClose}>
              <LuCircleX id="but-mod" />
            </div>
          </div>
        
          

          <Row className="mb-3">
            <Col md={6}>
              <h5>Patient Name</h5>
              <p>{inSelectForm.patient_name}</p>
            </Col>
            <Col md={6}>
              <h5>Test Type</h5>
              <p>{inSelectForm.test_name}</p>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <h5>Amount</h5>
              <p>{Number(inSelectForm.amount).toFixed(2)}</p>
            </Col>
          </Row>

          <Row>
            <Col>
              <h5>Status</h5>
              <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded">
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  <span className="me-2">{inSelectForm.status}</span>
                </div>
              
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default InvoiceViewresult;
