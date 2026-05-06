'use client';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useState } from 'react';
import styles from './PageLayout.module.css';

export default function PageLayout({
  // Page identity
  title,
  subtitle,
  total,
  totalLabel = 'ITEMS',

  // Toolbar
  search,
  onSearch,
  showSearch = true,

  // Optional toolbar right buttons (passed as children or slots)
  toolbarRight,

  // Filter pills (optional)
  filterPills,

  // Table
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = 'No items found.',

  // View-only badge
  viewOnly = false,

  // Pagination
  page,
  totalPages,
  pageSize,
  pageSizes = [5, 10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,

  // Summary card (optional)
  summaryCard,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const from = total === 0 ? 0 : page * pageSize + 1;
  const to   = Math.min((page + 1) * pageSize, total);

  return (
    <div className={styles.layout}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(o => !o)} menuOpen={sidebarOpen} />

      <main className={styles.main}>

        {/* Page Head */}
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>{title}</h1>
            {subtitle && <p className={styles.pageSub}>{subtitle}</p>}
          </div>
          <div className={styles.pageHeadRight}>
            {total !== undefined && (
              <span className={styles.totalBadge}>{total} {totalLabel}</span>
            )}
            {viewOnly && (
              <span className={styles.viewOnlyBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                VIEW ONLY
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        {(showSearch || toolbarRight) && (
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              {showSearch && (
                <div className={styles.searchWrap}>
                  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => onSearch?.(e.target.value)}
                  />
                </div>
              )}
            </div>
            {toolbarRight && (
              <div className={styles.toolbarRight}>{toolbarRight}</div>
            )}
          </div>
        )}

        {/* Filter pills */}
        {filterPills && <div className={styles.filterPillsWrap}>{filterPills}</div>}

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={styles.th}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className={styles.loading}>
                    <span className={styles.loadingDots}><span/><span/><span/></span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className={styles.empty}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : rows.map((row, i) => (
                <tr key={i} className={styles.tr} style={{ animationDelay: `${i * 25}ms` }}>
                  {row}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages !== undefined && (
          <div className={styles.paginationBar}>
            <div className={styles.paginationLeft}>
              <span className={styles.paginationInfo}>
                {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
              </span>
              {onPageSizeChange && (
                <div className={styles.pageSizeWrap}>
                  <span className={styles.pageSizeLabel}>Show</span>
                  <select
                    className={styles.pageSizeSelect}
                    value={pageSize}
                    onChange={e => onPageSizeChange(parseInt(e.target.value))}
                  >
                    {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className={styles.pageSizeLabel}>rows</span>
                </div>
              )}
            </div>

            <div className={styles.paginationControls}>
              <button className={styles.pageBtn} onClick={() => onPageChange(0)} disabled={page === 0}>«</button>
              <button className={styles.pageBtn} onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0}>‹ PREV</button>
              <div className={styles.pageNumbers}>
                {[...Array(totalPages)].map((_, i) => {
                  if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                    return <button key={i} className={`${styles.pageNum} ${i === page ? styles.pageNumActive : ''}`} onClick={() => onPageChange(i)}>{i + 1}</button>;
                  if (Math.abs(i - page) === 2)
                    return <span key={i} className={styles.pageEllipsis}>…</span>;
                  return null;
                })}
              </div>
              <button className={styles.pageBtn} onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>NEXT ›</button>
              <button className={styles.pageBtn} onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>

              {totalPages > 1 && (
                <form className={styles.pageJumpWrap} onSubmit={e => {
                  e.preventDefault();
                  const val = parseInt(e.target.pageJump.value);
                  if (!isNaN(val) && val >= 1 && val <= totalPages) {
                    onPageChange(val - 1);
                    e.target.pageJump.value = '';
                  }
                }}>
                  <span className={styles.pageSizeLabel}>Go to</span>
                  <input name="pageJump" type="number" min={1} max={totalPages}
                    className={styles.pageJumpInput} placeholder={page + 1} />
                  <button type="submit" className={styles.pageJumpBtn}>Go</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Summary card */}
        {summaryCard}

      </main>

      <Footer />
    </div>
  );
}
