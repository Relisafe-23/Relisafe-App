import React, { useRef } from "react";
import { Button, Form, Image, Card } from "react-bootstrap";
import { Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import Label from "../../components/LabelComponent";
import "../../css/PBS.scss";
import Select from "react-select";
import { customStyles } from "../../components/core/select";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal, Button as Btn } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import Api from "../../Api";
import { useModal } from "../ModalContext";
import andGate from "../core/Images/andGate.png";
import orGate from "../core/Images/orGate.png";
import Tooltip from "@mui/material/Tooltip";
import { fa4 } from "@fortawesome/free-solid-svg-icons";

export default function RenderNode({
  node,
  parNod,
  handleAdd,
  handleEdit,
  getFTAData,
  projectId,
  productData,
  selectedNodeId,
  setSelectedNodeId,
    calculationResults, // This is already here
  calculationMode,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNode, setNewNode] = useState({});
  const [totalNoOfGate, setTotalNoOfGate] = useState();
  const [type, setType] = useState("add");
  const [activeNodeData, setActiveNodeData] = useState([]);
  const [modal2Open, setModal2Open] = useState(false);
  const [isEventModal, setIsEventModal] = useState(false);
  const [isProductName, setIsProductName] = useState(node?.isProducts);
  const [isFailureMode, setIsFailureMode] = useState(node?.isFailureMode);
  const [showFrRate, setShowFrRate] = useState(node?.fr);
  const [isFRtrigger, setIsFRtrigger] = useState(false);
  const [eventData, setEventData] = useState({
    name: node?.name,
    description: node?.description,
    calcTypes: node?.calcTypes,
    isP: node?.isP,
    fr: node?.fr,
    mttr: node?.mttr,
    isT: node?.isT,
    eventMissionTime: node?.eventMissionTime,
  });
  const isSteadyStateMode = () => {
    console.log(calculationMode,'calculationMode')
    return calculationMode === "Steady-state mean unavailability Q";
  };
  
  const isUnavailabilityMode = () => {
    return calculationMode === "Unavailability at time t Q(t)";
  };


  const nodeResult = calculationResults?.find(
  result => result.name === node?.name || result.name === `Gate ${node?.gateId}`
);

// Use the calculated value if available, otherwise use node.qn
const displayValue = nodeResult?.calculatedValue || node?.qn;

  const [onChangeEventName, setOnChangeEventName] = useState();
  const [onChangeEventDescription, setOnChangeEventDescription] = useState();
  const [onChangeEventCalcTypes, setOnChangeEventCalcTypes] = useState();
  const [onChangeEventIsP, setOnChangeEventIsP] = useState();
  const [onChangeEventFR, setOnChangeEventFR] = useState();
  const [onChangeEventMTTR, setOnChangeEventMTTR] = useState();
  const [onChangeEventIsT, setOnChangeEventIsT] = useState();
  const [onChangeEventEventMissionTime, setOnChangeEventEventMissionTime] = useState();
  const [FMECAdata, setFMECAdata] = useState([]);

  const formikRef = useRef(null);

  const isActive = selectedNodeId === node?.gateId;

  const [chartData, setChartData] = useState([]);
  const [calcTypes, setCalcTypes] = useState();

  const {
    closeEditGateModal,
    isOpenChildModal,
    closeChildCreateModal,
    isChildCreate,
    closeChildEvent,
    isEventModalOpen,
    isDeleteNode,
    closeDeleteNode,
    openProbabilityCalculations,
    closeProbabilityCalculations,
    isProbOpen,
    isPropertiesModal
  } = useModal();

  const shouldShowGate = () => {
    return node?.children?.length > 0 && (node?.gateType === "AND" || node?.gateType === "OR");
  };

  // Function to check if node should be highlighted in yellow
  const shouldHighlightYellow = () => {
    // Highlight nodes with specific gate IDs or based on your criteria
    const yellowGateIds = ["COMM-GF-1", "COMM-GF-2", "COMM-GF-1-1", "ALTERNATIVE TRANSMITTER FAILURE"];
    return yellowGateIds.includes(node?.gateId) || node?.highlightYellow;
  };

  const handleClick = () => {
    setSelectedNodeId(isActive ? null : node?.gateId);
    closeEditGateModal();
    closeChildCreateModal();
    closeChildEvent();
    
    Api.get(`/api/v1/FTA/get/child/${projectId}/${node?.parentId}`, {
      params: {
        targetIndexCount: node?.indexCount,
      },
    }).then((res) => {
      const data = res?.data;
      setActiveNodeData(data);
    }).catch((error) => {
      console.log(error)
    })

    handleAdd(node, newNode);

    const convertNumber = parseInt(node?.indexCount);
    const companyId = localStorage.getItem("companyId");
    Api.get(`/api/v1/FTA/gatecount/${projectId}/${companyId}`, {
      params: {
        count: convertNumber,
      },
    }).then((res) => {
      const totalGateNumber = res?.data?.gateId[0].totalGateId;
      setTotalNoOfGate(totalGateNumber);
    });

    const sendDataToModalContext = {
      projId: projectId,
      childId: node?.id,
      tableParentId: node?.indexCount === 1 ? node?.parentId : null,
      nodeActive: isActive ? false : true,
      indexCount: node?.indexCount,
    };

    closeDeleteNode(sendDataToModalContext);
  };

  if (!node) {
    return <h1>No data found</h1>;
  }

  const validate = Yup.object().shape({
    gateType: Yup.object().required("Gate Type is Required"),
    name: Yup.string().required("Name is Required"),
    description: Yup.string().required("Description is Required"),
    gateId: Yup.string().required("Gate Id is Required"),
  });

  const eventValidate = Yup.object().shape({
    name: Yup.string().required("Name is Required"),
    description: Yup.string().required("Description is Required"),
    calcTypes: Yup.object().required("Calc.Type is Required"),
    isProducts: Yup.object().required("Product is Required"),
  });

  const handleCancel = () => {
    closeProbabilityCalculations();
    setIsModalOpen(false);
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
    setIsModalOpen(false);
    closeEditGateModal();
    closeChildCreateModal();
    closeChildEvent();
    setIsEventModal(false);
    setModal2Open(false);
    setIsFRtrigger(false);
  };

  const convertNumber = parseInt(node?.indexCount);

  const childNodeSubmit = (values, { resetForm }) => {
    const companyId = localStorage.getItem("companyId");
    Api.post("/api/v1/FTA/create/child/node", {
      companyId: companyId,
      projectId: projectId,
      parentId: node?.id,
      gateType: values.gateType.value,
      name: values.name,
      description: values.description,
      gateId: values.gateId,
      indexCount: convertNumber,
      productCount: node?.indexCount,
      isEvent: false,
    }).then((res) => {
      setIsModalOpen(false);
      closeEditGateModal();
      closeChildCreateModal();
      closeChildEvent();
      getFTAData();
      resetForm({ values: "" });
      toast("Child Node Created Successfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "success",
      });
    });
  };

  const updateFTA = (values) => {
    if (node?.indexCount === 1) {
      Api.patch(`/api/v1/FTA/update/property/${node?.parentId}`, {
        productId: node?.id,
        gateType: values.gateType.value,
        name: values.name,
        description: values.description,
        gateId: values.gateId,
        calcTypes: node?.calcTypes,
        missionTime: node?.missionTime,
      }).then((res) => {
        setIsModalOpen(false);
        getFTAData();
        closeEditGateModal();
        setIsFRtrigger(false);
        toast("Child Node Updated Successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          type: "success",
        });
      });
    } else {
      const projId = projectId;
      const childId = newNode?.id;
      Api.put(`/api/v1/FTA/update/${projId}/${childId}`, {
        gateType: node?.isEvent ? values.gateType : values.gateType.value,
        name: values.name,
        description: values.description,
        gateId: values.gateId ? values.gateId : node?.gateId,
        calcTypes: values?.calcTypes?.value,
        isProducts: values?.isProducts,
        fr: values?.calcTypes?.value === "Constant Probability" ? null : values?.fr,
        eventMissionTime:
          values?.calcTypes?.value === "Constant Probability" ||
            values?.calcTypes?.value === "Evident, P=λ*t" ||
            values?.calcTypes?.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)" ||
            values?.calcTypes?.value === "Repairable" ||
            values?.calcTypes?.value === "Latent, P=λ*T" ||
            values?.calcTypes?.value === "Latent, P=λ*T/2" ||
            values?.calcTypes?.value === "Latent,Life-time, P=1-e^(-λ*T)" ||
            values?.calcTypes?.value === "Latent repairable"
            ? null
            : values?.eventMissionTime,
        mttr:
          values?.calcTypes?.value === "Constant Probability" ||
            values?.calcTypes?.value === "Const.mission time, P=λ*tm" ||
            values?.calcTypes?.value === "Evident, P=λ*t" ||
            values?.calcTypes?.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)" ||
            values?.calcTypes?.value === "Latent, P=λ*T" ||
            values?.calcTypes?.value === "Latent, P=λ*T/2" ||
            values?.calcTypes?.value === "Latent,Life-time, P=1-e^(-λ*T)"
            ? null
            : values?.mttr,
        isP:
          values?.calcTypes?.value === "Const.mission time, P=λ*tm" ||
            values?.calcTypes?.value === "Evident, P=λ*t" ||
            values?.calcTypes?.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)" ||
            values?.calcTypes?.value === "Repairable" ||
            values?.calcTypes?.value === "Latent, P=λ*T" ||
            values?.calcTypes?.value === "Latent, P=λ*T/2" ||
            values?.calcTypes?.value === "Latent,Life-time, P=1-e^(-λ*T)" ||
            values?.calcTypes?.value === "Latent repairable"
            ? null
            : values?.isP,
        isT:
          values?.calcTypes?.value === "Constant Probability" ||
            values?.calcTypes?.value === "Const.mission time, P=λ*tm" ||
            values?.calcTypes?.value === "Evident, P=λ*t" ||
            values?.calcTypes?.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)" ||
            values?.calcTypes?.value === "Repairable"
            ? null
            : values?.isT,
      }).then((res) => {
        setIsModalOpen(false);
        getFTAData();
        closeEditGateModal();
        closeChildEvent();
        closeChildCreateModal();
        setIsEventModal();
        setIsFRtrigger(false);
        toast("Child Node Updated Successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          type: "success",
        });
      });
    }
  };

  const eventSubmit = (values, { resetForm }) => {
    const companyId = localStorage.getItem("companyId");
    Api.post("/api/v1/FTA/create/child/node", {
      companyId: companyId,
      projectId: projectId,
      parentId: node?.id,
      name: values.name,
      description: values.description,
      indexCount: convertNumber,
      productCount: node?.indexCount,
      gateId: values.gateId,
      calcTypes: values.calcTypes.value,
      isProducts: values.isProducts.label ? values.isProducts.label : isProductName.label,
      isEvent: true,
      fr: values.calcTypes.value === "Constant Probability" ? null : values.fr,
      eventMissionTime:
        values.calcTypes.value === "Constant Probability" ||
          values.calcTypes.value === "Evident, P=λ*t" ||
          values.calcTypes.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)" ||
          values.calcTypes.value === "Repairable" ||
          values.calcTypes.value === "Latent, P=λ*T" ||
          values.calcTypes.value === "Latent, P=λ*T/2" ||
          values.calcTypes.value === "Latent,Life-time, P=1-e^(-λ*T)" ||
          values.calcTypes.value === "Latent repairable"
          ? null
          : values.eventMissionTime,
      mttr:
        values.calcTypes.value === "Constant Probability" ||
          values.calcTypes.value === "Const.mission time, P=λ*tm" ||
          values.calcTypes.value === "Evident, P=λ*t" ||
          values.calcTypes.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)" ||
          values.calcTypes.value === "Latent, P=λ*T" ||
          values.calcTypes.value === "Latent, P=λ*T/2" ||
          values.calcTypes.value === "Latent,Life-time, P=1-e^(-λ*T)"
          ? null
          : values.mttr,
      isP:
        values.calcTypes.value === "Const.mission time, P=λ*tm" ||
          values.calcTypes.value === "Evident, P=λ*t" ||
          values.calcTypes.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)" ||
          values.calcTypes.value === "Repairable" ||
          values.calcTypes.value === "Latent, P=λ*T" ||
          values.calcTypes.value === "Latent, P=λ*T/2" ||
          values.calcTypes.value === "Latent,Life-time, P=1-e^(-λ*T)" ||
          values.calcTypes.value === "Latent repairable"
          ? null
          : values.isP,
      isT:
        values.calcTypes.value === "Constant Probability" ||
          values.calcTypes.value === "Const.mission time, P=λ*tm" ||
          values.calcTypes.value === "Evident, P=λ*t" ||
          values.calcTypes.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)" ||
          values.calcTypes.value === "Repairable"
          ? null
          : values.isT,
    }).then((res) => {
      setIsEventModal(false);
      closeEditGateModal();
      closeChildCreateModal();
      closeChildEvent();
      getFTAData();
      setIsFRtrigger(false);
      resetForm({ values: "" });


      toast("Event Node Created Successfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "success",
        
      });
    });
  };

  const addGateCount = totalNoOfGate + 1;

  const handleAddNode = (type, isEvent) => {
    setSelectedNodeId(null);
    const convertNumber = parseInt(node?.indexCount);
    const companyId = localStorage.getItem("companyId");
    Api.get(`/api/v1/FTA/gatecount/${projectId}/${companyId}`, {
      params: {
        count: convertNumber,
      },
    }).then((res) => {
      const totalGateNumber = res?.data?.gateId[0].totalGateId;
      setTotalNoOfGate(totalGateNumber);
    });
    if (isEvent === "isEvent" || isEvent === "isEventEdit") {
      setIsEventModal(true);
    } else {
      setIsModalOpen(true);
    }
    if (type === "add") {
      setType("add");
      setNewNode({});
    } else {
      setType("modify");
      setNewNode(node);
    }
    const sendDataToModalContext = {
      projId: projectId,
      childId: node?.id,
      tableParentId: node?.indexCount === 1 ? node?.parentId : null,
      nodeActive: false,
      indexCount: node?.indexCount,
    };

    closeDeleteNode(sendDataToModalContext);
  };

  const confirm = (event) => {
    Modal.confirm({
      title:
        node?.indexCount === 1 ? (
          <span>
            Are you sure you want to <span style={{ color: "red" }}>Delete Parent</span>?
          </span>
        ) : (
          "Are you sure you want to Delete"
        ),
      icon: <ExclamationCircleOutlined />,
      okText: "Ok",
      cancelText: "Cancel",
      onOk: () => {
        deleteFTAnodes(node);
      },
    });
  };

  const deleteFTAnodes = () => {
    const projId = projectId;
    const childId = node?.id;
    Api.delete(`/api/v1/FTA/delete/${projId}/${childId}`, {
      params: {
        tableParentId: node?.indexCount === 1 ? node?.parentId : null,
      },
    }).then((res) => {
      getFTAData();
      toast(res?.data?.status === "Child Deleted" ? "Deleted Successfully" : "Parent Deleted Successfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "warning",
      });
    });
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    setModal2Open(true);
  };

