// import React, { useState, useEffect } from 'react';
// import Select from "react-select";
// import {
//   calculateMicrocircuitsAndMicroprocessorsFailureRate,
//   calculateSawDeviceFailureRate,
//   calculatePiT,
//   getEnvironmentFactor,
//   getQualityFactor,
//   getBValueForTemp,
//   calculateGateArrayC1,
//   getEnvironmentalOptions,
//   calculateLearningFactor,
//   BASE_FAILURE_RATE
// } from './Calculation.js';
// import { createTheme } from "@mui/material";
// import { Button, Container, Row, Col } from 'react-bootstrap';
// import { Alert } from "@mui/material";

// const Microcircuits = ({ 
//   setSelectedComponent, 
//   onCalculate, 
//   handleCalculateGate, 
//   handleCalculateSawDevice, 
//   handleCalculateMemories, 
//   handleCalculateVhsic, 
//   handleCalculateGaAs, 
//   handleCalculateBubble 
// }) => {
//   const [components, setComponents] = useState([{
//     id: Date.now(),
//     type: '',
//     devices: '',
//     complexFailure: '',
//     gateCount: '',
//     temperature: 25,
//     environment: '',
//     data: "microprocessorData",
//     quality: 'M',
//     quantity: 1,
//     microprocessorData: "",
//     technology: '',
//     complexity: '',
//     application: '',
//     packageType: '',
//     pinCount: '',
//     yearsInProduction: '',
//     memoryTemperature: 45,   
//     techTemperatureB2: 25,
//     techTemperatureB1: 25,    
//     memorySizeB1: 1024,
//     memorySizeB2: 1024,
//     memoryTech: "Flotox",
//     B1: 0.79,
//     B2: null,
//     calculatedPiT: 1.2,
//     piL: 1.0,
//     basePiT: 0.1,
//     failureRate: 0,
//     totalFailureRate: 0
//   }]);
//  const [showCalculations, setShowCalculations] = useState(false);
//   const [component, setComponent] = useState([]);
//   const[nextId, setNextId] = useState(1);
//   // const [components, setComponents] = useState([]);
//   // const [selectedComponent, setSelectedComponent] = useState(null);
//   const [currentDevice, setCurrentDevice] = useState([]);
//   const [showResults, setShowResults] = useState(false);
//   const [selectedOption, setSelectedOption] = useState();
//   const [results, setResults] = useState(false)
//   const [currentComponents, setCurrentComponents] = useState(null);
//   const [mode, setMode] = useState('A1');
//   const [numberOfPins, setNumberOfPins] = useState(0);
//   const [quantity, setQuantity] = useState(null);
//   const [totalFailureRate, setTotalFaiureRate] = useState([]);
//     const dieComplexityRates = [
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

//   const [selectedECC, setSelectedECC] = useState(null);

//  const [currentComponent, setCurrentComponent] = useState({
//     type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
//     temperature: 25,
//     devices: "bipolarData",
//     complexFailure: "digital",
//     environment: '',
//     data: "microprocessorData",
//     quality: 'M',
//     quantity: null,
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
//     B2: null,
//     calculatedPiT: 1.2,


//     piL: 1.0,
//     // piQ: 1.0,
//     basePiT: 0.1,
//     calculatedPiT: null
//   });
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [totalSystemFailureRate, setTotalSystemFailureRate] = useState(0);
//   const eccOptions = [
//     { value: 'none', label: 'No On-Chip ECC', factor: 1.0 },
//     { value: 'hamming', label: 'On-Chip Hamming Code', factor: 0.72 },
//     { value: 'redundant', label: 'Two-Needs-One Redundant Cell Approach', factor: 0.68 }
//   ];
//   const [change, setChange] = useState(false)

//   const handleChange = (selectedOption) => {
//     setSelectedECC(selectedOption);

//   };

//   const handleA2FactorChange = (selectedOption) => {
//     setCurrentComponent(prev => ({
//       ...prev,
//       a2Factor: selectedOption,
//       a2Value: selectedOption.a2Value,
//       programmingCyclesMax: selectedOption.maxCycles
//     }));

//   };

//   let totalFrCalculation= [];
  
//   const calculateSawDevice = () => {
//     const failureRate = calculateSawDeviceFailureRate(currentComponent);

