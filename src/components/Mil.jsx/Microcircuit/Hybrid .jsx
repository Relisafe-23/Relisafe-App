import React, { useState, useEffect, useRef,useMemo,useCallback } from 'react';
import Select from "react-select";

import {
  calculateLearningFactor,
  getEnvironmentalOptions,

} from '../Calculation.js';

import MicroSawDevice from './MicroSawDevice.jsx';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
import Box from '@mui/material/Box';
import { Alert, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import MicroCapacitor from './MicrocircuitHybrid/MicroCapacitor.jsx';
import Microcircuits from './Microcircuits.jsx';
import MicroDiode from './MicrocircuitHybrid/MicroDiode.jsx';
import '../Microcircuits.css'
import MaterialTable from "material-table";
import { tableIcons } from "../../core/TableIcons.js";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@material-ui/core";
import MicroGate from './MicroGate.jsx';
import MicroVhsic from './MicroVhsic.jsx';
import MicroMemories from './MicroMemories.jsx';
import MicroGaAs from './MicroGaAs.jsx';
import MicroMagnetic from './MicroMagnetic.jsx';

const MicrocircuitsCalculation = ({ onCalculate }) => {


  const [showCalculations, setShowCalculations] = useState(false);
  const [mainInitialRate, setMainInitialRate] = useState("")
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState([]);
  const [currentDevice, setCurrentDevice] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState();
  const [results, setResults] = useState(false)
  const [quantity, setQuantity] = useState(null)
  const [currentComponents, setCurrentComponents] = useState(null);
  const [mode, setMode] = useState('A1');
  const[totalSumRate, setTotalSumRate] = useState(0);
  const [numberOfPins, setNumberOfPins] = useState(null);
  const [ capacitorFr,setCapacitorFr] = useState(0)
  const[lambdaC ,setLambdaC] =useState(0)
  const [selectedECC, setSelectedECC] = React.useState(null);// 'A1' or 'C'
  const [currentComponent, setCurrentComponent] = useState({
    type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
    temperature: 25,
    devices: "bipolarData",
    complexFailure: "digital",
    environment: '',
    data: "microprocessorData",
    quality: 'M',
    quantity: 0,
    microprocessorData: "",
    gateCount: 1000,
    technology: '',
    complexity: '',
    application: '',
    packageType: '',
    pinCount: '',
    yearsInProduction: '',
    quality: '',

    memoryTemperature: 45,   
    techTemperatureB2: 25,
    techTemperatureB1: 25,    
    memorySizeB1: 1024,
    memorySizeB2: 1024,
    memoryTech: "Flotox",
    technology: "Digital MOS",
    B1: 0.79,
    B2: 0,
    calculatedPiT: 1.2,


    piL: 1.0,
    // piQ: 1.0,
    basePiT: 0.1,
    calculatedPiT: null
  });
 
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
  const eccOptions = [
    { value: 'none', label: 'No On-Chip ECC', factor: 1.0 },
    { value: 'hamming', label: 'On-Chip Hamming Code', factor: 0.72 },
    { value: 'redundant', label: 'Two-Needs-One Redundant Cell Approach', factor: 0.68 }
  ];

  const handleChange = (selectedOption) => {
    setSelectedECC(selectedOption);
    console.log(`Selected ECC: ${selectedOption.label}, Factor: ${selectedOption.factor}`);
  };

  const handleA2FactorChange = (selectedOption) => {
    setCurrentComponent(prev => ({
      ...prev,
      a2Factor: selectedOption,
      a2Value: selectedOption.a2Value,
      programmingCyclesMax: selectedOption.maxCycles
    }));
    console.log(`Selected A₂ Factor: ${selectedOption.label}, Value: ${selectedOption.a2Value}, Max Cycles: ${selectedOption.maxCycles}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentComponent(prev => ({
      ...prev,
      [name]: name === 'temperature' || name === 'Tj' || name === 'gateCount' || name === 'quantity'
        ? parseFloat(value)
        : value
    }));
  };

  const c1Values = {
    MMIC: [
      { range: '1-100', value: 4.5 },
      { range: '101-1000', value: 7.2 }
    ],
    Digital: [
      { range: '1-1000', value: 25 },
      { range: '1001-10000', value: 51 }
    ]
  };

  const getQualityLabel = (piQ) => {
    const qualityOptions = [
      { piQ: 0.25, label: "Class S (MIL-M-38510)" },
      { piQ: 1.0, label: "Class B (MIL-M-38510)" },
      { piQ: 2.0, label: "Class B-1 (MIL-STD-883)" }
    ];
    return qualityOptions.find(q => q.piQ === parseFloat(piQ))?.label || 'Unknown';
  };

  const getEnvironmentFactor = (envValue) => {
    if (!environmentOptions || !Array.isArray(environmentOptions)) return 1.0;

    const foundEnv = environmentOptions.find(opt => opt?.value === envValue);
    return foundEnv?.factor ?? 1.0;
  };

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
      label: "10 Temperature Cycles (-55°C to +125°C) with end point electrical tests",
      value: 0.10,
      screeningLevel: "High"
    },
    {
      label: "None beyond best commercial practices",
      value: 1.0,
      screeningLevel: "Standard"
    }
  ];

  const calculateComponentSum = (currentComponent) => {

    // const lambdac = handleCalculateBubble(currentComponent) + handleCalculateSawDevice(currentComponent) + handleCalculateGaAs(currentComponent) + handleCalculateVhsic(currentComponent) + handleCalculateMemories(currentComponent) + handleCalculateGate(currentComponent) + handleCalculateFailure(currentComponent);
    const baseLambda = currentComponent?.baseFailureRate || mainInitialRate || 0;
    const componentSum = baseLambda;


    return  componentSum;
  };

  const [inputs, setInputs] = useState({
    memoryType: dieComplexityRates[0],
    memorySize: dieComplexityRates[0].rates[0],
    technology: 'MOS', // MOS or Bipolar
    packageType: packageRates[0],
    pinCount: 3,
    eepromType: 'Flotox', // Flotox or Textured-Poly
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
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
   const [failureRates, setFailureRates] = useState({
    microcircuits: 0,
    capacitors: 0,
  
  });
    const [componentRates, setComponentRates] = useState({
  microcircuits: 0,
  capacitors: 0,
  
});



  const [frArr, setFrArr] = useState([0])


  const [trate, setTotalRate] = useState(0);
  const totalRate =  frArr.reduce((sum, item) => sum + item, 2);

  const calculateTempFactor = (temp) => {
    // Simplified exponential model for πT
    return Math.exp((-14 / (8.617e-5)) * ((1 / (temp + 273)) - (1 / 298)));
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

  const handleCalculateSawDevice = (values) => {
    setMainInitialRate(values)
  }

  const environmentOptions = [

    {
      value: "GB",
      label: "Ground, Benign (GB)",
      factor: 0.50,
      description: "Controlled laboratory or office environment"
    },
    {
      value: "GF",
      label: "Ground, Fixed (GF)",
      factor: 2.0,
      description: "Permanent ground installations with environmental controls"
    },
    {
      value: "GM",
      label: "Ground, Mobile (GM)",
      factor: 4.0,
      description: "Vehicles operating on improved roads"
    },
    {
      value: "NS",
      label: "Naval, Sheltered (NS)",
      factor: 4.0,
      description: "Below decks in harbor or calm seas"
    },
    {
      value: "NU",
      label: "Naval, Unsheltered (NU)",
      factor: 6.0,
      description: "On deck or in rough seas"
    },
    {
      value: "AIC",
      label: "Airborne, Inhabited Cargo (AIC)",
      factor: 4.0,
      description: "Cargo aircraft with human occupants"
    },
    {
      value: "AIF",
      label: "Airborne, Inhabited Fighter (AIF)",
      factor: 5.0,
      description: "Manned fighter/trainer aircraft"
    },
    {
      value: "AUC",
      label: "Airborne, Uninhabited Cargo (AUC)",
      factor: 5.0,
      description: "Unmanned cargo aircraft"
    },
    {
      value: "AUF",
      label: "Airborne, Uninhabited Fighter (AUF)",
      factor: 8.0,
      description: "Unmanned fighter aircraft"
    },
    {
      value: "ARW",
      label: "Airborne, Rotary Wing (ARW)",
      factor: 8.0,
      description: "Helicopters and other rotary aircraft"
    },
    {
      value: "SF",
      label: "Space, Flight (SF)",
      factor: 0.50,
      description: "Spacecraft in flight (not launch/re-entry)"
    },
    {
      value: "MF",
      label: "Missile, Flight (MF)",
      factor: 5.0,
      description: "Missiles during flight phase"
    },
    {
      value: "ML",
      label: "Missile, Launch (ML)",
      factor: 12,
      description: "Missiles during launch phase"
    },
    {
      value: "CL",
      label: "Cannon, Launch (CL)",
      factor: 220,
      description: "Gun-launched projectiles during firing"
    }

   
  ];


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


  useEffect(() => {
    let sum = 0;
    
    // Loop through all components
    for (const component in componentRates) {
      // Only add if the component exists and has a numeric value
      if (component in componentRates && !isNaN(componentRates[component])) {
        sum += componentRates[component];
      }
    }
    console.log("Component Rates:", componentRates);
    setTotalRate(sum);
  }, [componentRates]);


const onTotalFailureRateChange = useCallback((value) => {
  setComponentRates(prev => ({
    ...prev,
    microcircuits: value
  }));
}, []);


const capacitorTotalFRate = useCallback((value) => {
  setComponentRates(prev => ({
    ...prev,
    capacitors: value
  }));
}, []);


const totalSystemFailureRate = useMemo(() => {
  return Object.values(componentRates).reduce((sum, rate) => {
     const numericRate = Number(rate) || 0;
    return sum + numericRate;
  }, 0);
}, [componentRates]);


useEffect(() => {
  console.log("Total system failure rate updated:", totalSystemFailureRate);

}, [totalSystemFailureRate]);


  const getQualityFactor = () => {
    return currentComponent.piQ; // Assuming this is already set in state
  };
  const getCircuitFunctionFactor = () => {
    return currentComponent.piF;
  }

  const calculateHybridFailureRate = (component) => {

    const componentSum = calculateComponentSum(quantity, currentComponent);
    console.log("componentSum6788", componentSum)

    //  const Nc = quantity
    const piE = getEnvironmentFactor(currentComponent.environment) || 1;
    console.log("piE", piE)
    const piQ = currentComponent.quality?.value || getQualityFactor('MIL_M_38510_ClassB') || 1;
    console.log("piQ", piQ)
    const piF = getCircuitFunctionFactor();
    const piL = calculateLearningFactor(currentComponent.yearsInProduction) || 1;

    // Corrected formula based on MIL-HDBK-217: λp = Σ(Nc × λc) × (1 + 0.2 πE)  × πF × πQ × πL
    const failureRate = componentSum * (1 + 0.2 * piE) * piF * piQ * piL;
    console.log("failureRate", failureRate)
    // Debug logging
    setResults({
      componentSum,
      // Nc,
      piE,
      piF,
      piQ,
      piL,
      failureRate
    })
    console.log("Calculation Parameters:", {
      componentSum,
      // Nc,
      piE,
      piF,
      piQ,
      piL,
      failureRate
    });

    return failureRate;
  };

 

  return (
    <div className="reliability-calculator">
    
      <h2 className='text-center' style={{ fontSize: '2.0rem' }}>{currentComponent?.type ? currentComponent.type.replace(/,/g, ' ').trim() : 'Microcircuits Reliability Calculator'}</h2>
      <div className="component-form">
        <Row className="mb-2">
          <Col md={12}>
            <div className="form-group" >
              <label>Part Type:</label>
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
                  { value: "Microcircuits,Gate/Logic Arrays And Microprocessors", label: "Microcircuits,Gate/Logic Arrays And Microprocessors" },
                  { value: "Microcircuits,Memories", label: "Microcircuits,Memories" },
                  { value: "Microcircuits,Hybrids", label: "Microcircuits,Hybrids" },
                  { value: "Microcircuits,Saw Devices", label: "Microcircuits,Saw Devices" },
                  { value: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS", label: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" },
                  { value: "Microcircuit,GaAs MMIC and Digital Devices", label: "Microcircuit,GaAs MMIC and Digital Devices" },
                  { value: "Microcircuit,Magnetic Bubble Memories", label: "Microcircuit,Magnetic Bubble Memories" }
                ]}
              />
            </div>
          </Col>
          {currentComponent.type === "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" && (
           <MicroVhsic/>
          )}
          {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
          <MicroGate/>
          )}
          {currentComponent.type === "Microcircuits,Hybrids" && (
            <>
              <Col md={4}>
                <div className="form-group">
                  <label>Learning Factor (π<sub>L</sub>):</label>
                  <Select
                    style={customStyles}
                    name="learningFactor"
                    placeholder="Select Years in Production"
                    onChange={(selectedOption) => {
                      setCurrentComponent({
                        ...currentComponent,
                        yearsInProduction: selectedOption.value,
                        piL: selectedOption.piL
                      });
                    }}
                    options={[
                      {
                        value: 5.1,
                        label: "≤ 0.5 years",
                        piL: 2.0, // Direct value from table
                        description: "Early production phase (highest learning factor)"
                      },
                      {
                        value: 0.5,
                        label: "0.5 years",
                        piL: 1.8,
                        description: "Initial production ramp-up"
                      },
                      {
                        value: 1.0,
                        label: "1.0 year",
                        piL: 1.5,
                        description: "Moderate experience"
                      },
                      {
                        value: 1.5,
                        label: "1.5 years",
                        piL: 1.2,
                        description: "Stabilizing production"
                      },
                      {
                        value: 2.0,
                        label: "≥ 2.0 years",
                        piL: 1.0,
                        description: "Mature production (lowest learning factor)"
                      }
                    ]}
                  />
                </div>
              </Col>

              {/* Component Type Selection */}
              <Col md={4}>
                <div className="form-group">
                  <label>Component Type:</label>

                  <Select
                    isMulti
                    styles={customStyles}
                    name="componentType"
                    placeholder="Select Component Type"
                    value={selectedComponent}
                    onChange={(selectedOptions) => {
                      setSelectedComponent(selectedOptions || []);
                      console.log("Selected Component:", selectedComponent)
                    }}
                    options={[
                      {
                        value: "Microcircuit",
                        label: "Microcircuit",
                      },
                      {
                        value: "DiscreteSemiconductor",
                        label: "Discrete Semiconductor",
                      },
                      {
                        value: "Capacitor",
                        label: "Capacitor",
                      },
                      {
                        value: "Other",
                        label: "Other (λₙ = 0)",
                      }
                    ]}
                  />
                  <p>
                    Selected values: {selectedComponent?.map(option => option.value).join(', ') || 'None selected'}
                  </p>
                </div>
              </Col>
              {selectedComponent?.some(option => option.value === "Capacitor") && (

                <MicroCapacitor 
                 capacitorTotalFRate = {capacitorTotalFRate}
                />

              )}

              {selectedComponent?.some(option => option.value === "Microcircuit") && (

                <Microcircuits
                  onTotalFailureRateChange={onTotalFailureRateChange}
                  setSelectedComponent = {setSelectedComponent}
                  // handleFrChange={handleFrChange}
                  />

              )}

              {selectedComponent?.some(option => option.value === "DiscreteSemiconductor") && (
                <>
                  <MicroDiode  />

                </>
              )}
          

                <Col md={4}>
                  <div className="form-group mb-3">
                 
                    <label>Failure Rate (λc):</label>
                    <input
                      type="string"
                      step="0.000001"
                      min="0"
                      value={totalSystemFailureRate}
                      placeholder="Props value will appear here"
                    />
                    <span className="unit">failures/10<sup>6</sup> hours</span>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="form-group mb-3">
                    <label>Quality Factor (π<sub>Q</sub>):</label>
                    <Select
                      styles={customStyles}

                      name="qualityFactor"
                      placeholder="Select Quality Factor (πQ)"

                      onChange={(selectedOption) => {
                        setCurrentComponent({
                          ...currentComponent,
                          quality: selectedOption.value,
                          piQ: selectedOption.piQ
                        });
                      }}
                      options={[
                        {
                          value: "MIL_M_38510_ClassS",
                          label: "MIL-M-38510 Class S",
                          piQ: 0.25,
                          description: "Highest reliability military grade"
                        },
                        {
                          value: "MIL_I_38535_ClassU",
                          label: "MIL-I-38535 Class U",
                          piQ: 0.25,
                          description: "High reliability hybrid microcircuits"
                        },
                        {
                          value: "MIL_H_38534_ClassS_Hybrid",
                          label: "MIL-H-38534 Class S Hybrid",
                          piQ: 0.25,
                          description: "High reliability hybrid circuits"
                        },
                        {
                          value: "MIL_M_38510_ClassB",
                          label: "MIL-M-38510 Class B",
                          piQ: 1.0,
                          description: "Standard military grade"
                        },
                        {
                          value: "MIL_I_38535_ClassQ",
                          label: "MIL-I-38535 Class Q",
                          piQ: 1.0,
                          description: "Standard hybrid microcircuits"
                        },
                        {
                          value: "MIL_H_38534_ClassB_Hybrid",
                          label: "MIL-H-38534 Class B Hybrid",
                          piQ: 1.0,
                          description: "Standard hybrid circuits"
                        },
                        {
                          value: "MIL_STD_883_ClassB1",
                          label: "MIL-STD-883 Class B1",
                          piQ: 2.0,
                          description: "Screened commercial grade"
                        },
                        {
                          value: "Commercial",
                          label: "Commercial",
                          piQ: 5.0,
                          description: "Standard commercial grade (lowest reliability)"
                        }
                      ]}
                      className="factor-select"
                    />

                  </div>
                </Col>

                <Col md={4}>
                  <div className="form-group mb-3">
                    <label>Environment (π<sub>E</sub>):</label>
                    <Select
                      styles={customStyles}
                      name="environment"
                      placeholder="Select Environment"

                      onChange={(selectedOption) => {
                        setCurrentComponent({
                          ...currentComponent,
                          environment: selectedOption.value,
                          piE: selectedOption.piE
                        });
                      }}

                      options={[
                        {
                          value: "GB",
                          label: "Ground, Benign (GB)",
                          piE: 0.50,
                          description: "Controlled laboratory or office environment"
                        },
                        {
                          value: "GF",
                          label: "Ground, Fixed (GF)",
                          piE: 2.0,
                          description: "Permanent ground installations with environmental controls"
                        },
                        {
                          value: "GM",
                          label: "Ground, Mobile (GM)",
                          piE: 4.0,
                          description: "Vehicles operating on improved roads"
                        },
                        {
                          value: "NS",
                          label: "Naval, Sheltered (NS)",
                          piE: 4.0,
                          description: "Below decks in harbor or calm seas"
                        },
                        {
                          value: "NU",
                          label: "Naval, Unsheltered (NU)",
                          piE: 6.0,
                          description: "On deck or in rough seas"
                        },
                        {
                          value: "AIC",
                          label: "Airborne, Inhabited Cargo (AIC)",
                          piE: 4.0,
                          description: "Cargo aircraft with human occupants"
                        },
                        {
                          value: "AIF",
                          label: "Airborne, Inhabited Fighter (AIF)",
                          piE: 5.0,
                          description: "Manned fighter/trainer aircraft"
                        },
                        {
                          value: "AUC",
                          label: "Airborne, Uninhabited Cargo (AUC)",
                          piE: 5.0,
                          description: "Unmanned cargo aircraft"
                        },
                        {
                          value: "AUF",
                          label: "Airborne, Uninhabited Fighter (AUF)",
                          piE: 8.0,
                          description: "Unmanned fighter aircraft"
                        },
                        {
                          value: "ARW",
                          label: "Airborne, Rotary Wing (ARW)",
                          piE: 8.0,
                          description: "Helicopters and other rotary aircraft"
                        },
                        {
                          value: "SF",
                          label: "Space, Flight (SF)",
                          piE: 0.50,
                          description: "Spacecraft in flight (not launch/re-entry)"
                        },
                        {
                          value: "MF",
                          label: "Missile, Flight (MF)",
                          piE: 5.0,
                          description: "Missiles during flight phase"
                        },
                        {
                          value: "ML",
                          label: "Missile, Launch (ML)",
                          piE: 12,
                          description: "Missiles during launch phase"
                        },
                        {
                          value: "CL",
                          label: "Cannon, Launch (CL)",
                          piE: 220,
                          description: "Gun-launched projectiles during firing"
                        }
                      ]}
                    />
                  </div>
                </Col>
           
              <Col md={4}>
                <div className="form-group mb-3">
                  <label>Circuit Function (π<sub>F</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="circuitFunction"
                    placeholder="Select Circuit Function"

                    onChange={(selectedOption) => {
                      setCurrentComponent({
                        ...currentComponent,
                        // circuitFunction: selectedOption.value,
                        piF: selectedOption.piF
                      });
                    }}
                    options={[
                      { value: "Digital", label: "Digital", piF: 1.0 },
                      { value: "Video", label: "Video (10MHz < f < 1GHz)", piF: 1.2 },
                      { value: "Microwave", label: "Microwave (f > 1GHz)", piF: 2.6 },
                      { value: "Linear", label: "Linear (f < 10MHz)", piF: 5.8 },
                      { value: "Power", label: "Power", piF: 21 }
                    ]}
                  />
                </div>
              </Col>
              <div className='d-flex justify-content-between align-items-center'>
                <div>
                  {results && (
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

                <div className="text-end mt-3">
                  <Button
                    className="btn btn-primary"
                    onClick={calculateHybridFailureRate}
                  >
                    Calculate Failure Rate
                  </Button>
                </div>
              </div>

              {results && (
                <>
                  <h2 className="text-center">Calculation Result</h2>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center">
                      <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                      <span className="ms-2">
                        {results?.failureRate?.toFixed(6)} failures/10<sup>6</sup> hours
                        {console.log("far..", results)}
                      </span>
                    </div>
                    {results?.parameters?.formula && (
                      <div className="mt-2">
                        <strong>Formula:</strong>
                        <span className="ms-2 font-monospace">{result?.parameters?.formula}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Detailed Calculations Table */}
              {results && showCalculations && (
                <Row className="mb-4 mt-3">
                  <Col>
                    <div className="card">
                      <div className="card-body">
                        <MaterialTable
                          columns={[
                            {
                              title: 'Component Type',
                              field: 'type',
                              render: rowData => (rowData?.currentComponent?.type || 'Hybrid Microcircuit')
                            },
                            {
                              title: 'Quantity (Nₙ)',
                              field: 'quantity',
                              render: rowData => (rowData?.Nc || 1)
                            },
                            {
                              title: 'Contribution (Nₙ × λₙ)',
                              field: 'contribution',
                              render: rowData => (rowData?.componentSum?.toFixed(6) || '0.000000')
                            },
                            {
                              title: <span>π<sub>E</sub></span>,
                              field: 'piE',
                              render: rowData => (rowData?.piE?.toFixed(4) || '1.0000')
                            },
                            {
                              title: <span>π<sub>Q</sub></span>,
                              field: 'piQ',
                              render: rowData => (rowData?.piQ?.toFixed(4) || '1.0000')
                            },
                            {
                              title: <span>π<sub>F</sub></span>,
                              field: 'piF',
                              render: rowData => (rowData?.piF?.toFixed(4) || '1.0000')
                            },
                            {
                              title: <span>π<sub>L</sub></span>,
                              field: 'piL',
                              render: rowData => (rowData?.piL?.toFixed(4) || '1.0000')
                            },
                            {
                              title: "Total λₚ",
                              field: 'totalFailureRate',
                              render: rowData => (
                                <strong>{(rowData?.failureRate?.toFixed(6) || '0.000000')}</strong>
                              )
                            }
                          ]}
                          data={[results]}
                          options={{
                            search: false,
                            paging: false,
                            toolbar: false,
                            headerStyle: {
                              backgroundColor: '#CCE6FF',
                              fontWeight: 'bold'
                            },
                            rowStyle: {
                              backgroundColor: '#FFF'
                            }
                          }}
                          components={{
                            Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 8 }} />
                          }}
                        />


                        <div className="formula-section mt-4">
                          <Typography variant="h6" gutterBottom>
                            Calculation Formula
                          </Typography>
                          <div className="alert alert-light">
                            <code className="fs-5">
                              λ<sub>p</sub> = Σ(N<sub>c</sub> × λ<sub>c</sub>) × (1 + 0.2  π<sub>E</sub>) × π<sub>F</sub> × π<sub>Q</sub> × π<sub>L</sub>
                            </code>
                          </div>
                          <Typography variant="body1" paragraph>Where:</Typography>
                          <ul>
                            <li><strong>λ<sub>p</sub></strong> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>

                            <li><strong>Σ(N<sub>c</sub> × λ<sub>c</sub>)</strong> = Sum of component contributions</li>
                            <li><strong>λ<sub>c</sub></strong> = Failure Rate of each particular component</li>
                            <li><strong>N<sub>c</sub></strong> = Number of each particular component</li>
                            <li><strong>π<sub>E</sub></strong> = Environment factor</li>
                            <li><strong>π<sub>F</sub></strong> = Circuit function factor</li>
                            <li><strong>π<sub>Q</sub></strong> = Quality factor</li>
                            <li><strong>π<sub>L</sub></strong> = Learning factor</li>
                          </ul>
                          <div className="alert alert-info mt-3">
                            <strong>Note:</strong> Only microcircuits, discrete semiconductors, and capacitors contribute significantly to the failure rate. Other components are assumed to have λ<sub>c</sub> = 0.
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </>
          )}

          {currentComponent.type === "Microcircuits,Saw Devices" && (
         <MicroSawDevice/>
          )}

          {currentComponent.type === "Microcircuit,GaAs MMIC and Digital Devices" && (
           
           <MicroGaAs/>)}
         
        </Row>
  
        {currentComponent.type === "Microcircuits,Memories" && (
        <MicroMemories/>
        )}
      
        <br />
        {currentComponent.type === "Microcircuit,Magnetic Bubble Memories" && (
        <MicroMagnetic/>

        )}
      </div>
    </div>
  );
};

export default MicrocircuitsCalculation;






// import React, { useState, useEffect, useRef,useMemo,useCallback } from 'react';
// import Select from "react-select";

// import {
//   calculateLearningFactor,
//   getEnvironmentalOptions,

// } from '../Calculation.js';

// import MicroSawDevice from './MicroSawDevice.jsx';
// import { CalculatorIcon } from '@heroicons/react/24/outline';
// import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
// import Box from '@mui/material/Box';
// import { Alert, Paper, Typography, IconButton, Tooltip } from "@mui/material";
// import MicroCapacitor from './MicrocircuitHybrid/MicroCapacitor.jsx';
// import Microcircuits from './Microcircuits.jsx';
// import MicroDiode from './MicrocircuitHybrid/MicroDiode.jsx';
// import '../Microcircuits.css'
// import MaterialTable from "material-table";
// import { tableIcons } from "../../core/TableIcons.js";
// import { createTheme } from "@mui/material";
// import { ThemeProvider } from "@material-ui/core";
// import MicroGate from './MicroGate.jsx';
// import MicroVhsic from './MicroVhsic.jsx';
// import MicroMemories from './MicroMemories.jsx';
// import MicroGaAs from './MicroGaAs.jsx';
// import MicroMagnetic from './MicroMagnetic.jsx';

// const MicrocircuitsCalculation = ({ onCalculate }) => {


//   const [showCalculations, setShowCalculations] = useState(false);
//   const [mainInitialRate, setMainInitialRate] = useState("")
//   const [components, setComponents] = useState([]);
//   const [selectedComponent, setSelectedComponent] = useState([]);
//   const [currentDevice, setCurrentDevice] = useState([]);
//   const [showResults, setShowResults] = useState(false);
//   const [selectedOption, setSelectedOption] = useState();
//   const [results, setResults] = useState(false)
//   const [quantity, setQuantity] = useState(null)
//   const [currentComponents, setCurrentComponents] = useState(null);
//   const [mode, setMode] = useState('A1');
//   const[totalSumRate, setTotalSumRate] = useState(0);
//   const [numberOfPins, setNumberOfPins] = useState(null);
//   const [ capacitorFr,setCapacitorFr] = useState(0)
//   const[lambdaC ,setLambdaC] =useState(0)
//   const [selectedECC, setSelectedECC] = React.useState(null);// 'A1' or 'C'
//   const [currentComponent, setCurrentComponent] = useState({
//     type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
//     temperature: 25,
//     devices: "bipolarData",
//     complexFailure: "digital",
//     environment: '',
//     data: "microprocessorData",
//     quality: 'M',
//     quantity: 0,
//     microprocessorData: "",
//     gateCount: 1000,
//     technology: '',
//     complexity: '',
//     application: '',
//     packageType: '',
//     pinCount: '',
//     yearsInProduction: '',
//     quality: '',

//     memoryTemperature: 45,   
//     techTemperatureB2: 25,
//     techTemperatureB1: 25,    
//     memorySizeB1: 1024,
//     memorySizeB2: 1024,
//     memoryTech: "Flotox",
//     technology: "Digital MOS",
//     B1: 0.79,
//     B2: 0,
//     calculatedPiT: 1.2,


//     piL: 1.0,
//     // piQ: 1.0,
//     basePiT: 0.1,
//     calculatedPiT: null
//   });
 
//       const dieComplexityRates = [
//     {
//       type: ' MOS-ROM',
//       rates: [
//         { size: 'Up to 16K', mos: 0.00065 },
//         { size: '16K < B ≤ 64K', mos: 0.0013 },
//         { size: '64K < B ≤ 256K', mos: 0.0026 },
//         { size: '256K < B ≤ 1M', mos: 0.0052 }
//       ]
//     },
//     {
//       type: 'MOS-PROM/UVEPROM/EEPROM/EAPROM',
//       rates: [
//         { size: 'Up to 16K', mos: 0.00085 },
//         { size: '16K < B ≤ 64K', mos: 0.0017 },
//         { size: '64K < B ≤ 256K', mos: 0.0034 },
//         { size: '256K < B ≤ 1M', mos: 0.0068 }
//       ]
//     },
//     {
//       type: 'MOS-DRAM',
//       rates: [
//         { size: 'Up to 16K', mos: 0.0013 },
//         { size: '16K < B ≤ 64K', mos: 0.0025 },
//         { size: '64K < B ≤ 256K', mos: 0.0050 },
//         { size: '256K < B ≤ 1M', mos: 0.010 }
//       ]
//     },
//     {
//       type: 'MOS-SRAM (MOS & BIMOS)',
//       rates: [
//         { size: 'Up to 16K', mos: 0.0078 },
//         { size: '16K < B ≤ 64K', mos: 0.016 },
//         { size: '64K < B ≤ 256K', mos: 0.031 },
//         { size: '256K < B ≤ 1M', mos: 0.062 }
//       ]
//     },

//     {
//       type: 'Bipolar-(ROM & PROM)',
//       rates: [
//         { size: 'Up to 16K', mos: 0.0094 },
//         { size: '16K < B ≤ 64K', mos: 0.019 },
//         { size: '64K < B ≤ 256K', mos: 0.038 },
//         { size: '256K < B ≤ 1M', mos: 0.075 }
//       ]
//     },
//     {
//       type: 'Bipolar-(SRAM)',
//       rates: [
//         { size: 'Up to 16K', mos: 0.0052 },
//         { size: '16K < B ≤ 64K', mos: 0.011 },
//         { size: '64K < B ≤ 256K', mos: 0.021 },
//         { size: '256K < B ≤ 1M', mos: 0.042 }
//       ]
//     }

//   ];
//   // A1 Factors for λCycle Calculation
//   const a1Factors = [
//     { cycles: 'Up to 100', flotox: 0.00070, texturedPoly: 0.0097 },
//     { cycles: '100 < C ≤ 200', flotox: 0.0014, texturedPoly: 0.014 },
//     { cycles: '200 < C ≤ 500', flotox: 0.0034, texturedPoly: 0.023 },
//     { cycles: '500 < C ≤ 1K', flotox: 0.0068, texturedPoly: 0.033 },
//     { cycles: '1K < C ≤ 3K', flotox: 0.020, texturedPoly: 0.061 },
//     { cycles: '3K < C ≤ 7K', flotox: 0.049, texturedPoly: 0.14 },
//     { cycles: '7K < C ≤ 15K', flotox: 0.10, texturedPoly: 0.30 },
//     { cycles: '15K < C ≤ 20K', flotox: 0.14, texturedPoly: 0.30 },
//     { cycles: '20K < C ≤ 30K', flotox: 0.20, texturedPoly: 0.30 },
//     { cycles: '30K < C ≤ 100K', flotox: 0.68, texturedPoly: 0.30 },
//     { cycles: '100K < C ≤ 200K', flotox: 1.3, texturedPoly: 0.30 },
//     { cycles: '200K < C ≤ 400K', flotox: 2.7, texturedPoly: 0.30 },
//     { cycles: '400K < C ≤ 500K', flotox: 3.4, texturedPoly: 0.30 }
//   ];
//   // A2 Factors for λCycle Calculation
//   const a2Factors = [
//     { cycles: 'Up to 300K', value: 0 },
//     { cycles: '300K < C ≤ 400K', value: 1.1 },
//     { cycles: '400K < C ≤ 500K', value: 2.3 }
//   ];
//   const eccOptions = [
//     { value: 'none', label: 'No On-Chip ECC', factor: 1.0 },
//     { value: 'hamming', label: 'On-Chip Hamming Code', factor: 0.72 },
//     { value: 'redundant', label: 'Two-Needs-One Redundant Cell Approach', factor: 0.68 }
//   ];

//   const handleChange = (selectedOption) => {
//     setSelectedECC(selectedOption);
//     console.log(`Selected ECC: ${selectedOption.label}, Factor: ${selectedOption.factor}`);
//   };

//   const handleA2FactorChange = (selectedOption) => {
//     setCurrentComponent(prev => ({
//       ...prev,
//       a2Factor: selectedOption,
//       a2Value: selectedOption.a2Value,
//       programmingCyclesMax: selectedOption.maxCycles
//     }));
//     console.log(`Selected A₂ Factor: ${selectedOption.label}, Value: ${selectedOption.a2Value}, Max Cycles: ${selectedOption.maxCycles}`);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentComponent(prev => ({
//       ...prev,
//       [name]: name === 'temperature' || name === 'Tj' || name === 'gateCount' || name === 'quantity'
//         ? parseFloat(value)
//         : value
//     }));
//   };

//   const c1Values = {
//     MMIC: [
//       { range: '1-100', value: 4.5 },
//       { range: '101-1000', value: 7.2 }
//     ],
//     Digital: [
//       { range: '1-1000', value: 25 },
//       { range: '1001-10000', value: 51 }
//     ]
//   };

//   const getQualityLabel = (piQ) => {
//     const qualityOptions = [
//       { piQ: 0.25, label: "Class S (MIL-M-38510)" },
//       { piQ: 1.0, label: "Class B (MIL-M-38510)" },
//       { piQ: 2.0, label: "Class B-1 (MIL-STD-883)" }
//     ];
//     return qualityOptions.find(q => q.piQ === parseFloat(piQ))?.label || 'Unknown';
//   };

//   const getEnvironmentFactor = (envValue) => {
//     if (!environmentOptions || !Array.isArray(environmentOptions)) return 1.0;

//     const foundEnv = environmentOptions.find(opt => opt?.value === envValue);
//     return foundEnv?.factor ?? 1.0;
//   };

//   const packageRates = [
//     {
//       type: 'Hermetic: DIPs w/Solder or Weld Seal, PGA, SMT',
//       formula: '2.8e-4 * (Np)^1.08',
//       rates: [
//         { pins: 3, rate: 0.00092 },
//         { pins: 4, rate: 0.0013 },
//         { pins: 6, rate: 0.0019 },
//         { pins: 8, rate: 0.0026 },
//         { pins: 10, rate: 0.0034 },
//         { pins: 12, rate: 0.0041 },
//         { pins: 14, rate: 0.0048 },
//         { pins: 16, rate: 0.0056 },
//         { pins: 18, rate: 0.0064 },
//         { pins: 22, rate: 0.0079 },
//         { pins: 24, rate: 0.0087 },
//         { pins: 28, rate: 0.010 },
//         { pins: 36, rate: 0.013 },
//         { pins: 40, rate: 0.015 },
//         { pins: 64, rate: 0.025 },
//         { pins: 80, rate: 0.032 },
//         { pins: 128, rate: 0.053 },
//         { pins: 180, rate: 0.076 },
//         { pins: 224, rate: 0.097 }
//       ]
//     },
//     {
//       type: 'DIPs with Glass Seal',
//       formula: '9.0e-5 * (Np)^1.51',
//       rates: [
//         { pins: 3, rate: 0.00047 },
//         { pins: 4, rate: 0.00073 },
//         { pins: 6, rate: 0.0013 },
//         { pins: 8, rate: 0.0021 },
//         { pins: 10, rate: 0.0029 },
//         { pins: 12, rate: 0.0038 },
//         { pins: 14, rate: 0.0048 },
//         { pins: 16, rate: 0.0059 },
//         { pins: 18, rate: 0.0071 },
//         { pins: 22, rate: 0.0096 },
//         { pins: 24, rate: 0.011 },
//         { pins: 28, rate: 0.014 },
//         { pins: 36, rate: 0.020 },
//         { pins: 40, rate: 0.024 },
//         { pins: 64, rate: 0.048 }
//       ]
//     },
//     {
//       type: 'Flatpacks with Axial Leads on 50 Mil Centers',
//       formula: '3.0e-5 * (Np)^1.82',
//       rates: [
//         { pins: 3, rate: 0.00022 },
//         { pins: 4, rate: 0.00037 },
//         { pins: 6, rate: 0.00078 },
//         { pins: 8, rate: 0.0013 },
//         { pins: 10, rate: 0.0020 },
//         { pins: 12, rate: 0.0028 },
//         { pins: 14, rate: 0.0037 },
//         { pins: 16, rate: 0.0047 },
//         { pins: 18, rate: 0.0059 },
//         { pins: 22, rate: 0.0083 },
//         { pins: 24, rate: 0.0098 }
//       ]
//     },
//     {
//       type: 'Cans',
//       formula: '3.0e-5 * (Np)^2.01',
//       rates: [
//         { pins: 3, rate: 0.00027 },
//         { pins: 4, rate: 0.00049 },
//         { pins: 6, rate: 0.0011 },
//         { pins: 8, rate: 0.0020 },
//         { pins: 10, rate: 0.0031 },
//         { pins: 12, rate: 0.0044 },
//         { pins: 14, rate: 0.0060 },
//         { pins: 16, rate: 0.0079 }
//       ]
//     },
//     {
//       type: 'Nonhermetic: DIPs, PGA, SMT',
//       formula: '3.6e-4 * (Np)^1.08',
//       rates: [
//         { pins: 3, rate: 0.0012 },
//         { pins: 4, rate: 0.0016 },
//         { pins: 6, rate: 0.0025 },
//         { pins: 8, rate: 0.0034 },
//         { pins: 10, rate: 0.0043 },
//         { pins: 12, rate: 0.0053 },
//         { pins: 14, rate: 0.0062 },
//         { pins: 16, rate: 0.0072 },
//         { pins: 18, rate: 0.0082 },
//         { pins: 22, rate: 0.010 },
//         { pins: 24, rate: 0.011 },
//         { pins: 28, rate: 0.013 },
//         { pins: 36, rate: 0.017 },
//         { pins: 40, rate: 0.019 },
//         { pins: 64, rate: 0.032 },
//         { pins: 80, rate: 0.041 },
//         { pins: 128, rate: 0.068 },
//         { pins: 180, rate: 0.098 },
//         { pins: 224, rate: 0.12 }
//       ]
//     }
//   ];

//   const QUALITY_FACTORS = [
//     {
//       label: "10 Temperature Cycles (-55°C to +125°C) with end point electrical tests",
//       value: 0.10,
//       screeningLevel: "High"
//     },
//     {
//       label: "None beyond best commercial practices",
//       value: 1.0,
//       screeningLevel: "Standard"
//     }
//   ];

//   const calculateComponentSum = (currentComponent) => {

//     // const lambdac = handleCalculateBubble(currentComponent) + handleCalculateSawDevice(currentComponent) + handleCalculateGaAs(currentComponent) + handleCalculateVhsic(currentComponent) + handleCalculateMemories(currentComponent) + handleCalculateGate(currentComponent) + handleCalculateFailure(currentComponent);
//     const baseLambda = currentComponent?.baseFailureRate || mainInitialRate || 0;
//     const componentSum = baseLambda;


//     return  componentSum;
//   };

//   const [inputs, setInputs] = useState({
//     memoryType: dieComplexityRates[0],
//     memorySize: dieComplexityRates[0].rates[0],
//     technology: 'MOS', // MOS or Bipolar
//     packageType: packageRates[0],
//     pinCount: 3,
//     eepromType: 'Flotox', // Flotox or Textured-Poly
//     programmingCycles: a1Factors[0],
//     a2Factor: a2Factors[0],
//     eccOption: eccOptions[0],
//     quality: QUALITY_FACTORS,
//     environment: getEnvironmentalOptions('AIA'),
//     systemLifeHours: 10000,
//     junctionTemp: 35,
//     partType: 'Logic',
//     manufacturingProcess: 'QML',
//     packageType: 'DIP',
//     packageHermeticity: 'Hermetic',
//     featureSize: 1.0,
//     dieArea: 0.5,
//     pinCount: 24,
//     esdSusceptibility: '0-1000'
//   });
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//    const [failureRates, setFailureRates] = useState({
//     microcircuits: 0,
//     capacitors: 0,
  
//   });
//     const [componentRates, setComponentRates] = useState({
//   microcircuits: 0,
//   capacitors: 0,
  
// });



//   const [frArr, setFrArr] = useState([0])


//   const [trate, setTotalRate] = useState(0);
//   const totalRate =  frArr.reduce((sum, item) => sum + item, 2);

//   const calculateTempFactor = (temp) => {
//     // Simplified exponential model for πT
//     return Math.exp((-14 / (8.617e-5)) * ((1 / (temp + 273)) - (1 / 298)));
//   };
 
//   const tableTheme = createTheme({
//     overrides: {
//       MuiTableRow: {
//         root: {
//           "&:hover": {
//             cursor: "pointer",
//             backgroundColor: "rgba(224, 224, 224, 1) !important",
//           },
//         },
//       },
//     },
//   });

//   const customStyles = {
//     control: (provided) => ({
//       ...provided,
//       minHeight: '38px',
//       height: '38px',
//       fontSize: '14px',
//       borderColor: '#ced4da',
//     }),
//     valueContainer: (provided) => ({
//       ...provided,
//       height: '38px',
//       padding: '0 12px',
//     }),
//     input: (provided) => ({
//       ...provided,
//       margin: '0px',
//       padding: '0px',
//     }),
//     indicatorsContainer: (provided) => ({
//       ...provided,
//       height: '38px',
//     }),
//     dropdownIndicator: (provided) => ({
//       ...provided,
//       padding: '8px',
//     }),
//     clearIndicator: (provided) => ({
//       ...provided,
//       padding: '8px',
//     }),
//     option: (provided) => ({
//       ...provided,
//       padding: '8px 12px',
//       fontSize: '14px',
//     }),
//     menu: (provided) => ({
//       ...provided,
//       marginTop: '2px',
//       zIndex: 9999,
//     }),
//     menuList: (provided) => ({
//       ...provided,
//       maxHeight: '150px',
//       overflowY: 'auto',
//     }),
//   };

//   const handleCalculateSawDevice = (values) => {
//     setMainInitialRate(values)
//   }

//   const environmentOptions = [

//     {
//       value: "GB",
//       label: "Ground, Benign (GB)",
//       factor: 0.50,
//       description: "Controlled laboratory or office environment"
//     },
//     {
//       value: "GF",
//       label: "Ground, Fixed (GF)",
//       factor: 2.0,
//       description: "Permanent ground installations with environmental controls"
//     },
//     {
//       value: "GM",
//       label: "Ground, Mobile (GM)",
//       factor: 4.0,
//       description: "Vehicles operating on improved roads"
//     },
//     {
//       value: "NS",
//       label: "Naval, Sheltered (NS)",
//       factor: 4.0,
//       description: "Below decks in harbor or calm seas"
//     },
//     {
//       value: "NU",
//       label: "Naval, Unsheltered (NU)",
//       factor: 6.0,
//       description: "On deck or in rough seas"
//     },
//     {
//       value: "AIC",
//       label: "Airborne, Inhabited Cargo (AIC)",
//       factor: 4.0,
//       description: "Cargo aircraft with human occupants"
//     },
//     {
//       value: "AIF",
//       label: "Airborne, Inhabited Fighter (AIF)",
//       factor: 5.0,
//       description: "Manned fighter/trainer aircraft"
//     },
//     {
//       value: "AUC",
//       label: "Airborne, Uninhabited Cargo (AUC)",
//       factor: 5.0,
//       description: "Unmanned cargo aircraft"
//     },
//     {
//       value: "AUF",
//       label: "Airborne, Uninhabited Fighter (AUF)",
//       factor: 8.0,
//       description: "Unmanned fighter aircraft"
//     },
//     {
//       value: "ARW",
//       label: "Airborne, Rotary Wing (ARW)",
//       factor: 8.0,
//       description: "Helicopters and other rotary aircraft"
//     },
//     {
//       value: "SF",
//       label: "Space, Flight (SF)",
//       factor: 0.50,
//       description: "Spacecraft in flight (not launch/re-entry)"
//     },
//     {
//       value: "MF",
//       label: "Missile, Flight (MF)",
//       factor: 5.0,
//       description: "Missiles during flight phase"
//     },
//     {
//       value: "ML",
//       label: "Missile, Launch (ML)",
//       factor: 12,
//       description: "Missiles during launch phase"
//     },
//     {
//       value: "CL",
//       label: "Cannon, Launch (CL)",
//       factor: 220,
//       description: "Gun-launched projectiles during firing"
//     }

   
//   ];


//   const getTechnologyFactor = () => {
//     const technologyMap = {
//       "Bipolar": {
//         basePiT: 0.10,
//         description: "Standard bipolar logic families (TTL, ECL, ALSTTL, etc.)"
//       },
//       "MOS": {
//         basePiT: 0.10,
//         description: "CMOS and MOS-based technologies (CMOS, Digital MOS, VHSIC)"
//       },
//       "BiCMOS": {
//         basePiT: 3.205e-8,
//         description: "Bipolar-CMOS hybrid technologies"
//       },
//       "GaAs": {
//         basePiT: 1.5,
//         description: "Gallium Arsenide technologies (GaAs MMIC/Digital)"
//       },
//       "Linear": {
//         basePiT: 0.65,
//         description: "Linear analog circuits"
//       }
//     };

//     return technologyMap[currentComponent.technology] || {
//       basePiT: 1.0,
//       description: "Unknown technology type"
//     };
//   };


//   useEffect(() => {
//     let sum = 0;
    
//     // Loop through all components
//     for (const component in componentRates) {
//       // Only add if the component exists and has a numeric value
//       if (component in componentRates && !isNaN(componentRates[component])) {
//         sum += componentRates[component];
//       }
//     }
//     console.log("Component Rates:", componentRates);
//     setTotalRate(sum);
//   }, [componentRates]);


// const onTotalFailureRateChange = useCallback((value) => {
//   setComponentRates(prev => ({
//     ...prev,
//     microcircuits: value
//   }));
// }, []);


// const capacitorTotalFRate = useCallback((value) => {
//   setComponentRates(prev => ({
//     ...prev,
//     capacitors: value
//   }));
// }, []);


// // const totalSystemFailureRate = useMemo(() => {
// //   return Object.values(componentRates).reduce((sum, rate) => {
// //      const numericRate = Number(rate) || 0;
// //     return sum + numericRate;
// //   }, 0);
// // }, [componentRates]);


// // useEffect(() => {
// //   console.log("Total system failure rate updated:", totalSystemFailureRate);

// // }, [totalSystemFailureRate]);


//   const getQualityFactor = () => {
//     return currentComponent.piQ; // Assuming this is already set in state
//   };
//   const getCircuitFunctionFactor = () => {
//     return currentComponent.piF;
//   }

//   const calculateHybridFailureRate = (component) => {

//     const componentSum = calculateComponentSum(quantity, currentComponent);
//     console.log("componentSum6788", componentSum)

//     //  const Nc = quantity
//     const piE = getEnvironmentFactor(currentComponent.environment) || 1;
//     console.log("piE", piE)
//     const piQ = currentComponent.quality?.value || getQualityFactor('MIL_M_38510_ClassB') || 1;
//     console.log("piQ", piQ)
//     const piF = getCircuitFunctionFactor();
//     const piL = calculateLearningFactor(currentComponent.yearsInProduction) || 1;

//     // Corrected formula based on MIL-HDBK-217: λp = Σ(Nc × λc) × (1 + 0.2 πE)  × πF × πQ × πL
//     const failureRate = componentSum * (1 + 0.2 * piE) * piF * piQ * piL;
//     console.log("failureRate", failureRate)
//     // Debug logging
//     setResults({
//       componentSum,
//       // Nc,
//       piE,
//       piF,
//       piQ,
//       piL,
//       failureRate
//     })
//     console.log("Calculation Parameters:", {
//       componentSum,
//       // Nc,
//       piE,
//       piF,
//       piQ,
//       piL,
//       failureRate
//     });

//     return failureRate;
//   };

 

//   return (
//     <div className="reliability-calculator">
    
//       <h2 className='text-center' style={{ fontSize: '2.0rem' }}>{currentComponent?.type ? currentComponent.type.replace(/,/g, ' ').trim() : 'Microcircuits Reliability Calculator'}</h2>
//       <div className="component-form">
//         <Row className="mb-2">
//           <Col md={12}>
//             <div className="form-group" >
//               <label>Part Type:</label>
//               <Select
//                 styles={customStyles}
//                 name="type"
//                 placeholder="Select"
//                 value={currentComponent.type ?
//                   { value: currentComponent.type, label: currentComponent.type } : null}
//                 onChange={(selectedOption) => {
//                   setCurrentComponent({ ...currentComponent, type: selectedOption.value });
//                 }}

//                 options={[
//                   { value: "Microcircuits,Gate/Logic Arrays And Microprocessors", label: "Microcircuits,Gate/Logic Arrays And Microprocessors" },
//                   { value: "Microcircuits,Memories", label: "Microcircuits,Memories" },
//                   { value: "Microcircuits,Hybrids", label: "Microcircuits,Hybrids" },
//                   { value: "Microcircuits,Saw Devices", label: "Microcircuits,Saw Devices" },
//                   { value: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS", label: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" },
//                   { value: "Microcircuit,GaAs MMIC and Digital Devices", label: "Microcircuit,GaAs MMIC and Digital Devices" },
//                   { value: "Microcircuit,Magnetic Bubble Memories", label: "Microcircuit,Magnetic Bubble Memories" }
//                 ]}
//               />
//             </div>
//           </Col>
//           {currentComponent.type === "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" && (
//            <MicroVhsic/>
//           )}
//           {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
//           <MicroGate/>
//           )}
//           {currentComponent.type === "Microcircuits,Hybrids" && (
//             <>
//               <Col md={4}>
//                 <div className="form-group">
//                   <label>Learning Factor (π<sub>L</sub>):</label>
//                   <Select
//                     style={customStyles}
//                     name="learningFactor"
//                     placeholder="Select Years in Production"
//                     onChange={(selectedOption) => {
//                       setCurrentComponent({
//                         ...currentComponent,
//                         yearsInProduction: selectedOption.value,
//                         piL: selectedOption.piL
//                       });
//                     }}
//                     options={[
//                       {
//                         value: 5.1,
//                         label: "≤ 0.5 years",
//                         piL: 2.0, // Direct value from table
//                         description: "Early production phase (highest learning factor)"
//                       },
//                       {
//                         value: 0.5,
//                         label: "0.5 years",
//                         piL: 1.8,
//                         description: "Initial production ramp-up"
//                       },
//                       {
//                         value: 1.0,
//                         label: "1.0 year",
//                         piL: 1.5,
//                         description: "Moderate experience"
//                       },
//                       {
//                         value: 1.5,
//                         label: "1.5 years",
//                         piL: 1.2,
//                         description: "Stabilizing production"
//                       },
//                       {
//                         value: 2.0,
//                         label: "≥ 2.0 years",
//                         piL: 1.0,
//                         description: "Mature production (lowest learning factor)"
//                       }
//                     ]}
//                   />
//                 </div>
//               </Col>

//               {/* Component Type Selection */}
//               <Col md={4}>
//                 <div className="form-group">
//                   <label>Component Type:</label>

//                   <Select
//                     isMulti
//                     styles={customStyles}
//                     name="componentType"
//                     placeholder="Select Component Type"
//                     value={selectedComponent}
//                     onChange={(selectedOptions) => {
//                       setSelectedComponent(selectedOptions || []);
//                       console.log("Selected Component:", selectedComponent)
//                     }}
//                     options={[
//                       {
//                         value: "Microcircuit",
//                         label: "Microcircuit",
//                       },
//                       {
//                         value: "DiscreteSemiconductor",
//                         label: "Discrete Semiconductor",
//                       },
//                       {
//                         value: "Capacitor",
//                         label: "Capacitor",
//                       },
//                       {
//                         value: "Other",
//                         label: "Other (λₙ = 0)",
//                       }
//                     ]}
//                   />
//                   <p>
//                     Selected values: {selectedComponent?.map(option => option.value).join(', ') || 'None selected'}
//                   </p>
//                 </div>
//               </Col>
//               {selectedComponent?.some(option => option.value === "Capacitor") && (

//                 <MicroCapacitor 
//                  capacitorTotalFRate = {capacitorTotalFRate}
//                 />

//               )}

//               {selectedComponent?.some(option => option.value === "Microcircuit") && (

//                 <Microcircuits
//                   onTotalFailureRateChange={onTotalFailureRateChange}
//                   setSelectedComponent = {setSelectedComponent}
//                   // handleFrChange={handleFrChange}
//                   />

//               )}

//               {selectedComponent?.some(option => option.value === "DiscreteSemiconductor") && (
//                 <>
//                   <MicroDiode  />

//                 </>
//               )}
          

//                 <Col md={4}>
//                   <div className="form-group mb-3">
                 
//                     <label>Failure Rate (λc):</label>
//                     <input
//                       type="string"
//                       step="0.000001"
//                       min="0"
//                       value={capacitorTotalFRate}
//                       placeholder="Props value will appear here"
//                     />
//                     <span className="unit">failures/10<sup>6</sup> hours</span>
//                   </div>
//                 </Col>

//                 <Col md={4}>
//                   <div className="form-group mb-3">
//                     <label>Quality Factor (π<sub>Q</sub>):</label>
//                     <Select
//                       styles={customStyles}

//                       name="qualityFactor"
//                       placeholder="Select Quality Factor (πQ)"

//                       onChange={(selectedOption) => {
//                         setCurrentComponent({
//                           ...currentComponent,
//                           quality: selectedOption.value,
//                           piQ: selectedOption.piQ
//                         });
//                       }}
//                       options={[
//                         {
//                           value: "MIL_M_38510_ClassS",
//                           label: "MIL-M-38510 Class S",
//                           piQ: 0.25,
//                           description: "Highest reliability military grade"
//                         },
//                         {
//                           value: "MIL_I_38535_ClassU",
//                           label: "MIL-I-38535 Class U",
//                           piQ: 0.25,
//                           description: "High reliability hybrid microcircuits"
//                         },
//                         {
//                           value: "MIL_H_38534_ClassS_Hybrid",
//                           label: "MIL-H-38534 Class S Hybrid",
//                           piQ: 0.25,
//                           description: "High reliability hybrid circuits"
//                         },
//                         {
//                           value: "MIL_M_38510_ClassB",
//                           label: "MIL-M-38510 Class B",
//                           piQ: 1.0,
//                           description: "Standard military grade"
//                         },
//                         {
//                           value: "MIL_I_38535_ClassQ",
//                           label: "MIL-I-38535 Class Q",
//                           piQ: 1.0,
//                           description: "Standard hybrid microcircuits"
//                         },
//                         {
//                           value: "MIL_H_38534_ClassB_Hybrid",
//                           label: "MIL-H-38534 Class B Hybrid",
//                           piQ: 1.0,
//                           description: "Standard hybrid circuits"
//                         },
//                         {
//                           value: "MIL_STD_883_ClassB1",
//                           label: "MIL-STD-883 Class B1",
//                           piQ: 2.0,
//                           description: "Screened commercial grade"
//                         },
//                         {
//                           value: "Commercial",
//                           label: "Commercial",
//                           piQ: 5.0,
//                           description: "Standard commercial grade (lowest reliability)"
//                         }
//                       ]}
//                       className="factor-select"
//                     />

//                   </div>
//                 </Col>

//                 <Col md={4}>
//                   <div className="form-group mb-3">
//                     <label>Environment (π<sub>E</sub>):</label>
//                     <Select
//                       styles={customStyles}
//                       name="environment"
//                       placeholder="Select Environment"

//                       onChange={(selectedOption) => {
//                         setCurrentComponent({
//                           ...currentComponent,
//                           environment: selectedOption.value,
//                           piE: selectedOption.piE
//                         });
//                       }}

//                       options={[
//                         {
//                           value: "GB",
//                           label: "Ground, Benign (GB)",
//                           piE: 0.50,
//                           description: "Controlled laboratory or office environment"
//                         },
//                         {
//                           value: "GF",
//                           label: "Ground, Fixed (GF)",
//                           piE: 2.0,
//                           description: "Permanent ground installations with environmental controls"
//                         },
//                         {
//                           value: "GM",
//                           label: "Ground, Mobile (GM)",
//                           piE: 4.0,
//                           description: "Vehicles operating on improved roads"
//                         },
//                         {
//                           value: "NS",
//                           label: "Naval, Sheltered (NS)",
//                           piE: 4.0,
//                           description: "Below decks in harbor or calm seas"
//                         },
//                         {
//                           value: "NU",
//                           label: "Naval, Unsheltered (NU)",
//                           piE: 6.0,
//                           description: "On deck or in rough seas"
//                         },
//                         {
//                           value: "AIC",
//                           label: "Airborne, Inhabited Cargo (AIC)",
//                           piE: 4.0,
//                           description: "Cargo aircraft with human occupants"
//                         },
//                         {
//                           value: "AIF",
//                           label: "Airborne, Inhabited Fighter (AIF)",
//                           piE: 5.0,
//                           description: "Manned fighter/trainer aircraft"
//                         },
//                         {
//                           value: "AUC",
//                           label: "Airborne, Uninhabited Cargo (AUC)",
//                           piE: 5.0,
//                           description: "Unmanned cargo aircraft"
//                         },
//                         {
//                           value: "AUF",
//                           label: "Airborne, Uninhabited Fighter (AUF)",
//                           piE: 8.0,
//                           description: "Unmanned fighter aircraft"
//                         },
//                         {
//                           value: "ARW",
//                           label: "Airborne, Rotary Wing (ARW)",
//                           piE: 8.0,
//                           description: "Helicopters and other rotary aircraft"
//                         },
//                         {
//                           value: "SF",
//                           label: "Space, Flight (SF)",
//                           piE: 0.50,
//                           description: "Spacecraft in flight (not launch/re-entry)"
//                         },
//                         {
//                           value: "MF",
//                           label: "Missile, Flight (MF)",
//                           piE: 5.0,
//                           description: "Missiles during flight phase"
//                         },
//                         {
//                           value: "ML",
//                           label: "Missile, Launch (ML)",
//                           piE: 12,
//                           description: "Missiles during launch phase"
//                         },
//                         {
//                           value: "CL",
//                           label: "Cannon, Launch (CL)",
//                           piE: 220,
//                           description: "Gun-launched projectiles during firing"
//                         }
//                       ]}
//                     />
//                   </div>
//                 </Col>
           
//               <Col md={4}>
//                 <div className="form-group mb-3">
//                   <label>Circuit Function (π<sub>F</sub>):</label>
//                   <Select
//                     styles={customStyles}
//                     name="circuitFunction"
//                     placeholder="Select Circuit Function"

//                     onChange={(selectedOption) => {
//                       setCurrentComponent({
//                         ...currentComponent,
//                         // circuitFunction: selectedOption.value,
//                         piF: selectedOption.piF
//                       });
//                     }}
//                     options={[
//                       { value: "Digital", label: "Digital", piF: 1.0 },
//                       { value: "Video", label: "Video (10MHz < f < 1GHz)", piF: 1.2 },
//                       { value: "Microwave", label: "Microwave (f > 1GHz)", piF: 2.6 },
//                       { value: "Linear", label: "Linear (f < 10MHz)", piF: 5.8 },
//                       { value: "Power", label: "Power", piF: 21 }
//                     ]}
//                   />
//                 </div>
//               </Col>
//               <div className='d-flex justify-content-between align-items-center'>
//                 <div>
//                   {results && (
//                     <Box
//                       component="div"
//                       onClick={() => setShowCalculations(!showCalculations)}
//                       sx={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         cursor: 'pointer',
//                         color: 'primary.main',
//                         '&:hover': {
//                           textDecoration: 'underline'
//                         }
//                       }}
//                       className="ms-auto mt-2"
//                     >
//                       <CalculatorIcon
//                         style={{ height: '30px', width: '40px' }}
//                         fontSize="large"
//                       />
//                       <Typography
//                         variant="body1"
//                         sx={{
//                           fontWeight: 'bold',
//                           fontSize: '0.95rem',
//                           ml: 1
//                         }}
//                       >
//                         {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
//                       </Typography>
//                     </Box>
//                   )}
//                 </div>

//                 <div className="text-end mt-3">
//                   <Button
//                     className="btn btn-primary"
//                     onClick={calculateHybridFailureRate}
//                   >
//                     Calculate Failure Rate
//                   </Button>
//                 </div>
//               </div>

//               {results && (
//                 <>
//                   <h2 className="text-center">Calculation Result</h2>
//                   <div className="d-flex flex-column gap-2">
//                     <div className="d-flex align-items-center">
//                       <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
//                       <span className="ms-2">
//                         {results?.failureRate?.toFixed(6)} failures/10<sup>6</sup> hours
//                         {console.log("far..", results)}
//                       </span>
//                     </div>
//                     {results?.parameters?.formula && (
//                       <div className="mt-2">
//                         <strong>Formula:</strong>
//                         <span className="ms-2 font-monospace">{result?.parameters?.formula}</span>
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}

//               {/* Detailed Calculations Table */}
//               {results && showCalculations && (
//                 <Row className="mb-4 mt-3">
//                   <Col>
//                     <div className="card">
//                       <div className="card-body">
//                         <MaterialTable
//                           columns={[
//                             {
//                               title: 'Component Type',
//                               field: 'type',
//                               render: rowData => (rowData?.currentComponent?.type || 'Hybrid Microcircuit')
//                             },
//                             {
//                               title: 'Quantity (Nₙ)',
//                               field: 'quantity',
//                               render: rowData => (rowData?.Nc || 1)
//                             },
//                             {
//                               title: 'Contribution (Nₙ × λₙ)',
//                               field: 'contribution',
//                               render: rowData => (rowData?.componentSum?.toFixed(6) || '0.000000')
//                             },
//                             {
//                               title: <span>π<sub>E</sub></span>,
//                               field: 'piE',
//                               render: rowData => (rowData?.piE?.toFixed(4) || '1.0000')
//                             },
//                             {
//                               title: <span>π<sub>Q</sub></span>,
//                               field: 'piQ',
//                               render: rowData => (rowData?.piQ?.toFixed(4) || '1.0000')
//                             },
//                             {
//                               title: <span>π<sub>F</sub></span>,
//                               field: 'piF',
//                               render: rowData => (rowData?.piF?.toFixed(4) || '1.0000')
//                             },
//                             {
//                               title: <span>π<sub>L</sub></span>,
//                               field: 'piL',
//                               render: rowData => (rowData?.piL?.toFixed(4) || '1.0000')
//                             },
//                             {
//                               title: "Total λₚ",
//                               field: 'totalFailureRate',
//                               render: rowData => (
//                                 <strong>{(rowData?.failureRate?.toFixed(6) || '0.000000')}</strong>
//                               )
//                             }
//                           ]}
//                           data={[results]}
//                           options={{
//                             search: false,
//                             paging: false,
//                             toolbar: false,
//                             headerStyle: {
//                               backgroundColor: '#CCE6FF',
//                               fontWeight: 'bold'
//                             },
//                             rowStyle: {
//                               backgroundColor: '#FFF'
//                             }
//                           }}
//                           components={{
//                             Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 8 }} />
//                           }}
//                         />


//                         <div className="formula-section mt-4">
//                           <Typography variant="h6" gutterBottom>
//                             Calculation Formula
//                           </Typography>
//                           <div className="alert alert-light">
//                             <code className="fs-5">
//                               λ<sub>p</sub> = Σ(N<sub>c</sub> × λ<sub>c</sub>) × (1 + 0.2  π<sub>E</sub>) × π<sub>F</sub> × π<sub>Q</sub> × π<sub>L</sub>
//                             </code>
//                           </div>
//                           <Typography variant="body1" paragraph>Where:</Typography>
//                           <ul>
//                             <li><strong>λ<sub>p</sub></strong> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>

//                             <li><strong>Σ(N<sub>c</sub> × λ<sub>c</sub>)</strong> = Sum of component contributions</li>
//                             <li><strong>λ<sub>c</sub></strong> = Failure Rate of each particular component</li>
//                             <li><strong>N<sub>c</sub></strong> = Number of each particular component</li>
//                             <li><strong>π<sub>E</sub></strong> = Environment factor</li>
//                             <li><strong>π<sub>F</sub></strong> = Circuit function factor</li>
//                             <li><strong>π<sub>Q</sub></strong> = Quality factor</li>
//                             <li><strong>π<sub>L</sub></strong> = Learning factor</li>
//                           </ul>
//                           <div className="alert alert-info mt-3">
//                             <strong>Note:</strong> Only microcircuits, discrete semiconductors, and capacitors contribute significantly to the failure rate. Other components are assumed to have λ<sub>c</sub> = 0.
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </Col>
//                 </Row>
//               )}
//             </>
//           )}

//           {currentComponent.type === "Microcircuits,Saw Devices" && (
//          <MicroSawDevice/>
//           )}

//           {currentComponent.type === "Microcircuit,GaAs MMIC and Digital Devices" && (
           
//            <MicroGaAs/>)}
         
//         </Row>
  
//         {currentComponent.type === "Microcircuits,Memories" && (
//         <MicroMemories/>
//         )}
      
//         <br />
//         {currentComponent.type === "Microcircuit,Magnetic Bubble Memories" && (
//         <MicroMagnetic/>

//         )}
//       </div>
//     </div>
//   );
// };

// export default MicrocircuitsCalculation;


{/* Programming Cycles / A1 Value Field */}
<Col md={4}>
  <div className="form-group">
    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
      {mode === 'A1' ? 'Programming Cycles (C) A1 for λcyc' : 'A₁ Value'}
    </label>
    <input
      className={`form-control ${errors.programmingCycles || errors.a1Value ? 'is-invalid' : ''}`}
      style={{
        width: "100%",
        padding: "0.375rem 0.75rem",
        fontSize: "1rem",
        lineHeight: "1.5",
        color: "#495057",
        backgroundColor: "#fff",
        border: errors.programmingCycles || errors.a1Value ? "1px solid #dc3545" : "1px solid #ced4da",
        borderRadius: "0.25rem",
        marginBottom: "1rem"
      }}
      type="number"
      name={mode === 'A1' ? 'programmingCycles' : 'a1Value'}
      min={mode === 'A1' ? '1' : '0.000001'}
      max={mode === 'A1' ? '500000' : '3.4'}
      step={mode === 'A1' ? '1' : '0.000001'}
      value={
        mode === 'A1'
          ? currentComponent.programmingCycles || ''
          : currentComponent.a1Value || ''
      }
      onChange={(e) => {
        const value = e.target.value ? parseFloat(e.target.value) : null;
        const updatedComponent = {
          ...currentComponent,
          [mode === 'A1' ? 'programmingCycles' : 'a1Value']: value,
          technology: 'Flotox'
        };

        if (value !== null) {
          updatedComponent[mode === 'A1' ? 'a1Value' : 'programmingCycles'] =
            mode === 'A1'
              ? 6.817e-6 * value
              : value / 6.817e-6;
        }

        setCurrentComponent(updatedComponent);
        setErrors({...errors, 
          [mode === 'A1' ? 'programmingCycles' : 'a1Value']: ''
        });
      }}
      placeholder={
        mode === 'A1'
          ? 'Enter cycles (1-500,000)'
          : 'Enter A₁ (0.000001-3.4)'
      }
    />
    {mode === 'A1' && errors.programmingCycles && (
      <div className="text-danger small mt-1">{errors.programmingCycles}</div>
    )}
    {mode === 'C' && errors.a1Value && (
      <div className="text-danger small mt-1">{errors.a1Value}</div>
    )}
    {/* Rest of the display logic remains the same */}
  </div>
</Col>

{/* A₂ Factor Field */}
<Col md={4}>
  <div className="form-group">
    <label>A₂ Factor for λ<sub>cyc</sub> (Textured-Poly):</label>
    <Select
      styles={{
        ...customStyles,
        control: (provided, state) => ({
          ...provided,
          borderColor: errors.a2Factor ? '#dc3545' : '#ced4da'
        })
      }}
      name="a2Factor"
      placeholder="Select A₂ Factor"
      value={currentComponent.a2Factor}
      onChange={(selectedOption) => {
        handleA2FactorChange(selectedOption);
        setErrors({...errors, a2Factor: ''});
      }}
     options={[
                         {
                           label: "Up to 300K cycles - 0",
                           value: "up_to_300k",
                           a2Value: 0,
                           maxCycles: 300000,
                           technology: "Textured-Poly"
                         },
                         {
                           label: "300K < C ≤ 400K - 1.1",
                           value: "300k_to_400k",
                           a2Value: 1.1,
                           maxCycles: 400000,
                           technology: "Textured-Poly"
                         },
                         {
                           label: "400K < C ≤ 500K - 2.3",
                           value: "400k_to_500k",
                           a2Value: 2.3,
                           maxCycles: 500000,
                           technology: "Textured-Poly"
                         }
                       ]}
      className="factor-select"
    />
    {errors.a2Factor && <div className="text-danger small mt-1">{errors.a2Factor}</div>}
  </div>
</Col>

{/* ECC Options Field */}
<Col md={4}>
  <div className="form-group">
    <label>Error Correction Code Options (π<sub>ECC</sub>) :</label>
    <Select
      styles={{
        ...customStyles,
        control: (provided, state) => ({
          ...provided,
          borderColor: errors.eccOption ? '#dc3545' : '#ced4da'
        })
      }}
      options={eccOptions}
      onChange={(selectedOption) => {
        handleChange(selectedOption);
        setErrors({...errors, eccOption: ''});
      }}
      value={selectedECC}
      placeholder="Select ECC Option"
      className="ecc-select"
    />
    {errors.eccOption && <div className="text-danger small mt-1">{errors.eccOption}</div>}
    {/* Rest of the display logic remains the same */}
  </div>
</Col>

{/* Memory Technology Field */}
<Col md={4}>
  <div className="form-group">
    <label>Memory Technology for (B<sub>1</sub>):</label>
    <Select
      styles={{
        ...customStyles,
        control: (provided, state) => ({
          ...provided,
          borderColor: errors.memoryTech ? '#dc3545' : '#ced4da'
        })
      }}
      name="memoryTech"
      placeholder="Select Technology"
      value={currentComponent.memoryTechOption}
      isDisabled={!currentComponent.memorySizeB1}
      onChange={(selectedOption) => {
        const updatedComponent = {
          ...currentComponent,
          memoryTechOption: selectedOption,
          memoryTech: selectedOption.value,
          B1: getBValueForTemp(
            selectedOption.value,
            currentComponent.memorySizeB1,
            25,
            'B1'
          ),
          techTemperatureB1: 25
        };
        setCurrentComponent(updatedComponent);
        updateComponentInList(updatedComponent);
        setErrors({...errors, memoryTech: ''});
      }}
      options={[
                      {
                        value: "Flotox",
                        label: "Flotox (B₁ only)",
                        description: "Uses B₁ factor only"
                      },
                      {
                        value: "Textured-Poly-B1",
                        label: "Textured-Poly (B₁)",
                        description: "Textured-Poly with B₁ factor"
                      },

                    ]}
      className="factor-select"
    />
    {errors.memoryTech && <div className="text-danger small mt-1">{errors.memoryTech}</div>}
  </div>
</Col>

{/* Memory Size B1 Field */}
<Col md={4}>
  <div className="form-group">
    <label>Memory Size for B₁:</label>
    <Select
      styles={{
        ...customStyles,
        control: (provided, state) => ({
          ...provided,
          borderColor: errors.memorySizeB1 ? '#dc3545' : '#ced4da'
        })
      }}
      name="memorySizeB1"
      placeholder="Select Memory Size"
      value={currentComponent.memorySizeB1Option}
      onChange={(selectedOption) => {
        const updatedComponent = {
          ...currentComponent,
          memorySizeB1Option: selectedOption,
          memorySizeB1: selectedOption.value,
          B1: getBValueForTemp(
            currentComponent.memoryTech,
            selectedOption.value,
            currentComponent.techTemperatureB1 || 25,
            'B1'
          )
        };
        setCurrentComponent(updatedComponent);
        updateComponentInList(updatedComponent);
        setErrors({...errors, memorySizeB1: ''});
      }}
       options={[
                      { value: 4096, label: "4K" },
                      { value: 16384, label: "16K" },
                      { value: 65536, label: "64K" },
                      { value: 262144, label: "256K" },
                      { value: 1048576, label: "1M" }
                    ]}
      className="factor-select"
    />
    {errors.memorySizeB1 && <div className="text-danger small mt-1">{errors.memorySizeB1}</div>}
  </div>
</Col>

{/* B1 Temperature Field */}
<Col md={4}>
  <div className="form-group">
    <label>Junction Temperature for B₁ (°C):</label>
    <input
      className={`form-control ${errors.techTemperatureB1 ? 'is-invalid' : ''}`}
      style={{
        borderColor: errors.techTemperatureB1 ? '#dc3545' : '#ced4da'
      }}
      name="techTemperatureB1"
      type="number"
      min="25"
      max="175"
      step="1"
      value={currentComponent.techTemperatureB1 ?? ''}
      onChange={(e) => {
        const rawValue = e.target.value;
        const temp = rawValue === '' ? null : Number(rawValue);
        const updatedComponent = {
          ...currentComponent,
          techTemperatureB1: temp,
          B1: (temp !== null && currentComponent.memoryTech && currentComponent.memorySizeB1)
            ? getBValueForTemp(
              currentComponent.memoryTech,
              currentComponent.memorySizeB1,
              temp,
              'B1'
            )
            : null
        };
        setCurrentComponent(updatedComponent);
        updateComponentInList(updatedComponent);
        setErrors({...errors, techTemperatureB1: ''});
      }}
      onBlur={(e) => {...}} // Your existing blur logic
      placeholder="25-175°C"
    />
    {errors.techTemperatureB1 && <div className="text-danger small mt-1">{errors.techTemperatureB1}</div>}
    {/* Rest of the display logic remains the same */}
  </div>
</Col>

{/* Memory Size B2 Field */}
<Col md={4}>
  <div className="form-group">
    <label>Memory Size (Textured-Poly<sup>3</sup>) for B₂:</label>
    <Select
      styles={{
        ...customStyles,
        control: (provided, state) => ({
          ...provided,
          borderColor: errors.memorySizeB2 ? '#dc3545' : '#ced4da'
        })
      }}
      name="memorySizeB2"
      placeholder="Select Memory Size"
      value={currentComponent?.memorySizeB2Option}
      onChange={(selectedOption) => {
        const updatedComponent = {
          ...currentComponent,
          memorySizeB2Option: selectedOption,
          memorySizeB2: selectedOption.value,
          B2: getBValueForTemp(
            'Textured-Poly-B2',
            selectedOption.value,
            currentComponent.techTemperatureB2 || 25,
            'B2'
          )
        };
        setCurrentComponent(updatedComponent);
        updateComponentInList(updatedComponent);
        setErrors({...errors, memorySizeB2: ''});
      }}
      options={[
                      { value: 0, label: "Flotox & Textured-Poly²" },
                      { value: 4096, label: "4K" },
                      { value: 16384, label: "16K" },
                      { value: 65536, label: "64K" },
                      { value: 262144, label: "256K" },
                      { value: 1024000, label: "1M" }
                    ]}
      className="factor-select"
    />
    {errors.memorySizeB2 && <div className="text-danger small mt-1">{errors.memorySizeB2}</div>}
    {/* Rest of the display logic remains the same */}
  </div>
</Col>

{/* B2 Temperature Field (conditional) */}
{currentComponent.memorySizeB2 !== 0 && (
  <Col md={4}>
    <div className="form-group">
      <label>Junction Temperature for B₂ (°C):</label>
      <input
        className={`form-control ${errors.techTemperatureB2 ? 'is-invalid' : ''}`}
        style={{
          borderColor: errors.techTemperatureB2 ? '#dc3545' : '#ced4da'
        }}
        name="techTemperatureB2"
        type="number"
        min="25"
        max="175"
        step="1"
        value={currentComponent.techTemperatureB2 ?? ''}
        onChange={(e) => {
          const rawValue = e.target.value;
          const temp = rawValue === '' ? null : Number(rawValue);
          if (temp !== currentComponent.techTemperatureB2) {
            const updatedComponent = {
              ...currentComponent,
              techTemperatureB2: temp,
              B2: getBValueForTemp(
                'Textured-Poly-B2',
                currentComponent.memorySizeB2,
                temp,
                'B2'
              )
            };
            setCurrentComponent(updatedComponent);
            updateComponentInList(updatedComponent);
            setErrors({...errors, techTemperatureB2: ''});
          }
        }}
        onBlur={(e) => {...}} // Your existing blur logic
        placeholder="25-175°C"
      />
      {errors.techTemperatureB2 && <div className="text-danger small mt-1">{errors.techTemperatureB2}</div>}
      {/* Rest of the display logic remains the same */}
    </div>
  </Col>
)}

{/* Memory Type Field */}
<Col md={4}>
  <div className="form-group">
    <label>Memory Type for (C<sub>1</sub>):</label>
    <Select
      styles={{
        ...customStyles,
        control: (provided, state) => ({
          ...provided,
          borderColor: errors.memoryType ? '#dc3545' : '#ced4da'
        })
      }}
      options={dieComplexityRates?.map(item => ({
        value: item,
        label: item.type
      }))}
      value={{
        value: inputs?.memoryType,
        label: inputs?.memoryType.type
      }}
      onChange={(selectedOption) => {
        setInputs(prev => ({
          ...prev,
          memoryType: selectedOption.value,
          memorySize: selectedOption.value.rates[0]
        }));
        setErrors({...errors, memoryType: ''});
      }}
    />
    {errors.memoryType && <div className="text-danger small mt-1">{errors.memoryType}</div>}
  </div>
</Col>

{/* Memory Size Field */}
<Col md={4}>
  <div className="form-group">
    <label>Memory Size (C<sub>1</sub>):</label>
    <Select
      styles={{
        ...customStyles,
        control: (provided, state) => ({
          ...provided,
          borderColor: errors.memorySize ? '#dc3545' : '#ced4da'
        })
      }}
      options={inputs?.memoryType.rates?.map(item => ({
        value: item,
        label: item.size
      }))}
      value={{
        value: inputs?.memorySize,
        label: inputs?.memorySize.size
      }}
      onChange={(selectedOption) => {
        setInputs(prev => ({
          ...prev,
          memorySize: selectedOption.value
        }));
        setErrors({...errors, memorySize: ''});
      }}
    />
    {errors.memorySize && <div className="text-danger small mt-1">{errors.memorySize}</div>}
  </div>
</Col>

{/* Technology Type Field */}
<Col md={4}>
  <div className="form-group">
    <label>Technology Type for (π<sub>T</sub>) :</label>
    <Select
      styles={{
        ...customStyles,
        control: (provided, state) => ({
          ...provided,
          borderColor: errors.technology ? '#dc3545' : '#ced4da'
        })
      }}
      name="technology"
      placeholder="Select Technology Type"
      onChange={(selectedOption) => {
        setCurrentComponent({
          ...currentComponent,
          technology: selectedOption.value,
          technologyType: selectedOption.label,
          calculatedPiT: calculatePiT(
            selectedOption.value,
            currentComponent.temperature || 25,
            selectedOption.Ea
          )
        });
        setErrors({...errors, technology: ''});
      }}
    options={[
                      {
                        value: "TTL,ASTTL,CML",
                        label: "TTL/ASTTL/CML (Bipolar Logic)",
                        description: "Standard TTL, Advanced Schottky TTL, and Current Mode Logic",
                        Ea: 0.4
                      },
                      {
                        value: "F,LTTL,STTL",
                        label: "F/LTTL/STTL (Fast/Low-Power TTL)",
                        description: "Fast, Low-Power, and Schottky TTL variants",
                        Ea: 0.45
                      },
                      {
                        value: "BiCMOS",
                        label: "BiCMOS (Bipolar CMOS Hybrid)",
                        description: "Combines bipolar and CMOS technologies",
                        Ea: 0.5
                      },
                      {
                        value: "III,f¹,ISL",
                        label: "III/f¹/ISL (Advanced Silicon)",
                        description: "High-speed/radiation-hardened silicon logic",
                        Ea: 0.6
                      },
                      {
                        value: "Digital MOS",
                        label: "Digital MOS (CMOS, VHSIC)",
                        description: "CMOS and VHSIC digital technologies",
                        Ea: 0.35
                      },
                      {
                        value: "Linear",
                        label: "Linear Analog (Bipolar/MOS)",
                        description: "Linear analog circuits (op-amps, regulators)",
                        Ea: 0.65
                      },
                      {
                        value: "Memories",
                        label: "Memories (Bipolar/MOS)",
                        description: "Memory chips (RAM, ROM, etc.)",
                        Ea: 0.6
                      },
                      {
                        value: "GaAs MMIC",
                        label: "GaAs MMIC (RF/Microwave)",
                        description: "Gallium Arsenide microwave/RF components",
                        Ea: 1.5
                      },
                      {
                        value: "GaAs Digital",
                        label: "GaAs Digital (High-Speed Logic)",
                        description: "Gallium Arsenide digital logic",
                        Ea: 1.4
                      }
                    ]}
    />
    {errors.technology && <div className="text-danger small mt-1">{errors.technology}</div>}
  </div>
</Col>

{/* Junction Temperature Field */}
<Col md={4}>
  <div className="form-group">
    <label>Junction Temperature (°C) for (π<sub>T</sub>) :</label>
    <input
      className={`form-control ${errors.temperature ? 'is-invalid' : ''}`}
      style={{
        width: "100%",
        padding: "0.375rem 0.75rem",
        fontSize: "1rem",
        lineHeight: "1.5",
        color: "#495057",
        backgroundColor: "#fff",
        border: errors.temperature ? "1px solid #dc3545" : "1px solid #ced4da",
        borderRadius: "0.25rem"
      }}
      type="number"
      name="temperature"
      min="-40"
      max="175"
      value={currentComponent.temperature}
      onChange={(e) => {
        handleInputChange(e);
        setErrors({...errors, temperature: ''});
      }}
    />
    {errors.temperature && <div className="text-danger small mt-1">{errors.temperature}</div>}
    <small>T<sub>j</sub> = T<sub>c</sub> + 0.9 (θ<sub>jc</sub>)(P<sub>D</sub>)</small>
  </div>
</Col>

{/* Pin Count Field */}
<Col md={4}>
  <div className="form-group">
    <label>No. of Functional Pins for (C<sub>2</sub>):</label>
    <input
      className={`form-control ${errors.pinCount ? 'is-invalid' : ''}`}
      style={{
        width: "100%",
        padding: "0.375rem 0.75rem",
        fontSize: "1rem",
        lineHeight: "1.5",
        color: "#495057",
        backgroundColor: "#fff",
        border: errors.pinCount ? "1px solid #dc3545" : "1px solid #ced4da",
        borderRadius: "0.25rem"
      }}
      type="number"
      name="pinCount"
      min="3"
      max="224"
      value={currentComponent.pinCount || 0}
      onChange={(e) => {
        setCurrentComponent({
          ...currentComponent,
          pinCount: parseInt(e.target.value)
        });
        setErrors({...errors, pinCount: ''});
      }}
    />
    {errors.pinCount && <div className="text-danger small mt-1">{errors.pinCount}</div>}
  </div>
</Col>