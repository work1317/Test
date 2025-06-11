// import React, { useState, useEffect } from 'react';
// import api from "../../utils/axiosInstance";
// import { Card, Col, Row, Spinner, Alert, Form } from 'react-bootstrap';
// import styles from '../css/PharmacyPrescription.module.css';
// import { CiSearch } from 'react-icons/ci';
// import { Icon } from '@iconify/react';
// import ProcessPrescription from './ProcessPrescription';

// function PharmacyPrescription() {
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [categories, setCategories] = useState([]);
  
//     const [filter, setFilter] = useState("all");

//   const [showProcessModal, setShowProcessModal] = useState(false);
//   const [selectedPatientId, setSelectedPatientId] = useState(null);

//   const statusStyles = {
//     completed: { color: '#16A34A', backgroundColor: '#DDFFE8' },
//     pending: { color: '#CC931C', backgroundColor: '#FFE9BA' },
//     processing: { color: '#2563EB', backgroundColor: '#CFDEFF' },
//   };

//   const fetchPrescriptions = () => {
//     setLoading(true);
//     api
//       .get('/records/prescription/')
//       .then((response) => {
//         console.log('patient prescription',response)
//         const arrayData = Array.isArray(response.data.data) ? response.data.data : [];
//         setPrescriptions(arrayData);

//         const uniqueCategories = [...new Set(arrayData.map((p) => p.appointment_type || 'Uncategorized'))];
//         setCategories(uniqueCategories);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error('API Error:', error);
//         setError('Failed to load prescriptions');
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchPrescriptions();
//   }, []);

//   const handleProcessClick = (patientId) => {
//     setSelectedPatientId(patientId);
//     setShowProcessModal(true);
//   };
//   const handleFilterChange = (e) => setFilter(e.target.value);

//   const handleCloseModal = () => {
//     setShowProcessModal(false);
//     setSelectedPatientId(null);
//   };

//   const filteredPrescriptions = prescriptions.filter((card) => {
//     const lowerCaseQuery = searchQuery.toLowerCase();
//     const matchesSearchQuery =
//       card.patient_name?.toLowerCase().includes(lowerCaseQuery) ||
//       card.medication_name?.toLowerCase().includes(lowerCaseQuery) ||
//       card.phone_number?.toLowerCase().includes(lowerCaseQuery) ||
//       String(card.patient_id).toLowerCase().includes(lowerCaseQuery);
  
//     const matchesCategory =
//       filter === '' ||
//       filter.toLowerCase() === 'all' ||
//       (card.appointment_type || 'Uncategorized').toLowerCase() === filter.toLowerCase();
  
//     return matchesSearchQuery && matchesCategory;
//   });
  

//   if (loading) return <Spinner animation="border" />;
//   if (error) return <Alert variant="danger">{error}</Alert>;

//   return (
//     <div>
//       {/* Search & Filter */}
//       <Row className="pb-3">
//   {/* First main column: Search input */}
//   <Col md={7} >
//     <div style={{ position: 'relative' }}>
//       <CiSearch
//         style={{
//           position: 'absolute',
//           top: '50%',
//           left: '10px',
//           transform: 'translateY(-50%)',
//           color: '#999',
//           fontSize: '20px',
//           pointerEvents: 'none',
//         }}
//       />
//       <Form.Control
//         type="text"
//         placeholder="Search Patient Name, Patient ID, Phone Number..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         style={{ paddingLeft: '35px' }}
//       />
//     </div>
//   </Col>
 
//   {/* Second main column: Nested row for filter and dropdown */}
//   <Col md={4} style={{marginLeft:'55px'}}>
//     <Row>
//       {/* Filter icon */}
//       <Col className='col-sm-2'>
//         <Icon icon="iconoir:filter" width="25px" height="30px" color="#BEBEBE" />
//       </Col>
 
//       {/* Category dropdown */}
//       <Col className='col-sm-10'>
//       <select className={`${styles.selection} ms-1 w-100 p-2`}
//            value={filter}
//                 onChange={handleFilterChange}
//               >
//                 <option value="all">All </option>
//                 <option value="InPatient">InPatient</option>
//                 <option value="OutPatient">OutPatient</option>
//                 <option value="Casuality">Casuality</option>
//               </select>
//       </Col>
//     </Row>
//   </Col>
// </Row>
 

