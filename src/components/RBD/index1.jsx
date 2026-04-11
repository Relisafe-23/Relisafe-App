// import React, { useState, useEffect } from 'react';
// import SplitKofN from './SplitKofN';
// import Api from "../../Api";
// import EditRBDConfigurationModal from './EditRBDConfigurationModal';
// import { useParams, useLocation } from 'react-router-dom';
// import CreatableSelect from "react-select/creatable";
// import { FiSettings, FiEdit2, FiSliders } from 'react-icons/fi';
// import { ElementParametersModal } from './ElementParametersModal';
// import { KOfNConfigModal } from './KOfNConfigModal.js';
// import SwitchConfigurationModal from './SwitchConfig.js';
// import { RBDBlock } from './RBDBlock';
// import { KOfNBlock } from './KOfNBlock';
// import { toast } from 'react-toastify';
// import { SignalCellularNull } from '@material-ui/icons';

// export const InsertionNode = ({ index, x, y, onOpenMenu }) => {
//   return (
//     <g>
//       <circle
//         cx={x}
//         cy={y}
//         r="6"
//         fill="black"
//         style={{ cursor: "pointer" }}
//         onClick={(e) => onOpenMenu(e.clientX, e.clientY, index)}
//       />
//       <line
//         x1={x - 3} y1={y}
//         x2={x + 3} y2={y}
//         stroke="white"
//         strokeWidth="1.5"
//       />
//       <line
//         x1={x} y1={y - 3}
//         x2={x} y2={y + 3}
//         stroke="white"
//         strokeWidth="1.5"
//       />
//     </g>
//   );
// };

// export const BiDirectionalSymbol = ({ onNodeClick, setParentItem, setParentItemId, onOpenMenu, setIdforApi, blocks, onDeleteBlock, onEditBlock, selectedNode }) => {
//   const boxWidth = 60;
//   const boxHeight = 60;
//   const arrowWidth = 15;
//   const arrowHeight = 20;
//   const centerPointY = 150;
//   const nodeRadius = 6;
//   const blockWidth = 60;
//   const blockHeight = 70;
//   const nodeSpacing = 20;
//   const blockSpacing = 20;
//   const minOutputGap = 50;
//   const parallelVerticalSpacing = 50;

//   const leftBoxX = 50;
//   const baseRightBoxX = 650;

//   // console.log(blocks, 'blocks from BI')

//   const processBlocksWithParallelSections = (blocks) => {
//     const parallelSections = {};
//     const normalBlocks = [];

//     blocks.forEach(block => {
//       if (block.type === 'Parallel Section') {
//         parallelSections[block.id] = {
//           ...block,
//           branches: []
//         };
//       }
//     });

//     blocks.forEach(block => {
//       if (block.data?.parentSection && parallelSections[block.data.parentSection]) {
//         parallelSections[block.data.parentSection].branches.push(block);
//       }
//     });

//     return parallelSections;
//   };

//   const calculateLayout = () => {
//     const parallelSections = processBlocksWithParallelSections(blocks);

//     let maxY = centerPointY + 150;

//     if (blocks.length === 0) {
//       const centerX = (leftBoxX + boxWidth + baseRightBoxX) / 2;
//       return {
//         items: [],
//         totalWidth: 0,
//         startX: centerX,
//         actualRightBoxX: baseRightBoxX,
//         parallelSections: {},
//         maxY: maxY,
//         topLevelBlocks: []
//       };
//     }

//     const topLevelBlocks = blocks.filter(block =>
//       block.type === 'Parallel Section' || !block.data?.parentSection
//     );

//     const totalTopLevelBlocks = topLevelBlocks.length;
//     const totalNodesWidth = (totalTopLevelBlocks * 2 + 1) * nodeSpacing;
//     const totalBlockSpacing = (totalTopLevelBlocks - 1) * blockSpacing;

//     let totalElementsWidth = 0;

//     // Calculate dynamic widths for parallel sections based on their blocks
//     topLevelBlocks.forEach(block => {
//       // console.log(block, 'block from forEach')
//       if (block?.type === 'Parallel Section' || block?.blockType === 'Parallel Section') {
//         const section = parallelSections[block.id];
//         if (section) {
//           // Calculate max blocks in any branch
//           const maxBlocksInBranch = Math.max(...(section.branches || []).map(b => (b.blocks || []).length));
//           const baseWidth = 160;
//           const additionalWidthPerBlock = maxBlocksInBranch > 0
//             ? maxBlocksInBranch * 70 // 60 width + 10 spacing
//             : 0;
//           totalElementsWidth += baseWidth + additionalWidthPerBlock + 30;
//         } else {
//           totalElementsWidth += 160; // Default width
//         }
//       } else {
//         totalElementsWidth += blockWidth;
//       }
//     });

//     const totalNeededWidth = totalElementsWidth + totalNodesWidth + totalBlockSpacing;
//     const requiredRightBoxX = leftBoxX + boxWidth + totalNeededWidth + minOutputGap + boxWidth;
//     const actualRightBoxX = Math.max(baseRightBoxX, requiredRightBoxX);

//     const availableWidth = actualRightBoxX - leftBoxX - boxWidth * 2;
//     const startX = leftBoxX + boxWidth + (availableWidth - totalNeededWidth) / 2 + nodeSpacing;

//     const items = [];
//     let currentX = startX;
//     let nodeIndex = 0;

//     items.push({
//       type: 'node',
//       id: 'node-start',
//       x: currentX,
//       y: centerPointY,
//       nodeIndex: nodeIndex++
//     });
//     currentX += nodeSpacing;

//     topLevelBlocks.forEach((block) => {
//       // console.log(block, ' blok to store')
//       if (block?.type === 'Parallel Section' || block?.blockType === 'Parallel Section') {
//         const section = parallelSections[block.id];
//         if (section) {
//           const branchCount = section.branches.length;

//           const branchHeight = 60;
//           const branchSpacing = 20;
//           const totalBranchesHeight = branchCount * branchHeight + (branchCount - 1) * branchSpacing;
//           const sectionHeight = totalBranchesHeight + 40;

//           const startY = centerPointY - (sectionHeight / 2);

//           if (startY + sectionHeight + 30 > maxY) {
//             maxY = startY + sectionHeight + 50;
//           }

//           items.push({
//             type: 'parallel-section',
//             id: block.id,
//             blockType: block.type,
//             blockData: block.branches,
//             x: currentX,
//             y: startY,
//             width: 160,
//             height: sectionHeight,
//             branches: block.branches,
//             branchCount: block.branches.length,
//             leftConnectionX: currentX,
//             rightConnectionX: currentX + 160,
//             centerY: centerPointY
//           });

//           // submitParallelSection(section)

//           currentX += 160 + blockSpacing;
//         }
//       } else {
//         items.push({
//           type: 'block',
//           id: block.id,
//           blockType: block.type,
//           blockData: block,
//           x: currentX,
//           y: centerPointY - 20
//         });
//         currentX += blockWidth + blockSpacing;
//       }

//       items.push({
//         type: 'node',
//         id: `node-${block.id}`,
//         x: currentX,
//         y: centerPointY,
//         nodeIndex: nodeIndex++
//       });
//       currentX += nodeSpacing;
//     });

//     return {
//       items,
//       totalWidth: currentX - startX,
//       startX,
//       actualRightBoxX,
//       parallelSections,
//       topLevelBlocks,
//       maxY: Math.max(maxY, centerPointY + 100)
//     };
//   };


//   const renderParallelSection = (item) => {
//     console.log(item, 'item')
//     const { x, y, width, branches, id, blockData } = item;

//     if (!branches || branches.length === 0) return null;

//     const branchHeight = 60;
//     const branchSpacing = 20;
//     const blockWidth = 60;
//     const blockSpacing = 12;

//     const maxBlocksInBranch = Math.max(...branches.map(b => (b.blocks || []).length));

//     const baseWidth = 160;
//     const additionalWidthPerBlock = maxBlocksInBranch > 0
//       ? maxBlocksInBranch * (blockWidth + blockSpacing)
//       : 0;


//     const dynamicWidth = baseWidth + additionalWidthPerBlock + 30;

//     item.width = dynamicWidth;

//     const totalBranchesHeight = branches.length * branchHeight + (branches.length - 1) * branchSpacing;
//     const sectionHeight = totalBranchesHeight + 40;

//     const mainBranchIndex = 0;
//     const mainBranchY = centerPointY - branchHeight / 2;


//     const startY = mainBranchY - mainBranchIndex * (branchHeight + branchSpacing);

//     const leftRailX = x + 30;
//     const rightRailX = x + dynamicWidth - 10;
//     const topY = startY + 20;
//     const bottomY = startY + sectionHeight - 20;


//     return (
//       <g
//         key={id}

//       >

//         <line
//           x1={x}
//           y1={centerPointY}
//           x2={x - 10}
//           y2={centerPointY}
//           stroke="black"
//           strokeWidth="2"
//         />


//         <line
//           x1={x + dynamicWidth}
//           y1={centerPointY}
//           x2={x + dynamicWidth}
//           y2={centerPointY}
//           stroke="black"
//           strokeWidth="2"
//         />

//         {/* Left vertical rail */}
//         <line
//           x1={leftRailX - 30}
//           y1={topY - 70}
//           x2={leftRailX - 30}
//           y2={bottomY - 130}
//           stroke="black"
//           strokeWidth="2"
//         />

//         {/* Right vertical rail */}
//         <line
//           x1={rightRailX - 100}
//           y1={topY - 70}
//           x2={rightRailX - 100}
//           y2={bottomY - 130}
//           stroke="black"
//           strokeWidth="2"
//         />

//         {/* K:N label */}
//         <text
//           x={x + dynamicWidth / 2}
//           y={startY - 88}
//           textAnchor="middle"
//           dominantBaseline="middle"
//           fontSize="10"
//           fontWeight="bold"
//           fill="#333"
//         >
//           K={blockData?.k || 1}:N={branches.length}
//         </text>

//         {branches?.map((branch, index) => {
//           const branchY = startY + 20 + index * (branchHeight + branchSpacing);
//           const branchCenterY = branchY + branchHeight / 2;
//           const branchBlocks = branch.blocks || [];
//           const isMainBranch = index === 0; // First branch is main branch (at center)



//           return (
//             <g key={branch.id}>
//               {/* Connection from left rail to this branch */}
//               {/* <line
//               x1={leftRailX}
//               y1={branchCenterY}
//               x2={leftRailX - 10}
//               y2={branchCenterY}
//               stroke="black"
//               strokeWidth="2"
//               strokeDasharray={isMainBranch ? "none" : "5,3"} // Dashed for bypass branch
//             /> */}

//               {/* Left node for branch */}
//               {/* {console.log(branch,'branches')} */}
//               {/* {console.log(selectedNode,'selectedNode')} */}
//               {/* <circle
//                 cx={leftRailX - 10}
//                 cy={branchCenterY - 100}
//                 r="4"
//                 fill={selectedNode === `branch-${branch.index}-left` ? "#0078d4" : "black"}
//                 style={{ cursor: "pointer" }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onOpenMenu(e.clientX, e.clientY, `branch-${branch.index}-left`);
//                   // console.log(branch?._id, 'branchindex')
//                   // console.log(branch?.index, 'item data')
//                   // console.log(item, 'item data')
//                   setIdforApi({ branchId: branch?._id, branchIndex: branch?.index, ItemId: item?.id, location: `branch-${branch.index}-left` })

//                   // setCurrentIds({blockId : , })
//                 }}
//               /> */}

//               {/* Horizontal line from left rail to first block */}
//               <line
//                 x1={leftRailX - 31}
//                 y1={branchCenterY - 100}
//                 x2={branchBlocks.length === 0 ? rightRailX - 50 : leftRailX + 10}
//                 y2={branchCenterY - 100}
//                 stroke="black"
//                 strokeWidth="2"
//                 strokeDasharray={isMainBranch ? "none" : "5,3"}
//               />

//               {branchBlocks.length === 0 ? (
//                 <>
//                   {/* Direct connection to right rail */}
//                   <line
//                     x1={leftRailX - 31}
//                     y1={branchCenterY - 100}
//                     x2={rightRailX - 10}
//                     y2={branchCenterY - 100}
//                     stroke="black"
//                     strokeWidth="2"
//                     strokeDasharray={isMainBranch ? "none" : "5,3"}
//                   />
//                   <line
//                     x1={rightRailX - 30}
//                     y1={branchCenterY}
//                     x2={rightRailX}
//                     y2={branchCenterY}
//                     stroke="black"
//                     strokeWidth="2"
//                     strokeDasharray={isMainBranch ? "none" : "5,3"}
//                   />
//                 </>
//               ) : (
//                 <>
//                   {/* Render blocks horizontally */}
//                   {branchBlocks.map((block, blockIndex) => {
//                     const blockX = leftRailX + 10 + blockIndex * (blockWidth + blockSpacing);
//                     return (
//                       <g
//                         key={block.id}
//                         onClick={() => {
//                           // console.log('Parallel section clicked:', item);
//                           setParentItem(item);
//                           setParentItemId(item?.id)
//                         }}
//                         onContextMenu={(e) => {
//                           e.preventDefault(); // Prevent default browser right-click menu
//                           e.stopPropagation(); // Stop event from bubbling
//                           // console.log('Parallel section right-clicked:', item);
//                           setParentItem(item);
//                           setParentItemId(item?.id)
//                         }}
//                       >
//                         {/* Node before each block (except first) */}
//                         {/* {blockIndex > 0 && (
//                         <circle
//                           cx={blockX - blockSpacing/2}
//                           cy={branchCenterY-100}
//                           r="4"
//                           fill={selectedNode === `branch-${branch.id}-node-${block.id}-left` ? "#0078d4" : "black"}
//                           style={{ cursor: "pointer" }}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             onOpenMenu(e.clientX, e.clientY, `branch-${branch.id}-node-${block.id}-left`);
//                           }}
//                         />
//                       )} */}
//                         {console.log(block, 'it is from parallel data sending block')}

