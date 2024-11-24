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
  Edge,
} from '@xyflow/react';import '@xyflow/react/dist/style.css';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Save, Loader2, Trash2 } from "lucide-react";
import { AnimatedEdge } from '@/components/edges/animated-edge'
import { saveProject, deleteProject } from './actions'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const nodeTypes = { textUpdater: TextUpdaterNode, promptInput: PromptInputNode, claude: ClaudeNode, gpt: GPTNode }

const edgeTypes = {
  default: AnimatedEdge,
}

const initialNodes = [
  {
    id: 'prompt-1',
    type: 'promptInput',
    position: { x: 300, y: 10 },
    data: { 
      value: "testing prompt input node",
      name: "Prompt Input"
    },
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
      name: "GPT Agent"
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
      name: "Claude Agent"
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

// Add interface for Flow component props
interface FlowProps {
  initialFlowData?: {
    nodes: Node[];
    edges: Edge[];
  } | null;
  projectName: string;
  projectId: string;
  isPreview?: boolean;
}

export default function Flow({ initialFlowData, projectName, projectId, isPreview = false }: FlowProps) {
  const [flowData, setFlowData] = useState(initialFlowData)

  useEffect(() => {
    setFlowData(initialFlowData)
  }, [initialFlowData])

  // Initialize state with either initialFlowData or default values
  const [nodes, setNodes] = useState(
    flowData?.nodes || initialNodes
  );
  const [edges, setEdges] = useState(
    flowData?.edges || initialEdges
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
        name: "Claude Agent"
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

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', projectName);
      formData.append('projectId', projectId);
      formData.append('flow_data', JSON.stringify({ nodes, edges }));
      await saveProject(formData);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, projectName, projectId]);

  const router = useRouter();

  // Add state for alert dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Update delete handler to remove confirm
  const handleDelete = useCallback(async () => {
    const result = await deleteProject(projectId);
    if (result.success) {
      router.push('/');
    }
  }, [projectId, router]);

  // Disable interactions if it's a preview
  const proOptions = useMemo(() => ({
    hideAttribution: true,
    disabled: isPreview
  }), [isPreview]);

  // Add viewport state with default zoom
  const defaultViewport = {
    x: 0,
    y: 0,
    zoom: 0.20, // This will zoom out to 75% of the default view
  };

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        defaultViewport={defaultViewport}
        fitView
        fitViewOptions={{
          padding: 0.5, // Adds 50% padding around the nodes
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
      >
        {!isPreview && (
          <div className="absolute bottom-4 right-4 flex gap-2 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-lg z-50">
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
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 min-w-[130px] transition-all"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Project'}</span>
            </Button>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Project</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your project
                    and remove all of its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
 
