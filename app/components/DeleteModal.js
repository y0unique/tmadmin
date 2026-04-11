'use client';
import { useState } from 'react';
import styles from './Modal.module.css';

export default function DeleteModal({ item, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/items/${item.item_id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete');
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.deleteModal}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={`${styles.modalTag} ${styles.dangerTag}`}>DANGER</span>
            <h2>Delete Item</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.deleteBody}>
          <p className={styles.deleteMessage}>
            Are you sure you want to delete <strong>{item.item_name}</strong>?
          </p>
          <p className={styles.deleteSubtext}>This action cannot be undone.</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.dangerBtn} onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
