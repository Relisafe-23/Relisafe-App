import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Modal,
  Row,
  OverlayTrigger,
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
  faFileImport,
  faFileExport,
  faPlus,
  faFileDownload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

export default function PBS(props) {
  const projectId = props?.location?.state?.projectId;
  const [productId, setProductId] = useState();
  const [treeId, setTreeId] = useState();
  const [deleteId, setDeleteId] = useState();
  const [productIndexCount, setProductIndexCount] = useState();
  const [tableData, setTableData] = useState();
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
  const [parentId, setParentId] = useState("");

  const [isLoading, setISLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
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

  const DownloadExcel = () => {
    // Assuming 'tableData' is an array of objects, and you want to remove multiple columns
    const columnsToRemove = [
      // "indexCount",
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
    // Create a new array with the unwanted columns removed from each object
    const modifiedTableData = data.map((row) => {
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
      XLSX.utils.book_append_sheet(workBook, workSheet, "PBS Data");

      const buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });

      // Create a Blob object and initiate a download
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
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
    const companyId = localStorage.getItem("companyId");
    Api.post("api/v1/productBreakdownStructure", {
      productName: values.name,
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
    if (data.length > 0 && data[0].length > 1) {
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
      //setData(convertToJson(headers, fileData));
      convertToJson(headers, fileData);
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    getEnvironAndTemp();
    getTreeProduct();
  }, []);

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
      setIsOwner(res.data.data.isOwner);
      setCreatedBy(res.data.data.createdBy);
    });
  };

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
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

  // const columns = [
  //   { title: "S.No", field: "indexCount" },
  //   { title: " Product Name", field: "productName", cellStyle: { minWidth: "300px" } },
  //   { title: "Category", field: "category" },
  //   {
  //     title: "Part Number",
  //     field: "Part Number",
  //     cellStyle: { minWidth: "144px" },
  //   },
  //   { title: "Part Type", field: "partType", cellStyle: { minWidth: "123px" } },
  //   { title: "FR", field: "FR" },
  //   {
  //     title: "MTTR",
  //     field: "MTTR",
  //   },
  //   {
  //     title: "MCT",
  //     field: "MCT",
  //   },
  //   {
  //     title: "MLH",
  //     field: "MLH",
  //   },
  // ];
  const columnsTitle = [
    { title: "S.No" },
    { title: " Product Name" },
    { title: "Category" },
    {
      title: "Part Number",
    },
    { title: "Part Type" },
    { title: "FR" },
    {
      title: "MTTR",
    },
    {
      title: "MCT",
    },
    {
      title: "MLH",
    },
    {
      title: "Actions",
    },
  ];
  const columns = [
    { field: "indexCount" },
    { field: "productName", cellStyle: { minWidth: "300px" } },
    { field: "category" },
    {
      field: "Part Number",
      cellStyle: { minWidth: "144px" },
    },
    { field: "partType", cellStyle: { minWidth: "123px" } },
    { field: "FR" },
    {
      field: "MTTR",
    },
    {
      field: "MCT",
    },
    {
      field: "MLH",
    },
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
      productName: values.name,
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
    // Convert hue to LCH color
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
      console.log("hslColor.....", lchColor);
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
      productName: values.name,
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
      productName: values.name,
      category: category.value,
      reference: values.referenceOrPosition,
      environment: prefillEnviron.value,
      temperature: values.temperature,
      partType: values.partType.value,
      partNumber: values.partNumber,

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
  const callCopyAndPasteProduct = (pasteProductTreeIds, pasteProductIds) => {
    Api.get("/api/v1/product/get/single/product", {
      params: {
        copyProductTreeId: copyProductTreeId,
        copyProductId: copyProdctId,
      },
    }).then((response) => {
      const selectCopyData = response.data.treeData;
      if (selectCopyData.children.length > 0) {
        copyAndPasteProduct(pasteProductTreeIds, pasteProductIds);
      } else {
        copyAndPasteParentProduct(pasteProductTreeIds, pasteProductIds);
      }
    });
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
    });
  };
  const copyAndPasteProduct = (pasteProductTreeIds, pasteProductIds) => {
    Api.post("/api/v1/product/copy/paste/sub/product", {
      copyProductTreeId: copyProductTreeId,
      pasteProductTreeId: pasteProductTreeIds,
      pasteProductId: pasteProductIds,
      copyProductId: copyProdctId,
    }).then((response) => {
      console.log("sample", response);
    });
  };
  const mainProductSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
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
    const indexA = a.indexCount.toString();
    const indexB = b.indexCount.toString();

    return indexA.localeCompare(indexB, undefined, { numeric: true });
  };

  // Sort the data array using the custom sort function
  const sortedData = data.slice().sort(customSort);

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
                name: patchName ? patchName : "",
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
                      }}
                    >
                      <div style={{ display: "flex", width: "auto" }}>
                        <Tooltip placement="top" title="Import">
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
                            style={{ marginRight: "10%" }}
                          >
                            <FontAwesomeIcon
                              icon={faFileDownload}
                              style={{ width: "15" }}
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip placement="top" title="Export">
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
                              icon={faFileUpload}
                              style={{ width: "15" }}
                            />
                          </Button>
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
                            style={{ width: "15" }}
                          />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                );
              }}
            </Formik>
          </div>
          {/* <input className="mt-3" type="file" onChange={importExcel} accept=".xlsx" /> */}
          <div className="mt-3 ">
            <ThemeProvider theme={tableTheme}>
              <div className="header-container" style={{ overflowX: "auto" }}>
                <table className="material-table">
                  <thead>
                    <tr>
                      {columnsTitle.map((column, index) => (
                        <th
                          key={index}
                          className="material-table-header"
                          style={{
                            width:
                              index === 0
                                ? "150px"
                                : index === 1
                                ? "300px"
                                : index === 4 || index === 9
                                ? "150px"
                                : "auto",
                          }}
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="table-container">
                <MaterialTable
                  title=""
                  columns={columns}
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
                                      <Link>Add Child Part</Link>
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
                                  <Link>Edit</Link>
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
                                  <Link>Delete</Link>
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
                                  }}
                                >
                                  <Link>Copy</Link>
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

                                  // onClick={() => handleCopyClick(rowData)}
                                >
                                  <Link>Paste</Link>
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
                    // {
                    //   icon: () => <Button className="export-btns">Export</Button>,
                    //   tooltip: "Export to Excel",
                    //   onClick: DownloadExcel,
                    //   isFreeAction: true,
                    // },
                  ]}
                  options={{
                    actionsColumnIndex: -1,
                    addRowPosition: "last",
                    headerStyle: {
                      backgroundColor: "#cce6ff",
                      fontWeight: "bold",
                      zIndex: 0,
                    },
                    defaultExpanded: true,
                    rowStyle,
                    header: false,
                    search: false,
                  }}
                />
              </div>
            </ThemeProvider>
          </div>
        </div>
      ) : (
        <div>
          {/* <Card>
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
          </Card> */}
        </div>
      )}
    </div>
  );
}
