import React, { useContext } from 'react'
import { Microscope } from 'lucide-react';
import LabResultStyle from '../css/LabResult.module.css'
import BloodCount from './BloodCount';
import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import api from "../../utils/axiosInstance";
import { useEffect } from 'react';
import { doctors } from './RecordLab';
 
function LabResult() {
  const {selectedPatient} = useContext(doctors)
    const [showModal, setShowModal] = useState(false);
    const [transformData, setTransFormData] = useState([]);
    const [user, setUser] = useState([]);
    const [action, setAction] = useState([]);
 
    useEffect(() => {
      const fectingData = async () => {
        try {
          const response = await api.get(
            "/labs/lab_tests/"
          );
          if (response.data.success) {
            setTransFormData(response.data.data);
            console.log(response.data.data)
          }
        } catch (error) {
          console.log("error");
        }
      };
      fectingData();
    }, []);
 
 
 
    const handlerShow = async (action) => {
    console.log(action);
    setShowModal(true);
    const patinentExit = transformData.find(
      (transform) => transform.patient_id === selectedPatient.patient_id
    );
    if (patinentExit) {
      try {
        const response = await api.get(
          `/labs/lab_tests/${action}/`
        );
       
        setUser(response.data.data);
      } catch (err) {}
    } else {
      alert("patient not existed");
    }
  };
  return (
    <div>
        {transformData
        .filter((lab) => lab.patient_id === selectedPatient.patient_id)
        .map((lab, index) => (
          <Card key={index} className="shadow-sm mb-3 m-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Microscope className="p-1 me-3 text-primary" size={40} />
                  <div>
                    <h6>{lab.requested_test}</h6>
                    <p className="text-muted mb-1">
                      Dr.{selectedPatient.doctor_name} - {selectedPatient.date}
                    </p>
                    <p className="text-muted">{lab.summary}</p>
                  </div>
                </div>
                <span
                  className={`badge ${
                    lab.status === "Pending"
                      ? "bg-warning"
                     
                      : "bg-success"
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
        ))}
 
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
  )
}
 
export default LabResult