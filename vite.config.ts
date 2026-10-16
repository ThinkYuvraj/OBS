import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { createLogger, defineConfig, loadEnv } from 'vite';

// Custom logger to suppress all TailwindCSS and styling warnings
const customLogger = createLogger();
const originalWarn = customLogger.warn;
customLogger.warn = (msg, options) => {
  if (
    typeof msg === 'string' &&
    (msg.toLowerCase().includes('tailwind') ||
      msg.toLowerCase().includes('postcss') ||
      msg.toLowerCase().includes('@tailwindcss') ||
      msg.toLowerCase().includes('lightningcss') ||
      msg.toLowerCase().includes('css') ||
      msg.toLowerCase().includes('chunk size') ||
      msg.toLowerCase().includes('@theme') ||
      msg.toLowerCase().includes('@layer'))
  ) {
    return;
  }
  originalWarn(msg, options);
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const vitePort = parseInt(env.VITE_PORT || '3000', 10);
  const backendPort = parseInt(env.PORT || '3000', 10);
  const backendUrl = `http://localhost:${backendPort}`;
  const backendWsUrl = `ws://localhost:${backendPort}`;

  return {
    customLogger,
    plugins: [
      react(),
      tailwindcss({
        optimize: {
          minify: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    css: {
      devSourcemap: false,
    },
    build: {
      chunkSizeWarningLimit: 5000,
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          const str = (warning.message || '') + (warning.id || '') + (warning.code || '');
          if (
            str.toLowerCase().includes('tailwind') ||
            str.toLowerCase().includes('postcss') ||
            str.toLowerCase().includes('lightningcss') ||
            str.toLowerCase().includes('css') ||
            warning.code === 'UNUSED_EXTERNAL_IMPORT' ||
            warning.code === 'CIRCULAR_DEPENDENCY'
          ) {
            return;
          }
          defaultHandler(warning);
        },
      },
    },
    server: {
      port: vitePort,
      strictPort: false,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: backendWsUrl,
          ws: true,
          changeOrigin: true,
        },
        '/health': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: vitePort,
      strictPort: false,
      host: '0.0.0.0',
    },
  };
});
