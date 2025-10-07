import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row, Card, Modal } from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/MttrPrediction.scss";
import Select from "react-select";
import { ErrorMessage, Formik } from "formik";
import "../../css/FMECA.scss";
import * as Yup from "yup";
import Api from "../../Api";
import Tree from "../Tree";
import Dropdown from "../Company/Dropdown";
import Loader from "../core/Loader";
import Success from "../core/Images/success.png";
import Projectname from "../Company/projectname";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { customStyles } from "../core/select";
import { useHistory } from "react-router-dom";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import { Tooltip, TableCell } from "@material-ui/core";
import {
  faFileDownload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

function Index(props) {
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;
  // const spaPermission = props?.location?.state?.spaWrite;
  // const productId = props?.location?.props?.data?.id
  //   ? props?.location?.props?.data?.id
  //   : props?.location?.state?.productId;
  console.log("props", props.location.state);

  const treeStructureId = props?.location?.state?.parentId;
  const [name, setName] = useState();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [treeTableData, setTreeTabledata] = useState([]);
  const [spare, setSpare] = useState("");
  const [recommended, setRecommended] = useState("");
  const [warranty, setWarranty] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [succesMessage, setSuccesMessage] = useState("");
  const [prefillData, setPrefillData] = useState([]);
  const [spareId, setspareId] = useState();
  const [writePermission, setWritePermission] = useState();
  const role = localStorage.getItem("role");
  const [initialProductID, setInitialProductID] = useState();
  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : initialProductID;
  const history = useHistory();
  const userId = localStorage.getItem("userId");
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [recommendedSpareQuantity, setRecommendedSpareQuantity] = useState();
  const [calculatedSpareQuantity, setCalculatedSpareQuantity] = useState();
  //  const handleShow = () => setShow(true);
  const [tableData, setTableData] = useState();
  const [data, setData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [productName, setProductName] = useState();
  const [colDefs, setColDefs] = useState();
  const [importExcelData, setImportExcelData] = useState({});
  const [shouldReload, setShouldReload] = useState(false);

  const loginSchema = Yup.object().shape({
    spare: Yup.object().required("Spare is required"),
    warranty: Yup.object().required("Warranty is required"),
    recommended: Yup.object().required("Recommended is required"),
    deliveryTimeDays: Yup.number().required("Delivery time required"),
    annualPrice: Yup.string()
    .nullable() // allows null
    .notRequired() // not mandatory
    .matches(
      /^(100(\.0+)?|(\d{1,2}(\.\d+)?))%$/,
      "Enter a valid percentage (e.g. 25%, 50.5%, 99.99%)"
    ),
  });

  //chatGPt

  // const DownloadExcel = () => {
  //   // Assuming 'data' is an array of objects

  //   const columnsToRemove = ["indexCount"];
  //   //const columnsToShow = ["Spare","Warranty Spare"];

  //   const modifiedTableData = treeTableData.map((row) => {
  //     const newRow = { ...row };
  //     columnsToRemove.forEach((columnName) => {
  //       delete newRow[columnName];
  //     });
  //     return newRow;
  //   });

  //   const columns = Object.keys(modifiedTableData[0]).map((columnName) => ({
  //     title: columnName,
  //     field: columnName,
  //   }));

  //   const workSheet = XLSX.utils.json_to_sheet(modifiedTableData, {
  //     skipHeader: false,
  //   });
  //   const workBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workBook, workSheet, "SpareParts Data");

  //   const buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });
  //   const blob = new Blob([buf], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   const url = URL.createObjeREctURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = "SpareParts Analysis.xlsx";
  //   link.click();

  //   // Clean up
  //   URL.revokeObjectURL(url);
  // };

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
      reader.readAsBinaryString(file);
    }
  };

  const createSpareAnalysisDataFromExcel = (values) => {
    setIsLoading(true);

    const companyId = localStorage.getItem("companyId");

    Api.patch("api/v1/sparePartsAnalysis/update", {
      spare: spare,
      // recommendedSpare: reCommendedSpare,
      warrantySpare: warranty,
      deliveryTimeDays: values.deliveryTimeDays,
      afterSerialProductionPrice1: values.afterSerialProductionPrice1,
      price1MOQ: values.moq_1Price,
      afterSerialProductionPrice2: values.afterSerialProductionPrice2,
      price2MOQ: values.moq_2Price,
      afterSerialProductionPrice3: values.afterSerialProductionPrice3,
      price3MOQ: values.moq_3Price,
      annualPriceEscalationPercentage: values.annualPrice,
      lccPriceValidity: values.lccPriceValidity,
      recommendedSpareQuantity: values.recommendedSpareQuantity,
      calculatedSpareQuantity: values.calculatedSpareQuantity,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      spareId: spareId,
      userId: userId,
    }).then((response) => {
      setIsLoading(false);
      const status = response?.status;
      if (status === 204) {
        //setFailureModeRatioError(true);
      }
      //getProductData();
      setIsLoading(false);
    });
  };

  const convertToJson = (headers, originalData) => {
    const rows = [];
    originalData.forEach((row) => {
      let rowData = {};
      row.forEach((element, index) => {
        rowData[headers[index]] = element;
      });
      rows.push(rowData);
      createSpareAnalysisDataFromExcel(rowData);
    });
  };

  const exportToExcel = (value) => {
    const originalData = {
         CompanyName:treeTableData[0]?.companyId?.companyName,
      ProjectName: treeTableData[0]?.projectId?.projectName,
      productName: value.productName,
      Delivery_Days: value.deliveryTimeDays,
      Serial_Production_Price1: value.afterSerialProductionPrice1,
      Moq_Price_1: value.moq_1Price,
      Moq_Price_3: value.moq_3Price,
      Serial_Production_Price3: value.afterSerialProductionPrice3,
      Serial_Production_Price2: value.afterSerialProductionPrice2,
      Annual_Price: value.annualPrice,
      Moq_Price_2: value.moq_2Price,
      Lcc_Price_Validity: value.lccPriceValidity,
      Recomm_Spare_Quantity: value.recommendedSpareQuantity,
      Calc_Spare_Qty: value.calculatedSpareQuantity,
      warranty: value.warranty?.value || value.warranty || "",
      Spare: value.spare?.value || value.spare || "",
      Recommended_spare: value.recommended?.value || value.recommended || "",
    };

    // if (originalData.length > 1) working
    // if (originalData[1].length > 0)
    // {
    // const hasData = Object.values(originalData).some((value) => !!value);
    const hasData = Object.values(originalData).some(
      (val) => val !== null && val !== undefined && val.toString().trim() !== ""
    );

    if (hasData) {
      const dataArray = [];
      dataArray.push(originalData);
      const ws = XLSX?.utils?.json_to_sheet(dataArray);
      const wb = XLSX.utils?.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "FormData");

      // Generate Excel file and download
      XLSX.writeFile(wb, `${productName}_Spare_Parts_Input.xlsx`);
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

  useEffect(() => {
    getTreedata();
    productTreeData();
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
  const showModal = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
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
  const productTreeData = () => {
    Api.get("/api/v1/productTreeStructure/get/tree/product/list", {
      params: {
        projectId: projectId,
        treeStructureId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setProductName(data.productName);
        setIsLoading(false);
        // setCategory(data?.type ? { label: data?.type, value: data?.type } : "");
        // setQuantity(data?.quantity);
        // setReference(data?.reference);
        // setName(data?.productName);
        // setPartNumber(data?.partNumber);
        // setEnvironment(data?.environment ? { label: data?.environment, value: data?.environment } : "");
        // setTemperature(data?.temperature);
        // setPartType(data?.partType ? { label: data?.partType, value: data?.partType } : "");
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
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
        const treeStructureId = res?.data?.data[0]?.id;
        setIsLoading(false);
        setTreeTabledata(treeData);
        setInitialProductID(res?.data?.data[0]?.treeStructure?.id);
        getProductDatas(treeStructureId);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  // const treeTableData = [
  //   { "#": 1, "First Name": "Mark", "Last Name": "Otto", Username: "@mdo" },
  //   { "#": 2, "First Name": "Jacob", "Last Name": "Thornton", Username: "@fat" },
  //   { "#": 3, "First Name": "Larry the Bird", Username: "@twitter" },
  // ];

  // const treeTableData [
  //   name: "",
  //   age: "",
  //   email: "",
  //   // Add more fields as needed
  // ];

  // const treeTableData [
  //   spare:"",
  //     recommendedSpare: "",
  //       warrantySpare: "",
  //       deliveryTimeDays: "",
  //       afterSerialProductionPrice1:""<

  // ];

  const getProductDatas = (treeId) => {
    const companyId = localStorage.getItem("companyId");
    console.log(" treeStructureId", treeStructureId);
    console.log("treeId", treeId);

    Api.get("/api/v1/sparePartsAnalysis/details", {
      params: {
        projectId: projectId,
        productId: productId,
        companyId: companyId,
        treeStructureId: treeStructureId ? treeStructureId : treeId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;

        setRecommendedSpareQuantity(
          data?.recommendedSpareQuantity ? data?.recommendedSpareQuantity : ""
        );
        setCalculatedSpareQuantity(
          res?.data?.CalculatedSpareQuantity
            ? res?.data?.CalculatedSpareQuantity
            : ""
        );
        setPrefillData(data ? data : "");
        setspareId(data?.id);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const SparePartsAnalysisUpdate = (values, { resetForm }) => {
    const companyId = localStorage.getItem("companyId");
    const reCommendedSpare = values?.recommended?.value;
    const spare = values?.spare?.value;
    const warranty = values?.warranty?.value;
    Api.patch("api/v1/sparePartsAnalysis/update", {
      spare: spare,
      recommendedSpare: reCommendedSpare,
      warrantySpare: warranty,
      deliveryTimeDays: values.deliveryTimeDays,
      afterSerialProductionPrice1: values.afterSerialProductionPrice1,
      price1MOQ: values.moq_1Price,
      afterSerialProductionPrice2: values.afterSerialProductionPrice2,
      price2MOQ: values.moq_2Price,
      afterSerialProductionPrice3: values.afterSerialProductionPrice3,
      price3MOQ: values.moq_3Price,
      annualPriceEscalationPercentage: values.annualPrice,
      lccPriceValidity: values.lccPriceValidity,
      recommendedSpareQuantity: values.recommendedSpareQuantity,
      calculatedSpareQuantity: values.calculatedSpareQuantity,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      spareId: spareId,
      userId: userId,
    })
      .then((res) => {
        getProductDatas();
        const data = res?.data?.editDetail;
        setPrefillData(data);
        setspareId(data?.id);
        setSuccesMessage(res?.data?.message);
        // showModal();
        toast.success("Updated Successfully");
        // window.location.reload();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const submitForm = (values, { resetForm }) => {
    const companyId = localStorage.getItem("companyId");
    const reCommendedSpare = values?.recommended?.value;
    const spare = values?.spare?.value;
    const warranty = values?.warranty?.value;
    Api.post("api/v1/sparePartsAnalysis", {
      companyId: companyId,
      projectId: projectId,
      productId: productId,
      spare: spare,
      recommendedSpare: reCommendedSpare,
      warrantySpare: warranty,
      deliveryTimeDays: values.deliveryTimeDays,
      afterSerialProductionPrice1: values.afterSerialProductionPrice1,
      afterSerialProductionPrice2: values.afterSerialProductionPrice2,
      afterSerialProductionPrice3: values.afterSerialProductionPrice3,
      price1MOQ: values.moq_1Price,
      price2MOQ: values.moq_2Price,
      price3MOQ: values.moq_3Price,
      annualPriceEscalationPercentage: values.annualPrice,
      lccPriceValidity: values.lccPriceValidity,
      recommendedSpareQuantity: values.recommendedSpareQuantity,
      calculatedSpareQuantity: values.calculatedSpareQuantity,
      userId: userId,
    })
      .then((response) => {
        getProductDatas();
        setSuccesMessage(response?.data?.message);
        showModal();
        setPrefillData(response?.data?.data?.createData);
        setspareId(response?.data?.data?.createData?.id);
        window.location.reload();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const NextPage = () => {
    setShow(!show);
    setOpen(false);
  };

  {console.log(prefillData,"prefillData")}

  return (
    <div className=" mx-4" style={{ marginTop: "90px" }}>
      {isLoading ? (
        <Loader />
      ) : (
        <Formik
          enableReinitialize={true}
          initialValues={{
            productName:productName,
            spare: prefillData?.spare
              ? { label: prefillData?.spare, value: prefillData?.spare }
              : "",
            warranty: prefillData?.warrantySpare
              ? {
                label: prefillData?.warrantySpare,
                value: prefillData?.warrantySpare,
              }
              : "",
            recommended: prefillData?.recommendedSpare
              ? {
                label: prefillData?.recommendedSpare,
                value: prefillData?.recommendedSpare,
              }
              : "",
            deliveryTimeDays: prefillData?.deliveryTimeDays
              ? prefillData?.deliveryTimeDays
              : importExcelData?.Delivery_Days
                ? importExcelData?.Delivery_Days
                : "",

            lccPriceValidity: prefillData?.lccPriceValidity
              ? prefillData?.lccPriceValidity
              : importExcelData?.Lcc_Price_Validity
                ? importExcelData?.Lcc_Price_Validity
                : "",
            afterSerialProductionPrice1:
              prefillData?.afterSerialProductionPrice1
                ? prefillData?.afterSerialProductionPrice1
                : importExcelData?.Serial_Production_Price1
                  ? importExcelData?.Serial_Production_Price1
                  : "",
            afterSerialProductionPrice2:
              prefillData?.afterSerialProductionPrice2
                ? prefillData?.afterSerialProductionPrice2
                : importExcelData?.Serial_Production_Price2
                  ? importExcelData?.Serial_Production_Price2
                  : "",
            afterSerialProductionPrice3:
              prefillData?.afterSerialProductionPrice3
                ? prefillData?.afterSerialProductionPrice3
                : importExcelData?.Serial_Production_Price3
                  ? importExcelData?.Serial_Production_Price3
                  : "",
            moq_1Price: prefillData?.price1MOQ
              ? prefillData?.price1MOQ
              : importExcelData?.Moq_Price_1
                ? importExcelData?.Moq_Price_1
                : "",
            moq_2Price: prefillData?.price2MOQ
              ? prefillData?.price2MOQ
              : importExcelData?.Moq_Price_2
                ? importExcelData?.Moq_Price_2
                : "",
            moq_3Price: prefillData?.price3MOQ
              ? prefillData?.price3MOQ
              : importExcelData?.Moq_Price_3
                ? importExcelData?.Moq_Price_3
                : "",
            annualPrice: prefillData?.annualPriceEscalationPercentage
              ? prefillData?.annualPriceEscalationPercentage
              : importExcelData?.Annual_Price
                ? importExcelData?.Annual_Price
                : "",
            calculatedSpareQuantity: calculatedSpareQuantity
              ? calculatedSpareQuantity
              : importExcelData?.Calc_Spare_Qty
                ? importExcelData?.Calc_Spare_Qty
                : "",
            recommendedSpareQuantity: recommendedSpareQuantity
              ? recommendedSpareQuantity
              : importExcelData?.Recomm_Spare_Quantity
                ? importExcelData?.Recomm_Spare_Quantity
                : "",
          }}
          validationSchema={loginSchema}
          onSubmit={(values, { resetForm }) =>
            spareId
              ? SparePartsAnalysisUpdate(values, { resetForm })
              : submitForm(values, { resetForm })
          }
        >
          {(formik) => {
            const {
              values,
              handleChange,
              handleSubmit,
              handleBlur,
              isValid,
              submitForm,
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
                          <label
                            className="import-export-btn"
                            onClick={() => exportToExcel(values)}
                          >
                            <FontAwesomeIcon
                              icon={faFileUpload}
                              style={{ width: "15px" }}
                            />
                          </label>
                        </Tooltip>
                      </div>
                    </div>

                    <Row className="d-flex mt-2">
            
                      <div className="mttr-sec">
                        <p className=" mb-0 para-tag">Spare Parts Analysis</p>
                      </div>
                      <Card className="mt-2 p-4 mttr-card">
                        <Row>
                          <Col>
                            <Form.Group>
                              <Label notify={true}>Spare?</Label>
                              <Select
                                className="mt-1"
                                styles={customStyles}
                                name="spare"
                                type="select"
                                value={values.spare}
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
                                  setFieldValue("spare", e);
                                }}
                                options={[
                                  {
                                    value: "Yes",
                                    label: "Yes",
                                  },
                                  {
                                    value: "No",
                                    label: "No",
                                  },
                                ]}
                              />

                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="spare"
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group>
                              <Label notify={true}>Warranty Spare?</Label>
                              <Select
                                className="mt-1"
                                name="warranty"
                                styles={customStyles}
                                type="select"
                                isDisabled={
                                  writePermission === true ||
                                    writePermission === "undefined" ||
                                    role === "admin" ||
                                    (isOwner === true && createdBy === userId)
                                    ? null
                                    : "disabled"
                                }
                                value={values.warranty}
                                onBlur={handleBlur}
                                onChange={(e) => {
                                  setFieldValue("warranty", e);
                                }}
                                options={[
                                  {
                                    value: "Yes",
                                    label: "Yes",
                                  },
                                  {
                                    value: "No",
                                    label: "No",
                                  },
                                ]}
                              />

                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="warranty"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label notify={true}>Recommended Spare?</Label>
                              <Select
                                className="mt-1"
                                name="recommended"
                                styles={customStyles}
                                type="select"
                                isDisabled={
                                  writePermission === true ||
                                    writePermission === "undefined" ||
                                    role === "admin" ||
                                    (isOwner === true && createdBy === userId)
                                    ? null
                                    : "disabled"
                                }
                                value={values.recommended}
                                onBlur={handleBlur}
                                onChange={(e) => {
                                  setFieldValue("recommended", e);
                                }}
                                options={[
                                  {
                                    value: "Yes",
                                    label: "Yes",
                                  },
                                  {
                                    value: "No",
                                    label: "No",
                                  },
                                ]}
                              />

                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="recommended"
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            {" "}
                            <Form.Group className="mt-3">
                              <Label notify="true">Delivery time Days</Label>
                              <Form.Control
                                className="mt-1"
                                name="deliveryTimeDays"
                                type="Number"
                                min="0"
                                step="any"
                                value={values.deliveryTimeDays}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />

                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="deliveryTimeDays"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card>
                      <div className="mttr-sec mt-4">
                        <p className=" mb-0 para-tag">
                          Serial Production Price
                        </p>
                      </div>
                      <Card className="mt-2 p-4 mttr-card">
                        <Row>
                          <Col>
                            <Form.Group>
                              <Label>After serial production price 1</Label>
                              <Form.Control
                                className="mt-1 "
                                name="afterSerialProductionPrice1"
                                type="number"
                                value={values.afterSerialProductionPrice1}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group>
                              <Label>After serial production price 3</Label>
                              <Form.Control
                                className="mt-1 "
                                name="afterSerialProductionPrice3"
                                type="number"
                                value={values.afterSerialProductionPrice3}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>{" "}
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Price1 MOQ</Label>
                              <Form.Control
                                className="mt-1 "
                                name="moq_1Price"
                                type="number"
                                value={values.moq_1Price}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Price3 MOQ</Label>
                              <Form.Control
                                className="mt-1 "
                                name="moq_3Price"
                                type="number"
                                value={values.moq_3Price}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>{" "}
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>After serial production price 2</Label>
                              <Form.Control
                                className="mt-1 "
                                name="afterSerialProductionPrice2"
                                type="number"
                                value={values.afterSerialProductionPrice2}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Annual price escalation percentage</Label>
                              <Form.Control
                                className="mt-1  "
                                name="annualPrice"
                                type="text"
                                value={values.annualPrice}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="annualPrice"
                              />
                            </Form.Group>
                          </Col>
                        </Row>{" "}
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Price2 MOQ</Label>
                              <Form.Control
                                className="mt-1 "
                                name="moq_2Price"
                                type="number"
                                value={values.moq_2Price}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>LCC - Price validity to be included</Label>
                              <Form.Control
                                className="mt-1  "
                                name="lccPriceValidity"
                                type="text"
                                value={values.lccPriceValidity}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Recommended Spare Quantity</Label>
                              <Form.Control
                                className="mt-1 "
                                name="recommendedSpareQuantity"
                                type="number"
                                min="0"
                                step="any"
                                value={values.recommendedSpareQuantity}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Calculated Spare Quantity</Label>
                              <Form.Control
                                className="mt-1 "
                                name="calculatedSpareQuantity"
                                type="number"
                                min="0"
                                step="any"
                                value={values.calculatedSpareQuantity}
                                onBlur={handleBlur}
                                disabled={true}
                              // onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card>
                      <div className="d-flex flex-direction-row justify-content-end  mt-4 mb-5">
                        <Button
                          className="delete-cancel-btn me-2"
                          variant="outline-secondary"
                          type="reset"
                          // onClick={() => {
                          //   formik.resetForm();
                          //   setOpen(false);
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
                        <div>
                          <Modal
                            show={show}
                            centered
                            onHide={() => setShow(!show)}
                          >
                            <div className="d-flex justify-content-center mt-5">
                              <div>
                                <FontAwesomeIcon
                                  icon={faCircleCheck}
                                  fontSize={"40px"}
                                  color="#1D5460"
                                />
                              </div>
                            </div>
                            <Modal.Footer className=" d-flex justify-content-center success-message  mt-3 mb-5">
                              <div>
                                <h4>
                                  {succesMessage ? succesMessage : "Error"}
                                </h4>
                              </div>
                            </Modal.Footer>
                          </Modal>
                        </div>
                      </div>

                      {/* <Col xs={12} sm={3}>
                        <div className="mttr-sec ">
                          <p className=" mb-0 para-tag">Tree</p>
                        </div>

                        <div className="row mt-3">
                          <div className="col ">
                            <Tree data={treeTableData} />
                          </div>
                        </div>
                      </Col> */}
                    </Row>
                  </fieldset>
                </Form>
              </div>
            );
          }}
        </Formik>
      )}
    </div>
  );
}

export default Index;
