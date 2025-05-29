import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import './Lamps.css';
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography';
import { CalculatorIcon } from '@heroicons/react/24/outline'; // or /24/solid
import MaterialTable from 'material-table';
import Paper from '@mui/material/Paper';
const Lamps = ({ onCalculate }) => {
  // Base failure rate data
  const baseRates = [
    { voltage: 5, rate: 0.59 },
    { voltage: 6, rate: 0.75 },
    { voltage: 12, rate: 1.8 },
    { voltage: 14, rate: 2.2 },
    { voltage: 24, rate: 4.5 },
    { voltage: 28, rate: 5.4 },
    { voltage: 37.5, rate: 7.9 }
  ];

  // State for form inputs
  const [inputs, setInputs] = useState({
    voltage: 5,
    customVoltage: '',
    utilization: 'medium',
    application: 'AC',
    environment: 'GB'
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({
    voltage: "",    
    application: "",  
    quality: " ",
    customVoltage: "",
    environment: " ",
    utilization: ''
  });
const [selectedEnvironment, setSelectedEnvironment] = useState(null);
 const [selectedVoltage, setSelectedVoltage] = useState(null);
 const [selectedUtilization, setSelectedUtilization] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);

  // Helper functions
  const getBaseRate = (voltage) => {
    if (voltage === 'custom') return '';
    const selected = baseRates.find(item => item.voltage === parseFloat(voltage));
    return selected ? selected.rate : '';
  };

  const getUtilizationFactor = (utilization) => {
    const factors = {
      low: 0.10,
      medium: 0.72,
      high: 1.0
    };
    return factors[utilization] || 0;
  };

  const getUtilizationLabel = (utilization) => {
    const labels = {
      low: '< 0.10',
      medium: '0.10 to 0.90',
      high: '> 0.90'
    };
    return labels[utilization] || '';
  };

  const getApplicationFactor = (application) => {
    return application === 'AC' ? 1.0 : 3.3;
  };

  const getEnvironmentFactor = (environment) => {
    const factors = {
      GB: 1.0,
      GF: 2.0,
      GM: 3.0,
      NS: 3.0,
      NU: 4.0,
      AIC: 4.0,
      AIF: 4.0,
      AUC: 5.0,
      AUF: 6.0,
      ARW: 5.0,
      SF: 0.70,
      MF: 4.0,
      ML: 6.0,
      CL: 27.0
    };
    return factors[environment] || 0;
  };

  const getEnvironmentLabel = (environment) => {
    const labels = {
      GB: 'Ground, Benign',
      GF: 'Ground, Fixed',
      GM: 'Ground, Mobile',
      NS: 'Naval, Sheltered',
      NU: 'Naval, Unsheltered',
      AIC: 'Airborne, Inhabited, Cargo',
      AIF: 'Airborne, Inhabited, Fighter',
      AUC: 'Airborne, Uninhabited, Cargo',
      AUF: 'Airborne, Uninhabited, Fighter',
      ARW: 'Airborne, Rotary Wing',
      SF: 'Space, Flight',
      MF: 'Missile, Flight',
      ML: 'Missile, Launch',
      CL: 'Cannon, Launch'
    };
    return labels[environment] || '';
  };
  // Validate form inputs
  const validateForm = () => {
    const { voltage, customVoltage, utilization,application,environment } = inputs;
    const newErrors = {};
    let isValid = true;
    if (!selectedVoltage) {
      newErrors.voltage = 'Please select a base failure rate';
       isValid = false;
    } else if (selectedVoltage?.value === 'custom') {
   
    if (!customVoltage){
      newErrors.customVoltage = 'Please enter a valid custom voltage';
       isValid = false;
    }
    }
    if (!selectedUtilization) {
      newErrors.utilization = 'Please select a utilization factor';
        isValid = false;   
  }
    if (!selectedApplication) {
      newErrors.application = 'Please select an application factor';
         isValid = false;
    }

    if (!selectedEnvironment) {
      newErrors.environment = 'Please select an environment factor';
         isValid = false;
    }
   setErrors(newErrors);

    if (!isValid) {
      setResult(null);
    }

    return isValid;
  }

  
// Calculate the failure rate
const calculateFailureRate = () => {
  if (!validateForm()) {
    return;
  }
  // Validate inputs
  if (inputs.voltage === 'custom' && (!inputs.customVoltage || isNaN(inputs.customVoltage))) {
    throw new Error('Please enter a valid custom voltage');
  }

  // Get base rate
  let baseRate;
  if (inputs.voltage === 'custom') {
    baseRate = 0.074 * Math.pow(parseFloat(inputs.customVoltage), 1.29);
  } else {
    const selectedVoltage = baseRates.find(item => item.voltage === parseFloat(inputs.voltage));
    baseRate = selectedVoltage ? selectedVoltage.rate : 0;
  }

  const utilizationFactor = getUtilizationFactor(inputs.utilization);
  const applicationFactor = getApplicationFactor(inputs.application);
  const environmentFactor = getEnvironmentFactor(inputs.environment);

  // Calculate final failure rate
  const failureRate = baseRate * utilizationFactor * applicationFactor * environmentFactor;

  setResult({
    value: failureRate.toFixed(4),
    parameters: {
      λb: baseRate.toFixed(4),
      πT: utilizationFactor,
      πA: applicationFactor,
      πE: environmentFactor
    }
  });
  setError(null);
  if (onCalculate) {
    onCalculate(failureRate);  // Pass the numeric value
  }

}

// Custom styles for Select components
const customStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '38px',
    height: '38px'
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '38px',
    padding: '0 6px'
  }),
  input: (provided) => ({
    ...provided,
    margin: '0px'
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '38px'
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999
  })
};

