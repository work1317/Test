import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import "antd/dist/reset.css"; // Required for Ant Design 5+
import styles from "../css/PendingApprovals.module.css";
import api from "../../utils/axiosInstance";
import { useNotifications } from "../../dashboard/components/NotificationContext";

const Discount = () => {
  const [approvals, setapprovals] = useState([]);
  const {messages, setMessage} =  useNotifications()

  const fetchData = async () => {
  try {
    const response = await api.get("notifications/list/");
    const rawData = response.data.data;
    const uniqueData = rawData.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.invoice_id === item.invoice_id)
    );
    setapprovals(uniqueData);
  } catch (error) {
    console.log("error", error);
  }
};

useEffect(() => {
  fetchData();
}, []);


const handleApprove = async (invoice_id) => {
  try {
    const res = await api.post(`p_invoice/pharmacy/discount/${invoice_id}/`, {
      decision: "approve",
    });

    if (res.data.success === 1) {
      setMessage(res.data.message); // ✅ Set the message from backend
    }

    await fetchData(); // Optional: refresh table
  } catch (error) {
    console.error("Approval failed", error.response?.data || error);
    setMessage("Failed to approve discount."); // Optional: show error
  }
};


const handleReject = async (invoice_id) => {
  try {
    const res = await api.post(`p_invoice/pharmacy/discount/${invoice_id}/`, {
      decision: "reject",
    });

    if (res.data.success === 1) {
      setMessage(res.data.message); // ✅ Set the message from backend
    }

    await fetchData();  // <== REFRESH data after reject
  } catch (error) {
    console.error("Rejection failed", error.response?.data || error);
  }
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
          {approvals
            .filter((item) => item.invoice_id && item.patient_name)
            .map((item) => (
              <tr key={item.invoice_id}>
                <td>{item.patient_id_value}</td>
                <td>{item.patient_name}</td>
                <td>{item.discount_percentage}%</td>
                <td>{item.approval_status}</td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(item.invoice_id)}
                    className="me-2"
                    disabled={

                      item.approval_status === "approved" ||
                      item.approval_status === "rejected"
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(item.invoice_id)}
                    disabled={
                      item.approval_status === "rejected" ||
                      item.approval_status === "approved"
                    }
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

export default Discount;


