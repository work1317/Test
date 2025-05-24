import React from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import doctorstyle from "../css/Doctorsmain.module.css";
import { CiStethoscope } from "react-icons/ci";
import { IoStarOutline } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuPhone } from "react-icons/lu";
import { SlLocationPin } from "react-icons/sl";
import { IoCalendarClearOutline } from "react-icons/io5";
import { LuClock4 } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useState } from "react";
import ScheduleAppointments from "../../Appointment/componnets/ScheduleAppointments";
import { FaLastfmSquare } from "react-icons/fa";

const Doctorsmain = ({ doctor, show, handlerClose,slots }) => {
  const [showUserModal, setShowUserModal] = useState(false)
  const handleClose = () => {
    setShowUserModal(true)
  }
 

  return (
    <Modal show={show} onHide={handlerClose} centered size="lg">
      <Modal.Header closeButton onHide={handleClose} />
      <Modal.Body className="doctor-modal ms-2">
        <div className={`row`}>
          <div className={`col-md-8 d-flex flex-row`}>
            <div className={`ps-5`}>
              <h4>{doctor.d_name}</h4>
              <div className={`d-flex flex-row`}>
                <CiStethoscope size={25} style={{ color: "#2564EB" }} />
                &nbsp;&nbsp;
                <p style={{ color: "#979797" }}>{doctor.d_department}</p>
              </div>
              <span className="rating">
                <IoStarOutline size={25} style={{ color: "#CA8A04" }} />
                &nbsp;&nbsp; 4.8
                <span style={{ color: "#979797" }}> (1500 patients)</span>
              </span>
            </div>
          </div>
          <div className={`col-md-4`}>
            <p className={`mt-4 w-25`} style={{ color: "#979797" }}>
              1500 patients
            </p>
          </div>
        </div>
        <hr></hr>
        <div className={`row`}>
          <div className={`col-md-4`}>
            <h5>Contact Information</h5>
            <div style={{ color: "#979797" }}>
              <p>
                <MdOutlineMailOutline />
                &nbsp;&nbsp;&nbsp; {doctor.d_email}{" "}
              </p>
              <p>
                <LuPhone />
                &nbsp;&nbsp;&nbsp; {doctor.d_phn_no}{" "}
              </p>
              <p>
                <SlLocationPin />
                &nbsp;&nbsp;&nbsp; {doctor.d_ward_no}
              </p>
            </div>
          </div>
          <div className={`col-md-8`}>
            <h5>Availability</h5>
            <div style={{ color: "#979797" }}>
              <p>
                <IoCalendarClearOutline />
                &nbsp;&nbsp;{" "}
                {Array.isArray(doctor.d_available_days)
                  ? doctor.d_available_days.join(", ")
                  : doctor.d_available_days}
              </p>
              <p>
                <LuClock4 />
                &nbsp;&nbsp;&nbsp;{doctor.d_start_time} - {doctor.d_end_time}{" "}
              </p>
            </div>
          </div>
        </div>
        <h5>Today's Schedule</h5>
        <div className="row d-flex justify-content-evenly">
          {doctor.d_available_slots.map((slot, index) => (
            <div
              key={index}
              className={`
                    ${
                      slot.status === "Available"
                        ? doctorstyle.available
                        : slot.status === "Booked"
                        ? doctorstyle.booked
                        : doctorstyle.break
                    } 
                    d-flex flex-column justify-content-center col-4 col-md-3
                `}
            >
              <div className={doctorstyle.txt}>
                <span>{slot.time}</span>
              </div>
              <div className={doctorstyle.txt}>
                <span>{slot.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`row`}>
          <div className={`col-md-6`}>
            <h5 className="mt-4">Education & Certifications</h5>
            <h5 style={{ color: "#484848" }}>Education</h5>
            {/* <div style={{ color: "#979797" }}>
              <span>. MD, Harvard Medical School</span>
              <span>. Cardiology Fellowship, Mayo Clinic</span>
              <span>. Board Certified Cardiovascular Disease</span>
            </div> */} 
            {doctor.d_education_info}
          </div>

          
          <div className={`col-md-6 mt-5`}>
            <h5 style={{ color: "#484848" }}>Certifications</h5>
            <div style={{ color: "#979797" }}>
              {/* <span>. American Board of Internal Medicine</span>
              <span>. Advanced Cardiac Life Support</span>
              <span>. Fellow of the American College of Cardiology</span> */}
              {doctor.d_certifications}
            </div>
          </div>
        </div>
        <hr></hr>
        <div className="text-center mt-4">
          <Button
            className={`w-100 ${doctorstyle.button}`}
            onClick={handleClose}
          >
            Schedule Appointment
          </Button>
          <ScheduleAppointments show={showUserModal} handleClose={() => setShowUserModal(false)} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Doctorsmain;
