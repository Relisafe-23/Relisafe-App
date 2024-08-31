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
import FMECAreport from "./FMECAreport.js";
import SafetyReport from "./SafetyReport.js";
import SpareAnalysis from "./SpareAnalysis.js";
import PreventiveManitenance from "./PreventiveManitenance.js";
import * as Yup from "yup";
import PBS_ComponentType from "./ComponentTypes/PBS_ComponentType";
import RA_ComponentType from "./ComponentTypes/RA_ComponentType";
import MA_ComponentType from "./ComponentTypes/MA_ComponentType";
import PM_ComponentType from "./ComponentTypes/PM_ComponentType";
import SA_ComponentType from "./ComponentTypes/SA_ComponentType";
import FMECA_ComponentType from "./ComponentTypes/FMECA_ComponentType";
import Safety_ComponentType from "./ComponentTypes/Safety_ComponentType";

function Reports(props) {
  const projectId =props?.location?.state?.projectId;
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [selectModule, setSelectModule] = useState("");
  const [selectModuleFieldValue, setSelectModuleFieldValue] = useState("");
  const [showReport, setShowReport] = useState(false);
  const history = useHistory();
  const [permission, setPermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [selectHeirarchyLevel, setSelectHeirarchyLevel] = useState(null);

  const token = localStorage.getItem("sessionId");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const reportSchema = Yup.object().shape({
    Module: Yup.object()
      .required({
        label: Yup.string().required("Module is required"),
        value: Yup.string().required("Module is required"),
      })
      .nullable()
      .required("Module is required"),
    Field: Yup.object()
      .required({
        label: Yup.string().required("Field is required"),
        value: Yup.string().required("Field is required"),
      })
      .nullable()
      .required("Field is required"),
  });

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
  }, [projectId, selectModuleFieldValue,selectModule]); // Include projectId in dependency array to trigger effect on change

  useEffect(() => {
    if (selectModule === "PBS" && (selectModuleFieldValue || selectedReportType)) {
      setShowReport(true);
    }
  }, [selectModule, selectModuleFieldValue, selectedReportType]);

  const handleReset = (resetForm) => {
    resetForm();
  };

  const generateReport = (values) => {
    setSelectModule(values.Module.value);
    setShowReport(true);
  };

  return (
    <div>
      <div className="mt-5">
        <div>
          <div className="mttr-sec mt-0">
            <p className="mb-0 para-tag d-flex justify-content-center">Report</p>
          </div>
          {permission?.read === true ||
          permission?.read === "undefined" ||
          role === "admin" ||
          (isOwner === true && createdBy === userId) ? (
            <div>
              <Formik
                initialValues={{
                  Module: selectModule ? { label: selectModule, value: selectModule } : "",
                  Field: selectModuleFieldValue
                    ? {
                        label: selectModuleFieldValue,
                        value: selectModuleFieldValue,
                      }
                    : "",
                  Value: "",
                }}
                validationSchema={reportSchema}
                onSubmit={(values) => {
                  // Handle form submission
                  generateReport(values);
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
                            <ErrorMessage component="span" name="Module" className="error text-danger" />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Label notify={true}>Report Type</Label>
                          <Form.Group>
                            <Select
                              value={formikProps.values.Field}
                              onChange={(e) => {
                                setSelectedReportType(e.value);
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
                                  value: "0",
                                  label: "Relisafe Standard",
                                },
                                {
                                  value: "1",
                                  label: "Hierarchy levels",
                                },
                                { value: "2", label: "Assembly" },
                                { value: "3", label: "Electronics" },
                                { value: "4", label: "Mechanical" },
                                {
                                  value: "5",
                                  label: "Component type",
                                },
                              ]}
                            />
                            <ErrorMessage component="span" name="Field" className="error text-danger" />
                          </Form.Group>
                        </Col>
                        {selectedReportType === "1" && (
                          <Col>
                            <Label notify={true}>Hierarchy Level</Label>
                            <Form.Group>
                              <Select
                                value={formikProps.values.HierarchyLevel}
                                onChange={(e) => {
                                  setSelectHeirarchyLevel(e.value);
                                  formikProps.setFieldValue("HierarchyLevel", {
                                    label: e.label,
                                    value: e.value,
                                  });
                                }}
                                placeholder="Select Field"
                                name="HierarchyLevel"
                                options={[
                                  { value: "1", label: "1" },
                                  { value: "2", label: "2" },
                                  { value: "3", label: "3" },
                                  { value: "4", label: "4" },
                                  { value: "5", label: "5" },
                                  { value: "6", label: "6" },
                                  { value: "7", label: "7" },
                                  { value: "8", label: "8" },
                                  { value: "9", label: "9" },
                                  { value: "10", label: "10" },
                                ]}
                              />
                              <ErrorMessage component="span" name="HierarchyLevel" className="error text-danger" />
                            </Form.Group>
                          </Col>
                        )}
                      </Row>
                      <div className="d-flex flex-direction-row justify-content-end mt-4 mb-2">
                        <Button className="save-btn mx-3" type="submit">
                          GET REPORT
                        </Button>
                        <Button
                          className="delete-cancel-btn"
                          variant="outline-secondary"
                          onClick={() => {
                            formikProps.resetForm();
                            setSelectedReportType("");
                            setShowReport("");
                            setSelectModule("");
                          }}
                        >
                          RESET
                        </Button>
                      </div>
                    </Card>
                    {showReport &&
                      ((selectModule === "PBS" && selectedReportType == 5 && (
                        <PBS_ComponentType 
                        projectId={projectId} 
                        selectModuleFieldValue={selectModuleFieldValue}
                        selectModule={selectModule}
                        />
                      )) ||
                        (selectModule === "RA" && selectedReportType == 5 && (
                          <RA_ComponentType projectId={projectId} 
                          selectModuleFieldValue={selectModuleFieldValue}
                          selectModule={selectModule}
                          />
                        )) ||
                        (selectModule === "MA" && selectedReportType == 5 && (
                          <MA_ComponentType projectId={projectId} 
                          selectModuleFieldValue={selectModuleFieldValue}
                          selectModule={selectModule} />
                        )) ||
                        (selectModule === "PM" && selectedReportType == 5 && (
                          <PM_ComponentType projectId={projectId} 
                          selectModuleFieldValue={selectModuleFieldValue} 
                          selectModule={selectModule}/>
                        )) ||
                        (selectModule === "SA" && selectedReportType == 5 && (
                          <SA_ComponentType projectId={projectId} 
                          selectModuleFieldValue={selectModuleFieldValue}
                          selectModule={selectModule} />
                        )) ||
                        (selectModule === "FMECA" && selectedReportType == 5 && (
                          <FMECA_ComponentType projectId={projectId} 
                          selectModuleFieldValue={selectModuleFieldValue}
                          selectModule={selectModule} />
                        )) ||
                        (selectModule === "SAFETY" && selectedReportType == 5 && (
                          <Safety_ComponentType
                            projectId={projectId}
                            selectModuleFieldValue={selectModuleFieldValue}
                            hierarchyType={selectHeirarchyLevel}
                            selectModule={selectModule}
                          />
                        )) ||
                        (selectModule === "PBS" && (
                          <PBSReport
                            projectId={projectId}
                            selectModuleFieldValue={selectModuleFieldValue}
                            hierarchyType={selectHeirarchyLevel}
                            selectModule={selectModule}
                          />
                        )) ||
                        (selectModule === "RA" && (
                          <RAReport
                            projectId={projectId}
                            selectModuleFieldValue={selectModuleFieldValue}
                            hierarchyType={selectHeirarchyLevel}
                            selectModule={selectModule}
                          />
                        )) ||
                        (selectModule === "MA" &&
                          (
                            <MaintabilityReport
                            projectId={projectId}
                            selectModuleFieldValue={selectModuleFieldValue}
                            hierarchyType={selectHeirarchyLevel}
                            selectModule={selectModule}
                          />
                          ))
                          
                          ||
                        (selectModule === "FMECA" && (
                        <FMECAreport 
                        projectId={projectId}
                        selectModuleFieldValue={selectModuleFieldValue}
                        hierarchyType={selectHeirarchyLevel}
                        selectModule={selectModule}
                        />)) ||
                        (selectModule === "SAFETY" && 
                        (<SafetyReport projectId={projectId}
                          selectModuleFieldValue={selectModuleFieldValue}
                          hierarchyType={selectHeirarchyLevel}
                          selectModule={selectModule}
                           />)) ||
                        (selectModule === "SA" && (
                        
                        <SpareAnalysis 
                        projectId={projectId}
                        selectModuleFieldValue={selectModuleFieldValue}
                        hierarchyType={selectHeirarchyLevel}
                        selectModule={selectModule}
                        />)) ||
                        (selectModule === "PM" &&
                          ( 
                        <PreventiveManitenance   
                        projectId={projectId}
                        selectModuleFieldValue={selectModuleFieldValue}
                        hierarchyType={selectHeirarchyLevel}
                        selectModule={selectModule}
                        />
                          )
                        ))}
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
                      Contact admin to get permission or go back to project list page
                    </p>
                  </Card.Text>
                  <Button variant="primary" className="save-btn fw-bold pbs-button-1" onClick={history.goBack}>
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
