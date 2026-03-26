// RBDSvgRenderer.jsx
// Replaces BiDirectionalSymbol entirely.
// Uses ELK-computed positions from useRBDLayout for pixel-perfect layout.

import React, { useMemo } from 'react';
import { useRBDLayout, RC } from './useRBDLayout';

// Colors
const COLORS = {
  wire:        'black',
  rail:        'black',
  block:       { Regular: '#4CAF50', REGULAR: '#4CAF50', SubRBD: '#FF9800', 'K-out-of-N': '#2196F3', default: '#4CAF50' },
  blockStroke: { Regular: '#2a7a2a', REGULAR: '#2a7a2a', SubRBD: '#c97000', 'K-out-of-N': '#1565C0', default: '#2a7a2a' },
  terminal:    'black',
  node:        'black',
  nodeActive:  '#0078d4',
  text:        'white',
  label:       '#333',
};

// InsertionNode - dot with + cross, clickable
const InsertionNode = ({ cx, cy, nodeId, selectedNode, onOpenMenu }) => {
  const active = selectedNode === nodeId;
  return (
    <g>
      {active && (
        <circle cx={cx} cy={cy} r={RC.NODE_R + 4}
          fill="none" stroke={COLORS.nodeActive} strokeWidth="2" strokeDasharray="4 2" />
      )}
      <circle
        cx={cx} cy={cy} r={RC.NODE_R}
        fill={active ? COLORS.nodeActive : COLORS.node}
        style={{ cursor: 'pointer' }}
        onClick={e => { e.stopPropagation(); onOpenMenu(e.clientX, e.clientY, nodeId); }}
      />
      <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="white" strokeWidth="1.5" />
      <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} stroke="white" strokeWidth="1.5" />
    </g>
  );
};

// BlockShape - colored rectangle with label
const BlockShape = ({ x, y, blockData, onEdit, setParentItemId }) => {
  const type    = blockData?.type || blockData?.elementType || blockData?.data?.elementType || 'Regular';
  const name    = blockData?.name || blockData?.data?.name || '';
  const fr      = blockData?.fr   || blockData?.data?.fr;
  const mtbf    = blockData?.mtbf || blockData?.data?.mtbf;
  const k       = blockData?.k    || blockData?.data?.k;
  const n       = blockData?.n    || blockData?.data?.n;
  const fill    = COLORS.block[type]       || COLORS.block.default;
  const stroke  = COLORS.blockStroke[type] || COLORS.blockStroke.default;

  const content = (() => {
    switch (type) {
      case 'Regular':
      case 'REGULAR':
        if (fr)   return typeof fr === 'number' ? fr.toFixed(6) : String(fr);
        if (mtbf) return String(mtbf);
        return 'Regular';
      case 'K-out-of-N': return `${k || 2}/${n || 3}`;
      case 'SubRBD':     return 'Sub RBD';
      default:           return 'Block';
    }
  })();

  return (
    <g
      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); if (onEdit) onEdit(e, blockData?._id || blockData?.id, blockData); }}
      onClick={() => setParentItemId?.(null)}
      style={{ cursor: 'context-menu' }}
    >
      {name && (
        <text x={x + RC.BLOCK_W / 2} y={y - 4}
          textAnchor="middle" fontSize="8" fontWeight="bold" fill={COLORS.label}>
          {name}
        </text>
      )}
      <rect x={x} y={y} width={RC.BLOCK_W} height={RC.BLOCK_H}
        fill={fill} stroke={stroke} strokeWidth="1" rx="2" />
      <text x={x + RC.BLOCK_W / 2} y={y + RC.BLOCK_H / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill={COLORS.text} fontSize="8" fontWeight="bold">
        {content}
      </text>
    </g>
  );
};

