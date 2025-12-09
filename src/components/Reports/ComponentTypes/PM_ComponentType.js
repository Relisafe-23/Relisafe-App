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

function PM_ComponentType(props) {
  const moduleType = props?.selectModule;
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
    MTTR: true,
    MCT: true,
    MLH: true,
    "PM Task ID": true,
    "PM Task Type": true,
    "Task Intervel Frequency": true,
    "Task Intervel Unit": true,
    "Latitude/Frequency Tolerence": true,
    "Scheduled Maintenance Task": true,
    "Task Intervel Determination": true,
    "Task Description": true,
    "Task Time at ML1": true,
    "Task Time at ML2": true,
    "Task Time at ML3": true,
    "Task Time at ML4": true,
    "Task Time at ML5": true,
    "Task Time at ML6": true,
    "Task Time at ML7": true,
    "Skill 1": true,
    "Skill 1 Nos": true,
    "Skill 1 Contribution %": true,
    "Skill 2": true,
    "Skill 2 Nos": true,
    "Skill 2 Contribution %": true,
    "Skill 3": true,
    "Skill 3 Nos": true,
    "Skill 3 Contribution %": true,
    "Additional Replacement Spare 1": true,
    "Additional Replacement Spare 1 Qty": true,
    "Additional Replacement Spare 2": true,
    "Additional Replacement Spare 2 Qty": true,
    "Additional Replacement Spare 3": true,
    "Additional Replacement Spare 3 Qty": true,
    "Consumable 1": true,
    "Consumable 1 Qty": true,
    "Consumable 2": true,
    "Consumable 2 Qty": true,
    "Consumable 3": true,
    "Consumable 3 Qty": true,
    "Consumable 4": true,
    "Consumable 4 Qty": true,
    "Consumable 5": true,
    "Consumable 5 Qty": true,
    "User Field 1": true,
    "User Field 2": true,
    "User Field 3": true,
    "User Field 4": true,
    "User Field 5": true,
    // "User Field 6": true,
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
    MTTR: "mttr",
    MCT: "mct",
    MLH: "mlh",
    "PM Task ID": "pmTaskId",
    "PM Task Type": "pmTaskType",
    "Task Intervel Frequency": "taskIntrvlFreq",
    "Task Intervel Unit": "taskIntrvlUnit",
    "Latitude/Frequency Tolerence": "LatitudeFreqTolrnc",
    "Scheduled Maintenance Task": "scheduleMaintenceTsk",
    "Task Intervel Determination": "tskInteralDetermination",
    "Task Description": "taskDesc",
    "Task Time at ML1": "tskTimeML1",
    "Task Time at ML2": "tskTimeML2",
    "Task Time at ML3": "tskTimeML3",
    "Task Time at ML4": "tskTimeML4",
    "Task Time at ML5": "tskTimeML5",
    "Task Time at ML6": "tskTimeML6",
    "Task Time at ML7": "tskTimeML7",
    "Skill 1": "skill1",
    "Skill 1 Nos": "skillOneNos",
    "Skill 1 Contribution %": "skillOneContribution",
    "Skill 2": "skill2",
    "Skill 2 Nos": "skillTwoNos",
    "Skill 2 Contribution %": "skillTwoContribution",
    "Skill 3": "skill3",
    "Skill 3 Nos": "skillThreeNos",
    "Skill 3 Contribution %": "skillThreeContribution",
    "Additional Replacement Spare 1": "addiReplaceSpare1",
    "Additional Replacement Spare 1 Qty": "addiReplaceSpare1Qty",
    "Additional Replacement Spare 2": "addiReplaceSpare2",
    "Additional Replacement Spare 2 Qty": "addiReplaceSpare2Qty",
    "Additional Replacement Spare 3": "addiReplaceSpare3",
    "Additional Replacement Spare 3 Qty": "addiReplaceSpare3Qty",
    "Consumable 1": "consumable1",
    "Consumable 1 Qty": "consumable1Qty",
    "Consumable 2": "consumable2",
    "Consumable 2 Qty": "consumable2Qty",
    "Consumable 3": "consumable3",
    "Consumable 3 Qty": "consumable3Qty",
    "Consumable 4": "consumable4",
    "Consumable 4 Qty": "consumable4Qty",
    "Consumable 5": "consumable5",
    "Consumable 5 Qty": "consumable5Qty",
    "User Field 1": "userField1",
    "User Field 2": "userField2",
    "User Field 3": "userField3",
    "User Field 4": "userField4",
    "User Field 5": "userField5",
    "User Field 6": "userField6",
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
    "MTTR",
    "MCT",
    "MLH",
    "PM Task ID",
    "PM Task Type",
    "Task Intervel Frequency",
    "Task Intervel Unit",
    "Latitude/Frequency Tolerence",
    "Scheduled Maintenance Task",
    "Task Intervel Determination",
    "Task Description",
    "Task Time at ML1",
    "Task Time at ML2",
    "Task Time at ML3",
    "Task Time at ML4",
    "Task Time at ML5",
    "Task Time at ML6",
    "Task Time at ML7",
    "Skill 1",
    "Skill 1 Nos",
    "Skill 1 Contribution %",
    "Skill 2",
    "Skill 2 Nos",
    "Skill 2 Contribution %",
    "Skill 3",
    "Skill 3 Nos",
    "Skill 3 Contribution %",
    "Additional Replacement Spare 1",
    "Additional Replacement Spare 1 Qty",
    "Additional Replacement Spare 2",
    "Additional Replacement Spare 2 Qty",
    "Additional Replacement Spare 3",
    "Additional Replacement Spare 3 Qty",
    "Consumable 1",
    "Consumable 1 Qty",
    "Consumable 2",
    "Consumable 2 Qty",
    "Consumable 3",
    "Consumable 3 Qty",
    "Consumable 4",
    "Consumable 4 Qty",
    "Consumable 5",
    "Consumable 5 Qty",
    "User Field 1",
    "User Field 2",
    "User Field 3",
    "User Field 4",
    "User Field 5",
    "User Field 6",
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
    setIsLoading(true);
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/reports/get/preventive/report`, {
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

  const preventiveData = data?.map((item) => ({
    productId: item?.productId || {},
    pmmraData: item?.pmmraData || {},
  }));

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
      ["Document Title", "Preventive Maintainence"],
      [],
      [],
      ["Rev", ""],
      ["Rev Date", ""],
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Document Title", "Preventive Maintainence"],
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
      ["Project Report"],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Project Description", projectData?.projectDesc || ""],
      [],
    ];

    // Loop through each part in sortedData
    sortedData.forEach((part, partIndex) => {
      if (partIndex !== 0) {
        mainContentData.push([]); // Add spacing between parts
      }
      mainContentData.push([part.partType]); // Add part type as a section header
      mainContentData.push(headers); // Add headers

      // Loop through each item in the part and map its data
      part.items.forEach((item) => {
        const rowData = headers.map((header) => {
          const key = headerKeyMapping[header];
          return item.productId?.[key] ?? item.pmmraData?.[key] ?? "-";
        });
        mainContentData.push(rowData); // Add item data to main content
      });
    });

    // Convert the main content data to an Excel worksheet
    const mainContentWorksheet = XLSX.utils.aoa_to_sheet(mainContentData);

    // Last Page Worksheet
    const lastPageData = [
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Document Title", "Preventive Maintainence"],
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
    XLSX.writeFile(workbook, "preventive_maintenance.xlsx");
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
        pdf.save("preventive_maintenance.pdf");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  // Function to generate Word document

  const generateWordDocument = () => {
    if (!sortedData) {
      console.error("Sorted data is not available.");
      return;
    }

    // Initialize an array to hold all Word table rows
    const projectTableRows = [];

    // Loop through each part in sortedData
    sortedData.forEach((part, partIndex) => {
      // Add a header for each part type
      projectTableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: part.partType, bold: true })],
              columnSpan: headers.length, // Span across all columns
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        })
      );

      // Add the headers row after the part type header
      projectTableRows.push(
        new TableRow({
          children: headers.map(
            (header) =>
              new TableCell({
                children: [new Paragraph({ text: header, bold: true })],
                width: { size: 100, type: WidthType.PERCENTAGE },
              })
          ),
        })
      );

      // Loop through each item in the part and map its data to table rows
      part.items.forEach((item) => {
        const tableRow = new TableRow({
          children: headers.map((header) => {
            const key = headerKeyMapping[header];
            const value = item.productId?.[key] ?? item.pmmraData?.[key] ?? "-";
            return new TableCell({
              children: [new Paragraph({ text: value })],
              width: { size: 100, type: WidthType.PERCENTAGE },
            });
          }),
        });
        projectTableRows.push(tableRow);
      });
    });

    // Define the Word document structure
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Preventive Maintenance Report",
                  bold: true,
                  size: 32, // 16pt font size
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty paragraph for spacing
            new Table({
              rows: projectTableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty paragraph for spacing
          ],
        },
      ],
    });

    // Generate and save the Word document
    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, "preventive_maintenance.docx");
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
          {preventiveData?.length > 0 ? (
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
          {preventiveData?.length > 0 ? (
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
                      <h5>Preventive Maintenance</h5>
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
                                  item.pmmraData?.[key] ??
                                  "-";

                                // Format the value to 6 decimal places if the header is "FR"
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
        </div>}
        </div>
      )}
    </div>
  );
}

export default PM_ComponentType;
