import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}