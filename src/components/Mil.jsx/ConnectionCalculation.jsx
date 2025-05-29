import React, { useState } from 'react';
import { Table, Form, Button, Card, Row, Col } from 'react-bootstrap';
import Select from "react-select";
import MaterialTable from "material-table";
import { Link } from '@material-ui/core';

import {
  Paper,
  Typography,
  IconButton,
  Tooltip
} from '@material-ui/core';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'

import { CalculatorIcon } from '@heroicons/react/24/outline';
import DeleteIcon from '@material-ui/icons/Delete';

const ConnectionCalculation = ({ onCalculate }) => { 
  // Data from the tables
  const baseFailureRates = [
    { type: 'Hand Solder, w/o Wrapping', value: 0.0013 },
    { type: 'Hand Solder, w/Wrapping', value: 0.000070 },
    { type: 'Crimp', value: 0.00026 },
    { type: 'Weld', value: 0.000015 },
    { type: 'Solderless Wrap', value: 0.0000068 },
    { type: 'Clip Termination', value: 0.00012 },
    { type: 'Reflow Solder', value: 0.000069 },
    { type: 'Spring Contact', value: 0.17 },
    { type: 'Terminal Block', value: 0.062 }
  ];

  const environmentFactors = [
    { env: 'GB (Ground, Benign)', value: 1.0 },
    { env: 'GF (Ground, Fixed)', value: 2.0 },
    { env: 'GM (Ground, Mobile)', value: 7.0 },
    { env: 'NS (Naval, Sheltered)', value: 4.0 },
    { env: 'NU (Naval, Unsheltered)', value: 11 },
    { env: 'AIC (Airborne, Inhabited Cargo)', value: 4.0 },
    { env: 'AIF (Airborne, Inhabited Fighter)', value: 6.0 },
    { env: 'AUC (Airborne, Uninhabited Cargo)', value: 6.0 },
    { env: 'AUF (Airborne, Uninhabited Fighter)', value: 8.0 },
    { env: 'ARW (Airborne, Rotary Wing)', value: 16 },
    { env: 'SF (Space, Flight)', value: 0.50 },
    { env: 'MF (Missile, Flight)', value: 9.0 },
    { env: 'ML (Missile, Launch)', value: 24 },
    { env: 'CL (Cannon, Launch)', value: 420 }
  ];

  // State management
  const [selectedBaseRate, setSelectedBaseRate] = useState(baseFailureRates[0]);
  const [selectedEnvFactor, setSelectedEnvFactor] = useState(environmentFactors[0]);
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const calculationColumns = [
    {
      title: <span>π<sub>E</sub></span>,
      field: "π_E",
      render: rowData => rowData.π_E
    },
    {
      title: <span>λ<sub>b</sub></span>,
      field: "λ_b",
      render: rowData => rowData.λ_b
    },
    {
      title: 'Failure Rate',
      field: "λ_p",
      render: rowData => rowData.λ_p.toFixed(6)
    }
  ];

  // Prepare options for react-select
  const baseRateOptions = baseFailureRates.map(rate => ({
    value: rate,
    label: `${rate.type} (${rate.value})`
  }));

  const envFactorOptions = environmentFactors.map(env => ({
    value: env,
    label: `${env.env} (${env.value})`
  }));

  // Calculation function
  const calculateFailureRate = () => {
    const λ_b = selectedBaseRate.value;
    const π_E = selectedEnvFactor.value;
    const λ_p = λ_b * π_E;

    setResult({
      id: Date.now(),
      value: λ_p.toFixed(6),
      parameter: {
        λ_b: λ_b,
        π_E: π_E,
        λ_p: λ_p,
        λ_p_readable: λ_p.toFixed(8)
      }
    });
    if (onCalculate) {
      onCalculate(λ_p);  // Pass the numeric value
    }
  };

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
      <div >
        <h2 className="text-center mb-4">Connections</h2>
        <div>
          <Row className="mb-3">
            <Col md={6}>
              <div className="form-group">
                <label>Base Failure Rate (λ<sub>b</sub>):</label>
                <Select
                  styles={customStyles}
                  value={baseRateOptions.find(option => option.value === selectedBaseRate)}
                  onChange={(selectedOption) => setSelectedBaseRate(selectedOption.value)}
                  options={baseRateOptions}
                  className="basic-select"
                  classNamePrefix="select"
                />
              </div>
            </Col>

            <Col md={6}>
              <div className="form-group">
                <label>Environment Factor (π<sub>E</sub>):</label>
                <Select
                  styles={customStyles}
                  value={envFactorOptions.find(option => option.value === selectedEnvFactor)}
                  onChange={(selectedOption) => setSelectedEnvFactor(selectedOption.value)}
                  options={envFactorOptions}
                  className="basic-select"
                  classNamePrefix="select"
                  placeholder="Select Environment Factor..."
                />
              </div>
            </Col>
          </Row>

        </div>
     
        <div className='d-flex justify-content-between align-items-center' >
          <div>
            {result && (
              <>
                <div className="mb-4">
                  <Box
                    component="div"
                    onClick={() => setShowResults(!showResults)}
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
                      {showResults ? 'Hide Calculations' : 'Show Calculations'}
                    </Typography>
                  </Box>
                </div>
              </>
            )}
          </div>
          <Button
            variant="primary"
            onClick={calculateFailureRate}
            className="btn-calculate float-end"
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Calculate Failure Rate
          </Button>
        </div>
      </div>
      <div >

        {result && (
          <>
            <h2 className="text-center">Calculation Result</h2>
            <div className="d-flex align-items-center">
              <p className="mb-0">
                <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                <span className="ms-2">{result.value} failures/10<sup>6</sup> hours</span>
              </p>
            </div>
          </>
        )}



<br/>
        {result && showResults && (
          <Row>
            <Col>
              <div className="card mt-3">
                <div className="card-body">
                  <MaterialTable
                    columns={calculationColumns}
                    data={[{
                      λ_b: selectedBaseRate.value,
                      π_E: selectedEnvFactor.value,
                      λ_p: result.parameter.λ_p
                    }]}
                    options={{
                      search: false,
                      paging: false,
                      toolbar: false,
                      headerStyle: {
                        backgroundColor: '#CCE6FF',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        padding: '12px 16px'
                      },
                      rowStyle: {
                        backgroundColor: '#FFF',
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      },
                      cellStyle: {
                        padding: '8px 16px'
                      }
                    }}
                    components={{
                      Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 4 }} />
                    }}
                  />

                  <div className="formula-section" style={{
                    marginTop: '24px',
                    marginBottom: '24px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>
                      Calculation Formula
                    </Typography>

                    <Typography variant="body1" paragraph>
                      λ<sub>p</sub> = λ<sub>b</sub> × π<sub>E</sub>
                    </Typography>

                    <Typography variant="body1" paragraph>Where:</Typography>

                    <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                      <li style={{ marginBottom: '8px' }}>
                        λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        λ<sub>b</sub> = Base failure rate (depends on connection type)
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        π<sub>E</sub> = Environment factor
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default ConnectionCalculation;