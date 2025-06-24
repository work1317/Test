// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
// import styles from "../css/InvoiceGenerator.module.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Recentinvoice from "./Recentinvoice";
// import { Icon } from "@iconify/react";
// import InvoicePrint from "./InvoicePrint";
// import axios from "axios"; // Add axios for API call
// import api from "../../utils/axiosInstance";
// import { useNotifications } from "../../dashboard/components/NotificationContext";

// export default function InvoiceGenerator() {
//   const { fetchNotifications, onNotificationClick } = useNotifications();
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [dueOnReceipt, setDueOnReceipt] = useState("");
//   const [note, setNote] = useState("");
//   const [show, setShow] = useState(true);
//   const [formData, setFormData] = useState({
//     service: "",
//     days: "",
//     amount: 0,
//   });
//   const [store, setStore] = useState([]);
//   const [investigationCharges, setInvestigationCharges] = useState(0);
//   const [investigationDates, setInvestigationDates] = useState({from: null, to: null});
//   const [pharmacyCharges, setPharmacyCharges] = useState(0);
//   const [pharmacyDates, setPharmacyDates] = useState({ from: null, to: null });
//   const [consultationCharges, setConsultationCharges] = useState({
//   visits: "",
//   amountPerVisit: "", // default as string "0"
// });
//   const [showPrintModal, setShowPrintModal] = useState(false);
//   const [concession, setConcession] = useState(0); // Added concession state
//   const [patientId, setPatientId] = useState(""); // State for patient ID
//   const [invoiceId, setInvoiceId] = useState(""); // state for Invoice ID
//   const [patientData, setPatientData] = useState(null);
//   const [invoiceData, setInvoiceData] = useState(null); // State for patient data

//   useEffect(() => {
//     if (patientId) {
//       api
//         .get(`invoice/create-invoice/?patient_id=${patientId}`)
//         .then((response) => {
//           console.log("get patient details", response);
//           setPatientData(response.data.data);
//         })
//         .catch((error) => {
//           console.error("Error fetching patient data:", error);
//           setPatientData(null);
//         });
//     } else {
//       setPatientData(null);

//       // Optional: Reset other related fields
//       setFormData({ service: "", days: "", amount: 0});
//       setStore([]);
//       setInvestigationDates({ from: null, to: null });
//       setInvestigationCharges(0);
//       setPharmacyDates({ from: null, to: null });
//       setPharmacyCharges(0);
//       setConsultationCharges({ visits: 0, amountPerVisit: 0 });
//       setConcession(0);
//       setDueOnReceipt("");
//       setIsPaymentMethodDisabled(false);
//       setPaymentMethod("");
//       setNote("");
//     }
//   }, [patientId]);

//   const [isPaymentMethodDisabled, setIsPaymentMethodDisabled] = useState(false);

//   const handlePaymentTermsChange = (e) => {
//     const value = e.target.value;
//     // Disable Payment Method if "Yes" is selected
//     setIsPaymentMethodDisabled(value === "yes");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       patient: patientId,
//       due_on_receipt: dueOnReceipt,
//       payment_method: paymentMethod,
//       notes: note,
//       concession: Number(concession).toFixed(2),
//       service_charges: store.map((item) => ({
//         service_name: item.service,
//         days: Number(item.days),
//         amount: Number(item.amount).toFixed(2),
//       })),
//       investigation_charges: {
//         from_date: investigationDates.from,
//         to_date: investigationDates.to,
//         amount:
//           investigationCharges === ""
//             ? "0.00"
//             : Number(investigationCharges).toFixed(2),
//       },
//       pharmacy_charges: {
//         from_date: pharmacyDates.from,
//         to_date: pharmacyDates.to,
//         amount:
//           pharmacyCharges === ""
//             ? "0.00"
//             : Number(pharmacyCharges).toFixed(2),
//       },
//       consultation_charges: {
//         no_of_visits: Number(consultationCharges.visits || 0),
//         amount_per_visit: Number(consultationCharges.amountPerVisit || 0).toFixed(
//           2
//         ),
//       },
//     };

//     try {
//       const response = await api.post("invoice/create-invoice/", payload);
//       await fetchNotifications();
//       await onNotificationClick();

//       const invoice = response.data.data; // ✅ Move this line inside the try block
//       setInvoiceData(invoice);
//       setPatientId(invoice?.invoice?.patient || "");
//       setInvoiceId(invoice?.invoice?.id || ""); // ✅ Set invoice ID

//       alert(response.data?.message || "Invoice created successfully!");

//       setShowPrintModal(false); // You might want to set this to true if you're opening the modal
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message ||
//         "Failed to create invoice. Please try again.";
//       alert(errorMessage);
//       console.error(
//         "Invoice creation error:",
//         error.response?.data || error.message
//       );
//     }
//   };

//   // Handle print modal open and close
//   const handlePrintOpen = () => {
//     setShowPrintModal(true);
//     console.log("click");
//   };
//   const handlePrintClose = () => {
//     setShowPrintModal(false);
//   };

//   const handlerShow = () => setShow(!show);
//   const handlerClose = () => setShow(!show);

//   // Handle input changes for service, days, and amount
//   const handlerChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Submit the form and add service to the store
//   const formSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.service || !formData.days || !formData.amount) return;
//     setStore([...store, formData]);
//     setFormData({ service: "", days: "", amount: "" });
//   };

//   // Calculate days between from and to dates
//   const calculateDays = (from, to) => {
//     if (!from || !to) return "-";
//     const fromDate = new Date(from);
//     const toDate = new Date(to);
//     const diffTime = toDate - fromDate;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//     return diffDays > 0 ? diffDays : "-";
//   };

//   // Calculate the total amount including service, investigation, pharmacy, and consultation
//   const calculateTotal = () => {
//     const serviceTotal = store.reduce(
//       (acc, item) => acc + Number(item.amount || 0),
//       0
//     );
//     const consultationTotal =
//       consultationCharges.visits * consultationCharges.amountPerVisit;
//         return Number(
//         serviceTotal +
//         Number(investigationCharges || 0) +
//         Number(pharmacyCharges || 0) +
//         consultationTotal
//       ).toFixed(2);

//         };

//   // Calculate the final amount after concession
//   const calculateFinalAmount = () => {
//     return (calculateTotal() - concession).toFixed(2);
//   };

