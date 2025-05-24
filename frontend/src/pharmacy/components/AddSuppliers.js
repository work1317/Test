import React, { useState } from 'react';
import api from "../../utils/axiosInstance";
import { Modal, Form, Row, Col, InputGroup, Button } from 'react-bootstrap';
import { Icon } from "@iconify/react";
import styles from '../css/AddSuppliers.module.css';

function AddSuppliers({ show, handleClose }) {
    const [supplydata, setSupplyData] = useState({
        name: '',
        email: '',
        phone: '',
        products: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setSupplyData({ ...supplydata, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/pharmacy/add_supplier/', supplydata, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Response:', response.data);
            if (response.data.success === 1) {
                alert('Supplier added successfully');
                setSupplyData({ name: '', email: '', phone: '', products: '' }); // Reset form
                handleClose(); // Close modal
            }else if(response.data.success === 0){
              alert(response.data.message)
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
            alert('Failed to add supplier. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show}>
            <div className='p-4'>
                <Row>
                    <Col><Modal.Title>Add New Supplier</Modal.Title></Col>
                    <Col xs='auto'>
                        <button className="border-0 btn btn-outline" onClick={handleClose}>
                            <Icon icon="carbon:close-outline" width="25" height="25" color="#9A9A9A" />
                        </button>
                    </Col>
                </Row>
                <Row className='text-muted'>
                    <p>Enter the details of the new supplier here. Click save when you're done.</p>
                </Row>
                <Form onSubmit={handleSubmit}>
                    <Row className='mt-2'>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <InputGroup>
                                <Form.Control name="name" value={supplydata.name} placeholder='Supplier Name' onChange={handleChange} required />
                            </InputGroup>
                        </Form.Group>
                    </Row>
                    <Row className='mt-2'>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <InputGroup>
                                <Form.Control name="email" value={supplydata.email} placeholder='Email Address' onChange={handleChange} required />
                            </InputGroup>
                        </Form.Group>
                    </Row>
                    <Row className='mt-2'>
                        <Form.Group>
                            <Form.Label>Phone</Form.Label>
                            <InputGroup>
                                <Form.Control name="phone" value={supplydata.phone} placeholder='Phone number' onChange={handleChange} required />
                            </InputGroup>
                        </Form.Group>
                    </Row>
                    <Row className='mt-2'>
                        <Form.Group>
                            <Form.Label>Products</Form.Label>
                            <InputGroup>
                                <Form.Control name="products" value={supplydata.products} placeholder='Supplied Products' onChange={handleChange} required />
                            </InputGroup>
                        </Form.Group>
                    </Row>
                    <div className='d-flex justify-content-end mt-4'>
                        <button type='submit' className={`d-flex justify-content-end ${styles.save}`} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Supplier'}
                        </button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}

export default AddSuppliers;
