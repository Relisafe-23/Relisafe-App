
import React, { useState, useEffect } from "react";
import Api from "../../Api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const EditRBDConfigurationModal = ({ isOpen, onClose, onSave, editData, modelItem, setIsModalOpen,setModelItem, getRbdConfig }) => {

  const { id } = useParams();
  const projectId = id;

  // console.log(modelItem, 'modelItem')

  const initialState = {
    rbdTitle: "",
    missionTime: '',
    description: "",
    id: null,
  };

  const resetForm = () => {
    setValues(initialState);
    // setModelItem(null);
    setErrors({});
  };
  const [values, setValues] = useState(initialState);

  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (isOpen && modelItem) {
      setValues({
        rbdTitle: modelItem.rbdTitle || "",
        missionTime: modelItem.missionTime || '',
        description: modelItem.description || "",
        id: modelItem.id || null
      });
    }
  }, [isOpen, modelItem]);


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

  // useEffect(() => {
  //   if (isOpen) {
  //     setValues(initialState);
  //     setErrors({});
  //   }
  // }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    let data = {
      id : values.id,
      projectId: projectId,
      rbdTitle: values.rbdTitle,
      missionTime: values.missionTime,
      description: values.description,
    }

    console.log(values.id)

    values.id ? (
      Api.patch("/api/v1/EditConfigRBD/edit", data)
        .then((res) => {
          onSave(res.data);
          resetForm();
          setIsModalOpen(false);
          getRbdConfig();
          setModelItem(null);
          toast.success("Updated RBD")
        })
        .catch((error) => {
          console.error("Error saving config:", error);
        })
    ) : (
      Api.post("/api/v1/EditConfigRBD/create", {
        projectId: projectId,
        rbdTitle: values.rbdTitle,
        missionTime: values.missionTime,
        description: values.description,
      })
        .then((res) => {
          onSave(res.data);
          getRbdConfig();
          toast.success("Created RBD")
          resetForm();
          setModelItem(null);
          setIsModalOpen(false)
        })
        .catch((error) => {
          console.error("Error saving config:", error);
        })
    )
  };


  if (!isOpen) return null;

  return (
    <div
      style={overlayStyle}
      onClick={() => {
        resetForm();
        onClose();
      }}
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        <div style={headerStyle}>
          <span>Edit RBD Configuration</span>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            style={closeBtnStyle}
          >
            ✕
          </button>
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

          {/* <div style={rowStyle}>
            <label style={labelStyle}>Print Remarks:</label>
            <select
              value={values.printRemarks}
              onChange={(e) => handleChange("printRemarks", e.target.value)}
              style={inputStyle}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div> */}
          <div style={rowStyle}>
            <label style={labelStyle}>Description:</label>
            <input
              type="text"
              value={values.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              style={inputStyle}
            />
          </div>

          {/* Buttons */}
          <div style={footerStyle}>
            <button type="submit" style={okBtnStyle}>
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
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