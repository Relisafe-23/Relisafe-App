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

function PbsComponent(props) {
  const moduleType = props?.selectModule;
  const [projectId, setProjectId] = useState(props?.projectId);
  const reportType = props?.selectModuleFieldValue;
  const hierarchyType = props?.hierarchyType;
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const history = useHistory();
  const [permission, setPermission] = useState();
  const [data, setData] = useState([]);

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
  }, [projectId, reportType, hierarchyType]);

  const getComponentTreeProduct = () => {
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/reports/get/pbs/report`, {
      params: {
        projectId: projectId,
        reportType: reportType,
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

  const handleColumnVisibilityChange = (event) => {
    const { name, checked } = event.target;
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [name]: checked,
    }));
  };

  // Log sorted data to debug
  useEffect(() => {}, [sortedData]);

  // Assuming you have headers, columnVisibility, sortedData, and projectData defined elsewhere

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
      ["Document Title", "Product Breakdown Structure"],
      [],
      [],
      ["Rev", ""],
      ["Rev Date", ""],
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Document Title", "Product Breakdown Structure"],
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
      headers.filter((header) => columnVisibility[header]), // Header row
    ];

    sortedData.forEach((part) => {
      // Insert the partType as a header row
      mainContentData.push([part.partType]);

      // Insert the table headers
      const headersRow = headers
        .filter((header) =>
          header === "FR" ||
          header === "MTTR" ||
          header === "MCT" ||
          header === "MLH"
            ? columnVisibility[header]
            : true
        )
        .map((header) => header);
      mainContentData.push(headersRow);

      // Insert the item rows for this partType
      part.items.forEach((item) => {
        const itemRow = headers
          .filter((header) =>
            header === "FR" ||
            header === "MTTR" ||
            header === "MCT" ||
            header === "MLH"
              ? columnVisibility[header]
              : true
          )
          .map((header) => item[headerKeyMapping[header]] || "-");
        mainContentData.push(itemRow);
      });

      // Add an empty row after each partType for spacing
      mainContentData.push([]);
    });

    const mainContentWorksheet = XLSX.utils.aoa_to_sheet(mainContentData);

    // Last Page Worksheet
    const lastPageData = [
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Document Title", "Product Breakdown Structure"],
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
    XLSX.writeFile(workbook, "pbc_report.xlsx");
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
        pdf.text(`${pageNumber}`, width - 5, height - 5);
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
        pdf.save("pbs_report.pdf");
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
      createParagraph("Document Title: Product Breakdown Structure", true),
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
      createParagraph("Document Title: Product Breakdown Structure", true),
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

    const mainContent = [
      createParagraph(""),
      createParagraph(""),
      createParagraph(""),
      createParagraph(`Project Name: ${projectData?.projectName || ""}`, true),
      createParagraph("Document Title: Product Breakdown Structure", true),
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
    ];

    sortedData.forEach((part) => {
      // Add the partType as a section header
      mainContent.push(createParagraph(part.partType, true));

      // Create table headers
      const tableHeaderRow = new TableRow({
        children: headers
          .filter((header) =>
            header === "FR" ||
            header === "MTTR" ||
            header === "MCT" ||
            header === "MLH"
              ? columnVisibility[header]
              : true
          )
          .map(
            (header) => new TableCell({ children: [new Paragraph(header)] })
          ),
      });

      // Create table rows for each item under the partType
      const tableRows = part.items.map((item) => {
        const cells = headers
          .filter((header) =>
            header === "FR" ||
            header === "MTTR" ||
            header === "MCT" ||
            header === "MLH"
              ? columnVisibility[header]
              : true
          )
          .map(
            (header) =>
              new TableCell({
                children: [
                  new Paragraph(item[headerKeyMapping[header]] || "-"),
                ],
              })
          );

        return new TableRow({ children: cells });
      });

      // Create the table and add it to the content
      const partTable = new Table({
        rows: [tableHeaderRow, ...tableRows],
      });

      mainContent.push(partTable);
      mainContent.push(new Paragraph("")); // Add some spacing after each table
    });

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
      createParagraph("Document Title: Product Breakdown Structure", true),
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
      saveAs(blob, "pbs_report.docx");
    });
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="mt-3"></div>
          {sortedData.length > 0 ? (
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
                  style={{ marginRight: "8px" }}
                >
                  <FaFilePdf style={{ marginRight: "8px" }} />
                  PDF
                </Button>
                <Button
                  className="report-save-btn"
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
                      <h5>Product Breakdown Structure</h5>
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
                      <Row className="d-flex align-items-center justify-content-end">
                        <Col className="d-flex flex-row custom-checkbox-group">
                          <Form.Check
                            type="checkbox"
                            name="FR"
                            label="FR"
                            checked={columnVisibility.FR}
                            onChange={handleColumnVisibilityChange}
                            className="custom-checkbox ml-5"
                          />
                          <Form.Check
                            type="checkbox"
                            name="MTTR"
                            label="MTTR"
                            checked={columnVisibility.MTTR}
                            onChange={handleColumnVisibilityChange}
                            className="custom-checkbox ml-5"
                          />
                          <Form.Check
                            type="checkbox"
                            name="MCT"
                            label="MCT"
                            checked={columnVisibility.MCT}
                            onChange={handleColumnVisibilityChange}
                            className="custom-checkbox ml-5"
                          />
                          <Form.Check
                            type="checkbox"
                            name="MLH"
                            label="MLH"
                            checked={columnVisibility.MLH}
                            onChange={handleColumnVisibilityChange}
                            className="custom-checkbox ml-5"
                          />
                        </Col>
                      </Row>
                    ) : null}
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
                            {headers
                              .filter((header) =>
                                header === "FR" ||
                                header === "MTTR" ||
                                header === "MCT" ||
                                header === "MLH"
                                  ? columnVisibility[header]
                                  : true
                              )
                              .map((header) => (
                                <th key={header} className="table-header">
                                  {header}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {part.items.map((item, itemIndex) => (
                            <tr key={itemIndex}>
                              {headers
                                .filter((header) =>
                                  header === "FR" ||
                                  header === "MTTR" ||
                                  header === "MCT" ||
                                  header === "MLH"
                                    ? columnVisibility[header]
                                    : true
                                )
                                .map((header) => {
                                  const value = item[headerKeyMapping[header]];
                                  // Format the value to 6 decimal places if it's "FR"
                                  const formattedValue =
                                    header === "FR" && value
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

export default PbsComponent;
