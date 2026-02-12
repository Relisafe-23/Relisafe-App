import React, { useState } from 'react';
import SwitchConfigurationModal  from './SwitchConfig';
import {ElementParametersModal} from './ElementParametersModal';
import {
  BiDirectionalSymbol,
  RBDContextMenu,
  BlockContextMenu,

  // SplitKOutOfNModa
} from './index';

export const SplitKofN = ({ isOpen, onClose, onSubmit, currentData }) => {
  const [ranges, setRanges] = useState(currentData?.ranges || [
    { range: '1.3', frDistribution: 'Exponential', frPAsm1: '120742000', frPAsm2: 'Close' }
  ]);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const [newRangeValue, setNewRangeValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ranges });
    onClose();
  };

  const handleAddRange = () => {
    if (newRangeValue) {
      const newRange = {
        range: newRangeValue,
        frDistribution: 'Exponential',
        frPAsm1: '',
        frPAsm2: 'Close'
      };
      setRanges([...ranges, newRange]);
      setNewRangeValue('');
      setSelectedRangeIndex(ranges.length);
    }
  };

  const handleRemoveRange = (index) => {
    if (ranges.length > 1) {
      const newRanges = ranges.filter((_, i) => i !== index);
      setRanges(newRanges);
      if (selectedRangeIndex >= newRanges.length) {
        setSelectedRangeIndex(newRanges.length - 1);
      }
    }
  };

  const handleUpdateRange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index] = {
      ...newRanges[index],
      [field]: value
    };
    setRanges(newRanges);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1004
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '4px',
        width: '800px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ 
          marginBottom: '20px', 
          color: '#333', 
          fontSize: '18px', 
          fontWeight: 'bold',
          borderBottom: '2px solid #007bff',
          paddingBottom: '10px'
        }}>
          Split K out-of-N
        </h2>
        
        <div style={{ marginBottom: '20px', color: '#555', fontSize: '14px' }}>
          The dialog will appear—It allows assigning different reliability parameters to different ranges.
          Using the "Change range" button, create new ranges and split your K/N elements into separate lines with different reliability values.
        </div>

        <form onSubmit={handleSubmit}>
          {/* Range Table */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 200px 1fr 1fr 80px',
              gap: '1px',
              backgroundColor: '#e0e0e0',
              border: '1px solid #e0e0e0',
              marginBottom: '15px'
            }}>
              {/* Table Headers */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'center'
              }}>Range</div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'center'
              }}>FR Distribution</div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'center'
              }}>FR P asm1</div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'center'
              }}>FR P asm2</div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'center'
              }}>Action</div>

              {/* Table Rows */}
              {ranges.map((range, index) => (
                <React.Fragment key={index}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <input
                      type="text"
                      value={range.range}
                      onChange={(e) => handleUpdateRange(index, 'range', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '13px',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <select
                      value={range.frDistribution}
                      onChange={(e) => handleUpdateRange(index, 'frDistribution', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '13px',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <option value="Exponential">Exponential</option>
                      <option value="Weibull">Weibull</option>
                      <option value="Normal">Normal</option>
                      <option value="Lognormal">Lognormal</option>
                    </select>
                  </div>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <input
                      type="text"
                      value={range.frPAsm1}
                      onChange={(e) => handleUpdateRange(index, 'frPAsm1', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '13px',
                        textAlign: 'center'
                      }}
                      placeholder="120742000"
                    />
                  </div>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <select
                      value={range.frPAsm2}
                      onChange={(e) => handleUpdateRange(index, 'frPAsm2', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        fontSize: '13px',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <option value="Close">Close</option>
                      <option value="Open">Open</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {ranges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRange(index)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Example Explanation */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              marginTop: '20px',
              fontSize: '13px',
              color: '#555',
              borderLeft: '4px solid #007bff'
            }}>
              <strong>Example:</strong> In the table above, the first element (Range 1.3) is different from subsequent elements.
              You can create new ranges to split your K/N elements into separate lines with different reliability values.
            </div>
          </div>

          {/* Add New Range Section */}
          <div style={{
            backgroundColor: '#f0f8ff',
            padding: '20px',
            borderRadius: '4px',
            marginBottom: '25px',
            border: '1px dashed #007bff'
          }}>
            <h3 style={{ 
              marginBottom: '15px', 
              fontSize: '16px', 
              color: '#007bff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>Add New Range</span>
            </h3>
            <div style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#555'
                }}>
                  New Range Value:
                </label>
                <input
                  type="text"
                  value={newRangeValue}
                  onChange={(e) => setNewRangeValue(e.target.value)}
                  placeholder="e.g., 2.0, 3.5, etc."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddRange}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                disabled={!newRangeValue}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Change Range
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '15px',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 24px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: 'linear-gradient(to bottom, #f9f9f9, #e9e9e9)',
                color: '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '100px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'linear-gradient(to bottom, #e9e9e9, #d9d9d9)'}
              onMouseLeave={(e) => e.target.style.background = 'linear-gradient(to bottom, #f9f9f9, #e9e9e9)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '4px',
                background: 'linear-gradient(to bottom, #007bff, #0056b3)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '100px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'linear-gradient(to bottom, #0056b3, #004085)'}
              onMouseLeave={(e) => e.target.style.background = 'linear-gradient(to bottom, #007bff, #0056b3)'}
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ... Keep all other components (SwitchConfigurationModal, ElementParametersModal, RBDBlock, InsertionNode, BiDirectionalSymbol, RBDContextMenu, BlockContextMenu) exactly as before ...

// Update the Main Component to include SplitKOutOfNModal
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
  const [splitModal, setSplitModal] = useState({
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

  const handleSplitModalOpen = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    setSplitModal({
      open: true,
      blockId,
      initialData: block?.data?.splitData || { ranges: [] }
    });
  };

  const handleSplitSubmit = (splitData) => {
    if (splitModal.blockId) {
      setBlocks(blocks.map(block => 
        block.id === splitModal.blockId 
          ? { 
              ...block, 
              data: {
                ...block.data,
                splitData: splitData
              }
            }
          : block
      ));
    }
    
    setSplitModal({ open: false, blockId: null, initialData: null });
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
      handleSplitModalOpen(blockMenu.blockId);
    }
    
    setBlockMenu({ open: false, blockId: null, x: 0, y: 0 });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "20px", overflowX: 'auto' }}>
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        marginTop: "50px" 
      }}>
        <div style={{ marginBottom: "40px" }}>
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

        {showSymbol && (
          <div style={{ marginTop: "20px", width: '100%', overflowX: 'auto' }}>
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

      {menu && (
        <RBDContextMenu
          x={menu.x}
          y={menu.y}
          onSelect={handleSelect}
          onClose={() => setMenu(null)}
        />
      )}

      {blockMenu.open && (
        <BlockContextMenu
          x={blockMenu.x}
          y={blockMenu.y}
          onSelect={handleBlockMenuSelect}
          onClose={() => setBlockMenu({ open: false, blockId: null, x: 0, y: 0 })}
        />
      )}

      <ElementParametersModal
        isOpen={elementModal.open}
        onClose={() => setElementModal({ open: false, mode: 'add', blockId: null, blockType: '' })}
        onSubmit={handleModalSubmit}
        onOpenSwitchConfig={handleSwitchConfigOpen}
        currentBlock={blocks.find(b => b.id === elementModal.blockId)?.data}
      />

      <SwitchConfigurationModal
        isOpen={switchModal.open}
        onClose={() => setSwitchModal({ open: false, blockId: null, initialData: null })}
        onSubmit={handleSwitchSubmit}
        currentSwitchData={switchModal.initialData}
      />

      {/* <SplitKOutOfNModal
        isOpen={splitModal.open}
        onClose={() => setSplitModal({ open: false, blockId: null, initialData: null })}
        onSubmit={handleSplitSubmit}
        currentData={splitModal.initialData}
      /> */}
    </div>
  );
}