// import React, { useState, useEffect } from "react";
// import { Modal, Row, Col, Spinner } from "react-bootstrap";
// import api from "../../utils/axiosInstance";
// import styles from "../css/ProcessPrescription.module.css";

// const ProcessPrescription = ({ show, handleClose, patient_id, onUpdate }) => {
//   const [prescriptionData, setPrescriptionData] = useState(null);
//   const [updatedQty, setUpdatedQty] = useState('');
//   const [message, setMessage] = useState("");

//   // Fetch prescription data when patient_id changes
//   useEffect(() => {
//     if (patient_id && show) {
//       setPrescriptionData(null); // Reset data when opening a new modal
//       axios
//         .get(`/records/prescription/${patient_id}/`)
//         .then((response) => {
//           if (response.data.success === 1) {
//             const prescription = response.data.data[0];
//             setPrescriptionData(prescription);
//           } else {
//             alert("Failed to fetch prescription details.");
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching prescription:", error);
//         });
//     }
//   }, [patient_id, show]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!prescriptionData) return;

//     try {
//       // Only send quantity and medication_name in the updated data
//       const updatedData = {
//         quantity: parseInt(updatedQty) || prescriptionData.quantity,  // updated quantity
//         medication_name: prescriptionData.medication_name,  // medication name remains the same
//       };

//       const response = await api.put(
//         `/records/prescription/${patient_id}/`,
//         updatedData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       setMessage("Prescription processed successfully");
//       if (onUpdate) onUpdate(response.data);
//       handleClose();
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       setMessage("Failed to process prescription");
//     }
//   };

//   // Only render if modal is shown
//   if (!show) return null;

//   return (
//     <Modal show={show} onHide={handleClose} centered size="lg" backdrop="static" keyboard={false}>
//       <Modal.Header closeButton>
//         <Modal.Title>Process Prescription</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {!prescriptionData ? (
//           <div className="text-center my-4">
//             <Spinner animation="border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//             <p className="mt-2">Fetching prescription...</p>
//           </div>
//         ) : (
//           <>
//             <div className={`p-2 ${styles.medicinecard}`}>
//               <Row>
//                 <Col><span>{prescriptionData.patient_name}</span></Col>
//                 <Col className="text-end" xs="auto">Date: {new Date().toLocaleDateString()}</Col>
//               </Row>
//               <Row>
//                 <p className="text-muted">Prescription ID: {patient_id}</p>
//               </Row>
//               <div className={`p-4 ${styles.medicine}`}>
//                 <Row>
//                   <Col><h6 className="mb-0">{prescriptionData.medication_name}</h6></Col>
//                   <Col xs="auto" className="d-flex align-items-center ms-3">
//                     <p className="mb-0 me-3">{prescriptionData.dosage}</p>
//                     <div
//                       style={{
//                         backgroundColor: '#CFDEFF',
//                         borderRadius: '20px',
//                         padding: '2px 10px',
//                         display: 'flex',
//                         alignItems: 'center',
//                       }}
//                     >
//                       <span style={{ fontSize: '12px', marginRight: '4px', color: '#2563EB' }}>Qty:</span>
//                       <input
//                         type="number"
//                         placeholder="0"
//                         value={updatedQty}
//                         onChange={(e) => setUpdatedQty(e.target.value)}
//                         style={{
//                           border: 'none',
//                           outline: 'none',
//                           background: 'transparent',
//                           width: '45px',
//                           textAlign: 'center',
//                           fontSize: '14px',
//                           color: '#2563EB',
//                         }}
//                       />
//                     </div>
//                   </Col>
//                 </Row>
//                 <Row className="mt-2">
//                   <p className="text-muted">{prescriptionData.summary}</p>
//                 </Row>
//                 <Row>
//                   <Col><span className="text-muted">Stock Available</span></Col>
//                   <Col xs="auto"><span style={{ color: '#16A34A' }}>{prescriptionData.stock_quantity} units</span></Col>
//                 </Row>
//               </div>
//             </div>

//             {message && <p className="text-center mt-3">{message}</p>}

//             <Row>
//               <Col className="text-end p-1 me-1">
//                 <button className={`m-4 ${styles.cancel}`} onClick={handleClose}>Cancel</button>
//                 <button className={styles.complete} onClick={handleSubmit}>Complete Processing</button>
//               </Col>
//             </Row>
//           </>
//         )}
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default ProcessPrescription;



// import React, { useState } from 'react';
// import api from "../../utils/axiosInstance";
// import { Modal, Button, Form } from 'react-bootstrap';

// function ProcessPrescription({ show, handleClose, patient_id, onUpdate }) {
//   const [quantity, setQuantity] = useState('');
//   const [status, setStatus] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async () => {
//     if (!quantity || !status) {
//       setError('Please fill in all fields');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // Assuming your backend expects a PUT request to update prescription
//       const response = await api.put(
//         `/records/prescription/${patient_id}/`,
//         {
//           quantity,
//           status,
//         }
//       );

