import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import {
  calculatePiT,
} from '../../Calculation.js';
import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
import '../../Microcircuits.css'

const HybridGaAs= ({ onCalculate }) => {
      const [currentDevice, setCurrentDevice] = useState([]); 
       const [result, setResult] = useState(null);
        const [error, setError] = useState(null);
    const[quantity, setQuantity]= useState(1);
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
   const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentComponent(prev => ({
      ...prev,
      [name]: name === 'temperature' || name === 'Tj' || name === 'gateCount' || name === 'quantity'
        ? parseFloat(value)
        : value
    }));
  };  
  const calculateGaAsFailureRate = () => {
    try {

      let c1;
      if (currentDevice?.type === "MMIC") {
        if (currentComponent?.complexity === "1-100") {
          c1 = 4.5;
        } else if (currentComponent?.complexity === "101-1000") {
          c1 = 7.2;
        } else {
          throw new Error("Invalid MMIC complexity range");
        }
      } else {
        if (currentComponent?.complexity === "1-1000") {
          c1 = 25;
        } else if (currentComponent?.complexity === "1001-10000") {
          c1 = 51;
        } else {
          throw new Error("Invalid Digital complexity range");
        }
      }

      // Get πA (application factor)
      const piA = currentComponent.piA;

      // Get C2 (package factor)
      const c2 = 0;

      // Get πE (environment factor)
      const piE = currentComponent.piE;


      const Ea = 0.7; // eV
      const k = 8.617e-5; // eV/K
      const Tref = 273 + 25; // Reference temperature (25°C in Kelvin)
      const Tj = 273 + parseFloat(currentComponent.temperature); // Junction temp in Kelvin
      const piT = calculatePiT(currentComponent.technology, currentComponent.temperature);

      // Get πL (learning factor) and πQ (quality factor)
      const piL = currentComponent.piL;
      const piQ = currentComponent.piQ;

      // Calculate failure rate using the formula: λp = [C1 πT πA + C2 πE] πL πQ
      const dieContribution = c1 * piT * piA;
      const packageContribution = c2 * piE;
      const lambdaP = (dieContribution + packageContribution) * piL * piQ;

      // Call onCalculate with the failure rate

      setResult({
        value: lambdaP?.toFixed(6),
        parameters: {
          c1: c1?.toFixed(4),
          piT: piT?.toFixed(2),
          piA: piA?.toFixed(4),
          c2: c2?.toFixed(6),
          piE: piE?.toFixed(4),
          piL: piL?.toFixed(4),
          piQ: piQ?.toFixed(4)
        }
      });
      setError(null);
      if (onCalculate) {
        onCalculate(lambdaP * quantity);
      }
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };
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
  <div className="reliability-calculator">
    <Row>
                 <Col md={4}>
                   <div className="form-group">
                     <label>Device Type for (C<sub>1</sub>):</label>
                     <Select
                       styles={customStyles}
                       name="type"
                       value={{
                         value: currentDevice.type,
                         label: currentDevice.type === "MMIC"
                           ? "MMIC (Microwave IC)"
                           : currentDevice.type === "Digital"
                             ? "Digital IC"
                             : "Select Device Type"
                       }}
   
                       onChange={(selectedOption) => {
                         setCurrentDevice(prev => ({
                           ...prev,
                           type: selectedOption.value,
                           complexity: ""
                         }));
                       }}
                       options={[
                         { value: "MMIC", label: "MMIC (Microwave IC)" },
                         { value: "Digital", label: "Digital IC" }
                       ]}
                     />
                   </div>
                 </Col>
                 <Col md={4}>
                   <div className="form-group">
                     <label>Complexity (C<sub>1</sub>):</label>
                     <Select
                       styles={customStyles}
                       value={{
                         value: currentComponent.complexity,
                         label: currentComponent.complexity
                           ? `${currentComponent.complexity} elements`
                           : "Select Complexity"
                       }}
                       onChange={(selectedOption) => {
                         setCurrentComponent(prev => ({
                           ...prev,
                           complexity: selectedOption.value
                         }));
                       }}
                       options={
                         currentDevice?.type === "MMIC"
                           ? [
                             { value: "1-100", label: "1-100 elements (C₁ = 4.5)" },
                             { value: "101-1000", label: "101-1000 elements (C₁ = 7.2)" }
                           ]
                           : [
                             { value: "1-1000", label: "1-1000 elements (C₁ = 25)" },
                             { value: "1001-10000", label: "1001-10000 elements (C₁ = 51)" }
                           ]
                       }
                     />
                   </div>
                 </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Environment (π<sub>E</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select Environment"
                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        environment: selectedOption.value,
                        piE: selectedOption.piE
                      }));
                    }}
                    options={[
                      { value: "GB", label: "Ground Benign (πE = 0.5)", piE: 0.5 },
                      { value: "GF", label: "Ground Fixed (πE = 2.0)", piE: 2.0 },
                      { value: "GM", label: "Ground Mobile (πE = 4.0)", piE: 4.0 },
                      { value: "NS", label: "Naval Sheltered (πE = 4.0)", piE: 4.0 },
                      { value: "NU", label: "Naval Unsheltered (πE = 6.0)", piE: 6.0 },
                      { value: "AIC", label: "Airborne Cargo (πE = 4.0)", piE: 4.0 },
                      { value: "AIF", label: "Airborne Fighter (πE = 5.0)", piE: 5.0 },
                      { value: "AUC", label: "Airborne Uninhabited Cargo (πE = 5.0)", piE: 5.0 },
                      { value: "AUF", label: "Airborne Uninhabited Fighter (πE = 8.0)", piE: 8.0 },
                      { value: "ARW", label: "Airborne Rotary Wing (πE = 8.0)", piE: 8.0 },
                      { value: "SF", label: "Space Flight (πE = 0.5)", piE: 0.5 },
                      { value: "MF", label: "Missile Flight (πE = 5.0)", piE: 5.0 },
                      { value: "ML", label: "Missile Launch (πE = 12)", piE: 12 },
                      { value: "CL", label: "Cannon Launch (πE = 220)", piE: 220 }
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
                    value={currentComponent.pinCount || 0}
                    onChange={(e) => setCurrentComponent({
                      ...currentComponent,
                      pinCount: parseInt(e.target.value)
                    })}
                  />
                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Application Factor (π<sub>A</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"

                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        application: selectedOption.value,
                        piA: selectedOption.piA
                      }));
                    }}
                    options={[
                      { value: "LowNoiseLowPower", label: "Low Noise & Low Power (πA = 1.0)", piA: 1.0 },
                      { value: "DriverHighPower", label: "Driver & High Power (πA = 3.0)", piA: 3.0 },
                      { value: "Unknown", label: "Unknown (πA = 3.0)", piA: 3.0 },
                      { value: "Digital", label: "Digital Applications (πA = 1.0)", piA: 1.0 }
                    ]}
                  />
                </div>
              </Col>


              <Col md={4}>
                <div className="form-group">
                  <label>Learning Factor (π<sub>L</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"
                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        yearsInProduction: selectedOption.value,
                        piL: selectedOption.piL
                      }));
                    }}
                    options={[
                
                      { value: 2.0, label: "≥ 2.0 years (πL = 1.0)", piL: 1.0 }
                    ]}
                  />
                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Quality Factor (π<sub>Q</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"
                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        quality: selectedOption.value,
                        piQ: selectedOption.piQ
                      }));
                    }}
                    options={[
                      // Class S Categories (πQ = 0.25)
             
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
                    
                    ]}
                  />
                </div>
              </Col>
        

              <Col md={4}>
                <div className="form-group">
                  <label>Technology Type for (π<sub>T</sub>):</label>
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
                  <label>Junction Temperature (°C) (π<sub>T</sub>):</label>
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
                                          <label>Quantity (Nₙ):</label>
                                          <input
                                              type="number"
                                              className="form-control"
                                              min="1"
                                              value={quantity}
                                              onChange={(e) => {
                                                  setQuantity(e.target.value);
                                                  //   calculateComponentSum(e.target.value)
                                              }}
                                          />
                                      </div>
                                       </Col>
          
  </Row>
              <div>
                <Button
               
                  onClick={calculateGaAsFailureRate}
                  className="btn-calculate float-end mb-4"
                >
                  Calculate FR
                </Button>
              </div>
       

        
            <br />

           
       
            {result && (
              <>
              
                <div style={{width:"50%"}}>
       <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                  <span className="ms-2">{result?.value} failures/10<sup>6</sup> hours</span>
                  <br/>
                  <strong>λ<sub>c</sub> * N<sub>c</sub>:</strong>
                  <span className="ms-2">{result?.value * quantity} failures/10<sup>6</sup> hours</span>
                
                
                </div>
              </>
            )}
           
          </div>
    )
}
export default HybridGaAs