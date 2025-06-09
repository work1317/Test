 
import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import styles from '../css/PendingApprovals.module.css';
import api from '../../utils/axiosInstance';
import { useNotifications } from '../../dashboard/components/NotificationContext';
 
const PendingApprovals = () => {
const [approvals,setapprovals]=useState([]);
const {fetchNotifications, onNotificationClick} = useNotifications()
 
useEffect(() => {
  const FetchingData = async() => {
  try{
    const response  = await api.get('notifications/list/');
    setapprovals(response.data.data)
    console.log(response.data.data)
  }
  catch(error){
    console.log("error", error)
  }
}
FetchingData()
},[])
 
 
const handleApprove = async (id) => {
try {
      await api.post(`notifications/update-status/${id}/`, { status: 'approved' });
      setapprovals((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, approval_status: 'approved' } : item
        )
      );
      await fetchNotifications();
      await onNotificationClick();
 
       window.dispatchEvent(new Event("refreshPendingApprovals"));
    } catch (error) {
      console.error('Approval failed', error.response?.data || error);
    }
};
 
 
 
  const handleReject = async (id) => {
  try {
    await api.post(`notifications/update-status/${id}/`, { status: 'rejected' });
 
    setapprovals((prev) => prev.filter((item) => item.id !== id));
     await fetchNotifications();
      await onNotificationClick();
 
    window.dispatchEvent(new Event("refreshPendingApprovals"));
  } catch (error) {
    console.error("Rejection failed", error.response?.data || error);
  }
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
  {approvals
    .filter(item => item.doctor_id && item.doctor_name)  // ✅ filters out invalid rows
    .map((item, index) => (
      <tr key={index}>
        <td>{item.doctor_id}</td>
        <td>{item.doctor_name}</td>
        <td>{item.added_by}</td>
        <td>{item.created_date}</td>
        <td>{item.approval_status}</td>
        <td>
          <Button
            variant="success"
            size="sm"
            onClick={() => handleApprove(item.patient)}
            className="me-2"
            disabled={item.approval_status === 'approved' || item.approval_status === "rejected"}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleReject(item.id)}
            disabled={item.approval_status === "rejected" || item.approval_status === "approved"}
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