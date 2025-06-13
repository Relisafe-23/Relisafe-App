import React, { useState, useEffect } from "react";
import { ErrorMessage, Formik } from "formik";
import Label from "../LabelComponent";
import "../../css/Company.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FaExclamationCircle } from "react-icons/fa";
import Api from "../../Api";
import Select from "react-select";
import { faEllipsisV, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Button, Col, Form, Modal, Row, Table, InputGroup, Dropdown, Card, FormControl } from "react-bootstrap";
import * as Yup from "yup";
import { customStyles } from "../core/select";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPen } from "@fortawesome/free-solid-svg-icons";

import { useHistory } from "react-router-dom";

function Company() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [modalPopup, setModalPopup] = useState(false);
  const [successIcon, setSuccessIcon] = useState(false);
  const [deniedIcon, setDeniedIcon] = useState(false);
  const [newCompany, setNewCompany] = useState(false);
  const [selectCategory, setSelectCategory] = useState([]);
  const [selectCompanyName, setSelectCompanyName] = useState([]);
  const [companyId, setCompanyId] = useState([]);
  const history = useHistory();
  const userId = localStorage.getItem("userId");
    const [editMode, setEditMode] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [editCompanyName, setEditCompanyName] = useState("");

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };

  const toggleConfirmPasswordVisiblity = () => {
    setConfirmPasswordShown(confirmPasswordShown ? false : true);
  };

  const submitSchema = Yup.object().shape({
    // email: Yup.string().required("Email is required"),
    email: Yup.string().email("Email must be Valid").required("Email required"),
    password: Yup.string()
      .matches(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])",
        "Password Should contain Uppercase, Lowercase, Numbers and Special Characters"
      )
      .min(8)
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Password should be match")
      .matches(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])",
        "Confirm Password Should contain Uppercase, Lowercase, Numbers and Special Characters"
      )
      .required("Confirm password is required"),
    name: Yup.string()
      .required(" Name is required")
      .matches(/^[aA-zZ\s]+$/, "Enter valid name")
      .matches(/^[A-Z]/, "First Letter Must Be In Capital"),
    phoneNumber: Yup.number().nullable("Enter Valid Number"),
    role: Yup.object().typeError("Company Name is Required").nullable(""),
    companyName: Yup.object().typeError("Company Name is Required").required("Company Name is Required"),
  });

  const submitForm = (values, { resetForm }) => {
    console.log("values", values);
    const email = values.email.toLowerCase();
    Api.post("/api/v1/company", {
      companyName: values.companyName.label,
      name: values.name,
      role: values.role.label,
      email: values.email,
      phoneNumber: values.phoneNumber,
      password: values.password,
      confirmPassword: values.confirmPassword,
      companyId: companyId,
      userId: userId,
    })
      .then((res) => {
        const message = res?.data?.message;
        const status = res?.status;
        if (status === 201) {
          setShow(false);
          resetForm({ values: "" });
          setSuccessIcon(true);
          setSuccessMessage(message);
          setShowMessage();
          setSelectCategory("");
          getAllCompanyData();
        } else if (status === 208) {
          setShow(false);
          resetForm({ values: "" });
          setSuccessIcon(false);
          setDeniedIcon(true);
          setSuccessMessage(message);
          setShowMessage();
          setSelectCategory("");
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const setShowMessage = () => {
    setModalPopup(true);
    setTimeout(() => {
      setModalPopup(false);
    }, 2000);
  };

  //-: Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const getAllCompanyData = () => {
    Api.get("/api/v1/company", { headers: { userId: userId } })
      .then((res) => {
        const data = res?.data?.company;
        setData(data);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const handleSubmit = () => {
    Api.post("api/v1/company/name", {
      companyName: selectCompanyName,
      userId: userId,
    })
      .then((res) => {
        const data = res.data.createCompany;
        const companyId = res.data.createCompany.id;
        setCompanyId(companyId);
        setSelectCategory(data ? { value: data?.id, label: data?.companyName } : "");
        setSelectCompanyName("");
        getAllCompanyData();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
   
  
  
const deleteCompany = (id) => {
    Api.delete(`/api/v1/company/${id}`, {
      headers: {
        userId: userId,
      }
      
    })
      .then((res) => {
        const message = res?.data?.message;
        
        setSuccessIcon(true);
        setSuccessMessage("Company deleted successfully");
        setShowMessage();
        getAllCompanyData();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        } else {
          setDeniedIcon(true);
          setSuccessMessage("Failed to delete company");
          setShowMessage();
        }
      });
  };

 const handleEditCompany = (company) => {
  setCurrentCompany(company);
  setEditCompanyName(company.companyName);
  setEditMode(true);
}; 


const handleUpdateCompany = () => {
console.log("currentCom.....pany",currentCompany)

  Api.patch(`/api/v1/company/${currentCompany.id}`, {
    companyName: editCompanyName,
    userId: userId
  }, {
    headers: {
   userId: userId
    }
  })
  .then((res) => {
    console.log("Update response:", res);
    if (res.status === 200 || res.status === 201) {
      setSuccessIcon(true);
      setSuccessMessage(res.data?.message || "Company updated successfully");
      setShowMessage();
      setEditMode(false);
      setEditCompanyName("");
      setCurrentCompany(null);
      getAllCompanyData();
    }
  })
  .catch((error) => {
    console.error("Update error:", error);
    const errorStatus = error?.response?.status;
    if (errorStatus === 401) {
      logout();
    } else {
      setDeniedIcon(true);
      setSuccessMessage(error.response?.data?.message || "Failed to update company");
      setShowMessage();
    }
  });
};
  useEffect(() => {
    getAllCompanyData();
  }, []);

  return (
    <div className=" mx-4 company-main-div">
      <div className="mttr-sec ">
        <p className=" mb-0 para-tag">Company Informations</p>
      </div>
      <div className="d-flex justify-content-end mt-4">
        <Button
          className="pbs-add-btn FRP-button"
          variant="success"
          type="submit"
          // disabled={!isValid}
          onClick={() => setShow(true)}
        >
          CREATE COMPANY
        </Button>
      </div>
      <Modal show={show} size="lg" centered backdrop="static">
        <div className="m-3">
          <Modal.Body>
            <div className="mttr-sec mt-3">
              <p className=" mb-0 para-tag">Company Details</p>
            </div>
          </Modal.Body>

          <Formik
            enableReinitialize={true}
            initialValues={{
              companyName: selectCategory,
              name: "",
              role: { value: "admin", label: "admin" },
              email: "",
              password: "",
              confirmPassword: "",
              phoneNumber: "",
            }}
            validationSchema={submitSchema}
            onSubmit={(values, { resetForm }) => submitForm(values, { resetForm })}
          >
            {(formik) => {
              const { values, handleChange, handleBlur, isValid, handleSubmit, setFieldValue } = formik;
              return (
                <div>
                  <Form onSubmit={handleSubmit} className="mx-3">
                    <Card className="mt-1 mttr-card" style={{ backgroundColor: "color: rgb(242 241 242)" }}>
                      <Row className="ms-3 mb-4">
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label notify={true}> Company Name</Label>
                              <Select
                                value={selectCategory}
                                styles={customStyles}
                                placeholder="Select Company"
                                name="companyName"
                                onChange={(e) => {
                                  if (e.value === "create new") {
                                    setNewCompany(true);
                                  } else {
                                    setCompanyId(e.id.id);
                                    setFieldValue("companyName", e.value);
                                    setSelectCategory(e);
                                  }
                                }}
                                options={[
                                  {
                                    value: "create new",
                                    label: "Create New Company",
                                  },
                                  {
                                    options: data?.map((list) => ({
                                      value: list.companyName,
                                      label: list.companyName,
                                      id: list,
                                    })),
                                  },
                                ]}
                              />
                              <ErrorMessage className="error text-danger" component="span" name="companyName" />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label notify={true}>Username</Label>
                              <Form.Control                                type="text"
                                name="name"
                                autoComplete="off"
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="mt-1"
                                placeholder="Name"
                              />
                              <ErrorMessage className="error text-danger" component="span" name="name" />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Role</Label>
                              <Select
                                value={values.role}
                                styles={customStyles}
                                options={[
                                  {
                                    value: "admin",
                                    label: "admin",
                                  },
                                ]}
                              />
                              <ErrorMessage className="error text-danger" component="span" name="role" />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label notify={true}>Email</Label>
                              <Form.Control
                                type="email"
                                name="email"
                                autoComplete="off"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="mt-1"
                                placeholder="Email"
                              />
                              <ErrorMessage className="error text-danger" component="span" name="email" />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Phone Number</Label>
                              <Form.Control
                                type="tel"
                                name="phoneNumber"
                                autoComplete="off"
                                value={values.phoneNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={10}
                                className="mt-1"
                                placeholder="Phone Number"
                              />
                              <ErrorMessage className="error text-danger" component="span" name="phoneNumber" />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label notify={true}>Password</Label>
                              <InputGroup className="mt-1">
                                <Form.Control
                                  type={passwordShown ? "text" : "password"}
                                  name="password"
                                  autoComplete="off"
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    return false;
                                  }}
                                  onCopy={(e) => {
                                    e.preventDefault();
                                    return false;
                                  }}
                                  value={values.password}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  placeholder="Password"
                                />
                                <InputGroup.Text id="basic-addon1">
                                  <FontAwesomeIcon
                                    icon={passwordShown ? faEye : faEyeSlash}
                                    style={{ cursor: "pointer" }}
                                    onClick={togglePasswordVisiblity}
                                    size="1x"
                                  />
                                </InputGroup.Text>
                              </InputGroup>
                              <ErrorMessage className="error text-danger" component="span" name="password" />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label notify={true}>Confirm Password</Label>
                              <InputGroup className="mt-1">
                                <Form.Control
                                  type={confirmPasswordShown ? "text" : "password"}
                                  name="confirmPassword"
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    return false;
                                  }}
                                  onCopy={(e) => {
                                    e.preventDefault();
                                    return false;
                                  }}
                                  autoComplete="off"
                                  value={values.confirmPassword}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  placeholder="Confirm Password"
                                />
                                <InputGroup.Text>
                                  <FontAwesomeIcon
                                    icon={confirmPasswordShown ? faEye : faEyeSlash}
                                    style={{ cursor: "pointer" }}
                                    onClick={toggleConfirmPasswordVisiblity}
                                    size="1x"
                                  />
                                </InputGroup.Text>
                              </InputGroup>
                              <ErrorMessage className="error text-danger" component="span" name="confirmPassword" />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Row>
                    </Card>
                    <Row className="mt-3 mb-4">
                      <Col className="d-flex justify-content-end">
                        <Button
                          className="delete-cancel-btn  me-2 "
                          variant="outline-secondary"
                          type="reset"
                          onClick={() => setShow(false)}
                        >
                          CANCEL
                        </Button>
                        <Button className="save-btn mx-1" type="submit" disabled={!isValid}>
                          CREATE
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              );
            }}
          </Formik>
        </div>
      </Modal>
      <div className="" style={{ top: "80px" }}>
        <div style={{ bottom: "50px" }}>
          <Table hover bordered>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Company Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.length > 0 ? (
                data?.map((list, key) => (
                  <tr>
                    <td>{key + 1}</td>
                    
                    <td>{list?.companyName}</td>
                <td>
    <FontAwesomeIcon 
              icon={faTrash} 
              style={{color: "#e60f45", cursor: "pointer"}} 
              className="me-2"
              onClick={() => deleteCompany(list.id)} 
            />
<FontAwesomeIcon 
  icon={faPen} 
  style={{color: "#1D5460", cursor: "pointer"}}
  size="xl"
  onClick={() => handleEditCompany(list)}
/>
</td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan="8">Company yet to be created</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
      <Modal show={modalPopup} keyboard={false} backdrop="static" centered>
        <div className="d-flex justify-content-center mt-5">
          {successIcon === true ? (
            <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
          ) : deniedIcon === true ? (
            <FaExclamationCircle size={45} color="#de2222b0" />
          ) : null}
        </div>
        <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
          <div>
            <h4 className="d-flex justify-content-center">{successMessage}</h4>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal show={newCompany} backdrop="static" keyboard={false} centered>
        <Form className="p-4">
          <Modal.Body>
            <Form.Group>
              <Label notify={true}>Company Name</Label>
              <FormControl
                type="text"
                name="companyName"
                autoComplete="off"
                value={selectCompanyName}
                onChange={(e) => {
                  setSelectCompanyName(e.target.value);
                }}
                className="mt-1"
                placeholder="Company Name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>

            <Row style={{ borderTop: 0, width: "101%" }} className="me-0 pe-0">
              <Col className="d-flex justify-content-end me-0 pe-0 ">
                <Button
                  className="delete-cancel-btn  me-2"
                  variant="outline-secondary"
                  type="reset"
                  onClick={() => {
                    setNewCompany(false);
                  }}
                >
                  CANCEL
                </Button>
                <Button
                  className="save-btn "
                  type="submit"
                  onClick={(e) => {
                    handleSubmit();
                    setNewCompany(false);
                    e.preventDefault();
                  }}
                >
                  OK
                </Button>
              </Col>
            </Row>
          </Modal.Footer>
        </Form>
      </Modal>
      <Modal show={editMode} onHide={() => setEditMode(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit Company</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form.Group>
      <Label>Company Name</Label>
      <Form.Control
        type="text"
        value={editCompanyName}
        onChange={(e) => setEditCompanyName(e.target.value)}
        placeholder="Enter company name"
      />
    </Form.Group>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setEditMode(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleUpdateCompany}>
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>
    </div>
  );
}

export default Company;
