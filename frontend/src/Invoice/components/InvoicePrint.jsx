// // InvoiceModal.js
// import React, { useRef } from 'react';
// import { Modal, Button, Table, Row, Col, ModalBody, Form } from 'react-bootstrap';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import logo from '../../assets/Images/sitelogo.svg';
//  import styles from '../css/InvoicePrint.module.css';

// const InvoicePrint = ({ show, handleClose }) => {
//   const printRef = useRef();
 
//   const handleDownload = () => {
//     html2canvas(printRef.current).then(canvas => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF();
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//       pdf.save('invoice.pdf');
//     });
//   };
 
//    const tablecolor = {
//     color: 'white',
//     backgroundColor: '#002072'
//   };
 
//   return (
//     <Modal show={show} onHide={handleClose} dialogClassName={styles.custom} closeButton>
   
//       <Modal.Header ref={printRef} >
//         <div className="">
//         <Row className="">
//           <Col>
//             <img src={logo} alt="Hospital Logo" style={{ height: "83px" , width:"92px"}} />
//           </Col>
 
//           <Col>
//             <h3 className={styles.title} style={{ color: "#A34C51" }}>
//               Sai Teja Multi Speciality Hospital
//             </h3>
//             <h5 className="text-primary ">
//               (A UNIT OF SAVITHA HEALTH CARE PVT.LTD)
//             </h5>
//              <p className={styles.address}>
//               <strong> Huda Colony, Kothapet, Saroornagar, Hyderabad – 500 035.Ph: 040 4006 2725, +91 84840 19791</strong>
             
//             </p>
//           </Col>
//         </Row>
//         <Row> </Row> 
//         </div>
//       </Modal.Header>
//       <ModalBody>
//         <div className='m-1'>
//                        <h5>Bill Preview</h5>
//                   <p><strong>Patient Information</strong></p>
//                   <Row>
//                     <Col>Name:</Col>
//                     <Col>Age/Sex:</Col>
//                    </Row>
//                   <Row>
//                     <Col>UMRNO:</Col>
//                     <Col>Mobile:</Col>
//                   </Row>
//                   <hr />
//                   <h6>Charge Summary</h6>
//                   <Row>
//                       <Col><h6>Service</h6></Col>
//                       <Col><h6>Days</h6></Col>
//                       <Col><h6>Amount</h6></Col>
//                   </Row>
//                   <Row>
//                     <Col><i>Room Charges</Col>
//                     <Col><i>1</Col>
//                     <Col><i>450</Col>
//                   </Row>
//                   <Row>
//                     <Col><i>Investigation Charges</Col>
//                     <Col></Col>
//                     <Col>650</Col>
//                   </Row>
//                   <Row>
//                     <Col>Pharmacy Charges</Col>
//                     <Col></Col>
//                     <Col>2500</Col>
//                   </Row>
//                   <Row>
//                     <Col>Consultant Charges(1 Visits)</Col>
//                     <Col></Col>
//                     <Col>600</Col>
//                   </Row>
//                   <hr />
//                   <Row>
//                     <Col>Total Amount</Col>
//                     <Col></Col>
//                     <Col>4600</Col>
//                   </Row> <br />
//                   <Row>
//                     <Form.Label>Concession</Form.Label>
//                     <Form.Control height={"50"} width={"80"} />
//                   </Row> <br />
//                   <Row>
//                     <Col>Final Amount</Col>
//                     <Col></Col>
//                     <Col>4400</Col>
//                   </Row>
                   


//         </div>
//       </ModalBody>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>Close</Button>
//         <Button variant="success" onClick={handleDownload}>Download PDF</Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };
 
// export default InvoicePrint;
 
// import React, { useRef, useEffect, useState } from 'react';
// import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import logo from '../../assets/Images/sitelogo.svg';
// import axios from 'axios';  // Import Axios
// import styles from '../css/InvoicePrint.module.css';

// const InvoicePrint = ({ show, handlePrintClose, patientId,  invoiceData }) => {
//   const printRef = useRef(); // State to store the fetched invoice data

//   useEffect(() => {
//     // Fetch the invoice data when the component is mounted
//     if (patientId) {
//       axios.get(`http://127.0.0.1:8000/invoice/get-invoice/${patientId}/`)
//         .then(response => {
//           console.log(response.data.data) // Update state with the fetched data
//         })
//         .catch(error => {
//           console.error('Error fetching invoice data:', error);
//         });
//     }
//   }, [patientId]);

