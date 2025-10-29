import React, { useState, useEffect } from "react";
import { Container, Col, Form, InputGroup, Button, Row, Modal } from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/Login.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Yup from "yup";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useHistory, Link } from "react-router-dom";
import { Formik, ErrorMessage } from "formik";
import Api from "../../Api.js";
import "../../css/User.scss";

function Login() {
  const [loading, setLoading] = useState(false);
  const [passwordShown, setPasswordShown] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseExist, setResponseExist] = useState(false);
  const [existMessage, setExistMessage] = useState();
  const [isLoginSubmit, setIsLoginSubmit] = useState(false);

  const history = useHistory();

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      const role = localStorage.getItem('role');
      history.push(role === 'SuperAdmin' ? '/company' : '/project/list');
    }
  }, [history]);

  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };

  const loginSchema = Yup.object().shape({
    email: Yup.string().email("Must be a valid email").required("Email Is Required"),
    password: Yup.string()
      .matches(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])",
        "Password Should Be Mix Of Letters, Numbers, Special Character (!@#$%^&*)."
      )
      .required("Password Is Required"),
  });

  const submitForm = (values) => {
    const email = values.email.toLowerCase();
    Api.post(`/api/v1/user/login`, {
      email: email,
      password: values.password,
    })
      .then((res) => {

        const status = res.status;
        if (status === 200) {
          setResponseSuccess(true);
          const userId = res?.data?.user?.id;
          const token = res?.data?.user?.sessionId;
          const companyId = res?.data?.user?.companyId;
          const role = res?.data?.user?.role;
          const userThemeColor = res?.data?.user?.userThemeColor ?? 189;
          localStorage.setItem("themeHue", userThemeColor.toString());
          localStorage.setItem("userId", userId);
          localStorage.setItem("sessionId", token);
          localStorage.setItem("companyId", companyId);
          localStorage.setItem("role", role);
          history.push(role == "SuperAdmin" ? "/company" : "/project/list");
          window.location.reload();
          setIsLoginSubmit(false);
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        window.location.reload();

        setIsLoginSubmit(false);
        if (errorStatus >= 400) {
          setResponseExist(true);
          setExistMessage(error?.response?.data?.message ? error?.response?.data?.message : "Invalid Credentials");

        }
      })
      .finally(() => {
        // Ensure spinner is shown for at least 2 seconds
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      });
  };

  return (
    <div style={{ marginTop: "120px" }}>
      <Container>
        <Row>
          <Col></Col>
          <Col sm={8} md={6}>
            <div className="shadow">
              <div className="d-flex justify-content-center login-heading-div">
                <p className="font-weight-bold mb-0 h3 text-white">Log In</p>
              </div>
              <Formik
                initialValues={{
                  email: "",
                  password: "",
                }}
                validateOnMount={true}
                validationSchema={loginSchema}
                onSubmit={(values) => {
                  setIsLoginSubmit(true);

                  submitForm(values)
                }
                }
              >
                {(formik) => {
                  const { handleChange, handleSubmit, handleBlur, isValid, isSubmitting } = formik;
                  return (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="login-fields-email">
                        <Label notify="true">Email</Label>
                        <Form.Control
                          type="email"
                          name="email"
                          autoComplete="none"
                          id="email"
                          placeholder="Enter Email"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <ErrorMessage className="error text-danger" component="span" name="email" />
                      </Form.Group>
                      <Form.Group className="login-fields-password">
                        <Label notify="true">Password</Label>
                        <InputGroup className="">
                          <Form.Control
                            type={passwordShown ? "text" : "password"}
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            placeholder="Enter Password"
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <InputGroup.Text>
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
                      <div className="d-flex justify-content-center ">
                        {/* <button
                          className="login-btn-css-new"
                          type="submit"
                        >
                          <b>Log In</b>
                        </button> */}
                        <button
                          className="login-btn-css-new"
                          type="submit"
                          style={{
                            cursor:
                              isValid && !isSubmitting && !isLoginSubmit ? "pointer" : "not-allowed",
                            backgroundColor: isLoginSubmit
                              ? "#b0b0b0"
                              : "#1D5460",
                            color: isLoginSubmit ? "#ffffff" : "#fff",
                            opacity: isLoginSubmit ? 0.7 : 1,
                          }}
                          disabled={!isValid || isSubmitting}
                        >
                          <b>{isLoginSubmit ? "Logging in..." : "Login"} </b>
                        </button>


                      </div>

                    </Form>
                  );
                }}
              </Formik>
            </div>
          </Col>
          <Col></Col>
        </Row>
      </Container>

      <Modal show={responseExist} centered className="user-delete-modal-user">
        <Modal.Body className="modal-body-user">
          <div>
            <h4>{existMessage} </h4>
          </div>
        </Modal.Body>
        <Modal.Footer className=" d-flex justify-content-center" style={{ borderTop: 0, bottom: "30px" }}>
          <Button className="login-btn-ok-btn" variant="success" onClick={() => setResponseExist(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Login;
