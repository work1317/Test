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

//   // Modal control state
//   const [showProcessModal, setShowProcessModal] = useState(false);
//   const [selectedPatientId, setSelectedPatientId] = useState(null);

//   const statusStyles = {
//     Completed: { color: '#16A34A', backgroundColor: '#DDFFE8' },
//     Pending: { color: '#CC931C', backgroundColor: '#FFE9BA' },
//     Processing: { color: '#2563EB', backgroundColor: '#CFDEFF' },
//   };

//   useEffect(() => {
//     axios
//       .get('/records/prescription/')
//       .then((response) => {
//         console.log('prescriprion response',response);
//         const arrayData = Array.isArray(response.data.data) ? response.data.data : [];
//         setPrescriptions(arrayData);

//         const uniqueCategories = [
//           ...new Set(arrayData.map((p) => p.category || 'Uncategorized')) 
//         ];
//         setCategories(uniqueCategories);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error('API Error:', error);
//         setError('Failed to load prescriptions');
//         setLoading(false);
//       });
//   }, []);

//   const handleProcessClick = (patientId) => {
//     setSelectedPatientId(patientId);  // Set the selected patient ID
//     setShowProcessModal(true);  // Open the modal
//   };

//   const handleCloseModal = () => {
//     setShowProcessModal(false);  // Close the modal
//     setSelectedPatientId(null);  // Reset the selected patient ID
//   };

//   if (loading) return <Spinner animation="border" />;
//   if (error) return <Alert variant="danger">{error}</Alert>;

//   const filteredPrescriptions = prescriptions.filter((card) => {
//     const lowerCaseQuery = searchQuery.toLowerCase();
//     const matchesSearchQuery =
//       card.patient_name.toLowerCase().includes(lowerCaseQuery) ||
//       card.medication_name.toLowerCase().includes(lowerCaseQuery) ||
//       String(card.patient_id).toLowerCase().includes(lowerCaseQuery);

//     const matchesCategory =
//       selectedCategory === '' ||
//       selectedCategory === 'All' ||
//       (card.category || 'Uncategorized') === selectedCategory;

//     return matchesSearchQuery && matchesCategory;
//   });

//   return (
//     <div>
//       {/* Search & Filter */}
//       <Row className="pb-3">
//         <Col>
//           <div style={{ position: 'relative' }}>
//             <CiSearch
//               style={{
//                 position: 'absolute',
//                 top: '50%',
//                 left: '10px',
//                 transform: 'translateY(-50%)',
//                 color: '#999',
//                 fontSize: '20px',
//                 pointerEvents: 'none',
//               }}
//             />
//             <Form.Control
//               type="text"
//               placeholder="Search Patient Name, Patient ID..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               style={{ paddingLeft: '35px' }}
//             />
//           </div>
//         </Col>

//         <Col md="auto">
//           <Icon icon="iconoir:filter" width="25px" height="30px" color="#BEBEBE" />
//         </Col>

//         <Col className="text-end">
//           <Form.Select
//             onChange={(e) => setSelectedCategory(e.target.value)}
//             value={selectedCategory}
//           >
//             <option value="">All Categories</option>
//             {categories.length === 0 ? (
//               <option disabled>No Categories</option>
//             ) : (
//               categories.map((cat, idx) => (
//                 <option key={idx} value={cat}>
//                   {cat}
//                 </option>
//               ))
//             )}
//           </Form.Select>
//         </Col>
//       </Row>

//       {/* Prescription Cards */}
//       {filteredPrescriptions.length === 0 ? (
//         <Alert variant="warning">No prescriptions found</Alert>
//       ) : (
//         filteredPrescriptions.map((card, index) => {
//           const style = statusStyles[card.status] || {
//             color: '#6c757d',
//             backgroundColor: '#f8f9fa',
//           };

//           return (
//             <Card className="p-3 mb-4" key={index}>
//               <Row className="d-flex justify-content-between">
//                 <Col>
//                   <h5>{card.patient_name}</h5>
//                   <span>ID: {card.patient_id}</span>
//                   <span className="ps-4">Dr.{card.doctor_name}</span>
//                 </Col>
//                 <Col className={`text-end ${styles.status}`}>
//                   <span
//                     style={{
//                       ...style,
//                       borderRadius: '13px',
//                       padding: '8px 23px',
//                     }}
//                   >
//                     {card.status || 'Pending'}
//                   </span>
//                 </Col>
//               </Row>

//               <Card className={`p-3 mt-4 ${styles.medicinecard}`}>
//                 <Row>
//                   <Col>
//                     <span>{card.medication_name}</span>
//                   </Col>
//                   <Col className="text-end">
//                     <span>{card.dosage}</span>
//                   </Col>
//                 </Row>
//                 <Row>
//                   <Col>
//                     <span style={{ color: '#7A7A7A' }}>Quantity: {card.quantity || '0'}</span>
//                   </Col>
//                   <span style={{ color: '#7A7A7A' }}>{card.summary}</span>
//                 </Row>
//               </Card>

