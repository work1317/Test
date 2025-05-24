"use client";
import { useState,useEffect } from "react";
import { Edit } from "lucide-react";
import "../css/InPatient.css";
import { Icon } from "@iconify/react";
import History from "./History"; 
import Prescription from "./Prescription"; 
import InEdit from "./Inedit"
import Vitals from "./Vitals";

export default function Inpatient({patient}) {
  const [activeTab, setActiveTab] = useState("vitals"); 
  const [show, setShow] = useState(false);
  const [editDisabled, setEditDisabled] = useState(false);
  // const [vitalsList, setVitalsList] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

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

  // const handleShow = () => setShow(true);
  // const handleClose = () => setShow(false);
  // useEffect(() => {
  //   if (!patient) return;

  //   const fetchVitals = async () => {
  //     try {
  //       const response = await fetch(`//records/vitals/${patient.patient_id}`);
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch vitals data");
  //       }
  //       // const data = await response.json();
  //       setVitalsList(response.data);  // assuming data is an array of vitals entries
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchVitals();
  // }, [patient]);

  // if (loading) return <div>Loading vitals...</div>;
  // if (error) return <div>Error: {error}</div>;
  // if (vitalsList.length === 0) return <div>No vitals records found.</div>;

  // console.log(vitalsList);

  return (
    <div className="patient-details-container">
      <div className="patient-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="patient-name">{patient.patient_name}</h2>
          <div className="d-flex align-items-center">
            <span className="status-badge instable">Stable</span>
            <button className="edit-btn ms-2">
            <Edit size={18} disabled={editDisabled} onClick={handleShow}/>
                  <InEdit
        show={show}
        handleClose={handleClose}
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
        {/* {activeTab === "vitals" && (
          <div className="vitals-section">
            <div className="vitals-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="vitals-title">Vitals Check</h5>
                <span className="vitals-time">2024-03-17 08:00 AM</span>
              </div>

              <div className="row">
                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Thermometer size={16} className="vital-icon" />
                      <span className="vital-label">Temperature</span>
                    </div>
                    <div className="vital-value">98.6 F</div>
                  </div>
                </div>

                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Activity size={16} className="vital-icon" />
                      <span className="vital-label">Blood Pressure</span>
                    </div>
                    <div className="vital-value">120/80</div>
                  </div>
                </div>

                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Heart size={16} className="vital-icon" />
                      <span className="vital-label">Heart Rate</span>
                    </div>
                    <div className="vital-value">72 BPM</div>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Droplet size={16} className="vital-icon" />
                      <span className="vital-label">Oxygen Level</span>
                    </div>
                    <div className="vital-value">98%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="vitals-Secondsection">
            <div className="vitals-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="vitals-title">Vitals Check</h5>
                <span className="vitals-time">2024-03-17 03:00 PM</span>
              </div>
              <div className="row">
                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Thermometer size={16} className="vital-icon" />
                      <span className="vital-label">Temperature</span>
                    </div>
                    <div className="vital-value">98.8 F</div>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Activity size={16} className="vital-icon" />
                      <span className="vital-label">Blood Pressure</span>
                    </div>
                    <div className="vital-value">118/78</div>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Heart size={16} className="vital-icon" />
                      <span className="vital-label">Heart Rate</span>
                    </div>
                    <div className="vital-value">75 BPM</div>
                  </div>
                </div>

                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Droplet size={16} className="vital-icon" />
                      <span className="vital-label">Oxygen Level</span>
                    </div>
                    <div className="vital-value">97%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        )} */}

        {/* category:"",
      height: "",
      weight: "",
      blood_pressure: "",
      bmi: "",
      grbs: "",
      cvs: "",
      respiratory_rate: "",
      cns: "", */}
        {activeTab === "vitals" && <Vitals patient_id={patient.patient_id} />}
        {activeTab === "prescription" && <Prescription patient_id={patient.patient_id} />}
        {activeTab === "history" && <History />}
      </div>
    </div>
  );
}
