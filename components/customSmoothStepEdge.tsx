import React, { useState, useCallback, useEffect } from 'react';
import { EdgeProps, getMarkerEnd, MarkerType, useReactFlow } from 'reactflow';

const CustomStepEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const { project, setEdges } = useReactFlow();
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // 📌 Set marker position on path click
  const onPathClick = useCallback(
    (event: React.MouseEvent<SVGPathElement>) => {
      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (reactFlowBounds) {
        const x = event.clientX - reactFlowBounds.left;
        const y = event.clientY - reactFlowBounds.top;
        const projectedPoint = project({ x, y });

        // Set control point where user clicks
        setMarker({ x: projectedPoint.x, y: projectedPoint.y });
      }
    },
    [project]
  );

  // 📌 Start dragging
  const onMouseDown = useCallback(() => {
    if (marker) setDragging(true);
  }, [marker]);

  // 📌 Update marker position while dragging (free movement)
  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!dragging) return;

      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (reactFlowBounds) {
        const x = event.clientX - reactFlowBounds.left;
        const y = event.clientY - reactFlowBounds.top;
        const projectedPoint = project({ x, y });

        // Update control point position
        setMarker({ x: projectedPoint.x, y: projectedPoint.y });
      }
    },
    [dragging, project]
  );

  // 📌 Stop dragging and update edge data
  const onMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(false);
      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id ? { ...edge, data: { ...edge.data, marker } } : edge
        )
      );
    }
  }, [dragging, id, marker, setEdges]);

  // 📌 Remove control point on double-click
  const onMarkerDoubleClick = useCallback(() => {
    setMarker(null);
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...edge.data, marker: null } } : edge
      )
    );
  }, [id, setEdges]);

  // 📌 Attach & detach event listeners dynamically
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  // 📌 Default control point (if marker isn't set)
  const defaultControlPointX = (sourceX + targetX) / 2;
  const defaultControlPointY = (sourceY + targetY) / 2;

  // 📌 Use marker position if set, otherwise use default midpoint
  const controlPointX = marker ? marker.x : defaultControlPointX;
  const controlPointY = marker ? marker.y : defaultControlPointY;

  // 📌 Curve radius (smooth rounding effect)
  const curveRadius = 15; // Adjust for smoother or sharper curves

  // 📌 Smooth step path with rounded corners using quadratic Bézier curves
  const smoothStepPath = `
    M${sourceX},${sourceY} 
    L${controlPointX - curveRadius},${sourceY}
    Q${controlPointX},${sourceY} ${controlPointX},${sourceY + curveRadius}
    L${controlPointX},${controlPointY - curveRadius}
    Q${controlPointX},${controlPointY} ${controlPointX + curveRadius},${controlPointY}
    L${targetX - curveRadius},${controlPointY}
    Q${targetX},${controlPointY} ${targetX},${controlPointY + curveRadius}
    L${targetX},${targetY}
  `;

  return (
    <>
      {/* Render the main path */}
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={smoothStepPath}
        markerEnd={getMarkerEnd(markerEnd as MarkerType)}
        onClick={onPathClick} // ✅ Adds a control point where the user clicks
        stroke="black"
        strokeWidth={2}
        fill="none"
      />
      
      {/* Render the control point if it exists */}
      {marker && (
        <circle
          cx={marker.x}
          cy={marker.y}
          r={2}
          fill="blue"
          stroke="black"
          strokeWidth={1.5}
          onMouseDown={onMouseDown} // ✅ Enables dragging
          onDoubleClick={onMarkerDoubleClick} // ✅ Removes control point on double-click
          style={{ cursor: 'move' }}
        />
      )}
    </>
  );
};

export default CustomStepEdge;
