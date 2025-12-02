import React, { useState, useEffect } from "react";
import { Col, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import Select from "react-select";
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
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";
import RA_ComponentType from "./ComponentTypes/RA_ComponentType.js";

function ReliabilityAnalysis(props) {
  const moduleType = props?.selectModule;
  const [projectId, setProjectId] = useState(props?.projectId);
  const reportType = props?.selectModuleFieldValue;
  const hierarchyType = props?.hierarchyType;
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
  const [ftaTreeData, setFtaTreeData] = useState([]);
  const [columnLength, setColumnLength] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    Id: true,
    "Part Name": true,
    "Part Number": true,
    Quantity: true,
    Reference: true,
    Category: true,
    "Part Type": true,
    Environment: true,
    Temperature: true,
    FR: true,
    MTTR: true,
    MCT: true,
    MLH: true,
  });
  const safeData = data?.map((item) => ({
    productId: item?.productId || {},
    failureRatePrediction: item?.failureRatePrediction || {},
  }));

  // Mapping of headers to data keys
  const headerKeyMapping = {
    Id: "indexCount",
    "Part Name": "productName",
    "Part Number": "partNumber",
    Quantity: "quantity",
    Reference: "reference",
    Category: "category",
    "Part Type": "partType",
    Environment: "environment",
    Temperature: "temperature",
    FR: "fr",
    MTTR: "mttr",
    MCT: "mct",
    MLH: "mlh",
    Source: "source",
    Predicted: "predicted",
    "Duty Cycle": "dutyCycle",
    "FR Distribution": "frDistribution",
    "FR Remarks": "frRemarks",
    Standard: "standard",
    "FR Offset Operand": "frOffsetOperand",
    "Failure Rate Offset": "failureRateOffset",
    "FR Unit": "frUnit",
  };
  const ftaHeaderKeyMapping = {
    Source: "source",
    Predicted: "predicted",
    "Duty Cycle": "dutyCycle",
    "FR Distribution": "frDistribution",
    "FR Remarks": "frRemarks",
    Standard: "standard",
    "FR Offset Operand": "frOffsetOperand",
    "Failure Rate Offset": "failureRateOffset",
    "FR Unit": "frUnit",
  };

  const token = localStorage.getItem("sessionId");

  const headers = [
    "Id",
    "Part Name",
    "Part Number",
    "Quantity",
    "Reference",
    "Category",
    "Part Type",
    "Environment",
    "Temperature",
    "FR",
    "Source",
    "Predicted",
    "Duty Cycle",
    "FR Distribution",
    "FR Remarks",
    "Standard",
    "FR Offset Operand",
    "Failure Rate Offset",
    "FR Unit",
  ];
  const FTPHeader = [
    "Source",
    "Predicted",
    "Duty Cycle",
    "FR Distribution",
    "FR Remarks",
    "Standard",
    "FR Offset Operand",
    "Failure Rate Offset",
    "FR Unit",
  ];
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

    Api.get(`/api/v1/reports/get/reliablility/report`, {
      params: {
        projectId: projectId,
        reportType: reportType,
        userId: userId,
        token: sessionId,
      },
    })
      .then((res) => {
        console.log("Tree Data:", res);
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

  useEffect(() => {
    getProjectDetails();
    getProjectPermission();
    getFtaData();

    if (reportType == 5) {
      <RA_ComponentType />;
    } else if (reportType == 1) {
      getHierarchyLevelTreeProduct();
    } else {
      getTreeProduct();
    }
    const columnCount = Object.keys(headerKeyMapping).length;
    if (columnCount > 13) {
      setColumnLength(true);
    }
  }, [projectId, reportType, hierarchyType]);

  const getHierarchyLevelTreeProduct = () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/reports/get/reliablility/report`, {
      params: {
        projectId: projectId,
        reportType: reportType,
        hierarchyType: hierarchyType,
        userId: userId,
        token: sessionId,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;
        console.log("Hierarchy Level Tree Data:", treeData);
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

  const getFtaData = () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/productTreeStructure/fta/details`, {
      params: {
        projectId: projectId,
        userId: userId,
        token: sessionId,
      },
    })
      .then((res) => {
        const frpData = res?.data?.data;
        setFtaTreeData(frpData);
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
      ["Document Title", "Reliability Analysis"],
      [],
      [],
      ["Rev", ""],
      ["Rev Date", ""],
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Document Title", "Reliability Analysis"],
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
    const mainContentData = [
      [],
      [],
      ["Project Report"],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Project Description", projectData?.projectDesc || ""],
      [],
      headers.filter((header) => columnVisibility[header]), // Header row
    ];

    // Map the safeData rows to the Excel sheet
    safeData.forEach((row) => {
      const rowData = headers
        .map((header) => {
          const key = headerKeyMapping[header];
          // Get the value from either productId or failureRatePrediction, or fallback to '-'
          const value =
            row.productId[key] ?? row.failureRatePrediction[key] ?? "-";
          return columnVisibility[header] ? value : null;
        })
        .filter((item) => item !== null);

      // Add the mapped row data to the mainContentData array
      mainContentData.push(rowData);
    });

    // Convert the main content data to an Excel worksheet
    const mainContentWorksheet = XLSX.utils.aoa_to_sheet(mainContentData);

    // Last Page Worksheet
    const lastPageData = [
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Document Title", "Reliability Analysis"],
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
    XLSX.writeFile(workbook, "reliability_analysis.xlsx");
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
        pdf.save("reliability_analysis.pdf");
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
    const projectTableRows = [
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
    const ftpTableRows = [
      new TableRow({
        children: FTPHeader.map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ text: header, bold: true })],
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
        ),
      }),
    ];

    ftaTreeData.forEach((row) => {
      const tableRow = new TableRow({
        children: FTPHeader.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  text: row[ftaHeaderKeyMapping[header]] || "-",
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
        ),
      });
      ftpTableRows.push(tableRow);
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
            new Paragraph({
              children: [
                new TextRun({
                  text: "Failure Rate Prediction",
                  bold: true,
                  size: 32, // 16pt font size
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty paragraph for spacing
            new Table({
              rows: ftpTableRows,
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, "reliability_analysis.docx");
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
          {safeData?.length > 0 ? (
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

                  {/* <Button
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
                  </Button> */}
                </Col>
              </Row>

              {columnLength && (
                <Row>
                  <Col className="d-flex justify-content-end">
                    {/* <p style={{ color: "red", textAlign: "right" }}>
                      *You cannot download the PDF or Word document when the
                      number of columns exceeds the limit.
                    </p> */}
                  </Col>
                </Row>
              )}
            </>
          ) : null}
          {safeData.length > 0 ? (
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
                    <h5>Reliability Analysis</h5>
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
                <div style={{ overflowX: "auto" }}>
                  <table className="report-table">
                    <thead>
                      <tr>
                        {headers.map((header) => (
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
                      {safeData?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {headers.map((header) => {
                            const key = headerKeyMapping[header];
                            let value =
                              row.productId[key] ??
                              row.failureRatePrediction[key] ??
                              "-";

                            // Check if the header is "FR" and format the value to 6 decimal places
                            if (header === "FR" && typeof value === "number") {
                              value = value.toFixed(6);
                            }

                            return (
                              <td key={header} style={{ textAlign: "center" }}>
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default ReliabilityAnalysis;
