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
  data,
}: EdgeProps) => {
  const { project, setEdges } = useReactFlow();
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [crossed, setCrossed] = useState(false); // Tracks if marker has crossed horizontal boundaries

  // If an external marker is provided in data, use that.
  useEffect(() => {
    if (data?.marker) {
      setMarker({ x: data.marker.x, y: data.marker.y });
    }
  }, [data?.marker]);

  // When the user clicks the path, set the marker exactly at the clicked point.
  // This always replaces any existing marker.
  const onPathClick = useCallback(
    (event: React.MouseEvent<SVGPathElement>) => {
      const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (bounds) {
        const projectedPoint = project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
        // Always update the marker to the new clicked point.
        setMarker({ x: projectedPoint.x, y: projectedPoint.y });
      }
    },
    [project]
  );

  const onMouseDown = useCallback(() => {
    if (marker) {
      setDragging(true);
    }
  }, [marker]);

  // While dragging, update the marker to follow the mouse exactly.
  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!dragging || !marker) return;
      const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (bounds) {
        const projectedPoint = project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
        setMarker({ x: projectedPoint.x, y: projectedPoint.y });
        // Check if the control point crosses the horizontal boundaries
        const minX = Math.min(sourceX, targetX);
        const maxX = Math.max(sourceX, targetX);
        setCrossed(projectedPoint.x < minX || projectedPoint.x > maxX);
      }
    },
    [dragging, marker, project, sourceX, targetX]
  );

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

  const onMarkerDoubleClick = useCallback(() => {
    setMarker(null);
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...edge.data, marker: null } } : edge
      )
    );
  }, [id, setEdges]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Default control point values.
  const defaultControlPointX = (sourceX + targetX) / 2;
  const defaultControlPointY = (sourceY + targetY) / 2;
  const controlPointX = marker ? marker.x : defaultControlPointX;
  const controlPointY = marker ? marker.y : defaultControlPointY;

  // Build the path:
  // If the marker's x is dragged outside the [sourceX, targetX] range, use a 4-line path.
  // Otherwise, use a 3-line step path.
  let path = '';
  const minX = Math.min(sourceX, targetX);
  const maxX = Math.max(sourceX, targetX);

  if (crossed) {
    path = `M${sourceX},${sourceY} H${controlPointX} V${controlPointY} H${targetX} V${targetY}`;
  } else {
    path = `M${sourceX},${sourceY} V${controlPointY} H${targetX} V${targetY}`;
  }

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={path}
        markerEnd={getMarkerEnd(markerEnd as MarkerType)}
        onClick={onPathClick}
        stroke="black"
        strokeWidth={2}
        fill="none"
      />
      {marker && (
        <circle
          cx={marker.x}
          cy={marker.y}
          r={2}
          fill="blue"
          onMouseDown={onMouseDown}
          onDoubleClick={onMarkerDoubleClick}
          className="cursor-move"
          style={{ pointerEvents: 'all' }}
        />
      )}
    </>
  );
};

export default CustomStepEdge;