//     const updatedComponent = {

//       ...currentComponent,
//       calculatedFailureRate: failureRate,
//       environmentLabel: currentComponent.environment?.description,
//       qualityLabel: currentComponent.qualityFactor?.label

//     };

//     setCurrentComponent(updatedComponent);
//     addOrUpdateComponent(updatedComponent);

//   }
  
//   // const handleInputChange = (e) => {
//   //   const { name, value } = e.target;
//   //   setCurrentComponent(prev => ({
//   //     ...prev,
//   //     [name]: name === 'temperature' || name === 'Tj' || name === 'gateCount' || name === 'quantity'
//   //       ? parseFloat(value)
//   //       : value
//   //   }));
//   // };
//     const handleInputChange = (id, e) => {
//     const { name, value } = e.target;
//     updateComponent(id, {
//       [name]: name === 'temperature' || name === 'Tj' || name === 'gateCount' || name === 'quantity'
//         ? parseFloat(value)
//         : value
//     });
//   };

//   const getEnvironmentFactor = (envValue) => {
//     if (!environmentOptions || !Array.isArray(environmentOptions)) return 1.0;

//     const foundEnv = environmentOptions.find(opt => opt?.value === envValue);
//     return foundEnv?.factor ?? 1.0;
//   };

//   const calculateSawDeviceFailureRate = (component) => {
//     const baseRate = BASE_FAILURE_RATE;
//     const piQ = component.qualityFactor?.value || 1.0; // Default to 1.0 if not set
//     const piE = getEnvironmentFactor(component?.environment?.value);

//     return (baseRate * piQ * piE)?.toFixed(6);
//   };


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
//   // Package Failure Rate (C2) data
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
//       label: "None beyond best commercial practices",
//       value: 1.0,
//       screeningLevel: "Standard"
//     }
//   ];

 

//   const calculateTempFactor = (temp) => {
//     // Simplified exponential model for πT
//     return Math.exp((-14 / (8.617e-5)) * ((1 / (temp + 273)) - (1 / 298)));
//   };

//   const componentColumns = [

//     {
//       title: <span>C<sub>1</sub></span>,
//       field: 'calculationParams.C1',
//       render: rowData => rowData?.C1?.toFixed(6),

//     },
//     {
//       title: <span>C<sub>2</sub></span>,
//       field: 'calculationParams.C2',
//       render: rowData => rowData?.C2?.toFixed(6),

//     },
//     {
//       title: <span>π<sub>L</sub></span>,
//       field: 'calculationParams.piL',
//       render: rowData => rowData?.piL?.toFixed(2),

//     },
//     {
//       title: <span>π<sub>E</sub></span>,
//       field: 'calculationParams?.piE',
//       render: rowData => rowData?.piE?.toFixed(2),

//     },
//     {
//       title: <span>π<sub>Q</sub></span>,
//       field: 'calculationParams.piQ',
//       render: rowData => Number(rowData?.piQ)?.toFixed(2)

//     },
//     {
//       title: <span>π<sub>T</sub></span>,
//       field: 'calculationParams.piT',
//       render: rowData => rowData?.piT?.toFixed(2),

//     },
//     {
//       title: 'Failure Rate',
//       field: 'totalFailureRate',
//       render: rowData => rowData?.λp?.toFixed(6),

//     },

//   ];

//   const addNewComponent = () => {
//     const newComponent = {
//       id: Date.now(),
//       type: '',
//       devices: '',
//       complexFailure: '',
//       gateCount: '',
//       temperature: 25,
//       environment: '',
//       data: "microprocessorData",
//       quality: 'M',
//       quantity: 1,
//       microprocessorData: "",
//       technology: '',
//       complexity: '',
//       application: '',
//       packageType: '',
//       pinCount: '',
//       yearsInProduction: '',
//       memoryTemperature: 45,   
//       techTemperatureB2: 25,
//       techTemperatureB1: 25,    
//       memorySizeB1: 1024,
//       memorySizeB2: 1024,
//       memoryTech: "Flotox",
//       B1: 0.79,
//       B2: null,
//       calculatedPiT: 1.2,
//       piL: 1.0,
//       basePiT: 0.1,
//       failureRate: 0,
//       totalFailureRate: 0
//     };
//     setComponents([...components, newComponent]);
//   };

