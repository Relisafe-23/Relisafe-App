// ModalContext.js
import React, { createContext, useContext, useState } from "react";
import Api from "../Api";
import { toast } from "react-toastify";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import * as XLSX from 'xlsx';
const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isFTAModalOpen, setIsFTAModalOpen] = useState(false);
  const [isPropertiesModal, setIsPropertiesModal] = useState(false);
  const [isOpenChildModal, setIsOpenChildModal] = useState(false);
  const [isChildCreate, setIsChildCreate] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDeleteNode, setIsDeleteNode] = useState(false);
  const [isDeleteSucess, setIsdeleteSucess] = useState(false);
  const [data, setData] = useState();
  const [FTAdata, setFTAdata] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const [isProbOpen, setIsProbOpen] = useState(false);

  // FTA Create New Parent Modal
  const openFTAModal = () => {
    setIsFTAModalOpen(true);
  };

  const openProbabilityCalculations = () => {
    setIsProbOpen(true);
  };

  const closeProbabilityCalculations = () => {
    setIsProbOpen(false);
  };

  const closeFTAModal = () => {
    setIsFTAModalOpen(false);
  };

  // FTA Properties Modal
  const openPropertiesModal = () => {
    setIsPropertiesModal(true);
  };

  const closePropertiesModal = () => {
    setIsPropertiesModal(false);
  };

  // FTA Child Edit Modal
  const openEditGateModal = () => {
    setIsOpenChildModal(true);
  };

  const closeEditGateModal = () => {
    setIsOpenChildModal(false);
  };

  // FTA Child Create Modal
  const openChildCreateModal = () => {
    setIsChildCreate(true);
  };

  const closeChildCreateModal = () => {
    setIsChildCreate(false);
  };

  // FTA Event Modal
  const openChildEvent = () => {
    setIsEventModalOpen(true);
  };

  const closeChildEvent = () => {
    setIsEventModalOpen(false);
  };

  // Delete Node Open
  // In ModalContext.js, update the openDeleteNode function:

  // Delete Node Open
  const openDeleteNode = (deleteData) => {
    console.log("Opening delete modal with data:", deleteData);

    if (!deleteData) {
      console.error("No delete data provided");
      return;
    }

    // Store the data in a local variable to use in the modal callback
    const deleteInfo = deleteData;

    // Set the data state
    setData(deleteInfo);
    setIsDeleteNode(true);

    if (deleteInfo && deleteInfo.nodeActive) {
      Modal.confirm({
        title:
          deleteInfo.indexCount === 1 ? (
            <span>
              Are you sure you want to{" "}
              <span style={{ color: "red" }}>Delete Parent Tree</span>?
            </span>
          ) : (
            "Are you sure you want to Delete this node?"
          ),
        icon: <ExclamationCircleOutlined />,
        content: deleteInfo.treeName
          ? `Deleting: ${deleteInfo.treeName}`
          : null,
        okText: "Yes, Delete",
        cancelText: "Cancel",
        okButtonProps: { danger: true },
        getContainer: false,
        onOk: () => {
          // Pass the deleteInfo directly to confirmDelete
          confirmDelete(deleteInfo);
        },
      });
    }
  };

  const closeDeleteNode = (e) => {
    setData(e);
    setIsDeleteNode(false);
  };

  // In ModalContext.js, update confirmDelete:

  const confirmDelete = (deleteData) => {
    // Use the passed parameter instead of state
    const dataToDelete = deleteData || data;

    console.log("Confirm delete with data:", dataToDelete);

    if (!dataToDelete) {
      console.error("No data available for deletion");
      toast.error("Delete failed: No data provided", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "error",
      });
      return;
    }

    if (!dataToDelete.projId) {
      console.error("Missing projId in delete data:", dataToDelete);
      toast.error("Delete failed: Missing project ID", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "error",
      });
      return;
    }

    if (!dataToDelete.childId) {
      console.error("Missing childId in delete data:", dataToDelete);
      toast.error("Delete failed: Missing tree ID", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "error",
      });
      return;
    }

    console.log(dataToDelete,'dataToDelete')

    Api.delete(
      `/api/v1/FTA/delete/${dataToDelete.tableParentId}/${dataToDelete.childId}`,
      {
        params: {
          tableParentId: dataToDelete.tableParentId,
        },
      },
    )
      .then((res) => {
        console.log("Delete response:", res);

        // DON'T set isDeleteSucess here - it causes infinite loop
        // Instead, trigger reload through a different mechanism

        toast.success(
          res?.data?.status === "Child Deleted"
            ? "Deleted Successfully"
            : "Parent Deleted Successfully",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          },
        );

        // Use triggerReload instead of isDeleteSucess
        // You need to add triggerReload to your context
        if (typeof window.triggerFTAUpdate === "function") {
          window.triggerFTAUpdate();
        }
      })
      .catch((error) => {
        console.error("Delete error:", error);
        console.error("Error response:", error.response?.data);
        toast.error(
          error.response?.data?.message ||
            "Failed to delete. Please try again.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          },
        );
      });
  };

  const saveFromFile = (values) => {
    setFTAdata(values);
  };

