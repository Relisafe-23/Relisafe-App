import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import MaterialTable from 'material-table';
import Paper from '@mui/material/Paper';
const Quartz = ({ onCalculate }) => {
  // Base failure rate data (frequency in MHz)
  const baseRates = [
    { frequency: 0.5, rate: 0.011 },
    { frequency: 1.0, rate: 0.013 },
    { frequency: 5.0, rate: 0.019 },
    { frequency: 10, rate: 0.022 },
    { frequency: 15, rate: 0.024 },
    { frequency: 20, rate: 0.026 },
    { frequency: 25, rate: 0.027 },
    { frequency: 30, rate: 0.028 },
    { frequency: 35, rate: 0.029 },
    { frequency: 40, rate: 0.030 },
    { frequency: 45, rate: 0.031 },
    { frequency: 50, rate: 0.032 },
    { frequency: 55, rate: 0.033 },
    { frequency: 60, rate: 0.033 },
    { frequency: 65, rate: 0.034 },
    { frequency: 70, rate: 0.035 },
    { frequency: 75, rate: 0.035 },
    { frequency: 80, rate: 0.036 },
    { frequency: 85, rate: 0.036 },
    { frequency: 90, rate: 0.037 },
    { frequency: 95, rate: 0.037 },
    { frequency: 100, rate: 0.037 },
    { frequency: 105, rate: 0.038 },
  ];
  // Quality factors
  const qualityFactors = [
    { type: 'MIL-SPEC', factor: 1.0 },
    { type: 'Lower', factor: 2.1 }
  ];
  // Environment factors
  const environmentFactors = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 3.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 10 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 6.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 16 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 12 },
    { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 17 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 22 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 28 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 23 },
    { env: 'SF', label: 'Space, Flight', factor: 0.50 },
    { env: 'MF', label: 'Missile, Flight', factor: 13 },
    { env: 'ML', label: 'Missile, Launch', factor: 32 },
    { env: 'CL', label: 'Cannon, Launch', factor: 500 }
  ];
  // State for form inputs
  const [inputs, setInputs] = useState({  
    frequency: null,
    quality: null,
    environment: null,
    customFrequency: ''
  });
  const [result, setResult] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [customFrequency, setCustomFrequency] = useState(null);
  const [errors, setErrors] = useState({
    frequency: "",
    quality: " ",
    environment: " ",
    customFrequency: ''
  });
  const [showCalculations, setShowCalculations] = useState(false);
  // Helper functions
  const getBaseRate = (frequency) => {
    if (frequency === 'custom') {
      const f = parseFloat(inputs.customFrequency);
      return f > 0 ? 0.013 * Math.pow(f, 0.23) : 0;
    } else {
      const selected = baseRates.find(item => item.frequency === parseFloat(frequency));
      return selected ? selected.rate : 0;
    }
  };
  const getQualityFactor = (quality) => {
    const selected = qualityFactors.find(item => item.type === quality);
    return selected ? selected.factor : 0;
  };
  const getEnvironmentFactor = (environment) => {
    const selected = environmentFactors.find(item => item.env === environment);
    return selected ? selected.factor : 0;
  };
  const getEnvironmentLabel = (environment) => {
    const selected = environmentFactors.find(item => item.env === environment);
    return selected ? selected.label : '';
  };
  const validateForm = () => {
    const { frequency, quality, environment, customFrequency } = inputs;
    const newErrors = {};
    let isValid = true;
    const value = selectedFrequency ? selectedFrequency.value : frequency;
    if (!selectedFrequency) {
      newErrors.frequency = 'Please select a frequency.';
      isValid = false;
    } else if (value === 'custom') {
      if (!customFrequency) {
        newErrors.customFrequency = 'Please enter a custom frequency.';
        isValid = false;
      } else if (isNaN(customFrequency)) {
        newErrors.customFrequency = 'Custom frequency must be a number.';
        isValid = false;
      } else if (parseFloat(customFrequency) <= 0) {
        newErrors.customFrequency = 'Custom frequency must be greater than 0.';
        isValid = false;
      } else if (parseFloat(customFrequency) < 0.1) {
        newErrors.customFrequency = 'Custom frequency must be at least 0.1 MHz.';
        isValid = false;
      } else if (parseFloat(customFrequency) > 100) {
        newErrors.customFrequency = 'Custom frequency must be less than or equal to 100 MHz.';
        isValid = false;
      }
    }
    if (!selectedQuality) {
      newErrors.quality = 'Please select a quality factor.';
      isValid = false;
    }
    if (!selectedEnvironment) {
      newErrors.environment = 'Please select an environment factor.';
      isValid = false;
    }
    setErrors(newErrors);
    if (!isValid) {
      setResult(null);
    }
    return isValid;
  };
  // Calculate the failure rate
  const calculateFailureRate = () => {
    if (!validateForm()) {
      return;
    }
    const baseRate = getBaseRate(inputs.frequency);
    const qualityFactor = getQualityFactor(inputs.quality);
    const environmentFactor = getEnvironmentFactor(inputs.environment);
    // Calculate final failure rate
    const failureRate = baseRate * qualityFactor * environmentFactor;
    setResult({
      value: failureRate.toFixed(6),
      parameters: {
        λb: baseRate.toFixed(6),
        πQ: qualityFactor.toFixed(1),
        πE: environmentFactor.toFixed(1)
      }
    });
    if (onCalculate) {
      onCalculate(failureRate);
    }
  };
  // Custom styles for Select components
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '38px',
      height: '38px',
      fontSize: '14px',
      borderColor: '#ced4da',
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '38px',
      padding: '0 12px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
      padding: '0px',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '38px',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '8px',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      padding: '8px',
    }),
    option: (provided) => ({
      ...provided,
      padding: '8px 12px',
      fontSize: '14px',
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: '2px',
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '150px',
      overflowY: 'auto',
    }),
  };
  return (
    <>
      <div className='calculator-container'>
        <h2 className="text-center mb-4">Quartz</h2>
        <Row className="mb-3">
          <Col md={4}>
            <div className="form-group">
              <label>Base Failure:</label>
              <Select
                styles={customStyles}
                name="frequency"
                value={selectedFrequency}
                isInvalid={!!errors.frequency}
                classNamePrefix="select"
                placeholder="Select Frequency"
                onChange={(selectedOption) => {
                  setSelectedFrequency(selectedOption);
                  setInputs(prev => ({
                    ...prev,
                    frequency: selectedOption.value,
                    customFrequency: selectedOption.value === 'custom' ? prev.customFrequency : ''
                  }));
                  setErrors({ ...errors, frequency: '' });
                }}
                options={[
                   
                  ...baseRates.map(item => ({
                    value: item.frequency,
                    label: `${item.frequency} MHz (λb = ${item.rate?.toFixed(3)})`
                  })),
                 { value: 'custom', label: 'Custom Frequency' }
                ]}
              />
              {errors.frequency && <small className="text-danger">{errors.frequency}</small>}
            </div>
            {selectedFrequency?.value === 'custom' && (
              <div className="form-group mt-2">
                <label>Custom Frequency (f) in MHz:</label>
                <input
                  type="number"
                  name="customFrequency"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={inputs.customFrequency || ''}
                  onChange={(e) => {
                    setInputs(prev => ({
                      ...prev,
                      customFrequency: e.target.value
                    }));
                    setErrors({ ...errors, customFrequency: '' });
                  }}
                  className={`form-control ${errors.customFrequency ? 'is-invalid' : ''}`}
                />
              
                {errors.customFrequency && <small className="text-danger">{errors.customFrequency}</small>}
                  <br/>
                <small className="text-muted">Formula: λb = 0.013 × (f)<sup>0.23</sup></small>
              </div>
            )}
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label>Quality Factor (π<sub>Q</sub>):</label>
              <Select
                styles={customStyles}
                name="quality"
                value={selectedQuality}
                isInvalid={!!errors.quality}
                classNamePrefix="select"
                placeholder="Select Quality"
                onChange={(selectedOption) => {
                        setInputs(prev => ({
                    ...prev,
                    quality: selectedOption.value
                  }));
                  setSelectedQuality(selectedOption)
                  setErrors({ ...errors, quality: '' });
                }}

                options={qualityFactors.map(item => ({
                  value: item.type,
                  label: `${item.type} (πQ = ${item.factor})`
                }))}
              />
              {errors.quality && <small className="text-danger">{errors.quality}</small>}
            </div>
 
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label>Environment Factor (π<sub>E</sub>):</label>
              <Select
                styles={customStyles}
                name="environment"
                placeholder="Select Environment"
                classNamePrefix="select"
                value={selectedEnvironment}
                isInvalid={!!errors.environment}
              
                onChange={(selectedOption) => {
                  
                  setInputs(prev => ({
                    ...prev,
                    environment: selectedOption.value
                  }));
                  setSelectedEnvironment(selectedOption);
                  setErrors({ ...errors, environment: '' });
                }}
                options={environmentFactors.map(item => ({
                  value: item.env,
                  label: `${item.label} (πE = ${item.factor})`
                }))}
              />
                {errors.environment && <small className="text-danger">{errors.environment}</small>}
            </div>
           
          </Col>
        </Row>
        <div className='d-flex justify-content-between align-items-center'>
          <div>
            {result && (
              <Box
                component="div"
                onClick={() => setShowCalculations(!showCalculations)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                className="ms-auto mt-2"
              >
                <CalculatorIcon
                  style={{ height: '30px', width: '40px' }}
                  fontSize="large"
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    ml: 1
                  }}
                >
                  {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
                </Typography>
              </Box>
            )}
          </div>
          <div>
            <Button
              variant="primary"
              onClick={calculateFailureRate}
              className="btn-calculate float-end mt-1"
            >
              Calculate Failure Rate
            </Button>
          </div>
        </div>
        {result && (
          <>
            <h2 className="text-center mt-4">Calculation Result</h2>
            <div >
              <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
              <span className="ms-2">{result?.value} failures/10<sup>6</sup> hours</span>
            </div>
          </>
        )}
        {result && showCalculations && (
          <>
            <Row className="mb-4 mt-3">
              <Col>
                <div className="card">
                  <div className="card-body">
                    <div className="table-responsive">
                      <MaterialTable
                        columns={[
                          {
                            title: <span>λ<sub>b</sub></span>,
                            field: 'λb',
                            render: rowData => rowData.λb || '-'
                          },
                          {
                            title: <span>π<sub>Q</sub></span>,
                            field: 'πQ',
                            render: rowData => rowData.πQ || '-'
                          },
                          {
                            title: <span>π<sub>E</sub></span>,
                            field: 'πE',
                            render: rowData => rowData.πE || '-'
                          },
                          {
                            title: "Failure Rate",
                            field: 'λp',
                            render: rowData => rowData.λp || '-',
                          }
                        ]}
                        data={[
                          {
                            λb: result.parameters.λb,
                            πQ: result.parameters.πQ,
                            πE: result.parameters.πE,
                            λp: result.value,
                            description: `From frequency ${inputs.frequency === 'custom' ? inputs.customFrequency + ' MHz (custom)' : inputs.frequency + ' MHz'}`
                          }
                        ]}
                        options={{
                          search: false,
                          paging: false,
                          toolbar: false,
                          headerStyle: {
                            backgroundColor: '#CCE6FF',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                          },
                          rowStyle: {
                            backgroundColor: '#FFF',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            }
                          }
                        }}
                        components={{
                          Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 8 }} />
                        }}
                      />
                    </div>
                    <div className="formula-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
                      <Typography variant="h6" gutterBottom>
                        Calculation Formula
                      </Typography>
                      <Typography variant="body1" paragraph>
                        λ<sub>p</sub> = λ<sub>b</sub> × π<sub>Q</sub> × π<sub>E</sub>
                      </Typography>
                      <Typography variant="body1" paragraph>Where:</Typography>
                      <ul>
                        <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                        <li>λ<sub>b</sub> = Base failure rate (from frequency)</li>
                        <li>π<sub>Q</sub> = Quality factor</li>
                        <li>π<sub>E</sub> = Environment factor</li>
                      </ul>
                      <Typography variant="body1" paragraph>
                        Calculation Steps:
                      </Typography>
                      <ul>
                        <li>λ<sub>b</sub> = {result.parameters.λb}</li>
                        <li>π<sub>Q</sub> = {result.parameters.πQ}</li>
                        <li>π<sub>E</sub> = {result.parameters.πE}</li>
                        <li>λ<sub>p</sub> = {result.parameters.λb} × {result.parameters.πQ} × {result.parameters.πE} = {result.value}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}
      </div>
    </>
  );
};
export default Quartz;