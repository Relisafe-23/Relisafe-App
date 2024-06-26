import React, { useState, useEffect, useRef } from "react";
import { Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { Avatar } from "@material-ui/core";
import "../../css/HeaderNavBar.scss";
import Tooltip from "@mui/material/Tooltip";
import logo from "../core/Images/logo.png";
import { useHistory, Link } from "react-router-dom";
import { useModal } from "../ModalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines, faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import Api from "../../Api.js";
import "../../css/HeaderNavBar.scss";
import { NavDropdown, Navbar } from "react-bootstrap";
import { faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Projectname from "../Company/projectname";

const HeaderNavBar = ({ active, selectedComponent, onReloadData }) => {
  const [userData, setUserData] = useState();
  const sessionId = localStorage.getItem("sessionId");
  const [file, setFile] = useState(null);
  const {
    openFTAModal,
    openPropertiesModal,
    openEditGateModal,
    openChildCreateModal,
    openChildEvent,
    openDeleteNode,
    handleDownloadFTA,
    triggerReload,
  } = useModal();

  const handleCreateNew = () => {
    openFTAModal(); // Open the FTA modal
  };

  const handleOpenPropertyModal = () => {
    openPropertiesModal();
  };

  const handleOpenEdit = () => {
    openEditGateModal();
  };

  const handleOpenChildCreate = () => {
    openChildCreateModal();
  };

  const handleOpenChildEvent = () => {
    openChildEvent();
  };

  const handelDelete = () => {
    openDeleteNode();
  };

  const history = useHistory();

  useEffect(() => {
    getUserDetails();
  }, [sessionId]);

  // Log out
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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    if (event.target.files[0]) {
      const formData = new FormData();
      formData.append("jsonFile", event.target.files[0]);

      try {
        // const response = await fetch("/api/v1/FTAjson/upload", {
        //   method: "POST",
        //   body: formData,
        // });
        Api.post("/api/v1/FTAjson/upload", formData).then((res) => {
          if (res.status === 201) {
            toast("File uploaded successfully!", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              type: "success",
            });
            triggerReload();
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } else {
            toast("File not uploaded!", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              type: "error",
            });
          }
        });
      } catch (error) {
        console.error("Error uploading JSON data", error);
      }
    }
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <input type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} style={{ display: "none" }} />
      {sessionId ? (
        <div className={active ? "nav-head-main-action" : "nav-head-main"}>
          <div className={active ? "avatar-div" : "avatar-div-action"}>
            {/* <DropdownMenu right className="dropdown-content"> */}
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
                            <NavDropdown.Item onClick={handleCreateNew}>
                              <FontAwesomeIcon icon={faFileLines} style={{ paddingRight: "10px" }} />
                              Create New
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={handleOpenPropertyModal}>
                              <FontAwesomeIcon icon={faPenToSquare} style={{ paddingRight: "10px" }} />
                              Properties
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={handleDownloadFTA}>
                              <FontAwesomeIcon icon={faDownload} style={{ paddingRight: "10px" }} />
                              Save to File New
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={handleUpload}>
                              <FontAwesomeIcon icon={faUpload} style={{ paddingRight: "10px" }} />
                              Load from File
                            </NavDropdown.Item>
                          </NavDropdown>
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>

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
                            <NavDropdown.Item onClick={handleOpenChildEvent}> Add New Event</NavDropdown.Item>
                            <NavDropdown.Item onClick={handelDelete}>Delete</NavDropdown.Item>
                          </NavDropdown>
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>
                  </div>
                ) : null}

                {/* <Avatar src={noImg} alt="" round={true} size="50px" className="avatar-img" /> */}
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
                        {/* <Avatar src={noImg} alt="" round={true} size="50px" className="avatar-img" /> */}
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
            <img src={logo} alt="Snow" className="mx-1 head-nav-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderNavBar;
