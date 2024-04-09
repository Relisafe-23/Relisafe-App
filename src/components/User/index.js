import React, { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row, Table, InputGroup, Dropdown, Card } from "react-bootstrap";
import Label from "../LabelComponent";
import { ErrorMessage, Formik } from "formik";
import Api from "../../Api";
import * as Yup from "yup";
import "../../css/User.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FaExclamationCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";

function User() {
  const [isSubmit, setIsSubmit] = useState(false);
  const [data, setData] = useState([]);
  const [role, setRole] = useState("");
  const [editUser, setEditUser] = useState(false);
  const [editEmail, setEditEmail] = useState();
  const [editPassword, setEditPassword] = useState();
  const [editConfirmPassword, setEditConfirmPassword] = useState();
  const [editName, setEditName] = useState();
  const [editPhone, setEditPhone] = useState();
  const [editRole, setEditRole] = useState();
  //const [userId, setUserId] = useState();
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [editPasswordShown, setEditPasswordShown] = useState(false);
  const [editConfirmPasswordShown, setEditConfirmPasswordShown] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState();
  const [responseUpdate, setResponseUpdate] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseExist, setResponseExist] = useState(false);
  const [responseDelete, setResponseDelete] = useState(false);
  const [show, setShow] = useState(false);
  const [deleteName, setDeletName] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteRole, setDeleteRole] = useState("");
  const [updateMessage, setUpdateMessage] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [alreadyExistMessage, setAlreadyExistMessage] = useState();
  const [activeUserRole, setActiveUserRole] = useState("");
  const [status, setStatus] = useState("");
  const [editUserId, setEditUserId] = useState();

  const history = useHistory();
  const userId = localStorage.getItem("userId");

  const getUserEditDetails = (id) => {
    const userId = id;
    Api.get(`/api/v1/user/`, { params: { userId: userId } })
      .then((res) => {
        const editData = res.data.usersList;
        setEditUserId(userId);
        setEditEmail(editData.email);
        setEditPassword(editData.password);
        setEditConfirmPassword(editData.confirmPassword);
        setEditName(editData.name);
        setEditPhone(editData.phone);
        setEditRole(editData.role);
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

  const confirmDeleteModal = (value) => {
    setDeleteMsg(true);
    setDeletName(value.name);
    setDeleteEmail(value.email);
    setDeleteRole(value.role);
  };

  const showModal = () => {
    setResponseUpdate(true);
    setTimeout(() => {
      setResponseUpdate(false);
    }, 2000);
  };

  const userCreateModal = () => {
    setResponseSuccess(true);
    setTimeout(() => {
      setResponseSuccess(false);
    }, 2000);
  };

  const alreadyExistModal = () => {
    setResponseExist(true);
    setTimeout(() => {
      setResponseExist(false);
    }, 2000);
  };

  const showDelete = () => {
    setResponseDelete(true);
    setTimeout(() => {
      setResponseDelete(false);
    }, 2000);
  };

  const updateForm = (values, { resetForm }) => {
    
    const email = values.editEmail.toLowerCase();
    Api.patch(`/api/v1/user/${editUserId}`, {
      email: email,
      password: values.editPassword,
      confirmPassword: values.editConfirmPassword,
      name: values.editName,
      phone: values.editPhone,
      role: values.editRole,
      companyId: userCompanyId,
      userId: userId,
    })
      .then((res) => {
        const status = res.status;
        setStatus(status);
        setUpdateMessage(res.data.message);
        showModal();
        setEditUser(false);
        resetForm({ values: "" });
        getUserList();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };

  const toggleConfirmPasswordVisiblity = () => {
    setConfirmPasswordShown(confirmPasswordShown ? false : true);
  };

  const editTogglePasswordVisiblity = () => {
    setEditPasswordShown(editPasswordShown ? false : true);
  };

  const editToggleConfirmPasswordVisiblity = () => {
    setEditConfirmPasswordShown(editConfirmPasswordShown ? false : true);
  };

  const deleteUserDetails = (userId) => {
    Api.delete(`api/v1/user/${userId}`, {
      headers: {
        userId: userId,
      },
    })
      .then((res) => {
        // setResponseDelete(true);
        showDelete();
        getUserList();
        setDeleteMsg(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  const getUserList = () => {
    const userId = localStorage.getItem("userId");
    const companyId = localStorage.getItem("companyId");
    setUserCompanyId(companyId); 
    Api.get(`api/v1/user/company/list`, {
      params: {
        companyId: companyId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.usersList;
        setData(data);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const submitForm = (values, { resetForm }) => {
    const email = values.email.toLowerCase();
    setIsSubmit(true);
    Api.post("/api/v1/user", {
      email: email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      name: values.name,
      phone: values.phone,
      role: values.role,
      companyId: userCompanyId,
      userId: userId,
    })
      .then((res) => {
        if (res.status === 201) {
          const responseMsg = res.data.message;
          setSuccessMessage(responseMsg);
          userCreateModal();
          setIsSubmit(false);
          setShow(false);
          resetForm({ values: "" });
          getUserList();
        } else {
          setShow(false);
          setAlreadyExistMessage(res.data.message);
          alreadyExistModal();
          resetForm({ values: "" });
          setIsSubmit(false);
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const submitSchema = Yup.object().shape({
    email: Yup.string().email("Must be a valid email").required("Email is required"),
    password: Yup.string()
      .matches(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])",
        "Password Should contain Uppercase, Lowercase, Numbers and Special Characters"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Password should be match")
      .matches(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])",
        "Confirm Password Should contain Uppercase, Lowercase, Numbers and Special Characters"
      ),
    name: Yup.string()
      .required("Name is required")
      // .matches("^(?=.*[a-z])(?=.*[A-Z])", "must contain alphabets and numbers")
      .matches(/^[A-Z]/, "First Letter Must Be In Capital"),
    role: Yup.string().required("User role is required"),
    phone: Yup.string()
      .matches(/^[0-9\s]+$/, "Enter Valid Phone Number")
      .min(10, "Enter valid number")
      .max(10, "Enter valid number")
      .required("Phone Number Is Required"),
  });

  const editSchema = Yup.object().shape({
    editEmail: Yup.string().email("Must be a valid email").required("Email is required"),
    editPassword: Yup.string()
      // .oneOf([Yup.ref("editPassword"), null], "Passwords must match")
      .matches(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])",
        "Password Should contain Uppercase, Lowercase, Numbers and Special Characters"
      )
      .required("Password is required"),
    editConfirmPassword: Yup.string()
      .oneOf([Yup.ref("editPassword"), null], "Passwords must match")
      .matches(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])",
        "Confirm Password Should contain Uppercase, Lowercase, Numbers and Special Characters"
      )
      .required("Confirm password is required"),
    editName: Yup.string()
      .required("Name is required")
      .matches(/^[A-Z]/, "First Letter Must Be in Capital"),
    editPhone: Yup.string()
      .oneOf([Yup.ref("password"), null], "Password should be match")
      .matches(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])",
        "Confirm Password Should contain Uppercase, Lowercase, Numbers and Special Characters"
      ),
    editRole: Yup.string().required("User role is required"),
  });

  useEffect(() => {
    const activeUserRole = localStorage.getItem("role");
    setActiveUserRole(activeUserRole);
    getUserList();
  }, []);

  return (
    <div className="mx-4" style={{ marginTop: "90px" }}>
      <div className="mttr-sec ">
        <p className=" mb-0 para-tag">User Informations</p>
      </div>
      <div className="d-flex justify-content-end mt-4 mb-2">
        {activeUserRole === "Employee" ? null : (
          <Button className="save-btn " type="submit" onClick={() => setShow(true)}>
            CREATE USER
          </Button>
        )}
      </div>
      <Modal show={show} size="lg" centered backdrop="static">
        <div className="m-3">
          <Modal.Body>
            <div className="mttr-sec mt-1">
              <p className=" mb-0 para-tag">Create User</p>
            </div>
          </Modal.Body>
          <Formik
            enableReinitialize={true}
            initialValues={{
              email: "",
              password: "",
              confirmPassword: "",
              name: "",
              phone: "",
              role: "Employee",
              companyName: "",
            }}
            validationSchema={submitSchema}
            onSubmit={(values, { resetForm }) => submitForm(values, { resetForm })}
          >
            {(formik) => {
              const { values, handleChange, handleSubmit, handleBlur, setFieldValue, isValid } = formik;
              return (
                <div>
                  <div>
                    <Form onSubmit={handleSubmit} className="mx-3">
                      <Card className=" card-color">
                        <Row className="ms-3 mb-4">
                          <Row className="mt-1">
                            <Col>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Name</Label>
                                <Form.Control
                                  type="string"
                                  name="name"
                                  autoComplete="none"
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
                                <Label notify={true}>Email</Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  autoComplete="none"
                                  value={values.email}
                                  onChange={handleChange}
                                  id="email"
                                  onBlur={handleBlur}
                                  className="mt-1"
                                  placeholder="Email"
                                />
                                <ErrorMessage className="error text-danger" component="span" name="email" />
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
                                    autoComplete="new-password"
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
                                    autoComplete="new-password"
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
                          <Row className="mb-1">
                            <Col>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Role</Label>
                                <Form.Control
                                  type="text"
                                  name="role"
                                  autoComplete="none"
                                  value={values.role}
                                  // onChange={handleChange}
                                  // onBlur={handleBlur}
                                  disabled
                                  className="mt-1"
                                  placeholder="Select Role"
                                />
                                <ErrorMessage className="error text-danger" component="span" name="role" />
                              </Form.Group>
                            </Col>
                            <Col>
                              <Form.Group className="mt-3">
                                <Label>Phone Number</Label>
                                <Form.Control
                                  type="tel"
                                  name="phone"
                                  autoComplete="none"
                                  maxlength={10}
                                  value={values.phone}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="mt-1"
                                  placeholder="Phone"
                                />
                                <ErrorMessage className="error text-danger" component="span" name="phone" />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Row>
                      </Card>
                      <div className="d-flex justify-content-end mt-3 mb-3">
                        <Button
                          className="delete-cancel-btn me-2"
                          variant="outline-secondary"
                          type="reset"
                          // onClick={() => {
                          //   formik.resetForm();
                          // }}
                          onClick={() => setShow(false)}
                        >
                          CANCEL
                        </Button>
                        <Button className="save-btn  " type="submit" disabled={!isValid || isSubmit}>
                          CREATE
                        </Button>
                      </div>
                    </Form>
                  </div>
                </div>
              );
            }}
          </Formik>
        </div>
      </Modal>

      <Formik
        enableReinitialize={true}
        initialValues={{
          editEmail: editEmail,
          editPassword: editPassword,
          editConfirmPassword: editConfirmPassword,
          editName: editName,
          editPhone: editPhone,
          editRole: editRole,
          // editCompanyName: editCompanyName,
        }}
        validationSchema={editSchema}
        onSubmit={(values, { resetForm }) => updateForm(values, { resetForm })}
      >
        {(formik) => {
          const { values, handleChange, handleSubmit, handleBlur, setFieldValue, isValid } = formik;

          return (
            <div>
              <div>
                <Modal show={editUser} centered size="lg" backdrop="static">
                  <Form onSubmit={handleSubmit} className="mx-1 mt-3 mb-1">
                    <div className="mx-4 mt-4">
                      <div className="company-sec mttr-sec">
                        <p className=" mb-0 para-tag">Edit User Informations</p>
                      </div>
                      <Card className="mt-3 card-color">
                        <Row className="ms-3 mt-3">
                          <Row>
                            <Col>
                              <Label notify={true}>Name</Label>
                              <Form.Group>
                                <Form.Control
                                  type="string"
                                  name="editName"
                                  autoComplete="off"
                                  value={values.editName}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="form-group p-2"
                                  placeholder="Name"
                                />
                                <ErrorMessage className="error text-danger" component="span" name="editName" />
                              </Form.Group>
                            </Col>
                            <Col>
                              <Label notify={true}>Email</Label>
                              <Form.Group>
                                <Form.Control
                                  type="email"
                                  name="editEmail"
                                  autoComplete="off"
                                  value={values.editEmail}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="form-group p-2"
                                  placeholder="Email"
                                />
                                <ErrorMessage className="error text-danger" component="span" name="editEmail" />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="mt-3">
                            <Col>
                              <Label notify={true}>Password</Label>
                              <Form.Group>
                                <InputGroup>
                                  <Form.Control
                                    type={editPasswordShown ? "text" : "password"}
                                    name="editPassword"
                                    onPaste={(e) => {
                                      e.preventDefault();
                                      return false;
                                    }}
                                    onCopy={(e) => {
                                      e.preventDefault();
                                      return false;
                                    }}
                                    autoComplete="off"
                                    value={values.editPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="form-group p-2"
                                    placeholder="Password"
                                  />
                                  <InputGroup.Text>
                                    <FontAwesomeIcon
                                      icon={editPasswordShown ? faEye : faEyeSlash}
                                      style={{ cursor: "pointer" }}
                                      onClick={editTogglePasswordVisiblity}
                                      size="1x"
                                    />
                                  </InputGroup.Text>
                                </InputGroup>
                                <ErrorMessage className="error text-danger" component="span" name="editPassword" />
                              </Form.Group>
                            </Col>
                            <Col>
                              <Label notify={true}>Confirm Password</Label>
                              <Form.Group>
                                <InputGroup>
                                  <Form.Control
                                    type={editConfirmPasswordShown ? "text" : "password"}
                                    name="editConfirmPassword"
                                    onPaste={(e) => {
                                      e.preventDefault();
                                      return false;
                                    }}
                                    onCopy={(e) => {
                                      e.preventDefault();
                                      return false;
                                    }}
                                    autoComplete="off"
                                    value={values.editConfirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="form-group p-2"
                                    placeholder="Confirm Password"
                                  />
                                  <InputGroup.Text>
                                    <FontAwesomeIcon
                                      icon={editConfirmPasswordShown ? faEye : faEyeSlash}
                                      style={{ cursor: "pointer" }}
                                      onClick={editToggleConfirmPasswordVisiblity}
                                      size="1x"
                                    />
                                  </InputGroup.Text>
                                </InputGroup>
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="editConfirmPassword"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="mt-3 mb-4">
                            <Col>
                              <Label notify={true}>Role</Label>
                              <Form.Group>
                                <Form.Control
                                  type="text"
                                  name="editRole"
                                  autoComplete="off"
                                  value={values.editRole}
                                  // onChange={handleChange}
                                  // onBlur={handleBlur}
                                  className="mt-1"
                                  placeholder="Select Role"
                                  disabled
                                />
                              </Form.Group>

                              <ErrorMessage className="error text-danger" component="span" name="editRole" />
                            </Col>
                            <Col>
                              <Label>Phone Number</Label>
                              <Form.Group>
                                <Form.Control
                                  type="tel"
                                  name="editPhone"
                                  maxlength="10"
                                  autoComplete="off"
                                  value={values.editPhone}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  placeholder="Phone"
                                />
                                <ErrorMessage className="error text-danger" component="span" name="editPhone" />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Row>
                      </Card>
                      <Row className="mt-3 mb-4">
                        <Col className="d-flex justify-content-end">
                          {/* <Modal.Footer style={{ borderTop: 0 }} className="mb-2 me-0 pe-0"> */}
                          <Button
                            className="delete-cancel-btn  me-2 "
                            variant="outline-secondary"
                            onClick={() => {
                              setEditUser(false);
                              setEditEmail();
                              setEditName();
                              setEditPassword();
                              setEditConfirmPassword();
                              setEditPhone();
                              setEditRole();
                            }}
                          >
                            CANCEL
                          </Button>
                          <Button className=" save-btn" type="submit">
                            SAVE CHANGES
                          </Button>
                        </Col>
                      </Row>
                      {/* </Modal.Footer> */}
                    </div>
                  </Form>
                </Modal>
              </div>
              <div>
                {/* <Modal show={deleteMsg} size="lg" className="user-delete-modal">
                  <Modal.Body className="modal-body-user"> */}
                <Modal show={deleteMsg} centered className="project-delete-modal-use" backdrop="static">
                  <Modal.Body>
                    <div style={{ marginTop: "25px" }}>
                      <h5 className="d-flex justify-content-center">Are you sure you want to delete this user?</h5>
                    </div>
                    <div className="d-flex mt-4 ms-5">
                      <b className="text-center"> Name:</b>
                      <p className="ms-2">{deleteName}</p>
                    </div>
                    <div className="d-flex mt-3 ms-5">
                      <b>Email:</b>
                      <p className="ms-2 ">{deleteEmail}</p>
                    </div>
                    <div className="d-flex mt-3 ms-5">
                      <b>Role:</b>
                      <p className="mx-3">{deleteRole}</p>
                    </div>
                  </Modal.Body>
                  <Modal.Footer className=" d-flex justify-content-center" style={{ borderTop: 0, bottom: "20px" }}>
                    <Button
                      className="  delete-cancel-btn  "
                      variant="outline-secondary"
                      onClick={() => setDeleteMsg(false)}
                    >
                      NO
                    </Button>
                    <Button className="save-btn ms-1" onClick={() => deleteUserDetails(userId)}>
                      YES
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
          );
        }}
      </Formik>

      <div>
        <div>
          <Table hover bordered>
            <thead>
              <tr>
                <th>S.No</th>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Phone Number</th>
                {activeUserRole === "Employee" ? null : <th class="text-center">Action</th>}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((list, key) => (
                  <tr>
                    <td>{key + 1}</td>
                    <td>{list.name}</td>
                    <td>{list.email}</td>
                    <td>{list.role}</td>
                    <td>{list.phone}</td>
                    {activeUserRole === "Employee" ? null : (
                      <td>
                        <center>
                          <Dropdown>
                            <Dropdown.Toggle className="user-dropdown">
                              <FontAwesomeIcon icon={faEllipsisV} className="fa-lg" color="black" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="py-2">
                              <Dropdown.Item
                                to={"#"}
                                onClick={() => {
                                  getUserEditDetails(list.id);
                                  //setUserId(list.id);
                                  setEditUser(true);
                                }}
                                className="user-dropitem-project text-center"
                              >
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                to={"#"}
                                onClick={() => {
                                  //setUserId(list.id);
                                  confirmDeleteModal(list);
                                }}
                                className="user-dropitem-project text-center"
                              >
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </center>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan="8">Users yet to be created</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <Modal show={responseUpdate} centered>
          <div className="d-flex justify-content-center mt-5">
            {status === 201 ? (
              <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
            ) : (
              <FaExclamationCircle size={45} color="#de2222b0" />
            )}
          </div>
          <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
            <div>
              <h4 className="text-center">{updateMessage}</h4>
            </div>
          </Modal.Footer>
        </Modal>

        <Modal show={responseSuccess} centered>
          <div className="d-flex justify-content-center mt-5">
            <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
          </div>
          <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
            <div>
              <h4 className="d-flex justify-content-center">{successMessage}</h4>
            </div>
          </Modal.Footer>
        </Modal>

        <Modal show={responseDelete} centered>
          <div className="d-flex justify-content-center mt-5">
            <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
          </div>
          <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
            <div>
              <h4 className="text-center">User Deleted Successfully</h4>
            </div>
          </Modal.Footer>
        </Modal>

        <Modal show={responseExist} centered>
          <div className="d-flex justify-content-center mt-5">
            <FaExclamationCircle size={45} color="#de2222b0" />
          </div>
          <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
            <div>
              <h4 className="text-center">{alreadyExistMessage}</h4>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default User;
