// import React, { useState } from "react";
// import { Form, Row, Col, Card, Container } from "react-bootstrap";
// import riskStyles from "../css/RiskAssesment.module.css";
// import axios from 'axios';

// const RiskAssessment = ({ handleClose, patientId }) => {
//   const [scores, setScores] = useState({
//     RiskFactor1: 0,
//     RiskFactor2: 0,
//     RiskFactor3: 0,
//     RiskFactor4: 0,
//   });

//   const [totalScore, setTotalScore] = useState(0);
//   const [selectedChecks, setSelectedChecks] = useState({});

//   const riskFactors = {
//     RiskFactor1: {
//       value: 1,
//       labels: {
//         "Minor Surgery": "minor_surgery",
//         "Age 40-60 yrs": "age_40_60_yrs",
//         "Pregnancy or Post Partum (<1 month)": "pregnancy_or_post_partum",
//         "Varicose Veins": "varicose_veins",
//         "Inflammatory Bowel Disease": "inflammatory_bowel_disease",
//         "Obesity (>20% of Ideal BW)": "obesity",
//         "Combined Oral": "combined_oral",
//         "Contraceptives/HRT": "contraceptives_hrt"
//       },
//     },
//     RiskFactor2: {
//       value: 2,
//       labels: {
//         "Age over 60 years": "age_over_60_years",
//         "Malignancy": "malignancy",
//         "Major surgery": "major_surgery",
//         "Immobilising Plaster Cast": "immobilising_plaster_cast",
//         "Medical or surgical": "medical_or_surgical",
//         "Patients Confined to": "patients_confined_to",
//         "Bed 72 hrs": "bed_72_hrs",
//         "Central Venous Access": "central_venous_access"
//       },
//     },
//     RiskFactor3: {
//       value: 3,
//       labels: {
//         "History of DVT/PE": "history_of_dvt_pe",
//         "Myocardial Infarction": "myocardial_infarction",
//         "Congestive Heart Failure": "congestive_heart_failure",
//         "Severe sepsis/Infection": "severe_sepsis_infection",
//         "Factor V Leiden/Activated": "factor_v_leiden_activated",
//         "Protein C Resistance": "protein_c_resistance",
//         "Antithrombin III Deficiency": "antithrombin_iii_deficiency",
//         "Proteins C & S Deficiency": "proteins_c_and_s_deficiency",
//         "Dysfibrinogenemia": "dysfibrinogenemia",
//         "Homocysteinemia": "homocysteinemia",
//         "20210A Prothrombin Mutation": "prothrombin_20210a_mutation",
//         "Lupus Anticoagulant": "lupus_anticoagulant",
//         "Antiphospholipid Antibodies": "antiphospholipid_antibodies",
//         "Myeloproliferative Disorders": "myeloproliferative_disorders"
//       },
//     },
//     RiskFactor4: {
//       value: 5,  // fixed value, assuming typo (was 5) — should be 4 to match risk_factor_id backend
//       labels: {
//         "Elective Major Lower": "elective_major_lower",
//         "Extremity": "extremity",
//         "Arthroplasty": "arthroplasty",
//         "Stroke FeedbackHip, Pelvis or leg Fracture": "stroke_feedbackhip_pelvis_or_leg_fracture",
//         "Stroke": "stroke",
//         "Multiple Trauma": "multiple_trauma",
//         "Acute Spinal Cord Injury": "acute_spinal_cord_injury"
//       },
//     },
//   };

//   const handleCheckboxChange = (factor, value, label) => {
//     const key = `${factor}-${label}`;
//     const isChecked = !selectedChecks[key];

//     setSelectedChecks((prev) => ({ ...prev, [key]: isChecked }));

