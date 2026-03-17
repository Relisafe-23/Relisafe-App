import React, { useMemo } from 'react';
import { Modal } from 'antd';
import { Button } from 'react-bootstrap';
import MaterialTable from 'material-table';
import tableIcons from './TableIcons';

const UnavailabilityReportModal = ({ 
  isOpen, 
  onClose, 
  calculationData = [],
  missionTime ,
}) => {
  
  // Function to get formula based on calc type
  const getFormula = (calcType) => {
    const formulas = {
      'Probability': 'P = q',
      'Frequency': 'f = λ',
      'Constant mission time': 'P = 1-(1-q)^tm',
      'Repairable': 'P = (λ/(λ+μ))[1-e^(-(λ+μ)t)]',
      'Unrepairable': 'P = 1-(1-q)e^(-λt)',
      'Periodical tests': 'P = λ·T/2',
      'Latent': 'P = λ·T',
      'Latent, P=λ*T/2': 'P = λ·T/2',
      'Latent,Life-time, P=1-e^(-λ*T)': 'P = 1-e^(-λT)',
      'Average probability per mission hour': 'P = λ·t',
      'Periodical Tests #2': 'P = λ·T/2',
      'Evident, P=λ*t': 'P = λ·t',
      'Const.mission time, P=λ*tm': 'P = λ·tm',
      'Latent repairable': 'P = (λ/(λ+μ))[1-e^(-(λ+μ)T)]'
    };
    return formulas[calcType] || 'N/A';
  };

  // Function to format parameters
  const formatParameters = (item) => {
    const params = [];
    if (item.failureRate && item.failureRate !== 'N/A' && item.failureRate !== '0') {
      params.push(`λ=${item.failureRate}`);
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
    { title: 'Mission Time', field: 'missionTime', width: '5%' },
      { title: 'Q(t) Value', field: 'unavailability', width: '8%', render: rowData => rowData.unavailability || '0' }, // ← Add this
    // { title: 'CutSet Prob.', field: 'cutSetProb', width: '8%', render: rowData => rowData.unavailability || '0' },
  ];

  const downloadCSV = () => {
    const headers = ['#', 'Component/Event', 'Description', 'Calc Type', 'Formula', 'Parameters', 'Failure Rate (λ)', 'q', 'T', 'Mission Time', 'CutSet Prob.', 'Unavailability Q(t)'];
    const rows = calculationData.map((item, index) => [
      `"${index + 1}"`,
      `"${item.name || ''}"`,
      `"${item.description || ''}"`,
      `"${item.calcType || ''}"`,
      `"${getFormula(item.calcType)}"`,
      `"${formatParameters(item)}"`,
      `"${item.missionTime || missionTime || 'N/A'}"`,
      `"${item.unavailability || '0'}"`,
     
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Unavailability_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title="Unavailability at Time t - Q(t) Report"
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
        <h5>Mission Time: {missionTime || 'N/A'} hours</h5>
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

export default UnavailabilityReportModal;