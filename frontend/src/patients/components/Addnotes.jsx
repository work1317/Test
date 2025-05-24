import { Col, Modal, Row, Container } from 'react-bootstrap';

function Addnotes({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose} centered size="lg" >
      <Modal.Body className="d-flex justify-content-center align-items-center p-lg-5 p-md-3 p-sm-1">
        <Container style={{height:"60vh"}}>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8} className=" border border-secondary rounded bg-white text-center p-3">
              <p className="fw-bold fs-5">John Smith</p>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <p className="m-0">45 Years</p>
                <span className="text-muted">● Male</span> 
                <span className="text-muted">● ID: P001</span> 
              </div>
              <div className="mt-3">
                <p>Billing is due on 12/02/2025</p>
              </div>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default Addnotes;



