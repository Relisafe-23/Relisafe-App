import React, { useState, useEffect } from "react";
import { Col, Form, Row, Button } from "react-bootstrap";
import "../../../css/Reports.scss";
import Api from "../../../Api.js";
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
  Header,
  AlignmentType,
  Footer,
} from "docx";
import FirstPageReport from "../FirstPageReport.js";
import LastPageReport from "../LastPageReport.js";
import Loader from "../../core/Loader.js";

function FMECA_ComponentType(props) {
  const moduleType = props?.moduleType;
  const [projectId, setProjectId] = useState(props?.projectId);
  const reportType = props?.selectModuleFieldValue;
  const hierarchyType = props?.hierarchyType;
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const history = useHistory();
  const [permission, setPermission] = useState();
  const [data, setData] = useState([]);
  const [columnLength, setColumnLength] = useState(false);
  const token = localStorage.getItem("sessionId");

  const [columnVisibility, setColumnVisibility] = useState({
     Id: true,
    "Product Name": true,
    "Part Number": true,
    Quantity: true,
    Reference: true,
    Category: true,
    "Part Type": true,
    Environment: true,
    Temperature: true,
    FR: true,
    "FMECA ID": true,
    "Operating phase": true,
    Function: true,
    "Failure Mode": true,
    "Failure Mode Ratio Alpha": true,
    cause: true,
    "Sub system effect": true,
    "End Effect": true,
    "End Effect ratio Beta(Must equal to 1)": true,
    "Safety Impact": true,
    "Reference Hazard ID": true,
    "Reliability impact": true,
    "Service Disruption Time(Minutes)": true,
    Frequency: true,
    Severity: true,
    "Risk Index": true,
    "Detectable means during operation": true,
    "Detectable means maintainer": true,
    "Built in Test": true,
    "Design Control": true,
    "Maintenance Control": true,
    "Export Constraints": true,
    "immediate action during operational phase": true,
    "user field 1": true,
    "user field 2": true,
    "user field 3": true,
    "user field 4": true,
    "user field 5": true,
    "user field 6": true,
    "user field 7": true,
    "user field 8": true,
    "user field 9": true,
    "user field 10": true,
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
        Id: "indexCount",

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

  const headers = [
     "Id",
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
    "PM Task ID",
    "PM Task Type",
    "Task Intervel Frequency",
    "Task Interval Unit",
    "Latitude / Frequency tolerance",
    "Scheduled Maintance Task",
    "Task Intervel Determination",
    "Task Description",
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
    const indexA = a?.indexCount?.toString();
    const indexB = b?.indexCount?.toString();

    return indexA?.localeCompare(indexB, undefined, { numeric: true });
  };

  // Sort the data array using the custom sort function
  const sortedData = data?.slice().sort(customSort);

  useEffect(() => {
    getProjectDetails();
    getProjectPermission();
    getComponentTreeProduct();
    const columnCount = Object.keys(headerKeyMapping).length;
    if (columnCount > 13) {
      setColumnLength(true);
    }
  }, [projectId, reportType, hierarchyType]);

  const getComponentTreeProduct = () => {
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/reports/get/fmeca/report`, {
      params: {
        projectId: projectId,
        reportType: reportType,
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
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const handleColumnVisibilityChange = (event) => {
    const { name, checked } = event.target;
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [name]: checked,
    }));
  };

  // Log sorted data to debug
  useEffect(() => {}, [sortedData]);

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

    const mainContentData = [
      [], // Initial empty rows for spacing
      [],
      ["Project Report"], // Title row
      [],
      ["Project Name", projectData?.projectName || ""], // Project details
      ["Project Number", projectData?.projectNumber || ""],
      ["Project Description", projectData?.projectDesc || ""],
      [],
    ];

    // Loop through sortedData to map each part type to the Excel sheet
    sortedData.forEach((part) => {
      // Add the part type as a header
      mainContentData.push([part.partType]);

      // Add the table headers
      mainContentData.push(headers.map((header) => header));

      // Map each item in part.items to a row in the Excel sheet
      part.items.forEach((item) => {
        const rowData = headers.map((header) => {
          const key = headerKeyMapping[header];
          // Get the value from productId or failureRatePrediction, or fallback to '-'
          return (
            item.productId?.[key] ?? item.failureRatePrediction?.[key] ?? "-"
          );
        });

        // Add the row data to the mainContentData array
        mainContentData.push(rowData);
      });

      // Add an empty row after each part section for spacing
      mainContentData.push([]);
    });

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

  // Function to generate Word document

  const generateWordDocument = () => {
    if (!projectData) {
      console.error("Project data is not available.");
      return;
    }
    let pageNumber = 1;

    const createParagraph = (text, isBold = false) => {
      return new Paragraph({
        children: [new TextRun({ text, bold: isBold })],
      });
    };

    const createAlignedParagraph = (leftText, rightText) => {
      return new Paragraph({
        children: [
          new TextRun({ text: leftText, bold: true }),
          new TextRun({
            text: rightText,
            bold: true,
            break: 1,
          }),
        ],
        alignment: AlignmentType.BOTH,
      });
    };

    // First Page Content
    const firstPageContent = [
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createParagraph(`Project Name: ${projectData?.projectName || ""}`, true),
      createParagraph("Document Title: FMECA", true),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createAlignedParagraph("Rev:", "Rev Date:"),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createParagraph(`Project Name: ${projectData?.projectName || ""}`, true),
      createParagraph(
        `Project Number: ${projectData?.projectNumber || ""}`,
        true
      ),
      createParagraph("Document Title: FMECA", true),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createAlignedParagraph("Revision:", "Date:"),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createAlignedParagraph("CreatedBy:", "Created Date:"),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createAlignedParagraph("ReviewedBy:", "Reviewed Date:"),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createAlignedParagraph("ApprovedBy:", "Approved Date:"),
    ];

    // Main Content Table
    const mainContentHeaders = headers.filter(
      (header) => columnVisibility[header]
    );
    const tableHeaderRow = new TableRow({
      children: mainContentHeaders.map(
        (header) =>
          new TableCell({
            children: [new Paragraph(header)],
            width: {
              size: 100 / mainContentHeaders.length,
              type: WidthType.PERCENTAGE,
            },
          })
      ),
    });

    const tableRows = sortedData.map((row) => {
      const rowData = headers
        .map((header) =>
          columnVisibility[header] ? row[headerKeyMapping[header]] || "-" : null
        )
        .filter((item) => item !== null);

      return new TableRow({
        children: rowData.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph(cell)],
              width: { size: 100 / rowData.length, type: WidthType.PERCENTAGE },
            })
        ),
      });
    });

    const mainContentTable = new Table({
      rows: [tableHeaderRow, ...tableRows],
    });

    const mainContent = [
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createParagraph(`Project Name: ${projectData?.projectName || ""}`, true),
      createParagraph("Document Title: FMECA", true),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createAlignedParagraph("Rev:", "Rev Date:"),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createParagraph(`Project Name: ${projectData?.projectName || ""}`, true),
      createParagraph(
        `Project Number: ${projectData?.projectNumber || ""}`,
        true
      ),
      createParagraph(
        `Project Description: ${projectData?.projectDesc || ""}`,
        true
      ),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      mainContentTable,
    ];

    // Revision History Table
    const revisionHistoryHeaders = [
      "REVISION",
      "DESCRIPTION",
      "DATE",
      "AUTHOR",
      "CHECKED BY",
      "APPROVED BY",
    ];

    // Create header row
    const revisionHeaderRow = new TableRow({
      children: revisionHistoryHeaders.map(
        (header) =>
          new TableCell({
            children: [new Paragraph({ text: header, bold: true })],
            width: {
              size: 100 / revisionHistoryHeaders.length,
              type: WidthType.PERCENTAGE,
            },
          })
      ),
    });

    // Create data rows
    const dummyRevisions = [
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
    ];

    const revisionRows = dummyRevisions.map(
      (revision) =>
        new TableRow({
          children: revision.map(
            (cell) =>
              new TableCell({
                children: [new Paragraph(cell)],
                width: {
                  size: 100 / revisionHistoryHeaders.length,
                  type: WidthType.PERCENTAGE,
                },
              })
          ),
        })
    );

    const revisionHistoryTable = new Table({
      rows: [revisionHeaderRow, ...revisionRows],
    });

    // Last Page Content
    const lastPageContent = [
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createParagraph(`Project Name: ${projectData?.projectName || ""}`, true),
      createParagraph("Document Title: FMECA", true),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createAlignedParagraph("Rev:", "Rev Date:"),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createParagraph("Revision History", true),
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      revisionHistoryTable,
    ];

    // Creating the document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: { margins: { top: 720, bottom: 720, left: 720, right: 720 } },
          },
          children: [...firstPageContent],
        },
        {
          properties: {
            page: { margins: { top: 720, bottom: 720, left: 720, right: 720 } },
          },
          children: [...mainContent],
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Page ",
                    }),
                    new TextRun({
                      children: ["PAGE_NUMBER"],
                      field: "PAGE_NUMBER",
                    }),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Page ",
                    }),
                    new TextRun({
                      children: ["PAGE_NUMBER"],
                      field: "PAGE_NUMBER",
                    }),
                  ],
                }),
              ],
            }),
          },
        },
        {
          properties: {
            page: { margins: { top: 720, bottom: 720, left: 720, right: 720 } },
          },
          children: [...lastPageContent],
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Page ",
                    }),
                    new TextRun({
                      children: ["PAGE_NUMBER"],
                      field: "PAGE_NUMBER",
                    }),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Page ",
                    }),
                    new TextRun({
                      children: ["PAGE_NUMBER"],
                      field: "PAGE_NUMBER",
                    }),
                  ],
                }),
              ],
            }),
          },
        },
      ],
    });

    // Write the document to a file
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "fmeca_report.docx");
    });
  };

  const fmecaData = data?.map((item) => ({
    productId: item?.productId || {},
    fmecaData: item?.fmecaData || {},
    pmmraData: item?.pmmraData || {},
  }));
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

                  {/* <Button
                    className="report-save-btn"
                    onClick={generatePDFReport}
                    disabled={columnLength}
                    style={{ marginRight: "8px" }}
                  >
                    <FaFilePdf style={{ marginRight: "8px" }} />
                    PDF
                  </Button> */}

                  {/* <Button
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
          {sortedData.length > 0 ? (
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
                      <h5>Maintainability Analysis</h5>
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
                    {sortedData.length > 0 ? (
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
                    {sortedData.map((part, partIndex) => (
                      <div
                        key={partIndex}
                        className={partIndex === 0 ? "mt-3" : "my-5"}
                        style={{ overflowX: "auto" }}
                      >
                        <h5>{part.partType}</h5>
                        <table className="report-table">
                          <thead>
                            <tr>
                              {headers.map((header) => (
                                <th key={header} className="table-header">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {part.items.map((item, itemIndex) => (
                              <tr key={itemIndex}>
                                {headers.map((header) => {
                                  const key = headerKeyMapping[header];
                                  const value =
                                    item.productId?.[key] ??
                                    item.fmecaData?.[key] ??
                                    item.pmmraData?.[key] ??
                                    "-";

                                  // Format the value to 6 decimal places if it's "FR"
                                  const formattedValue =
                                    header === "FR" && value !== "-"
                                      ? parseFloat(value).toFixed(6)
                                      : value;

                                  return (
                                    <td key={header} className="table-cell">
                                      {formattedValue}
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

export default FMECA_ComponentType;
