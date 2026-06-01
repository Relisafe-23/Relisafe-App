// useRBDLayout.js
// ─────────────────────────────────────────────────────────────────────────────
// Converts your DB blocks[] into an ELK graph, runs the layout engine,
// and returns a flat positionMap: { id → { x, y, width, height, absX, absY } }
//
// KEY FIXES vs previous version:
//   1. Always runs ELK even when blocks[] is empty (no early return)
//   2. Falls back to hand-crafted positions on ELK error so diagram always renders
//   3. loading starts as true so RBDSvgRenderer shows spinner on first mount
//
// Install: npm install elkjs
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';

// ── Layout constants ──────────────────────────────────────────────────────────
export const RC = {
  BLOCK_W:         60,
  BLOCK_H:         40,
  BLOCK_GAP:       20,
  BRANCH_GAP:      20,
  RAIL_PAD_X:      20,
  INNER_PAD_X:     14,
  TERMINAL_W:      60,
  TERMINAL_H:      40,
  TERMINAL_LEFT_X: 50,
  CENTER_Y:        200,
  NODE_R:          5,
  MIN_CANVAS_W:    800,
  MIN_CANVAS_H:    420,
  ARROW_W:         12,
  ARROW_H:         16,
};

const elk = new ELK();

// ─────────────────────────────────────────────────────────────────────────────
// buildELKGraph — works for both empty and populated blocks[]
// ─────────────────────────────────────────────────────────────────────────────
function buildELKGraph(blocks) {
  const topLevelChildren = [];
  const topLevelEdges    = [];

  const SOURCE_ID = '__SOURCE__';
  const SINK_ID   = '__SINK__';

  topLevelChildren.push({ id: SOURCE_ID, width: RC.TERMINAL_W, height: RC.TERMINAL_H });

  let prevId = SOURCE_ID;

  (blocks || []).forEach((block) => {
    const node = buildNode(block);
    topLevelChildren.push(node);
    topLevelEdges.push({
      id:      `e-${prevId}-${node.id}`,
      sources: [prevId],
      targets: [node.id],
    });
    prevId = node.id;
  });

  topLevelChildren.push({ id: SINK_ID, width: RC.TERMINAL_W, height: RC.TERMINAL_H });
  topLevelEdges.push({
    id:      `e-${prevId}-${SINK_ID}`,
    sources: [prevId],
    targets: [SINK_ID],
  });

  return {
    id: 'root',
    layoutOptions: {
      'elk.algorithm':                             'layered',
      'elk.direction':                             'RIGHT',
      'elk.layered.spacing.nodeNodeBetweenLayers': String(RC.BLOCK_GAP),
      'elk.spacing.nodeNode':                      String(RC.BRANCH_GAP),
      'elk.hierarchyHandling':                     'INCLUDE_CHILDREN',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.padding':                               '[top=20,left=20,bottom=20,right=20]',
    },
    children: topLevelChildren,
    edges:    topLevelEdges,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// buildNode — leaf blocks and recursive parallel sections
// ─────────────────────────────────────────────────────────────────────────────
function buildNode(block) {
  const id   = String(block._id || block.id);
  const type = block.type || block.elementType || block?.data?.elementType || 'Regular';

  if (type === 'Parallel Section') {
    return buildParallelSectionNode(block, id);
  }

  // Regular / K-out-of-N / SubRBD — leaf block
  return {
    id,
    width:  RC.BLOCK_W,
    height: RC.BLOCK_H,
    layoutOptions: { 'elk.nodeLabels.placement': 'INSIDE V_CENTER H_CENTER' },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// buildParallelSectionNode
// ─────────────────────────────────────────────────────────────────────────────
function buildParallelSectionNode(block, id) {
  const branches   = block.branches || [];
  const branchNodes = [];
  const secEdges   = [];

  const secLeftId  = `${id}__secLeft`;
  const secRightId = `${id}__secRight`;

  branches.forEach((branch, bIdx) => {
    const branchId     = String(branch._id || branch.id || bIdx);
    const branchBlocks = branch.blocks || [];

    const branchChildren = [];
    const branchEdges    = [];

    const bLeftId  = `${branchId}__left`;
    const bRightId = `${branchId}__right`;

    branchChildren.push({ id: bLeftId, width: 4, height: 4 });

    let prevId = bLeftId;

    branchBlocks.forEach((blk, idx) => {
      const blkId = String(blk._id || blk.id || `${branchId}-blk-${idx}`);
      const node  = buildNode(blk); // recursive for nested parallel
      node.id     = blkId;
      branchChildren.push(node);
      branchEdges.push({
        id:      `e-${prevId}-${blkId}`,
        sources: [prevId],
        targets: [blkId],
      });
      prevId = blkId;
    });

    branchChildren.push({ id: bRightId, width: 4, height: 4 });
    branchEdges.push({
      id:      `e-${prevId}-${bRightId}`,
      sources: [prevId],
      targets: [bRightId],
    });

    branchNodes.push({
      id: branchId,
      layoutOptions: {
        'elk.algorithm':                             'layered',
        'elk.direction':                             'RIGHT',
        'elk.layered.spacing.nodeNodeBetweenLayers': String(RC.BLOCK_GAP),
        'elk.spacing.nodeNode':                      String(RC.BLOCK_GAP),
        'elk.padding': `[top=0,left=${RC.INNER_PAD_X},bottom=0,right=${RC.INNER_PAD_X}]`,
      },
      children: branchChildren,
      edges:    branchEdges,
    });

    // Connect section left/right anchors to branch left/right anchors
    secEdges.push({ id: `e-sl-${branchId}`, sources: [secLeftId],  targets: [bLeftId]   });
    secEdges.push({ id: `e-sr-${branchId}`, sources: [bRightId],   targets: [secRightId] });
  });

  return {
    id,
    layoutOptions: {
      'elk.algorithm':        'layered',
      'elk.direction':        'RIGHT',
      'elk.spacing.nodeNode': String(RC.BRANCH_GAP),
      'elk.padding':          `[top=10,left=${RC.RAIL_PAD_X},bottom=10,right=${RC.RAIL_PAD_X}]`,
    },
    children: [
      { id: secLeftId,  width: 4, height: 4 },
      ...branchNodes,
      { id: secRightId, width: 4, height: 4 },
    ],
    edges: secEdges,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// flattenPositions
// Recursively walks ELK output and builds absolute-coordinate map.
// ELK gives positions relative to parent — we accumulate offsets.
// ─────────────────────────────────────────────────────────────────────────────
function flattenPositions(node, offsetX = 0, offsetY = 0, map = {}) {
  const absX = offsetX + (node.x || 0);
  const absY = offsetY + (node.y || 0);

  map[node.id] = {
    x:      node.x      || 0,
    y:      node.y      || 0,
    width:  node.width  || 0,
    height: node.height || 0,
    absX,
    absY,
  };

  (node.children || []).forEach(child => flattenPositions(child, absX, absY, map));

  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildFallbackLayout
// Used when ELK fails to compute. Produces a minimal but valid layout
// so the diagram always renders Input → wire → blocks → Output.
// ─────────────────────────────────────────────────────────────────────────────
function buildFallbackLayout(blocks) {
  const cy  = RC.CENTER_Y;
  const map = {};

  map['__SOURCE__'] = {
    absX: RC.TERMINAL_LEFT_X,
    absY: cy - RC.TERMINAL_H / 2,
    width: RC.TERMINAL_W, height: RC.TERMINAL_H,
  };

  const outputX = RC.MIN_CANVAS_W - RC.TERMINAL_W - 20;
  map['__SINK__'] = {
    absX: outputX,
    absY: cy - RC.TERMINAL_H / 2,
    width: RC.TERMINAL_W, height: RC.TERMINAL_H,
  };

  let curX = RC.TERMINAL_LEFT_X + RC.TERMINAL_W + 60;
  (blocks || []).forEach((block) => {
    const id = String(block._id || block.id);
    map[id] = {
      absX: curX,
      absY: cy - RC.BLOCK_H / 2,
      width: RC.BLOCK_W, height: RC.BLOCK_H,
    };
    curX += RC.BLOCK_W + RC.BLOCK_GAP;
  });

  return {
    positionMap: map,
    elkGraph: {
      id: 'root',
      width:    RC.MIN_CANVAS_W,
      height:   RC.MIN_CANVAS_H,
      children: [],
      edges:    [],
    },
    canvasW: RC.MIN_CANVAS_W,
    canvasH: RC.MIN_CANVAS_H,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useRBDLayout  — the hook
//
// ALWAYS runs ELK (even for empty blocks) so the SVG shell always renders.
// Falls back to hand-crafted positions on ELK error.
// ─────────────────────────────────────────────────────────────────────────────
export function useRBDLayout(blocks) {
  // Start with loading=true so the first render shows "Computing layout…"
  // instead of a blank screen
  const [layoutResult, setLayoutResult] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const graph = buildELKGraph(blocks || []);

    elk.layout(graph)
      .then(layoutedGraph => {
        const positionMap = flattenPositions(layoutedGraph);
        const canvasW = Math.max(RC.MIN_CANVAS_W, (layoutedGraph.width  || 0) + 100);
        const canvasH = Math.max(RC.MIN_CANVAS_H, (layoutedGraph.height || 0) + 100);
        setLayoutResult({ positionMap, elkGraph: layoutedGraph, canvasW, canvasH });
        setLoading(false);
      })
      .catch(err => {
        console.error('ELK layout failed — using fallback layout:', err);
        setError(err);
        // Fallback guarantees the diagram always renders something useful
        setLayoutResult(buildFallbackLayout(blocks));
        setLoading(false);
      });
  // JSON.stringify is intentional — deep comparison to re-run on any block change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(blocks)]);

  return { layoutResult, loading, error };
}