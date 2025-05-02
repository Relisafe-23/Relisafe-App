/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form, Modal, Button } from "react-bootstrap";
import Label from "../core/Label";
import { Formik, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";
import Api from "../../Api";
import Select from "react-select";
import * as Yup from "yup";
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

const Validation = Yup.object().shape({
  category: Yup.object().required("Category is required"),
  parttype: Yup.object().required("Part type is required"),
  partnumber: Yup.string().required("Part number is required"),
  // quantity: Yup.string().required("Quantity is required"),
  // repairable: Yup.object().required("Repairable is required"),
  // levelofreplace: Yup.object().required("Level of replace is required"),
  riskindex: Yup.string().required("Risk index is required"),
  // levelofrepair: Yup.object().required("Level of repair is required"),
  // spare: Yup.object().required("Spare is required"),
  endeffect: Yup.string().required("End effect is required"),
  reliability: Yup.string().required("Reliability impact is required"),
  severity: Yup.string().required("Severity is required"),
  safetyimpact: Yup.string().required("Safety impact is required"),
  frequency: Yup.string().required("Frequency is required"),
  // pmtaskid: Yup.string().required("PM task id is required"),
  // taskintervalFrequency: Yup.string().required(
  //   "Task interval frequency is required"
  // ),
  // PMtasktype: Yup.string().required("PM task type is required"),
  // taskIntervalunit: Yup.object().required("Task interval unit is required"),
  // scheduledMaintenanceTask: Yup.string().required(
  //   "Schedule maintenance task type is required"
  // ),
});

export default function PMMRA(props) {
  // const pmmraPermission = props?.location?.state?.pmmraWrite;
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;
  const [partType, setPartType] = useState();
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
  const [allConnectedData, setAllConnectedData] = useState([]);
  const [initialProductId, setInitialProductId] = useState();
  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
    ? props?.location?.state?.productId
    : initialProductId;
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
  const [colDefs, setColDefs] = useState();
  const [importExcelData, setImportExcelData] = useState({});
  const [shouldReload, setShouldReload] = useState(false);
  const [open, setOpen] = useState(false);
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
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, { type: "binary" });
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const excelData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      // if (excelData[1].length > 1) {
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
      rcmNotes: values.rcmnotes,
      pmTaskId: values.pmtaskid,
      pmTaskType: values.PMtasktype,
      taskIntrvlFreq: values.taskintervalFrequency,
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
      consumable1Qty: values.Consumable1qty,
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
      endEffect: value.endeffect,
      safetyImpact: value.safetyimpact,
      reliabilityImpact: value.reliability,
      frequency: value.frequency,
      rcmNotes: value.rcmnotes,
      pmTaskId: value.pmtaskid,
      pmTaskType: value.PMtasktype,
      taskIntrvlFreq: value.taskintervalFrequency,
      LatitudeFreqTolrnc: value.latitudeFrequency,
      scheduleMaintenceTsk: value.scheduledMaintenanceTask,
      tskInteralDetermination: value.taskInterval,
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
      consumable1Qty: value.Consumable1qty,
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
    // if (originalData.length > 0) {

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
        type: "error", // Change this to "error" to display an error message
      });
    }
  };

  const handleCancelClick = () => {
    // Perform any necessary checks to determine if a reload is required
    const shouldReloadPage = true; // Change this condition as needed

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
  const [companyId, setCompanyId] = useState();
  const [allSepareteData, setAllSepareteData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [tableData, setTableData] = useState();
  const [fmecaId, setFmecaId] = useState();
  const [fmecaFillterData, setFmecaFillterData] = useState();
  const [data, setData] = useState({
    endEffect: "",
    safetyImpact: "",
    reliability: "",
    frequency: "",
    severity: "",
    riskIndex: "",
    Evident1: "",
    Items: "",
    condition: "",
    failure: "",
    redesign: "",
    acceptable: "",
    Lubrication: "",
    task: "",
    combination: "",
    rcmnotes: "",
    pmtaskid: "",
    PMtasktype: "",
    taskintervalFrequency: "",
    taskIntervalunit: "",
    scheduledMaintenanceTask: "",
    taskInterval: "",
    taskDescription: "",
    tasktimeML1: "",
    tasktimeML2: "",
    tasktimeML3: "",
    tasktimeML4: "",
    tasktimeML5: "",
    tasktimeML6: "",
    tasktimeML7: "",
    skill1: "",
    skill1nos: "",
    skill1contribution: "",
    skill2: "",
    skill2nos: "",
    skill2contribution: "",
    skill3: "",
    skill3nos: "",
    skill3contribution: "",
    addReplacespare1: "",
    addReplacespare1qty: "",
    addReplacespare2: "",
    addReplacespare2qty: "",
    addReplacespare3: "",
    addReplacespare3qty: "",
    Consumable1: "",
    Consumable1qty: "",
    Consumable2: "",
    Consumable2qty: "",
    Consumable3: "",
    Consumable3qty: "",
    Consumable4: "",
    Consumable4qty: "",
    Consumable5: "",
    Consumable5qty: "",
    userfield1: "",
    userfield2: "",
    userfield3: "",
    userfield4: "",
    userfield5: "",
  });

  // const handleInputChange = (selectedItems, name) => {
  //   setData((prevData) => ({
  //     ...prevData,
  //     [name]: selectedItems ? selectedItems.value : "", // Assuming you want to store the selected value
  //   }));
  // };

  const getAllSeprateLibraryData = async () => {
    const companyId = localStorage.getItem("companyId");
    setCompanyId(companyId);
    Api.get("api/v1/library/get/all/separate/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      const filteredData = res?.data?.data.filter(
        (item) => item?.moduleName === "PMMRA"
      );
      setAllSepareteData(filteredData);
      // const merged = [...tableData, ...filteredData];
      const merged = [...(tableData || []), ...filteredData];
      setMergedData(merged);
    });
  };
  useEffect(() => {
    getAllSeprateLibraryData();
    getFMECAData();
  }, [productId]);

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };
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
        setWritePermission(data?.modules[6].write);
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
  }, [productId]);

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
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

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
      fmecaId: fmecaFillterData?.fmecaId,
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
      severity: Severity ? Severity : value?.severity?.value,
      riskIndex: riskIndex ? riskIndex : value?.riskIndex?.value,
      LossOfEvident: lossofFuntEvident
        ? lossofFuntEvident
        : value?.lossofFuntEvident?.value,
      significantItem: significantItem
        ? significantItem
        : value?.significantItem?.value,
      criticalityAccept: criticallyAccept
        ? criticallyAccept
        : value?.criticallyAccept?.value,
      LubricationservceTsk: lubrication
        ? lubrication
        : value?.lubrication?.value,
      conditionMonitrTsk: conditionMonitrTsk
        ? conditionMonitrTsk
        : value?.conditionMonitrTsk?.value,
      restoreDiscrdTsk: restoreDiscardTsk
        ? restoreDiscardTsk
        : value?.restoreDiscardTsk?.value,
      failureFindTsk: failureFindTask
        ? failureFindTask
        : value?.failureFindTask?.value,
      combinationOfTsk: combinationofTsk
        ? combinationofTsk
        : value?.combinationofTsk?.value,
      reDesign: reDesign ? reDesign : value?.reDesign?.value,
      rcmNotes:
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
        : value?.taskIntervalUnit?.value,
      LatitudeFreqTolrnc:
        values?.latitudeFrequency && values?.latitudeFrequency?.value
          ? values?.latitudeFrequency?.value
          : values?.latitudeFrequency,
      scheduleMaintenceTsk:
        values?.scheduledMaintenanceTask &&
        values?.scheduledMaintenanceTask?.value
          ? values?.scheduledMaintenanceTask?.value
          : values?.scheduledMaintenanceTask,
      tskInteralDetermination:
        values?.taskInterval && values?.taskInterval?.value
          ? values?.taskInterval?.value
          : values?.taskInterval,
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
        values?.Consumable1qty && values?.consumable1Qty?.value
          ? values?.consumable1Qty?.value
          : values?.consumable1Qty,
      consumable2:
        values?.Consumable2 && values?.consumable2?.value
          ? values?.consumable2?.value
          : values?.consumable2,
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
        setFmecaId(pmmraData?.fmecaId);
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
      fmecaId: fmecaFillterData?.fmecaId,
      spare: spare,
      endEffect: values.endeffect,
      safetyImpact: values.safetyimpact,
      reliabilityImpact: values.reliability,
      frequency: values.frequency,
      severity: Severity,
      riskIndex: riskIndex,
      LossOfEvident: lossofFuntEvident,
      significantItem: significantItem,
      criticalityAccept: criticallyAccept,
      LubricationservceTsk: lubrication,
      conditionMonitrTsk: conditionMonitrTsk,
      restoreDiscrdTsk: restoreDiscardTsk,
      failureFindTsk: failureFindTask,
      combinationOfTsk: combinationofTsk,
      reDesign: reDesign,
      rcmNotes: values.rcmnotes,
      pmTaskId: values.pmtaskid,
      pmTaskType: values.PMtasktype,
      taskIntrvlFreq: values.taskintervalFrequency,
      taskIntrvlUnit: taskIntervalUnit,
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
      consumable1Qty: values.Consumable1qty,
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

  const NextPage = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  const getFmecaFilterData = (value) => {
    const filteredData = fmecaData.filter((item) => item.fmecaId === value);
    setFmecaFillterData(filteredData[0]);
  };

  const fmecaOptions = fmecaData.map((item) => ({
    value: item?.fmecaId,
    label: item?.fmecaId,
  }));

  const InitialValues = {
    name: name,
    partnumber: partNumber,
    repairable: mttrRepairable,
    spare: mttrSpare,
    levelofrepair: mttrLevelOfRepair,
    levelofreplace: mttrLevelOfReplace,
    reference: reference,
    category: category,
    parttype: partType,
    quantity: quantity,
    fmecaId: fmecaFillterData?.fmecaId,
    endeffect: fmecaFillterData?.endEffect
      ? fmecaFillterData.endEffect
      : importExcelData?.endEffect
      ? importExcelData.endEffect
      : "",
    reliability: fmecaFillterData?.realibilityImpact
      ? fmecaFillterData.realibilityImpact
      : importExcelData?.reliabilityImpact
      ? importExcelData.reliabilityImpact
      : "",
    severity: fmecaFillterData?.severity
      ? fmecaFillterData.severity
      : importExcelData?.severity
      ? importExcelData.severity
      : "",
    safetyimpact: fmecaFillterData?.safetyImpact
      ? fmecaFillterData.safetyImpact
      : importExcelData?.safetyImpact
      ? importExcelData.safetyImpact
      : "",
    frequency: fmecaFillterData?.frequency
      ? fmecaFillterData.frequency
      : importExcelData?.frequency
      ? importExcelData.frequency
      : "",
    riskindex: fmecaFillterData?.riskIndex
      ? fmecaFillterData.riskIndex
      : importExcelData?.riskIndex
      ? importExcelData.riskIndex
      : "",

    // endeffect: pmmraData?.endEffect
    //   ? pmmraData?.endEffect
    //   : importExcelData?.endEffect
    //   ? importExcelData.endEffect
    //   : "",
    // reliability: pmmraData?.reliabilityImpact
    //   ? pmmraData?.reliabilityImpact
    //   : importExcelData?.reliabilityImpact
    //   ? importExcelData.reliabilityImpact
    //   : "",
    // severity: pmmraData?.severity ? { label: pmmraData?.severity, value: pmmraData?.severity } : "",
    // safetyimpact: pmmraData?.safetyImpact
    //   ? pmmraData?.safetyImpact
    //   : importExcelData?.safetyImpact
    //   ? importExcelData.safetyImpact
    //   : "",
    // rcmnotes: pmmraData?.rcmNotes ? pmmraData?.rcmNotes : importExcelData?.rcmNotes ? importExcelData.rcmNotes : "",
    // frequency: pmmraData?.frequency
    //   ? pmmraData?.frequency
    //   : importExcelData?.frequency
    //   ? importExcelData.frequency
    //   : "",
    // riskindex: pmmraData?.riskIndex ? { label: pmmraData?.riskIndex, value: pmmraData?.riskIndex } : "",
    // pmtaskid: pmmraData?.pmTaskId ? pmmraData?.pmTaskId : importExcelData?.pmTaskId ? importExcelData.pmTaskId : "",
    // taskintervalFrequency: pmmraData?.taskIntrvlFreq
    //   ? pmmraData?.taskIntrvlFreq
    //   : importExcelData?.taskIntrvlFreq
    //   ? importExcelData.taskIntrvlFreq
    //   : "",
    // Evident1: pmmraData?.LossOfEvident ? { label: pmmraData?.LossOfEvident, value: pmmraData?.LossOfEvident } : "",
    // latitudeFrequency: pmmraData?.LatitudeFreqTolrnc
    //   ? pmmraData?.LatitudeFreqTolrnc
    //   : importExcelData?.LatitudeFreqTolrnc
    //   ? importExcelData.LatitudeFreqTolrnc
    //   : "",
    // PMtasktype: pmmraData?.pmTaskType
    //   ? pmmraData?.pmTaskType
    //   : importExcelData?.pmTaskType
    //   ? importExcelData.pmTaskType
    //   : "",
    // taskInterval: pmmraData?.tskInteralDetermination
    //   ? pmmraData?.tskInteralDetermination
    //   : importExcelData?.tskInteralDetermination
    //   ? importExcelData.tskInteralDetermination

    pmtaskid: pmmraData?.pmTaskId ? pmmraData?.pmTaskId : "",
    taskintervalFrequency: pmmraData?.taskIntrvlFreq
      ? pmmraData?.taskIntrvlFreq
      : "",
    Evident1: pmmraData?.LossOfEvident
      ? { label: pmmraData?.LossOfEvident, value: pmmraData?.LossOfEvident }
      : "",
    latitudeFrequency: pmmraData?.LatitudeFreqTolrnc
      ? pmmraData?.LatitudeFreqTolrnc
      : "",
    PMtasktype: pmmraData?.pmTaskType ? pmmraData?.pmTaskType : "",
    taskInterval: pmmraData?.tskInteralDetermination
      ? pmmraData?.tskInteralDetermination
      : "",
    taskIntervalunit: pmmraData?.taskIntrvlUnit
      ? { label: pmmraData?.taskIntrvlUnit, value: pmmraData?.taskIntrvlUnit }
      : "",
    scheduledMaintenanceTask: pmmraData?.scheduleMaintenceTsk
      ? pmmraData?.scheduleMaintenceTsk
      : //   : importExcelData?.scheduleMaintenceTsk
        //   ? importExcelData.scheduleMaintenceTsk
        //   : "",
        // taskDescription: pmmraData?.taskDesc
        //   ? pmmraData?.taskDesc
        //   : importExcelData?.taskDesc
        //   ? importExcelData.taskDesc
        //   : "",
        // tasktimeML1: pmmraData?.tskTimeML1
        //   ? pmmraData?.tskTimeML1
        //   : importExcelData?.tskTimeML1
        //   ? importExcelData.tskTimeML1
        //   : "",
        // tasktimeML2: pmmraData?.tskTimeML2
        //   ? pmmraData?.tskTimeML2
        //   : importExcelData?.tskTimeML2
        //   ? importExcelData.tskTimeML2
        //   : "",
        // tasktimeML3: pmmraData?.tskTimeML3
        //   ? pmmraData?.tskTimeML3
        //   : importExcelData?.tskTimeML3
        //   ? importExcelData.tskTimeML3
        //   : "",
        // tasktimeML4: pmmraData?.tskTimeML4
        //   ? pmmraData?.tskTimeML4
        //   : importExcelData?.tskTimeML4
        //   ? importExcelData.tskTimeML4
        //   : "",
        // tasktimeML5: pmmraData?.tskTimeML5
        //   ? pmmraData?.tskTimeML5
        //   : importExcelData?.tskTimeML5
        //   ? importExcelData.tskTimeML5
        //   : "",
        // tasktimeML6: pmmraData?.tskTimeML6
        //   ? pmmraData?.tskTimeML6
        //   : importExcelData?.tskTimeML6
        //   ? importExcelData.tskTimeML6
        //   : "",
        // tasktimeML7: pmmraData?.tskTimeML7
        //   ? pmmraData?.tskTimeML7
        //   : importExcelData?.tskTimeML7
        //   ? importExcelData.tskTimeML7
        //   : "",

        // skill1contribution: pmmraData?.skillOneContribution
        //   ? pmmraData?.skillOneContribution
        //   : importExcelData?.skillOneContribution
        //   ? importExcelData.skillOneContribution
        //   : "",

        // skill1nos: pmmraData?.skillOneNos
        //   ? pmmraData?.skillOneNos
        //   : importExcelData?.skillOneNos
        //   ? importExcelData.skillOneNos
        //   : "",
        // skill1: pmmraData?.skill1 ? pmmraData?.skill1 : importExcelData?.skill1 ? importExcelData.skill1 : "",
        // skill2contribution: pmmraData?.skillTwoContribution
        //   ? pmmraData?.skillTwoContribution
        //   : importExcelData?.skillTwoContribution
        //   ? importExcelData.skillTwoContribution
        //   : "",
        // skill2nos: pmmraData?.skillTwoNos
        //   ? pmmraData?.skillTwoNos
        //   : importExcelData?.skillTwoNos
        //   ? importExcelData.skillTwoNos
        //   : "",
        // skill2: pmmraData?.skill2 ? pmmraData?.skill2 : importExcelData?.skill2 ? importExcelData.skill2 : "",
        // skill3contribution: pmmraData?.skillThreeContribution
        //   ? pmmraData?.skillThreeContribution
        //   : importExcelData?.skillThreeContribution
        //   ? importExcelData.skillThreeContribution
        //   : "",
        // skill3nos: pmmraData?.skillThreeNos
        //   ? pmmraData?.skillThreeNos
        //   : importExcelData?.skillThreeNos
        //   ? importExcelData.skillThreeNos
        //   : "",
        // skill3: pmmraData?.skill3 ? pmmraData?.skill3 : importExcelData?.skill3 ? importExcelData.skill3 : "",

        // addReplacespare1: pmmraData?.addiReplaceSpare1
        //   ? pmmraData?.addiReplaceSpare1
        //   : importExcelData?.addiReplaceSpare1
        //   ? importExcelData.addiReplaceSpare1
        //   : "",

        // addReplacespare2: pmmraData?.addiReplaceSpare2
        //   ? pmmraData?.addiReplaceSpare2
        //   : importExcelData?.addiReplaceSpare2
        //   ? importExcelData.addiReplaceSpare2
        //   : "",

        // addReplacespare3: pmmraData?.addiReplaceSpare3
        //   ? pmmraData?.addiReplaceSpare3
        //   : importExcelData?.addiReplaceSpare3
        //   ? importExcelData.addiReplaceSpare3
        //   : "",

        // Consumable1: pmmraData?.consumable1
        //   ? pmmraData?.consumable1
        //   : importExcelData?.consumable1
        //   ? importExcelData.consumable1
        //   : "",

        // Consumable2: pmmraData?.consumable2
        //   ? pmmraData?.consumable2
        //   : importExcelData?.consumable2
        //   ? importExcelData.consumable2
        //   : "",

        // Consumable3: pmmraData?.consumable3
        //   ? pmmraData?.consumable3
        //   : importExcelData?.consumable3
        //   ? importExcelData.consumable3
        //   : "",

        // Consumable4: pmmraData?.consumable4
        //   ? pmmraData?.consumable4
        //   : importExcelData?.consumable4
        //   ? importExcelData.consumable4
        //   : "",

        // Consumable5: pmmraData?.consumable5
        //   ? pmmraData?.consumable5
        //   : importExcelData?.consumable5
        //   ? importExcelData.consumable5
        //   : "",

        // addReplacespare1qty: pmmraData?.addiReplaceSpare1Qty
        //   ? pmmraData?.addiReplaceSpare1Qty
        //   : importExcelData?.addiReplaceSpare1Qty
        //   ? importExcelData.addiReplaceSpare1Qty
        //   : "",

        // addReplacespare2qty: pmmraData?.addiReplaceSpare2Qty
        //   ? pmmraData?.addiReplaceSpare2Qty
        //   : importExcelData?.addiReplaceSpare2Qty
        //   ? importExcelData.addiReplaceSpare2Qty
        //   : "",

        // addReplacespare3qty: pmmraData?.addiReplaceSpare3Qty
        //   ? pmmraData?.addiReplaceSpare3Qty
        //   : importExcelData?.addiReplaceSpare3Qty
        //   ? importExcelData.addiReplaceSpare3Qty
        //   : "",

        // Consumable1qty: pmmraData?.consumable1Qty
        //   ? pmmraData?.consumable1Qty
        //   : importExcelData?.consumable1Qty
        //   ? importExcelData.consumable1Qty
        //   : "",

        // Consumable2qty: pmmraData?.consumable2Qty
        //   ? pmmraData?.consumable2Qty
        //   : importExcelData?.consumable2Qty
        //   ? importExcelData.consumable2Qty
        //   : "",

        // Consumable3qty: pmmraData?.consumable3Qty
        //   ? pmmraData?.consumable3Qty
        //   : importExcelData?.consumable3Qty
        //   ? importExcelData.consumable3Qty
        //   : "",

        // Consumable4qty: pmmraData?.consumable4Qty
        //   ? pmmraData?.consumable4Qty
        //   : importExcelData?.consumable4Qty
        //   ? importExcelData.consumable4Qty
        //   : "",

        // Consumable5qty: pmmraData?.consumable5Qty
        //   ? pmmraData?.consumable5Qty
        //   : importExcelData?.consumable5Qty
        //   ? importExcelData.consumable5Qty
        //   : "",

        // userfield1: pmmraData?.userField1
        //   ? pmmraData?.userField1
        //   : importExcelData?.userField1
        //   ? importExcelData.userField1
        //   : "",

        // userfield2: pmmraData?.userField2
        //   ? pmmraData?.userField2
        //   : importExcelData?.userField2
        //   ? importExcelData.userField2
        //   : "",

        // userfield3: pmmraData?.userField3
        //   ? pmmraData?.userField3
        //   : importExcelData?.userField3
        //   ? importExcelData.userField3
        //   : "",

        // userfield4: pmmraData?.userField4
        //   ? pmmraData?.userField4
        //   : importExcelData?.userField4
        //   ? importExcelData.userField4
        //   : "",

        // userfield5: pmmraData?.userField5
        //   ? pmmraData?.userField5
        //   : importExcelData?.userField5
        //   ? importExcelData.userField5
        //   : "",
        // Items: pmmraData?.significantItem ? { label: pmmraData?.significantItem, value: pmmraData?.significantItem } : "",
        "",
    taskDescription: pmmraData?.taskDesc ? pmmraData?.taskDesc : "",
    tasktimeML1: pmmraData?.tskTimeML1 ? pmmraData?.tskTimeML1 : "",
    tasktimeML2: pmmraData?.tskTimeML2 ? pmmraData?.tskTimeML2 : "",
    tasktimeML3: pmmraData?.tskTimeML3 ? pmmraData?.tskTimeML3 : "",
    tasktimeML4: pmmraData?.tskTimeML4 ? pmmraData?.tskTimeML4 : "",
    tasktimeML5: pmmraData?.tskTimeML5 ? pmmraData?.tskTimeML5 : "",
    tasktimeML6: pmmraData?.tskTimeML6 ? pmmraData?.tskTimeML6 : "",
    tasktimeML7: pmmraData?.tskTimeML7 ? pmmraData?.tskTimeML7 : "",
    skill1contribution: pmmraData?.skillOneContribution
      ? pmmraData?.skillOneContribution
      : "",
    skill1nos: pmmraData?.skillOneNos ? pmmraData?.skillOneNos : "",
    skill1: pmmraData?.skill1 ? pmmraData?.skill1 : "",
    skill2contribution: pmmraData?.skillTwoContribution
      ? pmmraData?.skillTwoContribution
      : "",
    skill2nos: pmmraData?.skillTwoNos ? pmmraData?.skillTwoNos : "",
    skill2: pmmraData?.skill2 ? pmmraData?.skill2 : "",
    skill3contribution: pmmraData?.skillThreeContribution
      ? pmmraData?.skillThreeContribution
      : "",
    skill3nos: pmmraData?.skillThreeNos ? pmmraData?.skillThreeNos : "",
    skill3: pmmraData?.skill3 ? pmmraData?.skill3 : "",
    addReplacespare1: pmmraData?.addiReplaceSpare1
      ? pmmraData?.addiReplaceSpare1
      : "",
    addReplacespare2: pmmraData?.addiReplaceSpare2
      ? pmmraData?.addiReplaceSpare2
      : "",
    addReplacespare3: pmmraData?.addiReplaceSpare3
      ? pmmraData?.addiReplaceSpare3
      : "",
    Consumable1: pmmraData?.consumable1 ? pmmraData?.consumable1 : "",
    Consumable2: pmmraData?.consumable2 ? pmmraData?.consumable2 : "",
    Consumable3: pmmraData?.consumable3 ? pmmraData?.consumable3 : "",
    Consumable4: pmmraData?.consumable4 ? pmmraData?.consumable4 : "",
    Consumable5: pmmraData?.consumable5 ? pmmraData?.consumable5 : "",
    addReplacespare1qty: pmmraData?.addiReplaceSpare1Qty
      ? pmmraData?.addiReplaceSpare1Qty
      : "",
    addReplacespare2qty: pmmraData?.addiReplaceSpare2Qty
      ? pmmraData?.addiReplaceSpare2Qty
      : "",
    addReplacespare3qty: pmmraData?.addiReplaceSpare3Qty
      ? pmmraData?.addiReplaceSpare3Qty
      : "",
    Consumable1qty: pmmraData?.consumable1Qty ? pmmraData?.consumable1Qty : "",
    Consumable2qty: pmmraData?.consumable2Qty ? pmmraData?.consumable2Qty : "",
    Consumable3qty: pmmraData?.consumable3Qty ? pmmraData?.consumable3Qty : "",
    Consumable4qty: pmmraData?.consumable4Qty ? pmmraData?.consumable4Qty : "",
    Consumable5qty: pmmraData?.consumable5Qty ? pmmraData?.consumable5Qty : "",
    userfield1: pmmraData?.userField1 ? pmmraData?.userField1 : "",
    userfield2: pmmraData?.userField2 ? pmmraData?.userField2 : "",
    userfield3: pmmraData?.userField3 ? pmmraData?.userField3 : "",
    userfield4: pmmraData?.userField4 ? pmmraData?.userField4 : "",
    userfield5: pmmraData?.userField5 ? pmmraData?.userField5 : "",
    Items: pmmraData?.significantItem
      ? { label: pmmraData?.significantItem, value: pmmraData?.significantItem }
      : "",
    condition: pmmraData?.conditionMonitrTsk
      ? {
          label: pmmraData?.conditionMonitrTsk,
          value: pmmraData?.conditionMonitrTsk,
        }
      : "",
    failure: pmmraData?.failureFindTsk
      ? { label: pmmraData?.failureFindTsk, value: pmmraData?.failureFindTsk }
      : "",
    redesign: pmmraData?.reDesign
      ? { label: pmmraData?.reDesign, value: pmmraData?.reDesign }
      : "",
    acceptable: pmmraData?.criticalityAccept
      ? {
          label: pmmraData?.criticalityAccept,
          value: pmmraData?.criticalityAccept,
        }
      : "",
    lubrication: pmmraData?.LubricationservceTsk
      ? {
          label: pmmraData?.LubricationservceTsk,
          value: pmmraData?.LubricationservceTsk,
        }
      : "",
    task: pmmraData?.restoreDiscrdTsk
      ? {
          label: pmmraData?.restoreDiscrdTsk,
          value: pmmraData?.restoreDiscrdTsk,
        }
      : "",
    combination: pmmraData?.combinationOfTsk
      ? {
          label: pmmraData?.combinationOfTsk,
          value: pmmraData?.combinationOfTsk,
        }
      : "",
  };
  return (
    <div style={{ marginTop: "90px" }} className="mx-4">
      {isLoading ? (
        <Loader />
      ) : (
        <div>
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
                  exportToExcel(InitialValues);
                }}
              >
                Export
              </Button>
            </Col>
          </Row> */}
          {/* <div
            style={{
              display: "flex",
              marginTop: "8px",
              height: "40px",
            }}
          >
            <Tooltip placement="left-end" title="Import">
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
                  exportToExcel(InitialValues);
                }}
              >
                <FontAwesomeIcon icon={faFileUpload} style={{ width: "15" }} />
              </Button>
            </Tooltip>
          </div>
          <Row>
            <Col xs={12} sm={9} className="projectName">
              <Dropdown value={projectId} productId={productId} />
            </Col>
          </Row> */}
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
                  <label htmlFor="file-input" className="import-export-btn">
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
                  onClick={() => {
                    exportToExcel(InitialValues);
                  }}
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
                pmmraId && fmecaId
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
                                name="FmecaId"
                                className="mt-1"
                                placeholder="Select Fmeca Mode"
                                value={
                                  values?.fmecaId
                                    ? {
                                        label: values?.fmecaId,
                                        value: values?.fmecaId,
                                      }
                                    : ""
                                }
                                style={{ backgroundColor: "red" }}
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
                                  setFieldValue("FmecaId", e.value);
                                  setFmecaId("");
                                  getFmecaFilterData(e.value);
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
                                  <Form.Control
                                    name="endeffect"
                                    id="endeffect"
                                    placeholder="End Effect"
                                    value={values.endeffect}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Enter EndEffect"
                                  />
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
                                  <Form.Control
                                    name="safetyimpact"
                                    id="safetyimpact"
                                    placeholder="Safety Impact"
                                    value={values.safetyimpact}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Enter Safety Impact"
                                  />
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="safetyimpact"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>{" "}
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>
                                    Reliability Impact
                                  </Label>
                                  <Form.Control
                                    name="reliability"
                                    id="reliability"
                                    placeholder="Reliability"
                                    value={values.reliability}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Enter Reliability"
                                  />
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
                                  <Form.Control
                                    name="frequency"
                                    id="frequency"
                                    placeholder="Frequency"
                                    value={values.frequency}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Enter Frequency"
                                  />
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="frequency"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>{" "}
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Severity</Label>
                                  <Form.Control
                                    name="severity"
                                    id="severity"
                                    placeholder="Severity"
                                    value={values.severity}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Enter Severity"
                                  />
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
                                  <Form.Control
                                    name="riskindex"
                                    id="riskindex"
                                    placeholder="Risk Index"
                                    value={values.riskindex}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Enter Risk Index"
                                  />
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
                                {allConnectedData.some(
                                  (item) =>
                                    item.sourceName === "Evident1" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "Evident1"
                                      ) || [];
                                    const options =
                                      connectedFilteredData?.length > 0
                                        ? connectedFilteredData?.map(
                                            (item) => ({
                                              value: item?.destinationValue,
                                              label: item?.destinationValue,
                                            })
                                          )
                                        : null;

                                    return (
                                      <Select
                                        name="Evident1"
                                        className="mt-1"
                                        placeholder="Evident1"
                                        value={
                                          values?.Evident1
                                            ? {
                                                label: values?.Evident1,
                                                value: values?.Evident1,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("Evident1", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Evident1"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="Evident1"
                                    className="mt-1"
                                    placeholder="Evident1"
                                    value={
                                      values?.Evident1
                                        ? {
                                            label: values?.Evident1,
                                            value: values?.Evident1,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("Evident1", e.value);
                                      getAllConnectedLibrary(
                                        e.value,
                                        "Evident1"
                                      );
                                    }}
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Significant Item ?</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Items" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) => item?.sourceName === "Items"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "Items"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Items"
                                        className="mt-1"
                                        placeholder="Items"
                                        value={
                                          values?.Items
                                            ? {
                                                label: values?.Items,
                                                value: values?.Items,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("Items", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Items"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="Items"
                                    className="mt-1"
                                    placeholder="Items"
                                    value={
                                      values?.Items
                                        ? {
                                            label: values?.Items,
                                            value: values?.Items,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("Items", e.value);
                                      getAllConnectedLibrary(e.value, "Items");
                                    }}
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Condition Monitoring Task
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "condition" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "condition"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "condition"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="condition"
                                        className="mt-1"
                                        placeholder="Condition"
                                        value={
                                          values?.condition
                                            ? {
                                                label: values?.condition,
                                                value: values?.condition,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("condition", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "condition"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="condition"
                                    className="mt-1"
                                    placeholder="condition"
                                    value={
                                      values?.condition
                                        ? {
                                            label: values?.condition,
                                            value: values?.condition,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("condition", e.value);
                                      getAllConnectedLibrary(
                                        e.value,
                                        "condition"
                                      );
                                    }}
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Failure Finding Task
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "failure" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) => item?.sourceName === "failure"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "failure"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="failure"
                                        className="mt-1"
                                        placeholder="Failure"
                                        value={
                                          values?.failure
                                            ? {
                                                label: values?.failure,
                                                value: values?.failure,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("failure", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "failure"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="failure"
                                    className="mt-1"
                                    placeholder="failure"
                                    value={
                                      values?.failure
                                        ? {
                                            label: values?.failure,
                                            value: values?.failure,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("failure", e.value);
                                      getAllConnectedLibrary(
                                        e.value,
                                        "failure"
                                      );
                                    }}
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Redesign?</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "redesign" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "redesign"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "redesign"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="redesign"
                                        className="mt-1"
                                        placeholder="Redesign"
                                        value={
                                          values?.redesign
                                            ? {
                                                label: values?.redesign,
                                                value: values?.redesign,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("redesign", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "redesign"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="redesign"
                                    className="mt-1"
                                    placeholder="redesign"
                                    value={
                                      values?.redesign
                                        ? {
                                            label: values?.redesign,
                                            value: values?.redesign,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("redesign", e.value);
                                      getAllConnectedLibrary(
                                        e.value,
                                        "redesign"
                                      );
                                    }}
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Label notify={true}>
                                  Criticality Acceptable ?
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "acceptable" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "acceptable"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "acceptable"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="acceptable"
                                        className="mt-1"
                                        placeholder="Acceptable"
                                        value={
                                          values?.acceptable
                                            ? {
                                                label: values?.acceptable,
                                                value: values?.acceptable,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("acceptable", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "acceptable"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="acceptable"
                                    className="mt-1"
                                    placeholder="acceptable"
                                    value={
                                      values?.acceptable
                                        ? {
                                            label: values?.acceptable,
                                            value: values?.acceptable,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("acceptable", e.value);
                                      getAllConnectedLibrary(
                                        e.value,
                                        "acceptable"
                                      );
                                    }}
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Lubrication / Service Task
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "lubrication" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "lubrication"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "lubrication"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="lubrication"
                                        className="mt-1"
                                        placeholder="Lubrication"
                                        value={
                                          values?.lubrication
                                            ? {
                                                label: values?.lubrication,
                                                value: values?.lubrication,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("lubrication", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "lubrication"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="lubrication"
                                    className="mt-1"
                                    placeholder="lubrication"
                                    value={
                                      values?.lubrication
                                        ? {
                                            label: values?.lubrication,
                                            value: values?.lubrication,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("lubrication", e.value);
                                      getAllConnectedLibrary(
                                        e.value,
                                        "lubrication"
                                      );
                                    }}
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Restore or Discard Task
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "task" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) => item?.sourceName === "task"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "task"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="task"
                                        className="mt-1"
                                        placeholder="Task"
                                        value={
                                          values?.task
                                            ? {
                                                label: values?.task,
                                                value: values?.task,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("task", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "task"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="task"
                                    className="mt-1"
                                    placeholder="task"
                                    value={
                                      values?.task
                                        ? {
                                            label: values?.task,
                                            value: values?.task,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("task", e.value);
                                      getAllConnectedLibrary(e.value, "task");
                                    }}
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Combination of Tasks
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "combination" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "combination"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "combination"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="combination"
                                        className="mt-1"
                                        placeholder="Combination"
                                        value={
                                          values?.combination
                                            ? {
                                                label: values?.combination,
                                                value: values?.combination,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("combination", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "combination"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="combination"
                                    className="mt-1"
                                    placeholder="combination"
                                    value={
                                      values?.combination
                                        ? {
                                            label: values?.combination,
                                            value: values?.combination,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("combination", e.value);
                                      getAllConnectedLibrary(
                                        e.value,
                                        "combination"
                                      );
                                    }}
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>RCM Notes</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "rcmnotes" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "rcmnotes"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "rcmnotes"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="rcmnotes"
                                        className="mt-1"
                                        placeholder="Rcm Notes"
                                        value={
                                          values?.rcmnotes
                                            ? {
                                                label: values?.rcmnotes,
                                                value: values?.rcmnotes,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("rcmnotes", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "rcmnotes"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Select
                                    name="rcmnotes"
                                    className="mt-1"
                                    placeholder="rcmnotes"
                                    value={
                                      values?.rcmnotes
                                        ? {
                                            label: values?.rcmnotes,
                                            value: values?.rcmnotes,
                                          }
                                        : ""
                                    }
                                    style={{ backgroundColor: "red" }}
                                    options={[
                                      { label: "Yes", value: "Yes" },
                                      { label: "No", value: "No" },
                                    ]}
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
                                      setFieldValue("rcmnotes", e.value);
                                      getAllConnectedLibrary(
                                        e.value,
                                        "rcmnotes"
                                      );
                                    }}
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card>
                        <div className="mttr-sec mb-2 mt-4">
                          <p className=" mb-0 para-tag">PM</p>
                        </div>
                        <Card className="mt-2 p-4 mttr-card">
                          <div>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>PM Task ID</Label>
                                  {allSepareteData.some(
                                    (item) =>
                                      item.sourceName === "pmtaskid" &&
                                      item.sourceValue
                                  ) ? (
                                    (() => {
                                      const seperateFilteredData =
                                        allSepareteData?.filter(
                                          (item) =>
                                            item?.sourceName === "pmtaskid"
                                        ) || [];
                                      const connectedFilteredData =
                                        allConnectedData?.filter(
                                          (item) =>
                                            item?.destinationName === "pmtaskid"
                                        ) || [];
                                      const options =
                                        connectedFilteredData.length > 0
                                          ? connectedFilteredData.map(
                                              (item) => ({
                                                value: item?.destinationValue,
                                                label: item?.destinationValue,
                                              })
                                            )
                                          : seperateFilteredData.map(
                                              (item) => ({
                                                value: item?.sourceValue,
                                                label: item?.sourceValue,
                                              })
                                            );

                                      return (
                                        <Select
                                          name="pmtaskid"
                                          className="mt-1"
                                          placeholder="Pm Task ID"
                                          value={
                                            values?.pmtaskid
                                              ? {
                                                  label: values?.pmtaskid,
                                                  value: values?.pmtaskid,
                                                }
                                              : ""
                                          }
                                          style={{ backgroundColor: "red" }}
                                          options={options}
                                          styles={customStyles}
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
                                          onChange={(e) => {
                                            setFieldValue("pmtaskid", e.value);
                                            getAllConnectedLibrary(
                                              e.value,
                                              "pmtaskid"
                                            );
                                          }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    <Form.Control
                                      name="pmtaskid"
                                      id="pmtaskid"
                                      placeholder="Pm Task ID"
                                      value={values.pmtaskid}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="mt-1"
                                      title="Enter Pm Task ID"
                                    />
                                  )}
                                  <ErrorMessage
                                    className="error text-danger"
                                    component="span"
                                    name="pmtaskid"
                                  />
                                </Form.Group>
                              </Col>{" "}
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>PM Task type</Label>
                                  {allSepareteData.some(
                                    (item) =>
                                      item.sourceName === "PMtasktype" &&
                                      item.sourceValue
                                  ) ? (
                                    (() => {
                                      const seperateFilteredData =
                                        allSepareteData?.filter(
                                          (item) =>
                                            item?.sourceName === "PMtasktype"
                                        ) || [];
                                      const connectedFilteredData =
                                        allConnectedData?.filter(
                                          (item) =>
                                            item?.destinationName ===
                                            "PMtasktype"
                                        ) || [];
                                      const options =
                                        connectedFilteredData.length > 0
                                          ? connectedFilteredData.map(
                                              (item) => ({
                                                value: item?.destinationValue,
                                                label: item?.destinationValue,
                                              })
                                            )
                                          : seperateFilteredData.map(
                                              (item) => ({
                                                value: item?.sourceValue,
                                                label: item?.sourceValue,
                                              })
                                            );

                                      return (
                                        <Select
                                          name="PMtasktype"
                                          className="mt-1"
                                          placeholder="PM Task Type"
                                          value={
                                            values?.PMtasktype
                                              ? {
                                                  label: values?.PMtasktype,
                                                  value: values?.PMtasktype,
                                                }
                                              : ""
                                          }
                                          style={{ backgroundColor: "red" }}
                                          options={options}
                                          styles={customStyles}
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
                                          onChange={(e) => {
                                            setFieldValue(
                                              "PMtasktype",
                                              e.value
                                            );
                                            getAllConnectedLibrary(
                                              e.value,
                                              "PMtasktype"
                                            );
                                          }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    <Form.Control
                                      name="PMtasktype"
                                      id="PMtasktype"
                                      placeholder="PM Task Type"
                                      value={values.PMtasktype}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="mt-1"
                                      title="PM Task Type"
                                    />
                                  )}
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>
                                    Task Interval Frequency
                                  </Label>
                                  {allSepareteData.some(
                                    (item) =>
                                      item.sourceName ===
                                        "taskintervalFrequency" &&
                                      item.sourceValue
                                  ) ? (
                                    (() => {
                                      const seperateFilteredData =
                                        allSepareteData?.filter(
                                          (item) =>
                                            item?.sourceName ===
                                            "taskintervalFrequency"
                                        ) || [];
                                      const connectedFilteredData =
                                        allConnectedData?.filter(
                                          (item) =>
                                            item?.destinationName ===
                                            "taskintervalFrequency"
                                        ) || [];
                                      const options =
                                        connectedFilteredData.length > 0
                                          ? connectedFilteredData.map(
                                              (item) => ({
                                                value: item?.destinationValue,
                                                label: item?.destinationValue,
                                              })
                                            )
                                          : seperateFilteredData.map(
                                              (item) => ({
                                                value: item?.sourceValue,
                                                label: item?.sourceValue,
                                              })
                                            );

                                      return (
                                        <Select
                                          name="taskintervalFrequency"
                                          className="mt-1"
                                          placeholder="Task Interval Frequency"
                                          value={
                                            values?.taskintervalFrequency
                                              ? {
                                                  label:
                                                    values?.taskintervalFrequency,
                                                  value:
                                                    values?.taskintervalFrequency,
                                                }
                                              : ""
                                          }
                                          style={{ backgroundColor: "red" }}
                                          options={options}
                                          styles={customStyles}
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
                                          onChange={(e) => {
                                            setFieldValue(
                                              "taskintervalFrequency",
                                              e.value
                                            );
                                            getAllConnectedLibrary(
                                              e.value,
                                              "taskintervalFrequency"
                                            );
                                          }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    <Form.Control
                                      name="taskintervalFrequency"
                                      id="taskintervalFrequency"
                                      placeholder="Task Interval Frequency"
                                      value={values.taskintervalFrequency}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="mt-1"
                                      title="Task Interval Frequency"
                                    />
                                  )}
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>
                                    Task Interval Unit
                                  </Label>
                                  {allSepareteData.some(
                                    (item) =>
                                      item.sourceName === "taskIntervalunit" &&
                                      item.sourceValue
                                  ) ? (
                                    (() => {
                                      const seperateFilteredData =
                                        allSepareteData?.filter(
                                          (item) =>
                                            item?.sourceName ===
                                            "taskIntervalunit"
                                        ) || [];
                                      const connectedFilteredData =
                                        allConnectedData?.filter(
                                          (item) =>
                                            item?.destinationName ===
                                            "taskIntervalunit"
                                        ) || [];
                                      const options =
                                        connectedFilteredData.length > 0
                                          ? connectedFilteredData.map(
                                              (item) => ({
                                                value: item?.destinationValue,
                                                label: item?.destinationValue,
                                              })
                                            )
                                          : seperateFilteredData.map(
                                              (item) => ({
                                                value: item?.sourceValue,
                                                label: item?.sourceValue,
                                              })
                                            );

                                      return (
                                        <Select
                                          name="taskIntervalunit"
                                          className="mt-1"
                                          placeholder="Task Interval Unit"
                                          value={
                                            values?.taskIntervalunit
                                              ? {
                                                  label:
                                                    values?.taskIntervalunit,
                                                  value:
                                                    values?.taskIntervalunit,
                                                }
                                              : ""
                                          }
                                          style={{ backgroundColor: "red" }}
                                          options={options}
                                          styles={customStyles}
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
                                          onChange={(e) => {
                                            setFieldValue(
                                              "taskIntervalunit",
                                              e.value
                                            );
                                            getAllConnectedLibrary(
                                              e.value,
                                              "taskIntervalunit"
                                            );
                                          }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    <Form.Control
                                      name="taskIntervalunit"
                                      id="taskIntervalunit"
                                      placeholder="Task Interval Unit"
                                      value={values.taskIntervalunit}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="mt-1"
                                      title="Task Interval Unit"
                                    />
                                  )}
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Task Interval</Label>
                                  {allSepareteData.some(
                                    (item) =>
                                      item.sourceName === "taskInterval" &&
                                      item.sourceValue
                                  ) ? (
                                    (() => {
                                      const seperateFilteredData =
                                        allSepareteData?.filter(
                                          (item) =>
                                            item?.sourceName === "taskInterval"
                                        ) || [];
                                      const connectedFilteredData =
                                        allConnectedData?.filter(
                                          (item) =>
                                            item?.destinationName ===
                                            "taskInterval"
                                        ) || [];
                                      const options =
                                        connectedFilteredData.length > 0
                                          ? connectedFilteredData.map(
                                              (item) => ({
                                                value: item?.destinationValue,
                                                label: item?.destinationValue,
                                              })
                                            )
                                          : seperateFilteredData.map(
                                              (item) => ({
                                                value: item?.sourceValue,
                                                label: item?.sourceValue,
                                              })
                                            );

                                      return (
                                        <Select
                                          name="taskInterval"
                                          className="mt-1"
                                          placeholder="Task Interval"
                                          value={
                                            values?.endeffect
                                              ? {
                                                  label: values?.taskInterval,
                                                  value: values?.taskInterval,
                                                }
                                              : ""
                                          }
                                          style={{ backgroundColor: "red" }}
                                          options={options}
                                          styles={customStyles}
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
                                          onChange={(e) => {
                                            setFieldValue(
                                              "taskInterval",
                                              e.value
                                            );
                                            getAllConnectedLibrary(
                                              e.value,
                                              "taskInterval"
                                            );
                                          }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    <Form.Control
                                      name="taskInterval"
                                      id="taskInterval"
                                      placeholder="Task Interval"
                                      value={values.taskInterval}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="mt-1"
                                      title="Task Interval"
                                    />
                                  )}
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>
                                    Scheduled Maintenance Task
                                  </Label>
                                  {allSepareteData.some(
                                    (item) =>
                                      item.sourceName ===
                                        "scheduledMaintenanceTask" &&
                                      item.sourceValue
                                  ) ? (
                                    (() => {
                                      const seperateFilteredData =
                                        allSepareteData?.filter(
                                          (item) =>
                                            item?.sourceName ===
                                            "scheduledMaintenanceTask"
                                        ) || [];
                                      const connectedFilteredData =
                                        allConnectedData?.filter(
                                          (item) =>
                                            item?.destinationName ===
                                            "scheduledMaintenanceTask"
                                        ) || [];
                                      const options =
                                        connectedFilteredData.length > 0
                                          ? connectedFilteredData.map(
                                              (item) => ({
                                                value: item?.destinationValue,
                                                label: item?.destinationValue,
                                              })
                                            )
                                          : seperateFilteredData.map(
                                              (item) => ({
                                                value: item?.sourceValue,
                                                label: item?.sourceValue,
                                              })
                                            );

                                      return (
                                        <Select
                                          name="scheduledMaintenanceTask"
                                          className="mt-1"
                                          placeholder="Scheduled Maintenance Task"
                                          value={
                                            values?.endeffect
                                              ? {
                                                  label:
                                                    values?.scheduledMaintenanceTask,
                                                  value:
                                                    values?.scheduledMaintenanceTask,
                                                }
                                              : ""
                                          }
                                          style={{ backgroundColor: "red" }}
                                          options={options}
                                          styles={customStyles}
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
                                          onChange={(e) => {
                                            setFieldValue(
                                              "scheduledMaintenanceTask",
                                              e.value
                                            );
                                            getAllConnectedLibrary(
                                              e.value,
                                              "scheduledMaintenanceTask"
                                            );
                                          }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    <Form.Control
                                      name="scheduledMaintenanceTask"
                                      id="scheduledMaintenanceTask"
                                      placeholder="Scheduled Maintenance Task"
                                      value={values.scheduledMaintenanceTask}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="mt-1"
                                      title="Scheduled Maintenance Task"
                                    />
                                  )}
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Task Description</Label>
                                  {allSepareteData.some(
                                    (item) =>
                                      item.sourceName === "taskDescription" &&
                                      item.sourceValue
                                  ) ? (
                                    (() => {
                                      const seperateFilteredData =
                                        allSepareteData?.filter(
                                          (item) =>
                                            item?.sourceName ===
                                            "taskDescription"
                                        ) || [];
                                      const connectedFilteredData =
                                        allConnectedData?.filter(
                                          (item) =>
                                            item?.destinationName ===
                                            "taskDescription"
                                        ) || [];
                                      const options =
                                        connectedFilteredData.length > 0
                                          ? connectedFilteredData.map(
                                              (item) => ({
                                                value: item?.destinationValue,
                                                label: item?.destinationValue,
                                              })
                                            )
                                          : seperateFilteredData.map(
                                              (item) => ({
                                                value: item?.sourceValue,
                                                label: item?.sourceValue,
                                              })
                                            );

                                      return (
                                        <Select
                                          name="taskDescription"
                                          className="mt-1"
                                          placeholder="Task Description"
                                          value={
                                            values?.taskDescription
                                              ? {
                                                  label:
                                                    values?.taskDescription,
                                                  value:
                                                    values?.taskDescription,
                                                }
                                              : ""
                                          }
                                          style={{ backgroundColor: "red" }}
                                          options={options}
                                          styles={customStyles}
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
                                          onChange={(e) => {
                                            setFieldValue(
                                              "taskDescription",
                                              e.value
                                            );
                                            getAllConnectedLibrary(
                                              e.value,
                                              "taskDescription"
                                            );
                                          }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    <Form.Control
                                      name="taskDescription"
                                      id="taskDescription"
                                      placeholder="Task Description"
                                      value={values.taskDescription}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="mt-1"
                                      title="Task Description"
                                    />
                                  )}
                                </Form.Group>
                              </Col>
                            </Row>
                          </div>
                        </Card>
                        <div className="mttr-sec mb-2 mt-4">
                          <p className=" mb-0 para-tag">Task Time</p>
                        </div>
                        <Card style={{ backgroundColor: "#F2F1F2" }}>
                          <Row className="px-3 pb-3">
                            <Col md={6} className="mt-4 mb-4">
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML1</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "tasktimeML1" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "tasktimeML1"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "tasktimeML1"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="tasktimeML1"
                                        className="mt-1"
                                        placeholder="Task Time ML1"
                                        value={
                                          values?.tasktimeML1
                                            ? {
                                                label: values?.tasktimeML1,
                                                value: values?.tasktimeML1,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("tasktimeML1", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "tasktimeML1"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="tasktimeML1"
                                    id="tasktimeML1"
                                    placeholder="Task Time ML1"
                                    value={values.tasktimeML1}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Task Time ML1"
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML2</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "tasktimeML2" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "tasktimeML2"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "tasktimeML2"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="tasktimeML2"
                                        className="mt-1"
                                        placeholder="Task Time ML2"
                                        value={
                                          values?.tasktimeML2
                                            ? {
                                                label: values?.tasktimeML2,
                                                value: values?.tasktimeML2,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("tasktimeML2", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "tasktimeML2"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="tasktimeML2"
                                    id="tasktimeML2"
                                    placeholder="Task Time ML2"
                                    value={values.tasktimeML2}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Task Time ML2"
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML3</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "tasktimeML3" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "tasktimeML3"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "tasktimeML3"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="tasktimeML3"
                                        className="mt-1"
                                        placeholder="Task Time ML3"
                                        value={
                                          values?.tasktimeML3
                                            ? {
                                                label: values?.tasktimeML3,
                                                value: values?.tasktimeML3,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("tasktimeML3", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "tasktimeML3"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="tasktimeML3"
                                    id="tasktimeML3"
                                    placeholder="Task Time ML3"
                                    value={values.tasktimeML3}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Task Time ML3"
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML4</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "tasktimeML4" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "tasktimeML4"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "tasktimeML4"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="tasktimeML4"
                                        className="mt-1"
                                        placeholder="Task Time ML4"
                                        value={
                                          values?.tasktimeML4
                                            ? {
                                                label: values?.tasktimeML4,
                                                value: values?.tasktimeML4,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("tasktimeML4", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "tasktimeML4"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="tasktimeML4"
                                    id="tasktimeML4"
                                    placeholder="Task Time ML4"
                                    value={values.tasktimeML4}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Task Time ML4"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6} className="mt-4 mb-4">
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML5</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "tasktimeML5" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "tasktimeML5"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "tasktimeML5"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="tasktimeML5"
                                        className="mt-1"
                                        placeholder="Task Time ML5"
                                        value={
                                          values?.tasktimeML5
                                            ? {
                                                label: values?.tasktimeML5,
                                                value: values?.tasktimeML5,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("tasktimeML5", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "tasktimeML5"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="tasktimeML5"
                                    id="tasktimeML5"
                                    placeholder="Task Time ML5"
                                    value={values.tasktimeML5}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Task Time ML5"
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML6</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "tasktimeML6" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "tasktimeML6"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "tasktimeML6"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="tasktimeML6"
                                        className="mt-1"
                                        placeholder="Task Time ML6"
                                        value={
                                          values?.tasktimeML6
                                            ? {
                                                label: values?.tasktimeML6,
                                                value: values?.tasktimeML6,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("tasktimeML6", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "tasktimeML6"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="tasktimeML6"
                                    id="tasktimeML6"
                                    placeholder="Task Time ML6"
                                    value={values.tasktimeML6}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Task Time ML6"
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Task Time ML7</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "tasktimeML7" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "tasktimeML7"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "tasktimeML7"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="tasktimeML7"
                                        className="mt-1"
                                        placeholder="Task Time ML7"
                                        value={
                                          values?.tasktimeML7
                                            ? {
                                                label: values?.tasktimeML7,
                                                value: values?.tasktimeML7,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("tasktimeML7", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "tasktimeML7"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="tasktimeML7"
                                    id="tasktimeML7"
                                    placeholder="Task Time ML7"
                                    value={values.tasktimeML7}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Task Time ML7"
                                  />
                                )}
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
                              <Form.Group>
                                <Label notify={true}>Skill 1</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "skill1" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) => item?.sourceName === "skill1"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "skill1"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="skill1"
                                        className="mt-1"
                                        placeholder="Skill 1"
                                        value={
                                          values?.endeffect
                                            ? {
                                                label: values?.skill1,
                                                value: values?.skill1,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("skill1", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "skill1"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="skill1"
                                    id="skill1"
                                    placeholder="Skill 1"
                                    value={values.skill1}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Skill 1"
                                  />
                                )}
                              </Form.Group>{" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 1 Nos</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "skill1nos" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "skill1nos"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "skill1nos"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="skill1nos"
                                        className="mt-1"
                                        placeholder="Skill 1nos"
                                        value={
                                          values?.skill1nos
                                            ? {
                                                label: values?.skill1nos,
                                                value: values?.skill1nos,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("skill1nos", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "skill1nos"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="skill1nos"
                                    id="skill1nos"
                                    placeholder="Skill 1nos"
                                    value={values.skill1nos}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Skill 1nos"
                                  />
                                )}
                              </Form.Group>{" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Skill 1 Contribution
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "skill1contribution" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName ===
                                          "skill1contribution"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "skill1contribution"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="skill1contribution"
                                        className="mt-1"
                                        placeholder="Skill 1 Contribution"
                                        value={
                                          values?.skill1contribution
                                            ? {
                                                label:
                                                  values?.skill1contribution,
                                                value:
                                                  values?.skill1contribution,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "skill1contribution",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "skill1contribution"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="skill1contribution"
                                    id="skill1contribution"
                                    placeholder="Skill 1 Contribution"
                                    value={values.skill1contribution}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Skill 1 Contribution"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Label notify={true}>Skill 2</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "skill2" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) => item?.sourceName === "skill2"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "skill2"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="skill2"
                                        className="mt-1"
                                        placeholder="Skill 2"
                                        value={
                                          values?.skill2
                                            ? {
                                                label: values?.skill2,
                                                value: values?.skill2,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("skill2", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "skill2"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="skill2"
                                    id="skill2"
                                    placeholder="Skill 2"
                                    value={values.skill2}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Skill 2"
                                  />
                                )}
                              </Form.Group>{" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 2 Nos</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "skill2nos" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "skill2nos"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "skill2nos"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="skill2nos"
                                        className="mt-1"
                                        placeholder="Skill 2nos"
                                        value={
                                          values?.skill2nos
                                            ? {
                                                label: values?.skill2nos,
                                                value: values?.skill2nos,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("skill2nos", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "skill2nos"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="skill2nos"
                                    id="skill2nos"
                                    placeholder="Skill 2nos"
                                    value={values.skill2nos}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Skill 2nos"
                                  />
                                )}
                              </Form.Group>{" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Skill 2 Contribution
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "skill2contribution" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName ===
                                          "skill2contribution"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "skill2contribution"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="skill2contribution"
                                        className="mt-1"
                                        placeholder="Skill 2 Contribution"
                                        value={
                                          values?.skill2contribution
                                            ? {
                                                label:
                                                  values?.skill2contribution,
                                                value:
                                                  values?.skill2contribution,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "skill2contribution",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "skill2contribution"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="skill2contribution"
                                    id="skill2contribution"
                                    placeholder="Skill 2 Contribution"
                                    value={values.skill2contribution}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Skill 2 Contribution"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="mt-3">
                            <Col md={6}>
                              <Form.Group>
                                <Label notify={true}>Skill 3</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "skill3" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) => item?.sourceName === "skill3"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "skill3"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="skill3"
                                        className="mt-1"
                                        placeholder="Skill 3"
                                        value={
                                          values?.skill3
                                            ? {
                                                label: values?.skill3,
                                                value: values?.skill3,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("skill3", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "skill3"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="skill3"
                                    id="skill3"
                                    placeholder="Skill 3"
                                    value={values.skill3}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Skill 3"
                                  />
                                )}
                              </Form.Group>{" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>Skill 3 Nos</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "skill3nos" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "skill3nos"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "skill3nos"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="skill3nos"
                                        className="mt-1"
                                        placeholder="Skill 3nos"
                                        value={
                                          values?.skill3nos
                                            ? {
                                                label: values?.skill3nos,
                                                value: values?.skill3nos,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("skill3nos", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "skill3nos"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="skill3nos"
                                    id="skill3nos"
                                    placeholder="Skill 3nos"
                                    value={values.skill3nos}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Skill 3nos"
                                  />
                                )}
                              </Form.Group>{" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Skill 3 Contribution
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "skill3contribution" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName ===
                                          "skill3contribution"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "skill3contribution"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="skill3contribution"
                                        className="mt-1"
                                        placeholder="Skill 3 Contribution"
                                        value={
                                          values?.skill3contribution
                                            ? {
                                                label:
                                                  values?.skill3contribution,
                                                value:
                                                  values?.skill3contribution,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "skill3contribution",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "skill3contribution"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="skill3contribution"
                                    id="skill3contribution"
                                    placeholder="Skill 3 Contribution"
                                    value={values.skill3contribution}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Skill 3 Contribution"
                                  />
                                )}
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
                              {" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Additional Replacement Spare1
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "addReplacespare1" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName ===
                                          "addReplacespare1"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "addReplacespare1"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="addReplacespare1"
                                        className="mt-1"
                                        placeholder="Additional Replacement Spare1"
                                        value={
                                          values?.addReplacespare1
                                            ? {
                                                label: values?.addReplacespare1,
                                                value: values?.addReplacespare1,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "addReplacespare1",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "addReplacespare1"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="addReplacespare1"
                                    id="addReplacespare1"
                                    placeholder="Additional Replacement Spare1"
                                    value={values.addReplacespare1}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Additional Replacement Spare1"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              {" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Additional Replacement Spare1 Qty
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "addReplacespare1qty" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName ===
                                          "addReplacespare1qty"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "addReplacespare1qty"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="addReplacespare1qty"
                                        className="mt-1"
                                        placeholder="Additional Replacement Spare1 Qty"
                                        value={
                                          values?.addReplacespare1qty
                                            ? {
                                                label:
                                                  values?.addReplacespare1qty,
                                                value:
                                                  values?.addReplacespare1qty,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "addReplacespare1qty",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "addReplacespare1qty"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="addReplacespare1qty"
                                    id="addReplacespare1qty"
                                    placeholder="Additional Replacement Spare1 Qty"
                                    value={values.addReplacespare1qty}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Additional Replacement Spare1 Qty"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>{" "}
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Additional replacement spare2
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "addReplacespare2" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName ===
                                          "addReplacespare2"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "addReplacespare2"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="addReplacespare2"
                                        className="mt-1"
                                        placeholder="Additional Replacement Spare2"
                                        value={
                                          values?.addReplacespare2
                                            ? {
                                                label: values?.addReplacespare2,
                                                value: values?.addReplacespare2,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "addReplacespare2",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "addReplacespare2"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="addReplacespare2"
                                    id="addReplacespare2"
                                    placeholder="Additional Replacement Spare2"
                                    value={values.addReplacespare2}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Additional Replacement Spare2"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Additional Replacement Spare2 Qty
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "addReplacespare2qty" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName ===
                                          "addReplacespare2qty"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "addReplacespare2qty"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="addReplacespare2qty"
                                        className="mt-1"
                                        placeholder="Additional Replacement Spare2 Qty"
                                        value={
                                          values?.addReplacespare2qty
                                            ? {
                                                label:
                                                  values?.addReplacespare2qty,
                                                value:
                                                  values?.addReplacespare2qty,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "addReplacespare2qty",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "addReplacespare2qty"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="addReplacespare2qty"
                                    id="addReplacespare2qty"
                                    placeholder="Additional Replacement Spare2 Qty"
                                    value={values.addReplacespare2qty}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Additional Replacement Spare2 Qty"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>{" "}
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Additional replacement spare3
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "addReplacespare3" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName ===
                                          "addReplacespare3"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "addReplacespare3"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="addReplacespare3"
                                        className="mt-1"
                                        placeholder="Additional Replacement Spare3"
                                        value={
                                          values?.addReplacespare3
                                            ? {
                                                label: values?.addReplacespare3,
                                                value: values?.addReplacespare3,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "addReplacespare3",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "addReplacespare3"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="addReplacespare3"
                                    id="addReplacespare3"
                                    placeholder="Additional Replacement Spare3"
                                    value={values.addReplacespare3}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Additional Replacement Spare3"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              {" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>
                                  Additional Replacement Spare3 Qty
                                </Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "addReplacespare3qty" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName ===
                                          "addReplacespare3qty"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "addReplacespare3qty"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="addReplacespare3qty"
                                        className="mt-1"
                                        placeholder="Additional Replacement Spare3 Qty"
                                        value={
                                          values?.addReplacespare3qty
                                            ? {
                                                label:
                                                  values?.addReplacespare3qty,
                                                value:
                                                  values?.addReplacespare3qty,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "addReplacespare3qty",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "addReplacespare3qty"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="addReplacespare3qty"
                                    id="addReplacespare3qty"
                                    placeholder="Additional Replacement Spare3 Qty"
                                    value={values.addReplacespare3qty}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Additional Replacement Spare3 Qty"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>{" "}
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 1</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable1" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable1"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable1"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable1"
                                        className="mt-1"
                                        placeholder="Consumable 1"
                                        value={
                                          values?.Consumable1
                                            ? {
                                                label: values?.Consumable1,
                                                value: values?.Consumable1,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("Consumable1", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable1"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable1"
                                    id="Consumable1"
                                    placeholder="Consumable 1"
                                    value={values.Consumable1}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 1"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 1 Qty</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable1qty" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable1qty"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable1qty"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable1qty"
                                        className="mt-1"
                                        placeholder="Consumable 1 Qty"
                                        value={
                                          values?.Consumable1qty
                                            ? {
                                                label: values?.Consumable1qty,
                                                value: values?.Consumable1qty,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "Consumable1qty",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable1qty"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable1qty"
                                    id="Consumable1qty"
                                    placeholder="Consumable 1 Qty"
                                    value={values.Consumable1qty}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 1 Qty"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>{" "}
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              {" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 2</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable2" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable2"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable2"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable2"
                                        className="mt-1"
                                        placeholder="Consumable 2"
                                        value={
                                          values?.Consumable2
                                            ? {
                                                label: values?.Consumable2,
                                                value: values?.Consumable2,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("Consumable2", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable2"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable2"
                                    id="Consumable2"
                                    placeholder="Consumable 2"
                                    value={values.Consumable2}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 2"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 2 Qty</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable2qty" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable2qty"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable2qty"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable2qty"
                                        className="mt-1"
                                        placeholder="Consumable 2 Qty"
                                        value={
                                          values?.Consumable2qty
                                            ? {
                                                label: values?.Consumable2qty,
                                                value: values?.Consumable2qty,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "Consumable2qty",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable2qty"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable2qty"
                                    id="Consumable2qty"
                                    placeholder="Consumable 2 Qty"
                                    value={values.Consumable2qty}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 2 Qty"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>{" "}
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 3</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable3" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable3"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable3"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable3"
                                        className="mt-1"
                                        placeholder="Consumable 3"
                                        value={
                                          values?.Consumable3
                                            ? {
                                                label: values?.Consumable3,
                                                value: values?.Consumable3,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("Consumable3", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable3"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable3"
                                    id="Consumable3"
                                    placeholder="Consumable 3"
                                    value={values.Consumable3}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 3"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 3 Qty</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable3qty" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable3qty"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable3qty"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable3qty"
                                        className="mt-1"
                                        placeholder="Consumable 3 Qty"
                                        value={
                                          values?.Consumable3qty
                                            ? {
                                                label: values?.Consumable3qty,
                                                value: values?.Consumable3qty,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "Consumable3qty",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable3qty"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable3qty"
                                    id="Consumable3qty"
                                    placeholder="Consumable 3 Qty"
                                    value={values.Consumable3qty}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 3 Qty"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>{" "}
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              {" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 4</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable4" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable4"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable4"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable4"
                                        className="mt-1"
                                        placeholder="Consumable 4"
                                        value={
                                          values?.Consumable4
                                            ? {
                                                label: values?.Consumable4,
                                                value: values?.Consumable4,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("Consumable4", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable4"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable4"
                                    id="Consumable4"
                                    placeholder="Consumable 4"
                                    value={values.Consumable4}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 4"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 4 Qty</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable4qty" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable4qty"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable4qty"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable4qty"
                                        className="mt-1"
                                        placeholder="Consumable 4 Qty"
                                        value={
                                          values?.Consumable4qty
                                            ? {
                                                label: values?.Consumable4qty,
                                                value: values?.Consumable4qty,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "Consumable4qty",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable4qty"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable4qty"
                                    id="Consumable4qty"
                                    placeholder="Consumable 4 Qty"
                                    value={values.Consumable4qty}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 4 Qty"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="px-3 pb-3">
                            <Col md={6}>
                              {" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 5</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable5" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable5"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable5"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable5"
                                        className="mt-1"
                                        placeholder="Consumable 5"
                                        value={
                                          values?.Consumable5
                                            ? {
                                                label: values?.Consumable5,
                                                value: values?.Consumable5,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("Consumable5", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable5"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable5"
                                    id="Consumable5"
                                    placeholder="Consumable 5"
                                    value={values.Consumable5}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 5"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mt-3">
                                <Label notify={true}>Consumable 5 Qty</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "Consumable5qty" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "Consumable5qty"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName ===
                                          "Consumable5qty"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="Consumable5qty"
                                        className="mt-1"
                                        placeholder="Consumable 5 Qty"
                                        value={
                                          values?.Consumable5qty
                                            ? {
                                                label: values?.Consumable5qty,
                                                value: values?.Consumable5qty,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue(
                                            "Consumable5qty",
                                            e.value
                                          );
                                          getAllConnectedLibrary(
                                            e.value,
                                            "Consumable5qty"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="Consumable5qty"
                                    id="Consumable5qty"
                                    placeholder="Consumable 5 Qty"
                                    value={values.Consumable5qty}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="Consumable 5 Qty"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card>
                        <div className="mttr-sec mb-2 mt-4">
                          <p className=" mb-0 para-tag">Remarks</p>
                        </div>
                        <Card
                          className="mb-3"
                          style={{ backgroundColor: "#F2F1F2" }}
                        >
                          <Row className="px-3 pb-3">
                            <Col md={6} className="mt-4 mb-4">
                              <Form.Group className="mt-3">
                                <Label notify={true}>User Field 1</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "userfield1" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "userfield1"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "userfield1"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="userfield1"
                                        className="mt-1"
                                        placeholder="User Field 1"
                                        value={
                                          values?.userfield1
                                            ? {
                                                label: values?.userfield1,
                                                value: values?.userfield1,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("userfield1", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "userfield1"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="userfield1"
                                    id="userfield1"
                                    placeholder="User Field 1"
                                    value={values.userfield1}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="User Field 1"
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>User Field 2</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "userfield2" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "userfield2"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "userfield2"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="userfield2"
                                        className="mt-1"
                                        placeholder="User Field 2"
                                        value={
                                          values?.userfield2
                                            ? {
                                                label: values?.userfield2,
                                                value: values?.userfield2,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("userfield2", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "userfield2"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="userfield2"
                                    id="userfield2"
                                    placeholder="User Field 2"
                                    value={values.userfield2}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="User Field 2"
                                  />
                                )}
                              </Form.Group>{" "}
                              <Form.Group className="mt-3">
                                <Label notify={true}>User Field 3</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "userfield3" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "userfield3"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "userfield3"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="userfield3"
                                        className="mt-1"
                                        placeholder="User Field 3"
                                        value={
                                          values?.userfield3
                                            ? {
                                                label: values?.userfield3,
                                                value: values?.userfield3,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("userfield3", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "userfield3"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="userfield3"
                                    id="userfield3"
                                    placeholder="User Field 3"
                                    value={values.userfield3}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="User Field 3"
                                  />
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6} className="mt-4 mb-4">
                              <Form.Group className="mt-3">
                                <Label notify={true}>User Field 4</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "userfield4" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "userfield4"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "userfield4"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="userfield4"
                                        className="mt-1"
                                        placeholder="User Field 4"
                                        value={
                                          values?.userfield4
                                            ? {
                                                label: values?.userfield4,
                                                value: values?.userfield4,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("userfield4", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "userfield4"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="userfield4"
                                    id="userfield4"
                                    placeholder="User Field 4"
                                    value={values.userfield4}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="User Field 4"
                                  />
                                )}
                              </Form.Group>
                              <Form.Group className="mt-3">
                                <Label notify={true}>User field 5</Label>
                                {allSepareteData.some(
                                  (item) =>
                                    item.sourceName === "userfield5" &&
                                    item.sourceValue
                                ) ? (
                                  (() => {
                                    const seperateFilteredData =
                                      allSepareteData?.filter(
                                        (item) =>
                                          item?.sourceName === "userfield5"
                                      ) || [];
                                    const connectedFilteredData =
                                      allConnectedData?.filter(
                                        (item) =>
                                          item?.destinationName === "userfield5"
                                      ) || [];
                                    const options =
                                      connectedFilteredData.length > 0
                                        ? connectedFilteredData.map((item) => ({
                                            value: item?.destinationValue,
                                            label: item?.destinationValue,
                                          }))
                                        : seperateFilteredData.map((item) => ({
                                            value: item?.sourceValue,
                                            label: item?.sourceValue,
                                          }));

                                    return (
                                      <Select
                                        name="userfield5"
                                        className="mt-1"
                                        placeholder="User Field 5"
                                        value={
                                          values?.userfield5
                                            ? {
                                                label: values?.userfield5,
                                                value: values?.userfield5,
                                              }
                                            : ""
                                        }
                                        style={{ backgroundColor: "red" }}
                                        options={options}
                                        styles={customStyles}
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
                                        onChange={(e) => {
                                          setFieldValue("userfield5", e.value);
                                          getAllConnectedLibrary(
                                            e.value,
                                            "userfield5"
                                          );
                                        }}
                                      />
                                    );
                                  })()
                                ) : (
                                  <Form.Control
                                    name="userfield5"
                                    id="userfield5"
                                    placeholder="User Field 5"
                                    value={values.userfield5}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    title="User Field 5"
                                  />
                                )}
                              </Form.Group>
                              {/* <Form.Group className="mt-3">
                          <Label>User field 6</Label>
                          <Form.Control
                            name="userfield6"
                            id="userfield6"
                            value={values.userfield6}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="mt-1"
                          />
                        </Form.Group> */}
                            </Col>{" "}
                          </Row>
                        </Card>
                        <div className="d-flex flex-direction-row justify-content-end  mt-4 mb-5">
                          <Button
                            className="  delete-cancel-btn me-2 "
                            variant="outline-secondary"
                            //  onClick={() => history.goBack()}
                            onClick={handleCancelClick}
                          >
                            CANCEL
                          </Button>
                          <Button
                            className=" save-btn"
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

      <Modal show={show} centered onHide={() => setShow(false)}>
        <div className="d-flex justify-content-center mt-5">
          <FontAwesomeIcon
            icon={faCircleCheck}
            fontSize={"40px"}
            color="#1D5460"
          />
        </div>
        <Modal.Footer className=" d-flex justify-content-center mt-3 mb-5 success-message">
          <div className="success-message">
            <h5> {showValue} </h5>
          </div>
        </Modal.Footer>
      </Modal>
      <div>
        <Modal show={value} centered onHide={() => setValue(false)}>
          {/* <div style={{ color: "red" }}>
              <h5 className="d-flex justify-content-center mt-5"> {showValue} </h5>
            </div> */}
          <div className="d-flex justify-content-center mt-5">
            <FaExclamationCircle size={45} color="#de2222b0" />
          </div>
          <Modal.Footer
            className=" d-flex justify-content-center"
            style={{ borderTop: 0 }}
          >
            <div>
              <h5 className="d-flex justify-content-center mt-3 mb-5">
                {" "}
                {showValue}{" "}
              </h5>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