//       {/* ✅ Scrollable Prescription Cards */}
//       <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
//         {filteredPrescriptions.length === 0 ? (
//           <Alert variant="warning">No prescriptions found</Alert>
//         ) : (
//           filteredPrescriptions.map((card, index) => {
//             const normalizedStatus = (card.status || 'processing').toLowerCase();
//             const style = statusStyles[normalizedStatus] || {
//               color: '#6c757d',
//               backgroundColor: '#f8f9fa',
//             };
//             return (
//               <Card className="p-3 mb-4" key={index}>
//                 <Row className="d-flex justify-content-between">
//                   <Col>
//                     <h5>{card.patient_name}</h5>
//                     <span>ID: {card.patient_id}</span>
//                     <span className="ps-4">Dr. {card.doctor_name}</span>
//                   </Col>
//                   <Col className={`text-end ${styles.status}`}>
//                     <span
//                       style={{
//                         ...style,
//                         borderRadius: '13px',
//                         padding: '8px 23px',
//                       }}
//                     >
//                       {card.status || 'processing'}
//                     </span>
//                   </Col>
//                 </Row>

//                 <Card className={`p-3 mt-4 ${styles.medicinecard}`}>
//                   <Row>
//                     <Col>
//                       <span>{card.medication_name}</span>
//                     </Col>
//                     <Col className="text-end">
//                       <span>{card.dosage}</span>
//                     </Col>
//                   </Row>
//                   <Row>
//                     <Col>
//                       <span style={{ color: '#7A7A7A' }}>Quantity: {card.quantity || '0'}</span>
//                     </Col>
//                     <span style={{ color: '#7A7A7A' }}>{card.summary}</span>
//                   </Row>
//                 </Card>

//                 <Row className="mt-4">
//                   <Col className="d-flex justify-content-end">
//                     <button
//                       className={styles.processbutton}
//                       onClick={() => handleProcessClick(card.patient_id)}
//                     >
//                       Process Prescription
//                     </button>
//                   </Col>
//                 </Row>
//               </Card>
//             );
//           })
//         )}
//       </div>

//       {/* Modal */}
//       <ProcessPrescription
//         show={showProcessModal}
//         handleClose={handleCloseModal}
//         patient_id={selectedPatientId}
//         onUpdate={fetchPrescriptions}
//       />
//     </div>
//   );
// }

// export default PharmacyPrescription;



// import React, { useState, useEffect } from 'react';
// import api from "../../utils/axiosInstance";
// import { Card, Col, Row, Spinner, Alert, Form } from 'react-bootstrap';
// import styles from '../css/PharmacyPrescription.module.css';
// import { CiSearch } from 'react-icons/ci';
// import { Icon } from '@iconify/react';
// import ProcessPrescription from './ProcessPrescription';

// function PharmacyPrescription() {
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filter, setFilter] = useState("all");
//   const [showProcessModal, setShowProcessModal] = useState(false);
//   const [selectedPatientId, setSelectedPatientId] = useState(null);

//   const statusStyles = {
//     completed: { color: '#16A34A', backgroundColor: '#DDFFE8' },
//     pending: { color: '#CC931C', backgroundColor: '#FFE9BA' },
//     processing: { color: '#2563EB', backgroundColor: '#CFDEFF' },
//   };

//   const fetchPrescriptions = () => {
//     setLoading(true);
//     api.get('/records/prescription/')
//       .then((response) => {
//         const arrayData = Array.isArray(response.data.data) ? response.data.data : [];
//         setPrescriptions(arrayData);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error('API Error:', error);
//         setError('Failed to load prescriptions');
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchPrescriptions();
//   }, []);

//   const handleProcessClick = (patientId) => {
//     setSelectedPatientId(patientId);
//     setShowProcessModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowProcessModal(false);
//     setSelectedPatientId(null);
//   };

//   const groupedPrescriptions = prescriptions.reduce((acc, pres) => {
//     const pid = pres.patient_id;
//     if (!acc[pid]) {
//       acc[pid] = {
//         patient_id: pid,
//         patient_name: pres.patient_name,
//         doctor_name: pres.doctor_name,
//         appointment_type: pres.appointment_type,
//         phone_number: pres.phone_number,
//         prescriptions: [],
//         status: pres.status || "processing",
//       };
//     }
//     acc[pid].prescriptions.push({
//       medication_name: pres.medication_name,
//       dosage: pres.dosage,
//       quantity: pres.quantity,
//       summary: pres.summary,
//     });
//     return acc;
//   }, {});

//   const groupedPatientArray = Object.values(groupedPrescriptions).filter((group) => {
//     const lower = searchQuery.toLowerCase();
//     const matchQuery =
//       group.patient_name?.toLowerCase().includes(lower) ||
//       group.phone_number?.toLowerCase().includes(lower) ||
//       String(group.patient_id).toLowerCase().includes(lower);

//     const matchCategory =
//       filter === '' ||
//       filter.toLowerCase() === 'all' ||
//       (group.appointment_type || 'Uncategorized').toLowerCase() === filter.toLowerCase();

