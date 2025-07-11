import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
const TransistorsHighPowerHoghFreqBipolar = ({ formData, onInputChange, onCalculate, qualityFactors, environmentFactors }) => {
    const [results, setResults] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const highpowerEnvironmentFactors = [
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


    const appFactors = [
        { name: 'CW', pi_A: 7.6 },
        { name: 'Pulsed ≤ 1%', pi_A: 0.46 },
        { name: 'Pulsed 5%', pi_A: 0.70 },
        { name: 'Pulsed 10%', pi_A: 1.0 },
        { name: 'Pulsed 15%', pi_A: 1.3 },
        { name: 'Pulsed 20%', pi_A: 1.6 },
        { name: 'Pulsed 25%', pi_A: 1.9 },
        { name: 'Pulsed ≥ 30%', pi_A: 2.2 }
    ];
    const getHighPowerHighFreqTempFactor = (junctionTemp, voltageRatio, metalizationType) => {
        // Convert voltage ratio to percentage (0-100)
        const Va = voltageRatio * 100;

        // Temperature values in the table
        const tempValues = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

        // Gold metallization table
        const goldTable = [
            [0.10, 0.20, 0.30, 0.40],    // 100°C
            [0.12, 0.25, 0.37, 0.49],    // 110°C
            [0.15, 0.30, 0.45, 0.59],    // 120°C
            [0.18, 0.36, 0.54, 0.71],    // 130°C
            [0.21, 0.43, 0.64, 0.85],    // 140°C
            [0.25, 0.50, 0.75, 1.0],    // 150°C
            [0.29, 0.59, 0.88, 1.2],   // 160°C
            [0.34, 0.68, 1.0, 1.4],  // 170°C
            [0.40, 0.79, 1.2, 1.6],  // 180°C
            [0.45, 0.91, 1.4, 1.8],  // 190°C
            [0.52, 1.0, 1.6, 2.1]  // 200°C
        ];

        // Aluminum table is same as gold in this specification
        // const aluminumTable = goldTable;
        // Gold metallization table
        const aluminumTable = [
            [0.38, 0.75, 1.1, 1.5],    // 100°C
            [0.57, 1.1, 1.7, 2.3],    // 110°C
            [0.84, 1.7, 2.5, 3.3],    // 120°C
            [1.2, 2.4, 3.6, 4.8],    // 130°C
            [1.7, 3.4, 5.1, 6.8],    // 140°C
            [2.4, 4.7, 7.1, 9.5],    // 150°C
            [3.3, 6.5, 9.7, 13],   // 160°C
            [4.4, 8.8, 13, 18],  // 170°C
            [5.9, 12, 18, 23],  // 180°C
            [7.8, 15, 23, 31],  // 190°C
            [10, 20, 30, 40]  // 200°C
        ];
        // Select the appropriate table
        const table = metalizationType === 'Gold' ? goldTable : aluminumTable;

        // Find the closest temperature row
        let closestTempIndex = 0;
        let minDiff = Math.abs(junctionTemp - tempValues[0]);

        for (let i = 1; i < tempValues.length; i++) {
            const diff = Math.abs(junctionTemp - tempValues[i]);
            if (diff < minDiff) {
                minDiff = diff;
                closestTempIndex = i;
            }
        }

        // Determine the voltage stress column
        let column;
        if (Va <= 40) column = 0;
        else if (Va <= 45) column = 1;
        else if (Va <= 50) column = 2;
        else column = 3; // 55%

        return table[closestTempIndex][column];
    };
    const calculateFailureRate = () => {
        const calculationDetails = [];
        let lambda_b = 0;
        let lambda_p = 0;
        let formula = '';
        let pi_Q = 1.0;
        let pi_E = 1.0;
        // 6.7 Transistors, High Power, High Frequency, Bipolar calculation


        const frequency = parseFloat(formData.frequencyGHz);
        const power = parseFloat(formData.outputPowerWatts);

        let description = '';

        // Find the appropriate row in the frequency/power table
        if (frequency <= 0.5) {
            if (power <= 1.0) {
                lambda_b = 0.038;
                description = `From table: F ≤ 0.5GHz, P ≤ 1.0W`;
            } else if (power <= 5.0) {
                lambda_b = 0.039;
                description = `From table: F ≤ 0.5GHz, 1.0W < P ≤ 5.0W`;
            } else if (power <= 10) {
                lambda_b = 0.040;
                description = `From table: F ≤ 0.5GHz, 5.0W < P ≤ 10W`;
            } else if (power <= 50) {
                lambda_b = 0.050;
                description = `From table: F ≤ 0.5GHz, 10W < P ≤ 50W`;
            } else if (power <= 100) {
                lambda_b = 0.067;
                description = `From table: F ≤ 0.5GHz, 50W < P ≤ 100W`;
            } else if (power <= 200) {
                lambda_b = 0.12;
                description = `From table: F ≤ 0.5GHz, 100W < P ≤ 200W`;
            } else if (power <= 300) {
                lambda_b = 0.20;
                description = `From table: F ≤ 0.5GHz, 200W < P ≤ 300W`;
            } else if (power <= 400) {
                lambda_b = 0.36;
                description = `From table: F ≤ 0.5GHz, 300W < P ≤ 400W`;
            } else if (power <= 500) {
                lambda_b = 0.62;
                description = `From table: F ≤ 0.5GHz, 400W < P ≤ 500W`;
            } else {
                lambda_b = 1.1;
                description = `From table: F ≤ 0.5GHz, P > 500W`;
            }
        } else if (frequency <= 1) {
            if (power <= 1.0) {
                lambda_b = 0.046;
                description = `From table: 0.5GHz < F ≤ 1GHz, P ≤ 1.0W`;
            } else if (power <= 5.0) {
                lambda_b = 0.047;
                description = `From table: 0.5GHz < F ≤ 1GHz, 1.0W < P ≤ 5.0W`;
            } else if (power <= 10) {
                lambda_b = 0.048;
                description = `From table: 0.5GHz < F ≤ 1GHz, 5.0W < P ≤ 10W`;
            } else if (power <= 50) {
                lambda_b = 0.060;
                description = `From table: 0.5GHz < F ≤ 1GHz, 10W < P ≤ 50W`;
            } else if (power <= 100) {
                lambda_b = 0.080;
                description = `From table: 0.5GHz < F ≤ 1GHz, 50W < P ≤ 100W`;
            } else if (power <= 200) {
                lambda_b = 0.14;
                description = `From table: 0.5GHz < F ≤ 1GHz, 100W < P ≤ 200W`;
            } else if (power <= 300) {
                lambda_b = 0.24;
                description = `From table: 0.5GHz < F ≤ 1GHz, 200W < P ≤ 300W`;
            } else if (power <= 400) {
                lambda_b = 0.42;
                description = `From table: 0.5GHz < F ≤ 1GHz, 300W < P ≤ 400W`;
            } else if (power <= 500) {
                lambda_b = 0.74;
                description = `From table: 0.5GHz < F ≤ 1GHz, 400W < P ≤ 500W`;
            } else if (power <= 600) {
                lambda_b = 1.3;
                description = `From table: 0.5GHz < F ≤ 1GHz, 500W < P ≤ 600W`;
            } else {
                lambda_b = 1.3;
                description = `From table: 0.5GHz < F ≤ 1GHz, P > 600W`;
            }
        } else if (frequency <= 2) {
            if (power <= 1.0) {
                lambda_b = 0.065;
                description = `From table: 1GHz < F ≤ 2GHz, P ≤ 1.0W`;
            } else if (power <= 5.0) {
                lambda_b = 0.067;
                description = `From table: 1GHz < F ≤ 2GHz, 1.0W < P ≤ 5.0W`;
            } else if (power <= 10) {
                lambda_b = 0.069;
                description = `From table: 1GHz < F ≤ 2GHz, 5.0W < P ≤ 10W`;
            } else if (power <= 50) {
                lambda_b = 0.086;
                description = `From table: 1GHz < F ≤ 2GHz, 10W < P ≤ 50W`;
            } else if (power <= 100) {
                lambda_b = 0.11;
                description = `From table: 1GHz < F ≤ 2GHz, 50W < P ≤ 100W`;
            } else if (power <= 200) {
                lambda_b = 0.20;
                description = `From table: 1GHz < F ≤ 2GHz, 100W < P ≤ 200W`;
            } else if (power <= 300) {
                lambda_b = 0.35;
                description = `From table: 1GHz < F ≤ 2GHz, 200W < P ≤ 300W`;
            } else {
                lambda_b = 0.35;
                description = `From table: 1GHz < F ≤ 2GHz, P > 300W`;
            }
        } else if (frequency <= 3) {
            if (power <= 1.0) {
                lambda_b = 0.093;
                description = `From table: 2GHz < F ≤ 3GHz, P ≤ 1.0W`;
            } else if (power <= 5.0) {
                lambda_b = 0.095;
                description = `From table: 2GHz < F ≤ 3GHz, 1.0W < P ≤ 5.0W`;
            } else if (power <= 10) {
                lambda_b = 0.098;
                description = `From table: 2GHz < F ≤ 3GHz, 5.0W < P ≤ 10W`;
            } else if (power <= 50) {
                lambda_b = 0.12;
                description = `From table: 2GHz < F ≤ 3GHz, 10W < P ≤ 50W`;
            } else if (power <= 100) {
                lambda_b = 0.16;
                description = `From table: 2GHz < F ≤ 3GHz, 50W < P ≤ 100W`;
            } else if (power <= 200) {
                lambda_b = 0.28;
                description = `From table: 2GHz < F ≤ 3GHz, 100W < P ≤ 200W`;
            } else {
                lambda_b = 0.28;
                description = `From table: 2GHz < F ≤ 3GHz, P > 200W`;
            }
        } else if (frequency <= 4) {
            if (power <= 1.0) {
                lambda_b = 0.13;
                description = `From table: 3GHz < F ≤ 4GHz, P ≤ 1.0W`;
            } else if (power <= 5.0) {
                lambda_b = 0.14;
                description = `From table: 3GHz < F ≤ 4GHz, 1.0W < P ≤ 5.0W`;
            } else if (power <= 10) {
                lambda_b = 0.14;
                description = `From table: 3GHz < F ≤ 4GHz, 5.0W < P ≤ 10W`;
            } else if (power <= 50) {
                lambda_b = 0.17;
                description = `From table: 3GHz < F ≤ 4GHz, 10W < P ≤ 50W`;
            } else {
                lambda_b = 0.23;
                description = `From table: 3GHz < F ≤ 4GHz, P > 50W`;
            }
        } else if (frequency <= 5) {
            if (power <= 1.0) {
                lambda_b = 0.19;
                description = `From table: 4GHz < F ≤ 5GHz, P ≤ 1.0W`;
            } else if (power <= 5.0) {
                lambda_b = 0.19;
                description = `From table: 4GHz < F ≤ 5GHz, 1.0W < P ≤ 5.0W`;
            } else if (power <= 10) {
                lambda_b = 0.20;
                description = `From table: 4GHz < F ≤ 5GHz, 5.0W < P ≤ 10W`;
            } else if (power <= 50) {
                lambda_b = 0.25;
                description = `From table: 4GHz < F ≤ 5GHz, 10W < P ≤ 50W`;
            } else {
                // For frequencies > 4GHz and power outside table range, use the formula
                lambda_b = 0.032 * Math.exp(354 * frequency + 0.00558 * power);
                description = `Calculated from formula: 0.032 * exp(354*${frequency} + 0.00558*${power})`;
            }
        } else {
            // For frequencies > 5GHz, always use the formula
            const exponentValue = 354 * frequency + 0.00558 * power;
            // Cap the exponent to prevent extremely large values
            const cappedExponent = Math.min(exponentValue, 10); // Adjust this cap as needed
            lambda_b = 0.032 * Math.exp(cappedExponent);
            lambda_b = Math.min(lambda_b, 1000); // Cap at 1000 failures/10^6 hours
            description = `Calculated from formula (capped): 0.032 * exp(${cappedExponent})`;

        }

        calculationDetails.push({
            name: 'Base Failure Rate (λb)',
            value: lambda_b.toFixed(6),
            description: description
        });

        // Temperature factor
        const pi_T = getHighPowerHighFreqTempFactor(
            parseFloat(formData.junctionTempHP),
            parseFloat(formData.voltageRatio),
            formData.metalizationType
        );
        calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T?.toFixed(4) });
        // Application factor
        let pi_A = 1;
        let appFactorDescription = '';

        if (formData.applicationType) {
            // Use dropdown value if selected
            const appFactor = appFactors.find(a => a.name === formData.applicationType);
            pi_A = appFactor ? appFactor.pi_A : 1.0;
            appFactorDescription = `Selected application: ${formData.applicationType} (πA = ${pi_A})`;
        } else if (formData.dutyCycle) {  // Changed from appFactorInput to dutyCycle
            // Calculate from manual input if provided
            const dutyFactor = parseFloat(formData.dutyCycle) || 0;
            // Calculate πA based on duty cycle using linear interpolation
            if (dutyFactor === 0) {
                // CW operation
                pi_A = 7.6;
                appFactorDescription = `Continuous Wave (CW) operation: πA = ${pi_A}`;
            } else if (dutyFactor <= 1) {
                pi_A = 0.48;
                appFactorDescription = `Pulsed ≤ 1% duty cycle: πA = ${pi_A}`;
            } else if (dutyFactor <= 5) {
                pi_A = 0.48 + (0.70 - 0.48) * (dutyFactor - 1) / (5 - 1);
                appFactorDescription = `Pulsed ${dutyFactor}% duty cycle (interpolated between 1% and 5%): πA = ${pi_A.toFixed(4)}`;
            } else if (dutyFactor <= 10) {
                pi_A = 0.70 + (1.0 - 0.70) * (dutyFactor - 5) / (10 - 5);
                appFactorDescription = `Pulsed ${dutyFactor}% duty cycle (interpolated between 5% and 10%): πA = ${pi_A.toFixed(4)}`;
            } else if (dutyFactor <= 15) {
                pi_A = 1.0 + (1.3 - 1.0) * (dutyFactor - 10) / (15 - 10);
                appFactorDescription = `Pulsed ${dutyFactor}% duty cycle (interpolated between 10% and 15%): πA = ${pi_A.toFixed(4)}`;
            } else if (dutyFactor <= 20) {
                pi_A = 1.3 + (1.6 - 1.3) * (dutyFactor - 15) / (20 - 15);
                appFactorDescription = `Pulsed ${dutyFactor}% duty cycle (interpolated between 15% and 20%): πA = ${pi_A.toFixed(4)}`;
            } else if (dutyFactor <= 25) {
                pi_A = 1.6 + (1.9 - 1.6) * (dutyFactor - 20) / (25 - 20);
                appFactorDescription = `Pulsed ${dutyFactor}% duty cycle (interpolated between 20% and 25%): πA = ${pi_A.toFixed(4)}`;
            } else if (dutyFactor <= 30) {
                pi_A = 1.9 + (2.2 - 1.9) * (dutyFactor - 25) / (30 - 25);
                appFactorDescription = `Pulsed ${dutyFactor}% duty cycle (interpolated between 25% and 30%): πA = ${pi_A.toFixed(4)}`;
            } else {
                pi_A = 2.2;
                appFactorDescription = `Pulsed ≥ 30% duty cycle: πA = ${pi_A}`;
            }

            console.log('Calculated πA:', pi_A);
        } else {
            pi_A = 1.0;
            appFactorDescription = "No application type selected, using default πA = 1.0";
        }

        calculationDetails.push({
            name: 'Application Factor (πA)',
            value: pi_A.toFixed(4),
            description: appFactorDescription
        });

        // Quality factor (specific to this component type)
        const qualityFactorsHP = [
            { name: 'JANTXV', pi_Q: 0.50 },
            { name: 'JANTX', pi_Q: 1.0 },
            { name: 'JAN', pi_Q: 2.0 },
            { name: 'Lower', pi_Q: 5.0 }
        ];
        const qualityFactor = qualityFactorsHP.find(q => q.name === formData.quality);
        pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
        calculationDetails[0] = { name: 'Quality Factor (πQ)', value: pi_Q?.toFixed(2) };
        // Environment factor (use existing)
        calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E?.toFixed(2) };
        // calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });

        // Get environment factor
        const envFactor = highpowerEnvironmentFactors.find(e => e.code === formData.environment);
        pi_E = envFactor ? envFactor.pi_E : 1;
        calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };
        // Matching network factor
        const matchFactors = [
            { name: 'Input and Output', pi_M: 1.0 },
            { name: 'Input', pi_M: 2.0 },
            { name: 'None', pi_M: 4.0 }
        ];
        const matchFactor = matchFactors.find(m => m.name === formData.matchingNetwork);
        const pi_M = matchFactor ? matchFactor.pi_M : 1.0;
        calculationDetails.push({ name: 'Matching Network Factor (πM)', value: pi_M?.toFixed(2) });

        // Calculate final failure rate
        lambda_p = lambda_b * pi_T * pi_A * pi_Q * pi_E * pi_M;
        formula = 'λp = λb × πT × πA × πQ × πE × πM';
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


    return (
        <>
            <Row>
                <Col md={4}>
                    <div className="form-group">
                        <label>Frequency (GHz) λb</label>
                        <input
                            type="number"
                            name="frequencyGHz"
                            className="form-control"
                            step="0.1"
                            min="0.1"
                            max="10"
                            value={formData.frequencyGHz}
                            onChange={onInputChange}
                        />
                    </div>
                </Col>
                <Col md={4}>
                    <div className="form-group">
                        <label>Output Power (Watts) λb</label>
                        <input
                            type="number"
                            name="outputPowerWatts"
                            className="form-control"
                            step="1"
                            min="1"
                            max="600"
                            value={formData.outputPowerWatts}
                            onChange={onInputChange}
                        />
                    </div>
                </Col>
                <Col md={4}>
                    <div className="form-group">
                        <label>Junction Temperature (°C)</label>
                        <input
                            type="number"
                            name="junctionTempHP"
                            className="form-control"
                            min="110"
                            max="200"
                            value={formData.junctionTempHP}
                            onChange={onInputChange}
                        />
                    </div>
                </Col>
                <Col md={4}>
                    <div className="form-group">
                        <label>VCE/BVCES Ratio (0-1)</label>
                        <input
                            type="number"
                            name="voltageRatio"
                            className="form-control"
                            step="0.01"
                            min="0"
                            max="1"
                            value={formData.voltageRatio}
                            onChange={onInputChange}
                        />
                    </div>
                </Col>

                <Col md={4}>
                    <div className="form-group">
                        <label>Metalization Type</label>
                        <select
                            name="metalizationType"
                            className="form-control"
                            value={formData.metalizationType}
                            onChange={onInputChange}
                        >
                            <option value="Gold">Gold</option>
                            <option value="Aluminum">Aluminum</option>
                        </select>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="form-group">
                        <label>Application  πA</label>
                        <select
                            name="applicationType"
                            value={formData.applicationType}
                            onChange={onInputChange}
                        >
                            <option value="">Select or enter duty cycle</option>
                            <option value="CW">CW (πA = 7.6)</option>
                            <option value="Pulsed ≤ 1%">Pulsed ≤ 1% (πA = 0.48)</option>
                            <option value="Pulsed 5%">Pulsed 5% (πA = 0.70)</option>
                            <option value="Pulsed 10%">Pulsed 10% (πA = 1.0)</option>
                            <option value="Pulsed 15%">Pulsed 15% (πA = 1.3)</option>
                            <option value="Pulsed 20%">Pulsed 20% (πA = 1.6)</option>
                            <option value="Pulsed 25%">Pulsed 25% (πA = 1.9)</option>
                            <option value="Pulsed ≥ 30%">Pulsed ≥ 30% (πA = 2.2)</option>
                        </select>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="form-group">
                        <label>Duty Cycle (%)  πA</label>
                        <input
                            type="number"
                            name="dutyCycle"
                            className="form-control"
                            min="0"
                            max="100"
                            step="1"
                            value={formData.dutyCycle || ''}
                            onChange={onInputChange}
                            disabled={!!formData.applicationType} // Disable if dropdown value is selected
                        />
                    </div>
                </Col>
                <Col md={4}>
                    <div className="form-group">
                        <label>Matching Network</label>
                        <select
                            name="matchingNetwork"
                            value={formData.matchingNetwork}
                            onChange={onInputChange}
                        >
                            <option value="Input and Output">Input and Output Matched (πM = 1.0)</option>
                            <option value="Input">Input Matched Only (πM = 2.0)</option>
                            <option value="None">No Matching (πM = 4.0)</option>
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
                            {highpowerEnvironmentFactors.map(factor => (
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
                            value={formData.quality}
                            onChange={onInputChange}
                        >
                            <option value="JANTXV">JANTXV (πQ = 0.50)</option>
                            <option value="JANTX">JANTX (πQ = 1.0)</option>
                            <option value="JAN">JAN (πQ = 2.0)</option>
                            <option value="Lower">Lower (πQ = 5.0)</option>
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
            <br />
            {results && (
                <div className="Predicted-Failure" style={{ width: "50%" }}>
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
export default TransistorsHighPowerHoghFreqBipolar;