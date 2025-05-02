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
import { Alert } from "@mui/material";
const MicrocircuitsCalculation = () => {
    const [showCalculations, setShowCalculations] = useState(false);
    const [components, setComponents] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(false)
    const [currentComponent, setCurrentComponent] = useState({
        type: 'Microcircuits,Gate/Logic Arrays And Microprocessors',
        temperature: 25,
        devices:"bipolarData",
        complexFailure:"digital",
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

   

    return (
        <div className="reliability-calculator">
            <h2 className='text-center'>Microcircuits</h2>


            <div className="component-form">
                {/* Component Type - Full width */}
                <Row className="mb-3">
                    <Col md={6}>
                        <div className="form-group">
                            <label>Part Type:</label>
                            <Select
                                style={customStyles}
                                type="select"
                                name="type"
                                placeholder="Select"
                                onChange={(selectedOption) => {
                                    setCurrentComponent({ ...currentComponent, type: selectedOption.value });
                                }}
                                className="mt-1"
                                options={[
                                    { value: "Microcircuits,Gate/Logic Arrays And Microprocessors", label: "Microcircuits,Gate/Logic Arrays And Microprocessors" },
                                    { value: "Microcircuits,Memories", label: "Microcircuits,Memories" },
                                    { value: "Microcircuits,Hybrids", label: "Microcircuits,Hybrids" },
                                    { value: "Microcircuits,Saw Devices", label: "Microcircuits,Saw Devices" }
                                ]}
                            />
                        </div>
                    </Col>


                    {currentComponent.type === 'Microcircuits,Gate/Logic Arrays And Microprocessors' && (
                        <>
                            {/* <Row className="mb-3"> */}
                            <Col md={6}>
                                <div className="form-group">
                                    <label>Environment (π<sub>E</sub>):</label>
                                    <Select style={customStyles}
                                        type="select"
                                        placeholder="Select"
                                        className="mt-1"
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
                            </Col>
                            <Col md={6}>
                                {/* Device Type - Full width */}
                                <div className="form-group">
                                    <label>Device Type:</label>
                                    <Select
                                        style={customStyles}
                                        type="select"
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
                            <Col md={6}>
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
                            {/* </Row> */}
                            {/* Bipolar Devices Section */}
                            {currentComponent.devices === "bipolarData" && (
                                <>
                                    <Row className="mb-3">
                                        <Col md={6}>
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
                                        <Col md={6}>
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
                                        <Col md={6}>

                                        </Col>
                                    </Row>
                                </>

                            )}

                            {/* MOS Devices Section */}
                            {currentComponent.devices === "mosData" && (
                                <>
                                    <Row className="mb-3">
                                        <Col md={6}>
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
                                        <Col md={6}>
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
                                    </Row>
                                </>
                            )}

                            {/* Microprocessor Section */}
                            {currentComponent.devices === "microprocessorData" && (
                                <>
                                    <Row className="mb-3">
                                        <Col md={6}>
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
                                        <Col md={6}>
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
                                    </Row>
                                </>
                            )}
                            <Row className="mb-3">
                                <Col md={6}>
                                    {/* Package and Pins - side by side */}
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
                                <Col md={6}>
                                    <div className="form-group">
                                        <label>No. of Functional Pins:</label>

                                        <input
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
                                            onChange={(e) => setCurrentComponent({ ...currentComponent, pinCount: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            {/* Application Factor - full width */}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="form-group">
                                        <label>Quality Factor (π<sub>Q</sub>):</label>
                                        <Select
                                            style={customStyles}
                                            type="select"
                                            name="qualityFactor"
                                            placeholder="Select Quality Class"
                                            onChange={(selectedOption) => {
                                                setCurrentComponent({
                                                    ...currentComponent,
                                                    qualityFactor: selectedOption.value,
                                                    // Optionally store πQ value too:
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
                                <Col md={6}>
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
                            </Row>
                            <Row className="mb-3">

                                <Col md={6}>
                                    {/* Temperature Fields - side by side */}
                                    <div className="form-group">
                                        <label>Technology Type:</label>
                                        <Select
                                            style={customStyles}
                                            type="select"
                                            name="technology"
                                            placeholder="Select Technology Type"
                                            onChange={(selectedOption) => {
                                                setCurrentComponent({
                                                    ...currentComponent,
                                                    technology: selectedOption.value,  // Changed from temperatureFactor to technology
                                                    basePiT: selectedOption.basePiT,
                                                    technologyType: selectedOption.label,
                                                    // Clear any previously calculated πT when technology changes
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
                                <Col md={6}>
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
                            {/* Package Failure Rate - full width */}
                            {currentComponent.packageType && currentComponent.pinCount && (

                                <p>Package Failure Rate: {getFailureRate(currentComponent.packageType, currentComponent.pinCount)}</p>

                            )}
                            <div>
                                <button className="btn float-end" onClick={addComponent} >Calculate Failure Rate</button>

                            </div>
                            {results && (
                             <div className="system-metrics">
                
                                   <Link
                                                component="button"
                                                onClick={() => setShowCalculations(!showCalculations)}
                                                className="ms-auto"
                                                sx={{
                                                  color: 'primary.main',
                                                  textDecoration: 'underline',
                                                  cursor: 'pointer',
                                                  fontWeight: 'bold',
                                                  fontSize: '0.95rem',
                                                  '&:hover': {
                                                    textDecoration: 'underline'
                                                  }
                                                }}
                                              >
                                                {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
                                              </Link>
                             <h2 className='text-center'>Calculation Result</h2>
                             <p>Total Failure Rate: {systemMetrics.totalFailureRate?.toFixed(4)} failures/10^6 hours</p>
                             <p>MTBF: {systemMetrics.mtbf === Infinity ? '∞' : systemMetrics.mtbf?.toFixed(1)} hours</p>
                         </div>
                            )}
                           



                            <br />
                            {showCalculations && (
                                <>
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
                                </>
                            )}
                        </>
                    )}
                </Row>
                {currentComponent.type === "Microcircuits,Saw Devices" && (
                    <>

                        <div className="form-group">
                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="input-group mb-3">
                                        <label className="input-label">Quality Factor (πQ):</label>
                                        <Select
                                            value={currentComponent.qualityFactor || QUALITY_FACTORS[1]}
                                            onChange={(selectedOption) => {
                                                setCurrentComponent({
                                                    ...currentComponent,
                                                    qualityFactor: selectedOption
                                                });
                                            }}
                                            options={QUALITY_FACTORS}
                                            getOptionLabel={opt => `${opt.screeningLevel}: ${opt.label}`}
                                            getOptionValue={opt => opt.value}
                                            className="factor-select"
                                            styles={customStyles}
                                        />
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="form-group">
                                        <label className="input-label">Environment (πE):</label>
                                        <Select
                                            value={getEnvironmentalOptions().find(opt => opt.value === currentComponent.environment) ||
                                                { value: 'GB', label: 'Ground Benign' }}
                                            onChange={(selectedOption) => {
                                                setCurrentComponent({
                                                    ...currentComponent,
                                                    environment: selectedOption.value
                                                });
                                            }}
                                            options={getEnvironmentalOptions()}
                                            className="factor-select"
                                            styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    width: '415px',
                                                    minWidth: '250px',
                                                    border: '1px solid #ced4da',
                                                    borderRadius: '4px',
                                                    boxShadow: 'none',
                                                    '&:hover': {
                                                        borderColor: '#80bdff'
                                                    }
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    backgroundColor: state.isSelected ? '#007bff' : 'white',
                                                    color: state.isSelected ? 'white' : '#212529',
                                                    '&:hover': {
                                                        backgroundColor: '#f8f9fa'
                                                    }
                                                })
                                            }}
                                            placeholder="Select Environment"
                                        />
                                    </div>

                                </Col>
                            </Row>
                        </div>
                        <div className="d-flex justify-content-between mb-4">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    // Calculate only when button is clicked
                                    const failureRate = calculateSawDeviceFailureRate(
                                        currentComponent.qualityFactor?.value || QUALITY_FACTORS[1].value,
                                        currentComponent.environment || 'GB'
                                    );
                                    setCurrentComponent({
                                        ...currentComponent,
                                        calculatedFailureRate: failureRate
                                    });
                                    addComponent(); // Your existing function
                                }}
                            >
                                Calculate Failure Rate
                            </button>

                            <button
                                onClick={() => setShowResults(!showResults)}
                                className="btn btn-secondary"
                            >
                                {showResults ? 'Hide Calculations' : 'Show Calculations'}
                            </button>
                        </div>

                        {currentComponent.calculatedFailureRate !== undefined && (
                            <div className="result-summaryv mb-3">
                                <h3>Calculation Results</h3>
                                <p className="result-value">
                                    <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                                    <span className="highlight">
                                        {currentComponent.calculatedFailureRate?.toFixed(6)}
                                    </span> failures/10<sup>6</sup> hours
                                </p>
                            </div>
                        )}

                        {showResults && currentComponent.calculatedFailureRate !== undefined && (
                            <div className="calculation-details">
                                <div className="formula-display card mb-3">
                                    <div className="card-body">
                                        <h4 className="card-title">Formula</h4>
                                        <p className="calculation-breakdown">
                                            <strong>λₚ = {BASE_FAILURE_RATE} × πQ × πE</strong>
                                        </p>
                                        <p className="calculation-breakdown">
                                            {BASE_FAILURE_RATE} ×
                                            {(currentComponent.qualityFactor?.value || QUALITY_FACTORS[1].value)?.toFixed(2)} ×
                                            {getEnvironmentFactor(currentComponent.environment || 'GB')?.toFixed(2)} =
                                            <strong>
                                                {currentComponent.calculatedFailureRate?.toFixed(6)}
                                            </strong> Failures/10⁶ Hours
                                        </p>
                                    </div>
                                </div>



                                {/* // In your component's return statement: */}
                                <ThemeProvider theme={tableTheme}>
                                    <MaterialTable
                                        title="Calculation Parameters"
                                        columns={calculationColumns}
                                        data={components}
                                        options={{
                                            search: false,
                                            paging: false,
                                            toolbar: false,
                                            headerStyle: {
                                                backgroundColor: "#CCE6FF",
                                                fontWeight: 'bold'
                                            },
                                            rowStyle: {
                                                backgroundColor: '#FFF'
                                            }
                                        }}
                                        components={{
                                            Container: props => <Paper {...props} elevation={0} />,
                                            Footer: () => (
                                                <div style={{
                                                    padding: '16px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f5f5f5',
                                                    borderTop: '1px solid #e0e0e0'
                                                }}>
                                                    <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                                                        Total λₚ = {currentComponent.calculatedFailureRate?.toFixed(6)} Failures/10⁶ Hours
                                                    </Typography>
                                                </div>
                                            )
                                        }}
                                    />
                                </ThemeProvider>
                            </div>
                        )}
                    </>
                )}
                <br />
                <br />
            </div>
        </div>
    );
};
export default MicrocircuitsCalculation;



import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MaterialTable from 'material-table';
import Paper from '@mui/material/Paper';

const Switches = () => {
  // Base failure rate data
  const baseRates = [
    { type: 'All MIL-S-83734', rate: 0.00042 }
  ];

  // Active pins factors (with both letter and number keys)
  const activePinsFactors = [
    { pins: 'e', factor: 2.0 }, { pins: 'g', factor: 2.3 },
    { pins: 'i', factor: 2.5 }, { pins: 'l', factor: 3.1 },
    { pins: 't', factor: 3.4 }, { pins: 'lg', factor: 3.7 },
    { pins: 'zO', factor: 4.0 }, { pins: 'zz', factor: 4.3 },
    { pins: 'z4', factor: 4.6 }, { pins: 'z8', factor: 5.3 },
    { pins: 36, factor: 5.7 }, { pins: 40, factor: 7.4 },
    { pins: 48, factor: 9.1 }, { pins: 50, factor: 9.5 },
    { pins: 64, factor: 13 }
  ];

  // Environment factors
  const environmentFactors = [
    { env: 'GB', label: 'Ground, Benign', factor: 1.0 },
    { env: 'GF', label: 'Ground, Fixed', factor: 3.0 },
    { env: 'GM', label: 'Ground, Mobile', factor: 14 },
    { env: 'NS', label: 'Naval, Sheltered', factor: 6.0 },
    { env: 'NU', label: 'Naval, Unsheltered', factor: 18 },
    { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 8.0 },
    { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 12 },
    { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 11 },
    { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 13 },
    { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 25 },
    { env: 'SF', label: 'Space, Flight', factor: 0.50 },
    { env: 'MF', label: 'Missile, Flight', factor: 14 },
    { env: 'ML', label: 'Missile, Launch', factor: 36 },
    { env: 'CL', label: 'Cannon, Launch', factor: 650 }
  ];

  // State for form inputs
  const [inputs, setInputs] = useState({
    switchType: baseRates[0],
    activePins: activePinsFactors[0],
    environment: environmentFactors[0]
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);

  // Get active pins factor
  const getActivePinsFactor = () => {
    // First try to find exact match in table
    const exactMatch = activePinsFactors.find(item => 
      item.pins === inputs.activePins.pins || 
      item.pins.toString() === inputs.activePins.pins.toString()
    );
    
    if (exactMatch) return exactMatch.factor;
    
    // If not found, use formula with numeric value
    const numericPins = Number(inputs.activePins.pins);
    if (!isNaN(numericPins)) {
      return Math.exp(Math.pow((numericPins + 1) / 10, 0.51064));
    }
    
    return 1.0; // Default if can't calculate
  };

  // Calculate the failure rate
  const calculateFailureRate = () => {
    try {
      const baseRate = inputs.switchType.rate;
      const activePinsFactor = getActivePinsFactor();
      const environmentFactor = inputs.environment.factor;

      // Calculate final failure rate
      const failureRate = baseRate * activePinsFactor * environmentFactor;

      setResult({
        value: failureRate.toFixed(6),
        parameters: {
          λb: baseRate.toFixed(6),
          πP: activePinsFactor.toFixed(2),
          πE: environmentFactor.toFixed(1)
        }
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  // Custom styles for Select components
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '38px',
      height: '38px'
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '38px',
      padding: '0 6px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px'
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '38px'
    })
  };

  return (
    <>
      <h2 className="text-center mb-4">Switches</h2>
      
      <Row className="mb-3">
        <Col md={6}>
          {/* Switch Type Selection */}
          <div className="form-group">
            <label>Switch Type (λ<sub>b</sub>):</label>
            <Select
              styles={customStyles}
              name="switchType"
              value={{
                value: inputs.switchType,
                label: `${inputs.switchType.type} (λb = ${inputs.switchType.rate})`
              }}
              onChange={(selectedOption) => {
                setInputs(prev => ({
                  ...prev,
                  switchType: selectedOption.value
                }));
              }}
              options={baseRates.map(item => ({
                value: item,
                label: `${item.type} (λb = ${item.rate})`
              }))}
            />
          </div>
        </Col>

        <Col md={6}>
          {/* Active Pins Factor */}
          <div className="form-group">
            <label>Active Contacts (π<sub>P</sub>):</label>
            <Select
              styles={customStyles}
              name="activePins"
              value={{
                value: inputs.activePins,
                label: `${inputs.activePins.pins} (πP = ${getActivePinsFactor().toFixed(2)})`
              }}
              onChange={(selectedOption) => {
                setInputs(prev => ({
                  ...prev,
                  activePins: selectedOption.value
                }));
              }}
              options={activePinsFactors.map(item => ({
                value: item,
                label: `${item.pins} (πP = ${item.factor})`
              }))}
            />
            <small className="text-muted">
              An active contact is the conductive element which mates with another element for the purpose of transferring electrical energy.
            </small>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          {/* Environment Factor */}
          <div className="form-group">
            <label>Environment Factor (π<sub>E</sub>):</label>
            <Select
              styles={customStyles}
              name="environment"
              value={{
                value: inputs.environment,
                label: `${inputs.environment.label} (πE = ${inputs.environment.factor})`
              }}
              onChange={(selectedOption) => {
                setInputs(prev => ({
                  ...prev,
                  environment: selectedOption.value
                }));
              }}
              options={environmentFactors.map(item => ({
                value: item,
                label: `${item.label} (πE = ${item.factor})`
              }))}
            />
          </div>
        </Col>
      </Row>

      <div className='Button'>
        {result && (
          <Link
            component="button"
            onClick={() => setShowCalculations(!showCalculations)}
            className="ms-auto mt-2"
            sx={{
              color: 'primary.main',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
          </Link>
        )}
        <Button
          variant="primary"
          onClick={calculateFailureRate}
          className="btn-calculate float-end mt-1"
        >
          Calculate Failure Rate
        </Button>
      </div>

      {error && (
        <Row>
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}
      <br />
      <br />

      {result && (
        <>
          <h2 className="text-center">Calculation Result</h2>
          <div className="d-flex align-items-center">
            <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
            <span className="ms-2">{result.value} failures/10<sup>6</sup> hours</span>
          </div>
        </>
      )}
      <br/>
      
      {result && showCalculations && (
        <>
          <Row className="mb-4">
            <Col>
              <div className="card">
                <div className="card-body">
                  <strong><p>Parameters Used</p></strong>
                  <div className="table-responsive">
                    <MaterialTable
                      columns={[
                        { 
                          title: <span>λ<sub>b</sub></span>, 
                          field: 'λb',
                          render: rowData => rowData.λb || '-'
                        },
                        { 
                          title: <span>π<sub>P</sub></span>, 
                          field: 'πP',
                          render: rowData => rowData.πP || '-'
                        },
                        { 
                          title: <span>π<sub>E</sub></span>, 
                          field: 'πE',
                          render: rowData => rowData.πE || '-'
                        },
                        { 
                          title: "Failure Rate", 
                          field: 'λp',
                          render: rowData => rowData.λp || '-',
                        }
                      ]}
                      data={[
                        { 
                          λb: result.parameters.λb,
                          πP: result.parameters.πP,
                          πE: result.parameters.πE,
                          λp: result.value,
                          description: `${inputs.switchType.type} with ${inputs.activePins.pins} active contacts`
                        }
                      ]}
                      options={{
                        search: false,
                        paging: false,
                        toolbar: false,
                        headerStyle: {
                          backgroundColor: '#CCE6FF',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        },
                        rowStyle: {
                          backgroundColor: '#FFF',
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          }
                        }
                      }}
                      components={{
                        Container: props => <Paper {...props} elevation={2} style={{ borderRadius: 8 }} />
                      }}
                    />
                  </div>
                  <div className="formula-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
                    <Typography variant="h6" gutterBottom>
                      Calculation Formula
                    </Typography>
                    <Typography variant="body1" paragraph>
                      λ<sub>p</sub> = λ<sub>b</sub> × π<sub>P</sub> × π<sub>E</sub>
                    </Typography>
                    <Typography variant="body1" paragraph>Where:</Typography>
                    <ul>
                      <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                      <li>λ<sub>b</sub> = Base failure rate (from switch type)</li>
                      <li>π<sub>P</sub> = Active contacts factor</li>
                      <li>π<sub>E</sub> = Environment factor</li>
                    </ul>
                    <Typography variant="body1" paragraph>
                      Calculation Steps:
                    </Typography>
                    <ul>
                      <li>λ<sub>b</sub> = {result.parameters.λb} (from {inputs.switchType.type})</li>
                      <li>π<sub>P</sub> = {result.parameters.πP} (for {inputs.activePins.pins} active contacts)</li>
                      <li>π<sub>E</sub> = {result.parameters.πE} (for {inputs.environment.label} environment)</li>
                      <li>λ<sub>p</sub> = {result.parameters.λb} × {result.parameters.πP} × {result.parameters.πE} = {result.value}</li>
                    </ul>
                    <Typography variant="body1" paragraph>
                      Active Contacts Factor Formula:
                    </Typography>
                    <Typography variant="body1" paragraph>
                      π<sub>P</sub> = exp((N + 1)/10)<sup>0.51064</sup>
                    </Typography>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Switches;