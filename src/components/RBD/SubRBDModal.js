import { Modal, Button } from "react-bootstrap";
import { useParams, useLocation } from 'react-router-dom';
import { calculateRBD } from "./RBDStructure";
import Api from "../../Api";
import React, { useState, useEffect } from 'react';
// In SubRBDModal.js, update the component to receive and use callbacks:

const SubRBDModal = ({ 
  show, 
  onHide, 
  rbdData,
  mode = 'add',
  blockId = null,
  nodeIndex = null,
  onConfirm  // New callback prop
}) => {
        const { id } = useParams();
  const [rbdList, setRbdList] = useState([]);
  const [selectedRbd, setSelectedRbd] = useState(rbdData || null);
  const [projectId] = useState(() => {
    return id;
  });

  // Fetch RBD list for SubRBD selection
  useEffect(() => {
    if (projectId && show) {
      Api.get("/api/v1/EditConfigRBD/", {
        params: {
          projectId: projectId,
        }
      })
        .then((res) => {
          setRbdList(res.data.data || []);
        })
        .catch((error) => {
          console.error("Error fetching RBD list:", error);
        });
    }
  }, [projectId, show]);

  const handleConfirm = () => {
    if (!selectedRbd) {
      alert("Please select an RBD");
      return;
    }
    
    if (onConfirm) {
      onConfirm(selectedRbd, mode, blockId, nodeIndex);
    }
  };

  const handleCancel = () => {
    if (onHide) {
      onHide();
    }
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: "#f0f0f0",
        padding: "20px",
        borderRadius: "8px",
        minWidth: "450px",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        border: "1px solid #999"
      }}>
        <h3 style={{
          marginTop: 0,
          marginBottom: "20px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#333"
        }}>
          {mode === 'edit' ? 'Edit SubRBD' : 'Select RBD for SubRBD'}
        </h3>

        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            color: "#333"
          }}>
            Available RBDs:
          </label>
          <select
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "12px",
              marginBottom: "15px"
            }}
            value={selectedRbd ? JSON.stringify(selectedRbd) : ""}
            onChange={(e) => {
              if (e.target.value) {
                const selected = JSON.parse(e.target.value);
                setSelectedRbd(selected);
              } else {
                setSelectedRbd(null);
              }
            }}
          >
            <option value="">-- Select an RBD --</option>
            {rbdList && rbdList.map((rbd) => (
              <option key={rbd.id} value={JSON.stringify(rbd)}>
                {rbd.rbdTitle || `RBD ${rbd.id}`} - {rbd.description || "No description"}
              </option>
            ))}
          </select>

          {selectedRbd && (
            <div style={{
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              marginTop: "10px"
            }}>
              <div><strong>Selected RBD:</strong> {selectedRbd.rbdTitle || `RBD ${selectedRbd.id}`}</div>
              <div><strong>Description:</strong> {selectedRbd.description || "No description"}</div>
              <div><strong>Mission Time:</strong> {selectedRbd.missionTime || "N/A"} hours</div>
              <div><strong>Reliability:</strong> {selectedRbd.reliability || "N/A"}</div>
              <div><strong>Unavailability:</strong> {selectedRbd.unavailability ? `${selectedRbd.unavailability}%` : "N/A"}</div>
            </div>
          )}
        </div>

        <div style={{
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          marginTop: "20px"
        }}>
          <button
            onClick={handleConfirm}
            style={{
              padding: "6px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
              minWidth: "70px"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
          >
            {mode === 'edit' ? 'Update' : 'OK'}
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: "6px 20px",
              backgroundColor: "#e1e1e1",
              color: "#333",
              border: "1px solid #999",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
              minWidth: "70px"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d1d1d1"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e1e1e1"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubRBDModal;
