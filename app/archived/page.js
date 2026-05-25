'use client';
import { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/PageLayout';
import { useToast } from '../components/Toast';
import styles from './archived.module.css';
import { useDebounce } from '../lib/useDebounce';

const PAGE_SIZES = [5, 10, 20, 50, 100];

export default function ArchivedPage() {
  const { toast } = useToast();
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);
  const debouncedSearch             = useDebounce(search, 400);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading]   = useState(true);
  const [restoringId, setRestoringId] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, start: page * pageSize, length: pageSize });
      const res  = await fetch(`/api/archived?${params}`, { cache: 'no-store' });
      const json = await res.json();
      setItems(json.data || []);
      setTotal(json.recordsTotal || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleRestore = async (item) => {
    setRestoringId(item.item_id);
    try {
      const res  = await fetch(`/api/items/restore/${item.item_id}`, { method: 'PUT', cache: 'no-store' });
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

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  const columns = [
    { label: 'Name' }, { label: 'Type' }, { label: 'Category' },
    { label: 'Quality' }, { label: 'SRP' }, { label: 'Qty' },
    { label: 'Location' }, { label: 'Removed' }, { label: 'Action' },
  ];

  const rows = items.map((item) => (
    <>
      <td className={`${styles.td} ${styles.nameCell}`}>{item.item_name}</td>
      <td className={styles.td}>{item.item_type}</td>
      <td className={styles.td}>{item.item_category}</td>
      <td className={styles.td}><span className={styles.qualityBadge}>{item.item_quality}</span></td>
      <td className={`${styles.td} ${styles.priceCell}`}>₱{parseFloat(item.item_srp || 0).toLocaleString()}</td>
      <td className={`${styles.td} ${styles.qtyCell}`}>{item.item_quantity}</td>
      <td className={styles.td}>{item.item_location}</td>
      <td className={`${styles.td} ${styles.dateCell}`}>{formatDate(item.item_lastupdated)}</td>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Restore
            </>
          )}
        </button>
      </td>
    </>
  ));

  return (
    <PageLayout
      title="Archived Items"
      total={total}
      totalLabel="ARCHIVED"
      search={search}
      onSearch={(val) => { setSearch(val); setPage(0); }}
      columns={columns}
      rows={rows}
      loading={loading}
      emptyMessage="No archived items found."
      page={page}
      totalPages={Math.ceil(total / pageSize)}
      pageSize={pageSize}
      pageSizes={PAGE_SIZES}
      onPageChange={setPage}
      onPageSizeChange={(val) => { setPageSize(val); setPage(0); }}
    />
  );
}
