import React from 'react';
import styles from './ColorPicker.module.scss';

interface ColorPickerProps {
  color?: string;
  opacity?: number;
  allowNone?: boolean;
  onChange: (values: { color: string; opacity: number }) => void;
}

const COLORS: string[][] = [
  [
    'var(--color-gray-900)',
    'var(--color-gray-700)',
    'var(--color-gray-100)',
    'var(--color-gray-200)',
    'var(--color-gray-300)',
    'var(--color-gray-400)',
    'var(--color-gray-500)',
    'var(--color-gray-600)',
    'var(--color-gray-700)',
    'var(--color-gray-800)',
    'var(--color-gray-900)',
  ],
  [
    'var(--color-blue-500)',
    'var(--color-blue-600)',
    'var(--color-blue-100)',
    'var(--color-blue-200)',
    'var(--color-blue-300)',
    'var(--color-blue-400)',
    'var(--color-blue-500)',
    'var(--color-blue-600)',
    'var(--color-blue-700)',
    'var(--color-blue-800)',
    'var(--color-blue-900)',
  ],
  [
    'var(--color-green-500)',
    'var(--color-green-600)',
    'var(--color-green-100)',
    'var(--color-green-200)',
    'var(--color-green-300)',
    'var(--color-green-400)',
    'var(--color-green-500)',
    'var(--color-green-600)',
    'var(--color-green-700)',
    'var(--color-green-800)',
    'var(--color-green-900)',
  ],
  [
    'var(--color-yellow-500)',
    'var(--color-yellow-600)',
    'var(--color-yellow-100)',
    'var(--color-yellow-200)',
    'var(--color-yellow-300)',
    'var(--color-yellow-400)',
    'var(--color-yellow-500)',
    'var(--color-yellow-600)',
    'var(--color-yellow-700)',
    'var(--color-yellow-800)',
    'var(--color-yellow-900)',
  ],
  [
    'var(--color-orange-500)',
    'var(--color-orange-600)',
    'var(--color-orange-100)',
    'var(--color-orange-200)',
    'var(--color-orange-300)',
    'var(--color-orange-400)',
    'var(--color-orange-500)',
    'var(--color-orange-600)',
    'var(--color-orange-700)',
    'var(--color-orange-800)',
    'var(--color-orange-900)',
  ],
  [
    'var(--color-red-500)',
    'var(--color-red-600)',
    'var(--color-red-100)',
    'var(--color-red-200)',
    'var(--color-red-300)',
    'var(--color-red-400)',
    'var(--color-red-500)',
    'var(--color-red-600)',
    'var(--color-red-700)',
    'var(--color-red-800)',
    'var(--color-red-900)',
  ],
  [
    'var(--color-pink-500)',
    'var(--color-pink-600)',
    'var(--color-pink-100)',
    'var(--color-pink-200)',
    'var(--color-pink-300)',
    'var(--color-pink-400)',
    'var(--color-pink-500)',
    'var(--color-pink-600)',
    'var(--color-pink-700)',
    'var(--color-pink-800)',
    'var(--color-pink-900)',
  ],
  [
    'var(--color-purple-500)',
    'var(--color-purple-600)',
    'var(--color-purple-100)',
    'var(--color-purple-200)',
    'var(--color-purple-300)',
    'var(--color-purple-400)',
    'var(--color-purple-500)',
    'var(--color-purple-600)',
    'var(--color-purple-700)',
    'var(--color-purple-800)',
    'var(--color-purple-900)',
  ],
];

function getComputedHex(colorStr?: string): string {
  if (!colorStr || colorStr === 'none') return '#ffffff';
  if (colorStr.startsWith('#')) return colorStr;
  if (colorStr.startsWith('var(')) {
    const varName = colorStr.replace(/var\((--[^)]+)\)/, '$1').trim();
    if (typeof window !== 'undefined') {
      const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (val && val.startsWith('#')) {
        return val;
      }
    }
  }
  return '#000000';
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color = '#000000',
  opacity = 1,
  allowNone = false,
  onChange,
}) => {
  const handleColorChange = (newColor: string) => {
    onChange({ color: newColor, opacity });
  };

  const handleOpacityChange = (newOpacity: number) => {
    onChange({ color, opacity: newOpacity });
  };

  const computedHex = getComputedHex(color);
  const opacityPercent = Math.round(opacity * 100);

  return (
    <div className={styles.colorPickerContainer}>
      {/* Header Row: Native Picker Trigger & Color Label */}
      <div className={styles.headerRow}>
        <div className={styles.customColorPicker}>
          <div
            className={styles.swatchPreview}
            style={{ backgroundColor: color === 'none' ? 'transparent' : color }}
          >
            {color === 'none' && <span className="material-icons">block</span>}
          </div>
          <input
            type="color"
            value={computedHex}
            onChange={(e) => handleColorChange(e.target.value)}
            className={styles.nativeColorInput}
            title="Seleccionar color personalizado"
          />
          <span className={styles.colorHexCode}>
            {color === 'none' ? 'Transparente' : color.startsWith('var(') ? 'Paleta Tema' : color.toUpperCase()}
          </span>
        </div>

        {allowNone && (
          <button
            type="button"
            className={`${styles.noneBtn} ${color === 'none' ? styles.activeNone : ''}`}
            onClick={() => handleColorChange('none')}
            title="Sin color / Transparente"
          >
            <span className="material-icons">block</span>
            <span>Sin color</span>
          </button>
        )}
      </div>

      {/* Color Swatch Grid (Larger 18px x 18px swatches) */}
      <div className={styles.colorGridContainer}>
        <div className={styles.colorGrid}>
          {COLORS.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cellColor, cellIndex) => (
                <button
                  key={cellIndex}
                  type="button"
                  className={`${styles.colorCell} ${color === cellColor ? styles.selectedCell : ''}`}
                  style={{ backgroundColor: cellColor }}
                  title={cellColor}
                  onClick={() => handleColorChange(cellColor)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal Opacity Slider Control */}
      <div className={styles.opacitySection}>
        <div className={styles.opacityHeader}>
          <div className={styles.opacityTitle}>
            <span className="material-icons">opacity</span>
            <span>Opacidad</span>
          </div>
          <span className={styles.opacityBadge}>{opacityPercent}%</span>
        </div>

        <div className={styles.sliderRow}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            className={styles.horizontalSlider}
            title={`Opacidad actual: ${opacityPercent}%`}
          />
        </div>

        <div className={styles.opacityPresets}>
          {[0.25, 0.5, 0.75, 1].map((val) => (
            <button
              key={val}
              type="button"
              className={`${styles.presetChip} ${Math.abs(opacity - val) < 0.02 ? styles.activeChip : ''}`}
              onClick={() => handleOpacityChange(val)}
            >
              {Math.round(val * 100)}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


