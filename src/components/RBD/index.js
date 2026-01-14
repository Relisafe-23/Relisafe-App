import React, { useState } from 'react';
import SplitKofN from './SplitKofN';
// Switch Configuration Modal Component
export  const SwitchConfigurationModal = ({ isOpen, onClose, onSubmit, currentSwitchData }) => {
  const [formData, setFormData] = useState({
    switchExists: currentSwitchData?.switchExists || true,
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
            {/* Switch FR distribution checkbox */}
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

            {/* FR distribution parameters section - only shows when switchFRDistribution is checked */}
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

// Updated ElementParametersModal with Switch button for K-out-of-N
 export const ElementParametersModal = ({ isOpen, onClose, onSubmit, onOpenSwitchConfig, currentBlock }) => {
  const [formData, setFormData] = useState({
    relDes: currentBlock?.relDes || '',
    elementType: currentBlock?.elementType || 'REGULAR',
    patNumber: currentBlock?.patNumber || '',
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
    productTreeItemID: currentBlock?.productTreeItemID || '',
    fmNumber: currentBlock?.fmNumber || '',
    description: currentBlock?.description || '',
    remark: currentBlock?.remark || '',
    fmDescription: currentBlock?.fmDescription || ''
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
        width: '800px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Element parameters definition</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {/* Left Column */}
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                  Rel Des:
                </label>
                <input
                  type="text"
                  value={formData.relDes}
                  onChange={(e) => handleChange('relDes', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}
                  placeholder="Transmitter"
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
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

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                  Pat Number:
                </label>
                <input
                  type="text"
                  value={formData.patNumber}
                  onChange={(e) => handleChange('patNumber', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
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

              <div style={{ marginBottom: '10px' }}>
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

              <div style={{ marginBottom: '10px' }}>
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

              <div style={{ marginBottom: '10px' }}>
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

            {/* Right Column */}
            <div>
              <div style={{ marginBottom: '10px' }}>
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
                
                {formData.kOutOfN && (
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

              <div style={{ marginBottom: '10px' }}>
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
                </select>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                  FR distribution parameters:
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                  <div>
                    <label style={{ fontSize: '11px', marginRight: '5px' }}>MTBF [hours]:</label>
                    <input
                      type="text"
                      value={formData.mtbf}
                      onChange={(e) => handleChange('mtbf', e.target.value)}
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

              <div style={{ marginBottom: '10px' }}>
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

              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>
                  Connection with Product Tree / FMECA
                </h4>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', display: 'block', marginBottom: '3px' }}>
                    Product Tree Item ID:
                  </label>
                  <input
                    type="text"
                    value={formData.productTreeItemID}
                    onChange={(e) => handleChange('productTreeItemID', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      fontSize: '11px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', display: 'block', marginBottom: '3px' }}>
                    Select FM number:
                  </label>
                  <input
                    type="text"
                    value={formData.fmNumber}
                    onChange={(e) => handleChange('fmNumber', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      fontSize: '11px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', display: 'block', marginBottom: '3px' }}>
                    FM description:
                  </label>
                  <textarea
                    value={formData.fmDescription}
                    onChange={(e) => handleChange('fmDescription', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      fontSize: '11px',
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description and Remark */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Description:
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  fontSize: '12px',
                  minHeight: '50px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Remark:
              </label>
              <textarea
                value={formData.remark}
                onChange={(e) => handleChange('remark', e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  fontSize: '12px',
                  minHeight: '50px',
                  resize: 'vertical'
                }}
              />
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

// RBDBlock Component 
   export const RBDBlock = ({ id, type, x, y, onEdit, onDelete, blockData }) => {
  const getBlockContent = () => {
    switch(type) {
      case 'Regular':
        return 'RS\n19760.5';
      case 'K-out-of-N':
        const k = blockData?.k || '2';
        const n = blockData?.n || '3';
        const mtbf = blockData?.mtbf || '1303617.9';
        return `Recover\n${mtbf}\n${k}/${n}`;
      case 'SubRBD':
        return 'Sub RBD';
      case 'Parallel Section':
        return 'PS\n119760.5';
      case 'Parallel Branch':
        return 'Branch';
      default:
        return 'Block';
    }
  };

  const renderBlock = () => {
    const commonProps = {
      onClick: (e) => {
        e.stopPropagation();
        onEdit(e, id, blockData);
      },
      style: { cursor: "pointer" }
    };

    switch(type) {
      case 'Regular':
        return (
          <>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill="white"
              stroke="black"
              strokeWidth="2"
              rx="0"
              ry="0"
              {...commonProps}
            />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              {...commonProps}
            >
              {getBlockContent()}
            </text>
          </>
        );

      case 'K-out-of-N':
        const blockText = getBlockContent();
        const lines = blockText.split('\n');
        
        return (
          <>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill="#e6f3ff"
              stroke="#0066cc"
              strokeWidth="2"
              rx="5"
              ry="5"
              {...commonProps}
            />
            
            <text
              x={x + 30}
              y={y + 15}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#0066cc"
              {...commonProps}
            >
              {lines[0]}
            </text>
            
            <text
              x={x + 30}
              y={y + 25}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="#0066cc"
              {...commonProps}
            >
              {lines[1]}
            </text>
            
            <text
              x={x + 30}
              y={y + 35}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#0066cc"
              {...commonProps}
            >
              {lines[2]}
            </text>
          </>
        );

      case 'SubRBD':
        return (
          <>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill="#fff0e6"
              stroke="#cc6600"
              strokeWidth="2"
              rx="5"
              ry="5"
              {...commonProps}
            />
            <rect
              x={x + 5}
              y={y + 5}
              width="50"
              height="30"
              fill="white"
              stroke="#cc6600"
              strokeWidth="1"
              strokeDasharray="2,2"
              {...commonProps}
            />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#cc6600"
              {...commonProps}
            >
              {getBlockContent()}
            </text>
          </>
        );

      case 'Parallel Section':
        return (
          <g {...commonProps}>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill="#e6ffe6"
              stroke="#006600"
              strokeWidth="2"
              rx="5"
              ry="5"
            />
            <line x1={x + 15} y1={y + 10} x2={x + 15} y2={y + 30} stroke="#006600" strokeWidth="1" />
            <line x1={x + 30} y1={y + 10} x2={x + 30} y2={y + 30} stroke="#006600" strokeWidth="1" />
            <line x1={x + 45} y1={y + 10} x2={x + 45} y2={y + 30} stroke="#006600" strokeWidth="1" />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#006600"
            >
              {getBlockContent()}
            </text>
          </g>
        );

      case 'Parallel Branch':
        return (
          <g {...commonProps}>
            <polygon
              points={`
                ${x + 30},${y} 
                ${x + 60},${y + 20} 
                ${x + 30},${y + 40} 
                ${x},${y + 20}
              `}
              fill="#fff0f5"
              stroke="#cc0066"
              strokeWidth="2"
            />
            <line x1={x + 20} y1={y + 10} x2={x + 40} y2={y + 10} stroke="#cc0066" strokeWidth="1" />
            <line x1={x + 20} y1={y + 30} x2={x + 40} y2={y + 30} stroke="#cc0066" strokeWidth="1" />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#cc0066"
            >
              Parallel{'\n'}Branch
            </text>
          </g>
        );

      default:
        return (
          <>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill="lightblue"
              stroke="black"
              strokeWidth="2"
              rx="5"
              ry="5"
              {...commonProps}
            />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              {...commonProps}
            >
              {getBlockContent()}
            </text>
          </>
        );
    }
  };

  return (
    <g>
      {renderBlock()}
      <g onClick={(e) => {
        e.stopPropagation();
        onDelete(id);
      }} style={{ cursor: "pointer" }}>
        <circle cx={x + 65} cy={y} r="8" fill="red" />
        <text x={x + 65} y={y + 2} textAnchor="middle" fontSize="10" fill="white">X</text>
      </g>
    </g>
  );
};

// InsertionNode Component
export const InsertionNode = ({ x, y, onOpenMenu }) => {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r="6"
        fill="black"
        stroke="black"
        strokeWidth="1"
        style={{ cursor: "context-menu" }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenMenu(e.clientX, e.clientY);
        }}
      />
      <line
        x1={x - 3} y1={y}
        x2={x + 3} y2={y}
        stroke="white"
        strokeWidth="1.5"
      />
      <line
        x1={x} y1={y - 3}
        x2={x} y2={y + 3}
        stroke="white"
        strokeWidth="1.5"
      />
    </g>
  );
};

// BiDirectionalSymbol Component
export const BiDirectionalSymbol = ({ onNodeClick, onOpenMenu, blocks, onDeleteBlock, onEditBlock }) => {
  const boxWidth = 60;
  const boxHeight = 40;
  const arrowWidth = 15;
  const arrowHeight = 20;
  const centerPointY = 50;
  const nodeRadius = 6;
  const blockWidth = 60;
  const nodeSpacing = 20;
  const blockSpacing = 20;
  const minOutputGap = 50;

  const leftBoxX = 50;
  const baseRightBoxX = 650;
  const dynamicRightBoxX = baseRightBoxX + (blocks.length * 30);

  const calculateLayout = () => {
    if (blocks.length === 0) {
      const centerX = (leftBoxX + boxWidth + baseRightBoxX) / 2;
      return {
        items: [],
        totalWidth: 0,
        startX: centerX,
        actualRightBoxX: baseRightBoxX
      };
    }

    const totalBlocksWidth = blocks.length * blockWidth;
    const totalNodesWidth = (blocks.length + 1) * nodeSpacing * 2;
    const totalBlockSpacing = (blocks.length - 1) * blockSpacing;
    const totalNeededWidth = totalBlocksWidth + totalNodesWidth + totalBlockSpacing;
    
    const requiredRightBoxX = leftBoxX + boxWidth + totalNeededWidth + minOutputGap + boxWidth;
    const actualRightBoxX = Math.max(baseRightBoxX, requiredRightBoxX);
    
    const availableWidth = actualRightBoxX - leftBoxX - boxWidth * 2;
    const startX = leftBoxX + boxWidth + (availableWidth - totalNeededWidth) / 2 + nodeSpacing;
    
    const items = [];
    let currentX = startX;
    
    items.push({
      type: 'node',
      id: 'node-start',
      x: currentX,
      y: centerPointY
    });
    currentX += nodeSpacing;

    blocks.forEach((block, index) => {
      items.push({
        type: 'block',
        id: block.id,
        blockType: block.type,
        blockData: block.data,
        x: currentX,
        y: centerPointY - 20
      });
      currentX += blockWidth + blockSpacing;

      if (index < blocks.length - 1) {
        items.push({
          type: 'node',
          id: `node-${block.id}`,
          x: currentX,
          y: centerPointY
        });
        currentX += nodeSpacing;
      }
    });

    if (blocks.length > 0) {
      items.push({
        type: 'node',
        id: 'node-end',
        x: currentX,
        y: centerPointY
      });
    }

    return {
      items,
      totalWidth: currentX - startX,
      startX,
      actualRightBoxX
    };
  };

  const layout = calculateLayout();
  const items = layout.items;
  const rightBoxX = layout.actualRightBoxX;

  const leftArrowPoints = [
    [rightBoxX, centerPointY - arrowHeight / 2],
    [rightBoxX + arrowWidth, centerPointY],
    [rightBoxX, centerPointY + arrowHeight / 2]
  ].map(p => p.join(',')).join(' ');

  const rightArrowPoints = [
    [leftBoxX + boxWidth, centerPointY - arrowHeight / 2],
    [leftBoxX + boxWidth - arrowWidth, centerPointY],
    [leftBoxX + boxWidth, centerPointY + arrowHeight / 2]
  ].map(p => p.join(',')).join(' ');

  const getConnectionPoints = () => {
    const connectionPoints = [];
    
    if (items.length === 0) {
      connectionPoints.push({
        from: leftBoxX + boxWidth,
        to: rightBoxX,
        y: centerPointY
      });
    } else {
      connectionPoints.push({
        from: leftBoxX + boxWidth,
        to: items[0].x - nodeRadius,
        y: centerPointY
      });

      for (let i = 0; i < items.length - 1; i++) {
        const current = items[i];
        const next = items[i + 1];
        
        let fromX, toX;
        
        if (current.type === 'block') {
          fromX = current.x + blockWidth;
        } else {
          fromX = current.x + nodeRadius;
        }
        
        if (next.type === 'block') {
          toX = next.x;
        } else {
          toX = next.x - nodeRadius;
        }
        
        connectionPoints.push({
          from: fromX,
          to: toX,
          y: centerPointY
        });
      }

      const lastItem = items[items.length - 1];
      let lastX;
      if (lastItem.type === 'block') {
        lastX = lastItem.x + blockWidth;
      } else {
        lastX = lastItem.x + nodeRadius;
      }
      
      const minEndX = rightBoxX - minOutputGap;
      const endX = Math.min(lastX + 20, minEndX);
      
      connectionPoints.push({
        from: lastX,
        to: endX,
        y: centerPointY
      });
      
      connectionPoints.push({
        from: endX,
        to: rightBoxX,
        y: centerPointY
      });
    }
    
    return connectionPoints;
  };

  const connectionPoints = getConnectionPoints();
  const svgWidth = Math.max(750, rightBoxX + 100);

  return (
    <svg width={svgWidth} height="100" viewBox={`0 0 ${svgWidth} 100`} style={{ overflow: 'visible' }}>
      {connectionPoints.map((point, index) => (
        <line
          key={`line-${index}`}
          x1={point.from}
          y1={point.y}
          x2={point.to}
          y2={point.y}
          stroke="black"
          strokeWidth="2"
        />
      ))}

      <g onClick={() => onNodeClick("LEFT")} style={{ cursor: "pointer" }}>
        <rect
          x={leftBoxX}
          y={centerPointY - boxHeight / 2}
          width={boxWidth}
          height={boxHeight}
          fill="black"
        />
        <polygon points={rightArrowPoints} fill="white" />
        <text
          x={leftBoxX + boxWidth / 2}
          y={centerPointY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          Input
        </text>
      </g>

      <g onClick={() => onNodeClick("RIGHT")} style={{ cursor: "pointer" }}>
        <rect
          x={rightBoxX}
          y={centerPointY - boxHeight / 2}
          width={boxWidth}
          height={boxHeight}
          fill="black"
        />
        <polygon points={leftArrowPoints} fill="white" />
        <text
          x={rightBoxX + boxWidth / 2}
          y={centerPointY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          Output
        </text>
      </g>

      {items.map((item) => {
        if (item.type === 'node') {
          return (
            <InsertionNode
              key={item.id}
              x={item.x}
              y={item.y}
              onOpenMenu={onOpenMenu}
            />
          );
        } else if (item.type === 'block') {
          return (
            <RBDBlock
              key={item.id}
              id={item.id}
              type={item.blockType}
              x={item.x}
              y={item.y}
              onEdit={onEditBlock}
              onDelete={onDeleteBlock}
              blockData={item.blockData}
            />
          );
        }
        return null;
      })}

      {blocks.length === 0 && (
        <InsertionNode
          x={layout.startX}
          y={centerPointY}
          onOpenMenu={onOpenMenu}
        />
      )}
    </svg>
  );
};

// RBDContextMenu Component
export const RBDContextMenu = ({ x, y, onSelect, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: y,
      left: x,
      background: "#fff",
      border: "1px solid #ccc",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 1000,
      width: "180px"
    }}
    onMouseLeave={onClose}
  >
    {[
      "Add Regular",
      "Add K-out-of-N",
      "Add SubRBD",
      "Add Parallel Section",
      "Add Parallel Branch"
    ].map(item => (
      <div
        key={item}
        onClick={() => onSelect(item)}
        style={{
          padding: "8px",
          cursor: "pointer",
          ":hover": {
            backgroundColor: "#f0f0f0"
          }
        }}
      >
        {item}
      </div>
    ))}
  </div>
);

// BlockContextMenu Component
export const BlockContextMenu = ({ x, y, onSelect, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: y,
      left: x,
      background: "#fff",
      border: "1px solid #ccc",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 1001,
      width: "180px"
    }}
    onMouseLeave={onClose}
  >
    {[
      "Edit...",
      "Delete...",
      "Split K-out-of-N...",
      "Add Regular",
      "Add K-out-of-N",
      "Add SubRBD",
      "Add Parallel Section",
      "Add Parallel Branch"
    ].map(item => (
      <div
        key={item}
        onClick={() => onSelect(item)}
        style={{
          padding: "8px",
          cursor: "pointer",
          ":hover": {
            backgroundColor: "#f0f0f0"
          }
        }}
      >
        {item}
      </div>
    ))}
  </div>
);

// Main Component
export default function RBDButton() {
  const [showSymbol, setShowSymbol] = useState(false);
  const [menu, setMenu] = useState(null);
  const [blockMenu, setBlockMenu] = useState({ open: false, blockId: null, x: 0, y: 0 });
  const [blocks, setBlocks] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [elementModal, setElementModal] = useState({
    open: false,
    mode: 'add',
    blockId: null,
    blockType: ''
  });
  const [switchModal, setSwitchModal] = useState({
    open: false,
    blockId: null,
    initialData: null
  });

  const openMenu = (x, y) => setMenu({ x, y });

  const handleNodeClick = (node) => {
    console.log("Node clicked:", node);
  };

  const handleSelect = (action) => {
    console.log("RBD action:", action);
    
    const type = action.replace("Add ", "");
    
    setElementModal({
      open: true,
      mode: 'add',
      blockId: nextId,
      blockType: type
    });
  };

  const handleModalSubmit = (formData) => {
    if (elementModal.mode === 'add') {
      const newBlock = {
        id: nextId,
        type: elementModal.blockType === 'K_OUT_OF_N' ? 'K-out-of-N' : 
              elementModal.blockType === 'SUBRBD' ? 'SubRBD' :
              elementModal.blockType === 'PARALLEL_SECTION' ? 'Parallel Section' :
              elementModal.blockType === 'PARALLEL_BRANCH' ? 'Parallel Branch' : 'Regular',
        data: {
          ...formData,
          elementType: elementModal.blockType === 'K_OUT_OF_N' ? 'K-out-of-N' : 
                     elementModal.blockType === 'SUBRBD' ? 'SubRBD' :
                     elementModal.blockType === 'PARALLEL_SECTION' ? 'Parallel Section' :
                     elementModal.blockType === 'PARALLEL_BRANCH' ? 'Parallel Branch' : 'Regular'
        }
      };
      
      setBlocks([...blocks, newBlock]);
      setNextId(nextId + 1);
    } else if (elementModal.mode === 'edit') {
      setBlocks(blocks.map(block => 
        block.id === elementModal.blockId 
          ? { 
              ...block, 
              data: {
                ...formData,
                elementType: block.type
              }
            }
          : block
      ));
    }
    
    setElementModal({ open: false, mode: 'add', blockId: null, blockType: '' });
  };

  const handleSwitchConfigOpen = (initialData) => {
    setSwitchModal({
      open: true,
      blockId: elementModal.blockId,
      initialData
    });
  };

  const handleSwitchSubmit = (switchData) => {
    if (elementModal.blockId) {
      setBlocks(blocks.map(block => 
        block.id === elementModal.blockId 
          ? { 
              ...block, 
              data: {
                ...block.data,
                switchData: switchData
              }
            }
          : block
      ));
    }
    
    setSwitchModal({ open: false, blockId: null, initialData: null });
  };

  const handleDeleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const handleEditBlock = (e, id, blockData) => {
    if (e) {
      const rect = e.target.getBoundingClientRect();
      setBlockMenu({ open: true, blockId: id, x: rect.right, y: rect.top });
    }
  };

  const handleBlockMenuSelect = (action) => {
    if (!blockMenu.blockId) return;
    
    if (action === "Edit...") {
      const block = blocks.find(b => b.id === blockMenu.blockId);
      setElementModal({
        open: true,
        mode: 'edit',
        blockId: blockMenu.blockId,
        blockType: block?.type === 'K-out-of-N' ? 'K_OUT_OF_N' :
                  block?.type === 'SubRBD' ? 'SUBRBD' :
                  block?.type === 'Parallel Section' ? 'PARALLEL_SECTION' :
                  block?.type === 'Parallel Branch' ? 'PARALLEL_BRANCH' : 'REGULAR'
      });
    } else if (action === "Delete...") {
      handleDeleteBlock(blockMenu.blockId);
    } else if (action.startsWith("Add ")) {
      const type = action.replace("Add ", "");
      setElementModal({
        open: true,
        mode: 'add',
        blockId: nextId,
        blockType: type === 'K-out-of-N' ? 'K_OUT_OF_N' :
                  type === 'SubRBD' ? 'SUBRBD' :
                  type === 'Parallel Section' ? 'PARALLEL_SECTION' :
                  type === 'Parallel Branch' ? 'PARALLEL_BRANCH' : 'REGULAR'
      });
    } else if (action === "Split K-out-of-N...") {
      alert("Splitting K-out-of-N block");
    }
    
    setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "20px", overflowX: 'auto' }}>
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        marginTop: "50px" 
      }}>
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => setShowSymbol(true)}
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            RBD
          </button>
        </div>

        {showSymbol && (
          <div style={{ marginTop: "20px", width: '100%', overflowX: 'auto' }}>
            <BiDirectionalSymbol
              onNodeClick={handleNodeClick}
              onOpenMenu={openMenu}
              blocks={blocks}
              onDeleteBlock={handleDeleteBlock}
              onEditBlock={handleEditBlock}
            />
          </div>
        )}
      </div>

      {menu && (
        <RBDContextMenu
          x={menu.x}
          y={menu.y}
          onSelect={handleSelect}
          onClose={() => setMenu(null)}
        />
      )}

      {blockMenu.open && (
        <BlockContextMenu
          x={blockMenu.x}
          y={blockMenu.y}
          onSelect={handleBlockMenuSelect}
          onClose={() => setBlockMenu({ open: false, blockId: null, x: 0, y: 0 })}
        />
      )}

      <ElementParametersModal
        isOpen={elementModal.open}
        onClose={() => setElementModal({ open: false, mode: 'add', blockId: null, blockType: '' })}
        onSubmit={handleModalSubmit}
        onOpenSwitchConfig={handleSwitchConfigOpen}
        currentBlock={blocks.find(b => b.id === elementModal.blockId)?.data}
      />

      <SwitchConfigurationModal
        isOpen={switchModal.open}
        onClose={() => setSwitchModal({ open: false, blockId: null, initialData: null })}
        onSubmit={handleSwitchSubmit}
        currentSwitchData={switchModal.initialData}
      />
    </div>
  );
}