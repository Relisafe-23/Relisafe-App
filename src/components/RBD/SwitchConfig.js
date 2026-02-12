import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Api from '../../Api';    
 const SwitchConfigurationModal = ({ isOpen, props, onClose, onSubmit, currentSwitchData }) => {
  const { id } = useParams();
  const [options, setOptions] = useState([]);
  const projectId = id || props?.match?.params?.id;
  const userId = localStorage.getItem("userId");
  const [productIds, setProductIds] = useState([]);
  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : ""
  console.log("productId45", productIds)
  //  const projectId = props?.location?.state?.projectId
  //   ? props?.location?.state?.projectId
  //   : props?.match?.params?.id;




 const getProductFRPData = () => {
  if (!productIds || productIds.length === 0) return;

  const companyId = localStorage.getItem("companyId");

  Api.get(`/api/v1/failureRatePrediction/details`, {
    params: {
      projectId,
      companyId,
      productIds, 
      userId,
    },
  }).then((res) => {
    console.log("resFRP", res.data);
  });
};

  // useEffect(() => {
  //   if (!project)
  //   getProductFRPData();
  // }, [productId])

  const [formData, setFormData] = useState({
    switchExists: currentSwitchData?.switchExists || true,
    time: currentSwitchData?.time || '',
    switchFRDistribution: currentSwitchData?.switchFRDistribution || false,
    timeIndependent: currentSwitchData?.timeIndependent || false,
    unreliability: currentSwitchData?.unreliability || '0.001',
    frDistributionType: currentSwitchData?.frDistributionType || 'Exponential',
    n: currentSwitchData?.n || '3',
    k: currentSwitchData?.k || '2'
  });

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
      zIndex: 1003
    }}>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '4px',
        width: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>
          RBD Element K-out-of-N Switch data
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            {/* Switch exists checkbox - left aligned with spacing */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="switchExists"
                checked={formData.switchExists}
                onChange={(e) => handleChange('switchExists', e.target.checked)}
                style={{
                  marginRight: '10px',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <label
                htmlFor="switchExists"
                style={{
                  fontSize: '14px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Switch exists
              </label>
            </div>

            {formData.switchExists && (
              <div style={{
                paddingLeft: '30px',
                borderLeft: '1px solid #eee'
              }}>

                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="switchFRDistribution"
                    checked={formData.switchFRDistribution}
                    onChange={(e) => handleChange('switchFRDistribution', e.target.checked)}
                    style={{
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <label
                    htmlFor="switchFRDistribution"
                    style={{
                      fontSize: '14px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Switch FR distribution
                  </label>
                </div>

                {/* Time independent checkbox */}
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="timeIndependent"
                    checked={formData.timeIndependent}
                    onChange={(e) => handleChange('timeIndependent', e.target.checked)}
                    style={{
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <label
                    htmlFor="timeIndependent"
                    style={{
                      fontSize: '14px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Time independent
                  </label>
                </div>


                {formData.switchFRDistribution && (
                  <div style={{
                    marginBottom: '20px',
                    paddingLeft: '20px',
                    borderLeft: '1px solid #f0f0f0'
                  }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#555'
                      }}>
                        FR distribution parameters:
                      </label>
                      <select
                        value={formData.frDistributionType}
                        onChange={(e) => handleChange('frDistributionType', e.target.value)}
                        style={{
                          width: '200px',
                          padding: '8px 12px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '14px',
                          backgroundColor: '#f9f9f9',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Exponential">Exponential</option>
                        <option value="Weibull">Weibull</option>
                        <option value="Normal">Normal</option>
                        <option value="Lognormal">Lognormal</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Unreliability input field - proper spacing and alignment */}
                <div style={{
                  marginBottom: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#555',
                    minWidth: '120px'
                  }}>
                    Unreliability:
                  </label>
                  <input
                    type="text"
                    value={formData.unreliability}
                    onChange={(e) => handleChange('unreliability', e.target.value)}
                    style={{
                      width: '150px',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: '#fff'
                    }}
                    placeholder="0.001"
                  />
                </div>

                {/* Visual representation - N, K, Switch */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '30px 0',
                  position: 'relative',
                  gap: '50px'
                }}>
                  {/* N box */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                      color: '#333'
                    }}>
                      N
                    </div>
                    <div style={{
                      width: '80px',
                      height: '40px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {formData.n}
                    </div>
                  </div>

                  {/* K box */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                      color: '#333'
                    }}>
                      K
                    </div>
                    <div style={{
                      width: '80px',
                      height: '40px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {formData.k}
                    </div>
                  </div>

                  {/* Switch box */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                      color: '#007bff'
                    }}>
                      Switch
                    </div>
                    <div style={{
                      width: '100px',
                      height: '40px',
                      backgroundColor: '#007bff',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0, 123, 255, 0.3)'
                    }}>
                      Switch
                    </div>
                  </div>
                </div>

                {/* Connection lines in visual representation */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '140px',
                  right: '140px',
                  height: '1px',
                  backgroundColor: '#333',
                  zIndex: -1
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '270px',
                  right: '270px',
                  height: '1px',
                  backgroundColor: '#333',
                  zIndex: -1
                }} />
              </div>
            )}
          </div>

          {/* Buttons - right aligned */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '15px',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 24px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: 'linear-gradient(to bottom, #f9f9f9, #e9e9e9)',
                color: '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '80px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'linear-gradient(to bottom, #e9e9e9, #d9d9d9)'}
              onMouseLeave={(e) => e.target.style.background = 'linear-gradient(to bottom, #f9f9f9, #e9e9e9)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '4px',
                background: 'linear-gradient(to bottom, #007bff, #0056b3)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '80px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'linear-gradient(to bottom, #0056b3, #004085)'}
              onMouseLeave={(e) => e.target.style.background = 'linear-gradient(to bottom, #007bff, #0056b3)'}
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwitchConfigurationModal;