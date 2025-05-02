import React, { useState } from 'react';
import './CapacitorCalculaton.css';

import { Button,Row,Col } from 'react-bootstrap';
import { Link } from '@material-ui/core';
import MaterialTable from "material-table";
import {
  Paper,
  Typography,
  IconButton,
  Tooltip
} from '@material-ui/core';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import Select from "react-select";
import { CalculatorIcon } from '@heroicons/react/24/outline';

import DeleteIcon from '@material-ui/icons/Delete';
function CapacitorCalculation({ onCalculate }) {  // Capacitor types data
  const capacitorTypes = [
    { style: "CP", spec: "MIL-C-25", description: "Capacitor, Fixed, Paper-Dielectric, DC (Hermetically Sealed)", λb: 0.00037, πrColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CA", spec: "MIL-C-12889", description: "Capacitor, By-Pass, Radio - Maintenance Reduction, Paper Dielectric", λb: 0.00037, πrColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CZ, CZR", spec: "MIL-C-11693", description: "Capacitor, Fixed, Radio Interference Reduction AC/DC", λb: 0.00037, πrColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CO, COR", spec: "MIL-C-19976", description: "Capacitor, Fixed Plastic/Paper-Plastic Dielectric", λb: 0.00051, πrColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CH", spec: "MIL-C-18312", description: "Capacitor, Fixed, Metallized Paper/Plastic Film, DC", λb: 0.00037, πrColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CHR", spec: "MIL-C-39022", description: "Capacitor, Fixed, Metallized Paper/Plastic Film", λb: 0.00051, πrColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CFR", spec: "MIL-C-55514", description: "Capacitor, Fixed, Plastic Dielectric, DC in Non-Metal Cases", λb: 0.00051, πrColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CRH", spec: "MIL-C-83421", description: "Capacitor, Fixed Supermetallized Plastic Film Dielectric", λb: 0.00051, πrColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CM", spec: "MIL-C-5", description: "Capacitors, Fixed, Mica Dielectric", λb: 0.00076, πrColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CMR", spec: "MIL-C-39001", description: "Capacitor, Fixed, Mica Dielectric, Est. Rel.", λb: 0.00076, πrColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CB", spec: "MIL-C-10950", description: "Capacitor, Fixed, Mica Dielectric, Button Style", λb: 0.00076, πrColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CY", spec: "MIL-C-11272", description: "Capacitor, Fixed, Glass Dielectric", λb: 0.00076, πrColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CYR", spec: "MIL-C-23269", description: "Capacitor, Fixed, Glass Dielectric, Est. Rel.", λb: 0.00076, πrColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CK", spec: "MIL-C-11015", description: "Capacitor, Fixed, Ceramic Dielectric (General Purpose)", λb: 0.00099, πrColumn: 2, πcColumn: 1, πvColumn: 3, πsrColumn: 1 },
    { style: "CKR", spec: "MIL-C-39014", description: "Capacitor, Fixed, Ceramic Dielectric (General Purpose), Est. Rel.", λb: 0.00099, πrColumn: 2, πcColumn: 1, πvColumn: 3, πsrColumn: 1 },
    { style: "CC, CCR", spec: "MIL-C-20", description: "Capacitor, Fixed, Ceramic Dielectric (Temperature Compensating)", λb: 0.00099, πrColumn: 2, πcColumn: 1, πvColumn: 3, πsrColumn: 1 },
    { style: "CCR", spec: "MIL-C-55681", description: "Capacitor, Chip, Multiple Layer, Fixed, Ceramic Dielectric", λb: 0.0020, πrColumn: 2, πcColumn: 1, πvColumn: 3, πsrColumn: 1 },
    { style: "CSR", spec: "MIL-C-39003", description: "Capacitor, Fixed, Electrolytic (Solid), Tantalum, Est. Rel.", λb: 0.00040, πrColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: "See πSR Table" },
    { style: "CWR", spec: "MIL-C-55965", description: "Capacitor, Fixed, Electrolytic (Tantalum), Chip, Est. Rel.", λb: 0.00005, πrColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: "See πSR Table" },
    { style: "CL", spec: "MIL-C-3965", description: "Capacitor, Fixed, Electrolytic (Nonsolid), Tantalum", λb: 0.00040, πrColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: 1 },
    { style: "CLR", spec: "MIL-C-39006", description: "Capacitor, Fixed, Electrolytic (Nonsolid), Tantalum, Est. Rel.", λb: 0.00040, πrColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: 1 },
    { style: "CRL", spec: "MIL-C-83500", description: "Capacitor, Fixed, Electrolytic (Nonsolid), Tantalum Cathode", λb: 0.00040, πrColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: 1 },
    { style: "CU, CUR", spec: "MIL-C-39018", description: "Capacitor, Fixed, Electrolytic (Aluminum Oxide)", λb: 0.00012, πrColumn: 2, πcColumn: 2, πvColumn: 1, πsrColumn: 1 },
    { style: "CE", spec: "MIL-C-62", description: "Capacitor, Fixed Electrolytic (DC, Aluminum, Dry Electrolyte)", λb: 0.00012, πrColumn: 2, πcColumn: 2, πvColumn: 1, πsrColumn: 1 },
    { style: "CV", spec: "MIL-C-81", description: "Capacitor, Variable, Ceramic Dielectric (Trimmer)", λb: 0.0079, πrColumn: 1, πcColumn: 1, πvColumn: 5, πsrColumn: 1 },
    { style: "PC", spec: "MIL-C-14409", description: "Capacitor, Variable (Piston Type, Tubular Trimmer)", λb: 0.0060, πrColumn: 2, πcColumn: 1, πvColumn: 5, πsrColumn: 1 },
    { style: "CT", spec: "MIL-C-92", description: "Capacitor, Variable, Air Dielectric (Trimmer)", λb: 0.0000072, πrColumn: 2, πcColumn: 1, πvColumn: 5, πsrColumn: 1 },
    { style: "CG", spec: "MIL-C-23183", description: "Capacitor, Fixed or Variable, Vacuum Dielectric", λb: 0.0060, πrColumn: 1, πcColumn: 1, πvColumn: 5, πsrColumn: 1 }
  ];

  // Temperature factors
  const tempFactors = [
    { temp: 20, col1: 0.91, col2: 0.79 },
    { temp: 30, col1: 1.1, col2: 1.3 },
    { temp: 40, col1: 1.3, col2: 1.9 },
    { temp: 50, col1: 1.6, col2: 2.9 },
    { temp: 60, col1: 1.8, col2: 4.2 },
    { temp: 70, col1: 2.2, col2: 6.0 },
    { temp: 80, col1: 2.5, col2: 8.4 },
    { temp: 90, col1: 2.8, col2: 11 },
    { temp: 100, col1: 3.2, col2: 15 },
    { temp: 110, col1: 3.7, col2: 21 },
    { temp: 120, col1: 4.1, col2: 27 },
    { temp: 130, col1: 4.6, col2: 35 },
    { temp: 140, col1: 5.1, col2: 44 },
    { temp: 150, col1: 5.6, col2: 56 }
  ];

  // Capacitance factors
  const capacitanceFactors = [
    { capacitance: 0.000001, col1: 0.29, col2: 0.04 },
    { capacitance: 0.00001, col1: 0.35, col2: 0.07 },
    { capacitance: 0.0001, col1: 0.44, col2: 0.12 },
    { capacitance: 0.001, col1: 0.54, col2: 0.20 },
    { capacitance: 0.01, col1: 0.66, col2: 0.35 },
    { capacitance: 0.05, col1: 0.76, col2: 0.50 },
    { capacitance: 0.1, col1: 0.81, col2: 0.59 },
    { capacitance: 0.5, col1: 0.94, col2: 0.85 },
    { capacitance: 1, col1: 1.0, col2: 1.0 },
    { capacitance: 3, col1: 1.1, col2: 1.3 },
    { capacitance: 8, col1: 1.2, col2: 1.6 },
    { capacitance: 18, col1: 1.3, col2: 1.9 },
    { capacitance: 40, col1: 1.4, col2: 2.3 },
    { capacitance: 200, col1: 1.6, col2: 3.4 },
    { capacitance: 1000, col1: 1.9, col2: 4.9 },
    { capacitance: 3000, col1: 2.1, col2: 6.3 },
    { capacitance: 10000, col1: 2.3, col2: 8.3 },
    { capacitance: 30000, col1: 2.5, col2: 11 },
    { capacitance: 60000, col1: 2.7, col2: 13 },
    { capacitance: 120000, col1: 2.9, col2: 15 }
  ];

  // Voltage stress factors
  const voltageStressFactors = [
    { stress: 0.1, col1: 1.0, col2: 1.0, col3: 1.0, col4: 1.0, col5: 1.0 },
    { stress: 0.2, col1: 1.0, col2: 1.0, col3: 1.0, col4: 1.0, col5: 1.1 },
    { stress: 0.3, col1: 1.0, col2: 1.0, col3: 1.1, col4: 1.0, col5: 1.2 },
    { stress: 0.4, col1: 1.1, col2: 1.0, col3: 1.3, col4: 1.0, col5: 1.5 },
    { stress: 0.5, col1: 1.4, col2: 1.2, col3: 1.6, col4: 1.0, col5: 2.0 },
    { stress: 0.6, col1: 2.0, col2: 2.0, col3: 2.0, col4: 2.0, col5: 2.7 },
    { stress: 0.7, col1: 3.2, col2: 5.7, col3: 2.6, col4: 15, col5: 3.7 },
    { stress: 0.8, col1: 5.2, col2: 19, col3: 3.4, col4: 130, col5: 5.1 },
    { stress: 0.9, col1: 8.6, col2: 59, col3: 4.4, col4: 990, col5: 6.8 },
    { stress: 1, col1: 14, col2: 166, col3: 5.6, col4: 5900, col5: 9.0 }
  ];

  // Series resistance factors (for Tantalum CSR Style Capacitors)
  const seriesResistanceFactors = [
    { resistance: 0.8, πsr: 0.66 },
    { resistance: 0.6 , πsr: 1.0 },
    { resistance: 0.4, πsr: 1.3 },
    { resistance: 0.2, πsr: 2.0 },
    { resistance: 0.1, πsr: 2.7 },
    { resistance: 0.0, πsr: 3.3 }
  ];

  // Quality factors
  const qualityFactors = [
    { quality: "Established Reliability (D)", πQ: 0.001 },
    { quality: "Established Reliability (C)", πQ: 0.01 },
    { quality: "Established Reliability (S, B)", πQ: 0.03 },
    { quality: "Established Reliability (R)", πQ: 0.1 },
    { quality: "Established Reliability (P)", πQ: 0.3 },
    { quality: "Established Reliability (M)", πQ: 1.0 },
    {quality:"Established Reliablity (L)",πQ: 1.0},
    { quality: "Non-Established Reliability", πQ: 3.0},
    { quality: "Commercial/Unknown", πQ: 10.0 }
  ];

  // Environment factors
  const environmentFactors = [
    { env: "GB (Ground, Benign)", πE: 1.0 },
    { env: "GF (Ground, Fixed)", πE: 10 },
    { env: "GM (Ground, Mobile)", πE: 20 },
    { env: "NS (Naval, Sheltered)", πE: 7.0 },
    { env: "NU (Naval, Unsheltered)", πE: 15 },
    { env: "AIC (Airborne, Inhabited, Cargo)", πE: 12 },
    { env: "AIF (Airborne, Inhabited, Fighter)", πE: 15 },
    { env: "AUC (Airborne, Uninhabited, Cargo)", πE: 25 },
    { env: "AUF (Airborne, Uninhabited, Fighter)", πE: 30 },
    { env: "ARW (Airborne, Rotary Wing)", πE: 40 },
    { env: "SF (Space, Flight)", πE: 0.50 },
    { env: "MF (Missile, Flight)", πE: 20 },
    { env: "ML (Missile, Launch)", πE: 50 },
    { env: "CL (Cannon, Launch)", πE: 570 }
  ];

  // State for form inputs
  const [selectedCapacitor, setSelectedCapacitor] = useState(capacitorTypes[1]);
  const [temperature, setTemperature] = useState(30);
  const [capacitance, setCapacitance] = useState(0.015); // Default to 0.015 μF (15,000 pF)
  const [dcVoltageApplied, setDcVoltageApplied] = useState(200);
  const [acVoltageApplied, setAcVoltageApplied] = useState(50);
  const [dcVoltageRated, setDcVoltageRated] = useState(400);
  const [seriesResistance, setSeriesResistance] = useState(0.8);
  const [selectedQuality, setSelectedQuality] = useState(qualityFactors[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environmentFactors[0]);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showCalculations,setShowCalculations] = useState();

  // Calculate πT (Temperature Factor)
  const calculatePiT = () => {
    const closestTemp = tempFactors.reduce((prev, curr) => 
      Math.abs(curr.temp - temperature) < Math.abs(prev.temp - temperature) ? curr : prev
    );
    
    return selectedCapacitor.πrColumn === 1 ? closestTemp.col1 : closestTemp.col2;
  };
  
  // Calculate πC (Capacitance Factor)
  const calculatePiC = () => {
    const closestCap = capacitanceFactors.reduce((prev, curr) => 
      Math.abs(curr.capacitance - capacitance) < Math.abs(prev.capacitance - capacitance) ? curr : prev
    );
    
    return selectedCapacitor.πcColumn === 1 ? closestCap.col1 : closestCap.col2;
  };
  const calculationColumns = [
{
 title: <span>λ<sub>b</sub></span>,
 field: 'λb',
 render: rowData => rowData.λb?.toFixed(6),

 headerStyle: { whiteSpace: 'nowrap' },
 tooltip: 'Base failure rate in failures/10⁶ hours'
},
{
 title: <span>π<sub>T</sub></span>,
 field: 'πT',
 render: rowData => rowData.πT?.toFixed(3),

 tooltip: 'Temperature factor'
},
{
 title: <span>π<sub>C</sub></span>,
 field: 'πC',
 render: rowData => rowData.πC?.toFixed(3),

 tooltip: 'Capacitance factor'
},
{
 title: <span>π<sub>V</sub></span>,
 field: 'πV',
 render: rowData => rowData.πV?.toFixed(3),

 tooltip: 'Voltage stress factor'
},
{
 title: <span>π<sub>SR</sub></span>,
 field: 'πSR',
 render: rowData => rowData.πSR?.toFixed(3),

 tooltip: 'Series resistance factor'
},
{
 title: <span>π<sub>Q</sub></span>,
 field: 'πQ',
 render: rowData => rowData.πQ?.toFixed(3),
 tooltip: 'Quality factor'
},
{
 title: <span>π<sub>E</sub></span>,
 field: 'πE',
 render: rowData => rowData.πE?.toFixed(1),

 tooltip: 'Environment factor'
},
{
 title: 'Failure Rate',
 field: 'λp',
 render: rowData => <strong>{rowData.λp?.toFixed(6)}</strong>,


 tooltip: 'Predicted failure rate in failures/10⁶ hours'
}
];

  // Calculate πV (Voltage Stress Factor)
  const calculatePiV = () => {
    const stress = (dcVoltageApplied + Math.sqrt(2) * acVoltageApplied) / dcVoltageRated;
    const closestStress = voltageStressFactors.reduce((prev, curr) => 
      Math.abs(curr.stress - stress) < Math.abs(prev.stress - stress) ? curr : prev
    );
    
    // Select column based on capacitor's πvColumn
    switch(selectedCapacitor.πvColumn) {
      case 1: return closestStress.col1;
      case 2: return closestStress.col2;
      case 3: return closestStress.col3;
      case 4: return closestStress.col4;
      case 5: return closestStress.col5;
      default: return 1.0;
    }
  };
  
  // Calculate πSR (Series Resistance Factor)
  const calculatePiSR = () => {
    if (selectedCapacitor.πsrColumn === 1 || selectedCapacitor.πsrColumn === "1") return 1.0;
    if (selectedCapacitor.πsrColumn === "See πSR Table") {
      const closestResistance = seriesResistanceFactors.reduce((prev, curr) => 
        Math.abs(curr.resistance - seriesResistance) < Math.abs(prev.resistance - seriesResistance) ? curr : prev
      );
      return closestResistance.πsr;
    }
    return 1.0;
  };
  
  // Calculate failure rate
  const calculateFailureRate = () => {
    const λb = selectedCapacitor.λb;
    const πT = calculatePiT();
    const πC = calculatePiC();
    const πV = calculatePiV();
    const πSR = calculatePiSR();
    const πQ = selectedQuality.πQ;
    const πE = selectedEnvironment.πE;
    
    return λb * πT * πC * πV * πSR * πQ * πE;
  };

  const handleCalculate = () => {
    const λb = selectedCapacitor.λb;
    const πT = calculatePiT();
    const πC = calculatePiC();
    const πV = calculatePiV();
    const πSR = calculatePiSR();
    const πQ = selectedQuality.πQ;
    const πE = selectedEnvironment.πE;
    const λp = calculateFailureRate();
    

    const newResult = {
      id: Date.now(),
      value: λp.toFixed(6),
      capacitorType: selectedCapacitor.style,
      temperature,
      capacitance,
      dcVoltageApplied,
      acVoltageApplied,
      dcVoltageRated,
      seriesResistance,
      quality: selectedQuality.quality,
      environment: selectedEnvironment.env,
      parameters:{
        λb,
        πT,
        πC,
        πV,
        πSR,
        πQ,
        πE,
        λp
        

      }
      // λb: selectedCapacitor.λb,
      // πT: calculatePiT(),
      // πC: calculatePiC(),
      // πV: calculatePiV(),
      // πSR: calculatePiSR(),
      // πQ: selectedQuality.πQ,
      // πE: selectedEnvironment.πE,
      // λp: calculateFailureRate()
    };
    
    setResults([...results, newResult]);
    setShowResults(true);
    if (onCalculate) {
      onCalculate(λp); // Pass the raw number, not the string
    }
  };
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
    <div className="calculator-container">
      <h2 className='text-center'> Capacitor</h2>
      <div >
      <Row>
   <Col md={6}>
        <div className="form-group">
  
     
          <label>Part Type:</label>
          <Select 
            style={customStyles}
            value={capacitorTypes.find(option => option.value === selectedCapacitor)}
            onChange={(selectedOption) => setSelectedCapacitor(selectedOption.value)}
            options={capacitorTypes.map((type =>({
                value: type,
                label: `${type.style} - ${type.description}`
             
            }))
          )}
            placeholder="Select type"
            className="basic-select"
            classNamePrefix="select"
            
          />
         
      
       
        </div>
        </Col>
        <Col md={6}>
        <div className="form-group">
          <label>Environmenjt:</label>
          <Select 
            style={customStyles}

            value={environmentFactors.find( option=> option.value === selectedEnvironment)}
            onChange={(selectedOption) => setSelectedEnvironment(selectedOption.value)}
            options={environmentFactors.map((type => ({
                              value: type,
                label: `${type.env}`
            }))
          )}
          />
          
        
        </div>
        </Col>
        </Row>
        <Row>
     
      <Col md={4}>
        <div className="form-group">
          <label>DC Voltage Applied (V):</label>
          <input 
            type="number" 
            value={dcVoltageApplied} 
            onChange={(e) => setDcVoltageApplied(parseFloat(e.target.value))} 
            min="0" 
            step="1"
          />
        </div>
        </Col>
    <Col md={4}>
        <div className="form-group">
          <label>AC Voltage Applied (Vrms):</label>
          <input 
            type="number" 
            value={acVoltageApplied} 
            onChange={(e) => setAcVoltageApplied(parseFloat(e.target.value))} 
            min="0" 
            step="1"
          />
        </div>
        </Col>
      <Col md={4}>
        <div className="form-group">
          <label>DC Voltage Rated (V):</label>
          <input 
            type="number" 
            value={dcVoltageRated} 
            onChange={(e) => setDcVoltageRated(parseFloat(e.target.value))} 
            min="1" 
            step="1"
          />
        </div>
        </Col>
        </Row>
        {selectedCapacitor.πsrColumn === "See πSR Table" && (
          <div className="form-group">
            <label>Series Resistance (ohms/volt):</label>
            <input 
              type="number" 
              value={seriesResistance} 
              onChange={(e) => setSeriesResistance(parseFloat(e.target.value))} 
              min="0" 
              step="0.1"
            />
          </div>
        )}

<Row>
  <Col>
        <div className="form-group">
          <label>Quality:</label>
          <Select 
            style={customStyles}
            value={qualityFactors.find(option => option.value === selectedQuality)}
            onChange={(selectedOption) => setSelectedQuality(selectedOption.value)}
            options={qualityFactors.map(type =>({
                value: type,
                label: `${type.quality}`
              }))}
              placeholder="Select type"
              className="basic-select"
              classNamePrefix="select"
         />
           
        
        </div>
        </Col>
        <Col md={4}>
        <div className="form-group">
   
          <label>Temperature (°C):</label>
          <input 
            type="number" 
            value={temperature} 
            onChange={(e) => setTemperature(parseFloat(e.target.value))} 
            min="20" 
            max="150" 
            step="1"
          />
         
        </div>
        
  </Col>
      <Col md={4}>
        <div className="form-group">
  
      
  <label>Capacitance (μF):</label>

  <input 
    type="number" 
    value={capacitance} 
    onChange={(e) => setCapacitance(parseFloat(e.target.value))} 
    min="0.000001" 
    step="0.000001"
  />
   
</div>
</Col>
        </Row>
      </div>
      <div className='d-flex justify-content-between align-items-center' >
      <div>
      {showResults && (
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
        <Button  className="btn-calculate float-end mt-1" onClick={handleCalculate}>
          Calculate Failure Rate
        </Button>
       </div>
       <br/>
       <div>
        {showResults && results.length > 0 && (
  <div>
    <h2 className='text-center'>Calculation Result</h2>
    <div className="d-flex align-items-center">
      <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
      <span className="ms-2">
        {calculateFailureRate().toFixed(6)} failures/10<sup>6</sup> hours
      </span>
    </div>
  </div>
)}
<br/>
    
      {showCalculations && (
  <>
   <Row className="mb-4">
              <Col>
   <div className="card">
                <div className="card-body">

                  <div className="table-responsive">
<MaterialTable
  columns={calculationColumns}
  data={[{
    λb : selectedCapacitor.λb,
    πT : calculatePiT(),
    πC : calculatePiC(),
    πV : calculatePiV(),
    πSR : calculatePiSR(),
   πQ : selectedQuality.πQ,
    πE : selectedEnvironment.πE,
    λp : calculateFailureRate(),
 }]}
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
</div>
</div>
</Col>
</Row>
<div className="formula-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
  <Typography variant="h6" gutterBottom>
    Calculation Formula
  </Typography>
  <Typography variant="body1" paragraph>
    λ<sub>p</sub> = λ<sub>b</sub> × π<sub>T</sub> × π<sub>C</sub> × π<sub>V</sub> × π<sub>SR</sub> × π<sub>Q</sub> × π<sub>E</sub>
  </Typography>
  <Typography variant="body1" paragraph>Where:</Typography>
  <ul>
    <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>
    <li>λ<sub>b</sub> = Base failure rate (from capacitor type)</li>
    <li>π<sub>T</sub> = Temperature factor</li>
    <li>π<sub>C</sub> = Capacitance factor</li>
    <li>π<sub>V</sub> = Voltage stress factor</li>
    <li>π<sub>SR</sub> = Series resistance factor (for Tantalum capacitors)</li>
    <li>π<sub>Q</sub> = Quality factor</li>
    <li>π<sub>E</sub> = Environment factor</li>
  </ul>
</div>
        </>
      )}
      </div>
    {/* )} */}
     </div> 
   
  );
};

export default CapacitorCalculation;