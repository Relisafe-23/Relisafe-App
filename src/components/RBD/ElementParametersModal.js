import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Api from '../../Api';
import CreatableSelect from 'react-select/creatable';
// import { Button } from 'antd';
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";

const ElementParametersModal = ({ isOpen, onClose, onSubmit, props, onOpenSwitchConfig, currentBlock }) => {

  const [formData, setFormData] = useState({
    relDes: currentBlock?.relDes || '',
    time: currentBlock?.time || " ",
    elementType: currentBlock?.elementType || 'REGULAR',
    patNumber: currentBlock?.patNumber || '',
    fr: currentBlock?.fr || '',
    repair: currentBlock?.repair || 'Full repair',
    inspectionPeriod: currentBlock?.inspectionPeriod || '',
    dutyCycle: currentBlock?.dutyCycle || '100',
    color: currentBlock?.color || '#ffffff',
    frDistribution: currentBlock?.frDistribution || '',
    kOutOfN: currentBlock?.kOutOfN || false,
    k: currentBlock?.k || '2',
    n: currentBlock?.n || '3',
    alpha: currentBlock?.alpha || '',
    fmecaId: currentBlock?.fmecaId || '',
    indexCount: currentBlock?.indexCount || '',
    productName: currentBlock?.productName || '',
    id: currentBlock?.id || '',
    repairDistribution: currentBlock?.repairDistribution || 'Exponential',
    mtbf: currentBlock?.mtbf || '1303617.9',
    load: currentBlock?.load || '100',
    mct: currentBlock?.mct || '',
    productNumber: currentBlock?.productNumber || '',
    productTreeItemID: currentBlock?.productTreeItemID || '',
    fmNumber: currentBlock?.fmNumber || '',
    description: currentBlock?.description || '',
    remark: currentBlock?.remark || '',
    fmDescription: currentBlock?.fmDescription || ''
  });

  const { id } = useParams();
  const [options, setOptions] = useState([]);
  const projectId = id || props?.match?.params?.id;
  const [productIds12, setProductIds12] = useState(null);
  const userId = localStorage.getItem("userId");
  const [productIds, setProductIds] = useState(null);
  const [tableData, setTableData] = useState("");
  const [selectedProductId, setSelectedProductId] = useState([]);
  const productId = formData?.id || formData?.productId || "";
  const productName = formData?.productName || "";
  const [alpha, setAlpha] = useState([]);


  const [show, setShow] = useState(false);

  const createRBD = () => {
    Api.post(`/api/v1/rbd/create`, {
      projectId,
      productId,
    }).then((res) => {
      console.log("RBD created successfully:", res);
    });
  };

  const getProductName = () => {
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: {
        projectId: projectId,
        userId: userId,
        token: sessionId,
      },
    })
      .then((res) => {
        const options = res.data.data
          .filter(item => item?.indexCount && item?.partNumber)
          .map(item => ({
            label: item.indexCount,
            value: item.indexCount,
            partNumber: item.partNumber,
            productName: item.productName,
            productId: item.productId,
            fr: item.fr,
            id: item.id
          }));
        const productIdst = res.data.data.filter(item => item?.productId).map(item => item.productId);
        console.log("Options", options);
        setProductIds(productIdst);
        setOptions(options);
      });
  };

  const getProductData = () => {
    console.log("Fetching product data");

    Api.get("/api/v1/fmeca/product/list", {
      params: {
        projectId: projectId,
        productId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        console.log("FMECA Product Data:", res.data.data);

        const failureAlphas = res.data.data
          .filter(item => item.failureModeRatioAlpha)
          .map(item => item.failureModeRatioAlpha);

        setAlpha(failureAlphas);

        const fmecaIds = res.data.data
          .filter(item => item.fmecaId)
          .map(item => item.fmecaId);

        setSelectedProductId(fmecaIds);
        console.log("selectedProductId", fmecaIds);
        console.log("failureAlphas", failureAlphas);

        const data = res?.data?.data;
        setTableData(data);
        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            productId: data[0].productId
          }));
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          // Handle unauthorized
          console.error("Unauthorized access");
        }
      });
  };

  const getProductFRPData = () => {
    if (!productId) return;
    const companyId = localStorage.getItem("companyId");

    Api.get(`/api/v1/failureRatePrediction/details`, {
      params: {
        projectId,
        companyId,
        productId,
        userId: userId,
      },
    }).then((res) => {
      console.log("FRP Data:", res.data);
    }).catch((error) => {
      console.error("Error fetching FRP data:", error);
    });
  };

  useEffect(() => {
    if (!projectId) return;
    getProductName();
    getProductFRPData();
    getProductData();
  }, [projectId, productId]); // Added proper dependencies

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchClick = () => {
    onOpenSwitchConfig({
      n: formData.n,
      k: formData.k,
      ...(currentBlock?.switchData || {})
    });
  };

  const showModal = () => {
    setShow(true);
  }


  const initialValues = {
    switchExists: true,
    frDistribution: "Time Independent",
    unreliability: "0.001",
    nValue: 3,
    kValue: 2,
  };

  const handleClose = () => {
    setShow(false);
  }

  const handleSwitchSubmit = (values) => {
    console.log("Form Data:", values);
    handleClose();
  };

  return (
    <>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1002
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '4px',
          width: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Element parameters definition</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}>
                <h4 style={{ fontSize: '12px', marginBottom: '15px', color: '#666', fontWeight: 'bold' }}>
                  Connection with Product Tree / FMECA
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '15px'
                }}>
                  <div>
                    <label
                      style={{
                        fontSize: '11px',
                        display: 'block',
                        marginBottom: '5px',
                        fontWeight: 'bold'
                      }}
                    >
                      Product Tree Item ID:
                    </label>
                    <CreatableSelect
                      type="text"
                      value={
                        formData?.indexCount
                          ? { label: formData.indexCount, value: formData.indexCount }
                          : null
                      }
                      options={options}
                      onChange={(option) => {
                        if (option) {
                          handleChange("indexCount", option.value);
                          handleChange("partNumber", option.partNumber);
                          handleChange("productName", option.productName);
                          handleChange("fr", option.fr);
                          handleChange("productId", option.productId);
                          handleChange("id", option.id);
                        } else {
                          handleChange("productName", "");
                          handleChange("partNumber", "");
                          handleChange("indexCount", "");
                          handleChange("fr", "");
                          handleChange("productId", "");
                          handleChange("id", "");
                          handleChange("fmecaId", "");
                        }
                      }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          fontSize: '11px',
                          minHeight: '30px'
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      fontSize: '11px',
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold'
                    }}>FM Number</label>
                    <select
                      value={formData?.fmecaId || ""}
                      onChange={(e) => handleChange("fmecaId", e.target.value)}
                      style={{
                        width: '100%',
                        padding: "6px",
                        border: "1px solid #ccc",
                        borderRadius: "3px",
                        fontSize: "11px",
                      }}
                    >
                      <option value="">-- Select FM Number --</option>
                      {selectedProductId?.map((id, index) => (
                        <option key={index} value={id} label={index + 1}>
                          {id}
                        </option>
                      ))}
                    </select>
                    {console.log("selectedProductId12345", selectedProductId)}
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      FM description:
                    </label>
                    <textarea
                      value={formData?.fmDescription || ""}
                      onChange={(e) => handleChange('fmDescription', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '11px',
                        minHeight: '50px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Main 3-column grid for the form sections */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                {/* Column 1 */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Ref Des:
                    </label>
                    <input
                      type="text"
                      value={formData?.productName || ""}
                      onChange={(e) => handleChange('productName', e.target.value)}
                      placeholder="Transmitter"
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '12px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Element Type:
                    </label>
                    <select
                      value={formData.elementType}
                      onChange={(e) => handleChange('elementType', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '12px',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <option value="REGULAR">REGULAR</option>
                      <option value="K_OUT_OF_N">K-out-of-N</option>
                      <option value="SUBRBD">SubRBD</option>
                      <option value="PARALLEL_SECTION">Parallel Section</option>
                      <option value="PARALLEL_BRANCH">Parallel Branch</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Part Number:
                    </label>
                    <input
                      type="text"
                      value={formData?.partNumber || ""}
                      onChange={(e) => handleChange("partNumber", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #ccc",
                        borderRadius: "3px",
                        fontSize: "12px"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Machine Time [hours] (t):
                    </label>
                    <input
                      type="text"
                      value={formData?.time || ""}
                      onChange={(e) => handleChange("time", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #ccc",
                        borderRadius: "3px",
                        fontSize: "12px"
                      }}
                    />
                  </div>

                  {/* Switch button for K-out-of-N */}
                  {formData.elementType === 'K_OUT_OF_N' && (
                    <div style={{ marginBottom: '15px' }}>
                      <button
                        type="button"
                        onClick={handleSwitchClick}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #007bff',
                          borderRadius: '3px',
                          background: 'white',
                          color: '#007bff',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2">
                          <path d="M18 6L6 18" />
                          <path d="M6 6L18 18" />
                        </svg>
                        Switch
                      </button>
                    </div>
                  )}
                </div>

                {/* Column 2 */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Repair:
                    </label>
                    <select
                      value={formData.repair}
                      onChange={(e) => handleChange('repair', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '12px',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <option value="Full repair">Full repair</option>
                      <option value="Partial repair">Partial repair</option>
                      <option value="No repair">No repair</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      <input
                        type="checkbox"
                        checked={formData.inspectionPeriod !== ''}
                        onChange={(e) => handleChange('inspectionPeriod', e.target.checked ? '--' : '')}
                        style={{ marginRight: '5px' }}
                      />
                      Inspection period:
                    </label>
                    <input
                      type="text"
                      value={formData.inspectionPeriod}
                      onChange={(e) => handleChange('inspectionPeriod', e.target.value)}
                      disabled={formData.inspectionPeriod === ''}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '12px',
                        backgroundColor: formData.inspectionPeriod === '' ? '#f0f0f0' : 'white'
                      }}
                      placeholder="--"
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Duty cycle [%]:
                    </label>
                    <input
                      type="text"
                      value={formData.dutyCycle}
                      onChange={(e) => handleChange('dutyCycle', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '12px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Color:
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      style={{
                        width: '100%',
                        height: '30px',
                        padding: '0',
                        border: '1px solid #ccc',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>

                {/* Column 3 */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      FR distribution:
                    </label>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                      <div>
                        <input
                          type="radio"
                          id="frDefault"
                          name="frDistribution"
                          value="default"
                          checked={formData.frDistribution === "default"}
                          onChange={(e) => handleChange("frDistribution", e.target.value)}
                        />
                        <label htmlFor="frDefault" style={{ marginLeft: "5px", fontSize: "12px" }}>
                          Default
                        </label>
                      </div>

                      <div>
                        <input
                          type="radio"
                          id="frKOutOfN"
                          name="frDistribution"
                          value="kOutOfN"
                          checked={formData.frDistribution === "kOutOfN"}
                          onChange={(e) => handleChange("frDistribution", e.target.value)}
                        />
                        <label htmlFor="frKOutOfN" style={{ marginLeft: "5px", fontSize: "12px" }}>
                          K out of N
                        </label>
                      </div>

                    </div>

                    {formData?.frDistribution === "kOutOfN" && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11px', marginRight: '5px' }}>K:</label>
                          <input
                            type="text"
                            value={formData.k}
                            onChange={(e) => handleChange('k', e.target.value)}
                            style={{
                              width: '60px',
                              padding: '4px',
                              border: '1px solid #ccc',
                              borderRadius: '3px',
                              fontSize: '11px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', marginRight: '5px' }}>N:</label>
                          <input
                            type="text"
                            value={formData.n}
                            onChange={(e) => handleChange('n', e.target.value)}
                            style={{
                              width: '60px',
                              padding: '4px',
                              border: '1px solid #ccc',
                              borderRadius: '3px',
                              fontSize: '11px'
                            }}
                          />
                        </div>
                        <div className='fs-1 ms-3'>
                          <Button type='button' onClick={showModal}>Switch</Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Repair distribution:
                    </label>
                    <select
                      value={formData.repairDistribution}
                      onChange={(e) => handleChange('repairDistribution', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '12px',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <option value="Exponential">Exponential</option>
                      <option value="Normal">Normal</option>
                      <option value="Weibull">Weibull</option>
                      <option value="Lognormal">Lognormal</option>
                      <option value="Erlang">Erlang</option>
                      <option value="Time-dependent">Time-dependent</option>
                      <option value="Constant">Constant</option>
                      <option value="Uniform">Uniform</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', fontWeight: 'bold' }}>
                      FR distribution parameters:
                    </label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ fontSize: '11px', marginRight: '5px' }}>MTBF [hours]:</label>
                        <input
                          type="text"
                          value={formData?.fr ? (1 / parseFloat(formData.fr)).toFixed(2) : ""}
                          onChange={(e) => handleChange('fr', e.target.value)}
                          style={{
                            width: '100px',
                            padding: '4px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            fontSize: '11px'
                          }}
                          placeholder="445089"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', marginRight: '5px' }}>Load:</label>
                        <input
                          type="text"
                          value={formData.load}
                          onChange={(e) => handleChange('load', e.target.value)}
                          style={{
                            width: '60px',
                            padding: '4px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            fontSize: '11px'
                          }}
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', fontWeight: 'bold' }}>
                      Repair distribution parameters:
                    </label>
                    <div>
                      <label style={{ fontSize: '11px', marginRight: '5px' }}>MCT [hours]:</label>
                      <input
                        type="text"
                        value={formData.mct}
                        onChange={(e) => handleChange('mct', e.target.value)}
                        style={{
                          width: '100px',
                          padding: '4px',
                          border: '1px solid #ccc',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                        placeholder="0127333"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '20px',
              borderTop: '1px solid #eee'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '3px',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                OK
              </button>
            </div>
          </form>
        </div>
      </div>



{/* This form is Modal of RBD Element K-out-of-N Switch Data ===> Created by SAKTHIVEL */}


      <Formik
        initialValues={{
          switchExists: true,
          frDistribution: "Time Independent",
          unreliability: "0.001",
          nValue: 3,
          kValue: 2,
        }}
        validationSchema={Yup.object({
          unreliability: Yup.number()
            .typeError("Must be a number")
            .required("Required"),
          nValue: Yup.number().required("Required"),
          kValue: Yup.number().required("Required"),
        })}
        onSubmit={handleSwitchSubmit}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            centered
          >
            <Form onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>RBD Element K-out-of-N Switch Data</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <Row>
                  {/* LEFT SIDE */}
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Switch exists"
                      name="switchExists"
                      checked={values.switchExists}
                      onChange={handleChange}
                    />

                    <Form.Group className="mt-3">
                      <Form.Label>Switch FR distribution</Form.Label>
                      <Form.Select
                        name="frDistribution"
                        value={values.frDistribution}
                        onChange={handleChange}
                      >
                        <option value="Time Independent">Time Independent</option>
                        <option value="Exponential">Exponential</option>
                        <option value="Weibull">Weibull</option>
                        <option value="Normal">Normal</option>
                      </Form.Select>
                    </Form.Group>

                    <div className="mt-3">
                      <strong>FR distribution parameters:</strong>
                    </div>

                    <Form.Group className="mt-2">
                      <Form.Label>Unreliability:</Form.Label>
                      <Form.Control
                        type="text"
                        name="unreliability"
                        value={values.unreliability}
                        onChange={handleChange}
                        isInvalid={touched.unreliability && errors.unreliability}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.unreliability}
                      </Form.Control.Feedback>
                    </Form.Group>

                  </Col>

                  {/* RIGHT SIDE DIAGRAM */}
                  <Col md={6}>
                    <div
                      style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        textAlign: "center",
                      }}
                    >

                      <img
                        src='/images/Daiod.png'
                        alt="Switch Diagram"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </Modal.Body>

              <Modal.Footer>
                <Button variant='secondary' onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  OK
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
      </Formik>
    </>
  );
};

export { ElementParametersModal };