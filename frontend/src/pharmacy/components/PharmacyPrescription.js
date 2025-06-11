import React, { useState, useEffect } from 'react';
import api from "../../utils/axiosInstance";
import { Card, Col, Row, Spinner, Alert, Form } from 'react-bootstrap';
import styles from '../css/PharmacyPrescription.module.css';
import { CiSearch } from 'react-icons/ci';
import { Icon } from '@iconify/react';
import ProcessPrescription from './ProcessPrescription';

function PharmacyPrescription() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState("all");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const statusStyles = {
    completed: { color: '#16A34A', backgroundColor: '#DDFFE8' },
    pending: { color: '#CC931C', backgroundColor: '#FFE9BA' },
    processing: { color: '#2563EB', backgroundColor: '#CFDEFF' },
  };

  const fetchPrescriptions = () => {
    setLoading(true);
    api
      .get('/records/prescription/')
      .then((response) => {
        const data = Array.isArray(response.data.data) ? response.data.data : [];

        // Group prescriptions by patient_id
        const grouped = data.reduce((acc, item) => {
          const pid = item.patient_id;
          if (!acc[pid]) {
            acc[pid] = {
              patient_id: pid,
              patient_name: item.patient_name,
              doctor_name: item.doctor_name,
              phone_number: item.phone_number,
              appointment_type: item.appointment_type,
              prescriptions: [],
            };
          }
          acc[pid].prescriptions.push(item);
          return acc;
        }, {});

        setPrescriptions(Object.values(grouped));
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to load prescriptions');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleProcessClick = (patientId) => {
    setSelectedPatientId(patientId);
    setShowProcessModal(true);
  };

  const handleFilterChange = (e) => setFilter(e.target.value);

  const handleCloseModal = () => {
    setShowProcessModal(false);
    setSelectedPatientId(null);
  };

  const filteredPrescriptions = prescriptions.filter((group) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = group.patient_name.toLowerCase().includes(query)
      || group.phone_number?.toLowerCase().includes(query)
      || String(group.patient_id).toLowerCase().includes(query);

    const matchesCategory = filter === 'all'
      || (group.appointment_type || 'Uncategorized').toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      {/* Search & Filter */}
      <Row className="pb-3">
        <Col md={7}>
          <div style={{ position: 'relative' }}>
            <CiSearch
              style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                color: '#999',
                fontSize: '20px',
                pointerEvents: 'none',
              }}
            />
            <Form.Control
              type="text"
              placeholder="Search Patient Name, Patient ID, Phone Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '35px' }}
            />
          </div>
        </Col>
        <Col md={4} style={{ marginLeft: '55px' }}>
          <Row>
            <Col className='col-sm-2'>
              <Icon icon="iconoir:filter" width="25px" height="30px" color="#BEBEBE" />
            </Col>
            <Col className='col-sm-10'>
              <select
                className={`${styles.selection} ms-1 w-100 p-2`}
                value={filter}
                onChange={handleFilterChange}
              >
                <option value="all">All </option>
                <option value="InPatient">InPatient</option>
                <option value="OutPatient">OutPatient</option>
                <option value="Casuality">Casuality</option>
              </select>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Scrollable Cards */}
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
        {filteredPrescriptions.length === 0 ? (
          <Alert variant="warning">No prescriptions found</Alert>
        ) : (
          filteredPrescriptions.map((group, index) => (
            <Card className="p-3 mb-4" key={index}>
              <Row className="d-flex justify-content-between">
                <Col>
                  <h5>{group.patient_name}</h5>
                  <span>ID: {group.patient_id}</span>
                  <span className="ps-4">Dr. {group.doctor_name}</span>
                </Col>
              </Row>

              {/* List of prescription cards */}
              {group.prescriptions.map((med, idx) => (
                <Card className={`p-3 mt-4 ${styles.medicinecard}`} key={idx}>
                  <Row>
                    <Col>
                      <span>{med.medication_name}</span>
                    </Col>
                    <Col className="text-end">
                      <span
                        style={{
                          ...statusStyles[(med.status || 'processing').toLowerCase()],
                          borderRadius: '13px',
                          padding: '5px 15px',
                          fontSize: '0.85rem',
                          marginRight:'-12px'
                        }}
                      >
                        {med.status || 'processing'}
                      </span>
                    </Col>
                  </Row>

                  <Row className="mt-2">
                    <Col>
                      <span style={{ color: '#7A7A7A' }}>Quantity: {med.quantity || '0'}</span>
                    </Col>
                    <Col className="text-end">
                      <span>{med.dosage}</span>
                    </Col>
                  </Row>

                  {med.summary && (
                    <Row className="mt-1">
                      <Col>
                        <span style={{ color: '#7A7A7A' }}>{med.summary}</span>
                      </Col>
                    </Row>
                  )}
                </Card>
              ))}

              <Row className="mt-4">
                <Col className="d-flex justify-content-end">
                  <button
                    className={styles.processbutton}
                    onClick={() => handleProcessClick(group.patient_id)}
                  >
                    Process Prescription
                  </button>
                </Col>
              </Row>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      <ProcessPrescription
        show={showProcessModal}
        handleClose={handleCloseModal}
        patient_id={selectedPatientId}
        onUpdate={fetchPrescriptions}
      />
    </div>
  );
}

export default PharmacyPrescription;