//   const handleDownload = () => {
//     html2canvas(printRef.current).then(canvas => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF();
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//       pdf.save('invoice.pdf');
//     });
//   };

//    if (!show || !invoiceData) return null; // Show nothing if data is not yet fetched

//   // Build charges dynamically from the fetched data
// //  const chargeItems = [
// //   ...(invoiceData.store?.map(item => ({
// //     name: item.service,
// //     days: item.days,
// //     amount: Number(item.amount) || 0,
// //   })) || []),
// //   {
// //     name: 'Investigation Charges',
// //     days: '7',
// //     amount: Number(invoiceData.investigationCharges) || 0,
// //   },
// //   {
// //     name: 'Pharmacy Charges',
// //     days: '',
// //     amount: Number(invoiceData.pharmacyCharges) || 0,
// //   },
// //   {
// //     name: `Consultation Charges (${invoiceData.consultationCharges?.visits || 0} Visit${invoiceData.consultationCharges?.visits > 1 ? 's' : ''})`,
// //     days: invoiceData.consultationCharges?.visits || 0,
// //     amount:
// //       (Number(invoiceData.consultationCharges?.visits) || 0) *
// //       (Number(invoiceData.consultationCharges?.amountPerVisit) || 0),
// //   },
// // ];


// const getDateRangeWithDays = (fromDateStr, toDateStr) => {
//   if (!fromDateStr || !toDateStr) return '';

//   const from = new Date(fromDateStr);
//   const to = new Date(toDateStr);

//   if (isNaN(from) || isNaN(to)) return '';

//   const timeDiff = to.getTime() - from.getTime();
//   const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

//   const options = { month: 'short', day: 'numeric' }; // Customize as needed
//   const fromFormatted = from.toLocaleDateString('en-US', options);
//   const toFormatted = to.toLocaleDateString('en-US', options);

//   return `${days} day${days > 1 ? 's' : ''}`;
// };

// const chargeItems = [
//   ...(invoiceData.invoice?.service_charges?.map(item => ({
//     name: item.service_name,
//     days: item.days,
//     amount: Number(item.amount) || 0,
//   })) || []),
//  {
//   name: 'Investigation Charges',
//   days: getDateRangeWithDays(
//     invoiceData.invoice?.investigation_charges?.from_date,
//     invoiceData.invoice?.investigation_charges?.to_date
//   ),
//   amount: Number(invoiceData.invoice?.investigation_charges?.amount) || 0,
// },
// {
//   name: 'Pharmacy Charges',
//   days: getDateRangeWithDays(
//     invoiceData.invoice?.pharmacy_charges?.from_date,
//     invoiceData.invoice?.pharmacy_charges?.to_date
//   ),
//   amount: Number(invoiceData.invoice?.pharmacy_charges?.amount) || 0,
// },


//   {
//     name: `Consultation Charges (${invoiceData.invoice?.consultation_charges?.no_of_visits || 0} Visit${invoiceData.invoice?.consultation_charges?.no_of_visits > 1 ? 's' : ''})`,
//     days: invoiceData.invoice?.consultation_charges?.no_of_visits || 0,
//     amount:
//       (Number(invoiceData.invoice?.consultation_charges?.no_of_visits) || 0) *
//       (Number(invoiceData.invoice?.consultation_charges?.amount_per_visit) || 0),
//   },
// ];


//     const totalAmount = chargeItems.reduce((acc, item) => acc + item.amount, 0);
//   const concession = Number(invoiceData.invoice.concession) || 0;
//   const finalAmount = totalAmount - concession;

//   return (
//     <Modal show={show} onHide={handlePrintClose} dialogClassName={styles.custom}>
//       <div ref={printRef}>
//         <Modal.Header>
//           <Row>
//             <Col>
//               <img src={logo} alt="Hospital Logo" style={{ height: '83px', width: '92px' }} />
//             </Col>
//             <Col>
//               <h3 className={styles.title} style={{ color: '#A34C51' }}>
//                 Sai Teja Multi Speciality Hospital
//               </h3>
//               <h5 className="text-primary">(A UNIT OF SAVITHA HEALTH CARE PVT.LTD)</h5>
//               <p className={styles.address}>
//                 <strong>
//                   Huda Colony, Kothapet, Saroornagar, Hyderabad – 500 035. Ph: 040 4006 2725, +91 84840 19791
//                 </strong>
//               </p>
//             </Col>
//           </Row>
//         </Modal.Header>

