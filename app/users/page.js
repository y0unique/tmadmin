'use client';
import { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/PageLayout';
import UserModal from '../components/UserModal';
import { useToast } from '../components/Toast';
import { ROLE_LABELS, resolveAllPrivileges, PRIVILEGES } from '../lib/privileges';
import { useDebounce } from '../lib/useDebounce';
import styles from './users.module.css';

const PAGE_SIZES = [5, 10, 20, 50, 100];

function RoleBadge({ type }) {
  const label = ROLE_LABELS[type] || 'Unknown';
  const cls = {
    1: styles.roleSystem,
    2: styles.roleAdmin,
    3: styles.roleUser,
    4: styles.roleViewer,
    5: styles.roleNew,
    0: styles.roleDisabled,
  }[type] || '';
  return <span className={`${styles.roleBadge} ${cls}`}>{label}</span>;
}

function StatusBadge({ status }) {
  return (
    <span className={`${styles.statusBadge} ${status === 'active' ? styles.statusActive : styles.statusDisabled}`}>
      {status === 'active' ? 'Active' : 'Disabled'}
    </span>
  );
}

function Avatar({ user }) {
  const hasImg = user.u_profile && user.u_profile !== 'n/a';
  return hasImg ? (
    <img src={user.u_profile} alt={user.u_name} className={styles.avatar}
      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
  ) : (
    <div className={styles.avatarFallback}>
      {user.u_name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState('');
  const debouncedSearch             = useDebounce(search, 400);
  const [page, setPage]           = useState(0);
  const [pageSize, setPageSize]   = useState(10);
  const [loading, setLoading]     = useState(true);
  const [modalUser, setModalUser] = useState(undefined);
  const [togglingId, setTogglingId] = useState(null);
  const [expandedPriv, setExpandedPriv] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: debouncedSearch, start: page * pageSize, length: pageSize });
      const res  = await fetch(`/api/users?${params}`, { cache: 'no-store' });
      const json = await res.json();
      setUsers(json.data || []);
      setTotal(json.recordsTotal || 0);
    } catch (e) {
      console.error(e);
      toast({ message: 'Failed to load users.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    setTogglingId(user.u_id);
    const newStatus = user.u_status === 'active' ? 'disabled' : 'active';
    try {
      const res  = await fetch(`/api/users/${user.u_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ u_status: newStatus }),
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update status');
      toast({ message: `${user.u_name} has been ${newStatus === 'active' ? 'enabled' : 'disabled'}.`, type: 'success' });
      fetchUsers();
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaved = () => { setModalUser(undefined); fetchUsers(); };

  // Toolbar
  const toolbarRight = (
    <button className={styles.addBtn} onClick={() => setModalUser(null)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      ADD USER
    </button>
  );

  const columns = [
    { label: 'User' }, { label: 'Email' }, { label: 'Role' },
    { label: 'Status' }, { label: 'Privileges' }, { label: 'Actions' },
  ];

  const rows = users.map((user) => {
    const privs    = resolveAllPrivileges(user);
    const privKeys = Object.entries(privs).filter(([, v]) => v).map(([k]) => k);
    const isSystem = user.u_type === 1;

    return (
      <>
        {/* User */}
        <td className={styles.td}>
          <div className={styles.userCell}>
            <Avatar user={user} />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.u_name}</span>
              <span className={styles.userId}>#{user.u_id}</span>
            </div>
          </div>
        </td>

        {/* Email */}
        <td className={`${styles.td} ${styles.emailCell}`}>{user.u_email}</td>

        {/* Role */}
        <td className={styles.td}><RoleBadge type={user.u_type} /></td>

        {/* Status */}
        <td className={styles.td}><StatusBadge status={user.u_status} /></td>

        {/* Privileges summary */}
        <td className={styles.td}>
          <button
            className={styles.privSummaryBtn}
            onClick={() => setExpandedPriv(expandedPriv === user.u_id ? null : user.u_id)}
          >
            <span className={styles.privDots}>
              {PRIVILEGES.map(p => (
                <span
                  key={p.key}
                  className={`${styles.privDot} ${privs[p.key] ? styles.privDotOn : styles.privDotOff}`}
                  title={`${p.label}: ${privs[p.key] ? 'Yes' : 'No'}${user[p.key] !== null ? ' (overridden)' : ''}`}
                />
              ))}
            </span>
            <span className={styles.privCount}>{privKeys.length}/{PRIVILEGES.length}</span>
          </button>

          {/* Expanded privilege detail */}
          {expandedPriv === user.u_id && (
            <div className={styles.privExpanded}>
              {PRIVILEGES.map(p => (
                <div key={p.key} className={styles.privExpandedRow}>
                  <span className={`${styles.privExpandedDot} ${privs[p.key] ? styles.privDotOn : styles.privDotOff}`}/>
                  <span className={styles.privExpandedLabel}>{p.label}</span>
                  {user[p.key] !== null && <span className={styles.privExpandedOverride}>override</span>}
                </div>
              ))}
            </div>
          )}
        </td>

        {/* Actions */}
        <td className={styles.td}>
          <div className={styles.actions}>
            {/* Edit - disabled for system admin */}
            {!isSystem && (
              <button className={styles.editBtn} onClick={() => setModalUser(user)}>
                Edit
              </button>
            )}
            {/* Enable/Disable toggle */}
            {!isSystem && (
              <button
                className={`${styles.toggleBtn} ${user.u_status === 'active' ? styles.toggleBtnDisable : styles.toggleBtnEnable}`}
                onClick={() => handleToggleStatus(user)}
                disabled={togglingId === user.u_id}
              >
                {togglingId === user.u_id
                  ? <span className={styles.spinner}/>
                  : user.u_status === 'active' ? 'Disable' : 'Enable'
                }
              </button>
            )}
            {isSystem && (
              <span className={styles.systemLock}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Protected
              </span>
            )}
          </div>
        </td>
      </>
    );
  });

  return (
    <>
      <PageLayout
        title="User Management"
        total={total}
        totalLabel="USERS"
        search={search}
        onSearch={(val) => { setSearch(val); setPage(0); }}
        toolbarRight={toolbarRight}
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage="No users found."
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        pageSize={pageSize}
        pageSizes={PAGE_SIZES}
        onPageChange={setPage}
        onPageSizeChange={(val) => { setPageSize(val); setPage(0); }}
      />

      {modalUser !== undefined && (
        <UserModal
          user={modalUser}
          onClose={() => setModalUser(undefined)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