//       if (response.data.success) {
//         if (onUpdate) onUpdate();  // Trigger fetchPrescriptions in PharmacyPrescription
//         handleClose();  // Close the modal
//       }
//     } catch (err) {
//       setError('Failed to process prescription');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={handleClose}>
//       <Modal.Header closeButton>
//         <Modal.Title>Process Prescription</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {error && <div className="text-danger">{error}</div>}
//         <Form>
//           <Form.Group controlId="quantity">
//             <Form.Label>Quantity</Form.Label>
//             <Form.Control
//               type="number"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//             />
//           </Form.Group>

//           <Form.Group controlId="status" className="mt-3">
//             <Form.Label>Status</Form.Label>
//             <Form.Select
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//             >
//               <option value="">Select Status</option>
//               <option value="completed">Completed</option>
//               <option value="pending">Pending</option>
//               <option value="processing">Processing</option>
//             </Form.Select>
//           </Form.Group>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={handleSubmit} disabled={loading}>
//           {loading ? 'Processing...' : 'Submit'}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// }

// export default ProcessPrescription;
import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Spinner } from "react-bootstrap";
import api from "../../utils/axiosInstance";
import styles from "../css/ProcessPrescription.module.css";

const ProcessPrescription = ({ show, handleClose, patient_id, onUpdate }) => {
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [updatedQty, setUpdatedQty] = useState('');
  const [message, setMessage] = useState("");

  // Fetch prescription data when patient_id changes
  useEffect(() => {
    if (patient_id && show) {
      setPrescriptionData(null); // Reset data when opening a new modal
      api
        .get(`/records/prescription/${patient_id}/`)
        .then((response) => {
          console.log("get prescription modal",response)
          if (response.data.success === 1) {
            const prescription = response.data.data[0];
            setPrescriptionData(prescription);
          } else {
            alert("Failed to fetch prescription details.");
          }
        })
        .catch((error) => {
          console.error("Error fetching prescription:", error);
        });
    }
  }, [patient_id, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prescriptionData) return;

    try {
      // Send the updated quantity and medication name, along with the updated status
      // const updatedData = {
      //   quantity: parseInt(updatedQty) || prescriptionData.quantity,  // updated quantity
      //   medication_name: prescriptionData.medication_name, 
      //   status: "completed" // medication name remains the same
      // };
      const updatedData = {
        quantity: parseInt(updatedQty) || prescriptionData.quantity,
        medication_name: prescriptionData.medication_name
      };
      console.log(updatedData)

      // Send PUT request to update the prescription
      const response = await api.put(
        `/records/prescription/${patient_id}/`,updatedData);


      
      setMessage("Prescription processed successfully", response.data.data);
      console.log(response.data.data)
      if (onUpdate) onUpdate();  // Callback to update the prescription list in parent
      handleClose();  // Close the modal
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Failed to process prescription");
    }
  };

  // Only render if modal is shown
  if (!show) return null;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Process Prescription</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!prescriptionData ? (
          <div className="text-center my-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Fetching prescription...</p>
          </div>
        ) : (
          <>
            <div className={`p-2 ${styles.medicinecard}`}>
              <Row>
                <Col><span>{prescriptionData.patient_name}</span></Col>
                <Col className="text-end" xs="auto">Date: {new Date().toLocaleDateString()}</Col>
              </Row>
              <Row>
                <p className="text-muted">Prescription ID: {patient_id}</p>
              </Row>
              <div className={`p-4 ${styles.medicine}`}>
                <Row>
                  <Col><h6 className="mb-0">{prescriptionData.medication_name}</h6></Col>
                  <Col xs="auto" className="d-flex align-items-center ms-3">
                    <p className="mb-0 me-3">{prescriptionData.dosage}</p>
                    <div
                      style={{
                        backgroundColor: '#CFDEFF',
                        borderRadius: '20px',
                        padding: '2px 10px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '12px', marginRight: '4px', color: '#2563EB' }}>Qty:</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={updatedQty}
                        onChange={(e) => setUpdatedQty(e.target.value)}
                        style={{
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          width: '45px',
                          textAlign: 'center',
                          fontSize: '14px',
                          color: '#2563EB',
                        }}
                      />
                    </div>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <p className="text-muted">{prescriptionData.summary}</p>
                </Row>
                <Row>
                  <Col><span className="text-muted">Stock Available</span></Col>
                  <Col xs="auto"><span style={{ color: '#16A34A' }}>{prescriptionData.stock_quantity || '0'} units</span></Col>
                </Row>
              </div>
            </div>

            {message && <p className="text-center mt-3">{message}</p>}

            <Row>
              <Col className="text-end p-1 me-1">
                <button className={`m-4 ${styles.cancel}`} onClick={handleClose}>Cancel</button>
                <button className={styles.complete} onClick={handleSubmit}>Complete Processing</button>
              </Col>
            </Row>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ProcessPrescription;

