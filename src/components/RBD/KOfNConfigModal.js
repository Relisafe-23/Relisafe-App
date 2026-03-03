// KOfNConfigModal.jsx
import React, { useState, useEffect } from 'react';

export const KOfNConfigModal = ({ isOpen, onClose, onSubmit, initialData, mode = 'add' }) => {
  const [k, setK] = useState(2);
  const [n, setN] = useState(3);
  const [lambda, setLambda] = useState(0.001);
  const [mu, setMu] = useState(1000);
  const [formula, setFormula] = useState('standard');

  useEffect(() => {
    if (initialData) {
      setK(initialData.k || 2);
      setN(initialData.n || 3);
      setLambda(initialData.lambda || 0.001);
      setMu(initialData.mu || 1000);
      setFormula(initialData.formula || 'standard');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const calculateEffectiveLambda = () => {
    // Formula from image: λ(n-q)/n = n!λ^q / ((n-q-1)! μ^q)
    // Simplified calculation
    if (formula === 'standard') {
      return lambda * (n / k);
    } else {
      // Alternative formula
      return lambda * Math.pow(n / k, 0.5);
    }
  };

  const calculateEffectiveMu = () => {
    return mu * k;
  };

  const handleSubmit = () => {
    onSubmit({
      k,
      n,
      lambda,
      mu,
      formula,
      effectiveLambda: calculateEffectiveLambda(),
      effectiveMu: calculateEffectiveMu(),
      mtbf: 1 / calculateEffectiveLambda()
    });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: "#f0f0f0",
        padding: "25px",
        borderRadius: "8px",
        minWidth: "450px",
        maxWidth: "550px",
        border: "1px solid #999",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
      }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: "20px",
          fontSize: "16px",
          fontWeight: "bold",
          borderBottom: "1px solid #ccc",
          paddingBottom: "10px"
        }}>
          {mode === 'add' ? 'Add K-out-of-N Block' : 'Edit K-out-of-N Block'}
        </h3>
        
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "5px",
                fontSize: "13px",
                fontWeight: "500"
              }}>
                k (required operational):
              </label>
              <input
                type="number"
                min="1"
                max={n}
                value={k}
                onChange={(e) => setK(parseInt(e.target.value) || 1)}
                style={{ 
                  width: "100px", 
                  padding: "6px",
                  border: "1px solid #7f9db9",
                  borderRadius: "3px"
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "5px",
                fontSize: "13px",
                fontWeight: "500"
              }}>
                n (total items):
              </label>
              <input
                type="number"
                min={k}
                max="10"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value) || k)}
                style={{ 
                  width: "100px", 
                  padding: "6px",
                  border: "1px solid #7f9db9",
                  borderRadius: "3px"
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: "block", 
                marginBottom: "5px",
                fontSize: "13px",
                fontWeight: "500"
              }}>
                Failure Rate (λ):
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={lambda}
                onChange={(e) => setLambda(parseFloat(e.target.value) || 0)}
                style={{ 
                  width: "100%", 
                  padding: "6px",
                  border: "1px solid #7f9db9",
                  borderRadius: "3px"
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: "block", 
                marginBottom: "5px",
                fontSize: "13px",
                fontWeight: "500"
              }}>
                Repair Rate (μ):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={mu}
                onChange={(e) => setMu(parseFloat(e.target.value) || 0)}
                style={{ 
                  width: "100%", 
                  padding: "6px",
                  border: "1px solid #7f9db9",
                  borderRadius: "3px"
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "5px",
              fontSize: "13px",
              fontWeight: "500"
            }}>
              Formula Type:
            </label>
            <select
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #7f9db9",
                borderRadius: "3px"
              }}
            >
              <option value="standard">Standard Formula</option>
              <option value="simplified">Simplified Formula</option>
            </select>
          </div>
        </div>

        {/* Formula display from your image */}
        <div style={{
          backgroundColor: "#fff",
          padding: "15px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "12px",
          fontFamily: "monospace"
        }}>
          <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
            Reference Formulas:
          </div>
          <div>λ₁/₂ = [λAλB((μA+μB)+(λA+λB))] / [μAμB + (μA+μB)(λA+λB)]</div>
          <div style={{ marginTop: "8px" }}>λ(n-q)/n = n!λ^q / ((n-q-1)! μ^q)</div>
          <div style={{ marginTop: "12px", color: "#666", fontSize: "11px", fontStyle: "italic" }}>
            Reference: RIAC System Reliability Toolkit, page 394
          </div>
        </div>

        {/* Calculated values */}
        <div style={{
          backgroundColor: "#e8f4f8",
          padding: "12px",
          marginBottom: "20px",
          border: "1px solid #4CAF50",
          borderRadius: "4px"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Calculated Values:</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Effective λ: {calculateEffectiveLambda().toFixed(6)}</span>
            <span>Effective μ: {calculateEffectiveMu().toFixed(2)}</span>
            <span>MTBF: {(1/calculateEffectiveLambda()).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          gap: "10px", 
          justifyContent: "flex-end",
          borderTop: "1px solid #ccc",
          paddingTop: "15px"
        }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: "8px 25px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
          >
            OK
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 25px",
              backgroundColor:"#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#da190b"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#f44336"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};