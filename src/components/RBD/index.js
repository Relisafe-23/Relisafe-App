import React, { useState, useEffect } from 'react';
import SplitKofN from './SplitKofN';
import Api from "../../Api";
import RBDStructure from './RBDStructure';
import { useParams } from 'react-router-dom';
import CreatableSelect from "react-select/creatable";
import 
{ElementParametersModal} from './ElementParametersModal';

import SwitchConfigurationModal from './SwitchConfig';

import RBDBlock from './RBDBlock';

export const InsertionNode = ({ x, y, onOpenMenu }) => {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r="6"
        fill="black"
        stroke="black"
        strokeWidth="1"
        style={{ cursor: "context-menu" }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenMenu(e.clientX, e.clientY);
        }}
      />
      <line
        x1={x - 3} y1={y}
        x2={x + 3} y2={y}
        stroke="white"
        strokeWidth="1.5"
      />
      <line
        x1={x} y1={y - 3}
        x2={x} y2={y + 3}
        stroke="white"
        strokeWidth="1.5"
      />
    </g>
  );
};


export const BiDirectionalSymbol = ({ onNodeClick, onOpenMenu, blocks, onDeleteBlock, onEditBlock }) => {
  const boxWidth = 60;
  const boxHeight = 40;
  const arrowWidth = 15;
  const arrowHeight = 20;
  const centerPointY = 50;
  const nodeRadius = 6;
  const blockWidth = 60;
  const nodeSpacing = 20;
  const blockSpacing = 20;
  const minOutputGap = 50;

  const leftBoxX = 50;
  const baseRightBoxX = 650;
  const dynamicRightBoxX = baseRightBoxX + (blocks.length * 30);

  const calculateLayout = () => {
    if (blocks.length === 0) {
      const centerX = (leftBoxX + boxWidth + baseRightBoxX) / 2;
      return {
        items: [],
        totalWidth: 0,
        startX: centerX,
        actualRightBoxX: baseRightBoxX
      };
    }

    const totalBlocksWidth = blocks.length * blockWidth;
    const totalNodesWidth = (blocks.length + 1) * nodeSpacing * 2;
    const totalBlockSpacing = (blocks.length - 1) * blockSpacing;
    const totalNeededWidth = totalBlocksWidth + totalNodesWidth + totalBlockSpacing;

    const requiredRightBoxX = leftBoxX + boxWidth + totalNeededWidth + minOutputGap + boxWidth;
    const actualRightBoxX = Math.max(baseRightBoxX, requiredRightBoxX);

    const availableWidth = actualRightBoxX - leftBoxX - boxWidth * 2;
    const startX = leftBoxX + boxWidth + (availableWidth - totalNeededWidth) / 2 + nodeSpacing;

    const items = [];
    let currentX = startX;

    items.push({
      type: 'node',
      id: 'node-start',
      x: currentX,
      y: centerPointY
    });
    currentX += nodeSpacing;

    blocks.forEach((block, index) => {
      items.push({
        type: 'block',
        id: block.id,
        blockType: block.type,
        blockData: block.data,
        x: currentX,
        y: centerPointY - 20
      });
      currentX += blockWidth + blockSpacing;

      if (index < blocks.length - 1) {
        items.push({
          type: 'node',
          id: `node-${block.id}`,
          x: currentX,
          y: centerPointY
        });
        currentX += nodeSpacing;
      }
    });

    if (blocks.length > 0) {
      items.push({
        type: 'node',
        id: 'node-end',
        x: currentX,
        y: centerPointY
      });
    }

    return {
      items,
      totalWidth: currentX - startX,
      startX,
      actualRightBoxX
    };
  };

  const layout = calculateLayout();
  const items = layout.items;
  const rightBoxX = layout.actualRightBoxX;

  const leftArrowPoints = [
    [rightBoxX, centerPointY - arrowHeight / 2],
    [rightBoxX + arrowWidth, centerPointY],
    [rightBoxX, centerPointY + arrowHeight / 2]
  ].map(p => p.join(',')).join(' ');

  const rightArrowPoints = [
    [leftBoxX + boxWidth, centerPointY - arrowHeight / 2],
    [leftBoxX + boxWidth - arrowWidth, centerPointY],
    [leftBoxX + boxWidth, centerPointY + arrowHeight / 2]
  ].map(p => p.join(',')).join(' ');

  const getConnectionPoints = () => {
    const connectionPoints = [];

    if (items.length === 0) {
      connectionPoints.push({
        from: leftBoxX + boxWidth,
        to: rightBoxX,
        y: centerPointY
      });
    } else {
      connectionPoints.push({
        from: leftBoxX + boxWidth,
        to: items[0].x - nodeRadius,
        y: centerPointY
      });

      for (let i = 0; i < items.length - 1; i++) {
        const current = items[i];
        const next = items[i + 1];

        let fromX, toX;

        if (current.type === 'block') {
          fromX = current.x + blockWidth;
        } else {
          fromX = current.x + nodeRadius;
        }

        if (next.type === 'block') {
          toX = next.x;
        } else {
          toX = next.x - nodeRadius;
        }

        connectionPoints.push({
          from: fromX,
          to: toX,
          y: centerPointY
        });
      }

      const lastItem = items[items.length - 1];
      let lastX;
      if (lastItem.type === 'block') {
        lastX = lastItem.x + blockWidth;
      } else {
        lastX = lastItem.x + nodeRadius;
      }

      const minEndX = rightBoxX - minOutputGap;
      const endX = Math.min(lastX + 20, minEndX);

      connectionPoints.push({
        from: lastX,
        to: endX,
        y: centerPointY
      });

      connectionPoints.push({
        from: endX,
        to: rightBoxX,
        y: centerPointY
      });
    }

    return connectionPoints;
  };

  const connectionPoints = getConnectionPoints();
  const svgWidth = Math.max(750, rightBoxX + 100);

  return (
    <svg width={svgWidth} height="100" viewBox={`0 0 ${svgWidth} 100`} style={{ overflow: 'visible' }}>
      {connectionPoints.map((point, index) => (
        <line
          key={`line-${index}`}
          x1={point.from}
          y1={point.y}
          x2={point.to}
          y2={point.y}
          stroke="black"
          strokeWidth="2"
        />
      ))}

      <g onClick={() => onNodeClick("LEFT")} style={{ cursor: "pointer" }}>
        <rect
          x={leftBoxX}
          y={centerPointY - boxHeight / 2}
          width={boxWidth}
          height={boxHeight}
          fill="black"
        />
        <polygon points={rightArrowPoints} fill="white" />
        <text
          x={leftBoxX + boxWidth / 2}
          y={centerPointY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          Input
        </text>
      </g>

      <g onClick={() => onNodeClick("RIGHT")} style={{ cursor: "pointer" }}>
        <rect
          x={rightBoxX}
          y={centerPointY - boxHeight / 2}
          width={boxWidth}
          height={boxHeight}
          fill="black"
        />
        <polygon points={leftArrowPoints} fill="white" />
        <text
          x={rightBoxX + boxWidth / 2}
          y={centerPointY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          Output
        </text>
      </g>

      {items.map((item) => {
        if (item.type === 'node') {
          return (
            <InsertionNode
              key={item.id}
              x={item.x}
              y={item.y}
              onOpenMenu={onOpenMenu}
            />
          );
        } else if (item.type === 'block') {
          return (
            <RBDBlock
              key={item.id}
              id={item.id}
              type={item.blockType}
              x={item.x}
              y={item.y}
              onEdit={onEditBlock}
              onDelete={onDeleteBlock}
              blockData={item.blockData}
            />
          );
        }
        return null;
      })}

      {blocks.length === 0 && (
        <InsertionNode
          x={layout.startX}
          y={centerPointY}
          onOpenMenu={onOpenMenu}
        />
      )}
    </svg>
  );
};

export const RBDContextMenu = ({ x, y, onSelect, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: y,
      left: x,
      background: "#fff",
      border: "1px solid #ccc",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 1000,
      width: "180px"
    }}
    onMouseLeave={onClose}
  >
    {[
      "Add Regular",
      "Add K-out-of-N",
      "Add SubRBD",
      "Add Parallel Section",
      "Add Parallel Branch"
    ].map(item => (
      <div
        key={item}
        onClick={() => onSelect(item)}
        style={{
          padding: "8px",
          cursor: "pointer",
          ":hover": {
            backgroundColor: "#f0f0f0"
          }
        }}
      >
        {item}
      </div>
    ))}
  </div>
);

// BlockContextMenu Component
export const BlockContextMenu = ({ x, y, onSelect, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: y,
      left: x,
      background: "#fff",
      border: "1px solid #ccc",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 1001,
      width: "180px"
    }}
    onMouseLeave={onClose}
  >
    {[
      "Edit...",
      "Delete...",
      "Split K-out-of-N...",
      "Add Regular",
      "Add K-out-of-N",
      "Add SubRBD",
      "Add Parallel Section",
      "Add Parallel Branch"
    ].map(item => (
      <div
        key={item}
        onClick={() => onSelect(item)}
        style={{
          padding: "8px",
          cursor: "pointer",
          ":hover": {
            backgroundColor: "#f0f0f0"
          }
        }}
      >
        {item}
      </div>
    ))}
  </div>
);

