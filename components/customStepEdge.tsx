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

  useEffect(() => {
    if (data?.marker) {
      setMarker({ x: data.marker.x, y: data.marker.y });
    }
  }, [data?.marker]);

  const onPathClick = useCallback(
    (event: React.MouseEvent<SVGPathElement>) => {
      if (marker) return;

      const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (bounds) {
        const projectedPoint = project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        setMarker({
          x: (sourceX + targetX) / 2,
          y: (sourceY + targetY) / 2,
        });
      }
    },
    [marker, project, sourceX, sourceY, targetX, targetY]
  );

  const onMouseDown = useCallback(() => {
    if (marker) {
      setDragging(true);
    }
  }, [marker]);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!dragging || !marker) return;

      const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (bounds) {
        const projectedPoint = project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        // Detect if the control point crosses the corners
        const hasCrossed =
          projectedPoint.x < Math.min(sourceX, targetX) || projectedPoint.x > Math.max(sourceX, targetX);

        setCrossed(hasCrossed);
        setMarker({ x: projectedPoint.x, y: projectedPoint.y });
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

  // Default control point
  const defaultControlPointX = (sourceX + targetX) / 2;
  const defaultControlPointY = (sourceY + targetY) / 2;
  const controlPointX = marker ? marker.x : defaultControlPointX;
  const controlPointY = marker ? marker.y : defaultControlPointY;

  // Define the path transformation based on crossing state
  let path = '';

  if (crossed) {
    // 4-line path when marker crosses horizontal boundaries
    path = `M${sourceX},${sourceY} H${controlPointX} V${controlPointY} H${targetX} V${targetY}`;
  } else {
    // Default 3-line path (Vertical → Horizontal → Vertical)
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
