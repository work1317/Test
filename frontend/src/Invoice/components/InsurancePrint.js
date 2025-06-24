import React, { useRef } from "react";
import { Modal, Button,Col,Row } from "react-bootstrap";
import styles from "../css/InsurancePrint.module.css";
import logos from "../../../src/assets/images/sitelogo.svg";
import html2canvas from "html2canvas";

function InsurancePrint({ show, handlePrintClose, invoiceData }) {
  const pageRef1 = useRef();
  const pageRef2 = useRef();
  const pageRef3 = useRef();
  const pageRef4 = useRef();
  const pageRef5 = useRef();

  // const handlePrint = async () => {
  //   const refs = [pageRef1, pageRef2, pageRef3,pageRef4 ];

  //   const images = await Promise.all(
  //     refs.map(async (ref) => {
  //       const canvas = await html2canvas(ref.current, {
  //         scale: 2,
  //         useCORS: true,
  //         backgroundColor: "#ffffff",
  //       });
  //       return canvas.toDataURL("image/png");
  //     })
  //   );

  //   const printWindow = window.open("", "_blank", "width=800,height=600");

  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Print Invoice</title>
  //         <style>
  //           @media print {
  //             .page {
  //               width: 248mm;
  //               height: 210mm;
  //               page-break-after: always;
  //               margin: auto;
  //             }

  //               .user{
  //               breakInside: avoid ,
  //               pageBreakInside: avoid
  //               }
  //                table {
  //     page-break-inside: auto;
  //   }
  //   tr {
  //     page-break-inside: avoid;
  //     page-break-after: auto;
  //   }

  //             img {
  //               width: 100%;
  //               height: auto;
  //             }

  //             body {
  //               margin: 0;
  //               padding: 0;
  //               background: white;
  //             }
  //           }

  //           .footerNote {
  //             position: fixed;
  //             bottom: 0;
  //             width: 100%;
  //             background: #A62855;
  //             color: white;
  //             text-align: center;
  //             font-size: 16px;
  //             padding: 6px 0;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         ${images
  //           .map(
  //             (img, i) => `
  //             <div class="page">
  //               <img src="${img}" alt="Page ${i + 1}" />
  //             </div>
  //           `
  //           )
  //           .join("")}

  //         <div class="footerNote">
  //           ROUND THE CLOCK EMERGENCY SERVICES
  //         </div>
  //       </body>
  //     </html>
  //   `);

  //   printWindow.document.close();

  //   printWindow.onload = () => {
  //     printWindow.focus();
  //     printWindow.print();
  //   };
  // };
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
                <div className={styles.infoGrid}>
                  <div>
                    <span className={styles.label}>Patient ID</span>
                    <span className={styles.value}>:PID-2025-001</span>
                  </div>
                  <div>
                    <span className={styles.label}>Consultant</span>
                    <span className={styles.value}>:Dr.smith</span>
                  </div>
                  <div>
                    <span className={styles.label}>Patient Name</span>
                    <span className={styles.value}>:John Doe</span>
                  </div>
                  <div>
                    <span className={styles.label}>Case Type</span>
                    <span className={styles.value}>:Cardiac Care</span>
                  </div>
                  <div>
                    <span className={styles.label}>Appointment Type</span>
                    <span className={styles.value}>:Inpatient</span>
                  </div>
                  <div>
                    <span className={styles.label}>Invoice Date</span>
                    <span className={styles.value}>:2025-06-18</span>
                  </div>
                  <div>
                    <span className={styles.label}>Age</span>
                    <span className={styles.value}>:45</span>
                  </div>
                  <div>
                    <span className={styles.label}>Invoice Number</span>
                    <span className={styles.value}>:IN2025-001</span>
                  </div>
                  <div>
                    <span className={styles.label}>Gender</span>
                    <span className={styles.value}>:Male</span>
                  </div>
                  <div>
                    <span className={styles.label}>Admitted Date</span>
                    <span className={styles.value}>:2025-06-10</span>
                  </div>
                  <div>
                    <span className={styles.label}>Attendant Name</span>
                    <span className={styles.value}>:Jane Doe</span>
                  </div>
                  <div>
                    <span className={styles.label}>Discharge Date</span>
                    <span className={styles.value}>:2025-06-17</span>
                  </div>
                  <div>
                    <span className={styles.label}>Attendant Mobile</span>
                    <span className={styles.value}>:888877666</span>
                  </div>
                  <div>
                    <span className={styles.label}>Room Type</span>
                    <span className={styles.value}>:Private</span>
                  </div>
                  <div>
                    <span className={styles.label}>Referral Doctor</span>
                    <span className={styles.value}>:Dr.Johnson</span>
                  </div>
                  <div>
                    <span className={styles.label}>Room No</span>
                    <span className={styles.value}>:305</span>
                  </div>
                </div>
              </div>

              <div className={styles.servicesBox}>
                <div className={styles.sectionTitle}>Services Charges</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <table className={` table  table-bordered ${styles.table}`}>
                    <thead>
                      <tr>
                        <th>Service Name</th>
                        <th>Days</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Room Charges</td>
                        <td>7</td>
                        <td>2100</td>
                      </tr>
                      <tr>
                        <td>Nursing Care</td>
                        <td>7</td>
                        <td>700</td>
                      </tr>
                      <tr>
                        <td>Medical Supplies</td>
                        <td>-</td>
                        <td>300</td>
                      </tr>
                      <tr>
                        <td colSpan="2">
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>=3100</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
                  <table className={` table  table-bordered ${styles.table1}`}>
                    <thead>
                      <tr>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2005-09-23</td>
                        <td>2025-08-30</td>
                        <td>2100</td>
                      </tr>
                      <tr>
                        <td>005-09-23</td>
                        <td>2025-08-30</td>
                        <td>700</td>
                      </tr>
                      <tr>
                        <td colSpan="2">
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>=3100</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={styles.moduls1}>
                  <p>Pharmacy Charges</p>
                </div>
                <div className={styles.modules2}>
                  <table className={` table  table-bordered ${styles.table1}`}>
                    <thead>
                      <tr>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2005-09-23</td>
                        <td>2025-08-30</td>
                        <td>2100</td>
                      </tr>
                      <tr>
                        <td colSpan="2">
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>=3100</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={styles.moduls1}>
                  <p>Consultantion Charges</p>
                </div>
                <div className={styles.modules2}>
                  <table className={`table table-bordered ${styles.table1}`}>
                    <thead>
                      <tr>
                        <th>No of Visits</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>3</td>
                        <td>2100</td>
                      </tr>
                      <tr>
                        <td colSpan="1">
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>=2100</strong>
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
                        <td>Insurance + Cash</td>
                      </tr>
                      <tr>
                        <td>Concession</td>
                        <td>200</td>
                      </tr>
                      <tr>
                        <td>Settlement Amount</td>
                        <td>2000</td>
                      </tr>
                      <tr>
                        <td>Settlement Amount</td>
                        <td>2000</td>
                      </tr>

                      <tr>
                        <td>Received Amount</td>
                        <td>4000</td>
                      </tr>

                      <tr>
                        <td>Received Amount</td>
                        <td>8000</td>
                      </tr>
                      <tr>
                        <td colSpan="1">
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>=2100</strong>
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
                    <span className={styles.label}>appointment Type</span>
                    <span className={styles.value}>:Inpatient</span>
                  </div>
                  <div>
                    <span className={styles.label}>Lab Details Discount</span>
                    <span className={styles.value}>:50</span>
                  </div>
                  <div>
                    <span className={styles.label}>Pharmacy Sales Totals</span>
                    <span className={styles.value}>:800</span>
                  </div>
                  <div>
                    <span className={styles.label}>Lab Details Net</span>
                    <span className={styles.value}>:600</span>
                  </div>

                  <div>
                    <span className={styles.label}>Pharmacy</span>
                    <span className={styles.value}>:50</span>
                  </div>
                  <div>
                    <span className={styles.label}>Paid</span>
                    <span className={styles.value}>:400</span>
                  </div>
                  <div>
                    <span className={styles.label}>Discount</span>
                    <span className={styles.value}>:</span>
                  </div>
                  <div>
                    <span className={styles.label}>Refunded</span>
                    <span className={styles.value}>:</span>
                  </div>

                  <div>
                    <span className={styles.label}>Pharmacy Sales Net</span>
                    <span className={styles.value}>:750</span>
                  </div>
                  <div>
                    <span className={styles.label}>Concession/Adjustment</span>
                    <span className={styles.value}>:200</span>
                  </div>
                  <div>
                    <span className={styles.label}>Lab Details Total</span>
                    <span className={styles.value}>:650</span>
                  </div>
                  <div>
                    <span className={styles.label}>Due Amount</span>
                    <span className={styles.value}>:800</span>
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
                      <tr>
                        <td>599</td>
                        <td>CP-2223-104-75</td>
                        <td>17/05/2025</td>
                        <td>6685.69</td>
                        <td>0.00</td>
                        <td>6685.69</td>
                        <td>6685.69</td>
                        <td>0.00</td>
                      </tr>
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
                      <tr>
                        <td>599</td>
                        <td>CP-2223-104-75</td>
                        <td>17/05/2025</td>
                        <td>6685.69</td>
                        <td>0.00</td>
                        <td>6685.69</td>
                        <td>6685.69</td>
                        <td>0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>



            <div ref={pageRef5}>
            <div className='border  rounded p-3'>
                <div className={`rounded-top mb-2 ${styles.heading}`}>IP Settlement Receipts
                    </div>
          <Row>  
            <Col>
            <p><b>Patient ID : </b>PID-2025-001</p>
            <p><b>Type of Appointment : </b>inpatient</p>
            <p><b>Name : </b>john Doe</p>
            <p><b>Age : </b>45</p>
            <p><b>Gender : </b>male</p>
            <p><b>Received Amount : </b>4000.00</p>
            </Col>
            <Col>
            <p><b>Due Amount : </b>800</p>
            <p><b>Bill Date : </b>2025-06-18</p>
            <p><b>Bill Date : </b>INV-001</p>
            <p><b>Amount in words : </b>Four thousand rupees Only</p>
            <p><b>Print Date and Time : </b>2025-06-18 at 9:12</p>
            </Col>
            <h5>Reception Authorized Signatory : __________________________</h5>
          </Row>
          </div>
         
                 <div className='border  rounded p-3 mt-4'>
                <div className={`rounded-top mb-2 ${styles.heading}`}>IP Checkout Slip
                    </div>
          <Row>  
            <Col>
            <p><b>Patient ID : </b>PID-2025-001</p>
            <p><b>Type of Appointment : </b>inpatient</p>
            <p><b>Name : </b>john Doe</p>
            <p><b>Age : </b>45</p>
            <p><b>Gender : </b>male</p>
            <p><b>Room Number : </b>405</p>
            </Col>
            <Col>
            <p><b>Room Type : </b>private</p>
            <p><b>Consultant Doctor : </b>Dr.jhonson</p>
            <p><b>Date of Arrival : </b>2025-06-16</p>
            <p><b>Date Of Departure : </b> 2025-06-18</p>
            <p><b>Patient’s Condition : </b> Stable, Recommended Follow-up in 2 weeks</p>
            </Col>
            <h5>Reception Authorized Signatory : ___________________________</h5>
          </Row>
          </div>

            </div>

            <Modal.Footer className="down no-print">
              <div className="text-center mt-3">
                <Button onClick={handlePrint} variant="success">
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

        {/* payment method */}
      </div>
    </>
  );
}

export default InsurancePrint;
