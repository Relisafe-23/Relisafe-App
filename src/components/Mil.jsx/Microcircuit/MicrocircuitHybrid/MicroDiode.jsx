
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Row, Col, Alert } from 'react-bootstrap';

// Import all diode type components
import LowFrequencyDiode from './diodeTypes/LowFrequencyDiode.jsx';
import HighFrequencyDiode from './diodeTypes/HighFrequencyDiode.jsx';
import LowFreqBipolar from './diodeTypes/LowFreqBipolar.jsx';
import LowFreqFET from './diodeTypes/LowFreqFET.jsx';
import TransistorsUnijunction from './diodeTypes/TransistorsUnijunction.jsx';
import TransistorsLowNoiseHighFreqBipolar from './diodeTypes/TransistorsLowNoiseHighFreqBipolar.jsx';
import TransistorsHighPowerHighFrequencyBipolar from './diodeTypes/TransistorsHighPowerHighFrequencyBipolar.jsx';
import TransistorsHighFrequencyGaAsFET from './diodeTypes/TransistorsHighFrequencyGaAsFET.jsx';
import TransistorsHighFrequencySIFET from './diodeTypes/TransistorsHighFrequencySIFET.jsx';
import ThyristorsAndSCRS from './diodeTypes/ThyristorsAndSCRS.jsx';
import Optoelectronics from './diodeTypes/Optoelectronics.jsx';
import AlphanumericDisplays from './diodeTypes/AlphanumericDisplays.jsx';
import LaserDiode from './diodeTypes/LaserDiode.jsx';

// Shared constants
import { qualityFactors, environmentFactors } from './diodeTypes/diodeConstants.jsx';

