'use client';
import { useState, useEffect, useCallback } from 'react';
import PageLayout from './components/PageLayout';
import ItemModal from './components/ItemModal';
import DeleteModal from './components/DeleteModal';
import FilterPanel from './components/FilterPanel';
import SummaryCard from './components/SummaryCard';
import { useToast } from './components/Toast';
import styles from './page.module.css';
import { useDebounce } from './lib/useDebounce';

const PAGE_SIZES = [5, 10, 20, 50, 100];
const DEFAULT_FILTERS = {
  type: '', category: '', quality: '', size: '', sticker: '',
  sortBy: '', sortDir: 'DESC', dateFrom: '', dateTo: '',
};

export default function Home() {
  const { toast } = useToast();
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const debouncedSearch         = useDebounce(search, 400);
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const [viewItem, setViewItem]     = useState(null);
  const [modalMode, setModalMode]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        start:    page * pageSize,
        length:   pageSize,
        type:     filters.type     || '',
        category: filters.category || '',
        quality:  filters.quality  || '',
        size:     filters.size     || '',
        sticker:  filters.sticker  || '',
        sort_by:  filters.sortBy   || '',
        sort_dir: filters.sortDir  || 'DESC',
      });
      const res  = await fetch(`/api/items?${params}`, { cache: 'no-store' });
      const json = await res.json();
      setItems(json.data || []);
      setTotal(json.recordsTotal || 0);
    } catch (e) {
      console.error(e);
      toast({ message: 'Failed to load items.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize, filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSearch    = (val) => { setSearch(val); setPage(0); };
  const handlePageSize  = (val) => { setPageSize(val); setPage(0); };
  const handleFilters   = (f)   => { setFilters(f); setPage(0); };

  const openAdd  = () => { setViewItem(null); setModalMode('add'); };
  const openView = (item) => { setViewItem(item); setModalMode('view'); };
  const closeModal  = () => { setViewItem(null); setModalMode(null); };
  const handleSaved   = () => { closeModal(); fetchItems(); };
  const handleDeleted = () => { setDeleteItem(null); setDeletingId(null); fetchItems(); };

  const handleExport = () => {
    const params = new URLSearchParams({
      type:      filters.type     || '',
      category:  filters.category || '',
      quality:   filters.quality  || '',
      size:      filters.size     || '',
      sticker:   filters.sticker  || '',
      sort_by:   filters.sortBy   || '',
      sort_dir:  filters.sortDir  || 'ASC',
      date_from: filters.dateFrom,
      date_to:   filters.dateTo,
      search:    search || '',
    });
    window.open(`/api/export?${params}`, '_blank');
  };

  const activeFilterCount = [
    filters.type, filters.category, filters.quality,
    filters.size, filters.sticker, filters.sortBy,
    filters.dateFrom && filters.dateTo,
  ].filter(Boolean).length;

  const totalPages = Math.ceil(total / pageSize);

  // ── Toolbar right buttons ───────────────────────────────────────────────
  const toolbarRight = (
    <>
      {filters.dateFrom && filters.dateTo && (
        <button className={styles.exportBtn} onClick={handleExport}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        FILTER
        {activeFilterCount > 0 && <span className={styles.filterCount}>{activeFilterCount}</span>}
      </button>
      <button className={styles.addBtn} onClick={openAdd}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        ADD ITEM
      </button>
    </>
  );

  // ── Filter pills ────────────────────────────────────────────────────────
  const LABEL_MAP = {
    type: filters.type, category: filters.category,
    quality: filters.quality, size: filters.size, sticker: filters.sticker,
  };
  const filterPills = activeFilterCount > 0 ? (
    <div className={styles.pillsWrap}>
      {Object.entries(LABEL_MAP).map(([key, val]) => val ? (
        <span key={key} className={styles.pill}>
          {key.charAt(0).toUpperCase() + key.slice(1)}: {val}
          <button onClick={() => handleFilters({ ...filters, [key]: '' })}>✕</button>
        </span>
      ) : null)}
      {filters.sortBy && (
        <span className={styles.pill}>
          Sort: {filters.sortBy === 'item_dateadded' ? 'Date Added' : 'Last Updated'} {filters.sortDir}
          <button onClick={() => handleFilters({ ...filters, sortBy: '', sortDir: 'ASC' })}>✕</button>
        </span>
      )}
      {filters.dateFrom && filters.dateTo && (
        <span className={styles.pill}>
          {filters.dateFrom} → {filters.dateTo}
          <button onClick={() => handleFilters({ ...filters, dateFrom: '', dateTo: '' })}>✕</button>
        </span>
      )}
      <button className={styles.clearAll} onClick={() => handleFilters(DEFAULT_FILTERS)}>Clear all</button>
    </div>
  ) : null;

  // ── Table columns ───────────────────────────────────────────────────────
  const columns = [
    { label: 'Status' }, { label: 'Image' }, { label: 'Name' },
    { label: 'Type' }, { label: 'Category' }, { label: 'Quality' },
    { label: 'ACQ Price' }, { label: 'SRP' }, { label: 'Quantity' },
    { label: 'Sold Items' }, { label: 'Location' }, { label: 'Actions' },
  ];

  // ── Table rows ──────────────────────────────────────────────────────────
  const rows = items.map((item, i) => (
    <>
      {/* Status */}
      <td className={styles.td}>
        {parseInt(item.item_quantity) > 0
          ? <span className={styles.badgeInStock}>In Stock</span>
          : <span className={styles.badgeOutOfStock}>Out of Stock</span>
        }
      </td>
      {/* Image */}
      <td className={styles.td}>
        {item.item_image && item.item_image !== 'n/a'
          ? <img src={item.item_image} alt={item.item_name} className={styles.tableImg}
              onError={e => { e.target.style.display='none'; }} />
          : <div className={styles.tableImgEmpty}>-</div>
        }
      </td>
      {/* Name */}
      <td className={styles.td}>
        <button className={styles.nameBtn} onClick={() => openView(item)}>
          {item.item_name}
        </button>
      </td>
      <td className={styles.td}>{item.item_type}</td>
      <td className={styles.td}>{item.item_category}</td>
      <td className={styles.td}><span className={styles.qualityBadge}>{item.item_quality}</span></td>
      <td className={`${styles.td} ${styles.priceCell}`}>₱{parseFloat(item.item_acqprice || 0).toLocaleString()}</td>
      <td className={`${styles.td} ${styles.priceCell}`}>₱{parseFloat(item.item_srp || 0).toLocaleString()}</td>
      <td className={`${styles.td} ${styles.qtyCell}`}>{item.item_quantity}</td>
      <td className={`${styles.td} ${styles.qtyCell}`}>{item.item_sold || 0}</td>
      <td className={styles.td}>{item.item_location}</td>
      {/* Actions */}
      <td className={styles.td}>
        <button
          className={styles.deleteBtn}
          onClick={() => setDeleteItem(item)}
          disabled={deletingId === item.item_id}
        >
          {deletingId === item.item_id
            ? <span className={styles.spinner}/>
            : 'Remove'
          }
        </button>
      </td>
    </>
  ));

  return (
    <>
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={handleFilters}
      />

      <PageLayout
        title="Inventory Items"
        total={total}
        totalLabel="ITEMS"
        search={search}
        onSearch={handleSearch}
        toolbarRight={toolbarRight}
        filterPills={filterPills}
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage="No items found."
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizes={PAGE_SIZES}
        onPageChange={setPage}
        onPageSizeChange={handlePageSize}
        summaryCard={<SummaryCard />}
      />

      {(viewItem || modalMode === 'add') && (
        <ItemModal
          item={viewItem}
          mode={modalMode === 'add' ? 'add' : 'view'}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
