import React, { Component, useEffect, useState } from "react";
import { Table, Row, Col, Form, Modal, Card, Button, Dropdown } from "react-bootstrap";
import "../../css/ProjectList.scss";
import { Link } from "react-router-dom";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import { FaEllipsisV } from "react-icons/fa";
import { ErrorMessage, Formik } from "formik";
import Label from "../LabelComponent";
import Select from "react-select";
import * as Yup from "yup";
import Loader from "../core/Loader";
import Denied from "../core/Images/denied.png";
import Success from "../core/Images/success.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FaExclamationCircle } from "react-icons/fa";
import { red } from "@mui/material/colors";
import { customStyles } from "../core/select";


export default function ProjectList(props) {
  const pbspermission = props?.location?.state?.pbsWrite;
  const [projectList, setProjectList] = useState([]);
  const [projectId, setProjectId] = useState();
  const [projectName, setProjectName] = useState();
  const [companyName, setCompanyName] = useState();
  const [projectNum, setProjectNum] = useState();
  const [projectOwner, setProjectOwner] = useState();
  const [confirmDeleteMsg, setConfirmDeleteMsg] = useState(false);
  const [projectDeleteMessage, setProjectDeleteMessage] = useState(false);
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [owner, setOwner] = useState();
  const [responseExist, setResponseExist] = useState(false);
  const [alreadyExistMsg, setAlreadyExistMsg] = useState();
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const [isOwner, setIsOwner] = useState(false);

  const role = localStorage.getItem("role");

  const storedHue = localStorage.getItem("themeHue");
  const initialHue = storedHue ? parseInt(storedHue, 10) : 0;
  const [hue, setHue] = useState(initialHue);
  
  const getDeleteProjectData = (value) => {
    setConfirmDeleteMsg(true);
    setProjectId(value?.id);
    setCompanyName(value?.companyId?.companyName);
    setProjectName(value?.projectName);
    setProjectNum(value?.projectNumber);
    setProjectOwner(value?.projectOwner?.name);
  };

  const deleteProject = () => {
    Api.delete(`api/v1/projectCreation/${projectId}`, {
      headers: {
        userId: userId,
      },
    })
      .then((res) => {
        setConfirmDeleteMsg(false);
        ProjectDeleteMessageClose();
        getProjectList();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--user-theme-color-hue", initialHue);
    getProjectList();
    getUsers();
    getUserDetails();
  }, []);

  const getUsers = () => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    
    Api.get("/api/v1/user/list", {
      params: {
        userId: userId,
        companyId: companyId,
       
      },
    })
      .then((response) => {
        setUserList(response?.data?.usersList);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const ProjectDeleteMessageClose = () => {
    setProjectDeleteMessage(true);
    setTimeout(() => {
      setProjectDeleteMessage(false);
    }, 2000);
  };

  const projectAlreadyExist = () => {
    setResponseExist(true);
    setTimeout(() => {
      setResponseExist(false);
    }, 2000);
  };

  const getProjectList = () => {

    const companyId = localStorage.getItem("companyId");
    Api.get(`/api/v1/projectCreation/company/user`, {
      params: {
        companyId: companyId,
        userId: userId,
      },
    })
      .then((response) => {
        setIsOwner(response?.data?.data?.isOwner);
        setProjectList(response?.data?.data);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  const SignInSchema = Yup.object().shape({
    name: Yup.string()
      .required("Project name is required")
      .min(1, "Enter project valid name")
      .max(25, "Maximum 25 character is allowed")
      .test('no-whitespace', 'Project name cannot contain only whitespace', (value) => {
        return value && value.trim().length > 0;
      }),

    number: Yup.string()
      .required("Project number is required")
      .min(1, "Enter valid project number")
      .max(25, "Maximum 25 characters is allowed")
      .test('no-whitespace', 'Project number cannot contain only whitespace', (value) => {
        return value && value.trim().length > 0;
      }),
    description: Yup.string()
      .required("Project description is required")
      .min(1, "Enter valid project description is required")
      .test('no-whitespace', 'Project description cannot contain only whitespace', (value) => {
        return value && value.trim().length > 0;
      })
     .max(50, "Maximum 50 character is allowed"),
    // owner: Yup.object().required("Project owner Is required"),
  });
  const submitForm = (values, { resetForm }, id) => {
    
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    Api.post("api/v1/projectCreation/", {
    
      projectName: values.name,
      projectDesc: values.description,
      projectNumber: values.number,
      projectOwner: owner,
      companyId: companyId,
      userId: userId,
    })
      .then((res) => {
        if (res.status === 201) {
          const projectlistId = res?.data?.data?.createData?.id;
          const projectName = res?.data?.data?.createData?.projectName;
          getUserDetails();
          history.push({
            pathname: `/project/details/${projectlistId}`,
            state: {
              projctID: projectlistId,
              projectName: projectName,
              companyId: companyId,
            },
          });
        } else {
          setAlreadyExistMsg(res?.data?.message);
          projectAlreadyExist();
          resetForm({ values: "" });
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  const getUserDetails = (id) => {
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/user/`, { params: { userId: userId } })
      .then((res) => {
        const editData = res.data.usersList;
        const userStatus = res.data.usersList.isOwner;
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  return (
    <div className="mx-4 mb-5 " style={{ marginTop: "90px" }}>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="mttr-sec ">
            <p className=" mb-0 para-tag">Projects</p>
          </div>

          <div className="d-flex justify-content-end mt-4 low-length-responsive">
            <Button className="save-btn  mb-3" variant="secondary" onClick={() => setShow(true)}>
              CREATE PROJECT
            </Button>
          </div>
          <Table bordered hover className="mt-4" style={{ bottom: "30px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Project No</th>
                <th>Project Name</th>
                {/* <th>Project Owner</th> */}
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {projectList?.length > 0 ? (
                projectList?.map((list, i) => (
                  <tr className=" mt-3 mb-3">
                    <td className="viewRow ">{i + 1}</td>
                    <td className="viewRow">{list?.projectNumber}</td>
                    <td className="viewRow">{list?.projectName}</td>
                    {/* <td className="viewRow">{list?.projectOwner?.name}</td> */}
                    {role === "admin" || (list.isOwner === true && list.createdBy === userId) ? (
                      <td className="d-flex justify-content-center ">
                        <Dropdown>
                          <Dropdown.Toggle className="dropdown">
                            <FaEllipsisV className="icon" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu right>
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={() =>
                                history.push({
                                  pathname: `/project/details/edit/${list?.id}`,
                                  state: {
                                    projectID: list?.id,
                                    company: list?.companyId?.companyName,
                                    project: projectName,
                                  },
                                })
                              }
                            >
                              Project Details
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={() => {
                                history.push({
                                  pathname: `/pbs/${list?.id}`,

                                  state: { projectId: list?.id, state: ["openSidebar", "pbs"],  pbsWrite: pbspermission },
                                });
                              }}
                            >
                              Open Project
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={(e) => getDeleteProjectData(list)}
                            >
                              Delete Project
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project "
                              onClick={() => {
                                history.push({
                                  pathname: `/permissions/${list?.id}`,
                                  state: {
                                    projectID: list?.id,
                                    companyName: list?.companyId?.companyName,
                                    projectName: list?.projectName,
                                    companyId: list?.companyId?._id,
                                  },
                                });
                              }}
                            >
                              Edit Permission
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    ) : (
                      <td className="d-flex justify-content-center ">
                        <Dropdown>
                          <Dropdown.Toggle className="dropdown">
                            <FaEllipsisV className="icon" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu right>
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={() =>
                                history.push({
                                  pathname: `/project/details/edit/${list?.id}`,
                                  state: {
                                    projectID: list?.id,
                                    company: list?.companyId?.companyName,
                                    project: projectName,
                                  },
                                })
                              }
                            >
                              Project Details
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={() => {
                                history.push({
                                  pathname: `/pbs/${list?.id}`,

                                  state: { projectId: list?.id, state: "openSideBar", pbsWrite: pbspermission },
                                });
                              }}
                            >
                              Open Project
                            </Dropdown.Item>
                            <Dropdown.Divider />
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <h6 className="d-flex justify-content-center">No Records to Display</h6>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <div>
            <Modal show={show} size="lg" centered backdrop="static">
              <Modal.Body>
                <div className="mttr-sec mt-3 mx-2">
                  <p className=" mb-0 para-tag">Create Project </p>
                </div>
              </Modal.Body>
              <Formik
                initialValues={{
                  name: "",
                  number: "",
                  description: "",
                  owner: "",
                }}
                validationSchema={SignInSchema}
                onSubmit={(values, { resetForm }) => submitForm(values, { resetForm })}
              >
                {(formik) => {
                  const { values, handleChange, handleSubmit, handleBlur, isValid } = formik;
                  return (
                    <div className=" mx-4"style={{width:"1000px"}}>
                      <Form onSubmit={handleSubmit}>
                        <Card className="card-color">
                          <div className="pb-4 px-4">
                            <Row>
                              <Col>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Project Name</Label>
                                  <Form.Control
                                    type="name"
                                    className="mt-1"
                                    name="name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    //   onBlur={(e) => {
                                    //   handleBlur(e);
                                    // setFieldValue('name', e.target.value.trim());
                                    //   }}
                                    id="name"
                                    placeholder="Project Name"
                                  />
                                  <ErrorMessage name="name" component="span" className="error" />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Project Number</Label>
                                  <Form.Control
                                    type="string"
                                    name="number"
                                    id="number"
                                    value={values.number}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    placeholder="Project Number"
                                  />
                                  <ErrorMessage name="number" component="span" className="error" />
                                </Form.Group>
                              </Col>
                              {/* <Col>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Project Owner</Label>
                                  <Select
                                    name="owner"
                                    styles={customStyles}
                                    placeholder="Select User "
                                    value={values.owner}
                                    className="mt-1"
                                    onBlur={handleBlur}
                                    onChange={(e) => {
                                      setFieldValue("owner", e);
                                      setOwner(e.value);
                                    }}
                                    options={[
                                      // { value: null, label: "None" },
                                      {
                                        options: userList.map((list) => ({
                                          value: list?.id,
                                          label: (
                                            <div className="d-flex flex-direction-row">
                                              <text>{list?.name} </text>
                                            </div>
                                          ),
                                        })),
                                      },
                                    ]}
                                  />{" "}
                                  <ErrorMessage name="owner" component="span" className="error" />
                                </Form.Group>
                              </Col> */}
                            </Row>
                            <Row>
                              <Col>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Project Description</Label>

                                  <Form.Control
                                    as="textarea"
                                    type="description"
                                    name="description"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.description}
                                    id="description"
                                    className="mt-1"
                                    rows={4}
                                    placeholder="Project Description"
                                  />
                                  <ErrorMessage name="description" component="span" className="error" />
                                </Form.Group>
                              </Col>
                            </Row>
                          </div>
                        </Card>
                        <Row className="mt-3 mb-4 me-0 pe-0">
                          <Col className="add-project-button me-0 pe-0 ">
                            <Button
                              className="  delete-cancel-btn me-2 "
                              variant="outline-secondary"
                              type="reset"
                              onClick={() => setShow(false)}
                            >
                              CANCEL
                            </Button>
                            <Button className=" save-btn" type="submit" disabled={!isValid}>
                              CREATE
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                      <Modal show={responseExist} centered className="user-delete-modal-user">
                        <Modal.Body className="modal-body-user">
                          <FontAwesomeIcon icon={faCircleExclamation} fontSize={"40px"} color={"red"} />
                        </Modal.Body>
                        <Modal.Footer
                          className=" d-flex justify-content-center"
                          style={{ borderTop: 0, bottom: "30px" }}
                        >
                          <div>
                            <h4 className="text-center">{alreadyExistMsg}</h4>
                          </div>
                        </Modal.Footer>
                      </Modal>
                    </div>
                  );
                }}
              </Formik>
            </Modal>
          </div>

          <div>
            <Modal show={confirmDeleteMsg} centered className="project-delete-modal-use" backdrop="static">
              <Modal.Body>
                <div style={{ marginTop: "25px" }}>
                  <h5 className="d-flex justify-content-center">Are you sure you want to delete this project?</h5>
                </div>
                <div className="mx-5 ">
                  {companyName ? (
                    <div className="d-flex mt-5">
                      <b className="text-center">Company Name:</b>
                      <p className="ms-2">{companyName}</p>
                    </div>
                  ) : null}

                  <div className="d-flex mt-3">
                    <b>Project Name:</b>
                    <p className="mx-3">{projectName}</p>
                  </div>
                  <div className="d-flex mt-3">
                    <b>Project Number:</b>
                    <p className="mx-3">{projectNum}</p>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className=" d-flex justify-content-center mt-3" style={{ borderTop: 0, bottom: "30px" }}>
                <Button
                  className="  delete-cancel-btn me-2 "
                  variant="outline-secondary"
                  onClick={() => setConfirmDeleteMsg(false)}
                >
                  NO
                </Button>
                <Button className=" save-btn  " onClick={() => deleteProject()}>
                  YES
                </Button>
              </Modal.Footer>
            </Modal>
          </div>

          <div>
            <Modal show={projectDeleteMessage} centered>
              <div className="d-flex justify-content-center mt-5">
                <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
              </div>
              <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
                <div>
                  <h4 className="text-center">Project Deleted Successfully</h4>
                </div>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
}
