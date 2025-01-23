import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { DiagramNode, DiagramEdge } from '../types/diagram'

interface PropertiesPanelProps {
  selected: DiagramNode | DiagramEdge | null
  onChange: (updated: DiagramNode | DiagramEdge) => void
}

export function PropertiesPanel({ selected, onChange }: PropertiesPanelProps) {
  if (!selected) {
    return (
      <Card className="w-64 p-4 m-4">
        <p className="text-muted-foreground">Select an element to edit its properties</p>
      </Card>
    )
  }

  const isEdge = 'source' in selected

  return (
    <Card className="w-64 p-4 m-4 space-y-4">
      <h2 className="text-lg font-bold">Properties</h2>
      <div className="space-y-4">
        {!isEdge && (
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={selected.data?.label || ''}
              onChange={(e) =>
                onChange({
                  ...selected,
                  data: { ...selected.data, label: e.target.value },
                })
              }
            />
          </div>
        )}
        {!isEdge && 'subLabel' in selected.data && (
          <div className="space-y-2">
            <Label>Sub Label</Label>
            <Input
              value={selected.data.subLabel || ''}
              onChange={(e) =>
                onChange({
                  ...selected,
                  data: { ...selected.data, subLabel: e.target.value },
                })
              }
            />
          </div>
        )}
        {isEdge && (
          <>
            <div className="space-y-2">
              <Label>Edge Type</Label>
              <Select
                value={selected.type}
                onValueChange={(value) =>
                  onChange({ ...selected, type: value as DiagramEdge['type'] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select edge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Curved (Default)</SelectItem>
                  <SelectItem value="straight">Straight</SelectItem>
                  <SelectItem value="step">Right Angle</SelectItem>
                  <SelectItem value="smoothstep">Smooth Right Angle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="arrow"
                checked={selected.markerEnd === 'arrow'}
                onCheckedChange={(checked) =>
                  onChange({ ...selected, markerEnd: checked ? 'arrow' : undefined })
                }
              />
              <Label htmlFor="arrow">Arrow</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="animated"
                checked={selected.animated}
                onCheckedChange={(checked) =>
                  onChange({ ...selected, animated: checked as boolean })
                }
              />
              <Label htmlFor="animated">Animated</Label>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

