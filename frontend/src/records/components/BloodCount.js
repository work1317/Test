import React, { createContext } from 'react'
import RecordStyle from '../css/RecordVital.module.css';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Microscope } from 'lucide-react';
import { File } from 'lucide-react';
import { Download } from 'lucide-react';
import { doctors } from './RecordLab';
import api from '../../utils/axiosInstance';
import { Icon } from '@iconify/react';

export const  transforImage  =  createContext()
const BloodCount= ({ show, handleClose, user, selectedPatient, action, transformData}) => {
    const handleDownload = async () => {
       try {
          const response = await api.get(`labs/labtests_download/${action}/`, {
            responseType: 'blob', // Important to get image data correctly
          });
     
          // Create a Blob from the image response
          const url = window.URL.createObjectURL(new Blob([response.data]));
     
          // Create a temporary link element
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'labtest_image.jpg'); // File name
     
          // Trigger the download
          document.body.appendChild(link);
          link.click();
     
          // Clean up
          link.remove();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error downloading the image:', error);
        }
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
                     {/* <Microscope className={`p-1 mt-2 ms-2 ${RecordStyle.heart}`} /> */}

                          <div className="rounded-circle  p-2 me-2">
                                                              <div
                                                                style={{
                                                                  width: "40px",
                                                                  height: "40px",
                                                                  borderRadius: "50%",
                                                                  backgroundColor: "#e6eaf2",
                                                                  display: "flex",
                                                                  justifyContent: "center",
                                                                  alignItems: "center",
                                                                }}
                                                              >
                                                                {/* <FaMicroscope size={32} color="#3f51b5" /> */}
                                                                  <Icon width="24" height="24" color="#262872" icon="uit:microscope" />
                                                              </div>
                                                            </div>

                    <div className='ms-2 d-flex flex-column'>
                        <h5>{item.test_name}</h5>
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
                <div className='mt-3' >
                    <h6>Attachments</h6>
                    <div className='d-flex flex-row justify-content-between m-1' style={{backgroundColor:"#F9FAFC"}}>
                        <div className='d-flex flex-row'>
                        <p ><File className='me-2' size={15} style={{color:"#9A9A9A"}}/> {user.result_filename} <span className='ms-3' style={{color:"#9A9A9A"}}>(2.4 MB)</span></p>
                        </div>
                        <div onClick={handleDownload}>
                             <Icon icon="material-symbols:download" width="24" height="24" color="#002072"/>                        </div>
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