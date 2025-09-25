import React, { useEffect, useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import Api from "../../Api";

export default function Dropdown(props) {
  const projectId = props?.value;
  const [productId, setProductId] = useState(props?.productId);
  const [productData, setProductData] = useState([]);
  const [prefillData, setPrefillData] = useState(null);
  const history = useHistory();

  const getTreeProduct = () => {
    
    Api.get(`/api/v1/productTreeStructure/product/list`, { 
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      const treeData = res?.data?.data;
      setProductData(treeData);
      if (treeData.length > 0 && !productId) {
        setPrefillData({
          label: treeData[0].productName,
          value: treeData[0].id,
        });
        setProductId(treeData[0].id);
      }
    });
  };

  const productTreeData = (id) => {
    Api.get("/api/v1/productTreeStructure/get/tree/product/list", {
      params: {
        projectId: projectId,
        treeStructureId: id,
      },
    }).then((res) => {
      const data = res?.data?.data;
      if (data?.productName) {
        setPrefillData({
          value: data.productId,
          label: data.productName,
        });
      }
    });
  };

  useEffect(() => {
    getTreeProduct();
  }, [projectId]);

  useEffect(() => {
    if (productId) {
      productTreeData(productId);
    }
  }, [productId]);

  const handleChange = (selectedOption) => {
    setPrefillData(selectedOption);
    setProductId(selectedOption.value);
    history.push({ state: { productId: selectedOption.value } });
  };

  const getNextProduct = () => {
    const currentIndex = productData.findIndex((item) => item.id === productId);
    const nextIndex = currentIndex + 1 < productData.length ? currentIndex + 1 : 0;
    const nextProduct = productData[nextIndex];
    setProductId(nextProduct.id);
    history.push({ state: { productId: nextProduct.id } });
  };

  const getPreviousProduct = () => {
    const currentIndex = productData.findIndex((item) => item.id === productId);
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : productData.length - 1;
    const prevProduct = productData[prevIndex];
    setProductId(prevProduct.id);
    history.push({ state: { productId: prevProduct.id } });
  };

  return (
    <div>
      <Row>
        <Col className="d-flex justify-content-start mt-1" sm={12} md={4}>
          <div style={{ marginLeft: "100px" }}>
            <Button className="FRP-button" onClick={getPreviousProduct}>
              {`${"<< PREV"}`}
            </Button>
          </div>
        </Col>
        <Col className="mt-1 dropdown-Alignments" sm={12} md={4}>
          <div>
            <Select
              type="select"
              placeholder="Select Product"
              value={prefillData}
              options={productData.map((list) => ({
                value: list.id,
                label: list.indexCount + "." + list.productName,
              }))}
              onChange={handleChange}
            />
          </div>
        </Col>
        <Col className="d-flex justify-content-end mt-1" sm={12} md={4}>
          <div style={{ marginLeft: "100px" }}>
            <Button className="FRP-button" onClick={getNextProduct}>
              {`${"NEXT >>"}`}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
