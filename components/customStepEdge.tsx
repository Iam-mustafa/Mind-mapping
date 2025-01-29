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
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null); // Marker state
  const [dragging, setDragging] = useState(false);

  const onPathClick = useCallback(
    (event: React.MouseEvent) => {
      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (reactFlowBounds) {
        const x = event.clientX - reactFlowBounds.left;
        const y = event.clientY - reactFlowBounds.top;
        const projectedPoint = project({ x, y });

        // Set the marker at the clicked position
        setMarker({ x: projectedPoint.x, y: projectedPoint.y });
      }
    },
    [project]
  );

  const onMouseDown = useCallback(() => {
    if (marker) {
      setDragging(true); // Start dragging the marker
    }
  }, [marker]);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (dragging && marker) {
        const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
        if (reactFlowBounds) {
          const x = event.clientX - reactFlowBounds.left;
          const y = event.clientY - reactFlowBounds.top;
          const projectedPoint = project({ x, y });

          // Update marker position while dragging
          setMarker(projectedPoint);
        }
      }
    },
    [dragging, project, marker]
  );

  const onMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(false); // Stop dragging
      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id ? { ...edge, data: { ...edge.data, marker } } : edge
        )
      );
    }
  }, [dragging, id, marker, setEdges]);

  const onMarkerDoubleClick = useCallback(() => {
    setMarker(null); // Remove the marker on double-click
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...edge.data, marker: null } } : edge
      )
    );
  }, [id, setEdges]);

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

  // Default control points (if no marker is set)
  const defaultControlPointX = (sourceX + targetX) / 2;
  const defaultControlPointY = (sourceY + targetY) / 2;
  
  // Smooth step logic for right-angle corner
  const controlPointX = marker ? marker.x : defaultControlPointX;
  const controlPointY = marker ? marker.y : defaultControlPointY;

  // Smoothstep path (right-angle)
  const smoothStepPath = `M${sourceX},${sourceY} H${controlPointX} V${controlPointY} H${targetX} V${targetY}`;

  return (
    <>
      {/* Render the main path */}
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={smoothStepPath}
        markerEnd={getMarkerEnd(markerEnd as MarkerType)}
        onClick={onPathClick} // Allow adding a marker on click
      />
      {/* Render the marker if it exists */}
      {marker && (
        <circle
          cx={marker.x}
          cy={marker.y}
          r={2}
          fill="blue"
          onMouseDown={onMouseDown} // Allow dragging the marker
          onDoubleClick={onMarkerDoubleClick} // Remove marker on double-click
          className="cursor-move"
        />
      )}
    </>
  );
};

export default CustomStepEdge;
