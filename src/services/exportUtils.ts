import { ShapeData } from '../types/shape';
import { getShapeBoundingBox } from './shapeUtils';
import { ViewBoxState } from '../store/useWhiteboardStore';

export type ExportFormat = 'png' | 'jpeg' | 'jpg' | 'svg';
export type ExportScope = 'all' | 'selection';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  shapes: ShapeData[];
  selectedShapeIds: string[];
  viewBox: ViewBoxState;
}

export function downloadFile(content: string | Blob, fileName: string) {
  const link = document.createElement('a');
  if (typeof content === 'string') {
    link.href = content;
  } else {
    link.href = URL.createObjectURL(content);
  }
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportCanvasImage(options: ExportOptions): Promise<void> {
  const { format, scope, shapes, selectedShapeIds, viewBox } = options;

  let targetShapes = shapes;
  if (scope === 'selection' && selectedShapeIds.length > 0) {
    targetShapes = shapes.filter((s) => selectedShapeIds.includes(s.id));
  }

  if (targetShapes.length === 0) {
    targetShapes = shapes;
  }

  // Calculate target bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (targetShapes.length === 0) {
    minX = viewBox.x;
    minY = viewBox.y;
    maxX = viewBox.x + viewBox.screenWidth * viewBox.zoom;
    maxY = viewBox.y + viewBox.screenHeight * viewBox.zoom;
  } else {
    targetShapes.forEach((s) => {
      const bbox = getShapeBoundingBox(s);
      if (bbox.x < minX) minX = bbox.x;
      if (bbox.y < minY) minY = bbox.y;
      if (bbox.x + bbox.width > maxX) maxX = bbox.x + bbox.width;
      if (bbox.y + bbox.height > maxY) maxY = bbox.y + bbox.height;
    });
  }

  const padding = 30;
  const exportX = minX - padding;
  const exportY = minY - padding;
  const exportWidth = Math.max(100, maxX - minX + padding * 2);
  const exportHeight = Math.max(100, maxY - minY + padding * 2);

  // Get current DOM SVG element
  const svgEl = document.querySelector('svg');
  if (!svgEl) return;

  const svgClone = svgEl.cloneNode(true) as SVGSVGElement;

  // Remove control handles and marquee rects from export
  const controlsEl = svgClone.querySelector('#controls');
  if (controlsEl) controlsEl.remove();

  svgClone.querySelectorAll('[data-secondary="true"]').forEach((el) => el.remove());

  // Set viewBox and dimensions on clone
  svgClone.setAttribute('viewBox', `${exportX} ${exportY} ${exportWidth} ${exportHeight}`);
  svgClone.setAttribute('width', `${exportWidth}`);
  svgClone.setAttribute('height', `${exportHeight}`);

  // Inject current theme CSS variables into clone so colors render correctly
  const computedStyle = getComputedStyle(document.documentElement);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (document.documentElement.getAttribute('data-theme') === null && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const bgColor = isDark ? '#121212' : '#ffffff';
  const textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || (isDark ? '#e0e0e0' : '#212121');

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :root {
      --text-primary: ${textPrimary};
      --bg-surface-solid: ${computedStyle.getPropertyValue('--bg-surface-solid').trim() || (isDark ? '#1e1e1e' : '#ffffff')};
      --border-color: ${computedStyle.getPropertyValue('--border-color').trim() || '#ccc'};
      --color-primary: ${computedStyle.getPropertyValue('--color-primary').trim() || '#4f46e5'};
    }
    text { font-family: Roboto, sans-serif; }
  `;
  svgClone.prepend(styleEl);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);

  if (format === 'svg') {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    downloadFile(blob, `whiteboard-export-${Date.now()}.svg`);
    return;
  }

  // PNG / JPG / JPEG rendering
  return new Promise((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const scale = 2; // High Resolution 2x DPI
      const canvas = document.createElement('canvas');
      canvas.width = exportWidth * scale;
      canvas.height = exportHeight * scale;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw background for JPG/JPEG
        if (format === 'jpg' || format === 'jpeg') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        downloadFile(dataUrl, `whiteboard-export-${Date.now()}.${format}`);
      }
      URL.revokeObjectURL(url);
      resolve();
    };

    img.src = url;
  });
}

export function saveProjectJSON(shapes: ShapeData[], viewBox: ViewBoxState) {
  const data = {
    version: '1.0',
    type: 'whiteboard_project',
    exportedAt: new Date().toISOString(),
    shapes,
    viewBox,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadFile(blob, `whiteboard-project-${Date.now()}.json`);
}

export function loadProjectJSON(
  onSuccess: (shapes: ShapeData[], viewBox?: ViewBoxState) => void,
  onError?: (err: string) => void
) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.whiteboard';

  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.shapes)) {
          onSuccess(parsed.shapes, parsed.viewBox);
        } else if (Array.isArray(parsed)) {
          onSuccess(parsed);
        } else {
          if (onError) onError('El archivo no contiene un formato de pizarra válido.');
        }
      } catch (err) {
        if (onError) onError('No se pudo leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

export function printCanvas() {
  window.print();
}
