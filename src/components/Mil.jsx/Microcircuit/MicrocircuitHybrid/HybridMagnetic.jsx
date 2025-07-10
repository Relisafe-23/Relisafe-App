import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
import Box from '@mui/material/Box';
import { Alert, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import '../../Microcircuits.css'
import MaterialTable from "material-table";
import { tableIcons } from "../../../core/TableIcons.js";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@material-ui/core";


const HybridMagnetic = ({ onCalculate }) => {
  const [showCalculations, setShowCalculations] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1)
  const [currentComponent, setCurrentComponent] = useState({
    // type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
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
      const C11 = 0.00095 * Math.pow(N1, 0.40);
      const C21 = 0.0001 * Math.pow(N1, 0.226);

      // Memory Storage Area Complexity
      const C12 = 0.00007 * Math.pow(N2, 0.3);
      const C22 = 0.00001 * Math.pow(N2, 0.3);

      // Package factor (already set in packageType selection)
      const C2 = 0;


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
        onCalculate(lambdaP * quantity);
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
  return (
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

      <div className="d-flex justify-content-end">
        <Button
          variant="primary"
          onClick={calculateBubbleMemoryFailureRate}
          className="btn-calculate float-end mb-4"
        >
          Calculate FR
        </Button>
      </div>

      {result && (
        <>
          <div className="Predicted-FailureRate">
            <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
            <span className="ms-2">{result?.value} failures/10<sup>6</sup> hours</span>
              <br/>
            <strong>λ<sub>c</sub> * N<sub>c</sub>:</strong>
            <span className="ms-2">{result?.value * quantity} failures/10<sup>6</sup> hours</span>

            {console.log("calculateMagnetic..", result?.value * quantity)}
          </div>
        </>
      )}
    </>
  )
}
export default HybridMagnetic;