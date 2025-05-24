import React from 'react'
import RecordStyle from '../css/RecordVital.module.css';
import Modal from 'react-bootstrap/Modal';
import { Heart } from 'lucide-react';
import { doctors } from './RecordLab';
import { useState, useEffect, useContext } from 'react';
import { vitalDatas } from './DailyVital';
const RecordeVital= ({ show, handleClose, store}) => {
    const { selectedPatient, patients}  =  useContext(doctors)
 
   
  return (
    <div>
        {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}
 
      <Modal show={show} onHide={handleClose} size='lg'>
        <Modal.Header closeButton >
            <div className='row'>
                <div className='d-flex'>
                    <Heart className={`p-1 ms-2 mt-3 ${RecordStyle.heart}`} />
                    <div className='mt-2 ms-2 d-flex flex-column'>
                        <span>Daily Vitals Check</span>
                        <span style={{fontSize:'13px',color:'#808080'}}>Vitals - {selectedPatient.date}</span>
                    </div>
                </div>
            </div>
        </Modal.Header>
        <Modal.Body>
          <div className={`row`}>
            <div className={`col-9 d-flex flex-row justify-content-between`}>
                <div className='ms-3'>
                    <h6 style={{color:"#313131",fontSize:20}}>Doctor</h6>
                    <p style={{color:"#313131"}}>{selectedPatient.doctor_name}</p>
                </div>
                <div className=''>
                    <h6 style={{color:"#313131",fontSize:20}}>Category</h6>
                    <p style={{color:"#313131"}}>{store.category}</p>
                </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-9 ms-3'>
                <h6 style={{color:"#313131",fontSize:20}}>Summary</h6>
                <p>All vitals with normal range</p>
            </div>
          </div>
          <div className='row ms-1'>
            <h6 style={{color:"#313131",fontSize:20}}>Details</h6>
                <div className='col-12 mt-3' style={{backgroundColor:"#F9FAFC"}}>
                    <div className='d-flex flex-row justify-content-between ms-3 me-3'>
                        <div>
                            <h6>Temperature</h6>
                        </div>
                        <div>
                            <h6>{store.grbs}</h6>
                        </div>
                    </div>
                    <hr style={{backgroundColor:"#D9D9D9"}}></hr>  
                    <div className='d-flex flex-row justify-content-between ms-3 me-3'>
                        <div>
                            <h6>Blood Pressure</h6>
                        </div>
                        <div>
                            <h6>{store.blood_pressure}</h6>
                        </div>
                    </div>
                    <hr style={{backgroundColor:"#D9D9D9"}}></hr>
                    <div className='d-flex flex-row justify-content-between ms-3 me-3'>
                        <div>
                            <h6>GRBS</h6>
                        </div>
                        <div>
                            <h6>{store.grbs}</h6>
                        </div>
                    </div>
                    <hr style={{backgroundColor:"#D9D9D9"}}></hr>
                    <div className='d-flex flex-row justify-content-between ms-3 me-3'>
                        <div>
                            <h6>CVS</h6>
                        </div>
                        <div>
                            <h6>{store.cvs}</h6>
                        </div>
                    </div>
                </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
 
export default RecordeVital
 