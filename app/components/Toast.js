'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext({ toast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ message, type = 'success', duration = 3000 }) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, duration);
  }, []);

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className={styles.container}>
        {toasts.map(t => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            <span className={styles.icon}>
              {t.type === 'success' && '✓'}
              {t.type === 'error'   && '✕'}
              {t.type === 'loading' && <span className={styles.spinner} />}
              {t.type === 'info'    && 'i'}
            </span>
            <span className={styles.message}>{t.message}</span>
            <button className={styles.close} onClick={() => remove(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
