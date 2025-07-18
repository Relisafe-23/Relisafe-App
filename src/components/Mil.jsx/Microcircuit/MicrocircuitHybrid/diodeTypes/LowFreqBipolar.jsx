import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const LowFreqBipolar = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  const [quantity,setQuantity]= useState(1);
  // Transistor application factors
  const transistorAppFactors = [
    { name: 'Linear Amplification', pi_A: 1.5 },
    { name: 'Switching', pi_A: 0.7 }
  ];

  // Transistor power rating factors
  const transistorPowerFactors = [
    { power: 'Pr ≤ 0.1W', pi_R: 0.43 },
    { power: 'Pr = 0.5W', pi_R: 0.77 },
    { power: 'Pr = 1.0W', pi_R: 1.0 },
    { power: 'Pr = 5.0W', pi_R: 1.8 },
    { power: 'Pr = 10.0W', pi_R: 2.3 },
    { power: 'Pr = 50.0W', pi_R: 4.3 },
    { power: 'Pr = 100.0W', pi_R: 5.5 },
    { power: 'Pr = 500.0W', pi_R: 10 }
  ];

  // Transistor voltage stress factors
  const transistorVoltageFactors = [
    { range: '0 < Vs ≤ 0.3', pi_S: 0.11 },
    { range: '0.3 < Vs ≤ 0.4', pi_S: 0.16 },
    { range: '0.4 < Vs ≤ 0.5', pi_S: 0.21 },
    { range: '0.5 < Vs ≤ 0.6', pi_S: 0.29 },
    { range: '0.6 < Vs ≤ 0.7', pi_S: 0.39 },
    { range: '0.7 < Vs ≤ 0.8', pi_S: 0.54 },
    { range: '0.8 < Vs ≤ 0.9', pi_S: 0.73 },
    { range: '0.9 < Vs ≤ 1.0', pi_S: 1.0 }
  ];

  const TransistorTempFactors = [
    { temp: 25, pi_T: 1.0 }, { temp: 30, pi_T: 1.1 }, { temp: 35, pi_T: 1.3 },
    { temp: 40, pi_T: 1.4 }, { temp: 45, pi_T: 1.6 }, { temp: 50, pi_T: 1.7 },
    { temp: 55, pi_T: 1.9 }, { temp: 60, pi_T: 2.1 }, { temp: 65, pi_T: 2.3 },
    { temp: 70, pi_T: 2.8 }, { temp: 75, pi_T: 2.9 }, { temp: 80, pi_T: 3.0 },
    { temp: 85, pi_T: 3.3 }, { temp: 90, pi_T: 3.5 }, { temp: 95, pi_T: 3.8 },
    { temp: 100, pi_T: 4.1 }, { temp: 105, pi_T: 4.4 }, { temp: 110, pi_T: 4.9 },
    { temp: 115, pi_T: 5.1 }, { temp: 120, pi_T: 5.5 }, { temp: 125, pi_T: 5.9 },
    { temp: 130, pi_T: 6.3 }, { temp: 135, pi_T: 5.7 }, { temp: 140, pi_T: 7.1 },
    { temp: 145, pi_T: 7.6 }, { temp: 150, pi_T: 8.0 }, { temp: 155, pi_T: 9.0 },
    { temp: 160, pi_T: 9.0 }, { temp: 165, pi_T: 9.5 }, { temp: 170, pi_T: 10 },
    { temp: 175, pi_T: 11 }
  ];

  const calculateFailureRate = () => {
    try {
      const calculationDetails = [];
      
      // Base failure rate
      const lambda_b = 0.00074;
      calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

      // Temperature factor
      let pi_T = 1.0;
      let tempDescription = '';
      
      if (formData.junctionTemp) {
        const tempFactor = TransistorTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
        pi_T = tempFactor.pi_T;
        tempDescription = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
      } else if (formData.junctionTempInput) {
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-2114 * ((1/(Tj + 273)) - (1/298)));
        tempDescription = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
      }
      
      calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription
      });

      // Application factor
      const appFactor = transistorAppFactors.find(a => a.name === formData.transistorAppFactor);
      const pi_A = appFactor ? appFactor.pi_A : 1;
      calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });

      // Power rating factor
      let pi_R = 1;
      let powerRatingDescription = '';
      
      if (formData.transistorPowerFactor) {
        const powerFactor = transistorPowerFactors.find(p => p.power === formData.transistorPowerFactor);
        pi_R = powerFactor ? powerFactor.pi_R : 1;
        powerRatingDescription = `Selected: ${formData.transistorPowerFactor}`;
      } else if (formData.powerInput1) {
        const Pr = parseFloat(formData.powerInput1) || 1;
        pi_R = Math.pow(Pr, 0.37);
        powerRatingDescription = `Calculated from input power (${Pr} W): πR = ${pi_R.toFixed(4)}`;
      }
      
      calculationDetails.push({ 
        name: 'Power Rating Factor (πR)', 
        value: pi_R.toFixed(4),
        description: powerRatingDescription
      });

      // Voltage stress factor
      let pi_S = 1;
      let voltageStressDescription = '';
      
      if (formData.transistorVoltageFactor) {
        const voltageFactor = transistorVoltageFactors.find(v => v.range === formData.transistorVoltageFactor);
        pi_S = voltageFactor ? voltageFactor.pi_S : 1;
        voltageStressDescription = `Selected: ${formData.transistorVoltageFactor}`;
      } else if (formData.applied && formData.rated) {
        const Vs = parseFloat(formData.applied) / parseFloat(formData.rated);
        pi_S = 0.045 * Math.exp(3.1 * Vs);
        voltageStressDescription = `Calculated Vs (${Vs.toFixed(4)}) → πS = ${pi_S.toFixed(4)}`;
      }
      
      calculationDetails.push({ 
        name: 'Voltage Stress Factor (πS)', 
        value: pi_S.toFixed(4),
        description: voltageStressDescription
      });

      // Quality factor
      const qualityFactor = qualityFactors.find(q => q.name === formData.quality);
      const pi_Q = qualityFactor ? qualityFactor.pi_Q : 1;
      calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q });

      // Environment factor
      const envFactor = environmentFactors.find(e => e.code === formData.environment);
      const pi_E = envFactor ? envFactor.pi_E : 1;
      calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });

      // Final calculation
      const lambda_p = lambda_b * pi_T * pi_A * pi_R * pi_S * pi_Q * pi_E;
      const formula = 'λp = λb × πT × πA × πR × πS × πQ × πE';

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

    } catch (error) {
      console.error("Calculation error:", error);
      alert(error.message);
    }
  };

  return (
    <>
      <Row>
        <Col md={4}>
          <div className="form-group">
            <label>Diode Type</label>
            <select name="diode" className="form-control" value="NPN and PNP" disabled>
              <option value="NPN and PNP">NPN and PNP</option>
            </select>
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Application</label>
            <select
              name="transistorAppFactor"
              className="form-control"
              value={formData.transistorAppFactor || ''}
              onChange={onInputChange}
            >
              {transistorAppFactors.map(factor => (
                <option key={factor.name} value={factor.name}>{factor.name}</option>
              ))}
            </select>
          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Power Rating πR</label>
            <select
              name="transistorPowerFactor"
              className="form-control"
              value={formData.transistorPowerFactor || ''}
              onChange={onInputChange}
            >
              <option value="">Calculate from input power</option>
              {transistorPowerFactors.map(factor => (
                <option key={factor.power} value={factor.power}>
                  {factor.power} (πR = {factor.pi_R})
                </option>
              ))}
            </select>
          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Input Power (W)</label>
            <input
              type="number"
              name="powerInput1"
              className="form-control"
              min="0.1"
              step="0.1"
              value={formData.powerInput1 || ''}
              onChange={onInputChange}
              disabled={!!formData.transistorPowerFactor}
            />
          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Environment πE</label>
            <select
              name="environment"
              className="form-control"
              value={formData.environment || ''}
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
            <label>Voltage Stress Ratio (Vs) πS</label>
            <select
              name="transistorVoltageFactor"
              className="form-control"
              value={formData.transistorVoltageFactor || ''}
              onChange={onInputChange}
            >
              <option value="">Select or calculate below</option>
              {transistorVoltageFactors.map(factor => (
                <option key={factor.range} value={factor.range}>
                  {factor.range} (πS = {factor.pi_S})
                </option>
              ))}
            </select>
          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Applied VCE (V)</label>
            <input
              type="number"
              name="applied"
              className="form-control"
              step="0.1"
              min="0"
              value={formData.applied || ''}
              onChange={onInputChange}
              disabled={!!formData.transistorVoltageFactor}
            />
          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Rated VCEO (V)</label>
            <input
              type="number"
              name="rated"
              className="form-control"
              step="0.1"
              min="0.1"
              value={formData.rated || ''}
              onChange={onInputChange}
              disabled={!!formData.transistorVoltageFactor}
            />
          </div>
        </Col>

        {formData.applied && formData.rated && !formData.transistorVoltageFactor && (
          <Col md={4}>
            <div className="form-group">
              <label>Calculated Vs Ratio</label>
              <input
                type="number"
                className="form-control"
                readOnly
                value={(parseFloat(formData.applied) / parseFloat(formData.rated)).toFixed(4)}
              />
            </div>
          </Col>
        )}

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
              {TransistorTempFactors.map(item => (
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
            <label>Quality πQ</label>
            <select
              name="quality"
              className="form-control"
              value={formData.quality || ''}
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

      <Button onClick={calculateFailureRate} className=" float-end mt-5">
        Calculate FR
      </Button>
<br/>
      {results && (
        <div className="Predicted-FailureRate" style={{width:"50%"}}>
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
  );
};

export default LowFreqBipolar;