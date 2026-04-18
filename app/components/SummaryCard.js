'use client';
import { useState } from 'react';
import styles from './SummaryCard.module.css';

export default function SummaryCard() {
  const [shopeeRate, setShopeeRate] = useState(20);
  const [editing, setEditing] = useState(false);
  const [tempRate, setTempRate] = useState(20);

  const handleEdit = () => {
    setTempRate(shopeeRate);
    setEditing(true);
  };

  const handleSave = () => {
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setShopeeRate(val);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitleWrap}>
          <span className={styles.cardTitle}>COMPUTATION GUIDE</span>
          <span className={styles.cardSub}>How each value is calculated per item</span>
        </div>
      </div>

      <div className={styles.grid}>

        {/* % MUP */}
        <div className={styles.statBox}>
          <div className={styles.statTop}>
            <span className={styles.statName}>% MUP</span>
            <span className={styles.statBadge}>Markup</span>
          </div>
          <div className={styles.formula}>
            <span className={styles.formulaText}>SRP ÷ Acq. Price</span>
          </div>
          <div className={styles.example}>
            e.g. ₱500 ÷ ₱250 = <strong>2.00x</strong>
          </div>
        </div>

        {/* WSP */}
        <div className={styles.statBox}>
          <div className={styles.statTop}>
            <span className={styles.statName}>WSP</span>
            <span className={styles.statBadge}>Total Value</span>
          </div>
          <div className={styles.formula}>
            <span className={styles.formulaText}>SRP × Quantity</span>
          </div>
          <div className={styles.example}>
            e.g. ₱500 × 10 = <strong>₱5,000</strong>
          </div>
        </div>

        {/* WSP - SRP */}
        <div className={styles.statBox}>
          <div className={styles.statTop}>
            <span className={styles.statName}>WSP − SRP</span>
            <span className={styles.statBadge}>Net</span>
          </div>
          <div className={styles.formula}>
            <span className={styles.formulaText}>(SRP × Qty) − SRP</span>
          </div>
          <div className={styles.example}>
            e.g. ₱5,000 − ₱500 = <strong>₱4,500</strong>
          </div>
        </div>

        {/* SP FEE — editable rate */}
        <div className={`${styles.statBox} ${styles.statBoxEditable}`}>
          <div className={styles.statTop}>
            <span className={styles.statName}>SP Fee</span>
            <span className={`${styles.statBadge} ${styles.statBadgeWarn}`}>Shopee</span>
          </div>

          <div className={styles.formula}>
            <span className={styles.formulaText}>
              WSP − SRP × (100% −{' '}
              {editing ? (
                <input
                  className={styles.rateInput}
                  type="number"
                  value={tempRate}
                  min={0} max={100}
                  onChange={e => setTempRate(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <button className={styles.rateBtn} onClick={handleEdit}>
                  {shopeeRate}%
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}
              )
            </span>
          </div>

          {editing ? (
            <div className={styles.editActions}>
              <button className={styles.saveBtn} onClick={handleSave}>Save</button>
              <button className={styles.cancelEditBtn} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div className={styles.example}>
              e.g. ₱5,000 − ₱500 × {100 - shopeeRate}% = <strong>₱{(5000 - 500 * ((100 - shopeeRate) / 100)).toLocaleString()}</strong>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
