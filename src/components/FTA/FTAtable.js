// In FTAtable.js, replace with this complete component:

import React from "react";
import { Table, Button } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye, FaFileAlt } from "react-icons/fa";
import { useModal } from "../ModalContext";
import { toast } from "react-toastify";

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
      <div style={{ padding: "20px", paddingTop: "80px", textAlign: "center" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading trees...</p>
      </div>
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
      <div style={{ padding: "20px", paddingTop: "80px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Fault Tree Analysis Trees</h3>
          <Button
            onClick={onCreateNewTree}
            style={{
              backgroundColor: "#00a9c9",
              border: "0px",
              color: "#fff",
              height: "35px",
              width: "150px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            + Create New Tree
          </Button>
        </div>

        <div className="text-center py-5 border rounded bg-light">
          <FaFileAlt size={48} className="text-muted mb-3" />
          <h5>No Fault Trees Found</h5>
          <p className="text-muted">Create your first fault tree analysis</p>
          <Button
            onClick={onCreateNewTree}
            style={{
              backgroundColor: "#00a9c9",
              border: "0px",
              color: "#fff",
            }}
          >
            Create First Tree
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", paddingTop: "80px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Fault Tree Analysis Trees</h3>
        <Button
          onClick={onCreateNewTree}
          style={{
            backgroundColor: "#00a9c9",
            border: "0px",
            color: "#fff",
            height: "35px",
            width: "150px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          + Create New Tree
        </Button>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Tree Name</th>
              <th>Description</th>
              <th>Calc Type</th>
              <th>Mission Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trees.map((tree, index) => (
              <tr key={tree.id || tree._id || index}>
                <td>{index + 1}</td>
                <td>
                  <strong>{tree.treeStructure?.name || "Unnamed Tree"}</strong>
                </td>
                <td>{tree.treeStructure?.description || "-"}</td>
                <td>{tree.treeStructure?.calcTypes || "-"}</td>
                <td>
                  {tree.treeStructure?.missionTime
                    ? `${tree.treeStructure.missionTime} hours`
                    : "-"}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onViewTree(tree)}
                      title="View Tree"
                    >
                      <FaEye />
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => onViewTree(tree)}
                      title="Edit Tree"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => handleDeleteClick(tree, e)}
                      title="Delete Tree"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default FTAtable;