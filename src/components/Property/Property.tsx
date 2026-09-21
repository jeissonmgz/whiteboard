import React, { useState, useRef, useEffect } from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { useI18n } from '../../i18n/I18nContext';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { PropertyAllowed, TypeShape } from '../../types/shape';
import { getPropertiesAllowed } from '../../services/shapeUtils';
import styles from './Property.module.scss';

export const Property: React.FC = () => {
  const {
    shapes,
    selectedShapeId,
    updateShapeProperties,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    deleteShape,
  } = useWhiteboard();

  const { t } = useI18n();

  // Accordion state - default stroke open
  const [openSection, setOpenSection] = useState<'stroke' | 'fill' | 'text' | 'layer' | null>('stroke');

  // Minimize / Collapse state - default collapsed on mobile/tablet (< 1024px)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Position & Drag state
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Clamp position when window is resized
  useEffect(() => {
    const handleResize = () => {
      setPos((prevPos) => {
        if (!prevPos || !containerRef.current) return prevPos;
        const rect = containerRef.current.getBoundingClientRect();
        const margin = 10;
        const maxX = Math.max(0, window.innerWidth - rect.width - margin);
        const maxY = Math.max(0, window.innerHeight - rect.height - margin);
        return {
          x: Math.min(Math.max(margin, prevPos.x), maxX),
          y: Math.min(Math.max(margin, prevPos.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedShape = shapes.find((s) => s.id === selectedShapeId);

  // Drag handlers for floating property menu with viewport boundary clamping
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only initiate drag when clicking header background or title (not toggle button or inputs)
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input')
    ) {
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;

    const rawX = e.clientX - dragOffsetRef.current.x;
    const rawY = e.clientY - dragOffsetRef.current.y;

    // Keep card strictly within viewport bounds with 10px margin
    const margin = 10;
    const maxX = Math.max(0, window.innerWidth - cardWidth - margin);
    const maxY = Math.max(0, window.innerHeight - cardHeight - margin);

    const clampedX = Math.min(Math.max(margin, rawX), maxX);
    const clampedY = Math.min(Math.max(margin, rawY), maxY);

    setPos({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  };

  if (!selectedShape) return null;

  const allowedProperties = getPropertiesAllowed(selectedShape.type);

  const isStrokeAllowed = allowedProperties.includes(PropertyAllowed.line);
  const isFillAllowed = allowedProperties.includes(PropertyAllowed.background);
  const isTextAllowed = allowedProperties.includes(PropertyAllowed.text);

  const toggleSection = (section: 'stroke' | 'fill' | 'text' | 'layer') => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleStrokeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateShapeProperties(selectedShape.id, {
      stroke: e.target.checked ? 'var(--text-primary)' : 'none',
    });
  };

  const handleFillToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateShapeProperties(selectedShape.id, {
      fill: e.target.checked ? 'var(--bg-surface-solid)' : 'none',
    });
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${collapsed ? styles.collapsed : ''}`}
      style={
        pos
          ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto', transform: 'none' }
          : undefined
      }
    >
      <div
        className={styles.mainHeader}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(!collapsed);
        }}
      >
        <div className={styles.headerTitle}>
          <span className="material-icons">tune</span>
          <span className={styles.mainTitle}>{t('propertiesTitle')}</span>
        </div>
        <button
          className={styles.toggleBtn}
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed(!collapsed);
          }}
          title={collapsed ? t('expandProperties') : t('collapseProperties')}
        >
          <span className="material-icons">
            {collapsed ? 'unfold_more' : 'unfold_less'}
          </span>
        </button>
      </div>

      {!collapsed && (
        <div className={styles.accordionList}>
          {/* Contorno Panel */}
          {isStrokeAllowed && (
            <div className={`${styles.panel} ${openSection === 'stroke' ? styles.panelOpen : ''}`}>
              <div className={styles.panelHeader} onClick={() => toggleSection('stroke')}>
                <div className={styles.headerLeft}>
                  <input
                    type="checkbox"
                    checked={selectedShape.stroke !== 'none'}
                    onChange={handleStrokeToggle}
                    onClick={(e) => e.stopPropagation()}
                    title={t('stroke')}
                  />
                  <span className="material-icons">crop_square</span>
                  <span className={styles.title}>{t('stroke')}</span>
                </div>
                <span className={`material-icons ${styles.chevron}`}>
                  {openSection === 'stroke' ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {openSection === 'stroke' && selectedShape.stroke !== 'none' && (
                <div className={styles.panelBody}>
                  <ColorPicker
                    color={selectedShape.stroke || 'var(--text-primary)'}
                    opacity={Number(selectedShape.strokeOpacity ?? 1)}
                    allowNone={true}
                    onChange={({ color, opacity }) =>
                      updateShapeProperties(selectedShape.id, {
                        stroke: color,
                        strokeOpacity: opacity,
                      })
                    }
                  />
                  <div className={styles.inputField}>
                    <label>{t('strokeWidth')}</label>
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
                    <div className={styles.quickSizes}>
                      {[1, 2, 4, 8, 12].map((w) => (
                        <button
                          key={w}
                          type="button"
                          className={Number(selectedShape.strokeWidth || 1) === w ? styles.activeSize : ''}
                          onClick={() => updateShapeProperties(selectedShape.id, { strokeWidth: w })}
                        >
                          {w}px
                        </button>
                      ))}
                    </div>
                  </div>
                  {(selectedShape.type === TypeShape.LINE || selectedShape.type === TypeShape.ARROW) && (
                    <div className={styles.arrowheadControls}>
                      <div className={styles.sectionLabel}>{t('arrowEnds')}</div>
                      <label className={styles.checkboxOption}>
                        <input
                          type="checkbox"
                          checked={!!selectedShape.markerStart}
                          onChange={(e) =>
                            updateShapeProperties(selectedShape.id, {
                              markerStart: e.target.checked,
                            })
                          }
                        />
                        <span>{t('arrowStart')}</span>
                      </label>
                      <label className={styles.checkboxOption}>
                        <input
                          type="checkbox"
                          checked={!!selectedShape.markerEnd}
                          onChange={(e) =>
                            updateShapeProperties(selectedShape.id, {
                              markerEnd: e.target.checked,
                            })
                          }
                        />
                        <span>{t('arrowEnd')}</span>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Relleno Panel */}
          {isFillAllowed && (
            <div className={`${styles.panel} ${openSection === 'fill' ? styles.panelOpen : ''}`}>
              <div className={styles.panelHeader} onClick={() => toggleSection('fill')}>
                <div className={styles.headerLeft}>
                  <input
                    type="checkbox"
                    checked={selectedShape.fill !== 'none'}
                    onChange={handleFillToggle}
                    onClick={(e) => e.stopPropagation()}
                    title={t('fill')}
                  />
                  <span className="material-icons">format_paint</span>
                  <span className={styles.title}>{t('fill')}</span>
                </div>
                <span className={`material-icons ${styles.chevron}`}>
                  {openSection === 'fill' ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {openSection === 'fill' && selectedShape.fill !== 'none' && (
                <div className={styles.panelBody}>
                  <ColorPicker
                    color={selectedShape.fill || 'var(--bg-surface-solid)'}
                    opacity={Number(selectedShape.fillOpacity ?? 1)}
                    allowNone={true}
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
            <div className={`${styles.panel} ${openSection === 'text' ? styles.panelOpen : ''}`}>
              <div className={styles.panelHeader} onClick={() => toggleSection('text')}>
                <div className={styles.headerLeft}>
                  <span className="material-icons">title</span>
                  <span className={styles.title}>{t('text')}</span>
                </div>
                <span className={`material-icons ${styles.chevron}`}>
                  {openSection === 'text' ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {openSection === 'text' && (
                <div className={styles.panelBody}>
                  <ColorPicker
                    color={selectedShape.color || 'var(--text-primary)'}
                    opacity={Number(selectedShape.opacity ?? 1)}
                    onChange={({ color, opacity }) =>
                      updateShapeProperties(selectedShape.id, {
                        color,
                        opacity,
                      })
                    }
                  />
                  <div className={styles.sectionLabel}>{t('textAlignHorizontal')}</div>
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      onClick={() => updateShapeProperties(selectedShape.id, { textAlign: 'left' })}
                      className={selectedShape.textAlign === 'left' ? styles.active : ''}
                      title={t('left')}
                    >
                      <span className="material-icons">format_align_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateShapeProperties(selectedShape.id, { textAlign: 'center' })}
                      className={selectedShape.textAlign === 'center' ? styles.active : ''}
                      title={t('center')}
                    >
                      <span className="material-icons">format_align_center</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateShapeProperties(selectedShape.id, { textAlign: 'right' })}
                      className={selectedShape.textAlign === 'right' ? styles.active : ''}
                      title={t('right')}
                    >
                      <span className="material-icons">format_align_right</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateShapeProperties(selectedShape.id, { textAlign: 'justify' })}
                      className={selectedShape.textAlign === 'justify' ? styles.active : ''}
                      title={t('justify')}
                    >
                      <span className="material-icons">format_align_justify</span>
                    </button>
                  </div>

                  <div className={styles.sectionLabel}>{t('textAlignVertical')}</div>
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      onClick={() => updateShapeProperties(selectedShape.id, { verticalAlign: 'top' })}
                      className={selectedShape.verticalAlign === 'top' ? styles.active : ''}
                      title={t('top')}
                    >
                      <span className="material-icons">vertical_align_top</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateShapeProperties(selectedShape.id, { verticalAlign: 'middle' })}
                      className={selectedShape.verticalAlign === 'middle' ? styles.active : ''}
                      title={t('middle')}
                    >
                      <span className="material-icons">vertical_align_center</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateShapeProperties(selectedShape.id, { verticalAlign: 'bottom' })}
                      className={selectedShape.verticalAlign === 'bottom' ? styles.active : ''}
                      title={t('bottom')}
                    >
                      <span className="material-icons">vertical_align_bottom</span>
                    </button>
                  </div>

                  <div className={styles.inputField}>
                    <label>{t('fontSize')}</label>
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
                      {[12, 18, 24, 36, 50, 75].map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={selectedShape.fontSize === size ? styles.activeSize : ''}
                          onClick={() => updateShapeProperties(selectedShape.id, { fontSize: size })}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Capa / Orden Panel */}
          <div className={`${styles.panel} ${openSection === 'layer' ? styles.panelOpen : ''}`}>
            <div className={styles.panelHeader} onClick={() => toggleSection('layer')}>
              <div className={styles.headerLeft}>
                <span className="material-icons">layers</span>
                <span className={styles.title}>{t('layerOrder')}</span>
              </div>
              <span className={`material-icons ${styles.chevron}`}>
                {openSection === 'layer' ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {openSection === 'layer' && (
              <div className={styles.panelBody}>
                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    onClick={bringToFront}
                    title={t('bringToFront')}
                  >
                    <span className="material-icons">flip_to_front</span>
                  </button>
                  <button
                    type="button"
                    onClick={bringForward}
                    title={t('bringForward')}
                  >
                    <span className="material-icons">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    onClick={sendBackward}
                    title={t('sendBackward')}
                  >
                    <span className="material-icons">arrow_downward</span>
                  </button>
                  <button
                    type="button"
                    onClick={sendToBack}
                    title={t('sendToBack')}
                  >
                    <span className="material-icons">flip_to_back</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => deleteShape()}
            title={t('delete')}
          >
            <span className="material-icons">delete_sweep</span>
            <span>{t('deleteShape')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