return (
  <>
    <div className='calculator-container'>
      <h2 className="text-center">Lamps</h2>
      <Row className="mb-3">
        <Col md={6}>
          {/* Rated Voltage Selection */}
          <div className="form-group">
            <label>Base Failure Rate (λ<sub>b</sub>):</label>
            <Select
              styles={customStyles}
              name="voltage"
                value={selectedVoltage}
              placeholder="Select Voltage"
            isInvalid={!!errors.voltage}
              className={errors.voltage ? 'is-invalid' : ''}
              onChange={(selectedOption) => {
                setSelectedVoltage(selectedOption);
                setInputs(prev => ({
                  ...prev,
                  voltage: selectedOption.value,
                  customVoltage:  selectedOption.value === 'custom' ? prev.customVoltage : ''
                }));
                   setErrors({ ...errors, voltage: '' });
              }}
              
              options={[
                { value: 5, label: '5V (λb = 0.59)' },
                { value: 6, label: '6V (λb = 0.75)' },
                { value: 12, label: '12V (λb = 1.8)' },
                { value: 14, label: '14V (λb = 2.2)' },
                { value: 24, label: '24V (λb = 4.5)' },
                { value: 28, label: '28V (λb = 5.4)' },
                { value: 37.5, label: '37.5V (λb = 7.9)' },
                { value: 'custom', label: 'Custom Voltage' }
              ]}
            />
          </div>
             {errors.voltage && <small className="text-danger">{errors.voltage}</small>}
          {selectedVoltage?.value === 'custom' && (
            <div className="form-group mt-2">
              <label>Custom Voltage (V):</label>
              <input
                type="number"
                name="customVoltage"
                min="0"
                step="0.1"
                value={inputs.customVoltage || ''}
                onChange={(e) => {
                  
                  setInputs(prev => ({
                    ...prev,
                    customVoltage: e.target.value
                  }));
                      setErrors({ ...errors, customVoltage: '' });
                }}
              className={`form-control ${errors.customVoltage ? 'is-invalid' : ''}`}
              />
              {errors.customVoltage && <small className="text-danger">{errors.customVoltage}</small>}
              <br/>
              <small className="text-muted">Formula: λb = 0.074 × (V)<sup>1.29</sup></small>
            </div>
          )}
        </Col>
        <Col md={6}>
          {/* Environment Factor */}
          <div className="form-group">
            <label>Environment Factor (π<sub>E</sub>):</label>
            <Select
              styles={customStyles}
              name="environment"
                 isInvalid={!!errors.environment}
              value={selectedEnvironment}
             
              onChange={(selectedOption) => {
                setSelectedEnvironment(selectedOption);
                setInputs(prev => ({
                  ...prev,
                  environment: selectedOption.value
                }));
                    setErrors({ ...errors, environment: '' });
              }}
              options={[
                { value: 'GB', label: 'GB - Ground, Benign (πE = 1.0)' },
                { value: 'GF', label: 'GF - Ground, Fixed (πE = 2.0)' },
                { value: 'GM', label: 'GM - Ground, Mobile (πE = 3.0)' },
                { value: 'NS', label: 'NS - Naval, Sheltered (πE = 3.0)' },
                { value: 'NU', label: 'NU - Naval, Unsheltered (πE = 4.0)' },
                { value: 'AIC', label: 'AIC - Airborne, Cargo (πE = 4.0)' },
                { value: 'AIF', label: 'AIF - Airborne, Fighter (πE = 4.0)' },
                { value: 'AUC', label: 'AUC - Uninhabited, Cargo (πE = 5.0)' },
                { value: 'AUF', label: 'AUF - Uninhabited, Fighter (πE = 6.0)' },
                { value: 'ARW', label: 'ARW - Rotary Wing (πE = 5.0)' },
                { value: 'SF', label: 'SF - Space Flight (πE = 0.70)' },
                { value: 'MF', label: 'MF - Missile Flight (πE = 4.0)' },
                { value: 'ML', label: 'ML - Missile Launch (πE = 6.0)' },
                { value: 'CL', label: 'CL - Cannon Launch (πE = 27.0)' }
              ]}
            />
          </div>
           {errors.environment && <small className="text-danger">{errors.environment}</small>}
        </Col>
      </Row>

      <Row className="mb-3">

        <Col md={6}>
          {/* Application Factor */}
          <div className="form-group">
            <label>Application Factor (π<sub>A</sub>):</label>
            <Select
              styles={customStyles}
              name="application"
              value={selectedApplication}
              isInvalid={!!errors.application}
              onChange={(selectedOption) => {
                setInputs(prev => ({
                  ...prev,
                  application: selectedOption.value
                }));
                setSelectedApplication(selectedOption);
                setErrors({ ...errors, application: '' });
              }}
              options={[
                { value: 'AC', label: 'Alternating Current (πA = 1.0)' },
                { value: 'DC', label: 'Direct Current (πA = 3.3)' }
              ]}
            />
          </div>
          {errors.application && <small className="text-danger">{errors.application}</small>}
        </Col>
        <Col md={6}>
          {/* Utilization Factor */}
          <div className="form-group">
            <label>Utilization Factor (π<sub>U</sub>):</label>
            <Select
              styles={customStyles}
              name="utilization"
              value={selectedUtilization}
              isInvalid={!!errors.utilization}
              onChange={(selectedOption) => {
                setInputs(prev => ({
                  ...prev,
                  utilization: selectedOption.value
                }));
                setSelectedUtilization(selectedOption);
                setErrors({ ...errors, utilization: '' });
              }}
              options={[
                { value: 'low', label: '< 0.10 (πT = 0.10)' },
                { value: 'medium', label: '0.10 to 0.90 (πT = 0.72)' },
                { value: 'high', label: '> 0.90 (πT = 1.0)' }
              ]}
            />
          </div>
          {errors.utilization && <small className="text-danger">{errors.utilization}</small>}
        </Col>

      </Row>

      <div className='d-flex justify-content-between align-items-center' >
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
        <Button
          variant="primary"
          onClick={calculateFailureRate}
          className="btn-calculate float-end mt-1"
        >
          Calculate Failure Rate
        </Button>
      </div>
      {error && (
        <Row>
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      <div >
        {result && (
          <>
            <h2 className="text-center">Calculation Result</h2>
            <div className="d-flex align-items-center">
              <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
              <span className="ms-2">{result.value} failures/10<sup>6</sup> hours</span>
            </div>
          </>
        )}
        <br />

        {result && showCalculations && (
          <>
            <Row className="mb-4">
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
                            title: <span>π<sub>U</sub></span>,
                            field: 'πT',
                            render: rowData => rowData.πT || '-'
                          },
                          {
                            title: <span>π<sub>A</sub></span>,
                            field: 'πA',
                            render: rowData => rowData.πA || '-'
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
                            πT: result.parameters.πT,
                            πA: result.parameters.πA,
                            πE: result.parameters.πE,
                            λp: result.value,
                            description: inputs.voltage === 'custom'
                              ? `Calculated from custom voltage: 0.074 × (${inputs.customVoltage})^1.29`
                              : `From rated voltage ${inputs.voltage}V`
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
                        λ<sub>p</sub> = λ<sub>b</sub> × π<sub>U</sub> × π<sub>A</sub> × π<sub>E</sub>
                      </Typography>
                      <Typography variant="body1" paragraph>Where:</Typography>
                      <ul>
                        <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                        <li>λ<sub>b</sub> = Base failure rate (from voltage)</li>
                        <li>π<sub>U</sub> = Utilization factor (based on usage)</li>
                        <li>π<sub>A</sub> = Application factor (AC/DC)</li>
                        <li>π<sub>E</sub> = Environment factor</li>
                      </ul>


                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  </>
);
};

export default Lamps;