//   const removeComponent = (id) => {
//     setComponents(components.filter(comp => comp.id !== id));
//   };

//   const updateComponent = (id, updatedProps) => {
//     setComponents(components.map(comp => 
//       comp.id === id ? { ...comp, ...updatedProps } : comp
//     ));
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

//   const addOrUpdateComponent = (component) => {
//     setComponent(prev => {
//       // If component already exists, update it
//       const existingIndex = prev.findIndex(c => c.id === component.id);
//       if (existingIndex >= 0) {
//         const updated = [...prev];
//         updated[existingIndex] = component;
//         return updated;
//       }
//       return [...prev, { ...component, id: Date.now() }];
//     });
//   };

//   const updateComponentInList = (component, componentList) => {
//     if (componentList?.some(c => c.id === component.id)) {
//       addOrUpdateComponent(component);
      
//     }
//   };

//   // useEffect(() => {
//   //   handleFrChange()
//   // }, [change])

//   const CalculateGateFailureRate = () => {
//     let failureRate = 0;
//     let calculationParams = {};
//     let calculation = {};

//     switch (component.type) {
//       case 'Microcircuits,Gate/Logic Arrays And Microprocessors':
//         failureRate = calculateMicrocircuitsAndMicroprocessorsFailureRate(currentComponent);
//         console.log ("Failure Rate:", failureRate);
//         calculationParams = {
//           C1: calculateGateArrayC1(currentComponent),
//           C2: 0,
//           piT: calculatePiT(currentComponent.technology, currentComponent.temperature),
//           piE: getEnvironmentFactor(currentComponent?.environment),
//           piQ: getQualityFactor(currentComponent.quality),
//           piL: calculateLearningFactor(currentComponent.yearsInProduction),

//           λp: calculateMicrocircuitsAndMicroprocessorsFailureRate(currentComponent),
 
//         };
//         break;
//       default:
//         calculation = { error: 'Unsupported component type' };
//     }


//     const quantity = currentComponent.quantity || 1;
//     const totalFailureRate = failureRate * quantity;

   

//     const newComponents = {
//       ...component,
//       failureRate,
//       totalFailureRate,
//       calculationParams
//     };
  

//     setComponent([...component, newComponents]);

// console.log("failureRate", failureRate)
// console.log("totalFailureRate", totalFailureRate)
// console.log("vjjcalculationParamskkojbjk", calculationParams)
//     setResults({
//       failureRate,
//       totalFailureRate,
//       calculationParams
//     });
//   };
  
//   const partTypes = [
//     { value: 'Logic', label: 'Logic and Custom Gate Array (λd = 0.16)' },
//     { value: 'Memory', label: 'Memory (λd = 0.24)' }
//   ];

//   const packageTypes = [
//     {
//       value: 'DIP',
//       label: 'DIP',
//       hermetic: 1.0,
//       nonhermetic: 1.3
//     },
//     {
//       value: 'PGA',
//       label: 'Pin Grid Array (πprT = 2.2/2.9)',
//       hermetic: 2.2,
//       nonhermetic: 2.9
//     },
//     {
//       value: 'SMT',
//       label: 'Surface Mount (πprT = 4.7/6.1)',
//       hermetic: 4.7,
//       nonhermetic: 6.1
//     }
//   ];

//   const esdLevels = [
//     { value: '0-1000', label: '0-1000V ', rate: 0.065 },
//     { value: '1000-2000', label: '1000-2000V ', rate: 0.053 },
//     { value: '2000-4000', label: '2000-4000V ', rate: 0.044 },
//     { value: '4000-16000', label: '4000-16000V ', rate: 0.029 },
//     { value: '16000+', label: '>16000V ', rate: 0.0027 }
//   ];


//   const getDieBaseRate = () => {
//     return inputs.partType === 'Logic' ? 0.16 : 0.24;
//   };

//   const manufacturingProcessTypes = [
//     { value: 'QML', factor: 0.55 },
//     { value: 'QPL', factor: 0.55 },
//     { value: 'Non-QML', factor: 2.0 },
//     { value: 'Non-QPL', factor: 2.0 }
//   ];

