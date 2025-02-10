import React, { useState, useCallback, useEffect } from 'react';
import { EdgeProps, getMarkerEnd, MarkerType, useReactFlow } from 'reactflow';

const CustomSmoothStepEdge = ({
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
  const [crossed, setCrossed] = useState(false); // Whether the marker.x is outside [minX, maxX]

  // If an external marker is provided in data, use that.
  useEffect(() => {
    if (data?.marker) {
      setMarker({ x: data.marker.x, y: data.marker.y });
    }
  }, [data?.marker]);

  // When the user clicks the edge, create a control point exactly at the clicked location.
  const onPathClick = useCallback(
    (event: React.MouseEvent<SVGPathElement>) => {
      // Always update the marker to the new clicked point.
      const bounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (bounds) {
        const projectedPoint = project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
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

  // While dragging, update the marker position freely in all directions.
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

  // Default control point if no marker exists.
  const defaultControlPointX = (sourceX + targetX) / 2;
  const defaultControlPointY = (sourceY + targetY) / 2;
  const controlPointX = marker ? marker.x : defaultControlPointX;
  const controlPointY = marker ? marker.y : defaultControlPointY;

  // Calculate directional signs.
  const dirXSourceToControl = controlPointX - sourceX > 0 ? 1 : -1;
  const dirYControlVertical = controlPointY - sourceY > 0 ? 1 : -1;
  const dirXControlToTarget = targetX - controlPointX > 0 ? 1 : -1;
  const dirYTargetVertical = targetY - controlPointY > 0 ? 1 : -1;

  // Define a base curve radius.
  const curveRadius = 5; // Adjust for smoother/sharper curves.
  // Dynamically reduce radius to avoid overlap.
  const dynamicCurveRadius = Math.min(
    curveRadius,
    Math.abs(targetX - controlPointX) / 2,
    Math.abs(targetY - controlPointY) / 2
  );

  // Calculate key points for the curved corners.
  const horizontalEndX = controlPointX - dirXSourceToControl * curveRadius;
  const verticalStartY = sourceY + dirYControlVertical * curveRadius;
  const verticalEndY = controlPointY - dirYControlVertical * curveRadius;
  const horizontalStartX = controlPointX + dirXControlToTarget * curveRadius;

  // For the final connection, adjust using dynamic radius.
  const horizontalEndTargetX = targetX - dirXControlToTarget * dynamicCurveRadius;
  const verticalTargetStartY = controlPointY + dirYTargetVertical * dynamicCurveRadius;

  // Build the path:
  // If the control point is within the horizontal bounds (not "crossed"), use a 3-segment path:
  //   Vertical from (sourceX, sourceY) to near controlY, then horizontal from sourceX to targetX,
  //   then vertical to (targetX, targetY), with curved corners.
  // If crossed, use a 4-segment path that uses the marker's x and y explicitly.
  let path = '';

  const minX = Math.min(sourceX, targetX);
  const maxX = Math.max(sourceX, targetX);

  if (!crossed) {
    // 3-line curved path (Vertical → Horizontal → Vertical)
    path = `
      M${sourceX},${sourceY}
      L${sourceX},${controlPointY - dirYControlVertical * curveRadius}
      Q${sourceX},${controlPointY} ${sourceX + dirXSourceToControl * curveRadius},${controlPointY}
      L${targetX - dirXControlToTarget * curveRadius},${controlPointY}
      Q${targetX},${controlPointY} ${targetX},${controlPointY + dirYTargetVertical * curveRadius}
      L${targetX},${targetY}
    `;
  } else {
    // 4-line curved path (Horizontal → Vertical → Horizontal → Vertical)
    path = `
      M${sourceX},${sourceY}
      L${horizontalEndX},${sourceY}
      Q${controlPointX},${sourceY} ${controlPointX},${verticalStartY}
      L${controlPointX},${verticalEndY}
      Q${controlPointX},${controlPointY} ${horizontalStartX},${controlPointY}
      L${horizontalEndTargetX},${controlPointY}
      Q${targetX},${controlPointY} ${targetX},${verticalTargetStartY}
      L${targetX},${targetY}
    `;
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
          stroke="black"
          strokeWidth={1.5}
          onMouseDown={onMouseDown}
          onDoubleClick={onMarkerDoubleClick}
          className="cursor-move"
          style={{ pointerEvents: 'all' }}
        />
      )}
    </>
  );
};

export default CustomSmoothStepEdge;
