'use client'
import { PromptInputNode } from '@/components/nodes/prompt-input-node';
import TextUpdaterNode from '@/components/nodes/text-updater-node';
import { ClaudeNode } from '@/components/nodes/claude-node';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';import '@xyflow/react/dist/style.css';
import { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const nodeTypes = { textUpdater: TextUpdaterNode, promptInput: PromptInputNode, claude: ClaudeNode }

const initialEdges: any[] = [];

const initialNodes = [

  {
    id: 'node-4',
    type: 'promptInput',
    position: { x: 300, y: 0 },
    data: { value: "testing prompt input node" },

  },
  {
    id: 'node-5',
    type: 'claude',
    position: { x: 300, y: 400 },
    data: { 
      systemPrompt: "You are a helpful assistant",
      output: undefined,
      temperature: 0.4,
      maxTokens: 8192,
    },
  },
];


 
export default function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const handleNodeDataChange = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      })
    );
  }, []);

  const addClaudeNode = useCallback(() => {
    const position = {
      x: Math.random() * 500,
      y: Math.random() * 500,
    };

    const newNode = {
      id: `claude-${Date.now()}`,
      type: 'claude',
      position,
      data: { 
        systemPrompt: "You are a helpful assistant",
        output: undefined,
        temperature: 0.4,
        maxTokens: 8192,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, []);

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
      
      <Button
        onClick={addClaudeNode}
        className="absolute bottom-4 right-4 bg-[#D4A27F] hover:bg-[#b88b6b] text-black"
        size="icon"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
 
