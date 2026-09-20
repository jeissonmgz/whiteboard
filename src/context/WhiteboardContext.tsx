import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ShapeData, TypeShape, EditState, Point } from '../types/shape';
import { createNewShape, updateShapePoint } from '../services/shapeUtils';

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
  activeTool: TypeShape | null;
  viewBox: ViewBoxState;
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  setActiveTool: (tool: TypeShape | null) => void;
  selectShape: (id: string | null) => void;
  updateShapeProperties: (id: string, updates: Partial<ShapeData>) => void;
  deleteShape: (id: string) => void;

  // Drawing & Editing lifecycle
  startDrawingOrEditing: (point: Point, targetElement?: Element) => void;
  handleMouseMove: (point: Point) => void;
  handleMouseUp: (point: Point, duration: number) => void;

  // ViewBox & Scroll controls
  scroll: (isHorizontal: boolean, isTopOrLeft: boolean, value?: number) => void;
  changeZoom: (zoomInOrValue: boolean | number) => void;
  updateScreenSize: (width: number, height: number) => void;
  centerAt: (targetX: number, targetY: number) => void;
  setPan: (x: number, y: number) => void;

  // History
  undo: () => void;
  redo: () => void;
}

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

export const WhiteboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<TypeShape | null>(null);

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
  const editingShapeIdRef = useRef<string | null>(null);
  const editStateRef = useRef<EditState>(EditState.DEFAULT);
  const initPointRef = useRef<Point>({ x: 0, y: 0 });
  const lastPointRef = useRef<Point>({ x: 0, y: 0 });
  const initialShapeRef = useRef<ShapeData | null>(null);
  const startClickTimeRef = useRef<number>(0);

  const saveHistory = useCallback((currentShapes: ShapeData[]) => {
    setHistory((prev) => [...prev, currentShapes]);
    setRedoStack([]);
  }, []);

  const selectShape = useCallback((id: string | null) => {
    setSelectedShapeId(id);
  }, []);

  const handleToolChange = useCallback((tool: TypeShape | null) => {
    setActiveTool(tool);
    setSelectedShapeId(null);
  }, []);

  const updateShapeProperties = useCallback((id: string, updates: Partial<ShapeData>) => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) => (shape.id === id ? ({ ...shape, ...updates } as ShapeData) : shape))
    );
  }, []);

  const deleteShape = useCallback((id: string) => {
    setShapes((prevShapes) => {
      saveHistory(prevShapes);
      return prevShapes.filter((shape) => shape.id !== id);
    });
    setSelectedShapeId(null);
  }, [saveHistory]);

  const startDrawingOrEditing = useCallback(
    (point: Point, targetElement?: Element) => {
      startClickTimeRef.current = Date.now();

      // Check if clicked on a secondary handle (edit state control handle)
      const secElement = targetElement?.closest('[data-secondary]');
      const secAttribute = secElement?.getAttribute('data-secondary');
      const stateAttribute = secElement?.getAttribute('data-state');

      if (secAttribute === 'true' && stateAttribute !== null && selectedShapeId) {
        // Editing existing selected shape via handle
        const editState = Number(stateAttribute) as EditState;
        editStateRef.current = editState;
        isEditingRef.current = true;
        editingShapeIdRef.current = selectedShapeId;

        const targetShape = shapes.find((s) => s.id === selectedShapeId);
        if (targetShape) {
          initialShapeRef.current = JSON.parse(JSON.stringify(targetShape));
          // Compute initPoint according to handle position
          switch (targetShape.type) {
            case TypeShape.RECT:
            case TypeShape.TEXT: {
              if (
                editState === EditState.N_POINT ||
                editState === EditState.NW_POINT ||
                editState === EditState.W_POINT
              ) {
                initPointRef.current = {
                  x: targetShape.x + targetShape.width,
                  y: targetShape.y + targetShape.height,
                };
              } else if (editState === EditState.NE_POINT) {
                initPointRef.current = {
                  x: targetShape.x,
                  y: targetShape.y + targetShape.height,
                };
              } else if (editState === EditState.SW_POINT) {
                initPointRef.current = {
                  x: targetShape.x + targetShape.width,
                  y: targetShape.y,
                };
              } else {
                initPointRef.current = { x: targetShape.x, y: targetShape.y };
              }
              break;
            }
            case TypeShape.ELLIPSE: {
              initPointRef.current = { x: targetShape.cx, y: targetShape.cy };
              break;
            }
            case TypeShape.LINE: {
              initPointRef.current = {
                x: (targetShape.x1 + targetShape.x2) / 2,
                y: (targetShape.y1 + targetShape.y2) / 2,
              };
              break;
            }
          }
        }
        lastPointRef.current = { ...point };
        return;
      }

      if (activeTool === null) {
        // Select tool active
        const shapeElement = targetElement?.closest('[data-shape-id]');
        const clickedShapeId = shapeElement?.getAttribute('data-shape-id');

        if (clickedShapeId) {
          setSelectedShapeId(clickedShapeId);
          const targetShape = shapes.find((s) => s.id === clickedShapeId);
          initialShapeRef.current = targetShape ? JSON.parse(JSON.stringify(targetShape)) : null;

          // Immediately enable shape dragging when clicking shape body
          isEditingRef.current = true;
          editingShapeIdRef.current = clickedShapeId;
          editStateRef.current = EditState.CENTER;
          initPointRef.current = { ...point };
          lastPointRef.current = { ...point };
        } else {
          setSelectedShapeId(null);
        }
      } else {
        // Create new shape tool active
        saveHistory(shapes);
        const newShape = createNewShape(activeTool, point);
        setShapes((prev) => [...prev, newShape]);
        setSelectedShapeId(newShape.id);
        editingShapeIdRef.current = newShape.id;
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
    [activeTool, selectedShapeId, shapes, saveHistory]
  );

  const handleMouseMove = useCallback((point: Point) => {
    if (!isEditingRef.current || !editingShapeIdRef.current) return;

    setShapes((prevShapes) =>
      prevShapes.map((shape) => {
        if (shape.id !== editingShapeIdRef.current) return shape;
        return updateShapePoint(
          shape,
          point,
          initPointRef.current,
          editStateRef.current,
          initialShapeRef.current
        );
      })
    );
    lastPointRef.current = { ...point };
  }, []);

  const handleMouseUp = useCallback((point: Point, duration: number) => {
    if (isEditingRef.current && editingShapeIdRef.current) {
      // Post-creation adjust for short click on text
      setShapes((prevShapes) =>
        prevShapes.map((shape) => {
          if (shape.id === editingShapeIdRef.current && shape.type === TypeShape.TEXT) {
            if (duration < 500 && (shape.width === 0 || shape.height === 0)) {
              return { ...shape, width: 100, height: 50 };
            }
          }
          return shape;
        })
      );
    }
    isEditingRef.current = false;
    editingShapeIdRef.current = null;
  }, []);

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

  const changeZoom = useCallback(
    (zoomInOrValue: boolean | number) => {
      const prev = viewBoxRef.current;
      let newZoom = prev.zoom;
      if (typeof zoomInOrValue === 'number') {
        newZoom = zoomInOrValue === 100 ? 1 : zoomInOrValue;
      } else if (zoomInOrValue) {
        newZoom = prev.zoom + 0.25;
      } else {
        if (prev.zoom > 0.25) newZoom = prev.zoom - 0.25;
      }
      animateViewBoxTo(prev.x, prev.y, newZoom, 250);
    },
    [animateViewBoxTo]
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
    setSelectedShapeId(null);
  }, [history, shapes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextShapes = redoStack[0];
    setHistory((prev) => [...prev, shapes]);
    setShapes(nextShapes);
    setRedoStack((prev) => prev.slice(1));
    setSelectedShapeId(null);
  }, [redoStack, shapes]);

  return (
    <WhiteboardContext.Provider
      value={{
        shapes,
        selectedShapeId,
        activeTool,
        viewBox,
        canUndo: history.length > 0,
        canRedo: redoStack.length > 0,
        setActiveTool: handleToolChange,
        selectShape,
        updateShapeProperties,
        deleteShape,
        startDrawingOrEditing,
        handleMouseMove,
        handleMouseUp,
        scroll,
        changeZoom,
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
