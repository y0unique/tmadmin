'use client';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import styles from './ItemModal.module.css';

const EMPTY = {
  item_name: '', item_description: '', item_location: '',
  item_category: '', item_quality: '', item_price: '',
  item_quantity: '', item_image: 'n/a',
};

const QUALITY_OPTIONS = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

// View-only field component
function ViewField({ label, value, wide }) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <label className={styles.label}>{label}</label>
      <div className={styles.viewValue}>{value || <span className={styles.empty}>—</span>}</div>
    </div>
  );
}

export default function ItemModal({ item, mode = 'add', onClose, onSaved }) {
  const { toast } = useToast();
  const isAdd     = mode === 'add';
  const [locked, setLocked]   = useState(!isAdd); // view mode = locked
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        item_name:        item.item_name        || '',
        item_description: item.item_description || '',
        item_location:    item.item_location    || '',
        item_category:    item.item_category    || '',
        item_quality:     item.item_quality     || '',
        item_price:       item.item_price       || '',
        item_quantity:    item.item_quantity     || '',
        item_image:       item.item_image        || 'n/a',
      });
    } else {
      setForm(EMPTY);
    }
    setLocked(!isAdd);
  }, [item, isAdd]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url    = isAdd ? '/api/items' : `/api/items/${item.item_id}`;
      const method = isAdd ? 'POST' : 'PUT';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      toast({ message: isAdd ? 'Item added successfully!' : 'Item updated successfully!', type: 'success' });
      onSaved();
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={`${styles.modalTag} ${!isAdd && locked ? styles.tagView : ''}`}>
              {isAdd ? 'NEW ITEM' : locked ? 'VIEWING' : 'EDITING'}
            </span>
            <h2>{isAdd ? 'Add Item' : form.item_name || 'Item Details'}</h2>
          </div>
          <div className={styles.modalHeaderRight}>
            {/* Unlock/Lock toggle — only for existing items */}
            {!isAdd && (
              <button
                className={`${styles.lockBtn} ${locked ? styles.lockBtnLocked : styles.lockBtnUnlocked}`}
                onClick={() => setLocked(l => !l)}
                title={locked ? 'Unlock to edit' : 'Lock editing'}
              >
                {locked ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Unlock to Edit
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                    </svg>
                    Lock
                  </>
                )}
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body */}
        {locked && !isAdd ? (
          // ── VIEW MODE ────────────────────────────────────────────
          <div className={styles.viewBody}>
            <div className={styles.viewGrid}>
              <ViewField label="Item ID"     value={`#${item?.item_id}`} />
              <ViewField label="Quality"     value={item?.item_quality} />
              <ViewField label="Name"        value={item?.item_name} wide />
              <ViewField label="Category"    value={item?.item_category} />
              <ViewField label="Location"    value={item?.item_location} />
              <ViewField label="Price"       value={item?.item_price ? `₱${parseFloat(item.item_price).toLocaleString()}` : '—'} />
              <ViewField label="Quantity"    value={item?.item_quantity} />
              <ViewField label="Description" value={item?.item_description} wide />
            </div>

            {/* Item image */}
            {item?.item_image && item.item_image !== 'n/a' && (
              <div className={styles.imageWrap}>
                <label className={styles.label}>Image</label>
                <img
                  src={item.item_image}
                  alt={item.item_name}
                  className={styles.itemImage}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <div className={styles.viewMeta}>
              {item?.item_dateAdded && (
                <span>Added: {new Date(item.item_dateAdded).toLocaleString('en-PH')}</span>
              )}
              {item?.item_lastUpdate && (
                <span>Updated: {new Date(item.item_lastUpdate).toLocaleString('en-PH')}</span>
              )}
            </div>
          </div>
        ) : (
          // ── EDIT / ADD MODE ──────────────────────────────────────
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Item Name <span className={styles.req}>*</span></label>
                <input className={styles.input} name="item_name" value={form.item_name}
                  onChange={handleChange} required placeholder="e.g. Luffy Gear Five #1607" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <input className={styles.input} name="item_category" value={form.item_category}
                  onChange={handleChange} placeholder="e.g. Normal" />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea className={styles.textarea} name="item_description" value={form.item_description}
                onChange={handleChange} rows={2} placeholder="e.g. FUNKO" />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Location</label>
                <input className={styles.input} name="item_location" value={form.item_location}
                  onChange={handleChange} placeholder="e.g. Rack 7 Top" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Quality</label>
                <select className={styles.input} name="item_quality" value={form.item_quality} onChange={handleChange}>
                  <option value="">— Select —</option>
                  {QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
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

            <div className={styles.field}>
              <label className={styles.label}>Image Path</label>
              <input className={styles.input} name="item_image" value={form.item_image}
                onChange={handleChange} placeholder="/assets/ItemsImages/filename.jpg" />
              <span className={styles.hint}>Upload images to /public/assets/ItemsImages/ then enter the path here</span>
            </div>

            {/* Image preview */}
            {form.item_image && form.item_image !== 'n/a' && (
              <div className={styles.imageWrap}>
                <label className={styles.label}>Image Preview</label>
                <img src={form.item_image} alt="Preview" className={styles.itemImage}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={saving}>
                {saving ? (
                  <><span className={styles.btnSpinner} /> Saving...</>
                ) : (
                  isAdd ? 'Add Item' : 'Save Changes'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
