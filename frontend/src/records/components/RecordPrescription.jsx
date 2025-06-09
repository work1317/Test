import React, { useState,  useContext} from 'react'
import { Container, Card, Row, Col } from "react-bootstrap";
import Recordprescription from '../css/RecordPrescription.module.css';
import api from "../../utils/axiosInstance";
import { doctors } from './RecordLab';
import { Button } from "react-bootstrap";
import { Icon } from "@iconify/react";
 
function RecordPrescription() {
   const {selectedPatient}  =  useContext(doctors)
  const [preStore, setPreStore] =  useState([]);
 
  useState(() =>{
    const fecthingData = async() => {
    try{
      const response  =  await api.get(`/records/records/?record_type=prescription&patient_id=${selectedPatient.patient_id}`);
      console.log(response.data.data)
 
      if(response.data?.data){
        setPreStore(response.data.data[0])
      }else{
        console.log("records not added")
        setPreStore(null)
      }
     
 
    }
    catch(error){
     console.log("data not added")
    }
  }
  fecthingData()
   const handleRefresh = () => fecthingData(); // Refresh on event
 
    window.addEventListener("refreshAddRecordModal", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshAddRecordModal", handleRefresh);
    };
  }, [])

  const handleDownload = async () => {
  try {
    if (!preStore.report) {
      console.error("No report selected");
      return;
    }
 
    const response = await api.get(`${preStore.report}/`, {
      responseType: 'blob',
    });
    console.log("pdf download",response)
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
 
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', preStore.report);
    document.body.appendChild(link);
    link.click();
 
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading the report:', error);
  }
};
 
 
  return (
    <div>
      {preStore  ? (
      <>
          <Container className={Recordprescription.prescriptioncontainer}>
      <Card className={Recordprescription.prescriptioncard}>
        <Card.Body>
          <h5 className={Recordprescription.doctorname}>{selectedPatient.patient_name}</h5>
          <div className='d-flex gap-3'>
            <p className="text-muted">Age:25 years</p>
             Date: {new Date(selectedPatient.created_at).toLocaleDateString()}
          </div>
          <Card className={`border border-light ${Recordprescription.medicinecard}`}>
            <Card.Body className={`${Recordprescription.secondcard}`}>
              <div className='d-flex justify-content-between'>
                <h6 className={Recordprescription.medicinename}>{preStore.medication_name}</h6>
                <p>{preStore.dosage}</p>
              </div>
              <Row>
                <Col xs={12} sm={4} >
                  <p >{preStore.duration}</p>
                  <p >{preStore.summary}</p>
                </Col>
              </Row>

                       
            </Card.Body>
               <div className={`d-flex flex-row justify-content-between ${Recordprescription.file}`}>
                   {preStore.report ? preStore.report.split("/").pop() : "No file available"}
                    <Button variant="link" className="p-0" onClick={handleDownload}>
       <Icon icon="material-symbols:download" width="24" height="24" color="#002072"/></Button>
                </div>
          </Card>
        </Card.Body>
      </Card>
    </Container>
    </>
    ):(
      <div className="text-center mt-5">
      <p style={{ color: "#808080" }}>No Prescription for this patient yet.</p>
    </div>
    )}
    </div>
  )
}
 
export default RecordPrescription