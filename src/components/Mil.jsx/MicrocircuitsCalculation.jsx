import React, { useState } from 'react';
import Select from "react-select";
import {
    calculateMicrocircuitsAndMicroprocessorsFailureRate,
    // calculateMemoriesFailureRate,
    calculateSystemMetrics,
    calculatePiT,
    getEnvironmentFactor,
    getFailureRate,
    getQualityFactor,
    calculateGateArrayC1,
    calculateLearningFactor,
    BASE_FAILURE_RATE,
    QUALITY_FACTORS,
    getEnvironmentalOptions,
    getEnvironmentLabel,
    calculateSawDeviceFailureRate

} from './Calculation.js';
import {
    Paper,
    Typography,
    IconButton,
    Tooltip
} from '@material-ui/core';
import { Link } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { Row, Col } from 'react-bootstrap';
import { customStyles } from "./Selector";
import './Microcircuits.css'
import MaterialTable from "material-table";
import { tableIcons } from "../core/TableIcons";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@material-ui/core";
// ... (other imports remain the same)

const MicrocircuitsCalculation = () => {
    const [showCalculations, setShowCalculations] = useState(false);
    const [components, setComponents] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(false)
    const [currentComponent, setCurrentComponent] = useState({
        type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
        temperature: 25,
        devices: "bipolarData",
        complexFailure: "digital",
        environment: 'AIA',
        quality: 'M',
        quantity: 1,
        gateCount: 1000
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentComponent(prev => ({
            ...prev,
            [name]: name === 'temperature' || name === 'Tj' || name === 'gateCount' || name === 'quantity'
                ? parseFloat(value)
                : value
        }));
    };

    // In your ReliabilityCalculator.js, update the addComponent function:

    const componentColumns = [
        {
            title: 'Part Type',
            field: 'type',
            cellStyle: { minWidth: 150 }
        },
        {
            title: <span>C<sub>1</sub></span>,
            field: 'calculationParams.C1',
            render: rowData => rowData.calculationParams.C1?.toFixed(6),
            cellStyle: { textAlign: 'right' }
        },
        {
            title: <span>C<sub>2</sub></span>,
            field: 'calculationParams.C2',
            render: rowData => rowData.calculationParams.C2?.toFixed(6),
            cellStyle: { textAlign: 'right' }
        },
        {
            title: <span>π<sub>L</sub></span>,
            field: 'calculationParams.piL',
            render: rowData => rowData.calculationParams.piL?.toFixed(2),
            cellStyle: { textAlign: 'right' }
        },
        {
            title: <span>π<sub>E</sub></span>,
            field: 'calculationParams.piE',
            render: rowData => rowData.calculationParams.piE?.toFixed(2),
            cellStyle: { textAlign: 'right' }
        },
        {
            title: <span>π<sub>Q</sub></span>,
            field: 'calculationParams.piQ',
            render: rowData => rowData.calculationParams.piQ?.toFixed(2),
            cellStyle: { textAlign: 'right' }
        },
        {
            title: <span>π<sub>T</sub></span>,
            field: 'calculationParams.piT',
            render: rowData => rowData.calculationParams.piT?.toFixed(6),
            cellStyle: { textAlign: 'right' }
        },
        {
            title: 'Failure Rate',
            field: 'totalFailureRate',
            render: rowData => rowData.totalFailureRate?.toFixed(6),

        },
        {
            title: 'Action',
            field: 'actions',
            render: rowData => (
                <Tooltip title="Remove component">
                    <IconButton
                        aria-label="delete"
                        onClick={() => removeComponent(rowData.id)}
                    >
                        <DeleteIcon color="error" />
                    </IconButton>
                </Tooltip>
            ),
            sorting: false,
            filtering: false
        }
    ];

    const tableTheme = createTheme({
        overrides: {
            MuiTableRow: {
                root: {
                    "&:hover": {
                        cursor: "pointer",
                        backgroundColor: "rgba(224, 224, 224, 1) !important",
                    },
                },
            },
        },
    });
    const calculationColumns = [

        {
            title: <span>π<sub>E</sub></span>,
            field: "calculationParams.piE",
            render: rowData => rowData.calculationParams.piE?.toFixed(6),


        },
        {
            title: <span>π<sub>Q</sub></span>,
            field: "calculationParams.piQ",
            render: rowData => rowData.calculationParams.piQ?.toFixed(6),

        },
        {
            title: 'Failure Rate',
            field: 'calculatedFailureRate',
            render: rowData => rowData.calculatedFailureRate?.toFixed(6),

        },

    
    ];



    const addComponent = () => {


        let calculation = {};
        let failureRate = 0;
        let calculationParams = {};

        switch (currentComponent.type) {
            case 'Microcircuits,Gate/Logic Arrays And Microprocessors':
                failureRate = calculateMicrocircuitsAndMicroprocessorsFailureRate(currentComponent);
                calculationParams = {
                    C1: calculateGateArrayC1(currentComponent),
                    C2: getFailureRate(currentComponent.packageType, currentComponent.pinCount),
                    piT: calculatePiT(currentComponent.technology, currentComponent.temperature),
                    piE: getEnvironmentFactor(currentComponent.environment),
                    piQ: getQualityFactor(currentComponent.quality),
                    piL: calculateLearningFactor(currentComponent.yearsInProduction)
                };
                break;


            case 'Microcircuits,Saw Devices':

                failureRate = calculateSawDeviceFailureRate(currentComponent);
                calculationParams = {
                    baseRate: BASE_FAILURE_RATE,
                    piQ: currentComponent.qualityFactor?.value || QUALITY_FACTORS[1].value,
                    piE: getEnvironmentFactor(currentComponent.environment || 'GB'),
                    formula: 'λₚ = Base Rate × πQ × πE'
                }


                break;

            //   case 'Microcircuits,Memories':
            //     failureRate = calculateMemoriesFailureRate(currentComponent);
            //     calculationParams = {
            //       C1: calculateMemoryC1(currentComponent),
            //       C2: getFailureRate(currentComponent.packageType, currentComponent.pinCount),
            //       piT: calculatePiT(currentComponent.technology, currentComponent.temperature),
            //       piE: getEnvironmentFactor(currentComponent.environment),
            //       piQ: getQualityFactor(currentComponent.quality),
            //       piL: calculateLearningFactor(currentComponent.yearsInProduction)
            //     };
            //     break;

            //   case 'Microcircuits,Hybrids':
            //     failureRate = calculateHybridsFailureRate(currentComponent);
            //     calculationParams = {
            //       C1: calculateHybridC1(currentComponent),
            //       C2: getFailureRate(currentComponent.packageType, currentComponent.pinCount),
            //       piT: Math.exp(0.15 * (currentComponent.temperature - 25)),
            //       piE: getEnvironmentFactor(currentComponent.environment),
            //       piQ: getQualityFactor(currentComponent.quality),
            //       piL: calculateLearningFactor(currentComponent.yearsInProduction)
            //     };
            //     break;

            default:
                calculation = { error: 'Unsupported component type' };
        }

        const totalFailureRate = failureRate * currentComponent.quantity;

        // Update the components array
        setComponents([...components, {
            ...currentComponent,
            failureRate,
            totalFailureRate,
            calculationParams,
            id: Date.now()
        }]);

        // Also set results for display
        setResults({
            failureRate,
            totalFailureRate,
            calculationParams
        });
    };





    const removeComponent = (id) => {
        setComponents(components.filter(comp => comp.id !== id));
    };

    const systemMetrics = calculateSystemMetrics(components);
    // ... (state and other functions remain the same)

    return (
        <div className="reliability-calculator">
            <h2 className='text-center'>Microcircuits</h2>
            <div className="component-form">
                {/* Main Component Type Selection */}
                <Row className="mb-2">
                    <Col md={4} >
                        <div className="form-group" >
                            <label>Part Type:</label>
                            <Select
                                style={customStyles}
                                name="type"
                                placeholder="Select"
                                value={currentComponent.type ?
                                    { value: currentComponent.type, label: currentComponent.type } : null}
                                onChange={(selectedOption) => {
                                    setCurrentComponent({ ...currentComponent, type: selectedOption.value });
                                }}

                                options={[
                                    { value: "Microcircuits,Gate/Logic Arrays And Microprocessors", label: "Microcircuits,Gate/Logic Arrays And Microprocessors" },
                                    { value: "Microcircuits,Memories", label: "Microcircuits,Memories" },
                                    { value: "Microcircuits,Hybrids", label: "Microcircuits,Hybrids" },
                                    { value: "Microcircuits,Saw Devices", label: "Microcircuits,Saw Devices" }
                                ]}
                            />
                        </div>
                    </Col>
                    <Col md={4}>

                        <>

                            <div className="form-group" >
                                <label>Environment (π<sub>E</sub>):</label>
                                <Select
                                    style={customStyles}
                                    placeholder="Select"
                                    onChange={(selectedOption) => {
                                        setCurrentComponent({ ...currentComponent, environment: selectedOption.value })
                                    }}

                                    options={[
                                        { value: "GB", label: "Ground, Benign (GB)" },
                                        { value: "GF", label: "Ground, Fixed (GF)" },
                                        { value: "GM", label: "Ground, Mobile (GM)" },
                                        { value: "NS", label: "Naval, Sheltered (NS)" },
                                        { value: "NU", label: "Naval, Unsheltered (NU)" },
                                        { value: "AIC", label: "Airborne, Inhabited Cargo (AIC)" },
                                        { value: "AIF", label: "Airborne, Inhabited Fighter (AIF)" },
                                        { value: "AUC", label: "Airborne, Uninhabited Cargo (AUC)" },
                                        { value: "AUF", label: "Airborne, Uninhabited Fighter (AUF)" },
                                        { value: "ARW", label: "Airborne, Rotary Wing (ARW)" },
                                        { value: "SF", label: "Space, Flight (SF)" },
                                        { value: "MF", label: "Missile, Flight (MF)" },
                                        { value: "ML", label: "Missile, Launch (ML)" },
                                        { value: "CL", label: "Cannon, Launch (CL)" }
                                    ]}
                                />
                            </div>

                        </>

                    </Col>
                    {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
                        <>
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Device Application Factor:</label>
                                    <Select
                                        style={customStyles}
                                        name="applicationFactor"
                                        placeholder="Select"
                                        onChange={(selectedOption) => {
                                            setCurrentComponent({ ...currentComponent, applicationFactor: selectedOption.value });
                                        }}
                                        options={[
                                            { value: "MMIC Devices-Low Noise & Low Power", label: "MMIC Devices-Low Noise & Low Power" },
                                            { value: "MMIC Devices-Driver & High Power", label: "MMIC Devices-Driver & High Power" },
                                            { value: "MMIC Devices-Unknown", label: "MMIC Devices-Unknown" },
                                            { value: "Digital Devices- All Digital Applications", label: "Digital Devices- All Digital Applications" },
                                        ]}
                                    />
                                </div>
                            </Col>
                        </>
                    )}
                    {currentComponent.type === "Microcircuits,Saw Devices" && (
                        <>

                            <Col md={4}>
                                <div className="form-group">
                                    <label>Quality Factor (πQ):</label>
                                    <Select
                                        value={currentComponent.qualityFactor || QUALITY_FACTORS[1]}
                                        onChange={(selectedOption) => {
                                            setCurrentComponent({
                                                ...currentComponent,
                                                qualityFactor: selectedOption
                                            });
                                        }}
                                        options={QUALITY_FACTORS}
                                        className="factor-select"
                                        styles={customStyles}
                                    />
                                </div>
                            </Col>


                            {/* Buttons Row */}





                        </>
                    )}
                </Row>
                {currentComponent.type === "Microcircuits,Saw Devices" && (
                    <>
                        <button
                            className="btn btn-primary float-end"
                            onClick={() => {
                                const failureRate = calculateSawDeviceFailureRate(
                                    currentComponent.qualityFactor?.value || QUALITY_FACTORS[1].value,
                                    currentComponent.environment || 'GB'
                                );
                                setCurrentComponent({
                                    ...currentComponent,
                                    calculatedFailureRate: failureRate
                                });
                                addComponent();
                            }}
                        >
                            Calculate Failure Rate
                        </button>
                    </>
                )}
                {/* Microcircuits,Gate/Logic Arrays And Microprocessors Section */}
                {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
                    <>
                        <Row className="mb-2">

                            <Col md={4}>
                                <div className="form-group">
                                    <label>Device Type:</label>
                                    <Select
                                        style={customStyles}
                                        name="devices"
                                        placeholder="Select"
                                        onChange={(selectedOption) => {
                                            setCurrentComponent({ ...currentComponent, devices: selectedOption.value });
                                        }}
                                        options={[
                                            { value: "bipolarData", label: "Bipolar Digital and Linear Gate" },
                                            { value: "mosData", label: "MOS Digital and Linear Gate" },
                                            { value: "microprocessorData", label: "Microprocessor" }
                                        ]}
                                    />
                                </div>
                            </Col>




                            {/* Device-Specific Sections */}
                            {currentComponent.devices === "bipolarData" && (
                                <>

                                    <Col md={4}>
                                        <div className="form-group">
                                            <label>Bipolar Devices:</label>

                                            <Select
                                                style={customStyles}
                                                className="mt-1"
                                                name="complexFailure"
                                                placeholder="Select"
                                                onChange={(selectedOption) => {
                                                    setCurrentComponent({ ...currentComponent, complexFailure: selectedOption.value });
                                                }}
                                                options={[
                                                    { value: "digital", label: "Digital" },
                                                    { value: "linear", label: "Linear" },
                                                    { value: "pla", label: "PLA/PAL" }
                                                ]}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        {currentComponent.complexFailure && (

                                            <div className="form-group">
                                                <label >
                                                    {currentComponent.complexFailure === "linear"
                                                        ? "Transistor Count"
                                                        : "Gate Count"}
                                                </label>
                                                <Select
                                                    style={customStyles}
                                                    className="mt-1"
                                                    placeholder="select"
                                                    name="gateCount"

                                                    onChange={(selectedOption) => {
                                                        setCurrentComponent({ ...currentComponent, gateCount: selectedOption.value });
                                                    }}
                                                    options={
                                                        currentComponent.complexFailure === "digital" ? [
                                                            { value: "1-100", label: "1-100" },
                                                            { value: "101-1000", label: "101-1000" },
                                                            { value: "1001-3000", label: "1001-3000" },
                                                            { value: "3001-10000", label: "3001-10000" },
                                                            { value: "10001-30000", label: "10001-30000" },
                                                            { value: "30001-60000", label: "30001-60000" },
                                                        ] : currentComponent.complexFailure === "linear" ? [
                                                            { value: "1-100", label: "1-100" },
                                                            { value: "101-300", label: "101-300" },
                                                            { value: "301-1000", label: "301-1000" },
                                                            { value: "1001-10000", label: "1001-10000" },
                                                        ] : [
                                                            { value: "1-200", label: "1-200" },
                                                            { value: "201-1000", label: "201-1000" },
                                                            { value: "1001-5000", label: "1001-5000" },
                                                        ]
                                                    }
                                                />
                                            </div>

                                        )}
                                    </Col>
                                    <Col md={4}>

                                    </Col>

                                </>

                            )}

                            {/* MOS Devices Section */}
                            {currentComponent.devices === "mosData" && (
                                <>

                                    <Col md={4}>
                                        <div className="form-group">
                                            <label>MOS Devices:</label>
                                            <Select
                                                style={customStyles}
                                                name="complexFailure"
                                                placeholder="Select"
                                                className="mt-1"
                                                onChange={(selectedOption) => {
                                                    setCurrentComponent({ ...currentComponent, complexFailure: selectedOption.value });
                                                }}
                                                options={[
                                                    { value: "digital", label: "Digital" },
                                                    { value: "linear", label: "Linear" },
                                                    { value: "pla", label: "PLA/PAL" }
                                                ]}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        {currentComponent.complexFailure && (
                                            <div className="form-group">
                                                <label>
                                                    {currentComponent.complexFailure === "linear"
                                                        ? "Transistor Count"
                                                        : "Gate Count"}
                                                </label>
                                                <Select
                                                    style={customStyles}
                                                    placeholder="select"
                                                    name="gateCount"
                                                    className="mt-1"
                                                    onChange={(selectedOption) => {
                                                        setCurrentComponent({ ...currentComponent, gateCount: selectedOption.value });
                                                    }}
                                                    options={
                                                        currentComponent.complexFailure === "digital" ? [
                                                            { value: "1-100", label: "1-100" },
                                                            { value: "101-1000", label: "101-1000" },
                                                            { value: "1001-3000", label: "1001-3000" },
                                                            { value: "3001-10000", label: "3001-10000" },
                                                            { value: "10001-30000", label: "10001-30000" },
                                                            { value: "30001-60000", label: "30001-60000" },
                                                        ] : currentComponent.complexFailure === "linear" ? [
                                                            { value: "1-100", label: "1-100" },
                                                            { value: "101-300", label: "101-300" },
                                                            { value: "301-1000", label: "301-1000" },
                                                            { value: "1001-10000", label: "1001-10000" },
                                                        ] : [
                                                            { value: "1-500", label: "1-200" },
                                                            { value: "501-1000", label: "201-1000" },
                                                            { value: "2001-5000", label: "1001-5000" },
                                                            { value: "5001-20000", label: "5001-20000" }
                                                        ]
                                                    }
                                                />
                                            </div>
                                        )}
                                    </Col>

                                </>
                            )}

                            {/* Microprocessor Section */}
                            {currentComponent.devices === "microprocessorData" && (
                                <>

                                    <Col md={4}>
                                        <div className="form-group">
                                            <label>Microprocessor:</label>
                                            <Select
                                                style={customStyles}
                                                name="complexFailure"
                                                placeholder="Select"
                                                onChange={(selectedOption) => {
                                                    setCurrentComponent({
                                                        ...currentComponent,
                                                        complexFailure: selectedOption.value,
                                                        gateCount: ""
                                                    });
                                                }}
                                                options={[
                                                    { value: "Bipolar", label: "Bipolar" },
                                                    { value: "MOS", label: "MOS" },
                                                ]}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        {currentComponent.complexFailure && (
                                            <div className="form-group">
                                                <label>
                                                    Microprocessor-{currentComponent.complexFailure}:
                                                </label>
                                                <Select
                                                    style={customStyles}
                                                    placeholder="select"
                                                    name="gateCount"
                                                    onChange={(selectedOption) => {
                                                        setCurrentComponent({ ...currentComponent, gateCount: selectedOption.value });
                                                    }}
                                                    options={[
                                                        { value: "Up to 8", label: "Up to 8" },
                                                        { value: "Up to 16", label: "Up to 16" },
                                                        { value: "Up to 32", label: "Up to 32" },
                                                    ]}
                                                />
                                            </div>
                                        )}
                                    </Col>

                                </>
                            )}
                        </Row>
                        {/* Package and Pins Section */}
                        <Row className="mb-2">
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Package Type:</label>
                                    <Select
                                        style={customStyles}
                                        name="packageType"
                                        placeholder="Select Package Type"
                                        onChange={(selectedOption) => {
                                            setCurrentComponent({
                                                ...currentComponent,
                                                packageType: selectedOption.value
                                            });
                                        }}
                                        options={[
                                            { value: "Hermetic_DIPs_SolderWeldSeal", label: "Hermetic: DIPs w/Solder or Weld Seal, PGA, SMT" },
                                            { value: "DIPs_GlassSeal", label: "DIPs with Glass Seal" },
                                            { value: "Flatpacks_AxialLeads", label: "Flatpacks with Axial Leads" },
                                            { value: "Cans", label: "Cans" },
                                            { value: "Nonhermetic_DIPs_PGA_SMT", label: "Nonhermetic: DIPs, PGA, SMT" }
                                        ]}
                                    />
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="form-group">
                                    <label>No. of Functional Pins:</label>
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
                                        name="pinCount"
                                        min="3"
                                        max="224"
                                        value={currentComponent.pinCount || ''}
                                        onChange={(e) => setCurrentComponent({
                                            ...currentComponent,
                                            pinCount: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                            </Col>


                            {/* Quality and Learning Factors */}

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
                                                qualityFactor: selectedOption.value,
                                                piQ: selectedOption.piQ
                                            });
                                        }}
                                        options={[
                                            // Class S Categories (πQ = 0.25)
                                            {
                                                value: "MIL-M-38510_ClassS",
                                                label: "Class S (MIL-M-38510, Class S)",
                                                piQ: 0.25, // Store πQ for calculations
                                                description: "Procured in full accordance with MIL-M-38510, Class S requirements."
                                            },
                                            {
                                                value: "MIL-I-38535_ClassU",
                                                label: "Class S (MIL-I-38535, Class U)",
                                                piQ: 0.25,
                                                description: "Procured in full accordance with MIL-I-38535, Appendix B (Class U)."
                                            },
                                            {
                                                value: "MIL-H-38534_ClassS_Hybrid",
                                                label: "Class S Hybrid (MIL-H-38534, Level K)",
                                                piQ: 0.25,
                                                description: "Hybrids procured to Class S (Quality Level K) of MIL-H-38534."
                                            },

                                            // Class B Categories (πQ = 1.0)
                                            {
                                                value: "MIL-M-38510_ClassB",
                                                label: "Class B (MIL-M-38510, Class B)",
                                                piQ: 1.0,
                                                description: "Procured in full accordance with MIL-M-38510, Class B requirements."
                                            },
                                            {
                                                value: "MIL-I-38535_ClassQ",
                                                label: "Class B (MIL-I-38535, Class Q)",
                                                piQ: 1.0,
                                                description: "Procured in full accordance with MIL-I-38535 (Class Q)."
                                            },
                                            {
                                                value: "MIL-H-38534_ClassB_Hybrid",
                                                label: "Class B Hybrid (MIL-H-38534, Level H)",
                                                piQ: 1.0,
                                                description: "Hybrids procured to Class B (Quality Level H) of MIL-H-38534."
                                            },

                                            // Class B-1 Category (πQ = 2.0)
                                            {
                                                value: "MIL-STD-883_ClassB1",
                                                label: "Class B-1 (MIL-STD-883)",
                                                piQ: 2.0,
                                                description: "Compliant with MIL-STD-883, paragraph 1.2.1 (non-hybrid)."
                                            }
                                        ]}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {/* Technology and Temperature */}
                        <Row className="mb-2">
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Learning Factor (π<sub>L</sub>):</label>
                                    <Select
                                        style={customStyles}
                                        name="learningFactor"
                                        placeholder="Select Years in Production"
                                        onChange={(selectedOption) => {
                                            setCurrentComponent({
                                                ...currentComponent,
                                                yearsInProduction: selectedOption.value,
                                                piL: selectedOption.piL
                                            });
                                        }}
                                        options={[
                                            {
                                                value: 5.1,
                                                label: "≤ 0.5 years",
                                                piL: 2.0, // Direct value from table
                                                description: "Early production phase (highest learning factor)"
                                            },
                                            {
                                                value: 0.5,
                                                label: "0.5 years",
                                                piL: 1.8,
                                                description: "Initial production ramp-up"
                                            },
                                            {
                                                value: 1.0,
                                                label: "1.0 year",
                                                piL: 1.5,
                                                description: "Moderate experience"
                                            },
                                            {
                                                value: 1.5,
                                                label: "1.5 years",
                                                piL: 1.2,
                                                description: "Stabilizing production"
                                            },
                                            {
                                                value: 2.0,
                                                label: "≥ 2.0 years",
                                                piL: 1.0,
                                                description: "Mature production (lowest learning factor)"
                                            }
                                        ]}
                                    />
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Technology Type:</label>
                                    <Select
                                        style={customStyles}
                                        name="technology"
                                        placeholder="Select Technology Type"
                                        onChange={(selectedOption) => {
                                            setCurrentComponent({
                                                ...currentComponent,
                                                technology: selectedOption.value,
                                                basePiT: selectedOption.basePiT,
                                                technologyType: selectedOption.label,
                                                calculatedPiT: null
                                            });
                                        }}
                                        options={[
                                            {
                                                value: "Bipolar",
                                                label: "Bipolar (TTL, ECL, ALSTTL, etc.)",
                                                basePiT: 0.10,  // πT at 35°C from the Bipolar table
                                                description: "Standard bipolar logic families"
                                            },
                                            {
                                                value: "MOS",
                                                label: "MOS (CMOS, Digital MOS, VHSIC)",
                                                basePiT: 0.10,  // πT at 35°C from the MOS table
                                                description: "CMOS and MOS-based technologies"
                                            },
                                            {
                                                value: "BiCMOS",
                                                label: "BiCMOS (Bipolar CMOS Hybrid)",
                                                basePiT: 3.205e-8,  // πT at 35°C from the BiCMOS table
                                                description: "Bipolar-CMOS hybrid technologies"
                                            },
                                            {
                                                value: "GaAs",
                                                label: "GaAs MMIC/Digital",
                                                basePiT: 1.5,  // Custom value for GaAs
                                                description: "Gallium Arsenide technologies"
                                            },
                                            {
                                                value: "Linear",
                                                label: "Linear Analog",
                                                basePiT: 0.65,  // Custom value for linear analog
                                                description: "Linear analog circuits"
                                            }
                                        ]}
                                    />
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Junction Temperature (°C):</label>
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
                        </Row>

                        {/* Calculate Button */}
                       
                            <Col className="text-end ">
                                <button
                                    className="btn btn-primary"
                                    onClick={addComponent}
                                >
                                    Calculate Failure Rate
                                </button>
                            </Col>
                       
                    </>
                )}
                

                {/* Saw Devices Section */}
             

                {/* Results Section */}
                {results && (
                    <>
                      <Link
                            component="button"
                            onClick={() => setShowCalculations(!showCalculations)}
                            className="ms-auto mb-5"
                        >
                            {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
                        </Link>
                                         
                     
                        <h2 className="text-center">Calculation Result</h2>
                                        <div className="d-flex justify-content-between align-items-center">

                                            <div>
                                                <p className="mb-1">
                                                    <strong>Total Failure Rate:</strong>
                                                    {systemMetrics.totalFailureRate?.toFixed(4)} failures/10<sup>6</sup> hours
                                                </p>
                                                <p className="mb-0">
                                                    <strong>MTBF:</strong>
                                                    {systemMetrics.mtbf === Infinity ? '∞' : systemMetrics.mtbf?.toFixed(1)} hours
                                                </p>
                                            </div>

                                        </div>
                       
                   
                      
                       
                    </>
                )}
                <br/>

                {showCalculations && (
                    <>
                     <div className="card ">
                     <div className="card-body">
                        {/* 
                // In your component's return statement: */}
                        <div className="component-list">
                            <Typography variant="h5" gutterBottom>
                                Components in System
                            </Typography>

                            {components.length === 0 ? (
                                <Typography variant="body1">No components added yet</Typography>
                            ) : (
                                <MaterialTable
                                    columns={componentColumns}
                                    data={components}
                                    options={{
                                        search: false,
                                        paging: components.length > 10,
                                        pageSize: 10,
                                        pageSizeOptions: [10, 20, 50],
                                        toolbar: false,
                                        headerStyle: {
                                            backgroundColor: '#CCE6FF',
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap'
                                        },
                                        rowStyle: {
                                            backgroundColor: '#FFF'
                                        },
                                        cellStyle: {
                                            padding: '8px 16px'
                                        }
                                    }}
                                    components={{
                                        Container: props => <Paper {...props} elevation={2} />,
                                    }}
                                />
                            )}
                            <br />
                        </div>

                        <h3>Calculation Formulas</h3>
                        <div className="formula-section">
                            {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
                                <>
                                    <p>FR = (C<sub>1</sub> × π<sub>T</sub> + C<sub>2</sub> × π<sub>E</sub>) × π<sub>Q</sub> × π<sub>L</sub> × Qty</p>
                                    <p>Where:</p>
                                    <ul>
                                        <li>C<sub>1</sub> = Base failure rate (depends on gate count and complexity)</li>
                                        <li>C<sub>2</sub> = Package failure rate (from MIL-HDBK-217 tables)</li>
                                        <li>π<sub>T</sub> = Temperature factor (technology dependent)</li>
                                        <li>π<sub>E</sub> = Environment factor (GB, GF, GM, etc.)</li>
                                        <li>π<sub>Q</sub> = Quality factor (MIL-SPEC grade)</li>
                                        <li>π<sub>L</sub> = Learning factor (years in production)</li>
                                    </ul>
                                </>
                            )}
                        </div>
                        </div></div>
                    </>
                )}

            </div>
        </div>
    );
};

export default MicrocircuitsCalculation;