// Main renderer component
export const RBDSvgRenderer = ({
  blocks,
  selectedNode,
  onOpenMenu,
  setIdforApi,
  setParentItem,
  setParentItemId,
  onEditBlock,
  onDeleteBlock,
  onNodeClick,
}) => {
  const { layoutResult, loading } = useRBDLayout(blocks);

  // Derive values safely - hooks must always run before any early return
  const positionMap = layoutResult?.positionMap || {};
  const elkGraph    = layoutResult?.elkGraph    || null;
  const canvasW     = layoutResult?.canvasW     || RC.MIN_CANVAS_W;
  const canvasH     = layoutResult?.canvasH     || RC.MIN_CANVAS_H;

  const rootH   = elkGraph?.height || RC.MIN_CANVAS_H;
  const centerY = rootH / 2 + 30;

  const srcPos  = positionMap['__SOURCE__'];
  const sinkPos = positionMap['__SINK__'];
  const inputX  = srcPos  ? srcPos.absX  : RC.TERMINAL_LEFT_X;
  const outputX = sinkPos ? sinkPos.absX : canvasW - RC.TERMINAL_W - 20;

  // useMemo MUST be before all early returns (Rules of Hooks)
  const insertionNodes = useMemo(() => {
    const nodes = [];
    if (!elkGraph) return nodes;

    if (!blocks || blocks.length === 0) {
      // Empty diagram: one node in the middle of the wire
      nodes.push({ id: 0, cx: (inputX + RC.TERMINAL_W + outputX) / 2, cy: centerY });
      return nodes;
    }

    // Node before first block
    const firstId  = String(blocks[0]._id || blocks[0].id);
    const firstPos = positionMap[firstId];
    if (firstPos) {
      nodes.push({
        id: 0,
        cx: inputX + RC.TERMINAL_W + (firstPos.absX - inputX - RC.TERMINAL_W) / 2,
        cy: centerY,
      });
    }

    // Node after each block
    blocks.forEach((block, i) => {
      const curId  = String(block._id || block.id);
      const curPos = positionMap[curId];
      if (!curPos) return;
      const nextId  = i < blocks.length - 1 ? String(blocks[i + 1]._id || blocks[i + 1].id) : null;
      const nextPos = nextId ? positionMap[nextId] : null;
      const fromX   = curPos.absX + curPos.width;
      const toX     = nextPos ? nextPos.absX : outputX;
      nodes.push({ id: i + 1, cx: (fromX + toX) / 2, cy: centerY });
    });

    return nodes;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elkGraph, blocks, positionMap, inputX, outputX, centerY]);

  // Early return AFTER all hooks - only while loading and nothing to show yet
  if (loading && !layoutResult) {
    return (
      <svg width={RC.MIN_CANVAS_W} height={RC.MIN_CANVAS_H}>
        <text x={RC.MIN_CANVAS_W / 2} y={RC.MIN_CANVAS_H / 2}
          textAnchor="middle" fill="#999" fontSize="12">
          Computing layout...
        </text>
      </svg>
    );
  }

  if (!layoutResult) return null;

  // renderParallelSection - uses ELK positions for rails and branch wires
  const renderParallelSection = (block, sectionPos) => {
    const sectionId = String(block._id || block.id);
    const branches  = block.branches || [];
    const k         = block.k || 1;
    const n         = block.n || branches.length;

    const secAbsX = sectionPos.absX;
    const secAbsY = sectionPos.absY;
    const secW    = sectionPos.width;
    const secH    = sectionPos.height;

    const leftRailX  = secAbsX + RC.RAIL_PAD_X;
    const rightRailX = secAbsX + secW - RC.RAIL_PAD_X;

    // Rail top/bottom from ELK branch positions
    const branchWireYs = branches.map((branch, bIdx) => {
      const branchId  = String(branch._id || branch.id || bIdx);
      const branchPos = positionMap[branchId];
      if (!branchPos) return secAbsY + secH / 2;
      return branchPos.absY + branchPos.height / 2;
    });

    const railTop    = branchWireYs.length > 0 ? Math.min(...branchWireYs) : secAbsY + 10;
    const railBottom = branchWireYs.length > 0 ? Math.max(...branchWireYs) : secAbsY + secH - 10;

    return (
      <g key={sectionId}>
        {/* K:N label above left rail */}
        <text x={leftRailX} y={railTop - 8}
          textAnchor="middle" fontSize="8" fontWeight="bold" fill={COLORS.label}>
          {k}:{n}
        </text>

        {/* Left vertical rail */}
        <line x1={leftRailX} y1={railTop} x2={leftRailX} y2={railBottom}
          stroke={COLORS.rail} strokeWidth="1.5" />

        {/* Right vertical rail */}
        <line x1={rightRailX} y1={railTop} x2={rightRailX} y2={railBottom}
          stroke={COLORS.rail} strokeWidth="1.5" />

        {/* Each branch */}
        {branches.map((branch, bIdx) => {
          const branchId  = String(branch._id || branch.id || bIdx);
          const branchPos = positionMap[branchId];
          if (!branchPos) return null;

          const wireY        = branchPos.absY + branchPos.height / 2;
          const branchBlocks = branch.blocks || [];
          const isMain       = bIdx === 0;
          const dash         = isMain ? undefined : '5,3';
          const leftNodeId   = `branch-${branchId}-left`;
          const rightNodeId  = `branch-${branchId}-right`;
          const midNodeId    = i => `branch-${branchId}-mid-${i}`;

          if (branchBlocks.length === 0) {
            return (
              <g key={branchId}>
                <line x1={leftRailX} y1={wireY} x2={rightRailX} y2={wireY}
                  stroke={COLORS.wire} strokeWidth="1.5" strokeDasharray={dash} />
                <circle cx={leftRailX} cy={wireY} r={4}
                  fill={selectedNode === leftNodeId ? COLORS.nodeActive : COLORS.node}
                  style={{ cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation();
                    onOpenMenu(e.clientX, e.clientY, branch?.index);
                    setIdforApi({ branchId: branch._id, branchIndex: branch.index, ItemId: block._id || block.id, location: `branch-${branch.index}-left` });
                  }} />
                <circle cx={rightRailX} cy={wireY} r={4}
                  fill={selectedNode === rightNodeId ? COLORS.nodeActive : COLORS.node}
                  style={{ cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation();
                    onOpenMenu(e.clientX, e.clientY, branch?.index);
                    setIdforApi({ branchId: branch._id, branchIndex: branch.index, ItemId: block._id || block.id, location: `branch-${branch.index}-right` });
                  }} />
              </g>
            );
          }

          // Get ELK positions for blocks in this branch
          const blockPositions = branchBlocks.map((blk, i) => {
            const blkId = String(blk._id || blk.id || `${branchId}-blk-${i}`);
            const pos   = positionMap[blkId];
            return pos ? { blk, blkId, absX: pos.absX, absY: pos.absY, w: pos.width, h: pos.height } : null;
          }).filter(Boolean);

          if (blockPositions.length === 0) {
            return (
              <g key={branchId}>
                <line x1={leftRailX} y1={wireY} x2={rightRailX} y2={wireY}
                  stroke={COLORS.wire} strokeWidth="1.5" strokeDasharray={dash} />
              </g>
            );
          }

          const firstBP = blockPositions[0];

          return (
            <g key={branchId}>
              {/* Left rail node */}
              <circle cx={leftRailX} cy={wireY} r={4}
                fill={selectedNode === leftNodeId ? COLORS.nodeActive : COLORS.node}
                style={{ cursor: 'pointer' }}
                onClick={e => {
                  e.stopPropagation();
                  onOpenMenu(e.clientX, e.clientY, branch?.index);
                  setIdforApi({ branchId: branch._id, branchIndex: branch.index, ItemId: block._id || block.id, location: `branch-${branch.index}-left` });
                }} />

              {/* Left rail to first block */}
              <line x1={leftRailX} y1={wireY} x2={firstBP.absX} y2={wireY}
                stroke={COLORS.wire} strokeWidth="1.5" strokeDasharray={dash} />

              {/* Blocks */}
              {blockPositions.map((bp, i) => {
                const isLast = i === blockPositions.length - 1;
                const next   = blockPositions[i + 1];
                const blockY = wireY - bp.h / 2;   // centered on wire

                return (
                  <g key={bp.blkId}
                    onClick={() => { setParentItem(block); setParentItemId(block._id || block.id); }}
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setParentItem(block); setParentItemId(block._id || block.id); }}>

                    {/* Nested parallel section or regular block */}
                    {(bp.blk.type === 'Parallel Section' || bp.blk.elementType === 'Parallel Section')
                      ? renderParallelSection(bp.blk, positionMap[bp.blkId])
                      : <BlockShape x={bp.absX} y={blockY} blockData={bp.blk} onEdit={onEditBlock} setParentItemId={setParentItemId} />
                    }

                    {/* Wire + mid-node to next block */}
                    {!isLast && next && (
                      <>
                        <line x1={bp.absX + bp.w} y1={wireY} x2={next.absX} y2={wireY}
                          stroke={COLORS.wire} strokeWidth="1.5" strokeDasharray={dash} />
                        <circle cx={(bp.absX + bp.w + next.absX) / 2} cy={wireY} r={4}
                          fill={selectedNode === midNodeId(i) ? COLORS.nodeActive : COLORS.node}
                          style={{ cursor: 'pointer' }}
                          onClick={e => {
                            e.stopPropagation();
                            onOpenMenu(e.clientX, e.clientY, branch?.index);
                            setIdforApi({ branchId: branch._id, branchIndex: branch.index, ItemId: block._id || block.id, location: `branch-${branch.index}-right` });
                          }} />
                      </>
                    )}

                    {/* Last block to right rail */}
                    {isLast && (
                      <line x1={bp.absX + bp.w} y1={wireY} x2={rightRailX} y2={wireY}
                        stroke={COLORS.wire} strokeWidth="1.5" strokeDasharray={dash} />
                    )}
                  </g>
                );
              })}

              {/* Right rail node */}
              <circle cx={rightRailX} cy={wireY} r={4}
                fill={selectedNode === rightNodeId ? COLORS.nodeActive : COLORS.node}
                style={{ cursor: 'pointer' }}
                onClick={e => {
                  e.stopPropagation();
                  onOpenMenu(e.clientX, e.clientY, branch?.index);
                  setIdforApi({ branchId: branch._id, branchIndex: branch.index, ItemId: block._id || block.id, location: `branch-${branch.index}-right` });
                }} />
            </g>
          );
        })}
      </g>
    );
  };

  // renderBlock - dispatches to parallel section or leaf block
  const renderBlock = (block) => {
    const id  = String(block._id || block.id);
    const pos = positionMap[id];
    if (!pos) return null;

    const type = block.type || block.elementType || block?.data?.elementType;

    if (type === 'Parallel Section') {
      return <React.Fragment key={id}>{renderParallelSection(block, pos)}</React.Fragment>;
    }

    return (
      <BlockShape
        key={id}
        x={pos.absX}
        y={centerY - RC.BLOCK_H / 2}
        blockData={block}
        onEdit={onEditBlock}
        setParentItemId={setParentItemId}
      />
    );
  };

  // Main wire segments
  const buildMainWire = () => {
    const lines = [];
    if (!blocks || blocks.length === 0) {
      lines.push({ x1: inputX + RC.TERMINAL_W, x2: outputX, y: centerY });
      return lines;
    }

    const firstId  = String(blocks[0]._id || blocks[0].id);
    const firstPos = positionMap[firstId];
    if (firstPos) {
      lines.push({ x1: inputX + RC.TERMINAL_W, x2: firstPos.absX, y: centerY });
    }

    blocks.forEach((block, i) => {
      if (i === blocks.length - 1) return;
      const curPos  = positionMap[String(block._id || block.id)];
      const nextPos = positionMap[String(blocks[i + 1]._id || blocks[i + 1].id)];
      if (!curPos || !nextPos) return;
      const fromX = curPos.absX + curPos.width;
      const toX   = nextPos.absX;
      if (fromX < toX) lines.push({ x1: fromX, x2: toX, y: centerY });
    });

    const lastId  = String(blocks[blocks.length - 1]._id || blocks[blocks.length - 1].id);
    const lastPos = positionMap[lastId];
    if (lastPos) {
      lines.push({ x1: lastPos.absX + lastPos.width, x2: outputX, y: centerY });
    }

    return lines;
  };

  const wireLines = buildMainWire();

  // Arrow polygons for terminal boxes
  const leftArrow = [
    [inputX + RC.TERMINAL_W,              centerY - RC.ARROW_H / 2],
    [inputX + RC.TERMINAL_W - RC.ARROW_W, centerY],
    [inputX + RC.TERMINAL_W,              centerY + RC.ARROW_H / 2],
  ].map(p => p.join(',')).join(' ');

  const rightArrow = [
    [outputX,               centerY - RC.ARROW_H / 2],
    [outputX + RC.ARROW_W,  centerY],
    [outputX,               centerY + RC.ARROW_H / 2],
  ].map(p => p.join(',')).join(' ');

  return (
    <svg
      width={canvasW} height={canvasH}
      viewBox={`0 0 ${canvasW} ${canvasH}`}
      style={{ overflow: 'visible' }}
    >
      {/* Main wire */}
      {wireLines.map((seg, i) => (
        <line key={`w${i}`} x1={seg.x1} y1={seg.y} x2={seg.x2} y2={seg.y}
          stroke={COLORS.wire} strokeWidth="2" />
      ))}

      {/* Input terminal */}
      <g onClick={() => onNodeClick?.('LEFT')} style={{ cursor: 'pointer' }}>
        <rect x={inputX} y={centerY - RC.TERMINAL_H / 2}
          width={RC.TERMINAL_W} height={RC.TERMINAL_H} fill={COLORS.terminal} />
        <polygon points={leftArrow} fill="white" />
        <text x={inputX + RC.TERMINAL_W / 2} y={centerY}
          textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">
          Input
        </text>
      </g>

      {/* Output terminal */}
      <g onClick={() => onNodeClick?.('RIGHT')} style={{ cursor: 'pointer' }}>
        <rect x={outputX} y={centerY - RC.TERMINAL_H / 2}
          width={RC.TERMINAL_W} height={RC.TERMINAL_H} fill={COLORS.terminal} />
        <polygon points={rightArrow} fill="white" />
        <text x={outputX + RC.TERMINAL_W / 2} y={centerY}
          textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">
          Output
        </text>
      </g>

      {/* Top-level blocks */}
      {(blocks || []).map(block => renderBlock(block))}

      {/* Insertion nodes */}
      {insertionNodes.map(node => (
        <InsertionNode
          key={node.id}
          cx={node.cx} cy={node.cy}
          nodeId={node.id}
          selectedNode={selectedNode}
          onOpenMenu={onOpenMenu}
        />
      ))}
    </svg>
  );
};

export default RBDSvgRenderer;