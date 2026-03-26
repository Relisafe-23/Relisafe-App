import React, { useState } from "react";
import {KOfNConfigModal} from "./KOfNConfigModal"
const CaseSelectionModal = ({ isOpen, handleClose, onSelect }) => {
  const [selected, setSelected] = useState(null);


  const [kOfNModal, setKOfNModal] = useState({
    open: false, 
    blockId: null,
    initialData: null,
    mode: 'add',
    nodeIndex: null
  });
    if (!isOpen) return null;
  const options = [
    { id: "case3", label: "Identical" },
    { id: "case4", label: "Non-Identical" },
    { id: "case5", label: "Identical (Load Sharing)" }
  ];
const handleCaseSelect = (item) => {
  // if (item.label === "Identical") {
    setKOfNModal(prev => ({
      ...prev,
      open: true,
      selectedCase: item.id,
      selectedLabel:item.label
    }));
  // }
};
// const handleCaseSelect = (item) => {
//   setSelected(item.id);
//   handleClose();
//   setTimeout(() => {
//     setKOfNModal(prev => ({
//       ...prev,
//       open: true,
//       selectedCase: item.id
//     }));
//   }, 0); // small delay ensures proper render
// };
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Select Case</h3>

        {options.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelected(item.id);   
              handleCaseSelect(item); 
              
            }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            style={{
              ...styles.option,
              backgroundColor: selected === item.id ? "#d0e6ff" : "#f5f5f5",
              border: selected === item.id ? "2px solid #3399ff" : "none"
            }}
          >
            {item.label}
          </div>
        ))}

        <button onClick={handleClose} style={styles.closeBtn}>
          Close
        </button>
        <KOfNConfigModal
  isOpen={kOfNModal.open}
  selectedCase={kOfNModal.selectedCase}
  selectedLabel={kOfNModal.selectedLabel}
  onClose={()=>
    setKOfNModal(prev=>({
        ...prev,
        open:false

    })
)
  }
    
/>
     
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "300px"
  },
  option: {
    padding: "10px",
    marginBottom: "8px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  closeBtn: {
    marginTop: "10px",
    padding: "8px",
    background: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default CaseSelectionModal;