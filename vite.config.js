import { resolve } from 'path';

import globInput from '@macropygia/vite-plugin-glob-input';
import imagemin from '@macropygia/vite-plugin-imagemin-cache';
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
  root: resolve(__dirname, './src'),
  base: './',
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: resolve(__dirname, './dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.')[1];
          if (/webp|png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';
          }
          if (extType === 'css') {
            return 'assets/css/[name]-[hash].css';
          }
          return `assets/${extType}/[name][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  plugins: [
    globInput({
      patterns: ['src/**/*.html', '!src/partials/**/*.html'],
    }),
    imagemin({
      public: {
        preventDefault: true,
      },
      plugins: {
        mozjpeg: {
          quality: 85,
        },
        svgo: {
          plugins: [
            {
              name: 'collapseGroups',
              active: false,
            },
          ],
        },
      },
    }),
    handlebars({
      partialDirectory: resolve(__dirname, './src' + '/partials'),
      context(pagePath) {
        return HBS_VARS[pagePath];
      },
    }),
    ViteRestart.default({ restart: ['../vite.config.js'] }),
  ],
});
