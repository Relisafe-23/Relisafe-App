import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
const TransistorsHighFrequencySIFET = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  const [quantity,setQuantity]= useState(1);

      const siFETTypesHF = [
        { name: 'MOSFET', lambda_b: 0.060 },
        { name: 'JFET', lambda_b: 0.023 }
    ];
    const siFETTempFactorsHF = [
        { temp: 25, pi_T: 1.0 },
        { temp: 30, pi_T: 1.1 },
        { temp: 35, pi_T: 1.2 },
        { temp: 40, pi_T: 1.4 },
        { temp: 45, pi_T: 1.5 },
        { temp: 50, pi_T: 1.6 },
        { temp: 55, pi_T: 1.8 },
        { temp: 60, pi_T: 2.0 },
        { temp: 65, pi_T: 2.1 },
        { temp: 70, pi_T: 2.3 },
        { temp: 75, pi_T: 2.5 },
        { temp: 80, pi_T: 2.7 },
        { temp: 85, pi_T: 3.0 },
        { temp: 90, pi_T: 3.2 },
        { temp: 95, pi_T: 3.4 },
        { temp: 100, pi_T: 3.7 },
        { temp: 105, pi_T: 3.9 },
        { temp: 110, pi_T: 4.2 },
        { temp: 115, pi_T: 4.5 },
        { temp: 120, pi_T: 4.8 },
        { temp: 125, pi_T: 5.1 },
        { temp: 130, pi_T: 5.4 },
        { temp: 135, pi_T: 5.7 },
        { temp: 140, pi_T: 6.0 },
        { temp: 145, pi_T: 6.4 },
        { temp: 150, pi_T: 6.7 },
        { temp: 155, pi_T: 7.1 },
        { temp: 160, pi_T: 7.5 },
        { temp: 165, pi_T: 7.9 },
        { temp: 170, pi_T: 8.3 },
        { temp: 175, pi_T: 8.7 },
    ];
      const siFETEnvironmentFactors = [
        { code: 'GB', name: 'Ground, Benign', pi_E: 1.0 },
        { code: 'GF', name: 'Ground, Fixed', pi_E: 2.0 },
        { code: 'GM', name: 'Ground, Mobile', pi_E: 5.0 },
        { code: 'NS', name: 'Naval, Sheltered', pi_E: 4.0 },
        { code: 'NU', name: 'Naval, Unsheltered', pi_E: 11 },
        { code: 'AIC', name: 'Airborne, Inhabited, Cargo', pi_E: 4.0 },
        { code: 'AIF', name: 'Airborne, Inhabited, Fighter', pi_E: 5.0 },
        { code: 'AUC', name: 'Airborne, Uninhabited, Cargo', pi_E: 7.0 },
        { code: 'AUF', name: 'Airborne, Uninhabited, Fighter', pi_E: 12 },
        { code: 'ARW', name: 'Airborne, Rotary Wing', pi_E: 16 },
        { code: 'SF', name: 'Space, Flight', pi_E: 0.5 },
        { code: 'MF', name: 'Missile, Flight', pi_E: 9.0 },
        { code: 'ML', name: 'Missile, Launch', pi_E: 24 },
        { code: 'CL', name: 'Cannon, Launch', pi_E: 250 }
    ]
    
    const siFETQualityFactors = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.0 },
        { name: 'Lower', pi_Q: 5.0 }
    ];


    const calculateFailureRate = () => {
    const calculationDetails = [];
    let lambda_p = 0;
    let formula = '';
    let pi_Q = 1.0;
    let pi_E = 1.0;

    // Base failure rate
    const fetType = siFETTypesHF.find(t => t.name === formData.siFETTypeHF);
    const lambda_b = fetType ? fetType.lambda_b : 0.060; // Default to MOSFET if not found
    calculationDetails.push({ 
      name: 'Base Failure Rate (λb)', 
      value: lambda_b.toFixed(6),
      description: `Selected type: ${formData.siFETTypeHF}`
    });

    // Temperature factor
    let pi_T = 1;
    let tempDescription;
    if (formData.junctionTempSIFET) {
      const tempFactor = siFETTempFactorsHF.find(t => t.temp === parseInt(formData.junctionTempSIFET));
      pi_T = tempFactor ? tempFactor.pi_T : 1.0;
      tempDescription = `From table: ${formData.junctionTempSIFET}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
      const Tj = parseFloat(formData.junctionTempInput);
      pi_T = Math.exp(-1925 * ((1/(Tj + 273)) - (1/298)));
      tempDescription = `Calculated: πT = exp(-1925 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
      pi_T = 1.0;
      tempDescription = "No temperature input, using default πT = 1.0";
    }

    calculationDetails.push({ 
      name: 'Temperature Factor (πT)', 
      value: pi_T.toFixed(4),
      description: tempDescription
    });

    // Quality factor
    const qualityFactor = siFETQualityFactors.find(q => q.name === formData.qualitySIFET);
    pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
    calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q.toFixed(2) });

    // Environment factor
    const envFactor = siFETEnvironmentFactors.find(e => e.code === formData.environment);
    pi_E = envFactor ? envFactor.pi_E : 1;
    calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E.toFixed(2) });

    // Calculate final failure rate with bounds checking
    lambda_p = lambda_b * pi_T * pi_Q * pi_E;
    lambda_p = Math.min(lambda_p, 1000); // Cap at reasonable maximum
    formula = 'λp = λb × πT × πQ × πE';

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
              name="siFETTypeHF"
              className="form-control"
              value={formData.siFETTypeHF}
              onChange={onInputChange}
            >
              {siFETTypesHF.map(type => (
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
              name="junctionTempSIFET"
              className="form-control"
              value={formData.junctionTempSIFET}
              onChange={onInputChange}
            >
              <option value="">Enter manual temperature</option>
              {siFETTempFactorsHF.map(item => (
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
              disabled={!!formData.junctionTempSIFET}
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
              {siFETEnvironmentFactors.map(factor => (
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
              name="qualitySIFET"
              className="form-control"
              value={formData.qualitySIFET}
              onChange={onInputChange}
            >
              {siFETQualityFactors.map(factor => (
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

      <Button onClick={calculateFailureRate} className="float-end mt-5">
        Calculate FR
      </Button>
<br/>
      {results && (
    <div className="Predicted-Failure" style={{width:"50%"}}>
          {/* <h4>Calculation Results</h4>
          <p><strong>Formula:</strong> {results.formula}</p> */}
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
)}
export default TransistorsHighFrequencySIFET ;