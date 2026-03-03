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
 
      <rect
        x={x - 15}
        y={startY - 5}
        width={blockWidth + 30}
        height={totalHeight + 1}
        fill="#ffff"
        // stroke="#999"
        strokeWidth="1"
        rx="5"
       
      />

{Array.from({ length: 3 }).map((_, index) => {
  const offset = (2 - index) * 6; 

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

      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2"/>
        </filter>
      </defs>
    </g>
  );
};

export default KOfNBlock;