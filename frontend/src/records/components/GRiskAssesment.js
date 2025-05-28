import React, { useEffect, useState } from "react";
import { Form, Row, Col, Card, Container, Alert } from "react-bootstrap";
import api from "../../utils/axiosInstance";
import riskStyles from "../css/GRiskAssesment.module.css";
import { Icon } from "@iconify/react";

const GRiskAssesment = ({ patient }) => {
  const [riskFactors, setRiskFactors] = useState({});
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [combinedScore, setCombindScore] = useState(0);

  const fieldLabels = {
    minor_surgery: "Minor Surgery",
    age_40_to_60_yrs: "Age 40-60 yrs",
    pregnancy_or_post_martum: "Pregnancy or Post Partum (<1 month)",
    varicose_veins: "Varicose Veins",
    inflammatory_bowel_disease: "Inflammatory Bowel Disease",
    obesity: "Obesity (>20% of Ideal BW)",
    combined_oral: "Combined Oral",
    contraceptives_or_HRT: "Contraceptives/HRT",
    // Add more labels as needed...
  };

 const fetchRiskFactors = async () => {
    if (!patient?.patient_id) return;

    
      try {
        const response = await api.get(
          `/records/get-multiple-risk-factors/${patient.patient_id}/`
        );

        if (response.data.success) {
          setRiskFactors(response.data.data);
          setCombindScore(response.data.data.combined_total_score || 0);
          setNoData(false);
        } else {
          setNoData(true);
        }
      } catch (error) {
        console.error("Error fetching risk factors:", error);
        setNoData(true);
        setErrorMessage("Error fetching risk factors.");
      } finally {
        setLoading(false);
      }
    };

     useEffect(() => {
    fetchRiskFactors();
    const handleRefresh = () => fetchRiskFactors(); // Refresh on event
 
    window.addEventListener("refreshRiskAssessment ", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshRiskAssessment ", handleRefresh);
    };

  }, [patient]);

  const renderCheckboxes = (factorKey, factorDataArray) => {
    if (!Array.isArray(factorDataArray) || factorDataArray.length === 0) return null;

    const factorData = factorDataArray[0];
    if (!factorData) return null;

    const fields = Object.entries(factorData).filter(
      ([key]) =>
        !["id", "patient_id", "created_at", "updated_at", "total_score"].includes(key)
    );

    return fields.map(([key, value], idx) => {
      const label = fieldLabels[key] || key;
      return (
        <Col xs={12} sm={6} key={idx} className="gy-3 gx-4">
          <Form.Check
            type="checkbox"
            label={label}
            checked={value}
            readOnly
            disabled
            className={riskStyles.checkCon}
          />
        </Col>
      );
    });
  };

  if (loading) return <p>Loading risk factors...</p>;

  if (noData) {
    return (
      <div className="mb-4">
        <Alert variant="warning">
          No risk assessment data found for patient{" "}
          {patient?.patient_id || "with this ID"}.
        </Alert>
      </div>
    );
  }

  return (
    <Container className={`mt-4 ${riskStyles.main}`}>
      <h6 className={riskStyles.totalScore}>Total Risk Score :{combinedScore}</h6>
      <Form>
        {Object.keys(riskFactors).map((factorKey, index) => {
          if (factorKey === "combined_total_score") return null;

          return (
            <Card key={index} className="mb-3">
              <Card.Body>
                <Card.Title className={riskStyles.riskfactor}>
                  Risk Factor {factorKey.replace("risk_factor_", "")}
                </Card.Title>
                <Row>{renderCheckboxes(factorKey, riskFactors[factorKey])}</Row>
                <Row>
                  <Col className="d-flex justify-content-end">
                    <p className="mt-2">
                      Score: {riskFactors[factorKey][0]?.total_score || 0}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}
      </Form>
    </Container>
  );
};

export default GRiskAssesment;
