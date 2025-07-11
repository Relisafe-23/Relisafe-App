import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
const TransistorsHighFrequencyGaAsFET = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  const[quantity,setQuantity]= useState(1);
    const gaAsTempFactors = [
        { temp: 25, pi_T: 1.0 },
        { temp: 30, pi_T: 1.3 },
        { temp: 35, pi_T: 1.6 },
        { temp: 40, pi_T: 2.1 },
        { temp: 45, pi_T: 2.6 },
        { temp: 50, pi_T: 3.2 },
        { temp: 55, pi_T: 4.0 },
        { temp: 60, pi_T: 4.9 },
        { temp: 65, pi_T: 5.9 },
        { temp: 70, pi_T: 7.2 },
        { temp: 75, pi_T: 8.7 },
        { temp: 80, pi_T: 10 },
        { temp: 85, pi_T: 12 },
        { temp: 90, pi_T: 15 },
        { temp: 95, pi_T: 18 },
        { temp: 100, pi_T: 21 },
        { temp: 105, pi_T: 24 },
        { temp: 110, pi_T: 28 },
        { temp: 115, pi_T: 33 },
        { temp: 120, pi_T: 38 },
        { temp: 125, pi_T: 44 },
        { temp: 130, pi_T: 50 },
        { temp: 135, pi_T: 58 },
        { temp: 140, pi_T: 66 },
        { temp: 145, pi_T: 75 },
        { temp: 150, pi_T: 85 },
        { temp: 155, pi_T: 97 },
        { temp: 160, pi_T: 110 },
        { temp: 165, pi_T: 120 },
        { temp: 170, pi_T: 140 },
        { temp: 175, pi_T: 150 }
    ];
       const gaAsAppFactors = [
        { name: 'All Low Power and Pulsed', pi_A: 1 },
        { name: 'CW', pi_A: 4 }
    ];
    
    const gaAsMatchingNetworkFactors = [
        { name: 'Input and Output', pi_M: 1.0 },
        { name: 'Input Only', pi_M: 2.0 },
        { name: 'None', pi_M: 4.0 }
    ];
       const gasFETEnvironmentFactors = [
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
        { code: 'MF', name: 'Missile, Flight', pi_E: 7.5 },
        { code: 'ML', name: 'Missile, Launch', pi_E: 24 },
        { code: 'CL', name: 'Cannon, Launch', pi_E: 250 }
    ];
    
    const gaAsQualityFactors = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.0 },
        { name: 'Lower', pi_Q: 5.0 }
    ];
  const calculateFailureRate = () => {
    const calculationDetails = [];
    let lambda_b = 0;
    let lambda_p = 0;
    let formula = '';
    let pi_Q = 1.0;
    let pi_E = 1.0;            // 6.8 Transistors, High Frequency, GaAs FET calculation

            // Get base failure rate from table
         const frequency = parseFloat(formData.frequencyGHzGaAs);
    const power = parseFloat(formData.outputPowerWattsGaAs);
   
    
    // First check if we can use the table values
    if (frequency === 1 && power < 0.1) {
        lambda_b = 0.052;
    } else if (frequency === 4) {
        if (power < 0.1) lambda_b = 0.052;
        else if (power <= 0.1) lambda_b = 0.054;
        else if (power <= 0.5) lambda_b = 0.066;
        else if (power <= 1) lambda_b = 0.084;
        else if (power <= 2) lambda_b = 0.14;
        else if (power <= 4) lambda_b = 0.36;
        else if (power <= 6) lambda_b = 0.96;
    } else if (frequency === 5) {
        if (power < 0.1) lambda_b = 0.052;
        else if (power <= 0.1) lambda_b = 0.083;
        else if (power <= 0.5) lambda_b = 0.10;
        else if (power <= 1) lambda_b = 0.13;
        else if (power <= 2) lambda_b = 0.21;
        else if (power <= 4) lambda_b = 0.56;
        else if (power <= 6) lambda_b = 1.5;
    } else if (frequency === 6) {
        if (power < 0.1) lambda_b = 0.052;
        else if (power <= 0.1) lambda_b = 0.13;
        else if (power <= 0.5) lambda_b = 0.16;
        else if (power <= 1) lambda_b = 0.20;
        else if (power <= 2) lambda_b = 0.32;
        else if (power <= 4) lambda_b = 0.85;
        else if (power <= 6) lambda_b = 2.3;
    } else if (frequency === 7) {
        if (power < 0.1) lambda_b = 0.052;
        else if (power <= 0.1) lambda_b = 0.20;
        else if (power <= 0.5) lambda_b = 0.24;
        else if (power <= 1) lambda_b = 0.30;
        else if (power <= 2) lambda_b = 0.50;
        else if (power <= 4) lambda_b = 1.3;
        else if (power <= 6) lambda_b = 3.5;
    } else if (frequency === 8) {
        if (power < 0.1) lambda_b = 0.052;
        else if (power <= 0.1) lambda_b = 0.30;
        else if (power <= 0.5) lambda_b = 0.37;
        else if (power <= 1) lambda_b = 0.47;
        else if (power <= 2) lambda_b = 0.76;
        else if (power <= 4) lambda_b = 2.0;
    } else if (frequency === 9) {
        if (power < 0.1) lambda_b = 0.052;
        else if (power <= 0.1) lambda_b = 0.46;
        else if (power <= 0.5) lambda_b = 0.56;
        else if (power <= 1) lambda_b = 0.72;
        else if (power <= 2) lambda_b = 1.2;
    } else if (frequency === 10) {
        if (power < 0.1) lambda_b = 0.052;
        else if (power <= 0.1) lambda_b = 0.71;
        else if (power <= 0.5) lambda_b = 0.87;
        else if (power <= 1) lambda_b = 1.1;
        else if (power <= 2) lambda_b = 1.8;
        console.log('λb from table:', lambda_b);
    } else {
           // For frequencies not in the table, use the formula with bounds
      const exponent = 0.429 * frequency + 0.486 * power;
      const cappedExponent = Math.min(exponent, 10); // Prevent extreme values
      lambda_b = 0.0093 * Math.exp(cappedExponent);
      lambda_b = Math.min(lambda_b, 1000); // Cap at reasonable maximum
    }
     calculationDetails.push({ 
      name: 'Base Failure Rate (λb)', 
      value: lambda_b.toFixed(6),
      description: frequency >= 1 && frequency <= 10 ? 
        `From table: F=${frequency}GHz, P=${power}W` : 
        `Calculated from formula: 0.0093 * exp(0.429*${frequency} + 0.486*${power}) = ${lambda_b.toFixed(6)}`
    });

let pi_T = 1;
     let tempDescription8;
    if (formData.junctionTempGaAs) {
        // Use the selected dropdown value
        const tempFactor = gaAsTempFactors.find(t => t.temp === parseInt(formData.junctionTempGaAs));
       pi_T = tempFactor.pi_T;
        tempDescription8 = `From table: ${formData.junctionTempGaAs}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-2114 * ((1/(Tj + 273)) - (1/298)));
        tempDescription8 = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription8 = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription8
    });

      // Application factor
            const appFactor = gaAsAppFactors.find(a => a.name === formData.applicationTypeGaAs);
            const pi_A = appFactor ? appFactor.pi_A : 1.0;
            calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });

            // Matching network factor
            const matchFactor = gaAsMatchingNetworkFactors.find(m => m.name === formData.matchingNetworkGaAs);
            const pi_M = matchFactor ? matchFactor.pi_M : 1.0;
            calculationDetails.push({ name: 'Matching Network Factor (πM)', value: pi_M });

            // Quality factor (specific to this component type)
            const qualityFactor = gaAsQualityFactors.find(q => q.name === formData.qualityGaAs);
            pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
            calculationDetails[0] = { name: 'Quality Factor (πQ)', value: pi_Q };
            // Get environment factor
            const envFactor = gasFETEnvironmentFactors.find(e => e.code === formData.environment);
            pi_E = envFactor ? envFactor.pi_E : 1;
            calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };



            // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_A * pi_M * pi_Q * pi_E;
            formula = 'λp = λb × πT × πA × πM × πQ × πE';
    
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



  return(
     <>
                        
                            <Row>
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Frequency (GHz) λ_b</label>
                                    <input
                                        type="number"
                                        name="frequencyGHzGaAs"
                                        className="form-control"
                                        step="0.1"
                                        min="1"
                                        max="10"
                                        value={formData.frequencyGHzGaAs}
                                        onChange={onInputChange}
                                    />
                                    </div>
                                </Col>
                                <Col md={4}>
                                <div className="form-group">
                                    <label>Average Output Power (Watts) λ_b</label>
                                    <input
                                        type="number"
                                        name="outputPowerWattsGaAs"
                                        className="form-control"
                                        step="0.1"
                                        min="0.1"
                                        max="6"
                                        value={formData.outputPowerWattsGaAs}
                                        onChange={onInputChange}
                                    />
                                    </div>
                                </Col>
                
                            <Col md={4}>
                <div className="form-group">
                    <label>Junction Temperature (°C) πT</label>
                    <select
                        name="junctionTempGaAs"
                        className="form-control"
                        value={formData.junctionTempGaAs}
                        onChange={onInputChange}
                    >
                        <option value="">Enter manual temperature</option>
                        {gaAsTempFactors.map(item => (
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
                        disabled={!!formData.junctionTempGaAs} // Disable if dropdown value is selected
                    />
                </div>
            </Col>
                            <Col md={4}>
                            <div className="form-group">
                                <label>Application</label>
                                <select
                                    name="applicationTypeGaAs"
                                    className="form-control"
                                    value={formData.applicationTypeGaAs}
                                    onChange={onInputChange}
                                >
                                    {gaAsAppFactors.map(factor => (
                                        <option key={factor.name} value={factor.name}>
                                            {factor.name} (πA = {factor.pi_A})
                                        </option>
                                    ))}
                                </select>
                                </div>
                            </Col>
                            <Col md={4}>
                            <div className="form-group">
                                <label>Matching Network</label>
                                <select
                                    name="matchingNetworkGaAs"
                                    // className="form-control"
                                    value={formData.matchingNetworkGaAs}
                                    onChange={onInputChange}
                                >
                                    {gaAsMatchingNetworkFactors.map(factor => (
                                        <option key={factor.name} value={factor.name}>
                                            {factor.name} (πM = {factor.pi_M})
                                        </option>
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
                                value={formData.environment}
                                onChange={onInputChange}
                            >
                                {gasFETEnvironmentFactors.map(factor => (
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
                                        name="qualityGaAs"
                                        // className="form-control"
                                        value={formData.qualityGaAs}
                                        onChange={onInputChange}
                                    >
                                        {gaAsQualityFactors.map(factor => (
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
  )
}
export default TransistorsHighFrequencyGaAsFET