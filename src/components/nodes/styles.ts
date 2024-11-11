export const handleStyles: React.CSSProperties = {
  width: '15px',
  height: '15px',
  background: '#4f46e5',
  border: '2px solid #312e81',
} as const;

export const nodeStyles = {
  base: "bg-white rounded-lg shadow-lg p-4 min-w-[200px]",
  title: "font-semibold mb-2",
  content: "text-sm mb-2",
  output: "text-sm font-medium",
} as const; 