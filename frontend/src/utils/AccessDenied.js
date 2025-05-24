import React from 'react';
import styles from './css/AccessDenied.module.css'; // Import the CSS module

const AccessDenied = () => {
  return (
    <div className={styles.accessDeniedContainer}>
      <p className={styles.accessDeniedMessage}>You do not have access to this component</p>
    </div>
  );
};

export default AccessDenied;
