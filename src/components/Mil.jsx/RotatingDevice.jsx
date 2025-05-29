import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MaterialTable from 'material-table';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { CalculatorIcon } from '@heroicons/react/24/outline';

const RotatingDevice = ({ onCalculate }) => {
  // Device types
  const deviceTypes = [
    { value: 'motor', label: 'Motor' },
    { value: 'synchro_resolver', label: 'Synchro/Resolver' },
    { value: 'time_meter', label: 'Elapsed Time Meter' }
  ];

  // Motor types
  const motorTypes = [
    { type: 'electrical', label: 'Electrical (General)', A: 1.9, B: 1.1 },
    { type: 'sensor', label: 'Sensor', A: 0.48, B: 0.29 },
    { type: 'servo', label: 'Servo', A: 2.4, B: 1.7 },
    { type: 'stepper', label: 'Stepper', A: 11, B: 5.4 }
  ];

  // Bearing and winding characteristic life data
  const bearingWindingLife = [
    { temp: 0, αB: 3600, αW: 6.4e+06 },
    { temp: 10, αB: 13000, αW: 3.2e+06 },
    { temp: 20, αB: 39000, αW: 1.6e+06 },
    { temp: 30, αB: 78000, αW: 8.9e+05 },
    { temp: 40, αB: 80000, αW: 5.0e+05 },
    { temp: 50, αB: 55000, αW: 2.9e+05 },
    { temp: 60, αB: 35000, αW: 1.8e+05 },
    { temp: 70, αB: 22000, αW: 1.1e+05 },
    { temp: 80, αB: 14000, αW: 7.0e+04 },
    { temp: 90, αB: 9100, αW: 4.6e+04 },
    { temp: 100, αB: 6100, αW: 3.1e+04 },
    { temp: 110, αB: 4200, αW: 2.1e+04 },
    { temp: 120, αB: 2900, αW: 1.5e+04 },
    { temp: 130, αB: 2100, αW: 1.0e+04 },
    { temp: 140, αB: 1500, αW: 7.5e+03 },
  ];

  // Lambda values based on LC/α ratio
  const lambdaValues = [
    { range: [0, 0.1], value: 0.13 },
    { range: [0.11, 0.2], value: 0.15 },
    { range: [0.21, 0.3], value: 0.23 },
    { range: [0.31, 0.4], value: 0.31 },
    { range: [0.41, 0.5], value: 0.41 },
    { range: [0.51, 0.6], value: 0.51 },
    { range: [0.61, 0.7], value: 0.61 },
    { range: [0.71, 0.8], value: 0.68 },
    { range: [0.81, 0.9], value: 0.76 },
    { range: [1.0, Infinity], value: 1.0 }
  ];

  // Synchro/Resolver base failure rates
  const synchroBaseRates = [
    { temp: 30, λb: 0.0083 },
    { temp: 35, λb: 0.0088 },
    { temp: 40, λb: 0.0095 },
    { temp: 45, λb: 0.010 },
    { temp: 50, λb: 0.011 },
    { temp: 55, λb: 0.013 },
    { temp: 60, λb: 0.014 },
    { temp: 65, λb: 0.016 },
    { temp: 70, λb: 0.019 },
    { temp: 75, λb: 0.022 },
    { temp: 80, λb: 0.027 },
    { temp: 85, λb: 0.032 },
    { temp: 90, λb: 0.041 },
    { temp: 95, λb: 0.052 },
    { temp: 100, λb: 0.069 },
    { temp: 105, λb: 0.094 },
    { temp: 110, λb: 0.13 },
    { temp: 115, λb: 0.19 },
    { temp: 120, λb: 0.29 },
    { temp: 125, λb: 0.45 },
    { temp: 130, λb: 0.74 },
    { temp: 135, λb: 1.3 }
  ];

  // Size factors for synchros/resolvers
  const sizeFactors = [
    { type: 'synchro', size: '8 or smaller', factor: 2 },
    { type: 'synchro', size: '10-16', factor: 1.5 },
    { type: 'synchro', size: '18 or larger', factor: 1 },
    { type: 'resolver', size: '8 or smaller', factor: 3 },
    { type: 'resolver', size: '10-16', factor: 2.25 },
    { type: 'resolver', size: '18 or larger', factor: 1.5 }
  ];

  // Brush count factors
  const brushFactors = [
    { brushes: '≤ 2', factor: 1.4 },
    { brushes: '3', factor: 2.5 },
    { brushes: '4', factor: 3.2 }
  ];

  // Environment factors
  const environmentFactors = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 2.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 12 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 7.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 18 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 4.0 },
    { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 6.0 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 16 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 25 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 26 },
    { env: 'SF', label: 'Space, Flight', factor: 0.50 },
    { env: 'MF', label: 'Missile, Flight', factor: 14 },
    { env: 'ML', label: 'Missile, Launch', factor: 38 },
    { env: 'CL', label: 'Cannon, Launch', factor: 680 }
  ];

  const elapsedEnvironmentFactors = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 2.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 12 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 7.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 18 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 5.0 },
    { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 8.0 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 16 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 25 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 26 },
    { env: 'SF', label: 'Space, Flight', factor: 0.50 },
    { env: 'MF', label: 'Missile, Flight', factor: 14 },
    { env: 'ML', label: 'Missile, Launch', factor: 38 },
    { env: 'CL', label: 'Cannon, Launch', factor: 'N/A' }
  ];

  // Elapsed time meter types
  const timeMeterTypes = [
    { type: 'ac', label: 'A.C.', λb: 20 },
    { type: 'inverter', label: 'Inverter Driven', λb: 30 },
    { type: 'dc', label: 'Commutator D.C.', λb: 80 }
  ];

  // Temperature stress factors
  const tempStressFactors = [
    { ratio: '0 to 0.5', factor: 0.5 },
    { ratio: '0.6', factor: 0.6 },
    { ratio: '0.8', factor: 0.8 },
    { ratio: '1.0', factor: 1.0 }
  ];

  // State
  const [currentComponent, setCurrentComponent] = useState({
    type: "motor",
    components: [],
    environment: " ",
    circuitType: "",
    yearsInProduction: " ",
    quality: "",
    ratioBInput: "",
    ratioWInput: "",
    designLife: "87600",
    ambientTemp: "",
    isCycledTemp: false,
    tempCycles: "",
    frameTemp: "",
    useAmbientAsFrameTemp: true,
    selectedSynchroType: ' ',
    selectedSize: '8 or smaller',
    selectedBrushCount: '',
    selectedTimeMeter: " ",
    operatingTempRatio: " ",
    selectedElapsedEnvironment: " "
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);

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

  // Calculate component sum
  const calculateComponentSum = (components) => {
    return components.reduce((sum, component) => {
      return sum + (component.quantity * component.failureRate);
    }, 0);
  };

  // Calculate weighted characteristic life for cycled temperatures
  const calculateWeightedLife = (cycles, isBearing) => {
    const key = isBearing ? 'αB' : 'αW';
    let totalHours = 0;
    let weightedSum = 0;

    cycles.forEach(cycle => {
      const life = getBearingWindingLife(cycle.temp);
      totalHours += cycle.hours;
      weightedSum += cycle.hours / life[key];
    });

    return totalHours / weightedSum;
  };

  // Get bearing and winding life for a given temperature
  const getBearingWindingLife = (temp) => {
    const exactMatch = bearingWindingLife.find(item => item.temp === temp);
    if (exactMatch) return exactMatch;

    // Find closest temperatures
    const sorted = [...bearingWindingLife].sort((a, b) => Math.abs(a.temp - temp) - Math.abs(b.temp - temp));
    return sorted[0];
  };

  // Get lambda value based on LC/α ratio
  const getLambdaValue = (ratio) => {
    for (const item of lambdaValues) {
      if (ratio >= item.range[0] && ratio <= item.range[1]) {
        return item.value;
      }
    }
    return 1.0;
  };
  const calculateMotorFailureRate = () => {
    const calculateAlphaB = (TA) => {
      const tempK = TA + 273; // Convert °C to Kelvin
      const term1 = 10 ** (2.534 - (2357 / tempK));
      const term2 = 1 / 10 ** (20 - (4500 / tempK) + 300);
      return Math.pow(term1 + term2, -1); // [αB] = years
    };
    const calculateAlphaW = (TA) => {
      const tempK = TA + 273; // Convert °C to Kelvin
      return 10 ** (2357 / tempK - 1.83); // [αW] = years
    };
    let αB, αW;


    if (currentComponent.isCycledTemp) {
      // Existing temperature cycling logic
      αB = calculateWeightedLife(currentComponent.tempCycles, true);
      αW = calculateWeightedLife(currentComponent.tempCycles, false);
    } else {
      // New formula-based calculation
      const TA = currentComponent.ambientTemp; // Ambient temp in °C
      αB = calculateAlphaB(TA);
      αW = calculateAlphaW(TA);
    }

    const ratioB = currentComponent.ratioBInput !== '' ? parseFloat(currentComponent.ratioBInput) : currentComponent.designLife / αB;
    const ratioW = currentComponent.ratioWInput !== '' ? parseFloat(currentComponent.ratioWInput) : currentComponent.designLife / αW;

    const λ1 = getLambdaValue(ratioB);
    const λ2 = getLambdaValue(ratioW);

    const selectedMotor = motorTypes.find(m => m.type === currentComponent.motorType) || motorTypes[0];
    const A = selectedMotor.A;
    const B = selectedMotor.B;

    const λp = ((λ1 / (A * αB)) + (λ2 / (B * αW))) * 1e6;

    if (onCalculate) {
      onCalculate(λp);
      // Pass the calculated failure rate
    }
    return {
      αB,
      αW,
      ratioB,
      ratioW,
      λ1,
      λ2,
      A,
      B,
      λp,
      ratioBManuallySet: currentComponent.ratioBInput !== '',
      ratioWManuallySet: currentComponent.ratioWInput !== ''
    };
  };



  // Calculate synchro/resolver failure rate
const calculateSynchroFailureRate = () => {
  const errors = {};
  
  // Validate frame temperature
  if (currentComponent.useAmbientAsFrameTemp) {
    if (!currentComponent.ambientTemp || isNaN(currentComponent.ambientTemp)) 
      errors.ambientTemp = "Please enter a valid ambient temperature";
    
  } else {
    if (!currentComponent.frameTemp || isNaN(currentComponent.frameTemp)) {
      errors.frameTemp = "Please enter a valid frame temperature";
    } else if (currentComponent.frameTemp < 30 || currentComponent.frameTemp > 135) 
      errors.frameTemp = "Frame temperature must be between 30°C and 135°C";
    
  }

  // Validate synchro type
  if (!currentComponent.selectedSynchroType) 
    errors.synchroType = "Please select a device type";
  

  // Validate size
  if (!currentComponent.selectedSize) 
    errors.size = "Please select a size";
  

  // Validate brush count
  if (!currentComponent.selectedBrushCount) 
    errors.brushCount = "Please select brush count";
  

  // Validate environment
  if (!currentComponent.environment?.factor) 
    errors.environment = "Please select an environment";
  

  // If any errors, throw them
  if (Object.keys(errors).length > 0) 
    throw new Error(JSON.stringify(errors));
  

  // Calculate frame temperature
  const frameTemp = currentComponent.useAmbientAsFrameTemp
    ? 40 + currentComponent.ambientTemp
    : currentComponent.frameTemp;

  // Calculate base failure rate
  const Tf = Math.exp((frameTemp + 273) / 334);
  const λb = 0.00535 * Math.pow(Tf, 8.5);

  // Get factors
  const sizeFactor = sizeFactors.find(
    item => item.type === currentComponent.selectedSynchroType &&
            item.size === currentComponent.selectedSize
  )?.factor || 1;

  const brushFactor = brushFactors.find(
    item => item.brushes === currentComponent.selectedBrushCount
  )?.factor || 1;

  const envFactor = currentComponent.environment.factor;

  // Calculate final failure rate
  const λp = λb * sizeFactor * brushFactor * envFactor;

  return {
    frameTemp,
    λb,
    sizeFactor,
    brushFactor,
    envFactor,
    λp
  };
};

  // Calculate elapsed time meter failure rate
  const calculateTimeMeterFailureRate = () => {
    const λb = currentComponent.selectedTimeMeter.λb;
    const πT = tempStressFactors.find(
      item => item.ratio.includes(currentComponent.operatingTempRatio.toString()) ||
        (currentComponent.operatingTempRatio >= 0 && currentComponent.operatingTempRatio <= 0.5 && item.ratio === '0 to 0.5')
    )?.factor || "-";

    const πE = currentComponent.selectedElapsedEnvironment.factor;

    const λp = λb * πT * πE;
    console.log("λp",λp)
    if (onCalculate) {
      onCalculate(λp);
      // Pass the calculated failure rate
    }
    return {
      λb,
      πT,
      πE,
      λp
    };
  };

  // Handle form submission
  const handleCalculate = (e) => {
    e.preventDefault();
    setShowCalculations(true);

    try {
      let result;

      if (currentComponent.type === 'motor') {
        result = calculateMotorFailureRate();
      } else if (currentComponent.type === 'synchro_resolver') {
        result = calculateSynchroFailureRate();
      } else if (currentComponent.type === 'time_meter') {
        result = calculateTimeMeterFailureRate();
      }

      setResult(result);
      setError(null);
      if (onCalculate && result?.λp) {
        onCalculate(result.λp); // Pass the calculated failure rate
      }

    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  // Add a new temperature cycle
  const addTempCycle = () => {
    setCurrentComponent(prev => ({
      ...prev,
      tempCycles: [...prev.tempCycles, { temp: 30, hours: 0 }]
    }));
  };

  // Remove a temperature cycle
  const removeTempCycle = (index) => {
    const newCycles = [...currentComponent.tempCycles];
    newCycles.splice(index, 1);
    setCurrentComponent(prev => ({
      ...prev,
      tempCycles: newCycles
    }));
  };

  // Update a temperature cycle
  const updateTempCycle = (index, field, value) => {
    const newCycles = [...currentComponent.tempCycles];
    newCycles[index][field] = parseFloat(value) || 0;
    setCurrentComponent(prev => ({
      ...prev,
      tempCycles: newCycles
    }));
  };

  return (
    <>
      <h2 className="text-center mb-4">Rotating Device </h2>
      <Row>
        <Col md={4}>
          <div className="form-group">
            <label>Part Type:</label>
            <Select
              styles={customStyles}
              value={deviceTypes.find(d => d.value === currentComponent.type)}
              onChange={(selectedOption) => setCurrentComponent(prev => ({
                ...prev,
                type: selectedOption.value
              }))}
              options={deviceTypes}
            />
          </div>
        </Col>

        {/* Motor-specific inputs */}
        {currentComponent.type === 'motor' && (
          <>

            <Col md={4}>
              <div className="form-group">
                <label>Motor Type:</label>
                <Select
                  styles={customStyles}
                  value={motorTypes.find(m => m.type === currentComponent.motorType) || motorTypes[0]}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    motorType: selectedOption.type
                  }))}
                  options={motorTypes}
                  getOptionLabel={option => option.label}
                  getOptionValue={option => option.type}
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Ambient Temperature (°C):</label>
                <input
                  type="number"
                  className="form-control"
                  value={currentComponent.ambientTemp}
                  onChange={(e) => setCurrentComponent(prev => ({
                    ...prev,
                    ambientTemp: parseFloat(e.target.value)
                  }))}
                  min="30"
                  max="135"
                  step="1"
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Design Life (hours):</label>
                <input
                  type="number"
                  className="form-control"
                  value={currentComponent.designLife}
                  onChange={(e) => setCurrentComponent(prev => ({
                    ...prev,
                    designLife: parseFloat(e.target.value)
                  }))}
                  min="1"
                  step="1"
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>LC/α<sub>B</sub> Ratio ( λ<sub>1</sub>):</label>
                <Select
                  styles={customStyles}
                  value={{
                    value: currentComponent.ratioBInput,
                    label: currentComponent.ratioBInput ?
                      `${currentComponent.ratioBInput} (λ₁ = ${getLambdaValue(parseFloat(currentComponent.ratioBInput))})` :
                      "Auto-calculate from design life"
                  }}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    ratioBInput: selectedOption.value
                  }))}
                  options={[
                    { value: "", label: "Auto-calculate from design life" },
                    { value: "0-0.10", label: "0-0.10 (λ₁ = 0.13)" },
                    { value: "0.11-0.20", label: "0.11-0.20 (λ₁ = 0.15)" },
                    { value: "0.21-0.30", label: "0.21-0.30 (λ₁ = 0.23)" },
                    { value: "0.31-0.40", label: "0.31-0.40 (λ₁ = 0.31)" },
                    { value: "0.41-0.50", label: "0.41-0.50 (λ₁ = 0.41)" },
                    { value: "0.51-0.60", label: "0.51-0.60 (λ₁ = 0.51)" },
                    { value: "0.61-0.70", label: "0.61-0.70 (λ₁ = 0.61)" },
                    { value: "0.71-0.80", label: "0.71-0.80 (λ₁ = 0.68)" },
                    { value: "0.81-0.90", label: "0.81-0.90 (λ₁ = 0.76)" },
                    { value: "1.0+", label: "1.0+ (λ₁ = 1.0)" }
                  ]}
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>LC/α<sub>W</sub> Ratio ( λ<sub>2</sub>):</label>
                <Select
                  styles={customStyles}
                  value={{
                    value: currentComponent.ratioWInput,
                    label: currentComponent.ratioWInput ?
                      `${currentComponent.ratioWInput} (λ₂ = ${getLambdaValue(parseFloat(currentComponent.ratioWInput))})` :
                      "Auto-calculate from design life"
                  }}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    ratioWInput: selectedOption.value
                  }))}
                  options={[
                    { value: "", label: "Auto-calculate from design life" },
                    { value: "0-0.10", label: "0-0.10 (λ₂ = 0.13)" },
                    { value: "0.11-0.20", label: "0.11-0.20 (λ₂ = 0.15)" },
                    { value: "0.21-0.30", label: "0.21-0.30 (λ₂ = 0.23)" },
                    { value: "0.31-0.40", label: "0.31-0.40 (λ₂ = 0.31)" },
                    { value: "0.41-0.50", label: "0.41-0.50 (λ₂ = 0.41)" },
                    { value: "0.51-0.60", label: "0.51-0.60 (λ₂ = 0.51)" },
                    { value: "0.61-0.70", label: "0.61-0.70 (λ₂ = 0.61)" },
                    { value: "0.71-0.80", label: "0.71-0.80 (λ₂ = 0.68)" },
                    { value: "0.81-0.90", label: "0.81-0.90 (λ₂ = 0.76)" },
                    { value: "1.0+", label: "1.0+ (λ₂ = 1.0)" }
                  ]}
                />
              </div>
            </Col>

            <Col md={12}>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isCycledTemp"
                  checked={currentComponent.isCycledTemp}
                  onChange={(e) => setCurrentComponent(prev => ({
                    ...prev,
                    isCycledTemp: e.target.checked
                  }))}
                />
                <label htmlFor="isCycledTemp">
                  Use Temperature Cycling
                </label>
              </div>
            </Col>

            {currentComponent.isCycledTemp && (
              <Col md={12}>
                <div className="form-group">
                  <label>Temperature Cycles:</label>
                  {currentComponent.tempCycles.map((cycle, index) => (
                    <div key={index} className="d-flex mb-2">
                      <input
                        type="number"
                        className="form-control me-2"
                        placeholder="Temperature (°C)"
                        value={cycle.temp}
                        onChange={(e) => updateTempCycle(index, 'temp', e.target.value)}
                        min="-40"
                        max="150"
                        step="1"
                      />
                      <input
                        type="number"
                        className="form-control me-2"
                        placeholder="Hours"
                        value={cycle.hours}
                        onChange={(e) => updateTempCycle(index, 'hours', e.target.value)}
                        min="0"
                        step="1"
                      />

                  <Button
                        variant="danger"
                        onClick={() => removeTempCycle(index)}
                        disabled={currentComponent.tempCycles.length <= 1}
                      >
                        Remove
                      </Button>  
                    </div>
                  ))}
                  <Link variant="secondary" onClick={addTempCycle}>
                    Add Temperature Cycle
                  </Link>
                </div>
              </Col>
            )}
          </>
        )}

        {/* Synchro/Resolver-specific inputs */}
        {currentComponent.type === 'synchro_resolver' && (
          <>
            <Col md={4}>
              <div className="form-group">
                <label>Environment (π<sub>E</sub>):</label>
                <Select
                  styles={customStyles}
                  value={currentComponent.environment}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    environment: selectedOption
                  }))}
                  options={environmentFactors}
                  getOptionLabel={option => `${option.label} (πE = ${option.factor})`}
                  getOptionValue={option => option.env}
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="form-group">
                <label>Device Type (π<sub>S</sub>):</label>
                <Select
                  styles={customStyles}
                  value={{
                    value: currentComponent.selectedSynchroType,
                    label: currentComponent.selectedSynchroType === 'synchro' ? 'Synchro' : 'Resolver'
                  }}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    selectedSynchroType: selectedOption.value
                  }))}
                  options={[
                    { value: 'synchro', label: 'Synchro' },
                    { value: 'resolver', label: 'Resolver' }
                  ]}
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Size for (π<sub>S</sub>):</label>
                <Select
                  styles={customStyles}
                  value={{
                    value: currentComponent.selectedSize,
                    label: currentComponent.selectedSize
                  }}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    selectedSize: selectedOption.value
                  }))}
                  options={[
                    { value: '8 or smaller', label: '8 or smaller' },
                    { value: '10-16', label: '10-16' },
                    { value: '18 or larger', label: '18 or larger' }
                  ]}
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Number of Brushes (π<sub>N</sub>):</label>
                <Select
                  styles={customStyles}
                  value={{
                    value: currentComponent.selectedBrushCount,
                    label: currentComponent.selectedBrushCount
                  }}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    selectedBrushCount: selectedOption.value
                  }))}
                  options={brushFactors.map(brush => ({
                    value: brush.brushes,
                    label: `${brush.brushes} (Factor = ${brush.factor})`
                  }))}
                />
              </div>
            </Col>
         <Col md={4}>
                <div className="form-group">
                  <label>Frame Temperature (°C):</label>
                  <input
                    type="number"
                    name="type"
                    className="form-control"
                    value={currentComponent.frameTemp}
                    onChange={(e) => setCurrentComponent(prev => ({
                      ...prev,
                      frameTemp: parseFloat(e.target.value)
                    }))}
                    min="30"
                    max="135"
                    step="1"
                  />
                </div>
              </Col>
          

            <Col md={4}>
              <div className="form-check">
                <input
                  name="type"
                  type="checkbox"
                  className="form-check-input"
                  id="useAmbientAsFrameTemp"
                  checked={currentComponent.useAmbientAsFrameTemp}
                  onChange={(e) => setCurrentComponent(prev => ({
                    ...prev,
                    useAmbientAsFrameTemp: e.target.checked
                  }))}
                />
                <label className="form-check-label me-2" htmlFor="useAmbientAsFrameTemp">
                  If Ambient temperature is unknown
                </label>
              </div>
            </Col>

            {currentComponent.useAmbientAsFrameTemp && (
            <Col md={4}>
              <div className="form-group">
                <label>Ambient Temperature (°C) for (λ<sub>b</sub>):</label>
                <input
                  type="number"
                  className="form-control"
                  value={currentComponent.ambientTemp}
                  onChange={(e) => setCurrentComponent(prev => ({
                    ...prev,
                    ambientTemp: parseFloat(e.target.value)
                  }))}
                  min="-40"
                  max="150"
                  step="1"
                />
              </div>
            </Col>
            )}
          </>
        )}

        {/* Time Meter-specific inputs */}
        {currentComponent.type === 'time_meter' && (
          <>

            <Col md={4}>
              <div className="form-group">
                <label>Meter Type:</label>
                <Select
                  styles={customStyles}
                  value={currentComponent.selectedTimeMeter}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    selectedTimeMeter: selectedOption
                  }))}
                  options={timeMeterTypes}
                  getOptionLabel={option => `${option.label} (λb = ${option.λb})`}
                  getOptionValue={option => option.type}
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Environment (π<sub>E</sub>):</label>
                <Select
                  styles={customStyles}
                  value={currentComponent.selectedElapsedEnvironment}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    selectedElapsedEnvironment: selectedOption
                  }))}
                  options={elapsedEnvironmentFactors}
                  getOptionLabel={option => `${option.label} (πE = ${option.factor})`}
                  getOptionValue={option => option.env}
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Operating Temp/Rated Temp Ratio:</label>
                <Select
                  styles={customStyles}
                  value={{
                    value: currentComponent.operatingTempRatio,
                    label: currentComponent.operatingTempRatio === 0.5 ? '0 to 0.5' :
                      currentComponent.operatingTempRatio.toString()
                  }}
                  onChange={(selectedOption) => setCurrentComponent(prev => ({
                    ...prev,
                    operatingTempRatio: parseFloat(selectedOption.value)
                  }))}
                  options={[
                    { value: 0.5, label: '0 to 0.5' },
                    { value: 0.6, label: '0.6' },
                    { value: 0.8, label: '0.8' },
                    { value: 1.0, label: '1.0' }
                  ]}
                />
              </div>
            </Col>
          </>
        )}
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
              <CalculatorIcon style={{ height: '30px', width: '40px' }} fontSize="large" />
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
          onClick={handleCalculate}
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
            <span className="ms-2">
              {currentComponent.type === 'synchro_resolver' ?
                `${result?.λp?.toFixed(6)} failures/10^6 hours` :
                `${result?.λp?.toFixed(2)} failures/10^6 hours`
              }
            </span>
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
                      columns={getResultColumns(currentComponent.type)}
                      data={[getResultData(currentComponent.type, result)]}

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
                    {currentComponent.type === 'motor' && (
                      <>
                        <Typography variant="body1" paragraph>
                          λ<sub>p</sub> = [λ<sub>1</sub>/(A × α<sub>B</sub>) + λ<sub>2</sub>/(B × α<sub>W</sub>)] × 10<sup>6</sup>
                        </Typography>
                        <Typography variant="body1" paragraph>Where:</Typography>
                        <ul>
                          <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>
                          <li>λ<sub>1</sub> = Bearing stress factor (based on LC/α<sub>B</sub> ratio)</li>
                          <li>λ<sub>2</sub> = Winding stress factor (based on LC/α<sub>W</sub> ratio)</li>
                          <li>A = Motor type factor for bearings</li>
                          <li>B = Motor type factor for windings</li>
                          <li>α<sub>B</sub> = Bearing characteristic life</li>
                          <li>α<sub>W</sub> = Winding characteristic life</li>
                        </ul>
                        <Typography variant="body1" paragraph>
                          Calculation Steps:
                        </Typography>
                        <ul>
                          <li>α<sub>B</sub> = {result?.αB?.toLocaleString()} hours</li>
                          <li>α<sub>W</sub> = {result?.αW?.toExponential(2)} hours</li>
                          <li>LC/α<sub>B</sub> = {result?.ratioB?.toFixed(2)} → λ<sub>1</sub> = {result?.λ1?.toFixed(2)}</li>
                          <li>LC/α<sub>W</sub> = {result?.ratioW?.toFixed(2)} → λ<sub>2</sub> = {result?.λ2?.toFixed(2)}</li>
                          <li>A = {result?.A?.toFixed(2)}, B = {result?.B?.toFixed(2)} (for {motorTypes.find(m => m.type === currentComponent.motorType)?.label || 'selected motor'})</li>
                          <li>λ<sub>p</sub> = [{result?.λ1?.toFixed(2)}/({result?.A?.toFixed(2)} × {result?.αB?.toLocaleString()}) + {result?.λ2?.toFixed(2)}/({result?.B?.toFixed(2)} × {result?.αW?.toExponential(2)})] × 10<sup>6</sup> = {result?.λp?.toFixed(2)}</li>
                        </ul>
                      </>
                    )}
                    {currentComponent.type === 'synchro_resolver' && (
                      <>
                        <Typography variant="body1" paragraph>
                          λ<sub>p</sub> = λ<sub>b</sub> × π<sub>s</sub> × π<sub>N</sub> × π<sub>E</sub>
                        </Typography>
                        <Typography variant="body1" paragraph>Where:</Typography>
                        <ul>
                          <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>
                          <li>λ<sub>b</sub> = Base failure rate at {result?.frameTemp}°C</li>
                          <li>π<sub>s</sub> = Size factor</li>
                          <li>π<sub>N</sub> = Brush count factor</li>
                          <li>π<sub>E</sub> = Environment factor</li>
                        </ul>
                        <Typography variant="body1" paragraph>
                          Calculation Steps:
                        </Typography>
                        <ul>
                          <li>λ<sub>b</sub> = {result?.λb?.toFixed(6)} (at {result?.frameTemp}°C)</li>
                          <li>π<sub>s</sub> = {result?.sizeFactor?.toFixed(2)} (for {currentComponent.selectedSize} {currentComponent.selectedSynchroType})</li>
                          <li>π<sub>N</sub> = {result?.brushFactor?.toFixed(2)} (for {currentComponent.selectedBrushCount} brushes)</li>
                          <li>π<sub>E</sub> = {result?.envFactor?.toFixed(2)} (for {currentComponent.environment.label} environment)</li>
                          <li>λ<sub>p</sub> = {result?.λb?.toFixed(6)} × {result?.sizeFactor?.toFixed(2)} × {result?.brushFactor?.toFixed(2)} × {result.envFactor?.toFixed(2)} = {result?.λp?.toFixed(6)}</li>
                        </ul>
                      </>
                    )}
                    {currentComponent.type === 'time_meter' && (
                      <>
                        <Typography variant="body1" paragraph>
                          λ<sub>p</sub> = λ<sub>b</sub> × π<sub>T</sub> × π<sub>E</sub>
                        </Typography>
                        <Typography variant="body1" paragraph>Where:</Typography>
                        <ul>
                          <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>
                          <li>λ<sub>b</sub> = Base failure rate</li>
                          <li>π<sub>T</sub> = Temperature stress factor</li>
                          <li>π<sub>E</sub> = Environment factor</li>
                        </ul>
                        <Typography variant="body1" paragraph>
                          Calculation Steps:
                        </Typography>
                        <ul>
                          <li>λ<sub>b</sub> = {result?.λb?.toFixed(4)} (for {currentComponent.selectedTimeMeter.label} meter)</li>
                          <li>π<sub>T</sub> = {result?.πT?.toFixed(4)} (for operating temp ratio {currentComponent.operatingTempRatio})</li>
                          <li>π<sub>E</sub> = {result?.πE?.toFixed(4)} (for {currentComponent.selectedElapsedEnvironment.label} environment)</li>
                          <li>λ<sub>p</sub> = {result?.λb?.toFixed(4)} × {result?.πT?.toFixed(4)} × {result?.πE?.toFixed(4)} = {result?.λp?.toFixed(4)}</li>
                        </ul>
                      </>
                    )}
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

