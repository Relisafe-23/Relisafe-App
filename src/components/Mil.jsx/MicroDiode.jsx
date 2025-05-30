import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Button, Row, Col, Container, FormGroup } from 'react-bootstrap';
import './../MIL/Diode.css'
import MaterialTable from 'material-table';
import Select from 'react-select';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography';
// import { Calculator } from 'bootstrap-icons/react';
import { CalculatorIcon } from '@heroicons/react/24/outline'; // or /24/solid
const MicroDiode = ({ onCalculate }) => {
    // Component types
    // Add this state declaration at the top of your component with other useState hooks

    const componentTypes = [
        { id: 'lowFreqDiode', name: '6.1 Diodes, Low Frequency' },
        { id: 'highFreqDiode', name: '6.2 Diodes, High Frequency (Microwave, RF)' },
        { id: 'lowFreqBipolar', name: '6.3 Transistors, Low Frequency, Bipolar' },
        { id: 'lowFreqFET', name: '6.4 Transistors, Low Frequency, SI FET' },
        { id: 'transistorsUnijunction', name: '6.5 Transistors,Unijunction' },
        { id: 'transistorsLowNoiseHighFreqBipolar', name: '6.6 Transistors, Low Noise, High Frequency, Bipolar' },
        { id: 'transistorsHighPowerHighFrequencyBipolar', name: '6.7 Transistors,High Power,High Frequency,Bipolar' },
        { id: 'transistorsHighFrequencyGaAsFET', name: '6.8 Transistors, High Frequency, GaAs FET' },
        { id: 'transistorsHighFrequencySIFET', name: '6.9 Transistors, High Frequency, SI FET' },
        { id: 'thyristorsAndSCRS', name: '6.10 Thyristors and SCRS' },
        { id: 'optoelectronics', name: '6.11 Optoelectronics (Detectors, Isolators, Emitters)' },
        { id: 'alphanumericDisplays', name: '6.12 Alphanumeric Displays' },
        { id: 'laserDiode', name: '6.13 Optoelectronics, Laser Diode' }
    ];

    // Low Frequency Diode types
    const lowFreqDiodeTypes = [
        { name: 'General Purpose Analog Switching', lambda_b: 0.0038 },
        { name: ' Switching', lambda_b: 0.0010 },
        { name: 'Power Rectifier, Fast Recovery', lambda_b: 0.069 },
        { name: 'Power Rectifier/Schottky', lambda_b: 0.030 },
        { name: 'Power Diode', lambda_b: 0.0020 },
        { name: 'Power Rectifier with High Voltage Stacks', lambda_b: 0.0050, perJunction: true },
        { name: 'Transient Suppressor/Varistor', lambda_b: 0.0013 },
        { name: 'Current Regulator', lambda_b: 0.0034 },
        { name: 'Voltage Regulator and Voltage Reference (Avalanche and Zener)', lambda_b: 0.0020 }
    ];
    // Temperature factors for low frequency diodes (General Purpose, Switching, Fast Recovery, etc.)
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

    // Temperature factors for Voltage Regulator, Voltage Reference, and Current Regulator
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

    // High Frequency Diode types
    const highFreqDiodeTypes = [
        { name: 'SI IMPATT (≤ 35 GHz)', lambda_b: 0.22 },
        { name: 'Gunn/Bulk Effect', lambda_b: 0.18 },
        { name: 'Tunnel and Back (including Mixers, Detectors)', lambda_b: 0.0023 },
        { name: 'PIN', lambda_b: 0.0081 },
        { name: 'Schottky Barrier (including Detectors) and Point Contact', lambda_b: 0.027 },
        { name: 'Varactor (200 MHz ≤ Frequency ≤ 35 GHz)', lambda_b: 0.0025 },

    ];

    // Application factors for high frequency diodes
    const highFreqAppFactors = [
        { name: 'Varactor, Voltage Control', pi_A: 0.5 },
        { name: 'Varactor, Multiplier', pi_A: 2.5 },
        { name: 'All Other Diodes', pi_A: 1.0 }
    ];
    const highFreqQualityFactors2 = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 1.8 },
        { name: 'Lower', pi_Q: 2.5 },
        // { name: 'Plastic', pi_Q: null } // Plastic is marked with "—" in the image
    ];
    const highFreqQualityFactors1 = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 5.0 },  // Updated from 1.8 to 5.0
        { name: 'Lower', pi_Q: 25 },  // Updated from 2.5 to 25
        { name: 'Plastic', pi_Q: 50 } // Updated from null to 50
    ];
    // Add these constants with your other constants
    const highFreqDiodeTempFactors1 = [
        { temp: 25, pi_T: 1.0 }, { temp: 30, pi_T: 1.1 }, { temp: 35, pi_T: 1.3 },
        { temp: 40, pi_T: 1.4 }, { temp: 45, pi_T: 1.6 }, { temp: 50, pi_T: 1.7 },
        { temp: 55, pi_T: 1.9 }, { temp: 60, pi_T: 2.1 }, { temp: 65, pi_T: 2.3 },
        { temp: 70, pi_T: 2.8 }, { temp: 75, pi_T: 2.9 }, { temp: 80, pi_T: 3.0 },
        { temp: 85, pi_T: 3.3 }, { temp: 90, pi_T: 3.5 }, { temp: 95, pi_T: 3.8 },
        { temp: 100, pi_T: 4.1 }, { temp: 105, pi_T: 4.4 }, { temp: 110, pi_T: 4.9 },
        { temp: 115, pi_T: 5.1 }, { temp: 120, pi_T: 5.5 }, { temp: 125, pi_T: 5.9 },
        { temp: 130, pi_T: 6.3 }, { temp: 135, pi_T: 5.7 }, { temp: 140, pi_T: 7.1 },
        { temp: 145, pi_T: 7.6 }, { temp: 150, pi_T: 8.0 }, { temp: 155, pi_T: 9.0 },
        { temp: 160, pi_T: 9.0 }, { temp: 165, pi_T: 9.5 }, { temp: 170, pi_T: 10 },
        { temp: 175, pi_T: 11 }
    ];

    const highFreqDiodeTempFactors2 = [
        { temp: 25, pi_T: 1.0 }, { temp: 30, pi_T: 1.3 }, { temp: 35, pi_T: 1.8 },
        { temp: 40, pi_T: 2.3 }, { temp: 45, pi_T: 3.0 }, { temp: 50, pi_T: 3.9 },
        { temp: 55, pi_T: 5.0 }, { temp: 60, pi_T: 6.4 }, { temp: 65, pi_T: 6.1 },
        { temp: 70, pi_T: 10 }, { temp: 75, pi_T: 13 }, { temp: 80, pi_T: 16 },
        { temp: 85, pi_T: 19 }, { temp: 90, pi_T: 24 }, { temp: 95, pi_T: 29 },
        { temp: 100, pi_T: 35 }, { temp: 105, pi_T: 42 }, { temp: 110, pi_T: 50 },
        { temp: 115, pi_T: 60 }, { temp: 120, pi_T: 71 }, { temp: 125, pi_T: 84 },
        { temp: 130, pi_T: 99 }, { temp: 135, pi_T: 120 }, { temp: 140, pi_T: 140 },
        { temp: 145, pi_T: 160 }, { temp: 150, pi_T: 180 }, { temp: 155, pi_T: 210 },
        { temp: 160, pi_T: 280 }, { temp: 165, pi_T: 290 }, { temp: 170, pi_T: 320 },
        { temp: 175, pi_T: 370 }
    ];
    // Transistor application factors
    const transistorAppFactors = [
        { name: 'Linear Amplification', pi_A: 1.5 },
        { name: 'Switching', pi_A: 0.7 }
    ];
    // Transistor power rating factors
    const transistorPowerFactors = [
        { power: 'Pr ≤ 0.1W', pi_R: 0.43 },
        { power: 'Pr = 0.5W', pi_R: 0.77 },
        { power: 'Pr = 1.0W', pi_R: 1.0 },
        { power: 'Pr = 5.0W', pi_R: 1.8 },
        { power: 'Pr = 10.0W', pi_R: 2.3 },
        { power: 'Pr = 50.0W', pi_R: 4.3 },
        { power: 'Pr = 100.0W', pi_R: 5.5 },
        { power: 'Pr = 500.0W', pi_R: 10 }
    ];
    // Transistor voltage stress factors
    const transistorVoltageFactors = [
        { range: '0 < Vs ≤ 0.3', pi_S: 0.11 },
        { range: '0.3 < Vs ≤ 0.4', pi_S: 0.16 },
        { range: '0.4 < Vs ≤ 0.5', pi_S: 0.21 },
        { range: '0.5 < Vs ≤ 0.6', pi_S: 0.29 },
        { range: '0.6 < Vs ≤ 0.7', pi_S: 0.39 },
        { range: '0.7 < Vs ≤ 0.8', pi_S: 0.54 },
        { range: '0.8 < Vs ≤ 0.9', pi_S: 0.73 },
        { range: '0.9 < Vs ≤ 1.0', pi_S: 1.0 }
    ];
    const TransistorTempFactors = [
        { temp: 25, pi_T: 1.0 }, { temp: 30, pi_T: 1.1 }, { temp: 35, pi_T: 1.3 },
        { temp: 40, pi_T: 1.4 }, { temp: 45, pi_T: 1.6 }, { temp: 50, pi_T: 1.7 },
        { temp: 55, pi_T: 1.9 }, { temp: 60, pi_T: 2.1 }, { temp: 65, pi_T: 2.3 },
        { temp: 70, pi_T: 2.8 }, { temp: 75, pi_T: 2.9 }, { temp: 80, pi_T: 3.0 },
        { temp: 85, pi_T: 3.3 }, { temp: 90, pi_T: 3.5 }, { temp: 95, pi_T: 3.8 },
        { temp: 100, pi_T: 4.1 }, { temp: 105, pi_T: 4.4 }, { temp: 110, pi_T: 4.9 },
        { temp: 115, pi_T: 5.1 }, { temp: 120, pi_T: 5.5 }, { temp: 125, pi_T: 5.9 },
        { temp: 130, pi_T: 6.3 }, { temp: 135, pi_T: 5.7 }, { temp: 140, pi_T: 7.1 },
        { temp: 145, pi_T: 7.6 }, { temp: 150, pi_T: 8.0 }, { temp: 155, pi_T: 9.0 },
        { temp: 160, pi_T: 9.0 }, { temp: 165, pi_T: 9.5 }, { temp: 170, pi_T: 10 },
        { temp: 175, pi_T: 11 }
    ];
    const highFreqDiodeEnvironmentFactors = [
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
    const siFETEnvironmentFactors = [
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
    ]
    // Common quality factors
    const qualityFactors = [
        { name: 'JANTXV', pi_Q: 0.7 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.4 },
        { name: 'Lower', pi_Q: 5.5 },
        { name: 'Plastic', pi_Q: 8.0 }
    ];
    // Common environment factors
    const environmentFactors = [
        { code: 'GB', name: 'Ground, Benign', pi_E: 1.0 },
        { code: 'GF', name: 'Ground, Fixed', pi_E: 6.0 },
        { code: 'GM', name: 'Ground, Mobile', pi_E: 9.0 },
        { code: 'NS', name: 'Naval, Sheltered', pi_E: 9.0 },
        { code: 'NU', name: 'Naval, Unsheltered', pi_E: 19 },
        { code: 'AIC', name: 'Airborne, Inhabited, Cargo', pi_E: 13 },
        { code: 'AIF', name: 'Airborne, Inhabited, Fighter', pi_E: 29 },
        { code: 'AUC', name: 'Airborne, Uninhabited, Cargo', pi_E: 20 },
        { code: 'AUF', name: 'Airborne, Uninhabited, Fighter', pi_E: 43 },
        { code: 'ARW', name: 'Airborne, Rotary Wing', pi_E: 24 },
        { code: 'SF', name: 'Space, Flight', pi_E: 0.5 },
        { code: 'MF', name: 'Missile, Flight', pi_E: 14 },
        { code: 'ML', name: 'Missile, Launch', pi_E: 32 },
        { code: 'CL', name: 'Cannon, Launch', pi_E: 320 }
    ];
    const lowFrequencyenvironmentFactors = [
        { code: 'GB', name: 'Ground, Benign', pi_E: 1.0 },
        { code: 'GF', name: 'Ground, Fixed', pi_E: 6.0 },
        { code: 'GM', name: 'Ground, Mobile', pi_E: 9.0 },
        { code: 'NS', name: 'Naval, Sheltered', pi_E: 9.0 },
        { code: 'NU', name: 'Naval, Unsheltered', pi_E: 19 },
        { code: 'AIC', name: 'Airborne, Inhabited, Cargo', pi_E: 13 },
        { code: 'AIF', name: 'Airborne, Inhabited, Fighter', pi_E: 29 },
        { code: 'AUC', name: 'Airborne, Uninhabited, Cargo', pi_E: 20 },
        { code: 'AUF', name: 'Airborne, Uninhabited, Fighter', pi_E: 43 },
        { code: 'ARW', name: 'Airborne, Rotary Wing', pi_E: 24 },
        { code: 'SF', name: 'Space, Flight', pi_E: 0.5 },
        { code: 'MF', name: 'Missile, Flight', pi_E: 14 },
        { code: 'ML', name: 'Missile, Launch', pi_E: 32 },
        { code: 'CL', name: 'Cannon, Launch', pi_E: 320 }
    ];
    const optoElectroEnvironmentFactors = [
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
    // Add this with your other constant definitions
    // const highFreqPowerFactors = [
        
    //     { power: 'Pr ≤ 10W', pi_R: 0.50 },
    //     { power: '10W < Pr ≤ 100W', pi_R: 1.3 },
    //     { power: '100W < Pr ≤ 1000W', pi_R: 2.0 },
    //     { power: '1000W < Pr ≤ 3000W', pi_R: 2.4 },
    //     { power: 'All Other Diodes', pi_R: 1.0 }

    // ];
    const highFreqPowerFactors = [
    { power: 'PIN Diodes (Pr ≤ 10W)', pi_R: 0.50 },
    { power: 'PIN Diodes (10W < Pr ≤ 100W)', pi_R: 1.3 },
    { power: 'PIN Diodes (100W < Pr ≤ 1000W)', pi_R: 2.0 },
    { power: 'PIN Diodes (1000W < Pr ≤ 3000W)', pi_R: 2.4 },
    { power: 'All Other Diodes', pi_R: 1.0 }
];
    const transistorTempFactors = [
        { temp: 25, pi_T: 1.0 }, { temp: 30, pi_T: 1.1 }, { temp: 35, pi_T: 1.3 },
        { temp: 40, pi_T: 1.4 }, { temp: 45, pi_T: 1.6 }, { temp: 50, pi_T: 1.7 },
        { temp: 55, pi_T: 1.9 }, { temp: 60, pi_T: 2.1 }, { temp: 65, pi_T: 2.3 },
        { temp: 70, pi_T: 2.5 }, { temp: 75, pi_T: 2.8 }, { temp: 80, pi_T: 3.0 },
        { temp: 85, pi_T: 3.3 }, { temp: 90, pi_T: 3.6 }, { temp: 95, pi_T: 3.9 },
        { temp: 100, pi_T: 4.2 }, { temp: 105, pi_T: 4.5 }, { temp: 110, pi_T: 4.8 },
        { temp: 115, pi_T: 5.2 }, { temp: 120, pi_T: 5.6 }, { temp: 125, pi_T: 5.9 },
        { temp: 130, pi_T: 6.3 }, { temp: 135, pi_T: 6.8 }, { temp: 140, pi_T: 7.2 },
        { temp: 145, pi_T: 7.7 }, { temp: 150, pi_T: 8.1 }, { temp: 155, pi_T: 8.6 },
        { temp: 160, pi_T: 9.1 }, { temp: 165, pi_T: 9.7 }, { temp: 170, pi_T: 10 },
        { temp: 175, pi_T: 11 }
    ];
    const getPiT = (temp) => {
        const entry = transistorTempFactors.find(item => item.temp === temp);
        return entry ? entry.pi_T : Math.exp(-2114 * (1 / (temp + 273) - 1 / 298));
    };
    // Add the temperature factor calculation function here
    const calculateLowNoiseHighFreqTempFactor = (junctionTemp) => {
        return Math.exp(-2114 * ((1 / (junctionTemp + 273)) - (1 / 298)));
    };
    // Contact construction factors (for low freq diodes)
    const contactConstructionFactors = [
        { type: 'Metallurgically Bonded', pi_C: 1.0 },
        { type: 'Non-Metallurgically Bonded and Spring Loaded Contacts', pi_C: 2.0 }
    ];
    const siFETTypes = [
        { name: 'MOSFET', lambda_b: 0.012 },
        { name: 'JFET', lambda_b: 0.0045 }
    ];
    const unijunctionTypes = [
        { name: 'All Unijunction', lambda_b: 0.0083 }
    ];
    // SI FET Temperature factors
    const siFETTempFactors = [
        { temp: 25, pi_T: 1.0 },
        { temp: 30, pi_T: 1.1 },
        { temp: 35, pi_T: 1.2 },
        { temp: 40, pi_T: 1.4 },
        { temp: 45, pi_T: 1.5 },
        { temp: 50, pi_T: 1.6 },
        { temp: 55, pi_T: 1.8 },
        { temp: 60, pi_T: 2.0 },
        { temp: 65, pi_T: 2.1 },
        { temp: 70, pi_T: 2.3 },
        { temp: 75, pi_T: 2.5 },
        { temp: 80, pi_T: 2.7 },
        { temp: 85, pi_T: 3.0 },
        { temp: 90, pi_T: 3.2 },
        { temp: 95, pi_T: 3.4 },
        { temp: 100, pi_T: 3.7 },
        { temp: 105, pi_T: 3.9 },
        { temp: 110, pi_T: 4.2 },
        { temp: 115, pi_T: 4.5 },
        { temp: 120, pi_T: 4.8 },
        { temp: 125, pi_T: 5.1 },
        { temp: 130, pi_T: 5.4 },
        { temp: 135, pi_T: 5.7 },
        { temp: 140, pi_T: 6.0 },
        { temp: 145, pi_T: 6.4 },
        { temp: 150, pi_T: 6.7 },
        { temp: 155, pi_T: 7.1 },
        { temp: 160, pi_T: 7.5 },
        { temp: 165, pi_T: 7.9 },
        { temp: 170, pi_T: 8.3 },
        { temp: 175, pi_T: 8.7 }
    ];
    // SI FET Application factors
    const siFETAppFactors = [
        { name: 'Linear Amplification (Pr < 2W)', pi_A: 1.5 },
        { name: 'Small Signal Switching', pi_A: 0.7 },
        { name: 'Power FETs (2 ≤ Pr < 5W)', pi_A: 2.0 },
        { name: 'Power FETs (5 ≤ Pr < 50W)', pi_A: 4.0 },
        { name: 'Power FETs (50 ≤ Pr < 250W)', pi_A: 8.0 },
        { name: 'Power FETs (Pr ≥ 250W)', pi_A: 10 }
    ];
    // Unijunction Temperature factors
    const unijunctionTempFactors = [
        { temp: 25, pi_T: 1.0 },
        { temp: 30, pi_T: 1.1 },
        { temp: 35, pi_T: 1.3 },
        { temp: 40, pi_T: 1.5 },
        { temp: 45, pi_T: 1.7 },
        { temp: 50, pi_T: 1.9 },
        { temp: 55, pi_T: 2.1 },
        { temp: 60, pi_T: 2.4 },
        { temp: 65, pi_T: 2.7 },
        { temp: 70, pi_T: 3.0 },
        { temp: 75, pi_T: 3.3 },
        { temp: 80, pi_T: 3.7 },
        { temp: 85, pi_T: 4.0 },
        { temp: 90, pi_T: 4.4 },
        { temp: 95, pi_T: 4.9 },
        { temp: 100, pi_T: 5.3 },
        { temp: 105, pi_T: 5.8 },
        { temp: 110, pi_T: 6.4 },
        { temp: 115, pi_T: 6.9 },
        { temp: 120, pi_T: 7.5 },
        { temp: 125, pi_T: 8.1 },
        { temp: 130, pi_T: 8.8 },
        { temp: 135, pi_T: 9.5 },
        { temp: 140, pi_T: 10 },
        { temp: 145, pi_T: 11 },
        { temp: 150, pi_T: 12 },
        { temp: 155, pi_T: 13 },
        { temp: 160, pi_T: 13 },
        { temp: 165, pi_T: 14 },
        { temp: 170, pi_T: 15 },
        { temp: 175, pi_T: 16 }
    ];
    const lowNoiseHighFreqQualityFactors = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.0 },
        { name: 'Lower', pi_Q: 5.0 }
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
    // Unijunction Temperature factors
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
    // Add these constants with your other constants
    const gaAsAppFactors = [
        { name: 'All Low Power and Pulsed', pi_A: 1 },
        { name: 'CW', pi_A: 4 }
    ];
    const gaAsMatchingNetworkFactors = [
        { name: 'Input and Output', pi_M: 1.0 },
        { name: 'Input Only', pi_M: 2.0 },
        { name: 'None', pi_M: 4.0 }
    ];
    const gaAsQualityFactors = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.0 },
        { name: 'Lower', pi_Q: 5.0 }
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
    // Add these constants with your other constants
    const siFETTypesHF = [
        { name: 'MOSFET', lambda_b: 0.060 },
        { name: 'JFET', lambda_b: 0.023 }
    ];
    const siFETTempFactorsHF = [
        { temp: 25, pi_T: 1.0 },
        { temp: 30, pi_T: 1.1 },
        { temp: 35, pi_T: 1.2 },
        { temp: 40, pi_T: 1.4 },
        { temp: 45, pi_T: 1.5 },
        { temp: 50, pi_T: 1.6 },
        { temp: 55, pi_T: 1.8 },
        { temp: 60, pi_T: 2.0 },
        { temp: 65, pi_T: 2.1 },
        { temp: 70, pi_T: 2.3 },
        { temp: 75, pi_T: 2.5 },
        { temp: 80, pi_T: 2.7 },
        { temp: 85, pi_T: 3.0 },
        { temp: 90, pi_T: 3.2 },
        { temp: 95, pi_T: 3.4 },
        { temp: 100, pi_T: 3.7 },
        { temp: 105, pi_T: 3.9 },
        { temp: 110, pi_T: 4.2 },
        { temp: 115, pi_T: 4.5 },
        { temp: 120, pi_T: 4.8 },
        { temp: 125, pi_T: 5.1 },
        { temp: 130, pi_T: 5.4 },
        { temp: 135, pi_T: 5.7 },
        { temp: 140, pi_T: 6.0 },
        { temp: 145, pi_T: 6.4 },
        { temp: 150, pi_T: 6.7 },
        { temp: 155, pi_T: 7.1 },
        { temp: 160, pi_T: 7.5 },
        { temp: 165, pi_T: 7.9 },
        { temp: 170, pi_T: 8.3 },
        { temp: 175, pi_T: 8.7 },
    ];
    const siFETQualityFactors = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.0 },
        { name: 'Lower', pi_Q: 5.0 }
    ];
    const thyristorTypes = [
        { name: 'All Types', lambda_b: 0.0022 }
    ];
    const thyristorTempFactors = [
        { temp: 25, pi_T: 1.0 },
        { temp: 30, pi_T: 1.2 },
        { temp: 35, pi_T: 1.4 },
        { temp: 40, pi_T: 1.6 },
        { temp: 45, pi_T: 1.9 },
        { temp: 50, pi_T: 2.2 },
        { temp: 55, pi_T: 2.6 },
        { temp: 60, pi_T: 3.0 },
        { temp: 65, pi_T: 3.4 },
        { temp: 70, pi_T: 3.9 },
        { temp: 75, pi_T: 4.4 },
        { temp: 80, pi_T: 5.0 },
        { temp: 85, pi_T: 5.7 },
        { temp: 90, pi_T: 6.4 },
        { temp: 95, pi_T: 7.2 },
        { temp: 100, pi_T: 8.0 },
        { temp: 105, pi_T: 8.9 },
        { temp: 110, pi_T: 9.9 },
        { temp: 115, pi_T: 11 },
        { temp: 120, pi_T: 12 },
        { temp: 125, pi_T: 13 },
        { temp: 130, pi_T: 15 },
        { temp: 135, pi_T: 16 },
        { temp: 140, pi_T: 18 },
        { temp: 145, pi_T: 19 },
        { temp: 150, pi_T: 21 },
        { temp: 155, pi_T: 23 },
        { temp: 160, pi_T: 25 },
        { temp: 165, pi_T: 27 },
        { temp: 170, pi_T: 30 },
        { temp: 175, pi_T: 32 }
    ];
    const thyristorCurrentFactors = [
        { current: 0.5, pi_R: 0.30 },
        { current: 10, pi_R: 0.40 },
        { current: 50, pi_R: 0.75 },
        { current: 1.0, pi_R: 1.0 },
        { current: 5.0, pi_R: 1.9 },
        { current: 10, pi_R: 2.5 },
        { current: 20, pi_R: 3.3 },
        { current: 30, pi_R: 3.9 },
        { current: 40, pi_R: 4.4 },
        { current: 50, pi_R: 4.8 },
        { current: 60, pi_R: 5.1 },
        { current: 70, pi_R: 5.5 },
        { current: 80, pi_R: 5.8 },
        { current: 90, pi_R: 6.0 },
        { current: 100, pi_R: 6.3 },
        { current: 110, pi_R: 6.6 },
        { current: 120, pi_R: 6.8 },
        { current: 130, pi_R: 7.0 },
        { current: 140, pi_R: 7.2 },
        { current: 150, pi_R: 7.4 },
        { current: 160, pi_R: 7.6 },
        { current: 170, pi_R: 7.8 },
        { current: 175, pi_R: 7.9 },
    ];

    const thyristorVoltageFactors = [
        { range: 'Vs ≤ 0.3', pi_S: 0.1 },
        { range: '0.3 < Vs ≤ 0.4', pi_S: 0.18 },
        { range: '0.4 < Vs ≤ 0.5', pi_S: 0.27 },
        { range: '0.5 < Vs ≤ 0.6', pi_S: 0.38 },
        { range: '0.6 < Vs ≤ 0.7', pi_S: 0.51 },
        { range: '0.7 < Vs ≤ 0.8', pi_S: 0.65 },
        { range: '0.8 < Vs ≤ 0.9', pi_S: 0.82 },
        { range: '0.9 < Vs ≤ 1.0', pi_S: 1.0 }
    ];
    const optoelectronicTypes = [
        { name: 'Photodetectors', lambda_0: 0.0055 },
        { name: 'Photo-Transistor', lambda_0: 0.0055 },
        { name: 'Photo-Diode', lambda_0: 0.0040 }, // Note: Value not provided in image, using placeholder
        { name: 'Opto-isolators', lambda_0: 0.0025 },
        { name: 'Photodiode Output, Single Device', lambda_0: 0.0025 },
        { name: 'Phototransistor Output, Single Device', lambda_0: 0.013 },
        { name: 'Photodarlington Output, Single Device', lambda_0: 0.013 },
        { name: 'Light Sensitive Resistor, Single Device', lambda_0: 0.0064 },
        { name: 'Photodiode Output, Dual Device', lambda_0: 0.0033 },
        { name: 'Phototransistor Output, Dual Device', lambda_0: 0.017 },
        { name: 'Photodarlington Output, Dual Device', lambda_0: 0.017 },
        { name: 'Light Sensitive Resistor, Dual Device', lambda_0: 0.0013 },
        // Note: Value not provided in image, using single device value
        { name: 'Emitters', lambda_0: 0.0013 },
        { name: 'Infrared Light Emitting Diode (IRLD)', lambda_0: 0.00023 }
    ];
    const optoQualityFactors = [
        { name: 'JANTXY', pi_Q: 0.70 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.4 },
        { name: 'Lower', pi_Q: 5.5 },
        { name: 'Plastic', pi_Q: 8.0 }
    ];
    // Temperature factors table for optoelectronics
    const optoTempFactors = [
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
    // stress
const voltageStressFactors = [
    { range: 'Vs ≤ 0.30', pi_S: 0.054 },
    { range: '0.30 < Vs ≤ 0.40', pi_S: 0.11 },
    { range: '0.40 < Vs ≤ 0.50', pi_S: 0.19 },
    { range: '0.50 < Vs ≤ 0.60', pi_S: 0.29 },
    { range: '0.60 < Vs ≤ 0.70', pi_S: 0.42 },
    { range: '0.70 < Vs ≤ 0.80', pi_S: 0.58 },
    { range: '0.80 < Vs ≤ 0.90', pi_S: 0.77 },
    { range: '0.90 < Vs ≤ 1.00', pi_S: 1.0 }
];
    // Temperature factors table for alphanumeric displays
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
    // Add these constants with your other constants
    const displayTypes = [
        { name: 'Segment Display', type: 'segment' },
        { name: 'Diode Array Display', type: 'diode' }
    ];
    const characterCounts = [
        { count: 1, withLogic: true },
        { count: 2, withLogic: true },
        { count: 3, withLogic: true },
        { count: 4, withLogic: true },
        { count: 5, withLogic: false },
        { count: 6, withLogic: false },
        { count: 7, withLogic: false },
        { count: 8, withLogic: false },
        { count: 9, withLogic: false },
        { count: 10, withLogic: false },
        { count: 11, withLogic: false },
        { count: 12, withLogic: false },
        { count: 13, withLogic: false },
        { count: 14, withLogic: false },
        { count: 15, withLogic: false }
    ];

    const getBaseFailureRate = (count, displayType, withLogic = false) => {
        const rates = {
            1: {
                segment: withLogic ? 0.00043 : 0.00047,
                diode: withLogic ? 0.00026 : 0.00030
            },
            2: {
                segment: withLogic ? 0.00086 : 0.00090,
                diode: withLogic ? 0.00043 : 0.00047
            },
            3: {
                segment: withLogic ? 0.0013 : 0.0013,
                diode: withLogic ? 0.00060 : 0.00064
            },
            4: {
                segment: withLogic ? 0.0017 : 0.0018,
                diode: withLogic ? 0.00077 : 0.00081
            },
            5: { segment: 0.0022, diode: 0.00094 },
            6: { segment: 0.0026, diode: 0.0011 },
            7: { segment: 0.0030, diode: 0.0013 },
            8: { segment: 0.0034, diode: 0.0015 },
            9: { segment: 0.0039, diode: 0.0016 },
            10: { segment: 0.0043, diode: 0.0018 },
            11: { segment: 0.0047, diode: 0.0020 },
            12: { segment: 0.0052, diode: 0.0021 },
            13: { segment: 0.0056, diode: 0.0023 },
            14: { segment: 0.0060, diode: 0.0025 },
            15: { segment: 0.0065, diode: 0.0026 }
        };

        return rates[count] ? rates[count][displayType] : 0;
    };
    const laserDiodeTypes = [
        { name: 'GaAs/M GaAs', lambda_b: 3.23 },
        { name: 'In GaAs/in GaAsP', lambda_b: 5.65 }
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
    const laserDiodeQualityFactors = [
        { name: 'Hermetic Package', pi_Q: 1.0 },
        { name: 'Nonhermetic with Facet Coating', pi_Q: 1.0 },
        { name: 'Nonhermetic without Facet Coating', pi_Q: 3.3 }
    ];
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
    const laserDiodeApplicationFactors = [
        { name: 'CW', pi_A: 4.4 },
        { name: 'Pulsed', pi_A: 1.0 } // This is simplified - actual values depend on duty cycle
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
     // Application factor
                                                                             
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
    const calculatePiR = (power) => {
    const Pr = parseFloat(power);
    if (Pr <= 0.1) return 0.43;
    if (Pr <= 0.5) return 0.77;
    if (Pr <= 1.0) return 1.0;
    if (Pr <= 5.0) return 1.8;
    if (Pr <= 10.0) return 2.3;
    if (Pr <= 50.0) return 4.3;
    if (Pr <= 100.0) return 5.5;
    if (Pr <= 500.0) return 10;
    return 10; // Default for power > 500W
};
const displayBaseFailureRates = {
  segment: {
    1: 0.00043,
    "1_wLogic": 0.00047,
    2: 0.00086,
    "2_wLogic": 0.00090,
    3: 0.0013,
    "3_wLogic": 0.0013,
    4: 0.0017,
    "4_wLogic": 0.0018,
    5: 0.0022,
    6: 0.0026,
    7: 0.0030,
    8: 0.0034,
    9: 0.0039,
    10: 0.0043,
    11: 0.0047,
    12: 0.0052,
    13: 0.0056,
    14: 0.0060,
    15: 0.0065
  },
  diode: {
    1: 0.00026,
    "1_wLogic": 0.00030,
    2: 0.00043,
    "2_wLogic": 0.00047,
    3: 0.00060,
    "3_wLogic": 0.00064,
    4: 0.00077,
    "4_wLogic": 0.00081,
    5: 0.00094,
    6: 0.0011,
    7: 0.0013,
    8: 0.0015,
    9: 0.0016,
    10: 0.0018,
    11: 0.0020,
    12: 0.0021,
    13: 0.0023,
    14: 0.0025,
    15: 0.0026
  }
};


    // Initial form state
    const initialState = {
        componentType: 'lowFreqDiode',
        diodeType: lowFreqDiodeTypes[0].name,
        highFreqDiodeTypes: highFreqDiodeTypes[0].name,
        junctionTemp: 25,
        voltageStress: 0.3,
        contactConstruction: contactConstructionFactors[0].type,
        quality: qualityFactors[0].name,
        environment: [0].code,
        numJunctions: 1,
        highFreqDiodeType: highFreqDiodeTypes[0].name,
        highFreqAppFactor: highFreqAppFactors[0].name,
        transistorAppFactor: transistorAppFactors[0].name,
        transistorPowerFactor: transistorPowerFactors[0].power,
        transistorVoltageFactor: transistorVoltageFactors[0].range,
        highFreqPowerFactor: highFreqPowerFactors[0].power,
        siFETType: siFETTypes[0].name,
        siFETAppFactor: siFETAppFactors[0].name,
        unijunctionType: unijunctionTypes[0].name,
        lowNoiseHighFreqQuality: lowNoiseHighFreqQualityFactors[0].name,
        powerRating: 'Pr ≤ 0.1',
        voltageStressRatio: '0 < Vs ≤ 0.3',
        frequencyGHz: 1.0,
        outputPowerWatts: 10,
        junctionTempHP: 25,
        voltageRatio: 0.5,
        metalizationType: 'Gold',
        applicationType: 'CW',
        matchingNetwork: 'Input and Output',
        frequencyGHzGaAs: 1.0,
        outputPowerWattsGaAs: 0.1,
        junctionTempGaAs: 25,
        applicationTypeGaAs: 'All Low Power and Pulsed',
        matchingNetworkGaAs: 'Input and Output',
        qualityGaAs: 'JANTX',
        siFETTypeHF: 'MOSFET',
        junctionTempSIFET: 25,
        qualitySIFET: 'JANTX',
        thyristorType: thyristorTypes[0].name,
        thyristorCurrent: thyristorCurrentFactors[0].current,
        thyristorVoltage: thyristorVoltageFactors[0].range,
        optoelectronicType: optoelectronicTypes[0].name,
        optoJunctionTemp: 25,
        optoQuality: optoQualityFactors[0].name,
        displayType: displayTypes[0].type,
        characterCount: characterCounts[0].count,
        displayJunctionTemp: 25,
        laserDiodeType: laserDiodeTypes[0].name,
        laserDiodeTemp: 25,
        laserDiodeQuality: laserDiodeQualityFactors[0].name,
        laserDiodeCurrent: 1.0,
        laserDiodeApplication: laserDiodeApplicationFactors[0].name,
        laserDiodePowerRatio: 0.5,
        laserDiodeEnvironment: environmentFactors[0].code,
        voltageStress: voltageStressFactors[0].range,
          voltageApplied: 0,
    voltageRated: 1,
    voltageStressRatio: 0, 
      vce: '',        // Operating voltage
    bvces: '',       // Breakdown voltage
    metalizationType: 'Gold', // Default to Gold
    
    };
    // State for form inputs
    const [formData, setFormData] = useState(initialState);
    const [results, setResults] = useState(null);
    const [showCalculations, setShowCalculations] = useState();

    // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newData = {
            ...prev,
            [name]: value
        };
        
        // Calculate voltage stress ratio when either voltage changes
        if (name === 'voltageApplied' || name === 'voltageRated') {
            const applied = parseFloat(newData.voltageApplied) || 0;
            const rated = parseFloat(newData.voltageRated) || 1;
            newData.voltageStressRatio = rated > 0 ? (applied / rated) : 0;
        }
        
        return newData;
    });
};
 
    // Reset form
    const resetForm = () => {
        setFormData(initialState);
        setResults(null);
    };

    // Calculate failure rate
    const calculateFailureRate = () => {
        let lambda_p = 0;
        let lambda_b = 0;
        let pi_T = 1;
        let pi_S = 1;
        let pi_C = 1;
        let pi_Q = 1;
        let pi_E = 1;
        let pi_A = 1;
        let pi_R = 1;
        let calculationDetails = [];
        let formula = '';

        // Get quality factor
        const qualityFactor = qualityFactors.find(q => q.name === formData.quality);
        pi_Q = qualityFactor ? qualityFactor.pi_Q : 1;
        calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q });

        // Get environment factor
        // const envFactor = environmentFactors.find(e => e.code === formData.environment);
        // pi_E = envFactor ? envFactor.pi_E : 1;
        // calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });

        const envFactor = lowFrequencyenvironmentFactors.find(e => e.code === formData.environment);
        pi_E = envFactor ? envFactor.pi_E : 1;
        calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };
        if (formData.componentType === 'lowFreqDiode') {
            // Low frequency diode calculation
            const diodeType = lowFreqDiodeTypes.find(d => d.name === formData.diodeType);
            lambda_b = diodeType.lambda_b;
            if (diodeType.perJunction) {
                lambda_b *= formData.numJunctions;
            }
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

            // Temperature factor (simplified linear approximation for demo)
            // let tempFactors;
            // if (formData.diodeType.includes('Voltage Regulator') ||
            //     formData.diodeType.includes('Current Regulator')) {
            //     tempFactors = lowFreqDiodeTempFactors2;
            // } else {
            //     tempFactors = lowFreqDiodeTempFactors1;
            // }
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
pi_T = calculatePiT(formData.diodeType, formData.junctionTemp);
calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T.toFixed(4) });


            let pi_S = 1;
        let voltageStressDescription = '';
        
        if (formData.voltageStress) {
            // Use the selected dropdown value
            const stressFactor = voltageStressFactors.find(v => v.range === formData.voltageStress);
            pi_S = stressFactor ? stressFactor.pi_S : 1;
            voltageStressDescription = `Selected range: ${formData.voltageStress}`;
        } else if (formData.voltageStressRatio !== undefined) {
            // Calculate from voltage ratio
            const Vs = parseFloat(formData.voltageStressRatio);
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

        calculationDetails.push({ 
            name: 'Electrical Stress Factor (πS)', 
            value: pi_S.toFixed(4),
            description: voltageStressDescription
        });
      // Contact construction factor
            const contactFactor = contactConstructionFactors.find(c => c.type === formData.contactConstruction);
            pi_C = contactFactor ? contactFactor.pi_C : 1;
            calculationDetails.push({ name: 'Contact Construction Factor (πC)', value: pi_C });

            // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_S * pi_C * pi_Q * pi_E;
            formula = 'λp = λb × πT × πS × πC × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }

        } else if (formData.componentType === 'highFreqDiode') {
            // High frequency diode calculation
            const diodeType = highFreqDiodeTypes.find(d => d.name === formData.highFreqDiodeType);
            lambda_b = diodeType.lambda_b;
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

            // Temperature factor - use different tables based on diode type
    //  let tempFactors;
                   const calculatePiT = (highFreqDiodeType, junctionTemp) => {
                            
    const Tj = parseFloat(junctionTemp);
            if (formData.highFreqDiodeType === 'SI IMPATT (≤ 35 GHz)') {
                // formData.highFreqDiodeType === 'Gunn/Bulk Effect'
                // Use the second table (higher temperature factors)
              return Math.exp(-5260 * ((1/(Tj + 273)) - (1/298)));
    } else {
        // For General Purpose, Switching, Fast Recovery, etc.
        return Math.exp(-2100 * ((1/(Tj + 273)) - (1/298)));}
    }

         
        pi_T = calculatePiT(formData.highFreqDiodeType, formData.junctionTemp);
calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T.toFixed(4) });

            // Application factor

            const appFactor = highFreqAppFactors.find(a => a.name === formData.highFreqAppFactor);
            pi_A = appFactor ? appFactor.pi_A : 1;
            calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });
            // Power rating factor
