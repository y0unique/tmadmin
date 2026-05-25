'use client';
import { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/PageLayout';
import styles from './logs.module.css';
import { useDebounce } from '../lib/useDebounce';

const PAGE_SIZES = [5, 10, 20, 50, 100];

const ACTION_ICON = (action = '') => {
  const a = action.toLowerCase();
  if (a.includes('added') || a.includes('import')) return '＋';
  if (a.includes('edited') || a.includes('restored')) return '✎';
  if (a.includes('removed') || a.includes('deactivated')) return '✕';
  if (a.includes('export')) return '↓';
  return '•';
};

export default function LogsPage() {
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const debouncedSearch         = useDebounce(search, 400);
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading]   = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search, start: page * pageSize, length: pageSize,
      });
      const res  = await fetch(`/api/logs?${params}`, { cache: 'no-store' });
      const json = await res.json();
      setLogs(json.data || []);
      setTotal(json.recordsTotal || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  const columns = [
    { label: '#' }, { label: 'Action' }, { label: 'Date' }, { label: 'Time' },
  ];

  const rows = logs.map((log) => (
    <>
      <td className={styles.td}><span className={styles.logId}>#{log.time_id}</span></td>
      <td className={styles.td}>
        <div className={styles.actionCell}>
          <span className={styles.actionIcon}>{ACTION_ICON(log.log_action)}</span>
          <span>{log.log_action}</span>
        </div>
      </td>
      <td className={styles.td}><span className={styles.dateCell}>{formatDate(log.log_date)}</span></td>
      <td className={styles.td}><span className={styles.dateCell}>{log.log_time}</span></td>
    </>
  ));

  return (
    <PageLayout
      title="Activity Logs"
      total={total}
      totalLabel="ENTRIES"
      viewOnly={true}
      search={search}
      onSearch={(val) => { setSearch(val); setPage(0); }}
      columns={columns}
      rows={rows}
      loading={loading}
      emptyMessage="No logs found."
      page={page}
      totalPages={Math.ceil(total / pageSize)}
      pageSize={pageSize}
      pageSizes={PAGE_SIZES}
      onPageChange={setPage}
      onPageSizeChange={(val) => { setPageSize(val); setPage(0); }}
    />
  );
}
