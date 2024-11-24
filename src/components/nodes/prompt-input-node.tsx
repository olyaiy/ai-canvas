'use client'

import { useCallback, useState, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useReactFlow } from '@xyflow/react'

interface PromptInputNodeProps {
  id: string;
  data: {
    value: string;
  };
  isConnectable: boolean;
}

export function PromptInputNode({ id, data, isConnectable }: PromptInputNodeProps) {
  const { setNodes } = useReactFlow();
  const [prompt, setPrompt] = useState(data.value);

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
          onClick={() => console.log('Running prompt...')}
        >
          Run Prompt
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