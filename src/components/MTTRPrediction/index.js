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

const MTTRPrediction = (props, active) => {
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;

  const [initialTreeStructure, setInitialTreeStructure] = useState();
  const treeStructure = props?.location?.state?.parentId
    ? props?.location?.state?.parentId
    : initialTreeStructure;
  const [open, setOpen] = useState(false);
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
  const [tableData, setTableData] = useState();
  const [validateData, setValidateData] = useState();
  const [mttrData, setMttrData] = useState();
  const [mttrId, setMttrId] = useState();
  const [mlhValue, setMlhValue] = useState();
  const [mctValue, setMctValue] = useState();
  const [totalLabourHr, setLabourHour] = useState();
  const [iniProductId, setInitialProductId] = useState();
  const [writePermission, setWritePermission] = useState();
  const role = localStorage.getItem("role");
  const history = useHistory();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [importExcelData, setImportExcelData] = useState({});
  const [shouldReload, setShouldReload] = useState(false);

  const [allSepareteData, setAllSepareteData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [allConnectedData, setAllConnectedData] = useState([]);
  const [companyId, setCompanyId] = useState();
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
      const filteredData = res?.data?.data.filter(
        (item) => item?.moduleName === "MTTR"
      );
      setAllSepareteData(filteredData);
      const merged = [...tableData, ...filteredData];
      setMergedData(merged);
    });
  };
  useEffect(() => {
    getAllSeprateLibraryData();
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

  const importExcel = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, { type: "binary" });
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const excelData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      // console.log(excelData);

      // if (excelData.length > 1) {
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
        setImportExcelData(parsedData[0]);
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
    if (file) {
    }
    reader.readAsBinaryString(file);
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

  const createMTTRDataFromExcel = (values) => {
    const companyId = localStorage.getItem("companyId");

    setIsLoading(true);

    Api.post("/api/v1/mttrPrediction/create/procedure", {
      remarks: values.remarks,
    })
      .then((res) => {
        const mttrId = res?.data?.data?.id;
        setSuccessMessage(res?.data?.message);
        setMttrId(res?.data?.data?.id);
        NextPage();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        } else {
          setOpen(true);
        }
      });
  };

  const exportToExcel = (value, productName) => {
    const originalData = {
      remarks: value.remarks,
    };

    // if (originalData.length > 0) {

    const hasData = Object.values(originalData).some((value) => !!value);

    if (hasData) {
      const dataArray = [];

      dataArray.push(originalData);
      const ws = XLSX?.utils?.json_to_sheet(dataArray);
      const wb = XLSX.utils?.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "FormData");
      const fileName = `${""}MTTR.xlsx`;
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

  const handleCancelClick = () => {
    const shouldReloadPage = true;

    if (shouldReloadPage) {
      setShouldReload(true);
    } else {
      //  formik.resetForm();
      setOpen(false);
    }
  };

  if (shouldReload) {
    // Reload the page
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

  //ProjectOwner validation
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
        moduleName: "PMMRA",
        sourceName: fieldName,
        sourceValue: fieldValue.value,
      },
    }).then((res) => {
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
        const data = res?.data?.data;
        console.log("data.......mttr ...",data)

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
      title: "TaskType",
      field: "taskType",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "110px" },
      validate: (rowData) => {
        if (rowData?.taskType === undefined || rowData?.taskType === "") {
          return "required";
        }
        return true;
      },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "TaskType") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "TaskType"
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
              name="TaskType"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Task Type"
              style={{ height: "40px", borderRadius: "4px", width: "80px" }}
              title="Enter Task Type"
            />
          );
        }
        return (
          <Select
            name="TaskType"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "TaskType");
              getAllConnectedLibrary(selectedItems, "TaskType");
            }}
            options={options}
          />
        );
      },
    },
    {
      title: "Average Task Time(Hours)",
      field: "time",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "110px" },
      validate: (rowData) => {
        if (rowData.time === undefined || rowData.time === "") {
          return "required";
        }
        return true;
      },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "time") || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "time"
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
              name="time"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Average Task Time"
              style={{ height: "40px", borderRadius: "4px", width: "140px" }}
              title="Enter Average Task Time"
            />
          );
        }
        return (
          <Select
            name="time"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "time");
              getAllConnectedLibrary(selectedItems, "time");
            }}
            options={options}
          />
        );
      },
    },
    {
      title: "No of Labours",
      field: "totalLabour",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "110px" },
      validate: (rowData) => {
        if (rowData?.totalLabour === undefined || rowData?.totalLabour === "") {
          return "required";
        }
        return true;
      },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter(
            (item) => item?.sourceName === "totalLabour"
          ) || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
            (item) => item?.destinationName === "totalLabour"
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
              name="totalLabour"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="No of Labours"
              style={{ height: "40px", borderRadius: "4px", width: "100px" }}
              title="Enter No of Labours"
            />
          );
        }
        return (
          <Select
            name="totalLabour"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "totalLabour");
              getAllConnectedLibrary(selectedItems, "totalLabour");
            }}
            options={options}
          />
        );
      },
    },
    {
      title: "Skills",
      field: "skill",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "110px" },
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
          allConnectedData?.filter(
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
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="skill"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Skill"
              style={{ height: "40px", borderRadius: "4px", width: "100px" }}
              title="Enter Skill"
            />
          );
        }
        return (
          <Select
            name="skill"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "skill");
              getAllConnectedLibrary(selectedItems, "skill");
            }}
            options={options}
          />
        );
      },
    },
    {
      title: "Tools",
      field: "tools",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "110px" },
      // validate: (rowData) => {
      //   if (rowData?.tools === undefined || rowData?.tools === "") {
      //     return "required";
      //   }
      //   return true;
      // },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "tools") || [];
        const conncetedFilteredData =
          allConnectedData?.filter(
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
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="tools"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Tools"
              style={{ height: "40px", borderRadius: "4px", width: "100px" }}
              title="Enter Tools"
            />
          );
        }
        return (
          <Select
            name="tools"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "tools");
              getAllConnectedLibrary(selectedItems, "tools");
            }}
            options={options}
          />
        );
      },
    },
    {
      title: "Part no",
      field: "partNo",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "110px" },
      // validate: (rowData) => {
      //   if (rowData?.partNo === undefined || rowData?.partNo === "") {
      //     return "required";
      //   }
      //   return true;
      // },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "partNo") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
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
        if (!options || options.length === 0) {
          return (
            <input
              type="text"
              name="partNo"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Part No"
              style={{ height: "40px", borderRadius: "4px", width: "100px" }}
              title="Enter Part No"
            />
          );
        }
        return (
          <Select
            name="partNo"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "partNo");
              getAllConnectedLibrary(selectedItems, "partNo");
            }}
            options={options}
          />
        );
      },
    },
    {
      title: "Tool Type",
      field: "toolType",
      type: "string",
      headerStyle: { textAlign: "center" },
      cellStyle: { minWidth: "120px" },
      // validate: (rowData) => {
      //   if (rowData?.toolType === undefined || rowData?.toolType === "") {
      //     return "required";
      //   }
      //   return true;
      // },
      editComponent: ({ value, onChange }) => {
        const seperateFilteredData =
          allSepareteData?.filter((item) => item?.sourceName === "toolType") ||
          [];
        const conncetedFilteredData =
          allConnectedData?.filter(
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
              name="toolType"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="toolType"
              style={{ height: "40px", borderRadius: "4px", width: "100px" }}
              title="Enter toolType"
            />
          );
        }
        return (
          <Select
            name="toolType"
            value={value ? { label: value, value: value } : ""}
            onChange={(selectedItems) => {
              onChange(selectedItems?.value);
              handleInputChange(selectedItems, "toolType");
              getAllConnectedLibrary(selectedItems, "toolType");
            }}
            options={options}
          />
        );
      },
    },
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

  const updateProcedureData = (value) => {
    const companyId = localStorage.getItem("companyId");
    const rowId = value?.id;

    const userId = localStorage.getItem("userId");

    Api.patch(`/api/v1/mttrPrediction/update/procedure/${rowId}`, {
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
      treeStructureId: treeStructure,
      token: token,
      userId: userId,
    })
      .then((response) => {
        getProcedureData();
        toast.success("Procedure Updated Successfully");
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
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
    checkingMandatoryFields(values);
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
          NextPage();
        })
        .catch((error) => {
          const errorStatus = error?.response?.status;
          if (errorStatus === 401) {
            logout();
          }
        });
    } else {
      setOpen(true);
    }
  };

  const patchMttrData = (values) => {
    if (validateData > 0) {
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
        })
        .catch((error) => {
          const errorStatus = error?.response?.status;
          if (errorStatus === 401) {
            logout();
          }
        });
    } else {
      setOpen(true);
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
            repairable: repairable,
            levelOfRepair: levelOfRepair,
            levelOfReplace: levelOfReplace,
            spare: spare,
            mct: mctValue ? mctValue : "",
            mlh: mlhValue ? mlhValue : "",
            labourHour: totalLabourHr ? totalLabourHr : "",
            mttr: mttrData?.mttr ? mttrData?.mttr : "",

            remarks: mttrData?.remarks
              ? mttrData?.remarks
              : importExcelData?.remarks
              ? importExcelData.remarks
              : "",
            mmax: mttrData?.mMax ? mttrData?.mMax : "",
            taskType: "",
            time: "",
            numberOfLabour: "",
            skill: "",
            tools: "",
            partNo: "",
            toolType: "",
          }}
          validationSchema={submitSchema}
          onSubmit={(values, { resetForm }) => {
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
                            onClick={() => exportToExcel(values)}
                          >
                            <FontAwesomeIcon
                              icon={faFileUpload}
                              style={{ width: "15px" }}
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
                                  min="0"
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
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>{" "}
                      </Card>

                      <div className="d-flex flex-direction-row justify-content-end  mt-4 mb-5">
                        <Button
                          className="delete-cancel-btn me-2 "
                          variant="outline-secondary"
                          type="reset"
                          // onClick={() => {
                          //   formik.resetForm();
                          // }}
                          onClick={handleCancelClick}
                        >
                          CANCEL
                        </Button>

                        <Button
                          className="save-btn  "
                          type="submit"
                          disabled={!productId}
                        >
                          SAVE CHANGES
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
                                        CreateProcedureData(newRow);
                                        resolve();
                                      })
                                  : null,
                                onRowUpdate: (newRow, oldData) =>
                                  new Promise((resolve, reject) => {
                                    updateProcedureData(newRow);
                                    resolve();
                                  }),
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
