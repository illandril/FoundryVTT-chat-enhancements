/* eslint-disable import/no-named-as-default-member */
import * as Manifest from '@illandril/foundryvtt-utils/dist/Manifest.js';
import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import fs from 'fs-extra';
import copy from 'rollup-plugin-copy';

const target = 'dist';
const isProduction = process.env.BUILD === 'production';

export default {
  input: 'src/index.ts',
  output: {
    file: `${target}/module.js`,
    format: 'es',
    sourcemap: true,
    sourcemapPathTransform: (sourcePath) => sourcePath.replace(/^..[/\\]?/, ''),
  },
  plugins: [
    json(),
    nodeResolve({ extensions: ['.js', '.ts'] }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.ts'],
    }),
    copy({
      targets: [
        { src: 'src/styles.css', dest: target },
        { src: 'src/lang', dest: target },
        { src: 'LICENSE', dest: target },
      ],
    }),
    {
      name: 'moduleJSON',
      buildStart: async () => {
        const { version, description, repository } = await fs.readJSON('package.json');
        const manifestData = await fs.readJSON('src/manifestData.json');

        return fs.writeJSON(`${target}/module.json`, Manifest.generate({
          ...manifestData,
          authors: [Manifest.IllandrilAuthorInfo],
          version,
          description,
          repositoryURL: repository.url,
        }), { spaces: 2 });
      },
    },
    {
      name: 'lock',
      buildStart: async () => {
        if (!isProduction) {
          await fs.outputFile(`${target}/illandril-chat-enhancements.lock`, '');
        }
      },
    },
  ],
};