//   const getManufacturingFactor = () => {
//     const selected = manufacturingProcessTypes?.find(p => p.value === inputs.manufacturingProcess);
//     if (!selected) return 2.0; // Default to non-QML/non-QPL factor
//     return selected.factor;
//   };
//   const getPackageFactor = () => {
//     const selected = packageTypes?.find(p => p.value === inputs.packageType);
//     if (!selected) return 0;
//     return inputs.packageHermeticity === 'Hermetic' ? selected.hermetic : selected.nonhermetic;
//   };

//   const getDieComplexityFactor = () => {
//     const A = inputs.dieArea; // in cm²
//     const Xs = inputs.featureSize; // in microns

//     // Lookup table values (simplified from the image)
//     const lookupTable = {
//       '0.80': { max0_4: 8.0, max7: 14, max1_0: 19, max2_0: 38, max3_0: 58 },
//       '1.00': { max0_4: 5.2, max7: 8.9, max1_0: 13, max2_0: 25, max3_0: 37 },
//       '1.25': { max0_4: 3.5, max7: 5.8, max1_0: 8.2, max2_0: 16, max3_0: 24 }
//     };

//     // Check if we have a direct match in the lookup table
//     const featureSizeKey = Xs.toString();
//     if (lookupTable[featureSizeKey]) {
//       const values = lookupTable[featureSizeKey];

//       if (A <= 0.4) return values.max0_4;
//       if (A <= 7) return values.max7;
//       if (A <= 1.0) return values.max1_0;
//       if (A <= 2.0) return values.max2_0;
//       if (A <= 3.0) return values.max3_0;
//     }

//     // Fall back to the formula if no match in table
//     return (A / 0.21) * Math.pow(2 / Xs, 2) * 0.64 + 0.36;
//   };

//   const getPackageBaseRate = () => {
//     return 0.0022 + (1.72e-5 * inputs.pinCount);
//   };

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
//     const [inputs, setInputs] = useState({
//     memoryType: dieComplexityRates[0],
//     memorySize: dieComplexityRates[0].rates[0],
//     technology: 'MOS',
//     packageType: packageRates[0],
//     pinCount: 3,
//     eepromType: 'Flotox',
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
//   const calculateLambdaBP = () => {
//     return 0;
//   };
//   const getESDFailureRate = () => {
//     const selected = esdLevels?.find(e => e.value === inputs.esdSusceptibility);
//     return selected ? selected.rate : 0;
//   };

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

//   const getTemperatureFactor = () => {
//     // This would include your temperature calculation logic
//     // Example implementation (adjust based on your actual formula):
//     const basePiT = getTechnologyFactor()?.basePiT;
//     const temperature = currentComponent.temperature || 25; // default to 25°C

//     // Example temperature adjustment formula (replace with your actual calculation)
//     const piT = basePiT * Math.exp(0.1 * (temperature - 35));

//     return {
//       factor: piT,
//       description: `Temperature factor at ${temperature}°C`,
//       baseTemperature: 35, // reference temperature
//       currentTemperature: temperature
//     };
//   };

//   const calculateVhsicFailureRate = () => {
//     try {
//       // Calculate each component
//       const λBD = getDieBaseRate();
//       const πMFG = getManufacturingFactor();
//       const πprT = getPackageFactor();
 
//       const πCD = getDieComplexityFactor();
//       const λBP = getPackageBaseRate();
   
//       const λEOS = calculateLambdaBP();
//       const πE = inputs.environment?.factor || 1.0;
   

//       const πT = calculatePiT(currentComponent.technology, currentComponent.temperature);
//       const πQ = getQualityFactor();
 
//       const dieContribution = λBD * πMFG * πT * πCD;

//       const packageContribution = λBP * πprT * πE * πQ;
    
//       const eosContribution = λEOS;
//       const totalFailureRate = dieContribution + packageContribution + eosContribution;
     
// console.log("totalFailureRate......",totalFailureRate)
//       setResult({
//         value: totalFailureRate?.toFixed(6),
//         parameters: {
//           λBD: λBD?.toFixed(4),
//           πMFG: πMFG?.toFixed(4),
//           πprT: πprT?.toFixed(4),
//           πCD: πCD?.toFixed(4),
//           λBP: λBP?.toFixed(6),
//           λEOS: λEOS?.toFixed(6),
//           πE: πE?.toFixed(4),
//           πT: πT?.toFixed(4),
//           πQ: πQ?.toFixed(4)
//         }
//       });
//       setError(null);
//       if (onCalculate) {
//         onCalculate(totalFailureRate);
//       }
//     } catch (err) {
//       setError(err.message);
//       setResult(null);
//     }
//   };

