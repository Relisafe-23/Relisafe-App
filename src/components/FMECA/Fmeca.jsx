import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Select from "react-select";
import { Modal, Button, Row, Col } from "react-bootstrap";
import "../../css/FMECA.scss";
import Api from "../../Api";
import { tableIcons } from "../core/TableIcons";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import { toast } from "react-toastify";
import { useConnection } from '../../hooks/useConnection'; // ✅ FIXED: Correct import path
import {
  faFileDownload,
  faTrash,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";
import CreatableSelect from "react-select/creatable";
import * as XLSX from "xlsx";
import {
  faCircleCheck,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaExclamationCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import Dropdown from "../Company/Dropdown";
import Tooltip from '@mui/material/Tooltip';
import { customStyles } from "../core/select";
import { createTheme, ThemeProvider } from "@mui/material";
import MaterialTable from "material-table";

// hooks/useTableValidation.js
const useTableValidation = () => {
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const fieldConfig = {
    operatingPhase: { label: 'Operating Phase', required: true },
    function: { label: 'Function', required: true },
    failureMode: { label: 'Failure Mode', required: true },
    failureModeRatioAlpha: { label: 'Failure Mode Ratio (α)', required: true },
    subSystemEffect: { label: 'Sub System Effect', required: true },
    systemEffect: { label: 'System Effect', required: true },
    endEffect: { label: 'End Effect', required: true },
    endEffectRatioBeta: { label: 'End Effect Ratio (β)', required: true },
    safetyImpact: { label: 'Safety Impact', required: true },
    realibilityImpact: { label: 'Reliability Impact', required: true }
  };

  const validateAllRequiredFields = (tableData) => {
    const errors = [];
    tableData.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const rowErrors = [];

      Object.entries(fieldConfig).forEach(([fieldKey, config]) => {
        if (config.required && (!row[fieldKey] || row[fieldKey].toString().trim() === '')) {
          rowErrors.push(config.label);
        }
      });

      if (rowErrors.length > 0) {
        if (rowErrors.length === 1) {
          errors.push(`Row ${rowNumber}: ${rowErrors[0]} is required`);
        } else {
          errors.push(`Row ${rowNumber}: ${rowErrors.join(', ')} are required`);
        }
      }
    });

    setValidationErrors(errors);
    setShowValidationModal(errors.length > 0);
    return errors.length === 0;
  };

  const validateSingleRow = (rowData, rowIndex) => {
    const errors = [];
    const rowNumber = rowIndex + 1;

    Object.entries(fieldConfig).forEach(([fieldKey, config]) => {
      if (config.required && (!rowData[fieldKey] || rowData[fieldKey].toString().trim() === '')) {
        errors.push(`Row ${rowNumber}: ${config.label} is required`);
      }
    });

    return errors;
  };

  const closeValidationModal = () => {
    setShowValidationModal(false);
    setValidationErrors([]);
  };

  return {
    validationErrors,
    showValidationModal,
    validateAllRequiredFields,
    validateSingleRow,
    closeValidationModal
  };
};

