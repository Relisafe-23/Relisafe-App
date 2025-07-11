import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const LowFrequencyDiode = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
  
  const [results, setResults] = useState(null);
  const [quantity,setQuantity] = useState(1);
  // Low Frequency Diode types
  const lowFreqDiodeTypes = [
    { name: 'General Purpose Analog Switching', lambda_b: 0.0038 },
    { name: 'Switching', lambda_b: 0.0010 },
    { name: 'Power Rectifier, Fast Recovery', lambda_b: 0.069 },
    { name: 'Power Rectifier/Schottky', lambda_b: 0.030 },
    { name: 'Power Diode', lambda_b: 0.0020 },
    { name: 'Power Rectifier with High Voltage Stacks', lambda_b: 0.0050, perJunction: true },
    { name: 'Transient Suppressor/Varistor', lambda_b: 0.0013 },
    { name: 'Current Regulator', lambda_b: 0.0034 },
    { name: 'Voltage Regulator and Voltage Reference (Avalanche and Zener)', lambda_b: 0.0020 }
  ];

 // Temperature factors
   const lowFreqDiodeTempFactors1 = [
        { temp: 25, pi_T: 1.0 }, { temp: 30, pi_T: 1.2 }, { temp: 35, pi_T: 1.4 },
        { temp: 40, pi_T: 1.6 }, { temp: 45, pi_T: 1.9 }, { temp: 50, pi_T: 2.2 },
        { temp: 55, pi_T: 2.6 }, { temp: 60, pi_T: 3.0 }, { temp: 65, pi_T: 3.4 },
        { temp: 70, pi_T: 3.9 }, { temp: 75, pi_T: 4.4 }, { temp: 80, pi_T: 5.0 },
        { temp: 85, pi_T: 5.7 }, { temp: 90, pi_T: 6.4 }, { temp: 95, pi_T: 7.2 },
        { temp: 100, pi_T: 8.0 }, { temp: 105, pi_T: 9.0 }, { temp: 110, pi_T: 10 },
        { temp: 115, pi_T: 11 }, { temp: 120, pi_T: 12 }, { temp: 125, pi_T: 14 },
        { temp: 130, pi_T: 15 }, { temp: 135, pi_T: 16 }, { temp: 140, pi_T: 18 },
        { temp: 145, pi_T: 20 }, { temp: 150, pi_T: 21 }, { temp: 155, pi_T: 23 },
        { temp: 160, pi_T: 25 }, { temp: 165, pi_T: 28 }, { temp: 170, pi_T: 30 },
        { temp: 175, pi_T: 32 }
    ];
    const lowFreqDiodeTempFactors2 = [
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


  const contactConstructionFactors = [
    { type: 'Metallurgically Bonded', pi_C: 1.0 },
    { type: 'Non-Metallurgically Bonded and Spring Loaded Contacts', pi_C: 2.0 }
  ];

  const voltageStressFactors = [
    { range: 'Vs ≤ 0.30', pi_S: 0.054 },
        { range: '0.30 < Vs ≤ 0.40', pi_S: 0.11 },
     { range: '0.40 < Vs ≤ 0.50', pi_S: 0.19 },
    { range: '0.50 < Vs ≤ 0.60', pi_S: 0.29 },
    { range: '0.60 < Vs ≤ 0.70', pi_S: 0.42 },
    { range: '0.70 < Vs ≤ 0.80', pi_S: 0.58 },
    { range: '0.80 < Vs ≤ 0.90', pi_S: 0.77 }, 
  { range: '0.90 < Vs ≤ 1.0', pi_S: 1.0 },


  
  ];

  const calculatePiT = (diodeType, junctionTemp) => {
    const Tj = parseFloat(junctionTemp);
    
    if (diodeType.includes('Voltage Regulator') || 
        diodeType.includes('Current Regulator') ||
        diodeType.includes('Voltage Reference')) {
      // For Voltage Regulator/Reference and Current Regulator
      return Math.exp(-1925 * ((1/(Tj + 273)) - (1/298)));
    } else {
      // For General Purpose, Switching, Fast Recovery, etc.
      return Math.exp(-3091 * ((1/(Tj + 273)) - (1/298)));
    }
  };
  const calculateFailureRate = () => {
    try {
      // Validate diode type is selected
      if (!formData.diodeType) {
        throw new Error('Please select a diode type');
      }

      const diodeType = lowFreqDiodeTypes.find(d => d.name === formData.diodeType);
      if (!diodeType) {
        throw new Error('Invalid diode type selected');
      }

      let lambda_b = diodeType.lambda_b;
      
      if (diodeType.perJunction) {
        lambda_b *= formData.numJunctions || 1;
      }

      // Validate junction temperature
      if (!formData.junctionTemp) {
        throw new Error('Please enter junction temperature');
      }
      const pi_T = calculatePiT(formData.diodeType, formData.junctionTemp);
      
      // Calculate voltage stress factor
      let pi_S = 1;
      let voltageStressDescription = '';
      
      if (formData.voltageStress) {
        const stressFactor = voltageStressFactors.find(v => v.range === formData.voltageStress);
        pi_S = stressFactor ? stressFactor.pi_S : 1;
        voltageStressDescription = `Selected range: ${formData.voltageStress}`;
      } else if (formData.voltageApplied && formData.voltageRated) {
        const Vs = parseFloat(formData.voltageApplied) / parseFloat(formData.voltageRated);
        if (Vs <= 0.3) {
          pi_S = 0.054;
          voltageStressDescription = `Vs (${Vs.toFixed(4)}) ≤ 0.3, so πS = 0.054`;
        } else if (Vs > 0.3 && Vs <= 1) {
          pi_S = Math.pow(Vs, 2.43);
          voltageStressDescription = `Vs (${Vs.toFixed(4)}) > 0.3, so πS = Vs^2.43 = ${pi_S.toFixed(4)}`;
        } else {
          pi_S = 1.0;
          voltageStressDescription = `Vs (${Vs.toFixed(4)}) > 1.0, so πS = 1.0`;
        }
      }

      // Get other factors
      const contactFactor = contactConstructionFactors.find(c => c.type === formData.contactConstruction);
      const pi_C = contactFactor ? contactFactor.pi_C : 1;

      const qualityFactor = qualityFactors.find(q => q.name === formData.quality);
      const pi_Q = qualityFactor ? qualityFactor.pi_Q : 1;

      const envFactor = environmentFactors.find(e => e.code === formData.environment);
      const pi_E = envFactor ? envFactor.pi_E : 1;

      // Calculate final failure rate
      const lambda_p = lambda_b * pi_T * pi_S * pi_C * pi_Q * pi_E;
      
      const calculationDetails = [
        { name: 'Base Failure Rate (λb)', value: lambda_b },
        { name: 'Temperature Factor (πT)', value: pi_T.toFixed(4) },
        { 
          name: 'Electrical Stress Factor (πS)', 
          value: pi_S.toFixed(4),
          description: voltageStressDescription
        },
        { name: 'Contact Construction Factor (πC)', value: pi_C },
        { name: 'Quality Factor (πQ)', value: pi_Q },
        { name: 'Environment Factor (πE)', value: pi_E }
      ];
      
      const formula = 'λp = λb × πT × πS × πC × πQ × πE';
      
      // Set local results
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
      alert(error.message);
      console.error(error);
    }
  };

  return (
    <>
      <Row>
  <Col md={4}>
          <div className="form-group">
            <label>Diode Type λb</label>
            <select
              name="diodeType"
              className="form-control"
              value={formData.diodeType || ''}
              onChange={onInputChange}
            >
              {lowFreqDiodeTypes.map(type => (
                <option key={type.name} value={type.name}>{type.name}</option>
              ))}
            </select>
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
              {qualityFactors.map(factor => (
                <option key={factor.name} value={factor.name}>{factor.name}</option>
              ))}
            </select>
          </div>
        </Col>

        {formData.diodeType?.includes('High Voltage Stacks') && (
          <Col md={4}>
            <div className="form-group">
              <label>Number of Junctions</label>
              <input
                type="number"
                name="numJunctions"
                className="form-control"
                min="1"
                value={formData.numJunctions || 1}
                onChange={onInputChange}
              />
            </div>
          </Col>
        )}

        {!formData.diodeType?.includes('Transient Suppressor') &&
         !formData.diodeType?.includes('Voltage Regulator') &&
         !formData.diodeType?.includes('Current Regulator') && (
          <>
            <Col md={4}>
              <div className="form-group">
                <label>Voltage Stress Ratio (Vs) πS</label>
                <select
                  name="voltageStress"
                  className="form-control"
                  value={formData.voltageStress || ''}
                  onChange={onInputChange}
                >
                  <option value="">Select or calculate below</option>
                  {voltageStressFactors.map(factor => (
                    <option key={factor.range} value={factor.range}>
                      {factor.range} (πS = {factor.pi_S})
                    </option>
                  ))}
                </select>
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Voltage Applied (V) πS</label>
                <input
                  type="number"
                  name="voltageApplied"
                  className="form-control"
                  step="0.1"
                  min="0"
                  value={formData.voltageApplied || ''}
                  onChange={onInputChange}
                  disabled={!!formData.voltageStress}
                />
              </div>
            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Voltage Rated (V) πS</label>
                <input
                  type="number"
                  name="voltageRated"
                  className="form-control"
                  step="0.1"
                  min="0.1"
                  value={formData.voltageRated || ''}
                  onChange={onInputChange}
                  disabled={!!formData.voltageStress}
                />
              </div>
            </Col>

            {formData.voltageApplied && formData.voltageRated && !formData.voltageStress && (
              <Col md={4}>
                <div className="form-group">
                  <label>Calculated Voltage Stress Ratio</label>
                  <input
                    type="number"
                    className="form-control"
                    readOnly
                    value={(parseFloat(formData.voltageApplied) / parseFloat(formData.voltageRated)).toFixed(4)}
                  />
                </div>
              </Col>
            )}

            <Col md={4}>
              <div className="form-group">
                <label>Contact Construction Factor πC</label>
                <select
                  name="contactConstruction"
                  className="form-control"
                  value={formData.contactConstruction || ''}
                  onChange={onInputChange}
                >
                  {contactConstructionFactors.map(type => (
                    <option key={type.type} value={type.type}>{type.type}</option>
                  ))}
                </select>
              </div>
            </Col>
            
          </>
         )}
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

export default LowFrequencyDiode;