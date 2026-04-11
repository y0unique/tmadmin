'use client';
import { useState, useEffect } from 'react';
import styles from './Modal.module.css';

const EMPTY = {
  item_name: '', item_description: '', item_location: '',
  item_category: '', item_quality: '', item_price: '', item_quantity: '',
};

export default function ItemModal({ item, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        item_name: item.item_name || '',
        item_description: item.item_description || '',
        item_location: item.item_location || '',
        item_category: item.item_category || '',
        item_quality: item.item_quality || '',
        item_price: item.item_price || '',
        item_quantity: item.item_quantity || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [item]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = isEdit ? `/api/items/${item.item_id}` : '/api/items';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={styles.modalTag}>{isEdit ? 'EDIT' : 'NEW'}</span>
            <h2>{isEdit ? 'Edit Item' : 'Add Item'}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Item Name</label>
              <input className={styles.input} name="item_name" value={form.item_name}
                onChange={handleChange} required placeholder="e.g. Action Figure" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <input className={styles.input} name="item_category" value={form.item_category}
                onChange={handleChange} placeholder="e.g. Collectibles" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea className={styles.textarea} name="item_description" value={form.item_description}
              onChange={handleChange} rows={3} placeholder="Item description..." />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Location</label>
              <input className={styles.input} name="item_location" value={form.item_location}
                onChange={handleChange} placeholder="e.g. Warehouse A" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Quality</label>
              <select className={styles.input} name="item_quality" value={form.item_quality} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="Mint">Mint</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Price (₱)</label>
              <input className={styles.input} type="number" step="0.01" min="0"
                name="item_price" value={form.item_price} onChange={handleChange} placeholder="0.00" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Quantity</label>
              <input className={styles.input} type="number" min="0"
                name="item_quantity" value={form.item_quantity} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
