'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ItemModal from './components/ItemModal';
import DeleteModal from './components/DeleteModal';
import styles from './page.module.css';

const COLUMNS = [
  { key: 'item_id', label: 'ID' },
  { key: 'item_name', label: 'Name' },
  { key: 'item_description', label: 'Description' },
  { key: 'item_location', label: 'Location' },
  { key: 'item_category', label: 'Category' },
  { key: 'item_quality', label: 'Quality' },
  { key: 'item_price', label: 'Price' },
  { key: 'item_quantity', label: 'Qty' },
  { key: 'item_status', label: 'Status' },
];

const PAGE_SIZE = 10;

export default function Home() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [orderColumn, setOrderColumn] = useState('item_id');
  const [orderDir, setOrderDir] = useState('ASC');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        order_column: orderColumn,
        order_dir: orderDir,
        start: page * PAGE_SIZE,
        length: PAGE_SIZE,
      });
      const res = await fetch(`/api/items?${params}`);
      const json = await res.json();
      setItems(json.data || []);
      setTotal(json.recordsTotal || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, orderColumn, orderDir, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSort = (col) => {
    if (orderColumn === col) {
      setOrderDir(d => d === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setOrderColumn(col);
      setOrderDir('ASC');
    }
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const openAdd = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };
  const handleSaved = () => { closeModal(); fetchItems(); };
  const handleDeleted = () => { setDeleteItem(null); fetchItems(); };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <Image src="/assets/favicon.png" alt="Toy Mafia" width={28} height={28}
              onError={(e) => { e.target.style.display = 'none'; }} />
            <span className={styles.brandDot} />
            <span className={styles.brandName}>TOY MAFIA</span>
            <span className={styles.brandSub}>ADMIN</span>
          </div>
          <div className={styles.headerStats}>
            <span className={styles.statBadge}>{total} ITEMS</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button className={styles.addBtn} onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M12 5v14M5 12h14" />
            </svg>
            ADD ITEM
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {COLUMNS.map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className={styles.th}>
                    <span>{col.label}</span>
                    <span className={styles.sortArrow}>
                      {orderColumn === col.key ? (orderDir === 'ASC' ? ' ↑' : ' ↓') : ' ↕'}
                    </span>
                  </th>
                ))}
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className={styles.loading}>
                    <span className={styles.loadingDots}><span /><span /><span /></span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className={styles.empty}>No items found.</td>
                </tr>
              ) : items.map((item, i) => (
                <tr key={item.item_id} className={styles.tr} style={{ animationDelay: `${i * 30}ms` }}>
                  <td className={`${styles.td} ${styles.idCell}`}>{item.item_id}</td>
                  <td className={`${styles.td} ${styles.nameCell}`}>{item.item_name}</td>
                  <td className={styles.td}>{item.item_description}</td>
                  <td className={styles.td}>{item.item_location}</td>
                  <td className={styles.td}>{item.item_category}</td>
                  <td className={styles.td}>
                    <span className={styles.qualityBadge}>{item.item_quality}</span>
                  </td>
                  <td className={`${styles.td} ${styles.priceCell}`}>
                    ₱{parseFloat(item.item_price || 0).toLocaleString()}
                  </td>
                  <td className={`${styles.td} ${styles.qtyCell}`}>{item.item_quantity}</td>
                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${item.item_status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                      {item.item_status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(item)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => setDeleteItem(item)}>Del</button>
                    </div>
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
            {/* First */}
            <button
              className={styles.pageBtn}
              onClick={() => setPage(0)}
              disabled={page === 0}
              title="First page"
            >
              «
            </button>

            {/* Previous */}
            <button
              className={styles.pageBtn}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              title="Previous page"
            >
              ‹ PREV
            </button>

            {/* Page numbers */}
            <div className={styles.pageNumbers}>
              {[...Array(totalPages)].map((_, i) => {
                // Show first, last, current, and neighbors
                if (
                  i === 0 ||
                  i === totalPages - 1 ||
                  Math.abs(i - page) <= 1
                ) {
                  return (
                    <button
                      key={i}
                      className={`${styles.pageNum} ${i === page ? styles.pageNumActive : ''}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  );
                }
                // Ellipsis
                if (Math.abs(i - page) === 2) {
                  return <span key={i} className={styles.pageEllipsis}>…</span>;
                }
                return null;
              })}
            </div>

            {/* Next */}
            <button
              className={styles.pageBtn}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              title="Next page"
            >
              NEXT ›
            </button>

            {/* Last */}
            <button
              className={styles.pageBtn}
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              title="Last page"
            >
              »
            </button>
          </div>
        </div>
      </main>

      {modalOpen && (
        <ItemModal item={editItem} onClose={closeModal} onSaved={handleSaved} />
      )}
      {deleteItem && (
        <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onDeleted={handleDeleted} />
      )}
    </div>
  );
}