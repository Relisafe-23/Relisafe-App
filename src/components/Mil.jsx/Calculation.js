// reliabilityCalculations.js

// Package failure rate lookup
export const getFailureRate = (packageType, pinCount) => {
  const rates = {
    Hermetic_DIPs_SolderWeldSeal: {
      3: 0.00092, 4: 0.0013, 6: 0.0019, 8: 0.0026, 10: 0.0034,
      12: 0.0041, 14: 0.0048, 16: 0.0056, 18: 0.0064, 22: 0.0079,
      24: 0.0087, 28: 0.010, 36: 0.013, 40: 0.015, 64: 0.025,
      80: 0.032, 128: 0.053, 180: 0.076, 224: 0.097
    },
    DIPs_GlassSeal: {
      3: 0.00047, 4: 0.00073, 6: 0.0013, 8: 0.0021, 10: 0.0029,
      12: 0.0038, 14: 0.0048, 16: 0.0059, 18: 0.0071, 22: 0.0096,
      24: 0.011, 28: 0.014, 36: 0.020, 40: 0.024, 64: 0.048
    },
    Flatpacks_AxialLeads: {
      3: 0.00022, 4: 0.00037, 6: 0.00078, 8: 0.0013, 10: 0.0020,
      12: 0.0028, 14: 0.0037, 16: 0.0047, 18: 0.0058, 22: 0.0083,
      24: 0.0098
    },
    Cans: {
      3: 0.00027, 4: 0.00049, 6: 0.0011, 8: 0.0020, 10: 0.0031,
      12: 0.0044, 14: 0.0060, 16: 0.0079
    },
    Nonhermetic_DIPs_PGA_SMT: {
      3: 0.0012, 4: 0.0016, 6: 0.0025, 8: 0.0034, 10: 0.0043,
      12: 0.0053, 14: 0.0062, 16: 0.0072, 18: 0.0082, 22: 0.010,
      24: 0.011, 28: 0.013, 36: 0.017, 40: 0.019, 64: 0.032,
      80: 0.041, 128: 0.068, 180: 0.098, 224: 0.12
    }
  };
  return rates[packageType]?.[pinCount] || 0;
};


// Temperature factor calculation
export const calculatePiT = (technology, temperature, Ea = 0.7) => {
  const T = temperature + 273; // Convert to Kelvin
  const k = 8.617e-5; // Boltzmann's constant in eV/K
  
  switch (technology) {
    case 'Bipolar':
      return 0.1 * Math.exp(3091 * (1/298 - 1/T));
    case 'MOS':
      return 0.1 * Math.exp(4172 * (1/298 - 1/T));
    case 'BiCMOS':
      return 3.205e-8 * Math.exp(14179 * (1/298 - 1/T));
    case 'GaAs':
      return 1.5 * Math.exp(Ea/k * (1/298 - 1/T));
    case 'Linear':
      return 0.65 * Math.exp(Ea/k * (1/298 - 1/T));
    default:
      return 1.0;
  }
};


// Environment factor

// Environment factor lookup function

// Quality factor
export const getQualityFactor = (quality) => {
  const factors = {
    MIL_M_38510_ClassS: 0.25,
    MIL_I_38535_ClassU: 0.25,
    MIL_H_38534_ClassS_Hybrid: 0.25,
    MIL_M_38510_ClassB: 1.0,
    MIL_I_38535_ClassQ: 1.0,
    MIL_H_38534_ClassB_Hybrid: 1.0,
    MIL_STD_883_ClassB1: 2.0,
    Commercial: 5.0
  };
  return factors[quality] || 1.0;
};

// Learning factor
export const calculateLearningFactor = (years) => {
  return years >= 2 ? 1.0 : 
    years >= 1.5 ? 1.2 :
    years >= 1.0 ? 1.5 :
    years >= 0.5 ? 1.8 : 2.0;
};
// memoryFailureRates.js

/**
 * Calculate MOS ROM failure rate (C₁)
 * @param {string} memorySize - Memory size category
 * @returns {number} C₁ value
 */
export const calculateMosRomC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.00065,
    '16K < B ≤ 64K': 0.0013,
    '64K < B ≤ 256K': 0.0026,
    '256K < B ≤ 1M': 0.0052
  };
  return c1Values[memorySize] || 0;
};

/**
 * Calculate MOS PROM/UVEPROM/EEPROM/EAPROM failure rate (C₁)
 * @param {string} memorySize - Memory size category
 * @returns {number} C₁ value
 */
export const calculateMosPromC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.00085,
    '16K < B ≤ 64K': 0.0017,
    '64K < B ≤ 256K': 0.0034,
    '256K < B ≤ 1M': 0.0068
  };
  return c1Values[memorySize] || 0;
};

