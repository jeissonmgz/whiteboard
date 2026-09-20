import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ShapeData, TypeShape, EditState, Point } from '../types/shape';
import { createNewShape, updateShapePoint, getShapeBoundingBox, updateGroupShapes } from '../services/shapeUtils';

interface ViewBoxState {
  x: number;
  y: number;
  zoom: number;
  screenWidth: number;
  screenHeight: number;
}

interface WhiteboardContextType {
  shapes: ShapeData[];
  selectedShapeId: string | null;
  selectedShapeIds: string[];
  activeTool: TypeShape | null;
  viewBox: ViewBoxState;
  marqueeRect: { x: number; y: number; width: number; height: number } | null;
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  setActiveTool: (tool: TypeShape | null) => void;
  selectShape: (id: string | null) => void;
  selectShapes: (ids: string[]) => void;
  updateShapeProperties: (id: string, updates: Partial<ShapeData>, skipHistory?: boolean) => void;
  deleteShape: (id: string) => void;

  // Drawing & Editing lifecycle
  startDrawingOrEditing: (point: Point, targetElement?: Element) => void;
  handleMouseMove: (point: Point) => void;
  handleMouseUp: (point: Point, duration: number) => void;

  // ViewBox & Scroll controls
  scroll: (isHorizontal: boolean, isTopOrLeft: boolean, value?: number) => void;
  changeZoom: (zoomInOrValue: boolean | number, clientPoint?: { x: number; y: number } | null) => void;
  zoomAtPoint: (
    clientPoint: { x: number; y: number } | null,
    zoomInOrValue: boolean | number,
    animate?: boolean,
    deltaFactor?: number
  ) => void;
  updateScreenSize: (width: number, height: number) => void;
  centerAt: (targetX: number, targetY: number) => void;
  setPan: (x: number, y: number) => void;

  // History
  undo: () => void;
  redo: () => void;
}

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

function isShapeIntersectingRect(shape: ShapeData, mRect: { x: number; y: number; width: number; height: number }): boolean {
  const bbox = getShapeBoundingBox(shape);
  return !(
    bbox.x > mRect.x + mRect.width ||
    bbox.x + bbox.width < mRect.x ||
    bbox.y > mRect.y + mRect.height ||
    bbox.y + bbox.height < mRect.y
  );
}

