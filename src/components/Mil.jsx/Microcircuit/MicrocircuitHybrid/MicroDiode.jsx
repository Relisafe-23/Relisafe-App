// // import React, { useState } from 'react';
// // import 'bootstrap/dist/css/bootstrap.min.css';
// // import { Container, Button, Row, Col } from 'react-bootstrap';

// // // Import all diode type components
// // import LowFrequencyDiode from './diodeTypes/LowFrequencyDiode.jsx';
// // import HighFrequencyDiode from './diodeTypes/HighFrequencyDiode.jsx';
// // import LowFreqBipolar from './diodeTypes/LowFreqBipolar.jsx';
// // import LowFreqFET from './diodeTypes/LowFreqFET.jsx';
// // import TransistorsUnijunction from './diodeTypes/TransistorsUnijunction.jsx';
// // import TransistorsLowNoiseHighFreqBipolar from './diodeTypes/TransistorsLowNoiseHighFreqBipolar.jsx';
// // import TransistorsHighPowerHighFrequencyBipolar from './diodeTypes/TransistorsHighPowerHighFrequencyBipolar.jsx';
// // import TransistorsHighFrequencyGaAsFET from './diodeTypes/TransistorsHighFrequencyGaAsFET.jsx';
// // import TransistorsHighFrequencySIFET from './diodeTypes/TransistorsHighFrequencySIFET.jsx';
// // import ThyristorsAndSCRS from './diodeTypes/ThyristorsAndSCRS.jsx';
// // import Optoelectronics from './diodeTypes/Optoelectronics.jsx';
// // import AlphanumericDisplays from './diodeTypes/AlphanumericDisplays.jsx';
// // import LaserDiode from './diodeTypes/LaserDiode.jsx';

// // // Shared constants
// // import { qualityFactors, environmentFactors } from './diodeTypes/diodeConstants.jsx';

// // const MicroDiode = ({ onCalculate }) => {
// //   const componentTypes = [
// //     { id: '6.1 Diodes, Low Frequency', name: '6.1 Diodes, Low Frequency' },
// //     { id: '6.2 Diodes, High Frequency (Microwave, RF)', name: '6.2 Diodes, High Frequency (Microwave, RF)' },
// //     { id: '6.3 Transistors, Low Frequency, Bipolar', name: '6.3 Transistors, Low Frequency, Bipolar' },
// //     { id: '6.4 Transistors, Low Frequency, SI FET', name: '6.4 Transistors, Low Frequency, SI FET' },
// //     { id: '6.5 Transistors,Unijunction', name: '6.5 Transistors,Unijunction' },
// //     { id: '6.6 Transistors, Low Noise, High Frequency, Bipolar', name: '6.6 Transistors, Low Noise, High Frequency, Bipolar' },
// //     { id: '6.7 Transistors,High Power,High Frequency,Bipolar', name: '6.7 Transistors,High Power,High Frequency,Bipolar' },
// //     { id: '6.8 Transistors, High Frequency, GaAs FET', name: '6.8 Transistors, High Frequency, GaAs FET' },
// //     { id: '6.9 Transistors, High Frequency, SI FET', name: '6.9 Transistors, High Frequency, SI FET' },
// //     { id: '6.10 Thyristors and SCRS', name: '6.10 Thyristors and SCRS' },
// //     { id: '6.11 Optoelectronics (Detectors, Isolators, Emitters)', name: '6.11 Optoelectronics (Detectors, Isolators, Emitters)' },
// //     { id: '6.12 Alphanumeric Displays', name: '6.12 Alphanumeric Displays' },
// //     { id: '6.13 Optoelectronics, Laser Diode', name: '6.13 Optoelectronics, Laser Diode' }
// //   ];

// //   const [components, setComponents] = useState([
// //     {
// //       id: 1,
// //       componentType: '',
// //       formData: {
// //         diodeType: 'General Purpose Analog Switching',
// //         junctionTemp: 25,
// //         environment: 'GB',
// //         quality: 'MIL-SPEC',
// //         voltageStress: '',
// //         voltageApplied: '',
// //         voltageRated: '',
// //         contactConstruction: 'Metallurgically Bonded',
// //         numJunctions: 1
// //       }
// //     }
// //   ]);

