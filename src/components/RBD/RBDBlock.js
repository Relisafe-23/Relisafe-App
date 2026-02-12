
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Api from '../../Api';

 const RBDBlock = ({ id, type, x, y, onEdit, onDelete, blockData }) => {
  const [formData, setFormData] = useState({
    fr: blockData?.fr ? (1 / blockData.fr)?.toFixed(6) : '',
    k: blockData?.k || '2',
    n: blockData?.n || '3',
    mtbf: blockData?.mtbf || '1303617.9'
  });
  const getBlockContent = () => {
    switch (type) {
      case 'Regular':
        return formData?.fr || 'Block';
      case 'K-out-of-N':
        const k = blockData?.k || '2';
        const n = blockData?.n || '3';
        const mtbf = blockData?.mtbf || '1303617.9';
        return `Recover\n${mtbf}\n${k}/${n}`;
      case 'SubRBD':
        return 'Sub RBD';
      case 'Parallel Section':
        return 'PS\n119760.5';
      case 'Parallel Branch':
        return 'Branch';
      default:
        return 'Block';
    }
  };

  const renderBlock = () => {
    const commonProps = {
      onClick: (e) => {
        e.stopPropagation();
        onEdit(e, id, blockData);
      },
      style: { cursor: "pointer" }
    };

    switch (type) {
      case 'Regular':
        return (
          <>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill={blockData.color || "white"}
              stroke="black"
              strokeWidth="2"
              rx="0"
              ry="0"
              {...commonProps}
            />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              {...commonProps}
            >
              {getBlockContent()}
            </text>
          </>
        );

      case 'K-out-of-N':
        const blockText = getBlockContent();
        const lines = blockText.split('\n');

        return (
          <>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill="#e6f3ff"
              stroke="#0066cc"
              strokeWidth="2"
              rx="5"
              ry="5"
              {...commonProps}
            />

            <text
              x={x + 30}
              y={y + 15}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#0066cc"
              {...commonProps}
            >
              {lines[0]}
            </text>

            <text
              x={x + 30}
              y={y + 25}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="#0066cc"
              {...commonProps}
            >
              {lines[1]}
            </text>

            <text
              x={x + 30}
              y={y + 35}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#0066cc"
              {...commonProps}
            >
              {lines[2]}
            </text>
          </>
        );

      case 'SubRBD':
        return (
          <>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill="#fff0e6"
              stroke="#cc6600"
              strokeWidth="2"
              rx="5"
              ry="5"
              {...commonProps}
            />
            <rect
              x={x + 5}
              y={y + 5}
              width="50"
              height="30"
              fill="white"
              stroke="#cc6600"
              strokeWidth="1"
              strokeDasharray="2,2"
              {...commonProps}
            />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#cc6600"
              {...commonProps}
            >
              {getBlockContent()}
            </text>
          </>
        );

      case 'Parallel Section':
        return (
          <g {...commonProps}>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill="#e6ffe6"
              stroke="#006600"
              strokeWidth="2"
              rx="5"
              ry="5"
            />
            <line x1={x + 15} y1={y + 10} x2={x + 15} y2={y + 30} stroke="#006600" strokeWidth="1" />
            <line x1={x + 30} y1={y + 10} x2={x + 30} y2={y + 30} stroke="#006600" strokeWidth="1" />
            <line x1={x + 45} y1={y + 10} x2={x + 45} y2={y + 30} stroke="#006600" strokeWidth="1" />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#006600"
            >
              {getBlockContent()}
            </text>
          </g>
        );

      case 'Parallel Branch':
        return (
          <g {...commonProps}>
            <polygon
              points={`
                ${x + 30},${y} 
                ${x + 60},${y + 20} 
                ${x + 30},${y + 40} 
                ${x},${y + 20}
              `}
              fill="#fff0f5"
              stroke="#cc0066"
              strokeWidth="2"
            />
            <line x1={x + 20} y1={y + 10} x2={x + 40} y2={y + 10} stroke="#cc0066" strokeWidth="1" />
            <line x1={x + 20} y1={y + 30} x2={x + 40} y2={y + 30} stroke="#cc0066" strokeWidth="1" />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#cc0066"
            >
              Parallel{'\n'}Branch
            </text>
          </g>
        );

      default:
        return (
          <>
            <rect
              x={x}
              y={y}
              width="60"
              height="40"
              fill="lightblue"
              stroke="black"
              strokeWidth="2"
              rx="5"
              ry="5"
              {...commonProps}
            />
            <text
              x={x + 30}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              {...commonProps}
            >
              {getBlockContent()}
            </text>
          </>
        );
    }
  };

  return (
    <g>
      {renderBlock()}
      <g onClick={(e) => {
        e.stopPropagation();
        onDelete(id);
      }} style={{ cursor: "pointer" }}>
        <circle cx={x + 65} cy={y} r="8" fill="red" />
        <text x={x + 65} y={y + 2} textAnchor="middle" fontSize="10" fill="white">X</text>
      </g>
    </g>
  );
};

export default RBDBlock;