import './globals.css';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';

export const metadata = {
  title: 'Toy Mafia Admin',
  description: 'Inventory management system for Toy Mafia',
  icons: {
    icon: '/assets/favicon.png',
    shortcut: '/assets/favicon.ico',
    apple: '/assets/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
