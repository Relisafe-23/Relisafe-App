// KOfNBlock.jsx
import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export const KOfNBlock = ({ id, x, y, onEdit, onDelete, blockData }) => {
  const blockWidth = 60;
  const layerHeight = 0.5;
  const k = blockData?.k || 2;
  const n = blockData?.n || 3;
  const lambda = blockData?.lambda || 0.001;
  const mu = blockData?.mu || 1000;
  const effectiveLambda = blockData?.effectiveLambda || lambda;
  const effectiveMu = blockData?.effectiveMu || mu;
  
  // Calculate positions for the layers - stacked vertically like a sandwich
  const layerSpacing = 1; // Space between layers
  const topPadding = 70; // Space for title and formulas at top
  const bottomPadding = 80; // Space for formulas at bottom
  const totalLayersHeight = n * layerHeight + (n - 1) * layerSpacing;
  const totalHeight = totalLayersHeight + topPadding + bottomPadding;
  const startY = y - totalHeight / 2;

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(e, id, blockData);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(e, id, blockData);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  return (
    <g 
      onContextMenu={handleContextMenu}
      style={{ cursor: 'context-menu' }}
    >
      {/* Main container background - light gray */}
      <rect
        x={x - 15}
        y={startY - 5}
        width={blockWidth + 30}
        height={totalHeight + 1}
        fill="#ffff"
        // stroke="#999"
        strokeWidth="1"
        rx="5"
        // filter="url(#shadow)"
      />

    

      {/* Draw the sandwich layers - stacked vertically */}
    {/* Stacked card effect like image */}
{Array.from({ length: 3 }).map((_, index) => {
  const offset = (2 - index) * 6; // controls stack depth

  return (
    <rect
      key={`stack-${index}`}
      x={x + offset}
      y={y - 40 + offset}
      width={blockWidth}
      height={80}
      fill="#8fd3d3"
      stroke="#000"
      strokeWidth="2"
      rx="2"
    />
  );
})}

      {/* Input/Output connection lines */}
      {/* <line
        x1={x - 8}
        y1={startY + topPadding}
        x2={x - 8}
        y2={startY + topPadding - 15}
        stroke="#2196F3"
        strokeWidth="2"
      />
      <line
        x1={x + blockWidth + 8}
        y1={startY + topPadding}
        x2={x + blockWidth + 8}
        y2={startY + topPadding - 15}
        stroke="#2196F3"
        strokeWidth="2"
      />
      <line
        x1={x - 8}
        y1={startY + topPadding + totalLayersHeight}
        x2={x - 8}
        y2={startY + topPadding + totalLayersHeight + 15}
        stroke="#2196F3"
        strokeWidth="2"
      /> */}
      {/* <line
        x1={x + blockWidth + 8}
        y1={startY + topPadding + totalLayersHeight}
        x2={x + blockWidth + 8}
        y2={startY + topPadding + totalLayersHeight + 15}
        stroke="#2196F3"
        strokeWidth="2"
      /> */}

      {/* Input label */}
      {/* <text x={x - 25} y={startY + topPadding - 20} fontSize="8" fill="#666">Input</text>
      <text x={x + blockWidth + 15} y={startY + topPadding - 20} fontSize="8" fill="#666">Input</text>
      
      {/* Output label */}
      {/* <text x={x - 25} y={startY + topPadding + totalLayersHeight + 25} fontSize="8" fill="#666">Output</text>
      <text x={x + blockWidth + 15} y={startY + topPadding + totalLayersHeight + 25} fontSize="8" fill="#666">Output</text> */} 

      {/* Formula section - exactly as in image */}
      {/* <g transform={`translate(${x - 10}, ${startY + totalHeight - 65})`}>
      
        <text fontSize="8" fill="#444">
          <tspan x="0" dy="0" fontWeight="bold">(1) </tspan>
          <tspan fontSize="8" fontFamily="monospace">λ₁/₂ = [λAλB((μA+μB)+(λA+λB))] / [μAμB + (μA+μB)(λA+λB)]</tspan>
        </text>
        <text x="0" y="15" fontSize="8" fill="#444">
          <tspan fontWeight="bold">μ = </tspan>
          <tspan fontFamily="monospace">(λa*μa + λb*μb)/(λa + λb)</tspan>
        </text>

        {/* Second formula */}
        {/* <text x="0" y="35" fontSize="8" fill="#444">
          <tspan fontWeight="bold">(2) </tspan>
          <tspan fontFamily="monospace">λ(n-q)/n = n!λ^q / ((n-q-1)! μ^q)</tspan>
        </text>

        {/* RIAC Reference */}
        {/* <text x="0" y="55" fontSize="7" fill="#888" fontStyle="italic">
          References (1) and (2): RIAC System Reliability Toolkit, page 394
        </text>
      </g> */} 

      {/* Effective values section */}
      {/* <g transform={`translate(${x + blockWidth - 40}, ${startY - 20})`}>
        <rect
          x="0"
          y="0"
          width="90"
          height="45"
          fill="white"
          stroke="#2196F3"
          strokeWidth="1"
          rx="3"
        />
        <text x="5" y="12" fontSize="8" fill="#333" fontWeight="bold">Effective:</text>
        <text x="5" y="24" fontSize="7" fill="#333">λ = {effectiveLambda.toExponential(2)}</text>
        <text x="5" y="36" fontSize="7" fill="#333">μ = {effectiveMu.toFixed(1)}</text>
      </g> */}

      {/* Edit/Delete icons */}
      {/* <g transform={`translate(${x + blockWidth - 30}, ${startY - 20})`}>
        <rect
          x="0"
          y="0"
          width="45"
          height="20"
          fill="white"
          stroke="#ccc"
          rx="3"
        />
        <FiEdit2 
          size={12} 
          color="#666"
          style={{ 
            cursor: 'pointer',
            position: 'absolute',
            left: '8px',
            top: '4px'
          }}
          onClick={handleEditClick}
        />
        <FiTrash2 
          size={12} 
          color="#f44336"
          style={{ 
            cursor: 'pointer',
            position: 'absolute',
            left: '28px',
            top: '4px'
          }}
          onClick={handleDeleteClick}
        />
      </g> */}

      {/* Report options - as in image */}
      {/* <g transform={`translate(${x}, ${startY + totalHeight - 5})`}>
        <text fontSize="9" fill="#333" fontWeight="bold">Report for RBD STANDARD</text>
        <text x="0" y="15" fontSize="8" fill="#333">☐ Reliability</text>
        <text x="100" y="15" fontSize="8" fill="#333">☐ Availability</text>
        <text x="200" y="15" fontSize="8" fill="#333">☐ Equivalent Lambda</text>
      </g> */}

      {/* Shadow filter definition */}
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2"/>
        </filter>
      </defs>
    </g>
  );
};

export default KOfNBlock;