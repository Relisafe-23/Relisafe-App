
import React, { useEffect, useState } from 'react';
import { KOfNBlock } from './KOfNBlock';

// Constants for layout
const CONSTANTS = {
  BLOCK_W: 60,
  BLOCK_H: 40,
  BLOCK_GAP: 12,
  LEFT_PAD: 20,
  RIGHT_PAD: 20,
  RAIL_PAD: 15,
  BRANCH_HEIGHT: 60,
  BRANCH_SPACING: 10,
  INNER_PAD_X: 14
};

export const RBDBlock = ({
  id,
  rightRailX,
  rightNodeId,
  leftRailX,
  wireY,
  selectedNode,
  leftNodeId,
  type,
  setIdforApi,
  x,
  y,
  setParentItemId,
  onEdit,
  onDelete,
  blockData,
  width = 60,
  height = 40,
  mission,

  onOpenMenu,
  setParentItem,
  onEditBlock,
  onDeleteBlock,
  branchId: parentBranchId,
  branchIndex: parentBranchIndex,
  itemId: parentItemId,
  isNested = false,
  // Props for branch nodes
  branch,
  item,
  branchBlocks,
  isLast,
  bIdx,
  midNodeId,
  dash,
  blockRowLeftX
}) => {

  const [formData, setFormData] = useState({
    fr: blockData?.fr ? (1 / blockData.fr)?.toFixed(6) : '',
    k: blockData?.k || blockData?.data?.k || '2',
    n: blockData?.n || blockData?.data?.n || '3',
    mtbf: blockData?.mtbf || blockData?.data?.mtbf || '',
    mttr: blockData?.mttr || blockData?.data?.mttr || ''
  });
  console.log("mission123...", mission)
  useEffect(() => {
    setFormData({
      fr: blockData?.fr ? (1 / blockData.fr)?.toFixed(6) : '',
      k: blockData?.k || blockData?.data?.k,
      n: blockData?.n || blockData?.data?.n,
      mtbf: blockData?.mtbf || blockData?.data?.mtbf,
      mttr: blockData?.mttr || blockData?.data?.mttr || ''
    });
  }, [blockData]);

  // Check if this is a nested parallel section
  const isNestedParallel = (blockData?.type === 'Parallel Section' ||
    blockData?.elementType === 'Parallel Section') &&
    blockData?.branches &&
    blockData?.branches.length > 0;

  // If it's a nested parallel section, render it recursively
  if (isNestedParallel) {
    return renderNestedParallelSection();
  }

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
  return renderRegularBlock();

  // ──────────────────────────────────────────────────────────────────────────
  // Nested Parallel Section Renderer
  // ──────────────────────────────────────────────────────────────────────────
  function renderNestedParallelSection() {
    const branches = blockData.branches || [];
    const k = blockData.k || 1;
    const n = blockData.n || branches.length;

    const BW = 60;   // block width
    const BH = 40;   // block height
    const GAP = 12;  // gap between blocks
    const RAIL_PAD = 20;   // distance from container edge to rail
    const INNER_PAD = 14;  // gap from rail to first/last block
    const ROW_STEP = 80;   // INCREASED vertical distance between branch wire centers
    const CONTAINER_PADDING = 25; // INCREASED padding around the entire nested section

    // ── Calculate container dimensions ──────────────────────────────────────────
    const maxBlocks = branches.length > 0
      ? Math.max(...branches.map(b => (b.blocks || []).length))
      : 0;

    const innerW = maxBlocks > 0
      ? INNER_PAD + maxBlocks * BW + (maxBlocks - 1) * GAP + INNER_PAD
      : INNER_PAD * 2 + 40;

    // Make container wider to accommodate nested sections within branches
    const containerW = Math.max(width * 3, RAIL_PAD * 2 + innerW + CONTAINER_PADDING * 2);

    // Calculate total height needed for all branches with extra spacing
    const totalBranchHeight = (branches.length) * ROW_STEP;
    const containerH = totalBranchHeight + BH * 2 + CONTAINER_PADDING * 3;

    // ── Position the nested section ─────────────────────────────────────────────
    const nestedSectionX = x - 60;

    // console.log(nestedSectionX,'nestedSectionX')
    // Center on the wire, but ensure it doesn't overflow
    // const nestedSectionY = wireY - containerH / 2 ;
    const nestedSectionY = wireY - containerH / 2 + 52.5;
    // console.log(nestedSectionY,'nestedSectionY')
    // console.log(wireY,'wireY')
    // console.log(containerH,'containerH')



    // ── Rail X positions ────────────────────────────────────────────────────────
    const leftRailX = nestedSectionX + RAIL_PAD + CONTAINER_PADDING;
    const rightRailX = nestedSectionX + containerW - RAIL_PAD - CONTAINER_PADDING;

    // ── Calculate branch wire Y positions with proper spacing ───────────────────
    const startY = nestedSectionY + CONTAINER_PADDING + BH;
    const getWireY = (idx) => startY + idx * ROW_STEP;

    const railTop = getWireY(0);
    const railBottom = getWireY(branches.length - 1);

    return (
      <g>
        {/* Optional: Add a transparent bounding box to occupy space (invisible but affects layout) */}
        <rect
          x={nestedSectionX}
          y={nestedSectionY}
          width={containerW}
          height={containerH}
          fill="none"
          stroke="none"
          pointerEvents="none"
        />

        {/* Title */}
        {/* <text
          x={nestedSectionX + containerW / 2}
          y={nestedSectionY + CONTAINER_PADDING / 2 + 8}
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="#333"
        >
          {blockData.name || 'Parallel Section'} (K={k}:N={n})
        </text> */}

        {/* Left vertical rail */}
        <line
          x1={leftRailX} y1={railTop}
          x2={leftRailX} y2={railBottom}
          stroke="black" strokeWidth="1.5"
        />

        {/* Right vertical rail */}
        <line
          x1={rightRailX} y1={railTop}
          x2={rightRailX} y2={railBottom}
          stroke="black" strokeWidth="1.5"
        />

        {/* K:N label above left rail */}
        {/* <text
          x={leftRailX} y={railTop - 6}
          textAnchor="middle" fontSize="8" fill="#333"
        >
          {k}:{n}
        </text> */}

        {/* Branches */}
        {branches.map((branch, branchIdx) => {
          const wireY = getWireY(branchIdx);
          const blockY = wireY - BH / 2;
          const branchBlocks = branch.blocks || [];
          const isMainBranch = branchIdx === 0;
          const dash = isMainBranch ? undefined : '5,3';

          const branchKey = branch._id ?? branch.id ?? branchIdx;
          const leftNodeId = `nested-branch-${branchKey}-left`;
          const rightNodeId = `nested-branch-${branchKey}-right`;
          const midNodeId = (bIdx) => `nested-branch-${branchKey}-mid-${bIdx}`;

          const blockRowLeftX = leftRailX + INNER_PAD;

          return (
            <g key={branchKey}>
              {/* Branch label */}
              {/* <text
                x={leftRailX - 8}
                y={wireY + 4}
                fontSize="7"
                fill="#666"
                textAnchor="end"
              >
                {branch.name || `B${branchIdx + 1}`}
              </text> */}

              {/* Left rail node */}
              <circle
                cx={leftRailX} cy={wireY} r={4}
                fill={selectedNode === leftNodeId ? "#0078d4" : "black"}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMenu?.(e.clientX, e.clientY, leftNodeId);
                  setIdforApi?.({
                    branchId: branch._id,
                    branchIndex: branch.index,
                    ItemId: id,
                    location: leftNodeId,
                  });
                }}
              />

              {branchBlocks.length === 0 ? (
                <line
                  x1={leftRailX} y1={wireY} x2={rightRailX} y2={wireY}
                  stroke="black" strokeWidth="1.5" strokeDasharray={dash}
                />
              ) : (
                <>
                  <line
                    x1={leftRailX} y1={wireY}
                    x2={blockRowLeftX} y2={wireY}
                    stroke="black" strokeWidth="1.5" strokeDasharray={dash}
                  />

                  {branchBlocks.map((block, blockIdx) => {
                    const bx = blockRowLeftX + blockIdx * (BW + GAP);
                    const isLast = blockIdx === branchBlocks.length - 1;

                    return (
                      <g key={block._id ?? block.id ?? blockIdx}>
                        <RBDBlock
                          id={block._id ?? block.id}
                          type={block.type}
                          x={bx}
                          y={blockY}
                          wireY={wireY}
                          onEdit={onEditBlock || onEdit}
                          onDelete={onDeleteBlock || onDelete}
                          setIdforApi={setIdforApi}
                          blockData={block}
                          width={BW}
                          height={BH}
                          onOpenMenu={onOpenMenu}
                          setParentItem={setParentItem}
                          setParentItemId={setParentItemId}
                          onEditBlock={onEditBlock}
                          onDeleteBlock={onDeleteBlock}
                          selectedNode={selectedNode}
                          isNested={true}
                        />

                        {!isLast && (
                          <>
                            <line
                              x1={bx + BW} y1={wireY}
                              x2={bx + BW + GAP} y2={wireY}
                              stroke="black" strokeWidth="1.5" strokeDasharray={dash}
                            />
                            <circle
                              cx={bx + BW + GAP / 2} cy={wireY} r={4}
                              fill={selectedNode === midNodeId(blockIdx) ? "#0078d4" : "black"}
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenMenu?.(e.clientX, e.clientY, midNodeId(blockIdx));
                                setIdforApi?.({
                                  branchId: branch._id,
                                  branchIndex: branch.index,
                                  ItemId: id,
                                  location: midNodeId(blockIdx),
                                });
                              }}
                            />
                          </>
                        )}

                        {isLast && (
                          <line
                            x1={bx + BW} y1={wireY}
                            x2={rightRailX} y2={wireY}
                            stroke="black" strokeWidth="1.5" strokeDasharray={dash}
                          />
                        )}
                      </g>
                    );
                  })}
                </>
              )}

              {/* Right rail node */}
              <circle
                cx={rightRailX} cy={wireY} r={4}
                fill={selectedNode === rightNodeId ? "#0078d4" : "black"}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMenu?.(e.clientX, e.clientY, rightNodeId);
                  setIdforApi?.({
                    branchId: branch._id,
                    branchIndex: branch.index,
                    ItemId: id,
                    location: rightNodeId,
                  });
                }}
              />
            </g>
          );
        })}
      </g>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Regular Block Renderer
  // ──────────────────────────────────────────────────────────────────────────
  function renderRegularBlock() {
    const BLOCK_W = CONSTANTS.BLOCK_W;
    const BLOCK_H = CONSTANTS.BLOCK_H;

    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onEdit) onEdit(e, id, blockData);
    };

    const getBlockContent = () => {
      const t = blockData?.type || blockData?.elementType;
      // const fr = blockData?.fr || blockData?.data?.fr;
      const mttr = blockData?.mttr || blockData?.data?.mttr;
      const mtbf = blockData?.mtbf || blockData?.data?.mtbf;
      const k = blockData?.k || blockData?.data?.k;
      const n = blockData?.n || blockData?.data?.n;

      const missionTime = mission;
const calculateMetrics = ({ mtbf, mttr, missionTime }) => {
  const MTBF = Number(mtbf || 0);
  const MTTR = Number(mttr || 0);
  const t = Number(missionTime || 0);

  // Default values
  let unavailability = 0;
  let reliability = "0";

  // ✅ Unavailability
  if (!(MTBF === 0 && MTTR === 0)) {
    const u = MTTR / (MTBF + MTTR);
    unavailability = Number(u.toFixed(4));
  }

  // ✅ Reliability
  if (MTBF > 0 && t >= 0) {
    const r = Math.exp(-t / MTBF);

    reliability =
      r < 1e-4
        ? r.toExponential(2)
        : r.toFixed(2);
  }

  return {
    reliability,
    unavailability
  };
};

   
      switch (t) {
case 'Regular':
case 'REGULAR': {
  const { reliability, unavailability } = calculateMetrics({
    mtbf,
    mttr,
    missionTime
  });

  return (
    <>
      <tspan x={x + BLOCK_W / 2} dy="-4">
        R: {reliability}
      </tspan>
      <tspan x={x + BLOCK_W / 2} dy="10">
        U: {unavailability}
      </tspan>
    </>
  );
}
        case 'K-out-of-N':
          return `${k || 2}/${n || 3}`;
        case 'SubRBD':
          return 'Sub RBD';
        default:
          return 'Block';
      }
    };

    const getBlockColor = () => {
      const t = blockData?.type || blockData?.elementType;
      switch (t) {
        case 'Regular':
        case 'REGULAR': return '#4CAF50';
        case 'SubRBD': return '#FF9800';
        case 'K-out-of-N': return '#FF5722';
        default: return '#4CAF50';
      }
    };

    const getBlockName = () => blockData?.name || blockData?.data?.name || '';

    return (
      <g
        onContextMenu={handleContextMenu}
        style={{ cursor: 'context-menu' }}
        onClick={() => { if (setParentItemId) setParentItemId(null); }}
      >
        {/* name label above block */}
        {/* {getBlockName() && (
          <text
            x={x + BLOCK_W / 2}
            y={y - 4}
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill="#333"
          >
            {getBlockName()}
          </text>
        )} */}

        <rect
          x={x}
          y={y}
          width={BLOCK_W}
          height={BLOCK_H}
          fill={getBlockColor()}
          stroke="#2a7a2a"
          strokeWidth="1"
          rx="2"
        />

        {/* main value line */}
        <text
          x={x + BLOCK_W / 2}
          y={y + BLOCK_H / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="8"
          fontWeight="bold"
        >
          {getBlockContent()}
        </text>
      </g>
    );
  }
};

export default RBDBlock;