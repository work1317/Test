import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { CiCalendar, CiFilter } from "react-icons/ci";
import { GoClock } from "react-icons/go";
import {
  IoIosCheckmarkCircleOutline,
  IoIosCloseCircleOutline,
} from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";

import styles from "../css/Appointment.module.css";
import ScheduleAppointments from "./ScheduleAppointments";
import CalendarComponent from "./CalendarComponent";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import api from "../../utils/axiosInstance";

const Appointments = () => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [currentFilter, setCurrentFilter] = useState("today");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments("today");
  }, []);

  const fetchAppointments = (filterType) => {
    setCurrentFilter(filterType);
    api
      .get(`/appointments/get-appointments-list/?filter=${filterType}`)
      .then((response) => {
        setAppointments(response.data.data.appointments);
        console.log(response.data);
        setStats(response.data.data.stats);
      })
      .catch((error) =>
        console.error("Error fetching appointment data:", error)
      );
  };

  const fetchAppointmentsByDate = (date) => {
    setCurrentFilter("date");
    api
      .get(`/appointments/get-appointments-list/?date=${date}`)
      .then((response) => {
        setAppointments(response.data.data.appointments);
        setStats(response.data.data.stats);
        console.log(response.data.data);
      })
      .catch((error) => console.error("Error fetching by date:", error));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchAppointmentsByDate(date);
  };

  const handleSearch = (e) => setQuery(e.target.value);
  const handleFilterChange = (e) => setFilter(e.target.value);
  const handleTimeRangeChange = (e) => setTimeRange(e.target.value);

  const filteredAppointments = appointments.filter((item) => {
    const lowerQuery = query.toLowerCase();
    const matchesType =
      filter === "all" ||
      item.appointment_type?.toLowerCase() === filter.toLowerCase();
    const matchesQuery =
      item.patient_name?.toLowerCase().includes(lowerQuery) ||
      item.appointment_id?.toString().toLowerCase().includes(lowerQuery) ||
      item.phno?.toString().includes(lowerQuery) ||
      item.doctor_name?.toLowerCase().includes(lowerQuery) ||
      item.appointment_type?.toLowerCase().includes(lowerQuery);

    const appointmentDate = new Date(item.date);
    const today = new Date();
    const matchesTimeRange =
      timeRange === "all" ||
      (timeRange === "week" &&
        appointmentDate >= today &&
        appointmentDate <= new Date(today.setDate(today.getDate() + 7))) ||
      (timeRange === "month" &&
        appointmentDate.getMonth() === new Date().getMonth() &&
        appointmentDate.getFullYear() === new Date().getFullYear());

    return matchesType && matchesQuery && matchesTimeRange;
  });
  const handleAppointmentClick = async (item) => {
    console.log("appointment clicked:", item);

    if (!item.appointment_id) {
      console.error("Error: Doctor ID is undefined or null");
      return;
    }
    setSelectedAppointment(item.appointment_id);
    setShowModal1(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.sectionTitle}>Appointments</h1>
          <p className={styles.para}>
            Manage and schedule patient appointments
          </p>
        </div>
        <Button
          className={styles.buttonclick}
          onClick={() => setShowUserModal(true)}
          style={{ padding: "10px" }}
        >
          <CiCalendar className="mb-1 me-2" size={15} /> Schedule Appointments
        </Button>
      </div>

      <ScheduleAppointments
        show={showUserModal}
        handleClose={() => setShowUserModal(false)}
      />

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="shadow-lg">
            <Card.Body>
              <CiCalendar className={`p-1 ${styles.icon}`} size={30} />
              <p className={styles.statsCardText}>Today's Total Patients</p>
              <h2 className={styles.statsNumber}>
                {stats.total_patients_today}
              </h2>
              <p className={styles.statsFooter}>
                +{stats.increased_patients}% this month
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-lg">
            <Card.Body>
              <GoClock className={`p-1 ${styles.icon1}`} size={30} />
              <p className={styles.statsCardText}>Doctors</p>
              <h2 className={styles.statsNumber}>{stats.doctors_available}</h2>
              <p className={`${styles.statsFooter} text-secondary`}>
                Total Appointments
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-lg">
            <Card.Body>
              <IoIosCheckmarkCircleOutline
                className={`p-1 ${styles.icon2}`}
                size={30}
              />
              <p className={styles.statsCardText}>Today's Appointments</p>
              <h2 className={styles.statsNumber}>
                {stats.todays_appointments}
              </h2>
              <p className={styles.statsFooter}>{stats.urgent} Urgent</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-lg">
            <Card.Body>
              <IoIosCloseCircleOutline
                className={`p-1 ${styles.icon3}`}
                size={30}
              />
              <p className={styles.statsCardText}>Active Cases</p>
              <h2 className={styles.statsNumber}>
                {stats.active_cases?.total}
              </h2>
              <p className={styles.statsFooter}>
                {stats.critical_cases} Critical
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={5}>
          <Card className="shadow-lg">
            <Card.Body>
              <div className="text-center text-muted">
                <CalendarComponent
                  onDateSelect={handleDateSelect}
                  className={`w-75`}
                />
              </div>
              <div className="mt-3 text-secondary">
                {["all", "upcoming_week", "this_month"].map((type) => (
                  <button
                    key={type}
                    className={`btn ${styles.btn} ${
                      currentFilter === type ? styles.activeButton : ""
                    } mb-2`}
                    onClick={() => fetchAppointments(type)}
                  >
                    {type === "all"
                      ? "Total Appointments"
                      : type === "upcoming_week"
                      ? "Upcoming Week"
                      : "This Month"}
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={7}>
          <Card className="shadow-md p-3">
            <div className="d-flex flex-row mb-3">
              <div className={`${styles.search} p-2 d-flex`}>
                <IoSearchOutline className="mt-2" />
                <input
                  className={`${styles.searchbar} ps-1 w-75`}
                  type="search"
                  value={query}
                  onChange={handleSearch}
                  placeholder="  Search appointments...."
                />
              </div>
              <CiFilter
                className="ms-1 mt-2"
                size={40}
                style={{ color: "#979797" }}
              />
            </div>
            <div className={styles.scrollContainer}>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((item) => (
                  <Card
                    key={item.appointment_id || `appt-${item.patient_name}-${item.date}`}
                    className={styles.appointmentCard + " shadow-lg"}
                    onClick={() => handleAppointmentClick(item)}
                  >
                    <Card.Body className={styles.appointmentDetails}>
                      <div>
                        <h5 className={styles.patientName}>
                          {item.patient_name}
                        </h5>
                        <p className={styles.patientMeta}>
                          Dr.{item.doctor_name}
                        </p>
                        <p className={styles.patientDate}>
                          <CiCalendar className={`mb-1 ${styles.calendar}`} />{" "}
                          {item.date}
                        </p>
                        <p className={styles.patientNote}>{item.notes}</p>
                      </div>
                      <div>
                        <span className={styles.timeText}>
                          <GoClock className="mb-1" size={20} /> {item.time}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p className="text-center mt-3">No appointments found.</p>
              )}
            </div>

            {/* <AppointmentDetailsModal show={showModal1} handleClose={() => setShowModal1(false)} appointmentId={'12345'} /> */}
            {showModal1 && selectedAppointment && (
              <AppointmentDetailsModal
                show={showModal1}
                handleClose={() => setShowModal1(false)}
                appointmentId={selectedAppointment}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Appointments;