//     return matchQuery && matchCategory;
//   });

//   if (loading) return <Spinner animation="border" />;
//   if (error) return <Alert variant="danger">{error}</Alert>;

//   return (
//     <div>
//       {/* Search & Filter */}
//       <Row className="pb-3">
//         <Col md={7}>
//           <div style={{ position: 'relative' }}>
//             <CiSearch style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#999', fontSize: '20px', pointerEvents: 'none' }} />
//             <Form.Control
//               type="text"
//               placeholder="Search Patient Name, Patient ID, Phone Number..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               style={{ paddingLeft: '35px' }}
//             />
//           </div>
//         </Col>
//         <Col md={4} style={{ marginLeft: '55px' }}>
//           <Row>
//             <Col className='col-sm-2'>
//               <Icon icon="iconoir:filter" width="25px" height="30px" color="#BEBEBE" />
//             </Col>
//             <Col className='col-sm-10'>
//               <select className={`${styles.selection} ms-1 w-100 p-2`} value={filter} onChange={(e) => setFilter(e.target.value)}>
//                 <option value="all">All</option>
//                 <option value="InPatient">InPatient</option>
//                 <option value="OutPatient">OutPatient</option>
//                 <option value="Casuality">Casuality</option>
//               </select>
//             </Col>
//           </Row>
//         </Col>
//       </Row>

//       {/* Prescription Cards */}
//       <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
//         {groupedPatientArray.length === 0 ? (
//           <Alert variant="warning">No prescriptions found</Alert>
//         ) : (
//           groupedPatientArray.map((group, index) => {
//             const style = statusStyles[group.status.toLowerCase()] || { color: '#6c757d', backgroundColor: '#f8f9fa' };
//             return (
//               <Card className="p-3 mb-4" key={index}>
//                 <Row className="d-flex justify-content-between">
//                   <Col>
//                     <h5>{group.patient_name}</h5>
//                     <span>ID: {group.patient_id}</span>
//                     <span className="ps-4">Dr. {group.doctor_name}</span>
//                   </Col>
//                   <Col className={`text-end ${styles.status}`}>
//                     <span style={{ ...style, borderRadius: '13px', padding: '8px 23px' }}>{group.status}</span>
//                   </Col>
//                 </Row>

//                 {group.prescriptions.map((med, i) => (
//                   <Card className={`p-3 mt-3 ${styles.medicinecard}`} key={i}>
//                     <Row>
//                       <Col><span>{med.medication_name}</span></Col>
//                       <Col className="text-end"><span>{med.dosage}</span></Col>
//                     </Row>
//                     <Row>
//                       <Col>
//                         <span style={{ color: '#7A7A7A' }}>Quantity: {med.quantity || 0}</span>
//                       </Col>
//                       <span style={{ color: '#7A7A7A' }}>{med.summary}</span>
//                     </Row>
//                   </Card>
//                 ))}

//                 <Row className="mt-4">
//                   <Col className="d-flex justify-content-end">
//                     <button className={styles.processbutton} onClick={() => handleProcessClick(group.patient_id)}>
//                       Process Prescription
//                     </button>
//                   </Col>
//                 </Row>
//               </Card>
//             );
//           })
//         )}
//       </div>

//       <ProcessPrescription
//         show={showProcessModal}
//         handleClose={handleCloseModal}
//         patient_id={selectedPatientId}
//         onUpdate={fetchPrescriptions}
//       />
//     </div>
//   );
// }

// export default PharmacyPrescription;




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



                // <Card className={`p-3 mt-4 ${styles.medicinecard}`} key={idx}>
                //   <Row>
                //     <Col>
                //       <span>{med.medication_name}</span>
                //     </Col>
                //     <Col className="text-end">
                //       <span>{med.dosage}</span>
                //     </Col>
                //   </Row>

                //   <Row className="mt-2">
                //     <Col>
                //       <span style={{ color: '#7A7A7A' }}>Quantity: {med.quantity || '0'}</span>
                //     </Col>
                //     <Col className="text-end">
                //       <span
                //         style={{
                //           ...statusStyles[(med.status || 'processing').toLowerCase()],
                //           borderRadius: '13px',
                //           padding: '5px 15px',
                //           fontSize: '0.85rem',
                //         }}
                //       >
                //         {med.status || 'processing'}
                //       </span>
                //     </Col>
                //   </Row>

                //   {med.summary && (
                //     <Row>
                //       <Col>
                //         <span style={{ color: '#7A7A7A' }}>{med.summary}</span>
                //       </Col>
                //     </Row>
                //   )}
                // </Card>

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
