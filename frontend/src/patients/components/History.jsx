import React from "react";
import { Container, Card, ListGroup, CardBody } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/History.css";

const History = () => {
  const history = [
    "Appendectomy - 2023",
    "Hypertension - Diagnosed 2020",
    "Allergic to Penicillin",
  ];

  return (
    <Container className="history-container">
      <Card className="history-card" size="lg">
        <CardBody>
          <ListGroup variant="flush">
            {history.map((item, index) => (
              <ListGroup.Item
                key={index}
                className={`history-item ${index === history.length - 0 ? "active-item" : ""}`}
              >
                <span className="bullet">●</span> {item}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </CardBody>
      </Card>
    </Container>
  );
};

export default History;
