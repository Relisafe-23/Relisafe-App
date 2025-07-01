import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";

import {
  calculatePiT,
  getFailureRate,
  getQualityFactor,
  getBValueForTemp,
  QUALITY_FACTORS,
  getEnvironmentalOptions,
} from './Calculation.js';

import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
import Box from '@mui/material/Box';
import { Alert, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import './Microcircuits.css'
import MaterialTable from "material-table";
import { tableIcons } from "../core/TableIcons";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@material-ui/core";



const MicroMemories= ({ onCalculate }) => {
  const [showCalculations, setShowCalculations] = useState(false);
  const [components, setComponents] = useState([]);
  const [mode, setMode] = useState('A1');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
  const [selectedECC, setSelectedECC] = React.useState(null);
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
const qualityFactor =()=>{
    return currentComponent.piQ;
};
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
    const updateComponentInList = (component) => {
    if (components.some(c => c.id === component.id)) {
      addOrUpdateComponent(component);
    }
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

  const calculateMemoriesFailureRate = () => {
    try {

      const c1 = inputs?.technology === 'MOS'
        ? inputs?.memorySize.mos
        : inputs?.memorySize.bipolar;


      const c2 = getFailureRate(currentComponent.packageType, currentComponent.pinCount)

      // Calculate λcyc

      const lambdaCyc = calculateLambdaCyc();
      console.log("λcyc:", lambdaCyc)
      // Get πT (Temperature Factor)

      const piT = calculatePiT(currentComponent.technology, currentComponent.temperature);
      // Get πE (Environment Factor) - now includes both value and label
      const piE = inputs?.environment?.factor || 1.0;
      const environmentLabel = inputs?.environment?.label || 'Not specified';

      // Get πQ (Quality Factor) - now includes both value and label
      // const piQ =  getQualityFactor();
      const πQ = qualityFactor();
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



  }
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
  return(
   <>
     <Row>
                 <Col md={4}>
                   <div className="form-group">
                     <label>Quality Factor (π<sub>Q</sub>):</label>
                     <Select
                       styles={customStyles}
                       name="qualityFactor"
                       value={currentComponent.quality}
                       placeholder="Select Quality Class"
                       onChange={(selectedOption) => {
   
                         setCurrentComponent({
                           ...currentComponent,
                           quality: selectedOption,
                           piQ: selectedOption.piQ
                         });
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
                   </div>
                 </Col>
   
                 <Col md={4}>
                   <div className="form-group">
                     <label>Environment (π<sub>E</sub>):</label>
                     <Select
                       styles={customStyles}
                       value={inputs?.environment}
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
                 </Col>
           
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
              </Col>
          
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
                      value: inputs?.memoryType,
                      label: inputs?.memoryType.type
                    }}
                    onChange={(selectedOption) => setInputs(prev => ({
                      ...prev,
                      memoryType: selectedOption.value,
                      memorySize: selectedOption.value.rates[0]
                    }))}
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Memory Size (C<sub>1</sub>):</label>
                  <Select
                    styles={customStyles}
                    options={inputs?.memoryType.rates?.map(item => ({
                      value: item,
                      label: item.size
                    }))}
                    value={{
                      value: inputs?.memorySize,
                      label: inputs?.memorySize.size
                    }}
                    onChange={(selectedOption) => setInputs(prev => ({
                      ...prev,
                      memorySize: selectedOption.value
                    }))}
                  />
                </div>
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
                      {inputs?.memoryType.type.includes('EEPROM') && (
                        <li>λ<sub>cyc</sub> = Read/write cycling induced failure rate (for EEPROMs)</li>
                      )}
                      <li>π<sub>Q</sub> = Quality factor</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
  )
}
export default  MicroMemories;



