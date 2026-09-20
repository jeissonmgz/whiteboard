import React from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { CircleButton } from '../CircleButton/CircleButton';
import { TypeShape } from '../../types/shape';
import styles from './Control.module.scss';

export const Control: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    canUndo,
    canRedo,
    undo,
    redo,
    changeZoom,
  } = useWhiteboard();

  return (
    <div className={styles.container}>
      <CircleButton
        icon="undo"
        info="Deshacer (⌘Z / Ctrl+Z)"
        disabled={!canUndo}
        onClick={undo}
      />
      <CircleButton
        icon="redo"
        info="Rehacer (⌘⇧Z / Ctrl+Y)"
        disabled={!canRedo}
        onClick={redo}
      />
      <span className={styles.space}></span>
      <CircleButton
        icon="pan_tool"
        info="Seleccionar (V / Esc)"
        isSelected={activeTool === null}
        onClick={() => setActiveTool(null)}
      />
      <CircleButton
        icon="title"
        info="Texto (T)"
        isSelected={activeTool === TypeShape.TEXT}
        onClick={() => setActiveTool(TypeShape.TEXT)}
      />
      <CircleButton
        icon="remove"
        rotateIcon="rotate(45deg)"
        info="Línea (L)"
        isSelected={activeTool === TypeShape.LINE}
        onClick={() => setActiveTool(TypeShape.LINE)}
      />
      <CircleButton
        icon="east"
        info="Flecha (A)"
        isSelected={activeTool === TypeShape.ARROW}
        onClick={() => setActiveTool(TypeShape.ARROW)}
      />
      <CircleButton
        icon="edit"
        info="Polilínea (P)"
        isSelected={activeTool === TypeShape.POLYLINE}
        onClick={() => setActiveTool(TypeShape.POLYLINE)}
      />
      <CircleButton
        icon="check_box_outline_blank"
        info="Rectángulo (R)"
        isSelected={activeTool === TypeShape.RECT}
        onClick={() => setActiveTool(TypeShape.RECT)}
      />
      <CircleButton
        icon="radio_button_unchecked"
        info="Elipse (E)"
        isSelected={activeTool === TypeShape.ELLIPSE}
        onClick={() => setActiveTool(TypeShape.ELLIPSE)}
      />
      <span className={styles.space}></span>
      <CircleButton
        icon="zoom_in"
        info="Ampliar (Ctrl + Scroll ↑)"
        onClick={() => changeZoom(true)}
      />
      <CircleButton
        icon="zoom_out"
        info="Disminuir (Ctrl + Scroll ↓)"
        onClick={() => changeZoom(false)}
      />
      <CircleButton
        icon="fullscreen_exit"
        info="Reestablecer Zoom (100%)"
        onClick={() => changeZoom(100)}
      />
    </div>
  );
};
