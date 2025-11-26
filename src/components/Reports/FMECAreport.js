import React, { useState, useEffect } from "react";
import { Col, Form, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { FaFileExcel, FaFilePdf, FaFileWord } from "react-icons/fa";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import Loader from "../core/Loader";
import FMECA_ComponentType from "./ComponentTypes/FMECA_ComponentType.js";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";

function FMECAreport(props) {
  const [projectId, setProjectId] = useState(props?.projectId);
  const [isLoading, setIsLoading] = useState(true);
  const moduleType = props?.selectModule;
  const reportType = props?.selectModuleFieldValue;
  const hierarchyType = props?.hierarchyType;
  const [projectData, setProjectData] = useState(null);
  const [selectModule, setSelectModule] = useState("");
  const [selectModuleFieldValue, setSelectModuleFieldValue] = useState("");
  const [showReport, setShowReport] = useState(false);
  const history = useHistory();
  const [permission, setPermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [data, setData] = useState([]);
  const [FmecaTreeData, setFMECATreeData] = useState([]);
  const [columnLength, setColumnLength] = useState(false);
  const [pmmraTreeData, setPmmraTreeData] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    "PM Task ID": true,
    "PM Task Type": true,
    "Task Intervel Frequency": true,
    "Task Interval Unit": true,
    "Latitude / Frequency tolerance": true,
    "Scheduled Maintance Task": true,
    "Task Intervel Determination": true,
    "Task Description": true,
  });

  // Mapping of headers to data keys
  const headerKeyMapping = {
    "Product Name": "productName",
    "Part Number": "partNumber",
    Quantity: "quantity",
    Reference: "reference",
    Category: "category",
    "Part Type": "partType",
    Environment: "environment",
    Temperature: "temperature",
    FR: "fr",
    "FMECA ID": "fmecaId",
    "Operating phase": "operatingPhase",
    Function: "function",
    "Failure Mode": "failureMode",
    "Failure Mode Ratio Alpha": "failureModeRatioAlpha",
    cause: "cause",
    "Sub system effect": "subSystemEffect",
    "End Effect": "endEffect",
    "End Effect ratio Beta(Must equal to 1)": "endEffectRatioBeta",
    "Safety Impact": "safetyImpact",
    "Reference Hazard ID": "referenceHazardId",
    "Reliability impact": "realibilityImpact",
    "Service Disruption Time(Minutes)": "serviceDisruptionTime",
    Frequency: "frequency",
    Severity: "severity",
    "Risk Index": "riskIndex",
    "Detectable means during operation": "detectableMeansDuringOperation",
    "Detectable means maintainer": "detectableMeansToMaintainer",
    "Built in Test": "BuiltInTest",
    "Design Control": "designControl",
    "Maintenance Control": "maintenanceControl",
    "Export Constraints": "exportConstraints",
    "immediate action during operational phase":
      "immediteActionDuringOperationalPhase",
    "user field 1": "userField1",
    "user field 2": "userField2",
    "user field 3": "userField3",
    "user field 4": "userField4",
    "user field 5": "userField5",
    "user field 6": "userField6",
    "user field 7": "userField7",
    "user field 8": "userField8",
    "user field 9": "userField9",
    "user field 10": "userField10",
    "PM Task ID": "pmTaskId",
    "PM Task Type": "pmTaskType",
    "Task Intervel Frequency": "taskIntrvlFreq",
    "Task Interval Unit": "taskIntrvlUnit",
"Latitude / Frequency tolerance": "LatitudeFreqTolrnc",
    "Scheduled Maintance Task": "scheduleMaintenceTsk",
    "Task Intervel Determination": "tskInteralDetermination",
    "Task Description": "taskDesc",
  };
  const fmecaHeaderKeyMapping = {
    "FMECA ID": "fmecaId",
    "Operating phase": "operatingPhase",
    Function: "function",
    "Failure Mode": "failureMode",
    "Failure Mode Ratio Alpha": "failureModeRatioAlpha",
    cause: "cause",
    "Sub system effect": "subSystemEffect",
    "End Effect": "endEffect",
    "End Effect ratio Beta(Must equal to 1)": "endEffectRatioBeta",
    "Safety Impact": "safetyImpact",
    "Reference Hazard ID": "referenceHazardId",
    "Reliability impact": "realibilityImpact",
    "Service Disruption Time(Minutes)": "serviceDisruptionTime",
    Frequency: "frequency",
    Severity: "severity",
    "Risk Index": "riskIndex",
    "Detectable means during operation": "detectableMeansDuringOperation",
    "Detectable means maintainer": "detectableMeansToMaintainer",
    "Built in Test": "BuiltInTest",
    "Design Control": "designControl",
    "Maintenance Control": "maintenanceControl",
    "Export Constraints": "exportConstraints",
    "immediate action during operational phase":
      "immediteActionDuringOperationalPhase",
    "user field 1": "userField1",
    "user field 2": "userField2",
    "user field 3": "userField3",
    "user field 4": "userField4",
    "user field 5": "userField5",
    "user field 6": "userField6",
    "user field 7": "userField7",
    "user field 8": "userField8",
    "user field 9": "userField9",
    "user field 10": "userField10",
  };
  const pmmraHeaderKeyMapping = {
    "PM Task ID": "pmTaskId",
    "PM Task Type": "pmTaskType",
    "Task Intervel Frequency": "taskIntrvlFreq",
    "Task Interval Unit": "taskIntrvlUnit",
 "Latitude / Frequency tolerance": "LatitudeFreqTolrnc",
     "Scheduled Maintance Task": "scheduleMaintenceTsk",
    "Task Intervel Determination": "tskInteralDetermination",
    "Task Description": "taskDesc",
  };

  const token = localStorage.getItem("sessionId");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const header1 = [
    "S.No",
    "Product Name",
    "Part Number",
    "Quantity",
    "Reference",
    "Category",
    "Part Type",
    "Environment",
    "Temperature",
    "FR",
    "FMECA ID",
    "Operating phase",
    "Function",
    "Failure Mode",
    "Failure Mode Ratio Alpha",
    "cause",
    "Sub system effect",
    "End Effect",
    "End Effect ratio Beta(Must equal to 1)",
    "Safety Impact",
    "Reference Hazard ID",
    "Reliability impact",
    "Service Disruption Time(Minutes)",
    "Frequency",
    "Severity",
    "Risk Index",
    "Detectable means during operation",
    "Detectable means maintainer",
    "Built in Test",
    "Design Control",
    "Maintenance Control",
    "Export Constraints",
    "immediate action during operational phase",
    "user field 1",
    "user field 2",
    "user field 3",
    "user field 4",
    "user field 5",
    "user field 6",
    "user field 7",
    "user field 8",
    "user field 9",
    "user field 10",
  ];

  const header2 = [
    "PM Task ID",
    "PM Task Type",
    "Task Intervel Frequency",
    "Task Interval Unit",
    "Latitude / Frequency tolerance",
    "Scheduled Maintance Task",
    "Task Intervel Determination",
    "Task Description",
  ];

  const combinedHeaders = header1.concat(header2);
  const columnWidths = {
    Source: "130px",
    Predicted: "120px",
    "Duty Cycle": "80px",
    "FR Distribution": "130px",
    "FR Remarks": "100px",
    Standard: "100px",
    "FR Offset Operand": "120px",
    "Failure Rate Offset": "120px",
    "FR Unit": "60px",
  };

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  // Fetch project details based on projectId
  const getProjectDetails = () => {
    setIsLoading(true);
    Api.get(`/api/v1/projectCreation/${projectId}`)
      .then((res) => {
        setProjectData(res.data.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error fetching project details:", error);
      })
      .finally(() => {
        setIsLoading(false); // Update loading state
      });
  };

  const getProjectPermission = () => {
    setIsLoading(true);
    const userId = localStorage.getItem("userId");
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
        setIsLoading(false);
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const getTreeProduct = () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/reports/get/fmeca/report`, {
      params: {
        projectId: projectId,
        userId: userId,
        token: sessionId,
        reportType: reportType,
        hierarchyType: hierarchyType,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;
        setData(treeData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const fmecaData = data?.map((item) => ({
    productId: item?.productId || {},
    fmecaData: item?.fmecaData || {},
    pmmraData: item?.pmmraData || {},
  }));

  useEffect(() => {
    getProjectDetails();
    getProjectPermission();
    getFmecaData();
    getPmmraData();
    if (reportType == 5) {
      <FMECA_ComponentType />;
    } else {
      getTreeProduct();
    }
    const columnCount = Object.keys(headerKeyMapping).length;
    if (columnCount > 13) {
      setColumnLength(true);
    }
  }, [projectId, reportType, hierarchyType]);

  const getFmecaData = () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/productTreeStructure/fmeca/details`, {
      params: {
        projectId: projectId,
        userId: userId,
        token: sessionId,
      },
    })
      .then((res) => {
        const fmecaData = res?.data?.data;
        setFMECATreeData(fmecaData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  const getPmmraData = () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/productTreeStructure/pmmra/details`, {
      params: {
        projectId: projectId,
        userId: userId,
        token: sessionId,
      },
    })
      .then((res) => {
        const pmmraData = res?.data?.data;
        setPmmraTreeData(pmmraData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Log sorted data to debug

  const exportToExcel = () => {
    if (!projectData) {
      console.error("Project data is not available.");
      return;
    }

    // First Page Worksheet
    const firstPageData = [
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Document Title", "FMECA"],
      [],
      [],
      ["Rev", ""],
      ["Rev Date", ""],
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Document Title", "FMECA"],
      ["Revision", ""],
      ["Date", ""],
      [],
      ["Created By", ""],
      ["Created Date", ""],
      [],
      ["Reviewed By", ""],
      ["Reviewed Date", ""],
      [],
      ["Approved By", ""],
      ["Approved Date", ""],
    ];

    const firstPageWorksheet = XLSX.utils.aoa_to_sheet(firstPageData);

    // Applying styles to the first project name cell
    firstPageWorksheet["C3"] = {
      font: {
        bold: true,
      },
    };

    // Main Content Worksheet
    const headers = Object.keys(headerKeyMapping); // Assuming you have defined this
    const mainContentData = [
      [],
      [],
      ["Document Title", "FMECA"],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Project Description", projectData?.projectDesc || ""],
      [],
      headers, // Header row
      ...fmecaData.map((row) =>
        headers.map((header) => {
          const key = headerKeyMapping[header];
          return (
            row?.productId?.[key] ??
            row?.fmecaData?.[key] ??
            row?.pmmraData?.[key] ??
            "-"
          );
        })
      ),
    ];

    // Convert the main content data to an Excel worksheet
    const mainContentWorksheet = XLSX.utils.aoa_to_sheet(mainContentData);

    // Last Page Worksheet
    const lastPageData = [
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Document Title", "FMECA"],
      [],
      [],
      ["Rev", ""],
      ["Rev Date", ""],
      [],
      [],
      ["Last Page"],
      [],
      ["Revision History"],
      [],
      ["REVISIONS"],
      [],
      [
        "REVISION",
        "DESCRIPTION",
        "DATE",
        "AUTHOR",
        "CHECKED BY",
        "APPROVED BY",
      ],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
    ];

    const lastPageWorksheet = XLSX.utils.aoa_to_sheet(lastPageData);

    // Create a new workbook and append the worksheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, firstPageWorksheet, "First Page");
    XLSX.utils.book_append_sheet(
      workbook,
      mainContentWorksheet,
      "Main Content"
    );
    XLSX.utils.book_append_sheet(workbook, lastPageWorksheet, "Last Page");

    // Write the workbook to a file
    XLSX.writeFile(workbook, "fmeca_report.xlsx");
  };

  const generatePDFReport = () => {
    if (!projectData) {
      console.error("Project data is not available.");
      return;
    }

    const firstPageContent = document.getElementById("first-page-report");
    const mainContent = document.getElementById("main-content-report");
    const lastPageContent = document.getElementById("last-page-report");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    let pageNumber = 1;

    const addContentToPDF = (element, pageNumber) => {
      return html2canvas(element, {
        scale: 2, // Increase the scale for better quality
        useCORS: true, // Ensure that CORS is handled
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.text(`${pageNumber}`, width - 10, height - 10);
      });
    };

    Promise.resolve()
      .then(() => addContentToPDF(firstPageContent, pageNumber++))
      .then(() => {
        pdf.addPage();
        return addContentToPDF(mainContent, pageNumber++);
      })
      .then(() => {
        pdf.addPage();
        return addContentToPDF(lastPageContent, pageNumber++);
      })
      .then(() => {
        pdf.save("fmeca_report.pdf");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  const generateWordDocument = () => {
    if (!projectData) {
      console.error("Project data is not available.");
      return;
    }

    // Create table rows for headers
    const projectTableRows = [
      new TableRow({
        children: header1
          .filter((header) => columnVisibility[header] !== false)
          .map(
            (header) =>
              new TableCell({
                children: [new Paragraph({ text: header, bold: true })],
                width: { size: 100, type: WidthType.PERCENTAGE },
              })
          ),
      }),
    ];

    // Create table rows for data, following the same mapping logic as in the component
    fmecaData?.forEach((row) => {
      const tableRow = new TableRow({
        children: header1
          .filter((header) => columnVisibility[header] !== false)
          .map((header) => {
            const key = headerKeyMapping[header];
            const value =
              row?.productId?.[key] ??
              row?.fmecaData?.[key] ??
              row?.pmmraData?.[key] ??
              "-";
            return new TableCell({
              children: [new Paragraph({ text: value })],
              width: { size: 100, type: WidthType.PERCENTAGE },
            });
          }),
      });
      projectTableRows.push(tableRow);
    });

    // Create the document structure
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Project Report",
                  bold: true,
                  size: 32, // 16pt font size
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty paragraph for spacing
            new Paragraph({
              children: [
                new TextRun({
                  text: `Project Name: ${projectData.projectName || "-"}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Project Number: ${projectData.projectNumber || "-"}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Project Description: ${
                    projectData.projectDesc || "-"
                  }`,
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty paragraph for spacing
            new Table({
              rows: projectTableRows,
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty paragraph for spacing
          ],
        },
      ],
    });

    // Generate the Word document and trigger the download
    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, "fmeca_report.docx");
      })
      .catch((error) => {
        console.error("Error generating Word document:", error);
      });
  };

  const handleColumnVisibilityChange = (event) => {
    const { name, checked } = event.target;
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [name]: checked,
    }));
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="mt-3"></div>
          {fmecaData?.length > 0 ? (
            <>
              <Row className="d-flex align-items-center justify-content-end">
                <Col className="d-flex justify-content-end">
                  <Button
                    className="report-save-btn"
                    onClick={exportToExcel}
                    style={{ marginRight: "8px" }}
                  >
                    <FaFileExcel style={{ marginRight: "8px" }} />
                    Excel
                  </Button>

                  <Button
                    className="report-save-btn"
                    onClick={generatePDFReport}
                    disabled={columnLength}
                    style={{ marginRight: "8px" }}
                  >
                    <FaFilePdf style={{ marginRight: "8px" }} />
                    PDF
                  </Button>

                  <Button
                    className="report-save-btn"
                    disabled={columnLength}
                    onClick={() => {
                      generateWordDocument(
                        {
                          projectName: projectData.projectName,
                          projectNumber: projectData?.projectNumber,
                          projectDesc: projectData.projectDesc,
                          projectId: "1",
                        },
                        ["Header1", "Header2"],
                        { Header1: true, Header2: true },
                        [{ Header1: "Data1", Header2: "Data2" }],
                        { Header1: "Header1", Header2: "Header2" }
                      );
                    }}
                  >
                    <FaFileWord style={{ marginRight: "8px" }} />
                    Word
                  </Button>
                </Col>
              </Row>

              {columnLength && (
                <Row>
                  <Col className="d-flex justify-content-end">
                    <p style={{ color: "red", textAlign: "right" }}>
                      *You cannot download the PDF or Word document when the
                      number of columns exceeds the limit.
                    </p>
                  </Col>
                </Row>
              )}
            </>
          ) : null}
          {fmecaData?.length > 0 ? (
            <div className="sheet-container mt-3">
              <div className="sheet" id="pdf-report-content">
                <div id="first-page-report">
                  <FirstPageReport
                    projectId={projectId}
                    moduleType={moduleType}
                  />
                </div>
                <Row className="d-flex justify-content-between">
                  <Col className="d-flex flex-column align-items-center"></Col>
                  <Col className="d-flex flex-column align-items-center">
                    <h5>{projectData?.projectName}</h5>
                    <h5>FMECA</h5>
                  </Col>
                  <Col className="d-flex flex-column align-items-center">
                    <h5>Rev:</h5>
                    <h5>Rev Date:</h5>
                  </Col>
                </Row>

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
                <div>
                  <div style={{ overflowX: "auto", marginBottom: "10px" }}>
                    {fmecaData?.length > 0 ? (
                      <Row className="d-flex align-items-center ">
                        <Col className="d-flex flex-row custom-checkbox-group">
                          {header2.map((item) => (
                            <Form.Check
                              type="checkbox"
                              name={item}
                              label={item}
                              checked={columnVisibility[item]}
                              onChange={handleColumnVisibilityChange}
                              className="custom-checkbox ml-5"
                            />
                          ))}
                        </Col>
                      </Row>
                    ) : null}
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="report-table">
                      <thead>
                        <tr>
                          {header1.map((header) => (
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
                          {header2.map((header) =>
                            columnVisibility[header] ? (
                              <th
                                key={header}
                                style={{
                                  width: columnWidths[header],
                                  textAlign: "center",
                                }}
                              >
                                {header}
                              </th>
                            ) : null
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {fmecaData?.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {combinedHeaders.map((header) => {
                              const key = headerKeyMapping[header];
                              let value =
                                row?.productId?.[key] ??
                                row?.fmecaData?.[key] ??
                                row?.pmmraData?.[key] ??
                                "-";
                                if (header === "S.No") {
                              return (
                                <td
                                  key={header}
                                  style={{ textAlign: "center" }}
                                >
                                  {rowIndex + 1}
                                </td>
                              )
                            }
                              if (
                                header === "FR" &&
                                typeof value === "number"
                              ) {
                                value = value.toFixed(6);
                              }
                              return (
                                <td
                                  key={header}
                                  style={{ textAlign: "center" }}
                                >
                                  {value}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div id="last-page-report">
                  <LastPageReport
                    projectId={projectId}
                    moduleType={moduleType}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <h3>No Records to Display</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FMECAreport;
