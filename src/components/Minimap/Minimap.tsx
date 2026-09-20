import React, { useState, useRef } from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { TypeShape } from '../../types/shape';
import styles from './Minimap.module.scss';

export const Minimap: React.FC = () => {
  const { shapes, viewBox, centerAt } = useWhiteboard();
  const [collapsed, setCollapsed] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute total bounding box enclosing all shapes + current camera viewBox
  const cameraWidth = viewBox.screenWidth * viewBox.zoom;
  const cameraHeight = viewBox.screenHeight * viewBox.zoom;

  let minX = viewBox.x;
  let minY = viewBox.y;
  let maxX = viewBox.x + cameraWidth;
  let maxY = viewBox.y + cameraHeight;

  shapes.forEach((shape) => {
    switch (shape.type) {
      case TypeShape.RECT:
      case TypeShape.TEXT:
        minX = Math.min(minX, shape.x);
        minY = Math.min(minY, shape.y);
        maxX = Math.max(maxX, shape.x + (shape.width || 0));
        maxY = Math.max(maxY, shape.y + (shape.height || 0));
        break;
      case TypeShape.ELLIPSE:
        minX = Math.min(minX, shape.cx - (shape.rx || 0));
        minY = Math.min(minY, shape.cy - (shape.ry || 0));
        maxX = Math.max(maxX, shape.cx + (shape.rx || 0));
        maxY = Math.max(maxY, shape.cy + (shape.ry || 0));
        break;
      case TypeShape.LINE:
        minX = Math.min(minX, shape.x1, shape.x2);
        minY = Math.min(minY, shape.y1, shape.y2);
        maxX = Math.max(maxX, shape.x1, shape.x2);
        maxY = Math.max(maxY, shape.y1, shape.y2);
        break;
      case TypeShape.POLYLINE:
        if (shape.points) {
          shape.points.trim().split(/\s+/).forEach((p) => {
            const [px, py] = p.split(',').map(Number);
            if (!isNaN(px) && !isNaN(py)) {
              minX = Math.min(minX, px);
              minY = Math.min(minY, py);
              maxX = Math.max(maxX, px);
              maxY = Math.max(maxY, py);
            }
          });
        }
        break;
    }
  });

  // Add margin padding around total bounding box
  const padding = 200 * viewBox.zoom;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const totalWidth = Math.max(maxX - minX, 600);
  const totalHeight = Math.max(maxY - minY, 400);
  const viewBoxString = `${minX} ${minY} ${totalWidth} ${totalHeight}`;

  const handlePointerNavigate = (e: React.PointerEvent) => {
    if (e.buttons !== 1 && e.type !== 'pointerdown') return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickRatioX = (e.clientX - rect.left) / rect.width;
    const clickRatioY = (e.clientY - rect.top) / rect.height;

    const targetCanvasX = minX + clickRatioX * totalWidth;
    const targetCanvasY = minY + clickRatioY * totalHeight;

    centerAt(targetCanvasX, targetCanvasY);
  };

  return (
    <div className={`${styles.minimapContainer} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.minimapHeader}>
        <span className={styles.title}>Navegación</span>
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir minimapa' : 'Colapsar minimapa'}
        >
          <span className="material-icons">
            {collapsed ? 'map' : 'unfold_less'}
          </span>
        </button>
      </div>

      {!collapsed && (
        <div className={styles.canvasWrapper}>
          <svg
            ref={svgRef}
            className={styles.minimapSvg}
            viewBox={viewBoxString}
            onPointerDown={handlePointerNavigate}
            onPointerMove={handlePointerNavigate}
          >
            {/* Render mini shapes */}
            <g id="minimap-shapes">
              {shapes.map((shape) => {
                switch (shape.type) {
                  case TypeShape.RECT:
                    return (
                      <rect
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        stroke="#444"
                        fill="#2196f3"
                        strokeWidth={totalWidth / 300}
                        opacity={0.7}
                      />
                    );
                  case TypeShape.ELLIPSE:
                    return (
                      <ellipse
                        key={shape.id}
                        cx={shape.cx}
                        cy={shape.cy}
                        rx={shape.rx}
                        ry={shape.ry}
                        stroke="#444"
                        fill="#4caf50"
                        strokeWidth={totalWidth / 300}
                        opacity={0.7}
                      />
                    );
                  case TypeShape.LINE:
                    return (
                      <line
                        key={shape.id}
                        x1={shape.x1}
                        y1={shape.y1}
                        x2={shape.x2}
                        y2={shape.y2}
                        stroke="#ff9800"
                        strokeWidth={Math.max(totalWidth / 200, 2)}
                      />
                    );
                  case TypeShape.POLYLINE:
                    return (
                      <polyline
                        key={shape.id}
                        points={shape.points}
                        stroke="#e91e63"
                        fill="none"
                        strokeWidth={Math.max(totalWidth / 200, 2)}
                      />
                    );
                  case TypeShape.TEXT:
                    return (
                      <rect
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width || 100}
                        height={shape.height || 40}
                        stroke="#9c27b0"
                        fill="#9c27b0"
                        strokeWidth={totalWidth / 300}
                        opacity={0.5}
                        rx="4"
                      />
                    );
                  default:
                    return null;
                }
              })}
            </g>

            {/* Camera Viewport Indicator Box */}
            <rect
              x={viewBox.x}
              y={viewBox.y}
              width={cameraWidth}
              height={cameraHeight}
              stroke="#2196f3"
              strokeWidth={totalWidth / 120}
              fill="rgba(33, 150, 243, 0.25)"
              rx={totalWidth / 200}
              style={{ cursor: 'crosshair' }}
            />
          </svg>
        </div>
      )}
    </div>
  );
};
