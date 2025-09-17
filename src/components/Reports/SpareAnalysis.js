import React, { useState, useEffect } from "react";
import { Col, Form, Row, Card, Button } from "react-bootstrap";
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
import SA_ComponentType from "./ComponentTypes/SA_ComponentType.js";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";

function SpareAnalysis(props) {
  const [projectId, setProjectId] = useState(props?.projectId);
  const [isLoading, setIsLoading] = useState(true);
  const moduleType = props?.selectModule;
  const [projectData, setProjectData] = useState(null);
  const reportType = props?.selectModuleFieldValue;
  const hierarchyType = props?.hierarchyType;
  const [selectModule, setSelectModule] = useState("");
  const [selectModuleFieldValue, setSelectModuleFieldValue] = useState("");
  const [showReport, setShowReport] = useState(false);
  const history = useHistory();
  const [permission, setPermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [data, setData] = useState([]);
  const [columnLength, setColumnLength] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    "Product Name": true,
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
    MTTR: "mttr",
    MCT: "mct",
    MLH: "mlh",
    Repairable: "repairable",
    "Level of Repair": "levelOfRepair",
    "Level of Replace": "levelOfReplace",
    Spare: "spare",
    Mmax: "mMax",
    Remarks: "remarks",
    "Warrenty Spare": "warrantySpare",
    "Recommended Spare": "recommendedSpare",
    "Delivery Time Days": "deliveryTimeDays",
    "After Serial Production Price 1": "afterSerialProductionPrice1",
    Price1MOQ: "price1MOQ",
    "After Serial Production Price 2": "afterSerialProductionPrice2",
    Price2MOQ: "price2MOQ",
    "After Serial Production Price 3": "afterSerialProductionPrice3",
    Price3MOQ: "price3MOQ",
    "Annual Price Escalation Percentage": "annualPriceEscalationPercentage",
    "LCC-Price Validity to be Included": "lccPriceValidity",
    "Recommended Spare Quantity": "recommendedSpareQuantity",
    "Calculated Spare Quantity": "calculatedSpareQuantity",
  };

  const token = localStorage.getItem("sessionId");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const headers = [
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
    "MTTR",
    "MCT",
    "MLH",
    "Repairable",
    "Level of Repair",
    "Level of Replace",
    "Spare",
    "Mmax",
    "Remarks",
    "Warrenty Spare",
    "Recommended Spare",
    "Delivery Time Days",
    "After Serial Production Price 1",
    "Price 1 MOQ",
    "After Serial Production Price 2",
    "Price 2 MOQ",
    "After Serial Production Price 3",
    "Price 3 MOQ",
    "Annual Price Escalation Percentage",
    "LCC-Price Validity to be Included",
    "Recommended Spare Quantity",
    "Calculated Spare Quantity",
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

    Api.get(`/api/v1/reports/get/spart/report/`, {
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
  const sparePartsData = data?.map((item) => ({
    productId: item?.productId || {},
    mttrData: item?.mttrData || {},
    spareData: item?.sparePartsData,
  }));

  useEffect(() => {
    getProjectDetails();
    getProjectPermission();
    if (reportType == 5) {
      <SA_ComponentType />;
    } else {
      getTreeProduct();
    }
    const columnCount = Object.keys(headerKeyMapping).length;
    if (columnCount > 13) {
      setColumnLength(true);
    }
  }, [projectId, reportType, hierarchyType]);

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
      ["Document Title", "Spare Parts Analysis"],
      [],
      [],
      ["Rev", ""],
      ["Rev Date", ""],
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Document Title", "Spare Parts Analysis"],
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
      ["Spare Parts Analysis Report"],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Project Description", projectData?.projectDesc || ""],
      [],
      headers, // Header row
      ...sparePartsData.map((row) =>
        headers.map((header) => {
          const key = headerKeyMapping[header];
          return (
            row?.productId?.[key] ??
            row?.mttrData?.[key] ??
            row?.spareData?.[key] ??
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
      ["Document Title", "Spare Parts Analysis"],
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
    XLSX.writeFile(workbook, "spare_analysis.xlsx");
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
        pdf.save("spare_analysis.pdf");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  const generateWordDocument = () => {
    if (!sparePartsData) {
      console.error("Spare parts data is not available.");
      return;
    }

    // Define table headers based on headers array
    const projectTableRows = [
      new TableRow({
        children: headers.map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ text: header, bold: true })],
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
        ),
      }),
    ];

    // Map the sparePartsData rows to Word table rows
    sparePartsData?.forEach((row) => {
      const tableRow = new TableRow({
        children: headers.map((header) => {
          const key = headerKeyMapping[header];
          const value =
            row?.productId?.[key] ??
            row?.mttrData?.[key] ??
            row?.spareData?.[key] ??
            "-";
          return new TableCell({
            children: [new Paragraph({ text: value })],
            width: { size: 100, type: WidthType.PERCENTAGE },
          });
        }),
      });
      projectTableRows.push(tableRow);
    });

    // Define the Word document structure
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Spare Parts Analysis Report",
                  bold: true,
                  size: 32, // 16pt font size
                }),
              ],
              alignment: "center",
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

    // Generate and save the Word document
    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, "spare_parts_analysis_report.docx");
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
          {sparePartsData.length > 0 ? (
            <div>
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
                      <h5>Spares Analysis</h5>
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
                        {sparePartsData?.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {headers.map((header) => {
                              const key = headerKeyMapping[header];
                              let value =
                                row?.productId?.[key] ??
                                row?.mttrData?.[key] ??
                                row?.spareData?.[key] ??
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
              </div>
              <div id="last-page-report">
                <LastPageReport projectId={projectId} moduleType={moduleType} />
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

export default SpareAnalysis;
