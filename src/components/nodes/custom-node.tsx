import { Handle, Position } from "reactflow";

interface CustomNodeProps {
  data: { label: string };
}

export function CustomNode({ data }: CustomNodeProps) {
  return (
    <div className="px-4 py-2 shadow-lg rounded-md bg-white border-2 border-gray-200">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
} 