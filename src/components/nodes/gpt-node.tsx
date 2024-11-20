'use client'

import { useCallback, useState, useMemo, useEffect } from 'react'
import { Handle, Position, useNodeId, useReactFlow, useUpdateNodeInternals } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown } from 'lucide-react'
import { openaiCall } from '@/lib/ai-calls'
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

interface GPTNodeData {
  value?: string
  model?: GPTModelType
  systemPrompt: string
  temperature: number
  maxTokens: number
}

export const GPT_MODELS = {
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4o': 'GPT-4o',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'o1-mini': 'O1 Mini',
  'o1-preview': 'O1 Preview'
} as const;

export type GPTModelType = keyof typeof GPT_MODELS;

export function GPTNode({ 
  data, 
  isConnectable 
}: { 
  data: GPTNodeData
  isConnectable: boolean 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [output, setOutput] = useState<string>('')
  const [hasInputConnection, setHasInputConnection] = useState(false)
  const [hasOutputConnection, setHasOutputConnection] = useState(false)
  const [selectedModel, setSelectedModel] = useState<GPTModelType>('gpt-4o-mini')
  const [systemPrompt, setSystemPrompt] = useState<string>(
    data.systemPrompt ?? "You are a helpful assistant"
  )
  const [temperature, setTemperature] = useState<number>(data.temperature ?? 0.4)
  const [maxTokens, setMaxTokens] = useState<number>(data.maxTokens ?? 16384)
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

    checkConnections()

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

  // Update maxTokens when model changes
  useEffect(() => {
    const defaultMaxTokens = selectedModel.startsWith('o1') 
      ? 65536 
      : selectedModel.includes('4o') 
        ? 16384 
        : 4096
    setMaxTokens(prev => Math.min(prev, defaultMaxTokens))
  }, [selectedModel])

  const getInputValue = useMemo(() => {
    const edges = getEdges()
    const incomingEdge = edges.find(edge => edge.target === nodeId)
    const sourceNode = incomingEdge ? getNode(incomingEdge.source) : null
    return String(sourceNode?.data?.value || "undefined")
  }, [nodeId, getEdges, getNode])

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
            inputValue
          }
        }
      }
      return node
    }))
  }, [nodeId, getEdges, getNode, setNodes])

  const handleGenerate = useCallback(async () => {
    setIsLoading(true)
    setOutput('')
    
    try {
      const edges = getEdges()
      const incomingEdge = edges.find(edge => edge.target === nodeId)
      
      if (!incomingEdge) return
      
      const sourceNode = getNode(incomingEdge.source)
      const promptText = sourceNode?.data?.value as string
      
      if (!promptText) {
        setOutput('Error: No valid input text found')
        return
      }

      const stream = await openaiCall(
        promptText,
        selectedModel,
        systemPrompt,
        maxTokens,
        temperature
      )

      let fullResponse = ''
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          fullResponse += content
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

  return (
    <div className="bg-[#212121] rounded-lg p-3 min-w-[300px] shadow-md">
      <div className="relative">
        <Handle
          type="target"
          position={Position.Top}
          id="gpt-in"
          isConnectable={isConnectable}
          className={`!w-8 !h-8 ${
            hasInputConnection ? '!bg-[#10A37F]' : '!bg-[#10A37F]'
          } !transition-all !duration-150 cursor-grab active:cursor-grabbing hover:!bg-[#0A8F6C] 
          before:!absolute before:!inset-0 before:!rounded-full before:!transition-all before:!duration-150
          hover:before:!ring-2 hover:before:!ring-[#10A37F] hover:before:!ring-offset-2 hover:before:!ring-offset-[#212121]
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
            onValueChange={(value) => setSelectedModel(value as GPTModelType)}
          >
            <SelectTrigger className="w-[180px] bg-[#2E2E2E] border-gray-600 text-white">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="bg-[#2E2E2E] border-gray-600 text-white">
              {Object.entries(GPT_MODELS).map(([value, label]) => (
                <SelectItem key={value} value={value} className="hover:bg-gray-700">
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
            className="bg-white hover:bg-gray-200 text-gray-600 disabled:bg-gray-700 disabled:text-gray-400"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Generate
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt" className="text-white">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter system prompt..."
            className="resize-none min-h-[24px] max-h-[96px] overflow-y-auto bg-[#2E2E2E] border-gray-600 text-white placeholder:text-gray-400"
            rows={1}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Temperature: {temperature.toFixed(2)}</Label>
            <Slider
              value={[temperature]}
              onValueChange={([value]) => setTemperature(value)}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">
              Max Tokens: {maxTokens}
            </Label>
            <Slider
              value={[maxTokens]}
              onValueChange={([value]) => setMaxTokens(value)}
              max={selectedModel.startsWith('o1') ? 65536 : selectedModel.includes('4o') ? 16384 : 4096}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 border border-gray-600 rounded-lg bg-[#2E2E2E] p-3">
          <div className="font-medium text-sm text-white mb-2 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${output ? 'bg-white' : 'bg-gray-400'}`} />
            Output
          </div>
          <div className="p-3 bg-[#2E2E2E] rounded-md text-sm break-words w-[280px] max-h-[200px] overflow-y-auto border border-gray-600 text-white shadow-sm">
            {output || (
              <span className="text-gray-400 italic">No output generated yet</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <Handle
          type="source"
          position={Position.Bottom}
          id="gpt-out"
          isConnectable={isConnectable}
          className={`!w-8 !h-8 ${
            hasOutputConnection ? '!bg-[#10A37F]' : '!bg-[#10A37F]'
          } !transition-all !duration-150 cursor-grab active:cursor-grabbing hover:!bg-[#0A8F6C]
          before:!absolute before:!inset-0 before:!rounded-full before:!transition-all before:!duration-150
          hover:before:!ring-2 hover:before:!ring-[#10A37F] hover:before:!ring-offset-2 hover:before:!ring-offset-[#212121]
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