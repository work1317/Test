
import { useState } from "react";
import { Edit,  User,Thermometer, Activity, Heart, Droplet } from "lucide-react";
import "../css/InPatient.css";
import { Icon } from "@iconify/react";
import Outhistory from "./Outhistory"; 
import Outprescription from "./Outprescription";


export default function Outpatient() {
  const [activeTab, setActiveTab] = useState("vitals"); 

  return (
    <div className="patient-details-container">
      <div className="patient-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="patient-name">Jane Doe</h2>
          <div className="d-flex align-items-center">
            <span className="status-badge stable">Good</span>
            <button className="edit-btn ms-2">
              <Edit size={18} />
            </button>
          </div>
        </div>
        <div className="patient-info">
          <span>32 Years</span>
          <span className="mx-2">•</span>
          <span>Female</span>
          <span className="mx-2">•</span>
          <span>ID: P002</span>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <div className="info-card">
            <div className="d-flex align-items-center">
            <Icon icon="maki:doctor" width="20" height="20" />
              <span className="info-title">Attending Doctor</span>
            </div>
            <div className="info-content">Dr. Michael chan</div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="info-card">
            <div className="d-flex align-items-center">
            <Icon icon="pepicons-pencil:file" width="14" height="18" />
              <span className="info-title">Diagnosis</span>
            </div>
            <div className="info-content">Regular Checkup</div>
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
              className={`nav-link ${activeTab === "outprescription" ? "active" : ""}`}
              onClick={() => setActiveTab("outprescription")}
            >
              Prescriptions
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "outhistory" ? "active" : ""}`}
              onClick={() => setActiveTab("outhistory")}
            >
              History
            </button>
          </li>
        </ul>
        <hr className="tab-divider" />
      </div>
      <div className="tab-content mt-4">
        {activeTab === "vitals" && (
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
                    <div className="vital-value">98.4 F</div>
                  </div>
                </div>

                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Activity size={16} className="vital-icon" />
                      <span className="vital-label">Blood Pressure</span>
                    </div>
                    <div className="vital-value">1215/75</div>
                  </div>
                </div>

                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Heart size={16} className="vital-icon" />
                      <span className="vital-label">Heart Rate</span>
                    </div>
                    <div className="vital-value">68 BPM</div>
                  </div>
                </div>

                <div className="col-md-3 col-6 mb-3">
                  <div className="vital-item">
                    <div className="d-flex align-items-center mb-1">
                      <Droplet size={16} className="vital-icon" />
                      <span className="vital-label">Oxygen Level</span>
                    </div>
                    <div className="vital-value">99%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "outprescription" && <Outprescription />}
        {activeTab === "outhistory" && <Outhistory />}
      </div>
    </div>
  );
}

