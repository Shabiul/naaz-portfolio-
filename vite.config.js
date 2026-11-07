import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import content from './vite-plugin-content.js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * Every .html page becomes a build entry.
 * `src/` is excluded: the files in src/partials are fragments composed into
 * pages at build time, not pages in their own right.
 */
const IGNORED = /^(node_modules|dist|src)[\\/]/;

const pages = Object.fromEntries(
  globSync('**/*.html', { cwd: root })
    .filter((file) => !IGNORED.test(file))
    .map((file) => [file.replace(/\.html$/, '').replace(/[\\/]/g, '-'), resolve(root, file)]),
);

export default defineConfig({
  plugins: [content(), tailwindcss()],
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    // The crystal chunk is Three.js (~545 kB, ~137 kB gzipped). It is loaded
    // only by services.html, so its size is not paid by any other page.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: pages,
      output: {
        // Keep the 3D/animation vendors in their own chunks so pages that
        // never touch them are not forced to pay the download cost.
        manualChunks: {
          motion: ['gsap', 'lenis'],
        },
      },
    },
  },
});
