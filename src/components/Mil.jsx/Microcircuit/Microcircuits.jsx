import React, { useState, useEffect, useMemo } from 'react';
import Select from "react-select";

import { createTheme } from "@mui/material";
import { Button, Container, Row, Col } from 'react-bootstrap';
import { Alert } from "@mui/material";
import Hybridgate from "./MicrocircuitHybrid/Hybridgate.jsx"
import HybridVhsic from './MicrocircuitHybrid/HybridVhsic.jsx'
import Hybridmemories from './MicrocircuitHybrid/Hybridmemories.jsx';
import HybridMagnetic from './MicrocircuitHybrid/HybridMagnetic.jsx';
import HybridGaAs from './MicrocircuitHybrid/HybridGaAs.jsx';
import HybridSaw from './MicrocircuitHybrid/HybridSaw.jsx';
const Microcircuits = ({
onTotalFailureRateChange

}) => {
  const [components, setComponents] = useState([{
    id: Date.now(),
    type: '',
    devices: '',
    complexFailure: '',
    gateCount: '',
    temperature: 25,
    environment: '',
    data: "microprocessorData",
    quality: 'M',
    quantity: 1,
    microprocessorData: "",
    technology: '',
    complexity: '',
    application: '',
    packageType: '',
    pinCount: '',
    yearsInProduction: '',
    memoryTemperature: 45,
    techTemperatureB2: 25,
    techTemperatureB1: 25,
    memorySizeB1: 1024,
    memorySizeB2: 1024,
    memoryTech: "Flotox",
    B1: 0.79,
    B2: null,
    calculatedPiT: 1.2,
    piL: 1.0,
    basePiT: 0.1,
    failureRate: 0,
    totalFailureRate: 0
  }]);

  const [component, setComponent] = useState([]);
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

   const [failureRates, setFailureRates] = useState({
    gate: null,
    vhsic: null,
    memories: null,
    saw: null,
    magnetic: null,
    gaAs: null
  });


  const addNewComponent = () => {
    const newComponent = {
      id: Date.now(),
      type: '',
      devices: '',
      complexFailure: '',
      gateCount: '',
      temperature: 25,
      environment: '',
      data: "microprocessorData",
      quality: 'M',
      quantity: 1,
      microprocessorData: "",
      technology: '',
      complexity: '',
      application: '',
      packageType: '',
      pinCount: '',
      yearsInProduction: '',
      memoryTemperature: 45,
      techTemperatureB2: 25,
      techTemperatureB1: 25,
      memorySizeB1: 1024,
      memorySizeB2: 1024,
      memoryTech: "Flotox",
      B1: 0.79,
      B2: null,
      calculatedPiT: 1.2,
      piL: 1.0,
      basePiT: 0.1,
      failureRate: 0,
      totalFailureRate: 0
    };
    setComponents([...components, newComponent]);
  };

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


  const partTypes = [
    { value: 'Logic', label: 'Logic and Custom Gate Array (λd = 0.16)' },
    { value: 'Memory', label: 'Memory (λd = 0.24)' }
  ];



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

  // Update the calculation handlers to track rates by component ID
  const handleGateCalculation = (rate, componentId) => {
    setFailureRates(prev => ({ ...prev, [componentId]: rate }));
  };

  const handleVhsicCalculation = (rate, componentId) => {
    setFailureRates(prev => ({ ...prev, [componentId]: rate }));
  };

  const hybridMemCalculation = (rate, componentId) => {
    setFailureRates(prev => ({ ...prev, [componentId]: rate }));
  };

  const hybridSawCalculation = (rate, componentId) => {
    setFailureRates(prev => ({ ...prev, [componentId]: rate }));
  };
  
  const hybridMagneticCalculation = (rate, componentId) => {
    setFailureRates(prev => ({ ...prev, [componentId]: rate }));
  };
  
  const hybridGasCalculation = (rate, componentId) => {
    setFailureRates(prev => ({ ...prev, [componentId]: rate }));
  };
 
  const totalSystemFailureRate = useMemo(() => {
    return Object.values(failureRates).reduce((sum, rate) => {
      return sum + (rate || 0);
    }, 0);
  }, [failureRates]);

    if (onTotalFailureRateChange) {
      onTotalFailureRateChange(totalSystemFailureRate);
    }
    console.log("totalFailureRate...",totalSystemFailureRate)

  const renderComponent = (component) => {
    return (
      < div key={component.id} className="component-container" style={{
        border: '1px solid #ddd',
        padding: '15px',
        margin: '15px 0',
        borderRadius: '5px',
        position: 'relative'
      }}  >
        <h3>Component {components.findIndex(c => c.id === component.id) + 1}</h3>

        <h2 className='text-center' style={{ fontSize: '1.2rem' }}> 
          {component?.type ? component.type.replace(/,/g, ' ').trim() : 'Microcircuits Reliability Calculator'}
        </h2>

        <Col md={12}>
          <label>Part Type:</label>
          <Select
            styles={customStyles}
            name="type"
            placeholder="Select"
            value={component.type ?
              { value: component.type, label: component.type } : null}
            onChange={(selectedOption) => {
              updateComponent(component.id, { type: selectedOption.value });
            }}
            options={[
              { value: "Microcircuits,Gate/Logic Arrays And Microprocessors", label: "Microcircuits,Gate/Logic Arrays And Microprocessors" },
              { value: "Microcircuits,Memories", label: "Microcircuits,Memories" },
              { value: "Microcircuits,Saw Devices", label: "Microcircuits,Saw Devices" },
              { value: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS", label: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" },
              { value: "Microcircuit,GaAs MMIC and Digital Devices", label: "Microcircuit,GaAs MMIC and Digital Devices" },
              { value: "Microcircuit,Magnetic Bubble Memories", label: "Microcircuit,Magnetic Bubble Memories" }
            ]}
          />
        </Col>
        <br/>
        <Row>
          {component.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
            <Hybridgate onCalculate={(rate) => handleGateCalculation(rate, component.id)}/>
          )}
          {component.type === "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" && (
            <HybridVhsic onCalculate={(rate) => handleVhsicCalculation(rate, component.id)}/>
          )}
          {component.type === "Microcircuits,Memories" && (
            <Hybridmemories onCalculate={(rate) => hybridMemCalculation(rate, component.id)}/>
          )}
          {component.type === "Microcircuits,Saw Devices" && (
            <HybridSaw onCalculate={(rate) => hybridSawCalculation(rate, component.id)}/>
          )}
          {component.type === "Microcircuit,Magnetic Bubble Memories" && (
            <HybridMagnetic onCalculate={(rate) => hybridMagneticCalculation(rate, component.id)}/>
          )}
          {component.type === "Microcircuit,GaAs MMIC and Digital Devices" && (
            <HybridGaAs onCalculate={(rate) => hybridGasCalculation(rate, component.id)}/>
          )}
          <br />
        </Row>
{/* 
        {failureRates[component.id] > 0 && (
          <div className="prediction-result" style={{ marginTop: '20px' }}>
            <strong>Predicted Failure Rate:</strong>
            <span className="ms-2">{failureRates[component.id]?.toFixed(6)} failures/10<sup>6</sup> hours</span>
          </div>
        )} */}

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
        Microcircuits Reliability Calculator
      </h2>
      
      {components.map(component => renderComponent(component))}

      <Button onClick={addNewComponent} className="mt-3">
        Add Component
      </Button>

      {components.length > 0 && (
        <div className="total-failure-rate" style={{ marginTop: '20px', padding: '10px'}}>
         <strong><h5>Microcircuits (λ<sub>c</sub> * N<sub>c</sub>): {totalSystemFailureRate?.toFixed(6)} failures/10<sup>6</sup> hours</h5></strong>
        </div>
      )}
    </div>
  );
}

