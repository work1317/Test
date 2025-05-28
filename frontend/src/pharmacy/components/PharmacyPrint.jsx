import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Table, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/images/sitelogo.svg";
import { Icon } from "@iconify/react";
 
const PharmacyPrint = ({ invoiceId, getinvoice, show, onClose }) => {
  const totalAmount =
    getinvoice?.items?.reduce((acc, item) => acc + item.amount, 0) || 0;
  const totalDiscount =
    getinvoice?.items?.reduce((acc, item) => acc + item.discount_amount, 0) ||
    0;
  const totalTax =
    getinvoice?.items?.reduce((acc, item) => acc + item.tax_amount, 0) || 0;
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
 
  const headerStyle = {
    backgroundColor: "#002072",
    color: "white",
  };
 
 const handlePrint = () => {
  if (!printRef.current) return;
 
  const content = printRef.current.innerHTML;
 
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
 
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          h2, h4, h5, p { margin: 4px 0; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
  doc.close();
 
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    document.body.removeChild(iframe); // Clean up after print
  };
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
                  Huda Colony, Kothapet, Saroornagar, Hyderabad – 500 035.{" "}
                  <br />
                  Ph: 040 4006 2725, +91 84840 19791
                </p>
              </Col>
            </Row>
 
            <hr style={{ height: "3px", backgroundColor: "#ccc" }} />
 
            <h4 className="mb-3">Invoice Details</h4>
            <Row className="mb-2">
              {/* <Col>DL.No: {getinvoice.bill_no}</Col> */}
              <Col>GST No: 36GXDPS888251ZH</Col>
              <Col>DL NO: 135/RR2/AP/2010 </Col>
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
                  <th style={headerStyle}>Exp Date</th>
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
                marginBottom: "-12px",
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
 
        <Button
          className="no-print"
          variant="outline-primary"
          onClick={handlePrint}
        >
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