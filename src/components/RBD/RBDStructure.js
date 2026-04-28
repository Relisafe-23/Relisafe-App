import React, { useState, useEffect, useRef } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SplitKofN from "./SplitKofN";
import Api from "../../Api";
import SubRBDModal from "./SubRBDModal.js";
import CaseSelectionModal from "./CaseSelectionModal.js";
import EditRBDConfigurationModal from "./EditRBDConfigurationModal";
import { useParams, useLocation } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { FiSettings, FiEdit2, FiSliders } from "react-icons/fi";
import { ElementParametersModal } from "./ElementParametersModal";
import { KOfNConfigModal } from "./KOfNConfigModal.js";
import SwitchConfigurationModal from "./SwitchConfig.js";
import { RBDBlock } from "./RBDBlock";
import { KOfNBlock } from "./KOfNBlock";
import { toast } from "react-toastify";
import "../../css/RBD.scss";
// import { RBDSvgRenderer } from './RBDSvgRenderer';
// import ReactFlowD from './ReactFlow/ReactFlowD.jsx';

const C = {
  TERMINAL_W: 70,
  TERMINAL_H: 40,
  TERMINAL_LEFT_X: 60,
  ARROW_W: 15,
  ARROW_H: 15,
  BLOCK_W: 60,
  BLOCK_H: 40,
  BLOCK_SPACING: 25,
  NODE_R: 5,
  NODE_SPACING: 35,
  BRANCH_MIN_H: 40,
  BRANCH_SPACING: 35,
  RAIL_PAD_X: 22,
  INNER_PAD_X: 25,
  BLOCK_GAP: 35,
  CENTER_Y: 200,
  MIN_OUTPUT_GAP: 30,
  BASE_RIGHT_X: 200,
  MIN_CANVAS_W: 800,
  MIN_CANVAS_H: 420,
};

// ── Shared layout constants (must match RBDBlock exactly) ──────────────────
const NESTED = {
  BW: 20,
  BH: 25,
  GAP: 20,
  RAIL_PAD: 15,
  INNER_PAD: 15,
  CONTAINER_PADDING: 15,
  BRANCH_SPACING: 10,
};

// Recursive: actual height of a single branch (accounts for nested parallel sections)
const getNestedBranchHeight = (branch) => {
  const branchBlocks = branch.blocks || [];
  let maxNestedH = 0;

  branchBlocks.forEach((block) => {
    if (
      (block.type === "Parallel Section" ||
        block.elementType === "Parallel Section") &&
      block.branches?.length > 0
    ) {
      const nestedH =
        block.branches.reduce((sum, nb) => {
          return sum + getNestedBranchHeight(nb) + NESTED.BRANCH_SPACING;
        }, 0) +
        NESTED.BH +
        NESTED.CONTAINER_PADDING * 2;
      maxNestedH = Math.max(maxNestedH, nestedH);
    }
  });

  return maxNestedH > 0 ? maxNestedH : NESTED.BH + 40;
};

// Total height of a nested parallel section block
const getNestedParallelSectionHeight = (block) => {
  const branches = block.branches || [];
  if (!branches.length) return NESTED.BH + 40;

  const branchHeights = branches.map((b) => getNestedBranchHeight(b));
  let runningY = NESTED.CONTAINER_PADDING + NESTED.BH / 2;
  branchHeights.forEach((h) => {
    runningY += h + NESTED.BRANCH_SPACING;
  });
  return runningY + NESTED.BH / 2 + NESTED.CONTAINER_PADDING;
};

// Width of a nested parallel section block
const getNestedParallelSectionWidth = (block) => {
  const branches = block.branches || [];
  const maxBranchW =
    branches.length > 0
      ? Math.max(
        ...branches.map((br) => {
          const branchBlocks = br.blocks || [];
          let totalW = 0;
          branchBlocks.forEach((b, idx) => {
            if (
              (b.type === "Parallel Section" ||
                b.elementType === "Parallel Section") &&
              b.branches?.length > 0
            ) {
              totalW +=
                getNestedParallelSectionWidth(b) + (idx > 0 ? NESTED.GAP : 0);
            } else {
              totalW += NESTED.BW + (idx > 0 ? NESTED.GAP : 0);
            }
          });
          return Math.max(totalW, NESTED.BW);
        }),
      )
      : NESTED.BW;

  const innerW = NESTED.INNER_PAD + maxBranchW + NESTED.INNER_PAD;
  return Math.max(
    NESTED.BW * 3,
    NESTED.RAIL_PAD * 2 + innerW + NESTED.CONTAINER_PADDING * 2,
  );
};

// const branchHeight = (branch) => {
//   let height = C.BRANCH_MIN_H;

//   // Check for nested parallel sections
//   if (branch.blocks) {
//     branch.blocks.forEach(block => {
//       if ((block.type === 'Parallel Section' || block.elementType === 'Parallel Section') && block.branches) {
//         // Calculate height needed for nested parallel section
//         const nestedBranches = block.branches;
//         const nestedHeight = nestedBranches.length * 70 + 40; // 70 is ROW_STEP, 40 is padding
//         height = Math.max(height, nestedHeight);
//       }
//     });
//   }

//   return height;
// };

// Height of one outer branch (used by BiDirectionalSymbol)
const branchHeight = (branch) => {
  let height = C.BRANCH_MIN_H;
  if (branch.blocks) {
    branch.blocks.forEach((block) => {
      if (
        (block.type === "Parallel Section" ||
          block.elementType === "Parallel Section") &&
        block.branches
      ) {
        const nestedH = getNestedParallelSectionHeight(block);
        height = Math.max(height, nestedH);
      }
    });
  }
  return Math.max(height, C.BRANCH_MIN_H);
};

// const sectionTotalHeight = (branches) => {
//   if (!branches || branches.length === 0) return C.BRANCH_MIN_H;
//   return branches.reduce((acc, br) => acc + branchHeight(br), 0)
//     + Math.max(0, branches.length - 1) * C.BRANCH_SPACING;
// };

// Fix sectionTotalHeight to use corrected branchHeight
const sectionTotalHeight = (branches) => {
  if (!branches || branches.length === 0) return C.BRANCH_MIN_H;
  return (
    branches.reduce((acc, br) => acc + branchHeight(br), 0) +
    Math.max(0, branches.length - 1) * C.BRANCH_SPACING
  );
};

// const sectionWidth = (block) => {
//   const branches = block.branches || [];
//   const leftGrowth = block.leftGrowth || 0;
//   if (!branches.length) return 160 + leftGrowth;
//   const maxBlocks = Math.max(...branches.map(br => (br.blocks || []).length));
//   const innerW = maxBlocks > 0
//     ? C.INNER_PAD_X + maxBlocks * C.BLOCK_W + (maxBlocks - 1) * C.BLOCK_GAP + C.INNER_PAD_X
//     : C.INNER_PAD_X * 2 + 40;
//   return C.RAIL_PAD_X * 2 + innerW + leftGrowth;
// };

// Fix sectionWidth to account for nested parallel section widths
const sectionWidth = (block) => {
  const branches = block.branches || [];
  const leftGrowth = block.leftGrowth || 0;
  if (!branches.length) return 160 + leftGrowth;

  const maxBranchW = Math.max(
    ...branches.map((br) => {
      const branchBlocks = br.blocks || [];
      let width = 0;
      branchBlocks.forEach((b, idx) => {
        if (
          (b.type === "Parallel Section" ||
            b.elementType === "Parallel Section") &&
          b.branches
        ) {
          width +=
            getNestedParallelSectionWidth(b) + (idx > 0 ? C.BLOCK_GAP : 0);
        } else {
          width += C.BLOCK_W + (idx > 0 ? C.BLOCK_GAP : 0);
        }
      });
      return Math.max(width, C.BLOCK_W);
    }),
  );

  const innerW = C.INNER_PAD_X + maxBranchW + C.INNER_PAD_X;
  return C.RAIL_PAD_X * 2 + innerW + leftGrowth;
};

// const branchCenterY = (branches, idx, secTopY) => {
//   let y = secTopY;
//   for (let i = 0; i < idx; i++) {
//     // Calculate actual height for each branch including nested sections
//     const branch = branches[i];
//     let branchHeight = C.BRANCH_MIN_H;

//     // Check if branch has any nested parallel sections
//     if (branch.blocks) {
//       branch.blocks.forEach(block => {
//         if ((block.type === 'Parallel Section' || block.elementType === 'Parallel Section') && block.branches) {
//           // Calculate height needed for nested parallel section
//           const nestedBranches = block.branches;
//           const nestedHeight = nestedBranches.length * 70 + 40; // 70 is ROW_STEP, 40 is padding
//           branchHeight = Math.max(branchHeight, nestedHeight);
//         }
//       });
//     }

//     y += branchHeight + C.BRANCH_SPACING;
//   }
//   return y + (branchHeight(branches[idx]) / 2);
// };

// Fix branchCenterY to use the corrected branchHeight function
const branchCenterY = (branches, idx, secTopY) => {
  let y = secTopY;
  for (let i = 0; i < idx; i++) {
    y += branchHeight(branches[i]) + C.BRANCH_SPACING;
  }
  return y + branchHeight(branches[idx]) / 2;
};

// ─── InsertionNode (dot with + cross) ─────────────────────────────────────────
const InsertNode = ({
  cx,
  cy,
  nodeId,
  selectedNode,
  onOpenMenu,
  r = C.NODE_R,
  id,
}) => {
  const isSel = selectedNode === nodeId;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onOpenMenu(e.clientX, e.clientY, id);
      }}>
      {isSel && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 4}
          fill="none"
          stroke="#0078d4"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r + 1}
        fill={isSel ? "#0078d4" : "black"}
        style={{ cursor: "pointer" }}
      />
      <line
        x1={cx - 3}
        y1={cy}
        x2={cx + 3}
        y2={cy}
        stroke="white"
        strokeWidth="1.5"
      />
      <line
        x1={cx}
        y1={cy - 3}
        x2={cx}
        y2={cy + 3}
        stroke="white"
        strokeWidth="1.5"
      />
    </g>
  );
};