//   return (
//     <>
//       {show ? (
//         <Container fluid className={styles.invoiceContainer}>
//           <div className={styles.header}>
//             <div className={styles.para}>
//               <h2>Generate Invoice</h2>
//               <p>Create and Manage patient invoices</p>
//             </div>
//             <div className={styles.actionButtons}>
//               <button className={styles.btn} onClick={handlerShow}>
//                 <Icon icon="mdi:recent" width="16px" height="16px" /> Recent
//                 Invoices
//               </button>
//               <button onClick={handleSubmit} className={styles.btn}>
//                 <Icon icon="carbon:rule-draft" width="15px" /> Save
//               </button>
//               <button className={styles.btn} onClick={handlePrintOpen}>
//                 <Icon icon="material-symbols-light:print-outline-rounded" />{" "}
//                 Print
//               </button>
//               {showPrintModal && invoiceData && (
//                 <InvoicePrint
//                   show={showPrintModal}
//                   handlePrintClose={() => setShowPrintModal(false)}
//                   invoiceData={invoiceData} // pass full invoice data
//                   // patientId={invoiceData.invoice?.patient || ""} // pass patientId safely
//                   invoiceId={invoiceId}
//                 />
//               )}
//             </div>
//           </div>

//           <Row>
//             {/* Left Column */}
//             <Col md={6}>
//               {/* Patient Details */}
//               <Card className={styles.card}>
//                 <Card.Body>
//                   <h5>Patient Details</h5>
//                   <Row className="mb-2">
//                     <Col>
//                       <Form.Label>Patient Id</Form.Label>
//                       <Form.Control
//                         placeholder="Enter Patient ID"
//                         value={patientId}
//                         onChange={(e) => {
//                           const newId = e.target.value;
//                           setPatientId(newId);

//                           // Reset all related form states
//                           setPatientData(null);
//                           setFormData({ service: "", days: "", amount: 0});
//                           setStore([]);
//                           setInvestigationDates({ from: null, to: null });
//                           setInvestigationCharges(0);
//                           setPharmacyDates({ from: null, to: null });
//                           setPharmacyCharges(0);
//                           setConsultationCharges({
//                             visits: 0,
//                             amountPerVisit: 0,
//                           });
//                           setConcession(0);
//                           setDueOnReceipt("");
//                           setIsPaymentMethodDisabled(false);
//                           setPaymentMethod("");
//                           setNote("");
//                         }}
//                       />
//                     </Col>

//                     <Col>
//                       <Form.Label>Patient Name</Form.Label>
//                       <Form.Control
//                         placeholder="Patient Name"
//                         value={patientData?.patient_name || ""}
//                         readOnly
//                       />
//                     </Col>
//                   </Row>
//                   <Row className="mb-2">
//                     <Col>
//                       <Form.Label>Appointment Type</Form.Label>
//                       <Form.Control
//                         placeholder="Appointment Type"
//                         value={patientData?.appointment_type || ""}
//                         readOnly
//                       />
//                     </Col>
//                   </Row>
//                   <Row className="mb-2">
//                     <Col>
//                       <Form.Label>Age</Form.Label>
//                       <Form.Control
//                         placeholder="Age"
//                         value={patientData?.age || ""}
//                         readOnly
//                       />
//                     </Col>
//                     <Col>
//                       <Form.Label>Sex</Form.Label>
//                       <Form.Control
//                         placeholder="Sex"
//                         value={patientData?.gender || ""}
//                         readOnly
//                       />
//                     </Col>
//                     <Col>
//                       <Form.Label>Mobile</Form.Label>
//                       <Form.Control
//                         placeholder="Mobile"
//                         value={patientData?.mobile_number || ""}
//                         readOnly
//                       />
//                     </Col>
//                   </Row>
//                   <Row>
//                     <Col>
//                       <Form.Label>Doctor</Form.Label>
//                       <Form.Control
//                         placeholder="Doctor"
//                         value={patientData?.doctor_name || ""}
//                         readOnly
//                       />
//                     </Col>
//                     <Col>
//                       <Form.Label>Room Number</Form.Label>
//                       <Form.Control
//                         placeholder="Room Number"
//                         value={patientData?.ward || ""}
//                         readOnly
//                       />
//                     </Col>
//                   </Row>
//                 </Card.Body>
//               </Card>

//               {/* Service Charges */}
//               <Card className={styles.card}>
//                 <Card.Body>
//                   <div className="d-flex justify-content-between align-items-center ">
//                     <h6>Service Charges</h6>
//                     <button className={styles.addservice} onClick={formSubmit}>
//                       + Add Service
//                     </button>
//                   </div>
//                   <Row className="mb-2">
//                     <Col>
//                       <Form.Label>Service Name</Form.Label>
//                       <Form.Control
//                         value={formData.service}
//                         name="service"
//                         onChange={handlerChange}
//                         placeholder="Enter Service Name"
//                       />
//                     </Col>
//                     <Col>
//                       <Form.Label>Days</Form.Label>
//                       <Form.Control
//                         type="number"
//                         value={formData.days}
//                         name="days"
//                         onChange={handlerChange}
//                         placeholder="days"
//                       />
//                     </Col>
//                     <Col>
//                       <Form.Label>Amount</Form.Label>
//                       <Form.Control
//                         type="number"
//                         value={formData.amount}
//                         name="amount"
//                         onChange={handlerChange}
//                       />
//                     </Col>
//                   </Row>
//                   {store.length > 0 && (
//                     <>
//                       <Row>
//                         <Col>
//                           <strong>Service</strong>
//                         </Col>
//                         <Col>
//                           <strong>Days</strong>
//                         </Col>
//                         <Col>
//                           <strong>Amount</strong>
//                         </Col>
//                       </Row>
//                       {store.map((item, idx) => (
//                         <Row key={idx}>
//                           <Col>{item.service}</Col>
//                           <Col>{item.days}</Col>
//                           <Col>{Number(item.amount).toFixed(2)}</Col>
//                         </Row>
//                       ))}
//                     </>
//                   )}
//                 </Card.Body>
//               </Card>

//               {/* Other Charges */}
//               <Card className={styles.card}>
//                 <Card.Body>
//                   <h6>Other Charges</h6>

