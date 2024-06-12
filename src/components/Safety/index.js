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
  const [modeOfOperation, setModeOfOperation] = useState();
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
      "modeOfOperation",
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
      residualSeverity: values.residualresidualSeverity,
      residualLikelihood: values.residualLikelihood,
      residualRiskLevel: values.residualRiskLevel,
      hazardStatus: values.hazardStatus,
      ftaNameId: values.ftaNameId,
      userField1:
        values.userField1,
      userField2:
        values.userField2,
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
    "modeOfOperation",
    "hazardCause",
    "effectOfHazard",
    "designAssuranceLevel",
    "hazardClasification",
    "initialSeverity",
    "initialLikelihood",
    "initialRiskLevel",
    "designMitigation",
    "designMitigatonResbiity",
    "designMitigtonEvidence",
    "opernalMaintanMitigation",
    "opernalMitigatonResbility",
    "operatnalMitigationEvidence",
    "residualSeverity",
    "residualLikelihood",
    "meansOfDetection",
    "crewResponse",
    "uniqueHazardIdentifier",
    "residualRiskLevel",
    "hazardStatus",
    "ftaNameId",
    "userField1",
    "userField2",
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
      title: "Hazard*",
      cellStyle: { minWidth: "140px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
    },
    {
      field: "modeOfOperation",
      title: "Mode of Operation*",
      type: "string",
      cellStyle: { minWidth: "200px", textAlign: "center" },
      headerStyle: { textAlign: "center", minWidth: "150px" },
      onCellClick: () => handleDropdownSelection("modeOfOperation"),
      editComponent: ({ value, onChange, rowData }) => {
        const filteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "modeOfOperation"
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
              placeholder="Enter Mode of Operation"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Mode of Operation"
            />
          );
        } else {
          return (
            <Select
              name="modeOfOperation"
              value={
                data.modeOfOperation
                  ? { label: data.modeOfOperation, value: data.modeOfOperation }
                  : ""
              }
              onChange={(selectedItems) => {
                handleInputChange(selectedItems, "modeOfOperation");
                getAllConnectedLibrary(selectedItems, "modeOfOperation");
              }}
              options={options}
            />
          );
        }
      },
    },
    {
      field: "hazardCause",
      title: "Hazard Cause*",
      type: "string",
      cellStyle: { minWidth: "50px", textAlign: "center" },
      headerStyle: { textAlign: "center" },
      onCellClick: () => handleDropdownSelection("hazardCause"),
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "hazardCause") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "hazardCause"
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
              name="hazardCause"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Hazard Cause"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Hazard Cause"
            />
          );
        }
        return (
          <Select
            name="hazardCause"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "hazardCause");
              getAllConnectedLibrary(selectedItems, "hazardCause");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "effectOfHazard",
      title: "Effect of the Hazard*",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "effectOfHazard"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "effectOfHazard"
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
              name="effectOfHazard"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Effect Of The Hazard"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter effectOfHazard"
            />
          );
        }
        return (
          <Select
            name="effectOfHazard"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "effectOfHazard");
              getAllConnectedLibrary(selectedItems, "effectOfHazard");
            }}
            options={options}
          />
        );
      },
      onCellClick: () => handleDropdownSelection("effectOfHazard"),
    },
    {
      field: "hazardClasification",
      title: "Hazard Clasification*",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "hazardClasification"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "hazardClasification"
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
              name="hazardClasification"
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
            name="hazardClasification"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "hazardClasification");
              getAllConnectedLibrary(selectedItems, "hazardClasification");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "designAssuranceLevel",
      title: "Design Assurance Level (DAL) associated with the hazard",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "designAssuranceLevel") || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "designAssuranceLevel"
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
              name="designAssuranceLevel"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Design Assurance Level"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Design Assurance Level"
            />
          );
        }
        return (
          <Select
            name="designAssuranceLevel"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "designAssuranceLevel");
              getAllConnectedLibrary(selectedItems, "designAssuranceLevel");
            }}
            options={options}
          />
        );
      },
    },

    {
      field: "meansOfDetection",
      title: "Means of detection*",
      type: "string",
      cellStyle: { minWidth: "230px" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "meansOfDetection"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "meansOfDetection"
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
              name="meansOfDetection"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Means of detection"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Means of detection"
            />
          );
        }
        return (
          <Select
            name="meansOfDetection"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "meansOfDetection");
              getAllConnectedLibrary(selectedItems, "meansOfDetection");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "crewResponse",
      title: "Crew response*",
      type: "string",
      cellStyle: { minWidth: "230px" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "crewResponse"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "crewResponse"
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
              name="crewResponse"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Crew Response"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Crew Response"
            />
          );
        }
        return (
          <Select
            name="crewResponse"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "crewResponse");
              getAllConnectedLibrary(selectedItems, "crewResponse");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "uniqueHazardIdentifier",
      title: "Unique Hazard Identifiers*",
      type: "string",
      cellStyle: { minWidth: "230px" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "uniqueHazardIdentifier") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "uniqueHazardIdentifier"
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
              name="uniqueHazardIdentifier"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Unique Hazard Identifiers"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter End Effect"
            />
          );
        }
        return (
          <Select
            name="uniqueHazardIdentifier"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "uniqueHazardIdentifier");
              getAllConnectedLibrary(selectedItems, "uniqueHazardIdentifier");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "initialSeverity",
      title: "Initial Severity ((impact))",
      type: "string",
      cellStyle: { minWidth: "230px" },
      headerStyle: { textAlign: "center" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "initialSeverity"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "initialSeverity"
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
              name="initialSeverity"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Initial Severity"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Initial Severity"
            />
          );
        }
        return (
          <Select
            name="initialSeverity"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "initialSeverity");
              getAllConnectedLibrary(selectedItems, "initialSeverity");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "initialLikelihood",
      title: "Initial likelihood (probability)",
      type: "string",
      cellStyle: { minWidth: "230px" },
      headerStyle: { textAlign: "center" },
      // validate: (rowData) => {
      //   if (rowData.designMitigatonResbiity === undefined || rowData.designMitigatonResbiity === "") {
      //     return "required";
      //   }
      //   return true;
      // },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "initialLikelihood"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "initialLikelihood"
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
              name="initialLikelihood"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Initial Likelihood"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Initial Likelihood"
            />
          );
        }
        return (
          <Select
            name="initialLikelihood"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "initialLikelihood");
              getAllConnectedLibrary(selectedItems, "initialLikelihood");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "initialRiskLevel",
      title: "Initial Risk level",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "initialRiskLevel"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "initialRiskLevel"
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
              name="initialRiskLevel"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Initial Risk level"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Initial Risk level"
            />
          );
        }
        return (
          <Select
            name="initialRiskLevel"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "initialRiskLevel");
              getAllConnectedLibrary(selectedItems, "initialRiskLevel");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "designMitigation",
      title: "Design Mitigation",
      type: "string",
      cellStyle: { minWidth: "230px" },
      headerStyle: { textAlign: "center" },
      // validate: (rowData) => {
      //   if (rowData.opernalMaintanMitigation === undefined || rowData.opernalMaintanMitigation === "") {
      //     return "required";
      //   }
      //   return true;
      // },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "designMitigation"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "designMitigation"
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
              name="designMitigation"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Design mitigation"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Design mitigation"
            />
          );
        }
        return (
          <Select
            name="designMitigation"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "designMitigation");
              getAllConnectedLibrary(selectedItems, "designMitigation");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "designMitigatonResbiity",
      title: "Design Mitigation Responsibility",
      type: "numeric",
      cellStyle: { minWidth: "230px", textAlign: "left" },
      headerStyle: { textAlign: "left" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "designMitigatonResbiity"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "designMitigatonResbiity"
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
              name="designMitigatonResbiity"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Design Mitigation Responsibility"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Design Mitigation Responsibility"
            />
          );
        }
        return (
          <Select
            name="designMitigatonResbiity"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "designMitigatonResbiity");
              getAllConnectedLibrary(selectedItems, "designMitigatonResbiity");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "designMitigtonEvidence",
      title: "Design Mitigation Evidence",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "designMitigtonEvidence") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "designMitigtonEvidence"
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
              name="designMitigtonEvidence"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Design Mitigation Evidence"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Design Mitigation Evidence"
            />
          );
        }
        return (
          <Select
            name="designMitigtonEvidence"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "designMitigtonEvidence");
              getAllConnectedLibrary(selectedItems, "designMitigtonEvidence");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "opernalMaintanMitigation",
      title: "Operational/Maintenance mitigation",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "opernalMaintanMitigation") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "opernalMaintanMitigation"
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
              name="opernalMaintanMitigation"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Operational/Maintenance mitigation"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Operational/Maintenance mitigation"
            />
          );
        }
        return (
          <Select
            name="opernalMaintanMitigation"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "opernalMaintanMitigation");
              getAllConnectedLibrary(selectedItems, "opernalMaintanMitigation");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "opernalMitigatonResbility",
      title: "Opernational Mitigation Responsibility",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "opernalMitigatonResbility") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "opernalMitigatonResbility"
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
              name="opernalMitigatonResbility"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Opernational Mitigation Responsibility"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Opernational Mitigation Responsibility"
            />
          );
        }
        return (
          <Select
            name="opernalMitigatonResbility"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "opernalMitigatonResbility");
              getAllConnectedLibrary(selectedItems, "opernalMitigatonResbility");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "operatnalMitigationEvidence",
      title: "Operational Mitigation Evidence",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "operatnalMitigationEvidence"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "operatnalMitigationEvidence"
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
              name="operatnalMitigationEvidence"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Operational Mitigation Evidence"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Operational Mitigation Evidence"
            />
          );
        }
        return (
          <Select
            name="operatnalMitigationEvidence"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(
                selectedItems,
                "operatnalMitigationEvidence"
              );
              getAllConnectedLibrary(
                selectedItems,
                "operatnalMitigationEvidence"
              );
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "residualSeverity",
      title: "Residual Severity ((impact))",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "residualSeverity"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "residualSeverity"
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
              name="residualSeverity"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Residual Severity"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Residual Severity"
            />
          );
        }
        return (
          <Select
            name="residualSeverity"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "residualSeverity");
              getAllConnectedLibrary(
                selectedItems,
                "residualSeverity"
              );
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "residualLikelihood",
      title: "Residual likelihood (probability)",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "residualLikelihood"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "residualLikelihood"
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
              name="residualLikelihood"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Residual likelihood"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Residual likelihood"
            />
          );
        }
        return (
          <Select
            name="residualLikelihood"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "residualLikelihood");
              getAllConnectedLibrary(selectedItems, "residualLikelihood");
            }}
            options={options}
          />
        );
      },
    },

    {
      field: "residualRiskLevel",
      title: "Residual Risk Level",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "residualRiskLevel"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "residualRiskLevel"
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
              name="residualRiskLevel"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Residual Risk Level"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Residual Risk Level"
            />
          );
        }
        return (
          <Select
            name="residualRiskLevel"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "residualRiskLevel");
              getAllConnectedLibrary(selectedItems, "residualRiskLevel");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "hazardStatus",
      title: "Hazard Status",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "hazardStatus"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "hazardStatus"
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
              name="hazardStatus"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter Hazard Status"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter Hazard Status"
            />
          );
        }
        return (
          <Select
            name="hazardStatus"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "hazardStatus");
              getAllConnectedLibrary(selectedItems, "hazardStatus");
            }}
            options={options}
          />
        );
      },
    },
    {
      field: "ftaNameId",
      title: "FTA Name/ID",
      type: "string",
      cellStyle: { minWidth: "230px" },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "ftaNameId"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "ftaNameId"
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
              name="ftaNameId"
              value={value}
              onChange={(e) => {
                createDropdownEditComponent(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter FTA Name/ID"
              style={{ height: "40px", borderRadius: "4px" }}
              title="Enter FTA Name/ID"
            />
          );
        }
        return (
          <Select
            name="ftaNameId"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "ftaNameId");
              getAllConnectedLibrary(selectedItems, "ftaNameId");
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
  ];

  const submit = (values) => {
    if (productId) {
      const companyId = localStorage.getItem("companyId");
      setIsLoading(true);
      Api.post("api/v1/safety/", {
        modeOfOperation: values.modeOfOperation
          ? values.modeOfOperation
          : data.modeOfOperation,
        hazardCause: values.hazardCause ? values.hazardCause : data.hazardCause,
        effectOfHazard: values.effectOfHazard ? values.effectOfHazard : data.effectOfHazard,
        hazardClasification: values.hazardClasification ? values.hazardClasification : data.hazardClasification,
        designAssuranceLevel: values.designAssuranceLevel
          ? values.designAssuranceLevel
          : 1,
        meansOfDetection: values.meansOfDetection
          ? values.meansOfDetection
          : data.meansOfDetection,
        crewResponse: values.crewResponse
          ? values.crewResponse
          : data.crewResponse,
        uniqueHazardIdentifier: values.uniqueHazardIdentifier ? values.uniqueHazardIdentifier : data.uniqueHazardIdentifier,
        initialSeverity: values.initialSeverity
          ? values.initialSeverity
          : data.initialSeverity,
        initialLikelihood: values.initialLikelihood
          ? values.initialLikelihood
          : data.initialLikelihood,
        initialRiskLevel: values.initialRiskLevel ? values.initialRiskLevel : data.initialRiskLevel,
        designMitigation: values.designMitigation
          ? values.designMitigation
          : 1,
        designMitigatonResbiity: values.designMitigatonResbiity
          ? values.designMitigatonResbiity
          : data.designMitigatonResbiity,
        designMitigtonEvidence: values.designMitigtonEvidence
          ? values.designMitigtonEvidence
          : data.designMitigtonEvidence,
        opernalMaintanMitigation: values.opernalMaintanMitigation
          ? values.opernalMaintanMitigation
          : data.opernalMaintanMitigation,
        opernalMitigatonResbility: values.opernalMitigatonResbility
          ? values.opernalMitigatonResbility
          : data.opernalMitigatonResbility,
        operatnalMitigationEvidence: values.operatnalMitigationEvidence ? values.operatnalMitigationEvidence : data.operatnalMitigationEvidence,
        residualSeverity: values.residualSeverity ? values.residualSeverity : data.residualSeverity,
        residualLikelihood: values.residualLikelihood ? values.residualLikelihood : data.residualLikelihood,
        residualRiskLevel: values.residualRiskLevel
          ? values.residualRiskLevel
          : data.residualRiskLevel,
        hazardStatus: values.hazardStatus
          ? values.hazardStatus
          : data.hazardStatus,
        ftaNameId: values.ftaNameId
          ? values.ftaNameId
          : data.ftaNameId,
        userField1:
          values.userField1
            ? values.userField1
            : data.userField1,
        userField2:
          values.userField2
            ? values.userField2
            : data.userField2,
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
      userField1:
        values.userField1,
      userField2:
        values.userField2,
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
          <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
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
                            <label
                              htmlFor="file-input"
                              className="import-export-btn"
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
                        <Tooltip placement="left" title="Export">
                          <Button
                            className="import-export-btn"
                            onClick={() => DownloadExcel()}
                          >
                            <FontAwesomeIcon
                              icon={faFileUpload}
                              style={{ width: "15px" }}
                            />
                          </Button>
                        </Tooltip>
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
