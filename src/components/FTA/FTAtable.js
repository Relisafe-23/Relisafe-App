import React from "react";
import { Table, Button } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye, FaFileAlt } from "react-icons/fa";

const FTAtable = ({ 
  trees, 
  loading, 
  onViewTree, 
  onCreateNewTree, 
  onDeleteTree,
  projectId 
}) => {
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

  if (trees ?.length === 0) {
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
              <th>#</th>
              <th>Tree Name</th>
              <th>Description</th>
              <th>Calc Type</th>
              <th>Mission Time</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trees ?.map((tree, index) => (
              <tr key={tree.id}>
                <td>{index + 1}</td>
                <td>
                  <strong>{tree.name || 'Unnamed Tree'}</strong>
                </td>
                <td>{tree.description || '-'}</td>
                <td>{tree.calcTypes || '-'}</td>
                <td>{tree.missionTime ? `${tree.missionTime} hours` : '-'}</td>
                <td>
                  {tree.createdAt ? new Date(tree.createdAt).toLocaleDateString() : '-'}
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
                      onClick={() => onDeleteTree(tree.id)}
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