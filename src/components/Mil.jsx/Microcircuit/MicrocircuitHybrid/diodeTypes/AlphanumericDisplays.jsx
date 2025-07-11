import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const AlphanumericDisplays = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
      const alphanumeric = [
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
    
    const alphaNumericEnvironmentFactors = [
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
 

  const calculateFailureRate = () => {
    const calculationDetails = [];
    let lambda_p = 0;
    let formula = '';
    let pi_Q = 1.0;
    let pi_E = 1.0;          
      const C = parseInt(formData.characterCount);
    const hasLogicChip = formData.hasLogicChip === 'true';
    const λ_IC = hasLogicChip ? 0.000043 : 0.0;
    
    // Calculate base failure rate based on display type
    let λ_b;
    if (formData.displayType === 'segment') {
        λ_b = 0.00043 * C + λ_IC;
    } else { // diode array
        λ_b = 0.00009 + 0.00017 * C + λ_IC;
    }
    
    calculationDetails.push({ 
        name: 'Base Failure Rate (λb)', 
        value: λ_b.toFixed(6),
        description: formData.displayType === 'segment' 
            ? `Segment Display: 0.00043 × ${C} + ${λ_IC}`
            : `Diode Array: 0.00009 + 0.00017 × ${C} + ${λ_IC}`
    });
         
 let pi_T = 1;
     let tempDescription12;
    if (formData.junctionTemp) {
        // Use the selected dropdown value
      
        const tempFactor = alphanumeric.find(t => t.temp === parseInt(formData.junctionTemp));
         pi_T = tempFactor.pi_T;
        tempDescription12 = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-2790 * ((1/(Tj + 273)) - (1/298)));
        tempDescription12 = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription12 = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription12
    });
            // Quality factor (use existing)
            // calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q });
            // Environment factor (use existing)

            const envFactor = alphaNumericEnvironmentFactors.find(e => e.code === formData.environment);
            pi_E = envFactor ? envFactor.pi_E : 1;
            calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };


            // calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });

            // Calculate final failure rate
        
           lambda_p = λ_b * pi_T * pi_Q * pi_E;
    formula = 'λp = λb × πT × πQ × πE';
   
    setResults({
      failureRate: lambda_p,
      details: calculationDetails,
      formula
    });

    if (onCalculate) {
      onCalculate(lambda_p, calculationDetails, formula);
    }
  };
  return(
      <>
                        <Row>
          <Col md={4}>
                <div className="form-group">
                    <label>Display Type</label>
                    <select
                        name="displayType"
                        className="form-control"
                        value={formData.displayType}
                        onChange={onInputChange}
                    >
                        <option value="segment">Segment Display  λ_b</option>
                        <option value="diode">Diode Array Display</option>
                    </select>
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Number of Characters  λ_b(C)</label>
                    <input
                        type="number"
                        name="characterCount"
                        className="form-control"
                        min="1"
                        value={formData.characterCount}
                        onChange={onInputChange}
                    />
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Has Logic Chip? λ_b</label>
                    <select
                        name="hasLogicChip"
                        className="form-control"
                        value={formData.hasLogicChip}
                        onChange={onInputChange}
                    >
                        <option value={true}>Yes (λ_IC = 0.000043)</option>
                        <option value={false}>No (λ_IC = 0.0)</option>
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
                                { alphanumeric.map(item => (
                                    
                                    <option key={item.temp} value={item.temp}>
                                        {item.temp}°C (πT = {item.pi_T})
                                    </option>
                                ))}
                            </select>
                            </div>
                            </Col>
                            <Col md={4}>
                            <div className="form-group">
                                <label>Manual Temperature Input (°C) πT</label>
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
                                {alphaNumericEnvironmentFactors.map(factor => (
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
                                // className="form-control"
                                value={formData.quality}
                                onChange={onInputChange}
                            >
                                {qualityFactors.map(factor => (
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
  )
}
export default AlphanumericDisplays;