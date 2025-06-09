import React, { useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { forms } from './Labtest';
import { LuCircleX } from "react-icons/lu";
import styles from '../css/Invoice.module.css';
import { Icon } from "@iconify/react";

function InvoiceForm({ handlerClose, saveButtons, patients }) {
  const { formsData1, setFormsData1 } = useContext(forms);

  const handlerForms = (e) => {
  const { name, value } = e.target;

  // Start with spreading the previous data
  const updatedData = { ...formsData1, [name]: value };

  if (name === "patient_id") {
    const selectedPatient = patients.find(
      (p) => p.patient_id?.toLowerCase() === value.toLowerCase()
    );

    if (selectedPatient) {
      updatedData.patient_name = selectedPatient.patient_name;
    }
  }

  setFormsData1(updatedData);
};


  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.model}>
          <h2>Add New Invoice</h2>
          <div className={styles.butMod} onClick={handlerClose}>
               <Icon icon="carbon:close-outline" height="24" width="24" color="#9A9A9A"/>
          </div>
        </div>

        <div className={styles.forms}>
          <Form>
            <div className="row">
              <div className="col-md-6 mb-3">
              <Form.Group>
               <Form.Label className={`${styles.label}`}>Patient ID:</Form.Label>
                              <Form.Control
                                className={styles.formsCon}
                                type="text"
                                name="patient_id"
                                value={formsData1.patient_id || ''}
                                onChange={handlerForms}
                                placeholder="Enter your ID"
                              />
                            </Form.Group>
                
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Patient Name</Form.Label>
                <Form.Control
                  className={styles.formsCon}
                  type="text"
                  name="patient_name"
                  placeholder="Patient Name"
                  value={formsData1.patient_name || ""}
                  onChange={handlerForms}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Test Name</Form.Label>
                <Form.Control
                  className={styles.formsCon}
                  type="text"
                  name="testname"
                  placeholder="Test Name"
                  value={formsData1.testname}
                  onChange={handlerForms}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  className={styles.formsCon}
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formsData1.amount}
                  onChange={handlerForms}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Status</Form.Label>
                  <Form.Select
                    className={styles.formsCon}
                    name="status"
                    value={formsData1.status}
                    onChange={(e) =>
                      setFormsData1({ ...formsData1, status: e.target.value })
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </Form.Select>
              </div>
              <div className="col-12 mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  className={styles.formsCon1}
                  type="date"
                  name="date"
                  value={formsData1.date}
                  onChange={handlerForms}
                  required
                />
              </div>
            </div>
            <div className={styles.save1}>
              <span onClick={handlerClose}>Cancel</span>
              <Button variant="primary" onClick={saveButtons}>
                Add Invoice
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default InvoiceForm;