export const WhiteboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<TypeShape | null>(null);
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Derived primary selected ID for single selection backward compatibility
  const selectedShapeId = selectedShapeIds.length > 0 ? selectedShapeIds[0] : null;

  // History stacks
  const [history, setHistory] = useState<ShapeData[][]>([]);
  const [redoStack, setRedoStack] = useState<ShapeData[][]>([]);

  // ViewBox state
  const [viewBox, setViewBox] = useState<ViewBoxState>({
    x: 0,
    y: 0,
    zoom: 1,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1000,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Dragging / Editing state refs
  const isEditingRef = useRef(false);
  const isMarqueeRef = useRef(false);
  const editStateRef = useRef<EditState>(EditState.DEFAULT);
  const initPointRef = useRef<Point>({ x: 0, y: 0 });
  const lastPointRef = useRef<Point>({ x: 0, y: 0 });
  const initialShapeRef = useRef<ShapeData | null>(null);
  const initialShapesMapRef = useRef<Map<string, ShapeData>>(new Map());
  const startClickTimeRef = useRef<number>(0);

  const saveHistory = useCallback((currentShapes: ShapeData[]) => {
    setHistory((prev) => [...prev, currentShapes]);
    setRedoStack([]);
  }, []);

  const selectShape = useCallback((id: string | null) => {
    setSelectedShapeIds(id ? [id] : []);
  }, []);

  const selectShapes = useCallback((ids: string[]) => {
    setSelectedShapeIds(ids);
  }, []);

  const handleToolChange = useCallback((tool: TypeShape | null) => {
    setActiveTool(tool);
    setSelectedShapeIds([]);
  }, []);

  const updateShapeProperties = useCallback(
    (id: string, updates: Partial<ShapeData>, skipHistory = false) => {
      setShapes((prevShapes) => {
        if (!skipHistory) {
          saveHistory(prevShapes);
        }
        const targetIds = selectedShapeIds.includes(id) ? selectedShapeIds : [id];
        return prevShapes.map((shape) =>
          targetIds.includes(shape.id) ? ({ ...shape, ...updates } as ShapeData) : shape
        );
      });
    },
    [saveHistory, selectedShapeIds]
  );

  const deleteShape = useCallback(
    (id: string) => {
      setShapes((prevShapes) => {
        saveHistory(prevShapes);
        const targetIds = selectedShapeIds.includes(id) ? selectedShapeIds : [id];
        return prevShapes.filter((shape) => !targetIds.includes(shape.id));
      });
      setSelectedShapeIds([]);
    },
    [saveHistory, selectedShapeIds]
  );

  const snapshotInitialShapes = useCallback((shapeList: ShapeData[]) => {
    const map = new Map<string, ShapeData>();
    shapeList.forEach((s) => map.set(s.id, JSON.parse(JSON.stringify(s))));
    initialShapesMapRef.current = map;
  }, []);

  const startDrawingOrEditing = useCallback(
    (point: Point, targetElement?: Element) => {
      startClickTimeRef.current = Date.now();

      // Check if clicked on a secondary handle (edit state control handle)
      const secElement = targetElement?.closest('[data-secondary]');
      const secAttribute = secElement?.getAttribute('data-secondary');
      const stateAttribute = secElement?.getAttribute('data-state');

      if (secAttribute === 'true' && stateAttribute !== null && selectedShapeIds.length > 0) {
        // Editing existing selected shape(s) via handle
        saveHistory(shapes);
        snapshotInitialShapes(shapes);
        const editState = Number(stateAttribute) as EditState;
        editStateRef.current = editState;
        isEditingRef.current = true;

        if (selectedShapeIds.length === 1) {
          const targetShape = shapes.find((s) => s.id === selectedShapeIds[0]);
          if (targetShape) {
            initialShapeRef.current = JSON.parse(JSON.stringify(targetShape));
          }
        }
        initPointRef.current = { ...point };
        lastPointRef.current = { ...point };
        return;
      }

      if (activeTool === null) {
        // Select tool active
        const shapeElement = targetElement?.closest('[data-shape-id]');
        const clickedShapeId = shapeElement?.getAttribute('data-shape-id');
        const isShift = (targetElement?.ownerDocument?.defaultView?.event as MouseEvent)?.shiftKey || false;

        if (clickedShapeId) {
          saveHistory(shapes);
          snapshotInitialShapes(shapes);

          let nextSelectedIds: string[];
          if (isShift) {
            nextSelectedIds = selectedShapeIds.includes(clickedShapeId)
              ? selectedShapeIds.filter((id) => id !== clickedShapeId)
              : [...selectedShapeIds, clickedShapeId];
          } else {
            nextSelectedIds = selectedShapeIds.includes(clickedShapeId) && selectedShapeIds.length > 1
              ? selectedShapeIds
              : [clickedShapeId];
          }
          setSelectedShapeIds(nextSelectedIds);

          isEditingRef.current = true;
          editStateRef.current = EditState.CENTER;
          initPointRef.current = { ...point };
          lastPointRef.current = { ...point };
        } else {
          // Clicked empty canvas
          if (!isShift) {
            setSelectedShapeIds([]);
          }
          // Start marquee selection drag
          isMarqueeRef.current = true;
          initPointRef.current = { ...point };
          setMarqueeRect({ x: point.x, y: point.y, width: 0, height: 0 });
        }
      } else {
        // Create new shape tool active
        saveHistory(shapes);
        const newShape = createNewShape(activeTool, point);
        setShapes((prev) => [...prev, newShape]);
        setSelectedShapeIds([newShape.id]);
        snapshotInitialShapes([newShape]);
        initialShapeRef.current = { ...newShape };
        editStateRef.current = EditState.DEFAULT;
        isEditingRef.current = true;
        initPointRef.current = { ...point };
        lastPointRef.current = { ...point };

        // Automatically switch back to select mode when creating text shape
        if (activeTool === TypeShape.TEXT) {
          setActiveTool(null);
        }
      }
    },
    [activeTool, selectedShapeIds, shapes, saveHistory, snapshotInitialShapes]
  );

  const handleMouseMove = useCallback(
    (point: Point) => {
      if (isMarqueeRef.current) {
        const mX = Math.min(initPointRef.current.x, point.x);
        const mY = Math.min(initPointRef.current.y, point.y);
        const mW = Math.abs(point.x - initPointRef.current.x);
        const mH = Math.abs(point.y - initPointRef.current.y);
        const currentMarquee = { x: mX, y: mY, width: mW, height: mH };
        setMarqueeRect(currentMarquee);

        if (mW > 3 || mH > 3) {
          const intersectingIds = shapes
            .filter((s) => isShapeIntersectingRect(s, currentMarquee))
            .map((s) => s.id);
          setSelectedShapeIds(intersectingIds);
        }
        return;
      }

      if (!isEditingRef.current) return;

      if (selectedShapeIds.length > 1) {
        // Multi-selection group transformation
        setShapes((prevShapes) =>
          updateGroupShapes(
            prevShapes,
            selectedShapeIds,
            point,
            initPointRef.current,
            editStateRef.current,
            initialShapesMapRef.current
          )
        );
      } else if (selectedShapeIds.length === 1) {
        // Single shape transformation
        const targetId = selectedShapeIds[0];
        setShapes((prevShapes) =>
          prevShapes.map((shape) => {
            if (shape.id !== targetId) return shape;
            return updateShapePoint(
              shape,
              point,
              initPointRef.current,
              editStateRef.current,
              initialShapesMapRef.current.get(targetId) || initialShapeRef.current
            );
          })
        );
      }
      lastPointRef.current = { ...point };
    },
    [selectedShapeIds, shapes]
  );

  const handleMouseUp = useCallback((point: Point, duration: number) => {
    if (isEditingRef.current && selectedShapeIds.length === 1) {
      const targetId = selectedShapeIds[0];
      setShapes((prevShapes) =>
        prevShapes.map((shape) => {
          if (shape.id === targetId && shape.type === TypeShape.TEXT) {
            if (duration < 500 && (shape.width === 0 || shape.height === 0)) {
              return { ...shape, width: 100, height: 50 };
            }
          }
          return shape;
        })
      );
    }
    isEditingRef.current = false;
    isMarqueeRef.current = false;
    setMarqueeRect(null);
  }, [selectedShapeIds]);

  // Ref tracking latest viewBox for animation math
  const viewBoxRef = useRef(viewBox);
  useEffect(() => {
    viewBoxRef.current = viewBox;
  }, [viewBox]);

  const animFrameRef = useRef<number | null>(null);

  const cancelViewBoxAnimation = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const animateViewBoxTo = useCallback(
    (targetX: number, targetY: number, targetZoom?: number, duration = 300) => {
      cancelViewBoxAnimation();

      const startX = viewBoxRef.current.x;
      const startY = viewBoxRef.current.y;
      const startZoom = viewBoxRef.current.zoom;
      const endZoom = targetZoom !== undefined ? targetZoom : startZoom;
      const startTime = performance.now();

      // Smooth cubic ease-out function
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        setViewBox((prev) => ({
          ...prev,
          x: startX + (targetX - startX) * eased,
          y: startY + (targetY - startY) * eased,
          zoom: startZoom + (endZoom - startZoom) * eased,
        }));

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    },
    [cancelViewBoxAnimation]
  );

  // ViewBox & Scroll operations
  const scroll = useCallback(
    (isHorizontal: boolean, isTopOrLeft: boolean, value = 10) => {
      const delta = value / 100;
      const prev = viewBoxRef.current;
      const stepX = (isTopOrLeft ? -delta : delta) * prev.screenWidth;
      const stepY = (isTopOrLeft ? -delta : delta) * prev.screenHeight;
      const targetX = isHorizontal ? prev.x + stepX : prev.x;
      const targetY = !isHorizontal ? prev.y + stepY : prev.y;
      animateViewBoxTo(targetX, targetY, prev.zoom, 250);
    },
    [animateViewBoxTo]
  );

  const zoomAtPoint = useCallback(
    (
      clientPoint: { x: number; y: number } | null,
      zoomInOrValue: boolean | number,
      animate = true,
      deltaFactor?: number
    ) => {
      const prev = viewBoxRef.current;

      // Default focal point: center of screen if no clientPoint provided (e.g. from toolbar buttons)
      const targetPoint = clientPoint || {
        x: prev.screenWidth / 2,
        y: prev.screenHeight / 2,
      };

      let newZoom = prev.zoom;
      if (typeof zoomInOrValue === 'number') {
        newZoom = zoomInOrValue === 100 ? 1 : zoomInOrValue;
      } else if (deltaFactor !== undefined) {
        // Continuous wheel / trackpad pinch zoom
        const factor = deltaFactor < 0 ? 0.92 : 1.08;
        newZoom = Math.min(Math.max(prev.zoom * factor, 0.1), 5.0);
      } else if (zoomInOrValue) {
        // Zoom In button: decrease zoom scale factor to zoom in
        newZoom = Math.max(prev.zoom - 0.25, 0.1);
      } else {
        // Zoom Out button: increase zoom scale factor to zoom out
        newZoom = Math.min(prev.zoom + 0.25, 5.0);
      }

      // Calculate new viewBox origin (x, y) so targetPoint stays fixed on screen
      const newX = prev.x + targetPoint.x * (prev.zoom - newZoom);
      const newY = prev.y + targetPoint.y * (prev.zoom - newZoom);

      if (animate) {
        animateViewBoxTo(newX, newY, newZoom, 200);
      } else {
        cancelViewBoxAnimation();
        setViewBox((p) => ({
          ...p,
          x: newX,
          y: newY,
          zoom: newZoom,
        }));
      }
    },
    [animateViewBoxTo, cancelViewBoxAnimation]
  );

  const changeZoom = useCallback(
    (zoomInOrValue: boolean | number, clientPoint?: { x: number; y: number } | null) => {
      zoomAtPoint(clientPoint || null, zoomInOrValue, true);
    },
    [zoomAtPoint]
  );

  const updateScreenSize = useCallback((width: number, height: number) => {
    setViewBox((prev) => ({ ...prev, screenWidth: width, screenHeight: height }));
  }, []);

  const centerAt = useCallback(
    (targetX: number, targetY: number) => {
      const prev = viewBoxRef.current;
      const finalX = targetX - (prev.screenWidth * prev.zoom) / 2;
      const finalY = targetY - (prev.screenHeight * prev.zoom) / 2;
      animateViewBoxTo(finalX, finalY, prev.zoom, 300);
    },
    [animateViewBoxTo]
  );

  const setPan = useCallback(
    (x: number, y: number) => {
      cancelViewBoxAnimation();
      setViewBox((prev) => ({
        ...prev,
        x,
        y,
      }));
    },
    [cancelViewBoxAnimation]
  );

  // History operations
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previousShapes = history[history.length - 1];
    setRedoStack((prev) => [shapes, ...prev]);
    setShapes(previousShapes);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setSelectedShapeIds([]);
  }, [history, shapes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextShapes = redoStack[0];
    setHistory((prev) => [...prev, shapes]);
    setShapes(nextShapes);
    setRedoStack((prev) => prev.slice(1));
    setSelectedShapeIds([]);
  }, [redoStack, shapes]);

  // Global keyboard shortcuts for Undo, Redo, Tools, Deletion, and Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside a contentEditable or text input
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          redo();
        }
      } else {
        // Single key shortcuts when Ctrl/Cmd is not pressed
        switch (e.key) {
          case 'v':
          case 'V':
          case 'Escape':
            handleToolChange(null);
            break;
          case 't':
          case 'T':
            handleToolChange(TypeShape.TEXT);
            break;
          case 'l':
          case 'L':
            handleToolChange(TypeShape.LINE);
            break;
          case 'a':
          case 'A':
            handleToolChange(TypeShape.ARROW);
            break;
          case 'p':
          case 'P':
            handleToolChange(TypeShape.POLYLINE);
            break;
          case 'r':
          case 'R':
            handleToolChange(TypeShape.RECT);
            break;
          case 'e':
          case 'E':
            handleToolChange(TypeShape.ELLIPSE);
            break;
          case 'Delete':
          case 'Backspace':
            if (selectedShapeIds.length > 0) {
              e.preventDefault();
              deleteShape(selectedShapeIds[0]);
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            scroll(false, true, 15);
            break;
          case 'ArrowDown':
            e.preventDefault();
            scroll(false, false, 15);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            scroll(true, true, 15);
            break;
          case 'ArrowRight':
            e.preventDefault();
            scroll(true, false, 15);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedShapeIds, deleteShape, handleToolChange, scroll]);

  return (
    <WhiteboardContext.Provider
      value={{
        shapes,
        selectedShapeId,
        selectedShapeIds,
        activeTool,
        viewBox,
        marqueeRect,
        canUndo: history.length > 0,
        canRedo: redoStack.length > 0,
        setActiveTool: handleToolChange,
        selectShape,
        selectShapes,
        updateShapeProperties,
        deleteShape,
        startDrawingOrEditing,
        handleMouseMove,
        handleMouseUp,
        scroll,
        changeZoom,
        zoomAtPoint,
        updateScreenSize,
        centerAt,
        setPan,
        undo,
        redo,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboard = () => {
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider');
  }
  return context;
};
