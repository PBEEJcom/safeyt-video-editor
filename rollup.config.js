import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import url from "@rollup/plugin-url";
import json from "@rollup/plugin-json";
import postcss from "rollup-plugin-postcss";
 
const { readdirSync, statSync } = require("fs");
const { join } = require("path");
 
const dirs = p =>
 readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
 
const modules = dirs("src");
 
const config = moduleDir => ({
 input: `src/${moduleDir}/index.js`,
 output: [
   {
     file: `src/${moduleDir}/build/index.es.js`,
     format: "es",
     sourcemap: true
   }
 ],
 external: ["react", "react-dom"],
 plugins: [
   external(),
   url(),
   json(),
   babel({
     exclude: "node_modules/**",
     presets: ["@babel/preset-react"],
     plugins: [
       "@babel/plugin-proposal-nullish-coalescing-operator"
     ],
     babelHelpers: "bundled"
   }),
   resolve({
     browser: true
   }),
   commonjs(),
   postcss({ plugins: [] })
 ]
});
 
export default commandLineArgs => {
 if (commandLineArgs.hasOwnProperty("package"))
   return [config(commandLineArgs.package)];
 return modules.map(m => config(m));
};