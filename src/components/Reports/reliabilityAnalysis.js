import React, { useState, useEffect } from "react";
import { Col, Form, Row, Card, Button } from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/Reports.scss";
import { Formik, ErrorMessage } from "formik";
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

function ReliabilityAnalysis(props) {
  const [projectId, setProjectId] = useState(props?.projectId);
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
  };
  const ftaHeaderKeyMapping = {
    "Source": "source",
    "Predicted": "predicted",
    "Duty Cycle": "dutyCycle",
    "FR Distribution": "frDistribution",
    "FR Remarks": "frRemarks",
    "Standard": "standard",
    "FR Offset Operand": "frOffsetOperand",
    "Failure Rate Offset": "failureRateOffset",
    "FR Unit": "frUnit",
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
  ];
  const FTPHeader = [
   "Source",
    "Predicted",
    "DutyCycle",
    "FR Distribution",
    "FR Remarks",
    "Standard",
    "FR Offset Operand",
    "Failure Rate Offset",
    "FR Unit"
  ];
  const columnWidths = {
    "Source": "130px",
    "Predicted": "120px",
    "Duty Cycle": "80px",
    "FR Distribution": "130px",
    "FR Remarks": "100px",
    "Standard": "100px",
    "FR Offset Operand": "120px",
    "Failure Rate Offset": "120px",
    "FR Unit": "60px",
  };
  const FTPHeaderColumnWidth = [
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
    getFtaData();
  }, [projectId]); // Include projectId in dependency array to trigger effect on change

  
  const getFtaData = () =>{
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
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  }
  
  // Log sorted data to debug
  useEffect(() => {}, [sortedData]);

  const exportToExcel = () => {
    if (!projectData) {
      console.error("Project data is not available.");
      return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Project Report"],
      [],
      ["Project Name:", projectData?.projectName || ""],
      ["Project Number:", projectData?.projectNumber || ""], 
      ["Project Description:", projectData?.projectDesc || ""],
      [],
    ]);

    const exportData = sortedData.map((row) => {
      const exportRow = {};
      headers.forEach((header) => {
        if (columnVisibility[header]) {
          exportRow[header] = row[headerKeyMapping[header]] || "-";
        }
      });
      return exportRow;
    });
    
    XLSX.utils.sheet_add_json(worksheet, exportData, { origin: -1 });

  const worksheet2 = XLSX.utils.aoa_to_sheet([
    ["Failure Rate Prediction"], 
    [],
  ]);

  const ftpData = ftaTreeData.map((row) => {
    const ftpRow = {};
    FTPHeader.forEach((header) => {
      ftpRow[header] = row[ftaHeaderKeyMapping[header]] || "-";
    });
    return ftpRow;
  });

  XLSX.utils.sheet_add_json(worksheet2, ftpData, { origin: -1 });

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Project Report");
    XLSX.utils.book_append_sheet(workbook, worksheet2, "Failure Rate Prediction");

    // Write the workbook to a file
    XLSX.writeFile(workbook, "project_report.xlsx");
  };

  const generatePDFReport = () => {
    if (!projectData) {
      console.error("Project data is not available.");
      return;
    }
    const input = document.getElementById("pdf-report-content");

    setTimeout(() => {
      html2canvas(input)
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const width = pdf.internal.pageSize.getWidth();
          const height = pdf.internal.pageSize.getHeight();
          pdf.addImage(imgData, "PNG", 0, 0, width, height);
          pdf.save("report.pdf");
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
        });
    }, 500);
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
    sortedData.forEach((row) => {
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
      projectTableRows.push(tableRow);
    });

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
        saveAs(blob, "project_report.docx");
      })
      .catch((error) => {
        console.error("Error generating Word document:", error);
      });
  };
  
  return (
    <div>
      <div className="mt-3"></div>
      {sortedData.length > 0 ? (
        <Row className="d-flex align-items-center">
          <Col className="d-flex justify-content-start">
            <Button className="save-btn" onClick={exportToExcel}>
              <FaFileExcel style={{ marginRight: "8px" }} />
              Export to Excel
            </Button>
          </Col>
          <Col className="d-flex justify-content-center">
            <Button className="save-btn" onClick={generatePDFReport}>
              <FaFilePdf style={{ marginRight: "8px" }} />
              Generate PDF Report
            </Button>
          </Col>
          <Col className="d-flex justify-content-end">
            <Button className="save-btn" onClick={generateWordDocument}>
              <FaFileWord style={{ marginRight: "8px" }} />
              Export to Word
            </Button>
          </Col>
        </Row>
      ) : null}
      <div className="sheet-container mt-3">
        <div className="sheet" id="pdf-report-content">
          <h1>Reports</h1>
          <div className="sheet-content mb-5">
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
            <h4>PBS Report</h4>
          </div>
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
              {sortedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header) => (
                    <td key={header} style={{ textAlign: "center" }}>
                      {row[headerKeyMapping[header]] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-5">
            <h4>Failure Rate Prediction</h4>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                {FTPHeader.map((header) => (
                  <th
                    key={header}
                    style={{
                      width: FTPHeaderColumnWidth[header],
                      textAlign: "center",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ftaTreeData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {FTPHeader.map((header) => (
                    <td key={header} style={{ textAlign: "center" }}>
                      {row[ftaHeaderKeyMapping[header]] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReliabilityAnalysis;
