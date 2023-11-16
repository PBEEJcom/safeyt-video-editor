import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';


const config = [{
    input: 'src/index.tsx',
    output: {
            dir: "dist",
            format: 'esm',
            sourcemap: true
    },
    plugins: [
        external(),
        resolve({
            browser: true,
            dedupe: ['react', 'react-dom'],
          }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
        postcss(),
        terser(),
        json()
    ]
},
{
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: "esm" }],
    external: [/\.css$/],
    plugins: [dts()],
},]

export default config;
