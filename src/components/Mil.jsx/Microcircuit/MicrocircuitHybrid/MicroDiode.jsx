import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';

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

const MicroDiode = ({ onCalculate }) => {
  const componentTypes = [
    { id: '6.1 Diodes, Low Frequency', name: '6.1 Diodes, Low Frequency'

     },
    { id: 'highFreqDiode', name: '6.2 Diodes, High Frequency (Microwave, RF)' },
    { id: 'lowFreqBipolar', name: '6.3 Transistors, Low Frequency, Bipolar' },
    { id: 'lowFreqFET', name: '6.4 Transistors, Low Frequency, SI FET' },
    { id: 'transistorsUnijunction', name: '6.5 Transistors,Unijunction' },
    { id: 'transistorsLowNoiseHighFreqBipolar', name: '6.6 Transistors, Low Noise, High Frequency, Bipolar' },
    { id: 'transistorsHighPowerHighFrequencyBipolar', name: '6.7 Transistors,High Power,High Frequency,Bipolar' },
    { id: 'transistorsHighFrequencyGaAsFET', name: '6.8 Transistors, High Frequency, GaAs FET' },
    { id: 'transistorsHighFrequencySIFET', name: '6.9 Transistors, High Frequency, SI FET' },
    { id: 'thyristorsAndSCRS', name: '6.10 Thyristors and SCRS' },
    { id: 'optoelectronics', name: '6.11 Optoelectronics (Detectors, Isolators, Emitters)' },
    { id: 'alphanumericDisplays', name: '6.12 Alphanumeric Displays' },
    { id: 'laserDiode', name: '6.13 Optoelectronics, Laser Diode' }
  ];

  const [formData, setFormData] = useState({
     componentType: 'lowFreqDiode',
    // Initialize all fields with defaults
    diodeType: 'General Purpose Analog Switching',
    junctionTemp: 25,
    environment: 'GB', // Ground Benign as default
    quality: 'MIL-SPEC',
    voltageStress: '',
    voltageApplied: '',
    voltageRated: '',
    contactConstruction: 'Metallurgically Bonded',
    numJunctions: 1
  
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCalculate = (data) => {
    if (onCalculate) {
      onCalculate(data);
    }
  };

  const renderComponent = () => {
    const commonProps = {
      formData,
      onInputChange: handleInputChange,
      onCalculate: handleCalculate,
      qualityFactors,
      environmentFactors
    };

    switch (formData.componentType) {
      case '6.1 Diodes, Low Frequency': return <LowFrequencyDiode {...commonProps} />;
      case 'highFreqDiode': return <HighFrequencyDiode {...commonProps} />;
      case 'lowFreqBipolar': return <LowFreqBipolar {...commonProps} />;
      case 'lowFreqFET': return <LowFreqFET {...commonProps} />;
      case 'transistorsUnijunction': return <TransistorsUnijunction {...commonProps} />;
      case 'transistorsLowNoiseHighFreqBipolar': return <TransistorsLowNoiseHighFreqBipolar {...commonProps} />;
      case 'transistorsHighPowerHighFrequencyBipolar': return <TransistorsHighPowerHighFrequencyBipolar {...commonProps} />;
      case 'transistorsHighFrequencyGaAsFET': return <TransistorsHighFrequencyGaAsFET {...commonProps} />;
      case 'transistorsHighFrequencySIFET': return <TransistorsHighFrequencySIFET {...commonProps} />;
      case 'thyristorsAndSCRS': return <ThyristorsAndSCRS {...commonProps} />;
      case 'optoelectronics': return <Optoelectronics {...commonProps} />;
      case 'alphanumericDisplays': return <AlphanumericDisplays {...commonProps} />;
      case 'laserDiode': return <LaserDiode {...commonProps} />;
      default: return <LowFrequencyDiode {...commonProps} />;
    }
  };

  return (
    <Container>
      <div className="container mt-4 background">
        <h2 className="text-center">Discrete Semiconductor</h2>
        
        <div className="form-group">
          <label>Part Type</label>
          <select
            name="componentType"
            className="form-control"
            value={formData.componentType}
            onChange={handleInputChange}
          >
            {componentTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        {renderComponent()}
      </div>
    </Container>
  );
};

export default MicroDiode;