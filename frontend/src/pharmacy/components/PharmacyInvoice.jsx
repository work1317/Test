import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  Alert,
} from "react-bootstrap";
import { Icon } from "@iconify/react";
import axios from "axios";
import RecentInvoice from "./RecentInvoice";
import PharmacyPrint from "./PharmacyPrint";
import api from "../../utils/axiosInstance";

const PharmacyInvoice = () => {
  const [showRecentInvoices, setShowRecentInvoices] = useState(false);
  const [discount, setDiscount] = useState(5);
  const [tax, setTax] = useState(5);
  const [paymentTerms, setPaymentTerms] = useState("No");

  

  const [suggestions, setSuggestions] = useState([]);
  const [activeRowIndex, setActiveRowIndex] = useState(null);

  const [patientDetails, setPatientDetails] = useState({
    patient_id: "",
    patient_name: "",
    age: "",
    gender: "",
    doctor_name: "",
    guest: "No",
  });

  const [invoiceData, setInvoiceData] = useState({
    // Bill_No:"",
    // Bill_Date:"",
    gst_no: "",
    id: "",
    typeof_transaction: "",
    description: "",
    summary: {
      net_amount: 0,
      paid_amount: 0,
      final_amount: 0,
      discount_amount: 0,
    },
    items: [
      {
        medication_name: "",
        batch_no: "",
        expiry_date: "",
        mrp: "",
        unit_price: 0,
        quantity: "",
        amount: 0,
      },
    ],
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [getinvoice, setGetInvoice] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [invoiceId, setInvoiceId] = useState(null);

  const openInvoice = () => {
    ///setInvoiceId(1); // replace with the invoice id you want to fetch
    setShowModal(true);
  };

  const handlePrintOpen = () => setShowPrintModal(true);
  const handlePrintClose = () => setShowPrintModal(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const handlePrintClick = (id) => {
    setSelectedInvoiceId(id); // Must be the same as the backend invoice ID
    setShowPrint(true);
  };

  const toggleView = () => {
    setShowRecentInvoices(!showRecentInvoices);
  };

  const handleItemChange = async (index, field, value) => {};

  const [selectedValue, setSelectedValue] = useState("no");
  //  const [guestString, setGuestString] = useState("No");

  // gest
  const handleRadioChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);

    if (value === "yes") {
      // Guest: clear patient details
      setPatientDetails({
        patient_id: "",
        patient_name: "",
        age: "",
        gender: "",
        doctor_name: "",
        guest: "Yes",
      });
    } else {
      // Not guest: enable patient ID input
      setPatientDetails((prev) => ({
        ...prev,
        guest: "No",
      }));
    }
  };

  //adding table row
  const addMedicineRow = () => {
    setInvoiceData((prevData) => ({
      ...prevData,
      items: [
        ...prevData.items,
        {
          medication_name: "",
          batch_no: "",
          expiry_date: "",
          mrp: "",
          unit_price: 0,
          quantity: "",
          amount: 0,
        },
      ],
    }));
  };

  //delete the table row
  const deleteMedicineRow = (index) => {
    setInvoiceData((prevData) => {
      const updatedItems = [...prevData.items];
      updatedItems.splice(index, 1); // Remove item at the given index

      return {
        ...prevData,
        items: updatedItems,
        summary: calculateSummary(updatedItems),
      };
    });
  };

  useEffect(() => {
    setInvoiceData((prevData) => ({
      ...prevData,
      summary: calculateSummary(prevData.items),
    }));

    // Optional alert if discount > 15%
    if (discount > 15) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [discount, tax, invoiceData.items]);

  const calculateSummary = (items) => {
    const subtotal = items.reduce((acc, item) => acc + (item.amount || 0), 0);
    const discountAmount = (subtotal * discount) / 100;
    const netAmount = subtotal - discountAmount;
    const taxAmount = (netAmount * tax) / 100;
    const finalAmount = netAmount + taxAmount;

    return {
      net_amount: netAmount.toFixed(2),
      total_paid_amount: finalAmount.toFixed(2), // ✅ Paid = Final (includes tax)
      discount_amount: discountAmount.toFixed(2),
      final_amount: finalAmount.toFixed(2),
    };
  };

  useEffect(() => {
    setInvoiceData((prev) => ({
      ...prev,
      summary: calculateSummary(prev.items),
    }));
  }, [discount, tax]);

  const handlerInput = async (e, index) => {
    const { name, value } = e.target;

    if (name === "medication_name") {
      setInvoiceData((prev) => {
        const updatedItems = [...prev.items];
        updatedItems[index][name] = value;
        return { ...prev, items: updatedItems };
      });

      if (value.length >= 3) {
        // Only search by name for suggestions
        if (/^\d+$/.test(value)) {
          // If input looks like ID, maybe don't show suggestions? Or clear them
          setSuggestions([]);
          setActiveRowIndex(null);
          return;
        }

        try {
          const response = await api.get(
            `p_invoice/pharmacy/search/${value}/`
          );
          setSuggestions(response.data.data || []);
          setActiveRowIndex(index);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
          setActiveRowIndex(null);
        }
      } else {
        setSuggestions([]);
        setActiveRowIndex(null);
      }

      return;
    }

    // Handle other fields like quantity
    setInvoiceData((prevData) => {
      const updatedItems = [...prevData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: name === "quantity" ? Number(value) : value,
      };
      updatedItems[index].amount =
        (updatedItems[index].mrp || 0) * (updatedItems[index].quantity || 0);
      return {
        ...prevData,
        items: updatedItems,
        summary: calculateSummary(updatedItems),
      };
    });
  };

  const handleSuggestionClick = (medicine, index) => {
    setInvoiceData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        medication_name: medicine.medication_name,
        expiry_date: medicine.expiry_date,
        mrp: medicine.mrp,
        unit_price: medicine.unit_price,
        amount: (medicine.mrp || 0) * (updatedItems[index].quantity || 0),
      };
      return {
        ...prev,
        items: updatedItems,
        summary: calculateSummary(updatedItems),
      };
    });

    setSuggestions([]);
    setActiveRowIndex(null);
  };

  const fetchData = async (index) => {
    const input = invoiceData.items[index]?.medication_name?.trim();

    if (!input || input.length < 2) return;

    const isId = /^\d+$/.test(input);
    const url = isId
      ? `p_invoice/medications/search-by-id/${input}/`
      : `p_invoice/pharmacy/search/${input}/`;

    console.log(url);

    try {
      const res = await api.get(url);

      let medicine;
      if (isId) {
        medicine = res.data.data;
      } else {
        medicine =
          res.data.data && res.data.data.length > 0 ? res.data.data[0] : null;
      }

      if (!medicine) {
        // Optionally clear the item or show message
        console.warn("No medicine found for input:", input);
        return;
      }

      setInvoiceData((prevData) => {
        const updatedItems = [...prevData.items];
        updatedItems[index] = {
          ...updatedItems[index],
          medication_name: medicine.medication_name,
          expiry_date: medicine.expiry_date,
          mrp: medicine.mrp,
          unit_price: medicine.unit_price,
          amount: (medicine.mrp || 0) * (updatedItems[index].quantity || 0),
        };

        return {
          ...prevData,
          items: updatedItems,
          summary: calculateSummary(updatedItems),
        };
      });
    } catch (err) {
      console.error("Error fetching medicine:", err);
    }
  };

  const handleChange = (e) => {
    setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const response = await api.get(
        `p_invoice/create-invoice-with-items/`,
        {
          params: { patient_id: patientId },
        }
      );

      console.log("Fetched patient details:", response.data.data);

      if (response.status === 200) {
        const { patient_name, age, gender, doctor_name } = response.data.data;
        setPatientDetails((prev) => ({
          ...prev,
          patient_name,
          age,
          gender,
          doctor_name,
        }));

        const newInvoiceId = response.data.invoice_id || response.data.data?.id;

        if (newInvoiceId) {
          // Set the invoice ID and open print modal
          setInvoiceId(newInvoiceId);
        }
      }
    } catch (error) {
      console.error("Error fetching patient details: ", error);
    }
  };

  useEffect(() => {
    if (selectedValue === "no" && patientDetails.patient_id) {
      fetchPatientDetails(patientDetails.patient_id);
    }
  }, [patientDetails.patient_id, selectedValue]);

  const handleBatchChange = (e, idx) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[idx].batch_no = e.target.value;
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  // const handleSaveInvoice = async () => {
  //   const discountValue = parseFloat(discount || 0);
  //   const taxValue = parseFloat(tax || 0);

  //   const payload = {
  //     patient_id: selectedValue === "yes" ? null : patientDetails.patient_id,
  //     patient_name: patientDetails.patient_name,
  //     age: patientDetails.age,
  //     gender: patientDetails.gender,
  //     doctor_name: patientDetails.doctor_name,
  //     guest: selectedValue === "yes",
  //     typeof_transaction: invoiceData.typeof_transaction,
  //     description: invoiceData.description,
  //     paid_amount: invoiceData.summary.total_paid_amount,
  //     appointment_type: "Outpatient",
  //     items: invoiceData.items.map((item) => {
  //       const amount = parseFloat(item.amount || 0);
  //       const discountAmount = (amount * discountValue) / 100;
  //       const netAmount = amount - discountAmount;
  //       const taxAmount = (netAmount * taxValue) / 100;
  //       const finalAmount = netAmount + taxAmount;

  //       return {
  //         medication_name: item.medication_name,
  //         quantity: parseInt(item.quantity, 10),
  //         mrp: parseFloat(item.mrp || 0),
  //         expiry_date: item.expiry_date,
  //         amount: amount.toFixed(2),
  //         discount_percentage: discountValue.toFixed(2),
  //         tax_percentage: taxValue.toFixed(2),
  //         discount_amount: discountAmount.toFixed(2),
  //         tax_amount: taxAmount.toFixed(2),
  //         net_amount: netAmount.toFixed(2),
  //         final_amount: finalAmount.toFixed(2),
  //       };
  //     }),
  //   };

  //   try {
  //     const response = await axios.post(
  //       "http://127.0.0.1:8000/p_invoice/create-invoice-with-items/",
  //       payload,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );

  //     if (response?.data?.success) {
  //       setSuccessMessage(response.data.message || "Invoice created!");
  //       console.log("✅ Invoice saved:", response.data);
  //     } else {
  //       alert(" Failed to create invoice.");
  //       console.log("Response error:", response.data);
  //     }
  //   } catch (error) {
  //     console.error(
  //       " Error creating invoice:",
  //       error.response?.data || error.message
  //     );
  //   }
  // };

  //   const handleSaveInvoice = async () => {
  //   const discountValue = parseFloat(discount || 0);
  //   const taxValue = parseFloat(tax || 0);

  //   const payload = {
  //     patient_id: selectedValue === "yes" ? null : patientDetails.patient_id,
  //     patient_name: patientDetails.patient_name,
  //     age: patientDetails.age,
  //     gender: patientDetails.gender,
  //     doctor_name: patientDetails.doctor_name,
  //     guest: selectedValue === "yes",
  //     typeof_transaction: invoiceData.typeof_transaction,
  //     description: invoiceData.description,
  //     paid_amount: invoiceData.summary.total_paid_amount,
  //     appointment_type: "Outpatient",
  //     items: invoiceData.items.map((item) => {
  //       const amount = parseFloat(item.amount || 0);
  //       const discountAmount = (amount * discountValue) / 100;
  //       const netAmount = amount - discountAmount;
  //       const taxAmount = (netAmount * taxValue) / 100;
  //       const finalAmount = netAmount + taxAmount;

  //       return {
  //         medication_name: item.medication_name,
  //         quantity: parseInt(item.quantity, 10),
  //         mrp: parseFloat(item.mrp || 0),
  //         expiry_date: item.expiry_date,
  //         amount: amount.toFixed(2),
  //         discount_percentage: discountValue.toFixed(2),
  //         tax_percentage: taxValue.toFixed(2),
  //         discount_amount: discountAmount.toFixed(2),
  //         tax_amount: taxAmount.toFixed(2),
  //         net_amount: netAmount.toFixed(2),
  //         final_amount: finalAmount.toFixed(2),
  //       };
  //     }),
  //   };

  //   try {
  //     const response = await axios.post(
  //       "http://127.0.0.1:8000/p_invoice/create-invoice-with-items/",
  //       payload,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );

  //     if (response?.data?.success) {
  //       setSuccessMessage(response.data.message || "Invoice created!");
  //       console.log("✅ Invoice saved:", response.data);

  //       // Extract the new invoice ID from the response
  //       const newInvoiceId = response.data.invoice_id || response.data.data?.id;

  //       if (newInvoiceId) {
  //         // Set the invoice ID and open print modal
  //         setInvoiceId(newInvoiceId);

  //         // Reset form for new entry (optional)
  //         setInvoiceData({
  //           gst_no: "",
  //           id: "",
  //           typeof_transaction: "",
  //           description: "",
  //           summary: {
  //             net_amount: 0,
  //             paid_amount: 0,
  //             final_amount: 0,
  //             discount_amount: 0,
  //           },
  //           items: [
  //             {
  //               medication_name: "",
  //               batch_no: "",
  //               expiry_date: "",
  //               mrp: "",
  //               unit_price: 0,
  //               quantity: "",
  //               amount: 0,
  //             },
  //           ],
  //         });

  //         setPatientDetails({
  //           patient_id: "",
  //           patient_name: "",
  //           age: "",
  //           gender: "",
  //           doctor_name: "",
  //           guest: "No",
  //         });

  //         setSelectedValue("no");
  //       }
  //     } else {
  //       alert("Failed to create invoice.");
  //       console.log("Response error:", response.data);
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error creating invoice:",
  //       error.response?.data || error.message
  //     );
  //     alert("An error occurred while creating the invoice.");
  //   }
  // };

 const handleSaveInvoice = async () => {
  const discountValue = parseFloat(discount || 0);
  const taxValue = parseFloat(tax || 0);

  const payload = {
    patient_id: selectedValue === "yes" ? null : patientDetails.patient_id,
    patient_name: patientDetails.patient_name,
    age: patientDetails.age,
    gender: patientDetails.gender,
    doctor_name: patientDetails.doctor_name,
    guest: selectedValue === "yes",
    typeof_transaction: invoiceData.typeof_transaction,
    description: invoiceData.description,
    paid_amount: invoiceData.summary.total_paid_amount,
    appointment_type: "Outpatient",
    items: invoiceData.items.map((item) => {
      const amount = parseFloat(item.amount || 0);
      const discountAmount = (amount * discountValue) / 100;
      const netAmount = amount - discountAmount;
      const taxAmount = (netAmount * taxValue) / 100;
      const finalAmount = netAmount + taxAmount;

      return {
        medication_name: item.medication_name,
        quantity: parseInt(item.quantity, 10),
        mrp: parseFloat(item.mrp || 0),
        expiry_date: item.expiry_date,
        amount: amount.toFixed(2),
        discount_percentage: discountValue.toFixed(2),
        tax_percentage: taxValue.toFixed(2),
        discount_amount: discountAmount.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
        net_amount: netAmount.toFixed(2),
        final_amount: finalAmount.toFixed(2),
      };
    }),
  };

  try {
    const response = await api.post(
      "p_invoice/create-invoice-with-items/",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response?.data?.success) {
      setSuccessMessage(response.data.message || "Invoice created!");
      window.dispatchEvent(new Event("refreshPharmacyInvoice"));
      console.log("✅ Invoice saved:", response.data);

      // ✅ Extract fields safely
      const newInvoiceId = response.data.invoice_id || response.data.data?.id;
      const BillNo = response.data.Bill_No || response.data.data?.Bill_No;
      const BillDate = response.data.Bill_Date || response.data.data?.Bill_Date;

      // ✅ Set invoice data including bill details
      setGetInvoice({
        ...payload,
        invoice_id: newInvoiceId,
        Bill_No: BillNo,
        Bill_Date: BillDate,
      });

      if (newInvoiceId) {
        setInvoiceId(newInvoiceId);

        // Reset form (optional)
        setInvoiceData({
          gst_no: "",
          id: "",
          typeof_transaction: "",
          description: "",
          summary: {
            net_amount: 0,
            paid_amount: 0,
            final_amount: 0,
            discount_amount: 0,
          },
          items: [
            {
              medication_name: "",
              batch_no: "",
              expiry_date: "",
              mrp: "",
              unit_price: 0,
              quantity: "",
              amount: 0,
            },
          ],
        });

        setPatientDetails({
          patient_id: "",
          patient_name: "",
          age: "",
          gender: "",
          doctor_name: "",
          guest: "No",
        });

        setSelectedValue("no");
      }
    } else {
      alert("Failed to create invoice.");
      console.log("Response error:", response.data);
    }
  } catch (error) {
    console.error("Error creating invoice:", error.response?.data || error.message);
    alert("An error occurred while creating the invoice.");
  }
};


  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        console.log("getInvoice", getinvoice);
        setSuccessMessage("");
        // setShowModal(true)
      }, 500); // 3000ms = 3 seconds

      // Cleanup the timer on unmount or when message changes
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const headerStyle = { backgroundColor: "#002072", color: "white" };
  return (
    <Container className="p-4">
      {successMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccessMessage("")}
          dismissible
        >
          {successMessage}
        </Alert>
      )}
      {/* Header */}
      <Row className="mb-4 mt-3">
        <Col>
          <h2>
            {showRecentInvoices
              ? "Recent Invoices"
              : "Generate Pharmacy Invoice"}
          </h2>
          <p style={{ color: "#9A9A9A" }}>Create and Manage patient invoices</p>
        </Col>

        <Col className="d-flex justify-content-end align-items-start gap-2 flex-wrap">
          <Button
            onClick={toggleView}
            className="bg-white text-black border border-secondary"
          >
            <Icon icon="mdi:recent" className="mb-1" />
            {showRecentInvoices ? "Back to Invoice" : "Recent Invoices"}
          </Button>
          {!showRecentInvoices && (
            <>
              <Button
                className="bg-white text-black border border-secondary"
                onClick={handleSaveInvoice}
                disabled={paymentTerms === "Yes"}
              >
                <Icon icon="carbon:rule-draft" className="mb-1" /> Save
              </Button>
              <Button
                className="bg-white text-black border border-secondary"
                onClick={openInvoice}
                disabled={paymentTerms === "Yes"}
              >
                <Icon
                  icon="material-symbols-light:print-outline-rounded"
                  className="mb-1"
                />{" "}
                Print
              </Button>
              <PharmacyPrint
                invoiceId={invoiceId}
                getinvoice={getinvoice}
                show={showModal}
                onClose={() => setShowModal(false)}
              />
              <Button style={headerStyle}>
                <Icon icon="material-symbols-light:download" className="mb-1" />{" "}
                Download PDF
              </Button>
            </>
          )}
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="mb-4">
        {showRecentInvoices ? (
          <Col md={12}>
            <RecentInvoice />
          </Col>
        ) : (
          <>
            {/* Invoice Details */}
            <Col md={6}>
              <h5>
                <Icon icon="hugeicons:invoice-02" /> Invoice Details
              </h5>
              <Form>
                <Form.Group>
                  <Form.Label>GST No</Form.Label>
                  <Form.Control
                    type="text"
                    name="gst_no"
                    value={invoiceData.gst_no}
                    placeholder="INV001"
                    className="w-50 text-black"
                    readOnly
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>DL No</Form.Label>
                  <Form.Control
                    type="text"
                    name="gst_no"
                    value={invoiceData.gst_no}
                    placeholder="INV001"
                    className="w-50 text-black"
                    readOnly
                  />
                </Form.Group>
                <div className="mt-4">
                  <h5>Guest</h5>
                  <label>
                    <input
                      type="radio"
                      value="yes"
                      checked={selectedValue === "yes"}
                      onChange={handleRadioChange}
                      style={{ transform: "scale(1.5)", marginRight: "8px" }}
                    />
                  </label>
                  Yes
                  <label className="ms-5">
                    <input
                      type="radio"
                      name="no"
                      value="no"
                      checked={selectedValue === "no"}
                      onChange={handleRadioChange}
                      style={{ transform: "scale(1.5)", marginRight: "8px" }}
                    />
                    No
                  </label>
                </div>

                {/* <Form.Group>
                  <Form.Label>Form type</Form.Label>
                  <Form.Control
                    type="text"
                    
                    readOnly
                    className="w-50"
                  />
                </Form.Group> */}
              </Form>
            </Col>

            {/* Patient Information */}
            <Col md={6}>
              <h5>
                <Icon icon="famicons:people-outline" /> Patient Information
              </h5>
              <Form>
                <Form.Group>
                  <Form.Label>Patient Id</Form.Label>
                  <Form.Control
                    type="text"
                    name="patient_id"
                    value={patientDetails.patient_id || ""}
                    onChange={(e) =>
                      setPatientDetails({
                        ...patientDetails,
                        patient_id: e.target.value,
                      })
                    }
                    className="w-50"
                    disabled={patientDetails.guest === "Yes"}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="patient_name"
                    value={patientDetails.patient_name || ""}
                    onChange={(e) =>
                      setPatientDetails({
                        ...patientDetails,
                        patient_name: e.target.value,
                      })
                    }
                    className="w-50"
                    readOnly={selectedValue === "no"} // ✅ readonly if not guest
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Age</Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={patientDetails.age || ""}
                    onChange={(e) =>
                      setPatientDetails({
                        ...patientDetails,
                        age: e.target.value,
                      })
                    }
                    className="w-50"
                    readOnly={selectedValue === "no"} // ✅ readonly if not guest
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Form.Control
                    type="text"
                    name="gender"
                    value={patientDetails.gender || ""}
                    onChange={(e) =>
                      setPatientDetails({
                        ...patientDetails,
                        gender: e.target.value,
                      })
                    }
                    className="w-50"
                    readOnly={selectedValue === "no"} // ✅ readonly if not guest
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Doctor Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="doctor_name"
                    value={patientDetails.doctor_name || ""}
                    onChange={(e) =>
                      setPatientDetails({
                        ...patientDetails,
                        doctor_name: e.target.value,
                      })
                    }
                    className="w-50"
                    readOnly={selectedValue === "no"} // ✅ readonly if not guest
                  />
                </Form.Group>
              </Form>
            </Col>
          </>
        )}
      </Row>

      {/* Invoice Items and Payment Information */}
      {!showRecentInvoices && (
        <>
          {/* Invoice Items */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-end mb-3">
                <h5 className="mb-0">
                  <Icon icon="hugeicons:invoice-02" /> Invoice Items
                </h5>

                <div className="d-flex gap-2">
                  {" "}
                  {/* Flex container for the buttons */}
                  <Button variant="secondary" onClick={addMedicineRow}>
                    + Add Medicine
                  </Button>
                  <Button variant="danger" onClick={deleteMedicineRow}>
                    Delete
                  </Button>
                </div>
              </div>

              <Table bordered>
                <thead>
                  <tr>
                    <th style={headerStyle}>Medicine Name</th>
                    <th style={headerStyle}>Batch No</th>
                    <th style={headerStyle}>Exp Date</th>
                    <th style={headerStyle}>MRP</th>
                    <th style={headerStyle}>Qty</th>
                    <th style={headerStyle}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ position: "relative" }}>
                        <Form.Control
                          type="text"
                          name="medication_name"
                          value={item.medication_name}
                          onChange={(e) => handlerInput(e, idx)}
                          // onBlur={() => {
                          //   setTimeout(() => {
                          //     setSuggestions([]);
                          //     setActiveRowIndex(null);
                          //     fetchData(idx)

                          //   }, 200);
                          // }}

                          onFocus={() => setActiveRowIndex(idx)} // optional
                        />

                        {activeRowIndex === idx && suggestions.length > 0 && (
                          <ul
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              backgroundColor: "white",
                              border: "1px solid #ccc",
                              zIndex: 9999,
                              maxHeight: "150px",
                              overflowY: "auto",
                              padding: 0,
                              margin: 0,
                              listStyle: "none",
                            }}
                          >
                            {suggestions.map((sug, i) => (
                              <li
                                key={i}
                                onClick={() => handleSuggestionClick(sug, idx)}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                }}
                              >
                                {sug.medication_name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>

                      <td>
                        <Form.Select
                          value={item.batch_no}
                          onChange={(e) => handleBatchChange(e, idx)}
                        >
                          <option>11240915</option>
                          <option>11240916</option>
                          <option>11240917</option>
                          <option>11240918</option>
                        </Form.Select>
                      </td>
                      <td>{item.expiry_date || "-"}</td>
                      <td>{item.mrp || "-"}</td>
                      <td>
                        <Form.Control
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handlerInput(e, idx)}
                        />
                      </td>
                      <td>{item.amount?.toFixed(2) || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Notification Alert */}
              {showAlert && (
                <Alert variant="warning">
                  Discount greater than 15% is applied. Please verify!
                </Alert>
              )}
              <div className="text-end mt-3">
                <p>
                  Discount Amount:
                  <Form.Select
                    type="number"
                    name="discount"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))} // convert string to number
                    style={{ display: "inline", width: "auto" }}
                  >
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                    <option value="25">25%</option>
                    <option value="30">30%</option>
                  </Form.Select>
                </p>
                <p>Net Amount: ₹{invoiceData.summary.net_amount}</p>
                <p>
                  Tax:
                  <Form.Select
                    type="number"
                    name="tax"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    style={{ display: "inline", width: "auto" }}
                  >
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                    <option value="25">25%</option>
                    <option value="30">30%</option>
                  </Form.Select>
                </p>
                <p>Final Amount: ₹{invoiceData.summary.final_amount}</p>
                <h5>Paid Amount: ₹{invoiceData.summary.total_paid_amount}</h5>
              </div>
            </Col>
          </Row>

          {/* Payment Information */}
          <Row className="border mt-3">
            <Col md={6} className="mb-2">
              <h5>
                <Icon icon="fluent:payment-28-regular" /> Payment Information
              </h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Terms</Form.Label>
                  <Form.Select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="typeof_transaction"
                    value={invoiceData.typeof_transaction}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        typeof_transaction: e.target.value,
                      })
                    }
                    disabled={paymentTerms === "Yes"}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Debit/Credit Card">Debit/Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="">Multiple (Cash+Card), (Cash+UPI)</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Col>

            <Col md={6}>
              <h5>Notes</h5>
              <Form.Control
                value={invoiceData.description}
                name="description"
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    description: e.target.value,
                  })
                }
                as="textarea"
                rows={5}
                placeholder="Add any additional or payment instructions"
              />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default PharmacyInvoice;
