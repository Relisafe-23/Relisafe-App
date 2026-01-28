import React, { useEffect } from "react";
import {
  Col,
  Form,
  Row,
  Container,
  Button,
  Modal,
  Card,
} from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import Label from "../LabelComponent";
import { useState } from "react";
import MaterialTable from "material-table";
import { tableIcons } from "../PBS/TableIcons";
import { Formik, ErrorMessage, Field } from "formik";
import { customStyles } from "../core/select";
import * as Yup from "yup";
import Api from "../../Api";
// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Loader from "../core/Loader";
import { toast } from "react-toastify";

function ConnectedLibrary(props) {
  // find user id
  // scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling animation
    });
  };
  const role = localStorage.getItem("role");
  const [writePermission, setWritePermission] = useState();
  const userId = localStorage.getItem("userId");
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [customValues, setCustomValues] = useState({});
  const [destinationModuleData, setDestinationModuleData] = useState([]);
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;
  const [permission, setPermission] = useState();

  const [selectModule, setSelectModule] = useState("");
  const [selectDestinationModule, setSelectDestinationModule] = useState("");
  const [moduleFieldValue, setModuleFieldValue] = useState("");
  const [projectIds, setProjectId] = useState();
  const [connectData, setConnectData] = useState([]);
  const [valueEndErrors, setValueEndErrors] = useState([]);
  const [sourceId, setSourceId] = useState();
  const [destinationId, setDestinationId] = useState();
  const [editRowData, setEditRowData] = useState(null);
  const [moduleData, setModuleData] = useState([]);
  const [destinationData, setDestinationData] = useState([]);
  const [separateData, setSeparateData] = useState([]);
  const [separateDestinationData, setSeparateDestinationData] = useState([]);
  const [isDestinationValue, setIsDestinationValue] = useState([]);
  const token = localStorage.getItem("sessionId");
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const namesToFilter = [
    "Evident1",
    "Items",
    "condition",
    "failure",
    "redesign",
    "acceptable",
    "lubrication",
    "task",
    "combination",
    "rcmnotes",
  ];

  const getProjectPermission = () => {
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        authorizedPersonnel: userId,
        projectId: projectId,
        token: token,
      },
    })
      .then((res) => {
        const data = res?.data?.data;

        setWritePermission(data?.modules);
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
        token: token,
      },
    }).then((res) => {
      setIsOwner(res.data.data.isOwner);
      setCreatedBy(res.data.data.createdBy);
    });
  };

  const getModuleFieldDetails = (value, isDestination = false) => {
    const companyId = localStorage.getItem("companyId");
    Api.post("api/v1/library", {
      moduleName: value,
      projectId: projectId,
      companyId: companyId,
    }).then((response) => {
      const data = response?.data?.libraryData;
      if (isDestination) {
        setDestinationModuleData(data?.moduleData);
      } else {
        setModuleData(data?.moduleData);
      }
    });
  };

  const columns = [
    {
      title: "S.No",
      render: (rowData) => `${rowData?.tableData?.id + 1}`,
    },
    {
      title: "Module",
      field: "libraryId.moduleName",
    },
    {
      title: "Source",
      render: (rowData) => (
        <div>
          <strong>Name:</strong> {rowData.sourceName}
          <br />
          <strong>Value:</strong> {rowData.sourceValue}
        </div>
      ),
    },
    {
      title: "Destination Module",
      render: (rowData) => <div>{rowData.destinationModuleName}</div>,
    },

    {
      title: "Destination",
      render: (rowData) => {
        return (
          <div>
            {rowData.destinationData.map((destination, index) => (
              <div key={index}>
                <strong>{destination.destinationName}: </strong>
                {destination.destinationValue}
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  const validateSameSourceDestination = (values) => {
    const errors = {};

    // Check if source field is selected in destination
    if (values.Field && values.end && values.end.length > 0) {
      const sourceFieldName = values.Field.value;
      const hasSameField = values.end.some(
        (dest) => dest.value === sourceFieldName,
      );

      if (hasSameField) {
        toast.error("Source field cannot be selected as destination field");
        errors.end = "Source field cannot be selected as destination field";
      }
    }

    // Validate valueEnd array and check for duplicate destination values
    if (values.end && values.end.length > 0) {
      const valueEndErrors = [];
      let hasEmptyValue = false;
      let hasDuplicateDestination = false;

      values.end.forEach((selectedOption, index) => {
        const destinationField = selectedOption.value;
        const destinationValue = values.valueEnd[index];

        // Check for empty values
        if (!destinationValue || destinationValue.trim() === "") {
          valueEndErrors[index] = "Value is required";
          hasEmptyValue = true;
        }
        // Check for duplicate destination values
        else {
          valueEndErrors[index] = "";

          // Ratio fields must be < 1, others must be >= 1
          // Ratio fields must be < 1, others must be >= 1
          const ratioFields = ["endEffectRatioBeta", "failureModeRatioAlpha"];

          values.end.forEach((selectedOption, index) => {
            const val = values.valueEnd[index];

            if (!val || val.trim() === "") {
              errors.valueEnd = errors.valueEnd || [];
              errors.valueEnd[index] = "Value is required";
              return;
            }

            const numericValue = parseFloat(val);

            // if (isNaN(numericValue)) {
            //   errors.valueEnd = errors.valueEnd || [];
            //   errors.valueEnd[index] = "Value must be ah number";
            //   return;
            // }

            if (ratioFields.includes(selectedOption.value)) {
              // Must be < 1
              if (numericValue >= 1) {
                errors.valueEnd = errors.valueEnd || [];
                errors.valueEnd[index] =
                  " Destination value must be less than 1";
              }
            } else {
              // Must be ≥ 1
              if (numericValue < 1) {
                errors.valueEnd = errors.valueEnd || [];
                errors.valueEnd[index] =
                  " Destination value must be less than or equal to 1";
              }
            }
          });

          // Check if this destination value already exists for the same field
          const existingDestination = connectData.find((connection) => {
            // Check if any destination in this connection matches our field and value
            return connection.destinationData.some(
              (dest) =>
                dest.destinationName === destinationField &&
                dest.destinationValue === destinationValue &&
                // If editing, exclude the current row being edited
                (!editRowData || connection.sourceId !== editRowData.sourceId),
            );
          });

          if (existingDestination) {
            valueEndErrors[index] =
              `Destination value "${destinationValue}" already exists for ${selectedOption.label}`;
            hasDuplicateDestination = true;
          }
        }
      });

      if (hasEmptyValue) {
        errors.valueEnd = valueEndErrors;
        toast.error("Please fill all destination values");
      }

      if (hasDuplicateDestination) {
        errors.valueEnd = valueEndErrors;
        toast.error("Some destination values already exist");
      }
    }

    // Check for duplicate source value in existing connections
    if (values.Module && values.Field && values.FieldValueAndValue.value) {
      const sourceModule = values.Module.value;
      const sourceField = values.Field.value;
      const sourceValue = values.FieldValueAndValue.value;

      // Check if this source value already exists in connectData
      const existingConnection = connectData.find(
        (connection) =>
          connection.libraryId?.moduleName === sourceModule &&
          connection.sourceName === sourceField &&
          connection.sourceValue === sourceValue &&
          // If editing, exclude the current row being edited
          (!editRowData || connection.sourceId !== editRowData.sourceId),
      );

      if (existingConnection) {
        toast.error(
          `Source value "${sourceValue}" already exists for ${sourceField} in ${sourceModule}`,
        );
        errors.FieldValueAndValue = {
          value: `This source value already exists for ${sourceField}`,
        };
      }
    }

    return errors;
  };

  const validation = Yup.object().shape({
    Module: Yup.object().required("Module is required"),
    destinationModule: Yup.object().required("Destination Module is required"),
    Field: Yup.object().required("Field is required"),
    FieldValueAndValue: Yup.object().shape({
      value: Yup.string().required("Source value is required"),
    }),
    end: Yup.array()
      .min(1, "Select at least one destination")
      .required("Field is required"),
    valueEnd: Yup.array()
      .of(Yup.string().required("Destination value is required"))
      .min(1, "At least one value is required"),
  });

  //create Api
  const createConnectLibrary = (values) => {
    setIsLoading(true);
    const comId = localStorage.getItem("companyId");
    Api.post("api/v1/library/create/connect/value", {
      moduleName: values.Module.value,
      destinationModuleName: values.destinationModule.value,
      projectId: projectId,
      companyId: comId,
      sourceId: sourceId,
      sourceName: values.Field.value,
      sourceValue: values.FieldValueAndValue.value,
      destinationData: values,
    })
      .then((res) => {
        const data = res.data;
        setIsLoading(false);
        if (res.status === 201) {
          toast.success(data.message);
        } else if (res.status === 208) {
          toast.error(data.message);
        }
        getAllConnect();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 400) {
          toast.error(error?.response?.data?.message);
          setIsLoading(false);
          getAllConnect();
        }
      });
  };

  // update Api
  const updateConnectLibrary = (values, { resetForm }) => {
    const comId = localStorage.getItem("companyId");

    Api.put("api/v1/library/update/connect/value", {
      moduleName: values.Module.value,
      projectId: projectId,
      companyId: comId,
      sourceId: sourceId,
      sourceName: values.Field.label,
      sourceValue: values.FieldValueAndValue.value,
      destinationData: values,
      destinationModuleName: values.destinationModule.value,
    }).then((res) => {
      resetForm({
        Module: "",
        destinationModule: "",
        Field: "",
        Value: "",
        FieldValueAndValue: { field: "", value: "" },
        end: [],
        valueEnd: [],
        FieldValueAndValueEnd: { field: "", value: "" },
      });
      resetFormFields();
      toast.success("Updated successfully!");
      getAllConnect();
    });
  };

  const resetFormFields = () => {
    setEditRowData(null);
    setSelectModule("");
    setSelectDestinationModule("");
    setModuleData([]);
    setModuleFieldValue("");
    setSeparateData([]);
    setSeparateDestinationData([]);
    setSourceId(null);
    setDestinationId(null);
  };

  //delete-Api
  const deleteConnectLibarary = (values) => {
    setIsLoading(true);
    const sourceId = values.sourceId;
    Api.delete("api/v1/library/delete/connect/value", {
      params: {
        projectId: projectId,
        sourceId: sourceId,
      },
    })
      .then((res) => {
        setIsLoading(false);
        toast.error(`Deleted Successfully`);
        getAllConnect();
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error("Failed to delete connection. Please try again.");
        console.error("Delete error:", error);
      });
  };

  //get Api
  const getAllConnect = (values) => {
    // setIsLoading(true);
    Api.get("api/v1/library/get/all/connect/library/value", {
      params: {
        projectId: projectId,
        moduleName: values ? values : "",
      },
    }).then((res) => {
      setIsLoading(false);
      setConnectData(res.data.getData);
    });
  };
  // Add this useEffect to handle edit mode properly
  useEffect(() => {
    if (editRowData) {
      // Fetch source module data
      getModuleFieldDetails(editRowData?.libraryId?.moduleName, false);
      // Fetch destination module data
      getModuleFieldDetails(editRowData?.destinationModuleName, true);
    }
  }, [editRowData]);
  // useffect
  useEffect(() => {
    getAllConnect();
  }, []);
  useEffect(() => {
    getProjectPermission();
    projectSidebar();
  }, [projectId]);

  const getCustomValue = (value) => {
    Api.get("api/v1/library/get/separate/module/data", {
      params: {
        moduleName: selectModule,
        fieldId: value?.id?._id,
      },
    }).then((res) => {
      setSeparateData(res.data.getData);
    });
  };

  const getDestinationValue = (selectedOptions) => {
    // If it's a single option or array, handle it
    const optionsArray = Array.isArray(selectedOptions)
      ? selectedOptions
      : [selectedOptions];

    const fieldIds = optionsArray.map((option) => option.id);

    Promise.all(
      fieldIds.map((fieldId) =>
        Api.get("api/v1/library/get/separate/module/destination/data", {
          params: {
            moduleName: selectDestinationModule,
            fieldId: fieldId,
          },
        }),
      ),
    )
      .then((responses) => {
        const newDestinationData = responses.map(
          (response) => response.data.getData,
        );

        // Merge with existing data instead of replacing
        setSeparateDestinationData((prev) => {
          const merged = [...prev];
          optionsArray.forEach((option, index) => {
            const existingIndex = merged.findIndex(
              (data) => data && data[0] && data[0].sourceName === option.label,
            );

            if (existingIndex !== -1) {
              merged[existingIndex] = newDestinationData[index];
            } else {
              merged.push(newDestinationData[index]);
            }
          });
          return merged;
        });
      })
      .catch((error) => {
        console.error("Error fetching destination data:", error);
      });
  };
  const filterDestinationOptions = (selectedDestination) => {
    // Find the data for this specific destination
    const destinationData = separateDestinationData.find(
      (data) => data && data[0] && data[0].sourceName === selectedDestination,
    );

    if (!destinationData) return [];

    return destinationData.map((item) => ({
      value: item.sourceValue,
      label: item.sourceValue,
      id: item,
    }));
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div>
            <Formik
              initialValues={{
                Module: editRowData
                  ? {
                      label: editRowData?.libraryId?.moduleName,
                      value: editRowData?.libraryId?.moduleName,
                    }
                  : selectModule
                    ? {
                        label: selectModule,
                        value: selectModule,
                      }
                    : "",
                destinationModule: editRowData
                  ? {
                      label: editRowData?.destinationModuleName,
                      value: editRowData?.destinationModuleName,
                    }
                  : selectDestinationModule
                    ? {
                        label: selectDestinationModule,
                        value: selectDestinationModule,
                      }
                    : "",
                Field: editRowData
                  ? {
                      label: editRowData?.sourceName,
                      value: editRowData?.sourceName,
                    }
                  : moduleFieldValue
                    ? {
                        label: moduleFieldValue,
                        value: moduleFieldValue,
                      }
                    : "",
                Value: editRowData ? editRowData?.sourceValue : "",
                FieldValueAndValue: editRowData
                  ? {
                      field: editRowData?.sourceValue,
                      value: editRowData?.sourceValue,
                    }
                  : {
                      field: "",
                      value: "",
                    },
                end: editRowData
                  ? editRowData.destinationData.map((destination) => ({
                      value: destination.destinationName,
                      label: destination.destinationName,
                      id: destination.destinationId,
                    }))
                  : [],
                valueEnd: editRowData
                  ? editRowData.destinationData.map(
                      (destination) => destination.destinationValue,
                    )
                  : [],
                FieldValueAndValueEnd: {
                  field: "",
                  value: "",
                },
              }}
              enableReinitialize={true}
              onSubmit={(values, { resetForm }) => {
                // Run custom validation before submission
                const customErrors = validateSameSourceDestination(values);

                if (Object.keys(customErrors).length === 0) {
                  // No custom errors, proceed with submission
                  editRowData
                    ? updateConnectLibrary(values, { resetForm })
                    : createConnectLibrary(values, { resetForm });
                }
              }}
              validationSchema={validation}
              validate={validateSameSourceDestination}
            >
              {(Formik) => {
                const {
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  values,
                  resetForm,
                  touched,
                  errors,
                } = Formik;

                const handleFieldChange = (fieldName, fieldValue) => {
                  handleChange(fieldName)(fieldValue);
                  setFieldValue(`errors.${fieldName}`, "");
                };

                return (
                  <Form onSubmit={handleSubmit}>
                    <div className="connected">
                      <div className="mttr-sec mt-4 mb-2">
                        <p className=" mb-0 para-tag">Connected Library</p>
                      </div>
                      {writePermission?.[11].write === true ||
                      role === "admin" ? (
                        <Card className="mt-2 mttr-card p-4 ">
                          <Row>
                            <Col className="col-lg-4 mt-2">
                              <Label>Module</Label>
                              <Form.Group>
                                <Select
                                  value={
                                    values.Module
                                      ? {
                                          value: values.Module.value,
                                          label: values.Module.label,
                                        }
                                      : null
                                  }
                                  onChange={(e) => {
                                    setSelectModule(e.value);
                                    setFieldValue("Field", "");
                                    setFieldValue("end", []);
                                    setFieldValue("valueEnd", []);
                                    // Fetch source module data
                                    getModuleFieldDetails(e.value, false);
                                    setFieldValue("Module", {
                                      label: e.value,
                                      value: e.value,
                                    });
                                    getAllConnect(e.value);
                                  }}
                                  placeholder="Select Module"
                                  type="select"
                                  name="Module"
                                  styles={customStyles}
                                  options={[
                                    {
                                      value: "FMECA",
                                      label: "FMECA",
                                    },
                                    {
                                      value: "SAFETY",
                                      label: "SAFETY",
                                    },
                                    {
                                      value: "PMMRA",
                                      label: "PMMRA",
                                    },
                                    {
                                      value: "MTTR",
                                      label: "MTTR",
                                    },
                                  ]}
                                />
                                <ErrorMessage
                                  component="span"
                                  name="Module"
                                  className="error text-danger"
                                />
                              </Form.Group>
                            </Col>
                            <Col className="col-lg-4 mt-2">
                              <Label>Source</Label>
                              <Form.Group>
                                <Select
                                  value={
                                    values.Field
                                      ? {
                                          value: values.Field.value,
                                          label: values.Field.label,
                                        }
                                      : null
                                  }
                                  onChange={(e) => {
                                    setFieldValue("Value", "");
                                    setFieldValue("FieldValueAndValue", {
                                      field: e.value,
                                      value: "", // Initialize value to an empty string
                                    });
                                    setSourceId(e.id._id);
                                    setFieldValue("Field", {
                                      label: e.label,
                                      value: e.value,
                                    });
                                    setModuleFieldValue(e.value);
                                    getCustomValue(e);
                                  }}
                                  placeholder="Select Field"
                                  name="Field"
                                  styles={customStyles}
                                  options={
                                    selectModule && moduleData
                                      ? [
                                          {
                                            options: moduleData
                                              ?.filter(
                                                (item) =>
                                                  item.name !==
                                                  values.Field?.value,
                                              )
                                              .map((list) => ({
                                                value: list.name,
                                                label: list.key,
                                                id: list,
                                              })),
                                          },
                                        ]
                                      : []
                                  }
                                />
                                <ErrorMessage
                                  component="span"
                                  name="Field"
                                  className="error text-danger"
                                />
                              </Form.Group>
                            </Col>
                            {values?.Field ? (
                              <Col className="col-lg-4 mt-2">
                                <Label>
                                  Enter custom value for {values.Field.label}
                                  {(values.Field?.value ===
                                    "endEffectRatioBeta" ||
                                    values.Field?.value ===
                                      "failureModeRatioAlpha") &&
                                    " (must be less than 1)"}
                                </Label>
                                <Form.Group>
                                  {namesToFilter.includes(
                                    values.Field?.value,
                                  ) ? (
                                    <Select
                                      name="FieldValueAndValue"
                                      className="mt-1"
                                      placeholder={`Select value for ${values.Field.label}`}
                                      value={
                                        values.FieldValueAndValue?.value
                                          ? {
                                              label:
                                                values.FieldValueAndValue.value,
                                              value:
                                                values.FieldValueAndValue.value,
                                            }
                                          : null
                                      }
                                      options={[
                                        { label: "Yes", value: "Yes" },
                                        { label: "No", value: "No" },
                                      ]}
                                      onBlur={handleBlur}
                                      onChange={(selectedOption) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: selectedOption?.value || "",
                                        });
                                      }}
                                      styles={customStyles}
                                    />
                                  ) : values.Field?.value ===
                                      "endEffectRatioBeta" ||
                                    values.Field?.value ===
                                      "failureModeRatioAlpha" ? (
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="0.99"
                                      placeholder="Enter value between 0 and 1"
                                      value={
                                        values.FieldValueAndValue.value || ""
                                      }
                                      onChange={(e) => {
                                        const value = e.target?.value;
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: value,
                                        });
                                      }}
                                      onBlur={handleBlur}
                                      isInvalid={
                                        errors.FieldValueAndValue?.value
                                      }
                                    />
                                  ) : separateData?.length > 0 ? (
                                    <CreatableSelect
                                      value={
                                        values.FieldValueAndValue?.value
                                          ? {
                                              value:
                                                values.FieldValueAndValue.value,
                                              label:
                                                values.FieldValueAndValue.value,
                                            }
                                          : null
                                      }
                                      onChange={(selectedOption) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: selectedOption?.value || "",
                                        });
                                      }}
                                      onCreateOption={(inputValue) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: inputValue,
                                        });
                                      }}
                                      isClearable
                                      placeholder="Select or type a new value"
                                      options={separateData.map((list) => ({
                                        value: list.sourceValue,
                                        label: list.sourceValue,
                                        id: list,
                                      }))}
                                      styles={customStyles}
                                    />
                                  ) : (
                                    <Form.Control
                                      placeholder={`Enter custom value for ${values.Field.label}`}
                                      value={
                                        values.FieldValueAndValue.value || ""
                                      }
                                      onChange={(e) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: e.target?.value,
                                        });
                                      }}
                                      onBlur={handleBlur}
                                      isInvalid={
                                        errors.FieldValueAndValue?.value
                                      }
                                    />
                                  )}
                                  {errors.FieldValueAndValue?.value && (
                                    <div className="error text-danger mt-1">
                                      {errors.FieldValueAndValue.value}
                                    </div>
                                  )}
                                </Form.Group>
                              </Col>
                            ) : null}
                            <Col className="col-lg-4 mt-2">
                              <Label>Destination Module</Label>
                              <Form.Group>
                                <Select
                                  value={
                                    values.destinationModule
                                      ? {
                                          value: values.destinationModule.value,
                                          label: values.destinationModule.label,
                                        }
                                      : null
                                  }
                                  onChange={(e) => {
                                    // Store current field values before changing
                                    const currentField = values.Field;
                                    const currentFieldValue =
                                      values.FieldValueAndValue;

                                    setSelectDestinationModule(e.value);
                                    setFieldValue("destinationModule", {
                                      label: e.value,
                                      value: e.value,
                                    });

                                    // Clear destination selections
                                    setFieldValue("end", []);
                                    setFieldValue("valueEnd", []);

                                    // Fetch destination module data
                                    getModuleFieldDetails(e.value, true);

                                    // Restore source field values after a short delay
                                    setTimeout(() => {
                                      if (currentField) {
                                        setFieldValue("Field", currentField);
                                      }
                                      if (currentFieldValue) {
                                        setFieldValue(
                                          "FieldValueAndValue",
                                          currentFieldValue,
                                        );
                                      }
                                    }, 100);
                                  }}
                                  placeholder="Select Destination Module"
                                  type="select"
                                  name="destinationModule"
                                  styles={customStyles}
                                  options={[
                                    { value: "FMECA", label: "FMECA" },
                                    { value: "SAFETY", label: "SAFETY" },
                                    { value: "PMMRA", label: "PMMRA" },
                                    { value: "MTTR", label: "MTTR" },
                                  ]}
                                />
                                {errors.destinationModule &&
                                  typeof errors.destinationModule ===
                                    "string" && (
                                    <div className="error text-danger">
                                      {errors.destinationModule}
                                    </div>
                                  )}
                              </Form.Group>
                            </Col>{" "}
                            <Col className="col-lg-4 mt-2">
                              <Label>Destination</Label>
                              <Form.Group>
                                <Select
                                  isMulti
                                  value={values.end}
                                  onChange={(selectedOptions) => {
                                    // Store current values before changing
                                    const currentEnd = values.end || [];
                                    const currentValueEnd =
                                      values.valueEnd || [];

                                    // Find which options were removed
                                    const removedOptions = currentEnd.filter(
                                      (option) =>
                                        !selectedOptions.some(
                                          (sel) => sel.value === option.value,
                                        ),
                                    );

                                    // Find which options were added
                                    const addedOptions = selectedOptions.filter(
                                      (sel) =>
                                        !currentEnd.some(
                                          (option) =>
                                            option.value === sel.value,
                                        ),
                                    );

                                    // Create new valueEnd array preserving existing values
                                    const newValueEnd = selectedOptions.map(
                                      (option, index) => {
                                        // Find if this option existed before
                                        const existingIndex =
                                          currentEnd.findIndex(
                                            (opt) => opt.value === option.value,
                                          );

                                        // If it existed, keep its value
                                        if (existingIndex !== -1) {
                                          return (
                                            currentValueEnd[existingIndex] || ""
                                          );
                                        }
                                        // If it's new, start with empty
                                        return "";
                                      },
                                    );

                                    // Update both fields at once
                                    setFieldValue("end", selectedOptions);
                                    setFieldValue("valueEnd", newValueEnd);

                                    // Only fetch data for newly added options
                                    if (addedOptions.length > 0) {
                                      getDestinationValue(addedOptions);
                                    }
                                  }}
                                  placeholder="Select Field"
                                  name="end"
                                  options={
                                    destinationModuleData && values.Field
                                      ? destinationModuleData
                                          .filter(
                                            (item) =>
                                              item.name !== values.Field?.value,
                                          )
                                          .map((list) => ({
                                            value: list.name,
                                            label: list.key,
                                            id: list,
                                          }))
                                      : []
                                  }
                                />
                                {errors.end &&
                                  typeof errors.end === "string" && (
                                    <div className="error text-danger">
                                      {errors.end}
                                    </div>
                                  )}
                              </Form.Group>
                            </Col>
                            {values.end &&
                              values.end.length > 0 &&
                              values.end.map((selectedOption, index) => (
                                <Col key={index} className="col-lg-4 mt-2">
                                  <Label>
                                    Custom Value for {selectedOption.label}
                                    {(selectedOption?.value ===
                                      "endEffectRatioBeta" ||
                                      selectedOption?.value ===
                                        "failureModeRatioAlpha") &&
                                      " (must be less than 1)"}
                                  </Label>
                                  <Form.Group key={index}>
                                    {namesToFilter.includes(
                                      selectedOption.value,
                                    ) ? (
                                      <Form.Select
                                        className="mt-1"
                                        styles={customStyles}
                                        name={`valueEnd[${index}]`}
                                        type="select"
                                        aria-label={`Select value for ${selectedOption.label}`}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.valueEnd[index] || ""}
                                      >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                      </Form.Select>
                                    ) : selectedOption?.value ===
                                        "endEffectRatioBeta" ||
                                      selectedOption?.value ===
                                        "failureModeRatioAlpha" ? (
                                      <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="0.99"
                                        name={`valueEnd[${index}]`}
                                        placeholder={`Enter value between 0 and 1 for ${selectedOption.label}`}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.valueEnd[index] || ""}
                                      />
                                    ) : separateDestinationData.length > 0 ? (
                                      <CreatableSelect
                                        value={
                                          values.valueEnd[index]
                                            ? {
                                                value: values.valueEnd[index],
                                                label: values.valueEnd[index],
                                              }
                                            : null
                                        }
                                        onChange={(selected) => {
                                          const newValue =
                                            selected?.value || "";
                                          setFieldValue(
                                            `valueEnd[${index}]`,
                                            newValue,
                                          );
                                        }}
                                        onCreateOption={(inputValue) => {
                                          setFieldValue(
                                            `valueEnd[${index}]`,
                                            inputValue,
                                          );
                                        }}
                                        isClearable
                                        placeholder={`Select or type a value for ${selectedOption.label}`}
                                        options={filterDestinationOptions(
                                          selectedOption.label,
                                        )}
                                        styles={customStyles}
                                      />
                                    ) : (
                                      <Form.Control
                                        type="text"
                                        name={`valueEnd[${index}]`}
                                        placeholder={`Enter custom value for ${selectedOption.label}`}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.valueEnd?.[index] || ""}
                                        isInvalid={
                                          errors.valueEnd &&
                                          errors.valueEnd[index]
                                        }
                                      />
                                    )}
                                    <ErrorMessage
                                      component="span"
                                      name={`valueEnd[${index}]`}
                                      className="error text-danger"
                                    />
                                  </Form.Group>
                                </Col>
                              ))}
                            <div className="d-flex flex-direction-row justify-content-end  mt-4 mb-2">
                              <Button
                                className="delete-cancel-btn me-2"
                                variant="outline-secondary"
                                type="reset"
                                onClick={() => {
                                  resetForm();
                                  resetFormFields();
                                  setEditRowData(null);
                                  setModuleData([]);
                                  setSelectModule("");
                                  setEditRowData(null);
                                  setSelectModule("");
                                  setSelectDestinationModule("");
                                  setModuleData([]);
                                  setModuleFieldValue("");
                                  setSeparateData([]);
                                  setSeparateDestinationData([]);
                                  setSourceId(null);
                                  setDestinationId(null);
                                }}
                              >
                                CANCEL
                              </Button>
                              {editRowData ? (
                                <Button className="save-btn" type="submit">
                                  UPDATE
                                </Button>
                              ) : (
                                <Button className="save-btn" type="submit">
                                  CREATE
                                </Button>
                              )}
                            </div>
                          </Row>
                        </Card>
                      ) : null}
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
          <div>
            {writePermission?.[11].write === true || role === "admin" ? (
              <MaterialTable
                title="Connected Library"
                data={connectData}
                columns={columns}
                icons={tableIcons}
                style={{ marginTop: "30px" }}
                actions={[
                  (rowData) => ({
                    icon: () => (
                      <Row>
                        <Col>
                          <FontAwesomeIcon
                            icon={faEdit}
                            style={{ fontSize: "20px" }}
                            title="Edit1"
                          />
                        </Col>
                      </Row>
                    ),
                    onClick: () => {
                      setEditRowData(rowData);
                      scrollToTop();
                      setSelectModule(rowData?.libraryId?.moduleName);
                      getModuleFieldDetails(rowData?.libraryId?.moduleName);
                      setDestinationData(rowData?.destinationData);
                      setSourceId(rowData?.sourceId);
                    },
                  }),
                  (rowData) => ({
                    icon: () => (
                      <Row>
                        <Col>
                          <FontAwesomeIcon
                            title="Delete"
                            icon={faTrash}
                            style={{ color: "red", fontSize: "20px" }}
                          />
                        </Col>
                      </Row>
                    ),
                    onClick: () => {
                      deleteConnectLibarary(rowData);
                    },
                  }),
                ]}
                options={{
                  cellStyle: { border: "1px solid #eee" },
                  addRowPosition: "first",
                  actionsColumnIndex: -1,
                  headerStyle: {
                    backgroundColor: "#CCE6FF",
                    zIndex: 0,
                  },
                }}
              />
            ) : (
              <MaterialTable
                title="Connected Library"
                data={connectData}
                columns={columns}
                icons={tableIcons}
                style={{ marginTop: "30px" }}
                options={{
                  cellStyle: { border: "1px solid #eee" },
                  addRowPosition: "first",
                  actionsColumnIndex: -1,
                  headerStyle: {
                    backgroundColor: "#CCE6FF",
                    zIndex: 0,
                  },
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectedLibrary;
