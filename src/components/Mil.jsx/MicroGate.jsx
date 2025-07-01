import React, { useState } from 'react';
import Select from "react-select";
import {
  calculateMicrocircuitsAndMicroprocessorsFailureRate,
  calculatePiT,
  getEnvironmentFactor,
  getFailureRate,
  getQualityFactor,
  calculateGateArrayC1,
  calculateLearningFactor,
} from './Calculation.js';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Button, Row, Col } from 'react-bootstrap';
import Box from '@mui/material/Box';
import { Alert, Paper, Typography } from "@mui/material";
import MaterialTable from "material-table";
import './Microcircuits.css';

const MicroGate = ({ onCalculate }) => {
  const [showCalculations, setShowCalculations] = useState(false);
  const [components, setComponents] = useState([]);
  const [results, setResults] = useState(null);
  const [currentComponent, setCurrentComponent] = useState({
    type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
    temperature: 25,
    devices: "",
    complexFailure: "",
    environment: '',
    quality: '',
    quantity: 0,
    microprocessorData: "",
    gateCount: "",
    technology: '',
    applicationFactor: '',
    packageType: '',
    pinCount: '',
    yearsInProduction: '',
    piL: 1.0,
    calculatedPiT: null
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentComponent(prev => ({
      ...prev,
      [name]: name === 'temperature' || name === 'Tj' || name === 'quantity'
        ? parseFloat(value)
        : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!currentComponent.environment) {
      newErrors.environment = 'Please select an environment.';
      isValid = false;
    }

    if (!currentComponent.quality) {
      newErrors.quality = 'Please select a quality factor.';
      isValid = false;
    }

    if (!currentComponent.applicationFactor) {
      newErrors.applicationFactor = 'Please select an application factor.';
      isValid = false;
    }

    if (!currentComponent.devices) {
      newErrors.devices = 'Please select a device type.';
      isValid = false;
    }
    if(!currentComponent.packageType){
       newErrors.packageType = 'Please select a package type.';
    }
    if (!currentComponent.complexFailure) {
      newErrors.complexFailure = 'Please select a complexity type.';
      isValid = false;
    }

    if (!currentComponent.gateCount) {
      newErrors.gateCount = 'Please select a gate/transistor count.';
      isValid = false;
    }

    if (!currentComponent.pinCount || currentComponent.pinCount < 3) {
      newErrors.pinCount = 'Please enter valid number of functional pins (minimum 3).';
      isValid = false;
    }

    if (!currentComponent.yearsInProduction) {
      newErrors.yearsInProduction = 'Please select years in production.';
      isValid = false;
    }

    if (!currentComponent.technology) {
      newErrors.technology = 'Please select a technology type.';
      isValid = false;
    }

    if (!currentComponent.temperature || isNaN(currentComponent.temperature)) {
      newErrors.temperature = 'Please enter a valid junction temperature.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const addComponent = () => {
    if (!validateForm()) {
      setResults(null);
      return;
    }

    const failureRate = calculateMicrocircuitsAndMicroprocessorsFailureRate(currentComponent);
    const calculationParams = {
      C1: calculateGateArrayC1(currentComponent),
      C2: getFailureRate(currentComponent.packageType, currentComponent.pinCount),
      piT: calculatePiT(currentComponent.technology, currentComponent.temperature),
      piE: getEnvironmentFactor(currentComponent?.environment),
      piQ: getQualityFactor(currentComponent.quality),
      piL: calculateLearningFactor(currentComponent.yearsInProduction),
      λp: failureRate
    };

    const newComponent = {
      ...currentComponent,
      failureRate,
      totalFailureRate: failureRate,
      calculationParams
    };

    setComponents([...components, newComponent]);
    setResults({
      failureRate,
      totalFailureRate: failureRate,
      calculationParams
    });

    if (onCalculate) {
      onCalculate(failureRate);
    }
  };

  return (
    <div className="reliability-calculator">
      <div>
        <Row>
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
                  setErrors({...errors, environment: ''});
                }}
                options={[
                  { value: "GB", label: "Ground, Benign (GB)", piE: 0.50 },
                  { value: "GF", label: "Ground, Fixed (GF)", piE: 2.0 },
                  { value: "GM", label: "Ground, Mobile (GM)", piE: 4.0 },
                  { value: "NS", label: "Naval, Sheltered (NS)", piE: 4.0 },
                  { value: "NU", label: "Naval, Unsheltered (NU)", piE: 6.0 },
                  { value: "AIC", label: "Airborne, Inhabited Cargo (AIC)", piE: 4.0 },
                  { value: "AIF", label: "Airborne, Inhabited Fighter (AIF)", piE: 5.0 },
                  { value: "AUC", label: "Airborne, Uninhabited Cargo (AUC)", piE: 5.0 },
                  { value: "AUF", label: "Airborne, Uninhabited Fighter (AUF)", piE: 8.0 },
                  { value: "ARW", label: "Airborne, Rotary Wing (ARW)", piE: 8.0 },
                  { value: "SF", label: "Space, Flight (SF)", piE: 0.50 },
                  { value: "MF", label: "Missile, Flight (MF)", piE: 5.0 },
                  { value: "ML", label: "Missile, Launch (ML)", piE: 12 },
                  { value: "CL", label: "Cannon, Launch (CL)", piE: 220 }
                ]}
                className={errors.environment ? 'is-invalid' : ''}
              />
              {errors.environment && <div className="text-danger small mt-1">{errors.environment}</div>}
            </div>
          </Col>
          
          <Col md={4}>
            <div className="form-group">
              <label>Quality Factor (π<sub>Q</sub>):</label>
              <Select
                styles={customStyles}
                name="quality"
                placeholder="Select Quality Class"
                onChange={(selectedOption) => {
                  setCurrentComponent({
                    ...currentComponent,
                    quality: selectedOption.value,
                    piQ: selectedOption.piQ
                  });
                  setErrors({...errors, quality: ''});
                }}
                options={[
                  { value: "MIL_M_38510_ClassS", label: "Class S (MIL-M-38510, Class S)", piQ: 0.25 },
                  { value: "MIL_I_38535_ClassU", label: "Class S (MIL-I-38535, Class U)", piQ: 0.25 },
                  { value: "MIL_H_38534_ClassS_Hybrid", label: "Class S Hybrid (MIL-H-38534, Level K)", piQ: 0.25 },
                  { value: "MIL_M_38510_ClassB", label: "Class B (MIL-M-38510, Class B)", piQ: 1.0 },
                  { value: "MIL_I_38535_ClassQ", label: "Class B (MIL-I-38535, Class Q)", piQ: 1.0 },
                  { value: "MIL_H_38534_ClassB_Hybrid", label: "Class B Hybrid (MIL-H-38534, Level H)", piQ: 1.0 },
                  { value: "MIL_STD_883_ClassB1", label: "Class B-1 (MIL-STD-883)", piQ: 2.0 }
                ]}
                className={errors.quality ? 'is-invalid' : ''}
              />
              {errors.quality && <div className="text-danger small mt-1">{errors.quality}</div>}
            </div>
          </Col>

          <Col md={4}>
            <div className="form-group">
              <label>Device Application Factor:</label>
              <Select
                styles={customStyles}
                name="applicationFactor"
                placeholder="Select"
                onChange={(selectedOption) => {
                  setCurrentComponent({ 
                    ...currentComponent, 
                    applicationFactor: selectedOption.value 
                  });
                  setErrors({...errors, applicationFactor: ''});
                }}
                options={[
                  { value: "MMIC Devices-Low Noise & Low Power", label: "MMIC Devices-Low Noise & Low Power" },
                  { value: "MMIC Devices-Driver & High Power", label: "MMIC Devices-Driver & High Power" },
                  { value: "MMIC Devices-Unknown", label: "MMIC Devices-Unknown" },
                  { value: "Digital Devices- All Digital Applications", label: "Digital Devices- All Digital Applications" },
                ]}
                className={errors.applicationFactor ? 'is-invalid' : ''}
              />
              {errors.applicationFactor && <div className="text-danger small mt-1">{errors.applicationFactor}</div>}
            </div>
          </Col>

          <Col md={4}>
            <div className="form-group">
              <label>Device Type for (C<sub>1</sub>):</label>
              <Select
                styles={customStyles}
                name="devices"
                placeholder="Select"
                onChange={(selectedOption) => {
                  setCurrentComponent({ 
                    ...currentComponent, 
                    devices: selectedOption.value,
                    complexFailure: '', // Reset complexFailure when device type changes
                    gateCount: '' // Reset gateCount when device type changes
                  });
                  setErrors({
                    ...errors, 
                    devices: '',
                    complexFailure: '',
                    gateCount: ''
                  });
                }}
                options={[
                  { value: "bipolarData", label: "Bipolar Digital and Linear Gate" },
                  { value: "mosData", label: "MOS Digital and Linear Gate" },
                  { value: "microprocessorData", label: "Microprocessor" }
                ]}
                className={errors.devices ? 'is-invalid' : ''}
              />
              {errors.devices && <div className="text-danger small mt-1">{errors.devices}</div>}
            </div>
          </Col>

          {currentComponent.devices === "bipolarData" && (
            <>
              <Col md={4}>
                <div className="form-group">
                  <label>Bipolar Devices for (C<sub>1</sub>):</label>
                  <Select
                    styles={customStyles}
                  className={errors.complexFailure ? 'is-invalid' : ''}
                    name="complexFailure"
                    placeholder="Select"
                    onChange={(selectedOption) => {
                      setCurrentComponent({ 
                        ...currentComponent, 
                        complexFailure: selectedOption.value,
                        gateCount: '' // Reset gateCount when complexity changes
                      });
                      setErrors({
                        ...errors, 
                        complexFailure: '',
                        gateCount: ''
                      });
                    }}
                    options={[
                      { value: "digital", label: "Digital" },
                      { value: "linear", label: "Linear" },
                      { value: "pla", label: "PLA/PAL" }
                    ]}
                    
                  />
                  {errors.complexFailure && <div className="text-danger small mt-1">{errors.complexFailure}</div>}
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
                 className={errors.gateCount ? 'is-invalid' : ''}
                      placeholder="select"
                      name="gateCount"
                      onChange={(selectedOption) => {
                        setCurrentComponent({ 
                          ...currentComponent, 
                          gateCount: selectedOption.value 
                        });
                        setErrors({...errors, gateCount: ''});
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
                    {errors.gateCount && <div className="text-danger small mt-1">{errors.gateCount}</div>}
                  </div>
                )}
              </Col>
            </>
          )}

          {currentComponent.devices === "mosData" && (
            <>
              <Col md={4}>
                <div className="form-group">
                  <label>MOS Devices for (C<sub>1</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="complexFailure"
                    placeholder="Select"
               className={errors.complexFailure ? 'is-invalid' : ''}
                    onChange={(selectedOption) => {
                      setCurrentComponent({ 
                        ...currentComponent, 
                        complexFailure: selectedOption.value,
                        gateCount: '' // Reset gateCount when complexity changes
                      });
                      setErrors({
                        ...errors, 
                        complexFailure: '',
                        gateCount: ''
                      });
                    }}
                    options={[
                      { value: "digital", label: "Digital" },
                      { value: "linear", label: "Linear" },
                      { value: "pla", label: "PLA/PAL" }
                    ]}
                   
                  />
                  {errors.complexFailure && <div className="text-danger small mt-1">{errors.complexFailure}</div>}
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
               className={errors.gateCount ? 'is-invalid' : ''}
                      onChange={(selectedOption) => {
                        setCurrentComponent({ 
                          ...currentComponent, 
                          gateCount: selectedOption.value 
                        });
                        setErrors({...errors, gateCount: ''});
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
                    {errors.gateCount && <div className="text-danger small mt-1">{errors.gateCount}</div>}
                  </div>
                )}
              </Col>
            </>
          )}

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
                        gateCount: '' // Reset gateCount when complexity changes
                      });
                      setErrors({
                        ...errors, 
                        complexFailure: '',
                        gateCount: ''
                      });
                    }}
                    options={[
                      { value: "bipolar", label: "Bipolar" },
                      { value: "mos", label: "MOS" },
                    ]}
                    className={errors.complexFailure ? 'is-invalid' : ''}
                  />
                  {errors.complexFailure && <div className="text-danger small mt-1">{errors.complexFailure}</div>}
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
                        setCurrentComponent({ 
                          ...currentComponent, 
                          gateCount: selectedOption.value 
                        });
                        setErrors({...errors, gateCount: ''});
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
                      className={errors.gateCount ? 'is-invalid' : ''}
                    />
                    {errors.gateCount && <div className="text-danger small mt-1">{errors.gateCount}</div>}
                  </div>
                )}
              </Col>
            </>
          )}

  <Col md={4}>
                <div className="form-group">
                  <label>Package Type for (C<sub>2</sub>):</label>
                  <Select
                    styles={customStyles}
                    name="packageType"
                    className={errors.packageType ? 'is-invalid' : ''}
                    placeholder="Select Package Type"
                    onChange={(selectedOption) => {
                      setCurrentComponent({
                        ...currentComponent,
                        packageType: selectedOption.value
                      });
                        setErrors({...errors, packageType: ''});
                    }}
                    options={[
                      { value: "Hermetic_DIPs_SolderWeldSeal", label: "Hermetic: DIPs w/Solder or Weld Seal, PGA, SMT" },
                      { value: "DIPs_GlassSeal", label: "DIPs with Glass Seal" },
                      { value: "Flatpacks_AxialLeads", label: "Flatpacks with Axial Leads" },
                      { value: "Cans", label: "Cans" },
                      { value: "Nonhermetic_DIPs_PGA_SMT", label: "Nonhermetic: DIPs, PGA, SMT" }
                    ]}
                  />
                   {errors.packageType && <div className="text-danger small mt-1">{errors.packageType}</div>}
                </div>
              </Col>
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
                {errors.pinCount && <div className="text-danger small mt-1">{errors.pinCount}</div>}
                </div>
              </Col>
      

          <Col md={4}>
            <div className="form-group">
              <label>Learning Factor (π<sub>L</sub>):</label>
              <Select
                styles={customStyles}
                name="yearsInProduction"
                placeholder="Select Years in Production"
                onChange={(selectedOption) => {
                  setCurrentComponent({
                    ...currentComponent,
                    yearsInProduction: selectedOption.value,
                    piL: selectedOption.piL
                  });
                  setErrors({...errors, yearsInProduction: ''});
                }}
                options={[
                  {
                    value: 0.1,
                    label: "≤ 0.1 years",
                    piL: 2.0,
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
                className={errors.yearsInProduction ? 'is-invalid' : ''}
              />
              {errors.yearsInProduction && <div className="text-danger small mt-1">{errors.yearsInProduction}</div>}
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
                className={errors.technology ? 'is-invalid' : ''}
              />
              {errors.technology && <div className="text-danger small mt-1">{errors.technology}</div>}
            </div>
          </Col>

          <Col md={4}>
            <div className="form-group">
              <label>Junction Temperature (°C) for (π<sub>T</sub>):</label>
              <input
                className={`form-control ${errors.temperature ? 'is-invalid' : ''}`}
                type="number"
                name="temperature"
                min="-40"
                max="175"
                value={currentComponent.temperature}
                onChange={handleInputChange}
              />
              {errors.temperature && <div className="text-danger small mt-1">{errors.temperature}</div>}
            </div>
          </Col>
        </Row>

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
                <CalculatorIcon style={{ height: '30px', width: '40px' }} fontSize="large" />
                <Typography variant="body1" sx={{ fontWeight: 'bold', ml: 1 }}>
                  {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
                </Typography>
              </Box>
            )}
          </div>
          <Button
            variant="primary"
            onClick={addComponent}
          >
            Calculate Failure Rate
          </Button>
        </div>

        {results && (
          <>
            <h2 className="text-center mt-3">Calculation Result</h2>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1">
                  <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                  <span className="ms-2">
                    {calculateMicrocircuitsAndMicroprocessorsFailureRate(currentComponent)?.toFixed(4)} failures/10<sup>6</sup> hours
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        {showCalculations && results && (
          <div className="card mt-3">
            <div className="card-body">
              <MaterialTable
                columns={componentColumns}
                data={[results.calculationParams]}
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
              <br />
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MicroGate;