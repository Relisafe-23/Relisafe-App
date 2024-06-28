import React, { useState, useEffect } from "react";
import { Col, Form, Row, Card, Button } from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/Reports.scss";
import { Formik, ErrorMessage } from "formik";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import * as XLSX from "xlsx";


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
  const [columnVisibility, setColumnVisibility] = useState({
    "Product Name": true,
    "Part Number": true,
    "Quantity": true,
    "Reference": true,
    "Category": true,
    "Part Type": true,
    "Environment": true,
    "Temperature": true,
    FR: true,
    MTTR: true,
    MCT: true,
    MLH: true,
  });

    // Mapping of headers to data keys
    const headerKeyMapping = {
      "Product Name": "productName",
      "Part Number": "partNumber",
      "Quantity": "quantity",
      "Reference": "reference",
      "Category": "category",
      "Part Type": "partType",
      "Environment": "environment",
      "Temperature": "temperature",
      FR: "fr",
      MTTR: "mttr",
      MCT: "mct",
      MLH: "mlh",
    };
  

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
    FR: "60px",
    MTTR: "60px",
    MCT: "60px",
    MLH: "60px",
  };

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

  const customSort = (a, b) => {
    const indexA = a.indexCount.toString();
    const indexB = b.indexCount.toString();

    return indexA.localeCompare(indexB, undefined, { numeric: true });
  };

  // Sort the data array using the custom sort function
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
  }, [projectId]); // Include projectId in dependency array to trigger effect on change

  const handleReset = (resetForm) => {
    resetForm();
  };

  const generateReport = () => {
    console.log("test...");
  };

  const handleColumnVisibilityChange = (event) => {
    const { name, checked } = event.target;
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [name]: checked,
    }));
  };

  // Log sorted data to debug
  useEffect(() => {
    console.log(sortedData);
  }, [sortedData]);


  // const exportToExcel = () => {
  //   const exportData = sortedData.map((row) => {
  //     const exportRow = {};
  //     headers.forEach((header) => {
  //       if (columnVisibility[header]) {
  //         exportRow[header] = row[headerKeyMapping[header]] || "-";
  //       }
  //     });
  //     return exportRow;
  //   });
  
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  //   XLSX.writeFile(workbook, "report.xlsx");
  // };

  const exportToExcel = () => {
    // Create a new worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Project Report"], // Title row
      [], // Empty row for spacing
      ["Project Name:", projectData?.projectName || ""], // Project Name
      ["Project Number:", projectData?.projectNumber || ""], // Project Number
      ["Project Description:", projectData?.projectDesc || ""], // Project Description
      [], // Empty row for spacing
    ]);
  
    // Prepare the data for export
    const exportData = sortedData.map((row) => {
      const exportRow = {};
      headers.forEach((header) => {
        if (columnVisibility[header]) {
          exportRow[header] = row[headerKeyMapping[header]] || "-";
        }
      });
      return exportRow;
    });
  
    // Append the data to the worksheet
    XLSX.utils.sheet_add_json(worksheet, exportData, { origin: -1 });
  
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  
    // Write the workbook to a file
    XLSX.writeFile(workbook, "project_report.xlsx");
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
                  generateReport();
                  setShowReport(true);
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
                                setSelectModuleFieldValue(e.value);
                                formikProps.setFieldValue("Field", {
                                  label: e.label,
                                  value: e.value,
                                });
                              }}
                              placeholder="Select Field"
                              name="Field"
                              options={[
                                { value: "Hierarchy levels", label: "Hierarchy levels" },
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
                      <Row>
                        <Col>
                          <Form.Check
                            type="checkbox"
                            name="FR"
                            label="FR"
                            checked={columnVisibility.FR}
                            onChange={handleColumnVisibilityChange}
                          />
                        </Col>
                        <Col>
                          <Form.Check
                            type="checkbox"
                            name="MTTR"
                            label="MTTR"
                            checked={columnVisibility.MTTR}
                            onChange={handleColumnVisibilityChange}
                          />
                        </Col>
                        <Col>
                          <Form.Check
                            type="checkbox"
                            name="MCT"
                            label="MCT"
                            checked={columnVisibility.MCT}
                            onChange={handleColumnVisibilityChange}
                          />
                        </Col>
                        <Col>
                          <Form.Check
                            type="checkbox"
                            name="MLH"
                            label="MLH"
                            checked={columnVisibility.MLH}
                            onChange={handleColumnVisibilityChange}
                          />
                        </Col>
                      </Row>
                      <Row>
                      <Button className="save-btn" onClick={exportToExcel}>
                        Export to Excel
                        </Button>

                      </Row>
                    </Card>
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
                  {headers
                    .filter(
                      (header) =>
                        header === "FR" ||
                        header === "MTTR" ||
                        header === "MCT" ||
                        header === "MLH"
                          ? columnVisibility[header]
                          : true
                    )
                    .map((header) => (
                      <th
                        key={header}
                        style={{
                          width: columnWidths[header],
                          textAlign: "center",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers
                      .filter((header) => columnVisibility[header] !== false)
                      .map((header) => (
                        <td key={header} style={{ textAlign: "center" }}>
                          {row[headerKeyMapping[header]] || "-"}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Reports;
