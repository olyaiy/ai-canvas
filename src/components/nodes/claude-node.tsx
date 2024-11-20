'use client'

import { useCallback, useState, useMemo, useEffect } from 'react'
import { Handle, Position, useNodeId, useReactFlow, useUpdateNodeInternals } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown } from 'lucide-react'
import { anthropicCall } from '@/lib/ai-calls'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ClaudeNodeData {
  value?: string
  model?: string
  systemPrompt: string
  output?: string
  prompt?: string
}

export const CLAUDE_MODELS = {
  'claude-3-5-haiku-latest': 'Claude 3 Haiku',
  'claude-3-5-sonnet-latest': 'Claude 3 Sonnet',
  'claude-3-opus-latest': 'Claude 3 Opus'
} as const

export type ClaudeModelType = keyof typeof CLAUDE_MODELS;

export function ClaudeNode({ 
  data, 
  isConnectable 
}: { 
  data: ClaudeNodeData
  isConnectable: boolean 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [output, setOutput] = useState<string>('')
  const [hasInputConnection, setHasInputConnection] = useState(false)
  const [hasOutputConnection, setHasOutputConnection] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('claude-3-5-haiku-latest')
  const [systemPrompt, setSystemPrompt] = useState<string>(
    data.systemPrompt ?? "You are a helpful assistant"
  )
  const nodeId = useNodeId()
  const { getNode, getEdges, setNodes } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    const checkConnections = () => {
      const edges = getEdges()
      const hasInput = edges.some(edge => edge.target === nodeId)
      const hasOutput = edges.some(edge => edge.source === nodeId)
      setHasInputConnection(hasInput)
      setHasOutputConnection(hasOutput)
    }

    // Check initial connections
    checkConnections()

    // Create a mutation observer to watch for changes in the DOM
    const observer = new MutationObserver(checkConnections)
    const flowElement = document.querySelector('.react-flow__edges')
    
    if (flowElement) {
      observer.observe(flowElement, {
        childList: true,
        subtree: true
      })
    }

    return () => observer.disconnect()
  }, [nodeId, getEdges])

  const handleGenerate = useCallback(async () => {
    setIsLoading(true)
    setOutput('')
    
    try {
      const edges = getEdges()
      const incomingEdge = edges.find(edge => edge.target === nodeId)
      
      if (!incomingEdge) return
      
      const sourceNode = getNode(incomingEdge.source)
      const promptText = (sourceNode?.data?.value || sourceNode?.data?.output) as string | undefined
      
      if (!promptText) {
        setOutput('Error: No input text found')
        return
      }

      const stream = await anthropicCall(promptText, selectedModel as ClaudeModelType, systemPrompt)
      
      let fullResponse = ''
      for await (const message of stream) {
        if (message.type === 'content_block_delta' && message.delta.type === 'text_delta') {
          fullResponse += message.delta.text
          setOutput(fullResponse)
        }
      }

      setNodes(nodes => nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              output: fullResponse
            }
          }
        }
        return node
      }))

    } catch (error) {
      console.error('Error:', error)
      setOutput('Error generating response')
    } finally {
      setIsLoading(false)
    }
  }, [nodeId, getNode, getEdges, selectedModel, systemPrompt, setNodes])

  return (
    <div className="bg-[#D4A27F] rounded-lg p-3 min-w-[300px] shadow-md">
      <div className="relative">
        <Handle
          type="target"
          position={Position.Top}
          id="claude-in"
          isConnectable={isConnectable}
          className={`!w-6 !h-6 ${
            hasInputConnection ? '!bg-[#262625]' : '!bg-gray-400'
          } transition-colors cursor-crosshair hover:!bg-gray-600 hover:scale-110`}
          style={{ 
            transform: 'translate(-50%, -100%)',
            zIndex: 100 
          }}
        />
        <ChevronDown 
          className={`absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 pointer-events-none ${
            hasInputConnection ? 'text-[#262625]' : 'text-gray-400'
          } transition-colors`}
        />
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger className="w-[180px] bg-white/80 border-[#262625] text-black">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#262625] text-black">
              {Object.entries(CLAUDE_MODELS).map(([value, label]) => (
                <SelectItem key={value} value={value} className="hover:bg-gray-100">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleGenerate}
            disabled={isLoading || !hasInputConnection}
            size="sm"
            variant={!hasInputConnection ? "ghost" : "default"}
            className="bg-[#262625] hover:bg-gray-700 text-white disabled:bg-gray-400"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Generate
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt" className="text-black">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter system prompt..."
            className="resize-none min-h-[24px] max-h-[96px] overflow-y-auto bg-white/80 border-[#262625] text-black placeholder:text-gray-500"
            rows={1}
          />
        </div>

        <div className="mt-4 border border-[#262625] rounded-lg bg-white/80 p-3">
          <div className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${output ? 'bg-[#262625]' : 'bg-gray-400'}`} />
            Output
          </div>
          <div className="p-3 bg-white rounded-md text-sm whitespace-pre-wrap max-w-[500px] h-[100px] overflow-auto border border-[#262625] text-black shadow-sm">
            {output || (
              <span className="text-gray-500 italic">No output generated yet</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <Handle
          type="source"
          position={Position.Bottom}
          id="claude-out"
          isConnectable={isConnectable}
          className={`!w-6 !h-6 ${
            hasOutputConnection ? '!bg-[#262625]' : '!bg-gray-400'
          } transition-colors cursor-crosshair hover:!bg-gray-600 hover:scale-110`}
          style={{ 
            transform: 'translate(-50%, 100%)',
            zIndex: 100 
          }}
        />
        <ChevronDown 
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 pointer-events-none ${
            hasOutputConnection ? 'text-[#262625]' : 'text-gray-400'
          } transition-colors`}
        />
      </div>
    </div>
  )
} 