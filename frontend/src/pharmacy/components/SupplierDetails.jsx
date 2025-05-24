import React, { useEffect, useState } from 'react';
import api from "../../utils/axiosInstance";
import { Row, Col, Container, Form, Table } from 'react-bootstrap';
import styles from '../css/SupplierDetails.module.css';

// Hardcoded Payment Modes
const payment_mode = {
  CASH: 'cash',
  DEBIT_CREDIT_CARD: 'debit_credit_card',
  UPI: 'upi',
  MULTIPLE_CASH_CARD: 'multiple_cash_card',
  MULTIPLE_CASH_UPI: 'multiple_cash_upi',
};
 
const SupplierDetails = ({ supplierId, onBack }) => {
  const [supplier, setSupplier] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    due_on: '',
    transaction_type: '',
    payment_mode: '',
    due_date_amount: '',
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showRecentOnly, setShowRecentOnly] = useState(false);
 
  const fetchSupplierDetails = async () => {
    try {
      const response = await api.get(`/pharmacy/suppliers/${supplierId}/`);
      if (response.data.success === 1) {
        setSupplier(response.data.data);
        setTransactions(response.data.data.transactions);
        console.log("Backend Response: ", response.data);  // Full API response
        console.log("Current Balance: ", response.data.data.current_balance);
      }
    } catch (error) {
      console.error('Failed to fetch supplier details:', error);
    }
  };
 
  const handleAddTransaction = async (e) => {
    e.preventDefault();
 
    try {
      const postData = {
        supplier: supplierId,
        date: formData.date,
        description: formData.description,
        amount: parseFloat(formData.amount),
        transaction_type: formData.transaction_type,
        payment_mode: formData.payment_mode,
        due_date: formData.due_on,
        due_date_amount: parseFloat(formData.due_date_amount) || 0,
      };
 
      console.log("Sending transaction data to backend:", postData);
 
      const response = await api.post('/pharmacy/add_transaction/', postData);
      console.log('Backend response:', response);
 
      if (response.data.success === 1) {
        alert('Transaction added successfully!');
        fetchSupplierDetails();
      } else {
        console.error('Backend error message:', response.data.message);
        alert(`Failed to add transaction: ${response.data.message || 'Unknown error'}`);
      }
 
      setFormData({
        date: '',
        description: '',
        amount: '',
        due_on: '',
        transaction_type: '',
        payment_mode: '',
        due_date_amount: '',
      });
    } catch (error) {
      console.error('Error during transaction post:', error);
      if (error.response?.data) {
        alert(`Server error: ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert('An error occurred while adding the transaction.');
      }
    }
  };
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
 
    if (showRecentOnly) {
      const latest = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return tx === latest;
    }
 
    if (start && txDate < start) return false;
    if (end && txDate > end) return false;
    return true;
  });
 
  const totalDebit = filteredTransactions.reduce((sum, tx) => sum + (parseFloat(tx.debit) || 0), 0);
  const totalCredit = filteredTransactions.reduce((sum, tx) => sum + (parseFloat(tx.credit) || 0), 0);
 
  useEffect(() => {
    fetchSupplierDetails();
  }, [supplierId]);
 
  return (
    <Container className={styles.container}>
      {onBack && (
        <button className="btn btn-outline-secondary mb-3" onClick={onBack}>
          ← Back to Supplier List
        </button>
      )}
 
      <h3 className="mb-4">Supplier Details</h3>
 
      <Row>
        <Col className={`p-3 mt-2 ${styles.Details}`}>
          <h6>{supplier.name || 'Supplier Name'}</h6>
          <p>Email: {supplier.email || '-'}</p>
          <p>Phone: {supplier.phone || '-'}</p>
          <p>Supplied Products: {(supplier.supplied_products || []).join(', ')}</p>
          <p style={{ color: '#37FF4E' }}>
            Current Balance: {`\u20B9 ${supplier.current_balance?.toFixed(2)}` || '0.00'}
          </p>
        </Col>
      </Row>
 
      <Row>
        <Col className={`mt-4 p-3 ${styles.trasactionStyle}`}>
          <h5>Add New Transaction</h5>
          <Form onSubmit={handleAddTransaction}>
            <Row className="mb-3">
              <Col>
                <Form.Label>Date</Form.Label>
                <Form.Control name="date" type="date" value={formData.date} onChange={handleInputChange} />
              </Col>
              <Col>
                <Form.Label>Description</Form.Label>
                <Form.Control name="description" type="text" value={formData.description} onChange={handleInputChange} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Amount</Form.Label>
                <Form.Control name="amount" type="number" value={formData.amount} onChange={handleInputChange} />
              </Col>
              <Col>
                <Form.Label>Due On</Form.Label>
                <Form.Control name="due_on" type="date" value={formData.due_on} onChange={handleInputChange} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Label>Due Date Amount</Form.Label>
                <Form.Control name="due_date_amount" type="number" value={formData.due_date_amount} onChange={handleInputChange} />
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Row><Form.Label>Transaction Type</Form.Label></Row>
              <Row className='m-2'>
                <Form.Check type="radio" label="Debit(Increase balance)" value="debit" name="transaction_type" onChange={handleInputChange} inline />
              </Row>
              <Row className='m-2'>
                <Form.Check type="radio" label="Credit (Decrease balance)" value="credit" name="transaction_type" onChange={handleInputChange} inline />
              </Row>
            </Form.Group>
            <Form.Group>
              <Form.Label>Payment Mode</Form.Label>
              <Form.Select
                name="payment_mode"
                value={formData.payment_mode}
                onChange={handleInputChange}
              >
                <option value="">Select Payment Mode</option>
                <option value={payment_mode.CASH}>Cash</option>
                <option value={payment_mode.DEBIT_CREDIT_CARD}>Debit/Credit Card</option>
                <option value={payment_mode.UPI}>UPI</option>
                <option value={payment_mode.MULTIPLE_CASH_CARD}>Multiple (Cash + Card)</option>
                <option value={payment_mode.MULTIPLE_CASH_UPI}>Multiple (Cash + UPI)</option>
              </Form.Select>
            </Form.Group>
 
            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-dark">Add Transaction</button>
            </div>
          </Form>
        </Col>
      </Row>
 
      <Row className="mt-5 border rounded p-4 bg-white">
        <h5>Transaction History</h5>
 
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>From Date</Form.Label>
              <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>To Date</Form.Label>
              <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <button className={`btn mt-2 ${styles.solidClearBtn}`} onClick={() => {
              setStartDate('');
              setEndDate('');
              setShowRecentOnly(false);
            }}>
              Clear
            </button>
          </Col>
        </Row>
 
        <Table hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Payment Mode</th>
              <th>Balance</th>
              <th>Due On</th>
              <th>Overdue By</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, index) => (
              <tr key={index}>
                <td>{tx.date}</td>
                <td>{tx.description}</td>
                <td>{tx.amount}</td>
                <td>{tx.debit !== '-' ? `${tx.debit}` : '-'}</td>
                <td>{tx.credit !== '-' ? `${tx.credit}` : '-'}</td>
                <td>{tx.payment_mode}</td>
                <td>{tx.balance}</td>
                <td>{tx.due_on}</td>
                <td>{tx.overdue_by_days}</td>
              </tr>
            ))}
          </tbody>
        </Table>
 
        <Row className="mt-3">
          <Col className="fw-bold">Total Debit: <span className="text-success">{`\u20B9 ${totalDebit.toFixed(2)}`}</span></Col>
          <Col className="fw-bold text-end">Total Credit: <span className="text-primary">{`\u20B9 ${totalCredit.toFixed(2)}`}</span></Col>
        </Row>
      </Row>
    </Container>
  );
};
 
export default SupplierDetails;