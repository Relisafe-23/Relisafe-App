// SubRBDModal.jsx - Updated Version
import React, { useState, useEffect } from "react";
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
  totalReliability = 0,
  totalUnavailability = 0,
}) => {
  const [selectedRbd, setSelectedRbd] = useState(rbdData || null);
  const [selectedRbdMetrics, setSelectedRbdMetrics] = useState({
    reliability: null,
    unavailability: null,
    loading: false,
  });

  console.log(targetId, "targetId from Sub rbd");
  console.log(totalReliability, "totalReliability from Sub rbd");
  console.log(totalUnavailability, "totalUnavailability from Sub rbd");

  // Fetch metrics when a new RBD is selected
  useEffect(() => {
    const fetchRBDMetrics = async () => {
      if (!selectedRbd || !selectedRbd.id) {
        setSelectedRbdMetrics({
          reliability: null,
          unavailability: null,
          loading: false,
        });
        return;
      }

      setSelectedRbdMetrics((prev) => ({ ...prev, loading: true }));

      try {
        // Fetch the RBD structure to calculate its reliability
        const response = await Api.get(
          `/api/v1/elementParametersRBD/getRBD/${selectedRbd.id}/${selectedRbd.projectId}`,
        );
        const data = response.data.data;

        // Calculate reliability recursively (same logic as in table)
        const computeReliability = (item) => {
          if (
            item.arrangement === "horizontal" &&
            item.branches &&
            item.branches.length > 0
          ) {
            return computeParallelSectionReliability(item.branches);
          }
          const reliability = Number(item.reliability);
          return isNaN(reliability) ? 1 : reliability;
        };

        const computeParallelSectionReliability = (branches) => {
          if (!branches || branches.length === 0) return 1;
          const branchReliabilities = branches.map((branch) =>
            computeBranchReliability(branch),
          );
          const productOfUnavailabilities = branchReliabilities.reduce(
            (acc, r) => acc * (1 - r),
            1,
          );
          return 1 - productOfUnavailabilities;
        };

        const computeBranchReliability = (branch) => {
          if (!branch.blocks || branch.blocks.length === 0) return 1;
          const blockReliabilities = branch.blocks.map((block) => {
            if (
              block.arrangement === "horizontal" &&
              block.branches &&
              block.branches.length > 0
            ) {
              return computeParallelSectionReliability(block.branches);
            }
            const reliability = Number(block.reliability);
            return isNaN(reliability) ? 1 : reliability;
          });
          return blockReliabilities.reduce((acc, r) => acc * r, 1);
        };

        const topLevelReliabilities = data.map((item) =>
          computeReliability(item),
        );
        const reliability = topLevelReliabilities.reduce(
          (acc, r) => acc * r,
          1,
        );
        const unavailability = 1 - reliability;

        setSelectedRbdMetrics({
          reliability: reliability,
          unavailability: unavailability,
          loading: false,
        });
      } catch (error) {
        console.error(
          `Error fetching metrics for RBD ${selectedRbd.id}:`,
          error,
        );
        setSelectedRbdMetrics({
          reliability: null,
          unavailability: null,
          loading: false,
        });
      }
    };

    fetchRBDMetrics();
  }, [selectedRbd]);

  const handleConfirm = () => {
    if (!selectedRbd) {
      alert("Please select an RBD");
      return;
     
    }

    if (onConfirm) {
         const enrichedRbd = {
      ...selectedRbd,
      reliability: selectedRbdMetrics.reliability ?? selectedRbd.reliability ?? 0,
      unavailability: selectedRbdMetrics.unavailability ?? selectedRbd.unavailability ?? 0,
    };
         onConfirm(enrichedRbd, mode, blockId, nodeIndex);
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
        {/* <div
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
        </div> */}

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
                  {selectedRbdMetrics.loading && (
                    <span
                      style={{
                        marginLeft: "10px",
                        fontSize: "11px",
                        color: "#666",
                      }}
                    >
                      (Loading...)
                    </span>
                  )}
                </div>
                <div style={{ marginLeft: "10px" }}>
                  <div style={{ marginBottom: "5px" }}>
                    <span style={{ fontWeight: "bold", color: "#4CAF50" }}>
                       Reliability:
                    </span>{" "}
                    <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {selectedRbdMetrics.reliability !== null
                        ? formatValue(selectedRbdMetrics.reliability)
                        : selectedRbdMetrics.loading
                          ? "Calculating..."
                          : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold", color: "#f44336" }}>
                       Unavailability:
                    </span>{" "}
                    <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {selectedRbdMetrics.unavailability !== null
                        ? formatValue(selectedRbdMetrics.unavailability)
                        : selectedRbdMetrics.loading
                          ? "Calculating..."
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
