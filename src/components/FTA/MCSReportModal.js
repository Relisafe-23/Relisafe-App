import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Button } from 'react-bootstrap';
import MaterialTable from 'material-table';
import tableIcons from './TableIcons';

const MCSReportModal = ({ 
  isOpen, 
  onClose 
}) => {
  
  const [data, setData] = useState([]);

  // Sample data exactly matching your image
  const sampleData = [
    {
      id: 1,
      cutSetProb: '2.00E-05',
      eventProb: '2.00E-05',
      calcParams: 'λ=2.000E-08 T=1000h',
      eventType: 'Latent',
      eventCode: 'TRNSDC-CH2-NSIG',
      description: 'No output/ wrong output from all transducer sensors channel 2'
    },
    {
      id: 2,
      cutSetProb: '1.00E-07',
      eventProb: '1.00E-07',
      calcParams: 'λ=2.000E-08',
      eventType: 'Evident',
      eventCode: 'TRNSDC-CH1-NSIG',
      description: 'No output/ wrong output from all transducer sensors channel 1'
    },
    {
      id: 3,
      cutSetProb: '7.50E-09',
      eventProb: '7.50E-09',
      calcParams: 'λ=1.500E-09',
      eventType: 'Evident',
      eventCode: 'SPBR-LVR-FRACT',
      description: 'Fracture of speedbrake lever'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setData(sampleData);
    }
  }, [isOpen]);

  const columns = [
    { 
      title: '#', 
      field: 'id',
      width: '5%',
      render: rowData => rowData.id
    },
    { 
      title: 'CutSet prob.', 
      field: 'cutSetProb',
      width: '10%',
      render: rowData => rowData.cutSetProb
    },
    { 
      title: 'Event prob.', 
      field: 'eventProb',
      width: '10%',
      render: rowData => rowData.eventProb
    },
    { 
      title: 'Calc.parameters', 
      field: 'calcParams',
      width: '15%',
      render: rowData => rowData.calcParams
    },
    { 
      title: 'Event Type', 
      field: 'eventType',
      width: '12%',
      render: rowData => rowData.eventType
    },
    { 
      title: 'Event code', 
      field: 'eventCode',
      width: '18%',
      render: rowData => rowData.eventCode
    },
    { 
      title: 'Event Description', 
      field: 'description',
      width: '30%',
      render: rowData => rowData.description
    }
  ];

  const downloadCSV = () => {
    const headers = ['#', 'CutSet prob.', 'Event prob.', 'Calc.parameters', 'Event Type', 'Event code', 'Event Description'];
    const rows = data.map(item => [
      `"${item.id}"`,
      `"${item.cutSetProb}"`,
      `"${item.eventProb}"`,
      `"${item.calcParams}"`,
      `"${item.eventType}"`,
      `"${item.eventCode}"`,
      `"${item.description}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MCS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleGetReport = () => {
    // This would typically generate a PDF or more detailed report
    console.log("Generating detailed report...");
    downloadCSV();
  };

  return (
    <Modal
      title="Minimal cut set's"
      open={isOpen}
      onCancel={onClose}
      width={1300}
      footer={[
        <Button 
          key="close" 
          variant="secondary" 
          onClick={onClose}
          style={{ marginRight: '10px' }}
        >
          Close
        </Button>,
        <Button 
          key="getReport" 
          onClick={handleGetReport}
          style={{ backgroundColor: '#00a9c9', color: 'white', border: 'none' }}
        >
          Get Report
        </Button>
      ]}
    >
      {/* Header Information - Exactly matching your image */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '5px',
        border: '1px solid #dee2e6'
      }}>
        <h5 style={{ marginBottom: '10px', color: '#495057' }}>
          <strong>Calculation:</strong> Worst case probability 'at risk time' per mission. Start time=0h, exposure=5h. Flight time=5h.
        </h5>
        <p style={{ marginBottom: '5px', fontSize: '14px' }}>
          <strong>Result for Top Level: 2.01E-05.</strong> Number of MCS 7/7. Order of MCS: Min 1/ Max 3
        </p>
      </div>

      {/* Table */}
      <div style={{ maxHeight: '500px', overflow: 'auto' }}>
        <MaterialTable
          icons={tableIcons}
          columns={columns}
          data={data}
          options={{
            search: true,
            paging: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 20],
            sorting: true,
            headerStyle: {
              backgroundColor: '#51afeeff',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '13px',
              position: 'sticky',
              top: 0,
              zIndex: 1
            },
            rowStyle: {
              fontSize: '12px'
            }
          }}
          localization={{
            body: {
              emptyDataSourceMessage: 'No MCS data available'
            }
          }}
        />
      </div>
    </Modal>
  );
};

export default MCSReportModal;