//                   <p className={styles.subTitle}>Investigation Charges</p>
//                   <Row className="mb-2">
//                     <Col className="col-sm-4">
//                       <Form.Label>From Date</Form.Label>
//                       <Form.Control
//                         type="date"
//                         value={investigationDates.from}
//                         onChange={(e) =>
//                           setInvestigationDates({
//                             ...investigationDates,
//                             from: e.target.value,
//                           })
//                         }
//                       />
//                     </Col>
//                     <Col className="col-sm-4">
//                       <Form.Label>To Date</Form.Label>
//                       <Form.Control
//                         type="date"
//                         value={investigationDates.to}
//                         onChange={(e) =>
//                           setInvestigationDates({
//                             ...investigationDates,
//                             to: e.target.value,
//                           })
//                         }
//                       />
//                     </Col>
//                    <Col className="col-sm-4">
//                         <Form.Label>Amount</Form.Label>
//                         <Form.Control
//                           type="text"
//                           placeholder="Amount"
//                           value={investigationCharges}
//                           onChange={(e) => {
//                             let val = e.target.value;

//                             // Allow empty input
//                             if (val === "") {
//                               setInvestigationCharges("");
//                               return;
//                             }

//                             // Only allow digits
//                             if (/^\d+$/.test(val)) {
//                               // Remove leading zeros except if single zero
//                               val = val.replace(/^0+(?=\d)/, "");
//                               setInvestigationCharges(val);
//                             }
//                           }}
//                         />
//                       </Col>

//                   </Row>

//                   <p className={styles.subTitle}>Pharmacy Charges</p>
//                   <Row className="mb-2">
//                     <Col className="col-sm-4">
//                       <Form.Label>From Date</Form.Label>
//                       <Form.Control
//                         type="date"
//                         value={pharmacyDates.from}
//                         onChange={(e) =>
//                           setPharmacyDates({
//                             ...pharmacyDates,
//                             from: e.target.value,
//                           })
//                         }
//                       />
//                     </Col>
//                     <Col className="col-sm-4">
//                       <Form.Label>To Date</Form.Label>
//                       <Form.Control
//                         type="date"
//                         value={pharmacyDates.to}
//                         onChange={(e) =>
//                           setPharmacyDates({
//                             ...pharmacyDates,
//                             to: e.target.value,
//                           })
//                         }
//                       />
//                     </Col>
//                    <Col className="col-sm-4">
//                       <Form.Label>Amount</Form.Label>
//                       <Form.Control
//                         type="text" // changed to "text" to allow custom control
//                         placeholder="Amount"

//                         value={pharmacyCharges}
//                         onChange={(e) => {
//                           let val = e.target.value;

//                           // Allow empty input
//                           if (val === "") {
//                             setPharmacyCharges("");
//                             return;
//                           }

//                           // Only allow digits
//                           if (/^\d+$/.test(val)) {
//                             // Remove leading zeros except if single zero
//                             val = val.replace(/^0+(?=\d)/, "");
//                             setPharmacyCharges(val);
//                           }
//                         }}
//                       />
//                     </Col>

//                   </Row>

//                   <p className={styles.subTitle}>Consultation Charges</p>

//                   <Row>
//                     <Col>
//                          <Form.Label>No.of Visits</Form.Label>
//                       <Form.Control
//                           type="number"
//                           placeholder="Enter number of visits"
//                           value={consultationCharges.visits}
//                           onChange={(e) => {
//                             const value = e.target.value;

//                             // Remove leading zeros unless it's "0" or empty
//                             const cleaned = value.replace(/^0+(?=\d)/, "");

//                             setConsultationCharges({
//                               ...consultationCharges,
//                               visits: cleaned,
//                             });
//                           }}
//                         />

//                     </Col>
//                     <Col>
//                       <Form.Label>Amount per Visit</Form.Label>
//                      <Form.Control
//                         type="number"
//                         placeholder="Enter amount"
//                         value={consultationCharges.amountPerVisit}
//                         onChange={(e) => {
//                           const value = e.target.value;

//                           // Prevent leading zero unless it's a decimal like "0.5"
//                           if (/^0[0-9]+/.test(value)) {
//                             setConsultationCharges({
//                               ...consultationCharges,
//                               amountPerVisit: value.replace(/^0+/, ""), // remove leading zeros
//                             });
//                           } else {
//                             setConsultationCharges({
//                               ...consultationCharges,
//                               amountPerVisit: value,
//                             });
//                           }
//                         }}
//                       />

//                     </Col>
//                   </Row>
//                 </Card.Body>
//               </Card>
//             </Col>

//             {/* Right Column - Bill Preview */}
//             <Col md={6}>
//               <Card className={styles.card}>
//                 <Card.Body>
//                   <h5>Bill Preview</h5>
//                   <p>
//                     <strong>Patient Information</strong>
//                   </p>
//                   <Row>
//                     <Col>Name:{patientData?.patient_name || ""} </Col>
//                     {/* <Col>Age/Sex: {patientData?.age}</Col> */}
//                     <Col> Age/Sex: {patientData?.age && patientData?.gender ? ( <> {patientData.age} / {patientData.gender}</> ) : null} </Col>
//                   </Row>
//                   <Row>
//                     <Col>Patient ID: {patientData?.patient_id || ""}</Col>
//                     <Col>Mobile: {patientData?.mobile_number}</Col>
//                   </Row>
//                   <hr />
//                   <h6>Charge Summary</h6>
//                   <Row>
//                     <Col>
//                       <h6>Service</h6>
//                     </Col>
//                     <Col>
//                       <h6>Days</h6>
//                     </Col>
//                     <Col>
//                       <h6>Amount</h6>
//                     </Col>
//                   </Row>
//                   {store.map((item, index) => (
//                     <Row key={index}>
//                       <Col>{item.service}</Col>
//                       <Col>{item.days}</Col>
//                       <Col>{Number(item.amount).toFixed(2)}</Col>
//                     </Row>
//                   ))}
//                   <Row>
//                     <Col>
//                       Investigation Charges
//                       <br />
//                     </Col>
//                     <Col>
//                       {/* {calculateDays(
//                         investigationDates.from,
//                         investigationDates.to
//                       )} */}
//                     </Col>
//                     <Col>{investigationCharges === "" ? "0.00" : Number(investigationCharges).toFixed(2)}</Col>
//                   </Row>
//                   <Row>
//                     <Col>
//                       Pharmacy Charges
//                       <br />
//                     </Col>
//                     <Col>
//                       {/* {calculateDays(pharmacyDates.from, pharmacyDates.to)} */}
//                     </Col>
//                          <Col>{pharmacyCharges === "" ? "0.00" : Number(pharmacyCharges).toFixed(2)}</Col>
//                   </Row>
//                   <Row>
//                     <Col>
//                       Consultation Charges ({consultationCharges.visits} visits)
//                     </Col>
//                     <Col>{/* {consultationCharges.visits} */}</Col>
//                     <Col>
//                       {(
//                         consultationCharges.visits *
//                         consultationCharges.amountPerVisit
//                       ).toFixed(2)}
//                     </Col>
//                   </Row>

