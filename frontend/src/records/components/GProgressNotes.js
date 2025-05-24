import React, { useEffect, useState } from 'react';
import api from "../../utils/axiosInstance";
import { Row, Col, Alert } from 'react-bootstrap';
import styles from '../css/GProgressNotes.module.css';
import { Icon } from '@iconify/react';

function GProgressNotes({ patient }) {
  const [progress, setProgress] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fectgingData = () => {
    if (patient && patient.patient_id) {
      api
        .get(`/records/get-progress-note/${patient.patient_id}`)
        .then((response) => {
          if (response.data.success === 1) {
            setProgress(response.data.data || []);
            setErrorMessage('');
          } else {
            setProgress([]);
            setErrorMessage(response.data.message || 'No progress notes available.');
          }
        })
        .catch((error) => {
          if (error.response?.data?.message) {
            setErrorMessage(error.response.data.message);
          } else {
            setErrorMessage('Error fetching progress notes.');
          }
          setProgress([]);
        });
    }
  }
  const interval = setInterval(fectgingData, 1000);
  
  return () =>  clearInterval(interval)
  }, [patient]);

  return (
    <div className='mb-4'>
      {errorMessage ? (
        <div>
                    <Alert variant="warning">{errorMessage}</Alert>
          </div>
      ) : (
        progress.map((note, index) => (
          <div key={index} className="mx-4 mb-4">
            <Row>
          <h5>Dr. {patient?.doctor_name || 'Unknown Doctor'}</h5>
        </Row>
            <Row>
              <Col>
                <span><Icon icon="weui:time-outlined" width="16" /> {note.created_at}</span>
              </Col>
            </Row>
            <Row>
              <p className={styles.nurseNote}>
                <strong>{note.status}</strong>
              </p>
            </Row>
          </div>
        ))
      )}
    </div>
  );
}

export default GProgressNotes;
