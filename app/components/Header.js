'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// Map pathname to page name
function getPageName(pathname) {
  if (pathname === '/')         return 'Inventory';
  if (pathname === '/archived') return 'Archived Items';
  if (pathname === '/import')   return 'Import Data';
  if (pathname === '/logs')     return 'Logs';
  if (pathname === '/users')    return 'Users';
  if (pathname === '/login')    return 'Login';
  return 'Dashboard';
}

const USERNAME   = 'Admin';
const USER_ROLE  = 'Administrator'; // replaced by session in Phase 3

function SunIcon()  {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function MoonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}

export default function Header({ onMenuToggle, menuOpen }) {
  const { theme, toggleTheme } = useTheme();
  const pathname               = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageName = getPageName(pathname);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>

        {/* LEFT: Hamburger + Logo + Brand */}
        <div className={styles.headerLeft}>
          <button
            className={styles.hamburger}
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.lineTop : ''}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.lineMid : ''}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.lineBot : ''}`} />
          </button>

          <div className={styles.brand}>
            <img
              src="/assets/favicon.png"
              alt="Toy Mafia"
              className={styles.logoImg}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <span className={styles.brandName}>TOY MAFIA</span>
          </div>
        </div>

        {/* CENTER: Current page name */}
        <div className={styles.headerCenter}>
          <span className={styles.pageName}>{pageName}</span>
        </div>

        {/* RIGHT: Theme + User Role + Avatar dropdown */}
        <div className={styles.headerRight}>

          {/* Theme toggle */}
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* User role label — hidden on small screens */}
          <span className={styles.userRole}>{USER_ROLE}</span>

          {/* Avatar + Dropdown */}
          <div className={styles.userWrap} ref={dropdownRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => setDropdownOpen(o => !o)}
              aria-label="User menu"
            >
              {/* Phase 3: replace with u_profile image */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdown}>
                {/* User info */}
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.dropdownName}>{USERNAME}</div>
                    <div className={styles.dropdownRole}>{USER_ROLE}</div>
                  </div>
                </div>

                <div className={styles.dropdownDivider} />

                <a href="#" className={styles.dropdownItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Profile
                </a>
                <a href="#" className={styles.dropdownItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  Settings
                </a>
                <a href="#" className={styles.dropdownItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Account
                </a>

                <div className={styles.dropdownDivider} />

                <button className={styles.dropdownItem} onClick={toggleTheme}>
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>

                <div className={styles.dropdownDivider} />

                <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
