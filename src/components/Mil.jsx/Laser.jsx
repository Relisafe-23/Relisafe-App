import React, { useState } from 'react';
import { Row, Col, Button, Alert, Form } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MaterialTable from 'material-table';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import { CalculatorIcon } from '@heroicons/react/24/outline';
import Paper from '@mui/material/Paper';


const Laser = ({ onCalculate }) => {

  // Lasing Media Failure Rate data
  const lasingMediaRates = [
    { type: 'He/Ne', rate: 84 },
    { type: 'He/Cd', rate: 228 },
    { type: 'Argon', rate: 457 }
  ];

  // Environment Factors
  const environmentFactors = [
    { env: 'Gb', label: 'Ground, Benign', factor: 0.30 },
    { env: 'GF', label: 'Ground, Fixed', factor: 1.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 4.0 },
    { env: 'Ns', label: 'Naval, Sheltered', factor: 3.0 },
    { env: 'NJ', label: 'Naval, Unsheltered', factor: 4.0 },
    { env: 'A/C', label: 'Airborne, Cargo', factor: 4.0 },
    { env: 'A/F', label: 'Airborne, Fighter', factor: 6.0 },
    { env: 'AUC', label: 'Airborne, Uninhabited Cargo', factor: 7.0 },
    { env: 'AUF', label: 'Airborne, Uninhabited Fighter', factor: 9.0 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 5.0 },
    { env: 'SF', label: 'Space, Flight', factor: 0.10 },
    { env: 'MF', label: 'Missile, Flight', factor: 3.0 },
    { env: 'ML', label: 'Missile, Launch', factor: 8.0 },
    { env: 'CL', label: 'Cannon, Launch', factor: 'N/A' }
  ];
  const environmentFactorsCO2 = [
    { env: 'GB', label: 'Ground, Benign', factor: 0.30 },
    { env: 'GF', label: 'Ground, Fixed', factor: 1.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 4.0 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 3.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 4.0 },
    { env: 'AC', label: 'Airborne, Cargo', factor: 4.0 },
    { env: 'AF', label: 'Airborne, Fighter', factor: 6.0 },
    { env: 'AUC', label: 'Airborne, Uninhabited Cargo', factor: 7.0 },
    { env: 'AUF', label: 'Airborne, Uninhabited Fighter', factor: 9.0 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 5.0 },
    { env: 'SF', label: 'Space, Flight', factor: 0.10 },
    { env: 'MF', label: 'Missile, Flight', factor: 3.0 },
    { env: 'ML', label: 'Missile, Launch', factor: 8.0 },
    { env: 'CL', label: 'Cannon, Launch', factor: 'N/A' }
  ];
  const environmentFactorsSolid = [
    { env: 'GB', label: 'Ground, Benign', factor: 0.30 },
    { env: 'GF', label: 'Ground, Fixed', factor: 1.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 4.0 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 3.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 4.0 },
    { env: 'AIC', label: 'Airborne, Inhabited Cargo', factor: 4.0 },
    { env: 'AIF', label: 'Airborne, Inhabited Fighter', factor: 6.0 },
    { env: 'AUC', label: 'Airborne, Uninhabited Cargo', factor: 7.0 },
    { env: 'AUF', label: 'Airborne, Uninhabited Fighter', factor: 9.0 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 5.0 },
    { env: 'SF', label: 'Space, Flight', factor: 0.10 },
    { env: 'MF', label: 'Missile, Flight', factor: 3.0 },
    { env: 'ML', label: 'Missile, Launch', factor: 8.0 },
    { env: 'CL', label: 'Cannon, Launch', factor: 'N/A' }
  ];

  // Lasing Media Failure Rate data
  const lasingMediaRatesCO2 = [
    { current: 10, rate: 240 },
    { current: 20, rate: 930 },
    { current: 30, rate: 1620 },
    { current: 40, rate: 2310 },
    { current: 50, rate: 3000 },
    { current: 100, rate: 6450 },
    { current: 150, rate: 9900 }
  ];

  // Gas Overfill Factors
  const overfillFactors = [
    { overfill: 0, factor: 1.0 },
    { overfill: 25, factor: 0.75 },
    { overfill: 50, factor: 0.50 }
  ];

  // Ballast Factors
  const ballastFactors = [
    { ballast: 0, factor: 1.0 },
    { ballast: 50, factor: 0.58 },
    { ballast: 100, factor: 0.33 },
    { ballast: 150, factor: 0.19 },
    { ballast: 200, factor: 0.11 }
  ];

  // Optical Surface Factors
  const opticalSurfaceFactors = [
    { surfaces: 1, factor: 1 },
    { surfaces: 2, factor: 2 }
  ];
  const couplingCleanlinessFactors = [
    {
      type: "Rigorous cleanliness procedures and trained maintenance personnel. Bellows provided over optical train.",
      factor: 1
    },
    {
      type: "Minimal precautions during opening, maintenance, repair, and testing. Bellows provided over optical train.",
      factor: 30
    },
    {
      type: "Minimal precautions during opening, maintenance, repair, and testing. No bellows provided over optical train.",
      factor: 60
    }
  ];


  // Coupling Failure Rates
  const couplingRates = [
    { type: 'Helium', rate: 0 },
    { type: 'Argon', rate: 6 }
  ];
  const [current, setCurrent] = useState(null);
  const [overfillPercent, setOverfillPercent] = useState(null);
  const [volumeIncrease, setVolumeIncrease] = useState(null);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({
  current: null,
  overfillPercent: null,
  volumeIncrease: null,
  rubyPPS: null,
  ej: null,
  d: null,
  L: null,
  t: null,
  power: null
});
  const [currentComponent, setCurrentComponent] = useState({
    type: "Laser, CO2, Sealed"
  })
  const [showCalculations, setShowCalculations] = useState(false);

  const calculateMediaFailureRateSolid = () => {
    if (input2.mediaType.type === 'Ruby') {
      return 3600 * input2.rubyPPS * (43.5 * input2.F ** 2.52);
    }
    return 0; // ND:YAG
  };
  const calculateTO = () => {
    if (error || overfillPercent === '' || isNaN(overfillPercent)) return 'N/A';
    const percent = parseFloat(overfillPercent);
    return (1 - 0.01 * percent)?.toFixed(4); // Calculates T_O = 1 - 0.01*(%Overfill)
  };
  // Pump types
  const pumpTypes = [
    { value: 'xenon', label: 'Xenon Flashlamp' },
    { value: 'krypton', label: 'Krypton Flashlamp' }
  ];
  // Laser media types
  const mediaTypes = [
    { type: 'ND:YAG', rate: 0, formula: 'Negligible for ND:YAG' },
    {
      type: 'Ruby',
      formula: '(3600)(PPS)[43.5 F^2.52]',
      variables: [
        { name: 'PPS', description: 'Pulses per second', defaultValue: 1 },
        { name: 'F', description: 'Energy density (J/cm²/pulse)', defaultValue: 1 }
      ]
    }
  ];
  const coolingFactors = [
    { type: 'Liquid Cooled', factor: 0.1 },
    { type: 'Air/Gas Cooled', factor: 1.0 }
  ];
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
  // State for form laser CO2 sealed
  const [input, setInput] = useState({
    power: couplingRates[0],
    opticalSurfaces: opticalSurfaceFactors[0],
    environment: environmentFactorsCO2[0]
  });

  const [inputData, setInputData] = useState({
    // tubeCurrent: lasingMediaRatesCO2[0],
    overfill: overfillFactors[0],
    ballast: ballastFactors[0],
    opticalSurfaces: opticalSurfaceFactors[0],
    environment: environmentFactorsCO2[0]
  });
  // State for form laser helium and argon
  const [inputs, setInputs] = useState({
    lasingMedia: lasingMediaRates[0],
    environment: environmentFactors[0],
    coupling: couplingRates[0]
  });
  // State for form laser solid state
  const [input2, setInput2] = useState({
    pumpType: pumpTypes[0],
    mediaType: mediaTypes[0],
    cooling: coolingFactors[0],
    opticalSurfaces: opticalSurfaceFactors[0],
    environment: environmentFactors[0],
    couplingCleanliness: couplingCleanlinessFactors[0],

    // Xenon parameters
    pps: 1,
    ej: 40,
    d: 4,
    L: 2,
    t: 100,

    // Krypton parameters
    P: 4,
    kryptonL: 2,

    // Ruby media parameters
    rubyPPS: '',
    F: 1
  });
  const couplingRates1 = [
    { power: 0.01, rate: 3 },
    { power: 0.1, rate: 30 },
    { power: 1.0, rate: 300 }
  ];

  const handleChange1 = (e) => {
    const value = e.target.value;
    setOverfillPercent(value);
 };
  const handleChange2 = (e) => {
    const value = e.target.value;
    setVolumeIncrease(value);
};
  const handleChange = (e) => {
    const value = e.target.value;
    setCurrent(value);
};
  const calculatePiB = () => {
    if (error || volumeIncrease === '' || isNaN(volumeIncrease)) return 'N/A';
    const percent = parseFloat(volumeIncrease);
    return Math.pow((1 / 3), (percent / 100)).toFixed(4); // Calculates πB = (1/3) * (%Vol.Inc./100)
  };
  const calculateLambda = () => {
    if (error || current === '' || isNaN(current)) return 'N/A';
    const l = parseFloat(current);
    return (69 * l - 450).toFixed(2);
  };
  // const calculatePumpFailureRateSolid = () => {
  //   if (input2.pumpType.value === 'xenon') {
  //     const ej = Math.max(30, input2.ej);
  //     const denominator = input2.d * input2.L * Math.sqrt(input2.t);
  //     const term = Math.pow ((2000 *((ej / denominator) ,8.58)));
  //     return 3600 * input2.pps * term * input2.cooling.factor;
  //   } else { // krypton
  //     const term = Math.pow(10, (0.9 * (input2.P / input2.kryptonL)));
  //     return 625 * term * input2.cooling.factor;
  //   }
  // };
  const calculatePumpFailureRateSolid = () => {
  if (input2.pumpType.value === 'xenon') {
    const ej = Math.max(30, input2.ej); 
    // console.log("Ej..",ej) // Using Ei instead of ej to match formula
    const denominator = input2.d * input2.L * Math.sqrt(input2.t);
    // console.log("denominator...",denominator)
    const term = 2000 * Math.pow((ej / denominator) , 8.58); 
    // console.log("term...",term)
    const calculate = 3600 * input2.pps * term * input2.cooling.factor;
    // console.log("calculate...",calculate)// Corrected Math.pow usage
    return calculate;
  } else { // krypton
    const term = Math.pow(10, (0.9 * (input2.P / input2.kryptonL)));
    const calculatePump = 625 * term * input2.cooling.factor;
      // console.log ("calculatePump..",calculatePump)
    return calculatePump;
  }

};

  // Calculate the failure rate for laser CO2 sealed
  const calculateFailureRateCO2 = () => {
    try {
      // Skip calculation if environment is CL (N/A)
      if (inputData.environment.env === 'CL') {
        setResult({
          value: 'N/A',
          parameters: {
            λMEDIA: calculateLambda(),
            πO: calculateTO(),
            πB: calculatePiB(),
            πOS: inputData.opticalSurfaces?.factor?.toFixed(2),
            πE: 'N/A',
            formula: 'λp = λMEDIA × πO × πB × πE + 10 × πOS × πE'

          }
        });

        setError(null);
        return;
      }
      const mediaRate = calculateLambda();
      const overfillFactor = calculateTO();
      const ballastFactor = calculatePiB();
      const opticalFactor = inputData.opticalSurfaces.factor;
      const envFactor = inputData.environment.factor;

      // Calculate final failure rate using the formula from the image
      const failureRate = (mediaRate * overfillFactor * ballastFactor * envFactor) +
        (10 * opticalFactor * envFactor);

      setResult({
        value: failureRate?.toFixed(2),
        parameters: {
          λMEDIA: mediaRate,
          πO: overfillFactor,
          πB: ballastFactor,
          πOS: opticalFactor?.toFixed(2),
          πE: envFactor?.toFixed(2),
          formula: 'λp = λMEDIA × πO × πB × πE + 10 × πOS × πE'
        }
      });
      setError(null);
      if (onCalculate) {
        onCalculate(failureRate);
        // Pass the calculated failure rate
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };
  // Calculate the failure rate for laser solid state
  const calculateFailureRateSolid = () => {
    try {
      // Skip calculation if environment is CL (N/A)
      if (input2.environment.env === 'CL') {
        setResult({
          value: 'N/A',
          parameters: {
            λPUMP: calculatePumpFailureRateSolid(),
            λMEDIA: calculateMediaFailureRateSolid()?.toFixed(2),
            πOS: input2.opticalSurfaces.factor?.toFixed(2),
            πC: input2.couplingCleanliness.factor?.toFixed(2),
            πE: 'N/A',
            formula: 'λp = (λPUMP + λMEDIA + 16.3 × πC × πOS) × πE'
          }
        });
        setError(null);
        return;
      }

      const pumpRate = calculatePumpFailureRateSolid();
      const mediaRate = calculateMediaFailureRateSolid();
      const opticalFactor = input2.opticalSurfaces.factor;
      const couplingCleanliness = input2.couplingCleanliness.factor;
      const envFactor = input2.environment.factor;

      // Calculate final failure rate with πC included
      const failureRate = (pumpRate + mediaRate + (16.3 * couplingCleanliness * opticalFactor)) * envFactor;

      setResult({
        value: failureRate?.toFixed(2),
        parameters: {
          λPUMP: pumpRate?.toFixed(2),
          λMEDIA: mediaRate?.toFixed(2),
          πOS: opticalFactor?.toFixed(2),
          πC: couplingCleanliness?.toFixed(2),
          πE: envFactor?.toFixed(2),
          formula: 'λp = (λPUMP + λMEDIA + 16.3 × πC × πOS) × πE'
        }
      });
      setError(null);
      if (onCalculate) {
        onCalculate(failureRate);
        // Pass the calculated failure rate
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };
  // Calculate the failure rate for laser CO2 flowing
  const calculateCouplingRate = (power) => {
    return 300 * power; // λCOUPLING = 300P
  };

  const calculateFailureRate1 = () => {
    try {
      // Skip calculation if environment is CL (N/A)
      if (input.environment.env === 'CL') {
        setResult({
          value: 'N/A',
          parameters: {
            λCOUPLING: input.power.rate?.toFixed(2),
            πOS: input.opticalSurfaces.factor?.toFixed(2),
            πE: 'N/A',
            formula: 'λp = λCOUPLING × πOS × πE'
          }
        });
        setError(null);
        return;
      }

      const couplingRate = input.power.rate;
      const opticalFactor = input.opticalSurfaces.factor;
      const envFactor = input.environment.factor;

      // Calculate final failure rate using the formula from the image
      const failureRate = couplingRate * opticalFactor * envFactor;

      setResult({
        value: failureRate?.toFixed(2),
        parameters: {
          λCOUPLING: couplingRate?.toFixed(2),
          πOS: opticalFactor?.toFixed(2),
          πE: envFactor?.toFixed(2),
          formula: 'λp = λCOUPLING × πOS × πE'
        }
      });
      setError(null);
      if (onCalculate) {
        onCalculate(failureRate);
        // Pass the calculated failure rate
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };
  // Calculate the failure rate for laser helium and argon
  const calculateFailureRate = () => {
    try {
      const lasingRate = inputs.lasingMedia.rate;
      const couplingRate = inputs.coupling.rate;
      const envFactor = inputs.environment.factor;

      // Calculate final failure rate using the formula from the image
      const failureRate = (lasingRate * envFactor) + (couplingRate * envFactor);

      setResult({
        value: failureRate?.toFixed(2),
        parameters: {
          λMEDIA: lasingRate?.toFixed(2),
          λCOUPLING: couplingRate?.toFixed(2),
          πE: envFactor?.toFixed(2),
          formula: 'λp = λMEDIA × πE + λCOUPLING × πE'
        }
      });
      setError(null);
      if (onCalculate) {
        onCalculate(failureRate);
        // Pass the calculated failure rate
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };
  const validateCurrent = (value) => {
  if (value === '' || isNaN(value)) return 'Current is required';
  if (value < 10 || value > 150) return 'Current must be between 10 and 150 mA';
  return null;
};
const validateOverfillPercent = (value) => {
  if (value === '' || isNaN(value)) return 'Overfill % is required';
  if (value < 0 || value > 100) return 'Overfill % must be between 0 and 100';
  return null;
};
const validateVolumeIncrease = (value) => {
  if (value === '' || isNaN(value)) return 'Volume increase is required';
  if (value < 0) return 'Volume increase cannot be negative';
  return null;
};
  return (
    <>
      <h2 className="text-center mb-4"> Lasers</h2>
      <Row>
        <Col md={4}>
          <div className="form-group" >
            <label>
              Part Type:</label>
            <Select
              styles={customStyles}
              name="type"
              placeholder="Select"
              value={currentComponent.type ?
                { value: currentComponent.type, label: currentComponent.type } : null}
              onChange={(selectedOption) => {
                setCurrentComponent({ ...currentComponent, type: selectedOption.value });
              }}
              options={[
                { value: "Laser, Helium and Argon", label: "Laser, Helium and Argon" },
                { value: "Laser, CO2, Sealed", label: "Laser CO2 Sealed" },
                { value: "Laser, CO2,Flowing", label: "Laser, CO2,Flowing" },
                { value: "Laser, Solid State,ND:YAG and Ruby Rod", label: "Laser, Solid State,ND:YAG and Ruby Rod" }
              ]}
            />
          </div>
        </Col>
        {currentComponent.type === "Laser, CO2, Sealed" && (
          <>
            <Col md={4}>
              {/* Optical Surfaces */}
              <div className="form-group">
                <label>Active Optical Surfaces (π<sub>OS</sub>):</label>
                <Select
                  styles={customStyles}
                  options={opticalSurfaceFactors.map(item => ({
                    value: item,
                    label: `${item.surfaces} (πOS = ${item.factor})`
                  }))}
                  value={{
                    value: inputData.opticalSurfaces,
                    label: `${inputData.opticalSurfaces.surfaces} (πOS = ${inputData.opticalSurfaces.factor})`
                  }}
                  onChange={(selectedOption) => setInputData(prev => ({
                    ...prev,
                    opticalSurfaces: selectedOption.value
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
                  options={environmentFactorsCO2.map(item => ({
                    value: item,
                    label: `${item.label} (πE = ${item.factor})`
                  }))}
                  value={{
                    value: inputData.environment,
                    label: `${inputData.environment.label} (πE = ${inputData.environment.factor})`
                  }}
                  onChange={(selectedOption) => setInputData(prev => ({
                    ...prev,
                    environment: selectedOption.value
                  }))}
                />
              </div>
            </Col>
          </>
        )}
        {currentComponent.type === "Laser, Helium and Argon" && (
          <>

            <Col md={4}>
              {/* Lasing Media Selection */}
              <div className="form-group">
                <label>Lasing Media (λ<sub>MEDIA</sub>):</label>
                <Select
                  styles={customStyles}
                  options={lasingMediaRates.map(item => ({
                    value: item,
                    label: `${item.type} (λMEDIA = ${item.rate})`
                  }))}
                  value={{
                    value: inputs.lasingMedia,
                    label: `${inputs.lasingMedia.type} (λMEDIA = ${inputs.lasingMedia.rate})`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    lasingMedia: selectedOption.value
                  }))}
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Coupling Type Selection */}
              <div className="form-group">
                <label>Coupling Type (λ<sub>COUPLING</sub>):</label>
                <Select
                  styles={customStyles}
                  options={couplingRates.map(item => ({
                    value: item,
                    label: `${item.type} (λCOUPLING = ${item.rate})`
                  }))}
                  value={{
                    value: inputs.coupling,
                    label: `${inputs.coupling.type} (λCOUPLING = ${inputs.coupling.rate})`
                  }}
                  onChange={(selectedOption) => setInputs(prev => ({
                    ...prev,
                    coupling: selectedOption.value
                  }))}
                />
              </div>
            </Col>
          </>
        )}
        {currentComponent.type === "Laser, CO2,Flowing" && (
          <>
            <Col md={4}>
              {/* Optical Surfaces */}
              <div className="form-group">
                <label>Active Optical Surfaces (π<sub>OS</sub>):</label>
                <Select
                  styles={customStyles}
                  options={opticalSurfaceFactors.map(item => ({
                    value: item,
                    label: `${item.surfaces} (πOS = ${item.factor})`
                  }))}
                  value={{
                    value: input.opticalSurfaces,
                    label: `${input.opticalSurfaces.surfaces} (πOS = ${input.opticalSurfaces.factor})`
                  }}
                  onChange={(selectedOption) => setInput(prev => ({
                    ...prev,
                    opticalSurfaces: selectedOption.value
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
                  options={environmentFactorsCO2.map(item => ({
                    value: item,
                    label: `${item.label} (πE = ${item.factor})`
                  }))}
                  value={{
                    value: input.environment,
                    label: `${input.environment.label} (πE = ${input.environment.factor})`
                  }}
                  onChange={(selectedOption) => setInput(prev => ({
                    ...prev,
                    environment: selectedOption.value
                  }))}
                />
              </div>
            </Col>
          </>
        )}
        {currentComponent.type === "Laser, Solid State,ND:YAG and Ruby Rod" && (
          <>
            <Col md={4}>
              {/* Optical Surfaces */}
              <div className="form-group">
                <label>Active Optical Surfaces (π<sub>OS</sub>):</label>
                <Select
                  styles={customStyles}
                  options={opticalSurfaceFactors.map(item => ({
                    value: item,
                    label: `${item.surfaces} (πOS = ${item.factor})`
                  }))}
                  value={{
                    value: input2.opticalSurfaces,
                    label: `${input2.opticalSurfaces.surfaces} (πOS = ${input2.opticalSurfaces.factor})`
                  }}
                  onChange={(selectedOption) => setInput2(prev => ({
                    ...prev,
                    opticalSurfaces: selectedOption.value
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
                  options={environmentFactorsSolid.map(item => ({
                    value: item,
                    label: `${item.label} (πE = ${item.factor})`
                  }))}
                  value={{
                    value: input2.environment,
                    label: `${input2.environment.label} (πE = ${input2.environment.factor})`
                  }}
                  onChange={(selectedOption) => setInput2(prev => ({
                    ...prev,
                    environment: selectedOption.value
                  }))}
                />
              </div>
            </Col>
          </>
        )}
      </Row>
      {currentComponent.type === "Laser, Helium and Argon" && (
        <>
          <Row>
            <Col md={4}>
              {/* Environment Factor */}
              <div className="form-group">
                <label>Environment (π<sub>E</sub>):</label>
                <Select
                  styles={customStyles}
                  options={environmentFactors.map(item => ({
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
                              title: <span>λ<sub>MEDIA</sub></span>,
                              field: 'λMEDIA',
                              render: rowData => rowData.λMEDIA || '-'
                            },
                            {
                              title: <span>λ<sub>COUPLING</sub></span>,
                              field: 'λCOUPLING',
                              render: rowData => rowData.λCOUPLING || '-'
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
                              λMEDIA: result.parameters.λMEDIA,
                              λCOUPLING: result.parameters.λCOUPLING,
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
                          λ<sub>p</sub> = λ<sub>MEDIA</sub> × π<sub>E</sub> + λ<sub>COUPLING</sub> × π<sub>E</sub>
                        </Typography>
                        <Typography variant="body1" paragraph>Where:</Typography>
                        <ul>
                          <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                          <li>λ<sub>MEDIA</sub> = Lasing media failure rate</li>
                          <li>λ<sub>COUPLING</sub> = Coupling failure rate</li>
                          <li>π<sub>E</sub> = Environment factor</li>
                        </ul>
                        <Typography variant="body1" paragraph>
                          Calculation Steps:
                        </Typography>
                        <ul>
                          <li>λ<sub>MEDIA</sub> = {result.parameters.λMEDIA} (for {inputs.lasingMedia.type} media)</li>
                          <li>λ<sub>COUPLING</sub> = {result.parameters.λCOUPLING} (for {inputs.coupling.type} coupling)</li>
                          <li>π<sub>E</sub> = {result.parameters.πE} (for {inputs.environment.label} environment)</li>
                          <li>λ<sub>p</sub> = ({result.parameters.λMEDIA} × {result.parameters.πE}) + ({result.parameters.λCOUPLING} × {result.parameters.πE}) = {result.value}</li>
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
      <>

        {currentComponent.type === "Laser, CO2, Sealed" && (
          <>
            <Row className="mb-3">

              <Col md={4}>
                <div className="form-group">
                  <label htmlFor="tube-current">Tube Current (mA) λ<sub>MEDIA</sub>:</label>
                  <input
                    id="tube-current"
                    type="number"
                    value={current}
                    onChange={handleChange}
                    min="10"
                    max="150"
                    step="0.1"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    placeholder="Enter value between 10 and 150"
                  />

                  <div className="mt-2 form-group">
                    <label>Calculated λ<sub>MEDIA</sub>: {calculateLambda()} </label>
                  </div>

                  <div className="form-text">
                    Valid range: 10 ≤ l ≤ 150 mA
                  </div>
                </div>
              </Col>
              <Col md={4}>
                {/* CO₂ Overfill Factor */}
                <div className="form-group">
                  <label htmlFor="overfill-percent">% Gas Overfill Factor (π<sub>O</sub>):</label>
                  <input
                    id="overfill-percent"
                    type="number"
                    value={overfillPercent}
                    onChange={handleChange1}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    placeholder="Enter percentage (0-100)"
                  />

                  <div className="mt-2 form-group">
                    <label> Calculated T<sub>O</sub>: {calculateTO()}</label>
                  </div>

                  <div className="form-text">
                    Formula: T<sub>O</sub> = 1 - 0.01 × (% Overfill)
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label htmlFor="volume-increase"> Ballast Factor (% Volume Increase)  π<sub>B</sub> :</label>
                  <input
                    id="volume-increase"
                    type="number"
                    value={volumeIncrease}
                    onChange={handleChange2}
                    min="0"
                    step="0.1"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    placeholder="Enter percentage volume increase"
                  />

                  <div className="mt-2 form-group">
                    <label>Calculated π<sub>B</sub>:{calculatePiB()}</label>
                  </div>

                  <div className="form-text">
                    Formula: π<sub>B</sub> = (1/3)<sup>(% Volume Increase/100)</sup>
                  </div>
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
                onClick={calculateFailureRateCO2}
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
                    {result.value === 'N/A' ? 'N/A' : `${result.value} failures/10^6 hours`}
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
                            columns={[
                              {
                                title: <span>λ<sub>MEDIA</sub></span>,
                                field: 'λMEDIA',
                                render: rowData => rowData.λMEDIA || '-'
                              },
                              {
                                title: <span>π<sub>O</sub></span>,
                                field: 'πO',
                                render: rowData => rowData.πO || '-'
                              },
                              {
                                title: <span>π<sub>B</sub></span>,
                                field: 'πB',
                                render: rowData => rowData.πB || '-'
                              },
                              {
                                title: <span>π<sub>OS</sub></span>,
                                field: 'πOS',
                                render: rowData => rowData.πOS || '-'
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
                                λMEDIA: result.parameters.λMEDIA,
                                πO: result.parameters.πO,
                                πB: result.parameters.πB,
                                πOS: result.parameters.πOS,
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
                            λ<sub>p</sub> = λ<sub>MEDIA</sub> × π<sub>O</sub> × π<sub>B</sub> × π<sub>E</sub> + 10 × π<sub>OS</sub> × π<sub>E</sub>
                          </Typography>
                          <Typography variant="body1" paragraph>Where:</Typography>
                          <ul>
                            <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup>Hours)</li>
                            <li>λ<sub>MEDIA</sub> = Lasing media failure rate (based on tube current)</li>
                            <li>π<sub>O</sub> = CO₂ overfill factor</li>
                            <li>π<sub>B</sub> = Ballast factor</li>
                            <li>π<sub>OS</sub> = Optical surface factor</li>
                            <li>π<sub>E</sub> = Environment factor</li>
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

        {currentComponent.type === "Laser, CO2,Flowing" && (
          <>
            <Row className="mb-3">
              <Col md={4}>
                {/* Power Selection */}
                <div className="form-group">
                  <label>Power (KW) (λ<sub>COUPLING</sub>):</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      value={input.power.power || ''}
                      onChange={(e) => {
                        const powerValue = parseFloat(e.target.value);
                        // Validate power range (0.01 ≤ P ≤ 1.0)
                        const validatedPower = Math.min(Math.max(powerValue, 0.01), 1.0);
                        setInput(prev => ({
                          ...prev,
                          power: {
                            power: isNaN(powerValue) ? 0 : validatedPower,
                            rate: isNaN(powerValue) ? 0 : calculateCouplingRate(validatedPower)
                          }
                        }));
                      }}
                      min="0.01"
                      max="1.0"
                      step="0.01"
                      placeholder="Enter power (0.01-1.0 KW)"
                    />
                  </div>

                </div>
              </Col>
              <>
                <span>
                  λ<sub>COUPLING</sub> = {input.power.rate || ''}
                </span>
              </>
              {input.power.power > 1.0 || input.power.power < 0.01 ? (
                <div className="text-danger small">
                  Power must be between 0.01 and 1.0 KW
                </div>
              ) : null}

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
                onClick={calculateFailureRate1}
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
                    {result.value === 'N/A' ? 'N/A' : `${result.value} failures/10^6 hours`}
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
                            columns={[
                              {
                                title: <span>λ<sub>COUPLING</sub></span>,
                                field: 'λCOUPLING',
                                render: rowData => rowData.λCOUPLING || '-'
                              },
                              {
                                title: <span>π<sub>OS</sub></span>,
                                field: 'πOS',
                                render: rowData => rowData.πOS || '-'
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
                                λCOUPLING: result.parameters.λCOUPLING,
                                πOS: result.parameters.πOS,
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
                            λ<sub>p</sub> = λ<sub>COUPLING</sub> × π<sub>OS</sub> × π<sub>E</sub>
                          </Typography>
                          <Typography variant="body1" paragraph>Where:</Typography>
                          <ul>
                            <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6 </sup>Hours)</li>
                            <li>λ<sub>COUPLING</sub> = Coupling failure rate (based on power)</li>
                            <li>π<sub>OS</sub> = Optical surface factor</li>
                            <li>π<sub>E</sub> = Environment factor</li>
                          </ul>
                          <Typography variant="body1" paragraph>
                            Calculation Steps:
                          </Typography>
                          <ul>
                            <li>λ<sub>COUPLING</sub> = {result.parameters.λCOUPLING} (for {input.power.power} KW power)</li>
                            <li>π<sub>OS</sub> = {result.parameters.πOS} (for {input.opticalSurfaces.surfaces} active optical surfaces)</li>
                            <li>π<sub>E</sub> = {result.parameters.πE} (for {input.environment.label} environment)</li>
                            {result.value === 'N/A' ? (
                              <li>Calculation not applicable (N/A) for Cannon Launch environment</li>
                            ) : (
                              <li>λ<sub>p</sub> = {result.parameters.λCOUPLING} × {result.parameters.πOS} × {result.parameters.πE} = {result.value}</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </>
            )}

            {/* Additional Information Section */}
          </>
        )}

        {currentComponent.type === "Laser, Solid State,ND:YAG and Ruby Rod" && (
          <>
            <Row className="mb-3">
              <Col md={4}>
                {/* Pump Type Selection */}
                <div className="form-group">
                  <label>Pump Type:</label>
                  <Select
                    styles={customStyles}
                    options={pumpTypes}
                    value={input2.pumpType}
                    onChange={(selectedOption) => setInput2(prev => ({
                      ...prev,
                      pumpType: selectedOption
                    }))}
                  />
                </div>
              </Col>

              <Col md={4}>
                {/* Laser Media Type */}
                <div className="form-group">
                  <label>Laser Media (λ<sub>MEDIA</sub>):</label>
                  <Select
                    styles={customStyles}
                    options={mediaTypes.map(item => ({
                      value: item,
                      label: `${item.type} (${item.formula})`
                    }))}
                    value={{
                      value: input2.mediaType,
                      label: `${input2.mediaType.type} (${input2.mediaType.formula})`
                    }}
                    onChange={(selectedOption) => setInput2(prev => ({
                      ...prev,
                      mediaType: selectedOption.value
                    }))}
                  />
                </div>
              </Col>

              <Col md={4}>
                {/* Cooling Factor */}
                <div className="form-group">
                  <label>Cooling (π<sub>COOL</sub>):</label>
                  <Select
                    styles={customStyles}
                    options={coolingFactors.map(item => ({
                      value: item,
                      label: `${item.type} (πCOOL = ${item.factor})`
                    }))}
                    value={{
                      value: input2.cooling,
                      label: `${input2.cooling.type} (πCOOL = ${input2.cooling.factor})`
                    }}
                    onChange={(selectedOption) => setInput2(prev => ({
                      ...prev,
                      cooling: selectedOption.value
                    }))}
                  />
                </div>

              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <div className="form-group">
                  <label>Coupling Cleanliness Factor (π<sub>C</sub>):</label>
                  <Select
                    styles={customStyles}
                    options={couplingCleanlinessFactors.map(item => ({
                      value: item,
                      label: `${item.type} (πC = ${item.factor})`
                    }))}
                    value={{
                      value: input2.couplingCleanliness,
                      label: `${input2.couplingCleanliness.type} (πC = ${input2.couplingCleanliness.factor})`
                    }}
                    onChange={(selectedOption) => setInput2(prev => ({
                      ...prev,
                      couplingCleanliness: selectedOption.value
                    }))}
                  />
                </div>
              </Col>
              {input2.mediaType.type === 'Ruby' && (
                <>
                  <Col md={4}>
                    <div className="form-group">
                      <label>PPS (pulses/sec) for (λ<sub>MEDIA</sub>):</label>
                      <input
                        type="number"
                        className="form-group"
                        min="1"
                        value={input2.rubyPPS}
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
                        onChange={(e) => setInput2(prev => ({
                          ...prev,
                          rubyPPS: parseFloat(e.target.value)
                        }))}
                      />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>F (J/cm²/pulse):</label>
                      <input
                        type="number"
                        className="form-group"
                        min="0.1"
                        value={input2.F}
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
                        onChange={(e) => setInput2(prev => ({
                          ...prev,
                          F: parseFloat(e.target.value) || 1
                        }))}
                      />
                    </div>
                  </Col>
                </>
              )}

              {/* Xenon Parameters */}
              {input2.pumpType.value === 'xenon' && (
                <>
                  <Col md={4}>
                    <div className="form-group">
                      <label>PPS (pulses/sec) for (λ<sub>PUMP</sub>):</label>
                      <input
                        type="number"
                        className="form-control"  
                        min="1"
                        max="20"
                        step="1" 
                        value={input2.pps } 
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
                        onChange={(e) => {
                          let value = parseFloat(e.target.value);
                          // Validate range (1-20)
                          if (isNaN(value));  // Default to 1 if invalid
                          // value = Math.max(1, Math.min(20, value));  // Clamp between 1 and 20
                          setInput2(prev => ({
                            ...prev,
                            pps: value
                          }));
                        }}
                        onBlur={(e) => {  // Additional validation when field loses focus
                          if (!e.target.value || e.target.value < 1) {
                            setInput2(prev => ({
                              ...prev,
                              pps: 1
                            }));
                          }
                        }}
                      />
                      {input2.pps < 1 || input2.pps > 20 ? (
                        <div className="text-danger small mt-1">
                          PPS must be between 1 and 20 pulses per second
                        </div>
                      ) : null}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>E<sub>j</sub> (Joules):</label>
                      <input
                        type="number"
                        className="form-group"
                        min="30"
                        value={input2.ej}
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
                        onChange={(e) => setInput2(prev => ({
                          ...prev,
                          ej: Math.max(30, parseFloat(e.target.value)) || 30
                        }))}
                      />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>d (mm):</label>
                      <input
                        type="number"
                        className="form-group"
                        min="1"
                        value={input2.d}
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
                        onChange={(e) => setInput2(prev => ({
                          ...prev,
                          d: parseFloat(e.target.value) || 4
                        }))}
                      />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>L (inches):</label>
                      <input
                        type="number"
                        className="form-group"
                        min="1"
                        value={input2.L}
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
                        onChange={(e) => setInput2(prev => ({
                          ...prev,
                          L: parseFloat(e.target.value) || 2
                        }))}
                      />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>t (μs):</label>
                      <input
                        type="number"
                        className="form-group"
                        min="1"
                        value={input2.t}
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
                        onChange={(e) => setInput2(prev => ({
                          ...prev,
                          t: parseFloat(e.target.value) || 100
                        }))}
                      />
                    </div>
                  </Col>
                </>
              )}

              {/* Krypton Parameters */}
              {input2.pumpType.value === 'krypton' && (
                <>
                  <Col md={4}>
                    <div className="form-group">
                      <label>P (kW):</label>
                      <input
                        type="number"
                        className="form-group"
                        min="0.1"
                        value={input2.P}
                        onChange={(e) => setInput2(prev => ({
                          ...prev,
                          P: parseFloat(e.target.value) || 4
                        }))}
                      />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>L (inches):</label>
                      <input
                        type="number"
                        className="form-group"
                        min="1"
                        value={input2.kryptonL}
                        onChange={(e) => setInput2(prev => ({
                          ...prev,
                          kryptonL: parseFloat(e.target.value) || 2
                        }))}
                      />
                    </div>
                  </Col>
                </>
              )}
            </Row>
            {/* Ruby Media Parameters */}
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
                onClick={calculateFailureRateSolid}
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
                    {result.value === 'N/A' ? 'N/A' : `${result.value} failures/10^6 hours`}
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
                            columns={[
                              {
                                title: <span>λ<sub>PUMP</sub></span>,
                                field: 'λPUMP',
                                render: rowData => rowData.λPUMP || '-'
                              },
                              {
                                title: <span>λ<sub>MEDIA</sub></span>,
                                field: 'λMEDIA',
                                render: rowData => rowData.λMEDIA || '-'
                              },
                              {
                                title: <span>π<sub>OS</sub></span>,
                                field: 'πOS',
                                render: rowData => rowData.πOS || '-'
                              },
                              {
                                title: <span>π<sub>E</sub></span>,
                                field: 'πE',
                                render: rowData => rowData.πE || '-'
                              },
                              {
                                title: <span>π<sub>C</sub></span>,
                                field: 'πC',
                                render: rowData => rowData.πC || '-'
                              },
                              {
                                title: "Failure Rate",
                                field: 'λp',
                                render: rowData => rowData.λp || '-',
                              }
                            ]}
                            data={[
                              {
                                λPUMP: result.parameters.λPUMP,
                                λMEDIA: result.parameters.λMEDIA,
                                πOS: result.parameters.πOS,
                                πE: result.parameters.πE,
                                πC: result.parameters.πC,
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
                            λ<sub>p</sub> = (λ<sub>PUMP</sub> + λ<sub>MEDIA</sub> + 16.3 × π<sub>C</sub> × π<sub>OS</sub>) × π<sub>E</sub>
                          </Typography>
                          <Typography variant="body1" paragraph>Where:</Typography>
                          <ul>
                            <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>
                            <li>λ<sub>PUMP</sub> = Pump failure rate (Xenon or Krypton)</li>
                            <li>λ<sub>MEDIA</sub> = Media failure rate (ND:YAG or Ruby)</li>
                            <li>π<sub>OS</sub> = Optical surface factor</li>
                            <li>π<sub>E</sub> = Environment factor</li>
                            <li>π<sub>C</sub> = Coupling Cleanliness factor</li>
                          </ul>
                          <Typography variant="body1" paragraph>
                            Calculation Steps:
                          </Typography>
                          <ul>
                            <li>λ<sub>PUMP</sub> = {result.parameters.λPUMP} (for {input2.pumpType.label})</li>
                            <li>λ<sub>MEDIA</sub> = {result.parameters.λMEDIA} (for {input2.mediaType.type} media)</li>
                            <li>π<sub>OS</sub> = {result.parameters.πOS} (for {input2.opticalSurfaces.surfaces} active optical surfaces)</li>
                            <li>π<sub>E</sub> = {result.parameters.πE} (for {input2.environment.label} environment)</li>
                            <li>π<sub>C</sub> = {result.parameters.πC} (for {input2.couplingCleanliness.label}coupling)</li>

                            {result.value === 'N/A' ? (
                              <li>Calculation not applicable (N/A) for Cannon Launch environment</li>
                            ) : (
                              <li>λ<sub>p</sub> = ({result.parameters.λPUMP} + {result.parameters.λMEDIA} + 16.3 × {result.parameters.πC} × {result.parameters.πOS}) × {result.parameters.πE} = {result.value}</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </>
            )}

            {/* Additional Information Section */}

          </>
        )}

        {/* Additional Information Section */}

      </>


    </>
  );
}


export default Laser;