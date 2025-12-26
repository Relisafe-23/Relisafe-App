import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import { Modal, Button, Row, Col } from "react-bootstrap";
import "../../css/FMECA.scss";
import Api from "../../Api";
import { tableIcons } from "../core/TableIcons";
import { ThemeProvider } from "@material-ui/core/styles";
import { createTheme } from "@material-ui/core/styles";
import Dropdown from "../Company/Dropdown";
import CreatableSelect from "react-select/creatable";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import { FaExclamationCircle } from "react-icons/fa";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import { Input, TextField } from "@material-ui/core";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Select from "react-select";
import { Tooltip, TableCell } from "@material-ui/core";
import {
  faFileDownload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

function Index(props) {
  const [initialProductID, setInitialProductID] = useState();
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;
  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
    ? props?.location?.state?.productId
    : initialProductID;
  const [show, setShow] = useState(false);
  const [connectData, setConnectData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState();
    const [rowConnections, setRowConnections] = useState({});
      const [selectedSourceField, setSelectedSourceField] = useState(null);
  const [colDefs, setColDefs] = useState();
  const [treeData, setTreeData] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const handleClose = () => setProductModal(true);
  const [writePermission, setWritePermission] = useState();
  const [treeTableData, setTreeTabledata] = useState([]);
  const userId = localStorage.getItem("userId");
  const history = useHistory();
  const [modeOfOperation, setModeOfOperation] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [companyId, setCompanyId] = useState();
  const [allSepareteData, setAllSepareteData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const role = localStorage.getItem("role");
  const handleHide = () => setFailureModeRatioError(false);
  const [failureModeRatioError, setFailureModeRatioError] = useState(false);

  // NEW: State to track selected source values per row
  const [selectedSourceValues, setSelectedSourceValues] = useState({});
  const [flattenedConnect, setFlattenedConnect] = useState([]);

  const DownloadExcel = () => {
    if (!tableData || tableData.length === 0) {
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
      return;
    }

    const firstRow = tableData[0];
    const companyName = firstRow?.companyId?.companyName || "Unknown Company";
    const projectName = firstRow?.projectId?.projectName || "Unknown Project";
    const data = tableData[0];
    const productName = data?.productId?.productName || "Unknown Product"; 
    const columnsToRemove = [
      "projectId", "companyId", "productId", "id", "tableData",
    ];

    const modifiedTableData = tableData.map((row) => {
      const newRow = { 
        Company: companyName,
        Project: projectName,
        Product: productName
      };
      Object.keys(row).forEach(key => {
        if (!columnsToRemove.includes(key)) {
          newRow[key] = row[key];
        }
      });
      return newRow;
    });

    if (modifiedTableData.length > 0) {
      const workSheet = XLSX.utils.json_to_sheet(modifiedTableData, {
        skipHeader: false,
      });
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "Safety Data");
      XLSX.writeFile(workBook, "Safety_Data.xlsx");
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

  const createsafetyDataFromExcel = (values) => {
    const companyId = localStorage.getItem("companyId");
    setIsLoading(true);
    Api.post("api/v1/safety/", {
      modeOfOperation: values.modeOfOperation,
      hazardCause: values.hazardCause,
      effectOfHazard: values.effectOfHazard,
      hazardClasification: values.hazardClasification,
      designAssuranceLevel: values.designAssuranceLevel
        ? values.designAssuranceLevel
        : 0,
      meansOfDetection: values.meansOfDetection,
      crewResponse: values.crewResponse,
      uniqueHazardIdentifier: values.uniqueHazardIdentifier,
      initialSeverity: values.initialSeverity,
      initialLikelihood: values.initialLikelihood,
      initialRiskLevel: values.initialRiskLevel,
      designMitigation: values.designMitigation
        ? values.designMitigation
        : 1,
      designMitigatonResbiity: values.designMitigatonResbiity,
      designMitigtonEvidence: values.designMitigtonEvidence,
      opernalMaintanMitigation: values.opernalMaintanMitigation,
      opernalMitigatonResbility: values.opernalMitigatonResbility,
      operatnalMitigationEvidence: values.operatnalMitigationEvidence,
      residualSeverity: values.residualSeverity,
      residualLikelihood: values.residualLikelihood,
      residualRiskLevel: values.residualRiskLevel,
      hazardStatus: values.hazardStatus,
      ftaNameId: values.ftaNameId,
      userField1: values.userField1,
      userField2: values.userField2,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      userId: userId,
      Alldata: tableData,
    }).then((response) => {
      setIsLoading(false);
      const status = response?.status;
      if (status === 204) {
        setFailureModeRatioError(true);
      }
      getProductData();
      setIsLoading(false);
    });
  };

  const convertToJson = (headers, data) => {
    const rows = [];
    if (data.length > 0 && data[0].length > 1) {
      data.forEach((row) => {
        let rowData = {};
        row.forEach((element, index) => {
          rowData[headers[index]] = element;
        });
        rows.push(rowData);
        createsafetyDataFromExcel(rowData);
      });
      return rows;
    } else {
      toast.error("No Data Found In Excel Sheet", {
        position: "top-right",
      });
    }
  };

  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      const data = new Uint8Array(event.target.result);
      const workBook = XLSX.read(data, { type: "array" });
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      const headers = fileData[0];
      fileData.splice(0, 1);
      convertToJson(headers, fileData);
    };
    reader.readAsArrayBuffer(file);
  };

  const [allConnectedData, setAllConnectedData] = useState([]);
  const [data, setData] = useState({
    modeOfOperation: "",
    hazardCause: "",
    effectOfHazard: "",
    designAssuranceLevel: "",
    hazardClasification: "",
    initialSeverity: "",
    initialLikelihood: "",
    initialRiskLevel: "",
    designMitigation: "",
    designMitigatonResbiity: "",
    designMitigtonEvidence: "",
    opernalMaintanMitigation: "",
    opernalMitigatonResbility: "",
    operatnalMitigationEvidence: "",
    residualSeverity: "",
    residualLikelihood: "",
    meansOfDetection: "",
    crewResponse: "",
    uniqueHazardIdentifier: "",
    residualRiskLevel: "",
    hazardStatus: "",
    ftaNameId: "",
    userField1: "",
    userField2: "",
  });

  const handleInputChange = (selectedItems, name) => {
    setData((prevData) => ({
      ...prevData,
      [name]: selectedItems ? selectedItems.value : "",
    }));
  };

  const getAllSeprateLibraryData = async () => {
    const companyId = localStorage.getItem("companyId");
    setCompanyId(companyId);
    Api.get("api/v1/library/get/all/separate/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      let filteredData = res?.data?.data.filter(
        (item) => item?.moduleName === "SAFETY"
      );

      if (filteredData.length === 0) {
        filteredData = res?.data?.data.filter(
          (item) => item?.moduleName === "SAFETY"
        );
      }
      setAllSepareteData(filteredData);      
      const merged = [...(tableData || []), ...filteredData];
      setMergedData(merged);
    });
  };

  useEffect(() => {
    getAllSeprateLibraryData();
  }, []);

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
        setWritePermission(data?.modules[9].write);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
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

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  useEffect(() => {
    getProjectPermission();
    getProjectDetails();
    projectSidebar();
  }, [projectId]);

  useEffect(() => {
    getTreeData();
    getProductData();
  }, [productId]);

  const getProductData = () => {
    Api.get("/api/v1/safety/product/list", {
      params: {
        projectId: projectId,
        productId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        getProjectDetails();
        setIsLoading(false);
        setTableData(data);
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

  const getTreeData = () => {
    Api.get(`/api/v1/productTreeStructure/list`, {
      params: {
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;
        const initialProductID = res?.data?.data[0]?.treeStructure?.id;
        setTreeData(treeData, projectId);
        setInitialProductID(initialProductID);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

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

  const getProjectDetails = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: { userId: userId },
    })
      .then((response) => {
        setModeOfOperation(response.data?.data?.modeOfOperation);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Get all connections
  const getAllConnect = () => {
    setIsLoading(true);
    Api.get("api/v1/library/get/all/connect/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      setIsLoading(false);
      const filteredData = res.data.getData.filter(
        (entry) => entry?.libraryId?.moduleName === "SAFETY" || 
                  entry?.destinationModuleName === "SAFETY"
      );
        const ALLOWED_MODULES = ["PMMRA", "FMECA", "MTTR"];

const SourceDestination = filteredData.flatMap((item) =>
  (item.destinationData || [])
    .filter((d) => {
      const sourceModule = item.libraryId?.moduleName;
      const destinationModule = d.destinationModuleName;

      // Case 1: PMMRA / SAFETY / MTTR  → FMECA
      const isOtherToFMECA =
        ALLOWED_MODULES.includes(sourceModule) &&
        destinationModule === "SAFETY";

      // Case 2: FMECA → PMMRA / SAFETY / MTTR
      const isFMECAToOther =
        sourceModule === "SAFETY" &&
        ALLOWED_MODULES.includes(destinationModule);

      return isOtherToFMECA || isFMECAToOther;
    })
    .map((d) => ({
      sourceModule: item.libraryId?.moduleName,
      destinationModule: d.destinationModuleName,

      // Show correct value in correct field
      fieldName:
        item.libraryId?.moduleName === "SAFETY"
          ? d.destinationName
          : item.destinationeName,

      fieldValue:
        item.libraryId?.moduleName === "SAFETY"
          ? d.destinationValue // FMECA → other module
          : d.destinationValue, // other module → FMECA
    }))
);
setConnectData(SourceDestination);
console.log("SourceDestination:", SourceDestination);
      // Flatten the connection data for easier querying
      const flattened = filteredData.flatMap((item) =>
        (item.destinationData || [])
          .filter(d => d.destinationModuleName === "SAFETY")
          .map((d) => ({
            sourceName: item.sourceName,         
            sourceValue: item.sourceValue,
            destinationName: d.destinationName,
            destinationValue: d.destinationValue,
            destinationModule: d.destinationModuleName 
          }))
      );
      
      setFlattenedConnect(flattened);
    });
  };

  useEffect(() => {
    getAllConnect();
  }, []);

  // Function to get destination values for a field based on selected sources
  const getDestinationValuesForField = (fieldName, rowId) => {
    const rowSourceValues = selectedSourceValues[rowId] || {};
    let destinationValues = [];
    
    // Check all source fields that might have connections to this field
    Object.keys(rowSourceValues).forEach(sourceField => {
      const sourceValue = rowSourceValues[sourceField];
      if (sourceValue) {
        const connections = flattenedConnect.filter(
          item => 
            item.sourceName === sourceField &&
            item.sourceValue === sourceValue &&
            item.destinationName === fieldName
        );
        
        destinationValues = [...destinationValues, ...connections.map(item => item.destinationValue)];
      }
    });
    
    return [...new Set(destinationValues)]; // Remove duplicates
  };
  const getDestinationFieldsForSource = (sourceField, sourceValue) => {
    return flattenedConnect
      ?.filter(item => item.fieldName === sourceField && item.fieldValue === sourceValue)
      .map(item => ({
        field: item.destName,
        value: item.destValue
      })) || [];
  };
    
  // Function to handle source selection and update connections
  const handleSourceSelection = (fieldName, value, rowData) => {
    const rowId = rowData?.tableData?.id;

    // Update selected source values for this row
    setSelectedSourceValues(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [fieldName]: value
      }
    }));

    // Set the selected source field for tracking
    setSelectedSourceField(fieldName);

    // Find all connections originating from this source
    const connections = flattenedConnect?.filter(
      item => item.fieldName === fieldName && item.fieldValue === value
    ) || [];

    // Store connections for this row
    setRowConnections(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [fieldName]: connections
      }
    }));
  };


  // Check if field is a source field (has outgoing connections)
  const isSourceField = (fieldName) => {
    return flattenedConnect.some(item => item.sourceName === fieldName);
  };
 

  // Check if field is a destination field (has incoming connections)
  const isDestinationField = (fieldName) => {
    return flattenedConnect.some(item => item.destinationName === fieldName);
  };

  // Create edit component for a field
  const createEditComponent = (fieldName, label, required = false) => {
    return {
      field: fieldName,
      title: required ? `${label} *` : label,
      type: "string",
      cellStyle: { minWidth: "200px", textAlign: "center" },
      headerStyle: { minWidth: "200px", textAlign: "center" },
      validate: (rowData) => {
        if (required && (!rowData[fieldName] || rowData[fieldName].trim() === "")) {
          return { isValid: false, helperText: `${label} is required` };
        }
        return true;
      },
      editComponent: ({ value, onChange, rowData }) => {
        const rowId = rowData?.tableData?.id;
        
        // Check if this field is a destination field
        const isDestination = isDestinationField(fieldName);
        
        // Get destination values if this is a destination field
        let destinationOptions = [];
        if (isDestination) {
          destinationOptions = getDestinationValuesForField(fieldName, rowId);
        }
        
        // Get separate library values
        const separateOptions = allSepareteData
          ?.filter(item => item.sourceName === fieldName)
          .map(item => item.sourceValue) || [];
        
        // Combine all options (destination values first, then separate values)
        const allOptions = [...new Set([...destinationOptions, ...separateOptions])];
        
        const hasError = required && (!value || value.trim() === "");
        
        // LOGIC: Only show dropdown if:
        // 1. This is a destination field AND we have destination values from selected sources
        // OR
        // 2. We have separate library values
        if (allOptions.length > 0) {
          const options = allOptions.map(opt => ({
            value: opt,
            label: opt,
            isDestination: destinationOptions.includes(opt)
          }));
          
          const selectedOption = options.find(opt => opt.value === value) || 
                                (value ? { value, label: value } : null);
          
          return (
            <div style={{ position: "relative" }}>
              <CreatableSelect
                value={selectedOption}
                options={options}
                onChange={(option) => {
                  const newValue = option?.value || "";
                  onChange(newValue);
                  console.log("Select Value Changed123:", newValue);
                  // If this is a source field, update the selected source value
                  // if (isSourceField(fieldName)) {
                  //   handleSourceSelection(fieldName, newValue, rowId);
                  // }
                          if (isSourceField(fieldName) || newValue) {
                handleSourceSelection(fieldName, newValue, rowData);
                const destinations = getDestinationFieldsForSource(fieldName, newValue);
                if (destinations.length === 1) {
                }
              }
                }}
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: hasError ? "#d32f2f" : base.borderColor,
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.data?.isDestination ? '#e8f4fd' : base.backgroundColor,
                    fontWeight: state.data?.isDestination ? 'bold' : base.fontWeight,
                  }),
                }}
              />
              {hasError && (
                <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "2px" }}>
                  {label} is required
                </div>
              )}
              {destinationOptions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "-18px",
                  right: "5px",
                  fontSize: "10px",
                  color: "#1976d2",
                  background: "#e8f4fd",
                  padding: "2px 5px",
                  borderRadius: "3px",
                }}>
                  Connected
                </div>
              )}
            </div>
          );
        } else {
          // Show regular input field
          return (
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={value || ""}
                onChange={(e) => {
                  const newValue = e.target.value;
                  onChange(newValue);
                  console.log("Input Value Changed:", newValue);
                  // If this is a source field, update the selected source value
                  if (isSourceField(fieldName)) {
                    handleSourceSelection(fieldName, newValue, rowId);
                  }
                }}
                placeholder={required ? `${label} *` : label}
                style={{
                  height: "40px",
                  borderRadius: "4px",
                  width: "100%",
                  borderColor: hasError ? "#d32f2f" : "#ccc",
                }}
              />
              {hasError && (
                <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "2px" }}>
                  {label} is required
                </div>
              )}
            </div>
          );
        }
      },
    };
  };

  // Define source fields (fields that can have outgoing connections)
  // You need to define which fields in SAFETY can be sources
  const sourceFields = ['modeOfOperation', 'hazardCause', 'effectOfHazard']; // Add more as needed

  // Create columns using the new edit component
  const columns = [
    {
      render: (rowData) => `${rowData?.tableData?.id + 1}`,
      title: "Hazard*",
      cellStyle: { minWidth: "140px", textAlign: "center" },
      headerStyle: { minWidth: "140px", textAlign: "center" },
    },
    createEditComponent("modeOfOperation", "Mode of Operation", true),
    createEditComponent("hazardCause", "Hazard Cause", true),
    createEditComponent("effectOfHazard", "Effect of the Hazard", true),
    createEditComponent("hazardClasification", "Hazard Classification", true),
    createEditComponent("designAssuranceLevel", "Design Assurance Level (DAL) associated with the hazard"),
    createEditComponent("meansOfDetection", "Means of detection", true),
    createEditComponent("crewResponse", "Crew response", true),
    createEditComponent("uniqueHazardIdentifier", "Unique Hazard Identifiers", true),
    createEditComponent("initialSeverity", "Initial Severity ((impact))"),
    createEditComponent("initialLikelihood", "Initial likelihood (probability)"),
    createEditComponent("initialRiskLevel", "Initial Risk level"),
    createEditComponent("designMitigation", "Design Mitigation"),
    createEditComponent("designMitigatonResbiity", "Design Mitigation Responsibility"),
    createEditComponent("designMitigtonEvidence", "Design Mitigation Evidence"),
    createEditComponent("opernalMaintanMitigation", "Operational/Maintenance mitigation"),
    createEditComponent("opernalMitigatonResbility", "Opernational Mitigation Responsibility"),
    createEditComponent("operatnalMitigationEvidence", "Operational Mitigation Evidence"),
    createEditComponent("residualSeverity", "Residual Severity ((impact))"),
    createEditComponent("residualLikelihood", "Residual likelihood (probability)"),
    createEditComponent("residualRiskLevel", "Residual Risk Level"),
    createEditComponent("hazardStatus", "Hazard Status"),
    createEditComponent("ftaNameId", "FTA Name/ID"),
    createEditComponent("userField1", "User field 1"),
    createEditComponent("userField2", "User field 2"),
  ];

  const submit = (values) => {
    if (productId) {
      const companyId = localStorage.getItem("companyId");
      setIsLoading(true);
      Api.post("api/v1/safety/", {
        modeOfOperation: values.modeOfOperation || data.modeOfOperation,
        hazardCause: values.hazardCause || data.hazardCause,
        effectOfHazard: values.effectOfHazard || data.effectOfHazard,
        hazardClasification: values.hazardClasification || data.hazardClasification,
        designAssuranceLevel: values.designAssuranceLevel,
        meansOfDetection: values.meansOfDetection || data.meansOfDetection,
        crewResponse: values.crewResponse || data.crewResponse,
        uniqueHazardIdentifier: values.uniqueHazardIdentifier || data.uniqueHazardIdentifier,
        initialSeverity: values.initialSeverity || data.initialSeverity,
        initialLikelihood: values.initialLikelihood || data.initialLikelihood,
        initialRiskLevel: values.initialRiskLevel || data.initialRiskLevel,
        designMitigation: values.designMitigation || 1,
        designMitigatonResbiity: values.designMitigatonResbiity || data.designMitigatonResbiity,
        designMitigtonEvidence: values.designMitigtonEvidence || data.designMitigtonEvidence,
        opernalMaintanMitigation: values.opernalMaintanMitigation || data.opernalMaintanMitigation,
        opernalMitigatonResbility: values.opernalMitigatonResbility || data.opernalMitigatonResbility,
        operatnalMitigationEvidence: values.operatnalMitigationEvidence || data.operatnalMitigationEvidence,
        residualSeverity: values.residualSeverity || data.residualSeverity,
        residualLikelihood: values.residualLikelihood || data.residualLikelihood,
        residualRiskLevel: values.residualRiskLevel || data.residualRiskLevel,
        hazardStatus: values.hazardStatus || data.hazardStatus,
        ftaNameId: values.ftaNameId || data.ftaNameId,
        userField1: values.userField1 || data.userField1,
        userField2: values.userField2 || data.userField2,
        projectId: projectId,
        companyId: companyId,
        productId: productId,
        userId: userId,
      })
        .then((response) => {
          getProductData();
          setIsLoading(false);
        })
        .catch((error) => {
          const errorStatus = error?.response?.status;
          if (errorStatus === 401) {
            logout();
          }
        });
    } else {
      setProductModal(true);
    }
  };

  const updateSafety = (values) => {
    const companyId = localStorage.getItem("companyId");
    setIsLoading(true);
    Api.patch("api/v1/safety/update", {
      modeOfOperation: values.modeOfOperation,
      hazardCause: values.hazardCause,
      effectOfHazard: values.effectOfHazard,
      hazardClasification: values.hazardClasification,
      designAssuranceLevel: values.designAssuranceLevel,
      meansOfDetection: values.meansOfDetection,
      crewResponse: values.crewResponse,
      uniqueHazardIdentifier: values.uniqueHazardIdentifier,
      initialSeverity: values.initialSeverity,
      initialLikelihood: values.initialLikelihood,
      initialRiskLevel: values.initialRiskLevel,
      designMitigation: values.designMitigation,
      designMitigatonResbiity: values.designMitigatonResbiity,
      designMitigtonEvidence: values.designMitigtonEvidence,
      opernalMaintanMitigation: values.opernalMaintanMitigation,
      opernalMitigatonResbility: values.opernalMitigatonResbility,
      operatnalMitigationEvidence: values.operatnalMitigationEvidence,
      residualSeverity: values.residualSeverity,
      residualLikelihood: values.residualLikelihood,
      residualRiskLevel: values.residualRiskLevel,
      hazardStatus: values.hazardStatus,
      ftaNameId: values.ftaNameId,
      userField1: values.userField1,
      userField2: values.userField2,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      safetyId: values?.id,
      userId: userId,
    })
      .then((response) => {
        getProductData();
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const deleteSafetyData = (value) => {
    setIsLoading(true);
    const rowId = value?.id;
    Api.delete(`api/v1/safety/${rowId}`, { headers: { userId: userId } })
      .then((res) => {
        getProductData();
        setShow(true);
        getTreeData();
        Modalopen();
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  return (
    <div className="mx-4" style={{ marginTop: "90px" }}>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "30%", marginRight: "20px" }}>
              <Projectname projectId={projectId} />
            </div>

            <div style={{ width: "100%", marginRight: "20px" }}>
              <Dropdown
                value={projectId}
                productId={productId}
                data={treeTableData}
              />
            </div>

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: "8px",
              height: "40px",
            }}>
              {writePermission === true || 
               writePermission === "undefined" || 
               role === "admin" || 
               (isOwner === true && createdBy === userId) ? (
                <>
                  <Tooltip placement="right" title="Import Excel">
                    <div style={{ marginRight: "8px" }}>
                      <label
                        htmlFor="file-input"
                        className="import-export-btn"
                        style={{ cursor: "pointer" }}
                      >
                        <FontAwesomeIcon icon={faFileDownload} />
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
                  
                  <Tooltip placement="left" title="Export Excel">
                    <Button
                      className="import-export-btn"
                      style={{ 
                        marginLeft: "10px", 
                        borderStyle: "none", 
                        width: "40px", 
                        minWidth: "40px", 
                        padding: "0px",
                        cursor: "pointer"
                      }}
                      onClick={() => DownloadExcel()}
                    >
                      <FontAwesomeIcon icon={faFileUpload} style={{ width: "15px" }} />
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip placement="right" title="Import disabled">
                    <div style={{ marginRight: "8px", opacity: 0.5 }}>
                      <div className="import-export-btn" style={{ cursor: "not-allowed" }}>
                        <FontAwesomeIcon icon={faFileDownload} />
                      </div>
                    </div>
                  </Tooltip>
                  
                  <Tooltip placement="left" title="Export disabled">
                    <Button
                      className="import-export-btn"
                      style={{ 
                        marginLeft: "10px", 
                        borderStyle: "none", 
                        width: "40px", 
                        minWidth: "40px", 
                        padding: "0px",
                        cursor: "not-allowed",
                        opacity: 0.5
                      }}
                      disabled
                    >
                      <FontAwesomeIcon icon={faFileUpload} style={{ width: "15px" }} />
                    </Button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 " style={{ bottom: "35px" }}>
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
                            submit(newRow);
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
                            updateSafety(newRow);
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
                            deleteSafetyData(selectedRow);
                            resolve();
                          })
                      : null,
                }}
                title="Safety"
                icons={tableIcons}
                columns={columns}
                data={tableData}
                options={{
                  addRowPosition: "first",
                  actionsColumnIndex: -1,
                  headerStyle: {
                    backgroundColor: "#CCE6FF",
                    zIndex: 0,
                  },
                }}
                localization={{
                  body: {
                    addTooltip: "Add Safety",
                  },
                }}
              />
            </ThemeProvider>
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
              {writePermission === true || writePermission === undefined ? (
                <div>
                  <h5 className="text-center">
                    Please select product from <b>Dropdown </b>before adding a
                    new row!
                  </h5>
                  <Button
                    className="save-btn fw-bold fmeca-button mt-3"
                    onClick={() => setProductModal(false)}
                  >
                    OK
                  </Button>
                </div>
              ) : (
                <div>
                  <h5 className="fmeca-button">
                    Not
                    <br /> Allowed
                  </h5>
                  <Button
                    className="save-btn fw-bold ok-buttons"
                    onClick={() => setFailureModeRatioError(false)}
                  >
                    OK
                  </Button>
                </div>
              )}
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </div>
  );
}

export default Index;