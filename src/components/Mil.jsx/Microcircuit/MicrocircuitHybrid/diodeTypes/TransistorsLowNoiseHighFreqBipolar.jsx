import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
const TransistorsLowNoiseHighFreqBipolar = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  const[quantity,setQuantity]= useState(1);
      const lowNoiseHighFreqTempFactors = [
        { temp: 25, pi_T: 1.0 },
        { temp: 30, pi_T: 1.1 },
        { temp: 35, pi_T: 1.3 },
        { temp: 40, pi_T: 1.4 },
        { temp: 45, pi_T: 1.6 },
        { temp: 50, pi_T: 1.7 },
        { temp: 55, pi_T: 1.9 },
        { temp: 60, pi_T: 2.1 },
        { temp: 65, pi_T: 2.3 },
        { temp: 70, pi_T: 2.5 },
        { temp: 75, pi_T: 2.8 },
        { temp: 80, pi_T: 3.0 },
        { temp: 85, pi_T: 3.3 },
        { temp: 90, pi_T: 3.6 },
        { temp: 95, pi_T: 3.9 },
        { temp: 100, pi_T: 4.2 },
        { temp: 105, pi_T: 4.5 },
        { temp: 110, pi_T: 4.8 },
        { temp: 115, pi_T: 5.2 },
        { temp: 120, pi_T: 5.6 },
        { temp: 125, pi_T: 5.9 },
        { temp: 130, pi_T: 6.3 },
        { temp: 135, pi_T: 6.8 },
        { temp: 140, pi_T: 7.2 },
        { temp: 145, pi_T: 7.7 },
        { temp: 150, pi_T: 8.1 },
        { temp: 155, pi_T: 8.6 },
        { temp: 160, pi_T: 9.1 },
        { temp: 165, pi_T: 9.7 },
        { temp: 170, pi_T: 10 },
        { temp: 175, pi_T: 11 }
    ];
        const lowNoiseEnvironmentFactors = [
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
    ];
        const lowNoiseHighFreqQualityFactors = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.0 },
        { name: 'Lower', pi_Q: 5.0 }
    ];
    
      const lowNoiseHighFreqVoltageFactors = [
        { range: '0 < Vs ≤ 0.3', pi_S: 0.11 },
        { range: '0.3 < Vs ≤ 0.4', pi_S: 0.16 },
        { range: '0.4 < Vs ≤ 0.5', pi_S: 0.21 },
        { range: '0.5 < Vs ≤ 0.6', pi_S: 0.29 },
        { range: '0.6 < Vs ≤ 0.7', pi_S: 0.39 },
        { range: '0.7 < Vs ≤ 0.8', pi_S: 0.54 },
        { range: '0.8 < Vs ≤ 0.9', pi_S: 0.73 },
        { range: '0.9 < Vs ≤ 1.0', pi_S: 1.0 }
    ];
        const lowNoiseHighFreqPowerFactors = [
        { power: 'Pr ≤ 0.1', pi_R: 0.43 },
        { power: '0.1 < Pr ≤ 0.2', pi_R: 0.55 },
        { power: '0.2 < Pr ≤ 0.3', pi_R: 0.64 },
        { power: '0.3 < Pr ≤ 0.4', pi_R: 0.71 },
        { power: '0.4 < Pr ≤ 0.5', pi_R: 0.77 },
        { power: '0.5 < Pr ≤ 0.6', pi_R: 0.83 },
        { power: '0.6 < Pr ≤ 0.7', pi_R: 0.88 },
        { power: '0.7 < Pr ≤ 0.8', pi_R: 0.92 },
        { power: '0.8 < Pr ≤ 0.9', pi_R: 0.96 },
        { power: '0.9 < Pr ≤ 1.0', pi_R: 1.0 }
    ];
   
       const calculateFailureRate = () => {
    const calculationDetails = [];
    
    // Base failure rate
    const lambda_b = 0.18;
    calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

    // Temperature factor
    let pi_T = 1.0;
    let tempDescription = '';
    
    if (formData.junctionTemp) {
      const tempFactor = lowNoiseHighFreqTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
      pi_T = tempFactor ? tempFactor.pi_T : 1.0;
      tempDescription = tempFactor ? `From table: ${formData.junctionTemp}°C → πT = ${pi_T}` : 'Using default πT = 1.0';
    } else if (formData.junctionTempInput) {
      const Tj = parseFloat(formData.junctionTempInput) || 25;
      pi_T = Math.exp(-2114 * ((1/(Tj + 273)) - (1/298)));
      tempDescription = `Calculated: πT = exp(-2114 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    }
    
    calculationDetails.push({ 
      name: 'Temperature Factor (πT)', 
      value: pi_T.toFixed(4),
      description: tempDescription
    });

    // Power rating factor
    let pi_R = 1.0;
    let powerRatingDescription = '';
    
    if (formData.powerRating) {
      const powerFactor = lowNoiseHighFreqPowerFactors.find(p => p.power === formData.powerRating);
      pi_R = powerFactor ? powerFactor.pi_R : 1.0;
      powerRatingDescription = `Selected: ${formData.powerRating}`;
    } else if (formData.powerInput1) {
      const Pr = parseFloat(formData.powerInput1) || 0.1;
      pi_R = Math.pow(Pr, 0.37);
      powerRatingDescription = `Calculated from input power (${Pr} W)`;
    }
    
    calculationDetails.push({
      name: 'Power Rating Factor (πR)',
      value: pi_R.toFixed(4),
      description: powerRatingDescription
    });

    // Voltage stress factor
    let pi_S = 1.0;
    let voltageStressDescription = '';
    
    if (formData.voltageStressRatio) {
      const voltageFactor = lowNoiseHighFreqVoltageFactors.find(v => v.range === formData.voltageStressRatio);
      pi_S = voltageFactor ? voltageFactor.pi_S : 1.0;
      voltageStressDescription = `Selected: ${formData.voltageStressRatio}`;
    } else if (formData.applied && formData.rated) {
      const Vs = parseFloat(formData.applied) / parseFloat(formData.rated);
      pi_S = 0.045 * Math.exp(3.1 * Vs);
      voltageStressDescription = `Calculated Vs (${Vs.toFixed(4)})`;
    }
    
    calculationDetails.push({
      name: 'Voltage Stress Factor (πS)',
      value: pi_S.toFixed(4),
      description: voltageStressDescription
    });

    // Quality factor
    const qualityFactor = lowNoiseHighFreqQualityFactors.find(q => q.name === formData.lowNoiseHighFreqQuality);
    const pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
    calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q });

    // Environment factor
    const envFactor = lowNoiseEnvironmentFactors.find(e => e.code === formData.environment);
    const pi_E = envFactor ? envFactor.pi_E : 1.0;
    calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });

    // Final calculation
    const lambda_p = lambda_b * pi_T * pi_R * pi_S * pi_Q * pi_E;
    const formula = 'λp = λb × πT × πR × πS × πQ × πE';

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
            <label>Base Failure Rate (λb)</label>
            <input
              type="text"
              className="form-control"
              value="0.18 failures/10⁶ hours"
              readOnly
            />
          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Power Rating πR</label>
            <select
              name="powerRating"
              className="form-control"
              value={formData.powerRating || ''}
              onChange={onInputChange}
            >
              <option value="">Calculate from input power</option>
              {lowNoiseHighFreqPowerFactors.map(factor => (
                <option key={factor.power} value={factor.power}>
                  {factor.power} (πR = {factor.pi_R})
                </option>
              ))}
            </select>
          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Calculate power rate πR (W)</label>
            <input
              type="number"
              name="powerInput1"
              className="form-control"
              min="0.1"
              step="0.1"
              value={formData.powerInput1 || ''}
              onChange={onInputChange}
              disabled={!!formData.powerRating}
            />
          </div>
        </Col>

                            <Col md={4}>
                            <div className="form-group">
                                <label>Voltage Stress Ratio πS</label>
                                <select
                                    name="voltageStressRatio"
                                    // className="form-control"
                                    value={formData.voltageStressRatio}
                                    onChange={onInputChange}
                                >
                                      <option value="">Select or calculate below</option>
                                    {lowNoiseHighFreqVoltageFactors.map(factor => (
                                        <option key={factor.range} value={factor.range}>
                                            {factor.range} (πS = {factor.pi_S})
                                        </option>
                                    ))}
                                </select>
                                </div>
                            </Col>
                               <Col md={4}>
                <div className="form-group">
                    <label>Applied VCE (V)πS</label>
                    <input
                        type="number"
                        name="applied"
                        className="form-control"
                        step="0.1"
                        min="0"
                        value={formData.applied}
                        onChange={onInputChange}
                        disabled={!!formData.voltageStressRatio}
                    />
                </div>
            </Col>

            <Col md={4}>
                <div className="form-group">
                    <label>Rated VCEO (V)πS</label>
                    <input
                        type="number"
                        name="rated"
                        className="form-control"
                        step="0.1"
                        min="0.1"
                        value={formData.rated}
                        onChange={onInputChange}
                        disabled={!!formData.voltageStressRatio}
                    />
                </div>
            </Col>

            {formData.applied && formData.rated && !formData.voltageStressRatio && (
                <Col md={4}>
                    <div className="form-group">
                        <label>Calculated Vs Ratio πS</label>
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
                            value={formData.junctionTemp}
                            onChange={onInputChange}
                        >
                            <option value="">Enter manual temperature</option>
                            {lowNoiseHighFreqTempFactors.map(item => (

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
                                    disabled={!!formData.junctionTemp} // Disable if dropdown value is selected
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
                                {lowNoiseEnvironmentFactors.map(factor => (
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
                            name="lowNoiseHighFreqQuality"
                            value={formData.lowNoiseHighFreqQuality}
                            onChange={onInputChange}
                        >
                            {lowNoiseHighFreqQualityFactors.map(factor => (
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
          <p><strong>Formula:</strong> {results?.formula}</p>
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

export default TransistorsLowNoiseHighFreqBipolar;