// Power rating factor calculation for high frequency diodes
let pi_R = 1;
let powerRatingDescription = '';

if (formData.highFreqPowerFactor) {
    // Use dropdown value if selected
    const powerFactor = highFreqPowerFactors.find(p => p.power === formData.highFreqPowerFactor);
    pi_R = powerFactor ? powerFactor.pi_R : 1;
    powerRatingDescription = `Selected power factor: ${formData.highFreqPowerFactor} (πR = ${pi_R})`;
} else if (formData.powerInput) {
    // Calculate from manual input if provided
    const Pr = parseFloat(formData.powerInput) || 1;
    pi_R = 0.326 * Math.log(Pr) - 0.25;
    powerRatingDescription = `Calculated from input power (${Pr} W): πR = 0.326 * ln(${Pr}) - 0.25 = ${pi_R.toFixed(4)}`;
} else {
    // Default value if neither is provided
    pi_R = 1;
    powerRatingDescription = "No power input selected, using default πR = 1";
}

calculationDetails.push({ 
    name: 'Power Rating Factor (πR)', 
    value: pi_R.toFixed(4),
    description: powerRatingDescription
});

      let qualityFactor;
            if (formData.highFreqDiodeType === 'Schottky Barrier (including Detectors) and Point Contact') {
                qualityFactor = highFreqQualityFactors2.find(q => q.name === formData.quality);
            } else {
                qualityFactor = highFreqQualityFactors1.find(q => q.name === formData.quality);
            }
            pi_Q = qualityFactor ? (qualityFactor.pi_Q !== null ? qualityFactor.pi_Q : 1) : 1;
            calculationDetails[0] = { name: 'Quality Factor (πQ)', value: pi_Q };

            // Special case for PIN diodes
            if (formData.highFreqDiodeType === 'PIN' && formData.highFreqPowerFactor === 'All Other Diodes') {
                pi_R = 1.5; // Specific value for PIN diodes
                calculationDetails[calculationDetails.length - 1].value = pi_R;
            }
            calculationDetails[0] = { name: 'Quality Factor (πQ)', value: pi_Q };

            // Get environment factor
            const envFactor = highFreqDiodeEnvironmentFactors.find(e => e.code === formData.environment);
            pi_E = envFactor ? envFactor.pi_E : 1;
            calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };
            // Special case for PIN diodes
            if (formData.highFreqDiodeType === 'PIN' && formData.highFreqPowerFactor === 'PIN Diodes') {
                pi_R = 1.5; // Specific value for PIN diodes
                calculationDetails[calculationDetails.length - 1].value = pi_R;
            }
            // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_A * pi_R * pi_Q * pi_E;
            formula = 'λp = λb × πT × πA  × πR × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }

        } else if (formData.componentType === 'lowFreqBipolar') {
            // Low frequency bipolar transistor calculation
            lambda_b = 0.00074;
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

           // Temperature factor calculation
        let tempDescription;
    if (formData.junctionTemp) {
        // Use the selected dropdown value
        const tempFactor = TransistorTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
        pi_T = tempFactor.pi_T;
        tempDescription = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-2114 * ((1/(Tj + 273)) - (1/298)));
        tempDescription = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription
    });


            // Application factor
            const appFactor = transistorAppFactors.find(a => a.name === formData.transistorAppFactor);
            pi_A = appFactor ? appFactor.pi_A : 1;
            calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });


 let pi_R = 1;
    let powerRatingDescription1 = '';

    if (formData.transistorPowerFactor) {
        // Use dropdown value if selected
        const powerFactor = transistorPowerFactors.find(p => p.power === formData.transistorPowerFactor);
        pi_R = powerFactor ? powerFactor.pi_R : 1;
        powerRatingDescription1 = `Selected power factor: ${formData.transistorPowerFactor} (πR = ${pi_R})`;
    } else if (formData.powerInput1) {
        // Calculate from manual input if provided
          const Pr = parseFloat(formData.powerInput1) || 1;
          pi_R = Math.pow(Pr, 0.37);
      
        pi_R = calculatePiR(Pr);
        powerRatingDescription1 = `Calculated from input power (${Pr} W): πR = ${pi_R.toFixed(4)}`;
    } 
  calculationDetails.push({ 
        name: 'Power Rating Factor (πR)', 
        value: pi_R.toFixed(4),
        description: powerRatingDescription1
    });
 

