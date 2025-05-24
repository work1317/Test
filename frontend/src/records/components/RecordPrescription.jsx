import React, { useState,  useContext} from 'react'
import { Container, Card, Row, Col } from "react-bootstrap";
import Recordprescription from '../css/RecordPrescription.module.css';
import api from "../../utils/axiosInstance";
import { doctors } from './RecordLab';
 
function RecordPrescription() {
   const {selectedPatient}  =  useContext(doctors)
  const [preStore, setPreStore] =  useState([]);
 
  useState(() =>{
    const fecthingData = async() => {
    try{
      const response  =  await api.get(`/records/records/?record_type=prescription&patient_id=${selectedPatient.patient_id}`);
      // console.log(response.data.data)
 
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
  }, [])
 
 
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
            <p className="text-muted">Date:{selectedPatient.date}</p>
          </div>
          <Card className={`border border-light ${Recordprescription.medicinecard}`}>
            <Card.Body className={`  ${Recordprescription.secondcard}`}>
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