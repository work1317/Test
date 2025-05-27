import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../assets/images/sitelogo.svg';
import styles from '../css/InvoicePrint.module.css';

const InvoicePrint = ({ show, handlePrintClose, patientId }) => {
  const printRef = useRef();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch invoice data when component mounts or when `show` or `patientId` changes
  useEffect(() => {
    if (!show || !patientId) return;

    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/invoice/get-invoice/${patientId}/`
        );
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

  const handleDownload = () => {
    if (!printRef.current) return;

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
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ${days > 1 ? '' : ''}`;
  };

  if (!show) return null;

  if (loading) return <Modal show={show} onHide={handlePrintClose}><Modal.Body>Loading invoice data...</Modal.Body></Modal>;

  if (error)
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

  if (!invoiceData) return null;

  // prepare chargeItems same as before
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
      days: invoiceData.invoice?.consultation_charges?.no_of_visits || 0,
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



