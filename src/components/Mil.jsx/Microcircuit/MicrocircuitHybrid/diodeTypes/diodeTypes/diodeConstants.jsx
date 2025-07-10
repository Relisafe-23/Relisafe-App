


// Add other shared constants here
    // Low Frequency Diode types
   export const lowFreqDiodeTypes = [
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
    export const lowFreqDiodeTempFactors1 = [
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
    export const lowFreqDiodeTempFactors2 = [
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
   export const highFreqDiodeTypes = [
        { name: 'SI IMPATT (≤ 35 GHz)', lambda_b: 0.22 },
        { name: 'Gunn/Bulk Effect', lambda_b: 0.18 },
        { name: 'Tunnel and Back (including Mixers, Detectors)', lambda_b: 0.0023 },
        { name: 'PIN', lambda_b: 0.0081 },
        { name: 'Schottky Barrier (including Detectors) and Point Contact', lambda_b: 0.027 },
        { name: 'Varactor (200 MHz ≤ Frequency ≤ 35 GHz)', lambda_b: 0.0025 },

    ];

    // Application factors for high frequency diodes
   export const highFreqAppFactors = [
        { name: 'Varactor, Voltage Control', pi_A: 0.5 },
        { name: 'Varactor, Multiplier', pi_A: 2.5 },
        { name: 'All Other Diodes', pi_A: 1.0 }
    ];
   export const highFreqQualityFactors2 = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 1.8 },
        { name: 'Lower', pi_Q: 2.5 },
        // { name: 'Plastic', pi_Q: null } // Plastic is marked with "—" in the image
    ];
   export const highFreqQualityFactors1 = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 5.0 },  // Updated from 1.8 to 5.0
        { name: 'Lower', pi_Q: 25 },  // Updated from 2.5 to 25
        { name: 'Plastic', pi_Q: 50 } // Updated from null to 50
    ];
    // Add these constants with your other constants
    export const highFreqDiodeTempFactors1 = [
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

  export  const highFreqDiodeTempFactors2 = [
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
     export const transistorAppFactors = [
        { name: 'Linear Amplification', pi_A: 1.5 },
        { name: 'Switching', pi_A: 0.7 }
    ];
    // Transistor power rating factors
   export const transistorPowerFactors = [
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
  export  const transistorVoltageFactors = [
        { range: '0 < Vs ≤ 0.3', pi_S: 0.11 },
        { range: '0.3 < Vs ≤ 0.4', pi_S: 0.16 },
        { range: '0.4 < Vs ≤ 0.5', pi_S: 0.21 },
        { range: '0.5 < Vs ≤ 0.6', pi_S: 0.29 },
        { range: '0.6 < Vs ≤ 0.7', pi_S: 0.39 },
        { range: '0.7 < Vs ≤ 0.8', pi_S: 0.54 },
        { range: '0.8 < Vs ≤ 0.9', pi_S: 0.73 },
        { range: '0.9 < Vs ≤ 1.0', pi_S: 1.0 }
    ];
  export  const TransistorTempFactors = [
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
   export const highFreqDiodeEnvironmentFactors = [
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
   export const lowNoiseEnvironmentFactors = [
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
     export const highpowerEnvironmentFactors = [
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
     export const gasFETEnvironmentFactors = [
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
    export  const siFETEnvironmentFactors = [
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
     export const qualityFactors = [
        { name: 'JANTXV', pi_Q: 0.7 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.4 },
        { name: 'Lower', pi_Q: 5.5 },
        { name: 'Plastic', pi_Q: 8.0 }
    ];
    // Common environment factors
     export const environmentFactors = [
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
   export   const lowFrequencyenvironmentFactors = [
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
     export const optoElectroEnvironmentFactors = [
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
     export const alphaNumericEnvironmentFactors = [
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
    export  const laserEnvironmentFactors = [
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
    export  const highFreqPowerFactors = [
    { power: 'PIN Diodes (Pr ≤ 10W)', pi_R: 0.50 },
    { power: 'PIN Diodes (10W < Pr ≤ 100W)', pi_R: 1.3 },
    { power: 'PIN Diodes (100W < Pr ≤ 1000W)', pi_R: 2.0 },
    { power: 'PIN Diodes (1000W < Pr ≤ 3000W)', pi_R: 2.4 },
    { power: 'All Other Diodes', pi_R: 1.0 }
];
     export const transistorTempFactors = [
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
     export const getPiT = (temp) => {
        const entry = transistorTempFactors.find(item => item.temp === temp);
        return entry ? entry.pi_T : Math.exp(-2114 * (1 / (temp + 273) - 1 / 298));
    };
    // Add the temperature factor calculation function here
     export const calculateLowNoiseHighFreqTempFactor = (junctionTemp) => {
        return Math.exp(-2114 * ((1 / (junctionTemp + 273)) - (1 / 298)));
    };
    // Contact construction factors (for low freq diodes)
    export  const contactConstructionFactors = [
        { type: 'Metallurgically Bonded', pi_C: 1.0 },
        { type: 'Non-Metallurgically Bonded and Spring Loaded Contacts', pi_C: 2.0 }
    ];
     export const siFETTypes = [
        { name: 'MOSFET', lambda_b: 0.012 },
        { name: 'JFET', lambda_b: 0.0045 }
    ];
    export  const unijunctionTypes = [
        { name: 'All Unijunction', lambda_b: 0.0083 }
    ];
    // SI FET Temperature factors
     export const siFETTempFactors = [
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
      export const siFETAppFactors = [
        { name: 'Linear Amplification (Pr < 2W)', pi_A: 1.5 },
        { name: 'Small Signal Switching', pi_A: 0.7 },
        { name: 'Power FETs (2 ≤ Pr < 5W)', pi_A: 2.0 },
        { name: 'Power FETs (5 ≤ Pr < 50W)', pi_A: 4.0 },
        { name: 'Power FETs (50 ≤ Pr < 250W)', pi_A: 8.0 },
        { name: 'Power FETs (Pr ≥ 250W)', pi_A: 10 }
    ];
    // Unijunction Temperature factors
    export  const unijunctionTempFactors = [
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
    export  const lowNoiseHighFreqQualityFactors = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.0 },
        { name: 'Lower', pi_Q: 5.0 }
    ];
    export  const lowNoiseHighFreqPowerFactors = [
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
    export  const lowNoiseHighFreqVoltageFactors = [
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
    export  const lowNoiseHighFreqTempFactors = [
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
     export const gaAsAppFactors = [
        { name: 'All Low Power and Pulsed', pi_A: 1 },
        { name: 'CW', pi_A: 4 }
    ];
     export const gaAsMatchingNetworkFactors = [
        { name: 'Input and Output', pi_M: 1.0 },
        { name: 'Input Only', pi_M: 2.0 },
        { name: 'None', pi_M: 4.0 }
    ];
     export const gaAsQualityFactors = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.0 },
        { name: 'Lower', pi_Q: 5.0 }
    ];
     export const getHighPowerHighFreqTempFactor = (junctionTemp, voltageRatio, metalizationType) => {
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
     export const gaAsTempFactors = [
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
    export  const siFETTypesHF = [
        { name: 'MOSFET', lambda_b: 0.060 },
        { name: 'JFET', lambda_b: 0.023 }
    ];
     export const siFETTempFactorsHF = [
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
     export const siFETQualityFactors = [
        { name: 'JANTXV', pi_Q: 0.50 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.0 },
        { name: 'Lower', pi_Q: 5.0 }
    ];
     export const thyristorTypes = [
        { name: 'All Types', lambda_b: 0.0022 }
    ];
     export const thyristorTempFactors = [
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
     export const thyristorCurrentFactors = [
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

    export  const thyristorVoltageFactors = [
        { range: 'Vs ≤ 0.3', pi_S: 0.1 },
        { range: '0.3 < Vs ≤ 0.4', pi_S: 0.18 },
        { range: '0.4 < Vs ≤ 0.5', pi_S: 0.27 },
        { range: '0.5 < Vs ≤ 0.6', pi_S: 0.38 },
        { range: '0.6 < Vs ≤ 0.7', pi_S: 0.51 },
        { range: '0.7 < Vs ≤ 0.8', pi_S: 0.65 },
        { range: '0.8 < Vs ≤ 0.9', pi_S: 0.82 },
        { range: '0.9 < Vs ≤ 1.0', pi_S: 1.0 }
    ];
    export  const optoelectronicTypes = [
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
     export const optoQualityFactors = [
        { name: 'JANTXY', pi_Q: 0.70 },
        { name: 'JANTX', pi_Q: 1.0 },
        { name: 'JAN', pi_Q: 2.4 },
        { name: 'Lower', pi_Q: 5.5 },
        { name: 'Plastic', pi_Q: 8.0 }
    ];
    // Temperature factors table for optoelectronics
    export  const optoTempFactors = [
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
  export const voltageStressFactors = [
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
     export const alphanumeric = [
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
    export  const displayTypes = [
        { name: 'Segment Display', type: 'segment' },
        { name: 'Diode Array Display', type: 'diode' }
    ];
     export const characterCounts = [
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

   export   const getBaseFailureRate = (count, displayType, withLogic = false) => {
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
    export  const laserDiodeTypes = [
        { name: 'GaAs/M GaAs', lambda_b: 3.23 },
        { name: 'In GaAs/in GaAsP', lambda_b: 5.65 }
    ];
     export const laserDiodeTempFactors = [
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
     export const laserDiodeQualityFactors = [
        { name: 'Hermetic Package', pi_Q: 1.0 },
        { name: 'Nonhermetic with Facet Coating', pi_Q: 1.0 },
        { name: 'Nonhermetic without Facet Coating', pi_Q: 3.3 }
    ];
     export const laserDiodeCurrentFactors = [
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
     export const laserDiodeApplicationFactors = [
        { name: 'CW', pi_A: 4.4 },
        { name: 'Pulsed', pi_A: 1.0 } // This is simplified - actual values depend on duty cycle
    ];
    export  const laserDiodePowerFactors = [
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
                                                                             
         export   const appFactors = [
                { name: 'CW', pi_A: 7.6 },
                { name: 'Pulsed ≤ 1%', pi_A: 0.46 },
                { name: 'Pulsed 5%', pi_A: 0.70 },
                { name: 'Pulsed 10%', pi_A: 1.0 },
                { name: 'Pulsed 15%', pi_A: 1.3 },
                { name: 'Pulsed 20%', pi_A: 1.6 },
                { name: 'Pulsed 25%', pi_A: 1.9 },
                { name: 'Pulsed ≥ 30%', pi_A: 2.2 }
            ];
     export const calculatePiR = (power) => {
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
  export const displayBaseFailureRates = {
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
    