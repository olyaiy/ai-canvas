"use client";

import { Handle, Position } from "reactflow";
import { handleStyles } from "./styles";
import { nodeStyles } from "./styles";


interface BaseNodeProps {
  title: string;
  children: React.ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
}

export function BaseNode({ 
  title, 
  children, 
  hasInput = true, 
  hasOutput = true 
}: BaseNodeProps) {
  return (
    <div className={nodeStyles.base}>
      <div className={nodeStyles.title}>{title}</div>
      {hasInput && (
        <Handle 
          type="target" 
          position={Position.Top} 
          id="input"
          style={handleStyles}
        />
      )}
      {children}
      {hasOutput && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="output"
          style={handleStyles}
        />
      )}
    </div>
  );
}