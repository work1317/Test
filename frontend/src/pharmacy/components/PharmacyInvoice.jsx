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
import { useNavigate } from "react-router-dom";
import RecentInvoice from "./RecentInvoice";
import PharmacyPrint from "./PharmacyPrint";
import api from "../../utils/axiosInstance";
import { useNotifications } from "../../dashboard/components/NotificationContext";

const PharmacyInvoice = ({onBack}) => {
  const {onNotificationClick, fetchNotifications} = useNotifications()
  const navigate = useNavigate();
  const handleBack = () => {
    onBack()
  };
  const {messages} =  useNotifications()

  const [showRecentInvoices, setShowRecentInvoices] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState();


  const [suggestions, setSuggestions] = useState([]);
  const [activeRowIndex, setActiveRowIndex] = useState(null);

  const [patientDetails, setPatientDetails] = useState({
    patient_id: "",
    patient_name: "",
    age: "",
    gender: "",
    doctor: "",
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

  const handleItemChange = async (index, field, value) => { };

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
        doctor: "",
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
      updatedItems.splice(index, 1); // remove row at index

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



// ✅ Use invoiceId not invoice_id



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
 
      if (value.length >= 2) {
        if (/^\d+$/.test(value)) {
          setSuggestions([]);
          setActiveRowIndex(null);
          return;
        }
 
        try {
          const response = await api.get("/p_invoice/pharmacy/search/", {
            params: { q: value },
          });
 
          setSuggestions(
            (response.data.suggestions || []).map((name) => ({
              medication_name: name,
            }))
          );
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
 
    // Replace logic for numeric fields (e.g., quantity, discount, etc.)
    setInvoiceData((prevData) => {
      const updatedItems = [...prevData.items];
      const currentItem = updatedItems[index];
      let newValue = value;
 
      const numericFields = ["quantity", "discount", "mrp", "tax"]; // extend as needed
      if (numericFields.includes(name)) {
        if (value === "") {
          newValue = "";
        } else if (currentItem[name] === 0 || currentItem[name] === "0") {
          // If current value is 0, replace it with last typed digit
          newValue = Number(value[value.length - 1]);
        } else {
          newValue = Number(value);
        }
      }
 
      updatedItems[index] = {
        ...currentItem,
        [name]: newValue,
      };
 
      // Update amount if quantity or mrp changed
      if (name === "quantity" || name === "mrp") {
        updatedItems[index].amount =
          (updatedItems[index].mrp || 0) * (updatedItems[index].quantity || 0);
      }
 
      return {
        ...prevData,
        items: updatedItems,
        summary: calculateSummary(updatedItems),
      };
    });
  };
 

const handleSuggestionClick = (medicine, index) => {
  api
    .get(`/p_invoice/pharmacy/search/`, {
      params: { medication_name: medicine.medication_name },
    })
    .then((response) => {
      const allBatchNos = response.data.batches || [];
      const batchOptions = allBatchNos.map((b) => ({ batch_no: b }));
      const defaultBatchNo = batchOptions[0]?.batch_no || "";

      // Set medication_name, batch list, and default batch_no
      setInvoiceData((prev) => {
        const updatedItems = [...prev.items];
        updatedItems[index] = {
          ...updatedItems[index],
          medication_name: medicine.medication_name,
          batches: batchOptions,
          batch_no: defaultBatchNo,
        };
        return { ...prev, items: updatedItems };
      });

      // ✅ Now fetch MRP + expiry_date for that first batch
      if (defaultBatchNo) {
        api
          .get(`/p_invoice/pharmacy/search/`, {
            params: {
              medication_name: medicine.medication_name,
              batch_no: defaultBatchNo,
            },
          })
          .then((res) => {
            const data = res.data.data || {};
            setInvoiceData((prev) => {
              const updatedItems = [...prev.items];
              updatedItems[index] = {
                ...updatedItems[index],
                mrp: Number(data.mrp) || 0,
                expiry_date: data.expiry_date || "",
                amount:
                  (Number(data.mrp) || 0) *
                  (updatedItems[index].quantity || 0),
              };
              return {
                ...prev,
                items: updatedItems,
                summary: calculateSummary(updatedItems),
              };
            });
          })
          .catch((err) =>
            console.error("Error fetching batch details:", err)
          );
      }
    })
    .catch((err) => {
      console.error("Error fetching batches", err);
    });

  setSuggestions([]);
  setActiveRowIndex(null);
};

const clearPatientDetails = () => {
  setPatientDetails((prev) => ({
    ...prev,
    patient_name: "",
    age: "",
    gender: "",
    doctor: "",
  }));
};

  const handleChange = (e) => {
    setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
  };

  const fetchPatientDetails = async (patientId) => {
  try {
    const response = await api.get(`p_invoice/create-invoice-with-items/`, {
      params: { patient_id: patientId },
    });
 
    console.log("Fetched patient details:", response.data.data);
 
    if (response.status === 200 && response.data.success === 1) {
      const { patient_name, age, gender, doctor } = response.data.data;
 
      setPatientDetails((prev) => ({
        ...prev,
        patient_name,
        age,
        gender,
        doctor,
      }));
 
      const newInvoiceId = response.data.invoice_id || response.data.data?.id;
      if (newInvoiceId) {
        setInvoiceId(newInvoiceId);
      }
    } else {
      // Invalid patient_id or not found
      clearPatientDetails();
    }
  } catch (error) {
    console.error("Error fetching patient details: ", error);
 
    // Clear previous patient data on error
    clearPatientDetails();
  }
};
 
 

  useEffect(() => {
    if (selectedValue === "no" && patientDetails.patient_id) {
      fetchPatientDetails(patientDetails.patient_id);
    }
  }, [patientDetails.patient_id, selectedValue]);

const handleBatchChange = async (e, index) => {
  const selectedBatchNo = e.target.value;
  const medicationName = invoiceData.items[index].medication_name;

  if (!selectedBatchNo || !medicationName) return;

  try {
    const response = await api.get(`/p_invoice/pharmacy/search/`, {
      params: {
        medication_name: medicationName,
        batch_no: selectedBatchNo,
      },
    });

    const data = response.data.data || {};

    setInvoiceData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        batch_no: selectedBatchNo,
        mrp: data.mrp || 0,
        expiry_date: data.expiry_date || "",
        amount:
          (data.mrp || 0) * (updatedItems[index].quantity || 0),
      };
      return {
        ...prev,
        items: updatedItems,
        summary: calculateSummary(updatedItems),
      };
    });
  } catch (error) {
    console.error("Failed to fetch batch details:", error);
  }
};



  
  const handleSaveInvoice = async () => {
    const discountValue = parseFloat(discount || 0);
    const taxValue = parseFloat(tax || 0);

    if(invoiceData.typeof_transaction === ""){
      alert("Transaction type cannot be blank")
      return
    }
    // Validate patient details if not guest
  if (selectedValue === "no") {
    const { patient_name, patient_id, age, gender, doctor } = patientDetails;
    if (!patient_id || !patient_name || !age || !gender || !doctor) {
      alert("Please fill all patient details.");
      return;
    }
  }
 
  // Validate at least one valid item
  if (!invoiceData.items || invoiceData.items.length === 0) {
    alert("Add at least one invoice item.");
    return;
  }
 
  for (const item of invoiceData.items) {
    if (!item.medication_name || !item.batch_no || !item.quantity || !item.mrp || !item.expiry_date) {
      alert("Please fill all fields in each medicine item.");
      return;
    }
  }
 
  // Validate amount
  if (!invoiceData.summary.total_paid_amount || isNaN(invoiceData.summary.total_paid_amount)) {
    alert("Paid amount is required and must be a valid number.");
    return;
  }
    const payload = {
      patient_id: selectedValue === "yes" ? null : patientDetails.patient_id,
      patient_name: patientDetails.patient_name,
      age: patientDetails.age,
      gender: patientDetails.gender,
      doctor: patientDetails.doctor,
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
          batch_no: item.batch_no,
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
        await fetchNotifications()
        await onNotificationClick()
        setSuccessMessage(response.data.message || "Invoice created!");
        window.dispatchEvent(new Event("refreshPharmacyInvoice"));
        console.log("✅ Invoice saved:", response.data);

        // ✅ Extract fields safely
        const newInvoiceId = response.data.invoice_id || response.data.data?.id;
        const BillNo = response.data.Bill_No || response.data.data?.Bill_No;
        // const BillDate = response.data.Bill_Date || response.data.data?.Bill_Date;
        const rawDate = response.data.Bill_Date || response.data.data?.Bill_Date;
        const BillDate = rawDate ? new Date(rawDate).toISOString().split("T")[0] : "";

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
            doctor: "",
            guest: "No",
          });

          setSelectedValue("no");
          setDiscount("");
          setTax("");
 
        }
      } else {
        alert("Failed to create invoice.");
        console.log("Response error:", response.data);
      }
    } catch (error) {
  console.error("Error creating invoice:", error.response?.data || error.message);
  const backendMessage = error.response?.data?.message;
 
  if (backendMessage) {
    alert(backendMessage); // ✅ Show actual backend error
  } else {
    alert("An error occurred while creating the invoice.");
  }
}
  };


  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        console.log("getInvoice", getinvoice);
        setSuccessMessage("");
        // setShowModal(true)
      }, 6000); // 6000ms = 6 seconds
 
      // Cleanup the timer on unmount or when message changes
      return () => clearTimeout(timer);
    }
  }, [successMessage]);


  const headerStyle = { backgroundColor: "#002072", color: "white" };
  return (
    <Container className="p-4">
      {!showRecentInvoices && (
        <Button onClick={handleBack} variant="outline-secondary" className="mb-4" >
          ← Back
        </Button>
      )}
      {!showRecentInvoices && successMessage && (
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
        {/* {messages && <p style={{ color: "green" }}>{messages}</p>} */}
        {messages && (
          <p style={{ color: messages.includes("approve") ? "green" : "red" }}>
            {messages}
          </p>
        )}
        
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
                    placeholder="36GXDPS888251ZH"
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
                    placeholder="135/RR2/AP/2010"
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
                    name="doctor"
                    value={patientDetails.doctor || ""}
                    onChange={(e) =>
                      setPatientDetails({
                        ...patientDetails,
                        doctor: e.target.value,
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
                  <Button
                    variant="danger"
                    onClick={() => deleteMedicineRow(invoiceData.items.length - 1)}
                    disabled={invoiceData.items.length === 0} // Optional: disables button if no rows
                  >
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
                          value={item.batch_no || ""}
                          onChange={(e) => handleBatchChange(e, idx)}
                        >
                          <option value="">Select Batch</option>
                          {item.batches?.map((batch, i) => (
                            <option key={i} value={batch.batch_no}>
                              {batch.batch_no}
                            </option>
                          ))}
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
                  Discount % &nbsp;
                  <Form.Control
                    type="number"
                    name="discount"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDiscount(value === "" ? "" : Number(value));
                    }}
                    style={{ display: "inline", width: "auto" }}
                  ></Form.Control>
                </p>
                <p>Net Amount: ₹{invoiceData.summary.net_amount}</p>
                <p>
                  Tax % &nbsp;
                  <Form.Control
                    type="number"
                    name="tax"
                    value={tax}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDiscount(value === "" ? "" : Number(value));
                    }}
                    style={{ display: "inline", width: "auto" }}
                  >
                
                  </Form.Control>
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
                    <option value="Select payment terms">Select Payment Terms </option>
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
                    <option value= "">Select Payment Methods</option>
                    <option value="Cash">Cash</option>
                    <option value="Debit/Credit">Debit/Credit</option>
                    <option value="UPI">UPI</option>
                    <option value="Multiple (Cash+Card), (Cash+UPI)">Multiple (Cash+Card), (Cash+UPI)</option>
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
