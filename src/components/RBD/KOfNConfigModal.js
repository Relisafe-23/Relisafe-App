// KOfNConfigModal.jsx
import React, { useState, useEffect } from "react";
import Api from "../../Api";
import { useParams } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";

export const KOfNConfigModal = ({
  isOpen,
  onClose,
  onSubmit,
  targetId,
  initialData,
  mode = "add",
  currentBlock,
  selectedLabel,
  selectedCase,
}) => {
  const [k, setK] = useState(null);
  const [n, setN] = useState(null);
  const [formula, setFormula] = useState("standard");
  const { id, rbdId } = useParams();
  const [missionTime, setMissionTime] = useState("");
  const projectId = id;
  const [load, setLoad] = useState(null);
  const [systemUnavailability, setSystemUnavailability] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [showSymbol, setShowSymbol] = useState(false);
  const [lambda, setLambda] = useState(0);
  const [isLambdaEdited, setIsLambdaEdited] = useState(false);
  const [mu, setMu] = useState(0);
  const [nonIdenticalComponents, setNonIdenticalComponents] = useState([]);
  const [options, setOptions] = useState([]);
  const [systemReliability, setSystemReliability] = useState(0);

  const [values, setValues] = useState({
    relDes: currentBlock?.relDes || "",
    time: currentBlock?.time || " ",
    elementType: currentBlock?.elementType || "K-out-of-N",
    reliability: currentBlock?.systemReliability || 0,
    unavailability: currentBlock?.systemUnavailability || 0,
    partNumber: currentBlock?.partNumber || "",
    fr: currentBlock?.fr || "",
    color: currentBlock?.color || "#ffffff",
    productName: currentBlock?.productName || "",
    id: currentBlock?.id || "",
    load: currentBlock?.load || "100",
    mttr: currentBlock?.mttr || "",
    productNumber: currentBlock?.productNumber || "",
    productTreeItemID: currentBlock?.productTreeItemID || "",
    productId: currentBlock?.productId || "",
    indexCount: currentBlock?.indexCount || "",
  });

  // Initialize from initialData
  useEffect(() => {
    if (initialData) {
      setK(initialData.k || "");
      setN(initialData.n || "");
      setLambda(initialData.lambda || 0);
      setMu(initialData.mu || 0);
      setFormula(initialData.formula || "standard");
      setLoad(initialData.load || "100");

      if (initialData.components && initialData.components.length > 0) {
        const componentsWithIds = initialData.components.map((comp) => ({
          ...comp,
          productId: comp.productId || null,
          selectedOption: comp.productId
            ? {
                label: comp.productName || `Component ${comp.id}`,
                value: comp.productId,
                productId: comp.productId,
                productName: comp.productName,
                lambda: comp.lambda,
                mttr: comp.mttr,
              }
            : null,
        }));
        setNonIdenticalComponents(componentsWithIds);
      }
    }
  }, [initialData]);

  // Calculate mu from mttr
  useEffect(() => {
    if (parseFloat(values?.mttr) > 0) {
      const calculatedMu = 1 / parseFloat(values?.mttr);
      setMu(calculatedMu);
    }
  }, [values?.mttr]);

  // Calculate lambda from fr
  useEffect(() => {
    const fr = Number(values?.fr);
    if (!isLambdaEdited) {
      if (fr > 0) {
        setLambda((1 / fr)?.toFixed(6));
      }
    }
  }, [values?.fr, isLambdaEdited]);

  // Fetch data
  useEffect(() => {
    getRbdConfig();
    getProductName();
  }, [projectId]);

  // Initialize components for Non-Identical mode
  useEffect(() => {
    if (selectedLabel === "Non-Identical" && n && n > 0) {
      const currentLength = nonIdenticalComponents.length;

      if (currentLength < n) {
        const newComponents = [...nonIdenticalComponents];
        for (let i = currentLength; i < n; i++) {
          newComponents.push({
            id: `comp_${Date.now()}_${i}_${Math.random()}`,
            lambda: 0,
            mu: 0,
            mttr: "",
            productId: null,
            productName: "",
            isManual: false,
            selectedOption: null,
          });
        }
        setNonIdenticalComponents(newComponents);
      } else if (currentLength > n) {
        setNonIdenticalComponents(nonIdenticalComponents.slice(0, n));
      }
    }
  }, [n, selectedLabel]);

  // Calculate reliability and unavailability
  useEffect(() => {
    let reliability = 0;
    let unavailability = 0;

    if (selectedLabel === "Non-Identical") {
      const kVal = Number(k);
      const nVal = Number(n);

      if (!isNaN(kVal) && !isNaN(nVal) && nonIdenticalComponents.length === nVal) {
        reliability = getKofNReliabilityNonIdentical(kVal, nVal, nonIdenticalComponents);
        unavailability = unAvailabilityValueNonIdentical(kVal, nVal, nonIdenticalComponents, missionTime);
      }
    } else if (selectedLabel === "Identical (Load Sharing)") {
      const nVal = Number(n);
      const lambdaVal = Number(lambda);
      const loadValue = getLoadValue();
      const t = missionTime;
      
      if (!isNaN(nVal) && !isNaN(lambdaVal) && !isNaN(loadValue) && !isNaN(t)) {
        const lambdaEff = lambdaVal * loadValue;
        reliability = Math.exp(-nVal * lambdaEff * t);
        const componentUnavailability = 1 - Math.exp(-lambdaEff * t);
        unavailability = Math.min(nVal * componentUnavailability, 1);
      }
    } else {
      const kVal = Number(k);
      const nVal = Number(n);
      const lambdaVal = Number(lambda);
      const muVal = Number(mu);

      if (!isNaN(kVal) && !isNaN(nVal) && !isNaN(lambdaVal) && !isNaN(muVal)) {
        reliability = getKofNReliabilityIdentical(kVal, nVal, lambdaVal);
        unavailability = unAvailabilityValueIdentical(kVal, nVal, lambdaVal, muVal);
      }
    }

    setSystemReliability(Number(reliability?.toFixed(6)) || 0);
    setSystemUnavailability(Number(unavailability?.toFixed(6)) || 0);
  }, [k, n, lambda, mu, nonIdenticalComponents, selectedLabel, missionTime, load]);

  const getLoadValue = () => {
    if (load !== undefined && load !== null) {
      return Number(load);
    }
    return 1;
  };

  const handleChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        const opts = res.data.data
          .filter((item) => item?.indexCount && item?.partNumber)
          .map((item) => ({
            label: item.indexCount,
            value: item.indexCount,
            partNumber: item.partNumber,
            productName: item.productName,
            productId: item.productId,
            fr: item.fr,
            id: item.id,
            mttr: item.mttr || "",
            lambda: item.fr ? 1 / parseFloat(item.fr) : 0,
          }));
        setOptions(opts);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  };

  const getRbdConfig = () => {
    Api.get("/api/v1/EditConfigRBD/", {
      params: {
        projectId: projectId,
        rbdId: rbdId,
      },
    })
      .then((res) => {
        const rbdData = res.data.data.find((item) => item.id === rbdId);
        if (rbdData) {
          setMissionTime(rbdData.missionTime);
        }
      })
      .catch((error) => {
        console.error("Error fetching RBD config:", error);
      });
  };

  const factorial = (num) => {
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    return result;
  };

  const combination = (nVal, r) => {
    return factorial(nVal) / (factorial(r) * factorial(nVal - r));
  };

  const getReliability = (lambdaValue, missionTimeValue) => {
    if (!lambdaValue || !missionTimeValue) return 0;
    return Math.exp(-(lambdaValue * missionTimeValue));
  };

  const unAvailabilityFn = (lambdaVal, muVal) => {
    if (!lambdaVal || !muVal || lambdaVal + muVal === 0) return 0;
    return lambdaVal / (lambdaVal + muVal);
  };

  const unAvailabilityValueNonIdentical = (kVal, nVal, components, missionTimeValue) => {
    if (!components || components.length === 0) return 0;

    const validComponents = components.filter(
      (comp) => comp && Number.isFinite(Number(comp.lambda))
    );

    if (validComponents.length !== nVal) return 0;

    const uList = validComponents.map(
      (comp) => 1 - Math.exp(-Number(comp.lambda) * missionTimeValue)
    );
    const AList = uList.map((u) => 1 - u);

    let result = 0;
    const minFailures = nVal - kVal + 1;

    const combineRecursive = (index, failedCount, term) => {
      if (index === nVal) {
        if (failedCount >= minFailures) result += term;
        return;
      }
      combineRecursive(index + 1, failedCount + 1, term * uList[index]);
      combineRecursive(index + 1, failedCount, term * AList[index]);
    };

    combineRecursive(0, 0, 1);
    return result;
  };

  const unAvailabilityValueIdentical = (kVal, nVal, lambdaVal, muVal) => {
    const u = unAvailabilityFn(lambdaVal, muVal);
    let result = 0;
    for (let i = kVal; i <= nVal; i++) {
      result += combination(nVal, i) * Math.pow(u, i) * Math.pow(1 - u, nVal - i);
    }
    return result;
  };

  const getKofNReliabilityNonIdentical = (kVal, nVal, components) => {
    if (!components || components.length === 0) return 0;

    let result = 0;
    const validComponents = components.filter(
      (comp) => comp && typeof comp.lambda === "number"
    );
    
    if (validComponents.length !== nVal) return 0;

    const totalCombinations = Math.pow(2, nVal);

    for (let mask = 0; mask < totalCombinations; mask++) {
      let workingCount = 0;
      let prob = 1;

      for (let i = 0; i < nVal; i++) {
        const isWorking = !((mask >> i) & 1);
        const reliability = getReliability(validComponents[i].lambda, missionTime);

        if (isWorking) {
          workingCount++;
          prob *= reliability;
        } else {
          prob *= 1 - reliability;
        }
      }

      if (workingCount >= kVal) {
        result += prob;
      }
    }

    return result;
  };

  const getKofNReliabilityIdentical = (kVal, nVal, lambdaValue) => {
    const R = getReliability(lambdaValue, missionTime);
    let result = 0;
    for (let r = kVal; r <= nVal; r++) {
      result += combination(nVal, r) * Math.pow(R, r) * Math.pow(1 - R, nVal - r);
    }
    return result;
  };

  const handleComponentChange = (index, field, value, selectedOption = null) => {
    const updatedComponents = [...nonIdenticalComponents];

    if (field === "product") {
      if (selectedOption && selectedOption.value !== "Select from the product" && selectedOption.value) {
        const lambdaValue = selectedOption.lambda !== undefined ? parseFloat(selectedOption.lambda) : 0;
        const mttrValue = selectedOption.mttr || "";
        const muValue = mttrValue ? 1 / parseFloat(mttrValue) : 0;

        updatedComponents[index] = {
          ...updatedComponents[index],
          lambda: lambdaValue,
          mu: muValue,
          mttr: mttrValue,
          productId: selectedOption.productId && selectedOption.productId !== "" ? selectedOption.productId : null,
          productName: selectedOption.productName,
          selectedOption: selectedOption,
          isManual: false,
        };
      } else if (selectedOption && selectedOption.value === "Select from the product") {
        updatedComponents[index] = {
          ...updatedComponents[index],
          lambda: 0,
          mu: 0,
          mttr: "",
          selectedOption: selectedOption,
          isManual: false,
          productId: null,
          productName: "",
        };
      }
    } else if (field === "lambda") {
      updatedComponents[index] = {
        ...updatedComponents[index],
        lambda: parseFloat(value) || 0,
        isManual: true,
        selectedOption: null,
      };
    } else if (field === "mttr") {
      const mttrValue = value;
      const muValue = mttrValue ? 1 / parseFloat(mttrValue) : 0;

      updatedComponents[index] = {
        ...updatedComponents[index],
        mttr: mttrValue,
        mu: muValue,
        isManual: true,
      };
    }

    setNonIdenticalComponents(updatedComponents);
  };

  const handleCreate = () => {
    const newKOfNData = {
      projectId: projectId,
      productId: values.productId && values.productId !== "" ? values.productId : null,
      rbdId: rbdId,
      k: parseInt(k),
      n: parseInt(n),
      formula: formula,
      lambda: parseFloat(lambda) || 0,
      mu: mu || 0,
      type: "K-out-of-N",
      elementType: "K-out-of-N",
      kOfNType: selectedLabel,
      name: values.productName || `${selectedLabel} K-out-of-N Block`,
      mttr: values.mttr,
      indexCount: values.indexCount,
      reliability: systemReliability,
      unavailability: systemUnavailability,
      partNumber: values.partNumber,
      productName: values.productName,
      color: values.color,
      load: selectedLabel === "Identical (Load Sharing)" ? load : values.load,
      targetId:targetId,
    };

    if (selectedLabel === "Non-Identical") {
      newKOfNData.components = nonIdenticalComponents.map((comp) => ({
        productId: comp.productId && comp.productId !== "" ? comp.productId : null,
        lambda: comp.lambda || 0,
        mu: comp.mu || 0,
        mttr: comp.mttr || "",
        productName: comp.productName,
        isManual: comp.isManual,
      }));
    }

    Api.post("/api/v1/elementParametersRBD/create", newKOfNData)
      .then((response) => {
        if (response?.data?.success) {
          toast.success("K-out-of-N block created successfully");
          onSubmit(newKOfNData, "add");
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error creating KOfN:", error);
        toast.error("Failed to create K-out-of-N block");
      });
  };

  const handleUpdate = () => {
    const blockId = initialData?.id || currentBlock?.id || values?.id;

    if (!blockId) {
      console.error("No block ID found for update");
      toast.error("Cannot update: Block ID not found");
      return;
    }

    const updateData = {
      projectId: projectId,
      productId: values.productId && values.productId !== "" ? values.productId : null,
      rbdId: rbdId,
      productTreeItemID: values.indexCount || null,
      relDes: values.relDes,
      k: parseInt(k),
      n: parseInt(n),
      formula: formula,
      lambda: parseFloat(lambda) || 0,
      mu: mu || 0,
      type: "K-out-of-N",
      elementType: "K-out-of-N",
      kOfNType: selectedLabel,
      name: values.productName || `${selectedLabel} K-out-of-N Block`,
      mttr: values.mttr,
      indexCount: values.indexCount,
      reliability: systemReliability,
      unavailability: systemUnavailability,
      partNumber: values.partNumber,
      productName: values.productName,
      color: values.color,
      load: selectedLabel === "Identical (Load Sharing)" ? load : values.load,
    };

    if (selectedLabel === "Non-Identical") {
      updateData.components = nonIdenticalComponents.map((comp) => ({
        productTreeItemID: comp.indexCount || null,
        relDes: comp.relDes || null,
        productId: comp.productId && comp.productId !== "" ? comp.productId : null,
        lambda: comp.lambda || 0,
        mu: comp.mu || 0,
        mttr: comp.mttr || "",
        productName: comp.productName,
        isManual: comp.isManual,
      }));
    }

    Api.patch(`/api/v1/elementParametersRBD/updateRBD/${blockId}`, updateData)
      .then((response) => {
        if (response?.data?.success) {
          toast.success("K-out-of-N block updated successfully");
          onSubmit(updateData, "edit", blockId);
          onClose();
        } else {
          toast.error("Failed to update K-out-of-N block");
        }
      })
      .catch((error) => {
        console.error("Error updating KOfN:", error);
        toast.error(`Error updating: ${error.response?.data?.message || error.message}`);
      });
  };

  const handleSubmitOrUpdate = () => {
    if (mode === "edit") {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  if (!isOpen) return null;

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
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "25px",
          borderRadius: "8px",
          minWidth: "450px",
          maxWidth: "850px",
          border: "1px solid #999",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "16px",
            fontWeight: "bold",
            borderBottom: "1px solid #ccc",
            paddingBottom: "10px",
          }}
        >
          {selectedLabel === "Identical" &&
            (mode === "add"
              ? "Add K-out-of-N Block - (Identical)"
              : "Edit K-out-of-N Block - (Identical)")}
          {selectedLabel === "Non-Identical" &&
            (mode === "add"
              ? "Add K-out-of-N Block - (Non-Identical)"
              : "Edit K-out-of-N Block - (Non-Identical)")}
          {selectedLabel === "Identical (Load Sharing)" &&
            (mode === "add"
              ? "Add K-out-of-N Block - (Identical (Load Sharing))"
              : "Edit K-out-of-N Block - (Identical (Load Sharing))")}
        </h3>

        <div>
          {selectedLabel !== "Non-Identical" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "15px",
                alignItems: "end",
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
                  value={
                    values?.indexCount
                      ? { label: values.indexCount, value: values.indexCount }
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
                      handleChange("mttr", option.mttr);
                    }
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "15px",
                      minHeight: "30px",
                    }),
                  }}
                />
              </div>

              <div>
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
                  onChange={(e) => handleChange("productName", e.target.value)}
                  placeholder="Transmitter"
                  style={{
                    width: "90%",
                    padding: "6px",
                    border: "1px solid #7f9db9",
                    borderRadius: "3px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  Failure Rate (λ):
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={lambda}
                  onChange={(e) => {
                    setLambda(parseFloat(e.target.value) || 0);
                    setIsLambdaEdited(true);
                  }}
                  style={{
                    width: "90%",
                    padding: "6px",
                    border: "1px solid #7f9db9",
                    borderRadius: "3px",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: "20px" }} className="mt-3">
          <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                k (required operational):
              </label>
              <input
                type="number"
                min="1"
                max={n}
                value={k}
                onChange={(e) => setK(parseInt(e.target.value) || 1)}
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #7f9db9",
                  borderRadius: "3px",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                n (total items):
              </label>
              <input
                type="number"
                min={k}
                max="10"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value) || 1)}
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #7f9db9",
                  borderRadius: "3px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            {selectedLabel === "Identical (Load Sharing)" && (
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  Load:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={load}
                  min="0"
                  onChange={(e) => setLoad(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px",
                    border: "1px solid #7f9db9",
                    borderRadius: "3px",
                    boxSizing: "border-box",
                  }}
                  placeholder="100"
                />
              </div>
            )}
          </div>

          {selectedLabel === "Non-Identical" && n > 0 && (
            <div
              style={{
                marginTop: "20px",
                borderTop: "1px solid #ccc",
                paddingTop: "15px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "15px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Component Details (Non-Identical):
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "15px",
                }}
              >
                {nonIdenticalComponents.map((component, index) => (
                  <div
                    key={component.id}
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#555",
                      }}
                    >
                      Component {index + 1}:
                    </label>

                    <div style={{ marginBottom: "10px" }}>
                      <CreatableSelect
                        value={component.selectedOption}
                        options={[
                          {
                            label: "Select from the product",
                            value: "Select from the product",
                          },
                          ...options,
                        ]}
                        onChange={(option) => {
                          if (option) {
                            handleComponentChange(index, "product", option.value, option);
                          }
                        }}
                        placeholder="Select product or enter manually..."
                        styles={{
                          control: (base) => ({
                            ...base,
                            fontSize: "13px",
                            minHeight: "32px",
                          }),
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontSize: "11px",
                          color: "#666",
                        }}
                      >
                        Failure Rate λ (1/hour):
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={component.lambda || 0}
                        onChange={(e) =>
                          handleComponentChange(index, "lambda", e.target.value)
                        }
                        placeholder="Enter failure rate"
                        style={{
                          width: "100%",
                          padding: "5px",
                          border: "1px solid #7f9db9",
                          borderRadius: "3px",
                          fontSize: "12px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontSize: "11px",
                          color: "#666",
                        }}
                      >
                        MTTR (hours):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={component.mttr || ""}
                        onChange={(e) =>
                          handleComponentChange(index, "mttr", e.target.value)
                        }
                        placeholder="Enter MTTR"
                        style={{
                          width: "100%",
                          padding: "5px",
                          border: "1px solid #7f9db9",
                          borderRadius: "3px",
                          fontSize: "12px",
                        }}
                      />
                    </div>

                    {component.mu > 0 && (
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "11px",
                          color: "#4CAF50",
                          padding: "4px",
                          backgroundColor: "#e8f5e9",
                          borderRadius: "3px",
                        }}
                      >
                        Repair Rate (μ): {component.mu.toFixed(6)} /hour
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: "#e8f4f8",
            padding: "12px",
            marginBottom: "20px",
            border: "1px solid #4CAF50",
            borderRadius: "4px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Calculated Values:
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {selectedLabel !== "Non-Identical" && (
              <span>Failure Rate (λ): {lambda || "N/A"}</span>
            )}
            {selectedLabel !== "Non-Identical" && (
              <span>Repair Rate (μ = 1/MTTR): {mu?.toFixed(6)}</span>
            )}
            <span>System Reliability: {systemReliability?.toFixed(6)}</span>
            <span>
              System Unavailability: {systemUnavailability?.toFixed(6)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            borderTop: "1px solid #ccc",
            paddingTop: "15px",
          }}
        >
          <button
            onClick={handleSubmitOrUpdate}
            style={{
              padding: "8px 25px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
          >
            {mode === "edit" ? "Update" : "OK"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 25px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#da190b")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default KOfNConfigModal;