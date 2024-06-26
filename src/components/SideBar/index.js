import React, { Component, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Api from "../../Api";
import classNames from "classnames";
import { Modal, Button, Row, Col } from "react-bootstrap";
import {
  faCircleCheck,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

// Icons
import { GiBookshelf } from "react-icons/gi";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faFile,
  faBuildingUser,
  faUser,
  faSuitcase,
  faCircleChevronLeft,
  faChartLine,
  faTableList,
  faChartBar,
  faRepeat,
  faBook,
  faFilter,
  faPlane,
  faTrophy,
  faTachometer,
  faT,
  faHatCowboy,
  faTachographDigital,
  faTemperature1,
  faThumbsDown,
  faTrashCan,
  faSadTear,
  faCarAlt,
  faBiohazard,
  faChartSimple,
  faLock,
  faLink,
  faObjectUngroup,
} from "@fortawesome/free-solid-svg-icons";

// Styles
import "../../css/SideBar.scss";
import { useHistory } from "react-router-dom";
import { Accordion } from "react-bootstrap";
import logo from "../core/Images/logo.png";
import AccordionBody from "react-bootstrap/esm/AccordionBody";

const SideBar = ({ onClick, active, value, props, openSideBar }) => {
  const open = openSideBar;
  const projectId = value;
  const productId = props;
  const role = localStorage.getItem("role");
  const state = "open";
  const [readPermission, setReadPermission] = useState();
  const history = useHistory();
  const userId = localStorage.getItem("userId");
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const storedHue = localStorage.getItem("themeHue");
  const initialHue = storedHue ? parseInt(storedHue, 10) : 0;
  const [hue, setHue] = useState(initialHue);
  const [confirmed, setConfirmed] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClick = (event) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  const navigateToProject = () => {
    setShowConfirmation(false);
    // Perform navigation logic here
    history.push("/project/list");
  };
  const getProjectPermission = () => {
    const id = projectId;
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        authorizedPersonnel: userId,
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setReadPermission(data?.modules);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const projectSidebar = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: {
        userId: userId,
      },
    }).then((res) => {
      setIsOwner(res.data.data.isOwner);
      setCreatedBy(res.data.data.createdBy);
    });
  };

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
    const root = document.querySelector(":root");
    root.style.setProperty("--primary-color", `oklch(45.12% 0.267 ${hue})`);
    root.style.setProperty("--secondary-color", `oklch(94.45% 0.03 ${hue})`);
    root.style.setProperty("--Default-color", `oklch(70% 0.099 197.36 ${hue})`);
    localStorage.setItem("themeHue", hue.toString());
  }, [projectId]);

  const handleSliderChange = (event) => {
    const newHue = event.target.value;
    setHue(newHue);
  };

  return (
    <div>
      <div className={`${active ? "sidebar" : "sidebar active"}`}>
        <div className="logo-content">
          <div className="logo">
            <img src={logo} alt="Snow" width={"80%"} height={"100%"} />
          </div>
          {active === true ? (
            <FontAwesomeIcon
              icon={faBars}
              size="1x"
              onClick={() => {
                onClick(!active);
              }}
              className="menu-button "
            />
          ) : (
            <FontAwesomeIcon
              icon={faCircleChevronLeft}
              onClick={() => {
                onClick(!active);
              }}
              className="menu-button "
            />
          )}
        </div>
        <div className="nav-list">
          {role == "SuperAdmin" ? (
            <div>
              <div className="menu-list">
                <NavLink to={"/company"} activeClassName="main-nav-active">
                  <FontAwesomeIcon
                    icon={faBuildingUser}
                    size="1x"
                    title="Company"
                    className="menu-icon"
                  />
                  <span>Company</span>
                </NavLink>
              </div>

              <div className="menu-list mt-2">
                <NavLink
                  to={"/company/admin"}
                  activeClassName="main-nav-active"
                  style={{
                    backgroundColor:
                      selectedModule === "user"
                        ? "mediumaquamarine"
                        : "inherit",
                  }}
                  onClick={() => setSelectedModule("user")}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    size="1x"
                    title="Users"
                    className="menu-icon"
                  />
                  <span>Users</span>
                </NavLink>
              </div>
            </div>
          ) : role === "admin" || (isOwner === true && createdBy === userId) ? (
            <div>
              <div className="menu-list">
                <NavLink
                  to={"/user"}
                  style={{
                    backgroundColor:
                      selectedModule === "user"
                        ? "mediumaquamarine"
                        : "inherit",
                  }}
                  onClick={() => setSelectedModule("user")}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    size="1x"
                    className="menu-icon"
                    title="Users"
                  />
                  <span>Users</span>
                </NavLink>
              </div>

              <div className="menu-list mt-1">
                <NavLink
                  to={"/project/list"}
                  activeClassName="main-nav-active"
                  style={{
                    backgroundColor:
                      selectedModule === "projects"
                        ? "mediumaquamarine"
                        : "inherit",
                  }}
                   onClick={handleClick}
                >
                  <FontAwesomeIcon
                    icon={faFile}
                    size="1x"
                    className="menu-icon"
                    title="Projects"
                  />
                  <span>Projects</span>
                </NavLink>
              </div>

              <div className="menu-list">
                <NavLink
                  to={"/theme"}
                  activeClassName="main-nav-active"
                  style={{
                    backgroundColor:
                      selectedModule === "theme"
                        ? "mediumaquamarine"
                        : "inherit",
                  }}
                  onClick={() => setSelectedModule("theme")}
                >
                  <FontAwesomeIcon
                    icon={faChartSimple}
                    size="1x"
                    className="menu-icon"
                    title="Theme"
                  />

                  <span>Theme</span>
                </NavLink>
              </div>

              <hr className="divider-color" />
              {projectId ? (
                <div>
                  <div className="menu-list">
                    <NavLink
                      to={{
                        pathname: `/pbs/${projectId}`,
                        state: { projectId: projectId, state },
                      }}
                      activeClassName="main-nav-active"
                      style={{
                        backgroundColor:
                          selectedModule === "pbs"
                            ? "mediumaquamarine"
                            : "inherit",
                      }}
                      onClick={() => setSelectedModule("pbs")}
                    >
                      <FontAwesomeIcon
                        icon={faSuitcase}
                        size="1x"
                        className="menu-icon"
                        title="PBS"
                      />
                      <span>PBS</span>
                    </NavLink>
                  </div>

                  <div className="menu-list mt-1">
                    <NavLink
                      to={{
                        pathname: `/failure-rate-prediction/${projectId}`,
                        state: { projectId: projectId, state },
                      }}
                      activeClassName="main-nav-active"
                      style={{
                        backgroundColor:
                          selectedModule === "failureRatePrediction"
                            ? "mediumaquamarine"
                            : "inherit",
                      }}
                      onClick={() => setSelectedModule("failureRatePrediction")}
                    >
                      <FontAwesomeIcon
                        icon={faChartLine}
                        size="1x"
                        className="menu-icon"
                        title="Failure Rate Prediction"
                      />
                      <span>Failure Rate Prediction</span>
                    </NavLink>
                  </div>

                  <div className="menu-list mt-1">
                    <NavLink
                      to={{
                        pathname: `/mttr/prediction/${projectId}`,
                        state: {
                          projectId: projectId,
                          productId: productId,
                          state,
                        },
                      }}
                      activeClassName="main-nav-active"
                      style={{
                        backgroundColor:
                          selectedModule === "mttrPrediction"
                            ? "mediumaquamarine"
                            : "inherit",
                      }}
                      onClick={() => setSelectedModule("mttrPrediction")}
                    >
                      <FontAwesomeIcon
                        icon={faSuitcase}
                        size="1x"
                        className="menu-icon"
                        title="MTTR prediction"
                      />{" "}
                      <span>MTTR Prediction</span>
                    </NavLink>
                  </div>

                  <div className="menu-list mt-1">
                    <NavLink
                      to={{
                        pathname: `/fmeca/${projectId}`,
                        state: {
                          projectId: projectId,
                          productId: productId,
                          state,
                        },
                      }}
                      activeClassName="main-nav-active"
                      style={{
                        backgroundColor:
                          selectedModule === "fmeca"
                            ? "mediumaquamarine"
                            : "inherit",
                      }}
                      onClick={() => setSelectedModule("fmeca")}
                    >
                      <FontAwesomeIcon
                        icon={faTableList}
                        size="1x"
                        className="menu-icon"
                        title="FMECA"
                      />{" "}
                      <span>FMECA</span>
                    </NavLink>
                  </div>

                  <div className="menu-list mt-1">
                    <NavLink
                      to={{
                        pathname: `/rbd/${projectId}`,
                        state: { projectId: projectId, state },
                      }}
                      activeClassName="main-nav-active"
                      style={{
                        backgroundColor:
                          selectedModule === "rbd"
                            ? "mediumaquamarine"
                            : "inherit",
                      }}
                      onClick={() => setSelectedModule("rbd")}
                    >
                      <FontAwesomeIcon
                        icon={faChartBar}
                        size="1x"
                        className="menu-icon"
                        title="RBD"
                      />{" "}
                      <span>RBD</span>
                    </NavLink>
                  </div>

                  <div className="menu-list mt-1">
                    <NavLink
                      to={{
                        pathname: `/fta/${projectId}`,
                        state: { projectId: projectId, state },
                      }}
                      activeClassName="main-nav-active"
                      style={{
                        backgroundColor:
                          selectedModule === "fta"
                            ? "mediumaquamarine"
                            : "inherit",
                      }}
                      onClick={() => setSelectedModule("fta")}
                    >
                      <FontAwesomeIcon
                        icon={faRepeat}
                        size="1x"
                        className="menu-icon"
                        title="FTA"
                      />{" "}
                      <span>FTA</span>
                    </NavLink>
                  </div>

                  <div className="menu-list mt-1">
                    <NavLink
                      to={{
                        pathname: `/pmmra/${projectId}`,
                        state: {
                          projectId: projectId,
                          productId: productId,
                          state,
                        },
                      }}
                      activeClassName="main-nav-active"
                      style={{
                        backgroundColor:
                          selectedModule === "pmmra"
                            ? "mediumaquamarine"
                            : "inherit",
                      }}
                      onClick={() => setSelectedModule("pmmra")}
                    >
                      <FontAwesomeIcon
                        icon={faBook}
                        size="1x"
                        className="menu-icon"
                        title="PM MRA"
                      />{" "}
                      <span>PM MRA</span>
                    </NavLink>
                  </div>

                  <div className="menu-list mt-1">
                    <NavLink
                      to={{
                        pathname: `/spare-parts-analysis/${projectId}`,
                        state: {
                          projectId: projectId,
                          productId: productId,
                          state,
                        },
                      }}
                      activeClassName="main-nav-active"
                      style={{
                        backgroundColor:
                          selectedModule === "sparePartsAnalysis"
                            ? "mediumaquamarine"
                            : "inherit",
                      }}
                      onClick={() => setSelectedModule("sparePartsAnalysis")}
                    >
                      <FontAwesomeIcon
                        icon={faFilter}
                        size="1x"
                        className="menu-icon"
                        title="Spare Parts Analysis"
                      />{" "}
                      <span>Spare Parts Analysis</span>
                    </NavLink>
                  </div>

                  <div className="menu-list mt-1">
                    {" "}
                    <NavLink
                      to={{
                        pathname: `/safety/${projectId}`,
                        state: {
                          projectId: projectId,
                          productId: productId,
                          state,
                        },
                      }}
                      activeClassName="main-nav-active"
                      style={{
                        backgroundColor:
                          selectedModule === "safety"
                            ? "mediumaquamarine"
                            : "inherit",
                      }}
                      onClick={() => setSelectedModule("safety")}
                    >
                      <FontAwesomeIcon
                        icon={faLock}
                        size="1x"
                        className="menu-icon"
                        title="Safety"
                      />{" "}
                      <span>Safety</span>
                    </NavLink>
                  </div>

                  <div className="mt-1">
                    <Accordion className="accordion-style ">
                      <Accordion.Item eventKey="0">
                        <Accordion.Header className="accodrion-header">
                          <GiBookshelf
                            size="35"
                            className="menu-icon"
                            title="LIBRARIES"
                          />{" "}
                          <span className="ms-4 ">LIBRARIES</span>
                        </Accordion.Header>
                        <br />
                        <Accordion.Body>
                          <div className="menu-list">
                            <NavLink
                              to={{
                                pathname: `/separate/library/${projectId}`,
                                state: {
                                  projectId: projectId,
                                  productId: productId,
                                  state,
                                },
                              }}
                              activeClassName="main-nav-active"
                              style={{
                                backgroundColor:
                                  selectedModule === "seperateLibrary"
                                    ? "mediumaquamarine"
                                    : "inherit",
                              }}
                              onClick={() =>
                                setSelectedModule("seperateLibrary")
                              }
                            >
                              <FontAwesomeIcon
                                icon={faObjectUngroup}
                                size="1x"
                                className="menu-icon"
                                title="Seprated Library"
                              />{" "}
                              <span>Seprated Library</span>
                            </NavLink>
                          </div>
                          <div className="menu-list mt-1">
                            <NavLink
                              to={{
                                pathname: `/connected/library/${projectId}`,
                                state: { projectId: projectId, state },
                              }}
                              activeClassName="main-nav-active"
                              style={{
                                backgroundColor:
                                  selectedModule === "connecetedLibrary"
                                    ? "mediumaquamarine"
                                    : "inherit",
                              }}
                              onClick={() =>
                                setSelectedModule("connecetedLibrary")
                              }
                            >
                              <FontAwesomeIcon
                                icon={faLink}
                                size="1x"
                                className="menu-icon"
                                title="connected library"
                              />{" "}
                              <span>Connected Library</span>
                            </NavLink>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </div>
              ) : null}
              <div className="menu-list">
                {/* <span className="tooltip-style">Safety</span> */}
              </div>
            </div>
          ) : role === "Employee" ? (
            <div>
              <div className="menu-list">
                <NavLink
                  to={"/user"}
                  activeClassName="main-nav-active"
                  style={{
                    backgroundColor:
                      selectedModule === "user"
                        ? "mediumaquamarine"
                        : "inherit",
                  }}
                  onClick={() => setSelectedModule("user")}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    size="1x"
                    className="menu-icon"
                    title="Users"
                  />
                  <span>Users</span>
                </NavLink>
              </div>

              <div className="menu-list mt-1">
                <NavLink
                  to={{
                    pathname: "/project/list",
                    state: {
                      projectread: readPermission?.[8]?.read,
                      projectWrite: readPermission?.[8]?.write,
                    },
                  }}
                  activeClassName="main-nav-active"
                  style={{
                    backgroundColor:
                      selectedModule === "project"
                        ? "mediumaquamarine"
                        : "inherit",
                  }}
                  onClick={() => setSelectedModule("project")}
                >
                  <FontAwesomeIcon
                    icon={faFile}
                    size="1x"
                    className="menu-icon"
                    title="Projects"
                  />
                  <span>Projects</span>
                </NavLink>
              </div>
              <hr className="divider-color" />
              {projectId ? (
                <div>
                  {readPermission?.[0]?.read === true ? (
                    <div className="menu-list">
                      <NavLink
                        to={{
                          pathname: `/pbs/${projectId}`,
                          state: {
                            projectId: projectId,
                            pbsWrite: readPermission?.[0].write,
                          },
                        }}
                        activeClassName="main-nav-active"
                        style={{
                          backgroundColor:
                            selectedModule === "pbs"
                              ? "mediumaquamarine"
                              : "inherit",
                        }}
                        onClick={() => setSelectedModule("pbs")}
                      >
                        <FontAwesomeIcon
                          icon={faSuitcase}
                          size="1x"
                          className="menu-icon"
                          title="PBS"
                        />{" "}
                        <span>PBS</span>
                      </NavLink>
                    </div>
                  ) : null}
                  {readPermission?.[1]?.read === true ? (
                    <div className="menu-list mt-1">
                      <NavLink
                        to={{
                          pathname: `/failure-rate-prediction/${projectId}`,
                          state: {
                            projectId: projectId,
                            frpWrite: readPermission?.[1].write,
                          },
                        }}
                        activeClassName="main-nav-active"
                        style={{
                          backgroundColor:
                            selectedModule === "failureRatePrediction"
                              ? "mediumaquamarine"
                              : "inherit",
                        }}
                        onClick={() =>
                          setSelectedModule("failureRatePrediction")
                        }
                      >
                        <FontAwesomeIcon
                          icon={faChartLine}
                          size="1x"
                          className="menu-icon"
                          title="Failure Rate Prediction"
                        />{" "}
                        <span>Failure Rate Prediction</span>
                      </NavLink>
                    </div>
                  ) : null}
                  {readPermission?.[2]?.read === true ? (
                    <div className="menu-list mt-1">
                      <NavLink
                        to={{
                          pathname: `/mttr/prediction/${projectId}`,
                          state: {
                            projectId: projectId,
                            productId: productId,
                            mttrWrite: readPermission?.[2].write,
                          },
                        }}
                        activeClassName="main-nav-active"
                        style={{
                          backgroundColor:
                            selectedModule === "mttrPrediction"
                              ? "mediumaquamarine"
                              : "inherit",
                        }}
                        onClick={() => setSelectedModule("mttrPrediction")}
                      >
                        <FontAwesomeIcon
                          icon={faSuitcase}
                          size="1x"
                          className="menu-icon"
                          title="MTTR prediction"
                        />{" "}
                        <span>MTTR Prediction</span>
                      </NavLink>
                    </div>
                  ) : null}
                  {readPermission?.[3]?.read === true ? (
                    <div className="menu-list mt-1">
                      <NavLink
                        to={{
                          pathname: `/fmeca/${projectId}`,
                          state: {
                            projectId: projectId,
                            productId: productId,
                            fmecaWrite: readPermission?.[3].write,
                          },
                        }}
                        activeClassName="main-nav-active"
                        style={{
                          backgroundColor:
                            selectedModule === "fmeca"
                              ? "mediumaquamarine"
                              : "inherit",
                        }}
                        onClick={() => setSelectedModule("fmeca")}
                      >
                        <FontAwesomeIcon
                          icon={faTableList}
                          size="1x"
                          className="menu-icon"
                          title="FMECA"
                        />{" "}
                        <span>FMECA</span>
                      </NavLink>
                    </div>
                  ) : null}
                  {readPermission?.[4]?.read === true ? (
                    <div className="menu-list mt-1">
                      <NavLink
                        to={{
                          pathname: `/rbd/${projectId}`,
                          state: {
                            projectId: projectId,
                            rbdWrite: readPermission?.[4].write,
                          },
                        }}
                        activeClassName="main-nav-active"
                        style={{
                          backgroundColor:
                            selectedModule === "rbd"
                              ? "mediumaquamarine"
                              : "inherit",
                        }}
                        onClick={() => setSelectedModule("rbd")}
                      >
                        <FontAwesomeIcon
                          icon={faChartBar}
                          size="1x"
                          className="menu-icon"
                          title="RBD"
                        />{" "}
                        <span>RBD</span>
                      </NavLink>
                    </div>
                  ) : null}
                  {readPermission?.[5]?.read === true ? (
                    <div className="menu-list mt-1">
                      <NavLink
                        to={{
                          pathname: `/fta/${projectId}`,
                          state: {
                            projectId: projectId,
                            ftaWrite: readPermission?.[5].write,
                          },
                        }}
                        activeClassName="main-nav-active"
                        style={{
                          backgroundColor:
                            selectedModule === "fta"
                              ? "mediumaquamarine"
                              : "inherit",
                        }}
                        onClick={() => setSelectedModule("fta")}
                      >
                        <FontAwesomeIcon
                          icon={faRepeat}
                          size="1x"
                          className="menu-icon"
                          title="FTA"
                        />{" "}
                        <span>FTA</span>
                      </NavLink>
                    </div>
                  ) : null}
                  {readPermission?.[6]?.read === true ? (
                    <div className="menu-list mt-1">
                      <NavLink
                        to={{
                          pathname: `/pmmra/${projectId}`,
                          state: {
                            projectId: projectId,
                            productId: productId,
                            pmmraWrite: readPermission?.[6].write,
                          },
                        }}
                        activeClassName="main-nav-active"
                        style={{
                          backgroundColor:
                            selectedModule === "pmmra"
                              ? "mediumaquamarine"
                              : "inherit",
                        }}
                        onClick={() => setSelectedModule("pmmra")}
                      >
                        <FontAwesomeIcon
                          icon={faBook}
                          size="1x"
                          className="menu-icon"
                          title="PM MRA"
                        />{" "}
                        <span>PM MRA</span>
                      </NavLink>
                    </div>
                  ) : null}
                  {readPermission?.[7]?.read === true ? (
                    <div className="menu-list mt-1">
                      <NavLink
                        to={{
                          pathname: `/spare-parts-analysis/${projectId}`,
                          state: {
                            projectId: projectId,
                            productId: productId,
                            spaWrite: readPermission?.[7].write,
                          },
                        }}
                        activeClassName="main-nav-active"
                        style={{
                          backgroundColor:
                            selectedModule === "sparePartsAnalysis"
                              ? "mediumaquamarine"
                              : "inherit",
                        }}
                        onClick={() => setSelectedModule("sparePartsAnalysis")}
                      >
                        <FontAwesomeIcon
                          icon={faFilter}
                          size="1x"
                          className="menu-icon"
                          title="Spare Parts Analysis"
                        />{" "}
                        <span>Spare Parts Analysis</span>
                      </NavLink>
                    </div>
                  ) : null}
                  {readPermission?.[9]?.read === true ? (
                    <div className="menu-list mt-1">
                      {" "}
                      <NavLink
                        to={{
                          pathname: `/safety/${projectId}`,
                          state: {
                            projectId: projectId,
                            productId: productId,
                            safetyWrite: readPermission?.[9].write,
                          },
                        }}
                        activeClassName="main-nav-active"
                        style={{
                          backgroundColor:
                            selectedModule === "safety"
                              ? "mediumaquamarine"
                              : "inherit",
                        }}
                        onClick={() => setSelectedModule("safety")}
                      >
                        <FontAwesomeIcon
                          icon={faLock}
                          size="1x"
                          className="menu-icon"
                          title="Safety"
                        />{" "}
                        <span>Safety</span>
                      </NavLink>
                    </div>
                  ) : null}
                  {readPermission?.[10]?.read === true &&
                  readPermission?.[11]?.read === true ? (
                    <Accordion className="accordion-style mt-1 ">
                      <Accordion.Item eventKey="0">
                        <Accordion.Header className="accodrion-header">
                          <GiBookshelf
                            size="35"
                            className="menu-icon"
                            title="LIBRARIES"
                          />{" "}
                          <span className="ms-4 ">LIBRARIES</span>
                        </Accordion.Header>
                        <br />
                        <Accordion.Body>
                          {readPermission?.[10]?.read === true ? (
                            <div className="menu-list mt-1">
                              {" "}
                              <NavLink
                                to={{
                                  pathname: `/separate/library/${projectId}`,
                                  state: {
                                    projectId: projectId,
                                    productId: productId,
                                    safetyWrite: readPermission?.[10].write,
                                  },
                                }}
                                activeClassName="main-nav-active"
                                style={{
                                  backgroundColor:
                                    selectedModule === "seperateLibrary"
                                      ? "mediumaquamarine"
                                      : "inherit",
                                }}
                                onClick={() =>
                                  setSelectedModule("seperateLibrary")
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faObjectUngroup}
                                  size="1x"
                                  className="menu-icon"
                                  title="Seprated Library"
                                />{" "}
                                <span>Seprated Library</span>
                              </NavLink>
                            </div>
                          ) : null}
                          {readPermission?.[11]?.read === true ? (
                            <div className="menu-list mt-1">
                              {" "}
                              <NavLink
                                to={{
                                  pathname: `/connected/library/${projectId}`,
                                  state: {
                                    projectId: projectId,
                                    productId: productId,
                                    safetyWrite: readPermission?.[11].write,
                                  },
                                }}
                                activeClassName="main-nav-active"
                                style={{
                                  backgroundColor:
                                    selectedModule === "connectedLibrary"
                                      ? "mediumaquamarine"
                                      : "inherit",
                                }}
                                onClick={() =>
                                  setSelectedModule("connectedLibrary")
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faLink}
                                  size="1x"
                                  className="menu-icon"
                                  title="connected library"
                                />{" "}
                                <span>Connected Library</span>
                              </NavLink>
                            </div>
                          ) : null}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  ) : readPermission?.[10]?.read === true ||
                    readPermission?.[11]?.read === true ? (
                    <div>
                      {readPermission?.[10]?.read === true ? (
                        <div className="menu-list mt-1">
                          {" "}
                          <NavLink
                            to={{
                              pathname: `/separate/library/${projectId}`,
                              state: {
                                projectId: projectId,
                                productId: productId,
                                safetyWrite: readPermission?.[10].write,
                              },
                            }}
                            activeClassName="main-nav-active"
                            style={{
                              backgroundColor:
                                selectedModule === "seperateLibrary"
                                  ? "mediumaquamarine"
                                  : "inherit",
                            }}
                            onClick={() => setSelectedModule("seperateLibrary")}
                          >
                            <FontAwesomeIcon
                              icon={faObjectUngroup}
                              size="1x"
                              className="menu-icon"
                              title="Seprated Library"
                            />{" "}
                            <span>Seprated Library</span>
                          </NavLink>
                        </div>
                      ) : null}
                      {readPermission?.[11]?.read === true ? (
                        <div className="menu-list mt-1">
                          {" "}
                          <NavLink
                            to={{
                              pathname: `/connected/library/${projectId}`,
                              state: {
                                projectId: projectId,
                                productId: productId,
                                safetyWrite: readPermission?.[11].write,
                              },
                            }}
                            activeClassName="main-nav-active"
                            style={{
                              backgroundColor:
                                selectedModule === "connectedLibrary"
                                  ? "mediumaquamarine"
                                  : "inherit",
                            }}
                            onClick={() =>
                              setSelectedModule("connectedLibrary")
                            }
                          >
                            <FontAwesomeIcon
                              icon={faLink}
                              size="1x"
                              className="menu-icon"
                              title="connected library"
                            />{" "}
                            <span>Connected Library</span>
                          </NavLink>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="menu-list">
                {/* <span className="tooltip-style">Safety</span> */}
              </div>
            </div>
          ) : null}
          <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to navigate to the project list?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={navigateToProject}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
        </div>
      </div>
    </div>
  );
};
export default SideBar;
