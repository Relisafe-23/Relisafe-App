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

  export default function RenderNode({
    node,
    parNod,
    handleAdd,
    handleEdit,
    getFTAData,
    projectId,
    productData,
    selectedNodeId, // Receive selectedNodeId as a prop
    setSelectedNodeId, // Receive setSelectedNodeId function as a prop
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

    const isActive = selectedNodeId === node?.gateId; // Check if the node is active

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

    const handleClick = () => {
      setSelectedNodeId(isActive ? null : node?.gateId); // Toggle active node on click // Toggle active node on click
      closeEditGateModal();
      closeChildCreateModal();
      closeChildEvent();
      // The below one for get index count foe update child and parent node
      // console.log(projectId, node?.parentId,"projectId", "node?.parentId" )
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

      // The below one for get indexcount for adding child
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
      return <h1> No data found</h1>;
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
      e.preventDefault(); // Prevent the default context menu from appearing
      setModal2Open(true); // Replace this with your desired action
    };

    const eventFields = [
      { value: "Constant Probability", label: "Constant Probability" },
      { value: "Evident, P=λ*t", label: "Evident, P=λ*t" },
      { value: "Const.mission time, P=λ*tm", label: "Const.mission time, P=λ*tm" },
      { value: "Unrepairable, P=1-(1-q)*exp(-λ*t)", label: "Unrepairable, P=1-(1-q)*exp(-λ*t)" },
      { value: "Repairable", label: "Repairable" },
      { value: "Latent, P=λ*T", label: "Latent, P=λ*T" },
      { value: "Latent, P=λ*T/2", label: "Latent, P=λ*T/2" },
      { value: "Latent,Life-time, P=1-e^(-λ*T)", label: "Latent,Life-time, P=1-e^(-λ*T)" },
      { value: "Latent repairable", label: "Latent repairable" },
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
      // Check if this is a root node or child node
      if (node?.indexCount === 1) {
        // Root node update
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
        // Child node update
        Api.put(`/api/v1/FTA/update/${projectId}/${node?.id}`, {
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

    return (
      <div>
        <div style={{ height: 106, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              border: isActive ? "2px solid green" : "none",
              margin: "auto",
              width: 148,
              height: 104,
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
                borderRadius: "0px",
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
                  height: "15px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "0px",
                  backgroundColor: "#00a9c9",
                  borderRadius: "0px",
                }}
              >
                <p
                  onClick={handleClick} // Set the clicked node as active
                  style={{
                    color: "#fff",
                    margin: "0px",
                    fontWeight: "bold",
                    fontSize: "10px",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {node?.name ? node?.name : "-"}
                </p>
              </Card.Header>
              <Tooltip title={node?.description} placement="top">
                <Card.Body onClick={handleClick} style={{ padding: "0px", borderRadius: "0px", height: "100%" }}>
                  <div
                    onClick={handleClick}
                    style={{
                      display: "inline-block",
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: "vertical",
                      padding: "0px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <p
                      style={{
                        color: "black",
                        margin: "0px",
                        fontSize: "9px",
                      }}
                    >
                      {node?.description}
                    </p>
                  </div>
                </Card.Body>
              </Tooltip>
            </Card>
            {(node?.children.length > 0 && node?.gateType === "AND") ||
              (node?.children.length > 0 && node?.gateType === "OR") ? (
              <div
                style={{
                  zIndex: 1,
                  backgroundColor: "none",
                  width: "100%",
                  height: "20px",
                  display: "flex",
                  justifyContent: "center",
                  top: "13px",
                }}
              >
                <div style={{ backgroundColor: "white", right: "0.5px" }}>
                  <Image
                    src={node?.gateType === "AND" ? andGate : orGate}
                    alt=""
                    style={{ width: node?.gateType === "AND" ? "40px" : "30px", height: "25px" }}
                  />
                </div>
              </div>
            ) : node?.isEvent ? (
              <div>
                <div style={{ width: "2px", border: "1px solid green", height: "30px", top: "5px", left: "70px" }} />
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
                ></div>
                <div style={{ top: "40px" }}>
                  <p style={{ margin: "0px" }}>p = &lambda;* t</p>
                  <p>&lambda; = 1.20E-09 </p>
                </div>
              </div>
            ) : null}
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
          {/* {console.log(node,"node....")} */}
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
              // Handle form submission for probability calculations
              handleProbabilityUpdate(values);
            }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required("Name is Required"),
              description: Yup.string().required("Description is Required"),
              calcTypes: Yup.object().required("Calc.Types is Required"),
              missionTime: Yup.string().when('calcTypes', {
                is: (calcTypes) => calcTypes?.value === "Unavailability at time t Q(t)",
                then: Yup.string().required("Mission time t is required"),
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
                        // setFieldValue("isProducts", {
                        //   label: `${e.value.indexCount} ${e.value.productName}`,
                        //   value: `${e.value.indexCount} ${e.value.productName}`,
                        // });
                        // setIsProductName({
                        //   label: `${e.value.indexCount} ${e.value.productName}`,
                        //   value: `${e.value.indexCount} ${e.value.productName}`,
                        // });
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
                    />
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
          // onOk={() => setModal2Open(false)}
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