// Main Component
export default function RBDButton() {
  const [showSymbol, setShowSymbol] = useState(false);
  const [menu, setMenu] = useState(null);
  const [blockMenu, setBlockMenu] = useState({ open: false, blockId: null, x: 0, y: 0 });
  const [blocks, setBlocks] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [elementModal, setElementModal] = useState({
    open: false,
    mode: 'add',
    blockId: null,
    blockType: ''
  });
  const [switchModal, setSwitchModal] = useState({
    open: false,
    blockId: null,
    initialData: null
  });

  const openMenu = (x, y) => setMenu({ x, y });

  const handleNodeClick = (node) => {
    console.log("Node clicked:", node);
  };

  const handleSelect = (action) => {
    console.log("RBD action:", action);

    const type = action.replace("Add ", "");

    setElementModal({
      open: true,
      mode: 'add',
      blockId: nextId,
      blockType: type
    });
  };

  const handleModalSubmit = (formData) => {
    if (elementModal.mode === 'add') {
      const newBlock = {
        id: nextId,
        type: elementModal.blockType === 'K_OUT_OF_N' ? 'K-out-of-N' :
          elementModal.blockType === 'SUBRBD' ? 'SubRBD' :
            elementModal.blockType === 'PARALLEL_SECTION' ? 'Parallel Section' :
              elementModal.blockType === 'PARALLEL_BRANCH' ? 'Parallel Branch' : 'Regular',
        data: {
          ...formData,
          elementType: elementModal.blockType === 'K_OUT_OF_N' ? 'K-out-of-N' :
            elementModal.blockType === 'SUBRBD' ? 'SubRBD' :
              elementModal.blockType === 'PARALLEL_SECTION' ? 'Parallel Section' :
                elementModal.blockType === 'PARALLEL_BRANCH' ? 'Parallel Branch' : 'Regular'
        }
      };

      setBlocks([...blocks, newBlock]);
      setNextId(nextId + 1);
    } else if (elementModal.mode === 'edit') {
      setBlocks(blocks.map(block =>
        block.id === elementModal.blockId
          ? {
            ...block,
            data: {
              ...formData,
              elementType: block.type
            }
          }
          : block
      ));
    }

    setElementModal({ open: false, mode: 'add', blockId: null, blockType: '' });
  };

  const handleSwitchConfigOpen = (initialData) => {
    setSwitchModal({
      open: true,
      blockId: elementModal.blockId,
      initialData
    });
  };

  const handleSwitchSubmit = (switchData) => {
    if (elementModal.blockId) {
      setBlocks(blocks.map(block =>
        block.id === elementModal.blockId
          ? {
            ...block,
            data: {
              ...block.data,
              switchData: switchData
            }
          }
          : block
      ));
    }

    setSwitchModal({ open: false, blockId: null, initialData: null });
  };

  const handleDeleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const handleEditBlock = (e, id, blockData) => {
    if (e) {
      const rect = e.target.getBoundingClientRect();
      setBlockMenu({ open: true, blockId: id, x: rect.right, y: rect.top });
    }
  };

  const handleBlockMenuSelect = (action) => {
    if (!blockMenu.blockId) return;

    if (action === "Edit...") {
      const block = blocks.find(b => b.id === blockMenu.blockId);
      setElementModal({
        open: true,
        mode: 'edit',
        blockId: blockMenu.blockId,
        blockType: block?.type === 'K-out-of-N' ? 'K_OUT_OF_N' :
          block?.type === 'SubRBD' ? 'SUBRBD' :
            block?.type === 'Parallel Section' ? 'PARALLEL_SECTION' :
              block?.type === 'Parallel Branch' ? 'PARALLEL_BRANCH' : 'REGULAR'
      });
    } else if (action === "Delete...") {
      handleDeleteBlock(blockMenu.blockId);
    } else if (action.startsWith("Add ")) {
      const type = action.replace("Add ", "");
      setElementModal({
        open: true,
        mode: 'add',
        blockId: nextId,
        blockType: type === 'K-out-of-N' ? 'K_OUT_OF_N' :
          type === 'SubRBD' ? 'SUBRBD' :
            type === 'Parallel Section' ? 'PARALLEL_SECTION' :
              type === 'Parallel Branch' ? 'PARALLEL_BRANCH' : 'REGULAR'
      });
    } else if (action === "Split K-out-of-N...") {
      alert("Splitting K-out-of-N block");
    }

    setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
  };
  const [listedRBDs, setListedRBDs] = useState([]);

  return (
    <>

      <div style={{ minHeight: "100vh", padding: "20px", overflowX: "auto" }}>

        {/* Center Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            marginTop: "50px",
          }}
        >
          {/* RBD List */}
          <RBDStructure />

          {/* RBD Button */}
          <div style={{ margin: "40px 0" }}>
            <button
              onClick={() => setShowSymbol(true)}
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              RBD
            </button>
          </div>

          {/* RBD Diagram */}
          {showSymbol && (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <BiDirectionalSymbol
                onNodeClick={handleNodeClick}
                onOpenMenu={openMenu}
                blocks={blocks}
                onDeleteBlock={handleDeleteBlock}
                onEditBlock={handleEditBlock}
              />
            </div>
          )}
        </div>

        {/* Right-click Menu (RBD) */}
        {menu && (
          <RBDContextMenu
            x={menu.x}
            y={menu.y}
            onSelect={handleSelect}
            onClose={() => setMenu(null)}
          />
        )}

        {/* Right-click Menu (Block) */}
        {blockMenu.open && (
          <BlockContextMenu
            x={blockMenu.x}
            y={blockMenu.y}
            onSelect={handleBlockMenuSelect}
            onClose={() =>
              setBlockMenu({ open: false, blockId: null, x: 0, y: 0 })
            }
          />
        )}

        {/* Element Modal */}
        <ElementParametersModal
          isOpen={elementModal.open}
          onClose={() =>
            setElementModal({
              open: false,
              mode: "add",
              blockId: null,
              blockType: "",
            })
          }
          onSubmit={handleModalSubmit}
          onOpenSwitchConfig={handleSwitchConfigOpen}
          currentBlock={
            blocks.find((b) => b.id === elementModal.blockId)?.data
          }
        />

        {/* Switch Config Modal */}
        <SwitchConfigurationModal
          isOpen={switchModal.open}
          onClose={() =>
            setSwitchModal({
              open: false,
              blockId: null,
              initialData: null,
            })
          }
          onSubmit={handleSwitchSubmit}
          currentSwitchData={switchModal.initialData}
        />
      </div>

    </>

  );
}
