import React, { useContext } from "react";
import { doctors } from "./RecordLab";

function RecordImaging({ transformData }) {
  const { selectedPatient } = useContext(doctors);

  const patientLabs = transformData.filter(
    (lab) => lab.patient_id === selectedPatient.patient_id
  );

  return (
   <div>
      {patientLabs.map((lab, index) => (
        <div key={index} className="text-center mt-4">
          {/* Only render if URL exists */}
          {lab.result_download_url && (
            <>
              <img
                src={lab.result_download_url}
                alt={lab.result_filename || "Lab Result"}
                style={{
                  maxWidth: "50%",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)",
                }}
                onError={(e) => {
                  // Hide broken images & log error
                  console.error("Failed to load image:", lab.result_download_url);
                  e.target.style.display = "none";
                }}
              />
              <p className="mt-2" style={{ color: "#555" }}>
                {lab.result_filename}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default RecordImaging;
