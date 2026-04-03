import React, { useState } from "react";
import EditRBDConfiguration from "./EditRBDConfiguration";

 const RBDConfigPage = ({ selectedComponent }) => {
  const [showEdit, setShowEdit] = useState(false);

  console.log("RBDConfigPage rendered with selectedComponent:", selectedComponent);

  return (
    <div>
      {selectedComponent === "RBD" && (
        <div>
          <button onClick={() => setShowEdit(true)}>
            Edit Configuration
          </button>
          
          {showEdit && (
            <EditRBDConfiguration onClose={() => setShowEdit(false)} />
          )}
        </div>
      )}
    </div>
  );
};

export default RBDConfigPage;
