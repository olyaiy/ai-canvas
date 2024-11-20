'use client'

import { useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useReactFlow } from '@xyflow/react'

interface PromptInputNodeProps {
  id: string;
  data: {
    value: string;
  };
}

export function PromptInputNode({ id, data }: PromptInputNodeProps) {
  const { setNodes } = useReactFlow();

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              value: evt.target.value,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

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
          defaultValue={data.value}
        />
        
        <Button 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => console.log('Running prompt...')}
        >
          Run Prompt
        </Button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="prompt-out"
        className="!w-6 !h-6 !bg-blue-500 !border-2 !border-blue-600 !flex !items-center !justify-center"
      >
        <ChevronDown className="w-4 h-4 text-white" />
      </Handle>
    </div>
  )
} 