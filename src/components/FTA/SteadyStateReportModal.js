import React, { useMemo } from 'react';
import { Modal } from 'antd';
import { Button } from 'react-bootstrap';
import MaterialTable from 'material-table';
import  tableIcons  from './TableIcons';

const SteadyStateReportModal = ({ 
  isOpen, 
  onClose, 
  calculationData = []
}) => {
  
  const columns = [
    { title: 'Component/Event', field: 'name', width: '25%' },
    { title: 'Description', field: 'description', width: '30%' },
    { title: 'Failure Rate (λ)', field: 'failureRate', width: '15%' },
    { title: 'MTTR', field: 'mttr', width: '15%' },
    { title: 'Steady State Unavailability Q', field: 'steadyStateUnavailability', width: '15%' }
  ];

  const downloadCSV = () => {
    const headers = ['Component/Event', 'Description', 'Failure Rate (λ)', 'MTTR', 'Steady State Unavailability Q'];
    const rows = calculationData.map(item => [
      `"${item.name || ''}"`,
      `"${item.description || ''}"`,
      `"${item.failureRate || 'N/A'}"`,
      `"${item.mttr || 'N/A'}"`,
      `"${item.steadyStateUnavailability || '0'}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows].join('\n');
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
      width={1200}
      footer={[
        <Button key="download" onClick={downloadCSV} style={{ marginRight: '10px' }}>
          Download CSV
        </Button>,
        <Button key="close" variant="secondary" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <div style={{ marginBottom: '20px' }}>
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