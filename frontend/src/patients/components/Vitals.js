import React, { useState, useEffect } from "react";
import { Thermometer, Activity, Heart, Droplet } from "lucide-react";
import api from "../../utils/axiosInstance";
import { Card } from "react-bootstrap";

function Vitals({ patient_id }) {
  const [vitalsList, setVitalsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patient_id) return;

    const fetchVitals = async () => {
      try {
        const response = await api.get(`/records/vitals/${patient_id}`);
        console.log("Vitals response:", response.data);

        if (response.data.success !== 1) {
          throw new Error(response.data.message || "Failed to fetch vitals");
        }

        const vitalsArray = Array.isArray(response.data.data) ? response.data.data : [];

        setVitalsList(vitalsArray);
      } catch (err) {
        console.error("Error fetching vitals:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, [patient_id]);

  if (loading) return <div>Loading vitals...</div>;
  if (error) return <div>Error: {error}</div>;
  if (vitalsList.length === 0) return <div>No vitals records found.</div>;

  return (
    <div>
      <div className="vitals-section">
        {vitalsList.map((vital, index) => (
        <Card.Body className="p-1">
          <div className="vitals-card" key={index}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="vitals-title">Vitals Check</h5>
              <span className="vitals-time">
                {new Date(vital.created_at).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>

            <div className="row">
              <div className="col-md-3 col-6 mb-3">
                <div className="vital-item">
                  <div className="d-flex align-items-center mb-1">
                    <Thermometer size={16} className="vital-icon" />
                    <span className="vital-label">BMI</span>
                  </div>
                  <div className="vital-value">{vital.bmi}</div>
                </div>
              </div>

              <div className="col-md-3 col-6 mb-3">
                <div className="vital-item">
                  <div className="d-flex align-items-center mb-1">
                    <Activity size={16} className="vital-icon" />
                    <span className="vital-label">BP</span>
                  </div>
                  <div className="vital-value">{vital.blood_pressure}</div>
                </div>
              </div>

              <div className="col-md-3 col-6 mb-3">
                <div className="vital-item">
                  <div className="d-flex align-items-center mb-1">
                    <Heart size={16} className="vital-icon" />
                    <span className="vital-label">GRBS</span>
                  </div>
                  <div className="vital-value">{vital.grbs}</div>
                </div>
              </div>

              <div className="col-md-3 col-6 mb-3">
                <div className="vital-item">
                  <div className="d-flex align-items-center mb-1">
                    <Droplet size={16} className="vital-icon" />
                    <span className="vital-label">CVS</span>
                  </div>
                  <div className="vital-value">{vital.cvs}</div>
                </div>
              </div>

              {/* Additional fields */}
              <div className="col-md-3 col-6 mb-3">
                <div className="vital-item">
                  <span className="vital-label">CNS</span>
                  <div className="vital-value">{vital.cns}</div>
                </div>
              </div>

              <div className="col-md-3 col-6 mb-3">
                <div className="vital-item">
                  <span className="vital-label">Respiratory Rate</span>
                  <div className="vital-value">{vital.respiratory_rate}</div>
                </div>
              </div>

              <div className="col-md-3 col-6 mb-3">
                <div className="vital-item">
                  <span className="vital-label">Height</span>
                  <div className="vital-value">{vital.height} cm</div>
                </div>
              </div>

              <div className="col-md-3 col-6 mb-3">
                <div className="vital-item">
                  <span className="vital-label">Weight</span>
                  <div className="vital-value">{vital.weight} kg</div>
                </div>
              </div>
            </div>
          </div>
      </Card.Body>
        ))}
      </div>
    </div>

  );
}

export default Vitals;