const handleDownloadFTA = () => {
  console.log("Exporting FTA data:", FTAdata);
  
  if (FTAdata && FTAdata.treeStructure) {
    try {
      // Extract all nodes from the tree structure
      const extractNodes = (node, nodesList = [], parentId = null) => {
        if (node) {
          nodesList.push({
            'Gate ID': node.gateId || '',
            'Name': node.name || '',
            'Description': node.description || '',
            'Type': node.isEvent ? 'Event' : (node.gateType ? 'Gate' : 'Unknown'),
            'Gate Type': node.gateType || 'N/A',
            'Calculation Type': node.calcTypes || 'N/A',
            'Failure Rate (λ)': node.fr || node.failureRate || 'N/A',
            'Probability (q)': node.isP || 'N/A',
            'MTTR': node.mttr || 'N/A',
            'Test Interval (Ti)': node.isT || 'N/A',
            'Time to First Test (Tf)': node.timeToFirstTest || '0',
            'Mission Time (tm)': node.eventMissionTime || 'N/A',
            'Parent ID': parentId || 'N/A',
            'Index Count': node.indexCount || 'N/A',
            'Product': node.isProducts || 'N/A',
            'Failure Mode': node.isFailureMode || 'N/A'
          });
          
          if (node.children && node.children.length > 0) {
            node.children.forEach(child => extractNodes(child, nodesList, node.gateId));
          }
        }
        return nodesList;
      };
      
      const nodesList = extractNodes(FTAdata.treeStructure);
      console.log("Extracted nodes for export:", nodesList);
      
      if (nodesList.length === 0) {
        toast.error("No data to export!", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(nodesList);
      
      // Auto-size columns
      const colWidths = [];
      const maxCols = Object.keys(nodesList[0] || {}).length;
      for (let i = 0; i < maxCols; i++) {
        colWidths.push({ wch: 15 });
      }
      ws['!cols'] = colWidths;
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fault Tree Analysis');
      
      // Generate filename
      const fileName = `FTA_${FTAdata.treeStructure?.name || FTAdata.treeStructure?.gateId || 'export'}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast.success(`Exported ${nodesList.length} nodes to Excel successfully!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export file: " + err.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  } else {
    console.error("No FTAdata available:", FTAdata);
    toast.error("No data to export! Please open a fault tree first.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }
};
  const triggerReload = () => {
    setReloadData(true);
  };
  const stopTriggerReload = () => {
    setReloadData(false);
  };

  return (
    <ModalContext.Provider
      value={{
        isFTAModalOpen,
        openFTAModal,
        closeFTAModal,
        openPropertiesModal,
        closePropertiesModal,
        isPropertiesModal,
        openEditGateModal,
        closeEditGateModal,
        isOpenChildModal,
        openChildCreateModal,
        closeChildCreateModal,
        isChildCreate,
        openChildEvent,
        closeChildEvent,
        isEventModalOpen,
        openDeleteNode,
        closeDeleteNode,
        isDeleteNode,
        isDeleteSucess,
        saveFromFile,
        handleDownloadFTA,
        reloadData,
        triggerReload,
        stopTriggerReload,
        openProbabilityCalculations,
        closeProbabilityCalculations,
        isProbOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  return useContext(ModalContext);
};