//         <Modal.Body>
//           <div className='mx-4'>
//             <h5>Bill Preview</h5>
//             <p><strong>Patient Information</strong></p>
//             <Row>
//               <Col>Name: {invoiceData.patient_info.patient_name}</Col>
//               <Col>Age: {invoiceData.patient_info.age}/ Sex:{invoiceData.patient_info.gender}</Col>
//             </Row>
//             <Row>
//               <Col>Patient ID: {invoiceData.invoice.patient}</Col>
//               <Col>Mobile: {invoiceData.patient_info.mobile_number}</Col>
//             </Row>
//             <hr />
//             <h6>Charge Summary</h6>

//             {/* Header Row */}
//             <div className='d-flex w-100 py-1 fw-bold'>
//               <div style={{ width: '50%' }}>Service</div>
//               <div style={{ width: '20%' }}>Days</div>
//               <div style={{ width: '30%' }}>Amount</div>
//             </div>

//             {/* Data Rows */}
//             {chargeItems.map((item, index) => (
//               <div key={index} className='d-flex w-100 py-1'>
//                 <div style={{ width: '50%' }}>{item.name}</div>
//                 <div style={{ width: '20%' }}>{item.days}</div>
//                 <div style={{ width: '30%' }}>{item.amount.toFixed(2)}</div>
//               </div>
//             ))}

//             <hr />
//             {/* Total Amount */}
//             <div className="mt-3 d-flex w-100 py-1 fw-bold">
//               <div style={{ width: '50%' }}>Total Amount</div>
//               <div style={{ width: '20%' }}></div> {/* Empty Days column for alignment */}
//               <div style={{ width: '30%' }}>{totalAmount.toFixed(2)}</div>
//             </div>

//             {/* Concession Label Row */}
//             <Row className="mt-2">
//               <Col className="text-start">Concession</Col>
//             </Row>

//             {/* Concession Input Row */}
//             <Row>
//               <Col>
//                 <Form.Control
//                   type="number"
//                   value={invoiceData.invoice.concession || 0} // Assuming concession is in the fetched data
//                   readOnly
//                 />
//               </Col>
//             </Row>

//             <div className="mt-3 d-flex w-100 py-1 fw-bold">
//               <div style={{ width: '50%' }}>Final Amount</div>
//               <div style={{ width: '20%' }}></div> {/* Empty Days column for alignment */}
//               <div style={{ width: '30%' }}>{(finalAmount).toFixed(2)}</div>
//             </div>
//           </div>
//           <div style={{backgroundColor:'#A62855', color:'white'}} className={styles.text}>
//             <h6 className='m-0 p-1 mt-2'>ROUND THE CLOCK EMERGENCY SERVICES</h6>
//           </div>
//         </Modal.Body>
//       </div>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={handlePrintClose}>Close</Button>
//         <Button variant="success" onClick={handleDownload}>Download PDF</Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default InvoicePrint;





import React, { useRef } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../assets/images/sitelogo.svg';
import styles from '../css/InvoicePrint.module.css';

