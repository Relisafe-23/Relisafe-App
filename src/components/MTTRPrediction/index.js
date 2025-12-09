import React, { useState, useEffect } from "react";
import {
  Button,
  Col,
  Form,
  Row,
  Modal,
  Container,
  Card,
} from "react-bootstrap";
import CreatableSelect from "react-select/creatable";

import Label from "../LabelComponent";
import "../../css/MttrPrediction.scss";
import { ErrorMessage, Formik } from "formik";
import Select from "react-select";
import Api from "../../Api";
import * as Yup from "yup";
import Tree from "../Tree";
import Dropdown from "../Company/Dropdown";
import Loader from "../core/Loader";
import { Mechanical, Electronic } from "../core/partTypeCategory";
import Tooltip from "@mui/material/Tooltip";
import Spinner from "react-bootstrap/esm/Spinner";
import { Alert } from "@mui/material";
import Projectname from "../Company/projectname";
import MaterialTable from "material-table";
import { tableIcons } from "../core/TableIcons";
import { ThemeProvider } from "@material-ui/core";
import { createTheme } from "@mui/material";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { customStyles } from "../core/select";
import { useHistory } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  faFileImport,
  faFileExport,
  faPlus,
  faFileDownload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { CropPortrait } from "@mui/icons-material";

const MTTRPrediction = (props, active) => {
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;

  const [initialTreeStructure, setInitialTreeStructure] = useState();
  const treeStructure = props?.location?.state?.parentId
    ? props?.location?.state?.parentId
    : initialTreeStructure;
  const [open, setOpen] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
  const [category, setCategory] = useState("");
  const [successMessage, setSuccessMessage] = useState();
  const [repairable, setRepairable] = useState("");
  const [levelOfReplace, setLevelOfReplace] = useState("");
  const [treeTableData, setTreeTabledata] = useState([]);
  const [levelOfRepair, setLevelOfRepair] = useState("");
  const [spare, setSpare] = useState("");
  const [show, setShow] = useState(false);
  const [partType, setPartType] = useState("");
  const [name, setName] = useState([]);
  const [reference, setReference] = useState([]);
  const [partNumber, setPartNumber] = useState([]);
  const [quantity, setQuantity] = useState([]);
  const [environment, setEnvironment] = useState([]);
  const [temperature, setTemperature] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [validateData, setValidateData] = useState();
  const [mttrData, setMttrData] = useState();
  const [mttrId, setMttrId] = useState();
  const [mlhValue, setMlhValue] = useState();
  const [mctValue, setMctValue] = useState();
  const [mttrCalculatedValue, setMttrCalculatedValue] = useState()
  const [totalLabourHr, setLabourHour] = useState();
  const [iniProductId, setInitialProductId] = useState();
  const [writePermission, setWritePermission] = useState();
  const role = localStorage.getItem("role");
  const history = useHistory();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [importExcelData, setImportExcelData] = useState({});
  const [shouldReload, setShouldReload] = useState(false);
  const [fieldValue, setFieldValue] = useState();
  const [allSepareteData, setAllSepareteData] = useState([]);
  const [connectData, setConnectData] = useState();
  const [mergedData, setMergedData] = useState([]);
  const [allConnectedData, setAllConnectedData] = useState([]);
  const [companyId, setCompanyId] = useState();
  const [selectedField, setSelectedField] = useState(null);
  const[connectedLibraryData,setConnectedLibraryData]=useState([]);
  const [treeTable, setTreeTable] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState();


  const [data, setData] = useState({
    toolType: "",
    time: "",
    totalLabour: "",
    skill: "",
    tools: "",
    partNo: "",
    taskType: "",
  });

  const handleInputChange = (selectedItems, name) => {
    setData((prevData) => ({
      ...prevData,
      [name]: selectedItems ? selectedItems.value : "",
    }));
  };
  // const getAllConnect = (values) => {
  //   // setIsLoading(true);
  //   Api.get("api/v1/library/get/all/connect/value", {
  //     params: {
  //       projectId: projectId,
  //       moduleName: values ? values : "",
  //     },
  //   }).then((res) => {
  //      console.log("res data123", res.data.getData);
  //      const filteredData = res?.data?.getData.filter(
  //       (item) => item?.moduleName === "MTTR" || item?.destinationName==="MTTR"
  //     );
  //     setIsLoading(false);
  //     setConnectData(filteredData);
  //        const merged = [...tableData, ...filteredData];
  //     setMergedData(merged);
  //     console.log("merged data", filteredData);
  //   });
  // };

const getAllConnect = (moduleName,sourceValue) => {
  Api.get("api/v1/library/get/all/connect/value", {
    params: {
      projectId: projectId,
      moduleName: moduleName || "",
        sourceValue: sourceValue,
    },
  })
    .then((res) => {
      // const rawData = res?.data?.getData || [];
    const filteredData = res.data.getData.filter(
        (entry) => entry?.libraryId?.moduleName === "MTTR" || entry?.destinationModuleName === "MTTR"
      );
      console.log("raw connect data", res); 
      const flattened = filteredData
  .flatMap((item) =>
    (item.destinationData || [])
      .filter(d => d.destinationModuleName === "MTTR") // Filter destinations by module
      .map((d) => ({
        sourceName: item.sourceName,
        sourceValue: item.sourceValue,
           destinationName: d.destinationName,
          destinationValue: d.destinationValue,
          destinationModuleName: d.destinationModuleName,
      }))
  );

      console.log("flattened connect data", flattened);

      setConnectData(flattened);
    })
    .catch((err) => {
      console.error("Error fetching connect data:", err);
    });
};


  const getAllSeprateLibraryData = async () => {
    const companyId = localStorage.getItem("companyId");
    setCompanyId(companyId);
    Api.get("api/v1/library/get/all/separate/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
       console.log("separate library data", res);
      const filteredData = res?.data?.data.filter(
        (item) => item?.moduleName === "MTTR"
      );
      setAllSepareteData(filteredData);
      const merged = [...tableData, ...filteredData];
      setMergedData(merged);
      console.log("filtered data", filteredData);
    });
  };

  useEffect(() => {
    getAllSeprateLibraryData();
    getAllConnectedLibrary();
     getAllConnect();
  }, []);

  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : iniProductId;

  const token = localStorage.getItem("sessionId");

  const handleReset = (resetForm) => {
    resetForm();
  };

  // Add this new function to apply Excel data to form fields
  const applyExcelDataToForm = (excelData) => {
    const fieldMappings = {
      'remarks': 'remarks',
      'repairable': 'repairable',
      'levelOfRepair': 'levelOfRepair',
      'levelOfReplace': 'levelOfReplace',
      'spare': 'spare',
      'mMax': 'mmax',
      'mttr': 'mttr',
      'time': 'time',
      'totalLabour': 'totalLabour',
      'skill': 'skill',
      'tools': 'tools',
      'partNo': 'partNo',
      'toolType': 'toolType',
      'taskType': 'taskType'
    };

    // Update formik values
    Object.keys(fieldMappings).forEach(excelField => {
      const formField = fieldMappings[excelField];
      if (excelData[excelField] !== undefined && excelData[excelField] !== null) {
        // For select fields that need object format
        if (['repairable', 'levelOfRepair', 'levelOfReplace', 'spare'].includes(formField)) {
          setFieldValue(formField, {
            label: excelData[excelField],
            value: excelData[excelField]
          });

          // Also update the corresponding state
          switch (formField) {
            case 'repairable':
              setRepairable({ label: excelData[excelField], value: excelData[excelField] });
              break;
            case 'levelOfRepair':
              setLevelOfRepair({ label: excelData[excelField], value: excelData[excelField] });
              break;
            case 'levelOfReplace':
              setLevelOfReplace({ label: excelData[excelField], value: excelData[excelField] });
              break;
            case 'spare':
              setSpare({ label: excelData[excelField], value: excelData[excelField] });
              break;
          }
        } else {
          // For regular text/number fields
          setFieldValue(formField, excelData[excelField]);
        }
      }
    });
  };
  const convertToJson = (headers, data) => {
    const rows = [];
    data.forEach((row) => {
      let rowData = {};
      row.forEach((element, index) => {
        rowData[headers[index]] = element;
      });
      rows.push(rowData);
      createMTTRDataFromExcel(rowData);
    });
  };
