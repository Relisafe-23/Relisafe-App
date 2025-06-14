// reliabilityCalculations.js

// Package failure rate lookup
export const getFailureRate = (packageType, pinCount) => {
  // Validate input
  if (typeof pinCount !== 'number' || pinCount <= 0) return 0;

  // Calculate C2 based on the given formula and pin count (Np)
  const calculateC2 = (coefficient, exponent, Np) => {
    return coefficient * Math.pow(Np, exponent);
  };

  switch (packageType) {
    case 'Hermetic_DIPs_SolderWeldSeal':
      // Formula: C2 = 2.8 × 10⁻⁴ × (Np)^1.08
      return calculateC2(2.8e-4, 1.08, pinCount);

    case 'DIPs_GlassSeal':
          // Formula: C2 = 9.0 × 10⁻⁵ × (Np)^1.51
      return calculateC2(9.0e-5, 1.51, pinCount);
   

    case 'Flatpacks_AxialLeads':
           // Formula: C2 = 3.0 × 10⁻⁵ × (Np)^1.82
      return calculateC2(3.0e-5, 1.82, pinCount);
    

    case 'Cans':
           // Formula: C2 = 3.0 × 10⁻⁵ × (Np)^2.01
      return calculateC2(3.0e-5, 2.01, pinCount);


    case 'Nonhermetic_DIPs_PGA_SMT':
   // Formula: C2 = 3.6 × 10⁻⁴ × (Np)^1.08
      return calculateC2(3.6e-4, 1.08, pinCount);

    default:
      return 0; // Unknown package type
  }
};

// Corrected getBValueForTemp function
export const getBValueForTemp = (memoryTech, memorySize, temperature, factorType) => {
  // Validate inputs
  if (!memoryTech || !memorySize || temperature === undefined) return null;
  
  const T_j = temperature + 273; // Convert to Kelvin
  const k = 8.63e-5; // Boltzmann's constant in eV/K

  // Calculate based on technology type and factor
  switch (memoryTech) {
    case 'Flotox':
      if (factorType === 'B1') {
        const B_normalized = memorySize / 16000;
        const exponent = -.15 /k * (1/T_j - 1/333);
        return Math.pow(B_normalized, 0.5) * Math.exp(exponent);
      }
      return null;
    
    case 'Textured-Poly-B1':
      if (factorType === 'B1') {
        const B_normalized = memorySize / 64000;
        const exponent = -.12 / k * (1/T_j - 1/303);
        return Math.pow(B_normalized, 0.25) * Math.exp(exponent);
      }
      return null;
    
    case 'Textured-Poly-B2':
      if (factorType === 'B2') {
        const B_normalized = memorySize / 64000;
        const exponent = .1 / k * (1/T_j - 1/303);
        return Math.pow(B_normalized, 0.25) * Math.exp(exponent);
      }
      return null;
    case 'Flotox & Textured-Poly²':
      return 0;
    default:
      return null;
  }
};

export const calculatePiT = (technology, temperature, Ea = 1.5) => {
  const T = temperature + 273; // Convert to Kelvin
  const k = 8.617e-5; // Boltzmann's constant in eV/K

  switch (technology) {
    // Silicon Devices
    case 'TTL,ASTTL,CML':
      return 0.1 * Math.exp((0.4 / 8.617e-5) * (1 / 298 - 1 / T));
    case "F,LTTL,STTL":
      return 0.1 * Math.exp((0.45 / 8.617e-5) * (1 / 298 - 1 / T));
    case "BiCMOS":
      return 0.1 * Math.exp((0.5 / 8.617e-5) * (1 / 298 - 1 / T));
    case "III,f¹,ISL":
      return 0.1 * Math.exp((0.6 / 8.617e-5) * (1 / 298 - 1 / T));
    case 'Digital MOS':
      return 0.1 * Math.exp((0.35 / 8.617e-5) * (1 / 298 - 1 / T));
    case 'Linear':
      return 0.1 * Math.exp((0.65 / 8.617e-5) * (1 / 298 - 1 / T));
    case 'Memories':
      return 0.1 * Math.exp((0.6 / 8.617e-5) * (1 / 298 - 1 / T));
    //GaAs Devices
    case 'GaAs MMIC':
      return 0.1 * Math.exp(Ea / k * (1 / 423 - 1 / T));


    case 'GaAs Digital':
      return 0.1 * Math.exp((1.4 / 8.617e-5) * (1 / 423 - 1 / T));

    default:
      return 1.0;
  }
};

// Quality factor
export const getQualityFactor = (quality) => {
  console.log("quality..9999...", quality)
  const QUALITY_FACTORS = {
    MIL_M_38510_ClassS: { value: 0.25, label: "MIL-M-38510 Class S" },
    MIL_I_38535_ClassU: { value: 0.25, label: "MIL-I-38535 Class U" },
    MIL_H_38534_ClassS_Hybrid: { value: 0.25, label: "MIL-H-38534 Class S Hybrid" },
    MIL_M_38510_ClassB: { value: 1.0, label: "MIL-M-38510 Class B" },
    MIL_I_38535_ClassQ: { value: 1.0, label: "MIL-I-38535 Class Q" },
    MIL_H_38534_ClassB_Hybrid: { value: 1.0, label: "MIL-H-38534 Class B Hybrid" },
    MIL_STD_883_ClassB1: { value: 2.0, label: "MIL-STD-883 Class B1" },
    Commercial: { value: 5.0, label: "Commercial" },

  };

  // Example usage

  return QUALITY_FACTORS[quality]?.value ?? NaN;
};

