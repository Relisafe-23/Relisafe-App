// RBDBlock.jsx
import React, { useEffect, useState } from 'react';
import { KOfNBlock } from './KOfNBlock';

export const RBDBlock = ({ id, type, x, y, setParentItemId, onEdit, onDelete, blockData, width = 60, height = 70 }) => {

  // console.log(blockData, 'blockData from RBD Block')

  const [formData, setFormData] = useState({
    fr: blockData?.fr ? (1 / blockData.fr)?.toFixed(6) : '',
    // For K-out-of-N blocks, data might be nested or direct
    k: blockData?.k || blockData?.data?.k || '2',
    n: blockData?.n || blockData?.data?.n || '3',
    mtbf: blockData?.mtbf || blockData?.data?.mtbf || '1303617.9'
  });

  useEffect(() => {
    setFormData({
      fr: blockData?.fr ? (1 / blockData.fr)?.toFixed(6) : '',
      k: blockData?.k || blockData?.data?.k,
      n: blockData?.n || blockData?.data?.n,
      mtbf: blockData?.mtbf || blockData?.data?.mtbf
    })
  }, [blockData]);

  // Check if this is a K-out-of-N block
  const isKOfN = blockData?.type === 'K-out-of-N' ||
    blockData?.elementType === 'K-out-of-N' ||
    blockData?.data?.elementType === 'K-out-of-N';

  if (isKOfN) {
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
    const type = blockData?.type || blockData?.elementType;
    // console.log(type, 'type to set value');

    // Get values from either direct properties or nested data
    const fr = blockData?.fr || blockData?.data?.fr;
    const mtbf = blockData?.mtbf || blockData?.data?.mtbf;
    const k = blockData?.k || blockData?.data?.k;
    const n = blockData?.n || blockData?.data?.n;

    switch (type) {
      case 'Regular':
      case 'REGULAR':
        // Format FR value for display
        if (fr) {
          const frValue = typeof fr === 'number' ? fr.toFixed(6) : fr;
          return `λ = ${frValue}`;
        }
        return 'Regular Block';

      case 'K-out-of-N':
        return `K/N\n${k || '2'}/${n || '3'}\nMTBF: ${mtbf || 'N/A'}`;

      case 'SubRBD':
        return 'Sub RBD';

      case 'Parallel Section':
        return `Parallel\nSection`;

      case 'Parallel Branch':
        return `Branch`;

      default:
        return 'Block';
    }
  };

  const getBlockColor = () => {
    const type = blockData?.type || blockData?.elementType;

    switch (type) {
      case 'Regular':
      case 'REGULAR':
        return '#4CAF50'; // Green
      case 'SubRBD':
        return '#FF9800'; // Orange
      case 'Parallel Section':
        return '#9C27B0'; // Purple
      case 'Parallel Branch':
        return '#2196F3'; // Blue
      case 'K-out-of-N':
        return '#FF5722'; // Deep Orange
      default:
        return '#9C27B0'; // Default Purple
    }
  };

  const getBlockName = () => {
    return blockData?.name || blockData?.data?.name || '';
  };

  return (
    <g onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}
      onClick={() => {
        if (setParentItemId) {
          setParentItemId(null);
        }
      }}>
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
        fontSize="9"
        fontWeight="bold"
      >
        {getBlockContent()}
      </text>
      {getBlockName() && (
        <text
          x={x + blockWidth / 2}
          y={y - 5}
          textAnchor="middle"
          fontSize="8"
          fill="#666"
        >
          {getBlockName()}
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