import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Card,Spinner } from "react-bootstrap";
import PatientStyles from "../css/PatientManagemnt.module.css";
import { CiSearch } from "react-icons/ci";
import Inpatient from "./Inpatient";
import { Icon } from "@iconify/react";
import Vector from "../../assets/images/Vector.svg";
import AddPatient from "../../assets/images/Vectors2.svg";
import PatientRegistration from "./PatientRegistratiob";
import Addnotes from "./Addnotes";
import Outpatient from "./Outpatient";
import api from "../../utils/axiosInstance";
import { Button, Result } from 'antd';

function PatientManagement() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
 

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        "/patients/patients/"
      );
      if (data.success) {
        setPatients(data.data.patients || []);
        setCounts(data.data.total_counts || {});
      }
    } catch (error) {
      console.error("Error fetching patients", error);
      setError("Failed to fetch patient data");
    }
    setLoading(false);
  };
  fetchPatients();
}, []);


  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  // const filteredPatients = patients.filter(
  //   (patient) =>
  //     (filter === "all" || patient.appointment_type === filter) &&
  //     patient.patient_name.toLowerCase().includes(query.toLowerCase())
  // );

  const filteredPatients = patients.filter(
    (patient) =>
      (filter === "all" || patient.appointment_type === filter) &&
      (patient.patient_name.toLowerCase().includes(query.toLowerCase()) ||
        patient.patient_id.toString().includes(query) ||
        (patient.phone_number &&
          patient.phone_number.toString().includes(query)))
  );

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };
  const handleClose = () => setShowModal(false); 
  return (
    <Container className={PatientStyles.mainContainer}>
      <Row
        className={` d-flex justify-content-between  px-3 px-md-5${PatientStyles.patadd}`}
      >
        <Col lg={4}>
          <h4 className={`fs-3 mt-5 ${PatientStyles.heading}`} >
            Patient Management
          </h4>
        </Col>
        <Col lg={8} className="d-flex">
          <button
            className={PatientStyles.addbutton}
            onClick={() => setShowModal(true)}
          >
            {" "}
            + Add Patient
          </button>
          <PatientRegistration
            show={showModal}
            handleClose={handleClose}/>
          {/* <Icon
            icon="fluent-mdl2:time-entry"
            width={24}
            height={24}
            className={PatientStyles.addimage}
            onClick={() => setShow(true)}
          /> */}
          
          {/* <Addnotes show={show} handleClose={() => setShow(false)} /> */}
        </Col>
      </Row>
      <Row className="mt-4 g-4 px-3" xs={1} sm={2} md={2} lg={4} xl={4}>
        {[
          {
            icon: <Icon icon="pepicons-pencil:persons" width={24} height={24} className={PatientStyles.iconcolor}/>,
            title: "Total",
            text: "Total patients",
            color: "text-primary",
            count: counts.total_patients || 0,
            backgroundColor: "#DFEDFF",
          },
          {
            icon: <Image src={Vector} alt="Vector" className={PatientStyles.iconcolor1} />,
            title: "In-Patient",
            text: "Total patients",
            color: "text-success",
            count: counts.inpatients || 0,
            backgroundColor: "#DDFFE8",
          },
          {
            icon: <Icon icon="hugeicons:patient" width={24} height={24} className={PatientStyles.iconcolor2} />,
            title: "Out-Patient",
            text: "Total patients",
            color: PatientStyles.textpurple,
            count: counts.outpatients || 0,
            backgroundColor: "#F0E0FF",
          },
          {
            icon: <Icon icon="fluent:pulse-20-regular" width={24} height={24} className={PatientStyles.iconcolor3}/>,
            title: "Critical",
            count: 0,
            text: "Total patients",
            color: "text-danger",
            count: counts.critical_cases || 0,
            backgroundColor: "#FFDEDE",
          },
        ].map((card, index) => (
          <Col key={index} className="d-flex justify-content-center">
            <Card className={`${PatientStyles.patientCard} w-100`}>
              <Card.Body>
                <div className={PatientStyles.firstrow}>
                  <span
                    className={PatientStyles.image1}
                    style={{ backgroundColor: card.backgroundColor }}
                  >
                    {card.icon}
                  </span>
                  <h5 className={card.color}>{card.title}</h5> 

                </div>
                <h6 className="card-subtitle mb-2 text-body-secondary fs-4 mt-4">
                  {card.count}
                </h6>
                <p
                  className="card-text text-secondary "
                  style={{ fontSize: "16px", fontWeight: "400" }}
                >
                  {card.text}
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className={`mt-5 ${PatientStyles.Secondcomponent}`}>
        <Col xs={12} sm={12} md={6} lg={4}>
          <Card className={PatientStyles.card1}>
          {error && <p className="text-center text-danger">{error}</p>}
            <div className={PatientStyles.searchpatient}>
              {/* search Bar */}
              <div className={PatientStyles.searchbar}>
                <label style={{ position: "relative" }}>
                  <CiSearch className={PatientStyles.searchicon} />
                  <input
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search Patients...."
                    className={PatientStyles.searchInput}
                  />
                </label>
              </div>
              
              {loading && 
              <p className="text-center d-flex flex-column text-primary mt-5 mb-5">
              <Spinner animation="border" variant="primary" className="mx-auto" />

                Loading patients...
                
                </p>
           
              }

              <div className={PatientStyles.inoutpatient}>
                <button
                  className={PatientStyles.inpatients}
                  onClick={() => setFilter("inpatient")}
                >
                  In-Patient
                </button>
                <button
                  className={PatientStyles.outpatients}
                  onClick={() => setFilter("outpatient")}
                >
                  Out-Patient
                </button>
                <button
                  className={PatientStyles.Casuality}
                  onClick={() => setFilter("casuality")}
                >
                  Casuality
                </button>
              </div>

              <div className={PatientStyles.scrollableList}>
                {filteredPatients.length > 0
                  ? filteredPatients.map((patient, index) => (
                      <Card
                        key={index}
                        className={PatientStyles.patientCard}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <Card.Body>
                          <div className={PatientStyles.cardHeader}>
                            <Card.Title>{patient.patient_name}</Card.Title>
                            <Card.Link
                              href="#"
                              className={
                                patient.appointment_type === "inpatient"
                                  ? PatientStyles.inpatientLink
                                  : patient.appointment_type === "outpatient"
                                  ? PatientStyles.outpatientLink
                                  : PatientStyles.casualityLink
                              }
                            >
                              {patient.appointment_type}
                            </Card.Link>
                          </div>
                          <text className={PatientStyles.Subtitle}>
                            ID: {patient.patient_id}
                          </text>
                          <div className={PatientStyles.cardDetails}>
                            <Card.Text>{patient.age}</Card.Text>
                            <Card.Text>{patient.gender}</Card.Text>
                          </div>
                        </Card.Body>
                      </Card>
                    ))
                  : !loading &&   <Result
                  status="404"
                  title="404"
                  subTitle="No Patients Found"
                  // extra={<Button type="primary">Back Home</Button>}
                />}
              </div>
            </div>
          </Card>
        </Col>

        {/* If a patient is selected, show Inpatient component; otherwise, show "Select a Patient" card */}
        <Col xs={12} sm={12} md={8} className={PatientStyles.maincard}>
          {selectedPatient ? (
            // selectedPatient.appointment_type === "inpatient" ? (
            //   <Inpatient patient={selectedPatient} />
            // ) : (
            //   <Outpatient patient={selectedPatient} />
            // )
            <Inpatient
              show={showModal}
              handleClose={() => setShowModal(false)}
              patient={selectedPatient}
            />
          ) : (
            <Card className={`${PatientStyles.selectPatientCard} text-center`}>
              <Card.Body>
                <Image src={AddPatient} width={50} height={50} />
                <h5>Select a Patient</h5>
                <p>Choose a patient from the list to view their details</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default PatientManagement;
