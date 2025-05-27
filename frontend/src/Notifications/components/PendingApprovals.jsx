import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import styles from '../css/PendingApprovals.module.css';

const PendingApprovals = () => {
  const [approvals, setApprovals] = useState([
    { id: 1, request: 'Admin Access', submittedBy: 'John Doe', dateSubmitted: '2025-03-16', status: 'Pending' },
    { id: 2, request: 'Data Export', submittedBy: 'Jane Smith', dateSubmitted: '2025-03-15', status: 'Pending' },
  ]);

  const handleApprove = (id) => {
    setApprovals(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'Approved' } : item
      )
    );
  };

  const handleReject = (id) => {
    setApprovals(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'Rejected' } : item
      )
    );
  };

  return (
    <div className={styles.wrapper}>
      <h5 className="mt-3 mb-3 text-center">Pending Approvals</h5>
      <Table>
        <thead>
          <tr>
          <th>Id</th>
            <th>Request</th>
            <th>Submitted By</th>
            <th>Date Submitted</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map(item => (
            <tr key={item.id}>
            <td>{item.id}</td>
              <td>{item.request}</td>
              <td>{item.submittedBy}</td>
              <td>{item.dateSubmitted}</td>
              <td>{item.status}</td>
              <td>
                <Button
                  variant="success"
                  size="sm"
                  disabled={item.status !== 'Pending'}
                  onClick={() => handleApprove(item.id)}
                  className="me-2"
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={item.status !== 'Pending'}
                  onClick={() => handleReject(item.id)}
                >
                  Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PendingApprovals;

// import React, { useState, useEffect } from 'react';
// import { Table, Button } from 'react-bootstrap';
// import axios from 'axios';
// import styles from '../css/PendingApprovals.module.css';

// const PendingApprovals = () => {
//   const [approvals, setApprovals] = useState([]);

//   useEffect(() => {
//     fetchApprovals();
//   }, []);

//   const fetchApprovals = async () => {
//     try {
//       const response = await axios.get('/api/pending-approvals/');
//       setApprovals(response.data);
//     } catch (error) {
//       console.error('Failed to fetch approvals:', error);
//     }
//   };

//   const handleApprove = (id) => {
//     setApprovals(prev =>
//       prev.map(item =>
//         item.id === id ? { ...item, status: 'Approved' } : item
//       )
//     );
//   };

//   const handleReject = (id) => {
//     setApprovals(prev =>
//       prev.map(item =>
//         item.id === id ? { ...item, status: 'Rejected' } : item
//       )
//     );
//   };

//   return (
//     <div className={styles.wrapper}>
//       <h5 className="mt-3 mb-3 text-center">Pending Approvals</h5>
//       <Table>
//         <thead>
//           <tr>
//             <th>Id</th>
//             <th>Request</th>
//             <th>Submitted By</th>
//             <th>Date Submitted</th>
//             <th>Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {approvals.map(item => (
//             <tr key={item.id}>
//               <td>{item.id}</td>
//               <td>{item.request}</td>
//               <td>{item.submitted_by}</td>
//               <td>{item.date_submitted}</td>
//               <td>{item.status}</td>
//               <td>
//                 <Button
//                   variant="success"
//                   size="sm"
//                   disabled={item.status !== 'Pending'}
//                   onClick={() => handleApprove(item.id)}
//                   className="me-2"
//                 >
//                   Approve
//                 </Button>
//                 <Button
//                   variant="danger"
//                   size="sm"
//                   disabled={item.status !== 'Pending'}
//                   onClick={() => handleReject(item.id)}
//                 >
//                   Reject
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </div>
//   );
// };

// export default PendingApprovals;
