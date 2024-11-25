'use client'

import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react'

interface AnimatedEdgeData {
  isGenerating?: boolean;
}

export function AnimatedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  ...props
}: EdgeProps<any>) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  const edgeClassName = data?.isGenerating 
    ? 'animate-flow-line-generating' 
    : 'animate-flow-line';

  return (
    <>
      <path
        className="react-flow__edge-path-selector"
        d={edgePath}
        fill="none"
        strokeWidth={12}
        stroke="transparent"
      />
      <BaseEdge
        path={edgePath}
        {...props}
        className={edgeClassName}
        style={{
          strokeWidth: data?.isGenerating ? 2 : 1.5,
          stroke: data?.isGenerating ? '#3b82f6' : '#94a3b8',
          strokeDasharray: '4 4',
        }}
      />
      {data?.isGenerating && (
        <BaseEdge
          path={edgePath}
          className="animate-pulse"
          style={{
            strokeWidth: 4,
            stroke: '#3b82f6',
            strokeOpacity: 0.2,
            filter: 'blur(4px)',
          }}
        />
      )}
    </>
  )
} 