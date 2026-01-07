// src/components/FTA/EventsReportModal.js
import React, { useState } from 'react';
import { Modal } from 'antd';
import { Button } from 'react-bootstrap';

const EventsReportModal = ({ isOpen, onClose, eventsData = [], gatesData = [] }) => {
  const [reportType, setReportType] = useState('all');
  
  // Determine initial report type based on data
  React.useEffect(() => {
    if (eventsData.length > 0 && gatesData.length === 0) {
      setReportType('events');
    } else if (gatesData.length > 0 && eventsData.length === 0) {
      setReportType('gates');
    } else {
      setReportType('all');
    }
  }, [eventsData, gatesData]);
  
  // Function to download report as CSV
  const downloadReport = () => {
    let dataToDownload = [];
    let filename = '';
    
    if (reportType === 'events' || (eventsData.length > 0 && gatesData.length === 0)) {
      dataToDownload = eventsData;
      filename = 'Events_Report';
    } else if (reportType === 'gates' || (gatesData.length > 0 && eventsData.length === 0)) {
      dataToDownload = gatesData;
      filename = 'Gates_Report';
    } else {
      dataToDownload = [...eventsData, ...gatesData];
      filename = 'All_Nodes_Report';
    }
    
    if (dataToDownload.length === 0) {
      alert('No data available to download');
      return;
    }
    
    // Create CSV content based on data type
    let headers = [];
    let rows = [];
    
    // Check what type of data we have
    if (dataToDownload.length > 0) {
      const sampleItem = dataToDownload[0];
      
      if (sampleItem.type === 'Event' || reportType === 'events') {
        headers = ['Event Code', 'Description', 'Failure Rate', 'Calc Type', /* 'Product' */];
        rows = dataToDownload.map(item => [
          `"${item.code || ''}"`,
          `"${item.description || ''}"`,
          `"${item.failureRate || 'N/A'}"`,
          `"${item.calcType || 'N/A'}"`,
          // `"${item.product || 'N/A'}"`
        ]);
      } else if (sampleItem.type === 'Gate' || reportType === 'gates') {
        headers = ['Gate Code', 'Description', 'Gate Type', 'Gate ID', 'Child Count'];
        rows = dataToDownload.map(item => [
          `"${item.code || ''}"`,
          `"${item.description || ''}"`,
          `"${item.gateType || 'N/A'}"`,
          `"${item.gateId || 'N/A'}"`,
          `"${item.childCount || '0'}"`
        ]);
      } else {
        headers = ['Code', 'Description', 'Type', 'Gate Type', 'Failure Rate', 'Calc Type'];
        rows = dataToDownload.map(item => [
          `"${item.code || ''}"`,
          `"${item.description || ''}"`,
          `"${item.type || 'N/A'}"`,
          `"${item.gateType || 'N/A'}"`,
          `"${item.failureRate || 'N/A'}"`,
          `"${item.calcType || 'N/A'}"`
        ]);
      }
    }
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine which tabs to show based on available data
  const showEventsTab = eventsData.length > 0;
  const showGatesTab = gatesData.length > 0;
  const showAllTab = eventsData.length > 0 && gatesData.length > 0;

  return (
    <Modal
      title="Fault Tree Analysis Report"
      open={isOpen}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="download" onClick={downloadReport} style={{ marginRight: '10px' }}>
          Download CSV
        </Button>,
        <Button key="close" variant="secondary" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      {/* Tabs - only show if we have data for that type */}
      <div style={{ marginBottom: '20px' }}>
        {showEventsTab && (
          <Button 
            variant={reportType === 'events' ? 'primary' : 'outline-primary'} 
            onClick={() => setReportType('events')}
            style={{ marginRight: '10px' }}
          >
            Events ({eventsData.length})
          </Button>
        )}
        
        {showGatesTab && (
          <Button 
            variant={reportType === 'gates' ? 'primary' : 'outline-primary'} 
            onClick={() => setReportType('gates')}
            style={{ marginRight: '10px' }}
          >
            Gates ({gatesData.length})
          </Button>
        )}
        
        {showAllTab && (
          <Button 
            variant={reportType === 'all' ? 'primary' : 'outline-primary'} 
            onClick={() => setReportType('all')}
          >
            All ({eventsData.length + gatesData.length})
          </Button>
        )}
      </div>
      
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {/* Events Table */}
        {(reportType === 'events' || (!showGatesTab && showEventsTab)) && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Event Code</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Description</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Failure Rate</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Calc Type</th>
                {/* <th style={{ padding: '8px', border: '1px solid #ddd' }}>Product</th> */}
              </tr>
            </thead>
            <tbody>
              {eventsData.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.code || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.description || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.failureRate || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.calcType || 'N/A'}</td>
                  {/* <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.product || 'N/A'}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Gates Table */}
        {(reportType === 'gates' || (!showEventsTab && showGatesTab)) && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Gate Code</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Description</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Gate Type</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Gate ID</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Child Count</th>
              </tr>
            </thead>
            <tbody>
              {gatesData.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.code || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.description || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.gateType || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.gateId || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.childCount || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* All Nodes Table */}
        {reportType === 'all' && showAllTab && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Code</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Description</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Gate Type</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Failure Rate</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Calc Type</th>
              </tr>
            </thead>
            <tbody>
              {[...eventsData, ...gatesData].map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.code || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.description || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.type || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.gateType || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.failureRate || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.calcType || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* No data message */}
        {eventsData.length === 0 && gatesData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No data available for the selected report type
          </div>
        )}
      </div>
      
 
    </Modal>
  );
};

export default EventsReportModal;