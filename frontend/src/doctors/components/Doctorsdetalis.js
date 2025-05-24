import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import doctor1 from '../../assets/images/image 1674.png'
import doctorstyle from '../css/Doctorsmain.module.css' ;
import { CiStethoscope } from "react-icons/ci";
import { IoStarOutline } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuPhone } from "react-icons/lu";
import { SlLocationPin } from "react-icons/sl";
import { IoCalendarClearOutline } from "react-icons/io5";
import { LuClock4 } from "react-icons/lu";

const Doctorsdetalis = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton/>
      <Modal.Body className="doctor-modal ms-2">
        <div className={`row`}>
            <div className={`col-lg-8 d-flex flex-row`}>
                <div>
                    {/* <img src={doctor1} alt="Doctor" className={`${doctorstyle.doctorimage}`} /> */}
                </div>
                <div className={`ps-5`}>
                    <h4>Dr. Michael Chen</h4>
                    <div className={`d-flex flex-row`}><CiStethoscope size={25} style={{color:"#2563EB"}}/>&nbsp;&nbsp;<p style={{color:"#979797"}}>Neurology</p></div>
                    <span className="rating"><IoStarOutline size={25} style={{color:"#CA8A04"}} />&nbsp;&nbsp; 4.9<span style={{color:"#979797"}}> (1200 patients)</span></span>
                </div>
            </div>
            <div className={`col-lg-4`}>
                <p className={`mt-3 w-25`} style={{color:"#979797"}}>1200 patients</p>
            </div>
        </div>
        <hr></hr>
        <div className={`row`}>
            <div className={`col-lg-4`} >
            <h5>Contact Information</h5>
                <div style={{color:"#979797"}}>
                    <p><MdOutlineMailOutline />&nbsp;&nbsp;&nbsp;dr.chen@medicare.com</p>
                    <p><LuPhone />&nbsp;&nbsp;&nbsp;+1 (555) 123-4567</p>
                    <p><SlLocationPin />&nbsp;&nbsp;&nbsp; Wing B, Room 310</p>
                </div>
            </div>
            <div className={`col-lg-8`}>
            <h5>Availability</h5>
                <div style={{color:"#979797"}}>
                    <p><IoCalendarClearOutline />&nbsp;&nbsp; Monday, Tuesday, Wednesday, Friday</p>
                    <p><LuClock4 />&nbsp;&nbsp;&nbsp;10:00AM - 6:00PM</p>
                </div>
            </div>
        </div>
          <h5>Today's Schedule</h5>
          <div className={`row d-flex justify-content-evenly`}>
            <div className={`${doctorstyle.booked} d-flex flex-column justify-content-center col-4 col-md-3`}>
                <div className={`${doctorstyle.txt}`}><span>10:00 AM</span></div>
                <div className={`${doctorstyle.txt}`}><span>Booked</span></div>
            </div>
            <div className={`${doctorstyle.booked} d-flex flex-column justify-content-center col-4 col-md-3`}>
                <div className={`${doctorstyle.txt}`}><span>11:00 AM </span></div>
                <div className={`${doctorstyle.txt}`}><span>Booked</span></div>
            </div>
            <div className={`${doctorstyle.break} d-flex flex-column justify-content-center col-4 col-md-3`}>
                <div className={`${doctorstyle.txt}`}><span>12:00 PM </span></div>
                <div className={`${doctorstyle.txt}`}><span> Break</span></div>
            </div>
           <div className={`${doctorstyle.available} d-flex flex-column justify-content-center col-4 col-md-3`}>
                <div className={`${doctorstyle.txt}`}><span>02:00 PM </span></div>
                <div className={`${doctorstyle.txt}`}><span>Available</span></div>
           </div>
            <div className={`${doctorstyle.available} d-flex flex-column justify-content-center col-4 col-md-3`}>
                <div className={`${doctorstyle.txt}`}><span>03:00 PM </span></div>
                <div className={`${doctorstyle.txt}`}><span>Available</span></div>
            </div>
            <div className={`${doctorstyle.available} d-flex flex-column justify-content-center col-4 col-md-3`}>
               <div className={`${doctorstyle.txt}`}> <span >04:00 PM </span></div>
                <div className={`${doctorstyle.txt}`}><span> Available</span></div>
            </div>
          </div>
            <div className={`row`}>
            <div className={`col-lg-6`}>
                <h5 className='mt-3'>Education & Certifications</h5>
                <h5 style={{color:"#484848"}}>Education</h5>
                <div style={{color:"#979797"}} >
                    <span>. MD, Stanford University School of Medicine</span><br></br>
                    <span>. Neurology Residency, Johns Hopkins</span><br></br>
                    <span>. Fellowship in Neurophysiology</span>
                </div>
            </div>
            <div className={`col-lg-6 mt-5`}>
                <h5 style={{color:"#484848"}}>Certifications</h5>
                <div style={{color:"#979797"}}>
                    <span>. American Board of Psychiatry and Neurology</span><br></br>
                    <span>. Neurological Surgery Certification</span><br></br>
                    <span>. Advance Neuroscience Certification</span><br></br>
                </div>
            </div>
        </div>
        <hr></hr>
        <div className="text-center mt-3">
            <Button  className={`w-100 ${doctorstyle.button}`} onClick={handleClose}>
                Schedule Appointment
            </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Doctorsdetalis;