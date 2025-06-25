import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import {
  calculateMicrocircuitsAndMicroprocessorsFailureRate,
  // calculateMemoriesFailureRate,
  calculateHybridFailureRate,
  calculateSystemMetrics,
  calculatePiT,
  getEnvironmentFactor,
  getFailureRate,
  getCircuitFunctionFactor,
  getQualityFactor,
  getBValueForTemp,
  calculateGateArrayC1,
  calculateLearningFactor,
  BASE_FAILURE_RATE,
  calculateComponentSum,
  QUALITY_FACTORS,
  getEnvironmentalOptions,
  getEnvironmentLabel,
  calculateSawDeviceFailureRate

} from './Calculation.js';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
import Box from '@mui/material/Box';
import { Alert, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import MicroCapacitor from './MicroCapacitor.jsx';
import Microcircuits from './Microcircuits.jsx';
import MicroDiode from './MicroDiode.jsx';
import './Microcircuits.css'
import MaterialTable from "material-table";
import { tableIcons } from "../core/TableIcons";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@material-ui/core";


const MicrocircuitsCalculation = ({ onCalculate }) => {


  const [showCalculations, setShowCalculations] = useState(false);
  const [mainInitialRate, setMainInitialRate] = useState("")
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [currentDevice, setCurrentDevice] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState();
  const [results, setResults] = useState(false)
  const [quantity, setQuantity] = useState(null)
  const [currentComponents, setCurrentComponents] = useState(null);
  const [mode, setMode] = useState('A1');
  const [numberOfPins, setNumberOfPins] = useState(null);
  const [selectedECC, setSelectedECC] = React.useState(null);// 'A1' or 'C'
  const [currentComponent, setCurrentComponent] = useState({
    type: '',
    tcase: '',
    tcase1: '',
    temperature: '',
    dutyCycle: '',
    devices: '',
    complexFailure: '',
    environment: '',
    data: '',
    quality: '',
    quantity: '',
    microprocessorData: '',
    gateCount: '',
    technology: '',
    complexity: '',
    application: '',
    packageType: '',
    pinCount: '',
    yearsInProduction: '',
    memoryTemperature: '',
    techTemperatureB1: '',
    techTemperatureB2: '',
    writeDutyCycle: '',
    memorySizeB1: '',
    memorySizeB2: '',
    memoryTech: '',
    memoryTechOption: null,
    memorySizeB1Option: null,
    memorySizeB2Option: null,
    B1: null,
    B2: null,
    calculatedPiT: null,
    basePiT: null,
    piL: null
  });


  const [qualityFactor, setQualityFactor] = useState('')


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

  const calculateSawDeviceFailureRate = (component) => {
    const baseRate = BASE_FAILURE_RATE;
    const piQ = component.qualityFactor?.value || 1.0; // Default to 1.0 if not set
    const piE = getEnvironmentFactor(component?.environment?.value);

    return (baseRate * piQ * piE)?.toFixed(6);
  };
  // Application factors (πA)
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

  const calculateComponentSum = (newQuantity, currentComponent) => {
    const parsedQuantity = Math.max(1, parseInt(newQuantity));
    setQuantity(parsedQuantity);

    const baseLambda = currentComponent?.baseFailureRate || mainInitialRate || 0;
    const componentSum = parsedQuantity * baseLambda;


    return componentSum;
  };

  const [inputs, setInputs] = useState({
    memoryType: '',
    memorySize: '',
    technology: '', // MOS or Bipolar
    packageType: '',
    pinCount: 3,
    eepromType: '', // Flotox or Textured-Poly
    programmingCycles: '',
    a2Factor: '',
    eccOption: '',
    quality: '',
    environment: '',
    systemLifeHours: 10000,
    junctionTemp: 35,
    partType: '',
    manufacturingProcess: '',
    packageType: '',
    packageHermeticity: '',
    featureSize: 1.0,
    dieArea: 0.5,
    pinCount: 24,
    esdSusceptibility: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [errors, setErrors] = useState({
    memoryType: '',
    memorySize: '',
    technology: '',
    packageType: '',
    pinCount: 3,
    eepromType: '',
    programmingCycles: '',
    a2Factor: '',
    eccOption: '',
    quality: '',
    environment: '',
    systemLifeHours: 10000,
    junctionTemp: 35,
    partType: '',
    manufacturingProcess: '',
    packageType: '',
    packageHermeticity: '',
    featureSize: '',
    dieArea: '',
    pinCount: 24,
    esdSusceptibility: '',
    applicationFactor: '',
    temperature : '',
  });

  // Calculate temperature factor (πT)
  const calculateTempFactor = (temp) => {
    // Simplified exponential model for πT
    return Math.exp((-14 / (8.617e-5)) * ((1 / (temp + 273)) - (1 / 298)));
  };
  // In your ReliabilityCalculator.js, update the addComponent function:
  const componentColumns = [

    {
      title: <span>C<sub>1</sub></span>,
      field: 'calculationParams.C1',
      render: rowData => rowData?.C1?.toFixed(6),

    },
    {
      title: <span>C<sub>2</sub></span>,
      field: 'calculationParams.C2',
      render: rowData => rowData?.C2?.toFixed(6),

    },
    {
      title: <span>π<sub>L</sub></span>,
      field: 'calculationParams.piL',
      render: rowData => rowData?.piL?.toFixed(2),

    },
    {
      title: <span>π<sub>E</sub></span>,
      field: 'calculationParams?.piE',
      render: rowData => rowData?.piE?.toFixed(2),

    },
    {
      title: <span>π<sub>Q</sub></span>,
      field: 'calculationParams.piQ',
      render: rowData => Number(rowData?.piQ)?.toFixed(2)

    },
    {
      title: <span>π<sub>T</sub></span>,
      field: 'calculationParams.piT',
      render: rowData => rowData?.piT?.toFixed(2),

    },
    {
      title: 'Failure Rate',
      field: 'totalFailureRate',
      render: rowData => rowData?.λp?.toFixed(6),

    },

  ];

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
    setComponents(prev => {
      // If component already exists, update it
      const existingIndex = prev.findIndex(c => c.id === component.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = component;
        return updated;
      }
      // Otherwise add new component with unique ID
      return [...prev, { ...component, id: Date.now() }];
    });
  };

  const updateComponentInList = (component) => {
    if (components.some(c => c.id === component.id)) {
      addOrUpdateComponent(component);
    }
  };

  // Constants from your tables
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

  // Helper functions
  const getDieBaseRate = () => {
    return inputs.partType === 'Logic' ? 0.16 : 0.24;
  };

  const handleCalculateSawDevice = (values) => {
    setMainInitialRate(values)
  }
  const manufacturingProcessTypes = [
    { value: 'QML', factor: 0.55 },
    { value: 'QPL', factor: 0.55 },
    { value: 'Non-QML', factor: 2.0 },
    { value: 'Non-QPL', factor: 2.0 }
  ];

  const getManufacturingFactor = () => {
    const selected = manufacturingProcessTypes?.find(p => p.value === inputs.manufacturingProcess);
    if (!selected) return 2.0; // Default to non-QML/non-QPL factor
    return selected.factor;
  };
  const getPackageFactor = () => {
    const selected = packageTypes?.find(p => p.value === inputs.packageType);
    if (!selected) return 0;
    return inputs.packageHermeticity === 'Hermetic' ? selected.hermetic : selected.nonhermetic;
  };

  const getDieComplexityFactor = () => {
    const A = inputs.dieArea; // in cm²
    const Xs = inputs.featureSize; // in microns

    // Lookup table values (simplified from the image)
    const lookupTable = {
      '0.80': { max0_4: 8.0, max7: 14, max1_0: 19, max2_0: 38, max3_0: 58 },
      '1.00': { max0_4: 5.2, max7: 8.9, max1_0: 13, max2_0: 25, max3_0: 37 },
      '1.25': { max0_4: 3.5, max7: 5.8, max1_0: 8.2, max2_0: 16, max3_0: 24 }
    };

    // Check if we have a direct match in the lookup table
    const featureSizeKey = Xs.toString();
    if (lookupTable[featureSizeKey]) {
      const values = lookupTable[featureSizeKey];

      if (A <= 0.4) return values.max0_4;
      if (A <= 7) return values.max7;
      if (A <= 1.0) return values.max1_0;
      if (A <= 2.0) return values.max2_0;
      if (A <= 3.0) return values.max3_0;
    }

    // Fall back to the formula if no match in table
    return (A / 0.21) * Math.pow(2 / Xs, 2) * 0.64 + 0.36;
  };



  const getPackageBaseRate = () => {
    return 0.0022 + (1.72e-5 * inputs.pinCount);
  };

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

    // ... rest of your options (same structure for all)
  ];
  const calculateLambdaBP = () => {
    return 0.0022 + (1.72 * Math.pow(10, -5) * numberOfPins);
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


  const validateForm1 = () => {
    const newErrors = {};
    let isValid = true;



    if (currentComponent.type === "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS") {

      if (!inputs.packageType) {
        newErrors.packageType = "Please select Package Type";
        isValid = false;
      }

      if (!currentComponent.technology) {
        newErrors.technology = "Please select Technology Type";
        isValid = false;
      }

      if (
        currentComponent.temperature === undefined ||
        currentComponent.temperature === null ||
        currentComponent.temperature < -40 ||
        currentComponent.temperature > 175 ||
        !currentComponent.temperature
      ) {
        newErrors.temperature = "Enter Junction Temperature between -40°C and 175°C";
        isValid = false;
      }

      if (!inputs.featureSize || inputs.featureSize < 0.1) {
        newErrors.featureSize = "Enter valid Feature Size (≥ 0.1 microns)";
        isValid = false;
      }

      if (!inputs.dieArea || inputs.dieArea < 0.4 || inputs.dieArea > 3.0) {
        newErrors.dieArea = "Die Area must be between 0.4 cm² and 3.0 cm²";
        isValid = false;
      }

      if (!inputs.packageHermeticity) {
        newErrors.packageHermeticity = "Please select Package Hermeticity";
        isValid = false;
      }

      if (!inputs.manufacturingProcess) {
        newErrors.manufacturingProcess = "Please select Manufacturing Process";
        isValid = false;
      }

      if (!inputs.environment) {
        newErrors.environment = "Please select Environment";
        isValid = false;
      }

      if (!currentComponent.quality) {
        newErrors.quality = "Please select Quality Factor";
        isValid = false;
      }


    }

    setErrors(newErrors);
    console.log("erorrss.......................", errors)
    return isValid;
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
  const handleCalculateBubble = (values) => {
    setMainInitialRate(values)
  }

  const handleCalculateGaAs = (values) => {
    setMainInitialRate(values)
  }

  const handleCalculateVhsic = (value) => {
    setMainInitialRate(value)
  }
  const handleCalculateMemories = (value) => {
    setMainInitialRate(value)
  }
  const handleCalculateGate = (value) => {
    setMainInitialRate(value)
  }
  const handleCalculateFailure = (value) => {
    setMainInitialRate(value)
  }
  const handleInitialRate = (initialRate) => {
    setMainInitialRate(initialRate)
  }

  console.log(mainInitialRate)


  const calculateVhsicFailureRate = () => {
    if (!validateForm1()) return;
    try {
      // Calculate each component
      const λBD = getDieBaseRate();
      const πMFG = getManufacturingFactor();
      const πprT = getPackageFactor();
      // console.log("πprT:",πprT)
      const πCD = getDieComplexityFactor();
      const λBP = getPackageBaseRate();
      // console.log("λpkg:",λpkg)
      const λEOS = calculateLambdaBP();
      const πE = inputs.environment?.factor || 1.0;
      console.log("πE:", πE)
      // const πT = getTemperatureFactor()?.factor;
      const πT = calculatePiT(currentComponent.technology, currentComponent.temperature);
      const πQ = getQualityFactor();
      // console.log("πQ:",πQ)

      // Calculate final failure rate
      const dieContribution = λBD * πMFG * πT * πCD;

      const packageContribution = λBP * πprT * πE * πQ;
      console.log("packageContribution:", packageContribution)
      const eosContribution = λEOS;
      const totalFailureRate = dieContribution + packageContribution + eosContribution;
      console.log("totalFailureRate:", totalFailureRate);
      // Call onCalculate with the failure rate

      setResult({
        value: totalFailureRate?.toFixed(6),
        parameters: {
          λBD: λBD?.toFixed(4),
          πMFG: πMFG?.toFixed(4),
          πprT: πprT?.toFixed(4),
          πCD: πCD?.toFixed(4),
          λBP: λBP?.toFixed(6),
          λEOS: λEOS?.toFixed(6),
          πE: πE?.toFixed(4),
          πT: πT?.toFixed(4),
          πQ: πQ?.toFixed(4)
        }
      });
      setError(null);
      if (onCalculate) {
        onCalculate(totalFailureRate);
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  const calculateLambdaCyc = () => {
    // Validate required fields
    if (!currentComponent.memoryTech || !currentComponent.memorySizeB1) {
      console.error("Missing required memory technology or size");
      return 0;
    }

    // Get A1 value
    const A1 = mode === 'A1'
      ? currentComponent.a1Value || 0
      : 6.817e-6 * (currentComponent.programmingCycles || 0);

    // Get B1 value
    const B1 = currentComponent.B1 || getBValueForTemp(
      currentComponent.memoryTech,
      currentComponent.memorySizeB1,
      currentComponent.techTemperatureB1 || 25,
      'B1'
    ) || 0;

    // Initialize Textured-Poly specific factors
    let A2 = 0;
    let B2 = 0;

    if (currentComponent.memoryTech.includes('Textured-Poly')) {
      A2 = currentComponent.a2Factor?.a2Value || 0;
      B2 = currentComponent.memorySizeB2 === 0
        ? 0  // Explicitly set to 0 for Flotox & Textured-Poly²
        : (currentComponent.B2 || getBValueForTemp(
          'Textured-Poly-B2',
          currentComponent.memorySizeB2,
          currentComponent.techTemperatureB2 || 25,
          'B2'
        ) || 0);
    }

    // Get quality and ECC factors
    const piQ = getQualityFactor()?.value || 1;
    const piECC = selectedECC?.factor || 1;

    // Calculate λ_cyc
    const lambdaCyc = (A1 * B1 + (A2 * B2) / piQ) * piECC;
    console.log("lambdaCyc", lambdaCyc)
    return lambdaCyc;
  };

  const validateGaAsForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!currentComponent.environment) {
      newErrors.environment = "Please select Environment";
      isValid = false;
    }

    if (!currentComponent.packageType) {
      newErrors.packageType = "Please select Package Type";
      isValid = false;
    }

    if (
      !currentComponent.pinCount ||
      currentComponent.pinCount < 3 ||
      currentComponent.pinCount > 224
    ) {
      newErrors.pinCount = "Enter valid Pin Count (3 to 224)";
      isValid = false;
    }

    if (!currentComponent.application) {
      newErrors.application = "Please select Application Factor";
      isValid = false;
    }

    if (!currentComponent.yearsInProduction) {
      newErrors.yearsInProduction = "Please select Learning Factor";
      isValid = false;
    }

    if (!currentComponent.quality) {
      newErrors.quality = "Please select Quality Factor";
      isValid = false;
    }

    if (!currentComponent.technology) {
      newErrors.technology = "Please select Technology Type";
      isValid = false;
    }

    if (
      currentComponent.temperature === undefined ||
      currentComponent.temperature === null ||
      currentComponent.temperature < -40 ||
      currentComponent.temperature > 175
    ) {
      newErrors.temperature = "Enter valid Junction Temperature (-40°C to 175°C)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  const validateBubbleMemoryFields = () => {
    const newErrors = {};

    if (!currentComponent.bubbleChips || currentComponent.bubbleChips < 1)
      newErrors.bubbleChips = 'Enter a valid number of bubble chips (≥ 1).';

    if (!currentComponent.dissipativeElements || currentComponent.dissipativeElements < 1)
      newErrors.dissipativeElements = 'Enter dissipative elements (≥ 1).';

    if (!currentComponent.numberOfBits || currentComponent.numberOfBits < 1)
      newErrors.numberOfBits = 'Enter a valid number of bits (≥ 1).';

    if (!currentComponent.packageType)
      newErrors.packageType = 'Package type is required.';

    if (!currentComponent.pinCount || currentComponent.pinCount < 3)
      newErrors.pinCount = 'Pin count should be between 3 and 224.';

    if (currentComponent.dutyCycle < 0 || currentComponent.dutyCycle > 1 || currentComponent.dutyCycle === '')
      newErrors.dutyCycle = 'Duty cycle (πD) must be between 0 and 1.';

    if (!currentComponent.quality)
      newErrors.quality = 'Select a quality grade (πQ).';

    if (!currentComponent.tcase || currentComponent.tcase < 25 || currentComponent.tcase > 175)
      newErrors.tcase = 'Case temperature must be between 25°C and 175°C.';

    if (!currentComponent.tcase1)
      newErrors.tcase1 = 'Enter Junction temperature';

    if (!currentComponent.readsPerWrite || currentComponent.readsPerWrite < 1)
      newErrors.readsPerWrite = 'Reads per Write must be ≥ 1.';

    if (currentComponent.writeDutyCycle < 0 || currentComponent.writeDutyCycle > 1 || currentComponent.writeDutyCycle === '')
      newErrors.writeDutyCycle = 'Write Duty Cycle must be between 0 and 1.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMicrocircuitFields = () => {
    const errors = {};

    if (!currentComponent.applicationFactor) {
      errors.applicationFactor = "Enter Application Factor"
    }

    if (!inputs.environment) {
      errors.environment = "Select Environment"
    }

    if (!currentComponent.devices) {
      errors.devices = "Enter device type"
    }

    if (!currentComponent.complexFailure) {
      errors.complexFailure = "Select type"
    }

    if (!currentComponent.gateCount) {
      errors.gateCount = "Select value"
    }

    if (!currentComponent.packageType) {
      errors.gateCount = "Select value"
    }

    if (!currentComponent.packageType) {
      errors.packageType = "Select value"
    }

    if (!currentComponent.pinCount) {
      errors.pinCount = "Select value"
    }

    if (!currentComponent.quality) {
      errors.quality = "Select value"
    }

    if (!currentComponent.yearsInProduction) {
      errors.yearsInProduction = "Select value"
    }

    if (!currentComponent.technology) {
      errors.technology = "Select value"
    }

    if (!currentComponent.temperature) {
      errors.temperature = "Temperature must be between -40°C and 175°C.";
    }

    return errors;
  };






  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (currentComponent.type === "Microcircuits,Memories") {
      if (!currentComponent.quality) {
        newErrors.quality = "Please select Quality Factor";
        isValid = false;
      }

      if (!inputs.environment) {
        newErrors.environment = "Please select Environment";
        isValid = false;
      }

      if (mode === 'A1' && !currentComponent.programmingCycles) {
        newErrors.programmingCycles = "Enter Programming Cycles";
        isValid = false;
      }

      if (mode === 'C' && !currentComponent.a1Value) {
        newErrors.a1Value = "Enter A₁ value";
        isValid = false;
      }

      if (!currentComponent.a2Factor) {
        newErrors.a2Factor = "Please select A₂ Factor";
        isValid = false;
      }

      if (!selectedECC) {
        newErrors.eccOption = "Please select ECC Option";
        isValid = false;
      }

      // Memory B1
      if (!currentComponent.memoryTechOption) {
        newErrors.memoryTech = "Please select Memory Technology for B₁";
        isValid = false;
      }

      if (!currentComponent.memorySizeB1Option) {
        newErrors.memorySizeB1 = "Please select Memory Size for B₁";
        isValid = false;
      }

      if (
        currentComponent.techTemperatureB1 === null ||
        currentComponent.techTemperatureB1 === '' ||
        isNaN(currentComponent.techTemperatureB1)
      ) {
        newErrors.techTemperatureB1 = "Enter Junction Temperature for B₁";
        isValid = false;
      }

      // Memory B2
      if (!currentComponent.memorySizeB2Option) {
        newErrors.memorySizeB2 = "Please select Memory Size for B₂";
        isValid = false;
      }

      if (
        currentComponent.memorySizeB2 !== 0 &&
        (currentComponent.techTemperatureB2 === null ||
          currentComponent.techTemperatureB2 === '' ||
          isNaN(currentComponent.techTemperatureB2))
      ) {
        newErrors.techTemperatureB2 = "Enter Junction Temperature for B₂";
        isValid = false;
      }

      // Memory C1
      if (!inputs.memoryType || !inputs.memoryType.type) {
        newErrors.memoryType = "Please select Memory Type for C₁";
        isValid = false;
      }

      if (!inputs.memorySize || !inputs.memorySize.size) {
        newErrors.memorySize = "Please select Memory Size for C₁";
        isValid = false;
      }

      // πT
      if (!currentComponent.technology) {
        newErrors.technology = "Please select Technology Type (πT)";
        isValid = false;
      }

      if (
        currentComponent.temperature === null ||
        currentComponent.temperature === '' ||
        isNaN(currentComponent.temperature)
      ) {
        newErrors.temperature = "Enter Junction Temperature for πT";
        isValid = false;
      }

      // C2
      if (!currentComponent.packageType) {
        newErrors.packageType = "Please select Package Type for C₂";
        isValid = false;
      }

      if (
        currentComponent.pinCount === null ||
        currentComponent.pinCount === '' ||
        isNaN(currentComponent.pinCount)
      ) {
        newErrors.pinCount = "Enter valid Pin Count for C₂";
        isValid = false;
      }

      // πL
      if (!currentComponent.yearsInProduction) {
        newErrors.learningFactor = "Please select Learning Factor (πL)";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };




  const calculateMemoriesFailureRate = () => {

    if (!validateForm()) {
      return;
    }

    try {
      // Get C1 (Die Complexity Failure Rate)
      const c1 = inputs.technology === 'MOS'
        ? inputs.memorySize.mos
        : inputs.memorySize.bipolar;

      // Get C2 (Package Failure Rate)
      const c2 = getFailureRate(currentComponent.packageType, currentComponent.pinCount)

      // Calculate λcyc

      const lambdaCyc = calculateLambdaCyc();
      console.log("λcyc:", lambdaCyc)
      // Get πT (Temperature Factor)

      const piT = calculatePiT(currentComponent.technology, currentComponent.temperature);
      // Get πE (Environment Factor) - now includes both value and label
      const piE = inputs.environment?.factor || 1.0;
      const environmentLabel = inputs.environment?.label || 'Not specified';

      // Get πQ (Quality Factor) - now includes both value and label
      // const piQ =  getQualityFactor();
      const πQ = getQualityFactor();
      // const qualityLabel = inputs.quality1?.label || 'Not specified';
      console.log("πQ:", πQ)
      // Get πL (Learning Factor)
      const piL = currentComponent.piL;

      // Calculate final failure rate
      const failureRate = (c1 * piT + c2 * piE + lambdaCyc) * πQ * piL;
      //  console.log("Failure Rate:", failureRate);
      // Call onCalculate with the failure rate


      setResult({
        value: failureRate?.toFixed(6),
        parameters: {
          c1: c1?.toFixed(6),
          piT: piT?.toFixed(2),
          c2: c2?.toFixed(6),
          piE: piE?.toFixed(1),
          piELabel: environmentLabel,
          lambdaCyc: lambdaCyc?.toFixed(6),
          πQ: πQ?.toFixed(4),
          // piQLabel: qualityLabel,
          piL: piL?.toFixed(1),
          formula: 'λp = (C1 × πT + C2 × πE + λcyc) × πQ × πL'
        }
      });
      setError(null);
      if (onCalculate) {
        onCalculate(failureRate);
      }
    } catch (err) {
      setError(err.message);
    }

    // Get πT (Temperature Factor)

  }

  const calculateGaAsFailureRate = () => {
    if (!validateGaAsForm()) {
      return;
    }
    try {
      // Validate inputs
      if (!currentComponent.type) throw new Error("Please select a device type");
      if (!currentComponent.complexity) throw new Error("Please select complexity range");
      if (!currentComponent.application) throw new Error("Please select an application");
      if (!currentComponent.packageType) throw new Error("Please select a package type");
      if (!currentComponent.pinCount) throw new Error("Please enter number of pins");
      if (!currentComponent.yearsInProduction) throw new Error("Please select years in production");
      if (!currentComponent.quality) throw new Error("Please select quality class");
      if (!currentComponent.temperature) throw new Error("Please enter junction temperature");

      // Determine C1 based on type and complexity range
      let c1;
      if (currentDevice?.type === "MMIC") {
        if (currentComponent?.complexity === "1-100") {
          c1 = 4.5;
        } else if (currentComponent?.complexity === "101-1000") {
          c1 = 7.2;
        } else {
          throw new Error("Invalid MMIC complexity range");
        }
      } else { // Digital type
        if (currentComponent?.complexity === "1-1000") {
          c1 = 25;
        } else if (currentComponent?.complexity === "1001-10000") {
          c1 = 51;
        } else {
          throw new Error("Invalid Digital complexity range");
        }
      }

      // Get πA (application factor)
      const piA = currentComponent.piA;

      // Get C2 (package factor)
      const c2 = getFailureRate(currentComponent.packageType, currentComponent.pinCount)

      // Get πE (environment factor)
      const piE = currentComponent.piE;


      const Ea = 0.7; // eV
      const k = 8.617e-5; // eV/K
      const Tref = 273 + 25; // Reference temperature (25°C in Kelvin)
      const Tj = 273 + parseFloat(currentComponent.temperature); // Junction temp in Kelvin
      const piT = calculatePiT(currentComponent.technology, currentComponent.temperature);

      // Get πL (learning factor) and πQ (quality factor)
      const piL = currentComponent.piL;
      const piQ = currentComponent.piQ;

      // Calculate failure rate using the formula: λp = [C1 πT πA + C2 πE] πL πQ
      const dieContribution = c1 * piT * piA;
      const packageContribution = c2 * piE;
      const lambdaP = (dieContribution + packageContribution) * piL * piQ;

      // Call onCalculate with the failure rate

      setResult({
        value: lambdaP?.toFixed(6),
        parameters: {
          c1: c1?.toFixed(4),
          piT: piT?.toFixed(2),
          piA: piA?.toFixed(4),
          c2: c2?.toFixed(6),
          piE: piE?.toFixed(4),
          piL: piL?.toFixed(4),
          piQ: piQ?.toFixed(4)
        }
      });
      setError(null);
      if (onCalculate) {
        onCalculate(lambdaP);
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  const calculateBubbleMemoryFailureRate = () => {
    // Validate required inputs
    if (!currentComponent.bubbleChips || !currentComponent.dissipativeElements ||
      !currentComponent.numberOfBits || !currentComponent.packageType ||
      !currentComponent.environment || !currentComponent.quality ||
      !currentComponent.temperature) {
      setError("Please fill all required fields");
      return;
    }

    try {
      // Calculate complexity factors
      const N1 = parseFloat(currentComponent.dissipativeElements);
      const N2 = parseFloat(currentComponent.numberOfBits);

      // Control and Detection Structure Complexity
      const C11 = 0.00095 * Math.pow(N1, 0.40);
      const C21 = 0.0001 * Math.pow(N1, 0.226);

      // Memory Storage Area Complexity
      const C12 = 0.00007 * Math.pow(N2, 0.3);
      const C22 = 0.00001 * Math.pow(N2, 0.3);

      // Package factor (already set in packageType selection)
      const C2 = currentComponent.c2;


      // Temperature factors
      const TJ = parseFloat(currentComponent.temperature) + 10 + 273; // Convert to Kelvin
      const piT1 = 0.1 * Math.exp((-0.8 / (8.63e-5)) * ((1 / TJ) - (1 / 298)));
      const piT2 = 0.1 * Math.exp((-0.55 / (8.63e-5)) * ((1 / TJ) - (1 / 298)));

      // Write duty cycle factor
      const D = currentComponent.writeDutyCycle ? parseFloat(currentComponent.writeDutyCycle) : 0;
      const RW = currentComponent.readsPerWrite ? parseFloat(currentComponent.readsPerWrite) : 2154;
      let piW = (D <= 0.3 || RW >= 2154) ? 1 : (10 * D) / Math.pow(RW, 3);

      // For seed-bubble generators
      if (currentComponent.isSeedBubbleGenerator) {
        piW = Math.max(piW / 4, 1);
      }

      // Duty cycle factor
      const piD = 0.9 * D + 0.1;

      // Environment factor (already set in environment selection)
      const piE = currentComponent.piE;

      // Learning factor (already set in yearsInProduction selection)
      const piL = currentComponent.piL;

      // Quality factor (already set in quality selection)
      const piQ = currentComponent.piQ;

      // Number of chips
      const NC = parseFloat(currentComponent.bubbleChips);

      // Calculate failure rates
      const lambda1 = piQ * (NC * C11 * piT1 * piW + (NC * C21 + C2) * piE) * piD * piL;
      const lambda2 = piQ * NC * (C12 * piT2 + C22 * piE) * piL;
      const lambdaP = lambda1 + lambda2;
      // Call onCalculate with the failure rate

      console.log("lambdaP:", lambdaP)
      // Set results
      setResult({
        value: lambdaP?.toFixed(6),
        parameters: {
          c11: C11,
          c21: C21,
          c12: C12,
          c22: C22,
          c2: C2,
          piT1,
          piT2,
          piW,
          piD,
          piE,
          piL,
          piQ,
          lambda1,
          lambda2,
          lambdaP // Add lambdaP to parameters
        }
      });

      setError(null);
      if (onCalculate) {
        onCalculate(lambdaP);
      }
    } catch (err) {
      setError("Error in calculation: " + err.message);
    }
  };
  // Helper functions that should be defined elsewhere in your component
  const getQualityFactor = () => {
    return currentComponent.piQ; // Assuming this is already set in state
  };
  const getCircuitFunctionFactor = () => {
    return currentComponent.piF;
  }
  const calculateHybridFailureRate = (component) => {


    const newErrors = {};

    if (!currentComponent.yearsInProduction) newErrors.yearsInProduction = "Please select Years in Production.";
    if (!currentComponent.quality) newErrors.quality = "Please select a Quality Factor.";
    if (!quantity || quantity <= 0) newErrors.quantity = "Quantity must be greater than 0.";
    if (!currentComponent.environment) newErrors.environment = "Please select an Environment.";
    if (!currentComponent.piF) newErrors.piF = "Please select a Circuit Function.";
    if (!selectedComponent) newErrors.componentType = "Please select a Component Type.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Validate input
    // if (!component || !component.components) {
    //   console.error('Invalid component data');
    //   return 0;
    // }

    // Sum of (Nc × λc) for all components
    const componentSum = calculateComponentSum(quantity, currentComponent);
    console.log("componentSum6788", componentSum)

    const Nc = quantity
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
      Nc,
      piE,
      piF,
      piQ,
      piL,
      failureRate
    })
    console.log("Calculation Parameters:", {
      componentSum,
      Nc,
      piE,
      piF,
      piQ,
      piL,
      failureRate
    });

    return failureRate;
  };


  const addComponent = () => {
    let failureRate = 0;
    let calculationParams = {};
    let calculation = {};

    switch (currentComponent.type) {
      case 'Microcircuits,Gate/Logic Arrays And Microprocessors':
        failureRate = calculateMicrocircuitsAndMicroprocessorsFailureRate(currentComponent);
        calculationParams = {
          C1: calculateGateArrayC1(currentComponent),
          C2: 0,
          piT: calculatePiT(currentComponent.technology, currentComponent.temperature),
          piE: getEnvironmentFactor(currentComponent?.environment),
          piQ: getQualityFactor(currentComponent.quality),
          piL: calculateLearningFactor(currentComponent.yearsInProduction),
          λp: calculateMicrocircuitsAndMicroprocessorsFailureRate(currentComponent)
        };
        break;

      default:
        calculation = { error: 'Unsupported component type' };
    }


    const quantity = currentComponent.quantity || 1;
    const totalFailureRate = failureRate * quantity;

    // Create a new component object to add to the array
    const newComponent = {
      ...currentComponent,
      failureRate,
      totalFailureRate,
      calculationParams
    };


    setComponents([...components, newComponent]);


    setResults({
      failureRate,
      totalFailureRate,
      calculationParams
    });
  };


  return (
    <div className="reliability-calculator">
      {console.log("current component......", currentComponent)}
      {/* <h2 >Microcircuits</h2> */}
      <h2 className='text-center' style={{ fontSize: '2.0rem' }}>{currentComponent?.type ? currentComponent.type.replace(/,/g, ' ').trim() : 'Microcircuits Reliability Calculator'}</h2>
      <div className="component-form">


        <Row className="mb-2">
          <Col md={4} >
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
            <>
              <Col md={4}>
                <div className="form-group">
                  <label>Part Type (λ<sub>BD</sub>):</label>
                  <Select
                    styles={customStyles}
                    value={partTypes?.find(t => t.value === inputs.partType)}
                    onChange={(selectedOption) => {
                      setInputs(prev => ({
                        ...prev,
                        partType: selectedOption.value
                      }));
                    }}
                    options={partTypes}
                  />
                </div>
              </Col>


              <Col md={4}>
                <div className="form-group">
                  <label>ESD Susceptibility (V<sub>TH</sub>) (λ<sub>EOS</sub>):</label>
                  <Select
                    styles={customStyles}
                    value={esdLevels?.find(e => e.value === inputs.esdSusceptibility)}
                    onChange={(selectedOption) => {
                      setInputs(prev => ({
                        ...prev,
                        esdSusceptibility: selectedOption.value
                      }));
                    }}
                    options={esdLevels}
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Number of Package Pins (λ<sub>BP</sub>):</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={numberOfPins}
                    onChange={(e) => setNumberOfPins(parseInt(e.target.value) || 0)}
                    className="form-control"
                  />
                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Environment (π<sub>E</sub>):</label>
                  <Select
                    styles={customStyles}
                    value={inputs.environment}
                    onChange={(selectedOption) => setInputs(prev => ({
                      ...prev,
                      environment: {
                        value: selectedOption.value,
                        label: selectedOption.label,
                        factor: selectedOption.piE,  // Store as factor
                        description: selectedOption.description
                      },
                      πE: selectedOption.piE  // Also store directly as πE for easy access
                    }))}

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
                  {/* {errors.environment && <small className='text-danger'>{errors.environment}</small>} */}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Quality Factor (π<sub>Q</sub>):</label>
                  <Select
                    style={customStyles}
                    name="qualityFactor"
                    placeholder="Select Quality Class"
                    onChange={(selectedOption) => {

                      setCurrentComponent({
                        ...currentComponent,
                        quality: selectedOption.value,
                        piQ: selectedOption.piQ
                      });
                    }}
                    options={[
                      // Class S Categories (πQ = 0.25)
                      {
                        value: "MIL_M_38510_ClassS",
                        label: "Class S (MIL-M-38510, Class S)",
                        piQ: 0.25, // Store πQ for calculations
                        description: "Procured in full accordance with MIL-M-38510, Class S requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassU",
                        label: "Class S (MIL-I-38535, Class U)",
                        piQ: 0.25,
                        description: "Procured in full accordance with MIL-I-38535, Appendix B (Class U)."
                      },
                      {
                        value: "MIL_H_38534_ClassS_Hybrid",
                        label: "Class S Hybrid (MIL-H-38534, Level K)",
                        piQ: 0.25,
                        description: "Hybrids procured to Class S (Quality Level K) of MIL-H-38534."
                      },

                      // Class B Categories (πQ = 1.0)
                      {
                        value: "MIL_M_38510_ClassB",
                        label: "Class B (MIL-M-38510, Class B)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-M-38510, Class B requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassQ",
                        label: "Class B (MIL-I-38535, Class Q)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-I-38535 (Class Q)."
                      },
                      {
                        value: "MIL_H_38534_ClassB_Hybrid",
                        label: "Class B Hybrid (MIL-H-38534, Level H)",
                        piQ: 1.0,
                        description: "Hybrids procured to Class B (Quality Level H) of MIL-H-38534."
                      },

                      // Class B-1 Category (πQ = 2.0)
                      {
                        value: "MIL_STD_883_ClassB1",
                        label: "Class B-1 (MIL-STD-883)",
                        piQ: 2.0,
                        description: "Compliant with MIL-STD-883, paragraph 1.2.1 (non-hybrid)."
                      }
                    ]}
                  />
                </div>
              </Col>

            </>
          )}
          {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
            <Col md={4}>
              <div className="form-group">
                <label>Environment (π<sub>E</sub>):</label>
                <Select
                  style={customStyles}
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
                {errors.environment && <small className='text-danger'>{errors.environment}</small>}
              </div>
            </Col>
          )}
          {currentComponent.type === "Microcircuits,Hybrids" && (
            <>
              <Row>
                <Col md={4}>
                  <label>Learning Factor (π<sub>L</sub>):</label>
                  <Select
                    name="yearsInProduction"
                    styles={customStyles}
                    placeholder="Select Years in Production"
                    onChange={(option) =>
                      setCurrentComponent({
                        ...currentComponent,
                        yearsInProduction: option.value,
                        piL: option.piL
                      })
                    }
                    options={[
                      { value: 5.1, label: "≤ 0.5 years", piL: 2.0 },
                      { value: 0.5, label: "0.5 years", piL: 1.8 },
                      { value: 1.0, label: "1.0 year", piL: 1.5 },
                      { value: 1.5, label: "1.5 years", piL: 1.2 },
                      { value: 2.0, label: "≥ 2.0 years", piL: 1.0 }
                    ]}
                  />
                  {errors.yearsInProduction && (
                    <div className="text-danger small mt-1">{errors.yearsInProduction}</div>
                  )}
                </Col>

                <Col md={4}>
                  <label>Component Type:</label>
                  <Select
                    name="componentType"
                    styles={customStyles}
                    placeholder="Select Component Type"
                    value={selectedComponent}
                    onChange={(option) => setSelectedComponent(option)}
                    options={[
                      { value: "Microcircuit", label: "Microcircuit" },
                      { value: "DiscreteSemiconductor", label: "Discrete Semiconductor" },
                      { value: "Capacitor", label: "Capacitor" },
                      { value: "Other", label: "Other (λₙ = 0)" }
                    ]}
                  />
                  {errors.componentType && (
                    <div className="text-danger small mt-1">{errors.componentType}</div>
                  )}
                </Col>

                <Col md={4}>
                  <label>Quality Factor (π<sub>Q</sub>):</label>
                  <Select
                    name="quality"
                    styles={customStyles}
                    placeholder="Select Quality"
                    onChange={(option) =>
                      setCurrentComponent({
                        ...currentComponent,
                        quality: option.value,
                        piQ: option.piQ
                      })
                    }
                    options={[
                      { value: "Class S", label: "Class S", piQ: 0.25 },
                      { value: "Class B", label: "Class B", piQ: 1.0 },
                      { value: "Commercial", label: "Commercial", piQ: 5.0 }
                    ]}
                  />
                  {errors.quality && (
                    <div className="text-danger small mt-1">{errors.quality}</div>
                  )}
                </Col>

                <Col md={4}>
                  <label>Quantity (Nₙ):</label>
                  <input
                    name="quantity"
                    type="number"
                    className="form-control"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  {errors.quantity && (
                    <div className="text-danger small mt-1">{errors.quantity}</div>
                  )}
                </Col>

                <Col md={4}>
                  <label>Environment (π<sub>E</sub>):</label>
                  <Select
                    name="environment"
                    styles={customStyles}
                    placeholder="Select Environment"
                    onChange={(option) =>
                      setCurrentComponent({
                        ...currentComponent,
                        environment: option.value,
                        piE: option.piE
                      })
                    }
                    options={[
                      { value: "GB", label: "Ground, Benign", piE: 0.5 },
                      { value: "GF", label: "Ground, Fixed", piE: 2.0 },
                      { value: "GM", label: "Ground, Mobile", piE: 4.0 }
                    ]}
                  />
                  {errors.environment && (
                    <div className="text-danger small mt-1">{errors.environment}</div>
                  )}
                </Col>

                <Col md={4}>
                  <label>Circuit Function (π<sub>F</sub>):</label>
                  <Select
                    name="piF"
                    styles={customStyles}
                    placeholder="Select Circuit Function"
                    onChange={(option) =>
                      setCurrentComponent({
                        ...currentComponent,
                        piF: option.piF
                      })
                    }
                    options={[
                      { value: "Digital", label: "Digital", piF: 1.0 },
                      { value: "Video", label: "Video", piF: 1.2 },
                      { value: "Linear", label: "Linear", piF: 5.8 }
                    ]}
                  />
                  {errors.piF && (
                    <div className="text-danger small mt-1">{errors.piF}</div>
                  )}
                </Col>
              </Row>

              <div className="text-end mt-3">
                <Button className="btn btn-primary" onClick={calculateHybridFailureRate}>
                  Calculate Failure Rate
                </Button>
              </div>

              {results && (
                <>
                  <Typography variant="h6" className="mt-4">Calculation Result</Typography>
                  <p>
                    Predicted Failure Rate (λ<sub>p</sub>): <strong>{results.failureRate.toFixed(6)}</strong> failures/10<sup>6</sup> hours
                  </p>

                  <MaterialTable
                    columns={[
                      { title: 'Component Type', field: 'type', render: () => 'Hybrid Microcircuit' },
                      { title: 'Quantity (Nₙ)', field: 'Nc', render: () => results.Nc },
                      { title: 'Contribution (Nₙ × λₙ)', field: 'componentSum', render: () => results.componentSum.toFixed(6) },
                      { title: 'πE', field: 'piE', render: () => results.piE?.toFixed(2) },
                      { title: 'πQ', field: 'piQ', render: () => results.piQ?.toFixed(2) },
                      { title: 'πF', field: 'piF', render: () => results.piF?.toFixed(2) },
                      { title: 'πL', field: 'piL', render: () => results.piL?.toFixed(2) },
                      { title: 'Total λₚ', field: 'failureRate', render: () => <strong>{results.failureRate.toFixed(6)}</strong> },
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

                  <div className="mt-3">
                    <strong>Formula Used:</strong><br />
                    <code>{results.parameters.formula}</code>
                  </div>
                </>
              )}
            </>
          )}

          {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
            <>
              <Col md={4}>
                <div className="form-group">
                  <label>Device Application Factor:</label>
                  <Select
                    styles={customStyles}
                    name="applicationFactor"
                    placeholder="Select"
                    onChange={(selectedOption) => {
                      setCurrentComponent({ ...currentComponent, applicationFactor: selectedOption.value });
                    }}
                    options={[
                      { value: "MMIC Devices-Low Noise & Low Power", label: "MMIC Devices-Low Noise & Low Power" },
                      { value: "MMIC Devices-Driver & High Power", label: "MMIC Devices-Driver & High Power" },
                      { value: "MMIC Devices-Unknown", label: "MMIC Devices-Unknown" },
                      { value: "Digital Devices- All Digital Applications", label: "Digital Devices- All Digital Applications" },
                    ]}
                  />
                  {errors.applicationFactor && <small className='text-danger'>{errors.applicationFactor}</small>}
                </div>

              </Col>
            </>
          )}
          {currentComponent.type === "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" && (
            <>
              <div className='calculator-container'>
                <Row className="mb-3">
                  <Col md={4}>
                    <div className="form-group">
                      <label>Package Type for (π<sub>prT</sub>):</label>
                      <Select
                        styles={customStyles}
                        value={packageTypes?.find(p => p.value === inputs.packageType)}
                        onChange={(selectedOption) => {
                          setInputs(prev => ({
                            ...prev,
                            packageType: selectedOption.value
                          }));
                        }}
                        options={packageTypes}
                      />
                    </div>
                    {errors.packageType && <small className='text-danger'>{errors.packageType}</small>}
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>Technology Type for (π<sub>T</sub>):</label>
                      <Select
                        styles={customStyles}
                        name="technology"
                        placeholder="Select Technology Type"
                        onChange={(selectedOption) => {
                          setCurrentComponent({
                            ...currentComponent,
                            technology: selectedOption.value,
                            technologyType: selectedOption.label,
                            // Reset calculatedPiT when technology changes
                            calculatedPiT: calculatePiT(
                              selectedOption.value,
                              currentComponent.technology || 25, // Default to 25°C if not set
                              selectedOption.Ea // Pass the correct Ea for the technology
                            )
                          });
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
                    </div>
                    {errors.technology && <small className='text-danger'>{errors.technology}</small>}
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>Junction Temperature (°C) (π<sub>T</sub>):</label>
                      <input
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
                        type="number"
                        name="temperature"
                        min="-40"
                        max="175"
                        value={currentComponent.temperature}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.temperature && <small className='text-danger'>{errors.temperature}</small>}
                  </Col>

                  <Col md={4}>
                    <div className="form-group">
                      <label>Feature Size (X<sub>S</sub>) microns (π<sub>CD</sub>):</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.01"
                        value={inputs.featureSize}
                        onChange={(e) => {
                          setInputs(prev => ({
                            ...prev,
                            featureSize: parseFloat(e.target.value)
                          }));
                        }}
                        className="form-control"
                      />
                    </div>
                    {errors.featureSize && <small className='text-danger'>{errors.featureSize}</small>}
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>Die Area (A) in cm² for (π<sub>CD</sub>):</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={inputs.dieArea}
                        onChange={(e) => {
                          setInputs(prev => ({
                            ...prev,
                            dieArea: parseFloat(e.target.value)
                          }));
                        }}
                        className={`form-control ${inputs.dieArea && (inputs.dieArea < 0.4 || inputs.dieArea > 3.0)}`}
                      />
                      {/* {inputs.dieArea && (inputs.dieArea < 0.4 || inputs.dieArea > 3.0) && (
                        <div className="invalid-feedback">
                          Die Area (A) must be between 0.4 cm² and 3.0 cm²
                        </div>
                      )} */}
                    </div>
                    {errors.dieArea && <small className='text-danger'>{errors.dieArea}</small>}

                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>Package Hermeticity for (π<sub>prT</sub>):</label>
                      <Select
                        styles={customStyles}
                        value={{
                          value: inputs.packageHermeticity,
                          label: inputs.packageHermeticity === 'Hermetic' ? 'Hermetic' : 'Nonhermetic'
                        }}
                        onChange={(selectedOption) => {
                          setInputs(prev => ({
                            ...prev,
                            packageHermeticity: selectedOption.value
                          }));
                        }}
                        options={[
                          { value: 'Hermetic', label: 'Hermetic' },
                          { value: 'Nonhermetic', label: 'Nonhermetic' }
                        ]}
                      />
                    </div>
                    {errors.packageHermeticity && <small className='text-danger'>{errors.packageHermeticity}</small>}

                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label>Manufacturing Process (π<sub>MFG</sub>):</label>
                      <Select
                        styles={customStyles}
                        value={{
                          value: inputs.manufacturingProcess,
                          label: inputs.manufacturingProcess === 'QML' ? 'QML' :
                            inputs.manufacturingProcess === 'QPL' ? 'QPL' :
                              inputs.manufacturingProcess === 'Non-QML' ? 'Non-QML' : 'Non-QPL'
                        }}
                        onChange={(selectedOption) => {
                          setInputs(prev => ({
                            ...prev,
                            manufacturingProcess: selectedOption.value
                          }));
                        }}
                        options={[
                          { value: 'QML', label: 'QML' },
                          { value: 'QPL', label: 'QPL' },
                          { value: 'Non-QML', label: 'Non-QML' },
                          { value: 'Non-QPL', label: 'Non-QPL' }
                        ]}
                      />
                    </div>
                    {errors.manufacturingProcess && <div className="invalid-feedback">{errors.manufacturingProcess}</div>}

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
                    onClick={calculateVhsicFailureRate}
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

                <div>
                  {result && (
                    <>
                      <h2 className="text-center">Calculation Result</h2>
                      <div className="d-flex align-items-center">
                        <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                        <span className="ms-2">{result?.value} failures/10<sup>6</sup> hours</span>
                      </div>
                    </>
                  )}
                  {console.log("values...", result?.value)}
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
                                      title: <span>λ<sub>BD</sub></span>,
                                      field: 'λBD',
                                      render: rowData => rowData?.λBD || '-'
                                    },
                                    {
                                      title: <span>π<sub>MFG</sub></span>,
                                      field: 'πMFG',
                                      render: rowData => rowData?.πMFG || '-'
                                    },
                                    {
                                      title: <span>π<sub>prT</sub></span>,
                                      field: 'πprT',
                                      render: rowData => rowData?.πprT || '-'
                                    },
                                    {
                                      title: <span>π<sub>CD</sub></span>,
                                      field: 'πCD',
                                      render: rowData => rowData?.πCD || '-'
                                    },
                                    {
                                      title: <span>π<sub>Q</sub></span>,
                                      field: 'πQ',
                                      render: rowData => rowData?.πQ || '-'
                                    },
                                    {
                                      title: <span>π<sub>E</sub></span>,
                                      field: 'πE',
                                      render: rowData => (rowData?.inputs.environment?.factor || '-') // Display the stored factor
                                    },
                                    {
                                      title: <span>π<sub>T</sub></span>,
                                      field: 'πT',
                                      render: rowData => rowData?.πT || '-'
                                    },
                                    {
                                      title: <span>λ<sub>BP</sub></span>,
                                      field: 'λBP',
                                      render: rowData => rowData?.λBP || '-'
                                    },
                                    {
                                      title: <span>λ<sub>EOS</sub></span>,
                                      field: 'λEOS',
                                      render: rowData => rowData?.λEOS || '-'
                                    },
                                    {
                                      title: "Failure Rate",
                                      field: 'λp',
                                      render: rowData => rowData?.λp ? `${Number(rowData.λp)?.toFixed(6)}` : '-',
                                    }
                                  ]}
                                  data={[
                                    {
                                      λBD: result?.parameters?.λBD,
                                      πMFG: result?.parameters?.πMFG,
                                      πprT: result?.parameters?.πprT,
                                      πCD: result?.parameters?.πCD,
                                      λBP: result?.parameters?.λBP,
                                      λEOS: result?.parameters?.λEOS,
                                      πE: result?.parameters?.πE,  
                                      πT: result?.parameters?.πT,    
                                      πQ: result?.parameters?.πQ,    
                                      λp: result?.value
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
                                  λ<sub>p</sub> = (λ<sub>BD</sub> × π<sub>MFG</sub>× π<sub>T</sub>× π<sub>CD</sub>) + (λ<sub>BP</sub>× π<sub>E</sub>× π<sub>Q</sub> × π<sub>prT</sub>) + λ<sub>EOS</sub>
                                </Typography>
                                <Typography variant="body1" paragraph>Where:</Typography>
                                <ul>
                                  <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>
                                  <li>λ<sub>BD</sub> = Die base failure rate</li>
                                  <li>π<sub>MFG</sub> = Manufacturing process correction factor</li>
                                  <li>π<sub>prT</sub> = Package type correction factor</li>
                                  <li>π<sub>CD</sub> = Die complexity correction factor</li>
                                  <li>λ<sub>BP</sub> = Package base failure rate</li>
                                  <li>λ<sub>EOS</sub> = Electrical overstress failure rate</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </>
                  )}
                </div>
              </div>

            </>
          )}
          {currentComponent.type === "Microcircuits,Memories" && (
            <>
              <Col md={4}>
                <div className="form-group">
                  <label>Quality Factor (π<sub>Q</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="qualityFactor"
                    placeholder="Select Quality Class"
                    value={currentComponent.quality}
                    isInvalid={currentComponent.quality}
                    onChange={(selectedOption) => {
                      setQualityFactor(selectedOption)
                      setCurrentComponent({
                        ...currentComponent,
                        quality: selectedOption?.value,
                        piQ: selectedOption.piQ
                      });
                      setErrors({ ...errors, quality: "" })
                    }}
                    options={[
                      // Class S Categories (πQ = 0.25)
                      {
                        value: "MIL_M_38510_ClassS",
                        label: "Class S (MIL-M-38510, Class S)",
                        piQ: 0.25, // Store πQ for calculations
                        description: "Procured in full accordance with MIL-M-38510, Class S requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassU",
                        label: "Class S (MIL-I-38535, Class U)",
                        piQ: 0.25,
                        description: "Procured in full accordance with MIL-I-38535, Appendix B (Class U)."
                      },
                      {
                        value: "MIL_H_38534_ClassS_Hybrid",
                        label: "Class S Hybrid (MIL-H-38534, Level K)",
                        piQ: 0.25,
                        description: "Hybrids procured to Class S (Quality Level K) of MIL-H-38534."
                      },

                      // Class B Categories (πQ = 1.0)
                      {
                        value: "MIL_M_38510_ClassB",
                        label: "Class B (MIL-M-38510, Class B)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-M-38510, Class B requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassQ",
                        label: "Class B (MIL-I-38535, Class Q)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-I-38535 (Class Q)."
                      },
                      {
                        value: "MIL_H_38534_ClassB_Hybrid",
                        label: "Class B Hybrid (MIL-H-38534, Level H)",
                        piQ: 1.0,
                        description: "Hybrids procured to Class B (Quality Level H) of MIL-H-38534."
                      },

                      // Class B-1 Category (πQ = 2.0)
                      {
                        value: "MIL_STD_883_ClassB1",
                        label: "Class B-1 (MIL-STD-883)",
                        piQ: 2.0,
                        description: "Compliant with MIL-STD-883, paragraph 1.2.1 (non-hybrid)."
                      }
                    ]}
                  />
                  {errors.quality && <small className="text-danger">{errors.quality}</small>}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Environment (π<sub>E</sub>):</label>
                  <Select
                    styles={customStyles}
                    value={inputs.environment}
                    onChange={(selectedOption) => setInputs(prev => ({
                      ...prev,
                      environment: {
                        value: selectedOption.value,
                        label: selectedOption.label,
                        factor: selectedOption.piE,
                        description: selectedOption.description
                      }
                    }))}

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
                {errors.environment && <small className="text-danger">{errors.environment}</small>}
              </Col>
              <label>  λ<sub>cyc</sub> :</label>
              <Col md={4}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    {mode === 'A1' ? 'Programming Cycles (C) A1 for λcyc' : 'A₁ Value'}
                  </label>
                  <input
                    className="form-control"
                    style={{
                      width: "100%",
                      padding: "0.375rem 0.75rem",
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      color: "#495057",
                      backgroundColor: "#fff",
                      border: "1px solid #ced4da",
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
                        technology: 'Flotox' // Auto-set for calculations
                      };

                      // Auto-calculate when input changes
                      if (value !== null) {
                        updatedComponent[mode === 'A1' ? 'a1Value' : 'programmingCycles'] =
                          mode === 'A1'
                            ? 6.817e-6 * value // Calculate A₁ from C
                            : value / 6.817e-6; // Calculate C from A₁
                      }

                      setCurrentComponent(updatedComponent);
                    }}
                    placeholder={
                      mode === 'A1'
                        ? 'Enter cycles (1-500,000)'
                        : 'Enter A₁ (0.000001-3.4)'
                    }
                  />

                  {mode === "A1" && errors.programmingCycles && (
                    <small className="text-danger">{errors.programmingCycles}</small>
                  )}

                  {mode === "C" && errors.a1Value && (
                    <small className="text-danger">{errors.a1Value}</small>
                  )}


                  {currentComponent.a1Value !== null && mode === 'A1' && (
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      Calculated A₁: {currentComponent.a1Value}
                    </div>
                  )}

                  {currentComponent.programmingCycles !== null && mode === 'C' && (
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      Calculated Cycles: {Math.round(currentComponent.programmingCycles)}
                    </div>
                  )}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>A₂ Factor for λ<sub>cyc</sub> (Textured-Poly):</label>
                  <Select
                    styles={customStyles}
                    name="a2Factor"
                    placeholder="Select A₂ Factor"
                    value={currentComponent.a2Factor}
                    onChange={handleA2FactorChange}
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
                </div>
                {errors.a2Factor && <small className="text-danger">{errors.a2Factor}</small>}

              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Error Correction Code Options (π<sub>ECC</sub>) for (λ<sub>cyc</sub>) :</label>
                  <Select
                    styles={customStyles}
                    options={eccOptions}
                    onChange={handleChange}
                    value={selectedECC}
                    placeholder="Select ECC Option"
                    className="ecc-select"
                  />

                  {selectedECC && (
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      Selected ECC Factor (ĒCC): {selectedECC.factor}
                    </div>
                  )}
                </div>
                {errors.eccOption && <small className="text-danger">{errors.eccOption}</small>}

              </Col>
            </>
          )}
          {/* Saw Devices Section */}
          {currentComponent.type === "Microcircuits,Saw Devices" && (
            <>
              <Col md={4}>
                <div className="form-group">
                  <label>Quality Factor (π<sub>Q</sub>):</label>
                  <Select
                    style={customStyles}
                    name="qualityFactor"
                    placeholder="Select Quality Factor (πQ)"
                    value={currentComponent.qualityFactor}
                    onChange={(selectedOption) => {
                      const updatedComponent = {
                        ...currentComponent,
                        qualityFactor: selectedOption,
                        piQ: selectedOption.piQ
                      };
                      setCurrentComponent(updatedComponent);
                      updateComponentInList(updatedComponent);
                    }}
                    options={[
                      {
                        label: "10 Temperature Cycles (-55°C to +125°C) with end point electrical tests",
                        value: 0.10,
                        screeningLevel: "High",
                        piQ: 0.10,
                      },
                      {
                        label: "None beyond best commercial practices",
                        value: 1.0,
                        screeningLevel: "Standard",
                        piQ: 1.0,
                      }
                    ]}
                    className="factor-select"
                  />
                </div>
                {errors.qualityFactor && <div className="text-danger mt-1">{errors.qualityFactor}</div>}
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Environment (π<sub>E</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="environment"
                    placeholder="Select Environment"
                    value={environmentOptions.find(opt => opt.value === currentComponent.environment?.value)}
                    onChange={(selectedOption) => {
                      const updatedComponent = {
                        ...currentComponent,
                        environment: {
                          value: selectedOption.value,
                          factor: selectedOption.factor,
                          description: selectedOption.description
                        },
                        piE: selectedOption.factor
                      };
                      setCurrentComponent(updatedComponent);
                      updateComponentInList(updatedComponent);
                    }}
                    options={environmentOptions}
                  />
                </div>
                {errors.environment && <div className="text-danger mt-1">{errors.environment}</div>}
              </Col>


              <div className='d-flex justify-content-between align-items-center mt-3'>

                <div>
                  {currentComponent.calculatedFailureRate && (
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
                    >
                      <CalculatorIcon style={{ height: '30px', width: '40px' }} fontSize="large" />
                      <Typography variant="body1" sx={{ fontWeight: 'bold', ml: 1 }}>
                        {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
                      </Typography>
                    </Box>
                  )}
                </div>
                <Button
                  variant="primary"
                  className="btn-calculate float-end "
                  style={{
                    backgroundColor: '#1e88e5',
                    borderColor: '#0d47a1',
                    fontWeight: 'bold',
                    padding: '8px 20px'
                  }}
                  onClick={() => {
                    const newErrors = {};

                    if (!currentComponent.qualityFactor) {
                      newErrors.qualityFactor = "Please select a Quality Factor (πQ).";
                    }

                    if (!currentComponent.environment) {
                      newErrors.environment = "Please select an Environment (πE).";
                    }

                    if (Object.keys(newErrors).length > 0) {
                      setErrors(newErrors);
                      return; // stop calculation
                    }

                    setErrors({}); // clear previous errors

                    const failureRate = calculateSawDeviceFailureRate(currentComponent);
                    if (failureRate) {
                      onCalculate(failureRate);
                      const updatedComponent = {
                        ...currentComponent,
                        calculatedFailureRate: failureRate,
                        environmentLabel: currentComponent.environment?.description,
                        qualityLabel: currentComponent.qualityFactor?.label
                      };
                      setCurrentComponent(updatedComponent);
                      addOrUpdateComponent(updatedComponent);
                    }
                  }}


                >
                  Calculate Failure Rate
                </Button>
              </div>

              {currentComponent?.calculatedFailureRate && (
                <div>
                  <h2 className="text-center">Calculation Result</h2>
                  <div className="d-flex align-items-center">
                    <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                    <span className="ms-2 fw-bold">
                      {currentComponent?.calculatedFailureRate} failures/10<sup>6</sup> hours
                    </span>
                  </div>
                  <br />
                  {showCalculations && (
                    <>
                      <Row className="mb-4">
                        <Col>
                          <div className="card">
                            <div className="card-body">
                              <MaterialTable
                                columns={[
                                  {
                                    title: <span>Base Rate</span>,
                                    field: 'baseRate',
                                    render: () => BASE_FAILURE_RATE?.toFixed(4)
                                  },
                                  {
                                    title: <span>Quality (π<sub>Q</sub>)</span>,
                                    field: 'piQ',
                                    render: () => (
                                      <div>

                                        <span>{currentComponent.piQ?.toFixed(4) || 'Not calculated'}</span>
                                      </div>
                                    )
                                  },
                                  {
                                    title: <span>Environment (π<sub>E</sub>)</span>,
                                    field: 'piE',
                                    render: () => (
                                      <div>

                                        <span>{currentComponent.piE?.toFixed(4) || 'Not calculated'}</span>
                                      </div>
                                    )
                                  },
                                  {
                                    title: 'Failure Rate (λₚ)',
                                    field: 'failureRate',
                                    render: () => currentComponent.calculatedFailureRate || 'Not calculated',
                                    cellStyle: { fontWeight: 'bold' }
                                  }
                                ]}
                                data={[currentComponent]}
                                options={{
                                  search: false,
                                  paging: false,
                                  toolbar: false,
                                  headerStyle: {
                                    backgroundColor: '#CCE6FF',
                                    fontWeight: 'bold'
                                  },
                                  rowStyle: { backgroundColor: '#FFF' }
                                }}
                                components={{
                                  Container: props => <Paper {...props} elevation={2} />
                                }}
                              />
                            </div>

                            <div className="formula-section mt-4 p-3 bg-light rounded">
                              <h4>Calculation Formula</h4>
                              <p className="mb-1">λ<sub>p</sub> = Base Rate × π<sub>Q</sub> × π<sub>E</sub></p>
                              <p className="mb-1">Where:</p>
                              <ul className="mb-0">
                                <li>Base Rate = {BASE_FAILURE_RATE} (standard for SAW devices)</li>
                                <li>π<sub>Q</sub> = Quality factor (from selected quality grade)</li>
                                <li>π<sub>E</sub> = Environment factor (from selected environment)</li>
                              </ul>
                            </div>
                          </div>

                        </Col>
                      </Row>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {currentComponent.type === "Microcircuit,GaAs MMIC and Digital Devices" && (
            <>
              <Col md={4}>
                <div className="form-group">
                  <label>Device Type for (C<sub>1</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="type"
                    value={{
                      value: currentDevice.type,
                      label: currentDevice.type === "MMIC"
                        ? "MMIC (Microwave IC)"
                        : currentDevice.type === "Digital"
                          ? "Digital IC"
                          : "Select Device Type"
                    }}

                    onChange={(selectedOption) => {
                      setCurrentDevice(prev => ({
                        ...prev,
                        type: selectedOption.value,
                        complexity: ""
                      }));
                    }}
                    options={[
                      { value: "MMIC", label: "MMIC (Microwave IC)" },
                      { value: "Digital", label: "Digital IC" }
                    ]}
                  />
                  {errors.currentDevice && <small className='text-danger'>{errors.currentDevice}</small>}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Complexity (C<sub>1</sub>):</label>
                  <Select
                    styles={customStyles}
                    value={{
                      value: currentComponent.complexity,
                      label: currentComponent.complexity
                        ? `${currentComponent.complexity} elements`
                        : "Select Complexity"
                    }}
                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        complexity: selectedOption.value
                      }));
                    }}
                    options={
                      currentDevice?.type === "MMIC"
                        ? [
                          { value: "1-100", label: "1-100 elements (C₁ = 4.5)" },
                          { value: "101-1000", label: "101-1000 elements (C₁ = 7.2)" }
                        ]
                        : [
                          { value: "1-1000", label: "1-1000 elements (C₁ = 25)" },
                          { value: "1001-10000", label: "1001-10000 elements (C₁ = 51)" }
                        ]
                    }
                  />
                  {errors.complexity && <small className='text-danger'>{errors.complexity}</small>}

                </div>
              </Col>


            </>)}
          {currentComponent.type === "Microcircuit,Magnetic Bubble Memories" && (
            <>
              <Col md={4}>
                <div className="form-group">
                  <label>Environment Factor (π<sub>E</sub>):</label>
                  <Select
                    styles={customStyles}

                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        environment: selectedOption.value,
                        piE: selectedOption.piE
                      }));
                    }}
                    options={[
                      { value: "GB", label: "GB - Ground Benign (πE = 0.50)", piE: 0.50 },
                      { value: "GF", label: "GF - Ground Fixed (πE = 2.0)", piE: 2.0 },
                      { value: "GM", label: "GM - Ground Mobile (πE = 4.0)", piE: 4.0 },
                      { value: "NS", label: "NS - Naval Sheltered (πE = 4.0)", piE: 4.0 },
                      { value: "NU", label: "NU - Naval Unsheltered (πE = 6.0)", piE: 6.0 },
                      { value: "AIC", label: "AIC - Airborne Inhabited Cargo (πE = 4.0)", piE: 4.0 },
                      { value: "AIF", label: "AIF - Airborne Inhabited Fighter (πE = 5.0)", piE: 5.0 },
                      { value: "AUC", label: "AUC - Airborne Uninhabited Cargo (πE = 5.0)", piE: 5.0 },
                      { value: "AUF", label: "AUF - Airborne Uninhabited Fighter (πE = 8.0)", piE: 8.0 },
                      { value: "ARW", label: "ARW - Airborne Rotary Wing (πE = 8.0)", piE: 8.0 },
                      { value: "SF", label: "SF - Space Flight (πE = 0.50)", piE: 0.50 },
                      { value: "MF", label: "MF - Missile Flight (πE = 5.0)", piE: 5.0 },
                      { value: "ML", label: "ML - Missile Launch (πE = 12)", piE: 12 },
                      { value: "CL", label: "CL - Cannon Launch (πE = 220)", piE: 220 }
                    ]}
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Learning Factor (π<sub>L</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"

                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        yearsInProduction: selectedOption.value,
                        piL: selectedOption.piL
                      }));
                    }}
                    options={[
                      { value: 0.1, label: "≤ 0.1 years (πL = 2.0)", piL: 2.0 },
                      { value: 0.5, label: "0.5 years (πL = 1.8)", piL: 1.8 },
                      { value: 1.0, label: "1.0 year (πL = 1.5)", piL: 1.5 },
                      { value: 1.5, label: "1.5 years (πL = 1.2)", piL: 1.2 },
                      { value: 2.0, label: "≥ 2.0 years (πL = 1.0)", piL: 1.0 }
                    ]}
                  />
                </div>
              </Col>


            </>)}
        </Row>
        {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
          <>
            <Row className="mb-2">

              <Col md={4}>
                <div className="form-group">
                  <label>Device Type for (C<sub>1</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="devices"
                    placeholder="Select"
                    onChange={(selectedOption) => {
                      setCurrentComponent({ ...currentComponent, devices: selectedOption.value });
                    }}
                    options={[
                      { value: "bipolarData", label: "Bipolar Digital and Linear Gate" },
                      { value: "mosData", label: "MOS Digital and Linear Gate" },
                      { value: "microprocessorData", label: "Microprocessor" }
                    ]}
                  />
                  {errors.devices && <small className='text-danger'>{errors.devices}</small>}
                </div>
              </Col>

              {/* Device-Specific Sections */}
              {currentComponent.devices === "bipolarData" && (
                <>

                  <Col md={4}>
                    <div className="form-group">
                      <label>Bipolar Devices for (C<sub>1</sub>):</label>

                      <Select
                        styles={customStyles}
                        className="mt-1"
                        name="complexFailure"
                        placeholder="Select"
                        onChange={(selectedOption) => {
                          setCurrentComponent({ ...currentComponent, complexFailure: selectedOption.value });
                        }}
                        options={[
                          { value: "digital", label: "Digital" },
                          { value: "linear", label: "Linear" },
                          { value: "pla", label: "PLA/PAL" }
                        ]}
                      />
                      {errors.complexFailure && <small className='text-danger'>{errors.complexFailure}</small>}

                    </div>

                  </Col>
                  <Col md={4}>
                    {currentComponent.complexFailure && (

                      <div className="form-group">
                        <label >
                          {currentComponent.complexFailure === "linear"
                            ? "Transistor Count for C1"
                            : "Gate Count for C1"}
                        </label>
                        <Select
                          styles={customStyles}
                          className="mt-1"
                          placeholder="select"
                          name="gateCount"

                          onChange={(selectedOption) => {
                            setCurrentComponent({ ...currentComponent, gateCount: selectedOption.value });
                          }}
                          options={
                            currentComponent.complexFailure === "digital" ? [
                              { value: "1-100", label: "1-100" },
                              { value: "101-1000", label: "101-1000" },
                              { value: "1001-3000", label: "1001-3000" },
                              { value: "3001-10000", label: "3001-10000" },
                              { value: "10001-30000", label: "10001-30000" },
                              { value: "30001-60000", label: "30001-60000" },
                            ] : currentComponent.complexFailure === "linear" ? [
                              { value: "1-100", label: "1-100" },
                              { value: "101-300", label: "101-300" },
                              { value: "301-1000", label: "301-1000" },
                              { value: "1001-10000", label: "1001-10000" },
                            ] : [
                              { value: "1-200", label: "1-200" },
                              { value: "201-1000", label: "201-1000" },
                              { value: "1001-5000", label: "1001-5000" },
                            ]
                          }
                        />
                        {errors.gateCount && <small className='text-danger'>{errors.gateCount}</small>}

                      </div>

                    )}
                  </Col>
                  <Col md={4}>

                  </Col>

                </>

              )}

              {/* MOS Devices Section */}
              {currentComponent.devices === "mosData" && (
                <>

                  <Col md={4}>
                    <div className="form-group">
                      <label>MOS Devices for (C<sub>1</sub>):</label>
                      <Select
                        styles={customStyles}
                        name="complexFailure"
                        placeholder="Select"
                        className="mt-1"
                        onChange={(selectedOption) => {
                          setCurrentComponent({ ...currentComponent, complexFailure: selectedOption.value });
                        }}
                        options={[
                          { value: "digital", label: "Digital" },
                          { value: "linear", label: "Linear" },
                          { value: "pla", label: "PLA/PAL" }
                        ]}
                      />
                    </div>
                  </Col>
                  <Col md={4}>
                    {currentComponent.complexFailure && (
                      <div className="form-group">
                        <label>
                          {currentComponent.complexFailure === "linear"
                            ? "Transistor Count for C1"
                            : "Gate Count for C1"}
                        </label>
                        <Select
                          styles={customStyles}
                          placeholder="select"
                          name="gateCount"
                          className="mt-1"
                          onChange={(selectedOption) => {
                            setCurrentComponent({ ...currentComponent, gateCount: selectedOption.value });
                          }}
                          options={
                            currentComponent.complexFailure === "digital" ? [
                              { value: "1-100", label: "1-100" },
                              { value: "101-1000", label: "101-1000" },
                              { value: "1001-3000", label: "1001-3000" },
                              { value: "3001-10000", label: "3001-10000" },
                              { value: "10001-30000", label: "10001-30000" },
                              { value: "30001-60000", label: "30001-60000" },
                            ] : currentComponent.complexFailure === "linear" ? [
                              { value: "1-100", label: "1-100" },
                              { value: "101-300", label: "101-300" },
                              { value: "301-1000", label: "301-1000" },
                              { value: "1001-10000", label: "1001-10000" },
                            ] : [
                              { value: "1-500", label: "1-200" },
                              { value: "501-1000", label: "201-1000" },
                              { value: "2001-5000", label: "1001-5000" },
                              { value: "5001-20000", label: "5001-20000" }
                            ]
                          }
                        />
                      </div>
                    )}
                  </Col>

                </>
              )}

              {/* Microprocessor Section */}
              {currentComponent.devices === "microprocessorData" && (
                <>
                  <Col md={4}>
                    <div className="form-group">
                      <label>Microprocessor for (C<sub>1</sub>):</label>
                      <Select
                        styles={customStyles}
                        name="complexFailure"
                        placeholder="Select"
                        onChange={(selectedOption) => {
                          setCurrentComponent({
                            ...currentComponent,
                            complexFailure: selectedOption.value,
                          });
                        }}
                        options={[
                          { value: "bipolar", label: "Bipolar" },
                          { value: "mos", label: "MOS" },
                        ]}
                      />
                    </div>
                  </Col>
                  <Col md={4}>
                    {currentComponent.complexFailure && (
                      <div className="form-group">
                        <label>
                          Microprocessor-{currentComponent.complexFailure} for (C<sub>1</sub>):
                        </label>
                        <Select
                          styles={customStyles}
                          placeholder="select"
                          name="gateCount"
                          onChange={(selectedOption) => {
                            setCurrentComponent({ ...currentComponent, gateCount: selectedOption.value });
                          }}
                          options={
                            currentComponent.complexFailure === "MOS" ? [
                              { value: "1-8", label: "1-8" },
                              { value: "8-16", label: "8-16" },
                              { value: "16-32", label: "16-32" },
                            ] : [
                              { value: "1-8", label: "1-8" },
                              { value: "8-16", label: "8-16" },
                              { value: "16-32", label: "16-32" },
                            ]
                          }
                        />
                      </div>
                    )}
                  </Col>

                </>
              )}
            </Row>
            {/* Package and Pins Section */}
            <Row className="mb-2">
              <Col md={4}>
                <div className="form-group">
                  <label>Package Type for (C<sub>2</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="packageType"
                    placeholder="Select Package Type"
                    onChange={(selectedOption) => {
                      setCurrentComponent({
                        ...currentComponent,
                        packageType: selectedOption.value
                      });
                    }}
                    options={[
                      { value: "Hermetic_DIPs_SolderWeldSeal", label: "Hermetic: DIPs w/Solder or Weld Seal, PGA, SMT" },
                      { value: "DIPs_GlassSeal", label: "DIPs with Glass Seal" },
                      { value: "Flatpacks_AxialLeads", label: "Flatpacks with Axial Leads" },
                      { value: "Cans", label: "Cans" },
                      { value: "Nonhermetic_DIPs_PGA_SMT", label: "Nonhermetic: DIPs, PGA, SMT" }
                    ]}
                  />
                  {errors.packageType && <small className='text-danger'>{errors.packageType}</small>}

                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>No. of Functional Pins for (C<sub>2</sub>):</label>
                  <input
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
                    type="number"
                    name="pinCount"
                    min="3"
                    max="224"
                    value={currentComponent.pinCount || ''}
                    onChange={(e) => setCurrentComponent({
                      ...currentComponent,
                      pinCount: parseInt(e.target.value)
                    })}
                  />
                  {errors.pinCount && <small className='text-danger'>{errors.pinCount}</small>}

                </div>
              </Col>

              {/* Quality and Learning Factors */}
              <Col md={4}>
                <div className="form-group">
                  <label>Quality Factor (π<sub>Q</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="qualityFactor"
                    placeholder="Select Quality Class"
                    onChange={(selectedOption) => {

                      setCurrentComponent({
                        ...currentComponent,
                        quality: selectedOption.value,
                        piQ: selectedOption.piQ
                      });
                    }}
                    options={[
                      // Class S Categories (πQ = 0.25)
                      {
                        value: "MIL_M_38510_ClassS",
                        label: "Class S (MIL-M-38510, Class S)",
                        piQ: 0.25, // Store πQ for calculations
                        description: "Procured in full accordance with MIL-M-38510, Class S requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassU",
                        label: "Class S (MIL-I-38535, Class U)",
                        piQ: 0.25,
                        description: "Procured in full accordance with MIL-I-38535, Appendix B (Class U)."
                      },
                      {
                        value: "MIL_H_38534_ClassS_Hybrid",
                        label: "Class S Hybrid (MIL-H-38534, Level K)",
                        piQ: 0.25,
                        description: "Hybrids procured to Class S (Quality Level K) of MIL-H-38534."
                      },

                      // Class B Categories (πQ = 1.0)
                      {
                        value: "MIL_M_38510_ClassB",
                        label: "Class B (MIL-M-38510, Class B)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-M-38510, Class B requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassQ",
                        label: "Class B (MIL-I-38535, Class Q)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-I-38535 (Class Q)."
                      },
                      {
                        value: "MIL_H_38534_ClassB_Hybrid",
                        label: "Class B Hybrid (MIL-H-38534, Level H)",
                        piQ: 1.0,
                        description: "Hybrids procured to Class B (Quality Level H) of MIL-H-38534."
                      },

                      // Class B-1 Category (πQ = 2.0)
                      {
                        value: "MIL_STD_883_ClassB1",
                        label: "Class B-1 (MIL-STD-883)",
                        piQ: 2.0,
                        description: "Compliant with MIL-STD-883, paragraph 1.2.1 (non-hybrid)."
                      }
                    ]}
                  />
                  {errors.quality && <small className='text-danger'>{errors.quality}</small>}

                </div>
              </Col>
            </Row>
            {/* Technology and Temperature */}
            <Row className="mb-2">
              <Col md={4}>
                <div className="form-group">
                  <label>Learning Factor (π<sub>L</sub>):</label>
                  <Select
                    styles={customStyles}
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
                        value: 0.1,
                        label: "≤ 0.1 years",
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

                  {errors.yearsInProduction && <small className='text-danger'>{errors.yearsInProduction}</small>}

                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Technology Type (π<sub>T</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="technology"
                    placeholder="Select Technology Type"
                    onChange={(selectedOption) => {
                      setCurrentComponent({
                        ...currentComponent,
                        technology: selectedOption.value,
                        technologyType: selectedOption.label,
                        // Reset calculatedPiT when technology changes
                        calculatedPiT: calculatePiT(
                          selectedOption.value,
                          currentComponent.temperature || 25, // Default to 25°C if not set
                          selectedOption.Ea // Pass the correct Ea for the technology
                        )
                      });
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
                  {errors.technology && <small className='text-danger'>{errors.technology}</small>}

                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Junction Temperature (°C) for (π<sub>T</sub>):</label>
                  <input
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
                    type="number"
                    name="temperature"
                    min="-40"
                    max="175"
                    value={currentComponent.temperature}
                    onChange={handleInputChange}
                  />
                  {errors.temperature && <small className='text-danger'>{errors.temperature}</small>}

                </div>
              </Col>
            </Row>

            {/* Calculate Button */}
            <div className='d-flex justify-content-between align-items-center'>
              <div >
                {results && (
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
              <button
                className="btn btn-primary"
                onClick={() => {
                  const validationErrors = validateMicrocircuitFields();
                  if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors);
                  } else {
                    setErrors({});
                    addComponent();
                  }
                }}
              >
                Calculate Failure Rate
              </button>
            </div>
            <br />
            {results && (
              <>
                <h2 className="text-center">Calculation Result</h2>
                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <p className="mb-1">
                      <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                      {calculateMicrocircuitsAndMicroprocessorsFailureRate(currentComponent)?.toFixed(4)}failures/10<sup>6</sup> hours
                    </p>

                  </div>
                </div>

              </>
            )}


            {showCalculations && (
              <>
                <div className="card ">
                  <div className="card-body">

                    <div className="component-list">

                      {console.log("currentComponent.......", currentComponent)}

                      {components.length === 0 ? (
                        <Typography variant="body1">No components added yet</Typography>
                      ) : (

                        <MaterialTable
                          columns={componentColumns}
                          data={[{
                            C1: calculateGateArrayC1(currentComponent),
                            C2: getFailureRate(currentComponent.packageType, currentComponent.pinCount),
                            piT: calculatePiT(currentComponent.technology, currentComponent.temperature),
                            piE: getEnvironmentFactor(currentComponent.environment),
                            piQ: getQualityFactor(currentComponent.quality),
                            piL: calculateLearningFactor(currentComponent.yearsInProduction),
                            λp: calculateMicrocircuitsAndMicroprocessorsFailureRate(currentComponent)
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
                            Container: props => <Paper {...props} elevation={2} />,
                          }}
                        />
                      )}
                      <br />
                    </div>

                    <h3>Calculation Formulas</h3>
                    <div className="formula-section">
                      {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
                        <>
                          <p>FR = (C<sub>1</sub> × π<sub>T</sub> + C<sub>2</sub> × π<sub>E</sub>) × π<sub>Q</sub> × π<sub>L</sub></p>
                          <p>Where:</p>
                          <ul>
                            <li>C<sub>1</sub> = Base failure rate (depends on gate count and complexity)</li>
                            <li>C<sub>2</sub> = Package failure rate (from MIL-HDBK-217 tables)</li>
                            <li>π<sub>T</sub> = Temperature factor (technology dependent)</li>
                            <li>π<sub>E</sub> = Environment factor (GB, GF, GM, etc.)</li>
                            <li>π<sub>Q</sub> = Quality factor (MIL-SPEC grade)</li>
                            <li>π<sub>L</sub> = Learning factor (years in production)</li>
                          </ul>
                        </>
                      )}
                    </div>
                  </div></div>
              </>
            )}
          </>
        )}

        {currentComponent.type === "Microcircuits,Memories" && (
          <>
            <Row >
              <Col md={4}>
                <div className="form-group">
                  <label>Memory Technology for (B<sub>1</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="memoryTech"
                    placeholder="Select Technology"
                    value={currentComponent.memoryTechOption}
                    isDisabled={!currentComponent.memorySizeB1}
                    onChange={(selectedOption) => {
                      const updatedComponent = {
                        ...currentComponent,
                        memoryTechOption: selectedOption,
                        memoryTech: selectedOption.value,
                        // Calculate initial B values at default 25°C
                        B1: getBValueForTemp(
                          selectedOption.value,  // memoryTech first
                          currentComponent.memorySizeB1,  // then memorySize
                          25,  // default temperature
                          'B1'
                        ),

                        techTemperatureB1: 25  // Set default temperature
                      };
                      setCurrentComponent(updatedComponent);
                      updateComponentInList(updatedComponent);
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
                </div>
                {errors.memoryTech && <small className="text-danger">{errors.memoryTech}</small>}
              </Col>
              {/* For B₁ Calculation */}
              <Col md={4}>
                <div className="form-group">
                  <label>Memory Size for B₁:</label>
                  <Select
                    styles={customStyles}
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
                </div>
                {errors.memorySizeB1 && <small className="text-danger">{errors.memorySizeB1}</small>}
              </Col>
              {/* B₁ Temperature Input */}
              <Col md={4}>
                <div className="form-group">
                  <label>Junction Temperature for B₁ (°C):</label>
                  <input
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
                    }}
                    onBlur={(e) => {
                      let temp = currentComponent.techTemperatureB1;
                      if (temp === null || isNaN(temp)) temp = 25;
                      else if (temp < 25) temp = 25;
                      else if (temp > 175) temp = 175;
                      else temp = Math.round(temp);

                      if (temp !== currentComponent.techTemperatureB1) {
                        const updatedComponent = {
                          ...currentComponent,
                          techTemperatureB1: temp,
                          B1: (currentComponent.memoryTech && currentComponent.memorySizeB1)
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
                      }
                    }}
                    placeholder="25-175°C"
                  />
                  {currentComponent.B1 !== null && (
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      Calculated B₁: {currentComponent.B1?.toFixed(6) || 'N/A'}
                    </div>
                  )}
                </div>
                {errors.techTemperatureB1 && <small className="text-danger">{errors.techTemperatureB1}</small>}

              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Memory Size  (Textured-Poly<sup>3</sup> )for B₂:</label>
                  <Select
                    styles={customStyles}
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
                </div>
                {console.log('currentComponent.memorySizeB2', currentComponent.memorySizeB2)}
                {errors.memorySizeB2 && <small className="text-danger">{errors.memorySizeB2}</small>}

                {currentComponent.memorySizeB2 == 0 && (
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    Calculated B₂: 0
                  </div>
                )}
              </Col>


              {currentComponent.memorySizeB2 !== 0 && (
                <Col md={4}>
                  <div className="form-group">
                    <label>Junction Temperature for B₂ (°C):</label>
                    <input
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
                        }
                      }}
                      onBlur={(e) => {
                        let temp = currentComponent.techTemperatureB2;
                        if (temp === null || isNaN(temp)) temp = 25;
                        else if (temp < 25) temp = 25;
                        else if (temp > 175) temp = 175;
                        else temp = Math.round(temp);

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
                        }
                      }}
                      placeholder="25-175°C"
                    />
                    {errors.techTemperatureB2 && <small className="text-danger">{errors.techTemperatureB2}</small>}

                    {currentComponent.B2 !== null && (
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                        Calculated B₂: {currentComponent.B2?.toFixed(6)}
                      </div>
                    )}
                  </div>
                </Col>
              )}
              <Col md={4}>
                <div className="form-group">
                  <label>Memory Type for (C<sub>1</sub>):</label>
                  <Select
                    styles={customStyles}
                    options={dieComplexityRates?.map(item => ({
                      value: item,
                      label: item.type
                    }))}
                    value={{
                      value: inputs.memoryType,
                      label: inputs.memoryType.type
                    }}
                    onChange={(selectedOption) => setInputs(prev => ({
                      ...prev,
                      memoryType: selectedOption.value,
                      memorySize: selectedOption.value.rates[0]
                    }))}
                  />
                </div>
                {errors.memoryType && <small className="text-danger">{errors.memoryType}</small>}

              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Memory Size (C<sub>1</sub>):</label>
                  <Select
                    styles={customStyles}
                    options={inputs.memoryType.rates?.map(item => ({
                      value: item,
                      label: item.size
                    }))}
                    value={{
                      value: inputs.memorySize,
                      label: inputs.memorySize.size
                    }}
                    onChange={(selectedOption) => setInputs(prev => ({
                      ...prev,
                      memorySize: selectedOption.value
                    }))}
                  />
                </div>
                {errors.memorySize && <small className="text-danger">{errors.memorySize}</small>}

              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Technology Type for (π<sub>T</sub>) :</label>
                  <Select
                    styles={customStyles}
                    name="technology"
                    placeholder="Select Technology Type"
                    onChange={(selectedOption) => {
                      setCurrentComponent({
                        ...currentComponent,
                        technology: selectedOption.value,
                        technologyType: selectedOption.label,
                        // Reset calculatedPiT when technology changes
                        calculatedPiT: calculatePiT(
                          selectedOption.value,
                          currentComponent.temperature || 25, // Default to 25°C if not set
                          selectedOption.Ea // Pass the correct Ea for the technology
                        )
                      });
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
                </div>
                {errors.technology && <small className="text-danger">{errors.technology}</small>}

              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Junction Temperature (°C) for (π<sub>T</sub>) :</label>
                  <input
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
                    type="number"
                    name="temperature"
                    min="-40"
                    max="175"
                    value={currentComponent.temperature}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.temperature && <small className="text-danger">{errors.temperature}</small>}

              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Package Type for (C<sub>2</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="packageType"
                    value={
                      currentComponent.technology
                        ? {
                          value: currentComponent.technology,
                          label: currentComponent.technologyType
                        }
                        : null
                    }
                    placeholder="Select Package Type"
                    onChange={(selectedOption) => {
                      setCurrentComponent({
                        ...currentComponent,
                        packageType: selectedOption.value
                      });
                    }}
                    options={[
                      { value: "Hermetic_DIPs_SolderWeldSeal", label: "Hermetic: DIPs w/Solder or Weld Seal, PGA, SMT" },
                      { value: "DIPs_GlassSeal", label: "DIPs with Glass Seal" },
                      { value: "Flatpacks_AxialLeads", label: "Flatpacks with Axial Leads" },
                      { value: "Cans", label: "Cans" },
                      { value: "Nonhermetic_DIPs_PGA_SMT", label: "Nonhermetic: DIPs, PGA, SMT" }
                    ]}
                  />
                </div>
                {errors.packageType && <small className="text-danger">{errors.packageType}</small>}
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>No. of Functional Pins for (C<sub>2</sub>):</label>
                  <input
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
                    type="number"
                    name="pinCount"
                    min="3"
                    max="224"
                    value={currentComponent.pinCount || ''}
                    onChange={(e) => setCurrentComponent({
                      ...currentComponent,
                      pinCount: parseInt(e.target.value)
                    })}
                  />
                </div>
                {errors.pinCount && <small className="text-danger">{errors.pinCount}</small>}

              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Learning Factor (π<sub>L</sub>):</label>
                  <Select
                    styles={customStyles}
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
                        value: 0.1,
                        label: "≤ 0.1 years",
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
                {errors.learningFactor && <small className="text-danger">{errors.learningFactor}</small>}

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
                onClick={calculateMemoriesFailureRate}

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

            {result && (
              <>
                <h2 className="text-center">Calculation Result</h2>
                <div className="d-flex align-items-center">
                  <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                  <span className="ms-2">{result.value} failures/10<sup>6</sup> hours</span>
                </div>
              </>
            )}

            {result && showCalculations && (
              <div className="card mt-3">
                <div className="card-body">
                  <MaterialTable
                    columns={[
                      {
                        title: <span>C<sub>1</sub></span>,
                        field: 'c1',
                        render: rowData => rowData?.c1 || '-'
                      },
                      {
                        title: <span>π<sub>T</sub></span>,
                        field: 'piT',
                        render: rowData => rowData?.piT || '-'
                      },
                      {
                        title: <span>C<sub>2</sub></span>,
                        field: 'c2',
                        render: rowData => rowData?.c2 || '-'
                      },
                      {
                        title: <span>π<sub>E</sub></span>,
                        field: 'piE',
                        render: rowData => (
                          <div>
                            <div>{rowData.piE}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                              {rowData?.piELabel}
                            </div>
                          </div>
                        )
                      },
                      {
                        title: <span>λ<sub>cyc</sub></span>,
                        field: 'lambdaCyc',
                        render: rowData => rowData?.lambdaCyc || '-'
                      },
                      {
                        title: <span>π<sub>Q</sub></span>,
                        field: 'πQ',
                        render: rowData => rowData?.πQ || '-'
                      },
                      {
                        title: <span>π<sub>L</sub></span>,
                        field: 'piL',
                        render: rowData => rowData?.piL || '-'
                      },
                      {
                        title: "Failure Rate",
                        field: 'λp',
                        render: rowData => rowData?.λp || '-'
                      }
                    ]}
                    data={[{
                      c1: result?.parameters?.c1,
                      piT: result?.parameters?.piT,
                      c2: result?.parameters?.c2,
                      piE: result?.parameters?.piE,

                      lambdaCyc: result?.parameters?.lambdaCyc,
                      // piQ: result?.parameters?.piQ,
                      πQ: (() => {
                        const piQValue = result?.parameters?.πQ;
                        console.log('piQ value:', piQValue);
                        return piQValue;
                      })(),
                      piL: result?.parameters?.piL,
                      λp: result?.value
                    }]}
                    options={{
                      search: false,
                      paging: false,
                      toolbar: false,
                      headerStyle: { backgroundColor: '#CCE6FF', fontWeight: 'bold' }
                    }}
                    components={{
                      Container: props => <Paper {...props} elevation={2} />
                    }}
                  />

                  <div className="mt-3">
                    <h5>Calculation Formula</h5>
                    <p>λ<sub>p</sub> = (C<sub>1</sub> × π<sub>T</sub> + C<sub>2</sub> × π<sub>E</sub> + λ<sub>cyc</sub>) × π<sub>Q</sub>× π<sub>L</sub></p>

                    <h5>Where:</h5>
                    <ul>
                      <li>C<sub>1</sub> = Die complexity failure rate (from memory type and size)</li>
                      <li>π<sub>T</sub> = Temperature factor (based on junction temperature)</li>
                      <li>C<sub>2</sub> = Package failure rate (from package type and pin count)</li>
                      <li>π<sub>E</sub> = Environment factor</li>
                      {inputs.memoryType.type.includes('EEPROM') && (
                        <li>λ<sub>cyc</sub> = Read/write cycling induced failure rate (for EEPROMs)</li>
                      )}
                      <li>π<sub>Q</sub> = Quality factor</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}


        {/* GaAs */}
        {currentComponent.type === "Microcircuit,GaAs MMIC and Digital Devices" && (
          <>
            <Row className="mb-3">
              <Col md={4}>
                <div className="form-group">
                  <label>Environment (π<sub>E</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select Environment"
                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        environment: selectedOption.value,
                        piE: selectedOption.piE
                      }));
                    }}
                    options={[
                      { value: "GB", label: "Ground Benign (πE = 0.5)", piE: 0.5 },
                      { value: "GF", label: "Ground Fixed (πE = 2.0)", piE: 2.0 },
                      { value: "GM", label: "Ground Mobile (πE = 4.0)", piE: 4.0 },
                      { value: "NS", label: "Naval Sheltered (πE = 4.0)", piE: 4.0 },
                      { value: "NU", label: "Naval Unsheltered (πE = 6.0)", piE: 6.0 },
                      { value: "AIC", label: "Airborne Cargo (πE = 4.0)", piE: 4.0 },
                      { value: "AIF", label: "Airborne Fighter (πE = 5.0)", piE: 5.0 },
                      { value: "AUC", label: "Airborne Uninhabited Cargo (πE = 5.0)", piE: 5.0 },
                      { value: "AUF", label: "Airborne Uninhabited Fighter (πE = 8.0)", piE: 8.0 },
                      { value: "ARW", label: "Airborne Rotary Wing (πE = 8.0)", piE: 8.0 },
                      { value: "SF", label: "Space Flight (πE = 0.5)", piE: 0.5 },
                      { value: "MF", label: "Missile Flight (πE = 5.0)", piE: 5.0 },
                      { value: "ML", label: "Missile Launch (πE = 12)", piE: 12 },
                      { value: "CL", label: "Cannon Launch (πE = 220)", piE: 220 }
                    ]}
                  />
                  {errors.environment && <small className="text-danger">{errors.environment}</small>}                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Package Type for (C<sub>2</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="packageType"
                    placeholder="Select Package Type"
                    onChange={(selectedOption) => {
                      setCurrentComponent({
                        ...currentComponent,
                        packageType: selectedOption.value
                      });
                    }}
                    options={[
                      { value: "Hermetic_DIPs_SolderWeldSeal", label: "Hermetic: DIPs w/Solder or Weld Seal, PGA, SMT" },
                      { value: "DIPs_GlassSeal", label: "DIPs with Glass Seal" },
                      { value: "Flatpacks_AxialLeads", label: "Flatpacks with Axial Leads" },
                      { value: "Cans", label: "Cans" },
                      { value: "Nonhermetic_DIPs_PGA_SMT", label: "Nonhermetic: DIPs, PGA, SMT" }
                    ]}
                  />
                  {errors.packageType && <small className="text-danger">{errors.packageType}</small>}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>No. of Functional Pins for (C<sub>2</sub>):</label>
                  <input
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
                    type="number"
                    name="pinCount"
                    min="3"
                    max="224"
                    value={currentComponent.pinCount || ''}
                    onChange={(e) => setCurrentComponent({
                      ...currentComponent,
                      pinCount: parseInt(e.target.value)
                    })}
                  />
                </div>
                {errors.pinCount && <small className="text-danger">{errors.pinCount}</small>}
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Application Factor (π<sub>A</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"

                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        application: selectedOption.value,
                        piA: selectedOption.piA
                      }));
                    }}
                    options={[
                      { value: "LowNoiseLowPower", label: "Low Noise & Low Power (πA = 1.0)", piA: 1.0 },
                      { value: "DriverHighPower", label: "Driver & High Power (πA = 3.0)", piA: 3.0 },
                      { value: "Unknown", label: "Unknown (πA = 3.0)", piA: 3.0 },
                      { value: "Digital", label: "Digital Applications (πA = 1.0)", piA: 1.0 }
                    ]}
                  />
                  {errors.application && <small className="text-danger">{errors.application}</small>}
                </div>
              </Col>


              <Col md={4}>
                <div className="form-group">
                  <label>Learning Factor (π<sub>L</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"
                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        yearsInProduction: selectedOption.value,
                        piL: selectedOption.piL
                      }));
                    }}
                    options={[
                      { value: 0.5, label: "≤ 0.5 years (πL = 2.0)", piL: 2.0 },
                      { value: 0.5, label: "0.5 years (πL = 1.8)", piL: 1.8 },
                      { value: 1.0, label: "1.0 year (πL = 1.5)", piL: 1.5 },
                      { value: 1.5, label: "1.5 years (πL = 1.2)", piL: 1.2 },
                      { value: 2.0, label: "≥ 2.0 years (πL = 1.0)", piL: 1.0 }
                    ]}
                  />
                  {errors.yearsInProduction && <small className="text-danger">{errors.yearsInProduction}</small>}
                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Quality Factor (π<sub>Q</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"
                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        quality: selectedOption.value,
                        piQ: selectedOption.piQ
                      }));
                    }}
                    options={[
                      // Class S Categories (πQ = 0.25)
                      {
                        value: "MIL_M_38510_ClassS",
                        label: "Class S (MIL-M-38510, Class S)",
                        piQ: 0.25,
                        description: "Procured in full accordance with MIL-M-38510, Class S requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassU",
                        label: "Class S (MIL-I-38535, Class U)",
                        piQ: 0.25,
                        description: "Procured in full accordance with MIL-I-38535, Appendix B (Class U)."
                      },
                      {
                        value: "MIL_H_38534_ClassS_Hybrid",
                        label: "Class S Hybrid (MIL-H-38534, Level K)",
                        piQ: 0.25,
                        description: "Hybrids procured to Class S (Quality Level K) of MIL-H-38534."
                      },
                      // Class B Categories (πQ = 1.0)
                      {
                        value: "MIL_M_38510_ClassB",
                        label: "Class B (MIL-M-38510, Class B)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-M-38510, Class B requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassQ",
                        label: "Class B (MIL-I-38535, Class Q)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-I-38535 (Class Q)."
                      },
                      {
                        value: "MIL_H_38534_ClassB_Hybrid",
                        label: "Class B Hybrid (MIL-H-38534, Level H)",
                        piQ: 1.0,
                        description: "Hybrids procured to Class B (Quality Level H) of MIL-H-38534."
                      },
                      // Class B-1 Category (πQ = 2.0)
                      {
                        value: "MIL_STD_883_ClassB1",
                        label: "Class B-1 (MIL-STD-883)",
                        piQ: 2.0,
                        description: "Compliant with MIL-STD-883, paragraph 1.2.1 (non-hybrid)."
                      }
                    ]}
                  />
                  {errors.quality && <small className="text-danger">{errors.quality}</small>}
                </div>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <div className="form-group">
                  <label>Technology Type for (π<sub>T</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="technology"
                    placeholder="Select Technology Type"
                    onChange={(selectedOption) => {
                      setCurrentComponent({
                        ...currentComponent,
                        technology: selectedOption.value,
                        technologyType: selectedOption.label,
                        calculatedPiT: calculatePiT(
                          selectedOption.value,
                          currentComponent.temperature || 25, // Default to 25°C if not set
                          selectedOption.Ea // Pass the correct Ea for the technology
                        )
                      });
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
                  {errors.technology && <small className="text-danger">{errors.technology}</small>}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Junction Temperature (°C) (π<sub>T</sub>):</label>
                  <input
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
                    type="number"
                    name="temperature"
                    min="-40"
                    max="175"
                    value={currentComponent.temperature}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.temperature && <small className="text-danger">{errors.temperature}</small>}
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

              <div>
                <Button
                  variant="primary"
                  onClick={calculateGaAsFailureRate}
                  className="btn-calculate float-end mb-4"
                >
                  Calculate Failure Rate
                </Button>
              </div>
            </div>

            {error && (
              <Row>
                <Col>
                  <Alert variant="danger">{error}</Alert>
                </Col>
              </Row>
            )}
            <br />

            {result && (
              <>
                <h2 className="text-center">Calculation Result</h2>
                <div className="d-flex align-items-center">
                  <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                  <span className="ms-3">{result?.value} failures/10<sup>6</sup> hours</span>
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
                                title: <span>C<sub>1</sub></span>,
                                field: 'c1',
                                render: rowData => rowData.c1 || '-'
                              },
                              {
                                title: <span>π<sub>T</sub></span>,
                                field: 'piT',
                                render: rowData => rowData.piT || '-'
                              },
                              {
                                title: <span>π<sub>A</sub></span>,
                                field: 'piA',
                                render: rowData => rowData.piA || '-'
                              },
                              {
                                title: <span>C<sub>2</sub></span>,
                                field: 'c2',
                                render: rowData => rowData.c2 || '-'
                              },
                              {
                                title: <span>π<sub>E</sub></span>,
                                field: 'piE',
                                render: rowData => rowData.piE || '-'
                              },
                              {
                                title: <span>π<sub>L</sub></span>,
                                field: 'piL',
                                render: rowData => rowData.piL || '-'
                              },
                              {
                                title: <span>π<sub>Q</sub></span>,
                                field: 'piQ',
                                render: rowData => rowData.piQ || '-'
                              },
                              {
                                title: "Failure Rate",
                                field: 'λp',
                                render: rowData => rowData.λp || '-',
                              }
                            ]}
                            data={[{
                              c1: result.parameters.c1,
                              piT: result.parameters.piT,
                              piA: result.parameters.piA,
                              c2: result.parameters.c2,
                              piE: result.parameters.piE,
                              piL: result.parameters.piL,
                              piQ: result.parameters.piQ,
                              λp: result.value
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
                        <div className="formula-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
                          <Typography variant="h6" gutterBottom>
                            Calculation Formula
                          </Typography>
                          <Typography variant="body1" paragraph>
                            λ<sub>p</sub> = [C<sub>1</sub> × π<sub>T</sub> × π<sub>A</sub> + C<sub>2</sub> × π<sub>E</sub>] × π<sub>L</sub> × π<sub>Q</sub>
                          </Typography>
                          <Typography variant="body1" paragraph>Where:</Typography>
                          <ul>
                            <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                            <li>C<sub>1</sub> = Die complexity failure rate</li>
                            <li>π<sub>T</sub> = Temperature factor</li>
                            <li>π<sub>A</sub> = Application factor</li>
                            <li>C<sub>2</sub> = Package failure rate</li>
                            <li>π<sub>E</sub> = Environment factor</li>
                            <li>π<sub>L</sub> = Learning factor</li>
                            <li>π<sub>Q</sub> = Quality factor</li>
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



        <br />
        {currentComponent.type === "Microcircuit,Magnetic Bubble Memories" && (
          <>
            <Row className="mb-3">
              <Col md={4}>
                <div className="form-group">
                  <label>Number of Bubble Chips per Package (N<sub>C</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="bubbleChips"
                    min="1"
                    value={currentComponent.bubbleChips || ''}
                    onChange={handleInputChange}
                  />
                  {errors.bubbleChips && <div className="text-danger">{errors.bubbleChips}</div>}
                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Dissipative Elements (N<sub>1</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="dissipativeElements"
                    min="1"
                    max="1000"
                    value={currentComponent.dissipativeElements || ''}
                    onChange={handleInputChange}
                  />
                  {errors.dissipativeElements && <div className="text-danger">{errors.dissipativeElements}</div>}
                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Number of Bits (N<sub>2</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="numberOfBits"
                    min="1"
                    max="9000000"
                    value={currentComponent.numberOfBits || ''}
                    onChange={handleInputChange}
                  />
                  {errors.numberOfBits && <div className="text-danger">{errors.numberOfBits}</div>}
                </div>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <div className="form-group">
                  <label>Package Type (C<sub>2</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"
                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        packageType: selectedOption.value,
                        c2: selectedOption.c2
                      }));
                    }}
                    options={[
                      { value: "Hermetic_DIPs_SolderWeldSeal", label: "Hermetic: DIPs w/Solder or Weld Seal", c2: 0.00092 },
                      { value: "DIPs_GlassSeal", label: "DIPs with Glass Seal", c2: 0.00047 },
                      { value: "Flatpacks_AxialLeads", label: "Flatpacks with Axial Leads", c2: 0.00022 },
                      { value: "Cans", label: "Cans", c2: 0.00027 },
                      { value: "Nonhermetic_DIPs", label: "Nonhermetic: DIPs", c2: 0.0012 }
                    ]}
                  />
                  {errors.packageType && <div className="text-danger">{errors.packageType}</div>}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>No. of Functional Pins for (C<sub>2</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="pinCount"
                    min="3"
                    max="224"
                    value={currentComponent.pinCount || ''}
                    onChange={(e) => setCurrentComponent({
                      ...currentComponent,
                      pinCount: parseInt(e.target.value)
                    })}
                  />
                  {errors.pinCount && <div className="text-danger">{errors.pinCount}</div>}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Duty Cycle Factor (π<sub>D</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="dutyCycle"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currentComponent.dutyCycle || ''}
                    onChange={handleInputChange}
                  />
                  {errors.dutyCycle && <div className="text-danger">{errors.dutyCycle}</div>}
                  <small className="form-text text-muted">
                    π<sub>D</sub> = 0.9D + 0.1 (D ≤ 1)
                  </small>
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Quality Factor (π<sub>Q</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"

                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        quality: selectedOption.value,
                        piQ: selectedOption.piQ
                      }));
                    }}
                    options={[
                      // Class S Categories (πQ = 0.25)
                      {
                        value: "MIL_M_38510_ClassS",
                        label: "Class S (MIL-M-38510, Class S)",
                        piQ: 0.25, // Store πQ for calculations
                        description: "Procured in full accordance with MIL-M-38510, Class S requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassU",
                        label: "Class S (MIL-I-38535, Class U)",
                        piQ: 0.25,
                        description: "Procured in full accordance with MIL-I-38535, Appendix B (Class U)."
                      },
                      {
                        value: "MIL_H_38534_ClassS_Hybrid",
                        label: "Class S Hybrid (MIL-H-38534, Level K)",
                        piQ: 0.25,
                        description: "Hybrids procured to Class S (Quality Level K) of MIL-H-38534."
                      },

                      // Class B Categories (πQ = 1.0)
                      {
                        value: "MIL_M_38510_ClassB",
                        label: "Class B (MIL-M-38510, Class B)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-M-38510, Class B requirements."
                      },
                      {
                        value: "MIL_I_38535_ClassQ",
                        label: "Class B (MIL-I-38535, Class Q)",
                        piQ: 1.0,
                        description: "Procured in full accordance with MIL-I-38535 (Class Q)."
                      },
                      {
                        value: "MIL_H_38534_ClassB_Hybrid",
                        label: "Class B Hybrid (MIL-H-38534, Level H)",
                        piQ: 1.0,
                        description: "Hybrids procured to Class B (Quality Level H) of MIL-H-38534."
                      },

                      // Class B-1 Category (πQ = 2.0)
                      {
                        value: "MIL_STD_883_ClassB1",
                        label: "Class B-1 (MIL-STD-883)",
                        piQ: 2.0,
                        description: "Compliant with MIL-STD-883, paragraph 1.2.1 (non-hybrid)."
                      }
                    ]}
                  />
                </div>
                {errors.quality && <div className="text-danger">{errors.quality}</div>}
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Case Temperature (°C):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="tcase"
                    min="25"
                    max="175"
                    value={currentComponent.tcase || ''}
                    onChange={handleInputChange}
                  />
                  {errors.tcase && <div className="text-danger">{errors.tcase}</div>}
                  <small className="form-text text-muted">
                    T<sub>CASE</sub> = Measured case temperature
                  </small>
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Junction Temperature (°C) (π<sub>T</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="temperature"
                    min="25"
                    max="175"
                    value={currentComponent.tcase1 ? Number(currentComponent.tcase1) + 10 : ''}
                    readOnly
                  />
                  {errors.tcase1 && <div className="text-danger">{errors.tcase1}</div>}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Reads per Write (R/W) for (π<sub>W</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="readsPerWrite"
                    min="1"
                    value={currentComponent.readsPerWrite || ''}
                    onChange={handleInputChange}
                  />
                  {errors.readsPerWrite && <div className="text-danger">{errors.readsPerWrite}</div>}

                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Write Duty Cycle Factor (π<sub>W</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="writeDutyCycle"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currentComponent.writeDutyCycle || ''}
                    onChange={handleInputChange}
                  />
                  {errors.writeDutyCycle && <div className="text-danger">{errors.writeDutyCycle}</div>}

                </div>
              </Col>
            </Row>
            <div className="d-flex justify-content-between align-items-center">
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
                onClick={() => {
                  if (validateBubbleMemoryFields()) {
                    calculateBubbleMemoryFailureRate();
                  }
                }}
                className="btn-calculate float-end mb-4"
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


            {result && showCalculations && (
              <>
                <div className="table-responsive mt-4">
                  <MaterialTable
                    columns={[
                      {
                        title: <span>C<sub>11</sub></span>,
                        field: 'c11',
                        render: rowData => rowData?.c11?.toFixed(6) || '-'
                      },
                      {
                        title: <span>C<sub>21</sub></span>,
                        field: 'c21',
                        render: rowData => rowData?.c21?.toFixed(6) || '-'
                      },
                      {
                        title: <span>C<sub>12</sub></span>,
                        field: 'c12',
                        render: rowData => rowData?.c12?.toFixed(6) || '-'
                      },
                      {
                        title: <span>C<sub>22</sub></span>,
                        field: 'c22',
                        render: rowData => rowData?.c22?.toFixed(6) || '-'
                      },
                      {
                        title: <span>C<sub>2</sub></span>,
                        field: 'c2',
                        render: rowData => rowData?.c2?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>T1</sub></span>,
                        field: 'piT1',
                        render: rowData => rowData?.piT1?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>T2</sub></span>,
                        field: 'piT2',
                        render: rowData => rowData?.piT2?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>W</sub></span>,
                        field: 'piW',
                        render: rowData => rowData?.piW?.toFixed(4) || '-'
                      },
                      {
                        title: <span>π<sub>D</sub></span>,
                        field: 'piD',
                        render: rowData => rowData.piD?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>E</sub></span>,
                        field: 'piE',
                        render: rowData => rowData?.piE?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>L</sub></span>,
                        field: 'piL',
                        render: rowData => rowData?.piL?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>Q</sub></span>,
                        field: 'piQ',
                        render: rowData => rowData?.piQ?.toFixed(6) || '-'
                      },
                      {
                        title: "λ₁ (Control)",
                        field: 'lambda1',
                        render: rowData => rowData?.lambda1?.toFixed(6) || '-',
                      },
                      {
                        title: "λ₂ (Memory)",
                        field: 'lambda2',
                        render: rowData => rowData?.lambda2?.toFixed(6) || '-',
                      },
                      {
                        title: "λₚ (Total)",
                        field: 'lambdaP',
                        render: rowData => rowData?.lambdaP || '-', // Display the full formatted string
                      }
                    ]}

                    data={[{
                      c11: result?.parameters?.c11,
                      c21: result?.parameters?.c21,
                      c12: result?.parameters?.c12,
                      c22: result?.parameters?.c22,
                      c2: result?.parameters?.c2,
                      piT1: result?.parameters?.piT1,
                      piT2: result?.parameters?.piT2,
                      piW: result?.parameters?.piW,
                      piD: result?.parameters?.piD,
                      piE: result?.parameters?.piE,
                      piL: result?.parameters?.piL,
                      piQ: result?.parameters?.piQ,
                      lambda1: result?.parameters?.lambda1,
                      lambda2: result?.parameters?.lambda2,
                      lambdaP: result?.value
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
                      },
                      cellStyle: {
                        textAlign: 'center'
                      }
                    }}
                    components={{
                      Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 8 }} />
                    }}

                  />
                </div>

                <div className="formula-section mt-3">
                  <h5>Calculation Formula</h5>
                  <p>λ<sub>p</sub> = λ<sub>1</sub> + λ<sub>2</sub></p>
                  <p>Where:</p>
                  <p>λ<sub>1</sub> = π<sub>Q</sub>[N<sub>C</sub>C<sub>11</sub>π<sub>T1</sub>π<sub>W</sub> + (N<sub>C</sub>C<sub>21</sub> + C<sub>2</sub>)π<sub>E</sub>]π<sub>D</sub>π<sub>L</sub></p>
                  <p>λ<sub>2</sub> = π<sub>Q</sub>N<sub>C</sub>(C<sub>12</sub>π<sub>T2</sub> + C<sub>22</sub>π<sub>E</sub>)π<sub>L</sub></p>
                </div>
              </>
            )}
          </>

        )}
      </div>
    </div>
  );
};

export default MicrocircuitsCalculation;