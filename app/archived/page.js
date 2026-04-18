'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import styles from './archived.module.css';

const PAGE_SIZE = 10;

export default function ArchivedPage() {
  const { toast } = useToast();
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search, start: page * PAGE_SIZE, length: PAGE_SIZE,
      });
      const res  = await fetch(`/api/archived?${params}`);
      const json = await res.json();
      setItems(json.data || []);
      setTotal(json.recordsTotal || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleRestore = async (item) => {
    setRestoringId(item.item_id);
    try {
      const res  = await fetch(`/api/items/restore/${item.item_id}`, { method: 'PUT' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to restore');
      toast({ message: `"${item.item_name}" restored to inventory!`, type: 'success' });
      fetchItems();
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setRestoringId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to   = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div className={styles.layout}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(o => !o)} menuOpen={sidebarOpen} />

      <main className={styles.main}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Archived Items</h1>
            <p className={styles.pageSub}>Inactive items removed from inventory. Restore to make them active again.</p>
          </div>
          <span className={styles.totalBadge}>{total} ARCHIVED</span>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className={styles.searchInput} type="text" placeholder="Search archived items..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Quality</th>
                <th className={styles.th}>SRP</th>
                <th className={styles.th}>Qty</th>
                <th className={styles.th}>Location</th>
                <th className={styles.th}>Removed</th>
                <th className={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className={styles.loading}>
                  <span className={styles.loadingDots}><span/><span/><span/></span>
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className={styles.empty}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="32" height="32">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                  No archived items found.
                </td></tr>
              ) : items.map((item, i) => (
                <tr key={item.item_id}
                  className={`${styles.tr} ${restoringId === item.item_id ? styles.trRestoring : ''}`}
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td className={`${styles.td} ${styles.nameCell}`}>{item.item_name}</td>
                  <td className={styles.td}>{item.item_type}</td>
                  <td className={styles.td}>{item.item_category}</td>
                  <td className={styles.td}>
                    <span className={styles.qualityBadge}>{item.item_quality}</span>
                  </td>
                  <td className={`${styles.td} ${styles.priceCell}`}>
                    ₱{parseFloat(item.item_srp || 0).toLocaleString()}
                  </td>
                  <td className={`${styles.td} ${styles.qtyCell}`}>{item.item_quantity}</td>
                  <td className={styles.td}>{item.item_location}</td>
                  <td className={`${styles.td} ${styles.dateCell}`}>
                    {item.item_lastupdated
                      ? new Date(item.item_lastupdated).toLocaleDateString('en-PH')
                      : '—'}
                  </td>
                  <td className={styles.td}>
                    <button
                      className={styles.restoreBtn}
                      onClick={() => handleRestore(item)}
                      disabled={restoringId === item.item_id}
                    >
                      {restoringId === item.item_id ? (
                        <><span className={styles.spinner}/> Restoring...</>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                          </svg>
                          Restore
                        </>
                      )}
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
            {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total} archived items`}
          </span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn} onClick={() => setPage(0)} disabled={page === 0}>«</button>
            <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>‹ PREV</button>
            <div className={styles.pageNumbers}>
              {[...Array(totalPages)].map((_, i) => {
                if (i === 0 || i === totalPages-1 || Math.abs(i-page) <= 1)
                  return <button key={i} className={`${styles.pageNum} ${i===page ? styles.pageNumActive:''}`} onClick={() => setPage(i)}>{i+1}</button>;
                if (Math.abs(i-page) === 2)
                  return <span key={i} className={styles.pageEllipsis}>…</span>;
                return null;
              })}
            </div>
            <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}>NEXT ›</button>
            <button className={styles.pageBtn} onClick={() => setPage(totalPages-1)} disabled={page >= totalPages-1}>»</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
