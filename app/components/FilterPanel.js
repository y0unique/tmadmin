'use client';
import { useEffect, useRef } from 'react';
import {
  TYPE_OPTIONS, CATEGORY_OPTIONS, QUALITY_OPTIONS,
  SIZE_OPTIONS, STICKER_OPTIONS,
} from '../lib/lookup';
import styles from './FilterPanel.module.css';

const SORT_OPTIONS = [
  { value: '',                      label: '— None —' },
  { value: 'item_dateadded-ASC',    label: 'Date Added — Oldest first' },
  { value: 'item_dateadded-DESC',   label: 'Date Added — Newest first' },
  { value: 'item_lastupdated-ASC',  label: 'Last Updated — Oldest first' },
  { value: 'item_lastupdated-DESC', label: 'Last Updated — Newest first' },
];

function FilterSelect({ label, name, value, onChange, options }) {
  return (
    <div className={styles.filterField}>
      <label className={styles.filterLabel}>{label}</label>
      <select
        className={styles.filterSelect}
        value={value}
        onChange={e => onChange(name, e.target.value)}
      >
        <option value="">— All —</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterPanel({ open, onClose, filters, onChange }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const hasDateRange = filters.dateFrom && filters.dateTo;
  const hasActiveFilters = filters.type || filters.category || filters.quality ||
    filters.size || filters.sticker || filters.sortBy || hasDateRange;

  const handleField = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  const handleSort = (val) => {
    if (!val) {
      onChange({ ...filters, sortBy: '', sortDir: 'ASC' });
      return;
    }
    const [sortBy, sortDir] = val.split('-');
    onChange({ ...filters, sortBy, sortDir });
  };

  const handleDate = (key, val) => onChange({ ...filters, [key]: val });

  const handleReset = () => onChange({
    type: '', category: '', quality: '', size: '', sticker: '',
    sortBy: '', sortDir: 'ASC', dateFrom: '', dateTo: '',
  });

  const handleExport = () => {
    if (!hasDateRange) return;
    const params = new URLSearchParams({
      type:      filters.type     || '',
      category:  filters.category || '',
      quality:   filters.quality  || '',
      size:      filters.size     || '',
      sticker:   filters.sticker  || '',
      sort_by:   filters.sortBy   || 'item_dateadded',
      sort_dir:  filters.sortDir  || 'ASC',
      date_from: filters.dateFrom,
      date_to:   filters.dateTo,
    });
    window.open(`/api/export?${params}`, '_blank');
  };

  const currentSort = filters.sortBy && filters.sortDir
    ? `${filters.sortBy}-${filters.sortDir}` : '';

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.panel} ${open ? styles.panelOpen : ''}`} ref={panelRef}>

        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filters & Export
          </div>
          <div className={styles.panelHeaderRight}>
            {hasActiveFilters && (
              <button className={styles.resetBtn} onClick={handleReset}>Reset</button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.panelBody}>

          {/* Dropdown Filters */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Item Filters</span>
            <div className={styles.filterGrid}>
              <FilterSelect label="Type"     name="type"     value={filters.type     || ''} onChange={handleField} options={TYPE_OPTIONS} />
              <FilterSelect label="Category" name="category" value={filters.category || ''} onChange={handleField} options={CATEGORY_OPTIONS} />
              <FilterSelect label="Quality"  name="quality"  value={filters.quality  || ''} onChange={handleField} options={QUALITY_OPTIONS} />
              <FilterSelect label="Size"     name="size"     value={filters.size     || ''} onChange={handleField} options={SIZE_OPTIONS} />
              <FilterSelect label="Sticker"  name="sticker"  value={filters.sticker  || ''} onChange={handleField} options={STICKER_OPTIONS} />
            </div>
          </div>

          {/* Sort By */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Sort By</span>
            <select
              className={styles.filterSelect}
              value={currentSort}
              onChange={e => handleSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              Date Range
              <span className={styles.required}> * required for export</span>
            </span>
            <div className={styles.dateRow}>
              <div className={styles.dateField}>
                <span className={styles.dateLabel}>From</span>
                <input type="date" className={styles.dateInput}
                  value={filters.dateFrom}
                  onChange={e => handleDate('dateFrom', e.target.value)} />
              </div>
              <div className={styles.dateSep}>→</div>
              <div className={styles.dateField}>
                <span className={styles.dateLabel}>To</span>
                <input type="date" className={styles.dateInput}
                  value={filters.dateTo}
                  onChange={e => handleDate('dateTo', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Export */}
          <div className={styles.exportWrap}>
            {hasDateRange ? (
              <button className={styles.exportBtn} onClick={handleExport}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export CSV
              </button>
            ) : (
              <div className={styles.exportHint}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Set a date range to enable CSV export
              </div>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}
