import React from 'react';
import { Row, Col } from 'react-bootstrap';

const Header = ({ projectData }) => {
  return (
    <Row className="d-flex justify-content-between">
      <Col className="d-flex flex-column align-items-center"></Col>
      <Col className="d-flex flex-column align-items-center">
        <h5>{projectData?.projectName}</h5>
        <h5>Product Breakdown Structure</h5>
      </Col>
      <Col className="d-flex flex-column align-items-center">
        <h5>Rev:</h5>
        <h5>Rev Date:</h5>
      </Col>
    </Row>
  );
};

export default Header;
