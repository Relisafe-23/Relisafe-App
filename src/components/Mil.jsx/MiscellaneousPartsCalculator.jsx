import React, { useState } from 'react';
import MaterialTable from 'material-table';
import { Select, MenuItem, InputLabel, FormControl, TextField, Button, Paper } from '@material-ui/core';

const MiscellaneousPartsCalculator = ({onCalculate}) => {
  const [partType, setPartType] = useState('');
  const [environment, setEnvironment] = useState('');
  const [powerLevel, setPowerLevel] = useState('');
  const [result, setResult] = useState(null);
  const [piE, setPiE] = useState(1.0);

  const environmentOptions = {
    'Ferrite': [
      { value: 'GB', label: 'GB - Ground Benign', piE: 1.0 },
      { value: 'GF', label: 'GF - Ground Fixed', piE: 2.0 },
      { value: 'GM', label: 'GM - Ground Mobile', piE: 8.0 },
      { value: 'NS', label: 'NS - Naval Sheltered', piE: 5.0 },
      { value: 'NU', label: 'NU - Naval Unsheltered', piE: 12 },
      { value: 'AIC', label: 'AIC - Airborne inhabited Cargo', piE: 5.0 },
      { value: 'AIF', label: 'AIF - Airborne inhabited Fighter', piE: 8.0 },
      { value: 'AUC', label: 'AUC - Airborne Uninhabited Cargo', piE: 7.0 },
      { value: 'AUF', label: 'AUF - Airborne Uninhabited Fighter', piE: 11 },
      { value: 'ARW', label: 'ARW - Airborne Rotary Wing', piE: 17 },
      { value: 'SF', label: 'SF - Space Flight', piE: 0.50 },
      { value: 'MF', label: 'MF - Missile Flight', piE: 9.0 },
      { value: 'ML', label: 'ML - Missile Launch', piE: 24 },
      { value: 'CL', label: 'CL - Cannon Launch', piE: 450 }
    ],
    'DummyLoads': [
      { value: 'GB', label: 'GB - Ground Benign', piE: 1.0 },
      { value: 'GF', label: 'GF - Ground Fixed', piE: 2.0 },
      { value: 'GM', label: 'GM - Ground Mobile', piE: 10 },
      { value: 'NS', label: 'NS - Naval Sheltered', piE: 5.0 },
      { value: 'NU', label: 'NU - Naval Unsheltered', piE: 17 },
      { value: 'AIC', label: 'AIC - Airborne inhabited Cargo', piE: 6.0 },
      { value: 'AIF', label: 'AIF - Airborne inhabited Fighter', piE: 8.0 },
      { value: 'AUC', label: 'AUC - Airborne Uninhabited Cargo', piE: 14 },
      { value: 'AUF', label: 'AUF - Airborne Uninhabited Fighter', piE: 22 },
      { value: 'ARW', label: 'ARW - Airborne Rotary Wing', piE: 25 },
      { value: 'SF', label: 'SF - Space Flight', piE: 0.50 },
      { value: 'MF', label: 'MF - Missile Flight', piE: 14 },
      { value: 'ML', label: 'ML - Missile Launch', piE: 36 },
      { value: 'CL', label: 'CL - Cannon Launch', piE: 660 }
    ]
  };

  const calculateFailureRate = () => {
    let baseRate = 0;
    let requiresPiE = false;

    switch (partType) {
      case 'Vibrators_60':
        baseRate = 15;
        break;
      case 'Vibrators_120':
        baseRate = 20;
        break;
      case 'Vibrators_400':
        baseRate = 40;
        break;
      case 'Lamps_Neon':
        baseRate = 0.20;
        break;
      case 'FiberOptic_Cables':
        baseRate = 0.1;
        break;
      case 'FiberOptic_Connectors':
        baseRate = 0.10;
        break;
      case 'Microwave_Variable':
        baseRate = 0.10;
        break;
      case 'Ferrite_Isolators_<=100W':
        baseRate = 0.10;
        requiresPiE = true;
        break;
      case 'Ferrite_Isolators_>100W':
        baseRate = 0.20;
        requiresPiE = true;
        break;
      case 'Ferrite_PhaseShifter':
        baseRate = 0.10;
        requiresPiE = true;
        break;
      case 'DummyLoads_<100W':
        baseRate = 0.010;
        requiresPiE = true;
        break;
      case 'DummyLoads_100W-1000W':
        baseRate = 0.030;
        requiresPiE = true;
        break;
      case 'DummyLoads_>1000W':
        baseRate = 0.10;
        requiresPiE = true;
        break;
      case 'Terminations':
        baseRate = 0.030;
        requiresPiE = true;
        break;
      default:
        baseRate = 0;
    }

    const failureRate = requiresPiE ? baseRate * piE : baseRate;
    setResult({
      partType,
      baseRate,
      environment: environment || 'N/A',
      piE: requiresPiE ? piE : 'N/A',
      failureRate,
      units: 'failures/10^6 hours'
    });
    if (onCalculate) {
      onCalculate(failureRate); // Pass the calculated failure rate
       // Pass the calculated failure rate
    }
  };

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
    <>
    <div className='calculator-container'>
      <h2 className='text-center'>Miscellaneous</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '10px' }}>
        <FormControl fullWidth>
          <label>Part Type</label>
          <Select
            styles={customStyles}
            value={partType}
            onChange={(e) => setPartType(e.target.value)}
          >
            <MenuItem value="Vibrators_60">Vibrators (60-cycle)</MenuItem>
            <MenuItem value="Vibrators_120">Vibrators (120-cycle)</MenuItem>
            <MenuItem value="Vibrators_400">Vibrators (400-cycle)</MenuItem>
            <MenuItem value="Lamps_Neon">Neon Lamps</MenuItem>
            <MenuItem value="FiberOptic_Cables">Fiber Optic Cables</MenuItem>
            <MenuItem value="FiberOptic_Connectors">Fiber Optic Connectors</MenuItem>
            <MenuItem value="Microwave_Variable">Microwave Variable Elements</MenuItem>
            <MenuItem value="Ferrite_Isolators_<=100W">Ferrite Isolators/Circulators (≤100W)</MenuItem>
            <MenuItem value="Ferrite_Isolators_>100W">Ferrite Isolators/Circulators (&gt;100W)</MenuItem>
            <MenuItem value="Ferrite_PhaseShifter">Ferrite Phase Shifter (Latching)</MenuItem>
            <MenuItem value="DummyLoads_<100W">Dummy Loads (&lt;100W)</MenuItem>
            <MenuItem value="DummyLoads_100W-1000W">Dummy Loads (100W-1000W)</MenuItem>
            <MenuItem value="DummyLoads_>1000W">Dummy Loads (&gt;1000W)</MenuItem>
            <MenuItem value="Terminations">Terminations</MenuItem>
          </Select>
        </FormControl>

        {(partType.includes('Ferrite') || partType.includes('DummyLoads') || partType === 'Terminations') && (
          <FormControl fullWidth>
            <label>Environment</label>
            <Select
              styles={customStyles}
              value={environment}
              onChange={(e) => {
                setEnvironment(e.target.value);
                const env = environmentOptions[
                  partType.includes('DummyLoads') || partType === 'Terminations' ? 'DummyLoads' : 'Ferrite'
                ].find(opt => opt.value === e.target.value);
                setPiE(env ? env.piE : 1.0);
              }}
            >
              {environmentOptions[
                partType.includes('DummyLoads') || partType === 'Terminations' ? 'DummyLoads' : 'Ferrite'
              ].map((env) => (
                <MenuItem key={env.value} value={env.value}>
                  {env.label} (πE = {env.piE})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
      <br/>

<br/>
<Button
  variant="primary"
  className="btn-calculate float-end"
  onClick={calculateFailureRate}
  disabled={!partType || ((partType.includes('Ferrite') || partType.includes('DummyLoads') || partType === 'Terminations') && !environment)}
  style={{
    backgroundColor: !partType || ((partType.includes('Ferrite') || partType.includes('DummyLoads') || partType === 'Terminations') && !environment) ? '#cccccc' : '#1e88e5',
    borderColor: !partType || ((partType.includes('Ferrite') || partType.includes('DummyLoads') || partType === 'Terminations') && !environment) ? '#999999' : '#0d47a1',
    color: 'white',
    fontWeight: 'bold',
    padding: '8px 20px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: !partType || ((partType.includes('Ferrite') || partType.includes('DummyLoads') || partType === 'Terminations') && !environment) ? 'not-allowed' : 'pointer'
  }}
>
  Calculate Failure Rate
</Button>
<br/>
<br/>
<br/>

      {result && (
      <div className="table-responsive">
      <MaterialTable
        columns={[
          {
            title: <span>Part Type</span>,
            field: 'partType',
            render: rowData => rowData.partType?.replace(/_/g, ' ') || '-'
          },
          {
            title: <span>λ<sub>b</sub></span>,
            field: 'λb',
            render: rowData => rowData.λb || '-'
          },
          {
            title: <span>Environment</span>,
            field: 'environment',
            render: rowData => rowData.environment || '-'
          },
          {
            title: <span>π<sub>E</sub></span>,
            field: 'πE',
            render: rowData => rowData.πE || '-'
          },
          {
            title: "Failure Rate",
            field: 'failureRate',
            render: rowData => rowData.failureRate ? Number(rowData.failureRate).toFixed(4) : '-',
          
          },
        
        ]}
        data={[
          {
            partType: result?.partType,
            λb: result?.baseRate,
            environment: result?.environment,
            πE: result?.piE,
            failureRate: result?.failureRate,
         
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
      )}
    </div>
    </>
  );
};

export default MiscellaneousPartsCalculator;