function Index(props) {
  const {
    validationErrors,
    showValidationModal,
    validateAllRequiredFields,
    closeValidationModal
  } = useTableValidation();

  // Define projectId FIRST
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;

  // Initialize connection hook
  const connection = useConnection();

  // Load connections
  useEffect(() => {
    if (projectId && connection?.loadConnections) {
      connection.loadConnections(projectId);
    }
  }, [projectId, connection]);

  const [initialProductID, setInitialProductID] = useState();
  const [initialTreeStructure, setInitialTreeStructure] = useState();
  const [exceldata, setExcelData] = useState(null);

  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : initialProductID;
      
  const treeStructure = props?.location?.props?.mainData?.id
    ? props?.location?.props?.mainData?.id
    : initialTreeStructure;

  const [show, setShow] = useState(false);
  const [treeTableData, setTreeTabledata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const handleClose = () => setProductModal(false);
  const handleHide = () => setFailureModeRatioError(false);
  const [writePermission, setWritePermission] = useState(true);
  const history = useHistory();

  const userId = localStorage.getItem("userId");
  const [existingFailureAlpha, setExistingFailureAlpha] = useState(1);
  const [existingEndBeta, setExistingEndBeta] = useState(1);
  const [readPermission, setReadPermission] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [operationPhase, setOperationPhase] = useState();
  const [colDefs, setColDefs] = useState();
  const [failureModeRatioError, setFailureModeRatioError] = useState(false);
  const [companyId, setCompanyId] = useState();
  const [selectedProductName, setSelectedProductName] = useState("");
  const [allSepareteData, setAllSepareteData] = useState([]);
  const [allConnectedData, setAllConnectedData] = useState([]);
  const [perviousColumnValues, setPerviousColumnValues] = useState([]);

  // New state for tracking connections
  const [selectedSourceValues, setSelectedSourceValues] = useState({});
  const [rowConnections, setRowConnections] = useState({});
  const [selectedSourceField, setSelectedSourceField] = useState(null);

  const [data, setData] = useState({
    operatingPhase: "",
    function: "",
    failureMode: "",
    failureModeRatioAlpha: "",
    cause: "",
    subSystemEffect: "",
    systemEffect: "",
    endEffect: "",
    endEffectRatioBeta: "",
    safetyImpact: "",
    referenceHazardId: "",
    realibilityImpact: "",
    serviceDisruptionTime: "",
    frequency: "",
    severity: "",
    riskIndex: "",
    detectableMeansDuringOperation: "",
    detectableMeansToMaintainer: "",
    BuiltInTest: "",
    designControl: "",
    maintenanceControl: "",
    exportConstraints: "",
    immediteActionDuringOperationalPhase: "",
    immediteActionDuringNonOperationalPhase: "",
    userField1: "",
    userField2: "",
    userField3: "",
    userField4: "",
    userField5: "",
    userField6: "",
    userField7: "",
    userField8: "",
    userField9: "",
    userField10: "",
  });

  const handleInputChange = (selectedItems, name) => {
    setData((prevData) => ({
      ...prevData,
      [name]: selectedItems ? selectedItems.value : "",
    }));
  };
  
  const [mergedData, setMergedData] = useState([]);

  const getAllSeprateLibraryData = async () => {
    const companyId = localStorage.getItem("companyId");
    setCompanyId(companyId);
    Api.get("api/v1/library/get/all/separate/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      let filteredData = res?.data?.data.filter(
        (item) => item?.moduleName === "FMECA"
      );

      if (filteredData.length === 0) {
        filteredData = res?.data?.data.filter(
          (item) => item?.moduleName === "SAFETY"
        );
      }

      setAllSepareteData(filteredData);
      if (tableData) {
        const merged = [...tableData, ...filteredData];
        setMergedData(merged);
      }
    });
  };

  const getAllLibraryData = async () => {
    const companyId = localStorage.getItem("companyId");
    setCompanyId(companyId);
    Api.get("api/v1/library/get/all/data/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      let filteredData = res?.data?.data.filter(
        (item) => item?.moduleName === "FMECA"
      );

      if (filteredData.length === 0) {
        filteredData = res?.data?.data.filter(
          (item) => item?.moduleName === "SAFETY"
        );
      }

      setAllSepareteData(filteredData);
      if (tableData) {
        const merged = [...tableData, ...filteredData];
        setMergedData(merged);
      }
    });
  };

  const getAllConnectedLibrary = async (fieldValue, fieldName) => {
    Api.get("api/v1/library/get/all/source/value", {
      params: {
        projectId: projectId,
        moduleName: "FMECA",
        sourceName: fieldName,
        sourceValue: fieldValue.value,
      },
    }).then((res) => {
      const data = res?.data?.libraryData;
      setAllConnectedData(data ? data : perviousColumnValues);
      setPerviousColumnValues(data);
    });
  };

  const getAllConnectedLibraryAfterUpdate = async () => {
    Api.get("api/v1/library/get/all/source/value", {
      params: {
        projectId: projectId,
        moduleName: "FMECA",
      },
    }).then((res) => {
      const data = res?.data?.libraryData;
      setAllConnectedData(data ? data : perviousColumnValues);
      setPerviousColumnValues(data);
    });
  };

  useEffect(() => {
    getAllSeprateLibraryData();
    getAllLibraryData();
  }, []);

  const DownloadExcel = (values) => {
    const columnsToRemove = ["projectId", "companyId", "productId", "id"];
    const CompanyName = treeTableData[0]?.companyId?.companyName;
    const ProjectName = treeTableData[0]?.projectId?.projectName;
    const data = tableData[0];
    const productName = data?.productId?.productName;

    const modifiedTableData = tableData.map((row) => {
      const newRow = {
        ...row,
        CompanyName,
        ProjectName,
        productName
      };

      columnsToRemove.forEach((columnName) => {
        delete newRow[columnName];
      });
      return newRow;
    });

    if (modifiedTableData.length > 0) {
      const workSheet = XLSX.utils.json_to_sheet(modifiedTableData, {
        skipHeader: false,
      });
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "FMECA Data");

      const buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FMECA_Data.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } else {
      toast("Export Failed !! No Data Found", {
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

  const createFMECADataFromExcel = (values) => {
    const companyId = localStorage.getItem("companyId");
    setIsLoading(true);
    Api.post("api/v1/FMECA/bulk/create", {
      postData: values,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      userId: userId,
    }).then((response) => {
      setIsLoading(false);
      getProductData();
    }).catch((error) => {
      setIsLoading(false);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong";
      toast.error(errorMessage);
      console.error("Error creating FMECA data:", errorMessage);
    });
  };

  const importExcel = (e) => {
    const file = e.target.files[0];
    const fileName = file.name;
    const validExtensions = ["xlsx", "xls"];
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast.error("Please upload a valid Excel file (either .xlsx or .xls)!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, { type: "binary" });
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      const headers = fileData[0];

      const hasFailureModeRatioAlpha = headers.includes("failureModeRatioAlpha");
      const hasEndEffectRatioBeta = headers.includes("endEffectRatioBeta");

      if (!hasFailureModeRatioAlpha || !hasEndEffectRatioBeta) {
        toast.error("Excel file must contain 'failureModeRatioAlpha' and 'endEffectRatioBeta' columns!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }

      const heads = headers.map((head) => ({ title: head, field: head }));
      setColDefs(heads);
      fileData.splice(0, 1);

      const validationResult = convertToJson(headers, fileData);

      if (validationResult.isValid) {
        setData(validationResult.rows);
      } else {
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const convertToJson = (headers, data) => {
    const rows = [];
    let alphaTotal = 0;
    let betaTotal = 0;
    const validationErrors = [];

    const isBulkUpload = data.length > 1;

    if (data.length === 0 || data[0].length === 0) {
      toast("No Data Found In Excel Sheet", {
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
      return { isValid: false, rows: [] };
    }

    data.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 2;
      let rowData = {};

      row.forEach((element, index) => {
        rowData[headers[index]] = element;
      });

      const alphaValue = parseFloat(rowData.failureModeRatioAlpha);
      const betaValue = parseFloat(rowData.endEffectRatioBeta);

      if (isNaN(alphaValue)) {
        validationErrors.push(`Row ${rowNumber}: failureModeRatioAlpha "${rowData.failureModeRatioAlpha}" is not a valid number`);
      } else if (alphaValue > 1) {
        validationErrors.push(`Row ${rowNumber}: failureModeRatioAlpha = ${alphaValue.toFixed(4)} (exceeds 1)`);
      } else if (alphaValue < 0) {
        validationErrors.push(`Row ${rowNumber}: failureModeRatioAlpha = ${alphaValue.toFixed(4)} (cannot be negative)`);
      }

      if (isNaN(betaValue)) {
        validationErrors.push(`Row ${rowNumber}: endEffectRatioBeta "${rowData.endEffectRatioBeta}" is not a valid number`);
      } else if (betaValue > 1) {
        validationErrors.push(`Row ${rowNumber}: endEffectRatioBeta = ${betaValue.toFixed(4)} (exceeds 1)`);
      } else if (betaValue < 0) {
        validationErrors.push(`Row ${rowNumber}: endEffectRatioBeta = ${betaValue.toFixed(4)} (cannot be negative)`);
      }

      if (!isNaN(alphaValue) && !isNaN(betaValue)) {
        alphaTotal += alphaValue;
        betaTotal += betaValue;
        rows.push(rowData);
      }
    });

    if (isBulkUpload) {
      if (alphaTotal > 1) {
        validationErrors.push(`BULK UPLOAD FAILED: Total failureModeRatioAlpha = ${alphaTotal.toFixed(4)} (exceeds 1)`);
      }
      if (betaTotal > 1) {
        validationErrors.push(`BULK UPLOAD FAILED: Total endEffectRatioBeta = ${betaTotal.toFixed(4)} (exceeds 1)`);
      }

      const alphaOnes = rows.filter(row =>
        parseFloat(row.failureModeRatioAlpha) === 1
      ).length;

      const betaOnes = rows.filter(row =>
        parseFloat(row.endEffectRatioBeta) === 1
      ).length;

      if (alphaOnes > 1) {
        validationErrors.push(
          `BULK DATA ISSUE: ${alphaOnes} rows have failureModeRatioAlpha = 1 (only one row can have value 1)`
        );
      }

      if (betaOnes > 1) {
        validationErrors.push(
          `BULK DATA ISSUE: ${betaOnes} rows have endEffectRatioBeta = 1 (only one row can have value 1)`
        );
      }
    }

    if (validationErrors.length > 0) {
      let errorMessage = validationErrors.length === 1
        ? `❌ Validation Error:\n\n${validationErrors[0]}`
        : `❌ Validation Errors:\n\n• ${validationErrors.join("\n• ")}`;

      toast.error(errorMessage, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: true,
        style: {
          whiteSpace: 'pre-line',
          maxWidth: '500px',
          textAlign: 'left'
        }
      });

      return { isValid: false, rows: [] };
    }
    
    const successMessage =
      `📊 Import Summary:\n` +
      `• Total rows: ${rows.length}\n` +
      `• failureModeRatioAlpha total: ${alphaTotal.toFixed(4)}\n` +
      `• endEffectRatioBeta total: ${betaTotal.toFixed(4)}`;

    toast.success(successMessage, {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000,
      style: {
        whiteSpace: 'pre-line',
        maxWidth: '500px',
        textAlign: 'left'
      }
    });

    createFMECADataFromExcel(rows);
    return { isValid: true, rows: rows };
  };

  useEffect(() => {
    getTreeData();
    getProductData();
  }, [productId]);

  const logout = () => {
    localStorage.clear();
    history.push("/login");
    window.location.reload();
  };

  const projectSidebar = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: {
        userId: userId,
      },
    }).then((res) => {
      setIsOwner(res.data.data.isOwner);
      setCreatedBy(res.data.data.createdBy);
    });
  };

  const getProductData = () => {
    Api.get("/api/v1/fmeca/product/list", {
      params: {
        projectId: projectId,
        productId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        // console.log("FMECA Product Data:", res.data);
        setTableData(res?.data?.data);
        getProjectDetails();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const getTreeData = () => {
    Api.get(`/api/v1/productTreeStructure/list`, {
      params: {
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const initialProductID = res?.data?.data[0]?.treeStructure?.id;
        const treeData = res?.data?.data;
        setTreeTabledata(treeData);
        setIsLoading(false);
        setInitialProductID(initialProductID);
        setInitialTreeStructure(res?.data?.data[0]?.id);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const getProjectPermission = () => {
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        authorizedPersonnel: userId,
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setWritePermission(data?.modules[4].write);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
    getProjectDetails();
  }, [projectId]);

  const tableTheme = createTheme({
    components: {
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              cursor: "pointer",
              backgroundColor: "rgba(224, 224, 224, 1) !important",
            },
          },
        },
      },
    },
  });

  const getProjectDetails = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: { userId: userId },
    })
      .then((response) => {
        setOperationPhase(response.data?.data?.operationalPhase);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [flattenedConnect, setFlattenedConnect] = useState([]);
  const [modalInfo, setModalInfo] = useState({ title: "", message: "" });
  const [connectData, setConnectData] = useState([]);

  const handleDropdownChange = (selectedValue) => {
    const selectedItem = treeTableData.find(
      (item) => item.productId === selectedValue
    );
    setSelectedProductName(selectedItem?.treeStructure?.productName || "");
  };

  const getConnectedValuesForField = (fieldName, rowData) => {
    let connectedValues = [];

    Object.keys(rowData || {}).forEach(sourceField => {
      const sourceValue = rowData[sourceField];
      if (!sourceValue) return;

      const connections =
        flattenedConnect?.filter(
          item =>
            item.fieldName === sourceField &&
            String(item.fieldValue) === String(sourceValue) &&
            item.destName === fieldName
        ) || [];

      connectedValues.push(...connections);
      console.log("123456")
    });
  console.log("Connected values for", fieldName, "in row", rowData, ":", connectedValues, connections);
    return connectedValues;
  };

  const handleSourceSelection = (fieldName, value, rowData) => {
    const rowId = rowData.fmecaId;
    if (!rowId) return;

    const normalizedValue = String(value);

    setSelectedSourceValues(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [fieldName]: normalizedValue
      }
    }));
  };

  const getAllConnect = () => {
    Api.get("api/v1/library/get/all/connect/value", {
      params: { projectId },
    }).then((res) => {
      setIsLoading(false);

      const filteredData = res.data.getData.filter(
        (entry) =>
          entry?.libraryId?.moduleName === "FMECA" ||
          entry?.destinationModuleName === "FMECA"
      );

      const flattened = filteredData.flatMap((item) =>
        (item.destinationData || [])
          .filter(
            (d) =>
              d.destinationModuleName === "FMECA" &&
              d.destinationModuleName === item.libraryId.moduleName
          )
          .map((d) => ({
            fieldName: item.sourceName,
            fieldValue: item.sourceValue,
            destName: d.destinationName,
            destValue: d.destinationValue,
            destModule: d.destinationModuleName,
          }))
      );

      setFlattenedConnect(flattened);
      setConnectData(filteredData);
    });
  };

  useEffect(() => {
    getAllConnect();
  }, []);

  const handleCustomDelete = (rowData) => {
    setRowToDelete(rowData);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!rowToDelete) return;

    setIsLoading(true);
    const rowId = rowToDelete?.id;
    
    if (connection && rowId) {
      connection.clearRow('FMECA', rowId);
    }
    
    Api.delete(`api/v1/FMECA/${rowId}`, { headers: { userId: userId } })
      .then((response) => {
        console.log("Delete successful");
        getProductData();
        Modalopen();
        setIsLoading(false);
        setDeleteModalOpen(false);
        setRowToDelete(null);
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        if (error?.response?.status === 204) {
          getProductData();
          Modalopen();
        }
        setIsLoading(false);
        setDeleteModalOpen(false);
        setRowToDelete(null);
      });
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setRowToDelete(null);
  };

  const validateField = (fieldName, value, isRequired) => {
    if (isRequired && (!value || value?.toString()?.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  };

  const ValidationModal = ({ isOpen, errors, onClose }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '400px',
          maxWidth: '500px'
        }}>
          <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>Validation Errors</h3>
          <ul style={{ marginBottom: '20px' }}>
            {errors.map((error, index) => (
              <li key={index} style={{ color: '#d32f2f', marginBottom: '5px' }}>
                {error}
              </li>
            ))}
          </ul>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  const createEditComponent = (fieldName, title, isRequired = false) => {
    return {
      title: isRequired ? `${title} *` : title,
      field: fieldName,
      validate: (rowData) => {
        const error = validateField(title, rowData[fieldName], isRequired);
        return error ? { isValid: false, helperText: error } : true;
      },
      editComponent: ({ value, onChange, rowData }) => {
        const handleChange = (newValue) => {
          onChange(newValue);
        };

        return (
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                if (
                  (fieldName === 'failureModeRatioAlpha' || fieldName === 'endEffectRatioBeta') &&
                  newValue !== '' &&
                  parseFloat(newValue) > 1
                ) {
                  return;
                }
                handleChange(newValue);
              }}
              placeholder={isRequired ? `${title} *` : title}
              style={{
                height: "40px",
                borderRadius: "4px",
                width: "100%",
                borderColor:
                  isRequired && (!value || value?.toString().trim() === '')
                    ? '#d32f2f'
                    : '#ccc',
              }}
              title={title}
            />
            {isRequired && (!value || value?.toString()?.trim() === '') && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  color: '#d32f2f',
                  fontSize: '12px',
                  marginTop: '2px',
                }}
              >
                {title} is required!
              </div>
            )}
          </div>
        );
      }
    };
  };

  const isSourceField = (fieldName) => {
    return flattenedConnect.some(item => item.sourceName === fieldName);
  };

  const isDestinationField = (fieldName) => {
    return flattenedConnect.some(item => item.destinationName === fieldName);
  };

  const getDestinationFieldsForSource = (sourceField, sourceValue) => {
    return flattenedConnect
      ?.filter(item => item.fieldName === sourceField && item.fieldValue === sourceValue)
      .map(item => ({
        field: item.destName,
        value: item.destValue
      })) || [];
  };

