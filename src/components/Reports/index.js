import React, { useState, useEffect } from "react";
import { Col, Form, Row, Card, Button } from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/Reports.scss";
import { Formik, ErrorMessage } from "formik";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import PBSReport from "./PbsReport.js";
import RAReport from "./ReliabilityAnalysis.js";
import MaintabilityReport from "./MainTainabilityReport.js";

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

  const generateReport = (values) => {
    setSelectModule(values.Module.value);
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
                  generateReport(values);
                  setShowReport(true);
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
                                setSelectModule("");
                                formikProps.setFieldValue("Field", "");
                                formikProps.setFieldValue("Module", {
                                  label: e.label,
                                  value: e.value,
                                });
                              }}
                              placeholder="Select Module"
                              name="Module"
                              options={[
                                { value: "PBS", label: "PBS" },
                                { value: "RA", label: "Reliability Analysis" },
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
                                setSelectModuleFieldValue(e.value);
                                formikProps.setFieldValue("Field", {
                                  label: e.label,
                                  value: e.value,
                                });
                              }}
                              placeholder="Select Field"
                              name="Field"
                              options={[
                                {
                                  value: "Hierarchy levels",
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
                              name="Field"
                              className="error text-danger"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex flex-direction-row justify-content-end mt-4 mb-2">
                        <Button
                          className="delete-cancel-btn me-2"
                          variant="outline-secondary"
                          onClick={() => {
                            formikProps.resetForm();
                          }}
                        >
                          CANCEL
                        </Button>
                        <Button className="save-btn" type="submit">
                          GET REPORT
                        </Button>
                      </div>
                    
                    </Card>
                    { 
                    selectModule === "PBS" ?                 
                    <PBSReport projectId={projectId} /> 
                    :  selectModule === "RA" ?
                    <RAReport projectId={projectId} /> 
                    :  selectModule == "MA" ?
                    <MaintabilityReport projectId={projectId}/>
                    : null 
                  }
                  </Form>
                )}
              </Formik>
            </div>
          ) : (
            <div>
              <Card>
                <Card.Body>
                  <Card.Title className="text-center">Access Denied</Card.Title>
                  <Card.Text>
                    <p className="text-center">
                      You don't have permission to access these sections
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
    </div>
  );
}

export default Reports;
