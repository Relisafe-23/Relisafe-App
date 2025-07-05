import React, { useState, useEffect, useMemo } from 'react';
import Select from "react-select";
import {
  calculateMicrocircuitsAndMicroprocessorsFailureRate,
  calculateSawDeviceFailureRate,
  calculatePiT,
  getEnvironmentFactor,
  getQualityFactor,
  getFailureRate,
  getBValueForTemp,
  calculateGateArrayC1,
  getEnvironmentalOptions,
  calculateLearningFactor,
  BASE_FAILURE_RATE
} from '../Calculation.js';
import { createTheme } from "@mui/material";
import { Button, Container, Row, Col } from 'react-bootstrap';
import { Alert } from "@mui/material";
import Hybridgate from "./MicrocircuitHybrid/Hybridgate.jsx"
import HybridVhsic from './MicrocircuitHybrid/HybridVhsic.jsx'
import Hybridmemories from './MicrocircuitHybrid/Hybridmemories.jsx';
import HybridMagnetic from './MicrocircuitHybrid/HybridMagnetic.jsx';
import HybridGaAs from './MicrocircuitHybrid/HybridGaAs.jsx';
import HybridSaw from './MicrocircuitHybrid/HybridSaw.jsx';
const Microcircuits = ({
  setSelectedComponent,
  onCalculate,
  handleCalculateGate,
  handleCalculateSawDevice,
  handleCalculateMemories,
  handleCalculateVhsic,
  handleCalculateGaAs,
  handleCalculateBubble
}) => {
  const [components, setComponents] = useState([{
    id: Date.now(),
    type: '',
    devices: '',
    complexFailure: '',
    gateCount: '',
    temperature: 25,
    environment: '',
    data: "microprocessorData",
    quality: 'M',
    quantity: 1,
    microprocessorData: "",
    technology: '',
    complexity: '',
    application: '',
    packageType: '',
    pinCount: '',
    yearsInProduction: '',
    memoryTemperature: 45,
    techTemperatureB2: 25,
    techTemperatureB1: 25,
    memorySizeB1: 1024,
    memorySizeB2: 1024,
    memoryTech: "Flotox",
    B1: 0.79,
    B2: null,
    calculatedPiT: 1.2,
    piL: 1.0,
    basePiT: 0.1,
    failureRate: 0,
    totalFailureRate: 0
  }]);
  const [showCalculations, setShowCalculations] = useState(false);
  const [component, setComponent] = useState([]);
  const [errors, setErrors] = useState({
    environment: '',
    quality: '',
    applicationFactor: '',
    devices: '',
    complexFailure: '',
    gateCount: '',
    pinCount: '',
    yearsInProduction: '',
    technology: '',
    temperature: ''
  });

   const [failureRates, setFailureRates] = useState({
    gate: null,
    vhsic: null,
    memories: null,
    saw: null,
    magnetic: null,
    gaAs: null
  });
 
  const [totalFailureRate, setTotalFaiureRate] = useState([]);
  
  
  let totalSysFailureRate = [];
  const dieComplexityRates = [
    {
      type: ' MOS-ROM',
      rates: [
        { size: 'Up to 16K', mos: 0.00065 },
        { size: '16K < B ≤ 64K', mos: 0.0013 },
        { size: '64K < B ≤ 256K', mos: 0.0026 },
        { size: '256K < B ≤ 1M', mos: 0.0052 }
      ]
    },
    {
      type: 'MOS-PROM/UVEPROM/EEPROM/EAPROM',
      rates: [
        { size: 'Up to 16K', mos: 0.00085 },
        { size: '16K < B ≤ 64K', mos: 0.0017 },
        { size: '64K < B ≤ 256K', mos: 0.0034 },
        { size: '256K < B ≤ 1M', mos: 0.0068 }
      ]
    },
    {
      type: 'MOS-DRAM',
      rates: [
        { size: 'Up to 16K', mos: 0.0013 },
        { size: '16K < B ≤ 64K', mos: 0.0025 },
        { size: '64K < B ≤ 256K', mos: 0.0050 },
        { size: '256K < B ≤ 1M', mos: 0.010 }
      ]
    },
    {
      type: 'MOS-SRAM (MOS & BIMOS)',
      rates: [
        { size: 'Up to 16K', mos: 0.0078 },
        { size: '16K < B ≤ 64K', mos: 0.016 },
        { size: '64K < B ≤ 256K', mos: 0.031 },
        { size: '256K < B ≤ 1M', mos: 0.062 }
      ]
    },

    {
      type: 'Bipolar-(ROM & PROM)',
      rates: [
        { size: 'Up to 16K', mos: 0.0094 },
        { size: '16K < B ≤ 64K', mos: 0.019 },
        { size: '64K < B ≤ 256K', mos: 0.038 },
        { size: '256K < B ≤ 1M', mos: 0.075 }
      ]
    },
    {
      type: 'Bipolar-(SRAM)',
      rates: [
        { size: 'Up to 16K', mos: 0.0052 },
        { size: '16K < B ≤ 64K', mos: 0.011 },
        { size: '64K < B ≤ 256K', mos: 0.021 },
        { size: '256K < B ≤ 1M', mos: 0.042 }
      ]
    }

  ];

  const [currentComponent, setCurrentComponent] = useState({
    type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
    temperature: 25,
    devices: "bipolarData",
    complexFailure: "digital",
    gateenvironment: '',
    memoryenvironment: '',
    hybridenvironment: '',
    sawDeviceenvironment: '',
    Vhsicenvironment: '',
    gaAsenvironment: '',
    bubbleenvironment: '',
    data: "microprocessorData",
    quality: 'M',
    quantity: null,
    microprocessorData: "",
    gateCount: 1000,
    technology: '',
    complexity: '',
    application: '',
    packageType: '',
    pinCount: '',
    yearsInProduction: '',
    quality: '',
    gatetemperature: null,
    Vhsictemperature: null,
    gaAstemperature: null,
    memorytemperature: null,
    techTemperatureB2: 25,
    techTemperatureB1: 25,
    memorySizeB1: 1024,
    memorySizeB2: 1024,
    memoryTech: "Flotox",
    technology: "Digital MOS",
    B1: 0.79,
    B2: null,
    calculatedPiT: 1.2,


    piL: 1.0,
    // piQ: 1.0,
    basePiT: 0.1,
    calculatedPiT: null
  });

  const [error, setError] = useState(null);

  const eccOptions = [
    { value: 'none', label: 'No On-Chip ECC', factor: 1.0 },
    { value: 'hamming', label: 'On-Chip Hamming Code', factor: 0.72 },
    { value: 'redundant', label: 'Two-Needs-One Redundant Cell Approach', factor: 0.68 }
  ];

  // A1 Factors for λCycle Calculation
  const a1Factors = [
    { cycles: 'Up to 100', flotox: 0.00070, texturedPoly: 0.0097 },
    { cycles: '100 < C ≤ 200', flotox: 0.0014, texturedPoly: 0.014 },
    { cycles: '200 < C ≤ 500', flotox: 0.0034, texturedPoly: 0.023 },
    { cycles: '500 < C ≤ 1K', flotox: 0.0068, texturedPoly: 0.033 },
    { cycles: '1K < C ≤ 3K', flotox: 0.020, texturedPoly: 0.061 },
    { cycles: '3K < C ≤ 7K', flotox: 0.049, texturedPoly: 0.14 },
    { cycles: '7K < C ≤ 15K', flotox: 0.10, texturedPoly: 0.30 },
    { cycles: '15K < C ≤ 20K', flotox: 0.14, texturedPoly: 0.30 },
    { cycles: '20K < C ≤ 30K', flotox: 0.20, texturedPoly: 0.30 },
    { cycles: '30K < C ≤ 100K', flotox: 0.68, texturedPoly: 0.30 },
    { cycles: '100K < C ≤ 200K', flotox: 1.3, texturedPoly: 0.30 },
    { cycles: '200K < C ≤ 400K', flotox: 2.7, texturedPoly: 0.30 },
    { cycles: '400K < C ≤ 500K', flotox: 3.4, texturedPoly: 0.30 }
  ];
  // A2 Factors for λCycle Calculation
  const a2Factors = [
    { cycles: 'Up to 300K', value: 0 },
    { cycles: '300K < C ≤ 400K', value: 1.1 },
    { cycles: '400K < C ≤ 500K', value: 2.3 }
  ];
  // Package Failure Rate (C2) data
  const packageRates = [
    {
      type: 'Hermetic: DIPs w/Solder or Weld Seal, PGA, SMT',
      formula: '2.8e-4 * (Np)^1.08',
      rates: [
        { pins: 3, rate: 0.00092 },
        { pins: 4, rate: 0.0013 },
        { pins: 6, rate: 0.0019 },
        { pins: 8, rate: 0.0026 },
        { pins: 10, rate: 0.0034 },
        { pins: 12, rate: 0.0041 },
        { pins: 14, rate: 0.0048 },
        { pins: 16, rate: 0.0056 },
        { pins: 18, rate: 0.0064 },
        { pins: 22, rate: 0.0079 },
        { pins: 24, rate: 0.0087 },
        { pins: 28, rate: 0.010 },
        { pins: 36, rate: 0.013 },
        { pins: 40, rate: 0.015 },
        { pins: 64, rate: 0.025 },
        { pins: 80, rate: 0.032 },
        { pins: 128, rate: 0.053 },
        { pins: 180, rate: 0.076 },
        { pins: 224, rate: 0.097 }
      ]
    },
    {
      type: 'DIPs with Glass Seal',
      formula: '9.0e-5 * (Np)^1.51',
      rates: [
        { pins: 3, rate: 0.00047 },
        { pins: 4, rate: 0.00073 },
        { pins: 6, rate: 0.0013 },
        { pins: 8, rate: 0.0021 },
        { pins: 10, rate: 0.0029 },
        { pins: 12, rate: 0.0038 },
        { pins: 14, rate: 0.0048 },
        { pins: 16, rate: 0.0059 },
        { pins: 18, rate: 0.0071 },
        { pins: 22, rate: 0.0096 },
        { pins: 24, rate: 0.011 },
        { pins: 28, rate: 0.014 },
        { pins: 36, rate: 0.020 },
        { pins: 40, rate: 0.024 },
        { pins: 64, rate: 0.048 }
      ]
    },
    {
      type: 'Flatpacks with Axial Leads on 50 Mil Centers',
      formula: '3.0e-5 * (Np)^1.82',
      rates: [
        { pins: 3, rate: 0.00022 },
        { pins: 4, rate: 0.00037 },
        { pins: 6, rate: 0.00078 },
        { pins: 8, rate: 0.0013 },
        { pins: 10, rate: 0.0020 },
        { pins: 12, rate: 0.0028 },
        { pins: 14, rate: 0.0037 },
        { pins: 16, rate: 0.0047 },
        { pins: 18, rate: 0.0059 },
        { pins: 22, rate: 0.0083 },
        { pins: 24, rate: 0.0098 }
      ]
    },
    {
      type: 'Cans',
      formula: '3.0e-5 * (Np)^2.01',
      rates: [
        { pins: 3, rate: 0.00027 },
        { pins: 4, rate: 0.00049 },
        { pins: 6, rate: 0.0011 },
        { pins: 8, rate: 0.0020 },
        { pins: 10, rate: 0.0031 },
        { pins: 12, rate: 0.0044 },
        { pins: 14, rate: 0.0060 },
        { pins: 16, rate: 0.0079 }
      ]
    },
    {
      type: 'Nonhermetic: DIPs, PGA, SMT',
      formula: '3.6e-4 * (Np)^1.08',
      rates: [
        { pins: 3, rate: 0.0012 },
        { pins: 4, rate: 0.0016 },
        { pins: 6, rate: 0.0025 },
        { pins: 8, rate: 0.0034 },
        { pins: 10, rate: 0.0043 },
        { pins: 12, rate: 0.0053 },
        { pins: 14, rate: 0.0062 },
        { pins: 16, rate: 0.0072 },
        { pins: 18, rate: 0.0082 },
        { pins: 22, rate: 0.010 },
        { pins: 24, rate: 0.011 },
        { pins: 28, rate: 0.013 },
        { pins: 36, rate: 0.017 },
        { pins: 40, rate: 0.019 },
        { pins: 64, rate: 0.032 },
        { pins: 80, rate: 0.041 },
        { pins: 128, rate: 0.068 },
        { pins: 180, rate: 0.098 },
        { pins: 224, rate: 0.12 }
      ]
    }
  ];

  const QUALITY_FACTORS = [

    {
      label: "None beyond best commercial practices",
      value: 1.0,
      screeningLevel: "Standard"
    }
  ];

  const addNewComponent = () => {
    const newComponent = {
      id: Date.now(),
      type: '',
      devices: '',
      complexFailure: '',
      gateCount: '',
      temperature: 25,
      environment: '',
      data: "microprocessorData",
      quality: 'M',
      quantity: 1,
      microprocessorData: "",
      technology: '',
      complexity: '',
      application: '',
      packageType: '',
      pinCount: '',
      yearsInProduction: '',
      memoryTemperature: 45,
      techTemperatureB2: 25,
      techTemperatureB1: 25,
      memorySizeB1: 1024,
      memorySizeB2: 1024,
      memoryTech: "Flotox",
      B1: 0.79,
      B2: null,
      calculatedPiT: 1.2,
      piL: 1.0,
      basePiT: 0.1,
      failureRate: 0,
      totalFailureRate: 0
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (id) => {
    setComponents(components.filter(comp => comp.id !== id));
  };

  const updateComponent = (id, updatedProps) => {
    setComponents(components.map(comp =>
      comp.id === id ? { ...comp, ...updatedProps } : comp
    ));
  };

  const tableTheme = createTheme({
    overrides: {
      MuiTableRow: {
        root: {
          "&:hover": {
            cursor: "pointer",
            backgroundColor: "rgba(224, 224, 224, 1) !important",
          },
        },
      },
    },
  });

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

  const addOrUpdateComponent = (component) => {
    setComponent(prev => {
      // If component already exists, update it
      const existingIndex = prev.findIndex(c => c.id === component.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = component;
        return updated;
      }
      return [...prev, { ...component, id: Date.now() }];
    });
  };

  const updateComponentInList = (component, componentList) => {
    if (componentList?.some(c => c.id === component.id)) {
      addOrUpdateComponent(component);

    }
  };

  const partTypes = [
    { value: 'Logic', label: 'Logic and Custom Gate Array (λd = 0.16)' },
    { value: 'Memory', label: 'Memory (λd = 0.24)' }
  ];

  const packageTypes = [
    {
      value: 'DIP',
      label: 'DIP',
      hermetic: 1.0,
      nonhermetic: 1.3
    },
    {
      value: 'PGA',
      label: 'Pin Grid Array (πprT = 2.2/2.9)',
      hermetic: 2.2,
      nonhermetic: 2.9
    },
    {
      value: 'SMT',
      label: 'Surface Mount (πprT = 4.7/6.1)',
      hermetic: 4.7,
      nonhermetic: 6.1
    }
  ];

  const esdLevels = [
    { value: '0-1000', label: '0-1000V ', rate: 0.065 },
    { value: '1000-2000', label: '1000-2000V ', rate: 0.053 },
    { value: '2000-4000', label: '2000-4000V ', rate: 0.044 },
    { value: '4000-16000', label: '4000-16000V ', rate: 0.029 },
    { value: '16000+', label: '>16000V ', rate: 0.0027 }
  ];


  const manufacturingProcessTypes = [
    { value: 'QML', factor: 0.55 },
    { value: 'QPL', factor: 0.55 },
    { value: 'Non-QML', factor: 2.0 },
    { value: 'Non-QPL', factor: 2.0 }
  ];

  const [inputs, setInputs] = useState({
    memoryType: dieComplexityRates[0],
    memorySize: dieComplexityRates[0].rates[0],
    technology: 'MOS',
    packageType: packageRates[0],
    pinCount: 3,
    eepromType: 'Flotox',
    programmingCycles: a1Factors[0],
    a2Factor: a2Factors[0],
    eccOption: eccOptions[0],
    quality: QUALITY_FACTORS,
    environment: getEnvironmentalOptions('AIA'),
    systemLifeHours: 10000,
    junctionTemp: 35,
    partType: 'Logic',
    manufacturingProcess: 'QML',
    packageType: 'DIP',
    packageHermeticity: 'Hermetic',
    featureSize: 1.0,
    dieArea: 0.5,
    pinCount: 24,
    esdSusceptibility: '0-1000'
  });

  const calculateLambdaBP = () => {
    return 0;
  };

  const getESDFailureRate = () => {
    const selected = esdLevels?.find(e => e.value === inputs.esdSusceptibility);
    return selected ? selected.rate : 0;
  };

  const getTechnologyFactor = () => {
    const technologyMap = {
      "Bipolar": {
        basePiT: 0.10,
        description: "Standard bipolar logic families (TTL, ECL, ALSTTL, etc.)"
      },
      "MOS": {
        basePiT: 0.10,
        description: "CMOS and MOS-based technologies (CMOS, Digital MOS, VHSIC)"
      },
      "BiCMOS": {
        basePiT: 3.205e-8,
        description: "Bipolar-CMOS hybrid technologies"
      },
      "GaAs": {
        basePiT: 1.5,
        description: "Gallium Arsenide technologies (GaAs MMIC/Digital)"
      },
      "Linear": {
        basePiT: 0.65,
        description: "Linear analog circuits"
      }
    };

    return technologyMap[currentComponent.technology] || {
      basePiT: 1.0,
      description: "Unknown technology type"
    };
  };

  const getTemperatureFactor = () => {
    // This would include your temperature calculation logic
    // Example implementation (adjust based on your actual formula):
    const basePiT = getTechnologyFactor()?.basePiT;
    const temperature = currentComponent.temperature || 25; // default to 25°C

    // Example temperature adjustment formula (replace with your actual calculation)
    const piT = basePiT * Math.exp(0.1 * (temperature - 35));

    return {
      factor: piT,
      description: `Temperature factor at ${temperature}°C`,
      baseTemperature: 35, // reference temperature
      currentTemperature: temperature
    };
  };

  const getQualityFactor = () => {
    return currentComponent.piQ; // Assuming this is already set in state
  };

   const totalSystemFailureRate = useMemo(() => {
    return Object.values(failureRates).reduce((sum, rate) => {
      return sum + (rate || 0);
    }, 0);
  }, [failureRates]);

  const handleGateCalculation = (rate) => {
 setFailureRates(prev => ({ ...prev, gate: rate }));
};
const handleVhsicCalculation = (rate) => {
  console.log("@@@@@@rui")
    setFailureRates(prev => ({ ...prev, vhsic: rate }));
  };

  const hybridMemCalculation = (rate) => {
    setFailureRates(prev => ({ ...prev, memories: rate }));
  };
    const hybridSawCalculation = (rate) => {
    setFailureRates(prev => ({ ...prev, saw: rate }));
  };
  
      const hybridMagneticCalculation = (rate) => {
    setFailureRates(prev => ({ ...prev, magnetic: rate }));
  };
  
        const hybridGasCalculation = (rate) => {
    setFailureRates(prev => ({ ...prev, gaAs: rate }));
  };
  

  

  const renderComponent = (component) => {

    return (
      <div key={component.id} className="component-container" style={{
        border: '1px solid #ddd',
        padding: '15px',
        margin: '15px 0',
        borderRadius: '5px',
        position: 'relative'
      }}>
        <h3>Component {components.findIndex(c => c.id === component.id) + 1}</h3>

<h2 className='text-center' style={{ fontSize: '1.2rem' }}> {component?.type ? component.type.replace(/,/g, ' ').trim() : 'Microcircuits Reliability Calculator'}</h2>

        
          <Col md={12}>
            <label>Part Type:</label>
            <Select
              styles={customStyles}
              name="type"
              placeholder="Select"
              value={component.type ?
                { value: component.type, label: component.type } : null}
              onChange={(selectedOption) => {
                updateComponent(component.id, { type: selectedOption.value });
              }}
              options={[
                { value: "Microcircuits,Gate/Logic Arrays And Microprocessors", label: "Microcircuits,Gate/Logic Arrays And Microprocessors" },
                { value: "Microcircuits,Memories", label: "Microcircuits,Memories" },
                { value: "Microcircuits,Saw Devices", label: "Microcircuits,Saw Devices" },
                { value: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS", label: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" },
                { value: "Microcircuit,GaAs MMIC and Digital Devices", label: "Microcircuit,GaAs MMIC and Digital Devices" },
                { value: "Microcircuit,Magnetic Bubble Memories", label: "Microcircuit,Magnetic Bubble Memories" }
              ]}
            />
          </Col>
    <br/>
        <Row>
          {component.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
            <Hybridgate onCalculate={handleGateCalculation}/>
          )}
          {component.type === "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" && (
        <HybridVhsic onCalculate={handleVhsicCalculation}/>
          )}
          {component.type === "Microcircuits,Memories" && (
          <Hybridmemories onCalculate={hybridMemCalculation}/>
                    )}

          {component.type === "Microcircuits,Saw Devices" && (
          <HybridSaw onCalculate={hybridSawCalculation}/>
          )}

          {component.type === "Microcircuit,Magnetic Bubble Memories" && (
           <HybridMagnetic onCalculate={hybridMagneticCalculation}/>
           )}

        {component.type === "Microcircuit,GaAs MMIC and Digital Devices" && (
        <HybridGaAs onCalculate={hybridGasCalculation}/>
        )}
        <br />
       </Row>

        {component?.failureRate > 0 && (
          <div className="prediction-result" style={{ marginTop: '20px' }}>
            <strong>Predicted Failure Rate:</strong>
            <span className="ms-2">{component?.failureRate?.toFixed(6)} failures/10<sup>6</sup> hours</span>
            <br />
            <strong>Total :</strong>
            <span className="ms-2">
              {component?.total?.toFixed(6)} failures/10<sup>6</sup> hours
            </span>
          </div>
        )}

        <Button
          variant="danger"
          onClick={() => removeComponent(component.id)}
          style={{ marginTop: '10px', backgroundColor: "red" }}
        >
          Remove Component
        </Button>
      </div>
    );
  };
  return (
    <div className="reliability-calculator">
      <br />
      <h2 className='text-center' style={{ fontSize: '1.2rem' }}>
        Microcircuits Reliability Calculator
      </h2>
      {/*     
    {components.map(renderComponent)} */}
      {components.map(component => renderComponent({ ...component, id: component.id }))}

      <Button onClick={addNewComponent} className="mt-3">
        Add Component
      </Button>

      {components.length > 0 && (
        <div className="total-failure-rate" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa' }}>
          {/* <h4>Total System Failure Rate: {total} failures/10<sup>6</sup> hours</h4> */}
           <h4>Total System Failure Rate: {totalSystemFailureRate.toFixed(6)} failures/10<sup>6</sup> hours</h4>
         
        </div>
      )}
    </div>

  );
}
export default Microcircuits;