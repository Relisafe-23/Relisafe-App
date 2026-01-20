import React, { Component } from "react";

export default class Dashboard extends Component {
  render() {
    return (
      <div>
        <div style={{
          // border:'1px solid black',
          height: '100vh',
          display: 'flex',
          flexDirection:'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2>401</h2>
          <h3>You're not authorized to this page</h3>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>

      </div>
    )
  }
}