const createSmartSelectField = (fieldName, label, required = false, isSourceFieldCheck = false) => ({
  ...createEditComponent(fieldName, label, required),
  editComponent: React.useMemo(() => {
    return ({ value, onChange, rowData }) => {
      const rowId = rowData?.id || rowData?.fmecaId || rowData?.tableData?.id;
      
      // Get destinations from ALL modules (FMECA, MTTR, etc.)
      const destinations = connection?.getDestinationsForRow?.('FMECA', rowId) || [];
      const fieldDestinations = destinations.filter(d => d.destField === fieldName);
      const hasConnectedValues = fieldDestinations.length > 0;
      
      // Build options
      let options = [];
      
      // Add connected values from ALL source modules (including MTTR)
      if (hasConnectedValues) {
        fieldDestinations.forEach(d => {
          options.push({
            value: d.destValue,
            label: `${d.destValue} (from ${d.sourceModule} - ${d.sourceField})`,
            isConnected: true,
            sourceModule: d.sourceModule
          });
        });
      }
      
      // Add separate library values
      const separateFilteredData = allSepareteData?.filter(item => item?.sourceName === fieldName) || [];
      separateFilteredData.forEach(item => {
        if (!options.some(opt => opt.value === item.sourceValue)) {
          options.push({
            value: item.sourceValue,
            label: item.sourceValue,
            isConnected: false
          });
        }
      });
      
      // Add current value if not present
      if (value && !options.some(opt => opt.value === String(value))) {
        options.push({
          value: String(value),
          label: String(value),
          isConnected: false
        });
      }
      
      const selectedOption = options.find(opt => opt.value === String(value)) || 
                            (value ? { label: String(value), value: String(value) } : null);
      
      const hasError = required && (!value || String(value)?.trim() === "");
      
      return (
        <div 
          style={{ 
            position: "relative", 
            width: "100%",
            minWidth: "200px",
          }}
        >
          <CreatableSelect
            name={fieldName}
            value={selectedOption}
            options={options}
            onChange={(option) => {
              const newValue = option?.value != null ? String(option.value) : "";
              onChange(newValue);
              
              // Save source value when selected
              if (isSourceFieldCheck && newValue && rowId && connection) {
                setTimeout(() => {
                  connection.saveSource('FMECA', rowId, fieldName, newValue);
                }, 0);
              }
            }}
            isClearable
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ 
                ...base, 
                zIndex: 9999,
                position: 'fixed',
              }),
              menu: (base) => ({ 
                ...base, 
                zIndex: 9999,
                backgroundColor: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginTop: '4px',
                pointerEvents: 'auto',
              }),
              control: (base, state) => ({
                ...base,
                borderColor: hasError ? "#d32f2f" : '#ccc',
                borderLeft: hasConnectedValues ? '4px solid #1976d2' : base.borderLeft,
                backgroundColor: 'white',
                minHeight: '38px',
                '&:hover': {
                  borderColor: hasError ? "#d32f2f" : '#1976d2',
                },
                ...(state.isFocused ? {
                  boxShadow: `0 0 0 1px ${hasError ? '#d32f2f' : '#1976d2'}`,
                  borderColor: hasError ? '#d32f2f' : '#1976d2',
                } : {}),
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected 
                  ? '#1976d2' 
                  : state.data?.isConnected 
                    ? state.data?.sourceModule === 'MTTR' 
                      ? '#e8f4fd'  // Light blue for MTTR
                      : '#e8f4fd'  // Same color for other modules
                    : state.isFocused 
                      ? '#f5f5f5' 
                      : 'white',
                fontWeight: state.data?.isConnected ? 'bold' : 'normal',
                color: state.isSelected ? 'white' : 'inherit',
                cursor: 'pointer',
                '&:active': {
                  backgroundColor: state.isSelected ? '#1976d2' : '#e0e0e0',
                },
              }),
              singleValue: (base) => ({
                ...base,
                color: 'inherit',
              }),
              indicatorSeparator: (base) => ({
                ...base,
                display: 'none',
              }),
              dropdownIndicator: (base) => ({
                ...base,
                color: '#666',
                '&:hover': {
                  color: '#1976d2',
                },
              }),
            }}
          />
          
          {hasConnectedValues && (
            <div
              style={{
                position: "absolute",
                top: "-18px",
                right: "5px",
                fontSize: "10px",
                color: "#1976d2",
                background: "#e3f2fd",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: "bold",
                border: '1px solid #1976d2',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              ✓ From saved source
            </div>
          )}
          
          {hasError && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                color: "#d32f2f",
                fontSize: "11px",
                marginTop: "2px",
              }}
            >
              {label} is required
            </div>
          )}
        </div>
      );
    };
  }, [fieldName, label, required, isSourceFieldCheck, allSepareteData, connection]),
});
console.log("Connection", connection)
  // Special case for FMECA IDF
  const fmecaIdColumn = {
    render: (rowData) => `${rowData?.tableData?.id + 1}`,
    title: "FMECA ID",
  };

  // Define which fields are source fields
  const sourceFields = ['function', 'operatingPhase', 'failureMode'];

  const columns = [
    fmecaIdColumn,
    createSmartSelectField("operatingPhase", "Operating Phases", true, sourceFields.includes('operatingPhase')),
    createSmartSelectField("function", "Function", true, sourceFields.includes('function')),
    createSmartSelectField("failureMode", "Failure Mode", true, sourceFields.includes('failureMode')),
    createSmartSelectField("failureModeRatioAlpha", "Failure Mode Ratio Alpha (must be equal to 1)", true),
    createSmartSelectField("cause", "Cause"),
    createSmartSelectField("subSystemEffect", "Sub System effect", true),
    createSmartSelectField("systemEffect", "System Effect", true),
    createSmartSelectField("endEffect", "End Effect", true),
    createSmartSelectField("endEffectRatioBeta", "End Effect ratio Beta (must be equal to 1)", true),
    createSmartSelectField("safetyImpact", "Safety Impact", true),
    createSmartSelectField("referenceHazardId", "Reference Hazard ID"),
    createSmartSelectField("realibilityImpact", "Reliability Impact", true),
    createSmartSelectField("serviceDisruptionTime", "Service Disruption Time (minutes)"),
    createSmartSelectField("frequency", "Frequency"),
    createSmartSelectField("severity", "Severity"),
    createSmartSelectField("riskIndex", "Risk Index"),
    createSmartSelectField("detectableMeansDuringOperation", "Detectable Means during operation"),
    createSmartSelectField("detectableMeansToMaintainer", "Detectable Means to Maintainer"),
    createSmartSelectField("BuiltInTest", "Built-in Test"),
    createSmartSelectField("designControl", "Design Control"),
    createSmartSelectField("maintenanceControl", "Maintenance Control"),
    createSmartSelectField("exportConstraints", "Export constraints"),
    createSmartSelectField("immediteActionDuringOperationalPhase", "Immediate Action during operational Phases"),
    createSmartSelectField("immediteActionDuringNonOperationalPhase", "Immediate Action during Non-operational Phases"),
    createSmartSelectField("userField1", "User field 1"),
    createSmartSelectField("userField2", "User field 2"),
    createSmartSelectField("userField3", "User field 3"),
    createSmartSelectField("userField4", "User field 4"),
    createSmartSelectField("userField5", "User field 5"),
    createSmartSelectField("userField6", "User field 6"),
    createSmartSelectField("userField7", "User field 7"),
    createSmartSelectField("userField8", "User field 8"),
    createSmartSelectField("userField9", "User field 9"),
    createSmartSelectField("userField10", "User field 10"),
  ];

  const createFmeca = (values) => {
    const mandatoryFields = [
      'operatingPhase',
      'function',
      'failureMode',
      'failureModeRatioAlpha',
      'subSystemEffect',
      'systemEffect',
      'endEffect',
      'endEffectRatioBeta',
      'safetyImpact',
      'realibilityImpact'
    ];

    const missingFields = mandatoryFields.filter(field => {
      const value = values[field];
      return !value || value?.toString()?.trim() === '';
    });

    if (missingFields.length > 0) {
      const fieldLabels = {
        operatingPhase: "Operating Phase",
        function: "Function",
        failureMode: "Failure Mode",
        failureModeRatioAlpha: "Failure Mode Ratio Alpha",
        subSystemEffect: "Sub System Effect",
        systemEffect: "System Effect",
        endEffect: "End Effect",
        endEffectRatioBeta: "End Effect Ratio Beta",
        safetyImpact: "Safety Impact",
        realibilityImpact: "Reliability Impact"
      };

      const missingFieldNames = missingFields.map(field => fieldLabels[field]);

      let errorMessage;
      if (missingFields.length === 1) {
        errorMessage = `${fieldLabels[missingFields[0]]} is required!`;
      } else {
        errorMessage = `The following fields are required:\n• ${missingFieldNames.join("\n• ")}`;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        style: {
          whiteSpace: 'pre-line',
          maxWidth: '500px',
          textAlign: 'left'
        }
      });
      return Promise.reject(new Error("Validation failed"));
    }

    const alphaValue = parseFloat(values.failureModeRatioAlpha);
    const betaValue = parseFloat(values.endEffectRatioBeta);

    if (isNaN(alphaValue)) {
      toast.error("Failure Mode Ratio Alpha must be a valid number", {
        position: "top-right",
        autoClose: 5000,
      });
      return Promise.reject(new Error("Validation failed"));
    }

    if (alphaValue > 1) {
      toast.error("Failure Mode Ratio Alpha cannot exceed 1", {
        position: "top-right",
        autoClose: 5000,
      });
      return Promise.reject(new Error("Validation failed"));
    }

    if (alphaValue < 0) {
      toast.error("Failure Mode Ratio Alpha cannot be negative", {
        position: "top-right",
        autoClose: 5000,
      });
      return Promise.reject(new Error("Validation failed"));
    }

    if (isNaN(betaValue)) {
      toast.error("End Effect Ratio Beta must be a valid number", {
        position: "top-right",
        autoClose: 5000,
      });
      return Promise.reject(new Error("Validation failed"));
    }

    if (betaValue > 1) {
      toast.error("End Effect Ratio Beta cannot exceed 1", {
        position: "top-right",
        autoClose: 5000,
      });
      return Promise.reject(new Error("Validation failed"));
    }

    if (betaValue < 0) {
      toast.error("End Effect Ratio Beta cannot be negative", {
        position: "top-right",
        autoClose: 5000,
      });
      return Promise.reject(new Error("Validation failed"));
    }

    if (productId) {
      const companyId = localStorage.getItem("companyId");
      setIsLoading(true);
      Api.post("api/v1/FMECA/", {
        operatingPhase: values.operatingPhase || data.operatingPhase,
        function: values.function || data.function,
        failureMode: values.failureMode || data.failureMode,
        cause: values.cause || data.cause,
        failureModeRatioAlpha: values?.failureModeRatioAlpha || 1,
        detectableMeansDuringOperation: values.detectableMeansDuringOperation || data.detectableMeansDuringOperation,
        detectableMeansToMaintainer: values.detectableMeansToMaintainer || data.detectableMeansToMaintainer,
        BuiltInTest: values.BuiltInTest || data.BuiltInTest,
        subSystemEffect: values.subSystemEffect || data.subSystemEffect,
        systemEffect: values.systemEffect || data.systemEffect,
        endEffect: values.endEffect || data.endEffect,
        endEffectRatioBeta: values.endEffectRatioBeta || 1,
        safetyImpact: values.safetyImpact || data.safetyImpact,
        referenceHazardId: values.referenceHazardId || data.referenceHazardId,
        realibilityImpact: values.realibilityImpact || data.realibilityImpact,
        serviceDisruptionTime: values.serviceDisruptionTime || data.serviceDisruptionTime,
        frequency: values.frequency || data.frequency,
        severity: values.severity || data.severity,
        riskIndex: values.riskIndex || data.riskIndex,
        designControl: values.designControl || data.designControl,
        maintenanceControl: values.maintenanceControl || data.maintenanceControl,
        exportConstraints: values.exportConstraints || data.exportConstraints,
        immediteActionDuringOperationalPhase: values.immediteActionDuringOperationalPhase || data.immediteActionDuringOperationalPhase,
        immediteActionDuringNonOperationalPhase: values.immediteActionDuringNonOperationalPhase || data.immediteActionDuringNonOperationalPhase,
        userField1: values.userField1 || data.userField1,
        userField2: values.userField2 || data.userField2,
        userField3: values.userField3 || data.userField3,
        userField4: values.userField4 || data.userField4,
        userField5: values.userField5 || data.userField5,
        userField6: values.userField6 || data.userField6,
        userField7: values.userField7 || data.userField7,
        userField8: values.userField8 || data.userField8,
        userField9: values.userField9 || data.userField9,
        userField10: values.userField10 || data.userField10,
        projectId: projectId,
        companyId: companyId,
        productId: productId,
        userId: userId,
        Alldata: tableData,
      })
      .then((response) => {
        toast.success("FMECA created successfully!");
        getProductData();
        setIsLoading(false);
        
        const sourceFields = ['operatingPhase', 'function', 'failureMode'];
        const newRowId = response?.data?.data?.id;
        
        if (newRowId && connection) {
          sourceFields.forEach(field => {
            if (values[field]) {
              connection.saveSource('FMECA', newRowId, field, values[field]);
            }
          });
        }
        
        return response;
      }).catch((error) => {
        setIsLoading(false);
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Something went wrong";
        toast.error(errorMessage);
        console.error("Error creating FMECA data:", errorMessage);
      });
    } else {
      setProductModal(true);
      return Promise.reject(new Error("No product selected"));
    }
  };

  const updateFmeca = async (values) => {
    const mandatoryFields = [
      'operatingPhase',
      'function',
      'failureMode',
      'failureModeRatioAlpha',
      'subSystemEffect',
      'systemEffect',
      'endEffect',
      'endEffectRatioBeta',
      'safetyImpact',
      'realibilityImpact'
    ];

    const missingFields = mandatoryFields.filter(field => {
      const value = values[field];
      return !value || value?.toString()?.trim() === '';
    });

    if (missingFields.length > 0) {
      const fieldLabels = {
        operatingPhase: "Operating Phase",
        function: "Function",
        failureMode: "Failure Mode",
        failureModeRatioAlpha: "Failure Mode Ratio Alpha",
        subSystemEffect: "Sub System Effect",
        systemEffect: "System Effect",
        endEffect: "End Effect",
        endEffectRatioBeta: "End Effect Ratio Beta",
        safetyImpact: "Safety Impact",
        realibilityImpact: "Reliability Impact"
      };

      const missingFieldNames = missingFields.map(field => fieldLabels[field]);

      let errorMessage;
      if (missingFields.length === 1) {
        errorMessage = `${fieldLabels[missingFields[0]]} is required!`;
      } else {
        errorMessage = `The following fields are required:\n• ${missingFieldNames.join("\n• ")}`;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        style: {
          whiteSpace: 'pre-line',
          maxWidth: '500px',
          textAlign: 'left'
        }
      });
      throw new Error("Validation failed");
    }

    const companyId = localStorage.getItem("companyId");
    
    const payload = {
      operatingPhase: values.operatingPhase,
      function: values.function,
      failureMode: values.failureMode,
      failureModeRatioAlpha: values?.failureModeRatioAlpha || 0,
      cause: values.cause,
      detectableMeansDuringOperation: values.detectableMeansDuringOperation,
      detectableMeansToMaintainer: values.detectableMeansToMaintainer,
      BuiltInTest: values.BuiltInTest,
      subSystemEffect: values.subSystemEffect,
      systemEffect: values.systemEffect,
      endEffect: values.endEffect,
      endEffectRatioBeta: values?.endEffectRatioBeta || 0,
      safetyImpact: values.safetyImpact,
      referenceHazardId: values.referenceHazardId,
      realibilityImpact: values.realibilityImpact,
      serviceDisruptionTime: values.serviceDisruptionTime,
      frequency: values.frequency,
      severity: values.severity,
      riskIndex: values.riskIndex,
      designControl: values.designControl,
      maintenanceControl: values.maintenanceControl,
      exportConstraints: values.exportConstraints,
      immediteActionDuringOperationalPhase: values.immediteActionDuringOperationalPhase,
      immediteActionDuringNonOperationalPhase: values.immediteActionDuringNonOperationalPhase,
      userField1: values.userField1,
      userField2: values.userField2,
      userField3: values.userField3,
      userField4: values.userField4,
      userField5: values.userField5,
      userField6: values.userField6,
      userField7: values.userField7,
      userField8: values.userField8,
      userField9: values.userField9,
      userField10: values.userField10,
      treeStructureId: treeStructure,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      fmecaId: values.id,
      userId: userId,
      Alldata: tableData,
      isConnectedUpdate: true,
      updatedField: values.updatedField,
      oldValue: values.oldValue,
      newValue: values.newValue,
    };

    try {
      const response = await Api.patch("api/v1/FMECA/update", payload);
      if (response?.status === 200) {
        toast.success("FMECA updated successfully!");
        getProductData();
        
        const sourceFields = ['operatingPhase', 'function', 'failureMode'];
        if (connection) {
          sourceFields.forEach(field => {
            if (values[field]) {
              connection.saveSource('FMECA', values.id, field, values[field]);
            }
          });
        }
        
        getAllConnectedLibraryAfterUpdate();
      } else if (response?.status === 204) {
        toast.error("Failure Mode Radio Alpha Must be Equal to One !");
      } else {
        toast.warning("Update request completed, but status not ideal.");
        getProductData();
        getAllConnectedLibraryAfterUpdate();
      }
    } catch (error) {
      const errorStatus = error?.response?.status;
      if (errorStatus === 401) {
        logout();
      } else {
        toast.error(errorStatus === 422 ? "Failed to update FMECA. Please try again." : "Failure Mode Ratio Alpha must sum to exactly 1");
        console.error("Update Error:", errorStatus === 422);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFmecaData = (value) => {
    setIsLoading(true);
    const rowId = value?.id;

    Api.delete(`api/v1/FMECA/${rowId}`, { headers: { userId: userId } })
      .then((res) => {
        getProductData();
        setIsLoading(false);
        Modalopen();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const Modalopen = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  const role = localStorage.getItem("role");

  const handleDelete = (index) => {
    const row = tableData[index];
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
    deleteFmecaData(row);
  };

  return (
    <div className="mx-4 mt-5">
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ width: "30%" }}>
              <Projectname projectId={projectId} />
            </div>

            <div style={{ width: "100%", marginRight: "20px", position: "relative", zIndex: 999 }}>
              <Dropdown
                value={projectId}
                productId={productId}
                data={treeTableData}
                onChange={handleDropdownChange}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: "8px",
                height: "40px",
              }}
            >
              <Tooltip placement="right" title="Import">
                <div style={{ marginRight: "8px" }}>
                  {(writePermission === true ||
                    writePermission === "undefined" ||
                    role === "admin" ||
                    (isOwner === true && createdBy === userId)) ? (
                    <>
                      <label
                        htmlFor="file-input"
                        className="import-export-btn"
                        style={{ cursor: "pointer" }}
                      >
                        <FontAwesomeIcon
                          icon={faFileDownload}
                          style={{ width: "15px" }}
                        />
                      </label>
                      <input
                        type="file"
                        className="input-fields"
                        id="file-input"
                        onChange={importExcel}
                        style={{ display: "none" }}
                      />
                    </>
                  ) : (
                    <div
                      className="import-export-btn"
                      style={{ cursor: "not-allowed", opacity: 0.5 }}
                    >
                      <FontAwesomeIcon
                        icon={faFileDownload}
                        style={{ width: "15px" }}
                      />
                    </div>
                  )}
                </div>
              </Tooltip>

              <Tooltip placement="left" title="Export">
                <button
                  className="import-export-btn"
                  style={{
                    marginTop: '-2px',
                    cursor: (writePermission === true ||
                      writePermission === "undefined" ||
                      role === "admin" ||
                      (isOwner === true && createdBy === userId)) ? "pointer" : "not-allowed",
                    opacity: (writePermission === true ||
                      writePermission === "undefined" ||
                      role === "admin" ||
                      (isOwner === true && createdBy === userId)) ? 1 : 0.5
                  }}
                  onClick={(writePermission === true ||
                    writePermission === "undefined" ||
                    role === "admin" ||
                    (isOwner === true && createdBy === userId)) ? () => DownloadExcel() : undefined}
                  disabled={!(writePermission === true ||
                    writePermission === "undefined" ||
                    role === "admin" ||
                    (isOwner === true && createdBy === userId))}
                >
                  <FontAwesomeIcon icon={faFileUpload} />
                </button>
              </Tooltip>
            </div>
          </div>
          <div>
            <div className="mt-5" style={{ bottom: "35px" }}>
              <ThemeProvider theme={tableTheme}>
                <MaterialTable
                  title="FMECA"
                  icons={tableIcons}
                  data={tableData}
                  columns={columns}
                  editable={{
                    onRowAdd:
                      writePermission === true ||
                        writePermission === "undefined" ||
                        role === "admin" ||
                        (isOwner === true && createdBy === userId)
                        ? (newRow) =>
                          new Promise((resolve, reject) => {
                            createFmeca(newRow)
                              .then(() => resolve())
                              .catch(() => reject());
                          })
                        : null,
                    onRowUpdate:
                      writePermission === true ||
                        writePermission === undefined ||
                        role === "admin" ||
                        (isOwner === true && createdBy === userId)
                        ? (newRow, oldData) =>
                          new Promise((resolve, reject) => {
                            updateFmeca(newRow)
                              .then(() => resolve())
                              .catch(() => reject());
                          })
                        : null,
                  }}
                  actions={[
                    {
                      icon: () => (
                        <FontAwesomeIcon
                          icon={faTrash}
                          style={{ fontSize: "14px", color: "#ff4444" }}
                        />
                      ),
                      tooltip: "Delete Row",
                      onClick: (event, rowData) => handleCustomDelete(rowData),
                      disabled: !(
                        writePermission === true ||
                        writePermission === "undefined" ||
                        role === "admin" ||
                        (isOwner === true && createdBy === userId)
                      ),
                      position: "row"
                    }
                  ]}
                  options={{
                    cellStyle: {
                      border: "1px solid #eee",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      minWidth: 300,
                      maxWidth: 400,
                      textAlign: "center",
                    },
                    addRowPosition: "first",
                    actionsColumnIndex: -1,
                    showEditIcon: false,
                    showDeleteIcon: false,
                    pageSize: 5,
                    pageSizeOptions: [5, 10, 20, 50],
                    headerStyle: {
                      backgroundColor: "#CCE6FF",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      minWidth: 200,
                      maxWidth: 500,
                      textAlign: "center",
                    },
                  }}
                  localization={{
                    toolbar: { function: "Placeholder" },
                    body: {
                      addTooltip: "Add FMECA",
                    },
                  }}
                />
              </ThemeProvider>
              <ValidationModal
                isOpen={showValidationModal}
                errors={validationErrors}
                onClose={closeValidationModal}
              />
            </div>
          </div>

          <Modal show={show} centered>
            <div className="d-flex justify-content-center mt-5">
              <FontAwesomeIcon
                icon={faCircleCheck}
                fontSize={"40px"}
                color="#1D5460"
              />
            </div>
            <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
              <div>
                <h4 className="text-center">Row Deleted Successfully</h4>
              </div>
            </Modal.Footer>
          </Modal>
          <Modal show={productModal} centered onHide={handleClose}>
            <div className="d-flex justify-content-center mt-5">
              <FaExclamationCircle size={45} color="#de2222b0" />
            </div>
            <Modal.Footer className=" d-flex justify-content-center success-message mb-4">
              <div>
                <h5 className="text-center">
                  Please select product from <b>Dropdown </b>before adding a new
                  row!
                </h5>
                <Button
                  className="save-btn fw-bold fmeca-button mt-3"
                  onClick={() => setProductModal(false)}
                >
                  OK
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
          <Modal show={deleteModalOpen} onHide={cancelDelete} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this row?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={failureModeRatioError} centered onHide={handleHide}>
            <div className="d-flex justify-content-center mt-5">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                size="2x"
                color="#de2222b0"
              />
            </div>
            <Modal.Footer className=" d-flex justify-content-center success-message mb-4">
              <div>
                <h5 className="text-center">
                  Sum of Failure Mode must be equal to<b>1</b>
                </h5>
                <Button
                  className="save-btn fw-bold fmeca-button mt-3"
                  onClick={() => setFailureModeRatioError(false)}
                >
                  OK
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </div>
  );
}

export default Index;