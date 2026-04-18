'use client';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import styles from './ItemModal.module.css';

// ── Dropdown options ──────────────────────────────────────────────────────────
const ITEM_TYPES = ['N/A', 'Funko', 'Disposable'];

const ITEM_CATEGORIES = [
  'N/A', 'ANIMATION', 'GAMES', 'MOVIES', 'NONE', 'STAGES',
  'ROCKS', 'FOOTBALL', 'PROTECTOR', 'TELEVISION', 'COMIC COVER', 'RACING',
];

const ITEM_QUALITIES = [
  'N/A', "Collector's Grade", 'Standard Grade', 'Substandard Grade', 'Damaged Grade',
];

const ITEM_SIZES = [
  'N/A', 'REGULAR 4"', 'SUPER 6"', 'JUMBO 10"', 'PLUS', 'DELUXE',
  'MOMENT', 'BITTY', 'KEYCHAIN', '2PACK', 'COVER', 'PREMIUM', 'POSTER',
];

const ITEM_STICKERS = [
  'N/A', 'SPECIAL', 'NONE', 'BIG APPLE', 'FUNIMATION', 'SHARED',
  'HOTTOPIC', 'EE', 'AAA', 'BOXLUNCH', 'CHALICE', 'FUNKO', 'CRUNCHY ROLL',
];

const SHOPEE_FEE_RATE = 0.20;

function fmt(val) {
  return `₱${parseFloat(val || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function computeStats(item) {
  const srp = parseFloat(item?.item_srp)      || 0;
  const acq = parseFloat(item?.item_acqprice) || 0;
  const qty = parseInt(item?.item_quantity)   || 0;
  const mup     = acq > 0 ? srp / acq : 0;
  const wsp     = srp * qty;
  const wspSrp  = wsp - srp;
  const spFee   = wsp - srp * (1 - SHOPEE_FEE_RATE);
  return { mup, wsp, wspSrp, spFee };
}

const EMPTY = {
  item_name: '', item_title: '', item_type: 'N/A', item_description: '',
  item_location: '', item_category: 'N/A', item_quality: 'N/A',
  item_size: 'N/A', item_sticker: 'N/A',
  item_acqprice: '', item_srp: '', item_quantity: '', item_image: 'n/a',
};

// Convert Google Drive share link to direct image URL
function convertDriveLink(url) {
  if (!url) return url;
  // Handle: https://drive.google.com/file/d/FILE_ID/view
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  // Handle: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return `https://drive.google.com/uc?export=view&id=${match2[1]}`;
  return url;
}

function ViewField({ label, value, wide }) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <label className={styles.label}>{label}</label>
      <div className={styles.viewValue}>{value || <span className={styles.emptyVal}>—</span>}</div>
    </div>
  );
}

