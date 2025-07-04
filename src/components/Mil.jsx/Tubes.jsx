import React, { useState } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MaterialTable from 'material-table';
import Paper from '@mui/material/Paper';
import { CalculatorIcon } from '@heroicons/react/24/outline';

const Tubes = ({ onCalculate }) => {
  const [componentType, setComponentType] = useState('twt');
  const [twtInputs, setTwtInputs] = useState({
    power: '',
    frequency: '',

    construction: 'Coaxial Pulsed',
    environment: 'Gg'
  });
  const [twtResult, setTwtResult] = useState(null);

  const [magnetronInputs, setMagnetronInputs] = useState({
    type: 'pulsed',
    power: '',
    frequency: '',
    utilization: '',
    construction: '',
    environment: ''
  });
  const [magnetronResult, setMagnetronResult] = useState(null);
   const[selectedEnvironment,setSelectedEnvironment] =useState (null)
  const [error, setError] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);
    const [errors, setErrors] = useState({
    twt: {
      power: '',
      frequency: '',
      environment:''
    },
    magnetron: {
      power: '',
      frequency: '',
      utilization: '',
        environment:''
    }
  });

  // Environment factors with labels
  const environmentFactors = {
    twt: [
      { env: 'Gb', label: 'Ground, Benign', factor: 0.5 },
      { env: 'Gf', label: 'Ground, Fixed', factor: 1.5 },
      { env: 'GM', label: 'Ground, Mobile', factor: 7.0 },
      { env: 'Ns', label: 'Naval, Sheltered', factor: 3.0 },
      { env: 'NU', label: 'Naval, Unsheltered', factor: 10 },
      { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 5.0 },
      { env: 'AIF', label: 'Airborne, Inhabited, Fighter', factor: 7.0 },
      { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 6.0 },
      { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 9.0 },
      { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 20 },
      { env: 'SF', label: 'Space, Flight', factor: 0.05 },
      { env: 'MF', label: 'Missile, Flight', factor: 11 },
      { env: 'ML', label: 'Missile, Launch', factor: 33 },
      { env: 'CL', label: 'Cannon, Launch', factor: 500 }
    ],
    magnetron: [
      { env: 'G_B', label: 'Ground, Benign', factor: 1.0 },
      { env: 'G_F', label: 'Ground, Fixed', factor: 2.0 },
      { env: 'G_M', label: 'Ground, Mobile', factor: 4.0 },
      { env: 'N_S', label: 'Naval, Sheltered', factor: 15 },
      { env: 'NU', label: 'Naval, Unsheltered', factor: 47 },
      { env: 'AIC', label: 'Airborne, Inhabited, Cargo', factor: 10 },
      { env: 'A_IF', label: 'Airborne, Inhabited, Fighter', factor: 16 },
      { env: 'AUC', label: 'Airborne, Uninhabited, Cargo', factor: 12 },
      { env: 'AUF', label: 'Airborne, Uninhabited, Fighter', factor: 23 },
      { env: 'ARW', label: 'Airborne, Rotary Wing', factor: 80 },
      { env: 'S_F', label: 'Space, Flight', factor: 0.50 },
      { env: 'M_F', label: 'Missile, Flight', factor: 43 },
      { env: 'M_L', label: 'Missile, Launch', factor: 133 },
      { env: 'C_L', label: 'Cannon, Launch', factor: 2000 }
    ]
  };

  // Construction factors for magnetrons
  const constructionFactors = [
    { type: 'CW (Rated Power < 5 KW)', factor: 1.0 },
    { type: 'Coaxial Pulsed', factor: 1.0 },
    { type: 'Conventional Pulsed', factor: 5.4 }
  ];



  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      twt: { power: '', frequency: ''},
      magnetron: { power: '', frequency: '', utilization: '',environment:'' }
    };



    if (componentType === 'twt') {
      if (!twtInputs.power || isNaN(twtInputs.power)) {
        newErrors.twt.power = 'Please enter a valid power value';
        isValid = false;
      } else if (parseFloat(twtInputs.power) <= 0) {
        newErrors.twt.power = 'Power must be greater than 0';
        isValid = false;
      }

      if (!twtInputs.frequency || isNaN(twtInputs.frequency)) {
        newErrors.twt.frequency = 'Please enter a valid frequency value';
        isValid = false;
      } else if (parseFloat(twtInputs.frequency) <= 0) {
        newErrors.twt.frequency = 'Frequency must be greater than 0';
        isValid = false;
      }
      // if(!selectedEnvironment){
      //   newErrors.twt.environment = "Environment Factor is required"
      //   isValid = false;
      // }
    } else {
      if (magnetronInputs.type === 'pulsed') {
        if (!magnetronInputs.power || isNaN(magnetronInputs.power)) {
          newErrors.magnetron.power = 'Please enter a valid power value';
          isValid = false;
        } else if (parseFloat(magnetronInputs.power) <= 0) {
          newErrors.magnetron.power = 'Power must be greater than 0';
          isValid = false;
        }

        if (!magnetronInputs.frequency || isNaN(magnetronInputs.frequency)) {
          newErrors.magnetron.frequency = 'Please enter a valid frequency value';
          isValid = false;
        } else if (parseFloat(magnetronInputs.frequency) <= 0) {
          newErrors.magnetron.frequency = 'Frequency must be greater than 0';
          isValid = false;
        }
      } else {
        if (!magnetronInputs.power || isNaN(magnetronInputs.power)) {
          newErrors.magnetron.power = 'Please enter a valid power value';
          isValid = false;
        } else if (parseFloat(magnetronInputs.power) < 0) {
          newErrors.magnetron.power = 'Power must be 0 or greater';
          isValid = false;
        } else if (parseFloat(magnetronInputs.power) >= 5) {
          newErrors.magnetron.power = 'For CW Magnetrons, power must be < 5 KW';
          isValid = false;
        }
      }

      if (!magnetronInputs.utilization || isNaN(magnetronInputs.utilization)) {
        newErrors.magnetron.utilization = 'Please enter a valid utilization ratio';
        isValid = false;
      } else if (parseFloat(magnetronInputs.utilization) < 0 || parseFloat(magnetronInputs.utilization) > 1) {
        newErrors.magnetron.utilization = 'Utilization must be between 0 and 1';
        isValid = false;
      }
    }

     setErrors(newErrors);
    return isValid;
  };

  // Calculate TWT failure rate
  const calculateTwt = () => {
    
    if (!validateInputs()) return;
   

    try {
      const P = parseFloat(twtInputs.power);
      const F = parseFloat(twtInputs.frequency);
      const envFactor = environmentFactors.twt.find(e => e.env === twtInputs.environment);
      const πE = envFactor ? envFactor.factor : 0;
      console.log("Environmebtyvh",πE)
      // const πE = selectedEnvironment.πE;
      // if (isNaN(P) || isNaN(F)) {
      //   throw new Error('Please enter valid numbers for Power and Frequency');
      // }

      // Base failure rate formula
      const λb = 11 * Math.pow(1.00001, P) * Math.pow(1.1, F);

      // Final failure rate
      const λp = λb * πE;

      setTwtResult({
        λb: λb?.toFixed(2),
        πE: πE,
        λp: λp?.toFixed(2),
        units: 'failures/10⁵ hours'
      });
      setError(null);
      if (onCalculate) {
        onCalculate(λp);
      }
  
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        twt: { ...prev.twt, general: 'An error occurred during calculation' }
      }));
      setTwtResult(null);
    }
  };


  // Calculate Magnetron failure rate
  const calculateMagnetron = () => {
        if (!validateInputs()) return;
      
        try {

      const P = parseFloat(magnetronInputs.power);
      const F = parseFloat(magnetronInputs.frequency);
      const R = parseFloat(magnetronInputs.utilization);
      const constFactor = constructionFactors.find(c => c.type === magnetronInputs.construction);
      const πc = constFactor ? constFactor.factor : 0;
      const envFactor = environmentFactors.magnetron.find(e => e.env === magnetronInputs.environment);
      const πE = envFactor ? envFactor.factor : 0;
      console.log("πE",πE)
      // if (magnetronInputs.type === 'cw' && P >= 5) {
      //   throw new Error('For CW Magnetrons, power must be < 5 KW');
      // }

      let λb = 0;
      let πu = 0;

      if (magnetronInputs.type === 'pulsed') {
        // if (isNaN(P) || isNaN(F)) {
        //   throw new Error('Please enter valid numbers for Power and Frequency');
        // }

        if (isNaN(R)) {
          throw new Error('Please enter utilization ratio for Pulsed Magnetrons');
        }
        πu = 0.44 + 0.56 * R;

        λb = 19 * Math.pow(F, 0.73) * Math.pow(P, 0.20);
      } else {
        λb = 18;
        πu = 0.44 + 0.56 * R;
      }

      const λp = λb * πu * πc * πE;

      setMagnetronResult({
        λb: λb?.toFixed(2),
        πu: πu?.toFixed(2),
        πc,
        πE,
        λp: λp?.toFixed(2),
        units: 'failures/10⁶ hours'
      });
      setError(null);
      if (onCalculate) {
        onCalculate(λp);
      }
      
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        magnetron: { ...prev.magnetron, general: 'An error occurred during calculation' }
      }));
      setMagnetronResult(null);
    }

   
  };

  const handleTwtInputChange = (e) => {
    const { name, value } = e.target;
    setTwtInputs(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({
      ...prev,
      twt: { ...prev.twt, [name]: '' }
    }));
  };

  const handleMagnetronInputChange = (e) => {
    const { name, value } = e.target;
    setMagnetronInputs(prev => ({ ...prev, [name]: value }));
     setErrors(prev => ({
      ...prev,
      magnetron: { ...prev.magnetron, [name]: '' }
    }));
  };

  const resetCalculator = () => {
    if (componentType === 'twt') {
      setTwtInputs({
        power: '',
        frequency: '',
        environment: ''
      });
      setTwtResult(null);
    } else {
      setMagnetronInputs({
        type: 'pulsed',
        power: '',
        frequency: '',
        utilization: '',
        construction: '',
        environment: ''
      });
      setMagnetronResult(null);
    }
    setErrors({
      twt: { power: '', frequency: '',environment:'' },
      magnetron: { power: '', frequency: '', utilization: '' ,environment:''}
    });
    setShowCalculations(false);
  };


  const handleCalculate = () => {
    if (componentType === 'twt') {
      calculateTwt();
    } else {
      calculateMagnetron();
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

  const renderTwtForm = () => (
    <>
      <Row className="mb-3">
        <Col md={4}>
          <div className="form-group">
            <label>Power (W) for λ<sub>b</sub>:</label>
            <input
              type="number"
              name="power"
              value={twtInputs.power}
              onChange={handleTwtInputChange}
              min="0.001"
              max="40000"
              step="0.001"
             className={`form-control ${errors.twt.power ? 'is-invalid' : ''}`}

            />
            
            {errors.twt.power && <small className="text-danger">{errors.twt.power}</small>}

          </div>
        </Col>
        <Col md={4}>
          <div className="form-group">
            <label>Frequency (GHz) for λ<sub>b</sub>:</label>
            <input
              type="number"
              name="frequency"
              value={twtInputs.frequency}
              onChange={handleTwtInputChange}
              min="0.1"
              max="18"
              step="0.1"
              className={`form-control ${errors.twt.frequency ? 'is-invalid' : ''}`}
            />
            
            {errors.twt.frequency && <small className="text-danger">{errors.twt.frequency}</small>}

          </div>
        </Col>

        <Col md={4}>
          <div className="form-group">
            <label>Environment π<sub>E</sub>:</label>
            <Select
              styles={customStyles}
              name="environment"
              placeholder="select..."
              // value={selectedEnvironment}
              // isInvalid ={!!errors.environment}
              value={{
                value: twtInputs.environment,
                label: `${environmentFactors.twt.find(e => e.env === twtInputs.environment)?.label || twtInputs.environment} (πE = ${environmentFactors.twt.find(e => e.env === twtInputs.environment)?.factor || 0})`
              }}
              onChange={(selectedOption) => {
                setTwtInputs(prev => ({ ...prev, environment: selectedOption.value }));
                // setSelectedEnvironment(selectedOption);
                setErrors({ ...errors, environment: '' });
              }}
              options={environmentFactors.twt.map(item => ({
                value: item.env,
                label: `${item.label} (πE = ${item.factor})`
              }))}
            />
              {/* {errors.twt.environment && <small className="text-danger">{errors.twt.environment}</small>} */}
          </div>
   
        </Col>
      </Row>
    </>
  );

  const renderMagnetronForm = () => (
    <>
      <Row>
        <Col md={4}>
          <div className="form-group">
            <label>Magnetron Type:</label>
            <div className="d-flex">
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="pulsed"
                  value="pulsed"
                  checked={magnetronInputs.type === 'pulsed'}
                  onChange={handleMagnetronInputChange}
                />
                <label className="form-check-label" htmlFor="pulsed">
                  Pulsed
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="cw"
                  value="cw"
                  checked={magnetronInputs.type === 'cw'}
                  onChange={handleMagnetronInputChange}
                />
                <label className="form-check-label" htmlFor="cw">
                  Continuous Wave (CW)
                </label>
              </div>
            </div>
          </div>
        </Col>


        {magnetronInputs.type === 'pulsed' && (
          <>
            <Col md={4}>
              <div className="form-group">
                <label>Power (MW) for λ<sub>b</sub>:</label>
                <input
                  type="number"
                  name="power"
                  value={magnetronInputs.power}
                  onChange={handleMagnetronInputChange}
                  min="0.01"
                  max="5"
                  step="0.01"

                  className={`form-control ${errors.magnetron.power ? 'is-invalid' : ''}`}

                />

                {errors.magnetron.power && <small className="text-danger">{errors.magnetron.power}</small>}

              </div>
            </Col>
            <Col md={4}>
              <div className="form-group">
                <label>Frequency (GHz) for λ<sub>b</sub>:</label>
                <input
                  type="number"
                  name="frequency"
                  value={magnetronInputs.frequency}
                  onChange={handleMagnetronInputChange}
                  min="1.5"
                  max="100"
                  step="0.1"
                  className={`form-control ${errors.magnetron.frequency ? 'is-invalid' : ''}`}
                />

                {errors.magnetron.frequency && <small className="text-danger">{errors.magnetron.frequency}</small>}

              </div>
            </Col>
            <Col md={4}>
              <div className="form-group">
                <label>Utilization Ratio  π<sub>U</sub>:</label>
                <input
                  type="number"
                  name="utilization"
                  value={magnetronInputs.utilization}
                  onChange={handleMagnetronInputChange}
                  min="0"
                  max="1"
                  step="0.1"
                  className={`form-control ${errors.magnetron.utilization ? 'is-invalid' : ''}`}

                />
                {errors.magnetron.utilization && <small className="text-danger">{errors.magnetron.utilization}</small>}

              </div>
            </Col>
          </>
        )}

        {/* {magnetronInputs.type === 'cw' && (
          <>
            <Col md={4}>
              <div className="form-group">
                <label>Power (KW):</label>
                <input
                  type="number"
                  name="power"
                  value={magnetronInputs.power}
                  onChange={handleMagnetronInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className={`form-control ${errors.magnetron.power ? 'is-invalid' : ''}`}

                />

                {errors.magnetron.power && <small className="text-danger">{errors.magnetron.power}</small>}

              </div>


            </Col>

            <Col md={4}>
              <div className="form-group">
                <label>Utilization Ratio :</label>
                <input
                  type="number"
                  name="utilization"
                  value={magnetronInputs.utilization}
                  onChange={handleMagnetronInputChange}
                  min="0"
                  max="1"
                  step="0.1"
                  className={`form-control ${errors.magnetron.utilization ? 'is-invalid' : ''}`}

                />
                {errors.magnetron.utilization && <small className="text-danger">{errors.magnetron.utilization}</small>}
              </div>
            </Col>
          </>
        )} */}
  
      {magnetronInputs.type === 'cw' && (
       <>
           <Col md={4}>
            <div className="form-group">
              <label>Power (KW) for λ<sub>b</sub>:</label>
              <input 
                type="number" 
                name="power" 
                value={magnetronInputs.power} 
                onChange={handleMagnetronInputChange}
                min="0"
                max="5"
                step="0.1"
                                className={`form-control ${errors.magnetron.power ? 'is-invalid' : ''}`}

              />
              
                {errors.magnetron.power && <small className="text-danger">{errors.magnetron.power}</small>}

            </div>
                  

          </Col>

            <Col md={4}>
            <div className="form-group">
              <label>Utilization Ratio  π<sub>U</sub> :</label>
              <input 
                type="number" 
                name="utilization" 
                value={magnetronInputs.utilization} 
                onChange={handleMagnetronInputChange}
                min="0"
                max="1"
                step="0.1"
                className={`form-control ${errors.magnetron.utilization ? 'is-invalid' : ''}`}

              />
                        {errors.magnetron.utilization && <small className="text-danger">{errors.magnetron.utilization}</small>}
            </div>
          </Col>
        </>
      )}
      <>
          <Col md={4}>
          <div className="form-group">
            <label>Construction  π<sub>C</sub>:</label>
            <Select
              styles={customStyles}
              name="construction"
              value={{
                value: magnetronInputs.construction,
                label: `${magnetronInputs.construction} (πc = ${constructionFactors.find(c => c.type === magnetronInputs.construction)?.factor || 0})`
              }}
              onChange={(selectedOption) => {
                setMagnetronInputs(prev => ({ ...prev, construction: selectedOption.value }));
              }}
              options={constructionFactors.map(item => ({
                value: item.type,
                label: `${item.type} (πc = ${item.factor})`
              }))}
            />
          </div>
        </Col>
        <Col md={4}>
          <div className="form-group">
            <label>Environment  π<sub>E</sub>:</label>
            <Select
              styles={customStyles}
              name="environment"
              value={{
                value: magnetronInputs.environment,
                label: `${environmentFactors.magnetron.find(e => e.env === magnetronInputs.environment)?.label || magnetronInputs.environment} (πE = ${environmentFactors.magnetron.find(e => e.env === magnetronInputs.environment)?.factor || 0})`
              }}
              onChange={(selectedOption) => {
                setMagnetronInputs(prev => ({ ...prev, environment: selectedOption.value }));
              }}
              options={environmentFactors.magnetron.map(item => ({
                value: item.env,
                label: `${item.label} (πE = ${item.factor})`
              }))}
            />
          </div>
        </Col>
      </>
      </Row>
    </>
  );

  const renderResultTable = () => {
    const result = componentType === 'twt' ? twtResult : magnetronResult;
    if (!result) return null;

    const data = [];
    const columns = [];

    if (componentType === 'twt') {
      columns.push(
        { title: <span>λ<sub>b</sub></span>, field: 'λb' },
        { title: <span>π<sub>E</sub></span>, field: 'πE' },
        { title: 'Failure Rate', field: 'λp' }
      );

      data.push({
        λb: result.λb,
        πE: result.πE,
        λp: result.λp,
        description: 'TWT Failure Rate Calculation'
      });
    } else {
      columns.push(
        { title: <span>λ<sub>b</sub></span>, field: 'λb' },
        { title: <span>π<sub>U</sub></span>, field: 'πu' },
        { title: <span>π<sub>C</sub></span>, field: 'πc' },
        { title: <span>π<sub>E</sub></span>, field: 'πE' },
        { title: 'Failure Rate', field: 'λp' }
      );

      data.push({
        λb: result.λb,
        πu: result.πu,
        πc: result.πc,
        πE: result.πE,
        λp: result.λp,
        description: 'Magnetron Failure Rate Calculation'
      });
    }

    return (
      <MaterialTable
        columns={columns}
        data={data}
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
    );
  };

  return (
    <div className='calculator-container'>
      <Row className="mb-3">
        <h2 className="text-center mb-4">

          {componentType === 'twt'
            ? 'Traveling Wave'
            : 'Magnetron '}
        </h2>


        <Col md={12}>
          <div className="form-group">
            <label>Component Type:</label>
            <Select
              styles={customStyles}
              value={{
                value: componentType,
                label: componentType === 'twt'
                  ? 'Traveling Wave Tube'
                  : 'Magnetron'
              }}
              onChange={(selectedOption) => {
                setComponentType(selectedOption.value);
                resetCalculator();
              }}
              options={[
                { value: 'twt', label: 'Traveling Wave Tube' },
                { value: 'magnetron', label: 'Magnetron' }
              ]}
            />
          </div>
        </Col>


      </Row>
      {componentType === 'twt' ? renderTwtForm() : renderMagnetronForm()}

      {error && (
        <Row className="mt-3">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}
      <div className='d-flex justify-content-between align-items-center' >
        <div>
          {(twtResult || magnetronResult) && (
            <>
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
                <CalculatorIcon
                  style={{ height: '30px', width: '40px' }}
                  fontSize="large"
                />
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
            </>
          )}

        </div>
        <Button
          variant="primary"
          className="btn-calculate float-end mb-4"
          onClick={handleCalculate}
        >
          Calculate Failure Rate
        </Button>
      </div>
      {(twtResult || magnetronResult) && (
        <>

          <h2 className="text-center">Calculation Results</h2>
          <div className="d-flex align-items-center">
            <strong>Predicted Failure Rate (λ<sub>p</sub>):</strong>
            {componentType === 'twt' ? twtResult.λp : magnetronResult.λp}
            <span className="units"> {componentType === 'twt' ? 'failures/10⁵ hours' : 'failures/10⁶ hours'}</span>
          </div>


        </>
      )}

      {showCalculations && (
        <div className="mt-4">
          {renderResultTable()}

          <div className="formula-section mt-4 p-3 bg-light rounded">
            <Typography variant="h6" gutterBottom>
              Calculation Formula
            </Typography>
            {componentType === 'twt' ? (
              <>
                <Typography variant="body1" paragraph>
                  λ<sub>p</sub> = λ<sub>b</sub> × π<sub>E</sub>
                </Typography>
                <Typography variant="body1" paragraph>Where:</Typography>
                <ul>
                  <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^5 Hours)</li>
                  <li>λ<sub>b</sub> = Base failure rate (calculated from power and frequency)</li>
                  <li>π<sub>E</sub> = Environment factor</li>
                </ul>
                <Typography variant="body1">
                  Base failure rate formula: λ<sub>b</sub> = 1 × (11.00001)<sup>P</sup> × (1.1)<sup>F</sup>
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body1" paragraph>
                  λ<sub>p</sub> = λ<sub>b</sub> × π<sub>U</sub> × π<sub>C</sub> × π<sub>E</sub>
                </Typography>
                <Typography variant="body1" paragraph>Where:</Typography>
                <ul>
                  <li>λ<sub>p</sub> = Predicted failure rate (Failures/10^6 Hours)</li>
                  <li>λ<sub>b</sub> = Base failure rate</li>
                  <li>π<sub>U</sub> = Utilization factor</li>
                  <li>π<sub>C</sub> = Construction factor</li>
                  <li>π<sub>E</sub> = Environment factor</li>
                </ul>
                {magnetronInputs.type === 'pulsed' && (
                  <Typography variant="body1">
                    Base failure rate formula for pulsed: λ<sub>b</sub> = 19 × F<sup>0.73</sup> × P<sup>0.20</sup>
                  </Typography>
                )}
                {magnetronInputs.type === 'cw' && (
                  <Typography variant="body1">
                    Base failure rate for CW: λ<sub>b</sub> = 18
                  </Typography>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>


  );
};

export default Tubes;