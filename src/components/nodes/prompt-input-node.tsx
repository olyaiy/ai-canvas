'use client'

import { useCallback, useState, useEffect } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface PromptInputNodeProps {
  id: string;
  data: {
    value: string;
  };
  isConnectable: boolean;
}

export function PromptInputNode({ id, data, isConnectable }: PromptInputNodeProps) {
  const { setNodes, getNodes, getEdges } = useReactFlow();
  const [prompt, setPrompt] = useState(data.value);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setPrompt(data.value);
  }, [data.value]);

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = evt.target.value;
    setPrompt(newValue);
    
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              value: newValue,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  // Helper function to get child nodes recursively
  const getChildNodes = useCallback((nodeId: string): string[] => {
    const edges = getEdges();
    const directChildren = edges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target);
    
    const allChildren = [...directChildren];
    directChildren.forEach(childId => {
      allChildren.push(...getChildNodes(childId));
    });
    
    return allChildren;
  }, [getEdges]);

  // Function to trigger node generation
  const triggerNodeGeneration = useCallback(async (nodeId: string) => {
    const node = getNodes().find(n => n.id === nodeId);
    if (!node) return;

    // Find the node's DOM element and click its generate button
    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
    const generateButton = Array.from(nodeElement?.querySelectorAll('button') || [])
      .find(button => button.textContent?.includes('Generate')) as HTMLButtonElement;

    if (generateButton && !generateButton.disabled) {
      generateButton.click();
      
      // Wait for the generation to complete
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          // Get the latest node data
          const currentNode = getNodes().find(n => n.id === nodeId);
          
          // Check if the node has finished generating
          const isGenerating = nodeElement?.querySelector('.animate-spin') !== null;
          const hasOutput = currentNode?.data?.value !== undefined;
          
          // Resolve when generation is complete and we have output
          if (!isGenerating && hasOutput) {
            clearInterval(checkInterval);
            // Add a small delay to ensure data propagation
            setTimeout(resolve, 500);
          }
        }, 100);

        // Add a timeout to prevent infinite waiting
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 30000); // 30 second timeout
      });
    }
  }, [getNodes]);

  const runPrompt = useCallback(async () => {
    setIsRunning(true);
    try {
      // Get all child nodes in order
      const childNodes = getChildNodes(id);
      
      // Process nodes sequentially
      for (const nodeId of childNodes) {
        console.log(`Processing node: ${nodeId}`);
        await triggerNodeGeneration(nodeId);
        // Add a small delay between nodes
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error running prompt:', error);
    } finally {
      setIsRunning(false);
    }
  }, [id, getChildNodes, triggerNodeGeneration]);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[300px] shadow-sm">
      <div className="flex flex-col gap-3">
        <label 
          htmlFor="prompt" 
          className="font-semibold text-sm text-gray-700"
        >
          Prompt
        </label>
        <textarea
          id="prompt"
          name="prompt"
          rows={4}
          placeholder="Enter your prompt here..."
          onChange={onChange}
          className="nodrag p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={prompt}
        />
        
        <Button 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          onClick={runPrompt}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Running...
            </>
          ) : (
            'Run Prompt'
          )}
        </Button>
      </div>

      <div className="relative">
        <Handle
          type="source"
          position={Position.Bottom}
          id="prompt-out"
          isConnectable={isConnectable}
          className={`!w-8 !h-8 !bg-blue-500 !transition-all !duration-150 
            cursor-grab active:cursor-grabbing hover:!bg-blue-600
            before:!absolute before:!inset-0 before:!rounded-full before:!transition-all before:!duration-150
            hover:before:!ring-2 hover:before:!ring-blue-500 hover:before:!ring-offset-2 hover:before:!ring-offset-white
            !flex !items-center !justify-center`}
          style={{ 
            transform: 'translate(-50%, 100%)',
            zIndex: 100 
          }}
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </Handle>
      </div>
    </div>
  )
} 