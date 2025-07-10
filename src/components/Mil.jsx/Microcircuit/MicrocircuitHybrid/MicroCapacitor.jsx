import React, { useState,useMemo, useEffect } from 'react';
import '../../CapacitorCalculaton.css';
import { Button, Row, Col } from 'react-bootstrap';
import { Link } from '@material-ui/core';
import MaterialTable from "material-table";
import {
  Paper,
  Typography,
  IconButton,
  Tooltip
} from '@material-ui/core';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'
import Select from "react-select";
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Mic } from '@mui/icons-material';
// import DeleteIcon from '@material-ui/icons/Delete';



function MicroCapacitor({ onCalculate, capacitorTotalFRate, handleCalculateFailure }) {
  

  // Capacitor types data
 const capacitorTypes = [
    { style: "CP", spec: "MIL-C-25", description: "Capacitor, Fixed, Paper-Dielectric, DC (Hermetically Sealed)", λb: 0.00037, πtColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CA", spec: "MIL-C-12889", description: "Capacitor, By-Pass, Radio - Maintenance Reduction, Paper Dielectric", λb: 0.00037, πtColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CZ, CZR", spec: "MIL-C-11693", description: "Capacitor, Fixed, Radio Interference Reduction AC/DC", λb: 0.00037, πtColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CO, COR", spec: "MIL-C-19978", description: "Capacitor, Fixed Plastic/Paper-Plastic Dielectric", λb: 0.00051, πtColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CH", spec: "MIL-C-18312", description: "Capacitor, Fixed, Metallized Paper/Plastic Film, DC", λb: 0.00037, πtColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CHR", spec: "MIL-C-39022", description: "Capacitor, Fixed, Metallized Paper/Plastic Film", λb: 0.00051, πtColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CFR", spec: "MIL-C-55514", description: "Capacitor, Fixed, Plastic Dielectric, DC in Non-Metal Cases", λb: 0.00051, πtColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CRH", spec: "MIL-C-83421", description: "Capacitor, Fixed Supermetallized Plastic Film Dielectric", λb: 0.00051, πtColumn: 1, πcColumn: 1, πvColumn: 1, πsrColumn: 1 },
    { style: "CM", spec: "MIL-C-5", description: "Capacitors, Fixed, Mica Dielectric", λb: 0.00076, πtColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CMR", spec: "MIL-C-39001", description: "Capacitor, Fixed, Mica Dielectric, Est. Rel.", λb: 0.00076, πtColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CB", spec: "MIL-C-10950", description: "Capacitor, Fixed, Mica Dielectric, Button Style", λb: 0.00076, πtColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CY", spec: "MIL-C-11272", description: "Capacitor, Fixed, Glass Dielectric", λb: 0.00076, πtColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CYR", spec: "MIL-C-23269", description: "Capacitor, Fixed, Glass Dielectric, Est. Rel.", λb: 0.00076, πtColumn: 2, πcColumn: 1, πvColumn: 2, πsrColumn: 1 },
    { style: "CK", spec: "MIL-C-11015", description: "Capacitor, Fixed, Ceramic Dielectric (General Purpose)", λb: 0.00099, πtColumn: 2, πcColumn: 1, πvColumn: 3, πsrColumn: 1 },
    { style: "CKR", spec: "MIL-C-39014", description: "Capacitor, Fixed, Ceramic Dielectric (General Purpose), Est. Rel.", λb: 0.00099, πtColumn: 2, πcColumn: 1, πvColumn: 3, πsrColumn: 1 },
    { style: "CC, CCR", spec: "MIL-C-20", description: "Capacitor, Fixed, Ceramic Dielectric (Temperature Compensating)", λb: 0.00099, πtColumn: 2, πcColumn: 1, πvColumn: 3, πsrColumn: 1 },
    { style: "CDR", spec: "MIL-C-55681", description: "Capacitor, Chip, Multiple Layer, Fixed, Ceramic Dielectric", λb: 0.0020, πtColumn: 2, πcColumn: 1, πvColumn: 3, πsrColumn: 1 },
    { style: "CSR", spec: "MIL-C-39003", description: "Capacitor, Fixed, Electrolytic (Solid), Tantalum, Est. Rel.", λb: 0.00040, πtColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: "See πSR Table" },
    { style: "CWR", spec: "MIL-C-55365", description: "Capacitor, Fixed, Electrolytic (Tantalum), Chip, Est. Rel.", λb: 0.00005, πtColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: "See πSR Table" },
    { style: "CL", spec: "MIL-C-3965", description: "Capacitor, Fixed, Electrolytic (Nonsolid), Tantalum", λb: 0.00040, πtColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: 1 },
    { style: "CLR", spec: "MIL-C-39006", description: "Capacitor, Fixed, Electrolytic (Nonsolid), Tantalum, Est. Rel.", λb: 0.00040, πtColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: 1 },
    { style: "CRL", spec: "MIL-C-83500", description: "Capacitor, Fixed, Electrolytic (Nonsolid), Tantalum Cathode", λb: 0.00040, πtColumn: 1, πcColumn: 2, πvColumn: 4, πsrColumn: 1 },
    { style: "CU, CUR", spec: "MIL-C-39018", description: "Capacitor, Fixed, Electrolytic (Aluminum Oxide)", λb: 0.00012, πtColumn: 2, πcColumn: 2, πvColumn: 1, πsrColumn: 1 },
    { style: "CE", spec: "MIL-C-62", description: "Capacitor, Fixed Electrolytic (DC, Aluminum, Dry Electrolyte)", λb: 0.00012, πtColumn: 2, πcColumn: 2, πvColumn: 1, πsrColumn: 1 },
    { style: "CV", spec: "MIL-C-81", description: "Capacitor, Variable, Ceramic Dielectric (Trimmer)", λb: 0.0079, πtColumn: 1, πcColumn: 1, πvColumn: 5, πsrColumn: 1 },
    { style: "PC", spec: "MIL-C-14409", description: "Capacitor, Variable (Piston Type, Tubular Trimmer)", λb: 0.0060, πtColumn: 2, πcColumn: 1, πvColumn: 5, πsrColumn: 1 },
    { style: "CT", spec: "MIL-C-92", description: "Capacitor, Variable, Air Dielectric (Trimmer)", λb: 0.0000072, πtColumn: 2, πcColumn: 1, πvColumn: 5, πsrColumn: 1 },
    { style: "CG", spec: "MIL-C-23183", description: "Capacitor, Fixed or Variable, Vacuum Dielectric", λb: 0.0060, πtColumn: 1, πcColumn: 1, πvColumn: 5, πsrColumn: 1 }
  ];


  // Capacitance factors
  const capacitanceFactors = [
    { capacitance: 0.000001, col1: 0.29, col2: 0.04 },
    { capacitance: 0.00001, col1: 0.35, col2: 0.07 },
    { capacitance: 0.0001, col1: 0.44, col2: 0.12 },
    { capacitance: 0.001, col1: 0.54, col2: 0.20 },
    { capacitance: 0.01, col1: 0.66, col2: 0.35 },
    { capacitance: 0.05, col1: 0.76, col2: 0.50 },
    { capacitance: 0.1, col1: 0.81, col2: 0.59 },
    { capacitance: 0.5, col1: 0.94, col2: 0.85 },
    { capacitance: 1, col1: 1.0, col2: 1.0 },
    { capacitance: 3, col1: 1.1, col2: 1.3 },
    { capacitance: 8, col1: 1.2, col2: 1.6 },
    { capacitance: 18, col1: 1.3, col2: 1.9 },
    { capacitance: 40, col1: 1.4, col2: 2.3 },
    { capacitance: 200, col1: 1.6, col2: 3.4 },
    { capacitance: 1000, col1: 1.9, col2: 4.9 },
    { capacitance: 3000, col1: 2.1, col2: 6.3 },
    { capacitance: 10000, col1: 2.3, col2: 8.3 },
    { capacitance: 30000, col1: 2.5, col2: 11 },
    { capacitance: 60000, col1: 2.7, col2: 13 },
    { capacitance: 120000, col1: 2.9, col2: 15 }
  ];

  const qualityFactors = [
    // { quality: "Established Reliability (D)", πQ: 0.001 },
    // { quality: "Established Reliability (C)", πQ: 0.01 },
    // { quality: "Established Reliability (S, B)", πQ: 0.03 },
    // { quality: "Established Reliability (R)", πQ: 0.1 },
    // { quality: "Established Reliability (P)", πQ: 0.3 },
    { quality: "Established Reliability (M) πQ = 1.0", πQ: 1.0 },
    // { quality: "Established Reliablity (L)", πQ: 1.5 },
    // { quality: "Non-Established Reliability", πQ: 3.0 },
    // { quality: "Commercial/Unknown", πQ: 10.0 }
  ];

  // Environment factors
  const environmentFactors = [
    { env: "GB (Ground, Benign) πE = 1.0", πE: 1.0 },

  ];
  const seriesResistanceOptions = [
    { value: 0.66, label: ">0.8 (πSR = 0.66)" },
    { value: 1.0, label: ">0.6 to 0.8 (πSR = 1.0)" },
    { value: 1.3, label: ">0.4 to 0.6 (πSR = 1.3)" },
    { value: 2.0, label: ">0.2 to 0.4 (πSR = 2.0)" },
    { value: 2.7, label: ">0.1 to 0.2 (πSR = 2.7)" },
    { value: 3.3, label: "0 to 0.1 (πSR = 3.3)" }
  ];
  
  // State for form inputs
  const [selectedCapacitor, setSelectedCapacitor] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [capacitance, setCapacitance] = useState(null); 
  const [dcVoltageApplied, setDcVoltageApplied] = useState(null);
  const [acVoltageApplied, setAcVoltageApplied] = useState(null);
  const [dcVoltageRated, setDcVoltageRated] = useState(null);
  const [seriesResistance, setSeriesResistance] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [results, setResults] = useState([]);
  // const [components, setComponents] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showCalculations, setShowCalculations] = useState(false);
  const [circuitResistance, setCircuitResistance] = useState(null);
  const [effectiveResistance, setEffectiveResistance] = useState(null);
  const [voltageApplied, setVoltageApplied] = useState(null);
  const [shouldCalculateCR, setShouldCalculateCR] = useState(false);
  const [piSR, setPiSR] = useState(null);
  const[quantity,setQuantity] = useState(1);
  // const [errors, setErrors] = useState({ 
  //   capacitorType: '',
  //   environment: '',
  //   quality: '',
  //   temperature: '',
  //   capacitance: '',
  //   dcVoltageApplied: '',
  //   acVoltageApplied: '',
  //   dcVoltageRated: '',
  //   seriesResistance: '',
  //   circuitResistance: '',
  //   effectiveResistance: '',
  //   voltageApplied: ''
  // });




  //   const calculatePiT = () => {
  //   // Constants from the 
  //      if (!selectedCapacitor || selectedCapacitor?.value?.πtColumn === "N/A (πt=1)") {
  //     return 1.0;
  //   }
  //   const BOLTZMANN_CONSTANT = 8.617e-5; // eV/K
  //   const REFERENCE_TEMP = 298; // K (25°C)

  //   // Get activation energy based on column selection
  //   const Ea = selectedCapacitor?.value?.πtColumn === 1 ? 0.15 : 0.35; // eV (from image columns)

  //   // Convert temperature to Kelvin
  //   const tempInKelvin = temperature + 273;

  //   // Calculate πT using Arrhenius equation
  //   const exponent = (-Ea / BOLTZMANN_CONSTANT) *
  //     ((1 / tempInKelvin) - (1 / REFERENCE_TEMP));

  //   return Math.exp(exponent);
  // };

  // const calculatePiC = () => {
  //    if (!selectedCapacitor || selectedCapacitor?.value?.πcColumn === "N/A (πc=1)") {
  //     return 1.0;
  //   }
  //   const closestCap = capacitanceFactors.reduce((prev, curr) =>
  //     Math.abs(curr.capacitance - capacitance) < Math.abs(prev.capacitance - capacitance) ? curr : prev
  //   );

  //   return selectedCapacitor?.value?.πcColumn === 1
  //     ? Math.pow(capacitance, 0.09)  // Column 1: C^0.09
  //     : Math.pow(capacitance, 0.23); // Column 2: C^0.23
  // };


//  const calculatePiV = () => {
//      if (!selectedCapacitor || selectedCapacitor?.value?.πvColumn === "N/A (πv=1)") {
//       return 1.0;
//     }
//     // Calculate stress ratio (S = Operating Voltage / Rated Voltage)
// const operatingVoltage = dcVoltageApplied + Math.sqrt(2) * acVoltageApplied;
// console.log("operatingVoltage...", operatingVoltage);

// const S = operatingVoltage / dcVoltageRated;
// console.log("S (Stress Ratio)...", S);

  

//     // Calculate πV based on the selected formula
//     const piV =
//       selectedCapacitor?.value?.πvColumn === 1 ? Math.pow(S / .6, 5) + 1 :
//         selectedCapacitor?.value?.πvColumn === 2 ? Math.pow(S / .6, 10) + 1 :
//           selectedCapacitor?.value?.πvColumn === 3 ? Math.pow(S / .6, 3) + 1 :
//             selectedCapacitor?.value?.πvColumn === 4 ? Math.pow(S / .6, 17) + 1 :
//               selectedCapacitor?.value?.πvColumn === 5 ? Math.pow(S / .5, 3) + 1 :
//                 1.0;

//     // Log the final calculated πV value
//     console.log("Calculated πV...", piV);

//     return piV;
//   };

  function calculateCR(effectiveResistance, voltage) {
    if (!voltage || voltage === 0) return 0;
    return effectiveResistance / voltage;
  }


  function calculatePiSRFromCR(CR) {
    if (CR > 0.8) return 0.66;
    if (CR > 0.6) return 1.0;
    if (CR > 0.4) return 1.3;
    if (CR > 0.2) return 2.0;
    if (CR > 0.1) return 2.7;
    return 3.3; // For CR ≤ 0.1
  }
  const PiSRvalue = calculatePiSRFromCR(effectiveResistance / voltageApplied)
 // const calculatePiSR = () => {
  //   if (shouldCalculateCR) {
     
  //     return calculatePiSRFromCR(effectiveResistance / voltageApplied);
  //   } else {
     
  //     return circuitResistance;
  //   }
     
  // };


//    console.log("1. Starting calculation..."); // Debug log
  
//   if (!validateForm()) {
//     console.log("2. Validation failed - exiting"); // Debug log
//     return;
//   }
//   console.log("3. Validation passed - proceeding with calculation");

// const newResult = {
//   id: Date.now(),
//   capacitorType: selectedCapacitor.style,
//   temperature,
//   capacitance,
//   dcVoltageApplied,
//   acVoltageApplied,
//   dcVoltageRated,
//   seriesResistance,
//   quality: selectedQuality.quality,
//   environment: selectedEnvironment.env,
//   λb: selectedCapacitor?.value.λb,
//   πT: calculatePiT(),
//   πC: calculatePiC(),
//   πV: calculatePiV(),
//   πSR: calculatePiSR(),
//   πQ: selectedQuality?.value.πQ,
//   πE: selectedEnvironment?.value.πE,
//   λp: calculateFailureRate()
// };
  
//     setResults([...results, newResult]);
//     setShowResults(true);

//     if (onCalculate) {
//       onCalculate(newResult.λp);
//     }
//   };

const handleAddComponent = () => {

  if (components.length === 0 || components[components.length - 1].length !== 0) {
    setComponents([...components, []]);
  }
};

const handleRemoveComponent = () => {
  if (components.length > 0) { // Only remove if there are components
    const newComponents = [...components];
    newComponents.pop(); // Remove the last component
    setComponents(newComponents);
  }
};


  const [components, setComponents] = useState([{
    id: Date.now(),
    selectedCapacitor: null,
    temperature: null,
    capacitance: null,
    dcVoltageApplied: null,
    acVoltageApplied: null,
    dcVoltageRated: null,
    seriesResistance: null,
    selectedQuality: null,
    selectedEnvironment: null,
    circuitResistance: null,
    effectiveResistance: null,
    voltageApplied: null,
    shouldCalculateCR: false,
    quantity: 1,
    failureRate: 0
  }]);

  const [errors, setErrors] = useState({
    capacitorType: '',
    environment: '',
    quality: '',
    temperature: '',
    capacitance: '',
    dcVoltageApplied: '',
    acVoltageApplied: '',
    dcVoltageRated: '',
    seriesResistance: '',
    circuitResistance: '',
    effectiveResistance: '',
    voltageApplied: ''
  });

  const [failureRates, setFailureRates] = useState({});

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

  const addNewComponent = () => {
    const newComponent = {
      id: Date.now(),
      selectedCapacitor: null,
      temperature: null,
      capacitance: null,
      dcVoltageApplied: null,
      acVoltageApplied: null,
      dcVoltageRated: null,
      seriesResistance: null,
      selectedQuality: null,
      selectedEnvironment: null,
      circuitResistance: null,
      effectiveResistance: null,
      voltageApplied: null,
      shouldCalculateCR: false,
      quantity: 1,
      failureRate: 0
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (id) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    setFailureRates(prev => {
      const newRates = {...prev};
      delete newRates[id];
      return newRates;
    });
  };

  const updateComponent = (id, updatedProps) => {
    setComponents(components.map(comp =>
      comp.id === id ? { ...comp, ...updatedProps } : comp
    ));
  };

  const calculatePiT = (component) => {
    if (!component.selectedCapacitor || component.selectedCapacitor?.value?.πtColumn === "N/A (πt=1)") {
      return 1.0;
    }
    const BOLTZMANN_CONSTANT = 8.617e-5;
    const REFERENCE_TEMP = 298;
    const Ea = component.selectedCapacitor?.value?.πtColumn === 1 ? 0.15 : 0.35;
    const tempInKelvin = component.temperature + 273;
    const exponent = (-Ea / BOLTZMANN_CONSTANT) * ((1 / tempInKelvin) - (1 / REFERENCE_TEMP));
    return Math.exp(exponent);
  };

  const calculatePiC = (component) => {
    if (!component.selectedCapacitor || component.selectedCapacitor?.value?.πcColumn === "N/A (πc=1)") {
      return 1.0;
    }
    return component.selectedCapacitor?.value?.πcColumn === 1
      ? Math.pow(component.capacitance, 0.09)
      : Math.pow(component.capacitance, 0.23);
  };

  const calculatePiV = (component) => {
    if (!component.selectedCapacitor || component.selectedCapacitor?.value?.πvColumn === "N/A (πv=1)") {
      return 1.0;
    }
    const operatingVoltage = component.dcVoltageApplied + Math.sqrt(2) * component.acVoltageApplied;
    const S = operatingVoltage / component.dcVoltageRated;

    return component.selectedCapacitor?.value?.πvColumn === 1 ? Math.pow(S / .6, 5) + 1 :
      component.selectedCapacitor?.value?.πvColumn === 2 ? Math.pow(S / .6, 10) + 1 :
      component.selectedCapacitor?.value?.πvColumn === 3 ? Math.pow(S / .6, 3) + 1 :
      component.selectedCapacitor?.value?.πvColumn === 4 ? Math.pow(S / .6, 17) + 1 :
      component.selectedCapacitor?.value?.πvColumn === 5 ? Math.pow(S / .5, 3) + 1 : 1.0;
  };

 
  const calculatePiSR = (component) => {
    if (component.shouldCalculateCR) {
      const CR = component.effectiveResistance / component.voltageApplied;
      return calculatePiSRFromCR(CR);
    } else {
      return component.circuitResistance;
    }
  };

  const validateForm = (component) => {
    const newErrors = {};
    let isValid = true;
    
    if (!component.selectedEnvironment) {
      newErrors.environment = 'Environment is required';
      isValid = false;
    }
    if (!component.selectedCapacitor) {
      newErrors.capacitorType = 'Select the Capacitor Type';
      isValid = false;
    }
    if (!component.selectedQuality) {
      newErrors.quality = 'Quality is required';
      isValid = false;
    }
    if (!component.dcVoltageApplied) {
      newErrors.dcVoltageApplied = 'DC Voltage is required';
      isValid = false;
    }
    if (!component.acVoltageApplied) {
      newErrors.acVoltageApplied = 'AC Voltage is required';
      isValid = false;
    }
    if (!component.dcVoltageRated) {
      newErrors.dcVoltageRated = 'DC Voltage Rated is required';
      isValid = false;
    }
    if (!component.temperature) {
      newErrors.temperature = 'Temperature is required';
      isValid = false;
    }
    if (!component.capacitance) {
      newErrors.capacitance = 'Capacitance is required';
      isValid = false;
    }
    if (component.shouldCalculateCR) {
      if (!component.effectiveResistance) {
        newErrors.effectiveResistance = 'Effective Resistance is required';
        isValid = false;
      }
      if (!component.voltageApplied) {
        newErrors.voltageApplied = 'Applied Voltage is required';
        isValid = false;
      }
    } else {
      if (!component.circuitResistance) {
        newErrors.circuitResistance = 'Circuit Resistance is required';
        isValid = false;
      }
    }
    
    return { isValid, newErrors };
  };

  const calculateFailureRate = (component) => {
    const validation = validateForm(component);
    if (!validation.isValid) {
      setErrors(validation.newErrors);
      return 0;
    }
    
    const λb = component.selectedCapacitor?.value.λb;
    const πT = calculatePiT(component);
    const πC = calculatePiC(component);
    const πV = calculatePiV(component);
    const πSR = calculatePiSR(component);
    const πQ = component.selectedQuality?.value.πQ;
    const πE = component.selectedEnvironment?.value.πE;
    const failureRate = λb * πT * πC * πV * πSR * πQ * πE * component.quantity;
    
    return failureRate;
  };

  const handleCalculate = (id) => {
    const component = components.find(c => c.id === id);
    if (!component) return;
    
    const failureRate = calculateFailureRate(component);
    updateComponent(id, { failureRate });
    
    setFailureRates(prev => ({
      ...prev,
      [id]: failureRate
    }));
    
    if (handleCalculateFailure) {
      handleCalculateFailure(failureRate);
    }
  };

  const totalSystemFailureRate = useMemo(() => {
    return Object.values(failureRates).reduce((sum, rate) => sum + (rate || 0), 0);
  }, [failureRates]);

if(capacitorTotalFRate){
  capacitorTotalFRate(totalSystemFailureRate)
}

  const renderComponent = (component) => {
    const piT = calculatePiT(component);
    const piC = calculatePiC(component);
    const piV = calculatePiV(component);
    const piSR = calculatePiSR(component);
    
    return (
      <div key={component.id} className="component-container" style={{
        border: '1px solid #ddd',
        padding: '15px',
        margin: '15px 0',
        borderRadius: '5px',
        position: 'relative'
      }}>
        <h3>Component {components.findIndex(c => c.id === component.id) + 1}</h3>
        
        <h2 className='text-center' style={{ fontSize: '1.2rem' }}>Capacitor Reliability Calculator</h2>
        
        <Row>
          <Col md={4}>
            <div className="form-group">
              <label>Part Type:</label>
              <Select
                styles={customStyles}
                isInvalid={!!errors.capacitorType}
                value={component.selectedCapacitor}
                onChange={(selectedOption) => {
                  updateComponent(component.id, { 
                    selectedCapacitor: selectedOption,
                    failureRate: 0
                  });
                  setErrors({ ...errors, capacitorType: '' });
                }}
                options={capacitorTypes.map(type => ({
                  value: type,
                  label: `${type.style} - ${type.description}`
                }))}
                placeholder="Select type"
              />
              {errors.capacitorType && <small style={{ color: 'red' }}>{errors.capacitorType}</small>}
            </div>
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label>Environment (π<sub>E</sub>):</label>
              <Select
                styles={customStyles}
                isInvalid={!!errors.environment}
                value={component.selectedEnvironment}
                onChange={(selectedOption) => {
                  updateComponent(component.id, { 
                    selectedEnvironment: selectedOption,
                    failureRate: 0
                  });
                  setErrors({ ...errors, environment: '' });
                }}
                options={environmentFactors.map(type => ({
                  value: type,
                  label: `${type.env}`
                }))}
              />
              {errors.environment && <small style={{ color: 'red' }}>{errors.environment}</small>}
            </div>
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label>Quality (π<sub>Q</sub>):</label>
              <Select
                styles={customStyles}
                isInvalid={!!errors.quality}
                value={component.selectedQuality}
                onChange={(selectedOption) => {
                  updateComponent(component.id, { 
                    selectedQuality: selectedOption,
                    failureRate: 0
                  });
                  setErrors({ ...errors, quality: '' });
                }}
                options={qualityFactors.map(type => ({
                  value: type,
                  label: `${type.quality}`
                }))}
              />
              {errors.quality && <small style={{ color: 'red' }}>{errors.quality}</small>}
            </div>
          </Col>
        </Row>

        <label>Voltage Stress Factor(π<sub>V</sub>):</label>
        <Row>
          <Col md={4}>
            <div className="form-group">
              <label>DC Voltage Applied (V):</label>
              <input
                type="number"
                value={component.dcVoltageApplied || ''}
                isInvalid={!!errors.dcVoltageApplied}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value);
                  updateComponent(component.id, { 
                    dcVoltageApplied: value,
                    failureRate: 0
                  });
                  setErrors({ ...errors, dcVoltageApplied: '' });
                }}
                min="0"
                step="1"
              />
              {errors.dcVoltageApplied && <small style={{ color: 'red' }}>{errors.dcVoltageApplied}</small>}
            </div>
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label>AC Voltage Applied (Vrms):</label>
              <input
                type="number"
                value={component.acVoltageApplied || ''}
                isInvalid={!!errors.acVoltageApplied}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value);
                  updateComponent(component.id, { 
                    acVoltageApplied: value,
                    failureRate: 0
                  });
                  setErrors({ ...errors, acVoltageApplied: '' });
                }}
                min="0"
                step="1"
              />
              {errors.acVoltageApplied && <small style={{ color: 'red' }}>{errors.acVoltageApplied}</small>}
            </div>
          </Col>
          <Col md={4}>
            <div className="form-group">
              <label>DC Voltage Rated (V):</label>
              <input
                type="number"
                value={component.dcVoltageRated || ''}
                isInvalid={!!errors.dcVoltageRated}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value);
                  updateComponent(component.id, { 
                    dcVoltageRated: value,
                    failureRate: 0
                  });
                  setErrors({ ...errors, dcVoltageRated: '' });
                }}
                min="1"
                step="1"
              />
              {errors.dcVoltageRated && <small style={{ color: 'red' }}>{errors.dcVoltageRated}</small>}
              {component.selectedCapacitor?.value?.πvColumn && (
                <div className="mt-2">
                  Calculated π<sub>V</sub>: {piV?.toFixed(3)}
                </div>
              )}
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <div className="form-group">
              <label>Temperature (°C) π<sub>T</sub>:</label>
              <input
                type="number"
                value={component.temperature || ''}
                isInvalid={!!errors.temperature}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value);
                  updateComponent(component.id, { 
                    temperature: value,
                    failureRate: 0
                  });
                  setErrors({ ...errors, temperature: '' });
                }}
                min="20"
                max="150"
                step="1"
              />
              {errors.temperature && <small style={{ color: 'red' }}>{errors.temperature}</small>}
              <br/>
              <small>T<sub>A</sub>= Hybrid Case Temperature</small>
              {component.selectedCapacitor?.value?.πtColumn && (
                <div className="mt-2">
                  Calculated π<sub>T</sub>: {piT?.toFixed(3)}
                </div>
              )}
            </div>
          </Col>

          <Col md={4}>
            <div className="form-group">
              <label>Capacitance (μF) for π<sub>C</sub>:</label>
              <input
                type="number"
                isInvalid={!!errors.capacitance}
                value={component.capacitance || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value);
                  updateComponent(component.id, { 
                    capacitance: value,
                    failureRate: 0
                  });
                  setErrors({ ...errors, capacitance: '' });
                }}
                min="0.000001"
                step="0.000001"
              />
              {errors.capacitance && <small style={{ color: 'red' }}>{errors.capacitance}</small>}
              {component.selectedCapacitor?.value?.πcColumn && (
                <div className="mt-2">
                  Calculated π<sub>C</sub>: {piC?.toFixed(3)}
                </div>
              )}
            </div>
          </Col>

          <Col md={4}>
            <div className="form-group">
              <label>Series Resistance Factor (πSR):</label>
              <Select
                styles={customStyles}
                isInvalid={!!errors.seriesResistance}
                value={seriesResistanceOptions.find(option =>
                  option.value === component.circuitResistance
                )}
                onChange={(selectedOption) => {
                  const value = selectedOption.value;
                  updateComponent(component.id, { 
                    circuitResistance: value,
                    failureRate: 0
                  });
                  setErrors({ ...errors, circuitResistance: '' });
                }}
                options={seriesResistanceOptions}
                placeholder="Select Effective Resistance (ohms/volt)"
                isDisabled={component.shouldCalculateCR}
              />
              {errors.circuitResistance && !component.shouldCalculateCR && 
                <small style={{ color: 'red' }}>{errors.circuitResistance}</small>}
              {component.selectedCapacitor?.value?.πsrColumn && (
                <div className="mt-2">
                  Calculated π<sub>SR</sub>: {piSR?.toFixed(3)}
                </div>
              )}
            </div>
          </Col>
        </Row>

        <div className="form-group">
          <div className="d-flex">
            <label>
              <input
                className="form-check-input me-3"
                type="radio"
                name={`type-${component.id}`}
                checked={component.shouldCalculateCR}
                onChange={() => { }}
                onClick={(e) => {
                  if (component.shouldCalculateCR) {
                    e.preventDefault();
                    updateComponent(component.id, { shouldCalculateCR: false });
                  } else {
                    updateComponent(component.id, { shouldCalculateCR: true });
                  }
                }}
              />
              {component.shouldCalculateCR ? "Calculating CR (click to cancel)" : "Calculate CR"}
            </label>
          </div>
        </div>

        {component.shouldCalculateCR && (
          <>
            <Row>
              <Col md={4}>
                <div className="form-group">
                  <label>Effective Resistance:</label>
                  <input
                    type="number"
                    value={component.effectiveResistance || ''}
                    isInvalid={!!errors.effectiveResistance}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                      updateComponent(component.id, { 
                        effectiveResistance: value,
                        failureRate: 0
                      });
                      setErrors({ ...errors, effectiveResistance: '' });
                    }}
                    min="0"
                    step="0.1"  
                  />
                  {errors.effectiveResistance && <small style={{ color: 'red' }}>{errors.effectiveResistance}</small>}
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Voltage Applied to Capacitor (V) for π<sub>SR</sub>:</label>
                  <input
                    type="number"
                    value={component.voltageApplied || ''}
                    isInvalid={!!errors.voltageApplied}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                      updateComponent(component.id, { 
                        voltageApplied: value,
                        failureRate: 0
                      });
                      setErrors({ ...errors, voltageApplied: '' });
                    }}
                    min="0"
                    step="0.1"
                  />
                  {errors.voltageApplied && <small style={{ color: 'red' }}>{errors.voltageApplied}</small>}
                </div>
              </Col>
            </Row>
            {component.effectiveResistance && component.voltageApplied && (
              <div className="mt-3">
                <p><strong>CR Calculation:</strong></p>
                <p>CR = Effective Resistance / Applied Voltage</p>
                <p>CR = {component.effectiveResistance}Ω / {component.voltageApplied}V = 
                  {(component.effectiveResistance / component.voltageApplied)?.toFixed(2)} ohms/volt</p>
                <p className="mt-2"><strong>π<sub>SR</sub> Result:</strong> {piSR?.toFixed(3)}</p>
              </div>
            )}
          </>
        )}
        
          <Col md={4}>
            <div className="form-group">
              <label>Quantity (Nₙ):</label>
              <input
                type="number"
                min="1"
                value={component.quantity || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseInt(e.target.value);
                  updateComponent(component.id, { 
                    quantity: value,
                    failureRate: 0
                  });
                }}
              />
            </div>
          </Col>
        
       
            <Button 
              className="btn float-end mt-1" 
              onClick={() => handleCalculate(component.id)}
            >
              Calculate FR
            </Button>
      
    

        {component.failureRate > 0 && (
          <div className="prediction-result" style={{ marginTop: '20px',width:"50%" }}>
            <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
            <span className="ms-2">
              {(component.failureRate / component.quantity)?.toFixed(10)} failures/10<sup>6</sup> hours
            </span>
            <br/>
            <strong>Total (λ<sub>c</sub> × Nₙ):</strong>
            <span className="ms-2">  
              {component.failureRate?.toFixed(10)} failures/10<sup>6</sup> hours
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
        Capacitor Reliability Calculator
      </h2>
      
      {components.map(component => renderComponent(component))}

      <Button onClick={addNewComponent} className="mt-3">
        Add Component
      </Button>

      {components.length > 0 && (
        <div className="total-failure-rate" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa' }}>
          <h5> Capacitors (λ<sub>c</sub> * N<sub>c</sub>): {totalSystemFailureRate?.toFixed(10)} failures/10<sup>6</sup> hours</h5>
        </div>
      )}
    </div>
  );
}
export default MicroCapacitor;