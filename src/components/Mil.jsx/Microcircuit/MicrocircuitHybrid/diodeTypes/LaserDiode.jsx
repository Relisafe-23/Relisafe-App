import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const LaserDiode = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  const [results, setResults] = useState(null);
  const[quantity,setQuantity] = useState(1);
    const laserDiodeCurrentFactors = [
        { current: 0.050, pi_I: 0.13 },
        { current: 0.075, pi_I: 0.17 },
        { current: 0.1, pi_I: 0.21 },
        { current: 0.5, pi_I: 0.62 },
        { current: 1.0, pi_I: 1.0 },
        { current: 2.0, pi_I: 1.6 },
        { current: 3.0, pi_I: 2.1 },
        { current: 4.0, pi_I: 2.6 },
        { current: 5.0, pi_I: 3.0 },
        { current: 10, pi_I: 4.8 },
        { current: 15, pi_I: 6.3 },
        { current: 20, pi_I: 7.7 },
        { current: 25, pi_I: 8.9 }
    ];
    
    const laserDiodeTempFactors = [
        { temp: 25, pi_T: 1.0 },
        { temp: 30, pi_T: 1.3 },
        { temp: 35, pi_T: 1.7 },
        { temp: 40, pi_T: 2.1 },
        { temp: 45, pi_T: 2.7 },
        { temp: 50, pi_T: 3.3 },
        { temp: 55, pi_T: 4.1 },
        { temp: 60, pi_T: 5.1 },
        { temp: 65, pi_T: 6.3 },
        { temp: 70, pi_T: 7.7 },
        { temp: 75, pi_T: 9.3 },

    ];

       const laserDiodeApplicationFactors = [
        { name: 'CW', pi_A: 4.4 },
        { name: 'Pulsed', pi_A: 1.0 } // This is simplified - actual values depend on duty cycle
    ];
      const laserDiodeTypes = [
        { name: 'GaAs/M GaAs', lambda_b: 3.23 },
        { name: 'In GaAs/in GaAsP', lambda_b: 5.65 }
    ];
    
    const laserDiodePowerFactors = [
        { ratio: 0.00, pi_P: 0.50 },
        { ratio: 0.05, pi_P: 0.53 },
        { ratio: 0.10, pi_P: 0.55 },
        { ratio: 0.15, pi_P: 0.59 },
        { ratio: 0.20, pi_P: 0.63 },
        { ratio: 0.25, pi_P: 0.67 },
        { ratio: 0.30, pi_P: 0.71 },
        { ratio: 0.35, pi_P: 0.77 },
        { ratio: 0.40, pi_P: 0.83 },
        { ratio: 0.45, pi_P: 0.91 },
        { ratio: 0.50, pi_P: 1.0 },
        { ratio: 0.55, pi_P: 1.1 },
        { ratio: 0.60, pi_P: 1.3 },
        { ratio: 0.65, pi_P: 1.4 },
        { ratio: 0.70, pi_P: 1.7 },
        { ratio: 0.75, pi_P: 2.0 },
        { ratio: 0.80, pi_P: 2.5 },
        { ratio: 0.85, pi_P: 3.3 },
        { ratio: 0.90, pi_P: 5.0 },
        { ratio: 0.95, pi_P: 10 }
    ];
       const laserEnvironmentFactors = [
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
      const laserDiodeQualityFactors = [
        { name: 'Hermetic Package', pi_Q: 1.0 },
        { name: 'Nonhermetic with Facet Coating', pi_Q: 1.0 },
        { name: 'Nonhermetic without Facet Coating', pi_Q: 3.3 }
    ];

const calculateFailureRate = () => {
    const calculationDetails = [];
    let lambda_p = 0;
    let formula = '';
    let pi_Q = 1.0;
    let pi_E = 1.0; 
    let pi_R = 1.0;
       let lambda_b=1.0;
     if (formData.laserDiodeType) {
      const diodeType = laserDiodeTypes.find(d => d.name === formData.laserDiodeType);
      if (diodeType) {
        lambda_b = diodeType?.lambda_b;
        calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });
      } else {
        calculationDetails.push({ 
          name: 'Base Failure Rate (λb)', 
          value: '1.0 (default)',
          description: 'No valid laser diode type selected, using default λb = 1.0'
        });
      }
    } else {
      calculationDetails.push({ 
        name: 'Base Failure Rate (λb)', 
        value: '1.0 (default)',
        description: 'No laser diode type selected, using default λb = 1.0'
      });
    }

            // Temperature facto

                  let pi_T = 1;
     let tempDescription13;
    if (formData.laserDiodeTemp) {
        // Use the selected dropdown value
      
        const tempFactor =laserDiodeTempFactors.find(t => t.temp === parseInt(formData.laserDiodeTemp));
         pi_T = tempFactor.pi_T;
        tempDescription13 = `From table: ${formData.laserDiodeTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-4635 * ((1/(Tj + 273)) - (1/298)));
        tempDescription13 = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription13 = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription13
    });


 // Quality factor (specific to laser diodes)
            const qualityFactor = laserDiodeQualityFactors.find(q => q.name === formData.laserDiodeQuality);
            pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
            calculationDetails[0] = { name: 'Quality Factor (πQ)', value: pi_Q };

            // Get environment factor
            const envFactor = laserEnvironmentFactors.find(e => e.code === formData.environment);
            pi_E = envFactor ? envFactor.pi_E : 1;
            calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };


            // Current factor
            // const currentFactor = laserDiodeCurrentFactors.find(c => c.current >= formData.laserDiodeCurrent) ||
            //     laserDiodeCurrentFactors[laserDiodeCurrentFactors.length - 1];
            // const pi_I = currentFactor.pi_I;
            // calculationDetails.push({ name: 'Current Factor (πI)', value: pi_I });

   // In the calculateFailureRate function, replace the laser diode current factor calculation with:
let pi_I = 1;
let forwardCurrentDescription = '';

if (formData.laserDiodeCurrent) {
    // Use dropdown value if selected
    const currentFactor = laserDiodeCurrentFactors.find(c => parseFloat(c.current) === parseFloat(formData.laserDiodeCurrent));
    if (currentFactor) {
        pi_I = currentFactor.pi_I;
        forwardCurrentDescription = `Selected current: ${formData.laserDiodeCurrent}A (πI = ${pi_I})`;
    } else {
        // If not found in table, calculate using the formula
        const I = parseFloat(formData.laserDiodeCurrent);
        pi_I = Math.pow(I, 0.7); // Example formula - adjust based on your actual formula
        forwardCurrentDescription = `Calculated from input current (${I}A): πI = I^0.7 = ${pi_I.toFixed(4)}`;
    }
} else if (formData.powerInput4) {
    // Calculate from manual input if provided
    const I = parseFloat(formData.powerInput4) || 1;
    pi_I = Math.pow(I, 0.7); // Example formula - adjust based on your actual formula
    forwardCurrentDescription = `Calculated from input current (${I}A): πI = I^0.7 = ${pi_I.toFixed(4)}`;
} else {
    pi_I = 1.0;
    forwardCurrentDescription = "No current input, using default πI = 1.0";
}

calculationDetails.push({ 
    name: 'Forward Current Factor (πI)', 
    value: pi_I.toFixed(4),
    description: forwardCurrentDescription
});



        let pi_A = 1;
    let  appFactorDescription13 = '';

    if (formData.laserDiodeApplication) {
        // Use dropdown value if selected
       const currentFactor = laserDiodeApplicationFactors.find(c => c.current === parseInt(formData.laserDiodeApplication));
            pi_A = currentFactor ? currentFactor.pi_A : 1.0;
       appFactorDescription13= `Selected power factor: ${formData.laserDiodeApplication} (πA = ${pi_A})`;
    } else if (formData.powerInput2) {
        // Calculate from manual input if provided
          const Pr = parseFloat(formData.powerInput2) || 1;
          pi_A = Math.pow(Pr, 0.5);
      
        // pi_R = calculatePiR(Pr);
        pi_A = Math.pow(Pr, 0.40);
        
     appFactorDescription13 = `Calculated from input power (${Pr} W): πR = ${pi_R.toFixed(4)}`;
    } 
  calculationDetails.push({ 
        name: 'APP Facter (πA)', 
        value: pi_A.toFixed(4),
        description: appFactorDescription13
    });
  // Power degradation factor
            // const powerFactor = laserDiodePowerFactors.find(p => p.ratio >= formData.laserDiodePowerRatio) ||
            //     laserDiodePowerFactors[laserDiodePowerFactors.length - 1];
            // const pi_P = powerFactor.pi_P;
            // calculationDetails.push({ name: 'Power Factor (πP)', value: pi_P });

          // Power degradation factor
// Power degradation factor
let pi_P;
if (formData.laserDiodePowerRatio) {
    // Use selected value from dropdown
    const powerFactor = laserDiodePowerFactors.find(p => p.ratio === parseFloat(formData.laserDiodePowerRatio));
    pi_P = powerFactor ? powerFactor.pi_P : 1.0;
} else if (formData.requiredPower && formData.ratedPower) {
    // Calculate from input values using the correct formula
    const Pr = parseFloat(formData.requiredPower);
    const Ps = parseFloat(formData.ratedPower);
    const ratio = Pr / Ps;
    
    if (ratio > 0 && ratio <= 0.95) {
        pi_P = 1 / (2 * (1 - ratio));
        calculationDetails.push({ 
            name: 'Power Degradation Factor (πP)', 
            value: pi_P.toFixed(4),
            description: `Calculated from Pr/Ps = ${ratio.toFixed(4)} using formula: 1/(2*(1-${ratio.toFixed(4)})) = ${pi_P.toFixed(4)}`
        });
    } else if (ratio <= 0) {
        pi_P = 0;
        calculationDetails.push({ 
            name: 'Power Degradation Factor (πP)', 
            value: '0',
            description: 'Pr/Ps ratio must be greater than 0'
        });
    } else {
        pi_P = 10; // As shown in your table for ratio > 0.95
        calculationDetails.push({ 
            name: 'Power Degradation Factor (πP)', 
            value: '10',
            description: 'For Pr/Ps > 0.95, πP = 10 (maximum value)'
        });
    }
} else {
    pi_P = 1.0; // Default value
    calculationDetails.push({ 
        name: 'Power Degradation Factor (πP)', 
        value: '1.0',
        description: 'No power ratio input, using default πP = 1.0'
    });
}

            // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_Q * pi_I * pi_A * pi_P * pi_E;
            formula = 'λp = λb × πT × πQ × πI × πA × πP × πE';
           setResults({
      failureRate: lambda_p,
      details: calculationDetails,
      formula
    });

    // if (onCalculate) {
    //   onCalculate(lambda_p, calculationDetails, formula);
    // }
      if (onCalculate) {
      onCalculate(lambda_p * quantity);
    }
  };


  return(
      <>
                        <Row>
       <Col md={4}>
    <div className="form-group">
        <label>Forward Current (A) πI</label>
        <select
            name="laserDiodeCurrent"
            className="form-control"
            value={formData.laserDiodeCurrent}
            onChange={onInputChange}
        >
            <option value="">Select or enter current below</option>
            {laserDiodeCurrentFactors.map(factor => (
                <option key={factor.current} value={factor.current}>
                    {factor.current}A (πI = {factor.pi_I})
                </option>
            ))}
        </select>
    </div>
</Col>
<Col md={4}>
    <div className="form-group">
        <label>Manual Current Input (A) πI</label>
        <input
            type="number"
            name="powerInput4"
            className="form-control"
            min="0.05"
            step="0.01"
            value={formData.powerInput4}
            onChange={onInputChange}
            disabled={!!formData.laserDiodeCurrent}
        />
    </div>
</Col>
                            <Col md={4}>
                            <div className="form-group">
                                <label>Application πA</label>
                                <select
                                    name="laserDiodeApplication"
                                    // className="form-control"
                                    value={formData.laserDiodeApplication}
                                    onChange={onInputChange}
                                >
                                    <option value="">Select or enter application to find pulse</option>
                                    {laserDiodeApplicationFactors.map(factor => (
                                        <option key={factor.name} value={factor.name}>
                                            {factor.name} (πA = {factor.pi_A})
                                        </option>
                                    ))}
                                </select>
                                </div>
                            </Col>
                               <Col md={4}>
        <div className="form-group">
            <label>Enter the Pulse Duty Cycle (0-1) πA</label>
            <input
                type="number"
                name="powerInput2"
                className="form-control"
                min="0"
                max="1"
                step="0.01"
                value={formData.powerInput2 || ''}
                onChange={onInputChange}
                disabled={!!formData.laserDiodeApplication} // Disable if dropdown value is selected
            />
            <small className="text-muted">
                NOTE: A duty cycle of 1 in pulsed application represents the maximum amount it can be driven in pulsed mode.
            </small>
        </div>
    </Col>
                      
   <Col md={4}>
    <div className="form-group">
        <label>Power Degradation(Pr/Ps) πP</label>
        <select
            name="laserDiodePowerRatio"
            className="form-control"
            value={formData.laserDiodePowerRatio}
            onChange={onInputChange}
        >
            <option value="">Select or enter Pr/Ps below</option>
            {laserDiodePowerFactors.map(factor => (
                <option key={factor.ratio} value={factor.ratio}>
                    {factor.ratio} (πP = {factor.pi_P})
                </option>
            ))}
        </select>
    </div>
</Col>
        
              <Col md={4}>
                  <div className="form-group">
                     <label>optical power output(mW) (Pr) πP</label>
                    <input
                        type="number"
                        name="requiredPower"
                        className="form-control"
                        placeholder="Required (Pr)"
                        step="0.01"
                        min="0"
                        value={formData.requiredPower || ''}
                        onChange={onInputChange}
                        disabled={!!formData.laserDiodePowerRatio}
                    />
                    </div>
                         </Col>

                         <Col md={4}> 
                               <div className="form-group">

                    <label> Rated optical power output (mW) Ps πP </label>
                    <input
                        type="number"
                        name="ratedPower"
                        className="form-control"
                        placeholder="Rated (Ps)"
                        step="0.01"
                        min="0.01"
                        value={formData.ratedPower || ''}
                        onChange={onInputChange}
                        disabled={!!formData.laserDiodePowerRatio}
                    />
                    </div>
        </Col>
        
            <Col md={4}>
                <div className="form-group">

            
                    <label>Calculated Power Ratio (Pr/Ps)</label>
                    <input
                        type="number"
                        className="form-control"
                        readOnly
                        value={(parseFloat(formData.requiredPower) / parseFloat(formData.ratedPower)).toFixed(4)}
                        disabled={true}
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
                                {laserEnvironmentFactors.map(factor => (
                                    <option key={factor.code} value={factor.code}>
                                        {factor.code} - {factor.name} (πE = {factor.pi_E})
                                    </option>
                                ))}
                            </select>
                        </div>
                        </Col>
                        <Col md={4}>
                        <div className="form-group">

                            <label>Quality πQ </label>
                            <select
                                name="laserDiodeQuality"
                                // className="form-control"
                                value={formData.laserDiodeQuality}
                                onChange={onInputChange}
                            >
                                {laserDiodeQualityFactors.map(factor => (
                                    <option key={factor.name} value={factor.name}>
                                        {factor.name} (πQ = {factor.pi_Q})
                                    </option>
                                ))}
                            </select>
                        </div>
</Col>
<Col md={4}>
                            <div className="form-group">
                                <label>Laser Diode Type λb</label>
                                <select
                                    name="laserDiodeType"
                                    // className="form-control"
                                    value={formData.laserDiodeType}
                                    onChange={onInputChange}
                                >
                                    {laserDiodeTypes.map(type => (
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
                                    name="laserDiodeTemp"
                                    //  className="form-control"
                                    value={formData.laserDiodeTemp}
                                    onChange={onInputChange}
                                >
                                       <option value="">Enter manual temperature</option>
                                    {laserDiodeTempFactors.map(factor => (
                                        <option key={factor.temp} value={factor.temp}>
                                            {factor.temp}°C (πT = {factor.pi_T})
                                        </option>
                                    ))}
                                </select>
                                </div>
                            </Col>
                              <Col md={4}>
                            <div className="form-group">
                                <label>Manual Temperature Input (°C)πT</label>
                                <input
                                    type="number"
                                    name="junctionTempInput"
                                    className="form-control"
                                    min="25"
                                    max="175"
                                    step="1"
                                    value={formData.junctionTempInput || ''}
                                    onChange={onInputChange}
                                    disabled={!!formData.laserDiodeTemp} // Disable if dropdown value is selected 
                                />
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
  )
}
export default LaserDiode;