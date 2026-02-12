


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Api from '../../Api';
import CreatableSelect from 'react-select/creatable';

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
  
  const userId = localStorage.getItem("userId");
  const [productIds, setProductIds] = useState(null); 
  const [tableData, setTableData] = useState([]);
  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : ""
  
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
        console.log("product list",res)
        const options = res.data.data
          .filter(item => item?.indexCount && item?.partNumber)
          .map(item => ({
            label: item.indexCount,
            value: item.indexCount,
            partNumber: item.partNumber,
            productName: item.productName,
            productId: item.productId,
            fr: item.fr,
            productId: item.productId
          }));
        const productIdst = res.data.data.filter(item => item?.productId).map(item => item.productId);
        console.log("productIdst", productIdst)
        setProductIds(productIdst);
      
       
        setOptions(options);
      });
  }

    const getProductData = () => {
      console.log("djnknknknk")
      Api.get("/api/v1/fmeca/product/list", {
        params: {
          projectId: projectId,
          productId: productId,
          userId: userId,
        },
      })
        .then((res) => {
          console.log("FMECA Product Data:", res.data.data);
          setTableData(res?.data?.data);
          // getProjectDetails();
        })
        .catch((error) => {
          const errorStatus = error?.response?.status;
          if (errorStatus === 401) {
        
          }
        });
    };

  const getProductFRPData = () => {
     if (!productId) return; 
    const companyId = localStorage.getItem("companyId");
    console.log("productId78765")
    Api.get(`/api/v1/failureRatePrediction/details`, {
      params: {
        projectId,
        companyId,
        productId,
        userId: userId,
      },
    }).then((res) => {
      console.log("jjnjinkobjihjbigw")


      console.log("resFRP", res)
    })
  }
  const getFmecaData = (productId) => {
    console.log("Fetching FMECA data for productId:", productId);
  }

  useEffect(() => {
    if (!projectId) return;
    getProductName();
    getProductFRPData();
    getProductData();
  }, [productId])
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (field, value) => {
    console.log("field, value",field, value)
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

  return (
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
  <div style={{
    marginBottom: '20px'
  }}>
    {/* Connection with Product Tree / FMECA */}
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
              } else {
                handleChange("productName", "");
                handleChange("partNumber", "");
                handleChange("indexCount", 0);
                handleChange("fr", "");
              }
            }}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              fontSize: '11px'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Select FM number:
          </label>
          <input
            type="text"
            value={formData?.fmNumber || ""}
            onChange={(e) => handleChange('fmNumber', e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              fontSize: '11px'
            }}
          />
        </div>
        
        <div>
          <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            FM description:
          </label>
          <textarea
            value={formData.fmDescription}
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
                checked={formData.frDistribution === ''}
                onChange={() => handleChange('frDistribution', '')}
              />
              <label htmlFor="frDefault" style={{ marginLeft: '5px', fontSize: '12px' }}>Default</label>
            </div>
            <div>
              <input
                type="radio"
                id="frKOutOfN"
                name="frDistribution"
                checked={formData.kOutOfN}
                onChange={(e) => handleChange('kOutOfN', e.target.checked)}
              />
              <label htmlFor="frKOutOfN" style={{ marginLeft: '5px', fontSize: '12px' }}>K out of N</label>
            </div>
          </div>

          {formData?.kOutOfN && (
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
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
            FR distribution parameters:
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
            <div>
              <label style={{ fontSize: '11px', marginRight: '5px' }}>MTBF [hours]:</label>
              <input
                type="text"
                value={formData?.fr ? (1 / formData.fr) : ""}
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
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
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
  );
};
export { ElementParametersModal };