//                   <hr />
//                   <div className={styles.totalRow}>
//                     <strong>Total Amount</strong>
//                     <span>{calculateTotal()}</span>
//                   </div>
//                   {/* Concession Input */}
//                   <h6 className="mt-1">Concession</h6>
//                       <Form.Control
//                         type="text" // change to text
//                         placeholder="Concession"
//                         className="my-2"
//                         value={concession}
//                         onChange={(e) => {
//                           let val = e.target.value;

//                           // Allow empty input
//                           if (val === "") {
//                             setConcession("");
//                             return;
//                           }

//                           // Only allow digits
//                           if (/^\d+$/.test(val)) {
//                             // Remove leading zeros except if single zero
//                             val = val.replace(/^0+(?=\d)/, "");
//                             setConcession(val);
//                           }
//                         }}
//                       />

//                   <div className={styles.totalRow}>
//                     <strong>Final Amount</strong>
//                     <span>{calculateFinalAmount()}</span>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Card className={styles.paymentCard}>
//               <Card.Body>
//                 <Row>
//                   {/* Left Section */}
//                   <Col md={6}>
//                     <div className={styles.sectionHeader}>
//                       <Icon
//                         icon="fluent:payment-28-regular"
//                         width="28px"
//                         height="28px"
//                         className={styles.headerIcon}
//                       />
//                       <span>Payment Information</span>
//                     </div>

//                     <Form.Group className="mb-3">
//                       <Form.Label className={styles.formLabel}>
//                         Payment Terms
//                       </Form.Label>
//                       <Form.Select
//                         className={styles.formSelect}
//                         value={dueOnReceipt}
//                         onChange={(e) => {
//                           const value = e.target.value;
//                           setDueOnReceipt(value);
//                           setIsPaymentMethodDisabled(value === "yes"); // disable Payment Method if 'yes'
//                         }}
//                       >
//                         <option value="">Due on Receipt</option>
//                         <option value="yes">Yes</option>
//                         <option value="no">No</option>
//                       </Form.Select>
//                     </Form.Group>

//                     <Form.Group>
//                       <Form.Label className={styles.formLabel}>
//                         Payment Method
//                       </Form.Label>
//                       <Form.Select
//                         className={styles.formSelect}
//                         disabled={isPaymentMethodDisabled}
//                         value={paymentMethod}
//                         onChange={(e) => setPaymentMethod(e.target.value)}
//                       >
//                         <option value="">Select Payment Method</option>
//                         <option value="cash">Cash</option>
//                         <option value="upi">UPI</option>
//                         <option value="debit/credit">Debit/Credit</option>
//                         <option value="multiple (cash+card), (cash+upi)">
//                           Multiple (Cash+Card), (Cash+UPI)
//                         </option>
//                         <option value="insurance">Insurance</option>
//                         <option value="government schemes">
//                           Government Schemes
//                         </option>
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>

//                   {/* Notes in Payment */}
//                   <Col md={6}>
//                     <Form.Group>
//                       <Form.Label className={styles.formLabel}>
//                         Notes
//                       </Form.Label>
//                       <Form.Control
//                         as="textarea"
//                         rows={7}
//                         placeholder="Add any additional or payment instructions"
//                         className={styles.notesArea}
//                         value={note}
//                         onChange={(e) => setNote(e.target.value)}
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//               </Card.Body>
//             </Card>
//           </Row>
//         </Container>
//       ) : (
//         <Recentinvoice handlerClose={handlerClose} back={() => setShow(true)} />
//       )}
//     </>
//   );
// }

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import styles from "../css/InvoiceGenerator.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Recentinvoice from "./Recentinvoice";
import { Icon } from "@iconify/react";
import InvoicePrint from "./InvoicePrint";
import axios from "axios"; //Add axios for API call
import api from "../../utils/axiosInstance";
import { useNotifications } from "../../dashboard/components/NotificationContext";

