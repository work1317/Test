import React, { useState, useEffect, useRef, useContext } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Offcanvas from "react-bootstrap/Offcanvas";
import SideMenuStyle from "../css/SideMenu.module.css";
import styles from "../css/MainDashboard.module.css";
import { useNavigate } from "react-router-dom";
import "../css/SearchBar.css";
import AuthContext from "../../context/AuthProvider";
import { useNotifications } from "./NotificationContext";
 
const menuItems = [
  { icon: "circum:grid-4-2", color:"#9A9A9A",label: "Dashboard", link: "dashboard" },
  { icon: "mingcute:group-line", color:"#9A9A9A",label: "Patients", link: "patients" },
  { icon: "hugeicons:doctor-03",color:"#9A9A9A", label: "Doctors", link: "doctors" },
  { icon: "uit:calender", color:"#9A9A9A",label: "Appointments", link: "appointments" },
  { icon: "pepicons-pencil:file",color:"#9A9A9A", label: "Records", link: "records" },
  { icon: "iconoir:pharmacy-cross-tag",color:"#9A9A9A", label: "Pharmacy", link: "pharmacy" },
  { icon: "guidance:medical-laboratory",color:"#9A9A9A", label: "Lab", link: "lab" },
  { icon: "iconamoon:invoice-thin",color:"#9A9A9A", label: "Invoice", link: "invoice" },
  { icon: "tabler:logout-2",color:"#9A9A9A", label: "Logout", link: "logout" },
];
 
const LaoutPage = () => {
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const location = useLocation();
  const { read, showDot } = useNotifications();
  const auth = useContext(AuthContext);
  const navigation = useNavigate();
 
  // User roles logic omitted here for brevity, keep your existing role filtering code
 
  // Filter menu based on user roles (keep your existing logic)
  // Example:
  const filteredMenu = menuItems; // Replace with your filteredMenu logic as needed
 
  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const currentItem = menuItems.find((item) => item.link === path);
    if (currentItem) {
      setSelectedPage(currentItem.label);
    } else if (location.pathname === "/dashboard") {
      setSelectedPage("Dashboard");
    }
  }, [location]);
 
  const renderMenuItems = () => {
    return filteredMenu.map((item) => {
      let isActive = false;
 
      if (item.link === "logout") {
        // Logout immediately on click handled in onClick below, no need to set isActive
      } else {
        if (item.link === "dashboard") {
          isActive = location.pathname === "/dashboard";
        } else {
          isActive = location.pathname.startsWith(`/dashboard/${item.link}`);
        }
      }
 
      return (
        <Link
          to={item.link === "logout" ? "#" : item.link}
          key={item.label}
          className={`d-flex align-items-center gap-2 px-3 py-3 text-decoration-none ${
            isActive ? SideMenuStyle.menuGroup : SideMenuStyle.inactiveMenu
          }`}
          onClick={() => {
            if (item.link === "logout") {
              auth.logout();
              return;
            }
            setSelectedPage(item.label);
            setShowOffcanvas(false);
          }}
        >
          <Icon
            icon={item.icon}
            width={24}
            height={24}
            color={isActive ? "#002072" : "#9A9A9A"}
          />
          <span>{item.label}</span>
        </Link>
      );
    });
  };
 
  return (
    <div>
      <Container fluid style={{ backgroundColor: "#f3f4f6" }}>
        {/* Menu Button for Mobile & Tablets */}
        <button
          className={`btn d-lg-none m-3 ${SideMenuStyle.buttoncolor}`}
          onClick={() => setShowOffcanvas(true)}
        >
          <Icon icon="mdi:menu" width={24} height={24} />
        </button>
 
        {/* Offcanvas Sidebar for Mobile & Tablets */}
        <Offcanvas
          show={showOffcanvas}
          onHide={() => setShowOffcanvas(false)}
          placement="start"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>{renderMenuItems()}</Offcanvas.Body>
        </Offcanvas>
 
        <Row>
          {/* Sidebar for Larger Screens */}
          <Col lg={2} className="d-none d-lg-block mt-1">
            <div
              className="sidebar d-none d-lg-flex flex-column bg-white shadow-sm p-3"
              style={{ height: "100vh", position: "sticky", top: 0 }}
            >
              {renderMenuItems()}
            </div>
          </Col>
 
          <Col xs={12} lg={10} className="mt-1">
            <div className={styles.MainContainer}>
              <nav className={styles.navbar}>
                <div className={styles.navtitle}>{selectedPage}</div>
                <div className={styles.navrightSection}>
                  <div className={styles.bellContainer}>
                    <Icon
                      icon="f7:bell"
                      width="24"
                      height="24"
                      style={{ color: "#8B8B8B" }}
                      className={styles.bellIcon}
                      onClick={() => navigation("/dashboard/notifications")}
                    />
                    {showDot && <span className={styles.notificationBadge}></span>}
                  </div>
                </div>
              </nav>
            </div>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};
 
export default LaoutPage;