let pi_S = 1;
let voltageStressDescription3 = '';

if (formData.transistorVoltageFactor) {
    // Use dropdown value if selected
    const voltageFactor = transistorVoltageFactors.find(v => v.range === formData.transistorVoltageFactor);
    pi_S = voltageFactor ? voltageFactor.pi_S : 1;
    voltageStressDescription3 = `Selected range: ${formData.transistorVoltageFactor}`;
} else if (formData.applied && formData.rated) {
    // Calculate from voltage ratio when manual values are entered
    const Vs = parseFloat(formData.applied) / parseFloat(formData.rated);
    
    // Calculate πS using the exponential formula for 0 < Vs ≤ 1.0
    if (Vs > 0 && Vs <= 1.0) {
        pi_S = 0.045 * Math.exp(3.1 * Vs);
        voltageStressDescription3 = `Vs (${Vs.toFixed(4)}) is in range 0 < Vs ≤ 1.0, calculated using πS = 0.045 * exp(3.1 * Vs)`;
    } else if (Vs <= 0) {
        pi_S = 0;  // or whatever value makes sense for Vs ≤ 0
        voltageStressDescription3 = `Vs (${Vs.toFixed(4)}) ≤ 0, so πS = 0`;
    } else {
        pi_S = 1.0;  // or whatever value makes sense for Vs > 1.0
        voltageStressDescription3 = `Vs (${Vs.toFixed(4)}) > 1.0, so πS = 1.0`;
    }
}

