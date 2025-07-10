import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const HighFrequencyDiode = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  
  // High Frequency Diode types
  const highFreqDiodeTypes = [
    { name: 'SI IMPATT (≤ 35 GHz)', lambda_b: 0.22 },
    { name: 'Gunn/Bulk Effect', lambda_b: 0.18 },
    { name: 'Tunnel and Back (including Mixers, Detectors)', lambda_b: 0.0023 },
    { name: 'PIN', lambda_b: 0.0081 },
    { name: 'Schottky Barrier (including Detectors) and Point Contact', lambda_b: 0.027 },
    { name: 'Varactor (200 MHz ≤ Frequency ≤ 35 GHz)', lambda_b: 0.0025 },
  ];

  // Application factors
  const highFreqAppFactors = [
    { name: 'Varactor, Voltage Control', pi_A: 0.5 },
    { name: 'Varactor, Multiplier', pi_A: 2.5 },
    { name: 'All Other Diodes', pi_A: 1.0 }
  ];

  // Quality factors
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

  // Power factors
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
    try {
      // Validate inputs
      if (!formData.highFreqDiodeType) throw new Error('Please select a diode type');
      if (!formData.junctionTemp) throw new Error('Please enter junction temperature');
      
      const calculationDetails = [];
      const diodeType = highFreqDiodeTypes.find(d => d.name === formData.highFreqDiodeType);
      if (!diodeType) throw new Error('Invalid diode type selected');

      // Base failure rate
      let lambda_b = diodeType.lambda_b;
      calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

      // Temperature factor
      const pi_T = calculatePiT(formData.highFreqDiodeType, formData.junctionTemp);
      calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T.toFixed(4) });

      // Application factor
      const appFactor = highFreqAppFactors.find(a => a.name === formData.highFreqAppFactor);
      const pi_A = appFactor ? appFactor.pi_A : 1;
      calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });

      // Power rating factor
      let pi_R = 1;
      let powerRatingDescription = '';
      
      if (formData.highFreqPowerFactor) {
        const powerFactor = highFreqPowerFactors.find(p => p.power === formData.highFreqPowerFactor);
        pi_R = powerFactor ? powerFactor.pi_R : 1;
        powerRatingDescription = `Selected: ${formData.highFreqPowerFactor}`;
      } else if (formData.powerInput) {
        const Pr = parseFloat(formData.powerInput) || 1;
        pi_R = 0.326 * Math.log(Pr) - 0.25;
        powerRatingDescription = `Calculated from input power (${Pr} W)`;
      }
      
      // Special case for PIN diodes
      if (formData.highFreqDiodeType === 'PIN' && formData.highFreqAppFactor === 'All Other Diodes') {
        pi_R = 1.5;
        powerRatingDescription = 'Special case for PIN diodes';
      }
      
      calculationDetails.push({ 
        name: 'Power Rating Factor (πR)', 
        value: pi_R.toFixed(4),
        description: powerRatingDescription 
      });

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

      // Set results
      setResults({
        failureRate: lambda_p,
        details: calculationDetails,
        formula
      });

      // Call parent callback if needed
      if (onCalculate) {
        onCalculate(lambda_p, calculationDetails, formula);
      }

    } catch (error) {
      alert(error.message);
      console.error(error);
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
              value={formData.highFreqDiodeType || ''}
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
              value={formData.highFreqAppFactor || ''}
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
      </Row>

      <Button onClick={calculateFailureRate} className="mt-3">
        Calculate Failure Rate
      </Button>

      {results && (
        <div className="mt-4 p-3 bg-light rounded">
          <h4>Calculation Results</h4>
          <p><strong>Formula:</strong> {results.formula}</p>
          <p>
            <strong>Failure Rate (λp):</strong> {results.failureRate.toFixed(6)} failures/10<sup>6</sup> hours
          </p>

        </div>
      )}
    </>
  );
};

export default HighFrequencyDiode;