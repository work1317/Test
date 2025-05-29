import api from "../../utils/axiosInstance";
import { useEffect, useState } from 'react';
import { Container, Card, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Prescription.css";

const Prescription = ({ patient_id }) => {
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get(`/records/prescription/${patient_id}`)
      .then(response => {
        if (response.data.success === 1) {
          setData(response.data.data);  // Array of prescriptions
        } else {
          setErrorMessage(response.data.message);
        }
      })
      .catch(error => {
        setErrorMessage('Error fetching prescription data');
        console.error('Error fetching prescription:', error);
      });
  }, [patient_id]);

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }

  if (!data) return <div>Loading...</div>;
  console.log(data)

  return (
    <Container className="prescription-container">
      {data.length === 0 ? (
        <div>No prescriptions found for this patient.</div>
      ) : (
        data.map((prescription, index) => (
          <Card key={index} className="prescription-card">
            <Card.Body>
              <h5 className="doctor-name">{prescription.doctor_name}</h5>
              <p className="date">{new Date(prescription.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}</p>
              <Card className="medicine-card">
                <Card.Body>
                  <h6 className="medicine-name">{prescription.medication_name}</h6>
                  <Row>
                    <Col xs={12} sm={4} className="detail">
                      <p className="label">Dosage</p>
                      <p className="value">{prescription.dosage}</p>
                    </Col>
                    <Col xs={12} sm={4} className="detail">
                      {/* Uncomment if needed */}
                      {/* <p className="label">Frequency</p>
                      <p className="value">{prescription.frequency}</p> */}
                    </Col>
                    <Col xs={12} sm={4} className="detail">
                      <p className="label">Duration</p>
                      <p className="value">{prescription.duration}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <p className="notes">
                <strong>Notes:</strong> {prescription.summary}
              </p>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Prescription;
