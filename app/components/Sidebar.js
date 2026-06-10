'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const INVENTORY_PATHS = ['/', '/archived', '/import'];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const [invOpen, setInvOpen] = useState(INVENTORY_PATHS.includes(pathname));

  return (
    <>
      {/* Full screen overlay */}
      {open && (
        <div className={styles.overlay}>

          {/* Overlay header */}
          <div className={styles.overlayHeader}>
            <div className={styles.overlayBrand}>
              <img src="/assets/favicon.png" alt="TM" className={styles.overlayLogo}
                onError={e => { e.target.style.display='none'; }} />
              <span className={styles.overlayBrandName}>TOY MAFIA</span>
              <span className={styles.overlayBrandSub}>ADMIN</span>
            </div>
            <span className={styles.overlayTitle}>MENU</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">✕</button>
          </div>

          {/* Nav */}
          <nav className={styles.overlayNav}>

            {/* Inventory dropdown */}
            <div className={styles.navGroup}>
              <button
                className={`${styles.navItem} ${INVENTORY_PATHS.includes(pathname) ? styles.navItemActive : ''}`}
                onClick={() => setInvOpen(o => !o)}
              >
                <span className={styles.navIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </span>
                <span className={styles.navLabel}>Inventory</span>
                <svg className={`${styles.navChevron} ${invOpen ? styles.navChevronOpen : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {invOpen && (
                <div className={styles.subList}>
                  {[
                    { href: '/',         label: 'Item List' },
                    { href: '/archived', label: 'Archived Items' },
                    { href: '/import',   label: 'Import Data' },
                  ].map(item => (
                    <a key={item.href} href={item.href}
                      className={`${styles.subItem} ${pathname === item.href ? styles.subItemActive : ''}`}
                      onClick={onClose}>
                      <span className={styles.subDot}/>
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Logs */}
            <a href="/logs"
              className={`${styles.navItem} ${pathname === '/logs' ? styles.navItemActive : ''}`}
              onClick={onClose}>
              <span className={styles.navIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </span>
              <span className={styles.navLabel}>Logs</span>
              {pathname === '/logs' && <span className={styles.activeDot}/>}
            </a>

            {/* Users */}
            <a href="/users"
              className={`${styles.navItem} ${pathname === '/users' ? styles.navItemActive : ''}`}
              onClick={onClose}>
              <span className={styles.navIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <span className={styles.navLabel}>Users</span>
              {pathname === '/users' && <span className={styles.activeDot}/>}
            </a>

          </nav>

          {/* Footer */}
          <div className={styles.overlayFooter}>
            <span className={styles.overlayVersion}>tmadmin v1.0</span>
          </div>
        </div>
      )}
    </>
  );
}
