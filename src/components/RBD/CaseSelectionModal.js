import React, { useState, useEffect } from "react";
import { KOfNConfigModal } from "./KOfNConfigModal";

const CaseSelectionModal = ({
  isOpen,
  handleClose,
  onSelect,
  mode = "add",
  existingData = null,
}) => {
  const [selected, setSelected] = useState(null);
  const [kOfNModal, setKOfNModal] = useState({
    open: false,
    blockId: null,
    initialData: existingData,
    mode: mode,
    nodeIndex: null,
    selectedCase: null,
    selectedLabel: null,
  });

  const options = [
    { id: "case3", label: "Identical" },
    { id: "case4", label: "Non-Identical" },
    { id: "case5", label: "Identical (Load Sharing)" },
  ];

  // Auto-open the config modal when editing with existing data
  useEffect(() => {
    if (mode === "edit" && existingData && existingData.kOfNType && !kOfNModal.open) {
      let selectedId = "case3";
      let selectedLabel = "Identical";
      
      if (existingData.kOfNType === "Non-Identical") {
        selectedId = "case4";
        selectedLabel = "Non-Identical";
      } else if (existingData.kOfNType === "Identical (Load Sharing)") {
        selectedId = "case5";
        selectedLabel = "Identical (Load Sharing)";
      }
      
      setSelected(selectedId);
      
      // Auto-open the KOfNConfigModal
      setKOfNModal({
        open: true,
        initialData: existingData,
        mode: mode,
        selectedCase: selectedId,
        selectedLabel: selectedLabel,
      });
    }
  }, [mode, existingData, isOpen]);

  const handleCaseSelect = (item) => {
    setSelected(item.id);
    setKOfNModal((prev) => ({
      ...prev,
      open: true,
      selectedCase: item.id,
      selectedLabel: item.label,
    }));
  };

  const handleKOfNSubmit = (data) => {
    console.log("Received from KOfNConfigModal:", data);

    if (onSelect && typeof onSelect === "function") {
      onSelect(data);
    }

    setKOfNModal((prev) => ({
      ...prev,
      open: false,
    }));
    handleClose();
  };

  const handleKOfNClose = () => {
    setKOfNModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  if (!isOpen) return null;

  // For edit mode, skip showing the case selection and go directly to config modal
  if (mode === "edit" && existingData && kOfNModal.open) {
    return (
      <KOfNConfigModal
        isOpen={kOfNModal.open}
        selectedCase={kOfNModal.selectedCase}
        selectedLabel={kOfNModal.selectedLabel}
        onClose={handleKOfNClose}
        onSubmit={handleKOfNSubmit}
        mode={kOfNModal.mode}
        initialData={kOfNModal.initialData}
      />
    );
  }

  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h3
            style={{
              marginBottom: "15px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Select K-out-of-N Case
          </h3>

          {options.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCaseSelect(item)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f0f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              style={{
                ...styles.option,
                backgroundColor: selected === item.id ? "#d0e6ff" : "#f5f5f5",
                border:
                  selected === item.id ? "2px solid #3399ff" : "1px solid #ddd",
              }}
            >
              {item.label}
            </div>
          ))}

          <button onClick={handleClose} style={styles.closeBtn}>
            Close
          </button>
        </div>
      </div>

      <KOfNConfigModal
        isOpen={kOfNModal.open}
        selectedCase={kOfNModal.selectedCase}
        selectedLabel={kOfNModal.selectedLabel}
        onClose={handleKOfNClose}
        onSubmit={handleKOfNSubmit}
        mode={kOfNModal.mode}
        initialData={kOfNModal.initialData}
      />
    </>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "320px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  option: {
    padding: "12px",
    marginBottom: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "14px",
  },
  closeBtn: {
    marginTop: "15px",
    padding: "8px 16px",
    background: "#666",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    width: "100%",
    fontSize: "14px",
  },
};

export default CaseSelectionModal;