//   const calculateLambdaCyc = () => {
//     // Validate required fields
//     if (!currentComponent.memoryTech || !currentComponent.memorySizeB1) {
    
//       return 0;
//     }

//     // Get A1 value
//     const A1 = mode === 'A1'
//       ? currentComponent.a1Value || 0
//       : 6.817e-6 * (currentComponent.programmingCycles || 0);

//     // Get B1 value
//     const B1 = currentComponent.B1 || getBValueForTemp(
//       currentComponent.memoryTech,
//       currentComponent.memorySizeB1,
//       currentComponent.techTemperatureB1 || 25,
//       'B1'
//     ) || 0;

//     // Initialize Textured-Poly specific factors
//     let A2 = 0;
//     let B2 = 0;

//     if (currentComponent.memoryTech.includes('Textured-Poly')) {
//       A2 = currentComponent.a2Factor?.a2Value || 0;
//       B2 = currentComponent.memorySizeB2 === 0
//         ? 0  // Explicitly set to 0 for Flotox & Textured-Poly²
//         : (currentComponent.B2 || getBValueForTemp(
//           'Textured-Poly-B2',
//           currentComponent.memorySizeB2,
//           currentComponent.techTemperatureB2 || 25,
//           'B2'
//         ) || 0);
//     }

//     // Get quality and ECC factors
//     const piQ = getQualityFactor()?.value || 1;
//     const piECC = selectedECC?.factor || 1;

//     // Calculate λ_cyc
//     const lambdaCyc = (A1 * B1 + (A2 * B2) / piQ) * piECC;

//     return lambdaCyc;
//   };

//   const calculateMemoriesFailureRate = () => {
//     try {
//       // Get C1 (Die Complexity Failure Rate)
//       const c1 = inputs.technology === 'MOS'
//         ? inputs.memorySize.mos
//         : inputs.memorySize.bipolar;

//       // Get C2 (Package Failure Rate)
//       const c2 = 0
   
//       // Calculate λcyc

//       const lambdaCyc = calculateLambdaCyc();


//       const piT = calculatePiT(currentComponent.technology, currentComponent.temperature);
      
//       const piE = inputs.environment?.factor || 1.0;
//       const environmentLabel = inputs.environment?.label || 'Not specified';


//       const πQ = getQualityFactor();

//       // Get πL (Learning Factor)
//       const piL = currentComponent.piL;

//       // Calculate final failure rate
//       const failureRate = (c1 * piT + c2 * piE + lambdaCyc) * πQ * piL;
   


//       setResult({
//         value: failureRate?.toFixed(6),
//         parameters: {
//           c1: c1?.toFixed(6),
//           piT: piT?.toFixed(2),
//           c2: c2?.toFixed(6),
//           piE: piE?.toFixed(1),
//           piELabel: environmentLabel,
//           lambdaCyc: lambdaCyc?.toFixed(6),
//           πQ: πQ?.toFixed(4),
//           // piQLabel: qualityLabel,
//           piL: piL?.toFixed(1),
//           formula: 'λp = (C1 × πT + C2 × πE + λcyc) × πQ × πL'
//         }
//       });
//       setError(null);
//       if (onCalculate) {
//         onCalculate(failureRate);
//       }
//     } catch (err) {
//       setError(err.message);
//     }

//     // Get πT (Temperature Factor)

//   }

