import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import MaterialTable from 'material-table';
import Paper from '@mui/material/Paper';
import { CalculatorIcon } from '@heroicons/react/24/outline'; // or /24/solid

const Meters = ({ onCalculate }) => {
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedQuality,setSelectedQuality] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState (null);
  const [selectedFunction, setSelectedFunction] = useState (null);
  const [errors ,setErrors] = useState({
    meterType: '',
    application: '',
    function: '',
    quality: '',
    environment: ''
  });
  // Base failure rate data
  const baseRates = [
    { type: 'All', rate: 0.090 }
  ];

  // Application factors
  const applicationFactors = [
    { type: 'Direct Current', factor: 1.0 },
    { type: 'Alternating Current', factor: 1.7 }
  ];

  // Function factors
  const functionFactors = [
    { type: 'Ammeter', factor: 1.0 },
    { type: 'Voltmeter', factor: 1.0 },
    { type: 'Other*', factor: 2.8 }
  ];

  // Quality factors
  const qualityFactors = [
    { type: 'MIL-M-10304', factor: 1.0 },
    { type: 'Lower', factor: 3.4 }
  ];

  // Environment factors
  const environmentFactors = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 4.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 25 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 12 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 35 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 28 },
    { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 42 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 58 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 73 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 60 },
    { env: 'SF', label: 'Space, Flight', factor: 1.1 },
    { env: 'MF', label: 'Missile, Flight', factor: 60 },
    { env: 'ML', label: 'Missile, Launch', factor: 'N/A' },
    { env: 'CL', label: 'Cannon, Launch', factor: 'N/A' }
  ];

  // State for form inputs
  const [inputs, setInputs] = useState({
    meterType: baseRates[0],
    application: applicationFactors[0],
    function: functionFactors[0],
    quality: qualityFactors[0],
    environment: environmentFactors[0]
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);

const validateForm = () => {
      const { quality,application,environment } = inputs;
  const newErrors = {};
  let isValid = true;

  if (!selectedApplication) {  
    newErrors.application = 'Application factor is required';
    isValid = false;
  }
  if (!selectedFunction) {
    newErrors.function = 'Function factor is required';
    isValid = false;
  }
  if (!selectedQuality) {
    newErrors.quality = 'Quality factor is required';
    isValid = false;
  }
  if (!selectedEnvironment) {
    newErrors.environment = 'Environment factor is required';
    isValid = false;
  }
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }
  setErrors(newErrors);
  return isValid;
};


  



  // Calculate the failure rate
  const calculateFailureRate = () => {

    if (!validateForm()) {
     
      return;
    }
    // Reset error state
    setError(null);
    // Check if all inputs are selected
    // if (!inputs.meterType || !inputs.application || !inputs.function || !inputs.quality || !inputs.environment) {
    //   setError('Please select all required factors.');
    //   return;
    // }
      const baseRates = inputs.meterType.rate;
      const applicationFactor = inputs.application.factor;
      const functionFactor = inputs.function.factor;
      const qualityFactor = inputs.quality.factor;
      const environmentFactor = inputs.environment.factor;

      // Skip calculation if environment factor is N/A
      if (environmentFactor === 'N/A') {
        throw new Error('Cannot calculate for this environment (N/A)');
      }

      // Calculate final failure rate
      const failureRate = baseRates * applicationFactor * functionFactor * qualityFactor * environmentFactor;

      setResult({
        value: failureRate.toFixed(6),
        parameters: {
          λb: baseRates.toFixed(6),
          πA: applicationFactor.toFixed(6),
          πF: functionFactor.toFixed(6),
          πQ: qualityFactor.toFixed(6),
          πE: environmentFactor.toFixed(6)
        }
      });
      setError(null);
      if (onCalculate) {
        onCalculate(failureRate);
      }
  
    if (onCalculate) {
      onCalculate(null);
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
      <h2 className="text-center mb-4">Meters</h2>


      <Row className="mb-3">
        <Col md={6}>
          {/* Meter Type Selection */}
           <div className="form-group">
                    <label>Base Failure (λ<sub>b</sub>):</label>
                    <Select
                      styles={customStyles}
                      name="meterType"
                      read only
                      value={{
                        value: inputs.meterType,
                        label: `${inputs.meterType.type} (λb = ${inputs.meterType.rate})`
                      }}
                      onChange={(selectedOption) => {
                        setInputs(prev => ({
                          ...prev,
                          meterType: selectedOption.value
                        }));
                      }}
                      options={baseRates.map(item => ({
                        value: item,
                        label: `${item.type} (λb = ${item.rate})`
                      }))}
                    />
                  </div>
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
                    setInputs(prev => ({
                  ...prev,
                  environment: selectedOption.value
                }));
                setSelectedEnvironment(selectedOption)
                setErrors({ ...errors, environment: '' });
              }}
              options={environmentFactors.map(item => ({
                value: item,
                label: `${item.label} (πE = ${item.factor})`
              }))}
            />
             {errors.environment && <small style={{ color: 'red' }}>{errors.environment}</small>}
          </div>
        </Col>


      </Row>

      <Row className="mb-3">
        <Col md={4}>
          {/* Quality Factor */}
          <div className="form-group">
            <label>Quality Factor (π<sub>Q</sub>):</label>
            <Select
              styles={customStyles}
              name="quality"
             value={selectedQuality}
             isInvalid = {!!errors.quality}
              onChange={(selectedOption) => {
                    setInputs(prev => ({
                  ...prev,
                  quality: selectedOption.value
                }));
                setSelectedQuality(selectedOption)
              setErrors({ ...errors, quality: '' });
              }}
              options={qualityFactors.map(item => ({
                value: item,
                label: `${item.type} (πQ = ${item.factor})`
              }))}
            />
          </div>
               {errors.quality && <small style={{ color: 'red' }}>{errors.quality}</small>}
        </Col>
        <Col md={4}>
          {/* Application Factor */}
          <div className="form-group">
            <label>Application Factor (π<sub>A</sub>):</label>
            <Select
              styles={customStyles}
              name="application"
              isInvalid ={!!errors.application}
            value = {selectedApplication}
              onChange={(selectedOption) => {
                    setInputs(prev => ({
                  ...prev,
                  application: selectedOption.value
                }));
              setSelectedApplication(selectedOption)
             setErrors({ ...errors, application: '' });
              }}
              options={applicationFactors.map(item => ({
                value: item,
                label: `${item.type} (πA = ${item.factor})`
              }))}
            />
          </div>
          {errors.application && <small style={{ color: 'red' }}>{errors.application}</small>}
        </Col>
        <Col md={4}>
          {/* Function Factor */}
          <div className="form-group">
            <label>Function Factor (π<sub>F</sub>):</label>
            <Select
              styles={customStyles}
              name="function"
         value={selectedFunction}
         isInvalid={!!errors.function}
              onChange={(selectedOption) => {
                    setInputs(prev => ({
                  ...prev,
                  function: selectedOption.value
                }));
              setSelectedFunction(selectedOption)
              setErrors({ ...errors, function: '' });
              }}
              options={functionFactors.map(item => ({
                value: item,
                label: `${item.type} (πF = ${item.factor})`
              }))}
            />
          </div>
           {errors.function && <small style={{ color: 'red' }}>{errors.function}</small>}
        </Col>


      </Row>

      <div className='d-flex justify-content-between align-items-center' >

        <div >
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

        <div >
          <Button
            variant="primary"
            onClick={calculateFailureRate}
            className="btn-calculate float-end mb-4"
          >
            Calculate Failure Rate
          </Button>
        </div>
      </div>

      {error && (
        <Row>
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}
      <br />
    

      {result && (
        <>
          <h2 className="text-center">Calculation Result</h2>
          <div className="d-flex align-items-center">
            <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
            <span className="ms-2">{result?.value} failures/10<sup>6</sup> hours</span>
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
                        // {
                        //   title: <span>λ<sub>b</sub></span>,
                        //   field: 'λb',
                        //   render: rowData => rowData.λb || '-'
                        // },
                        {
                          title: <span>π<sub>A</sub></span>,
                          field: 'πA',
                          render: rowData => rowData.πA || '-'
                        },
                        {
                          title: <span>π<sub>F</sub></span>,
                          field: 'πF',
                          render: rowData => rowData.πF || '-'
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
                          // λb: result.parameters.λb,
                          πA: result.parameters.πA,
                          πF: result.parameters.πF,
                          πQ: result.parameters.πQ,
                          πE: result.parameters.πE,
                          λp: result.value,
                       
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
                      λ<sub>p</sub> = λ<sub>b</sub> × π<sub>A</sub> × π<sub>F</sub> × π<sub>Q</sub> × π<sub>E</sub>
                    </Typography>
                    <Typography variant="body1" paragraph>Where:</Typography>
                    <ul>
                      <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                      <li>λ<sub>b</sub> = Base failure rate (from meter type)</li>
                      <li>π<sub>A</sub> = Application factor (DC/AC)</li>
                      <li>π<sub>F</sub> = Function factor (Ammeter/Voltmeter/Other)</li>
                      <li>π<sub>Q</sub> = Quality factor</li>
                      <li>π<sub>E</sub> = Environment factor</li>
                    </ul>
             
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Meters;