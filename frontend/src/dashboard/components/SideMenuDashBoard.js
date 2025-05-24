import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import Offcanvas from "react-bootstrap/Offcanvas";
import SideMenuStyle from "../css/SideMenu.module.css";

const menuItems = [
  { icon: "circum:grid-4-2", label: "Dashboard", link: "Dashboard" },
  { icon: "mingcute:group-line", label: "Patients", link: "patients" },
  { icon: "hugeicons:doctor-03", label: "Doctors", link: "doctors" },
  { icon: "uit:calender", label: "Appointments", link: "appointments" },
  { icon: "pepicons-pencil:file", label: "Records", link: "records" },
  { icon: "iconoir:pharmacy-cross-tag", label: "Pharmacy", link: "pharmacy" },
  { icon: "hugeicons:complaint", label: "Complaints", link: "complaints" },
  { icon: "guidance:medical-laboratory", label: "Lab", link: "lab" },
  { icon: "iconamoon:invoice-thin", label: "Invoice", link: "invoice" },
];

const SideMenuDashBoard = ({ setSelectedPage }) => {
  const location = useLocation();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const renderMenuItems = () => {
    return menuItems.map((item) => {
      const isActive = location.pathname === `/${item.link}`;
      return (
        <Link
          to={item.link}
          key={item.label}
          className={`d-flex align-items-center gap-2 px-3 py-3 text-decoration-none ${
            isActive ? SideMenuStyle.menuGroup : "text-dark hover:bg-light"
          }`}
          onClick={() => {
            setSelectedPage(item.label);
            setShowOffcanvas(false);
          }}
        >
          <Icon icon={item.icon} width={24} height={24} />
          <span>{item.label}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {/* Menu Button for Mobile & Tablets */}
      <button
        className="btn btn-primary d-lg-none m-3"
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

      {/* Sidebar for Larger Screens */}
      <div
        className="sidebar d-none d-lg-flex flex-column bg-white shadow-sm p-3"
        style={{ height: "100vh", position: "sticky", top: 0 }}
      >
        {renderMenuItems()}
      </div>
    </>
  );
};

export default SideMenuDashBoard;
