import React, { useMemo } from 'react';
import { Modal } from 'antd';
import { Button } from 'react-bootstrap';
import MaterialTable from 'material-table';
import tableIcons from './TableIcons';

const SteadyStateReportModal = ({ 
  isOpen, 
  onClose, 
  calculationData = []
}) => {
  
  // Function to get formula based on calc type
  const getFormula = (calcType) => {
    const formulas = {
      'Probability': 'Q̄ = q',
      'Frequency': 'Q̄ = 0',
      'Constant mission time': 'Q̄ = λ·tm',
      'Repairable': 'Q̄ = λ/(λ+μ)',
      'Unrepairable': 'Q̄ = 1',
      'Periodical tests': 'Q̄ = λ·T/2 + λ·MTTR',
      'Latent': 'Q̄ = λ·T',
      'Latent, P=λ*T/2': 'Q̄ = λ·T/2',
      'Latent,Life-time, P=1-e^(-λ*T)': 'Q̄ = 1-e^(-λT)',
      'Average probability per mission hour': 'Q̄ = λ',
      'Periodical Tests #2': 'Q̄ = λ·T/2 + λ·MTTR',
      'Evident, P=λ*t': 'Q̄ = 0',
      'Const.mission time, P=λ*tm': 'Q̄ = λ·tm',
      'Latent repairable': 'Q̄ = λ/(λ+μ)'
    };
    return formulas[calcType] || 'N/A';
  };

  // Function to format parameters
  const formatParameters = (item) => {
    const params = [];
  if (item.failureRate && item.failureRate !== 'N/A' && item.failureRate !== '0') {
    // Convert to number and show in exponential format
    const lambdaNum = parseFloat(item.failureRate);
    if (!isNaN(lambdaNum)) {
      params.push(`λ=${lambdaNum.toExponential(4)}`); // Shows as 1.2345e-6
    } else {
      params.push(`λ=${item.failureRate}`);
    }
  }
    if (item.q && item.q !== 'N/A' && item.q !== '0') {
      params.push(`q=${item.q}`);
    }
    if (item.T && item.T !== 'N/A' && item.T !== '0') {
      params.push(`T=${item.T}h`);
    }
    if (item.mttr && item.mttr !== 'N/A' && item.mttr !== '0') {
      params.push(`MTTR=${item.mttr}h`);
    }
    if (item.eventMissionTime && item.eventMissionTime !== 'N/A' && item.eventMissionTime !== '0') {
      params.push(`tm=${item.eventMissionTime}h`);
    }
    return params.join(', ') || 'No parameters';
  };

  const columns = [
    { title: '#', field: 'index', width: '4%', render: rowData => rowData.tableData?.id + 1 },
    { title: 'Component/Event', field: 'name', width: '12%' },
    { title: 'Description', field: 'description', width: '15%' },
    { title: 'Calc Type', field: 'calcType', width: '10%' },
    { title: 'Formula', field: 'formula', width: '15%', render: rowData => getFormula(rowData.calcType) },
    { title: 'Parameters', field: 'parameters', width: '15%', render: rowData => formatParameters(rowData) },
{ title: 'Q̄ Value', field: 'steadyStateUnavailability', width: '8%', render: rowData => rowData.steadyStateUnavailability || '0' }, //  ];
  ];
  const downloadCSV = () => {
    const headers = ['#', 'Component/Event', 'Description', 'Calc Type', 'Formula', 'Parameters', 'Failure Rate (λ)', 'q', 'T', 'MTTR', 'CutSet Prob.', 'Steady State Q̄'];
    const rows = calculationData.map((item, index) => [
      `"${index + 1}"`,
      `"${item.name || ''}"`,
      `"${item.description || ''}"`,
      `"${item.calcType || ''}"`,
      `"${getFormula(item.calcType)}"`,
      `"${formatParameters(item)}"`,
    `"${item.steadyStateUnavailability || '0'}"`,  
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Steady_State_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title="Steady-State Mean Unavailability - Q Report"
      open={isOpen}
      onCancel={onClose}
      width={1400}
      footer={[
        <Button key="download" onClick={downloadCSV} style={{ marginRight: '10px' }}>
          Download CSV
        </Button>,
        <Button key="close" variant="secondary" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <p>Total Components: {calculationData.length}</p>
      </div>

      <div style={{ maxHeight: '500px', overflow: 'auto' }}>
        {calculationData.length > 0 ? (
          <MaterialTable
            icons={tableIcons}
            columns={columns}
            data={calculationData}
            options={{
              search: true,
              paging: true,
              pageSize: 10,
              sorting: true,
              headerStyle: {
                backgroundColor: '#51afeeff',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No calculation data available
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SteadyStateReportModal;