import React, { useEffect, useState } from 'react';
import api from "../../utils/axiosInstance";
import { Row, Col, Alert } from 'react-bootstrap';
import styles from '../css/GNursingNotes.module.css';
import { Icon } from '@iconify/react';

function GNursingNotes({ patient }) {
  const [notes, setNotes] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fecthingData = () => {
    if (patient && patient.patient_id) {
      api
        .get(`/records/get-nursing-notes/${patient.patient_id}`)
        .then((response) => {
          if (response.data.success === 1) {
            setNotes(response.data.data || []);
            setErrorMessage('');
            console.log("Nursing Note : ", response.data)
          } else {
            setNotes([]);
            setErrorMessage(response.data.message || 'No nursing notes available.');
          }
        })
        .catch((error) => {
          if (error.response?.data?.message) {
            setErrorMessage(error.response.data.message);
          } else {
            setErrorMessage('Error fetching nursing notes.');
          }
          setNotes([]);
        });
    }
  }
  fecthingData();

  const handleRefresh = () => fecthingData(); // Refresh on event
 
    window.addEventListener("refreshNursingNote", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshNursingNote", handleRefresh);
    };
  }, [patient]);

  return (
    <div className='mb-4'>
      {errorMessage ? (
        <Alert variant="warning">{errorMessage}</Alert>
      ) : (
        notes.map((note, index) => (
          <div key={index} className="mb-3">
            <Row>
              <h4> {note.nurse} </h4>
            </Row>
            <Row>
              <Col>
                <span>
                  <Icon icon="weui:time-outlined" width="16" /> {note.created_at}
                </span>
              </Col>
            </Row>
            <Row>
              <p className={styles.nurseNote}>{note.description}</p>
            </Row>
          </div>
        ))
      )}
    </div>
  );
}

export default GNursingNotes;
