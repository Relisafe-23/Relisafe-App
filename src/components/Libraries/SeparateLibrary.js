/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Col, Form, Row, Container, Button, Modal, Card, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdjust, faEdit, faEllipsisV, faEye, faEyeSlash, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Select from "react-select";
import Label from "../LabelComponent";
import MaterialTable from "material-table";
import { tableIcons } from "../PBS/TableIcons";
import { Formik, ErrorMessage } from "formik";
import { customStyles } from "../core/select";
import * as Yup from "yup";
import Api from "../../Api";
import Loader from "../core/Loader";
import { toast } from "react-toastify";
import {useHistory } from "react-router-dom";

function SeparateLibrary(props) {
  const [projectId, setProjectId] = useState(props?.location?.state?.projectId);
  const [editingData, setEditingData] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [selectModule, setSelectModule] = useState("");
  const [selectModuleFieldValue, setSelectModuleFieldVlue] = useState("");
  const [fieldvalue, setFieldValue] = useState("");
  const [moduleData, setModuleData] = useState([]);
  const [libraryFieldId, setLibraryFieldId] = useState();
  const [libraryId, setLibraryId] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [allSepareteData, setAllSepareteData] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [name, setName] = useState();
  const [editname, setEditName] = useState();
  const [editData, setEditData] = useState({});
  const [companyId, setCompanyId] = useState();
  const [selectedModule, setSelectedModule] = useState("");
  const [writePermission, setWritePermission] = useState();
  const [readPermission, setReadPermission] = useState();
  const history = useHistory();

  const role = localStorage.getItem("role");  
  const userId = localStorage.getItem("userId");
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const token = localStorage.getItem("sessionId");
  
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  // Check if user has write permission
  const hasWriteAccess = () => {
    if (role === "admin" || role === "SuperAdmin") return true;
    if (isOwner === true && createdBy === userId) return true;
    return writePermission?.[10]?.write === true;
  };

  // Check if user has read permission
  const hasReadAccess = () => {
    if (role === "admin" || role === "SuperAdmin") return true;
    if (isOwner === true && createdBy === userId) return true;
    return readPermission?.[10]?.read === true;
  };

  const handleDropdownChange = (event) => {
    setSelectedValue();
  };
  
  const handleAlert = () => {
    setEditModalOpen(false);
    alert("Changes saved successfully");
  };

  const validation = Yup.object().shape({
    Module: Yup.object().required("Module is required"),
    Field: Yup.object().required("Field is required"),
    Value: Yup.string().required("Value is required"),
  });
  
  const editValidation = Yup.object().shape({
    Module: Yup.string().required("Module is required"),
    Field: Yup.string().required("Field is required"),
    Value: Yup.string().required("Value is required"),
  });

  const columns = [
    {
      title: "S.No",
      render: (rowData) => `${rowData?.tableData?.id + 1}`,
    },
    {
      title: "Module",
      field: "moduleName",
    },
    {
      title: "Fields",
      field: "sourceName",
      render: (rowData) => rowData?.sourceName?.charAt(0).toUpperCase() + rowData?.sourceName?.slice(1),
    },
    {
      title: "Value",
      field: "sourceValue",
    },
  ];

  useEffect(() => {
    getAllSeprateLibraryData();
  }, []);

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
  }, [projectId]);

  const getAllSeprateLibraryData = async () => {
    const companyId = localStorage.getItem("companyId");
    setIsLoading(true);
    setCompanyId(companyId);
    Api.get("api/v1/library/get/all/separate/value", {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      setIsLoading(false);
      setAllSepareteData(res.data.data);
    });
  };
  
  const getModuleFieldDetails = (value) => {
    Api.post("api/v1/library", {
      moduleName: value,
      projectId: projectId,
      companyId: companyId,
    }).then((response) => {
      const data = response.data.libraryData.moduleData;
      const namesToFilter = ["Evident1", "Items","condition","failure","redesign",
      "acceptable","lubrication","task","combination","rcmnotes"];
      
      const filteredData = data.filter(item => !namesToFilter.includes(item.name));
      setSelectedModule(value);
      setLibraryId(data.id);
      setModuleData(filteredData);
    });
  };

  const handleReset = (resetForm) => {
    resetForm();
  };

  const submitFormValue = (values) => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to create library values");
      return;
    }
    
    setIsLoading(true);
    Api.post("api/v1/library/create/separate/value", {
      moduleName: values.Module.label,
      projectId: projectId,
      companyId: companyId,
      libraryId: libraryId,
      sourceId: libraryFieldId,
      sourceValue: values.Value,
    }).then((res) => {
      setIsLoading(false);
      const data = res.data;
      if (res.status === 201) {
        toast.success(data.message);
      } else if (res.status === 208) {
        toast.error(data.message);
      }
      getAllSeprateLibraryData();
    });
  };

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
        const modules = data?.modules || [];
        setWritePermission(modules);
        setReadPermission(modules);
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

  const updateFormValue = (values) => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to update library values");
      return;
    }
    
    const rowId = editData?.id;
    Api.put(`api/v1/library/separate/value/${rowId}`, {
      moduleName: values.Module.label,
      projectId: projectId,
      companyId: companyId,
      libraryId: libraryId,
      sourceId: libraryFieldId,
      sourceName: values.Field,
      sourceValue: values.Value,
    }).then((res) => {
      setEditModalOpen(false);
      if (res.status === 201) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
      setIsLoading(false);
      getAllSeprateLibraryData();
    });
  };
  
  const deleteSepLib = () => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to delete library values");
      return;
    }
    
    setIsLoading(true);
    const rowId = name?.id;
    Api.delete(`api/v1/library/separate/value/${rowId}`).then((res) => {
      setIsLoading(false);
      setDeleteModalOpen(false);
      toast.error(`Deleted Successfully`);
      getAllSeprateLibraryData();
    });
  };
  
  const deleteShow = (values) => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to delete library values");
      return;
    }
    setName(values);
    setDeleteModalOpen(true);
  };
  
  const editShow = (values) => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to edit library values");
      return;
    }
    setEditData(values);
    setLibraryId(values.libraryId);
    setLibraryFieldId(values.sourceId);
    setEditModalOpen(true);
  };

  // If no read access, show access denied
  if (!hasReadAccess() && !hasWriteAccess()) {
    return (
      <div className="mt-5">
        <div className="mttr-sec mt-0">
          <p className="mb-0 para-tag d-flex justify-content-center">Access Denied</p>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <h4>You don't have permission to access Separate Library</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="separate">
          <div className="mttr-sec mt-0">
            <p className="mb-0 para-tag d-flex justify-content-center">Separate Library</p>
            {hasReadAccess() && !hasWriteAccess() && (
              <p className="text-warning text-center mb-0">
                <small>Read-only access</small>
              </p>
            )}
          </div>
          
          {/* CREATE FORM - Show for all users with read access, but disable fields if no write access */}
          {hasReadAccess() && (
            <Formik
              initialValues={{
                Module: "",
                Field: "",
                Value: "",
              }}
              validationSchema={validation}
              onSubmit={(values) => submitFormValue(values)}
            >
              {(Formik) => {
                const { handleBlur, handleChange, handleSubmit, setFieldValue, values } = Formik;
                return (
                  <Form onSubmit={handleSubmit} onReset={handleReset}>
                    <Card className="mt-4 mttr-card p-4 ">
                      <Row>
                        <Col>
                          <Label notify={true}>Module</Label>
                          <Form.Group>
                            <Select
                              value={values.Module}
                              onChange={(e) => {
                                if (hasWriteAccess()) {
                                  setSelectModule(e.value);
                                  getModuleFieldDetails(e.value);
                                  setFieldValue("Field", "");
                                  setFieldValue("Module", { label: e.value, value: e.value });
                                }
                              }}
                              placeholder="Select Module"
                              type="select"
                              name="Module"
                              styles={customStyles}
                              isDisabled={!hasWriteAccess()} // Disable if read-only
                              options={[
                                { value: "FMECA", label: "FMECA" },
                                { value: "SAFETY", label: "SAFETY" },
                                { value: "PMMRA", label: "PMMRA" },
                                { value: "MTTR", label: "MTTR" },
                              ]}
                            />
                            <ErrorMessage component="span" name="Module" className="error text-danger" />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Label notify={true}>Fields</Label>
                          <Form.Group>
                            <Select
                              value={values.Field}
                              onChange={(e) => {
                                if (hasWriteAccess()) {
                                  setLibraryFieldId(e.id);
                                  setFieldValue("Value", "");
                                  setFieldValue("Field", { label: e.label, value: e.value });
                                  setSelectModuleFieldVlue(e.value);
                                }
                              }}
                              placeholder="Select Field"
                              name="Field"
                              styles={customStyles}
                              isDisabled={!hasWriteAccess()} // Disable if read-only
                              options={[
                                {
                                  options: moduleData?.map((list) => ({
                                    value: list.name,
                                    label: list.key,
                                    id: list._id,
                                  })),
                                },
                              ]}
                            />
                            <ErrorMessage component="span" name="Field" className="error text-danger" />
                          </Form.Group>
                        </Col>
                        {values.Field ? (
                          <Col>
                            <Label notify={true}>Value</Label>
                            <Form.Group>
                              <Form.Control
                                style={{ borderRadius: "3px" }}
                                placeholder="Enter value"
                                value={values.Value}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                name="Value"
                                disabled={!hasWriteAccess()} // Disable if read-only
                              />
                              <ErrorMessage component="span" name="Value" className="error text-danger" />
                            </Form.Group>
                          </Col>
                        ) : null}
                        <div className="d-flex flex-direction-row justify-content-end mt-4 mb-2">
                          <Button
                            className="delete-cancel-btn me-2"
                            variant="outline-secondary"
                            onClick={() => {
                              Formik.resetForm();
                            }}
                            disabled={!hasWriteAccess()} // Disable if read-only
                          >
                            CANCEL
                          </Button>
                          <Button 
                            className="save-btn" 
                            type="submit"
                            disabled={!hasWriteAccess()} // Disable if read-only
                          >
                            CREATE
                          </Button>
                        </div>
                      </Row>
                    </Card>
                  </Form>
                );
              }}
            </Formik>
          )}

          {/* TABLE - Only show if user has read access */}
          {hasReadAccess() && (
            <div style={{ bottom: "10px" }}>
              <MaterialTable
                title="Separate Library"
                className="mb-5"
                data={allSepareteData.filter((item) => item.moduleName === selectedModule)}
                columns={columns}
                icons={tableIcons}
                style={{ marginTop: "30px" }}
                // Show actions only if user has write permission
                actions={hasWriteAccess() ? [
                  (rowData) => ({
                    icon: () => (
                      <Row>
                        <Col>
                          <FontAwesomeIcon icon={faEdit} className="icon-btn" onClick={() => editShow(rowData)} />
                        </Col>
                      </Row>
                    ),
                    tooltip: "Edit Page",
                  }),
                  (rowData) => ({
                    icon: () => (
                      <Row>
                        <Col>
                          <FontAwesomeIcon icon={faTrash} className="coloring" />
                        </Col>
                      </Row>
                    ),
                    tooltip: "Delete Page",
                    onClick: () => {
                      deleteShow(rowData);
                    },
                  }),
                ] : []}
                options={{
                  cellStyle: { border: "1px solid #eee" },
                  addRowPosition: "first",
                  actionsColumnIndex: -1,
                  pageSize: 5,
                  pageSizeOptions: [5, 10, 20, 50],
                  headerStyle: {
                    backgroundColor: "#CCE6FF",
                    fontWeight: "bold",
                    zIndex: 0,
                  },
                }}
                onRowClick={(event, rowData) => {
                  setEditingData(rowData);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* EDIT MODAL */}
      <Modal show={editModalOpen} onHide={() => setEditModalOpen(false)} className="mb-0">
        <Modal.Header className="mt-2 display-flex justify-content-center mttr-sec para-tag" style={{ margin: "15px" }}>
          <Modal.Title>Edit Separate Library</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ marginTop: "-22px", marginBottom: "-18px" }}>
          <Formik
            initialValues={{
              Module: editData.moduleName,
              Field: editData.sourceName,
              Value: editData.sourceValue,
            }}
            validationSchema={editValidation}
            onSubmit={(values) => updateFormValue(values)}
          >
            {(Formik) => {
              const { handleBlur, handleChange, handleSubmit, values } = Formik;
              return (
                <Form onSubmit={handleSubmit}>
                  <Card className="mt-0 mttr-card p-4 ">
                    <Row>
                      <Col className="col-lg-12 mb-3">
                        <Label className="college">Module</Label>
                        <Form.Group>
                          <Form.Control
                            style={{ backgroundColor: "#dddddd" }}
                            type="text"
                            value={editData.moduleName}
                            readOnly
                            name="Module"
                          />
                        </Form.Group>
                      </Col>
                      <Col className="col-lg-12 mb-3">
                        <Label className="college">Field</Label>
                        <Form.Group>
                          <Form.Control
                            style={{ backgroundColor: "#dddddd" }}
                            type="text"
                            value={editData.sourceName}
                            readOnly
                            name="field"
                          />
                        </Form.Group>
                      </Col>
                      <Col className="col-lg-12">
                        <Label className="college">Value</Label>
                        <Form.Group>
                          <Form.Control
                            style={{ borderRadius: "7px" }}
                            placeholder="Enter value"
                            value={values.Value}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="Value"
                            disabled={!hasWriteAccess()} // Disable if read-only
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex flex-direction-row justify-content-end mt-4 ">
                      <Button
                        className="me-2 canceled"
                        variant="outline-secondary"
                        onClick={() => setEditModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      {hasWriteAccess() && (
                        <Button type="submit" className="save-btn-btn">
                          Save Changes
                        </Button>
                      )}
                    </div>
                  </Card>
                </Form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* DELETE MODAL */}
      <Modal show={deleteModalOpen} onHide={() => setDeleteModalOpen(false)}>
        <Modal.Header className="justify-content-center mttr-sec para-tag" style={{ margin: "15px", marginTop: "5px" }}>
          <Modal.Title>Delete separate library</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ marginTop: "-20px" }}>
          <div>
            <h5 className="d-flex justify-content-center mb-4 coloring">Are you sure want to delete? </h5>
            <Card className="mttr-card p-4 " style={{ marginTop: "-10px" }}>
              <Row>
                <Col className="col-lg-12 mt-0">
                  <Label>Module</Label>
                  <Form.Group>
                    <Form.Control
                      style={{ backgroundColor: "#dddddd" }}
                      value={name?.moduleName}
                      name="module"
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col className="col-lg-12 mt-3">
                  <Label>Field</Label>
                  <Form.Group>
                    <Form.Control
                      style={{ backgroundColor: "#dddddd" }}
                      value={name?.sourceName}
                      name="field"
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col className="col-lg-12 mt-3">
                  <Label>Value</Label>
                  <Form.Group>
                    <Form.Control
                      style={{ backgroundColor: "#dddddd" }}
                      value={name?.sourceValue}
                      name="value"
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card>
          </div>
        </Modal.Body>
        <div className="d-flex flex-direction-row justify-content-end mb-2" style={{ marginTop: "-15px" }}>
          <Button className="canceled me-2" variant="outline-secondary" onClick={() => setDeleteModalOpen(false)}>
            No
          </Button>
          {hasWriteAccess() && (
            <Button className="save-btn-btn me-3" onClick={() => deleteSepLib()}>
              Yes
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default SeparateLibrary;