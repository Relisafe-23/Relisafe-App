import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MaterialTable from 'material-table';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import { CalculatorIcon } from '@heroicons/react/24/outline';

const Fuses = ({ onCalculate }) => {
  // Base failure rate data
  const baseRates = [
    { 
      type: 'W-F-1726, W-F-1814, MIL-F-5372, MIL-F-23419, ML-F-15160',
      rate: 0.010 
    }
  ];

  // Environment factors
  const environmentFactors = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 2.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 8.0 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 5.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 11 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 9.0 },
    { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 12 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 15 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 18 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 16 },
    { env: 'SF', label: 'Space, Flight', factor: 0.90 },
    { env: 'MF', label: 'Missile, Flight', factor: 10 },
    { env: 'ML', label: 'Missile, Launch', factor: 21 },
    { env: 'CL', label: 'Cannon, Launch', factor: 230 }
  ];

  // State for form inputs
  const [inputs, setInputs] = useState({
    fuseType: baseRates[0],
    environment: environmentFactors[0]
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);

  // Calculate the failure rate
  const calculateFailureRate = () => {
    try {
      const baseRate = inputs.fuseType.rate;
      const environmentFactor = inputs.environment.factor;

      // Calculate final failure rate
      const failureRate = baseRate * environmentFactor;

      setResult({
        value: failureRate.toFixed(6),
        parameters: {
          λb: baseRate.toFixed(6),
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
        onCalculate(null); 
      }
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
      <h2 className="text-center mb-4">Fuses</h2>
   

      <Row className="mb-3">
        <Col md={6}>
          {/* Fuse Type Selection */}
          <div className="form-group">
            <label>Fuse Type (λ<sub>b</sub>):</label>
            <Select
              styles={customStyles}
              name="fuseType"
              value={{
                value: inputs.fuseType,
                label: `${inputs.fuseType.type} (λb = ${inputs.fuseType.rate})`
              }}
              onChange={(selectedOption) => {
                setInputs(prev => ({
                  ...prev,
                  fuseType: selectedOption.value
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
      <br />
      <div>

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
                          πE: result.parameters.πE,
                          λp: result.value,
                          description: inputs.fuseType.type
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
                      λ<sub>p</sub> = λ<sub>b</sub> × π<sub>E</sub>
                    </Typography>
                    <Typography variant="body1" paragraph>Where:</Typography>
                    <ul>
                      <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>
                      <li>λ<sub>b</sub> = Base failure rate (from fuse type)</li>
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

export default Fuses;

// import { useState } from 'react';
// import Select from 'react-select';

// function Fuses(){
//   const [selectedOptions, setSelectedOptions] = useState([]);
 
//   const options = [
//     { value: 'option1', label: 'Option 1' },
//     { value: 'option2', label: 'Option 2' },
//     { value: 'option3', label: 'Option 3' },
//     { value: 'option4', label: 'Option 4' },
//   ];

//   return (
//     <div>
//       <Select
//         isMulti
//         options={options}
//         value={selectedOptions}
//         onChange={setSelectedOptions}
//       />
//       <p>
//         Selected values: {selectedOptions.map(option => option.value).join(', ')}
//       </p>
//     </div>
//   );
// }
// export default Fuses;