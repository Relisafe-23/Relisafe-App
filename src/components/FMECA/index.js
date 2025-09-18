/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Modal, Button, Row, Col } from "react-bootstrap";
import "../../css/FMECA.scss";
import Api from "../../Api";
import { tableIcons } from "../core/TableIcons";
// import { ThemeProvider } from "@material-ui/core/styles";
// import { createTheme } from "@material-ui/core/styles";
// import Tree from "../Tree";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import { toast } from "react-toastify";
import {
  faFileDownload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

//import  XLSX from 'xlsx'

//import * as XLSX from "xlsx/xlsx";
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

function Index(props) {
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
      console.log("connected Library data", data)
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

  const DownloadExcel = () => {
    const columnsToRemove = ["projectId", "companyId", "productId", "id"];
    const modifiedTableData = tableData.map((row) => {
      const newRow = { ...row };
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
        type: "error", // Change this to "error" to display an error message
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

  const [connectData, setConnectData] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState();
  const filterCondition = (item) => {
    return item.sourceValue === selectedFunction?.value;
  };
  const [connectedValues, setConnectedValues] = useState([]);

  const [selectedField, setSelectedField] = useState(null);
  const dropdownOptions = {};
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

  // ...

  const handleDropdownSelection = (fieldName) => {
    setSelectedField(fieldName);
    setSelectedFunction(null);
  };

  const columns = [

    {
      render: (rowData) => `${rowData?.tableData?.id + 1}`,
      title: "FMECA ID",
    },
    {
      field: "operatingPhase",
      title: "Operating  Phases",
      type: "string",
      // cellStyle: { minWidth: "200px", textAlign: "center" },
      // headerStyle: { textAlign: "center", minWidth: "150px" },
      onCellClick: () => handleDropdownSelection("operatingPhase"),
      editComponent: ({ value, onChange, rowData }) => {
        const filteredData =
          allSepareteData?.filter((item) => item?.sourceName === "operatingPhase") || [];

        const options = filteredData.map((item) => ({
          value: item.sourceValue,
          label: item.sourceValue,
        }));

        const selectedOption = options.find((opt) => opt.value === value);

        const displayOption = selectedOption || (value ? { label: value, value: value } : null);


        if (options.length === 0) {
          return (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter Operating Phase"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Operating Phase"
            />
          );
        } else {
          return (
            <Select
              name="operatingPhase"
              value={displayOption}
              onChange={(selectedOption) => {
                console.log("selectedOptionselectedOption", selectedOption);
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
                })
              }}
            />
          );
        }
      }
      ,
    },
    {
      field: "function",
      title: "Function*",
      type: "string",
      // cellStyle: { minWidth: "50px", textAlign: "center" },
      // headerStyle: { textAlign: "center" },
      onCellClick: () => handleDropdownSelection("function"),
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "function") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "function"
          ) || [];


        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="function"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Function"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Function"
            />
          );
        }
        return (
          <Select
            name="function"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "function");
              getAllConnectedLibrary(selectedItems, "function");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "failureMode",
      title: "Failure Mode*",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "230px", textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "failureMode"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "failureMode"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="failureMode"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Failure Mode"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter FailureMode"
            />
          );
        }
        return (
          <Select
            name="failureMode"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "failureMode");
              getAllConnectedLibrary(selectedItems, "failureMode");
            }}
            options={options}
          />
        );
      },
      onCellClick: () => handleDropdownSelection("failureMode"),
    },
    // {
    //   field: "searchFM",
    //   title: "Search FM*",
    //   type: "string",
    //   headerStyle: { textAlign: "center" },
    //   cellStyle: { minWidth: "230px" },
    //   editComponent: ({ value, onChange }) => {
    //     const seperateFilteredData =
    //       allSepareteData?.filter((item) => item?.sourceName === "searchFM") ||
    //       [];
    //     const conncetedFilteredData =
    //       allConnectedData?.filter(
    //         (item) => item?.destinationName === "searchFM"
    //       ) || [];
    //     const options =
    //       conncetedFilteredData.length > 0
    //         ? conncetedFilteredData?.map((item) => ({
    //             value: item?.destinationValue,
    //             label: item?.destinationValue,
    //           }))
    //         : seperateFilteredData?.map((item) => ({
    //             value: item?.sourceValue,
    //             label: item?.sourceValue,
    //           }));
    //     if (!options || options.length === 0) {
    //       return (
    //         <input
    //           type="text"
    //           name="searchFM"
    //           value={value}
    //           onChange={(e) => {
    //             createDropdownEditComponent(e.target.value);
    //             onChange(e.target.value);
    //           }}
    //           placeholder="Enter Search FM"
    //           style={{ height: "40px", borderRadius: "4px" }}
    //           title="Enter Search FM"
    //         />
    //       );
    //     }
    //     return (
    //       <Select
    //         name="searchFM"
    //         value={value ? { label: value, value: value } : ""}
    //         onChange={(selectedItems) => {
    //           onChange(selectedItems?.value);
    //           handleInputChange(selectedItems, "searchFM");
    //           getAllConnectedLibrary(selectedItems, "searchFM");
    //         }}
    //         options={options}
    //       />
    //     );
    //   },
    //   onCellClick: () => handleDropdownSelection("searchFM"),
    // },
    {
      field: "failureModeRatioAlpha",
      title: "Failure Mode Ratio Alpha*",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "230px", textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "failureModeRatioAlpha"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "failureModeRatioAlpha"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="number"
              name="failureModeRatioAlpha"
              value={value?.failureModeRatioAlpha}

              placeholder="Enter Failure Mode Ratio Alpha"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Failure Mode Ratio Alpha"
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value


                );

              }}
            />
          );
        }
        return (
          <Select
            name="failureModeRatioAlpha"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "failureModeRatioAlpha");
              getAllConnectedLibrary(selectedItems, "failureModeRatioAlpha");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "detectableMeansDuringOperation",
      title: "Cause",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "cause") || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "cause"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="cause"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Cause"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Cause"
            />
          );
        }
        return (
          <Select
            name="cause"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "cause");
              getAllConnectedLibrary(selectedItems, "cause");
            }}
            options={options}
          />
        );
      },
    },

    {
      field: "subSystemEffect",
      title: "Sub System effect*",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "subSystemEffect"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "subSystemEffect"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="subSystemEffect"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Sub System effect"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Sub System effect"
            />
          );
        }
        return (
          <Select
            name="subSystemEffect"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "subSystemEffect");
              getAllConnectedLibrary(selectedItems, "subSystemEffect");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "systemEffect",
      title: "System Effect*",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "systemEffect"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "systemEffect"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="systemEffect"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter System Effect"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter System Effect"
            />
          );
        }
        return (
          <Select
            name="systemEffect"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "systemEffect");
              getAllConnectedLibrary(selectedItems, "systemEffect");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "endEffect",
      title: "End Effect*",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "endEffect") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "endEffect"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="endEffect"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter End Effect"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter End Effect"
            />
          );
        }
        return (
          <Select
            name="endEffect"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "endEffect");
              getAllConnectedLibrary(selectedItems, "endEffect");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "endEffectRatioBeta",
      title: "End Effect ratio Beta*(must be equal to 1)",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "endEffectRatioBeta"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "endEffectRatioBeta"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="endEffectRatioBeta"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter End Effect ratio Beta"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter End Effect ratio Beta"
            />
          );
        }
        return (
          <Select
            name="endEffectRatioBeta"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "endEffectRatioBeta");
              getAllConnectedLibrary(selectedItems, "endEffectRatioBeta");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "safetyImpact",
      title: "Safety Impact*",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      // validate: (rowData) => {
      //   if (rowData.safetyImpact === undefined || rowData.safetyImpact === "") {
      //     return "required";
      //   }
      //   return true;
      // },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "safetyImpact"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "safetyImpact"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="safetyImpact"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Safety Impact"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Safety Impact"
            />
          );
        }
        return (
          <Select
            name="safetyImpact"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "safetyImpact");
              getAllConnectedLibrary(selectedItems, "safetyImpact");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "referenceHazardId",
      title: "Reference Hazard ID",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "referenceHazardId"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "referenceHazardId"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="referenceHazardId"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Reference Hazard ID"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Reference Hazard ID"
            />
          );
        }
        return (
          <Select
            name="referenceHazardId"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "referenceHazardId");
              getAllConnectedLibrary(selectedItems, "referenceHazardId");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "realibilityImpact",
      title: "Reliability Impact*",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      // validate: (rowData) => {
      //   if (rowData.realibilityImpact === undefined || rowData.realibilityImpact === "") {
      //     return "required";
      //   }
      //   return true;
      // },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "realibilityImpact"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "realibilityImpact"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="realibilityImpact"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Reliability Impact"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Reliability Impact"
            />
          );
        }
        return (
          <Select
            name="realibilityImpact"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "realibilityImpact");
              getAllConnectedLibrary(selectedItems, "realibilityImpact");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "serviceDisruptionTime",
      title: "Service Disruption Time(minutes)",
      type: "numeric",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "serviceDisruptionTime"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "serviceDisruptionTime"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="serviceDisruptionTime"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Service Disruption Time"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Service Disruption Time"
            />
          );
        }
        return (
          <Select
            name="serviceDisruptionTime"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "serviceDisruptionTime");
              getAllConnectedLibrary(selectedItems, "serviceDisruptionTime");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "frequency",
      title: "Frequency",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "frequency") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "frequency"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="frequency"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Frequency"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Frequency"
            />
          );
        }
        return (
          <Select
            name="frequency"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "frequency");
              getAllConnectedLibrary(selectedItems, "frequency");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "severity",
      title: "Severity",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "severity") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "severity"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="severity"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Severity"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Severity"
            />
          );
        }
        return (
          <Select
            name="severity"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "severity");
              getAllConnectedLibrary(selectedItems, "severity");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "riskIndex",
      title: "Risk Index",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "riskIndex") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "riskIndex"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="riskIndex"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Risk Index"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Risk Index"
            />
          );
        }
        return (
          <Select
            name="riskIndex"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "riskIndex");
              getAllConnectedLibrary(selectedItems, "riskIndex");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "detectableMeansDuringOperation",
      title: "Detectable Means during operation",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "detectableMeansDuringOperation"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "detectableMeansDuringOperation"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="detectableMeansDuringOperation"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Detectable Means during operation"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Detectable Means during operation"
            />
          );
        }
        return (
          <Select
            name="detectableMeansDuringOperation"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(
                selectedItems,
                "detectableMeansDuringOperation"
              );
              getAllConnectedLibrary(
                selectedItems,
                "detectableMeansDuringOperation"
              );
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "detectableMeansToMaintainer",
      title: "Detectable Means to Maintainer",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "detectableMeansToMaintainer"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "detectableMeansToMaintainer"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="detectableMeansToMaintainer"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Detectable Means to Maintainer"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Detectable Means to Maintainer"
            />
          );
        }
        return (
          <Select
            name="detectableMeansToMaintainer"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "detectableMeansToMaintainer");
              getAllConnectedLibrary(
                selectedItems,
                "detectableMeansToMaintainer"
              );
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "BuiltInTest",
      title: "Built-in Test",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "BuiltInTest"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "BuiltInTest"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="BuiltInTest"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Built-in Test"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Built-in Test"
            />
          );
        }
        return (
          <Select
            name="BuiltInTest"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "BuiltInTest");
              getAllConnectedLibrary(selectedItems, "BuiltInTest");
            }}
            options={options}
          />
        );
      },
    },

    {
      field: "designControl",
      title: "Design Control",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "designControl"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "designControl"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="designControl"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Design Control"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Design Control"
            />
          );
        }
        return (
          <Select
            name="designControl"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "designControl");
              getAllConnectedLibrary(selectedItems, "designControl");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "maintenanceControl",
      title: "Maintenance Control",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "maintenanceControl"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "maintenanceControl"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="maintenanceControl"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Maintenance Control"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Maintenance Control"
            />
          );
        }
        return (
          <Select
            name="maintenanceControl"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "maintenanceControl");
              getAllConnectedLibrary(selectedItems, "maintenanceControl");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "exportConstraints",
      title: "Export constraints",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "exportConstraints"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "exportConstraints"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="exportConstraints"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Export constraints"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Export constraints"
            />
          );
        }
        return (
          <Select
            name="exportConstraints"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "exportConstraints");
              getAllConnectedLibrary(selectedItems, "exportConstraints");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "immediteActionDuringOperationalPhase",
      title: "Immediate Action during operational Phases",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) =>
              item?.sourceName === "immediteActionDuringOperationalPhase"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) =>
              item?.destinationName === "immediteActionDuringOperationalPhase"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="immediteActionDuringOperationalPhase"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Immediate Action during operational Phases"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Immediate Action during operational Phases"
            />
          );
        }
        return (
          <Select
            name="immediteActionDuringOperationalPhase"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(
                selectedItems,
                "immediteActionDuringOperationalPhase"
              );
              getAllConnectedLibrary(
                selectedItems,
                "immediteActionDuringOperationalPhase"
              );
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "immediteActionDuringNonOperationalPhase",
      title: "Immediate Action during Non-operational Phases",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) =>
              item?.sourceName === "immediteActionDuringNonOperationalPhase"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) =>
              item?.destinationName ===
              "immediteActionDuringNonOperationalPhase"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="immediteActionDuringNonOperationalPhase"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Immediate Action during Non-operational Phases"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Immediate Action during Non-operational Phases"
            />
          );
        }
        return (
          <Select
            name="immediteActionDuringNonOperationalPhase"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(
                selectedItems,
                "immediteActionDuringNonOperationalPhase"
              );
              getAllConnectedLibrary(
                selectedItems,
                "immediteActionDuringNonOperationalPhase"
              );
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField1",
      title: "User field 1",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField1"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField1"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField1"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 1"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 1"
            />
          );
        }
        return (
          <Select
            name="userField1"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField1");
              getAllConnectedLibrary(selectedItems, "userField1");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField2",
      title: "User field 2",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField2"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField2"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField2"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 2"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 2"
            />
          );
        }
        return (
          <Select
            name="userField2"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField2");
              getAllConnectedLibrary(selectedItems, "userField2");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField3",
      title: "User field 3",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField3"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField3"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField3"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 3"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 3"
            />
          );
        }
        return (
          <Select
            name="userField3"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField3");
              getAllConnectedLibrary(selectedItems, "userField3");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField4",
      title: "User field 4",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField4"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField4"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField4"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 4"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 4"
            />
          );
        }
        return (
          <Select
            name="userField4"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField4");
              getAllConnectedLibrary(selectedItems, "userField4");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField5",
      title: "User field 5",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField5"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField5"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField5"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 5"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 5"
            />
          );
        }
        return (
          <Select
            name="userField5"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField5");
              getAllConnectedLibrary(selectedItems, "userField5");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField6",
      title: "User field 6",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField6"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField6"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField6"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 6"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 6"
            />
          );
        }
        return (
          <Select
            name="userField6"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField6");
              getAllConnectedLibrary(selectedItems, "userField6");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField7",
      title: "User field 7",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField7"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField7"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField7"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 7"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 7"
            />
          );
        }
        return (
          <Select
            name="userField7"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField7");
              getAllConnectedLibrary(selectedItems, "userField7");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField8",
      title: "User field 8",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField8"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField8"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField8"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 8"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 8"
            />
          );
        }
        return (
          <Select
            name="userField8"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField8");
              getAllConnectedLibrary(selectedItems, "userField8");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField9",
      title: "User field 9",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField9"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField9"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField9"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 9"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 9"
            />
          );
        }
        return (
          <Select
            name="userField9"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField9");
              getAllConnectedLibrary(selectedItems, "userField9");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "userField10",
      title: "User field 10",
      type: "string",
      cellStyle: { minWidth: "230px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "userField10"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "userField10"
          ) || [];

        const options =
          conncetedFilteredData.length > 0
            ? conncetedFilteredData?.map((item) => ({
              value: item?.destinationValue,
              label: item?.destinationValue,
            }))
            : seperateFilteredData?.map((item) => ({
              value: item?.sourceValue,
              label: item?.sourceValue,
            }));
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="userField10"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter User field 10"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter User field 10"
            />
          );
        }
        return (
          <Select
            name="userField10"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "userField10");
              getAllConnectedLibrary(selectedItems, "userField10");
            }}
            options={options}
          />
        );
      },
    },
  ];


  const createFmeca = (values) => {

    console.log("created values", values)

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
      } else if (response?.status === 204) {
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
        // <div>
        //   <Projectname projectId={projectId} />
        // </div>

        <div>
          {/* <div
            style={{
              display: "flex",

              marginTop: "50px",
              marginBottom: "60px",
            }}
          >
            <Tooltip placement="left" title="Import">
              <Col>
                <label htmlFor="file-input" className="import-export-btn">
                  <FontAwesomeIcon icon={faFileDownload} />
                </label>
                <input
                  type="file"
                  className="input-fields"
                  id="file-input"
                  onChange={importExcel}
                />
              </Col>
            </Tooltip>
            
            <Tooltip placement="left" title="Export">
              <Button
                className="import-export-btn"
                onClick={() => {
                  DownloadExcel();
                }}
              >
                <FontAwesomeIcon icon={faFileUpload} style={{ width: "15" }} />
              </Button>
            </Tooltip>
          </div> */}
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

          {/* <input className="mt-3" type="file" onChange={importExcel} accept=".xlsx" /> */}

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
                  // options={{
                  //   cellStyle: { border: "1px solid #eee" },
                  //   addRowPosition: "first",
                  //   actionsColumnIndex: -1,
                  //   headerStyle: {
                  //     backgroundColor: "#CCE6FF",
                  //     border: "1px solid red",
                  //     height: '10px',

                  //   },
                  // exportButton: { csv: true },
                  // }}
                  options={{
                    cellStyle: {
                      border: "1px solid #eee",
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    },
                    addRowPosition: "first",
                    actionsColumnIndex: -1,
                    pageSize: 5,
                    pageSizeOptions: [5, 10, 20, 50],
                    headerStyle: {
                      backgroundColor: "#CCE6FF",
                      fontWeight: "bold",
                      zIndex: 0,
                      whiteSpace: 'nowrap',       // prevent line wrap
                      minWidth: 200,              // or width: 200
                      maxWidth: 300,
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
