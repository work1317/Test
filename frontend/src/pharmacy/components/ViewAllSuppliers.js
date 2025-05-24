import React, { useState, useEffect } from 'react';
import api from "../../utils/axiosInstance";
import { Row, Col, Table,Form } from 'react-bootstrap';
import { CiSearch } from 'react-icons/ci';
import styles from '../css/ViewAllSuppliers.module.css';
import AddSuppliers from './AddSuppliers';

function ViewAllSuppliers({ onShowDetails,onBack }) {
  const [data, setData] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pharmacy/suppliers/');
      if (response.data.success === 1) {
        const rawData = response.data.data;

        const formatted = rawData.map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          SuppliedProducts: (supplier.supplied_products || []).join(', '),
          Balance: (supplier.balance ?? 0).toFixed(2),
          actions: supplier.actions,
        }));

        setSuppliers(formatted);
        setFilteredSuppliers(formatted);

        const total = rawData.reduce((sum, s) => sum + (s.balance ?? 0), 0);
        setTotalBalance(total.toFixed(2));
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const results = suppliers.filter(
      ({ name, email, phone }) =>
        name.toLowerCase().includes(value) ||
        email.toLowerCase().includes(value) ||
        phone.includes(value)
    );
    setFilteredSuppliers(results);
  };

  return (
    <div>
      <Row className="mb-2 justify-content-between align-items-center">
        <Col><h4>Suppliers</h4></Col>
        <Col className="text-end">
          <button className={`btn btn-outline-secondary`} onClick={onBack}>
            ← Back
          </button>
        </Col>
      </Row>

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
                        onChange={handleSearch}
                        style={{ paddingLeft: '35px' }}
                      />
                    </div>
                  </Col>
        <Col className="text-end">
          <button className={`me-2 ${styles.addsuppler}`} onClick={() => setData(true)}>
            Add Suppliers
          </button>
          <AddSuppliers
            show={data}
            handleClose={async () => {
              setData(false);
              await fetchSuppliers();
            }}
          />
        </Col>
      </Row>

      {/* ✅ Scrollable Table Wrapper */}
      <div className={styles.tableScroll}>
        <Table className={styles.responsiveTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Supplied Products</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center">Loading...</td></tr>
            ) : filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.SuppliedProducts}</td>
                  <td style={{
                    color: parseFloat(supplier.Balance) < 0 ? '#FF4444' : '#78FF9E',
                    fontWeight: 'bold'
                  }}>
                    {`\u20B9${supplier.Balance}`}
                  </td>
                  <td>
                    <button
                      className={styles.viewDetails}
                      onClick={() => onShowDetails(supplier.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center text-muted">No suppliers found</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      <div className={`mt-4 ${styles.totalbalance}`}>
        <Row><h5>Overall Balance Sheet</h5></Row>
        <Row><h5>Total Balance: {`\u20B9 ${totalBalance}`}</h5></Row>
      </div>
    </div>
  );
}

export default ViewAllSuppliers;
