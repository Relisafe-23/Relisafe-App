// ModalContext.js
import React, { createContext, useContext, useState } from "react";
import Api from "../Api";
import { toast } from "react-toastify";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";

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

    Api.delete(
      `/api/v1/FTA/delete/${dataToDelete.projId}/${dataToDelete.childId}`,
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
    if (FTAdata) {
      try {
        const blob = new Blob([JSON.stringify(FTAdata, null, 2)], {
          type: "application/json",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "FTA.json"; // Set the filename for the downloaded file
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast("File downloaded successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          type: "success",
        });
      } catch (err) {
        toast("File not downloaded!", {
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
      }
    } else {
      toast("File not downloaded!", {
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
