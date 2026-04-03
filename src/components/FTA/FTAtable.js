// FTAtable.js with material-table and custom styling
import React from "react";
import { Box, Typography, CircularProgress, IconButton, Tooltip, Paper } from "@mui/material";
import MaterialTable from "material-table";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, FilePresent as FileIcon } from "@mui/icons-material";
import { useModal } from "../ModalContext";
import { toast } from "react-toastify";
import tableIcons from "./TableIcons";

const FTAtable = ({
  trees,
  loading,
  onViewTree,
  onCreateNewTree,
  projectId,
}) => {
  const { openDeleteNode } = useModal();

  const handleDeleteClick = (tree, event) => {
    event?.stopPropagation();
    
    if (!projectId) {
      toast.error('Cannot delete: Project ID is missing');
      return;
    }

    if (!tree) {
      toast.error('Cannot delete: Tree data is missing');
      return;
    }

    const childId = tree.treeStructure?.id || tree.id || tree._id;
    
    if (!childId) {
      toast.error('Cannot delete: Tree ID is missing');
      return;
    }
    
    const deleteData = {
      projId: projectId,
      childId: childId,
      tableParentId: tree.treeStructure?.parentId || childId,
      nodeActive: true,
      indexCount: 1,
      treeName: tree.treeStructure?.name || tree.name || 'Unnamed Tree'
    };
    
    openDeleteNode(deleteData);
  };

  if (loading) {
    return (
      <Box sx={{ padding: "20px", paddingTop: "80px", textAlign: "center" }}>
        <CircularProgress sx={{ color: "#00a9c9" }} />
        <Typography variant="body1" sx={{ mt: 2, color: "#666" }}>
          Loading trees...
        </Typography>
      </Box>
    );
  }

  const tableData = trees.map((tree, index) => ({
    id: tree.id || tree._id,
    sno: index + 1,
    name: tree.treeStructure?.name || "Unnamed Tree",
    description: tree.treeStructure?.description || "-",
    calcType: tree.treeStructure?.calcTypes || "-",
    missionTime: tree.treeStructure?.missionTime 
      ? `${tree.treeStructure.missionTime} hours` 
      : "-",
    originalTree: tree
  }));

  const columns = [
    { title: "S.NO", field: "sno", width: "5%", sorting: true },
    { title: "Name", field: "name", width: "20%", sorting: true },
    { title: "Description", field: "description", width: "30%", sorting: true },
    { 
      title: "Calc Type", 
      field: "calcType", 
      width: "15%", 
      sorting: true,
      // render: rowData => (
      //   <span style={{
      //     backgroundColor: '#e8f5e9',
      //     color: '#2e7d32',
      //     padding: '4px 12px',
      //     borderRadius: '16px',
      //     fontSize: '12px',
      //     fontWeight: 500,
      //     display: 'inline-block'
      //   }}>
      //     {rowData.calcType}
      //   </span>
      // )
    },
    { title: "Mission Time", field: "missionTime", width: "15%", sorting: true },
    {
      title: "Actions",
      field: "actions",
      width: "15%",
      sorting: false,
      render: rowData => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onViewTree(rowData.originalTree);
              }}
              sx={{
                color: '#0044ff',
                '&:hover': {
                  backgroundColor: '#fff3e0'
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(rowData.originalTree, e);
              }}
              sx={{
                color: '#f44336',
                '&:hover': {
                  backgroundColor: '#ffebee'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <Box sx={{ padding: "20px", paddingTop: "80px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
          Fault Tree Analysis Trees
        </Typography>
        <button
          onClick={onCreateNewTree}
          style={{
            backgroundColor: "#00a9c9",
            color: "#fff",
            height: "40px",
            padding: "0 24px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: 500
          }}
        >
          <AddIcon fontSize="small" />
          Create FTA
        </button>
      </Box>

      {/* <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <Typography variant="body2">
          Total Trees: <strong>{trees.length}</strong>
        </Typography>
      </Box> */}

      <MaterialTable
        icons={tableIcons}
        columns={columns}
        data={tableData}
        title=""
        options={{
          search: true,
          paging: true,
          pageSize: 5,
          pageSizeOptions: [5, 10, 25, 50],
          sorting: true,
          headerStyle: {
            backgroundColor: '#51afeeff',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '14px'
          },
          searchFieldStyle: {
            width: '250px'
          }
        }}
        onRowClick={(event, rowData) => {
          if (rowData && rowData.originalTree) {
            onViewTree(rowData.originalTree);
          }
        }}
      />
    </Box>
  );
};

export default FTAtable;