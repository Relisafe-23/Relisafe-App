// CaseSelectionModal.jsx
import React, { useState, useEffect } from "react";
import { KOfNConfigModal } from "./KOfNConfigModal";

const CaseSelectionModal = ({ isOpen,parentItemId, handleClose, targetId, onSelect, mode = 'add', existingData = null }) => {

  console.log(targetId,'targetId from caseselection')
  const [selected, setSelected] = useState(null);
  const [kOfNModal, setKOfNModal] = useState({
    open: false, 
    blockId: null,
    initialData: existingData,
    mode: mode,
    nodeIndex: null,
    selectedCase: null,
    selectedLabel: null
  });
  const [selectedCase, setSelectedCase] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCase(null);
      setShowConfigModal(false);
      setSelectedLabel("");
      
      // If in edit mode and we have existing data, pre-select the case
      if (mode === "edit" && existingData) {
        const existingType = existingData.kOfNType || existingData.selectedLabel;
        if (existingType === "Non-Identical") {
          setSelectedCase("case4");
          setSelectedLabel("Non-Identical");
          // Auto-open config modal for edit
          setShowConfigModal(true);
        } else if (existingType === "Identical (Load Sharing)") {
          setSelectedCase("case5");
          setSelectedLabel("Identical (Load Sharing)");
          setShowConfigModal(true);
        } else {
          setSelectedCase("case3");
          setSelectedLabel("Identical");
          setShowConfigModal(true);
        }
      }
    }
  }, [isOpen, mode, existingData]);

  const cases = [
    {
      id: "case3",
      title: "Identical",
      description: "All components are identical with same failure rate and MTTR",
      label: "Identical"
    },
    {
      id: "case4",
      title: "Non-Identical",
      description: "Components have different failure rates and MTTR values",
      label: "Non-Identical"
    },
    {
      id: "case5",
      title: "Identical (Load Sharing)",
      description: "Components share load when some fail, increasing failure rate",
      label: "Identical (Load Sharing)"
    }
  ];

  const handleCaseSelect = (caseItem) => {
    setSelectedCase(caseItem.id);
    setSelectedLabel(caseItem.label);
    setShowConfigModal(true);
  };

  const handleConfigSubmit = (data) => {
    // Pass the mode, blockId, and existing data info to the parent
    onSelect(data, mode, existingData?.id || existingData?._id);
    setShowConfigModal(false);
    handleClose();
  };

  const handleConfigClose = () => {
    setShowConfigModal(false);
    if (mode !== "edit") {
      handleClose();
    }
  };

  if (!isOpen) return null;

  if (showConfigModal) {
    return (
      <KOfNConfigModal
        isOpen={showConfigModal}
        onClose={handleConfigClose}
          targetId={targetId}
        onSubmit={handleConfigSubmit}
        initialData={existingData}
        mode={mode}
        parentItemId={parentItemId}
        selectedLabel={selectedLabel}
        selectedCase={selectedCase}
      />
    );
  }

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
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "24px",
          width: "500px",
          maxWidth: "90%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px", fontWeight: "bold" }}>
          {mode === "edit" ? "Edit K-out-of-N Configuration" : "Select K-out-of-N Configuration"}
        </h2>
        <p style={{ marginBottom: "24px", color: "#666", fontSize: "14px" }}>
          Choose the type of K-out-of-N configuration you want to {mode === "edit" ? "edit" : "create"}:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => handleCaseSelect(caseItem)}
              style={{
                border: selectedCase === caseItem.id ? "2px solid #0078d4" : "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                cursor: "pointer",
                backgroundColor: selectedCase === caseItem.id ? "#f0f7ff" : "#fff",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0078d4";
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                if (selectedCase !== caseItem.id) {
                  e.currentTarget.style.borderColor = "#ddd";
                  e.currentTarget.style.backgroundColor = "#fff";
                }
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>
                {caseItem.title}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
                {caseItem.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            onClick={handleClose}
            style={{
              padding: "8px 20px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseSelectionModal;