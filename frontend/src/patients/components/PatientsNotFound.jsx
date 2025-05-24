import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../css/Printer404.css"; // Ensure you have the corresponding CSS file

const PatientsNotFound = () => {
  return (
    <Container className="printer-container">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} className="trey">
          <div className="top">
            <div className="paper1"></div>
          </div>
          <div className="bottom">
            <div className="inner"></div>
          </div>
          <div className="grey-border"></div>
          <div className="pointer"></div>
          <div className="paper2">
            <div className="e1"></div>
            <div className="e2"></div>
            <div className="e4">
              <div className="e41"></div>
              <div className="text">No patients found</div>
              <div className="e42"></div>
            </div>
            <div className="e5">
              <div className="e51"></div>
              <div className="text">404</div>
              <div className="e52"></div>
            </div>
            <div className="e3"></div>
            <div className="e6"></div>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} md={6} className="body">
          <div className="top-perspective">
            <div className="top"></div>
          </div>
          <div className="bottom"></div>
          <div className="buttons-container">
            <div className="button1"></div>
            <div className="button2"></div>
          </div>
          <div className="button3"></div>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientsNotFound
