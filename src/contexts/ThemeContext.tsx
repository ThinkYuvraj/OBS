import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'red-white' | 'marketinglu';

interface ThemeContextType {
  theme: AppTheme;
  isRedWhite: boolean;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  themeConfig: {
    name: string;
    label: string;
    badge: string;
    primaryHex: string;
    accentHex: string;
    bgClass: string;
    borderClass: string;
    activeTabClass: string;
    actionBtnClass: string;
    accentTextClass: string;
    glowClass: string;
    pillBgClass: string;
  };
}

const THEME_STORAGE_KEY = 'mktglu_app_theme';

const THEME_CONFIGS = {
  'red-white': {
    name: 'red-white' as const,
    label: 'Red & White (Default)',
    badge: 'DEFAULT BROADCAST',
    primaryHex: '#E11D48',
    accentHex: '#FFFFFF',
    bgClass: 'bg-[#0e0407]',
    borderClass: 'border-rose-500/35 hover:border-rose-400',
    activeTabClass: 'border border-rose-500 bg-rose-600 text-white font-black shadow-[0_0_14px_rgba(225,29,72,0.45)]',
    actionBtnClass: 'border-rose-500 text-rose-300 hover:text-white hover:bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.3)]',
    accentTextClass: 'text-rose-400',
    glowClass: 'shadow-[0_0_16px_rgba(225,29,72,0.35)]',
    pillBgClass: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
  },
  'marketinglu': {
    name: 'marketinglu' as const,
    label: 'MarketinGlu Cyan (Secondary)',
    badge: 'SIGNATURE MG',
    primaryHex: '#06B6D4',
    accentHex: '#38BDF8',
    bgClass: 'bg-[#070b14]',
    borderClass: 'border-cyan-500/35 hover:border-cyan-400',
    activeTabClass: 'border border-cyan-400 bg-cyan-950/60 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]',
    actionBtnClass: 'border-cyan-400 text-cyan-300 hover:text-slate-950 hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    accentTextClass: 'text-cyan-400',
    glowClass: 'shadow-[0_0_16px_rgba(6,182,212,0.35)]',
    pillBgClass: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default is 'red-white' as explicitly requested by user
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'marketinglu' || saved === 'red-white') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'red-white'; // Red and White default!
  });

  const applyThemeToDOM = (activeTheme: AppTheme) => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', activeTheme);
    body.setAttribute('data-theme', activeTheme);

    if (activeTheme === 'red-white') {
      root.classList.remove('theme-marketinglu');
      root.classList.add('theme-red-white');
      body.classList.remove('theme-marketinglu');
      body.classList.add('theme-red-white');
    } else {
      root.classList.remove('theme-red-white');
      root.classList.add('theme-marketinglu');
      body.classList.remove('theme-red-white');
      body.classList.add('theme-marketinglu');
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'red-white' ? 'marketinglu' : 'red-white'));
  };

  const themeConfig = THEME_CONFIGS[theme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isRedWhite: theme === 'red-white',
        setTheme,
        toggleTheme,
        themeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