//   const calculateGaAsFailureRate = () => {
//     try {
//       // Validate inputs
//       // if (!currentComponent.type) throw new Error("Please select a device type");
//       // if (!currentComponent.complexity) throw new Error("Please select complexity range");
//       // if (!currentComponent.application) throw new Error("Please select an application");
//       // if (!currentComponent.packageType) throw new Error("Please select a package type");
//       // if (!currentComponent.pinCount) throw new Error("Please enter number of pins");
//       // if (!currentComponent.yearsInProduction) throw new Error("Please select years in production");
//       // if (!currentComponent.quality) throw new Error("Please select quality class");
//       // if (!currentComponent.temperature) throw new Error("Please enter junction temperature");
//       // console.log("fhkbj@@@")
//       // if (!currentComponent?.type || !currentComponent?.complexity ||
//       //   !currentComponent?.piA || !currentComponent?.piE ||
//       //   !currentComponent?.piL || !currentComponent?.piQ ||
//       //   !currentComponent?.temperature) {
//       //   throw new Error("Missing required parameters for GaAs failure rate calculation");
//       // }
//       let c1;
//       if (currentDevice?.type === "MMIC") {
//         if (currentComponent?.complexity === "1-100") {
//           c1 = 4.5;
//         } else if (currentComponent?.complexity === "101-1000") {
//           c1 = 7.2;
//         } else {
//           throw new Error("Invalid MMIC complexity range");
//         }
//       } else { // Digital type
//         if (currentComponent?.complexity === "1-1000") {
//           c1 = 25;
//         } else if (currentComponent?.complexity === "1001-10000") {
//           c1 = 51;
//         } else {
//           throw new Error("Invalid Digital complexity range");
//         }
//       }

//       // Get πA (application factor)
//       const piA = currentComponent.piA;

//       // Get C2 (package factor)
//       const c2 = 0

//       // Get πE (environment factor)
//       const piE = currentComponent.piE;


//       const Ea = 0.7; // eV
//       const k = 8.617e-5; // eV/K
//       const Tref = 273 + 25; // Reference temperature (25°C in Kelvin)
//       const Tj = 273 + parseFloat(currentComponent.temperature); // Junction temp in Kelvin
//       const piT = calculatePiT(currentComponent.technology, currentComponent.temperature);

//       // Get πL (learning factor) and πQ (quality factor)
//       const piL = currentComponent.piL;
//       const piQ = currentComponent.piQ;

//       // Calculate failure rate using the formula: λp = [C1 πT πA + C2 πE] πL πQ
//       const dieContribution = c1 * piT * piA;
//       const packageContribution = c2 * piE;
//       const lambdaP = (dieContribution + packageContribution) * piL * piQ;

//       // Call onCalculate with the failure rate

//       setResult({
//         value: lambdaP?.toFixed(6),
//         parameters: {
//           c1: c1?.toFixed(4),
//           piT: piT?.toFixed(2),
//           piA: piA?.toFixed(4),
//           c2: c2?.toFixed(6),
//           piE: piE?.toFixed(4),
//           piL: piL?.toFixed(4),
//           piQ: piQ?.toFixed(4)
//         }
//       });
//       setError(null);
//       if (onCalculate) {
//         onCalculate(lambdaP);
//       }
//     } catch (err) {
//       setError(err.message);
//       setResult(null);
//     }
//   };

//   const calculateBubbleMemoryFailureRate = () => {

//     try {
     
//       // Calculate complexity factors
//       const N1 = parseFloat(currentComponent.dissipativeElements);
//       const N2 = parseFloat(currentComponent.numberOfBits);

//       // Control and Detection Structure Complexity
//       const C11 = 0.00095 * Math.pow(N1, 0.40);
//       const C21 = 0.0001 * Math.pow(N1, 0.226);

//       // Memory Storage Area Complexity
//       const C12 = 0.00007 * Math.pow(N2, 0.3);
//       const C22 = 0.00001 * Math.pow(N2, 0.3);

//       // Package factor (already set in packageType selection)
//       const C2 = 0;


//       // Temperature factors
//       const TJ = parseFloat(currentComponent.temperature) + 10 + 273; // Convert to Kelvin
//       const piT1 = 0.1 * Math.exp((-0.8 / (8.63e-5)) * ((1 / TJ) - (1 / 298)));
//       const piT2 = 0.1 * Math.exp((-0.55 / (8.63e-5)) * ((1 / TJ) - (1 / 298)));
  

//       // Write duty cycle factor
//       const D = currentComponent.writeDutyCycle ? parseFloat(currentComponent.writeDutyCycle) : 0;
//       const RW = currentComponent.readsPerWrite ? parseFloat(currentComponent.readsPerWrite) : 2154;
//       let piW = (D <= 0.3 || RW >= 2154) ? 1 : (10 * D) / Math.pow(RW, 3);