// ─── BiDirectionalSymbol ──────────────────────────────────────────────────────
export const BiDirectionalSymbol = ({
  onNodeClick,
  setParentItem,
  setParentItemId,
  setTargetBranchId,
  onOpenMenu,
  blocks,
  onDeleteBlock,
  onEditBlock,
  selectedNode,
  setIdforApi,
}) => {
  const location = useLocation();

  const missionTime = location.state?.missionTime;
  const [mission, setMission] = useState("");
  const [rbdList, setRbdList] = useState([]);
  const { id, rbdId } = useParams();
  const projectId = id;
  // top-level blocks only (excludes nested parallel branches)
  const topLevel = blocks.filter(
    (b) => b.type === "Parallel Section" || !b.data?.parentSection,
  );
  // ── layout ─────────────────────────────────────────────────────────────────
  const calculateLayout = () => {
    if (topLevel.length === 0) {
      const cx = (C.TERMINAL_LEFT_X + C.TERMINAL_W + C.BASE_RIGHT_X) / 2;
      return {
        items: [],
        startX: cx,
        rightBoxX: C.BASE_RIGHT_X,
        canvasH: C.MIN_CANVAS_H,
        svgW: C.MIN_CANVAS_W,
      };
    }

    // First, calculate widths of all items
    const itemWidths = topLevel.map((b) => {
      if (b.type === "Parallel Section") {
        return sectionWidth(b);
      }
      return C.BLOCK_W;
    });

    // Calculate total width needed
    const totalItemsWidth = itemWidths.reduce((sum, w) => sum + w, 0);
    const totalNodesWidth = (topLevel.length * 2 + 1) * C.NODE_SPACING;
    const totalGapsWidth = (topLevel.length - 1) * C.BLOCK_SPACING;
    const totalNeeded = totalItemsWidth + totalNodesWidth + totalGapsWidth;

    // Calculate required canvas width
    const reqRightX =
      C.TERMINAL_LEFT_X +
      C.TERMINAL_W +
      totalNeeded +
      C.MIN_OUTPUT_GAP +
      C.TERMINAL_W;
    const rightBoxX = Math.max(C.BASE_RIGHT_X, reqRightX);

    // Calculate available space and starting X
    const available = rightBoxX - C.TERMINAL_LEFT_X - C.TERMINAL_W * 2;
    const startX =
      C.TERMINAL_LEFT_X +
      C.TERMINAL_W +
      (available - totalNeeded) / 2 +
      C.NODE_SPACING;

    const items = [];
    let curX = startX;
    let nodeIdx = 0;
    let maxY = C.CENTER_Y + 150;

    // First insertion node
    items.push({
      type: "node",
      id: "node-start",
      x: curX,
      y: C.CENTER_Y,
      nodeIndex: nodeIdx++,
    });
    curX += C.NODE_SPACING;

    // Place each block with consistent spacing
    topLevel.forEach((block, index) => {
      if (block.type === "Parallel Section") {
        const branches = block.branches || [];
        const dynW = sectionWidth(block);
        const totalH = sectionTotalHeight(branches);
        const secTopY = C.CENTER_Y - totalH / 2;

        if (secTopY + totalH + 40 > maxY) maxY = secTopY + totalH + 60;

        const rightX = curX + dynW;
        const leftGrowth = block.leftGrowth || 0;

        items.push({
          type: "parallel-section",
          id: block.id,
          blockData: block,
          x: curX - leftGrowth,
          rightX,
          secTopY,
          width: dynW,
          totalH,
          branches,
        });
        curX += dynW + C.BLOCK_SPACING;
      } else {
        items.push({
          type: "block",
          id: block.id,
          blockType: block.type,
          blockData: block,
          x: curX,
          y: C.CENTER_Y - C.BLOCK_H / 2,
        });
        curX += C.BLOCK_W + C.BLOCK_SPACING;
      }

      // Add node after block (except for the last one)
      items.push({
        type: "node",
        id: `node-${block.id}`,
        RelateId: `${block.id}`,
        x: curX,
        y: C.CENTER_Y,
        nodeIndex: nodeIdx++,
      });
      curX += C.NODE_SPACING;
    });

    const canvasH = Math.max(C.MIN_CANVAS_H, maxY + 50);
    const svgW = Math.max(C.MIN_CANVAS_W, rightBoxX + 100);

    return { items, startX, rightBoxX, canvasH, svgW };
  };
  // ── wire segments ───────────────────────────────────────────────────────────
  const buildWireLines = (items, rightBoxX) => {
    const lines = [];
    if (items.length === 0) {
      lines.push({
        x1: C.TERMINAL_LEFT_X + C.TERMINAL_W,
        x2: rightBoxX,
        y: C.CENTER_Y,
      });
      return lines;
    }
    lines.push({
      x1: C.TERMINAL_LEFT_X + C.TERMINAL_W,
      x2: items[0].x - C.NODE_R,
      y: C.CENTER_Y,
    });

    for (let i = 0; i < items.length - 1; i++) {
      const cur = items[i];
      const next = items[i + 1];
      const fx =
        cur.type === "parallel-section"
          ? cur.rightX
          : cur.type === "block"
            ? cur.x + C.BLOCK_W
            : cur.x + C.NODE_R;
      const tx =
        next.type === "block" || next.type === "parallel-section"
          ? next.x
          : next.x - C.NODE_R;
      if (fx < tx) lines.push({ x1: fx, x2: tx, y: C.CENTER_Y });
    }

    const last = items[items.length - 1];
    const lastX =
      last.type === "parallel-section"
        ? last.rightX
        : last.type === "block"
          ? last.x + C.BLOCK_W
          : last.x + C.NODE_R;
    const endX = Math.min(lastX + 20, rightBoxX - C.MIN_OUTPUT_GAP);
    lines.push({ x1: lastX, x2: endX, y: C.CENTER_Y });
    lines.push({ x1: endX, x2: rightBoxX, y: C.CENTER_Y });
    return lines;
  };
  const renderParallelSection = (item) => {
    const { x, rightX, branches, id, blockData, width: dynW, secTopY } = item;
    if (!branches || branches.length === 0) return null;

    const leftRailX = x + C.RAIL_PAD_X;
    // rightRailX is derived from the FIXED rightX anchor — never shifts
    const rightRailX = rightX - C.RAIL_PAD_X + 20;

    const railTop = branchCenterY(branches, 0, secTopY);
    const railBottom = branchCenterY(branches, branches.length - 1, secTopY);

    return (
      <g key={id}>
        {/* <text
          x={x + dynW / 2}
          y={secTopY}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize="9"
          fontWeight="bold"
          fill="#333"
        >
          K={blockData?.k || 1}:N={branches.length}
        </text> */}

        <line
          x1={leftRailX}
          y1={railTop}
          x2={leftRailX}
          y2={railBottom}
          stroke="black"
          strokeWidth="2"
        />
        <line
          x1={rightRailX}
          y1={railTop}
          x2={rightRailX}
          y2={railBottom}
          stroke="black"
          strokeWidth="2"
        />

        {branches.map((branch, idx) => {
          const wireY = branchCenterY(branches, idx, secTopY);
          const branchBlocks = branch.blocks || [];
          const isMain = idx === 0;
          const dash = isMain ? undefined : "5,3";

          const branchKey = branch._id ?? branch.id ?? idx;
          const leftNodeId = `branch-${branchKey}-left`;
          const rightNodeId = `branch-${branchKey}-right`;
          const midNodeId = (bIdx) => `branch-${branchKey}-mid-${bIdx}`;

          // ── block positions: left-aligned from leftRailX + INNER_PAD_X ──
          // leftGrowth is already baked into x (sectionX shifted left in layout),
          // so leftRailX naturally shifts left. All branches use fixed INNER_PAD_X.
          // Add LEFT  → leftRailX moves left by STEP, new block appears at leftRailX+pad ✅
          // Add RIGHT → rightRailX grows right, existing blocks unchanged ✅
          const blockRowLeftX = leftRailX + C.INNER_PAD_X;

          // return (
          //   <g key={branch._id ?? branch.id ?? idx}>

          //     <InsertNode cx={leftRailX} cy={wireY} nodeId={leftNodeId}
          //       selectedNode={selectedNode} onOpenMenu={onOpenMenu} r={4} />

          //     {branchBlocks.length === 0 ? (
          //       <line x1={leftRailX} y1={wireY} x2={rightRailX} y2={wireY}
          //         stroke="black" strokeWidth="2" strokeDasharray={dash} />
          //     ) : (
          //       <>
          //         {/* wire: left rail → first block (stretches as section grows) */}
          //         <line x1={leftRailX} y1={wireY} x2={blockRowLeftX} y2={wireY}
          //           stroke="black" strokeWidth="2" strokeDasharray={dash} />

          //         {branchBlocks.map((block, bIdx) => {
          //           const bx     = blockRowLeftX + bIdx * (C.BLOCK_W + C.BLOCK_GAP);
          //           const isLast = bIdx === branchBlocks.length - 1;

          //           return (
          //             <g
          //               key={block._id ?? block.id ?? bIdx}
          //               onClick={() => { setParentItem(item); setParentItemId(item?.id); }}
          //               onContextMenu={(e) => {
          //                 e.preventDefault(); e.stopPropagation();
          //                 setParentItem(item); setParentItemId(item?.id);
          //               }}
          //             >
          //               <RBDBlock
          //                 id={block._id ?? block.id}
          //                 type={block.type}
          //                 x={bx}
          //                 y={wireY - C.BLOCK_H / 2}
          //                 onEdit={onEditBlock}
          //                 onDelete={onDeleteBlock}
          //                 setIdforApi={setIdforApi}
          //                 blockData={block}
          //                 width={C.BLOCK_W}
          //                 height={C.BLOCK_H}
          //               />

          //               {!isLast && (
          //                 <>
          //                   <line
          //                     x1={bx + C.BLOCK_W} y1={wireY}
          //                     x2={bx + C.BLOCK_W + C.BLOCK_GAP} y2={wireY}
          //                     stroke="black" strokeWidth="2" strokeDasharray={dash}
          //                   />
          //                   <InsertNode
          //                     cx={bx + C.BLOCK_W + C.BLOCK_GAP / 2} cy={wireY}
          //                     nodeId={midNodeId(bIdx)}
          //                     selectedNode={selectedNode} onOpenMenu={onOpenMenu} r={4}
          //                   />
          //                 </>
          //               )}

          //               {/* wire: last block → right rail (always INNER_PAD_X gap) */}
          //               {isLast && (
          //                 <line
          //                   x1={bx + C.BLOCK_W} y1={wireY}
          //                   x2={rightRailX} y2={wireY}
          //                   stroke="black" strokeWidth="2" strokeDasharray={dash}
          //                 />
          //               )}
          //             </g>
          //           );
          //         })}
          //       </>
          //     )}

          //     <InsertNode cx={rightRailX} cy={wireY} nodeId={rightNodeId}
          //       selectedNode={selectedNode} onOpenMenu={onOpenMenu} r={4} />

          //   </g>
          // );

          return (
            <g key={branch._id ?? branch.id ?? idx}>
              {/* LEFT NODE */}
              <circle
                cx={leftRailX}
                cy={wireY}
                r={4}
                fill={selectedNode === leftNodeId ? "#0078d4" : "black"}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMenu(e.clientX, e.clientY, branch?.index);
                  setIdforApi({
                    branchId: branch?._id,
                    branchIndex: branch?.index,
                    ItemId: item?.id,
                    location: `branch-${branch?.index}-left`,
                  });
                }}
              />

              {branchBlocks.length === 0 ? (
                <line
                  x1={leftRailX}
                  y1={wireY}
                  x2={rightRailX}
                  y2={wireY}
                  stroke="black"
                  strokeWidth="2"
                  strokeDasharray={dash}
                />
              ) : (
                <>
                  {/* LEFT RAIL → FIRST BLOCK */}
                  <line
                    x1={leftRailX}
                    y1={wireY}
                    x2={blockRowLeftX}
                    y2={wireY}
                    stroke="black"
                    strokeWidth="2"
                    strokeDasharray={dash}
                  />

                  {branchBlocks.map((block, bIdx) => {
                    const bx = blockRowLeftX + bIdx * (C.BLOCK_W + C.BLOCK_GAP);
                    const isLast = bIdx === branchBlocks.length - 1;

                    return (
                      <g
                        key={block._id ?? block.id ?? bIdx}
                        onClick={() => {
                          setParentItem(item);
                          setParentItemId(item?.id);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setParentItem(item);
                          setParentItemId(item?.id);
                        }}
                      >
                        {/* LEFT NODE */}
                        <circle
                          cx={leftRailX}
                          cy={wireY}
                          r={4}
                          fill={
                            selectedNode === leftNodeId ? "#0078d4" : "black"
                          }
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMenu(e.clientX, e.clientY, branch?._id);
                            setIdforApi({
                              branchId: branch?._id,
                              branchIndex: branch?.index,
                              ItemId: item?.id,
                              location: `branch-${branch?.index}-left`,
                            });
                          }}
                        />
                        <RBDBlock
                          id={block._id ?? block.id}
                          setParentItemId={setParentItemId}
                          type={block.type}
                          setTargetBranchId={setTargetBranchId}
                          item={item}
                          leftRailX={leftRailX}
                          rightRailX={rightRailX}
                          wireY={wireY} // ← ADD THIS — nested parallel section uses it to center itself
                          selectedNode={selectedNode}
                          leftNodeId={leftNodeId}
                          rightNodeId={rightNodeId}
                          x={bx}
                          y={wireY - C.BLOCK_H / 2} // ← ENSURE this is wireY - half, not just wireY
                          onEdit={onEditBlock}
                          onDelete={onDeleteBlock}
                          setIdforApi={setIdforApi}
                          blockData={block}
                          width={C.BLOCK_W}
                          height={C.BLOCK_H}
                          onOpenMenu={onOpenMenu}
                        />

                        {/* RIGHT NODE */}
                        {/* {!isLast &&
                          <circle
                            cx={rightRailX}
                            cy={wireY}
                            r={4}
                            fill={selectedNode === rightNodeId ? "#0078d4" : "black"}
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenMenu(e.clientX, e.clientY, branch.index);
                              // console.log(branch?._id, '1')
                              // console.log(branch?.index, '2')
                              // console.log(item?.id, '3')
                              // console.log(`branch-${branch.index}-right`, '4')
                              setIdforApi({
                                branchId: branch?._id,
                                branchIndex: branch?.index,
                                ItemId: item?.id,
                                location: `branch-${branch.index}-right`
                              });
                            }}
                          />
                        } */}

                        {/* BETWEEN BLOCKS */}
                        {/* {!isLast && ( */}
                        <>
                          <line
                            x1={bx + C.BLOCK_W}
                            y1={wireY}
                            x2={bx + C.BLOCK_W + C.BLOCK_GAP}
                            y2={wireY}
                            stroke="black"
                            strokeWidth="2"
                            strokeDasharray={dash}
                          />

                          {/* MID NODE */}
                          <circle
                            cx={bx + C.BLOCK_W + C.BLOCK_GAP / 2}
                            cy={wireY}
                            r={4}
                            fill={
                              selectedNode === midNodeId(bIdx)
                                ? "#0078d4"
                                : "black"
                            }
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const id = midNodeId(bIdx);
                              onOpenMenu(
                                e.clientX,
                                e.clientY,
                                branch?._id,
                                `${branch.blocks[0]._id} ,parallel`,
                              );
                              // setIdforApi({
                              //   branchId: branch?._id,
                              //   branchIndex: branch?.index,
                              //   ItemId: item?.id,
                              //   location: id,
                              // });
                              // console.log(branch?._id, '1')
                              // console.log(branch?.index, '2')
                              // console.log(item?.id, '3')
                              // console.log(`branch-${branch?.index}-right`, '4')
                              setParentItemId(item?.id);
                              setIdforApi({
                                branchId: branch?._id,
                                branchIndex: branch?.index,
                                ItemId: item?.id,
                                location: `branch-${branch?._id}-right`,
                              });
                            }}
                          />
                        </>
                        {/* )} */}

                        {/* LAST BLOCK → RIGHT */}
                        {isLast && (
                          <line
                            x1={bx + C.BLOCK_W}
                            y1={wireY}
                            x2={rightRailX}
                            y2={wireY}
                            stroke="black"
                            strokeWidth="2"
                            strokeDasharray={dash}
                          />
                        )}
                      </g>
                    );
                  })}
                </>
              )}
            </g>
          );
        })}
      </g>
    );
  };
  // ── assemble ────────────────────────────────────────────────────────────────
  const layout = calculateLayout();
  const { items, startX, rightBoxX, canvasH, svgW } = layout;
  const wireLines = buildWireLines(items, rightBoxX);
  const leftArrow = [
    [C.TERMINAL_LEFT_X + C.TERMINAL_W, C.CENTER_Y - C.ARROW_H / 2],
    [C.TERMINAL_LEFT_X + C.TERMINAL_W - C.ARROW_W, C.CENTER_Y],
    [C.TERMINAL_LEFT_X + C.TERMINAL_W, C.CENTER_Y + C.ARROW_H / 2],
  ]
    .map((p) => p.join(","))
    .join(" ");
  const rightArrow = [
    [rightBoxX, C.CENTER_Y - C.ARROW_H / 2],
    [rightBoxX + C.ARROW_W, C.CENTER_Y],
    [rightBoxX, C.CENTER_Y + C.ARROW_H / 2],
  ]
    .map((p) => p.join(","))
    .join(" ");

  return (
    <svg
      width={svgW}
      height={canvasH}
      viewBox={`0 0 ${svgW} ${canvasH}`}
      style={{ overflow: "visible" }}
    >
      {/* main wire */}
      {wireLines.map((seg, i) => (
        <>
          <line
            key={`w${i}`}
            x1={seg.x1}
            y1={seg.y}
            x2={seg.x2}
            y2={seg.y}
            stroke="black"
            strokeWidth="2"
          />
        </>
      ))}

      {/* Input terminal */}
      <g onClick={() => onNodeClick?.("LEFT")} style={{ cursor: "pointer" }}>
        <rect
          x={C.TERMINAL_LEFT_X}
          y={C.CENTER_Y - C.TERMINAL_H / 2}
          width={C.TERMINAL_W}
          height={C.TERMINAL_H}
          fill="black"
        />
        <polygon points={leftArrow} fill="white" />
        <text
          x={C.TERMINAL_LEFT_X + C.TERMINAL_W / 2}
          y={C.CENTER_Y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="9"
          fontWeight="bold"
        >
          Input
        </text>
      </g>

      {/* Output terminal */}
      <g onClick={() => onNodeClick?.("RIGHT")} style={{ cursor: "pointer" }}>
        <rect
          x={rightBoxX}
          y={C.CENTER_Y - C.TERMINAL_H / 2}
          width={C.TERMINAL_W}
          height={C.TERMINAL_H}
          fill="black"
        />
        <polygon points={rightArrow} fill="white" />
        <text
          x={rightBoxX + C.TERMINAL_W / 2}
          y={C.CENTER_Y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="9"
          fontWeight="bold"
        >
          Output
        </text>
      </g>

      {/* items */}
      {items.map((item) => {
        if (item.type === "node") {
          return (
            <>
              <InsertNode
                key={item.id}
                id={item.RelateId}
                cx={item.x}
                cy={item.y}
                nodeId={item.nodeIndex}
                selectedNode={selectedNode}
                onOpenMenu={onOpenMenu}
              />
              {/* {console.log(item, 'item')} */}
            </>
          );
        }
        if (item.type === "parallel-section")
          return renderParallelSection(item);
        if (item.type === "block") {
          return (
            <RBDBlock
              key={item.id}
              id={item.id}
              type={item.blockType}
              x={item.x}
              y={item.y}
              setParentItemId={setParentItemId}
              onEdit={onEditBlock}
              onDelete={onDeleteBlock}
              blockData={item.blockData}
              mission={missionTime}
              width={C.BLOCK_W}
              height={C.BLOCK_H}
            />
          );
        }
        return null;
      })}

      {/* empty diagram single node */}
      {blocks.length === 0 && (
        <InsertNode
          cx={startX}
          cy={C.CENTER_Y}
          nodeId={0}
          selectedNode={selectedNode}
          onOpenMenu={onOpenMenu}
        />
      )}
    </svg>
  );
};

// ─── Context Menus ────────────────────────────────────────────────────────────

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
      width: "180px",
    }}
    onMouseLeave={onClose}
  >
    {[
      "Add Regular",
      "Add K-out-of-N",
      "Add SubRBD",
      "Add Parallel Section",
      "Add Parallel Branch",
    ].map((item) => (
      <div
        key={item}
        onClick={() => {
          onSelect(item);
          onClose();
        }}
        style={{ padding: "8px", cursor: "pointer" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#f0f0f0")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        {item}
      </div>
    ))}
  </div>
);

export const BlockContextMenu = ({
  x,
  y,
  setParallelFoundBlock,
  onSelect,
  onClose,
}) => (
  <div
    style={{
      position: "fixed",
      top: y,
      left: x,
      background: "#fff",
      border: "1px solid #ccc",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 1001,
      width: "180px",
    }}
    onMouseLeave={onClose}
  >
    {[
      "Edit...",
      "Delete...",
      "Split K-out-of-N...",
      // "Add Regular",
      // "Add K-out-of-N",
      // "Add SubRBD",
      // "Add Parallel Section",
      // "Add Parallel Branch",
    ].map((item) => (
      <div
        key={item}
        onClick={() => {
          setParallelFoundBlock?.(null);
          onSelect(item);
          onClose();
        }}
        style={{ padding: "8px", cursor: "pointer" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#f0f0f0")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        {item}
      </div>
    ))}
  </div>
);

// ─── RBDButton ────────────────────────────────────────────────────────────────

export default function RBDButton() {
  const { id, rbdId } = useParams();
  const projectId = id;

  const [parallelBranchMode, setParallelBranchMode] = useState({
    active: false,
    startNode: null,
    endNode: null,
  });

  const parallelBranchModeRef = useRef(parallelBranchMode);

  const [showSymbol, setShowSymbol] = useState(false);
  const [menu, setMenu] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [innerTargetId, setInnerTargetId] = useState(null);
  const [targtBranchId, setTargetBranchId] = useState(null);

  // setTargetBranchId()

  const [rbdList, setRbdList] = useState([]);
  const [blockMenu, setBlockMenu] = useState({
    open: false,
    parentId: null,
    blockId: null,
    x: 0,
    y: 0,
  });
  const [blocks, setBlocks] = useState([]);
  console.log(blocks)
  const [nextId, setNextId] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [idforApi, setIdforApi] = useState({
    branchId: null,
    branchIndex: null,
    ItemId: null,
    location: null,
    nested: false,
    targetId: null,
  });
  const [rbdListModal, setRbdListModal] = useState({
    open: false,
    nodeIndex: null,
    blockId: null,
    mode: "add",
    selectedRbd: null,
  });
  const [clickedNodeInfo, setClickedNodeInfo] = useState({
    index: null,
    x: 0,
    y: 0,
  });
  const [loadChange, setLoadChange] = useState(false);
  const [parentItem, setParentItem] = useState(null);
  const [parentItemId, setParentItemId] = useState(null);
  const [elementModal, setElementModal] = useState({
    open: false,
    mode: "add",
    blockId: null,
    blockType: "",
    nodeIndex: null,
    idforApi: null,
  });
  const [kOfNModal, setKOfNModal] = useState({
    open: false,
    blockId: null,
    initialData: null,
    mode: "add",
    nodeIndex: null,
  });
  const [totalUnavailability, setTotalUnavailability] = useState(0);
  const [totalReliability, setTotalReliability] = useState(0);
  const [showParallelModal, setShowParallelModal] = useState(false);
  const [branchCount, setBranchCount] = useState(3);
  const [pendingAction, setPendingAction] = useState(null);
  const [parallelFoundBlock, setParallelFoundBlock] = useState(null);
  const [switchModal, setSwitchModal] = useState({
    open: false,
    blockId: null,
    initialData: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // console.log(idforApi, 'idforApi from rbd nested')
  // console.log(targetId, 'targetId')


  // ── zoom / pan state ───────────────────────────────────────────────────────
  // const [open, setOpen] = useState(false);
  // const [selectedCase, setSelectedCase] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });


  // ── canvas container ref (needed to block native scroll) ──────────────────

  const canvasRef = useRef(null);

  // Block native wheel scroll on the canvas so our zoom handler takes over
  // useEffect(() => {
  //   const el = canvasRef.current;
  //   if (!el) return;
  //   const prevent = (e) => e.preventDefault();
  //   el.addEventListener("wheel", prevent, { passive: false });
  //   return () => el.removeEventListener("wheel", prevent);
  // }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const prevent = (e) => {
      if (e.ctrlKey) e.preventDefault(); // only block when zooming
    };

    el.addEventListener("wheel", prevent, { passive: false });

    return () => el.removeEventListener("wheel", prevent);
  }, []);

  // ── zoom / pan handlers ────────────────────────────────────────────────────
  const handleWheelScroll = (e) => {
    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoomLevel * zoomFactor, 0.1), 5);

    // Zoom toward the mouse cursor position
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setPanOffset((prev) => ({
      x: mouseX - (mouseX - prev.x) * (newZoom / zoomLevel),
      y: mouseY - (mouseY - prev.y) * (newZoom / zoomLevel),
    }));

    setZoomLevel(newZoom);
  };

  // const handleWheelScroll = (e) => {
  //   if (!e.ctrlKey) return; // ✅ only zoom when Ctrl + scroll

  //   e.preventDefault();

  //   const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

  //   setZoomLevel((prev) => {
  //     let newZoom = prev * zoomFactor;
  //     return Math.min(Math.max(newZoom, 0.1), 5);
  //   });
  // };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ── zoom control helpers ───────────────────────────────────────────────────
  const handleZoomIn = () =>
    setZoomLevel((z) => Math.min(z * 1.2, 5));

  const handleZoomOut = () =>
    setZoomLevel((z) => Math.max(z * 0.8, 0.1));

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };





  const [listedRBDs, setListedRBDs] = useState([]);
  useEffect(() => {
    getBlock();
  }, [rbdId, projectId, elementModal?.open, loadChange]);

  // Add a useEffect to recalculate layout when blocks change
  useEffect(() => {
    if (showSymbol && blocks.length > 0) {
      // Force re-render of the SVG by updating a key
      setLayoutKey((prev) => prev + 1);
    }
  }, [blocks]);

  // Add state for layout key
  const [layoutKey, setLayoutKey] = useState(0);

  console.log("Layout.......... : ", layoutKey);

  // Fetch RBD list for SubRBD selection
  useEffect(() => {
    if (projectId) {
      Api.get("/api/v1/EditConfigRBD/", {
        params: {
          projectId: projectId,
        },
      })
        .then((res) => {
          setRbdList(res.data.data || []);
        })
        .catch((error) => {
          console.error("Error fetching RBD list:", error);
        });
    }
  }, [projectId]);

  // Get API for current the blocks
  const [rbdConfig, setRbdConfig] = useState({
    rbdTitle: "My RBD",
    missionTime: 24,
    displayUpper: "Part number",
    displayLower: "MTBF",
    printRemarks: "Yes",
  });
  const location = useLocation();

  useEffect(() => {
    getBlock();
  }, [rbdId, projectId, loadChange]);


  const getBlock = () => {
    Api.get(`/api/v1/elementParametersRBD/getRBD/${rbdId}/${projectId}`)
      .then((res) => {
        const data = res.data.data;

        // console.log("API Response:", data);

        setShowSymbol(data.length > 0);
        setBlocks(data);

        // Recursive function to compute reliability for any block or parallel section
        const computeReliability = (item) => {
          // Check if this is a parallel section (has arrangement "horizontal" and branches)
          if (item.arrangement === "horizontal" && item.branches && item.branches.length > 0) {
            // console.log("Found Parallel Section:", {
            //   id: item._id,
            //   isNested: item.isNested,
            //   branchCount: item.branches.length,
            //   k: item.k,
            //   n: item.n
            // });

            // Calculate reliability for parallel section
            return computeParallelSectionReliability(item.branches);
          }

          // Regular block - return its reliability
          const reliability = Number(item.reliability);
          // console.log("Regular Block:", {
          //   id: item._id,
          //   reliability: reliability,
          //   isNested: item.isNested
          // });
          return isNaN(reliability) ? 1 : reliability;
        };

        // Function to compute parallel section reliability from branches
        const computeParallelSectionReliability = (branches) => {
          if (!branches || branches.length === 0) {
            console.log("No branches found, returning 1");
            return 1;
          }

          // console.log(`Computing Parallel Section with ${branches.length} branches`);

          // Calculate reliability for each branch (series of blocks in that branch)
          const branchReliabilities = branches.map((branch, idx) => {
            // console.log(`Branch ${idx + 1}:`, branch);
            return computeBranchReliability(branch);
          });

          // console.log("Branch Reliabilities:", branchReliabilities);

          // For parallel system: 1 - Π(1 - R_i)
          const productOfUnavailabilities = branchReliabilities.reduce(
            (acc, r) => acc * (1 - r),
            1
          );

          const parallelReliability = 1 - productOfUnavailabilities;
          // console.log("Parallel Section Reliability:", parallelReliability);

          return parallelReliability;
        };

        // Function to compute branch reliability (series of blocks)
        const computeBranchReliability = (branch) => {
          if (!branch.blocks || branch.blocks.length === 0) {
            // console.log("Branch has no blocks, returning 1");
            return 1;
          }

          // console.log(`Computing Branch with ${branch.blocks.length} blocks`);

          // Calculate reliability for each block in the branch
          const blockReliabilities = branch.blocks.map((block, idx) => {
            // console.log(`Block ${idx + 1} in branch:`, block);

            // Check if this block is a nested parallel section
            if (block.arrangement === "horizontal" && block.branches && block.branches.length > 0) {
              // console.log(`Block ${idx + 1} is a NESTED Parallel Section (isNested: ${block.isNested})`);
              // Recursively compute nested parallel section
              return computeParallelSectionReliability(block.branches);
            }

            // Regular block
            const reliability = Number(block.reliability);
            // console.log(`Block ${idx + 1} is Regular Block, Reliability:`, reliability);
            return isNaN(reliability) ? 1 : reliability;
          });

          // console.log("Block Reliabilities in branch:", blockReliabilities);

          // For series system: R = R1 * R2 * ... * Rn
          const seriesReliability = blockReliabilities.reduce((acc, r) => acc * r, 1);
          // console.log("Branch Series Reliability:", seriesReliability);

          return seriesReliability;
        };

        // Recursive function to log the complete structure
        const logStructure = (item, depth = 0, type = "Top Level") => {
          const indent = "  ".repeat(depth);

          if (item.arrangement === "horizontal" && item.branches) {
            // console.log(`${indent}[${type}] PARALLEL SECTION - K=${item.k || 1}, N=${item.n || item.branches.length}, isNested: ${item.isNested || false}`);

            item.branches.forEach((branch, bi) => {
              // console.log(`${indent}  └─ Branch ${bi + 1} (index: ${branch.index})`);

              if (branch.blocks && branch.blocks.length > 0) {
                branch.blocks.forEach((block, blkIdx) => {
                  if (block.arrangement === "horizontal" && block.branches) {
                    // console.log(`${indent}      └─ Block ${blkIdx + 1}: NESTED PARALLEL SECTION (isNested: ${block.isNested})`);
                    logStructure(block, depth + 3, "Nested");
                  } else {
                    const reliability = block.reliability || "N/A";
                    // console.log(`${indent}      └─ Block ${blkIdx + 1}: Regular Block (R=${reliability})`);
                  }
                });
              } else {
                // console.log(`${indent}      └─ No blocks in this branch`);
              }
            });
          } else {
            const reliability = item.reliability || "N/A";
            // console.log(`${indent}[${type}] REGULAR BLOCK - R=${reliability}, isNested: ${item.isNested || false}`);
          }
        };

        // Log complete structure


        data.forEach((item, idx) => {

          logStructure(item, 1, `Top${idx + 1}`);
        });

        // Calculate top level reliabilities
        const topLevelReliabilities = data.map((item, index) => {
          // console.log(`\n=== Calculating Top Level Item ${index + 1} ===`);

          // Check if this is a parallel section at top level
          if (item.arrangement === "horizontal" && item.branches && item.branches.length > 0) {
            // console.log(`Item ${index + 1} is a Parallel Section at top level`);
            const parallelReliability = computeParallelSectionReliability(item.branches);
            // console.log(`Item ${index + 1} Parallel Section Reliability:`, parallelReliability);
            return parallelReliability;
          }

          // Single block at top level
          // console.log(`Item ${index + 1} is a Single Block at top level`);
          const blockReliability = computeReliability(item);
          // console.log(`Item ${index + 1} Block Reliability:`, blockReliability);
          return blockReliability;
        });

        // console.log("\n=== Top Level Reliabilities ===");
        // console.log("Top Level Reliabilities Array:", topLevelReliabilities);

        // Final system reliability (series combination of top level items)
        const totalReliability = topLevelReliabilities.reduce((acc, r, i) => {
          // console.log(`Final Step ${i + 1}: acc=${acc}, r=${r}, result=${acc * r}`);
          return acc * r;
        }, 1);

        const totalUnavailability = 1 - totalReliability;

        // console.log("\n=== FINAL RESULTS ===");
        // console.log("Total System Reliability:", totalReliability);
        // console.log("Total System Unavailability:", totalUnavailability);
        // console.log("Formula: Series combination of", topLevelReliabilities.length, "top level items");

        // If there are nested sections, show the calculation summary
        const hasNested = data.some(item =>
        (item.arrangement === "horizontal" && item.branches?.some(branch =>
          branch.blocks?.some(block => block.arrangement === "horizontal")
        ))
        );

        if (hasNested) {
          // console.log("\n📊 Nested Parallel Sections Detected!");
          // console.log("Calculation Method:");
          // console.log("1. Each nested parallel section is calculated recursively");
          // console.log("2. Parallel formula: R = 1 - Π(1 - R_i) for each branch");
          // console.log("3. Series formula: R = Π(R_i) for blocks in a branch");
          // console.log("4. Top level items combine in series");
        }

        setTotalReliability(totalReliability);
        setTotalUnavailability(totalUnavailability);
      })
      .catch((err) => console.log(err, "error"));
  };
  const handleKOfNSelect = (data) => {
    // console.log("K-of-N created successfully:", data);
    // Refresh the blocks
    getBlock();
    // Close any open modals
    setKOfNModal({
      open: false,
      blockId: null,
      initialData: null,
      mode: "add",
      nodeIndex: null,
    });
  };

  // ── parallel branch creation ───────────────────────────────────────────────
  // const createParallelBranch = (startNode, endNode) => {
  //   console.log(startNode, 'startNode')
  //   console.log(endNode, 'endNode')

  //   // const parseNode = (n) =>
  //   // typeof n === "string" && n.startsWith("branch-")
  //   //   ? {
  //   //       type: "branch",
  //   //       branchId: parseInt(n.split("-")[1]),
  //   //       position: n.split("-")[2],
  //   //     }
  //   //   : { type: "top-level", nodeIndex: parseInt(n) };

  //   const parseNode = (n) =>
  //     typeof n === "string" && n.startsWith("branch-")
  //       ? {
  //         type: "branch",
  //         branchId: n.split("-")[1],
  //         position: n.split("-")[2],
  //       }
  //       : {
  //         type: "top-level",
  //         id: n,
  //       };

  //   const start = parseNode(startNode);
  //   const end = parseNode(endNode);

  //   console.log(start, 'start')
  //   console.log(end, 'end')

  //   const topLevel = blocks.filter(
  //     (b) => b.type === "Parallel Section" || !b.data?.parentSection,
  //   );

  //   console.log(start.type, 'start.type')
  //   console.log(topLevel, 'topLevel')

  //   if (start.type !== "top-level" || end.type !== "top-level") return;
  //   // const si = start.nodeIndex,
  //   //   ei = end.nodeIndex;

  //   const si = topLevel.findIndex((b) => b.id === start.id);
  //   const ei = topLevel.findIndex((b) => b.id === end.id);
  //   if (si < 0 || ei < 0 || si >= ei) {
  //     alert("Invalid start/end nodes");
  //     return;
  //   }

  //   const mainBlocks = topLevel.slice(si, ei);
  //   if (!mainBlocks.length) {
  //     alert("No blocks between nodes");
  //     return;
  //   }

  //   const sectionId = nextId;
  //   const section = {
  //     id: sectionId,
  //     type: "Parallel Section",
  //     data: {
  //       elementType: "Parallel Section",
  //       name: "Parallel Section",
  //       branchCount: 2,
  //       sectionId,
  //       isParallel: true,
  //       arrangement: "horizontal",
  //       k: 1,
  //       n: 2,
  //     },
  //     branches: [],
  //   };
  //   const mainBranch = {
  //     id: sectionId + 1,
  //     type: "Parallel Branch",
  //     data: {
  //       elementType: "Parallel Branch",
  //       name: "Main Branch",
  //       branchIndex: 0,
  //       parentSection: sectionId,
  //       isParallelBranch: true,
  //       isMainBranch: true,
  //     },
  //     blocks: mainBlocks.map((b) => ({
  //       id: b.id,
  //       type: b.type,
  //       data: { ...b.data, parentSection: sectionId },
  //     })),
  //   };
  //   const bypassBranch = {
  //     id: sectionId + 2,
  //     type: "Parallel Branch",
  //     data: {
  //       elementType: "Parallel Branch",
  //       name: "Bypass Branch",
  //       branchIndex: 1,
  //       parentSection: sectionId,
  //       isParallelBranch: true,
  //       isBypassBranch: true,
  //     },
  //     blocks: [
  //       {
  //         id: sectionId + 3,
  //         type: "Regular",
  //         data: {
  //           elementType: "Regular",
  //           name: "Bypass Block",
  //           parentSection: sectionId,
  //         },
  //       },
  //     ],
  //   };

  //   const toRemove = new Set(mainBlocks.map((b) => b.id));
  //   const remaining = blocks.filter((b) => !toRemove.has(b.id));
  //   const insertAt = remaining.findIndex((b) => b.id === mainBlocks[0].id);
  //   const next = [...remaining];
  //   insertAt !== -1
  //     ? next.splice(insertAt, 0, section, mainBranch, bypassBranch)
  //     : next.push(section, mainBranch, bypassBranch);
  //   setBlocks(next);
  //   setNextId((id) => id + 4);
  // };

  // const createParallelBranch = (startNode, endNode) => {
  //   const parseNode = (n) =>
  //     typeof n === "string" && n.startsWith("branch-")
  //       ? { type: "branch", branchId: n.split("-")[1], position: n.split("-")[2] }
  //       : { type: "top-level", id: n };

  //   const start = parseNode(startNode);
  //   const end = parseNode(endNode);

  //   if (start.type !== "top-level" || end.type !== "top-level") return;

  //   const topLevel = blocks.filter(
  //     (b) => b.type === "Parallel Section" || !b.data?.parentSection,
  //   );

  //   // ✅ FIX: compare against both _id and id since API returns MongoDB _id
  //   const getId = (b) => String(b._id ?? b.id ?? "");

  //   const si = topLevel.findIndex((b) => getId(b) === String(start.id));
  //   const ei = topLevel.findIndex((b) => getId(b) === String(end.id));

  //   console.log("si:", si, "ei:", ei);

  //   if (si < 0 || ei < 0 || si >= ei) {
  //     toast.error("Please select a start node and an end node with blocks between them");
  //     return;
  //   }

  //   // slice from si up to (not including) ei — these are the blocks to wrap
  //   const mainBlocks = topLevel.slice(si, ei);
  //   if (!mainBlocks.length) {
  //     toast.error("No blocks between the selected nodes");
  //     return;
  //   }

  //   const sectionId = nextId;

  //   const section = {
  //     id: sectionId,
  //     type: "Parallel Section",
  //     k: 1,
  //     n: 2,
  //     isParallel: true,
  //     branches: [
  //       {
  //         id: sectionId + 1,
  //         _id: sectionId + 1,
  //         index: 0,
  //         name: "Main Branch",
  //         type: "Parallel Branch",
  //         isParallelBranch: true,
  //         isMainBranch: true,
  //         blocks: mainBlocks.map((b) => ({
  //           ...b,
  //           parentSection: sectionId,
  //         })),
  //       },
  //       {
  //         id: sectionId + 2,
  //         _id: sectionId + 2,
  //         index: 1,
  //         name: "Bypass Branch",
  //         type: "Parallel Branch",
  //         isParallelBranch: true,
  //         isBypassBranch: true,
  //         blocks: [
  //           {
  //             id: sectionId + 3,
  //             type: "Regular",
  //             name: "Bypass Block",
  //             parentSection: sectionId,
  //           },
  //         ],
  //       },
  //     ],
  //     data: {
  //       elementType: "Parallel Section",
  //       name: "Parallel Section",
  //       k: 1,
  //       n: 2,
  //       isParallel: true,
  //     },
  //   };

  //   // ✅ FIX: remove mainBlocks from the flat blocks array using _id OR id
  //   const toRemove = new Set(mainBlocks.map((b) => getId(b)));
  //   const remaining = blocks.filter((b) => !toRemove.has(getId(b)));

  //   // ✅ FIX: insert at the position where the FIRST mainBlock was
  //   const insertAt = blocks.findIndex((b) => getId(b) === getId(mainBlocks[0]));
  //   const next = [...remaining];

  //   // Calculate correct insert position in the remaining array
  //   // (some blocks before insertAt may have been removed, so recompute)
  //   const insertInRemaining = remaining.findIndex(
  //     (b) => {
  //       // insert before the first block that came AFTER all removed blocks
  //       const origIdx = blocks.findIndex((ob) => getId(ob) === getId(b));
  //       return origIdx > insertAt + mainBlocks.length - 1;
  //     }
  //   );

  //   if (insertInRemaining !== -1) {
  //     next.splice(insertInRemaining, 0, section);
  //   } else {
  //     next.push(section);
  //   }

  //   setBlocks(next);
  //   setNextId((id) => id + 4);
  // };

  // const createParallelBranch = (startNode, endNode) => {
  //   const getId = (b) => String(b._id ?? b.id ?? "");

  //   const topLevel = blocks.filter(
  //     (b) => b.type === "Parallel Section" || !b.data?.parentSection,
  //   );

  //   // Each node's RelateId = the block immediately to its LEFT
  //   // startNode's RelateId = block[si], so we wrap blocks AFTER si (starting at si+1)
  //   // endNode's RelateId   = block[ei], so we wrap blocks UP TO AND INCLUDING ei

  //   const si = startNode == null
  //     ? -1  // first node (before all blocks) has no RelateId
  //     : topLevel.findIndex((b) => getId(b) === String(startNode));

  //   const ei = endNode == null
  //     ? topLevel.length - 1
  //     : topLevel.findIndex((b) => getId(b) === String(endNode));


  //   // blocks to wrap = topLevel[si+1 .. ei] inclusive
  //   const wrapStart = si + 1;
  //   const wrapEnd = ei + 1; // slice end is exclusive

  //   if (wrapStart >= wrapEnd) {
  //     toast.error("Please select nodes with at least one block between them");
  //     return;
  //   }

  //   const mainBlocks = topLevel.slice(wrapStart, wrapEnd);
  //   if (!mainBlocks.length) {
  //     toast.error("No blocks between the selected nodes");
  //     return;
  //   }


  //   const sectionId = nextId;

  //   const section = {
  //     id: sectionId,
  //     type: "Parallel Section",
  //     k: 1,
  //     n: 2,
  //     isParallel: true,
  //     branches: [
  //       {
  //         id: sectionId + 1,
  //         _id: sectionId + 1,
  //         index: 0,
  //         name: "Main Branch",
  //         type: "Parallel Branch",
  //         isParallelBranch: true,
  //         isMainBranch: true,
  //         blocks: mainBlocks.map((b) => ({ ...b, parentSection: sectionId })),
  //       },
  //       {
  //         id: sectionId + 2,
  //         _id: sectionId + 2,
  //         index: 1,
  //         name: "Bypass Branch",
  //         type: "Parallel Branch",
  //         isParallelBranch: true,
  //         isBypassBranch: true,
  //         blocks: [
  //           {
  //             id: sectionId + 3,
  //             type: "Regular",
  //             name: "Bypass Block",
  //             parentSection: sectionId,
  //           },
  //         ],
  //       },
  //     ],
  //     data: {
  //       elementType: "Parallel Section",
  //       name: "Parallel Section",
  //       k: 1,
  //       n: 2,
  //       isParallel: true,
  //     },
  //   };

  //   // Remove mainBlocks from flat array, insert section where they were
  //   const toRemove = new Set(mainBlocks.map((b) => getId(b)));

  //   // Find insertion point in original blocks array (before removal)
  //   const insertAt = blocks.findIndex((b) => getId(b) === getId(mainBlocks[0]));

  //   const remaining = blocks.filter((b) => !toRemove.has(getId(b)));

  //   // After removal, the insertion point shifts — find where to insert
  //   // by locating the first block in remaining that originally came after insertAt
  //   let insertInRemaining = remaining.findIndex(
  //     (b) => blocks.findIndex((ob) => getId(ob) === getId(b)) > insertAt + mainBlocks.length - 1
  //   );
  //   if (insertInRemaining === -1) insertInRemaining = remaining.length;

  //   const next = [...remaining];
  //   next.splice(insertInRemaining, 0, section);

  //   setBlocks(next);
  //   console.log(blocks, 'blocks inside the parallel branch')
  //   setNextId((id) => id + 4);
  // };

  const createParallelBranch = async (startNode, endNode) => {
    const getId = (b) => String(b._id ?? b.id ?? "");
    const topLevel = blocks.filter(
      (b) => b.type === "Parallel Section" || !b.data?.parentSection
    );

    const si = startNode == null ? -1
      : topLevel.findIndex(b => getId(b) === String(startNode));
    const ei = endNode == null ? topLevel.length - 1
      : topLevel.findIndex(b => getId(b) === String(endNode));

    const wrapStart = si + 1;
    const wrapEnd = ei + 1;

    if (wrapStart >= wrapEnd) {
      toast.error("Please select nodes with at least one block between them");
      return;
    }

    const mainBlocks = topLevel.slice(wrapStart, wrapEnd);
    if (!mainBlocks.length) {
      toast.error("No blocks between the selected nodes");
      return;
    }

    const payload = {
      rbdId,
      projectId,
      companyId: localStorage.getItem("companyId"),
      elementType: "Parallel Branch",
      type: "Parallel Branch",
      isParallel: true,
      isParallelBranch: true,
      range: {
        startBlockId: getId(topLevel[si]) ?? null, // block to the LEFT of start node (null if first node)
        endBlockId: getId(topLevel[ei]), // block to the RIGHT of end node
        blockIds: mainBlocks.map((b) => getId(b)), // all blocks being wrapped
      },
      k: 1,
      n: 2,
      branchCount: 2,
    };

    try {
      const payload = {
        startBlockId: startNode ?? null,  // block _id LEFT of start node
        endBlockId: endNode ?? null,      // block _id RIGHT of end node
        companyId: localStorage.getItem("companyId"),
      };

      await Api.post(
        `/api/v1/elementParametersRBD/${rbdId}/${projectId}/add-parallel-branch`,
        payload
      );

      toast.success("Parallel branch created successfully");
      getBlock(); // re-fetch to redraw diagram
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to create parallel branch",
      );
    }
  };


  useEffect(() => {
    parallelBranchModeRef.current = parallelBranchMode;
  }, [parallelBranchMode]);

  // ── menu open ──────────────────────────────────────────────────────────────
  // const openMenu = (x, y, index) => {
  //   console.log("called", x, y, index);

  //   if (parallelBranchMode.active) {
  //     console.log(parallelBranchMode.startNode, 'startnode');
  //     if (!parallelBranchMode.startNode) {
  //       setParallelBranchMode({
  //         active: false,
  //         startNode: null,
  //         endNode: null,
  //       });
  //       return;
  //     }
  //     createParallelBranch(parallelBranchMode.startNode, index);
  //     setParallelBranchMode({ active: false, startNode: null, endNode: null });
  //     return;
  //   }
  //   setMenu({ x, y, index });
  //   console.log(index, "index from open menu");
  //   setTargetId(index);
  //   setSelectedNode(index);
  //   setClickedNodeInfo({ index, x, y });
  // };

  const openMenu = (x, y, index, innerBlock) => {
    const mode = parallelBranchModeRef.current; // ← avoids stale closure

    if (mode.active) {
      if (!mode.startNode && mode.startNode !== null) {
        setParallelBranchMode({
          active: false,
          startNode: null,
          endNode: null,
        });
        return;
      }
      createParallelBranch(mode.startNode, index);
      setParallelBranchMode({ active: false, startNode: null, endNode: null });
      return;
    }
    setMenu({ x, y, index });
    setTargetId(index);
    setInnerTargetId(innerBlock);
    setSelectedNode(index);
    setClickedNodeInfo({ index, x, y });
  };

  const handleNodeClick = (nodeIndex) => setSelectedNode(nodeIndex);

  // ── insertion helpers ──────────────────────────────────────────────────────
  const findInsertionIndex = (nodeIndex) => {
    if (nodeIndex === null || nodeIndex === undefined) return blocks.length;

    // branch node — format: branch-{branchKey}-left | branch-{branchKey}-right | branch-{branchKey}-mid-{bIdx}
    if (typeof nodeIndex === "string" && nodeIndex.startsWith("branch-")) {
      // strip leading "branch-"
      const rest = nodeIndex.slice("branch-".length);
      // position is always the last token, midIdx (if any) is second-to-last
      // branchKey is everything before the position token(s)
      const tokens = rest.split("-");
      const position = tokens[tokens.length - 1]; // 'left' | 'right' | <number for mid>

      let branchId, midIdx;
      if (position === "left" || position === "right") {
        // branch-{branchKey}-left  →  tokens = [...branchKeyParts, 'left']
        branchId = tokens.slice(0, -1).join("-");
        midIdx = undefined;
      } else {
        // branch-{branchKey}-mid-{bIdx}  →  last two tokens are bIdx and 'mid'
        midIdx = position; // bIdx is the last token
        branchId = tokens.slice(0, -2).join("-"); // everything before 'mid'
      }

      return {
        isBranch: true,
        branchId,
        position: position === midIdx ? "mid" : position,
        midIdx,
      };
    }

    const tl = blocks.filter(
      (b) => b.type === "Parallel Section" || !b.data?.parentSection,
    );
    if (nodeIndex === 0) return 0;
    if (nodeIndex >= tl.length) return blocks.length;
    const after = tl[nodeIndex];
    return after ? blocks.findIndex((b) => b.id === after.id) : blocks.length;
  };

  // Handle SubRBD confirmation from modal
  const handleSubRBDConfirm = async (selectedRbd, mode, blockId, nodeIndex) => {
    console.log("selectedRbd received:", selectedRbd);
    console.log("reliability:", selectedRbd.reliability);
    console.log("unavailability:", selectedRbd.unavailability);
    try {
      if (mode === "edit") {
        // UPDATE existing SubRBD block
        const updateData = {
          name: selectedRbd.rbdTitle,
          subRbdId: selectedRbd.id,
          subRbdData: {
            id: selectedRbd.id,
            rbdTitle: selectedRbd.rbdTitle,
            description: selectedRbd.description,
            missionTime: selectedRbd.missionTime,
            reliability: selectedRbd.reliability,
            unavailability: selectedRbd.unavailability,
          },
        };

        let endpoint;

        console.log(parentItemId,'parentItemId')
        console.log(blockId,'blockId')


        if (parentItemId) {
          endpoint = `/api/v1/elementParametersRBD/updateRBD/${parentItemId}/block/${blockId}`;
        } else {
          endpoint = `/api/v1/elementParametersRBD/updateRBD/${blockId}`;
        }

        // Fetch RBD list for SubRBD selection

        // Call API to update the block
        const response = await Api.patch(
          endpoint,
          updateData,
        );

        if (response.data.success) {
          // Update local state
          setBlocks((prevBlocks) =>
            prevBlocks.map((block) => {
              if (block.id === blockId || block._id === blockId) {
                return {
                  ...block,
                  type: "SubRBD",
                  elementType: "SubRBD",
                  name: selectedRbd.rbdTitle,
                  subRbdId: selectedRbd.id,
                  subRbdData: updateData.subRbdData,
                  reliability: selectedRbd.reliability,
                  unavailability: selectedRbd.unavailability,
                  isSubRBD: true,
                  data: {
                    ...block.data,
                    rbdData: updateData.subRbdData,
                    rbdId: selectedRbd.id,
                    name: selectedRbd.rbdTitle,
                  },
                };
              }
              return block;
            }),
          );

          toast.success("SubRBD updated successfully");
        }
      } else {
        // ADD new SubRBD block

        // Prepare the block data for API
        const newBlockData = {
          rbdId: rbdId, // Parent RBD ID from URL params
          projectId: projectId,
          companyId: localStorage.getItem("companyId"),
          elementType: "SubRBD",
          type: "SubRBD",
          name: selectedRbd.rbdTitle,
          subRbdId: selectedRbd.id,
          reliability: selectedRbd.reliability,
          unavailability: selectedRbd.unavailability,
          subRbdData: {
            id: selectedRbd.id,
            rbdTitle: selectedRbd.rbdTitle,
            description: selectedRbd.description,
            missionTime: selectedRbd.missionTime,
            reliability: selectedRbd.reliability,
            unavailability: selectedRbd.unavailability,
          },
          isSubRBD: true,
          // You can add other fields as needed
          partNumber: selectedRbd.partNumber || "",
          productName: selectedRbd.productName || "",
          mtbf: selectedRbd.mtbf || null,
          fr: selectedRbd.fr || null,
          targetId: targetId,
        };

        // Call API to create the block
        const response = await Api.post(
          "/api/v1/elementParametersRBD/create",
          newBlockData,
        );

        if (response.data.success) {
          const createdBlock = response.data.data;

          // Create the block object for local state
          const newBlock = {
            id: createdBlock._id || createdBlock.id,
            _id: createdBlock._id,
            type: "SubRBD",
            elementType: "SubRBD",
            name: selectedRbd.rbdTitle,
            subRbdId: selectedRbd.id,
            subRbdData: newBlockData.subRbdData,
            reliability: selectedRbd.reliability,
            unavailability: selectedRbd.unavailability,
            isSubRBD: true,
            data: {
              rbdData: newBlockData.subRbdData,
              rbdId: selectedRbd.id,
              name: selectedRbd.rbdTitle,
            },
          };

          // Insert the block at the specified position
          if (nodeIndex !== null && nodeIndex !== undefined) {
            insertBlockAtPosition(newBlock, nodeIndex);
          } else {
            setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
            setNextId((prevId) => prevId + 1);
          }

          toast.success("SubRBD block created successfully");

          // Refresh blocks from database to ensure consistency
          getBlock();
        }
      }

      // Close the modal
      setRbdListModal({
        open: false,
        nodeIndex: null,
        blockId: null,
        mode: "add",
        selectedRbd: null,
      });
    } catch (error) {
      console.error("Error in SubRBD operation:", error);
      toast.error(error.response?.data?.message || "Failed to process SubRBD");
    }
  };

  useEffect(() => {
    if (projectId) {
      Api.get("/api/v1/EditConfigRBD/", {
        // Make sure the endpoint is correct
        params: {
          projectId: projectId,
        },
      })
        .then((res) => {
          setRbdList(res.data.data || []);
        })
        .catch((error) => {
          console.error("Error fetching RBD list:", error);
          toast.error("Failed to load RBD list");
        });
    }
  }, [projectId]);
  const insertBlockAtPosition = (newBlock, nodeIndex) => {
    const info = findInsertionIndex(nodeIndex);
    const next = JSON.parse(JSON.stringify(blocks));

    if (info?.isBranch) {
      const { branchId, position, midIdx } = info;
      const STEP = C.BLOCK_W + C.BLOCK_GAP;

      let found = false;
      for (let i = 0; i < next.length; i++) {
        if (
          next[i].type === "Parallel Section" &&
          Array.isArray(next[i].branches)
        ) {
          const br = next[i].branches.find(
            (b) =>
              String(b._id) === branchId ||
              String(b.id) === branchId ||
              String(b.index) === branchId,
          );
          if (br) {
            if (!br.blocks) br.blocks = [];
            if (br.leftPad === undefined) br.leftPad = C.INNER_PAD_X;

            const withParent = {
              ...newBlock,
              parentSection: next[i]._id || next[i].id,
            };

            if (position === "left") {
              br.blocks.unshift(withParent);
              // Section grows LEFT by STEP: shift sectionX left, keep all block x fixed.
              // leftPad stays unchanged on all branches — leftRailX moves left by STEP
              // and that's enough to make room for the new block on the left.
              next[i].leftGrowth = (next[i].leftGrowth || 0) + STEP;
            } else if (position === "right") {
              br.blocks.push(withParent);
              // right side grows — no leftPad or leftGrowth change needed
            } else if (position === "mid") {
              br.blocks.splice(parseInt(midIdx) + 1, 0, withParent);
            }

            found = true;
            break;
          }
        }
      }

      if (!found) {
        next.splice(typeof info === "number" ? info : next.length, 0, newBlock);
      }
    } else {
      next.splice(info, 0, newBlock);
    }

    setBlocks(next);
    setNextId((id) => id + 1);
  };

  const insertBlocksAtPosition = (arr, nodeIndex) => {
    const idx = findInsertionIndex(nodeIndex);
    const next = [...blocks];
    next.splice(typeof idx === "number" ? idx : next.length, 0, ...arr);
    setBlocks(next);
    setNextId((id) => id + arr.length);
  };

  const submitParallelSection = (value) => {
    const requestData = {
      ...value,
      parentId: parentItemId,
      targetId: targetId,
      isNested: true,
    };

    Api.post(
      `/api/v1/elementParametersRBD/create/parallelsection/${rbdId}/${projectId}`,
      requestData,
    )
      .then((res) => {
        toast.success("Successfully Created");
        // console.log(res);
        getBlock();
      })
      .catch((err) => console.log(err));
  };

  const handleParallelModalSubmit = () => {
    if (branchCount <= 1) {
      alert("Branch count must be at least 2");
      return;
    }

    const sectionId = nextId;
    const branches = Array.from({ length: branchCount }, (_, i) => ({
      id: sectionId + i + 1,
      type: "Parallel Branch",
      index: i,
      name: `Branch ${i + 1}`,
      elementType: "Parallel Branch",
      branchIndex: i,
      parentSection: sectionId,
      isParallelBranch: true,
      blocks: [
        {
          id: sectionId + branchCount + i + 1,
          type: "Regular",
          elementType: "Regular",
          name: `Branch ${i + 1} Block`,
          branchIndex: i,
          parentSection: sectionId,
          failureRate: 0.001,
          mtbf: 1000,
        },
      ],
    }));

    const section = {
      id: sectionId,
      type: "Parallel Section",
      name: "Parallel Section",
      arrangement: "horizontal",
      k: 1,
      n: branchCount,
      branches,
      data: {
        elementType: "Parallel Section",
        name: "Parallel Section",
        branchCount,
        sectionId,
        isParallel: true,
        arrangement: "horizontal",
        k: 1,
        n: branchCount,
        idforApi: idforApi?.branchId ? idforApi : null,
      },
    };

    const nodeIndexToUse = pendingAction?.nodeIndex ?? clickedNodeInfo.index;
    submitParallelSection(section);
    insertBlocksAtPosition([section], nodeIndexToUse);
    setShowParallelModal(false);
    setBranchCount(3);
    setPendingAction(null);
  };

  // ── k-of-n calc ────────────────────────────────────────────────────────────
  const calcKOfN = ({ k, n, lambda, mu }) => {
    const q = n - k;

    if (q === 0) return { lambda: n * lambda, mu: mu * k };
    if (k === 1) return { lambda: lambda / n, mu: mu * k };
    let ratio = 1;
    for (let i = n - q; i <= n; i++) if (i > 0) ratio *= i;
    return {
      lambda: (ratio * Math.pow(lambda, q)) / (Math.pow(mu, q) * 1000),
      mu: mu * k,
    };
  };

  const calculateKOfNMu = ({ k, n, mu }) => {
    return mu * k;
  };

  const handleKOfNSubmit = (data) => {
    const { lambda: effL, mu: effM } = calcKOfN(data);
    const newBlock = {
      id: kOfNModal.mode === "add" ? nextId : kOfNModal.blockId,
      type: "K-out-of-N",
      data: {
        elementType: "K-out-of-N",
        ...data,
        effectiveLambda: effL,
        effectiveMu: effM,
        mtbf: 1 / effL,
      },
    };
    if (kOfNModal.mode === "add") {
      const ni = kOfNModal.nodeIndex ?? clickedNodeInfo.index;
      ni !== null && ni !== undefined
        ? insertBlockAtPosition(newBlock, ni)
        : setBlocks((prev) => [...prev, newBlock]);
    } else {
      setBlocks((prev) =>
        prev.map((b) => (b.id === kOfNModal.blockId ? newBlock : b)),
      );
    }
    setKOfNModal({
      open: false,
      blockId: null,
      initialData: null,
      mode: "add",
      nodeIndex: null,
    });
  };

  const handleSwitchConfigOpen = (initialData) => {
    setSwitchModal({
      open: true,
      blockId: elementModal.blockId,
      initialData,
    });
  };

  const handleSwitchSubmit = (switchData) => {
    if (elementModal.blockId) {
      setBlocks(
        blocks.map((block) =>
          block.id === elementModal.blockId
            ? {
              ...block,
              data: {
                ...block.data,
                switchData: switchData,
              },
            }
            : block,
        ),
      );
    }

    setSwitchModal({ open: false, blockId: null, initialData: null });
  };

  const handleSaveConfig = (newConfig) => {
    setRbdConfig(newConfig);
    // console.log("Saved config:", newConfig);
  };

  {
    parallelBranchMode.active && (
      <div
        style={{
          position: "fixed",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#0078d4",
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          zIndex: 2000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>Select the end node for the parallel branch</span>
        <button
          onClick={() =>
            setParallelBranchMode({
              active: false,
              startNode: null,
              endNode: null,
            })
          }
          style={{
            background: "transparent",
            border: "1px solid white",
            color: "white",
            padding: "2px 8px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  {
    /* Highlight the start node */
  }
  {
    parallelBranchMode.active && parallelBranchMode.startNode && (
      <div
        style={{
          position: "fixed",
          left: clickedNodeInfo.x,
          top: clickedNodeInfo.y - 20,
          transform: "translateX(-50%)",
          backgroundColor: "#0078d4",
          color: "white",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1500,
        }}
      >
        Start
      </div>
    );
  }

  //

  // ── node menu ──────────────────────────────────────────────────────────────
  const handleSelect = (action) => {
    if (action === "Add Parallel Section") {
      setPendingAction({ type: "parallel", nodeIndex: clickedNodeInfo.index });
      setShowParallelModal(true);
      return;
    }
    // if (action === "Add Parallel Branch") {
    //   setParallelBranchMode({
    //     active: true,
    //     startNode: clickedNodeInfo.index,
    //     endNode: null,
    //   });
    //   setMenu(null);
    //   alert("Select the end node for the parallel branch");
    //   return;
    // }
    // In handleSelect, change "Add Parallel Branch":
    if (action === "Add Parallel Branch") {
      setParallelBranchMode({
        active: true,
        startNode: targetId, // ← targetId is the RelateId (block's _id), same as what openMenu passes for end node
        endNode: null,
      });
      setMenu(null);
      toast.info("Now click the end node to complete the parallel branch");
      return;
    }
    if (action === "Add K-out-of-N") {
      console.log("Hello")
      console.log(innerTargetId, "123innerTargetId")
      console.log(innerTargetId, "123innerTargetId")


      const innerIdMatch = innerTargetId?.match(/^([a-f0-9]+)/);
      console.log(innerIdMatch, 'innerIdMatch')
      if (innerTargetId && innerTargetId?.includes("parallel")) {

        if (innerIdMatch && innerIdMatch[1]) {
          console.log(innerIdMatch[1], 'innerIdMatch[1] koutofn');
          setTargetId(innerIdMatch[1]);
        } else {
          console.log('No valid inner ID found in:', innerTargetId);
        }
      }

      setKOfNModal({
        open: true,
        mode: "add",
        blockId: nextId,
        nodeIndex: (innerIdMatch && innerIdMatch[1]) ? innerIdMatch[1] : clickedNodeInfo.index,
        initialData: {
          k: 2,
          n: 3,
          lambda: 0.001,
          mu: 1000,
          formula: "standard",
          name: "K-out-of-N Block",
        },
      });
      return;
    }
    if (action === "Add Regular") {
      const innerIdMatch = innerTargetId?.match(/^([a-f0-9]+)/);
      if (innerTargetId && innerTargetId?.includes("parallel")) {
        if (innerIdMatch && innerIdMatch[1]) {
          // console.log(innerIdMatch[1], 'innerIdMatch[1]');
          setTargetId(innerIdMatch[1]);
        } else {
          console.log("No valid inner ID found in:", innerTargetId);
        }
      }
      setElementModal({
        open: true,
        mode: "add",
        blockId: nextId,
        blockType: action.replace("Add ", ""),
        nodeIndex:
          innerIdMatch && innerIdMatch[1]
            ? innerIdMatch[1]
            : clickedNodeInfo.index,
        idforApi:
          menu?.index == idforApi?.branchIndex
            ? idforApi
            : idforApi.nested == true
              ? idforApi
              : null,
        // idforApi: idforApi
      });
    }

    if (action === "Add SubRBD") {
      // Apply same logic from Add Regular
      const innerIdMatch = innerTargetId?.match(/^([a-f0-9]+)/);
      if (innerTargetId && innerTargetId?.includes("parallel")) {

        if (innerIdMatch && innerIdMatch[1]) {
          // console.log(innerIdMatch[1], 'innerIdMatch[1]');
          setTargetId(innerIdMatch[1]);
        } else {
          console.log('No valid inner ID found in:', innerTargetId);
        }
      }

      // Open RBD list modal instead of element parameters modal
      setRbdListModal({
        open: true,
        mode: "add",
        blockId: nextId,
        nodeIndex: (innerIdMatch && innerIdMatch[1]) ? innerIdMatch[1] : clickedNodeInfo.index,
        selectedRbd: null,
      });
      return;
    }
  };

  // ── element modal submit ───────────────────────
  const handleModalSubmit = (formData) => {
    const ni = elementModal.nodeIndex;

    // is this a branch-node insert? (node id like "branch-{id}-left/right/mid")
    const isBranchInsert = typeof ni === "string" && ni.startsWith("branch-");

    if (elementModal.mode === "add") {
      const typeMap = {
        K_OUT_OF_N: "K-out-of-N",
        SubRBD: "SubRBD",
        "Parallel Section": "Parallel Section",
        "Parallel Branch": "Parallel Branch",
      };
      const t = typeMap[elementModal.blockType] || "Regular";
      const newBlock = {
        id: nextId,
        type: t,
        data: { ...formData, elementType: t },
      };

      if (ni !== null && ni !== undefined) {
        insertBlockAtPosition(newBlock, ni);
      } else {
        setBlocks((prev) => [...prev, newBlock]);
      }

      // Only reload from DB for top-level inserts (DB was actually updated).
      // For branch inserts, DB save is not wired yet — keep local state as-is.
      if (!isBranchInsert) {
        setLoadChange((p) => !p);
      }
    } else {
      // edit mode — update local state
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === elementModal.blockId
            ? { ...b, data: { ...formData, elementType: b.type } }
            : b,
        ),
      );
      // Only reload if it was a top-level block edit
      if (!isBranchInsert) {
        setLoadChange((p) => !p);
      }
    }

    setElementModal({
      open: false,
      mode: "add",
      blockId: null,
      blockType: "",
      nodeIndex: null,
    });
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const handleDeleteBlock = (id) => {

    if (parentItemId) {
      Api.delete(
        `/api/v1/elementParametersRBD/deleteRBD/${parentItemId}/block/${id}`,
      )
        .then((res) => {
          if (res.data.success) {
            getBlock();
            toast.success("Successfully deleted the Block");
          }
        })
        .catch((err) => console.log(err));
    } else {
      Api.delete(`/api/v1/elementParametersRBD/deleteRBD/${id}`)
        .then((res) => {
          if (res.data.success) {
            getBlock();
            toast.success("Successfully deleted");
          }
        })
        .catch((err) => console.log(err));
    }
  };

  // ── edit block ─────────────────────────────────────────────────────────────
  const handleEditBlock = (e, id, blockData) => {
    if (e) {
      const rect = e.target.getBoundingClientRect();
      setBlockMenu({
        open: true,
        parentId: parentItem?.id ?? null,
        blockId: blockData?.id || blockData?._id,
        x: rect.right,
        y: rect.top,
      });
    }
  };


  const handleBlockMenuSelect = (action) => {

    if (!blockMenu.blockId) return;


    if (!blockMenu.blockId) return;
    if (action === "Delete...") {
      handleDeleteBlock(blockMenu.blockId);
    }

    // if (action === "Edit...") {
    //   let foundBlock = null;
    //   if (parentItem?.type === "parallel-section") {
    //     setParentItemId(parentItem?.id);
    //     console.log(parentItem?.id, "parentItem?.id");
    //     console.log(blockMenu.blockId, "blockMenu.blockId");
    //     console.log(parentItem.branches, "blockMenu.blockId");



    //     parentItem.branches?.forEach((br) =>
    //       br.blocks?.forEach((bl) => {
    //         if (bl._id === blockMenu.blockId || bl.id === blockMenu.blockId)
    //           foundBlock = bl;
    //       }),
    //     );

    //     console.log(foundBlock,'foundBlock')
    //     setParallelFoundBlock(foundBlock);
    //   } else {
    //     foundBlock = blocks.find((b) => b.id === blockMenu.blockId);
    //   }
    //   if (!foundBlock) {
    //     setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
    //     return;
    //   }
    //   if (foundBlock) {
    //     // Check if it's a SubRBD block
    //     if (
    //       foundBlock.type === "SubRBD" ||
    //       foundBlock.elementType === "SubRBD"
    //     ) {
    //       console.log("Editing SubRBD block:", foundBlock);

    //       // Get the selected RBD data
    //       let selectedRbd = null;

    //       // Try to get from data.rbdData first
    //       if (foundBlock.data?.rbdData) {
    //         selectedRbd = foundBlock.data.rbdData;
    //       }
    //       // Try from subRbdData
    //       else if (foundBlock.subRbdData) {
    //         selectedRbd = foundBlock.subRbdData;
    //       }
    //       // Try from rbdData directly
    //       else if (foundBlock.rbdData) {
    //         selectedRbd = foundBlock.rbdData;
    //       }

    //       setRbdListModal({
    //         open: true,
    //         mode: "edit",
    //         blockId: blockMenu.blockId,
    //         nodeIndex: null,
    //         selectedRbd: selectedRbd,
    //       });
    //     } else if (foundBlock.type === "K-out-of-N") {
    //       setKOfNModal({
    //         open: true,
    //         mode: "edit",
    //         blockId: blockMenu.blockId,
    //         nodeIndex: null,
    //         initialData: foundBlock.data || foundBlock,
    //       });
    //     } else {
    //       const bmap = {
    //         "K-out-of-N": "K_OUT_OF_N",
    //         SubRBD: "SUBRBD",
    //         "Parallel Section": "PARALLEL_SECTION",
    //         "Parallel Branch": "PARALLEL_BRANCH",
    //       };
    //       setElementModal({
    //         open: true,
    //         mode: "edit",
    //         blockId: blockMenu.blockId,
    //         blockType: bmap[foundBlock.type] || "REGULAR",
    //         nodeIndex: null,
    //       });
    //     }
    //   } else if (action === "Delete...") {
    //     handleDeleteBlock(blockMenu.blockId);
    //   } else if (action === "Add K-out-of-N") {
    //     setKOfNModal({
    //       open: true,
    //       mode: "add",
    //       blockId: nextId,
    //       nodeIndex: clickedNodeInfo.index,
    //       initialData: {
    //         k: 2,
    //         n: 3,
    //         lambda: 0.001,
    //         mu: 1000,
    //         formula: "standard",
    //         name: "K-out-of-N Block",
    //       },
    //     });
    //   } else if (action === "Add SubRBD") {
    //     // Open RBD list modal
    //     setRbdListModal({
    //       open: true,
    //       mode: "add",
    //       blockId: nextId,
    //       nodeIndex: clickedNodeInfo.index,
    //       selectedRbd: null,
    //     });
    //   } else if (action === "Add Parallel Section") {
    //     setPendingAction({
    //       type: "parallel",
    //       nodeIndex: clickedNodeInfo.index,
    //     });
    //     setShowParallelModal(true);
    //   } else if (action.startsWith("Add ")) {
    //     const amap = {
    //       "Add K-out-of-N": "K_OUT_OF_N",
    //       "Add SubRBD": "SUBRBD",
    //       "Add Parallel Section": "PARALLEL_SECTION",
    //       "Add Parallel Branch": "PARALLEL_BRANCH",
    //     };
    //     setElementModal({
    //       open: true,
    //       mode: "add",
    //       blockId: nextId,
    //       blockType: amap[action] || "REGULAR",
    //       nodeIndex: clickedNodeInfo.index,
    //     });
    //   }

    //   setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
    // }

    if (action === "Edit...") {
      let foundBlock = null;

      // Recursive function to search for block in nested parallel structures
      const findBlockRecursively = (container, targetId) => {
        if (!container) return null;

        // Check current container
        if (container._id === targetId || container.id === targetId) {
          return container;
        }

        // Check branches (for parallel-section)
        if (container.branches && Array.isArray(container.branches)) {
          for (const branch of container.branches) {
            // Check the branch itself
            if (branch._id === targetId || branch.id === targetId) {
              return branch;
            }

            // Check blocks inside branch
            if (branch.blocks && Array.isArray(branch.blocks)) {
              for (const block of branch.blocks) {
                const found = findBlockRecursively(block, targetId);
                if (found) return found;
              }
            }
          }
        }

        // Check blocks array (for parallel-branch or other containers)
        if (container.blocks && Array.isArray(container.blocks)) {
          for (const block of container.blocks) {
            const found = findBlockRecursively(block, targetId);
            if (found) return found;
          }
        }

        // Check nested parallel sections inside data
        if (container.data?.parallelSection) {
          const found = findBlockRecursively(container.data.parallelSection, targetId);
          if (found) return found;
        }

        // Check nested branches in data
        if (container.data?.branches && Array.isArray(container.data.branches)) {
          for (const branch of container.data.branches) {
            const found = findBlockRecursively(branch, targetId);
            if (found) return found;
          }
        }

        return null;
      };

      // Check if we're in a parallel-section context
      if (parentItem?.type === "parallel-section") {
        setParentItemId(parentItem?.id);

        // Use recursive search instead of just one level
        foundBlock = findBlockRecursively(parentItem, blockMenu.blockId);
        setParallelFoundBlock(foundBlock);
      } else {
        // Search in main blocks array (also recursive if blocks contain nested structures)
        const searchInMainBlocks = () => {
          for (const block of blocks) {
            const found = findBlockRecursively(block, blockMenu.blockId);
            if (found) return found;
          }
          return null;
        };
        foundBlock = searchInMainBlocks();
      }

      if (!foundBlock) {
        setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
        return;
      }

      if (foundBlock) {
        // Check if it's a SubRBD block
        if (
          foundBlock.type === "SubRBD" ||
          foundBlock.elementType === "SubRBD"
        ) {
          // console.log("Editing SubRBD block:", foundBlock);

          // Get the selected RBD data
          let selectedRbd = null;

          // Try to get from data.rbdData first
          if (foundBlock.data?.rbdData) {
            selectedRbd = foundBlock.data.rbdData;
          }
          // Try from subRbdData
          else if (foundBlock.subRbdData) {
            selectedRbd = foundBlock.subRbdData;
          }
          // Try from rbdData directly
          else if (foundBlock.rbdData) {
            selectedRbd = foundBlock.rbdData;
          }

          setRbdListModal({
            open: true,
            mode: "edit",
            blockId: blockMenu.blockId,
            nodeIndex: null,
            selectedRbd: selectedRbd,
          });
        }
        else if (foundBlock.type === "K-out-of-N") {
          setKOfNModal({
            open: true,
            mode: "edit",
            blockId: blockMenu.blockId,
            nodeIndex: null,
            initialData: foundBlock.data || foundBlock,
          });
        }
        else if (foundBlock.type === "parallel-section" || foundBlock.type === "Parallel Section") {
          // Open parallel modal for editing
          setPendingAction({
            type: "edit",
            nodeIndex: null,
            blockData: foundBlock,
            blockId: blockMenu.blockId
          });
          setShowParallelModal(true);
        }
        else if (foundBlock.type === "parallel-branch" || foundBlock.type === "Parallel Branch") {
          // Open parallel modal for editing branch
          setPendingAction({
            type: "edit",
            nodeIndex: null,
            blockData: foundBlock,
            blockId: blockMenu.blockId
          });
          setShowParallelModal(true);
        }
        else {
          const bmap = {
            "K-out-of-N": "K_OUT_OF_N",
            SubRBD: "SUBRBD",
            "Parallel Section": "PARALLEL_SECTION",
            "Parallel Branch": "PARALLEL_BRANCH",
          };
          setElementModal({
            open: true,
            mode: "edit",
            blockId: blockMenu.blockId,
            blockType: bmap[foundBlock.type] || "REGULAR",
            nodeIndex: null,
          });
        }
      }

      setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
    }
  };
  const handleClose = () => {
    setKOfNModal((prev) => ({
      ...prev,
      open: false,
    }));
  };
  const SettingsButton1 = () => (
    <button
      onClick={() => setIsModalOpen(true)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        backgroundColor: "#2b4f81",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "background-color 0.3s",
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#1e3c66")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#2b4f81")}
    >
      <FiSettings size={18} />
      <span>RBD Configuration</span>
    </button>
  );


  // const [open, setOpen] = useState(false);
  // const [selectedCase, setSelectedCase] = useState(null);
  const zoomBtnStyle = {
    width: 28,
    height: 28,
    border: "1px solid #ccc",
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };


  return (
    <div style={{ minHeight: "100vh" }}>



      {/* <div className="mt-1">
          <b>Reliability:</b> {totalReliability?.toFixed(9)}
          <br />
          <b>Unavailability:</b> {totalUnavailability?.toFixed(9)}
        </div> */}


      {!showSymbol && (
        <div className="card shadow d-flex flex-column justify-content-center align-items-center p-3 mt-5">
          <button onClick={() => setShowSymbol(true)} className="rbd-btn">
            RBD
          </button>
        </div>
      )}

      {/* <button
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                     backgroundColor: '#2b4f81', color: 'white', border: 'none',
                     borderRadius: '4px', cursor: 'pointer', fontSize: 14 }}
          >
            <FiSettings size={18} /> RBD Configuration
          </button> */}
      {/* </div> */}
      {/* <h1>Hello</h1>
        <div style={{ height: '500px', width: '1000px' }}>
          <ReactFlowD />
        </div> */}

      {showSymbol && (
        // <div
        //   style={{
        //     display: "flex",
        //     justifyContent: "center",
        //     alignItems: "center",
        //     overflow: "hidden",
        //     width: "100%",
        //     height: "100vh",
        //     border: "3px solid red"
        //   }}
        // >
        //   <div
        //     className="tree-wrapper"
        //     style={{
        //       transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
        //       transformOrigin: "0 0",
        //       cursor: isDragging ? "grabbing" : "grab",
        //       border: "3px solid green"
        //     }}
        //     onWheel={handleWheelScroll}
        //     onMouseDown={handleMouseDown}
        //     onMouseMove={handleMouseMove}
        //     onMouseUp={handleMouseUp}
        //     onMouseLeave={handleMouseUp}
        //   >
        <>

          <div
            ref={canvasRef}
            onWheel={handleWheelScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              width: "100%",
              height: "100vh",
              border: "3px solid red",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",        // prevent text selection while dragging
              position: "relative",
              marginTop: "3rem"
            }}
          >
            <div
              className="mt-3 ms-3 fs-5"
              style={{
                position: "absolute",
                top: 0,
                left: 0
              }} >
              <b>Reliability:</b> {totalReliability?.toFixed(9)}
              <br />
              <b>Unavailability:</b> {totalUnavailability?.toFixed(9)}
            </div>
            {/* ── Zoom controls overlay ─────────────────────────────────────── */}
            <div
              style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                zIndex: 9999,
                display: "flex",
                gap: 6,
                backgroundColor: "rgba(255,255,255,0.92)",
                border: "3px solid blue",
                borderRadius: 6,
                padding: "4px 8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                userSelect: "none",
              }}
            // Stop mouse events on the controls panel from triggering canvas pan
            // onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                style={zoomBtnStyle}
              >
                −
              </button>
              <span style={{ fontSize: 12, minWidth: 42, textAlign: "center", marginTop: "5px", color: "#333" }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                style={zoomBtnStyle}
              >
                +
              </button>
              <button
                onClick={handleZoomReset}
                title="Reset View"
                style={{ ...zoomBtnStyle, fontSize: 10, padding: "3px 18px" }}
              >
                Reset
              </button>
            </div>
            <div
              className="tree-wrapper"
              style={{
                display: "flex",
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: "0 0",
                //  transformOrigin: "center center",
                border: "3px solid green",
                justifyContent: "center",
                alignContent: "center"
              }}
            >
              <BiDirectionalSymbol
                onNodeClick={handleNodeClick}
                setTargetBranchId={setTargetBranchId}
                onOpenMenu={openMenu}
                setIdforApi={setIdforApi}
                setParentItem={setParentItem}
                blocks={blocks}
                setParentItemId={setParentItemId}
                onDeleteBlock={handleDeleteBlock}
                onEditBlock={handleEditBlock}
                selectedNode={selectedNode}
              />

              {blockMenu.open && (
                <BlockContextMenu
                  x={blockMenu.x}
                  y={blockMenu.y}
                  blocks={blocks}
                  parentItem={parentItem}
                  setParentItemId={setParentItemId}
                  setParallelFoundBlock={setParallelFoundBlock}
                  parallelFoundBlock={parallelFoundBlock}
                  onSelect={handleBlockMenuSelect}
                  onClose={() => {
                    setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
                    setParentItem(null);
                  }}
                />
              )}
              {console.log(targetId, "targetI before model")}
              {elementModal.open && (
                <ElementParametersModal
                  key={elementModal.blockId}
                  isOpen={elementModal.open}
                  elementModal={elementModal}
                  targetId={targetId}
                  onClose={() => {
                    setElementModal({
                      open: false,
                      mode: "add",
                      blockId: null,
                      blockType: "",
                      nodeIndex: null,
                    });
                    setParentItem(null);
                  }}
                  setLoadChange={setLoadChange}
                  onSubmit={handleModalSubmit}
                  onOpenSwitchConfig={handleSwitchConfigOpen}
                  rbdId={rbdId}
                  projectId={id}
                  // currentBlock={
                  //   blocks.find((b) => b.id === elementModal.blockId)?.data
                  // }
                  parallelFoundBlock={parallelFoundBlock}
                  parentItemId={parentItemId}
                  currentBlock={blocks.find((b) => {
                    // console.log("b.id:", b.id, "elementModal.blockId:", elementModal.blockId);
                    return b.id === elementModal.blockId;
                  })}
                />
              )}

              {/* RBD List Modal for SubRBD */}
              {/* RBD List Modal for SubRBD */}
              {rbdListModal.open && (
                <SubRBDModal
                  show={rbdListModal.open}
                  targetId={targetId}
                  onHide={() => setRbdListModal({ ...rbdListModal, open: false })}
                  rbdData={rbdListModal.selectedRbd}
                  mode={rbdListModal.mode}
                  blockId={rbdListModal.blockId}
                  nodeIndex={rbdListModal.nodeIndex}
                  onConfirm={handleSubRBDConfirm} // Add this callback
                  rbdList={rbdList}
                />
              )}

              {kOfNModal.open && (
                <>
                  <CaseSelectionModal
                    isOpen={kOfNModal.open}
                    targetId={targetId}
                    handleClose={handleClose}
                    onSelect={(item) => {
                      // console.log(item);
                      handleClose();
                    }}
                  />
                </>
              )}

              {showParallelModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2000,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#f0f0f0",
                      padding: "20px",
                      borderRadius: "8px",
                      minWidth: "350px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      border: "1px solid #999",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "20px",
                        fontSize: "14px",
                        fontWeight: "normal",
                        color: "#333",
                      }}
                    >
                      Add Parallel Section
                    </h3>

                    <div style={{ marginBottom: "20px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontSize: "13px",
                          color: "#333",
                        }}
                      >
                        Number of branches :
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={branchCount}
                        onChange={(e) =>
                          setBranchCount(parseInt(e.target.value) || 1)
                        }
                        style={{
                          width: "100%",
                          padding: "6px",
                          border: "1px solid #7f9db9",
                          borderRadius: "3px",
                          fontSize: "13px",
                          backgroundColor: "white",
                        }}
                        autoFocus
                      />
                    </div>

                    <div
                      style={{
                        backgroundColor: "white",
                        padding: "10px",
                        marginBottom: "20px",
                        fontSize: "12px",
                        color: "#333",
                        border: "1px solid #ccc",
                        fontFamily: "monospace",
                        lineHeight: "1.5",
                      }}
                    >
                      <div>Communication Unit</div>
                      <div>19949.1</div>
                      <div>#10</div>
                      <div>#11</div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={handleParallelModalSubmit}
                        style={{
                          padding: "4px 20px",
                          backgroundColor: "#e1e1e1",
                          color: "#333",
                          border: "1px solid #999",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "13px",
                          minWidth: "70px",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#d1d1d1")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#e1e1e1")
                        }
                      >
                        OK
                      </button>
                      {/* <button
                  onClick={handleParallelModalCancel}
                  style={{
                    padding: "4px 20px",
                    backgroundColor: "#e1e1e1",
                    color: "#333",
                    border: "1px solid #999",
                    borderRadius: "3px",
                    cursor: "pointer",
                    fontSize: "13px",
                    minWidth: "70px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d1d1d1"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e1e1e1"}
                >
                  Cancel
                </button> */}
                    </div>
                  </div>
                </div>
              )}

              <SwitchConfigurationModal
                isOpen={switchModal.open}
                onClose={() => {
                  setSwitchModal({
                    open: false,
                    blockId: null,
                    initialData: null,
                  });
                }}
                onSubmit={handleSwitchSubmit}
                currentSwitchData={switchModal.initialData}
              />

              <EditRBDConfigurationModal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setParentItem(null);
                }}
                onSave={handleSaveConfig}
                initialConfig={rbdConfig}
              />
            </div>
          </div>
        </>
      )}
      {menu && (
        <RBDContextMenu
          x={menu.x}
          y={menu.y}
          onSelect={handleSelect}
          onClose={() => {
            setMenu(null);
            setParentItem(null);
          }}
        />
      )}

      {blockMenu.open && (
        <BlockContextMenu
          x={blockMenu.x}
          y={blockMenu.y}
          setParallelFoundBlock={setParallelFoundBlock}
          onSelect={handleBlockMenuSelect}
          onClose={() => {
            setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
            setParentItem(null);
          }}
        />
      )}

      {elementModal.open && (
        <ElementParametersModal
          key={elementModal.blockId}
          isOpen
          elementModal={elementModal}
          onClose={() => {
            setElementModal({
              open: false,
              mode: "add",
              blockId: null,
              blockType: "",
              nodeIndex: null,
              idforApi: null,
            });
            setParentItem(null);
          }}
          setLoadChange={setLoadChange}
          onSubmit={handleModalSubmit}
          onOpenSwitchConfig={(data) =>
            setSwitchModal({
              open: true,
              blockId: elementModal.blockId,
              initialData: data,
            })
          }
          rbdId={rbdId}
          projectId={id}
          parallelFoundBlock={parallelFoundBlock}
          parentItemId={parentItemId}
          getBlock={getBlock}
          currentBlock={blocks.find((b) => b.id === elementModal.blockId)}
        />
      )}

        {/* {showParallelModal && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
          }}>
            <div style={{
              backgroundColor: '#f0f0f0', padding: 20, borderRadius: 8,
              minWidth: 350, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #999'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 14, fontWeight: 'normal', color: '#333' }}>
                Add Parallel Section
              </h3>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 13, color: '#333' }}>Number of branches:</label>
                <input type="number" min="2" max="20" value={branchCount}
                  onChange={(e) => setBranchCount(parseInt(e.target.value) || 2)}
                  style={{ width: '100%', padding: 6, border: '1px solid #7f9db9', borderRadius: 3, fontSize: 13, backgroundColor: 'white' }}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {[['OK', handleParallelModalSubmit],
                ['Cancel', () => { setShowParallelModal(false); setBranchCount(3); setPendingAction(null); }]
                ].map(([label, fn]) => (
                  <button key={label} onClick={fn}
                    style={{
                      padding: '4px 20px', backgroundColor: '#e1e1e1', color: '#333',
                      border: '1px solid #999', borderRadius: 3, cursor: 'pointer', fontSize: 13, minWidth: 70
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#d1d1d1')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e1e1e1')}
                  >{label}</button>
                ))}
              </div>
            </div>
          </div>
        )} */}

      <SwitchConfigurationModal
        isOpen={switchModal.open}
        onClose={() =>
          setSwitchModal({ open: false, blockId: null, initialData: null })
        }
        onSubmit={(data) => {
          setBlocks((prev) =>
            prev.map((b) =>
              b.id === elementModal.blockId
                ? { ...b, data: { ...b.data, switchData: data } }
                : b,
            ),
          );
          setSwitchModal({ open: false, blockId: null, initialData: null });
        }}
        currentSwitchData={switchModal.initialData}
      />

      <EditRBDConfigurationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setParentItem(null);
        }}
        onSave={setRbdConfig}
        initialConfig={rbdConfig}
      />


      {menu && (
        <RBDContextMenu
          x={menu.x}
          y={menu.y}
          onSelect={handleSelect}
          onClose={() => {
            setMenu(null);
            setParentItem(null);
          }}
        />
      )}

      {blockMenu.open && (
        <BlockContextMenu
          x={blockMenu.x}
          y={blockMenu.y}
          setParallelFoundBlock={setParallelFoundBlock}
          onSelect={handleBlockMenuSelect}
          onClose={() => {
            setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
            setParentItem(null);
          }}
        />
      )}

      {elementModal.open && (
        <ElementParametersModal
          key={elementModal.blockId}
          isOpen
          elementModal={elementModal}
          onClose={() => {
            setElementModal({
              open: false,
              mode: "add",
              blockId: null,
              blockType: "",
              nodeIndex: null,
              idforApi: null,
            });
            setParentItem(null);
          }}
          setLoadChange={setLoadChange}
          onSubmit={handleModalSubmit}
          onOpenSwitchConfig={(data) =>
            setSwitchModal({
              open: true,
              blockId: elementModal.blockId,
              initialData: data,
            })
          }
          rbdId={rbdId}
          projectId={id}
          parallelFoundBlock={parallelFoundBlock}
          parentItemId={parentItemId}
          getBlock={getBlock}
          currentBlock={blocks.find((b) => b.id === elementModal.blockId)}
        />
      )}
      {/* CaseSelectionModal for K-out-of-N */}
      {kOfNModal.open && (
        <CaseSelectionModal
          isOpen={kOfNModal.open}
          targetId={targetId}
          handleClose={() => {
            setKOfNModal({
              open: false,
              blockId: null,
              initialData: null,
              mode: "add",
              nodeIndex: null,
              selectedCase: null,
              selectedLabel: null,
            });
          }}
          onSelect={handleKOfNSelect}
          mode={kOfNModal.mode}
          parentItemId={parentItemId}
          existingData={kOfNModal.initialData}
        />
      )}
      {showParallelModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#f0f0f0",
              padding: 20,
              borderRadius: 8,
              minWidth: 350,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid #999",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 20,
                fontSize: 14,
                fontWeight: "normal",
                color: "#333",
              }}
            >
              Add Parallel Section
            </h3>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 13,
                  color: "#333",
                }}
              >
                Number of branches:
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={branchCount}
                onChange={(e) => setBranchCount(parseInt(e.target.value) || 2)}
                style={{
                  width: "100%",
                  padding: 6,
                  border: "1px solid #7f9db9",
                  borderRadius: 3,
                  fontSize: 13,
                  backgroundColor: "white",
                }}
                autoFocus
              />
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              {[
                ["OK", handleParallelModalSubmit],
                [
                  "Cancel",
                  () => {
                    setShowParallelModal(false);
                    setBranchCount(3);
                    setPendingAction(null);
                  },
                ],
              ].map(([label, fn]) => (
                <button
                  key={label}
                  onClick={fn}
                  style={{
                    padding: "4px 20px",
                    backgroundColor: "#e1e1e1",
                    color: "#333",
                    border: "1px solid #999",
                    borderRadius: 3,
                    cursor: "pointer",
                    fontSize: 13,
                    minWidth: 70,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#d1d1d1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e1e1e1")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <SwitchConfigurationModal
        isOpen={switchModal.open}
        onClose={() =>
          setSwitchModal({ open: false, blockId: null, initialData: null })
        }
        onSubmit={(data) => {
          setBlocks((prev) =>
            prev.map((b) =>
              b.id === elementModal.blockId
                ? { ...b, data: { ...b.data, switchData: data } }
                : b,
            ),
          );
          setSwitchModal({ open: false, blockId: null, initialData: null });
        }}
        currentSwitchData={switchModal.initialData}
      />

      <EditRBDConfigurationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setParentItem(null);
        }}
        onSave={setRbdConfig}
        initialConfig={rbdConfig}
      />
    </div>
  );
}
