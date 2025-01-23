import { memo } from 'react'
import { Handle, Position } from 'reactflow'

const nodeStyles = {
  rectangle: 'rounded-md',
  ellipse: 'rounded-full',
  diamond: 'rotate-45',
  parallelogram: 'skew-x-12',
}

function CustomNode({ data, type }: { data: { label: string; subLabel?: string }, type: string }) {
  const shapeClass = nodeStyles[type as keyof typeof nodeStyles] || ''

  return (
    <div className={`px-4 py-2 shadow-md bg-white border ${shapeClass}`}>
      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <div className={`flex flex-col ${type === 'diamond' ? '-rotate-45' : ''}`}>
        <div className="text-lg font-bold">{data.label}</div>
        {data.subLabel && (
          <div className="text-sm text-gray-500">{data.subLabel}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  )
}

export default memo(CustomNode)