//       // For seed-bubble generators
//       if (currentComponent.isSeedBubbleGenerator) {
//         piW = Math.max(piW / 4, 1);
//       }

//       // Duty cycle factor
//       const piD = 0.9 * D + 0.1;

//       // Environment factor (already set in environment selection)
//       const piE = currentComponent.piE;

//       // Learning factor (already set in yearsInProduction selection)
//       const piL = currentComponent.piL;

//       // Quality factor (already set in quality selection)
//       const piQ = currentComponent.piQ;

//       // Number of chips
//       const NC = parseFloat(currentComponent.bubbleChips);

//       // Calculate failure rates
//       const lambda1 = piQ * (NC * C11 * piT1 * piW + (NC * C21 + C2) * piE) * piD * piL;
//       const lambda2 = piQ * NC * (C12 * piT2 + C22 * piE) * piL;
//       const lambdaP = lambda1 + lambda2;
//       // Call onCalculate with the failure rate


//       // Set results
//       setResult({
//         value: lambdaP?.toFixed(6),
//         parameters: {
//           c11: C11,
//           c21: C21,
//           c12: C12,
//           c22: C22,
//           c2: C2,
//           piT1,
//           piT2,
//           piW,
//           piD,
//           piE,
//           piL,
//           piQ,
//           lambda1,
//           lambda2,
//           lambdaP // Add lambdaP to parameters
//         }
//       });
     
//       setError(null);
//       if (onCalculate) {
//         onCalculate(lambdaP);
//       }
//     } catch (err) {
    
//       setError("Error in calculation: " + err.message);
//     }
//   };
//     const getQualityFactor = () => {
//     return currentComponent.piQ; // Assuming this is already set in state
//   };
//    const addComponent = () => {
//     const newId = components.length > 0 ? Math.max(...components.map(c => c.id)) + 1 : 1;
//     const newComponent = {
//       id: newId,
//       type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
//       temperature: 25,
//       devices: "bipolarData",
//       complexFailure: "digital",
//       environment: '',
//       data: "microprocessorData",
//       quality: 'M',
//       quantity: 1,
//       microprocessorData: "",
//       gateCount: 1000,
//       technology: '',
//       complexity: '',
//       application: '',
//       packageType: '',
//       pinCount: '',
//       yearsInProduction: '',
//       memoryTemperature: 45,   
//       techTemperatureB2: 25,
//       techTemperatureB1: 25,    
//       memorySizeB1: 1024,
//       memorySizeB2: 1024,
//       memoryTech: "Flotox",
//       technology: "Digital MOS",
//       B1: 0.79,
//       B2: null,
//       calculatedPiT: 1.2,
//       piL: 1.0,
//       basePiT: 0.1,
//       calculatedPiT: null,
//       failureRate: 0,
//       totalFailureRate: 0
//     };
//     setComponents([...components, newComponent]);
//   };

//   // // Remove a component
//   // const removeComponent = (id) => {
//   //   setComponents(components.filter(comp => comp.id !== id));
//   // };

 
//   // const updateComponent = (id, updatedProps) => {
//   //   setComponents(components.map(comp => 
//   //     comp.id === id ? { ...comp, ...updatedProps } : comp
//   //   ));
//   // };

//   useEffect(() => {
//     const total = components.reduce((sum, comp) => sum + (comp.totalFailureRate || 0), 0);
//     setTotalSystemFailureRate(total);
//   }, [components]);
//     const handleCalculate = (id) => {
//     const component = components.find(c => c.id === id);
//     let failureRate = 0;
    
//     // Your calculation logic here based on component.type
//     switch (component.type) {
//       case 'Microcircuits,Gate/Logic Arrays And Microprocessors':
//         failureRate = calculateMicrocircuitsAndMicroprocessorsFailureRate(component);
//         break;
//       case 'Microcircuits,Saw Devices':
//         failureRate = calculateSawDeviceFailureRate(component);
//         break;
//       // Add other cases...
//     }

//     const totalFailureRate = failureRate * (component.quantity || 1);
    
//     updateComponent(id, { 
//       failureRate,
//       totalFailureRate
//     });
//   };


