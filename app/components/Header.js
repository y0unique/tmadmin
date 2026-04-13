'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import styles from './Header.module.css';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const USERNAME = 'Admin';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Header({ onMenuToggle, menuOpen }) {
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

        {/* Left: Hamburger + Brand */}
        <div className={styles.headerLeft}>
          <button className={styles.hamburger} onClick={onMenuToggle} aria-label="Toggle menu">
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.lineTop : ''}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.lineMid : ''}`} />
            <span className={`${styles.hamburgerLine} ${menuOpen ? styles.lineBot : ''}`} />
          </button>
          <div className={styles.brand}>
            <div className={styles.logoWrap}>
              <img src="/assets/favicon.png" alt="Toy Mafia" className={styles.logoImg}
                onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
              <span className={styles.brandDot} style={{ display: 'none' }} />
            </div>
            <span className={styles.brandName}>TOY MAFIA</span>
            <span className={styles.brandSub}>ADMIN</span>
          </div>
        </div>

        {/* Right: Theme toggle + User */}
        <div className={styles.headerRight}>
          {/* Theme toggle button in header */}
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* User dropdown */}
          <div className={styles.userWrap} ref={dropdownRef}>
            <button className={styles.userBtn} onClick={() => setDropdownOpen(o => !o)} aria-label="User menu">
              <div className={styles.greeting}>
                <span className={styles.greetingText}>{getGreeting()},</span>
                <span className={styles.username}>{USERNAME}</span>
              </div>
              <div className={styles.avatar}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <svg className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.dropdownName}>{USERNAME}</div>
                    <div className={styles.dropdownRole}>Administrator</div>
                  </div>
                </div>

                <div className={styles.dropdownDivider} />

                <a href="#" className={styles.dropdownItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </a>
                <a href="#" className={styles.dropdownItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </a>
                <a href="#" className={styles.dropdownItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Account
                </a>

                <div className={styles.dropdownDivider} />

                {/* Theme toggle in dropdown */}
                <button className={styles.dropdownItem} onClick={toggleTheme}>
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>

                <div className={styles.dropdownDivider} />

                <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
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