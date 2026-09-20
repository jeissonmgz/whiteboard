import React, { useRef } from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { useI18n } from '../../i18n/I18nContext';
import { CircleButton } from '../CircleButton/CircleButton';

export const Scroll: React.FC = () => {
  const { scroll } = useWhiteboard();
  const { t } = useI18n();
  const timerRef = useRef<number | null>(null);

  const HORIZONTAL = true;
  const VERTICAL = false;
  const LEFT_OR_UP = true;
  const RIGHT_OR_DOWN = false;

  const handleScroll = (isHorizontal: boolean, isTopOrLeft: boolean, value = 10) => {
    scroll(isHorizontal, isTopOrLeft, value);
  };

  const handleMouseDown = (isHorizontal: boolean, isTopOrLeft: boolean) => {
    stopScroll();
    timerRef.current = window.setInterval(() => {
      handleScroll(isHorizontal, isTopOrLeft, 10);
    }, 500);
  };

  const stopScroll = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <>
      <CircleButton
        isFloat={true}
        position="top"
        icon="keyboard_arrow_up"
        info={t('scrollUp')}
        onClick={() => handleScroll(VERTICAL, LEFT_OR_UP)}
        onDoubleClick={() => handleScroll(VERTICAL, LEFT_OR_UP, 80)}
        onMouseDown={() => handleMouseDown(VERTICAL, LEFT_OR_UP)}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
      />
      <CircleButton
        isFloat={true}
        position="bottom"
        icon="keyboard_arrow_down"
        info={t('scrollDown')}
        onClick={() => handleScroll(VERTICAL, RIGHT_OR_DOWN)}
        onDoubleClick={() => handleScroll(VERTICAL, RIGHT_OR_DOWN, 80)}
        onMouseDown={() => handleMouseDown(VERTICAL, RIGHT_OR_DOWN)}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
      />
      <CircleButton
        isFloat={true}
        position="left"
        icon="keyboard_arrow_left"
        info={t('scrollLeft')}
        onClick={() => handleScroll(HORIZONTAL, LEFT_OR_UP)}
        onDoubleClick={() => handleScroll(HORIZONTAL, LEFT_OR_UP, 80)}
        onMouseDown={() => handleMouseDown(HORIZONTAL, LEFT_OR_UP)}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
      />
      <CircleButton
        isFloat={true}
        position="right"
        icon="keyboard_arrow_right"
        info={t('scrollRight')}
        onClick={() => handleScroll(HORIZONTAL, RIGHT_OR_DOWN)}
        onDoubleClick={() => handleScroll(HORIZONTAL, RIGHT_OR_DOWN, 80)}
        onMouseDown={() => handleMouseDown(HORIZONTAL, RIGHT_OR_DOWN)}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
      />
    </>
  );
};
