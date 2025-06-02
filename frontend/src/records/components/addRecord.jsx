
import Modal from "react-bootstrap/Modal";
import api from "../../utils/axiosInstance";
import React, { useState,useEffect } from "react";
import {
  Form,
  Button,
  Dropdown,
  DropdownButton,
  Row,
  Col,
} from "react-bootstrap";
import styles from "../css/AddRecords.module.css";
import DragAndDrop from "./DragAndDrop";

function AddRecordModal({show,handleClose,patientId}) {
  const [recordType, setRecordType] = useState("Select Type");
  const [savedRecords, setSavedRecords] = useState([]);
  const [clearPreview, setClearPreview] = useState(false);
  const [formData, setFormData] = useState({
    // lab_results: {
    //   title: "",
    //   summary: "",
    //   category:"",
    //   report: FileList | File,
    // },
    Prescription: {
      medication_name: "",
      category:"",
      duration: "",
      dosage: "",
      summary: "",
      report: FileList | File,
    },
    // imaging: {
    //   title: "",
    //   category:"",
    //   summary: "",
    //   report: FileList | File,
    // },
    Vitals: {
      category:"",
      height: "",
      weight: "",
      blood_pressure: "",
      bmi: "",
      grbs: "",
      cvs: "",
      respiratory_rate: "",
      cns: "",
      report: FileList | File ,
    },
    Service_procedure: {
      title: "",
      category:"",
      summary: "",
      report: FileList | File,
    },
  });


  const recordTypes = [
    "Prescription",
    "Vitals",
    "Service_procedure",
  ];

  const handleInputChange = (e, field) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [recordType]: { ...prev[recordType], [name || field]: value },
    }));
  };

  
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      Vitals: {
        ...prev.Vitals,
        [name]: files[0], // or files if you want multiple
      },
    }));
  };

  const handleSave = async () => {
    if (recordType === "Select Type") {
      alert("Please select a record type before saving.");
      return;
    }
  
    if (!patientId) {
      alert("No patient selected. Please select a patient before saving.");
      return;
    }
  
    const payload = new FormData();
    payload.append("patient_id", patientId);
    payload.append("record_type", recordType.toLowerCase().replace(" ", "_"));
  
    // Append all fields from the selected recordType
    for (const key in formData[recordType]) {
      const value = formData[recordType][key];
  
      if (key === "report") {
        if (Array.isArray(value)) {
          value.forEach((file) => payload.append("report", file));
        } else if (value instanceof File) {
          payload.append("report", value);
        }
      } else {
        payload.append(key, value);
      }
    }
  
    // Debug logging
    console.log("Record Type:", recordType);
    console.log("Form Data:", formData[recordType]);
  
    try {
      const response = await api.post("/records/records/create/", payload);
      const data = response.data;
      window.dispatchEvent(new Event("refreshAddRecordModal"));
  
      console.log("API RESPONSE:", data);
  
      if (response.status === 200 && data.success === 1) {
        alert("Record saved successfully!");
        setSavedRecords((prev) => [...prev, { type: recordType, data: formData[recordType] }]);
        setClearPreview((prev) => !prev); // Toggle preview reset
        handleClose();
      } 
      else {
        alert("Error: " + JSON.stringify(data.message));
      }
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };
  

  useEffect(() => {
    console.log("Updated Saved Records after state update:", savedRecords);
    if (!show) {
      setRecordType("Select Type");
      setClearPreview((prev) => !prev);
    }
  }, [savedRecords]); 
    // ...

 


  return (
    <Modal
     show={show}
     onHide={handleClose}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Add Medical Record
        </Modal.Title>
      </Modal.Header>
      <div className={styles.container}>
        <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <Row className={styles.prescriptionInputs}>
            <Col className={styles.inputGroup}>
              <label className={styles.HeadText}>Record Type</label>
              <DropdownButton
                title={recordType}
                onSelect={(e) => setRecordType(e)}
                className={styles.rDropdown}
              >
                {recordTypes.map((type) => (
                  <Dropdown.Item
                    key={type}
                    eventKey={type}
                    className={styles.RdropdownItem}
                  >
                    {type}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Col>

            <Col className={styles.inputGroup}>
              <label className={styles.HeadText}>Category</label>
              <Form.Control
                type="text"
                onChange={(e) => handleInputChange(e, "category")}
                placeholder="Enter category"
                className={styles.categoryIn}
                value={formData[recordType]?.category ||  ""}
              />
            </Col>
          </Row>
      
          { recordType === "Prescription" ? (
            <>
              <p className={styles.HeadText}>Prescription</p>

              <div className={styles.labInputs}>
                <div className={styles.inputGroup}>
                  <label className={styles.presText}>Medication Name</label>
                  <Form.Control
                    type="text"
                    placeholder="Enter medication name"
                    value={formData.Prescription.medication_name}
                    onChange={(e) => handleInputChange(e, "medication_name")}
                    className={styles.medInput}
                  />
                </div>
                <Row className={styles.prescriptionInputs}>
                  <Col className={styles.inputGroup}>
                    <label className={styles.presText}>Duration</label>
                    <Form.Control
                      type="text"
                      placeholder="Enter duration"
                      value={formData.Prescription.duration}
                      onChange={(e) => handleInputChange(e, "duration")}
                      className={styles.presInput}
                    />
                  </Col>
                  <Col className={styles.inputGroup}>
                    <label className={styles.presText}>Strength</label>
                    <Form.Control
                      type="text"
                      placeholder="e.g.500mg"
                      value={formData.Prescription.dosage}
                      onChange={(e) => handleInputChange(e, "dosage")}
                      className={styles.presInput}
                    />
                  </Col>
                </Row>

                <div className={styles.inputGroup}>
                  <label className={styles.presText}>Description</label>
                  <Row>
                    <Col md={12}>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter medication description..."
                        value={formData.Prescription.summary}
                        onChange={(e) => handleInputChange(e, "summary")}
                        className={styles.presDesInput}
                      />
                    </Col>
                  </Row>
                </div>
              </div>

              <div className={styles.fileUpload}>
              <DragAndDrop
                section='Prescription'
                name="report"
                setFormData={setFormData}
                clearPreview={clearPreview}
                multiple={false} 
              />
              </div>
            </>

          ) : recordType === "Vitals" ? (
            <>
              <p className={styles.HeadText}>Vitals Page</p>
              <Row className={styles.prescriptionInputs}>
                <Col className={styles.inputGroup}>
                  <label className={styles.vitalText}>Height (cm)</label>
                  <Form.Control
                    type="text"
                    placeholder="Height rating"
                    value={formData.Vitals.height}
                    onChange={(e) => handleInputChange(e, "height")}
                    className={styles.presInput}
                  />
                </Col>
                <Col className={styles.inputGroup}>
                  <label className={styles.vitalText}>Weight (kg)</label>
                  <Form.Control
                    type="text"
                    placeholder="Weight Rating"
                    value={formData.Vitals.weight}
                    onChange={(e) => handleInputChange(e, "weight")}
                    className={styles.presInput}
                  />
                </Col>
              </Row>
              <Row className={styles.prescriptionInputs}>
                <Col className={styles.inputGroup}>
                  <label className={styles.vitalText}>BP</label>
                  <Form.Control
                    type="text"
                    placeholder="BP Rating"
                    value={formData.Vitals.blood_pressure}
                    onChange={(e) => handleInputChange(e, "blood_pressure")}
                    className={styles.presInput}
                  />
                </Col>
                <Col className={styles.inputGroup}>
                  <label className={styles.vitalText}>BMI</label>
                  <Form.Control
                    type="text"
                    placeholder="BMI Rating"
                    value={formData.Vitals.bmi}
                    onChange={(e) => handleInputChange(e, "bmi")}
                    className={styles.presInput}
                  />
                </Col>
              </Row>
              <Row className={styles.prescriptionInputs}>
                <Col className={styles.inputGroup}>
                  <label className={styles.vitalText}>GRBS</label>
                  <Form.Control
                    type="text"
                    placeholder="GRBS Rating"
                    value={formData.Vitals.grbs}
                    onChange={(e) => handleInputChange(e, "grbs")}
                    className={styles.presInput}
                  />
                </Col>
                <Col className={styles.inputGroup}>
                  <label className={styles.vitalText}>CVS</label>
                  <Form.Control
                    type="text"
                    placeholder="CVS Rating"
                    value={formData.Vitals.cvs}
                    onChange={(e) => handleInputChange(e, "cvs")}
                    className={styles.presInput}
                  />
                </Col>
              </Row>
              <Row className={styles.prescriptionInputs}>
                <Col className={styles.inputGroup}>
                  <label className={styles.vitalText}>RR</label>
                  <Form.Control
                    type="text"
                    placeholder="RR Rating"
                    value={formData.Vitals.respiratory_rate}
                    onChange={(e) => handleInputChange(e, "respiratory_rate")}
                    className={styles.presInput}
                  />
                </Col>
                <Col className={styles.inputGroup}>
                  <label className={styles.vitalText}>CNS</label>
                  <Form.Control
                    type="text"
                    placeholder="CNS Rating"
                    value={formData.Vitals.cns}
                    onChange={(e) => handleInputChange(e, "cns")}
                    className={styles.presInput}
                  />
                </Col>
              </Row>
 
              <div className={styles.fileUpload}>
              <div>
              <DragAndDrop
              section="Vitals"
              name="report"
              setFormData={setFormData}
              clearPreview={clearPreview}
              multiple={false}
              />
 
              </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.inputFields}>
                <div className={styles.inputGroup}>
                  <label className={styles.HeadText}>Title</label>
                  <Form.Control
                    type="text"
                    placeholder="Enter record title"
                    value={formData.Service_procedure.title}
                    onChange={(e) => handleInputChange(e, "title")}
                    className={styles.inputPosition}
                    style={{ marginBottom: "10%" }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.HeadText}>Summary</label>
                  <Form.Control     
                    rows={4}
                    placeholder="Add a summery of the record"
                    value={formData.Service_procedure.summary}
                    onChange={(e) => handleInputChange(e, "summary")}
                    className={styles.inputPosition}
                    style={{ padding: "6% 6%" }}
                  />
                </div>
              </div>

              <div className={styles.fileUpload}>
              <DragAndDrop
              section="Service_procedure"
              name="report"
              setFormData={setFormData}
              clearPreview={clearPreview}
              multiple={false} 
              />
             
              </div>
            </>
          )}

          <div className={styles.buttonGroup}>
            <Button
              style={{
                backgroundColor: "#fff",
                borderColor: "#fff",
                color: "#313131",
                fontSize: "16px",
                fontWeight: "400",
              }}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{
                backgroundColor: "#002072",
                borderColor: "#002072",
                fontSize: "14px",
                fontWeight: "400",
                borderRadius: "12px",
              }}
            >
              Save Record
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default AddRecordModal;
