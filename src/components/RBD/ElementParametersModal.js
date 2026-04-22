import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import Api from "../../Api";
import CreatableSelect from "react-select/creatable";

const ElementParametersModal = ({
  isOpen,
  onClose,
  onSubmit,
  setLoadChange,
  parentItemId,
  props,
  onOpenSwitchConfig,
  rbdId,
  parallelFoundBlock,
  elementModal,
  currentBlock,
  getBlock,
  targetId,
}) => {


  let modelBlock = null;
  parallelFoundBlock
    ? (modelBlock = parallelFoundBlock)
    : (modelBlock = currentBlock);



  const mainId = modelBlock?.id || modelBlock?._id;
  const location = useLocation();

  const [values, setValues] = useState({
    rbdId: rbdId,
    relDes: modelBlock?.relDes || "",
    time: modelBlock?.missionTime || " ",
    elementType: modelBlock?.elementType || "REGULAR",
    partNumber: modelBlock?.partNumber || "",
    fr: modelBlock?.fr || "",
    repair: modelBlock?.repair || "Full repair",
    inspectionPeriod: modelBlock?.inspectionPeriod || "",
    dutyCycle: modelBlock?.dutyCycle || "100",
    color: modelBlock?.color || "#ffffff",
    frDistribution: modelBlock?.frDistribution || "",
    kOutOfN: modelBlock?.kOutOfN || false,
    k: modelBlock?.k || "2",
    n: modelBlock?.n || "3",
    mttr: modelBlock?.mttr || '',
    alpha: modelBlock?.alpha || "",
    fmecaId: modelBlock?.fmecaId || "",
    indexCount: modelBlock?.indexCount || "",
    productName: modelBlock?.productName || "",
    id: modelBlock?.id || "",
    repairDistribution: modelBlock?.repairDistribution || "Exponential",
    mtbf: modelBlock?.mtbf || "1303617.9",
    load: modelBlock?.load || "100",
    mct: modelBlock?.mct || "",
    productNumber: modelBlock?.productNumber || "",
    productTreeItemID: modelBlock?.productTreeItemID || "",
    fmNumber: modelBlock?.fmNumber || "",
    description: modelBlock?.description || "",
    remark: modelBlock?.remark || "",
    fmDescription: modelBlock?.fmDescription || "",
  });
  const missionTime = location.state?.missionTime;
  const [mission, setMission] = useState('');
  const [blink, setBlink] = useState(false);
  const { id } = useParams();
  const [options, setOptions] = useState([]);
  const projectId = id || props?.match?.params?.id;
  const [productIds12, setProductIds12] = useState(null);
  const userId = localStorage.getItem("userId");
  const [productIds, setProductIds] = useState(null);
  const [tableData, setTableData] = useState("");
  const [selectedProductId, setSelectedProductId] = useState([]);
  const productId = values?.id || values?.productId || "";
  const productName = values?.productName || "";
  const [alpha, setAlpha] = useState([]);

  // useEffect(() => {
  //   getElement()
  // }, [projectId])

  // const createRBD = () => {
  //   Api.post(`/api/v1/rbd/create`, {
  //     projectId,
  //     productId,
  //   }).then((res) => {
  //     console.log("RBD created successfully:", res);
  //   });
  // };

  const getProductName = () => {
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: {
        projectId: projectId,
        userId: userId,
        token: sessionId,
      },
    }).then((res) => {
      // console.log(res.data,'pbs')
      // const options = res.data.data
      //   .filter((item) => item?.indexCount && item?.partNumber)
      //   .map((item) => ({
      //     label: item.indexCount,
      //     value: item.indexCount,
      //     partNumber: item.partNumber,
      //     productName: item.productName,
      //     productId: item.productId,
      //     fr: item.fr,
      //     id: item.id,
      //   }));

        // console.log(res.data,'pbs')
        const options = res.data.data
          .filter(item => item?.indexCount && item?.partNumber)
          .map(item => ({
            label: item.indexCount,
            value: item.indexCount,
            partNumber: item.partNumber,
            productName: item.productName,
            productId: item.productId,
            fr: item.fr,
            mct: item.mct || "",
            mttr: item.mttr || "",
            id: item.id
          }));
       
        const productIdst = res.data.data.filter(item => item?.productId).map(item => item.productId);
        console.log("Options", options);
        setProductIds(productIdst);
        setOptions(options);
      });
  };

  const getProductData = () => {
    // console.log("Fetching product data");

    Api.get("/api/v1/fmeca/product/list", {
      params: {
        projectId: projectId,
        productId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        // console.log("FMECA Product Data:", res.data.data);

        const failureAlphas = res.data.data
          .filter((item) => item.failureModeRatioAlpha)
          .map((item) => item.failureModeRatioAlpha);

        setAlpha(failureAlphas);

        const fmecaIds = res.data.data
          .filter((item) => item.fmecaId)
          .map((item) => item.fmecaId);

        setSelectedProductId(fmecaIds);
        // console.log("selectedProductId", fmecaIds);
        // console.log("failureAlphas", failureAlphas);

        const data = res?.data?.data;
        setTableData(data);
        if (data && data.length > 0) {
          setValues((prev) => ({
            ...prev,
            productId: data[0].productId,
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

    // console.log(productId,'productId')
    Api.get(`/api/v1/mttrPrediction/${productId}`)
      .then((res) => {
        // console.log(res?.data?.data?.mct, 'response mttr')
        let mct = res?.data?.data?.mct;

        setValues((prev) => ({
          ...prev,
          mct: mct,
        }));
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
    })
      .then((res) => {
        // console.log("FRP Data:", res.data);
      })
      .catch((error) => {
        console.error("Error fetching FRP data:", error);
      });
  };

  useEffect(() => {
    if (!projectId) return;
    getProductName();
    getProductFRPData();
    getProductData();
  }, [projectId, productId]); // Added proper dependencies

    const calculateMetrics = ({ mtbf, mttr, missionTime }) => {
  const MTBF = Number(mtbf || 0);
  const MTTR = Number(mttr || 0);
  const t = Number(missionTime || 0);

  let reliability = 0;
  let unavailability = 0;

  if (MTBF > 0 && t >= 0) {
    const r = Math.exp(-t / MTBF);
    const u = 1 - r;

    reliability = r < 1e-4 ? r.toExponential(2) : r.toFixed(7);
    unavailability = u < 1e-4 ? u.toExponential(2) : u.toFixed(7);
  }

  return { reliability, unavailability };
};
  
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId || !rbdId || !projectId) {
        throw new Error("Missing required IDs");
      }
     
          const { reliability, unavailability } = calculateMetrics({
        mtbf: values.mtbf,
        mttr: values.mttr,
        missionTime
      });
          
    console.log("reliability1,availability2", reliability, unavailability)
      const payload = {
        indexCount: values.indexCount,
        partNumber: values.partNumber,
        productName: values.productName,
        fr: values.fr,
        rbdId: rbdId,
        productId: values.productId,
        fmecaId: values.fmecaId,
        fmDescription: values.fmDescription,
        elementType: values.elementType,
        time: missionTime,
        repair: values.repair,
        inspectionPeriod: values.inspectionPeriod,
        dutyCycle: values.dutyCycle,
        color: values.color,
        frDistribution: values.frDistribution,
        k: values.k,
        n: values.n,
        repairDistribution: values.repairDistribution,
        load: values.load,
        mtbf: values.mtbf,
        mct: values.mct,
        mttr: values.mttr,
        projectId: projectId,
        companyId: companyId,
        idforApi: elementModal?.idforApi,
        targetId: elementModal?.idforApi?.targetId || elementModal?.nodeIndex,
        reliability: reliability,
        unavailability: unavailability
      };
      console.log("Paylooooooad",payload);
      const response = await Api.post("/api/v1/elementParametersRBD/create", payload);
      console.log("responseeeeeeeeee",response)
      await getBlock();

     onSubmit({
  ...values,
  reliability,
  unavailability,
  targetId: elementModal?.idforApi?.targetId || elementModal?.nodeIndex
});
      onClose();
    } catch (error) {
      console.error("Submission failed:", error);

    }
   
  }

  
const handleUpdate = async (e) => {
  e.preventDefault();
  console.log("33333333333");

  let endpoint;

  if (parentItemId) {
    endpoint = `/api/v1/elementParametersRBD/updateRBD/${parentItemId}/block/${mainId}`;
  } else {
    endpoint = `/api/v1/elementParametersRBD/updateRBD/${mainId}`;
  }

  try {
    // console.log("444444.....");
    const { reliability, unavailability } = calculateMetrics({
      mtbf: values.mtbf,
      mttr: values.mttr,
      missionTime
    });

  console.log("444444.....",reliability);
    // OPTIONAL: include in payload
    const payload = {
      ...values,
      reliability,
      unavailability
    };
    console.log("Paylooooooad",payload);
    const res = await Api.patch(endpoint, payload);
      console.log("res....",res)
    if (res.data.success === true) {
      onClose();
    } else {
      console.log("error update");
    }

  } catch (error) {
    console.log("failed Api", error);
  }
};

  const handleChange = (field, value) => {
    setValues(prev => {
      const newValues = { ...prev, [field]: value };
      if (field === 'fr') {
        if (value && !isNaN(parseFloat(value)) && parseFloat(value) !== 0) {
          newValues.mtbf = (1 / parseFloat(value)).toFixed(6);
        } else {
          newValues.mtbf = '';
        }
      }
      else if (field === 'mtbf') {
        if (value && !isNaN(parseFloat(value)) && parseFloat(value) !== 0) {
          newValues.fr = (1 / parseFloat(value)).toFixed(6);
        } else {
          newValues.fr = '';
        }
      }

      return newValues;
    });
  };

  const handleSwitchClick = () => {
    onOpenSwitchConfig({
      n: values.n,
      k: values.k,
      ...(modelBlock?.switchData || {}),
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1002,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "4px",
          width: "1000px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          <h2 style={{ marginBottom: "20px", color: "#333" }}>
            {/* {currentBlock ? "Edit Element Parameters" : "Add Element Parameters"} */}
            {elementModal?.mode === "edit"
              ? "Edit Element Parameters"
              : "Add Element Parameters"}
          </h2>
        </h2>
        <form onSubmit={mainId ? handleUpdate : handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h4
                style={{
                  fontSize: "12px",
                  marginBottom: "15px",
                  color: "#666",
                  fontWeight: "bold",
                }}
              >
                Connection with Product Tree / FMECA
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "11px",
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Product Tree Item ID:
                  </label>
                  <CreatableSelect
                    type="text"
                    value={
                      values?.indexCount
                        ? { label: values.indexCount, value: values.indexCount }
                        : null
                    }
                    options={options}
                    onChange={(option) => {
                      // console.log(option, '<---- option')
                      if (option) {
                        handleChange("indexCount", option.value);
                        handleChange("partNumber", option.partNumber);
                        handleChange("productName", option.productName);
                        handleChange("fr", option.fr);
                        handleChange("productId", option.productId);
                        handleChange("id", option.id);
                        handleChange("mttr", option.mttr);
                        handleChange("mct", option.mct)
                      } else {
                        handleChange("productName", "");
                        handleChange("partNumber", "");
                        handleChange("indexCount", "");
                        handleChange("fr", "");
                        handleChange("productId", "");
                        handleChange("id", "");
                        handleChange("fmecaId", "");
                        handleChange("mttr", "");
                        handleChange("mct", "")
                      }
                    }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "11px",
                        minHeight: "30px",
                      }),
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "11px",
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    FM Number
                  </label>
                  <select
                    value={values?.fmecaId || ""}
                    onChange={(e) => handleChange("fmecaId", e.target.value)}
                    style={{
                      width: "100%",
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
                  {/* {console.log("selectedProductId12345", selectedProductId)} */}
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "11px",
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    FM description:
                  </label>
                  <textarea
                    value={values?.fmDescription || ""}
                    onChange={(e) =>
                      handleChange("fmDescription", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "6px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      fontSize: "11px",
                      minHeight: "50px",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Main 3-column grid for the form sections */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Column 1 */}
              <div>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Ref Des:
                  </label>
                  <input
                    type="text"
                    value={values?.productName || ""}
                    onChange={(e) =>
                      handleChange("productName", e.target.value)
                    }
                    placeholder="Transmitter"
                    style={{
                      width: "100%",
                      padding: "6px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      fontSize: "12px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Element Type:
                  </label>
                  <select
                    value={values?.elementType}
                    onChange={(e) =>
                      handleChange("elementType", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "6px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      fontSize: "12px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <option value="REGULAR">REGULAR</option>
                    <option value="K_OUT_OF_N">K-out-of-N</option>
                    <option value="SUBRBD">SubRBD</option>
                    <option value="PARALLEL_SECTION">Parallel Section</option>
                    <option value="PARALLEL_BRANCH">Parallel Branch</option>
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Part Number:
                  </label>
                  <input
                    type="text"
                    value={values?.partNumber || ""}
                    onChange={(e) => handleChange("partNumber", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      fontSize: "12px",
                    }}
                  />
                </div>

                {/* <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Machine Time [hours] (t):
                    </label>
                    <input
                      type="text"
                      value={values?.time || ""}
                      onChange={(e) => handleChange("time", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #ccc",
                        borderRadius: "3px",
                        fontSize: "12px"
                      }}
                    />
                  </div> */}

                {values.elementType === "K_OUT_OF_N" && (
                  <div style={{ marginBottom: "15px" }}>
                    <button
                      type="button"
                      onClick={handleSwitchClick}
                      style={{
                        padding: "8px 16px",
                        border: "1px solid #007bff",
                        borderRadius: "3px",
                        background: "white",
                        color: "#007bff",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#007bff"
                        strokeWidth="2"
                      >
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
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Repair:
                  </label>
                  <select
                    value={values.repair}
                    onChange={(e) => handleChange("repair", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      fontSize: "12px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <option value="Full repair">Full repair</option>
                    <option value="Partial repair">Partial repair</option>
                    <option value="No repair">No repair</option>
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={values.inspectionPeriod !== ""}
                      onChange={(e) =>
                        handleChange(
                          "inspectionPeriod",
                          e.target.checked ? "--" : "",
                        )
                      }
                      style={{ marginRight: "5px" }}
                    />
                    Inspection period:
                  </label>
                  <input
                    type="text"
                    value={values.inspectionPeriod}
                    onChange={(e) =>
                      handleChange("inspectionPeriod", e.target.value)
                    }
                    disabled={values.inspectionPeriod === ""}
                    style={{
                      width: "100%",
                      padding: "6px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      fontSize: "12px",
                      backgroundColor:
                        values.inspectionPeriod === "" ? "#f0f0f0" : "white",
                    }}
                    placeholder="--"
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Duty cycle [%]:
                  </label>
                  <input
                    type="text"
                    value={values.dutyCycle}
                    onChange={(e) => handleChange("dutyCycle", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      fontSize: "12px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Color:
                  </label>
                  <input
                    type="color"
                    value={values.color}
                    onChange={(e) => handleChange("color", e.target.value)}
                    style={{
                      width: "100%",
                      height: "30px",
                      padding: "0",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>

              {/* Column 3 */}
              <div>
                {/* <div style={{ marginBottom: '15px' }}>
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
                          checked={values.frDistribution === "default"}
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
                          checked={values.frDistribution === "kOutOfN"}
                          onChange={(e) => handleChange("frDistribution", e.target.value)}
                        />
                        <label htmlFor="frKOutOfN" style={{ marginLeft: "5px", fontSize: "12px" }}>
                          K out of N
                        </label>
                      </div>
                    </div>

                    {values?.frDistribution === "kOutOfN" && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11px', marginRight: '5px' }}>K:</label>
                          <input
                            type="text"
                            value={values.k}
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
                            value={values.n}
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
                      </div>
                    )}
                  </div> */}

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Repair distribution:
                  </label>
                  <select
                    value={values.repairDistribution}
                    onChange={(e) =>
                      handleChange("repairDistribution", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "6px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      fontSize: "12px",
                      backgroundColor: "#f9f9f9",
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

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    FR distribution parameters:
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "5px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <label style={{ fontSize: "11px", marginRight: "5px" }}>
                        MTBF [hours]:
                      </label>
                      <input
                        type="text"
                        value={values?.mtbf}
                        onChange={(e) => handleChange('mtbf', e.target.value)}
                        style={{
                          width: "100px",
                          padding: "4px",
                          border: "1px solid #ccc",
                          borderRadius: "3px",
                          fontSize: "11px",
                        }}
                        placeholder="445089"
                      />

                    </div>


                    <div>
                      <label style={{ fontSize: '11px', marginRight: '5px' }}>Mttr:</label>
                      <input
                        type="text"
                        value={values.mttr}
                        onChange={(e) => handleChange('mttr', e.target.value)}
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
                  <div>
                    {!values?.fr && (
                      <span style={{ color: "red", fontSize: '11px' }}>Give the MTBF value</span>
                    )}</div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    Repair distribution parameters:
                  </label>
                  <div>
                    <label style={{ fontSize: "11px", marginRight: "5px" }}>
                      MCT [hours]:
                    </label>
                    <input
                      type="text"
                      value={values.mct}
                      // value={values.mct !== null && values.mct !== undefined && !isNaN(values.mct) && values.mct !== "" ? values.mct : "0"}
                      onChange={(e) => handleChange('mct', e.target.value)}
                      style={{
                        width: "100px",
                        padding: "4px",
                        border: "1px solid #ccc",
                        borderRadius: "3px",
                        fontSize: "11px",
                      }}
                      placeholder="0127333"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "20px",
              borderTop: "1px solid #eee",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                background: "#f5f5f5",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!values?.fr || values?.fr <= 0}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '3px',
                background: (!values?.fr || values?.fr <= 0) ? '#ccc' : '#007bff',
                color: 'white',
                cursor: (!values?.fr || values?.fr <= 0) ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                animation: blink ? 'blink 0.3s ease-in-out 2' : 'none'
              }}
            >
              OK
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export { ElementParametersModal };
