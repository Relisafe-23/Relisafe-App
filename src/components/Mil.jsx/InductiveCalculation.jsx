import React, { useState } from 'react';
import './InductiveCalculation.css';
import { Button, Row, Col } from 'react-bootstrap';
import MaterialTable from "material-table";
import Select from "react-select";
import { Link } from '@material-ui/core';
import {
  Paper,
  Typography,
  IconButton,
  Tooltip
} from '@material-ui/core';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import { CalculatorIcon } from '@heroicons/react/24/outline'; // or /24/solid
import DeleteIcon from '@material-ui/icons/Delete';
import { options } from '../ProjectList/currencyvalue';
import { customStyles } from './Selector';
const InductiveCalculation =({ onCalculate })  => {
  // Transformer types data
  const transformerTypes = [

          { 
        type: "Flyback (< 20 Volts)",
        λb: 0.0054,
        units: "F/10⁶ hrs."
      },
      { 
        type: "Audio (15 -20K Hz)",
        λb: 0.014,
        units: "F/10⁶ hrs."
      },
      { 
        type: "Low Power Pulse (Peak Pwr. < 300W, Avg. Pwr. < 5W)",
        λb: 0.022,
        units: "F/10⁶ hrs."
      },
      { 
        type: "High Power, High Power Pulse (Peak Power ≥ 300W, Avg. Pwr. ≥ 5W)",
        λb: 0.049,
        units: "F/10⁶ hrs."
      },
      { 
        type: "RF (10K - 10M Hz)",
        λb: 0.13,
        units: "F/10⁶ hrs."
      },
     
  ];


// Transformer Class that uses both formats

// Usage Example

  // Inductor types data
  const inductorTypes = [
    { type: "Fixed Inductor or Choke", spec: "MIL-C-15305", description: "Fixed and Variable, RF", λb: 0.000030 },
    { type: "Variable Inductor", spec: "MIL-C-83445", description: "Fixed and Variable, RF, Chip", λb: 0.000050 },
    // { type: "Molded RF", spec: "MIL-C-39010", description: "Molded, RF, Est. Rel.", λb: 0.000030 }
  ];



  // Quality factors
  const qualityFactors = [
    { quality: "MIL-SPEC", πQ: 1.0 },
    { quality: "Lower", πQ: 3.0 },
    { quality: "S", πQ: 0.03 },
    { quality: "R", πQ: 0.10 },
    { quality: "P", πQ: 0.30 },
    { quality: "M", πQ: 1.0 }
  ];
  const qualityFactors1 = [
    { quality: "MIL-SPEC", πQ: 1.0 },
    { quality: "Lower", πQ: 3.0 },

  ];
  // Environment factors
  const environmentFactors = [
    { env: "GB (Ground, Benign)", πE: 1.0 },
    { env: "GF (Ground, Fixed)", πE: 6.0 },
    { env: "GM (Ground, Mobile)", πE: 12 },
    { env: "NS (Naval, Sheltered)", πE: 5.0 },
    { env: "NU (Naval, Unsheltered)", πE: 16 },
    { env: "AIC (Airborne, Inhabited, Cargo)", πE: 6.0 },
    { env: "AIF (Airborne, Inhabited, Fighter)", πE: 8.0 },
    { env: "AUC (Airborne, Uninhabited, Cargo)", πE: 7.0 },
    { env: "AUF (Airborne, Uninhabited, Fighter)", πE: 9.0 },
    { env: "ARW (Airborne, Rotary Wing)", πE: 24 },
    { env: "SF (Space, Flight)", πE: 0.50 },
    { env: "MF (Missile, Flight)", πE: 13 },
    { env: "ML (Missile, Launch)", πE: 34 },
    { env: "CL (Cannon, Launch)", πE: 610 }
  ];

  // MIL-T-27 case areas
  const caseAreas = [
    { case: "AF", area: 4 }, { case: "AG", area: 7 }, { case: "AH", area: 11 },
    { case: "AJ", area: 18 }, { case: "EB", area: 21 }, { case: "EA", area: 23 },
    { case: "FB", area: 25 }, { case: "FA", area: 31 }, { case: "GB", area: 33 },
    { case: "GA", area: 43 }, { case: "HB", area: 42 }, { case: "HA", area: 53 },
    { case: "JB", area: 58 }, { case: "JA", area: 71 }, { case: "KB", area: 72 },
    { case: "KA", area: 84 }, { case: "LB", area: 82 }, { case: "LA", area: 98 },
    { case: "MB", area: 98 }, { case: "MA", area: 115 }, { case: "NB", area: 117 },
    { case: "NA", area: 139 }, { case: "OA", area: 146 }
  ];

  // Component type options


  // State for form inputs
  const [deviceType, setDeviceType] = useState({
    type:"Transformer",
  });
  const [transformerQuality, setTransformerQuality] = useState(qualityFactors[0]);

  const [components, setComponents] = useState([]);
  const [milSpecSheet, setMilSpecSheet] = useState("");
  const [selectedTransformer, setSelectedTransformer] = useState(transformerTypes[0]);
  const [selectedInductor, setSelectedInductor] = useState(inductorTypes[0]);
  const [ambientTemp, setAmbientTemp] = useState(30);
  const [tempRiseMethod, setTempRiseMethod] = useState("spec");
  const [tempRise, setTempRise] = useState(15);
  const [caseType, setCaseType] = useState("AF");
  const [currentComponent, setCurrentComponent] = useState({ type: "transformer" })
  const [powerLoss, setPowerLoss] = useState(0);
  const [inputPower, setInputPower] = useState(0);
  const [casesTypes, setCasesTypes] = useState(caseAreas[0])
  const [weight, setWeight] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState(qualityFactors[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environmentFactors[0]);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showCalculations, setShowCalculations] = useState();
  const removeComponent = (id) => {
    setResults(results.filter(comp => comp.id !== id));
  };
  // Temperature factors
  const tempFactors = [
    { temp: 20, πT: 0.93 },
    { temp: 30, πT: 1.1 },
    { temp: 40, πT: 1.2 },
    { temp: 50, πT: 1.4 },
    { temp: 60, πT: 1.6 },
    { temp: 70, πT: 1.8 },
    { temp: 80, πT: 1.9 },
    { temp: 90, πT: 2.2 },
    { temp: 100, πT: 2.4 },
    { temp: 110, πT: 2.6 },
    { temp: 120, πT: 2.8 },
    { temp: 130, πT: 3.1 },
    { temp: 140, πT: 3.3 },
    { temp: 150, πT: 3.5 },
    { temp: 160, πT: 3.8 },
    { temp: 170, πT: 4.1 },
    { temp: 180, πT: 4.3 },
    { temp: 190, πT: 4.6 }
  ];
  // Calculate hot spot temperature
const calculateHotSpotTemp = () => {
  let ΔT = tempRise; // Default to specified ΔT if no method matches

  // Method 1: MIL-C-39010 Slash Sheet (if applicable)
  if (tempRiseMethod === "milSpec") {
    if (["1C", "3C", "5C", "7C", "9A", "10A", "13", "14"].includes(milSpecSheet)) {
      ΔT = 15;
    } else if (["4C", "6C", "8A", "11", "12"].includes(milSpecSheet)) {
      ΔT = 35;
    }
  }
  // Method 2: Case Area Method (Power Loss / Area)
  else if (tempRiseMethod === "caseArea" && powerLoss > 0) {
    const caseArea = caseAreas.find(c => c.case === caseType)?.area;
    if (!caseArea) throw new Error("Invalid case type selected");
    ΔT = 125 * powerLoss / caseArea; // Note: area in in² per spec
  }
  // Method 3: Power Loss / Weight
  else if (tempRiseMethod === "powerLossWeight" && powerLoss > 0 && weight > 0) {
    ΔT = 11.5 * powerLoss / Math.pow(weight, 0.6766); // Weight in lbs
  }
  // Method 4: Input Power / Weight (assumes 80% efficiency)
  else if (tempRiseMethod === "inputPowerWeight" && inputPower > 0 && weight > 0) {
    ΔT = 2.1 * inputPower / Math.pow(weight, 0.6766); // Weight in lbs
  }

  // Final calculation (T_HS = T_A + 1.1ΔT)
  return ambientTemp + 1.1 * ΔT;
};


  // const calculatePiT = () => {
  //   const hotSpotTemp = calculateHotSpotTemp();
  //   const closestTemp = tempFactors.reduce((prev, curr) => 
  //     Math.abs(curr.temp - hotSpotTemp) < Math.abs(prev.temp - hotSpotTemp) ? curr : prev
  //   );
  //   return closestTemp.πT;
  // };
const hotSpotTemp = calculateHotSpotTemp();
const calculatePiT = (hotSpotTemp) => {
  // Constants from the formula
  const ACTIVATION_ENERGY = 0.11; // eV
  const BOLTZMANN_CONSTANT = 8.617e-5; // eV/K
  const REFERENCE_TEMP = 298; // K (25°C)

  // Fall back to Arrhenius equation calculation
  const tempInKelvin = hotSpotTemp + 273;
  const exponent = (-ACTIVATION_ENERGY / BOLTZMANN_CONSTANT) *
                  ((1 / tempInKelvin) - (1 / REFERENCE_TEMP));
  return parseFloat(Math.exp(exponent)?.toFixed(3)); // Round to 3 decimal places
};


 // You should already have this

  // Calculate failure rate
  const calculateFailureRate = () => {
    const λb = deviceType === "transformer" ? selectedTransformer.λb : selectedInductor.λb;
    const πT = calculatePiT(hotSpotTemp)?.toFixed(4);
    const πQ = selectedQuality.πQ;
    const πE = selectedEnvironment.πE;
    return λb * πT * πQ * πE;
  };


  const handleCalculate = () => {
    const hotSpotTemp = calculateHotSpotTemp();
    const newResult = {
      id: Date.now(),
      deviceType,
      device: deviceType === "transformer" ? selectedTransformer.type : selectedInductor.type,
      description: deviceType === "transformer" ? selectedTransformer.description : selectedInductor.description,
      ambientTemp,
      hotSpotTemp,
      tempRiseMethod,
      tempRise,
      quality: selectedQuality.quality,
      environment: selectedEnvironment.env,
      λb: deviceType === "transformer" ? selectedTransformer.λb : selectedInductor.λb,
      πT: calculatePiT(hotSpotTemp, tempFactors)?.toFixed(4),
      πQ: selectedQuality.πQ,
      πE: selectedEnvironment.πE,
      λp: calculateFailureRate()
    };
    // setResults([...results, newResult]);
    // setShowResults(true);
    setResults([...results, newResult]);
    setShowResults(true); // Show Predicted Failure Rate
    // Hide detailed calculations by default
    if (onCalculate) {
      onCalculate(calculateFailureRate());
    }
  };




  const calculationColumns = [

    {
      title: <span>λ<sub>b</sub></span>,
      field: 'λb',
      render: rowData => rowData.λb?.toFixed(6)
    },
    {
      title: <span>π<sub>T</sub></span>,
      field: 'πT',
      render: rowData => rowData?.πT?.toFixed(6)
    },
    {
      title: <span>π<sub>Q</sub></span>,
      field: 'πQ',
      render: rowData => rowData.πQ?.toFixed(3)
    },
    {
      title: <span>π<sub>E</sub></span>,
      field: 'πE',
      render: rowData => rowData.πE?.toFixed(1)
    },
    {
      title: 'λp',
      field: 'λp',
      render: rowData => rowData.λp?.toFixed(6),
      cellStyle: {
        fontWeight: 'bold'
      }
    },

  ];




  return (
    <div className="calculator-container">
      <h2 className="text-center">Inductive Device</h2>
      <Row >

        <Col md={4}>
          <div className="form-group">
            <label>Part Type:</label>
            <Select
              style={customStyles}
              name="type"
              placeholder="Select"
              
              onChange={(selectedOption) => {
                setDeviceType({ ...deviceType, type: selectedOption.value });
              }}

              options={[
                { value: "Transformer", label: "Transformer" },
                { value: "Coil", label: "Coil" }
              ]}
            />

          </div>
          </Col>
          <Col md={4}>
          {deviceType.type === "Transformer" && (
            <div className="form-group">
              <label>Quality Factor:</label>
              <Select
                styles={customStyles}
                name="transformerQuality"
            
                onChange={(selectedOption) => {
                  setTransformerQuality(selectedOption.value);
                }}
                options={qualityFactors1.map(item => ({
                  value: item,
                  label: item.quality
                }))}
              />
            </div>
          )}

          {deviceType.type === "Coil" && (
            <div className="form-group">
              <label>Quality Factor:</label>
              <Select
                styles={customStyles}
                name="coilQuality"
                value={{
                  value: selectedQuality,
                  label: selectedQuality?.quality || "Select Quality"
                }}
                onChange={(selectedOption) => {
                  setSelectedQuality(selectedOption.value);
                }}
                options={qualityFactors1.map(item => ({
                  value: item,
                  label: item.quality
                }))}
              />
            </div>
          )}
</Col>
      
        <Col md={4}>
          <div className="form-group">
            <label>Environment (π<sub>E</sub>):</label>
            <Select
              value={environmentFactors.find(option => option.value === selectedEnvironment)}
              onChange={(selectedOption) => setSelectedEnvironment(selectedOption.value)}
              className="basic-select"
              classNamePrefix="select"
              options={environmentFactors.map(type => ({
                value: type,
                label: `${type.env} (${type.πE})`
              }))}
            />
          </div>

        </Col>
      </Row>

      <div>
        <Row>

          <>
            {deviceType === "transformer" && (
              <Col md={4}>
                <div className="form-group">
                  <label>Quality Factor</label>
                  <Select
                    value={qualityFactors.find(option => option.value === selectedQuality)}
                    onChange={(selectedOption) => setSelectedQuality(selectedOption.value)}
                    options={qualityFactors.map(factor => ({
                      value: factor,
                      label: `${factor.quality} (${factor.value})` // Show both quality name and value
                    }))}
                    className="quality-factor-select"
                    classNamePrefix="select"
                    placeholder="Select Quality Factor..."
                    isSearchable={true}
                    styles={customStyles}

                  />
                </div>
              </Col>
            )}

          </>
          <Col md={4}>
            <div className="form-group">
              <label>{deviceType === "transformer" ? "Transformer Type:" : "Inductor Type:"}</label>
              <Select
                value={deviceType === "transformer"
                  ? transformerTypes.find(option => option.value === deviceType)
                  : inductorTypes.find(i => i.value === selectedInductor)}
                onChange={(selectedOption) => {
                  if (deviceType === "transformer") {
                    setSelectedTransformer(selectedOption.value);
                  } else {
                    setSelectedInductor(selectedOption.value);
                  }
                }}
                options={transformerTypes.map(type => ({
                  value: type,
                  label: `${type.type}`
                }))

                }
              />


            </div>
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label>Ambient Temperature (°C) T_A :</label>
              <input
                type="number"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(parseFloat(e.target.value))}
                min="20"
                max="190"
                step="1"
              />
            </div>
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label>Temperature Rise Method ΔT:</label>
              <Select

                name="tempRiseMethod"
                placeholder="Select Temperature Rise Method"
                value={{
                  value: tempRiseMethod,
                  label: tempRiseMethod === "spec" ? "From Specification" :
                    tempRiseMethod === "caseArea" ? "Case Area & Power Loss" :
                      tempRiseMethod === "powerLossWeight" ? "Power Loss & Weight" :
                        "Input Power & Weight"
                }}
                onChange={(selectedOption) => setTempRiseMethod(selectedOption.value)}
                options={[
                  { value: "spec", label: "From Specification" },
                  { value: "caseArea", label: "Case Area & Power Loss" },
                  { value: "powerLossWeight", label: "Power Loss & Weight" },
                  { value: "inputPowerWeight", label: "Input Power & Weight" }
                ]}
              />
            </div>
          </Col>
        </Row>
        <Row>
          
          <Col md={4}>
            {tempRiseMethod === "spec" && (
              <div className="form-group">
                <label>Temperature Rise ΔT(°C):</label>
                <input
                  type="number"
                  value={tempRise}
                  onChange={(e) => setTempRise(parseFloat(e.target.value))}
                  min="0"
                  step="1"
                />
              </div>
            )}
            {tempRiseMethod === "caseArea" && (
              <>
                <div className="form-group ">
                  <label>Case Type:</label>
                  <Select
                    value={caseAreas.find(option => option.value === casesTypes)}
                    onChange={(selectedOption) => setCasesTypes(selectedOption.value)}
                    options={caseAreas.map(factor => ({
                      value: factor,
                      label: factor.case,
                    }))}
                    className="basic-select"
                    classNamePrefix="select"
                  />
                </div>

                <div className="form-group">
                  <label>Power Loss (W) ΔT:</label>
                  <input
                    type="number"
                    value={powerLoss}
                    onChange={(e) => setPowerLoss(parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>

              </>
            )}
            {tempRiseMethod === "powerLossWeight" && (
              <>
                <div className="form-group ">
                  <label>Power Loss (W) ΔT:</label>
                  <input
                    type="number"
                    value={powerLoss}
                    onChange={(e) => setPowerLoss(parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group ">
                  <label>Weight (lbs):</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>

              </>
            )}
            {tempRiseMethod === "inputPowerWeight" && (
              <>


                <div className="form-group">
                  <label>Input Power (W):</label>
                  <input
                    type="number"
                    value={inputPower}
                    onChange={(e) => setInputPower(parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Weight (lbs):</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>

              </>
            )}
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label>Temperature Factor (πT):</label>
              <input
                type="text"
                value={calculatePiT(hotSpotTemp, tempFactors)}
                readOnly
                className="readonly-field"
              />
            </div>
          </Col>
        </Row>

      </div>
      <br />

      <div className='d-flex justify-content-between align-items-center' >

        <div>
          {showResults && (
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

            </>

          )}
        </div>
        <Button className="btn-calculate float-end mt-1" onClick={handleCalculate}>
          Calculate Failure Rate
        </Button>



      </div>

      {showResults && results.length > 0 && (
        <div>
          <h2 className='text-center'>
            Calculation Result
          </h2>
          <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
          {results[results.length - 1].λp?.toFixed(6)} failures/10<sup>6</sup> hours


        </div>
      )}




      {showCalculations && (
        <div className="results-section">

          <div className="hotspot-info">
            <p>Calculated Hot Spot Temperature: {results[results.length - 1]?.hotSpotTemp?.toFixed(2)}°C</p>
          </div>

          {/* // In your component's render: */}
          <div className="card mt-3">
            <div className="card-body">

              <MaterialTable
                columns={calculationColumns}
                data={[
{
  λb: deviceType === "transformer" ? selectedTransformer.λb : selectedInductor.λb,
  πT: calculatePiT(hotSpotTemp), // Pass required arguments
  πQ: selectedQuality.πQ,
  πE: selectedEnvironment.πE,
  λp: calculateFailureRate()
}
                ]}  // Changed from components to results to match your original table
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
                  rowStyle: (rowData) => ({
                    backgroundColor: '#FFF',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }),
                  cellStyle: {
                    padding: '8px 16px'
                  }
                }}
                components={{
                  Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 4 }} />
                }}
              />
              <div className="formula-section">
                <h3>Calculation Formula</h3>
                <p>λ<sub>p</sub> = λ<sub>b</sub> × π<sub>T</sub> × π<sub>Q</sub> × π<sub>E</sub></p>
                <p>Where:</p>
                <ul>
                  <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                  <li>λ<sub>b</sub>= Base failure rate</li>
                  <li>π<sub>T</sub>= Temperature factor (based on hot spot temperature)</li>
                  <li> π<sub>Q</sub> = Quality factor</li>
                  <li> π<sub>E</sub> = Environment factor</li>
                </ul>
                <h5>Hot Spot Temperature Calculation:</h5>
                <p>T<sub>HS</sub> = T<sub>A</sub> + 1.1 × ΔT</p>
                <p>Where ΔT can be determined by:</p>
                <ol>
                  <li>Specification test method</li>
                  <li>Case area and power loss: ΔT = 125 × W<sub>L</sub> / A</li>
                  <li>Power loss and weight: ΔT = 11.5 × W<sub>L</sub> / (Wt)<sup>0.6766</sup></li>
                  <li>Input power and weight: ΔT = 2.1 × W<sub>in</sub> / (Wt)<sup>0.6766</sup></li>
                </ol>
              </div>
            </div>
          </div>

        </div>
      )}


    </div>
  );
};

export default InductiveCalculation;