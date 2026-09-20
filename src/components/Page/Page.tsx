import React, { useEffect, useRef, useState } from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { TypeShape, Point, TextShape, EditState } from '../../types/shape';
import { generateControlHandles, getShapeCenter, getGroupBoundingBox, generateGroupControlHandles } from '../../services/shapeUtils';
import styles from './Page.module.scss';

interface TextItemProps {
  shape: TextShape;
  isSelected: boolean;
  onUpdateContent: (id: string, newContent: string, saveHistory?: boolean) => void;
  onSelect: (id: string) => void;
}

const TextItem: React.FC<TextItemProps> = ({
  shape,
  isSelected,
  onUpdateContent,
  onSelect,
}) => {
  const editableRef = useRef<HTMLDivElement>(null);

  // Synchronize DOM innerHTML only when NOT focused (e.g. initial mount or Undo/Redo)
  useEffect(() => {
    if (editableRef.current) {
      if (
        document.activeElement !== editableRef.current &&
        editableRef.current.innerHTML !== (shape.content || '')
      ) {
        editableRef.current.innerHTML = shape.content || '';
      }
    }
  }, [shape.content, shape.id]);

  // Auto focus text element and place caret when created or selected
  useEffect(() => {
    if (isSelected && editableRef.current) {
      const el = editableRef.current;
      if (document.activeElement !== el) {
        const timer = setTimeout(() => {
          if (!el) return;
          el.focus();
          try {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch (e) {
            // ignore selection error if element is unmounted
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isSelected]);

  const borderStyle = shape.stroke && shape.stroke !== 'none' ? 'solid' : 'none';
  const borderColor = shape.stroke || 'transparent';
  const borderWidth = `${shape.strokeWidth || 0}px`;

  return (
    <foreignObject
      data-shape-id={shape.id}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      style={{ overflow: 'visible', pointerEvents: 'auto' }}
      onPointerDown={(e) => {
        // Prevent canvas drag from overriding text focus
        e.stopPropagation();
        onSelect(shape.id);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent:
            shape.verticalAlign === 'middle'
              ? 'center'
              : shape.verticalAlign === 'bottom'
              ? 'flex-end'
              : 'flex-start',
          textAlign: (shape.textAlign as any) || 'left',
          fontSize: `${shape.fontSize || 12}px`,
          color: shape.color || '#000000',
          opacity: shape.opacity ?? 1,
          borderStyle,
          borderColor,
          borderWidth,
          background: shape.fill && shape.fill !== 'none' ? shape.fill : 'transparent',
          outline: 'none',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          boxSizing: 'border-box',
          cursor: 'text',
          pointerEvents: 'auto',
          overflow: 'hidden',
          wordBreak: 'break-word',
          margin: 0,
          padding: '2px',
        }}
        onInput={(e) => {
          onUpdateContent(shape.id, e.currentTarget.innerHTML, false);
        }}
        onBlur={(e) => {
          onUpdateContent(shape.id, e.currentTarget.innerHTML, true);
        }}
        onKeyDown={(e) => {
          // Prevent canvas global shortcuts while typing
          e.stopPropagation();
        }}
      />
    </foreignObject>
  );
};

const renderArrowHead = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  strokeColor: string,
  strokeWidth: number,
  opacity: number
) => {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const headLength = Math.max(Number(strokeWidth) * 3 + 8, 14);
  const arrowAngle = Math.PI / 6;

  const p1X = toX - headLength * Math.cos(angle - arrowAngle);
  const p1Y = toY - headLength * Math.sin(angle - arrowAngle);
  const p2X = toX - headLength * Math.cos(angle + arrowAngle);
  const p2Y = toY - headLength * Math.sin(angle + arrowAngle);

  return (
    <polygon
      points={`${toX},${toY} ${p1X},${p1Y} ${p2X},${p2Y}`}
      fill={strokeColor}
      opacity={opacity}
    />
  );
};

export const Page: React.FC = () => {
  const {
    shapes,
    selectedShapeId,
    selectedShapeIds,
    activeTool,
    viewBox,
    marqueeRect,
    updateScreenSize,
    startDrawingOrEditing,
    handleMouseMove,
    handleMouseUp,
    updateShapeProperties,
    selectShape,
    setPan,
    zoomAtPoint,
  } = useWhiteboard();

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Middle-click scroll wheel pan gesture state
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initViewBoxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      updateScreenSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScreenSize]);

  // Ctrl + Scroll wheel pointer-centered zoom listener
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = svgEl.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        // e.deltaY < 0 is scroll up (zoom in), e.deltaY > 0 is scroll down (zoom out)
        const zoomIn = e.deltaY < 0;
        zoomAtPoint({ x: cursorX, y: cursorY }, zoomIn, false, e.deltaY);
      }
    };

    svgEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      svgEl.removeEventListener('wheel', handleWheel);
    };
  }, [zoomAtPoint]);

  const getCanvasPoint = (e: React.PointerEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * viewBox.zoom + viewBox.x,
      y: (e.clientY - rect.top) * viewBox.zoom + viewBox.y,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Middle click (scroll wheel press) triggers canvas pan gesture
    if (e.button === 1) {
      e.preventDefault();
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      initViewBoxRef.current = { x: viewBox.x, y: viewBox.y };
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
      return;
    }

    // Only handle primary mouse button or touch for drawing/editing
    if (e.button !== 0) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
    const point = getCanvasPoint(e);
    startDrawingOrEditing(point, e.target as Element);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanningRef.current) {
      const dx = (e.clientX - panStartRef.current.x) * viewBox.zoom;
      const dy = (e.clientY - panStartRef.current.y) * viewBox.zoom;
      setPan(initViewBoxRef.current.x - dx, initViewBoxRef.current.y - dy);
      return;
    }
    const point = getCanvasPoint(e);
    handleMouseMove(point);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
      return;
    }
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
    const point = getCanvasPoint(e);
    handleMouseUp(point, 100);
  };

  const viewBoxString = `${viewBox.x} ${viewBox.y} ${viewBox.screenWidth * viewBox.zoom} ${viewBox.screenHeight * viewBox.zoom}`;

  const isMultiSelection = selectedShapeIds.length > 1;
  const singleSelectedShape = selectedShapeIds.length === 1 ? shapes.find((s) => s.id === selectedShapeIds[0]) : null;
  const singleSelectedCenter = singleSelectedShape ? getShapeCenter(singleSelectedShape) : null;

  let activeHandles: ReturnType<typeof generateControlHandles> = [];
  if (isMultiSelection) {
    const selectedShapes = shapes.filter((s) => selectedShapeIds.includes(s.id));
    const groupBbox = getGroupBoundingBox(selectedShapes);
    activeHandles = generateGroupControlHandles(groupBbox);
  } else if (singleSelectedShape) {
    activeHandles = generateControlHandles(singleSelectedShape);
  }

  return (
    <svg
      ref={svgRef}
      className={styles.canvas}
      viewBox={viewBoxString}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseDown={(e) => {
        if (e.button === 1) e.preventDefault();
      }}
      onAuxClick={(e) => e.preventDefault()}
      style={{ cursor: isPanning ? 'grabbing' : undefined }}
    >
      <g id="canvas">
        {shapes.map((shape) => {
          const center = getShapeCenter(shape);
          const transformStr = shape.rotation
            ? `rotate(${shape.rotation}, ${center.x}, ${center.y})`
            : undefined;

          switch (shape.type) {
            case TypeShape.RECT:
              return (
                <rect
                  key={shape.id}
                  data-shape-id={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  stroke={shape.stroke || 'black'}
                  fill={shape.fill && shape.fill !== 'none' ? shape.fill : 'transparent'}
                  strokeWidth={shape.strokeWidth ?? 1}
                  strokeOpacity={shape.strokeOpacity ?? 1}
                  fillOpacity={shape.fillOpacity ?? 1}
                  transform={transformStr}
                  style={{ cursor: activeTool === null ? 'move' : 'default', pointerEvents: 'all' }}
                />
              );
            case TypeShape.ELLIPSE:
              return (
                <ellipse
                  key={shape.id}
                  data-shape-id={shape.id}
                  cx={shape.cx}
                  cy={shape.cy}
                  rx={shape.rx}
                  ry={shape.ry}
                  stroke={shape.stroke || 'black'}
                  fill={shape.fill && shape.fill !== 'none' ? shape.fill : 'transparent'}
                  strokeWidth={shape.strokeWidth ?? 1}
                  strokeOpacity={shape.strokeOpacity ?? 1}
                  fillOpacity={shape.fillOpacity ?? 1}
                  transform={transformStr}
                  style={{ cursor: activeTool === null ? 'move' : 'default', pointerEvents: 'all' }}
                />
              );
            case TypeShape.LINE:
            case TypeShape.ARROW:
              return (
                <g
                  key={shape.id}
                  data-shape-id={shape.id}
                  transform={transformStr}
                  style={{ cursor: activeTool === null ? 'move' : 'default' }}
                >
                  {/* Thick transparent hit area for easy grabbing */}
                  <line
                    x1={shape.x1}
                    y1={shape.y1}
                    x2={shape.x2}
                    y2={shape.y2}
                    stroke="transparent"
                    strokeWidth={Math.max(Number(shape.strokeWidth || 1), 16)}
                  />
                  <line
                    x1={shape.x1}
                    y1={shape.y1}
                    x2={shape.x2}
                    y2={shape.y2}
                    stroke={shape.stroke || 'black'}
                    strokeWidth={shape.strokeWidth ?? 1}
                    strokeOpacity={shape.strokeOpacity ?? 1}
                  />
                  {shape.markerEnd &&
                    renderArrowHead(
                      shape.x1,
                      shape.y1,
                      shape.x2,
                      shape.y2,
                      shape.stroke || 'black',
                      Number(shape.strokeWidth || 1),
                      Number(shape.strokeOpacity ?? 1)
                    )}
                  {shape.markerStart &&
                    renderArrowHead(
                      shape.x2,
                      shape.y2,
                      shape.x1,
                      shape.y1,
                      shape.stroke || 'black',
                      Number(shape.strokeWidth || 1),
                      Number(shape.strokeOpacity ?? 1)
                    )}
                </g>
              );
            case TypeShape.POLYLINE:
              return (
                <g
                  key={shape.id}
                  data-shape-id={shape.id}
                  transform={transformStr}
                  style={{ cursor: activeTool === null ? 'move' : 'default' }}
                >
                  {/* Thick transparent hit area for easy grabbing */}
                  <polyline
                    points={shape.points}
                    stroke="transparent"
                    fill="none"
                    strokeWidth={Math.max(Number(shape.strokeWidth || 1), 14)}
                  />
                  <polyline
                    points={shape.points}
                    stroke={shape.stroke || 'black'}
                    fill="none"
                    strokeWidth={shape.strokeWidth ?? 1}
                    strokeOpacity={shape.strokeOpacity ?? 1}
                  />
                </g>
              );
            case TypeShape.TEXT:
              return (
                <g key={shape.id} transform={transformStr}>
                  <TextItem
                    shape={shape}
                    isSelected={shape.id === selectedShapeId}
                    onSelect={selectShape}
                    onUpdateContent={(id, content, saveHistory) =>
                      updateShapeProperties(id, { content }, !saveHistory)
                    }
                  />
                </g>
              );
            default:
              return null;
          }
        })}
      </g>

      {/* Marquee Selection Rectangle Box */}
      {marqueeRect && (
        <rect
          x={marqueeRect.x}
          y={marqueeRect.y}
          width={marqueeRect.width}
          height={marqueeRect.height}
          fill="rgba(33, 150, 243, 0.12)"
          stroke="#2196f3"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Selection Control Handles */}
      <g id="controls">
        {activeHandles.length > 0 && (
          <g
            transform={
              !isMultiSelection && singleSelectedShape && singleSelectedShape.rotation && singleSelectedCenter
                ? `rotate(${singleSelectedShape.rotation}, ${singleSelectedCenter.x}, ${singleSelectedCenter.y})`
                : undefined
            }
          >
            {activeHandles.map((handle) => {
              if (handle.editState === EditState.ROTATE) {
                return (
                  <g key={handle.id}>
                    {handle.stemY !== undefined && (
                      <line
                        x1={handle.x}
                        y1={handle.stemY}
                        x2={handle.x}
                        y2={handle.y}
                        stroke="#2196f3"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}
                    <circle
                      data-secondary="true"
                      data-state={handle.editState}
                      cx={handle.x}
                      cy={handle.y}
                      r="9"
                      fill="#4caf50"
                      stroke="#ffffff"
                      strokeWidth="2"
                      style={{ cursor: handle.cursor }}
                    />
                    <path
                      data-secondary="true"
                      data-state={handle.editState}
                      d={`M ${handle.x - 4} ${handle.y - 1} A 4 4 0 1 1 ${handle.x + 4} ${handle.y - 1}`}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      style={{ pointerEvents: 'none' }}
                    />
                    <polygon
                      data-secondary="true"
                      data-state={handle.editState}
                      points={`${handle.x + 4},${handle.y - 4} ${handle.x + 6},${handle.y - 1} ${handle.x + 2},${handle.y - 1}`}
                      fill="#ffffff"
                      style={{ pointerEvents: 'none' }}
                    />
                  </g>
                );
              }
              if (handle.type === 'rect') {
                return (
                  <rect
                    key={handle.id}
                    data-secondary="true"
                    data-state={handle.editState}
                    x={handle.x}
                    y={handle.y}
                    width={handle.width}
                    height={handle.height}
                    stroke="#2196f3"
                    strokeWidth={isMultiSelection ? '2' : '1.5'}
                    strokeDasharray="4 4"
                    fill="none"
                    style={{ cursor: handle.cursor }}
                  />
                );
              }
              return (
                <circle
                  key={handle.id}
                  data-secondary="true"
                  data-state={handle.editState}
                  cx={handle.x}
                  cy={handle.y}
                  r="7"
                  fill="#2196f3"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  style={{ cursor: handle.cursor }}
                />
              );
            })}
          </g>
        )}
      </g>
    </svg>
  );
};