// //   const addComponent = () => {
// //     const newId = components.length > 0 ? Math.max(...components.map(c => c.id)) + 1 : 1;
// //     setComponents([
// //       ...components,
// //       {
// //         id: newId,
// //         componentType: '',
// //         formData: {
// //           diodeType: 'General Purpose Analog Switching',
// //           junctionTemp: 25,
// //           environment: 'GB',
// //           quality: 'MIL-SPEC',
// //           voltageStress: '',
// //           voltageApplied: '',
// //           voltageRated: '',
// //           contactConstruction: 'Metallurgically Bonded',
// //           numJunctions: 1
// //         }
// //       }
// //     ]);
// //   };

// //   const removeComponent = (id) => {
// //     if (components.length > 1) {
// //       setComponents(components.filter(component => component.id !== id));
// //     }
// //   };

// //   const handleComponentTypeChange = (id, value) => {
// //     setComponents(components.map(component =>
// //       component.id === id ? { ...component, componentType: value } : component
// //     ));
// //   };

// //   const handleInputChange = (id, e) => {
// //     const { name, value } = e.target;
// //     setComponents(components.map(component =>
// //       component.id === id 
// //         ? { ...component, formData: { ...component.formData, [name]: value } } 
// //         : component
// //     ));
// //   };

// //   const handleCalculate = (id, data) => {
// //     if (onCalculate) {
// //       onCalculate({ ...data, componentId: id });
// //     }
// //   };

// //   const renderComponent = (component) => {
// //     const commonProps = {
// //       formData: component.formData,
// //       onInputChange: (e) => handleInputChange(component.id, e),
// //       onCalculate: (data) => handleCalculate(component.id, data),
// //       qualityFactors,
// //       environmentFactors
// //     };

// //     switch (component?.componentType) {
// //       case '6.1 Diodes, Low Frequency': return <LowFrequencyDiode {...commonProps} />;
// //       case '6.2 Diodes, High Frequency (Microwave, RF)': return <HighFrequencyDiode {...commonProps} />;
// //       case '6.3 Transistors, Low Frequency, Bipolar': return <LowFreqBipolar {...commonProps} />;
// //       case '6.4 Transistors, Low Frequency, SI FET': return <LowFreqFET {...commonProps} />;
// //       case '6.5 Transistors,Unijunction': return <TransistorsUnijunction {...commonProps} />;
// //       case '6.6 Transistors, Low Noise, High Frequency, Bipolar': return <TransistorsLowNoiseHighFreqBipolar {...commonProps} />;
// //       case '6.7 Transistors,High Power,High Frequency,Bipolar': return <TransistorsHighPowerHighFrequencyBipolar {...commonProps} />;
// //       case '6.8 Transistors, High Frequency, GaAs FET': return <TransistorsHighFrequencyGaAsFET {...commonProps} />;
// //       case '6.9 Transistors, High Frequency, SI FET': return <TransistorsHighFrequencySIFET {...commonProps} />;
// //       case '6.10 Thyristors and SCRS': return <ThyristorsAndSCRS {...commonProps} />;
// //       case '6.11 Optoelectronics (Detectors, Isolators, Emitters)': return <Optoelectronics {...commonProps} />;
// //       case '6.12 Alphanumeric Displays': return <AlphanumericDisplays {...commonProps} />;
// //       case '6.13 Optoelectronics, Laser Diode': return <LaserDiode {...commonProps} />;
// //       default: return <div className="text-center mt-4">Please select a component type</div>;
// //     }
// //   };

// //   const getMainHeading = () => {
// //     if (components.length === 1 && components[0].componentType) {
// //       return components[0].componentType.replace(/,/g, ' ').trim();
// //     }
// //     return 'Microcircuits Reliability Calculator';
// //   };

// //   return (
// //     <Container>
// //       <div className="container mt-4 background">
// //         <h2 className="text-center">Discrete Semiconductor</h2>
// //         <h2 className='text-center' style={{ fontSize: '1.0rem' }}>{getMainHeading()}</h2>
        
// //         {components.map((component, index) => (
// //           <div key={component.id} className="mb-4 p-3 border rounded">
// //             <Row className="align-items-center mb-3">
// //               <Col>
// //                 <h4>Component {index + 1}</h4>
// //               </Col>
            
// //             </Row>
            
