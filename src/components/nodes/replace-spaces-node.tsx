"use client";

import { BaseNode } from "./base-node";
import { nodeStyles } from "./styles";

interface ReplaceSpacesNodeProps {
  data: {
    input: string;
  };
}

export function ReplaceSpacesNode({ data }: ReplaceSpacesNodeProps) {
  const output = data.input.replace(/\s+/g, '-');
  
  return (
    <BaseNode title="Replace Spaces">
      <div className={nodeStyles.content}>Input: {data.input}</div>
      <div className={nodeStyles.output}>Output: {output}</div>
    </BaseNode>
  );
}