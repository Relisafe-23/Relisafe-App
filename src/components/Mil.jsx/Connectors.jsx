import React, { useState } from 'react';
import { Row, Col, Button, Alert, Form } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import { CalculatorIcon } from '@heroicons/react/24/outline'; // or /24/solid

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography';
import MaterialTable from 'material-table';
import Paper from '@mui/material/Paper';

const Connectors = ({ onCalculate }) => {
  const [currentComponent, setCurrentComponent] = useState({
    type:"Connectors General"
  })
  // Base failure rate data from the image
  const baseRatesGeneral = [
    { type: 'Circular/Cylindrical', specs: '5015, 26482, 26500, 27599, 28840, 29600, 36999, 83723, 81511', rate: 0.0010 },
    { type: 'Card Edge (PCB)', specs: '21097, 55302', rate: 0.040 },
    { type: 'Hexagonal', specs: '24055, 24056', rate: 0.15 },
    { type: 'Rack and Panel', specs: '24308, 28731, 28748, 83515', rate: 0.021 },
    { type: 'Rectangular', specs: '21617, 24308, 28748, 2804, 81659, 83513, 83527, 83733, 85028', rate: 0.046 },
    { type: 'RF Coaxial', specs: '3607, 15370, 3643, 25516, 3650, 26637, 3655, 39012, 55235, 83517', rate: 0.00041 },
    { type: 'Telephone', specs: '55074', rate: 0.0075 },
    { type: 'Power', specs: '22992', rate: 0.0070 },
    { type: 'Triaxial', specs: '', rate: 0.0036 } // Assuming same as RF Coaxial
  ];

  // Temperature factors
  const temperatureFactorsGeneral = [
    { temp: 20, factor: 0.91 },
    { temp: 30, factor: 1.1 },
    { temp: 40, factor: 1.3 },
    { temp: 50, factor: 1.5 },
    { temp: 60, factor: 1.8 },
    { temp: 70, factor: 2.0 },
    { temp: 80, factor: 2.3 },
    { temp: 90, factor: 2.7 },
    { temp: 100, factor: 3.0 },
    { temp: 110, factor: 3.4 },
    { temp: 120, factor: 3.7 },
    { temp: 130, factor: 4.1 },
    { temp: 140, factor: 4.6 },
    { temp: 150, factor: 5.0 },
    { temp: 160, factor: 5.5 },
    { temp: 170, factor: 6.0 },
    { temp: 180, factor: 6.5 },
    { temp: 190, factor: 7.0 },
    { temp: 200, factor: 7.5 },
    { temp: 210, factor: 8.1 },
    { temp: 220, factor: 8.6 },
    { temp: 230, factor: 9.2 },
    { temp: 240, factor: 9.8 },
    { temp: 250, factor: 10.0 }
  ];
  const baseRatesSocket = [
    { type: 'Dual-In-Line Package', specs: '83734', rate: 0.00064 },
    { type: 'Single-In-Line Package', specs: '83734', rate: 0.00064 },
    { type: 'Chip Carrier', specs: '38533', rate: 0.00064 },
    { type: 'Pin Grid Array', specs: 'N/A', rate: 0.00064 },
    { type: 'Relay', specs: '12883', rate: 0.037 },
    { type: 'Transistor', specs: '12883', rate: 0.0051 },
    { type: 'Electron Tube, CRT', specs: '12883', rate: 0.011 }
  ];

  // Quality factors from the image
  const qualityFactorsSocket = [
    { quality: 'MIL-SPEC', factor: 0.3 },
    { quality: 'Lower', factor: 1.0 }
  ];
  // Default insert temperature rise data
  const tempRiseDataGeneral = [
    { gauge: 30, current: 2, rise: 10 },
    { gauge: 30, current: 3, rise: 22 },
    { gauge: 30, current: 4, rise: 37 },
    { gauge: 30, current: 5, rise: 56 },
    { gauge: 30, current: 6, rise: 79 },
    { gauge: 22, current: 2, rise: 4 },
    { gauge: 22, current: 3, rise: 8 },
    { gauge: 22, current: 4, rise: 13 },
    { gauge: 22, current: 5, rise: 19 },
    { gauge: 22, current: 6, rise: 27 },
    { gauge: 22, current: 7, rise: 36 },
    { gauge: 22, current: 8, rise: 46 },
    { gauge: 22, current: 9, rise: 57 },
    { gauge: 22, current: 10, rise: 70 },
    { gauge: 20, current: 2, rise: 2 },
    { gauge: 20, current: 3, rise: 5 },
    { gauge: 20, current: 4, rise: 8 },
    { gauge: 20, current: 5, rise: 13 },
    { gauge: 20, current: 6, rise: 18 },
    { gauge: 20, current: 7, rise: 23 },
    { gauge: 20, current: 8, rise: 30 },
    { gauge: 20, current: 9, rise: 37 },
    { gauge: 20, current: 10, rise: 45 },
    { gauge: 20, current: 15, rise: 96 },
    { gauge: 16, current: 2, rise: 1 },
    { gauge: 16, current: 3, rise: 2 },
    { gauge: 16, current: 4, rise: 4 },
    { gauge: 16, current: 5, rise: 5 },
    { gauge: 16, current: 6, rise: 8 },
    { gauge: 16, current: 7, rise: 10 },
    { gauge: 16, current: 8, rise: 13 },
    { gauge: 16, current: 9, rise: 16 },
    { gauge: 16, current: 10, rise: 19 },
    { gauge: 16, current: 15, rise: 41 },
    { gauge: 16, current: 20, rise: 70 },
    { gauge: 16, current: 25, rise: 106 },
    { gauge: 12, current: 2, rise: 0 },
    { gauge: 12, current: 3, rise: 1 },
    { gauge: 12, current: 4, rise: 1 },
    { gauge: 12, current: 5, rise: 2 },
    { gauge: 12, current: 6, rise: 3 },
    { gauge: 12, current: 7, rise: 4 },
    { gauge: 12, current: 8, rise: 5 },
    { gauge: 12, current: 9, rise: 6 },
    { gauge: 12, current: 10, rise: 7 },
    { gauge: 12, current: 15, rise: 15 },
    { gauge: 12, current: 20, rise: 26 },
    { gauge: 12, current: 25, rise: 39 },
    { gauge: 12, current: 30, rise: 54 },
    { gauge: 12, current: 35, rise: 72 },
    { gauge: 12, current: 40, rise: 92 }
  ];

  // Mating/Unmating factors
  const matingFactorsGeneral = [
    { cycles: '0 to 0.05', factor: 1.0 },
    { cycles: '> 0.05 to 0.5', factor: 1.5 },
    { cycles: '> 0.5 to 5', factor: 2.0 },
    { cycles: '> 5 to 50', factor: 3.0 },
    { cycles: '> 50', factor: 4.0 }
  ];

  // Quality factors
  const qualityFactorsGeneral = [
    { quality: 'MIL-SPEC', factor: 1 },
    { quality: 'Lower', factor: 2 }
  ];

  // Environment factors
  const environmentFactorsGeneral = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 1.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 8.0 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 5.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 13 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 3.0 },
    { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 5.0 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 8.0 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 12 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 19 },
    { env: 'SF', label: 'Space, Flight', factor: 0.50 },
    { env: 'MF', label: 'Missile, Flight', factor: 10 },
    { env: 'ML', label: 'Missile, Launch', factor: 27 },
    { env: 'CL', label: 'Cannon, Launch', factor: 490 }
  ];

  // State for form inputs
  const [inputs, setInputs] = useState({
    connectorType:baseRatesGeneral[0],
    ambientTemp: 25,
    contactGauge: 20,
    currentPerContact: 1,
    matingCycles: matingFactorsGeneral[0],
    quality: qualityFactorsGeneral[0],
    environment: environmentFactorsGeneral[0],
    isSingleConnector: false,
    isHighPowerRF: false
  });


  const environmentFactorsSocket = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 3.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 14 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 6.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 18 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 8.0 },
    { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 12 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 11 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 13 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 25 },
    { env: 'SF', label: 'Space, Flight', factor: 0.50 },
    { env: 'MF', label: 'Missile, Flight', factor: 14 },
    { env: 'ML', label: 'Missile, Launch', factor: 36 },
    { env: 'CL', label: 'Cannon, Launch', factor: 650 }
  ];
  const [inputData, setInputData] = useState({
    componentType: baseRatesSocket[0],
    
    quality: qualityFactorsSocket[0],
    environment: environmentFactorsSocket[0],
    activePins: 1
  });
  const calculateSocketFailureRate = () => {
    try {
      const baseRateSocket = inputData.componentType.rate;
      const qualityFactorSocket = inputData.quality.factor;
      const environmentFactorsSocket = inputData.environment.factor;
      const activePinsFactorSocket = calculateActivePinsFactorSocket(inputData.activePins);

      const failureRate = baseRateSocket * activePinsFactorSocket * qualityFactorSocket * environmentFactorsSocket;
      if (onCalculate) {
        onCalculate(failureRate);
      }
      setResult({
        value: failureRate.toFixed(6),
        parameters: {
          λb: baseRateSocket.toFixed(6),
          πp: activePinsFactorSocket.toFixed(4),
          πq: qualityFactorSocket.toFixed(1),
          πE: environmentFactorsSocket.toFixed(1),
          formula: 'λp = λb × πp × πq × πE'
        }
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };


  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);

  // Calculate active pins factor
  const calculateActivePinsFactorSocket = (numPins) => {
    // Use the formula from the image: πp = exp((N-1)/10)^q where q = 0.39
    return Math.exp(Math.pow((numPins - 1) / 10, 0.39));
  };

  // Calculate temperature rise
  const calculateTempRiseGeneral = () => {
    try {
      // Handle RF Coaxial special case first
      if (inputs.connectorType?.type === 'RF Coaxial') {
        return inputs.isHighPowerRF ? 50 : 5;
      }

      // Validate required inputs
      if (typeof inputs.contactGauge === 'undefined' ||
        typeof inputs.currentPerContact === 'undefined') {
        console.warn('Missing required inputs for temperature rise calculation');
        return 0;
      }

      // Find exact match in temperature rise data
      const exactMatch = tempRiseDataGeneral.find(
        item => item.gauge === inputs.contactGauge &&
          Math.abs(item.current - inputs.currentPerContact) < 0.001 // Account for floating point precision
      );

      if (exactMatch) return exactMatch.rise;

      // Calculate using formula for unmatched cases
      const gaugeCoefficients = {
        30: { a: 3.256, b: 1.85 },
        22: { a: 2.856, b: 1.85 },
        20: { a: 2.286, b: 1.85 },
        16: { a: 1.345, b: 1.85 },
        12: { a: 0.989, b: 1.85 },
        default: { a: 0.5, b: 1.85 }
      };

      const { a, b } = gaugeCoefficients[inputs.contactGauge] || gaugeCoefficients.default;
      const calculatedRise = a * Math.pow(inputs.currentPerContact, b);

      // Ensure the result is non-negative
      return Math.max(0, calculatedRise);

    } catch (error) {
      console.error('Temperature rise calculation error:', error);
      return 0; // Safe default
    }
  };

  // Calculate operating temperature
  const calculateOperatingTempGeneral = () => {
    return inputs.ambientTemp + calculateTempRiseGeneral();
  };

  // Get temperature factor
  const getTempFactorGeneral = (temp) => {
    // Find exact match
    const exactMatch = temperatureFactorsGeneral.find(item => item.temp === Math.floor(temp));
    if (exactMatch) return exactMatch.factor;

    // If not found, use the formula
    return Math.exp((-14 / (8.617e-5)) * ((1 / (temp + 273)) - (1 / 298)));
  };

  // Calculate the failure rate
  const calculateGeneralFailureRate = () => {
    try {
      const operatingTemp = calculateOperatingTempGeneral();
      const tempFactor = getTempFactorGeneral(operatingTemp);
      const matingFactorsGeneral = inputs.matingCycles.factor;
      const qualityFactorGeneral = inputs.quality.factor;
      const environmentFactorGeneral = inputs.environment.factor;

      // Calculate final failure rate
      let failureRate = inputs.connectorType.rate * tempFactor * matingFactorsGeneral * qualityFactorGeneral * environmentFactorGeneral;

      // Adjust for single connector if needed
      if (inputs.isSingleConnector) {
        failureRate = failureRate / 2;
      }   if (onCalculate) {
        onCalculate(failureRate);
      }

      setResult({
        value: failureRate.toFixed(6),
        parameters: {
          λb: inputs.connectorType.rate.toFixed(6),
          πT: tempFactor.toFixed(2),
          πK: matingFactorsGeneral.toFixed(1),
          πQ: qualityFactorGeneral.toFixed(1),
          πE: environmentFactorGeneral.toFixed(1),
          operatingTemp: operatingTemp.toFixed(1),
          tempRise: calculateTempRiseGeneral().toFixed(1)
        }
      });
      setError(null);
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
      <h2 className="text-center">Connector </h2>
      <Row>
        <Col md={6}>
          {/* Component Type Selection */}
          <div className="form-group" >
            <label>
              Part Type:</label>
            <Select
              styles={customStyles}
              name="type"
              placeholder="Select"
              value={currentComponent.type ?
                { value: currentComponent.type, label: currentComponent?.type } : null}
              onChange={(selectedOption) => {
                setCurrentComponent({ ...currentComponent, type: selectedOption.value });
              }}
              options={[
                { value: "Connectors General", label: "Connectors General" },
                { value: "Connectors Socket", label: "Connectors Socket" },
              ]}
            />
          </div>
        </Col>
        {currentComponent?.type === "Connectors Socket" && (
          <>
            <Col md={6}>
              <div className="form-group">
                <label>Active Pins Factor (π<sub>p</sub>):</label>
                <input
                  type="text"
                  className="form-group"
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
                  readOnly
                  value={calculateActivePinsFactorSocket(inputData.activePins).toFixed(4)}
                />
              </div>
            </Col>
          </>
        )}


        {currentComponent?.type === "Connectors General" && (
          <>
            <Col md={6}>
              {/* Connector Type Selection */}
              <div className="form-group">
                <label>Connector Type (λ<sub>b</sub>):</label>
                <Select
                  styles={customStyles}
                  options={baseRatesGeneral.map(item => ({
                    value: item,
                    label: `${item.type} (λb = ${item.rate})`
                  }))}
                  value={{
                    value: inputs.connectorType,
                    label: `${inputs.connectorType.type} (λb = ${inputs.connectorType.rate})`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    connectorType: selectedOption.value,
                    isHighPowerRF: false // Reset high power flag when changing type
                  }))}
                />
              </div>
            </Col>
          </>
        )}
      </Row>
      {currentComponent?.type === "Connectors General" && (
        <>
          <Row className="mb-3">
            <Col md={4}>
              {/* Ambient Temperature */}
              <div className="form-group">
                <label>Ambient Temperature (°C):</label>
                <input
                  type="number"
                  className="form-group"
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
                  value={inputs.ambientTemp}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    ambientTemp: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Contact Gauge */}
              <div className="form-group">
                <label>Contact Gauge:</label>
                <Select
                  styles={customStyles}
                  options={[
                    { value: 30, label: '30 Gauge' },
                    { value: 22, label: '22 Gauge' },
                    { value: 20, label: '20 Gauge' },
                    { value: 16, label: '16 Gauge' },
                    { value: 12, label: '12 Gauge' }
                  ]}
                  value={{
                    value: inputs.contactGauge,
                    label: `${inputs.contactGauge} Gauge`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    contactGauge: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Current per Contact */}
              <div className="form-group">
                <label>Current per Contact (A):</label>
                <input
                  type="number"
                  className="form-group"
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
                  min="1"
                  max="40"
                  step="0.1"
                  value={inputs.currentPerContact}
                  onChange={(e) => setInputs(prev => ({
                    ...prev,
                    currentPerContact: parseFloat(e.target.value) || 0
                  }))}
                  disabled={inputs.connectorType.type === 'RF Coaxial'}
                />
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              {/* Mating/Unmating Cycles */}
              <div className="form-group">
                <label>Mating/Unmating Cycles (per 1000 hours):</label>
                <Select
                  styles={customStyles}
                  options={matingFactorsGeneral.map(item => ({
                    value: item,
                    label: `${item.cycles} (πK = ${item.factor})`
                  }))}
                  value={{
                    value: inputs.matingCycles,
                    label: `${inputs.matingCycles.cycles} (πK = ${inputs.matingCycles.factor})`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    matingCycles: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Quality */}
              <div className="form-group">
                <label>Quality (π<sub>Q</sub>):</label>
                <Select
                  styles={customStyles}
                  options={qualityFactorsGeneral.map(item => ({
                    value: item,
                    label: `${item.quality} (πQ = ${item.factor})`
                  }))}
                  value={{
                    value: inputs.quality,
                    label: `${inputs.quality.quality} (πQ = ${inputs.quality.factor})`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    quality: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Environment Factor */}
              <div className="form-group">
                <label>Environment (π<sub>E</sub>):</label>
                <Select
                  styles={customStyles}
                  options={environmentFactorsGeneral.map(item => ({
                    value: item,
                    label: `${item.label} (πE = ${item.factor})`
                  }))}
                  value={{
                    value: inputs.environment,
                    label: `${inputs.environment.label} (πE = ${inputs.environment.factor})`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    environment: selectedOption.value
                  }))}
                />
              </div>
            </Col>
         
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <div className="form-group">
                <label>Temperature Rise (ΔT °C):</label>
                <input
                  type="text"
                  className="form-group"
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
                  value={calculateTempRiseGeneral().toFixed(1)}
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="form-group">
                <label>Operating Temperature (°C):</label>
                <input
                  type="text"
                  className="form-group"
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
                  value={calculateOperatingTempGeneral().toFixed(1)}
                />
              </div>
            </Col>
            <Col md={4}>
            <div className="form-group">
                <label>Temperature Factor (π<sub>T</sub>):</label>
                <Select
                  className="form-group"
                  value={{
                    value: temperatureFactorsGeneral.find(item =>
                      item.temp === Math.floor(inputs.ambientTemp + calculateTempRiseGeneral())
                    )?.temp || 20,
                    label: `${temperatureFactorsGeneral.find(item =>
                      item.temp === Math.floor(inputs.ambientTemp + calculateTempRiseGeneral())
                    )?.temp || 20}°C (πT=${temperatureFactorsGeneral.find(item =>
                      item.temp === Math.floor(inputs.ambientTemp + calculateTempRiseGeneral())
                    )?.factor || 0})`
                  }}
                  onChange={(selectedOption) => {
                    const selectedTemp = selectedOption.value;
                    setInputs(prev => ({
                      ...prev,
                      ambientTemp: selectedTemp - calculateTempRiseGeneral()
                    }));
                  }}
                  options={temperatureFactorsGeneral.map(item => ({
                    value: item.temp,
                    label: `${item.temp}°C (πT=${item.factor})`
                  }))}
                />


           </div>
            </Col>
            <Col md={4}>
              {/* Options */}
              <div className="form-group">
                <label>Options:</label>
                <div>
                  <Form.Check
                    type="checkbox"
                    label="Single Connector (divide λp by 2)"
                    checked={inputs.isSingleConnector}
                    onChange={(e) => setInputs(prev => ({
                      ...prev,
                      isSingleConnector: e.target.checked
                    }))}
                  />
                  {inputs.connectorType.type === 'RF Coaxial' && (
                    <Form.Check
                      type="checkbox"
                      label="High Power RF (ΔT = 50°C)"
                      checked={inputs.isHighPowerRF}
                      onChange={(e) => setInputs(prev => ({
                        ...prev,
                        isHighPowerRF: e.target.checked
                      }))}
                    />
                  )}
                </div>
              </div>
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
            <Button
              variant="primary"
              onClick={calculateGeneralFailureRate}
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
          <br />

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
                              title: <span>π<sub>T</sub></span>,
                              field: 'πT',
                              render: rowData => rowData.πT || '-'
                            },
                            {
                              title: <span>π<sub>K</sub></span>,
                              field: 'πK',
                              render: rowData => rowData.πK || '-'
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
                              πT: result.parameters.πT,
                              πK: result.parameters.πK,
                              πQ: result.parameters.πQ,
                              πE: result.parameters.πE,
                              λp: result.value,
                              description: `Operating Temp: ${result.parameters.operatingTemp}°C`
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
                          λ<sub>p</sub> = λ<sub>b</sub> × π<sub>T</sub> × π<sub>K</sub> × π<sub>Q</sub> × π<sub>E</sub>
                        </Typography>
                        <Typography variant="body1" paragraph>Where:</Typography>
                        <ul>
                          <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                          <li>λ<sub>b</sub> = Base failure rate (from connector type)</li>
                          <li>π<sub>T</sub> = Temperature factor</li>
                          <li>π<sub>K</sub> = Mating/Unmating factor</li>
                          <li>π<sub>Q</sub> = Quality factor</li>
                          <li>π<sub>E</sub> = Environment factor</li>
                        </ul>
                        <Typography variant="body1" paragraph>
                          Calculation Steps:
                        </Typography>
                        <ul>
                          <li>Operating Temperature = Ambient {inputs.ambientTemp}°C + Rise {result.parameters.tempRise}°C = {result.parameters.operatingTemp}°C</li>
                          <li>λ<sub>b</sub> = {result.parameters.λb} (for {inputs.connectorType.type} connector)</li>
                          <li>π<sub>T</sub> = {result.parameters.πT} (for {result.parameters.operatingTemp}°C)</li>
                          <li>π<sub>K</sub> = {result.parameters.πK} (for {inputs.matingCycles.cycles} cycles)</li>
                          <li>π<sub>Q</sub> = {result.parameters.πQ} (for {inputs.quality.quality} quality)</li>
                          <li>π<sub>E</sub> = {result.parameters.πE} (for {inputs.environment.label} environment)</li>
                          <li>λ<sub>p</sub> = {result.parameters.λb} × {result.parameters.πT} × {result.parameters.πK} × {result.parameters.πQ} × {result.parameters.πE} = {result.value}</li>
                          {inputs.isSingleConnector && (
                            <li>Adjusted for single connector: {result.value} / 2 = {(result.value / 2).toFixed(6)}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          )}</>
      )}

      {currentComponent?.type === "Connectors Socket" && (
        <>
          <Row className="mb-3">
            <Col md={6}>
              {/* Component Type Selection */}
              <div className="form-group">
                <label>Component Type (λ<sub>b</sub>):</label>
                <Select
                  styles={customStyles}
                  options={baseRatesSocket.map(item => ({
                    value: item,
                    label: `${item.type} (λb = ${item.rate})`
                  }))}
                  value={{
                    value: inputData.componentType,
                    label: `${inputData.componentType.type} (λb = ${inputData.componentType.rate})`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    componentType: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={6}>
              {/* Environment Factor */}
              <div className="form-group">
                <label>Environment (π<sub>E</sub>):</label>
                <Select
                  styles={customStyles}
                  options={environmentFactorsSocket.map(item => ({
                    value: item,
                    label: `${item.label} (πE = ${item.factor})`
                  }))}
                  value={{
                    value: inputData.environment,
                    label: `${inputData.environment.label} (πE = ${inputData.environment.factor})`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    environment: selectedOption.value
                  }))}
                />
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              {/* Quality Factor */}
              <div className="form-group">
                <label>Quality (π<sub>Q</sub>):</label>
                <Select
                  styles={customStyles}
                  options={qualityFactorsSocket.map(item => ({
                    value: item,
                    label: `${item.quality} (πq = ${item.factor})`
                  }))}
                  value={{
                    value: inputData.quality,
                    label: `${inputData.quality.quality} (πq = ${inputData.quality.factor})`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    quality: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={6}>
              {/* Number of Active Pins */}
              <div className="form-group">
                <label>Number of Active Pins (π<sub>P</sub>):</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="180"
                  value={inputData.activePins}
                  onChange={(e) => setInputData(prev => ({
                    ...prev,
                    activePins: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
            </Col>
          </Row>
          <div className='Button'>
            {result && (
              <Link
                component="button"
                onClick={() => setShowCalculations(!showCalculations)}
                className="ms-auto mt-2"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
              </Link>
            )}
            <Button
              variant="primary"
              onClick={calculateSocketFailureRate}
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
          <br />

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
                              title: <span>π<sub>P</sub></span>,
                              field: 'πp',
                              render: rowData => rowData.πp || '-'
                            },
                            {
                              title: <span>π<sub>Q</sub></span>,
                              field: 'πq',
                              render: rowData => rowData.πq || '-'
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
                              πp: result.parameters.πp,
                              πq: result.parameters.πq,
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
                          λ<sub>p</sub> = λ<sub>b</sub> × π<sub>P</sub> × π<sub>Q</sub> × π<sub>E</sub>
                        </Typography>
                        <Typography variant="body1" paragraph>Where:</Typography>
                        <ul>
                          <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                          <li>λ<sub>b</sub> = Base failure rate (from component type)</li>
                          <li>π<sub>P</sub> = Active pins factor</li>
                          <li>π<sub>Q</sub> = Quality factor</li>
                          <li>π<sub>E</sub> = Environment factor</li>
                        </ul>
                        <Typography variant="body1" paragraph>
                          Calculation Steps:
                        </Typography>
                        <ul>
                          <li>λ<sub>b</sub> = {result.parameters.λb} (for {inputData.componentType.type} component)</li>
                          <li>π<sub>P</sub> = exp(({inputs.activePins}-1)/10)^0.39 = {result.parameters.πp}</li>
                          <li>π<sub>Q</sub> = {result.parameters.πq} (for {inputData.quality.quality} quality)</li>
                          <li>π<sub>E</sub> = {result.parameters.πE} (for {inputData.environment.label} environment)</li>
                          <li>λ<sub>p</sub> = {result.parameters.λb} × {result.parameters.πp} × {result.parameters.πq} × {result.parameters.πE} = {result.value}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </>
      )}

    </>

  );
};

export default Connectors;