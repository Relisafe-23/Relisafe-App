import React, { useState, useEffect } from "react";
import { Col, Form, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import Api from "../../Api";
import { useHistory } from "react-router-dom";

function FirstPageReport(props) {
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
              <h4>{projectData?.projectName}</h4>
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

          <table className="report-table mt-one">
            <tbody>
              <tr>
                <td>Project Name :  {projectData?.projectName}</td>{" "}
              </tr>
              <tr>
                <td>Project Number :  {projectData?.projectNumber}</td>
              </tr>
              <tr>
                <td>Document Title :  
                  {moduleType == "PBS" ?
              <h7>Product Breakdown Structure</h7> : 
              moduleType == "RA" ?
              <h7>Reliability Analysis</h7>: 
              moduleType == "MA" ?
              <h7>Maintainability Analysis</h7>: 
              moduleType == "PM" ?
              <h7>Preventive Maintenance</h7>: 
              moduleType == "SA" ?
              <h7>Spares Analysis</h7>: 
              moduleType == "FMECA" ?
              <h7>FMECA</h7>: 
              moduleType == "SAFETY" ?
              <h7>SAFETY</h7>: null
              }</td>
              </tr>
              <tr>
                <td>Revision:</td>
              </tr>
              <tr>
                <td>Date :</td>
              </tr>
            </tbody>
          </table>
          <Row>
            <Col>
              <table className="report-table mt-two">
                <tbody>
                  <tr>
                    <td>Created By</td>{" "}
                  </tr>
                  <tr>
                    <td>Created Date</td>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Col>
              <table className="report-table mt-two">
                <tbody>
                  <tr>
                    <td>Reviewed By</td>{" "}
                  </tr>
                  <tr>
                    <td>Reviewed Date</td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>

          <Row>
            <Col></Col>
            <Col>
              <table className="report-table mt-three">
                <tbody>
                  <tr>
                    <td>Approved By</td>{" "}
                  </tr>
                  <tr>
                    <td>Approved Date</td>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Col></Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default FirstPageReport;
