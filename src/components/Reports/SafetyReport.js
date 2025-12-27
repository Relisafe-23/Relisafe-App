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
    Id: true,
    Reference: true,
    FR: true,
  });

  const headerKeyMapping = {
    Id: "indexCount",
    "Product Name": "productName",
    "Part Number": "partNumber",
    Quantity: "quantity",
    Reference: "reference",
    Category: "category",
    "Part Type": "partType",
    FR: "fr",
    Hazard: "failureMode",
    "Mode of Operation": "modeOfOperation",
    "Hazard Cause": "hazardCause",
    "Effect of the Hazard": "effectOfHazard",
    "Hazard Classification": "hazardClasification",
    "Design Assurance Level (DAL) associated with the hazard": "designAssuranceLevel",
    "Means of Detection": "meansOfDetection",
    "Crew Response": "crewResponse",
    "Unique Hazard Identifiers": "uniqueHazardIdentifier",
    "Initial Severity ((impact))": "initialSeverity",
    "Initial likelihood (probability)": "initialLikelihood",
    "Initial Risk Level": "initialRiskLevel",
    "Design Mitigation": "designMitigation",
    "Mitigation Responsibility": "designMitigatonResbiity",
    "Mitigation Evidence": "designMitigtonEvidence",
    "Opernal Maintan Mitigation": "opernalMaintanMitigation",
    "Opernal Mitigaton Resbility": "opernalMitigatonResbility",
    "Operatnal Mitigation Evidence": "operatnalMitigationEvidence",
    "Residual Severity ((impact))": "residualSeverity",
    "Residual Likelihood (probability)": "residualLikelihood",
    "Residual Risk Level": "residualRiskLevel",
    "FTA Name/ID": "ftaNameId",
    "Hazard Status": "hazardStatus",
    "User Field 1": "userField1",
    "User Field 2": "userField2",
  };

  const token = localStorage.getItem("sessionId");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const headers = [
    "S.No",
    "Id",
    "Product Name",
    "Part Number",
    "Quantity",
    "Reference",
    "Category",
    "Part Type",
    "FR",
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
    "Opernal Maintan Mitigation",
    "Residual Severity ((impact))",
    "Residual Likelihood (probability)",
    "Residual Risk Level",
    "Hazard Status",
    "FTA Name/ID",
    "User Field 1",
    "User Field 2",
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
        setIsLoading(false);
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

  // Always include products, even if no safety data
  const safetyData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const allRows = [];
    
    data?.forEach(item => {
      const productId = item?.productId || {};
      
      // Always include the product
      const safetyItems = Array.isArray(item?.safetyData) ? item.safetyData : 
                         (item?.safetyData ? [item.safetyData] : [{}]);
      
      // If there are no safety records, still create one row for the product
      if (safetyItems.length === 0) {
        allRows.push({
          productId: productId,
          safetyData: {},
          hasSafetyData: false
        });
      } else {
        // Create one row per safety record
        safetyItems.forEach(safetyItem => {
          allRows.push({
            productId: productId,
            safetyData: safetyItem || {},
            hasSafetyData: true
          });
        });
      }
    });
    
    return allRows;
  }, [data]);
  
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

  // Get visible headers based on columnVisibility
  const getVisibleHeaders = () => {
    return headers.filter((header) => {
      if (header === "FR" || header === "Reference" || header === "Id") {
        return columnVisibility[header];
      }
      return true;
    });
  };

  const exportToExcel = () => {
    if (!projectData) {
      console.error("Project data is not available.");
      return;
    }

    const visibleHeaders = getVisibleHeaders();
    
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

    // Main Content Worksheet
    const mainContentData = [
      [],
      [],
      ["Document Title", "SAFETY"],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Project Description", projectData?.projectDesc || ""],
      [],
      visibleHeaders,
      ...safetyData.map((row, rowIndex) =>
        visibleHeaders.map((header) => {
          if (header === "S.No") return rowIndex + 1;
          
          if (header === "Hazard") {
            // Show hazard index only if there's actual hazard data
            const hasHazardData = row.hasSafetyData && 
              (row?.safetyData?.failureMode || 
               row?.safetyData?.modeOfOperation || 
               row?.safetyData?.hazardCause);
            return hasHazardData ? rowIndex + 1 : "";
          }

          const key = headerKeyMapping[header];
          let value = key
            ? row?.productId?.[key] ??
              row?.safetyData?.[key] ??
              "-"
            : "-";

          if (header === "FR" && typeof value === "number") {
            value = value.toFixed(6);
          }

          return value;
        })
      ),
    ];

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

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, firstPageWorksheet, "First Page");
    XLSX.utils.book_append_sheet(workbook, mainContentWorksheet, "Main Content");
    XLSX.utils.book_append_sheet(workbook, lastPageWorksheet, "Last Page");

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
        scale: 2,
        useCORS: true,
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

  const generateWordDocument = () => {
    if (!projectData) {
      console.error("Project data is not available.");
      return;
    }

    const visibleHeaders = getVisibleHeaders();
    
    const tableRows = [
      new TableRow({
        children: visibleHeaders.map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ text: header, bold: true })],
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
        ),
      }),
    ];

    safetyData.forEach((row, rowIndex) => {
      const tableRow = new TableRow({
        children: visibleHeaders.map((header) => {
          let text = "";
          
          if (header === "S.No") {
            text = (rowIndex + 1).toString();
          } else if (header === "Hazard") {
            const hasHazardData = row.hasSafetyData && 
              (row?.safetyData?.failureMode || 
               row?.safetyData?.modeOfOperation || 
               row?.safetyData?.hazardCause);
            text = hasHazardData ? (rowIndex + 1).toString() : "";
          } else {
            const key = headerKeyMapping[header];
            let value = key
              ? row?.productId?.[key] ??
                row?.safetyData?.[key] ??
                "-"
              : "-";

            if (header === "FR" && typeof value === "number") {
              value = value.toFixed(6);
            }
            text = value;
          }

          return new TableCell({
            children: [new Paragraph({ text })],
            width: { size: 100, type: WidthType.PERCENTAGE },
          });
        }),
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
                  size: 32,
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }),
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
                  text: `Project Description: ${projectData.projectDesc || "-"}`,
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }),
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
          
          {/* Always show export buttons when there are products */}
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
                  {/* PDF and Word buttons can be uncommented as needed */}
                </Col>
              </Row>

              {columnLength && (
                <Row>
                  <Col className="d-flex justify-content-end">
                    {/* Column limit message */}
                  </Col>
                </Row>
              )}
            </>
          ) : null}
          
          {/* Always show the report when there are products */}
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
                            name="Id"
                            label="Id"
                            checked={columnVisibility.Id}
                            onChange={handleColumnVisibilityChange}
                            className="custom-checkbox ml-3"
                          />
                          <Form.Check
                            type="checkbox"
                            name="Reference"
                            label="Reference"
                            checked={columnVisibility.Reference}
                            onChange={handleColumnVisibilityChange}
                            className="custom-checkbox ml-3"
                          />
                          <Form.Check
                            type="checkbox"
                            name="FR"
                            label="FR"
                            checked={columnVisibility.FR}
                            onChange={handleColumnVisibilityChange}
                            className="custom-checkbox ml-3"
                          />
                        </Col>
                      </Row>
                    ) : null}
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table className="report-table">
                      <thead>
                        <tr>
                          {getVisibleHeaders().map((header) => (
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
                            {getVisibleHeaders().map((header) => {
                              // If header is S.No → show rowIndex + 1
                              if (header === "S.No") {
                                return (
                                  <td key={header} style={{ textAlign: "center" }}>
                                    {rowIndex + 1}
                                  </td>
                                );
                              }
                              
                              // If header is Hazard → show hazard index only if row has hazard data
                              if (header === "Hazard") {
                                const hasHazardData = row.hasSafetyData && 
                                  (row?.safetyData?.failureMode || 
                                   row?.safetyData?.modeOfOperation || 
                                   row?.safetyData?.hazardCause);
                                return (
                                  <td key={header} style={{ textAlign: "center" }}>
                                    {hasHazardData ? rowIndex + 1 : ""}
                                  </td>
                                );
                              }

                              const key = headerKeyMapping[header];
                              let value = key
                                ? row?.productId?.[key] ??
                                  row?.safetyData?.[key] ??
                                  "-"
                                : "-";

                              // Format FR to 6 decimal places if it's a number
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
              <h3>No Products Found</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default SafetyReport;