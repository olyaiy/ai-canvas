'use client'

import { useCallback, useState, useMemo, useEffect } from 'react'
import { Handle, Position, useNodeId, useReactFlow, useUpdateNodeInternals } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown, Copy, Check } from 'lucide-react'
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
import { Slider } from "@/components/ui/slider"

interface ClaudeNodeData {
  value?: string
  model?: ClaudeModelType
  systemPrompt: string
  temperature: number
  maxTokens: number
}

export const CLAUDE_MODELS = {
  'claude-3-5-haiku-latest': 'Claude 3 Haiku',
  'claude-3-5-sonnet-latest': 'Claude 3 Sonnet',
  'claude-3-opus-latest': 'Claude 3 Opus'
} as const

export type ClaudeModelType = keyof typeof CLAUDE_MODELS;

// Add this helper function before the ClaudeNode component
function truncateText(text: string, maxLength: number) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

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
  const [selectedModel, setSelectedModel] = useState<ClaudeModelType>('claude-3-5-haiku-latest')
  const [systemPrompt, setSystemPrompt] = useState<string>(
    data.systemPrompt ?? "You are a helpful assistant"
  )
  const [temperature, setTemperature] = useState<number>(data.temperature ?? 0.4)
  const [maxTokens, setMaxTokens] = useState<number>(
    data.maxTokens ?? (selectedModel.includes('opus') ? 4096 : 8192)
  )
  const nodeId = useNodeId()
  const { getNode, getEdges, setNodes } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  const [isCopied, setIsCopied] = useState(false)
  const [inputPreviews, setInputPreviews] = useState<Array<{ text: string; nodeId: string }>>([]);

  useEffect(() => {
    const checkConnections = () => {
      const edges = getEdges()
      const hasInput = edges.some(edge => edge.target === nodeId)
      const hasOutput = edges.some(edge => edge.source === nodeId)
      setHasInputConnection(hasInput)
      setHasOutputConnection(hasOutput)

      // Get input previews from all source nodes
      const incomingEdges = edges.filter(edge => edge.target === nodeId)
      const previews = incomingEdges.map(edge => {
        const sourceNode = getNode(edge.source)
        return sourceNode?.data?.value ? {
          text: truncateText(String(sourceNode.data.value), 150),
          nodeId: sourceNode.id
        } : null
      }).filter(Boolean)

      setInputPreviews(previews)
    }

    checkConnections()
    const interval = setInterval(checkConnections, 100)
    return () => clearInterval(interval)
  }, [nodeId, getEdges, getNode])

  // Update maxTokens when model changes
  useEffect(() => {
    const defaultMaxTokens = selectedModel.includes('opus') ? 4096 : 8192
    setMaxTokens(prev => Math.min(prev, defaultMaxTokens))
  }, [selectedModel])

  const handleGenerate = useCallback(async () => {
    setIsLoading(true)
    setOutput('')
    
    try {
      const edges = getEdges()
      const incomingEdge = edges.find(edge => edge.target === nodeId)
      
      if (!incomingEdge) return
      
      const sourceNode = getNode(incomingEdge.source)
      const promptText = sourceNode?.data?.value as string
      
      if (!promptText || typeof promptText !== 'string') {
        setOutput('Error: No valid input text found')
        return
      }

      const stream = await anthropicCall(
        promptText, 
        selectedModel, 
        systemPrompt,
        maxTokens,
        temperature
      )
      
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
              value: fullResponse
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
  }, [nodeId, getNode, getEdges, selectedModel, systemPrompt, maxTokens, temperature, setNodes])

  // Create a memoized version of getInputValue that updates when needed
  const getInputValue = useMemo(() => {
    const edges = getEdges()
    const incomingEdge = edges.find(edge => edge.target === nodeId)
    const sourceNode = incomingEdge ? getNode(incomingEdge.source) : null
    return String(sourceNode?.data?.value || "undefined")
  }, [nodeId, getEdges, getNode]) // Add dependencies that should trigger a recalculation

  // Add this useEffect to update node data when input changes
  useEffect(() => {
    const edges = getEdges()
    const incomingEdge = edges.find(edge => edge.target === nodeId)
    const sourceNode = incomingEdge ? getNode(incomingEdge.source) : null
    const inputValue = sourceNode?.data?.value

    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            inputValue // Store the input value in the node's data
          }
        }
      }
      return node
    }))
  }, [nodeId, getEdges, getNode, setNodes])

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }, [output])

  return (
    <div className="bg-[#D4A27F] rounded-lg p-3 min-w-[300px] shadow-md">
      <div className="relative">
        <Handle
          type="target"
          position={Position.Top}
          id="claude-in"
          isConnectable={isConnectable}
          className={`!w-8 !h-8 ${
            hasInputConnection ? '!bg-[#6749C6]' : '!bg-[#6749C6]'
          } !transition-all !duration-150 cursor-grab active:cursor-grabbing hover:!bg-[#5438B4] 
          before:!absolute before:!inset-0 before:!rounded-full before:!transition-all before:!duration-150
          hover:before:!ring-2 hover:before:!ring-[#6749C6] hover:before:!ring-offset-2 hover:before:!ring-offset-[#D4A27F]
          !flex !items-center !justify-center`}
          style={{ 
            transform: 'translate(-50%, -100%)',
            zIndex: 100 
          }}
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </Handle>
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Select
            value={selectedModel}
            onValueChange={(value) => setSelectedModel(value as ClaudeModelType)}
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

        <div className="space-y-4">
          {/* Temperature Slider */}
          <div className="space-y-2">
            <Label className="text-black">Temperature: {temperature.toFixed(2)}</Label>
            <Slider
              value={[temperature]}
              onValueChange={([value]) => setTemperature(value)}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Max Tokens Slider */}
          <div className="space-y-2">
            <Label className="text-black">
              Max Tokens: {maxTokens}
            </Label>
            <Slider
              value={[maxTokens]}
              onValueChange={([value]) => setMaxTokens(value)}
              max={selectedModel.includes('opus') ? 4096 : 8192}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Input Previews Section */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700">
            Inputs:
          </div>
          {inputPreviews.length > 0 ? (
            inputPreviews.map((preview, index) => (
              <div 
                key={preview.nodeId} 
                className="text-sm bg-white/80 border border-[#262625] rounded-md p-2 text-gray-600"
              >
                <div className="text-xs font-medium text-gray-700 mb-1">
                  From {preview.nodeId}:
                </div>
                {preview.text}
              </div>
            ))
          ) : (
            <div className="text-sm bg-white/80 border border-[#262625] rounded-md p-2 text-gray-500 italic">
              No input connected
            </div>
          )}
        </div>

        <div className="mt-4 border border-[#262625] rounded-lg bg-white/80 p-3">
          <div className="font-medium text-sm text-gray-700 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${output ? 'bg-[#262625]' : 'bg-gray-400'}`} />
              Output
            </div>
            {output && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-600 hover:bg-[#262625] hover:text-white transition-colors"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <div className="p-3 bg-white rounded-md text-sm break-words w-[280px] max-h-[200px] overflow-y-auto border border-[#262625] text-black shadow-sm">
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
          className={`!w-8 !h-8 ${
            hasOutputConnection ? '!bg-[#6749C6]' : '!bg-[#6749C6]'
          } !transition-all !duration-150 cursor-grab active:cursor-grabbing hover:!bg-[#5438B4]
          before:!absolute before:!inset-0 before:!rounded-full before:!transition-all before:!duration-150
          hover:before:!ring-2 hover:before:!ring-[#6749C6] hover:before:!ring-offset-2 hover:before:!ring-offset-[#D4A27F]
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