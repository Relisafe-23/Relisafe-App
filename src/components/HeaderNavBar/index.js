// Make sure you have this import
import React, { useState, useEffect, useRef } from "react";
import { Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { Avatar } from "@material-ui/core";
import {  FaArrowLeft } from "react-icons/fa";
import * as XLSX from 'xlsx';
import "../../css/HeaderNavBar.scss";
import Tooltip from "@mui/material/Tooltip";
import Relisafe from "../core/Images/Relisafe.png";
import { useHistory, Link } from "react-router-dom";
import { useModal } from "../ModalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileLines, 
  faPenToSquare, 
  faFileAlt,
  faSearchPlus,
  faSearchMinus,
  faExpand,
  faCompress,
  faTh,
  faArrowsAlt,
  faRedo,

} from "@fortawesome/free-solid-svg-icons";
import Api from "../../Api.js";
import "../../css/HeaderNavBar.scss";
import { FormControl, FormGroup, NavDropdown, Navbar } from "react-bootstrap";
import { faDownload, faUpload, faFileCsv, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Projectname from "../Company/projectname";
import { Button, Modal, Select } from "antd";
import Label from "../../components/LabelComponent";
import * as Yup from "yup";
import { ErrorMessage, Form, Formik } from "formik";

import { customStyles } from "../../components/core/select";

const HeaderNavBar = ({ 
  active, 
  selectedComponent, 
  onReloadData, 
  onGenerateReport,
  onZoomToFit,
  onZoomOriginal,
  onToggleGrid,
  onOriginalLayout,
  additionalButtons,
  setViewMode,    
    setChartData,
      showRepeatedEvents = false,
  onToggleRepeatedEvents,
  repeatedEventsCount = 0,
  // setSelectedTreeId,            // ADD THIS LINE
    isTreeView = false,        // ADD THIS LINE
  onBackToTable              // ADD THIS LINE
}) => { const sessionId = localStorage.getItem("sessionId");
  const [file, setFile] = useState(null);
  const {
    openFTAModal,
    openPropertiesModal,
    openEditGateModal,
    openChildCreateModal,
    openChildEvent,
    openDeleteNode,
    handleDownloadFTA,
    openProbabilityCalculations,
    isProbOpen,
    triggerReload,
  } = useModal();
  const [userData, setUserData] = useState();
  const [showGrid, setShowGrid] = useState(false); // Add this line
  const [openProbCal, setOpenProbCal] = useState();
  const handleCreateNew = () => {
    openFTAModal();
  };

  const handleOpenPropertyModal = () => {
    openPropertiesModal();
  };

  const handleOpenEdit = () => {
    openEditGateModal();
  };

  // const handleOpenProbCalc=()=>{
  //   openProbabilityCalculations();
  // }

  const handleOpenChildCreate = () => {
    openChildCreateModal();
  };

  const handleOpenChildEvent = () => {
    openChildEvent();
  };

  

  const handelDelete = () => {
    openDeleteNode();
  };

   const handleZoomToFit = () => {
    if (onZoomToFit) {
      onZoomToFit();
    }
  };

  const handleZoomOriginal = () => {
    if (onZoomOriginal) {
      onZoomOriginal();
    }
  };

  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
    if (onToggleGrid) {
      onToggleGrid(!showGrid);
    }
  };

  const handleOriginalLayout = () => {
    if (onOriginalLayout) {
      onOriginalLayout();
    }
  };
  const history = useHistory();

  useEffect(() => {
    getUserDetails();
  }, [sessionId]);

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const getUserDetails = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      Api.get(`/api/v1/user/`, { params: { userId: userId } })
        .then((res) => {
          const data = res?.data?.usersList;
          setUserData(data);
        })
        .catch((error) => {
          const errorStatus = error?.response?.status;
          if (errorStatus === 401) {
            logout();
          }
        });
    }
  };

  const fileInputRef = useRef(null);

