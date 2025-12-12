import React, { useEffect, useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import Api from "../../Api";

export default function Dropdown(props) {
  const projectId = props?.value;
  const history = useHistory();

  const [productId, setProductId] = useState(props?.productId ?? null);
  const [productData, setProductData] = useState([]);
  const [prefillData, setPrefillData] = useState(null);

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#007bff" : "white",
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: state.isSelected ? "#007bff" : "#f8f9fa",
        color: state.isSelected ? "white" : "black",
      },
    }),
    control: (provided, state) => ({
      ...provided,
      border:
        state.isFocused || state.hasValue
          ? "2px solid #007bff"
          : "1px solid #ced4da",
      borderRadius: "0.375rem",
      boxShadow:
        state.isFocused || state.hasValue
          ? "0 0 0 0.2rem rgba(0, 123, 255, 0.25)"
          : "none",
      "&:hover": {
        border:
          state.isFocused || state.hasValue
            ? "2px solid #007bff"
            : "1px solid #007bff",
      },
    }),
  };

const options = productData.map((list) => ({
  value: list.id,
  label: list.indexCount + "." + list.productName,
}));

// This ensures the selected value always matches an option
const selectedOption = options.find((opt) => opt.value === productId) || null;


  // -------------------------------
  // FETCH MAIN PRODUCT LIST
  // -------------------------------
  const getTreeProduct = () => {
    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: { projectId },
    }).then((res) => {
      const treeData = res?.data?.data || [];
      setProductData(treeData);

      if (treeData.length > 0 && !productId) {
        const first = treeData[0];
        setProductId(first.id);
        setPrefillData({
          value: first.id,
          label: first.indexCount + "." + first.productName,
        });
      }
    });
  };

  // -------------------------------
  // FETCH SELECTED PRODUCT DETAILS
  // -------------------------------
  const productTreeData = (id) => {
    if (!id) return;

    Api.get("/api/v1/productTreeStructure/get/tree/product/list", {
      params: { projectId, treeStructureId: id },
    }).then((res) => {
      const data = res?.data?.data;

      if (data?.productName) {
        setPrefillData({
          value: data.productId,
          label: data.indexCount + "." + data.productName,
        });
      }
    });
  };

  // Load list when project changes
  useEffect(() => {
    getTreeProduct();
  }, [projectId]);

  // Fetch selected product details
  useEffect(() => {
    if (productId) {
      productTreeData(productId);
    }
  }, [productId]);

  // -------------------------------
  // HANDLE SELECT CHANGE
  // -------------------------------
  const handleChange = (selected) => {
    setPrefillData(selected);
    setProductId(selected.value);
    history.push({ state: { productId: selected.value } });
  };

  // -----------------------------------------------------
  // NEXT / PREVIOUS LOGIC — FULLY CORRECTED
  // -----------------------------------------------------
  const getNextProduct = () => {
    if (productData.length === 0) return;

    const currentIndex = productData.findIndex((p) => p.id === productId);
    const nextIndex =
      currentIndex + 1 < productData.length ? currentIndex + 1 : 0;

    const nextProduct = productData[nextIndex];

    setProductId(nextProduct.id);
    setProductId(nextProduct.id);

    // setPrefillData({
    //   value: nextProduct.id,
    //   label: nextProduct.indexCount + "." + nextProduct.productName,
    // });

    history.push({ state: { productId: nextProduct.id } });
  };

  const getPreviousProduct = () => {
    if (productData.length === 0) return;

    const currentIndex = productData.findIndex((p) => p.id === productId);
    const prevIndex =
      currentIndex - 1 >= 0 ? currentIndex - 1 : productData.length - 1;

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
        {/* PREVIOUS BUTTON */}
        <Col sm={12} md={4} className="d-flex justify-content-start mt-1">
          <div style={{ marginLeft: "100px" }}>
            <Button className="FRP-button" onClick={getPreviousProduct}>
              {"<< PREV"}
            </Button>
          </div>
        </Col>

        {/* DROPDOWN */}
        <Col sm={12} md={4} className="mt-1 dropdown-Alignments">
          {/* <Select
            placeholder="Select Product"
            styles={customStyles}
            value={prefillData}
            
            // options={productData.map((list) => ({
            //   value: list.id,
            //   label: list.indexCount + "." + list.productName,
            // }))}
            onChange={handleChange}
          /> */}
          <Select
  styles={customStyles}
  placeholder="Select Product"
  value={selectedOption}    
  options={options}
  onChange={(selected) => {
    setProductId(selected.value);
    history.push({ state: { productId: selected.value } });
  }}
/>

        </Col>

        {/* NEXT BUTTON */}
        <Col sm={12} md={4} className="d-flex justify-content-end mt-1">
          <div style={{ marginLeft: "100px" }}>
            <Button className="FRP-button" onClick={getNextProduct}>
              {"NEXT >>"}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
