import React, { useContext, useEffect } from "react";
import { Microscope } from "lucide-react";
import BloodCount from "./BloodCount";
import { useState } from "react";
import { Card, Button } from "react-bootstrap";
import axios from "axios";
import { doctors } from "./RecordLab";
import api from "../../utils/axiosInstance";
function LabResult({ transformData }) {
  const { selectedPatient } = useContext(doctors);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState([]);
  const [action, setAction] = useState([]);

  // useEffect(() => {
  //   console.log(transformData)
  // })

  const handlerShow = async (action) => {
    console.log(action);
    setShowModal(true);
    const patinentExit = transformData.find(
      (transform) => transform.patient_id === selectedPatient.patient_id
    );
    if (patinentExit) {
      try {
        const response = await api.get(
          `labs/lab_tests/${action}/`
        );
        console.log(response.data.data);
        setUser(response.data.data);
      } catch (err) {}
    } else {
      alert("patient not existed");
    }
  };
  const patient = transformData.some(
    (p) => p.patient_id === selectedPatient.patient_id
  );
  console.log(patient);
  return (
    <> 
      <div>
      {transformData.filter(lab => lab.patient_id === selectedPatient.patient_id).length === 0 ? (
        <div className="text-center mt-5">
            <p style={{ color: "#808080" }}>No Labresult recorded for this patient yet.</p>
          </div>
      ) : (
        transformData
          .filter((lab) => lab.patient_id === selectedPatient.patient_id)
          .map((lab, index) => (
            <Card key={index} className="shadow-sm mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <Microscope className="p-1 me-3 text-primary" size={40} />
                    <div>
                      <h6>{lab.test_name}</h6>
                      <p className="text-muted mb-1">
                        Dr.{selectedPatient.doctor_name} - {selectedPatient.date}
                      </p>
                      <p className="text-muted">{lab.summary}</p>
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      lab.status === "Pending" ? "bg-warning" : "bg-success"
                    }`}
                  >
                    {lab.status}
                  </span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>1 attachment(s)</span>
                  <Button
                    variant="link"
                    onClick={() => {
                      handlerShow(lab.action);
                      setAction(lab.action);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
      )}

      <BloodCount
        show={showModal}
        handleClose={() => setShowModal(false)}
        user={user}
        transformData={transformData.filter(
          (item) => item.patient_id === selectedPatient.patient_id
        )}
        action={action}
      />
    </div>

    </>

  );
}

export default LabResult;