// //             <div className="form-group">
// //               <label>Part Type</label>
// //               <select
// //                 name="componentType"
// //                 className="form-control"
// //                 value={component.componentType}
// //                 onChange={(e) => handleComponentTypeChange(component.id, e.target.value)}
// //               >
// //                 <option value="">Select a component type</option>
// //                 {componentTypes.map(type => (
// //                   <option key={type.id} value={type.id}>{type.name}</option>
// //                 ))}
// //               </select>
// //             </div>
              

// //             {renderComponent(component)}
// //              {components.length > 1 && (
// //                 <Col xs="auto">
// //                   <Button 
// //                     variant="danger" 
// //                     className='float-end mb-6'
// //                               style={{ marginBottom:"100px",backgroundColor: "red" }}
// //                     size="sm"
// //                     onClick={() => removeComponent(component.id)}
// //                   >
// //                     Remove
// //                   </Button>
// //                 </Col>
// //               )}
// //           </div>
// //         ))}
      
    
// //         <div className="float-start mt-3">
// //           <Button variant="primary" onClick={addComponent}>
// //             Add Component
// //           </Button>
// //         </div>
// //       </div>
// //     </Container>
// //   );
// // };

// // export default MicroDiode;

// import React, { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Container, Button, Row, Col, Alert } from 'react-bootstrap';

// // Import all diode type components
// import LowFrequencyDiode from './diodeTypes/LowFrequencyDiode.jsx';
// import HighFrequencyDiode from './diodeTypes/HighFrequencyDiode.jsx';
// import LowFreqBipolar from './diodeTypes/LowFreqBipolar.jsx';
// import LowFreqFET from './diodeTypes/LowFreqFET.jsx';
// import TransistorsUnijunction from './diodeTypes/TransistorsUnijunction.jsx';
// import TransistorsLowNoiseHighFreqBipolar from './diodeTypes/TransistorsLowNoiseHighFreqBipolar.jsx';
// import TransistorsHighPowerHighFrequencyBipolar from './diodeTypes/TransistorsHighPowerHighFrequencyBipolar.jsx';
// import TransistorsHighFrequencyGaAsFET from './diodeTypes/TransistorsHighFrequencyGaAsFET.jsx';
// import TransistorsHighFrequencySIFET from './diodeTypes/TransistorsHighFrequencySIFET.jsx';
// import ThyristorsAndSCRS from './diodeTypes/ThyristorsAndSCRS.jsx';
// import Optoelectronics from './diodeTypes/Optoelectronics.jsx';
// import AlphanumericDisplays from './diodeTypes/AlphanumericDisplays.jsx';
// import LaserDiode from './diodeTypes/LaserDiode.jsx';

// // Shared constants
// import { qualityFactors, environmentFactors } from './diodeTypes/diodeConstants.jsx';

// const MicroDiode = ({ onCalculate }) => {
//   const componentTypes = [
//     { id: '6.1 Diodes, Low Frequency', name: '6.1 Diodes, Low Frequency' },
//     { id: '6.2 Diodes, High Frequency (Microwave, RF)', name: '6.2 Diodes, High Frequency (Microwave, RF)' },
//     { id: '6.3 Transistors, Low Frequency, Bipolar', name: '6.3 Transistors, Low Frequency, Bipolar' },
//     { id: '6.4 Transistors, Low Frequency, SI FET', name: '6.4 Transistors, Low Frequency, SI FET' },
//     { id: '6.5 Transistors,Unijunction', name: '6.5 Transistors,Unijunction' },
//     { id: '6.6 Transistors, Low Noise, High Frequency, Bipolar', name: '6.6 Transistors, Low Noise, High Frequency, Bipolar' },
//     { id: '6.7 Transistors,High Power,High Frequency,Bipolar', name: '6.7 Transistors,High Power,High Frequency,Bipolar' },
//     { id: '6.8 Transistors, High Frequency, GaAs FET', name: '6.8 Transistors, High Frequency, GaAs FET' },
//     { id: '6.9 Transistors, High Frequency, SI FET', name: '6.9 Transistors, High Frequency, SI FET' },
//     { id: '6.10 Thyristors and SCRS', name: '6.10 Thyristors and SCRS' },
//     { id: '6.11 Optoelectronics (Detectors, Isolators, Emitters)', name: '6.11 Optoelectronics (Detectors, Isolators, Emitters)' },
//     { id: '6.12 Alphanumeric Displays', name: '6.12 Alphanumeric Displays' },
//     { id: '6.13 Optoelectronics, Laser Diode', name: '6.13 Optoelectronics, Laser Diode' }
//   ];

