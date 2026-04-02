import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import Api from "../../Api";

const SubRBDModal = ({ 
  show, 
  onHide, 
  rbdData,
  mode = 'add',
  blockId = null,
  nodeIndex = null,
  onConfirm,
  rbdList = []
}) => {
  const [selectedRbd, setSelectedRbd] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

 useEffect(() => {
    if (rbdData) {
      setSelectedRbd(rbdData);
    } else {
      setSelectedRbd(null);
    }
  }, [rbdData]);

  // Reset when modal closes
  useEffect(() => {
    if (!show) {
      setSelectedRbd(null);
    }
  }, [show]);

  const handleConfirm = async () => {
    if (!selectedRbd) {
      alert("Please select an RBD");
      return;
    }
    
    setIsLoading(true);
    try {
      if (onConfirm) {
        await onConfirm(selectedRbd, mode, blockId, nodeIndex);
      }
    } catch (error) {
      console.error('Error in handleConfirm:', error);
    } finally {
      setIsLoading(false);
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
            disabled={mode === 'edit'}
          >
            <option value="">-- Select an RBD --</option>
            {rbdList && rbdList.length > 0 ? (
              rbdList.map((rbd) => (
                <option key={rbd.id || rbd._id} value={JSON.stringify(rbd)}>
                  {rbd.rbdTitle || `RBD ${rbd.id || rbd._id}`} - {rbd.description || "No description"}
                </option>
              ))
            ) : (
              <option disabled>No RBDs available</option>
            )}
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
              <div><strong>Selected RBD:</strong> {selectedRbd.rbdTitle || `RBD ${selectedRbd.id || selectedRbd._id}`}</div>
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
            disabled={isLoading}
            style={{
              padding: "6px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "13px",
              minWidth: "70px",
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#007bff")}
          >
            {isLoading ? 'Processing...' : (mode === 'edit' ? 'Update' : 'OK')}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            style={{
              padding: "6px 20px",
              backgroundColor: "#e1e1e1",
              color: "#333",
              border: "1px solid #999",
              borderRadius: "3px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "13px",
              minWidth: "70px",
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#d1d1d1")}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#e1e1e1")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubRBDModal;