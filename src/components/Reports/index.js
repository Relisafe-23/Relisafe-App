import React, { useState, useEffect } from "react";
import {
  Col,
  Form,
  Row,
  Card,
  Button,
} from "react-bootstrap";
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
  const [data, setData] = useState([]);
  const token = localStorage.getItem("sessionId");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const headers = [
    "Product Name",
    "Part Number",
    "Quantity",
    "Reference",
    "Category",
    "Part Type",
    "Environment",
    "Temperature",
    "FR",
    "MTTR",
    "MCT",
    "MLH",
  ];

  const columnWidths = {
    "Product Name": "130px",
    "Part Number": "120px",
    "Quantity": "80px",
    "Reference": "130px",
    "Category": "100px",
    "Part Type": "100px",
    "Environment": "120px",
    "Temperature": "120px",
    "FR": "60px",
    "MTTR": "60px",
    "MCT": "60px",
    "MLH": "60px",
  };
  const [optionalFieldsVisibility, setOptionalFieldsVisibility] = useState({
    FR: true,
    MTTR: true,
    MCT: true,
    MLH: true,
  });
  

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const getProjectDetails = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`)
      .then((res) => {
        setProjectData(res.data.data);
      })
      .catch((error) => {
        console.error("Error fetching project details:", error);
      })
      .finally(() => {
        setIsLoading(false); 
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

  const customSort = (a, b) => {
    const indexA = a.indexCount.toString();
    const indexB = b.indexCount.toString();

    return indexA.localeCompare(indexB, undefined, { numeric: true });
  };

  const sortedData = data.slice().sort(customSort);

  const getTreeProduct = () => {
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: {
        projectId: projectId,
        userId: userId,
        token: sessionId,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;
        setData(treeData);
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
    getTreeProduct();
  }, [projectId]);

  const handleReset = (resetForm) => {
    resetForm();
  };

  const generateReport = () => {
    console.log("test...");
  };

  return (
    <div>
      <div className="mt-5">
        <div>
          <div className="mttr-sec mt-0">
            <p className="mb-0 para-tag d-flex justify-content-center">
              Report
            </p>
          </div>
          {permission?.read === true ||
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
                  <Form
                    onSubmit={formikProps.handleSubmit}
                    onReset={handleReset}
                  >
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
                                {
                                  value: "RA",
                                  label: "Reliability Analysis",
                                },
                                {
                                  value: "MA",
                                  label: "Maintainability analysis",
                                },
                                {
                                  value: "PM",
                                  label: "Preventive maintenance",
                                },
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
                                {
                                  value: "Hierarchy levels,",
                                  label: "Hierarchy levels",
                                },
                                { value: "Assembly", label: "Assembly" },
                                { value: "Electronics", label: "Electronics" },
                                { value: "Mechanical", label: "Mechanical" },
                                {
                                  value: "Component type",
                                  label: "Component type",
                                },
                                {
                                  value: "Spare Parts Analysis",
                                  label: "Spare Parts Analysis",
                                },
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
                            formikProps.resetForm();
                          }}
                        >
                          CANCEL
                        </Button>
                        <Button
                          className="save-btn"
                          onClick={() => {
                            generateReport();
                            setShowReport(true);
                          }}
                          type="submit"
                        >
                          CREATE
                        </Button>
                      </div>
                    </Card>
                  </Form>
                )}
              </Formik>
            </div>
          ) : (
            <p>You are not authorized to access this module</p>
          )}
          {showReport ? (
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
                      {headers.map((header) => 
                        optionalFieldsVisibility[header] !== false && (
                        <th key={header} style={{ width: columnWidths[header], textAlign: "center" }}>
                          {header}
                          {optionalFieldsVisibility.hasOwnProperty(header) && (
                            <input
                              type="checkbox"
                              checked={optionalFieldsVisibility[header]}
                              onChange={() =>
                                setOptionalFieldsVisibility({
                                  ...optionalFieldsVisibility,
                                  [header]: !optionalFieldsVisibility[header],
                                })
                              }
                              style={{ marginLeft: '5px' }}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {optionalFieldsVisibility["Product Name"] !== false && <td style={{ textAlign: "center" }}>{row?.productName}</td>}
                        {optionalFieldsVisibility["Part Number"] !== false && <td style={{ textAlign: "center" }}>{row?.partNumber}</td>}
                        {optionalFieldsVisibility["Quantity"] !== false && <td style={{ textAlign: "center" }}>{row?.quantity}</td>}
                        {optionalFieldsVisibility["Reference"] !== false && <td style={{ textAlign: "center" }}>{row?.reference ? row?.reference : "-"}</td>}
                        {optionalFieldsVisibility["Category"] !== false && <td style={{ textAlign: "center" }}>{row?.category}</td>}
                        {optionalFieldsVisibility["Part Type"] !== false && <td style={{ textAlign: "center" }}>{row?.partType ? row?.partType : "-"}</td>}
                        {optionalFieldsVisibility["Environment"] !== false && <td style={{ textAlign: "center" }}>{row?.environment ? row?.environment : "-"}</td>}
                        {optionalFieldsVisibility["Temperature"] !== false && <td style={{ textAlign: "center" }}>{row?.temperature ? row?.temperature : "-"}</td>}
                        {optionalFieldsVisibility.FR && <td style={{ textAlign: "center" }}>{row?.fr ? row?.fr : "-"}</td>}
                        {optionalFieldsVisibility.MTTR && <td style={{ textAlign: "center" }}>{row?.mttr ? row?.mttr : "-"}</td>}
                        {optionalFieldsVisibility.MCT && <td style={{ textAlign: "center" }}>{row?.mct ? row?.mct : "-"}</td>}
                        {optionalFieldsVisibility.MLH && <td style={{ textAlign: "center" }}>{row?.mlh ? row?.mlh : "-"}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Reports;
