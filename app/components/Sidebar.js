'use client';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  {
    label: 'Inventory',
    href: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  // Future pages — uncomment when ready:
  // {
  //   label: 'Users',
  //   href: '/users',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
  //       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
  //       <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  //     </svg>
  //   ),
  // },
  // {
  //   label: 'Logs',
  //   href: '/logs',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
  //       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  //     </svg>
  //   ),
  // },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay */}
      {open && <div className={styles.overlay} onClick={onClose} />}

      {/* Drawer */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>MENU</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">✕</button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <a key={item.href} href={item.href} className={styles.navItem} onClick={onClose}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.sidebarVersion}>tmadmin v1.0</span>
        </div>
      </aside>
    </>
  );
}