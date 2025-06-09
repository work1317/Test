import React, { useContext } from "react";
import styles from "../css/LabViewresult.module.css";
import { Button, Row, Col } from "react-bootstrap";
import { FaDownload, FaMicroscope } from "react-icons/fa";
import { LuCircleX } from "react-icons/lu";
import { forms } from "./Labtest";
import api from "../../utils/axiosInstance";
import { Icon } from '@iconify/react';
function LabViewresult({ handlerClose, selectedResult, selectForm }) {

  const handleDownload = async () => {
  try {
    const response = await api.get(`labs/labtests_download/${selectForm.action}/`, {
      responseType: 'blob', // Important to get image data correctly
    });

    // Create a Blob from the image response
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'labtest_image.jpg'); // File name

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading the image:', error);
  }
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
                  <h5 className="mb-0">{selectedResult.test_type}</h5>
                  <small className="text-muted">
                    Lab Result - {selectForm.date}
                  </small>
                </div>
              </div>
              <div className={styles.modCos} onClick={handlerClose}>
               <Icon icon="carbon:close-outline" height="24" width="24" color="#9A9A9A"/>
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
       <Icon icon="material-symbols:download" width="24" height="24" color="#002072"/>                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default LabViewresult;
