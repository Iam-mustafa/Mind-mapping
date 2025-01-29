'use client'

import { useState, useCallback } from 'react'
import ReactFlow, {
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
  addEdge,
  MarkerType,
  EdgeTypes,
  BezierEdge,
  StraightEdge,
  StepEdge,
  SmoothStepEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card } from '@/components/ui/card'
import { Toolbar } from './toolbar'
import { PropertiesPanel } from './properties-panel'
import CustomNode from './custom-node'
import type { DiagramNode, DiagramEdge } from '../types/diagram'
import CustomBezierEdge from './custom-bezeir-edge';
import CustomSmoothStepEdge from './customSmoothStepEdge'
import CustomStepEdge from './customStepEdge'

const nodeTypes = {
  rectangle: CustomNode,
  ellipse: CustomNode,
  diamond: CustomNode,
  parallelogram: CustomNode,
};

const edgeTypes: EdgeTypes = {
  default: CustomBezierEdge,
  straight: StraightEdge,
  step: CustomStepEdge,
  smoothstep: CustomSmoothStepEdge,
}

export default function DiagramEditor() {
  const [nodes, setNodes] = useState<DiagramNode[]>([])
  const [edges, setEdges] = useState<DiagramEdge[]>([])
  const [selectedElement, setSelectedElement] = useState<DiagramNode | DiagramEdge | null>(null)

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds):any => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds):any => applyEdgeChanges(changes, eds)),
    []
  )

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds):any => addEdge({ 
        ...params,
      type: 'default',
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds)),
    []
  )

  const onElementClick = useCallback((event: React.MouseEvent, element: any) => {
    setSelectedElement(element)
  }, [])

  const addNode = useCallback((type: string | any) => {
    const newNode: DiagramNode = {
      id: `node-${nodes.length + 1}`,
      type,
      position: { x: 100, y: 100 },
      data: { label: `${type} ${nodes.length + 1}` },
    }
    setNodes((nds) => [...nds, newNode])
  }, [nodes])

  return (
    <div className="flex h-screen">
      <Toolbar onAddNode={addNode} />
      <div className="flex-1 h-full">
        <Card className="h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onElementClick}
            onEdgeClick={onElementClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </Card>
      </div>
      <PropertiesPanel
        selected={selectedElement}
        onChange={(updated) => {
          if ('source' in updated) {
            setEdges((eds) =>
              eds.map((edge) => (edge.id === updated.id ? updated : edge))
            )
          } else {
            setNodes((nds) =>
              nds.map((node) => (node.id === updated.id ? updated : node))
            )
          }
        }}
      />
    </div>
  )
}