/**
 * Calculate MOS DRAM failure rate (C₁)
 * @param {string} memorySize - Memory size category
 * @returns {number} C₁ value
 */
export const calculateMosDramC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.0013,
    '16K < B ≤ 64K': 0.0025,
    '64K < B ≤ 256K': 0.0050,
    '256K < B ≤ 1M': 0.010
  };
  return c1Values[memorySize] || 0;
};

/**
 * Calculate Bipolar ROM/PROM failure rate (C₁)
 * @param {string} memorySize - Memory size category
 * @returns {number} C₁ value
 */
export const calculateBipolarRomC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.0094,
    '16K < B ≤ 64K': 0.019,
    '64K < B ≤ 256K': 0.038,
    '256K < B ≤ 1M': 0.075
  };
  return c1Values[memorySize] || 0;
};

/**
 * Calculate Bipolar SRAM failure rate (C₁)
 * @param {string} memorySize - Memory size category
 * @returns {number} C₁ value
 */
export const calculateBipolarSramC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.0052,
    '16K < B ≤ 64K': 0.011,
    '64K < B ≤ 256K': 0.021,
    '256K < B ≤ 1M': 0.042
  };
  return c1Values[memorySize] || 0;
};

/**
 * Calculate MOS/BiMOS SRAM failure rate (C₁)
 * @param {string} memorySize - Memory size category
 * @returns {number} C₁ value
 */
export const calculateMosBimosSramC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.0078,
    '16K < B ≤ 64K': 0.016,
    '64K < B ≤ 256K': 0.031,
    '256K < B ≤ 1M': 0.062
  };
  return c1Values[memorySize] || 0;
};

// Helper function to parse memory size from actual bit count
export const getMemorySizeCategory = (bitCount) => {
  const k = 1024; // 1K = 1024 bits
  if (bitCount <= 16 * k) return 'Up to 16K';
  if (bitCount <= 64 * k) return '16K < B ≤ 64K';
  if (bitCount <= 256 * k) return '64K < B ≤ 256K';
  if (bitCount <= 1024 * k) return '256K < B ≤ 1M';
  return '> 1M'; // Beyond table range
};
// GATE/LOGIC ARRAYS CALCULATION
export const calculateMicrocircuitsAndMicroprocessorsFailureRate = (component) => {
  const C1 = calculateGateArrayC1(component);
  const C2 = getFailureRate(component.packageType, component.pinCount);
  const piT = calculatePiT(component.technology, component.temperature);
  const piE = getEnvironmentFactor(component.environment);
  const piQ = getQualityFactor(component.quality);
  const piL = calculateLearningFactor(component.yearsInProduction);

  return (C1 * piT + C2 * piE) * piQ * piL;
};


export const calculateGateArrayC1 = (component) => {
  if (!component.complexFailure || !component.gateCount) return 0;

  // Parse gate count (handle ranges and "Up to" cases)
  let gateCount = parseGateCount(component.gateCount);
  if (isNaN(gateCount)) return 0;

  // Special case for MOS digital with >60,000 gates
  if (component.technology === 'MOS' && 
      component.complexFailure === 'Digital' && 
      gateCount > 60000) {
    return 'Use VHSIC/VHSIC-Like model';
  }
console.log("component.technology..",component)
  // Get the appropriate data set based on technology
  const data = component.devices === 'bipolarData' 
  ? bipolarData 
  : component.devices === 'mosData' 
    ? mosData 
    : microprocessorData;
  const category = component.complexFailure.toLowerCase();
  const categoryData = data[category === 'pla/pal' ? 'pla' : category];

  if (!categoryData) return 0;

  // Find matching range
  const matchedRange = categoryData.find(
    item => gateCount >= item.min && gateCount <= item.max
  );

  return matchedRange ? matchedRange.c1 : 0;
};

// Helper function to parse gate count input
const parseGateCount = (gateCount) => {
  if (typeof gateCount === 'number') return gateCount;
  if (typeof gateCount !== 'string') return NaN;

  if (gateCount.includes('-')) {
    const [min, max] = gateCount.split('-').map(Number);
    return (min + max) / 2; // Midpoint for ranges
  }
  if (gateCount.startsWith('Up to')) {
    return Number(gateCount.replace('Up to', '').trim());
  }
  return Number(gateCount);
};