export default function InvoiceGenerator() {
  const [showInsuranceComponent, setShowInsuranceComponent] = useState(false);

  const { fetchNotifications, onNotificationClick } = useNotifications();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [dueOnReceipt, setDueOnReceipt] = useState("");
  const [note, setNote] = useState("");
  const [show, setShow] = useState(true);
  const [formData, setFormData] = useState({
    service: "",
    days: "",
    amount: 0,
  });
  const [store, setStore] = useState([]);
  const [investigationCharges, setInvestigationCharges] = useState(0);
  //  const [investigationDates, setInvestigationDates] = useState({from: null , to: null });
  const [pharmacyCharges, setPharmacyCharges] = useState(0);
  const [investigationDates, setInvestigationDates] = useState({
    from: null,
    to: null,
  });
  const [pharmacyDates, setPharmacyDates] = useState({ from: null, to: null });
  const [consultationCharges, setConsultationCharges] = useState({
    visits: "",
    amountPerVisit: "", //default as string "0"
  });
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [concession, setConcession] = useState(0); //Added concession state
  const [patientId, setPatientId] = useState(""); //State for patient ID
  const [patientData, setPatientData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null); //State for patient data
  const [invoiceId, setInvoiceId] = useState("");
  const [insuranceFields, setInsuranceFields] = useState({
    referralDoctor: "",
    roomType: "",
    careType: "",
    attendantName: "",
    attendantMobile: "",
    admittedDate: "",
    dischargedDate: "",
    settlementAmount:"",
    receivedAmount:"",
    dueAmount:"",
  });

  useEffect(() => {
    if (patientId) {
      api
        .get(`invoice/create-invoice/?patient_id=${patientId}`)
        .then((response) => {
          console.log("get patient details", response);
          setPatientData(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching patient data:", error);
          setPatientData((prev) => prev || null); // Prevent unwanted resets
        });
    }
  }, [patientId]);
  //Removed reset logic when patientId is empty

  const [isPaymentMethodDisabled, setIsPaymentMethodDisabled] = useState(false);

  const handlePaymentTermsChange = (e) => {
    const value = e.target.value;
    //Disable Payment Method if "Yes" is selected
    setIsPaymentMethodDisabled(value === "yes");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      patient: patientId,
      due_on_receipt: dueOnReceipt,
      payment_method: paymentMethod,
      notes: note,
      concession: Number(concession).toFixed(2),
      service_charges: store.map((item) => ({
        service_name: item.service,
        days: Number(item.days),
        amount: Number(item.amount).toFixed(2),
      })),
      investigation_charges: {
        from_date: investigationDates.from,
        to_date: investigationDates.to,
        amount:
          investigationCharges === ""
            ? "0.00"
            : Number(investigationCharges).toFixed(2),
      },

      pharmacy_charges: {
        from_date: pharmacyDates.from,
        to_date: pharmacyDates.to,
        amount:
          pharmacyCharges === "" ? "0.00" : Number(pharmacyCharges).toFixed(2),
      },

      consultation_charges: {
        no_of_visits: Number(consultationCharges.visits || 0),
        amount_per_visit: Number(
          consultationCharges.amountPerVisit || 0
        ).toFixed(2),
      },
    };
    try {
      const response = await api.post("invoice/create-invoice/", payload);

      const invoice = response.data.data;
      setInvoiceData(invoice); //Update invoice data properly
      setPatientId((prev) => prev || invoice?.invoice?.patient || ""); // Preserve Patient ID
      setInvoiceId(invoice?.invoice?.id || ""); //✅ Set invoice ID

      alert(response.data?.message || "Invoice created successfully!");
      setShowPrintModal(false); //Open print modal here
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create invoice. Please try again."
      );
      console.error(
        "Invoice creation error:",
        error.response?.data || error.message
      );
    }
  };

  //Handle print modal open and close
  const handlePrintOpen = () => {
    setShowPrintModal(true);
    console.log("click");
  };
  const handlePrintClose = () => {
    setShowPrintModal(false);
  };

  const handlerShow = () => setShow(!show);
  const handlerClose = () => setShow(!show);

  //  Handle input changes for service, days, and amount
  const handlerChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //Submit the form and add service to the store
  const formSubmit = (e) => {
    e.preventDefault();
    if (!formData.service || !formData.days || !formData.amount) return;
    setStore([...store, formData]);
    setFormData({ service: "", days: "", amount: "" });
  };

  //Calculate days between from and to dates
  const calculateDays = (from, to) => {
    if (!from || !to) return "-";
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = toDate - fromDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : "-";
  };

  //Calculate the total amount including service, investigation, pharmacy, and consultation
  const calculateTotal = () => {
    const serviceTotal = store.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );
    const consultationTotal =
      consultationCharges.visits * consultationCharges.amountPerVisit;
    return Number(
      serviceTotal +
        Number(investigationCharges || 0) +
        Number(pharmacyCharges || 0) +
        consultationTotal
    ).toFixed(2);
  };

  //Calculate the final amount after concession
  const calculateFinalAmount = () => {
    return (calculateTotal() - concession).toFixed(2);
  };

  return (
    <>
      {show ? (
        <Container fluid className={styles.invoiceContainer}>
          <div className={styles.header}>
            <div className={styles.para}>
              <h2>Generate Invoice</h2>
              <p>Create and Manage patient invoices</p>
            </div>
            <div className={styles.actionButtons}>
              <button className={styles.btn} onClick={handlerShow}>
                <Icon icon="mdi:recent" width="16px" height="16px" /> Recent
                Invoices
              </button>
              <button onClick={handleSubmit} className={styles.btn}>
                <Icon icon="carbon:rule-draft" width="15px" /> Save
              </button>

              <button className={styles.btn} onClick={handlePrintOpen}>
                <Icon icon="material-symbols-light:print-outline-rounded" />{" "}
                Print
              </button>
              {showPrintModal && invoiceData && (
                <InvoicePrint
                  show={showPrintModal}
                  handlePrintClose={() => setShowPrintModal(false)}
                  invoiceData={invoiceData}
                  patientId={invoiceData.invoice?.patient || ""} // pass patientId safely
                  invoiceId={invoiceId}
                />
              )}
            </div>
          </div>

          <Row>
            {/* Left Column */}
            <Col md={showInsuranceComponent ? 12 : 6}>
              {showInsuranceComponent ? (
                <Card className={styles.card}>
                  <Card.Body>
                    <h5>Patient Details</h5>
                    <Row className="mb-2">
                      <Col>
                        <Form.Label>Patient Id</Form.Label>
                        <Form.Control
                          placeholder="Enter Patient ID"
                          value={patientId}
                          onChange={(e) => {
                            const newId = e.target.value;
                            setPatientId(newId);

                            //Reset all related form states
                            setPatientData(null);
                            setFormData({ service: "", days: "", amount: 0 });
                            setStore([]);
                            setInvestigationDates({
                              from: null || "",
                              to: null || "",
                            });
                            setInvestigationCharges(0);
                            setPharmacyDates({
                              from: null || "",
                              to: null || "",
                            });
                            setPharmacyCharges(0);
                            setConsultationCharges({
                              visits: 0,
                              amountPerVisit: 0,
                            });
                            setConcession(0);
                            setDueOnReceipt("");
                            setIsPaymentMethodDisabled(false);
                            setPaymentMethod("");
                            setNote("");
                          }}
                        />
                      </Col>

                      <Col>
                        <Form.Label>Patient Name</Form.Label>
                        <Form.Control
                          placeholder="Patient Name"
                          value={patientData?.patient_name || ""}
                          readOnly
                        />
                      </Col>
                      <Col>
                        <Form.Label>Age</Form.Label>
                        <Form.Control
                          placeholder="Age"
                          value={patientData?.age || ""}
                          readOnly
                        />
                      </Col>
                      <Col>
                        <Form.Label>Sex</Form.Label>
                        <Form.Control
                          placeholder="Sex"
                          value={patientData?.gender || ""}
                          readOnly
                        />
                      </Col>
                      <Col>
                        <Form.Label>Consultant</Form.Label>
                        <Form.Control
                          placeholder="Consultant"
                          value={insuranceFields.referralDoctor}
                          onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              referralDoctor: e.target.value,
                            })
                          }
                        />
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col>
                        <Form.Label>Appointment Type</Form.Label>
                        <Form.Control
                          placeholder="Appointment Type"
                          value={patientData?.appointment_type || ""}
                          readOnly
                        />
                      </Col>
                      <Col>
                        <Form.Label>Gender</Form.Label>
                        <Form.Control
                          placeholder="Sex"
                          value={patientData?.gender || ""}
                          readOnly
                        />
                      </Col>
                      <Col>
                        <Form.Label>Room Number</Form.Label>
                        <Form.Control
                          placeholder="Room Number"
                          value={patientData?.ward || ""}
                          readOnly
                        />
                      </Col>
                      <Col>
                        <Form.Label>Room Type</Form.Label>
                        <Form.Control
                          placeholder="Enter Room Type"
                          value={insuranceFields.roomType}
                          onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              roomType: e.target.value,
                            })
                          }
                        />
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col>
                        <Form.Label>Attendant Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={insuranceFields.attendantName}
                          onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              attendantName: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col>
                        <Form.Label>Attendant mobile number</Form.Label>
                        <Form.Control
                          type="text"
                          value={insuranceFields.attendantMobile}
                          onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              attendantMobile: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col>
                        <Form.Label>Admitted ate</Form.Label>
                        <Form.Control
                          type="date"
                          value={insuranceFields.admittedDate}
                          onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              admittedDate: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col>
                        <Form.Label>Discharged Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={insuranceFields.dischargedDate}
                          onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              dischargedDate: e.target.value,
                            })
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Label> Referral Doctor</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Referral Doctor"
                          value={insuranceFields.referralDoctor}
                          onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              referralDoctor: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col>
                        <Form.Label>Care Type</Form.Label>
                        <Form.Control
                          type="text"
                          value={insuranceFields.careType}
                          onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              careType: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col></Col>
                      <Col></Col>
                    </Row>
                  </Card.Body>
                </Card>
              ) : (
                <Card className={styles.card}>
                  <Card.Body>
                    <h5>Patient Details</h5>
                    <Row className="mb-2">
                      <Col>
                        <Form.Label>Patient Id</Form.Label>
                        <Form.Control
                          placeholder="Enter Patient ID"
                          value={patientId}
                          onChange={(e) => {
                            const newId = e.target.value;
                            setPatientId(newId);

                            //Reset all related form states
                            setPatientData(null);
                            setFormData({ service: "", days: "", amount: 0 });
                            setStore([]);
                            setInvestigationDates({
                              from: null || "",
                              to: null || "",
                            });
                            setInvestigationCharges(0);
                            setPharmacyDates({
                              from: null || "",
                              to: null || "",
                            });
                            setPharmacyCharges(0);
                            setConsultationCharges({
                              visits: 0,
                              amountPerVisit: 0,
                            });
                            setConcession(0);
                            setDueOnReceipt("");
                            setIsPaymentMethodDisabled(false);
                            setPaymentMethod("");
                            setNote("");
                          }}
                        />
                      </Col>

                      <Col>
                        <Form.Label>Patient Name</Form.Label>
                        <Form.Control
                          placeholder="Patient Name"
                          value={patientData?.patient_name || ""}
                          readOnly
                        />
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col>
                        <Form.Label>Appointment Type</Form.Label>
                        <Form.Control
                          placeholder="Appointment Type"
                          value={patientData?.appointment_type || ""}
                          readOnly
                        />
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col>
                        <Form.Label>Age</Form.Label>
                        <Form.Control
                          placeholder="Age"
                          value={patientData?.age || ""}
                          readOnly
                        />
                      </Col>
                      <Col>
                        <Form.Label>Sex</Form.Label>
                        <Form.Control
                          placeholder="Sex"
                          value={patientData?.gender || ""}
                          readOnly
                        />
                      </Col>
                      <Col>
                        <Form.Label>Mobile</Form.Label>
                        <Form.Control
                          placeholder="Mobile"
                          value={patientData?.mobile_number || ""}
                          readOnly
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Label>Doctor</Form.Label>
                        <Form.Control
                          placeholder="Doctor"
                          value={patientData?.doctor_name || ""}
                          readOnly
                        />
                      </Col>
                      <Col>
                        <Form.Label>Room Number</Form.Label>
                        <Form.Control
                          placeholder="Room Number"
                          value={patientData?.ward || ""}
                          readOnly
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
              {/* Service Charges */}
              <Card className={styles.card}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center ">
                    <h6>Service Charges</h6>
                    <button className={styles.addservice} onClick={formSubmit}>
                      + Add Service
                    </button>
                  </div>
                  <Row className="mb-2">
                    <Col>
                      <Form.Label>Service Name</Form.Label>
                      <Form.Control
                        value={formData.service}
                        name="service"
                        onChange={handlerChange}
                        placeholder="Enter Service "
                      />
                    </Col>
                    <Col>
                      <Form.Label>Days</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.days}
                        name="days"
                        onChange={handlerChange}
                        placeholder="days"
                      />
                    </Col>
                    <Col>
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.amount}
                        name="amount"
                        onChange={handlerChange}
                      />
                    </Col>
                  </Row>
                  {store.length > 0 && (
                    <>
                      <Row>
                        <Col>
                          <strong>Service</strong>
                        </Col>
                        <Col>
                          <strong>Days</strong>
                        </Col>
                        <Col>
                          <strong>Amount</strong>
                        </Col>
                      </Row>
                      {store.map((item, idx) => (
                        <Row key={idx}>
                          <Col>{item.service}</Col>
                          <Col>{item.days}</Col>
                          <Col>{Number(item.amount).toFixed(2)}</Col>
                        </Row>
                      ))}
                    </>
                  )}
                </Card.Body>
              </Card>

              {/* Other Charges */}
               {showInsuranceComponent ? (
              <Card className={styles.card}>
                <Card.Body>
                  <h6>Other Charges</h6>

                  <p className={styles.subTitle}>Investigation Charges</p>
                  <Row className="mb-2" >
                    <Col className="col-sm-4">
                      <Form.Label>From date</Form.Label>
                      <Form.Control
                        type="date"
                        value={investigationDates.from || ""}
                        onChange={(e) =>
                          setInvestigationDates({
                            ...investigationDates,
                            from: e.target.value || null,
                          })
                        }
                      />
                    </Col>

                    <Col className="col-sm-4">
                      <Form.Label>To date</Form.Label>
                      <Form.Control
                        type="date"
                        value={investigationDates.to || ""}
                        onChange={(e) =>
                          setInvestigationDates({
                            ...investigationDates,
                            to: e.target.value || null,
                          })
                        }
                      />
                    </Col>
                    <Col className="col-sm-4">
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Amount"
                        value={investigationCharges}
                        onChange={(e) => {
                          let val = e.target.value;

                          //Allow empty input
                          if (val === "") {
                            setInvestigationCharges("");
                            return;
                          }

                          //Only allow digits
                          if (/^\d+$/.test(val)) {
                            //Remove leading zeros except if single zero
                            val = val.replace(/^0+(?=\d)/, "");
                            setInvestigationCharges(val);
                          }
                        }}
                      />
                    </Col>
                  </Row>

                  <p className={styles.subTitle}>Pharmacy Charges</p>
                  <Row className="mb-2">
                    <Col className="col-sm-4">
                      <Form.Label>From date</Form.Label>
                      <Form.Control
                        type="date"
                        value={pharmacyDates.from || ""}
                        onChange={(e) =>
                          setPharmacyDates({
                            ...pharmacyDates,
                            from: e.target.value || null,
                          })
                        }
                      />
                    </Col>
                    <Col className="col-sm-4">
                      <Form.Label>To date</Form.Label>
                      <Form.Control
                        type="date"
                        value={pharmacyDates.to}
                        onChange={(e) =>
                          setPharmacyDates({
                            ...pharmacyDates,
                            to: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col className="col-sm-4">
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="text" //changed to "text" to allow custom control
                        placeholder="Amount"
                        value={pharmacyCharges}
                        onChange={(e) => {
                          let val = e.target.value;

                          //Allow empty input
                          if (val === "") {
                            setPharmacyCharges("");
                            return;
                          }

                          //Only allow digits
                          if (/^\d+$/.test(val)) {
                            //Remove leading zeros except if single zero
                            val = val.replace(/^0+(?=\d)/, "");
                            setPharmacyCharges(val);
                          }
                        }}
                      />
                    </Col>
                  </Row>

                  <p className={styles.subTitle}>Consultation Charges</p>

                  <Row>
                    <Col>
                      <Form.Label>No.of Visits</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter number of visits"
                        value={consultationCharges.visits}
                        onChange={(e) => {
                          const value = e.target.value;

                          //Remove leading zeros unless it's "0" or empty
                          const cleaned = value.replace(/^0+(?=\d)/, "");

                          setConsultationCharges({
                            ...consultationCharges,
                            visits: cleaned,
                          });
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Amount per Visit</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        value={consultationCharges.amountPerVisit}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Prevent leading zero unless it's a decimal like "0.5"
                          if (/^0[0-9]+/.test(value)) {
                            setConsultationCharges({
                              ...consultationCharges,
                              amountPerVisit: value.replace(/^0+/, ""), // remove leading zeros
                            });
                          } else {
                            setConsultationCharges({
                              ...consultationCharges,
                              amountPerVisit: value,
                            });
                          }
                        }}
                      />
                    </Col>
                  </Row>
                  <Row>
                      <Col>
                         <Form.Label>Settlement Amount</Form.Label>
                         <Form.Control
                              value={insuranceFields.settlementAmount}
                             onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              settlementAmount: e.target.value,
                            })}
                         />
                      </Col>
                      <Col>
                         <Form.Label>Received Amount</Form.Label>
                        <Form.Control
                              value={insuranceFields.receivedAmount}
                             onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                               receivedAmount: e.target.value,
                            })}
                         />
                      </Col><Col>
                         <Form.Label>Due Amount</Form.Label>
                          <Form.Control
                              value={insuranceFields.dueAmount}
                             onChange={(e) =>
                            setInsuranceFields({
                              ...insuranceFields,
                              dueAmount: e.target.value,
                            })}
                         />
                      </Col>
                 </Row>
                </Card.Body>
              </Card>
              ): (<Card className={styles.card}>
                <Card.Body>
                  <h6>Other Charges</h6>

                  <p className={styles.subTitle}>Investigation Charges</p>
                  <Row className="mb-2">
                    <Col className="col-sm-4">
                      <Form.Label>From date</Form.Label>
                      <Form.Control
                        type="date"
                        value={investigationDates.from || ""}
                        onChange={(e) =>
                          setInvestigationDates({
                            ...investigationDates,
                            from: e.target.value || null,
                          })
                        }
                      />
                    </Col>

                    <Col className="col-sm-4">
                      <Form.Label>To date</Form.Label>
                      <Form.Control
                        type="date"
                        value={investigationDates.to || ""}
                        onChange={(e) =>
                          setInvestigationDates({
                            ...investigationDates,
                            to: e.target.value || null,
                          })
                        }
                      />
                    </Col>
                    <Col className="col-sm-4">
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Amount"
                        value={investigationCharges}
                        onChange={(e) => {
                          let val = e.target.value;

                          //Allow empty input
                          if (val === "") {
                            setInvestigationCharges("");
                            return;
                          }

                          //Only allow digits
                          if (/^\d+$/.test(val)) {
                            //Remove leading zeros except if single zero
                            val = val.replace(/^0+(?=\d)/, "");
                            setInvestigationCharges(val);
                          }
                        }}
                      />
                    </Col>
                  </Row>

                  <p className={styles.subTitle}>Pharmacy Charges</p>
                  <Row className="mb-2">
                    <Col className="col-sm-4">
                      <Form.Label>From date</Form.Label>
                      <Form.Control
                        type="date"
                        value={pharmacyDates.from || ""}
                        onChange={(e) =>
                          setPharmacyDates({
                            ...pharmacyDates,
                            from: e.target.value || null,
                          })
                        }
                      />
                    </Col>
                    <Col className="col-sm-4">
                      <Form.Label>To date</Form.Label>
                      <Form.Control
                        type="date"
                        value={pharmacyDates.to}
                        onChange={(e) =>
                          setPharmacyDates({
                            ...pharmacyDates,
                            to: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col className="col-sm-4">
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="text" //changed to "text" to allow custom control
                        placeholder="Amount"
                        value={pharmacyCharges}
                        onChange={(e) => {
                          let val = e.target.value;

                          //Allow empty input
                          if (val === "") {
                            setPharmacyCharges("");
                            return;
                          }

                          //Only allow digits
                          if (/^\d+$/.test(val)) {
                            //Remove leading zeros except if single zero
                            val = val.replace(/^0+(?=\d)/, "");
                            setPharmacyCharges(val);
                          }
                        }}
                      />
                    </Col>
                  </Row>

                  <p className={styles.subTitle}>Consultation Charges</p>

                  <Row>
                    <Col>
                      <Form.Label>No.of Visits</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter number of visits"
                        value={consultationCharges.visits}
                        onChange={(e) => {
                          const value = e.target.value;

                          //Remove leading zeros unless it's "0" or empty
                          const cleaned = value.replace(/^0+(?=\d)/, "");

                          setConsultationCharges({
                            ...consultationCharges,
                            visits: cleaned,
                          });
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Amount per Visit</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        value={consultationCharges.amountPerVisit}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Prevent leading zero unless it's a decimal like "0.5"
                          if (/^0[0-9]+/.test(value)) {
                            setConsultationCharges({
                              ...consultationCharges,
                              amountPerVisit: value.replace(/^0+/, ""), // remove leading zeros
                            });
                          } else {
                            setConsultationCharges({
                              ...consultationCharges,
                              amountPerVisit: value,
                            });
                          }
                        }}
                      />
                    </Col>
                  </Row>
                  
                </Card.Body>
              </Card>)}
            </Col>
       
            {/* Right Column - Bill Preview */}
            {!showInsuranceComponent && (
              <Col md={6}>
                <Card className={styles.card}>
                  <Card.Body>
                    <h5>Bill Preview</h5>
                    <p>
                      <strong>Patient Information</strong>
                    </p>
                    <Row>
                      <Col>Name:{patientData?.patient_name || ""} </Col>
                      {/* <Col>Age/Sex: {patientData?.age}</Col> */}
                      <Col>
                        {" "}
                        Age/Sex:{" "}
                        {patientData?.age && patientData?.gender ? (
                          <>
                            {" "}
                            {patientData.age} / {patientData.gender}
                          </>
                        ) : null}
                         
                      </Col>
                    </Row>
                    <Row>
                      <Col>Patient ID: {patientData?.patient_id || ""}</Col>
                      <Col>Mobile: {patientData?.mobile_number}</Col>
                    </Row>
                    <hr />
                    <h6>Charge Summary</h6>
                    <Row>
                      <Col>
                        <h6>Service</h6>
                      </Col>
                      <Col>
                        <h6>Days</h6>
                      </Col>
                      <Col>
                        <h6>Amount</h6>
                      </Col>
                    </Row>
                    {store.map((item, index) => (
                      <Row key={index}>
                        <Col>{item.service}</Col>
                        <Col>{item.days}</Col>
                        <Col>{Number(item.amount).toFixed(2)}</Col>
                      </Row>
                    ))}
                    <Row>
                      <Col>
                        Investigation Charges
                        <br />
                      </Col>
                      <Col></Col>
                      <Col>
                        {investigationCharges === ""
                          ? "0.00"
                          : Number(investigationCharges).toFixed(2)}
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        Pharmacy Charges
                        <br />
                      </Col>
                      <Col>
                        {/* {calculateDays(pharmacyDates.from, pharmacyDates.to)} */}
                      </Col>
                      <Col>
                        {pharmacyCharges === ""
                          ? "0.00"
                          : Number(pharmacyCharges).toFixed(2)}
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        Consultation Charges ({consultationCharges.visits}{" "}
                        visits)
                      </Col>
                      <Col>{/* {consultationCharges.visits} */}</Col>
                      <Col>
                        {(
                          consultationCharges.visits *
                          consultationCharges.amountPerVisit
                        ).toFixed(2)}
                      </Col>
                    </Row>

                    <hr />
                    <Row className={styles.totalRow}>
                      <Col>
                        <strong>Total Amount</strong>
                      </Col>
                      <Col></Col>
                      <Col>
                        <span>{calculateTotal()}</span>
                      </Col>
                    </Row>
                    {/* Concession Input */}
                    <h6 className="mt-1">Concession</h6>
                    <Row className="mx-1 me-5 ">
                      <Form.Control
                        type="text"
                        change
                        to
                        text
                        placeholder="Concession"
                        className="my-2 "
                        value={concession}
                        onChange={(e) => {
                          let val = e.target.value;

                          //Allow empty input
                          if (val === "") {
                            setConcession("");
                            return;
                          }

                          //Only allow digits
                          if (/^\d+$/.test(val)) {
                            // Remove leading zeros except if single zero
                            val = val.replace(/^0+(?=\d)/, "");
                            setConcession(val);
                          }
                        }}
                      />
                    </Row>
                    <Row className={styles.totalRow}>
                      <Col>
                        <strong>Final Amount</strong>
                      </Col>
                      <Col></Col>
                      <Col>
                        <span>{calculateFinalAmount()}</span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            )}
            <Card className={styles.paymentCard}>
              <Card.Body>
                <Row>
                  {/* Left Section */}
                  <Col md={6}>
                    <div className={styles.sectionHeader}>
                      <Icon
                        icon="fluent:payment-28-regular"
                        width="28px"
                        height="28px"
                        className={styles.headerIcon}
                      />
                      <span>Payment Information</span>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label className={styles.formLabel}>
                        Payment Terms
                      </Form.Label>
                      <Form.Select
                        className={styles.formSelect}
                        value={dueOnReceipt}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDueOnReceipt(value);
                          setIsPaymentMethodDisabled(value === "yes"); //disable Payment Method if 'yes'
                        }}
                      >
                        <option value="">Due on Receipt</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className={styles.formLabel}>
                        Payment Method
                      </Form.Label>
                      <Form.Select
                        className={styles.formSelect}
                        disabled={isPaymentMethodDisabled}
                        value={paymentMethod}
                        onChange={(e) => {
                          const selected = e.target.value;
                          setPaymentMethod(selected);
                          setShowInsuranceComponent(selected === "insurance");
                        }}
                      >
                        <option value="">Select Payment Method</option>
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="debit/credit">Debit/Credit</option>
                        <option value="multiple (cash+card), (cash+upi)">
                          Multiple (Cash+Card), (Cash+UPI)
                        </option>
                        <option value="insurance">Insurance</option>
                        <option value="government schemes">
                          Government Schemes
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Notes in Payment */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className={styles.formLabel}>
                        Notes
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={7}
                        placeholder="Add any additional or payment instructions"
                        className={styles.notesArea}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Row>
        </Container>
      ) : (
        <Recentinvoice handlerClose={handlerClose} back={() => setShow(true)} />
      )}
    </>
  );
}
