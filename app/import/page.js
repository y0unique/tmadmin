'use client';
import { useState, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import styles from './import.module.css';

const REQUIRED_HEADERS = [
  'item_name', 'item_title', 'item_type', 'item_description',
  'item_location', 'item_category', 'item_quality', 'item_size',
  'item_sticker', 'item_acqprice', 'item_srp', 'item_quantity', 'item_image',
];

export default function ImportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reset, setReset] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      setError('Only CSV files are accepted.');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

      // Check headers
      const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
      if (missing.length > 0) {
        setError(`Invalid headers. Missing: ${missing.join(', ')}`);
        setPreview(null);
        setFile(null);
        return;
      }

      // Show preview (first 5 rows)
      const previewRows = lines.slice(1, 6).map(l =>
        l.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      );
      setPreview({ headers, rows: previewRows, total: lines.length - 1, text });
    };
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      fileRef.current.files = e.dataTransfer.files;
      handleFile({ target: { files: [f] } });
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: preview.text, reset }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Import failed');
      setResult(json);
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className={styles.layout}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(o => !o)} menuOpen={sidebarOpen} />

      <main className={styles.main}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Import Data</h1>
            <p className={styles.pageSub}>Upload a CSV file to add items to the inventory.</p>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Left: Upload + Options */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>CSV FILE</span>
            </div>

            {/* Required headers info */}
            <div className={styles.infoBox}>
              <p className={styles.infoLabel}>Required CSV headers:</p>
              <div className={styles.headerPills}>
                {REQUIRED_HEADERS.map(h => (
                  <span key={h} className={styles.headerPill}>{h}</span>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={`${styles.dropZone} ${preview ? styles.dropZoneSuccess : ''} ${error ? styles.dropZoneError : ''}`}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className={styles.fileInput}
                onChange={handleFile}
              />
              {preview ? (
                <div className={styles.dropZoneContent}>
                  <span className={styles.dropZoneIcon}>✓</span>
                  <p className={styles.dropZoneFile}>{file?.name || 'File loaded'}</p>
                  <p className={styles.dropZoneCount}>{preview.total} rows detected</p>
                </div>
              ) : (
                <div className={styles.dropZoneContent}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32" className={styles.dropZoneIcon}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className={styles.dropZoneText}>Drop CSV here or click to browse</p>
                  <p className={styles.dropZoneHint}>Only .csv files accepted</p>
                </div>
              )}
            </div>

            {error && (
              <div className={styles.errorBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Reset toggle */}
            <div className={styles.resetRow}>
              <div className={styles.resetInfo}>
                <span className={styles.resetLabel}>Reset Database</span>
                <span className={styles.resetHint}>
                  {reset
                    ? '⚠ Will set ALL current active items to inactive before importing'
                    : 'Will only add new items without removing existing ones'}
                </span>
              </div>
              <button
                className={`${styles.toggle} ${reset ? styles.toggleOn : ''}`}
                onClick={() => setReset(o => !o)}
                aria-label="Toggle reset"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            {/* Action buttons */}
            <div className={styles.btnRow}>
              {preview && (
                <button className={styles.clearBtn} onClick={handleClear}>
                  Clear
                </button>
              )}
              <button
                className={`${styles.importBtn} ${reset ? styles.importBtnDanger : ''}`}
                onClick={handleImport}
                disabled={!preview || importing}
              >
                {importing ? 'Importing...' : reset ? '⚠ Reset & Import' : 'Import CSV'}
              </button>
            </div>
          </div>

          {/* Right: Preview / Result */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>
                {result ? 'IMPORT RESULT' : 'PREVIEW'}
              </span>
            </div>

            {result ? (
              <div className={styles.result}>
                <div className={`${styles.resultBanner} ${result.errors?.length > 0 ? styles.resultBannerWarn : styles.resultBannerOk}`}>
                  <span className={styles.resultIcon}>{result.errors?.length > 0 ? '⚠' : '✓'}</span>
                  <div>
                    <p className={styles.resultTitle}>
                      {result.inserted} item{result.inserted !== 1 ? 's' : ''} imported successfully
                    </p>
                    {result.deactivated > 0 && (
                      <p className={styles.resultSub}>{result.deactivated} existing items set to inactive</p>
                    )}
                  </div>
                </div>

                <div className={styles.resultDetails}>
                  <div className={styles.resultRow}>
                    <span className={styles.resultKey}>Inserted IDs</span>
                    <span className={styles.resultVal}>{result.insertedIds?.join(', ') || '—'}</span>
                  </div>
                  {result.deactivated > 0 && (
                    <div className={styles.resultRow}>
                      <span className={styles.resultKey}>Deactivated IDs</span>
                      <span className={styles.resultVal}>{result.deactivatedIds?.join(', ') || '—'}</span>
                    </div>
                  )}
                  {result.errors?.length > 0 && (
                    <div className={styles.resultErrors}>
                      <p className={styles.resultKey}>Row Errors ({result.errors.length})</p>
                      {result.errors.map((e, i) => (
                        <p key={i} className={styles.resultError}>Row {e.row}: {e.error}</p>
                      ))}
                    </div>
                  )}
                </div>

                <button className={styles.clearBtn} onClick={handleClear} style={{ marginTop: '1rem' }}>
                  Import Another File
                </button>
              </div>
            ) : preview ? (
              <div className={styles.previewWrap}>
                <p className={styles.previewNote}>Showing first 5 of {preview.total} rows</p>
                <div className={styles.previewTable}>
                  <table>
                    <thead>
                      <tr>
                        {preview.headers.map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((val, j) => <td key={j}>{val}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className={styles.emptyPreview}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="40" height="40" style={{ color: 'var(--border)' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p>Upload a CSV to see a preview</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}