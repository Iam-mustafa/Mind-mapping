import React, { useState, useCallback, useEffect } from 'react';
import { EdgeProps, getSmoothStepPath, useReactFlow } from 'reactflow';

const DraggableSmoothStepEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const { setEdges } = useReactFlow();
  const [isDragging, setIsDragging] = useState(false);

  // Get initial control point or calculate default
  const initialControl = data?.controlPoint || {
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2,
  };
  const [controlPoint, setControlPoint] = useState(initialControl);

  // Use React Flow's smooth step path utility
  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    centerX: controlPoint.x, // Dynamically position the control point
    centerY: controlPoint.y,
  })[0];

  // Mouse down handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // Update control point and persist to edge data
  useEffect(() => {
    setEdges(edges =>
      edges.map(edge =>
        edge.id === id ? { ...edge, data: { ...edge.data, controlPoint } } : edge
      )
    );
  }, [controlPoint, id, setEdges]);

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const svg = document.querySelector('svg.react-flow__renderer') as SVGSVGElement;
      if (!svg) return;

      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;

      const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse() || new DOMMatrix());
      setControlPoint({
        x: transformedPoint.x,
        y: transformedPoint.y,
      });
    },
    [isDragging]
  );

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Manage mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <>
      {/* Smooth Step Edge Path */}
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* Draggable Control Point */}
      <circle
        cx={controlPoint.x}
        cy={controlPoint.y}
        r={3}
        fill="blue"
        stroke="black"
        strokeWidth={1}
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move', pointerEvents: 'all' }}
      />
    </>
  );
};

export default DraggableSmoothStepEdge;
