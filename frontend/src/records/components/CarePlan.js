import {  Form ,Row} from "react-bootstrap";
import api from "../../utils/axiosInstance";
import React, { useState } from "react";
import CareplanStyles from '../css/CarePlan.module.css'
const CarePlan= ({ show, handleClose,patientId })  =>{
  
  const [formData, setFormData] = useState({
    feedback_on_services: "",
    provisional_feedback: "",
    feedback_plan: "",
    expected_outcome: "",
    preventive_feedback_aspects: "",
  
  });
 
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/records/create-careplan/", 
         {patient:patientId, 
          feedback_on_services:formData.feedback_on_services,
          provisional_feedback:formData.provisional_feedback,
          feedback_plan:formData.feedback_plan,
          expected_outcome:formData.expected_outcome,
          preventive_feedback_aspects:formData.preventive_feedback_aspects

         },
         { headers: { "Content-Type": "application/json" }},
         
      );
       window.dispatchEvent(new Event("refreshCarePlan"));
      
      console.log('Response:', response.data);
      alert('Form submitted successfully!');
      handleClose();
    
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Failed to register patient");
    }

    handleClose();
  };

  return (
   <div className={`container ${CareplanStyles.main}`}>
         <Form.Label className={CareplanStyles.careplan}>Care Plan Feedback</Form.Label>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Feedback on Services</Form.Label>
            <Form.Control as="textarea" rows={3} name="feedback_on_services" value={formData.feedback_on_services} onChange={handleChange} placeholder="Enter Feedback Details" style={{resize:'none'}} required/>
          </Form.Group>
         
          <Form.Group className="mb-3">
            <Form.Label>Provisional Feedback</Form.Label>
            <Form.Control as="textarea" rows={3} name="provisional_feedback" value={formData.provisional_feedback} onChange={handleChange} placeholder="Enter Overall Rating" style={{resize:'none'}} required/>
          </Form.Group>
          
         <Form.Group className="mb-3">
            <Form.Label>Feedback Plan</Form.Label>
            <Form.Control as="textarea" rows={3} name="feedback_plan" value={formData.feedback_plan} onChange={handleChange} placeholder="Enter Suggestions" style={{resize:'none'}} required/>
          </Form.Group>

           <Form.Group className="mb-3">
            <Form.Label>Expected Outcome of Feedback</Form.Label>
            <Form.Control as="textarea" rows={3} name="expected_outcome" value={formData.expected_outcome} onChange={handleChange} placeholder="Enter Comments" style={{resize:'none'}} required/>
          </Form.Group>
          
            <Form.Group className="mb-3">
            <Form.Label>Preventive Feedback Aspects</Form.Label>
            <Form.Control as="textarea" rows={3} name="preventive_feedback_aspects"   value={formData.preventive_feedback_aspects}onChange={handleChange} placeholder="Enter Improvement Areas" style={{resize:'none'}}  required/>
          </Form.Group>
          
          <Row>
                  <div className={`d-flex justify-content-end gap-4 ps-5 ${CareplanStyles.sumbit}`}>
                    <button className={`px-2 ${CareplanStyles.cancel}`} onClick={handleClose}>Cancel</button>
                    <button type="submit" className={CareplanStyles.savebutton}>Save</button>
                  </div>
              </Row>
       
        </Form>
        </div>

  )
}

export default CarePlan