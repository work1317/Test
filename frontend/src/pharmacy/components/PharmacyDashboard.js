import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { Tabs } from 'antd';
import api from "../../utils/axiosInstance";

import AddMedication from './AddMedication';
import Suppliers from './Supplier';
import Inventory from './Inventary';
import PharmacyPrescription from './PharmacyPrescription';
import ViewAllSuppliers from './ViewAllSuppliers';
import SupplierDetails from './SupplierDetails';
import PharmacyInvoice from './PharmacyInvoice';

import styles from '../css/PharmacyDashboard.module.css';
import { GoPlus } from "react-icons/go";

function PharmacyDashboard() {
  const [viewAllSuppliers, setViewAllSuppliers] = useState(false);
  const [PharmacyDashboard, setPharmacyDashboard]=useState(false);
  const [addMedication, setAddMedication] = useState(false);
  const [pharmacyInvoice, setPharmacyInvoice] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedSupplierId, setSelectedSupplierId] = useState(null); // ✅ Store selected supplier ID

  const [cardStats, setCardStats] = useState({
    Inventory: 0,
    LowStockAlert: 0,
    NearingExpiry: 0,
    StagnantDrugs: 0,
    PrescriptionPending: 0,
    SupplierDues:0,
    Value: 0,
  });

  useEffect(() => {
    fetchStats();
     const handleRefresh = () => fetchStats(); // Refresh on event
 
    window.addEventListener("refreshAddMedication", handleRefresh);
 
    return () => {
      window.removeEventListener("refreshAddMedication", handleRefresh);
    };
  }, []);


  const fetchStats = async () => {
    try {
      const response = await api.get('/pharmacy/medicine_list/');
      console.log(response)
      if (response.status === 200 && response.data.success === 1) {
        const stats = response.data.data?.status || {}; // Handle missing or undefined stats
        setCardStats({
          Inventory: stats.Inventory || 0, // Default to 0 if undefined
          LowStockAlert: stats.LowStockAlert || 0,
          NearingExpiry: stats.NearingExpiry || 0,
          StagnantDrugs: stats.StagnantDrugs || 0,
          PrescriptionPending: stats.PrescriptionPending || 0,
          SupplierDues:stats.SupplierDues || 0,
          Value: stats.Value || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const cardData = [
    { icon: 'proicons:box', color: '#2563EB', text: 'Inventory', value: cardStats.Inventory || 0, description: 'Total Medications', bgColor:'#DFEDFF',descriptionColor: '#9A9A9A'},
    { icon: 'iwwa:alert', color: '#CC931C', text: 'Alerts', value: cardStats.LowStockAlert || 0, description: 'Low Stock Items', bgColor:'#FFE9BA',descriptionColor: '#9A9A9A'},
    { icon: 'pepicons-pencil:file', color: '#9333EA', text: 'Pending', value: cardStats.PrescriptionPending || 0, description: 'Pending Medications', bgColor:'#F0E0FF',descriptionColor: '#9A9A9A'},
    { icon: 'proicons:graph', color: '#16A34A', text: 'Value', value: `₹ ${cardStats.Value || 0}`, description: 'Total Inventory Value', bgColor:'#DDFFE8',descriptionColor: '#9A9A9A' },
    { icon: 'iwwa:alert', color: '#CC931C', text: 'Alerts', value: cardStats.NearingExpiry || 0, description: 'Drugs Nearing Expiry', bgColor:'#FFE9BA' ,descriptionColor: '#9A9A9A'},
    { icon: 'flowbite:bell-outline', color: '#888A2D', text: 'Pending',value:cardStats.SupplierDues|| 0, description: 'Supplier Due Notification', bgColor:'#FCFFDF',descriptionColor: '#9A9A9A'},
    { icon: 'iwwa:alert', color: '#CC931C', text: 'Alerts', value: cardStats.StagnantDrugs || 0, description: 'Stagnant Drugs', bgColor:'#FFE9BA' ,  descriptionColor: '#9A9A9A'},
  ];

  const tabData = [
    { name: "Inventory", tab: "inventory" },
    { name: "Prescription", tab: "prescription" },
    { name: "Suppliers", tab: "suppliers" },
  ];

  const tabItems = tabData.map(({ name, tab }) => ({
    label: (
      <button
        className={`w-100 btn d-flex align-items-center gap-3 py-2 ${activeTab === tab ? styles.activeTab : styles.customTab}`}
      >
        {name}
      </button>
    ),
    key: tab,
    children: (
      <Row>
        {tab === "inventory" && <Inventory />}
        {tab === "prescription" && <PharmacyPrescription />}
        {tab === "suppliers" && <Suppliers onViewAll={() => setViewAllSuppliers(true)} />}
      </Row>
    ),
  }));

  const renderCards = () => {
    const cardsToShow = activeTab === 'inventory' && !viewAllSuppliers ? cardData : cardData.slice(0, 4);
    return (
      <Row className="g-4 mb-4">
        {cardsToShow.map((card, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3}>
            <Card className={`p-3 ${styles.card}`}>
              <div className="d-flex justify-content-between align-items-center mb-2" >
                    <div
                      style={{
                        backgroundColor: card.bgColor,
                        padding: '10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                      }}
                    >
                      <Icon icon={card.icon} width="25" height="25" color={card.color} />
                    </div>
                    
                    <span style={{ color: card.color, fontWeight: 'bold' }}>{card.text}</span>
              </div>
              <h5 className='mt-4'>{card.value}</h5>
              <span className="mt-2" style={{ color: card.descriptionColor }}>{card.description}</span>
              </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className={styles.main}>
      {pharmacyInvoice ? (
        <PharmacyInvoice onBack={() => setPharmacyInvoice(false)} />
      ) : selectedSupplierId ? (
        <SupplierDetails
          supplierId={selectedSupplierId}
          onBack={() => {
            setSelectedSupplierId(null);
            setViewAllSuppliers(true); // Go back to supplier list
          }}
        />
      ) : (
        <>
          {/* Header */}
          <Row className="justify-content-between align-items-center mb-4">
            <Col>
              <h1>Pharmacy Management</h1>
              <p className='ms-2 mb-3'>Manage inventory and process prescriptions</p>
            </Col>
            <Col className="text-end">
              <Button
                variant="secondary"
                className={`me-4  ${styles.pharmacyInvoice}`}
                onClick={() => setPharmacyInvoice(true)}
              >
                Pharmacy Invoice
              </Button>
              <Button className={`ms-2 ${styles.addmedica}`} onClick={() => setAddMedication(true)}>
              <GoPlus /> Add Medication
              </Button>
              <AddMedication show={addMedication} handleClose={() => setAddMedication(false)}   onMedicationAdded={fetchStats}
 />
            </Col>
          </Row>

          {/* Cards */}
          {renderCards()}

          {/* Tabs or Supplier View */}
          <div className={styles.tabContainer}>
            {viewAllSuppliers ? (
              <ViewAllSuppliers
                onShowDetails={(id) => setSelectedSupplierId(id)} 
                onBack={() => setViewAllSuppliers(false)} 
              />
            ) : (
              <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key)}
                tabBarStyle={{ borderBottom: "1px solid #002072" }}
                className={styles.customtabs1}
                items={tabItems}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PharmacyDashboard;
