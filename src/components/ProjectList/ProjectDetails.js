import React, { useState } from "react";
import "../../css/ProjectList.scss";
import { Form, Row, Col, Card, Modal, Button } from "react-bootstrap";
import Label from "../core/Label";
import * as Yup from "yup";
import { Formik, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";
import Api from "../../Api";
import Select from "react-select";
import { currecyvalue } from "./currencyvalue";
import Success from "../core/Images/success.png";
import Environment from "../core/Environment";
import FrUnit from "../core/FRUnit";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { customStyles } from "../core/select";

export default function ProjectDetails(props) {
  const [frunitvalue, setFrunitvalue] = useState();
  const [currency, setCurrency] = useState();
  const [priceValidity, setPriceValidity] = useState();
  const [show, setShow] = useState(false);
  const [successMessage, setSuccessMessage] = useState();

  const projectListId = useState(props?.location?.state?.projctID);

  const projectName = props?.location?.state?.projectName;

  const companyId = props?.location?.state?.companyId;

  // const frunit = (values) => {
  //   setFrunitvalue(values);
  // };

  const history = useHistory();
  const userId = localStorage.getItem("userId");

  const NextPage = () => {
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

  const submitForm = (values) => {
    console.log("values", values);
    Api.patch(`api/v1/projectCreation/update/details/${projectListId[0]}`, {
      customerName: values.customerName,
      operationalPhase: values.opreationalPhase,
      productLifeYears: values.productlife,
      productLifekm: values.prolifekm,
      productLifeMiles: values.productlifemiles,
      productLifeOperationCycle: values.prolifecycle,
      daysOperationPerYear: values.daysopration,
      avgOperationalHrsPerDay: values.avgday,
      avgPowerHrsPerDay: values.avgpoweronhoursperday,
      avgCyclePerOperationalHrs: values.avgcycleperhour,
      avgCyclePerPowerOnHrs: values.avgcyclesperpoweronhour,
      avgAnnualOperationalHrs: values.avghour,
      avgAnnualPowerOnHrs: values.avgAnnualPoweronhour,
      avgAnnualMileageKm: values.avgannualmileagekm,
      avgAnnualMileageInMiles: values.avgannualmileagemiles,
      avgAnnualOperationCycles: values.avgannualoprationcycle,
      avgAnnualPowerOnCycles: values.avgannualpoweroncycles,
      avgSpeedKm: values.avgspeedkm,
      avgSpeedMiles: values.avgspeedmiles,
      frTarget: values.frtarget,
      frUnit: values?.frunit?.value,
      currency: currency,
      priceValidity: priceValidity,
      deliveryTerms: values.deliveryterms,
      deliveryLocation: values.deliverylocation,
      temperature: values.temp,
      environment: values.environment.value,
      nonShortProbability: values.nonShortProbability,
      mMaxValue: values.mMaxValue,
      userId: userId,
      // status: ,
      companyId: companyId,
    })
      .then((response) => {
        setSuccessMessage(response.data.message);
        NextPage();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const SignInSchema = Yup.object().shape({
    opreationalPhase: Yup.string().required("Operational phase is required").max(20, "Maximum lenth is 20")
    .test("no-whitespace", "Operational phase cannot contain only whitespace", (value) => {
      return value && value.trim().length > 0;}),
    customerName: Yup.string().required("Customer name is required")
    .test("no-whitwespace", "Customer name cannot contain only whitespace", (value) => {
      return value && value.trim().length > 0;}),
    avgday: Yup.number()
      .typeError("you must specify a number")
      .min(0, "Min value 0.")
      .max(24, "Max value 24.")
      .required("Average operational hours per day is required"),
    avghour: Yup.number().max(8784, "max value 8784").required("Average annual operational hours is required"),
    environment: Yup.object().required("Environment is required"),
productlife: Yup.number()
  .typeError("Product life must be a number")
  .required("Product life is required")
  .min(1, "Minimum value is 1")
  .max(99, "Maximum value is 99")
  .test("decimals", "Only up to 2 decimal places allowed", (value) => {
    if (value === undefined || value === null) return true;
    return /^\d+(\.\d{1,2})?$/.test(value.toString());
  }),
        daysopration: Yup.number()
      .typeError("You must specify a number")
      .min(1, "Minimum value is 1.")
      .max(366, "Maximum value is 366.")
      .required("Days of operation per year is required"),
    temp: Yup.string().required("Temperature is required"),
    // nonShortProbability: Yup.string().required("Non Short Probability(NSP) is required"),
    // mMaxValue: Yup.string().required("Phi for Mmax required"),
    avgpoweronhoursperday: Yup.number()
  .typeError("You must specify a number")
  .max(24, "Average Power on hours per day Max value is 24.")
  .test("max-decimals", "Only up to 2 decimal places allowed", (value) => {
    if (value === undefined || value === null) return true;
    return /^\d+(\.\d{1,2})?$/.test(value.toString());
  }),

prolifekm: Yup.number()
  .typeError("You must specify a number")
  .min(1, "Minimum 1 value is required")
  .max(999999999, "Maximum value is 999999999")
  .nullable()
  .test("max-decimals", "Only up to 4 decimal places allowed", (value) => {
    if (value === undefined || value === null) return true;
    return /^\d+(\.\d{1,4})?$/.test(value.toString());
  }),
    productlifemiles: Yup.string()
  .required("Product life miles is required")
  .matches(
    /^\d{1,20}(\.\d{1,4})?$/,
    "Only numbers allowed with max 20 digits and up to 4 decimal places"
  )
  .nullable(),
prolifecycle: Yup.number()
  .typeError("Pro life cycle must be a number")
  .test("max-digits", "Maximum 25 digits before decimal allowed", (value) => {
    if (value === undefined || value === null) return true;
    const [intPart] = value.toString().split(".");
    return intPart.length <= 25;
  })
  .test("max-decimals", "Only up to 4 decimal places allowed", (value) => {
    if (value === undefined || value === null) return true;
    return /^\d+(\.\d{1,4})?$/.test(value.toString());
  })
  .nullable(),
avgcycleperhour: Yup.number()
  .typeError("You must specify a number")
  .required("Average cycle per hour is required")
  .test(
    "max-3-decimals",
    "Only up to 3 decimal places are allowed",
    (value) => {
      if (value === undefined || value === null) return false; // required, so must fail if empty
      return /^\d+(\.\d{1,3})?$/.test(value.toString());
    }
  ),
  avgcyclesperpoweronhour: Yup.number()
  .typeError("You must specify a number")
  .required("Average cycles per power on hour is required")
  .test(
    "max-3-decimals",
    "Only up to 3 decimal places are allowed",
    (value) => {
      if (value === undefined || value === null) return false; // required
      return /^\d+(\.\d{1,3})?$/.test(value.toString());
    }
  ), 
  avgannualmileagekm: Yup.number()
  .typeError("You must specify a number")
  .required("Average annual mileage (km) is required")
  .test(
    "max-4-decimals",
    "Only up to 4 decimal places are allowed",
    (value) => {
      if (value === undefined || value === null) return false; // required
      return /^\d+(\.\d{1,4})?$/.test(value.toString());
    }
  ),
  avgannualmileagemiles: Yup.number()
  .typeError("You must specify a number")
  .required("Average annual mileage miles is required")
  .test(
    "max-4-decimals",
    "Only up to 4 decimal places are allowed",
    (value) => {
      if (value === undefined || value === null) return false; // required
      return /^\d+(\.\d{1,4})?$/.test(value.toString());
    }
  ),
      avgannualoprationcycle: Yup.number()
    .typeError("You must specify a number")
    .required("Average annual operation cycle is required")
    .test(
      "max-4-decimals",
      "Only up to 4 decimal places are allowed",
      (value) => {
        if (value === undefined || value === null) return false; // required
        return /^\d+(\.\d{1,4})?$/.test(value.toString());
      }
    ), 
          avgannualpoweroncycles: Yup.number()
    .typeError("You must specify a number")
    .required("Average annual power on cycle is required")
    .test(
      "max-4-decimals",
      "Only up to 4 decimal places are allowed",
      (value) => {
        if (value === undefined || value === null) return false; // required
        return /^\d+(\.\d{1,4})?$/.test(value.toString());
      }
    ), 
      avgspeedkm: Yup.number()
    .typeError("You must specify a number")
    .required("Average speed (km) is required")
    .test(
      "max-4-decimals",
      "Only up to 4 decimal places are allowed",
      (value) => {
        if (value === undefined || value === null) return false; // required
        return /^\d+(\.\d{1,4})?$/.test(value.toString());
      }
    ),
    avgspeedmiles: Yup.number()
    .typeError("You must specify a number")
    .required("Average speed (miles) is required")
    .test(
      "max-4-decimals",
      "Only up to 4 decimal places are allowed",
      (value) => {
        if (value === undefined || value === null) return false; // required
        return /^\d+(\.\d{1,4})?$/.test(value.toString());
      }
    ), 
    deliverylocation: Yup.string()
  .matches(/^[A-Za-z]+$/, "Only letters are allowed")
  .nullable()
  .optional(),

    



  });

  return (
    <Formik
      initialValues={{
        customerName: "",
        opreationalPhase: "",
        avgday: "",
        avghour: "",
        environment: "",
        productlife: "",
        daysopration: "",
        temp: "",
        prolifekm: "",
        productlifemiles: "",
        prolifecycle: "",
        avgcycleperhour: "",
        avgannualmileagekm: "",
        avgannualoprationcycle: "",
        avgspeedkm: "",
        frtarget: "",
        deliveryterms: "",
        avgAnnualPoweronhour: "",
        avgpoweronhoursperday: "",
        avgcyclesperpoweronhour: "",
        avgannualmileagemile: "",
        avgannualpoweroncycles: "",
        avgspeedmiles: "",
        deliverylocation: "",
        nonShortProbability: "",
        mMaxValue: "",
      }}
      validationSchema={SignInSchema}
      onSubmit={submitForm}
    >
      {(formik) => {
        const { values, handleChange, handleSubmit, handleBlur, setFieldValue, isValid } = formik;
        return (
          <div className="mx-4 " style={{ marginTop: "90px" }}>
            <div className="mttr-sec">
              <p className=" mb-0 para-tag">
                <b>Project Details</b>
              </p>
            </div>
            <Form onSubmit={handleSubmit}>
              <Card className="card-color mt-2">
                <div className="project-list-padding ">
                  <div className="project-name">
                    <h4 className="text-center ">
                      <b>{projectName}</b>{" "}
                    </h4>
                  </div>
                  <Row>
                    <Col>
                      <Form.Group>
                        <Label notify={true}>Customer Name</Label>
                        <Form.Control
                          type="text"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          name="customerName"
                          id="customerName"
                          value={values.customerName}
                          className="mt-1"
                        />
                        <ErrorMessage name="customerName" component="span" className="error" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Operational phase</Label>

                        <Form.Control
                          type="text"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          name="opreationalPhase"
                          id="opreationalPhase"
                          value={values.opreationalPhase}
                          className="mt-1"
                        />
                        <ErrorMessage name="opreationalPhase" component="span" className="error" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Product life in years</Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="any"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          name="productlife"
                          id="productlife"
                          value={values.productlife}
                          className="mt-1"
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
                          name="prolifekm"
                          type="number"
                          min="0"
                          step="any"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="mt-1"
                          value={values.prolifekm}
                        />
                        <ErrorMessage name="prolifekm" component="span" className="error" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Product life in miles</Label>
                        <Form.Control
                          name="productlifemiles"
                          type="number"
                          min="0"
                          step="any"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.productlifemiles}
                          className="mt-1"
                        />
                        <ErrorMessage name="productlifemiles" component="span" className="error" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label>Product life in operation cycles</Label>
                        <Form.Control
                          name="prolifecycle"
                          type="number"
                          min="0"
                          step="any"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.prolifecycle}
                          className="mt-1"
                        />
                        <ErrorMessage name="prolifecycle" component="span" className="error" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label>Average annual power on hours</Label>
                        <Form.Control
                          min="0"
                          max="8784"
                          type="number"
                          step="any"
                          name="avgAnnualPoweronhour"
                          id="avgAnnualPoweronhour"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="mt-1"
                          value={values.avgAnnualPoweronhour}
                        />
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
                          id="avgday"
                          value={values.avgday}
                          className="mt-1"
                        />
                        <ErrorMessage name="avgday" component="span" className="error" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label>Average power on hours per day</Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max="24"
                          step="any"
                          name="avgpoweronhoursperday"
                          id="avgpoweronhoursperday"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.avgpoweronhoursperday}
                          className="mt-1"
                        />
                         <ErrorMessage name="avgpoweronhoursperday" component="span" className="error" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Average cycles per operational hour</Label>
                        <Form.Control
                          name="avgcycleperhour"
                          id="avgcycleperhour"
                          type="number"
                          min="0"
                          step="any"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.avgcycleperhour}
                          className="mt-1"
                        />
                             <ErrorMessage name="avgcycleperhour" component="span" className="error" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Average cycles per power on hour</Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max="8784"
                          step="any"
                          name="avgcyclesperpoweronhour"
                          id="avgcyclesperpoweronhour"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.avgcyclesperpoweronhour}
                          className="mt-1"
                        />
                         <ErrorMessage name="avgcyclesperpoweronhour" component="span" className="error" />
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
                          id="avghour"
                          value={values.avghour}
                          className="mt-1"
                        />
                        <ErrorMessage name="avghour" component="span" className="error" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Days of operation per year</Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max="366"
                          step="any"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          name="daysopration"
                          id="daysopration"
                          value={values.daysopration}
                          className="mt-1"
                        />
                        <ErrorMessage name="daysopration" component="span" className="error" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Average annual mileage km</Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="any"
                          name="avgannualmileagekm"
                          id="avgannualmileagekm"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.avgannualmileagekm}
                          className="mt-1"
                        />
                          <ErrorMessage name="avgannualmileagekm" component="span" className="error" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Average annual mileage miles</Label>
                        <Form.Control
                          name="avgannualmileagemiles"
                          id="avgannualmileagemiles"
                          type="number"
                          min="0"
                          step="any"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.avgannualmileagemiles}
                          className="mt-1"
                        />
                         <ErrorMessage name="avgannualmileagemiles" component="span" className="error" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Average annual operation cycles</Label>
                        <Form.Control
                          name="avgannualoprationcycle"
                          id="avgannualoprationcycle"
                          type="number"
                          min="0"
                          step="any"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.avgannualoprationcycle}
                          className="mt-1"
                        />
                        <ErrorMessage name="avgannualoprationcycle" component="span" className="error" />

                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Average annual power on cycles</Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="any"
                          name="avgannualpoweroncycles"
                          id="avgannualpoweroncycles"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.avgannualpoweroncycles}
                          className="mt-1"
                        />
                         <ErrorMessage name="avgannualpoweroncycles" component="span" className="error" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Average speed km</Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="any"
                          name="avgspeedkm"
                          id="avgspeedkm"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.avgspeedkm}
                          className="mt-1"
                        />
                         <ErrorMessage name="avgspeedkm" component="span" className="error" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Average speed miles</Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="any"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.avgspeedmiles}
                          name="avgspeedmiles"
                          id="avgspeedmiles"
                          className="mt-1"
                        />
                        <ErrorMessage name="avgspeedmiles" component="span" className="error" />

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
                          name="frtarget"
                          id="frtarget"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.frtarget}
                          className="mt-1"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label>FR unit</Label>
                        <Select
                          id="frunit"
                          type="select"
                          styles={customStyles}
                          onChange={(event) => {
                            setFieldValue("frunit", event);
                          }}
                          onBlur={handleBlur}
                          name="frunit"
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
                          id="currency"
                          styles={customStyles}
                          name="currency"
                          options={currecyvalue}
                          onChange={(event) => {
                            setCurrency(event.value);
                          }}
                          onBlur={handleBlur}
                          className="mt-1"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label>Prices validity(date)</Label>
                        <Form.Control
                          type="date"
                          onChange={(e) => {
                            setPriceValidity(e.target.value);
                          }}
                          onBlur={handleBlur}
                          className="mt-1"
                          name="date"
                          id="date"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label>Delivery Terms</Label>
                        <Form.Control
                          name="deliveryterms"
                          id="deliveryterms"
                          type="text"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.deliveryterms}
                          className="mt-1"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label>Delivery Location</Label>
                        <Form.Control
                          type="text"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.deliverylocation}
                          className="mt-1"
                          name="deliverylocation"
                          id="deliverylocation"
                        />
                        <ErrorMessage name="deliverylocation" component="span" className="error" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mt-3">
                        <Label notify={true}>Environment</Label>
                        <Select
                          id="environment"
                          type="number"
                          min="0"
                          step="any"
                          styles={customStyles}
                          onChange={(event) => {
                            setFieldValue("environment", event);
                          }}
                          onBlur={handleBlur}
                          name="environment"
                          options={[
                            {
                              options: Environment.map((list) => ({
                                value: list.value,
                                label: list.label,
                              })),
                            },
                          ]}
                          className="mt-1"
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
                          className="mt-1"
                        />
                        <ErrorMessage name="temp" component="span" className="error" />
                      </Form.Group>
                    </Col>
                    <Row>
                      <Col>
                        <Form.Group className="mt-3">
                          <Label>Non Short Probability(NSP)</Label>
                          <Form.Control
                            type="number"
                            min="0"
                            step="any"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Non Short Probability(NSP)"
                            name="nonShortProbability"
                          />
                          <ErrorMessage name="nonShortProbability" component="span" className="error" />
                        </Form.Group>
                      </Col>
                      <Col>
                        {/* <Form.Group className="mt-3 ms-3 ">
                          <Label notify={true}>&#934; for Mmax</Label>
                          <Form.Control
                            type="number"
                            min="0"
                            step="any"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="phi for mMax"
                            name="mMaxValue"
                            className="w-100 "
                          />
                          <ErrorMessage
                            name="mMaxValue"
                            component="span"
                            className="error"
                          />
                        </Form.Group> */}
                        <Form.Group className="mt-3">
                          <Label>&#934; for Mmax</Label>
                          <Form.Control
                            type="number"
                            min="0"
                            step="any"
                            value={values.mMaxValue}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="phi for mMax"
                            name="mMaxValue"
                          />
                          <ErrorMessage name="mMaxValue" component="span" className="error" />
                        </Form.Group>
                      </Col>
                    </Row>
                    {/* <Form.Group className="my-4 d-flex justify-content-end ">
                      <Button
                        className="  delete-cancel-btn mx-1 "
                        variant="outline-secondary"
                        type="reset"
                        onClick={() => {
                          history.push("/project/list");
                        }}
                      >
                        CANCEL
                      </Button>
                      <Button
                        className=" save-btn mx-1 "
                        type="submit"
                        disabled={!isValid}
                      >
                        SAVE CHANGES
                      </Button>
                    </Form.Group> */}
                  </Row>
                </div>
              </Card>
              <Form.Group className="my-4 d-flex justify-content-end ">
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
                <Button className=" save-btn mb-5 " type="submit" disabled={!isValid}>
                  SAVE CHANGES
                </Button>
              </Form.Group>
            </Form>
            <div>
              <Modal show={show} centered>
                <div className="d-flex justify-content-center mt-5">
                  <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
                </div>
                <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
                  <div>
                    <h4 className="text-center">{successMessage}</h4>
                  </div>
                </Modal.Footer>
              </Modal>
            </div>
          </div>
        );
      }}
    </Formik>
  );
}
