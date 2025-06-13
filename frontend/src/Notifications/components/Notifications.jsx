import React, { useState, useEffect, useContext } from "react";
import {Container,Row,Col,Button,Card,Pagination,} from "react-bootstrap";
import Notificationstyle from "../css/Notiification.module.css";
import { CiSearch } from "react-icons/ci";
import { FaPlus } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import { FaMicroscope } from "react-icons/fa";
import { BsCurrencyDollar } from "react-icons/bs";
import { FaPercent } from "react-icons/fa";
import { GiMedicalPack } from "react-icons/gi";
import { AiOutlinePlus,AiOutlineUser,AiOutlineNotification, } from "react-icons/ai";
import { MdLocalHospital } from "react-icons/md";
import axios from "axios";
import PendingApprovals from "./PendingApprovals";
import Discount from './Discount'
import api from "../../utils/axiosInstance";
import useNotification from "antd/es/notification/useNotification";
import { useNotifications } from "../../dashboard/components/NotificationContext";
import AuthContext from "../../context/AuthProvider";
 import {Icon} from "@iconify/react"
 
function Notifications() {
  const {setShowDot} = useNotifications()
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [counts, setCounts] = useState({
  total_unread: 0,
  new_patients_today: 0,
  pharmacy_sales_today: 0,
  invoices_today:0
 
  });
  const [showPatientModal, setShowPatientModal] = useState(false); // ✅ Modal state
  const {userRoles}= useContext(AuthContext)
  const isAdmin=userRoles.includes("Super Admin") 
  const notificationsPerPage = 50;
 
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allnotifications, setNotifications] = useState([]);
  const getNotificationTitle = (type, originalTitle) => {
  switch (type) {
    case "patients":
      return "New Patient";
    case "lab_invoice":
      return "New Lab Invoice";
    case "discounts":
      return "New Discount";
    case "user":
      return "User Preference Updated";
    case "sales":
      return "New Sale";
    case "medication_add":
      return "New Pharmacy Notification";
    case "labs":
      return "New Lab Result";
    default:
      return originalTitle || "Notification";
  }
};
 
 
 
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const response = await api.get("notifications/list/");
      const data = response.data.data;
      console.log(response.data.data)
 
      // ✅ Extract counts from first element
      const {
        total_unread = 0,
        new_patients_today = 0,
        invoices_today = 0,
        pharmacy_sales_today=0
      } = data[0] || {};
 
      // ✅ Remaining elements are notifications
      const notifications = data.slice(1)
        .filter(note => note.id && note.created_at)
        .map(note => {
          const isRead = note.is_read;
          const category = note.notification_type || "others";
 
          const iconMap = {
            patient: <AiOutlinePlus className={Notificationstyle.patients} />,
            // lab_invoice: <FaMicroscope className={Notificationstyle.labInvoice} />,
            lab_invoice: <Icon icon="guidance:medical-laboratory" className={Notificationstyle.labInvoice} />,
            discount_approval: <FaPercent className={Notificationstyle.discounts} />,
            user: <AiOutlineUser className={Notificationstyle.user} />,
            sales: <BsCurrencyDollar className={Notificationstyle.sales} />,
            sale_complete: <BsCurrencyDollar className={Notificationstyle.sales} />,
            medication_add: <GiMedicalPack className={Notificationstyle.pharmacy} />,
            expiry: <GiMedicalPack className={Notificationstyle.pharmacy} />,
            invoice: <BsCurrencyDollar className={Notificationstyle.invoices} />,
            others: <AiOutlineNotification className={Notificationstyle.others} />,
            doctor: <AiOutlinePlus className={Notificationstyle.patients} />,
          };
 
          return {
            id: note.id,
            category,
            title: getNotificationTitle(category, note.title),
            description1: note.message || "",
            description2: "",
            patient_phone: note.patient_phone || "",
            time: new Date(note.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            icon: iconMap[category] || iconMap["others"],
            bgColor: isRead ? "#FFFFFF" : "#D5DEF5",
            isRead,
          };
        });
 
      setCounts({
        total_unread,
        new_patients_today,
        invoices_today,
       pharmacy_sales_today // update later if needed
      });
      
 
      setNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
 
  fetchNotifications();
 
 
   const handleRefresh = () =>  fetchNotifications(); // Refresh on event
 
    window.addEventListener("refreshPendingApprovals", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshPendingApprovals", handleRefresh);
    };
}, []);
 
 
const handleNotificationClick = async (id) => {
    const note = allnotifications.find((n) => n.id === id);
 
  // ✅ Don't proceed if already read
  if (note?.isRead) return;
  try {
    await api.post(`notifications/mark-as-read/${id}/`);
   
    setNotifications((prevNotifications) =>
      prevNotifications.map((note) =>
        note.id === id ? { ...note, isRead: true, bgColor: "#FFFFFF" } : note
      )
    );
 
    setCounts((prevCounts) => {
      const newUnread = Math.max(0, prevCounts.total_unread - 1);
 
      // Hide dot if no unread left
      if (newUnread === 0) {
        setShowDot(false);
      }
 
      return {
        ...prevCounts,
        total_unread: newUnread,
      };
    });
 
  } catch (error) {
    console.error("Failed to mark notification as read", error);
  }
};
 
 
const filteredNotifications = allnotifications.filter((note) => {
  const matchesTab =
    activeTab === "all" ||
    (Array.isArray(activeTab)
      ? activeTab.includes(note.category)
      : note.category === activeTab);

  const matchesSearch =
    query === "" ||
    note.title.toLowerCase().includes(query.toLowerCase()) ||
    note.description1.toLowerCase().includes(query.toLowerCase()) ||
    note.description2.toLowerCase().includes(query.toLowerCase()) ||
    (note.patient_phone && note.patient_phone.toString().includes(query));

  return matchesTab && matchesSearch;
});

 
 
 
 
