'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const USERNAME = 'Admin';

export default function Header({ onMenuToggle, menuOpen }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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

        {/* Left: Hamburger + Logo + Brand */}
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
            {/* Logo image — falls back to dot if no image */}
            <div className={styles.logoWrap}>
              <img
                src="/assets/favicon.png"
                alt="Toy Mafia"
                className={styles.logoImg}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
              />
              <span className={styles.brandDot} style={{ display: 'none' }} />
            </div>
            <span className={styles.brandName}>TOY MAFIA</span>
            <span className={styles.brandSub}>ADMIN</span>
          </div>
        </div>

        {/* Right: Greeting + Avatar + Dropdown */}
        <div className={styles.headerRight} ref={dropdownRef}>
          <button
            className={styles.userBtn}
            onClick={() => setDropdownOpen(o => !o)}
            aria-label="User menu"
          >
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

          {/* Dropdown */}
          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownAvatar}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
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
    </header>
  );
}