//                         <RBDBlock
//                           id={block.id}
//                           leftRailX={leftRailX}
//                           rightRailX={rightRailX}
//                           type={block.type}
//                           blockSpacing={blockSpacing}
//                           item={item}
//                           setIdforApi={setIdforApi}
//                           branchCenterY={branchCenterY}
//                           selectedNode={selectedNode}
//                           branch={branch}
//                           block={block}
//                           onOpenMenu={onOpenMenu}
//                           x={blockX}
//                           y={branchY - 90}
//                           onEdit={onEditBlock}
//                           onDelete={onDeleteBlock}
//                           blockData={block}
//                           width={blockWidth}
//                           height={branchHeight}
//                           blockIndex={index}
//                           totalBlocks={branch.blocks.length}
//                         />

//                         {/* Node after each block (except last) */}
//                         {/* {
//                           blockIndex < branchBlocks.length - 1 && (
//                             <circle
//                               cx={blockX + blockWidth + blockSpacing / 2}
//                               cy={branchCenterY - 100}
//                               r="4"
//                               fill={selectedNode === `branch-${branch.index}-node-${block.index}-right` ? "#0078d4" : "black"}
//                               style={{ cursor: "pointer" }}
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 onOpenMenu(e.clientX, e.clientY, `branch-${branch.index}-node-${block.index}-right`);
//                               }}
//                             />
//                           )
//                         } */}

//                         {/* Connection line between blocks */}
//                         {
//                           blockIndex < branchBlocks.length - 1 && (
//                             <line
//                               x1={blockX + blockWidth}
//                               y1={branchCenterY - 100}
//                               x2={blockX + blockWidth + blockSpacing}
//                               y2={branchCenterY - 100}
//                               stroke="black"
//                               strokeWidth="2"
//                               strokeDasharray={isMainBranch ? "none" : "5,3"}
//                             />
//                           )
//                         }
//                       </g>
//                     );
//                   })}

//                   {/* Line from last block to right rail */}
//                   <line
//                     x1={leftRailX + 70}
//                     y1={branchCenterY - 100}
//                     x2={rightRailX - 100}
//                     y2={branchCenterY - 100}
//                     stroke="black"
//                     strokeWidth="2"
//                     strokeDasharray={isMainBranch ? "none" : "5,3"}
//                   />

//                   {/* Right node for branch */}
//                   {/* <circle
//                     cx={rightRailX - 130}
//                     cy={branchCenterY - 100}
//                     r="4"
//                     fill={selectedNode === `branch-${branch.index}-right` ? "#0078d4" : "black"}
//                     style={{ cursor: "pointer" }}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onOpenMenu(e.clientX, e.clientY, `branch-${branch.index}-right`);
//                       // console.log(branch?._id, 'branchindex')
//                       // console.log(branch?.index, 'item data')
//                       // console.log(item, 'item data')
//                       setIdforApi({ branchId: branch?._id, branchIndex: branch?.index, ItemId: item?.id, location: `branch-${branch.index}-right` })
//                     }}
//                   /> */}

//                   {/* <line
//                     x1={rightRailX - 30}
//                     y1={branchCenterY - 100}
//                     x2={rightRailX}
//                     y2={branchCenterY - 100}
//                     stroke="black"
//                     strokeWidth="2"
//                     strokeDasharray={isMainBranch ? "none" : "5,3"}
//                   /> */}
//                 </>
//               )
//               }
//             </g>
//           );
//         })
//         }
//       </g >
//     );
//   };

//   const layout = calculateLayout();
//   const items = layout.items;
//   const rightBoxX = layout.actualRightBoxX;
//   const canvasHeight = Math.max(400, layout.maxY + 50);

//   const leftArrowPoints = [
//     [rightBoxX, centerPointY - arrowHeight / 2],
//     [rightBoxX + arrowWidth, centerPointY],
//     [rightBoxX, centerPointY + arrowHeight / 2]
//   ].map(p => p.join(',')).join(' ');

//   const rightArrowPoints = [
//     [leftBoxX + boxWidth, centerPointY - arrowHeight / 2],
//     [leftBoxX + boxWidth - arrowWidth, centerPointY],
//     [leftBoxX + boxWidth, centerPointY + arrowHeight / 2]
//   ].map(p => p.join(',')).join(' ');

//   const getConnectionPoints = () => {
//     const connectionPoints = [];

//     if (items.length === 0) {
//       connectionPoints.push({
//         from: leftBoxX + boxWidth,
//         to: rightBoxX,
//         y: centerPointY
//       });
//     } else {
//       connectionPoints.push({
//         from: leftBoxX + boxWidth,
//         to: items[0].x - nodeRadius,
//         y: centerPointY
//       });

//       for (let i = 0; i < items.length - 1; i++) {
//         const current = items[i];
//         const next = items[i + 1];

//         let fromX, toX;

//         if (current.type === 'block' || current.type === 'parallel-section') {
//           fromX = current.type === 'parallel-section' ? current.x + current.width : current.x + blockWidth;
//         } else {
//           fromX = current.x + nodeRadius;
//         }

//         if (next.type === 'block' || next.type === 'parallel-section') {
//           toX = next.x;
//         } else {
//           toX = next.x - nodeRadius;
//         }

//         connectionPoints.push({
//           from: fromX,
//           to: toX,
//           y: centerPointY
//         });
//       }

//       const lastItem = items[items.length - 1];
//       let lastX;
//       if (lastItem.type === 'block') {
//         lastX = lastItem.x + blockWidth;
//       } else if (lastItem.type === 'parallel-section') {
//         lastX = lastItem.x + lastItem.width;
//       } else {
//         lastX = lastItem.x + nodeRadius;
//       }

//       const minEndX = rightBoxX - minOutputGap;
//       const endX = Math.min(lastX + 20, minEndX);

//       connectionPoints.push({
//         from: lastX,
//         to: endX,
//         y: centerPointY
//       });

//       connectionPoints.push({
//         from: endX,
//         to: rightBoxX,
//         y: centerPointY
//       });
//     }

//     return connectionPoints;
//   };

//   const connectionPoints = getConnectionPoints();
//   const svgWidth = Math.max(750, rightBoxX + 100);

//   const handleNodeClick = (e, nodeId) => {
//     e.stopPropagation();
//     onNodeClick(nodeId);
//     onOpenMenu(e.clientX, e.clientY, nodeId);
//   };

//   return (
//     <svg width={svgWidth} height={canvasHeight} viewBox={`0 0 ${svgWidth} ${canvasHeight}`} style={{ overflow: 'visible' }}>
//       {connectionPoints?.map((point, index) => (
//         <line
//           key={`line-${index}`}
//           x1={point.from}
//           y1={point.y}
//           x2={point.to}
//           y2={point.y}
//           stroke="black"
//           strokeWidth="2"
//         />
//       ))}

//       <g onClick={() => onNodeClick && onNodeClick("LEFT")} style={{ cursor: "pointer" }}>
//         <rect
//           x={leftBoxX}
//           y={centerPointY - boxHeight / 2}
//           width={boxWidth}
//           height={boxHeight}
//           fill="black"
//         />
//         <polygon points={rightArrowPoints} fill="white" />
//         <text
//           x={leftBoxX + boxWidth / 2}
//           y={centerPointY}
//           textAnchor="middle"
//           dominantBaseline="middle"
//           fill="white"
//           fontSize="10"
//           fontWeight="bold"
//         >
//           Input
//         </text>
//       </g>

//       <g onClick={() => onNodeClick && onNodeClick("RIGHT")} style={{ cursor: "pointer" }}>
//         <rect
//           x={rightBoxX}
//           y={centerPointY - boxHeight / 2}
//           width={boxWidth}
//           height={boxHeight}
//           fill="black"
//         />
//         <polygon points={leftArrowPoints} fill="white" />
//         <text
//           x={rightBoxX + boxWidth / 2}
//           y={centerPointY}
//           textAnchor="middle"
//           dominantBaseline="middle"
//           fill="white"
//           fontSize="10"
//           fontWeight="bold"
//         >
//           Output
//         </text>
//       </g>
//       {items?.map((item) => {
//         if (item.type === 'node') {
//           const isSelected = selectedNode === item.nodeIndex;
//           return (
//             <g key={item.id}>
//               {isSelected && (
//                 <circle
//                   cx={item.x}
//                   cy={item.y}
//                   r="10"
//                   fill="none"
//                   stroke="#0078d4"
//                   strokeWidth="2"
//                   strokeDasharray="4 2"
//                 />
//               )}
//               <circle
//                 cx={item.x}
//                 cy={item.y}
//                 r="6"
//                 fill={isSelected ? "#0078d4" : "black"}
//                 style={{ cursor: "pointer" }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onOpenMenu(e.clientX, e.clientY, item.nodeIndex);
//                 }}
//               />
//               <line
//                 x1={item.x - 3} y1={item.y}
//                 x2={item.x + 3} y2={item.y}
//                 stroke="white"
//                 strokeWidth="1.5"
//               />
//               <line
//                 x1={item.x} y1={item.y - 3}
//                 x2={item.x} y2={item.y + 3}
//                 stroke="white"
//                 strokeWidth="1.5"
//               />
//             </g>
//           );
//         } else if (item.type === 'parallel-section') {
//           return renderParallelSection(item);
//         } else if (item.type === 'block') {
//           // { console.log("item....", item) }
//           return (
//             <RBDBlock
//               key={item.id}
//               id={item.id}
//               type={item.blockType}
//               x={item.x}
//               y={item.y}
//               setParentItemId={setParentItemId}
//               onEdit={onEditBlock}
//               onDelete={onDeleteBlock}
//               blockData={item.blockData}
//               width={blockWidth}
//               height={blockHeight}
//             />
//           );
//         }
//         return null;
//       })}

//       {blocks.length === 0 && (
//         <g>
//           {selectedNode === 0 && (
//             <circle
//               cx={layout.startX}
//               cy={centerPointY}
//               r="10"
//               fill="none"
//               stroke="#0078d4"
//               strokeWidth="2"
//               strokeDasharray="4 2"
//             />
//           )}
//           <circle
//             cx={layout.startX}
//             cy={centerPointY}
//             r="6"
//             fill={selectedNode === 0 ? "#0078d4" : "black"}
//             style={{ cursor: "pointer" }}
//             onClick={(e) => {
//               e.stopPropagation();
//               onOpenMenu(e.clientX, e.clientY, 0);
//             }}
//           />
//           <line
//             x1={layout.startX - 3} y1={centerPointY}
//             x2={layout.startX + 3} y2={centerPointY}
//             stroke="white"
//             strokeWidth="1.5"
//           />
//           <line
//             x1={layout.startX} y1={centerPointY - 3}
//             x2={layout.startX} y2={centerPointY + 3}
//             stroke="white"
//             strokeWidth="1.5"
//           />
//         </g>
//       )}
//     </svg>
//   );
// };

// export const RBDContextMenu = ({ x, y, onSelect, onClose, menu }) => {
//   console.log(menu, 'menu from RBDContext')
//   const handleItemClick = (item) => {
//     onSelect(item);
//     onClose();
//   };

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: y,
//         left: x,
//         background: "#fff",
//         border: "1px solid #ccc",
//         boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//         zIndex: 1000,
//         width: "180px"
//       }}
//       onMouseLeave={onClose}
//     >
//       {[
//         "Add Regular",
//         "Add K-out-of-N",
//         "Add SubRBD",
//         "Add Parallel Section",
//         "Add Parallel Branch"
//       ]?.map(item => (
//         <div
//           key={item}
//           onClick={() => handleItemClick(item)}
//           style={{
//             padding: "8px",
//             cursor: "pointer",
//             transition: "background-color 0.2s"
//           }}
//           onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
//           onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
//         >
//           {item}
//         </div>
//       ))}
//     </div>
//   );
// };

// export const BlockContextMenu = ({ x, y, blocks, parallelFoundBlock, setParentItemId, setParallelFoundBlock, parentItem, onSelect, onClose }) => {
//   const handleItemClick = (item) => {
//     // console.log(parentItem)

//     setParallelFoundBlock(null)
//     onSelect(item);
//     onClose();
//   };



//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: y,
//         left: x,
//         background: "#fff",
//         border: "1px solid #ccc",
//         boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//         zIndex: 1001,
//         width: "180px"
//       }}
//       onMouseLeave={onClose}
//     >
//       {[
//         "Edit...",
//         "Delete...",
//         "Split K-out-of-N...",
//         "Add Regular",
//         "Add K-out-of-N",
//         "Add SubRBD",
//         "Add Parallel Section",
//         "Add Parallel Branch"
//       ]?.map(item => (
//         <div
//           key={item}
//           onClick={() => handleItemClick(item)}
//           style={{
//             padding: "8px",
//             cursor: "pointer",
//             transition: "background-color 0.2s"
//           }}
//           onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
//           onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
//         >
//           {item}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default function RBDButton() {

//   const { id, rbdId } = useParams();

//   const projectId = id;

//   // console.log(projectId, 'projectId -', rbdId, 'rbdId')

