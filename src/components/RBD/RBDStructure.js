import React, { useState, useEffect } from 'react';
import SplitKofN from './SplitKofN';
import Api from "../../Api";
import EditRBDConfigurationModal from './EditRBDConfigurationModal';
import { useParams, useLocation } from 'react-router-dom';
import CreatableSelect from "react-select/creatable";
import { FiSettings, FiEdit2, FiSliders } from 'react-icons/fi';
import {ElementParametersModal} from './ElementParametersModal';
import { KOfNConfigModal } from './KOfNConfigModal.js'; // Import the K-out-of-N modal
import SwitchConfigurationModal from './SwitchConfig.js';
import { RBDBlock } from './RBDBlock';
import { KOfNBlock } from './KOfNBlock';

export const InsertionNode = ({  index,x, y, onOpenMenu }) => {
  return (
    <g>
       <circle
        cx={x}
        cy={y}
        r="6"
        fill="black"
        style={{ cursor: "pointer" }}
        onClick={(e) => onOpenMenu(e.clientX, e.clientY, index)}
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
  const boxHeight = 60;
  const arrowWidth = 15;
  const arrowHeight = 20;
  const centerPointY = 150;
  const nodeRadius = 6;
  const blockWidth = 60;
  const blockHeight = 70;
  const nodeSpacing = 20;
  const blockSpacing = 20;
  const minOutputGap = 50;
  const parallelVerticalSpacing = 50;

  const leftBoxX = 50;
  const baseRightBoxX = 650;
  const dynamicRightBoxX = baseRightBoxX + (blocks.length * 30);

  // Process blocks to identify parallel sections
  const processBlocksWithParallelSections = (blocks) => {
    const regularBlocks = [];
    const parallelSections = {};
    
    blocks.forEach(block => {
      if (block.type === 'Parallel Section') {
        parallelSections[block.id] = {
          ...block,
          branches: []
        };
      } else if (block.data?.parentSection) {
        const parentId = block.data.parentSection;
        if (parallelSections[parentId]) {
          parallelSections[parentId].branches.push(block);
        } else {
          regularBlocks.push(block);
        }
      } else {
        regularBlocks.push(block);
      }
    });
    
    return { regularBlocks, parallelSections };
  };

  const calculateLayout = () => {
    const { regularBlocks, parallelSections } = processBlocksWithParallelSections(blocks);
    
    // Calculate total height needed for all elements to determine canvas height
    let maxY = centerPointY + 150;
    
    if (blocks.length === 0) {
      const centerX = (leftBoxX + boxWidth + baseRightBoxX) / 2;
      return {
        items: [],
        totalWidth: 0,
        startX: centerX,
        actualRightBoxX: baseRightBoxX,
        parallelSections: {},
        regularBlocks: [],
        maxY: maxY
      };
    }

    // Calculate total width needed
    const totalRegularBlocksWidth = regularBlocks.length * blockWidth;
    const totalParallelSectionsWidth = Object.keys(parallelSections).length * (blockWidth + 40);
    const totalNodesWidth = (regularBlocks.length + Object.keys(parallelSections).length + 1) * nodeSpacing * 2;
    const totalBlockSpacing = (regularBlocks.length + Object.keys(parallelSections).length - 1) * blockSpacing;
    const totalNeededWidth = totalRegularBlocksWidth + totalParallelSectionsWidth + totalNodesWidth + totalBlockSpacing;

    const requiredRightBoxX = leftBoxX + boxWidth + totalNeededWidth + minOutputGap + boxWidth;
    const actualRightBoxX = Math.max(baseRightBoxX, requiredRightBoxX);

    const availableWidth = actualRightBoxX - leftBoxX - boxWidth * 2;
    const startX = leftBoxX + boxWidth + (availableWidth - totalNeededWidth) / 2 + nodeSpacing;

    const items = [];
    let currentX = startX;

    // Add start node
    items.push({
      type: 'node',
      id: 'node-start',
      x: currentX,
      y: centerPointY
    });
    currentX += nodeSpacing;

    // Combine regular blocks and parallel sections in order
    const allElements = [...regularBlocks];
    
    blocks.forEach(block => {
      if (block.type === 'Parallel Section' && parallelSections[block.id]) {
        const index = allElements.findIndex(b => b.id === block.id);
        if (index === -1) {
          allElements.push(block);
        }
      }
    });

    // Sort to maintain original order
    allElements.sort((a, b) => {
      const indexA = blocks.findIndex(b => b.id === a.id);
      const indexB = blocks.findIndex(b => b.id === b.id);
      return indexA - indexB;
    });

    allElements.forEach((element) => {
      if (element.type === 'Parallel Section') {
      
        const section = parallelSections[element.id];
        if (section) {
          const branchCount = section.branches.length;
          const sectionHeight = branchCount * blockHeight + (branchCount - 1) * 10;
          
      
          const startY = centerPointY - (sectionHeight / 2);
          
       
          if (startY + sectionHeight + 30 > maxY) {
            maxY = startY + sectionHeight + 50;
          }
          
          items.push({
            type: 'parallel-section',
            id: element.id,
            blockType: element.type,
            blockData: element.data,
            x: currentX,
            y: startY,
            width: blockWidth + 20,
            height: sectionHeight + 30,
            branches: section.branches.map((branch, index) => {
              // Position branches evenly within the section
              const branchY = startY + 20 + index * (blockHeight + 10);
              return {
                ...branch,
                x: currentX + 10,
                y: branchY
              };
            })
          });
          
          currentX += blockWidth + 40;
        }
      } else {
        // Render regular block horizontally
        items.push({
          type: 'block',
          id: element.id,
          blockType: element.type,
          blockData: element.data,
          x: currentX,
          y: centerPointY - 20
        });
        currentX += blockWidth + blockSpacing;
      }

      // Add node after element
      if (allElements.indexOf(element) < allElements.length - 1) {
        items.push({
          type: 'node',
          id: `node-${element.id}`,
          x: currentX,
          y: centerPointY
        });
        currentX += nodeSpacing;
      }
    });

    // Add end node
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
      actualRightBoxX,
      parallelSections,
      regularBlocks,
      maxY: Math.max(maxY, centerPointY + 100)
    };
  };

  const layout = calculateLayout();
  const items = layout.items;
  const rightBoxX = layout.actualRightBoxX;
  const canvasHeight = Math.max(400, layout.maxY + 50);

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

        if (current.type === 'block' || current.type === 'parallel-section') {
          fromX = current.type === 'parallel-section' ? current.x + current.width : current.x + blockWidth;
        } else {
          fromX = current.x + nodeRadius;
        }

        if (next.type === 'block' || next.type === 'parallel-section') {
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
      } else if (lastItem.type === 'parallel-section') {
        lastX = lastItem.x + lastItem.width;
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
    <svg width={svgWidth} height={canvasHeight} viewBox={`0 0 ${svgWidth} ${canvasHeight}`} style={{ overflow: 'visible' }}>
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
        } else if (item.type === 'parallel-section') {
          return (
            <g key={item.id}>
              {/* Draw vertical connection lines for parallel section */}
              <line
                x1={item.x - 5}
                y1={item.y + 20}
                x2={item.x - 5}
                y2={item.y + item.height - 20}
                 stroke="black"
                strokeWidth="2"
                // strokeDasharray="5,3"
              />
              <line
                x1={item.x + item.width + 5}
                y1={item.y + 20}
                x2={item.x + item.width + 5}
                y2={item.y + item.height - 20}
                  stroke="black"
                strokeWidth="2"
                // strokeDasharray="5,3"
              />
              
      
              <line
                x1={item.x - 5}
                y1={item.y + 20}
                x2={item.x}
                y2={item.y + 20}
               stroke="black"
                strokeWidth="2"
              />
              <line
                x1={item.x - 5}
                y1={item.y + item.height - 20}
                x2={item.x}
                y2={item.y + item.height - 20}
             stroke="black"
                strokeWidth="2"
              />
              <line
                x1={item.x + item.width}
                y1={item.y + 20}
                x2={item.x + item.width + 5}
                y2={item.y + 20}
                  stroke="black"
                strokeWidth="2"
              />
              <line
                x1={item.x + item.width}
                y1={item.y + item.height - 20}
                x2={item.x + item.width + 5}
                y2={item.y + item.height - 20}
                stroke="black"
                strokeWidth="2"
              />

              {/* Draw parallel section container background */}
           
              
              {/* Render branches vertically */}
              {item.branches.map((branch) => (
                <RBDBlock
                  key={branch.id}
                  id={branch.id}
                  type={branch.type}
                  x={branch.x}
                  y={branch.y}
                  onEdit={onEditBlock}
                  onDelete={onDeleteBlock}
                  blockData={branch.data}
                />
              ))}
            </g>
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

// Updated RBDContextMenu - removed internal modal state
export const RBDContextMenu = ({ x, y, onSelect, onClose }) => {
  const handleItemClick = (item) => {
    console.log("item......", item);
    onSelect(item);
    onClose();
  };

  return (
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
          onClick={() => handleItemClick(item)}
          style={{
            padding: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

// Updated BlockContextMenu - removed internal modal state
export const BlockContextMenu = ({ x, y, onSelect, onClose }) => {
  const handleItemClick = (item) => {
    console.log("block menu item......", item);
    onSelect(item);
    onClose();
  };

  return (
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
          onClick={() => handleItemClick(item)}
          style={{
            padding: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

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
  
  // Add state for K-out-of-N modal
  const [kOfNModal, setKOfNModal] = useState({
    open: false,
    blockId: null,
    initialData: null,
    mode: 'add'
  });
  
  // Add state for parallel section modal
  const [showParallelModal, setShowParallelModal] = useState(false);
  const [branchCount, setBranchCount] = useState(3);
  const [pendingAction, setPendingAction] = useState(null);
  
  const location = useLocation();
  const [switchModal, setSwitchModal] = useState({
    open: false,
    blockId: null,
    initialData: null
  });

  const openMenu = (x, y) => setMenu({ x, y });

  const handleNodeClick = (node) => {
    console.log("Node clicked:", node);
  };
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const rbdTitle = queryParams.get('title');
    const rbdIndex = queryParams.get('index');
    
    console.log("RBD Title from query:", rbdTitle);
    console.log("RBD Index from query:", rbdIndex);
    

    const { state } = location;
    if (state) {
      console.log("RBD Title from state:", state.rbdTitle);
      console.log("RBD Data from state:", state.rbdData);
    }
  }, [location]);

  const handleEdit = (block) => {
    setElementModal({
      open: true,
      mode: "edit",    
      blockId: block.id,
      blockType: block.type,
    });
  };

  // Handle parallel section modal
  const handleOpenParallelModal = (from) => {
    console.log("Opening parallel modal from:", from);
    setPendingAction(from);
    setShowParallelModal(true);
  };

 const handleParallelModalSubmit = () => {
  console.log("Creating", branchCount, "parallel branches in vertical arrangement");
  
  const parentSectionId = `parallel-${Date.now()}`;
  const sectionId = nextId;
  
  // Create the main parallel section block
  const parallelSectionBlock = {
    id: sectionId,
    type: 'Parallel Section',
    data: {
      elementType: 'Parallel Section',
      name: `Parallel Section`,
      branchCount: branchCount,
      sectionId: parentSectionId,
      isParallel: true,
      arrangement: 'vertical',
      k: 1,
      n: branchCount
    }
  };
  
  // Create individual branch blocks
  const branchBlocks = [];
  for (let i = 0; i < branchCount; i++) {
    branchBlocks.push({
      id: nextId + i + 1,
      type: 'Regular',
      data: {
        elementType: 'Regular',
        name: `Branch ${i + 1}`,
        branchIndex: i,
        parentSection: sectionId,
        isParallelBranch: true,
        reliabilityData: null,
        failureRate: 0.001,
        mtbf: 1000
      }
    });
  }
  
  // Add blocks in the correct order (parallel section first, then branches)
  // But if you want to insert at a specific position rather than just at the end,
  // you'd need to modify this logic
  setBlocks([...blocks, parallelSectionBlock, ...branchBlocks]);
  setNextId(nextId + branchCount + 1);
  
  setShowParallelModal(false);
  setBranchCount(3);
  setPendingAction(null);
};

  const handleParallelModalCancel = () => {
    setShowParallelModal(false);
    setBranchCount(3);
    setPendingAction(null);
  };

  // K-out-of-N calculation functions based on the formulas from the image
  const calculateKOfNLambda = ({ k, n, lambda, mu }) => {
    // Formula from image: λ(n-q)/n = n!λ^q / ((n-q-1)! μ^q)
    // where q = n - k (number that can fail)
    const q = n - k;
    
    if (q === 0) {
      // All must work - series configuration
      return n * lambda;
    }
    
    if (k === 1) {
      // Parallel configuration - any one works
      return lambda / n; // Simplified approximation
    }
    
    // Calculate factorial ratio: n! / (n-q-1)!
    let factorialRatio = 1;
    for (let i = n - q; i <= n; i++) {
      if (i > 0) factorialRatio *= i;
    }
    
    // Calculate λ^q / μ^q
    const lambdaPower = Math.pow(lambda, q);
    const muPower = Math.pow(mu, q);
    
    // Return the calculated value with a scaling factor for realistic values
    return (factorialRatio * lambdaPower) / (muPower * 1000);
  };

  const calculateKOfNMu = ({ k, n, mu }) => {
    // Effective repair rate for k-out-of-n system
    return mu * k;
  };

  const handleSelect = (action) => {
    console.log("RBD action received:", action);

    // Handle parallel section from main menu
    if (action === "Add Parallel Section") {
      handleOpenParallelModal('menu');
      return;
    }
    
    // Handle K-out-of-N from main menu
    if (action === "Add K-out-of-N") {
      setKOfNModal({
        open: true,
        mode: 'add',
        blockId: nextId,
        initialData: {
          k: 2,
          n: 3,
          lambda: 0.001,
          mu: 1000,
          formula: 'standard',
          name: 'K-out-of-N Block'
        }
      });
      return;
    }

    // Handle other actions
    const type = typeof action === 'string' ? action.replace("Add ", "") : '';
    setElementModal({
      open: true,
      mode: 'add',
      blockId: nextId,
      blockType: type
    });
  };

  const handleKOfNSubmit = (data) => {
    const effectiveLambda = calculateKOfNLambda(data);
    const effectiveMu = calculateKOfNMu(data);
    
    const newBlock = {
      id: kOfNModal.mode === 'add' ? nextId : kOfNModal.blockId,
      type: 'K-out-of-N',
      data: {
        elementType: 'K-out-of-N',
        ...data,
        effectiveLambda,
        effectiveMu,
        mtbf: 1 / effectiveLambda,
        // Store the formula reference
        formulaRef: 'RIAC System Reliability Toolkit, page 394'
      }
    };
    
    if (kOfNModal.mode === 'add') {
      setBlocks([...blocks, newBlock]);
      setNextId(nextId + 1);
    } else {
      // Edit mode
      setBlocks(blocks.map(block =>
        block.id === kOfNModal.blockId ? newBlock : block
      ));
    }
    
    setKOfNModal({ open: false, blockId: null, initialData: null, mode: 'add' });
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rbdConfig, setRbdConfig] = useState({
    rbdTitle: "My RBD",
    missionTime: 24,
    displayUpper: "Part number",
    displayLower: "MTBF",
    printRemarks: "Yes"
  });

  const handleSaveConfig = (newConfig) => {
    setRbdConfig(newConfig);
    console.log("Saved config:", newConfig);
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
    console.log("Block menu action received:", action);
    
    if (!blockMenu.blockId) return;

    // Handle parallel section from block menu
    if (action === "Add Parallel Section") {
      handleOpenParallelModal('block');
      return;
    }

    if (action === "Edit...") {
      const block = blocks.find(b => b.id === blockMenu.blockId);
      
      // Check if it's a K-out-of-N block
      if (block?.type === 'K-out-of-N') {
        setKOfNModal({
          open: true,
          mode: 'edit',
          blockId: blockMenu.blockId,
          initialData: block.data
        });
      } else {
        setElementModal({
          open: true,
          mode: 'edit',
          blockId: blockMenu.blockId,
          blockType: block?.type === 'K-out-of-N' ? 'K_OUT_OF_N' :
            block?.type === 'SubRBD' ? 'SUBRBD' :
              block?.type === 'Parallel Section' ? 'PARALLEL_SECTION' :
                block?.type === 'Parallel Branch' ? 'PARALLEL_BRANCH' : 'REGULAR'
        });
      }
    } else if (action === "Delete...") {
      handleDeleteBlock(blockMenu.blockId);
    } else if (action === "Add K-out-of-N") {
      setKOfNModal({
        open: true,
        mode: 'add',
        blockId: nextId,
        initialData: {
          k: 2,
          n: 3,
          lambda: 0.001,
          mu: 1000,
          formula: 'standard',
          name: 'K-out-of-N Block'
        }
      });
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            marginTop: "50px",
          }}
        >
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
        
        {elementModal.open && (
          <ElementParametersModal
            key={elementModal.blockId} 
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
        )}

        {/* K-out-of-N Configuration Modal */}
        {kOfNModal.open && (
          <KOfNConfigModal
            isOpen={kOfNModal.open}
            onClose={() => setKOfNModal({ open: false, blockId: null, initialData: null, mode: 'add' })}
            onSubmit={handleKOfNSubmit}
            initialData={kOfNModal.initialData}
            mode={kOfNModal.mode}
          />
        )}

        {/* Parallel Section Modal */}
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

              {/* Communication Unit info */}
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
                <button
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
                </button>
              </div>
            </div>
          </div>
        )}
     
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

