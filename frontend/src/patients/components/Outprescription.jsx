import React from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Prescription.css";

const Outprescription = () => {
  return (
    <Container className="prescription-container">
      <Card className="prescription-card">
        <Card.Body>
          <h5 className="doctor-name">Dr. Michael Chan</h5>
          <p className="date">2024-03-15</p>
          <Card className="medicine-card">
            <Card.Body>
              <h6 className="medicine-name">Vitamin D</h6>
              <Row>
                <Col xs={12} sm={4} className="detail">
                  <p className="label">Dosage</p>
                  <p className="value">2000 IU</p>
                </Col>
                <Col xs={12} sm={4} className="detail">
                  <p className="label">Frequency</p>
                  <p className="value">1x Daily</p>
                </Col>
                <Col xs={12} sm={4} className="detail">
                  <p className="label">Duration</p>
                  <p className="value">30 Days</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <p className="notes">
            <strong>Notes:</strong> Take with breakfast
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Outprescription;
