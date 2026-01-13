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
          selectedNodeId={selectedNodeId} // Pass selectedNodeId to RenderNode
          setSelectedNodeId={setSelectedNodeId} // Pass setSelectedNodeId function to RenderNode
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
          selectedNodeId={selectedNodeId} // Pass selectedNodeId to RenderTree (important)
          setSelectedNodeId={setSelectedNodeId} // Pass setSelectedNodeId function to RenderTree (important)
        />
      ))}
    </TreeNode>
  );
};

export default RenderTree;
