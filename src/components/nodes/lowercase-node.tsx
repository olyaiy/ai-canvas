"use client";

import { BaseNode } from "./base-node";
import { nodeStyles } from "./styles";

interface LowercaseNodeProps {
  data: {
    input: string;
  };
}

export function LowercaseNode({ data }: LowercaseNodeProps) {
  const output = data.input.toLowerCase();
  
  return (
    <BaseNode title="Lowercase">
      <div className={nodeStyles.content}>Input: {data.input}</div>
      <div className={nodeStyles.output}>Output: {output}</div>
    </BaseNode>
  );
}