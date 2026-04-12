import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        {new Date().getFullYear()} © ToyMafia
      </div>
      <div className={styles.right}>
        Crafted <span className={styles.skull}>☠</span> by{' '}
        <a href="https://jon-raguini.vercel.app/" target="_blank" rel="noopener noreferrer" className={styles.link}>
          Zeraphm
        </a>
      </div>
    </footer>
  );
}