const tabs = [
  { key: "all", label: "All Notifications" },
  { key: "patient", label: "Patients" },
  { key: "invoice", label: "Invoices" },
  { key: "discounts", label: "Discounts" },
  ...(isAdmin? [{ key: "user", label: "User Preference" }] : []),
  { key: "sales", label: "Sales" },
  { key: ["medication_add", "expiry","low_stock",'stagant'], label: "Pharmacy" },
  { key: "lab_invoice", label: "Labs" },
  
];
 
useEffect(() => {
  setCurrentPage(1);
}, [activeTab, query]);
 
 
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );
 
  const handleApprove = (id) => {
    setPendingApprovals((prev) =>
      prev.map((approval) =>
        approval.id === id ? { ...approval, status: "Approved" } : approval
      )
    );
  };
  const handleTabClick = (key) => {
  setActiveTab(key);
};
 
  const handleReject = (id) => {
    setPendingApprovals((prev) =>
      prev.map((approval) =>
        approval.id === id ? { ...approval, status: "Rejected" } : approval
      )
    );
  };
 
  return (
    <Container>
      <Row>
        <Col>
          {/* ✅ Updated Header with Button */}
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h1 className="fs-2 mt-3">Notifications</h1>
           
          </div>
        </Col>
      </Row>
 
      <div className={Notificationstyle.container}>
        <Row className="g-3">
          {[
          { title: "Total Unread", count: counts.total_unread },
          { title: "New Patients Today", count: counts.new_patients_today },
          { title: "Invoices Generated", count: counts.invoices_today },
          { title: "Pharmacy Sales", count: counts.pharmacy_sales_today},
        ].map((item, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3}>
            <Card className={Notificationstyle.firstcard}>
              <Card.Body>
                <Card.Subtitle className="mb-3 text-muted">{item.title}</Card.Subtitle>
                <Card.Text className="fw-bold fs-3">{item.count}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
 
        </Row>
      </div>
 
      <div className={Notificationstyle.fixedHeader}>
        <Row className="m-3 ms-3">
          <Col
            className={`d-flex flex-wrap justify-content-start gap-3 ${Notificationstyle.buttonContainer}`}
          >
          {tabs.map((tab,idx) => (
          <Button
            // key={tab.key}
             key={idx}
            onClick={() => setActiveTab(tab.key)}
            className={`p-2 ${Notificationstyle.customButton}`}
            style={{
              backgroundColor: activeTab === tab.key ? "#002072" : "transparent",
              color: activeTab === tab.key ? "white" : "#808080",
              border: "1px solid #CFDCEB",
            }}
            // onClick={() => handleTabClick(tab.key)}
          >
            {tab.label}
          </Button>
  ))}
          </Col>
           
        </Row>
 
        <Row className="mb-3">
          <Col>
            <div className={`ms-2 ${Notificationstyle.searchbar}`}>
              <label style={{ position: "relative" }}>
                <CiSearch className={Notificationstyle.searchicon} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Notifications"
                  className={Notificationstyle.searchInput}
                />
              </label>
            </div>
          </Col>
        </Row>
         {activeTab === "user" && <PendingApprovals />}
         {activeTab ==="discounts" && <Discount/>}
      </div>
 
      <div className={`${Notificationstyle.notificationList}`}>
        {paginatedNotifications
         
          .map((note) => (
            <div
              key={note.id}
              className={`p-4 mb-1 shadow-sm ${Notificationstyle.cards}`}
              style={{
                backgroundColor: note.isRead ? "#FFFFFF" : note.bgColor,
              }}
              onClick={() => handleNotificationClick(note.id)}
            >
              <Row>
                <Col xs="auto" className={`fs-4 mt-4 ${Notificationstyle.icon}`}>
                  {note.icon}
                </Col>
                <Col>
                  <div
                    className={`d-flex justify-content-between ${Notificationstyle.titi}`}
                  >
                    <h6 className={Notificationstyle.title}>{note.title}</h6>
                    <div>
                      <small className={`pe-4 ${Notificationstyle.time}`}>
                        {note.time}
                      </small>
                      {!note.isRead && (
                        <span className={`${Notificationstyle.bullet}`}>●</span>
                      )}
                    </div>
                  </div>
                  <p className="mb-1 text-muted">{note.description1}</p>
                  <p className="mb-1 text-muted">{note.description2}</p>
                </Col>
              </Row>
            </div>
          ))}
      </div>
 
      {totalPages > 1 && (
        <Pagination className="mt-3 justify-content-center">
          <Pagination.Prev
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={currentPage === idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
 
      {/* ✅ Patient Registration Modal */}
     
    </Container>
  );
}
 
export default Notifications;