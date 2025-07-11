import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
import Box from '@mui/material/Box';
import { Alert, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import '../Microcircuits.css'
import MaterialTable from "material-table";
import { tableIcons } from "../../core/TableIcons.js";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@material-ui/core";


const MicroMagnetic= ({ onCalculate }) => {
     const [showCalculations, setShowCalculations] = useState(false); 
      const [result, setResult] = useState(null);
      const [error, setError] = useState(null);
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

  
  
    const calculateBubbleMemoryFailureRate = () => {
    
  
      try {
        // Calculate complexity factors
        const N1 = parseFloat(currentComponent.dissipativeElements);
        const N2 = parseFloat(currentComponent.numberOfBits);
  
        // Control and Detection Structure Complexity
        const C11 = 0.00095 * Math.pow(N1, 0.40) ;
        const C21 = 0.0001 * Math.pow(N1, 0.226)  ;
  
        // Memory Storage Area Complexity
        const C12 = 0.00007 * Math.pow(N2, 0.3);
        const C22 = 0.00001 * Math.pow(N2, 0.3);
  
        // Package factor (already set in packageType selection)
        const C2 = currentComponent.c2;
  
  
        // Temperature factors
        const TJ = parseFloat(currentComponent.temperature) + 10 + 273; // Convert to Kelvin
        const piT1 = 0.1 * Math.exp((-0.8 / (8.63e-5)) * ((1 / TJ) - (1 / 298)));
        const piT2 = 0.1 * Math.exp((-0.55 / (8.63e-5)) * ((1 / TJ) - (1 / 298)));
  
        // Write duty cycle factor
        const D = currentComponent.writeDutyCycle ? parseFloat(currentComponent.writeDutyCycle) : 0;
        const RW = currentComponent.readsPerWrite ? parseFloat(currentComponent.readsPerWrite) : 2154;
        let piW = (D <= 0.3 || RW >= 2154) ? 1 : (10 * D) / Math.pow(RW, 3);
  
        // For seed-bubble generators
        if (currentComponent.isSeedBubbleGenerator) {
          piW = Math.max(piW / 4, 1);
        }
  
        // Duty cycle factor
        const piD = 0.9 * D + 0.1;
  
        // Environment factor (already set in environment selection)
        const piE = currentComponent.piE;
  
        // Learning factor (already set in yearsInProduction selection)
        const piL = currentComponent.piL;
  
        // Quality factor (already set in quality selection)
        const piQ = currentComponent.piQ;
  
        // Number of chips
        const NC = parseFloat(currentComponent.bubbleChips);
  
        // Calculate failure rates
        const lambda1 = piQ * (NC * C11 * piT1 * piW + (NC * C21 + C2) * piE) * piD * piL;
        const lambda2 = piQ * NC * (C12 * piT2 + C22 * piE) * piL;
        const lambdaP = lambda1 + lambda2;
        // Call onCalculate with the failure rate
  
        console.log("lambdaP:", lambdaP)
        // Set results
        setResult({
          value: lambdaP?.toFixed(6),
          parameters: {
            c11: C11,
            c21: C21,
            c12: C12,
            c22: C22,
            c2: C2,
            piT1,
            piT2,
            piW,
            piD,
            piE,
            piL,
            piQ,
            lambda1,
            lambda2,
            lambdaP // Add lambdaP to parameters
          }
        });
  
        setError(null);
        if (onCalculate) {
          onCalculate(lambdaP);
        }
      } catch (err) {
        setError("Error in calculation: " + err.message);
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
 <>
 <Row>
       <Col md={4}>
                <div className="form-group">
                  <label>Environment Factor (π<sub>E</sub>):</label>
                  <Select
                    styles={customStyles}

                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        environment: selectedOption.value,
                        piE: selectedOption.piE
                      }));
                    }}
                    options={[
                      { value: "GB", label: "GB - Ground Benign (πE = 0.50)", piE: 0.50 },
                      { value: "GF", label: "GF - Ground Fixed (πE = 2.0)", piE: 2.0 },
                      { value: "GM", label: "GM - Ground Mobile (πE = 4.0)", piE: 4.0 },
                      { value: "NS", label: "NS - Naval Sheltered (πE = 4.0)", piE: 4.0 },
                      { value: "NU", label: "NU - Naval Unsheltered (πE = 6.0)", piE: 6.0 },
                      { value: "AIC", label: "AIC - Airborne Inhabited Cargo (πE = 4.0)", piE: 4.0 },
                      { value: "AIF", label: "AIF - Airborne Inhabited Fighter (πE = 5.0)", piE: 5.0 },
                      { value: "AUC", label: "AUC - Airborne Uninhabited Cargo (πE = 5.0)", piE: 5.0 },
                      { value: "AUF", label: "AUF - Airborne Uninhabited Fighter (πE = 8.0)", piE: 8.0 },
                      { value: "ARW", label: "ARW - Airborne Rotary Wing (πE = 8.0)", piE: 8.0 },
                      { value: "SF", label: "SF - Space Flight (πE = 0.50)", piE: 0.50 },
                      { value: "MF", label: "MF - Missile Flight (πE = 5.0)", piE: 5.0 },
                      { value: "ML", label: "ML - Missile Launch (πE = 12)", piE: 12 },
                      { value: "CL", label: "CL - Cannon Launch (πE = 220)", piE: 220 }
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
                      { value: 0.1, label: "≤ 0.1 years (πL = 2.0)", piL: 2.0 },
                      { value: 0.5, label: "0.5 years (πL = 1.8)", piL: 1.8 },
                      { value: 1.0, label: "1.0 year (πL = 1.5)", piL: 1.5 },
                      { value: 1.5, label: "1.5 years (πL = 1.2)", piL: 1.2 },
                      { value: 2.0, label: "≥ 2.0 years (πL = 1.0)", piL: 1.0 }
                    ]}
                  />
                </div>
              </Col>
  
              <Col md={4}>
                <div className="form-group">
                  <label>Number of Bubble Chips per Package (N<sub>C</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="bubbleChips"
                    min="1"
                    value={currentComponent.bubbleChips || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Dissipative Elements (N<sub>1</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="dissipativeElements"
                    min="1"
                    max="1000"
                    value={currentComponent.dissipativeElements || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Number of Bits (N<sub>2</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="numberOfBits"
                    min="1"
                    max="9000000"
                    value={currentComponent.numberOfBits || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
        

       
              <Col md={4}>
                <div className="form-group">
                  <label>Package Type (C<sub>2</sub>):</label>
                  <Select
                    styles={customStyles}
                    placeholder="Select"
                    onChange={(selectedOption) => {
                      setCurrentComponent(prev => ({
                        ...prev,
                        packageType: selectedOption.value,
                        c2: selectedOption.c2
                      }));
                    }}
                    options={[
                      { value: "Hermetic_DIPs_SolderWeldSeal", label: "Hermetic: DIPs w/Solder or Weld Seal", c2: 0.00092 },
                      { value: "DIPs_GlassSeal", label: "DIPs with Glass Seal", c2: 0.00047 },
                      { value: "Flatpacks_AxialLeads", label: "Flatpacks with Axial Leads", c2: 0.00022 },
                      { value: "Cans", label: "Cans", c2: 0.00027 },
                      { value: "Nonhermetic_DIPs", label: "Nonhermetic: DIPs", c2: 0.0012 }
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
              <Col md={4}>
                <div className="form-group">
                  <label>Duty Cycle Factor (π<sub>D</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="dutyCycle"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currentComponent.dutyCycle || ''}
                    onChange={handleInputChange}
                  />
                  <small className="form-text text-muted">
                    π<sub>D</sub> = 0.9D + 0.1 (D ≤ 1)
                  </small>
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
                        value: "MIL_M_38510_ClassS",
                        label: "Class S (MIL-M-38510, Class S)",
                        piQ: 0.25, // Store πQ for calculations
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
                  <label>Case Temperature (°C):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="tcase"
                    min="25"
                    max="175"
                    value={currentComponent.tcase || ''}
                    onChange={handleInputChange}
                  />
                  <small className="form-text text-muted">
                    T<sub>CASE</sub> = Measured case temperature
                  </small>
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Junction Temperature (°C) (π<sub>T</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="temperature"
                    min="25"
                    max="175"
                    value={currentComponent.tcase ? Number(currentComponent.tcase) + 10 : ''}
                    readOnly
                  />
                  <small className="form-text text-muted">
                    T<sub>J</sub> = T<sub>CASE</sub> + 10°C (automatically calculated)
                  </small>
                </div>
              </Col>

              <Col md={4}>
                <div className="form-group">
                  <label>Reads per Write (R/W) for (π<sub>W</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="readsPerWrite"
                    min="1"
                    value={currentComponent.readsPerWrite || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="form-group">
                  <label>Write Duty Cycle Factor (π<sub>W</sub>):</label>
                  <input
                    className="form-control"
                    type="number"
                    name="writeDutyCycle"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currentComponent.writeDutyCycle || ''}
                    onChange={handleInputChange}
                  />
                  <small className="form-text text-muted">
                    D = Avg. Device Data Rate / Mfg. Max. Rated Data Rate (≤ 1)
                  </small>
                </div>
              </Col>
    </Row>
            <div className="d-flex justify-content-between align-items-center">
              <div >
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
                onClick={calculateBubbleMemoryFailureRate}
                className="btn-calculate float-end mb-4"
              >
                Calculate Failure Rate
              </Button>
            </div>
            {result && (
              <>
                <h2 className="text-center">Calculation Result</h2>
                <div className="d-flex align-items-center">
                  <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                  <span className="ms-2">{result?.value} failures/10<sup>6</sup> hours</span>
                </div>
              </>
            )}
            {result && showCalculations && (
              <>
                <div className="table-responsive mt-4">
                  <MaterialTable
                    columns={[
                      {
                        title: <span>C<sub>11</sub></span>,
                        field: 'c11',
                        render: rowData => rowData?.c11?.toFixed(6) || '-'
                      },
                      {
                        title: <span>C<sub>21</sub></span>,
                        field: 'c21',
                        render: rowData => rowData?.c21?.toFixed(6) || '-'
                      },
                      {
                        title: <span>C<sub>12</sub></span>,
                        field: 'c12',
                        render: rowData => rowData?.c12?.toFixed(6) || '-'
                      },
                      {
                        title: <span>C<sub>22</sub></span>,
                        field: 'c22',
                        render: rowData => rowData?.c22?.toFixed(6) || '-'
                      },
                      {
                        title: <span>C<sub>2</sub></span>,
                        field: 'c2',
                        render: rowData => rowData?.c2?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>T1</sub></span>,
                        field: 'piT1',
                        render: rowData => rowData?.piT1?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>T2</sub></span>,
                        field: 'piT2',
                        render: rowData => rowData?.piT2?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>W</sub></span>,
                        field: 'piW',
                        render: rowData => rowData?.piW?.toFixed(4) || '-'
                      },
                      {
                        title: <span>π<sub>D</sub></span>,
                        field: 'piD',
                        render: rowData => rowData.piD?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>E</sub></span>,
                        field: 'piE',
                        render: rowData => rowData?.piE?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>L</sub></span>,
                        field: 'piL',
                        render: rowData => rowData?.piL?.toFixed(6) || '-'
                      },
                      {
                        title: <span>π<sub>Q</sub></span>,
                        field: 'piQ',
                        render: rowData => rowData?.piQ?.toFixed(6) || '-'
                      },
                      {
                        title: "λ₁ (Control)",
                        field: 'lambda1',
                        render: rowData => rowData?.lambda1?.toFixed(6) || '-',
                      },
                      {
                        title: "λ₂ (Memory)",
                        field: 'lambda2',
                        render: rowData => rowData?.lambda2?.toFixed(6) || '-',
                      },
                      {
                        title: "λₚ (Total)",
                        field: 'lambdaP',
                        render: rowData => rowData?.lambdaP || '-', // Display the full formatted string
                      }
                    ]}

                    data={[{
                      c11: result?.parameters?.c11,
                      c21: result?.parameters?.c21,
                      c12: result?.parameters?.c12,
                      c22: result?.parameters?.c22,
                      c2: result?.parameters?.c2,
                      piT1: result?.parameters?.piT1,
                      piT2: result?.parameters?.piT2,
                      piW: result?.parameters?.piW,
                      piD: result?.parameters?.piD,
                      piE: result?.parameters?.piE,
                      piL: result?.parameters?.piL,
                      piQ: result?.parameters?.piQ,
                      lambda1: result?.parameters?.lambda1,
                      lambda2: result?.parameters?.lambda2,
                      lambdaP: result?.value
                    }]}
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
                      },
                      cellStyle: {
                        textAlign: 'center'
                      }
                    }}
                    components={{
                      Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 8 }} />
                    }}

                  />
                </div>

                <div className="formula-section mt-3">
                  <h5>Calculation Formula</h5>
                  <p>λ<sub>p</sub> = λ<sub>1</sub> + λ<sub>2</sub></p>
                  <p>Where:</p>
                  <p>λ<sub>1</sub> = π<sub>Q</sub>[N<sub>C</sub>C<sub>11</sub>π<sub>T1</sub>π<sub>W</sub> + (N<sub>C</sub>C<sub>21</sub> + C<sub>2</sub>)π<sub>E</sub>]π<sub>D</sub>π<sub>L</sub></p>
                  <p>λ<sub>2</sub> = π<sub>Q</sub>N<sub>C</sub>(C<sub>12</sub>π<sub>T2</sub> + C<sub>22</sub>π<sub>E</sub>)π<sub>L</sub></p>
                </div>
              </>
            )}
          </>

  )
}
export default MicroMagnetic;