import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const HighFrequencyDiode = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  const[quantity,setQuantity]= useState(1);
  const highFreqDiodeTypes = [
    { name: 'SI IMPATT (≤ 35 GHz)', lambda_b: 0.22 },
    { name: 'Gunn/Bulk Effect', lambda_b: 0.18 },
    { name: 'Tunnel and Back (including Mixers, Detectors)', lambda_b: 0.0023 },
    { name: 'PIN', lambda_b: 0.0081 },
    { name: 'Schottky Barrier (including Detectors) and Point Contact', lambda_b: 0.027 },
    { name: 'Varactor (200 MHz ≤ Frequency ≤ 35 GHz)', lambda_b: 0.0025 },
  ];

  const highFreqAppFactors = [
    { name: 'Varactor, Voltage Control', pi_A: 0.5 },
    { name: 'Varactor, Multiplier', pi_A: 2.5 },
    { name: 'All Other Diodes', pi_A: 1.0 }
  ];

  const highFreqQualityFactors2 = [
    { name: 'JANTXV', pi_Q: 0.50 },
    { name: 'JANTX', pi_Q: 1.0 },
    { name: 'JAN', pi_Q: 1.8 },
    { name: 'Lower', pi_Q: 2.5 }
  ];

  const highFreqQualityFactors1 = [
    { name: 'JANTXV', pi_Q: 0.50 },
    { name: 'JANTX', pi_Q: 1.0 },
    { name: 'JAN', pi_Q: 5.0 },
    { name: 'Lower', pi_Q: 25 },
    { name: 'Plastic', pi_Q: 50 }
  ];

  const highFreqPowerFactors = [
    { power: '≤ 0.1 W', pi_R: 0.5 },
    { power: '0.1 W < P ≤ 1 W', pi_R: 1.0 },
    { power: '1 W < P ≤ 10 W', pi_R: 1.5 },
    { power: '> 10 W', pi_R: 2.0 }
  ];

  const calculatePiT = (diodeType, junctionTemp) => {
    const Tj = parseFloat(junctionTemp);
    if (diodeType === 'SI IMPATT (≤ 35 GHz)' || diodeType === 'Gunn/Bulk Effect') {
      return Math.exp(-5260 * ((1/(Tj + 273)) - (1/298)));
    } else {
      return Math.exp(-2100 * ((1/(Tj + 273)) - (1/298)));
    }
  };

  const calculateFailureRate = () => {
    const calculationDetails = [];
    const diodeType = highFreqDiodeTypes.find(d => d.name === formData.highFreqDiodeType);

    // Base failure rate
    let lambda_b = diodeType ? diodeType.lambda_b : 0;
    calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

    // Temperature factor
    const pi_T = formData.junctionTemp ? calculatePiT(formData.highFreqDiodeType, formData.junctionTemp) : 1;
    calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T.toFixed(4) });

    // Application factor
    const appFactor = highFreqAppFactors.find(a => a.name === formData.highFreqAppFactor);
    const pi_A = appFactor ? appFactor.pi_A : 1;
    calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });

    // Power rating factor
    let pi_R = 1;
    if (formData.highFreqPowerFactor) {
      const powerFactor = highFreqPowerFactors.find(p => p.power === formData.highFreqPowerFactor);
      pi_R = powerFactor ? powerFactor.pi_R : 1;
    } else if (formData.powerInput) {
      const Pr = parseFloat(formData.powerInput) || 1;
      pi_R = 0.326 * Math.log(Pr) - 0.25;
    }
    
    // Special case for PIN diodes
    if (formData.highFreqDiodeType === 'PIN' && formData.highFreqAppFactor === 'All Other Diodes') {
      pi_R = 1.5;
    }
    
    calculationDetails.push({ name: 'Power Rating Factor (πR)', value: pi_R.toFixed(4) });

    // Quality factor
    let qualityFactor;
    if (formData.highFreqDiodeType === 'Schottky Barrier (including Detectors) and Point Contact') {
      qualityFactor = highFreqQualityFactors2.find(q => q.name === formData.quality);
    } else {
      qualityFactor = highFreqQualityFactors1.find(q => q.name === formData.quality);
    }
    const pi_Q = qualityFactor ? qualityFactor.pi_Q : 1;
    calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q });

    // Environment factor
    const envFactor = environmentFactors.find(e => e.code === formData.environment);
    const pi_E = envFactor ? envFactor.pi_E : 1;
    calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });

    // Final calculation
    const lambda_p = lambda_b * pi_T * pi_A * pi_R * pi_Q * pi_E;
    const formula = 'λp = λb × πT × πA × πR × πQ × πE';

    setResults({
      failureRate: lambda_p,
      details: calculationDetails,
      formula
    });

    if (onCalculate) {
      onCalculate(lambda_p *quantity);
    }
  };

  return (
    <>
      <Row>
        <Col md={4}>
          <div className="form-group">
            <label>Diode Type</label>
            <select
              name="highFreqDiodeType"
              className="form-control"
              value={formData.highFreqDiodeType }
              onChange={onInputChange}
            >
              {highFreqDiodeTypes.map(type => (
                <option key={type.name} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Application</label>
            <select
              name="highFreqAppFactor"
              className="form-control"
              value={formData.highFreqAppFactor }
              onChange={onInputChange}
            >
              {highFreqAppFactors.map(factor => (
                <option key={factor.name} value={factor.name}>{factor.name}</option>
              ))}
            </select>
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
            <label>Power Rating πR</label>
            <select
              name="highFreqPowerFactor"
              className="form-control"
              value={formData.highFreqPowerFactor || ''}
              onChange={onInputChange}
            >
              <option value="">Calculate from input power</option>
              {highFreqPowerFactors.map(factor => (
                <option key={factor.power} value={factor.power}>
                  {factor.power} (πR = {factor.pi_R})
                </option>
              ))}
            </select>
          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Input Power (P_i in Watts) πR</label>
            <input
              type="number"
              name="powerInput"
              className="form-control"
              min="0.1"
              step="0.1"
              value={formData.powerInput || ''}
              onChange={onInputChange}
              disabled={!!formData.highFreqPowerFactor}
            />
          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Junction Temperature (°C) πT</label>
            <input
              type="number"
              name="junctionTemp"
              className="form-control"
              min="25"
              max="175"
              value={formData.junctionTemp || ''}
              onChange={onInputChange}
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
              {formData.highFreqDiodeType === 'Schottky Barrier (including Detectors) and Point Contact' ? (
                highFreqQualityFactors2.map(factor => (
                  <option key={factor.name} value={factor.name}>
                    {factor.name} (πQ = {factor.pi_Q !== null ? factor.pi_Q : '—'})
                  </option>
                ))
              ) : (
                highFreqQualityFactors1.map(factor => (
                  <option key={factor.name} value={factor.name}>
                    {factor.name} (πQ = {factor.pi_Q !== null ? factor.pi_Q : '—'})
                  </option>
                ))
              )}
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

      <Button onClick={calculateFailureRate} className="float-end  mt-5">
        Calculate FR
      </Button>
<br/>
      {results && (
        <div className="Predicted-Failure" style={{width:"50%"}}>
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

export default HighFrequencyDiode;