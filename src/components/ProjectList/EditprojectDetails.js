import React, { useEffect, useState } from "react";
import "../../css/ProjectList.scss";
import { Form, Row, Col, Card, Modal, Button,Tooltip,OverlayTrigger } from "react-bootstrap";
import Label from "../core/Label";
import * as Yup from "yup";
import { Formik, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";
import Api from "../../Api";
import Select from "react-select";
import { currecyvalue } from "./currencyvalue";
import Environment from "../core/Environment";
import FrUnit from "../core/FRUnit";
import Success from "../core/Images/success.png";
import { FaExclamationCircle } from "react-icons/fa";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader } from "semantic-ui-react";
import { customStyles } from "../core/select";

export default function EditprojectDetails(props) {
  const projectId = props?.location?.state?.projectID;
  const [customerName, setCustomerName] = useState();
  const [operation, setOperation] = useState();
  const [productlifekm, setProductLifeKm] = useState();
  const [pdtlifeoptncycle, setPdtLifeOptnCycle] = useState();
  const [avgopthrperday, setAvgOptHrPerDay] = useState();
  const [avgcyclesperoperationnhr, setAvgCyclesPerOprnHr] = useState();
  const [avgannualoperationhr, setAvgAnnualOperationHr] = useState();
  const [avgannualmilekm, setAvgAnnualMileKm] = useState();
  const [avgannualoperationcycle, setAvgAnnualOperationCycle] = useState();
  const [avgspeedkm, setAvgSpeedKm] = useState();
  const [frtarget, setFrTarget] = useState();
  const [currency, setCurrency] = useState();
  const [deliveryterm, setDeliveryTerm] = useState();
  const [environments, setEnvironments] = useState();
  const [pdtlifeinyears, setPdtLifeInYears] = useState();
  const [pdtlifeinmiles, setPdtLifeInMiles] = useState();
  const [daysofOprtnperyear, setDaysOfOprtnPerYear] = useState();
  const [avgpoweronhrday, setAvgPowerOnHrDay] = useState();
  const [avgcycleperpoweronhr, setAvgCyclePerPowerOnHr] = useState();
  const [avgannualpweronhr, setAvgAnnualPwerOnHr] = useState();
  const [avgannualmilegemile, setAvgAnnualMilegeMile] = useState();
  const [avgannualpwroncycle, setAvgAnnualPwrOnCycle] = useState();
  const [avgspeedmiles, setAvgSpeedMiles] = useState();
  const [frunit, setFrUnit] = useState();
  const [pricesvalidity, setPricesValidity] = useState();
  const [deliverylocation, setDeliveryLocation] = useState();
  const [temp, setTemp] = useState();
  const [show, setShow] = useState();
  const [companyName, setCompanyName] = useState();
  const [projectName, setProjectName] = useState();
  const [projectNumber, setProjectNumber] = useState();
  const [projectOwner, setprojectOwner] = useState();
  const [projectDescription, setprojectDescription] = useState();
  const [companyId, setCompanyId] = useState();
  const [userList, setUserList] = useState();
  const [ownerId, setOwnerId] = useState();
  const [status, setStatus] = useState();
  const [statusMessage, setStatusMessage] = useState();
  const history = useHistory();
  const [permission, setPermission] = useState();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [nonShortProbability, setNonShortProbability] = useState();
  const [mMaxValue, setmMaxValue] = useState();
  const [isLoading, setISLoading] = useState(true);

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
        setPermission(data?.modules[8]);
        setISLoading(false);
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
  useEffect(() => {
    getProjectPermission();
    projectSidebar();
  }, [projectId]);

  const getUsers = () => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    Api.get("/api/v1/user/list", {
      params: {
        companyId: companyId,
        userId: userId,
      },
    })
      .then((response) => {
        setUserList(response?.data?.usersList);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  useEffect(() => {
    getProjectDetails();
    getUsers();
  }, []);

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const showModal = (status) => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
      history.push("/project/list");
    }, 2000);
  };

  const getProjectDetails = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: { userId: userId },
    })
      .then((response) => {
        const data = response?.data?.data;
        setCompanyName(data?.companyId?.companyName);
        setCustomerName(data?.customerName);
        setProjectName(data?.projectName);
        setProjectNumber(data?.projectNumber);
        setprojectDescription(data?.projectDesc);
        // setFrUnit(
        //   data?.frUnit
        //     ? { value: data?.frUnit, label: data?.frUnit }
        //     : ""
        // );

        setprojectOwner(
          data?.projectOwner
            ? {
                label: data?.projectOwner?.name,
                value: data?.projectOwner?._id,
              }
            : ""
        );
        // setprojectOwner(data?.projectOwner?.name);
        setCompanyId(data?.projectOwner?.companyId);
        setOperation(data?.operationalPhase);
        setProductLifeKm(data?.productLifekm);
        setPdtLifeOptnCycle(data?.productLifeOperationCycle);
        setCurrency(data?.currency ? { value: data?.currency, label: data?.currency } : "");
        setAvgOptHrPerDay(data?.avgOperationalHrsPerDay);
        setAvgCyclesPerOprnHr(data?.avgCyclePerOperationalHrs);
        setAvgAnnualOperationHr(data?.avgAnnualOperationalHrs);
        setAvgAnnualMileKm(data?.avgAnnualMileageKm);
        setAvgAnnualOperationCycle(data?.avgAnnualOperationCycles);
        setAvgSpeedKm(data?.avgSpeedKm);
        setFrTarget(data?.frTarget);
        setDeliveryTerm(data?.deliveryTerms);
        setEnvironments(data?.environment ? { value: data?.environment, label: data?.environment } : "");
        setPdtLifeInYears(data?.productLifeYears);
        setPdtLifeInMiles(data?.productLifeMiles);
        setDaysOfOprtnPerYear(data?.daysOperationPerYear);
        setAvgPowerOnHrDay(data?.avgPowerHrsPerDay);
        setAvgCyclePerPowerOnHr(data?.avgCyclePerPowerOnHrs);
        setAvgAnnualPwerOnHr(data?.avgAnnualPowerOnHrs);
        setAvgAnnualMilegeMile(data?.avgAnnualMileageInMiles);
        setAvgAnnualPwrOnCycle(data?.avgAnnualPowerOnCycles);
        setAvgSpeedMiles(data?.avgSpeedMiles);
        setFrUnit(data?.frUnit ? { value: data?.frUnit, label: data?.frUnit } : "");
        setPricesValidity(data?.priceValidity);
        setDeliveryLocation(data?.deliveryLocation);
        setNonShortProbability(data?.nonShortProbability);
        setmMaxValue(data?.mMaxValue);
        setTemp(data?.temperature);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const SignInSchema = Yup.object().shape({
    name: Yup.string().required("Project name is required"),
    number: Yup.string().required("Project number is required"),
    description: Yup.string().required("Project description is required"),
    opreationalPhase: Yup.string().required("Operational phase is required"),
    avgday: Yup.number()
      .typeError("you must specify a number")
      .min(0, "Min value 0.")
      .max(24, "Max value 24.")
      .required("Average operational hours per day is required"),
    avghour: Yup.number().max(8784, "max value 8784").required("Average annual operational hours is required"),
    avgannualpweronhr: Yup.number().max(8784, "max value 8784"),

    avgpoweronhrday: Yup.number()
      .typeError("you must specify a number")
      .min(0, "Min value 0.")
      .max(24, "Max value 24."),
    environment: Yup.object().required("Environment is required"),
    // nonShortProbability: Yup.string().required("Non Short Probability(NSP) is required"),
    // mMaxValue: Yup.string().required("Phi for Mmax required"),
    productlife: Yup.string().required("Product life in years is required"),
    daysopration: Yup.number()
      .typeError("you must specify a number")
      .min(0, "Min value 0.")
      .max(366, "Max value 366.")
      .required("Days of operation per year is required"),
    temp: Yup.string().required("Temperature is required"),
    customerName: Yup.string().required("Customer name is required"),
  });
  const submitForm = (values) => {
    const projectOwner = values.owner.value;
    const frUnit = values.frunit.value;
    const environment = values.environment.value;
    const currency = values.currency.value;
    Api.patch(`/api/v1/projectCreation/update/details/${projectId}`, {
      customerName: values.customerName,
      projectName: values.name,
      projectDesc: values.description,
      projectNumber: values.number,
      projectOwner: projectOwner,
      operationalPhase: values.opreationalPhase,
      productLifeYears: values.productlife,
      productLifekm: values.productlifekm,
      productLifeMiles: values.pdtlifeinmiles,
      productLifeOperationCycle: values.pdtlifeoptncycle,
      daysOperationPerYear: values.daysopration,
      avgOperationalHrsPerDay: values.avgday,
      avgPowerHrsPerDay: values.avgpoweronhrday,
      avgCyclePerOperationalHrs: values.avgcyclesperoperationnh,
      avgCyclePerPowerOnHrs: values.avgcycleperpoweronhr,
      avgAnnualOperationalHrs: values.avghour,
      avgAnnualPowerOnHrs: values.avgannualpweronhr,
      avgAnnualMileageKm: values.avgannualmilekm,
      avgAnnualMileageInMiles: values.avgannualmilegemile,
      avgAnnualOperationCycles: values.avgannualoperationcycle,
      avgAnnualPowerOnCycles: values.avgannualpwroncycle,
      avgSpeedKm: values.avgspeedkm,
      avgSpeedMiles: values.avgspeedmiles,
      frTarget: values.frtarget,
      frUnit: frUnit,
      currency: currency,
      priceValidity: values.pricesvalidity,
      deliveryTerms: values.deliveryterm,
      deliveryLocation: values.deliverylocation,
      environment: environment,
      temperature: values.temp,
      nonShortProbability: values.nonShortProbability,
      mMaxValue: values.mMaxValue,
      userId: userId,
      companyId: companyId,
    })
      .then((response) => {
        const status = response?.status;
        const message = response?.data?.message;
        setStatusMessage(message);
        setStatus(status);
        showModal(status);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  return (
    <div style={{ marginTop: "90px" }}>
      {isLoading ? (
        <Loader />
      ) : permission?.read === true ||
        permission?.read === "undefined" ||
        role === "admin" ||
        (isOwner === true && createdBy === userId) ? (
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: projectName,
            customerName: customerName,
            number: projectNumber,
            description: projectDescription,
            owner: projectOwner,
            opreationalPhase: operation,
            avgday: avgopthrperday,
            avghour: avgannualoperationhr,
            environment: environments,
            productlife: pdtlifeinyears,
            daysopration: daysofOprtnperyear,
            temp: temp,
            productlifekm: productlifekm,
            pdtlifeinmiles: pdtlifeinmiles,
            pdtlifeoptncycle: pdtlifeoptncycle,
            avgpoweronhrday: avgpoweronhrday,
            avgcyclesperoperationnh: avgcyclesperoperationnhr,
            avgcycleperpoweronhr: avgcycleperpoweronhr,
            avgannualpweronhr: avgannualpweronhr,
            avgannualmilekm: avgannualmilekm,
            avgannualmilegemile: avgannualmilegemile,
            avgannualoperationcycle: avgannualoperationcycle,
            avgannualpwroncycle: avgannualpwroncycle,
            avgspeedkm: avgspeedkm,
            avgspeedmiles: avgspeedmiles,
            frtarget: frtarget,
            frunit: frunit,
            currency: currency,
            pricesvalidity: pricesvalidity,
            deliveryterm: deliveryterm,
            deliverylocation: deliverylocation,
            nonShortProbability: nonShortProbability,
            mMaxValue: mMaxValue,
          }}
          validationSchema={SignInSchema}
          onSubmit={(values) => submitForm(values)}
        >
          {(formik) => {
            const { handleSubmit, handleBlur, setFieldValue, handleChange, values } = formik;
            return (
              <div className="mx-4">
                <div className="mttr-sec">
                  <p className=" mb-0 para-tag">Project Details</p>
                </div>
                <Form onSubmit={handleSubmit}>
                  <fieldset
                    disabled={
                      permission?.write === true ||
                      permission?.write === "undefined" ||
                      role === "admin" ||
                      (isOwner === true && createdBy === userId)
                        ? null
                        : "disabled"
                    }
                  >
                    <Card className="card-color mt-2">
                      <div className="project-list-padding">
                        <div className="project-name">
                          <h4 className="text-center mb-2">
                            <b>{projectName}</b>
                          </h4>
                        </div>

                        <div>
                          <Row>
                            <Col>
                              <Form.Group>
                                <Label notify={true}>Customer Name</Label>
                                <Form.Control
                                  type="name"
                                  className="mt-1"
                                  name="customerName"
                                  value={values.customerName}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  id="customerName"
                                />
                                <ErrorMessage name="customerName" component="span" className="error" />
                              </Form.Group>
                            </Col>
                          </Row>
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
                                  id="name"
                                />
                                <ErrorMessage name="name" component="span" className="error" />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Project Description</Label>
                                <Form.Control
                                  type="description"
                                  name="description"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="mt-1"
                                  value={values.description}
                                  id="description"
                                  as="textarea"
                                  rows={2}
                                />
                                <ErrorMessage name="description" component="span" className="error" />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Project Number</Label>
                                <Form.Control
                                  name="number"
                                  id="number"
                                  className="mt-1 w-100"
                                  value={values.number}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                <ErrorMessage name="number" component="span" className="error" />
                              </Form.Group>
                            </Col>
                            {/* <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Project Owner</Label>
                                <Select
                                  type="select"
                                  name="owner"
                                  styles={customStyles}
                                  isDisabled={
                                    permission?.write === true || permission?.write === "undefined" || role === "admin"
                                      ? null
                                      : "disabled"
                                  }
                                  value={values.owner}
                                  placeholder="Select User"
                                  onBlur={handleBlur}
                                  onChange={(e) => {
                                    setFieldValue("owner", e);
                                    // setOwnerId(e.value);
                                    // setprojectOwner({ value: e.value, label: e.label });
                                  }}
                                  options={[
                                    {
                                      options: userList?.map((list) => ({
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
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label notify={true}>Operational phase</Label>
                                <Form.Control
                                  type="text"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  name="opreationalPhase"
                                  id="opreationalPhase"
                                  className="mt-1"
                                  value={values.opreationalPhase}
                                />
                                <ErrorMessage name="opreationalPhase" component="span" className="error" />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Product life in years</Label>
                                <Form.Control
                                  type="number"
                                  className="mt-1"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  name="productlife"
                                  id="productlife"
                                  value={values.productlife}
                                />
                                <ErrorMessage name="productlife" component="span" className="error" />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label>Product life in km</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  name="productlifekm"
                                  id="productlifekm"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.productlifekm}
                                  className="mt-1"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label>Product life in miles</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="mt-1"
                                  value={values.pdtlifeinmiles}
                                  name="pdtlifeinmiles"
                                  id="pdtlifeinmiles"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label>Product life in operation cycles</Label>
                                <Form.Control
                                  name="pdtlifeoptncycle"
                                  id="pdtlifeoptncycle"
                                  type="number"
                                  min="0"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="mt-1"
                                  value={values.pdtlifeoptncycle}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              {" "}
                              <Form.Group className="mt-3">
                                {" "}
                                <Label notify={true}>Days of operation per year</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  name="daysopration"
                                  id="daysopration"
                                  className="mt-1"
                                  value={values.daysopration}
                                />
                                <ErrorMessage name="daysopration" component="span" className="error" />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Average operational hours per day</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  name="avgday"
                                  className="mt-1"
                                  id="avgday"
                                  value={values.avgday}
                                />
                                <ErrorMessage name="avgday" component="span" className="error" />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label>Average Power on hours per day</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.avgpoweronhrday}
                                  className="mt-1"
                                  name="avgpoweronhrday"
                                  id="avgpoweronhrday"
                                />
                                <ErrorMessage name="avgpoweronhrday" component="span" className="error" />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label>Average cycles per operational hour</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.avgcyclesperoperationnh}
                                  className="mt-1"
                                  name="avgcyclesperoperationnh"
                                  id="avgcyclesperoperationnh"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label>Average cycles per power on hour</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  name="avgcycleperpoweronhr"
                                  id="avgcycleperpoweronhr"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.avgcycleperpoweronhr}
                                  className="mt-1"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Average annual operational hours</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  max="8784"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  name="avghour"
                                  className="mt-1"
                                  id="avghour"
                                  value={values.avghour}
                                />
                                <ErrorMessage name="avghour" component="span" className="error" />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label>Average annual power on hours</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  max="8784"
                                  step="any"
                                  name="avgannualpweronhr"
                                  id="avgannualpweronhr"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.avgannualpweronhr}
                                  className="mt-1"
                                />
                                <ErrorMessage name="avgannualpweronhr" component="span" className="error" />
                              </Form.Group>
                            </Col>
                          </Row>{" "}
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label>Average annual mileage km</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="mt-1"
                                  value={values.avgannualmilekm}
                                  name="avgannualmilekm"
                                  id="avgannualmilekm"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label>Average annual mileage miles</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  name="avgannualmilegemile"
                                  id="avgannualmilegemile"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.avgannualmilegemile}
                                  className="mt-1"
                                />
                              </Form.Group>
                            </Col>
                          </Row>{" "}
                          <Row>
                            <Col md={6}>
                              {" "}
                              <Form.Group className="mt-3">
                                <Label>Average annual operation cycles</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  className="mt-1"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.avgannualoperationcycle}
                                  name="avgannualoperationcycle"
                                  id="avgannualoperationcycle"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label>Average annual power on cycles</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  name="avgannualpwroncycle"
                                  id="avgannualpwroncycle"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.avgannualpwroncycle}
                                  className="mt-1"
                                />
                              </Form.Group>
                            </Col>
                          </Row>{" "}
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label>Average speed Km</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  name="avgspeedkm"
                                  className="mt-1"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.avgspeedkm}
                                  id="avgspeedkm"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label>Average speed miles</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  name="avgspeedmiles"
                                  id="avgspeedmiles"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.avgspeedmiles}
                                  className="mt-1"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label>FR target</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="mt-1"
                                  value={values.frtarget}
                                  name="frtarget"
                                  id="frtarget"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label>FR unit</Label>
                                <Select
                                  id="frunit"
                                  styles={customStyles}
                                  onChange={(event) => {
                                    // setFrUnit({ value: event.value, label: event.value });
                                    setFieldValue("frunit", event);
                                  }}
                                  onBlur={handleBlur}
                                  name="frunit"
                                  isDisabled={
                                    permission?.write === true || permission?.write === "undefined" || role === "admin"
                                      ? null
                                      : "disabled"
                                  }
                                  value={values.frunit}
                                  options={[
                                    {
                                      options: FrUnit.map((list) => ({
                                        value: list.value,
                                        label: list.label,
                                      })),
                                    },
                                  ]}
                                  className="mt-1"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label>Currency</Label>
                                <Select
                                  onChange={(e) => {
                                    // setCurrency({ value: e.value, label: e.value });
                                    setFieldValue("currency", e);
                                  }}
                                  name="currency"
                                  styles={customStyles}
                                  isDisabled={
                                    permission?.write === true || permission?.write === "undefined" || role === "admin"
                                      ? null
                                      : "disabled"
                                  }
                                  options={currecyvalue}
                                  value={values.currency}
                                  onBlur={handleBlur}
                                  className="mt-1"
                                  id="currency"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label>Prices validity</Label>
                                <Form.Control
                                  type="date"
                                  name="pricesvalidity"
                                  id="pricesvalidity"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.pricesvalidity}
                                  className="mt-1"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label>Delivery Terms</Label>
                                <Form.Control
                                  type="text"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.deliveryterm}
                                  className="mt-1"
                                  name="deliveryterm"
                                  id="deliveryterm"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                {" "}
                                <Label>Delivery Location</Label>
                                <Form.Control
                                  type="text"
                                  name="deliverylocation"
                                  id="deliverylocation"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.deliverylocation}
                                  className="mt-1"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Environment</Label>
                                <Select
                                  type="select"
                                  styles={customStyles}
                                  isDisabled={
                                    permission?.write === true || permission?.write === "undefined" || role === "admin"
                                      ? null
                                      : "disabled"
                                  }
                                  value={values.environment}
                                  name="environment"
                                  placeholder="Select Environment"
                                  onChange={(e) => {
                                    setFieldValue("environment", e);
                                    // setEnvironments({ value: e.value, label: e.value });
                                  }}
                                  onBlur={handleBlur}
                                  options={[
                                    {
                                      options: Environment.map((list) => ({
                                        value: list.value,
                                        label: list.label,
                                      })),
                                    },
                                  ]}
                                />
                                <ErrorMessage name="environment" component="span" className="error" />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Temperature</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  name="temp"
                                  id="temp"
                                  value={values.temp}
                                  placeholder="°C "
                                />
                                <ErrorMessage name="temp" component="span" className="error" />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                               <Form.Group className="mt-3">
                                <Label>Non Short Probability(NSP) </Label>
                                    <OverlayTrigger
                                    placement="bottom"
                                    // delay={{ show: 250, hide: 400 }}
                                    overlay={
                                  
<Tooltip id="nsp-tooltip" style={{ 
}}>
  NSP value must be 1 when calculating the Calculated Spare Quantity
</Tooltip>

                                 }
                           >
                                <Form.Control
                                  type="number"
                                  id="nonShortProbability"
                                  min="0"
                                  step="any"
                                  value={values.nonShortProbability}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  placeholder="Non Short Probability(NSP)"
                                  name="nonShortProbability"
                                />
                                {/* <ErrorMessage name="nonShortProbability" component="span" className="error" /> */}
                                </OverlayTrigger>
                              </Form.Group>
                            </Col>
                            <Col>
                              <Form.Group className="mt-3">
                                <Label>&#934; for Mmax</Label>
                                <Form.Control
                                  type="number"
                                  step="any"
                                  value={values.mMaxValue}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  placeholder="phi for mMax"
                                  name="mMaxValue"
                                />
                                {/* <ErrorMessage name="mMaxValue" component="span" className="error" /> */}
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </Card>
                    <Form.Group className="my-4 d-flex justify-content-end ">
                      <Row style={{ marginBottom: "50px" }}>
                        <Col></Col>
                        <Col className="add-project-button ">
                          <Button
                            className="  delete-cancel-btn me-2 "
                            variant="outline-secondary"
                            onClick={history.goBack}
                          >
                            CANCEL
                          </Button>
                          <Button className=" save-btn  " type="submit">
                            SAVE CHANGES
                          </Button>
                        </Col>
                      </Row>
                    </Form.Group>
                  </fieldset>
                </Form>

                <div>
                  <Modal show={show} centered>
                    <div className="d-flex justify-content-center mt-5">
                      {status === 201 ? (
                        <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
                      ) : (
                        <FaExclamationCircle size={45} color="#de2222b0" />
                      )}
                    </div>
                    <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
                      <div>
                        <h4 className="text-center">{statusMessage}</h4>
                      </div>
                    </Modal.Footer>
                  </Modal>
                </div>
              </div>
            );
          }}
        </Formik>
      ) : (
        <div className="mx-4" style={{ marginTop: "90px" }}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">Access Denied</Card.Title>
              <Card.Text>
                <p className="text-center">
                  You dont have permission to view this project
                  <br />
                  Contact admin to get permission or go back to project list page
                </p>
              </Card.Text>
              <Button variant="primary" className="save-btn fw-bold pbs-button-1" onClick={history.goBack}>
                Go Back
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}
