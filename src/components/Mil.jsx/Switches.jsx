import React, { useState, useMemo } from 'react';
import Select from "react-select";
import './Switch.css';
import { Link } from '@material-ui/core';
import MaterialTable from "material-table";
// import {
//   Paper,
//   Typography,
//   IconButton,
//   Tooltip
// } from '@material-ui/core';
// import DeleteIcon from '@material-ui/icons/Delete';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'

import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
import { customStyles } from "./Selector";
import { Alert, Paper, Typography } from "@mui/material";
// Might trigger endlessly if someProp changes often
const Switches = ({ onCalculate }) => {
  const [currentComponent, setCurrentComponent] = useState({
    type: "Switches,Circuit Breakers",
    switchType: "",
     
    configurationFactor: '',
    loadType:"",
    usageFactor: "",
    failureType: "",
    environment: '',
    quality: '',
    ratedCurrent: 10,
    operatingCurrent: 1,
    stressRatio: 0.1
  });
  const [showResults, setShowResults] = useState(false);
  const [showCalculations, setShowCalculations] = useState(false);
  const [components, setComponents] = useState([]);
  const [component, setComponent] = useState([]);
  const [calculation, setCalculation] = useState([])
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({
    type: '',
    switchType: '',
    failureType: '',
    environment: '',
    quality: '',
    configurationFactor: '',
    loadType: '',
    usageFactor: '',
    ratedCurrent: '',
    operatingCurrent: ''
  });
   

  const QUALITY_FACTORS = {
    'MIL-SPEC': 1.0,
    'Lower': 2.0  
  };
  const QUALITY_FACTORS1 = {
    'MIL-SPEC': 1.0,
    'Lower': 8.4  
  };

  const CONTACT_FORM_FACTORS = {
    'SPST': 1.0, 'DPST': 1.3, 'SPDT': 1.3, '3PST': 1.4,
    '4PST': 1.6, 'DPDT': 1.6, '3PDT': 1.8, '4PDT': 2.0, '6PDT': 2.3
  };
  const CONTACT_FORM_FACTORS1 = {
    'SPST': 1.0, 'DPST': 2.0, '3PST': 3.0,
    '4PST': 4.0,
  };

  const ENVIRONMENT_FACTORS1 = {
    'GB': 1.0, 'GF': 3.0, 'GM': 18, 'NS': 8.0, 'NU': 29,
    'AIC': 10, 'AIF': 18, 'AUC': 13, 'AUF': 22, 'ARW': 46,
    'SF': 0.50, 'MF': 25, 'ML': 67, 'CL': 1200
  };

  const ENVIRONMENT_FACTORS = {
    'GB': 1.0, 'GF': 2.0, 'GM': 15, 'NS': 8.0, 'NU': 27,
    'AIC': 7.0, 'AIF': 9.0, 'AUC': 11, 'AUF': 12, 'ARW': 46,
    'SF': 0.50, 'MF': 25, 'ML': 66, 'CL': 0
  };
  // Base failure rates (λ_b) from the image
const BASE_FAILURE_RATES = {
    'Centrifugal (N/A)': 3.4,
    'Dual-In-line Package Limit (Mil-S-83504)': 0.00012,
    'Limit(Mil-S-8805)':4.3,
    'Liquid Level  (Mil-S-21277)':2.3,
    'Microwave Waveguide (N/A)':1.7,
    'Pressure (Mil-S-8932)': 2.8,
    // 'Pressure ': ,
    'Pushbutton (Mil-S-8805)': 0.10,
    // 'Pushbutton (Mil-S-22885)': null,
    // 'Pushbutton (Mil-S-24317)': null,
    'Reed (Mil-S-55433)': 0.0010,
    'Rocker (Mil-S-3950)': 0.023,
    'Rotary (Mil-S-3786)': 0.11,
    // 'Rotary (Mil-S-13623)': null,
    // 'Rotary (Mil-S-15291)': null,
    // 'Rotary (Mil-S-15743)': null,
    // 'Rotary (Mil-S-22604)': null,
    // 'Rotary (Mil-S-22710)': null,
    // 'Rotary (Mil-S-45885)': null,
    // 'Sensitive (Mil-S-82359)': null,
    'Sensitive (Mil-S-8805)': 0.49,
    // 'Sensitive (Mil-S-13484)': null,
    // 'Sensitive (Mil-S-22614)': null,
    'Thermal (Mil-S-12285)': 0.031,
    // 'Thermal (Mil-S-24286)': null,
    'Thumbwheel (Mil-S-22710)': 0.18,
    'Toggle (Mil-S-3950)': 0.10,
    // 'Toggle (Mil-S-5594)': null,
    // 'Toggle (Mil-S-8805)': null,
    // 'Toggle (Mil-S-8834)': null,
    // 'Toggle (Mil-S-9419)': null,
    // 'Toggle (Mil-S-13735)': null,
    // 'Toggle (Mil-S-81551)': null,
    // 'Toggle (Mil-S-83731)': null
};

  const BASE_FAILURE_RATES1 = {
    'Magnetic': .34,
    'Thermal': .34,
    'Thermal-Magnetic': .34,

  };
  const USAGE_FACTORS = {
    'not-power': 1.0,   
    'power': 2.5         
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!currentComponent.type) {
      newErrors.type = 'Please select a part type.';
      isValid = false;
    }

    if (currentComponent.type === "Switches") {
      if (!currentComponent.switchType) {
        newErrors.switchType = 'Please select a switch type.';
        isValid = false;
      }
      if (!currentComponent.configurationFactor) {
        newErrors.configurationFactor = 'Please select a contact configuration.';
        isValid = false;
      }
      if (!currentComponent.loadType) {
        newErrors.loadType = 'Please select a load type.';
        isValid = false;
      }
      if (!currentComponent.ratedCurrent || currentComponent.ratedCurrent <= 0) {
        newErrors.ratedCurrent = 'Please enter a valid rated current (must be > 0).';
        isValid = false;
      }
        if (!currentComponent.configurationFactor) {
        newErrors.configurationFactor = 'Please select a contact configuration.';
        isValid = false;
      }
        if (!currentComponent.quality) {
      newErrors.quality = 'Please select a quality factor.';
      isValid = false;
    }
      if (!currentComponent.operatingCurrent || currentComponent.operatingCurrent < 0) {
        newErrors.operatingCurrent = 'Please enter a valid operating current (must be ≥ 0).';
        isValid = false;
      }
      if (currentComponent.operatingCurrent > currentComponent.ratedCurrent) {
        newErrors.operatingCurrent = 'Operating current cannot exceed rated current.';
        isValid = false;
      }
    } else if (currentComponent.type === "Switches,Circuit Breakers") {
      if (!currentComponent.failureType) {
        newErrors.failureType = 'Please select a failure type.';
        isValid = false;
      }
      if (!currentComponent.usageFactor) {
        newErrors.usageFactor = 'Please select a usage factor.';
        isValid = false;
      }
      if (!currentComponent.configurationFactor) {
        newErrors.configurationFactor = 'Please select a contact configuration.';
        isValid = false;
      }
    }

    if (!currentComponent.environment) {
      newErrors.environment = 'Please select an environment.';
      isValid = false;
    }
    if (!currentComponent.quality) {
      newErrors.quality = 'Please select a quality factor.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const calculateLoadStressFactor = (currentComponent, loadType) => {
    // const s = stressRatio;
    const s = currentComponent.operatingCurrent / currentComponent.ratedCurrent;
    if (s < 0 || s > 1) return 1.0; 

 
    if (loadType === 'resistive') return Math.exp(Math.pow((s / 0.8), 2));
    if (loadType === 'inductive') return Math.exp(Math.pow((s / 0.4), 2));
    if (loadType === 'lamp') return Math.exp(Math.pow((s / 0.2), 2));
    return 1.0;
  };

  const calculateFailureRate = () => {
    const λ_b = BASE_FAILURE_RATES[currentComponent.switchType.value];
    const π_L = calculateLoadStressFactor(currentComponent, currentComponent.loadType);
    const π_C = CONTACT_FORM_FACTORS[currentComponent.configurationFactor];
    const π_E = ENVIRONMENT_FACTORS[currentComponent.environment];
    const π_Q = QUALITY_FACTORS[currentComponent.quality];
    return λ_b * π_L * π_C * π_Q * π_E;
  };
  const handleCalculate = () => {
        if (!validateForm()) {
      setResult(null);
      return;
    }
    const λ_b = BASE_FAILURE_RATES[currentComponent.switchType.value];
    const π_L = calculateLoadStressFactor(currentComponent, currentComponent.loadType);
    const π_C = CONTACT_FORM_FACTORS[currentComponent.configurationFactor];
    const π_E = ENVIRONMENT_FACTORS[currentComponent.environment];
    const π_Q = QUALITY_FACTORS[currentComponent.quality];
    const λ_p = λ_b * π_L * π_C * π_Q * π_E;
    const newResult = {
      id: Date.now(), 
      value: λ_p.toFixed(6),
      parameters: {
        λ_b,
        π_L,
        π_C,
        π_Q,
        π_E,
        λ_p,
      },
      timestamp: new Date().toLocaleString()
    };

    setComponents([...components, {
      ...currentComponent,
      result: newResult
    }]);
    setResult(newResult);
    setCalculation([...calculation, newResult]);
    setError('');
    if (onCalculate) {
      onCalculate(λ_p);
    }

  };
  const tableData = useMemo(() => {
    if (!result) return [];

    return [{
      λ_b: BASE_FAILURE_RATES[currentComponent.switchType.value],
      π_L: calculateLoadStressFactor(currentComponent, currentComponent.loadType),
      π_C: CONTACT_FORM_FACTORS[currentComponent.configurationFactor],
      π_E: ENVIRONMENT_FACTORS1[currentComponent.environment],
      π_Q: QUALITY_FACTORS[currentComponent.quality],
      λ_p: calculateFailureRate()
    }];
  }, [currentComponent, result]);

  const calculateFailureRate1 = () => {
    const λ_b = BASE_FAILURE_RATES1[currentComponent.failureType.value];
    const π_C = CONTACT_FORM_FACTORS1[currentComponent.configurationFactor];
    const π_E = ENVIRONMENT_FACTORS1[currentComponent.environment];
    const π_Q = QUALITY_FACTORS1[currentComponent.quality];
    const π_U = USAGE_FACTORS[currentComponent.usageFactor];
  
    return λ_b * π_U * π_C * π_Q * π_E;
  }
  const handleCalculate1 = () => {
        if (!validateForm()) {
      setResult(null);
      return
    }
    const λ_b = BASE_FAILURE_RATES1[currentComponent.failureType.value];
    const π_C = CONTACT_FORM_FACTORS1[currentComponent.configurationFactor];
    const π_E = ENVIRONMENT_FACTORS1[currentComponent.environment];
    const π_Q = QUALITY_FACTORS1[currentComponent.quality];
    const π_U = USAGE_FACTORS[currentComponent.usageFactor];
    const λ_p = λ_b * π_U * π_C * π_Q * π_E;

    const newResult = {
      id: Date.now(),
      value: λ_p.toFixed(6),
      parameters: {
        λ_b,
        π_C,
        π_Q,
        π_E,
        π_U,
        λ_p
      },
      timestamp: new Date().toLocaleString()
    };

    setComponents([...components, {
      ...currentComponent,
      result: newResult
    }]);
    setResult(newResult);
    setCalculation([...calculation, newResult]);
    setError('');
    if (onCalculate) {
      onCalculate(λ_p);
    }
  }
  const handleCurrentChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseFloat(value) || 0;

 
    let stressRatio = currentComponent.stressRatio;
    if (name === 'ratedCurrent' || name === 'operatingCurrent') {
      const rated = name === 'ratedCurrent' ? newValue : currentComponent.ratedCurrent || 1;
      const operating = name === 'operatingCurrent'
        ? Math.min(newValue, rated)
        : Math.min(currentComponent.operatingCurrent || 0, rated);
      stressRatio = operating / rated;
    }

  
    setCurrentComponent(prev => ({
      ...prev,
      [name]: newValue,
      stressRatio
    }));
  };

  const componentColumns = [
    {
      title: <span>λ<sub>b</sub></span>,
      field: 'λ_b',
      render: rowData => rowData.λ_b?.toFixed(2) || '-'
    },
    {
      title: <span>π<sub>U</sub></span>,
      field: 'π_U',
      render: rowData => rowData.π_U?.toFixed(2) || '-'
    },
    {
      title: <span>π<sub>C</sub></span>,
      field: 'π_C',
      render: rowData => rowData.π_C?.toFixed(2) || '-'
    },
    {
      title: <span>π<sub>Q</sub></span>,
      field: 'π_Q',
      render: rowData => rowData.π_Q?.toFixed(2) || '-'
    },
    {
      title: <span>π<sub>E</sub></span>,
      field: 'π_E',
      render: rowData => rowData.π_E?.toFixed(2) || '-'
    },
    {
      title: <span>λ<sub>p</sub></span>,
      field: 'λ_p',
      render: rowData => rowData.λ_p?.toFixed(6) || '-'
    }
  ];

  const columns = [
    {
      title: <span>λ<sub>b</sub></span>,
      field: 'parameters.λ_b',
      render: rowData => rowData.λ_b?.toFixed(2) || '-'
    },
    {
      title: <span>π<sub>L</sub></span>,
      field: 'parameters.π_L',
      render: rowData => rowData.π_L?.toFixed(2) || '-'
    },

    {
      title: <span>π<sub>C</sub></span>,
      field: 'π_C',
      render: rowData => rowData.π_C?.toFixed(2) || '-'
    },
    {
      title: <span>π<sub>Q</sub></span>,
      field: 'π_Q',
      render: rowData => rowData.π_Q?.toFixed(2) || '-'
    },
    {
      title: <span>π<sub>E</sub></span>,
      field: 'π_E',
      render: rowData => rowData.π_E?.toFixed(2) || '-'
    },
    {
      title: "Failure Rate ",
      field: 'λ_p',
      render: rowData => rowData.λ_p?.toFixed(6) || '-'
    }
  ];


  return (
    <div className="switch-calculator">
      <h2 className='text-center'style={{ fontSize: '2.0rem' }}>{currentComponent?.type ? currentComponent.type.replace(/,/g, ' ').trim() :  "Switches,Circuit Breakers"}</h2>
      <Row className="mb-3">
          <Col md={4}>
        <div className="form-group">
    <label>Part Type:</label>
    <Select
      styles={customStyles}
      name="type"
      placeholder="Select"
      value={currentComponent.type ? 
        { value: currentComponent.type, label: currentComponent.type } : null}
      onChange={(selectedOption) => {
        setCurrentComponent({ ...currentComponent, type: selectedOption.value });
        setErrors({ ...errors, type: '' });
      }}
      options={[
        { value: "Switches", label: "Switches" },
        { value: "Switches,Circuit Breakers", label: "Switches,Circuit Breakers" },
      ]}
      className={errors.type ? 'is-invalid' : ''}
    />
    {errors.type && <small className="text-danger">{errors.type}</small>}
  </div>
  </Col>
        {currentComponent.type === "Switches,Circuit Breakers" && (
          <>
            <Col md={4}>
              <div className="form-group">
                <label>Base Failure Rate (λ<sub>b</sub>):</label>
                <Select
                  styles={customStyles}
                  name="failureType"
                  isInvalid={!!errors.failureType}
                  value={currentComponent.failureType}
                  onChange={(selectedOption) => {
                    setCurrentComponent({
                      ...currentComponent,
                      failureType: selectedOption
                    });
                    setErrors({...errors,failureType:""})
                  }}
                  options={[
                    {
                      value: "Magnetic",
                      label: "Magnetic",
                      baseFailureRate: 0.34
                    },
                    {
                      value: "Thermal",
                      label: "Thermal",
                      baseFailureRate: 0.34
                    },
                    {
                      value: "Thermal-Magnetic",
                      label: "Thermal-Magnetic",
                      baseFailureRate: 0.34
                    }
                  ]}
                />
                {errors.failureType && <small className="text-danger">{errors.failureType}</small>}
              </div>
            </Col>
              <Col md={4}>
          <div className="form-group">
            <label>Environment (π<sub>E</sub>):</label>
            <Select
              styles={customStyles}
              name="environment"
              isInvalid={!!errors.environment}
              value={{
                value: currentComponent.environment,
                label: currentComponent.environment? `${currentComponent.environment} (${ENVIRONMENT_FACTORS[currentComponent.environment]})`:"select..."
              }}
              onChange={(selectedOption) => {
                setCurrentComponent({
                  ...currentComponent,
                  environment: selectedOption.value
                });
                setErrors({...errors,environment:""})
              }}
              options={[
                { value: "GB", label: "Ground, Benign (1.0)" },
                { value: "GF", label: "Ground, Fixed (2.0)" },
                { value: "GM", label: "Ground, Mobile (15)" },
                { value: "NS", label: "Naval, Sheltered (8.0)" },
                { value: "NU", label: "Naval, Unsheltered (27)" },
                { value: "AIC", label: "Airborne, Inhabited Cargo (7.0)" },
                { value: "AIF", label: "Airborne, Inhabited Fighter (9.0)" },
                { value: "AUC", label: "Airborne, Uninhabited Cargo (11)" },
                { value: "AUF", label: "Airborne, Uninhabited Fighter (12)" },
                { value: "ARW", label: "Airborne, Rotary Wing (46)" },
                { value: "SF", label: "Space, Flight (0.50)" },
                { value: "MF", label: "Missile, Flight (25)" },
                { value: "ML", label: "Missile, Launch (66)" },
                { value: "CL", label: "Cannon, Launch (N/A)" }
              
              ]}
            />
                 {errors.environment && <small className="text-danger">{errors.environment}</small>}
          </div>
        </Col>
          </>
        )}
      
        {currentComponent.type === "Switches" && (
          <>
            <Col md={4}>
          <div className="form-group">
            <label>Environment (π<sub>E</sub>):</label>
            <Select
              styles={customStyles}
              name="environment"
              isInvalid={!!errors.environment}
              value={{
                value: currentComponent.environment,
                label: currentComponent.environment? `${currentComponent.environment} (${ENVIRONMENT_FACTORS1[currentComponent.environment]})`:"select..."
              }}
              onChange={(selectedOption) => {
                setCurrentComponent({
                  ...currentComponent,
                  environment: selectedOption.value
                });
                setErrors({...errors,environment:""})
              }}
              options={[
                { value: "GB", label: "Ground, Benign (1.0)" },
                { value: "GF", label: "Ground, Fixed (3.0)" },
                { value: "GM", label: "Ground, Mobile (18)" },
                { value: "NS", label: "Naval, Sheltered (8.0)" },
                { value: "NU", label: "Naval, Unsheltered (29)" },
                { value: "AIC", label: "Airborne, Inhabited Cargo (10.0)" },
                { value: "AIF", label: "Airborne, Inhabited Fighter (18.0)" },
                { value: "AUC", label: "Airborne, Uninhabited Cargo (13.0)" },
                { value: "AUF", label: "Airborne, Uninhabited Fighter (22)" },
                { value: "ARW", label: "Airborne, Rotary Wing (46)" },
                { value: "SF", label: "Space, Flight (0.50)" },
                { value: "MF", label: "Missile, Flight (25)" },
                { value: "ML", label: "Missile, Launch (67)" },
                { value: "CL", label: "Cannon, Launch (1200)" }
              
              ]}
            />
           {errors.environment && <small className="text-danger">{errors.environment}</small>}
          </div>
        </Col>
            <Col md={4}>
              <div className="form-group">
                <label>Quality Factor (π<sub>Q</sub>):</label>
                <Select
                  styles={customStyles}
                   isInvalid={!!errors.quality}
                  name="quality"
                  value={{
                    value: currentComponent.quality,
                    label: currentComponent.quality?`${currentComponent.quality} (${QUALITY_FACTORS[currentComponent.quality]})`:"select..."
                  }}
                  onChange={(selectedOption) => {
                    setCurrentComponent(prev => ({
                      ...prev,
                      quality: selectedOption.value
                    }));
                    setErrors({...errors,quality:""})
                  }}
                  options={[
                    { value: 'MIL-SPEC', label: 'MIL-SPEC (1.0)' },
                    { value: 'Lower', label: 'Lower (2.0)' }
                  ]}
                />
                {errors.quality && <small className="text-danger">{errors.quality}</small>}
              </div>
            </Col>
          </>
        )}
      </Row>
      {currentComponent.type === "Switches" && (
        <>
          <Row className="mb-3">
            <Col md={4}>
              <div className="form-group">
                <label>Switch Type (λ<sub>b</sub>):</label>
                <Select
                  styles={customStyles}
                  name="switchType"
                     isInvalid={!!errors.switchType}
                  value={currentComponent.switchType}
                  onChange={(selectedOption) => {
                    setCurrentComponent(prev => ({
                      ...prev,
                      switchType: selectedOption
                    }));
                    setErrors({...errors,switchType:""})
                  }}
                  options={[
                    {
                      value: 'Centrifugal (N/A)',
                      label: 'Centrifugal (N/A)',
                      baseFailureRate: 3.4,
                      description: "N/A specification"
                    },
                    {
                      value:  'Dual-In-line Package Limit (Mil-S-83504)',
                      label:  'Dual-In-line Package Limit (Mil-S-83504)',
                      baseFailureRate: 0.00012,
                      description: "MIL-S-83504 specification"
                    },
                    {
                      value: 'Limit(Mil-S-8805)',
                      label: 'Limit(Mil-S-8805)',
                      baseFailureRate: 4.3,
                      description: "MIL-S-21277 specification"
                    },
                    {
                      value:'Liquid Level  (Mil-S-21277)',
                      label:'Liquid Level  (Mil-S-21277)',
                      baseFailureRate: 2.3,
                      description: "MIL-S-21277 specification"
                    },
                    {
                      value:  'Microwave Waveguide (N/A)',
                      label:  'Microwave Waveguide (N/A)',
                      baseFailureRate: 1.7,
                      description: "N/A specification"
                    },
                    {
                      value:'Pressure (Mil-S-8932)',
                      label:'Pressure (Mil-S-8932)',
                      baseFailureRate: 2.8,
                      description: "MIL-S-8932 specification"
                    },
                    {
                      value:'Pushbutton (Mil-S-8805)',
                      label:'Pushbutton (Mil-S-8805)',
                      baseFailureRate: 0.10,
                      description: "MIL-S-8805 specification"
                    },
                    {
                      value:'Reed (Mil-S-55433)',
                      label:'Reed (Mil-S-55433)',
                      baseFailureRate: 0.0010,
                      description: "MIL-S-55433 specification"
                    },
                    {
                      value:'Rocker (Mil-S-3950)',
                      label:'Rocker (Mil-S-3950)',
                      baseFailureRate: 0.023,
                      description: "MIL-S-3950 specification"
                    },
                    {
                      value:'Rotary (Mil-S-3786)',
                      label:'Rotary (Mil-S-3786)',
                      baseFailureRate: 0.11,
                      description: "MIL-S-3786 specification"
                    },
                    {
                      value:'Sensitive (Mil-S-8805)',
                      label:'Sensitive (Mil-S-8805)',
                      baseFailureRate: 0.49,
                      description: "MIL-S-82359 specification"
                    },
                    {
                      value:'Thermal (Mil-S-12285)',
                      label:'Thermal (Mil-S-12285)',
                      baseFailureRate: 0.031,
                      description: "MIL-S-12285 specification"
                    },
                    {
                      value:'Thumbwheel (Mil-S-22710)',
                      label:'Thumbwheel (Mil-S-22710)',
                      baseFailureRate: 0.18,
                      description: "MIL-S-22710 specification"
                    },
                    {
                      value:'Toggle (Mil-S-3950)',
                      label:'Toggle (Mil-S-3950)',
                      baseFailureRate: 0.10,
                      description: "MIL-S-3950 specification"
                    }
              
                  ]}
                />
                {errors.switchType && <small className="text-danger">{errors.switchType}</small>}
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Contact Configuration (π<sub>C</sub>):</label>
                <Select
                  styles={customStyles}
                  name="configurationFactor"
                  value={{
                    value: currentComponent.configurationFactor,
                    label: currentComponent.configurationFactor?`${currentComponent.configurationFactor} (${CONTACT_FORM_FACTORS[currentComponent.configurationFactor]})`:"select..."
                  }}
                  onChange={(selectedOption) => {
                    setCurrentComponent(prev => ({
                      ...prev,
                      configurationFactor: selectedOption.value
                    }));
                    setErrors({...errors,configurationFactor:""})
                  }}
                  options={[
                    { value: 'SPST', label: 'SPST (1 contact)' },
                    { value: 'DPST', label: 'DPST (2 contact)' },
                    { value: 'SPDT', label: 'SPDT (2 contact)' },
                    { value: '3PST', label: '3PST (3 contact)' },
                    { value: '4PST', label: '4PST (4 contact)' },
                    { value: 'DPDT', label: 'DPDT (4 contact)' },
                    { value: '3PDT', label: '3PDT (6 contact)' },
                    { value: '4PDT', label: '4PDT (8 contact)' },
                    { value: '6PDT', label: '6PDT (12 contact)'}
                  ]}
                />
                 {errors.configurationFactor && <small className="text-danger">{errors.configurationFactor}</small>}
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Load Type (π<sub>L</sub>):</label>
                <Select
                  styles={customStyles}
                  name="loadType"
                  value={{
                    value: currentComponent.loadType,
                    label: currentComponent.loadType? currentComponent.loadType?.charAt(0)?.toUpperCase() + currentComponent.loadType?.slice(1):"select..."
                  }}
                  onChange={(selectedOption) => {
                    setCurrentComponent(prev => ({
                      ...prev,
                      loadType: selectedOption.value
                    }));
                    setErrors({...errors,loadType:""})
                  }}
                  options={[
                    { value: 'resistive', label: 'Resistive' },
                    { value: 'inductive', label: 'Inductive' },
                    { value: 'lamp', label: 'Lamp' }
                  ]}
                />
                 {errors.loadType && <small className="text-danger">{errors.loadType}</small>}
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              {/* Operating Current */}
              <div className="form-group">
                <label>Operating Current (A):</label>
                <input
                  type="number"
                  name="operatingCurrent"
                  min="0"
                  max={currentComponent.ratedCurrent || 0}
                  step="0.01"
                  value={currentComponent.operatingCurrent || ''}
                  onChange={handleCurrentChange}
                  className="form-control"
                />
              </div>
            </Col>
            <Col md={4}>
              {/* Rated Current */}
              <div className="form-group">
                <label>Rated Current (A):</label>
                <input
                  type="number"
                  name="ratedCurrent"
                  min="0.01"
                  step="0.01"
                  value={currentComponent.ratedCurrent || ''}
                  onChange={handleCurrentChange}
                  className="form-control"
                />
              </div>
            </Col>

            <Col md={4}>
              {/* Stress Ratio */}
              <div className="form-group">
                <label>Calculated Stress Ratio (S):</label>
                <input
                  type="number"
                  readOnly
                  value={currentComponent.stressRatio !== undefined ? currentComponent.stressRatio.toFixed(2) : ''}
                  className="form-control"
                />
              </div>
            </Col>
          </Row>

          {/* Calculation Section */}
          <div className='d-flex justify-content-between align-items-center' >

            <div >
              {result && (

                <div className="system-metrics">

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

                </div>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handleCalculate}
              className="btn-calculate float-end mt-1 "

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
            <>
              <Row className="mb-4">
                <Col>
                  <div className="card">
                    <div className="card-body">

                      <div className="table-responsive">

                        <MaterialTable
                          columns={columns}
                          data={tableData}

                          options={{
                            search: false,
                            paging: component.length > 10,
                            pageSize: 10,
                            pageSizeOptions: [10, 20, 50],
                            toolbar: false,
                            headerStyle: {
                              backgroundColor: '#CCE6FF',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              padding: '12px 16px'
                            },
                            rowStyle: {
                              backgroundColor: '#FFF',
                              '&:hover': {
                                backgroundColor: '#f5f5f5'
                              }
                            },
                            cellStyle: {
                              padding: '8px 16px'
                            },
                            actionsColumnIndex: -1
                          }}
                          components={{
                            Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 8 }} />
                          }}
                        />
                      </div>
                      <div className="formula-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
                        <Typography variant="h6" gutterBottom>
                          Calculation Formulas
                        </Typography>
                        {currentComponent.type === "Switches" && (
                          <>
                            <Typography variant="body1" paragraph>
                              λ<sub>p</sub> = λ<sub>b</sub> × π<sub>L</sub> × π<sub>C</sub> × π<sub>Q</sub> × π<sub>E</sub>
                            </Typography>
                            <Typography variant="body1" paragraph>Where:</Typography>
                            <ul>
                              <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                              <li>λ<sub>b</sub> = Base failure rate (from switch type)</li>
                              <li>π<sub>L</sub> = Load stress factor (depends on load type and stress ratio)</li>
                              <li>π<sub>C</sub> = Contact configuration factor</li>
                              <li>π<sub>Q</sub> = Quality factor</li>
                              <li>π<sub>E</sub> = Environment factor</li>
                            </ul>
                            <Typography variant="body1" paragraph>
                              Load Stress Factor (π<sub>L</sub>) Formulas:
                            </Typography>
                            <ul>
                              <li>Resistive Load: π<sub>L</sub> = e<sup>(S/0.8)<sup>2</sup></sup></li>
                              <li>Inductive Load: π<sub>L</sub> = e<sup>(S/0.4)<sup>2</sup></sup></li>
                              <li>Lamp Load: π<sub>L</sub> = e<sup>(S/0.2)<sup>2</sup></sup></li>
                              <li>S = Stress Ratio (Operating Current / Rated Current)</li>
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </>
      )}

      {currentComponent.type === "Switches,Circuit Breakers" && (
        <>
          <Row className="mb-3">
            <Col md={4}>
              <div className="form-group">
                <label>Use Factor (π<sub>U</sub>):</label>
                <Select
                  styles={customStyles}
                  name="usageFactor"
                  placeholder="Select"
                  value={{
                    value: currentComponent.usageFactor,
                    label:currentComponent.usageFactor? `${currentComponent.usageFactor} (${USAGE_FACTORS[currentComponent.usageFactor]})`:"select..."
                  }}
                  onChange={(selectedOption) => {
                    setCurrentComponent({
                      ...currentComponent,
                      usageFactor: selectedOption.value
                    });
                    setErrors({...errors,usageFactor:""})
                  }}
                  options={[
                    { value: 'power', label: 'Power' },
                    { value: 'not-power', label: 'Not Power' }
                  ]}
                />
               {errors.usageFactor && <small className="text-danger">{errors.usageFactor}</small>}
              </div>
            </Col>
            <Col md={4}>
              <div className="form-group">
                <label>Quality Factor (π<sub>Q</sub>):</label>
                <Select
                  styles={customStyles}
                  name="quality"
                  value={{
                    value: currentComponent.quality,
                    label: currentComponent.quality? `${currentComponent.quality} (${QUALITY_FACTORS1[currentComponent.quality]})`:"select..."
                  }}
                  onChange={(selectedOption) => {
                    setCurrentComponent({
                      ...currentComponent,
                      quality: selectedOption.value
                    });
                    setErrors({...errors,quality:""})
                  }}
                  options={[
                    { value: 'MIL-SPEC', label: 'MIL-SPEC (1.0)' },
                    { value: 'Lower', label: 'Lower (8.4)' }
                  ]}
                />
                   {errors.quality && <small className="text-danger">{errors.quality}</small>}
              </div>
            </Col>
            <Col md={4}>
              <div className="form-group">
                <label>Contact Configuration (π<sub>C</sub>):</label>
                <Select
                  styles={customStyles}
                  name="configurationFactor"
                  value={{
                    value: currentComponent.configurationFactor,
                    label: currentComponent.configurationFactor?`${currentComponent.configurationFactor} (${CONTACT_FORM_FACTORS1[currentComponent.configurationFactor]})`:"select..."
                  }}
                  onChange={(selectedOption) => {
                    setCurrentComponent({
                      ...currentComponent,
                      configurationFactor: selectedOption.value
                    });
                    setErrors({...errors,configurationFactor:""})
                  }}
                  options={[
                    { value: 'SPST', label: 'SPST' },
                    { value: 'DPST', label: 'DPST' },
                    { value: '3PST', label: '3PST' },
                    { value: '4PST', label: '4PST' }
                  ]}
                />
                 {errors.configurationFactor && <small className="text-danger">{errors.configurationFactor}</small>}
              </div>
            </Col>
          </Row>
          <div>
            <Button
              variant="primary"
              onClick={handleCalculate1}
              className="btn-calculate float-end mt-1"
            >
              Calculate Failure Rate
            </Button>
            {console.log("value..", handleCalculate)}
            {result && (
              <>
                <Box
                  component="div"
                  onClick={() => setShowResults(!showResults)}
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
                    {showResults ? 'Hide Calculations' : 'Show Calculations'}
                  </Typography>
                </Box>
              </>
            )}
          </div>
          <br />
          <br />
          {result && (
            <Row>
              <Col>
                <h2 className="text-center">Calculation Result</h2>
                <p><strong>Predicted Failure Rate (λ<sub>p</sub>):</strong> {result.value} failures/10<sup>6</sup> hours</p>
                {showResults && calculation.length > 0 && (
                  <Row className="mb-4">
                    <Col>
                      <div className="card">
                        <div className="card-body">

                          {/* // In your component's render method */}
                          <MaterialTable
                            columns={componentColumns}
                            data={[{
                              λ_b: BASE_FAILURE_RATES1[currentComponent.failureType.value],
                              π_C: CONTACT_FORM_FACTORS1[currentComponent.configurationFactor],
                              π_Q: QUALITY_FACTORS1[currentComponent.quality],
                              π_E: ENVIRONMENT_FACTORS[currentComponent.environment],
                              π_U: USAGE_FACTORS[currentComponent.usageFactor],
                              λ_p: calculateFailureRate1() // This should match the value shown in results
                            }]}
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
                              Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 8 }} />
                            }}

                          />

                          <div className="formula-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
                            <Typography variant="h6" gutterBottom>
                              Calculation Formulas
                            </Typography>
                            {currentComponent.type === "Switches,Circuit Breakers" && (
                              <>
                                <Typography variant="body1" paragraph>
                                  λ<sub>p</sub> = λ<sub>b</sub> × π<sub>U</sub> × π<sub>C</sub> × π<sub>Q</sub> × π<sub>E</sub>
                                </Typography>
                                <Typography variant="body1" paragraph>Where:</Typography>
                                <ul>
                                  <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                                  <li>λ<sub>b</sub> = Base failure rate (0.34 for all circuit breaker types)</li>
                                  <li>π<sub>U</sub> = Usage factor (2.5 for power switches, 1.0 otherwise)</li>
                                  <li>π<sub>C</sub> = Contact configuration factor</li>
                                  <li>π<sub>Q</sub> = Quality factor (1.0 for MIL-SPEC, 8.4 for lower quality)</li>
                                  <li>π<sub>E</sub> = Environment factor</li>
                                </ul>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}

              </Col>
            </Row>

          )}

        </>
      )}
    </div>
  );
};
export default Switches;