// Data structures matching your tables
const bipolarData = {
  digital: [
    { min: 1, max: 100, c1: 0.0025 },
    { min: 101, max: 1000, c1: 0.0050 },
    { min: 1001, max: 3000, c1: 0.010 },
    { min: 3001, max: 10000, c1: 0.020 },
    { min: 10001, max: 30000, c1: 0.040 },
    { min: 30001, max: 60000, c1: 0.080 }
  ],
  linear: [
    { min: 1, max: 100, c1: 0.010 },
    { min: 101, max: 300, c1: 0.020 },
    { min: 301, max: 1000, c1: 0.040 },
    { min: 1001, max: 10000, c1: 0.060 }
  ],
  pla: [
    { min: 1, max: 200, c1: 0.010 },
    { min: 201, max: 1000, c1: 0.021 },
    { min: 1001, max: 5000, c1: 0.042 }
  ]
};

const mosData = {
  digital: [
    { min: 1, max: 100, c1: 0.010 },
    { min: 101, max: 1000, c1: 0.020 },
    { min: 1001, max: 3000, c1: 0.040 },
    { min: 3001, max: 10000, c1: 0.080 },
    { min: 10001, max: 30000, c1: 0.16 },
    { min: 30001, max: 60000, c1: 0.29 }
  ],
  linear: [
    { min: 1, max: 100, c1: 0.010 },
    { min: 101, max: 300, c1: 0.020 },
    { min: 301, max: 1000, c1: 0.040 },
    { min: 1001, max: 10000, c1: 0.060 }
  ],
  pla: [
    { min: 1, max: 500, c1: 0.00085 },
    { min: 501, max: 1000, c1: 0.0017 },
    { min: 2001, max: 5000, c1: 0.0034 },
    { min: 5001, max: 20000, c1: 0.0068 }
  ]
};



const microprocessorData = {
 Bipolar:{  
 "Up to 8": 0.060,
 "Up to 16": 0.12,
 "Up to 32": 0.24,
},
  MOS:{
   "Up to 8": 0.14,
   "Up to 16": 0.28,
   "Up to 32": 0.56,
  }
};

// MEMORIES CALCULATION

export const calculateMemoriesFailureRate = (component) => {
  // Calculate base parameters
  const C1 = calculateMemoryC1(component);
  const C2 = getFailureRate(component.packageType, component.pinCount);
  const piT = calculatePiT(component.technology, component.temperature);
  const piE = getEnvironmentFactor(component.environment);
  const piQ = getQualityFactor(component.quality);
  const piL = calculateLearningFactor(component.yearsInProduction);

  // Calculate EEPROM cycling failure rate if applicable
  let λ_cyc = 0;
  if (component.memoryType === 'MOS_EEPROM') {
    λ_cyc = calculateEEPROMCyclingFailure({
      eepromType: component.eepromType || 'Flotox', // Default to Flotox if not specified
      programmingCycles: component.programmingCycles || 0,
      qualityFactor: piQ,
      eccType: component.eccType || 'none',
      systemLifetimeHours: component.systemLifetimeHours || 10000
    }).lambdaCyc;
  }

  // Calculate total failure rate
  return (C1 * piT + C2 * piE + λ_cyc) * piQ * piL;
};

const calculateMemoryC1 = (component) => {
  if (!component.memoryType) return 0;
  
  // Handle both numeric and range inputs for capacity
  let capacity = 0;
  if (typeof component.capacity === 'string' && component.capacity.includes('-')) {
    const [min, max] = component.capacity.split('-').map(Number);
    capacity = (min + max) / 2;
  } else {
    capacity = Number(component.capacity) || 0;
  }

  // Calculate C1 based on memory type
  switch (component.memoryType) {
    case 'SRAM': return 0.002 * Math.pow(capacity, 0.5);
    case 'DRAM': return 0.003 * Math.pow(capacity, 0.45);
    case 'ROM': return 0.001 * Math.pow(capacity, 0.4);
    case 'MOS_EEPROM':
    case 'Flash': return 0.0015 * Math.pow(capacity, 0.5);
    case 'MOS_ROM': return getMOSROMC1(getSizeCategory(component.memorySize));
    case 'MOS_PROM': return getMOSPROMC1(getSizeCategory(component.memorySize));
    case 'MOS_DRAM': return getMOSDRAMC1(getSizeCategory(component.memorySize));
    case 'MOS_SRAM':return getMOSSRAMC1(getSizeCategory(component.memorySize));
    case 'BIPOLAR_ROM': return getBipolarROMC1(getSizeCategory(component.memorySize));
    case 'BIPOLAR_SRAM': return getBipolarSRAMC1(getSizeCategory(component.memorySize));
    default: return 0;
  }
};