function Select({ name, value, onChange, options }) {
  return (
    <select className={styles.input} name={name} value={value} onChange={onChange}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function ItemModal({ item, mode = 'add', onClose, onSaved }) {
  const { toast } = useToast();
  const isAdd   = mode === 'add';
  const [locked, setLocked] = useState(!isAdd);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    if (item) {
      const f = {
        item_name:        item.item_name        || '',
        item_title:       item.item_title       || '',
        item_type:        item.item_type        || 'N/A',
        item_description: item.item_description || '',
        item_location:    item.item_location    || '',
        item_category:    item.item_category    || 'N/A',
        item_quality:     item.item_quality     || 'N/A',
        item_size:        item.item_size        || 'N/A',
        item_sticker:     item.item_sticker     || 'N/A',
        item_acqprice:    item.item_acqprice    || '',
        item_srp:         item.item_srp         || '',
        item_quantity:    item.item_quantity    || '',
        item_image:       item.item_image       || 'n/a',
      };
      setForm(f);
      setImgSrc(convertDriveLink(item.item_image));
    } else {
      setForm(EMPTY);
      setImgSrc('');
    }
    setLocked(!isAdd);
  }, [item, isAdd]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'item_image') setImgSrc(convertDriveLink(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url    = isAdd ? '/api/items' : `/api/items/${item.item_id}`;
      const method = isAdd ? 'POST' : 'PUT';
      const payload = { ...form, item_image: convertDriveLink(form.item_image) };
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      toast({ message: isAdd ? 'Item added!' : 'Item updated!', type: 'success' });
      onSaved();
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const hasImage = imgSrc && imgSrc !== 'n/a';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${hasImage ? styles.modalWide : ''}`} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={`${styles.modalTag} ${!isAdd && locked ? styles.tagView : ''}`}>
              {isAdd ? 'NEW ITEM' : locked ? 'VIEWING' : 'EDITING'}
            </span>
            <h2>{isAdd ? 'Add Item' : item?.item_name || 'Item Details'}</h2>
          </div>
          <div className={styles.modalHeaderRight}>
            {!isAdd && (
              <button
                className={`${styles.lockBtn} ${locked ? styles.lockBtnLocked : styles.lockBtnUnlocked}`}
                onClick={() => setLocked(l => !l)}
              >
                {locked ? (
                  <><LockIcon /> Unlock to Edit</>
                ) : (
                  <><UnlockIcon /> Lock</>
                )}
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Content wrapper - side by side if image exists */}
        <div className={`${styles.contentWrap} ${hasImage ? styles.contentWithImage : ''}`}>

          {/* Main form / view */}
          <div className={styles.formSide}>
            {locked && !isAdd ? (
              /* VIEW MODE */
              <div className={styles.viewBody}>
                <div className={styles.viewGrid}>
                  <ViewField label="Quality"     value={item?.item_quality} />
                  <ViewField label="Type"        value={item?.item_type} />
                  <ViewField label="Name"        value={item?.item_name} wide />
                  <ViewField label="Title"       value={item?.item_title} wide />
                  <ViewField label="Category"    value={item?.item_category} />
                  <ViewField label="Size"        value={item?.item_size} />
                  <ViewField label="Location"    value={item?.item_location} />
                  <ViewField label="Sticker"     value={item?.item_sticker} />
                  <ViewField label="Acq. Price"  value={item?.item_acqprice ? `₱${parseFloat(item.item_acqprice).toLocaleString()}` : '—'} />
                  <ViewField label="SRP"         value={item?.item_srp ? `₱${parseFloat(item.item_srp).toLocaleString()}` : '—'} />
                  <ViewField label="Quantity"    value={item?.item_quantity} />
                  <ViewField label="Description" value={item?.item_description} wide />
                </div>
                {/* Computed Stats */}
                {(() => {
                  const { mup, wsp, wspSrp, spFee } = computeStats(item);
                  return (
                    <div className={styles.statsGrid}>
                      <div className={styles.statBox}>
                        <span className={styles.statLabel}>% MUP</span>
                        <span className={`${styles.statValue} ${styles.statAccent}`}>{mup.toFixed(2)}x</span>
                        <span className={styles.statHint}>SRP ÷ Acq Price</span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statLabel}>WSP</span>
                        <span className={`${styles.statValue} ${styles.statAccent}`}>{fmt(wsp)}</span>
                        <span className={styles.statHint}>SRP × Quantity</span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statLabel}>WSP − SRP</span>
                        <span className={styles.statValue}>{fmt(wspSrp)}</span>
                        <span className={styles.statHint}>(SRP × Qty) − SRP</span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statLabel}>SP Fee (20%)</span>
                        <span className={`${styles.statValue} ${styles.statWarn}`}>{fmt(spFee)}</span>
                        <span className={styles.statHint}>WSP − SRP×80%</span>
                      </div>
                    </div>
                  );
                })()}

                <div className={styles.viewMeta}>
                  {item?.item_dateAdded   && <span>Added: {new Date(item.item_dateAdded).toLocaleString('en-PH')}</span>}
                  {item?.item_lastUpdated && <span>Updated: {new Date(item.item_lastUpdated).toLocaleString('en-PH')}</span>}
                </div>
              </div>

            ) : (
              /* EDIT / ADD MODE */
              <form onSubmit={handleSubmit} className={styles.form} id="itemForm">
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Name <span className={styles.req}>*</span></label>
                    <input className={styles.input} name="item_name" value={form.item_name}
                      onChange={handleChange} required placeholder="e.g. TONYTONY. CHOPPER #99" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Title</label>
                    <input className={styles.input} name="item_title" value={form.item_title}
                      onChange={handleChange} placeholder="e.g. FUNKO POP" />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Type</label>
                    <Select name="item_type" value={form.item_type} onChange={handleChange} options={ITEM_TYPES} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Category</label>
                    <Select name="item_category" value={form.item_category} onChange={handleChange} options={ITEM_CATEGORIES} />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Quality</label>
                    <Select name="item_quality" value={form.item_quality} onChange={handleChange} options={ITEM_QUALITIES} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Size</label>
                    <Select name="item_size" value={form.item_size} onChange={handleChange} options={ITEM_SIZES} />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Location</label>
                    <input className={styles.input} name="item_location" value={form.item_location}
                      onChange={handleChange} placeholder="e.g. Rack 7 Top" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Sticker</label>
                    <Select name="item_sticker" value={form.item_sticker} onChange={handleChange} options={ITEM_STICKERS} />
                  </div>
                </div>

                <div className={styles.row3}>
                  <div className={styles.field}>
                    <label className={styles.label}>Acq. Price (₱)</label>
                    <input className={styles.input} type="number" step="0.01" min="0"
                      name="item_acqprice" value={form.item_acqprice} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>SRP (₱)</label>
                    <input className={styles.input} type="number" step="0.01" min="0"
                      name="item_srp" value={form.item_srp} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Quantity</label>
                    <input className={styles.input} type="number" min="0"
                      name="item_quantity" value={form.item_quantity} onChange={handleChange} placeholder="0" />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea className={styles.textarea} name="item_description" value={form.item_description}
                    onChange={handleChange} rows={2} placeholder="Additional details..." />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Google Drive Image Link</label>
                  <input className={styles.input} name="item_image" value={form.item_image === 'n/a' ? '' : form.item_image}
                    onChange={handleChange} placeholder="https://drive.google.com/file/d/..." />
                  <span className={styles.hint}>Paste a Google Drive share link — it will be converted automatically</span>
                </div>


              </form>
            )}
          </div>

          {/* Image side panel */}
          {hasImage && (
            <div className={styles.imageSide}>
              <label className={styles.label}>Image</label>
              <div className={styles.imageBox}>
                <img
                  src={imgSrc}
                  alt={item?.item_name || 'Item'}
                  className={styles.itemImage}
                  onError={e => { e.target.src = ''; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className={styles.imageFallback}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="32" height="32">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Image unavailable</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — only for edit/add mode */}
        {(!locked || isAdd) && (
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" form="itemForm" className={styles.submitBtn} disabled={saving}>
              {saving ? <><span className={styles.btnSpinner}/> Saving...</> : isAdd ? 'Add Item' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function UnlockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;
}
