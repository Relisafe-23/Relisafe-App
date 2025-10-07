
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Modal, Button, Row, Col } from "react-bootstrap";
import "../../css/FMECA.scss";
import Api from "../../Api";
import { tableIcons } from "../core/TableIcons";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import { toast } from "react-toastify";
import {
  faFileDownload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import {
  faCircleCheck,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaExclamationCircle } from "react-icons/fa";
import { TextField } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Dropdown from "../Company/Dropdown";
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import { customStyles } from "../core/select";
import { ButtonBase, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Table, TableBody, TableContainer, TableHead, TableRow, ThemeProvider } from "@mui/material";
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
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;
  const [show, setShow] = useState(false);
  const [treeTableData, setTreeTabledata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const handleClose = () => setProductModal(false);
  const handleHide = () => setFailureModeRatioError(false);
  const [writePermission, setWritePermission] = useState();
  const history = useHistory();
  const userId = localStorage.getItem("userId");
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
  const [data, setData] = useState({
    operatingPhase: "",
    function: "",
    failureMode: "",
    // searchFM: "",
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

  useEffect(() => {
    getAllConnect();
  }, []);

  const DownloadExcel = (values) => {
    const columnsToRemove = ["projectId", "companyId", "productId", "id"];
    const CompanyName = treeTableData[0]?.companyId?.companyName;
    const ProjectName = treeTableData[0]?.projectId?.projectName;
    const data = tableData[0];
    const productName = data?.productId?.productName
    console.log("ProductName",productName)
    console.log("tableData",tableData)
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
      const columns = Object.keys(modifiedTableData[0])?.map((columnName) => ({
        title: columnName,
        field: columnName,
      }));

      const workSheet = XLSX.utils.json_to_sheet(modifiedTableData, {
        skipHeader: false,
      });
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "FMECA Data");


      const buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });

      // Create a Blob object and initiate a download
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FMECA_Data.xlsx";
      link.click();
     
      // Clean up
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
    Api.post("api/v1/FMECA/", {
      operatingPhase: values.operationPhase,
      function: values.function,
      failureMode: values.failureMode,
      // searchFM: values.searchFM,
      cause: values.cause,
      failureModeRatioAlpha: values?.failureModeRatioAlpha
        ? values?.failureModeRatioAlpha
        : 0,
      detectableMeansDuringOperation: values.detectableMeansDuringOperation,
      detectableMeansToMaintainer: values.detectableMeansToMaintainer,
      BuiltInTest: values.BuiltInTest,
      subSystemEffect: values.subSystemEffect,
      systemEffect: values.systemEffect,
      endEffect: values.endEffect,
      endEffectRatioBeta: values.endEffectRatioBeta
        ? values.endEffectRatioBeta
        : 1,
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
      immediteActionDuringOperationalPhase:
        values.immediteActionDuringOperationalPhase,
      immediteActionDuringNonOperationalPhase:
        values.immediteActionDuringNonOperationalPhase,
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
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      userId: userId,
      Alldata: tableData,
    }).then((response) => {
      setIsLoading(false);
      const status = response?.status;
      // if (status === 204) {
      //   setFailureModeRatioError(true);
      // }

      getProductData();
      setIsLoading(false);
    });
  };
  const convertToJson = (headers, data) => {
    const rows = [];

    // if (excelData.length > 1) {
    if (data.length > 0 && data[0].length > 1) {
      data.forEach((row) => {
        let rowData = {};
        row.forEach((element, index) => {
          rowData[headers[index]] = element;
        });
        rows.push(rowData);
        createFMECADataFromExcel(rowData);
      });

      return rows;
    } else {
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
    }
  };

  const importExcel = (e) => {
    const file = e.target.files[0];

    // Check if the file is an Excel file by checking the extension
    const fileName = file.name;
    const validExtensions = ["xlsx", "xls"]; // Allowed file extensions
    const fileExtension = fileName.split(".").pop().toLowerCase(); // Get file extension

    if (!validExtensions.includes(fileExtension)) {
      // alert('Please upload a valid Excel file (either .xlsx or .xls)');
      toast.error("Please upload a valid Excel file (either .xlsx or .xls)!", {
        position: toast.POSITION.TOP_RIGHT, // Adjust the position as needed
      });
      return; // Exit the function if the file is not an Excel file
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      //parse data
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, { type: "binary" });
      // get first sheet
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];

      //convert array

      const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      const headers = fileData[0];
      const heads = headers.map((head) => ({ title: head, field: head }));
      setColDefs(heads);
      fileData.splice(0, 1);
      setData(convertToJson(headers, fileData));
      convertToJson(headers, fileData);
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    getTreeData();
    getProductData();
  }, [productId]);

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };
  //project owner
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

  //handle file
  //const fileType =[""]

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
        setTreeTabledata(treeData, projectId);
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
        setWritePermission(data?.modules[3].write);
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
    overrides: {
      MuiTableRow: {
        root: {
          "&:hover": {
            cursor: "pointer",
            backgroundColor: "rgba(224, 224, 224, 1) !important",
          },
        },
      },
    },
  });
  //Project detail API
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

  const getAllConnect = () => {
    setIsLoading(true);

    Api.get("api/v1/library/get/all/connect/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      setIsLoading(false);
      const filteredData = res.data.getData.filter(
        (entry) => entry?.libraryId?.moduleName === "FMECA"
      );
      setConnectData(filteredData);
    });
  };
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: "", message: "" });
  const [connectData, setConnectData] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState();
  const filterCondition = (item) => {
    return item.sourceValue === selectedFunction?.value;
  };
  const [connectedValues, setConnectedValues] = useState([]);

  const [selectedField, setSelectedField] = useState(null);
  const dropdownOptions = {};

  const handleDropdownChange = (selectedValue) => {
    const selectedItem = treeTableData.find(
      (item) => item.productId === selectedValue
    );
    setSelectedProductName(selectedItem?.treeStructure?.productName || "");
  };

  const fieldNames = [
    "operatingPhase",
    "function",
    "failureMode",
    // "searchFM",
    "failureModeRatioAlpha",
    "cause",
    "subSystemEffect",
    "systemEffect",
    "endEffect",
    "endEffectRatioBeta",
    "safetyImpact",
    "referenceHazardId",
    "realibilityImpact",
    "serviceDisruptionTime",
    "frequency",
    "severity",
    "riskIndex",
    "detectableMeansDuringOperation",
    "detectableMeansToMaintainer",
    "BuiltInTest",
    "designControl",
    "maintenanceControl",
    "exportConstraints",
    "immediteActionDuringOperationalPhase",
    "immediteActionDuringNonOperationalPhase",
    "userField1",
    "userField2",
    "userField3",
    "userField4",
    "userField6",
    "userField7",
    "userField8",
    "userField9",
    "userField10",
  ];

  fieldNames.forEach((fieldName) => {
    const filteredData =
      connectData?.filter((item) => item?.sourceName === fieldName) || [];
    dropdownOptions[fieldName] = filteredData.map((item) => ({
      value: item?.sourceValue,
      label: item?.sourceValue,
    }));
  });

  useEffect(() => {
    const filteredValues = connectData?.filter(filterCondition) || [];
    setConnectedValues(filteredValues);
  }, [connectData, selectedFunction]);

  useEffect(() => {
    setSelectedFunction();
    setConnectedValues([]);
  }, []);

  const createDropdownEditComponent =
    (fieldName) =>
      ({ value, onChange }) => {
        const options = dropdownOptions[fieldName] || [];
        const connectedValue = connectedValues[0]?.destinationData?.find(
          (item) => item?.destinationName === fieldName
        )?.destinationValue;

        const isAnyDropdownSelected = selectedField !== null;

        if (isAnyDropdownSelected || options.length === 0) {
          return (
            <TextField
              onChange={(e) => onChange(connectedValue || e.target.value)}
              value={connectedValue || value}
              multiline
            />
          );
        }

        return (
          <Select
            value={options.find((option) => option.value === value)}
            onChange={(selectedOption) => {
              onChange(selectedOption.value);
              setSelectedField(fieldName);
              setSelectedFunction(selectedOption);
            }}
            options={options}
          />
        );
      };



  const handleDropdownSelection = (fieldName) => {
    setSelectedField(fieldName);
    setSelectedFunction(null);
  };
  // Validation utility
  const validateField = (fieldName, value, isRequired) => {
    if (isRequired && (!value || value.toString().trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  };

  // Validation Modal Component
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

          // Validate on change and store validation state
          const error = validateField(title, newValue, isRequired);
          // You can store this error in a state management system
        };

        return (
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={isRequired ? `${title} *` : title}
              style={{
                height: "40px",
                borderRadius: "4px",
                width: "100%",
                borderColor: isRequired && (!value || value.toString().trim() === '') ? '#d32f2f' : '#ccc'
              }}
              title={title}
            />
            {isRequired && (!value || value.toString().trim() === '') && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                color: '#d32f2f',
                fontSize: '12px',
                marginTop: '2px'
              }}>
                {title} is required!
              </div>
            )}
          </div>
        );
      }
    };
  };

  // Special case for operatingPhase (has different styling)
  const operatingPhaseColumn = {
    ...createEditComponent("operatingPhase", "Operating Phases", true), // true for required
    editComponent: ({ value, onChange, rowData }) => {
      const filteredData = allSepareteData?.filter(
        (item) => item?.sourceName === "operatingPhase"
      ) || [];

      const options = filteredData.map((item) => ({
        value: item.sourceValue,
        label: item.sourceValue,
      }));

      const selectedOption = options.find((opt) => opt.value === value);
      const displayOption = selectedOption || (value ? { label: value, value: value } : null);

      const isRequired = true; // This field is required
      const hasError = isRequired && (!value || value.toString().trim() === '');

      if (options.length === 0) {
        return (
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter Operating Phase *"
              style={{
                height: "40px",
                borderRadius: "4px",
                width: "100%",
                borderColor: hasError ? '#d32f2f' : '#ccc'
              }}
              title="Enter Operating Phase"
            />
            {hasError && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                color: '#d32f2f',
                fontSize: '12px',
                marginTop: '2px'
              }}>
                Operating Phases is required!
              </div>
            )}
          </div>
        );
      }

      return (
        <div style={{ position: 'relative' }}>
          <Select
            name="operatingPhase"
            value={displayOption}
            onChange={(selectedOption) => {
              onChange(selectedOption?.value);
              handleInputChange(selectedOption, "operatingPhase");
              getAllConnectedLibrary(selectedOption, "operatingPhase");
            }}
            options={options}
            styles={{
              container: (base) => ({
                ...base,
                width: "100%",
                minHeight: "40px"
              }),
              control: (base, state) => ({
                ...base,
                borderColor: hasError ? '#d32f2f' : state.isFocused ? '#1976d2' : '#ccc',
                '&:hover': {
                  borderColor: hasError ? '#d32f2f' : '#1976d2'
                }
              })
            }}
          />
          {hasError && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              color: '#d32f2f',
              fontSize: '12px',
              marginTop: '2px'
            }}>
              Required field
            </div>
          )}
        </div>
      );
    }
  };

  // Special case for FMECA ID (not an editable field)
  const fmecaIdColumn = {
    render: (rowData) => `${rowData?.tableData?.id + 1}`,
    title: "FMECA ID",
  };

  const columns = [
    fmecaIdColumn,
    operatingPhaseColumn,
    createEditComponent("function", "Function", true),
    createEditComponent("failureMode", "Failure Mode", true),
    createEditComponent("failureModeRatioAlpha", "Failure Mode Ratio Alpha", true),
    createEditComponent("detectableMeansDuringOperation", "Cause"),
    createEditComponent("subSystemEffect", "Sub System effect", true),
    createEditComponent("systemEffect", "System Effect", true),
    createEditComponent("endEffect", "End Effect", true),
    createEditComponent("endEffectRatioBeta", "End Effect ratio Beta (must be equal to 1)", true),
    createEditComponent("safetyImpact", "Safety Impact", true),
    createEditComponent("referenceHazardId", "Reference Hazard ID"),
    createEditComponent("realibilityImpact", "Reliability Impact", true),
    createEditComponent("serviceDisruptionTime", "Service Disruption Time (minutes)"),
    createEditComponent("frequency", "Frequency"),
    createEditComponent("severity", "Severity"),
    createEditComponent("riskIndex", "Risk Index"),
    createEditComponent("detectableMeansDuringOperation", "Detectable Means during operation"),
    createEditComponent("detectableMeansToMaintainer", "Detectable Means to Maintainer"),
    createEditComponent("BuiltInTest", "Built-in Test"),
    createEditComponent("designControl", "Design Control"),
    createEditComponent("maintenanceControl", "Maintenance Control"),
    createEditComponent("exportConstraints", "Export constraints"),
    createEditComponent("immediteActionDuringOperationalPhase", "Immediate Action during operational Phases"),
    createEditComponent("immediteActionDuringNonOperationalPhase", "Immediate Action during Non-operational Phases"),
    createEditComponent("userField1", "User field 1"),
    createEditComponent("userField2", "User field 2"),
    createEditComponent("userField3", "User field 3"),
    createEditComponent("userField4", "User field 4"),
    createEditComponent("userField5", "User field 5"),
    createEditComponent("userField6", "User field 6"),
    createEditComponent("userField7", "User field 7"),
    createEditComponent("userField8", "User field 8"),
    createEditComponent("userField9", "User field 9"),
    createEditComponent("userField10", "User field 10"),
  ];
  const createFmeca = (values) => {



    if (productId) {
      const companyId = localStorage.getItem("companyId");
      setIsLoading(true);
      Api.post("api/v1/FMECA/", {
        operatingPhase: values.operatingPhase
          ? values.operatingPhase
          : data.operatingPhase,
        function: values.function ? values.function : data.function,
        failureMode: values.failureMode ? values.failureMode : data.failureMode,
        // searchFM: values.searchFM ? values.searchFM : data.searchFM,
        cause: values.cause ? values.cause : data.cause,
        failureModeRatioAlpha: values?.failureModeRatioAlpha
          ? values?.failureModeRatioAlpha
          : 1,
        detectableMeansDuringOperation: values.detectableMeansDuringOperation
          ? values.detectableMeansDuringOperation
          : data.detectableMeansDuringOperation,
        detectableMeansToMaintainer: values.detectableMeansToMaintainer
          ? values.detectableMeansToMaintainer
          : data.detectableMeansToMaintainer,
        BuiltInTest: values.BuiltInTest ? values.BuiltInTest : data.BuiltInTest,
        subSystemEffect: values.subSystemEffect
          ? values.subSystemEffect
          : data.subSystemEffect,
        systemEffect: values.systemEffect
          ? values.systemEffect
          : data.systemEffect,
        endEffect: values.endEffect ? values.endEffect : data.endEffect,
        endEffectRatioBeta: values.endEffectRatioBeta
          ? values.endEffectRatioBeta
          : 1,
        safetyImpact: values.safetyImpact
          ? values.safetyImpact
          : data.safetyImpact,
        referenceId: values.referenceHazardId
          ? values.referenceHazardId
          : data.referenceHazardId,
        realibilityImpact: values.realibilityImpact
          ? values.realibilityImpact
          : data.realibilityImpact,
        serviceDisruptionTime: values.serviceDisruptionTime
          ? values.serviceDisruptionTime
          : data.serviceDisruptionTime,
        frequency: values.frequency ? values.frequency : data.frequency,
        severity: values.severity ? values.severity : data.severity,
        riskIndex: values.riskIndex ? values.riskIndex : data.riskIndex,
        designControl: values.designControl
          ? values.designControl
          : data.designControl,
        maintenanceControl: values.maintenanceControl
          ? values.maintenanceControl
          : data.maintenanceControl,
        exportConstraints: values.exportConstraints
          ? values.exportConstraints
          : data.exportConstraints,
        immediteActionDuringOperationalPhase:
          values.immediteActionDuringOperationalPhase
            ? values.immediteActionDuringOperationalPhase
            : data.immediteActionDuringOperationalPhase,
        immediteActionDuringNonOperationalPhase:
          values.immediteActionDuringNonOperationalPhase
            ? values.immediteActionDuringNonOperationalPhase
            : data.immediteActionDuringNonOperationalPhase,
        userField1: values.userField1 ? values.userField1 : data.userField1,
        userField2: values.userField2 ? values.userField2 : data.userField2,
        userField3: values.userField3 ? values.userField3 : data.userField3,
        userField4: values.userField4 ? values.userField4 : data.userField4,
        userField5: values.userField5 ? values.userField5 : data.userField5,
        userField6: values.userField6 ? values.userField6 : data.userField6,
        userField7: values.userField7 ? values.userField7 : data.userField7,
        userField8: values.userField8 ? values.userField8 : data.userField8,
        userField9: values.userField9 ? values.userField9 : data.userField9,
        userField10: values.userField10 ? values.userField10 : data.userField10,
        projectId: projectId,
        companyId: companyId,
        productId: productId,
        userId: userId,
        Alldata: tableData,
      }).then((response) => {
        const status = response?.status;
        // if (status === 204) {
        //   setFailureModeRatioError(true);
        // }
        getProductData();
        setIsLoading(false);
      });
    } else {
      setProductModal(true);
    }
  };
  const updateFmeca = async (values) => {
    const companyId = localStorage.getItem("companyId");
    if (!values.operatingPhase || !values.function || !values.failureMode) {
      toast.error("Operating Phase, Function, and Failure Mode are required.");
      return;
    }
    setIsLoading(true);
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
      endEffectRatioBeta: values.endEffectRatioBeta || 1,
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
    };

    try {
      const response = await Api.patch("api/v1/FMECA/update", payload);
      if (response?.status === 200) {
        toast.success("FMECA updated successfully!");
        getProductData();
        getAllConnectedLibraryAfterUpdate();
        
      }
       else if (response?.status === 204) {
        toast.error("Failure Mode Radio Alpha Must be Equal to One !");
      }
      else {
        toast.warning("Update request completed, but status not ideal.");
        getProductData();
        getAllConnectedLibraryAfterUpdate();
      }
    } catch (error) {
      const errorStatus = error?.response?.status;
      if (errorStatus === 401) {
        logout();
      } else {
        toast.error(errorStatus?.response?.status === 422 ? "Failed to update FMECA. Please try again." : "Failure Mode Ratio Alpha must sum to exactly 1");
        // errorStatus?.message 
        console.error("Update Error:", errorStatus?.response?.status === 422);
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
        // getTableData();
        // setShow(!show);
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

            <div style={{ width: "100%", marginRight: "20px" }}>
              <Dropdown
                value={projectId}
                productId={productId}
                data={treeTableData}
                onChange={handleDropdownChange}
              />
            </div>
            {/* {console.log("ProductName", treeTableData[0]?.treeStructure?.productName)}  */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: "8px",
                height: "40px",
              }}
            >
              <Tooltip placement="right" title="Import" >
                <div style={{ marginRight: "8px" }}>
                  <label htmlFor="file-input" className="import-export-btn">

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
                </div>
              </Tooltip>
              <Tooltip placement="left" title="Export">
                <button
                  className="import-export-btn "
                  style={{ marginTop: '-2px' }}
                  onClick={() => DownloadExcel()}
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
                  editable={{
                    onRowAdd:
                      writePermission === true ||
                        writePermission === "undefined" ||
                        role === "admin" ||
                        (isOwner === true && createdBy === userId)
                        ? (newRow) =>
                          new Promise((resolve, reject) => {
                            createFmeca(newRow);
                            resolve();
                          })
                        : null,
                    onRowUpdate:
                      writePermission === true ||
                        writePermission === "undefined" ||
                        role === "admin" ||
                        (isOwner === true && createdBy === userId)
                        ? (newRow, oldData) =>
                          new Promise((resolve, reject) => {
                            updateFmeca(newRow);
                            resolve();
                          })
                        : null,

                    onRowDelete:
                      writePermission === true ||
                        writePermission === "undefined" ||
                        role === "admin" ||
                        (isOwner === true && createdBy === userId)
                        ? (selectedRow) =>
                          new Promise((resolve, reject) => {
                            deleteFmecaData(selectedRow);
                            resolve();
                          })
                        : null,
                  }}
                  title="FMECA"
                  icons={tableIcons}
                  columns={columns}
                  data={tableData}
                  options={{
                    cellStyle: {
                      border: "1px solid #eee",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      minWidth: 250,
                      maxWidth: 400,
                      textAlign: "center",
                    },
                    addRowPosition: "first",
                    actionsColumnIndex: -1,
                    pageSize: 5,
                    pageSizeOptions: [5, 10, 20, 50],
                    headerStyle: {
                      backgroundColor: "#CCE6FF",
                      fontWeight: "bold",
                      zIndex: 0,
                      whiteSpace: "nowrap",
                      minWidth: 200,
                      textAlign: "center",
                      maxWidth: 500,
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