const MicroDiode = ({ diodeFailureRateChange }) => {
  const componentTypes = [
    { value: '6.1 Diodes, Low Frequency', label: '6.1 Diodes, Low Frequency' },
    { value: '6.2 Diodes, High Frequency (Microwave, RF)', label: '6.2 Diodes, High Frequency (Microwave, RF)' },
    { value: '6.3 Transistors, Low Frequency, Bipolar', label: '6.3 Transistors, Low Frequency, Bipolar' },
    { value: '6.4 Transistors, Low Frequency, SI FET', label: '6.4 Transistors, Low Frequency, SI FET' },
    { value: '6.5 Transistors,Unijunction', label: '6.5 Transistors,Unijunction' },
    { value: '6.6 Transistors, Low Noise, High Frequency, Bipolar', label: '6.6 Transistors, Low Noise, High Frequency, Bipolar' },
    { value: '6.7 Transistors,High Power,High Frequency,Bipolar', label: '6.7 Transistors,High Power,High Frequency,Bipolar' },
    { value: '6.8 Transistors, High Frequency, GaAs FET', label: '6.8 Transistors, High Frequency, GaAs FET' },
    { value: '6.9 Transistors, High Frequency, SI FET', label: '6.9 Transistors, High Frequency, SI FET' },
    { value: '6.10 Thyristors and SCRS', label: '6.10 Thyristors and SCRS' },
    { value: '6.11 Optoelectronics (Detectors, Isolators, Emitters)', label: '6.11 Optoelectronics (Detectors, Isolators, Emitters)' },
    { value: '6.12 Alphanumeric Displays', label: '6.12 Alphanumeric Displays' },
    { value: '6.13 Optoelectronics, Laser Diode', label: '6.13 Optoelectronics, Laser Diode' }
  ];

  const [components, setComponents] = useState([
    {
      id: Date.now(),
      componentType: '',
      formData: {
        diodeType: 'General Purpose Analog Switching',
        junctionTemp: 25,
        environment: 'GB',
        quality: 'MIL-SPEC',
        voltageStress: '',
        voltageApplied: '',
        voltageRated: '',
        contactConstruction: 'Metallurgically Bonded',
        numJunctions: 1
      },
      failureRate: 0
    }
  ]);

  const addComponent = () => {
    const newComponent = {
      id: Date.now(),
      componentType: '',
      formData: {
        diodeType: 'General Purpose Analog Switching',
        junctionTemp: 25,
        environment: 'GB',
        quality: 'MIL-SPEC',
        voltageStress: '',
        voltageApplied: '',
        voltageRated: '',
        contactConstruction: 'Metallurgically Bonded',
        numJunctions: 1
      },
      failureRate: 0
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (id) => {
    if (components.length > 1) {
      setComponents(components.filter(component => component.id !== id));
    }
  };

  const handleComponentTypeChange = (id, value) => {
    setComponents(components.map(component =>
      component.id === id ? { ...component, componentType: value, failureRate: 0 } : component
    ));
  };

  const handleInputChange = (id, e) => {
    const { name, value } = e.target;
    setComponents(components.map(component =>
      component.id === id 
        ? { ...component, formData: { ...component.formData, [name]: value } } 
        : component
    ));
  };

  const handleFailureRateUpdate = (id, failureRate) => {
    setComponents(components.map(component =>
      component.id === id ? { ...component, failureRate } : component
    ));
  };

  // Calculate total failure rate whenever components change
  const totalFailureRate = components.reduce((sum, component) => {
    return sum + (component.failureRate || 0);
  }, 0);
  if (diodeFailureRateChange) {
      diodeFailureRateChange(totalFailureRate);
    }
  // Notify parent component of total failure rate changes
  useEffect(() => {
    if (diodeFailureRateChange) {
      diodeFailureRateChange(totalFailureRate);
    }
  }, [totalFailureRate, diodeFailureRateChange]);

  const renderComponent = (component) => {
    const commonProps = {
      formData: component.formData,
      onInputChange: (e) => handleInputChange(component.id, e),
      onCalculate: (failureRate) => handleFailureRateUpdate(component.id, failureRate),
      qualityFactors,
      environmentFactors
    };

    switch (component.componentType) {
      case '6.1 Diodes, Low Frequency': 
        return <LowFrequencyDiode {...commonProps} />;
      case '6.2 Diodes, High Frequency (Microwave, RF)': 
        return <HighFrequencyDiode {...commonProps} />;
      case '6.3 Transistors, Low Frequency, Bipolar': 
        return <LowFreqBipolar {...commonProps} />;
      case '6.4 Transistors, Low Frequency, SI FET': 
        return <LowFreqFET {...commonProps} />;
      case '6.5 Transistors,Unijunction': 
        return <TransistorsUnijunction {...commonProps} />;
      case '6.6 Transistors, Low Noise, High Frequency, Bipolar': 
        return <TransistorsLowNoiseHighFreqBipolar {...commonProps} />;
      case '6.7 Transistors,High Power,High Frequency,Bipolar': 
        return <TransistorsHighPowerHighFrequencyBipolar {...commonProps} />;
      case '6.8 Transistors, High Frequency, GaAs FET': 
        return <TransistorsHighFrequencyGaAsFET {...commonProps} />;
      case '6.9 Transistors, High Frequency, SI FET': 
        return <TransistorsHighFrequencySIFET {...commonProps} />;
      case '6.10 Thyristors and SCRS': 
        return <ThyristorsAndSCRS {...commonProps} />;
      case '6.11 Optoelectronics (Detectors, Isolators, Emitters)': 
        return <Optoelectronics {...commonProps} />;
      case '6.12 Alphanumeric Displays': 
        return <AlphanumericDisplays {...commonProps} />;
      case '6.13 Optoelectronics, Laser Diode': 
        return <LaserDiode {...commonProps} />;
      default: 
        return <div className="text-center mt-4">Please select a component type</div>;
    }
  };

  const getMainHeading = () => {
    if (components.length === 1 && components[0].componentType) {
      return components[0].componentType.replace(/,/g, ' ').trim();
    }
    return 'Discrete Semiconductor Reliability Calculator';
  };
const getComponentHeading = (componentType) => {
  if (!componentType) return 'Discrete Semiconductor Component';
  return componentType.replace(/,/g, ' ').trim();
};
  return (
    <Container>
      <div className="container mt-4 background">
        <h2 className="text-center">Discrete Semiconductor</h2>
        {/* <h2 className='text-center' style={{ fontSize: '1.0rem' }}>{getMainHeading()}</h2> */}
        
        {components.map((component, index) => (
          <div key={component.id} className="mb-4 p-3 border rounded">
            <Row className="align-items-center mb-3">
              <Col>
                <h4>Component {index + 1}</h4>
                 
           <h2 className='text-center' style={{ fontSize: '1.2rem' }}>  {getComponentHeading(component.componentType)}</h2>
            </Col>
            
          
            </Row>
            
            <div className="form-group">
              <label>Part Type</label>
              <select
                name="componentType"
                className="form-control"
                value={component.componentType}
                onChange={(e) => handleComponentTypeChange(component.id, e.target.value)}
              >
                <option value="">Select a component type</option>
                {componentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
              <br/>
              <br/>
            {renderComponent(component)}
                {components.length > 1 && (
                <Col xs="auto">
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => removeComponent(component.id)}
                    style={{ backgroundColor: "red" }}
                  >
                    Remove Component
                  </Button>
                </Col>
              )}
            
            {/* {component.failureRate > 0 && (
              <div className="prediction-result mt-3">
                <strong>Predicted Failure Rate:</strong>
                <span className="ms-2">{component.failureRate.toFixed(6)} failures/10<sup>6</sup> hours</span>
              </div>
            )} */}
          </div>
        ))}
        
        {components.some(c => c.failureRate > 0) && (
          <div className="total-failure-rate mt-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
            <h5>
              <strong>
               Discrete Semiconductor (λ<sub>c</sub> * N<sub>c</sub>): {totalFailureRate?.toFixed(6)} failures/10<sup>6</sup> hours
              </strong>
            </h5>
          </div>
        )}
        
        <Button variant="primary" onClick={addComponent} className="mt-3">
          Add Component
        </Button>
      </div>
    </Container>
  );
};

export default MicroDiode;