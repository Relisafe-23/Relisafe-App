import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Modal,
  Row,
} from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/PBS.scss";
import { ErrorMessage, Formik } from "formik";
import Select from "react-select";
import Environment from "../core/Environment";
import Api from "../../Api";
import * as Yup from "yup";
import MaterialTable from "material-table";
import { ThemeProvider } from "@material-ui/styles";
import { createTheme } from "@material-ui/core/styles";
import { tableIcons } from "./TableIcons";
import { Electronic, Mechanical } from "../core/partTypeCategory";
import * as XLSX from "xlsx";
import { Link, useHistory } from "react-router-dom";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import { FaEllipsisV, FaExclamationCircle } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { customStyles } from "../core/select";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faFileDownload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

export default function PBS(props) {
  let projectId = props?.location?.state?.projectId;
  if (!projectId) {
    const url = window.location.href; // Get the full URL
    const urlParts = url.split("/"); // Split URL by '/'
    projectId = urlParts[urlParts?.length - 1]; // Assuming projectId is the last segment of the URL
  }

  const [productId, setProductId] = useState();
  const [treeId, setTreeId] = useState();
  const [deleteId, setDeleteId] = useState();
  const [productIndexCount, setProductIndexCount] = useState();
  const [deleteTreeId, setDeleteTreeId] = useState();
  const [isMainSubmit, setIsMainSubmit] = useState(false);
  const [category, setCategory] = useState({
    value: "Assembly",
    label: "Assembly",
  });
  const [environment, setEnvironment] = useState("");
  const [show, setShow] = useState(false);
  const [partType, setPartType] = useState("");
  const [mainProductModalOpen, setMainProductModalOpen] = useState(false);
  const [subProduct, setSubProduct] = useState(false);
  const [prefillEnviron, setPrefillEnviron] = useState([]);
  const [prefillTemp, setPrefillTemp] = useState([]);
  const [subProductError, setSubProductError] = useState(false);
  const [data, setData] = useState([]);
  const [count, setCount] = useState();
  const [treeTableData, setTreeTableData] = useState([])
  const [parentId, setParentId] = useState("");

  const [isLoading, setISLoading] = useState(true);
  const [productMessage, setProductMessage] = useState("");
  const [errorCode, setErrorCode] = useState(0);
  const [newProId, setNewProId] = useState();
  const [permission, setPermission] = useState();
  const token = localStorage.getItem("sessionId");
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [patchCategory, setPatchCategory] = useState();
  const [patchPartType, setPatchPartType] = useState();
  const [patchName, setPatchName] = useState();
  const [partNumber, setPartNumber] = useState();
  const [quantity, setQuantity] = useState();
  const [reference, setReference] = useState();
  const history = useHistory();
  const [patchModal, setPatchModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [parentsId, setParentsId] = useState();
  const [colId, setColId] = useState("");
  const [deleteMessage, setDeleteMessage] = useState();
  const [colDefs, setColDefs] = useState();
  const [deleteProduct, setDeleteProduct] = useState();
  const [deleteSuccess, SetDeleteSuccess] = useState(false);
  const [childProductCriteria, setChildProductCriteria] = useState(false);
  const mainProductModalClose = () => {
    setMainProductModalOpen(false);
    setCategory({ value: "Assembly", label: "Assembly" });
  };
  const [copyProductTreeId, setCopyProductTreeId] = useState();
  const [pasteProductTreeId, setPasteProductTreeId] = useState();
  const [pasteProductId, setPasteProdctId] = useState();
  const [copyProdctId, setCopyProdctId] = useState();
  const [selectCopyData, setSelectCopyData] = useState([[]]);

  const DownloadExcel = () => {
    // Assuming 'tableData' is an array of objects, and you want to remove multiple columns
    const columnsToRemove = [
      "indexCount",
      "type",
      "productId",
      "id",
      "reference",
      "children",
      "tableData",
      "parentId",
      "status",
      "temperature",
      "environment",
      "quantity",
    ];
    const CompanyName = companyName;
    const ProjectName = projectName;

    // Create a new array with the unwanted columns removed from each object
    const modifiedTableData = data.map((row) => {
      const newRow = {
        ...row,
        CompanyName,
        ProjectName
      };
      columnsToRemove.forEach((columnName) => {
        delete newRow[columnName];
      });

      // rowsToRemove.forEach(rowName=>{
      //   delete columns[rowName]
      // });

      return newRow;
    });
    if (modifiedTableData?.length > 0) {
      const columns = Object.keys(modifiedTableData[0]).map((columnName) => ({
        title: columnName,
        field: columnName,
      }));
      console.log("modifiedTableData", modifiedTableData);
      const workSheet = XLSX.utils.json_to_sheet(modifiedTableData, {
        skipHeader: false,
      });
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "PBS Data");

      const buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });

      // Create a Blob object and initiate a download
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      console.log("url", url);
      console.log("link", link);
      link.href = url;
      link.download = "PBS.xlsx";
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

  const createPBSDataFromExcel = (values) => {
    setISLoading(true);
    console.log("values", values);
    const companyId = localStorage.getItem("companyId");
    Api.post("api/v1/productBreakdownStructure", {
      productName: values.productName,
      category: category.value,
      partNumber: values.partNumber,
      partType: partType ? partType : "-",
      reference: values.referenceOrPosition,
      quantity: values.quantity,
      environment: prefillEnviron.value,
      temperature: values.temperature,
      projectId: projectId,
      companyId: companyId,
      token: token,
    }).then((response) => {
      setISLoading(false);
      const status = response?.status;
      if (status === 204) {
        //setFailureModeRatioError(true);
      }
      //getProductData();
      setISLoading(false);
    });
  };

  const convertToJson = (headers, data) => {
    const rows = [];
    if (data?.length > 0 && data[0]?.length > 1) {
      data.forEach((row) => {
        let rowData = {};
        row.forEach((element, index) => {
          rowData[headers[index]] = element;
        });
        rows.push(rowData);
        createPBSDataFromExcel(rowData);
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
    const validExtensions = ['xlsx', 'xls']; // Allowed file extensions
    const fileExtension = fileName.split('.').pop().toLowerCase(); // Get file extension

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
      console.log("workSheetName", workSheetName)

      const workSheet = workBook.Sheets[workSheetName];
      console.log("workSheet", workSheet)
      //convert array
      const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      const headers = fileData[0];
      console.log("headers", headers)
      const heads = headers.map((head) => ({ title: head, field: head }));
      setColDefs(heads);
      fileData.splice(0, 1);
      setData(convertToJson(headers, fileData));

    };

    reader.readAsBinaryString(file);
  };



  const userId = localStorage.getItem("userId");
  const getProjectPermission = () => {
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        authorizedPersonnel: userId,
        projectId: projectId,
        token: token,
        userId: userId,
      },
    })
      .then((res) => {
        console.log("res", res);
        const data = res?.data?.data;
        setPermission(data?.modules[0]);
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
      console.log("res", res);
      setIsOwner(res?.data?.data?.isOwner);
      setCreatedBy(res?.data?.data?.createdBy);
    });
  };

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
    getEnvironAndTemp();
    getTreeProduct();
  }, [projectId]);

  const showModal = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        setErrorCode(0);
      }, 2000);
    }, 2000);
  };
  const deleteShowModal = () => {
    SetDeleteSuccess(true);
    setDeleteMessage(false);
    setTimeout(() => {
      SetDeleteSuccess(false);
      setTimeout(() => {
        setErrorCode(0);
      }, 2000);
    }, 2000);
  };

  const columnsTitle = [
    { title: "", width: "5%", align: "center" }, // Icon column
    { title: "S.No", width: "7%", align: "center" },
    { title: "Product Name", width: "18%", align: "center" },
    { title: "Category", width: "10%", align: "center" },
    { title: "Part Number", width: "15%", align: "center" },
    { title: "Part Type", width: "15%", align: "center" },
    { title: "FR", width: "5%", align: "center" },
    { title: "MTTR", width: "5%", align: "center" },
    { title: "MCT", width: "5%", align: "center" },
    { title: "MLH", width: "5%", align: "center" },
    { title: "Actions", width: "5%", align: "center" },
  ];

  const columns = [
    { field: "indexCount", width: "2%", align: "center" },
    // { field: "SNo", width: "7%", align: "center", backgroundColor: "#e9ecef" },
    { field: "productName", width: "20%", align: "center" },
    { field: "category", width: "10%", align: "center" },
    { field: "partNumber", width: "10%", align: "center" },
    { field: "partType", width: "10%", align: "center" },
    { field: "FR", width: "5%", align: "center" },
    { field: "MTTR", width: "5%", align: "center" },
    { field: "MCT", width: "5%", align: "center" },
    { field: "MLH", width: "5%", align: "center" },
  ];

  const tableTheme = createTheme({
    overrides: {
      MuiTableRow: {
        root: {
          "&:hover": {
            cursor: "pointer",
            backgroundColor: "rgba(224, 224, 224, 1) !important",
            color: "rgba(0, 0, 0, 1) !important",
          },
        },
      },
    },
  });

  const mainProductForm = (values, { resetForm }) => {
    setIsMainSubmit(true);
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    Api.post("api/v1/productBreakdownStructure", {
      productName: values.productName,
      category: category.value,
      partNumber: values.partNumber,
      partType: partType ? partType : "-",
      reference: values.referenceOrPosition,
      quantity: values.quantity,
      environment: prefillEnviron.value,
      temperature: values.temperature,
      projectId: projectId,
      companyId: companyId,
      token: token,
      userId: userId,
    })
      .then((res) => {
        setProductMessage(res?.data?.message);
        setIsMainSubmit(false);
        resetForm({ values: "" });
        setData([...data, res.data.data.createNode]);
        setMainProductModalOpen(false);
        showModal();
        setCategory({ value: "Assembly", label: "Assembly" });
        setPartType("");
        localStorage.setItem(
          "lastCreatedProductId",
          res.data.data.createNode.id
        );
        // setSubProduct(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  function hueToLCH(hue) {
    const l = 45.12; // Lightness value
    const c = 0.267; // Chroma value
    const h = hue; // Hue value
    return `oklch(${l}% ${c} ${h})`;
  }

  const rowStyle = (rowData) => {
    // const userThemeColor = res?.data?.user?.userThemeColor ?? 189;
    const lastProductId = localStorage.getItem("lastCreatedProductId");
    const storedHue = localStorage.getItem("themeHue");
    const initialHue = storedHue ? parseInt(storedHue, 10) : 0;

    if (rowData.id === lastProductId) {
      const lchColor = hueToLCH(initialHue);
      return {
        backgroundColor: lchColor,
        color: "white",
      };
    }
    return {};
  };
  const subProductForm = (values, { resetForm }) => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    Api.post("api/v1/product/", {
      productName: values.productName,
      category: category.value,

      partType: partType ? partType : "-",
      partNumber: values.partNumber,
      reference: values.referenceOrPosition,
      quantity: values.quantity,
      environment: prefillEnviron.value,
      temperature: values.temperature,
      indexCount: count,
      productCount: productIndexCount,
      projectId: projectId,
      companyId: companyId,
      parentId: parentId,
      token: token,
      userId: userId,
    })
      .then((res) => {

        setProductMessage(res?.data?.message);
        setMainProductModalOpen(false);
        resetForm({ values: "" });
        showModal();
        setData([...data, res.data.addNode]);
        setNewProId(res.data.addNode.id);
        localStorage.setItem("lastCreatedProductId", res.data.addNode.id);
        getTreeProduct();
        setSubProductError(false);
        setPartType("");
        setSubProduct(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus >= 400) {
          showModal();
          setSubProduct(false);
          setSubProductError(true);
          setMainProductModalOpen(false);
          setCategory({ value: "Assembly", label: "Assembly" });
          setProductMessage(error?.response?.data?.message);
          setISLoading(false);
          resetForm({ values: "" });
          setErrorCode(errorStatus);
        }
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const handleCopyClick = (rowData) => {
    toast.success("Data copied successfully!", {
      position: toast.POSITION.TOP_RIGHT, // Adjust the position as needed
    });
  };

  const handlePasteClick = (rowData) => {
    toast.success("Data Paste successfully!", {
      position: toast.POSITION.TOP_RIGHT, // Adjust the position as needed
    });
  };
  const getTreeProduct = () => {
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: {
        projectId: projectId,
        userId: userId,
        token: sessionId,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;
        setData(treeData);
        console.log("treeData", treeData)
        setISLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const getEnvironAndTemp = () => {
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: { token: token, userId: userId },
    })
      .then((res) => {

        const ProjectName = res.data.data.projectName;
        const CompanyName = res.data.data.companyId.companyName;

        setCompanyName(CompanyName)
        setProjectName(ProjectName)
        const data = res.data.data;

        setPrefillEnviron(
          data?.environment
            ? { value: data?.environment, label: data?.environment }
            : ""
        );
        setPrefillTemp(data?.temperature);
        setISLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const patchForm = (values) => {
    const userId = localStorage.getItem("userId");
    setISLoading(true);
    Api.patch(`/api/v1/product/update`, {
      productId: productId,
      productName: values.productName,
      category: category.value,
      reference: values.referenceOrPosition,
      // environment: prefillEnviron.value,
      environment: values.environment?.value || environment,
      temperature: values.temperature,
      partNumber: values.partNumber,
      partType: values.partType.value,
      quantity: values.quantity,
      token: token,
      userId: userId,
      productTreeStructureId: treeId,
      projectId: projectId,
    })
      .then((res) => {
        setProductMessage(res?.data?.message);
        getTreeProduct();
        setMainProductModalOpen(false);
        showModal();
        setPatchCategory("");
        setPatchPartType("");
        setReference("");
        setQuantity("");
        setPartNumber("");
        setPatchName("");
        setPartType("");
        setISLoading(false);
        // window.location.reload();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  const deleteForm = (values) => {
    const companyId = localStorage.getItem("companyId");
    var result = productIndexCount - Math.floor(productIndexCount) !== 0;
    let parentIndex;
    if (result) {
      parentIndex = productIndexCount.slice(0, -2);
    } else {
      parentIndex = productIndexCount;
    }
    const userId = localStorage.getItem("userId");
    Api.patch("/api/v1/product/delete", {
      productId: deleteId,
      projectId: projectId,
      companyId: companyId,
      parentId: parentsId,
      indexCount: parentIndex,
      productTreeStructureId: deleteTreeId,
      token: token,
      userId: userId,
    })
      .then((res) => {
        getTreeProduct();
        deleteShowModal();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  const callCopyProduct = (pasteProductTreeIds, pasteProductIds) => {
    Api.get("/api/v1/product/get/single/product", {
      params: {
        copyProductTreeId: pasteProductTreeIds,
        copyProductId: pasteProductIds,
      },
    }).then((response) => {

      const copyData = response.data.treeData;
      setSelectCopyData(copyData);
    });
  };
  const callCopyAndPasteProduct = (pasteProductTreeIds, pasteProductIds) => {
    if (selectCopyData.children?.length > 0) {
      copyAndPasteProduct(pasteProductTreeIds, pasteProductIds);
    } else {
      copyAndPasteParentProduct(pasteProductTreeIds, pasteProductIds);
    }
  };
  const copyAndPasteParentProduct = (pasteProductTreeIds, pasteProductIds) => {
    Api.post("/api/v1/product/copy/paste/parent/product", {
      copyProductTreeId: copyProductTreeId,
      pasteProductTreeId: pasteProductTreeIds,
      pasteProductId: pasteProductIds,
      copyProductId: copyProdctId,
    }).then((response) => {
      setCopyProductTreeId("");
      setPasteProductTreeId("");
      setCopyProdctId("");
      setPasteProdctId("");
      setSelectCopyData();
    });
  };

  const copyAndPasteProduct = (pasteProductTreeIds, pasteProductIds) => {
    Api.post("/api/v1/product/copy/paste/sub/product", {
      copyProductTreeId: copyProductTreeId,
      pasteProductTreeId: pasteProductTreeIds,
      pasteProductId: pasteProductIds,
      copyProductId: copyProdctId,
    }).then((response) => {
      setSelectCopyData();
    });
  };
  const mainProductSchema = Yup.object().shape({
    productName: Yup.string().required("Name is required"),
    partNumber: Yup.string().required(" Part number is required"),
    referenceOrPosition: Yup.string().nullable(),
    quantity: Yup.number()
      .typeError("This Field Accept Numbers Only")
      .required("Quantity is required"),
    environment: Yup.object().required("Environment is required"),
    partType:
      category === "" || category.value === "Assembly"
        ? Yup.object().nullable()
        : Yup.object().required(),
    temperature: Yup.string()
      .typeError("This Field Accept Numbers Only")
      .required("Temperature is  required"),
  });

  const role = localStorage.getItem("role");

  const customSort = (a, b) => {
    const indexA = a.indexCount?.toString();
    const indexB = b.indexCount?.toString();
    return indexA?.localeCompare(indexB, undefined, { numeric: true });
  };

  // Sort the data array
  const sortedData = data.slice().sort(customSort);

  console.log("Sorted Data:", sortedData);


  return (
    <div className="pbs-main px-4" style={{ marginTop: "90px" }}>
      {isLoading ? (
        <Loader />
      ) : permission?.read === true ||
        permission?.read === "undefined" ||
        role === "admin" ||
        (isOwner === true && createdBy === userId) ? (
        <div>
          <div className="freeze-header">
            <Projectname projectId={projectId} />
            <div className="mttr-sec mb-1"></div>
          </div>

          <div>
            <Formik
              enableReinitialize={true}
              initialValues={{
                productName: patchName ? patchName : "",
                partNumber: partNumber ? partNumber : "",
                partType: patchPartType
                  ? { label: patchPartType, value: patchPartType }
                  : "",
                referenceOrPosition: reference ? reference : "",
                quantity: quantity ? quantity : "",
                environment: prefillEnviron,
                temperature: prefillTemp,
                category: patchCategory
                  ? { label: patchCategory, value: patchCategory }
                  : "",
              }}
              validationSchema={mainProductSchema}
              onSubmit={(values, { resetForm }) => {
                patchModal === true
                  ? patchForm(values, { resetForm })
                  : subProduct === true
                    ? subProductForm(values, { resetForm })
                    : mainProductForm(values, { resetForm });
              }}
            >
              {(formik) => {
                const {
                  values,
                  handleChange,
                  handleSubmit,
                  handleBlur,
                  isValid,
                  mainProductForm,
                  setFieldValue,
                } = formik;
                return (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Tooltip placement="left" title="Import">
                          <div style={{ marginTop: 7 }}>
                            <label
                              htmlFor="file-input"
                              className="add-product-btn"
                            >
                              <FontAwesomeIcon icon={faFileUpload} />
                            </label>
                            <input
                              type="file"
                              className="input-fields"
                              id="file-input"
                              onChange={importExcel}
                              disabled={
                                permission?.write === true ||
                                  permission?.write === "undefined" ||
                                  role === "admin" ||
                                  (isOwner === true && createdBy === userId)
                                  ? null
                                  : "disabled"
                              }
                              style={{ display: "none" }} // Hide the actual input
                            />
                          </div>
                        </Tooltip>
                        <Tooltip placement="right" title="Export">
                          <button
                            className="add-product-btn"
                            style={{ marginLeft: "10px", borderStyle: "none" }}
                            onClick={() => {
                              DownloadExcel();
                            }}
                            disabled={
                              data?.length === 0 || // Disable if no data
                                (permission?.write !== true &&
                                  permission?.write !== undefined &&
                                  role !== "admin" &&
                                  !(isOwner === true && createdBy === userId)) // Enable only if all these conditions are false
                                ? "disabled" // If any of these conditions are met, disable the button
                                : null // Otherwise, the button is enabled
                            }
                          >
                            <FontAwesomeIcon
                              icon={faFileDownload}

                            />
                          </button>
                        </Tooltip>
                      </div>
                      <Tooltip placement="top" title="Create Product">
                        <Button
                          className="add-product-btn"
                          onClick={() => {
                            setMainProductModalOpen(true);
                            setPatchModal(false);
                            setSubProduct(false);
                            setChildProductCriteria(false);
                          }}
                          disabled={
                            permission?.write === true ||
                              permission?.write === "undefined" ||
                              role === "admin" ||
                              (isOwner === true && createdBy === userId)
                              ? null
                              : "disabled"
                          }
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            style={{ width: "15px" }}
                          />
                        </Button>
                      </Tooltip>
                    </div>

                    <div className="main-div-product"
                      style={{ position: "absolute" }}>
                      <Modal 

                        show={mainProductModalOpen}
                        size="lg"
                        onHide={() => {
                          mainProductModalClose();
                          formik.resetForm();
                          setSubProduct(false);
                          setPatchCategory("");
                          setPatchPartType("");
                           setReference("");
                          setQuantity("");
                          setPartNumber("");
                          setPatchName("");
                          setPatchModal(false);

                        }}
                        style={{left: "-80px" }}
                        backdrop="static"
                          contentClassName="no-vertical-scroll"
                        //  dialogClassName="modal-full-height"
                      >
                        <Form onSubmit={handleSubmit} className="px-4">
                          <Modal.Header style={{ borderBottom: 0, display: "flex", alignItems: "center" }} closeButton>
                            <div style={{ flexGrow: 1 }}>
                              {patchModal === true ? (
                                <h3 className=" d-flex justify-content-center mb-2">
                                  Edit Product
                                </h3>
                              ) : subProduct === true ? (
                                <h3 className=" d-flex justify-content-center mb-2">
                                  Create Sub Product
                                </h3>
                              ) : (
                                <h3 className="d-flex justify-content-center mb-1">
                                  Create Product
                                </h3>
                              )}
                            </div>
                          </Modal.Header>
                          <Modal.Body
                          
                          >
                            <Row className="mb-4" style={{ top: "-40px" }}>
                              <div className="mttr-sec">
                                <p className=" mb-0 para-tag">
                                  General Information
                                </p>
                              </div>
                              <Card className="mt-2 pbs-modal-card mttr-card p-4">
                                <Row>
                                  <Col>
                                    <Form.Group>
                                      <Label notify={true} className="mb-1 ">
                                        Name
                                      </Label>
                                      <Form.Control
                                        type="text"
                                        name="productName"
                                        placeholder="Name"
                                        value={values.productName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="productName"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Form.Group>
                                      <Label notify={true} className="mb-1 ">
                                        Part Number
                                      </Label>
                                      <Form.Control
                                        type="text"
                                        name="partNumber"
                                        placeholder="Part Number"
                                        value={values.partNumber}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
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
                                      <Label notify={true} className="mb-1 ">
                                        Quantity
                                      </Label>
                                      <Form.Control
                                        type="number"
                                        min="0"
                                        step="any"
                                        name="quantity"
                                        placeholder="Quantity"
                                        value={values.quantity}
                                        onChange={handleChange}
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
                                      <Label className="mb-1 ">
                                        Reference or Position
                                      </Label>
                                      <Form.Control
                                        type="text"
                                        name="referenceOrPosition"
                                        placeholder="Reference or Position"
                                        value={values.referenceOrPosition}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="referenceOrPosition"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <Form.Group className="mt-3 ">
                                      <Label notify={true} className="mb-1">
                                        Category
                                      </Label>
                                      <Select
                                        type="select"
                                        styles={customStyles}
                                        isDisabled={childProductCriteria}
                                        value={
                                          category
                                            ? category
                                            : patchCategory
                                              ? {
                                                label: patchCategory,
                                                value: patchCategory,
                                              }
                                              : ""
                                        }
                                        name="category"
                                        placeholder="Select Category"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                          setFieldValue("category", e);
                                          setFieldValue("partType", "");
                                          setCategory(e);
                                          setPartType("");
                                        }}
                                        options={[
                                          {
                                            value: "Assembly",
                                            label: "Assembly",
                                          },
                                          {
                                            value: "Electronic",
                                            label: "Electronic",
                                          },
                                          {
                                            value: "Mechanical",
                                            label: "Mechanical",
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
                                  <Col>
                                    {category.value === "Assembly" ? null : (
                                      <div className="">
                                        <Form.Group className="mt-3 ">
                                          <Label notify={true}>Part Type</Label>
                                          <Select
                                            type="select"
                                            styles={customStyles}
                                            value={values.partType}
                                            placeholder="Select Part Type"
                                            name="partType"
                                            className="mt-1"
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              setFieldValue("partType", e);
                                              setPartType(e.value);
                                            }}
                                            options={[
                                              category.value === "Electronic"
                                                ? {
                                                  options: Electronic.map(
                                                    (list) => ({
                                                      value: list.value,
                                                      label: list.label,
                                                    })
                                                  ).sort((a, b) =>
                                                    a.label?.localeCompare(
                                                      b.label
                                                    )
                                                  ),
                                                }
                                                : {
                                                  options: Mechanical.map(
                                                    (list) => ({
                                                      value: list.value,
                                                      label: list.label,
                                                    })
                                                  ).sort((a, b) =>
                                                    a.label?.localeCompare(
                                                      b.label
                                                    )
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
                                    )}
                                  </Col>
                                </Row>
                              </Card>
                              <div className="mttr-sec mt-3">
                                <p className=" mb-0 para-tag">
                                  Environment Profile and Temperature
                                </p>
                              </div>
                              <Card className="mt-2 pbs-modal-card mttr-card p-4">
                                <Row>
                                  <Col>
                                    <Label notify={true} className="mb-1 ">
                                      Environment
                                    </Label>
                                    <Form.Group>
                                      <Select
                                        type="select"
                                        styles={customStyles}
                                        value={values.environment}
                                        name="environment"
                                        placeholder="Select Environment"
                                        onChange={(e) => {
                                          setFieldValue("environment", e);
                                          setEnvironment(e.value);
                                        }}
                                        onBlur={handleBlur}
                                        options={[
                                          { value: null, label: "None" },
                                          {
                                            options: Environment.map(
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
                                        name="environment"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label notify={true} className="mb-1 ">
                                      Temperature
                                    </Label>
                                    <Form.Group>
                                      <Form.Control
                                        type="number"
                                        min="0"
                                        step="any"
                                        name="temperature"
                                        value={values.temperature}


                                        onChange={handleChange}
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
                              </Card>
                            </Row>
                          </Modal.Body>
                          <Row
                            style={{ borderTop: 0, width: "101%" }}
                            className="me-0 pe-0"
                          >
                            <Col className="d-flex justify-content-end  mb-5 me-0 pe-0 ">
                              <Button
                                className="delete-cancel-btn  me-2"
                                variant="outline-secondary"
                                type="reset"
                                onClick={() => {
                                  mainProductModalClose();
                                  formik.resetForm();
                                  setSubProduct(false);
                                  setPatchCategory("");
                                  setPatchPartType("");
                                  setReference("");
                                  setQuantity("");
                                  setPartNumber("");
                                  setPatchName("");
                                  setPatchModal(false);
                                }}
                              >
                                CANCEL
                              </Button>

                              <div>
                                {patchModal === true ? (
                                  <Button className="save-btn" type="submit">
                                    UPDATE
                                  </Button>
                                ) : (
                                  <Button
                                    className="save-btn"
                                    type="submit"
                                    disabled={!isValid}
                                  >
                                    CREATE
                                  </Button>
                                )}
                              </div>
                            </Col>
                          </Row>
                        </Form>
                      </Modal>
                    </div>

                    <Modal show={show} centered onHide={() => setShow(!show)}>
                      <div className="d-flex justify-content-center mt-5">
                        <div>
                          {errorCode === 400 ? (
                            <FaExclamationCircle size={45} color="#de2222b0" />
                          ) : (
                            <FaCheckCircle size={40} color="#1D5460" />
                          )}
                        </div>
                      </div>
                      <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
                        <div>
                          <h4 className="text-center">
                            <h4 className="text-center">{productMessage}</h4>
                          </h4>
                        </div>
                      </Modal.Footer>
                    </Modal>
                    <Modal
                      show={deleteMessage}
                      centered
                      size="xl"
                      onHide={() => setShow(!show)}
                      dialogClassName="custom-delete-modal"
                    >
                      <Modal.Body className="p-4">
                        <div className="d-flex justify-content-center">
                          <h4 className="text-center">
                            Are you sure you want to delete?
                          </h4>
                        </div>
                      </Modal.Body>
                      <Modal.Footer className="d-flex justify-content-center py-4">
                        <Button
                          variant="outline-secondary"
                          onClick={() => setDeleteMessage(false)}
                          className="delete-cancel-btn mx-2"
                          style={{ minWidth: "100px" }}
                        >
                          No
                        </Button>
                        <Button
                          className="yes-btn"
                          onClick={() => deleteForm(deleteProduct)}
                          style={{
                            minWidth: "100px",
                            backgroundColor: "#218838",
                            borderColor: "#218838",
                            color: "white"
                          }}
                        >
                          Yes
                        </Button>
                      </Modal.Footer>
                    </Modal>
                    <Modal
                      show={deleteSuccess}
                      centered
                      onHide={() => setShow(!show)}
                    >
                      <div className="d-flex justify-content-center mt-5">
                        <div>
                          {errorCode === 400 ? (
                            <FaExclamationCircle size={45} color="#de2222b0" />
                          ) : (
                            <FaCheckCircle size={40} color="#1D5460" />
                          )}
                        </div>
                      </div>
                      <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
                        <div>
                          <h4 className="text-center">
                            <h4 className="text-center">
                              Product Deleted Successfully
                            </h4>
                          </h4>
                        </div>
                      </Modal.Footer>
                    </Modal>
                  </div>
                );
              }}
            </Formik>
          </div>
          <div className="mt-3 ">
            <ThemeProvider theme={tableTheme}>
              {/* <div className="header-container" style={{ overflowX: "auto" }}>
                <table className="material-table">
                  <thead>
                    <tr>
                      {columnsTitle.map((column, index) => (
                        <th
                          key={index}
                          className="material-table-header"
                          style={{
                            width: column.width,
                            textAlign: column.align,

                            //     // width:
                            // index === 0
                            //   ? "150px"
                            //   : index === 1
                            //   ? "300px"
                            //   : index === 4 || index === 9
                            //   ? "150px"
                            //   : "auto"
                          }}
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div> */}
              <MaterialTable
                title="PBS"
                columns={[
                  {
                    title: "S.No", field: "indexCount", width: "7%", align: "center",
                    cellStyle: { paddingLeft: '20px' },
                    headerStyle: { paddingLeft: '20px' }
                  },
                  { title: "Product Name", field: "productName", width: "18%", align: "center" },
                  { title: "Category", field: "category", width: "10%", align: "center" },
                  { title: "Part Number", field: "partNumber", width: "15%", align: "center" },
                  { title: "Part Type", field: "partType", width: "15%", align: "center" },
                  { title: "FR", field: "fr", width: "5%", align: "center" },
                  { title: "MTTR", field: "mttr", width: "5%", align: "center" },
                  { title: "MCT", field: "mct", width: "5%", align: "center" },
                  { title: "MLH", field: "mlh", width: "5%", align: "center" },
                ]}
                data={sortedData}
                icons={tableIcons}
                parentChildData={(row, rows) =>
                  rows.find((a) => a.id === row.productId)
                }
                actions={[
                  (rowData) => {
                    return {
                      icon: () => (
                        <Dropdown>
                          {permission?.write === true ||
                            permission?.write === "undefined" ||
                            role === "admin" ||
                            (isOwner === true && createdBy === userId) ? (
                            <Dropdown.Toggle className="dropdown">
                              <FaEllipsisV className="icon" />
                            </Dropdown.Toggle>
                          ) : null}
                          {permission?.write === true ||
                            permission?.write === "undefined" ||
                            role === "admin" ||
                            (isOwner === true && createdBy === userId) ? (
                            <Dropdown.Menu right>
                              {rowData.category === "Electronic" ||
                                rowData.category === "Mechanical" ? null : (
                                <Tooltip
                                  title="create sub product"
                                  placement="top"
                                >
                                  <Dropdown.Item
                                    className="user-dropitem-project text-center"
                                    onClick={() => {
                                      setMainProductModalOpen(true);
                                      setSubProduct(true);
                                      setPatchModal(false);
                                      setPartType("");
                                      setParentId(rowData.id);
                                      setProductIndexCount(
                                        rowData.indexCount
                                      );
                                      const convertNumber = parseInt(
                                        rowData.indexCount
                                      );
                                      setCount(convertNumber);
                                      setChildProductCriteria(false);
                                    }}
                                  >
                                    <span style={{ color: 'blue' }}>Add Child Part</span>

                                  </Dropdown.Item>
                                </Tooltip>
                              )}
                              <hr
                                style={{
                                  margin: "0",
                                  border: "1px",
                                  borderBottom: "1px solid #000000",
                                }}
                              />

                              {/* <Dropdown.Item
                                  className="user-dropitem-project text-center"
                                  onClick={() => {
                                    setProductId(rowData.id);
                                    setTreeId(rowData.parentId);
                                    setChildProductCriteria(
                                      rowData?.children?.length > 0
                                        ? true
                                        : false
                                    );
                                    setMainProductModalOpen(true);
                                    setPatchModal(true);
                                    setPatchCategory(rowData.category);
                                    setPatchPartType(rowData.partType);
                                    setReference(rowData.reference);
                                    setQuantity(rowData.quantity);
                                    setPartNumber(rowData.partNumber);
                                    setPatchName(rowData.productName);
                                    setCategory(
                                      rowData.category
                                        ? {
                                          value: rowData.category,
                                          label: rowData.category,
                                        }
                                        : ""
                                    );
                                  }}
                                >
                                  <span style={{ color: 'blue' }}>Edit</span>
                                </Dropdown.Item> */}
                              <Dropdown.Item
                                className="user-dropitem-project text-center"
                                onClick={() => {
                                  setProductId(rowData.id);
                                  setTreeId(rowData.parentId);
                                  setChildProductCriteria(
                                    rowData?.children?.length > 0
                                      ? true
                                      : false
                                  );
                                  setMainProductModalOpen(true);
                                  setPatchModal(true);
                                  setPatchCategory(rowData.category);
                                  setPatchPartType(rowData.partType);
                                  setReference(rowData.referenceOrPosition);
                                  setQuantity(rowData.quantity);
                                  setPartNumber(rowData.partNumber);
                                  setPatchName(rowData.productName);
                                  setCategory(
                                    rowData.category
                                      ? {
                                        value: rowData.category,
                                        label: rowData.category,
                                      }
                                      : ""
                                  );
                                }}
                              >
                                <span style={{ color: 'blue' }}>Edit</span>
                              </Dropdown.Item>
                              <hr
                                style={{
                                  margin: "0",
                                  border: "1px",
                                  borderBottom: "1px solid #000000",
                                }}
                              />

                              <Dropdown.Item
                                className="user-dropitem-project text-center"
                                onClick={() => {
                                  setParentsId(rowData?.productId);
                                  setDeleteProduct(rowData);
                                  setDeleteId(rowData.id);
                                  setProductIndexCount(rowData.indexCount);
                                  setDeleteTreeId(rowData.parentId);
                                  setDeleteMessage(true);
                                }}
                              >
                                <span style={{ color: 'blue' }}>Delete</span>
                              </Dropdown.Item>
                              <hr
                                style={{
                                  margin: "0",
                                  border: "1px",
                                  borderBottom: "1px solid #000000",
                                }}
                              />

                              <Dropdown.Item
                                className="user-dropitem-project text-center"
                                onClick={() => {
                                  setCopyProductTreeId(rowData.parentId);
                                  setCopyProdctId(rowData.id);
                                  handleCopyClick(rowData);
                                  callCopyProduct(
                                    rowData.parentId,
                                    rowData.id
                                  );
                                }}
                              >
                                <span style={{ color: 'blue' }}>Copy</span>
                              </Dropdown.Item>
                              <hr
                                style={{
                                  margin: "0",
                                  border: "1px",
                                  borderBottom: "1px solid #000000",
                                }}
                              />

                              <Dropdown.Item
                                className="user-dropitem-project text-center"
                                onClick={() => {
                                  setPasteProductTreeId(rowData.parentId);
                                  setPasteProdctId(rowData.id);
                                  callCopyAndPasteProduct(
                                    rowData.parentId,
                                    rowData.id
                                  );
                                  window.location.reload();
                                  handlePasteClick(rowData);
                                  setParentsId(rowData?.productId);
                                }}
                              >
                                <span style={{ color: 'blue' }}>Paste</span>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          ) : null}
                        </Dropdown>
                      ),
                      onClick: (event, rowData) => {
                        setColId(rowData.id);
                        setIsOpen(!isOpen);
                      },
                    };
                  },
                ]}
                // options={{
                //   actionsColumnIndex: -1,
                //   addRowPosition: "last",
                //   headerStyle: {
                //     backgroundColor: "#cce6ff",
                //     fontWeight: "bold",
                //     zIndex: 0,
                //   },
                //   defaultExpanded: true,
                //   rowStyle,
                //   header: false,
                //   search: false,
                // }}
                options={{
                  cellStyle: {
                    border: "1px solid #eee",
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  },
                  addRowPosition: "last",
                  actionsColumnIndex: -1,
                  pageSize: 5,
                  pageSizeOptions: [5, 10, 20, 50],
                  headerStyle: {
                    backgroundColor: "#CCE6FF",
                    fontWeight: "bold",
                    zIndex: 0,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',       // prevent line wrap
                    // minWidth: 200,              // or width: 200
                    maxWidth: 300,
                  },

                }}
              />
            </ThemeProvider>
          </div>
        </div>
      ) : (
        <div>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">Access Denied</Card.Title>
              <Card.Text>
                <p className="text-center">
                  You dont have permission to access these sections
                  <br />
                  Contact admin to get permission or go back to project list
                  page
                </p>
              </Card.Text>
              <Button
                variant="primary"
                className="save-btn fw-bold pbs-button-1"
                onClick={history.goBack}
              >
                Go Back
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}
