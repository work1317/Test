import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import { Spinner, Modal, Button, Dropdown } from "react-bootstrap";
import styles from "../css/MainDashboard.module.css";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthProvider";

const MainDashBoard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appShow, setAppShow] = useState(false);
  const [deptShow, setDeptShow] = useState(false);
  const { user } = useAuth();

  const applyFilter = (type) => {
    setLoading(true);
    const filterMap = {
      today: "today",
      week: "past_week",
      month: "past_month",
      quarter: "past_quarter",
      year: "past_year",
    };
    const filterParam = filterMap[type] || "";

    api
      .get(`/dashboard/dashboard/`, {
        params: filterParam ? { filter: filterParam } : {},
      })
      .then((response) => {
        if (response.data.success === 1) {
          setData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api
      .get("/dashboard/dashboard/")
      .then((response) => {
        if (response.data.success === 1) {
          setData(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching dashboard data:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.MainContainer}>
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className={styles.MainContainer}>No data available.</div>;
  }

  const {
    patients,
    patients_filtered,
    increased_patients,
    doctors,
    doctors_filtered,
    increased_doctors,
    todays_appointments,
    critical_cases,
    urgent_appointments,
    cardiology,
    ent,
    dermatology,
    neurology,
    dentistry,
    ophthalmology,
  } = data.stats;

  const statistics = [
    {
      title: "Total Patients",
      value: patients_filtered,
      icon: "mingcute:group-line",
      color: styles.carblue,
      values: "+" + increased_patients + "% this month",
    },
    {
      title: "Doctors",
      value: doctors_filtered,
      icon: "fluent-mdl2:group",
      color: styles.cargreen,
      values: "+" + increased_doctors + " this week",
    },
    {
      title: "Today's Appointment",
      value: todays_appointments,
      icon: "uit:calender",
      color: styles.carpurple,
      values: urgent_appointments + " urgent",
    },
    {
      title: "Critical Cases",
      value: critical_cases,
      icon: "cuida:heart-rate-outline",
      color: styles.carred,
      values: critical_cases + " Critical Cases",
    },
  ];

  const departments = [
    { id: 1, name: "Cardiologists", value: cardiology },
    { id: 2, name: "ENT", value: ent },
    { id: 3, name: "Dermatologists", value: dermatology },
    { id: 4, name: "Neurologists", value: neurology },
    { id: 5, name: "Dentists", value: dentistry },
    { id: 6, name: "Opticians", value: ophthalmology },
  ];

  // Filter and sort departments
  const sortedDepartments = departments
    .filter((dept) => dept.value > 0)
    .sort((a, b) => b.value - a.value);

  // const topThreeDept = sortedDepartments.slice(0, 3);
  const topThreeDept = departments
      .filter((dept) => dept.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

  // All departments sorted (include value = 0) for modal
  const allDeptSorted = [...departments].sort((a, b) => b.value - a.value);
  // const remainingThreeDept = sortedDepartments.slice(0,);

  const appointments = data.appointments || [];
  const topThreeAppointments = [...appointments].reverse().slice(0, 3);
  const remainingAppointments = [...appointments].reverse();

  function AppointmentsModal(props) {
    return (
      <Modal {...props} size="lg" className={styles.appointmentMODAL} centered>
        <Modal.Header closeButton>
          <Modal.Title>All Appointments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {remainingAppointments.map((appt, index) => (
            <div key={index} className={styles.beappointment}>
              <div>
                <p className={styles.berole}>{appt.doctor_name}</p>
                <p className={styles.bename}>{appt.department}</p>
              </div>
              <div className={styles.betimeStatus}>
                {new Date(`1970-01-01T${appt.time}`).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
                <div className={styles.beconfirmed}>Confirmed</div>
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function DepartmentModal(props) {
    return (
      <Modal {...props} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Department Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {allDeptSorted.map((dept, index) => (
            <div key={index} className={styles.bedepartment}>
              <div className={styles.bewholeleft}>
                <p className={styles.bename}>{dept.name}</p>
                <p className={styles.berole}>{dept.value}</p>
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <div className={styles.MainContainer}>
      <div className={styles.carcontainer}>
        <div className={styles.carheader}>
          <div>
            <h1 className={styles.cartitle}>Dashboard</h1>
            <p className={`ps-2 ${styles.carsubtitle}`}>Welcome back, {user?.username}</p>
          </div>
          <div>
            <p className={styles.carupdated}>Last updated: Just now</p>
            <Dropdown>
              <Dropdown.Toggle
                style={{ background: "transparent", border: "none" }}
                className={styles.customToggle}
              >
                <Icon icon="iconoir:filter" width="24" height="24" style={{ color: "#BEBEBE" }} />
              </Dropdown.Toggle>
              <Dropdown.Menu className={styles.RDropdown}>
                <Dropdown.Item onClick={() => applyFilter("today")}>Today</Dropdown.Item>
                <Dropdown.Item onClick={() => applyFilter("week")}>Past Week</Dropdown.Item>
                <Dropdown.Item onClick={() => applyFilter("month")}>Past Month</Dropdown.Item>
                <Dropdown.Item onClick={() => applyFilter("quarter")}>Past Quarter</Dropdown.Item>
                <Dropdown.Item onClick={() => applyFilter("year")}>Past Year</Dropdown.Item>
                <Dropdown.Item onClick={() => applyFilter("")}>All</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className={styles.cargrid}>
          {statistics.map((stat, index) => (
            <div key={index} className={styles.gridcard}>
              <div className={`${styles.caricon} ${stat.color}`}>
                <Icon icon={stat.icon} width="24" height="24" className="mt-4 ms-3" />
              </div>
              <div className={styles.cartextContainer}>
                <p className={styles.carTitle}>{stat.title}</p>
                <h2 className={styles.carValue}>{stat.value}</h2>
                <p className={styles.carValues}>{stat.values}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bedashboard}>
        <div className={styles.becard}>
          <div className={styles.beheader}>
            <p className={styles.beheading}>Recent Appointments</p>
            <a onClick={() => setAppShow(true)} className={styles.modalCon}>View All</a>
            <AppointmentsModal show={appShow} onHide={() => setAppShow(false)} />
          </div>
          {topThreeAppointments.length > 0 ? (
            topThreeAppointments.map((appt, index) => (
              <div key={index} className={styles.appointmentCard}>
                <div className={`d-flex justify-content-between ${styles.appointmentDetails}`}>
                  <div>
                    <h5 className={styles.patientName}>{appt.doctor_name}</h5>
                    <p className={styles.patientMeta}>{appt.department}</p>
                  </div>
                  <div>
                    <span className={`ms-auto ${styles.timeText}`}>
                      {new Date(`1970-01-01T${appt.time}`).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                    <div className={styles.beconfirmed}>Confirmed</div>
                  </div>
                </div>
              </div>
            ))  
          ) : (
            <p className="text-center mt-3">No appointments found.</p>
          )}
        </div>

        <div className={styles.becard}>
          <div className={styles.beheader}>
            <p className={styles.beheading}>Department Status</p>
            <a onClick={() => setDeptShow(true)} className={styles.modalCon}>View Details</a>
            <DepartmentModal show={deptShow} onHide={() => setDeptShow(false)} />
          </div>
          {topThreeDept.map((dept, index) => (
            <div key={index} className={styles.bedepartment}>
              <div className={styles.bewholeleft}>
                <p className={styles.bename}>{dept.name}</p>
                <p className={styles.berole}>{dept.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainDashBoard;