//               <Row className="mt-4">
//                 <Col className="d-flex justify-content-end">
//                   <button
//                     className={styles.processbutton}
//                     onClick={() => handleProcessClick(card.patient_id)} // Set the patient ID to trigger the modal
//                   >
//                     Process Prescription
//                   </button>
//                 </Col>
//               </Row>
//             </Card>
//           );
//         })
//       )}

//       {/* Process Prescription Modal */}
//       <ProcessPrescription
//         show={showProcessModal}  // Pass the modal state
//         handleClose={handleCloseModal} // Close the modal function
//         patient_id={selectedPatientId}  // Pass the selected patient ID to the modal
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
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
        console.log('patient prescription',response)
        const arrayData = Array.isArray(response.data.data) ? response.data.data : [];
        setPrescriptions(arrayData);

        const uniqueCategories = [...new Set(arrayData.map((p) => p.appointment_type || 'Uncategorized'))];
        setCategories(uniqueCategories);
        setLoading(false);
      })
      .catch((error) => {
        console.error('API Error:', error);
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

  const filteredPrescriptions = prescriptions.filter((card) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const matchesSearchQuery =
      card.patient_name?.toLowerCase().includes(lowerCaseQuery) ||
      card.medication_name?.toLowerCase().includes(lowerCaseQuery) ||
      card.phone_number?.toLowerCase().includes(lowerCaseQuery) ||
      String(card.patient_id).toLowerCase().includes(lowerCaseQuery);
  
    const matchesCategory =
      filter === '' ||
      filter.toLowerCase() === 'all' ||
      (card.appointment_type || 'Uncategorized').toLowerCase() === filter.toLowerCase();
  
    return matchesSearchQuery && matchesCategory;
  });
  

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      {/* Search & Filter */}
      {/* <Row className="pb-3 w-100">
        <Col>
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
              placeholder="Search Patient Name, Patient ID,Phone Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '35px' }}
            />
          </div>
        </Col>

        <Col md="2">
          <Icon icon="iconoir:filter" width="25px" height="30px" color="#BEBEBE" />
        </Col>

        <Col className="text-end" md={4}>
          <select className={`${styles.selection} ms-1 w-25 p-2 me-2`}
           value={filter}
                onChange={handleFilterChange}
              >
                <option value="all">All </option>
                <option value="InPatient">InPatient</option>
                <option value="OutPatient">OutPatient</option>
                <option value="Casuality">Casuality</option>
              </select>
        </Col>
      </Row> */}
      <Row className="pb-3">
  {/* First main column: Search input */}
  <Col md={7} >
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
 
  {/* Second main column: Nested row for filter and dropdown */}
  <Col md={4} style={{marginLeft:'55px'}}>
    <Row>
      {/* Filter icon */}
      <Col className='col-sm-2'>
        <Icon icon="iconoir:filter" width="25px" height="30px" color="#BEBEBE" />
      </Col>
 
      {/* Category dropdown */}
      <Col className='col-sm-10'>
      <select className={`${styles.selection} ms-1 w-100 p-2`}
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
 

      {/* ✅ Scrollable Prescription Cards */}
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
        {filteredPrescriptions.length === 0 ? (
          <Alert variant="warning">No prescriptions found</Alert>
        ) : (
          filteredPrescriptions.map((card, index) => {
            const normalizedStatus = (card.status || 'processing').toLowerCase();
            const style = statusStyles[normalizedStatus] || {
              color: '#6c757d',
              backgroundColor: '#f8f9fa',
            };
            return (
              <Card className="p-3 mb-4" key={index}>
                <Row className="d-flex justify-content-between">
                  <Col>
                    <h5>{card.patient_name}</h5>
                    <span>ID: {card.patient_id}</span>
                    <span className="ps-4">Dr. {card.doctor_name}</span>
                  </Col>
                  <Col className={`text-end ${styles.status}`}>
                    <span
                      style={{
                        ...style,
                        borderRadius: '13px',
                        padding: '8px 23px',
                      }}
                    >
                      {card.status || 'processing'}
                    </span>
                  </Col>
                </Row>

                <Card className={`p-3 mt-4 ${styles.medicinecard}`}>
                  <Row>
                    <Col>
                      <span>{card.medication_name}</span>
                    </Col>
                    <Col className="text-end">
                      <span>{card.dosage}</span>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <span style={{ color: '#7A7A7A' }}>Quantity: {card.quantity || '0'}</span>
                    </Col>
                    <span style={{ color: '#7A7A7A' }}>{card.summary}</span>
                  </Row>
                </Card>

                <Row className="mt-4">
                  <Col className="d-flex justify-content-end">
                    <button
                      className={styles.processbutton}
                      onClick={() => handleProcessClick(card.patient_id)}
                    >
                      Process Prescription
                    </button>
                  </Col>
                </Row>
              </Card>
            );
          })
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
