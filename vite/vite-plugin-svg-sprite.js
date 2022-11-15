import fs from 'fs';
import path from 'path';

import glob from 'glob';
import SVGSpriter from 'svg-sprite';

export default ({ inputDir, outputDir }) => {
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
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeAttrs: { attrs: 'fill' },
                        },
                      },
                    },
                  ],
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
};
