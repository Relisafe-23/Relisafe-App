import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MaterialTable from 'material-table';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { CalculatorIcon } from '@heroicons/react/24/outline';

const Relay = ({ onCalculate }) => {
  // Relay types
  const relayTypes = [
    { value: 'electromechanical', label: 'Relay, Mechanical' },
    { value: 'solid_state', label: 'Relay, Solid State' },
    { value: 'time_delay', label: 'Relay, Solid State Time Delay' },
    { value: 'hybrid', label: 'Relay, Hybrid' }
  ];

  // Complete base failure rates for electromechanical relays
  const baseFailureRates = {
    electromechanical: [
      { temp: 25, rate85: 0.0059, rate125: 0.0059 },
      { temp: 30, rate85: 0.0067, rate125: 0.0066 },
      { temp: 35, rate85: 0.0075, rate125: 0.0073 },
      { temp: 40, rate85: 0.0084, rate125: 0.0081 },
      { temp: 45, rate85: 0.0094, rate125: 0.0089 },
      { temp: 50, rate85: 0.010, rate125: 0.0098 },
      { temp: 55, rate85: 0.012, rate125: 0.011 },
      { temp: 60, rate85: 0.013, rate125: 0.012 },
      { temp: 65, rate85: 0.014, rate125: 0.013 },
      { temp: 70, rate85: 0.016, rate125: 0.014 },
      { temp: 75, rate85: 0.017, rate125: 0.015 },
      { temp: 80, rate85: 0.019, rate125: 0.017 },
      { temp: 85, rate85: 0.021, rate125: 0.018 },
      { temp: 90, rate85: null, rate125: 0.019 },
      { temp: 95, rate85: null, rate125: 0.021 },
      { temp: 100, rate85: null, rate125: 0.022 },
      { temp: 105, rate85: null, rate125: 0.024 },
      { temp: 110, rate85: null, rate125: 0.026 },
      { temp: 115, rate85: null, rate125: 0.027 },
      { temp: 120, rate85: null, rate125: 0.029 },
      { temp: 125, rate85: null, rate125: 0.031 }
    ],
    solid_state: [
      { type: 'solid state', rate: 0.029 }
    ],
    time_delay: [
      { type: 'solid state Time Delay', rate: 0.029 }
    ],
    hybrid: [
      { type: 'Hybrid', rate: 0.029 }
    ]
  };

  // Complete contact form factors (πC)
  const contactFormFactors = [
    { form: 'SPST', factor: 1.00 },
    { form: 'DPST', factor: 1.50 },
    { form: 'SPDT', factor: 1.75 },
    { form: '3PST', factor: 2.00 },
    { form: '4PST', factor: 2.50 },
    { form: 'DPDT', factor: 3.00 },
    { form: '3PDT', factor: 4.25 },
    { form: '4PDT', factor: 5.50 },
    { form: '6PDT', factor: 8.00 }
  ];

  // Complete load stress factors (πL)
  const loadStressFactors = {
    resistive: [
      { load: 0.05, factor: 1.00 },
      { load: 0.10, factor: 1.02 },
      { load: 0.20, factor: 1.06 },
      { load: 0.30, factor: 1.15 },
      { load: 0.40, factor: 1.28 },
      { load: 0.50, factor: 1.48 },
      { load: 0.60, factor: 1.76 },
      { load: 0.70, factor: 2.15 },
      { load: 0.80, factor: 2.72 },
      { load: 0.90, factor: 3.55 },
      { load: 1.00, factor: 4.77 }
    ],
    indirect: [
      { load: 0.05, factor: 1.02 },
      { load: 0.10, factor: 1.06 },
      { load: 0.20, factor: 1.28 },
      { load: 0.30, factor: 1.76 },
      { load: 0.40, factor: 2.72 },
      { load: 0.50, factor: 4.77 },
      { load: 0.60, factor: 9.49 },
      { load: 0.70, factor: 21.4 }
    ],
    lamp: [
      { load: 0.05, factor: 1.06 },
      { load: 0.10, factor: 1.28 },
      { load: 0.20, factor: 2.72 },
      { load: 0.30, factor: 9.49 },
      { load: 0.40, factor: 54.6 }
    ]
  };

  // Complete quality factors (πQ)
  const qualityFactors = [
    { quality: 'R', factor: 0.10 },
    { quality: 'P', factor: 0.30 },
    { quality: 'X', factor: 0.45 },
    { quality: 'U', factor: 0.60 },
    { quality: 'M', factor: 1.0 },
    { quality: 'L', factor: 1.5 },
    { quality: 'MIL-SPEC', factor: 1.5 },
    { quality: 'Commercial', factor: 2.9 }
  ];

  const qualityFactors2 = [
    { quality: 'MIL-SPEC', factor: 1.0 },
    { quality: 'Commercial', factor: 1.9 }
  ];

  // Complete environment factors (πE)
  const environmentFactors = [
    { env: 'GB', factor: 1.0, description: 'Ground, Benign' },
    { env: 'GF', factor: 2.0, description: 'Ground, Fixed' },
    { env: 'GM', factor: 15, description: 'Ground, Mobile' },
    { env: 'NS', factor: 8.0, description: 'Naval, Sheltered' },
    { env: 'NU', factor: 27, description: 'Naval, Unsheltered' },
    { env: 'AIC', factor: 7.0, description: 'Airborne, Inhabited, Cargo' },
    { env: 'AIF', factor: 9.0, description: 'Airborne, Inhabited, Fighter' },
    { env: 'AUC', factor: 11, description: 'Airborne, Uninhabited, Cargo' },
    { env: 'AUF', factor: 12, description: 'Airborne, Uninhabited, Fighter' },
    { env: 'ARW', factor: 46, description: 'Airborne, Rotary Wing' },
    { env: 'SF', factor: 0.50, description: 'Space, Flight' },
    { env: 'MF', factor: 25, description: 'Missile, Flight' },
    { env: 'ML', factor: 66, description: 'Missile, Launch' }
  ];

  // Application and Construction Factors (πF)
  const applicationConstructionFactors = {
    signalCurrentDry: {
      label: "Signal Current (Low mv and ma), Dry Circuit",
      constructions: [
        { type: "Armature (Long)", factor: 4 },
        { type: "Dry Reed", factor: 6 },
        { type: "Mercury Wetted", factor: 1 },
        { type: "Magnetic Latching", factor: 4 },
        { type: "Balanced Armature", factor: 7 },
        { type: "Solenoid", factor: 7 }
      ]
    },
    generalPurpose: {
      label: "General Purpose (0-5 Amp)",
      constructions: [
        { type: "Armature (Long)", factor: 3 },
        { type: "Balanced Armature", factor: 5 },
        { type: "Solenoid", factor: 6 }
      ]
    },
    sensitive: {
      label: "Sensitive (0-100 mw)",
      constructions: [
        { type: "Armature (Long and Short)", factor: 5 },
        { type: "Mercury Wetted", factor: 2 },
        { type: "Magnetic Latching", factor: 6 },
        { type: "Metal Movement", factor: 100 },
        { type: "Balanced Armature", factor: 10 }
      ]
    },
    polarized: {
      label: "Polarized",
      constructions: [
        { type: "Armature (Short)", factor: 10 },
        { type: "Meter Movement", factor: 100 }
      ]
    },
    vibratingReed: {
      label: "Vibrating Reed",
      constructions: [
        { type: "Dry Reed", factor: 6 },
        { type: "Mercury Wetted", factor: 1 }
      ]
    },
    highSpeed: {
      label: "High Speed",
      constructions: [
        { type: "Armature (Balanced and Short)", factor: 25 },
        { type: "Dry Reed", factor: 6 }
      ]
    },
    thermalTimeDelay: {
      label: "Thermal Time Delay",
      constructions: [
        { type: "Bimetal", factor: 10 }
      ]
    },
    electronicTimeDelay: {
      label: "Electronic Time Delay, Non-Thermal",
      constructions: [
        { type: "N/A", factor: 9 }
      ]
    },
    latchingMagnetic: {
      label: "Latching, Magnetic",
      constructions: [
        { type: "Dry Reed", factor: 10 },
        { type: "Mercury Wetted", factor: 5 },
        { type: "Balanced Armature", factor: 5 }
      ]
    },
    highVoltage: {
      label: "High Voltage (5-20 Amp)",
      constructions: [
        { type: "Vacuum (Glass)", factor: 20 },
        { type: "Vacuum (Ceramic)", factor: 5 }
      ]
    },
    mediumPower: {
      label: "Medium Power",
      constructions: [
        { type: "Armature (Long and Short)", factor: 3 },
        { type: "Mercury Wetted", factor: 1 },
        { type: "Magnetic Latching", factor: 2 },
        { type: "Mechanical Latching", factor: 3 },
        { type: "Balanced Armature", factor: 2 },
        { type: "Solenoid", factor: 2 }
      ]
    },
    contactorsHighCurrent: {
      label: "Contactors (High Current) (25-600 Amp)",
      constructions: [
        { type: "Armature (Short)", factor: 7 },
        { type: "Mechanical Latching", factor: 12 },
        { type: "Balanced Armature", factor: 10 },
        { type: "Solenoid", factor: 5 }
      ]
    }
  };

  // Application types for dropdown
  const applicationTypes = Object.keys(applicationConstructionFactors).map(key => ({
    value: key,
    label: applicationConstructionFactors[key].label
  }));

  // Solid state environment factors
  const solidStateEnvFactors = [
    { env: 'GB', factor: 1.0 },
    { env: 'GF', factor: 3.0 },
    { env: 'GM', factor: 12 },
    { env: 'NS', factor: 6.0 },
    { env: 'NU', factor: 17 },
    { env: 'AIC', factor: 12 },
    { env: 'AIF', factor: 19 },
    { env: 'AUC', factor: 21 },
    { env: 'AUF', factor: 32 },
    { env: 'ARW', factor: 23 },
    { env: 'SF', factor: 0.40 },
    { env: 'MF', factor: 12 },
    { env: 'ML', factor: 33 },
    { env: 'CL', factor: 590 }
  ];

  // State
  const [currentComponent, setCurrentComponent] = useState({
    type: "electromechanical",
    ambientTemp: 25,
    ratedTemp: 85,
    contactForm: "SPST",
    loadType: "resistive",
    loadPercentage: 0.05,
    cycleRate: 1,
    quality: "M",
    environment: "GB",
    applicationType: "signalCurrentDry",
    constructionType: "Armature (Long)",
    baseRateType: "solid state"
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedRelayType, setSelectedRelayType] = useState(null);
  const [selectedRatedTemp, setSelectedRatedTemp] = useState(null);
  const [selectedLoadType, setSelectedLoadType] = useState(null);
  const [selectedContactForm, setSelectedContactForm] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [selectedApplicationType, setSelectedApplicationType] = useState(null);
  const [selectedConstructionType, setSelectedConstructionType] = useState(null);
  const [selectedBaseRateType, setSelectedBaseRateType] = useState(null);

  const [errors, setErrors] = useState({
    environment: "",
    relayType: "",
    ratedTemp: "",
    loadType: "",
    contactForm: "",
    quality: "",
    applicationType: "",
    constructionType: "",
    baseRateType: ""
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

    if (!selectedRelayType) {
      newErrors.relayType = "Select the Relay Type";
      isValid = false;
    }

    if (!selectedEnvironment) {
      newErrors.environment = "Select the Environment Factor";
      isValid = false;
    }

    if (currentComponent.type === 'electromechanical') {
      if (!selectedRatedTemp) {
        newErrors.ratedTemp = "Select the Rated Temperature";
        isValid = false;
      }
      if (!selectedLoadType) {
        newErrors.loadType = "Select the Load Type";
        isValid = false;
      }
      if (!selectedContactForm) {
        newErrors.contactForm = "Select the Contact Form";
        isValid = false;
      }
      if (!selectedQuality) {
        newErrors.quality = "Select the Quality Factor";
        isValid = false;
      }
      if (!selectedApplicationType) {
        newErrors.applicationType = "Select the Application Type";
        isValid = false;
      }
      if (!selectedConstructionType) {
        newErrors.constructionType = "Select the Construction Type";
        isValid = false;
      }
    } else {
      if (!selectedBaseRateType) {
        newErrors.baseRateType = "Select the Base Rate Type";
        isValid = false;
      }
      if (!selectedQuality) {
        newErrors.quality = "Select the Quality Factor";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }

  // Calculate failure rate for electromechanical relays
  const calculateElectromechanicalFailureRate = () => {
    if (!validateForm()) {
      return;
    }
    // Find base failure rate based on temperature
    const tempData = baseFailureRates?.electromechanical?.find(item => item.temp === currentComponent.ambientTemp);
    const λb = currentComponent.ratedTemp === 85 ? tempData.rate85 : tempData.rate125;

    // Get πC factor
    const πC = contactFormFactors?.find(c => c.form === currentComponent.contactForm)?.factor;
    const πL = loadStressFactors[currentComponent.loadType].find(l => l.load === currentComponent.loadPercentage)?.factor;
    
    // Get πCYC factor
    let πCYC;
    if (currentComponent.quality === 'M' || currentComponent.quality === 'L' || currentComponent.quality === 'MIL-SPEC') {
      // MIL-SPEC cycling factor
      πCYC = currentComponent.cycleRate >= 1.0 ? 10 : 0.1;
    } else {
      // Commercial cycling factor
      if (currentComponent.cycleRate > 1000) πCYC = 10;
      else if (currentComponent.cycleRate >= 10) πCYC = 5;
      else πCYC = 1;
    }

    // Get πQ factor
    const πQ = qualityFactors?.find(q => q.quality === currentComponent.quality)?.factor;
     
    // Get πE factor
    const πE = environmentFactors?.find(e => e.env === currentComponent.environment)?.factor;

    // Get πF factor
    const currentApp = applicationConstructionFactors[currentComponent.applicationType];
    const construction = currentApp?.constructions?.find(c => c.type === currentComponent.constructionType);
    const πF = construction ? construction?.factor : 1;
    
    // Calculate predicted failure rate
    const λp = λb * πL * πC * πCYC * πQ * πE * πF;
    if (onCalculate) {
      onCalculate(λp);
    }
    return {
      λb,
      πL,
      πC,
      πCYC,
      πQ,
      πE,
      πF,
      λp
    };
  };

  // Calculate failure rate for solid state relays
  const calculateSolidStateFailureRate = () => {
    if (!validateForm()) {
      return;
    }
    const selectedRate = baseFailureRates[currentComponent.type].find(r => r.type === currentComponent.baseRateType)?.rate || 0.029;
    const λb = selectedRate;
    const FQ = currentComponent.quality === 'MIL-SPEC' ? 1.0 : 1.9;
    const FE = solidStateEnvFactors?.find(e => e.env === currentComponent.environment)?.factor || 1.0;

    const λp = λb * FQ * FE;
    if (onCalculate) {
      onCalculate(λp);
    }
    return {
      λb,
      FQ,
      FE,
      λp
    };
  };

  // Handle form submission
  const handleCalculate = (e) => {
    e.preventDefault();
  
    try {
      let result;
      if (currentComponent.type === 'electromechanical') {
        result = calculateElectromechanicalFailureRate();
      } else {
        result = calculateSolidStateFailureRate();
      }
      
      if (result) {
        setResult(result);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <>
      <h2 className="text-center mb-4">Relay</h2>
      <Row>
        <Col md={4}>
          <div className="form-group">
            <label>Relay Type:</label>
            <Select
              styles={customStyles}
              value={selectedRelayType}
              isInvalid={!!errors.relayType}
              className={errors.relayType ? 'is-invalid' : ''}
              onChange={(selectedOption) => {
                setSelectedRelayType(selectedOption);
                setCurrentComponent(prev => ({
                  ...prev,
                  type: selectedOption.value
                }));
                setErrors({...errors, relayType: ""});
              }}
              options={relayTypes}
            />
            {errors.relayType && <small className="text-danger">{errors.relayType}</small>}
          </div>
        </Col>

        {/* Common inputs */}
        <Col md={4}>
          <div className="form-group">
            <label>Environment (π<sub>E</sub>):</label>
            <Select
              styles={customStyles}
              value={selectedEnvironment}
              isInvalid={!!errors.environment}
              className={errors.environment ? 'is-invalid' : ''}
              onChange={(selectedOption) => {
                setSelectedEnvironment(selectedOption);
                setCurrentComponent(prev => ({
                  ...prev,
                  environment: selectedOption.env
                }));
                setErrors({...errors, environment: ""});
              }}
              options={
                currentComponent.type === 'electromechanical' ? 
                environmentFactors : 
                solidStateEnvFactors
              }
              getOptionLabel={option => `${option.env} (πE = ${option?.factor})`}
              getOptionValue={option => option.env}
            />
            {errors.environment && <small className="text-danger">{errors.environment}</small>}
          </div>
        </Col>

        {/* Electromechanical-specific inputs */}
        {currentComponent.type === 'electromechanical' && (
          <>
            <Col md={4}>
              <div className="form-group">
                <label>Ambient Temperature (°C) λ<sub>b</sub>:</label>
                <input
                  type="number"
                  className="form-control"
                  value={currentComponent.ambientTemp}
                  onChange={(e) => setCurrentComponent(prev => ({
                    ...prev,
                    ambientTemp: parseInt(e.target.value)
                  }))}
                  min="25"
                  max="125"
                  step="1"
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Rated Temperature λ<sub>b</sub>:</label>
                <Select
                  styles={customStyles}
                  value={selectedRatedTemp}
                  isInvalid={!!errors.ratedTemp}
                  className={errors.ratedTemp ? 'is-invalid' : ''}
                  onChange={(selectedOption) => {
                    setSelectedRatedTemp(selectedOption);
                    setCurrentComponent(prev => ({
                      ...prev,
                      ratedTemp: selectedOption.value
                    }));
                    setErrors({...errors, ratedTemp: ""});
                  }}
                  options={[
                    { value: 85, label: '85°C' },
                    { value: 125, label: '125°C' }
                  ]}
                />
                {errors.ratedTemp && <small className="text-danger">{errors.ratedTemp}</small>}
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Load Type π<sub>L</sub>:</label>
                <Select
                  styles={customStyles}
                  value={selectedLoadType}
                  isInvalid={!!errors.loadType}
                  className={errors.loadType ? 'is-invalid' : ''}
                  onChange={(selectedOption) => {
                    setSelectedLoadType(selectedOption);
                    setCurrentComponent(prev => ({
                      ...prev,
                      loadType: selectedOption.value,
                      loadPercentage: 0.05 // Reset to minimum when changing load type
                    }));
                    setErrors({...errors, loadType: ""});
                  }}
                  options={[
                    { value: 'resistive', label: 'Resistive' },
                    { value: 'indirect', label: 'Indirect' },
                    { value: 'lamp', label: 'Lamp' }
                  ]}
                />
                {errors.loadType && <small className="text-danger">{errors.loadType}</small>}
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Load Percentage (% of Rating) π<sub>L</sub>:</label>
                <input
                  type="number"
                  className="form-control"
                  value={currentComponent.loadPercentage}
                  onChange={(e) => setCurrentComponent(prev => ({
                    ...prev,
                    loadPercentage: parseFloat(e.target.value)
                  }))}
                  min="0.05"
                  max={currentComponent.loadType === 'lamp' ? 0.40 : 1.00}
                  step="0.05"
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Contact Form π<sub>C</sub>:</label>
                <Select
                  styles={customStyles}
                  value={selectedContactForm}
                  isInvalid={!!errors.contactForm}
                  className={errors.contactForm ? 'is-invalid' : ''}
                  onChange={(selectedOption) => {
                    setSelectedContactForm(selectedOption);
                    setCurrentComponent(prev => ({
                      ...prev,
                      contactForm: selectedOption.value
                    }));
                    setErrors({...errors, contactForm: ""});
                  }}
                  options={contactFormFactors.map(form => ({
                    value: form.form,
                    label: `${form.form} (πC = ${form?.factor})`
                  }))}
                />
                {errors.contactForm && <small className="text-danger">{errors.contactForm}</small>}
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Cycle Rate (cycles/hour) π<sub>CYC</sub>:</label>
                <input
                  type="number"
                  className="form-control"
                  value={currentComponent.cycleRate}
                  onChange={(e) => setCurrentComponent(prev => ({
                    ...prev,
                    cycleRate: parseInt(e.target.value)
                  }))}
                  min="0"
                  step="1"
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Application Type π<sub>F</sub>:</label>
                <Select
                  styles={customStyles}
                  value={selectedApplicationType}
                  isInvalid={!!errors.applicationType}
                  className={errors.applicationType ? 'is-invalid' : ''}
                  onChange={(selectedOption) => {
                    const firstConstruction = 
                      applicationConstructionFactors[selectedOption.value].constructions[0].type;
                    setSelectedApplicationType(selectedOption);
                    setSelectedConstructionType({
                      value: firstConstruction,
                      label: `${firstConstruction} (πF = ${
                        applicationConstructionFactors[selectedOption.value].constructions[0].factor
                      })`
                    });
                    setCurrentComponent(prev => ({
                      ...prev,
                      applicationType: selectedOption.value,
                      constructionType: firstConstruction
                    }));
                    setErrors({...errors, applicationType: ""});
                  }}
                  options={applicationTypes.map(app => ({
                    value: app.value,
                    label: app.label
                  }))}
                />
                {errors.applicationType && <small className="text-danger">{errors.applicationType}</small>}
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Construction Type π<sub>F</sub>:</label>
                <Select
                  styles={customStyles}
                  value={selectedConstructionType}
                  isInvalid={!!errors.constructionType}
                  className={errors.constructionType ? 'is-invalid' : ''}
                  onChange={(selectedOption) => {
                    setSelectedConstructionType(selectedOption);
                    setCurrentComponent(prev => ({
                      ...prev,
                      constructionType: selectedOption.value
                    }));
                    setErrors({...errors, constructionType: ""});
                  }}
                  options={applicationConstructionFactors[currentComponent.applicationType]
                    .constructions.map(cons => ({
                      value: cons.type,
                      label: `${cons.type} (πF = ${cons?.factor})`
                    }))
                  }
                />
                {errors.constructionType && <small className="text-danger">{errors.constructionType}</small>}
              </div>
            </Col>
          </>
        )}

        {/* Solid state-specific inputs */}
        {['solid_state', 'time_delay', 'hybrid'].includes(currentComponent.type) && (
          <Col md={4}>
            <div className="form-group">
              <label>Base Failure Rate Type (λ<sub>b</sub>):</label>
              <Select
                styles={customStyles}
                value={selectedBaseRateType}
                isInvalid={!!errors.baseRateType}
                className={errors.baseRateType ? 'is-invalid' : ''}
                onChange={(selectedOption) => {
                  setSelectedBaseRateType(selectedOption);
                  setCurrentComponent(prev => ({
                    ...prev,
                    baseRateType: selectedOption.value
                  }));
                  setErrors({...errors, baseRateType: ""});
                }}
                options={baseFailureRates[currentComponent.type].map(rate => ({
                  value: rate.type,
                  label: `${rate.type} (${rate.rate})`
                }))}
              />
              {errors.baseRateType && <small className="text-danger">{errors.baseRateType}</small>}
            </div>
          </Col>
        )}

        {/* Quality factor input */}
        <Col md={4}>
          <div className="form-group">
            <label>Quality π<sub>Q</sub>:</label>
            <Select
              styles={customStyles}
              value={selectedQuality}
              isInvalid={!!errors.quality}
              className={errors.quality ? 'is-invalid' : ''}
              onChange={(selectedOption) => {
                setSelectedQuality(selectedOption);
                setCurrentComponent(prev => ({
                  ...prev,
                  quality: selectedOption.value
                }));
                setErrors({...errors, quality: ""});
              }}
              options={
                currentComponent.type === 'electromechanical' ?
                qualityFactors.map(q => ({
                  value: q.quality,
                  label: `${q.quality} (πQ = ${q?.factor})`
                })) :
                qualityFactors2.map(q => ({
                  value: q.quality,
                  label: `${q.quality} (πQ = ${q?.factor})`
                }))
              }
            />
            {errors.quality && <small className="text-danger">{errors.quality}</small>}
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
              <CalculatorIcon style={{ height: '30px', width: '40px' }} fontSize="large" />
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
          onClick={handleCalculate}
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
            <span className="ms-2">{result?.λp?.toFixed(6)} failures/10<sup>6</sup> hours</span>
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
                      columns={getResultColumns(currentComponent.type)}
                      data={[getResultData(currentComponent.type, result)]}
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
                    {currentComponent.type === 'electromechanical' ? (
                      <>
                        <Typography variant="body1" paragraph>
                          λ<sub>p</sub> = λ<sub>b</sub> × π<sub>L</sub> × π<sub>C</sub> × π<sub>CYC</sub> × π<sub>Q</sub> × π<sub>E</sub> × π<sub>F</sub>
                        </Typography>
                        <Typography variant="body1" paragraph>Where:</Typography>
                        <ul>
                          <li>λ<sub>b</sub> = Base failure rate (from temperature table)</li>
                          <li>π<sub>L</sub> = Load stress factor</li>
                          <li>π<sub>C</sub> = Contact form factor</li>
                          <li>π<sub>CYC</sub> = Cycling factor</li>
                          <li>π<sub>Q</sub> = Quality factor</li>
                          <li>π<sub>E</sub> = Environment factor</li>
                          <li>π<sub>F</sub> = Application and Construction factor</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <Typography variant="body1" paragraph>
                          λ<sub>p</sub> = λ<sub>b</sub> × π<sub>Q</sub> × π<sub>E</sub>
                        </Typography>
                        <Typography variant="body1" paragraph>Where:</Typography>
                        <ul>
                          <li>λ<sub>b</sub> = Base failure rate (0.029 for solid state relays)</li>
                          <li>π<sub>Q</sub> = Quality factor (1.0 for MIL-SPEC, 1.9 for Commercial)</li>
                          <li>π<sub>E</sub> = Environment factor</li>
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
  );
};

// Helper function to get result columns based on relay type
const getResultColumns = (relayType) => {
  switch (relayType) {
    case 'electromechanical':
      return [
        {
          title: <span>λ<sub>b</sub></span>,
          field: 'λb',
          render: rowData => rowData.λb?.toFixed(6) || '-'
        },
        {
          title: <span>π<sub>L</sub></span>,
          field: 'πL',
          render: rowData => rowData.πL?.toFixed(6) || '-'
        },
        {
          title: <span>π<sub>C</sub></span>,
          field: 'πC',
          render: rowData => rowData.πC?.toFixed(6) || '-'
        },
        {
          title: <span>π<sub>CYC</sub></span>,
          field: 'πCYC',
          render: rowData => rowData.πCYC?.toFixed(6) || '-'
        },
        {
          title: <span>π<sub>Q</sub></span>,
          field: 'πQ',
          render: rowData => rowData.πQ?.toFixed(6) || '-'
        },
        {
          title: <span>π<sub>E</sub></span>,
          field: 'πE',
          render: rowData => rowData.πE?.toFixed(6) || '-'
        },
        {
          title: <span>π<sub>F</sub></span>,
          field: 'πF',
          render: rowData => rowData.πF?.toFixed(6) || '-'
        },
        {
          title: "Failure Rate",
          field: 'λp',
          render: rowData => <strong>{rowData.λp?.toFixed(6) || '-'}</strong>
        }
      ];
    default: // For solid state, time delay, and hybrid
      return [
        {
          title: <span>λ<sub>b</sub></span>,
          field: 'λb',
          render: rowData => rowData.λb?.toFixed(6) || '-'
        },
        {
          title: <span>π<sub>Q</sub></span>,
          field: 'FQ',
          render: rowData => rowData.FQ?.toFixed(6) || '-'
        },
        {
          title: <span>π<sub>E</sub></span>,
          field: 'FE',
          render: rowData => rowData.FE?.toFixed(6) || '-'
        },
        {
          title: "Failure Rate (λ<sub>p</sub>)",
          field: 'λp',
          render: rowData => <strong>{rowData.λp?.toFixed(6) || '-'}</strong>
        }
      ];
  }
};

// Helper function to get result data based on relay type
const getResultData = (relayType, result) => {
  switch (relayType) {
    case 'electromechanical':
      return {
        λb: result?.λb,
        πL: result?.πL,
        πC: result?.πC,
        πCYC: result?.πCYC,
        πQ: result?.πQ,
        πE: result?.πE,
        πF: result?.πF,
        λp: result?.λp
      };
    default: // For solid state, time delay, and hybrid
      return {
        λb: result?.λb,
        FQ: result?.FQ,
        FE: result?.FE,
        λp: result?.λp
      };
  }
};

export default Relay;