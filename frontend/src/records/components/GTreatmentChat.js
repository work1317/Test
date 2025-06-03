import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";
import styles from '../css/GTreatmentChat.module.css';  // assuming CSS module is here
import api from "../../utils/axiosInstance";

function GTreatmentChat({ patient }) {
  const [treatmentData, setTreatmentData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fecthingData = () => {
    if (patient && patient.patient_id) {
      api
        .get(`/records/get-treatment-chart/${patient.patient_id}`)
        .then((response) => {
          if (response.data.success === 1) {
            setTreatmentData(response.data.data || []);
            setErrorMessage('');
            console.log(response.data.data)
          } else {
            setTreatmentData([]);
            setErrorMessage(response.data.message || 'No treatment data available.');
          }
        })
        .catch((error) => {
          if (error.response && error.response.data && error.response.data.message) {
            setErrorMessage(error.response.data.message);
          } else {
            setErrorMessage('Error fetching treatment chart data.');
          }
          setTreatmentData([]);
        });
    }
  }
    fecthingData();

    const handleRefresh = () => fecthingData(); // Refresh on event
 
    window.addEventListener("refreshTreatmentChat", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshTreatmentChat", handleRefresh);
    };
  }, [patient]);

  return (
    <div className='mb-4'>
      {errorMessage ? (
        <Alert variant="warning">{errorMessage}</Alert>
      ) : (
        <div>
        <div className='mx-4 my-1 mb-3'>
        <Row>
          <h5>{patient?.patient_name || 'Unknown Patient'}</h5>
        </Row>
        <Row>
          <Col>
            <span>Age: {patient?.age || '--'} years </span>
            <span className='pl-3'> Date: {new Date(patient?.created_at).toLocaleDateString('en-GB')}</span>
          </Col>
        </Row>
      </div>
        <div className={`mx-4 ${styles.scrollContainer}`}>
          {treatmentData.map((item, index) => (
            <Card key={index} className={`p-3 mb-4 ${styles.medicine}`}>
              <Row className="align-items-center">
                <Col>
                  <h6 className="mb-0">{item.medicine_name}</h6>
                  <p className="text-muted mb-1">
                    <Icon icon="weui:time-outlined" width="16" /> {item.time}
                  </p>
                  <p className="mb-0">{item.medicine_details}</p>
                </Col>
                <Col xs="auto">
                  <span className="text-muted">{item.dose}</span>
                </Col>
              </Row>
              <div className="mt-2">
                <span className="badge bg-light text-dark border border-secondary rounded p-2">
                  {item.hrs_drops_mins}
                </span>
              </div>
            </Card>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}

export default GTreatmentChat;

