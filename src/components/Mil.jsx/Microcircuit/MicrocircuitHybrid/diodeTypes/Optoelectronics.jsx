import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const Optoelectronics = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  const[quantity,setQuantity]=useState(1);
      const optoelectronicTypes = [
        { name: 'Photodetectors', lambda_0: 0.0055 },
        { name: 'Photo-Transistor', lambda_0: 0.0055 },
        { name: 'Photo-Diode', lambda_0: 0.0040 }, // Note: Value not provided in image, using placeholder
        { name: 'Opto-isolators', lambda_0: 0.0025 },
        { name: 'Photodiode Output, Single Device', lambda_0: 0.0025 },
        { name: 'Phototransistor Output, Single Device', lambda_0: 0.013 },
        { name: 'Photodarlington Output, Single Device', lambda_0: 0.013 },
        { name: 'Light Sensitive Resistor, Single Device', lambda_0: 0.0064 },
        { name: 'Photodiode Output, Dual Device', lambda_0: 0.0033 },
        { name: 'Phototransistor Output, Dual Device', lambda_0: 0.017 },
        { name: 'Photodarlington Output, Dual Device', lambda_0: 0.017 },
        { name: 'Light Sensitive Resistor, Dual Device', lambda_0: 0.0013 },
        // Note: Value not provided in image, using single device value
        { name: 'Emitters', lambda_0: 0.0013 },
        { name: 'Infrared Light Emitting Diode (IRLD)', lambda_0: 0.00023 }
    ];
        const optoTempFactors = [
        { temp: 25, pi_T: 1.00 },
        { temp: 30, pi_T: 1.20 },
        { temp: 35, pi_T: 1.4 },
        { temp: 40, pi_T: 1.6 },
        { temp: 45, pi_T: 1.8 },
        { temp: 50, pi_T: 2.1 },
        { temp: 55, pi_T: 2.4 },
        { temp: 60, pi_T: 2.7 },
        { temp: 65, pi_T: 3.0 },
        { temp: 70, pi_T: 3.4 },
        { temp: 75, pi_T: 3.8 },
        { temp: 80, pi_T: 4.3 },
        { temp: 85, pi_T: 4.8 },
        { temp: 90, pi_T: 5.3 },
        { temp: 95, pi_T: 5.9 },
        { temp: 100, pi_T: 6.6 },
        { temp: 105, pi_T: 7.3 },
        { temp: 110, pi_T: 8.0 },
        { temp: 115, pi_T: 8.8 }
    ];
        const optoElectroEnvironmentFactors = [
        { code: 'GB', name: 'Ground, Benign', pi_E: 1.0 },
        { code: 'GF', name: 'Ground, Fixed', pi_E: 2.0 },
        { code: 'GM', name: 'Ground, Mobile', pi_E: 8.0 },
        { code: 'NS', name: 'Naval, Sheltered', pi_E: 5.0 },
        { code: 'NU', name: 'Naval, Unsheltered', pi_E: 12 },
        { code: 'AIC', name: 'Airborne, Inhabited, Cargo', pi_E: 4.0 },
        { code: 'AIF', name: 'Airborne, Inhabited, Fighter', pi_E: 6.0 },
        { code: 'AUC', name: 'Airborne, Uninhabited, Cargo', pi_E: 6.0 },
        { code: 'AUF', name: 'Airborne, Uninhabited, Fighter', pi_E: 8.0 },
        { code: 'ARW', name: 'Airborne, Rotary Wing', pi_E: 17 },
        { code: 'SF', name: 'Space, Flight', pi_E: 0.5 },
        { code: 'MF', name: 'Missile, Flight', pi_E: 9.0 },
        { code: 'ML', name: 'Missile, Launch', pi_E: 24 },
        { code: 'CL', name: 'Cannon, Launch', pi_E: 450 }
    ];
      const lowNoiseHighFreqQualityFactors = [
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
    const optoType = optoelectronicTypes.find(t => t.name === formData.optoelectronicType);
    const lambda_0 = optoType ? optoType.lambda_0 : 0.0055; // Default value if not found
    calculationDetails.push({ 
      name: 'Base Failure Rate (λ₀)', 
      value: lambda_0.toFixed(6),
      description: `Selected type: ${formData.optoelectronicType || 'Photodetectors'}`
    });

    // Temperature factor
    let pi_T = 1;
    let tempDescription;
    if (formData.junctionTemp) {
      const tempFactor = optoTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
      pi_T = tempFactor ? tempFactor.pi_T : 1.0;
      tempDescription = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
      const Tj = parseFloat(formData.junctionTempInput);
      pi_T = Math.exp(-2790 * ((1/(Tj + 273)) - (1/298)));
      tempDescription = `Calculated: πT = exp(-2790 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
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
    const qualityFactor = qualityFactors.find(q => q.name === formData.quality);
    pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
    calculationDetails.push({ 
      name: 'Quality Factor (πQ)', 
      value: pi_Q.toFixed(2),
      description: `Selected quality: ${formData.quality || 'default'}`
    });

    // Environment factor
    const envFactor = optoElectroEnvironmentFactors.find(e => e.code === formData.environment);
    pi_E = envFactor ? envFactor.pi_E : 1;
    calculationDetails.push({ 
      name: 'Environment Factor (πE)', 
      value: pi_E.toFixed(2),
      description: `Selected environment: ${formData.environment || 'default'}`
    });

    // Calculate final failure rate with bounds checking
    lambda_p = lambda_0 * pi_T * pi_Q * pi_E;
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
            <label>Optoelectronic Type λ₀</label>
            <select
              name="optoelectronicType"
              className="form-control"
              value={formData.optoelectronicType}
              onChange={onInputChange}
            >
              {optoelectronicTypes.map(type => (
                <option key={type.name} value={type.name}>
                  {type.name} (λ₀ = {type.lambda_0})
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
              {optoTempFactors.map(item => (
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
              value={formData.environment}
              onChange={onInputChange}
            >
              {optoElectroEnvironmentFactors.map(factor => (
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

export default Optoelectronics;
