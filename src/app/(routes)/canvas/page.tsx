'use client'
import { PromptInputNode } from '@/components/nodes/prompt-input-node';
import TextUpdaterNode from '@/components/nodes/text-updater-node';
import { ClaudeNode } from '@/components/nodes/claude-node';
import { GPTNode } from '@/components/nodes/gpt-node';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  NodeMouseHandler,
} from '@xyflow/react';import '@xyflow/react/dist/style.css';
import { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatedEdge } from '@/components/edges/animated-edge'
import { saveProject } from './actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"
import { Label } from '@/components/ui/label';

const nodeTypes = { textUpdater: TextUpdaterNode, promptInput: PromptInputNode, claude: ClaudeNode, gpt: GPTNode }

const edgeTypes = {
  default: AnimatedEdge,
}

const initialNodes = [
  {
    id: 'prompt-1',
    type: 'promptInput',
    position: { x: 300, y: 10 },
    data: { value: "testing prompt input node" },
  },
  {
    id: 'gpt-1',
    type: 'gpt',
    position: { x: 600, y: 300 },
    data: { 
      systemPrompt: "You are a helpful assistant",
      output: undefined,
      temperature: 0.4,
      maxTokens: 16384,
    },
  },
  {
    id: 'claude-1',
    type: 'claude',
    position: { x: 100, y: 400 },
    data: { 
      systemPrompt: "remove spaces in the following sentance:",
      output: undefined,
      temperature: 0.4,
      maxTokens: 8192,
    },
  },
];

const initialEdges = [
  {
    id: 'prompt-to-gpt',
    source: 'prompt-1',
    target: 'gpt-1',
  },
  {
    id: 'gpt-to-claude',
    source: 'gpt-1',
    target: 'claude-1',
  },
];

export default function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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

  const addGPTNode = useCallback(() => {
    const position = {
      x: Math.random() * 500,
      y: Math.random() * 500,
    };

    const newNode = {
      id: `gpt-${Date.now()}`,
      type: 'gpt',
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

  const addPromptNode = useCallback(() => {
    const position = {
      x: Math.random() * 500,
      y: Math.random() * 500,
    };

    const newNode = {
      id: `prompt-${Date.now()}`,
      type: 'promptInput',
      position,
      data: { 
        value: "Enter your prompt here..."
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const nodesWithSelection = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      className: node.id === selectedNodeId 
        ? 'ring-2 ring-blue-500 ring-offset-2 animate-glow-in transition-all duration-200 ease-in-out'
        : 'animate-glow-out transition-all duration-200 ease-in-out',
    }));
  }, [nodes, selectedNodeId]);

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'default' }}
        nodesDraggable
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
      
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          onClick={addPromptNode}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Prompt</span>
        </Button>
        <Button
          onClick={addGPTNode}
          className="bg-[#10a37f] hover:bg-[#0d8a6c] text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New GPT Agent</span>
        </Button>
        <Button
          onClick={addClaudeNode}
          className="bg-[#D4A27F] hover:bg-[#b88b6b] text-black flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Claude Agent</span>
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Project</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Project</DialogTitle>
            </DialogHeader>
            <form action={saveProject} className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Amazing Flow"
                  required
                />
              </div>
              <input 
                type="hidden" 
                name="flow_data" 
                value={JSON.stringify({
                  nodes,
                  edges,
                })}
              />
              <Button type="submit" className="w-full">
                Save Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
 
