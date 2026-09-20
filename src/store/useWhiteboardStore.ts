import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShapeData } from '../types/shape';

export interface ViewBoxState {
  x: number;
  y: number;
  zoom: number;
  screenWidth: number;
  screenHeight: number;
}

interface WhiteboardStoreState {
  shapes: ShapeData[];
  viewBox: ViewBoxState;
  setShapes: (shapes: ShapeData[] | ((prev: ShapeData[]) => ShapeData[])) => void;
  setViewBox: (viewBox: ViewBoxState | ((prev: ViewBoxState) => ViewBoxState)) => void;
  clearCanvas: () => void;
}

export const STORAGE_KEY = 'whiteboard_canvas_storage';

export const useWhiteboardStore = create<WhiteboardStoreState>()(
  persist(
    (set) => ({
      shapes: [],
      viewBox: {
        x: 0,
        y: 0,
        zoom: 1,
        screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1000,
        screenHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
      },
      setShapes: (updater) =>
        set((state) => ({
          shapes: typeof updater === 'function' ? updater(state.shapes) : updater,
        })),
      setViewBox: (updater) =>
        set((state) => ({
          viewBox: typeof updater === 'function' ? updater(state.viewBox) : updater,
        })),
      clearCanvas: () => set({ shapes: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        shapes: state.shapes,
        viewBox: {
          x: state.viewBox.x,
          y: state.viewBox.y,
          zoom: state.viewBox.zoom,
          screenWidth: state.viewBox.screenWidth,
          screenHeight: state.viewBox.screenHeight,
        },
      }),
    }
  )
);

// Cross-tab synchronization via localStorage storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      useWhiteboardStore.persist.rehydrate();
    }
  });
}
