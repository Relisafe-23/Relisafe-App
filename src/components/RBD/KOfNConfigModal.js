// KOfNConfigModal.jsx
import React, { useState, useEffect } from 'react';
import Api from "../../Api";
import { useParams, useLocation } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';

export const KOfNConfigModal = ({ isOpen, onClose, onSubmit, initialData, mode = 'add', currentBlock }) => {
  const [k, setK] = useState(2);
  const [n, setN] = useState(3);
  const [selectedProduct, setSelectedProduct] = useState("")
  const [mu, setMu] = useState(1000);
  const [formula, setFormula] = useState('standard');
  const { id, rbdId } = useParams();
  const [missionTime, setMissionTime] = useState("");
  const [selectedProductId, setSelectedProductId] = useState([]);
  const projectId = id;
  const [values, setValues] = useState({
    relDes: currentBlock?.relDes || '',
    time: currentBlock?.time || " ",
    elementType: currentBlock?.elementType || 'REGULAR',
    partNumber: currentBlock?.partNumber || '',
    fr: currentBlock?.fr || '',
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
    mttr: currentBlock?.mttr || '',
    productNumber: currentBlock?.productNumber || '',
    productTreeItemID: currentBlock?.productTreeItemID || '',
    productId: currentBlock?.productId || '',
  });
  const [unavailability, setUnavailability] = useState(0);
  const [systemUnavailability, setSystemUnavailability] = useState(0);
  const [Reliability,setReliability] = useState(0)
  const [lambda, setLambda] = useState(0);
  const [mttrValue, setMttrValue] = useState(values?.mttr || "");
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (initialData) {
      setK(initialData.k || 2);
      setN(initialData.n || 3);
      setLambda(initialData.lambda || 0.001);
      setMu(initialData.mu || 1000);
      setFormula(initialData.formula || 'standard');
    }
  }, [initialData]);

  
  useEffect(() => {
    if (mttrValue && parseFloat(mttrValue) > 0) {
      const calculatedMu = 1 / parseFloat(mttrValue);
      setMu(calculatedMu);
    } else {
      setMu(0);
    }
  }, [mttrValue]);

  useEffect(() => {
    if (values?.productId) {
      fetchMttr(values.productId);
    } else {
      setMttrValue("");
      setValues(prev => ({ ...prev, mttr: "" }));
    }
  }, [values.productId]);

  useEffect(() => {
    const fr = Number(values?.fr);
    if (fr > 0) {
      setLambda((1 / fr)?.toFixed(6));
    } else {
      setLambda("");
    }
  }, [values?.fr]);

  useEffect(() => {
    getRbdConfig();
    getProductName();
  }, [projectId]);

  const handleChange = (field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
useEffect(() => {
  if (lambda > 0 && mu > 0) {
    const u = lambda / (lambda + mu);
    setUnavailability(u);
  } else {
    setUnavailability(0);
  }
}, [lambda, mu]);


useEffect(() => {
  if (unavailability > 0 && k > 0 && n > 0) {
    const minFailures = k ;
    let ua_s = 0;
    
   
    for (let i = minFailures; i <= n; i++) {
      ua_s += combination(n, i) * Math.pow(unavailability, i) * Math.pow(1 - unavailability, n - i);
    }
    
    setSystemUnavailability(ua_s);
    setReliability(1 - ua_s);
  }
}, [unavailability, k, n]);
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
        setOptions(options);
        console.log("options",res)
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  };

  const fetchMttr = (productId) => {
    if (!productId) {
      setMttrValue("");
      setValues(prev => ({ ...prev, mttr: "" }));
      return;
    }
    
    Api.get(`/api/v1/mttrPrediction/${productId}`)
      .then((res) => {
        console.log("re1234",res.data)
        console.log("ProductId",productId)
        const mttr = res?.data?.data?.mttr;
       console.log("mttr........",mttr)
        const mttrValueToSet = mttr || "";
        setMttrValue(mttrValueToSet);
        setValues(prev => ({
          ...prev,
          mttr: mttrValueToSet
        }));
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          console.error("Unauthorized access");
        } else {
          // Handle case where product has no MTTR data
          setMttrValue("");
          setValues(prev => ({ ...prev, mttr: "" }));
        }
      });
  };

  const getRbdConfig = () => {
    Api.get("/api/v1/EditConfigRBD/", {
      params: {
        projectId: projectId,
      }
    })
      .then((res) => {
        const Time = res?.data?.data.filter(item => item.missionTime).map(item => item.missionTime)[0];
        setMissionTime(Time);
      })
      .catch((error) => {
        console.error("Error fetching RBD config:", error);
      });
  };

  if (!isOpen) return null;

  const getReliability = (productId) => {
    if (!lambda || !missionTime) return 0;
    return Math.exp(-(lambda * missionTime));
  };
  
  const combination = (n, r) => {
    const fact = (x) => (x <= 1 ? 1 : x * fact(x - 1));
    return fact(n) / (fact(r) * fact(n - r));
  };

  const getKofN_2of3 = (k, n, reliabilityFn) => {
    const R = reliabilityFn();
    let result = 0;
    for (let r = k; r <= n; r++) {
      result += combination(n, r) * Math.pow(R, r) * Math.pow(1 - R, n - r);
    }
    return result;
  };
  
  const systemReliability = getKofN_2of3(k, n, getReliability);

  const handleSubmit = () => {
    const data = {
      k,
      n,
      lambda: parseFloat(lambda) || 0,
      mu: mu, 
      mttr: mttrValue,
      formula,
      ...values
    };

    Api.post(
      `/api/v1/elementParametersRBD/create/KOfN/${rbdId}/${projectId}`,
      data
    )
      .then((response) => {
        console.log("API Response:", response.data);
        if (response?.data?.success) {
          onSubmit(data);
        }
      })
      .catch((error) => {
        console.error("Error creating KOfN:", error);
      });
    onClose();
  };

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
        maxWidth: "550px",
        border: "1px solid #999",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
      }}>
        <h3 style={{
          marginTop: 0,
          marginBottom: "20px",
          fontSize: "16px",
          fontWeight: "bold",
          borderBottom: "1px solid #ccc",
          paddingBottom: "10px"
        }}>
          {mode === 'add' ? 'Add K-out-of-N Block' : 'Edit K-out-of-N Block'}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '15px'
        }}>
          <div>
            <label style={{
              fontSize: '11px',
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold'
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
                  fontSize: '15px',
                  minHeight: '30px'
                })
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
              Ref Des:
            </label>
            <input
              type="text"
              value={values?.productName || ""}
              onChange={(e) => handleChange('productName', e.target.value)}
              placeholder="Transmitter"
              style={{
                width: "100%",
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
              onChange={(e) => setLambda(parseFloat(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #7f9db9",
                borderRadius: "3px"
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
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
                  width: "100px",
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
                n (total items):
              </label>
              <input
                type="number"
                min={k}
                max="10"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value) || k)}
                style={{
                  width: "100px",
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
                MTTR (hours):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={mttrValue}
                onChange={(e) => {
                  const newMttrValue = e.target.value;
                  setMttrValue(newMttrValue);
                  setValues(prev => ({ ...prev, mttr: newMttrValue }));
                }}
                placeholder="MTTR value will auto-populate"
                style={{
                  width: "120px",
                  padding: "6px",
                  border: "1px solid #7f9db9",
                  borderRadius: "3px"
                }}
              />
            </div>
          </div>
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
            <span>Failure Rate (λ): {lambda || 'N/A'}</span>
            <span>MTTR: {mttrValue ? `${mttrValue} hrs` : 'Not Available'}</span>
            <span>Repair Rate (μ = 1/MTTR): {mu ? mu.toFixed(6) : 'N/A'}</span>
            <span>Reliability: {systemReliability?.toFixed(6)}</span>
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