import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import yaml from '@rollup/plugin-yaml';

export default {
    input: 'src/cli/index.ts',
    output: {
        file: 'dist/cli.js',
        format: 'cjs'
    },
    plugins: [
        resolve({
            preferBuiltins: true
        }),
        commonjs(),
        json(),
        yaml(),
        typescript({
            typescript: require('typescript')
        })
    ]
};
