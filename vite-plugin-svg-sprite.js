import fs from 'fs';
import path from 'path';

import glob from 'glob';
import SVGSpriter from 'svg-sprite';

export default ({ inputDirs, outputDir }) => {
  const cwd = __dirname;
  const spriter = new SVGSpriter({
    dest: outputDir,
    mode: {
      symbol: true,
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
                    removeTitle: true,
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

  outputDir = path.resolve(outputDir);

  return {
    name: 'rollup-plugin-svg-sprite',
    generateBundle: () => {
      inputDirs.map((inputDir) => {
        const bundleName = path.basename(inputDir);
        glob.sync(inputDir + '/*.svg', { cwd }).forEach((file) => {
          const filePath = path.join(cwd, file);
          spriter.add(filePath, null, fs.readFileSync(filePath, 'utf-8'));
          spriter.compile((error, result) => {
            for (const type in result.symbol) {
              fs.mkdirSync(outputDir, { recursive: true });
              fs.writeFileSync(`${outputDir}/${bundleName}.svg`, result.symbol[type].contents);
            }
          });
        });
      });
    },
  };
};
