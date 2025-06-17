import React, { useRef } from "react";
import { Modal, Button, Table, Row, Col } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../../assets/images/sitelogo.svg";
import { Icon } from "@iconify/react";

const PharmacyPrint = ({ invoiceId, getinvoice, show, onClose }) => {
  const totalAmount = parseFloat(
    getinvoice?.items?.reduce(
      (acc, item) => acc + (parseFloat(item.amount) || 0),
      0
    ) || 0
  );

  const totalDiscount = parseFloat(
    getinvoice?.items?.reduce(
      (acc, item) => acc + (parseFloat(item.discount_amount) || 0),
      0
    ) || 0
  );

  const totalTax = parseFloat(
    getinvoice?.items?.reduce(
      (acc, item) => acc + (parseFloat(item.tax_amount) || 0),
      0
    ) || 0
  );

  const netAmount = parseFloat(totalAmount - totalDiscount) || 0;
  const paidAmount = parseFloat(getinvoice?.paid_amount || netAmount + totalTax) || 0;

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
      pdf.save(`PharmacyInvoice_${getinvoice?.Bill_No || invoiceId}.pdf`);
    });
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const content = printRef.current.innerHTML;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            h2, h4, h5, p {
              margin: 4px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #fff;
              padding: 8px;
              text-align: left;
            }
            thead th {
              background-color: #002072 !important;
              color: white !important;
              border: 1px solid #fff !important;
            }
            .text-end { text-align: right; }
            .text-primary { color: #007bff; }
            .m-0 { margin: 0 !important; }
            .mb-0 { margin-bottom: 0 !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-3 { margin-bottom: 1rem !important; }
            .pe-4 { padding-right: 1.5rem !important; }
            .mt-2 { margin-top: 0.5rem !important; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };

  const headerStyle = {
    backgroundColor: "#002072",
    color: "white",
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton />
      <Modal.Body ref={printRef}>
        {getinvoice ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <img
                src={logo}
                alt="Hospital Logo"
                style={{ height: "120px", marginLeft: "20px" }}
              />
              <div>
                <h2 className="m-0" style={{ color: "#A34C51", fontSize: "35px" }}>
                  Sai Teja Multi Speciality Hospital
                </h2>
                <h6
                  className="text-white mt-2 p-1 w-100 ms-2 text-center"
                  style={{ fontSize: "22px", backgroundColor: "#24A1F5" }}
                >
                  (A UNIT OF SAVITHA HEALTH CARE PVT.LTD)
                </h6>
                <p className="ms-3" style={{ fontSize: "11px" }}>
                  <strong>
                    Huda Colony, Kothapet, Saroornagar, Hyderabad – 500 035.{" "}
                    Ph: 040 4006 2725, +91 84840 19791
                  </strong>
                </p>
              </div>
            </div>

            <hr style={{ height: "3px", backgroundColor: "#ccc" }} />

            <h4 className="mb-3">Invoice Details</h4>
            <Row className="mb-2">
              <Col>GST No: 36GXDPS8882J1ZH</Col>
              <Col>DL NO: 135/RR2/AP/2010 </Col>
            </Row>
            <Row className="mb-3">
              <Col>Bill Date: {getinvoice.Bill_Date}</Col>
              <Col>Bill No: {getinvoice.Bill_No}</Col>
            </Row>
            <hr />

            <Row className="mb-2">
              <Col style={{ width: "50%" }}>
                <b>Patient Name:</b> {getinvoice.patient_name}
              </Col>
              <Col style={{ width: "50%" }}>
                <b>Gender:</b> {getinvoice.gender}
              </Col>
            </Row>
            <Row className="mb-3">
              <Col style={{ width: "50%" }}>
                <b>Age:</b> {getinvoice.age}
              </Col>
              <Col style={{ width: "50%" }}>
                <b>Doctor Name:</b> {getinvoice.doctor}
              </Col>
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
                </tr>
              </thead>
              <tbody>
                {getinvoice?.items?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.medication_name}</td>
                    <td>{item.expiry_date}</td>
                    <td>{(Number(item.mrp) || 0).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>{(Number(item.amount) || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="text-end pe-4 mt-3">
              <p>Total Amount: ₹{(Number(totalAmount) || 0).toFixed(2)}</p>
              <p>- Discount: ₹{(Number(totalDiscount) || 0).toFixed(2)}</p>
              <p>Net Amount: ₹{(Number(netAmount) || 0).toFixed(2)}</p>
              <p>+ Tax: ₹{(Number(totalTax) || 0).toFixed(2)}</p>
              <p>Paid Amount: ₹{(Number(getinvoice?.paid_amount) || 0).toFixed(2)}</p>
              <hr style={{ height: "3px", backgroundColor: "#ccc" }} />
              <h5>Total Payable: ₹{(Number(paidAmount) || 0).toFixed(2)}</h5>
            </div>

            <div
              style={{
                backgroundColor: "#A62855",
                color: "white",
                textAlign: "center",
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
        <Button className="no-print" variant="success" onClick={handleDownloadPDF}>
          <Icon icon="mdi:download" /> Download PDF
        </Button>
        <Button className="no-print" variant="outline-primary" onClick={handlePrint}>
          <Icon icon="mdi:printer" className="me-1" /> Print
        </Button>
        <Button className="no-print" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PharmacyPrint;
