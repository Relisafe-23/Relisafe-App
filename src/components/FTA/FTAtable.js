// FTAtable.js with Material-UI
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Tooltip
} from "@mui/material";
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilePresent as FileIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useModal } from "../ModalContext";
import { toast } from "react-toastify";

// Styled components for custom styling
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  '& .MuiTableCell-head': {
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
}));

const ActionButton = styled(IconButton)(({ theme, color }) => ({
  margin: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: color === 'primary' ? '#e3f2fd' : 
                    color === 'warning' ? '#fff3e0' : 
                    '#ffebee',
  },
}));

const CreateButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#00a9c9",
  color: "#fff",
  height: "40px",
  minWidth: "160px",
  borderRadius: "8px",
  '&:hover': {
    backgroundColor: "#0089a9",
  },
}));

const FTAtable = ({
  trees,
  loading,
  onViewTree,
  onCreateNewTree,
  projectId,
}) => {
  const { openDeleteNode } = useModal();

  if (loading) {
    return (
      <Box 
        sx={{ 
          padding: "20px", 
          paddingTop: "80px", 
          textAlign: "center",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress sx={{ color: "#00a9c9" }} />
        <Typography variant="body1" sx={{ mt: 2, color: "#666" }}>
          Loading trees...
        </Typography>
      </Box>
    );
  }

  const handleDeleteClick = (tree, event) => {
    event?.stopPropagation();
    
    console.log('Delete clicked for tree:', tree);
    console.log('Project ID:', projectId);
    
    if (!projectId) {
      console.error('Project ID is missing');
      toast.error('Cannot delete: Project ID is missing');
      return;
    }

    if (!tree) {
      console.error('Tree data is missing');
      toast.error('Cannot delete: Tree data is missing');
      return;
    }

    // Get the correct IDs for deletion
    const childId = tree.treeStructure?.id || tree.id || tree._id;
    
    if (!childId) {
      console.error('Child ID is missing from tree:', tree);
      toast.error('Cannot delete: Tree ID is missing');
      return;
    }
    
    // Prepare the data object that ModalContext expects
    const deleteData = {
      projId: projectId,
      childId: childId,
      tableParentId: tree.treeStructure?.parentId || childId,
      nodeActive: true,
      indexCount: 1,
      treeName: tree.treeStructure?.name || tree.name || 'Unnamed Tree'
    };
    
    console.log('Delete data prepared:', deleteData);
    
    // Call the context's delete modal
    openDeleteNode(deleteData);
  };

  if (!trees || trees.length === 0) {
    return (
      <Box sx={{ padding: "20px", paddingTop: "80px" }}>
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 4 
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
            Fault Tree Analysis Trees
          </Typography>
          <CreateButton
            onClick={onCreateNewTree}
            startIcon={<AddIcon />}
            variant="contained"
            disableElevation
          >
            Create New Tree
          </CreateButton>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            py: 8, 
            px: 4, 
            textAlign: "center",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            backgroundColor: "#fafafa"
          }}
        >
          <FileIcon sx={{ fontSize: 64, color: "#9e9e9e", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
            No Fault Trees Found
          </Typography>
          <Typography variant="body2" sx={{ color: "#999", mb: 3 }}>
            Create your first fault tree analysis
          </Typography>
          <CreateButton
            onClick={onCreateNewTree}
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            disableElevation
          >
            Create First Tree
          </CreateButton>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "20px", paddingTop: "80px" }}>
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 4 
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
          Fault Tree Analysis Trees
        </Typography>
        <CreateButton
          onClick={onCreateNewTree}
          startIcon={<AddIcon />}
          variant="contained"
          disableElevation
        >
          Create New Tree
        </CreateButton>
      </Box>

      <StyledTableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="fault trees table">
          <StyledTableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Tree Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Calc Type</TableCell>
              <TableCell>Mission Time</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {trees.map((tree, index) => (
              <TableRow 
                key={tree.id || tree._id || index}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: '#f8f9fa' 
                  } 
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {tree.treeStructure?.name || "Unnamed Tree"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {tree.treeStructure?.description || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {tree.treeStructure?.calcTypes || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {tree.treeStructure?.missionTime
                      ? `${tree.treeStructure.missionTime} hours`
                      : "-"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="View Tree">
                      <ActionButton
                        color="primary"
                        size="small"
                        onClick={() => onViewTree(tree)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit Tree">
                      <ActionButton
                        color="warning"
                        size="small"
                        onClick={() => onViewTree(tree)}
                      >
                        <EditIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Tree">
                      <ActionButton
                        color="error"
                        size="small"
                        onClick={(e) => handleDeleteClick(tree, e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Box>
  );
};

export default FTAtable;