import React, { useState } from 'react';
import './Resistor.css';
import { Row, Col, Button } from 'react-bootstrap'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,

  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core';
import { Link } from '@material-ui/core';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import { CalculatorIcon } from '@heroicons/react/24/outline'; // or /24/solid

import DeleteIcon from '@material-ui/icons/Delete';
import MaterialTable from "material-table";
import { tableIcons } from "../core/TableIcons";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@material-ui/core";
import Select from "react-select";
const ResistorCalculation = () => {
  const [showCalculations, setShowCalculations] = useState(false)
  // Resistor types data
  const resistorTypes = [
    { style: "RC", spec: "MIL-R-11", description: "Resistor, Fixed, Composition (Insulated)", λb: 0.0017, πTColumn: 1, πSColumn: 2 },
    { style: "RCR", spec: "MIL-R-39008", description: "Resistor, Fixed, Composition (Insulated) Est. Rel.", λb: 0.0017, πTColumn: 1, πSColumn: 2 },
    { style: "RL", spec: "MIL-R-22684", description: "Resistor, Fixed, Film, Insulated", λb: 0.0037, πTColumn: 2, πSColumn: 1 },
    { style: "RLR", spec: "MIL-R-39017", description: "Resistor, Fixed, Film (Insulated), Est. Rel.", λb: 0.0037, πTColumn: 2, πSColumn: 1 },
    { style: "RN (R, C or N)", spec: "MIL-R-55182", description: "Resistor, Fixed, Film, Established Reliability", λb: 0.0037, πTColumn: 2, πSColumn: 1 },
    { style: "RM", spec: "MIL-R-55342", description: "Resistor, Fixed, Film, Chip, Established Reliability", λb: 0.0037, πTColumn: 2, πSColumn: 1 },
    { style: "RN", spec: "MIL-R-10509", description: "Resistor, Fixed Film (High Stability)", λb: 0.0037, πTColumn: 2, πSColumn: 1 },
    { style: "RD", spec: "MIL-R-11804", description: "Resistor, Fixed, Film (Power Type)", λb: 0.0037, πTColumn: "N/A (πT=1)", πSColumn: 1 },
    { style: "RZ", spec: "MIL-R-83401", description: "Resistor Networks, Fixed, Film", λb: 0.0019, πTColumn: 1, πSColumn: "N/A (πS=1)" },
    { style: "RB", spec: "MIL-R-93", description: "Resistor, Fixed, Wirewound (Accurate)", λb: 0.0024, πTColumn: 2, πSColumn: 1 },
    { style: "RBR", spec: "MIL-R-39005", description: "Resistor, Fixed, Wirewound (Accurate) Est. Rel.", λb: 0.0024, πTColumn: 2, πSColumn: 1 },
    { style: "RW", spec: "MIL-R-26", description: "Resistor, Fixed, Wirewound (Power Type)", λb: 0.0024, πTColumn: 2, πSColumn: 2 },
    { style: "RWR", spec: "MIL-R-39007", description: "Resistor, Fixed, Wirewound (Power Type) Est. Rel.", λb: 0.0024, πTColumn: 2, πSColumn: 2 },
    { style: "RE", spec: "MIL-R-18546", description: "Resistor, Fixed, Wirewound (Power Type, Chassis Mounted)", λb: 0.0024, πTColumn: 2, πSColumn: 2 },
    { style: "RER", spec: "MIL-R-39009", description: "Resistor, Fixed, Wirewound (Power Type, Chassis Mounted) Est. Rel.", λb: 0.0024, πTColumn: 2, πSColumn: 2 },
    { style: "RTH", spec: "MIL-R-23648", description: "Thermistor, (Thermally Sensitive Resistor), Insulated", λb: 0.0019, πTColumn: "N/A (πT=1)", πSColumn: "N/A (πS=1)" },
    { style: "RT", spec: "MIL-R-27208", description: "Resistor, Variable, Wirewound (Lead Screw Activated)", λb: 0.0024, πTColumn: 2, πSColumn: 1 },
    { style: "RTR", spec: "MIL-R-39015", description: "Resistor, Variable, Wirewound (Lead Screw Activated), Established Reliability", λb: 0.0024, πTColumn: 2, πSColumn: 1 },
    { style: "RR", spec: "MIL-R-12934", description: "Resistor, Variable, Wirewound, Precision", λb: 0.0024, πTColumn: 2, πSColumn: 1 },
    { style: "RA", spec: "MIL-R-19", description: "Resistor, Variable, Wirewound (Low Operating Temperature)", λb: 0.0024, πTColumn: 1, πSColumn: 1 },
    { style: "RK", spec: "MIL-R-39002", description: "Resistor, Variable, Wirewound, Semi-Precision", λb: 0.0024, πTColumn: 1, πSColumn: 1 },
    { style: "RP", spec: "MIL-R-22", description: "Resistor, Wirewound, Power Type", λb: 0.0024, πTColumn: 2, πSColumn: 1 },
    { style: "RJ", spec: "MIL-R-22097", description: "Resistor, Variable, Nonwirewound", λb: 0.0037, πTColumn: 2, πSColumn: 1 },
    { style: "RJR", spec: "MIL-R-39035", description: "Resistor, Variable, Nonwirewound Est. Rel.", λb: 0.0037, πTColumn: 2, πSColumn: 1 },
    { style: "RV", spec: "MIL-R-94", description: "Resistor, Variable, Composition", λb: 0.0037, πTColumn: 2, πSColumn: 1 },
    { style: "RO", spec: "MIL-R-39023", description: "Resistor, Variable, Nonwirewound, Precision", λb: 0.0037, πTColumn: 1, πSColumn: 1 },
    { style: "RVC", spec: "MIL-R-23285", description: "Resistor, Variable, Nonwirewound", λb: 0.0037, πTColumn: 1, πSColumn: 1 }
  ];

  // Temperature factors
  const tempFactors = [
    { temp: 20, col1: 0.88, col2: 0.95 },
    { temp: 30, col1: 1.1, col2: 1.1 },
    { temp: 40, col1: 1.5, col2: 1.2 },
    { temp: 50, col1: 1.8, col2: 1.3 },
    { temp: 60, col1: 2.3, col2: 1.4 },
    { temp: 70, col1: 2.8, col2: 1.5 },
    { temp: 80, col1: 3.4, col2: 1.6 },
    { temp: 90, col1: 4.0, col2: 1.7 },
    { temp: 100, col1: 4.8, col2: 1.9 },
    { temp: 110, col1: 5.6, col2: 2.0 },
    { temp: 120, col1: 6.6, col2: 2.1 },
    { temp: 130, col1: 7.6, col2: 2.3 },
    { temp: 140, col1: 8.7, col2: 2.4 },
    { temp: 150, col1: 10, col2: 2.5 }
  ];

  // Power stress factors
  const powerStressFactors = [
    { stress: 0.1, col1: 0.79, col2: 0.66 },
    { stress: 0.2, col1: 0.88, col2: 0.81 },
    { stress: 0.3, col1: 0.99, col2: 1.0 },
    { stress: 0.4, col1: 1.1, col2: 1.2 },
    { stress: 0.5, col1: 1.2, col2: 1.5 },
    { stress: 0.6, col1: 1.4, col2: 1.8 },
    { stress: 0.7, col1: 1.5, col2: 2.3 },
    { stress: 0.8, col1: 1.7, col2: 2.8 },
    { stress: 0.9, col1: 1.9, col2: 3.4 }
  ];

  // Quality factors
  const qualityFactors = [
    { quality: "Established Reliability (S)", πQ: 0.03 },
    { quality: "Established Reliability (R)", πQ: 0.1 },
    { quality: "Established Reliability (P)", πQ: 0.3 },
    { quality: "Established Reliability (M)", πQ: 1.0 },
    { quality: "Non-Established Reliability", πQ: 3.0 },
    { quality: "Commercial/Unknown", πQ: 10.0 }
  ];

  // Environment factors
  const environmentFactors = [
    { env: "GB (Ground, Benign)", πE: 1.0 },
    { env: "GF (Ground, Fixed)", πE: 4.0 },
    { env: "GM (Ground, Mobile)", πE: 16.0 },
    { env: "NS (Naval, Sheltered)", πE: 12.0 },
    { env: "NU (Naval, Unsheltered)", πE: 42.0 },
    { env: "AIC (Airborne, Inhabited, Cargo)", πE: 18.0 },
    { env: "AIF (Airborne, Inhabited, Fighter)", πE: 23.0 },
    { env: "AUC (Airborne, Uninhabited, Cargo)", πE: 31.0 },
    { env: "AUF (Airborne, Uninhabited, Fighter)", πE: 43.0 },
    { env: "ARW (Airborne, Rotary Wing)", πE: 63.0 },
    { env: "SF (Space, Flight)", πE: 0.5 },
    { env: "MF (Missile, Flight)", πE: 37.0 },
    { env: "ML (Missile, Launch)", πE: 87.0 },
    { env: "CL (Cannon, Launch)", πE: 1728.0 }
  ];

  // State for form inputs

  const [selectedResistor, setSelectedResistor] = useState(resistorTypes[0]);
  const [temperature, setTemperature] = useState(30);
  const [powerDissipation, setPowerDissipation] = useState(1.0);
  const [ratedPower, setRatedPower] = useState(1.0);
  const [selectedQuality, setSelectedQuality] = useState(qualityFactors[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environmentFactors[0]);
  const [results, setResults] = useState([]);
  const [components, setComponents] = useState({
    
    
});
  const [showResults, setShowResults] = useState(false);

  //  const systemMetrics = calculateSystemMetrics(components);
  const calculateSystemMetrics = (components) => {
    const λp = components.reduce((sum, comp) => sum + (comp.totalFailureRate || 0), 0);
    const mtbf = λp > 0 ? (1000000 / λp) : Infinity;
    return { λp, mtbf };
  };
  const [showMetrics, setShowMetrics] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({ λp: 0, mtbf: Infinity });


  // Calculate πT (Temperature Factor)
  const calculatePiT = () => {
    // Check if πT is N/A (then return 1)
    if (selectedResistor.πTColumn === "N/A (πT=1)") return 1.0;

    // Find the closest temperature in the table
    const closestTemp = tempFactors.reduce((prev, curr) =>
      Math.abs(curr.temp - temperature) < Math.abs(prev.temp - temperature) ? curr : prev
    );

    // Use the appropriate column based on the resistor type
    return selectedResistor.πTColumn === 1 ? closestTemp.col1 : closestTemp.col2;
  };

  // Calculate πS (Power Stress Factor)
  const calculatePiS = () => {
    // Check if πS is N/A (then return 1)
    if (selectedResistor.πSColumn === "N/A (πS=1)") return 1.0;

    // Calculate power stress ratio (S)
    const S = powerDissipation / ratedPower;

    // Find the closest stress in the table
    const closestStress = powerStressFactors.reduce((prev, curr) =>
      Math.abs(curr.stress - S) < Math.abs(prev.stress - S) ? curr : prev
    );

    // Use the appropriate column based on the resistor type
    return selectedResistor.πSColumn === 1 ? closestStress.col1 : closestStress.col2;
  };

  // Calculate πR (Power Dissipation Factor)
  const calculatePiP = () => {
    return Math.pow(powerDissipation, 0.39);
  };

  // Calculate failure rate
  const calculateFailureRate = () => {
    const λb = selectedResistor.λb;
    const πT = calculatePiT();
    const πS = calculatePiS();
    const πP = calculatePiP();
    const πQ = selectedQuality.πQ;
    const πE = selectedEnvironment.πE;

    return λb * πT * πS * πP * πQ * πE;
  };
  const handleCalculate = () => {
    const metrics = calculateSystemMetrics(components);
    setSystemMetrics(metrics);
    setShowMetrics(true);
    const newResult = {
      id: Date.now(),
      resistorType: selectedResistor.style,
      temperature,
      powerDissipation,
      ratedPower,
      quality: selectedQuality.quality,
      environment: selectedEnvironment.env,
      λb: selectedResistor.λb,
      πT: calculatePiT(),
      πS: calculatePiS(),
      πP: calculatePiP(),
      πQ: selectedQuality.πQ,
      πE: selectedEnvironment.πE,
      λp: calculateFailureRate()
    };
    
          localStorage.setItem("milValue", JSON.stringify(newResult.λp));

    setResults([...results, newResult]);    
    setShowResults(true);
  };

  const calculationColumns = [
    {
      title: <span>λ<sub>b</sub></span>,
      field: "λb",
      render: rowData => rowData.λb?.toFixed(4),

    },
    {
      title: <span>π<sub>T</sub></span>,
      field: "πT",
      render: rowData => rowData.πT?.toFixed(3),

    },
    {
      title: <span>π<sub>S</sub></span>,
      field: "πS",
      render: rowData => rowData.πS?.toFixed(3),

    },
    {
      title: <span>π<sub>P</sub></span>,
      field: "πP",
      render: rowData => rowData.πP?.toFixed(3),

    },
    {
      title: <span>π<sub>Q</sub></span>,
      field: "πQ",
      render: rowData => rowData.πQ?.toFixed(3),

    },
    {
      title: <span>π<sub>E</sub></span>,
      field: "πE",
      render: rowData => rowData.πE?.toFixed(1),

    },
    {
      title: 'Failure Rate',
      field: "λp",
      render: rowData => rowData.λp?.toFixed(6),

    },

  ];
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

  // Clear results


  return (
    <div className="calculator-container1">

      <h2 className='text-center'>Resistor </h2>
    
      <Row className="mb-3">
        <Col md={4}>
          <div className="form-group">
            <label>Part Type:</label>
            <Select
             styles={customStyles}
              value={resistorTypes.find(option => option.value === selectedResistor)}
              onChange={(selectedOption) => setSelectedResistor(selectedOption.value)}
              options={resistorTypes.map(type => ({
                value: type,
                label: `${type.style} - ${type.description} (${type.spec})`
              }))}
              placeholder="Select type"
              className="basic-select"
              classNamePrefix="select"
            />
          </div>

        </Col>
        <Col md={4}>


          <div className="form-group">
            <label>Quality ( π<sub>Q</sub>):</label>
            <Select
              value={qualityFactors.find(q => q.value === selectedQuality)}
              onChange={(selectedOption) => setSelectedQuality(selectedOption.value)}
              style={{
                width: "100%",
                padding: "0.375rem 0.75rem",
                fontSize: "1rem",
                lineHeight: "1.5",
                color: "#495057",
                backgroundColor: "#fff",
                border: "1px solid #ced4da",
                borderRadius: "0.25rem"
              }}
              className="basic-select"
              classNamePrefix="select"
              options={qualityFactors.map(type => ({
                value: type,
                label: `${type.quality} (${type.πQ})`
              }))}
            />


          </div>
        </Col>
       

        <Col md={4}>
          <div className="form-group">
            <label>Environment  (π<sub>E</sub>) :</label>
            <Select
              value={environmentFactors.find(option => option.value === selectedEnvironment)}
              onChange={(selectedOption) => setSelectedEnvironment(selectedOption.value)}
              className="basic-select1"
              classNamePrefix="select"
              options={environmentFactors.map(type => ({
                value: type,
                label: `${type.env} (${type.πE})`
              }))}
            />

            {/* {environmentFactors.map((env, index) => (
                <option key={index} value={index}>{env.env}</option>
              ))} */}

          </div>
        </Col>
      </Row>
      <Row className="mb-3">

        <Col md={4}>
          <div className="form-group">
            <label>Power Factor (Watts) (π<sub>P</sub>):</label>
            <input
              type="number"
              value={ratedPower}
              onChange={(e) => setRatedPower(parseFloat(e.target.value))}
              min="0.001"
              step="0.001"
              style={{
                width: "100%",
                padding: "0.375rem 0.75rem",
                fontSize: "1rem",
                lineHeight: "1.5",
                color: "#495057",
                backgroundColor: "#fff",
                border: "1px solid #ced4da",
                borderRadius: "0.25rem"
              }}
            />
          </div>
        </Col>
        <Col md={4}>
          <div className="form-group">
            <label>Temperature (°C) (π<sub>T</sub>):</label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              min="20"
              max="150"
              step="1"
              style={{
                width: "100%",
                padding: "0.375rem 0.75rem",
                fontSize: "1rem",
                lineHeight: "1.5",
                color: "#495057",
                backgroundColor: "#fff",
                border: "1px solid #ced4da",
                borderRadius: "0.25rem"
              }}
            />
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Power Stress Factor ( π<sub>S</sub>):</label>
            <input
              type="number"
              value={powerDissipation}
              onChange={(e) => setPowerDissipation(parseFloat(e.target.value))}
              min="0.001"
              step="0.001"
              style={{
                width: "100%",
                padding: "0.375rem 0.75rem",
                fontSize: "1rem",
                lineHeight: "1.5",
                color: "#495057",
                backgroundColor: "#fff",
                border: "1px solid #ced4da",
                borderRadius: "0.25rem"
              }}
            />
          </div>
        </Col>
      </Row>
     
     
    
      {/* </div> */}
      <div className='d-flex justify-content-between align-items-center' >
      <div>
      {/* // In your return statement: */}
    
      {showMetrics && (

      <>


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
        
          </>
      )}
      </div>
      
      <Button  className="btn-calculate float-end mt-1" onClick={handleCalculate}>
        Calculate Failure Rate
      </Button>
      </div>
      <div >
          {showResults && results.length > 0 && (
            <div>
  <h2 className='text-center'>
            Calculation Result
          </h2>
              <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
              {results[results.length - 1].λp.toFixed(6)} failures/10<sup>6</sup> hours


            </div>
          )}
    
  <br/>

      {/* // Your calculation function remains the same */}

      {showCalculations && (

        <>
          {/* // In your component's return statement: */}
          <div className="card">
            <div className="card-body">

              <MaterialTable
                columns={calculationColumns}
                data={[
                  {
                    λb: selectedResistor.λb,
                    πT: calculatePiT(),
                    πS: calculatePiS(),
                    πP: calculatePiP(),
                    πQ: selectedQuality.πQ,
                    πE: selectedEnvironment.πE,
                    λp: calculateFailureRate()
                  }
                ]}
                options={{
                  search: false,
                  paging: components.length > 10,
                  pageSize: 10,
                  pageSizeOptions: [10, 20, 50],
                  toolbar: false,
                  headerStyle: {
                    backgroundColor: '#CCE6FF',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  },
                  rowStyle: {
                    backgroundColor: '#FFF'
                  },
                  cellStyle: {
                    padding: '8px 16px'
                  }
                }}
                components={{
                  Container: props => <Paper {...props} elevation={2} />
                }}
              />

              <div className="formula-section" style={{ marginTop: '24px' }}>
                <Typography variant="h6" gutterBottom>
                  Calculation Formula
                </Typography>
                <Typography variant="body1" paragraph>
                  λ<sub>p</sub> = λ<sub>b</sub> × π<sub>T</sub> × π<sub>S</sub> × π<sub>P</sub> × π<sub>Q</sub> × π<sub>E</sub>
                </Typography>
                <Typography variant="body1" paragraph>Where:</Typography>

                <ul>
                  <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>
                  <li>λ<sub>b</sub> = Base failure rate</li>
                  <li>π<sub>T</sub> = Temperature factor</li>
                  <li>π<sub>S</sub> = Power stress factor</li>
                  <li>π<sub>P</sub> = Power dissipation factor (π<sub>P</sub>= (Power Dissipation)<sup>0.39</sup>)</li>
                  <li>π<sub>Q</sub> = Quality factor</li>
                  <li>π<sub>E</sub> = Environment factor</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>



  );
};

export default ResistorCalculation;