'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ItemModal from './components/ItemModal';
import DeleteModal from './components/DeleteModal';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import FilterPanel from './components/FilterPanel';
import SummaryCard from './components/SummaryCard';
import styles from './page.module.css';

// Visible table columns only — Description, Location, Category hidden (shown in modal)
const COLUMNS = [
  { key: 'item_id',       label: 'ID' },
  { key: 'item_name',     label: 'Name' },
  { key: 'item_type',     label: 'Type' },
  { key: 'item_category', label: 'Category' },
  { key: 'item_quality',  label: 'Quality' },
  { key: 'item_acqprice',  label: 'ACQ Price' },
  { key: 'item_srp',  label: 'SRP' },
  { key: 'item_quantity', label: 'Quantity' },
  { key: 'item_location',     label: 'Location' },
];

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { quality: '', category: '', sortBy: '', sortDir: 'ASC', dateFrom: '', dateTo: '' };

export default function Home() {
  const [items, setItems]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(0);
  const [orderColumn, setOrderColumn] = useState('item_id');
  const [orderDir, setOrderDir]   = useState('ASC');
  const [loading, setLoading]     = useState(true);
  const [deletingId, setDeletingId] = useState(null); // track which row is being deleted

  // Modal states
  const [viewItem, setViewItem]   = useState(null);   // click name → view modal
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'add'
  const [deleteItem, setDeleteItem] = useState(null);

  // Panel states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen]   = useState(false);
  const [filters, setFilters]         = useState(DEFAULT_FILTERS);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        order_column: filters.sortBy || orderColumn,
        order_dir:    filters.sortDir || orderDir,
        start:        page * PAGE_SIZE,
        length:       PAGE_SIZE,
        quality:      filters.quality  || '',
        category:     filters.category || '',
        sort_by:      filters.sortBy  || '',
        sort_dir:     filters.sortDir || 'ASC',
      });
      const res  = await fetch(`/api/items?${params}`);
      const json = await res.json();
      setItems(json.data || []);
      setTotal(json.recordsTotal || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, orderColumn, orderDir, page, filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleFilterChange = (f) => { setFilters(f); setPage(0); };

  const openAdd  = () => { setViewItem(null); setModalMode('add'); };
  const openView = (item) => { setViewItem(item); setModalMode('view'); };
  const closeModal  = () => { setViewItem(null); setModalMode(null); };
  const handleSaved   = () => { closeModal(); fetchItems(); };
  const handleDeleted = () => { setDeleteItem(null); setDeletingId(null); fetchItems(); };

  const handleExport = () => {
    const params = new URLSearchParams({
      quality:   filters.quality  || '',
      sort_by:   filters.sortBy   || 'item_dateAdded',
      sort_dir:  filters.sortDir  || 'ASC',
      date_from: filters.dateFrom,
      date_to:   filters.dateTo,
      search:    search || '',
    });
    window.open(`/api/export?${params}`, '_blank');
  };

  const activeFilterCount = [
    filters.quality,
    filters.category,
    filters.sortBy,
    filters.dateFrom && filters.dateTo,
  ].filter(Boolean).length;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to   = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div className={styles.layout}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} onChange={handleFilterChange} />
      <Header onMenuToggle={() => setSidebarOpen(o => !o)} menuOpen={sidebarOpen} />

      <main className={styles.main}>
        {/* Page Title */}
        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>Inventory Items</h1>
          <p className={styles.pageSub}>Click an item name to view or edit details.</p>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className={styles.searchInput} type="text" placeholder="Search items..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
            </div>
            <span className={styles.totalBadge}>{total} ITEMS</span>
          </div>

          <div className={styles.toolbarRight}>
            {filters.dateFrom && filters.dateTo && (
              <button className={styles.exportBtn} onClick={handleExport}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                EXPORT CSV
              </button>
            )}
            <button
              className={`${styles.filterBtn} ${activeFilterCount > 0 ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterOpen(o => !o)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              FILTER
              {activeFilterCount > 0 && <span className={styles.filterCount}>{activeFilterCount}</span>}
            </button>
            <button className={styles.addBtn} onClick={openAdd}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              ADD ITEM
            </button>
          </div>
        </div>

        {/* Filter pills */}
        {activeFilterCount > 0 && (
          <div className={styles.filterPills}>
            {filters.quality && (
              <span className={styles.pill}>Quality: {filters.quality}
                <button onClick={() => handleFilterChange({ ...filters, quality: '' })}>✕</button>
              </span>
            )}
            {filters.category && (
              <span className={styles.pill}>Category: {filters.category}
                <button onClick={() => handleFilterChange({ ...filters, category: '' })}>✕</button>
              </span>
            )}
            {filters.sortBy && (
              <span className={styles.pill}>
                Sort: {filters.sortBy === 'item_dateAdded' ? 'Date Added' : 'Last Updated'} {filters.sortDir}
                <button onClick={() => handleFilterChange({ ...filters, sortBy: '', sortDir: 'ASC' })}>✕</button>
              </span>
            )}
            {filters.dateFrom && filters.dateTo && (
              <span className={styles.pill}>{filters.dateFrom} → {filters.dateTo}
                <button onClick={() => handleFilterChange({ ...filters, dateFrom: '', dateTo: '' })}>✕</button>
              </span>
            )}
            <button className={styles.clearAll} onClick={() => handleFilterChange(DEFAULT_FILTERS)}>Clear all</button>
          </div>
        )}

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {COLUMNS.map(col => (
                  <th key={col.key} className={styles.thStatic}>{col.label}</th>
                ))}
                <th className={styles.thStatic}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={COLUMNS.length + 1} className={styles.loading}>
                  <span className={styles.loadingDots}><span/><span/><span/></span>
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={COLUMNS.length + 1} className={styles.empty}>No items found.</td></tr>
              ) : items.map((item, i) => (
                <tr key={item.item_id}
                  className={`${styles.tr} ${deletingId === item.item_id ? styles.trDeleting : ''}`}
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td className={`${styles.td} ${styles.idCell}`}>{item.item_id}</td>
                  <td className={styles.td}>
                    <button className={styles.nameBtn} onClick={() => openView(item)}>
                      {item.item_name}
                    </button>
                  </td>
                  <td className={styles.td}>{item.item_type}</td>
                  <td className={styles.td}>{item.item_category}</td>
                  <td className={styles.td}>
                    <span className={styles.qualityBadge}>{item.item_quality}</span>
                  </td>
                  <td className={`${styles.td} ${styles.qtyCell}`}>{item.item_acqprice}</td>
                  <td className={`${styles.td} ${styles.qtyCell}`}>{item.item_srp}</td>
                  <td className={`${styles.td} ${styles.qtyCell}`}>{item.item_quantity}</td>
                  <td className={`${styles.td} ${styles.qtyCell}`}>{item.item_location}</td>
                  <td className={styles.td}>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteItem(item)}
                      disabled={deletingId === item.item_id}
                    >
                      {deletingId === item.item_id ? (
                        <span className={styles.deletingSpinner}/>
                      ) : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.paginationBar}>
          <span className={styles.paginationInfo}>
            {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total} items`}
          </span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn} onClick={() => setPage(0)} disabled={page === 0}>«</button>
            <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(0,p-1))} disabled={page === 0}>‹ PREV</button>
            <div className={styles.pageNumbers}>
              {[...Array(totalPages)].map((_, i) => {
                if (i === 0 || i === totalPages-1 || Math.abs(i-page) <= 1)
                  return <button key={i} className={`${styles.pageNum} ${i===page ? styles.pageNumActive:''}`} onClick={() => setPage(i)}>{i+1}</button>;
                if (Math.abs(i-page) === 2)
                  return <span key={i} className={styles.pageEllipsis}>…</span>;
                return null;
              })}
            </div>
            <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page >= totalPages-1}>NEXT ›</button>
            <button className={styles.pageBtn} onClick={() => setPage(totalPages-1)} disabled={page >= totalPages-1}>»</button>
          </div>
        </div>

        {/* Summary card */}
        <SummaryCard />
      </main>

      <Footer />

      {/* View/Edit modal */}
      {(viewItem || modalMode === 'add') && (
        <ItemModal
          item={viewItem}
          mode={modalMode === 'add' ? 'add' : 'view'}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
