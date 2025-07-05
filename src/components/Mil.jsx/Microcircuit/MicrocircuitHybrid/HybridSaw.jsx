import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import {
    getEnvironmentFactor,
    BASE_FAILURE_RATE,
} from '../../Calculation.js';
import { Button, Container, Row, Col, Table, Collapse } from 'react-bootstrap';
import '../../Microcircuits.css'


const HybridSaw = ({ onCalculate }) => {
    const [components, setComponents] = useState([]);
    const [quantity, setQuantity] = useState(null);
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
        basePiT: 0.1,
        calculatedPiT: null
    });

    const [errors, setErrors] = useState({
        qualityFactor: '',
        environment: ''
    });

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

    const calculateSawDeviceFailureRate = (component) => {
        const baseRate = BASE_FAILURE_RATE;
        const piQ = component.qualityFactor?.value || 1.0;
        const piE = getEnvironmentFactor(component?.environment?.value);
        return (baseRate * piQ * piE)?.toFixed(6);
    };

    const environmentOptions = [
        {
            value: "GB",
            label: "Ground, Benign (GB)",
            factor: 0.50,
            description: "Controlled laboratory or office environment"
        },
        {
            value: "GF",
            label: "Ground, Fixed (GF)",
            factor: 2.0,
            description: "Permanent ground installations with environmental controls"
        },
        {
            value: "GM",
            label: "Ground, Mobile (GM)",
            factor: 4.0,
            description: "Vehicles operating on improved roads"
        },
        {
            value: "NS",
            label: "Naval, Sheltered (NS)",
            factor: 4.0,
            description: "Below decks in harbor or calm seas"
        },
        {
            value: "NU",
            label: "Naval, Unsheltered (NU)",
            factor: 6.0,
            description: "On deck or in rough seas"
        },
        {
            value: "AIC",
            label: "Airborne, Inhabited Cargo (AIC)",
            factor: 4.0,
            description: "Cargo aircraft with human occupants"
        },
        {
            value: "AIF",
            label: "Airborne, Inhabited Fighter (AIF)",
            factor: 5.0,
            description: "Manned fighter/trainer aircraft"
        },
        {
            value: "AUC",
            label: "Airborne, Uninhabited Cargo (AUC)",
            factor: 5.0,
            description: "Unmanned cargo aircraft"
        },
        {
            value: "AUF",
            label: "Airborne, Uninhabited Fighter (AUF)",
            factor: 8.0,
            description: "Unmanned fighter aircraft"
        },
        {
            value: "ARW",
            label: "Airborne, Rotary Wing (ARW)",
            factor: 8.0,
            description: "Helicopters and other rotary aircraft"
        },
        {
            value: "SF",
            label: "Space, Flight (SF)",
            factor: 0.50,
            description: "Spacecraft in flight (not launch/re-entry)"
        },
        {
            value: "MF",
            label: "Missile, Flight (MF)",
            factor: 5.0,
            description: "Missiles during flight phase"
        },
        {
            value: "ML",
            label: "Missile, Launch (ML)",
            factor: 12,
            description: "Missiles during launch phase"
        },
        {
            value: "CL",
            label: "Cannon, Launch (CL)",
            factor: 220,
            description: "Gun-launched projectiles during firing"
        }
    ];

    const addOrUpdateComponent = (component) => {
        setComponents(prev => {
            const existingIndex = prev.findIndex(c => c.id === component.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = component;
                return updated;
            }
            return [...prev, { ...component, id: Date.now() }];
        });
    };

    const updateComponentInList = (component) => {
        if (components.some(c => c.id === component.id)) {
            addOrUpdateComponent(component);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentComponent(prev => ({
            ...prev,
            [name]: name === 'temperature' || name === 'Tj' || name === 'gateCount' || name === 'quantity'
                ? parseFloat(value)
                : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!currentComponent.qualityFactor) {
            newErrors.qualityFactor = 'Please select a quality factor.';
            isValid = false;
        }

        if (!currentComponent.environment) {
            newErrors.environment = 'Please select an environment.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleCalculate = () => {
        if (!validateForm()) {
            return;
        }

        const failureRate = calculateSawDeviceFailureRate(currentComponent);
        const updatedComponent = {
            ...currentComponent,
            calculatedFailureRate: failureRate,
            environmentLabel: currentComponent.environment?.description,
            qualityLabel: currentComponent.qualityFactor?.label
        };

        setCurrentComponent(updatedComponent);
        addOrUpdateComponent(updatedComponent);

        if (onCalculate) {
            onCalculate(failureRate * quantity);
        }
    };

    return (
        <>
            <Col md={4}>
                <div className="form-group">
                    <label>Quality Factor (π<sub>Q</sub>):</label>
                    <Select
                        style={customStyles}
                        name="qualityFactor"
                        placeholder="Select Quality Factor (πQ)"
                        value={currentComponent.qualityFactor}
                        onChange={(selectedOption) => {
                            const updatedComponent = {
                                ...currentComponent,
                                qualityFactor: selectedOption,
                                piQ: selectedOption.piQ
                            };
                            setCurrentComponent(updatedComponent);
                            updateComponentInList(updatedComponent);
                            setErrors({ ...errors, qualityFactor: '' });
                        }}
                        options={[

                            {
                                label: "None beyond best commercial practices",
                                value: 1.0,
                                screeningLevel: "Standard",
                                piQ: 1.0,
                            }
                        ]}
                        className={`factor-select ${errors.qualityFactor ? 'is-invalid' : ''}`}
                    />
                    {errors.qualityFactor && <small className="text-danger">{errors.qualityFactor}</small>}
                </div>
            </Col>

            <Col md={4}>
                <div className="form-group">
                    <label>Environment (π<sub>E</sub>):</label>
                    <Select
                        styles={customStyles}
                        name="environment"
                        placeholder="Select Environment"
                        value={environmentOptions.find(opt => opt.value === currentComponent.environment?.value)}
                        onChange={(selectedOption) => {
                            const updatedComponent = {
                                ...currentComponent,
                                environment: {
                                    value: selectedOption.value,
                                    factor: selectedOption.factor,
                                    description: selectedOption.description
                                },
                                piE: selectedOption.factor
                            };
                            setCurrentComponent(updatedComponent);
                            updateComponentInList(updatedComponent);
                            setErrors({ ...errors, environment: '' });
                        }}
                        options={environmentOptions}
                        className={errors.environment ? 'is-invalid' : ''}
                    />
                    {errors.environment && <small className="text-danger">{errors.environment}</small>}
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

                    className="btn"
                    style={{
                        backgroundColor: '#1e88e5',
                        borderColor: '#0d47a1',
                        fontWeight: 'bold',
                        padding: '8px 20px'
                    }}
                    onClick={handleCalculate}
                >
                    Calculate FR
                </Button>
            </div>

            {currentComponent?.calculatedFailureRate && (
                <div>

                    <div className="Predicted-Failure" style={{ width: "50%" }}>
                        <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
                        <span className="ms-2">
                            {currentComponent?.calculatedFailureRate} failures/10<sup>6</sup> hours
                        </span>
                        <strong>λ<sub>c</sub> * N<sub>c</sub>:</strong>
                        <span className="ms-2">{currentComponent?.calculatedFailureRate * quantity} failures/10<sup>6</sup> hours</span>

                        {console.log("calculateSaw..", currentComponent?.calculatedFailureRate * quantity)}

                    </div>
                    <br />

                </div>
            )}
        </>
    );
};

export default HybridSaw;