const InvoicePrint = ({ show, handlePrintClose, invoiceData }) => {
  const printRef = useRef();

  if (!show || !invoiceData) return null;

  const handleDownload = () => {
    html2canvas(printRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('invoice.pdf');
    });
  };

  const getDateRangeWithDays = (fromDateStr, toDateStr) => {
    if (!fromDateStr || !toDateStr) return '';
    const from = new Date(fromDateStr);
    const to = new Date(toDateStr);
    if (isNaN(from) || isNaN(to)) return '';
    const timeDiff = to - from;
    // const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    // return `${days} ${days > 1 ? '' : ''}`;
  };

  const chargeItems = [
    ...(invoiceData.invoice?.service_charges?.map(item => ({
      name: item.service_name,
      days: item.days,
      amount: Number(item.amount) || 0,
    })) || []),
    {
      name: 'Investigation Charges',
      days: getDateRangeWithDays(
        invoiceData.invoice?.investigation_charges?.from_date,
        invoiceData.invoice?.investigation_charges?.to_date
      ),
      amount: Number(invoiceData.invoice?.investigation_charges?.amount) || 0,
    },
    {
      name: 'Pharmacy Charges',
      days: getDateRangeWithDays(
        invoiceData.invoice?.pharmacy_charges?.from_date,
        invoiceData.invoice?.pharmacy_charges?.to_date
      ),
      amount: Number(invoiceData.invoice?.pharmacy_charges?.amount) || 0,
    },
    {
      name: `Consultation Charges (${invoiceData.invoice?.consultation_charges?.no_of_visits || 0} Visit${invoiceData.invoice?.consultation_charges?.no_of_visits > 1 ? 's' : ''})`,
      // days: invoiceData.invoice?.consultation_charges?.no_of_visits || 0,
      amount:
        (Number(invoiceData.invoice?.consultation_charges?.no_of_visits) || 0) *
        (Number(invoiceData.invoice?.consultation_charges?.amount_per_visit) || 0),
    },
  ];

  const totalAmount = chargeItems.reduce((acc, item) => acc + item.amount, 0);
  const concession = Number(invoiceData.invoice.concession) || 0;
  const finalAmount = totalAmount - concession;

  return (
    <Modal show={show} onHide={handlePrintClose} dialogClassName={styles.custom}>
      <div ref={printRef}>
        <Modal.Header>
          <Row>
            <Col>
              <img src={logo} alt="Hospital Logo" style={{ height: '83px', width: '92px' }} />
            </Col>
            <Col>
              <h3 className={styles.title} style={{ color: '#A34C51' }}>
                Sai Teja Multi Speciality Hospital
              </h3>
              <h5 className="text-primary">(A UNIT OF SAVITHA HEALTH CARE PVT.LTD)</h5>
              <p className={styles.address}>
                <strong>
                  Huda Colony, Kothapet, Saroornagar, Hyderabad – 500 035. Ph: 040 4006 2725, +91 84840 19791
                </strong>
              </p>
            </Col>
          </Row>
        </Modal.Header>

        <Modal.Body>
          <div className='mx-4'>
            <h5>Bill Preview</h5>
            <p><strong>Patient Information</strong></p>
            <Row>
              <Col>Name: {invoiceData.patient_info.patient_name}</Col>
              <Col>Age: {invoiceData.patient_info.age}/ Sex:{invoiceData.patient_info.gender}</Col>
            </Row>
            <Row>
              <Col>Patient ID: {invoiceData.invoice.patient}</Col>
              <Col>Mobile: {invoiceData.patient_info.mobile_number}</Col>
            </Row>
            <hr />
            <h6>Charge Summary</h6>

            <div className='d-flex w-100 py-1 fw-bold'>
              <div style={{ width: '50%' }}>Service</div>
              <div style={{ width: '20%' }}>Days</div>
              <div style={{ width: '30%' }}>Amount</div>
            </div>

            {chargeItems.map((item, index) => (
              <div key={index} className='d-flex w-100 py-1'>
                <div style={{ width: '50%' }}>{item.name}</div>
                <div style={{ width: '20%' }}>{item.days}</div>
                <div style={{ width: '30%' }}>{item.amount.toFixed(2)}</div>
              </div>
            ))}

            <hr />
            <div className="mt-3 d-flex w-100 py-1 fw-bold">
              <div style={{ width: '50%' }}>Total Amount</div>
              <div style={{ width: '20%' }}></div>
              <div style={{ width: '30%' }}>{totalAmount.toFixed(2)}</div>
            </div>

            <Row className="mt-2">
              <Col className="text-start">Concession</Col>
            </Row>

            <Row>
              <Col>
                <Form.Control
                  type="number"
                  value={invoiceData.invoice.concession || 0}
                  readOnly
                />
              </Col>
            </Row>

            <div className="mt-3 d-flex w-100 py-1 fw-bold">
              <div style={{ width: '50%' }}>Final Amount</div>
              <div style={{ width: '20%' }}></div>
              <div style={{ width: '30%' }}>{finalAmount.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ backgroundColor: '#A62855', color: 'white' }} className={styles.text}>
            <h6 className='m-0 p-1 mt-2'>ROUND THE CLOCK EMERGENCY SERVICES</h6>
          </div>
        </Modal.Body>

      </div>
      <Modal.Footer>
        <Button variant="secondary" onClick={handlePrintClose}>Close</Button>
        <Button variant="success" onClick={handleDownload}>Download PDF</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoicePrint;



