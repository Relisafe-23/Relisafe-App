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
const Diode = ({ onCalculate }) => {
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
    const highFreqPowerFactors = [
        { power: 'Pr ≤ 10W', pi_R: 0.50 },
        { power: '10W < Pr ≤ 100W', pi_R: 1.3 },
        { power: '100W < Pr ≤ 1000W', pi_R: 2.0 },
        { power: '1000W < Pr ≤ 3000W', pi_R: 2.4 },
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
        laserDiodeEnvironment: environmentFactors[0].code
    };
    // State for form inputs
    const [formData, setFormData] = useState(initialState);
    const [results, setResults] = useState(null);
    const [showCalculations, setShowCalculations] = useState();

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            let tempFactors;
            if (formData.diodeType.includes('Voltage Regulator') ||
                formData.diodeType.includes('Current Regulator')) {
                tempFactors = lowFreqDiodeTempFactors2;
            } else {
                tempFactors = lowFreqDiodeTempFactors1;
            }

            // Find the closest temperature in the table
            const tempFactor = tempFactors.reduce((prev, curr) =>
                Math.abs(curr.temp - formData.junctionTemp) < Math.abs(prev.temp - formData.junctionTemp) ? curr : prev
            );
            pi_T = tempFactor.pi_T;
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

            // Voltage stress factor
            if (formData.diodeType.includes('Transient Suppressor') ||
                formData.diodeType.includes('Voltage Regulator') ||
                formData.diodeType.includes('Current Regulator')) {
                pi_S = 1.0;
            } else {
                if (formData.voltageStress <= 0.3) {
                    pi_S = 0.11;
                } else if (formData.voltageStress <= 0.4) {
                    pi_S = 0.19;
                } else if (formData.voltageStress <= 0.5) {
                    pi_S = 0.29;
                } else if (formData.voltageStress <= 0.6) {
                    pi_S = 0.42;
                } else if (formData.voltageStress <= 0.7) {
                    pi_S = 0.58;
                } else if (formData.voltageStress <= 0.8) {
                    pi_S = 0.77;
                } else if (formData.voltageStress <= 0.9) {
                    pi_S = 1.0;
                } else if (formData.voltageStress > 0.3 && formData.voltageStress <= 1.0) {
                    pi_S = Math.pow(formData.voltageStress, 2.43);
                }
            }
            calculationDetails.push({ name: 'Electrical Stress Factor (πS)', value: pi_S?.toFixed(4) });

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
            let tempFactors;
            if (formData.highFreqDiodeType === 'SI IMPATT (≤ 35 GHz)') {
                // formData.highFreqDiodeType === 'Gunn/Bulk Effect'
                // Use the second table (higher temperature factors)
                tempFactors = highFreqDiodeTempFactors2;
            } else {
                // Use the first table for all other diode types
                tempFactors = highFreqDiodeTempFactors1;
            }

            // Find the closest temperature in the table
            const tempFactor = tempFactors.reduce((prev, curr) =>
                Math.abs(curr.temp - formData.junctionTemp) < Math.abs(prev.temp - formData.junctionTemp) ? curr : prev
            );
            pi_T = tempFactor.pi_T;
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

            // Application factor

            const appFactor = highFreqAppFactors.find(a => a.name === formData.highFreqAppFactor);
            pi_A = appFactor ? appFactor.pi_A : 1;
            calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });
            // Power rating factor
            const powerFactor = highFreqPowerFactors.find(p => p.power === formData.highFreqPowerFactor);
            pi_R = powerFactor ? powerFactor.pi_R : 1;
            calculationDetails.push({ name: 'Power Rating Factor (πR)', value: pi_R });
            // Quality factor (specific to high frequency diodes)
            // Quality factor
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

            // Temperature factor (simplified)
            pi_T = 1 + (formData.junctionTemp - 25) * 0.05;
            const tempFactor = transistorTempFactors.find(t => t.temp >= formData.junctionTemp) ||
                transistorTempFactors[transistorTempFactors.length - 1];
            pi_T = tempFactor.pi_T;
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });


            // Application factor
            const appFactor = transistorAppFactors.find(a => a.name === formData.transistorAppFactor);
            pi_A = appFactor ? appFactor.pi_A : 1;
            calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });

            // Power rating factor (simplified)
            const powerFactor = transistorPowerFactors.find(p => p.power === formData.transistorPowerFactor);
            pi_R = powerFactor ? powerFactor.pi_R : 1;
            calculationDetails.push({ name: 'Power Rating Factor (πR)', value: pi_R });

            // Voltage stress factor (simplified)
            const voltageFactor = transistorVoltageFactors.find(v => v.range === formData.transistorVoltageFactor);
            pi_S = voltageFactor ? voltageFactor.pi_S : 1;
            calculationDetails.push({ name: 'Voltage Stress Factor (πS)', value: pi_S });

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

            // Temperature factor (using table lookup)
            const tempFactor = siFETTempFactors.find(t => t.temp >= formData.junctionTemp) ||
                siFETTempFactors[siFETTempFactors.length - 1];
            pi_T = tempFactor.pi_T;
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

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
            pi_T = calculateLowNoiseHighFreqTempFactor(formData.junctionTemp);
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T?.toFixed(4) });

            // Power rating factor
            const powerFactor = lowNoiseHighFreqPowerFactors.find(p => p.power === formData.powerRating);
            pi_R = powerFactor ? powerFactor.pi_R : 1;
            calculationDetails.push({ name: 'Power Rating Factor (πR)', value: pi_R });

            // Voltage stress factor
            const voltageFactor = lowNoiseHighFreqVoltageFactors.find(v => v.range === formData.voltageStressRatio);
            pi_S = voltageFactor ? voltageFactor.pi_S : 1;
            calculationDetails.push({ name: 'Voltage Stress Factor (πS)', value: pi_S });

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
            const frequency = parseFloat(formData.frequencyGHz);
            const power = parseFloat(formData.outputPowerWatts);
            let lambda_b = 0;

            // Find the appropriate row in the frequency/power table
            if (frequency <= 0.5) {
                if (power <= 1.0) lambda_b = 0.038;
                else if (power <= 5.0) lambda_b = 0.039;
                else if (power <= 10) lambda_b = 0.040;
                else if (power <= 50) lambda_b = 0.050;
                else if (power <= 100) lambda_b = 0.67;
                else if (power <= 200) lambda_b = 0.12;
                else if (power <= 300) lambda_b = 0.20;
                else if (power <= 400) lambda_b = 0.36;
                else if (power <= 500) lambda_b = 0.62;
                // else if (power <= 600) lambda_b = 1.1;
                else lambda_b = 1.1;
            } else if (frequency <= 1) {
                if (power <= 1.0) lambda_b = 0.046;
                else if (power <= 5.0) lambda_b = 0.047;
                else if (power <= 10) lambda_b = 0.048;
                else if (power <= 50) lambda_b = 0.060;
                else if (power <= 100) lambda_b = 0.080;
                else if (power <= 200) lambda_b = 0.14;
                else if (power <= 300) lambda_b = 0.24;
                else if (power <= 400) lambda_b = 0.42;
                else if (power <= 500) lambda_b = 0.74;
                // else if (power <= 600) lambda_b = 1.3;
                else lambda_b = 1.3;
            } else if (frequency <= 2) {
                if (power <= 1.0) lambda_b = 0.065;
                else if (power <= 5.0) lambda_b = 0.067;
                else if (power <= 10) lambda_b = 0.068;
                else if (power <= 50) lambda_b = 0.069;
                else if (power <= 100) lambda_b = 0.11;
                else if (power <= 200) lambda_b = 0.20;
                // else if (power <= 300) lambda_b = 0.35;
                else lambda_b = 0.35;
            } else if (frequency <= 3) {
                if (power <= 1.0) lambda_b = 0.093;
                else if (power <= 5.0) lambda_b = 0.095;
                else if (power <= 10) lambda_b = 0.098;
                else if (power <= 50) lambda_b = 0.12;
                else if (power <= 100) lambda_b = 0.16;
                else if (power <= 200) lambda_b = 0.28;

                else lambda_b = 0.28;
            } else if (frequency <= 4) {
                if (power <= 1.0) lambda_b = 0.13;
                else if (power <= 5.0) lambda_b = 0.14;
                else if (power <= 10) lambda_b = 0.14;
                else if (power <= 50) lambda_b = 0.17;
                else lambda_b = 0.23;
            } if (frequency <= 5) {
                if (power <= 1.0) lambda_b = 0.19;
                else if (power <= 5.0) lambda_b = 0.19;
                else if (power <= 10) lambda_b = 0.20;
                else if (power <= 50) lambda_b = 0.25;
            } else {
                // For frequencies > 4GHz, use the formula
                lambda_b = 0.032 * Math.exp(354 * frequency + 0.00558 * power);
            }

            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b?.toFixed(6) });

            // Temperature factor
            const pi_T = getHighPowerHighFreqTempFactor(
                parseFloat(formData.junctionTempHP),
                parseFloat(formData.voltageRatio),
                formData.metalizationType
            );
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T?.toFixed(4) });

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
            const appFactor = appFactors.find(a => a.name === formData.applicationType);
            const pi_A = appFactor ? appFactor.pi_A : 1.0;
            calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A?.toFixed(2) });

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

            // Find the appropriate row in the frequency/power table
            if (frequency <= 1) {
                if (power < 0.1) lambda_b = 0.052;
                // else if (power <= 0.1) lambda_b = 0.1;
                // else if (power <= 0.5) lambda_b = 0.1;
                // else if (power <= 1) lambda_b = 0.1;
                // else if (power <= 2) lambda_b = 0.1;
                // else if (power <= 4) lambda_b = 0.1;
                // else if (power <= 6) lambda_b = 0.1;
            } else if (frequency <= 4) {
                if (power < 0.1) lambda_b = 0.052;
                else if (power <= 0.1) lambda_b = 0.054;
                else if (power <= 0.5) lambda_b = 0.066;
                else if (power <= 1) lambda_b = 0.084;
                else if (power <= 2) lambda_b = 0.14;
                else if (power <= 4) lambda_b = 0.36;
                else if (power <= 6) lambda_b = 0.96;
            } else if (frequency <= 5) {
                if (power < 0.1) lambda_b = 0.052;
                else if (power <= 0.1) lambda_b = 0.083;
                else if (power <= 0.5) lambda_b = 0.10
                else if (power <= 1) lambda_b = 0.13;
                else if (power <= 2) lambda_b = 0.21;
                else if (power <= 4) lambda_b = 0.56;
                else if (power <= 6) lambda_b = 1.5;
            } else if (frequency <= 5) {
                if (power < 0.1) lambda_b = 0.052;
                else if (power <= 0.1) lambda_b = 0.13;
                else if (power <= 0.5) lambda_b = 0.16
                else if (power <= 1) lambda_b = 0.20;
                else if (power <= 2) lambda_b = 0.32;
                else if (power <= 4) lambda_b = 0.85;
                else if (power <= 6) lambda_b = 2.3;
            } else if (frequency <= 7) {
                if (power < 0.1) lambda_b = 0.052;
                else if (power <= 0.1) lambda_b = 0.20;
                else if (power <= 0.5) lambda_b = 0.24;
                else if (power <= 1) lambda_b = 0.30;
                else if (power <= 2) lambda_b = 0.50;
                else if (power <= 4) lambda_b = 1.3;
                else if (power <= 6) lambda_b = 3.5;
            } else if (frequency <= 8) {
                if (power < 0.1) lambda_b = 0.052;
                else if (power <= 0.1) lambda_b = 0.30;
                else if (power <= 0.5) lambda_b = 0.37;
                else if (power <= 1) lambda_b = 0.47;
                else if (power <= 2) lambda_b = 0.76;
                else if (power <= 4) lambda_b = 2.0;
                // else if (power <= 6) lambda_b = 0.3;
            } else if (frequency <= 9) {
                if (power < 0.1) lambda_b = 0.052;
                else if (power <= 0.1) lambda_b = 0.46;
                else if (power <= 0.5) lambda_b = 0.56;
                else if (power <= 1) lambda_b = 0.72;
                else if (power <= 2) lambda_b = 1.2;
                // else if (power <= 4) lambda_b = 1.2;
                // else if (power <= 6) lambda_b = 0.3;
            } else if (frequency <= 10) {
                if (power < 0.1) lambda_b = 0.052;
                else if (power <= 0.1) lambda_b = 0.71;
                else if (power <= 0.5) lambda_b = 0.87;
                else if (power <= 1) lambda_b = 1.1;
                else if (power <= 2) lambda_b = 1.8;
                // else if (power <= 4) lambda_b = 0.1;
                // else if (power <= 6) lambda_b = 0.1;
            }

            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b?.toFixed(6) });

            // Temperature factor (using table lookup)
            const tempFactor = gaAsTempFactors.find(t => t.temp >= formData.junctionTempGaAs) ||
                gaAsTempFactors[gaAsTempFactors.length - 1];
            const pi_T = tempFactor.pi_T;
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

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
            const tempFactor = siFETTempFactorsHF.find(t => t.temp >= formData.junctionTempSIFET) ||
                siFETTempFactorsHF[siFETTempFactorsHF.length - 1];
            const pi_T = tempFactor.pi_T;
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

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

            // Temperature factor (using table lookup)
            const tempFactor = thyristorTempFactors.find(t => t.temp >= formData.junctionTemp) ||
                thyristorTempFactors[thyristorTempFactors.length - 1];
            pi_T = tempFactor.pi_T;
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

            // Current rating factor
            const currentFactor = thyristorCurrentFactors.find(c => c.current === parseInt(formData.thyristorCurrent));
            pi_R = currentFactor ? currentFactor.pi_R : 1.0;
            calculationDetails.push({ name: 'Current Rating Factor (πR)', value: pi_R });
            // Voltage stress factor
            const voltageFactor = thyristorVoltageFactors.find(v => v.range === formData.thyristorVoltage);
            pi_S = voltageFactor ? voltageFactor.pi_S : 1.0;
            calculationDetails.push({ name: 'Voltage Stress Factor (πS)', value: pi_S });

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
            const tempFactor = optoTempFactors.find(t => t.temp >= formData.junctionTemp) ||
                optoTempFactors[optoTempFactors.length - 1];
            const pi_T = tempFactor.pi_T;
            // const Tj = parseFloat(formData.optoJunctionTemp);
            // const pi_T = Math.exp(-2790 * ((1/(Tj + 273)) - (1/288)));
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

            // Quality factor (specific to optoelectronics)
            // const qualityFactor = optoQualityFactors.find(q => q.name === formData.optoQuality);
            // const pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
            // calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q });

            // Environment factor (use existing)

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
            // Alphanumeric Displays calculation
            // const lambda_b = getBaseFailureRate(parseInt(formData.characterCount), formData.displayType);
            // calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });
            const charCountInfo = characterCounts.find(c => c.count === parseInt(formData.characterCount));
            const withLogic = charCountInfo ? charCountInfo.withLogic : false;

            const lambda_b = getBaseFailureRate(parseInt(formData.characterCount), formData.displayType, withLogic);
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

            // Temperature factor (using formula from image)
            const tempFactor = alphanumeric.find(t => t.temp >= formData.junctionTemp) ||
                alphanumeric[alphanumeric.length - 1];
            const pi_T = tempFactor.pi_T; // Note: Formula in image has typo, corrected here
            // calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T.toFixed(4) });
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

            // Quality factor (use existing)
            // calculationDetails.push({ name: 'Quality Factor (πQ)', value: pi_Q });

            // Environment factor (use existing)

            const envFactor = alphaNumericEnvironmentFactors.find(e => e.code === formData.environment);
            pi_E = envFactor ? envFactor.pi_E : 1;
            calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };


            // calculationDetails.push({ name: 'Environment Factor (πE)', value: pi_E });

            // Calculate final failure rate
            lambda_p = lambda_b * pi_T * pi_Q * pi_E;
            formula = 'λp = λb × πT × πQ × πE';
            if (onCalculate) {
                onCalculate(lambda_p, calculationDetails, formula); 
              }
        } else if (formData.componentType === 'laserDiode') {
            // Laser Diode calculation
            const diodeType = laserDiodeTypes.find(d => d.name === formData.laserDiodeType);
            lambda_b = diodeType.lambda_b;
            calculationDetails.push({ name: 'Base Failure Rate (λb)', value: lambda_b });

            // Temperature factor
            const tempFactor = laserDiodeTempFactors.find(t => t.temp >= formData.laserDiodeTemp) ||
                laserDiodeTempFactors[laserDiodeTempFactors.length - 1];
            pi_T = tempFactor.pi_T;
            calculationDetails.push({ name: 'Temperature Factor (πT)', value: pi_T });

            // Quality factor (specific to laser diodes)
            const qualityFactor = laserDiodeQualityFactors.find(q => q.name === formData.laserDiodeQuality);
            pi_Q = qualityFactor ? qualityFactor.pi_Q : 1.0;
            calculationDetails[0] = { name: 'Quality Factor (πQ)', value: pi_Q };

            // Get environment factor
            const envFactor = laserEnvironmentFactors.find(e => e.code === formData.environment);
            pi_E = envFactor ? envFactor.pi_E : 1;
            calculationDetails[1] = { name: 'Environment Factor (πE)', value: pi_E };


            // Current factor
            const currentFactor = laserDiodeCurrentFactors.find(c => c.current >= formData.laserDiodeCurrent) ||
                laserDiodeCurrentFactors[laserDiodeCurrentFactors.length - 1];
            const pi_I = currentFactor.pi_I;
            calculationDetails.push({ name: 'Current Factor (πI)', value: pi_I });

            // Application factor
            const appFactor = laserDiodeApplicationFactors.find(a => a.name === formData.laserDiodeApplication);
            const pi_A = appFactor ? appFactor.pi_A : 1.0;
            calculationDetails.push({ name: 'Application Factor (πA)', value: pi_A });

            // Power degradation factor
            const powerFactor = laserDiodePowerFactors.find(p => p.ratio >= formData.laserDiodePowerRatio) ||
                laserDiodePowerFactors[laserDiodePowerFactors.length - 1];
            const pi_P = powerFactor.pi_P;
            calculationDetails.push({ name: 'Power Factor (πP)', value: pi_P });

            // Calculate final failure rate
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
                                            <input
                                                type="number"
                                                name="voltageStress"
                                                className="form-control"
                                                step="0.1"
                                                min="0"
                                                max="1"
                                                value={formData.voltageStress}
                                                onChange={handleInputChange}
                                            />
                                            </div>
                                        </Col>
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
                                        {highFreqPowerFactors.map(factor => (
                                            <option key={factor.power} value={factor.power}>{factor.power}</option>
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
                                        value={formData.transistorPowerFactor}
                                        onChange={handleInputChange}
                                    >
                                        {transistorPowerFactors.map(factor => (
                                            <option key={factor.power} value={factor.power}>{factor.power}</option>
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
                                    <label>Voltage Stress</label>
                                    <select
                                        name="transistorVoltageFactor"
                                        // className="form-control"
                                        value={formData.transistorVoltageFactor}
                                        onChange={handleInputChange}
                                    >
                                        {transistorVoltageFactors.map(factor => (
                                            <option key={factor.range} value={factor.range}>{factor.range}</option>
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
                                    // className="form-control"
                                    value={formData.junctionTemp}
                                    onChange={handleInputChange}
                                >
                                    {transistorTempFactors.map(item => (
                                        <option key={item.temp} value={item.temp}>
                                            {item.temp}°C (πT = {item.pi_T})
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
                                <label>Voltage Stress Ratio πS</label>
                                <select
                                    name="voltageStressRatio"
                                    // className="form-control"
                                    value={formData.voltageStressRatio}
                                    onChange={handleInputChange}
                                >
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
                        <label>Junction Temperature (°C) πT</label>
                        <select
                            name="junctionTemp"
                            value={formData.junctionTemp}
                            onChange={handleInputChange}
                        >
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
                                <label>Frequency (GHz)</label>
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
                                <label>Output Power (Watts)</label>
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
                                <label>Application</label>
                                <select
                                    name="applicationType"
                                    value={formData.applicationType}
                                    onChange={handleInputChange}
                                >
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
                                    <label>Frequency (GHz)</label>
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
                                    <label>Average Output Power (Watts)</label>
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
                                <label>Junction Temperature (°C)</label>
                                <input
                                    type="number"
                                    name="junctionTempGaAs"
                                    className="form-control"
                                    min="25"
                                    max="175"
                                    value={formData.junctionTempGaAs}
                                    onChange={handleInputChange}
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
                                    <label>Junction Temperature (°C)</label>
                                    <input
                                        type="number"
                                        name="junctionTempSIFET"
                                        className="form-control"
                                        min="25"
                                        max="175"
                                        value={formData.junctionTempSIFET}
                                        onChange={handleInputChange}
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
                                <label>Forward Current (A) πR</label>
                                <select
                                    name="thyristorCurrent"
                                    // className="form-control"
                                    value={formData.thyristorCurrent}
                                    onChange={handleInputChange}
                                >
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
                                <label>Voltage Stress Ratio πS</label>
                                <select
                                    name="thyristorVoltage"
                                    // className="form-control"
                                    value={formData.thyristorVoltage}
                                    onChange={handleInputChange}
                                >
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
                                <input
                                    type="number"
                                    name="junctionTemp"
                                    className="form-control"

                                    value={formData.junctionTemp}
                                    onChange={handleInputChange}
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
                                    // className="form-control"
                                    value={formData.displayType}
                                    onChange={handleInputChange}
                                >
                                    {displayTypes.map(type => (
                                        <option key={type.type} value={type.type}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                </div>
                            </Col>
                            <Col md={4}>
                            <div className="form-group">
                                <label>Number of Characters (with Logic Chip)</label>
                                <select
                                    name="characterCount"
                                    //  className="form-control"
                                    value={formData.characterCount}
                                    onChange={handleInputChange}
                                >
                                    {characterCounts.map(count => (
                                        <option key={count.count} value={count.count}>
                                            {count.count}
                                        </option>
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

                                    value={formData.junctionTemp}
                                    onChange={handleInputChange}
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
                                    // className="form-control"
                                    value={formData.laserDiodeCurrent}
                                    onChange={handleInputChange}
                                >
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
                                <label>Application πA</label>
                                <select
                                    name="laserDiodeApplication"
                                    // className="form-control"
                                    value={formData.laserDiodeApplication}
                                    onChange={handleInputChange}
                                >
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
                                <label>Power Ratio (P/Pₛ) πP</label>
                                <select
                                    name="laserDiodePowerRatio"
                                    // className="form-control"
                                    value={formData.laserDiodePowerRatio}
                                    onChange={handleInputChange}
                                >
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
                                    {laserDiodeTempFactors.map(factor => (
                                        <option key={factor.temp} value={factor.temp}>
                                            {factor.temp}°C (πT = {factor.pi_T})
                                        </option>
                                    ))}
                                </select>
                                </div>
                            </Col>
                        </Row>
                    </>
                )}
              
                {/* Quality & Environment Section */}

                <br />

                {/* Action Buttons */}
                <div className='d-flex justify-content-between align-items-center' >
                    <div>
                        {results && (
                            <Box
                                component="div"
                                onClick={() => setShowCalculations(!showCalculations)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    color: 'primary.main',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                                className="ms-auto mt-2"
                            >
                                  <CalculatorIcon style={{ height: '30px', width: '40px' }} fontSize="large" />
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '0.95rem',
                                        ml: 1
                                    }}
                                >
                                    {showCalculations ? 'Hide Calculations' : 'Show Calculations'}
                                </Typography>
                            </Box>

                        )}
                    </div>
                    <br />
                    <Button
                        className="btn-calculate float-end mt-1"
                        variant="primary"
                        onClick={calculateFailureRate}
                    >
                        Calculate Failure Rate
                    </Button>


                </div>
                {results && (
                    <div className="text-center mt-4">
                        <h2 className="text-center">Calculation Result</h2>
                        <div className="d-flex align-items-center">
                        <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong> {parseFloat(results?.failureRate)?.toFixed(6)} failures/10<sup>6</sup> hours
                        </div>
                    </div>
                )}
                <br />

                {showCalculations && (
                    <div className="card">
                        <div className="card-body">
                            <div className="mb-4">

                                <div className="table-responsive">
                                    <MaterialTable
                                        columns={[
                                            {
                                                title: <span>Quality π<sub>Q</sub></span>,
                                                field: 'πQ',
                                                render: rowData => rowData.πQ || '-'
                                            },
                                            ...results.calculationDetails.slice(1).map(detail => ({
                                                title: <span>{detail.name}</span>,
                                                field: detail.name,
                                                render: rowData => rowData[detail.name] || '-'
                                            })),
                                            {
                                                title: "Failure Rate",
                                                field: 'λp',
                                                render: rowData => (
                                                    <span>
                                                        {parseFloat(rowData.λp)?.toFixed(6)}
                                                    </span>
                                                )
                                            }
                                        ]}
                                        data={[
                                            {
                                                πQ: results.calculationDetails[0].value,
                                                ...results.calculationDetails.slice(1).reduce((acc, detail) => {
                                                    acc[detail.name] = detail.value;
                                                    return acc;
                                                }, {}),
                                                λp: results.failureRate
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
                            </div>
                            <br />
                            <div className="formula-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
                                <Typography variant="h6" gutterBottom>
                                    Calculation Formula
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {results.formula}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    = {results.calculationDetails.map(d => d.value).join(' × ')}
                                </Typography>
                                <Typography variant="body1" paragraph>Where:</Typography>
                                <ul>
                                    <li>λ<sub>p</sub> = Predicted failure rate (Failures/10<sup>6</sup> Hours)</li>
                                    {results.calculationDetails.map((detail, index) => (
                                        <li key={index}>
                                            {detail.name.includes('π') ? (
                                                <>
                                                    {detail.name.split('π')[0]}
                                                    π<sub>{detail.name.split('π')[1]}</sub> = {detail.description || `${detail.name} factor`}
                                                </>
                                            ) : (
                                                `${detail.name} = ${detail.description || `${detail.name} factor`}`
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <Typography variant="body1" paragraph>
                                    Calculation Steps:
                                </Typography>
                                <ul>
                                    {results.calculationDetails.map((detail, index) => (
                                        <li key={index}>
                                            {detail.name.includes('π') ? (
                                                <>
                                                    {detail.name.split('π')[0]}
                                                    π<sub>{detail.name.split('π')[1]}</sub> = {detail.value} {detail.description && `(${detail.description})`}
                                                </>
                                            ) : (
                                                `${detail.name} = ${detail.value} ${detail.description && `(${detail.description})`}`
                                            )}
                                        </li>
                                    ))}
                                    <li>
                                        λ<sub>p</sub> = {results.calculationDetails.map(d => d.value).join(' × ')} = {results.failureRate}
                                    </li>
                                </ul>
                            </div>

                        </div>

                    </div>

                )}
            </div>
        </Container>
    );
};

export default Diode;