import React, { useState } from 'react';
import { Row, Col, Button, Alert, Form } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import MaterialTable from 'material-table';
import Paper from '@mui/material/Paper';

const Interconnection = ({ onCalculate }) => {
  const [currentModel, setCurrentModel] = useState({
    type: "PTH Model"
  });

  // Base failure rate data for PWA
  const baseRatesPWA = [
    { type: 'Printed Wiring Assembly/Printed Circuit Boards with PTHs', rate: 0.000017 },
    { type: 'Discrete Wiring with Electroless Deposited PTH (5.2 Levels of Circuitry)', rate: 0.00011 }
  ];

  const complexityFactors = [
    { planes: 1, factor: 1.0 },
    { planes: 2, factor: 1.0 },
    { planes: 3, factor: 1.3 },
    { planes: 4, factor: 1.6 },
    { planes: 5, factor: 1.8 },
    { planes: 6, factor: 2.0 },
    { planes: 7, factor: 2.2 },
    { planes: 8, factor: 2.4 },
    { planes: 9, factor: 2.6 },
    { planes: 10, factor: 2.8 },
    { planes: 11, factor: 2.9 },
    { planes: 12, factor: 3.1 },
    { planes: 13, factor: 3.3 },
    { planes: 14, factor: 3.4 },
    { planes: 15, factor: 3.6 },
    { planes: 16, factor: 3.7 },
    { planes: 17, factor: 3.9 },
    { planes: 18, factor: 4.0 }
  ];


  // Quality factors for PWA
  const qualityFactorsPWA = [
    { quality: 'MIL-SPEC or IPC Level 3', factor: 1 },
    { quality: 'Lower', factor: 2 }
  ];

  // Environment factors for PWA
  const environmentFactorsPWA = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 2.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 7.0 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 5.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 13 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 5.0 },
    { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 8.0 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 16 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 28 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 19 },
    { env: 'SF', label: 'Space, Flight', factor: 0.50 },
    { env: 'MF', label: 'Missile, Flight', factor: 10 },
    { env: 'ML', label: 'Missile, Launch', factor: 27 },
    { env: 'CL', label: 'Cannon, Launch', factor: 500 }
  ];

  // Default cycling rates for SMT
  const cyclingRatesSMT = [
    { type: 'Automotive', rate: 1.0 },
    { type: 'Consumer (television, radio, recorder)', rate: 0.08 },
    { type: 'Computer', rate: 0.17 },
    { type: 'Telecommunications', rate: 0.0042 },
    { type: 'Commercial Aircraft', rate: 0.25 },
    { type: 'Industrial', rate: 0.021 },
    { type: 'Military Ground Applications', rate: 0.03 },
    { type: 'Military Aircraft (Cargo)', rate: 0.12 },
    { type: 'Military Aircraft (Fighter)', rate: 0.5 }
  ];

  // Lead configuration factors for SMT
  const leadConfigFactorsSMT = [
    { type: 'Leadless', factor: 1 },
    { type: 'J or S Lead', factor: 150 },
    { type: 'Gull Wing', factor: 5000 }
  ];

  // Package TCE values for SMT
  const packageTCEValuesSMT = [
    { material: 'Plastic', value: 7 },
    { material: 'Ceramic', value: 6 }
  ];

  // Default ΔT values for SMT
  const deltaTValuesSMT = [
    { env: 'GB', value: 7 },
    { env: 'GF', value: 21 },
    { env: 'GM', value: 26 },
    { env: 'NS', value: 26 },
    { env: 'NU', value: 61 },
    { env: 'AIC', value: 31 },
    { env: 'AIF', value: 31 },
    { env: 'AUC', value: 57 },
    { env: 'AUF', value: 57 },
    { env: 'ARW', value: 31 },
    { env: "SF", value: 7 }
  ];

  const substrateTCEValuesSMT = [
    { material: 'FR-4 Laminate', value: 18 },
    { material: 'FR-4 Multilayer Board', value: 20 },
    { material: 'FR-4 Multilayer Board w/Copper Clad Invar', value: 11 },
    { material: 'Ceramic Multilayer Board', value: 7 },
    { material: 'Copper Clad Invar', value: 5 },
    { material: 'Copper Clad Molybdenum', value: 5 },
    { material: 'Carbon-Fiber/Epoxy Composite', value: 1 },
    { material: 'Kevlar Fiber', value: 3 },
    { material: 'Quartz Fiber', value: 1 },
    { material: 'Glass Fiber', value: 5 },
    { material: 'Epoxy/Glass Laminate', value: 15 },
    { material: 'Polyamide/Glass Laminate', value: 13 },
    { material: 'Polyamide/Kevlar Laminate', value: 6 },
    { material: 'Polyamide/Quartz Laminate', value: 8 },
    { material: 'Epoxy/Kevlar Laminate', value: 7 },
    { material: 'Alumina (Ceramic)', value: 7 },
    { material: 'Epoxy Aramid Fiber', value: 7 },
    { material: 'Polyamide Aramid Fiber', value: 6 },
    { material: 'Epoxy-Quartz', value: 9 },
    { material: 'Fiberglass Teflon Laminates', value: 20 },
    { material: 'Porcelainized Copper Clad Invar', value: 7 },
    { material: 'Fiberglass Ceramic Fiber', value: 7 }
  ];

  // Effective Cumulative Failures table for SMT
  const ecfTableSMT = [
    { range: '0-0.1', value: 0.13 },
    { range: '0.11-0.20', value: 0.15 },
    { range: '0.21-0.30', value: 0.23 },
    { range: '0.31-0.40', value: 0.31 },
    { range: '0.41-0.50', value: 0.41 },
    { range: '0.51-0.60', value: 0.51 },
    { range: '0.61-0.70', value: 0.61 },
    { range: '0.71-0.80', value: 0.68 },
    { range: '0.81-0.90', value: 0.76 },
    { range: '>0.90', value: 1.0 }
  ];

  // State for PWA inputs
  const [pwaInputs, setPwaInputs] = useState({
    technology: baseRatesPWA[0],
    automatedPTHs: 0,
    handSolderedPTHs: 0,
    circuitPlanes: 1,
    customPlanes: 0,
    quality: qualityFactorsPWA[0],
    environment: environmentFactorsPWA[0]
  });


  // State for SMT inputs
  const [smtInputs, setSmtInputs] = useState({
    packageSize: 1480, // mils
    solderHeight: 5, // mils
    powerDissipation: 0.5, // watts
    thermalResistance: 20, // °C/watt
    designLife: 20, // years
    cyclingRate: cyclingRatesSMT[6], // Military Ground
    leadConfig: leadConfigFactorsSMT[0], // Leadless
    packageMaterial: packageTCEValuesSMT[0],
    ecfTableSMT: ecfTableSMT[0],
    substrateMaterial: substrateTCEValuesSMT[0], // FR-4 Laminate
    environment: environmentFactorsPWA[6], // Military Ground (GM)
    deviceCount: 1
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);
  const [errors, setErrors] = useState({
    type:"",
  modelType: "",
  technology: "",
  automatedPTHs: "",
  handSolderedPTHs: "",
  circuitPlanes: "",
  customPlanes: "",
  ecfValue: "",
  substrateMaterial: "",
  environment: "",
  packageSize: "",
  solderHeight: "",
  powerDissipation: "",
  thermalResistance: "",
  designLife: "",
  deviceCount: "",
  cyclingRate: "",
  leadConfig: "",
  packageMaterial: ""
});


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
const validateForm = () => {
  const newErrors = {};
  let isValid = true;

  if (!currentModel.type) {
    newErrors.type = "Please select a model type";
    isValid = false;
  }

  if (currentModel.type === 'PTH Model') {
    if (!pwaInputs.technology) {
      newErrors.technology = "Please select a technology type";
      isValid = false;
    }
    if (isNaN(pwaInputs.automatedPTHs)) {
      newErrors.automatedPTHs = "Please enter a valid number of automated PTHs";
      isValid = false;
    }
    if (isNaN(pwaInputs.handSolderedPTHs)) {
      newErrors.handSolderedPTHs = "Please enter a valid number of hand soldered PTHs";
      isValid = false;
    }
    if (!pwaInputs.circuitPlanes) {
      newErrors.circuitPlanes = "Please select number of circuit planes";
      isValid = false;
    }
    if (pwaInputs.circuitPlanes === 'custom' && 
        (isNaN(pwaInputs.customPlanes) || pwaInputs.customPlanes < 2 || pwaInputs.customPlanes > 18)) {
      newErrors.customPlanes = "Please enter a valid number of custom planes (2-18)";
      isValid = false;
    }
  } 
  else if (currentModel.type === 'SMT Model') {
    if (!smtInputs.ecfValue) {
      newErrors.ecfValue = "Please select environmental correction factor";
      isValid = false;
    }
    if (!smtInputs.substrateMaterial) {
      newErrors.substrateMaterial = "Please select substrate material";
      isValid = false;
    }
    if (!smtInputs.environment) {
      newErrors.environment = "Please select environment";
      isValid = false;
    }
    if (isNaN(smtInputs.packageSize) || smtInputs.packageSize <= 0) {
      newErrors.packageSize = "Please enter a valid package size";
      isValid = false;
    }
    if (isNaN(smtInputs.solderHeight) || smtInputs.solderHeight <= 0) {
      newErrors.solderHeight = "Please enter a valid solder height";
      isValid = false;
    }
    if (isNaN(smtInputs.powerDissipation) || smtInputs.powerDissipation < 0) {
      newErrors.powerDissipation = "Please enter valid power dissipation";
      isValid = false;
    }
    if (isNaN(smtInputs.thermalResistance) || smtInputs.thermalResistance <= 0) {
      newErrors.thermalResistance = "Please enter valid thermal resistance";
      isValid = false;
    }
    if (isNaN(smtInputs.designLife) || smtInputs.designLife <= 0) {
      newErrors.designLife = "Please enter valid design life";
      isValid = false;
    }
    if (isNaN(smtInputs.deviceCount) || smtInputs.deviceCount <= 0) {
      newErrors.deviceCount = "Please enter valid number of devices";
      isValid = false;
    }
    if (!smtInputs.cyclingRate) {
      newErrors.cyclingRate = "Please select cycling rate";
      isValid = false;
    }
    if (!smtInputs.leadConfig) {
      newErrors.leadConfig = "Please select lead configuration";
      isValid = false;
    }
    if (!smtInputs.packageMaterial) {
      newErrors.packageMaterial = "Please select package material";
      isValid = false;
    }
  }

  setErrors(newErrors);
  return isValid;
}
  // Calculate PWA failure rate
  const calculatePwaFailureRate = () => {
    if (!validateForm()){
     return null;
  }
    try {
      // Validate required inputs
      if (!pwaInputs.technology?.rate ||
        !pwaInputs.quality?.factor ||
        !pwaInputs.environment?.factor) {
        throw new Error("Missing required input values");
      }

      const baseRate = parseFloat(pwaInputs.technology.rate);
      const qualityFactor = parseFloat(pwaInputs.quality.factor);
      const environmentFactor = parseFloat(pwaInputs.environment.factor);

      // Calculate complexity factor (handle both standard and custom planes)
      const planes = pwaInputs.circuitPlanes === 'custom'
        ? pwaInputs.customPlanes
        : pwaInputs.circuitPlanes;
      const complexityFactor = calculatePiC(planes);

      // Calculate PTH factors (with proper null checks)
      const N1 = pwaInputs.automatedPTHs || 0;  // Automated PTHs
      const N2 = pwaInputs.handSolderedPTHs || 0;  // Hand-soldered PTHs

      // Calculate failure rate using the correct formula
      const failureRate = baseRate *
        (N1 * complexityFactor + N2 * (complexityFactor + 13)) *
        qualityFactor *
        environmentFactor;

      // Set results with proper parameters
      setResult({
        value: failureRate?.toFixed(6),
        model: 'PTH',
        parameters: {
          λb: baseRate?.toFixed(6),
          N1: N1,
          N2: N2,
          πC: complexityFactor?.toFixed(3),
          "πC+13": (complexityFactor + 13)?.toFixed(3),
          πQ: qualityFactor?.toFixed(1),
          πE: environmentFactor?.toFixed(1),
          formula: `λp = λb × [N₁πC + N₂(πC+13)] × πQ × πE`
        }
      });
      setError(null);

      if (onCalculate) {
        onCalculate(failureRate);
      }
    } catch (err) {
      setError(err.message || "Error calculating failure rate");
      setResult(null);
      if (onCalculate) {
        onCalculate(null);
      }
    }
  };

  const calculatePiC = (planes) => {
    // Handle undefined/null cases
    if (planes === undefined || planes === null) return 1.0;

    // Convert to number if needed
    const planesNum = typeof planes === 'number' ? planes : parseInt(planes, 10);

    // Use table lookup for standard values (1-18)
    const tableEntry = complexityFactors.find(item => item.planes === planesNum);
    if (tableEntry) return tableEntry.factor;

    // Use formula for custom values (2 ≤ P ≤ 18)
    if (planesNum >= 2 && planesNum <= 18) {
      return 0.65 * Math.pow(planesNum, 0.63);
    }

    // Default to 1.0 for invalid values
    return 1.0;
  };

const environmentCorrectionFactor =()=>{
  return smtInputs.ecfValue;
}
  // Calculate SMT failure rate
  const calculateSmtFailureRate = () => {
      if (!validateForm()){
     return null;
  }
    try {
      // Get ΔT from environment
      const deltaT = deltaTValuesSMT.find(d => d.env === smtInputs.environment.env)?.value || 21; // Default to GM if not found
     console.log("deltaT",deltaT)
      // Calculate temperature rise due to power dissipation
      const tempRise = smtInputs.thermalResistance * smtInputs.powerDissipation;
      
      // Calculate distance from center to furthest solder joint (half of package size)
      const d = smtInputs.packageSize / 2;

      // Get h (solder joint height)
      const h = smtInputs.solderHeight;

      // Get material coefficients
      const αS = smtInputs.substrateMaterial.value;
      const αCC = smtInputs.packageMaterial.value;

      // Get lead configuration factor
      const πLC = smtInputs.leadConfig.factor;

      // Calculate Ni (number of cycles to failure)
      const strainRange = Math.abs(αS * deltaT - αCC * (deltaT + tempRise)) * 1e-6 ?.toFixed(6);
      const Ni = 3.5 * Math.pow((d / (0.65 * h) * strainRange), -2.26) * πLC;
     console.log("Ni",Ni)
      // Get cycling rate
      const CR = smtInputs.cyclingRate.rate;
      console.log("CR",CR)
      // Calculate characteristic life (αSMT)
      const αSMT = Ni / CR;
      console.log("αSMTghj ",αSMT )
      // const ecf = smtInputs.ecfTableSMT.value;
      const ecf = environmentCorrectionFactor();
      console.log("ecf",ecf)
      // Calculate LC/αSMT ratio
      const lifeRatio = (smtInputs.designLife * 8760) / αSMT;

      const λSMT = (ecf/αSMT)?.toFixed(8);
      console.log("λSMTfh",λSMT)
      const failureRate = λSMT * smtInputs.deviceCount?.toFixed(8);

      console.log('Failure Rate:', failureRate);

      setResult({
        value: failureRate,
        model: 'SMT',
        parameters: {
          packageSize: smtInputs.packageSize,
          solderHeight: smtInputs.solderHeight,
          powerDissipation: smtInputs.powerDissipation,
          thermalResistance: smtInputs.thermalResistance,
          designLife: smtInputs.designLife,
          cyclingRate: smtInputs.cyclingRate.rate,
          leadConfig: smtInputs.leadConfig.type,
          packageMaterial: smtInputs.packageMaterial.material,
          substrateMaterial: smtInputs.substrateMaterial.material,
          environment: smtInputs.environment.label,
          deviceCount: smtInputs.deviceCount,
          Ni: Ni?.toFixed(0),
          αSMT: αSMT?.toFixed(0),
          ecf: ecf?.toFixed(2),
          failureRate,
          formula: 'λSMT = (ECF / αSMT) × number of devices'
        }
      });

   
      console.log('αSMT:', αSMT?.toFixed(0));
      console.log('ecf:',ecf)
      console.log('Number of Devices:', smtInputs.deviceCount);
      setError(null);
      if (onCalculate) {
        onCalculate(failureRate); // Pass the calculated failure rate
        // Pass the calculated failure rate
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <>

      <h2 className="text-center mb-4">

        {currentModel?.type === 'PTH Model'
          ? 'Plated Through Holes'
          : 'Surface Mount Technology'}
      </h2>
      <Row>
        <Col md={4}>
          {/* Model Type Selection */}
          <div className="form-group">
            <label>Model Type:</label>
   <Select
  styles={customStyles}
  name="type"
  placeholder="Select"
  value={currentModel.type ? 
    { value: currentModel.type, label: currentModel.type } : null}
  onChange={(selectedOption) => {
    setCurrentModel({ ...currentModel, type: selectedOption.value });
    setErrors({...errors, type: ""});
  }}
  options={[
    { value: "PTH Model", label: "PTH Model (Through-hole)" },
    { value: "SMT Model", label: "SMT Model (Surface Mount)" },
  ]}
  className={errors.type? 'is-invalid' : ''}
/>
{errors.type && <small className="text-danger">{errors.type}</small>}
          </div>
        </Col>
        {currentModel?.type === "SMT Model" && (
          <>
           <Col md={4}>
  {/* Environmental Correction Factor (ECF) */}
  <div className="form-group">
    <label>Environmental Correction Factor (ECF):</label>
    <Select
      styles={customStyles}
      options={[
        { range: '0-0.1', value: 0.13, label: '0-0.1 (ECF = 0.13)' },
        { range: '0.11-0.20', value: 0.15, label: '0.11-0.20 (ECF = 0.15)' },
        { range: '0.21-0.30', value: 0.23, label: '0.21-0.30 (ECF = 0.23)' },
        { range: '0.31-0.40', value: 0.31, label: '0.31-0.40 (ECF = 0.31)' },
        { range: '0.41-0.50', value: 0.41, label: '0.41-0.50 (ECF = 0.41)' },
        { range: '0.51-0.60', value: 0.51, label: '0.51-0.60 (ECF = 0.51)' },
        { range: '0.61-0.70', value: 0.61, label: '0.61-0.70 (ECF = 0.61)' },
        { range: '0.71-0.80', value: 0.68, label: '0.71-0.80 (ECF = 0.68)' },
        { range: '0.81-0.90', value: 0.76, label: '0.81-0.90 (ECF = 0.76)' },
        { range: '>0.90', value: 1.0, label: '>0.90 (ECF = 1.0)' }
      ]}
      value={{
        value: smtInputs.ecfValue,
        label: smtInputs.ecfValue 
          ? `ECF = ${smtInputs.ecfValue}`
          : "Select ECF Range"
      }}
      onChange={(selectedOption) => {setSmtInputs(prev => ({
        ...prev,
        ecfValue: selectedOption.value
      }))
      
    setErrors({...errors,ecfValue:""})}}
    />
    {errors.ecfValue && <small className="text-danger">{errors.ecfValue}</small>}
  </div>
</Col>

            <Col md={4}>
              {/* Substrate Material */}
              <div className="form-group">
                <label>Substrate Material (α<sub>S</sub>) for N<sub>f</sub>:</label>
                <Select
                  styles={customStyles}
                  options={substrateTCEValuesSMT.map(item => ({
                    value: item,
                    label: `${item.material} (αS = ${item.value})`
                  }))}
                  value={{
                    value: smtInputs.substrateMaterial,
                    label: `${smtInputs.substrateMaterial.material} (αS = ${smtInputs.substrateMaterial.value})`
                  }}
                  onChange={(selectedOption) => setSmtInputs(prev => ({
                    ...prev,
                    substrateMaterial: selectedOption.value
                  }))}
                />
              </div>
            </Col>

          </>
        )}
        {currentModel?.type === "PTH Model" && (
          <>

            <Col md={4}>
              {/* Quality Factor */}
              <div className="form-group">
                <label>Quality ( π<sub>Q</sub>):</label>
                <Select
                  styles={customStyles}
                  options={qualityFactorsPWA.map(item => ({
                    value: item,
                    label: `${item.quality} ( πQ = ${item.factor})`
                  }))}
                  value={{
                    value: pwaInputs.quality,
                    label: `${pwaInputs.quality.quality} ( πQ = ${pwaInputs.quality.factor})`
                  }}
                  onChange={(selectedOption) => setPwaInputs(prev => ({
                    ...prev,
                    quality: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Environment Factor */}
              <div className="form-group">
                <label>Environment ( π<sub>E</sub>):</label>
                <Select
                  styles={customStyles}
                  options={environmentFactorsPWA.map(item => ({
                    value: item,
                    label: `${item.label} ( πE = ${item.factor})`
                  }))}
                  value={{
                    value: pwaInputs.environment,
                    label: `${pwaInputs.environment.label} ( πE = ${pwaInputs.environment.factor})`
                  }}
                  onChange={(selectedOption) => setPwaInputs(prev => ({
                    ...prev,
                    environment: selectedOption.value
                  }))}
                />
              </div>
            </Col>
          </>
        )}

      </Row>

      {currentModel?.type === "PTH Model" && (
        <>
          <Row className="mb-3">
            <Col md={4}>
              {/* Technology Selection */}
              <div className="form-group">
                <label>Technology (λ<sub>b</sub>):</label>
                <Select
                  styles={customStyles}
                  options={baseRatesPWA.map(item => ({
                    value: item,
                    label: `${item.type} (λb = ${item.rate})`
                  }))}
                  value={{
                    value: pwaInputs.technology,
                    label: `${pwaInputs.technology.type} (λb = ${pwaInputs.technology.rate})`
                  }}
                  onChange={(selectedOption) => setPwaInputs(prev => ({
                    ...prev,
                    technology: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Automated PTHs */}
              <div className="form-group">
                <label>Automated PTHs (N<sub>1</sub>):</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={pwaInputs.automatedPTHs}
                  onChange={(e) => setPwaInputs(prev => ({
                    ...prev,
                    automatedPTHs: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Hand Soldered PTHs */}
              <div className="form-group">
                <label>Hand Soldered PTHs (N<sub>2</sub>):</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={pwaInputs.handSolderedPTHs}
                  onChange={(e) => setPwaInputs(prev => ({
                    ...prev,
                    handSolderedPTHs: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
            </Col>
            <Col md={4}>
              <div className='form-group'>
                <label>Number of Circuit Planes (π<sub>C</sub>):</label>
                <Select
                  styles={customStyles}
                  options={[
                    ...complexityFactors.map(item => ({
                      value: item.planes,
                      label: `${item.planes} planes (πC = ${item.factor.toFixed(1)})`
                    })),
                    { value: 'custom', label: 'Custom Planes' }
                  ]}
                  value={{
                    value: pwaInputs.circuitPlanes,
                    label: pwaInputs.circuitPlanes === 'custom'
                      ? `Custom Planes (πC = ${calculatePiC(pwaInputs.customPlanes).toFixed(3)})`
                      : `${pwaInputs.circuitPlanes} planes (πC = ${calculatePiC(pwaInputs.circuitPlanes).toFixed(1)})`
                  }}
                  onChange={(selectedOption) => setPwaInputs(prev => ({
                    ...prev,
                    circuitPlanes: selectedOption.value,
                    customPlanes: selectedOption.value === 'custom' ? (prev.customPlanes || 2) : undefined
                  }))}
                />

                {pwaInputs.circuitPlanes === 'custom' && (
                  <div className="mt-2">
                    <label>Custom Number of Planes (2-18):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={pwaInputs.customPlanes || ''}
                      onChange={(e) => {

                        setPwaInputs(prev => ({
                          ...prev,
                          customPlanes: e.target.value
                        }));
                      }}
                      min="2"
                      max="18"
                      step="1"
                      placeholder="Enter custom planes (2-18)"
                    />
                    <small className="text-muted">
                      Formula: πC = 0.65 × P<sup>0.63</sup>
                    </small>
                  </div>
                )}

              </div>
            </Col>
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
              onClick={calculatePwaFailureRate}
              className="btn-calculate float-end mt-1"
            >
              Calculate Failure Rate
            </Button>
          </div>
                     {result && (
        <>
          <h2 className="text-center">Calculation Result</h2>
          <div className="d-flex align-items-center">
            <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
            <span className="ms-2">{result?.value} failures/10<sup>6</sup> hours</span>
          </div>
        </>
      )}
        </>
      )}

      {currentModel?.type === "SMT Model" && (
        <>
          <Row className="mb-3">
            
            <Col md={4}>
              {/* Environment */}
              <div className="form-group">
                <label>Environment (ΔT) for N<sub>f</sub>:</label>
                <Select
                  styles={customStyles}
                  options={environmentFactorsPWA.map(item => ({
                    value: item,
                    label: `${item.label} (ΔT = ${deltaTValuesSMT.find(d => d.env === item.env)?.value || 'N/A'})`
                  }))}
                  value={{
                    value: smtInputs.environment,
                    label: `${smtInputs.environment.label} (ΔT = ${deltaTValuesSMT.find(d => d.env === smtInputs.environment.env)?.value || 'N/A'})`
                  }}
                  onChange={(selectedOption) => setSmtInputs(prev => ({
                    ...prev,
                    environment: selectedOption.value
                  }))}
                />
              </div>
            </Col>
            <Col md={4}>
              {/* Package Size */}
              <div className="form-group">
                <label>Package Size (mils) (d) for N<sub>f</sub>:</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={smtInputs.packageSize}
                  onChange={(e) => setSmtInputs(prev => ({
                    ...prev,
                    packageSize: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Solder Joint Height */}
              <div className="form-group">
                <label>Solder Joint Height (mils) (h) for N<sub>f</sub>:</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  step="0.1"
                  value={smtInputs.solderHeight}
                  onChange={(e) => setSmtInputs(prev => ({
                    ...prev,
                    solderHeight: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
            </Col>



            <Col md={4}>
              {/* Power Dissipation */}
              <div className="form-group">
                <label>Power Dissipation (W) for N<sub>f</sub>:</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.1"
                  value={smtInputs.powerDissipation}
                  onChange={(e) => setSmtInputs(prev => ({
                    ...prev,
                    powerDissipation: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
              <small className="text-muted">
                T<sub>RISE</sub> = Thermal Resistence (°C/W) × Power Dissipation (W)
              </small>
            </Col>


            <Col md={4}>
              {/* Thermal Resistance */}
              <div className="form-group">
                <label>Thermal Resistance (°C/W) for N<sub>f</sub>:</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={smtInputs.thermalResistance}
                  onChange={(e) => setSmtInputs(prev => ({
                    ...prev,
                    thermalResistance: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
            </Col>


            <Col md={4}>
              {/* Design Life */}
              <div className="form-group">
                <label>Design Life (years):</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={smtInputs.designLife}
                  onChange={(e) => setSmtInputs(prev => ({
                    ...prev,
                    designLife: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Number of Devices */}
              <div className="form-group">
                <label>Number of Devices:</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={smtInputs.deviceCount}
                  onChange={(e) => setSmtInputs(prev => ({
                    ...prev,
                    deviceCount: parseInt(e.target.value) || 1
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Cycling Rate */}
              <div className="form-group">
                <label>Cycling Rate (CR):</label>
                <Select
                  styles={customStyles}
                  options={cyclingRatesSMT.map(item => ({
                    value: item,
                    label: `${item.type} (${item.rate} cycles/hour)`
                  }))}
                  value={{
                    value: smtInputs.cyclingRate,
                    label: `${smtInputs.cyclingRate.type} (${smtInputs.cyclingRate.rate} cycles/hour)`
                  }}
                  onChange={(selectedOption) => setSmtInputs(prev => ({
                    ...prev,
                    cyclingRate: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Lead Configuration */}
              <div className="form-group">
                <label>Lead Configuration (π<sub>LC</sub>):</label>
                <Select
                  styles={customStyles}
                  options={leadConfigFactorsSMT.map(item => ({
                    value: item,
                    label: `${item.type} (πLC = ${item.factor})`
                  }))}
                  value={{
                    value: smtInputs.leadConfig,
                    label: `${smtInputs.leadConfig.type} (πLC = ${smtInputs.leadConfig.factor})`
                  }}
                  onChange={(selectedOption) => setSmtInputs(prev => ({
                    ...prev,
                    leadConfig: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Package Material */}
              <div className="form-group">
                <label>Package Material (α<sub>CC</sub>) for N<sub>f</sub>:</label>
                <Select
                  styles={customStyles}
                  options={packageTCEValuesSMT.map(item => ({
                    value: item,
                    label: `${item.material} (αCC = ${item.value})`
                  }))}
                  value={{
                    value: smtInputs.packageMaterial,
                    label: `${smtInputs.packageMaterial.material} (αCC = ${smtInputs.packageMaterial.value})`
                  }}
                  onChange={(selectedOption) => setSmtInputs(prev => ({
                    ...prev,
                    packageMaterial: selectedOption.value
                  }))}
                />
              </div>
            </Col>
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
              onClick={calculateSmtFailureRate}
              className="btn-calculate float-end mt-1"
            >
              Calculate Failure Rate
            </Button>
          </div>
             {result && (
        <>
          <h2 className="text-center">Calculation Result</h2>
          <div className="d-flex align-items-center">
            <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
            <span className="ms-2">{result?.parameters?.failureRate?.toFixed(7)} failures/10<sup>6</sup> hours</span>
          </div>
        </>
      )}
        </>
      )}

      {error && (
        <Row>
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}
      <br />
      <br />

   
      <br />

      {result && showCalculations && (
        <>
          <Row className="mb-4">
            <Col>
              <div className="card">
                <div className="card-body">
                  {result.model === 'PTH' ? (
                    <>
                      <div className="table-responsive">
                        <MaterialTable
                          columns={[
                            {
                              title: <span>λ<sub>b</sub></span>,
                              field: 'λb',
                              render: rowData => rowData.λb || '-'
                            },
                            {
                              title: <span>N<sub>1</sub></span>,
                              field: 'N1',
                              render: rowData => rowData.N1 || '-'
                            },
                            {
                              title: <span>N<sub>2</sub></span>,
                              field: 'N2',
                              render: rowData => rowData.N2 || '-'
                            },
                            {
                              title: <span> π<sub>C</sub></span>,
                              field: ' πC',
                              render: rowData => rowData.πC || '-'
                            },
                            {
                              title: <span> π<sub>Q</sub></span>,
                              field: ' πQ',
                              render: rowData => rowData.πQ || '-'
                            },
                            {
                              title: <span> π<sub>E</sub></span>,
                              field: ' πE',
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
                              N1: result.parameters.N1,
                              N2: result.parameters.N2,
                              πC: result.parameters.πC,
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
                          λ<sub>p</sub> = λ<sub>b</sub> × [N<sub>1</sub>  ×  π<sub>C</sub> + N<sub>2</sub>(π<sub>C</sub> + 13)] ×  π<sub>Q</sub> ×  π<sub>E</sub>
                        </Typography>
                        <Typography variant="body1" paragraph>Where:</Typography>
                        <ul>
                          <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                          <li>λ<sub>b</sub> = Base failure rate (from technology type)</li>
                          <li>N<sub>1</sub> = Quantity of automated PTHs</li>
                          <li>N<sub>2</sub> = Quantity of hand soldered PTHs</li>
                          <li> π<sub>C</sub> = Complexity factor (based on number of circuit planes)</li>
                          <li> π<sub>Q</sub> = Quality factor</li>
                          <li> π<sub>E</sub> = Environment factor</li>
                        </ul>
                        <Typography variant="body1" paragraph>
                          Calculation Steps:
                        </Typography>
                        <ul>
                          <li>λ<sub>b</sub> = {result.parameters.λb} (for {pwaInputs.technology.type})</li>
                          <li>N<sub>1</sub> + N<sub>2</sub> = {pwaInputs.automatedPTHs} + {pwaInputs.handSolderedPTHs} = {result.parameters.N}</li>
                          <li> π<sub>C</sub> = {result.parameters.πC} (for {pwaInputs.circuitPlanes} circuit planes)</li>
                          <li> π<sub>Q</sub> = {result.parameters.πQ} (for {pwaInputs.quality.quality} quality)</li>
                          <li> π<sub>E</sub> = {result.parameters.πE} (for {pwaInputs.environment.label} environment)</li>
                          <li>λ<sub>p</sub> = {result.parameters.λb} × {result.parameters.N} × {result.parameters.πC} × {result.parameters.πQ} × {result.parameters.πE} = {result.value}</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <Col md={12}>
                        <div className="table-responsive">
                          <MaterialTable
                            columns={[
                              {
                                title: "Package Size (mils)",
                                field: 'packageSize',
                                render: rowData => rowData.packageSize || '-'
                              },
                              {
                                title: "Solder Height (mils)",
                                field: 'solderHeight',
                                render: rowData => rowData.solderHeight || '-'
                              },
                              {
                                title: "Power Dissipation (W)",
                                field: 'powerDissipation',
                                render: rowData => rowData.powerDissipation || '-'
                              },
                              {
                                title: "Thermal Resistance (°C/W)",
                                field: 'thermalResistance',
                                render: rowData => rowData.thermalResistance || '-'
                              },
                              {
                                title: "Design Life (years)",
                                field: 'designLife',
                                render: rowData => rowData.designLife || '-'
                              },
                              {
                                title: "Environmental Correction Factor (ECF)",
                                field: 'ecf',
                                render: rowData => rowData.ecf || '-'
                              },
                              {
                                title: "Failure Rate (λSMT)",
                                field: 'failureRate',
                                render: rowData => rowData?.failureRate?.toFixed(7) || '-',
                              }
                            ]}
                            data={[
                              result?.parameters || {  // Fallback to empty object if result not available
                                packageSize: '-',
                                solderHeight: '-',
                                powerDissipation: '-',
                                thermalResistance: '-',
                                designLife: '-',
                                ecf: '-',
                                failureRate: '-'
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
                      </Col>
                      <div className="formula-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
                        <Typography variant="h6" gutterBottom>
                          Calculation Formula
                        </Typography>
                        <Typography variant="body1" paragraph>
                          λ<sub>SMT</sub> = (ECF / α<sub>SMT</sub>) × number of devices
                        </Typography>
                        <Typography variant="body1" paragraph>
                          Where:
                        </Typography>
                        <ul>
                          <li>ECF = Effective Cumulative Failures (from LC/α<sub>SMT</sub> ratio)</li>
                          <li>α<sub>SMT</sub> = N<sub>i</sub> / CR</li>
                          <li>N<sub>i</sub> = 3.5 × (d / (65 × h) × |(α<sub>S</sub> × ΔT - α<sub>CC</sub> × (ΔT + T<sub>RISE</sub>)) × 10<sup>-6</sup>|)<sup>-2.26</sup> × π<sub>LC</sub></li>
                          <li>d = Distance from center to furthest solder joint (package size / 2)</li>
                          <li>h = Solder joint height</li>
                          <li>α<sub>S</sub> = Substrate TCE</li>
                          <li>α<sub>CC</sub> = Package TCE</li>
                          <li>ΔT = Use environment temperature difference</li>
                          <li>T<sub>RISE</sub> = Temperature rise due to power dissipation (θ<sub>JC</sub> × P)</li>
                          <li>π<sub>LC</sub> = Lead configuration factor</li>
                          <li>CR = Cycling rate</li>
                          <li>LC = Design life in hours (years × 8760)</li>
                        </ul>
                        <Typography variant="body1" paragraph>
                          Calculation Steps:
                        </Typography>
                        <ul>
                          <li>Package size = {smtInputs.packageSize} mils → d = {smtInputs.packageSize / 2} mils</li>
                          <li>Solder height = {smtInputs.solderHeight} mils</li>
                          <li>Power dissipation = {smtInputs.powerDissipation} W</li>
                          <li>Thermal resistance = {smtInputs.thermalResistance} °C/W → T<sub>RISE</sub> = {smtInputs.thermalResistance * smtInputs.powerDissipation} °C</li>
                          <li>Substrate material = {smtInputs.substrateMaterial.material} (α<sub>S</sub> = {smtInputs.substrateMaterial.value})</li>
                          <li>Package material = {smtInputs.packageMaterial.material} (α<sub>CC</sub> = {smtInputs.packageMaterial.value})</li>
                          <li>Environment = {smtInputs.environment.label} (ΔT = {deltaTValuesSMT.find(d => d.env === smtInputs.environment.env)?.value || 'N/A'})</li>
                          <li>Lead configuration = {smtInputs.leadConfig.type} (π<sub>LC</sub> = {smtInputs.leadConfig.factor})</li>
                          <li>Cycling rate = {smtInputs.cyclingRate.rate} cycles/hour</li>
                          <li>N<sub>i</sub> = {result.parameters.Ni} cycles to failure</li>
                          <li>α<sub>SMT</sub> = {result.parameters.Ni} / {smtInputs.cyclingRate.rate} = {result.parameters.αSMT} hours</li>
                          <li>LC/α<sub>SMT</sub> = ({smtInputs.designLife} × 8760) / {result.parameters.αSMT} → ECF = {result.parameters.ECF}</li>
                          <li>λ<sub>SMT</sub> = {result.parameters.ECF} / {result.parameters.αSMT} × {smtInputs.deviceCount} = {result.value}</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Interconnection;