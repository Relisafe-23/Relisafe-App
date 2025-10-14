import React, { useEffect, useState } from "react";
import { Card, Form, Table, Modal, Button } from "react-bootstrap";
import Label from "../core/Label";
import "../../css/ProjectList.scss";
import { Formik, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import Api from "../../Api";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { customStyles } from "../core/select";

export default function Projectpermission(props) {
  const companyName = props?.location?.state?.companyName;
  const projectName = props?.location?.state?.projectName;
  const companyId = props?.location?.state?.companyId;
  const projectId = props?.location?.state?.projectID;
  const [permissions, setPermissions] = useState([]);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [permissionId, setPermissionId] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Module names in correct order as they come from API
  const moduleNames = [
    "PBS",
    "Failure Rate Prediction",
    "MTTR Prediction",
    "FMECA",
    "RBD",
    "FTA",
    "PM MRA",
    "Spare Part Analysis",
    "Projects",
    "Safety",
    "Seprate Library",
    "Connected Library",
    "Reports"
  ];

  const [initialPermissions, setInitialPermissions] = useState([]);
  const [initialUser, setInitialUser] = useState(null);

  const history = useHistory();
  const userId = localStorage.getItem("userId");

  // Fetch users and initial permissions
  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = () => {
    const companyIdLocal = localStorage.getItem("companyId");
    setIsLoading(true);

    Api.get("/api/v1/user/list", {
      params: { companyId: companyIdLocal, userId },
    })
      .then((res) => {
        const data = res?.data?.usersList || [];
        setUserData(data);
        if (data.length > 0) {
          const firstUser = { value: data[0].id, label: data[0].name };
          setUser(firstUser);
          getPermissionData(data[0].id);
        }
      })
      .catch((err) => {
        if (err?.response?.status === 401) logout();
      })
      .finally(() => setIsLoading(false));
  };

  const getPermissionData = (authorizedId) => {
    setIsLoading(true);

    Api.get(`/api/v1/projectPermission/list`, {
      params: { projectId, authorizedPersonnel: authorizedId, userId },
    })
      .then((res) => {
        const data = res?.data?.data;
        setPermissionId(data?.id || null);

        if (data?.modules) {
          // Map API modules to our permissions array
          const newPermissions = moduleNames.map(moduleName => {
            const moduleData = data.modules.find(mod => mod.name === moduleName);
            return {
              name: moduleName,
              read: moduleData?.read || false,
              write: moduleData?.write || false
            };
          });

          setPermissions(newPermissions);
          setInitialPermissions(JSON.parse(JSON.stringify(newPermissions)));
        } else {
          // No permissions found, set all to false
          const defaultPermissions = moduleNames.map(name => ({ name, read: false, write: false }));
          setPermissions(defaultPermissions);
          setInitialPermissions(JSON.parse(JSON.stringify(defaultPermissions)));
        }

        setInitialUser({ value: authorizedId, label: userData.find(u => u.id === authorizedId)?.name });
      })
      .catch((err) => {
        if (err?.response?.status === 401) logout();
      })
      .finally(() => setIsLoading(false));
  };

  const logout = () => {
    localStorage.clear();
    history.push("/login");
    window.location.reload();
  };

  const showModal = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
      history.push("/project/list");
    }, 2000);
  };

  // const handlePermissionChange = (index, field) => {
  //   const newPermissions = [...permissions];

  //   if (field === 'read') {
  //     // If unchecking read, also uncheck write
  //     newPermissions[index] = {
  //       ...newPermissions[index],
  //       read: !newPermissions[index].read,
  //       write: newPermissions[index].read ? false : newPermissions[index].write
  //     };
  //   } else if (field === 'write') {
  //     // If checking write, also check read
  //     newPermissions[index] = {
  //       ...newPermissions[index],
  //       write: !newPermissions[index].write,
  //       read: !newPermissions[index].write ? newPermissions[index].read : true
  //     };
  //   }

  //   setPermissions(newPermissions);
  // };
  const handlePermissionChange = (index, field) => {
    const newPermissions = [...permissions];

    newPermissions[index] = {
      ...newPermissions[index],
      [field]: !newPermissions[index][field], // just toggle that field
    };

    setPermissions(newPermissions);
  };

  const arePermissionsEqual = (perms1, perms2) => {
    if (!perms1 || !perms2 || perms1.length !== perms2.length) return false;

    return perms1.every((perm, index) =>
      perm.read === perms2[index].read &&
      perm.write === perms2[index].write
    );
  };

  const permissionUpdate = (values, { resetForm }) => {
    const noChanges =
      values.user?.value === initialUser?.value &&
      arePermissionsEqual(permissions, initialPermissions);

    if (noChanges) {
      setResponseMessage("No changes to save.");
      showModal();
      return;
    }

    setIsLoading(true);

    Api.post(`/api/v1/projectPermission`, {
      modules: permissions,
      accessType: "Read",
      authorizedPersonnel: values.user?.value,
      companyId,
      projectId,
      createdBy: values.user?.value,
      modifiedBy: userId,
      projectPermissionId: permissionId,
      userId,
    })
      .then((res) => {
        setInitialPermissions(JSON.parse(JSON.stringify(permissions)));
        setInitialUser(values.user);
        setResponseMessage(res?.data?.message || "Permissions updated successfully!");
        showModal();
      })
      .catch((err) => {
        setResponseMessage(err?.response?.data?.message || "Error updating permissions");
        showModal();
        if (err?.response?.status === 401) logout();
      })
      .finally(() => setIsLoading(false));
  };

  const userValidation = Yup.object().shape({
    user: Yup.object().required("User is Required"),
  });

  const disableSave =
    isLoading ||
    !user ||
    (user?.value === initialUser?.value && arePermissionsEqual(permissions, initialPermissions));

  return (
    <div className="mx-4" style={{ marginTop: "90px" }}>
      <Formik
        enableReinitialize={true}
        initialValues={{ user }}
        validationSchema={userValidation}
        onSubmit={permissionUpdate}
      >
        {(formik) => {
          const { values, handleSubmit, setFieldValue } = formik;
          return (
            <Form onSubmit={handleSubmit}>
              <div className="mttr-sec">
                <p className="mb-0 para-tag">Project Permission</p>
              </div>

              <Card className="mt-2 card-color">
                <div className="project-name">
                  <h5 className="text-center mt-4">
                    <b>{projectName}</b>
                  </h5>
                </div>
                <hr className="mx-2" />

                <div className="d-flex justify-content-center">
                  <Form.Group className="project-permission-select">
                    <Label notify={true}>Authorized Personnel</Label>
                    <Select
                      name="user"
                      styles={customStyles}
                      placeholder="Select User"
                      value={values.user}
                      className="mt-1"
                      isDisabled={isLoading}
                      onChange={(e) => {
                        setUser(e);
                        setFieldValue("user", e);
                        getPermissionData(e.value);
                      }}
                      options={userData.map((user) => ({
                        value: user.id,
                        label: user.name,
                      }))}
                    />
                    <ErrorMessage name="user" component="span" className="error" />
                  </Form.Group>
                </div>

                <Table bordered className="mt-4">
                  <thead>
                    <tr>
                      <td>
                        <Label notify={true}>
                          <b>Modules</b>
                        </Label>
                      </td>
                      <td className="d-flex justify-content-center">
                        <b>Read/Write</b>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission, index) => (
                      <tr key={permission.name}>
                        <td>{permission.name}</td>
                        <td className="edit-project-list">
                          <Form.Check
                            type="checkbox"
                            checked={permission.read}
                            onChange={() => handlePermissionChange(index, 'read')}
                            disabled={isLoading}
                          />
                          <span className="ms-3 me-5">Read</span>

                          <Form.Check
                            type="checkbox"
                            checked={permission.write}
                            onChange={() => handlePermissionChange(index, 'write')}
                            disabled={isLoading || !permission.read}
                          />
                          <span className="ms-3">Write</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>

              <div className="d-flex justify-content-end my-3">
                <Button
                  className="delete-cancel-btn me-2 mb-5"
                  variant="outline-secondary"
                  type="button"
                  onClick={() => history.push("/project/list")}
                  disabled={isLoading}
                >
                  CANCEL
                </Button>
                <Button
                  className="save-btn mb-5"
                  type="submit"
                  disabled={disableSave}
                >
                  {isLoading ? "SAVING..." : "SAVE CHANGES"}
                </Button>
              </div>

              <Modal show={show} centered>
                <Modal.Body className="modal-body-user">
                  <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1d5460" />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-center" style={{ borderTop: 0, bottom: "30px" }}>
                  <h4>{responseMessage}</h4>
                </Modal.Footer>
              </Modal>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}