// Helper function to get result columns based on device type
const getResultColumns = (deviceType) => {
  switch (deviceType) {
    case 'motor':
      return [
        {
          title: <span>α<sub>B</sub></span>,
          field: 'αB',
          render: rowData => rowData.αB?.toLocaleString() || '-'
        },
        {
          title: <span>α<sub>W</sub></span>,
          field: 'αW',
          render: rowData => rowData.αW?.toExponential(2) || '-'
        },
        {
          title: <span>LC/α<sub>B</sub></span>,
          field: 'ratioB',
          render: rowData => rowData.ratioB?.toFixed(2) || '-'
        },
        {
          title: <span>LC/α<sub>W</sub></span>,
          field: 'ratioW',
          render: rowData => rowData.ratioW?.toFixed(2) || '-'
        },
        {
          title: <span>λ<sub>1</sub></span>,
          field: 'λ1',
          render: rowData => rowData.λ1?.toFixed(2) || '-'
        },
        {
          title: <span>λ<sub>2</sub></span>,
          field: 'λ2',
          render: rowData => rowData.λ2?.toFixed(2) || '-'
        },
        {
          title: "A",
          field: 'A',
          render: rowData => rowData.A?.toFixed(2) || '-'
        },
        {
          title: "B",
          field: 'B',
          render: rowData => rowData.B?.toFixed(2) || '-'
        },
        {
          title: "Failure Rate",
          field: 'λp',
          render: rowData => <strong>{rowData.λp?.toFixed(2) || '-'}</strong>
        }
      ];
    case 'synchro_resolver':
      return [
        {
          title: "Frame Temp (°C)",
          field: 'frameTemp',
          render: rowData => rowData.frameTemp || '-'
        },
        {
          title: <span>λ<sub>b</sub></span>,
          field: 'λb',
          render: rowData => rowData.λb?.toFixed(6) || '-'
        },
        {
          title: <span>π<sub>s</sub></span>,
          field: 'sizeFactor',
          render: rowData => rowData.sizeFactor?.toFixed(2) || '-'
        },
        {
          title: <span>π<sub>N</sub></span>,
          field: 'brushFactor',
          render: rowData => rowData.brushFactor?.toFixed(2) || '-'
        },
        {
          title: <span>π<sub>E</sub></span>,
          field: 'envFactor',
          render: rowData => rowData.envFactor?.toFixed(2) || '-'
        },
        {
          title: "Failure Rate ",
          field: 'λp',
          render: rowData => <strong>{rowData.λp?.toFixed(6) || '-'}</strong>
        }
      ];
    case 'time_meter':
      return [
        {
          title: <span>λ<sub>b</sub></span>,
          field: 'λb',
          render: rowData => rowData.λb?.toFixed(1) || '-'
        },
        {
          title: <span>π<sub>T</sub></span>,
          field: 'πT',
          render: rowData => rowData.πT?.toFixed(1) || '-'
        },
        {
          title: <span>π<sub>E</sub></span>,
          field: 'πE',
          render: rowData => rowData.πE?.toFixed(1) || '-'
        },
        {
          title: "Failure Rate",
          field: 'λp',
          render: rowData => <strong>{rowData.λp?.toFixed(1) || '-'}</strong>
        }
      ];
    default:
      return [];
  }
};

// Helper function to get result data based on device type
const getResultData = (deviceType, result) => {
  switch (deviceType) {
    case 'motor':
      return {
        αB: result?.αB,
        αW: result?.αW,
        ratioB: result?.ratioB,
        ratioW: result?.ratioW,
        λ1: result?.λ1,
        λ2: result?.λ2,
        A: result?.A,
        B: result?.B,
        λp: result?.λp
      };
    case 'synchro_resolver':
      return {
        frameTemp: result?.frameTemp,
        λb: result?.λb,
        sizeFactor: result?.sizeFactor,
        brushFactor: result?.brushFactor,
        envFactor: result?.envFactor,
        λp: result?.λp
      };
    case 'time_meter':
      return {
        λb: result?.λb,
        πT: result?.πT,
        πE: result?.πE,
        λp: result?.λp
      };
    default:
      return {};
  }
};

export default RotatingDevice;