// // import React, { useRef, useEffect, useState } from 'react';
// // import { Modal, Button, Table, Row, Col, Spinner } from 'react-bootstrap';
// // import html2canvas from 'html2canvas';
// // import jsPDF from 'jspdf';
// // import axios from 'axios';
// // import logo from '../assets/sitelogo.svg';

// // const PharmacyPrint = ({ show, handleClose, invoiceId }) => {
// //   const printRef = useRef();
// //   const [invoiceData, setInvoiceData] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   const fetchInvoice = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await axios.get(`http://127.0.0.1:8000/p_invoice/list-invoice-with-items/${invoiceId}/`);
// //       console.log("print details fetched successfully",res.data.data);
// //       setInvoiceData(res.data.data);
// //     } catch (error) {
// //       console.error("Error fetching invoice:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (show && invoiceId) {
// //       fetchInvoice();
// //     }
// //   }, [show, invoiceId]);

// //   const handleDownload = () => {
// //     html2canvas(printRef.current).then(canvas => {
// //       const imgData = canvas.toDataURL('image/png');
// //       const pdf = new jsPDF();
// //       const imgProps = pdf.getImageProperties(imgData);
// //       const pdfWidth = pdf.internal.pageSize.getWidth();
// //       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
// //       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
// //       pdf.save('invoice.pdf');
// //     });
// //   };

// //   const tableHeaderStyle = {
// //     color: 'white',
// //     backgroundColor: '#002072',
// //   };

// //   const pinkBannerStyle = {
// //     backgroundColor: '#A62855',
// //     color: 'white',
// //     textAlign: 'center',
// //     padding: '10px',
// //     fontSize: '20px',
// //   };

// //   const thickLine = {
// //     height: '3px',
// //     backgroundColor: '#ccc',
// //     border: 'none',
// //     margin: '1rem 0',
// //   };

// //   if (loading) {
// //     return (
// //       <Modal show={show} onHide={handleClose} size="lg">
// //         <Modal.Body className="text-center py-5">
// //           <Spinner animation="border" variant="primary" />
// //           <div>Loading invoice...</div>
// //         </Modal.Body>
// //       </Modal>
// //     );
// //   }

// //   if (!invoiceData) return null;

// //   const { invoice, items, summary } = invoiceData;

// //   return (
// //     <Modal show={show} onHide={handleClose} size="lg">
// //       <Modal.Header closeButton />
// //       <Modal.Body ref={printRef}>
// //         <div>
// //           <Row className="align-items-center">
// //             <Col xs="auto" md={3}>
// //               <img src={logo} alt="Hospital Logo" className='ms-4' style={{ height: '110px' }} />
// //             </Col>
// //             <Col md={9}>
// //               <h2 className="m-0" style={{ color: '#A34C51' }}>Sai Teja Multi Speciality Hospital</h2>
// //               <h5 className="text-primary m-0">(A UNIT OF SAVITHA HEALTH CARE PVT.LTD)</h5>
// //               <p className="mb-0">
// //                 Huda Colony, Kothapet, Saroornagar, Hyderabad – 500 035. <br />
// //                 Ph: 040 4006 2725, +91 84840 19791
// //               </p>
// //             </Col>
// //           </Row>

// //           <hr style={thickLine} />

// //           <h4 className="mb-3">Invoice Details</h4>
// //           <Row className="mb-2">
// //             <Col>DL.No: {invoice.bill_no}</Col>
// //             <Col>GST No: GST0123456</Col>
// //           </Row>
// //           <Row className="mb-3">
// //             <Col>Bill Date: {invoice.bill_date}</Col>
// //             <Col>Bill No: {invoice.bill_no}</Col>
// //           </Row>

// //           <hr style={thickLine} />

// //           <Row className="mb-3">
// //             <Col><b>Patient Name:</b> {invoice.patient_name}</Col>
// //             <Col><b>Age:</b> {invoice.age}</Col>
// //             <Col><b>Sex:</b> {invoice.gender}</Col>
// //             <Col><b>Doctor Name:</b> {invoice.doctor_name}</Col>
// //           </Row>

// //           <Table striped bordered>
// //             <thead>
// //               <tr>
// //                 <th style={tableHeaderStyle}>Medicine</th>
// //                 <th style={tableHeaderStyle}>Exp Date</th>
// //                 <th style={tableHeaderStyle}>MRP</th>
// //                 <th style={tableHeaderStyle}>Qty</th>
// //                 <th style={tableHeaderStyle}>Amount</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {items.map((item, idx) => (
// //                 <tr key={idx}>
// //                   <td>{item.medication_name}</td>
// //                   <td>{item.expiry_date}</td>
// //                   <td>{item.mrp}</td>
// //                   <td>{item.quantity}</td>
// //                   <td>{item.amount}</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </Table>

// //           <div className="text-end pe-4 mt-3">
// //             <p>Total Amount: ₹{summary.total_amount}</p>
// //             <p>Discount: ₹{summary.total_discount}</p>
// //             <p>Tax: ₹{summary.total_tax}</p>
// //             <hr style={thickLine} />
// //             <h5>Total Payable: ₹{summary.total_paid_amount}</h5>
// //           </div>
// //         </div>

// //         <div style={pinkBannerStyle}>
// //           <p>ROUND THE CLOCK EMERGENCY SERVICES</p>
// //         </div>
// //       </Modal.Body>

