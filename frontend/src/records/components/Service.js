import React, { useState, useContext, useEffect } from 'react'
import ServiceStyle from '../css/Service.module.css'
import { Stethoscope } from 'lucide-react';
import { doctors } from './RecordLab';
import api from "../../utils/axiosInstance";
import { Button } from "react-bootstrap";
import { Icon } from "@iconify/react";
 
function Service() {
       const { selectedPatient}  =  useContext(doctors)
       const [serStore, setSerStore] = useState([])

       const handleDownload = async (report) => {
  try {
    if (!report) {
      console.error("No report selected");
      return;
    }
 
    const response = await api.get(report, {
      responseType: "blob",
    });
 
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
 
    const link = document.createElement("a");
    link.href = url;
 
    // Extract filename from report URL/path
    const filename = report.split("/").pop() || "report.pdf";
 
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
 
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading the report:", error);
  }
};
 
 
       useEffect(() => {
        const fetching = async () => {
            try {
                const response = await api.get(`/records/records/?record_type=service_procedure&patient_id=${selectedPatient.patient_id}`);
                console.log(response.data.data);
                if (response.data?.data) {
                    setSerStore(response.data.data);
                } else {
                 console.log("data not added")
                 setSerStore(null)
                }
            } catch (error) {
                console.error("Error fetching service procedures:", error);
            }
        };
        fetching();
         const handleRefresh = () => fetching(); // Refresh on event
 
    window.addEventListener("refreshAddRecordModal", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshAddRecordModal", handleRefresh);
    };
    }, [selectedPatient.patient_id]);
  return (
    <div>
        {serStore ? (
        <>
        {serStore.map((items, index) => (
        <div className='row ms-3 me-3' key={index} style={{margin:"1rem",}}>
                <div className='card shadow-sm' style={{padding:"1rem"}}>
                    <div className='d-flex flex-row justify-content-between mt-3'>
                        <div className='d-flex '>
                            <div>
                                <Stethoscope  size={10} className={`p-1 ms-5 mt-3 ${ServiceStyle.Stethoscope}`} />
                            </div>
                            <div className='d-flex flex-column'>
                                <span className={`ms-2 ${ServiceStyle.content}`} >{items.title}</span>
                                <span style={{fontSize:'13px',color:'#808080'}}  className='ms-2'>{items.category}</span>
                                <p style={{fontSize:'13px',color:'#808080'}}  className='ms-2'>{items.summary}</p>
                                <p style={{fontSize:'13px',color:'#808080'}} className='mt-3 me-5'>{selectedPatient.date}</p>
                            </div>
                        </div>
                        <div>
                            <p className={`p-1 me-5 mt-4 pe-2 ps-2 ${ServiceStyle.completed}`}>Completed</p>
                        </div>
                       
                    </div>
                     <div className={`d-flex flex-row justify-content-between ${ServiceStyle.file}`}>
                   {items.report ? items.report.split("/").pop() : "No file available"}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => handleDownload(items.report)}
                  >
                    <Icon
                      icon="material-symbols:download"
                      width="24"
                      height="24"
                      color="#002072"
                    />
                  </Button>
                </div>
                </div>
        </div>))}
        </>
        ):(
            <div className="text-center mt-5">
            <p style={{ color: "#808080" }}>No Service recorded for this patient yet.</p>
          </div>
        )}
    </div>
  )
}
 
export default Service
 