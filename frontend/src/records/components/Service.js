// import React, { useState, useContext, useEffect } from 'react'
// import ServiceStyle from '../css/Service.module.css'
// import { Stethoscope } from 'lucide-react';
// import { doctors } from './RecordLab';
// import api from "../../utils/axiosInstance";

// function Service() {
//        const { selectedPatient}  =  useContext(doctors)
//        const [serStore, setSerStore] = useState([])


//        useEffect(() => {
//         const fetching = async() => {
//             const response  =  await api.get(`/records/records/?record_type=service_procedure&patient_id=${selectedPatient.patient_id}`)
//             console.log(response.data.data)
//             if(response.data?.data){
//                 setSerStore(response.data.data)
               
//             }else{
//                 alert("data not added")
//             }
//         }
//         fetching()
//        }, [])
//   return (
//     <div>
//         {serStore.map((items, index) => (
//         <div className='row ms-3 me-3' key={index} style={{margin:"1rem"}}>
//                 <div className='card shadow-sm'>
//                     <div className='d-flex flex-row justify-content-between mt-3'>
//                         <div className='d-flex '>
//                             <div>
//                                 <Stethoscope  size={10} className={`p-1 ms-5 mt-3 ${ServiceStyle.Stethoscope}`} />
//                             </div>
//                             <div className='d-flex flex-column'>
//                                 <span className={`ms-2 ${ServiceStyle.content}`} >{items.procedure_name}</span>
//                                 <span style={{fontSize:'13px',color:'#808080'}}  className='ms-2'>{items.procedure_notes}</span>
//                                 <p style={{fontSize:'13px',color:'#808080'}} className='mt-3 me-5'>{selectedPatient.date}</p>
//                             </div>
//                         </div>
//                         <div>
//                             <p className={`p-1 me-5 mt-4 pe-2 ps-2 ${ServiceStyle.completed}`}>Completed</p>
//                         </div> 
//                     </div>
//                 </div>
//         </div>))}
      
//     </div>
//   )
// }

// export default Service
import React, { useState, useContext, useEffect } from 'react'
import ServiceStyle from '../css/Service.module.css'
import { Stethoscope } from 'lucide-react';
import { doctors } from './RecordLab';
import api from "../../utils/axiosInstance";
 
function Service() {
       const { selectedPatient}  =  useContext(doctors)
       const [serStore, setSerStore] = useState([])
 
 
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
                                <p style={{fontSize:'13px',color:'#808080'}} className='mt-3 me-5'>{selectedPatient.date}</p>
                            </div>
                        </div>
                        <div>
                            <p className={`p-1 me-5 mt-4 pe-2 ps-2 ${ServiceStyle.completed}`}>Completed</p>
                        </div>
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
 