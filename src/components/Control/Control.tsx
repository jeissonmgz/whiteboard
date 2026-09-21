import React from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { useI18n } from '../../i18n/I18nContext';
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
    selectedShapeIds,
    duplicateSelectedShapes,
    deleteShape,
    changeZoom,
  } = useWhiteboard();

  const { t } = useI18n();

  return (
    <div className={styles.container}>
      <CircleButton
        icon="undo"
        info={t('undo')}
        disabled={!canUndo}
        onClick={undo}
      />
      <CircleButton
        icon="redo"
        info={t('redo')}
        disabled={!canRedo}
        onClick={redo}
      />
      <CircleButton
        icon="content_copy"
        info={t('duplicate')}
        disabled={selectedShapeIds.length === 0}
        onClick={duplicateSelectedShapes}
      />
      <CircleButton
        icon="delete"
        info={t('delete')}
        disabled={selectedShapeIds.length === 0}
        onClick={() => deleteShape()}
      />
      <span className={styles.space}></span>
      <CircleButton
        icon="pan_tool"
        info={t('select')}
        isSelected={activeTool === null}
        onClick={() => setActiveTool(null)}
      />
      <CircleButton
        icon="title"
        info={t('text')}
        isSelected={activeTool === TypeShape.TEXT}
        onClick={() => setActiveTool(TypeShape.TEXT)}
      />
      <CircleButton
        icon="remove"
        rotateIcon="rotate(45deg)"
        info={t('line')}
        isSelected={activeTool === TypeShape.LINE}
        onClick={() => setActiveTool(TypeShape.LINE)}
      />
      <CircleButton
        icon="east"
        info={t('arrow')}
        isSelected={activeTool === TypeShape.ARROW}
        onClick={() => setActiveTool(TypeShape.ARROW)}
      />
      <CircleButton
        icon="edit"
        info={t('polyline')}
        isSelected={activeTool === TypeShape.POLYLINE}
        onClick={() => setActiveTool(TypeShape.POLYLINE)}
      />
      <CircleButton
        icon="check_box_outline_blank"
        info={t('rect')}
        isSelected={activeTool === TypeShape.RECT}
        onClick={() => setActiveTool(TypeShape.RECT)}
      />
      <CircleButton
        icon="radio_button_unchecked"
        info={t('ellipse')}
        isSelected={activeTool === TypeShape.ELLIPSE}
        onClick={() => setActiveTool(TypeShape.ELLIPSE)}
      />
      <span className={styles.space}></span>
      <CircleButton
        icon="zoom_in"
        info={t('zoomIn')}
        onClick={() => changeZoom(true)}
      />
      <CircleButton
        icon="zoom_out"
        info={t('zoomOut')}
        onClick={() => changeZoom(false)}
      />
      <CircleButton
        icon="fullscreen_exit"
        info={t('resetZoom')}
        onClick={() => changeZoom(100)}
      />
    </div>
  );
};
