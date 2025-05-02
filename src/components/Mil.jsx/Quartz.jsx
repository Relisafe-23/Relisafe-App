import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography';
import { CalculatorIcon } from '@heroicons/react/24/outline'; // or /24/solid
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
    { frequency: 105, rate: 0.038 }
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
    frequency: 0.5,
    quality: 'MIL-SPEC',
    environment: 'GB'
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);

  // Helper functions
  const getBaseRate = (frequency) => {
    const selected = baseRates.find(item => item.frequency === parseFloat(frequency));
    return selected ? selected.rate : 0;
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

  // Calculate the failure rate
  const calculateFailureRate = () => {
    try {
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
      setError(null);
      if (onCalculate) {
        onCalculate(failureRate);
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
      if (onCalculate) {
        onCalculate(null); // or 0 if you prefer
      }
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
      <div className='calculator-container'>
        <h2 className="text-center mb-4">Quartz</h2>
        <Row className="mb-3">
          <Col md={4}>
            {/* Frequency Selection */}
            <div className="form-group">
              <label>Base Failure:</label>
              <Select
                styles={customStyles}
                name="frequency"
                value={{
                  value: inputs.frequency,
                  label: `${inputs.frequency} MHz (λb = ${getBaseRate(inputs.frequency).toFixed(3)})`
                }}
                onChange={(selectedOption) => {
                  setInputs(prev => ({
                    ...prev,
                    frequency: selectedOption.value
                  }));
                }}
                options={baseRates.map(item => ({
                  value: item.frequency,
                  label: `${item.frequency} MHz (λb = ${item.rate.toFixed(3)})`
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
                  label: `${inputs.quality} (πQ = ${getQualityFactor(inputs.quality)})`
                }}
                onChange={(selectedOption) => {
                  setInputs(prev => ({
                    ...prev,
                    quality: selectedOption.value
                  }));
                }}
                options={qualityFactors.map(item => ({
                  value: item.type,
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
                  label: `${getEnvironmentLabel(inputs.environment)} (πE = ${getEnvironmentFactor(inputs.environment)})`
                }}
                onChange={(selectedOption) => {
                  setInputs(prev => ({
                    ...prev,
                    environment: selectedOption.value
                  }));
                }}
                options={environmentFactors.map(item => ({
                  value: item.env,
                  label: `${item.label} (πE = ${item.factor})`
                }))}
              />
            </div>
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
                  style={{ height: '50px', width: '60px' }}
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

        {error && (
          <Row>
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}
      </div>
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
                            description: `From frequency ${inputs.frequency} MHz`
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