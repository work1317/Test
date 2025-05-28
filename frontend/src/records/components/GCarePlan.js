import React, { useEffect, useState } from 'react';
import { Row, Col, Alert, Card } from 'react-bootstrap';
import styles from '../css/GCarePlan.module.css';
import api from "../../utils/axiosInstance";

function GCarePlan({ patient }) {
  const [plans, setPlans] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fecthingData  = () => {
    if (patient && patient.patient_id) {
      api
        .get(`/records/get-careplan/${patient.patient_id}`)
        .then((response) => {
          if (response.data.success === 1 && Array.isArray(response.data.data)) {
            setPlans(response.data.data);
            setErrorMessage('');
          } else {
            setPlans([]);
            setErrorMessage(response.data.message || 'No care plan found.');
          }
        })
        .catch((error) => {
          const message = error.response?.data?.message || 'Error fetching care plan.';
          setErrorMessage(message);
          setPlans([]);
        });
    }
  }
  fecthingData()
   const handleRefresh = () => fecthingData(); // Refresh on event
 
    window.addEventListener("refreshCarePlan", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshCarePlan", handleRefresh);
    };
  }, [patient]);

  if (errorMessage) {
    
    return (
      <div className='mb-4'>
    <Alert variant="warning">{errorMessage}</Alert>
    </div> 
  );
  }

  return (
    <div className="px-4 mb-4">
      <Row>
              <Col className={styles.title}><span>Care Plan Feedback</span></Col>
      </Row>
      {plans.map((plan, index) => (
          <div key={index}>
          <Row>
            <Col>
              <label className={styles.labels}>Feedback on Services</label>
              <p className={styles.data}>{plan.feedback_on_services || '--'}</p>
            </Col>
          </Row>

          <Row>
            <Col>
              <label className={styles.labels}>Provisional Feedback</label>
              <p className={styles.data}>{plan.provisional_feedback || '--'}</p>
            </Col>
          </Row>

          <Row>
            <Col>
              <label className={styles.labels}>Feedback Plan</label>
              <p className={styles.data}>{plan.feedback_plan || '--'}</p>
            </Col>
          </Row>

          <Row>
            <Col>
              <label className={styles.labels}>Expected Outcome</label>
              <p className={styles.data}>{plan.expected_outcome || '--'}</p>
            </Col>
          </Row>

          <Row>
            <Col>
              <label className={styles.labels}>Preventive Feedback Aspects</label>
              <p className={styles.data}>{plan.preventive_feedback_aspects || '--'}</p>
            </Col>
          </Row>
          </div>
      
      ))}
    </div>
  );
}

export default GCarePlan;
