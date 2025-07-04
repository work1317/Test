import React, { useEffect, useState } from 'react';
import api from "../../utils/axiosInstance";
import { Row, Col, Alert } from 'react-bootstrap';
import styles from '../css/GInitialAssesment.module.css';

function GInitialAssesment({ patient }) {
  const [assessment, setAssessment] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAssessment = () => {
      if (patient?.patient_id) {
        api
          .get(`/records/get-initial-assessment/${patient.patient_id}`)
          .then((response) => {
            if (response.data.success === 1 && response.data.data) {
              setAssessment(response.data.data);
              setMessage('');
            } else {
              setAssessment(null);
              setMessage(response.data.message || 'No assessment data found.');
            }
          })
          .catch((error) => {
            setAssessment(null);
            setMessage(
              error.response?.data?.message || 'Failed to fetch initial assessment.'
            );
          });
      }
    };

    fetchAssessment();

    const handleRefresh = () => fetchAssessment();
    window.addEventListener("refreshInitialAssessment", handleRefresh);

    return () => {
      window.removeEventListener("refreshInitialAssessment", handleRefresh);
    };
  }, [patient]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
  };

  if (message && !assessment) {
    return (
      <div className='mb-4'>
        <Alert variant="warning">{message}</Alert>
      </div>
    );
  }

  if (!assessment) {
    return <p className="mx-4 my-3">Loading...</p>;
  }

  return (
    <div className='px-4 mb-4'>
      <Row>
        <Col className={styles.title}><span>Initial Assessment</span></Col>
      </Row>

      <Row>
        <Col>
          <label className={styles.labels}>Rating Title</label>
          <p className={styles.firstRow}>{assessment.rating_title}</p>
        </Col>
        <Col>
          <label className={styles.labels}>Relationship to Feedback</label>
          <p className={styles.firstRow}>{assessment.relationship_to_feedback}</p>
        </Col>
        <Col>
          <label className={styles.labels}>Date</label>
          <p className={styles.firstRow}>{formatDate(assessment.created_at)}</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <label className={styles.labels}>Duration of Experience</label>
          <p className={` text-break ${styles.data}`}>{assessment.duration_of_experience}</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <label className={styles.labels}>Present Illness</label>
          <p className={` text-break ${styles.data}`}>{assessment.present_illness}</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <label className={styles.labels}>Past Illness</label>
          <p className={` text-break ${styles.data}`}>{assessment.past_illness}</p>
        </Col>
      </Row>

      <Row>
        <Col className={styles.title}>Family Feedback</Col>
      </Row>

      <Row>
        {assessment.experience_feedback && (
          <Col>
            <input className={styles.customCheckbox} type='checkbox' checked readOnly />
            <label className={styles.labels}>Experience Feedback</label>
            <p className={`text-break ${styles.feedback}`}>{assessment.experience_feedback}</p>
          </Col>
        )}
        {assessment.health_feedback && (
          <Col>
            <input className={styles.customCheckbox} type='checkbox' checked readOnly />
            <label className={styles.labels}>Health Feedback</label>
            <p className={`text-break ${styles.feedback}`}>{assessment.health_feedback}</p>
          </Col>
        )}
      </Row>

      <Row>
        {assessment.heart_feedback && (
          <Col>
            <input className={styles.customCheckbox} type='checkbox' checked readOnly />
            <label className={styles.labels}>Heart Feedback</label>
            <p className={`text-break ${styles.feedback}`}>{assessment.heart_feedback}</p>
          </Col>
        )}
        {assessment.stroke_feedback && (
          <Col>
            <input className={styles.customCheckbox} type='checkbox' checked readOnly />
            <label className={styles.labels}>Stroke Feedback</label>
            <p className={`text-break ${styles.feedback}`}>{assessment.stroke_feedback}</p>
          </Col>
        )}
      </Row>

      {assessment.other_feedback && (
        <Row>
          <Col>
            <input className={styles.customCheckbox} type='checkbox' checked readOnly />
            <label className={styles.labels}>Other Feedback</label>
            <p className={` ${styles.otherfeedback} text-break`}>{assessment.other_feedback}</p>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default GInitialAssesment;
