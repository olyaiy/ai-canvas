'use client'

import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react'

export function AnimatedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: '#94a3b8',
        strokeDasharray: 5,
        animation: 'flow 1s linear infinite',
      }}
    />
  )
} 