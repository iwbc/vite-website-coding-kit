import { resolve } from 'path';

import vitePluginGlobInput from '@macropygia/vite-plugin-glob-input';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import ViteRestart from 'vite-plugin-restart';

const HBS_VARS = {
  '/index.html': {
    content: 'example',
  },
};

export default defineConfig({
  root: './src',
  base: './',
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.')[1];
          if (/webp|png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';
          }
          return `assets/${extType}/[name][extname]`;
        },
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name.replace(/^src\//, '');
          return `assets/js/${name}-[hash].js`;
        },
        entryFileNames: (chunkInfo) => {
          const name = chunkInfo.name.replace(/^src\//, '');
          return `assets/js/${name}-[hash].js`;
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  plugins: [
    vitePluginGlobInput({
      patterns: ['src/**/*.html', '!src/partials/**/*.html'],
    }),
    ViteRestart.default({ restart: ['../vite.config.js'] }),
    handlebars({
      partialDirectory: resolve(__dirname, './src' + '/partials'),
      context(pagePath) {
        return HBS_VARS[pagePath];
      },
    }),
  ],
});