const createMTTRDataFromExcel = async (values) => {
  try {
    
    const companyId = localStorage.getItem("companyId");
    setCompanyId(companyId);
    const response = await Api.post("/api/v1/mttrPrediction/create/procedure", {
      projectId: projectId,
      productId: productId,
      companyId: companyId,
      remarks: values?.remarks,
      taskType: values?.taskType,
      time: values.time,
      totalLabour: values.totalLabour,
      skill: values.skill,
      tools: values.tools,
      partNo: values.partNo,
      toolType: values.toolType,
      repairable: values.repairable,
      levelOfRepair: values.levelOfRepair,
      levelOfReplace: values.levelOfReplace,
      spare: values.spare,
   
    });
  
    
  
    const mttrId = response?.data?.data?.id;
    setSuccessMessage(response?.data?.message);
    setMttrId(response?.data?.data?.id);
     setValidateData(response?.data?.data);
      getProcedureData();
    
    return { success: true, data: response.data };
  } catch (error) {
    const errorStatus = error?.response?.status;
    if (errorStatus === 401) {
      logout();
    } else {
      setOpen(true);
    }
    return { success: false, error };
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
      position: "top-right",
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    const bstr = event.target.result;
    const workBook = XLSX.read(bstr, { type: "binary" });
    const workSheetName = workBook.SheetNames[0];
    const workSheet = workBook.Sheets[workSheetName];
    const parsedData = XLSX.utils.sheet_to_json(workSheet, { defval: "" });

    if (parsedData.length > 0) {
      const normalizedData = parsedData.map((row, index) => ({
        remarks: row.remarks || "",
        time: row.time || "",
        skill: row.skill || "",
        tools: row.tools || "",
        taskType: row.taskType || "",
        totalLabour: row.totalLabour || "",
        partNo: row.partNo || "",
        toolType: row.toolType || "",
        repairable: row.repairable || "",
        levelOfRepair: row.levelOfRepair || "",
        levelOfReplace: row.levelOfReplace || "",
        spare: row.spare || "",
      }));

      setTableData((prevData) => [...prevData, ...normalizedData]);
        //       setTableData((prevData) => [...prevData, ...normalizedData]);
       setImportExcelData(normalizedData[normalizedData.length - 1]);
       applyExcelDataToForm(normalizedData[normalizedData.length - 1]);
      
      // Show loading
      setIsLoading(true);
      
      // Process each row with delay to avoid overwhelming the server
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < normalizedData.length; i++) {
        const rowData = normalizedData[i];
        const result = await createMTTRDataFromExcel(rowData);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
        
        // Optional: Add delay between requests
        if (i < normalizedData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setIsLoading(false);
      
      if (errorCount === 0) {
        toast.success(`All ${successCount} records imported successfully!`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.warning(`${successCount} records saved, ${errorCount} failed.`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } else {
      toast.error("No Data Found In Excel Sheet", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    }
  };

  reader.readAsBinaryString(file);
};

const exportToExcel = (value, productName) => {
  if (!value) {
    toast.error("Export Failed !! No Data Found", { position: "top-right" });
    return;
  }

  const fullTableData = tableData || [];
  
  // Remove the last row to avoid duplication
  const dataWithoutLastRow = fullTableData.slice(0, -1);
  
  const lastRow = fullTableData.length > 0 ? fullTableData[fullTableData.length - 1] : {};

  const originalData = {
    CompanyName: treeTableData[0]?.companyId?.companyName,
    ProjectName: treeTableData[0]?.projectId?.projectName,
    ProductName: value.name,
    remarks: value?.remarks || lastRow?.remarks || "-",
    taskType: value?.taskType || lastRow.taskType || "-",
    time: value.time || lastRow.time || "-",
    totalLabour: value.totalLabour || lastRow.totalLabour || "-",
    skill: value.skill || lastRow.skill || "-",
    tools: value.tools || lastRow.tools || "-",
    partNo: value.partNo || lastRow.partNo || "-",
    toolType: value.toolType || lastRow.toolType || "-",
    repairable: value.repairable?.value || value.repairable || lastRow.repairable || "-",
    levelOfRepair: value.levelOfRepair?.value || value.levelOfRepair || lastRow.levelOfRepair || "-",
    levelOfReplace: value.levelOfReplace?.value || value.levelOfReplace || lastRow.levelOfReplace || "-",
    spare: value.spare?.value || value.spare || lastRow.spare || "-",
  };

  const hasData = Object.values(originalData).some(
    (val) => val && val.toString().trim() !== ""
  );

  if (hasData) {
    // Use dataWithoutLastRow instead of fullTableData
    const updatedTableData = [...dataWithoutLastRow, originalData];
    
    const filteredData = updatedTableData.map(row => {
      const { productId, projectId, companyId, tableData, id, ...filteredRow } = row;
      return filteredRow;
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FormData");

    const fileName = `${productName || "MTTR"}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success("Export Successful!", { position: "top-right" });
  } else {
    toast.error("Export Failed !! No Data Found", { position: "top-right" });
  }
};


  const handleCancelClick = () => {
      if (isSaving) {
    setIsSaving(false); // Stop spinner if cancel is clicked during save
  }
    const shouldReloadPage = true;

    if (shouldReloadPage) {
      setShouldReload(true);
    } else {
      //  formik.resetForm();
      setOpen(false);
    }
  };

  if (shouldReload) {
  
    window.location.reload();
  }

  const getTreedata = () => {
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/productTreeStructure/list`, {
      params: {
        projectId: projectId,
        token: token,
        userId: userId,
      },
    })
      .then((res) => {
       console.log("product tree data", res);
        const treeData = res?.data?.data;
        setInitialProductId(res?.data?.data[0]?.treeStructure?.id);
        setInitialTreeStructure(res?.data?.data[0]?.id);
        setIsLoading(false);
        setTreeTabledata(treeData);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };


  const projectSidebar = () => {
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: {
        token: token,
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

  const userId = localStorage.getItem("userId");
  const getProjectPermission = () => {
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        authorizedPersonnel: userId,
        projectId: projectId,
        token: token,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setWritePermission(data?.modules[2].write);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
 
  const getAllConnectedLibrary = async (fieldValue, fieldName) => {
    Api.get("api/v1/library/get/all/source/value", {
      params: {
        projectId: projectId,
        moduleName: "MTTR",
        sourceName: fieldName,
        sourceValue: fieldValue?.value,
      },
    }).then((res) => {
      console.log("getAllConnectedLibrary response", res);
      const data = res?.data?.libraryData;
      setAllConnectedData(data);
    });
  };

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
  }, [projectId]);

  useEffect(() => {
    getTreedata();
    propstoGetTreeData();
    getProcedureData();
    getMttrData();

  }, [productId]);

  const propstoGetTreeData = () => {
    setIsSpinning(true);
    const userId = localStorage.getItem("userId");
    Api.get("/api/v1/productTreeStructure/get/tree/product/list", {
      params: {
        projectId: projectId,
        treeStructureId: productId,
        token: token,
        userId: userId,
      },
    })
      .then((res) => {
    //  console.log("propstoGetTreeData response", res);
        const data = res?.data?.data;
        setCategory(
          data?.category ? { label: data?.category, value: data?.category } : ""
        );
        setQuantity(data?.quantity);
        setReference(data?.reference);
        setName(data?.productName);
        setPartNumber(data?.partNumber);
        setEnvironment(
          data?.environment
            ? { label: data?.environment, value: data?.environment }
            : ""
        );
        setTemperature(data?.temperature);
        setPartType(
          data?.partType ? { label: data?.partType, value: data?.partType } : ""
        );
        setIsSpinning(false);
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
  const columns = [
    {
      title: "S.No",
      render: (rowData) => `${rowData?.tableData?.id + 1}`,
    },

{
  title: "Task Type",
  field: "taskType",
  type: "string",
  // headerStyle: { textAlign: "center" },
  cellStyle: { minWidth: "150px" },

  // validate: (rowData) => {
  //   if (!rowData?.taskType) return "required";
  //   return true;
  // },
editComponent: ({ value, onChange }) => {
  const seperateFilteredData = 
  allSepareteData?.filter((item) => item?.sourceName === "TaskType") || [];
    const connectedFilteredData =
      connectData?.filter((item) => item?.destinationName === "TaskType") || [];
  // For connected data, show both source values AND destination values that match "TaskType"
   const options =
      connectedFilteredData.length > 0
        ? connectedFilteredData.map((item) => ({
            value: item.destinationValue,
            label: item.destinationValue,
          }))
        : seperateFilteredData.map((item) => ({
            value: item.sourceValue,
            label: item.sourceValue,
          }));

      
   

 

  const selectedOption =
    options.find((opt) => opt.value === value) ||
    (value ? { label: value, value } : null);

  if (!options || options.length === 0) {
    return (
      <div style={{ position: "relative" }}>
        <input
          type="text"
          name="taskType"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            height: "40px",
            borderRadius: "4px",
            width: "100%",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <CreatableSelect
        name="taskType"
        value={selectedOption}
        onChange={(selected) => {
          onChange(selected?.value || "");
        }}
        options={options}
        isClearable
        menuPortalTarget={document.body}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    </div>
  );
}

}
,

   {
  title: "Average Task Time(Hours)",
  field: "time",
  type: "string",
  // headerStyle: { textAlign: "center" },
  cellStyle: { minWidth: "150px" },

  // validate: (rowData) => {
  //   if (!rowData?.time) return "required";
  //   return true;
  // },

  editComponent: ({ value, onChange }) => {
    const seperateFilteredData =
      allSepareteData?.filter((item) => item?.sourceName === "time") || [];

    const connectedFilteredData =
      connectData?.filter((item) => item?.destinationName === "time") || [];

    const options =
      connectedFilteredData.length > 0
        ? connectedFilteredData.map((item) => ({
            value: item.destinationValue,
            label: item.destinationValue,
          }))
        : seperateFilteredData.map((item) => ({
            value: item.sourceValue,
            label: item.sourceValue,
          }))  || connectedLibraryData;

    // If dropdown has no options → show normal input
    if (!options || options.length === 0) {
      return (
        <input
          type="text"
          name="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Average Task Time"
          style={{ height: "40px", borderRadius: "4px", width: "140px" }}
          title="Enter Average Task Time"
        />
      );
    }

    // Dropdown mode
    const selectedOption = value ? { label: value, value } : null;

    return (
      <CreatableSelect
        name="time"
        value={selectedOption}
        // onChange={(selected) => {
        //   const newValue = selected?.value || "";
        //   onChange(newValue);
        //   handleInputChange(selected, "time");
        //   getAllConnectedLibrary(selected, "time");
        // }}
          onChange={(selected) => {
          onChange(selected?.value || "");               // MUST be simple string
        }}
        options={options || connectedLibraryData}
        isClearable
        menuPortalTarget={document.body}       
        styles={{
          ...customStyles,
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),  
          container: (base) => ({ ...base, width: "150px" }), // match field size
        }}
      />
    );
  },
}
, 
  {
  title: "No of Labours",
  field: "totalLabour",
  type: "string",
  // headerStyle: { textAlign: "center" },
  cellStyle: { minWidth: "150px" },

  // validate: (rowData) => {
  //   if (!rowData?.totalLabour) return "required";
  //   return true;
  // },

  editComponent: ({ value, onChange }) => {
    const seperateFilteredData =
      allSepareteData?.filter((item) => item?.sourceName === "totalLabour") || [];

    const connectedFilteredData =
       connectData?.filter((item) => item?.destinationName === "totalLabour") || [];

    const options =
      connectedFilteredData.length > 0
        ? connectedFilteredData.map((item) => ({
            value: item.destinationValue,
            label: item.destinationValue,
          }))
        : seperateFilteredData.map((item) => ({
            value: item.sourceValue,
            label: item.sourceValue,
          }));

    // If NO options → use normal input box
    if (!options || options.length === 0) {
      return (
        <input
          type="text"
          name="totalLabour"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="No of Labours"
          style={{ height: "40px", borderRadius: "4px", width: "100px" }}
          title="Enter Labour Count"
        />
      );
    }

    // Dropdown mode
    const selectedOption = value ? { label: value, value } : null;

    return (
      <CreatableSelect
        name="totalLabour"
        value={selectedOption}
        // onChange={(selected) => {
        //   const newValue = selected?.value || "";
        //   onChange(newValue);
        //   handleInputChange(selected, "totalLabour");
        //   getAllConnectedLibrary(selected, "totalLabour");
        // }}
          onChange={(selected) => {
          onChange(selected?.value || "");               // MUST be simple string
        }}
        options={options}
        isClearable
        menuPortalTarget={document.body}   // ⭐ Fix click/visibility issue
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),  // ⭐ Required for MaterialTable
          container: (base) => ({ ...base, width: "140px" }),
        }}
      />
    );
  },
}
,
    {
      title: "Skills",
      field: "skill",
      type: "string",
      // headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "150px" },
      // validate: (rowData) => {
      //   if (rowData?.skill === undefined || rowData?.skill === "") {
      //     return "required";
      //   }
      //   return true;
      // },


   editComponent: ({ value, onChange }) => {
  const seperateFilteredData =
    allSepareteData?.filter((item) => item?.sourceName === "skill") || [];

  const conncetedFilteredData =
   connectData?.filter(
      (item) => item?.destinationName === "skill"
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

  // If no options → regular textbox
  if (!options || options.length === 0) {
    return (
      <input
        type="text"
        name="skill"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Skill"
        style={{ height: "40px", borderRadius: "4px", width: "100px" }}
        title="Enter Skill"
      />
    );
  }

  return (
    <CreatableSelect
      name="skill"
      value={value ? { label: value, value } : null}   // FIXED
      // onChange={(selected) => {
      //   onChange(selected?.value || "");                    // FIXED
      //   handleInputChange(selected, "skill");
      //   getAllConnectedLibrary(selected, "skill");
      // }}
        onChange={(selected) => {
          onChange(selected?.value || "");               // MUST be simple string
        }}
      options={options}
        isClearable
      menuPortalTarget={document.body}                // PREVENT CONTENT CLIPPING
      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
    />
  );
}

    },
   {
  title: "Tools",
  field: "tools",
  type: "string",
  // headerStyle: { textAlign: "center" },
  cellStyle: { minWidth: "150px" },

  editComponent: ({ value, onChange }) => {
    const seperateFilteredData =
      allSepareteData?.filter((item) => item?.sourceName === "tools") || [];

    const conncetedFilteredData =
      connectData?.filter(
        (item) => item?.destinationName === "tools"
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

    // If no options - normal text input
    if (!options || options.length === 0) {
      return (
        <input
          type="text"
          name="tools"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tools"
          style={{ height: "40px", borderRadius: "4px", width: "100px" }}
          title="Enter Tools"
        />
      );
    }

    return (
      <CreatableSelect
        name="tools"
        value={value ? { label: value, value } : null}   // ✅ FIXED
        // onChange={(selected) => {
        //   onChange(selected?.value);                    // ✅ FIXED
        //   handleInputChange(selected, "tools");
        //   getAllConnectedLibrary(selected, "tools");
        // }}
          onChange={(selected) => {
          onChange(selected?.value || "");               // MUST be simple string
        }}
        options={options}
         isClearable
        menuPortalTarget={document.body}               // ✅ Prevent dropdown clipping
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
    );
  },
},

{
  title: "Part no",
  field: "partNo",
  type: "string",
  cellStyle: { minWidth: "150px" },

  editComponent: ({ value, onChange }) => {
    const seperateFilteredData =
      allSepareteData?.filter((item) => item?.sourceName === "partNo") || [];

    const conncetedFilteredData =
      connectData?.filter(
        (item) => item?.destinationName === "partNo"
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

    // If no dropdown data → show text box
    if (!options || options.length === 0) {
      return (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    return (
      <CreatableSelect
        value={value ? { label: value, value } : null}     // ✔ Like Tool Type
        // onChange={(selected) => {
        //   onChange(selected?.value || "");                 // ✔ Must return string
        //   handleInputChange(selected, "partNo");
        //   getAllConnectedLibrary(selected, "partNo");
        // }}
          onChange={(selected) => {
          onChange(selected?.value || "");               // MUST be simple string
        }}
        options={options}
        isClearable                                      // ✔ Show X button
        menuPortalTarget={document.body}                 // ✔ Fix dropdown clip
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          container: (base) => ({ ...base, width: "150px" }),
        }}
      />
    );
  },
},


  {
  title: "Tool Type",
  field: "toolType",
  type: "string",
  // headerStyle: { textAlign: "center" },
  cellStyle: { minWidth: "120px" },

  editComponent: ({ value, onChange }) => {
    const seperateFilteredData =
      allSepareteData?.filter((item) => item?.sourceName === "toolType") || [];

    const conncetedFilteredData =
       connectData?.filter(
        (item) => item?.destinationName === "toolType"
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
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    return (
      <CreatableSelect
        value={value ? { label: value, value } : null}   // ✅ FIXED
        onChange={(selected) => {
          onChange(selected?.value || "");               // MUST be simple string
        }}
        options={options}
        isClearable

        menuPortalTarget={document.body}                // 🔥 Fix dropdown issue
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          container: (base) => ({ ...base, width: "150px" }),
        }}
      />
    );
  },
}

  ];

  const submitSchema = Yup.object().shape({
    repairable: Yup.object().required("Repairable is required"),
    partNumber: Yup.string().required("Part Number is Required"),
    quantity: Yup.string().required("Quantity is Required"),
    environment: Yup.object().required("Environment is Required"),
    temperature: Yup.string().required("Temperature is Required"),
    category: Yup.object().required("Category required"),
    levelOfReplace: Yup.object().required("Level of replace is required"),
    levelOfRepair:
      repairable?.value != "Yes"
        ? null
        : Yup.object().required("Level of repair is required"),
    spare: Yup.object().required("Spare is required"),
    mct: Yup.string().required("MCT is required"),
    mlh: Yup.string().required("MLH is required"),
    remarks: Yup.string().min(3, 'Minimum 3 characters required')
      .max(200, 'Maximum 200 characters allowed')
    // labourHour: Yup.string().required("Labour hour is required"),
    // partType:
    //   category === "" || category === "Assembly"
    //     ? Yup.string().nullable()
    //     : Yup.object().required("Part Type is Required"),
  });

  const CreateProcedureData = (value) => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    Api.post("/api/v1/mttrPrediction/create/procedure", {
      time: value.time,
      totalLabour: value.totalLabour,
      skill: value.skill,
      tools: value.tools,
      partNo: value.partNo,
      toolType: value.toolType,
      taskType: value.taskType,
      projectId: projectId,
      productId: productId,
      companyId: companyId,
      mttrId: mttrId,
      treeStructureId: treeStructure,
      token: token,
      userId: userId,
    })
      .then((response) => {
     
        const data = response?.data?.procedureData?.taskType;
        setValidateData(data);
        getProcedureData();

      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // const updateProcedureData = (value) => {
  //   const companyId = localStorage.getItem("companyId");
  //   const rowId = value?.id;

  //   const userId = localStorage.getItem("userId");

  //   Api.patch(`/api/v1/mttrPrediction/update/procedure/${rowId}`, {
  //     time: value.time,
  //     totalLabour: value.totalLabour,
  //     skill: value.skill,
  //     tools: value.tools,
  //     partNo: value.partNo,
  //     toolType: value.toolType,
  //     taskType: value.taskType,
  //     projectId: projectId,
  //     productId: productId,
  //     companyId: companyId,
  //     treeStructureId: treeStructure,
  //     token: token,
  //     userId: userId,
  //   })
  //     .then((response) => {
  //       getProcedureData();
  //       toast.success("Procedure Updated Successfully");
  //     })
  //     .catch((error) => {
  //       const errorStatus = error?.response?.status;
  //       if (errorStatus === 401) {
  //         logout();
  //       }
  //     });
  // };


  const updateProcedureData = (value) => {

    const companyId = localStorage.getItem("companyId");
    const rowId = value?.id;
    const userId = localStorage.getItem("userId");

    // Prepare the data object with all required fields
    const requestData = {
      time: value.time || "",
      totalLabour: value.totalLabour || "",
      skill: value.skill || "",
      tools: value.tools || "",
      partNo: value.partNo || "",
      toolType: value.toolType || "",
      taskType: value.taskType || "",
      projectId: projectId,
      productId: productId,
      companyId: companyId,
      treeStructureId: treeStructure,
      token: token,
      userId: userId,

    };


    Api.patch(`/api/v1/mttrPrediction/update/procedure/${rowId}`, requestData)
      .then((response) => {
        // console.log("Update Response:", response);
        getProcedureData();
        toast.success("Procedure Updated Successfully");
      })
      .catch((error) => {

        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        } else {
          toast.error("Failed to update procedure");
        }
      });
  };

  const getProcedureData = () => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    Api.get("/api/v1/mttrPrediction/get/procedure/", {
      params: {
        projectId: projectId,
        productId: productId,
        companyId: companyId,
        mttrId: mttrId,
        token: token,
        userId: userId,
      },
    })
      .then((response) => {
        
        setTableData(response?.data?.procedureData);
        setValidateData(response?.data?.procedureData?.length);
        const mttrResult = response.data.mttrResult;

        setLabourHour(mttrResult?.sumOfTotal);
        setMlhValue(mttrResult?.Totalmlh);
        setMctValue(mttrResult?.sumOfTime);

        const mttrValue = mttrResult?.sumOfTotal && mttrResult?.sumOfTime
          ? mttrResult.sumOfTime / mttrResult.sumOfTotal
          : 0;

        setMttrCalculatedValue(mttrValue);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const deleteProcedureData = (value) => {
    const rowId = value?.id;
    const userId = localStorage.getItem("userId");
    Api.delete(`/api/v1/mttrPrediction/delete/procedure/${rowId}`, {
      headers: {
        token: token,
        userId: userId,
      },
    })
      .then((response) => {
        getProcedureData();
        toast.error("Procedure Deleted Successfully");
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const submitForm = (values) => {
     setIsSaving(true);
    checkingMandatoryFields(values);
        getMttrData();
  };

  const checkingMandatoryFields = (values) => {
    if (validateData > 0) {
      const companyId = localStorage.getItem("companyId");

      const userId = localStorage.getItem("userId");
      Api.post("api/v1/mttrPrediction", {
        companyId: companyId,
        projectId: projectId,
        productId: productId,
        repairable: repairable.value,
        levelOfReplace: levelOfReplace.value,
        levelOfRepair: levelOfRepair.value,
        spare: spare.value,
        mct: mctValue,
        mlh: mlhValue,
        totalLabourHr: totalLabourHr,
        mMax: values.mmax,
        mttr: values.mttr,
        remarks: values.remarks,
        treeStructureId: treeStructure,
        token: token,
        userId: userId,
      })
        .then((res) => {
          const mttrId = res?.data?.data?.id;
          setSuccessMessage(res?.data?.message);
          setMttrId(res?.data?.data?.id);
           setIsSaving(false);
          NextPage();

        })
        .catch((error) => {
          const errorStatus = error?.response?.status;
           setIsSaving(false);
          if (errorStatus === 401) {
            logout();
          }
        });
    } else {
      setOpen(true);
       setIsSaving(false);
    }
  };

  const patchMttrData = (values) => {
    if (validateData > 0) {
      setIsSaving(true); 
      const companyId = localStorage.getItem("companyId");

      Api.patch(`/api/v1/mttrPrediction/${mttrId}`, {
        companyId: companyId,
        projectId: projectId,
        productId: productId,
        repairable: repairable.value,
        levelOfReplace: levelOfReplace.value,
        levelOfRepair: levelOfRepair.value,
        spare: spare.value,
        mct: mctValue,
        mlh: mlhValue,
        totalLabourHr: totalLabourHr,
        mMax: values.mmax,
        mttr: values.mttr,
        remarks: values.remarks,
        mttrId: mttrId,
        treeStructureId: treeStructure,
        token: token,
      })
        .then((res) => {
          setSuccessMessage(res.data.message);
          NextPage();
           setIsSaving(false); 
        })
        .catch((error) => {
          const errorStatus = error?.response?.status;
           setIsSaving(false);
          if (errorStatus === 401) {
            logout();
          }
        });
    } else {
      setOpen(true);
       setIsSaving(false); 
    }
  };
  const getMttrData = () => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    Api.get("/api/v1/mttrPrediction/details", {
      params: {
        projectId: projectId,
        productId: productId,
        companyId: companyId,
        token: token,
        userId: userId,
      },
    })
      .then((res) => {
       console.log("MTTR Data1", res);
        setMttrData(res?.data?.data);
        const data = res?.data?.data;
        setMttrId(res?.data?.data?.id ? res?.data?.data?.id : null);
        // setMttrId(res?.data?.data?.id);
        setRepairable(
          data?.repairable
            ? { label: data?.repairable, value: data?.repairable }
            : ""
        );
        setLevelOfRepair(
          data?.levelOfRepair
            ? {
              label: data?.levelOfRepair,
              value: data?.levelOfRepair,
            }
            : ""
        );
        setLevelOfReplace(
          data?.levelOfReplace
            ? {
              label: data?.levelOfReplace,
              value: data?.levelOfReplace,
            }
            : ""
        );
        setSpare(data?.spare ? { label: data?.spare, value: data?.spare } : "");
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const NextPage = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  return (
    <Container className="mttr-main-div mx-1" style={{ marginTop: "45px" }}>
      {isLoading ? (
        <Loader />
      ) : (
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: name,
            category: category,
            partNumber: partNumber,
            partType: partType,
            reference: reference,
            quantity: quantity,
            environment: environment,
            temperature: temperature,
            repairable: importExcelData?.repairable ?
              { label: importExcelData.repairable, value: importExcelData.repairable } :
              repairable,
            levelOfRepair: importExcelData?.levelOfRepair ?
              { label: importExcelData.levelOfRepair, value: importExcelData.levelOfRepair } :
              levelOfRepair,
            levelOfReplace: importExcelData?.levelOfReplace ?
              { label: importExcelData.levelOfReplace, value: importExcelData.levelOfReplace } :
              levelOfReplace,
            spare: importExcelData?.spare ?
              { label: importExcelData.spare, value: importExcelData.spare } :
              spare,
            mct: mctValue ? mctValue : "",
            mlh: mlhValue ? mlhValue : "",
            labourHour: totalLabourHr ? totalLabourHr : "",
            mttr: importExcelData?.mttr || mttrCalculatedValue || "",
            remarks: importExcelData?.remarks ?? mttrData?.remarks ?? "",
            mmax: importExcelData?.mMax || mttrData?.mMax || "",
            taskType: importExcelData?.taskType || "",
            time: importExcelData?.time || "",
           totalLabour: importExcelData?.totalLabour || "",
            skill: importExcelData?.skill || "",
            tools: importExcelData?.tools || "",
            partNo: importExcelData?.partNo || "",
            toolType: importExcelData?.toolType || "",
          }}
          validationSchema={submitSchema}
          onSubmit={(values, { resetForm }) => {
            setIsSaving(true); 
            mttrId ? patchMttrData(values) : submitForm(values);
          }}
        >

          {(formik) => {
            const {
              values,
              handleChange,
              handleSubmit,
              handleBlur,
              setFieldValue,
            } = formik;
            return (
              <div>
                <Form onSubmit={handleSubmit} onReset={handleReset}>
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
                          marginTop: "1px",
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
                            style={{ marginLeft: "10px", borderStyle: "none", width: "40px", top: "-2px", minWidth: "38px", padding: "0px", }}
                            onClick={() => exportToExcel(values)}
                          >
                            <FontAwesomeIcon
                              icon={faFileUpload}
                              style={{ width: "12px" }}
                            />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                    <Row className="d-flex">
                      <div className="mttr-sec mt-3">
                        <p className=" mb-0 para-tag">General Information</p>
                      </div>

                      <Card className="mt-2 mttr-card ">
                        {isSpinning ? (
                          <Spinner
                            className="spinner"
                            animation="border"
                            variant="secondary"
                            centered
                          />
                        ) : (
                          <div className=" p-4">
                            <Row>
                              <Col>
                                <Form.Group>
                                  <Label className="mb-1">Name</Label>

                                  <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    disabled
                                    value={values.name}
                                    // onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                  />
                                  {/* <ErrorMessage className="error text-danger" component="span" name="name" /> */}
                                </Form.Group>
                              </Col>
                              <Col>
                                <Form.Group>
                                  <Label notify="true">Part Number</Label>
                                  <Form.Control
                                    type="text"
                                    name="partNumber"
                                    disabled
                                    placeholder="Part Number"
                                    value={values.partNumber}
                                    className="mt-1"
                                    onBlur={handleBlur}
                                  // onChange={handleChange}
                                  />
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="partNumber"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Form.Group className="mt-3">
                                  <Label notify="true">Quantity</Label>

                                  <Form.Control
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    disabled
                                    placeholder="Quantity"
                                    value={values.quantity}
                                    className="mt-1"
                                    // onChange={handleChange}

                                    onBlur={handleBlur}
                                  />
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="quantity"
                                  />
                                </Form.Group>
                              </Col>
                              <Col>
                                <Form.Group className="mt-3">
                                  {" "}
                                  <Label>Reference or Position</Label>
                                  <Form.Control
                                    type="text"
                                    name="reference"
                                    disabled
                                    placeholder="Reference or Position"
                                    className="mt-1"
                                    value={values.reference}
                                    // onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="reference"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Form.Group className="mt-3">
                                  <Label notify="true">Category</Label>

                                  <Select
                                    type="select"
                                    styles={customStyles}
                                    value={values.category}
                                    placeholder="Select"
                                    name="category"
                                    onBlur={handleBlur}
                                    isDisabled
                                    // isDisabled={
                                    //   writePermission === true ||
                                    //   writePermission === "undefined" ||
                                    //   role === "admin" ||
                                    //   (isOwner === true &&
                                    //     createdBy === userId)
                                    //     ? null
                                    //     : "disabled"
                                    // }
                                    className="mt-1"
                                    // onChange={(e) => {
                                    //   setFieldValue("category", e);
                                    //   setCategory(e);
                                    // }}
                                    options={[
                                      {
                                        value: "Electronic",
                                        label: "Electronic",
                                      },
                                      {
                                        value: "Mechanical",
                                        label: "Mechanical",
                                      },
                                      {
                                        value: "Assembly",
                                        label: "Assembly",
                                      },
                                    ]}
                                  />
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="category"
                                  />
                                </Form.Group>
                              </Col>
                              <Col className="part-type-aln">
                                {category.value === "Mechanical" ||
                                  category.value === "Electronic" ? (
                                  <div>
                                    <Form.Group>
                                      <Label notify={true}>Part Type</Label>
                                      <Select
                                        type="select"
                                        styles={customStyles}
                                        value={values.partType}
                                        placeholder="Select Part Type"
                                        name="partType"
                                        onBlur={handleBlur}
                                        isDisabled
                                        // isDisabled={
                                        //   writePermission === true ||
                                        //   writePermission === "undefined" ||
                                        //   role === "admin" ||
                                        //   (isOwner === true &&
                                        //     createdBy === userId)
                                        //     ? null
                                        //     : "disabled"
                                        // }
                                        // onChange={(e) => {
                                        //   setFieldValue("partType", e);
                                        //   setPartType(e.value);
                                        // }}
                                        options={[
                                          category.value === "Electronic"
                                            ? {
                                              options: Electronic.map(
                                                (list) => ({
                                                  value: list.value,
                                                  label: list.label,
                                                })
                                              ),
                                            }
                                            : {
                                              options: Mechanical.map(
                                                (list) => ({
                                                  value: list.value,
                                                  label: list.label,
                                                })
                                              ),
                                            },
                                        ]}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="partType"
                                      />
                                    </Form.Group>
                                  </div>
                                ) : null}
                              </Col>
                              {/* <Col>
                              <Form.Group>
                                <Label>Suma</Label>
                              </Form.Group>
                              </Col> */}
                            </Row>
                          </div>
                        )}
                      </Card>
                      <div className="mttr-sec mt-4 ">
                        <p className=" mb-0 para-tag">
                          Environment Profile and Temperature
                        </p>
                      </div>
                      <Card className="mt-2 mttr-card">
                        {isSpinning ? (
                          <Spinner
                            className="spinner_2"
                            animation="border"
                            variant="secondary"
                            centered
                          />
                        ) : (
                          <Row className="p-4">
                            <Col>
                              <Form.Group>
                                <Label notify={true} className="mb-1">
                                  Environment
                                </Label>
                                <Select
                                  type="select"
                                  styles={customStyles}
                                  placeholder="Select"
                                  className="mt-1"
                                  value={values.environment}
                                  name="environment"
                                  isDisabled
                                  // isDisabled={
                                  //   writePermission === true ||
                                  //   writePermission === "undefined" ||
                                  //   role === "admin" ||
                                  //   (isOwner === true && createdBy === userId)
                                  //     ? null
                                  //     : "disabled"
                                  // }
                                  // onChange={(e) => {
                                  //   setFieldValue("environment", e);
                                  //   setEnvironment(e);
                                  // }}
                                  onBlur={handleBlur}
                                // options={[
                                //   { value: null, label: "None" },
                                //   {
                                //     options: Environment.map((list) => ({
                                //       value: list.value,
                                //       label: list.label,
                                //     })),
                                //   },
                                // ]}
                                />
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="environment"
                                />
                              </Form.Group>
                            </Col>
                            <Col>
                              <Form.Group>
                                <Label notify={true}>Temperature</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  disabled
                                  name="temperature"
                                  placeholder="Temperature"
                                  value={values.temperature}
                                  className="mt-1"
                                  // onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="temperature"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        )}
                      </Card>
                      <div className="mttr-sec mt-4 ">
                        <p className=" mb-0 para-tag">MTTR Prediction</p>
                      </div>
                      <Card className="mt-2 mttr-card ">
                        {isSpinning ? (
                          <Spinner
                            className="spinner_2"
                            animation="border"
                            variant="secondary"
                            centered
                          />
                        ) : (
                          <div className="p-4">
                            <div>
                              <Alert
                                severity="info"
                                className="warning-message"
                              >
                                Note: Assembly is repaired by replacing one or
                                more of its lower level parts.The level of
                                repair of the lower level parts must be equal to
                                the level of replace of assembly
                              </Alert>
                            </div>
                            <Row>
                              <Col>
                                <Form.Group>
                                  <Label notify={true}>Repairable</Label>

                                  <Select
                                    type="select"
                                    value={repairable}
                                    styles={customStyles}
                                    name="repairable"
                                    placeholder="Select"
                                    onBlur={handleBlur}
                                    isDisabled={
                                      writePermission === true ||
                                        writePermission === "undefined" ||
                                        role === "admin" ||
                                        (isOwner === true && createdBy === userId)
                                        ? null
                                        : "disabled"
                                    }
                                    className="mt-1"
                                    onChange={(e) => {
                                      setLevelOfRepair("");
                                      setFieldValue("repairable", e);
                                      setRepairable(e);
                                    }}
                                    options={[
                                      { value: "No", label: "No" },
                                      { value: "Yes", label: "Yes" },
                                    ]}
                                  />
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="repairable"
                                  />
                                </Form.Group>
                              </Col>
                              <Col>
                                {repairable?.value !== "Yes" ? (
                                  <Form.Group>
                                    <Label notify={true}>Level of Repair</Label>
                                    <Select
                                      value={levelOfRepair}
                                      styles={customStyles}
                                      placeholder="Select"
                                      type="select"
                                      isDisabled
                                      className="mt-1 react-select__option"
                                    />{" "}
                                    <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="levelOfRepair"
                                    />
                                  </Form.Group>
                                ) : (
                                  <Form.Group>
                                    <Label notify={true}>Level of Repair</Label>
                                    <Select
                                      value={levelOfRepair}
                                      styles={customStyles}
                                      placeholder="Select"
                                      type="select"
                                      onBlur={handleBlur}
                                      isDisabled={
                                        writePermission === true ||
                                          writePermission === "undefined" ||
                                          role === "admin" ||
                                          (isOwner === true &&
                                            createdBy === userId)
                                          ? null
                                          : "disabled"
                                      }
                                      className="mt-1 react-select__option"
                                      name="levelOfRepair"
                                      onChange={(e) => {
                                        setFieldValue("levelOfRepair", e);
                                        setLevelOfRepair(e);
                                      }}
                                      options={[
                                        {
                                          value: "1",
                                          label: "1",
                                        },
                                        {
                                          value: "2",
                                          label: "2",
                                        },
                                        {
                                          value: "3",
                                          label: "3",
                                        },
                                        {
                                          value: "4",
                                          label: "4",
                                        },
                                        {
                                          value: "5",
                                          label: "5",
                                        },
                                        {
                                          value: "6",
                                          label: "6",
                                        },
                                        {
                                          value: "7",
                                          label: "7",
                                        },
                                      ]}
                                    />
                                    <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="levelOfRepair"
                                    />
                                  </Form.Group>
                                )}
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Form.Group className="mt-3">
                                  {" "}
                                  <Label notify={true}>Level of Replace</Label>
                                  <Select
                                    value={levelOfReplace}
                                    styles={customStyles}
                                    type="select"
                                    placeholder="Select"
                                    onBlur={handleBlur}
                                    isDisabled={
                                      writePermission === true ||
                                        writePermission === "undefined" ||
                                        role === "admin" ||
                                        (isOwner === true && createdBy === userId)
                                        ? null
                                        : "disabled"
                                    }
                                    name="levelOfReplace"
                                    className="mt-1"
                                    onChange={(e) => {
                                      setFieldValue("levelOfReplace", e);
                                      setLevelOfReplace(e);
                                    }}
                                    options={[
                                      {
                                        value: "1",
                                        label: "1",
                                      },
                                      {
                                        value: "2",
                                        label: "2",
                                      },
                                      {
                                        value: "3",
                                        label: "3",
                                      },
                                      {
                                        value: "4",
                                        label: "4",
                                      },
                                      {
                                        value: "5",
                                        label: "5",
                                      },
                                      {
                                        value: "6",
                                        label: "6",
                                      },
                                      {
                                        value: "7",
                                        label: "7",
                                      },
                                    ]}
                                  />
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="levelOfReplace"
                                  />
                                </Form.Group>
                              </Col>
                              <Col>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Spare</Label>
                                  <Select
                                    className="mt-1"
                                    styles={customStyles}
                                    placeholder="Select"
                                    value={spare}
                                    isDisabled={
                                      writePermission === true ||
                                        writePermission === "undefined" ||
                                        role === "admin" ||
                                        (isOwner === true && createdBy === userId)
                                        ? null
                                        : "disabled"
                                    }
                                    type="text"
                                    onBlur={handleBlur}
                                    name="spare"
                                    onChange={(e) => {
                                      setFieldValue("spare", e);
                                      setSpare(e);
                                    }}
                                    options={[
                                      { value: "No", label: "No" },
                                      { value: "Yes", label: "Yes" },
                                      { value: "None", label: "None" },
                                    ]}
                                  />
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="spare"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <div className="d-flex justify-content-center mt-3">
                                <Button
                                  className="btn-mttr fw-bold mil-button save-btn"
                                  variant="info"
                                  onClick={() => setOpen(true)}
                                >
                                  MIL 472 Procedure 5A
                                </Button>
                              </div>
                            </Row>
                          </div>
                        )}
                      </Card>

                      <div className="mttr-sec mt-4 ">
                        <p className="mb-0 para-tag">Result</p>
                      </div>
                      <Card className="p-4 mttr-card ">
                        {validateData ? null : (
                          <Alert severity="info" className="warning-message">
                            <b>
                              Please click MIL 472 procedure 5A Button from MTTR
                              Prediction for result section
                            </b>
                          </Alert>
                        )}
                        <div>
                          <Row>
                            <Col>
                              <Form.Group className="mt-3">
                                <Label notify={true}>MCT</Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="any"
                                  name="mct"
                                  disabled
                                  placeholder="MCT"
                                  className="mt-1"
                                  value={values.mct}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="mct"
                                />
                              </Form.Group>
                            </Col>
                            <Col>
                              <Form.Group className="mt-3">
                                <Label notify={true}>MLH</Label>
                                <Form.Control
                                  type="number"
                                  className="mt-1"
                                  name="mlh"
                                  disabled
                                  min="0"
                                  step="any"
                                  placeholder="MLH"
                                  value={values.mlh}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="mlh"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <Form.Group className="mt-3">
                                <Label>MTTR</Label>
                                <Tooltip
                                  title="(Calculated only for family type - Assemblie)"
                                  arrow
                                >

                                  <Form.Control
                                    type="number"
                                    name="mttr"
                                    step="any"
                                    disabled
                                    min="0"
                                    placeholder="MTTR"
                                    className="mt-1"
                                    value={values.mttr}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />

                                </Tooltip>
                                <ErrorMessage
                                  className="text-danger"
                                  component="span"
                                  name="mttr"
                                />
                              </Form.Group>
                            </Col>
                            <Col>
                              <Form.Group className="mt-3">
                                <Label>Mmax</Label>
                                <Form.Control
                                  type="number"
                                  name="mmax"
                                  disabled
                                  min="1"
                                  step="any"
                                  placeholder="Mmax"
                                  className="mt-1"
                                  value={values.mmax}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />

                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="mmax"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <Form.Group className="mt-3">
                                <Label>Remarks</Label>
                                <Form.Control
                                  type="text"
                                  className="mt-1"
                                  name="remarks"
                                  placeholder="Remarks"
                                  value={values.remarks}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                <ErrorMessage
                                  className="error text-danger"
                                  component="span"
                                  name="remarks"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>{" "}
                      </Card>

<div className="d-flex flex-direction-row justify-content-end mt-4 mb-5">
  <Button
    className="delete-cancel-btn me-2"
    variant="outline-secondary"
    type="reset"
    onClick={handleCancelClick}
    disabled={isSaving} // Disable cancel when saving
  >
    CANCEL
  </Button>

  <Button
    className="save-btn position-relative"
    type="submit"
    disabled={!productId || isSaving}
    style={{ minWidth: "140px" }}
  >
    {isSaving ? (
      <>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          className="me-2"
          style={{ width: "1rem", height: "1rem" }}
        />
        SAVING...
      </>
    ) : (
      "SAVE CHANGES"
    )}
  </Button>
</div>
                      <Modal show={show} centered onHide={() => setShow(!show)}>
                        <div className="d-flex justify-content-center mt-5">
                          <FontAwesomeIcon
                            icon={faCircleCheck}
                            fontSize={"40px"}
                            color="#1D5460"
                          />
                        </div>
                        <Modal.Footer
                          className=" d-flex justify-content-center mt-3 mb-5 success-message"
                          style={{ marginTop: 0 }}
                        >
                          <div>
                            <h4>{successMessage}</h4>
                          </div>
                        </Modal.Footer>
                      </Modal>

                      <Modal
                        show={open}
                        dialogClassName="mttr-modal-main"
                        backdrop="static"
                        centered
                        size="lg"
                      >
                        <Modal.Header
                          style={{ borderBottom: 0 }}
                          className="d-flex justify-content-center"
                        >
                          <br />
                        </Modal.Header>
                        {productId ? (
                          <Alert
                            severity="info"
                            className=" mttr-alert mx-3 mb-0"
                          >
                            Please fill these fields
                          </Alert>
                        ) : (
                          <Alert
                            severity="info"
                            className=" mttr-alert mx-3 mb-0"
                          >
                            Please Select the product Dropdown before filling
                            these field
                          </Alert>
                        )}
                        <Modal.Body>
                          <ThemeProvider theme={tableTheme}>
                            <MaterialTable
                              editable={{
                          onRowAdd: productId
  ? (newRow) =>
    new Promise((resolve, reject) => {
      // Check if any required fields are filled
      const hasData = 
        newRow.taskType?.trim() || 
        newRow.time?.trim() || 
        newRow.totalLabour?.trim() || 
        newRow.skill?.trim() || 
        newRow.tools?.trim() || 
        newRow.partNo?.trim() || 
        newRow.toolType?.trim();
      
      if (!hasData) {
        toast.error("Please fill at least one field before saving");
        reject();
        return;
      }
      
      CreateProcedureData(newRow);
      resolve();
    })
  : null,

onRowUpdate: (newRow, oldData) =>
  new Promise((resolve, reject) => {
    // Check if any data has actually changed
    const hasChanges = 
      newRow.taskType !== oldData.taskType ||
      newRow.time !== oldData.time ||
      newRow.totalLabour !== oldData.totalLabour ||
      newRow.skill !== oldData.skill ||
      newRow.tools !== oldData.tools ||
      newRow.partNo !== oldData.partNo ||
      newRow.toolType !== oldData.toolType;
    
    if (!hasChanges) {
      toast.error("No changes detected");
      reject();
      return;
    }
    
    updateProcedureData(newRow);
    resolve();
  }),
                                // onRowUpdate: (newRow, oldData) =>
                                //   new Promise((resolve, reject) => {
                                //     updateProcedureData(newRow);
                                //     resolve();
                                //   }),
                                  onRowDelete: (selectedRow) =>
                                  new Promise((resolve, reject) => {
                                    deleteProcedureData(selectedRow);
                                    resolve();
                                  }),

                              }}
                              title="Separate Library"
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
                            />
                          </ThemeProvider>
                        </Modal.Body>
                        <Modal.Footer style={{ borderTop: 0 }}>
                          <Button
                            className="save-btn "
                            onClick={() => setOpen(false)}
                          >
                            Close
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </Row>
                  </fieldset>
                </Form>
              </div>
            );
          }}
        </Formik>
      )}
    </Container>
  );
};

export default MTTRPrediction;