calculationDetails.push({ 
    name: 'Voltage Stress Factor (πS)', 
    value: pi_S.toFixed(4),
    description: voltageStressDescription3
});
           // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_A * pi_R * pi_S * pi_Q * pi_E;
            formula = 'λp = λb × πT × πA × πR × πS × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
        } else if (formData.componentType === 'lowFreqFET') {
            // Low frequency SI FET calculation
            const fetType = siFETTypes.find(t => t.name === formData.siFETType);
            lambda_b = fetType.lambda_b;
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });
// Temperature factor calculation
        let tempDescription4;
    if (formData.junctionTemp) {
        // Use the selected dropdown value
        const tempFactor =  siFETTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
            
        pi_T = tempFactor.pi_T;
        tempDescription4 = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-1925 * ((1/(Tj + 273)) - (1/298)));
        tempDescription4 = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription4 = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription4
    });
  // Application factor
            const appFactor = siFETAppFactors.find(a => a.name === formData.siFETAppFactor);
            pi_A = appFactor ? appFactor.pi_A : 1;
            calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });

            // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_A * pi_Q * pi_E;
            formula = 'λp = λb × πT × πA × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
        } else if (formData.componentType === 'transistorsUnijunction') {
            // Unijunction transistor calculation
            const unijunctionType = unijunctionTypes.find(t => t.name === formData.unijunctionType);
            lambda_b = unijunctionType.lambda_b;
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

            // Temperature factor (using table lookup)
            const tempFactor = unijunctionTempFactors.find(t => t.temp >= formData.junctionTemp) ||
                unijunctionTempFactors[unijunctionTempFactors.length - 1];
            pi_T = tempFactor.pi_T;
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

       let tempDescription5;
    if (formData.junctionTemp) {
        // Use the selected dropdown value
        const tempFactor =  unijunctionTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
            
        pi_T = tempFactor.pi_T;
        tempDescription5 = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-2483 * ((1/(Tj + 273)) - (1/298)));
        tempDescription5 = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription5 = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription5
    });
      // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_Q * pi_E;
            formula = 'λp = λb × πT × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
        } else if (formData.componentType === 'transistorsLowNoiseHighFreqBipolar') {

            // 6.6 Transistors, Low Noise, High Frequency, Bipolar calculation
            lambda_b = 0.18; // Base failure rate from your image
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

            // Temperature factor (using the specific formula from your image)
            let tempDescription6;
    if (formData.junctionTemp) {
        // Use the selected dropdown value
        const tempFactor = lowNoiseHighFreqTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
            
        pi_T = tempFactor.pi_T;
        tempDescription6 = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-2114 * ((1/(Tj + 273)) - (1/298)));
        tempDescription6 = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription6 = "No temperature input, using default πT = 1.0";
    }
calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription6
    });

// lowNoiseHighFreqPowerFactors
            
let powerRatingDescription1
 if (formData.powerRating) {
        // Use dropdown value if selected
        const powerFactor = lowNoiseHighFreqPowerFactors.find(p => p.power === formData.powerRating);
        pi_R = powerFactor ? powerFactor.pi_R : 1;
        powerRatingDescription1 = `Selected power factor: ${formData.powerRating} (πR = ${pi_R})`;
    } else if (formData.powerInput1) {
        // Calculate from manual input if provided
          const Pr = parseFloat(formData.powerInput1) || 1;
          pi_R = Math.pow(Pr, 0.37);
      
        pi_R = calculatePiR(Pr);
        powerRatingDescription1 = `Calculated from input power (${Pr} W): πR = ${pi_R.toFixed(4)}`;
    } 
  calculationDetails.push({ 
        name: 'Power Rating Factor (πR)', 
        value: pi_R.toFixed(4),
        description: powerRatingDescription1
    });
 // Voltage stress factor

let pi_S = 1;
let voltageStressDescription6 = '';

if (formData.voltageStressRatio) {
    // Use dropdown value if selected
    const voltageFactor = lowNoiseHighFreqVoltageFactors.find(v => v.range === formData.voltageStressRatio);
    pi_S = voltageFactor ? voltageFactor.pi_S : 1;
    voltageStressDescription6 = `Selected range: ${formData.voltageStressRatio}`;
} else if (formData.applied && formData.rated) {
    // Calculate from voltage ratio when manual values are entered
    const Vs = parseFloat(formData.applied) / parseFloat(formData.rated);
    
    // Calculate πS using the exponential formula for 0 < Vs ≤ 1.0
    if (Vs > 0 && Vs <= 1.0) {
        pi_S = 0.045 * Math.exp(3.1 * Vs);
        voltageStressDescription6 = `Vs (${Vs.toFixed(4)}) is in range 0 < Vs ≤ 1.0, calculated using πS = 0.045 * exp(3.1 * Vs)`;
    } else if (Vs <= 0) {
        pi_S = 0;  // or whatever value makes sense for Vs ≤ 0
        voltageStressDescription6 = `Vs (${Vs.toFixed(4)}) ≤ 0, so πS = 0`;
    } else {
        pi_S = 1.0;  // or whatever value makes sense for Vs > 1.0
        voltageStressDescription6 = `Vs (${Vs.toFixed(4)}) > 1.0, so πS = 1.0`;
    }
}

