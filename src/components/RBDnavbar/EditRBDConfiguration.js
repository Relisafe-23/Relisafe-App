import React, { useState } from "react";

const EditRBDConfiguration = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    missionTime: 1,
    upperLine: "Reference designator",
    lowerLine: "FR parameter1",
    printRemarks: "Yes",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log("RBD Configuration:", formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Edit RBD Configuration</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <div className="modal-body">
          <div className="row">
            <label>RBD title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <label>RBD mission time</label>
            <input
              type="number"
              name="missionTime"
              value={formData.missionTime}
              onChange={handleChange}
            />
            <span className="unit">[hours]</span>
          </div>

          <div className="row">
            <label>Display on upper line</label>
            <select
              name="upperLine"
              value={formData.upperLine}
              onChange={handleChange}
            >
              <option>Reference designator</option>
              <option>Component name</option>
            </select>
            <button className="font-btn">Upper font</button>
          </div>

          <div className="row">
            <label>Display on lower line</label>
            <select
              name="lowerLine"
              value={formData.lowerLine}
              onChange={handleChange}
            >
              <option>FR parameter1</option>
              <option>Failure rate</option>
            </select>
            <button className="font-btn">Lower font</button>
          </div>

          <div className="row">
            <label>Print remarks</label>
            <select
              name="printRemarks"
              value={formData.printRemarks}
              onChange={handleChange}
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="ok-btn" onClick={handleSubmit}>OK</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditRBDConfiguration;