export default Microcircuits;
  



//     return (
//       <div key={component.id} className="component-container" style={{
//         border: '1px solid #ddd',
//         padding: '15px',
//         margin: '15px 0',
//         borderRadius: '5px',
//         position: 'relative'
//       }}>
//         <h3>Component {components.findIndex(c => c.id === component.id) + 1}</h3>

// <h2 className='text-center' style={{ fontSize: '1.2rem' }}> {component?.type ? component.type.replace(/,/g, ' ').trim() : 'Microcircuits Reliability Calculator'}</h2>

        
//           <Col md={12}>
//             <label>Part Type:</label>
//             <Select
//               styles={customStyles}
//               name="type"
//               placeholder="Select"
//               value={component.type ?
//                 { value: component.type, label: component.type } : null}
//               onChange={(selectedOption) => {
//                 updateComponent(component.id, { type: selectedOption.value });
//               }}
//               options={[
//                 { value: "Microcircuits,Gate/Logic Arrays And Microprocessors", label: "Microcircuits,Gate/Logic Arrays And Microprocessors" },
//                 { value: "Microcircuits,Memories", label: "Microcircuits,Memories" },
//                 { value: "Microcircuits,Saw Devices", label: "Microcircuits,Saw Devices" },
//                 { value: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS", label: "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" },
//                 { value: "Microcircuit,GaAs MMIC and Digital Devices", label: "Microcircuit,GaAs MMIC and Digital Devices" },
//                 { value: "Microcircuit,Magnetic Bubble Memories", label: "Microcircuit,Magnetic Bubble Memories" }
//               ]}
//             />
//           </Col>
//     <br/>
//         <Row>
//           {component.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
//             <Hybridgate onCalculate={handleGateCalculation}/>
//           )}
//           {component.type === "Microcircuits,VHSIC/VHSIC-LIKE AND VLSI CMOS" && (
//         <HybridVhsic onCalculate={handleVhsicCalculation}/>
//           )}
//           {component.type === "Microcircuits,Memories" && (
//           <Hybridmemories onCalculate={hybridMemCalculation}/>
//                     )}

//           {component.type === "Microcircuits,Saw Devices" && (
//           <HybridSaw onCalculate={hybridSawCalculation}/>
//           )}

//           {component.type === "Microcircuit,Magnetic Bubble Memories" && (
//            <HybridMagnetic onCalculate={hybridMagneticCalculation}/>
//            )}

//         {component.type === "Microcircuit,GaAs MMIC and Digital Devices" && (
//         <HybridGaAs onCalculate={hybridGasCalculation}/>
//         )}
//         <br />
//        </Row>

//         {component?.failureRate > 0 && (
//           <div className="prediction-result" style={{ marginTop: '20px' }}>
//             <strong>Predicted Failure Rate:</strong>
//             <span className="ms-2">{component?.failureRate?.toFixed(6)} failures/10<sup>6</sup> hours</span>
//             <br />
//             <strong>Total :</strong>
//             <span className="ms-2">
//               {component?.total?.toFixed(6)} failures/10<sup>6</sup> hours
//             </span>
//           </div>
//         )}

//         <Button
//           variant="danger"
//           onClick={() => removeComponent(component.id)}
//           style={{ marginTop: '10px', backgroundColor: "red" }}
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
//       {/*     
//     {components.map(renderComponent)} */}
//       {components.map(component => renderComponent({ ...component, id: component.id }))}

//       <Button onClick={addNewComponent} className="mt-3">
//         Add Component
//       </Button>

//       {components.length > 0 && (
//         <div className="total-failure-rate" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa' }}>
//           {/* <h4>Total System Failure Rate: {total} failures/10<sup>6</sup> hours</h4> */}
//            <h4>Total System Failure Rate: {totalSystemFailureRate.toFixed(6)} failures/10<sup>6</sup> hours</h4>
         
//         </div>
//       )}
//     </div>

//   );
// }
// export default Microcircuits;