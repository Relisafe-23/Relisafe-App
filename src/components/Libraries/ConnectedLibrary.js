/* eslint-disable no-unused-vars */
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

  const getModuleFieldDetails = (value) => {
    const companyId = localStorage.getItem("companyId");
    Api.post("api/v1/library", {
      moduleName: value,
      projectId: projectId,
      companyId: companyId,
    }).then((response) => {
      console.log("response", response.data.libraryData.moduleName)
      const data = response?.data?.libraryData;
      setModuleData(data?.moduleData);
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
      render: (rowData) => (

        <div>
          {rowData.destinationModuleName}
        </div>
      ),
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
  const validation = Yup.object().shape({
    Module: Yup.object().required("Module is required"),
    Field: Yup.object().required("Field is required"),
    Value: Yup.string().required("Field is required"),
    end: Yup.array()
      .min(1, "Select at least one destination")
      .required("Field is required"),
    valueEnd: Yup.array().min(1, "At least one value is required"),
  });
  const validateValueEnd = (end, valueEnd) => {
    if (end && end.length > 0) {
      return end.every((_, index) => {
        const value = valueEnd[index];
        return typeof value === "string" && value.trim() !== "";
      });
    }
    // If 'end' is present but 'valueEnd' is empty, return false to indicate validation failure
    return false;
  };

  // reset the form

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
  const updateConnectLibrary = (values,{resetForm}) => {
    console.log("values.....", values.destinationModule.value);
    const comId = localStorage.getItem("companyId");

    Api.put("api/v1/library/update/connect/value", {
      moduleName: values.Module.value,
      projectId: projectId,
      companyId: comId,
      sourceId: sourceId,
      sourceName: values.Field.label,
      sourceValue:  values.FieldValueAndValue.value,
      destinationData: values,
      destinationModuleName: values.destinationModule.value,
    }).then((res) => {
      console.log("res",res)
      console.log("values",values)
      // window.location.reload();
      // setIsLoading(false);
         resetForm({
          Module: "",
          destinationModule: "",
          Field: "",
          Value: "",
          FieldValueAndValue: { field: "", value: "" },
          end: [],
          valueEnd: [],
          FieldValueAndValueEnd: { field: "", value: "" }
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
    console.log(values)
    setIsLoading(true);
    const sourceId = values.sourceId;
    Api.delete("api/v1/library/delete/connect/value", {
      params: {
        projectId: projectId,
        sourceId: sourceId,
      },
    }).then((res) => {
      setIsLoading(false);
      getAllConnect();
    });
  };
  //get Api
  const getAllConnect = (values) => {
    // setIsLoading(true);
    Api.get("api/v1/library/get/all/connect/value", {
      params: {
        projectId: projectId,
        moduleName: values ? values : "",
      },
    }).then((res) => {

      setIsLoading(false);
      setConnectData(res.data.getData);
    });
  };
  // useffect
  useEffect(() => {
    getAllConnect();
  }, []);
  useEffect(() => {
    getProjectPermission();
    projectSidebar();
  }, [projectId]);

  console.log("@@@@sdd")
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
    const fieldIds = selectedOptions.map((option) => option.id);
    Promise.all(
      fieldIds.map((fieldId) =>
        Api.get("api/v1/library/get/separate/module/destination/data", {
          params: {
            moduleName: selectModule,
            fieldId: fieldId,
          },
        })
      )
    )
      .then((responses) => {
        console.log("response", responses)
        const destinationData = responses.map(
          (response) => response.data.getData
        );
        setSeparateDestinationData(destinationData);
      })
      .catch((error) => {
        console.error("Error fetching destination data:", error);
        // Handle error, e.g., show error message to user
      });
  };

  const filterDestinationOptions = (selectedDestination) => {
    const filteredOptions = separateDestinationData
      .flatMap((destination) => destination)
      .filter((destination) => {
        return destination.sourceName === selectedDestination;
      });
    return filteredOptions.map((destination) => ({
      value: destination.sourceValue,
      label: destination.sourceValue,
      id: destination,
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
                    (destination) => destination.destinationValue
                  )
                  : [],
                FieldValueAndValueEnd: {
                  field: "",
                  value: "",
                },
              }}
              enableReinitialize={true}
              onSubmit={(values, { resetForm }) => {
                if (validateValueEnd(values.end, values.valueEnd)) {
                  // Custom validation passed, proceed with submission
                  editRowData
                    ? updateConnectLibrary(values,{resetForm})
                    : createConnectLibrary(values, { resetForm });
                }
              }}
            //validationSchema={validation}
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
                } = Formik;
                const handleFieldChange = (fieldName, fieldValue) => {
                  handleChange(fieldName)(fieldValue);
                  setFieldValue(`errors.${fieldName}`, ""); // Reset the error
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
                                    setModuleData([]);
                                    getModuleFieldDetails(e.value);
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
                                    selectModule
                                      ? [
                                        {
                                          options: moduleData
                                            ?.filter(
                                              (item) =>
                                                item.key !== "Failure Mode Ratio Alpha" &&
                                                item.name !== "failureModeRatioAlpha"
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
                            {values.Field ? (
                              <Col className="col-lg-4 mt-2">
                                <Label>
                                  Enter custom value for {values.Field.label}
                                </Label>
                                {/* {console.log("values...", values)} */}
                                <Form.Group>
                                  {namesToFilter.includes(
                                    values.Field.value
                                  ) ? (
                                    <Select
                                      name={values.Field.value}
                                      className="mt-1"
                                      placeholder={`Select value for ${values.Field.label}`}
                                      value={values?.FieldValueAndValue.value ?
                                        { label: values.FieldValueAndValue.value, value: values.FieldValueAndValue.value, } : null}
                                      options={[
                                        { label: "Yes", value: "Yes" },
                                        { label: "No", value: "No" },
                                      ]}
                                      onBlur={handleBlur}
                                      onChange={(selectedOption) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: selectedOption.value,
                                        });
                                      }}
                                    />
                                  ) : separateData?.length > 0 ? (
                                    <CreatableSelect
                                      value={
                                        values.FieldValueAndValue.value !== ""
                                          ? {
                                            value:
                                              values.FieldValueAndValue.value,
                                            label:
                                              values.FieldValueAndValue.value,
                                          }
                                          : null
                                      }
                                      onChange={(
                                        selectedOption,
                                        actionMeta
                                      ) => {
                                        if (
                                          actionMeta.action === "create-option"
                                        ) {
                                          // Handle creating a new option
                                          setFieldValue("FieldValueAndValue", {
                                            field: values.Field.value,
                                            value: selectedOption.value,
                                          });
                                        } else if (
                                          actionMeta.action === "select-option"
                                        ) {
                                          // Handle selecting an existing option
                                          setFieldValue("FieldValueAndValue", {
                                            field: values.Field.value,
                                            value: selectedOption.value,
                                          });
                                        }
                                      }}
                                      onCreateOption={(inputValue) => {
                                        // This will be called when a new option is created
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: inputValue,
                                        });
                                      }}
                                      placeholder="Select or type a new value"
                                      name="Module"
                                      options={separateData.map((list) => ({
                                        value: list.sourceValue,
                                        label: list.sourceValue,
                                        id: list,
                                      }))}
                                    />
                                  ) : (
                                    <Form.Control
                                      placeholder={`Enter custom value for ${values.Field.label}`}
                                      value={values.FieldValueAndValue.value}
                                      onChange={(e) => {
                                        setFieldValue("FieldValueAndValue", {
                                          field: values.Field.value,
                                          value: e.target.value,
                                        });
                                      }}
                                      onBlur={handleBlur}
                                      name="Value"
                                    />
                                  )}
                                  <ErrorMessage
                                    component="span"
                                    name="FieldValueAndValue"
                                    className="error text-danger"
                                  />
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
                                    setSelectDestinationModule(e.value);
                                    setFieldValue("Field", "");
                                    setFieldValue("end", []);
                                    setModuleData([]);
                                    getModuleFieldDetails(e.value);
                                    setFieldValue("destinationModule", {
                                      label: e.value,
                                      value: e.value,
                                    });
                                    getAllConnect(e.value);
                                  }}
                                  placeholder="Select Destination Module"
                                  type="select"
                                  name="destinationModule"
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
                                  name="destinationModule"
                                  className="error text-danger"
                                />
                              </Form.Group>
                            </Col>

                            <Col className="col-lg-4 mt-2">
                              <Label>Destination</Label>
                              <Form.Group>
                                <Select
                                  isMulti
                                  value={values.end}
                                  onChange={(selectedOptions) => {
                                    setFieldValue("end", selectedOptions);
                                    getDestinationValue(selectedOptions);
                                  }}
                                  placeholder="Select Field"
                                  name="end"
                                  options={

                                    moduleData
                                      ?.filter(
                                        (item) =>
                                          item.key !== "Failure Mode Ratio Alpha" &&
                                          item.name !== "failureModeRatioAlpha"
                                      )
                                      .map((list) => ({
                                        value: list.name,
                                        label: list.key,
                                        id: list,
                                      }))

                                    // moduleData
                                    //   ?.filter((list) => {
                                    //     return list.name !== values.Field.label;
                                    //   })
                                    //   .map((list) => ({
                                    //     value: list.name,
                                    //     label: list.key,
                                    //     id: list._id,
                                    //   }))
                                  }
                                />
                                <ErrorMessage
                                  component="span"
                                  name="end"
                                  className="error text-danger"
                                />
                              </Form.Group>
                            </Col>
                            {values.end &&
                              values.end.length > 0 &&
                              values.end.map((selectedOption, index) => (
                                <Col key={index} className="col-lg-4 mt-2">
                                  <Label>
                                    Custom Value for {selectedOption.label}
                                  </Label>
                                  <Form.Group key={index}>
                                    {namesToFilter.includes(
                                      selectedOption.value
                                    ) ? (
                                      <Form.Select
                                        className="mt-1"
                                        styles={customStyles}
                                        name={`valueEnd[${index}]`}
                                        type="select"
                                        aria-label={`Select value for ${selectedOption
                                          ? selectedOption.label
                                          : ""
                                          }`}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.valueEnd[index] || ""}
                                      >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                      </Form.Select>
                                    ) : separateDestinationData &&
                                      separateDestinationData[index]?.length >
                                      0 ? (
                                      <CreatableSelect
                                        onChange={(selectedOption) => {
                                          if (selectedOption.__isNew__) {
                                            const newOptionValue =
                                              selectedOption.value;
                                            setFieldValue(
                                              `valueEnd[${index}]`,
                                              newOptionValue
                                            );
                                          } else {
                                            const existingOptionValue =
                                              selectedOption.value;
                                            setFieldValue(
                                              `valueEnd[${index}]`,
                                              existingOptionValue
                                            );
                                          }
                                        }}
                                        placeholder="Select Module"
                                        type="select"
                                        name="Module"
                                        styles={customStyles}
                                        options={filterDestinationOptions(
                                          selectedOption.label
                                        )}
                                      />
                                    ) : (
                                      <Form.Control
                                        type="text"
                                        name={`valueEnd[${index}]`}
                                        placeholder={`Enter custom value for ${selectedOption.label}`}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.valueEnd[index] || ""}
                                      />
                                    )}
                                    {/* <ErrorMessage
                                      component="span"
                                      name={`FieldValueAndValueEnd${index}`}
                                      className="error text-danger"
                                    /> */}
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
                                <Button className="save-btn" type="submit" >
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
