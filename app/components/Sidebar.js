'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const INVENTORY_PATHS = ['/', '/archived', '/import'];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const [inventoryOpen, setInventoryOpen] = useState(
    INVENTORY_PATHS.includes(pathname)
  );

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>MENU</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <nav className={styles.nav}>

          {/* Inventory Dropdown */}
          <div className={styles.navGroup}>
            <button
              className={`${styles.navGroupBtn} ${INVENTORY_PATHS.includes(pathname) ? styles.navGroupBtnActive : ''}`}
              onClick={() => setInventoryOpen(o => !o)}
            >
              <span className={styles.navIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </span>
              <span className={styles.navLabel}>Inventory</span>
              <svg
                className={`${styles.navChevron} ${inventoryOpen ? styles.navChevronOpen : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown items */}
            {inventoryOpen && (
              <div className={styles.navSubList}>
                <a
                  href="/"
                  className={`${styles.navSubItem} ${pathname === '/' ? styles.navSubItemActive : ''}`}
                  onClick={onClose}
                >
                  <span className={styles.subDot} />
                  Item List
                </a>
                <a
                  href="/archived"
                  className={`${styles.navSubItem} ${pathname === '/archived' ? styles.navSubItemActive : ''}`}
                  onClick={onClose}
                >
                  <span className={styles.subDot} />
                  Archived Items
                </a>
                <a
                  href="/import"
                  className={`${styles.navSubItem} ${pathname === '/import' ? styles.navSubItemActive : ''}`}
                  onClick={onClose}
                >
                  <span className={styles.subDot} />
                  Import Data
                </a>
              </div>
            )}
          </div>

          {/* Logs */}
          <a
            href="/logs"
            className={`${styles.navItem} ${pathname === '/logs' ? styles.navItemActive : ''}`}
            onClick={onClose}
          >
            <span className={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <span className={styles.navLabel}>Logs</span>
            {pathname === '/logs' && <span className={styles.navActiveDot} />}
          </a>

        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.sidebarVersion}>tmadmin v1.0</span>
        </div>
      </aside>
    </>
  );
}