//   // Render a single component
//   const renderComponent = (component) => {
//     return (
//       <div key={component.id} className="component-container" style={{ 
//         border: '1px solid #ddd', 
//         padding: '15px', 
//         margin: '15px 0', 
//         borderRadius: '5px',
//         position: 'relative'
//       }}>
//         <h3>Component {components.findIndex(c => c.id === component.id) + 1}</h3>
        
//         {/* Your component form fields */}
//         <Row className="mb-2">
//           <Col md={4}>
//             <div className="form-group">
//               <label>Part Type:</label>
//               <Select
//                 styles={customStyles}
//                 name="type"
//                 placeholder="Select"
//                 value={component.type ? 
//                   { value: component.type, label: component.type } : null}
//                 onChange={(selectedOption) => {
//                   updateComponent(component.id, { type: selectedOption.value });
//                 }}
//                 options={[
//                   { value: "Microcircuits,Gate/Logic Arrays And Microprocessors", label: "Microcircuits,Gate/Logic Arrays And Microprocessors" },
//                   { value: "Microcircuits,Memories", label: "Microcircuits,Memories" },
//                   { value: "Microcircuits,Saw Devices", label: "Microcircuits,Saw Devices" },
//                   { value: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS", label: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" },
//                   { value: "Microcircuit,GaAs MMIC and Digital Devices", label: "Microcircuit,GaAs MMIC and Digital Devices" },
//                   { value: "Microcircuit,Magnetic Bubble Memories", label: "Microcircuit,Magnetic Bubble Memories" }
//                 ]}
//               />
//             </div>
//           </Col>
          
//           {/* Add other form fields similarly */}
//           {/* Example for temperature field */}
//           <Col md={4}>
//             <div className="form-group">
//               <label>Junction Temperature (°C):</label>
//               <input
//                 className="form-control"
//                 type="number"
//                 name="temperature"
//                 min="-40"
//                 max="175"
//                 value={component.temperature}
//                 onChange={(e) => handleInputChange(component.id, e)}
//               />
//             </div>
//           </Col>
          
//           <Col md={4}>
//             <div className="form-group">
//               <label>Quantity:</label>
//               <input
//                 type="number"
//                 className="form-control"
//                 min="1"
//                 value={component.quantity || ''}
//                 onChange={(e) => {
//                   const inputValue = e.target.value;
//                   const newQuantity = inputValue === '' ? 1 : Math.max(1, parseInt(inputValue));
//                   updateComponent(component.id, {
//                     quantity: newQuantity,
//                     totalFailureRate: (component.failureRate || 0) * newQuantity
//                   });
//                 }}
//               />
//             </div>
//           </Col>
//         </Row>

//         <Button 
//           variant="primary" 
//           onClick={() => handleCalculate(component.id)}
//         >
//           Calculate
//         </Button>

//         {component.failureRate > 0 && (
//           <div className="prediction-result" style={{ marginTop: '20px' }}>
//             <strong>Predicted Failure Rate:</strong>
//             <span className="ms-2">{component.failureRate.toFixed(6)} failures/10<sup>6</sup> hours</span>
//             <br />
//             <strong>Total (× quantity):</strong>
//             <span className="ms-2">
//               {component.totalFailureRate.toFixed(6)} failures/10<sup>6</sup> hours
//             </span>
//           </div>
//         )}

//         <Button 
//           variant="danger" 
//           onClick={() => removeComponent(component.id)}
//           style={{ marginTop: '10px' }}
//         >
//           Remove Component
//         </Button>
//       </div>
//     );
//   };
//   return (
//     <div className="reliability-calculator">
//       <br />
//       <h2 className='text-center' style={{ fontSize: '1.2rem' }}>
//         Microcircuits Reliability Calculator
//       </h2>
    
//     {components.map(renderComponent)}
     

//       <Button onClick={addNewComponent} className="mt-3">
//         Add Component
//       </Button>

//       {components.length > 0 && (
//         <div className="total-failure-rate" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa' }}>
//           <h4>Total System Failure Rate: {totalSystemFailureRate.toFixed(6)} failures/10<sup>6</sup> hours</h4>
//         </div>
//       )}
//     </div>
//     //   ))}
//     // </div>
//   );
// }

// export default Microcircuits;