//   const [components, setComponents] = useState([
//     {
//       id: 1,
//       componentType: '',
//       formData: {
//         diodeType: 'General Purpose Analog Switching',
//         junctionTemp: 25,
//         environment: 'GB',
//         quality: 'MIL-SPEC',
//         voltageStress: '',
//         voltageApplied: '',
//         voltageRated: '',
//         contactConstruction: 'Metallurgically Bonded',
//         numJunctions: 1
//       }
//     }
//   ]);

//   const [totalFailureRate, setTotalFailureRate] = useState(0);
//   const [componentFailureRates, setComponentFailureRates] = useState({});

//   const addComponent = () => {
//     const newId = components.length > 0 ? Math.max(...components.map(c => c.id)) + 1 : 1;
//     setComponents([
//       ...components,
//       {
//         id: newId,
//         componentType: '',
//         formData: {
//           diodeType: 'General Purpose Analog Switching',
//           junctionTemp: 25,
//           environment: 'GB',
//           quality: 'MIL-SPEC',
//           voltageStress: '',
//           voltageApplied: '',
//           voltageRated: '',
//           contactConstruction: 'Metallurgically Bonded',
//           numJunctions: 1
//         }
//       }
//     ]);
//   };

//   const removeComponent = (id) => {
//     if (components.length > 1) {
//       setComponents(components.filter(component => component.id !== id));
      
//       // Remove the failure rate for the deleted component
//       const newFailureRates = {...componentFailureRates};
//       delete newFailureRates[id];
//       setComponentFailureRates(newFailureRates);
//     }
//   };

//   const handleComponentTypeChange = (id, value) => {
//     setComponents(components.map(component =>
//       component.id === id ? { ...component, componentType: value } : component
//     ));
//   };

//   const handleInputChange = (id, e) => {
//     const { name, value } = e.target;
//     setComponents(components.map(component =>
//       component.id === id 
//         ? { ...component, formData: { ...component.formData, [name]: value } } 
//         : component
//     ));
//   };

//   const handleCalculate = (id, data) => {
//     if (onCalculate) {
//       onCalculate({ ...data, componentId: id });
//     }
    
//     // Store the individual failure rate for this component
//     if (data.failureRate) {
//       setComponentFailureRates(prev => ({
//         ...prev,
//         [id]: data.failureRate
//       }));
//     }
//   };

//   // Calculate total failure rate whenever componentFailureRates changes
//   useEffect(() => {
//     const total = Object.values(componentFailureRates).reduce((sum, rate) => sum + (rate || 0), 0);
//     setTotalFailureRate(total);
//   }, [componentFailureRates]);

//   const renderComponent = (component) => {
//     const commonProps = {
//       formData: component.formData,
//       onInputChange: (e) => handleInputChange(component.id, e),
//       onCalculate: (data) => handleCalculate(component.id, data),
//       qualityFactors,
//       environmentFactors
//     };

//     switch (component.componentType) {
//       case '6.1 Diodes, Low Frequency': return <LowFrequencyDiode  onCalculate={onCalculate} {...commonProps} />;
//       case '6.2 Diodes, High Frequency (Microwave, RF)': return <HighFrequencyDiode  onCalculate={onCalculate} {...commonProps} />;
//       case '6.3 Transistors, Low Frequency, Bipolar': return <LowFreqBipolar  onCalculate={onCalculate} {...commonProps} />;
//       case '6.4 Transistors, Low Frequency, SI FET': return <LowFreqFET onCalculate={onCalculate} {...commonProps} />;
//       case '6.5 Transistors,Unijunction': return <TransistorsUnijunction  onCalculate={onCalculate} {...commonProps} />;
//       case '6.6 Transistors, Low Noise, High Frequency, Bipolar': return <TransistorsLowNoiseHighFreqBipolar  onCalculate={onCalculate} {...commonProps} />;
//       case '6.7 Transistors,High Power,High Frequency,Bipolar': return <TransistorsHighPowerHighFrequencyBipolar  onCalculate={onCalculate} {...commonProps} />;
//       case '6.8 Transistors, High Frequency, GaAs FET': return <TransistorsHighFrequencyGaAsFET   onCalculate={onCalculate} {...commonProps} />;
//       case '6.9 Transistors, High Frequency, SI FET': return <TransistorsHighFrequencySIFET  onCalculate={onCalculate} {...commonProps} />;
//       case '6.10 Thyristors and SCRS': return <ThyristorsAndSCRS  onCalculate={onCalculate} {...commonProps} />;
//       case '6.11 Optoelectronics (Detectors, Isolators, Emitters)': return <Optoelectronics   onCalculate={onCalculate} {...commonProps} />;
//       case '6.12 Alphanumeric Displays': return <AlphanumericDisplays  onCalculate={onCalculate} {...commonProps} />;
//       case '6.13 Optoelectronics, Laser Diode': return <LaserDiode  onCalculate={onCalculate} {...commonProps} />;
//       default: return <div className="text-center mt-4">Please select a component type</div>;
//     }
//   };

