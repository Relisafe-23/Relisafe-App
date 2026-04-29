import React, { useState, useEffect } from "react";
import EditRBDConfigurationModal from "./EditRBDConfigurationModal";
import {
  FiSettings,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";
import { RBDBlock } from "./RBDBlock";
import Api from "../../Api";

import { useHistory, useParams, useLocation } from "react-router-dom";

// MUI imports
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { NavItem } from "react-bootstrap";

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
        style={{ cursor: "pointer" }}
        onMouseEnter={(e) => {
          onOpenMenu(e.clientX, e.clientY);
        }}
        // onMouseLeave={() => {
        //   onCloseMenu();
        // }}
      />

      <line
        x1={x - 3}
        y1={y}
        x2={x + 3}
        y2={y}
        stroke="white"
        strokeWidth="1.5"
      />
      <line
        x1={x}
        y1={y - 3}
        x2={x}
        y2={y + 3}
        stroke="white"
        strokeWidth="1.5"
      />
    </g>
  );
};

export const BiDirectionalSymbol = ({
  onNodeClick,
  onOpenMenu,
  blocks,
  onDeleteBlock,
  onEditBlock,
}) => {
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
  const dynamicRightBoxX = baseRightBoxX + blocks.length * 30;

  const calculateLayout = () => {
    if (blocks.length === 0) {
      const centerX = (leftBoxX + boxWidth + baseRightBoxX) / 2;
      return {
        items: [],
        totalWidth: 0,
        startX: centerX,
        actualRightBoxX: baseRightBoxX,
      };
    }

    const totalBlocksWidth = blocks.length * blockWidth;
    const totalNodesWidth = (blocks.length + 1) * nodeSpacing * 2;
    const totalBlockSpacing = (blocks.length - 1) * blockSpacing;
    const totalNeededWidth =
      totalBlocksWidth + totalNodesWidth + totalBlockSpacing;

    const requiredRightBoxX =
      leftBoxX + boxWidth + totalNeededWidth + minOutputGap + boxWidth;
    const actualRightBoxX = Math.max(baseRightBoxX, requiredRightBoxX);

    const availableWidth = actualRightBoxX - leftBoxX - boxWidth * 2;
    const startX =
      leftBoxX +
      boxWidth +
      (availableWidth - totalNeededWidth) / 2 +
      nodeSpacing;

    const items = [];
    let currentX = startX;

    items.push({
      type: "node",
      id: "node-start",
      x: currentX,
      y: centerPointY,
    });
    currentX += nodeSpacing;

    blocks.forEach((block, index) => {
      items.push({
        type: "block",
        id: block.id,
        blockType: block.type,
        blockData: block.data,
        x: currentX,
        y: centerPointY - 20,
      });
      currentX += blockWidth + blockSpacing;

      if (index < blocks.length - 1) {
        items.push({
          type: "node",
          id: `node-${block.id}`,
          x: currentX,
          y: centerPointY,
        });
        currentX += nodeSpacing;
      }
    });

    if (blocks.length > 0) {
      items.push({
        type: "node",
        id: "node-end",
        x: currentX,
        y: centerPointY,
      });
    }

    return {
      items,
      totalWidth: currentX - startX,
      startX,
      actualRightBoxX,
    };
  };

  const layout = calculateLayout();
  const items = layout.items;
  const rightBoxX = layout.actualRightBoxX;

  const leftArrowPoints = [
    [rightBoxX, centerPointY - arrowHeight / 2],
    [rightBoxX + arrowWidth, centerPointY],
    [rightBoxX, centerPointY + arrowHeight / 2],
  ]
    .map((p) => p.join(","))
    .join(" ");

  const rightArrowPoints = [
    [leftBoxX + boxWidth, centerPointY - arrowHeight / 2],
    [leftBoxX + boxWidth - arrowWidth, centerPointY],
    [leftBoxX + boxWidth, centerPointY + arrowHeight / 2],
  ]
    .map((p) => p.join(","))
    .join(" ");

  const getConnectionPoints = () => {
    const connectionPoints = [];

    if (items.length === 0) {
      connectionPoints.push({
        from: leftBoxX + boxWidth,
        to: rightBoxX,
        y: centerPointY,
      });
    } else {
      connectionPoints.push({
        from: leftBoxX + boxWidth,
        to: items[0].x - nodeRadius,
        y: centerPointY,
      });

      for (let i = 0; i < items.length - 1; i++) {
        const current = items[i];
        const next = items[i + 1];

        let fromX, toX;

        if (current.type === "block") {
          fromX = current.x + blockWidth;
        } else {
          fromX = current.x + nodeRadius;
        }

        if (next.type === "block") {
          toX = next.x;
        } else {
          toX = next.x - nodeRadius;
        }

        connectionPoints.push({
          from: fromX,
          to: toX,
          y: centerPointY,
        });
      }

      const lastItem = items[items.length - 1];
      let lastX;
      if (lastItem.type === "block") {
        lastX = lastItem.x + blockWidth;
      } else {
        lastX = lastItem.x + nodeRadius;
      }

      const minEndX = rightBoxX - minOutputGap;
      const endX = Math.min(lastX + 20, minEndX);

      connectionPoints.push({
        from: lastX,
        to: endX,
        y: centerPointY,
      });

      connectionPoints.push({
        from: endX,
        to: rightBoxX,
        y: centerPointY,
      });
    }

    return connectionPoints;
  };

  const connectionPoints = getConnectionPoints();
  const svgWidth = Math.max(750, rightBoxX + 100);

  return (
    <svg
      width={svgWidth}
      height="100"
      viewBox={`0 0 ${svgWidth} 100`}
      style={{ overflow: "visible" }}
    >
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

      {console.log("item", items)}

      {items.map((item) => {
        if (item.type === "node") {
          return (
            <InsertionNode
              key={item.id}
              x={item.x}
              y={item.y}
              onOpenMenu={onOpenMenu}
            />
          );
        } else if (item.type === "block") {
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
        onClick={() => onSelect(item)}
        style={{
          padding: "8px",
          cursor: "pointer",
          ":hover": {
            backgroundColor: "#f0f0f0",
          },
        }}
      >
        {item}
      </div>
    ))}
  </div>
);

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
    ].map((item) => {
      // console.log("ITEM,....", item)
      return (
        <div
          key={item}
          onClick={() => onSelect(item)}
          style={{
            padding: "8px",
            cursor: "pointer",
            ":hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          {item}
        </div>
      );
    })}
  </div>
);

const StyledTableContainer = styled(TableContainer)({
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  borderRadius: "12px",
  overflow: "hidden",
  marginTop: "24px",
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: "#f8f9fa",
  "& .MuiTableCell-head": {
    fontWeight: 600,
    color: "#495057",
    fontSize: "0.95rem",
    borderBottom: "2px solid #dee2e6",
  },
});

const StyledTableRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: "#f8f9fa",
    transition: "background-color 0.3s ease",
  },
});