// //       <Modal.Footer>
// //         <Button variant="secondary" onClick={handleClose}>Close</Button>
// //         <Button variant="success" onClick={handleDownload}>Download PDF</Button>
// //       </Modal.Footer>
// //     </Modal>
// //   );
// // };

// // export default PharmacyPrint;










import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Table, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/images/sitelogo.svg";
import { Icon } from "@iconify/react";

const PharmacyPrint = ({ invoiceId,getinvoice, show, onClose }) => {



  const totalAmount = getinvoice?.items?.reduce((acc, item) => acc + item.amount, 0) || 0;
const totalDiscount = getinvoice?.items?.reduce((acc, item) => acc + item.discount_amount, 0) || 0;
const totalTax = getinvoice?.items?.reduce((acc, item) => acc + item.tax_amount, 0) || 0;
const netAmount = totalAmount - totalDiscount + totalTax;
const paidAmount = getinvoice?.paid_amount || "0.00";

 
  const printRef = useRef();

  

  const handleDownloadPDF = () => {
    if (!printRef.current) return;
    
    html2canvas(printRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PharmacyInvoice_${getinvoice?.Bill_No || getinvoice}.pdf`);
    });
  };


  
  const headerStyle =  { 
    backgroundColor: "#002072",
     color: "white"
     };


  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton />
      <Modal.Body ref={printRef}>
         {getinvoice ? (
          <>
            <Row className="align-items-center">
              <Col xs="auto" md={3}>
                <img
                  src={logo}
                  alt="Hospital Logo"
                  className="ms-4"
                  style={{ height: "120px" }}
                />
              </Col>
              <Col md={9}>
                <h2 className="m-0" style={{ color: "#A34C51" }}>
                  Sai Teja Multi Speciality Hospital
                </h2>
                <h5 className="text-primary">
                  (A UNIT OF SAVITHA HEALTH CARE PVT.LTD)
                </h5>
                <p className="mb-0">
                  Huda Colony, Kothapet, Saroornagar, Hyderabad – 500 035. <br />
                  Ph: 040 4006 2725, +91 84840 19791
                </p>
              </Col>
            </Row>

            <hr style={{ height: "3px", backgroundColor: "#ccc" }} />

            <h4 className="mb-3">Invoice Details</h4>
            <Row className="mb-2">
              {/* <Col>DL.No: {getinvoice.bill_no}</Col> */}
              <Col>GST No: GST0123456</Col>
              <Col>DL NO: GST0123456 </Col>
            </Row>
            <Row className="mb-3">
              <Col>Bill Date: {getinvoice.Bill_Date}</Col>
               <Col>Bill No: {getinvoice.Bill_No}</Col>
            </Row>
            <hr />

            <Row className="mb-3">
              <Col>
                <b>Patient Name:</b> {getinvoice.patient_name}
              </Col>
              <Col>
                <b>Age:</b> {getinvoice.age}
              </Col>
              <Row>
              <Col>
                <b>Sex:</b> {getinvoice.gender}
              </Col>
              <Col>
                <b>Doctor Name:</b> {getinvoice.doctor_name}
              </Col>
              </Row>
            </Row>
            <hr />
<Table striped bordered>
  <thead>
    <tr>
      <th style={headerStyle}>Medicine</th>
      <th  style={headerStyle}>Exp Date</th>
      <th style={headerStyle}>MRP</th>
      <th style={headerStyle}>Qty</th>
      <th style={headerStyle}>Amount</th>
      {/* <th style={headerStyle}>Discount</th>
      <th style={headerStyle}>Tax</th>
      <th style={headerStyle}>Net Amount</th> */}
    </tr>
  </thead>
  <tbody>
    {getinvoice?.items?.map((item, index) => (
      <tr key={index}>
        <td>{item.medication_name}</td>
        <td>{item.expiry_date}</td>
        <td>{item.mrp}</td>
        <td>{item.quantity}</td>
        <td>{item.amount}</td>
        {/* <td>{item.discount_amount}</td>
        <td>{item.tax_amount}</td>
        <td>{item.net_amount}</td> */}
      </tr>
    ))}
  </tbody>
</Table>

    <div className="text-end pe-4 mt-3">
        <p>Total Amount: ₹{totalAmount}</p>
        <p>Net Amount : ₹{netAmount}</p>
        <p>paid Amount: ₹{paidAmount}</p>
        <p>Discount: ₹{totalDiscount}</p>
        <p>Tax: ₹{totalTax}</p>
        <hr style={{ height: "3px", backgroundColor: "#ccc" }} />
        <h5>Total Payable: ₹{netAmount}</h5>
      </div>


            <div
              style={{
                backgroundColor: "#A62855",
                color: "white",
                textAlign: "center",
                padding: "1px",
                fontSize: "20px",
                marginBottom:"-12px",
               
              }}
            >
              <p className="mt-2">ROUND THE CLOCK EMERGENCY SERVICES</p>
            </div>
          </>
        ) : (
          <p>No invoice data available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleDownloadPDF}>
          <Icon icon="mdi:download" /> Download PDF
        </Button>
        <Button variant="outline-primary" onClick={() => window.print()}>
         <Icon icon="mdi:printer" className="me-1" /> Print
         </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PharmacyPrint;