// Helper function to determine size category
const getSizeCategory = (memorySize) => {
  const size = Number(memorySize) || 0;
  if (size <= 16384) return 'Up to 16K';
  if (size <= 65536) return '16K < B ≤ 64K';
  if (size <= 262144) return '64K < B ≤ 256K';
  return '256K < B ≤ 1M';
};

// EEPROM Cycling Failure Calculation
const calculateEEPROMCyclingFailure = (params) => {
  const {
    eepromType = 'Flotox',
    programmingCycles = 0,
    qualityFactor = 1,
    eccType = 'none',
    systemLifetimeHours = 10000
  } = params;

  // Get ECC factor
  const eccFactor = {
    'none': 1.0,
    'hamming': 0.72,
    'twoNeedsOne': 0.68
  }[eccType] || 1.0;

  // Calculate lifetime adjustment
  const lifetimeAdjustment = 10000 / systemLifetimeHours;

  // Initialize factors
  let A1 = 0, B1 = 0, A2 = 0, B2 = 0;

  if (eepromType === 'Flotox') {
    A1 = calculateFlotoxLambdaCyc(programmingCycles);
    // B1 would be implemented if values were available
  } else if (eepromType === 'TexturedPoly') {
    A1 = calculateTexturedPolyLambdaCyc(programmingCycles);
    A2 = programmingCycles > 300000 ? 
         (programmingCycles > 400000 ? 2.3 : 1.1) : 0;
    // B1 and B2 would be implemented if values were available
  }

  // Calculate cycling failure rate
  const lambdaCyc = (A1 * lifetimeAdjustment + 
                    B1 * lifetimeAdjustment + 
                    (A2 * B2 * lifetimeAdjustment) / qualityFactor) * 
                   eccFactor;

  return {
    lambdaCyc,
    factors: { A1, B1, A2, B2 },
    eccFactor,
    lifetimeAdjustment,
    formula: 'λ_cyc = [A1 + B1 + (A2*B2)/πQ] × π_ECC × (10,000/SystemLifetime)'
  };
};

// C1 Lookup Functions (unchanged from your original)
export const getMOSROMC1 = (sizeCategory) => {
  const values = {
    'Up to 16K': 0.00065,
    '16K < B ≤ 64K': 0.0013,
    '64K < B ≤ 256K': 0.0026,
    '256K < B ≤ 1M': 0.0052
  };
  return values[sizeCategory];
};

export const getMOSPROMC1 = (sizeCategory) => {
  const values = {
    'Up to 16K': 0.00085,
    '16K < B ≤ 64K': 0.0017,
    '64K < B ≤ 256K': 0.0034,
    '256K < B ≤ 1M': 0.0068
  };
  return values[sizeCategory];
};

export const getMOSDRAMC1 = (sizeCategory) => {
  const values = {
    'Up to 16K': 0.0013,
    '16K < B ≤ 64K': 0.0025,
    '64K < B ≤ 256K': 0.0050,
    '256K < B ≤ 1M': 0.010
  };
  return values[sizeCategory];
};

export const getMOSSRAMC1 = (sizeCategory) => {
  const values = {
    'Up to 16K': 0.0078,
    '16K < B ≤ 64K': 0.016,
    '64K < B ≤ 256K': 0.031,
    '256K < B ≤ 1M': 0.062
  };
  return values[sizeCategory];
};
export const getBipolarROMC1 = (sizeCategory) => {
  const values = {
    'Up to 16K': 0.0094,
    '16K < B ≤ 64K': 0.019,
    '64K < B ≤ 256K': 0.038,
    '256K < B ≤ 1M': 0.075
  };
  return values[sizeCategory];
};
export const getBipolarSRAMC1 = (sizeCategory) => {
  const values = {
    'Up to 16K': 0.0052,
    '16K < B ≤ 64K': 0.011,
    '64K < B ≤ 256K': 0.021,
    '256K < B ≤ 1M': 0.042
  };
  return values[sizeCategory];
};

// λ_cyc Calculation Functions (unchanged from your original)
export const calculateFlotoxLambdaCyc = (cycles) => {
  cycles = Number(cycles) || 0;
  if (cycles <= 100) return 0.00070;
  if (cycles <= 200) return 0.0014;
  if (cycles <= 500) return 0.0034;
  if (cycles <= 1000) return 0.0068;
  if (cycles <= 3000) return 0.020;
  if (cycles <= 7000) return 0.049;
  if (cycles <= 15000) return 0.10;
  if (cycles <= 20000) return 0.14;
  if (cycles <= 30000) return 0.20;
  if (cycles <= 100000) return 0.68;
  if (cycles <= 200000) return 1.3;
  if (cycles <= 400000) return 2.7;
  return 3.4;
};

