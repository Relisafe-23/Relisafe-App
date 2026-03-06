// RBDBlock.jsx
import React, { useEffect, useState } from 'react';
import { KOfNBlock } from './KOfNBlock';

export const RBDBlock = ({ id, type, x, y, onEdit, onDelete, blockData, width = 60, height = 70 }) => {

  console.log(blockData, 'blockData from RBD Block')
  const [formData, setFormData] = useState({
    fr: blockData?.fr ? (1 / blockData.fr)?.toFixed(6) : '',
    k: blockData?.k || '2',
    n: blockData?.n || '3',
    mtbf: blockData?.mtbf || '1303617.9'
  });

  useEffect(() => {
    setFormData({
      fr: blockData?.fr ? (1 / blockData.fr)?.toFixed(6) : '',
      k: blockData?.k ,
      n: blockData?.n ,
      mtbf: blockData?.mtbf 
    })
  }, [blockData])

  console.log(formData, 'formData from RBDBlock')
  console.log(blockData.elementType, 'blockData elementType from RBDBlock')

  if (blockData.elementType === 'K-out-of-N') {
    return (
      <KOfNBlock
        id={id}
        x={x}
        y={y}
        onEdit={onEdit}
        onDelete={onDelete}
        blockData={blockData}
      />
    );
  }

  // Regular block rendering
  const blockWidth = 60;
  const blockHeight = 40;

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(e, id, blockData);
    }
  };

  const getBlockContent = () => {
    switch (blockData.elementType) {
      case 'REGULAR' || 'Regular':
        return formData?.fr || 'Block';
      case 'K-out-of-N':
        const k = blockData?.k || '2';
        const n = blockData?.n || '3';
        const mtbf = blockData?.mtbf || '1303617.9';
        return `Recover\n${mtbf}\n${k}/${n}`;
      case 'SubRBD':
        return 'Sub RBD';
      case 'Parallel Section':
        return formData?.fr || 'Block';
      case 'Parallel Branch':
        return 'Branch';
      default:
        return 'Block 123x';
    }
  };
  const getBlockColor = () => {
    switch (blockData.elementType) {
      case 'Regular'||'REGULAR':
        return '#4CAF50';
      case 'SubRBD':
        return '#FF9800';
      case 'Parallel Section':
        return '#9C27B0';
      case 'Parallel Branch':
        return '#2196F3';
      default:
        return '#9C27B0';
    }
  };

  return (
    <g onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
      <rect
        x={x}
        y={y}
        width={blockWidth}
        height={blockHeight}
        fill={getBlockColor()}
        stroke="#333"
        strokeWidth="1"
        rx="3"
        filter="url(#shadow)"
      />
      <text
        x={x + blockWidth / 2}
        y={y + blockHeight / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
      >
        {getBlockContent()}
      </text>
      {blockData?.name && type !== 'Regular' && (
        <text
          x={x + blockWidth / 2}
          y={y - 5}
          textAnchor="middle"
          fontSize="8"
          fill="#666"
        >
          {blockData.name}
        </text>
      )}

      {/* Shadow filter definition */}
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.2" />
        </filter>
      </defs>
    </g>
  );
};