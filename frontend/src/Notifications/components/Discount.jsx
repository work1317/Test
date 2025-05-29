import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { notification } from 'antd';
import 'antd/dist/reset.css'; // Required for Ant Design 5+
import styles from '../css/PendingApprovals.module.css';

const PendingApprovals = () => {
  const [approvals, setApprovals] = useState([
    { id: 1, PatientName: "priyanka", PatientID: 'P001', DiscountAmount: '25%', status: 'Pending' }
  ]);

  const handleApprove = (id) => {
    setApprovals(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'Approved' } : item
      )
    );
    notification.success({
      message: 'Approval Successful',
      description: 'Discount request has been approved.',
      placement: 'topRight'
    });
  };

  const handleReject = (id) => {
    setApprovals(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'Rejected' } : item
      )
    );
    notification.error({
      message: 'Request Rejected',
      description: 'Discount request has been rejected.',
      placement: 'topRight'
    });
  };

  return (
    <div className={styles.wrapper}>
      <h5 className="mt-3 mb-3 text-center">Review Discount Request</h5>
      <Table bordered hover responsive className="text-center">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Patient Name</th>
            <th>Discount Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map(item => (
            <tr key={item.id}>
              <td>{item.PatientID}</td>
              <td>{item.PatientName}</td>
              <td>{item.DiscountAmount}</td>
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
