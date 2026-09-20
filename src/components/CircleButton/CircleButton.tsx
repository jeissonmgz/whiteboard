import React from 'react';
import styles from './CircleButton.module.scss';

interface CircleButtonProps {
  icon: string;
  info?: string;
  rotateIcon?: string;
  isFloat?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | string;
  isSelected?: boolean;
  disabled?: boolean;
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
  disabled = false,
  onClick,
  onDoubleClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
}) => {
  let buttonClassName = styles.circleLink;
  if (isFloat) {
    buttonClassName += ` ${styles.float}`;
  } else if (!disabled) {
    buttonClassName += ` ${styles.moveHover}`;
  }

  if (isSelected) {
    buttonClassName += ` ${styles.selected}`;
  }

  const wrapperClassName = isFloat
    ? `${styles.buttonWrapper} ${styles.floatWrapper} ${styles[position] || ''}`
    : styles.buttonWrapper;

  const tooltipPositionClass = isFloat
    ? styles[`tooltip_${position}`] || styles.tooltip_default
    : styles.tooltip_default;

  return (
    <div className={wrapperClassName}>
      <button
        className={buttonClassName}
        aria-label={info}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
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

      {info && (
        <div className={`${styles.tooltip} ${tooltipPositionClass}`} role="tooltip">
          {info}
        </div>
      )}
    </div>
  );
};