export const calculateTexturedPoly1LambdaCyc = (cycles) => {
  cycles = Number(cycles) || 0;
  if (cycles <= 100) return 0.0097;
  if (cycles <= 200) return 0.014;
  if (cycles <= 500) return 0.023;
  if (cycles <= 1000) return 0.033;
  if (cycles <= 3000) return 0.061;
  if (cycles <= 7000) return 0.14;
  if (cycles <= 15000) return 0.30;
  if (cycles <= 20000) return 0.30;
  if (cycles <= 30000) return 0.30;
  if (cycles <= 100000) return 0.30;
  if (cycles <= 200000) return 0.30;
  if (cycles <= 300000) return 0.30;
  if (cycles <= 400000) return 1.1;
  return 2.3;
};
export const calculateTexturedPolyLambdaCyc = (cycles) => {
  cycles = Number(cycles) || 0;
  if (cycles <= 100) return 0.0097;
  if (cycles <= 200) return 0.014;
  if (cycles <= 500) return 0.023;
  if (cycles <= 1000) return 0.033;
  if (cycles <= 3000) return 0.061;
  if (cycles <= 7000) return 0.14;
  if (cycles <= 15000) return 0.30;
  if (cycles <= 20000) return 0.30;
  if (cycles <= 30000) return 0.30;
  if (cycles <= 100000) return 0.30;
  if (cycles <= 200000) return 0.30;
  if (cycles <= 300000) return 0.30;
  if (cycles <= 400000) return 1.1;
  return 2.3;
};




// SYSTEM METRICS
export const calculateSystemMetrics = (components) => {
  const totalFailureRate = components.reduce(
    (sum, comp) => sum + comp.totalFailureRate, 
    0
  );
  const mtbf = totalFailureRate > 0 ? (1000000 / totalFailureRate) : Infinity;

  return {
    totalFailureRate,
    mtbf
  };
};
// Quality Factors
export const QUALITY_FACTORS = [
  {
    label: "10 Temperature Cycles (-55°C to +125°C) with end point electrical tests",
    value: 0.10,
    screeningLevel: "High"
  },
  {
    label: "None beyond best commercial practices",
    value: 1.0,
    screeningLevel: "Standard"
  }
];
// Environment Factors Configuration
export const ENVIRONMENTAL_FACTORS = {
  GB: { label: "Ground Benign", value: 0.50 },
  GF: { label: "Ground Fixed", value: 2.0 },
  GM: { label: "Ground Mobile", value: 4.0 },
  NS: { label: "Naval Sheltered", value: 4.0 },
  NU: { label: "Naval Unsheltered", value: 6.0 },
  AIC: { label: "Airborne Inhabited Cargo", value: 4.0 },
  AIF: { label: "Airborne Inhabited Fighter", value: 5.0 },
  AUC: { label: "Airborne Uninhabited Cargo", value: 5.0 },
  AUF: { label: "Airborne Uninhabited Fighter", value: 8.0 },
  ARW: { label: "Airborne Rotary Wing", value: 8.0 },
  SF: { label: "Space Flight", value: 0.50 },
  MF: { label: "Missile Flight", value: 5.0 },
  ML: { label: "Missile Launch", value: 12 },
  CL: { label: "Cannon Launch", value: 220 }
};

// Base failure rate constant
export const BASE_FAILURE_RATE = 2.1;

/**
 * Get environment factor value
 * @param {string} environment - Environment code (e.g. 'GB', 'GF')
 * @returns {number} πE value
 */
export const getEnvironmentFactor = (environment) => {
  return ENVIRONMENTAL_FACTORS[environment]?.value || 1.0;
};

/**
 * Get environment label
 * @param {string} envCode - Environment code
 * @returns {string} Environment label
 */
export const getEnvironmentLabel = (envCode) => {
  return ENVIRONMENTAL_FACTORS[envCode]?.label || '';
};

/**
 * Calculate failure rate (λₚ)
 * @param {number} qualityFactor - πQ value
 * @param {string} environment - Environment code
 * @returns {number} Failure rate in failures per 10^6 hours
 */
export const calculateSawDeviceFailureRate = (qualityFactor, environment) => {
  const piQ = qualityFactor || 1.0;
  const piE = getEnvironmentFactor(environment || 'GB');
  return BASE_FAILURE_RATE * piQ * piE;
};

/**
 * Get environmental factor options for dropdown
 * @returns {Array} Array of options for Select component
 */
export const getEnvironmentalOptions = () => {
  return Object.entries(ENVIRONMENTAL_FACTORS).map(([key, env]) => ({
    value: key,
    label: `${key} - ${env.label} (πE = ${env.value})`
  }));
};