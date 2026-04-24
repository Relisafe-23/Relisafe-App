
import React, { useEffect, useState } from 'react';
import { KOfNBlock } from './KOfNBlock';
import { useLocation, useParams, useHistory } from "react-router-dom";
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
  blockRowLeftX,
  setTargetBranchId,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [isSelected, setIsSelected] = useState(false);

  const handleSelect = (clickedId) => {
    if (selectedId === clickedId) {
      setSelectedId(null);
      setIsSelected(false);
    } else {
      setSelectedId(clickedId);
      setIsSelected(true);
    }
  };
  const location = useLocation();

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [formData, setFormData] = useState({
    fr: blockData?.fr ? (1 / blockData.fr)?.toFixed(6) : '',
    k: blockData?.k || blockData?.data?.k || '2',
    n: blockData?.n || blockData?.data?.n || '3',
    mtbf: blockData?.mtbf || blockData?.data?.mtbf || '',
    mttr: blockData?.mttr || blockData?.data?.mttr || ''
  });
  const missionTime = location.state?.missionTime;
  // console.log("mission",missionTime)
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


  return renderRegularBlock();

  function renderNestedParallelSection() {
    const branches = blockData.branches || [];

    const BW = 60, BH = 40, GAP = 12;
    const RAIL_PAD = 20, INNER_PAD = 14;
    const CONTAINER_PADDING = 20, BRANCH_SPACING = 20;


    const getBranchHeight = (branch) => {
      const branchBlocks = branch.blocks || [];
      let maxNestedH = 0;
      branchBlocks.forEach(block => {
        if (
          (block.type === 'Parallel Section' || block.elementType === 'Parallel Section') &&
          block.branches?.length > 0
        ) {
          const nestedH = block.branches.reduce((sum, nb) => {
            return sum + getBranchHeight(nb) + BRANCH_SPACING;
          }, 0) + BH + CONTAINER_PADDING * 2;
          maxNestedH = Math.max(maxNestedH, nestedH);
        }
      });
      return maxNestedH > 0 ? maxNestedH : BH + 40;
    };

    const getBranchWidth = (branch) => {
      const branchBlocks = branch.blocks || [];
      let totalW = 0;
      branchBlocks.forEach((block, idx) => {
        if (
          (block.type === 'Parallel Section' || block.elementType === 'Parallel Section') &&
          block.branches?.length > 0
        ) {
          const nestedMaxBlocks = Math.max(...block.branches.map(b => (b.blocks || []).length));
          const nestedInnerW = INNER_PAD + nestedMaxBlocks * BW + (nestedMaxBlocks - 1) * GAP + INNER_PAD;
          const nestedW = RAIL_PAD * 2 + nestedInnerW + CONTAINER_PADDING * 2;
          totalW += nestedW + (idx > 0 ? GAP : 0);
        } else {
          totalW += BW + (idx > 0 ? GAP : 0);
        }
      });
      return Math.max(totalW, BW);
    };

    // ── Compute Y offsets per branch (same formula as BiDirectionalSymbol) ──
    const branchHeights = branches.map(b => getBranchHeight(b));
    const branchYOffsets = [];
    let runningY = CONTAINER_PADDING + BH / 2;
    branchHeights.forEach(h => {
      branchYOffsets.push(runningY + h / 2);
      runningY += h + BRANCH_SPACING;
    });

    const containerH = runningY + BH / 2 + CONTAINER_PADDING;

    // ── Container width ──────────────────────────────────────────────────────
    const maxBranchW = Math.max(...branches.map(b => getBranchWidth(b)));
    const innerW = INNER_PAD + maxBranchW + INNER_PAD;
    const containerW = Math.max(BW * 3, RAIL_PAD * 2 + innerW + CONTAINER_PADDING * 2);

    // ── Position: center on wireY ────────────────────────────────────────────
    const nestedSectionX = x - CONTAINER_PADDING;
    const nestedSectionY = wireY - containerH / 2;

    const nestedLeftRailX = nestedSectionX + RAIL_PAD + CONTAINER_PADDING;
    const nestedRightRailX = nestedSectionX + containerW - RAIL_PAD - CONTAINER_PADDING;

    const railTop = nestedSectionY + branchYOffsets[0];
    const railBottom = nestedSectionY + branchYOffsets[branches.length - 1];

    return (
      <g>
        <rect
          x={nestedSectionX} y={nestedSectionY}
          width={containerW} height={containerH}
          fill="none" stroke="none" pointerEvents="none"
        />

        <line x1={nestedLeftRailX} y1={railTop} x2={nestedLeftRailX} y2={railBottom}
          stroke="black" strokeWidth="1.5" />
        <line x1={nestedRightRailX} y1={railTop} x2={nestedRightRailX} y2={railBottom}
          stroke="black" strokeWidth="1.5" />

        {branches.map((branch, branchIdx) => {
          const branchWireY = nestedSectionY + branchYOffsets[branchIdx];
          const blockY = branchWireY - BH / 2;
          const branchBlocks = branch.blocks || [];
          const isMainBranch = branchIdx === 0;
          const dash = isMainBranch ? undefined : '5,3';

          const branchKey = branch._id ?? branch.id ?? branchIdx;
          const leftNodeId = `nested-branch-${branchKey}-left`;
          const rightNodeId = `nested-branch-${branchKey}-right`;
          const midNodeId = (bIdx) => `nested-branch-${branchKey}-mid-${bIdx}`;
          const blockRowLeftX = nestedLeftRailX + INNER_PAD;

          return (
            <g key={branchKey}>
              {/* Left rail node */}
              <circle
                cx={nestedLeftRailX} cy={branchWireY} r={4}
                fill={selectedNode === leftNodeId ? "#0078D4" : "black"}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMenu(e.clientX, e.clientY, leftNodeId);
                  setParentItemId(item?.id);
                  setIdforApi?.({
                    branchId: branch._id, branchIndex: branch.index,
                    ItemId: id, location: leftNodeId,
                  });
                }}
              />

              {branchBlocks.length === 0 ? (
                <line x1={nestedLeftRailX} y1={branchWireY} x2={nestedRightRailX} y2={branchWireY}
                  stroke="black" strokeWidth="1.5" strokeDasharray={dash} />
              ) : (
                <>
                  <line x1={nestedLeftRailX} y1={branchWireY} x2={blockRowLeftX} y2={branchWireY}
                    stroke="black" strokeWidth="1.5" strokeDasharray={dash} />

                  {branchBlocks.map((block, blockIdx) => {
                    const bx = blockRowLeftX + blockIdx * (BW + GAP);
                    const isLast = blockIdx === branchBlocks.length - 1;

                    return (
                      <g key={block._id ?? block.id ?? blockIdx}>
                        <RBDBlock
                          id={block._id ?? block.id}
                          type={block.type}
                          x={bx} y={blockY} wireY={branchWireY}
                          onEdit={onEditBlock || onEdit}
                          onDelete={onDeleteBlock || onDelete}
                          setIdforApi={setIdforApi}
                          blockData={block}
                          width={BW} height={BH}
                          onOpenMenu={onOpenMenu}
                          setParentItem={setParentItem}
                          setParentItemId={setParentItemId}
                          onEditBlock={onEditBlock}
                          onDeleteBlock={onDeleteBlock}
                          selectedNode={selectedNode}
                          isNested={true}
                          item={item}
                          setTargetBranchId={setTargetBranchId}
                        />

                        {!isLast && (
                          <>
                            <line x1={bx + BW} y1={branchWireY}
                              x2={bx + BW + GAP} y2={branchWireY}
                              stroke="black" strokeWidth="1.5" strokeDasharray={dash} />
                            <circle
                              cx={bx + BW + GAP / 2} cy={branchWireY} r={4}
                              fill={selectedNode === midNodeId(blockIdx) ? "#0078D4" : "black"}
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenMenu(e.clientX, e.clientY, midNodeId(blockIdx));
                                setParentItemId(item?.id);
                                setIdforApi?.({
                                  branchId: branch._id, branchIndex: branch.index,
                                  ItemId: item?.id, location: midNodeId(blockIdx),
                                });
                              }}
                            />
                          </>
                        )}

                        {isLast && (
                          <line x1={bx + BW} y1={branchWireY}
                            x2={nestedRightRailX} y2={branchWireY}
                            stroke="black" strokeWidth="1.5" strokeDasharray={dash} />
                        )}
                      </g>
                    );
                  })}
                </>
              )}

              {/* Right rail node */}
              <circle
                cx={nestedRightRailX} cy={branchWireY} r={4}
                fill={selectedNode === rightNodeId ? "#0078D4" : "black"}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMenu(e.clientX, e.clientY, branch?.blocks[0]?._id);
                  setParentItemId(item?.id);
                  setTargetBranchId(branch?._id);
                  // console.log(branch,'branch console')
                  setIdforApi({
                    branchId: branch?._id, branchIndex: branch?.index,
                    ItemId: item?.id, location: rightNodeId,
                    nested: true, targetId: branch?.blocks[0]?._id,
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
  // ────────────────────────────────────────────────────────────────────────
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
      // const missionTime = missionTime;

      // console.log("MissionTime",missionTime)
      const calculateMetrics = ({ mtbf, mttr, missionTime }) => {
        const MTBF = Number(mtbf || 0);
        const MTTR = Number(mttr || 0);
        const t = Number(missionTime || 0);

        let reliability = 0;
        let unavailability = 0;

        if (MTBF > 0 && t >= 0) {
          const r = Math.exp(-t / MTBF);
          const u = 1 - r;

          reliability = r < 1e-4 ? r.toExponential(2) : r.toFixed(7);
          unavailability = u < 1e-4 ? u.toExponential(2) : u.toFixed(7);
        }

        return { reliability, unavailability };
      };


      switch (t) {
        case 'Regular':
        case 'REGULAR': {
          const { reliability, unavailability } = calculateMetrics({
            mtbf,
            mttr,
            missionTime
          });
          // console.log("reliability1234555",reliability)
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
      <svg
        onClick={(e) => {
          // only reset if clicked directly on svg (not on child elements)
          if (e.target === e.currentTarget) {
            setSelectedId(null);
          }
        }}
      >
        <g
          onContextMenu={handleContextMenu}
          style={{ cursor: 'context-menu' }}
          onClick={() => {
            if (setParentItemId) setParentItemId(null);
            handleSelect(id);

          }}

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

          <circle cx={x} cy={y}
            fill="none" stroke="#0078d4" strokeWidth="2" strokeDasharray="4 2" />


          <rect
            x={x}
            y={y}
            width={BLOCK_W}
            height={BLOCK_H}
            fill={getBlockColor()}
            stroke={selectedId === id ? "#0078d4" : "#2a7a2a"}
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
      </svg>
    );
  }
};

export default RBDBlock;