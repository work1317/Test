import React, { useState, useContext, useEffect } from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Recordprescription from "../css/RecordPrescription.module.css";
import api from "../../utils/axiosInstance";
import { doctors } from "./RecordLab";
 
function RecordPrescription() {
  const { selectedPatient } = useContext(doctors);
  const [prescriptions, setPrescriptions] = useState([]);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(
          `/records/records/?record_type=prescription&patient_id=${selectedPatient.patient_id}`
        );
        console.log(response.data.data);
 
        if (response.data?.data && response.data.data.length > 0) {
          setPrescriptions(response.data.data);
        } else {
          console.log("No prescription records found");
          setPrescriptions([]);
        }
      } catch (error) {
        console.error("Error fetching prescription data:", error);
      }
    };
 
    fetchData();
    const handleRefresh = () => fetchData();
    window.addEventListener("refreshAddRecordModal", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshAddRecordModal", handleRefresh);
    };
  }, [selectedPatient]);
 
  const handleDownload = async (report) => {
    try {
      if (!report) {
        console.error("No report file available.");
        return;
      }
 
      const response = await api.get(report, { responseType: "blob" });
      console.log("Downloading:", response);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
 
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", report.split("/").pop());
      document.body.appendChild(link);
      link.click();
 
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the report:", error);
    }
  };
 
  return (
    <Container className={Recordprescription.prescriptioncontainer}>
      <div style={{ maxHeight: "500px", overflowY: "auto", padding: "10px" }}>
        {prescriptions.length > 0 ? (
          prescriptions.map((prescription, index) => (
            <Card key={index} className={` mb-2 ${Recordprescription.prescriptioncard}`} >
              <Card.Body>
                <h5 className={Recordprescription.doctorname}>{selectedPatient.patient_name}</h5>
                <div className="d-flex gap-3">
                  <p className="text-muted">Doctor: {prescription.doctor_name}</p>
                  <p>Category: {prescription.category}</p>
                  <p>Date: {new Date(prescription.created_at).toLocaleDateString()}</p>
                </div>
                <Card className={`border border-light ${Recordprescription.medicinecard}`}>
                  <Card.Body className={Recordprescription.secondcard}>
                    <div className="d-flex justify-content-between">
                      <h6 className={Recordprescription.medicinename}>{prescription.medication_name}</h6>
                      <p>{prescription.dosage}</p>
                    </div>
                    <Row>
                      <Col xs={12} sm={6}>
                        <p>Duration: {prescription.duration}</p>
                        <p>Summary: {prescription.summary}</p>
                        <p>Status: {prescription.status}</p>
                        <p>Quantity: {prescription.quantity}</p>
                      </Col>
                    </Row>
                  </Card.Body>
                  <div className={`d-flex flex-row justify-content-between ${Recordprescription.file}`}>
                    {prescription.report ? prescription.report.split("/").pop() : "No report available"}
                    {prescription.report && (
                      <Button variant="link" className="p-0" onClick={() => handleDownload(prescription.report)}>
                        <Icon icon="material-symbols:download" width="24" height="24" color="#002072" />
                      </Button>
                    )}
                  </div>
                </Card>
              </Card.Body>
            </Card>
          ))
        ) : (
          <div className="text-center mt-5">
            <p style={{ color: "#808080" }}>No prescription records found for this patient.</p>
          </div>
        )}
      </div>
    </Container>
  );
}
 
export default RecordPrescription;