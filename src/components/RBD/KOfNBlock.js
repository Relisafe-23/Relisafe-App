// KOfNBlock.jsx
import React from "react";

export const KOfNBlock = ({ id, x, y, onEdit, onDelete, blockData }) => {
  const blockWidth = 70;
  const layerHeight = 0.5;

  // Get values from blockData
  const k = blockData?.k || blockData?.data?.k || 2;
  const n = blockData?.n || blockData?.data?.n || 3;
  const lambda = blockData?.lambda || blockData?.data?.lambda || 0.001;
  const mu = blockData?.mu || blockData?.data?.mu || 1000;
  const reliability =
    blockData?.reliability || blockData?.data?.reliability || 0;
  const unavailability =
    blockData?.unavailability || blockData?.data?.unavailability || 0;
  const kOfNType =
    blockData?.kOfNType || blockData?.data?.kOfNType || "Identical";
  const load = blockData?.load || blockData?.data?.load || 100;
  const effectiveLambda = blockData?.effectiveLambda || lambda;
  const effectiveMu = blockData?.effectiveMu || mu;

  const layerSpacing = 1;
  const topPadding = 70;
  const bottomPadding = 80;
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

  // Format values for display
  const formatReliability = () => {
    if (reliability === 0) return "0.0000";
    return reliability.toFixed(6);
  };

  const formatUnavailability = () => {
    if (unavailability === 0) return "0.0000";
    return unavailability.toFixed(6);
  };

  // Get heading based on type
  const getHeading = () => {
    switch (kOfNType) {
      case "Identical":
        return "Identical";
      case "Non-Identical":
        return "Non-Identical";
      case "Identical (Load Sharing)":
        return "Load Sharing";
      default:
        return "K-out-of-N";
    }
  };

  return (
    <g
      onContextMenu={handleContextMenu}
      onClick={() => onEdit?.(null, id, blockData)}
      style={{ cursor: "pointer" }}
    >
     

      {Array.from({ length: 3 }).map((_, index) => {
        const offset = (2 - index) * 6;
        return (
          <rect
            key={`stack-${index}`}
            x={x + offset}
            y={y - 10 + offset}
            width={blockWidth}
            height={40}
            fill="#4CAF50"
            stroke="#000"
            strokeWidth="1"
            rx="2"
          />
        );
      })}

      {/* Heading - shows Identical / Non-Identical / Load Sharing */}
      <text
        x={x + blockWidth / 2}
        y={y - 8}
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="#333"
      >
        {getHeading()}
      </text>

      {/* Reliability */}
      <text
        x={x + blockWidth / 2}
        y={y + 8}
        textAnchor="middle"
        fontSize="7"
        fill="#e8f5e9"
      >
        R: {formatReliability()}
      </text>

      {/* Unavailability */}
      <text
        x={x + blockWidth / 2}
        y={y + 18}
        textAnchor="middle"
        fontSize="7"
        fill="#ffebee"
      >
        U: {formatUnavailability()}
      </text>

      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>
    </g>
  );
};

export default KOfNBlock;
