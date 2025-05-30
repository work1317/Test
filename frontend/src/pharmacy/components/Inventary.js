import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Form } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import api from "../../utils/axiosInstance";
import styles from '../css/Inventory.module.css';
import { CiSearch } from "react-icons/ci";
import UpdateStock from './UpdateStock';

function Inventary({ onMedicationAdded }) {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedMedicationId, setSelectedMedicationId] = useState(null);

  useEffect(() => {

    const fetchMedications = async () => {

      try {
        const response = await api.get('/pharmacy/medicine_list/');
        if (response.status === 200 && response.data.success === 1) {
          const meds = response.data.data?.medicines || [];
          setMedications(meds);
          const uniqueCategories = [...new Set(meds.map(med => med.category))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching medications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedications();

    const handleRefresh = () => fetchMedications(); // Refresh on event
 
    window.addEventListener("refreshAddMedication", handleRefresh);
     window.addEventListener("refreshProcessPrescription", handleRefresh);
     window.addEventListener("refreshUpdateStock", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshAddMedication", handleRefresh);
      window.removeEventListener("refreshProcessPrescription", handleRefresh);
      window.removeEventListener("refreshUpdateStock", handleRefresh);
      
    };
  }, []);

  useEffect(() => {
    filterMedications();

  }, [medications, searchQuery, selectedCategory]);

  

  const filterMedications = () => {
    if (!Array.isArray(medications)) {
      setFilteredMedications([]);
      return;
    }

    let filtered = medications;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(med =>
        med.medication_name?.toLowerCase().includes(query) ||
        med.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(med => med.category === selectedCategory);
    }

    setFilteredMedications(filtered);
  };

  return (
    <div>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Search and Filter */}
          <Row className="pb-3 mx-2 gap-2">
            <Col className='col-sm-8'>
              <div style={{ position: 'relative' }}>
                <CiSearch
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10px',
                    transform: 'translateY(-50%)',
                    color: '#999',
                    fontSize: '20px',
                    pointerEvents: 'none' // Prevent icon from blocking clicks in the input
                  }}
                />
                <Form.Control
                  type="text" className='w-100'
                  placeholder="Search Inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '35px' }}
                />
              </div>
            </Col>

            <Col md="auto" className='col-sm-1'>
              <Icon icon='iconoir:filter' width='25px' height='30px' color='#BEBEBE' />
            </Col>

            <Col className="text-end col-sm-3">
              <Form.Select
                onChange={(e) => setSelectedCategory(e.target.value)}
                value={selectedCategory}
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>


          {/* Scrollable Card Container */}
          <div
            className={filteredMedications.length > 6 ? styles.scrollContainer : ''}
            style={{
              maxHeight: filteredMedications.length > 6 ? '600px' : 'auto',
              overflowY: filteredMedications.length > 6 ? 'auto' : 'visible',
              overflowX: 'hidden',
            }}
          >
            <Row className="mb-4 g-4 px-4">
              {filteredMedications.map((med, index) => (
                <Col key={index} xs={12} sm={6} md={4} lg={4}>
                  <div className={styles.main}>
                    <div className={`p-3 ${styles.card}`}>
                      <Row className="d-flex justify-content-between align-items-center mb-3">
                        <Col>
                          <span style={{ fontSize: '18px', color: '#313131' }}>{med.medication_name}</span>
                          <p className="text-muted">{med.category}</p>
                        </Col>
                        <Col className="text-end">
                          <span
                            className={styles.status}
                            style={{
                              color:
                                med.status_alert === 'Low Stock' ? '#CC931C' :
                                med.status_alert === 'In Stock' ? '#16A34A' :
                                med.status_alert === 'Stagnant' ? '#F8A401' :
                                med.status_alert === 'Nearing Expiry' ? '#FF0004' : '#000',
                              backgroundColor:
                                med.status_alert === 'Nearing Expiry' ? '#FFD3D3' :
                                med.status_alert === 'Low Stock' ? '#FFE9BA' :
                                med.status_alert === 'In Stock' ? '#D3F2DF' :
                                med.status_alert === 'Stagnant' ? '#FFEBAE' : 'transparent',
                            }}
                          >
                            {med.status_alert}
                          </span>
                        </Col>
                      </Row>
                      <Row className="d-flex justify-content-between align-items-center mb-3">
                        <Col><span className="text-muted">Stock</span></Col>
                        <Col className='text-end'>  <span>{med.stock_quantity} tablets</span> </Col>
                      </Row>
                      <Row className="d-flex justify-content-between align-items-center mb-3">
                        <Col><span className='text-muted'>Price</span></Col>
                        <Col className='text-end'>
                        <span>
                          <Icon icon="mdi:rupee" width="15" height="15"/>
                          {med.unit_price}
                        </span>
                        </Col>
                      </Row>
                      <Row className="d-flex justify-content-between align-items-center mb-3">
                       <Col> <span className='text-muted'>Expiry</span></Col>
                       <Col className='text-end'><span>{med.expiry_date}</span></Col> 
                      </Row>
                      <Row className="d-flex justify-content-between align-items-center mb-3">
                       <Col> <span className='text-muted'>Batch No</span></Col>
                       <Col className='text-end'><span>{med.batch_no}</span></Col>
                      </Row>
                    </div>

                    <button
                      className={`w-100 border-0 ${styles.updateStock}`}
                      onClick={() => setSelectedMedicationId(med.id)}
                    >
                      Update stock
                    </button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Update Stock Modal */}
          <UpdateStock
            medicationId={selectedMedicationId}
            show={selectedMedicationId !== null}
            handleClose={() => setSelectedMedicationId(null)}
          />
        </>
      )}
    </div>
  );
}

export default Inventary;