//   const getMainHeading = () => {
//     if (components.length === 1 && components[0].componentType) {
//       return components[0].componentType.replace(/,/g, ' ').trim();
//     }
//     return 'Microcircuits Reliability Calculator';
//   };

//   return (
//     <Container>
//       <div className="container mt-4 background">
//         <h2 className="text-center">Discrete Semiconductor</h2>
//         <h2 className='text-center' style={{ fontSize: '1.0rem' }}>{getMainHeading()}</h2>
        
//         {components.map((component, index) => (
//           <div key={component.id} className="mb-4 p-3 border rounded">
//             <Row className="align-items-center mb-3">
//               <Col>
//                 <h4>Component {index + 1}</h4>
//               </Col>
//             </Row>
            
//             <div className="form-group">
//               <label>Part Type</label>
//               <select
//                 name="componentType"
//                 className="form-control"
//                 value={component.componentType}
//                 onChange={(e) => handleComponentTypeChange(component.id, e.target.value)}
//               >
//                 <option value="">Select a component type</option>
//                 {componentTypes.map(type => (
//                   <option key={type.id} value={type.id}>{type.name}</option>
//                 ))}
//               </select>
//             </div>
              
//             {renderComponent(component)}
            
//             {componentFailureRates[component.id] && (
//               <Alert variant="info" className="mt-3">
//                 Component Failure Rate: {componentFailureRates[component.id]?.toFixed(2)} failures/million hours
//               </Alert>
//             )}
            
//             {components.length > 1 && (
//               <Col xs="auto">
//                 <Button 
//                   variant="danger" 
//                   className='float-end mb-6'
//                   style={{ marginBottom: "100px", backgroundColor: "red" }}
//                   size="sm"
//                   onClick={() => removeComponent(component.id)}
//                 >
//                   Remove
//                 </Button>
//               </Col>
//             )}
//           </div>
//         ))}
        
//         {totalFailureRate > 0 && (
//           <Alert variant="success" className="mt-3">
//             <h4>System Reliability Summary</h4>
//             <p>Total System Failure Rate: {totalFailureRate?.toFixed(2)} failures/million hours</p>
//             {/* <p>MTBF: {(1 / totalFailureRate * 1000000).toFixed(2)} hours</p> */}
//           </Alert>
//         )}
//         {console.log("totalsystem.....",totalFailureRate)}
        
//         <div className="float-start mt-3">
//           <Button variant="primary" onClick={addComponent}>
//             Add Component
//           </Button>
//         </div>
//       </div>
//     </Container>
//   );
// };

// export default MicroDiode;


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

  return (
    <Container>
      <div className="container mt-4 background">
        <h2 className="text-center">Discrete Semiconductor</h2>
        <h2 className='text-center' style={{ fontSize: '1.0rem' }}>{getMainHeading()}</h2>
        
        {components.map((component, index) => (
          <div key={component.id} className="mb-4 p-3 border rounded">
            <Row className="align-items-center mb-3">
              <Col>
                <h4>Component {index + 1}</h4>
              </Col>
              {components.length > 1 && (
                <Col xs="auto">
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => removeComponent(component.id)}
                    style={{ backgroundColor: "red" }}
                  >
                    Remove
                  </Button>
                </Col>
              )}
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
              
            {renderComponent(component)}
            
            {component.failureRate > 0 && (
              <div className="prediction-result mt-3">
                <strong>Predicted Failure Rate:</strong>
                <span className="ms-2">{component.failureRate.toFixed(6)} failures/10<sup>6</sup> hours</span>
              </div>
            )}
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