const eventFields = [
  { value: "Probability", label: "Probability" },
  { value: "Frequency", label: "Frequency" },
  { value: "Constant mission time", label: "Constant mission time" },
  { value: "Repairable", label: "Repairable" },
  { value: "Unrepairable", label: "Unrepairable" },
  { value: "Periodical tests", label: "Periodical tests" },
  { value: "Latent", label: "Latent" },
  { value: "Average probability per mission hour", label: "Average probability per mission hour" },
  { value: "Periodical Tests #2", label: "Periodical Tests #2" },
];


  const handleGetFRapi = (e) => {
    const companyId = localStorage.getItem("companyId");
    const productId = e.value.id;
    const treeStructureId = e.value.parentId;
    Api.get(`/api/v1/FTA/get/frRate/${projectId}/${productId}/${treeStructureId}/${companyId}`).then((res) => {
      const data = res?.data?.getFRdata;
      setShowFrRate(data?.frpRate);
    });
  };

  const getProductData = (productId) => {
    const userId = localStorage.getItem("userId");
    Api.get("/api/v1/fmeca/product/list", {
      params: {
        projectId: projectId,
        productId: productId,
        userId: userId,
      },
    }).then((res) => {
      setFMECAdata(res?.data?.data);
    });
  };

  const handleProbabilityUpdate = (values) => {
    if (node?.indexCount === 1) {
      Api.patch(`/api/v1/FTA/update/property/${node?.parentId}`, {
        productId: node?.id,
        name: values.name,
        description: values.description,
        calcTypes: values.calcTypes.value,
        missionTime: values.missionTime,
        gateType: node?.gateType,
        gateId: values.gateId,
      }).then((res) => {
        setIsModalOpen(false);
        getFTAData();
        closeProbabilityCalculations();
        toast("Probability Calculation Updated Successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          type: "success",
        });
      });
    } else {
      Api.put(`/api/v1/FTA/update/${projectId}/${node?.id}/${node?.parentId}`, {
        name: values.name,
        description: values.description,
        calcTypes: values.calcTypes.value,
        missionTime: values.missionTime,
        gateType: node?.gateType,
        gateId: values.gateId,
      }).then((res) => {
        setIsModalOpen(false);
        getFTAData();
        closeProbabilityCalculations();
        toast("Probability Calculation Updated Successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          type: "success",
        });
      });
    }
  };

  // Function to get node styles based on type and highlight status
  const getNodeStyles = () => {
    const baseStyles = {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    };

    // Apply yellow highlight if needed
    const backgroundColor = shouldHighlightYellow() ? "#ffff99" : "#fff";
    
    if (node?.isEvent) {
      return {
      //   ...baseStyles,
      // backgroundColor: shouldHighlightYellow() ? "#ffff99" : "#ffffff",
      //   border: "1px solid #00a9c9",
      //    borderRadius: "0px",
      //    marginBottom: "0.1px",
      //   alignItems: "center",
      //   justifyContent: "flex-start", 
      //   padding: "5px"
              border: "2px solid #00a9c9",
              borderRadius: "5px",
              marginBottom: "0.1px",
      };
    } else if (shouldShowGate()) {
      return {
        ...baseStyles,
        backgroundColor,
        border: "2px solid #00a9c9",
        borderRadius: "5px",
      };
    } else {
      return {
        ...baseStyles,
        backgroundColor,
        border: "2px solid #00a9c9",
        borderRadius: "5px",
      };
    }
  };

  // Format Qn value for display
  const formatQnValue = () => {
    if (node?.qn) {
      return `Qn=${node.qn}`;
    }
    return "";
  };

  return (
    <div>
      <div style={{ height: 140, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            border: isActive ? "2px solid green" : "none",
            margin: "auto",
            width: 160,
            
            height: 120,
            position: 'relative',
          }}
          onContextMenu={handleRightClick}
        >
          <Card
            style={{
              width: "100%",
              margin: "auto",
              height: "100%",
              boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
              border: "none",
               borderRadius: node?.isEvent ? "0" : "0px",
              ...getNodeStyles(),
               overflow: "hidden",
            }}
            className="FTA-card"
            onDoubleClick={() => {
              setModal2Open(false);
              handleAddNode("modify", node?.isEvent ? "isEventEdit" : null);
              setIsFRtrigger(false);
            }}
          >
            <Card.Header
              style={{
                height: "20px",
                display: "flex",
                width: "100%",
                width: node?.isEvent ? "170px" : "100%",
                justifyContent: "center",
                alignItems: "center",
                 marginBottom: node?.isEvent ? "0px" : "0px",
                padding: "2px",
               backgroundColor: "#00a9c9",
                borderRadius: node?.isEvent ? "0px" : "0px",
                color: "#fff",
                 overflow: "hidden",
                fontSize: "10px",
                fontWeight: "bold",
                 boxSizing: "border-box",
                 flexShrink: "100px",
              }}
            >
               <p
    onClick={handleClick}
    style={{
      margin: "0",
      width: "150px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      textAlign: "center",
      lineHeight: "20px", // Match header height
      padding: "0 2px",
      fontSize: "10px",
      color: "#fff",
    }}
  >
              
                {node?.gateId || "GATE"}
              </p>
            </Card.Header>
            
            <Card.Body 
              onClick={handleClick} 
              style={{ 
                padding: "5px", 
                 height: "100%",
                overflow: "hidden",
                cursor: "pointer",
                marginBottom: "20px",
                position: "relative",
                 flex: "1 1 auto",
              }}
            >
              <Tooltip title={node?.description} placement="top">
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: node?.isEvent ? "center" : "center",
                  }}
                >
                  <p
                    style={{
                      margin: "0px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textAlign: node?.isEvent ? "center" : "center",
                    }}
                  >
                    {node?.name || "Event Name"}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      fontSize: "10px",
                      color: "#666",
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {node?.description || "Description"}
                  </p>
                  
                  {/* Display Qn value if available - positioned at bottom right */}
                  {displayValue && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "5px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      {formatQnValue()}
                    </div>
                  )}
                  
             {/* Display calculated value if available */}
{displayValue && (
  <div
    style={{
      marginTop: "2px",
      padding: "2px 6px",
      backgroundColor: "#4caf50",
      color: "white",
      borderRadius: "10px",
      fontSize: "10px",
      fontWeight: "bold",
      alignSelf: "center",
    }}
  >
    {isSteadyStateMode() ? "Q̄ = " : "Q = "}{parseFloat(displayValue).toExponential(4)}
  </div>
)}
{/* Display formula based on calculation mode */}
{!displayValue && node?.isEvent && node?.calcTypes && ( 
    <div style={{ fontSize: "7px", marginTop: "5px", width: "100%", textAlign: "center" }}>
    {/* #1 Probability */}
    {node?.calcTypes === "Probability" && (
      <span>P = {node?.isP || '0'}</span>
    )}
    
    {/* #2 Frequency */}
    {node?.calcTypes === "Frequency" && (
      <span>f = {node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h</span>
    )}
    
    {/* #3 Constant mission time */}
    {node?.calcTypes === "Constant mission time" && (
      <span>Q = 1-(1-{node?.isP || '0'})·e^(-λ·tm), λ={node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h</span>
    )}
    
    {/* #4 Repairable */}
    {node?.calcTypes === "Repairable" && (
      <span>
        {isSteadyStateMode() 
          ? `Q̄ = λ/(λ+μ), λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `Q(t)=q·e^(-(λ+μ)t)+(λ/(λ+μ))[1-e^(-(λ+μ)t)], λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q(t))`
        }
      </span>
    )}
    
    {/* #5 Unrepairable */}
    {node?.calcTypes === "Unrepairable" && (
      <span>
        {isSteadyStateMode()
          ? `Q̄ = 1, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `Q(t) = 1-(1-${node?.isP || '0'})·e^(-λt), λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q(t))`
        }
      </span>
    )}
    
    {/* #6 Periodical tests */}
    {node?.calcTypes === "Periodical tests" && (
      <span>
        {isSteadyStateMode()
          ? `See Table 3, Ti=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `See Table 2, Ti=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q(t))`
        }
      </span>
    )}
    
    {/* #7 Latent */}
    {node?.calcTypes === "Latent" && (
      <span>
        {isSteadyStateMode()
          ? `Q̄ = 1-(1-${node?.isP || '0'})^t·e^(-λ·Ti), Ti=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `Q(t) = 1-(1-${node?.isP || '0'})^t·e^(-λ·Ti), Ti=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q(t))`
        }
      </span>
    )}
    
    {/* #8 Average probability per mission hour */}
    {node?.calcTypes === "Average probability per mission hour" && (
      <span>
        {isSteadyStateMode()
          ? `Q̄ = 1, w(t)=0`
          : `Q = 1-(1-${node?.isP || '0'})^t, w(t)=0`
        }
      </span>
    )}
    
    {/* #9 Periodical Tests #2 */}
    {node?.calcTypes === "Periodical Tests #2" && (
      <span>
        {isSteadyStateMode()
          ? `Algorithm (see Table 1) for Q̄, Ti=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `Algorithm (see Table 1) for Q(t), Ti=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q(t))`
        }
      </span>
    )}
    
    {/* Evident case */}
    {node?.calcTypes === "Evident, P=λ*t" && (
      <span>
        {isSteadyStateMode()
          ? `Q̄ = λ·t, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `Q(t) = λ·t, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q(t))`
        }
      </span>
    )}
    
    {/* Const.mission time case */}
    {node?.calcTypes === "Const.mission time, P=λ*tm" && (
      <span>
        {isSteadyStateMode()
          ? `Q̄ = λ·tm, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=0`
          : `Q = λ·tm, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=0`
        }
      </span>
    )}
    
    {/* Latent cases */}
    {node?.calcTypes === "Latent, P=λ*T" && (
      <span>
        {isSteadyStateMode()
          ? `Q̄ = λ·T, T=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `Q = λ·T, T=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q)`
        }
      </span>
    )}
    
    {node?.calcTypes === "Latent, P=λ*T/2" && (
      <span>
        {isSteadyStateMode()
          ? `Q̄ = λ·T/2, T=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `Q = λ·T/2, T=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q)`
        }
      </span>
    )}
    
    {node?.calcTypes === "Latent,Life-time, P=1-e^(-λ*T)" && (
      <span>
        {isSteadyStateMode()
          ? `Q̄ = 1-e^(-λ·T), T=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `Q = 1-e^(-λ·T), T=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q)`
        }
      </span>
    )}
    
    {node?.calcTypes === "Latent repairable" && (
      <span>
        {isSteadyStateMode()
          ? `Q̄ = (λ/(λ+μ))[1-e^(-(λ+μ)T)], T=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q̄)`
          : `Q = (λ/(λ+μ))[1-e^(-(λ+μ)T)], T=${node?.isT || '0'}h, λ=${node?.fr ? parseFloat(node.fr).toExponential(2) : '0'}/h, w(t)=λ·(1-Q)`
        }
      </span>
    )}
  </div>
)}
                </div>
              </Tooltip>
            </Card.Body>
          </Card>

          {/* Display AND/OR gate image */}
          {shouldShowGate() && (
            <div
              style={{
                position: "absolute",
                bottom: "-25px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                width: node?.gateType === "AND" ? "45px" : "35px",
                height: "25px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "3px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <Image
                src={node?.gateType === "AND" ? andGate : orGate}
                alt={node?.gateType}
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "contain",
                }}
              />
            </div>
          )}

          {/* Special text for COMM-GF-2 node */}
          {node?.gateId === "COMM-GF-2" && (
            <div
              style={{
                position: "absolute",
                top: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "9px",
                fontWeight: "bold",
                color: "#333",
                whiteSpace: "nowrap",
                backgroundColor: "rgba(255,255,255,0.8)",
                padding: "2px 5px",
                borderRadius: "3px",
              }}
            >
              Translate to COMM GF 2
            </div>
          )}

          {/* Connecting line for event nodes */}
{/* Connecting line for event nodes */}

{/* Connecting line for event nodes */}
{node?.isEvent && (
  <div>
    {/* Line connecting to parent */}
    <div style={{ width: "2px", border: "1px solid green", height: "30px", top: "5px", left: "70px" }} />
    
    {/* Sky blue circle - shows the Q value */}
    <div
      style={{
        position: "absolute",
        top: "30px",
        left: "54px",
        backgroundColor: "#00ffff",
        zIndex: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "35px",
        height: "35px",
        borderRadius: "50%",
        color: "white",
        fontSize: "9px",
        fontWeight: "bold",
      }}
    >
      {/* This puts the Q value inside the blue circle */}
       {displayValue ? (
    <span>
      {isSteadyStateMode() ? "Q̄" : "Q"}={parseFloat(displayValue).toExponential(2)}
    </span>
  ) : " "}
</div>
    
    {/* White box below with all the formulas and values */}
  {/* White box below with all the formulas and values */}
{node?.isEvent && (
  <div style={{ 
    position: "absolute",
    top: "70px",
    left: "0",
    fontSize: "8px", 
    width: "160px", 
    textAlign: "center",
    backgroundColor: "white",
    padding: "4px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  }}>
    
    {/* If we have calculated results, show them */}
    {displayValue ? (
      <div>
        <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
          {nodeResult?.formula?.split('|')[0] || node?.calcTypes}
        </div>
        
        {/* Show calculated value */}
        <div style={{ 
          marginTop: "4px", 
          padding: "2px", 
          backgroundColor: "#4caf50", 
          color: "white",
          borderRadius: "3px",
          fontWeight: "bold"
        }}>
          {isSteadyStateMode() ? "Q̄ = " : "Q(t) = "}{parseFloat(displayValue).toExponential(4)}
        </div>
        
        {/* Show frequency if available */}
        {nodeResult?.frequency && nodeResult.frequency !== "0" && (
          <div style={{ 
            marginTop: "2px", 
            padding: "2px", 
            backgroundColor: "#2196f3", 
            color: "white",
            borderRadius: "3px"
          }}>
            w(t) = {nodeResult.frequency}/h
          </div>
        )}
      </div>
    ) : (
      /* If no calculated results, show the formula template */
      <>
        {/* FORMULA - Shows the formula text based on calculation mode */}
        <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
          {/* #1 Probability */}
          {node?.calcTypes === "Probability" && (
            isSteadyStateMode() ? "Q̄ = q, w(t) = 0" : "Q(t) = q, w(t) = 0"
          )}
          
          {/* #2 Frequency */}
          {node?.calcTypes === "Frequency" && (
            isSteadyStateMode() ? "Q̄ = 0, w(t) = f" : "Q(t) = 0, w(t) = f"
          )}
          
          {/* #3 Constant mission time */}
          {node?.calcTypes === "Constant mission time" && (
            isSteadyStateMode() 
              ? "Q̄ = 1-(1-q)·e^(-λ·Tm), w(t) = 0" 
              : "Q(t) = 1-(1-q)·e^(-λ·Tm), w(t) = 0"
          )}
          
          {/* #4 Repairable */}
          {node?.calcTypes === "Repairable" && (
            isSteadyStateMode()
              ? "Q̄ = λ/(λ+μ), w(t)=λ·(1-Q̄)"
              : "Q(t)=q·e^(-(λ+μ)t)+(λ/(λ+μ))[1-e^(-(λ+μ)t)], w(t)=λ·(1-Q(t))"
          )}
          
          {/* #5 Unrepairable */}
          {node?.calcTypes === "Unrepairable" && (
            isSteadyStateMode()
              ? "Q̄ = 1, w(t)=λ·(1-Q̄)"
              : "Q(t) = 1-(1-q)·e^(-λt), w(t)=λ·(1-Q(t))"
          )}
          
          {/* #6 Periodical tests */}
          {node?.calcTypes === "Periodical tests" && (
            isSteadyStateMode()
              ? "See Table 3 for Q̄, w(t)=λ·(1-Q̄)"
              : "See Table 2 for Q(t), w(t)=λ·(1-Q(t))"
          )}
          
          {/* #7 Latent */}
          {node?.calcTypes === "Latent" && (
            isSteadyStateMode()
              ? "Q̄ = 1-(1-q)^t·e^(-λ·Ti), w(t)=λ·(1-Q̄)"
              : "Q(t) = 1-(1-q)^t·e^(-λ·Ti), w(t)=λ·(1-Q(t))"
          )}
          
          {/* #8 Average probability per mission hour */}
          {node?.calcTypes === "Average probability per mission hour" && (
            isSteadyStateMode()
              ? "Q̄ = 1, w(t) = 0"
              : "Q(t) = 1-(1-q)^t, w(t) = 0"
          )}
          
          {/* #9 Periodical Tests #2 */}
          {node?.calcTypes === "Periodical Tests #2" && (
            isSteadyStateMode()
              ? "Algorithm (see Table 1) for Q̄, w(t)=λ·(1-Q̄)"
              : "Algorithm (see Table 1) for Q(t), w(t)=λ·(1-Q(t))"
          )}
          
          {/* Backward compatibility cases */}
          {node?.calcTypes === "Evident, P=λ*t" && (
            isSteadyStateMode()
              ? "Q̄ = λ·t, w(t)=λ·(1-Q̄)"
              : "Q(t) = λ·t, w(t)=λ·(1-Q(t))"
          )}
          
          {node?.calcTypes === "Const.mission time, P=λ*tm" && (
            isSteadyStateMode()
              ? "Q̄ = λ·tm, w(t)=0"
              : "Q(t) = λ·tm, w(t)=0"
          )}
          
          {node?.calcTypes === "Latent, P=λ*T" && (
            isSteadyStateMode()
              ? "Q̄ = λ·T, w(t)=λ·(1-Q̄)"
              : "Q(t) = λ·T, w(t)=λ·(1-Q(t))"
          )}
          
          {node?.calcTypes === "Latent, P=λ*T/2" && (
            isSteadyStateMode()
              ? "Q̄ = λ·T/2, w(t)=λ·(1-Q̄)"
              : "Q(t) = λ·T/2, w(t)=λ·(1-Q(t))"
          )}
          
          {node?.calcTypes === "Latent,Life-time, P=1-e^(-λ*T)" && (
            isSteadyStateMode()
              ? "Q̄ = 1-e^(-λ·T), w(t)=λ·(1-Q̄)"
              : "Q(t) = 1-e^(-λ·T), w(t)=λ·(1-Q(t))"
          )}
          
          {node?.calcTypes === "Latent repairable" && (
            isSteadyStateMode()
              ? "Q̄ = (λ/(λ+μ))[1-e^(-(λ+μ)T)], w(t)=λ·(1-Q̄)"
              : "Q(t) = (λ/(λ+μ))[1-e^(-(λ+μ)T)], w(t)=λ·(1-Q(t))"
          )}
        </div>
        
        {/* PARAMETERS - Shows the actual numbers */}
        <div style={{ textAlign: "left", paddingLeft: "5px", marginTop: "2px" }}>
          {/* Failure Rate λ */}
          {node?.fr && node.fr !== "0" && node.fr !== "-" && (
            <div>λ = {parseFloat(node.fr).toExponential(2)}/h</div>
          )}
          
          {/* Probability q */}
          {node?.isP && node.isP !== "0" && node.isP !== "" && (
            <div>q = {node.isP}</div>
          )}
          
          {/* MTTR */}
          {node?.mttr && node.mttr !== "0" && (
            <div>MTTR = {node.mttr}h, μ = {node.mttr ? (1/parseFloat(node.mttr)).toExponential(2) : '0'}/h</div>
          )}
          
          {/* Test Interval T/Ti */}
          {node?.isT && node.isT !== "0" && (
            <div>T = {node.isT}h</div>
          )}
          
          {/* Mission Time tm */}
          {node?.eventMissionTime && node.eventMissionTime !== "0" && (
            <div>tm = {node.eventMissionTime}h</div>
          )}
        </div>
      </>
    )}
  </div>
)}
  </div>
)}
        </div>
      </div>

      {/* in the below modal for FTA screen card edit connected */}
      <Modal
        title={<p style={{ margin: "0px", color: "#00a9c9", width: '500px' }}>Logic Gate Data</p>}
        open={node?.isEvent ? null : selectedNodeId === node?.gateId && isChildCreate ? isChildCreate : isModalOpen}
        footer={null}
        onCancel={handleCancel}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            gateType:
              selectedNodeId === node?.gateId && isChildCreate
                ? ""
                : type === "modify"
                  ? { label: newNode?.gateType, value: newNode?.gateType }
                  : "",
            name: selectedNodeId === node?.gateId && isChildCreate ? "" : type === "modify" ? newNode?.name : "",
            description:
              selectedNodeId === node?.gateId && isChildCreate ? "" : type === "modify" ? newNode?.description : "",
            gateId:
              selectedNodeId === node?.gateId && isChildCreate
                ? addGateCount
                : type === "modify"
                  ? newNode?.gateId
                  : addGateCount,
          }}
          onSubmit={
            selectedNodeId === node?.gateId && isChildCreate
              ? childNodeSubmit
              : type === "add"
                ? childNodeSubmit
                : updateFTA
          }
          validationSchema={validate}
          innerRef={formikRef}
        >
          {(formik) => {
            const { values, handleChange, handleSubmit, handleBlur, setFieldValue } = formik;
            return (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Label notify={true}>Gate Type</Label>
                  <Select
                    type="select"
                    styles={customStyles}
                    value={values.gateType}
                    name="gateType"
                    placeholder="Select Gate Type"
                    onChange={(e) => {
                      setFieldValue("gateType", { label: e.value, value: e.value });
                    }}
                    onBlur={handleBlur}
                    options={[
                      { value: "AND", label: "AND" },
                      { value: "OR", label: "OR" },
                    ]}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="gateType" />
                  <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                    {values.gateType.value === "AND"
                      ? "AND gate - output event occurs only when all the input events occurs simultaneously"
                      : values.gateType.value === "OR"
                        ? "OR gate - output event occurs if any of the input events occurs"
                        : null}
                  </p>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Name</Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={values.name}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="name" />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Label notify={true}>Description</Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={values.description}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="description" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Gate Id</Label>
                  <Form.Control
                    disabled={true}
                    type="text"
                    name="gateId"
                    placeholder="Gate Id"
                    value={values.gateId}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="gateId" />
                </Form.Group>
                <div className="d-flex justify-content-end mt-4">
                  <Button className="me-2" variant="outline-secondary" type="reset" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedNodeId === node?.gateId && isChildCreate
                      ? "Create"
                      : type === "modify"
                        ? "Save Changes"
                        : "Create"}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      {/* Calculation Probability*/}
      <Modal
        title={<p style={{ margin: "0px", color: "#00a9c9", width: '500px' }}>Calculation Parameter</p>}
        open={isProbOpen}
        footer={null}
        onCancel={handleCancel}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: parNod?.name || "",
            description: parNod?.description || "",
            calcTypes: parNod?.calcTypes
              ? { label: parNod?.calcTypes, value: parNod?.calcTypes }
              : "",
            missionTime: parNod?.missionTime || "",
            gateId: parNod?.gateId || "",
          }}
          onSubmit={(values) => {
            handleProbabilityUpdate(values);
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required("Name is Required"),
            description: Yup.string().required("Description is Required"),
            calcTypes: Yup.object().required("Calc.Types is Required"),
            missionTime: Yup.mixed().when('calcTypes', {
              is: (calcTypes) => calcTypes?.value === "Unavailability at time t Q(t)",
              then: Yup.string().required("Mission time t is required"),
              otherwise: Yup.string().nullable()
            }),
          })}
          innerRef={formikRef}
        >
          {(formik) => {
            const { values, handleChange, handleSubmit, handleBlur, setFieldValue } = formik;
            return (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Label notify={true}>Name</Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={values.name}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="name" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Description</Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={values.description}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="description" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Calc.Types</Label>
                  <Select
                    styles={customStyles}
                    name="calcTypes"
                    type="select"
                    value={values.calcTypes}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      setFieldValue("calcTypes", e);
                      setCalcTypes(e.value);
                    }}
                    options={[
                      {
                        value: "Unavailability at time t Q(t)",
                        label: "Unavailability at time t Q(t)",
                      },
                      {
                        value: "Steady-state mean unavailability Q",
                        label: "Steady-state mean unavailability Q",
                      },
                    ]}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="calcTypes" />
                </Form.Group>

                {values.calcTypes?.value === "Unavailability at time t Q(t)" ? (
                  <Form.Group className="mb-2">
                    <Label notify={true}>Mission time t</Label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Control
                        type="text"
                        name="missionTime"
                        placeholder="Mission time t"
                        value={values.missionTime}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        style={{ width: "80%" }}
                      />
                      <p style={{ margin: "0px", fontWeight: "bold", marginLeft: "20px" }}>( hours)</p>
                    </div>
                    <ErrorMessage className="error text-danger" component="span" name="missionTime" />
                  </Form.Group>
                ) : null}

                <div className="d-flex justify-content-end mt-4">
                  <Button className="me-2" variant="outline-secondary" type="reset" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">Calculation</Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      {/* In the below modal for header nav bar connected */}
      <Modal
        title={<p style={{ margin: "0px", color: "#00a9c9" }}>Logic Gate Data</p>}
        open={!activeNodeData.isEvent ? selectedNodeId === node?.gateId && isOpenChildModal : null}
        footer={null}
        onCancel={handleCancel}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            gateType: { label: activeNodeData?.gateType, value: activeNodeData?.gateType },
            name: activeNodeData?.name,
            description: activeNodeData?.description,
            gateId: activeNodeData?.gateId,
          }}
          onSubmit={updateFTA}
          validationSchema={validate}
          innerRef={formikRef}
        >
          {(formik) => {
            const { values, handleChange, handleSubmit, handleBlur, setFieldValue } = formik;
            return (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Label notify={true}>Gate Type</Label>
                  <Select
                    type="select"
                    styles={customStyles}
                    value={values.gateType}
                    name="gateType"
                    placeholder="Select Gate Type"
                    onChange={(e) => {
                      setFieldValue("gateType", { label: e.value, value: e.value });
                    }}
                    onBlur={handleBlur}
                    options={[
                      { value: "AND", label: "AND" },
                      { value: "OR", label: "OR" },
                    ]}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="gateType" />
                  <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                    {values.gateType.value === "AND"
                      ? "AND gate - output event occurs only when all the input events occurs simultaneously"
                      : values.gateType.value === "OR"
                        ? "OR gate - output event occurs if any of the input events occurs"
                        : null}
                  </p>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Name</Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={values.name}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="name" />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Label notify={true}>Description</Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={values.description}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="description" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Gate Id</Label>
                  <Form.Control
                    disabled={true}
                    type="text"
                    name="gateId"
                    placeholder="Gate Id"
                    value={values.gateId}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="gateId" />
                </Form.Group>
                <div className="d-flex justify-content-end mt-4">
                  <Button className="me-2" variant="outline-secondary" type="reset" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      {/* In the below modal for header nav bar connected to create & edit new event*/}
      <Modal
        title={<p style={{ margin: "0px", color: "#00a9c9", width: '500px' }}>Event Data</p>}
        open={
          node?.isEvent && selectedNodeId === node?.gateId && isOpenChildModal
            ? isOpenChildModal
            : node?.isEvent != true && selectedNodeId === node?.gateId && isEventModalOpen
              ? isEventModalOpen
              : isEventModal
        }
        footer={null}
        onCancel={handleCancel}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: onChangeEventName ? onChangeEventName : node?.isEvent ? eventData?.name : "",
            description: onChangeEventDescription
              ? onChangeEventDescription
              : node?.isEvent
                ? eventData?.description
                : "",
            isProducts: isFRtrigger ? "" : { label: isProductName, value: isProductName },
            calcTypes: onChangeEventCalcTypes
              ? onChangeEventCalcTypes
              : node?.isEvent
                ? { label: eventData?.calcTypes, value: eventData?.calcTypes }
                : "",
            isP: onChangeEventIsP ? onChangeEventIsP : node?.isEvent ? eventData?.isP : "",
            fr: onChangeEventFR ? onChangeEventFR : showFrRate ? showFrRate : "-",
            eventMissionTime: onChangeEventEventMissionTime
              ? onChangeEventEventMissionTime
              : node?.isEvent
                ? eventData?.eventMissionTime
                : "",
            mttr: onChangeEventMTTR ? onChangeEventMTTR : node?.isEvent ? eventData?.mttr : "",
            isT: onChangeEventIsT ? onChangeEventIsT : node?.isEvent ? eventData?.isT : "",
            gateId:
              selectedNodeId === node?.gateId && isEventModalOpen
                ? addGateCount
                : type === "modify"
                  ? newNode?.gateId
                  : addGateCount,
          }}
          onSubmit={node?.isEvent ? updateFTA : eventSubmit}
          validationSchema={eventValidate}
          innerRef={formikRef}
        >
          {(formik) => {
            const { values, handleChange, handleSubmit, handleBlur, setFieldValue } = formik;
            return (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Label notify={true}>Name</Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={values.name}
                    onBlur={handleBlur}
                    onChange={(e) => setOnChangeEventName(e?.target?.value)}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="name" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Description</Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={values.description}
                    onBlur={handleBlur}
                    onChange={(e) => setOnChangeEventDescription(e?.target?.value)}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="description" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Item</Label>
                  <Select
                    type="select"
                    styles={customStyles}
                    value={values.isProducts}
                    name="isProducts"
                    placeholder="Select Item"
                    onChange={(e) => {
                      setIsFRtrigger(false);
                      setIsProductName(`${e.value.indexCount} ${e.value.productName}`);
                      handleGetFRapi(e);
                      getProductData(e.value.id);
                    }}
                    onBlur={handleBlur}
                    options={[
                      {
                        options: productData?.map((list, i) => ({
                          label: `${list.indexCount} ${list.productName}`,
                          value: list,
                        })),
                      },
                    ]}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="isProducts" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Calc. Type</Label>
                  <Select
                    type="select"
                    styles={customStyles}
                    value={values.calcTypes}
                    name="calcTypes"
                    placeholder="Select Calc. Type"
                    onChange={(e) => {
                      setFieldValue("calcTypes", { label: e.value, value: e.value });
                      setOnChangeEventCalcTypes({ label: e.value, value: e.value });
                    }}
                    onBlur={handleBlur}
                    options={eventFields}
                  />
                  <ErrorMessage className="error text-danger" component="span" name="calcTypes" />
                  {values.calcTypes.value === "Constant Probability" ? (
                    <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                      The reliability data represents the probability that the component is not able to perform its
                      function upon request.
                    </p>
                  ) : values.calcTypes.value === "Evident, P=λ*t" ? (
                    <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                      Calculation by equation P=λ*t, where λ – failure rate (1/hour); t – failure exposure time (hours)
                    </p>
                  ) : values.calcTypes.value === "Const.mission time, P=λ*tm" ? (
                    <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                      Calculation by equation P=λ*tm, where λ – failure rate (1/hour); tm – failure exposure time
                      (hours)
                    </p>
                  ) : values.calcTypes.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)" ? (
                    <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                      Calculation by equation P(t) = 1-(1-q)*exp(-λ*t), where λ – failure rate (1/hour); t – failure
                      exposure time (hours)
                    </p>
                  ) : values.calcTypes.value === "Repairable" ? (
                    <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                      Calculation by equation P(t)=(λ/(λ+µ))*[1–exp(-(λ+µ)t)], P=λ/(λ+µ), where λ – failure rate
                      (1/hour); µ - repair rate (1/MTTR) per hour
                    </p>
                  ) : values.calcTypes.value === "Latent, P=λ*T" ? (
                    <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                      Calculation by equation P=λ*T, where λ – failure rate (1/hour); T – Inspection interval (hours)
                    </p>
                  ) : values.calcTypes.value === "Latent, P=λ*T/2" ? (
                    <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                      Calculation by equation P=λ*T/2, where λ – failure rate (1/hour); T – Inspection interval (hours)
                    </p>
                  ) : values.calcTypes.value === "Latent,Life-time, P=1-e^(-λ*T)" ? (
                    <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>
                      Calculation by equation P(t) = 1-e^(-λ*T)/2, where λ – failure rate (1/hour); T – Inspection
                      interval (hours)
                    </p>
                  ) : values.calcTypes.value === "Latent repairable" ? (
                    <p style={{ margin: 0, fontWeight: "normal", color: "#00a9c9", marginTop: "5px" }}>not in use</p>
                  ) : null}
                </Form.Group>                                   

                {values.calcTypes.value === "Constant Probability" ? (
                  <Form.Group className="mb-2">
                    <Label>p</Label>
                    <Form.Control
                      type="text"
                      name="isP"
                      placeholder="0"
                      value={values.isP}
                      onBlur={handleBlur}
                      onChange={(e) => setOnChangeEventIsP(e?.target?.value)}
                    />
                    <ErrorMessage className="error text-danger" component="span" name="isP" />
                  </Form.Group>
                ) : (values.calcTypes.value !== undefined && values.calcTypes.value !== "Constant Probability") ||
                  (values.calcTypes.value !== undefined &&
                    values.calcTypes.value !== "Unrepairable, P=1-(1-q)*exp(-λ*t)") ? (
                  <Form.Group className="mb-2" style={{ width: "95%" }}>
                    <Label>FR</Label>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Form.Control
                        disabled={true}
                        type="text"
                        name="fr"
                        placeholder={
                          values.calcTypes.value === "Evident, P=λ*t" ||
                            values.calcTypes.value === "Const.mission time, P=λ*tm" ||
                            values.calcTypes.value === "Unrepairable, P=1-(1-q)*exp(-λ*t)"
                            ? "FR"
                            : "Code"
                        }
                        value={values.fr}
                        onBlur={handleBlur}
                        onChange={(e) => setOnChangeEventFR(e?.target?.value)}
                      />
                      <p style={{ marginBottom: "0px", fontWeight: "bold", marginLeft: "20px" }}>(failures/hour)</p>
                    </div>
                    <ErrorMessage className="error text-danger" component="span" name="fr" />
                  </Form.Group>
                ) : null}
                {values.calcTypes.value === "Const.mission time, P=λ*tm" ? (
                  <Form.Group className="mb-2" style={{ width: "95%" }}>
                    <Label>tm</Label>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Form.Control
                        type="text"
                        name="eventMissionTime"
                        placeholder="Mission Time"
                        value={values.eventMissionTime}
                        onBlur={handleBlur}
                        onChange={(e) => setOnChangeEventEventMissionTime(e?.target?.value)}
                      />
                      <p style={{ marginBottom: "0px", fontWeight: "bold", marginLeft: "20px" }}>(hours)</p>
                    </div>
                    <ErrorMessage className="error text-danger" component="span" name="eventMissionTime" />
                  </Form.Group>
                ) : null}
                {values.calcTypes.value === "Repairable" || values.calcTypes.value === "Latent repairable" ? (
                  <Form.Group className="mb-2" style={{ width: "95%" }}>
                    <Label>MTTR</Label>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Form.Control
                        type="text"
                        name="mttr"
                        placeholder="0"
                        value={values.mttr}
                        onBlur={handleBlur}
                        onChange={(e) => setOnChangeEventMTTR(e?.target?.value)}
                      />
                      <p style={{ marginBottom: "0px", fontWeight: "bold", marginLeft: "20px" }}>(hours)</p>
                    </div>
                    <ErrorMessage className="error text-danger" component="span" name="mttr" />
                  </Form.Group>
                ) : null}
                {values.calcTypes.value === "Latent, P=λ*T" ||
                  values.calcTypes.value === "Latent, P=λ*T/2" ||
                  values.calcTypes.value === "Latent,Life-time, P=1-e^(-λ*T)" ||
                  values.calcTypes.value === "Latent repairable" ? (
                  <Form.Group className="mb-2" style={{ width: "95%" }}>
                    <Label>T</Label>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Form.Control
                        type="text"
                        name="isT"
                        placeholder="0"
                        value={values.isT}
                        onBlur={handleBlur}
                        onChange={(e) => setOnChangeEventIsT(e?.target?.value)}
                      />
                      <p style={{ marginBottom: "0px", fontWeight: "bold", marginLeft: "20px" }}>(hours)</p>
                    </div>
                    <ErrorMessage className="error text-danger" component="span" name="isT" />
                  </Form.Group>
                ) : null}

                <Form.Group className="mb-2">
                  <Label notify={true}>Failure Mode</Label>
                  <Select
                    type="select"
                    styles={customStyles}
                    value={values.isFailureMode}
                    name="isFailureMode"
                    placeholder="Select Failure Mode"
                    onChange={(e) => setIsFailureMode(e.value)}
                    onBlur={handleBlur}
                    options={[
                      {
                        options: FMECAdata?.map((list, i) => ({
                          label: list?.failureMode,
                          value: list?.failureMode,
                        })),
                      },
                    ]}
                  />7
                  <ErrorMessage className="error text-danger" component="span" name="isProducts" />
                </Form.Group>

                <div className="d-flex justify-content-end mt-4">
                  <Button className="me-2" variant="outline-secondary" type="reset" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">{node?.isEvent ? "Save Changes" : "Create"}</Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      <Modal
        centered
        open={modal2Open}
        onCancel={() => setModal2Open(false)}
        footer={null}
      >
        <Btn
          type="text"
          block
          className="custom-button"
          onClick={() => {
            setModal2Open(false);
            handleAddNode("modify", node?.isEvent ? "isEventEdit" : null);
            setIsFRtrigger(false);
          }}
        >
          <p style={{ fontWeight: "bold", textDecoration: "underline" }}>Edit</p>
        </Btn>
        {!node?.isEvent ? (
          <Btn
            type="text"
            block
            className="custom-button"
            onClick={() => {
              setModal2Open(false);
              handleAddNode("add");
            }}
          >
            <p style={{ fontWeight: "bold", textDecoration: "underline" }}>Add New Logical Gate</p>
          </Btn>
        ) : null}
        {!node?.isEvent ? (
          <Btn
            type="text"
            block
            className="custom-button"
            onClick={() => {
              setModal2Open(false);
              setIsFRtrigger(true);
              handleAddNode("add", "isEvent");
            }}
          >
            <p style={{ fontWeight: "bold", textDecoration: "underline" }}>Add New Event</p>
          </Btn>
        ) : null}
        <Btn
          type="text"
          block
          className="custom-button"
          onClick={() => {
            setModal2Open(false);
            confirm();
          }}
        >
          <p style={{ fontWeight: "bold", textDecoration: "underline" }}>Delete</p>
        </Btn>
      </Modal>
    </div>
  );
}