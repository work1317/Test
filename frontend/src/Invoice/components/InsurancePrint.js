import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, Col, Row } from "react-bootstrap";
import styles from "../css/InsurancePrint.module.css";
import logos from "../../../src/assets/images/sitelogo.svg";
import html2canvas from "html2canvas";
import api from "../../utils/axiosInstance";
import jsPDF from 'jspdf';
import { Icon } from '@iconify/react';

function InsurancePrint({ show, handlePrintClose, invoiceId }) {
  const pageRef1 = useRef();
  const pageRef2 = useRef();
  const pageRef3 = useRef();
  const pageRef4 = useRef();
  const pageRef5 = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    if (!show || !invoiceId) return;

    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `invoice/get-invoice-by-id/${invoiceId}/`
        );
        if (response.data.success === 1) {
          setInvoiceData(response.data.data);
          setError(null);
          console.log("Response = ", response.data);
        } else {
          setError("Failed to fetch invoice data");
          setInvoiceData(null);
        }
      } catch (err) {
        setError("Error fetching invoice: " + err.message);
        setInvoiceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [show, invoiceId]);

const handleDownload = async () => {
  const refs = [pageRef1, pageRef2, pageRef3, pageRef4, pageRef5];
  const pdf = new jsPDF();

  const images = await Promise.all(
    refs.map(async (ref) => {
      if (!ref.current) return null;
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      return canvas.toDataURL("image/png");
    })
  );

  images
    .filter(Boolean)
    .forEach((imgData, index) => {
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      if (index !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    });

  pdf.save("invoice.pdf");
};


  const handlePrint = async () => {
    const refs = [pageRef1, pageRef2, pageRef3, pageRef4, pageRef5]; // Add pageRef4 if needed

    const images = await Promise.all(
      refs.map(async (ref) => {
        const canvas = await html2canvas(ref.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        return canvas.toDataURL("image/png");
      })
    );

    const printWindow = window.open("", "_blank", "width=900,height=650");

    printWindow.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: 'Poppins', sans-serif;
            }

            .page {
              width: 210mm;
              height: 297mm;
              padding: 20mm;
              box-sizing: border-box;
              page-break-after: always;
              position: relative;
            }

            .header {
              display: flex;
              align-items: center;
              gap: 20px;
              border-bottom: 3px solid #e0e0e0;
              padding-bottom: 10px;
              margin-bottom: 1rem;
            }

            .logo {
              width: 100px;
              height: auto;
            }

            .img {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }

            .hospitalName {
              font-family: Poppins;
              font-weight: 500;
              font-size: 2rem;
              line-height: 100%;
              letter-spacing: 0%;
              color: #a32451;
              margin: 0;
              margin-left: 1rem
            }

            .unit {
              background-color: #24a1f5;
              color: #ffffff;
              font-size: 1.rem;
              text-align: center;
              margin: 0;
              padding: 6px 0;
              width: 83%;
              display: block;
              font-weight:500;
              margin-top:10px;
              margin-left:20px;
            }


            .address {
              font-family: Poppins;
              font-weight: 500;
              font-size: 0.8rem;
              line-height: 100%;
              letter-spacing: 0%;
              margin: 0;
              margin-top:10px;
            }

            .footer {
              position: absolute;
              bottom: 0;
              width: 100%;
              background-color: #A62855;
              color: white;
              text-align: center;
              font-size: 16px;
              padding: 6px 0;
            }

            img.print-img {
              width: 100%;
              height: auto;
              margin-top: 10px;
              margin-bottom: 40px;
            }
          }
        </style>
      </head>
      <body>
        ${images
          .map(
            (img) => `
          <div class="page">
            <div class="header">
              <div class="img">
                <img class="logo" src="${logos}" alt="Site Logo" />
                <div>
                  <h4 class="hospitalName">Sai Teja Multi Speciality Hospital</h4>
                  <h4 class="unit">(A UNIT OF SAVITHA HEALTH CARE PVT.LTD)</h4>
                  <p class="address">
                    Huda Colony, Kothapet, Saroornagar, Hyderabad - 500 035.
                    <strong> Ph: 040 4006 27 25, +91 84840 19781</strong>
                  </p>
                </div>
              </div>
            </div>
            <img class="print-img" src="${img}" />
            <div class="footer">ROUND THE CLOCK EMERGENCY SERVICES</div>
          </div>
        `
          )
          .join("")}

          <script>
          window.onload = () => {
            alert("👉 Please enable 'Background graphics' under 'More settings' in Print for accurate colors.");
            window.print();
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <>
      <div className={styles.overlayContainer}>
        <Modal
          show={show}
          onHide={handlePrintClose}
          dialogClassName={styles.custom}
          size="md"
        >
          <div className={styles.page}>
            <Modal.Header ref={pageRef1}>
              <div className={styles.header}>
                <div className={styles.img}>
                  <img className={styles.logo} src={logos} alt="Site Logo" />

                  <div>
                    <h4 className={styles.hospitalName}>
                      Sai Teja Multi Speciality Hospital
                    </h4>
                    <h4 className={styles.unit}>
                      (A UNIT OF SAVITHA HEALTH CARE PVT.LTD)
                    </h4>
                    <p className={styles.address}>
                      Huda Colony, Kothapet , Saroornagar, Hyderabad - 500 035.
                      <strong> Ph: 040 4006 27 25, +91 84840 19781</strong>
                    </p>
                  </div>
                </div>
              </div>
            </Modal.Header>

            <div ref={pageRef1} className={styles.invoiceContainer}>
              <div className={styles.insuranceBox}>
                <div className={styles.sectionTitle}>Insurance Invoice</div>
                <div className={styles.buttonCenter}>
                  <Button
                    variant="primary"
                    size="sm"
                    className={styles.detailBtn}
                  >
                    IP Detailed Bill
                  </Button>
                </div>

                {/* Patient & Invoice Info */}
                <div className={styles.infoGrid}>
                  <div>
                    <span className={styles.label}>Patient ID</span>
                    <span className={styles.value}>
                      : {invoiceData?.invoice?.patient || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Consultant</span>
                    <span className={styles.value}>
                      : {invoiceData?.invoice?.consultant|| "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Patient Name</span>
                    <span className={styles.value}>
                      : {invoiceData?.patient_info?.patient_name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Care Type</span>
                    <span className={styles.value}>
                      : {invoiceData?.invoice?.care_type ?? "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Appointment Type</span>
                    <span className={styles.value}>
                      : {invoiceData?.patient_info?.appointment_type || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Invoice Date</span>
                    <span className={styles.value}>
                      : {invoiceData?.invoice?.date || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Age</span>
                    <span className={styles.value}>
                      : {invoiceData?.patient_info?.age || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Invoice Number</span>
                    <span className={styles.value}>
                      : {invoiceData?.invoice?.invoice_id || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Gender</span>
                    <span className={styles.value}>
                      : {invoiceData?.patient_info?.gender || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Admitted Date</span>
                    <span className={styles.value}>
                      : {invoiceData?.invoice?.admitted_date || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Attendant Name</span>
                    <span className={styles.value}>
  : {invoiceData?.invoice?.attendant_name ?? "-"}
</span>
                  </div>
                  <div>
                    <span className={styles.label}>Discharge Date</span>
                    <span className={styles.value}>
                      : {invoiceData?.invoice?.discharged_date || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Attendant Mobile</span>
                    <span className={styles.value}>
                      : {invoiceData?.invoice?.attendant_phno || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Room Type</span>
                    <span className={styles.value}>
                      : {invoiceData?.invoice?.room_type ?? "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Referral Doctor</span>
                    <span className={styles.value}>
                      : {invoiceData?.patient_info?.doctor_name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Room No</span>
                    <span className={styles.value}>
                      : {invoiceData?.patient_info?.ward || "-"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.servicesBox}>
                <div className={styles.sectionTitle}>Service Charges</div>
                <table className={`table table-bordered ${styles.table}`}>
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Days</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData?.invoice?.service_charges?.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>{item.service_name}</td>
                          <td>{item.days}</td>
                          <td>{item.amount}</td>
                        </tr>
                      )
                    )}
                    <tr>
                      <td colSpan="2">
                        <strong>Total</strong>
                      </td>
                      <td>
                        <strong>
                          ₹
                          {invoiceData?.invoice?.service_charges
                            ?.reduce(
                              (total, item) => total + parseFloat(item.amount),
                              0
                            )
                            .toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* payment method */}
            <div ref={pageRef2}>
              <div className={styles.servicesBox}>
                <div className={styles.sectionTitle}>Service Charges</div>
                <div className={styles.moduls1}>
                  <p>Investigation/Lab Charges</p>
                </div>
                <div className={styles.modules2}>
                  <table className={`table table-bordered ${styles.table1}`}>
                    <thead>
                      <tr>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {invoiceData?.invoice?.investigation_charges
                            ?.from_date || "-"}
                        </td>
                        <td>
                          {invoiceData?.invoice?.investigation_charges
                            ?.to_date || "-"}
                        </td>
                        <td>
                          {invoiceData?.invoice?.investigation_charges
                            ?.amount || "0.00"}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2">
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>
                            ={" "}
                            {invoiceData?.invoice?.investigation_charges
                              ?.amount || "0.00"}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className={styles.moduls1}>
                  <p>Pharmacy Charges</p>
                </div>
                <div className={styles.modules2}>
                  <table className={`table table-bordered ${styles.table1}`}>
                    <thead>
                      <tr>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {invoiceData?.invoice?.pharmacy_charges?.from_date ||
                            "-"}
                        </td>
                        <td>
                          {invoiceData?.invoice?.pharmacy_charges?.to_date ||
                            "-"}
                        </td>
                        <td>
                          {invoiceData?.invoice?.pharmacy_charges?.amount ||
                            "0.00"}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2">
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>
                            ={" "}
                            {invoiceData?.invoice?.pharmacy_charges?.amount ||
                              "0.00"}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div ref={pageRef3}>
              <div className={styles.servicesBox}>
                <div className={styles.sectionTitle}>Payment Details </div>
                <div className={styles.modules3}>
                  <table className={`table table-bordered ${styles.table1}`}>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Payment Mode</td>
                        <td>{invoiceData?.invoice?.payment_method || "-"}</td>
                      </tr>
                      <tr>
                        <td>Concession</td>
                        <td>{invoiceData?.invoice?.concession || "0.00"}</td>
                      </tr>
                      <tr>
                        <td>Settlement Amount</td>
                        <td>{invoiceData?.totals?.final_total || "0.00"}</td>
                      </tr>
                      <tr>
                        <td>Received Amount</td>
                        <td>{invoiceData?.totals?.final_total || "0.00"}</td>
                      </tr>
                      <tr>
                        <td>Total</td>
                        <td>
                          <strong>
                            ₹{invoiceData?.totals?.final_total || "0.00"}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bills Summary */}
            <div ref={pageRef4}>
              <div className={styles.insuranceBox}>
                <div className={styles.sectionTitle}>Bills Summary</div>
                <div className={styles.infoGrid}>
                  <div>
                    <span className={styles.label}>Appointment Type</span>
                    <span className={styles.value}>
                      :{invoiceData?.patient_info?.appointment_type || "-"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Lab Details Discount</span>
                    <span className={styles.value}>:0</span>{" "}
                    {/* Replace if discount logic available */}
                  </div>
                  <div>
                    <span className={styles.label}>Pharmacy Sales Totals</span>
                    <span className={styles.value}>
                      :{invoiceData?.totals?.pharmacy || "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Lab Details Net</span>
                    <span className={styles.value}>
                      :{invoiceData?.totals?.investigation || "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Pharmacy</span>
                    <span className={styles.value}>
                      :{invoiceData?.totals?.pharmacy || "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Paid</span>
                    <span className={styles.value}>
                      :{invoiceData?.totals?.final_total || "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Discount</span>
                    <span className={styles.value}>
                      :{invoiceData?.totals?.concession || "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Refunded</span>
                    <span className={styles.value}>:0</span>{" "}
                    {/* Replace if available */}
                  </div>
                  <div>
                    <span className={styles.label}>Pharmacy Sales Net</span>
                    <span className={styles.value}>
                      :{invoiceData?.totals?.pharmacy || "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Concession/Adjustment</span>
                    <span className={styles.value}>
                      :{invoiceData?.invoice?.concession || "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Lab Details Total</span>
                    <span className={styles.value}>
                      :{invoiceData?.totals?.investigation || "0.00"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Due Amount</span>
                    <span className={styles.value}>
                      :
                      {invoiceData?.invoice?.due_on_receipt === "yes"
                        ? invoiceData?.totals?.final_total || "0.00"
                        : "0.00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pharmacy sales */}

              <div className={styles.servicesBox}>
                <div className={styles.sectionTitle}>Payment Details </div>
                <div className={styles.modules4}>
                  <table className={`table table-bordered ${styles.table2}`}>
                    <thead>
                      <tr>
                        <th
                          colSpan="8"
                          style={{
                            background: "#003366",
                            color: "white",
                            textAlign: "center",
                          }}
                          className={styles.pharmacyHeader}
                        >
                          Pharmacy Sales Details
                        </th>
                      </tr>
                      <tr>
                        <th>Mrno/Ipno</th>
                        <th>Bill No</th>
                        <th>Create Date</th>
                        <th>Total Amount</th>
                        <th>Disc Amount</th>
                        <th>Net Amount</th>
                        <th>Paid/Adj</th>
                        <th>Due Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData?.pharmacy_info?.map((entry, index) => (
                        <tr key={index}>
                          <td>{invoiceData?.invoice?.patient || "-"}</td>
                          <td>{entry.Bill_No || "-"}</td>
                          <td>{entry.created_date || "-"}</td>
                          <td>{entry.total_amount || "0.00"}</td>
                          <td>{entry.discount_amount || "0.00"}</td>
                          <td>{entry.net_amount || "0.00"}</td>
                          <td>{entry.paid_amount || "0.00"}</td>
                          <td>{entry.due || "0.00"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Labs */}
              <div className={styles.servicesBox}>
                <div className={styles.sectionTitle}>Labs Details</div>
                <div className={styles.modules4}>
                  <table className={`table table-bordered ${styles.table2}`}>
                    <thead>
                      <tr>
                        <th
                          colSpan="8"
                          style={{
                            background: "#003366",
                            color: "white",
                            textAlign: "center",
                          }}
                          className={styles.pharmacyHeader}
                        >
                          Labs Sales Details
                        </th>
                      </tr>
                      <tr>
                        <th>Mrno/Ipno</th>
                        <th>Bill No</th>
                        <th>Create Date</th>
                        <th>Total Amount</th>
                        <th>Disc Amount</th>
                        <th>Net Amount</th>
                        <th>Paid/Adj</th>
                        <th>Due Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData?.lab_info?.length > 0 ? (
                        invoiceData.lab_info.map((lab, index) => (
                          <tr key={index}>
                            <td>{invoiceData?.invoice?.patient || "-"}</td>
                            <td>{lab.bill_no || "-"}</td>
                            <td>{lab.created_at || "-"}</td>
                            <td>{lab.total_amount || "0.00"}</td>
                            <td>{lab.discount || "0.00"}</td>
                            <td>{lab.total_amount || "0.00"}</td>
                            <td>{lab.total_amount || "0.00"}</td>
                            <td>{lab.due || "0.00"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center" }}>
                            No Lab Details Available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div ref={pageRef5}>
              {/* IP Settlement Receipt */}
              <div className="border rounded p-3">
                <div className={`rounded-top mb-2 ${styles.heading}`}>
                  IP Settlement Receipts
                </div>
                <Row>
                  <Col>
                    <p>
                      <b>Patient ID : </b>
                      {invoiceData?.invoice?.patient || "-"}
                    </p>
                    <p>
                      <b>Type of Appointment : </b>
                      {invoiceData?.patient_info?.appointment_type || "-"}
                    </p>
                    <p>
                      <b>Name : </b>
                      {invoiceData?.patient_info?.patient_name || "-"}
                    </p>
                    <p>
                      <b>Age : </b>
                      {invoiceData?.patient_info?.age || "-"}
                    </p>
                    <p>
                      <b>Gender : </b>
                      {invoiceData?.patient_info?.gender || "-"}
                    </p>
                    <p>
                      <b>Received Amount : </b>
                      {invoiceData?.totals?.final_total || "0.00"}
                    </p>
                  </Col>
                  <Col>
                    <p>
                      <b>Due Amount : </b>
                      {invoiceData?.totals?.due || "0.00"}
                    </p>
                    <p>
                      <b>Bill Date : </b>
                      {invoiceData?.invoice?.date || "-"}
                    </p>
                    <p>
                      <b>Invoice Number : </b>
                      {invoiceData?.invoice?.invoice_id || "-"}
                    </p>
                    <p>
                      <b>Amount in words : </b>
                      {invoiceData?.totals?.words_in_rupees || "-"}
                    </p>
                    <p>
                      <b>Print Date and Time : </b>
                      {new Date().toLocaleString("en-IN")}
                    </p>
                  </Col>
                  <h5>
                    Reception Authorized Signatory : __________________________
                  </h5>
                </Row>
              </div>

              {/* IP Checkout Slip */}
              <div className="border rounded p-3 mt-4">
                <div className={`rounded-top mb-2 ${styles.heading}`}>
                  IP Checkout Slip
                </div>
                <Row>
                  <Col>
                    <p>
                      <b>Patient ID : </b>
                      {invoiceData?.invoice?.patient || "-"}
                    </p>
                    <p>
                      <b>Type of Appointment : </b>
                      {invoiceData?.patient_info?.appointment_type || "-"}
                    </p>
                    <p>
                      <b>Name : </b>
                      {invoiceData?.patient_info?.patient_name || "-"}
                    </p>
                    <p>
                      <b>Age : </b>
                      {invoiceData?.patient_info?.age || "-"}
                    </p>
                    <p>
                      <b>Gender : </b>
                      {invoiceData?.patient_info?.gender || "-"}
                    </p>
                    <p>
                      <b>Room Number : </b>
                      {invoiceData?.patient_info?.ward || "-"}
                    </p>
                  </Col>
                  <Col>
                    <p>
                      <b>Room Type : </b>
                      {invoiceData?.invoice?.room_type || "-"}
                    </p>
                    <p>
                      <b>Consultant Doctor : </b>
                      {invoiceData?.invoice?.consultant || "-"}
                    </p>
                    <p>
                      <b>Date of Arrival : </b>
                      {invoiceData?.invoice?.admitted_date || "-"}
                    </p>
                    <p>
                      <b>Date Of Departure : </b>
                      {invoiceData?.invoice?.discharged_date || "-"}
                    </p>
                    <p>
                     
                      <b>Patient’s Condition : </b>  {invoiceData?.invoice?.progress_status || "-"}, {invoiceData?.invoice?.progress_notes || "-"}
                    </p>
                  </Col>
                  <h5>
                    Reception Authorized Signatory : ___________________________
                  </h5>
                </Row>
              </div>
            </div>

            <Modal.Footer className="down no-print">
              <div className="text-center mt-3">
                  <Button variant="success " className="me-2" onClick={handleDownload}>
                          <Icon icon="mdi:download" /> Download PDF
                        </Button>

                <Button onClick={handlePrint} variant="outline-primary">
                  Print
                </Button>
                <Button variant="secondary ms-2" onClick={handlePrintClose}>
                  Close
                </Button>
              </div>

              <div className={styles.footer}>
                <p>ROUND THE CLOCK EMERGENCY SERVICES</p>
              </div>
            </Modal.Footer>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default InsurancePrint;
