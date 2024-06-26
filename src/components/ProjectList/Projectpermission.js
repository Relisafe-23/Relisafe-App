import React, { useEffect, useState } from "react";
import { Card, Form, Table, Modal, Button, Row, Col } from "react-bootstrap";
import Label from "../core/Label";
import "../../css/ProjectList.scss";
import { Formik, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import Api from "../../Api";
import * as Yup from "yup";
import { faCircleCheck, faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { customStyles } from "../core/select";

export default function Projectpermission(props) {
  const companyName = props?.location?.state?.companyName;
  const projectName = props?.location?.state?.projectName;
  const companyId = props?.location?.state?.companyId;
  const projectId = props?.location?.state?.projectID;
  const [user, setUser] = useState();
  const [projectread, setProjectread] = useState(false);
  const [projectwrite, setProjectwrite] = useState(false);
  const [pbsread, setPBSread] = useState(false);
  const [pbswrite, setpbswrite] = useState(false);
  const [FRPread, setFRPread] = useState(false);
  const [FRPwrite, setFRPwrite] = useState(false);
  const [mttrRead, setmttrRead] = useState(false);
  const [mttrWrite, setmttrWrite] = useState(false);
  const [fmecaRead, setfmecaRead] = useState(false);
  const [fmecaWrite, setfmecaWrite] = useState(false);
  const [rbdRead, setrbdRead] = useState(false);
  const [rbdWrite, setrbdWrite] = useState(false);
  const [ftaRead, setftaRead] = useState(false);
  const [ftaWrite, setftaWrite] = useState(false);
  const [pmmraRead, setpmmraRead] = useState(false);
  const [pmmraWrite, setpmmraWrite] = useState(false);
  const [spaRead, setspaRead] = useState(false);
  const [spaWrite, setspaWrite] = useState(false);
  const [safetyRead, setSafetyRead] = useState(false);
  const [safetyWrite, setSafetyWrite] = useState(false);
  const [sepLibRead, setSepLibRead] = useState(false);
  const [sepLibWrite, setSepLibWrite] = useState(false);
  const [connectLibRead, setConnectLibRead] = useState(false);
  const [connectLibWrite, setConnectLibWrite] = useState(false);
  const [reportRead, setReportRead] = useState(false);
  const [reportWrite, setReportWrite] = useState(false);
  const [show, setShow] = useState(false);
  const [permissionId, setPermissionId] = useState();
  const [userData, setUserData] = useState();
  const [responseMessage, setResponseMessage] = useState();
  const userId = localStorage.getItem("userId");

  const showModal = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
      history.push("/project/list");
    }, 2000);
  };

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const projects = "Projects";
  const pbs = "PBS";
  const frp = "Failure Rate Prediction";
  const mttr = "MTTR Prediction";
  const fmeca = "FMECA";
  const rbd = "RBD";
  const fta = "FTA";
  const pmmra = "PM MRA";
  const spa = "Spare Part Analysis";
  const safety = "Safety";
  const separateLibrary = "Seprate Library";
  const connectLibarary = "Connected Library";
  const reports = "Reports";

  const getUsers = () => {
    const userId = localStorage.getItem("userId");
    const companyId = localStorage.getItem("companyId");
    Api.get("/api/v1/user/list", {
      params: {
        companyId: companyId,
        userId: userId,
      },
    })
      .then((response) => {
        const data = response?.data?.usersList[0];
        setUser(data?.id ? { value: data?.id, label: data?.name } : "");
        setUserData(response?.data?.usersList);
        getPermissionData(data.id);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const getPermissionData = (values) => {
    const authorizedId = values;

    const id = projectId;
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        projectId: id,
        authorizedPersonnel: authorizedId,
        userId: userId,
      },
    })
      .then((res) => {
        setPermissionId(res?.data?.data?.id);
        const data = res?.data?.data;
        if (data !== null) {
          setPBSread(data?.modules[0]?.read);
          setpbswrite(data?.modules[0]?.write);
          setFRPread(data?.modules[1]?.read);
          setFRPwrite(data?.modules[1]?.write);
          setmttrRead(data?.modules[2]?.read);
          setmttrWrite(data?.modules[2]?.write);
          setfmecaRead(data?.modules[3]?.read);
          setfmecaWrite(data?.modules[3]?.write);
          setrbdRead(data?.modules[4]?.read);
          setrbdWrite(data?.modules[4]?.write);
          setftaRead(data?.modules[5]?.read);
          setftaWrite(data?.modules[5]?.write);
          setpmmraRead(data?.modules[6]?.read);
          setpmmraWrite(data?.modules[6]?.write);
          setspaRead(data?.modules[7]?.read);
          setspaWrite(data?.modules[7]?.write);
          setProjectread(data?.modules[8]?.read);
          setProjectwrite(data?.modules[8]?.write);
          setSafetyRead(data?.modules[9]?.read);
          setSafetyWrite(data?.modules[9]?.write);
          setSepLibRead(data?.modules[10]?.read);
          setSepLibWrite(data?.modules[10]?.write);
          setConnectLibRead(data?.modules[11]?.read);
          setConnectLibWrite(data?.modules[11]?.write);
          setReportRead(data?.modules[12]?.read);
          setReportWrite(data?.modules[12]?.write);
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const permissionUpdate = () => {
    const userId = localStorage.getItem("userId");
    Api.post(`api/v1/projectPermission`, {
      modules: [
        { name: pbs, read: pbsread, write: pbswrite },
        { name: frp, read: FRPread, write: FRPwrite },
        { name: mttr, read: mttrRead, write: mttrWrite },
        { name: fmeca, read: fmecaRead, write: fmecaWrite },
        { name: rbd, read: rbdRead, write: rbdWrite },
        { name: fta, read: ftaRead, write: ftaWrite },
        { name: pmmra, read: pmmraRead, write: pmmraWrite },
        { name: spa, read: spaRead, write: spaWrite },
        { name: projects, read: projectread, write: projectwrite },
        { name: safety, read: safetyRead, write: safetyWrite },
        { name: separateLibrary, read: sepLibRead, write: sepLibWrite },
        { name: connectLibarary, read: connectLibRead, write: connectLibWrite },
        { name: reports, read: reportRead, write: reportWrite },
      ],
      accessType: "Read",
      authorizedPersonnel: user.value,
      companyId: companyId,
      projectId: projectId,
      createdBy: user.value,
      modifiedBy: userId,
      projectPermissionId: permissionId,
      userId: userId,
    })
      .then((res) => {
        showModal();
        setResponseMessage(res?.data?.message);
        // setUpdateMessage(!updateMessage);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const history = useHistory();
  const userValidation = Yup.object().shape({
    user: Yup.object().required("User is Required"),
  });

  return (
    <div className=" mx-4" style={{ marginTop: "90px" }}>
      <Formik
        enableReinitialize={true}
        initialValues={{
          user: user,
        }}
        validationSchema={userValidation}
        onSubmit={(values, { resetForm }) => permissionUpdate(values, { resetForm })}
      >
        {(formik) => {
          const { values, handleChange, handleBlur, handleSubmit, setFieldValue } = formik;
          return (
            <Form onSubmit={handleSubmit}>
              <div className="mttr-sec">
                <p className=" mb-0 para-tag">Project Permission</p>
              </div>
              <Card className="mt-2 card-color">
                <div className="project-name">
                  <h5 className="text-center mt-4">
                    <b>{projectName}</b>
                  </h5>
                </div>
                <hr className="mx-2" />
                <div className="d-flex justify-content-center">
                  <Form.Group className="project-permission-select">
                    <Label notify={true}>Authorized Personnel </Label>
                    <Select
                      name="user"
                      styles={customStyles}
                      type="select"
                      placeholder="Select User "
                      value={values.user}
                      onBlur={handleBlur}
                      className="mt-1"
                      onChange={(e) => {
                        setUser({ value: e.value, label: e.label });
                        setFieldValue("user", e);
                        setPBSread("");
                        setpbswrite("");
                        setFRPread("");
                        setFRPwrite("");
                        setmttrRead("");
                        setmttrWrite("");
                        setfmecaRead("");
                        setfmecaWrite("");
                        setrbdRead("");
                        setrbdWrite("");
                        setftaRead("");
                        setftaWrite("");
                        setpmmraRead("");
                        setpmmraWrite("");
                        setspaRead("");
                        setspaWrite("");
                        setSafetyRead("");
                        setSafetyWrite("");
                        setSepLibRead("");
                        setSepLibWrite("");
                        setConnectLibRead("");
                        setConnectLibWrite("");
                        setReportRead("");
                        setReportWrite("");
                        setProjectread("");
                        setProjectwrite("");
                        getPermissionData(e.value);
                      }}
                      options={[
                        {
                          options: userData?.map((list) => ({
                            value: list?.id,
                            label: list?.name,
                          })),
                        },
                      ]}
                    />
                    <ErrorMessage name="user" component="span" className="error" />
                  </Form.Group>
                </div>

                <Table bordered className="mt-4">
                  <thead>
                    <tr>
                      <td>
                        <Label notify={true}>
                          <b>Modules</b>{" "}
                        </Label>{" "}
                      </td>
                      <td className="d-flex justify-content-center">
                        <b>Read/Write</b>
                      </td>
                    </tr>{" "}
                  </thead>
                  <tbody>
                    <tr>
                      <td>{projects}</td>
                      <td className="edit-project-list ">
                        <Form.Check
                          type="checkbox"
                          checked={projectread}
                          onClick={() => setProjectread(!projectread)}
                        />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={projectwrite}
                          onClick={() => {
                            projectread === true ? setProjectwrite(!projectwrite) : setProjectread(!projectread);
                            setProjectwrite(!projectwrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{pbs}</td>
                      <td className="edit-project-list ">
                        <Form.Check type="checkbox" checked={pbsread} onClick={() => setPBSread(!pbsread)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={pbswrite}
                          onClick={() => {
                            pbsread === true ? setpbswrite(!pbswrite) : setPBSread(!pbsread);
                            setpbswrite(!pbswrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{frp}</td>
                      <td className="edit-project-list">
                        <Form.Check type="checkbox" checked={FRPread} onClick={() => setFRPread(!FRPread)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={FRPwrite}
                          onClick={() => {
                            FRPread === true ? setFRPwrite(!FRPwrite) : setFRPread(!FRPread);
                            setFRPwrite(!FRPwrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{mttr}</td>
                      <td className="edit-project-list">
                        <Form.Check type="checkbox" checked={mttrRead} onClick={() => setmttrRead(!mttrRead)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={mttrWrite}
                          onClick={() => {
                            mttrRead === true ? setmttrWrite(!mttrWrite) : setmttrRead(!mttrRead);
                            setmttrWrite(!mttrWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{fmeca}</td>
                      <td className="edit-project-list">
                        <Form.Check type="checkbox" checked={fmecaRead} onClick={() => setfmecaRead(!fmecaRead)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={fmecaWrite}
                          onClick={() => {
                            fmecaRead === true ? setfmecaWrite(!fmecaWrite) : setfmecaRead(!fmecaRead);
                            setfmecaWrite(!fmecaWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{rbd}</td>
                      <td className="edit-project-list">
                        <Form.Check type="checkbox" checked={rbdRead} onClick={() => setrbdRead(!rbdRead)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={rbdWrite}
                          onClick={() => {
                            rbdRead === true ? setrbdWrite(!rbdWrite) : setrbdRead(!rbdRead);
                            setrbdWrite(!rbdWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{fta}</td>
                      <td className="edit-project-list">
                        <Form.Check type="checkbox" checked={ftaRead} onClick={() => setftaRead(!ftaRead)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={ftaWrite}
                          onClick={() => {
                            ftaRead === true ? setftaWrite(!ftaWrite) : setftaRead(!ftaRead);
                            setftaWrite(!ftaWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{pmmra}</td>
                      <td className="edit-project-list">
                        <Form.Check type="checkbox" checked={pmmraRead} onClick={() => setpmmraRead(!pmmraRead)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={pmmraWrite}
                          onClick={() => {
                            pmmraRead === true ? setpmmraWrite(!pmmraWrite) : setpmmraRead(!pmmraRead);
                            setpmmraWrite(!pmmraWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{spa}</td>
                      <td className="edit-project-list">
                        <Form.Check type="checkbox" checked={spaRead} onClick={() => setspaRead(!spaRead)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={spaWrite}
                          onClick={() => {
                            spaRead === true ? setspaWrite(!spaWrite) : setspaRead(!spaRead);
                            setspaWrite(!spaWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{safety}</td>
                      <td className="edit-project-list">
                        <Form.Check type="checkbox" checked={safetyRead} onClick={() => setSafetyRead(!safetyRead)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={safetyWrite}
                          onClick={() => {
                            safetyRead === true ? setSafetyWrite(!safetyWrite) : setSafetyRead(!safetyRead);
                            setSafetyWrite(!safetyWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{separateLibrary}</td>
                      <td className="edit-project-list">
                        <Form.Check type="checkbox" checked={sepLibRead} onClick={() => setSepLibRead(!sepLibRead)} />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={sepLibWrite}
                          onClick={() => {
                            sepLibRead === true ? setSepLibWrite(!sepLibWrite) : setSepLibRead(!sepLibRead);
                            setSepLibWrite(!sepLibWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{connectLibarary}</td>
                      <td className="edit-project-list">
                        <Form.Check
                          type="checkbox"
                          checked={connectLibRead}
                          onClick={() => setConnectLibRead(!connectLibRead)}
                        />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={connectLibWrite}
                          onClick={() => {
                            connectLibRead === true
                              ? setConnectLibWrite(!connectLibWrite)
                              : setConnectLibRead(!connectLibRead);
                            setConnectLibWrite(!connectLibWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                    <tr>
                      <td>{reports}</td>
                      <td className="edit-project-list">
                        <Form.Check
                          type="checkbox"
                          checked={reportRead}
                          onClick={() => setReportRead(!reportRead)}
                        />
                        <text className="ms-3 me-5">Read </text>
                        <Form.Check
                          type="checkbox"
                          checked={reportWrite}
                          onClick={() => {
                            reportRead === true
                              ? setReportWrite(!reportWrite)
                              : setReportRead(!reportRead);
                            setReportWrite(!reportWrite);
                          }}
                        />
                        <text className="mx-3">Write</text>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
              <div className="d-flex justify-content-end my-3  ">
                <Button
                  className="  delete-cancel-btn me-2 mb-5 "
                  variant="outline-secondary"
                  type="reset"
                  onClick={() => {
                    history.push("/project/list");
                  }}
                >
                  CANCEL
                </Button>
                <Button className=" save-btn mb-5" type="submit">
                  SAVE CHANGES
                </Button>
              </div>
              <div>
                <Modal show={show} centered>
                  <Modal.Body className="modal-body-user">
                    <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1d5460" />{" "}
                  </Modal.Body>
                  <Modal.Footer className=" d-flex justify-content-center" style={{ borderTop: 0, bottom: "30px" }}>
                    <div>
                      <h4 className="d-flex justify-content-center">{responseMessage}</h4>
                    </div>
                  </Modal.Footer>
                </Modal>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
