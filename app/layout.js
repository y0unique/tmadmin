import './globals.css';

export const metadata = {
  title: 'Toy Mafia Inventory',
  description: 'Inventory management system for Toy Mafia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
