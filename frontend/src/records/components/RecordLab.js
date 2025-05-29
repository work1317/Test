import React, { useState, useEffect, createContext } from "react";
import Recordstyle from "../css/RecordLab.module.css";
import {
  CirclePlus,
  UserRound,
  FileText,
  Microscope,
  Heart,
  Stethoscope,
} from "lucide-react";
import { IoSearchOutline } from "react-icons/io5";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Tabs } from "antd";
import api from "../../utils/axiosInstance";
import { Icon } from "@iconify/react";
import GNursingNotes from "./GNursingNotes";
import GProgressNotes from "./GProgressNotes";
import GInitialAssesment from "./GInitialAssesment";
import GTreatmentChat from "./GTreatmentChat";
import GCarePlan from "./GCarePlan";
import GPainAssesment from "./GPainAssesment";
import AddNote from "./AddNote";
import GRiskAssesment from "./GRiskAssesment";
//import AddRecord from './addRecord';
import AddRecordModal from "./addRecord";
import DailyVital from "./DailyVital";
import RecordPrescription from './RecordPrescription'
import Service from './Service'
import AllRecord from "./AllRecord";
import LabResult from './LabResult'
import RecordImaging from "./RecordImaging";

const tabData = [
  { name: "All Records", icon: FileText, tab: "Records" },
  { name: "Lab Results", icon: Microscope, tab: "lab" },
  { name: "Prescription", icon: FileText, tab: "prescription" },
  { name: "Imaging", icon: FileText, tab: "Imaging" },
  { name: "Vital", icon: Heart, tab: "vitals" },
  { name: "Services & Procedures", icon: Stethoscope, tab: "services" },
];
 
const notesData = [
  { name: "Nursing Notes", tab: "nursing Note" },
  { name: "Progress Notes", tab: "progress Note" },
  { name: "TreatmentChart", tab: "treatmentchart" },
  { name: "PainAssesment", tab: "painassesment" },
  { name: "IntitialAssesment", tab: "initialassesment" },
  { name: "Careplan", tab: "careplan" },
  { name: "RiskAssesment", tab:"riskassesment"}
]
 
