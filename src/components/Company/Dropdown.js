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
  
  // Get read-only status from props
  const isReadOnly = props?.isReadOnly ?? false;

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#007BFF" : "white",
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: state.isSelected ? "#007BFF" : "#F8F9FA",
        color: state.isSelected ? "white" : "black",
      },
    }),
    control: (provided, state) => ({
      ...provided,
      border:
        state.isFocused || state.hasValue
          ? "2px solid #007BFF"
          : "1px solid #CED4DA",
      borderRadius: "0.375rem",
      boxShadow:
        state.isFocused || state.hasValue
          ? "0 0 0 0.2rem rgba(0, 123, 255, 0.25)"
          : "none",
      "&:hover": {
        border:
          state.isFocused || state.hasValue
            ? "2px solid #007BFF"
            : "1px solid #007BFF",
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
  // NEXT / PREVIOUS LOGIC
  // -------------------------------
  const getNextProduct = () => {
    console.log("Next button clicked - Product ID:", productId); // Debug
    if (productData.length === 0) {
      console.log("No product data available");
      return;
    }
    
    const currentIndex = productData.findIndex((p) => p.id === productId);
    console.log("Current index:", currentIndex);
    
    const nextIndex =
      currentIndex + 1 < productData.length ? currentIndex + 1 : 0;
    const nextProduct = productData[nextIndex];
    
    console.log("Next product:", nextProduct);
    setProductId(nextProduct.id);
    history.push({ 
      state: { 
        productId: nextProduct.id,
        projectId: projectId // Ensure projectId is preserved
      } 
    });
    
    // Force refresh if needed
    if (props.onProductChange) {
      props.onProductChange(nextProduct.id);
    }
  };

  const getPreviousProduct = () => {
    console.log("Previous button clicked - Product ID:", productId); // Debug
    if (productData.length === 0) {
      console.log("No product data available");
      return;
    }
    
    const currentIndex = productData.findIndex((p) => p.id === productId);
    console.log("Current index:", currentIndex);
    
    const prevIndex =
      currentIndex - 1 >= 0 ? currentIndex - 1 : productData.length - 1;
    const prevProduct = productData[prevIndex];
    
    console.log("Previous product:", prevProduct);
    setProductId(prevProduct.id);
    setPrefillData({
      value: prevProduct.id,
      label: prevProduct.indexCount + "." + prevProduct.productName,
    });
    
    history.push({ 
      state: { 
        productId: prevProduct.id,
        projectId: projectId // Ensure projectId is preserved
      } 
    });
    
    // Force refresh if needed
    if (props.onProductChange) {
      props.onProductChange(prevProduct.id);
    }
  };

  return (
    <div style={{ 
      // Reset inherited disabled state from fieldset
      pointerEvents: 'auto',
      opacity: 1,
      display: 'block'
    }}>
      <Row>
        {/* PREVIOUS BUTTON - Always enabled */}
        <Col sm={12} md={4} className="d-flex justify-content-start mt-1">
          <div style={{ marginLeft: "100px" }}>
            <Button 
              className="FRP-button" 
              onClick={getPreviousProduct}
              style={{ 
                pointerEvents: 'auto',
                opacity: 1,
                cursor: 'pointer'
              }}
            >
              {"<< PREV"}
            </Button>
          </div>
        </Col>
        
        {/* DROPDOWN - Conditionally disabled based on read-only */}
        <Col sm={12} md={4} className="mt-1 dropdown-Alignments">
          <Select
            styles={{
              ...customStyles,
              control: (provided, state) => ({
                ...customStyles.control(provided, state),
                opacity: isReadOnly ? 0.5 : 1,
                backgroundColor: isReadOnly ? '#e9ecef' : 'white',
                cursor: isReadOnly ? 'not-allowed' : 'pointer'
              })
            }}
            placeholder="Select Product"
            value={selectedOption}
            options={options}
            onChange={(selected) => {
              if (!isReadOnly) {
                setProductId(selected.value);
                history.push({ 
                  state: { 
                    productId: selected.value,
                    projectId: projectId
                  } 
                });
                
                if (props.onProductChange) {
                  props.onProductChange(selected.value);
                }
              }
            }}
            isDisabled={isReadOnly}
          />
        </Col>
        
        {/* NEXT BUTTON - Always enabled */}
        <Col sm={12} md={4} className="d-flex justify-content-end mt-1">
          <div style={{ marginLeft: "100px" }}>
            <Button 
              className="FRP-button" 
              onClick={getNextProduct}
              style={{ 
                pointerEvents: 'auto',
                opacity: 1,
                cursor: 'pointer'
              }}
            >
              {"NEXT >>"}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}