
import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import {
    calculatePiT,
} from '../../Calculation.js';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
import Box from '@mui/material/Box';
import { Alert, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import '../../Microcircuits.css'
import MaterialTable from "material-table";
import { tableIcons } from "../../../core/TableIcons.js";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@material-ui/core";


const HybridVhsic = ({ onCalculate }) => {
    const [showCalculations, setShowCalculations] = useState(false);
    const [numberOfPins, setNumberOfPins] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentComponent, setCurrentComponent] = useState({
        type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
        temperature: 25,
        devices: "bipolarData",
        complexFailure: "digital",
        environment: '',
        data: "microprocessorData",
        quality: 'M',
        quantity: 0,
        microprocessorData: "",
        gateCount: 1000,
        technology: '',
        complexity: '',
        application: '',
        packageType: '',
        pinCount: '',
        yearsInProduction: '',
        quality: '',

        memoryTemperature: 45,
        techTemperatureB2: 25,
        techTemperatureB1: 25,
        memorySizeB1: 1024,
        memorySizeB2: 1024,
        memoryTech: "Flotox",
        technology: "Digital MOS",
        B1: 0.79,
        B2: 0,
        calculatedPiT: 1.2,


        piL: 1.0,
        // piQ: 1.0,
        basePiT: 0.1,
        calculatedPiT: null
    });
    const partTypes = [
        { value: 'Logic', label: 'Logic and Custom Gate Array (λd = 0.16)' },
        { value: 'Memory', label: 'Memory (λd = 0.24)' }
    ];
    const eccOptions = [
        { value: 'none', label: 'No On-Chip ECC', factor: 1.0 },
        { value: 'hamming', label: 'On-Chip Hamming Code', factor: 0.72 },
        { value: 'redundant', label: 'Two-Needs-One Redundant Cell Approach', factor: 0.68 }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentComponent(prev => ({
            ...prev,
            [name]: name === 'temperature' || name === 'Tj' || name === 'gateCount' || name === 'quantity'
                ? parseFloat(value)
                : value
        }));
    };
    const qualityFactor = () => {
        return currentComponent.piQ;
    };
    const getManufacturingFactor = () => {
        const selected = manufacturingProcessTypes?.find(p => p.value === inputs.manufacturingProcess);
        if (!selected) return 2.0; // Default to non-QML/non-QPL factor
        return selected.factor;
    };
    const getPackageFactor = () => {
        const selected = packageTypes?.find(p => p.value === inputs.packageType);
        if (!selected) return 0;
        return inputs.packageHermeticity === 'Hermetic' ? selected.hermetic : selected.nonhermetic;
    };
    const getDieBaseRate = () => {
        return inputs.partType === 'Logic' ? 0.16 : 0.24;
    };
    const getDieComplexityFactor = () => {
        const A = inputs.dieArea; // in cm²
        const Xs = inputs.featureSize; // in microns

        // Lookup table values (simplified from the image)
        const lookupTable = {
            '0.80': { max0_4: 8.0, max7: 14, max1_0: 19, max2_0: 38, max3_0: 58 },
            '1.00': { max0_4: 5.2, max7: 8.9, max1_0: 13, max2_0: 25, max3_0: 37 },
            '1.25': { max0_4: 3.5, max7: 5.8, max1_0: 8.2, max2_0: 16, max3_0: 24 }
        };

        // Check if we have a direct match in the lookup table
        const featureSizeKey = Xs.toString();
        if (lookupTable[featureSizeKey]) {
            const values = lookupTable[featureSizeKey];

            if (A <= 0.4) return values.max0_4;
            if (A <= 7) return values.max7;
            if (A <= 1.0) return values.max1_0;
            if (A <= 2.0) return values.max2_0;
            if (A <= 3.0) return values.max3_0;
        }

        // Fall back to the formula if no match in table
        return (A / 0.21) * Math.pow(2 / Xs, 2) * 0.64 + 0.36;
    };

    const packageRates = [
        {
            type: 'Hermetic: DIPs w/Solder or Weld Seal, PGA, SMT',
            formula: '2.8e-4 * (Np)^1.08',
            rates: [
                { pins: 3, rate: 0.00092 },
                { pins: 4, rate: 0.0013 },
                { pins: 6, rate: 0.0019 },
                { pins: 8, rate: 0.0026 },
                { pins: 10, rate: 0.0034 },
                { pins: 12, rate: 0.0041 },
                { pins: 14, rate: 0.0048 },
                { pins: 16, rate: 0.0056 },
                { pins: 18, rate: 0.0064 },
                { pins: 22, rate: 0.0079 },
                { pins: 24, rate: 0.0087 },
                { pins: 28, rate: 0.010 },
                { pins: 36, rate: 0.013 },
                { pins: 40, rate: 0.015 },
                { pins: 64, rate: 0.025 },
                { pins: 80, rate: 0.032 },
                { pins: 128, rate: 0.053 },
                { pins: 180, rate: 0.076 },
                { pins: 224, rate: 0.097 }
            ]
        },
        {
            type: 'DIPs with Glass Seal',
            formula: '9.0e-5 * (Np)^1.51',
            rates: [
                { pins: 3, rate: 0.00047 },
                { pins: 4, rate: 0.00073 },
                { pins: 6, rate: 0.0013 },
                { pins: 8, rate: 0.0021 },
                { pins: 10, rate: 0.0029 },
                { pins: 12, rate: 0.0038 },
                { pins: 14, rate: 0.0048 },
                { pins: 16, rate: 0.0059 },
                { pins: 18, rate: 0.0071 },
                { pins: 22, rate: 0.0096 },
                { pins: 24, rate: 0.011 },
                { pins: 28, rate: 0.014 },
                { pins: 36, rate: 0.020 },
                { pins: 40, rate: 0.024 },
                { pins: 64, rate: 0.048 }
            ]
        },
        {
            type: 'Flatpacks with Axial Leads on 50 Mil Centers',
            formula: '3.0e-5 * (Np)^1.82',
            rates: [
                { pins: 3, rate: 0.00022 },
                { pins: 4, rate: 0.00037 },
                { pins: 6, rate: 0.00078 },
                { pins: 8, rate: 0.0013 },
                { pins: 10, rate: 0.0020 },
                { pins: 12, rate: 0.0028 },
                { pins: 14, rate: 0.0037 },
                { pins: 16, rate: 0.0047 },
                { pins: 18, rate: 0.0059 },
                { pins: 22, rate: 0.0083 },
                { pins: 24, rate: 0.0098 }
            ]
        },
        {
            type: 'Cans',
            formula: '3.0e-5 * (Np)^2.01',
            rates: [
                { pins: 3, rate: 0.00027 },
                { pins: 4, rate: 0.00049 },
                { pins: 6, rate: 0.0011 },
                { pins: 8, rate: 0.0020 },
                { pins: 10, rate: 0.0031 },
                { pins: 12, rate: 0.0044 },
                { pins: 14, rate: 0.0060 },
                { pins: 16, rate: 0.0079 }
            ]
        },
        {
            type: 'Nonhermetic: DIPs, PGA, SMT',
            formula: '3.6e-4 * (Np)^1.08',
            rates: [
                { pins: 3, rate: 0.0012 },
                { pins: 4, rate: 0.0016 },
                { pins: 6, rate: 0.0025 },
                { pins: 8, rate: 0.0034 },
                { pins: 10, rate: 0.0043 },
                { pins: 12, rate: 0.0053 },
                { pins: 14, rate: 0.0062 },
                { pins: 16, rate: 0.0072 },
                { pins: 18, rate: 0.0082 },
                { pins: 22, rate: 0.010 },
                { pins: 24, rate: 0.011 },
                { pins: 28, rate: 0.013 },
                { pins: 36, rate: 0.017 },
                { pins: 40, rate: 0.019 },
                { pins: 64, rate: 0.032 },
                { pins: 80, rate: 0.041 },
                { pins: 128, rate: 0.068 },
                { pins: 180, rate: 0.098 },
                { pins: 224, rate: 0.12 }
            ]
        }
    ];

    const calculateLambdaBP = () => {
        return 0.0022 + (1.72 * Math.pow(10, -5) * numberOfPins);
    };
    const getESDFailureRate = () => {
        const selected = esdLevels?.find(e => e.value === inputs.esdSusceptibility);
        return selected ? selected.rate : 0;
    };
    const esdLevels = [
        { value: '0-1000', label: '0-1000V ', rate: 0.065 },
        { value: '1000-2000', label: '1000-2000V ', rate: 0.053 },
        { value: '2000-4000', label: '2000-4000V ', rate: 0.044 },
        { value: '4000-16000', label: '4000-16000V ', rate: 0.029 },
        { value: '16000+', label: '>16000V ', rate: 0.0027 }
    ];
    const manufacturingProcessTypes = [
        { value: 'QML', factor: 0.55 },
        { value: 'QPL', factor: 0.55 },
        { value: 'Non-QML', factor: 2.0 },
        { value: 'Non-QPL', factor: 2.0 }
    ];
    const getPackageBaseRate = () => {
        return 0.0022 + (1.72e-5 * inputs.pinCount);
    };
    const packageTypes = [
        {
            value: 'DIP',
            label: 'DIP',
            hermetic: 1.0,
            nonhermetic: 1.3
        },
        {
            value: 'PGA',
            label: 'Pin Grid Array (πprT = 2.2/2.9)',
            hermetic: 2.2,
            nonhermetic: 2.9
        },
        {
            value: 'SMT',
            label: 'Surface Mount (πprT = 4.7/6.1)',
            hermetic: 4.7,
            nonhermetic: 6.1
        }
    ];
    // Application factors (πA)
    const dieComplexityRates = [
        {
            type: ' MOS-ROM',
            rates: [
                { size: 'Up to 16K', mos: 0.00065 },
                { size: '16K < B ≤ 64K', mos: 0.0013 },
                { size: '64K < B ≤ 256K', mos: 0.0026 },
                { size: '256K < B ≤ 1M', mos: 0.0052 }
            ]
        },
        {
            type: 'MOS-PROM/UVEPROM/EEPROM/EAPROM',
            rates: [
                { size: 'Up to 16K', mos: 0.00085 },
                { size: '16K < B ≤ 64K', mos: 0.0017 },
                { size: '64K < B ≤ 256K', mos: 0.0034 },
                { size: '256K < B ≤ 1M', mos: 0.0068 }
            ]
        },
        {
            type: 'MOS-DRAM',
            rates: [
                { size: 'Up to 16K', mos: 0.0013 },
                { size: '16K < B ≤ 64K', mos: 0.0025 },
                { size: '64K < B ≤ 256K', mos: 0.0050 },
                { size: '256K < B ≤ 1M', mos: 0.010 }
            ]
        },
        {
            type: 'MOS-SRAM (MOS & BIMOS)',
            rates: [
                { size: 'Up to 16K', mos: 0.0078 },
                { size: '16K < B ≤ 64K', mos: 0.016 },
                { size: '64K < B ≤ 256K', mos: 0.031 },
                { size: '256K < B ≤ 1M', mos: 0.062 }
            ]
        },

        {
            type: 'Bipolar-(ROM & PROM)',
            rates: [
                { size: 'Up to 16K', mos: 0.0094 },
                { size: '16K < B ≤ 64K', mos: 0.019 },
                { size: '64K < B ≤ 256K', mos: 0.038 },
                { size: '256K < B ≤ 1M', mos: 0.075 }
            ]
        },
        {
            type: 'Bipolar-(SRAM)',
            rates: [
                { size: 'Up to 16K', mos: 0.0052 },
                { size: '16K < B ≤ 64K', mos: 0.011 },
                { size: '64K < B ≤ 256K', mos: 0.021 },
                { size: '256K < B ≤ 1M', mos: 0.042 }
            ]
        }

    ];
    // A1 Factors for λCycle Calculation
    const a1Factors = [
        { cycles: 'Up to 100', flotox: 0.00070, texturedPoly: 0.0097 },
        { cycles: '100 < C ≤ 200', flotox: 0.0014, texturedPoly: 0.014 },
        { cycles: '200 < C ≤ 500', flotox: 0.0034, texturedPoly: 0.023 },
        { cycles: '500 < C ≤ 1K', flotox: 0.0068, texturedPoly: 0.033 },
        { cycles: '1K < C ≤ 3K', flotox: 0.020, texturedPoly: 0.061 },
        { cycles: '3K < C ≤ 7K', flotox: 0.049, texturedPoly: 0.14 },
        { cycles: '7K < C ≤ 15K', flotox: 0.10, texturedPoly: 0.30 },
        { cycles: '15K < C ≤ 20K', flotox: 0.14, texturedPoly: 0.30 },
        { cycles: '20K < C ≤ 30K', flotox: 0.20, texturedPoly: 0.30 },
        { cycles: '30K < C ≤ 100K', flotox: 0.68, texturedPoly: 0.30 },
        { cycles: '100K < C ≤ 200K', flotox: 1.3, texturedPoly: 0.30 },
        { cycles: '200K < C ≤ 400K', flotox: 2.7, texturedPoly: 0.30 },
        { cycles: '400K < C ≤ 500K', flotox: 3.4, texturedPoly: 0.30 }
    ];
    // A2 Factors for λCycle Calculation
    const a2Factors = [
        { cycles: 'Up to 300K', value: 0 },
        { cycles: '300K < C ≤ 400K', value: 1.1 },
        { cycles: '400K < C ≤ 500K', value: 2.3 }
    ];


    // Package Failure Rate (C2) data
    const [inputs, setInputs] = useState({
        memoryType: dieComplexityRates[0],
        memorySize: dieComplexityRates[0].rates[0],
        technology: 'MOS',
        packageType: packageRates[0],
        pinCount: 3,
        eepromType: 'Flotox',
        programmingCycles: a1Factors[0],
        a2Factor: a2Factors[0],
        eccOption: eccOptions[0],
        quality: qualityFactor,
        // environment: getEnvironmentalOptions('AIA'),
        systemLifeHours: 10000,
        junctionTemp: 35,
        partType: 'Logic',
        manufacturingProcess: 'QML',
        packageType: 'DIP',
        packageHermeticity: 'Hermetic',
        featureSize: 1.0,
        dieArea: 0.5,
        pinCount: 24,
        esdSusceptibility: '0-1000'
    });

    const calculateVhsicFailureRate = () => {
        try {
            // Calculate each component
            const λBD = getDieBaseRate();
            const πMFG = getManufacturingFactor();
            const πprT = getPackageFactor();
            // console.log("πprT:",πprT)
            const πCD = getDieComplexityFactor();
            const λBP = getPackageBaseRate();
            // console.log("λpkg:",λpkg)
            const λEOS = calculateLambdaBP();
            const πE = currentComponent.piE;
            // const πE = getEnvironmentFactor()?.toFixed(2)
            console.log("piE", πE)

            const πT = calculatePiT(currentComponent.technology, currentComponent.temperature);
            const πQ = qualityFactor();
            // console.log("πQ:",πQ)

            // Calculate final failure rate
            const dieContribution = λBD * πMFG * πT * πCD;

            const packageContribution = λBP * πprT * πE * πQ;

            const eosContribution = λEOS;
            const totalFailureRate = dieContribution + packageContribution + eosContribution;


            setResult({
                value: totalFailureRate?.toFixed(6),
                parameters: {
                    λBD: λBD?.toFixed(4),
                    πMFG: πMFG?.toFixed(4),
                    πprT: πprT?.toFixed(4),
                    πCD: πCD?.toFixed(4),
                    λBP: λBP?.toFixed(6),
                    λEOS: λEOS?.toFixed(6),
                    πE: πE?.toFixed(4),
                    πT: πT?.toFixed(4),
                    πQ: πQ?.toFixed(4)
                }
            });
            setError(null);
            if (onCalculate) {
                onCalculate(totalFailureRate * quantity);
            }
            console.log("onCalculate124..",totalFailureRate * quantity)
        } catch (err) {
            setError(err.message);
            setResult(null);
        }
    };
    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '38px',
            height: '38px',
            fontSize: '14px',
            borderColor: '#ced4da',
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '38px',
            padding: '0 12px',
        }),
        input: (provided) => ({
            ...provided,
            margin: '0px',
            padding: '0px',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '38px',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: '8px',
        }),
        clearIndicator: (provided) => ({
            ...provided,
            padding: '8px',
        }),
        option: (provided) => ({
            ...provided,
            padding: '8px 12px',
            fontSize: '14px',
        }),
        menu: (provided) => ({
            ...provided,
            marginTop: '2px',
            zIndex: 9999,
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '150px',
            overflowY: 'auto',
        }),
    };

    return (
        <>

            <Col md={4}>
                <div className="form-group">
                    <label>Part Type (λ<sub>BD</sub>):</label>
                    <Select
                        styles={customStyles}
                        value={partTypes?.find(t => t.value === inputs.partType)}
                        onChange={(selectedOption) => {
                            setInputs(prev => ({
                                ...prev,
                                partType: selectedOption.value
                            }));
                        }}
                        options={partTypes}
                    />
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>ESD Susceptibility (V<sub>TH</sub>) (λ<sub>EOS</sub>):</label>
                    <Select
                        styles={customStyles}
                        value={esdLevels?.find(e => e.value === inputs.esdSusceptibility)}
                        onChange={(selectedOption) => {
                            setInputs(prev => ({
                                ...prev,
                                esdSusceptibility: selectedOption.value
                            }));
                        }}
                        options={esdLevels}
                    />
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Number of Package Pins (λ<sub>BP</sub>):</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={numberOfPins}
                        onChange={(e) => setNumberOfPins(parseInt(e.target.value) || 0)}
                        className="form-control"
                    />
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Environment Factor (π<sub>E</sub>):</label>
                    <Select
                        styles={customStyles}

                        onChange={(selectedOption) => {
                            setCurrentComponent(prev => ({
                                ...prev,
                                environment: selectedOption.value,
                                piE: selectedOption.piE
                            }));
                        }}
                        options={[
                            { value: "GB", label: "GB - Ground Benign (πE = 0.50)", piE: 0.50 },
                            { value: "GF", label: "GF - Ground Fixed (πE = 2.0)", piE: 2.0 },
                            { value: "GM", label: "GM - Ground Mobile (πE = 4.0)", piE: 4.0 },
                            { value: "NS", label: "NS - Naval Sheltered (πE = 4.0)", piE: 4.0 },
                            { value: "NU", label: "NU - Naval Unsheltered (πE = 6.0)", piE: 6.0 },
                            { value: "AIC", label: "AIC - Airborne Inhabited Cargo (πE = 4.0)", piE: 4.0 },
                            { value: "AIF", label: "AIF - Airborne Inhabited Fighter (πE = 5.0)", piE: 5.0 },
                            { value: "AUC", label: "AUC - Airborne Uninhabited Cargo (πE = 5.0)", piE: 5.0 },
                            { value: "AUF", label: "AUF - Airborne Uninhabited Fighter (πE = 8.0)", piE: 8.0 },
                            { value: "ARW", label: "ARW - Airborne Rotary Wing (πE = 8.0)", piE: 8.0 },
                            { value: "SF", label: "SF - Space Flight (πE = 0.50)", piE: 0.50 },
                            { value: "MF", label: "MF - Missile Flight (πE = 5.0)", piE: 5.0 },
                            { value: "ML", label: "ML - Missile Launch (πE = 12)", piE: 12 },
                            { value: "CL", label: "CL - Cannon Launch (πE = 220)", piE: 220 }
                        ]}
                    />
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Quality Factor (π<sub>Q</sub>):</label>
                    <Select
                        style={customStyles}
                        name="qualityFactor"
                        placeholder="Select Quality Class"
                        onChange={(selectedOption) => {

                            setCurrentComponent({
                                ...currentComponent,
                                quality: selectedOption.value,
                                piQ: selectedOption.piQ
                            });
                        }}
                        options={[

                            {
                                value: "MIL_M_38510_ClassB",
                                label: "Class B (MIL-M-38510, Class B)",
                                piQ: 1.0,
                                description: "Procured in full accordance with MIL-M-38510, Class B requirements."
                            },
                            {
                                value: "MIL_I_38535_ClassQ",
                                label: "Class B (MIL-I-38535, Class Q)",
                                piQ: 1.0,
                                description: "Procured in full accordance with MIL-I-38535 (Class Q)."
                            },
                            {
                                value: "MIL_H_38534_ClassB_Hybrid",
                                label: "Class B Hybrid (MIL-H-38534, Level H)",
                                piQ: 1.0,
                                description: "Hybrids procured to Class B (Quality Level H) of MIL-H-38534."
                            },

                        ]}
                    />
                </div>
            </Col>

            <Col md={4}>
                <div className="form-group">
                    <label>Package Type for (π<sub>prT</sub>):</label>
                    <Select
                        styles={customStyles}
                        value={packageTypes?.find(p => p.value === inputs.packageType)}
                        onChange={(selectedOption) => {
                            setInputs(prev => ({
                                ...prev,
                                packageType: selectedOption.value
                            }));
                        }}
                        options={packageTypes}
                    />
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Technology Type for (π<sub>T</sub>):</label>
                    <Select
                        styles={customStyles}
                        name="technology"
                        placeholder="Select Technology Type"
                        onChange={(selectedOption) => {
                            setCurrentComponent({
                                ...currentComponent,
                                technology: selectedOption.value,
                                technologyType: selectedOption.label,
                                // Reset calculatedPiT when technology changes
                                calculatedPiT: calculatePiT(
                                    selectedOption.value,
                                    currentComponent.temperature || 25, // Default to 25°C if not set
                                    selectedOption.Ea // Pass the correct Ea for the technology
                                )
                            });
                        }}
                        options={[
                            {
                                value: "TTL,ASTTL,CML",
                                label: "TTL/ASTTL/CML (Bipolar Logic)",
                                description: "Standard TTL, Advanced Schottky TTL, and Current Mode Logic",
                                Ea: 0.4
                            },
                            {
                                value: "F,LTTL,STTL",
                                label: "F/LTTL/STTL (Fast/Low-Power TTL)",
                                description: "Fast, Low-Power, and Schottky TTL variants",
                                Ea: 0.45
                            },
                            {
                                value: "BiCMOS",
                                label: "BiCMOS (Bipolar CMOS Hybrid)",
                                description: "Combines bipolar and CMOS technologies",
                                Ea: 0.5
                            },
                            {
                                value: "III,f¹,ISL",
                                label: "III/f¹/ISL (Advanced Silicon)",
                                description: "High-speed/radiation-hardened silicon logic",
                                Ea: 0.6
                            },
                            {
                                value: "Digital MOS",
                                label: "Digital MOS (CMOS, VHSIC)",
                                description: "CMOS and VHSIC digital technologies",
                                Ea: 0.35
                            },
                            {
                                value: "Linear",
                                label: "Linear Analog (Bipolar/MOS)",
                                description: "Linear analog circuits (op-amps, regulators)",
                                Ea: 0.65
                            },
                            {
                                value: "Memories",
                                label: "Memories (Bipolar/MOS)",
                                description: "Memory chips (RAM, ROM, etc.)",
                                Ea: 0.6
                            },
                            {
                                value: "GaAs MMIC",
                                label: "GaAs MMIC (RF/Microwave)",
                                description: "Gallium Arsenide microwave/RF components",
                                Ea: 1.5
                            },
                            {
                                value: "GaAs Digital",
                                label: "GaAs Digital (High-Speed Logic)",
                                description: "Gallium Arsenide digital logic",
                                Ea: 1.4
                            }
                        ]}
                    />
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Junction Temperature (°C) (π<sub>T</sub>):</label>
                    <input
                        className="form-group"
                        style={{
                            width: "100%",
                            padding: "0.375rem 0.75rem",
                            fontSize: "1rem",
                            lineHeight: "1.5",
                            color: "#495057",
                            backgroundColor: "#fff",
                            border: "1px solid #ced4da",
                            borderRadius: "0.25rem"
                        }}
                        type="number"
                        name="temperature"
                        min="-40"
                        max="175"
                        value={currentComponent.temperature}
                        onChange={handleInputChange}
                    />
                </div>
            </Col>

            <Col md={4}>
                <div className="form-group">
                    <label>Feature Size (X<sub>S</sub>) microns (π<sub>CD</sub>):</label>
                    <input
                        type="number"
                        min="0.1"
                        step="0.01"
                        value={inputs.featureSize}
                        onChange={(e) => {
                            setInputs(prev => ({
                                ...prev,
                                featureSize: parseFloat(e.target.value)
                            }));
                        }}
                        className="form-control"
                    />
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Die Area (A) in cm² for (π<sub>CD</sub>):</label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={inputs.dieArea}
                        onChange={(e) => {
                            setInputs(prev => ({
                                ...prev,
                                dieArea: parseFloat(e.target.value)
                            }));
                        }}
                        className={`form-control ${inputs.dieArea && (inputs.dieArea < 0.4 || inputs.dieArea > 3.0)}`}
                    />
                    {inputs.dieArea && (inputs.dieArea < 0.4 || inputs.dieArea > 3.0) && (
                        <div className="invalid-feedback">
                            Die Area (A) must be between 0.4 cm² and 3.0 cm²
                        </div>
                    )}
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Package Hermeticity for (π<sub>prT</sub>):</label>
                    <Select
                        styles={customStyles}
                        value={{
                            value: inputs.packageHermeticity,
                            label: inputs.packageHermeticity === 'Hermetic' ? 'Hermetic' : 'Nonhermetic'
                        }}
                        onChange={(selectedOption) => {
                            setInputs(prev => ({
                                ...prev,
                                packageHermeticity: selectedOption.value
                            }));
                        }}
                        options={[
                            { value: 'Hermetic', label: 'Hermetic' },
                            { value: 'Nonhermetic', label: 'Nonhermetic' }
                        ]}
                    />
                </div>
            </Col>
            <Col md={4}>
                <div className="form-group">
                    <label>Manufacturing Process (π<sub>MFG</sub>):</label>
                    <Select
                        styles={customStyles}
                        value={{
                            value: inputs.manufacturingProcess,
                            label: inputs.manufacturingProcess === 'QML' ? 'QML' :
                                inputs.manufacturingProcess === 'QPL' ? 'QPL' :
                                    inputs.manufacturingProcess === 'Non-QML' ? 'Non-QML' : 'Non-QPL'
                        }}
                        onChange={(selectedOption) => {
                            setInputs(prev => ({
                                ...prev,
                                manufacturingProcess: selectedOption.value
                            }));
                        }}
                        options={[
                            { value: 'QML', label: 'QML' },
                            { value: 'QPL', label: 'QPL' },
                            { value: 'Non-QML', label: 'Non-QML' },
                            { value: 'Non-QPL', label: 'Non-QPL' }
                        ]}
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
            <div className="d-flex justify-content-end">
                <Button
                    onClick={calculateVhsicFailureRate}
                    className="btn"
                >
                    Calculate FR
                </Button>
            </div>


            <div>
                {result && (
                    <>

                        <div className="Predicted-Failure">
                            <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                            <span className="ms-2">{result?.value} failures/10<sup>6</sup> hours</span>
                              <br/>
                            <p className="mb-1">
                                <strong> λ<sub>c</sub> * N<sub>c</sub>:</strong>
                                {result?.value * quantity} failures/10<sup>6</sup> hours
                                {/* {totalSysFailureRate.push(results?.value * quantity)} */}
                                {console.log("CalculateGate123..", result?.value * quantity)}
                            </p>
                        </div>
                    </>
                )}
                {console.log("values...", result?.value)}
                <br />


            </div>


        </>
    )
}
export default HybridVhsic;