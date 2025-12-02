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
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff' : 'white',
      color: state.isSelected ? 'white' : 'black',
      '&:hover': {
        backgroundColor: state.isSelected ? '#007bff' : '#f8f9fa',
        color: state.isSelected ? 'white' : 'black',
      },
    }),
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused || state.hasValue ? '2px solid #007bff' : '1px solid #ced4da',
      borderRadius: '0.375rem',
      boxShadow:
        state.isFocused || state.hasValue
          ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
          : 'none',
      '&:hover': {
        border: state.isFocused || state.hasValue ? '2px solid #007bff' : '1px solid #007bff',
      },
    }),

    singleValue: (provided, state) => ({
      ...provided,
      color: '#212529',
      fontWeight: state.isFocused ? '600' : '400',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#6c757d',
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.375rem',
      boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
    }),
  };

  // In your component

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

  // const getNextProduct = () => {
  //   const currentIndex = productData.findIndex((item) => item.id === productId);
  //   const nextIndex = currentIndex + 1 < productData.length ? currentIndex + 1 : 0;
  //   const nextProduct = productData[nextIndex];
  //   setProductId(nextProduct.id);
  //   history.push({ state: { productId: nextProduct.id } });
  // };

  // const getPreviousProduct = () => {
  //   const currentIndex = productData.findIndex((item) => item.id === productId);
  //   const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : productData.length - 1;
  //   const prevProduct = productData[prevIndex];
  //   setProductId(prevProduct.id);
  //   history.push({ state: { productId: prevProduct.id } });
  // };


    const getNextProduct = () => {
    const currentIndex = productData.findIndex((item) => item.id === productId);
    const nextIndex = currentIndex + 1 < productData.length ? currentIndex + 1 : 0;
    const nextProduct = productData[nextIndex];

    setProductId(nextProduct.id);
    setPrefillData({
      value: nextProduct.id,
      label: nextProduct.indexCount + "." + nextProduct.productName,
    });

    history.push({ state: { productId: nextProduct.id } });
  };


  const getPreviousProduct = () => {
  const currentIndex = productData.findIndex((item) => item.id === productId);
  const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : productData.length - 1;
  const prevProduct = productData[prevIndex];

  setProductId(prevProduct.id);
  setPrefillData({
    value: prevProduct.id,
    label: prevProduct.indexCount + "." + prevProduct.productName,
  });

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
              styles={customStyles}
              placeholder="Select Product"
              value={prefillData}
              options={productData.map((list) => ({
                value: list.id,
                label: list.indexCount + "." + list.productName,
              }))}
              onChange={handleChange}
            />
            <div>

            </div>
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