export const doctors  = createContext()
const RecordLab = () => {
  const [activeTab, setActiveTab] = useState("Records");
  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [showUser, setShowUser]  =  useState(false)
  const [showModalRecord, setShowModalRecord] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [transformData, setTransFormData] = useState([]);
 
  const recordTypeMap = {
    Records: "all",
    lab: "lab_results",
    prescription: "prescription",
    Imaging: "imaging",
    vitals: "vitals",
    services: "services_procedures",
  };


  useEffect(() => {
  const fectingData = async () => {
    try {
      const response = await api.get(
        "labs/lab_tests/"
      );
      if (response.data.success) {
        console.log(response.data.data);
        setTransFormData(response.data.data);
      }
    } catch (error) {
      console.log("error");
    }
  };
  fectingData();
 
}, []);
 
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/patients/patients/");
        console.log(data.data)
        if (data.success) {
          setPatients(data.data.patients || []);
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

  // const latestVisit = records.length
  // ? new Date(Math.max(...records.map(r => new Date(r.created_at)))).toLocaleDateString()
  // : "No records";

  // const latestRecord = [...records].sort((a, b) => new Date(b.last_updated_at) - new Date(a.last_updated_at))[0];

  const getLastVisitDate = (records) => {
    if (!records || records.length === 0) return null;
  
    const latest = records.reduce((latestSoFar, current) => {
      return new Date(current.last_updated_at) > new Date(latestSoFar.last_updated_at)
        ? current
        : latestSoFar;
    });
  
    return new Date(latest.last_updated_at);
  };

  const lastVisitDate = getLastVisitDate(records);
  
 
  // const filteredPatients = patients.filter(
  //   (patient) =>
  //     (filter === "all" || patient.appointment_type === filter) &&
  //     (patient.patient_name.toLowerCase().includes(query.toLowerCase()) ||
  //       patient.patient_id.toString().includes(query) ||
  //       (patient.phno &&
  //         patient.phno.toString().includes(query)))
  // );
 
 const lowerQuery = query.toLowerCase();
 
  const filteredPatients = patients.filter(
    (patient) =>
      (filter === "all" || patient.appointment_type === filter) &&
      (
        patient.patient_name?.toLowerCase().includes(lowerQuery) ||
        patient.patient_id?.toString().toLowerCase().includes(lowerQuery) ||
        patient.phone_number?.toString().toLowerCase().includes(lowerQuery)
      )
  );

  useEffect(() => {
    if (selectedPatient && activeTab && recordTypeMap[activeTab]) {
      fetchRecords();
    }
  }, [selectedPatient, activeTab]);
 
  const fetchRecords = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const response = await api.get("/records/records/", {
        params: {
          patient_id: selectedPatient.patient_id,
          record_type: activeTab === "Records" ? null : recordTypeMap[activeTab],
        },
      });
 
 
      if (response.data.success) {
        setRecords(response.data.data);
      } else {
        setRecords([]);
      }
    } catch (error) {
              alert("add not found")
    }
    setLoading(false);
  };
 
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
     // Only default the main tab, not notes
  };
 
  return (
    <Container className="mb-5" style={{ backgroundColor: "#F9FAFC" }}>
      <Row className="mt-5 ms-2 d-flex justify-content-between">
        <Col md={8}>
          <h1 className="fw-bolder">Electronic Medical Records</h1>
          <p className={Recordstyle.text}>Comprehensive patient health records</p>
        </Col>
        <Col md={2} className="mt-3">
          <Button
            className={Recordstyle.buttonContent}
            onClick={() => {
              if (!selectedPatient) {
                alert("Please select a patient first to add a note.");
              } else {
                setShowModal(true);
              }
            }}  
            disabled={!selectedPatient}
          >
            <CirclePlus className="me-2" /> Add Note
          </Button>
        </Col>
        <AddNote show={showModal} handleClose={() => setShowModal(false)} patientId={selectedPatient ? selectedPatient.patient_id : null} />
      </Row>
 
      <Row className="mt-3 ms-2">
        <Col xs={12} md={6}>
          <div className={`${Recordstyle.search} mt-2 p-2 d-flex`}>
            <IoSearchOutline className="mt-1 ms-4" />
            <input
              className={`${Recordstyle.searchbar} ps-4 w-75`}
              type="search"
              value={query}
              onChange={handleSearch}
              placeholder="Search patients..."
            />
          </div>
          {filteredPatients.length > 0 && (
            <div className={`mt-2 ${Recordstyle.scrollContainer}`}>
            {filteredPatients.slice(0, 3).map((patient, index) => (
                <Row className="d-flex justify-content-around" key={index} onClick={() => handlePatientSelect(patient)}>
                  <Col xs={6} md={4} className="d-flex">
                    <div className="d-flex mt-2 align-items-center">
                      <UserRound className={`m-3 ${Recordstyle.iconCss} p-1`} size={30} style={{ color: "#262872" }} />
                      <div>
                        <span className={Recordstyle.text}>{patient.patient_name}</span>
                        <br />
                        <span className={`${Recordstyle.textId} fw-bold`}>ID: {patient.patient_id}</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={4} md={4}>
                    <div className="d-flex mt-3 ps-4 flex-column">
                      <span className={`${Recordstyle.text}`}>Age</span>
                      <span className={`${Recordstyle.textId} fw-bold`}>{patient.age}</span>
                    </div>
                  </Col>
                  <Col xs={4} md={4}>
                    <div className="mt-3 d-flex flex-column">
                      <span className={`${Recordstyle.text}`}>Blood Type</span>
                      <span className={`${Recordstyle.textId} fw-bold`}>{patient.blood_group}</span>
                    </div>
                  </Col>
                </Row>
              ))}
            </div>
            )}

        </Col>
      </Row>
 
      {selectedPatient ? (
        <>
          <Row className="m-3 mt-4 d-flex flex-row">
            <Col xs={12} md={6} className="d-flex align-items-center flex-row justify-content-between">
              <div className="d-flex flex-row">
                <UserRound className={`p-2 ${Recordstyle.iconCss1}`} size={30} style={{ color: "#262872" }} />
                <h6 className={`${Recordstyle.textdata} ms-4`}>{selectedPatient.patient_name}</h6>
              </div>
            </Col>
            <Col xs={12} md={6} className="d-flex align-items-center flex-row justify-content-end">
              <Button style={{ backgroundColor: "#002072" }} size="sm"
               className={Recordstyle.buttonContent}
               onClick={() => {
                if (!selectedPatient) {
                  alert("Please select a patient first to add a note.");
                  } else {
                  setShowModal1(true);
                }
              }}
              disabled={!selectedPatient}>
                <CirclePlus size={15} /> Add Record
              </Button>
            </Col>
          </Row>
          <AddRecordModal show={showModal1} handleClose={() => setShowModal1(false)} patientId={selectedPatient ? selectedPatient.patient_id : null} />
          <Row className="text-center p-3 rounded">
            <Col xs={6} md={3}>
              <small className="text-muted fw-bold">{selectedPatient.age} years, {selectedPatient.gender}</small>
            </Col>
            <Col xs={6} md={3}>
              <small className="text-muted fw-bold"><Icon icon="mdi:phone-classic" width="20" height="20" /> : {selectedPatient.phno}</small>
            </Col>
            <Col xs={6} md={3}>
              <small className="text-muted fw-bold"><Icon icon="typcn:mail" width="24" height="24" /> : {selectedPatient.email}</small>
            </Col>
            <Col xs={6} md={3}>
              {/* <small className="text-muted fw-bold">Last Visit: {latestRecord}</small> */}

              {/* <small className="text-muted fw-bold">
                Last Visit: {records.length > 0 ? new Date(records[0].last_updated_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) : 'N/A'}
              </small> */}

              {/* const lastVisitDate = getLastVisitDate(records); */}
              <small className="text-muted fw-bold">
                Last Visit: {lastVisitDate ? lastVisitDate.toLocaleString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) : 'N/A'}
              </small>
            </Col>
          </Row>
 
          <Row className="text-center p-3 rounded">
            <Col xs={6} md={3} className="border-end">
              <small className="text-muted">Blood Group</small>
              <p className="fw-bold m-0">{selectedPatient.blood_group}</p>
            </Col>
            <Col xs={6} md={3} className="border-end">
              <small className="text-muted">Ward Number</small>
              <p className="fw-bold m-0">{selectedPatient.ward_no}</p>
            </Col>
            <Col xs={6} md={3} className="border-end mt-3 mt-md-0">
              <small className="text-muted">Admission Date</small>
              <p className="fw-bold m-0">{new Date(selectedPatient.created_at).toLocaleDateString('en-IN', {day: '2-digit',month: '2-digit',year: 'numeric',})}</p>
            </Col>
            <Col xs={6} md={3} className="mt-3 mt-md-0">
              <small className="text-muted">Diagnosis</small>
              <p className="fw-bold m-0 ">{selectedPatient.diagnosis}</p>
            </Col>
          </Row>
 
          <Tabs
            defaultActiveKey="Records"
            className={Recordstyle.customtabs}
            onChange={(key) => setActiveTab(key)}
            tabBarStyle={{ borderBottom: "1px solid #002072" }}
            items={tabData.map(({ name, icon: Icon, tab }) => ({
              label: (
                <button
                  className={`w-100 btn d-flex align-items-center gap-3 py-2 ${
                    activeTab === tab ? Recordstyle.anchor : Recordstyle.custombtn
                  }`}
                >
                  <Icon size={15} /> {name}
                </button>
              ),
              key: tab,
              children: (
                <Row className="mt-4 g-0">
                 
                  {activeTab === "vitals" &&
                  <doctors.Provider value={{ selectedPatient}}>
                    <DailyVital  />
                  </doctors.Provider> }
                  {activeTab === "lab" && <doctors.Provider value={{selectedPatient}}>
                  <LabResult transformData={transformData} />
                  </doctors.Provider>}
                  {activeTab === "prescription" &&
                  <doctors.Provider value={{ selectedPatient}}>
                    <RecordPrescription />
                  </doctors.Provider>}
                  {activeTab === "Imaging" &&
                  <doctors.Provider value={{selectedPatient}}>
                   <RecordImaging transformData={transformData} />
                   </doctors.Provider>}
                  {activeTab === "Records" &&
                    <doctors.Provider value={{selectedPatient}}>
                      <AllRecord activeTab={activeTab}  />
                    </doctors.Provider> }
                  {activeTab === "services" &&
                  <doctors.Provider value={{selectedPatient}}>
                    <Service />
                    </doctors.Provider>
                   }
                  </Row>
              ),
            }))}
          />
 
 
 <Tabs
  activeKey={notesData.some(note => note.tab === activeTab) ? activeTab : "nursing Note"}
  className={Recordstyle.customtabs1}
  onChange={(key) => setActiveTab(key)}
  tabBarStyle={{ borderBottom: "1px solid #002072" }}
  items={notesData.map(({ name, tab }) => ({
    label: (
      <button
        className={`${Recordstyle.tabButton} ${
          activeTab === tab ? Recordstyle.activeTab : Recordstyle.inactiveTab
        }`}
      >
        {name}
      </button>
    ),
    key: tab,
    children: (
      <Row className="mt-4 g-0">
        {tab === "nursing Note" && <GNursingNotes patient={selectedPatient} />}
        {tab === "progress Note" && <GProgressNotes patient={selectedPatient} />}
        {tab === "treatmentchart" && <GTreatmentChat patient={selectedPatient} />}
        {tab === "painassesment" && <GPainAssesment patient={selectedPatient} />}
        {tab === "careplan" && <GCarePlan patient={selectedPatient} />}
        {tab === "initialassesment" && <GInitialAssesment patient={selectedPatient} />}
        {tab === "riskassesment" && <GRiskAssesment patient={selectedPatient} />}
      </Row>
    ),
  }))}
/>
 
        </>
      ) : (
        <Card className="text-center">
          <Card.Body>
            <h5>Select a Patient</h5>
            <p>Choose a patient from the list to view their details</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};
 
export default RecordLab;
 
 
