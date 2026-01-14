import React, { useEffect, useState, useRef } from "react";
import { Row, Col, Card, Form, Modal, Button } from "react-bootstrap";
import Label from "../core/Label";
import { Formik, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";
import Api from "../../Api";
import Select from "react-select";
import * as Yup from "yup";
import CreatableSelect from "react-select/creatable";
import MaterialTable from "material-table";
import { ThemeProvider } from "@material-ui/core/styles";
import Tree from "../Tree";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  acceptable,
  Category,
  Combination,
  Condition,
  Evident,
  Failure,
  Frequency,
  Item,
  levelreplace,
  Lubrication,
  Redesign,
  Repairable,
  replace,
  Risk,
  severity,
  Spare,
  task,
} from "./PartType";
import Dropdown from "../Company/Dropdown";
import Loader from "../core/Loader";
import Spinner from "react-bootstrap/esm/Spinner";
import Projectname from "../Company/projectname";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaExclamationCircle } from "react-icons/fa";
import { customStyles } from "../core/select";
import {
  faFileImport,
  faFileExport,
  faPlus,
  faFileDownload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip, TableCell } from "@material-ui/core";


const string255 = Yup.string()
  .required("This field is required")
  .max(255, "Must be at most 255 characters");

const Validation = Yup.object().shape({
  category: Yup.object().required("Category is required"),
  parttype: Yup.object().required("Part type is required"),
  partnumber: Yup.string().required("Part number is required").max(255),
  riskindex: Yup.string().required("Risk index is required").max(255),
  endeffect: Yup.string().required("End effect is required").max(255),
  reliability: Yup.string().required("Reliability impact is required").max(255),
  severity: Yup.string().required("Severity is required").max(255),
  safetyimpact: Yup.string().required("Safety impact is required").max(255),
  frequency: Yup.string().required("Frequency is required").max(255),
  Evident1: Yup.string().required("Evident1 is required").max(255),
  condition: Yup.string().required("Condition is required").max(255),
  failure: Yup.string().required("Failure is required").max(255),
  redesign: Yup.string().required("Redesign is required").max(255),
  acceptable: Yup.string().required("Acceptable is required").max(255),
  Items: Yup.string().required("Items is required").max(255),
  lubrication: Yup.string().required("Lubrication is required").max(255),
  task: Yup.string().required("Task is required").max(255),
  combination: Yup.string().required("Combination is required").max(255),
  rcmnotes: Yup.string().required("Rcmnotes is required").max(255),
  pmtaskid: Yup.string().required("PM Task Id is required").max(255),
  PMtasktype: Yup.string().required("PM task type Id is required").max(255),
  taskintervalFrequency: Yup.string()
    .required(" Task interval frequency is required")
    .max(255),
  taskIntervalunit: Yup.string()
    .required(" Task interval unit is required")
    .matches(/^[A-Za-z\s]+$/, "Only alphabets and spaces are allowed")
    .max(255),
  taskInterval: Yup.string().required(" Task interval is required").max(255),
  scheduledMaintenanceTask: Yup.string()
    .required(" Scheduled maintenance task is required")
    .max(255),
  taskDescription: Yup.string()
    .required(" Task Description is required")
    .max(255),
  tasktimeML1: Yup.string()
    .required("Task time ML1 is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  tasktimeML2: Yup.string()
    .required("Task time ML2 is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  tasktimeML3: Yup.string()
    .required("Task time ML3 is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  tasktimeML4: Yup.string()
    .required("Task time ML4 is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  tasktimeML5: Yup.string()
    .required("Task time ML5 is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  tasktimeML6: Yup.string()
    .required("Task time ML6 is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  tasktimeML7: Yup.string()
    .required("Task time ML7 is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  skill1: Yup.string().required(" Skill 1 is required").max(255),
  skill1nos: Yup.string()
    .required(" Skill 1 nos is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  skill1contribution: Yup.string()
    .required(" Skill 1 contribution is required")
    .max(255),
  skill2: Yup.string().required(" Skill 2 is required").max(255),
  skill2nos: Yup.string()
    .required(" Skill 2 nos is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  skill2contribution: Yup.string()
    .required(" Skill 2 Contribution is required")
    .max(255),
  skill3: Yup.string().required(" Skill 3 is required").max(255),
  skill3nos: Yup.string()
    .required(" Skill 3 nos is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  skill3contribution: Yup.string()
    .required(" Skill 3 contribution is required")
    .max(255),
  addReplacespare1: Yup.string()
    .required(" Add Replacespare 1 is required")
    .max(255),
  addReplacespare1qty: Yup.string()
    .required(" Add Replacespare 1 qty is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  addReplacespare2: Yup.string()
    .required(" Add Replacespare 2 is required")
    .max(255),
  addReplacespare2qty: Yup.string()
    .required(" Add Replacespare 2 qty is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  addReplacespare3: Yup.string()
    .required(" Add Replacespare 3 is required")
    .max(255),
  addReplacespare3qty: Yup.string()
    .required(" Add Replacespare 3 qty is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  Consumable1: Yup.string().required(" Consumable 1 is required").max(255),
  consumable1Qty: Yup.string()
    .required(" Consumable 1 qty is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  Consumable2: Yup.string().required(" Consumable 2 is required").max(255),
  Consumable2qty: Yup.string()
    .required(" Consumable 2 qty is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  Consumable3: Yup.string().required(" Consumable 3 is required").max(255),
  Consumable3qty: Yup.string()
    .required(" Consumable 3 qty is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  Consumable4: Yup.string().required(" Consumable 4 is required").max(255),
  Consumable4qty: Yup.string()
    .required(" Consumable 4 qty is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  Consumable5: Yup.string().required(" Consumable 5 is required").max(255),
  Consumable5qty: Yup.string()
    .required("Consumable 5 qty is required")
    .matches(/^[0-9]+$/, "Only numeric values are allowed")
    .max(255),
  userfield1: Yup.string().required("User field 1 is required").max(255),
  userfield2: Yup.string().required("User field 2 is required").max(255),
  userfield3: Yup.string().required("User field 3 is required").max(255),
  userfield4: Yup.string().required("User field 4 is required").max(255),
  userfield5: Yup.string().required("User field 5 is required").max(255),
});

// Custom hook for connection management
const useConnectionManagement = (projectId) => {
  const [allSepareteData, setAllSepareteData] = useState([]);
  const [flattenedConnect, setFlattenedConnect] = useState([]);
  const [selectedSourceValues, setSelectedSourceValues] = useState({});
  const [rowConnections, setRowConnections] = useState({});

  // Get all separate library data
  const getAllSeprateLibraryData = async () => {
    const companyId = localStorage.getItem("companyId");
    Api.get("api/v1/library/get/all/separate/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      console.log(res,"res seperate value")
      const filteredData = res?.data?.data.filter(
        (item) => item?.moduleName === "PMMRA"
      );
      setAllSepareteData(filteredData || []);
    });
  };

  // Get all connection data
  const getAllConnect = () => {
    Api.get("api/v1/library/get/all/connect/value", {
      params: { projectId },
    }).then((res) => {
      console.log(res,"res connect value")
      const filteredData = res.data.getData.filter(
        (entry) =>
          entry?.libraryId?.moduleName === "PMMRA" ||
          entry?.destinationModuleName === "PMMRA"
      );

      const flattened = filteredData.flatMap((item) =>
        (item.destinationData || [])
          .filter(
            (d) =>
              d.destinationModuleName === "PMMRA" &&
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
    });
  };

  // Check if a field is a source field (has connections from it)
  const isSourceField = (fieldName) => {
    return flattenedConnect?.some(item => item.fieldName === fieldName);
  };

  // Get destination fields for a source
  const getDestinationFieldsForSource = (sourceField, sourceValue) => {
    return flattenedConnect
      ?.filter(item => item.fieldName === sourceField && item.fieldValue === sourceValue)
      .map(item => ({
        field: item.destName,
        value: item.destValue
      })) || [];
  };

  // Get connected values for a field based on selected source
  const getConnectedValuesForField = (fieldName, rowId) => {
    const rowSourceValues = selectedSourceValues[rowId] || {};

    let connectedValues = [];

    Object.keys(rowSourceValues).forEach(sourceField => {
      const sourceValue = rowSourceValues[sourceField];
      if (sourceValue) {
        const connections = flattenedConnect?.filter(
          item =>
            item.fieldName === sourceField &&
            item.fieldValue === sourceValue &&
            item.destName === fieldName
        ) || [];

        connectedValues = [...connectedValues, ...connections];
      }
    });

    return connectedValues;
  };

  // Handle source selection and update connections
  const handleSourceSelection = (fieldName, value, rowId) => {
    // Update selected source values for this row
    setSelectedSourceValues(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [fieldName]: value
      }
    }));

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

  // Initialize connection data
  const initializeConnections = () => {
    getAllSeprateLibraryData();
    getAllConnect();
  };

  return {
    allSepareteData,
    flattenedConnect,
    selectedSourceValues,
    rowConnections,
    isSourceField,
    getDestinationFieldsForSource,
    getConnectedValuesForField,
    handleSourceSelection,
    initializeConnections
  };
};

export default function PMMRA(props) {
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;

  // Use the custom connection management hook
  const {
    allSepareteData,
    flattenedConnect,
    selectedSourceValues,
    rowConnections,
    isSourceField,
    getDestinationFieldsForSource,
    getConnectedValuesForField,
    handleSourceSelection,
    initializeConnections
  } = useConnectionManagement(projectId);

  // Existing state variables
  const [partType, setPartType] = useState();
  const [companyName, setCompanyName] = useState();
  const [category, setCategory] = useState();
  const [repairable, setRepairable] = useState();
  const [levelofreplace, setLevelofRaplace] = useState();
  const [levelofRepair, setLevelofRepair] = useState();
  const [spare, setSpare] = useState();
  const [Severity, setSeverity] = useState();
  const [riskIndex, setRiskIndex] = useState();
  const [taskIntervalUnit, setTaskIntervalUnit] = useState();
  const [lossofFuntEvident, setLosofFuntEvident] = useState();
  const [significantItem, setSignificantItem] = useState();
  const [conditionMonitrTsk, setConditionMonitrTsk] = useState();
  const [failureFindTask, setFailureFindTsk] = useState();
  const [reDesign, setResdesign] = useState();
  const [criticallyAccept, setCriticallyAccept] = useState();
  const [lubrication, setLubrication] = useState();
  const [restoreDiscardTsk, setRestoreDiscardTsk] = useState();
  const [combinationofTsk, setCombinationofTsk] = useState();
  const [show, setShow] = useState(false);
  const [showValue, setShowValue] = useState();
  const [value, setValue] = useState();
  const [treeTableData, setTreeTabledata] = useState([]);
  const [productName, setProductName] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState();
  const [partNumber, setPartNumber] = useState();
  const [quantity, setQuantity] = useState();
  const [isSpinning, setIsSpinning] = useState(true);
  const [initialProductId, setInitialProductId] = useState();
  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : initialProductId;
  const [projectname, setProjectName] = useState();
  const [reference, setReference] = useState();
  const [pmmraData, setpmmraData] = useState([]);
  const [fmecaData, setFmecaData] = useState([]);
  const [pmmraId, setpmmraId] = useState([]);
  const [writePermission, setWritePermission] = useState();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const history = useHistory();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [mttrRepairable, setMttrRepairable] = useState();
  const [mttrLevelOfRepair, setMttrLevelOfRepair] = useState();
  const [mttrLevelOfReplace, setMttrLevelOfReplace] = useState();
  const [mttrSpare, setMttrSpare] = useState();
  const [importExcelData, setImportExcelData] = useState({});
  const [shouldReload, setShouldReload] = useState(false);
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState();
  const [fmecaId, setFmecaId] = useState();
  const [fmecaFillterData, setFmecaFillterData] = useState();

  // Initialize connections on component mount
  const [failureMode, setFailureMode] = useState();
  useEffect(() => {
    initializeConnections();
  }, []);

  // Function to create a smart select field with connections
  const createSmartSelectField = (fieldName, label, values, setFieldValue, formId = "main") => {
    const rowId = formId; // For PMMRA form, we use "main" as the row ID

    // Get connected values for this field
    const connectedValues = getConnectedValuesForField(fieldName, rowId);

    // Get separate library data for this field
    const separateFilteredData = allSepareteData?.filter(
      (item) => item?.sourceName === fieldName
    ) || [];

    // Combine options: connected values first, then separate values
    let options = [];

    // Add connected values
    if (connectedValues.length > 0) {
      const connectedOptions = connectedValues.map(item => ({
        value: item.destValue,
        label: item.destValue,
        isConnected: true
      }));
      options = [...options, ...connectedOptions];
    }

    // Add separate library values (avoid duplicates)
    separateFilteredData.forEach(item => {
      if (!options.some(opt => opt.value === item.sourceValue)) {
        options.push({
          value: item.sourceValue,
          label: item.sourceValue,
          isConnected: false
        });
      }
    });

    // Get current value
    const currentValue = values[fieldName];
    const selectedOption = options.find(opt => opt.value === currentValue) ||
      (currentValue ? { label: currentValue, value: currentValue } : null);

    return (
      <div style={{ position: "relative" }}>
        <CreatableSelect
          name={fieldName}
          value={selectedOption}
          options={options}
          isClearable
          onChange={(option) => {
            const newValue = option?.value || "";
            setFieldValue(fieldName, newValue);

            // If this is a source field, handle connections
            if (isSourceField(fieldName) && newValue) {
              handleSourceSelection(fieldName, newValue, rowId);

              // Get destinations for this source
              const destinations = getDestinationFieldsForSource(fieldName, newValue);

              // Auto-fill destination fields if there's only one destination
              if (destinations.length === 1) {
                const dest = destinations[0];
                setFieldValue(dest.field, dest.value);
              }
            }
          }}
          onCreateOption={(inputValue) => {
            // Allow creating new options
            const newOption = { value: inputValue, label: inputValue };
            setFieldValue(fieldName, inputValue);

            if (isSourceField(fieldName) && inputValue) {
              handleSourceSelection(fieldName, inputValue, rowId);
            }
          }}
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            control: (base) => ({
              ...base,
              borderColor: "#ccc",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.data?.isConnected ? '#e8f4fd' : base.backgroundColor,
              fontWeight: state.data?.isConnected ? 'bold' : base.fontWeight,
            }),
          }}
          placeholder={label}
        />
        {connectedValues.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-18px",
              right: "5px",
              fontSize: "10px",
              color: "#1976d2",
              background: "#e8f4fd",
              padding: "2px 5px",
              borderRadius: "3px",
            }}
          >
            Connected
          </div>
        )}
      </div>
    );
  };

  // Import Excel function
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
      const excelData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });

      if (excelData.length > 1) {
        const headers = excelData[0];
        const rows = excelData.slice(1);
        const parsedData = rows.map((row) => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });
          return rowData;
        });

        // Map all Excel fields to form fields
        const mappedData = {};
        parsedData[0] &&
          Object.keys(parsedData[0]).forEach((key) => {
            const value = parsedData[0][key];

            // Map Excel column names to form field names
            switch (key) {
              case "endEffect":
                mappedData.endeffect = value;
                break;
              case "Evident1":
                mappedData.Evident1 = value;
                break;
              case "Items":
                mappedData.Items = value;
                break;
              case "condition":
                mappedData.condition = value;
                break;
              case "failure":
                mappedData.failure = value;
                break;
              case "redesign":
                mappedData.reDesign = value;
                break;
              case "acceptable":
                mappedData.criticallyAccept = value;
                break;
              case "lubrication":
                mappedData.lubrication = value;
                break;
              case "task":
                mappedData.task = value;
                break;
              case "combination":
                mappedData.combination = value;
                break;
              case "taskIntervalunit":
                mappedData.taskIntervalunit = value;
                break;
              case "safetyImpact":
                mappedData.safetyimpact = value;
                break;
              case "reliabilityImpact":
                mappedData.reliability = value;
                break;
              case "frequency":
                mappedData.frequency = value;
                break;
              case "severity":
                mappedData.severity = value;
                break;
              case "riskIndex":
                mappedData.riskindex = value;
                break;
              case "rcmNotes":
                mappedData.rcmnotes = value;
                break;
              case "pmTaskId":
                mappedData.pmtaskid = value;
                break;
              case "pmTaskType":
                mappedData.PMtasktype = value;
                break;
              case "taskIntrvlFreq":
                mappedData.taskintervalFrequency = value;
                break;
              case "LatitudeFreqTolrnc":
                mappedData.latitudeFrequency = value;
                break;
              case "lossofFuntEvident":
                mappedData.Evident1 = value;
                break;
              case "scheduleMaintenceTsk":
                mappedData.scheduledMaintenanceTask = value;
                break;
              case "tskInteralDetermination":
                mappedData.taskInterval = value;
                break;
              case "taskDesc":
                mappedData.taskDescription = value;
                break;
              case "tskTimeML1":
                mappedData.tasktimeML1 = value;
                break;
              case "tskTimeML2":
                mappedData.tasktimeML2 = value;
                break;
              case "tskTimeML3":
                mappedData.tasktimeML3 = value;
                break;
              case "tskTimeML4":
                mappedData.tasktimeML4 = value;
                break;
              case "tskTimeML5":
                mappedData.tasktimeML5 = value;
                break;
              case "tskTimeML6":
                mappedData.tasktimeML6 = value;
                break;
              case "tskTimeML7":
                mappedData.tasktimeML7 = value;
                break;
              case "skill1":
                mappedData.skill1 = value;
                break;
              case "skillOneNos":
                mappedData.skill1nos = value;
                break;
              case "skillOneContribution":
                mappedData.skill1contribution = value;
                break;
              case "skill2":
                mappedData.skill2 = value;
                break;
              case "skillTwoNos":
                mappedData.skill2nos = value;
                break;
              case "skillTwoContribution":
                mappedData.skill2contribution = value;
                break;
              case "skill3":
                mappedData.skill3 = value;
                break;
              case "skillThreeNos":
                mappedData.skill3nos = value;
                break;
              case "skillThreeContribution":
                mappedData.skill3contribution = value;
                break;
              case "addiReplaceSpare1":
                mappedData.addReplacespare1 = value;
                break;
              case "addiReplaceSpare1Qty":
                mappedData.addReplacespare1qty = value;
                break;
              case "addiReplaceSpare2":
                mappedData.addReplacespare2 = value;
                break;
              case "addiReplaceSpare2Qty":
                mappedData.addReplacespare2qty = value;
                break;
              case "addiReplaceSpare3":
                mappedData.addReplacespare3 = value;
                break;
              case "addiReplaceSpare3Qty":
                mappedData.addReplacespare3qty = value;
                break;
              case "consumable1":
                mappedData.Consumable1 = value;
                break;
              case "consumable1Qty":
                mappedData.consumable1Qty = value;
                break;
              case "consumable2":
                mappedData.Consumable2 = value;
                break;
              case "consumable2Qty":
                mappedData.Consumable2qty = value;
                break;
              case "consumable3":
                mappedData.Consumable3 = value;
                break;
              case "consumable3Qty":
                mappedData.Consumable3qty = value;
                break;
              case "consumable4":
                mappedData.Consumable4 = value;
                break;
              case "consumable4Qty":
                mappedData.Consumable4qty = value;
                break;
              case "consumable5":
                mappedData.Consumable5 = value;
                break;
              case "consumable5Qty":
                mappedData.Consumable5qty = value;
                break;
              case "userField1":
                mappedData.userfield1 = value;
                break;
              case "userField2":
                mappedData.userfield2 = value;
                break;
              case "userField3":
                mappedData.userfield3 = value;
                break;
              case "userField4":
                mappedData.userfield4 = value;
                break;
              case "userField5":
                mappedData.userfield5 = value;
                break;
              default:
                mappedData[key] = value;
            }
          });

        setImportExcelData(mappedData);

        toast.success("Excel data imported successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error("No Data Found In Excel Sheet", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const convertToJson = (headers, originalData) => {
    const rows = [];
    originalData.forEach((row) => {
      let rowData = {};
      row.forEach((element, index) => {
        rowData[headers[index]] = element;
      });
      rows.push(rowData);
    });
  };

  const createsafetPMMRAFromExcel = (values) => {
    const companyId = localStorage.getItem("companyId");

    setIsLoading(true);

    Api.post("/api/v1/pmMra/", {
      endEffect: values.endeffect,
      safetyImpact: values.safetyimpact,
      reliabilityImpact: values.reliability,
      frequency: values.frequency,
      rcmnotes: values.rcmnotes,
      pmTaskId: values.pmtaskid,
      pmTaskType: values.PMtasktype,
      taskIntrvlFreq: values.taskintervalFrequency,
      LatitudeFreqTolrnc: values.latitudeFrequency,
      tskInteralDetermination: values.taskInterval,
      scheduleMaintenceTsk: values.scheduledMaintenanceTask,
      taskDesc: values.taskDescription,
      tskTimeML1: values.tasktimeML1,
      tskTimeML2: values.tasktimeML2,
      tskTimeML3: values.tasktimeML3,
      tskTimeML4: values.tasktimeML4,
      tskTimeML5: values.tasktimeML5,
      tskTimeML6: values.tasktimeML6,
      tskTimeML7: values.tasktimeML7,
      skill1: values.skill1,
      skillOneNos: values.skill1nos,
      skillOneContribution: values.skill1contribution,
      skill2: values.skill2,
      skillTwoNos: values.skill2nos,
      skillTwoContribution: values.skill2contribution,
      skill3: values.skill3,
      skillThreeNos: values.skill3nos,
      skillThreeContribution: values.skill3contribution,
      addiReplaceSpare1: values.addReplacespare1,
      addiReplaceSpare1Qty: values.addReplacespare1qty,
      addiReplaceSpare2: values.addReplacespare2,
      addiReplaceSpare2Qty: values.addReplacespare2qty,
      addiReplaceSpare3: values.addReplacespare3,
      addiReplaceSpare3Qty: values.addReplacespare3qty,
      consumable1: values.Consumable1,
      consumable1Qty: values.consumable1Qty,
      consumable2: values.Consumable2,
      consumable2Qty: values.Consumable2qty,
      consumable3: values.Consumable3,
      consumable3Qty: values.Consumable3qty,
      consumable4: values.Consumable4,
      consumable4Qty: values.Consumable4qty,
      consumable5: values.Consumable5,
      consumable5Qty: values.Consumable5qty,
      userField1: values.userfield1,
      userField2: values.userfield2,
      userField3: values.userfield3,
      userField4: values.userfield4,
      userField5: values.userfield5,
    })
      .then((res) => {
        const pmmraData = res?.data?.data?.createData;
        const pmmraId = res?.data?.data?.createData?.id;
        setpmmraId(pmmraId);
        setpmmraData(pmmraData);

        const status = res.status;
        if (status === 201) {
          setShowValue(res.data.message);
          NextPage();
        } else {
          setShowValue(res.data.message);
          setValue(true);
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const exportToExcel = (value) => {
    const originalData = {
      CompanyName: treeTableData[0]?.companyId?.companyName,
      ProjectName: treeTableData[0]?.projectId?.projectName,
      productName: value.name,
      endEffect: value.endeffect,
      safetyImpact: value.safetyimpact,
      reliabilityImpact: value.reliability,
      frequency: value.frequency,
      severity: value.severity,
      riskIndex: value.riskindex,
      lossofFuntEvident: value.Evident1,
      significantItem: value.Items,
      conditionMonitrTsk: value.condition,
      failureFindTask: value.failure,
      reDesign: value.redesign,
      criticallyAccept: value.acceptable,
      lubrication: value.lubrication,
      restoreDiscardTsk: value.task,
      combinationofTsk: value.combination,
      rcmnotes: value.rcmnotes,

      pmTaskId: value.pmtaskid,
      pmTaskType: value.PMtasktype,
      taskIntrvlFreq: value.taskintervalFrequency,
      // taskintervalunit
      // taskIntervaal
      taskIntervalunit: value.taskIntervalunit,
      taskInterval: value.taskInterval,

      // LatitudeFreqTolrnc: value.latitudeFrequency,

      scheduleMaintenceTsk: value.scheduledMaintenanceTask,
      // tskInteralDetermination: value.taskInterval,
      taskDesc: value.taskDescription,


      tskTimeML1: value.tasktimeML1,
      tskTimeML2: value.tasktimeML2,
      tskTimeML3: value.tasktimeML3,
      tskTimeML4: value.tasktimeML4,
      tskTimeML5: value.tasktimeML5,
      tskTimeML6: value.tasktimeML6,
      tskTimeML7: value.tasktimeML7,
      skill1: value.skill1,
      skillOneNos: value.skill1nos,
      skillOneContribution: value.skill1contribution,
      skill2: value.skill2,
      skillTwoNos: value.skill2nos,
      skillTwoContribution: value.skill2contribution,
      skill3: value.skill3,
      skillThreeNos: value.skill3nos,
      skillThreeContribution: value.skill3contribution,
      addiReplaceSpare1: value.addReplacespare1,
      addiReplaceSpare1Qty: value.addReplacespare1qty,
      addiReplaceSpare2: value.addReplacespare2,
      addiReplaceSpare2Qty: value.addReplacespare2qty,
      addiReplaceSpare3: value.addReplacespare3,
      addiReplaceSpare3Qty: value.addReplacespare3qty,
      consumable1: value.Consumable1,
      consumable1Qty: value.consumable1Qty,
      consumable2: value.Consumable2,
      consumable2Qty: value.Consumable2qty,
      consumable3: value.Consumable3,
      consumable3Qty: value.Consumable3qty,
      consumable4: value.Consumable4,
      consumable4Qty: value.Consumable4qty,
      consumable5: value.Consumable5,
      consumable5Qty: value.Consumable5qty,
      userField1: value.userfield1,
      userField2: value.userfield2,
      userField3: value.userfield3,
      userField4: value.userfield4,
      userField5: value.userfield5,
    };

    const hasData = Object.values(originalData).some((value) => !!value);

    if (hasData) {
      const dataArray = [];
      dataArray.push(originalData);
      const ws = XLSX?.utils?.json_to_sheet(dataArray);
      const wb = XLSX.utils?.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "FormData");
      const fileName = `${productName}_PMMRA.xlsx`;
      XLSX.writeFile(wb, fileName);
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

  // Cancel click handler
  const handleCancelClick = () => {
    const shouldReloadPage = true;
    if (shouldReloadPage) {
      setShouldReload(true);
    } else {
      setOpen(false);
    }
  };

  if (shouldReload) {
    window.location.reload();
  }

  // Logout function
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  // Get FMECA data
  const getFMECAData = () => {
    Api.get("/api/v1/FMECA/product/list", {
      params: {
        projectId: projectId,
        productId: productId,
      },
    }).then((res) => {
      const data = res?.data?.data;
      setFmecaData(data);
    });
  };
  const getFMECADataAfterChange = (failureMode) => {
    Api.get("/api/v1/FMECA/product/list", {
      params: {
        projectId: projectId,
        productId: productId,
      },
    }).then((res) => {
      const data = res?.data?.data;
      setFmecaData(data);
      const filteredData = data.filter((item) => item.failureMode === failureMode);

      setFmecaFillterData(filteredData[0]);
    });
  };

  // Project sidebar
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

  // Get tree data
  const getTreedata = () => {
    Api.get(`/api/v1/productTreeStructure/list`, {
      params: {
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;
        setIsLoading(false);
        setTreeTabledata(treeData);
        setInitialProductId(res?.data?.data[0]?.treeStructure?.id);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Get MTTR data
  const getMttrData = () => {
    const companyId = localStorage.getItem("companyId");
    Api.get("/api/v1/mttrPrediction/details", {
      params: {
        projectId: projectId,
        productId: productId,
        companyId: companyId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setMttrRepairable(
          data?.repairable
            ? { label: data?.repairable, value: data?.repairable }
            : ""
        );
        setMttrLevelOfRepair(
          data?.levelOfRepair
            ? { label: data?.levelOfRepair, value: data?.levelOfRepair }
            : ""
        );
        setMttrLevelOfReplace(
          data?.levelOfReplace
            ? { label: data?.levelOfReplace, value: data?.levelOfReplace }
            : ""
        );
        setMttrSpare(
          data?.spare ? { label: data?.spare, value: data?.spare } : ""
        );
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Get project permission
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
        setWritePermission(data?.modules[7].write);
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
  }, [projectId]);

  useEffect(() => {
    getTreedata();
    propstoGetTreeData();
    getpmmraDetails();
    getMttrData();
    getFMECAData();
  }, [productId]);

  // Get PMMRA details
  const getpmmraDetails = () => {
    const companyId = localStorage.getItem("companyId");
    Api.get("/api/v1/pmMra/details", {
      params: {
        projectId: projectId,
        productId: productId,
        companyId: companyId,
        userId: userId,
      },
    })
      .then((res) => {
        const pmmraData = res?.data?.data;
        setSeverity(pmmraData?.severity);
        setRepairable(pmmraData?.repairable);
        setLevelofRaplace(pmmraData?.levelOfReplace);
        setLevelofRepair(pmmraData?.levelOfRepair);
        setRiskIndex(pmmraData?.riskIndex);
        setSpare(pmmraData?.spare);
        setTaskIntervalUnit(pmmraData?.taskIntrvlUnit);
        setCombinationofTsk(pmmraData?.combinationOfTsk);
        setLosofFuntEvident(pmmraData?.LossOfEvident);
        setLubrication(pmmraData?.LubricationservceTsk);
        setConditionMonitrTsk(pmmraData?.conditionMonitrTsk);
        setCriticallyAccept(pmmraData?.criticalityAccept);
        setFailureFindTsk(pmmraData?.failureFindTsk);
        setResdesign(pmmraData?.reDesign);
        setRestoreDiscardTsk(pmmraData?.restoreDiscrdTsk);
        setSignificantItem(pmmraData?.significantItem);
        setTaskIntervalUnit(pmmraData?.taskIntrvlUnit);
        const pmmraId = res?.data?.data?.id;
        setpmmraId(pmmraId);

        setpmmraData(pmmraData);
        setFailureMode(pmmraData?.failureMode);
        getFMECADataAfterChange(pmmraData?.failureMode);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Get tree data for props
  const propstoGetTreeData = () => {
    const companyId = localStorage.getItem("companyId");
    setIsSpinning(true);
    Api.get("/api/v1/productTreeStructure/get/tree/product/list", {
      params: {
        projectId: projectId,
        treeStructureId: productId,
        companyId: companyId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setProductName(data.productName);
        setIsLoading(false);
        setCategory(
          data?.category ? { label: data?.category, value: data?.category } : ""
        );
        setQuantity(data?.quantity);
        setName(data?.productName);
        setPartNumber(data?.partNumber);
        setPartType(
          data?.partType ? { label: data?.partType, value: data?.partType } : ""
        );
        setIsSpinning(false);
        setReference(data?.reference);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Submit function
  const submit = (values) => {
    const companyId = localStorage.getItem("companyId");

    Api.post("/api/v1/pmMra/", {
      name: name,
      partNumber: partNumber,
      category:
        category && values?.category?.value
          ? values?.category?.value
          : values?.category,
      quantity: quantity,
      partType:
        partType && values?.partType?.value
          ? values?.partType?.value
          : values?.partType,
      failureMode: fmecaFillterData?.failureMode,
      repairable: repairable,
      levelOfRepair: levelofRepair,
      levelOfReplace: levelofreplace,
      spare: spare,
      endEffect:
        values?.endeffect && values?.endeffect?.value
          ? values?.endeffect?.value
          : values?.endeffect,
      safetyImpact:
        values?.safetyimpact && values?.safetyimpact?.value
          ? values?.safetyimpact?.value
          : values?.safetyimpact,
      reliabilityImpact:
        values?.reliability && values?.reliability?.value
          ? values?.reliability?.value
          : values?.reliability,
      frequency:
        values?.frequency && values?.frequency?.value
          ? values?.frequency?.value
          : values?.frequency,
      severity: Severity ? Severity : value?.severity?.value || values.severity,
      riskIndex: riskIndex
        ? riskIndex
        : value?.riskIndex?.value || values.riskindex,
      LossOfEvident: lossofFuntEvident
        ? lossofFuntEvident
        : value?.lossofFuntEvident?.value || values.Evident1,
      significantItem: significantItem
        ? significantItem
        : value?.significantItem?.value || values.Items,
      criticalityAccept: criticallyAccept
        ? criticallyAccept
        : value?.criticallyAccept?.value || values.acceptable,
      LubricationservceTsk: lubrication
        ? lubrication
        : value?.lubrication?.value || values.lubrication,
      conditionMonitrTsk: conditionMonitrTsk
        ? conditionMonitrTsk
        : value?.conditionMonitrTsk?.value || values.condition,
      restoreDiscrdTsk: restoreDiscardTsk
        ? restoreDiscardTsk
        : value?.restoreDiscardTsk?.value || values.task,
      failureFindTsk: failureFindTask
        ? failureFindTask
        : value?.failureFindTask?.value || values.failure,
      combinationOfTsk: combinationofTsk
        ? combinationofTsk
        : value?.combinationofTsk?.value || values.combination,
      reDesign: reDesign ? reDesign : value?.reDesign?.value || values.redesign,
      rcmnotes:
        values?.rcmnotes && values?.rcmnotes?.value
          ? values?.rcmnotes?.value
          : values?.rcmnotes,
      pmTaskId:
        values?.pmtaskid && values?.pmtaskid?.value
          ? values?.pmtaskid?.value
          : values?.pmtaskid,
      pmTaskType:
        values?.PMtasktype && values?.PMtasktype?.value
          ? values?.PMtasktype?.value
          : values?.PMtasktype,
      taskIntrvlFreq:
        values?.taskintervalFrequency && values?.taskintervalFrequency?.value
          ? values?.taskintervalFrequency?.value
          : values?.taskintervalFrequency,
      taskIntrvlUnit: taskIntervalUnit
        ? taskIntervalUnit
        : value?.taskIntervalUnit?.value || values.taskIntervalunit,
      LatitudeFreqTolrnc:
        values?.latitudeFrequency && values?.latitudeFrequency?.value
          ? values?.latitudeFrequency?.value
          : values?.latitudeFrequency,
      tskInteralDetermination:
        values?.taskInterval && values?.taskInterval?.value
          ? values?.taskInterval?.value
          : values?.taskInterval,
      scheduleMaintenceTsk:
        values?.scheduledMaintenanceTask &&
          values?.scheduledMaintenanceTask?.value
          ? values?.scheduledMaintenanceTask?.value
          : values?.scheduledMaintenanceTask,
      taskDesc:
        values?.taskDescription && values?.taskDescription?.value
          ? values?.taskDescription?.value
          : values?.taskDescription,
      tskTimeML1:
        values?.tasktimeML1 && values?.tasktimeML1?.value
          ? values?.tasktimeML1?.value
          : values?.tasktimeML1,
      tskTimeML2:
        values?.tasktimeML2 && values?.tasktimeML2?.value
          ? values?.tasktimeML2?.value
          : values?.tasktimeML2,
      tskTimeML3:
        values?.tasktimeML3 && values?.tasktimeML3?.value
          ? values?.tasktimeML3?.value
          : values?.tasktimeML3,
      tskTimeML4:
        values?.tasktimeML4 && values?.tasktimeML4?.value
          ? values?.tasktimeML4?.value
          : values?.tasktimeML4,
      tskTimeML5:
        values?.tasktimeML5 && values?.tasktimeML5?.value
          ? values?.tasktimeML5?.value
          : values?.tasktimeML5,
      tskTimeML6:
        values?.tasktimeML6 && values?.tasktimeML6?.value
          ? values?.tasktimeML6?.value
          : values?.tasktimeML6,
      tskTimeML7:
        values?.tasktimeML7 && values?.tasktimeML7.value
          ? values?.tasktimeML7?.value
          : values?.tasktimeML7,
      skill1:
        values?.skill1 && values?.skill1?.value
          ? values?.skill1?.value
          : values?.skill1,
      skillOneNos:
        values?.skill1nos && values?.skill1nos?.value
          ? values?.skill1nos?.value
          : values?.skill1nos,
      skillOneContribution:
        values?.skill1contribution && values?.skill1contribution?.value
          ? values?.skill1contribution?.value
          : values?.skill1contribution,
      skill2:
        values?.skill2 && values?.skill2?.value
          ? values?.skill2?.value
          : values?.skill2,
      skillTwoNos:
        values?.skill2nos && values?.skill2nos?.value
          ? values?.skill2nos?.value
          : values?.skill2nos,
      skillTwoContribution:
        values?.skill2contribution && values?.skill2contribution?.value
          ? values?.skill2contribution?.value
          : values?.skill2contribution,
      skill3:
        values?.skill3 && values?.skill3?.value
          ? values?.skill3?.value
          : values?.skill3,
      skillThreeNos:
        values?.skill3nos && values?.skill3nos?.value
          ? values?.skill3nos?.value
          : values?.skill3nos,
      skillThreeContribution:
        values?.skill3contribution && values?.skill3contribution?.value
          ? values?.skill3contribution?.value
          : values?.skill3contribution,
      addiReplaceSpare1:
        values?.addReplacespare1 && values?.addReplacespare1?.value
          ? values?.addReplacespare1?.value
          : values?.addReplacespare1,
      addiReplaceSpare1Qty:
        values?.addReplacespare1qty && values?.addReplacespare1qty?.value
          ? values?.addReplacespare1qty?.value
          : values?.addReplacespare1qty,
      addiReplaceSpare2:
        values?.addReplacespare2 && values?.addReplacespare2?.value
          ? values?.addReplacespare2?.value
          : values?.addReplacespare2,
      addiReplaceSpare2Qty:
        values?.addReplacespare2qty && values?.addReplacespare2qty?.value
          ? values?.addReplacespare2qty?.value
          : values?.addReplacespare2qty,
      addiReplaceSpare3:
        values?.addReplacespare3 && values?.addReplacespare3?.value
          ? values?.addReplacespare3?.value
          : values?.addReplacespare3,
      addiReplaceSpare3Qty:
        values?.addReplacespare3qty && values?.addReplacespare3qty?.value
          ? values?.addReplacespare3qty?.value
          : values?.addReplacespare3qty,
      consumable1:
        values?.Consumable1 && values?.Consumable1?.value
          ? values?.Consumable1?.value
          : values?.Consumable1,
      consumable1Qty:
        values?.consumable1Qty && values?.consumable1Qty?.value
          ? values?.consumable1Qty?.value
          : values?.consumable1Qty,
      consumable2:
        values?.Consumable2 && values?.consumable2?.value
          ? values?.consumable2?.value
          : values?.Consumable2,
      consumable2Qty:
        values?.Consumable2qty && values?.Consumable2qty?.value
          ? values?.Consumable2qty?.value
          : values?.Consumable2qty,
      consumable3:
        values?.Consumable3 && values?.Consumable3?.value
          ? values?.Consumable3?.value
          : values?.Consumable3,
      consumable3Qty:
        values?.Consumable3qty && values?.Consumable3qty?.value
          ? values?.Consumable3qty?.value
          : values?.Consumable3qty,
      consumable4:
        values?.Consumable4 && values?.Consumable4?.value
          ? values?.Consumable4?.value
          : values?.Consumable4,
      consumable4Qty:
        values?.Consumable4qty && values?.Consumable4qty?.value
          ? values?.Consumable4qty?.value
          : values?.Consumable4qty,
      consumable5:
        values?.Consumable5 && values?.Consumable5?.value
          ? values?.Consumable5?.value
          : values?.Consumable5,
      consumable5Qty:
        values?.Consumable5qty && values?.Consumable5qty?.value
          ? values?.Consumable5qty?.value
          : values?.Consumable5qty,
      userField1:
        values?.userfield1 && values?.userfield1?.value
          ? values?.userfield1?.value
          : values?.userfield1,
      userField2:
        values?.userfield2 && values?.userfield2?.value
          ? values?.userfield2?.value
          : values?.userfield2,
      userField3:
        values?.userfield3 && values?.userfield3?.value
          ? values?.userfield3?.value
          : values?.userfield3,
      userField4:
        values?.userfield4 && values?.userfield4?.value
          ? values?.userfield4?.value
          : values?.userfield4,
      userField5:
        values?.userfield5 && values?.userfield5?.value
          ? values?.userfield5?.value
          : values?.userfield5,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      userId: userId,
    })
      .then((res) => {
        const pmmraData = res?.data?.data?.createData;
        const pmmraId = res?.data?.data?.createData?.id;
        setpmmraId(pmmraId);
        setFailureMode(pmmraData?.failureMode);
        setpmmraData(pmmraData);

        const status = res.status;
        if (status === 201) {
          setShowValue(res.data.message);
          NextPage();
        } else {
          setShowValue(res.data.message);
          setValue(true);
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Update PMMRA details
  const UpdatepmmraDetails = (values) => {
    const companyId = localStorage.getItem("companyId");
    Api.patch("/api/v1/pmMra/update", {
      name: name,
      partNumber: partNumber,
      category: category,
      quantity: quantity,
      partType: partType,
      repairable: repairable,
      levelOfRepair: levelofRepair,
      levelOfReplace: levelofreplace,
      failureMode: fmecaFillterData?.failureMode,
      spare: spare,
      endEffect: values.endeffect,
      safetyImpact: values.safetyimpact,
      reliabilityImpact: values.reliability,
      frequency: values.frequency,
      severity: Severity || values.severity,
      riskIndex: riskIndex || values.riskindex,
      LossOfEvident: lossofFuntEvident || values.Evident1,
      significantItem: significantItem || values.Items,
      criticalityAccept: criticallyAccept || values.acceptable,
      LubricationservceTsk: lubrication || values.lubrication,
      conditionMonitrTsk: conditionMonitrTsk || values.condition,
      restoreDiscrdTsk: restoreDiscardTsk || values.task,
      failureFindTsk: failureFindTask || values.failure,
      combinationOfTsk: combinationofTsk || values.combination,
      reDesign: reDesign || values.redesign,
      rcmnotes: values.rcmnotes,
      pmTaskId: values.pmtaskid,
      pmTaskType: values.PMtasktype,
      taskIntrvlFreq: values.taskintervalFrequency,
      taskIntrvlUnit: taskIntervalUnit || values.taskIntervalunit,
      LatitudeFreqTolrnc: values.latitudeFrequency,
      scheduleMaintenceTsk: values.scheduledMaintenanceTask,
      tskInteralDetermination: values.taskInterval,
      taskDesc: values.taskDescription,
      tskTimeML1: values.tasktimeML1,
      tskTimeML2: values.tasktimeML2,
      tskTimeML3: values.tasktimeML3,
      tskTimeML4: values.tasktimeML4,
      tskTimeML5: values.tasktimeML5,
      tskTimeML6: values.tasktimeML6,
      tskTimeML7: values.tasktimeML7,
      skill1: values.skill1,
      skillOneNos: values.skill1nos,
      skillOneContribution: values.skill1contribution,
      skill2: values.skill2,
      skillTwoNos: values.skill2nos,
      skillTwoContribution: values.skill2contribution,
      skill3: values.skill3,
      skillThreeNos: values.skill3nos,
      skillThreeContribution: values.skill3contribution,
      addiReplaceSpare1: values.addReplacespare1,
      addiReplaceSpare1Qty: values.addReplacespare1qty,
      addiReplaceSpare2: values.addReplacespare2,
      addiReplaceSpare2Qty: values.addReplacespare2qty,
      addiReplaceSpare3: values.addReplacespare3,
      addiReplaceSpare3Qty: values.addReplacespare3qty,
      consumable1: values.Consumable1,
      consumable1Qty: values.consumable1Qty,
      consumable2: values.Consumable2,
      consumable2Qty: values.Consumable2qty,
      consumable3: values.Consumable3,
      consumable3Qty: values.Consumable3qty,
      consumable4: values.Consumable4,
      consumable4Qty: values.Consumable4qty,
      consumable5: values.Consumable5,
      consumable5Qty: values.Consumable5qty,
      userField1: values.userfield1,
      userField2: values.userfield2,
      userField3: values.userfield3,
      userField4: values.userfield4,
      userField5: values.userfield5,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      pmMraId: pmmraId,
      userId: userId,
    })
      .then((res) => {
        const pmmraData = res?.data?.editDetail;
        setpmmraData(pmmraData);
        const status = res.status;
        if (status === 201) {
          setShowValue(res.data.message);
          NextPage();
          setpmmraData([...pmmraData, res.data.editDetail]);
        } else {
          setShowValue(res.data.message);
          setValue(true);
        }
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Next page function
  const NextPage = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  // Get FMECA filter data
  const getFmecaFilterData = (value) => {
    const filteredData = fmecaData.filter((item) => item.failureMode === value);

    setFmecaFillterData(filteredData[0]);
  };

  // FMECA options
  const fmecaOptions = fmecaData.map((item) => ({
    value: item?.failureMode,
    label: item?.failureMode,
  }));

  // Initial values for form
  const InitialValues = {
    projectname: projectname,
    companyId: companyId,
    name: name,
    companyName: companyName,
    projectId: projectId,
    partnumber: partNumber,
    repairable: mttrRepairable,
    spare: mttrSpare,
    levelofrepair: mttrLevelOfRepair,
    levelofreplace: mttrLevelOfReplace,
    reference: reference,
    category: category,
    parttype: partType,
    quantity: quantity,
    failureMode: fmecaFillterData?.failureMode || "",
    // Use imported Excel data for all fields, fall back to FMECA data or empty
    endeffect: importExcelData?.endeffect || fmecaFillterData?.endEffect || "",
    reliability:
      importExcelData?.reliability || fmecaFillterData?.realibilityImpact || "",
    severity: importExcelData?.severity || fmecaFillterData?.severity || "",
    safetyimpact:
      importExcelData?.safetyimpact || fmecaFillterData?.safetyImpact || "",
    frequency: importExcelData?.frequency || fmecaFillterData?.frequency || "",
    riskindex: importExcelData?.riskindex || fmecaFillterData?.riskIndex || "",
    rcmnotes: importExcelData?.rcmnotes || pmmraData?.rcmNotes || "",
    pmtaskid: importExcelData?.pmtaskid || pmmraData?.pmTaskId || "",
    PMtasktype: importExcelData?.PMtasktype || pmmraData?.pmTaskType || "",
    taskintervalFrequency:
      importExcelData?.taskintervalFrequency || pmmraData?.taskIntrvlFreq || "",
    latitudeFrequency:
      importExcelData?.latitudeFrequency || pmmraData?.LatitudeFreqTolrnc || "",
    scheduledMaintenanceTask:
      importExcelData?.scheduledMaintenanceTask ||
      pmmraData?.scheduleMaintenceTsk ||
      "",
    taskInterval:
      importExcelData?.taskInterval || pmmraData?.tskInteralDetermination || "",
    taskDescription:
      importExcelData?.taskDescription || pmmraData?.taskDesc || "",
    tasktimeML1: importExcelData?.tasktimeML1 || pmmraData?.tskTimeML1 || "",
    tasktimeML2: importExcelData?.tasktimeML2 || pmmraData?.tskTimeML2 || "",
    tasktimeML3: importExcelData?.tasktimeML3 || pmmraData?.tskTimeML3 || "",
    tasktimeML4: importExcelData?.tasktimeML4 || pmmraData?.tskTimeML4 || "",
    tasktimeML5: importExcelData?.tasktimeML5 || pmmraData?.tskTimeML5 || "",
    tasktimeML6: importExcelData?.tasktimeML6 || pmmraData?.tskTimeML6 || "",
    tasktimeML7: importExcelData?.tasktimeML7 || pmmraData?.tskTimeML7 || "",
    skill1: importExcelData?.skill1 || pmmraData?.skill1 || "",
    skill1nos: importExcelData?.skill1nos || pmmraData?.skillOneNos || "",
    skill1contribution:
      importExcelData?.skill1contribution ||
      pmmraData?.skillOneContribution ||
      "",
    skill2: importExcelData?.skill2 || pmmraData?.skill2 || "",
    skill2nos: importExcelData?.skill2nos || pmmraData?.skillTwoNos || "",
    skill2contribution:
      importExcelData?.skill2contribution ||
      pmmraData?.skillTwoContribution ||
      "",
    skill3: importExcelData?.skill3 || pmmraData?.skill3 || "",
    skill3nos: importExcelData?.skill3nos || pmmraData?.skillThreeNos || "",
    skill3contribution:
      importExcelData?.skill3contribution ||
      pmmraData?.skillThreeContribution ||
      "",
    addReplacespare1:
      importExcelData?.addReplacespare1 || pmmraData?.addiReplaceSpare1 || "",
    addReplacespare1qty:
      importExcelData?.addReplacespare1qty ||
      pmmraData?.addiReplaceSpare1Qty ||
      "",
    addReplacespare2:
      importExcelData?.addReplacespare2 || pmmraData?.addiReplaceSpare2 || "",
    addReplacespare2qty:
      importExcelData?.addReplacespare2qty ||
      pmmraData?.addiReplaceSpare2Qty ||
      "",
    addReplacespare3:
      importExcelData?.addReplacespare3 || pmmraData?.addiReplaceSpare3 || "",
    addReplacespare3qty:
      importExcelData?.addReplacespare3qty ||
      pmmraData?.addiReplaceSpare3Qty ||
      "",
    Consumable1: importExcelData?.Consumable1 || pmmraData?.consumable1 || "",
    consumable1Qty:
      importExcelData?.consumable1Qty || pmmraData?.consumable1Qty || "",
    Consumable2: importExcelData?.Consumable2 || pmmraData?.consumable2 || "",
    Consumable2qty:
      importExcelData?.Consumable2qty || pmmraData?.consumable2Qty || "",
    Consumable3: importExcelData?.Consumable3 || pmmraData?.consumable3 || "",
    Consumable3qty:
      importExcelData?.Consumable3qty || pmmraData?.consumable3Qty || "",
    Consumable4: importExcelData?.Consumable4 || pmmraData?.consumable4 || "",
    Consumable4qty:
      importExcelData?.Consumable4qty || pmmraData?.consumable4Qty || "",
    Consumable5: importExcelData?.Consumable5 || pmmraData?.consumable5 || "",
    Consumable5qty:
      importExcelData?.Consumable5qty || pmmraData?.consumable5Qty || "",
    userfield1: importExcelData?.userfield1 || pmmraData?.userField1 || "",
    userfield2: importExcelData?.userfield2 || pmmraData?.userField2 || "",
    userfield3: importExcelData?.userfield3 || pmmraData?.userField3 || "",
    userfield4: importExcelData?.userfield4 || pmmraData?.userField4 || "",
    userfield5: importExcelData?.userfield5 || pmmraData?.userField5 || "",
    Evident1: importExcelData?.Evident1 || pmmraData?.LossOfEvident || "",
    Items: importExcelData?.significantItem || pmmraData?.significantItem || "",
    condition:
      importExcelData?.conditionMonitrTsk ||
      pmmraData?.conditionMonitrTsk ||
      "",
    failure:
      importExcelData?.failureFindTask || pmmraData?.failureFindTsk || "",
    redesign: importExcelData?.reDesign || pmmraData?.reDesign || "",
    acceptable:
      importExcelData?.criticallyAccept || pmmraData?.criticalityAccept || "",
    lubrication:
      importExcelData?.lubrication || pmmraData?.LubricationservceTsk || "",
    task:
      importExcelData?.restoreDiscardTsk || pmmraData?.restoreDiscrdTsk || "",
    combination:
      importExcelData?.combinationofTsk || pmmraData?.combinationOfTsk || "",
    taskIntervalunit:
      importExcelData?.taskInterval || pmmraData?.taskIntrvlUnit || "",
  };

  return (
    <div style={{ marginTop: "90px" }} className="mx-4">
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
                  writePermission={writePermission}
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
                  <label htmlFor="file-input" className="import-export-btn"
                      style={{
          cursor: writePermission === false ? "not-allowed" : "pointer",
          opacity: writePermission === false ? 0.5 : 1
        }}
      
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
                     disabled={writePermission === false}
                  />
                </div>
              </Tooltip>
              
              <Tooltip placement="left" title="Export">
                <Button
                  className="import-export-btn"
                  style={{
                    marginLeft: "10px",
                    borderStyle: "none",
                    width: "40px",
                    minWidth: "40px",
                    padding: "0px",
                         cursor: writePermission === false ? "not-allowed" : "pointer",
        opacity: writePermission === false ? 0.5 : 1
                  }}
                  onClick={() => {
                           if (writePermission !== false) {
          exportToExcel(InitialValues);
        }
                  }}
                     disabled={writePermission === false}
                >
                  <FontAwesomeIcon
                    icon={faFileUpload}
                    style={{ width: "15px" }}
                  />
                </Button>
              </Tooltip>
            </div>
          </div>
          <Row>
            <Formik
              enableReinitialize={true}
              initialValues={InitialValues}
              validationSchema={Validation}
              onSubmit={(values, { resetForm }) =>
                pmmraId && failureMode
                  ? UpdatepmmraDetails(values)
                  : submit(values, { resetForm })
              }
            >
              {(formik) => {
                const {
                  values,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                } = formik;
                return (
                  <div>
                    <Form onSubmit={handleSubmit}>
                      <fieldset
                        disabled={
                          writePermission === true ||
                            writePermission === "undefined" ||
                            role === "admin" ||
                            (isOwner === true && createdBy === userId)
                            ? null
                            : "disabled"
                        }
                      >
                        <div className="mttr-sec mt-4 mb-2">
                          <p className=" mb-0 para-tag">
                            Consequence information
                          </p>
                        </div>
                        <Row>
                          <Col>
                            <Form.Group>
                              <Label notify={true}>FMECA Mode</Label>
                              <Select
                                name="FailureMode"
                                className="mt-1"
                                placeholder="Select Failure Mode"
                                value={
                                  fmecaOptions.find(
                                    (option) => option.value === failureMode
                                  ) || null
                                }
                                options={fmecaOptions}
                                styles={customStyles}
                                onBlur={handleBlur}
                                isDisabled={
                                  writePermission === true ||
                                    writePermission === "undefined" ||
                                    role === "admin" ||
                                    (isOwner === true && createdBy === userId)
                                    ? null
                                    : "disabled"
                                }
                                onChange={(e) => {
                                  setFieldValue("FailureMode", e.value);
                                  getFmecaFilterData(e.value);
                                  setFailureMode(e.value);
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Card className="mt-2 p-4 mttr-card">
                          <div>
                            <Row>
                              <Col md={6}>
                                <Form.Group>
                                  <Label notify={true}>End Effect</Label>
                                  {createSmartSelectField(
                                    "endeffect",
                                    "End Effect",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="endeffect"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Label notify={true}>Safety impact</Label>
                                  {createSmartSelectField(
                                    "safetyimpact",
                                    "Safety Impact",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="safetyimpact"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>
                                    Reliability Impact
                                  </Label>
                                  {createSmartSelectField(
                                    "reliability",
                                    "Reliability Impact",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="reliability"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Frequency</Label>
                                  {createSmartSelectField(
                                    "frequency",
                                    "Frequency",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="frequency"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Severity</Label>
                                  {createSmartSelectField(
                                    "severity",
                                    "Severity",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="severity"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Risk Index</Label>
                                  {createSmartSelectField(
                                    "riskindex",
                                    "Risk Index",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="riskindex"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                          </div>
                        </Card>

                        {/* MRA/RCM Section */}
                        <div className="mttr-sec mb-2 mt-4">
                          <p className=" mb-0 para-tag">MRA/RCM</p>
                        </div>
                        <Card className="mt-2 p-4 mttr-card">
                          <Row>
                            <Col md={6}>
                              <Form.Group>
                                <Label notify={true}>
                                  Loss of Function Evident?
                                </Label>
                                {createSmartSelectField(
                                  "Evident1",
                                  "Loss of Function Evident?",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Evident1"
                                />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>Significant Item ?</Label>
                                {createSmartSelectField(
                                  "Items",
                                  "Significant Item",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Items"
                                />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Condition Monitoring Task
                                </Label>
                                {createSmartSelectField(
                                  "condition",
                                  "Condition Monitoring Task",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="condition"
                                />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Failure Finding Task
                                </Label>
                                {createSmartSelectField(
                                  "failure",
                                  "Failure Finding Task",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="failure"
                                />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>Redesign?</Label>
                                {createSmartSelectField(
                                  "redesign",
                                  "Redesign",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="redesign"
                                />
                              </Form.Group>
                            </Col>

                            <Col md={6}>
                              <Form.Group>
                                <Label notify={true}>
                                  Criticality Acceptable ?
                                </Label>
                                {createSmartSelectField(
                                  "acceptable",
                                  "Criticality Acceptable",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="acceptable"
                                />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Lubrication / Service Task
                                </Label>
                                {createSmartSelectField(
                                  "lubrication",
                                  "Lubrication / Service Task",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="lubrication"
                                />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Restore or Discard Task
                                </Label>
                                {createSmartSelectField(
                                  "task",
                                  "Restore or Discard Task",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="task"
                                />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Combination of Tasks
                                </Label>
                                {createSmartSelectField(
                                  "combination",
                                  "Combination of Tasks",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="combination"
                                />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>RCM Notes</Label>
                                {createSmartSelectField(
                                  "rcmnotes",
                                  "RCM Notes",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="rcmnotes"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card>

                        {/* PM Section - You can continue this pattern for other sections */}
                        <div className="mttr-sec mb-2 mt-4">
                          <p className=" mb-0 para-tag">PM</p>
                        </div>
                        <Card className="mt-2 p-4 mttr-card">
                          <div>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>PM Task ID</Label>
                                  {createSmartSelectField(
                                    "pmtaskid",
                                    "PM Task ID",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="pmtaskid"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>PM Task type</Label>
                                  {createSmartSelectField(
                                    "PMtasktype",
                                    "PM Task Type",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="PMtasktype"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Task Interval Frequency</Label>
                                  {createSmartSelectField(
                                    "taskintervalFrequency",
                                    "Task Interval Frequency",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="taskintervalFrequency"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Task Interval Unit</Label>
                                  {createSmartSelectField(
                                    "taskIntervalunit",
                                    "Task Interval Unit",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="taskIntervalunit"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Task Interval</Label>
                                  {createSmartSelectField(
                                    "taskInterval",
                                    "Task Interval",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="taskInterval"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Scheduled Maintenance Task</Label>
                                  {createSmartSelectField(
                                    "scheduledMaintenanceTask",
                                    "Scheduled Maintenance Task",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="scheduledMaintenanceTask"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Task Description</Label>
                                  {createSmartSelectField(
                                    "taskDescription",
                                    "Task Description",
                                    values,
                                    setFieldValue
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="taskDescription"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            {/* Continue with other fields using the same pattern */}
                          </div>
                        </Card>

                        <div className="mttr-sec mb-2 mt-4">
                          <p className=" mb-0 para-tag">Task Time</p>
                        </div>

                        <Card style={{ backgroundColor: "#F2F1F2" }}>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML1</Label>
                                {createSmartSelectField(
                                  "tasktimeML1",
                                  "Task Time ML1",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="tasktimeML1"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML2</Label>
                                {createSmartSelectField(
                                  "tasktimeML2",
                                  "Task Time ML2",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="tasktimeML2"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML3</Label>
                                {createSmartSelectField(
                                  "tasktimeML3",
                                  "Task Time ML3",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="tasktimeML3"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML4</Label>
                                {createSmartSelectField(
                                  "tasktimeML4",
                                  "Task Time ML4",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="tasktimeML4"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML5</Label>
                                {createSmartSelectField(
                                  "tasktimeML5",
                                  "Task Time ML5",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="tasktimeML5"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML6</Label>
                                {createSmartSelectField(
                                  "tasktimeML6",
                                  "Task Time ML6",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="tasktimeML6"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML7</Label>
                                {createSmartSelectField(
                                  "tasktimeML7",
                                  "Task Time ML7",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="tasktimeML7"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card>

                        <div className="mttr-sec mb-2 mt-4">
                          <p className=" mb-0 para-tag">Man Power</p>
                        </div>

                        <Card className="mt-2 p-4 mttr-card">
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 1</Label>
                                {createSmartSelectField(
                                  "skill1",
                                  "Skill 1",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="skill1"
                                />
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 1 Nos</Label>
                                {createSmartSelectField(
                                  "skill1nos",
                                  "Skill 1 Nos",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="skill1nos"
                                />
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 1 Contribution</Label>
                                {createSmartSelectField(
                                  "skill1contribution",
                                  "Skill 1 Contribution",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="skill1contribution"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 2</Label>
                                {createSmartSelectField(
                                  "skill2",
                                  "Skill 2",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="skill2"
                                />
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 2 Nos</Label>
                                {createSmartSelectField(
                                  "skill2nos",
                                  "Skill 2 Nos",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="skill2nos"
                                />
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 2 Contribution</Label>
                                {createSmartSelectField(
                                  "skill2contribution",
                                  "Skill 2 Contribution",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="skill2contribution"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="mt-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 3</Label>
                                {createSmartSelectField(
                                  "skill3",
                                  "Skill 3",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="skill3"
                                />
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 3 Nos</Label>
                                {createSmartSelectField(
                                  "skill3nos",
                                  "Skill 3 Nos",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="skill3nos"
                                />
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 3 Contribution</Label>
                                {createSmartSelectField(
                                  "skill3contribution",
                                  "Skill 3 Contribution",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="skill3contribution"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card>

                        <div className="mttr-sec mb-2 mt-4">
                          <p className=" mb-0 para-tag">Replacement qty</p>
                        </div>

                        <Card style={{ backgroundColor: "#F2F1F2" }}>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Additional Replacement Spare1</Label>
                                {createSmartSelectField(
                                  "addReplacespare1",
                                  "Additional Replacement Spare1",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="addReplacespare1"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Additional Replacement Spare1 Qty</Label>
                                {createSmartSelectField(
                                  "addReplacespare1qty",
                                  "Additional Replacement Spare1 Qty",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="addReplacespare1qty"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Additional replacement spare2</Label>
                                {createSmartSelectField(
                                  "addReplacespare2",
                                  "Additional replacement spare2",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="addReplacespare2"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Additional Replacement Spare2 Qty</Label>
                                {createSmartSelectField(
                                  "addReplacespare2qty",
                                  "Additional Replacement Spare2 Qty",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="addReplacespare2qty"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Additional replacement spare3</Label>
                                {createSmartSelectField(
                                  "addReplacespare3",
                                  "Additional replacement spare3",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="addReplacespare3"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Additional Replacement Spare3 Qty</Label>
                                {createSmartSelectField(
                                  "addReplacespare3qty",
                                  "Additional Replacement Spare3 Qty",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="addReplacespare3qty"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 1</Label>
                                {createSmartSelectField(
                                  "Consumable1",
                                  "Consumable 1",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Consumable1"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 1 Qty</Label>
                                {createSmartSelectField(
                                  "consumable1Qty",
                                  "Consumable 1 Qty",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="consumable1Qty"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 2</Label>
                                {createSmartSelectField(
                                  "Consumable2",
                                  "Consumable 2",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Consumable2"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 2 Qty</Label>
                                {createSmartSelectField(
                                  "Consumable2qty",
                                  "Consumable 2 Qty",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Consumable2qty"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 3</Label>
                                {createSmartSelectField(
                                  "Consumable3",
                                  "Consumable 3",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Consumable3"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 3 Qty</Label>
                                {createSmartSelectField(
                                  "Consumable3qty",
                                  "Consumable 3 Qty",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Consumable3qty"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 4</Label>
                                {createSmartSelectField(
                                  "Consumable4",
                                  "Consumable 4",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Consumable4"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 4 Qty</Label>
                                {createSmartSelectField(
                                  "Consumable4qty",
                                  "Consumable 4 Qty",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Consumable4qty"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 5</Label>
                                {createSmartSelectField(
                                  "Consumable5",
                                  "Consumable 5",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Consumable5"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 5 Qty</Label>
                                {createSmartSelectField(
                                  "Consumable5qty",
                                  "Consumable 5 Qty",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="Consumable5qty"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card>

                        <div className="mttr-sec mb-2 mt-4">
                          <p className=" mb-0 para-tag">Remarks</p>
                        </div>

                        <Card className="mb-3" style={{ backgroundColor: "#F2F1F2" }}>
                          <Row className="px-3 pb-3">
                            <Col md={6} className="mt-4 mb-4">

                              <Form.Group className="mt-3">
                                <Label notify={true}>User Field 1</Label>
                                {createSmartSelectField(
                                  "userfield1",
                                  "User Field 1",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage className="error text-danger" component="span" name="userfield1" />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>User Field 2</Label>
                                {createSmartSelectField(
                                  "userfield2",
                                  "User Field 2",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage className="error text-danger" component="span" name="userfield2" />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>User Field 3</Label>
                                {createSmartSelectField(
                                  "userfield3",
                                  "User Field 3",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage className="error text-danger" component="span" name="userfield3" />
                              </Form.Group>

                            </Col>

                            <Col md={6} className="mt-4 mb-4">

                              <Form.Group className="mt-3">
                                <Label notify={true}>User Field 4</Label>
                                {createSmartSelectField(
                                  "userfield4",
                                  "User Field 4",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage className="error text-danger" component="span" name="userfield4" />
                              </Form.Group>

                              <Form.Group className="mt-3">
                                <Label notify={true}>User Field 5</Label>
                                {createSmartSelectField(
                                  "userfield5",
                                  "User Field 5",
                                  values,
                                  setFieldValue
                                )}
                                <ErrorMessage className="error text-danger" component="span" name="userfield5" />
                              </Form.Group>

                            </Col>
                          </Row>
                        </Card>


                        {/* Continue with other sections following the same pattern */}

                        <div className="d-flex flex-direction-row justify-content-end mt-4 mb-5">
                          <Button
                            className="delete-cancel-btn me-2"
                            variant="outline-secondary"
                            onClick={handleCancelClick}
                          >
                            CANCEL
                          </Button>
                          <Button
                            className="save-btn"
                            type="submit"
                            disabled={!productId}
                          >
                            SAVE CHANGES
                          </Button>
                        </div>
                      </fieldset>
                    </Form>
                  </div>
                );
              }}
            </Formik>
          </Row>
        </div>
      )}

      {/* Success Modal */}
      <Modal show={show} centered onHide={() => setShow(false)}>
        <div className="d-flex justify-content-center mt-5">
          <FontAwesomeIcon
            icon={faCircleCheck}
            fontSize={"40px"}
            color="#1D5460"
          />
        </div>
        <Modal.Footer className="d-flex justify-content-center mt-3 mb-5 success-message">
          <div className="success-message">
            <h5> {showValue} </h5>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Error Modal */}
      <div>
        <Modal show={value} centered onHide={() => setValue(false)}>
          <div className="d-flex justify-content-center mt-5">
            <FaExclamationCircle size={45} color="#de2222b0" />
          </div>
          <Modal.Footer className="d-flex justify-content-center" style={{ borderTop: 0 }}>
            <div>
              <h5 className="d-flex justify-content-center mt-3 mb-5">
                {showValue}
              </h5>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}