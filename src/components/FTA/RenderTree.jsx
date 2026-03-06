import { TreeNode } from "react-organizational-chart";
import RenderNode from "../../components/FTA/RenderNode";
import { useState } from "react";

const RenderTree = ({
  data,
  parNod,
  handleRemove,
  handleAdd,
  handleEdit,
  projectId,
  getFTAData,
  selectedNodeId,
  setSelectedNodeId,
  productData,
   calculationMode,
   setCurrentCalculationMode,
}) => {

console.log(calculationMode,'calculationMode in render tree')
  return (
    <TreeNode
      label={
        <RenderNode
          node={data}
          parNod={parNod}
          handleRemove={handleRemove}
          handleAdd={handleAdd}
          handleEdit={handleEdit}
          projectId={projectId}
          getFTAData={getFTAData}
          productData={productData}
          selectedNodeId={selectedNodeId} 
          setSelectedNodeId={setSelectedNodeId} 
          calculationMode={calculationMode} 
          setCurrentCalculationMode={setCurrentCalculationMode}
        />
      }
    >

      {data?.children?.map((child, index) => (
        <RenderTree
          key={index}
          data={child}
          handleRemove={handleRemove}
          handleAdd={handleAdd}
          handleEdit={handleEdit}
          projectId={projectId}
          getFTAData={getFTAData}
          productData={productData}
          selectedNodeId={selectedNodeId} 
          setSelectedNodeId={setSelectedNodeId} 
           calculationMode={calculationMode}
           setCurrentCalculationMode={setCurrentCalculationMode}
        />
      ))}
    </TreeNode>
  );
};

export default RenderTree;
