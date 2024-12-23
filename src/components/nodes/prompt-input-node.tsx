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
      return new Promise<void>((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;
        const checkInterval = setInterval(() => {
          // Get the latest node data
          const currentNode = getNodes().find(n => n.id === nodeId);
          
          // Check if the node has finished generating
          const isGenerating = nodeElement?.querySelector('.animate-spin') !== null;
          const hasOutput = currentNode?.data?.value !== undefined && currentNode?.data?.value !== '';
          
          if (!isGenerating && hasOutput) {
            clearInterval(checkInterval);
            clearTimeout(timeoutId);
            resolve();
          }
        }, 100);

        // Add a timeout to prevent infinite waiting
        timeoutId = setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error(`Generation timeout for node ${nodeId}`));
        }, 30000); // 30 second timeout
      });
    }
  }, [getNodes]);

  const setNodeWaitingState = useCallback((nodeId: string, isWaiting: boolean) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              isWaiting,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Add this helper function to get parent nodes
  const getParentNodes = useCallback((nodeId: string): string[] => {
    const edges = getEdges();
    return edges
      .filter(edge => edge.target === nodeId)
      .map(edge => edge.source);
  }, [getEdges]);

  // Modified runPrompt function to handle errors better
  const runPrompt = useCallback(async () => {
    setIsRunning(true);
    try {
      const childNodes = getChildNodes(id);
      
      // Set all nodes to waiting state initially
      childNodes.forEach(nodeId => {
        setNodeWaitingState(nodeId, true);
      });

      const completedNodes = new Set<string>();
      const runningPromises = new Map<string, Promise<void>>();

      while (completedNodes.size < childNodes.length) {
        const nodesToProcess = childNodes.filter(nodeId => {
          if (completedNodes.has(nodeId)) return false;
          if (runningPromises.has(nodeId)) return false;

          const parents = getParentNodes(nodeId);
          return parents.every(parentId => 
            parentId === id || completedNodes.has(parentId)
          );
        });

        const newPromises = nodesToProcess.map(async nodeId => {
          setNodeWaitingState(nodeId, false);
          await new Promise(resolve => setTimeout(resolve, 100));
          
          try {
            await triggerNodeGeneration(nodeId);
            completedNodes.add(nodeId);
          } catch (error) {
            console.error(`Error generating node ${nodeId}:`, error);
            // Still mark as completed even if there was an error
            completedNodes.add(nodeId);
          } finally {
            runningPromises.delete(nodeId);
          }
        });

        if (newPromises.length > 0) {
          await Promise.race(newPromises).catch(console.error);
        } else if (runningPromises.size > 0) {
          // Wait for any running promise to complete if we can't start new ones
          await Promise.race(Array.from(runningPromises.values())).catch(console.error);
        } else {
          // If we can't process any nodes and nothing is running, break to prevent infinite loop
          break;
        }
      }

      // Final cleanup
      await Promise.all(Array.from(runningPromises.values())).catch(console.error);

    } catch (error) {
      console.error('Error running prompt:', error);
    } finally {
      setIsRunning(false);
      // Reset waiting state for all nodes
      const childNodes = getChildNodes(id);
      childNodes.forEach(nodeId => {
        setNodeWaitingState(nodeId, false);
      });
    }
  }, [id, getChildNodes, getParentNodes, triggerNodeGeneration, setNodeWaitingState]);

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