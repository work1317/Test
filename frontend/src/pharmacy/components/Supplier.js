import React, { useState, useEffect } from 'react';
import api from "../../utils/axiosInstance";
import Button from 'react-bootstrap/Button';
import { Row, Col, Table } from 'react-bootstrap';
import { CiSearch } from 'react-icons/ci';
import styles from '../css/Suppliers.module.css';
import AddSuppliers from './AddSuppliers';
import {Form} from 'react-bootstrap'
function Supplier({ onViewAll }) {
  const [data, setData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  // Fetch suppliers from the API
  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/pharmacy/suppliers/');
      console.log(response)
      if (response.data.success === 1) {
        const formattedSuppliers = response.data.data.map((supplier, index) => ({
          id: index + 1,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          products: supplier.supplied_products.join(', ')
        }));
        setSuppliers(formattedSuppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
     const handleRefresh = () => fetchSuppliers(); // Refresh on event
 
    window.addEventListener("refreshAddSuppliers", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshAddSuppliers", handleRefresh);
    };
  }, []);

  // Filter suppliers based on searchQuery
  const filteredSuppliers = suppliers.filter((supplier) => {
    const query = searchQuery.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(query) ||
      supplier.email.toLowerCase().includes(query) ||
      supplier.phone.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <Row className="pb-3">
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
                          pointerEvents: 'none' // Prevent icon from blocking clicks in the input
                        }}
                      />
                      <Form.Control
                        type="text"
                        placeholder="Search Supplier"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '35px' }}
                      />
                    </div>
                  </Col>
        <Col className='text-end pr-4'>
          <button className={styles.addsuppler} onClick={() => setData(true)}>
            Add Suppliers
          </button>
          <AddSuppliers
            show={data}
            handleClose={() => {
              setData(false);
              fetchSuppliers();
            }}
          />
        </Col>
      </Row>

      {/* Scrollable table wrapper */}
      <div
        style={{
          maxHeight: filteredSuppliers.length > 3 ? '300px' : 'auto',
          overflowY: filteredSuppliers.length > 3 ? 'auto' : 'visible',
          border: filteredSuppliers.length > 3 ? '1px solid #ddd' : 'none',
        }}
      >
        <Table responsive>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Supplied Products</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.id}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.products}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">No suppliers found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Row>
        <Col>
          <button
            className={`text-start border-0 ${styles.viewSuppliers}`}
            onClick={onViewAll}
          >
            View All Suppliers
          </button>
        </Col>
      </Row>
    </div>
  );
}

export default Supplier;
 