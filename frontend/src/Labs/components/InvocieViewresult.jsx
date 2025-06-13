import React from "react";
import styles from "../css/InvoiceViewResult.module.css";
import { Button, Row, Col } from "react-bootstrap";
import { FaDownload,FaMicroscope } from "react-icons/fa";
import { LuCircleX } from "react-icons/lu";
import { Icon } from '@iconify/react';

function InvoiceViewresult({ handlerClose, inSelectForm, selectedResult }) {
  return (
    <div>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex  align-items-center">
              <div className="rounded-circle  p-2 me-3">
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
                                  <Icon width="24" height="24" color="#262872" icon="uit:microscope" />
                
                </div>
              </div>
              <div>
                <h5 className="mb-0">{inSelectForm.testname}</h5>
                <small className="text-muted">
                  Lab Result - {inSelectForm.date}
                </small>
              </div>
            </div>
            <div className={styles.modCos} onClick={handlerClose}>
               <Icon icon="carbon:close-outline" height="24" width="24" color="#9A9A9A"/>
            </div>
          </div>
         <hr  className="mt-0"/>
          

          <Row className="mb-3">
            <Col md={6}>
              <h5>Patient Name</h5>
              <p>{inSelectForm.patient_name}</p>
            </Col>
            <Col md={6}>
              <h5>Test Type</h5>
              <p>{inSelectForm.testname}</p>
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
