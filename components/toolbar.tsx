import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Square, Circle, Diamond, Hexagon } from 'lucide-react'

interface ToolbarProps {
  onAddNode: (type: string) => void
}

export function Toolbar({ onAddNode }: ToolbarProps) {
  return (
    <Card className="w-64 p-4 m-4 space-y-4">
      <h2 className="text-lg font-bold mb-4">Tools</h2>
      <div className="grid gap-2">
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => onAddNode('rectangle')}
        >
          <Square className="w-4 h-4 mr-2" />
          Rectangle
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => onAddNode('ellipse')}
        >
          <Circle className="w-4 h-4 mr-2" />
          Ellipse
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => onAddNode('diamond')}
        >
          <Diamond className="w-4 h-4 mr-2" />
          Diamond
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => onAddNode('parallelogram')}
        >
          <Hexagon className="w-4 h-4 mr-2" />
          Parallelogram
        </Button>
      </div>
    </Card>
  )
}

