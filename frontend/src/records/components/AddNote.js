import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import ProgressNotes from "./ProgressNotes";
import TreatmentChat from "./TreatmentChat";
import InitialAssement from "./InitialAssement";
import RiskAssesment from "./RiskAssesment";
import PainAssessment from "./PainAssesment";
import CarePlan from "./CarePlan";
import NursingNote from "./NursingNote";
import { Icon } from "@iconify/react";

const AddNote = ({ show, handleClose,patientId}) => {
  const [activeTab, setActiveTab] = useState("nursingnote");

  return (
    <Modal show={show} size={"xl"} >
      <div className="mt-2">
        {/* Close Button */}
        <div className="d-flex justify-content-end mx-4">
          <button className="border-0 btn btn-outline" onClick={handleClose}>
            <Icon icon="carbon:close-outline" width="25" height="25" color="#9A9A9A" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="patient-tabs mt-1">
          <ul className="nav d-flex justify-content-between gap-1 px-4">
            {[
              { id: "nursingnote", label: "Nursing Notes" },
              { id: "progressnotes", label: "Progress Notes" },
              { id: "treatmentchat", label: "Treatment Chart" },
              { id: "painassesment", label: "Pain Assessment" },
              { id: "initialassesment", label: "Initial Assessment" },
              { id: "careplan", label: "Care Plan" },
              { id: "riskassement", label: "Risk Assessment" },
            ].map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ color: "black" }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
          <hr className="tab-divider" />
        </div>
      </div>

      {/* Dynamic Content Based on Active Tab */}
      {activeTab === "nursingnote" && <NursingNote handleClose={handleClose} patientId={patientId} />}
      {activeTab === "progressnotes" && <ProgressNotes handleClose={handleClose} patientId={patientId}/>}
      {activeTab === "treatmentchat" && <TreatmentChat handleClose={handleClose}patientId={patientId}/>}
      {activeTab === "painassesment" && <PainAssessment handleClose={handleClose}  patientId={patientId}/>}
      {activeTab === "careplan" && <CarePlan handleClose={handleClose} patientId={patientId}/>}
      {activeTab === "initialassesment" && <InitialAssement handleClose={handleClose} patientId={patientId} />}
      {activeTab === "riskassement" && <RiskAssesment handleClose={handleClose} patientId={patientId} />}
    </Modal>
  );
};

export default AddNote;
