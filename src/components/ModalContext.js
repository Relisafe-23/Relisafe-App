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

  // FTA Create New Parent Modal
  const openFTAModal = () => {
    setIsFTAModalOpen(true);
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
  const openDeleteNode = () => {
    setIsDeleteNode(true);
    if (data && data.nodeActive) {
      Modal.confirm({
        title:
          data.indexCount === 1 ? (
            <span>
              Are you sure you want to <span style={{ color: "red" }}>Delete Parent</span>?
            </span>
          ) : (
            "Are you sure you want to Delete"
          ),
        icon: <ExclamationCircleOutlined />,
        okText: "Ok",
        cancelText: "Cancel",
        onOk: () => {
          confirmDelete();
        },
      });
    }
  };

  const closeDeleteNode = (e) => {
    setData(e);
    setIsDeleteNode(false);
  };

  const confirmDelete = () => {
    Api.delete(`/api/v1/FTA/delete/${data.projId}/${data.childId}`, {
      params: {
        tableParentId: data.tableParentId,
      },
    }).then((res) => {
      setIsdeleteSucess(true);
      toast(res?.data?.status === "Child Deleted" ? "Deleted Successfully" : "Parent Deleted Successfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "warning",
      });
      setIsdeleteSucess(false);
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
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  return useContext(ModalContext);
};
