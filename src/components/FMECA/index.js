
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import "../../css/FMECA.scss";
import Api from "../../Api";
import { tableIcons } from "../core/TableIcons";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import { toast } from "react-toastify";
import {
  faFileDownload,
  faFileUpload,
  faPlusCircle,
  faPlus,
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
import { customStyles } from "../core/select";
import { createTheme, ThemeProvider } from "@mui/material";
import MaterialTable from "material-table";

function Index(props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [initialProductID, setInitialProductID] = useState();
  const [initialTreeStructure, setInitialTreeStructure] = useState();
  const [exceldata, setExcelData] = useState(null);

  // Form data for the modal
  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
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
  const [newFmecaData, setNewFmecaData] = useState({
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
  // Handle form input changes
  const handleFormChange = (e) => {
    console.log(e)
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error if field is filled
    if (value && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  const handleSelectChange = (selectedOption, fieldName) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error if field is filled
    if (value && errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }

    // If you need to fetch connected library data when a field changes
    if (selectedOption) {
      getAllConnectedLibrary(selectedOption, fieldName);
    }
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
  // Handle Add FMECA button click
  // const handleAddModalInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setNewFmecaData(prevData => ({
  //     ...prevData,
  //     [name]: value
  //   }));
  // };
  // const handleAddModalSelectChange = (selectedOption, fieldName) => {
  //   setNewFmecaData(prevData => ({
  //     ...prevData,
  //     [fieldName]: selectedOption ? selectedOption.value : ""
  //   }));
  // };
  // Handle input change for regular text inputs
  const handleAddModalInputChange = (e) => {
    const { name, value } = e.target;
    setNewFmecaData({
      ...newFmecaData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle select change for dropdowns
  const handleAddModalSelectChange = (selectedOption, fieldName) => {
    const value = selectedOption ? selectedOption.value : "";
    setNewFmecaData({
      ...newFmecaData,
      [fieldName]: value
    });

    // Clear error when user selects an option
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: null
      });
    }
  };

  // Custom styles for the Select component to show validation state

  // Create a mapping of field names to display names
  const fieldDisplayNames = {
    "function": "Function",
    "failureMode": "Failure Mode",
    "failureModeRatioAlpha": "Failure Mode Ratio Alpha",
    "subSystemEffect": "Sub System Effect",
    "systemEffect": "System Effect",
    "endEffect": "End Effect",
    "endEffectRatioBeta": "End Effect Ratio Beta",
    "safetyImpact": "Safety Impact",
    "realibilityImpact": "Reliability Impact"
  };

  const handleAddFmeca = () => {
    const requiredFields = [
      "function",
      "failureMode",
      "failureModeRatioAlpha",
      "subSystemEffect",
      "systemEffect",
      "endEffect",
      "endEffectRatioBeta",
      "safetyImpact",
      "realibilityImpact",
    ];

    let newErrors = {};

    // Validate required fields with custom error messages
    requiredFields.forEach((field) => {
      if (!newFmecaData[field] || newFmecaData[field].toString().trim() === "") {
        // Use the display name if available, otherwise capitalize the field name
        const fieldName = fieldDisplayNames[field] ||
          field.charAt(0).toUpperCase() + field.slice(1);
        newErrors[field] = `${fieldName} is required`;
      }
    });

    // Validate numeric fields
    const numericFields = [
      "failureModeRatioAlpha",
      "endEffectRatioBeta",
      "serviceDisruptionTime",
      "frequency"
    ];

    numericFields.forEach((field) => {
      if (newFmecaData[field] && newFmecaData[field].toString().trim() !== "") {
        const value = parseFloat(newFmecaData[field]);
        if (isNaN(value) || value < 0) {
          const fieldName = fieldDisplayNames[field] ||
            field.charAt(0).toUpperCase() + field.slice(1);
          newErrors[field] = `${fieldName} must be a valid positive number`;
        }
      }
    });

  // Validate ratio fields (must be exactly 1)
const ratioFields = ["failureModeRatioAlpha", "endEffectRatioBeta"];
ratioFields.forEach((field) => {
  if (newFmecaData[field] && newFmecaData[field].toString().trim() !== "") {
    const value = parseFloat(newFmecaData[field]);
    if (isNaN(value) || value !== 1) {
      const fieldName = fieldDisplayNames[field] ||
        field.charAt(0).toUpperCase() + field.slice(1);
      newErrors[field] = `${fieldName} must be exactly 1`;
    }
  }
});

    if (newFmecaData.severity && newFmecaData.severity.toString().trim() !== "") {
      const severity = parseInt(newFmecaData.severity);
      if (isNaN(severity) || severity < 1 || severity > 10) {
        newErrors.severity = "Severity must be between 1 and 10";
      }
    }

    if (newFmecaData.riskIndex && newFmecaData.riskIndex.toString().trim() !== "") {
      const riskIndex = parseInt(newFmecaData.riskIndex);
      if (isNaN(riskIndex) || riskIndex < 1 || riskIndex > 100) {
        newErrors.riskIndex = "Risk Index must be between 1 and 100";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Scroll to the first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }

      return;
    }

    // If validation passes
    setErrors({});
    createFmeca(newFmecaData);  
    toast.success("FMECA created successfully!", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });

    setShowAddModal(false);

    // Reset form data
    setNewFmecaData({
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
  };
  
  const resetForm = () => {
    setNewFmecaData({
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
    setErrors({});
  };
  const handleModal = () => {
    resetForm();
    // setShowAddModal(false);
  };
  useEffect(() => {
    if (showAddModal) {
      getAllConnectedLibraryAfterUpdate();
    }
  }, [showAddModal]);
  // Reset form when modal is closed
  const handleModalClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setShowAddModal(false);
  };
  useEffect(() => {
    getAllSeprateLibraryData();
    getAllLibraryData();
  }, []);

  useEffect(() => {
    getAllConnect();
  }, []);

  const importExcel = (e) => {
    const file = e.target.files[0];

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
        // console.log("New data..", treeData)
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
    console.log("Update Payload:", payload);

    try {
      const response = await Api.patch("api/v1/FMECA/update", payload);
      if (response?.status === 200) {
        toast.success("FMECA updated successfully!");
        getProductData();
        getAllConnectedLibraryAfterUpdate();
      } else if (response?.status === 204) {
        toast.error("Failure Mode Radio Alpha Must be Equal to One !");
        console.log("Response..", response)
      }
      else {
        toast.warning("Update request completed, but status not ideal.");
        getProductData();
        getAllConnectedLibraryAfterUpdate();
      }
    }
    catch (error) {
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
  
  const createFMECADataFromExcel = (values) => {
    const companyId = localStorage.getItem("companyId");
    setIsLoading(true);
    Api.post("api/v1/FMECA/", {
      operatingPhase: values.operatingPhase,
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
      if (status === 204) {
        setFailureModeRatioError(true);
      }

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
  const Modalopen = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  const role = localStorage.getItem("role");
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


  const createFmeca = (values) => {
    if (productId) {
      const companyId = localStorage.getItem("companyId");
      setIsLoading(true);
      Api.post("api/v1/FMECA/", {
        operatingPhase: values.operatingPhase,
        function: values.function,
        failureMode: values.failureMode,
        cause: values.cause,
        failureModeRatioAlpha: values?.failureModeRatioAlpha || 1,
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
        projectId: projectId,
        companyId: companyId,
        productId: productId,
        userId: userId,
        Alldata: tableData,
      }).then((response) => {
        const status = response?.status;
        getProductData();
        setIsLoading(false);

        if (status === 200 || status === 201) {
          toast.success("FMECA record added successfully!");
        }
      }).catch(error => {
        setIsLoading(false);
        toast.error("Failed to add FMECA record");
        console.error("Error creating FMECA:", error);
      });
    } else {
      setProductModal(true);
    }
  };
  const [connectData, setConnectData] = useState([]);

  const renderModalField = (fieldName, title, placeholder, required = false) => {
    const seperateFilteredData =
      allSepareteData?.filter((item) => item?.sourceName === fieldName) || [];
    const conncetedFilteredData =
      allConnectedData?.filter(
        (item) => item?.destinationName === fieldName
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

    // Check if this field has an error
    const hasError = !!errors[fieldName];

    if (!options || options.length === 0) {
      return (
        <Form.Group className="mb-3">
          <Form.Label>
            {title}

          </Form.Label>
          <Form.Control
            type="text"
            name={fieldName}
            value={newFmecaData[fieldName] || ""}
            onChange={handleAddModalInputChange}
            placeholder={placeholder}
            isInvalid={hasError}
            required={required}
          />
          {hasError && (
            <Form.Control.Feedback type="invalid">
              {errors[fieldName]}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      );
    }

    return (
      <Form.Group className="mb-3">
        <Form.Label>
          {title}

        </Form.Label>
        <Select
          name={fieldName}
          value={options.find(option => option.value === newFmecaData[fieldName]) || null}
          onChange={(selectedOption) => handleAddModalSelectChange(selectedOption, fieldName)}
          options={options}
          placeholder={placeholder}
          isClearable
          styles={{
            ...customStyles,
            control: (provided, state) => ({
              ...provided,
              borderColor: hasError ? '#dc3545' : provided.borderColor,
              '&:hover': {
                borderColor: hasError ? '#dc3545' : provided.borderColor,
              },
              boxShadow: hasError ? '0 0 0 0.2rem rgba(220, 53, 69, 0.25)' : provided.boxShadow,
            })
          }}
        />
        {hasError && (
          <div className="text-danger" style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
            {errors[fieldName]}
          </div>
        )}
      </Form.Group>
    );
  };

  const columns = [
    {
      render: (rowData) => `${rowData.tableData.id + 1}`,
      title: "FMECA ID",
    },
    {
      field: "operatingPhase",
      title: "Operating Phases",
    },
    {
      field: "function",
      title: "Function*",
    },
    {
      field: "failureMode",
      title: "Failure Mode*",
    },
    {
      field: "failureModeRatioAlpha",
      title: "Failure Mode Ratio Alpha*",
    },
    {
      field: "detectableMeansDuringOperation",
      title: "Cause",
    },
    {
      field: "subSystemEffect",
      title: "Sub System effect*",
    },
    {
      field: "systemEffect",
      title: "System Effect*",
    },
    {
      field: "endEffect",
      title: "End Effect*",
    },
    {
      field: "endEffectRatioBeta",
      title: "End Effect ratio Beta*",
    },
    {
      field: "safetyImpact",
      title: "Safety Impact*",
    },
    {
      field: "referenceHazardId",
      title: "Reference Hazard ID",
    },
    {
      field: "realibilityImpact",
      title: "Reliability Impact*",
    },
    {
      field: "serviceDisruptionTime",
      title: "Service Disruption Time(minutes)",
    },
    {
      field: "frequency",
      title: "Frequency",
    },
    {
      field: "severity",
      title: "Severity",
    },
    {
      field: "riskIndex",
      title: "Risk Index",
    },
    {
      field: "detectableMeansDuringOperation",
      title: "Detectable Means during operation",
    },
    {
      field: "detectableMeansToMaintainer",
      title: "Detectable Means to Maintainer",
    },
    {
      field: "BuiltInTest",
      title: "Built-in Test",
    },
    {
      field: "designControl",
      title: "Design Control",
    },
    {
      field: "maintenanceControl",
      title: "Maintenance Control",
    },
    {
      field: "exportConstraints",
      title: "Export constraints",
    },
    {
      field: "immediteActionDuringOperationalPhase",
      title: "Immediate Action during operational Phases",
    },
    {
      field: "immediteActionDuringNonOperationalPhase",
      title: "Immediate Action during Non-operational Phases",
    },
    {
      field: "userField1",
      title: "User field 1",
    },
    {
      field: "userField2",
      title: "User field 2",
    },
    {
      field: "userField3",
      title: "User field 3",
    },
    {
      field: "userField4",
      title: "User field 4",
    },
    {
      field: "userField5",
      title: "User field 5",
    },
    {
      field: "userField6",
      title: "User field 6",
    },
    {
      field: "userField7",
      title: "User field 7",
    },
    {
      field: "userField8",
      title: "User field 8",
    },
    {
      field: "userField9",
      title: "User field 9",
    },
    {
      field: "userField10",
      title: "User field 10",
    },


  ];

  return (
    <div className="mx-4 mt-5">
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          {/* Header section */}
          <div style={{ display: "flex", alignItems: "center" }}>
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

          {/* Add button */}
          <div className="d-flex justify-content-end mb-4">
            <Tooltip placement="top" title="Add FMECA">
              <Button
                className="add-product-btn"
                onClick={() => setShowAddModal(true)}
                disabled={
                  !writePermission &&
                  role !== "admin" &&
                  !(isOwner === true && createdBy === userId)
                }
              >
                <FontAwesomeIcon icon={faPlus} style={{ width: "15px" }} />
              </Button>
            </Tooltip>
          </div>

          {/* Material Table */}
          <ThemeProvider theme={tableTheme}>
            <MaterialTable
              title="FMECA"
              icons={tableIcons}
              columns={columns}
              data={tableData}
              options={{
                // cellStyle: {
                //   border: "1px solid #eee",
                //   whiteSpace: "nowrap",
                //   textOverflow: "ellipsis",
                //   overflow: "hidden",
                // },
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
              editable={{
                onRowUpdate:
                  writePermission === true ||
                    writePermission === "undefined" ||
                    role === "admin" ||
                    (isOwner === true && createdBy === userId)
                    ? (newRow, oldData) =>
                      new Promise((resolve) => {
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
                      new Promise((resolve) => {
                        deleteFmecaData(selectedRow);
                        resolve();
                      })
                    : null,
              }}
            />
          </ThemeProvider>

          {/* Add Modal */}
          <div className="main-div-product">
            <Modal show={showAddModal} onHide={handleModalClose} size="xl">
              <Modal.Header closeButton></Modal.Header>
              <div className="mttr-sec text-center">
                <p className="mb-0 para-tag">
                  Add New FMECA
                </p>
              </div>

              <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Form>
                  <Row>
                    <Col md={4}>
                      {renderModalField("operatingPhase", "Operating Phases", "Enter Operating Phase")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("function", "Function*", "Enter Function", true)}
                    </Col>
                    <Col md={4}>
                      {renderModalField("failureMode", "Failure Mode*", "Enter Failure Mode", true)}
                    </Col>
                    <Col md={4}>
                      {renderModalField("failureModeRatioAlpha", "Failure Mode Ratio Alpha*", "Enter Failure Mode Ratio Alpha")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("cause", "Cause", "Enter Cause")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("subSystemEffect", "Sub System effect*", "Enter Sub System Effect")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("systemEffect", "System Effect*", "Enter System Effect")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("endEffect", "End Effect*", "Enter End Effect")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("endEffectRatioBeta", "End Effect ratio Beta*", "Enter End Effect Ratio Beta")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("safetyImpact", "Safety Impact*", "Enter Safety Impact")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("referenceHazardId", "Reference Hazard ID", "Enter Reference Hazard ID")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("realibilityImpact", "Reliability Impact*", "Enter Reliability Impact")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("serviceDisruptionTime", "Service Disruption Time (minutes)", "Enter Service Disruption Time")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("frequency", "Frequency", "Enter Frequency")}
                    </Col>
                     <Col md={4}>
                      {renderModalField("severity", "Severity", "Enter Severity")}
                    </Col>
                     <Col md={4}>
                      {renderModalField("riskIndex", "Risk Index", "Enter Risk Index")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("detectableMeansDuringOperation", "Detectable Means during operation", "Enter Detectable Means during operation")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("detectableMeansToMaintainer", "Detectable Means to Maintainer", "Enter Detectable Means to Maintainer")}
                    </Col>
                  <Col md={4}>
                      {renderModalField("BuiltInTest", "Built-in Test", "Enter Built-in Test")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("designControl", "Design Control", "Enter Design Control")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("maintenanceControl", "Maintenance Control", "Enter Maintenance Control")}
                    </Col>
                  <Col md={4}>
                      {renderModalField("exportConstraints", "Export constraints", "Enter Export Constraints")}
                    </Col>
                  <Col md={4}>
                      {renderModalField("immediteActionDuringOperationalPhase", "Immediate Action during operational Phases", "Enter Immediate Action")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("immediteActionDuringNonOperationalPhase", "Immediate Action during Non-operational Phases", "Enter Immediate Action")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("userField1", "User field 1", "Enter User field 1")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("userField2", "User field 2", "Enter User field 2")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("userField3", "User field 3", "Enter User field 3")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("userField4", "User field 4", "Enter User field 4")}
                    </Col>
                   <Col md={4}>
                      {renderModalField("userField5", "User field 5", "Enter User field 5")}
                    </Col>
                  <Col md={4}>
                      {renderModalField("userField6", "User field 6", "Enter User field 6")}
                    </Col>
                     <Col md={4}>
                      {renderModalField("userField7", "User field 7", "Enter User field 7")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("userField8", "User field 8", "Enter User field 8")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("userField9", "User field 9", "Enter User field 9")}
                    </Col>
                    <Col md={4}>
                      {renderModalField("userField10", "User field 10", "Enter User field 10")}
                    </Col>
                  </Row>

                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleModal}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddFmeca}>
                  Save
                </Button>
              </Modal.Footer>
            </Modal>
          </div>

          {/* Other modals */}
          <Modal show={productModal} centered onHide={handleClose}>
            <div className="d-flex justify-content-center mt-5">
              <FaExclamationCircle size={45} color="#de2222b0" />
            </div>
            <Modal.Footer className="d-flex justify-content-center success-message mb-4">
              <div>
                <h5 className="text-center">
                  Please select product from <b>Dropdown</b> before adding a new row!
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
            <Modal.Footer className="d-flex justify-content-center success-message mb-4">
              <div>
                <h5 className="text-center">
                  Sum of Failure Mode must be equal to <b>1</b>
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