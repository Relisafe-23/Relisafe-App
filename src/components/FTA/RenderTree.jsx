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
}) => {
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
        />
      ))}
    </TreeNode>
  );
};

export default RenderTree;
