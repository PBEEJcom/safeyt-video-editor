import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

const config = {
    input: 'src/index.tsx',
    output: {
            dir: "dist",
            format: 'esm',
            sourcemap: true
        },
    plugins: [
        external(),
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
        postcss(),
        terser()
    ]
}

export default config;
