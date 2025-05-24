import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/axiosInstance";
import { Form, Row, Col, Container, Button, Alert } from "react-bootstrap";
import styles from "../css/PainAssesment.module.css";
import { motion } from "framer-motion";

const PainAssessment = ({ handleClose, patientId }) => {
  const [painIntensity, setPainIntensity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef(null);
  const [formData, setFormData] = useState({
    location_of_service: "",
    quality_of_service: "",
    character_of_service: [],
    factors_affecting_rating: "",
    factors_improving_experience: [],
  });

  useEffect(() => {
    if (formData.factors_improving_experience.includes("reset")) {
      setFormData((prev) => ({
        ...prev,
        quality_of_service: "",
        character_of_service: [],
      }));
    }
  }, [formData.factors_improving_experience]);

  const updateQuality = (value) => {
    setFormData((prev) => ({
      ...prev,
      quality_of_service: value,
      factors_improving_experience: prev.factors_improving_experience.filter(
        (f) => f !== "reset"
      ),
    }));
  };

  const updateCharacter = (option, checked) => {
    const updatedCharacter = checked
      ? [...formData.character_of_service, option]
      : formData.character_of_service.filter((c) => c !== option);
    const updatedFactors = formData.factors_improving_experience.filter(
      (f) => f !== "reset"
    );

    setFormData({
      ...formData,
      character_of_service: updatedCharacter,
      factors_improving_experience: updatedFactors,
    });
  };

  // const updatePainIntensity = (event) => {
  //   if (!progressRef.current) return;
  //   const rect = progressRef.current.getBoundingClientRect();
  //   const clickX = event.clientX - rect.left;
  //   let newPainLevel = Math.round((clickX / rect.width) * 20) / 2;
  //   newPainLevel = Math.max(0, Math.min(10, newPainLevel));
  //   setPainIntensity(newPainLevel);
  // };

  const updatePainIntensity = (event) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
  
    // Change to whole number steps from 0 to 10
    let newPainLevel = Math.round((clickX / rect.width) * 10);
  
    // Clamp between 0 and 10
    newPainLevel = Math.max(0, Math.min(10, newPainLevel));
  
    setPainIntensity(newPainLevel);
  };
  

  const handleMouseDown = (event) => {
    setIsDragging(true);
    updatePainIntensity(event);
  };

  const handleMouseMove = (event) => {
    if (isDragging) updatePainIntensity(event);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {  
      patient_id: patientId,// ✅ Matches serializer expecting patient.patient_id
      pain_intensity: painIntensity,
      location_of_service: formData.location_of_service,
      quality_of_service: formData.quality_of_service,
      character_of_service: formData.character_of_service,
      factors_affecting_rating: formData.factors_affecting_rating,
      factors_improving_experience: formData.factors_improving_experience,
    };

    try {
      const response = await api.post(
        "/records/create-pain-assessment/",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("API Response:", response.data);
        alert(`Pain assessment for patient ${patientId} saved successfully!`);
        handleClose();
      } 
    } catch (error) {
      console.error("Error saving nursing note:", error);
      setMessage("Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-5">
      <Form onSubmit={handleSubmit}>
        <Container className="mt-4">
          <h5 className="fw-bold">Pain Assessment</h5>
          <p className="text-muted">Pain Intensity (0-10)</p>

          <div className="d-flex justify-content-between mb-4 mx-2">
            {[...Array(21).keys()].map((num) => {
              const value = num / 2;
              return (
                <span
                  key={value}
                  style={{
                    cursor: "pointer",
                    fontSize: num % 2 === 0 ? "16px" : "12px",
                  }}
                  onClick={() => setPainIntensity(value)}
                >
                  {num % 2 === 0 ? value : ""}
                </span>
              );
            })}
          </div>

          <div
            ref={progressRef}
            className="position-relative mt-2"
            style={{
              height: "8px",
              background: "#ddd",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onMouseDown={handleMouseDown}
          >
            <motion.div
              animate={{ width: `${(painIntensity / 10) * 100}%` }}
              transition={{ duration: 0.2 }}
              style={{
                height: "8px",
                backgroundColor: "blue",
                borderRadius: "2px",
              }}
            />
            {[...Array(21).keys()].map((num) => {
              const value = num / 2;
              const isSelected = value === painIntensity;
              return (
                <motion.div
                  key={value}
                  whileHover={{
                    scale: 1.6,
                    backgroundColor: "blue",
                    top: num % 2 === 0 ? "-8px" : "-4px",
                  }}
                  animate={{
                    backgroundColor: value <= painIntensity ? "blue" : "gray",
                    scale: isSelected ? 2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: "absolute",
                    left: `${(value / 10) * 100}%`,
                    width: "2px",
                    height:
                      num % 2 === 0
                        ? isSelected
                          ? "25px"
                          : "20px"
                        : isSelected
                        ? "20px"
                        : "15px",
                    top: num % 2 === 0 ? "-8px" : "-4px",
                    background: value <= painIntensity ? "blue" : "gray",
                    borderRadius: "2px",
                    transform: "translateX(-50%)",
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </div>

          <div className="d-flex justify-content-between mt-4 mx-2">
            <span>No Pain</span>
            <span>Worst Possible Pain</span>
          </div>

          {message && <p className="mt-2 text-danger">{message}</p>}
        </Container>

        <div className="container mt-4 p-4">
          <Row className="pt-4">
            <Form.Group as={Col}>
              <Form.Label className={styles.headings}>Location of service</Form.Label>
              <Form.Control
                type="text"
                value={formData.location_of_service}
                onChange={(e) =>
                  setFormData({ ...formData, location_of_service: e.target.value })
                }
                placeholder="Specify Feedback Location"
                required
              />
            </Form.Group>
          </Row>

          <Row className="pt-4 pb-2">
            <Col className={styles.headings}>Quality Of Service</Col>
          </Row>
          <Row>
            <Col className="d-flex">
              {[
                { label: "Constant Feedback", value: "constant" },
                { label: "Intermittent Feedback", value: "intermittent" },
              ].map((opt) => (
                <Form.Check
                  key={opt.value}
                  inline
                  label={opt.label}
                  type="radio"
                  name="quality"
                  checked={formData.quality_of_service === opt.value}
                  onChange={() => updateQuality(opt.value)}
                />
              ))}
            </Col>
          </Row>

          <Row className="pt-4 pb-2">
            <Col className={styles.headings}>Character of Service</Col>
          </Row>
          <Row>
            <Col className="d-flex">
              {[
                { label: "Lacerating Feedback", value: "lacerating" },
                { label: "Burning Feedback", value: "burning" },
                { label: "Radiating Feedback", value: "radiating" },
              ].map((opt) => (
                <Form.Check
                  key={opt.value}
                  inline
                  label={opt.label}
                  type="checkbox"
                  className={styles.inputCkeck}
                  checked={formData.character_of_service.includes(opt.value)}
                  onChange={(e) => updateCharacter(opt.value, e.target.checked)}
                />
              ))}
            </Col>
          </Row>

          <Row className="pt-4">
            <Form.Group as={Col}>
              <Form.Label className={styles.headings}>Factors Affecting Rating</Form.Label>
              <Form.Control
                type="text"
                value={formData.factors_affecting_rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    factors_affecting_rating: e.target.value,
                  })
                }
                placeholder="What Affected Your Rating?"
                required
              />
            </Form.Group>
          </Row>

          <Row className="pt-4">
            <Col className={styles.headings}>Factors Improving Experience</Col>
          </Row>
          <Row className="pt-2">
            <Col className="d-flex">
              {[
                { label: "Reset Feedback", value: "reset" },
                { label: "Medication Feedback", value: "medication" },
              ].map((opt) => (
                <Form.Check
                  key={opt.value}
                  inline
                  label={opt.label}
                  type="checkbox"
                  className={styles.inputCkeck}
                  checked={formData.factors_improving_experience.includes(opt.value)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newFactors = checked
                      ? [...formData.factors_improving_experience, opt.value]
                      : formData.factors_improving_experience.filter((f) => f !== opt.value);
                    setFormData({
                      ...formData,
                      factors_improving_experience: newFactors,
                    });
                  }}
                />
              ))}
            </Col>
          </Row>
        </div>

        <Row>
          <div className="d-flex justify-content-end px-4 pb-5">
            <button type="button" className={`pl-4 mx-4 ${styles.cancel}`} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={`pl-4 ${styles.savebutton}`} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </Row>
      </Form>
    </div>
  );
};

export default PainAssessment;
