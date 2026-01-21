import React, { useEffect } from "react";
import { Redirect, useHistory } from "react-router-dom";

const Dashboard = () => {
  const sessionId = localStorage.getItem("sessionId");
  const role = localStorage.getItem("role");

  const history = useHistory();
  

  useEffect(() => {
    if (role === "admin" || role === "Employee" && sessionId) {
      history.push("/project/list");
    }

    if (role === "SuperAdmin" && sessionId){
      history.push("/company");
    }
  }, [role, sessionId, history]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2>401</h2>
      <h3>You're not authorized to this page</h3>

      <button
        onClick={() => window.history.back()}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Go Back
      </button>
    </div>
  );
};

export default Dashboard;
