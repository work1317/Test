import React, { useState, useEffect, useContext, createContext } from 'react';
import { Heart } from 'lucide-react';
import api from "../../utils/axiosInstance";
import DailyVitalStyle from '../css/DailyVital.module.css';
import RecordeVital from './RecordeVital';
import { doctors } from './RecordLab';
 
export const vitalDatas  = createContext()
function DailyVital() {
    const [showModal, setShowModal] = useState(false);
    const [vitalData, setVitalData] = useState([]);
    const [store, setStore] =  useState([])
    const {selectedPatient, patients}  =  useContext(doctors)
 
    useEffect(() => {
     
        const fetchVitals = async () => {
            try {
               
                const response = await api.get(`/records/records/?record_type=vitals&patient_id=${selectedPatient.patient_id}`);
                
   
             
                if (response.data?.data) {
                    setStore(response.data.data[0]);
                    console.log(response.data)
                } else {
                    console.log("No data in response");
                    setStore(null)
                }
            } catch (error) {
                console.error("Error fetching vitals:", error);
            }
        };
        fetchVitals()
      const handleRefresh = () => fetchVitals(); // Refresh on event
 
    window.addEventListener("refreshAddRecordModal", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshAddRecordModal", handleRefresh);
    };
    }, []);
   
   
    const dateOnly = selectedPatient.created_at.split('T')[0];
 
    return (
       
        <div>
        {store ? (
          <>
            <div className="row ms-3 me-3">
              <div className="card shadow-sm" onClick={() => setShowModal(true)}>
                <div className="d-flex flex-row justify-content-between mt-3" style={{padding:"1rem"}}>
                  <div className="d-flex">
                    <div>
                      <Heart className={`p-1 ms-5 mt-3 ${DailyVitalStyle.heart}`} />
                    </div>
                    <div className="d-flex flex-column">
                      <span className={`ms-2 ${DailyVitalStyle.text}`}>Daily Vitals Check</span>
                      <span style={{ fontSize: '13px', color: '#808080' }} className="ms-2">
                        Dr. {selectedPatient.doctor_name} - {dateOnly}
                      </span>
                      <p style={{ fontSize: '1rem', color: '#808080' }} className="mt-3 me-5">
                        {selectedPatient.summary}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className={`p-1 me-5 mt-4 pe-2 ps-2 ${DailyVitalStyle.complete}`}>
                      {/* Some text if needed */}
                      Completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
     
            <RecordeVital show={showModal} store={store} handleClose={() => setShowModal(false)} />
          </>
        ) : (
          <div className="text-center mt-5">
            <p style={{ color: "#808080" }}>No vitals recorded for this patient yet.</p>
          </div>
        )}
      </div>
     
   
    );
}
 
export default DailyVital;