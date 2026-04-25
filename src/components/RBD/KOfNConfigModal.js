// KOfNConfigModal.jsx
import React, { useState, useEffect } from 'react';
import Api from "../../Api";
import { useParams, useLocation } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
export const KOfNConfigModal = ({ isOpen,targetId, onClose, onSubmit, initialData, mode = 'add', currentBlock,selectedLabel, selectedCase }) => {

  console.log(targetId,'targetId from kofnconfig modla')

  const [k, setK] = useState(null);
  const [n, setN] = useState(null);
  const [formula, setFormula] = useState('standard');
  const { id, rbdId } = useParams();
  const [missionTime, setMissionTime] = useState("");
  const projectId = id;
  const [load,setLoad]= useState(null)
  const [systemUnavailability, setSystemUnavailability] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [showSymbol, setShowSymbol] = useState(false);

  // console.log("selectedCase", selectedCase);
  // console.log("selectedLabel", selectedLabel);
  // console.log("id", id)


  const [lambda, setLambda] = useState(0);
  const [isLambdaEdited, setIsLambdaEdited] = useState(false);

  const [values, setValues] = useState({
    relDes: currentBlock?.relDes || '',
    time: currentBlock?.time || " ",
    elementType: currentBlock?.elementType || 'K-out-of-N',
    reliability: currentBlock?.systemReliability || 0,
    unavailability: currentBlock?.systemUnavailability || 0,
    partNumber: currentBlock?.partNumber || '',
    fr: currentBlock?.fr || '',
    color: currentBlock?.color || '#ffffff',
    productName: currentBlock?.productName || '',
    id: currentBlock?.id || '',
    load: currentBlock?.load || '100',
    mttr: currentBlock?.mttr || '',
    productNumber: currentBlock?.productNumber || '',
    productTreeItemID: currentBlock?.productTreeItemID || '',
    productId: currentBlock?.productId || '',
    indexCount: currentBlock?.indexCount || '',
  });


  const [nonIdenticalComponents, setNonIdenticalComponents] = useState([]);
  const [options, setOptions] = useState([]);
  const [mu, setMu] = useState(0);

  const isPlaceholderSelected = values?.indexCount === "Select from the product";
  const isProductSelected = !!values?.indexCount;


useEffect(() => {
  console.log("initialData.components@@@@", initialData);
  if (initialData) {
    setK(initialData.k || "");
    setN(initialData.n || "");
    setLambda(initialData.lambda || 0);
    setMu(initialData.mu || 0);
    setFormula(initialData.formula || 'standard');

    if (initialData.components && initialData.components.length > 0) {
      console.log("initialData.components", initialData.components);
      // Ensure each component has productId properly set
      const componentsWithIds = initialData.components.map(comp => ({
        ...comp,
        productId: comp.productId || null, // Ensure productId exists
        selectedOption: comp.productId ? {
          label: comp.productName || `Component ${comp.id}`,
          value: comp.productId,
          productId: comp.productId,
          productName: comp.productName,
          lambda: comp.lambda,
          mttr: comp.mttr
        } : null
      }));
      setNonIdenticalComponents(componentsWithIds);
    }
  }
}, [initialData]);

  useEffect(() => {
    if (parseFloat(values?.mttr) > 0) {
      const calculatedMu = 1 / parseFloat(values?.mttr);
      setMu(calculatedMu);
    } else {
      setMu(0);
    }
  }, [values?.mttr]);

  useEffect(() => {
    const fr = Number(values?.fr);
    if (!isLambdaEdited) {
      if (fr > 0) {
        setLambda((1 / fr)?.toFixed(6));
      } else {
        setLambda("");
      }
    }
  }, [values?.fr, isLambdaEdited]);

  useEffect(() => {
    getRbdConfig();
    getProductName();

  }, [projectId]);


  const [systemReliability, setSystemReliability] = useState(0);

  useEffect(() => {
    if (selectedLabel === "Non-Identical" && n && n > 0) {
      const currentLength = nonIdenticalComponents.length;

      if (currentLength < n) {
        // Add new components
        const newComponents = [...nonIdenticalComponents];
        for (let i = currentLength; i < n; i++) {
          newComponents.push({
            id: `comp_${Date.now()}_${i}_${Math.random()}`,
            lambda: 0,
            mu: 0,
            mttr: '',
            productId: null,
            productName: '',
            isManual: false,
            selectedOption: null
          });
        }
        setNonIdenticalComponents(newComponents);
      } else if (currentLength > n) {
        // Remove excess components
        setNonIdenticalComponents(nonIdenticalComponents.slice(0, n));
      }
    }
  }, [n, selectedLabel]);

  // Effect 2: Initialize when switching to Non-Identical mode
  useEffect(() => {
    if (selectedLabel === "Non-Identical" && n && n > 0 && nonIdenticalComponents.length === 0) {
      const initialComponents = [];
      for (let i = 0; i < n; i++) {
        initialComponents.push({
          id: `comp_${Date.now()}_${i}_${Math.random()}`,
          lambda: 0,
          mu: 0,
          mttr: '',
          productId: null,
          productName: '',
          isManual: false,
          selectedOption: null
        });
      }
      setNonIdenticalComponents(initialComponents);
    }
  }, [selectedLabel, n]);
  const getKofN_Unavailability = (k, components, missionTime) => {
    const n = components.length;

    if (k > n) return 0;

    // Calculate U and A arrays
    const U = components.map(c =>
      c.lambda / (c.lambda + c.mu)
    );

    const A = components.map(c =>
      Math.exp(-(c.lambda * missionTime))
    );

    // Combination function
    const combine = (arr, k) => {
      if (k === 0) return [[]];
      if (arr.length === 0) return [];

      const [first, ...rest] = arr;

      return [
        ...combine(rest, k - 1).map(c => [first, ...c]),
        ...combine(rest, k)
      ];
    };

    const indices = [...Array(n).keys()];
    const combos = combine(indices, k);

    let result = 0;

    combos.forEach(combo => {
      let term = 1;

      for (let i = 0; i < n; i++) {
        if (combo.includes(i)) {
          term *= U[i]; // failed
        } else {
          term *= A[i]; // working
        }
      }

      result += term;
    });

    return result;
  };

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
  const loadValue = getLoadValue(); // must return a numeric load factor
  const t = missionTime;
 console.log("nVal",nVal)
 console.log("lambdaVal",lambdaVal)
 console.log("loadValue",loadValue)
  if (!isNaN(nVal) && !isNaN(lambdaVal) && !isNaN(loadValue) && !isNaN(t)) {

    // Effective failure rate under load
    const lambdaEff = lambdaVal * loadValue;

    // ===== System Reliability (Case 5 formula) =====
    // R(t) = exp( - (n * lambdaEff) * t )
    reliability = Math.exp(-nVal * lambdaEff * t);

    // ===== Component Reliability =====
    const componentReliability = Math.exp(-lambdaEff * t);

    // ===== Component Unavailability =====
    const componentUnavailability = 1 - componentReliability;

    // ===== System Unavailability (approximation) =====
    // U ≈ n * u_i  (capped at 1)
    unavailability = Math.min(nVal * componentUnavailability, 1);

    console.log(`Case 5: Identical Load Sharing`, {
      lambdaEff,
      componentReliability,
      componentUnavailability,
      systemReliability: reliability,
      systemUnavailability: unavailability
    });
  }
} else {
    // Original Identical case (without load sharing)
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
 // Add load to dependencies
const getLoadValue = () => {
  // Option 1: From state
  if (load !== undefined && load !== null) {
    return Number(load);
  }
  
  // Option 2: From nonIdenticalComponents if available
  if (nonIdenticalComponents && nonIdenticalComponents.length > 0) {
    // You might calculate average load from components
    const loads = nonIdenticalComponents.map(comp => comp.load || 1);
    return loads.reduce((sum, l) => sum + l, 0) / loads.length;
  }
  
  // Option 3: Default value
  return 1;
};

const getLoadSharingReliability = (kVal, nVal, lambdaVal, loadFactor, missionTime) => {
  
  
  let reliability = 0;
  const totalCombinations = 1 << nVal;
  
  for (let mask = 0; mask < totalCombinations; mask++) {
    let workingCount = 0;
    let failedCount = 0;
    let term = 1;
    let currentTime = missionTime;
    
    // Count working components
    for (let i = 0; i < nVal; i++) {
      if (!((mask >> i) & 1)) {
        workingCount++;
      } else {
        failedCount++;
      }
    }
    
  
    if (workingCount >= kVal) {
  
      let cumulativeHazard = 0;
      let remainingComponents = nVal;
      
   
      for (let i = 0; i < failedCount; i++) {
        const currentLoad = loadFactor * (remainingComponents);
        const failureRate = lambdaVal * currentLoad;
        cumulativeHazard += failureRate * (missionTime / failedCount);
        remainingComponents--;
      }
      
      reliability += Math.exp(-cumulativeHazard);
    }
  }
  
  return Math.min(reliability, 1);
};
  const handleChange = (field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
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
        const options = res.data.data
          .filter(item => item?.indexCount && item?.partNumber)
          .map(item => ({
            label: item.indexCount,
            value: item.indexCount,
            partNumber: item.partNumber,
            productName: item.productName,
            productId: item.productId,
            fr: item.fr,
            id: item.id,
            mttr: item.mttr || '',
            lambda: item.fr ? (1 / parseFloat(item.fr)) : 0
          }));
        setOptions(options);

      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  };

  const getRbdConfig = () => {
    Api.get("/api/v1/EditConfigRBD/", {
      params: {
        projectId: projectId,
        rbdId: rbdId
      }
    })
      .then((res) => {
        const rbdData = res.data.data.find(item => item.id === rbdId);
        if (rbdData) {
          setMissionTime(rbdData.missionTime)
        } else {
          setMissionTime(null)
        }
      })
      .catch((error) => {
        console.error("Error fetching RBD config:", error);
      });
  };

  const unAvailabilityFn = (lambdaVal, muVal) => {
    if (!lambdaVal || !muVal || (lambdaVal + muVal) === 0) return 0;
    const unavailability = lambdaVal / (lambdaVal + muVal)
    // console.log("Unavailability...",unavailability)
    return unavailability;
  };

  const factorial = (num) => {
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    return result;
  };

  const combination1 = (nVal, i) => {
    return factorial(nVal) / (factorial(i) * factorial(nVal - i));
  };


const unAvailabilityValueNonIdentical = (kVal, nVal, components, missionTime) => {
  if (!components || components.length === 0) return 0;

  const validComponents = components.filter(
    comp =>
      comp &&
      Number.isFinite(Number(comp.lambda))
  );

  if (validComponents.length !== nVal) return 0;

  // Compute component unavailability (time-dependent)
  const uList = validComponents.map(comp => 1 - Math.exp(-Number(comp.lambda) * missionTime));
  const AList = uList.map(u => 1 - u); // availability

  console.log("kVal", kVal);
  console.log("nVal", nVal);
  console.log("uList", uList);
  console.log("AList", AList);

  let result = 0;

  // Minimum failures for system to fail
  const minFailures = nVal - kVal + 1;

  // Recursive function to sum combinations
  const combine = (index, failedCount, term) => {
    if (index === nVal) {
      if (failedCount >= minFailures) result += term;
      return;
    }
    // Case 1: component fails
    combine(index + 1, failedCount + 1, term * uList[index]);
    // Case 2: component works
    combine(index + 1, failedCount, term * AList[index]);
  };

  combine(0, 0, 1);

  console.log("Final Unavailability Result:", result);
  return result;
};


  const unAvailabilityValueIdentical = (kVal, nVal, lambdaVal, muVal) => {
    const u = unAvailabilityFn(lambdaVal, muVal);
    let result = 0;
    for (let i = kVal; i <= nVal; i++) {
      result += combination1(nVal, i) * Math.pow(u, i) * Math.pow(1 - u, nVal - i);
    }
    return result;
  };

  const getReliability = (lambdaValue, missionTimeValue) => {
    if (!lambdaValue || !missionTimeValue) return 0;
    const reliability = Math.exp(-(lambdaValue * missionTimeValue));
    return reliability;
  };

  const combination = (nVal, r) => {
    const fact = (x) => (x <= 1 ? 1 : x * fact(x - 1));
    return fact(nVal) / (fact(r) * fact(nVal - r));
  };

  const getKofNReliabilityNonIdentical = (kVal, nVal, components) => {
    if (!components || components.length === 0) return 0;

    let result = 0;

    const validComponents = components.filter(comp => comp && typeof comp.lambda === 'number');
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
          prob *= (1 - reliability);
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

    if (field === 'product') {
      if (selectedOption && selectedOption.value !== "Select from the product" && selectedOption.value) {
        // Ensure lambda is properly set as a number
        const lambdaValue = selectedOption.lambda !== undefined ? parseFloat(selectedOption.lambda) : 0;
        const mttrValue = selectedOption.mttr || '';
        const muValue = mttrValue ? 1 / parseFloat(mttrValue) : 0;

        updatedComponents[index] = {
          ...updatedComponents[index],
          lambda: lambdaValue,
          mu: muValue,
          mttr: mttrValue,
        productId: selectedOption.productId && selectedOption.productId !== "" ? selectedOption.productId : null, // ✅ Fix
          productName: selectedOption.productName,
          selectedOption: selectedOption,
          isManual: false
        };
      } else if (selectedOption && selectedOption.value === "Select from the product") {
        updatedComponents[index] = {
          ...updatedComponents[index],
          lambda: 0,
          mu: 0,
          mttr: '',
          selectedOption: selectedOption,
          isManual: false,
          productId: null,
          productName: ''
        };
      }
    } else if (field === 'lambda') {
      updatedComponents[index] = {
        ...updatedComponents[index],
        lambda: parseFloat(value) || 0,
        isManual: true,
        selectedOption: null
      };
    } else if (field === 'mttr') {
      const mttrValue = value;
      const muValue = mttrValue ? 1 / parseFloat(mttrValue) : 0;

      updatedComponents[index] = {
        ...updatedComponents[index],
        mttr: mttrValue,
        mu: muValue,
        isManual: true
      };
    }

    setNonIdenticalComponents(updatedComponents);
  };

  useEffect(() => {
    setIsLambdaEdited(false);
  }, [values?.productId]);

// const handleSubmit = () => {
//   // Prepare the base data
//   const data = {
//     lambda: parseFloat(lambda) || 0,
//     mu: mu || 0,
//     k: parseInt(k),
//     n: parseInt(n),
//     formula,
//     reliability: systemReliability,
//     unavailability: systemUnavailability,
//     type: 'K-out-of-N',  // ✅ Must be 'K-out-of-N'
//     elementType: 'K-out-of-N',  // ✅ Must be 'K-out-of-N'
//     kOfNType: selectedLabel,  // 'Identical', 'Non-Identical', or 'Load Sharing'
//     ...values
//   };

//   // Create the complete payload for API
//   const newKOfNData = {
//     projectId: projectId,
//     rbdId: rbdId,
//     k: parseInt(k),
//     n: parseInt(n),
//     formula,
//     lambda: parseFloat(lambda) || 0,
//     mu: mu || 0,
//     reliability: systemReliability,
//     unavailability: systemUnavailability,
//     type: 'K-out-of-N',  // ✅ Must be 'K-out-of-N'
//     elementType: 'K-out-of-N',  // ✅ Must be 'K-out-of-N'
//     kOfNType: selectedLabel,  // 'Identical', 'Non-Identical', or 'Load Sharing'
//     ...values
//   };

//   // Handle Non-Identical components
//   if (selectedLabel === "Non-Identical") {
//     newKOfNData.components = nonIdenticalComponents.map(comp => ({
//       lambda: comp.lambda || 0,
//       mu: comp.mu || 0,
//       mttr: comp.mttr || '',
//       productId: comp.productId,
//       productName: comp.productName,
//       isManual: comp.isManual,
//       reliability: getReliability(comp.lambda, missionTime),
//       unavailability: unAvailabilityFn(comp.lambda, comp.mu || 0),
//       type: 'K-out-of-N',  // ✅ For components too
//       elementType: 'K-out-of-N',  // ✅ For components too
//     }));
//   }
  
//   // Handle Load Sharing specific data (if needed)
//   if (selectedLabel === "Identical (Load Sharing)") {
//     newKOfNData.loadSharingConfig = {
//       enabled: true,
//       loadDistribution: formula || 'standard',
//     };
//   }

//   console.log("Sending to API with type:", selectedLabel);
//   console.log("Payload:", newKOfNData);

//   // Make the API call
//   Api.post("/api/v1/elementParametersRBD/create", newKOfNData)
//     .then((response) => {
//       console.log("API Response:", response.data);
//       if (response?.data?.success) {
//         onSubmit(data);
//         onClose();
//           getBlock();
//       }
//     })
//     .catch((error) => {
//       console.error("Error creating KOfN:", error);
//     });
// };
const handleSubmit = () => {
  // Prepare the data for API
  const newKOfNData = {
    projectId: projectId,
    productId: values.productId && values.productId !== "" ? values.productId : null, // ✅ Fix: Convert empty string to null
    rbdId: rbdId,
    k: parseInt(k),
    n: parseInt(n),
    formula: formula,
    lambda: parseFloat(lambda) || 0,
    mu: mu || 0,
    type: 'K-out-of-N',
    elementType: 'K-out-of-N',
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
    targetId : targetId,
  };

  // Handle Non-Identical components
  if (selectedLabel === "Non-Identical") {
    console.log("nonIdenticalComponents.....1...",nonIdenticalComponents);
    console.log("values.productId.....1...",currentBlock);
    newKOfNData.components = nonIdenticalComponents.map(comp => ({
      productId: comp.productId && comp.productId !== "" ? comp.productId : null, // ✅ Fix: Convert empty string to null
       lambda: comp.lambda || 0,
      mu: comp.mu || 0,
      mttr: comp.mttr || '',
      productName: comp.productName,
      isManual: comp.isManual,
      reliability: systemReliability,
      unavailability: systemUnavailability
    }));
  }

  console.log("Sending K-of-N data:", newKOfNData);

  // Make the API call
  Api.post("/api/v1/elementParametersRBD/create", newKOfNData)
    .then((response) => {
      console.log("API Response:", response.data);
      if (response?.data?.success) {
        onSubmit(newKOfNData);
        onClose();
      }
    })
    .catch((error) => {
      console.error("Error creating KOfN:", error);
      toast?.error?.("Failed to create K-out-of-N block") || alert("Failed to create K-out-of-N block");
    });
};
  const getBlock = () => {
    Api.get(`/api/v1/elementParametersRBD/getRBD/${rbdId}/${projectId}`)
      .then((res) => {
        const data = res.data.data;
        setShowSymbol(data.length > 0);
        setBlocks(data);
      })
      .catch(err => console.log(err, 'error'));
  };

  if (!isOpen) return null;


  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: "#f0f0f0",
        padding: "25px",
        borderRadius: "8px",
        minWidth: "450px",
        maxWidth: "850px",
        border: "1px solid #999",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <h3 style={{
          marginTop: 0,
          marginBottom: "20px",
          fontSize: "16px",
          fontWeight: "bold",
          borderBottom: "1px solid #ccc",
          paddingBottom: "10px"
        }}>
          {selectedLabel === "Identical" && (
            mode === "add" ? "Add K-out-of-N Block - (Identical)" : "Edit K-out-of-N Block - (Identical)"
          )}
          {selectedLabel === "Non-Identical" && (
            mode === "add" ? "Add K-out-of-N Block - (Non-Identical)" : "Edit K-out-of-N Block - (Non-Identical)"
          )}
          {selectedLabel === "Identical (Load Sharing)" && (
            mode === "add" ? "Add K-out-of-N Block - (Identical (Load Sharing))" : "Edit K-out-of-N Block - (Identical (Load Sharing))"
          )}
        </h3>

        <div>
          {selectedLabel !== "Non-Identical" && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "15px",
              alignItems: "end"
            }}>
              <div>
                <label style={{
                  fontSize: "11px",
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold"
                }}>
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
                      minHeight: "30px"
                    })
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
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
                    borderRadius: "3px"
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  fontWeight: "500"
                }}>
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
                    borderRadius: "3px"
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: "20px" }} className="mt-3">
          <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
            <div>
              <label style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "13px",
                fontWeight: "500"
              }}>
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
            <div >
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  fontWeight: "500"
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
                  boxSizing: "border-box"
                }}
              />
            </div>
            {selectedLabel === "Identical (Load Sharing)" && (
              <div style={{ marginBottom: "20px" }} >
                <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "13px",
                        fontWeight: "500"
                      }}
                    >Load:</label>
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
                        boxSizing: "border-box"
                      }}
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* {selectedLabel !== "Non-Identical" && (
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  fontWeight: "500"
                }}>
                  System MTTR (hours):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={values?.mttr || ""}
                  onChange={(e) => handleChange('mttr', e.target.value)}
                  placeholder="MTTR value will auto-populate"
                  style={{
                    width: "100%",
                    padding: "6px",
                    border: "1px solid #7f9db9",
                    borderRadius: "3px",
                  }}
                />
              </div>
            )} */}

          </div>

          {selectedLabel === "Non-Identical" && n > 0 && (
            <div style={{
              marginTop: "20px",
              borderTop: "1px solid #ccc",
              paddingTop: "15px"
            }}>
              <label style={{
                display: "block",
                marginBottom: "15px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333"
              }}>
                Component Details (Non-Identical):
              </label>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "15px"
              }}>
                {nonIdenticalComponents.map((component, index) => (
                  <div key={component.id} style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#fff"
                  }}>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#555"
                    }}>
                      Component {index + 1}:
                    </label>

                    <div style={{ marginBottom: "10px" }}>
                      <CreatableSelect
                        value={component.selectedOption}
                        options={[
                          { label: "Select from the product", value: "Select from the product" },
                          ...options
                        ]}
                        onChange={(option) => {
                          if (option) {
                            handleComponentChange(index, 'product', option.value, option);
                          }
                        }}
                        placeholder="Select product or enter manually..."
                        styles={{
                          control: (base) => ({
                            ...base,
                            fontSize: "13px",
                            minHeight: "32px"
                          })
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "11px",
                        color: "#666"
                      }}>
                        Failure Rate λ (1/hour):
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={component.lambda || 0}
                        onChange={(e) => handleComponentChange(index, 'lambda', e.target.value)}
                        placeholder="Enter failure rate"
                        style={{
                          width: "100%",
                          padding: "5px",
                          border: "1px solid #7f9db9",
                          borderRadius: "3px",
                          fontSize: "12px"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "11px",
                        color: "#666"
                      }}>
                        MTTR (hours):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={component.mttr || ""}
                        onChange={(e) => handleComponentChange(index, 'mttr', e.target.value)}
                        placeholder="Enter MTTR"
                        style={{
                          width: "100%",
                          padding: "5px",
                          border: "1px solid #7f9db9",
                          borderRadius: "3px",
                          fontSize: "12px"
                        }}
                      />
                    </div>

                    {component.mu > 0 && (
                      <div style={{
                        marginTop: "8px",
                        fontSize: "11px",
                        color: "#4CAF50",
                        padding: "4px",
                        backgroundColor: "#e8f5e9",
                        borderRadius: "3px"
                      }}>
                        Repair Rate (μ): {component.mu.toFixed(6)} /hour
                      </div>
                    )}
                    <div>

                      <span>
                        U {index + 1}: {
                          (() => {
                            const lambda = Number(component?.lambda);
                            const mu = Number(component?.mu);

                            if (!Number.isFinite(lambda) || !Number.isFinite(mu) || (lambda + mu) === 0) {
                              return "0.000000";
                            }

                            return (lambda / (lambda + mu)).toFixed(6);
                          })()
                        }
                      </span>

                    </div>
                    <div>
                      <span>
                        Reliability {index + 1}: {Math.exp(-(component.lambda * missionTime))?.toFixed(6)}

                      </span>
                    </div>
                    <span className='mt-2'>
                      Q {index + 1} : {1 - Math.exp(-(component.lambda * missionTime))?.toFixed(6)}
                    </span>
                  </div>

                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: "#e8f4f8",
          padding: "12px",
          marginBottom: "20px",
          border: "1px solid #4CAF50",
          borderRadius: "4px"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Calculated Values:</div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            {selectedLabel !== "Non-Identical" && (
              <span>Failure Rate (λ): {lambda || 'N/A'}</span>
            )}
            {selectedLabel !== "Non-Identical" && (
              <span>Repair Rate (μ = 1/MTTR): {mu?.toFixed(6)}</span>
            )}
            <span>System Reliability: {systemReliability?.toFixed(6)}</span>
            <span>System Unavailability: {systemUnavailability?.toFixed(6)}</span>
          </div>
        </div>

        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          borderTop: "1px solid #ccc",
          paddingTop: "15px"
        }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: "8px 25px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
          >
            OK
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
              fontWeight: "500"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#da190b"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#f44336"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};