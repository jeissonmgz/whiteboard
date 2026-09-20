import React, { useState } from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { useI18n } from '../../i18n/I18nContext';
import { CircleButton } from '../CircleButton/CircleButton';
import { useWhiteboardStore } from '../../store/useWhiteboardStore';
import {
  exportCanvasImage,
  saveProjectJSON,
  loadProjectJSON,
  printCanvas,
  ExportFormat,
  ExportScope,
} from '../../services/exportUtils';
import styles from './ExportModal.module.scss';

export const ExportModal: React.FC = () => {
  const { shapes, selectedShapeIds, viewBox } = useWhiteboard();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scope, setScope] = useState<ExportScope>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      await exportCanvasImage({
        format,
        scope,
        shapes,
        selectedShapeIds,
        viewBox,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveJSON = () => {
    saveProjectJSON(shapes, viewBox);
  };

  const handleLoadJSON = () => {
    loadProjectJSON((loadedShapes, loadedViewBox) => {
      useWhiteboardStore.getState().setShapes(loadedShapes);
      if (loadedViewBox) {
        useWhiteboardStore.getState().setViewBox(loadedViewBox);
      }
      setIsOpen(false);
    });
  };

  const handlePrint = () => {
    printCanvas();
  };

  return (
    <div className={styles.wrapper}>
      <CircleButton
        icon="file_download"
        info={t('exportMenu')}
        position="bottom-left"
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <span className="material-icons">file_present</span>
                <span>{t('exportModalTitle')}</span>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className={styles.body}>
              {/* Image & Vector Export Section */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <span className="material-icons">image</span>
                  <span>{t('exportAsImage')}</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label>{t('format')}:</label>
                  <div className={styles.pillGroup}>
                    {(['png', 'jpg', 'svg'] as ExportFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        className={`${styles.pill} ${format === fmt ? styles.activePill : ''}`}
                        onClick={() => setFormat(fmt)}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label>{t('scope')}:</label>
                  <div className={styles.pillGroup}>
                    <button
                      type="button"
                      className={`${styles.pill} ${scope === 'all' ? styles.activePill : ''}`}
                      onClick={() => setScope('all')}
                    >
                      {t('scopeAll')}
                    </button>
                    <button
                      type="button"
                      className={`${styles.pill} ${scope === 'selection' ? styles.activePill : ''}`}
                      disabled={selectedShapeIds.length === 0}
                      onClick={() => setScope('selection')}
                    >
                      {t('scopeSelection')}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.actionBtn}
                  disabled={isExporting}
                  onClick={handleExportImage}
                >
                  <span className="material-icons">download</span>
                  <span>{t('download')} ({format.toUpperCase()})</span>
                </button>
              </div>

              <div className={styles.divider} />

              {/* JSON Project File Section */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <span className="material-icons">folder</span>
                  <span>{t('saveProject').split(' ')[0]} / {t('loadProject').split(' ')[0]}</span>
                </div>

                <div className={styles.buttonRow}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={handleSaveJSON}
                  >
                    <span className="material-icons">save_alt</span>
                    <span>{t('saveProject')}</span>
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={handleLoadJSON}
                  >
                    <span className="material-icons">folder_open</span>
                    <span>{t('loadProject')}</span>
                  </button>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Print Section */}
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.printBtn}
                  onClick={handlePrint}
                >
                  <span className="material-icons">print</span>
                  <span>{t('print')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
