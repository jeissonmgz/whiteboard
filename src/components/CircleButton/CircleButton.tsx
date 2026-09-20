import React from 'react';
import styles from './CircleButton.module.scss';

interface CircleButtonProps {
  icon: string;
  info?: string;
  rotateIcon?: string;
  isFloat?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | string;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const CircleButton: React.FC<CircleButtonProps> = ({
  icon,
  info,
  rotateIcon,
  isFloat = false,
  position = '',
  isSelected = false,
  onClick,
  onDoubleClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
}) => {
  let buttonClassName = styles.circleLink;
  if (isFloat) {
    buttonClassName += ` ${styles.float} ${styles[position] || ''}`;
  } else {
    buttonClassName += ` ${styles.moveHover}`;
  }

  if (isSelected) {
    buttonClassName += ` ${styles.selected}`;
  }

  return (
    <button
      className={buttonClassName}
      title={info}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <span
        className="material-icons"
        style={{ transform: rotateIcon || undefined }}
      >
        {icon}
      </span>
    </button>
  );
};
