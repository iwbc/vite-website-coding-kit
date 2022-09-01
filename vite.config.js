import fs from 'fs';
import path from 'path';

import globInput from '@macropygia/vite-plugin-glob-input';
import imagemin from '@macropygia/vite-plugin-imagemin-cache';
import autoprefixer from 'autoprefixer';
import glob from 'glob';
import SVGSpriter from 'svg-sprite';
import { defineConfig, loadEnv } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import ViteRestart from 'vite-plugin-restart';

import handlebarsContext from './handlebars.context';

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
    resolve: {
      alias: [
        { find: '@/', replacement: path.join(__dirname, 'src/') },
        { find: '@@/', replacement: path.join(__dirname, './') },
      ],
    },
    plugins: [
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

function svgSprite({ inputDir, outputDir }) {
  const inputPath = path.resolve(inputDir);
  const outputPath = path.resolve(outputDir);

  if (!fs.existsSync(inputPath)) {
    return;
  }

  const dirents = fs.readdirSync(inputPath, { withFileTypes: true });
  const dirs = dirents.filter((dirent) => dirent.isDirectory()).map(({ name }) => name);
  dirs.push(''); // inputディレクトリ直下にsvgファイルが配置されている場合用

  return {
    name: 'svg-sprite',
    generateBundle: () => {
      dirs.forEach((dir) => {
        const spriteName = dir ? dir : 'sprite';
        const files = glob.sync(path.join(inputPath, dir) + '/*.svg');
        const spriter = new SVGSpriter({
          mode: {
            symbol: {
              dest: outputPath,
              sprite: `${spriteName}.svg`,
            },
          },
          shape: {
            transform: [
              {
                svgo: {
                  plugins: [{ removeTitle: true }, { removeAttrs: { attrs: 'fill' } }],
                },
              },
            ],
          },
        });

        if (files.length) {
          files.forEach((file) => {
            spriter.add(file, null, fs.readFileSync(file, 'utf-8'));
          });
          spriter.compile((_, result) => {
            for (const type in result.symbol) {
              fs.mkdirSync(outputPath, { recursive: true });
              fs.writeFileSync(result.symbol[type].path, result.symbol[type].contents);
            }
          });
        }
      });
    },
  };
}
