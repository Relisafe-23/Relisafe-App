import { Tree } from "react-organizational-chart";
import React, { useEffect, useState, useRef } from "react";
import { removeChartDataHelper } from "../../utils";
import RenderTree from "../../components/FTA/RenderTree";
import "../../App.css";
import Api from "../../Api";
import { Button, Form } from "react-bootstrap";
import { Modal } from "antd";
import { Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../../css/PBS.scss";
import Label from "../../components/LabelComponent";
import Select from "react-select";
import { customStyles } from "../../components/core/select";
import { toast } from "react-toastify";
import { useModal } from "../ModalContext";
import { useHistory } from "react-router-dom";
import EventsReportModal from "./EventsReportModal";
import FTAtable from "./FTAtable";
import UnavailabilityReportModal from "./UnavailablityReportModal";
import SteadyStateReportModal from "./SteadyStateReportModal";

// Remove ProbabilityContext import

const initialData = {
  id: 1,
  code: "jack_hill",
  description: "CEO",
  gateId: 1,
  children: [
    {
      id: 2,
      code: "john_doe",
      description: "CTO",
      gateId: 2,
      children: [
        {
          id: 3,
          code: "jane_smith",
          description: "Lead Engineer",
          gateId: 3,
        },
        {
          id: 4,
          code: "alex_green",
          description: "Product Manager",
          gateId: 4,
        },
      ],
    },
    {
      id: 5,
      code: "emily_wilson",
      description: "CFO",
      gateId: 5,
      children: [
        {
          id: 6,
          code: "chris_jones",
          description: "Finance Manager",
          gateId: 6,
        },
      ],
    },
  ],
};

export default function FTA(props) {
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [projectId, setProjectId] = useState(props?.location?.state?.projectId);
  const [chartData, setChartData] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeLength, setNodeLength] = useState([]);
  const [calcTypes, setCalcTypes] = useState();
  const [productData, setProductData] = useState([]);
  const [currentReportType, setCurrentReportType] = useState("all");

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [eventsData, setEventsData] = useState([]);
  const [gatesData, setGatesData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // LOCAL STATE for probability modal - NO CONTEXT NEEDED
  const [isProbabilityModalOpen, setIsProbabilityModalOpen] = useState(false);
  const [probabilityParams, setProbabilityParams] = useState(null);
  
  const [isUnavailabilityReportOpen, setIsUnavailabilityReportOpen] = useState(false);
  const [isSteadyStateReportOpen, setIsSteadyStateReportOpen] = useState(false);
  const [probabilityCalcData, setProbabilityCalcData] = useState([]);
  const [currentMissionTime, setCurrentMissionTime] = useState('');

  const history = useHistory();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const formikRef = useRef(null);

  const {
    isFTAModalOpen,
    closeFTAModal,
    isPropertiesModal,
    closePropertiesModal,
    isDeleteSucess,
    saveFromFile,
    reloadData,
    openDeleteNode,
    stopTriggerReload,
  } = useModal();

  const handelDelete = () => {
    openDeleteNode();
  };

  // ===== LOCAL MODAL FUNCTIONS - NO CONTEXT NEEDED =====
  const openProbabilityModal = (params) => {
    setProbabilityParams(params);
    setIsProbabilityModalOpen(true);
  };

  const closeProbabilityModal = () => {
    setIsProbabilityModalOpen(false);
    setProbabilityParams(null);
  };

  const submitProbabilityCalculation = (values) => {
    console.log('Submitting calculation:', values);
    // calculateUnavailability(values);
    closeProbabilityModal();
  };

  // ===== CALCULATE UNAVAILABILITY FUNCTION =====
  // const calculateUnavailability = (values) => {
  //   const extractProbabilityNodes = (node) => {
  //     const nodes = [];
      
  //     if (node) {
  //       const hasFailureData = node.fr || node.calcTypes;
        
  //       if (hasFailureData) {
  //         let unavailability = 0;
          
  //         if (values.calcTypes?.value === "Unavailability at time t Q(t)") {
  //           const lambda = parseFloat(node.fr) || 0;
  //           const t = parseFloat(values.missionTime) || 0;
  //           unavailability = 1 - Math.exp(-lambda * t);
  //         } else {
  //           const lambda = parseFloat(node.fr) || 0;
  //           const mttr = parseFloat(node.mttr) || 0;
  //           const mu = mttr > 0 ? 1 / mttr : 0;
  //           unavailability = lambda + mu > 0 ? lambda / (lambda + mu) : 0;
  //         }
          
  //         nodes.push({
  //           name: node.name || node.code || `Gate ${node.gateId}`,
  //           description: node.description || '',
  //           failureRate: node.fr || 'N/A',
  //           missionTime: values.missionTime || '',
  //           mttr: node.mttr || 'N/A',
  //           unavailability: unavailability.toExponential(4),
  //           steadyStateUnavailability: unavailability.toExponential(4)
  //         });
  //       }
        
  //       if (node.children && node.children.length > 0) {
  //         node.children.forEach(child => {
  //           nodes.push(...extractProbabilityNodes(child));
  //         });
  //       }
  //     }
      
  //     return nodes;
  //   };

  //   const calcData = extractProbabilityNodes(chartData);
  //   setProbabilityCalcData(calcData);
    
  //   if (values.calcTypes?.value === "Unavailability at time t Q(t)") {
  //     setCurrentMissionTime(values.missionTime);
  //     setIsUnavailabilityReportOpen(true);
  //   } else {
  //     setIsSteadyStateReportOpen(true);
  //   }
  // };

  // ===== USE EFFECT FOR PROBABILITY PARAMS =====
  useEffect(() => {
    if (probabilityParams) {
      // calculateUnavailability(probabilityParams);
    }
  }, [probabilityParams]);

  // ===== WINDOW OPEN PROBABILITY MODAL =====
  useEffect(() => {
    window.openProbabilityModal = (params) => {
      openProbabilityModal(params);
    };
    
    return () => {
      delete window.openProbabilityModal;
    };
  }, []);

  const handleZoomToFit = () => {
    setPanOffset({ x: 0, y: 0 });
    toast.success("Zoomed to fit screen");
  };

  const handleZoomOriginal = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    toast.success("Reset to original size");
  };

  const handleToggleGrid = () => {
    const newShowGrid = !showGrid;
    setShowGrid(newShowGrid);
    toast.success(newShowGrid ? "Grid shown" : "Grid hidden");
  };

  const handleOriginalLayout = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setPanning(false);
    setPanStart({ x: 0, y: 0 });
    toast.success("Original layout restored");
  };

  // ===== GENERATE REPORT FUNCTION - NO HOOKS INSIDE =====
  const generateReport = (type = "all") => {
    if (!chartData) {
      toast.warning("No fault tree data available");
      return;
    }

    const extractAllNodes = (node) => {
      const nodes = [];

      if (node) {
        const hasFailureRate =
          node.fr || node.failureRate || node.frValue || node.failureRateValue;
        const isEvent =
          hasFailureRate || node.calcTypes || node.isEvent === true;
        const isGate =
          node.gateType || (node.children && node.children.length > 0);

        const failureRate =
          node.fr ||
          node.failureRate ||
          node.frValue ||
          node.failureRateValue ||
          "N/A";

        const nodeData = {
          id: node.id,
          code: node.code || node.name || `Gate ${node.gateId}`,
          description: node.description || "No description",
          type: isEvent ? "Event" : isGate ? "Gate" : "Unknown",
          failureRate: isEvent ? failureRate : "N/A",
          calcType: node.calcTypes || "N/A",
          gateType: node.gateType || "N/A",
          gateId: node.gateId || "N/A",
          children: node.children || [],
          product: node.product || "N/A",
          childCount: node.children ? node.children.length : 0,
        };

        nodes.push(nodeData);

        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => {
            nodes.push(...extractAllNodes(child));
          });
        }
      }

      return nodes;
    };

    const allNodes = extractAllNodes(chartData);
    const events = allNodes.filter((node) => node.type === "Event");
    const gates = allNodes.filter((node) => node.type === "Gate");

    setEventsData(events);
    setGatesData(gates);
    setCurrentReportType(type);
    setIsReportModalOpen(true);

    toast.success(
      `${type === "events" ? "Events" : type === "gates" ? "Gates" : "Report"} generated successfully`,
    );
  };

  const handleWheelScroll = (event) => {
    const newZoom = zoomLevel + event.deltaY * -0.001;
    setZoomLevel(Math.min(Math.max(0.1, newZoom), 2));
  };

  const handleMouseDown = (event) => {
    if (event.button === 0) {
      setPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event) => {
    if (panning) {
      const offsetX = event.clientX - panStart.x;
      const offsetY = event.clientY - panStart.y;
      setPanOffset({ x: offsetX, y: offsetY });
    }
  };

  const handleMouseUp = (event) => {
    if (panning) {
      setPanning(false);
      setPanStart({ x: 0, y: 0 });
    }
  };

  const removeChartData = (id) => {
    setChartData((oldData) => {
      return removeChartDataHelper(oldData, id);
    });
  };

  const addChartNode = (id, newNode) => {
    setChartData((oldData) => {
      const addNodeHelper = (data) => {
        if (!data) return;
        if (data.id === id) {
          return {
            ...data,
            children: [...(data.children || []), newNode],
          };
        }
        return {
          ...data,
          children: data?.children?.map((child) => addNodeHelper(child)),
        };
      };

      return addNodeHelper(oldData);
    });
  };

  const editChartNode = (id, newNode) => {
    setChartData((oldData) => {
      const editNodeHelper = (data) => {
        if (!data) return;
        if (data.id === id) {
          return { ...data, ...newNode };
        }
        return {
          ...data,
          children: data?.children?.map((child) => editNodeHelper(child)),
        };
      };

      return editNodeHelper(oldData);
    });
  };

  const validate = Yup.object().shape({
    name: Yup.string().required("Name is Required"),
    description: Yup.string().required("Description is Required"),
    gateId: Yup.string().required("Gate Id is Required"),
    calcTypes: Yup.object().required("Calc.Types is Required"),
    missionTime: Yup.string().when('calcTypes', {
      is: (calcTypes) => calcTypes?.value === "Unavailability at time t Q(t)",
      then: Yup.string().required("Mission Time t is Required"),
      otherwise: Yup.object().nullable(),
    }),
  });

  const parentSubmit = (values, { resetForm }) => {
    const companyId = localStorage.getItem("companyId");
    Api.post("/api/v1/FTA/create/parent", {
      gateType: "OR",
      name: values.name,
      description: values.description,
      gateId: values.gateId,
      calcTypes: values.calcTypes.value,
      missionTime: values.missionTime,
      projectId: projectId,
      companyId: companyId,
    }).then((res) => {
      getFTAData();
      setIsModalOpen(false);
      resetForm({ values: "" });
      handleCancel();
      setCalcTypes("");
      toast("Created", {
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

  const updateProperties = (values, { resetForm }) => {
    Api.patch(`/api/v1/FTA/update/property/${chartData?.parentId}`, {
      productId: chartData?.id,
      name: values.name,
      description: values.description,
      calcTypes: values.calcTypes.value,
      missionTime: values.missionTime,
      gateType: chartData.gateType,
    }).then((res) => {
      getFTAData();
      setIsModalOpen(false);
      resetForm({ values: "" });
      handleCancel();
      setCalcTypes("");
      toast("Updated Successfully", {
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

  const getFTAData = () => {
    setLoading(true);
    Api.get(`/api/v1/FTA/get/${projectId}`)
      .then((res) => {
        const allTreeData = res?.data?.nodeData || [];
        setTrees(allTreeData);
        setNodeLength(allTreeData);

        if (viewMode === "chart" && allTreeData.length > 0 && selectedTreeId) {
          const treeToShow =
            allTreeData.find(
              (tree) =>
                tree._id === selectedTreeId || tree.id === selectedTreeId,
            ) || allTreeData[0];
          setChartData(treeToShow.treeStructure || {});
          if (treeToShow.treeStructure?.parentId) {
            getFullFTAdata(treeToShow.treeStructure.parentId);
          }
        }

        setLoading(false);
        stopTriggerReload();
      })
      .catch((error) => {
        console.error("Error fetching trees:", error);
        toast.error("Failed to load trees");
        setLoading(false);
      });
  };

  const handleDeleteTree = (tree) => {
    if (!tree) {
      toast.error("Invalid tree ID");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this tree and all its nodes?",
      )
    ) {
      try {
        Api.delete(`/api/v1/FTA/delete/${tree?.projectId}/${tree?.id}`)
          .then((res) => {
            toast.success("Tree deleted successfully");

            if (selectedTreeId === tree?.id) {
              handleBackToTable();
            }

            getFTAData();
          })
          .catch((error) => {
            console.error("Delete error:", error);
          });
      } catch (error) {
        console.error("Unexpected error during tree deletion:", error);
        toast.error("An unexpected error occurred while deleting the tree.");
      }
    }
  };

  const handleViewTree = (tree) => {
    setChartData(tree.treeStructure || {});
    setSelectedTreeId(tree.id || tree._id);
    setViewMode("chart");

    if (tree.treeStructure?.parentId) {
      getFullFTAdata(tree.treeStructure.parentId);
    }

    toast.success(`Viewing tree: ${tree.name}`);
  };

  const handleCreateNewTree = () => {
    setIsModalOpen(true);
  };

  const handleBackToTable = () => {
    setViewMode("table");
    setChartData([]);
    setSelectedTreeId(null);
  };

  const handleCancel = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
    setIsModalOpen(false);
    closeFTAModal();
    closePropertiesModal();
  };

  if (isDeleteSucess) {
    getFTAData();
  }

  const getTreeProduct = () => {
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: {
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;
        setProductData(treeData);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  useEffect(() => {
    if (projectId) {
      getFTAData();
      getTreeProduct();
    }
  }, [projectId]);

  useEffect(() => {
    if (reloadData && projectId) {
      getFTAData();
      stopTriggerReload();
    }
  }, [reloadData, projectId, stopTriggerReload]);

  useEffect(() => {
    window.triggerFTAUpdate = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    return () => {
      delete window.triggerFTAUpdate;
    };
  }, []);

  useEffect(() => {
    if (projectId) {
      getFTAData();
    }
  }, [projectId, refreshTrigger]);

  const getFullFTAdata = (id) => {
    if (id) {
      Api.get(`/api/v1/FTA/get/tree/${id}`).then((res) => {
        const data = res?.data?.nodeData[0];
        saveFromFile(data);
      });
    } else {
      saveFromFile(null);
    }
  };

  return (
    <div>
      {viewMode === "table" ? (
        <FTAtable
          trees={trees}
          loading={loading}
          onViewTree={handleViewTree}
          onCreateNewTree={handleCreateNewTree}
          projectId={projectId}
        />
      ) : nodeLength.length > 0 && chartData ? (
        <div
          className="org-chart-container"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            paddingTop: "70px",
          }}
          onWheel={handleWheelScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Tree
            lineWidth={"2px"}
            lineColor={"green"}
            lineBorderRadius={"10px"}
            className="org-chart-container"
          >
            <RenderTree
              data={chartData}
              handleRemove={removeChartData}
              handleAdd={addChartNode}
              handleEdit={editChartNode}
              projectId={projectId}
              getFTAData={getFTAData}
              productData={productData}
              selectedNodeId={selectedNodeId}
              setSelectedNodeId={setSelectedNodeId}
            />
          </Tree>
        </div>
      ) : (
        <div
          style={{ height: "100vh", display: "flex", justifyContent: "center" }}
        >
          <div style={{ paddingTop: "90px" }}>
            <Button
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: "#00a9c9",
                border: "0px",
                color: "#fff",
                height: "35px",
                width: "150px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              + Create New
            </Button>
          </div>
        </div>
      )}

      {/* LOCAL PROBABILITY MODAL - NO CONTEXT NEEDED */}
      <Modal
        title={
          <p style={{ margin: "0px", color: "#00a9c9", width: '500px' }}>
            Calculation Parameter
          </p>
        }
        open={isProbabilityModalOpen}
        footer={null}
        onCancel={closeProbabilityModal}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: chartData?.name || "",
            description: chartData?.description || "",
            calcTypes: chartData?.calcTypes 
              ? { label: chartData?.calcTypes, value: chartData?.calcTypes }
              : "",
            missionTime: chartData?.missionTime || "",
          }}
          onSubmit={(values) => {
            submitProbabilityCalculation(values);
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
        >
          {({ values, handleChange, handleSubmit, handleBlur, setFieldValue }) => (
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
                  value={values.calcTypes}
                  onBlur={handleBlur}
                  onChange={(e) => setFieldValue("calcTypes", e)}
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

              {values.calcTypes?.value === "Unavailability at time t Q(t)" && (
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
                    <p style={{ margin: "0px", fontWeight: "bold", marginLeft: "20px" }}>(hours)</p>
                  </div>
                  <ErrorMessage className="error text-danger" component="span" name="missionTime" />
                </Form.Group>
              )}

              <div className="d-flex justify-content-end mt-4">
                <Button className="me-2" variant="outline-secondary" onClick={closeProbabilityModal}>
                  Cancel
                </Button>
                <Button type="submit">Calculate</Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      <EventsReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        eventsData={eventsData}
        gatesData={gatesData}
        reportType={currentReportType}
      />

      <UnavailabilityReportModal
        isOpen={isUnavailabilityReportOpen}
        onClose={() => setIsUnavailabilityReportOpen(false)}
        calculationData={probabilityCalcData}
        missionTime={currentMissionTime}
      />

      <SteadyStateReportModal
        isOpen={isSteadyStateReportOpen}
        onClose={() => setIsSteadyStateReportOpen(false)}
        calculationData={probabilityCalcData}
      />

      <Modal
        title={
          <p style={{ margin: "0px", color: "#00a9c9", width: "500px" }}>
            Fault Tree Properties
          </p>
        }
        open={
          isModalOpen
            ? isModalOpen
            : isFTAModalOpen
              ? isFTAModalOpen
              : isPropertiesModal && nodeLength.length > 0
                ? isPropertiesModal
                : null
        }
        footer={null}
        onCancel={handleCancel}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: isPropertiesModal ? chartData?.name : "",
            description: isPropertiesModal ? chartData?.description : "",
            calcTypes: isPropertiesModal
              ? { label: chartData?.calcTypes, value: chartData?.calcTypes }
              : "",
            missionTime: isPropertiesModal ? chartData?.missionTime : "",
            gateId: 1,
          }}
          onSubmit={isPropertiesModal ? updateProperties : parentSubmit}
          validationSchema={validate}
          innerRef={formikRef}
        >
          {(formik) => {
            const {
              values,
              handleChange,
              handleSubmit,
              handleBlur,
              setFieldValue,
            } = formik;
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
                  <ErrorMessage
                    className="error text-danger"
                    component="span"
                    name="name"
                  />
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
                  <ErrorMessage
                    className="error text-danger"
                    component="span"
                    name="description"
                  />
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
                  <ErrorMessage
                    className="error text-danger"
                    component="span"
                    name="calcTypes"
                  />
                </Form.Group>
                {values.calcTypes?.value === "Unavailability at time t Q(t)" && (
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
                      <p
                        style={{
                          margin: "0px",
                          fontWeight: "bold",
                          marginLeft: "20px",
                        }}
                      >
                        ( hours)
                      </p>
                    </div>
                    <ErrorMessage
                      className="error text-danger"
                      component="span"
                      name="missionTime"
                    />
                  </Form.Group>
                )}

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
                  <ErrorMessage
                    className="error text-danger"
                    component="span"
                    name="gateId"
                  />
                </Form.Group>
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    className=" me-2"
                    variant="outline-secondary"
                    type="reset"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isPropertiesModal ? "Save Changes" : "Create"}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </div>
  );
}