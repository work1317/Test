import React, { useEffect, useState } from 'react';
import api from "../../utils/axiosInstance";
import { Row, Col, Alert } from 'react-bootstrap';
import styles from '../css/GProgressNotes.module.css';
import { Icon } from '@iconify/react';

function GProgressNotes({ patient }) {
  const [progress, setProgress] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProgressNotes = async (patientId) => {
    if (!patientId) return;

    try {
      const response = await api.get(`/records/get-progress-note/${patientId}`);
      if (response.data.success === 1) {
        setProgress(response.data.data || []);
        setErrorMessage('');
      } else {
        setProgress([]);
        setErrorMessage(response.data.message || 'No progress notes available.');
      }
    } catch (error) {
      setProgress([]);
      setErrorMessage(error.response?.data?.message || 'Error fetching progress notes.');
    }
  };

  useEffect(() => {
    if (patient?.patient_id) {
      fetchProgressNotes(patient.patient_id);
    }

    const handleRefresh = () => {
      if (patient?.patient_id) {
        fetchProgressNotes(patient.patient_id);
      }
    };

    window.addEventListener("refreshProgressNotes", handleRefresh);
    return () => window.removeEventListener("refreshProgressNotes", handleRefresh);
  }, [patient?.patient_id]); // tightly scoped

  return (
    <div className='mb-4'>
      {errorMessage ? (
        <Alert variant="warning">{errorMessage}</Alert>
      ) : (
        progress.map((note, index) => {
          const [date, timeWithZone] = note.created_at.split('T');
          const time = timeWithZone.split('.')[0].slice(0, 5); // HH:MM format

          return (
            <div key={index} className="mx-4 mb-4">
              <Row>
                <h5>Dr. {patient?.doctor_name || 'Unknown Doctor'}</h5>
              </Row>
              <Row>
                <Col>
                  <span>
                    <Icon icon="weui:time-outlined" width="16" />{' '}
                      {date} {time}
                  </span>
                </Col>
              </Row>
              <Row>
                <p className={styles.nurseNote}>
                  <strong>{note.status}</strong>
                </p>
              </Row>
            </div>
          );
        })
      )}
    </div>
  );




  // return (
  //   <div className='mb-4'>
  //     {errorMessage ? (
  //       <Alert variant="warning">{errorMessage}</Alert>
  //     ) : (
  //       progress.map((note, index) => (
  //         <div key={index} className="mx-4 mb-4">
  //           <Row>
  //             <h5>Dr. {patient?.doctor_name || 'Unknown Doctor'}</h5>
  //           </Row>
  //           <Row>
  //             <Col>
  //               <span><Icon icon="weui:time-outlined" width="16" /> {note.created_at}</span>
  //             </Col>
  //           </Row>
  //           <Row>
  //             <p className={styles.nurseNote}>
  //               <strong>{note.status}</strong>
  //             </p>
  //           </Row>
  //         </div>
  //       ))
  //     )}
  //   </div>
  // );
}

export default GProgressNotes;
