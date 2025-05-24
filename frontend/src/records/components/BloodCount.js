import React, { createContext } from 'react'
import RecordStyle from '../css/RecordVital.module.css';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Microscope } from 'lucide-react';
import { File } from 'lucide-react';
import { Download } from 'lucide-react';
import { doctors } from './RecordLab';
export const  transforImage  =  createContext()
const BloodCount= ({ show, handleClose, user, selectedPatient, action, transformData}) => {
    const handleDownload = async () => {
        const url = `/labs/labtests_download/${action}/`;
        console.log(url);
        const link = document.createElement('a');
        link.href = url;
     
   
        link.download = 'labtest_image.jpg';
        link.click();
      };
     
  return (
    <div>
        {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}
      {transformData.map((item, index) => (
      <Modal show={show} onHide={handleClose} size='lg' key={index}>
        <Modal.Header closeButton >
            <div className='row'>
                <div className='d-flex'>
                     <Microscope className={`p-1 mt-2 ms-2 ${RecordStyle.heart}`} />
                    <div className='ms-2 d-flex flex-column'>
                        <h5>{item.requested_test}</h5>
                        <span style={{fontSize:'13px',color:'#808080'}}>Lab Result - {user.test_date} </span>
                    </div>
                </div>
            </div>
        </Modal.Header>
        <Modal.Body>
          <div className={`row`}>
            <div className={`col-9 d-flex flex-row justify-content-between`}>
                <div className='ms-3'>
                    <h6 style={{color:"#313131",fontSize:20}}>Doctor</h6>
                    <p style={{color:"#313131"}}>Dr. {user.doctor}</p>
                </div>
                <div className=''>
                    <h6 style={{color:"#313131",fontSize:20}}>Category</h6>
                    <p style={{color:"#313131"}}>{user.test_type}</p>
                </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-9 ms-3'>
                <h6 style={{color:"#313131",fontSize:20}}>Summary</h6>
                <p>{user.summary}</p>
            </div>
          </div>
          <div className='row ms-1'>
            {/* <h6 style={{color:"#313131",fontSize:20}}>Details</h6>
                <div className='col-12 mt-2' style={{backgroundColor:"#F9FAFC"}}>
                    <div className='d-flex flex-row justify-content-between ms-3 me-3 pt-3'>
                        <div>
                            <h6>Hemoglobin</h6>
                        </div>
                        <div>
                            <h6>14.2 g/dL</h6>
                        </div>
                    </div>
                    <hr style={{backgroundColor:"#D9D9D9"}}></hr>    */}
                    {/* <div className='d-flex flex-row justify-content-between ms-3 me-3'>
                        <div>
                            <h6>Wbc</h6>
                        </div>
                        <div>
                            <h6>7.5 x 10^9/L</h6>
                        </div>
                    </div>
                    <hr style={{backgroundColor:"#D9D9D9"}}></hr>  */}
                    {/* <div className='d-flex flex-row justify-content-between ms-3 me-3'>
                        <div>
                            <h6>Platelets</h6>
                        </div>
                        <div>
                            <h6>250 x 10^9/L</h6>
                        </div>
                    </div> */}
                {/* </div> */}
                <div className='mt-3' >
                    <h6>Attachments</h6>
                    <div className='d-flex flex-row justify-content-between m-1' style={{backgroundColor:"#F9FAFC"}}>
                        <div className='d-flex flex-row'>
                        <p ><File className='me-2' size={15} style={{color:"#9A9A9A"}}/> {user.result} <span className='ms-3' style={{color:"#9A9A9A"}}>(2.4 MB)</span></p>
                        </div>
                        <div onClick={handleDownload}>
                            <Download className='me-2' style={{color:"#002072"}} size={20}/>
                        </div>
                    </div>
                </div>
          </div>
        </Modal.Body>
      </Modal>
      ))}
    </div>
  )
}
 
export default BloodCount