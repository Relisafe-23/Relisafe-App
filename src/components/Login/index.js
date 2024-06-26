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
  const [passwordShown, setPasswordShown] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseExist, setResponseExist] = useState(false);
  const [existMessage, setExistMessage] = useState();

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
          // window.location.reload();
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus >= 400) {
          setResponseExist(true);
          setExistMessage(error?.response?.data?.message ? error?.response?.data?.message : "Invalid Credentials");
        }
      });
  };

  return (
    <div style={{ marginTop: "120px"}}>
      <Container>
        <Row>
          <Col></Col>
          <Col sm={8} md={6}>
            <div className="shadow">
              <div  className="d-flex justify-content-center login-heading-div">
                <p className="font-weight-bold mb-0 h3 text-white">Log In</p>
              </div>
              <Formik
                initialValues={{
                  email: "",
                  password: "",
                }}
                validationSchema={loginSchema}
                onSubmit={(values) => submitForm(values)}
              >
                {(formik) => {
                  const { handleChange, handleSubmit, handleBlur } = formik;
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
                      <button
  className="login-btn-css-new"
  type="submit"
>
                          <b>Log In</b>
                        </button>
                      </div>
                      {/* <div className="d-flex justify-content-center">
                        <p className="fs-6 mt-3 mb-4">
                          <Link className="userPass" to={{ pathname: "/Login" }}>
                            Forgot Password?
                          </Link>
                        </p>
                      </div> */}
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
