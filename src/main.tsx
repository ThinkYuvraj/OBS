import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress all TailwindCSS and styling warnings in browser console
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const fullText = args
      .map((a) => (typeof a === 'string' ? a : a ? JSON.stringify(a) : ''))
      .join(' ')
      .toLowerCase();
    if (
      fullText.includes('tailwind') ||
      fullText.includes('tailwindcss') ||
      fullText.includes('@tailwindcss') ||
      fullText.includes('postcss') ||
      fullText.includes('lightningcss') ||
      fullText.includes('css')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

createRoot(document.getElementById('root')!).render(<App />);
