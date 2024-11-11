"use client";

import { InputNode } from "@/components/nodes/input-node";
import { LowercaseNode } from "@/components/nodes/lowercase-node";
import { ReplaceSpacesNode } from "@/components/nodes/replace-spaces-node";
import { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

const nodeTypes = {
  inputNode: InputNode,
  replaceSpacesNode: ReplaceSpacesNode,
  lowercaseNode: LowercaseNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "inputNode",
    position: { x: 250, y: 50 },
    data: { value: "", onChange: () => {} },
  },
  {
    id: "2",
    type: "replaceSpacesNode",
    position: { x: 150, y: 200 },
    data: { input: "" },
  },
  {
    id: "3",
    type: "lowercaseNode",
    position: { x: 350, y: 200 },
    data: { input: "" },
  },
];

export default function FlowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [inputValue, setInputValue] = useState("");

  // Update connected nodes when input changes
  const updateConnectedNodes = useCallback((value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "1") {
          return {
            ...node,
            data: { ...node.data, value },
          };
        }
        
        // Find if this node is connected to the input node
        const isConnected = edges.some((edge) => edge.target === node.id);
        if (isConnected) {
          return {
            ...node,
            data: { ...node.data, input: value },
          };
        }
        return node;
      })
    );
  }, [edges, setNodes]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    updateConnectedNodes(value);
  }, [updateConnectedNodes]);

  // Update nodes with new input handler
  useState(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "1") {
          node.data = {
            ...node.data,
            value: inputValue,
            onChange: handleInputChange,
          };
        }
        return node;
      })
    );
  });

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      // Update the target node with current input value
      if (params.target) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === params.target) {
              return {
                ...node,
                data: { ...node.data, input: inputValue },
              };
            }
            return node;
          })
        );
      }
    },
    [setEdges, setNodes, inputValue]
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}