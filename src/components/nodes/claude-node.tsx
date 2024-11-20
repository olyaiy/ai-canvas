'use client'

import { useCallback, useState, useMemo, useEffect } from 'react'
import { Handle, Position, useNodeId, useReactFlow, useUpdateNodeInternals } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
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
  systemPrompt?: string
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
  const [hasConnection, setHasConnection] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('claude-3-5-haiku-latest')
  const [systemPrompt, setSystemPrompt] = useState<string>(
    data.systemPrompt || "You are a helpful assistant"
  )
  const nodeId = useNodeId()
  const { getNode, getEdges } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    const checkConnections = () => {
      const edges = getEdges()
      const isConnected = edges.some(edge => edge.target === nodeId)
      setHasConnection(isConnected)
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
      
      const promptNode = getNode(incomingEdge.source)
      const prompt = promptNode?.data?.value as string
      
      if (!prompt) {
        setOutput('Error: No prompt text found')
        return
      }

      const stream = await anthropicCall(prompt, selectedModel as ClaudeModelType, systemPrompt)
      
      let fullResponse = ''
      for await (const message of stream) {
        if (message.type === 'content_block_delta' && message.delta.type === 'text_delta') {
          fullResponse += message.delta.text
          setOutput(fullResponse)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setOutput('Error generating response')
    } finally {
      setIsLoading(false)
    }
  }, [nodeId, getNode, getEdges, selectedModel, systemPrompt])

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[300px] shadow-sm">
      <Handle
        type="target"
        position={Position.Top}
        id="claude-in"
        isConnectable={isConnectable}
      />
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CLAUDE_MODELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleGenerate}
            disabled={isLoading || !hasConnection}
            size="sm"
            variant={!hasConnection ? "ghost" : "default"}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Generate
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter system prompt..."
            className="resize-none min-h-[24px] max-h-[96px] overflow-y-auto"
            rows={1}
          />
        </div>

        <div className="mt-4 border rounded-lg bg-gray-50 p-3">
          <div className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${output ? 'bg-green-500' : 'bg-gray-400'}`} />
            Output
          </div>
          <div className="p-3 bg-white rounded-md text-sm whitespace-pre-wrap max-w-[500px] h-[100px] overflow-auto border border-gray-100 shadow-sm">
            {output || (
              <span className="text-gray-400 italic">No output generated yet</span>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="claude-out"
        isConnectable={isConnectable}
      />
    </div>
  )
} 