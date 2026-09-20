import React from 'react';
import styles from './HeaderBrand.module.scss';

export const HeaderBrand: React.FC = () => {
  return (
    <div className={styles.brandWrapper} title="Whiteboard Infinite Canvas">
      <span className={`material-icons ${styles.brandIcon}`}>draw</span>
      <span className={styles.brandTitle}>Whiteboard</span>
    </div>
  );
};
