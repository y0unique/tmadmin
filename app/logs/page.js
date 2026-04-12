'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import styles from './logs.module.css';

const PAGE_SIZE = 10;

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search, start: page * PAGE_SIZE, length: PAGE_SIZE,
      });
      const res = await fetch(`/api/logs?${params}`);
      const json = await res.json();
      setLogs(json.data || []);
      setTotal(json.recordsTotal || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to   = Math.min((page + 1) * PAGE_SIZE, total);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.layout}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(o => !o)} menuOpen={sidebarOpen} />

      <main className={styles.main}>
        {/* Page title */}
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Activity Logs</h1>
          </div>
        </div>

        {/* Search */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input className={styles.searchInput} type="text" placeholder="Search logs..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <span className={styles.totalBadge}>{total} ENTRIES</span>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Action</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className={styles.loading}>
                  <span className={styles.loadingDots}><span /><span /><span /></span>
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className={styles.empty}>No logs found.</td></tr>
              ) : logs.map((log, i) => (
                <tr key={log.time_id} className={styles.tr} style={{ animationDelay: `${i * 25}ms` }}>
                  <td className={`${styles.td} ${styles.idCell}`}>{log.time_id}</td>
                  <td className={`${styles.td} ${styles.actionCell}`}>
                    <span className={styles.actionIcon}>
                      {log.log_action?.toLowerCase().includes('added') ? '＋' :
                       log.log_action?.toLowerCase().includes('edited') ? '✎' :
                       log.log_action?.toLowerCase().includes('removed') ? '✕' : '•'}
                    </span>
                    {log.log_action}
                  </td>
                  <td className={`${styles.td} ${styles.dateCell}`}>{formatDate(log.log_date)}</td>
                  <td className={`${styles.td} ${styles.timeCell}`}>{log.log_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.paginationBar}>
          <span className={styles.paginationInfo}>
            {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total} entries`}
          </span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn} onClick={() => setPage(0)} disabled={page === 0}>«</button>
            <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>‹ PREV</button>
            <div className={styles.pageNumbers}>
              {[...Array(totalPages)].map((_, i) => {
                if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                  return <button key={i} className={`${styles.pageNum} ${i === page ? styles.pageNumActive : ''}`} onClick={() => setPage(i)}>{i + 1}</button>;
                if (Math.abs(i - page) === 2)
                  return <span key={i} className={styles.pageEllipsis}>…</span>;
                return null;
              })}
            </div>
            <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>NEXT ›</button>
            <button className={styles.pageBtn} onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
