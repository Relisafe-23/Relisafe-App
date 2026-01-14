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
import { TextField } from "@material-ui/core";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { Tooltip } from "@material-ui/core";
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
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState();
  const [treeData, setTreeData] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const [writePermission, setWritePermission] = useState();
  const [treeTableData, setTreeTabledata] = useState([]);
  const userId = localStorage.getItem("userId");
  const history = useHistory();
  const [modeOfOperation, setModeOfOperation] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [allSepareteData, setAllSepareteData] = useState([]);
  const role = localStorage.getItem("role");
  const [failureModeRatioError, setFailureModeRatioError] = useState(false);

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
      designAssuranceLevel: values.designAssuranceLevel ? values.designAssuranceLevel : 0,
      meansOfDetection: values.meansOfDetection,
      crewResponse: values.crewResponse,
      uniqueHazardIdentifier: values.uniqueHazardIdentifier,
      initialSeverity: values.initialSeverity,
      initialLikelihood: values.initialLikelihood,
      initialRiskLevel: values.initialRiskLevel,
      designMitigation: values.designMitigation ? values.designMitigation : 1,
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

  const [connectData, setConnectData] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState();
  const [connectedValues, setConnectedValues] = useState([]);
  const [selectedField, setSelectedField] = useState(null);

  // Helper function to get options for a field
  const getOptionsForField = (fieldName) => {
    // Get separate library data
    const seperateFilteredData = allSepareteData?.filter(
      (item) => item?.sourceName === fieldName
    ) || [];
    
    // Get connected data - check BOTH sourceName AND destinationName
    const connectedFilteredData = connectData?.filter(
      (item) => {
        return (
          (item?.sourceName === fieldName) || 
          (item?.destinationName === fieldName)
        );
      }
    ) || [];

    let options = [];
    
    // Add options from connected data
    if (connectedFilteredData.length > 0) {
      connectedFilteredData.forEach((item) => {
        if (item.sourceName === fieldName && item.sourceValue) {
          options.push({
            value: item.sourceValue,
            label: item.sourceValue,
          });
        }
        if (item.destinationName === fieldName && item.destinationValue) {
          options.push({
            value: item.destinationValue,
            label: item.destinationValue,
          });
        }
      });
    }
    
    // If no connected options, use separate data
    if (options.length === 0 && seperateFilteredData.length > 0) {
      options = seperateFilteredData.map((item) => ({
        value: item.sourceValue,
        label: item.sourceValue,
      }));
    }
    
    // Remove duplicates
    return Array.from(
      new Map(options.map(item => [item.value, item])).values()
    );
  };

  const getAllSeprateLibraryData = async () => {
    const companyId = localStorage.getItem("companyId");
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

  const getAllConnect = () => {
    setIsLoading(true);
    Api.get("api/v1/library/get/all/connect/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      setIsLoading(false);
      const filteredData = res.data.getData.filter(
        (entry) => entry?.libraryId?.moduleName === "SAFETY" || entry?.destinationModuleName === "SAFETY"
      );
      
      // Flatten the data for easier filtering
      const flattened = filteredData
        .flatMap((item) =>
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
      
      setConnectData(flattened);
    }).catch((error) => {
      console.error("Error fetching connect data:", error);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    getAllConnect();
  }, []);

  const getAllConnectedLibrary = async (fieldValue, fieldName) => {
    Api.get("api/v1/library/get/all/source/value", {
      params: {
        projectId: projectId,
        moduleName: "FMECA",
        destinationModule: "SAFETY",
        sourceName: fieldName,
        sourceValue: fieldValue.value,
      },
    }).then((res) => {
      const data = res?.data?.libraryData;
      if (data.length > 0) {
        // Handle connected data if needed
      }
    });
  };

  const handleDropdownSelection = (fieldName) => {
    setSelectedField(fieldName);
    setSelectedFunction(null);
  };

  // Helper component for dropdown columns
  const createDropdownColumn = (fieldName, title, required = false, type = "string") => ({
    field: fieldName,
    title: required ? `${title}*` : title,
    type: type,
    cellStyle: { minWidth: "200px", textAlign: "center" },
    headerStyle: { minWidth: "200px", textAlign: "center" },
    validate: required ? (rowData) => {
      if (!rowData[fieldName] || rowData[fieldName].toString().trim() === "") {
        return { isValid: false, helperText: `${title} is required` };
      }
      return true;
    } : undefined,
    onCellClick: () => handleDropdownSelection(fieldName),
    editComponent: ({ value, onChange }) => {
      const options = getOptionsForField(fieldName);
      
      if (options.length === 0) {
        return (
          <input
            type={type === "numeric" ? "number" : "text"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${title}`}
            style={{ height: "40px", borderRadius: "4px", width: "100%", padding: "8px" }}
          />
        );
      }
      
      return (
        <CreatableSelect
          value={value ? { label: value, value: value } : null}
          onChange={(selectedItems) => {
            onChange(selectedItems?.value || "");
            if (selectedItems) {
              getAllConnectedLibrary(selectedItems, fieldName);
            }
          }}
          onCreateOption={(inputValue) => {
            onChange(inputValue);
          }}
          options={options}
          isClearable
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '40px',
              borderRadius: '4px',
            }),
          }}
        />
      );
    },
  });

  const columns = [
    {
      render: (rowData) => `${rowData?.tableData?.id + 1}`,
      title: "Hazard*",
      cellStyle: { minWidth: "140px", textAlign: "center" },
      headerStyle: { minWidth: "140px", textAlign: "center" },
    },
    createDropdownColumn("modeOfOperation", "Mode of Operation", true),
    createDropdownColumn("hazardCause", "Hazard Cause", true),
    createDropdownColumn("effectOfHazard", "Effect of the Hazard", true),
    createDropdownColumn("hazardClasification", "Hazard Classification", true),
    createDropdownColumn("designAssuranceLevel", "Design Assurance Level (DAL) associated with the hazard"),
    createDropdownColumn("meansOfDetection", "Means of detection", true),
    createDropdownColumn("crewResponse", "Crew response", true),
    createDropdownColumn("uniqueHazardIdentifier", "Unique Hazard Identifiers", true),
    createDropdownColumn("initialSeverity", "Initial Severity (impact)"),
    createDropdownColumn("initialLikelihood", "Initial likelihood (probability)"),
    createDropdownColumn("initialRiskLevel", "Initial Risk level"),
    createDropdownColumn("designMitigation", "Design Mitigation"),
    createDropdownColumn("designMitigatonResbiity", "Design Mitigation Responsibility"),
    createDropdownColumn("designMitigtonEvidence", "Design Mitigation Evidence"),
    createDropdownColumn("opernalMaintanMitigation", "Operational/Maintenance mitigation"),
    createDropdownColumn("opernalMitigatonResbility", "Operational Mitigation Responsibility"),
    createDropdownColumn("operatnalMitigationEvidence", "Operational Mitigation Evidence"),
    createDropdownColumn("residualSeverity", "Residual Severity (impact)"),
    createDropdownColumn("residualLikelihood", "Residual likelihood (probability)"),
    createDropdownColumn("residualRiskLevel", "Residual Risk Level"),
    createDropdownColumn("hazardStatus", "Hazard Status"),
    createDropdownColumn("ftaNameId", "FTA Name/ID"),
    createDropdownColumn("userField1", "User field 1"),
    createDropdownColumn("userField2", "User field 2"),
  ];

  const submit = (values) => {
    if (productId) {
      const companyId = localStorage.getItem("companyId");
      setIsLoading(true);
      Api.post("api/v1/safety/", {
        modeOfOperation: values.modeOfOperation || "",
        hazardCause: values.hazardCause || "",
        effectOfHazard: values.effectOfHazard || "",
        hazardClasification: values.hazardClasification || "",
        designAssuranceLevel: values.designAssuranceLevel || "",
        meansOfDetection: values.meansOfDetection || "",
        crewResponse: values.crewResponse || "",
        uniqueHazardIdentifier: values.uniqueHazardIdentifier || "",
        initialSeverity: values.initialSeverity || "",
        initialLikelihood: values.initialLikelihood || "",
        initialRiskLevel: values.initialRiskLevel || "",
        designMitigation: values.designMitigation || 1,
        designMitigatonResbiity: values.designMitigatonResbiity || "",
        designMitigtonEvidence: values.designMitigtonEvidence || "",
        opernalMaintanMitigation: values.opernalMaintanMitigation || "",
        opernalMitigatonResbility: values.opernalMitigatonResbility || "",
        operatnalMitigationEvidence: values.operatnalMitigationEvidence || "",
        residualSeverity: values.residualSeverity || "",
        residualLikelihood: values.residualLikelihood || "",
        residualRiskLevel: values.residualRiskLevel || "",
        hazardStatus: values.hazardStatus || "",
        ftaNameId: values.ftaNameId || "",
        userField1: values.userField1 || "",
        userField2: values.userField2 || "",
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
        setIsLoading(false);
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
      safetyId: values.id,
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
                      <FontAwesomeIcon
                        icon={faFileUpload}
                        style={{ width: "15px" }}
                      />
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
                      <FontAwesomeIcon
                        icon={faFileUpload}
                        style={{ width: "15px" }}
                      />
                    </Button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>

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
            <Modal.Footer className="d-flex justify-content-center success-message mt-3 mb-4">
              <div>
                <h4 className="text-center">Row Deleted Successfully</h4>
              </div>
            </Modal.Footer>
          </Modal>

          <Modal show={productModal} centered onHide={() => setProductModal(false)}>
            <div className="d-flex justify-content-center mt-5">
              <FaExclamationCircle size={45} color="#de2222b0" />
            </div>
            <Modal.Footer className="d-flex justify-content-center success-message mb-4">
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


