import React, { useState } from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { PropertyAllowed } from '../../types/shape';
import { getPropertiesAllowed } from '../../services/shapeUtils';
import styles from './Property.module.scss';

export const Property: React.FC = () => {
  const { shapes, selectedShapeId, updateShapeProperties } = useWhiteboard();

  const selectedShape = shapes.find((s) => s.id === selectedShapeId);

  // Accordion state
  const [openSection, setOpenSection] = useState<'stroke' | 'fill' | 'text' | null>('stroke');

  if (!selectedShape) return null;

  const allowedProperties = getPropertiesAllowed(selectedShape.type);

  const isStrokeAllowed = allowedProperties.includes(PropertyAllowed.line);
  const isFillAllowed = allowedProperties.includes(PropertyAllowed.background);
  const isTextAllowed = allowedProperties.includes(PropertyAllowed.text);

  const toggleSection = (section: 'stroke' | 'fill' | 'text') => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleStrokeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateShapeProperties(selectedShape.id, {
      stroke: e.target.checked ? '#000000' : 'none',
    });
  };

  const handleFillToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateShapeProperties(selectedShape.id, {
      fill: e.target.checked ? '#ffffff' : 'none',
    });
  };

  return (
    <div className={styles.container}>
      {/* Contorno Panel */}
      {isStrokeAllowed && (
        <div className={styles.panel}>
          <div className={styles.panelHeader} onClick={() => toggleSection('stroke')}>
            <input
              type="checkbox"
              checked={selectedShape.stroke !== 'none'}
              onChange={handleStrokeToggle}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="material-icons">crop_square</span>
            <span className={styles.title}>Contorno</span>
          </div>
          {openSection === 'stroke' && selectedShape.stroke !== 'none' && (
            <div className={styles.panelBody}>
              <ColorPicker
                color={selectedShape.stroke || '#000000'}
                opacity={Number(selectedShape.strokeOpacity ?? 1)}
                onChange={({ color, opacity }) =>
                  updateShapeProperties(selectedShape.id, {
                    stroke: color,
                    strokeOpacity: opacity,
                  })
                }
              />
              <div className={styles.inputField}>
                <label>Grosor</label>
                <input
                  type="number"
                  min="1"
                  value={selectedShape.strokeWidth || 1}
                  onChange={(e) =>
                    updateShapeProperties(selectedShape.id, {
                      strokeWidth: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Relleno Panel */}
      {isFillAllowed && (
        <div className={styles.panel}>
          <div className={styles.panelHeader} onClick={() => toggleSection('fill')}>
            <input
              type="checkbox"
              checked={selectedShape.fill !== 'none'}
              onChange={handleFillToggle}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="material-icons">format_paint</span>
            <span className={styles.title}>Relleno</span>
          </div>
          {openSection === 'fill' && selectedShape.fill !== 'none' && (
            <div className={styles.panelBody}>
              <ColorPicker
                color={selectedShape.fill || '#ffffff'}
                opacity={Number(selectedShape.fillOpacity ?? 1)}
                onChange={({ color, opacity }) =>
                  updateShapeProperties(selectedShape.id, {
                    fill: color,
                    fillOpacity: opacity,
                  })
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Texto Panel */}
      {isTextAllowed && (
        <div className={styles.panel}>
          <div className={styles.panelHeader} onClick={() => toggleSection('text')}>
            <span className="material-icons">title</span>
            <span className={styles.title}>Texto</span>
          </div>
          {openSection === 'text' && (
            <div className={styles.panelBody}>
              <ColorPicker
                color={selectedShape.color || '#000000'}
                opacity={Number(selectedShape.opacity ?? 1)}
                onChange={({ color, opacity }) =>
                  updateShapeProperties(selectedShape.id, {
                    color,
                    opacity,
                  })
                }
              />
              <div className={styles.buttonGroup}>
                <button
                  onClick={() => updateShapeProperties(selectedShape.id, { textAlign: 'left' })}
                  className={selectedShape.textAlign === 'left' ? styles.active : ''}
                  title="Izquierda"
                >
                  <span className="material-icons">format_align_left</span>
                </button>
                <button
                  onClick={() => updateShapeProperties(selectedShape.id, { textAlign: 'center' })}
                  className={selectedShape.textAlign === 'center' ? styles.active : ''}
                  title="Centro"
                >
                  <span className="material-icons">format_align_center</span>
                </button>
                <button
                  onClick={() => updateShapeProperties(selectedShape.id, { textAlign: 'right' })}
                  className={selectedShape.textAlign === 'right' ? styles.active : ''}
                  title="Derecha"
                >
                  <span className="material-icons">format_align_right</span>
                </button>
                <button
                  onClick={() => updateShapeProperties(selectedShape.id, { textAlign: 'justify' })}
                  className={selectedShape.textAlign === 'justify' ? styles.active : ''}
                  title="Justificado"
                >
                  <span className="material-icons">format_align_justify</span>
                </button>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  onClick={() => updateShapeProperties(selectedShape.id, { verticalAlign: 'top' })}
                  className={selectedShape.verticalAlign === 'top' ? styles.active : ''}
                  title="Arriba"
                >
                  <span className="material-icons">vertical_align_top</span>
                </button>
                <button
                  onClick={() => updateShapeProperties(selectedShape.id, { verticalAlign: 'middle' })}
                  className={selectedShape.verticalAlign === 'middle' ? styles.active : ''}
                  title="Medio"
                >
                  <span className="material-icons">vertical_align_center</span>
                </button>
                <button
                  onClick={() => updateShapeProperties(selectedShape.id, { verticalAlign: 'bottom' })}
                  className={selectedShape.verticalAlign === 'bottom' ? styles.active : ''}
                  title="Abajo"
                >
                  <span className="material-icons">vertical_align_bottom</span>
                </button>
              </div>

              <div className={styles.inputField}>
                <label>Tamaño</label>
                <input
                  type="number"
                  min="1"
                  value={selectedShape.fontSize || 12}
                  onChange={(e) =>
                    updateShapeProperties(selectedShape.id, {
                      fontSize: Number(e.target.value),
                    })
                  }
                />
                <div className={styles.quickSizes}>
                  <button onClick={() => updateShapeProperties(selectedShape.id, { fontSize: 12 })}>
                    12
                  </button>
                  <button onClick={() => updateShapeProperties(selectedShape.id, { fontSize: 25 })}>
                    25
                  </button>
                  <button onClick={() => updateShapeProperties(selectedShape.id, { fontSize: 50 })}>
                    50
                  </button>
                  <button onClick={() => updateShapeProperties(selectedShape.id, { fontSize: 75 })}>
                    75
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
