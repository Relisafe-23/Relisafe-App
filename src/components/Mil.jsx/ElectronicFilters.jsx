import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MaterialTable from 'material-table';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import { CalculatorIcon } from '@heroicons/react/24/outline';
import Paper from '@mui/material/Paper';

const ElectronicFilters = ({ onCalculate }) => {
  // Base failure rate data
  const baseRates = [
    { 
      type: 'MIL-F-15733, Ceramic-Ferrite Construction', 
      styles: 'FL 10-16, 22, 24, 30-32, 34, 35, 38, 41-43, 45, 47-50, 61-65, 70, 81-93, 95, 96',
      rate: 0.022 
    },
    { 
      type: 'MIL-F-15733, Discrete LC Components', 
      styles: 'FL 37, 53, 74',
      rate: 0.12 
    },
    { 
      type: 'MIL-F-18327, Discrete LC Components', 
      styles: 'Composition 1',
      rate: 0.12 
    },
    { 
      type: 'MIL-F-18327, Discrete LC and Crystal Components', 
      styles: 'Composition 2',
      rate: 0.27 
    }
  ];

  // Quality factors
  const qualityFactors = [
    { type: 'MIL-SPEC', factor: 1.0 },
    { type: 'Lower', factor: 2.9 }
  ];

  // Environment factors
  const environmentFactors = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 2.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 6.0 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 4.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 9.0 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 7.0 },
    { env: 'AIF', label: 'Airborne, Inhabited,Fighter', factor: 9.0 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 11 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 13 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 11 },
    { env: 'SF', label: 'Space, Flight', factor: 0.80 },
    { env: 'MF', label: 'Missile, Flight', factor: 7.0 },
    { env: 'ML', label: 'Missile, Launch', factor: 15 },
    { env: 'CL', label: 'Cannon, Launch', factor: 120 }
  ];

  // State for form inputs
  const [inputs, setInputs] = useState({
    filterType: baseRates[0],
    quality: qualityFactors[0],
    environment: environmentFactors[0]
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);

  // Calculate the failure rate
  const calculateFailureRate = () => {
    try {
      const baseRate = inputs.filterType.rate;
      const qualityFactor = inputs.quality.factor;
      const environmentFactor = inputs.environment.factor;

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
      setError(null);
      if (onCalculate) {
        onCalculate(failureRate);
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

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
      <h2 className="text-center mb-4"> Electronic Filters</h2>
      <Row className="mb-3">
        <Col md={4}>
          {/* Filter Type Selection */}
          <div className="form-group">
            <label>Filter Type (λ<sub>b</sub>):</label>
            <Select
              styles={customStyles}
              name="filterType"
              value={{
                value: inputs.filterType,
                label: `${inputs.filterType.type} (λb = ${inputs.filterType.rate})`
              }}
              onChange={(selectedOption) => {
                setInputs(prev => ({
                  ...prev,
                  filterType: selectedOption.value
                }));
              }}
              options={baseRates.map(item => ({
                value: item,
                label: `${item.type} (λb = ${item.rate})`
              }))}
            />
    
          </div>
        </Col>

        <Col md={4}>
          {/* Quality Factor */}
          <div className="form-group">
            <label>Quality Factor (π<sub>Q</sub>):</label>
            <Select
              styles={customStyles}
              name="quality"
              value={{
                value: inputs.quality,
                label: `${inputs.quality.type} (πQ = ${inputs.quality.factor})`
              }}
              onChange={(selectedOption) => {
                setInputs(prev => ({
                  ...prev,
                  quality: selectedOption.value
                }));
              }}
              options={qualityFactors.map(item => ({
                value: item,
                label: `${item.type} (πQ = ${item.factor})`
              }))}
            />
          </div>
        </Col>
        <Col md={4}>
          {/* Environment Factor */}
          <div className="form-group">
            <label>Environment Factor (π<sub>E</sub>):</label>
            <Select
              styles={customStyles}
              name="environment"
              value={{
                value: inputs.environment,
                label: `${inputs.environment.label} (πE = ${inputs.environment.factor})`
              }}
              onChange={(selectedOption) => {
                setInputs(prev => ({
                  ...prev,
                  environment: selectedOption.value
                }));
              }}
              options={environmentFactors.map(item => ({
                value: item,
                label: `${item.label} (πE = ${item.factor})`
              }))}
            />
          </div>
        </Col>
      </Row>

      <br />
    
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
         <br/>
    
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
                          description: inputs.filterType.type
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
                      <li>λ<sub>b</sub> = Base failure rate (from filter type)</li>
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
      </div>
    </>
  );
};

export default ElectronicFilters;