import React, { useEffect, useState } from "react";
import {
  Col,
  Form,
  Row,
  Container,
  Button,
  Modal,
  Card,
} from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/MttrPrediction.scss";
import Select from "react-select";
import Environment from "../core/Environment";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import Api from "../../Api";
import Tree from "../Tree";
import Dropdown from "../Company/Dropdown";
import ResistorCalculation from "../Mil.jsx/ResistorCalculation.jsx";
import Loader from "../core/Loader";
import { Electronic, Mechanical } from "../core/partTypeCategory";
import Spinner from "react-bootstrap/esm/Spinner";
import Projectname from "../Company/projectname";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Checkbox from "@material-ui/core/Checkbox";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

import Switches from "../Mil.jsx/Switches";
import { customStyles } from "../core/select";
import { Link, useHistory } from "react-router-dom";
import FrUnit from "../core/FRUnit";
import { nprdPartTypes } from "./NprdPartTypes";
import { nprdFRP } from "./NprdFRP";
import { nprdPartDes } from "./NprdPartDes";
import MaterialTable from "material-table";
import { ThemeProvider } from "@material-ui/styles";
import { createTheme } from "@material-ui/core/styles";
import { tableIcons } from "../PBS/TableIcons";
import { toast } from "react-toastify";
import Resistor from "./PartTypes/Resistor";
import IcMemory from "./PartTypes/IC-memory-analog";
import Potentiometer from "./PartTypes/Potentiometer";
import Capacitor from "./PartTypes/Capacitor";
import Switch from "./PartTypes/Switch";
import Connector from "./PartTypes/Connector";
import LFDiode from "./PartTypes/LFDiode";
import LFTransistor from "./PartTypes/LFTransistor";
import HFTransistor from "./PartTypes/HFTransistor";
import Optoelectronic from "./PartTypes/Optoelectronic";
import Inductive from "./PartTypes/Inductive";
import Connection from "./PartTypes/Connection";
import PWB from "./PartTypes/PWB";
import Rotating from "./PartTypes/Rotating";
import Crystal from "./PartTypes/Crystal";
import Breaker from "./PartTypes/Breaker";
import Meter from "./PartTypes/Meter";
import Lamp from "./PartTypes/Lamp";
import Miscellaneous from "./PartTypes/Miscellaneous";
import Tube from "./PartTypes/Tube";
import CapacitorCalculation from "../Mil.jsx/CapacitorCalculation.jsx";
import InductiveCalculation from "../Mil.jsx/InductiveCalculation.jsx";
import ConnectionCalculation from "../Mil.jsx/ConnectionCalculation.jsx";
import MicrocircuitsCalculation from "../Mil.jsx/Microcircuit/MicrocircuitsCalculation";
import Lamps from "../Mil.jsx/Lamps.jsx";
import Quartz from "../Mil.jsx/Quartz.jsx";
import ElectronicFilters from "../Mil.jsx/ElectronicFilters.jsx";
import Fuses from "../Mil.jsx/Fuses.jsx";
import Laser from "../Mil.jsx/Laser.jsx";
import Meters from "../Mil.jsx/Meters.jsx";
import Connectors from "../Mil.jsx/Connectors.jsx";
import Tubes from "../Mil.jsx/Tubes.jsx";
import Interconnection from "../Mil.jsx/Interconnection.jsx";
import Diode from "../Mil.jsx/Diode.jsx";
import MiscellaneousPartsCalculator from "../Mil.jsx/MiscellaneousPartsCalculator.jsx";
import RotatingDevice from "../Mil.jsx/RotatingDevice.jsx";
import Relay from "../Mil.jsx/Relay.jsx";

