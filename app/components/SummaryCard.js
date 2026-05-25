'use client';
import { useState, useEffect } from 'react';
import styles from './SummaryCard.module.css';

const LS_SP_KEY   = 'tm-sp-fee-rate';
const LS_SALE_KEY = 'tm-sale-rate';

function EditableRate({ value, onChange, label }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp]       = useState(value);

  const handleSave = () => {
    const val = parseFloat(temp);
    if (!isNaN(val) && val >= 0 && val <= 100) onChange(val);
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter')  handleSave();
    if (e.key === 'Escape') setEditing(false);
  };

  return editing ? (
    <span className={styles.rateEditWrap}>
      <input
        className={styles.rateInput}
        type="number" value={temp} min={0} max={100}
        onChange={e => setTemp(e.target.value)}
        onKeyDown={handleKey}
        autoFocus
      />
      <span className={styles.ratePercent}>%</span>
      <button className={styles.rateSaveBtn} onClick={handleSave}>✓</button>
      <button className={styles.rateCancelBtn} onClick={() => setEditing(false)}>✕</button>
    </span>
  ) : (
    <button className={styles.rateBtn} onClick={() => { setTemp(value); setEditing(true); }}>
      {value}%
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  );
}

export default function SummaryCard() {
  const [spRate,   setSpRate]   = useState(20);
  const [saleRate, setSaleRate] = useState(20);
  const [mounted,  setMounted]  = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSp   = localStorage.getItem(LS_SP_KEY);
    const savedSale = localStorage.getItem(LS_SALE_KEY);
    if (savedSp   !== null) setSpRate(parseFloat(savedSp));
    if (savedSale !== null) setSaleRate(parseFloat(savedSale));
    setMounted(true);
  }, []);

  const handleSpRate = (val) => {
    setSpRate(val);
    localStorage.setItem(LS_SP_KEY, val);
  };
  const handleSaleRate = (val) => {
    setSaleRate(val);
    localStorage.setItem(LS_SALE_KEY, val);
  };

  if (!mounted) return null;

  // Example values for display
  const exSrp = 500, exQty = 10, exAcq = 250, exSold = 3;
  const exWSP     = exSrp * exQty;
  const exWSPmSRP = exWSP - exSrp;
  const exSpFee   = exWSP - exSrp * (1 - spRate / 100);
  const exSale    = exSrp * (1 - saleRate / 100);
  const exMUP     = exSrp / exAcq;
  const exRevenue = exSrp * exSold;
  const exProfit  = (exSrp - exAcq) * exSold;

  const fmt = (v) => `₱${parseFloat(v).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitleWrap}>
          <span className={styles.cardTitle}>COMPUTATION GUIDE</span>
          <span className={styles.cardSub}>How each value is calculated per item · Rates saved to your browser</span>
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
            e.g. ₱{exSrp} ÷ ₱{exAcq} = <strong>{exMUP.toFixed(2)}x</strong>
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
            e.g. ₱{exSrp} × {exQty} = <strong>{fmt(exWSP)}</strong>
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
            e.g. {fmt(exWSP)} − ₱{exSrp} = <strong>{fmt(exWSPmSRP)}</strong>
          </div>
        </div>

        {/* SP Fee */}
        <div className={`${styles.statBox} ${styles.statBoxEditable}`}>
          <div className={styles.statTop}>
            <span className={styles.statName}>SP Fee</span>
            <span className={`${styles.statBadge} ${styles.statBadgeWarn}`}>Shopee</span>
          </div>
          <div className={styles.formula}>
            <span className={styles.formulaText}>
              WSP − SRP × (100% − <EditableRate value={spRate} onChange={handleSpRate} label="SP Fee" />)
            </span>
          </div>
          <div className={styles.example}>
            e.g. {fmt(exWSP)} − ₱{exSrp} × {100 - spRate}% = <strong>{fmt(exSpFee)}</strong>
          </div>
        </div>

        {/* Revenue */}
        <div className={styles.statBox}>
          <div className={styles.statTop}>
            <span className={styles.statName}>Revenue</span>
            <span className={styles.statBadge}>Sold</span>
          </div>
          <div className={styles.formula}>
            <span className={styles.formulaText}>SRP × Sold Qty</span>
          </div>
          <div className={styles.example}>
            e.g. ₱{exSrp} × {exSold} = <strong>{fmt(exRevenue)}</strong>
          </div>
        </div>

        {/* Profit */}
        <div className={styles.statBox}>
          <div className={styles.statTop}>
            <span className={styles.statName}>Profit</span>
            <span className={`${styles.statBadge} ${styles.statBadgeProfit}`}>Net</span>
          </div>
          <div className={styles.formula}>
            <span className={styles.formulaText}>(SRP − Acq) × Sold Qty</span>
          </div>
          <div className={styles.example}>
            e.g. (₱{exSrp} − ₱{exAcq}) × {exSold} = <strong>{fmt(exProfit)}</strong>
          </div>
        </div>

        {/* Sale Price */}
        <div className={`${styles.statBox} ${styles.statBoxEditable}`}>
          <div className={styles.statTop}>
            <span className={styles.statName}>Sale Price</span>
            <span className={`${styles.statBadge} ${styles.statBadgeSale}`}>Discount</span>
          </div>
          <div className={styles.formula}>
            <span className={styles.formulaText}>
              SRP × (1 − <EditableRate value={saleRate} onChange={handleSaleRate} label="Sale %" />)
            </span>
          </div>
          <div className={styles.example}>
            e.g. ₱{exSrp} × {(1 - saleRate / 100).toFixed(2)} = <strong>{fmt(exSale)}</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
