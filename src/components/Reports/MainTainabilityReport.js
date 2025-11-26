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
import Loader from "../core/Loader";
import MA_ComponentType from "./ComponentTypes/MA_ComponentType.js";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";

function MaintainabilityReport(props) {
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
  const [mttrTreeData, setMttrTreeData] = useState([]);
  const [pmmraTreeData, setPmmraTreeData] = useState([]);
  const [columnLength, setColumnLength] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
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
    "MTTR",
    "MCT",
    "MLH",
    "Repairable",
    "Level of Repair",
    "Level of Replace",
    "Spare",
    "Mmax",
    "Remarks",
  ];

  const header2 = [
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

  const combinedHeaders = header1.concat(header2);

  const handleColumnVisibilityChange = (event) => {
    const { name, checked } = event.target;
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [name]: checked,
    }));
  };
  const columnWidths = {};

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
  const customSort = (a, b) => {
    const indexA = a?.indexCount?.toString();
    const indexB = b?.indexCount?.toString();

    return indexA?.localeCompare(indexB, undefined, { numeric: true });
  };

  // Sort the data array using the custom sort function
  const sortedData = data.slice().sort(customSort);

  const safeData = data?.map((item) => ({
    productId: item?.productId || {},
    mttrData: item?.mttrData || {},
    pmmraData: item?.pmmraData || {},
  }));

  const getTreeProduct = () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/reports/get/maintainability/report`, {
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

  useEffect(() => {
    getProjectDetails();
    getProjectPermission();
    getMttrData();
    getPmmraData();
    if (reportType == 5) {
      <MA_ComponentType />;
    } else {
      getTreeProduct();
    }
    const columnCount = Object.keys(headerKeyMapping).length;
    if (columnCount > 13) {
      setColumnLength(true);
    }
  }, [projectId, reportType, hierarchyType]);

  const getMttrData = () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/productTreeStructure/mttr/details`, {
      params: {
        projectId: projectId,
        userId: userId,
        token: sessionId,
      },
    })
      .then((res) => {
        const mttrData = res?.data?.data;
        setMttrTreeData(mttrData);
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
  useEffect(() => { }, [sortedData]);

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
      ["Document Title", "Maintainability Report"],
      [],
      [],
      ["Rev", ""],
      ["Rev Date", ""],
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Document Title", "Maintainability Report"],
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
      combinedHeaders.filter((header) => columnVisibility[header]), // Header row
      ...safeData.map((row) =>
        combinedHeaders.map((header) => {
          const key = headerKeyMapping[header];
          return (
            row.productId?.[key] ??
            row.mttrData?.[key] ??
            row.pmmraData?.[key] ??
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
      ["Document Title", "Maintainability Report"],
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
    XLSX.utils.book_append_sheet(workbook, mainContentWorksheet, "Main Content");
    XLSX.utils.book_append_sheet(workbook, lastPageWorksheet, "Last Page");

    // Write the workbook to a file
    XLSX.writeFile(workbook, "maintainability_analysis.xlsx");
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
        pdf.save("maintainability_analysis.pdf");
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

    // Define table headers based on combinedHeaders
    const projectTableRows = [
      new TableRow({
        children: combinedHeaders.map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ text: header, bold: true })],
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
        ),
      }),
    ];

    // Map the safeData rows to Word table rows
    safeData?.forEach((row) => {
      const tableRow = new TableRow({
        children: combinedHeaders.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  text:
                    row.productId[headerKeyMapping[header]] ??
                    row.mttrData[headerKeyMapping[header]] ??
                    row.pmmraData[headerKeyMapping[header]] ??
                    "-",
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
        ),
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
        saveAs(blob, "maintainability_analysis.docx");
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
          {sortedData.length > 0 ? (
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
                    <p style={{ color: 'red', textAlign: 'right' }}>
                      *You cannot download the PDF or Word document when the number of columns exceeds the limit.
                    </p>
                  </Col>
                </Row>
              )}
            </>
          ) : null}
          {safeData.length > 0 ? (
            <div className="sheet-container mt-3">
              <div className="sheet" id="pdf-report-content">
                <div id="first-page-report">
                  <FirstPageReport projectId={projectId} moduleType={moduleType} />
                </div>
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


                <div style={{ overflowX: "auto", marginBottom: "10px" }}>
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
                      {safeData?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {combinedHeaders.map((header) => {
                            const key = headerKeyMapping[header];
                            let value =
                              row.productId[key] ??
                              row.mttrData[key] ??
                              row.pmmraData[key] ??
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
                            // Check if the header is "FR" and format the value to 6 decimal places
                            if (header === "FR" && typeof value === "number") {
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
          ) : <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <h3>No Records to Display</h3>
          </div>}
          <div id="last-page-report">
            <LastPageReport projectId={projectId} moduleType={moduleType} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MaintainabilityReport;
