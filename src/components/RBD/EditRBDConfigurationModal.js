
 import React, { useState, useEffect } from "react";
import Api from "../../Api";
import { useParams } from "react-router-dom";

const EditRBDConfigurationModal = ({ isOpen, onClose, onSave }) => {

  const { id } = useParams();
  const projectId = id;

  const initialState = {
    rbdTitle: "",
    missionTime: 1,
    displayUpper: "Reference designator",
    displayLower: "FR parameter1",
    printRemarks: "Yes",
  };
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState(initialState);

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  };

  const modalStyle = {
    width: "500px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
  };

  const headerStyle = {
    backgroundColor: "#2b4f81",
    color: "white",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "bold"
  };

  const closeBtnStyle = {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
    transition: "background-color 0.2s"
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    gap: "10px"
  };

  const labelStyle = {
    width: "160px",
    fontSize: "14px"
  };

  const inputStyle = {
    flex: 1,
    padding: "5px",
    border: "1px solid #ccc",
    borderRadius: "3px"
  };

  const smallBtnStyle = {
    padding: "5px 8px",
    fontSize: "12px",
    cursor: "pointer"
  };

  const footerStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px"
  };

  const okBtnStyle = {
    padding: "6px 14px",
    backgroundColor: "#4CAF50",
    border: "none",
    color: "white",
    borderRadius: "3px",
    cursor: "pointer"
  };

  const cancelBtnStyle = {
    padding: "6px 14px",
    backgroundColor: "#ccc",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer"
  };

  useEffect(() => {
    if (isOpen) {
      setValues(initialState);
      setErrors({});
    }
  }, [isOpen]);

  // Handle field change
  const handleChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validation
  const validate = () => {
    let tempErrors = {};

    if (!values.rbdTitle.trim()) {
      tempErrors.rbdTitle = "RBD Title is required";
    }

    if (!values.missionTime || values.missionTime <= 0) {
      tempErrors.missionTime = "Mission time must be greater than 0";
    }

    setErrors(tempErrors);

    return Object.keys(tempErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    Api.post("/api/v1/EditConfigRBD/create", {
      projectId: projectId,
    rbdTitle: values.rbdTitle,
    missionTime: values.missionTime,
    displayUpper: values.displayUpper,
    displayLower: values.displayLower,
    printRemarks: values.printRemarks,
    })
      .then((res) => {
        onSave(res.data);
     
      })
      .catch((error) => {
        console.error("Error saving config:", error);
      });
  };


  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        <div style={headerStyle}>
          <span>Edit RBD Configuration</span>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>

          {/* RBD Title */}
          <div style={rowStyle}>
            <label style={labelStyle}>RBD title:</label>
            <input
              type="text"
              value={values.rbdTitle}
              onChange={(e) => handleChange("rbdTitle", e.target.value)}
              style={inputStyle}
            />
          </div>
          {errors.rbdTitle && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.rbdTitle}
            </p>
          )}

          {/* Mission Time */}
          <div style={rowStyle}>
            <label style={labelStyle}>Mission time:</label>
            <input
              type="number"
              value={values.missionTime}
              onChange={(e) =>
                handleChange("missionTime", parseFloat(e.target.value))
              }
              style={{ ...inputStyle, width: "100px" }}
            />
          </div>
          {errors.missionTime && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.missionTime}
            </p>
          )}

          {/* Display Upper */}
          <div style={rowStyle}>
            <label style={labelStyle}>Display Upper:</label>
            <select
              value={values.displayUpper}
              onChange={(e) => handleChange("displayUpper", e.target.value)}
              style={inputStyle}
            >
              <option value="Reference designator">Reference designator</option>
              <option value="Part number">Part number</option>
              <option value="Product name">Product name</option>
            </select>
          </div>

          {/* Display Lower */}
          <div style={rowStyle}>
            <label style={labelStyle}>Display Lower:</label>
            <select
              value={values.displayLower}
              onChange={(e) => handleChange("displayLower", e.target.value)}
              style={inputStyle}
            >
              <option value="FR parameter1">FR parameter1</option>
              <option value="MTBF">MTBF</option>
              <option value="None">None</option>
            </select>
          </div>

          {/* Print Remarks */}
          <div style={rowStyle}>
            <label style={labelStyle}>Print Remarks:</label>
            <select
              value={values.printRemarks}
              onChange={(e) => handleChange("printRemarks", e.target.value)}
              style={inputStyle}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Buttons */}
          <div style={footerStyle}>
            <button type="submit" style={okBtnStyle}>
              OK
            </button>
            <button
              type="button"
              onClick={onClose}
              style={cancelBtnStyle}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditRBDConfigurationModal;