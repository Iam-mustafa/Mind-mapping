export interface DiagramNode {
  id: string
  type: 'default' | 'rectangle' | 'ellipse' | 'diamond' | 'parallelogram'
  position: { x: number; y: number }
  data: { 
    label: string
    subLabel?: string
  }
  style?: React.CSSProperties
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  label?: string
  type: 'default' | 'straight' | 'step' | 'smoothstep'
  animated?: boolean
  style?: React.CSSProperties
  markerEnd?: string
  data?: {
    marker?: { x: number; y: number } | null
  }
}

export interface DiagramData {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}
