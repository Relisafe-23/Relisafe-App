import React, { useState, useEffect } from "react";
import { Col, Form, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
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

function LastPageReport(props) {
  const [projectId, setProjectId] = useState(props?.projectId);
  const moduleType = props?.moduleType;
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const history = useHistory();
  const [permission, setPermission] = useState();
  const [data, setData] = useState([]);

  const token = localStorage.getItem("sessionId");

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

  // Log sorted data to debug
  useEffect(() => {}, [sortedData]);

  return (
    <div>
      <div className="sheet-container mt-3">
        <div className="sheet" id="pdf-report-content">
          <Row className="d-flex justify-content-between">
            <Col className="d-flex flex-column align-items-center"></Col>
            <Col className="d-flex flex-column align-items-center">
              <h5>{projectData?.projectName}</h5>
              {moduleType == "PBS" ?
              <h5>Product Breakdown Structure</h5> : 
              moduleType == "RA" ?
              <h5>Reliability Analysis</h5>: 
              moduleType == "MA" ?
              <h5>Maintainability Analysis</h5>: 
              moduleType == "PM" ?
              <h5>Preventive Maintenance</h5>: 
              moduleType == "SA" ?
              <h5>Spares Analysis</h5>: 
              moduleType == "FMECA" ?
              <h5>FMECA</h5>: 
              moduleType == "SAFETY" ?
              <h5>SAFETY</h5>: null
              }
            </Col>
            <Col className="d-flex flex-column align-items-center">
              <h5>Rev:</h5>
              <h5>Rev Date:</h5>
            </Col>
          </Row>

          <Row className="mt-5">
            <h5>Last Page:</h5>
            <h5>Revision History:</h5>
          </Row>
          <table className="report-table mt-last-page">
            <tbody>
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Project Name : {projectData?.projectName}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "center" }}>S.No</td>
                <td style={{ textAlign: "center" }}>REVISION</td>
                <td style={{ textAlign: "center" }}>DESCRIPTION</td>
                <td style={{ textAlign: "center" }}>DATE</td>
                <td style={{ textAlign: "center" }}>AUTHOR</td>
                <td style={{ textAlign: "center" }}>CHECKED BY</td>
                <td style={{ textAlign: "center" }}>APPROVED BY</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LastPageReport;
