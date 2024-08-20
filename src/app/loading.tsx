import React from 'react';
import styles from '@style/loading/Loading.module.scss';

const Loading = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>ZeroBeat</div>
      <div className={styles.iconWrapper}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <div className={styles.spinner}></div>
      </div>
      <div className={styles.loadingText}>Loading...</div>
    </div>
  );
};

export default Loading;