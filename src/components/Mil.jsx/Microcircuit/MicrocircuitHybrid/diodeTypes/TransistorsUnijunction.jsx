import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const TransistorsUnijunction = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  const [quantity,setQuantity] = useState(1);
  // Unijunction transistor types
  const unijunctionTypes = [
    { name: 'All Unijunction', lambda_b: 0.0083 }
  ];

  // Unijunction Temperature factors
  const unijunctionTempFactors = [
    { temp: 25, pi_T: 1.0 }, { temp: 30, pi_T: 1.1 }, { temp: 35, pi_T: 1.3 },
    { temp: 40, pi_T: 1.5 }, { temp: 45, pi_T: 1.7 }, { temp: 50, pi_T: 1.9 },
    { temp: 55, pi_T: 2.1 }, { temp: 60, pi_T: 2.4 }, { temp: 65, pi_T: 2.7 },
    { temp: 70, pi_T: 3.0 }, { temp: 75, pi_T: 3.3 }, { temp: 80, pi_T: 3.7 },
    { temp: 85, pi_T: 4.0 }, { temp: 90, pi_T: 4.4 }, { temp: 95, pi_T: 4.9 },
    { temp: 100, pi_T: 5.3 }, { temp: 105, pi_T: 5.8 }, { temp: 110, pi_T: 6.4 },
    { temp: 115, pi_T: 6.9 }, { temp: 120, pi_T: 7.5 }, { temp: 125, pi_T: 8.1 },
    { temp: 130, pi_T: 8.8 }, { temp: 135, pi_T: 9.5 }, { temp: 140, pi_T: 10 },
    { temp: 145, pi_T: 11 }, { temp: 150, pi_T: 12 }, { temp: 155, pi_T: 13 },
    { temp: 160, pi_T: 13 }, { temp: 165, pi_T: 14 }, { temp: 170, pi_T: 15 },
    { temp: 175, pi_T: 16 }
  ];

  const calculateFailureRate = () => {
    const calculationDetails = [];
    
    // Base failure rate with default fallback
    const unijunctionType = unijunctionTypes.find(t => t.name === (formData.unijunctionType || 'All Unijunction'));
    const lambda_b = unijunctionType.lambda_b;
    calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

    // Temperature factor with default fallback
    let pi_T = 1.0;
    let tempDescription = '';
    
    if (formData.junctionTemp) {
      const tempFactor = unijunctionTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
      pi_T = tempFactor ? tempFactor.pi_T : 1.0;
      tempDescription = tempFactor ? `From table: ${formData.junctionTemp}°C → πT = ${pi_T}` : 'Using default πT = 1.0';
    } else if (formData.junctionTempInput) {
      const Tj = parseFloat(formData.junctionTempInput) || 25;
      pi_T = Math.exp(-2483 * ((1/(Tj + 273)) - (1/298)));
      tempDescription = `Calculated: πT = exp(-2483 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    }
    
    calculationDetails.push({ 
      name: 'Temperature Factor (πT)', 
      value: pi_T.toFixed(4),
      description: tempDescription
    });

    // Quality factor with default fallback
    const qualityFactor = qualityFactors.find(q => q.name === (formData.quality || 'JANTX'));
    const pi_Q = qualityFactor ? qualityFactor.pi_Q : 1;
    calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q });

    // Environment factor with default fallback
    const envFactor = environmentFactors.find(e => e.code === (formData.environment || 'GB'));
    const pi_E = envFactor ? envFactor.pi_E : 1;
    calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });

    // Final calculation
    const lambda_p = lambda_b * pi_T * pi_Q * pi_E;
    const formula = 'λp = λb × πT × πQ × πE';

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
            <label>Transistor Type</label>
            <select
              name="unijunctionType"
              className="form-control"
              value={formData.unijunctionType || 'All Unijunction'}
              onChange={onInputChange}
            >
              {unijunctionTypes.map(type => (
                <option key={type.name} value={type.name}>{type.name}</option>
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
              value={formData.junctionTemp || ''}
              onChange={onInputChange}
            >
              <option value="">Enter manual temperature</option>
              {unijunctionTempFactors.map(item => (
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
            <label>Environment πE</label>
            <select
              name="environment"
              className="form-control"
              value={formData.environment || 'GB'}
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
              value={formData.quality || 'JANTX'}
              onChange={onInputChange}
            >
              {qualityFactors.map(factor => (
                <option key={factor.name} value={factor.name}>{factor.name}</option>
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

      <Button onClick={calculateFailureRate} className="float-end mt-5">
        Calculate FR
      </Button>
<br/>
      {results && (
       <div className="Predicted-Failure" style={{ width: "50%" }}>
          {/* <h4>Calculation Results</h4>
          <p><strong>Formula:</strong> {results?.formula}</p> */}
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

export default TransistorsUnijunction;