import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../assets/images/sitelogo.svg';
import styles from '../css/InvoicePrint.module.css';
import { Icon } from '@iconify/react';
import api from '../../utils/axiosInstance';
 
const InvoicePrint = ({ show, handlePrintClose, patientId }) => {
  const printRef = useRef();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    if (!show || !patientId) return;
 
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const response = await api.get(`invoice/get-invoice/${patientId}/`);
        if (response.data.success === 1) {
          setInvoiceData(response.data.data);
          setError(null);
        } else {
          setError('Failed to fetch invoice data');
          setInvoiceData(null);
        }
      } catch (err) {
        setError('Error fetching invoice: ' + err.message);
        setInvoiceData(null);
      } finally {
        setLoading(false);
      }
    };
 
    fetchInvoice();
  }, [show, patientId]);
 
  const getDateRangeWithDays = (fromDateStr, toDateStr) => {
    if (!fromDateStr || !toDateStr) return '';
    const from = new Date(fromDateStr);
    const to = new Date(toDateStr);
    if (isNaN(from) || isNaN(to)) return '';
    const timeDiff = to - from;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  };
 
  // NEW: iframe-based print handler for 1 page print
  const handlePrint = () => {
    if (!printRef.current) return;
 
    const content = printRef.current.innerHTML;
 
    // Create iframe for printing
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
 
    // Inject styles inside iframe - add Bootstrap CDN + your styles + print-specific CSS for 1 page fit
    doc.write(`
      <html>
      <head>
        <title>Print Invoice</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
        <style>
          /* Basic resets */
          body {
            font-family: Arial, sans-serif;
            margin: 10mm;
            color: #000;
            font-size: 12px;
          }
          .headerContainer {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
          }
          .logo {
            height: 80px;
          }
          h3 {
            margin: 0;
            color: #A34C51;
          }
          h5 {
            margin: 0;
            color: #007bff;
          }
          p {
            margin: 0;
          }
          hr {
            border: 1px solid #ccc;
            margin: 10px 0;
          }
          .charge-summary > div {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
          }
          .charge-summary .header {
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 6px;
          }
          .footerNote {
            margin-top: 20px;
            background-color: #A62855;
            color: white;
            text-align: center;
            padding: 6px 0;
            font-weight: bold;
          }
          /* Fit content to one A4 page */
          @page {
            size: A4;
            margin: 10mm;
          }
          /* Hide buttons or other non-print elements */
          .no-print {
            display: none !important;
          }
          /* Prevent content overflow */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px 6px;
            text-align: left;
          }
          /* Responsive flex for rows */
          .d-flex {
            display: flex !important;
          }
          .justify-between {
            justify-content: space-between !important;
          }
          .w-50 {
            width: 50% !important;
          }
          .w-20 {
            width: 20% !important;
          }
          .w-30 {
            width: 30% !important;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `);
 
    doc.close();
 
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };
 
  if (!show) return null;
 
  if (loading) {
    return (
      <Modal show={show} onHide={handlePrintClose}>
        <Modal.Body>Loading invoice data...</Modal.Body>
      </Modal>
    );
  }
 
  if (error) {
    return (
      <Modal show={show} onHide={handlePrintClose}>
        <Modal.Body>Error: {error}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePrintClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
 
  if (!invoiceData) return null;
 
  const chargeItems = [
    ...(invoiceData.invoice?.service_charges?.map((item) => ({
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
      amount:
        (Number(invoiceData.invoice?.consultation_charges?.no_of_visits) || 0) *
        (Number(invoiceData.invoice?.consultation_charges?.amount_per_visit) || 0),
    },
  ];
 
  const totalAmount = chargeItems.reduce((acc, item) => acc + item.amount, 0);
  const concession = Number(invoiceData.invoice.concession) || 0;
  const finalAmount = totalAmount - concession;
const handleDownload = () => {
  if (!printRef.current) return;
  html2canvas(printRef.current).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('invoice.pdf');
  });
};
 
  return (
    <Modal show={show} onHide={handlePrintClose} dialogClassName={styles.custom} size="md">
      <div className={styles.printContent} ref={printRef}>
          <Modal.Header>
   <div className={` d-flex  ${styles.headerContainer}`}>
    <img src={logo} alt="Hospital Logo" className={styles.logo} />
    <div className={`ms-3 ${styles.hospitalInfo}`}>
      <h3 className={styles.title} style={{ color: '#A34C51' }}>
        Sai Teja Multi Speciality Hospital
      </h3>
      <h5 className={` ${styles.pvt}`}>(A UNIT OF SAVITHA HEALTH CARE PVT.LTD)</h5>
      <p className={styles.address}>
       <strong>
         Huda Colony, Kothapet, Saroornagar, Hyderabad – 500 035. Ph: 040 4006 2725, +91 84840 19791
      </strong>
      </p>
    </div>
   </div>
</Modal.Header>
 
 
 
 
        <Modal.Body>
          <div className="mx-4">
            <h6>Invoice ID : {invoiceData.invoice.invoice_id}</h6>
            <p><strong>Patient Information</strong></p>
            <Row>
              <Col>Name: {invoiceData.patient_info.patient_name}</Col>
              <Col>Age: {invoiceData.patient_info.age} / Sex: {invoiceData.patient_info.gender}</Col>
            </Row>
            <Row>
              <Col>Patient ID: {invoiceData.invoice.patient}</Col>
              <Col>Mobile: {invoiceData.patient_info.mobile_number}</Col>
            </Row>
            <hr />
            <h6>Charge Summary</h6>
 
            <div className="charge-summary">
              <div className="header">
                <div style={{ width: '50%', display: 'inline-block' }}>Service</div>
                <div style={{ width: '20%', display: 'inline-block' }}>Days</div>
                <div style={{ width: '30%', display: 'inline-block' }}>Amount</div>
              </div>
 
              {chargeItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', width: '100%', padding: '4px 0' }}>
                  <div style={{ width: '50%' }}>{item.name}</div>
                  <div style={{ width: '20%' }}>{item.days}</div>
                  <div style={{ width: '30%' }}>{item.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
 
            <hr />
            <div className="d-flex w-100 py-1 fw-bold">
              <div style={{ width: '50%' }}>Total Amount</div>
              <div style={{ width: '20%' }}></div>
              <div style={{ width: '30%' }}>{totalAmount.toFixed(2)}</div>
            </div>
 
            <Row className="mt-2">
              <Col className="text-start">Concession</Col>
            </Row>
 
            <Row>
              <Col>
                <Form.Control type="number" value={concession} readOnly style={{paddingLeft:"480px"}}/>
              </Col>
            </Row>
 
            <div className="d-flex w-100 py-1 fw-bold mt-3">
              <div style={{ width: '50%' }}>Final Amount</div>
              <div style={{ width: '20%' }}></div>
              <div style={{ width: '30%' }}>{finalAmount.toFixed(2)}</div>
            </div>
          </div>
 
          <div className={styles.footerNote} style={{
                backgroundColor: "#A62855",
                color: "white",
                textAlign: "center",
                fontSize: "20px",
                marginBottom: "-12px",
              }}>
            <h6 className="m-0 p-1 mt-2">ROUND THE CLOCK EMERGENCY SERVICES</h6>
          </div>
        </Modal.Body>
      </div>
 
      <Modal.Footer className="down no-print">
        <Button variant="success" onClick={handleDownload}>
          <Icon icon="mdi:download" /> Download PDF
        </Button>
        <Button variant="outline-primary" onClick={handlePrint}>
          <Icon icon="mdi:printer" className="me-1" /> Print
        </Button>
        <Button variant="secondary" onClick={handlePrintClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
 
export default InvoicePrint;
 
 