//     setScores((prev) => {
//       const updated = { ...prev };
//       updated[factor] = isChecked ? prev[factor] + value : prev[factor] - value;
//       setTotalScore(Object.values(updated).reduce((acc, curr) => acc + curr, 0));
//       return updated;
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const risk_factors = Object.keys(riskFactors).map((factorKey) => {
//       const risk_factor_id = parseInt(factorKey.replace("RiskFactor", ""));
//       const fields = {};

//       Object.entries(riskFactors[factorKey].labels).forEach(([labelText, fieldName]) => {
//         const checkboxKey = `${factorKey}-${labelText}`;
//         fields[fieldName] = !!selectedChecks[checkboxKey];
//       });

//       return {
//         risk_factor_id,
//         ...fields
//       };
//     });

//     const payload = {
//       patient_id: patientId,
//       risk_factors
//     };

//     try {
//       const response = await fetch("/records/create-multiple-risk-factors/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
        
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       if (response.ok && data.success === 1) {
//         console.log("Saved successfully:", data);
//         handleClose();
//       } else {
//         console.error("Error:", data.message);
//       }
//     } catch (error) {
//       console.error("Error submitting risk assessment:", error);
//     }
//   };

//   return (
//     <Container className={`mt-4 ${riskStyles.main}`}>
//       <Form onSubmit={handleSubmit}>
//         {Object.keys(riskFactors).map((factor, index) => (
//           <Card key={index} className="mb-3">
//             <Card.Body>
//               <Card.Title className={riskStyles.riskfactor}>
//                 Risk Factor {factor.replace("RiskFactor", "")}
//               </Card.Title>
//               <Row>
//                 {Object.entries(riskFactors[factor].labels).map(([labelText], idx) => (
//                   <Col xs={12} sm={6} key={idx} className="gy-3 gx-4">
//                     <Form.Check
//                       type="checkbox"
//                       label={labelText}
//                       onChange={() =>
//                         handleCheckboxChange(factor, riskFactors[factor].value, labelText)
//                       }
//                       checked={selectedChecks[`${factor}-${labelText}`] || false}
//                       className={riskStyles.checkCon}
//                     />
//                   </Col>
//                 ))}
//               </Row>
//               <Row>
//                 <Col className="d-flex justify-content-end">
//                   <p className="mt-2">Score: {scores[factor]}</p>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         ))}
//         <Row>
//           <div className={`d-flex justify-content-end gap-4 ps-5 ${riskStyles.sumbit}`}>
//             <button type="button" className={`px-2 ${riskStyles.cancel}`} onClick={handleClose}>
//               Cancel
//             </button>
//             <button type="submit" className={riskStyles.savebutton}>
//               Save
//             </button>
//           </div>
//         </Row>
//       </Form>
//     </Container>
//   );
// };

// export default RiskAssessment;



import React, { useState } from "react";
import { Form, Row, Col, Card, Container } from "react-bootstrap";
import riskStyles from "../css/RiskAssesment.module.css";
import axios from 'axios';
import api from "../../utils/axiosInstance";

const RiskAssessment = ({ handleClose, patientId }) => {
  const [scores, setScores] = useState({
    RiskFactor1: 0,
    RiskFactor2: 0,
    RiskFactor3: 0,
    RiskFactor4: 0,
  });

  const [totalScore, setTotalScore] = useState(0);
  const [selectedChecks, setSelectedChecks] = useState({});

  const riskFactors = {
    RiskFactor1: {
      value: 1,
      labels: {
        "Minor Surgery": "minor_surgery",
        "Age 40-60 yrs": "age_40_to_60_yrs",
        "Pregnancy or Post Partum (<1 month)": "pregnancy_or_post_martum",
        "Varicose Veins": "varicose_veins",
        "Inflammatory Bowel Disease": "inflammatory_bowel_disease",
        "Obesity (>20% of Ideal BW)": "obesity",
        "Combined Oral": "combined_oral",
        "Contraceptives/HRT": "contraceptives_or_HRT"
      },
    },
    RiskFactor2: {
      value: 2,
      labels: {
        "Age over 60 years": "age_over_60_yrs",
        "Malignancy": "malignancy",
        "Major surgery": "major_surgery",
        "Immobilising Plaster Cast": "immobilising_plaster_cast",
        "Medical or surgical": "medical_or_surgical",
        "Patients Confined to": "patients_confined_to",
        "Bed 72 hrs": "bed_72_hrs",
        "Central Venous Access": "central_venous_access"
      },
    },
    RiskFactor3: {
      value: 3,
      labels: {
        "History of DVT/PE": "history_of_DVT_or_PE",
        "Myocardial Infarction": "myocardial_infarction",
        "Congestive Heart Failure": "congestive_heart_failure",
        "Severe sepsis/Infection": "severe_sepsis_or_infection",
        "Factor V Leiden/Activated": "factor_V_leiden_or_activated",
        "Protein C Resistance": "protein_C_resistance",
        "Antithrombin III Deficiency": "antithrombin_III_deficiency",
        "Proteins C & S Deficiency": "proteins_C_and_S_deficiency",
        "Dysfibrinogenemia": "dysfibrinogenemia",
        "Homocysteinemia": "homocysteinemia",
        "20210A Prothrombin Mutation": "prothrombin_mutation_20210A",
        "Lupus Anticoagulant": "lupus_anticoagulant",
        "Antiphospholipid Antibodies": "antiphospholipid_antibodies",
        "Myeloproliferative Disorders": "myeloproliferative_disorders"
      },
    },
    RiskFactor4: {
      value: 5,
      labels: {
        "Elective Major Lower": "elective_major_lower",
        "Extremity": "extremity",
        "Arthroplasty": "arthroplasty",
        "Stroke FeedbackHip, Pelvis or leg Fracture": "stroke_feedbackhip_pelvis_or_leg_fracture",
        "Stroke": "stroke",
        "Multiple Trauma": "multiple_trauma",
        "Acute Spinal Cord Injury": "acute_spinal_cord_injury"
      },
    },
  };

  const handleCheckboxChange = (factor, value, label) => {
    const key = `${factor}-${label}`;
    const isChecked = !selectedChecks[key];

    setSelectedChecks((prev) => ({ ...prev, [key]: isChecked }));

    setScores((prev) => {
      const updated = { ...prev };
      updated[factor] = isChecked ? prev[factor] + value : prev[factor] - value;
      setTotalScore(Object.values(updated).reduce((acc, curr) => acc + curr, 0));
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const risk_factors = Object.keys(riskFactors).map((factorKey) => {
      const risk_factor_id = parseInt(factorKey.replace("RiskFactor", ""));
      const fields = {};

      Object.entries(riskFactors[factorKey].labels).forEach(([labelText, fieldName]) => {
        const checkboxKey = `${factorKey}-${labelText}`;
        fields[fieldName] = !!selectedChecks[checkboxKey];
      });

      return {
        risk_factor_id,
        ...fields
      };
    });

    const payload = {
      patient_id: patientId,
      risk_factors
    };

    try {
      const response = await api.post("/records/create-multiple-risk-factors/", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      if (response.status === 200 && data.success === 1) {
        window.dispatchEvent(new Event("refreshRiskAssessment"));
        console.log("Saved successfully:", data);
        handleClose();
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      if (error.response) {
        console.error("Server error:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Submission error:", error.message);
      }
    }
  };

  return (
    <Container className={`mt-4 ${riskStyles.main}`}>
      <Form onSubmit={handleSubmit}>
        {Object.keys(riskFactors).map((factor, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <Card.Title className={riskStyles.riskfactor}>
                Risk Factor {factor.replace("RiskFactor", "")}
              </Card.Title>
              <Row>
                {Object.entries(riskFactors[factor].labels).map(([labelText], idx) => (
                  <Col xs={12} sm={6} key={idx} className="gy-3 gx-4">
                    <Form.Check
                      type="checkbox"
                      label={labelText}
                      onChange={() =>
                        handleCheckboxChange(factor, riskFactors[factor].value, labelText)
                      }
                      checked={selectedChecks[`${factor}-${labelText}`] || false}
                      className={riskStyles.checkCon}
                    />
                  </Col>
                ))}
              </Row>
              <Row>
                <Col className="d-flex justify-content-end">
                  <p className="mt-2">Score: {scores[factor]}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
        <Row>
          <div className={`d-flex justify-content-end gap-4 ps-5 ${riskStyles.sumbit}`}>
            <button type="button" className={`px-2 ${riskStyles.cancel}`} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={riskStyles.savebutton}>
              Save
            </button>
          </div>
        </Row>
      </Form>
    </Container>
  );
};

export default RiskAssessment;
