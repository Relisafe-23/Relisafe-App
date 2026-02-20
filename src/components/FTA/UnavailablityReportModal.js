import React, { useMemo } from 'react';
import { Modal } from 'antd';
import { Button } from 'react-bootstrap';
import MaterialTable from 'material-table';
import  tableIcons  from './TableIcons'; // You can export the icons to a separate file

const UnavailabilityReportModal = ({ 
  isOpen, 
  onClose, 
  calculationData = [],
  missionTime 
}) => {
  
// In UnavailabilityReportModal.js
const columns = [
  { title: 'Component/Event', field: 'name', width: '20%' },
  { title: 'Description', field: 'description', width: '25%' },
  { title: 'Calc Type', field: 'calcType', width: '20%' },
  { title: 'Failure Rate (λ)', field: 'failureRate', width: '10%' },
  { title: 'q', field: 'q', width: '5%' },
  { title: 'T', field: 'T', width: '5%' },
  { title: 'Mission Time', field: 'missionTime', width: '5%' },
  { title: 'Unavailability Q(t)', field: 'unavailability', width: '10%' }
];

  const downloadCSV = () => {
    const headers = ['Component/Event', 'Description', 'Failure Rate (λ)', 'Mission Time (t)', 'Unavailability Q(t)'];
    const rows = calculationData.map(item => [
      `"${item.name || ''}"`,
      `"${item.description || ''}"`,
      `"${item.failureRate || 'N/A'}"`,
      `"${item.missionTime || missionTime || 'N/A'}"`,
      `"${item.unavailability || '0'}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows].join('\n');
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