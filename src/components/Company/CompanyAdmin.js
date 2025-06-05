import React, { useEffect, useState } from "react";
import { Table, Button, Col, Form, Modal } from "react-bootstrap";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import Label from "../LabelComponent";

function CompanyAdmin() {
  const [data, setData] = useState([]);
  const history = useHistory();
  const userId = localStorage.getItem("userId");
  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    companyName: "",
  });
      const [editMode, setEditMode] = useState(false);
        const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  const getAllCompanyUsers = () => {
    Api.get("/api/v1/user/company/all", {
      headers: {
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.companyUsersList;
        setData(data);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

const deleteUser = (id) => {
  Api.delete(`/api/v1/user/${id}`, {
    headers: {
      userId: userId,
    },
  })
    .then((res) => {
      const message = res?.data?.message;
      if (message) {
        alert(message);
      }

      getAllCompanyUsers();
    })
    .catch((error) => {
      const errorStatus = error?.response?.status;
      if (errorStatus === 401) {
        logout();
      }
    });
  }
    const handleEditClick = (user) => {

    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      phoneNumber: user.phoneNumber,
      companyName: user.companyName,
    });
    setEditMode(true);
  }
 
  const handleEdit = () => {
    const { id, ...userData } = editUser;
console.log("userData", userData);
    Api.patch(`/api/v1/user/${id}`, userData, {
      headers: {
        userId: userId,
      },
    })
      .then((res) => {
        const message = res?.data?.message;
    
        getAllCompanyUsers();
          setEditMode(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
    }
  
  useEffect(() => {
    getAllCompanyUsers();
  }, []);

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  return (
    <div className=" mx-4 company-main-div">
      <div className="mttr-sec ">
        <p className=" mb-0 para-tag">User Informations</p>
      </div>
      <div className="" style={{ top: "80px" }}>
        <div style={{ bottom: "50px" }}>
          <Table hover bordered>
            <thead>
              <tr>
                <th>S.No</th>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Password</th>
                <th>Phone Number</th>
                <th>Company name</th>
                <th>Action</th> 
              </tr>
            </thead>
            <tbody>
              {data?.length > 0 ? (
                data?.map((list, key) => (
                  <tr>
                    <td>{key + 1}</td>
                    <td>{list?.name}</td>
                    <td>{list?.email}</td>
                    <td>{list?.password}</td>
                    <td>{list?.phoneNumber}</td>
                    <td>{list?.companyName}</td>
                    <td>
 <FontAwesomeIcon 
              icon={faTrash} 
              style={{color: "#e60f45", cursor: "pointer"}} 
              className="me-2"
              onClick={() => deleteUser(list.id)} 
            />
<FontAwesomeIcon 
  icon={faPen} 
  style={{color: "#1D5460", cursor: "pointer"}}
  size="xl"
  onClick={() => handleEditClick(list)}
/>
               </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    Users yet to be created
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
            <Modal show={editMode} onHide={() => setEditMode(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit User</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form.Group>
      <Label> Name</Label>
      <Form.Control
        type="text"
        name="name"
        value={editUser.name}
       onChange={handleInputChange}
        placeholder="Enter the name"
      />
    </Form.Group>
      <Form.Group>
      <Label> Email</Label>
      <Form.Control
        type="text"
        name="email"
        value={editUser.email}
   onChange={handleInputChange}       
    placeholder="Enter email address"
      />
    </Form.Group>
      <Form.Group>
      <Label> Password</Label>
      <Form.Control
        type="text"
        name="password"
        value={editUser.password}
             onChange={handleInputChange}
        placeholder="Enter password"
      />
    </Form.Group>
      <Form.Group>
      <Label> Phone Number</Label>
      <Form.Control
        type="text"
        name="phoneNumber"
        value={editUser.phoneNumber}
                  onChange={handleInputChange}
        placeholder="Enter phone number"
      />
    </Form.Group>
      <Form.Group>
      <Label> Company Name</Label>
      <Form.Control
        type="text"
        name="companyName"
        value={editUser.companyName}
        onChange={handleInputChange}
        placeholder="Enter company name"
      />
    </Form.Group>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setEditMode(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={ handleEdit}>
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>
    </div>
  );
}

export default CompanyAdmin;
