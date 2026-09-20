import React from 'react';
import styles from './ColorPicker.module.scss';

interface ColorPickerProps {
  color?: string;
  opacity?: number;
  onChange: (values: { color: string; opacity: number }) => void;
}

const COLORS: string[][] = [
  ['#000000', '#9e9e9e', '#fafafa', '#f5f5f5', '#eeeeee', '#e0e0e0', '#bdbdbd', '#757575', '#616161', '#212121', '#ffffff'],
  ['#2196F3', '#0091ea', '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'],
  ['#4CAF50', '#00c853', '#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#43a047', '#388e3c', '#2e7d32', '#1b5e20'],
  ['#ffeb3b', '#ffea00', '#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#fdd835', '#fbc02d', '#f9a825', '#f57f17'],
  ['#ff5722', '#ff3d00', '#fbe9e7', '#ffccbc', '#ffab91', '#ff8a65', '#ff7043', '#f4511e', '#e64a19', '#d84315', '#bf360c'],
  ['#f44336', '#d50000', '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#e53935', '#d32f2f', '#c62828', '#b71c1c'],
  ['#e91e63', '#f50057', '#fce4ec', '#f8bbd0', '#f48fb1', '#f06292', '#ec407a', '#d81b60', '#c2185b', '#ad1457', '#880e4f'],
  ['#9c27b0', '#6200ea', '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c'],
  ['#795548', '#827717', '#efebe9', '#d7ccc8', '#bcaaa4', '#a1887f', '#8d6e63', '#6d4c41', '#5d4037', '#4e342e', '#3e2723'],
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color = '#000000',
  opacity = 1,
  onChange,
}) => {
  const handleColorChange = (newColor: string) => {
    onChange({ color: newColor, opacity });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    onChange({ color, opacity: newOpacity });
  };

  return (
    <div className={styles.colorPickerContainer}>
      <div className={styles.inputRow}>
        <label className={styles.label}>Color</label>
        <input
          type="color"
          value={color === 'none' ? '#ffffff' : color}
          onChange={(e) => handleColorChange(e.target.value)}
          className={styles.nativeColorInput}
        />
      </div>

      <div className={styles.paletteContainer}>
        <div className={styles.colorGrid}>
          {COLORS.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.column}>
              {row.map((cellColor, cellIndex) => (
                <div
                  key={cellIndex}
                  className={styles.colorCell}
                  style={{ backgroundColor: cellColor }}
                  title={cellColor}
                  onClick={() => handleColorChange(cellColor)}
                />
              ))}
            </div>
          ))}
        </div>

        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={handleOpacityChange}
            className={styles.verticalSlider}
            title={`Opacidad: ${Math.round(opacity * 100)}%`}
          />
          <span className={styles.opacityValue}>{Math.round(opacity * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
