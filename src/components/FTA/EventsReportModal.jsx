// src/components/FTA/EventsReportModal.js
import React, { useState, useMemo } from 'react';
import { Modal } from 'antd';
import { Button } from 'react-bootstrap';
import MaterialTable from 'material-table';

// Import Material-UI icons
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const EventsReportModal = ({ 
  isOpen, 
  onClose, 
  eventsData = [], 
  gatesData = [], 
  reportType: initialReportType = 'all' 
}) => {
  const [reportType, setReportType] = useState(initialReportType);
  
  // Table icons configuration
  const tableIcons = {
    Add: AddBox,
    Check: Check,
    Clear: Clear,
    Delete: DeleteOutline,
    DetailPanel: ChevronRight,
    Edit: Edit,
    Export: SaveAlt,
    Filter: FilterList,
    FirstPage: FirstPage,
    LastPage: LastPage,
    NextPage: ChevronRight,
    PreviousPage: ChevronLeft,
    ResetSearch: Clear,
    Search: Search,
    SortArrow: ArrowDownward,
    ThirdStateCheck: Remove,
    ViewColumn: ViewColumn
  };
  
  // Function to download report as CSV
  const downloadReport = () => {
    let dataToDownload = [];
    let filename = '';
    
    if (reportType === 'events') {
      dataToDownload = eventsData;
      filename = 'Events_Report';
    } else if (reportType === 'gates') {
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
    
    if (reportType === 'events') {
      headers = ['Event Name', 'Description', 'Failure Rate', 'Calc Type'];
      rows = dataToDownload.map(item => [
        `"${item.code || ''}"`,
        `"${item.description || ''}"`,
        `"${item.failureRate || 'N/A'}"`,
        `"${item.calcType || 'N/A'}"`
      ]);
    } else if (reportType === 'gates') {
      headers = ['Gate Name', 'Description', 'Gate Type', 'Gate ID', 'Child Count'];
      rows = dataToDownload.map(item => [
        `"${item.code || ''}"`,
        `"${item.description || ''}"`,
        `"${item.gateType || 'N/A'}"`,
        `"${item.gateId || 'N/A'}"`,
        `"${item.childCount || '0'}"`
      ]);
    } else {
      headers = ['Name', 'Description', 'Type', 'Gate Type', 'Failure Rate', 'Calc Type'];
      rows = dataToDownload.map(item => [
        `"${item.code || ''}"`,
        `"${item.description || ''}"`,
        `"${item.type || 'N/A'}"`,
        `"${item.gateType || 'N/A'}"`,
        `"${item.failureRate || 'N/A'}"`,
        `"${item.calcType || 'N/A'}"`
      ]);
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

  // Only show buttons when report type is 'all'
  const showButtons = initialReportType === 'all';

  // Prepare table data and columns based on report type
  const { tableData, columns } = useMemo(() => {
    let data = [];
    let cols = [];

    if (reportType === 'events' || (initialReportType === 'events' && reportType !== 'gates')) {
      data = eventsData;
      cols = [
        { title: 'Event Name', field: 'code', width: '20%' },
        { title: 'Description', field: 'description', width: '30%' },
        { title: 'Failure Rate', field: 'failureRate', width: '15%' },
        { title: 'Calc Type', field: 'calcType', width: '35%' }
      ];
    } else if (reportType === 'gates' || (initialReportType === 'gates' && reportType !== 'events')) {
      data = gatesData;
      cols = [
        { title: 'Gate Name', field: 'code', width: '20%' },
        { title: 'Description', field: 'description', width: '25%' },
        { title: 'Gate Type', field: 'gateType', width: '15%' },
        { title: 'Gate ID', field: 'gateId', width: '15%' },
        { title: 'Child Count', field: 'childCount', width: '10%' }
      ];
    } else if (reportType === 'all' && initialReportType === 'all') {
      data = [...eventsData, ...gatesData];
      cols = [
        { title: 'Name', field: 'code', width: '15%' },
        { title: 'Description', field: 'description', width: '25%' },
        { title: 'Type', field: 'type', width: '10%' },
        { title: 'Gate Type', field: 'gateType', width: '15%' },
        { title: 'Failure Rate', field: 'failureRate', width: '15%' },
        { title: 'Calc Type', field: 'calcType', width: '20%' }
      ];
    }

    return { tableData: data, columns: cols };
  }, [reportType, initialReportType, eventsData, gatesData]);

  return (
    <Modal
      title="Fault Tree Analysis Report"
      open={isOpen}
      onCancel={onClose}
      width={1200}
      style={{ maxWidth: '95vw' }}
      bodyStyle={{ padding: '20px' }}
      footer={[
        <Button key="download" onClick={downloadReport} style={{ marginRight: '10px' }}>
          Download
        </Button>,
        <Button key="close" variant="secondary" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      {/* Only show buttons when report type is 'all' */}
      {showButtons && (
        <div style={{ marginBottom: '20px' }}>
          {eventsData.length > 0 && (
            <Button 
              variant={reportType === 'events' ? 'primary' : 'outline-primary'} 
              onClick={() => setReportType('events')}
              style={{ marginRight: '10px' }}
            >
              Events ({eventsData.length})
            </Button>
          )}
          
          {gatesData.length > 0 && (
            <Button 
              variant={reportType === 'gates' ? 'primary' : 'outline-primary'} 
              onClick={() => setReportType('gates')}
              style={{ marginRight: '10px' }}
            >
              Gates ({gatesData.length})
            </Button>
          )}
          
          {(eventsData.length > 0 || gatesData.length > 0) && (
            <Button 
              variant={reportType === 'all' ? 'primary' : 'outline-primary'} 
              onClick={() => setReportType('all')}
            >
              All ({eventsData.length + gatesData.length})
            </Button>
          )}
        </div>
      )}
      
      <div style={{ 
        maxHeight: '500px',
        overflow: 'auto',
        width: '100%'
      }}>
        {/* Check if we should show a table */}
        {((reportType === 'events' && eventsData.length > 0) ||
          (reportType === 'gates' && gatesData.length > 0) ||
          (reportType === 'all' && (eventsData.length > 0 || gatesData.length > 0))) ? (
          <MaterialTable
            icons={tableIcons}
            title=""
            columns={columns}
            data={tableData}
            options={{
              search: true,
              paging: true,
              pageSize: 10,
              pageSizeOptions: [5, 10, 20, 50],
              sorting: true,
              showTitle: false,
              toolbar: true,
              headerStyle: {
                backgroundColor: '#51afeeff',
                fontWeight: 'bold',
                padding: '12px 15px',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                position: 'sticky',
                top: 0,
                zIndex: 1
              },
              cellStyle: {
                padding: '10px 15px',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              },
              rowStyle: {
                padding: '8px 0'
              },
              maxBodyHeight: '400px',
              minBodyHeight: '200px',
              exportButton: false,
              exportAllData: false,
              actionsColumnIndex: -1,
              emptyRowsWhenPaging: false,
              tableLayout: 'auto',
              fixedColumns: {
                left: 0,
                right: 0
              }
            }}
            style={{
              width: '100%',
              minWidth: '900px',
              tableLayout: 'auto'
            }}
            localization={{
              body: {
                emptyDataSourceMessage: 'No data to display'
              },
              toolbar: {
                searchPlaceholder: 'Search...'
              },
              pagination: {
                labelDisplayedRows: '{from}-{to} of {count}',
                labelRowsSelect: 'rows'
              }
            }}
            components={{
              Container: props => <div {...props} style={{ width: '100%', overflowX: 'auto' }} />
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {reportType === 'events' && 'No events data available'}
            {reportType === 'gates' && 'No gates data available'}
            {reportType === 'all' && 'No data available'}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EventsReportModal;