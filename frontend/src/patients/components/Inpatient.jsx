"use client";
import { useState,useEffect } from "react";
import { Edit } from "lucide-react";
import "../css/InPatient.css";
import { Icon } from "@iconify/react";
import History from "./History"; 
import Prescription from "./Prescription"; 
import InEdit from "./Inedit"
import Vitals from "./Vitals";

export default function Inpatient({patient, fetchPatients}) {
  const [activeTab, setActiveTab] = useState("vitals"); 
  const [show, setShow] = useState(false);
  const [editDisabled, setEditDisabled] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {

    if(!patient) return;

    const checkEditStatus = () => {
      const currentTime = new Date();
      const admissionDate = new Date(patient.admissionTime);
      const hoursPassed = (currentTime - admissionDate) / (1000 * 60 * 60);

      setEditDisabled(hoursPassed >= 30);
    };

    checkEditStatus();
    const interval = setInterval(checkEditStatus, 60000); 
    return () => clearInterval(interval);

  
  }, [patient.admissionTime]);


  return (
    <div className="patient-details-container">
      <div className="patient-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="patient-name">{patient.patient_name}</h2>
          <div className="d-flex align-items-center">
            <span className="status-badge instable"> {patient.status} </span>
            <button className="edit-btn ms-2">
            <Edit size={18} disabled={editDisabled} onClick={handleShow}/>
                  <InEdit
        show={show}
        handleClose={handleClose}
        fetchPatients={fetchPatients}
        patientId={patient.patient_id}
      />              {editDisabled && <small className="text-danger ms-2"></small>}
            </button>
          </div>
        </div>
        <div className="patient-info">
          <span>{patient.age}</span>
          <span className="mx-2">•</span>
          <span>{patient.gender}</span>
          <span className="mx-2">•</span>
          <span>{patient.patient_id}</span>
        </div>
      </div>


      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <div className="info-card">
            <div className="d-flex align-items-center">
            <Icon icon="maki:doctor" width="20" height="20" />
              <span className="info-title">Attending Doctor</span>
            </div>
            <div className="info-content">{patient.doctor_name}</div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="info-card">
            <div className="d-flex align-items-center">
            <Icon icon="pepicons-pencil:file" width="14" height="18" />
              <span className="info-title">Diagnosis</span>
            </div>
            <div className="info-content">{patient.diagnosis}</div>
          </div>
        </div>
      </div>
      <div className="patient-tabs mt-4">
        <ul className="nav">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "vitals" ? "active" : ""}`}
              onClick={() => setActiveTab("vitals")}
            >
              Vitals
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "prescription" ? "active" : ""}`}
              onClick={() => setActiveTab("prescription")}
            >
              Prescriptions
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </li>
        </ul>
        <hr className="tab-divider" />
      </div>

      {/* Conditionally Render the Selected Tab Content */}
      <div className="tab-content mt-4">
        {activeTab === "vitals" && <Vitals patient_id={patient.patient_id} />}
        {activeTab === "prescription" && <Prescription patient_id={patient.patient_id} />}
        {activeTab === "history" && <History />}
      </div>
    </div>
  );
}