calculationDetails.push({ 
    name: 'Voltage Stress Factor (πS)', 
    value: pi_S.toFixed(4),
    description: voltageStressDescription6
});
 // Quality factor (specific to this component type)
            const qualityFactor = lowNoiseHighFreqQualityFactors.find(q => q.name === formData.lowNoiseHighFreqQuality);
            pi_Q = qualityFactor ? qualityFactor.pi_Q : 1;
            calculationDetails[0] = { name: 'Quality Factor (πQ)', value: pi_Q }; // Update first item

            // Get environment factor
            const envFactor = lowNoiseEnvironmentFactors.find(e => e.code === formData.environment);
            pi_E = envFactor ? envFactor.pi_E : 1;
            calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };

            // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_R * pi_S * pi_Q * pi_E;
            formula = 'λp = λb × πT × πR × πS × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
        } else if (formData.componentType === 'transistorsHighPowerHighFrequencyBipolar') {
            // 6.7 Transistors, High Power, High Frequency, Bipolar calculation

            // Get base failure rate from table or formula
//             const frequency = parseFloat(formData.frequencyGHz);
//             const power = parseFloat(formData.outputPowerWatts);
//             let lambda_b = 0;

//             // Find the appropriate row in the frequency/power table
//             if (frequency <= 0.5) {
//                 if (power <= 1.0) lambda_b = 0.038;
//                 else if (power <= 5.0) lambda_b = 0.039;
//                 else if (power <= 10) lambda_b = 0.040;
//                 else if (power <= 50) lambda_b = 0.050;
//                 else if (power <= 100) lambda_b = 0.67;
//                 else if (power <= 200) lambda_b = 0.12;
//                 else if (power <= 300) lambda_b = 0.20;
//                 else if (power <= 400) lambda_b = 0.36;
//                 else if (power <= 500) lambda_b = 0.62;
//                 // else if (power <= 600) lambda_b = 1.1;
//                 else lambda_b = 1.1;
//             } else if (frequency <= 1) {
//                 if (power <= 1.0) lambda_b = 0.046;
//                 else if (power <= 5.0) lambda_b = 0.047;
//                 else if (power <= 10) lambda_b = 0.048;
//                 else if (power <= 50) lambda_b = 0.060;
//                 else if (power <= 100) lambda_b = 0.080;
//                 else if (power <= 200) lambda_b = 0.14;
//                 else if (power <= 300) lambda_b = 0.24;
//                 else if (power <= 400) lambda_b = 0.42;
//                 else if (power <= 500) lambda_b = 0.74;
//                 else if (power <= 600) lambda_b = 1.3;
//                 else lambda_b = 1.3;
//             } else if (frequency <= 2) {
//                 if (power <= 1.0) lambda_b = 0.065;
//                 else if (power <= 5.0) lambda_b = 0.067;
//                 else if (power <= 10) lambda_b = 0.069;
//                 else if (power <= 50) lambda_b = 0.086;
//                 else if (power <= 100) lambda_b = 0.11;
//                 else if (power <= 200) lambda_b = 0.20;
//                 else if (power <= 300) lambda_b = 0.35;
//                 else lambda_b = 0.35;
//             } else if (frequency <= 3) {
//                 if (power <= 1.0) lambda_b = 0.093;
//                 else if (power <= 5.0) lambda_b = 0.095;
//                 else if (power <= 10) lambda_b = 0.098;
//                 else if (power <= 50) lambda_b = 0.12;
//                 else if (power <= 100) lambda_b = 0.16;
//                 else if (power <= 200) lambda_b = 0.28;

//                 else lambda_b = 0.28;
//             } else if (frequency <= 4) {
//                 if (power <= 1.0) lambda_b = 0.13;
//                 else if (power <= 5.0) lambda_b = 0.14;
//                 else if (power <= 10) lambda_b = 0.14;
//                 else if (power <= 50) lambda_b = 0.17;
//                 else lambda_b = 0.23;
//             } if (frequency <= 5) {
//                 if (power <= 1.0) lambda_b = 0.19;
//                 else if (power <= 5.0) lambda_b = 0.19;
//                 else if (power <= 10) lambda_b = 0.20;
//                 else if (power <= 50) lambda_b = 0.25;
//             } else {
//         // For frequencies not in the table or power ranges not covered, use the formula
//  lambda_b = 0.032 * Math.exp(354 * frequency + 0.00558 * power);
//         console.log('Calculated λb:', lambda_b);
//     }
    
//     calculationDetails.push({ 
//         name: 'Base Failure Rate (λb)', 
//         value: lambda_b.toFixed(6),
//         description: frequency >= 1 && frequency <= 10 ? 
//             `From table: F=${frequency}GHz, P=${power}W` : 
//             `Calculated from formula: 0.032 * exp(354*${frequency} + 0.0058*${power}) = ${lambda_b.toFixed(6)}`
//     });
    // else {
    //             // For frequencies > 4GHz, use the formula
    //             lambda_b = 0.032 * Math.exp(354 * frequency + 0.00558 * power);
    //         }

    //         calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b?.toFixed(6) });


    // Get base failure rate from table or formula
    const frequency = parseFloat(formData.frequencyGHz);
    const power = parseFloat(formData.outputPowerWatts);
    let lambda_b = 0;
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
        lambda_b = 0.032 * Math.exp(354 * frequency + 0.00558 * power);
        description = `Calculated from formula: 0.032 * exp(354*${frequency} + 0.00558*${power})`;
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
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
        } else if (formData.componentType === 'transistorsHighFrequencyGaAsFET') {
            // 6.8 Transistors, High Frequency, GaAs FET calculation

            // Get base failure rate from table
         const frequency = parseFloat(formData.frequencyGHzGaAs);
    const power = parseFloat(formData.outputPowerWattsGaAs);
    let lambda_b = 0;
    
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
        // For frequencies not in the table or power ranges not covered, use the formula
        lambda_b = 0.0093 * Math.exp(0.429 * frequency + 0.486 * power);
        console.log('Calculated λb:', lambda_b);
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
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
        } else if (formData.componentType === 'transistorsHighFrequencySIFET') {
            // 6.9 Transistors, High Frequency, SI FET calculation

            // Get base failure rate
            const fetType = siFETTypesHF.find(t => t.name === formData.siFETTypeHF);
            const lambda_b = fetType.lambda_b;
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

            // Temperature factor (using table lookup)
 let pi_T = 1;
     let tempDescription9;
    if (formData.junctionTempSIFET) {
        // Use the selected dropdown value
        const tempFactor = siFETTempFactorsHF.find(t => t.temp === parseInt(formData.junctionTempSIFET));
       pi_T = tempFactor.pi_T;
        tempDescription9 = `From table: ${formData.junctionTempSIFET}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-1925 * ((1/(Tj + 273)) - (1/298)));
        tempDescription9 = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription9 = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription9
    });

    // Quality factor (specific to this component type)
            const qualityFactor = siFETQualityFactors.find(q => q.name === formData.qualitySIFET);
            pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
            calculationDetails[0] = { name: 'Quality Factor (πQ)', value: pi_Q };

            // Environment factor (use existing)
            const envFactor = siFETEnvironmentFactors.find(e => e.code === formData.environment);
            pi_E = envFactor ? envFactor.pi_E : 1;
            calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };


            // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_Q * pi_E;
            formula = 'λp = λb × πT × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
        } else if (formData.componentType === 'thyristorsAndSCRS') {
            // 6.10 Thyristors and SCRS calculation
            const thyristorType = thyristorTypes.find(t => t.name === formData.thyristorType);
            lambda_b = thyristorType.lambda_b;
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

            let pi_T = 1;
     let tempDescription10;
    if (formData.junctionTemp) {
        // Use the selected dropdown value
      
        const tempFactor = thyristorTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
         pi_T = tempFactor.pi_T;
        tempDescription10 = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-3082 * ((1/(Tj + 273)) - (1/298)));
        tempDescription10 = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription10 = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription10
    });
     

           let pi_R = 1;
    let powerRatingDescription10 = '';

    if (formData.thyristorCurrent) {
        // Use dropdown value if selected
       const currentFactor = thyristorCurrentFactors.find(c => c.current === parseInt(formData.thyristorCurrent));
            pi_R = currentFactor ? currentFactor.pi_R : 1.0;
        powerRatingDescription10 = `Selected power factor: ${formData.thyristorCurrent} (πR = ${pi_R})`;
    } else if (formData.powerInput2) {
        // Calculate from manual input if provided
          const Pr = parseFloat(formData.powerInput2) || 1;
          pi_R = Math.pow(Pr, 0.40);
      
        // pi_R = calculatePiR(Pr);
        pi_R = Math.pow(Pr, 0.40);
        
        powerRatingDescription10 = `Calculated from input power (${Pr} W): πR = ${pi_R.toFixed(4)}`;
    } 
  calculationDetails.push({ 
        name: 'Power Rating Factor (πR)', 
        value: pi_R.toFixed(4),
        description: powerRatingDescription10
    });

let pi_S = 1;
    let voltageStressFactorsDescription10 = '';
   if (formData.thyristorVoltage) {
        // Use dropdown value if selected
         const voltageFactor = thyristorVoltageFactors.find(v => v.range === formData.thyristorVoltage);
            pi_S = voltageFactor ? voltageFactor.pi_S : 1.0;
         voltageStressFactorsDescription10= `Selected power factor: ${formData.thyristorVoltage} (πS = ${pi_S})`;
    } else if (formData.powerInput3) {
        // Calculate from manual input if provided
          const vs = parseFloat(formData.powerInput3) || 1;
          pi_S = Math.pow(vs, 1.9);
        // pi_S = calculatePiR(Pr);
        pi_S = Math.pow(vs, 1.9);

    
        voltageStressFactorsDescription10 = `Calculated from input power (${vs} W): πS = ${pi_S.toFixed(4)}`;
    } 
  calculationDetails.push({ 
        name: 'Voltage Stress Factor (πS)', 
        value: pi_S.toFixed(4),
        description:  voltageStressFactorsDescription10
    });
       // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_R * pi_S * pi_Q * pi_E;
            formula = 'λp = λb × πT × πR × πS × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
            // Add this case to your calculateFailureRate function
        } else if (formData.componentType === 'optoelectronics') {
            // Optoelectronics calculation
            const optoType = optoelectronicTypes.find(t => t.name === formData.optoelectronicType);
            const lambda_0 = optoType.lambda_0;
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_0 });

            // Temperature factor (using formula from image)
           let pi_T = 1;
     let tempDescription11;
    if (formData.junctionTemp) {
        // Use the selected dropdown value
      
        const tempFactor = optoTempFactors.find(t => t.temp === parseInt(formData.junctionTemp));
         pi_T = tempFactor.pi_T;
        tempDescription11 = `From table: ${formData.junctionTemp}°C → πT = ${pi_T}`;
    } else if (formData.junctionTempInput) {
        // Calculate from manual input using the formula
        const Tj = parseFloat(formData.junctionTempInput);
        pi_T = Math.exp(-2790 * ((1/(Tj + 273)) - (1/298)));
        tempDescription11 = `Calculated: πT = exp(-2100 * (1/(${Tj}+273) - 1/298) = ${pi_T.toFixed(4)}`;
    } else {
        // Default to 25°C if no input provided
        pi_T = 1.0;
        tempDescription11 = "No temperature input, using default πT = 1.0";
    }
    
    calculationDetails.push({ 
        name: 'Temperature Factor (πT)', 
        value: pi_T.toFixed(4),
        description: tempDescription11
    });

 const envFactor = optoElectroEnvironmentFactors.find(e => e.code === formData.environment);
            pi_E = envFactor ? envFactor.pi_E : 1;
            calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };

            // calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });
            // Calculate final failure rate
            lambda_p = lambda_0 * pi_T * pi_Q * pi_E;
            formula = 'λp = λb × πT × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
            // Add this case to your calculateFailureRate function
        } else if (formData.componentType === 'alphanumericDisplays') {
    
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
            console.log('lambda_b:', lambda_b);
           lambda_p = λ_b * pi_T * pi_Q * pi_E;
    formula = 'λp = λb × πT × πQ × πE';
    if (onCalculate) {
        onCalculate(lambda_p, calculationDetails, formula); 
    }
        } else if (formData.componentType === 'laserDiode') {
            // Laser Diode calculation
            const diodeType = laserDiodeTypes.find(d => d.name === formData.laserDiodeType);
            lambda_b = diodeType.lambda_b;
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

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
            lambda_p = lambda_b * pi_T * pi_Q * pi_I * pi_A * pi_P * pi_E;
            formula = 'λp = λb × πT × πQ × πI × πA × πP × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
        }

        setResults({
            failureRate: lambda_p.toExponential(4),
            calculationDetails,
            formula,
            componentType: formData.componentType
        });
    };
    const [inputData, setInputData] = useState({
        componentstype: componentTypes[0], // or your default value
        // ...other initial state properties
    });
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
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999
        })
    };

    return (
        <Container>
            <div className="container mt-4 background">
                <h2 className="text-center">Diode</h2>

                {/* Component Selection Section */}

                    {/* <h4 className="mb-3">Component Selection</h4> */}
                    
                    <div className="form-group">
                       <label>Part Type</label>
              <select
                name="componentType"
                // className="form-control"
                value={formData.componentType}
                onChange={handleInputChange}
              >
                {componentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
                        </div>

                        <Row>
                    {formData.componentType === 'lowFreqDiode' && (
                          <>
                                     <Col md={4}>
                                    <div className="form-group">
                                            <label>Diode Type λb </label>
                                            <select
                                                name="diodeType"
                                                // className="form-control"
                                                value={formData.diodeType}
                                                onChange={handleInputChange}
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
                                            value={formData.junctionTemp}
                                            onChange={handleInputChange}
                                        />
       
                                          <div class="invalid-feedback">
        Please provide a valid city.
      </div>
                                        </div>
                                    </Col>
                                      <Col md={4}>
                                    <div className="form-group">
                                        <label>Environment πE</label>
                                        <select
                                            name="environment"
                                            className="form-control"
                                            value={formData.environment}
                                            onChange={handleInputChange}
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
                                            // className="form-control"
                                            value={formData.quality}
                                            onChange={handleInputChange}
                                        >
                                            {qualityFactors.map(factor => (
                                                <option key={factor.name} value={factor.name}>{factor.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    </Col>


                                {formData.diodeType.includes('High Voltage Stacks') && (
                                    
                                    <Col md={4}>
                                            <div className="form-group">
                                                <label>Number of Junctions</label>
                                                <input
                                                    type="number"
                                                    name="numJunctions"
                                                    className="form-control"
                                                    min="1"
                                                    value={formData.numJunctions}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </Col>
                                    
                                )}
                           
                        </>

                    )}
                     {formData.componentType === 'lowFreqDiode' && !(
                            formData.diodeType.includes('Transient Suppressor') ||
    formData.diodeType.includes('Voltage Regulator') ||
    formData.diodeType.includes('Current Regulator')
) && (
    <>
        <Col md={4}>
            <div className="form-group">
                <label>Voltage Stress Ratio (Vs) πS</label>
                    <select
                name="voltageStress"
                className="form-control"
                value={formData.voltageStress}
                onChange={handleInputChange}
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
                <label>Voltage Applied (V) πs</label>
                <input
                    type="number"
                    name="voltageApplied"
                    className="form-control"
                    step="0.1"
                    min="0"
                    value={formData.voltageApplied}
                    onChange={handleInputChange}
                    disabled={!!formData.voltageStress}
                />
            </div>
        </Col>
        <Col md={4}>
            <div className="form-group">
                <label>Voltage Rated (V) πs</label>
                <input
                    type="number"
                    name="voltageRated"
                    className="form-control"
                    step="0.1"
                    min="0.1"
                    value={formData.voltageRated}
                    onChange={handleInputChange}
                    disabled={!!formData.voltageStress}
                />
            </div>
        </Col>
        {formData.voltageStressRatio !== undefined && !formData.voltageStress && (
            <Col md={4}>
                <div className="form-group">
                    <label>Calculated Voltage Stress Ratio πs</label>
                    <input
                        type="number"
                        className="form-control"
                        readOnly
                        value={formData.voltageStressRatio.toFixed(4)}
                    />
                </div>
            </Col>
        )}
        
                                        <Col md={4}>
                                        <div className="form-group">
                                            <label>Contact Construction Factor πC	 </label>
                                            <select
                                                name="contactConstruction"
                                                // className="form-control"
                                                value={formData.contactConstruction}
                                                onChange={handleInputChange}
                                            >
                                                {contactConstructionFactors.map(type => (
                                                    <option key={type.type} value={type.type}>{type.type}</option>
                                                ))}
                                            </select>
                                            </div>
                                        </Col>
                                       
                                    
                                </>
                            )}
                             </Row>
                     
                    {formData.componentType === 'highFreqDiode' && (
                        <div>
                            <Row>
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Diode Type</label>
                                    <select
                                        name="highFreqDiodeType"
                                        className="form-control"
                                        value={formData.highFreqDiodeType}
                                        onChange={handleInputChange}
                                    >
                                        {highFreqDiodeTypes.map(type => (
                                            <option key={type.name} value={type.name}>{type.name}</option>
                                        ))}
                                    </select>
                                    </div>
                                </Col>
                                <Col md={4}>
                                <div className="form-group">
                                    <label>Application</label>
                                    <select
                                        name="highFreqAppFactor"
                                        className="form-control"
                                        value={formData.highFreqAppFactor}
                                        onChange={handleInputChange}
                                    >
                                        {highFreqAppFactors.map(factor => (
                                            <option key={factor.name} value={factor.name}>{factor.name}</option>
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
                                        onChange={handleInputChange}
                                    >
                                        {highFreqDiodeEnvironmentFactors.map(factor => (
                                            <option key={factor.code} value={factor.code}>
                                                {factor.code} - {factor.name} (πE = {factor.pi_E})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                </Col>
                            <Col md={4}>
    <div className="form-group">
        <label>Power Rating πR</label>
        <select
            name="highFreqPowerFactor"
            className="form-control"
            value={formData.highFreqPowerFactor}
            onChange={handleInputChange}
        >
            <option value="">Calculate from input power</option>
            {highFreqPowerFactors.map(factor => (
                <option key={factor.power} value={factor.power}>
                    {factor.power} (πR = {factor.pi_R})
                </option>
            ))}
        </select>
    </div>
</Col>
<Col md={4}>
    <div className="form-group">
        <label>Input Power (P_i in Watts)πR</label>
        <input
            type="number"
            name="powerInput"
            className="form-control"
            min="0.1"
            step="0.1"
            value={formData.powerInput}
            onChange={handleInputChange}
            disabled={!!formData.highFreqPowerFactor}
        />
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
                                        value={formData.junctionTemp}
                                        onChange={handleInputChange}
                                    />
                                    </div>
                                </Col>

                                <Col md={4}>
                                <div className="form-group">
                                    <label>Quality πQ</label>

                                    <select
                                        name="quality"
                                        className="form-control"
                                        value={formData.quality}
                                        onChange={handleInputChange}
                                    >
                                        {formData.highFreqDiodeType === 'Schottky Barrier (including Detectors) and Point Contact' ? (
                                            highFreqQualityFactors2.map(factor => (
                                                <option key={factor.name} value={factor.name}>
                                                    {factor.name} (πQ = {factor.pi_Q !== null ? factor.pi_Q : '—'})
                                                </option>
                                            ))
                                        ) : (
                                            highFreqQualityFactors1.map(factor => (
                                                <option key={factor.name} value={factor.name}>
                                                    {factor.name} (πQ = {factor.pi_Q !== null ? factor.pi_Q : '—'})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {formData.componentType === 'lowFreqBipolar' && (
                        <div>
                               <Row>
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Diode Type</label>
                                    < select
                                        name="diode"

                                    >
                                        <option value="NPN and PNP">NPN and PNP</option>
                                    </select>
                                    </div>
                                </Col>
                            
                         
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Application</label>
                                    <select
                                        name="transistorAppFactor"
                                        // className="form-control"
                                        value={formData.transistorAppFactor}
                                        onChange={handleInputChange}
                                    >
                                        {transistorAppFactors.map(factor => (
                                            <option key={factor.name} value={factor.name}>{factor.name}</option>
                                        ))}
                                    </select>
                                    </div>
                                </Col>
                     
        
         <Col md={4}>
    <div className="form-group">
        <label>Power Rating πR</label>
        <select
            name="transistorPowerFactor"
            className="form-control"
            value={formData.transistorPowerFactor}
            onChange={handleInputChange}
        >
            <option value="">Calculate from input power</option>
            {transistorPowerFactors.map(factor => (
                <option key={factor.power} value={factor.power}>
                    {factor.power} (πR = {factor.pi_R})
                </option>
            ))}
        </select>
    </div>
</Col>

<Col md={4}>
    <div className="form-group">
        <label>Calculate power rate πR</label>
        <input
            type="number"
            name="powerInput1"
            className="form-control"
            min="0.1"
            step="0.1"
            value={formData.powerInput1}
            onChange={handleInputChange}
            disabled={!!formData.transistorPowerFactor}
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
                                        onChange={handleInputChange}
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
                    <label>Voltage Stress Ratio (Vs) πS</label>
                    <select
                        name="transistorVoltageFactor"
                        className="form-control"
                        value={formData.transistorVoltageFactor}
                        onChange={handleInputChange}
                    >
                        <option value="">Select or calculate below</option>
                        {transistorVoltageFactors.map(factor => (
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
                        onChange={handleInputChange}
                        disabled={!!formData.transistorVoltageFactor}
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
                        onChange={handleInputChange}
                        disabled={!!formData.transistorVoltageFactor}
                    />
                </div>
            </Col>

            {formData.applied && formData.rated && !formData.transistorVoltageFactor && (
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
                        className="form-control"
                        value={formData.junctionTemp}
                        onChange={handleInputChange}
                    >
                        <option value="">Enter manual temperature</option>
                        {TransistorTempFactors.map(item => (
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
                        onChange={handleInputChange}
                        disabled={!!formData.junctionTemp} // Disable if dropdown value is selected
                    />
                </div>
            </Col>
                            <Col md={4}>
                            <div className="form-group">
                            <label>Quality πQ</label>
                            <select
                                name="quality"
                                // className="form-control"
                                value={formData.quality}
                                onChange={handleInputChange}
                            >
                                {qualityFactors.map(factor => (
                                    <option key={factor?.name} value={factor?.name}>{factor?.name}</option>
                                ))}
                            </select>
</div>
</Col>
</Row>
                        </div>
                        
                    )}
                {formData.componentType === 'lowFreqFET' && (
                    <div>

                        <Row>
                        <Col md={4}>
                            <div className="form-group">
                                <label>Transistor Type</label>
                                <select
                                    name="siFETType"
                                    value={formData.siFETType}
                                    onChange={handleInputChange}
                                >
                                    {siFETTypes.map(type => (
                                        <option key={type.name} value={type.name}>{type.name}</option>
                                    ))}
                                </select>
                                </div>
                            </Col>
                            <Col md={4}>
                            <div className="form-group">
                                <label>Application</label>
                                <select
                                    name="siFETAppFactor"
                                    value={formData.siFETAppFactor}
                                    onChange={handleInputChange}
                                >
                                    {siFETAppFactors.map(factor => (
                                        <option key={factor.name} value={factor.name}>{factor.name}</option>
                                    ))}
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
                                onChange={handleInputChange}
                            >
                                     <option value="">Enter manual temperature</option>
                                {siFETTempFactors.map(item => (
                                    
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                // className="form-control"
                                value={formData.quality}
                                onChange={handleInputChange}
                            >
                                {qualityFactors.map(factor => (
                                    <option key={factor.name} value={factor.name}>{factor.name}</option>
                                ))}
                            </select>
                        </div>
                        </Col>
                        </Row>
                    </div>
                )}
                {formData.componentType === 'transistorsUnijunction' && (
                    <>
                    <Row>
                         <Col md={4}>
                            <div className="form-group">
                                <label>Transistor Type</label>
                                <select
                                    name="unijunctionType"
                                    value={formData.unijunctionType}
                                    onChange={handleInputChange}
                                >
                                    {unijunctionTypes.map(type => (
                                        <option key={type.name} value={type.name}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                            </Col>
                            <Col md={4}>
                            <div className="form-group">
                            <label>Junction Temperature (°C) πT</label>
                            {/* <label>Junction Temperature (°C) πT</label> */}
                            <select
                                name="junctionTemp"
                                value={formData.junctionTemp}
                                onChange={handleInputChange}
                            >
                                   <option value="">Enter manual temperature</option>
                                {unijunctionTempFactors.map(item => (
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                // className="form-control"
                                value={formData.quality}
                                onChange={handleInputChange}
                            >
                                {qualityFactors.map(factor => (
                                    <option key={factor.name} value={factor.name}>{factor.name}</option>
                                ))}
                            </select>
                        </div>
                        </Col>
                        </Row>
                    </>
                )}
                {formData.componentType === 'transistorsLowNoiseHighFreqBipolar' && (
                    <>
                        <Row>
                        <Col md={4}>
                            <div className="form-group">
                                <label>Base Failure Rate (λb)</label>
                                <select
                                    type="text"
                                    // className="form-control"
                                    value="0.18 failures/10⁶ hours"
                                    readOnly
                                >
                                    <option value={"0.18 failures/10⁶ hours"}>All Types</option>
                                </select>
                                </div>
                            </Col>
                            <Col md={4}>
                            <div className="form-group">
                                <label>Power Rating πR</label>
                                <select
                                    name="powerRating"
                                    // className="form-control"
                                    value={formData.powerRating}
                                    onChange={handleInputChange}
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
        <label>Calculate power rate πR</label>
        <input
            type="number"
            name="powerInput1"
            className="form-control"
            min="0.1"
            step="0.1"
            value={formData.powerInput1}
            onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                            onChange={handleInputChange}
                        >
                            {lowNoiseHighFreqQualityFactors.map(factor => (
                                <option key={factor.name} value={factor.name}>
                                    {factor.name} (πQ = {factor.pi_Q})
                                </option>
                            ))}
                        </select>
                        </div>
                        </Col>
                        </Row>
                    </>
                )}
                {formData.componentType === 'transistorsHighPowerHighFrequencyBipolar' && (
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
            onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                            onChange={handleInputChange}
                        >
                            <option value="JANTXV">JANTXV (πQ = 0.50)</option>
                            <option value="JANTX">JANTX (πQ = 1.0)</option>
                            <option value="JAN">JAN (πQ = 2.0)</option>
                            <option value="Lower">Lower (πQ = 5.0)</option>
                        </select>
</div>
</Col>
</Row>
                    </>
                )}
                {formData.componentType === 'transistorsHighFrequencyGaAsFET' && (
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
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                                        onChange={handleInputChange}
                                    >
                                        {gaAsQualityFactors.map(factor => (
                                            <option key={factor.name} value={factor.name}>
                                                {factor.name} (πQ = {factor.pi_Q})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                       </Col>
                       </Row>
                    </>
                )}
                {formData.componentType === 'transistorsHighFrequencySIFET' && (
                    <>
                      <Row>
                            <Col md={4}>
                                <div className="form-group">
                                    <label>Transistor Type</label>
                                    <select
                                        name="siFETTypeHF"
                                        // className="form-control"
                                        value={formData.siFETTypeHF}
                                        onChange={handleInputChange}
                                    >
                                        {siFETTypesHF.map(type => (
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
                                name="junctionTempSIFET"
                                className="form-control"
                                value={formData.junctionTempSIFET}
                                onChange={handleInputChange}
                            >
                                     <option value="">Enter manual temperature</option>
                                { siFETTempFactorsHF.map(item => (
                                    
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
                                    onChange={handleInputChange}
                                    disabled={!!formData.junctionTempSIFET} // Disable if dropdown value is selected 
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
                                onChange={handleInputChange}
                            >
                                {siFETEnvironmentFactors.map(factor => (
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
                                        name="qualitySIFET"
                                        // className="form-control"
                                        value={formData.qualitySIFET}
                                        onChange={handleInputChange}
                                    >
                                        {siFETQualityFactors.map(factor => (
                                            <option key={factor.name} value={factor.name}>
                                                {factor.name} (πQ = {factor.pi_Q})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                </Col>
                                </Row>
                    </>
                )}
                {formData.componentType === 'thyristorsAndSCRS' && (
                    <>
                        <Row>
                        <Col md={4}>
                            <div className="form-group">
                                <label>Device Type λb</label>
                                <select
                                    name="thyristorType"
                                    // className="form-control"
                                    value={formData.thyristorType}
                                    onChange={handleInputChange}
                                >
                                    {thyristorTypes.map(type => (
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
                                name="junctionTemp"
                                className="form-control"
                                value={formData.junctionTemp}
                                onChange={handleInputChange}
                            >
                                     <option value="">Enter manual temperature</option>
                                { thyristorTempFactors.map(item => (
                                    
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
                                    onChange={handleInputChange}
                                    disabled={!!formData.junctionTemp} // Disable if dropdown value is selected 
                                />
                            </div>
                            </Col>  

                       
                            <Col md={4}>
                            <div className="form-group">
                                <label>Forward Current (A) πR</label>
                                <select
                                    name="thyristorCurrent"
                                    // className="form-control"
                                    value={formData.thyristorCurrent}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select or calculate below</option> 
                                    {thyristorCurrentFactors.map(factor => (
                                        <option key={factor.current} value={factor.current}>
                                            {factor.current}A (πR = {factor.pi_R})
                                        </option>
                                    ))}
                                </select>
                                </div>
                            </Col>
 
<Col md={4}>
    <div className="form-group">
        <label>Input Current Rating πR</label>
        <input
            type="number"
            name="powerInput2"
            className="form-control"
            min="0.1"
            step="0.1"
            value={formData.powerInput2}
            onChange={handleInputChange}
            disabled={!!formData.thyristorCurrent}
        />
    </div>
</Col>
<Col md={4}>
                            <div className="form-group">
                                <label>Voltage Stress Ratio πS</label>
                                <select
                                    name="thyristorVoltage"
                                    // className="form-control"
                                    value={formData.thyristorVoltage}
                                    onChange={handleInputChange}
                                >
                                       <option value="">Select or calculate below</option> 
                                    {thyristorVoltageFactors.map(factor => (
                                        <option key={factor.range} value={factor.range}>
                                            {factor.range} (πS = {factor.pi_S})
                                        </option>
                                    ))}
                                </select>
                                </div>
                            </Col>

                       <Col md={4}>
    <div className="form-group">
        <label>Input Voltage Stress Ratio πS</label>
        <input
            type="number"
            name="powerInput3"
            className="form-control"
            min="0.1"
            step="0.1"
            value={formData.powerInput3}
            onChange={handleInputChange}
            disabled={!!formData.thyristorVoltage}
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
                                onChange={handleInputChange}
                            >
                                {environmentFactors.map(factor => (
                                    <option key={factor?.code} value={factor?.code}>
                                        {factor?.code} - {factor?.name} (πE = {factor?.pi_E})
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
                                        onChange={handleInputChange}
                                    >
                                        {qualityFactors.map(factor => (
                                            <option key={factor?.name} value={factor?.name}>
                                                {factor?.name} (πQ = {factor?.pi_Q})
                                            </option>
                                        ))}
                                    </select>
                        </div>
                        </Col>
                        </Row>
                    </>
                )}
                {formData.componentType === 'optoelectronics' && (
                    <>
                        <Row>
                        <Col md={4}>
                            <div className="form-group">
                                <label>Optoelectronic Type λb</label>
                                <select
                                    name="optoelectronicType"
                                    // className="form-control"
                                    value={formData.optoelectronicType}
                                    onChange={handleInputChange}
                                >
                                    {optoelectronicTypes.map(type => (
                                        <option key={type.name} value={type.name}>
                                            {type.name} (λb = {type.lambda_0})
                                        </option>
                                    ))}
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
                        onChange={handleInputChange}
                    >
                        <option value="">Enter manual temperature</option>
                        {optoTempFactors.map(item => (
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
                        onChange={handleInputChange}
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
                                onChange={handleInputChange}
                            >
                                {optoElectroEnvironmentFactors.map(factor => (
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
                                onChange={handleInputChange}
                            >
                                {qualityFactors.map(factor => (
                                    <option key={factor.name} value={factor.name}>{factor.name}</option>
                                ))}
                            </select>
                        </div>
                        </Col>
                        </Row>
                    </>
                )}

                {formData.componentType === 'alphanumericDisplays' && (
                    <>
                        <Row>
          <Col md={4}>
                <div className="form-group">
                    <label>Display Type</label>
                    <select
                        name="displayType"
                        className="form-control"
                        value={formData.displayType}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                                onChange={handleInputChange}
                            >
                                {qualityFactors.map(factor => (
                                    <option key={factor.name} value={factor.name}>{factor.name}</option>
                                ))}
                            </select>
                        </div>
                        </Col>
                        </Row>

                    </>
                )}
                
              
                {formData.componentType === 'laserDiode' && (
                    <>
                        <Row>
       <Col md={4}>
    <div className="form-group">
        <label>Forward Current (A) πI</label>
        <select
            name="laserDiodeCurrent"
            className="form-control"
            value={formData.laserDiodeCurrent}
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                onChange={handleInputChange}
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
            onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
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
                                    onChange={handleInputChange}
                                    disabled={!!formData.laserDiodeTemp} // Disable if dropdown value is selected 
                                />
                            </div>
                            </Col>   
                        </Row>
                    </>
                )}
              
                {/* Quality & Environment Section */}

                <br />

              
       
                   
                    <br />
                    <Button
                        className="btn-calculate float-end mt-1"
                        variant="primary"
                        onClick={calculateFailureRate}
                    >
                        Calculate FR
                    </Button>


             
                {results && (
                
                        <div className="d-flex align-items-center">
                        <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong> {parseFloat(results?.failureRate)?.toFixed(6)} failures/10<sup>6</sup> hours
                        </div>
                
                )}
                <br />

              
            </div>
        </Container>
    );
};

export default MicroDiode;