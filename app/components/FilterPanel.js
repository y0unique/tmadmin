'use client';
import { useEffect, useRef } from 'react';
import styles from './FilterPanel.module.css';

const QUALITIES = [
  "Collector's Grade", 'Standard Grade', 'Substandard Grade', 'Damaged Grade',
];

const CATEGORIES = [
  'N/A', 'ANIMATION', 'GAMES', 'MOVIES', 'NONE', 'STAGES', 'ROCKS',
  'FOOTBALL', 'PROTECTOR', 'TELEVISION', 'COMIC COVER', 'RACING',
];

const SORT_OPTIONS = [
  { value: 'item_dateadded-ASC',    label: 'Date Added — Oldest first' },
  { value: 'item_dateadded-DESC',   label: 'Date Added — Newest first' },
  { value: 'item_lastupdated-ASC',   label: 'Last Updated — Oldest first' },
  { value: 'item_lastupdated-DESC',  label: 'Last Updated — Newest first' },
];

export default function FilterPanel({ open, onClose, filters, onChange }) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const hasDateRange = filters.dateFrom && filters.dateTo;
  const hasActiveFilters = filters.quality || filters.category || filters.sortBy || hasDateRange;

  const handleQuality = (q) => {
    onChange({ ...filters, quality: filters.quality === q ? '' : q });
  };

  const handleSort = (val) => {
    const [sortBy, sortDir] = val.split('-');
    onChange({ ...filters, sortBy, sortDir });
  };

  const handleDate = (key, val) => {
    onChange({ ...filters, [key]: val });
  };

  const handleReset = () => {
    onChange({ quality: '', category: '', sortBy: '', sortDir: 'ASC', dateFrom: '', dateTo: '' });
  };

  const handleExport = () => {
    if (!hasDateRange) return;
    const params = new URLSearchParams({
      quality:   filters.quality  || '',
      sort_by:   filters.sortBy   || 'item_dateadded',
      sort_dir:  filters.sortDir  || 'ASC',
      date_from: filters.dateFrom,
      date_to:   filters.dateTo,
    });
    window.open(`/api/export?${params}`, '_blank');
  };

  const currentSort = filters.sortBy && filters.sortDir
    ? `${filters.sortBy}-${filters.sortDir}`
    : '';

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.panel} ${open ? styles.panelOpen : ''}`} ref={panelRef}>

        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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

          {/* Category */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Category</label>
            <div className={styles.qualityGrid}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`${styles.qualityBtn} ${filters.category === c ? styles.qualityBtnActive : ''}`}
                  onClick={() => onChange({ ...filters, category: filters.category === c ? '' : c })}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Quality</label>
            <div className={styles.qualityGrid}>
              {QUALITIES.map(q => (
                <button
                  key={q}
                  className={`${styles.qualityBtn} ${filters.quality === q ? styles.qualityBtnActive : ''}`}
                  onClick={() => handleQuality(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Sort By</label>
            <div className={styles.sortList}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.sortBtn} ${currentSort === opt.value ? styles.sortBtnActive : ''}`}
                  onClick={() => handleSort(opt.value)}
                >
                  <span className={styles.sortRadio}>
                    {currentSort === opt.value && <span className={styles.sortRadioDot} />}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              Date Range
              <span className={styles.required}> * required for export</span>
            </label>
            <div className={styles.dateRow}>
              <div className={styles.dateField}>
                <span className={styles.dateLabel}>From</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={filters.dateFrom}
                  onChange={e => handleDate('dateFrom', e.target.value)}
                />
              </div>
              <div className={styles.dateSep}>→</div>
              <div className={styles.dateField}>
                <span className={styles.dateLabel}>To</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={filters.dateTo}
                  onChange={e => handleDate('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Export Button — only when date range is set */}
          <div className={styles.exportWrap}>
            {hasDateRange ? (
              <button className={styles.exportBtn} onClick={handleExport}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
                {filters.quality && <span className={styles.exportTag}>{filters.quality}</span>}
              </button>
            ) : (
              <div className={styles.exportHint}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
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
