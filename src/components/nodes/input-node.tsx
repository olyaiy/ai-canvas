"use client";

import { Input } from "@/components/ui/input";
import { BaseNode } from "./base-node";
import { nodeStyles } from "./styles";

interface InputNodeProps {
  data: {
    value: string;
    onChange: (value: string) => void;
  };
}

export function InputNode({ data }: InputNodeProps) {
  return (
    <BaseNode title="Input Text" hasInput={false}>
      <Input 
        value={data.value}
        onChange={(e) => data.onChange(e.target.value)}
        placeholder="Type something..."
      />
    </BaseNode>
  );
}