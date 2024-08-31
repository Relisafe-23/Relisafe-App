import React from "react";
import { Spinner } from "react-bootstrap";

function Loader() {
  return (
    <div>
      <div style={{ minHeight: "calc(100vh - 200px)" }} className="d-flex justify-content-center align-items-center">
        <Spinner animation="grow" variant="primary" />
        <span>
          <h4 style={{ paddingLeft: 20, marginBottom: 0 }}>Loading...</h4>
        </span>
      </div>
    </div>
  );
}

export default Loader;