function Index(props) {
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;
  const [currentComponent, setCurrentComponent] = useState({
    type: "Capacitor",
  });
  const [category, setCategory] = useState("");
  const [environment, setEnvironment] = useState("");
  const [show, setShow] = useState(false);
  const [treeTableData, setTreeTabledata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(true);
  const [reference, setReference] = useState();
  const [name, setName] = useState();
  const [partNumber, setPartNumber] = useState();
  const [temperature, setTemperature] = useState();
  const [quantity, setQuantity] = useState();
  const [partType, setPartType] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [initialProductID, setInitialProductID] = useState();
  const [initialTreeStructure, setInitialTreeStructure] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showMil, setShowMil] = useState(false);
  const [nprdModel, setNprdModel] = useState(false);
  const [nprd2016Model, setNprd2016Model] = useState(false);
  const [nprdSubModal, setNprdSubModal] = useState(false);
  const [partTypeNprd, setPartTypeNprd] = useState();
  const [partTypeDescr, setPartTypeDescr] = useState();
  const [partTypeQuality, setPartTypeQuality] = useState();
  const [partType2016Nprd, setPartType2016Nprd] = useState();
  const [partType2016Descr, setPartType2016Descr] = useState();
  const [partType2016Quality, setPartType2016Quality] = useState();
  const [selectedNprdFR, setSelectedNprdFR] = useState([]);
  const [rowClicked, setRowClicked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [partTypeNprd2016Data, setPartTypeNprd2016Data] = useState([]);
  const [partTypeNprdDesc2016Data, setPartTypeNprdDesc2016Data] = useState([]);
  const [frpValueNprd2016Data, setFrpValueNprd2016Data] = useState([]);
  const [permission, setPermission] = useState();
  const [predicted, setPredicted] = useState();
  const [frUnit, setFrUnit] = useState(null);
  const [standard, setStandard] = useState(null)
  const [componentData, setComponentData] = useState({
    resistor: null,
  });

  const token = localStorage.getItem("sessionId");
  const handleChange = (rowData) => {
    if (selectedCheckboxes.includes(rowData)) {
      setSelectedCheckboxes(
        selectedCheckboxes.filter((item) => item !== rowData)
      );
    } else {
      setSelectedCheckboxes([...selectedCheckboxes, rowData]);
    }
  };
  const nprdPartType = nprdPartTypes;
  const [nprdFR, setNprdFR] = useState(
    partTypeNprd?.value &&
      partTypeDescr?.value &&
      partTypeQuality?.label &&
      environment?.label
      ? nprdFRP.find((item) => {
        return (
          item?.PartTypeId === partTypeNprd?.value &&
          item?.Quality === partTypeQuality?.label &&
          item?.Environment === environment?.label &&
          item?.PartDescrId === partTypeDescr?.value
        );
      })?.FR
      : ""
  );

  const [FR, setFR] = useState();

  // useEffect(() => {
  //   if (partTypeNprd?.value && partTypeDescr?.value && environment?.label) {
  //     const filteredData = nprdFRP.filter((item) => {
  //       return (
  //         item?.PartTypeId === partTypeNprd?.value &&
  //         item?.PartDescrId === partTypeDescr?.value &&
  //         item?.Environment === environment?.label
  //       );
  //     });

  //     if (filteredData) {
  //       setData(filteredData);
  //     } else {
  //       setData([]);
  //     }
  //   }
  // }, [partTypeNprd?.value, partTypeDescr?.value]);

  // Inside your component:
  useEffect(() => {
    // 1. Handle NPRD data filtering (existing logic)
    if (partTypeNprd?.value && partTypeDescr?.value && environment?.label) {
      const filteredData = nprdFRP.filter(
        (item) =>
          item?.PartTypeId === partTypeNprd?.value &&
          item?.PartDescrId === partTypeDescr?.value &&
          item?.Environment === environment?.label
      );
      setData(filteredData || []);
    }

    // 2. Auto-select "Failure Per Power On Hour" if standard is MIL
    // if (
    //   standard?.value === "MIL" &&
    //   frUnit?.value !== "Failure Per Power On Hour"
    // ) {
    //   setFrUnit({
    //     value: "Failure Per Power On Hour",
    //     label: "Failure Per Power On Hour",
    //   });
    // }
  }, [
    partTypeNprd?.value,
    partTypeDescr?.value,
    environment?.label,
    standard, // Changed from values.standard to standard
    frUnit, // Changed from values.frUnit to frUnit
  ]);

  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : initialProductID;

  const treeStructure = props?.location?.state?.parentId
    ? props?.location?.state?.parentId
    : initialTreeStructure;
  const [field, setField] = useState();

  const [dutyCycle, setDutyCycle] = useState('');
  const [frDistribution, setFrDistribution] = useState();
  const [allocated, setAllocated] = useState('');
  const [otherFr, setOtherFr] = useState('');
  const [frRemarks, setFrRemarks] = useState('');

  const [frOffset, setFrOffSet] = useState();
  const [operand, setOperand] = useState();
  const [frOffsetOperand, setOffSetOperand] = useState();

  const [frpId, setFrpId] = useState();
  const [source, setSource] = useState({
    value: "Predicted",
    label: "Predicted",
  });
  const role = localStorage.getItem("role");
  const [writePermission, setWritePermission] = useState();
  const history = useHistory();

  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const columns = [
    {
      title: "S.No",
      field: "s.no",
      render: (rowData) => data?.indexOf(rowData) + 1,
    },
    {
      title: "Environment",
      field: "Environment",
      cellStyle: { minWidth: "300px" },
    },
    { title: "Quality", field: "Quality" },
    {
      title: "FR",
      field: "FR",
      cellStyle: { minWidth: "144px" },
    },
    {
      title: "Checkbox",
      render: (rowData) => (
        <Checkbox
          checked={selectedCheckboxes.includes(rowData)}
          onChange={() => handleChange(rowData)}
        />
      ),
    },
  ];

  const tableTheme = createTheme({
    overrides: {
      MuiTableRow: {
        root: {
          "&:hover": {
            cursor: "pointer",
            backgroundColor: "rgba(224, 224, 224, 1) !important",
            color: "rgba(0, 0, 0, 1) !important",
          },
        },
      },
    },
  });

  const [data, setData] = useState([]);

  const rowStyle = (rowData) => {
    const lastProductId = localStorage.getItem("lastCreatedProductId");
    if (rowData.id === lastProductId) {
      return {
        backgroundColor: "#1d5460",
        color: "white",
      };
    }
    return {};
  };

  let baseMultiplier = 4.5e-9;
  let temperatureMultiplier = 12;
  let stressDivider = 0.5;
  let temperatureBase = 273;
  let T = 25;
  let S = 0.00031;
  T = T + 273;
  let lambdaB =
    baseMultiplier *
    Math.exp((temperatureMultiplier * T) / 343) *
    Math.exp(S / stressDivider) *
    (T / temperatureBase);
  let [baseFailureRate, setBaseFailureRate] = useState(1e-6);
  let [resistanceFactor, setResistanceFactor] = useState(1);
  let [qualityFactor, setQualityFactor] = useState(0.03);
  let [enviromentFactor, setEnviromentFactor] = useState(5);
  let [failures, setFailures] = useState(500);
  let predictedValue =
    lambdaB * resistanceFactor * qualityFactor * enviromentFactor;
  let valueInDecimal = predictedValue.toFixed(6);
  const constant = 4.5e-9;
  const exponent1 = (343 / 12) * (298 / 273);
  const exponent2 = (6 * 273 * 1000) / (0.00031 * 298 * 1000);
  const exp1 = Math.exp(exponent1);
  const exp2 = Math.exp(exponent2);
  const result = constant * exp1 * exp2;

  const getMTB = () => {
    setShowModal(false);
  };

  const getTreedata = () => {
    Api.get(`/api/v1/productTreeStructure/list`, {
      params: {
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const initialProductID = res?.data?.data[0]?.treeStructure?.id;
        const treeData = res?.data?.data;
        setInitialProductID(initialProductID);
        setInitialTreeStructure(res?.data?.data[0]?.id);
        setIsLoading(false);
        setTreeTabledata(treeData);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
      height: "38px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "38px",
      padding: "0 6px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "38px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
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

  const userId = localStorage.getItem("userId");
  const getProjectPermission = () => {
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        authorizedPersonnel: userId,
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setWritePermission(data?.modules[1].write);
        setPermission(data?.modules[1]);
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
  const getNprd2016Datas = () => {
    Api.get("/api/v1/failureRatePrediction/get/nprd/2016").then((res) => {
      const data = res?.data?.data;

      setPartTypeNprd2016Data(data?.getPartTypeData);
      // setPartTypeNprdDesc2016Data(data?.getPartDescData)
      // setFrpValueNprd2016Data(data?.getFrpData);
    });
  };

  useEffect(() => {
    productTreeData();
    getProjectPermission();
    projectSidebar();
    getNprd2016Datas();
    getTreedata();
    getProductFRPData();
  }, [projectId, productId]);

  const productTreeData = () => {
    setIsSpinning(true);
    Api.get("/api/v1/productTreeStructure/get/tree/product/list", {
      params: {
        projectId: projectId,
        treeStructureId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setCategory(
          data?.category ? { label: data?.category, value: data?.category } : ""
        );
        setQuantity(data?.quantity);
        setReference(data?.reference);
        setName(data?.productName);
        setPartNumber(data?.partNumber);
        console.log(data)
        setEnvironment(
          data?.environment
            ? { label: data?.environment, value: data?.environment }
            : ""
        );
        setTemperature(data?.temperature);
        setPartType(
          data?.partType ? { label: data?.partType, value: data?.partType } : ""
        );
        setIsSpinning(false);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const getProductFRPData = () => {
    const companyId = localStorage.getItem("companyId");
    Api.get(`/api/v1/failureRatePrediction/details`, {
      params: {
        projectId: projectId,
        companyId: companyId,
        productId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.frpData;
        setFrpId(data?.id);
        setField(data?.field ? data.field : "");
        setAllocated(data?.allocated ? data.allocated : "");
        setDutyCycle(data?.dutyCycle ? data.dutyCycle : '');
        setFrOffSet(data?.failureRateOffset ? data.failureRateOffset : "");
        setPredicted(data?.predicted ? data.predicted : nprdFR ? nprdFR : "");
        setFrDistribution(
          data?.frDistribution
            ? { label: data?.frDistribution, value: data?.frDistribution }
            : ""
        );
        console.log(data)
        setOtherFr(data?.otherFr ? data.otherFr : "");
        setFrRemarks(data?.frRemarks ? data.frRemarks : "");
        setStandard(data?.standard ? { label: data?.standard, value: data?.standard } : "");
        setOffSetOperand(
          data?.frOffsetOperand
            ? { label: data?.frOffsetOperand, value: data?.frOffsetOperand }
            : ""
        );
        setFrUnit(
          data?.frUnit ? { label: data?.frUnit, value: data?.frUnit } : ""
        );
        setSource(
          data?.source
            ? { label: data?.source, value: data?.source }
            : { label: "Predicted", value: "Predicted" }
        );
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const loginSchema = Yup.object().shape({
    category: Yup.object().required("Category is  required"),
    name: Yup.string().required("Name is required"),
    partNumber: Yup.string().required("Part Number is  required"),
    quantity: Yup.string().required("Quantity is  required"),
    dutyCycle: Yup.string().required("Duty Cycle is  required"),
    partType: Yup.object().required("Part Type is required"),
    temperature: Yup.string().required("Temperature is  required"),
    frDistribution: Yup.object().required("FR Distribution is  required"),
    // failureRate: Yup.string().required("Failure Rate Offset is required"),
    // operand: Yup.object().required("FR Offset Operand is required"),
    field:
      source.value === "Field"
        ? Yup.string().required("Field is Required")
        : Yup.object().nullable(),
    predicted:
      source.value === "Predicted"
        ? Yup.string().required("Predicted is Required")
        : Yup.object().nullable(),
    allocated:
      source.value === "Allocated"
        ? Yup.string().required("Allocated is Required")
        : Yup.object().nullable(),
    otherFr:
      source.value === "otherFr"
        ? Yup.string().required("OtherFr is Required")
        : Yup.object().nullable(),
  });

  const nprdSchema = Yup.object().shape({
    quality: Yup.string().required("Quality is required"),
    partTypeNprd: Yup.object().required(" Part type is required"),
    partTypeDescr: Yup.object().required("PartTypeDescr is required"),
    FR: Yup.string(),
  });

  const getFRPValue = (values) => {
    if (values.value == "Null") {
      const nprdFRPFiltered = nprdFRP.filter((item) => {
        return (
          item?.PartTypeId === partTypeNprd.value &&
          item?.PartDescrId === partTypeDescr.value
        );
      });
      console.log("nprdFRPFiltered.....", nprdFRPFiltered);
      setNprdFR(nprdFRPFiltered);
      setData(nprdFRPFiltered);
    } else {
      const nprdFRPFiltered = nprdFRP.filter((item) => {
        return (
          item?.PartTypeId === partTypeNprd.value &&
          item?.Quality === values.value &&
          item?.PartDescrId === partTypeDescr.value
        );
      });
      setNprdFR(nprdFRPFiltered);
      setData(nprdFRPFiltered);
    }
  };

  const getPartTypeNprdDesc2016Data = (values) => {
    Api.get("/api/v1/failureRatePrediction/get/nprd/2016/desc", {
      params: {
        partTypeId: values?.value,
      },
    }).then((res) => {
      setPartTypeNprdDesc2016Data(res?.data?.data);
    });
  };

  const getFRP2016Value = (values) => {
    if (values.value == "Null") {
      Api.get("/api/v1/failureRatePrediction/get/nprd/2016/value", {
        params: {
          partType2016Nprd: partType2016Nprd?.value,
          partDescrId: partType2016Descr?.value,
        },
      }).then((res) => {
        setNprdFR(res.data.data);
        setData(res.data.data);
      });
    } else {
      Api.get("/api/v1/failureRatePrediction/get/nprd/2016/value", {
        params: {
          partType2016Nprd: partType2016Nprd?.value,
          quality: values?.value,
          partDescrId: partType2016Descr?.value,
        },
      }).then((res) => {
        setNprdFR(res.data.data);
        setData(res.data.data);
      });
    }
  };

  const qualityOptions = [
    {
      value: "Unknown",
      label: "Unknown",
    },
    {
      value: "Commercial",
      label: "Commercial",
    },
    {
      value: "Military",
      label: "Military",
    },
    {
      value: "Industrial",
      label: "Industrial",
    },
    {
      value: "Null",
      label: "Null",
    },
  ];

  const updateFrpData = (values) => {
    const companyId = localStorage.getItem("companyId");
    Api.patch("/api/v1/failureRatePrediction/update", {
      predicted: values.predicted,
      field: values.field,
      dutyCycle: values.dutyCycle,
      otherFr: values.otherFr,
      frDistribution: values.frDistribution.value,
      allocated: values.allocated,
      frRemarks: values.frRemarks,
      failureRateOffset: values.failureRate,
      frOffsetOperand: values.operand.value,
      standard: values.standard.value,
      quantity: values.quantity,
      frUnit: values.frUnit.value,
      productId: productId,
      projectId: projectId,
      companyId: companyId,
      treeStructureId: treeStructure,
      frpId: frpId,
      userId: userId,
      source: values.source.value,
    })
      .then((response) => {
        setSuccessMessage(response.data.message);
        NextPage();
        toast.success("FR  Updated Successfully");
        // window.location.reload();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  const submitForm = (values) => {
    const companyId = localStorage.getItem("companyId");
    const standard = values?.standard?.value;
    Api.post("/api/v1/failureRatePrediction/", {
      predicted: values.predicted ? values.predicted : predicted,
      field: values.field,
      dutyCycle: values.dutyCycle,
      otherFr: values.otherFr,
      frDistribution: values.frDistribution.value,
      allocated: values.allocated,
      frRemarks: values.frRemarks,
      failureRateOffset: values.failureRate,
      frOffsetOperand: values.operand.value,
      standard: standard,
      quantity: values.quantity,
      productId: productId,
      projectId: projectId,
      companyId: companyId,
      treeStructureId: treeStructure,
      userId: userId,
      frUnit: values.frUnit.value,
      source: values.source.value,
    })
      .then((response) => {
        console.log("responghjj", response)
        setSuccessMessage(response.data.message);
        setFrpId(response?.data?.data?.createFailureRatePrediction?.id);
        NextPage();
        getProductFRPData();
        toast.success("FR Created Successfully");
        window.location.reload();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const NextPage = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  return (
    <Container className="mttr-main-div mx-1" style={{ marginTop: "90px" }}>
      {isLoading ? (
        <Loader />
      ) : permission?.read === true ||
        permission?.read === "undefined" ||
        role === "admin" ||
        (isOwner === true && createdBy === userId) ? (
        <div>
          <Formik
            enableReinitialize={true}
            initialValues={{
              name: name,
              reference: reference,
              partNumber: partNumber,
              category: category,
              quantity: quantity,
              partType: partType,
              environment: environment,
              dutyCycle: dutyCycle,
              frDistribution: frDistribution,
              temperature: temperature,
              field: field,
              predicted: predicted,
              otherFr: otherFr,
              allocated: allocated,
              frRemarks: frRemarks,
              standard: standard,
              failureRate: frOffset,
              operand: frOffsetOperand,
              frUnit: frUnit,
              source: source,
            }}
            validationSchema={loginSchema}
            onSubmit={(values) => {
              // console.log("values....",values)
              frpId ? updateFrpData(values) : submitForm(values);
            }}
          >
            {(formik) => {
              const {
                values,
                handleChange,
                handleSubmit,
                handleBlur,
                submitForm,
                setFieldValue,
              } = formik;
              return (
                <div>
                  <Form onSubmit={handleSubmit}>
                    <fieldset
                      disabled={
                        writePermission === true ||
                          writePermission === "undefined" ||
                          role === "admin" ||
                          (isOwner === true && createdBy === userId)
                          ? null
                          : "disabled"
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ width: "30%", marginRight: "20px" }}>
                          <Projectname projectId={projectId} />
                        </div>
                        <div style={{ width: "100%", marginRight: "20px" }}>
                          <Dropdown
                            value={projectId}
                            productId={productId}
                            data={treeTableData}
                          />
                        </div>
                      </div>

                      <Row className="d-flex  mt-4">
                        <Col>
                          <div className="mttr-sec ">
                            <p className=" mb-0 para-tag">
                              General Information
                            </p>
                          </div>
                          <Card className="mt-2 px-4 py-4 mttr-card">
                            {isSpinning ? (
                              <Spinner
                                className="spinner"
                                animation="border"
                                variant="secondary"
                                centered
                              />
                            ) : (
                              <div>
                                <Row>
                                  <Col>
                                    <Label>Name</Label>
                                    <Form.Group>
                                      <Form.Control
                                        type="text"
                                        name="name"
                                        className="mt-1"
                                        placeholder="Name"
                                        value={values.name}
                                        disabled
                                        // onChange={handleChange}
                                        onBlur={handleBlur}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="name"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label notify={true}>Part Number</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="tel"
                                        maxLength={10}
                                        name="partNumber"
                                        disabled
                                        placeholder="Part Number"
                                        onBlur={handleBlur}
                                        value={partNumber}
                                      // onChange={handleChange}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="partNumber"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row className="mt-3">
                                  <Col>
                                    <Label notify={true}>Quantity</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="number"
                                        step="any"
                                        disabled
                                        min="0"
                                        name="quantity"
                                        placeholder="Quantity"
                                        value={quantity}
                                        onBlur={handleBlur}
                                      // onChange={handleChange}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="quantity"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label>Reference or Position</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="text"
                                        disabled
                                        placeholder="Reference or Position"
                                        value={reference}
                                        name="reference"
                                        onBlur={handleBlur}
                                      // onChange={handleChange}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="reference"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <Form.Group className="mt-3">
                                      <Label notify="true">Category</Label>
                                      <Select
                                        styles={customStyles}
                                        type="select"
                                        value={values.category}
                                        placeholder="Select"
                                        name="category"
                                        isDisabled
                                        onBlur={handleBlur}
                                        className="mt-1"
                                        // isDisabled={
                                        //   writePermission === true ||
                                        //   writePermission === "undefined" ||
                                        //   role === "admin" ||
                                        //   (isOwner === true &&
                                        //     createdBy === userId)
                                        //     ? null
                                        //     : "disabled"
                                        // }
                                        // onChange={(e) => {
                                        //   setFieldValue("category", e);
                                        //   // setCategory(e);
                                        // }}
                                        options={[
                                          {
                                            value: "Electronic",
                                            label: "Electronic",
                                          },
                                          {
                                            value: "Mechanical",
                                            label: "Mechanical",
                                          },
                                          {
                                            value: "Assembly",
                                            label: "Assembly",
                                          },
                                        ]}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="category"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    {values.category?.value === "Mechanical" ||
                                      values.category?.value === "Electronic" ? (
                                      <div>
                                        <Form.Group className="mt-3">
                                          <Label notify={true}>Part Type</Label>
                                          <Select
                                            styles={customStyles}
                                            type="select"
                                            isDisabled
                                            value={values.partType}
                                            placeholder="Select Part Type"
                                            name="partType"
                                            onBlur={handleBlur}
                                            // isDisabled={
                                            //   writePermission === true ||
                                            //   writePermission === "undefined" ||
                                            //   role === "admin" ||
                                            //   (isOwner === true &&
                                            //     createdBy === userId)
                                            //     ? null
                                            //     : "disabled"
                                            // }
                                            // onChange={(e) => {
                                            //   setFieldValue("partType", e);
                                            //   setPartType(e.value);
                                            // }}
                                            className="mt-1"
                                            options={[
                                              values.category?.value ===
                                                "Electronic"
                                                ? {
                                                  options: Electronic.map(
                                                    (list) => ({
                                                      value: list.value,
                                                      label: list.label,
                                                    })
                                                  ),
                                                }
                                                : {
                                                  options: Mechanical.map(
                                                    (list) => ({
                                                      value: list.value,
                                                      label: list.label,
                                                    })
                                                  ),
                                                },
                                            ]}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="partType"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : null}
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </Card>
                          <div className="mttr-sec mt-4 ">
                            <p className=" mb-0 para-tag">
                              Environment Profile and Temperature
                            </p>
                          </div>
                          <Card className=" mttr-card">
                            {isSpinning ? (
                              <Spinner
                                className="spinner_2"
                                animation="border"
                                variant="secondary"
                                centered
                              />
                            ) : (
                              <Row className="mx-3 my-4">
                                <Col>
                                  <Label notify={true}>Environment</Label>
                                  <Form.Group>
                                    <Select
                                      className="mt-1"
                                      name="environment"
                                      isDisabled
                                      styles={customStyles}
                                      placeholder="Select"
                                      // isDisabled={
                                      //   writePermission === true ||
                                      //   writePermission === "undefined" ||
                                      //   role === "admin" ||
                                      //   (isOwner === true && createdBy === userId)
                                      //     ? null
                                      //     : "disabled"
                                      // }
                                      options={[
                                        { value: null, label: "None" },
                                        {
                                          options: Environment.map((list) => ({
                                            value: list.value,
                                            label: list.label,
                                          })),
                                        },
                                      ]}
                                      type="select"
                                      value={environment}
                                      onBlur={handleBlur}
                                    // onChange={(e) => {
                                    //   setFieldValue("environment", e);
                                    //   setEnvironment(e.value);
                                    // }}
                                    />
                                    <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="environment"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col>
                                  <Label notify="true">Temperature</Label>
                                  <Form.Group>
                                    <Form.Control
                                      className="mt-1"
                                      type="number"
                                      min="0"
                                      step="any"
                                      disabled
                                      name="temperature"
                                      placeholder="Temperature"
                                      value={temperature}
                                      onBlur={handleBlur}
                                    // onChange={handleChange}
                                    />
                                    <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="temperature"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            )}
                          </Card>
                          <Row className="d-flex">
                            <Col>
                              <div className="mttr-sec mt-3 ">
                                <p className=" mb-0 para-tag">Failure Rate</p>
                              </div>
                              <Card className="mt-2 mttr-card p-4">
                                <Row className="mt-3">
                                  <Col className="mt-3">
                                    <Label notify="true">Source</Label>
                                    <Select
                                      type="select"
                                      className="mt-1"
                                      value={values.source}
                                      styles={customStyles}
                                      name="source"
                                      // isDisabled={
                                      //   (field === "" &&
                                      //     predicted === "" &&
                                      //     allocated === "" &&
                                      //     otherFr === "" &&
                                      //     writePermission?.write === true) ||
                                      //   writePermission?.write === "undefined" ||
                                      //   role === "admin" ||
                                      //   (isOwner === true && createdBy === userId)
                                      //     ? null
                                      //     : "disabled"
                                      // }
                                      // isDisabled={
                                      //   writePermission?.write === true ||
                                      //   writePermission?.write === "undefined" ||
                                      //   role === "admin" ||
                                      //   (isOwner === true && createdBy === userId)
                                      //     ? null
                                      //     : "disabled"
                                      // }
                                      placeholder="Select"
                                      onBlur={handleBlur}
                                      onChange={(e) => {
                                        setFieldValue("source", e);
                                        setSource(e);
                                      }}
                                      options={[
                                        {
                                          value: "Predicted",
                                          label: "Predicted",
                                        },
                                        {
                                          value: "Field",
                                          label: "Field",
                                        },
                                        {
                                          value: "Allocated",
                                          label: "Allocated",
                                        },
                                        {
                                          value: "otherFr",
                                          label: "Other FR",
                                        },
                                      ]}
                                    />
                                  </Col>
                                  <Col className="mt-3">
                                    {values?.source?.value === "Field" ? (
                                      <div>
                                        <Label notify="true">Field</Label>
                                        <Form.Group>
                                          <Form.Control
                                            className="mt-1"
                                            name="field"
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="Field"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.field}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="field"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : values?.source?.value ===
                                      "Predicted" ? (
                                      <div>
                                        <Label notify="true">Predicted</Label>
                                        <Form.Group>
                                          <Form.Control
                                            className="mt-1"
                                            name="predicted"
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="Predicted"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.predicted}
                                            disabled={true}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="predicted"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : values?.source?.value ===
                                      "Allocated" ? (
                                      <div>
                                        <Label notify="true">Allocated</Label>
                                        <Form.Group>
                                          <Form.Control
                                            className="mt-1"
                                            type="number"
                                            min="0"
                                            step="any"
                                            name="allocated"
                                            placeholder="Allocated"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.allocated}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="allocated"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : values?.source?.value === "otherFr" ? (
                                      <div>
                                        <Label notify="true">Other FR</Label>
                                        <Form.Group>
                                          <Form.Control
                                            className="mt-1"
                                            name="otherFr"
                                            type="number"
                                            step="any"
                                            min="0"
                                            placeholder="Other FR"
                                            value={values.otherFr}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="otherFr"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : null}
                                  </Col>
                                </Row>
                                <Row className="mt-3">
                                  <Col>
                                    <Label notify="true">Duty Cycle</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="text"
                                        name="dutyCycle"
                                        placeholder="Duty Cycle"
                                        value={values.dutyCycle}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const num = parseFloat(value);
                                          if (isNaN(num) || num < 0 || num > 1) {
                                            alert("Enter a value between 0 and 1");
                                            setDutyCycle('');
                                          } else {
                                            setDutyCycle(value);
                                          }
                                        }}
                                        onBlur={handleBlur}
                                      // onChange={handleChange}
                                      />

                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="dutyCycle"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label notify="true">FR Distribution</Label>
                                    <Form.Group>
                                      <Select
                                        className="mt-1"
                                        type="select"
                                        name="frDistribution"
                                        styles={customStyles}
                                        placeholder="FR Distribution"
                                        onBlur={handleBlur}
                                        isDisabled={
                                          writePermission === true ||
                                            writePermission === "undefined" ||
                                            role === "admin" ||
                                            (isOwner === true &&
                                              createdBy === userId)
                                            ? null
                                            : "disabled"
                                        }
                                        value={values.frDistribution}
                                        onChange={(e) => {
                                          setFrDistribution(e);
                                        }}
                                        options={[
                                          {
                                            value: "Normal",
                                            label: "Normal",
                                          },
                                          {
                                            value: "Exponential",
                                            label: "Exponential",
                                          },
                                        ]}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="frDistribution"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                {/* <Row className="mt-3">
                                <Col>
                                  <Label>Allocated</Label>
                                  <Form.Group>
                                    <Form.Control
                                      className="mt-1"
                                      type="number"
                                      min="0"
                                      step="any"
                                      name="allocated"
                                      placeholder="Allocated"
                                      onBlur={handleBlur}
                                      onChange={handleChange}
                                      value={values.allocated}
                                    />
                                    <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="allocated"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col>
                                  <Label>Other FR</Label>
                                  <Form.Group>
                                    <Form.Control
                                      className="mt-1"
                                      name="otherFr"
                                      type="number"
                                      step="any"
                                      min="0"
                                      placeholder="Other FR"
                                      value={values.otherFr}
                                      onBlur={handleBlur}
                                      onChange={handleChange}
                                    />
                                    <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="otherFr"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row> */}
                                <Row className="mt-3">
                                  <Col>
                                    <Label>FR Remarks</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="text"
                                        name="frRemarks"
                                        placeholder="FR Remarks"
                                        onBlur={handleBlur}
                                        onChange={(e) => { setFrRemarks(e.target.value) }}
                                        value={values.frRemarks}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label notify={true} >Standard</Label>
                                    <Form.Group>
                                      <Select
                                        className="mt-1"
                                        styles={customStyles}
                                        name="standard"
                                        type="select"
                                        placeholder="Select"
                                        isDisabled={
                                          writePermission === true ||
                                            writePermission === "undefined" ||
                                            role === "admin" ||
                                            (isOwner === true &&
                                              createdBy === userId)
                                            ? null
                                            : "disabled"
                                        }
                                        // value={values.standard}
                                        value={standard}
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                          if (e.value === "MIL") {
                                            setShowModal(true);
                                          } else if (e.value === "NPRD11") {
                                            setNprdModel(true);
                                          } else if (e.value === "NPRD16") {
                                            setNprd2016Model(true);
                                          } else if (e.value === "MIL") {
                                            setShowMil(true);
                                          }
                                          setStandard(e);
                                          setPartTypeNprdDesc2016Data();
                                        }}
                                        options={[
                                          {
                                            value: "Select",
                                            label: "Select",
                                          },
                                          {
                                            value: "MIL",
                                            label: "MIL-HDBK-217F",
                                          },
                                          // {
                                          //   value: "IEC",
                                          //   label: "IEC",
                                          // },
                                          {
                                            value: "NPRD11",
                                            label: "NPRD 2011",
                                          },
                                          {
                                            value: "NPRD16",
                                            label: "NPRD 2016",
                                          },
                                        ]}
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>

                                <Row className="mt-3">
                                  <Col>
                                    <Label>FR Offset Operand</Label>
                                    <Form.Group>
                                      <Select
                                        className="mt-1"
                                        type="select"
                                        name="operand"
                                        styles={customStyles}
                                        isDisabled={
                                          writePermission === true ||
                                            writePermission === "undefined" ||
                                            role === "admin" ||
                                            (isOwner === true &&
                                              createdBy === userId)
                                            ? null
                                            : "disabled"
                                        }
                                        placeholder="Select"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                          setFieldValue("operand", e);
                                        }}
                                        options={[
                                          {
                                            value: "+",
                                            label: "+",
                                          },
                                          {
                                            value: "-",
                                            label: "-",
                                          },
                                          {
                                            value: "*",
                                            label: "*",
                                          },
                                          {
                                            value: "/",
                                            label: "/",
                                          },
                                        ]}
                                        value={values.operand}
                                      />
                                      {/* <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="operand"
                                    /> */}
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label>Failure Rate Offset</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="number"
                                        min="0"
                                        step="any"
                                        name="failureRate"
                                        placeholder="Failure Rate Offset"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.failureRate}
                                      />
                                      {/* <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="failureRate"
                                    /> */}
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <Form.Group className="mt-3">
                                      <Label>FR unit</Label>
                                      <Select
                                        id="frUnit"
                                        styles={customStyles}
                                        // onChange={(event) => {
                                        //   setFieldValue("frUnit", event);
                                        // }}
                                        onChange={(event) => {
                                          // Auto-correct to "Failure Per Power On Hour" if MIL is selected
                                          const selectedValue =
                                            values.standard?.value === "MIL"
                                              ? {
                                                value:
                                                  "Failure Per Million Operating Hours",
                                                label:
                                                  "Failure Per Million Operating Hours",
                                              }
                                              : event;
                                          setFieldValue(
                                            "frUnit",
                                            selectedValue
                                          );
                                        }}
                                        onBlur={handleBlur}
                                        name="frUnit"
                                        // isDisabled={
                                        //   writePermission?.write === true ||
                                        //   writePermission?.write ===
                                        //     "undefined" ||
                                        //   role === "admin" ||
                                        //   (isOwner === true &&
                                        //     createdBy === userId)
                                        //     ? null
                                        //     : "disabled"
                                        // }
                                        value={
                                          values.standard?.value === "MIL"
                                            ? {
                                              value:
                                                "Failure Per Million Operating Hours",
                                              label:
                                                "Failure Per Million Operating Hours",
                                            }
                                            : values.frUnit
                                        }
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
                                  <Col></Col>
                                </Row>
                              </Card>
                              <div className="d-flex flex-direction-row justify-content-end  mt-4 mb-5">
                                <Button
                                  className="delete-cancel-btn  me-2"
                                  variant="outline-secondary"
                                  type="reset"
                                >
                                  CANCEL
                                </Button>
                                <Button
                                  className="save-btn "
                                  type="submit"
                                  disabled={!productId}
                                >
                                  SAVE CHANGES
                                </Button>
                                <div>
                                  <Modal
                                    show={nprdModel}
                                    centered
                                    onHide={() => setNprdModel(!nprdModel)}
                                  >
                                    <Formik
                                      enableReinitialize={true}
                                      initialValues={{
                                        partTypeNprd: partTypeNprd
                                          ? partTypeNprd
                                          : "",
                                        quality: partTypeQuality
                                          ? partTypeQuality
                                          : "",
                                        partTypeDescr: partTypeDescr
                                          ? partTypeDescr
                                          : "",
                                        FR: FR ? FR : "",
                                      }}
                                      validationSchema={nprdSchema}
                                      onSubmit={(values, { resetForm }) =>
                                        console.log("values...")
                                      }
                                    >
                                      {(formik) => {
                                        const {
                                          values,
                                          handleChange,
                                          handleSubmit,
                                          handleBlur,
                                          isValid,
                                          mainProductForm,
                                          setFieldValue,
                                        } = formik;
                                        return (
                                          <form
                                            onSubmit={handleSubmit}
                                            className="d-flex justify-content-center align-items-center"
                                          >
                                            <div className="nprdmodal">
                                              <div className="d-flex justify-content-end m-1">
                                                <Modal.Header
                                                  closeButton
                                                  style={{ borderBottom: 0 }}
                                                  onClick={() => {
                                                    setNprdModel(false);
                                                    setPartTypeNprd();
                                                    setPartTypeDescr();
                                                    setPartTypeQuality();
                                                    setFR();
                                                    setRowClicked();
                                                    setData();
                                                  }}
                                                />
                                              </div>
                                              <div className="mttr-sec1 mt-3">
                                                <p className="mb-0 para-tag">
                                                  NPRD 2011
                                                </p>
                                              </div>
                                              <Card className="modal-card m-2">
                                                {isSpinning ? (
                                                  <Spinner
                                                    className="spinner_2"
                                                    animation="border"
                                                    variant="secondary"
                                                    centered
                                                  />
                                                ) : (
                                                  <div>
                                                    <Row className="mx-3 my-4">
                                                      <Col>
                                                        <Label notify={true}>
                                                          Part Type
                                                        </Label>
                                                        <Form.Group>
                                                          <Select
                                                            className="mt-1"
                                                            // styles={customStyles}
                                                            name="partTypeNprd"
                                                            type="select"
                                                            isSearchable={true}
                                                            placeholder="Select"
                                                            isDisabled={
                                                              writePermission ===
                                                                true ||
                                                                writePermission ===
                                                                "undefined" ||
                                                                role ===
                                                                "admin" ||
                                                                (isOwner ===
                                                                  true &&
                                                                  createdBy ===
                                                                  userId)
                                                                ? null
                                                                : "disabled"
                                                            }
                                                            value={
                                                              values.partTypeNprd
                                                            }
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                              setFieldValue(
                                                                "partTypeNprd",
                                                                e
                                                              );
                                                              setPartTypeNprd(
                                                                e
                                                              );
                                                              setPartTypeDescr();
                                                            }}
                                                            options={nprdPartType.map(
                                                              (list) => ({
                                                                value:
                                                                  list.PartTypeId,
                                                                label:
                                                                  list.PartType,
                                                              })
                                                            )}
                                                          />
                                                          <ErrorMessage
                                                            className="error text-danger"
                                                            component="span"
                                                            name="partTypeNprd"
                                                          />
                                                        </Form.Group>
                                                      </Col>
                                                      {partTypeNprd ? (
                                                        <Col>
                                                          <Label notify={true}>
                                                            Part Type
                                                            Description
                                                          </Label>
                                                          <Form.Group>
                                                            <Select
                                                              className="mt-1"
                                                              // styles={customStyles}
                                                              name="partTypeDescr"
                                                              type="select"
                                                              isSearchable={
                                                                true
                                                              }
                                                              placeholder="Select"
                                                              isDisabled={
                                                                writePermission ===
                                                                  true ||
                                                                  writePermission ===
                                                                  "undefined" ||
                                                                  role ===
                                                                  "admin" ||
                                                                  (isOwner ===
                                                                    true &&
                                                                    createdBy ===
                                                                    userId)
                                                                  ? null
                                                                  : "disabled"
                                                              }
                                                              value={
                                                                values.partTypeDescr
                                                              }
                                                              onBlur={
                                                                handleBlur
                                                              }
                                                              onChange={(e) => {
                                                                setFieldValue(
                                                                  "partTypeDescr",
                                                                  e
                                                                );
                                                                setPartTypeDescr(
                                                                  e
                                                                );
                                                              }}
                                                              options={nprdPartDes
                                                                .filter(
                                                                  (item) =>
                                                                    item?.PartTypeId ===
                                                                    partTypeNprd?.value
                                                                )
                                                                .map(
                                                                  (item) => ({
                                                                    label:
                                                                      item?.PartDescrFull,
                                                                    value:
                                                                      item?.PartDescrId,
                                                                  })
                                                                )}
                                                            />
                                                            <ErrorMessage
                                                              className="error text-danger"
                                                              component="span"
                                                              name="partTypeDescr"
                                                            />
                                                          </Form.Group>
                                                        </Col>
                                                      ) : null}
                                                    </Row>
                                                    <Row className="mx-3 my-4">
                                                      <Col>
                                                        <Label notify="true">
                                                          Quality
                                                        </Label>
                                                        <Form.Group>
                                                          <Select
                                                            className="mt-1"
                                                            name="quality"
                                                            type="select"
                                                            placeholder="Select"
                                                            styles={
                                                              customStyles
                                                            }
                                                            value={
                                                              partTypeQuality
                                                                ? {
                                                                  label:
                                                                    partTypeQuality,
                                                                  value:
                                                                    partTypeQuality,
                                                                }
                                                                : values.quality
                                                            }
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                              setFieldValue(
                                                                "quality",
                                                                e.value
                                                              );
                                                              setPartTypeQuality(
                                                                e.value
                                                              );
                                                              getFRPValue(e);
                                                            }}
                                                            options={
                                                              qualityOptions
                                                            }
                                                          />
                                                          <ErrorMessage
                                                            className="error text-danger"
                                                            component="span"
                                                            name="quality"
                                                          />
                                                        </Form.Group>
                                                      </Col>
                                                      {/* <Col>
                                                      <Label notify="true">
                                                        FR
                                                      </Label>
                                                      <Form.Group>
                                                        <Form.Control
                                                          className="mt-1"
                                                          name="FR"
                                                          type="number"
                                                          min="0"
                                                          step="any"
                                                          placeholder="FR"
                                                          onBlur={handleBlur}
                                                          onChange={
                                                            handleChange
                                                          }
                                                          disabled
                                                          styles={customStyles}
                                                          value={
                                                            FR ? FR : values.FR
                                                          }
                                                        />
                                                        <ErrorMessage
                                                          className="error text-danger"
                                                          component="span"
                                                          name="FR"
                                                        />
                                                      </Form.Group>
                                                    </Col> */}
                                                    </Row>
                                                    {partTypeNprd?.value &&
                                                      partTypeDescr?.value &&
                                                      !rowClicked ? (
                                                      <div className="mt-3 p-2">
                                                        <ThemeProvider
                                                          theme={tableTheme}
                                                        >
                                                          <MaterialTable
                                                            title="Manual Library Records"
                                                            columns={columns}
                                                            data={data}
                                                            icons={tableIcons}
                                                            // parentChildData={(row, rows) =>
                                                            //   rows.find((a) => a.id === row.productId)
                                                            // }
                                                            options={{
                                                              actionsColumnIndex:
                                                                -1,
                                                              addRowPosition:
                                                                "last",
                                                              headerStyle: {
                                                                backgroundColor:
                                                                  "#cce6ff",
                                                                fontWeight:
                                                                  "bold",
                                                                zIndex: 0,
                                                              },
                                                              defaultExpanded: true,
                                                              rowStyle,
                                                            }}
                                                            onRowClick={(
                                                              event,
                                                              rowData
                                                            ) => {
                                                              setPredicted(
                                                                rowData?.FR
                                                              );
                                                              setSelectedNprdFR(
                                                                rowData
                                                              );
                                                              setPartTypeQuality(
                                                                rowData?.Quality
                                                              );
                                                              setPartTypeNprd({
                                                                label:
                                                                  rowData?.PartTypeTxt,
                                                                value:
                                                                  rowData?.PartTypeId,
                                                              });
                                                              setPartTypeDescr({
                                                                label:
                                                                  rowData?.PartDescrFull,
                                                                value:
                                                                  rowData?.PartDescrId,
                                                              });
                                                              setFR(
                                                                rowData?.FR
                                                              );
                                                            }}
                                                            localization={{
                                                              body: {
                                                                emptyDataSourceMessage:
                                                                  "No records to display for this partType and Environment Please Select Anyother partType",
                                                              },
                                                            }}
                                                          />
                                                        </ThemeProvider>
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )}
                                              </Card>
                                              <div className="d-flex flex-direction-row justify-content-end m-2">
                                                <Button
                                                  className="delete-cancel-btn me-2"
                                                  variant="outline-secondary"
                                                  type="reset"
                                                  onClick={(e) => {
                                                    setNprdModel(false);
                                                  }}
                                                >
                                                  CANCEL
                                                </Button>
                                                <Button
                                                  className="save-btn"
                                                  type="button"
                                                  disabled={
                                                    !productId &
                                                    values.partTypeDescr &
                                                    values.partTypeNprd &
                                                    values.quality
                                                  }
                                                  onClick={(e) => {
                                                    if (partTypeNprd && partTypeDescr) {
                                                      setNprdModel(false);
                                                      toast.success("FR Selected");
                                                      // Set the predicted value
                                                      if (selectedNprdFR?.FR) {
                                                        const roundedValue = parseFloat(selectedNprdFR.FR.toFixed(6));
                                                        console.log("value Printing", roundedValue)
                                                        setPredicted(roundedValue);
                                                        formik.setFieldValue("predicted", roundedValue);
                                                      }
                                                    }
                                                    setPartTypeNprd();
                                                    setPartTypeDescr();
                                                    setPartTypeQuality();
                                                    setFR();
                                                    setRowClicked();
                                                    setNprdModel(!nprdModel);
                                                    getProductFRPData();
                                                  }}
                                                >
                                                  CALCULATE FR
                                                </Button>
                                              </div>
                                            </div>
                                          </form>
                                        );
                                      }}
                                    </Formik>
                                  </Modal>
                                  {/* <Modal
                                    show={showModal}
                                    position="center"
                                    onHide={() => setShowModal(false)}
                                  >
                                    <div className="modal-content">
                                      <div className="m-3">
                                        <FontAwesomeIcon
                                          icon={faCircleXmark}
                                          fontSize={"40px"}
                                          color="#1D5460"
                                          onClick={() => setShowModal(false)}
                                          className="close-icon"
                                        />
                                      </div>
                                      <Modal.Footer
                                        className="d-flex mt-3 mb-5"
                                        style={{ marginTop: 0 }}
                                      >
                                        {partType?.value === "Resistor" ? (
                                          <Resistor />
                                        ) : partType?.value === "IC-Memory" ||
                                          partType?.value === "IC-Analog" ? (
                                          <IcMemory />
                                        ) : partType?.value ===
                                          "Potentiometer" ? (
                                          <Potentiometer />
                                        ) : partType?.value === "Capacitor" ? (
                                          <Capacitor />
                                        ) : partType?.value === "Switch" ? (
                                          <Switch />
                                        ) : partType?.value === "Connector" ? (
                                          <Connector />
                                        ) : partType?.value === "LFDiode" ? (
                                          <LFDiode />
                                        ) : partType?.value ===
                                          "LFTransistor" ? (
                                          <LFTransistor />
                                        ) : partType?.value ===
                                          "HFTransistor" ? (
                                          <HFTransistor />
                                        ) : partType?.value ===
                                          "Optoelectronic" ? (
                                          <Optoelectronic />
                                        ) : partType?.value === "Inductive" ? (
                                          <Inductive />
                                        ) : partType?.value === "Connection" ? (
                                          <Connection />
                                        ) : partType?.value === "PWB" ? (
                                          <PWB />
                                        ) : partType?.value === "Rotating" ? (
                                          <Rotating />
                                        ) : partType?.value === "Crystal" ? (
                                          <Crystal />
                                        ) : partType?.value === "Breaker" ? (
                                          <Breaker />
                                        ) : partType?.value === "Meter" ? (
                                          <Meter />
                                        ) : partType?.value === "Lamp" ? (
                                          <Lamp />
                                        ) : partType?.value ===
                                          "Misellaneous" ? (
                                          <Miscellaneous />
                                        ) : partType?.value === "Tube" ? (
                                          <Tube />
                                        ) : (
                                          <p style={{ color: "red" }}>
                                            Part Type is Empty.
                                          </p>
                                        )}
                                      </Modal.Footer>
                                    </div>
                                  </Modal> */}
                                </div>
                                <div>
                                  <Modal
                                    show={nprd2016Model}
                                    centered
                                    onHide={() =>
                                      setNprd2016Model(!nprd2016Model)
                                    }
                                  >
                                    <Formik
                                      enableReinitialize={true}
                                      initialValues={{
                                        partTypeNprd: partType2016Nprd
                                          ? partType2016Nprd
                                          : "",
                                        quality2016: partType2016Quality
                                          ? partType2016Quality
                                          : "",
                                        partTypeDescr: partType2016Descr
                                          ? partType2016Descr
                                          : "",
                                        FR: FR ? FR : "",
                                      }}
                                      validationSchema={nprdSchema}
                                      onSubmit={(values, { resetForm }) =>
                                        console.log("values...")
                                      }
                                    >
                                      {(formik) => {
                                        const {
                                          values,
                                          handleChange,
                                          handleSubmit,
                                          handleBlur,
                                          isValid,
                                          mainProductForm,
                                          setFieldValue,
                                        } = formik;
                                        return (
                                          <form
                                            onSubmit={handleSubmit}
                                            className="d-flex justify-content-center align-items-center"
                                          >
                                            <div className="nprdmodal">
                                              <div className="d-flex justify-content-end m-1">
                                                <Modal.Header
                                                  closeButton
                                                  style={{ borderBottom: 0 }}
                                                  onClick={() => {
                                                    setNprd2016Model(false);
                                                    setPartType2016Nprd();
                                                    setPartType2016Descr();
                                                    setPartType2016Quality();
                                                    setFR();
                                                    setRowClicked();
                                                    setData();
                                                  }}
                                                />
                                              </div>
                                              <div className="mttr-sec1 mt-3 ">
                                                <p className=" mb-0 para-tag">
                                                  NPRD 2016
                                                </p>
                                              </div>
                                              <Card className="modal-card m-2">
                                                {isSpinning ? (
                                                  <Spinner
                                                    className="spinner_2"
                                                    animation="border"
                                                    variant="secondary"
                                                    centered
                                                  />
                                                ) : (
                                                  <div>
                                                    <Row className="mx-3 my-4">
                                                      <Col>
                                                        <Label notify={true}>
                                                          Part Type
                                                        </Label>
                                                        <Form.Group>
                                                          <Select
                                                            className="mt-1"
                                                            // styles={customStyles}
                                                            name="partTypeNprd"
                                                            type="select"
                                                            isSearchable={true}
                                                            placeholder="Select"
                                                            isDisabled={
                                                              writePermission ===
                                                                true ||
                                                                writePermission ===
                                                                "undefined" ||
                                                                role ===
                                                                "admin" ||
                                                                (isOwner ===
                                                                  true &&
                                                                  createdBy ===
                                                                  userId)
                                                                ? null
                                                                : "disabled"
                                                            }
                                                            value={
                                                              values.partTypeNprd
                                                            }
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                              setFieldValue(
                                                                "partTypeNprd",
                                                                e
                                                              );
                                                              setPartType2016Nprd(
                                                                e
                                                              );
                                                              setPartType2016Descr();
                                                              setPartTypeNprdDesc2016Data();
                                                              getPartTypeNprdDesc2016Data(
                                                                e
                                                              );
                                                            }}
                                                            options={partTypeNprd2016Data.map(
                                                              (list) => ({
                                                                value:
                                                                  list.PartTypeId,
                                                                label:
                                                                  list.PartType,
                                                              })
                                                            )}
                                                          />
                                                          <ErrorMessage
                                                            className="error text-danger"
                                                            component="span"
                                                            name="partTypeNprd"
                                                          />
                                                        </Form.Group>
                                                      </Col>
                                                      {partType2016Nprd ? (
                                                        <Col>
                                                          <Label notify={true}>
                                                            Part Type
                                                            Description
                                                          </Label>
                                                          <Form.Group>
                                                            <Select
                                                              className="mt-1"
                                                              // styles={customStyles}
                                                              name="partTypeDescr"
                                                              type="select"
                                                              isSearchable={
                                                                true
                                                              }
                                                              placeholder="Select"
                                                              isDisabled={
                                                                writePermission ===
                                                                  true ||
                                                                  writePermission ===
                                                                  "undefined" ||
                                                                  role ===
                                                                  "admin" ||
                                                                  (isOwner ===
                                                                    true &&
                                                                    createdBy ===
                                                                    userId)
                                                                  ? null
                                                                  : "disabled"
                                                              }
                                                              value={
                                                                values.partTypeDescr
                                                              }
                                                              onBlur={
                                                                handleBlur
                                                              }
                                                              onChange={(e) => {
                                                                setFieldValue(
                                                                  "partTypeDescr",
                                                                  e
                                                                );
                                                                setPartType2016Descr(
                                                                  e
                                                                );
                                                              }}
                                                              options={partTypeNprdDesc2016Data
                                                                ?.filter(
                                                                  (item) =>
                                                                    item?.PartTypeId ===
                                                                    partType2016Nprd?.value
                                                                )
                                                                .map(
                                                                  (item) => ({
                                                                    label:
                                                                      item?.PartDescrFull,
                                                                    value:
                                                                      item?.PartDescrId,
                                                                  })
                                                                )}
                                                            />
                                                            <ErrorMessage
                                                              className="error text-danger"
                                                              component="span"
                                                              name="partTypeDescr"
                                                            />
                                                          </Form.Group>
                                                        </Col>
                                                      ) : null}
                                                    </Row>
                                                    <Row className="mx-3 my-4">
                                                      <Col>
                                                        <Label notify="true">
                                                          Quality
                                                        </Label>
                                                        <Form.Group>
                                                          <Select
                                                            className="mt-1"
                                                            name="quality2016"
                                                            type="select"
                                                            placeholder="Select"
                                                            styles={
                                                              customStyles
                                                            }
                                                            value={
                                                              partType2016Quality
                                                                ? {
                                                                  label:
                                                                    partType2016Quality,
                                                                  value:
                                                                    partType2016Quality,
                                                                }
                                                                : values.quality2016
                                                            }
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                              setFieldValue(
                                                                "quality2016",
                                                                e.value
                                                              );
                                                              setPartType2016Quality(
                                                                e.value
                                                              );
                                                              getFRP2016Value(
                                                                e
                                                              );
                                                            }}
                                                            options={
                                                              qualityOptions
                                                            }
                                                          />
                                                          <ErrorMessage
                                                            className="error text-danger"
                                                            component="span"
                                                            name="quality2016"
                                                          />
                                                        </Form.Group>
                                                      </Col>
                                                    </Row>
                                                    {partType2016Nprd?.value &&
                                                      partType2016Descr?.value &&
                                                      !rowClicked ? (
                                                      <div className="mt-3 p-2">
                                                        <ThemeProvider
                                                          theme={tableTheme}
                                                        >
                                                          <MaterialTable
                                                            title="Manual Library Records"
                                                            columns={columns}
                                                            data={data}
                                                            icons={tableIcons}
                                                            // parentChildData={(row, rows) =>
                                                            //   rows.find((a) => a.id === row.productId)
                                                            // }
                                                            options={{
                                                              actionsColumnIndex:
                                                                -1,
                                                              addRowPosition:
                                                                "last",
                                                              headerStyle: {
                                                                backgroundColor:
                                                                  "#cce6ff",
                                                                fontWeight:
                                                                  "bold",
                                                                zIndex: 0,
                                                              },
                                                              defaultExpanded: true,
                                                              rowStyle,
                                                            }}
                                                            onRowClick={(
                                                              event,
                                                              rowData
                                                            ) => {
                                                              setPredicted(
                                                                rowData?.FR
                                                              );
                                                              setSelectedNprdFR(
                                                                rowData
                                                              );
                                                              setPartType2016Quality(
                                                                rowData?.Quality
                                                              );
                                                              setPartType2016Nprd(
                                                                {
                                                                  label:
                                                                    rowData?.PartTypeTxt,
                                                                  value:
                                                                    rowData?.PartTypeId,
                                                                }
                                                              );
                                                              setPartType2016Descr(
                                                                {
                                                                  label:
                                                                    rowData?.PartDescrFull,
                                                                  value:
                                                                    rowData?.PartDescrId,
                                                                }
                                                              );
                                                              setFR(
                                                                rowData?.FR
                                                              );
                                                            }}
                                                            localization={{
                                                              body: {
                                                                emptyDataSourceMessage:
                                                                  "No records to display for this partType and Environment Please Select Anyother partType",
                                                              },
                                                            }}
                                                          />
                                                        </ThemeProvider>
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )}
                                              </Card>
                                              <div className="d-flex flex-direction-row justify-content-end m-2">
                                                <Button
                                                  className="delete-cancel-btn me-2"
                                                  variant="outline-secondary"
                                                  type="reset"
                                                  onClick={(e) => {
                                                    setNprd2016Model(false);
                                                  }}
                                                >
                                                  CANCEL
                                                </Button>
                                                <Button
                                                  className="save-btn"
                                                  type="button"
                                                  disabled={
                                                    !productId &
                                                    values.partTypeDescr &
                                                    values.partTypeNprd &
                                                    values.quality
                                                  }
                                                  onClick={(e) => {
                                                    if (
                                                      partType2016Nprd &&
                                                      partType2016Descr
                                                    ) {
                                                      setNprd2016Model(false);
                                                      toast.success(
                                                        "FR Selected"
                                                      );
                                                    }
                                                    setPartType2016Nprd();
                                                    setPartType2016Descr();
                                                    setPartType2016Quality();
                                                    setFR();
                                                    setRowClicked();
                                                    setNprd2016Model(
                                                      !nprd2016Model
                                                    );
                                                  }}
                                                >
                                                  CALCULATE FR
                                                </Button>
                                              </div>
                                            </div>
                                          </form>
                                        );
                                      }}
                                    </Formik>
                                  </Modal>
                              <div className="Mil" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
  <Modal
    show={showModal}
    onHide={() => setShowModal(false)}
    centered
    size="xl" 
    dialogClassName="fixed-width-modal" 
    backdrop="static"
    contentClassName="modal-content-wrapper" 
  >
                                    <Modal.Body className="p-0">
                                      {" "}
                                      {/* Remove default padding */}    
                                       <div className="modal-content" style={{ width: "100%", maxWidth: "1200px" }}>
                                        {/* Improved Close Button */}
                                        <div className="text-center mt-1">
                                          <h3 className="modal-title ">
                                            <strong>MIL-HDBK-217F</strong>
                                          </h3>

                                          <FontAwesomeIcon
                                            icon={faCircleXmark}
                                            fontSize={"40px"}
                                            color="#1D5460"
                                            onClick={() => {
                                              const savedResult =
                                                localStorage.getItem(
                                                  "milValue"
                                                );
                                              if (savedResult) {
                                                let result =
                                                  JSON.parse(savedResult);
                                                result =
                                                  Math.floor(result * 1000000) /
                                                  1000000;
                                                setPredicted(result);
                                                formik.setFieldValue(
                                                  "predicted",
                                                  result
                                                );
                                              }
                                              setShowModal(false);
                                            }}
                                            className="close-icon"
                                          />
                                        </div>

                                        <div className="classical-group mb-2">
                                          {/* Component Type Selector */}
                                          <div className="form-group">
                                            <label>
                                              <strong>Component Type:</strong>
                                            </label>
                                            <Select
                                              styles={{
                                                ...customStyles,
                                                control: (base) => ({
                                                  ...base,
                                                  minHeight: "50px",
                                                  fontSize: "1rem",
                                                }),
                                              }}
                                              name="type"
                                              placeholder="Select component type..."
                                              value={
                                                currentComponent.type
                                                  ? {
                                                    value:
                                                      currentComponent.type,
                                                    label:
                                                      currentComponent.type,
                                                  }
                                                  : null
                                              }
                                              onChange={(selectedOption) => {
                                                localStorage.removeItem(
                                                  "milValue"
                                                );
                                                setCurrentComponent({
                                                  ...currentComponent,
                                                  type: selectedOption.value,
                                                });
                                              }}
                                              options={[
                                                {
                                                  value: "Capacitor",
                                                  label: "Capacitor",
                                                },
                                                {
                                                  value: "Connections",
                                                  label: "Connections",
                                                },
                                                {
                                                  value: "Connectors",
                                                  label: "Connectors",
                                                },
                                                {
                                                  value:
                                                    "Discrete Semiconductor",
                                                  label:
                                                    "Discrete Semiconductor",
                                                },
                                                {
                                                  value: "Electronic Filters",
                                                  label: "Electronic Filters",
                                                },
                                                {
                                                  value: "Fuses",
                                                  label: "Fuses",
                                                },
                                                {
                                                  value: "Interconnection",
                                                  label: "Interconnection",
                                                },
                                                {
                                                  value: "Inductive",
                                                  label: "Inductive",
                                                },

                                                {
                                                  value: "Lamps",
                                                  label: "Lamps",
                                                },
                                                {
                                                  value: "Laser",
                                                  label: "Laser",
                                                },
                                                {
                                                  value: "Meters",
                                                  label: "Meters",
                                                },
                                                {
                                                  value: "Microcircuits",
                                                  label: "Microcircuits",
                                                },
                                                {
                                                  value: "Miscellaneous",
                                                  label: "Miscellaneous",
                                                },
                                                {
                                                  value: "Quartz",
                                                  label: "Quartz",
                                                },
                                                {
                                                  value: "Resistor",
                                                  label: "Resistor",
                                                },

                                                {
                                                  value: "Relay",
                                                  label: "Relay",
                                                },
                                                {
                                                  value: "Rotating Device",
                                                  label: "Rotating Device",
                                                },
                                                {
                                                  value: "Switches",
                                                  label: "Switches",
                                                },
                                                {
                                                  value: "Tubes",
                                                  label: "Tubes",
                                                },
                                              ]}
                                              className="mt-2"
                                            />
                                          </div>

                                          {/* Dynamic Component Render */}
                                          <div className="component-container mt-4">
                                            {currentComponent.type ===
                                              "Microcircuits" && (
                                                <MicrocircuitsCalculation
                                                  onCalculate={(value,handleSawCalculation) => {
                                                    // Round the value to 6 decimal places
                                                    console.log(value, "microcircuit value......",typeof(value))
                                                    const numberValue = parseFloat(value);
                                                    const roundedValue = !isNaN(numberValue)
                                                      ? parseFloat(numberValue.toFixed(6))
                                                      : 0;
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                               
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Relay" && (
                                                <Relay
                                                  onCalculate={(value) => {
                                                    // Round the value to 4 decimal places
                                                    const roundedValue =
                                                      Math.floor(
                                                        value * 1000000
                                                      ) / 1000000;
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Rotating Device" && (
                                                <RotatingDevice
                                                  onCalculate={(value) => {
                                                    // Round the value to 4 decimal places
                                                    const roundedValue =
                                                      Math.floor(
                                                        value * 1000000
                                                      ) / 1000000;
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Switches" && (
                                                <Switches
                                                  onCalculate={(value) => {
                                                    // Round the value to 4 decimal places
                                                    const roundedValue =
                                                      Math.floor(
                                                        value * 1000000
                                                      ) / 1000000;
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Resistor" && (
                                                <ResistorCalculation
                                                // onCalculate={(value) => {
                                                //   const roundedValue = Math.floor(value * 10000) / 10000;
                                                //   formik.setFieldValue("predicted", roundedValue);
                                                //   setShowModal(false);
                                                // }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Capacitor" && (
                                                <CapacitorCalculation
                                                  onCalculate={(failureRate) => {
                                                    // Round to 6 decimal places
                                                    const roundedValue =
                                                      parseFloat(
                                                        failureRate.toFixed(6)
                                                      );
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Inductive" && (
                                                <InductiveCalculation
                                                  onCalculate={(value) => {
                                                    // Round the value to 4 decimal places
                                                    const roundedValue =
                                                      Math.floor(
                                                        value * 1000000
                                                      ) / 1000000;
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal after calculation
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Connections" && (
                                                <ConnectionCalculation
                                                  onCalculate={(failureRate) => {
                                                    // Round to 6 decimal places
                                                    const roundedValue =
                                                      parseFloat(
                                                        failureRate.toFixed(6)
                                                      );
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Lamps" && (
                                                <Lamps
                                                  onCalculate={(failureRate) => {
                                                    if (failureRate !== null) {
                                                      // Round to 4 decimal places
                                                      const roundedValue =
                                                        Math.floor(
                                                          failureRate * 1000000
                                                        ) / 1000000;
                                                      // Update the predicted field
                                                      setPredicted(roundedValue);
                                                      formik.setFieldValue(
                                                        "predicted",
                                                        roundedValue
                                                      );
                                                      // Optionally close the modal
                                                      // setShowModal(false);
                                                    }
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Quartz" && (
                                                <Quartz
                                                  onCalculate={(value) => {
                                                    if (value !== null) {
                                                      // Round the value to 4 decimal places
                                                      const roundedValue =
                                                        Math.floor(
                                                          value * 1000000
                                                        ) / 1000000;
                                                      setPredicted(roundedValue);
                                                      formik.setFieldValue(
                                                        "predicted",
                                                        roundedValue
                                                      );
                                                      // Optionally close the modal after calculation
                                                      // setShowModal(false);
                                                    }
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Laser" && (
                                                <Laser
                                                  onCalculate={(value) => {
                                                    // Round the value to 4 decimal places
                                                    const roundedValue =
                                                      Math.floor(
                                                        value * 1000000
                                                      ) / 1000000;
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Electronic Filters" && (
                                                <ElectronicFilters
                                                  onCalculate={(value) => {
                                                    // Round the value to 4 decimal places
                                                    const roundedValue =
                                                      Math.floor(
                                                        value * 1000000
                                                      ) / 1000000;
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Fuses" && (
                                                <Fuses
                                                  onCalculate={(failureRate) => {
                                                    if (failureRate !== null) {
                                                      // Round to 4 decimal places
                                                      const roundedValue =
                                                        Math.floor(
                                                          failureRate * 1000000
                                                        ) / 1000000;
                                                      // Update the predicted field
                                                      setPredicted(roundedValue);
                                                      formik.setFieldValue(
                                                        "predicted",
                                                        roundedValue
                                                      );
                                                      // Optionally close the modal
                                                      // setShowModal(false);
                                                    }
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Meters" && (
                                                <Meters
                                                  onCalculate={(value) => {
                                                    if (value !== null) {
                                                      // Round the value to 4 decimal places
                                                      const roundedValue =
                                                        Math.floor(
                                                          value * 1000000
                                                        ) / 1000000;
                                                      setPredicted(roundedValue);
                                                      formik.setFieldValue(
                                                        "predicted",
                                                        roundedValue
                                                      );
                                                      // Optionally close the modal after calculation
                                                      // setShowModal(false);
                                                    }
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Connectors" && (
                                                <Connectors
                                                  onCalculate={(value) => {
                                                    // Round the value to 6 decimal places
                                                    const roundedValue =
                                                      parseFloat(
                                                        value.toFixed(6)
                                                      );
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Discrete Semiconductor" && (
                                                <Diode
                                                  onCalculate={(value) => {
                                                    // Round the value to 6 decimal places
                                                    const roundedValue =
                                                      parseFloat(
                                                        value.toFixed(6)
                                                      );
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Tubes" && (
                                                <Tubes
                                                  onCalculate={(value) => {
                                                    // Round the value to 6 decimal places
                                                    const roundedValue =
                                                      parseFloat(
                                                        value.toFixed(6)
                                                      );
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Interconnection" && (
                                                <Interconnection
                                                  onCalculate={(value) => {
                                                    // Round the value to 6 decimal places
                                                    const roundedValue =
                                                      parseFloat(
                                                        value.toFixed(6)
                                                      );
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                            {currentComponent.type ===
                                              "Miscellaneous" && (
                                                <MiscellaneousPartsCalculator
                                                  onCalculate={(value) => {
                                                    // Round the value to 6 decimal places
                                                    const roundedValue =
                                                      parseFloat(
                                                        value.toFixed(6)
                                                      );
                                                    // Update the predicted field
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue(
                                                      "predicted",
                                                      roundedValue
                                                    );
                                                    // Optionally close the modal
                                                    // setShowModal(false);
                                                  }}
                                                />
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    </Modal.Body>
                                  </Modal>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                        {/* <Col>
                        <div className="mttr-sec ">
                          <p className=" mb-0 para-tag">Tree</p>
                        </div>
                        <div className="row mt-3">
                          <div className="col ">
                            <Tree data={treeTableData} />
                          </div>
                        </div>
                      </Col> */}
                      </Row>
                    </fieldset>
                  </Form>
                </div>
              );
            }}
          </Formik>
        </div>
      ) : (
        <div>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">Access Denied</Card.Title>
              <Card.Text>
                <p className="text-center">
                  You dont have permission to access these sections
                  <br />
                  Contact admin to get permission or go back to project list
                  page
                </p>
              </Card.Text>
              <Button
                variant="primary"
                className="save-btn fw-bold pbs-button-1"
                onClick={history.goBack}
              >
                Go Back
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}
    </Container>
  );
}

export default Index;
