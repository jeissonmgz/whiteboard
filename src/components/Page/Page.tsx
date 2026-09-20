import React, { useEffect, useRef, useState } from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { TypeShape, Point, TextShape } from '../../types/shape';
import { generateControlHandles } from '../../services/shapeUtils';
import styles from './Page.module.scss';

interface TextItemProps {
  shape: TextShape;
  isSelected: boolean;
  onUpdateContent: (id: string, newContent: string) => void;
  onSelect: (id: string) => void;
}

const TextItem: React.FC<TextItemProps> = ({
  shape,
  isSelected,
  onUpdateContent,
  onSelect,
}) => {
  const editableRef = useRef<HTMLDivElement>(null);

  // Auto focus text element and place caret when created or selected
  useEffect(() => {
    if (isSelected && editableRef.current) {
      const el = editableRef.current;
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
  }, [isSelected]);

  const borderStyle = shape.stroke && shape.stroke !== 'none' ? 'solid' : 'none';
  const borderColor = shape.stroke || 'transparent';
  const borderWidth = `${shape.strokeWidth || 0}px`;
  const width = Math.max(shape.width || 100, 50);
  const height = Math.max(shape.height || 40, 30);

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
          onUpdateContent(shape.id, e.currentTarget.innerHTML);
        }}
        onBlur={(e) => {
          onUpdateContent(shape.id, e.currentTarget.innerHTML);
        }}
        onKeyDown={(e) => {
          // Prevent canvas global shortcuts while typing
          e.stopPropagation();
        }}
        dangerouslySetInnerHTML={{ __html: shape.content || '' }}
      />
    </foreignObject>
  );
};

export const Page: React.FC = () => {
  const {
    shapes,
    selectedShapeId,
    activeTool,
    viewBox,
    updateScreenSize,
    startDrawingOrEditing,
    handleMouseMove,
    handleMouseUp,
    updateShapeProperties,
    selectShape,
    setPan,
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

  const selectedShape = shapes.find((s) => s.id === selectedShapeId);
  const controlHandles = selectedShape ? generateControlHandles(selectedShape) : [];

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
                  style={{ cursor: activeTool === null ? 'move' : 'default', pointerEvents: 'all' }}
                />
              );
            case TypeShape.LINE:
              return (
                <g key={shape.id} data-shape-id={shape.id} style={{ cursor: activeTool === null ? 'move' : 'default' }}>
                  {/* Thick transparent hit area for easy grabbing */}
                  <line
                    x1={shape.x1}
                    y1={shape.y1}
                    x2={shape.x2}
                    y2={shape.y2}
                    stroke="transparent"
                    strokeWidth={Math.max(Number(shape.strokeWidth || 1), 14)}
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
                </g>
              );
            case TypeShape.POLYLINE:
              return (
                <g key={shape.id} data-shape-id={shape.id} style={{ cursor: activeTool === null ? 'move' : 'default' }}>
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
                <TextItem
                  key={shape.id}
                  shape={shape}
                  isSelected={shape.id === selectedShapeId}
                  onSelect={selectShape}
                  onUpdateContent={(id, content) =>
                    updateShapeProperties(id, { content })
                  }
                />
              );
            default:
              return null;
          }
        })}
      </g>

      <g id="controls">
        {controlHandles.map((handle) => {
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
                strokeWidth="5"
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
              stroke="none"
              style={{ cursor: handle.cursor }}
            />
          );
        })}
      </g>
    </svg>
  );
};