//   const [parallelBranchMode, setParallelBranchMode] = useState({
//     active: false,
//     startNode: null,
//     endNode: null
//   });
//   const [showSymbol, setShowSymbol] = useState(false);
//   const [menu, setMenu] = useState(null);
//   const [blockMenu, setBlockMenu] = useState({ open: false, parentId: null, blockId: null, x: 0, y: 0 });
//   const [blocks, setBlocks] = useState([]);
//   const [nextId, setNextId] = useState(1);
//   const [selectedNode, setSelectedNode] = useState(null);
//   const [idforApi, setIdforApi] = useState({
//     branchId: null,
//     branchIndex: null,
//     ItemId: null,
//     location: null,
//   })
//   const [clickedNodeInfo, setClickedNodeInfo] = useState({
//     index: null,
//     x: 0,
//     y: 0
//   });
//   const [loadChange, setLoadChange] = useState(false)
//   const [parentItem, setParentItem] = useState(null)
//   const [parentItemId, setParentItemId] = useState(null)
//   const [elementModal, setElementModal] = useState({
//     open: false,
//     mode: 'add',
//     blockId: null,
//     blockType: '',
//     nodeIndex: null,
//     idforApi: null
//   });

//   const [kOfNModal, setKOfNModal] = useState({
//     open: false,
//     blockId: null,
//     initialData: null,
//     mode: 'add',
//     nodeIndex: null
//   });

//   const [showParallelModal, setShowParallelModal] = useState(false);
//   const [branchCount, setBranchCount] = useState(3);
//   const [pendingAction, setPendingAction] = useState(null);
//   const [parallelFoundBlock, setParallelFoundBlock] = useState(null)

