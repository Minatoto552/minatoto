import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const githubPagesBase = '/minatoto/';

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || (mode === 'github-pages' || process.env.GITHUB_ACTIONS ? githubPagesBase : '/'),
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('three')) return 'three';
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('framer-motion') || id.includes('motion')) return 'motion';
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
          return 'vendor';
        },
      },
    },
  },
}));
