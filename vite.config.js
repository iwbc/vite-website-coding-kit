import path from 'path';

import globInput from '@macropygia/vite-plugin-glob-input';
import imagemin from '@macropygia/vite-plugin-imagemin-cache';
import autoprefixer from 'autoprefixer';
import { defineConfig, loadEnv } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import ViteRestart from 'vite-plugin-restart';
import tsconfigPaths from 'vite-tsconfig-paths';

import handlebarsContext from './handlebars.context';
import svgSprite from './vite/vite-plugin-svg-sprite';

export default defineConfig(({ mode }) => {
  return {
    root: path.resolve(__dirname, './src'),
    base: './',
    server: {
      host: true,
      port: 3000,
    },
    build: {
      outDir: path.resolve(__dirname, './dist'),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            let extType = assetInfo.name.split('.')[1];
            if (/webp|png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'images';
            }
            if (extType === 'css') {
              return 'assets/css/[name].css';
            }
            return `assets/${extType}/[name][extname]`;
          },
          chunkFileNames: 'assets/js/[name].js',
          entryFileNames: 'assets/js/[name].js',
        },
      },
    },
    css: {
      postcss: {
        plugins: [autoprefixer],
      },
    },
    plugins: [
      tsconfigPaths(),
      svgSprite({
        inputDir: 'src/assets/sprites',
        outputDir: 'dist/assets/sprites',
      }),
      globInput({
        patterns: ['src/**/*.html', '!src/partials/**/*.html'],
      }),
      imagemin({
        public: {
          preventDefault: false,
        },
        exclude: ['vendors/**/*'],
        plugins: {
          mozjpeg: {
            quality: 85,
          },
          svgo: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    collapseGroups: false,
                  },
                },
              },
            ],
          },
        },
        asset: {
          useCrc: true,
        },
      }),
      handlebars({
        partialDirectory: path.resolve(__dirname, './src/partials'),
        helpers: {
          times: (n, block) => {
            var accum = '';
            for (var i = 0; i < n; ++i) accum += block.fn(i);
            return accum;
          },
        },
        context(pagePath) {
          return {
            env: {
              ...loadEnv(mode, process.cwd()),
              MODE: mode,
            },
            context: { ...handlebarsContext.global, ...handlebarsContext[pagePath] },
          };
        },
      }),
      ViteRestart.default({ restart: ['../vite.config.js', '../handlebars.context.js'] }),
    ],
  };
});
