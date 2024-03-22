import React, { useEffect, useState } from "react";
import { Col, Form, Row, Container, Button, Modal, Card } from "react-bootstrap";
import Label from "../../LabelComponent";
import Select from "react-select";
import "../../../css/MttrPrediction.scss";
import { customStyles } from "../../core/select";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
export default function Optoelectronic() {
  const [showModal, setShowModal] = useState(false);
  const role = localStorage.getItem("role");
  const [writePermission, setWritePermission] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const userId = localStorage.getItem("userId");

  const milSchema = Yup.object().shape({
    style: Yup.object().required("style is required"),
    piofcharacters: Yup.string().required(" piofcharacters is required"),
    logicexist: Yup.string().required("logicexist is required"),
    dt: Yup.string().required("dt is required"),
    quality: Yup.object().required("quality is required"),
    piq: Yup.string().required("piq is required"),
  });

  const getMTB = () => {
    setShowModal(false);
  };

  return (
    <div className="nprdmodal">
      <Formik
        enableReinitialize={true}
        initialValues={{
          style: "",
          piofcharacters: "",
          logicexist: "",
          dt: "",
          quality: "",
          piq: "",
        }}
        validationSchema={milSchema}
        onSubmit={(values, { resetForm }) => getMTB(values, { resetForm })}
      >
        {(formik) => {
          const { values, handleChange, handleSubmit, handleBlur, isValid, mainProductForm, setFieldValue } = formik;
          return (
            <form onSubmit={handleSubmit} className="d-flex justify-content-center align-items-center">
              <div>
                <div>
                  <Row className="pl-3">
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>Style</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="style"
                            styles={customStyles}
                            isDisabled={
                              writePermission === true ||
                              writePermission === "undefined" ||
                              role === "admin" ||
                              (isOwner === true && createdBy === userId)
                                ? null
                                : "disabled"
                            }
                            placeholder="Select"
                            onBlur={handleBlur}
                            onChange={(e) => {
                              setFieldValue("style", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.style}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="style" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col xs={12} lg={6} md={6}>
                        <Label>DT</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="dt"
                            placeholder="dt"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.dt}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="dt" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label notify="true">Quality</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="quality"
                            styles={customStyles}
                            isDisabled={
                              writePermission === true ||
                              writePermission === "undefined" ||
                              role === "admin" ||
                              (isOwner === true && createdBy === userId)
                                ? null
                                : "disabled"
                            }
                            placeholder="Select"
                            onBlur={handleBlur}
                            onChange={(e) => {
                              setFieldValue("quality", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.quality}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="quality" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>PI q</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="piq"
                            placeholder="piq"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.piq}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="piq" />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label># Of Characters</Label>
                        <Form.Group>
                          <Form.Control
                            className="mt-1"
                            type="number"
                            min="0"
                            step="any"
                            name="piofcharacters"
                            placeholder="# Of Characters"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.piofcharacters}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="piofcharacters" />
                        </Form.Group>
                      </Col>
                      <Col className="mt-3" xs={12} lg={6} md={6}>
                        <Label>Logic Exist</Label>
                        <Form.Group>
                          <Select
                            className="mt-1"
                            type="select"
                            name="logicexist"
                            styles={customStyles}
                            isDisabled={
                              writePermission === true ||
                              writePermission === "undefined" ||
                              role === "admin" ||
                              (isOwner === true && createdBy === userId)
                                ? null
                                : "disabled"
                            }
                            placeholder="Select"
                            onBlur={handleBlur}
                            onChange={(e) => {
                              setFieldValue("logicexist", e);
                            }}
                            options={[
                              {
                                value: "to map",
                                label: "to map",
                              },
                            ]}
                            value={values.logicexist}
                          />
                          <ErrorMessage className="error text-danger" component="span" name="logicexist" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Row>
                </div>
                <div className="d-flex w-100 justify-content-center align-items-center ">
                  <Button className="buttoncal" xs={12} md={6} onClick={handleSubmit}>
                    Calculate
                  </Button>
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