// Main Component
// Main Component - Table View
// Main Component - Table View
export default function RBDButton() {
  const { id } = useParams();
  const projectId = id;
  const location = useLocation();
  const history = useHistory();


  
  const [selectedRBD, setSelectedRBD] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelItem, setModelItem] = useState(null)
  const [rbdList, setRbdList] = useState([])
  const [rBDTitle, setRBDTitle] = useState([])
  const [mission, setMission] = useState([])
  const [description, setDescription] = useState([])
  const [rbdId, setRbdId] = useState("")
  const [rbdlistData, setRbdlistData] = useState([])
  const [missionData,setMissionData]= useState('')
  const [rbdConfig, setRbdConfig] = useState({
    rbdTitle: "My RBD",
    missionTime: 24,
    displayUpper: "Part number",
    displayLower: "MTBF",
    printRemarks: "Yes"
  });
  // REMOVED duplicate state declarations






   useEffect(() => {
  console.log("Updated MissionTime:", missionData);
}, [missionData]);

  useEffect(() => {
    getRbdConfig();
  }, [projectId]);

   const getRbdConfig = () => {
    // console.log("Fetching RBD configuration...")
    Api.get("/api/v1/EditConfigRBD/", {
      params: {
        projectId: projectId,
      }
    })
      .then((res) => {
     console.log("Resjkhjh",res)
        setRbdlistData(res.data.data)
        const rbdIds = res.data.data.map((item) => item.id); 
        setRbdId(rbdIds);
        const rbdName = res.data.data.filter((item) => item.rbdTitle).map((item) => item.rbdTitle)
        const rbdDescription = res.data.data.filter((item) => item.description).map((item) => item.description)
        setDescription(rbdDescription)
        // console.log("descriptio.....n",rbdDescription)
        const rbdMission = res.data.data.filter((item) => item.missionTime).map((item) => item.missionTime)
    
        setMission(rbdMission)
        setRBDTitle(rbdName)
        setRbdList(res.data.data)
       
        // Update state with fetched data if needed
        // setRbdConfig(res.data.data);
      })
      .catch((error) => {
        console.error("Error fetching RBD config:", error);
      });
  }

  // const handleSaveConfig = async (configData) => {
  //   try {
  //     const payload = {
  //       ...configData,
  //       projectId: projectId,
  //     };

  //     if (modelItem?.id) {
  //       // Update existing
  //       await Api.patch(
  //         `/api/v1/EditConfigRBD/update/${modelItem.id}`,
  //         payload,
  //       );
  //     } else {
  //       // Create new
  //       await Api.post("/api/v1/EditConfigRBD/create", payload);
  //     }
  //     getRbdConfig(); // Refresh the table
  //     setIsModalOpen(false);
  //     setModelItem(null);
  //   } catch (error) {
  //     console.error("Save failed:", error);
  //   }
  // };
 const handleSaveConfig = (newConfig) => {
    setRbdConfig(newConfig);
    // console.log("Saved config:", newConfig);
  };
  const handleClose = () => {
    setIsModalOpen(false);
    setModelItem(null);
  };

  const handleEditClick = (item, index) => {
    setIsModalOpen(true);
    setModelItem(item);
      const selectedRbdId = rbdId[index];
  };

  const handleViewClick = (item, index) => {
    let rbdId = item?.id;
    let id = item?.projectId;
    let rbdTitle = item?.rbdTitle;
    const rbdData = item?.missionTime;

    history.push({
      pathname: `/project/${id}/rbd/structure/${rbdId}`,
      state: { missionTime: rbdData ,rbdTitle:rbdTitle },
    });
  };

  const handleDeleteClick = async (item) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${item?.rbdTitle}"?`,
    );

    if (!isConfirmed) return;

    try {
      await Api.delete(`/api/v1/EditConfigRBD/delete/${item?.id}`);
      getRbdConfig();
    } catch (error) {
      console.log("Delete failed:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  // Function to fetch and calculate reliability for a specific RBD
  const fetchRBDCalculations = async (rbdId, projectId) => {
    try {
      const response = await Api.get(
        `/api/v1/elementParametersRBD/getRBD/${rbdId}/${projectId}`,
      );
      const data = response.data.data;

      // Calculate reliability recursively
      const computeReliability = (item) => {
        if (
          item.arrangement === "horizontal" &&
          item.branches &&
          item.branches.length > 0
        ) {
          return computeParallelSectionReliability(item.branches);
        }
        const reliability = Number(item.reliability);
        return isNaN(reliability) ? 1 : reliability;
      };

      const computeParallelSectionReliability = (branches) => {
        if (!branches || branches.length === 0) return 1;

        const branchReliabilities = branches.map((branch) =>
          computeBranchReliability(branch),
        );
        const productOfUnavailabilities = branchReliabilities.reduce(
          (acc, r) => acc * (1 - r),
          1,
        );
        return 1 - productOfUnavailabilities;
      };

      const computeBranchReliability = (branch) => {
        if (!branch.blocks || branch.blocks.length === 0) return 1;

        const blockReliabilities = branch.blocks.map((block) => {
          if (
            block.arrangement === "horizontal" &&
            block.branches &&
            block.branches.length > 0
          ) {
            return computeParallelSectionReliability(block.branches);
          }
          const reliability = Number(block.reliability);
          return isNaN(reliability) ? 1 : reliability;
        });

        return blockReliabilities.reduce((acc, r) => acc * r, 1);
      };

      const topLevelReliabilities = data.map((item) =>
        computeReliability(item),
      );
      const totalReliability = topLevelReliabilities.reduce(
        (acc, r) => acc * r,
        1,
      );
      const totalUnavailability = 1 - totalReliability;

      return { totalReliability, totalUnavailability };
    } catch (error) {
      console.error(`Error fetching RBD ${rbdId}:`, error);
      return { totalReliability: null, totalUnavailability: null };
    }
  };

  // Fetch calculations for all RBDs when component mounts or when rbdlistData changes
  useEffect(() => {
    const fetchAllCalculations = async () => {
      if (!rbdlistData.length) return;

      const updatedData = await Promise.all(
        rbdlistData.map(async (item) => {
          // Only fetch if we don't already have values or if we want to refresh
          if (!item.totalReliability && !item.totalUnavailability) {
            const { totalReliability, totalUnavailability } =
              await fetchRBDCalculations(item.id, projectId);
            return { ...item, totalReliability, totalUnavailability };
          }
          return item;
        }),
      );

      setRbdlistData(updatedData);
    };

    fetchAllCalculations();
  }, [rbdlistData.length]); // Re-run when new RBDs are added

  return (
    <Box sx={{ minHeight: "100vh", p: 3, mt: 5, backgroundColor: "#f5f5f5" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#2c3e50" }}>
          RBD Configuration
        </Typography>

        <Button
          variant="contained"
          onClick={() => setIsModalOpen(true)}
          startIcon={<FiSettings />}
          sx={{
            backgroundColor: "#2b4f81",
            "&:hover": {
              backgroundColor: "#1e3c66",
            },
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            py: 1,
          }}
        >
          RBD Configuration
        </Button>
      </Box>

      <StyledTableContainer component={Paper}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>RBD Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Mission Time (hrs)</TableCell>
              <TableCell>Total Unavailable</TableCell>
              <TableCell>Total Reliability</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {rbdlistData.map((item, index) => (
              <StyledTableRow key={item.id || index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item?.rbdTitle || "-"}</TableCell>
                <TableCell>{item?.description || "-"}</TableCell>
                <TableCell>{item?.missionTime || "-"}</TableCell>
                <TableCell>
                  {item?.totalUnavailability !== undefined &&
                  item?.totalUnavailability !== null
                    ? Number(item.totalUnavailability).toFixed(9)
                    : "Calculating..."}
                </TableCell>
                <TableCell>
                  {item?.totalReliability !== undefined &&
                  item?.totalReliability !== null
                    ? Number(item.totalReliability).toFixed(9)
                    : "Calculating..."}
                </TableCell>
                <TableCell>
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(item, index)}
                      sx={{
                        mr: 1,
                        color: "#2b4f81",
                        "&:hover": {
                          backgroundColor: "rgba(43, 79, 129, 0.04)",
                        },
                      }}
                    >
                      <FiEye size={20} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(item, index)}
                      sx={{
                        mr: 1,
                        color: "#4CAF50",
                        "&:hover": {
                          backgroundColor: "rgba(76, 175, 80, 0.04)",
                        },
                      }}
                    >
                      <FiEdit2 size={20} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(item, index)}
                      sx={{
                        color: "#f44336",
                        "&:hover": {
                          backgroundColor: "rgba(244, 67, 54, 0.04)",
                        },
                      }}
                    >
                      <FiTrash2 size={20} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <EditRBDConfigurationModal
        isOpen={isModalOpen}
        modelItem={modelItem}
        setModelItem={setModelItem}
        getRbdConfig={getRbdConfig}
        onClose={handleClose}
        setIsModalOpen={setIsModalOpen}
        onSave={handleSaveConfig}
        initialConfig={rbdConfig}
        editData={selectedRBD}
      />
    </Box>
  );
}
