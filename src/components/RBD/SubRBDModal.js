// SubRBDModal.jsx
import React from "react";
import { toast } from "react-toastify";
import Api from "../../Api";

const SubRBDModal = ({
  show,
  onHide,
  rbdData,
  targetId,
  mode = "add",
  blockId = null,
  nodeIndex = null,
  onConfirm,
  rbdList = [],
  totalReliability = 0, // Add this prop
  totalUnavailability = 0, // Add this prop
}) => {
  const [selectedRbd, setSelectedRbd] = React.useState(rbdData || null);

  console.log(targetId, "targetId from Sub rbd");
  console.log(totalReliability, "totalReliability from Sub rbd");
  console.log(totalUnavailability, "totalUnavailability from Sub rbd");

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

  // Helper function to format values
  const formatValue = (value) => {
    if (value === undefined || value === null) return "N/A";
    if (typeof value === "number") {
      return value.toFixed(9);
    }
    return value;
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "450px",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "1px solid #999",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          {mode === "edit" ? "Edit SubRBD" : "Select RBD for SubRBD"}
        </h3>

        {/* Display Current System Totals */}
        <div
          style={{
            backgroundColor: "#e8f4f8",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "4px",
            border: "1px solid #4CAF50",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
              fontSize: "13px",
            }}
          >
            Current System Metrics:
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <div>
              <span style={{ fontWeight: "bold", color: "#4CAF50" }}>
                ✓ Reliability:
              </span>{" "}
              <span style={{ fontFamily: "monospace" }}>
                {formatValue(totalReliability)}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "bold", color: "#f44336" }}>
                ✗ Unavailability:
              </span>{" "}
              <span style={{ fontFamily: "monospace" }}>
                {formatValue(totalUnavailability)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Available RBDs:
          </label>
          <select
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "12px",
              marginBottom: "15px",
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
            {rbdList && rbdList.length > 0 ? (
              rbdList.map((rbd) => (
                <option key={rbd.id || rbd._id} value={JSON.stringify(rbd)}>
                  {rbd.rbdTitle || `RBD ${rbd.id || rbd._id}`} -{" "}
                  {rbd.description || "No description"}
                </option>
              ))
            ) : (
              <option disabled>No RBDs available</option>
            )}
          </select>

          {selectedRbd && (
            <div
              style={{
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "4px",
                fontSize: "12px",
                border: "1px solid #ddd",
                marginTop: "10px",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <strong>Selected RBD:</strong>{" "}
                {selectedRbd.rbdTitle ||
                  `RBD ${selectedRbd.id || selectedRbd._id}`}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Description:</strong>{" "}
                {selectedRbd.description || "No description"}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Mission Time:</strong>{" "}
                {selectedRbd.missionTime || "N/A"} hours
              </div>

              {/* Selected RBD Metrics */}
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "2px solid #4CAF50",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    color: "#333",
                  }}
                >
                  Selected RBD Metrics:
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <div style={{ marginBottom: "5px" }}>
                    <span style={{ fontWeight: "bold", color: "#4CAF50" }}>
                      ✓ Reliability:
                    </span>{" "}
                    <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {selectedRbd.reliability !== undefined &&
                      selectedRbd.reliability !== null
                        ? formatValue(selectedRbd.reliability)
                        : selectedRbd.systemReliability !== undefined &&
                            selectedRbd.systemReliability !== null
                          ? formatValue(selectedRbd.systemReliability)
                          : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold", color: "#f44336" }}>
                      ✗ Unavailability:
                    </span>{" "}
                    <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {selectedRbd.unavailability !== undefined &&
                      selectedRbd.unavailability !== null
                        ? formatValue(selectedRbd.unavailability)
                        : selectedRbd.systemUnavailability !== undefined &&
                            selectedRbd.systemUnavailability !== null
                          ? formatValue(selectedRbd.systemUnavailability)
                          : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
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
              minWidth: "70px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#0056b3")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#007bff")
            }
          >
            {mode === "edit" ? "Update" : "OK"}
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
              minWidth: "70px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#d1d1d1")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#e1e1e1")
            }
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubRBDModal;
