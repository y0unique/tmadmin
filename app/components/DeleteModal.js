'use client';
import { useState } from 'react';
import { useToast } from './Toast';
import styles from './DeleteModal.module.css';

export default function DeleteModal({ item, onClose, onDeleted }) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${item.item_id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete');
      toast({ message: `"${item.item_name}" has been removed.`, type: 'success' });
      onDeleted();
    } catch (err) {
      toast({ message: err.message, type: 'error' });
      setDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={styles.dangerTag}>REMOVE ITEM</span>
            <h2>Confirm Deletion</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={deleting}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.warningIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <p className={styles.message}>
            Are you sure you want to remove <strong>{item.item_name}</strong>?
          </p>
          <p className={styles.subtext}>
            This will set the item to inactive. It will no longer appear in the inventory table.
          </p>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={deleting}>Cancel</button>
          <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <><span className={styles.spinner} /> Removing...</>
            ) : (
              'Yes, Remove'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
