// KOfNConfigModal.jsx
import React, { useState, useEffect } from 'react';
import Api from "../../Api";
import { useParams, useLocation } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';

export const KOfNConfigModal = ({ isOpen, onClose, onSubmit, initialData, mode = 'add', currentBlock }) => {
  const [k, setK] = useState(null);
  const [n, setN] = useState(null);
  const [formula, setFormula] = useState('standard');
  const { id, rbdId } = useParams();
  const [missionTime, setMissionTime] = useState("");
  const projectId = id;
  const[systemUnavailability, setSystemUnavailability]=useState("");
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
    k: currentBlock?.k || '',
    n: currentBlock?.n || '',
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

  const [lambda, setLambda] = useState(0);
  const [isLambdaEdited,setIsLambdaEdited] = useState(false);

  const [options, setOptions] = useState([])
  const [mu, setMu] = useState(0);
  console.log("mu",values?.mttr)
  useEffect(() => {
    if (initialData) {
      setK(initialData.k || "");
      setN(initialData.n || "");
      setLambda(initialData.lambda || "");
      setMu(initialData.mu || "");
      setFormula(initialData.formula || 'standard');
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
    if
    (!isLambdaEdited){
 if (fr > 0) {
      setLambda((1 / fr)?.toFixed(6));
    } else {
      setLambda("");
    }
    }
   
  }, [values?.fr,isLambdaEdited]);

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
            mttr: item.mttr,
          }));
        setOptions(options);
        console.log("options", res.data.data.filter(item => item.mttr).map(item => item.mttr))
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
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
 
const unAvailabilityFn = (lambda, mu) => {
  if ((lambda + mu) === 0) return 0;
  return lambda / (lambda + mu);
};

const factorial = (num) => {
  let result = 1;
  for (let i = 2; i <= num; i++) {
    result *= i;
  }
  return result;
};

const combination1 = (n, i) => {
  return factorial(n) / (factorial(i) * factorial(n - i));
};
const unAvailabilityValue= (k, n, lambda, mu) => {
  const u = unAvailabilityFn(lambda, mu);
  let result = 0;

  for (let i = k; i <= n; i++) {
    result += combination1(n, i) * Math.pow(u, i) * Math.pow(1 - u, n - i);
  }
  return result;
};
useEffect(() => {
  const kVal = Number(k);
  const nVal = Number(n);
  const lambdaVal = Number(lambda);
  const muVal = Number(mu);
  if (
    !isNaN(kVal) &&
    !isNaN(nVal) &&
    !isNaN(lambdaVal) &&
    !isNaN(muVal)
  ) {
    const result = unAvailabilityValue(kVal, nVal, lambdaVal, muVal);

    setSystemUnavailability(
      Number(result?.toFixed(6)) || 0
    );
  } else {
    setSystemUnavailability(0); 
  }
}, [k, n, lambda, mu]);
  useEffect(()=>{
    setIsLambdaEdited(false);
   },[values?.productId]);


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
      
      lambda: parseFloat(lambda) || 0,
      mu,
      // mttr: mttr,
      formula,
      ...values
    };
   console.log("databbjkk",data)
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
                  handleChange("mttr", option.mttr)
                } else {
                  handleChange("productName", "");
                  handleChange("partNumber", "");
                  handleChange("indexCount", "");
                  handleChange("fr", "");
                  handleChange("productId", "");
                  handleChange("id", "");
                  handleChange("fmecaId", "");
                  handleChange("mttr", "");
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
              onChange={(e) =>{ setLambda(parseFloat(e.target.value) || 0);
                setIsLambdaEdited(true)}}
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
                value={values?.mttr || ""}
                onChange={(e) => handleChange('mttr', e.target.value)}
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
    
               <span>
              Repair Rate (μ = 1/MTTR): {mu?.toFixed(6)}
            </span>
            <span>Reliability: {systemReliability?.toFixed(6)}</span>
            <span>
              unavailability:{systemUnavailability}
            </span>
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