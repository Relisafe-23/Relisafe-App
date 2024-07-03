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

function MaintabilityReport(props) {
  const [projectId, setProjectId] = useState(props?.projectId);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const history = useHistory();
  const [permission, setPermission] = useState();
  const [data, setData] = useState([]);
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
    Quantity: "80px",
    Reference: "130px",
    Category: "100px",
    "Part Type": "100px",
    Environment: "120px",
    Temperature: "120px",
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
    }, 500); // Adjust delay as needed
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
                  text: `Project Description: ${
                    projectData.projectDesc || "-"
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
        <Row className="d-flex align-items-center justify-content-end">
          <Col className="d-flex flex-row custom-checkbox-group">
            <Form.Check
              type="checkbox"
              name="FR"
              label="FR"
              checked={columnVisibility.FR}
              onChange={handleColumnVisibilityChange}
              className="custom-checkbox"
            />
            <Form.Check
              type="checkbox"
              name="MTTR"
              label="MTTR"
              checked={columnVisibility.MTTR}
              onChange={handleColumnVisibilityChange}
              className="custom-checkbox"
            />
            <Form.Check
              type="checkbox"
              name="MCT"
              label="MCT"
              checked={columnVisibility.MCT}
              onChange={handleColumnVisibilityChange}
              className="custom-checkbox"
            />
            <Form.Check
              type="checkbox"
              name="MLH"
              label="MLH"
              checked={columnVisibility.MLH}
              onChange={handleColumnVisibilityChange}
              className="custom-checkbox"
            />
          </Col>
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
              style={{ marginRight: "8px" }}
            >
              <FaFilePdf style={{ marginRight: "8px" }} />
              PDF
            </Button>
            <Button className="report-save-btn" onClick={generateWordDocument}>
              <FaFileWord style={{ marginRight: "8px" }} />
              Word
            </Button>
          </Col>
        </Row>
      ) : null}
      <div className="sheet-container mt-3">
        <div className="sheet" id="pdf-report-content">
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
                  .filter((header) =>
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
    </div>
  );
}

export default MaintabilityReport;
