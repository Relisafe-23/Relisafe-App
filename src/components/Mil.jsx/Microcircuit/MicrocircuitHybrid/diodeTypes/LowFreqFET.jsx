import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const LowFreqFET = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);

  // SI FET types
  const siFETTypes = [
    { name: 'MOSFET', lambda_b: 0.012 },
    { name: 'JFET', lambda_b: 0.0045 }
  ];
  
  // SI FET Application factors
  const siFETAppFactors = [
    { name: 'Linear Amplification (Pr < 2W)', pi_A: 1.5 },
    { name: 'Small Signal Switching', pi_A: 0.7 },
    { name: 'Power FETs (2 ≤ Pr < 5W)', pi_A: 2.0 },
    { name: 'Power FETs (5 ≤ Pr < 50W)', pi_A: 4.0 },
    { name: 'Power FETs (50 ≤ Pr < 250W)', pi_A: 8.0 },
    { name: 'Power FETs (Pr ≥ 250W)', pi_A: 10 }
  ];

  // SI FET Temperature factors
  const siFETTempFactors = [
    { temp: 25, pi_T: 1.0 }, { temp: 30, pi_T: 1.1 }, { temp: 35, pi_T: 1.2 },
    { temp: 40, pi_T: 1.4 }, { temp: 45, pi_T: 1.5 }, { temp: 50, pi_T: 1.6 },
    { temp: 55, pi_T: 1.8 }, { temp: 60, pi_T: 2.0 }, { temp: 65, pi_T: 2.1 },
    { temp: 70, pi_T: 2.3 }, { temp: 75, pi_T: 2.5 }, { temp: 80, pi_T: 2.7 },
    { temp: 85, pi_T: 3.0 }, { temp: 90, pi_T: 3.2 }, { temp: 95, pi_T: 3.4 },
    { temp: 100, pi_T: 3.7 }, { temp: 105, pi_T: 3.9 }, { temp: 110, pi_T: 4.2 },
    { temp: 115, pi_T: 4.5 }, { temp: 120, pi_T: 4.8 }, { temp: 125, pi_T: 5.1 },
    { temp: 130, pi_T: 5.4 }, { temp: 135, pi_T: 5.7 }, { temp: 140, pi_T: 6.0 },
    { temp: 145, pi_T: 6.4 }, { temp: 150, pi_T: 6.7 }, { temp: 155, pi_T: 7.1 },
    { temp: 160, pi_T: 7.5 }, { temp: 165, pi_T: 7.9 }, { temp: 170, pi_T: 8.3 },
    { temp: 175, pi_T: 8.7 }
  ];

  const siFETQualityFactors = [
    { name: 'JANTXV', pi_Q: 0.50 },
    { name: 'JANTX', pi_Q: 1.0 },
    { name: 'JAN', pi_Q: 2.0 },
    { name: 'Lower', pi_Q: 5.0 }
  ];

  const calculateFailureRate = () => {
    const calculationDetails = [];
    
    // Base failure rate
    const fetType = siFETTypes.find(t => t.name === formData.siFETType);
    const lambda_b = fetType ? fetType.lambda_b : 0;
    calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

    // Temperature factor
    let pi_T = 1.0;
    let tempDescription = '';
    
    if (formData.junctionTemp) {
      const tempFactor = siFETTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
      pi_T = tempFactor ? tempFactor.pi_T : 1.0;
      tempDescription = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
      const Tj = parseFloat(formData.junctionTempInput);
      pi_T = Math.exp(-1925 * ((1/(Tj + 273)) - (1/298)));
      tempDescription = `Calculated: πT = exp(-1925 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    }
    
    calculationDetails.push({ 
      name: 'Temperature Factor (πT)', 
      value: pi_T.toFixed(4),
      description: tempDescription
    });

    // Application factor
    const appFactor = siFETAppFactors.find(a => a.name === formData.siFETAppFactor);
    const pi_A = appFactor ? appFactor.pi_A : 1;
    calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });

    // Quality factor
    const qualityFactor = siFETQualityFactors.find(q => q.name === formData.quality);
    const pi_Q = qualityFactor ? qualityFactor.pi_Q : 1;
    calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q });

    // Environment factor
    const envFactor = environmentFactors.find(e => e.code === formData.environment);
    const pi_E = envFactor ? envFactor.pi_E : 1;
    calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });

    // Final calculation
    const lambda_p = lambda_b * pi_T * pi_A * pi_Q * pi_E;
    const formula = 'λp = λb × πT × πA × πQ × πE';

    setResults({
      failureRate: lambda_p,
      details: calculationDetails,
      formula
    });

    if (onCalculate) {
      onCalculate(lambda_p, calculationDetails, formula);
    }
  };

  return (
    <>
      <Row>
        <Col md={4}>
          <div className="form-group">
            <label>Transistor Type</label>
            <select
              name="siFETType"
              className="form-control"
              value={formData.siFETType || ''}
              onChange={onInputChange}
            >
              {siFETTypes.map(type => (
                <option key={type.name} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>
        </Col>
        
        <Col md={4}>
          <div className="form-group">
            <label>Application</label>
            <select
              name="siFETAppFactor"
              className="form-control"
              value={formData.siFETAppFactor || ''}
              onChange={onInputChange}
            >
              {siFETAppFactors.map(factor => (
                <option key={factor.name} value={factor.name}>{factor.name}</option>
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
              {siFETTempFactors.map(item => (
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
            <label>Quality πQ</label>
            <select
              name="quality"
              className="form-control"
              value={formData.quality || ''}
              onChange={onInputChange}
            >
              {siFETQualityFactors.map(factor => (
                <option key={factor.name} value={factor.name}>{factor.name}</option>
              ))}
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

export default LowFreqFET;