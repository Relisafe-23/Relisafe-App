import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
const TransistorsThyristorsAndSCRS = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  const[quantity,setQuantity] = useState(1);
    const thyristorTypes = [
        { name: 'All Types', lambda_b: 0.0022 }
    ];
        const thyristorTempFactors = [
        { temp: 25, pi_T: 1.0 },
        { temp: 30, pi_T: 1.2 },
        { temp: 35, pi_T: 1.4 },
        { temp: 40, pi_T: 1.6 },
        { temp: 45, pi_T: 1.9 },
        { temp: 50, pi_T: 2.2 },
        { temp: 55, pi_T: 2.6 },
        { temp: 60, pi_T: 3.0 },
        { temp: 65, pi_T: 3.4 },
        { temp: 70, pi_T: 3.9 },
        { temp: 75, pi_T: 4.4 },
        { temp: 80, pi_T: 5.0 },
        { temp: 85, pi_T: 5.7 },
        { temp: 90, pi_T: 6.4 },
        { temp: 95, pi_T: 7.2 },
        { temp: 100, pi_T: 8.0 },
        { temp: 105, pi_T: 8.9 },
        { temp: 110, pi_T: 9.9 },
        { temp: 115, pi_T: 11 },
        { temp: 120, pi_T: 12 },
        { temp: 125, pi_T: 13 },
        { temp: 130, pi_T: 15 },
        { temp: 135, pi_T: 16 },
        { temp: 140, pi_T: 18 },
        { temp: 145, pi_T: 19 },
        { temp: 150, pi_T: 21 },
        { temp: 155, pi_T: 23 },
        { temp: 160, pi_T: 25 },
        { temp: 165, pi_T: 27 },
        { temp: 170, pi_T: 30 },
        { temp: 175, pi_T: 32 }
    ];
    
    const thyristorCurrentFactors = [
        { current: 0.5, pi_R: 0.30 },
        { current: 10, pi_R: 0.40 },
        { current: 50, pi_R: 0.75 },
        { current: 1.0, pi_R: 1.0 },
        { current: 5.0, pi_R: 1.9 },
        { current: 10, pi_R: 2.5 },
        { current: 20, pi_R: 3.3 },
        { current: 30, pi_R: 3.9 },
        { current: 40, pi_R: 4.4 },
        { current: 50, pi_R: 4.8 },
        { current: 60, pi_R: 5.1 },
        { current: 70, pi_R: 5.5 },
        { current: 80, pi_R: 5.8 },
        { current: 90, pi_R: 6.0 },
        { current: 100, pi_R: 6.3 },
        { current: 110, pi_R: 6.6 },
        { current: 120, pi_R: 6.8 },
        { current: 130, pi_R: 7.0 },
        { current: 140, pi_R: 7.2 },
        { current: 150, pi_R: 7.4 },
        { current: 160, pi_R: 7.6 },
        { current: 170, pi_R: 7.8 },
        { current: 175, pi_R: 7.9 },
    ];

       const thyristorVoltageFactors = [
        { range: 'Vs ≤ 0.3', pi_S: 0.1 },
        { range: '0.3 < Vs ≤ 0.4', pi_S: 0.18 },
        { range: '0.4 < Vs ≤ 0.5', pi_S: 0.27 },
        { range: '0.5 < Vs ≤ 0.6', pi_S: 0.38 },
        { range: '0.6 < Vs ≤ 0.7', pi_S: 0.51 },
        { range: '0.7 < Vs ≤ 0.8', pi_S: 0.65 },
        { range: '0.8 < Vs ≤ 0.9', pi_S: 0.82 },
        { range: '0.9 < Vs ≤ 1.0', pi_S: 1.0 }
    ];

    const calculateFailureRate = () => {
    const calculationDetails = [];
    let lambda_p = 0;
    let formula = '';
    let pi_Q = 1.0;
    let pi_E = 1.0;

    // Base failure rate
    const thyristorType = thyristorTypes.find(t => t.name === formData.thyristorType);
    const lambda_b = thyristorType ? thyristorType.lambda_b : 0.0022;
    calculationDetails.push({ 
      name: 'Base Failure Rate (λb)', 
      value: lambda_b.toFixed(6),
      description: `Selected type: ${formData.thyristorType || 'All Types'}`
    });

    // Temperature factor
    let pi_T = 1;
    let tempDescription;
    if (formData.junctionTemp) {
      const tempFactor = thyristorTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
      pi_T = tempFactor ? tempFactor.pi_T : 1.0;
      tempDescription = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
      const Tj = parseFloat(formData.junctionTempInput);
      pi_T = Math.exp(-3082 * ((1/(Tj + 273)) - (1/298)));
      tempDescription = `Calculated: πT = exp(-3082 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
      pi_T = 1.0;
      tempDescription = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
      name: 'Temperature Factor (πT)', 
      value: pi_T.toFixed(4),
      description: tempDescription
    });

    // Current factor
    let pi_R = 1;
    let currentDescription = '';
    if (formData.thyristorCurrent) {
      const currentFactor = thyristorCurrentFactors.find(c => c.current === parseFloat(formData.thyristorCurrent));
      pi_R = currentFactor ? currentFactor.pi_R : 1.0;
      currentDescription = `Selected current: ${formData.thyristorCurrent}A (πR = ${pi_R})`;
    } else if (formData.powerInput2) {
      const Pr = parseFloat(formData.powerInput2) || 1;
      pi_R = Math.pow(Pr, 0.40);
      currentDescription = `Calculated from input current (${Pr}A): πR = ${pi_R.toFixed(4)}`;
    }
    
    calculationDetails.push({ 
      name: 'Current Factor (πR)', 
      value: pi_R.toFixed(4),
      description: currentDescription
    });

    // Voltage factor
    let pi_S = 1;
    let voltageDescription = '';
    if (formData.thyristorVoltage) {
      const voltageFactor = thyristorVoltageFactors.find(v => v.range === formData.thyristorVoltage);
      pi_S = voltageFactor ? voltageFactor.pi_S : 1.0;
      voltageDescription = `Selected voltage range: ${formData.thyristorVoltage} (πS = ${pi_S})`;
    } else if (formData.powerInput3) {
      const vs = parseFloat(formData.powerInput3) || 0.1;
      pi_S = Math.pow(vs, 1.9);
      voltageDescription = `Calculated from input voltage ratio (${vs}): πS = ${pi_S.toFixed(4)}`;
    }
    
    calculationDetails.push({ 
      name: 'Voltage Stress Factor (πS)', 
      value: pi_S.toFixed(4),
      description: voltageDescription
    });

    // Quality factor
    const qualityFactor = qualityFactors.find(q => q.name === formData.quality);
    pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
    calculationDetails.push({ 
      name: 'Quality Factor (πQ)', 
      value: pi_Q.toFixed(2),
      description: `Selected quality: ${formData.quality || 'default'}`
    });

    // Environment factor
    const envFactor = environmentFactors.find(e => e.code === formData.environment);
    pi_E = envFactor ? envFactor.pi_E : 1;
    calculationDetails.push({ 
      name: 'Environment Factor (πE)', 
      value: pi_E.toFixed(2),
      description: `Selected environment: ${formData.environment || 'default'}`
    });

    // Calculate final failure rate with bounds checking
    lambda_p = lambda_b * pi_T * pi_R * pi_S * pi_Q * pi_E;
    lambda_p = Math.min(lambda_p, 1000); // Cap at reasonable maximum
    formula = 'λp = λb × πT × πR × πS × πQ × πE';

    setResults({
      failureRate: lambda_p,
      details: calculationDetails,
      formula
    });

    // if (onCalculate) {
    //   onCalculate(lambda_p, calculationDetails, formula);
    // }
      if (onCalculate) {
      onCalculate(lambda_p *quantity);
    }
  };

  return (
    <>
      <Row>
        <Col md={4}>
          <div className="form-group">
            <label>Device Type λb</label>
            <select
              name="thyristorType"
              className="form-control"
              value={formData.thyristorType}
              onChange={onInputChange}
            >
              {thyristorTypes.map(type => (
                <option key={type.name} value={type.name}>
                  {type.name} (λb = {type.lambda_b})
                </option>
              ))}
            </select>
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Junction Temperature (°C) πT</label>
            <select
              name="junctionTemp"
              className="form-control"
              value={formData.junctionTemp}
              onChange={onInputChange}
            >
              <option value="">Enter manual temperature</option>
              {thyristorTempFactors.map(item => (
                <option key={item.temp} value={item.temp}>
                  {item.temp}°C (πT = {item.pi_T})
                </option>
              ))}
            </select>
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Manual Temperature Input (°C)</label>
            <input
              type="number"
              name="junctionTempInput"
              className="form-control"
              min="25"
              max="175"
              step="1"
              value={formData.junctionTempInput || ''}
              onChange={onInputChange}
              disabled={!!formData.junctionTemp}
            />
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Forward Current (A) πR</label>
            <select
              name="thyristorCurrent"
              className="form-control"
              value={formData.thyristorCurrent}
              onChange={onInputChange}
            >
              <option value="">Select or calculate below</option>
              {thyristorCurrentFactors.map(factor => (
                <option key={factor.current} value={factor.current}>
                  {factor.current}A (πR = {factor.pi_R})
                </option>
              ))}
            </select>
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Input Current Rating πR</label>
            <input
              type="number"
              name="powerInput2"
              className="form-control"
              min="0.1"
              step="0.1"
              value={formData.powerInput2 || ''}
              onChange={onInputChange}
              disabled={!!formData.thyristorCurrent}
            />
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Voltage Stress Ratio πS</label>
            <select
              name="thyristorVoltage"
              className="form-control"
              value={formData.thyristorVoltage}
              onChange={onInputChange}
            >
              <option value="">Select or calculate below</option>
              {thyristorVoltageFactors.map(factor => (
                <option key={factor.range} value={factor.range}>
                  {factor.range} (πS = {factor.pi_S})
                </option>
              ))}
            </select>
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Input Voltage Stress Ratio πS</label>
            <input
              type="number"
              name="powerInput3"
              className="form-control"
              min="0.1"
              max="1.0"
              step="0.01"
              value={formData.powerInput3 || ''}
              onChange={onInputChange}
              disabled={!!formData.thyristorVoltage}
            />
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Environment πE</label>
            <select
              name="environment"
              className="form-control"
              value={formData.environment}
              onChange={onInputChange}
            >
              {environmentFactors.map(factor => (
                <option key={factor.code} value={factor.code}>
                  {factor.code} - {factor.name} (πE = {factor.pi_E})
                </option>
              ))}
            </select>
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Quality πQ</label>
            <select
              name="quality"
              className="form-control"
              value={formData.quality}
              onChange={onInputChange}
            >
              {qualityFactors.map(factor => (
                <option key={factor.name} value={factor.name}>
                  {factor.name} (πQ = {factor.pi_Q})
                </option>
              ))}
            </select>
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

      <Button onClick={calculateFailureRate} className="mt-3">
        Calculate Failure Rate
      </Button>

      {results && (
        <div className="mt-4 p-3 bg-light rounded">
          <h4>Calculation Results</h4>
          <p><strong>Formula:</strong> {results.formula}</p>
         <p>
            <strong>Failure Rate (λp):</strong> {results?.failureRate?.toFixed(6)} failures/10<sup>6</sup> hours
          </p>
        <p className="mb-1">
                           <strong> λ<sub>c</sub> * N<sub>c</sub>:</strong>
                           {results?.failureRate * quantity}failures/10<sup>6</sup> hours
                           {/* {totalSysFailureRate.push(results?.value * quantity)} */}
                           {console.log("CalculateGate123..", results?.failureRate * quantity)}
                         </p>
     
        </div>
      )}
    </>
  );
};

export default TransistorsThyristorsAndSCRS;