//   const location = useLocation();
//   const [switchModal, setSwitchModal] = useState({
//     open: false,
//     blockId: null,
//     initialData: null
//   });

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [rbdConfig, setRbdConfig] = useState({
//     rbdTitle: "My RBD",
//     missionTime: 24,
//     displayUpper: "Part number",
//     displayLower: "MTBF",
//     printRemarks: "Yes"
//   });
//   const [listedRBDs, setListedRBDs] = useState([]);

//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const rbdTitle = queryParams.get('title');
//     const rbdIndex = queryParams.get('index');

//     const { state } = location;
//     if (state) {
//     }
//   }, [location]);

//   useEffect(() => {
//     getBlock();
//   }, [rbdId, projectId, elementModal?.open, loadChange])

//   // Get API for current the blocks 
//   const getBlock = () => {
//     try {
//       Api.get(`/api/v1/elementParametersRBD/getRBD/${rbdId}/${projectId}`)
//         .then((res) => {
//           // console.log(res, 'data got from db ')
//           let dataLength = res.data.data.length
//           if (dataLength > 0) {
//             setShowSymbol(true);
//           } else {
//             setShowSymbol(false);
//           }
//           setBlocks(res.data.data)

//         })
//     } catch (error) {
//       console.log(error, "error")
//     }
//   }


//   const createParallelBranch = (startNode, endNode) => {
//     // console.log("Creating parallel branch from", startNode, "to", endNode);
//     // console.log(blocks, 'blocks')

//     // Parse node indices to find their positions
//     const parseNodeIndex = (nodeIndex) => {
//       if (typeof nodeIndex === 'string' && nodeIndex.startsWith('branch-')) {
//         const parts = nodeIndex.split('-');
//         return {
//           type: 'branch',
//           branchId: parseInt(parts[1]),
//           position: parts[2]
//         };
//       } else {
//         return {
//           type: 'top-level',
//           nodeIndex: parseInt(nodeIndex)
//         };
//       }
//     };

//     const start = parseNodeIndex(startNode);
//     const end = parseNodeIndex(endNode);

//     // Get the top-level blocks
//     const topLevelBlocks = blocks.filter(block =>
//       block.type === 'Parallel Section' || !block.data?.parentSection
//     );

//     // Find the indices where to connect the parallel branch
//     let startBlockIndex = -1;
//     let endBlockIndex = -1;

//     if (start.type === 'top-level' && end.type === 'top-level') {
//       // Node indices correspond to positions between blocks
//       // Node 0 is before first block, node 1 is between block 0 and 1, etc.
//       startBlockIndex = start.nodeIndex;
//       endBlockIndex = end.nodeIndex;
//     }

//     if (startBlockIndex === -1 || endBlockIndex === -1 || startBlockIndex >= endBlockIndex) {
//       alert("Invalid start and end nodes for parallel branch");
//       return;
//     }

//     // Get the blocks that will be in the main branch (between start and end nodes)
//     const mainBranchBlocks = topLevelBlocks.slice(startBlockIndex, endBlockIndex);

//     if (mainBranchBlocks.length === 0) {
//       alert("No blocks between selected nodes");
//       return;
//     }

//     // Create a new parallel section ID
//     const sectionId = nextId;

//     const parallelSectionBlock = {
//       id: sectionId,
//       type: 'Parallel Section',
//       data: {
//         elementType: 'Parallel Section',
//         name: `Parallel Section`,
//         branchCount: 2,
//         sectionId: sectionId,
//         isParallel: true,
//         arrangement: 'horizontal',
//         k: 1,
//         n: 2
//       },
//       branches: []
//     };

//     // Create main branch (top) - contains the original blocks
//     const mainBranchId = nextId + 1;
//     const mainBranch = {
//       id: mainBranchId,
//       type: 'Parallel Branch',
//       data: {
//         elementType: 'Parallel Branch',
//         name: `Main Branch`,
//         branchIndex: 0,
//         parentSection: sectionId,
//         isParallelBranch: true,
//         isMainBranch: true // Flag to identify main branch
//       },
//       blocks: mainBranchBlocks.map(block => ({
//         id: block.id,
//         type: block.type,
//         data: {
//           ...block.data,
//           parentSection: sectionId,
//           originalParentSection: block.data?.parentSection
//         }
//       }))
//     };

//     // Create bypass branch (bottom) - contains a single new block
//     const bypassBranchId = nextId + 2;
//     const bypassBranch = {
//       id: bypassBranchId,
//       type: 'Parallel Branch',
//       data: {
//         elementType: 'Parallel Branch',
//         name: `Bypass Branch`,
//         branchIndex: 1,
//         parentSection: sectionId,
//         isParallelBranch: true,
//         isBypassBranch: true // Flag to identify bypass branch
//       },
//       blocks: [
//         {
//           id: nextId + 3,
//           type: 'Regular',
//           data: {
//             elementType: 'Regular',
//             name: `Bypass Block`,
//             parentSection: sectionId,
//             reliabilityData: null,
//             failureRate: 0.001,
//             mtbf: 1000
//           }
//         }
//       ]
//     };

//     // Remove the original blocks from the top level
//     const blocksToRemove = new Set(mainBranchBlocks.map(b => b.id));
//     const remainingBlocks = blocks.filter(block => !blocksToRemove.has(block.id));

//     const firstBlockId = mainBranchBlocks[0].id;
//     const insertIndex = remainingBlocks.findIndex(block => block.id === firstBlockId);

//     const newBlocks = [...remainingBlocks];

//     if (insertIndex !== -1) {

//       newBlocks.splice(insertIndex, 0, parallelSectionBlock, mainBranch, bypassBranch);
//     } else {

//       newBlocks.push(parallelSectionBlock, mainBranch, bypassBranch);
//     }

//     setBlocks(newBlocks);
//     setNextId(prevId => prevId + 4);
//   }

//   const openMenu = (x, y, index) => {


//     // Check if we're in parallel branch creation mode
//     if (parallelBranchMode.active) {
//       if (!parallelBranchMode.startNode) {
//         setParallelBranchMode({
//           active: false,
//           startNode: null,
//           endNode: null
//         });
//         return;
//       }

//       // Set the end node and create the parallel branch
//       const startNode = parallelBranchMode.startNode;
//       const endNode = index;

//       // Create the parallel branch that goes below the main flow
//       createParallelBranch(startNode, endNode);

//       // Exit parallel branch mode
//       setParallelBranchMode({
//         active: false,
//         startNode: null,
//         endNode: null
//       });

//       return;
//     }

//     // console.log(index,'index---0')
//     // Normal menu opening
//     setMenu({ x, y, index });
//     setSelectedNode(index);
//     setClickedNodeInfo({
//       index: index,
//       x: x,
//       y: y
//     });
//   };
//   const handleNodeClick = (nodeIndex) => {
//     setSelectedNode(nodeIndex);


//     if (parallelBranchMode.active && parallelBranchMode.startNode) {

//     }
//   };


//   const handleOpenParallelModal = (from) => {
//     // console.log("Opening parallel modal from:", from, "at node index:", clickedNodeInfo.index);
//     setPendingAction({
//       from,
//       nodeIndex: clickedNodeInfo.index
//     });
//     setShowParallelModal(true);
//   };

//   const findInsertionIndex = (nodeIndex) => {
//     // console.log("findInsertionIndex called with nodeIndex:", nodeIndex);

//     if (nodeIndex === null || nodeIndex === undefined) {
//       return blocks.length;
//     }

//     if (typeof nodeIndex === 'string' && nodeIndex.startsWith('branch-')) {
//       const parts = nodeIndex.split('-');
//       return {
//         isBranch: true,
//         branchId: parts[1],
//         position: parts[2]
//       };
//     }

//     const topLevelBlocks = blocks.filter(block =>
//       block.type === 'Parallel Section' || !block.data?.parentSection
//     );

//     if (nodeIndex === 0) {
//       console.log("Inserting at beginning (index 0)");
//       return 0;
//     } else if (nodeIndex >= topLevelBlocks.length) {
//       console.log("Inserting at end (index", blocks.length, ")");
//       return blocks.length;
//     } else {
//       const blockAfterNode = topLevelBlocks[nodeIndex];
//       console.log("Block after node:", blockAfterNode);

//       if (blockAfterNode) {
//         const insertIndex = blocks.findIndex(b => b.id === blockAfterNode.id);
//         console.log("Inserting at index:", insertIndex);
//         return insertIndex;
//       } else {
//         console.log("No block after node, inserting at end");
//         return blocks.length;
//       }
//     }
//   };

//   const insertBlockAtPosition = (newBlock, nodeIndex) => {
//     const insertInfo = findInsertionIndex(nodeIndex);

//     if (insertInfo && insertInfo.isBranch) {
//       const { branchId, position } = insertInfo;

//       // Handle different node types
//       let targetBranchId = branchId;
//       let insertPosition = position;
//       let targetBlockId = null;

//       // Check if this is a node between blocks (format: branch-{branchId}-node-{blockId}-{side})
//       if (branchId.includes('-node-')) {
//         const parts = branchId.split('-node-');
//         targetBranchId = parts[0];
//         const blockParts = parts[1].split('-');
//         targetBlockId = blockParts[0];
//         insertPosition = blockParts[1]; // 'left' or 'right'
//       }

//       const branchIndex = blocks.findIndex(b => b.id === parseInt(targetBranchId));
//       if (branchIndex === -1) return;

//       const branch = blocks[branchIndex];
//       const parentSectionId = branch.data?.parentSection;

//       if (newBlock.type !== 'Parallel Section') {
//         const newBlocks = [...blocks];

//         if (!newBlocks[branchIndex].blocks) {
//           newBlocks[branchIndex].blocks = [];
//         }

//         const newBlockWithParent = {
//           ...newBlock,
//           data: { ...newBlock.data, parentSection: parentSectionId }
//         };

//         if (insertPosition === 'left') {
//           if (targetBlockId) {
//             // Insert before a specific block
//             const blockIndex = newBlocks[branchIndex].blocks.findIndex(b => b.id === parseInt(targetBlockId));
//             if (blockIndex !== -1) {
//               newBlocks[branchIndex].blocks.splice(blockIndex, 0, newBlockWithParent);
//             }
//           } else {
//             // Insert at beginning of branch
//             newBlocks[branchIndex].blocks.unshift(newBlockWithParent);
//           }
//         } else {
//           if (targetBlockId) {
//             // Insert after a specific block
//             const blockIndex = newBlocks[branchIndex].blocks.findIndex(b => b.id === parseInt(targetBlockId));
//             if (blockIndex !== -1) {
//               newBlocks[branchIndex].blocks.splice(blockIndex + 1, 0, newBlockWithParent);
//             }
//           } else {
//             // Insert at end of branch
//             newBlocks[branchIndex].blocks.push(newBlockWithParent);
//           }
//         }

//         setBlocks(newBlocks);
//       } else {
//         // Handle adding parallel section at branch level
//         const topLevelBlocks = blocks.filter(block =>
//           block.type === 'Parallel Section' || !block.data?.parentSection
//         );

//         const parentSectionIndex = topLevelBlocks.findIndex(b => b.id === parentSectionId);

//         if (parentSectionIndex !== -1) {
//           let insertAtIndex;

//           if (insertPosition === 'left') {
//             insertAtIndex = blocks.findIndex(b => b.id === parentSectionId);
//           } else {
//             const parentBlockIndex = blocks.findIndex(b => b.id === parentSectionId);
//             const sectionBranches = blocks.filter(b => b.data?.parentSection === parentSectionId);
//             const lastBranchIndex = blocks.findIndex(b => b.id === sectionBranches[sectionBranches.length - 1].id);
//             insertAtIndex = lastBranchIndex + 1;
//           }

//           const newBlocks = [...blocks];
//           newBlocks.splice(insertAtIndex, 0, newBlock);
//           setBlocks(newBlocks);
//         }
//       }
//     } else {
//       // Top level insertion
//       const insertAtIndex = insertInfo;
//       const newBlocks = [...blocks];
//       newBlocks.splice(insertAtIndex, 0, newBlock);
//       setBlocks(newBlocks);
//     }

//     setNextId(prevId => prevId + 1);
//   };



//   const insertBlocksAtPosition = (newBlocksArray, nodeIndex) => {
//     const insertAtIndex = findInsertionIndex(nodeIndex);

//     // console.log("Inserting", newBlocksArray.length, "blocks at index:", insertAtIndex);

//     const newBlocks = [...blocks];
//     newBlocks.splice(insertAtIndex, 0, ...newBlocksArray);


//     // console.log(newBlocks, 'after submit')

//     setBlocks(newBlocks);
//     setNextId(prevId => prevId + newBlocksArray.length);
//   };


//   const submitInlineParallelSection = () => { }


//   const submitParallelSection = (value) => {
//     // console.log(value, 'subit paralel value')
//     try {
//       Api.post(`/api/v1/elementParametersRBD/create/parallelsection/${rbdId}/${projectId}`, value)
//         .then((res) => {
//           toast.success('Successfully Created')
//           getBlock();
//         })
//     } catch (error) {
//       console.log(error)
//     }
//   }


//   const handleParallelModalSubmit = () => {

//     const sectionId = nextId;
//     const branches = [];
//     if (branchCount <= 1) {
//       alert('branch should be atleast 2')
//     } else {
//       for (let i = 0; i < branchCount; i++) {
//         const branchId = sectionId + i + 1;
//         const blockId = sectionId + branchCount + i + 1;

//         // const block = {
//         //   id: blockId,
//         //   type: "Regular",
//         //   data: {
//         //     elementType: "Regular",
//         //     name: `Branch ${i + 1} Block`,
//         //     branchIndex: i,
//         //     parentSection: sectionId,
//         //     reliabilityData: null,
//         //     failureRate: 0.001,
//         //     mtbf: 1000
//         //   }
//         // };

//         const block = {
//           id: blockId,
//           type: "Regular",
//           elementType: "Regular",
//           name: `Branch ${i + 1} Block`,
//           branchIndex: i,
//           parentSection: sectionId,
//           reliabilityData: null,
//           failureRate: 0.001,
//           mtbf: 1000
//         };

//         // const branch = {
//         //   id: branchId,
//         //   type: "Parallel Branch",
//         //   index: i,
//         //   name: `Branch ${i + 1}`,
//         //   data: {
//         //     elementType: "Parallel Branch",
//         //     name: `Branch ${i + 1}`,
//         //     branchIndex: i,
//         //     parentSection: sectionId,
//         //     isParallelBranch: true
//         //   },
//         //   blocks: [block]
//         // };

//         const branch = {
//           id: branchId,
//           type: "Parallel Branch",
//           index: i,
//           name: `Branch ${i + 1}`,
//           elementType: "Parallel Branch",
//           name: `Branch ${i + 1}`,
//           branchIndex: i,
//           parentSection: sectionId,
//           isParallelBranch: true,
//           blocks: [block]
//         };

//         branches.push(branch);
//       }
//       const parallelSectionBlock = {
//         id: sectionId,
//         type: "Parallel Section",
//         arrangement: "horizontal",
//         name: "Parallel Section",
//         k: 1,
//         n: branchCount,
//         branches: branches,

//         data: {
//           elementType: "Parallel Section",
//           name: "Parallel Section",
//           branchCount: branchCount,
//           sectionId: sectionId,
//           isParallel: true,
//           arrangement: "horizontal",
//           k: 1,
//           n: branchCount
//         }
//       };
//       const nodeIndexToUse =
//         pendingAction?.nodeIndex !== undefined
//           ? pendingAction.nodeIndex
//           : clickedNodeInfo.index;
//       submitParallelSection(parallelSectionBlock)
//       insertBlocksAtPosition([parallelSectionBlock], nodeIndexToUse);
//       setShowParallelModal(false);
//       setBranchCount(3);
//       setPendingAction(null);
//     }
//   };

//   const handleParallelModalCancel = () => {
//     setShowParallelModal(false);
//     setBranchCount(3);
//     setPendingAction(null);
//   };

//   const calculateKOfNLambda = ({ k, n, lambda, mu }) => {
//     const q = n - k;

//     if (q === 0) {
//       return n * lambda;
//     }

//     if (k === 1) {
//       return lambda / n;
//     }

//     let factorialRatio = 1;
//     for (let i = n - q; i <= n; i++) {
//       if (i > 0) factorialRatio *= i;
//     }

//     const lambdaPower = Math.pow(lambda, q);
//     const muPower = Math.pow(mu, q);

//     return (factorialRatio * lambdaPower) / (muPower * 1000);
//   };

//   const calculateKOfNMu = ({ k, n, mu }) => {
//     return mu * k;
//   };

//   const handleSelect = (action) => {
//     // console.log("RBD action received:", action, "at node index:", clickedNodeInfo.index);
//     console.log(menu, 'menu inside handleSelect')
//     const isBranchNode = typeof clickedNodeInfo.index === 'string' &&
//       clickedNodeInfo.index.startsWith('branch-');

//     if (action === "Add Parallel Section") {
//       setPendingAction({
//         type: 'parallel',
//         nodeIndex: clickedNodeInfo.index
//       });
//       setShowParallelModal(true);
//       return;
//     }

//     if (action === "Add Parallel Branch") {
//       // Start parallel branch creation mode
//       setParallelBranchMode({
//         active: true,
//         startNode: clickedNodeInfo.index,
//         endNode: null
//       });
//       // Close the context menu
//       setMenu(null);
//       alert("Select the end node for the parallel branch");
//       return;
//     }

//     if (action === "Add K-out-of-N") {
//       setKOfNModal({
//         open: true,
//         mode: 'add',
//         blockId: nextId,
//         nodeIndex: clickedNodeInfo.index,
//         initialData: {
//           k: 2,
//           n: 3,
//           lambda: 0.001,
//           mu: 1000,
//           formula: 'standard',
//           name: 'K-out-of-N Block'
//         }
//       });
//       return;
//     }

//     if (action === "Add Regular" || action === "Add SubRBD") {
//       const type = action.replace("Add ", "");

//       setElementModal({
//         open: true,
//         mode: 'add',
//         blockId: nextId,
//         blockType: type,
//         nodeIndex: clickedNodeInfo.index,
//         idforApi: menu.index == idforApi.location ? idforApi : null
//       });
//       return;
//     }

//     console.log("Unhandled action:", action);
//   };

//   const handleKOfNSubmit = (data) => {
//     // console.log("handleKOfNSubmit called with data:", data);

//     const effectiveLambda = calculateKOfNLambda(data);
//     const effectiveMu = calculateKOfNMu(data);

//     const newBlock = {
//       id: kOfNModal.mode === 'add' ? nextId : kOfNModal.blockId,
//       type: 'K-out-of-N',
//       data: {
//         elementType: 'K-out-of-N',
//         ...data,
//         effectiveLambda,
//         effectiveMu,
//         mtbf: 1 / effectiveLambda,
//         formulaRef: 'RIAC System Reliability Toolkit, page 394'
//       }
//     };

//     if (kOfNModal.mode === 'add') {
//       const nodeIndexToUse = kOfNModal.nodeIndex !== undefined ? kOfNModal.nodeIndex : clickedNodeInfo.index;

//       // console.log("Creating K-out-of-N block at node index:", nodeIndexToUse);

//       if (nodeIndexToUse !== null && nodeIndexToUse !== undefined) {
//         insertBlockAtPosition(newBlock, nodeIndexToUse);
//       } else {
//         // console.log("No node index, appending to end");
//         setBlocks([...blocks, newBlock]);
//         setNextId(nextId + 1);
//       }
//     } else {
//       setBlocks(blocks.map(block =>
//         block.id === kOfNModal.blockId ? newBlock : block
//       ));
//     }

//     setKOfNModal({ open: false, blockId: null, initialData: null, mode: 'add', nodeIndex: null });
//   };

//   const handleModalSubmit = (formData) => {
//     if (elementModal.mode === 'add') {
//       const newBlock = {
//         id: nextId,
//         type: elementModal.blockType === 'K_OUT_OF_N' ? 'K-out-of-N' :
//           elementModal.blockType === 'SubRBD' ? 'SubRBD' :
//             elementModal.blockType === 'Parallel Section' ? 'Parallel Section' :
//               elementModal.blockType === 'Parallel Branch' ? 'Parallel Branch' : 'Regular',
//         data: {
//           ...formData,
//           elementType: elementModal.blockType === 'K_OUT_OF_N' ? 'K-out-of-N' :
//             elementModal.blockType === 'SubRBD' ? 'SubRBD' :
//               elementModal.blockType === 'Parallel Section' ? 'Parallel Section' :
//                 elementModal.blockType === 'Parallel Branch' ? 'Parallel Branch' : 'Regular'
//         }
//       };

//       const nodeIndexToUse = elementModal.nodeIndex;
//       // console.log("Using node index for insertion:", nodeIndexToUse);

//       if (nodeIndexToUse !== null && nodeIndexToUse !== undefined) {
//         insertBlockAtPosition(newBlock, nodeIndexToUse);
//       } else {
//         // console.log("No node index, appending to end");
//         setBlocks([...blocks, newBlock]);
//         setNextId(nextId + 1);
//       }
//     } else if (elementModal.mode === 'edit') {
//       setBlocks(blocks.map(block =>
//         block.id === elementModal.blockId
//           ? {
//             ...block,
//             data: {
//               ...formData,
//               elementType: block.type
//             }
//           }
//           : block
//       ));
//     }
//     setLoadChange(prev => !prev)
//     setElementModal({
//       open: false,
//       mode: "add",
//       blockId: null,
//       blockType: "",
//       nodeIndex: null
//     })
//     getBlock();
//   };

//   const handleSwitchConfigOpen = (initialData) => {
//     setSwitchModal({
//       open: true,
//       blockId: elementModal.blockId,
//       initialData
//     });
//   };

//   const handleSwitchSubmit = (switchData) => {
//     if (elementModal.blockId) {
//       setBlocks(blocks.map(block =>
//         block.id === elementModal.blockId
//           ? {
//             ...block,
//             data: {
//               ...block.data,
//               switchData: switchData
//             }
//           }
//           : block
//       ));
//     }

//     setSwitchModal({ open: false, blockId: null, initialData: null });
//   };

//   const handleSaveConfig = (newConfig) => {
//     setRbdConfig(newConfig);
//     // console.log("Saved config:", newConfig);
//   };

//   const handleDeleteBlock = (id) => {

//     if (parentItemId) {
//       // console.log(parentItemId, 'parent Id Exist we can do delete operation')
//       Api.delete(`/api/v1/elementParametersRBD/deleteRBD/${parentItemId}/block/${id}`)
//         .then((res) => {
//           if (res.data.success === true) {
//             getBlock();
//             toast.success('Successfully deleted the Block')
//           }
//         })
//         .catch((err) => {
//           console.log(err)
//         })
//     } else {
//       // console.log(parentItemId, '- parentItemId')
//       const blockToDelete = blocks.find(b => b.id === id);
//       if (blockToDelete?.type === 'Parallel Section') {
//         setBlocks(blocks.filter(block =>
//           block.id !== id && block.data?.parentSection !== id
//         ));
//       } else {
//         // setBlocks(blocks.filter(block => block.id !== id));
//         Api.delete(`/api/v1/elementParametersRBD/deleteRBD/${id}`)
//           .then((res) => {
//             if (res.data.success === true) {
//               getBlock();
//               toast.success('Successfully deleted')
//             }
//           })
//           .catch((err) => {
//             console.log(err)
//           })
//       }

//     }

//   };

//   const handleEditBlock = (e, id, blockData) => {
//     // console.log(parentItem, 'ParentItem')
//     let parentItemId = parentItem?.id;
//     // console.log(blockData?.id, '-blockData?.id')
//     // console.log(id, '-id?.id')
//     // console.log(blockData?._id, '-blockData?._id')


//     if (e) {
//       const rect = e.target.getBoundingClientRect();
//       setBlockMenu({ open: true, parentId: parentItemId, blockId: blockData?.id || blockData?._id, x: rect.right, y: rect.top });
//     }
//   };

//   {
//     parallelBranchMode.active && (
//       <div style={{
//         position: 'fixed',
//         top: 10,
//         left: '50%',
//         transform: 'translateX(-50%)',
//         backgroundColor: '#0078d4',
//         color: 'white',
//         padding: '8px 16px',
//         borderRadius: '4px',
//         zIndex: 2000,
//         boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px'
//       }}>
//         <span>Select the end node for the parallel branch</span>
//         <button
//           onClick={() => setParallelBranchMode({ active: false, startNode: null, endNode: null })}
//           style={{
//             background: 'transparent',
//             border: '1px solid white',
//             color: 'white',
//             padding: '2px 8px',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           Cancel
//         </button>
//       </div>
//     )
//   }

//   {/* Highlight the start node */ }
//   {
//     parallelBranchMode.active && parallelBranchMode.startNode && (
//       <div style={{
//         position: 'fixed',
//         left: clickedNodeInfo.x,
//         top: clickedNodeInfo.y - 20,
//         transform: 'translateX(-50%)',
//         backgroundColor: '#0078d4',
//         color: 'white',
//         padding: '2px 6px',
//         borderRadius: '4px',
//         fontSize: '12px',
//         zIndex: 1500
//       }}>
//         Start
//       </div>
//     )
//   }
//   const handleBlockMenuSelect = (action) => {


//     if (!blockMenu.blockId) return;

//     if (action === "Add Parallel Section") {
//       handleOpenParallelModal('block');
//       return;
//     }

//     if (action === "Edit...") {
//       // console.log(parentItem, 'parentItem to chekc')
//       if (parentItem?.type === 'parallel-section') {
//         setParentItemId(parentItem?.id)
//         // Find the block inside the branches
//         let foundBlock = null;
//         // Loop through all branches
//         parentItem.branches?.forEach(branch => {
//           // Loop through blocks in each branch
//           branch.blocks?.forEach(block => {
//             // console.log(block, 'block')
//             if (block._id === blockMenu.blockId || block._id === blockMenu.blockId) {
//               foundBlock = block;
//             }
//           });
//         });
//         // console.log(foundBlock, 'foundBlock')
//         setParallelFoundBlock(foundBlock)
//         if (foundBlock) {
//           setParallelFoundBlock(foundBlock)
//           if (foundBlock.type === 'K-out-of-N') {
//             setKOfNModal({
//               open: true,
//               mode: 'edit',
//               blockId: blockMenu.blockId,
//               nodeIndex: null,
//               initialData: foundBlock.data || foundBlock
//             });
//           } else {
//             // Handle other block types
//             setElementModal({
//               open: true,
//               mode: 'edit',
//               blockId: blockMenu.blockId,
//               blockType: foundBlock.type === 'K-out-of-N' ? 'K_OUT_OF_N' :
//                 foundBlock.type === 'SubRBD' ? 'SUBRBD' :
//                   foundBlock.type === 'Regular' ? 'REGULAR' : 'REGULAR',
//               nodeIndex: null
//             });
//             setParallelFoundBlock(foundBlock)
//           }
//         }
//       } else {
//         // console.log(blockMenu.blockId, 'blockMenu.blockId')
//         const block = blocks.find(b => b.id === blockMenu.blockId);
//         // console.log(block, 'block...')

//         if (block?.type === 'K-out-of-N') {
//           setKOfNModal({
//             open: true,
//             mode: 'edit',
//             blockId: blockMenu.blockId,
//             nodeIndex: null,
//             initialData: block.data
//           });
//         } else {
//           setElementModal({
//             open: true,
//             mode: 'edit',
//             blockId: blockMenu.blockId,
//             blockType: block?.type === 'K-out-of-N' ? 'K_OUT_OF_N' :
//               block?.type === 'SubRBD' ? 'SUBRBD' :
//                 block?.type === 'Parallel Section' ? 'PARALLEL_SECTION' :
//                   block?.type === 'Parallel Branch' ? 'PARALLEL_BRANCH' : 'REGULAR',
//             nodeIndex: null
//           });
//         }
//       }
//     } else if (action === "Delete...") {
//       handleDeleteBlock(blockMenu.blockId);
//     } else if (action === "Add K-out-of-N") {
//       setKOfNModal({
//         open: true,
//         mode: 'add',
//         blockId: nextId,
//         nodeIndex: clickedNodeInfo.index,
//         initialData: {
//           k: 2,
//           n: 3,
//           lambda: 0.001,
//           mu: 1000,
//           formula: 'standard',
//           name: 'K-out-of-N Block'
//         }
//       });
//     } else if (action.startsWith("Add ")) {
//       const type = action.replace("Add ", "");
//       setElementModal({
//         open: true,
//         mode: 'add',
//         blockId: nextId,
//         blockType: type === 'K-out-of-N' ? 'K_OUT_OF_N' :
//           type === 'SubRBD' ? 'SUBRBD' :
//             type === 'Parallel Section' ? 'PARALLEL_SECTION' :
//               type === 'Parallel Branch' ? 'PARALLEL_BRANCH' : 'REGULAR',
//         nodeIndex: clickedNodeInfo.index
//       });
//     } else if (action === "Split K-out-of-N...") {
//       alert("Splitting K-out-of-N block");
//     }

//     setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
//   };

//   const SettingsButton1 = () => (
//     <button
//       onClick={() => setIsModalOpen(true)}
//       style={{
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px',
//         padding: '8px 16px',
//         backgroundColor: '#2b4f81',
//         color: 'white',
//         border: 'none',
//         borderRadius: '4px',
//         cursor: 'pointer',
//         fontSize: '14px',
//         fontWeight: '500',
//         transition: 'background-color 0.3s'
//       }}
//       onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3c66'}
//       onMouseLeave={(e) => e.target.style.backgroundColor = '#2b4f81'}
//     >
//       <FiSettings size={18} />
//       <span>RBD Configuration</span>
//     </button>
//   );

//   return (
//     <>
//       <div style={{ minHeight: "100vh", padding: "20px", overflowX: "auto" }}>
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             width: "100%",
//             marginTop: "50px",
//           }}
//         >
//           <div style={{ margin: "40px 0" }}>
//             <button
//               onClick={() => setShowSymbol(true)}
//               style={{
//                 backgroundColor: "green",
//                 color: "white",
//                 padding: "8px 16px",
//                 border: "none",
//                 borderRadius: "4px",
//                 cursor: "pointer",
//               }}
//             >
//               RBD
//             </button>
//           </div>

//           {showSymbol && (
//             <div style={{ width: "100%", overflowX: "auto" }}>
//               <BiDirectionalSymbol
//                 onNodeClick={handleNodeClick}
//                 onOpenMenu={openMenu}
//                 setIdforApi={setIdforApi}
//                 setParentItem={setParentItem}
//                 blocks={blocks}
//                 setParentItemId={setParentItemId}
//                 onDeleteBlock={handleDeleteBlock}
//                 onEditBlock={handleEditBlock}
//                 selectedNode={selectedNode}
//               />
//             </div>
//           )}
//         </div>

//         {console.log(menu, 'menu opening')}

//         {menu && (
//           <RBDContextMenu
//             x={menu.x}
//             y={menu.y}
//             menu={menu}
//             onSelect={handleSelect}
//             onClose={() => {
//               setMenu(null)
//               setParentItem(null)
//             }}
//           />
//         )}

//         {blockMenu.open && (
//           <BlockContextMenu
//             x={blockMenu.x}
//             y={blockMenu.y}
//             blocks={blocks}
//             parentItem={parentItem}
//             setParentItemId={setParentItemId}
//             setParallelFoundBlock={setParallelFoundBlock}
//             parallelFoundBlock={parallelFoundBlock}
//             onSelect={handleBlockMenuSelect}
//             onClose={() => {
//               setBlockMenu({ open: false, blockId: null, x: 0, y: 0 })
//               setParentItem(null)
//             }
//             }
//           />
//         )}

//         {elementModal.open && (
//           <ElementParametersModal
//             key={elementModal.blockId}
//             isOpen={elementModal.open}
//             elementModal={elementModal}
//             onClose={() => {
//               setElementModal({
//                 open: false,
//                 mode: "add",
//                 blockId: null,
//                 blockType: "",
//                 nodeIndex: null,
//                 idforApi: null,
//               })
//               setParentItem(null)
//             }
//             }
//             setLoadChange={setLoadChange}
//             onSubmit={handleModalSubmit}
//             onOpenSwitchConfig={handleSwitchConfigOpen}
//             rbdId={rbdId}
//             projectId={id}
//             // currentBlock={
//             //   blocks.find((b) => b.id === elementModal.blockId)?.data
//             // }
//             parallelFoundBlock={parallelFoundBlock}
//             parentItemId={parentItemId}
//             currentBlock={
//               blocks.find((b) => {
//                 // console.log("b.id:", b.id, "elementModal.blockId:", elementModal.blockId);
//                 return b.id === elementModal.blockId;
//               })
//             }
//           />
//         )}

//         {kOfNModal.open && (
//           <KOfNConfigModal
//             isOpen={kOfNModal.open}
//             onClose={() => {
//               setParentItem(null)
//               setKOfNModal({ open: false, blockId: null, initialData: null, mode: 'add', nodeIndex: null })

//             }
//             }
//             onSubmit={handleKOfNSubmit}
//             initialData={kOfNModal.initialData}
//             mode={kOfNModal.mode}
//           />
//         )}

//         {showParallelModal && (
//           <div style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.5)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 2000
//           }}>
//             <div style={{
//               backgroundColor: "#f0f0f0",
//               padding: "20px",
//               borderRadius: "8px",
//               minWidth: "350px",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//               border: "1px solid #999"
//             }}>
//               <h3 style={{
//                 marginTop: 0,
//                 marginBottom: "20px",
//                 fontSize: "14px",
//                 fontWeight: "normal",
//                 color: "#333"
//               }}>
//                 Add Parallel Section
//               </h3>

//               <div style={{ marginBottom: "20px" }}>
//                 <label style={{
//                   display: "block",
//                   marginBottom: "5px",
//                   fontSize: "13px",
//                   color: "#333"
//                 }}>
//                   Number of branches :
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="20"
//                   value={branchCount}
//                   onChange={(e) => setBranchCount(parseInt(e.target.value) || 1)}
//                   style={{
//                     width: "100%",
//                     padding: "6px",
//                     border: "1px solid #7f9db9",
//                     borderRadius: "3px",
//                     fontSize: "13px",
//                     backgroundColor: "white"
//                   }}
//                   autoFocus
//                 />
//               </div>

//               <div style={{
//                 backgroundColor: "white",
//                 padding: "10px",
//                 marginBottom: "20px",
//                 fontSize: "12px",
//                 color: "#333",
//                 border: "1px solid #ccc",
//                 fontFamily: "monospace",
//                 lineHeight: "1.5"
//               }}>
//                 <div>Communication Unit</div>
//                 <div>19949.1</div>
//                 <div>#10</div>
//                 <div>#11</div>
//               </div>

//               <div style={{
//                 display: "flex",
//                 gap: "8px",
//                 justifyContent: "flex-end"
//               }}>
//                 <button
//                   onClick={() => {
//                     handleParallelModalSubmit();
//                   }}
//                   style={{
//                     padding: "4px 20px",
//                     backgroundColor: "#e1e1e1",
//                     color: "#333",
//                     border: "1px solid #999",
//                     borderRadius: "3px",
//                     cursor: "pointer",
//                     fontSize: "13px",
//                     minWidth: "70px"
//                   }}
//                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d1d1d1"}
//                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e1e1e1"}
//                 >
//                   OK
//                 </button>
//                 <button
//                   onClick={handleParallelModalCancel}
//                   style={{
//                     padding: "4px 20px",
//                     backgroundColor: "#e1e1e1",
//                     color: "#333",
//                     border: "1px solid #999",
//                     borderRadius: "3px",
//                     cursor: "pointer",
//                     fontSize: "13px",
//                     minWidth: "70px"
//                   }}
//                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d1d1d1"}
//                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e1e1e1"}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         <SwitchConfigurationModal
//           isOpen={switchModal.open}
//           onClose={() => {
//             setSwitchModal({
//               open: false,
//               blockId: null,
//               initialData: null,
//             })
//           }
//           }
//           onSubmit={handleSwitchSubmit}
//           currentSwitchData={switchModal.initialData}
//         />

//         <EditRBDConfigurationModal
//           isOpen={isModalOpen}
//           onClose={() => {
//             setIsModalOpen(false)
//             setParentItem(null)
//           }}
//           onSave={handleSaveConfig}
//           initialConfig={rbdConfig}
//         />
//       </div>
//     </>
//   );
// }








// ===============================================================





import React, { useState, useEffect } from 'react';
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SplitKofN from './SplitKofN';
import Api from "../../Api";
import SubRBDModal from './SubRBDModal.js';
import CaseSelectionModal from './CaseSelectionModal.js';
import EditRBDConfigurationModal from './EditRBDConfigurationModal';
import { useParams, useLocation } from 'react-router-dom';
import CreatableSelect from "react-select/creatable";
import { FiSettings, FiEdit2, FiSliders } from 'react-icons/fi';
import { ElementParametersModal } from './ElementParametersModal';
import { KOfNConfigModal } from './KOfNConfigModal.js';
import SwitchConfigurationModal from './SwitchConfig.js';
import { RBDBlock } from './RBDBlock';
import { KOfNBlock } from './KOfNBlock';
import { toast } from 'react-toastify';
import { RBDSvgRenderer } from './RBDSvgRenderer';


const C = {
  TERMINAL_W: 60,
  TERMINAL_H: 40,
  TERMINAL_LEFT_X: 50,
  ARROW_W: 12,
  ARROW_H: 16,

  BLOCK_W: 60,
  BLOCK_H: 40,
  BLOCK_SPACING: 20,

  NODE_R: 5,
  NODE_SPACING: 20,

  // parallel
  BRANCH_MIN_H: 40,   // minimum row height for a branch (= BLOCK_H)
  BRANCH_SPACING: 20,   // vertical gap between branch rows
  RAIL_PAD_X: 20,   // distance from section x-edge to the vertical rail
  INNER_PAD_X: 14,   // gap between rail and first/last block — enough breathing room
  BLOCK_GAP: 67,   // gap between blocks inside a branch

  CENTER_Y: 200,  // main wire y — large enough for tall sections
  MIN_OUTPUT_GAP: 40,
  BASE_RIGHT_X: 700,
  MIN_CANVAS_W: 800,
  MIN_CANVAS_H: 420,
};

const branchHeight = (branch) => {
  let height = C.BRANCH_MIN_H;

  // Check for nested parallel sections
  if (branch.blocks) {
    branch.blocks.forEach(block => {
      if ((block.type === 'Parallel Section' || block.elementType === 'Parallel Section') && block.branches) {
        // Calculate height needed for nested parallel section
        const nestedBranches = block.branches;
        const nestedHeight = nestedBranches.length * 70 + 40; // 70 is ROW_STEP, 40 is padding
        height = Math.max(height, nestedHeight);
      }
    });
  }

  return height;
};

const sectionTotalHeight = (branches) => {
  if (!branches || branches.length === 0) return C.BRANCH_MIN_H;
  return branches.reduce((acc, br) => acc + branchHeight(br), 0)
    + Math.max(0, branches.length - 1) * C.BRANCH_SPACING;
};

const sectionWidth = (block) => {
  const branches = block.branches || [];
  const leftGrowth = block.leftGrowth || 0;
  if (!branches.length) return 160 + leftGrowth;
  const maxBlocks = Math.max(...branches.map(br => (br.blocks || []).length));
  const innerW = maxBlocks > 0
    ? C.INNER_PAD_X + maxBlocks * C.BLOCK_W + (maxBlocks - 1) * C.BLOCK_GAP + C.INNER_PAD_X
    : C.INNER_PAD_X * 2 + 40;
  return C.RAIL_PAD_X * 2 + innerW + leftGrowth;
};

const branchCenterY = (branches, idx, secTopY) => {
  let y = secTopY;
  for (let i = 0; i < idx; i++) {
    // Calculate actual height for each branch including nested sections
    const branch = branches[i];
    let branchHeight = C.BRANCH_MIN_H;

    // Check if branch has any nested parallel sections
    if (branch.blocks) {
      branch.blocks.forEach(block => {
        if ((block.type === 'Parallel Section' || block.elementType === 'Parallel Section') && block.branches) {
          // Calculate height needed for nested parallel section
          const nestedBranches = block.branches;
          const nestedHeight = nestedBranches.length * 70 + 40; // 70 is ROW_STEP, 40 is padding
          branchHeight = Math.max(branchHeight, nestedHeight);
        }
      });
    }

    y += branchHeight + C.BRANCH_SPACING;
  }
  return y + (branchHeight(branches[idx]) / 2);
};

// ─── InsertionNode (dot with + cross) ─────────────────────────────────────────
const InsertNode = ({ cx, cy, nodeId, selectedNode, onOpenMenu, r = C.NODE_R }) => {
  const isSel = selectedNode === nodeId;
  // console.log(isSel, ' 1 Sel')
  // console.log(nodeId, ' nodeId')

  return (
    <g>
      {isSel && (
        <circle cx={cx} cy={cy} r={r + 4}
          fill="none" stroke="#0078d4" strokeWidth="2" strokeDasharray="4 2" />
      )}
      <circle
        cx={cx} cy={cy} r={r}
        fill={isSel ? '#0078d4' : 'black'}
        style={{ cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); onOpenMenu(e.clientX, e.clientY, nodeId); }}
      />
      <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="white" strokeWidth="1.5" />
      <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} stroke="white" strokeWidth="1.5" />
    </g>
  );
};






