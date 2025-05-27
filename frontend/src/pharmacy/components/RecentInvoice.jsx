import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import RInvoice from '../css/RecentInvoice.module.css';
import axios from 'axios';
import api from '../../utils/axiosInstance';

const RecentInvoice = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromType, setFromType] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Summary totals from backend totals object
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDiscountAmount, setTotalDiscountAmount] = useState(0);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);
  const [totalNetAmount, setTotalNetAmount] = useState(0);

  // Extract totals from backend summary object
  const setTotalsFromBackend = (totals) => {
    setTotalAmount(totals.total_amount || 0);
    setTotalDiscountAmount(totals.total_discount_amount || 0);
    setTotalAfterDiscount(totals.total_after_discount_amount || 0);
    setTotalNetAmount(totals.total_net_amount || 0);
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('p_invoice/pharmacy/recent-invoices/');
        console.log("recent invioce fetched successfully",response.data)
        // Your backend sends data inside response.data.data
        const data = response.data?.data || [];
        setInvoices(data);
        setFilteredInvoices(data);

        // Set totals from backend if present
        if (response.data?.totals) {
          setTotalsFromBackend(response.data.totals);
        } else {
          // fallback: calculate totals locally
          calculateSummary(data);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch invoices.');
        setLoading(false);
        console.error("Failed to fetch recent invoices:", err);
      }
    };

    fetchInvoices();
  }, []);

  // Filter invoices by date, appointment_type, payment mode
  const handleFilter = () => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    let filtered = [...invoices];

    if (from && to) {
      filtered = filtered.filter(inv => {
        const billDate = new Date(inv.Bill_Date);
        return billDate >= from && billDate <= to;
      });
    }

    if (fromType) {
      filtered = filtered.filter(inv =>
        inv.appointment_type?.toLowerCase() === fromType.toLowerCase()
      );
    }

    if (paymentMode) {
      filtered = filtered.filter(inv =>
        (inv.typeof_transaction || '').toLowerCase() === paymentMode.toLowerCase()
      );
    }

    if (selectedOption === 'option1') {
      // Sort by date desc
      filtered.sort((a, b) => new Date(b.Bill_Date) - new Date(a.Bill_Date));
    } else if (selectedOption === 'option2') {
      // Sort by paid_amount desc
      filtered.sort((a, b) => parseFloat(b.paid_amount) - parseFloat(a.paid_amount));
    }

    setFilteredInvoices(filtered);
    calculateSummary(filtered);
  };

  // Calculate totals locally if backend totals not available
  const calculateSummary = (data) => {
    let amountSum = 0;
    let discountSum = 0;
    let afterDiscountSum = 0;
    let netSum = 0;

    data.forEach(inv => {
      inv.items.forEach(item => {
        amountSum += parseFloat(item.amount || 0);
        discountSum += parseFloat(item.discount_amount || 0);
        afterDiscountSum += (parseFloat(item.amount || 0) - parseFloat(item.discount_amount || 0));
        netSum += parseFloat(item.net_amount || 0);
      });
    });

    setTotalAmount(amountSum);
    setTotalDiscountAmount(discountSum);
    setTotalAfterDiscount(afterDiscountSum);
    setTotalNetAmount(netSum);
  };

  useEffect(() => {
    if (!loading && invoices.length > 0) {
      handleFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption]);

  const handleClear = () => {
    setFromType('');
    setPaymentMode('');
    setFromDate('');
    setToDate('');
    setSelectedOption('');
    setFilteredInvoices(invoices);
    calculateSummary(invoices);
  };

  const headercolor = {
    color: 'white',
    backgroundColor: '#002072',
  };

  if (loading) return <p>Loading recent invoices...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container>
      <Row>
        <Col className="d-flex gap-4 flex-wrap">
         <Form.Group>
            <Form.Label>Appointment Type</Form.Label>
            <Form.Control
              className="w-100 border border-secondary"
              value={fromType}
              onChange={(e) => setFromType(e.target.value)}
              placeholder="Enter appointment type"
            />
          </Form.Group>

            <Form.Group>
            <Form.Label>Pay Mode</Form.Label>
            <Form.Control
              type="text"
              className="w-75 border border-secondary"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              placeholder="Enter transaction mode"
            />
          </Form.Group>

         <Form.Group>
            <Form.Label>From Date</Form.Label>
            <Form.Control
              type="date"
              className="w-75 border border-secondary"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Form.Group>

           <Form.Group>
            <Form.Label>To Date</Form.Label>
            <Form.Control
              type="date"
              className="w-75 border border-secondary"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

       <Row className="justify-content-start">
        <Col md={6} className="mt-5 border border-secondary rounded mb-5 p-2">
          <div className="d-flex">
            <label className="ms-4">
              <input
                type="radio"
                name="option"
                value="option1"
                checked={selectedOption === 'option1'}
                onChange={(e) => setSelectedOption(e.target.value)}
                style={{ transform: "scale(1.5)", marginRight: "8px" }}
              />{' '}
              From Date
            </label>

            <label className="ms-4">
              <input
                type="radio"
                name="option"
                value="option2"
                checked={selectedOption === 'option2'}
                onChange={(e) => setSelectedOption(e.target.value)}
                style={{ transform: "scale(1.5)", marginRight: "8px" }}
              />{' '}
              Amount Wise
            </label>
          </div>
        </Col>

       <Col className={`mt-5 d-flex justify-content-end ${RInvoice.twobuttons}`}>
          <Button className={`h-50 px-5 text-dark border border-light ${RInvoice.clear}`} onClick={handleClear}>
            Clear
          </Button>
          <Button className={`h-50 ms-5 px-5 ${RInvoice.submit}`} style={headercolor} onClick={handleFilter}>
            Submit
          </Button>
        </Col>
      </Row>
      <Row>
        <div
          style={{
            maxHeight: filteredInvoices.length > 6 ? '520px' : 'auto',
            overflowY: filteredInvoices.length > 8 ? 'scroll' : 'visible',
           
          }}
        >
          <Table bordered responsive className="mb-0">
            <thead>
              <tr>
                <th style={headercolor}>S.No</th>
                <th style={headercolor}>Bill No</th>
                <th style={headercolor}>Bill Date</th>
                <th style={headercolor}>Pay Mode</th>
                <th style={headercolor}>Appointment Type</th>
                <th style={headercolor}>Patient Name</th>
                <th style={headercolor}>Amount</th>
                <th style={headercolor}>After Discount</th>
                <th style={headercolor}>Discount Amount</th>
                <th style={headercolor}>Net Amount</th>
                <th style={headercolor}>Due Amount</th>
                <th style={headercolor}>Current Due</th>
              </tr>
            </thead>
            {/* <tbody>
              {filteredInvoices.map((invoice, index) => (
                <tr key={invoice.id || index}>
                  <td>{index + 1}</td>
                  <td>{invoice.Bill_No || ''}</td>
                  <td>{invoice.Bill_Date}</td>
                  <td>{invoice.typeof_transaction || ''}</td>
                  <td>{invoice.appointment_type || ''}</td>
                  <td>{invoice.patient_name || ''}</td>
                  <td>{parseFloat(invoice.amount || 0).toFixed(2)}</td>
                  <td>{parseFloat(invoice.paid_amount|| 0).toFixed(2)}</td>
                  <td>{parseFloat(invoice.discount_amount || 0).toFixed(2)}</td>
                  <td>{parseFloat(invoice.net_amount || 0).toFixed(2)}</td>
                  <td>{parseFloat(invoice.Dueamt || 0).toFixed(2)}</td>
                  <td>{parseFloat(invoice.Currdue || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody> */}

            <tbody>
              {filteredInvoices.map((invoice, index) =>
                invoice.items.map((item, itemIdx) => (
                  <tr key={`${invoice.id}-${itemIdx}`}>
                    <td>{index + 1}</td>
                    <td>{invoice.Bill_No || ''}</td>
                    <td>{invoice.Bill_Date}</td>
                    <td>{invoice.typeof_transaction || ''}</td>
                    <td>{invoice.appointment_type || ''}</td>
                    <td>{invoice.patient_name || ''}</td>
                    <td>{parseFloat(item.amount || 0).toFixed(2)}</td>
                    <td>{(parseFloat(item.amount || 0) - parseFloat(item.discount_amount || 0)).toFixed(2)}</td>
                    <td>{parseFloat(item.discount_amount || 0).toFixed(2)}</td>
                    <td>{parseFloat(item.net_amount || 0).toFixed(2)}</td>
                    <td>{parseFloat(invoice.Dueamt || 0).toFixed(2)}</td>
                    <td>{parseFloat(invoice.Currdue || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>

          </Table>
        </div>
      </Row>

       <Row className="mb-3 mt-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Total Amount</Form.Label>
            <Form.Control className="w-75" value={totalAmount.toFixed(2)} readOnly />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Total After Discount</Form.Label>
            <Form.Control className="w-75" value={totalAfterDiscount.toFixed(2)} readOnly />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Total Discount Amount</Form.Label>
            <Form.Control className="w-75" value={totalDiscountAmount.toFixed(2)} readOnly />
          </Form.Group>
        </Col>
      </Row>

    </Container>
  );
};

export default RecentInvoice;