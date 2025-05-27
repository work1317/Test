import React, { useContext } from "react";
import styles from "../css/LabViewresult.module.css";
import { Button, Row, Col } from "react-bootstrap";
import { FaDownload, FaMicroscope } from "react-icons/fa";
import { LuCircleX } from "react-icons/lu";
import { forms } from "./Labtest";
import api from "../../utils/axiosInstance";

function LabViewresult({ handlerClose, selectedResult, selectForm }) {
  const handleDownload = async () => {
    const url = api.get(`labs/labtests_download/${selectForm.action}/`);
    console.log(url);
    const link = document.createElement('a');
    link.href = url;
  

    link.download = 'labtest_image.jpg'; 
    link.click();
  };
  return (
    <div>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div
            style={{ borderBottom: "1px solid gary", paddingBottom: "0.7rem" }}
          >
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
                    <FaMicroscope size={50} color="#3f51b5" />
                  </div>
                </div>
                <div>
                  <h5 className="mb-0">{selectedResult.test_type}</h5>
                  <small className="text-muted">
                    Lab Result - {selectForm.date}
                  </small>
                </div>
              </div>
              <div className={styles.modCos} onClick={handlerClose}>
                <LuCircleX id="but-mod" />
              </div>
            </div>
          </div>

          <Row className="mb-3">
            <Col md={6}>
              <h5>Doctor</h5>
              <p style={{ fontSize: "1.1rem" }}>{selectedResult.doctor}</p>
            </Col>
            <Col md={6}>
              <h5>Test Type</h5>
              <p style={{ fontSize: "1.1rem" }}>{selectedResult.test_type}</p>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <h5>Summary</h5>
              <p style={{ fontSize: "1.1rem" }}>{selectedResult.summary}</p>
            </Col>
          </Row>

          <Row>
            <Col>
              <h5>Attachments</h5>
              <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded">
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  {selectedResult?.url && (
                    <img
                      src={selectedResult.url}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        marginBottom: "1rem",
                      }}
                    />
                  )}
                  <span className="me-2">
                    {selectedResult.result_filename}
                  </span>
                  <small className="text-muted">(2.4 MB)</small>
                </div>
                <Button variant="link" className="p-0" onClick={handleDownload}>
                  <FaDownload size={20} />
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default LabViewresult;
