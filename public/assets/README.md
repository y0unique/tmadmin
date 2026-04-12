# /public/assets/

Place your static assets in this folder. They will be served at `/assets/filename`.

## Recommended files to add:

| File | Usage |
|------|-------|
| `favicon.png` | Browser tab icon (shown in header logo) |
| `favicon.ico` | Browser tab fallback icon |
| `logo.png` | Full Toy Mafia logo |
| `logo-dark.png` | Dark version of the logo (for light backgrounds) |
| `og-image.png` | Social media preview image (1200x630px recommended) |

## How to use in Next.js

Files in `/public` are served from the root URL:

```jsx
// In your component
<img src="/assets/logo.png" alt="Toy Mafia" />

// Or with Next.js Image component (recommended)
import Image from 'next/image';
<Image src="/assets/logo.png" alt="Toy Mafia" width={120} height={40} />
```

## Favicon setup

To set the favicon, update `app/layout.js`:

```js
export const metadata = {
  title: 'Toy Mafia Admin',
  description: 'Inventory management system',
  icons: {
    icon: '/assets/favicon.png',
    shortcut: '/assets/favicon.ico',
    apple: '/assets/favicon.png',
  },
};
```
