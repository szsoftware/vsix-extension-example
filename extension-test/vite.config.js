// vite.config.js
import { defineConfig } from 'vite';
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vsixPlugin()
  ],
  root: 'src', // Set the root directory to src
  publicDir: '../public', // Set the public directory
  resolve: {
    alias: {
      // Add any aliases if needed
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      // External packages that shouldn't be bundled
      external: [
        // Add any external dependencies that shouldn't be bundled
        /^@codingame\/monaco-vscode-api\/vscode\//,
        /^@codingame\/monaco-vscode-api\/tools\//,
        /^@codingame\/monaco-vscode-api\/extensions/,
        /^vscode\//
      ],
      output: {
        // Global variables to use for externalized deps
        globals: {
          // Add global variables for external dependencies if needed
        }
      }
    },
    // Prevent minification for better debugging
    minify: false,
    // Ensure proper handling of dynamic imports
    dynamicImportVarsOptions: {
      warnOnError: true,
      exclude: []
    }
  },
  server: {
    port: 9000,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: [
      'monaco-editor',
      '@codingame/monaco-vscode-api'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});