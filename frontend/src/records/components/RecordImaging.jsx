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


// import React from 'react';

// const RecordImaging = () => {
//   return (
//     <div className="text-center mt-4">
//       <img
//         src="http://localhost:8000/media/labtest_uploads/invoice.png"
//         alt="Test"
//         style={{
//           maxWidth: '50%',
//           border: '1px solid #ccc',
//           borderRadius: '6px',
//         }}
//         onError={(e) => {
//           console.error("Failed to load image:", e.target.src);
//           e.target.style.display = 'none';
//         }}
//       />
//     </div>
//   );
// };

// export default RecordImaging;



// import React, { useContext, useEffect, useState } from "react";
// import { doctors } from "./RecordLab";
// import axios from "axios";
// import api from "../../utils/axiosInstance";

// function RecordImaging({ transformData }) {
//   const { selectedPatient } = useContext(doctors);
//   const [imageBlobs, setImageBlobs] = useState([]);

//   useEffect(() => {
//     const fetchImages = async () => {
//       const labs = transformData.filter(
//         (lab) => lab.patient_id === selectedPatient.patient_id && lab.result
//       );

//       const fetchedBlobs = await Promise.all(
//         labs.map(async (lab) => {
//           try {
//             const response = await api.get(lab.result, {
//               responseType: "blob",
//             });
//             const blobUrl = URL.createObjectURL(response.data);
//             return { ...lab, blobUrl };
//           } catch (err) {
//             console.error("Error loading image", lab.result, err);
//             return null;
//           }
//         })
//       );

//       setImageBlobs(fetchedBlobs.filter(Boolean));
//     };

//     fetchImages();
//   }, [selectedPatient, transformData]);

//   return (
//     <div>
//       {imageBlobs.map((lab, index) => (
//         <div key={index} className="text-center mt-3">
//           <img
//             src={lab.blobUrl}
//             alt="Lab Result"
//             style={{
//               maxWidth: "50%",
//               borderRadius: "8px",
//               border: "1px solid #ddd",
//             }}
//           />
//         </div>
//       ))}
//     </div>
//   );
// }
// export default RecordImaging;