// HeaderNavBar.js - Improved handleFileChange

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  console.log("Selected file:", file.name, file.type);
  
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (fileExtension === 'json') {
    // Handle JSON file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        console.log("JSON data parsed:", jsonData);
        
        // Check if the JSON has the expected structure
        let dataToSend = jsonData;
        if (!jsonData.treeStructure && jsonData.id) {
          // If it's just a node, wrap it
          dataToSend = { treeStructure: jsonData };
        }
        
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(dataToSend)], { type: 'application/json' });
        formData.append('jsonFile', jsonBlob, file.name);
        
        Api.post("/api/v1/FTAjson/upload", formData)
          .then((res) => {
            console.log("Upload response:", res);
            if (res.status === 201 || res.status === 200) {
              toast.success("File uploaded successfully!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
              triggerReload();
            } else {
              toast.error("Upload failed with status: " + res.status);
            }
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          })
          .catch((error) => {
            console.error("Error uploading JSON data", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.response?.data?.message || "Failed to upload file! Please check the file format.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          });
      } catch (error) {
        console.error("JSON parse error:", error);
        toast.error("Invalid JSON file format!", {
          position: "top-right",
          autoClose: 5000,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  } 
  else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    // Handle Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(firstSheet);
        
        console.log("Excel data parsed:", excelData);
        
        if (!excelData || excelData.length === 0) {
          toast.error("Excel file is empty!", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }
        
        // Convert Excel data back to tree structure
        const treeStructure = convertExcelToTreeStructure(excelData);
        
        if (!treeStructure) {
          toast.error("Could not parse Excel structure! Please ensure the Excel file was exported from this application.", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }
        
        console.log("Converted tree structure:", treeStructure);
        
        // Prepare data for API
        const uploadData = { treeStructure: treeStructure };
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(uploadData)], { type: 'application/json' });
        formData.append('jsonFile', jsonBlob, file.name.replace(/\.(xlsx|xls)$/, '.json'));
        
        Api.post("/api/v1/FTAjson/upload", formData)
          .then((res) => {
            console.log("Upload response:", res);
            if (res.status === 201 || res.status === 200) {
              toast.success("Excel file uploaded and converted successfully!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              });
              triggerReload();
            } else {
              toast.error("Upload failed with status: " + res.status);
            }
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          })
          .catch((error) => {
            console.error("Error uploading Excel data", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.response?.data?.message || "Failed to upload Excel file! Please check the file format.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          });
      } catch (error) {
        console.error("Error parsing Excel:", error);
        toast.error("Failed to parse Excel file: " + error.message, {
          position: "top-right",
          autoClose: 5000,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }
  else {
    toast.error("Please upload JSON or Excel (.xlsx, .xls) files only!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};

// Improved convertExcelToTreeStructure function
const convertExcelToTreeStructure = (excelData) => {
  if (!excelData || excelData.length === 0) return null;
  
  console.log("Converting Excel data to tree structure...");
  
  // Create a map of all nodes by Gate ID
  const nodeMap = new Map();
  
  // First pass: Create all nodes
  excelData.forEach(row => {
    const gateId = row['Gate ID'];
    if (gateId) {
      const node = {
        gateId: gateId,
        name: row['Name'] || '',
        description: row['Description'] || '',
        isEvent: row['Type'] === 'Event',
        gateType: row['Gate Type'] !== 'N/A' ? row['Gate Type'] : undefined,
        calcTypes: row['Calculation Type'] !== 'N/A' ? row['Calculation Type'] : undefined,
        fr: row['Failure Rate (λ)'] !== 'N/A' ? row['Failure Rate (λ)'] : undefined,
        isP: row['Probability (q)'] !== 'N/A' ? row['Probability (q)'] : undefined,
        mttr: row['MTTR'] !== 'N/A' ? row['MTTR'] : undefined,
        isT: row['Test Interval (Ti)'] !== 'N/A' ? row['Test Interval (Ti)'] : undefined,
        timeToFirstTest: row['Time to First Test (Tf)'] !== '0' ? row['Time to First Test (Tf)'] : undefined,
        eventMissionTime: row['Mission Time (tm)'] !== 'N/A' ? row['Mission Time (tm)'] : undefined,
        indexCount: row['Index Count'] !== 'N/A' ? parseInt(row['Index Count']) : undefined,
        isProducts: row['Product'] !== 'N/A' ? row['Product'] : undefined,
        isFailureMode: row['Failure Mode'] !== 'N/A' ? row['Failure Mode'] : undefined,
        children: []
      };
      nodeMap.set(gateId, node);
    }
  });
  
  // Second pass: Build parent-child relationships
  excelData.forEach(row => {
    const gateId = row['Gate ID'];
    const parentId = row['Parent ID'];
    const node = nodeMap.get(gateId);
    
    if (node && parentId && parentId !== 'N/A') {
      const parentNode = nodeMap.get(parentId);
      if (parentNode && !parentNode.children.find(child => child.gateId === gateId)) {
        parentNode.children.push(node);
      }
    }
  });
  
  // Find root node (no parent or parent not found)
  let rootNode = null;
  for (let [id, node] of nodeMap) {
    const hasParent = excelData.some(row => row['Gate ID'] === id && row['Parent ID'] !== 'N/A' && row['Parent ID'] !== id);
    if (!hasParent) {
      rootNode = node;
      break;
    }
  }
  
  // If no root found, use the first node
  if (!rootNode && nodeMap.size > 0) {
    rootNode = Array.from(nodeMap.values())[0];
  }
  
  console.log("Root node found:", rootNode?.gateId);
  return rootNode;
};

// Helper function to convert Excel data back to tree structure
// const convertExcelToTreeStructure = (excelData) => {
//   if (!excelData || excelData.length === 0) return null;
  
//   // Find root node (parent is null or N/A)
//   const rootData = excelData.find(row => row['Parent ID'] === 'N/A' || !row['Parent ID']);
//   if (!rootData) return null;
  
//   const buildTree = (nodeData) => {
//     const node = {
//       gateId: nodeData['Gate ID'],
//       name: nodeData['Name'],
//       description: nodeData['Description'],
//       isEvent: nodeData['Type'] === 'Event',
//       gateType: nodeData['Gate Type'] !== 'N/A' ? nodeData['Gate Type'] : undefined,
//       calcTypes: nodeData['Calculation Type'] !== 'N/A' ? nodeData['Calculation Type'] : undefined,
//       fr: nodeData['Failure Rate (λ)'] !== 'N/A' ? nodeData['Failure Rate (λ)'] : undefined,
//       isP: nodeData['Probability (q)'] !== 'N/A' ? nodeData['Probability (q)'] : undefined,
//       mttr: nodeData['MTTR'] !== 'N/A' ? nodeData['MTTR'] : undefined,
//       isT: nodeData['Test Interval (Ti)'] !== 'N/A' ? nodeData['Test Interval (Ti)'] : undefined,
//       timeToFirstTest: nodeData['Time to First Test (Tf)'] !== '0' ? nodeData['Time to First Test (Tf)'] : undefined,
//       eventMissionTime: nodeData['Mission Time (tm)'] !== 'N/A' ? nodeData['Mission Time (tm)'] : undefined,
//       indexCount: nodeData['Index Count'] !== 'N/A' ? parseInt(nodeData['Index Count']) : undefined,
//       children: []
//     };
    
//     // Find children
//     const children = excelData.filter(row => row['Parent ID'] === nodeData['Gate ID']);
//     children.forEach(child => {
//       node.children.push(buildTree(child));
//     });
    
//     return node;
//   };
  
//   return buildTree(rootData);
// };
  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

    const handleBackToTable = () => {
    setViewMode("table");
    setChartData([]);
    // setSelectedTreeId(null);
  };

  return (
    <div>
<input 
  type="file" 
  accept=".json,.xlsx,.xls" 
  onChange={handleFileChange} 
  ref={fileInputRef} 
  style={{ display: "none" }} 
/>
      {sessionId ? (
        <div className={active ? "nav-head-main-action" : "nav-head-main"}>
          <div className={active ? "avatar-div" : "avatar-div-action"}>
            <div className="avatar-div-action mx-5">
              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "0%" }} />
                {selectedComponent === "FTA" ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "90%",
                      height: "100%",
                    }}
                  >
                      {/* <Navbar variant="dark" style={{color:"black"}} expand="lg">
    <Navbar.Collapse id="navbar-dark-example">
      <Nav>
        Back
      </Nav>
    </Navbar.Collapse>
    </Navbar> */}
    {isTreeView && (
         <div
                  style={{
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "8px",
                    // marginRight: "150px",
                    // zIndex: -1,
                  }}
                >
                  <Button
                    variant="outline-secondary"
                    onClick={handleBackToTable}
                    title="Back to Trees List"
                  >
                    <FaArrowLeft />
                  </Button>
                </div>
              )}
{isTreeView && (

                    <Navbar variant="dark" expand="lg">
                      <Navbar.Collapse id="navbar-dark-example">
                        <Nav>
                          <NavDropdown
                            title={
                              <span className="dropdown-title">
                                Fault Tree <span className="dropdown-arrow">&#9662;</span>
                              </span>
                            }
                            id="basic-nav-dropdown"
                          >
                            {/* <NavDropdown.Item onClick={handleCreateNew}>
                              <FontAwesomeIcon icon={faFileLines} style={{ paddingRight: "10px" }} />
                              Create New
                            </NavDropdown.Item> */}
                            <NavDropdown.Item onClick={handleOpenPropertyModal}>
                              <FontAwesomeIcon icon={faPenToSquare} style={{ paddingRight: "10px" }} />
                              Properties     
                            </NavDropdown.Item>
                           <NavDropdown.Item onClick={handleDownloadFTA}>
  <FontAwesomeIcon icon={faDownload} style={{ paddingRight: "10px" }} />
  Export to Excel
</NavDropdown.Item>
<NavDropdown.Item onClick={handleUpload}>
  <FontAwesomeIcon icon={faUpload} style={{ paddingRight: "10px" }} />
  Import from File 
</NavDropdown.Item>
                          </NavDropdown>
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>
)}
{isTreeView && (


                    <Navbar variant="dark" expand="lg">
                      <Navbar.Collapse id="navbar-dark-example">
                        <Nav>
                          <NavDropdown
                            title={
                              <span className="dropdown-title">
                                Edit <span className="dropdown-arrow">&#9662;</span>
                              </span>
                            }
                            id="basic-nav-dropdown"
                          >
                            <NavDropdown.Item onClick={handleOpenEdit}>Edit Gate</NavDropdown.Item>
                            <NavDropdown.Item onClick={handleOpenChildCreate}>Add New Logical Gate</NavDropdown.Item>
                            <NavDropdown.Item onClick={handleOpenChildEvent}>Add New Event</NavDropdown.Item>
                            {/* <NavDropdown.Item onClick={handelDelete}>Delete</NavDropdown.Item> */}
                          </NavDropdown>
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>
)}
{isTreeView && (

      <Navbar variant="dark" expand="lg">
                      <Navbar.Collapse id="navbar-dark-example">
                        <Nav>            

<NavDropdown
  title={
    <span className="dropdown-title">
      Report <span className="dropdown-arrow">&#9662;</span>
    </span>
  }
  id="basic-nav-dropdown"
>
  {/* <NavDropdown.Item 
    onClick={() => {
      if (window.generateFTAReport) {
        window.generateFTAReport('all');
      } else {
        toast.warning("Please open a fault tree first");
      }
    }}
  >
    <FontAwesomeIcon icon={faFileAlt} style={{ paddingRight: "10px" }} />
    All Nodes Report
  </NavDropdown.Item> */}
  <NavDropdown.Item 
    onClick={() => {
      if (window.generateFTAReport) {
        window.generateFTAReport('events');
      } else {
        toast.warning("Please open a fault tree first");
      }
    }}
  >
    <FontAwesomeIcon icon={faFileCsv} style={{ paddingRight: "10px" }} />
    List of Events
  </NavDropdown.Item>
  <NavDropdown.Item 
    onClick={() => {
      if (window.generateFTAReport) {
        window.generateFTAReport('gates');
      } else {
        toast.warning("Please open a fault tree first");
      }
    }}
  >
    <FontAwesomeIcon icon={faFilePdf} style={{ paddingRight: "10px" }} />
    List of Gates
  </NavDropdown.Item>
</NavDropdown>

</Nav>  
</Navbar.Collapse>
</Navbar>
)}
{isTreeView && (
<Navbar variant="dark" expand="lg">
  <Navbar.Collapse id="navbar-dark-example">
    <Nav>
      <NavDropdown
        title={
          <span className="dropdown-title">
            View <span className="dropdown-arrow">&#9662;</span>
          </span>
        }
        id="basic-nav-dropdown"
      >
        <NavDropdown.Item onClick={() => onZoomToFit && onZoomToFit()}>
          <FontAwesomeIcon icon={faExpand} style={{ paddingRight: "10px" }} />
          Zoom - To Fit Screen
        </NavDropdown.Item>
        <NavDropdown.Item onClick={() => onZoomOriginal && onZoomOriginal()}>
          <FontAwesomeIcon icon={faCompress} style={{ paddingRight: "10px" }} />
          Zoom - Original Size
        </NavDropdown.Item>
        <NavDropdown.Item onClick={() => onToggleGrid && onToggleGrid()}>
          <FontAwesomeIcon icon={faTh} style={{ paddingRight: "10px" }} />
          Toggle Grid
        </NavDropdown.Item>
        <NavDropdown.Item onClick={() => onOriginalLayout && onOriginalLayout()}>
          <FontAwesomeIcon icon={faRedo} style={{ paddingRight: "10px" }} />
          Original Layout
        </NavDropdown.Item>
      </NavDropdown>
    </Nav>
  </Navbar.Collapse>
  </Navbar>
)}
{isTreeView && (
    <Navbar variant="dark" expand="lg">
                      <Navbar.Collapse id="navbar-dark-example">
                        <Nav>
                          <NavDropdown
                            title={
                              <span className="dropdown-title">
                                Analysis <span className="dropdown-arrow">&#9662;</span>
                              </span>
                            }
                            id="basic-nav-dropdown"
                          >
<NavDropdown.Item 
  onClick={() => {
    // Check if we're in FTA view and have chart data
    if (window.openProbabilityModal) {
      window.openProbabilityModal();
    } else {
      toast.warning("Please open a fault tree first");
    }
  }}
>
  Probability Calculations(MCS)
</NavDropdown.Item>
<NavDropdown.Item 
  onClick={() => {
    if (onToggleRepeatedEvents) {
      onToggleRepeatedEvents();
    } else if (window.showRepeatedEvents) {
      window.showRepeatedEvents();
    } else {
      toast.warning("Please open a fault tree first");
    }
  }}
  style={{
    backgroundColor: showRepeatedEvents ? '#f6ffed' : 'transparent',
    borderLeft: showRepeatedEvents ? '3px solid #52c41a' : 'none'
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
    <span> Highlight Repeated Events</span>
    <span
      style={{
        width: '40px',
        height: '20px',
        backgroundColor: showRepeatedEvents ? '#52c41a' : '#ccc',
        borderRadius: '10px',
        position: 'relative',
        marginLeft: '10px',
        transition: 'background-color 0.2s'
      }}
    >
      <span
        style={{
          width: '16px',
          height: '16px',
          backgroundColor: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: showRepeatedEvents ? '22px' : '2px',
          transition: 'left 0.2s'
        }}
      />
    </span>
  </div>
</NavDropdown.Item>

                          </NavDropdown>
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>
                )}



                  </div>
                ) : null}

                <div
                  style={{
                    width: selectedComponent === "FTA" ? "10%" : "100%",
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <Nav>
                    <UncontrolledDropdown nav inNavbar>
                      <DropdownToggle nav>
                        <div className="d-flex justify-content-start align-items-center">
                          <Tooltip title={userData?.name}>
                            <Avatar round size="50" className="d-flex justify-content-center">
                              <p className="dropdown-option mb-0">{userData?.name?.substring(0, 2)}</p>
                            </Avatar>
                          </Tooltip>
                        </div>
                      </DropdownToggle>
                      <DropdownMenu className="drop-down-menu logout-text">
                        <DropdownItem
                          className="user-dropitem"
                          to="#"
                          onClick={logout}
                          style={{ cursor: "pointer", zIndex: 0 }}
                        >
                          Log Out
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </Nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={"nav-head-main"}>
          <div className="header-logo">
            <img src={Relisafe} alt="Snow" className="mx-1 head-nav-image" />
          </div>
        </div>
      )}



      <Modal
        title={
          <p style={{ margin: "0px", color: "#00a9c9", width: '500px' }}>
            Calculation Parameter
          </p>
        }
        open={openProbCal}
        footer={null}
        onCancel={() => setOpenProbCal(false)}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: "",
            description: "",
            calcTypes: "",
            missionTime: "",
          }}
          onSubmit={(values) => {
            console.log("Probability calculation values:", values);
            // TODO: Implement actual probability calculation API call
            setOpenProbCal(false);
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required("Name is Required"),
            description: Yup.string().required("Description is Required"),
            calcTypes: Yup.object().required("Calc.Types is Required"),
            missionTime: Yup.string().when('calcTypes', {
              is: (calcTypes) => calcTypes?.value === "Unavailability at time t Q(t)",
              then: Yup.string().required("Mission time t is required"),
            }),
          })}
        >
          {({ values, handleChange, handleSubmit, handleBlur, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <FormGroup className="mb-2">
                <Label notify={true}>Name</Label>
                <FormControl
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={values.name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <ErrorMessage className="error text-danger" component="span" name="name" />
              </FormGroup>

              <FormGroup className="mb-2">
                <Label notify={true}>Description</Label>
                <FormControl
                  as="textarea"
                  rows={3}
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={values.description}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <ErrorMessage className="error text-danger" component="span" name="description" />
              </FormGroup>

              <FormGroup className="mb-2">
                <Label notify={true}>Calc.Types</Label>
                <Select
                  styles={customStyles}
                  style={{
                    border: '1px solid black',
                    width: '100%',
                  }}
                  name="calcTypes"
                  value={values.calcTypes}
                  onBlur={handleBlur}
                  onChange={(selectedOption) => {
                    setFieldValue("calcTypes", selectedOption);
                    // Optional: If you need the value in state
                    // setCalcTypes(selectedOption?.value || "");
                  }}
                  options={[
                    {
                      value: "Unavailability at time t Q(t)",
                      label: "Unavailability at time t Q(t)",
                    },
                    {
                      value: "Steady-state mean unavailability Q",
                      label: "Steady-state mean unavailability Q",
                    },
                  ]}
                />
                <ErrorMessage className="error text-danger" component="span" name="calcTypes" />
              </FormGroup>

              {/* Fixed conditional rendering */}
              {(values.calcTypes?.value === "Unavailability at time t Q(t)" ||
                (typeof values.calcTypes === 'string' && values.calcTypes === "Unavailability at time t Q(t)")) && (
                  <FormGroup className="mb-2">
                    <Label notify={true}>Mission time t</Label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FormControl
                        type="text"
                        name="missionTime"
                        placeholder="Mission time t"
                        value={values.missionTime}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        style={{ width: "80%" }}
                      />
                      <p style={{ margin: "0px", fontWeight: "bold", marginLeft: "20px" }}>
                        (hours)
                      </p>
                    </div>
                    <ErrorMessage className="error text-danger" component="span" name="missionTime" />
                  </FormGroup>
                )}

              <div className="d-flex justify-content-end mt-4">
                <Button
                  className="me-2"
                  onClick={() => setOpenProbCal(false)}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Calculation
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
         {additionalButtons && (
        <div className="additional-buttons">
          {additionalButtons}
        </div>
      )}
    </div>
  );
};

export default HeaderNavBar;