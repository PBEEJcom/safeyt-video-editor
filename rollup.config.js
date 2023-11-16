import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import tailwindcss from 'tailwindcss';

const config = [{
    input: 'src/index.tsx',
    output: {
            dir: "dist",
            format: 'esm',
            sourcemap: true,
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM'
            }
    },
    external: ['react', 'react-dom'],
    plugins: [
        external(),
        resolve({
            browser: true,
            dedupe: ['react', 'react-dom'],
          }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
        postcss({
            config: {
              path: './postcss.config.js',
            },
            extensions: ['.css'],
            minimize: true,
            inject: {
              insertAt: 'top',
            },
            plugins: [tailwindcss("./tailwind.config.js")],
          }),
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
