import React, { useState, useCallback, useEffect } from 'react';
import { EdgeProps, useReactFlow } from 'reactflow';

const DraggableStepEdge: React.FC<EdgeProps> = ({
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
  const [showControlPoint, setShowControlPoint] = useState(false);

  // Get initial control point or calculate default
  const initialControl = data?.controlPoint || {
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2,
  };
  const [controlPoint, setControlPoint] = useState(initialControl);

  // Calculate custom smooth step path
  const edgePath = React.useMemo(() => {
    const horizontal = Math.abs(targetX - sourceX) > Math.abs(targetY - sourceY);
    const bendPosition = data?.bendPosition || controlPoint;

    if (horizontal) {
      return `M ${sourceX},${sourceY} L ${bendPosition.x},${sourceY} L ${bendPosition.x},${targetY} L ${targetX},${targetY}`;
    }
    return `M ${sourceX},${sourceY} L ${sourceX},${bendPosition.y} L ${targetX},${bendPosition.y} L ${targetX},${targetY}`;
  }, [sourceX, sourceY, targetX, targetY, controlPoint, data?.bendPosition]);

  // Handle mouse down on control point
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // Handle double-click on control point to delete it
  const handleControlPointDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowControlPoint(false); // Hide the control point
  }, []);

  // Handle path click to toggle control point visibility
  const handlePathClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowControlPoint((prev) => !prev); // Toggle visibility
  }, []);

  // Update edge data when control point changes
  useEffect(() => {
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...edge.data, controlPoint } } : edge
      )
    );
  }, [controlPoint, id, setEdges]);

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const svg = document.querySelector('svg.react-flow__edges') as SVGSVGElement;
      if (!svg) return;

      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;

      const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse() || new DOMMatrix());

      setControlPoint({
        x: svgPoint.x,
        y: svgPoint.y,
      });
    },
    [isDragging]
  );

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listener management
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
      {/* Path for the edge */}
      <path
        id={id}
        style={{ ...style, cursor: 'move' }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onClick={handlePathClick} // Handle path click to toggle control point
      />
      {/* Control Point (conditionally rendered) */}
      {showControlPoint && (
        <circle
          cx={controlPoint.x}
          cy={controlPoint.y}
          r={3}
          fill="blue"
          stroke="#555"
          strokeWidth={1}
          onMouseDown={handleMouseDown} // Drag behavior
          onDoubleClick={handleControlPointDoubleClick} // Delete on double-click
          className="cursor-move edge-control-point"
          style={{ pointerEvents: 'all' }}
        />
      )}
    </>
  );
};

export default DraggableStepEdge;
