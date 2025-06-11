import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Container,
  Navbar,
  Nav,
  Tab,
  Tabs,
  Table,
  Button,
  Row,
  Col,
  InputGroup,
  FormControl,
  Image,
} from "react-bootstrap";
import { FaPlus, FaBell, FaSearch, FaLeaf } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../css/Labtest.module.css";
import Addform from "./Addform";
import InvoiceForm from "./InvoiceForm";
import { LuCirclePlus } from "react-icons/lu";
import axios from "axios";
import LabViewresult from "./LabViewresult";
import InvoiceViewresult from "./InvocieViewresult";
import api from "../../utils/axiosInstance";
import { useNotifications } from "../../dashboard/components/NotificationContext";
import { FireExtinguisher } from "lucide-react";

export const forms = createContext();
function Labtest() {
  const { fetchNotifications, onNotificationClick } = useNotifications()
  const [page, setPage] = useState("labtest");
  const [opens, setOpens] = useState(false);
  const [showes, setShowes] = useState(false);
  const [tab, setTab] = useState(false);
  const [selectedResult, setSelectResult] = useState([]);
  const [selectForm, setSelectForms] = useState([]);
  const [addForm, setAddForm] = useState([]);
  const [inSelectForm, setInSelectForm] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formsData, setFormsData] = useState({
    patient: "",
    patient_name: "",
    requested_test: "",
    requested_by: "",
    request_date: "",
    priority: "Urgent",
    status: "Pending",
    notes: "",
    test_date: "",
    username: "",
    summary: "",
    test_type: "",
    flag: false,
    upload: null,
  });
  const [formObj, setFormObj] = useState([]);
  const [search, setSearch] = useState();


  const [formsData1, setFormsData1] = useState({
    patient_name: "",
    testname: "",
    amount: "",
    status: "Pending",
    date: "",
  });

  // console.log(patients)
  const [formObj1, setFormObj1] = useState([]);

  // patient Api
  useEffect(() => {
    const patientData = async () => {
      try {
        const { data } = await api.get(
          "patients/patients/"
        );
        if (data.success) {
          setPatients(data.data.patients || []);
          console.log(data.data)

        }
      } catch (error) {
        console.log("error");
      }
    };
    patientData();
  }, []);

  // labtest viewResult
  const handlershow = async (action) => {
    setShowes(true);
    try {
      const response = await api.get(`labs/lab_tests/${action}/`
      );
      if (response.data && response.data.success === 1) {
        // console.log("Fetched Data:", response.data.data);
        const NewsData = response.data.data;
        setSelectResult(NewsData);



        console.log("Data set to state:", selectedResult);
      }
    } catch (err) {
      console.error("Error fetching lab test:", err);
    }
  };
  useEffect(() => {
    if (selectedResult) {
      // console.log("Data set to state:", selectedResult);
    }
  }, [selectedResult]);

  const handlershows = () => {
    setOpens(true);
  };
  const handlerClose = () => {
    setShowes(false);
    setOpens(false);
    setTab(false);

    setFormsData({
         patient: "",
    patient_name: "",
    requested_test: "",
    requested_by: "",
    request_date: "",
    priority: "Urgent",
    status: "Pending",
    notes: "",
    test_date: "",
    username: "",
    summary: "",
    test_type: "",
    flag: false,
    upload: null,
    })
    setFormsData1({
       patient_name: "",
    testname: "",
    amount: "",
    status: "Pending",
    date: "",
    })
  };

  // iNVOICE VIEW DETAILS
  const invocieResult = async () => {
    setTab(true);
  };

  // this is lab test getting data

  const fetchingData = async () => {
    try {
      const response = await api.get("labs/lab_tests/");
      setFormObj(response.data.data);
      console.log(response.data.data)
    } catch (error) {
      console.log("Error fetching lab tests:", error);
    }
  };
  useEffect(() => {


    fetchingData()


  }, []);

  const handlerShows = () => {
    setShowes(true)
  }
  // lab test form
  const saveForms = async (e) => {
    e.preventDefault();

    if (formsData.patient.trim() === "") {
      alert("Please complete the 'Patient ID' field.");
      return;
    }
    if (formsData.patient_name.trim() === "") {
      alert("Please complete the 'Patient Name' field.");
      return;
    }
    if (formsData.requested_by === "") {
      alert("Please select the 'Requested By' (Doctor) field.");
      return;
    }
    if (formsData.requested_test.trim() === "") {
      alert("Please enter the 'Requested Test'.");
      return;
    }
    if (formsData.request_date === "") {
      alert("Please select the 'Request Date'.");
      return;
    }
    if (formsData.notes.trim() === "") {
      alert("Please fill in the 'Notes' section.");
      return;
    }
    if (formsData.summary.trim() === "") {
      alert("Please provide a summary.");
      return;
    }
    if (!formsData.upload) {
      alert("Please upload the required document.");
      return;
    }

    if (formsData.requested_test !== formsData.test_type) {
      alert("Requested test and test type must be the same.")
      return
    }


    const selectedDate = new Date(formsData.request_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensures comparison ignores time

    if (selectedDate < today) {
      alert("Request date cannot be in the past.");
      return;
    }

    const testDate = new Date(formsData.test_date);
    if (testDate < today) {
      alert("Test date cannot be in the past.");
      return;
    }

    if (!formsData.test_type) {
      alert("Please Enter your test details ")
    }
  if(formsData.test_date === ""){
      alert("Please enter the Test Date")
      return
    }
    try {
      const formData = new FormData();
      Object.keys(formsData).forEach((key) => {
        const value = formsData[key];
        if (key === "upload" && value) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      console.log("Sending formData:", [...formData.entries()]);

      const response = await api.post("labs/create_lab_test/", formData);
      await fetchingData();

      const newData = response.data.data;

      setFormsData({
        patient_id: "",
        patient_name: "",
        requested_by: "",
        requested_test: "",
        request_date: "",
        notes: "",
        user_id: "",
        username: "",
        test_date: "",
        test_time: "",
        summary: "",
        upload: null,
      });
      alert("Lab Test Saved Successfully")
      handlerClose();
    } catch (error) {
      alert(
        "Submission error: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  // this is ivoice getting data
  useEffect(() => {
    const fetchdata = async() =>  {
    await api
      .get("labs/invoice_lists/")
      .then((res) => {
        setFormObj1(res.data.data);
        
        // console.log("response:",res.data.data);
      })
      .catch((err) => console.log("error", err));
    }
    fetchdata()
    
  }, []);


  const saveButtons = async (e) => {
  e.preventDefault();

  // Normalize date to compare only the day
  const selectedDate = new Date(formsData1.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  // Validation for required fields
  if (
    formsData1.patient_name.trim() === "" ||
    formsData1.testname.trim() === "" ||
    formsData1.amount.trim() === "" ||
    formsData1.status.trim() === "" ||
    formsData1.date.trim() === ""
  ) {
    alert("Please complete all invoice details.");
    return;
  }

  // Check for past date
  if (selectedDate < today) {
    alert("Date cannot be in the past.");
    return;
  }

  // Submit data
  try {
    const response = await api.post("labs/create_lab_invoice/", formsData1);
    const saveData = response.data.data;
    await fetchNotifications();
    await onNotificationClick();
    console.log(saveData);

    setFormObj1([...formObj1, formsData1]);

    setFormsData1({
      patient_name: "",
      test_name: "",
      amount: "",
      status: "Pending",
      date: "",
    });
    await fetchingData()
    alert("successFully Added!")
    handlerClose();
  } catch (error) {
    alert("Patient does not exist.");
  }
};


  return (
    <div className="lab">
      <div id="lab" className="bg-light min-vh-100">
        {/* tab button */}
        {opens ? (
          <forms.Provider value={{ formsData, setFormsData }}>
            <Addform handlerClose={handlerClose} patients={patients} saveForms={saveForms} />
          </forms.Provider>
        ) : (
          <div className={styles.Tab}>
            <div className={styles.tabContainer}>
              <div
                className={`${styles.tab} ${page === "labtest" ? styles.active : ""
                  }`}
                onClick={() => setPage("labtest")}
              >
                Lab Test
              </div>
              <div
                className={`${styles.tab} ${page === "invoice" ? styles.active : ""
                  }`}
                onClick={() => setPage("invoice")}
              >
                Invoices
              </div>
            </div>
            {page === "labtest" ? (
              <div className="">
                <div
                  className="AddNote p-3"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h3>Lab Tests</h3>
                  <button
                    onClick={handlershows}
                    className={`p-2 ${styles.notebtn}`}
                  >
                    <LuCirclePlus className="fa me-1" />
                    Add Test
                  </button>
                </div>

                <div className="table-list">
                  <Table
                    className="shodow-sm rounded"
                    id="table"
                  >
                    <thead className="table-light">
                      <tr>
                        <th id="th">Patient Name</th>
                        <th id="th">Test Name</th>
                        <th id="th">Date</th>
                        <th id="th">Status</th>
                        <th id="th">Action</th>
                      </tr>
                    </thead>
                    <tbody className="t-body">
                      {formObj.map((form, index) => (
                        <tr key={index} id="tr">
                          <td id="td">{form.patient_name}</td>
                          <td id="td">{form.test_name}</td>
                          <td id="td">{form.date}</td>
                          <td id="td">{form.status}</td>
                          <td id="td">
                            <Button
                              onClick={() => {
                                handlershow(form.action);
                                console.log(form.action)
                                setSelectForms(form);
                              }}
                              id="btns"
                              variant="outline-secondary"
                              size="sm"
                            >
                              View Result
                            </Button>
                            {showes && (
                              <LabViewresult
                                handlerClose={handlerClose}
                                selectForm={selectForm}
                                selectedResult={selectedResult}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="AddNote p-3"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3>Invoices</h3>
                  <button
                    onClick={handlerShows}
                    className={`p-2 ${styles.notebtn}`}
                  >
                    <LuCirclePlus className="fa me-1" /> Add Invoice
                  </button>
                </div>

                {showes && (
                  <forms.Provider value={{ formsData1, setFormsData1 }}>
                    <InvoiceForm
                      handlerClose={handlerClose}
                      saveButtons={saveButtons}
                      patients={patients}
                    />
                  </forms.Provider>
                )}
                <div className="table-list">
                  <Table
                    className="shodow-sm rounded"
                    id="table"
                  >
                    <thead className="table-light">
                      <tr>
                        <th id="th">Patient Name</th>
                        <th id="th">Test Name</th>
                        <th id="th">Amount</th>
                        <th id="th">Date</th>
                        <th id="th">Status</th>
                        <th id="th">Action</th>
                      </tr>
                    </thead>
                    <tbody className="t-body">
                      {formObj1.map((form, index) => (
                        <tr className="tr" key={index}>
                          <td id="td">{form.patient_name}</td>
                          <td id="td">{form.testname}</td>
                          <td id="td">{Number(form.amount).toFixed(2)}</td>
                          <td id="td">{form.date}</td>
                          <td id="td">{form.status}</td>
                          <td id="td">
                            <Button
                              onClick={() => {
                                invocieResult();
                                setInSelectForm(form);
                              }}
                              id="btns"
                              variant="outline-secondary"
                              size="sm"
                            >
                              View Result
                            </Button>
                            {tab && (
                              <InvoiceViewresult
                                handlerClose={handlerClose}
                                inSelectForm={inSelectForm}
                                selectedResult={selectedResult}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Labtest;