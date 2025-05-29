import React, { useContext, useEffect, useState } from 'react';
import { doctors } from './RecordLab';
import DailyVital from './DailyVital';
import RecordPrescription from './RecordPrescription';
import Service from './Service';
import LabResult from './LabResult';
import axios from 'axios';
import api from '../../utils/axiosInstance';
 
function AllRecord() {
  const { selectedPatient } = useContext(doctors);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [vitals, setVitals] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [services, setServices] = useState([]);
  const [labResults, setLabResults] = useState([]);
 
  useEffect(() => {
    if (!selectedPatient) return;
 
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [vitalRes, prescriptionRes, serviceRes, labRes] = await Promise.all([
          api.get(`records/records/?record_type=vitals&patient_id=${selectedPatient.patient_id}`),
          api.get(`records/records/?record_type=prescription&patient_id=${selectedPatient.patient_id}`),
          api.get(`records/records/?record_type=service_procedure&patient_id=${selectedPatient.patient_id}`),
          api.get(`labs/lab_tests/`)
        ]);
 
        const v = vitalRes.data.data || [];
        const p = prescriptionRes.data.data || [];
        const s = serviceRes.data.data || [];
        const l = labRes.data.data || [];
 
        setVitals(v);
        setPrescriptions(p);
        setServices(s);
        setLabResults(l);
 
        setHasData(v.length > 0 || p.length > 0 || s.length > 0 || l.length > 0);
      } catch (err) {
        console.error('Error fetching all records', err);
      }
      setLoading(false);
    };
 
    fetchAll();
  }, [selectedPatient]);
 
  if (loading) return <p>Loading records...</p>;
  if (!hasData) return <p>No records found for this patient.</p>;
 
  return (
    <div>
      {vitals.length > 0 && <DailyVital />}
      {prescriptions.length > 0 && <RecordPrescription />}
      {services.length > 0 && <Service />}
      {labResults.length > 0 && <LabResult transformData={labResults} />}
    </div>
  );
}
 
export default AllRecord;