// ─── BiDirectionalSymbol ──────────────────────────────────────────────────────
export const BiDirectionalSymbol = ({
  onNodeClick, setParentItem, setParentItemId,
  onOpenMenu, blocks, onDeleteBlock, onEditBlock, selectedNode, setIdforApi
}) => {

  // top-level blocks only (excludes nested parallel branches)
  const topLevel = blocks.filter(b => b.type === 'Parallel Section' || !b.data?.parentSection);

  // ── layout ─────────────────────────────────────────────────────────────────

  const calculateLayout = () => {
    if (topLevel.length === 0) {
      const cx = (C.TERMINAL_LEFT_X + C.TERMINAL_W + C.BASE_RIGHT_X) / 2;
      return { items: [], startX: cx, rightBoxX: C.BASE_RIGHT_X, canvasH: C.MIN_CANVAS_H, svgW: C.MIN_CANVAS_W };
    }

    // First, calculate widths of all items
    const itemWidths = topLevel.map(b => {
      if (b.type === 'Parallel Section') {
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
    const reqRightX = C.TERMINAL_LEFT_X + C.TERMINAL_W + totalNeeded + C.MIN_OUTPUT_GAP + C.TERMINAL_W;
    const rightBoxX = Math.max(C.BASE_RIGHT_X, reqRightX);

    // Calculate available space and starting X
    const available = rightBoxX - C.TERMINAL_LEFT_X - C.TERMINAL_W * 2;
    const startX = C.TERMINAL_LEFT_X + C.TERMINAL_W + (available - totalNeeded) / 2 + C.NODE_SPACING ;

    const items = [];
    let curX = startX;
    let nodeIdx = 0;
    let maxY = C.CENTER_Y + 150;

    // First insertion node
    items.push({ type: 'node', id: 'node-start', x: curX, y: C.CENTER_Y, nodeIndex: nodeIdx++ });
    curX += C.NODE_SPACING;

    // Place each block with consistent spacing
    topLevel.forEach((block, index) => {
      if (block.type === 'Parallel Section') {
        const branches = block.branches || [];
        const dynW = sectionWidth(block);
        const totalH = sectionTotalHeight(branches);
        const secTopY = C.CENTER_Y - totalH / 2;

        if (secTopY + totalH + 40 > maxY) maxY = secTopY + totalH + 60;

        const rightX = curX + dynW;
        const leftGrowth = block.leftGrowth || 0;

        items.push({
          type: 'parallel-section',
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
          type: 'block',
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
        type: 'node',
        id: `node-${block.id}`,
        x: curX,
        y: C.CENTER_Y,
        nodeIndex: nodeIdx++
      });
      curX += C.NODE_SPACING;
    });

    const canvasH = Math.max(C.MIN_CANVAS_H, maxY + 50);
    const svgW = Math.max(C.MIN_CANVAS_W, rightBoxX + 100);

    return { items, startX, rightBoxX, canvasH, svgW };
  };

  // ── wire segments ───────────────────────────────────────────────────────────

  const buildWireLines = (items, rightBoxX) => {

    console.log(items,'items')
    console.log(rightBoxX,'rightBoxX')

    const lines = [];
    if (items.length === 0) {
      lines.push({ x1: C.TERMINAL_LEFT_X + C.TERMINAL_W, x2: rightBoxX, y: C.CENTER_Y });
      return lines;
    }
    lines.push({ x1: C.TERMINAL_LEFT_X + C.TERMINAL_W, x2: items[0].x - C.NODE_R, y: C.CENTER_Y });

    for (let i = 0; i < items.length - 1; i++) {
      const cur = items[i];
      const next = items[i + 1];
      const fx = cur.type === 'parallel-section' ? cur.rightX
        : cur.type === 'block' ? cur.x + C.BLOCK_W
          : cur.x + C.NODE_R;
      const tx = next.type === 'block' || next.type === 'parallel-section'
        ? next.x : next.x - C.NODE_R;
      if (fx < tx) lines.push({ x1: fx, x2: tx, y: C.CENTER_Y });
    }

    const last = items[items.length - 1];
    const lastX = last.type === 'parallel-section' ? last.rightX : last.type === 'block' ? last.x + C.BLOCK_W : last.x + C.NODE_R;
    const endX = Math.min(lastX + 20, rightBoxX - C.MIN_OUTPUT_GAP);
    lines.push({ x1: lastX, x2: endX, y: C.CENTER_Y });
    lines.push({ x1: endX, x2: rightBoxX, y: C.CENTER_Y });
    return lines;
  };

  // ── render parallel section ─────────────────────────────────────────────────
  //
  //  • blocks are RIGHT-ANCHORED to (rightRailX - INNER_PAD_X)
  //  • adding right → right rail expands right, blocks stay in place ✅
  //  • adding left  → left rail expands left,  blocks stay in place ✅
  //  • shorter branches wire stretches from left rail to first block ✅

  const renderParallelSection = (item) => {

    const { x, rightX, branches, id, blockData, width: dynW, secTopY } = item;
    if (!branches || branches.length === 0) return null;

    const leftRailX = x + C.RAIL_PAD_X;
    // rightRailX is derived from the FIXED rightX anchor — never shifts
    const rightRailX = rightX - C.RAIL_PAD_X + 55;

    const railTop = branchCenterY(branches, 0, secTopY);
    const railBottom = branchCenterY(branches, branches.length - 1, secTopY);

    return (
      <g key={id}>
        <text
          x={x + dynW / 2} y={secTopY}
          textAnchor="middle" dominantBaseline="auto"
          fontSize="9" fontWeight="bold" fill="#333"
        >
          K={blockData?.k || 1}:N={branches.length}
        </text>

        <line x1={leftRailX} y1={railTop} x2={leftRailX} y2={railBottom} stroke="black" strokeWidth="2" />
        <line x1={rightRailX} y1={railTop} x2={rightRailX} y2={railBottom} stroke="black" strokeWidth="2" />

        {branches.map((branch, idx) => {
          const wireY = branchCenterY(branches, idx, secTopY);
          const branchBlocks = branch.blocks || [];
          const isMain = idx === 0;
          const dash = isMain ? undefined : '5,3';

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
                    location: `branch-${branch?.index}-left`
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
                          fill={selectedNode === leftNodeId ? "#0078d4" : "black"}
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMenu(e.clientX, e.clientY, branch?.index);
                            setIdforApi({
                              branchId: branch?._id,
                              branchIndex: branch?.index,
                              ItemId: item?.id,
                              location: `branch-${branch?.index}-left`
                            });

                            console.log(branch?._id, branch?.index, item?.id, `branch-${branch?.index}-left`)
                          }}
                        />
                        <RBDBlock
                          id={block._id ?? block.id}
                          type={block.type}
                          leftRailX={leftRailX}
                          rightRailX={rightRailX}
                          wireY={wireY}          // ← ADD THIS — nested parallel section uses it to center itself
                          selectedNode={selectedNode}
                          leftNodeId={leftNodeId}
                          rightNodeId={rightNodeId}
                          x={bx}
                          y={wireY - C.BLOCK_H / 2}   // ← ENSURE this is wireY - half, not just wireY
                          onEdit={onEditBlock}
                          onDelete={onDeleteBlock}
                          setIdforApi={setIdforApi}
                          blockData={block}
                          width={C.BLOCK_W}
                          height={C.BLOCK_H}
                        />

                        {/* RIGHT NODE */}
                        <circle
                          cx={rightRailX}
                          cy={wireY}
                          r={4}
                          fill={selectedNode === rightNodeId ? "#0078d4" : "black"}
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMenu(e.clientX, e.clientY, branch.index);
                            console.log(branch?._id, '1')
                            console.log(branch?.index, '2')
                            console.log(item?.id, '3')
                            console.log(`branch-${branch.index}-right`, '4')
                            setIdforApi({
                              branchId: branch?._id,
                              branchIndex: branch?.index,
                              ItemId: item?.id,
                              location: `branch-${branch.index}-right`
                            });
                          }}
                        />

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
                              onOpenMenu(e.clientX, e.clientY, branch?.index);
                              // setIdforApi({
                              //   branchId: branch?._id,
                              //   branchIndex: branch?.index,
                              //   ItemId: item?.id,
                              //   location: id,
                              // });
                              console.log(branch?._id, '1')
                              console.log(branch?.index, '2')
                              console.log(item?.id, '3')
                              console.log(`branch-${branch?.index}-right`, '4')
                              setIdforApi({
                                branchId: branch?._id,
                                branchIndex: branch?.index,
                                ItemId: item?.id,
                                location: `branch-${branch?.index}-right`
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

  console.log(wireLines, 'wireLines')

  const leftArrow = [
    [C.TERMINAL_LEFT_X + C.TERMINAL_W, C.CENTER_Y - C.ARROW_H / 2],
    [C.TERMINAL_LEFT_X + C.TERMINAL_W - C.ARROW_W, C.CENTER_Y],
    [C.TERMINAL_LEFT_X + C.TERMINAL_W, C.CENTER_Y + C.ARROW_H / 2],
  ].map(p => p.join(',')).join(' ');

  const rightArrow = [
    [rightBoxX, C.CENTER_Y - C.ARROW_H / 2],
    [rightBoxX + C.ARROW_W, C.CENTER_Y],
    [rightBoxX, C.CENTER_Y + C.ARROW_H / 2],
  ].map(p => p.join(',')).join(' ');

  return (
    <svg
      width={svgW} height={canvasH}
      viewBox={`0 0 ${svgW} ${canvasH}`}
      style={{ overflow: 'visible' }}
    >
      {/* main wire */}
      {wireLines.map((seg, i) => (
        <line key={`w${i}`} x1={seg.x1} y1={seg.y} x2={seg.x2} y2={seg.y} stroke="black" strokeWidth="2" />
      ))}

      {/* Input terminal */}
      <g onClick={() => onNodeClick?.('LEFT')} style={{ cursor: 'pointer' }}>
        <rect x={C.TERMINAL_LEFT_X} y={C.CENTER_Y - C.TERMINAL_H / 2} width={C.TERMINAL_W} height={C.TERMINAL_H} fill="black" />
        <polygon points={leftArrow} fill="white" />
        <text x={C.TERMINAL_LEFT_X + C.TERMINAL_W / 2} y={C.CENTER_Y}
          textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">Input</text>
      </g>

      {/* Output terminal */}
      <g onClick={() => onNodeClick?.('RIGHT')} style={{ cursor: 'pointer' }}>
        <rect x={rightBoxX} y={C.CENTER_Y - C.TERMINAL_H / 2} width={C.TERMINAL_W} height={C.TERMINAL_H} fill="black" />
        <polygon points={rightArrow} fill="white" />
        <text x={rightBoxX + C.TERMINAL_W / 2} y={C.CENTER_Y}
          textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">Output</text>
      </g>

      {/* items */}
      {items.map((item) => {
        if (item.type === 'node') {
          return (
            <>
              <InsertNode
                key={item.id}
                cx={item.x} cy={item.y}
                nodeId={item.nodeIndex}
                selectedNode={selectedNode}
                onOpenMenu={onOpenMenu}
              />
              {console.log(item, 'item')}
            </>
          );
        }
        if (item.type === 'parallel-section') return renderParallelSection(item);
        if (item.type === 'block') {
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
          cx={startX} cy={C.CENTER_Y}
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
      position: 'fixed', top: y, left: x, background: '#fff',
      border: '1px solid #ccc', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      zIndex: 1000, width: '180px'
    }}
    onMouseLeave={onClose}
  >
    {['Add Regular', 'Add K-out-of-N', 'Add SubRBD', 'Add Parallel Section', 'Add Parallel Branch']
      .map(item => (
        <div key={item}
          onClick={() => { onSelect(item); onClose(); }}
          style={{ padding: '8px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >{item}</div>
      ))}
  </div>
);

export const BlockContextMenu = ({ x, y, setParallelFoundBlock, onSelect, onClose }) => (
  <div
    style={{
      position: 'fixed', top: y, left: x, background: '#fff',
      border: '1px solid #ccc', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      zIndex: 1001, width: '180px'
    }}
    onMouseLeave={onClose}
  >
    {['Edit...', 'Delete...', 'Split K-out-of-N...', 'Add Regular',
      'Add K-out-of-N', 'Add SubRBD', 'Add Parallel Section', 'Add Parallel Branch']
      .map(item => (
        <div key={item}
          onClick={() => { setParallelFoundBlock?.(null); onSelect(item); onClose(); }}
          style={{ padding: '8px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >{item}</div>
      ))}
  </div>
);

// ─── RBDButton ────────────────────────────────────────────────────────────────

export default function RBDButton() {
  const { id, rbdId } = useParams();
  const projectId = id;

  const [parallelBranchMode, setParallelBranchMode] = useState({ active: false, startNode: null, endNode: null });
  const [showSymbol, setShowSymbol] = useState(false);
  const [menu, setMenu] = useState(null);

  const [rbdList, setRbdList] = useState([]);
  const [blockMenu, setBlockMenu] = useState({ open: false, parentId: null, blockId: null, x: 0, y: 0 });
  const [blocks, setBlocks] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [idforApi, setIdforApi] = useState({
    branchId: null,
    branchIndex: null,
    ItemId: null,
    location: null,
  });
  const [rbdListModal, setRbdListModal] = useState({
    open: false,
    nodeIndex: null,
    blockId: null,
    mode: 'add',
    selectedRbd: null
  });
  const [clickedNodeInfo, setClickedNodeInfo] = useState({ index: null, x: 0, y: 0 });
  const [loadChange, setLoadChange] = useState(false);
  const [parentItem, setParentItem] = useState(null);
  const [parentItemId, setParentItemId] = useState(null);
  const [elementModal, setElementModal] = useState({ open: false, mode: 'add', blockId: null, blockType: '', nodeIndex: null, idforApi: null });
  const [kOfNModal, setKOfNModal] = useState({ open: false, blockId: null, initialData: null, mode: 'add', nodeIndex: null });
  const [showParallelModal, setShowParallelModal] = useState(false);
  const [branchCount, setBranchCount] = useState(3);
  const [pendingAction, setPendingAction] = useState(null);
  const [parallelFoundBlock, setParallelFoundBlock] = useState(null);
  const [switchModal, setSwitchModal] = useState({ open: false, blockId: null, initialData: null });
  const [isModalOpen, setIsModalOpen] = useState(false);





  const [listedRBDs, setListedRBDs] = useState([]);
  useEffect(() => {
    getBlock();
  }, [rbdId, projectId, elementModal?.open, loadChange])


  // Fetch RBD list for SubRBD selection
  useEffect(() => {
    if (projectId) {
      Api.get("/api/v1/EditConfigRBD/", {
        params: {
          projectId: projectId,
        }
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
  const [rbdConfig, setRbdConfig] = useState({ rbdTitle: 'My RBD', missionTime: 24, displayUpper: 'Part number', displayLower: 'MTBF', printRemarks: 'Yes' });
  const location = useLocation();

  useEffect(() => { getBlock(); }, [rbdId, projectId, loadChange]);

  const getBlock = () => {
    Api.get(`/api/v1/elementParametersRBD/getRBD/${rbdId}/${projectId}`)
      .then((res) => {
        const data = res.data.data;
        setShowSymbol(data.length > 0);
        setBlocks(data);
      })
      .catch(err => console.log(err, 'error'));
  };

  // ── parallel branch creation ───────────────────────────────────────────────
  const createParallelBranch = (startNode, endNode) => {
    const parseNode = (n) => typeof n === 'string' && n.startsWith('branch-')
      ? { type: 'branch', branchId: parseInt(n.split('-')[1]), position: n.split('-')[2] }
      : { type: 'top-level', nodeIndex: parseInt(n) };

    const start = parseNode(startNode);
    const end = parseNode(endNode);
    const topLevel = blocks.filter(b => b.type === 'Parallel Section' || !b.data?.parentSection);

    if (start.type !== 'top-level' || end.type !== 'top-level') return;
    const si = start.nodeIndex, ei = end.nodeIndex;
    if (si < 0 || ei < 0 || si >= ei) { alert('Invalid start/end nodes'); return; }

    const mainBlocks = topLevel.slice(si, ei);
    if (!mainBlocks.length) { alert('No blocks between nodes'); return; }

    const sectionId = nextId;
    const section = {
      id: sectionId, type: 'Parallel Section',
      data: { elementType: 'Parallel Section', name: 'Parallel Section', branchCount: 2, sectionId, isParallel: true, arrangement: 'horizontal', k: 1, n: 2 },
      branches: [],
    };
    const mainBranch = {
      id: sectionId + 1, type: 'Parallel Branch',
      data: { elementType: 'Parallel Branch', name: 'Main Branch', branchIndex: 0, parentSection: sectionId, isParallelBranch: true, isMainBranch: true },
      blocks: mainBlocks.map(b => ({ id: b.id, type: b.type, data: { ...b.data, parentSection: sectionId } })),
    };
    const bypassBranch = {
      id: sectionId + 2, type: 'Parallel Branch',
      data: { elementType: 'Parallel Branch', name: 'Bypass Branch', branchIndex: 1, parentSection: sectionId, isParallelBranch: true, isBypassBranch: true },
      blocks: [{ id: sectionId + 3, type: 'Regular', data: { elementType: 'Regular', name: 'Bypass Block', parentSection: sectionId } }],
    };

    const toRemove = new Set(mainBlocks.map(b => b.id));
    const remaining = blocks.filter(b => !toRemove.has(b.id));
    const insertAt = remaining.findIndex(b => b.id === mainBlocks[0].id);
    const next = [...remaining];
    insertAt !== -1
      ? next.splice(insertAt, 0, section, mainBranch, bypassBranch)
      : next.push(section, mainBranch, bypassBranch);
    setBlocks(next);
    setNextId(id => id + 4);
  };

  // ── menu open ──────────────────────────────────────────────────────────────
  const openMenu = (x, y, index) => {
    if (parallelBranchMode.active) {
      if (!parallelBranchMode.startNode) {
        setParallelBranchMode({ active: false, startNode: null, endNode: null });
        return;
      }
      createParallelBranch(parallelBranchMode.startNode, index);
      setParallelBranchMode({ active: false, startNode: null, endNode: null });
      return;
    }
    setMenu({ x, y, index });
    setSelectedNode(index);
    setClickedNodeInfo({ index, x, y });
  };

  const handleNodeClick = (nodeIndex) => setSelectedNode(nodeIndex);

  // ── insertion helpers ──────────────────────────────────────────────────────
  const findInsertionIndex = (nodeIndex) => {
    if (nodeIndex === null || nodeIndex === undefined) return blocks.length;

    // branch node — format: branch-{branchKey}-left | branch-{branchKey}-right | branch-{branchKey}-mid-{bIdx}
    if (typeof nodeIndex === 'string' && nodeIndex.startsWith('branch-')) {
      // strip leading "branch-"
      const rest = nodeIndex.slice('branch-'.length);
      // position is always the last token, midIdx (if any) is second-to-last
      // branchKey is everything before the position token(s)
      const tokens = rest.split('-');
      const position = tokens[tokens.length - 1]; // 'left' | 'right' | <number for mid>

      let branchId, midIdx;
      if (position === 'left' || position === 'right') {
        // branch-{branchKey}-left  →  tokens = [...branchKeyParts, 'left']
        branchId = tokens.slice(0, -1).join('-');
        midIdx = undefined;
      } else {
        // branch-{branchKey}-mid-{bIdx}  →  last two tokens are bIdx and 'mid'
        midIdx = position;                              // bIdx is the last token
        branchId = tokens.slice(0, -2).join('-');         // everything before 'mid'
      }

      return { isBranch: true, branchId, position: position === midIdx ? 'mid' : position, midIdx };
    }

    const tl = blocks.filter(b => b.type === 'Parallel Section' || !b.data?.parentSection);
    if (nodeIndex === 0) return 0;
    if (nodeIndex >= tl.length) return blocks.length;
    const after = tl[nodeIndex];
    return after ? blocks.findIndex(b => b.id === after.id) : blocks.length;
  };

  const insertBlockAtPosition = (newBlock, nodeIndex) => {
    const info = findInsertionIndex(nodeIndex);
    const next = JSON.parse(JSON.stringify(blocks));

    if (info?.isBranch) {
      const { branchId, position, midIdx } = info;
      const STEP = C.BLOCK_W + C.BLOCK_GAP;

      let found = false;
      for (let i = 0; i < next.length; i++) {
        if (next[i].type === 'Parallel Section' && Array.isArray(next[i].branches)) {
          const br = next[i].branches.find(b =>
            String(b._id) === branchId ||
            String(b.id) === branchId ||
            String(b.index) === branchId
          );
          if (br) {
            if (!br.blocks) br.blocks = [];
            if (br.leftPad === undefined) br.leftPad = C.INNER_PAD_X;

            const withParent = { ...newBlock, parentSection: next[i]._id || next[i].id };

            if (position === 'left') {
              br.blocks.unshift(withParent);
              // Section grows LEFT by STEP: shift sectionX left, keep all block x fixed.
              // leftPad stays unchanged on all branches — leftRailX moves left by STEP
              // and that's enough to make room for the new block on the left.
              next[i].leftGrowth = (next[i].leftGrowth || 0) + STEP;

            } else if (position === 'right') {
              br.blocks.push(withParent);
              // right side grows — no leftPad or leftGrowth change needed

            } else if (position === 'mid') {
              br.blocks.splice(parseInt(midIdx) + 1, 0, withParent);
            }

            found = true;
            break;
          }
        }
      }

      if (!found) {
        next.splice(typeof info === 'number' ? info : next.length, 0, newBlock);
      }
    } else {
      next.splice(info, 0, newBlock);
    }

    setBlocks(next);
    setNextId(id => id + 1);
  };

  const insertBlocksAtPosition = (arr, nodeIndex) => {
    const idx = findInsertionIndex(nodeIndex);
    const next = [...blocks];
    next.splice(typeof idx === 'number' ? idx : next.length, 0, ...arr);
    setBlocks(next);
    setNextId(id => id + arr.length);
  };

  const submitParallelSection = (value) => {
    console.log(value, 'vlue from frontend ')
    Api.post(`/api/v1/elementParametersRBD/create/parallelsection/${rbdId}/${projectId}`, value)
      .then(() => { toast.success('Successfully Created'); getBlock(); })
      .catch(err => console.log(err));
  };

  const handleParallelModalSubmit = () => {
    if (branchCount <= 1) { alert('Branch count must be at least 2'); return; }

    const sectionId = nextId;
    const branches = Array.from({ length: branchCount }, (_, i) => ({
      id: sectionId + i + 1, type: 'Parallel Branch', index: i,
      name: `Branch ${i + 1}`, elementType: 'Parallel Branch',
      branchIndex: i, parentSection: sectionId, isParallelBranch: true,
      blocks: [{
        id: sectionId + branchCount + i + 1, type: 'Regular', elementType: 'Regular',
        name: `Branch ${i + 1} Block`, branchIndex: i, parentSection: sectionId,
        failureRate: 0.001, mtbf: 1000,
      }],
    }));

    const section = {
      id: sectionId, type: 'Parallel Section', name: 'Parallel Section',
      arrangement: 'horizontal', k: 1, n: branchCount, branches,
      data: {
        elementType: 'Parallel Section',
        name: 'Parallel Section',
        branchCount,
        sectionId,
        isParallel: true,
        arrangement: 'horizontal',
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
    return { lambda: (ratio * Math.pow(lambda, q)) / (Math.pow(mu, q) * 1000), mu: mu * k };

  };

  const calculateKOfNMu = ({ k, n, mu }) => {
    return mu * k;
  };


  const handleKOfNSubmit = (data) => {
    const { lambda: effL, mu: effM } = calcKOfN(data);
    const newBlock = {
      id: kOfNModal.mode === 'add' ? nextId : kOfNModal.blockId,
      type: 'K-out-of-N',
      data: { elementType: 'K-out-of-N', ...data, effectiveLambda: effL, effectiveMu: effM, mtbf: 1 / effL },
    };
    if (kOfNModal.mode === 'add') {
      const ni = kOfNModal.nodeIndex ?? clickedNodeInfo.index;
      ni !== null && ni !== undefined
        ? insertBlockAtPosition(newBlock, ni)
        : setBlocks(prev => [...prev, newBlock]);
    } else {
      setBlocks(prev => prev.map(b => b.id === kOfNModal.blockId ? newBlock : b));
    }
    setKOfNModal({ open: false, blockId: null, initialData: null, mode: 'add', nodeIndex: null });
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

  const handleSaveConfig = (newConfig) => {
    setRbdConfig(newConfig);
    // console.log("Saved config:", newConfig);
  };



  {
    parallelBranchMode.active && (
      <div style={{
        position: 'fixed',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#0078d4',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        zIndex: 2000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span>Select the end node for the parallel branch</span>
        <button
          onClick={() => setParallelBranchMode({ active: false, startNode: null, endNode: null })}
          style={{
            background: 'transparent',
            border: '1px solid white',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    )
  }

  {/* Highlight the start node */ }
  {
    parallelBranchMode.active && parallelBranchMode.startNode && (
      <div style={{
        position: 'fixed',
        left: clickedNodeInfo.x,
        top: clickedNodeInfo.y - 20,
        transform: 'translateX(-50%)',
        backgroundColor: '#0078d4',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1500
      }}>
        Start
      </div>
    )
  }


  // 

  // ── node menu ──────────────────────────────────────────────────────────────
  const handleSelect = (action) => {
    if (action === 'Add Parallel Section') {
      setPendingAction({ type: 'parallel', nodeIndex: clickedNodeInfo.index });
      setShowParallelModal(true);
      return;
    }
    if (action === 'Add Parallel Branch') {
      setParallelBranchMode({ active: true, startNode: clickedNodeInfo.index, endNode: null });
      setMenu(null);
      alert('Select the end node for the parallel branch');
      return;
    }
    if (action === 'Add K-out-of-N') {
      setKOfNModal({
        open: true, mode: 'add', blockId: nextId, nodeIndex: clickedNodeInfo.index,
        initialData: { k: 2, n: 3, lambda: 0.001, mu: 1000, formula: 'standard', name: 'K-out-of-N Block' }
      });
      return;
    }
    if (action === 'Add Regular') {
      console.log(menu, 'menu 123456789')
      console.log(idforApi?.index, 'idforApi?.location')

      setElementModal({
        open: true,
        mode: 'add',
        blockId: nextId,
        blockType: action.replace('Add ', ''),
        nodeIndex: clickedNodeInfo.index,
        idforApi: menu?.index == idforApi?.branchIndex ? idforApi : null
        // idforApi: idforApi
      });
    }
    if (action === "Add SubRBD") {
      // Open RBD list modal instead of element parameters modal
      setRbdListModal({
        open: true,
        mode: 'add',
        blockId: nextId,
        nodeIndex: clickedNodeInfo.index,
        selectedRbd: null
      });
      return;
    }
  }

  // ── element modal submit ───────────────────────────────────────────────────
  const handleModalSubmit = (formData) => {
    const ni = elementModal.nodeIndex;

    // is this a branch-node insert? (node id like "branch-{id}-left/right/mid")
    const isBranchInsert = typeof ni === 'string' && ni.startsWith('branch-');

    if (elementModal.mode === 'add') {
      const typeMap = { K_OUT_OF_N: 'K-out-of-N', SubRBD: 'SubRBD', 'Parallel Section': 'Parallel Section', 'Parallel Branch': 'Parallel Branch' };
      const t = typeMap[elementModal.blockType] || 'Regular';
      const newBlock = { id: nextId, type: t, data: { ...formData, elementType: t } };

      if (ni !== null && ni !== undefined) {
        insertBlockAtPosition(newBlock, ni);
      } else {
        setBlocks(prev => [...prev, newBlock]);
      }

      // Only reload from DB for top-level inserts (DB was actually updated).
      // For branch inserts, DB save is not wired yet — keep local state as-is.
      if (!isBranchInsert) {
        setLoadChange(p => !p);
      }

    } else {
      // edit mode — update local state
      setBlocks(prev => prev.map(b =>
        b.id === elementModal.blockId
          ? { ...b, data: { ...formData, elementType: b.type } }
          : b
      ));
      // Only reload if it was a top-level block edit
      if (!isBranchInsert) {
        setLoadChange(p => !p);
      }
    }

    setElementModal({ open: false, mode: 'add', blockId: null, blockType: '', nodeIndex: null });
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const handleDeleteBlock = (id) => {
    if (parentItemId) {
      Api.delete(`/api/v1/elementParametersRBD/deleteRBD/${parentItemId}/block/${id}`)
        .then(res => { if (res.data.success) { getBlock(); toast.success('Successfully deleted the Block'); } })
        .catch(err => console.log(err));
    } else {
      Api.delete(`/api/v1/elementParametersRBD/deleteRBD/${id}`)
        .then(res => { if (res.data.success) { getBlock(); toast.success('Successfully deleted'); } })
        .catch(err => console.log(err));
    }
  };

  // ── edit block ─────────────────────────────────────────────────────────────
  const handleEditBlock = (e, id, blockData) => {
    if (e) {
      const rect = e.target.getBoundingClientRect();
      setBlockMenu({ open: true, parentId: parentItem?.id ?? null, blockId: blockData?.id || blockData?._id, x: rect.right, y: rect.top });
    }
  };

  // ── block menu ─────────────────────────────────────────────────────────────
  const handleBlockMenuSelect = (action) => {
    if (!blockMenu.blockId) return;

    if (action === 'Edit...') {
      let foundBlock = null;
      if (parentItem?.type === 'parallel-section') {
        setParentItemId(parentItem?.id);
        console.log(parentItem?.id, 'parentItem?.id')
        parentItem.branches?.forEach(br => br.blocks?.forEach(bl => {
          if (bl._id === blockMenu.blockId || bl.id === blockMenu.blockId) foundBlock = bl;
        }));
        setParallelFoundBlock(foundBlock);
      } else {
        foundBlock = blocks.find(b => b.id === blockMenu.blockId);
      }
      if (!foundBlock) { setBlockMenu({ open: false, blockId: null, x: 0, y: 0 }); return; }
      if (foundBlock) {
        // Check if it's a SubRBD block
        if (foundBlock.type === 'SubRBD') {
          // ✅ FOR SUBRBD: Open RBD List Modal in EDIT mode
          console.log("Editing SubRBD block:", foundBlock);

          setRbdListModal({
            open: true,
            mode: 'edit',  // Important: Set mode to 'edit'
            blockId: blockMenu.blockId,
            nodeIndex: null,
            selectedRbd: foundBlock.data?.rbdData || foundBlock.rbdData || null
          });
        }
        else
          if (foundBlock.type === 'K-out-of-N') {
            setKOfNModal({ open: true, mode: 'edit', blockId: blockMenu.blockId, nodeIndex: null, initialData: foundBlock.data || foundBlock });
          } else {
            const bmap = { 'K-out-of-N': 'K_OUT_OF_N', SubRBD: 'SUBRBD', 'Parallel Section': 'PARALLEL_SECTION', 'Parallel Branch': 'PARALLEL_BRANCH' };
            setElementModal({ open: true, mode: 'edit', blockId: blockMenu.blockId, blockType: bmap[foundBlock.type] || 'REGULAR', nodeIndex: null });
          }
      } else if (action === 'Delete...') {
        handleDeleteBlock(blockMenu.blockId);
      } else if (action === 'Add K-out-of-N') {
        setKOfNModal({
          open: true, mode: 'add', blockId: nextId, nodeIndex: clickedNodeInfo.index,
          initialData: { k: 2, n: 3, lambda: 0.001, mu: 1000, formula: 'standard', name: 'K-out-of-N Block' }
        });
      } else if (action === "Add SubRBD") {
        // Open RBD list modal
        setRbdListModal({
          open: true,
          mode: 'add',
          blockId: nextId,
          nodeIndex: clickedNodeInfo.index,
          selectedRbd: null
        });
      } else if (action === 'Add Parallel Section') {
        setPendingAction({ type: 'parallel', nodeIndex: clickedNodeInfo.index });
        setShowParallelModal(true);
      } else if (action.startsWith('Add ')) {
        const amap = { 'Add K-out-of-N': 'K_OUT_OF_N', 'Add SubRBD': 'SUBRBD', 'Add Parallel Section': 'PARALLEL_SECTION', 'Add Parallel Branch': 'PARALLEL_BRANCH' };
        setElementModal({ open: true, mode: 'add', blockId: nextId, blockType: amap[action] || 'REGULAR', nodeIndex: clickedNodeInfo.index });
      }

      setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
    };
  }
  const handleClose = () => {
    setKOfNModal(prev => ({
      ...prev,
      open: false
    }));
  };
  const SettingsButton1 = () => (
    <button
      onClick={() => setIsModalOpen(true)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#2b4f81',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.3s'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3c66'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#2b4f81'}
    >
      <FiSettings size={18} />
      <span>RBD Configuration</span>
    </button>
  );
  const [open, setOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  return (
    <div style={{ minHeight: '100vh', padding: '20px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '50px' }}>

        <div style={{ margin: '40px 0', display: 'flex', gap: 12 }}>
          <button
            onClick={() => setShowSymbol(true)}
            style={{ backgroundColor: 'green', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            RBD
          </button>
          {/* <button
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                     backgroundColor: '#2b4f81', color: 'white', border: 'none',
                     borderRadius: '4px', cursor: 'pointer', fontSize: 14 }}
          >
            <FiSettings size={18} /> RBD Configuration
          </button> */}
        </div>

        {showSymbol && (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            {console.log(showSymbol, ' - is showSymbol')}
            <BiDirectionalSymbol
              onNodeClick={handleNodeClick}
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
                  setBlockMenu({ open: false, blockId: null, x: 0, y: 0 })
                  setParentItem(null)
                }
                }
              />
            )}

            {elementModal.open && (
              <ElementParametersModal
                key={elementModal.blockId}
                isOpen={elementModal.open}
                elementModal={elementModal}
                onClose={() => {
                  setElementModal({
                    open: false,
                    mode: "add",
                    blockId: null,
                    blockType: "",
                    nodeIndex: null
                  })
                  setParentItem(null)
                }
                }
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
                currentBlock={
                  blocks.find((b) => {
                    // console.log("b.id:", b.id, "elementModal.blockId:", elementModal.blockId);
                    return b.id === elementModal.blockId;
                  })
                }
              />
            )}

            {/* RBD List Modal for SubRBD */}
            {/* RBD List Modal for SubRBD */}
            {rbdListModal.open && (
              <SubRBDModal
                show={rbdListModal.open}
                onHide={() => setRbdListModal({ ...rbdListModal, open: false })}
                rbdData={rbdListModal.selectedRbd}
              />
            )}

            {kOfNModal.open && (
              <>
                <CaseSelectionModal
                  isOpen={kOfNModal.open}
                  handleClose={handleClose}
                  onSelect={(item) => {
                    console.log(item);
                    handleClose();
                  }}

                />
              </>
            )}

            {showParallelModal && (
              <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2000
              }}>
                <div style={{
                  backgroundColor: "#f0f0f0",
                  padding: "20px",
                  borderRadius: "8px",
                  minWidth: "350px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  border: "1px solid #999"
                }}>
                  <h3 style={{
                    marginTop: 0,
                    marginBottom: "20px",
                    fontSize: "14px",
                    fontWeight: "normal",
                    color: "#333"
                  }}>
                    Add Parallel Section
                  </h3>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "13px",
                      color: "#333"
                    }}>
                      Number of branches :
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={branchCount}
                      onChange={(e) => setBranchCount(parseInt(e.target.value) || 1)}
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #7f9db9",
                        borderRadius: "3px",
                        fontSize: "13px",
                        backgroundColor: "white"
                      }}
                      autoFocus
                    />
                  </div>

                  <div style={{
                    backgroundColor: "white",
                    padding: "10px",
                    marginBottom: "20px",
                    fontSize: "12px",
                    color: "#333",
                    border: "1px solid #ccc",
                    fontFamily: "monospace",
                    lineHeight: "1.5"
                  }}>
                    <div>Communication Unit</div>
                    <div>19949.1</div>
                    <div>#10</div>
                    <div>#11</div>
                  </div>

                  <div style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end"
                  }}>
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
                        minWidth: "70px"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d1d1d1"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e1e1e1"}
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
                })
              }
              }
              onSubmit={handleSwitchSubmit}
              currentSwitchData={switchModal.initialData}
            />

            <EditRBDConfigurationModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false)
                setParentItem(null)
              }}
              onSave={handleSaveConfig}
              initialConfig={rbdConfig}
            />
          </div>
        )}
        {menu && (
          <RBDContextMenu x={menu.x} y={menu.y} onSelect={handleSelect}
            onClose={() => { setMenu(null); setParentItem(null); }} />
        )}

        {blockMenu.open && (
          <BlockContextMenu
            x={blockMenu.x} y={blockMenu.y}
            setParallelFoundBlock={setParallelFoundBlock}
            onSelect={handleBlockMenuSelect}
            onClose={() => { setBlockMenu({ open: false, blockId: null, x: 0, y: 0 }); setParentItem(null); }}
          />
        )}

        {elementModal.open && (
          <ElementParametersModal
            key={elementModal.blockId}
            isOpen
            elementModal={elementModal}
            onClose={() => {
              setElementModal({ open: false, mode: 'add', blockId: null, blockType: '', nodeIndex: null, idforApi: null, });
              setParentItem(null);
            }}
            setLoadChange={setLoadChange}
            onSubmit={handleModalSubmit}
            onOpenSwitchConfig={(data) => setSwitchModal({ open: true, blockId: elementModal.blockId, initialData: data })}
            rbdId={rbdId}
            projectId={id}
            parallelFoundBlock={parallelFoundBlock}
            parentItemId={parentItemId}
            getBlock={getBlock}
            currentBlock={blocks.find(b => b.id === elementModal.blockId)}
          />
        )}

        {kOfNModal.open && (
          <CaseSelectionModal
            isOpen={kOfNModal.open}
            handleClose={handleClose}
            onSelect={(item) => {
              console.log(item);
              handleClose();
            }}

          />
        )}

        {showParallelModal && (
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
        )}

        <SwitchConfigurationModal
          isOpen={switchModal.open}
          onClose={() => setSwitchModal({ open: false, blockId: null, initialData: null })}
          onSubmit={(data) => {
            setBlocks(prev => prev.map(b => b.id === elementModal.blockId ? { ...b, data: { ...b.data, switchData: data } } : b));
            setSwitchModal({ open: false, blockId: null, initialData: null });
          }}
          currentSwitchData={switchModal.initialData}
        />

        <EditRBDConfigurationModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setParentItem(null); }}
          onSave={setRbdConfig}
          initialConfig={rbdConfig}
        />
      </div>
    </div>
  );
}