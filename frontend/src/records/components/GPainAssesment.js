import React, { useState,useRef, useEffect } from "react";
import api from "../../utils/axiosInstance";
import { Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import styles from "../css/GPainAssesment.module.css";
const PainIntensityBar = ({ painIntensity, setPainIntensity }) => {
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef(null);

  const updatePainIntensity = (event) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    let newPainLevel = Math.round((clickX / rect.width) * 20) / 2;
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

  return (
    <div className="mx-5 mt-4">
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
    </div>
  );
};

const GPainAssesment = ({ patient }) => {
    const [assessment, setAssessment] = useState(null);
    const [message, setMessage] = useState("");
    const [painIntensity, setPainIntensity] = useState(0);
  
    useEffect(() => {
      const fecthingData =  () => {
      if (patient && patient.patient_id) {
        api
          .get(`/records/get-pain-assessment/${patient.patient_id}`)
          .then((response) => {
            if (response.data.success === 1 && response.data.data) {
              const data = response.data.data;
              setAssessment(data);
              setPainIntensity(data.pain_intensity);
              setMessage("");
            } else {
              setAssessment(null);
              setMessage(response.data.message || "No assessment data found.");
            }
          })
          .catch((error) => {
            console.error("Error fetching pain assessment:", error);
            setAssessment(null);
            setMessage(
              error.response?.data?.message || "Failed to fetch initial assessment."
            );
          });
      }
    }
    fecthingData();
     const handleRefresh = () => fecthingData(); // Refresh on event
 
    window.addEventListener("refreshPainAssessment", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshPainAssessment", handleRefresh);
    };

   
    }, [patient]);
  
    return (
        <div className="mb-4">
          {assessment ? (
            <>
              <PainIntensityBar
                painIntensity={painIntensity}
                setPainIntensity={() => {}}
              />
      
              <div className="mt-4 mx-5">
                <Row>
                  <label>Location of Service</label>
                  <p className={styles.firstRow}>{assessment.location_of_service}</p>
                </Row>
      
                <Row className="mt-1">
                  <label className={styles.title}>Quality of Service</label>
                </Row>
                <div className="d-flex mt-2">
                  <div className="me-4">
                    <input
                      type="radio"
                      className={styles.radiowrapper}
                      checked={assessment.quality_of_service === "constant"}
                      readOnly
                    />
                    <label className={styles.labels}>Constant Feedback</label>
                  </div>
                  <div className="me-4">
                    <input
                      type="radio"
                      className={styles.radiowrapper}
                      checked={assessment.quality_of_service === "intermittent"}
                      readOnly
                    />
                    <label className={styles.labels}>Intermittent Feedback</label>
                  </div>
                </div>

      
                <Row className="mt-2">
                    <label className={styles.title}>Character of Service</label>
                    <div className="d-flex mt-2">
                    {["lacerating", "burning", "radiating"].map((type) => {
                            const isChecked = assessment.character_of_service.includes(type);
                            return (
                              <div
                                key={type}
                                className={`${styles.checkboxWrapper} ${isChecked ? styles.checkedBox : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  className={styles.checkboxLarge}
                                />
                                <label className={styles.labels}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)} Feedback
                                </label>
                              </div>
                            );
                          })}
                    </div>
                  </Row>


      
                <Row className="mt-2">
                  <label className={styles.title}>Factors Affecting Rating</label>
                  <p className={styles.firstRow}>{assessment.factors_affecting_rating}</p>
                </Row>
      
                <Row className="mt-2">
                    <label className={styles.title}>Factors Improving Experience</label>
                    <div className="d-flex mt-2">
                      {["reset", "medication"].map((factor) => {
                        const isChecked = assessment.factors_improving_experience.includes(factor);
                        return (
                          <div
                            key={factor}
                            className={`${styles.checkboxWrapper} ${isChecked ? styles.checkedBox : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className={styles.checkboxLarge}
                            />
                            <label className={styles.labels}>
                              {factor.charAt(0).toUpperCase() + factor.slice(1)} Feedback
                            </label>
                          </div>
                        );
                      })}
                    </div>
                </Row>
              </div>
            </>
          ) : (
            <div className="mb-4">
            <p className="alert alert-warning ">{message}</p>
            </div>
          )}
        </div>
      );
      
    
  };
  
  export default GPainAssesment;