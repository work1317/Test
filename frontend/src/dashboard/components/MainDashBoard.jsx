import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import { Spinner,Modal,Button,Card } from "react-bootstrap";
import styles from "../css/MainDashboard.module.css"; // Replace with your CSS module path
import { Icon } from "@iconify/react";
import "react-datepicker/dist/react-datepicker.css";
import { Dropdown } from "react-bootstrap";
import { parse } from "date-fns";
import {
  CiCalendar, CiFilter
} from "react-icons/ci";
import {
  GoClock
} from "react-icons/go";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfQuarter,
  endOfQuarter,
} from "date-fns";
 
const MainDashBoard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [alerts, setAlerts] = useState({});
  const [deptShow, setDeptShow] = useState(false);
 
  const [appShow, setAppShow] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [suggs, setSuggs] = useState([]);
  const [doctorName, setDoctorName] = useState("Dr.Anderson");
  const [doctoremail, setDoctorEmail] = useState("@domain.in");
  const [patients1, setPatients] = useState([]);
  const [doctors1, setDoctors] = useState([]);
  const [appoints, setAppoints] = useState([]);
  const [hasNotification, setHasNotification] = useState(true);  
 
  const handleAlert = (deptName) => {
        setAlerts((prev) => ({ ...prev, [deptName]: !prev[deptName] }));
      };
 
      const applyFilter = (type) => {
        setLoading(true);
        const filterMap = {
          today: "today",
          week: "past_week",
          month: "past_month",
          quarter: "past_quarter",
          year: "past_year",
        };
     
        const filterParam = filterMap[type] || ""; // fallback to all
     
        api
          .get(`/dashboard/dashboard/`, {
            params: filterParam ? { filter: filterParam } : {},
          })
          .then((response) => {
            if (response.data.success === 1) {
              setData(response.data.data);
            } else {
              console.warn("Dashboard API returned success != 1");
            }
          })
          .catch((error) => {
            console.error("Error fetching dashboard data:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      };
     
 
    const parseCustomDate = (dateStr) => {
      if (!dateStr) return null;
      return parse(dateStr, "MM-dd-yyyy", new Date());
    };
 
  useEffect(() => {
    const fecthingData = async() => {
    api.get("/dashboard/dashboard/")
      .then((response) => {
        if (response.data.success === 1) {
          setData(response.data.data);
          setAppoints(response.data.data)
        } else {
          console.warn("Dashboard API returned success != 1");
        }
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
    }
    fecthingData()
    const interval  =  setTimeout(fecthingData, 1000);

    return () =>  clearTimeout(interval)
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
 
  const { patients,increased_patients, doctors,increased_doctors, todays_appointments, critical_cases,urgent_appointments,cardiology,ent,dermatology,neurology,dentistry,ophthalmology} = data.stats;

 
  const statistics = [
    {
      title: "Total Patients",
      value: patients,
      icon: "mingcute:group-line",
      color: styles.carblue,
      values:"+"+increased_patients+"% this month",
    },
    {
      title: "Doctors",
      value: doctors,
      icon: "fluent-mdl2:group",
      color: styles.cargreen,
      values:"+"+increased_doctors+" this week",
    },
    {
      title: "Today's Appointment",
      value: todays_appointments,
      icon: "uit:calender",
      color: styles.carpurple,
      values:urgent_appointments + " urgent",
    },
    {
      title: "Critical Cases",
      value: critical_cases,
      icon: "cuida:heart-rate-outline",
      color: styles.carred,
      values:critical_cases + " Critical Cases",
    },
  ];
  //below cards
 
  const departments = [
    {
      id: 1,
      name: "Cardiologists",
      color: "#ED4545",
      textcolor: "#ED4545",
      value: cardiology
    },
    {
      id: 2,
      name: "ENT",
      color: "#23C55E",
      textcolor: "#23C55E",
      value: ent
    },
    {
      id: 3,
      name: "Dermatologists",
      color: "#E9B308",
      textcolor: "#AD8814",
      value : dermatology
    },
    {
      id: 4,
      name: "Neurologists",
      color: "#ED4545",
      textcolor: "#ED4545",
      value : neurology
    },
    {
      id: 5,
      name: "Dentists",
      color: "#23C55E",
      textcolor: "#23C55E",
      value : dentistry 
    },
    {
      id: 6,
      name: "Opticians",
      color: "#23C55E",
      textcolor: "#23C55E",
      value : ophthalmology
    },
  ];
 

const { stats, appointments } = data || {};
 
const topThreeAppointments = [...appointments].reverse().slice(0, 3);
const remainingAppointments = [...appointments].reverse().slice(0,);
  const topThreeDept = [...departments].slice(0, 3);
  const remainingThreeDept = [...departments].slice(3,);
 
  function AppointmentsModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        className={styles.appointmentMODAL}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            All Appointments
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {remainingAppointments.map((appt) => (
            <div key={appt.id} className={styles.beappointment}>
              <div>
                <p className={styles.berole}>{appt.doctor_name}</p>
                   <p className={styles.bename}>{appt.department}</p>
              </div>
              <div className={styles.betimeStatus}>
                   {/* <GoClock className="mb-1" size={20} />  */}
                   {new Date(`1970-01-01T${appt.time}`).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
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
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Department Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {remainingThreeDept.map((dept) => (
            <div key={dept.id} className={styles.bedepartment}>
              <div className={styles.bewholeleft}>
                <p
                  className={styles.bename}
                  onClick={() => handleAlert(dept.name)}
                >
                  {dept.name}
                </p>
                <p className={styles.berole}>{dept.value} </p>
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
            <p className={styles.carsubtitle}>Welcome back, {doctorName}</p>
          </div>
          <div>
            <p className={styles.carupdated}>Last updated: Just now</p>
            <Dropdown>
              <Dropdown.Toggle
                style={{
                  backgroundColor: "#f3f4f6",
                  borderColor: "#f3f4f6",
                  background: "transparent",
                }}
                className={styles.customToggle}
              >
                <Icon
                  icon="iconoir:filter"
                  width="24"
                  height="24"
                  style={{ color: "#BEBEBE" }}
                />
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
                <Icon icon={stat.icon} width="28" height="28" className={styles.cariconSize} />
              </div>
              <div className={styles.cartextContainer}>
                <p className={styles.carTitle}>{stat?.title}</p>
                <h2 className={styles.carValue}>{stat?.value}</h2>
                <p className={styles.carValues}>{stat?.values}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.bedashboard}>
        <div className={styles.becard}>
         <div className={styles.beheader}>
            <p className={styles.beheading}>Recent Appointments</p>
           <a onClick={() => setAppShow(true)} className={styles.modalCon}>
              View All
           </a>
           <AppointmentsModal
              show={appShow}
              onHide={() => setAppShow(false)}
            />
          </div>
           {topThreeAppointments.length > 0 ? (
           topThreeAppointments.map((appt) => (
                          <div
                            key={appt.id}
                            className={styles.appointmentCard}
                          >
                            <div className={`d-flex justify-content-between  ${styles.appointmentDetails}`}>
                              <div>
                                <h5 className={styles.patientName}>{appt.doctor_name}</h5>  
                                <p className={styles.patientMeta}>{appt.department}</p>
                              </div>
                              <div>
                                <span className={`ms-auto ${styles.timeText}`}>
                                  {/* <GoClock className="mb-1" size={20} /> */}
                                  {new Date(`1970-01-01T${appt.time}`).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
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
            <a onClick={() => setDeptShow(true)} className={styles.modalCon}>
              View Details
            </a>
            <DepartmentModal
              show={deptShow}
              onHide={() => setDeptShow(false)}
            />
          </div>
 
          {topThreeDept.map((dept) => (
            <div key={dept.id} className={styles.bedepartment}>
              <div className={styles.bewholeleft}>
                <p
                  className={styles.bename}
                >
                  {dept.name}
                </p>
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
 
 