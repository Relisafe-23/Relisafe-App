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
import Safety_ComponentType from "./ComponentTypes/Safety_ComponentType.js";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";

function SafetyReport(props) {
  const [projectId, setProjectId] = useState(props?.projectId);
  const [isLoading, setIsLoading] = useState(true);
  const moduleType = props?.selectModule;
  const reportType = props?.selectModuleFieldValue;
  const hierarchyType = props?.hierarchyType;
  const [projectData, setProjectData] = useState(null);
  const history = useHistory();
  const [permission, setPermission] = useState();
  const [data, setData] = useState([]);
  const [columnLength, setColumnLength] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    Reference: true,
    FR: true,
  });

  const headerKeyMapping = {
    "Product Name": "productName", // Mapped to productId
    "Part Number": "partNumber", // Mapped to productId
    Quantity: "quantity", // Mapped to productId
    Reference: "reference", // Mapped to productId
    Category: "category", // Mapped to productId
    "Part Type": "partType", // Mapped to productId
    FR: "fr", // Mapped to productId
    "Function associated with the hazard": "function", // Mapped to safetyData
    Hazard: "failureMode", // Mapped to safetyData
    "Mode of Operation": "modeOfOperation", // Mapped to safetyData
    "Hazard Cause": "hazardCause", // Mapped to safetyData
    "Effect of the Hazard": "effectOfHazard", // Mapped to safetyData
    "Hazard Classification": "hazardClasification", // Mapped to safetyData
    "Design Assurance Level (DAL) associated with the hazard":
      "designAssuranceLevel", // No mapping provided
    "Means of Detection": "meansOfDetection", // Mapped to safetyData
    "Crew Response": "crewResponse", // Mapped to safetyData
    "Unique Hazard Identifiers": "uniqueHazardIdentifier", // Mapped to safetyData
    "Initial Severity ((impact))": "initialSeverity", // Mapped to safetyData
    "Initial likelihood (probability)": "initialLikelihood", // Mapped to safetyData
    "Initial Risk Level": "initialRiskLevel", // Mapped to safetyData
    "Design Mitigation": "designMitigation", // Mapped to safetyData
    "Mitigation Responsibility": "designMitigatonResbiity", // No mapping provided
    "Mitigation Evidence": "designMitigtonEvidence", // No mapping provided

    "Opernal Maintan Mitigation": "opernalMaintanMitigation", // Mapped to safetyData
    "Opernal Mitigaton Resbility": "opernalMitigatonResbility", // No mapping provided
    "Operatnal Mitigation Evidence": "operatnalMitigationEvidence", // No mapping provided

    "Residual Severity ((impact))": "residualSeverity", // No mapping in your data, update if needed
    "Residual Likelihood (probability)": "residualLikelihood", // No mapping in your data, update if needed
    "Residual Risk Level": "residualRiskLevel", // No mapping in your data, update if needed
    "FTA Name/ID": "ftaNameId", // No mapping in your data, update if needed
    "Hazard Status": "hazardStatus",
    "User Field 1": "userField1", // Mapped to safetyData
    "User Field 2": "userField2", // Mapped to safetyData
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
    "FR",
    "Function associated with the hazard",
    "Hazard",
    "Mode of Operation",
    "Hazard Cause",
    "Effect of the Hazard",
    "Hazard Classification",
    "Design Assurance Level (DAL) associated with the hazard",
    "Means of Detection",
    "Crew Response",
    "Unique Hazard Identifiers",
    "Initial Severity ((impact))",
    "Initial likelihood (probability)",
    "Initial Risk Level",
    "Design Mitigation",
    "Mitigation Responsibility",
    "Mitigation Evidence",
    "Operational/Maintenance Mitigation",
    "Residual Severity ((impact))",
    "Residual Likelihood (probability)",
    "Residual Risk Level",
    "Hazard Status",
    "FTA Name/ID",
    "Other Relevant Information",
    "User Field 1",
    "User Field 2",
    "User Field 3",
    "User Field 4",
    "User Field 5",
  ];
  const columnWidths = {
    "Product Name": "130px",
    "Part Number": "120px",
    Quantity: "80px",
    Reference: "130px",
    Category: "100px",
    "Part Type": "100px",
    FR: "60px",
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

    Api.get(`/api/v1/reports/get/safety/report`, {
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

  const safetyData = data?.map((item) => ({
    productId: item?.productId || {},
    safetyData: item?.safetyData || {},
  }));
  useEffect(() => {
    getProjectDetails();
    getProjectPermission();
    if (reportType == 5) {
      <Safety_ComponentType />;
    } else {
      getTreeProduct();
    }
    const columnCount = Object.keys(headerKeyMapping).length;
    if (columnCount > 13) {
      setColumnLength(true);
    }
  }, [projectId, reportType, hierarchyType]);

  const handleColumnVisibilityChange = (event) => {
    const { name, checked } = event.target;
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [name]: checked,
    }));
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
      ["Document Title", "SAFETY"],
      [],
      [],
      ["Rev", ""],
      ["Rev Date", ""],
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Document Title", "SAFETY"],
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
      ["Document Title", "SAFETY"],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Project Description", projectData?.projectDesc || ""],
      [],
      headers, // Header row
      ...safetyData.map((row) =>
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
      ["Document Title", "SAFETY"],
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
    XLSX.writeFile(workbook, "safety_report.xlsx");
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
        pdf.save("safety_report.pdf");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  // Function to generate Word document

  const generateWordDocument = () => {
    if (!projectData) {
      console.error("Project data is not available.");
      return;
    }

    // Table header row
    const tableRows = [
      new TableRow({
        children: headers
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

    // Table data rows
    safetyData.forEach((row) => {
      const tableRow = new TableRow({
        children: headers
          .filter((header) => columnVisibility[header] !== false)
          .map(
            (header) =>
              new TableCell({
                children: [
                  new Paragraph({
                    text: row[headerKeyMapping[header]] || "-",
                  }),
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
              })
          ),
      });
      tableRows.push(tableRow);
    });

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
                  text: `Project Description: ${projectData.projectDesc || "-"
                    }`,
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty paragraph for spacing
            new Table({
              rows: tableRows,
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, "safety_report.docx");
      })
      .catch((error) => {
        console.error("Error generating Word document:", error);
      });
  };
  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="mt-3"></div>
          {safetyData?.length > 0 ? (
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
          {safetyData?.length > 0 ? (
            <div id="pdf-report-content">
              <div id="first-page-report">
                <FirstPageReport
                  projectId={projectId}
                  moduleType={moduleType}
                />
              </div>

              <div className="sheet-container mt-3" id="main-content-report">
                <div className="sheet">
                  <Row className="d-flex justify-content-between">
                    <Col className="d-flex flex-column align-items-center"></Col>
                    <Col className="d-flex flex-column align-items-center">
                      <h5>{projectData?.projectName}</h5>
                      <h5>SAFETY</h5>
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
                    {safetyData?.length > 0 ? (
                      <Row className="d-flex align-items-center justify-content-end">
                        <Col className="d-flex flex-row custom-checkbox-group">
                          <Form.Check
                            type="checkbox"
                            name="Reference"
                            label="Reference"
                            checked={columnVisibility.Reference}
                            onChange={handleColumnVisibilityChange}
                            className="custom-checkbox ml-5"
                          />
                          <Form.Check
                            type="checkbox"
                            name="FR"
                            label="FR"
                            checked={columnVisibility.FR}
                            onChange={handleColumnVisibilityChange}
                            className="custom-checkbox ml-5"
                          />
                        </Col>
                      </Row>
                    ) : null}
                  </div>

                  {safetyData?.map((part, partIndex) => (
                    <div style={{ overflowX: "auto" }}>
                      <table className="report-table">
                        <thead>
                          <tr>
                            {headers
                              .filter((header) =>
                                header === "FR" || header === "Reference"
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
                          {safetyData?.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {headers.map((header) => {
                                const key = headerKeyMapping[header];
                                let value = key
                                  ? row?.productId?.[key] ??
                                  row?.safetyData?.[key] ??
                                  "-"
                                  : "-";
                                // Check if the header is "FR" and format the value to 6 decimal places
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
                  ))}
                </div>
              </div>
              <div id="last-page-report">
                <LastPageReport projectId={projectId} moduleType={moduleType} />
              </div>
            </div>
          ) : <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <h3>No Records to Display</h3>
          </div>
          }
        </div>
      )}
    </div>
  );
}
export default SafetyReport;
