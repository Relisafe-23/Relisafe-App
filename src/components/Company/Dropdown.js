import React, { useEffect, useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import Api from "../../Api";
import Label from "../LabelComponent";

export default function Dropdown(props) {
  const projectId = props?.value;
  const [productId, setProductId] = useState(props?.productId);
  const [productData, setProductData] = useState([]);
  const [prefillData, setPrefillData] = useState();
  const [productIndex, setProductIndex] = useState(1);
  const history = useHistory();

  const getTreeProduct = () => {
    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: {
        projectId: projectId,
      },
    }).then((res) => {
      const treeData = res?.data?.data;
      setProductData(treeData);
      setPrefillData(
        treeData[0]?.productName
          ? { label: treeData[0]?.productName, value: treeData[0]?.id }
          : ""
      );
      // setProductId(treeData[0]?.id);
    });
  };
  useEffect(() => {
    getTreeProduct();
    productTreeData();
  }, [productId]);

  const productTreeData = () => {
    Api.get("/api/v1/productTreeStructure/get/tree/product/list", {
      params: {
        projectId: projectId,
        treeStructureId: productId,
      },
    }).then((res) => {
      const data = res?.data?.data;
      setPrefillData(
        data?.productName
          ? { value: data?.productId, label: data?.productName }
          : ""
      );
    });
  };

  const  getNextProduct = () => {
    let found = false; // Flag to indicate if the matching element is found

    for (let i = 0; i < productData.length; i++) {
      const mList = productData[i];

      if (!found && mList.id === productId) {
        found = true;

        // Check if the next product exists
        if (i + 1 < productData.length) {
          const prodId = productData[i + 1];
          console.log("Next prodId:", prodId);
          setProductId(prodId.id);
          history.push({ state: { productId: prodId.id } });
        } else {
          console.log("No next element found.");
        }
      }
    }
  };
  const  getPreviousProduct = () => {
    let found = false; 
    for (let i = 0; i < productData.length; i++) {
      const mList = productData[i];

      if (!found && mList.id === productId) {
        found = true;
        if (i + 1 < productData.length) {
          const prodId = productData[i - 1];
          console.log("Next prodId:", prodId);
          setProductId(prodId.id);
          history.push({ state: { productId: prodId.id } });
        } else {
          console.log("No next element found.");
        }
      }
    }
  };

  const getProductId = (e) => {
    console.log("eeeeeeee.......",e)
    history.push({ state: { productId: e.value } });
  };

  return (
    <div>
      <Row>
        <Col className="d-flex justify-content-start mt-1" sm={12} md={4}>
          <div style={{ marginLeft: "100px" }}>
            <Button 
            className="FRP-button"
            onClick={() => {
             
                getPreviousProduct();
            
            }}
           >{`${"<< PREV"}`}</Button>
          </div>
        </Col>
        <Col className="mt-1 dropdown-Alignments" sm={12} md={4}>
          <div>
            {productData?.map((list, i) => {})}
            <Select
              type="select"
              placeholder="Select Product"
              value={prefillData}
              options={[
                {
                  options: productData?.map((list, i) => ({
                    value: list.id,
                    label: list.indexCount + "." + list.productName,
                  })),
                },
              ]}
              onChange={(e) => {
                console.log("ee,,,,,,,", e.label);
                setPrefillData(e);
                getProductId(e);
                setProductId(e.id);
                setProductIndex(e.label);
              }}
            />
          </div>
        </Col>
        <Col className="d-flex justify-content-end mt-1" sm={12} md={4}>
          <div style={{ marginLeft: "100px" }}>
            <Button
              className="FRP-button"
              onClick={() => {
               
                  getNextProduct();
              
              }}
            >
              {`${"NEXT >>"}`}{" "}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
{
  /* <Row style={{ display: "flex", flexDirection: "column", margin: "0" }}>
  <Col xs={12} sm={9} className="d-flex justify-content-center">
    <div>
      <Label>Product's :</Label>
      <Select
        className="frp-tree-select"
        name="treeTableData"
        type="select"
        placeholder="Select Product"
        value={prefillData}
        options={[
          {
            options: productData?.map((list, i) => ({
              value: list.id,
              label: list.indexCount + ".  " + list.productName,
            })),
          },
        ]}
        onChange={(e) => {
          // setCurrentData(e);
          // setCurrentActive(true);
          // setFirstProductPrefill(e);
          // productData(e);
          setPrefillData(e);
          getProductId(e);
        }}
      />
    </div>
  </Col>
  <Col xs={12} sm={9} style={{ display: "flex", justifyContent: "space-between" }}>
    <div>
      <Button
        style={{ backgroundColor: "#1D5460", border: "none" }}
        onClick={() => {
          setProductIndex(productIndex - 1);
        }}
      >
        {" "}
        {`${"<< Prev"}`}{" "}
      </Button>
    </div>
    <div> */
}
{
  /* <p className="mb-0 fs-5 d-flex align-items-center mx-5">
                      {}
                    </p> */
}
{
  /* <p className="mb-0 fs-5 d-flex align-items-center mx-5">
        {productData[productIndex]?.productName
          ? productData[productIndex]?.indexCount + "-" + productData[productIndex]?.productName
          : " No products to display"}
      </p>
    </div>

    <div className="d-flex ">
      <Button
        style={{ backgroundColor: "#1D5460", border: "none" }}
        onClick={() => {
          setProductIndex(productIndex + 1);
        }}
      >
        {" "}
        {`${"Next >>"}`}{" "}
      </Button>
    </div>
  </Col>
</Row>; */
}
