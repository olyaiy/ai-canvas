'use client'

import { BaseEdge, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  source,
  target,
}: EdgeProps) {
  const { getNode } = useReactFlow()
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const sourceNode = getNode(source)
  const targetNode = getNode(target)
  
  const outputValue = typeof sourceNode?.data?.value === 'object' 
    ? JSON.stringify(sourceNode?.data?.value, null, 2)
    : String(sourceNode?.data?.value || 'No output value')
  
  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          <g className="group">
            <path
              className="react-flow__edge-path-selector"
              d={edgePath}
              fill="none"
              strokeWidth={20}
              stroke="transparent"
            />
            <BaseEdge
              path={edgePath}
              markerEnd={markerEnd}
              style={{
                ...style,
                strokeWidth: 3.5,
                stroke: '#94a3b8',
                strokeDasharray: 8,
                animation: 'flow 1s linear infinite',
                filter: 'drop-shadow(0 0 2px transparent)',
              }}
              className="group-hover:!stroke-blue-400 group-hover:!filter-[drop-shadow(0_0_4px_#60a5fa)] transition-all duration-300"
            />
          </g>
        </HoverCardTrigger>
        <HoverCardContent 
          className="w-80 bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg"
          side="top"
          align="center"
          sideOffset={5}
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Connection Details</h4>
              <div className="text-sm text-muted-foreground">
                From: {sourceNode?.type} → To: {targetNode?.type}
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Output Value</h4>
              <div className="max-h-[100px] overflow-y-auto rounded-md bg-muted p-2">
                <pre className="text-xs">
                  {outputValue}
                </pre>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </>
  )
} 