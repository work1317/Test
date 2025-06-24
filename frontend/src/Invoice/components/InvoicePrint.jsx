import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../assets/images/sitelogo.svg';
import styles from '../css/InvoicePrint.module.css';
import { Icon } from '@iconify/react';
import api from '../../utils/axiosInstance';
 
const InvoicePrint = ({ show, handlePrintClose, invoiceId }) => {  const printRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 const [invoiceData, setInvoiceData] = useState(null);
    useEffect(() => {
    if (!show || !invoiceId) return;
 
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const response = await api.get(`invoice/get-invoice-by-id/${invoiceId}/`);
        if (response.data.success === 1) {
          setInvoiceData(response.data.data);
          setError(null);
          console.log("Response = ",response.data)
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
  }, [show, invoiceId]);
 
 
 
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
  if (!printRef.current || !invoiceData) return;
 
  const {
    invoice: { invoice_id, patient },
    patient_info: { patient_name, age, gender, mobile_number,appointment_type }
  } = invoiceData;
 
  // First page content (full invoice)
  const firstPage = printRef.current.innerHTML;
 
  // Second page content (only header and patient info)
  const secondPage = `
    <div class="headerContainer m-4">
      <img src="${logo}" alt="Hospital Logo" class="logo" />
      <div class="hospitalInfo">
        <h3 style="color: #A34C51;">Sai Teja Multi Speciality Hospital</h3>
        <h5>(A UNIT OF SAVITHA HEALTH CARE PVT.LTD)</h5>
        <p><strong>Huda Colony, Kothapet, Saroornagar, Hyderabad – 500 035. Ph: 040 4006 2725, +91 84840 19791</strong></p>
      </div>
    </div>
    <hr />
    <div class="mx-5 my-2">
      <h6>Invoice ID : ${invoice_id}</h6>
      <p><strong>Patient Information</strong></p>
     <div class="row">
      <div class="col">Name: ${patient_name}</div>
      <div class="col">Age: ${age} / Sex: ${gender}</div>
    </div>
    <div class="row">
      <div class="col">Patient ID: ${patient}</div>
      <div class="col">Mobile: ${mobile_number}</div>
    </div>
    <div class="row">
    <div class="col">Appointment Type: ${appointment_type}</div>
    </div>
  </div>
  <hr />
  `;
 
 
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
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
        <style>
           html, body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 20px;
            width: 100%;
            height: auto;
          }
          .headerContainer {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
          }
          .logo {
            height: 150px;
            width: 150px;
          }
         .watermark {
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.08;
            z-index: 0;
            pointer-events: none;
            width: 400px;
          }
          .hospitalInfo{
            padding-left:30px;
          }
         .hospitalInfo h3 {
            margin: 0;
            color: #A34C51;
            font-size: 48px;
          }
           .hospitalInfo h5 {
            background-color: #24A1F5;
            color: white;
            font-size: 30px;
            padding: 5px 16px;
            margin: 6px 9px;
          }
          .hospitalInfo p {
            margin: 0;
            font-size:15px;
          }
          hr {
            border: 1px solid #ccc;
            margin: 10px 0;
          }
          .num{
            padding-right: 230px;
          }
          .footerNote {
            position: fixed;
            bottom: 1%;
            width: 100%;
            background-color: #A62855;
            color: white;
            text-align: center;
            font-size: 16px;
            padding: 6px 0;
            left:0px;
          }
          @page {
            size: A4;
            margin: 10mm 10mm;
          }
        </style>
      </head>
      <body>
      <img src="${logo}" class="watermark" />
        <div class="content">
        ${firstPage}
        <div style="page-break-before: always;"></div>
        ${secondPage}
        <div class="footerNote">
          ROUND THE CLOCK EMERGENCY SERVICES
        </div>
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
      amount: Number(invoiceData.invoice?.investigation_charges?.amount) || 0,
    },
    {
      name: 'Pharmacy Charges',
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
   <div className={` d-flex  ${styles.headerContainer} headerContainer`}>
    <img src={logo} alt="Hospital Logo" className='logo' />
    <div className={`ms-3 ${styles.hospitalInfo} hospitalInfo`}>
      <h3 className={styles.title} style={{ color: '#A34C51' }}>
        Sai Teja Multi Speciality Hospital
      </h3>
      <h5 className={`${styles.pvt}`}>(A UNIT OF SAVITHA HEALTH CARE PVT.LTD)</h5>
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
              <Col>Age: {invoiceData.patient_info.age} / Gender: {invoiceData.patient_info.gender}</Col>
            </Row>
            <Row>
              <Col>Patient ID: {invoiceData.invoice.patient}</Col>
              <Col>Mobile: {invoiceData.patient_info.mobile_number}</Col>
            </Row>
            <Row>
              <Col>Appointment Type : {invoiceData.patient_info.appointment_type}</Col>
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
                <Form.Control type="number" value={concession} style={{textAlign:"right"}} className={`${styles.inputs} num`} readOnly />
              </Col>
            </Row>
 
            <div className="d-flex w-100 py-1 fw-bold mt-3">
              <div style={{ width: '50%' }}>Final Amount</div>
              <div style={{ width: '20%' }}></div>
              <div style={{ width: '30%', float:"left"}}>{finalAmount.toFixed(2)}</div>
            </div>
          </div>
{/*  
          <div className={styles.footerNote} style={{
                backgroundColor: "#A62855",
                color: "white",
                textAlign: "center",
                fontSize: "20px",
                marginBottom: "-12px",
              }}>
            <h6 className="m-0 p-1 mt-2">ROUND THE CLOCK EMERGENCY SERVICES</h6>
          </div> */}
        </Modal.Body>
      </div>
 
     <Modal.Footer className="down no-print">
         <div className={styles.footerNote} style={{
                backgroundColor: "#A62855",
                color: "white",
                textAlign: "center",
                fontSize: "20px",
                marginBottom: "-12px",
              }}>
            <h6 className=" p-1 mt-2">ROUND THE CLOCK EMERGENCY SERVICES</h6>
          </div>
          <div className='mt-4'>
        <Button variant="success " onClick={handleDownload}>
          <Icon icon="mdi:download" /> Download PDF
        </Button>
        <Button variant="outline-primary ms-2" onClick={handlePrint}>
          <Icon icon="mdi:printer" className="me-1" /> Print
        </Button>
        <Button variant="secondary ms-2" onClick={handlePrintClose}>
          Close
        </Button>
        </div>
      </Modal.Footer>
    
    </Modal>
  );
};
 
export default InvoicePrint;