// Learning factor
export const calculateLearningFactor = (years) => {
  return years <= 0.1 ? 2.0 :
         years >= 2.0 ? 1.0 :
         years >= 1.5 ? 1.2 :
         years >= 1.0 ? 1.5 :
         years >= 0.5 ? 1.8 : 0;
};

// memoryFailureRates.js
export const calculateMosRomC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.00065,
    '16K < B ≤ 64K': 0.0013,
    '64K < B ≤ 256K': 0.0026,
    '256K < B ≤ 1M': 0.0052
  };
  return c1Values[memorySize] || 0;
};

export const calculateMosPromC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.00085,
    '16K < B ≤ 64K': 0.0017,
    '64K < B ≤ 256K': 0.0034,
    '256K < B ≤ 1M': 0.0068
  };
  return c1Values[memorySize] || 0;
};


export const calculateMosDramC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.0013,
    '16K < B ≤ 64K': 0.0025,
    '64K < B ≤ 256K': 0.0050,
    '256K < B ≤ 1M': 0.010
  };
  return c1Values[memorySize] || 0;
};


export const calculateBipolarRomC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.0094,
    '16K < B ≤ 64K': 0.019,
    '64K < B ≤ 256K': 0.038,
    '256K < B ≤ 1M': 0.075
  };
  return c1Values[memorySize] || 0;
};


export const calculateBipolarSramC1 = (memorySize) => {
  const c1Values = {
    'Up to 16K': 0.0052,
    '16K < B ≤ 64K': 0.011,
    '64K < B ≤ 256K': 0.021,
    '256K < B ≤ 1M': 0.042
  };
  return c1Values[memorySize] || 0;
};

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
  console.log("component...yearsInProduction....", component.quality)
  const C1 = calculateGateArrayC1(component);
  console.log("Final C1 value:", C1);
 
  const C2 = getFailureRate(component.packageType, component.pinCount);
  const piT = calculatePiT(component.technology, component.temperature);
  const piE = getEnvironmentFactor(component.environment);
  const piQ = getQualityFactor(component.quality);
  const piL = calculateLearningFactor(component.yearsInProduction);

 
  console.log("C2......", C2);
  console.log("piT......", piT);
  console.log("piE......", piE);
  console.log("piQ......", piQ);
  console.log("C1......", C1);


  console.log("final environment......", getEnvironmentFactor(component.environment))

  console.log("final formulae......", (C1 * piT + C2 * piE) * piQ * piL)

  return (C1 * piT + C2 * piE) * piQ * piL;
};

export const calculateGateArrayC1 = (component) => {
  // Debug: Log the input component
  console.log("Input component:", component);

  // Validate input
  if (!component || !component.complexFailure || !component.gateCount) {
    console.log("Missing required fields (complexFailure or gateCount)");
    return 11;
  }

  // Parse gate count (handle ranges and "Up to" cases)
  let gateCount = parseGateCount(component.gateCount);
  if (isNaN(gateCount)) {
    console.log("Invalid gateCount:", component.gateCount);
    return 10;
  }

  // Debug: Log parsed gate count
  console.log("Parsed gateCount:", gateCount);

  // Special case for MOS digital with >60,000 gates
  if (component.technology === 'MOS' &&
      component.complexFailure === 'Digital' &&
      gateCount > 60000) {
    console.log("Special case: MOS Digital with >60,000 gates");
    return 'Use VHSIC/VHSIC-Like model';
  }

  // Get the appropriate data set based on technology
  let data;
  switch (component.devices) {
    case 'bipolarData':
      data = bipolarData;
      break;
    case 'mosData':
      data = mosData;
      break;
    default:
      data = microprocessorData;
  }

  // Debug: Log selected dataset
  console.log("Selected dataset:", data);

  // Normalize category name
  let category = component.complexFailure;
  if (category === 'pla/pal') {
    category = 'pla';
  }

  // Debug: Log category
  console.log("Category:", category);

  const categoryData = data[category];
  console.log("Category data:",categoryData);
  if (!categoryData) {
    console.log("No data found for category:", category);
    return 12;
  }
  console.log("Category data:",categoryData);
  const matchedRange = categoryData.find(
    item => gateCount >= item.min && gateCount <= item.max
  );
  console.log("Matched range:", matchedRange);

  // 8. Return result
  const result = matchedRange ? matchedRange.c1 : 0;
  console.log("Final C1 value:", result);
  return result;
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
  bipolar: [
    { min: 1, max: 8, c1: 0.060 }, // c1 parameter included
    { min: 8, max: 16, c1: 0.12 },
    { min: 16, max: 32, c1: 0.24 }
  ],
  mos: [
    { min: 1, max: 8, c1: 0.14 },
    { min: 8, max: 16, c1: 0.28 },
    { min: 16, max: 32, c1: 0.56 }
  ]
};
console.log("microprocessorData....", microprocessorData)
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
    case 'MOS_SRAM': return getMOSSRAMC1(getSizeCategory(component.memorySize));
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
  },
];

console.log("value1...", QUALITY_FACTORS)
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


export const getEnvironmentFactor = (environment) => {
  return ENVIRONMENTAL_FACTORS[environment]?.value || 1.0;
};


export const getEnvironmentLabel = (envCode) => {
  return ENVIRONMENTAL_FACTORS[envCode]?.label || '';
};


export const calculateSawDeviceFailureRate = (qualityFactor, environment) => {
  const piQ = qualityFactor || 1.0;
  const piE = getEnvironmentFactor(environment || 'GB');
  return BASE_FAILURE_RATE * piQ * piE;
};


export const getEnvironmentalOptions = () => {
  return Object.entries(ENVIRONMENTAL_FACTORS).map(([key, env]) => ({
    value: key,
    label: `${key} - ${env.label} (πE = ${env.value})`
  }));
};