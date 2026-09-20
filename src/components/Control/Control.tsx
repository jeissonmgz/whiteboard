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
      {canUndo && (
        <CircleButton
          icon="undo"
          info="Deshacer"
          onClick={undo}
        />
      )}
      {canRedo && (
        <CircleButton
          icon="redo"
          info="Rehacer"
          onClick={redo}
        />
      )}
      <span className={styles.space}></span>
      <CircleButton
        icon="pan_tool"
        info="Seleccionar"
        isSelected={activeTool === null}
        onClick={() => setActiveTool(null)}
      />
      <CircleButton
        icon="title"
        info="Texto"
        isSelected={activeTool === TypeShape.TEXT}
        onClick={() => setActiveTool(TypeShape.TEXT)}
      />
      <CircleButton
        icon="remove"
        rotateIcon="rotate(45deg)"
        info="Línea"
        isSelected={activeTool === TypeShape.LINE}
        onClick={() => setActiveTool(TypeShape.LINE)}
      />
      <CircleButton
        icon="show_chart"
        info="Polilínea"
        isSelected={activeTool === TypeShape.POLYLINE}
        onClick={() => setActiveTool(TypeShape.POLYLINE)}
      />
      <CircleButton
        icon="check_box_outline_blank"
        info="Rectángulo"
        isSelected={activeTool === TypeShape.RECT}
        onClick={() => setActiveTool(TypeShape.RECT)}
      />
      <CircleButton
        icon="radio_button_unchecked"
        info="Elipse"
        isSelected={activeTool === TypeShape.ELLIPSE}
        onClick={() => setActiveTool(TypeShape.ELLIPSE)}
      />
      <span className={styles.space}></span>
      <CircleButton
        icon="zoom_in"
        info="Ampliar"
        onClick={() => changeZoom(true)}
      />
      <CircleButton
        icon="zoom_out"
        info="Disminuir"
        onClick={() => changeZoom(false)}
      />
      <CircleButton
        icon="fullscreen_exit"
        info="Reestablecer"
        onClick={() => changeZoom(100)}
      />
    </div>
  );
};
