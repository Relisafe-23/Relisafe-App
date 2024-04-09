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
    stopTriggerReload,
  } = useModal();

  const handleWheelScroll = (event) => {
    // event.preventDefault(); // Prevent default scroll behavior
    const newZoom = zoomLevel + event.deltaY * -0.001; // Adjust the scaling factor as needed
    setZoomLevel(Math.min(Math.max(0.1, newZoom), 2)); // Limit zoom level between 0.5 and 2
  };
  const handleMouseDown = (event) => {
    if (event.button === 0) {
      // event.preventDefault(); // Prevent default mouse behavior
      setPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event) => {
    if (panning) {
      // event.preventDefault(); // Prevent default mouse behavior
      const offsetX = event.clientX - panStart.x;
      const offsetY = event.clientY - panStart.y;
      setPanOffset({ x: offsetX, y: offsetY });
    }
  };

  const handleMouseUp = (event) => {
    if (panning) {
      // event.preventDefault(); // Prevent default mouse behavior
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
    missionTime:
      calcTypes === "Unavailability at time t Q(t)"
        ? Yup.string().required("Mission Time t is Required")
        : Yup.object().nullable(),
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
    Api.get(`/api/v1/FTA/get/${projectId}`).then((res) => {
      const getLength = res?.data?.nodeData;
      const data = res?.data?.nodeData[0]?.treeStructure;
      setChartData(data);
      setNodeLength(getLength);
      getFullFTAdata(data?.parentId);
      stopTriggerReload();
    });
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

  //logout
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  useEffect(() => {
    getFTAData();
    getTreeProduct();
  }, []);

  useEffect(() => {
    if (reloadData) {
      getFTAData();
    }
  }, [reloadData]);

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
      {nodeLength.length > 0 ? (
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
          <Tree lineWidth={"2px"} lineColor={"green"} lineBorderRadius={"10px"} className="org-chart-container">
            <RenderTree
              data={nodeLength.length > 0 ? chartData : 0}
              handleRemove={removeChartData}
              handleAdd={addChartNode}
              handleEdit={editChartNode}
              projectId={projectId}
              getFTAData={getFTAData}
              productData={productData}
              selectedNodeId={selectedNodeId} // Pass selectedNodeId to RenderTree
              setSelectedNodeId={setSelectedNodeId} // Pass setSelectedNodeId function to RenderTree
            />
          </Tree>
        </div>
      ) : (
        <div style={{ height: "100vh", display: "flex", justifyContent: "center" }}>
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
      <Modal
        title={<p style={{ margin: "0px", color: "#00a9c9" ,width:'500px' }}>Fault Tree Properties</p>}
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
            calcTypes: isPropertiesModal ? { label: chartData?.calcTypes, value: chartData?.calcTypes } : "",
            missionTime: isPropertiesModal ? chartData?.missionTime : "",
            gateId: 1,
          }}
          onSubmit={isPropertiesModal ? updateProperties : parentSubmit}
          validationSchema={validate}
          innerRef={formikRef}
        >
          {(formik) => {
            const { values, handleChange, handleSubmit, handleBlur, isValid, mainProductForm, setFieldValue } = formik;
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
                {values.calcTypes.value === "Unavailability at time t Q(t)" ? (
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
                  <Button className=" me-2" variant="outline-secondary" type="reset" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">{isPropertiesModal ? "Save Changes" : "Create"}</Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </div>
  );
}
