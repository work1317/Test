import React from "react";
import Doctorstyle from "./css/Doctorspage.module.css";
import { GoPeople } from "react-icons/go";
import { IoSearchOutline } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import { CiStethoscope } from "react-icons/ci";
import { IoStarOutline } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import Doctorsmain from "./components/Doctorsmain";
import { useState, useEffect } from "react";
import Doctorsdetalis from "./components/Doctorsdetalis";
import { CirclePlus } from "lucide-react";
import AddDoctor from "./components/AddDoctor";
import { Container, Row, Col, Card, Image } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Vector from "../assets/images/Vector.svg";
import api from "../utils/axiosInstance";

const DoctorsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalExpertise, setTotalExpertise] = useState(0);
  useEffect(() => {
    const getDoctors = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          "/doctors/doctors/"
        );
        if (data.success) {
          setDoctors(data.data);
          setTotalDoctors(data.total_doctors);
          setTotalPatients(data.total_patients);
          setTotalExpertise(data.expertise);
          console.log("data :", data);
        }
      } catch (error) {
        console.error("Error fetching doctors", error);
        setError("Failed to fetch doctor data");
      }
      setLoading(false);
    };
    getDoctors();
  }, []);

  const handleSearch = (e) => setQuery(e.target.value);
  const handleFilterChange = (e) => setFilter(e.target.value);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      (filter === "all" ||
        doctor.d_department.toLowerCase() === filter.toLowerCase()) &&
      (doctor.d_name.toLowerCase().includes(query.toLowerCase()) ||
        doctor.d_id.toString().toLowerCase().includes(query) ||
        doctor.d_department.toLowerCase().toString().includes(query.toLowerCase()) ||
        (doctor.d_phn_no && doctor.d_phn_no.toString().includes(query)))
  );

  const handleDoctorClick = async (doctor) => {
    console.log("Doctor clicked:", doctor);

    if (!doctor.d_id) {
      console.error("Error: Doctor ID is undefined or null");
      return;
    }
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={12} md={8} className="">
          <h1 className={`${Doctorstyle.head}`}>Medical Staff Directory</h1>
        </Col>
        <Col xs={12} md={4} className=" d-flex justify-content-end mt-2">
          <div>
            <button
              className={`${Doctorstyle.buttonContent} mt-2 p-2 pe-3`}
              onClick={() => setShowModal2(true)}
            >
              <CirclePlus className="me-2" />
              Add Staff
            </button>
            <AddDoctor
              show={showModal2}
              handlerClose={() => setShowModal2(false)}
            />
          </div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col xs={12} sm={12} md={3}>
          <Card className="shadow-sm p-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Icon
                  icon="pepicons-pencil:persons"
                  width={50}
                  height={50}
                  className={`${Doctorstyle.icondiv} ms-1`}
                />
                <p className={`${Doctorstyle.para}`}>Staff</p>
              </div>
              <div className={` mt-3 ${Doctorstyle.text}`}>
                <p className={`${Doctorstyle.number}`}>{totalDoctors}</p>
                <p className={`${Doctorstyle.content}`}>Active Doctors</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={3}>
          <Card className="shadow-sm p-3">
            <Card.Body>
              <div className="d-flex justify-content-between ">
                <Image
                  src={Vector}
                  alt="Vector"
                  width={50}
                  height={50}
                  className={`${Doctorstyle.icondiv1} ms-2`}
                />
                <p className={`${Doctorstyle.paras}`}>Expertise</p>
              </div>
              <div className={` mt-3 ${Doctorstyle.text}`}>
                <p className={`${Doctorstyle.number}`}>{totalExpertise}</p>
                <p className={`${Doctorstyle.content}`}>Specialties</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={3}>
          <Card className="shadow-sm p-3">
            <Card.Body>
              <div className="d-flex justify-content-around ">
                <Icon
                  icon="hugeicons:patient"
                  width={50}
                  height={50}
                  className={`${Doctorstyle.icondiv2} ms-3`}
                />
                <p className={`${Doctorstyle.parase}`}>Patients</p>
              </div>
              <div className={` mt-3 ${Doctorstyle.text}`}>
                <p className={`${Doctorstyle.number}`}>{totalPatients}</p>
                <p className={`${Doctorstyle.content}`}>Total Patients</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={3}>
          <Card className="shadow-sm p-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Icon
                  icon="mdi:star-outline"
                  width={50}
                  height={50}
                  className={`${Doctorstyle.icondiv3} ms-3`}
                />
                <p className={`${Doctorstyle.parase1}`}>Rating </p>
              </div>
              <div className={` mt-3 ${Doctorstyle.text}`}>
                <p className={`${Doctorstyle.number}`}>4.8</p>
                <p className={`${Doctorstyle.content}`}>Average Rating</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Card className={` shadow-sm mt-3 p-2 pt-3 pb-3`}>
          <Col xs={12} sm={12} md={12} className="mt-2">
            <div className={`d-flex flex-row`}>
              <div className={` ${Doctorstyle.search} p-3 d-flex`}>
                <IoSearchOutline className="mt-1" />
                <input
                  className={` ${Doctorstyle.searchbar} ps-1 w-100`}
                  type="search"
                  value={query}
                  onChange={handleSearch}
                  placeholder="Search doctors by name or specialty...."
                  aria-label="Search"
                />
              </div>
              <CiFilter
                className="ms-1"
                size={40}
                style={{ color: "#979797" }}
              />
              <select
                className={`${Doctorstyle.selection} ms-1 w-25 me-2`}
                value={filter}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="Neurology">Neurology</option>
                <option value="ENT">ENT</option>
                <option value="Dentistry">Dentistry</option>
                <option value="Dermtology">Dermtology</option>
              </select>
            </div>
          </Col>
        </Card>
      </Row>

      {loading && <p>Loading Doctors...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <Row className="mt-3">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor, index) => (
            <Col md={4} key={index}>
              <Card
                className="shadow-sm mb-4"
                onClick={() => handleDoctorClick(doctor)}
              >
                <Card.Body>
                  <h5>{doctor.d_name}</h5>
                  <div className="d-flex align-items-center">
                    <CiStethoscope size={30} className="text-primary" />
                    <p className="ms-2 text-muted">{doctor.d_department}</p>
                  </div>
                  <div className="d-flex align-items-center">
                    <IoStarOutline size={25} className="text-warning" />
                    <p className="ms-2 text-muted">
                      {index === 0 ? "4.8 Rating" : "4.9 Rating"}
                    </p>
                  </div>
                  <div className="d-flex align-items-center">
                    <p className="ms-2 text-muted">{doctor.d_phn_no}</p>
                  </div>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                  <div className="d-flex align-items-center">
                    <GoPeople size={30} className="text-muted" />
                    <p className="ms-2">{doctor.d_available_slots.length}</p>
                  </div>
                  <div className="d-flex align-items-center">
                    <CiCalendar size={30} className="text-muted" />
                    <p className="ms-2">
                      {index === 0 ? "25 Today" : "15 Today"}
                    </p>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))
        ) : (
          <p>No doctors found.</p>
        )}
      </Row>
      {showModal && selectedDoctor && (
        <Doctorsmain
          show={showModal}
          handlerClose={() => setShowModal(false)}
          doctor={selectedDoctor}
          slots={doctorSlots}
        />
      )}
    </Container>
  );
};

export default DoctorsPage;
