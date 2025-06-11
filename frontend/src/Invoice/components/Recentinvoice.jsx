import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Table, Button } from 'react-bootstrap';
import axios from 'axios';
import styles from '../css/Recentinvoice.module.css'; // Assuming you have custom styles
import { Icon } from '@iconify/react';
import api from '../../utils/axiosInstance';
import InvoicePrint from './InvoicePrint';
 
function Recentinvoice({ back }) {
    const [invoiceData, setInvoiceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
const [selectedPatientId, setSelectedPatientId] = useState(null);
 
 
    // State for the search input and dropdowns
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [serviceQuery, setServiceQuery] = useState('');
 
    useEffect(() => {
        // Fetch invoice data from the new API (assuming it's available at localhost:8000/invoice/invoices/)
        const fetchData = async () => {
            try {
                const response = await api.get('invoice/invoices/');  // Replace with API URL
                setInvoiceData(response.data.data);  // Invoice data is inside the 'data' field
                setFilteredData(response.data.data);
                console.log("Get the recent Invoice", response);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
 
        fetchData();
    }, []);
 
    // Handle the change in search query
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };
 
    // Handle department dropdown change
    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
    };
 
    // Handle service input change
    const handleServiceChange = (e) => {
        setServiceQuery(e.target.value.toLowerCase());
    };
 
useEffect(() => {
    let filtered = invoiceData;
 
    // 1. Patient Search Filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((invoice) => {
            const patientInfo = invoice.patient_info || {};
            const patientName = (patientInfo.patient_name || '').toLowerCase();
            const patientId = String(invoice.invoice?.patient || '').toLowerCase();
            const mobileNumber = patientInfo.mobile_number || '';
 
            return (
                patientName.includes(query) ||
                patientId.includes(query) ||
                mobileNumber.includes(searchQuery)  // no need for lowercase
            );
        });
    }
 
    // 2. Department Filter
    if (selectedDepartment) {
        filtered = filtered.filter((invoice) => {
            const department = invoice.patient_info?.department || '';
            return department.toLowerCase().includes(selectedDepartment.toLowerCase());
        });
    }
 
    // 3. Service Filter
    if (serviceQuery) {
        const serviceQueryLower = serviceQuery.toLowerCase();
        filtered = filtered.filter((invoice) => {
            const services = invoice.invoice?.service_charges || [];
            return services.some((service) =>
                (service.service_name || '').toLowerCase().includes(serviceQueryLower)
            );
        });
    }
 
    setFilteredData(filtered);
}, [searchQuery, selectedDepartment, serviceQuery, invoiceData]);
 
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
 
    return (
        <div className="container">
            <div className="d-flex justify-content-between mb-4 mt-4">
                <h4>Hospital Invoice Management</h4>
                {/* back to Invoice button */}
                <Button onClick={back} className={styles.backbutton}>Back</Button>
            </div>
 
            {/* Header with Search Bar, Department, and Service Input Field */}
            <div className={styles.header}>
                <Row className="m-4">
                    <Col>
                        <h6>Department</h6>
                        <Form.Select value={selectedDepartment} onChange={handleDepartmentChange}>
                            <option value="">All Departments</option>
                            {/* Dynamically render departments from available invoices */}
                            {Array.from(new Set(invoiceData.map(invoice => invoice.patient_info.department)))
                                .map((department, index) => (
                                    <option key={index} value={department}>{department}</option>
                                ))}
                        </Form.Select>
                    </Col>
 
                    <Col>
                        <h6>Services</h6>
                        <Form.Control
                            type="text"
                            value={serviceQuery}
                            onChange={handleServiceChange}
                            placeholder="Search by service..."
                        />
                    </Col>
 
                    <Col>
                        <h6>Search Patient</h6>
                        <Form.Control
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search by Patient name, ID, or mobile number..."
                            aria-label="Search Patient"
                        />
                    </Col>
                </Row>
            </div>
<div className="mt-4">
  <div className={styles.tableWrapper}>
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Invoice ID</th>
          <th>Patient Name</th>
          <th>Department</th>
          <th>Service</th>
          <th>Date</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.length > 0 ? (
          filteredData.map((invoice) => (
            <tr key={invoice.invoice.id}>
                <td
                    style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
                    onClick={() => {
                        setSelectedPatientId(invoice.invoice.patient); // use patient ID
                        setShowPrintModal(true);
                    }}
                    >
                    {invoice.invoice.invoice_id}
                    </td>
 
              <td>{invoice.patient_info.patient_name}</td>
              <td>{invoice.patient_info.department}</td>
              <td>
                {invoice.invoice.service_charges.map((service, index) => (
                  <div key={index}>{service.service_name}</div>
                ))}
              </td>
              <td>{invoice.invoice.date}</td>
              <td>
                <Icon icon="mdi:rupee" width="15" height="15" />
                {invoice.totals.final_total.toFixed(2)}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center">No results found</td>
          </tr>
        )}
      </tbody>
    </Table>
    <InvoicePrint
     show={showPrintModal}
    handlePrintClose={() => setShowPrintModal(false)}
    patientId={selectedPatientId}
      />
 
  </div>
</div>
</div>
    );
}
 
export default Recentinvoice;