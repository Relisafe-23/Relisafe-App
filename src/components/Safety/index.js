import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import { Modal, Button, Row, Col } from "react-bootstrap";
import "../../css/FMECA.scss";
import Api from "../../Api";
import { tableIcons } from "../core/TableIcons";
import { ThemeProvider } from "@material-ui/core/styles";
import { createTheme } from "@material-ui/core/styles";
//import Tree from "../Tree";
import Dropdown from "../Company/Dropdown";
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
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState();
  const [colDefs, setColDefs] = useState();
  const [treeData, setTreeData] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const handleClose = () => setProductModal(true);
  const [writePermission, setWritePermission] = useState();
  const [treeTableData, setTreeTabledata] = useState([]);
  const userId = localStorage.getItem("userId");
  const history = useHistory();
  const [operationPhase, setOperationPhase] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [companyId, setCompanyId] = useState();
  const [allSepareteData, setAllSepareteData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const role = localStorage.getItem("role");
  const handleHide = () => setFailureModeRatioError(false);
  const [failureModeRatioError, setFailureModeRatioError] = useState(false);

  const DownloadExcel = () => {
    // Assuming 'tableData' is an array of objects, and you want to remove multiple columns
    const columnsToRemove = [
      "projectId",
      "companyId",
      "productId",
      "id",
      "tableData",
      "operatingPhase",
    ];
    // Create a new array with the unwanted columns removed from each object
    const modifiedTableData = tableData.map((row) => {
      const newRow = { ...row };
      columnsToRemove.forEach((columnName) => {
        delete newRow[columnName];
      });

      // rowsToRemove.forEach(rowName=>{
      //   delete columns[rowName]
      // });

      return newRow;
    });
    if (modifiedTableData.length > 0) {
      const columns = Object.keys(modifiedTableData[0]).map((columnName) => ({
        title: columnName,
        field: columnName,
      }));

      const workSheet = XLSX.utils.json_to_sheet(modifiedTableData, {
        skipHeader: false,
      });
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "safety Data");

      const buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });

      // Create a Blob object and initiate a download
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Safety_Data.xlsx";
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
  const createsafetyDataFromExcel = (values) => {
    const companyId = localStorage.getItem("companyId");

    setIsLoading(true);
    Api.post("api/v1/safety/", {
      operatingPhase: values.operatingPhase,
      function: values.function,
      failureMode: values.failureMode,
      // searchFM: values.searchFM,
      cause: values.cause,
      failureModeRatioAlpha: values.failureModeRatioAlpha
        ? values.failureModeRatioAlpha
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
      if (status === 204) {
        setFailureModeRatioError(true);
      }
      getProductData();
      setIsLoading(false);
    });
    // rows.push(rowData);
    // createsafetyDataFromExcel(rowData);
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
      fileData.splice(0, 1);
      convertToJson(headers, fileData);
    };
    reader.readAsBinaryString(file);
  };

  const [allConnectedData, setAllConnectedData] = useState([]);
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
      [name]: selectedItems ? selectedItems.value : "", // Assuming you want to store the selected value
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
        (item) => item?.moduleName === "FMECA"
      );

      if (filteredData.length === 0) {
        filteredData = res?.data?.data.filter(
          (item) => item?.moduleName === "SAFETY"
        );
      }
      setAllSepareteData(filteredData);
      const merged = [...tableData, ...filteredData];
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

  // Log out
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
        (entry) => entry?.libraryId?.moduleName === "SAFETY"
      );
      setConnectData(filteredData);
    });
  };

  useEffect(() => {
    getAllConnect();
  }, []);

  const [connectData, setConnectData] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState();
  const filterCondition = (item) => {
    // Replace this condition with your specific logic involving selectedFunction
    return item.sourceValue === selectedFunction?.value;
  };
  const [connectedValues, setConnectedValues] = useState([]);

  const [selectedField, setSelectedField] = useState(null);
  // Initialize an empty options object
  const dropdownOptions = {};

  // Define an array of field names for which you want to generate options
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
  ]; // Add other field names as needed

  // Loop through the field names to generate options
  fieldNames.forEach((fieldName) => {
    // Filter the connectData for the current field
    const filteredData =
      connectData?.filter((item) => item?.sourceName === fieldName) || [];
    // Map the filtered data to the options format
    dropdownOptions[fieldName] = filteredData.map((item) => ({
      value: item?.sourceValue,
      label: item?.sourceValue,
    }));
  });

  useEffect(() => {
    // Filter connectData based on the current selectedFunction
    const filteredValues = connectData?.filter(filterCondition) || [];
    setConnectedValues(filteredValues);
  }, [connectData, selectedFunction]);

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
      if (data.length > 0) {
        setAllConnectedData(data);
      } else {
        // If no FMECA data, fetch SAFETY data
        fetchSafetyData();
      }
      setAllConnectedData(data);
    });
  };
  const fetchSafetyData = async (fieldValue, fieldName) => {
    try {
      const safetyResponse = await Api.get(
        "api/v1/library/get/all/source/value",
        {
          params: {
            projectId: projectId,
            moduleName: "SAFETY",
            sourceName: fieldName,
            sourceValue: fieldValue.value,
          },
        }
      );
      const safetyData = safetyResponse?.data?.libraryData;
      setAllConnectedData(safetyData);
    } catch (error) {
      console.error("Error fetching SAFETY data:", error);
      // Optionally handle the error
    }
  };

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

      // Check if any option is selected in any dropdown
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

  // Reset the state when another dropdown is selected
  const handleDropdownSelection = (fieldName) => {
    setSelectedField(fieldName);
    setSelectedFunction(null);
  };
  const columns = [
    {
      render: (rowData) => `${rowData?.tableData?.id + 1}`,
      title: "FMECA ID",
      cellStyle: { minWidth: "140px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
    },
    {
      field: "operatingPhase",
      title: "Operating  Phase",
      type: "string",
      cellStyle: { minWidth: "200px", textAlign: "center" },
      headerStyle: { textAlign: "center", minWidth: "150px" },
      onCellClick: () => handleDropdownSelection("operatingPhase"),
      editComponent: ({ value, onChange, rowData }) => {
        const filteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "operatingPhase"
          ) || [];
        const options = filteredData?.map((item) => ({
          value: item?.sourceValue,
          label: item?.sourceValue,
        }));
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
              value={
                data.operatingPhase
                  ? { label: data.operatingPhase, value: data.operatingPhase }
                  : ""
              }
              onChange={(selectedItems) => {
                handleInputChange(selectedItems, "operatingPhase");
                getAllConnectedLibrary(selectedItems, "operatingPhase");
              }}
              options={options}
            />
          );
        }
      },
    },
    {
      field: "function",
      title: "Function*",
      type: "string",
      cellStyle: { minWidth: "50px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Failure Mode Ratio Alpha"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Failure Mode Ratio Alpha"
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px", textAlign: "left" },
      headerStyle: { textAlign: "left" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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
      cellStyle: { minWidth: "230px" },
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

  const submit = (values) => {
    if (productId) {
      const companyId = localStorage.getItem("companyId");
      setIsLoading(true);
      Api.post("api/v1/safety/", {
        operatingPhase: values.operatingPhase
          ? values.operatingPhase
          : data.operatingPhase,
        function: values.function ? values.function : data.function,
        failureMode: values.failureMode ? values.failureMode : data.failureMode,
        // searchFM: values.searchFM ? values.searchFM : data.searchFM,
        cause: values.cause ? values.cause : data.cause,
        failureModeRatioAlpha: values.failureModeRatioAlpha
          ? values.failureModeRatioAlpha
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
        referenceHazardId: values.referenceHazardId
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
    // const companyId = localStorage.getItem("companyId");
    // setIsLoading(true);
    // Api.post("api/v1/FMECA/", {
    //   operatingPhase: values.operatingPhase,
    //   function: values.function,
    //   failureMode: values.failureMode,
    //   searchFM: values.searchFM,
    //   cause: values.cause,
    //   failureModeRatioAlpha: values.failureModeRatioAlpha,
    //   detectableMeansDuringOperation: values.detectableMeansDuringOperation,
    //   detectableMeansToMaintainer: values.detectableMeansToMaintainer,
    //   BuiltInTest: values.BuiltInTest,
    //   subSystemEffect: values.subSystemEffect,
    //   systemEffect: values.systemEffect,
    //   endEffect: values.endEffect,
    //   endEffectRatioBeta: values.endEffectRatioBeta,
    //   safetyImpact: values.safetyImpact,
    //   referenceHazardId: values.referenceHazardId,
    //   realibilityImpact: values.realibilityImpact,
    //   serviceDisruptionTime: values.serviceDisruptionTime,
    //   frequency: values.frequency,
    //   severity: values.severity,
    //   riskIndex: values.riskIndex,
    //   designControl: values.designControl,
    //   maintenanceControl: values.maintenanceControl,
    //   exportConstraints: values.exportConstraints,
    //   immediteActionDuringOperationalPhase:
    //     values.immediteActionDuringOperationalPhase,
    //   immediteActionDuringNonOperationalPhase:
    //     values.immediteActionDuringNonOperationalPhase,
    //   userField1: values.userField1,
    //   userField2: values.userField2,
    //   userField3: values.userField3,
    //   userField4: values.userField4,
    //   userField5: values.userField5,
    //   userField6: values.userField6,
    //   userField7: values.userField7,
    //   userField8: values.userField8,
    //   userField9: values.userField9,
    //   userField10: values.userField10,
    //   projectId: projectId,
    //   companyId: companyId,
    //   productId: productId,
    // }).then((response) => {
    //   getProductData();
    //   setIsLoading(false);
    // });
  };

  const updateSafety = (values) => {
    const companyId = localStorage.getItem("companyId");
    setIsLoading(true);
    Api.patch("api/v1/safety/update", {
      operatingPhase: values.operatingPhase,
      function: values.function,
      failureMode: values.failureMode,
      // searchFM: values.searchFM,

      failureModeRatioAlpha: values.failureModeRatioAlpha,
      cause: values.cause,

      detectableMeansDuringOperation: values.detectableMeansDuringOperation,
      detectableMeansToMaintainer: values.detectableMeansToMaintainer,
      BuiltInTest: values.BuiltInTest,
      subSystemEffect: values.subSystemEffect,
      systemEffect: values.systemEffect,
      endEffect: values.endEffect,
      endEffectRatioBeta: values.endEffectRatioBeta,
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
          <Projectname projectId={projectId} />

          {/* <Row>
            <Col>
              <label for="file-input" class="file-label file-inputs">
                Import
              </label>
              <input type="file" className="input-fields" id="file-input" onChange={importExcel} />
            </Col>
            <Col>
              <Button
                className="btn-aligne export-btns-FailureRate"
                onClick={() => {
                  DownloadExcel();
                }}
              >
                Export
              </Button>
            </Col>
          </Row> */}
          <div
            style={{
              display: "flex",
              marginTop: "8px",
              height: "40px",
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
          </div>

          {/* <input className="mt-3" type="file" onChange={importExcel} accept=".xlsx" /> */}
          <Dropdown value={projectId} productId={productId} />

          {/* <div className="mt-3">
            <Tree data={treeTableData} productId={productId} />
          </div> */}
          {/* <Tree data={treeData} productId={productId} /> */}

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
                //Export
                // action={[
                //   {
                //     icon: () => <Button>Export</Button>,
                //     tooltip: "Export to Excel",
                //     onClick: "DownloadExcel",
                //     isFreeAction: true,
                //   },
                // ]}

                // actions={[
                //   {
                //     icon: () => <Button className="export-btns">Export</Button>,
                //     tooltip: "Export to Excel",
                //     onClick: DownloadExcel,
                //     isFreeAction: true,
                //   },
                // ]}
                localization={{
                  body: {
                    addTooltip: "Add Safety",
                  },
                }}

                // actions={[
                //   {
                //     icon: tableIcons.Delete,
                //     tooltip: "Delete User",
                //     onClick: (event, rowData) => alert("You want to delete "),
                //   },
                //   {
                //     icon: tableIcons.Edit,
                //     tooltip: "Edit User",
                //     isFreeAction: true,
                //     onClick: (event, rowData) => alert("You want to edit a new row"),
                //   },
                //   {
                //     icon: tableIcons.Add,
                //     tooltip: "Add User",
                //     isFreeAction: true,
                //     onClick: (event) => alert("You want to add a new row"),
                //   },
                // ]}
              />
            </ThemeProvider>
          </div>
          <Modal show={show} centered className="user-delete-modal">
            <Modal.Body className="modal-body-user">
              <div>
                <h4 className="d-flex justify-content-center">
                  Row Deleted successfully
                </h4>
              </div>
            </Modal.Body>
            <Modal.Footer
              className=" d-flex justify-content-center"
              style={{ borderTop: 0, bottom: "30px" }}
            >
              <Button
                className="px-5 "
                style={{ backgroundColor: "#398935", borderColor: "#398935" }}
                onClick={() => setShow(false)}
              >
                ok
              </Button>
            </Modal.Footer>
          </Modal>
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
