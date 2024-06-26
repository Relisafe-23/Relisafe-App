/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Col,
  Form,
  Row,
  Card,
  Button,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdjust,
  faEdit,
  faEllipsisV,
  faEye,
  faEyeSlash,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import Label from "../LabelComponent";
import "../../css/Reports.scss";
import { Formik, ErrorMessage } from "formik";
import Api from "../../Api";
import Spinner from "react-bootstrap/esm/Spinner";
import { Link, useHistory } from "react-router-dom";

function Reports(props) {
  const [projectId, setProjectId] = useState(props?.location?.state?.projectId);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [selectModule, setSelectModule] = useState("");
  const [selectModuleFieldValue, setSelectModuleFieldValue] = useState("");
  const [showReport, setShowReport] = useState(false);
  const history = useHistory();
  const [permission, setPermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const token = localStorage.getItem("sessionId");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  

  const headers = [
    "Name",
    "Part Number",
    "Quantity",
    "Reference",
    "Category",
    "Environment",
    "Temperature",
    "Product Name",
    "Category",
    "Part Number",
    "Part Type",
    "FR",
    "MTTR",
    "MCT",
    "MLH",
  ];

  // Sample data for demonstration
  const data = [
    [
      "Laptops",
      "L001",
      "100",
      "Position",
      "Assembly",
      "AED",
      "25",
      "Laptops",
      "Assembly",
      "100",
      "Electronical",
      "20",
      "30",
      "40",
      "50",
    ],
    [
      "Laptops",
      "L001",
      "100",
      "Position",
      "Assembly",
      "AED",
      "25",
      "Laptops",
      "Assembly",
      "100",
      "Electronical",
      "20",
      "30",
      "40",
      "50",
    ],
  ];

    // Log out
    const logout = () => {
      localStorage.clear(history.push("/login"));
      window.location.reload();
    };

    
   // Fetch project details based on projectId
   const getProjectDetails = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`)
      .then((res) => {
        setProjectData(res.data.data);
      })
      .catch((error) => {
        console.error("Error fetching project details:", error);
      })
      .finally(() => {
        setIsLoading(false); // Update loading state
      });
  };
  const getProjectPermission = () => {
    const userId = localStorage.getItem("userId");
    setIsLoading(true);
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        authorizedPersonnel: userId,
        projectId: projectId,
        token: token,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setPermission(data?.modules[12]);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  useEffect(() => {
    getProjectDetails();
    getProjectPermission();
  }, [projectId]); // Include projectId in dependency array to trigger effect on change

  const handleReset = (resetForm) => {
    resetForm();
  };

  const generateReport = () =>{
    console.log("test...")
  }

  return (
    <div>
      <div className="mt-5">
      <div className="separate">
        <div className="mttr-sec mt-0">
            <p className=" mb-0 para-tag d-flex justify-content-center">Report</p>
          </div>
         { permission?.read === true ||
        permission?.read === "undefined" ||
        role === "admin" ||
        (isOwner === true && createdBy === userId) ? (
          <div>
          <Formik
            initialValues={{
              Module: selectModule
                ? { label: selectModule, value: selectModule }
                : "",
              Field: selectModuleFieldValue
                ? {
                    label: selectModuleFieldValue,
                    value: selectModuleFieldValue,
                  }
                : "",
              Value: "",
            }}
            onSubmit={(values) => {
              // Handle form submission
              console.log("Generated report with values:", values);
            }}
          >
            {(formikProps) => (
              <Form onSubmit={formikProps.handleSubmit} onReset={handleReset}>
                <Card className="mt-4 mttr-card p-4">
                  <Row>
                    <Col>
                      <Label notify={true}>Report</Label>
                      <Form.Group>
                        <Select
                          value={formikProps.values.Module}
                          onChange={(e) => {
                            setSelectModule(e.value);
                            formikProps.setFieldValue("Field", "");
                            formikProps.setFieldValue("Module", {
                              label: e.label,
                              value: e.value,
                            });
                          }}
                          placeholder="Select Module"
                          name="Module"
                          options={[
                            { value: "RA", label: "Reliability Analysis" },
                            { value: "MA", label: "Maintainability analysis" },
                            { value: "PM", label: "Preventive maintenance" },
                            { value: "SA", label: "Spares analysis" },
                            { value: "FMECA", label: "FMECA" },
                            { value: "SAFETY", label: "SAFETY" },
                          ]}
                        />
                        <ErrorMessage
                          component="span"
                          name="Module"
                          className="error text-danger"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Label notify={true}>Level</Label>
                      <Form.Group>
                        <Select
                          value={formikProps.values.Field}
                          onChange={(e) => {
                            setSelectModule(e.value);
                            formikProps.setFieldValue("Field", "");
                            formikProps.setFieldValue("Field", {
                              label: e.value,
                              value: e.value,
                            });
                          }}
                          placeholder="Select Module"
                          name="Module"
                          options={[
                            { value: "Hierarchy levels,", label: "Hierarchy levels" },
                            { value: "Assembly", label: "Assembly" },
                            { value: "Electronics", label: "Electronics" },
                            { value: "Mechanical", label: "Mechanical" },
                            { value: "Component type", label: "Component type" },
                            { value: "Spare Parts Analysis", label: "Spare Parts Analysis" },
                            { value: "SAFETY", label: "SAFETY" },
                          ]}
                        />
                        <ErrorMessage
                          component="span"
                          name="Module"
                          className="error text-danger"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex flex-direction-row justify-content-end  mt-4 mb-2">
                        <Button
                          className="delete-cancel-btn me-2"
                          variant="outline-secondary"
                          onClick={() => {
                            Formik.resetForm();
                          }}
                        >
                          CANCEL
                        </Button>
                        <Button className="save-btn"
                          onClick={() => {
                           generateReport();
                           setShowReport(true);
                          }}
                        type="submit">
                          CREATE
                        </Button>
                      </div>
                </Card>
              </Form>
            )}
          </Formik>
          </div>
        ):(
          <div>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">Access Denied</Card.Title>
              <Card.Text>
                <p className="text-center">
                  You dont have permission to access these sections
                  <br />
                  Contact admin to get permission or go back to project list
                  page
                </p>
              </Card.Text>
              <Button
                variant="primary"
                className="save-btn fw-bold pbs-button-1"
                onClick={history.goBack}
              >
                Go Back
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}
        </div>
      </div>
      {
        showReport ? (
            <div className="sheet-container">
            <div className="sheet">
              <h1>Reports</h1>
              <div className="sheet-content">
                <div className="field">
                  <label>Project Name:</label>
                  <span>{projectData?.projectName}</span>
                </div>
                <div className="field">
                  <label>Project Number:</label>
                  <span>{projectData?.projectNumber}</span>
                </div>
                <div className="field">
                  <label>Project Description:</label>
                  <span>{projectData?.projectDesc}</span>
                </div>
              </div>
              <table className="report-table">
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ): null
      }

     
    </div>
  );
}

export default Reports;
