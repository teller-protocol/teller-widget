/**
 * Bundles the widgets library, which is released independently of the interface application.
 * This library lives in src/lib, but shares code with the interface application.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const peerDepsExternal = require("rollup-plugin-peer-deps-external");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const { default: dts } = require("rollup-plugin-dts");
const image = require("@rollup/plugin-image");
const json = require("@rollup/plugin-json");
const terser = require("@rollup/plugin-terser");
const sass = require("rollup-plugin-sass");

const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

/**
 * This exports scheme works for nextjs and for CRA5.
 *
 * It will also work for CRA4 if you use direct imports:
 *   instead of `import { SwapWidget } from '@uniswap/widgets'`,
 *              `import { SwapWidget } from '@uniswap/widgets/dist/index.js'`.
 * I do not know why CRA4 does not seem to use exports for resolution.
 *
 * Note that chunks are enabled. This is so the tokenlist spec can be loaded async,
 * to improve first load time (due to ajv). Locales are also in separate chunks.
 *
 * Lastly, note that JSON and lingui are bundled into the library, as neither are fully
 * supported/compatible with ES Modules. Both _could_ be bundled only with esm, but this
 * yields a less complex pipeline.
 */
const transpile = {
  input: "src/index.ts",
  plugins: [
    // Dependency resolution
    // externals({
    //   exclude: [
    //     "constants",
    //     /@lingui\/(core|react)/, // @lingui incorrectly exports esm, so it must be bundled in
    //     /\.json$/, // esm does not support JSON loading, so it must be bundled in
    //   ], // marks dependencies as external so they are not bundled inline
    //   deps: true,
    //   peerDeps: true,
    // }),
    resolve({ extensions: EXTENSIONS }), // resolves third-party modules within node_modules/

    // Source code transformation
    json(), // imports json as ES6; doing so enables module resolution
    sass(), // generates fonts.css
    commonjs(), // transforms cjs dependencies into tree-shakeable ES modules
    typescript({ tsconfig: "./tsconfig.json" }), // transpiles TypeScript into JavaScript
    image(), // imports images as ES6; doing so enables module resolution
  ],
};

const esm = {
  ...transpile,
  output: {
    dir: "lib",
    format: "esm",
    sourcemap: false,
  },
};

const cjs = {
  ...transpile,
  output: {
    dir: "lib/cjs",
    entryFileNames: "[name].cjs",
    chunkFileNames: "[name]-[hash].cjs",
    format: "cjs",
    sourcemap: false,
  },
  watch: false,
};

const types = {
  input: "src/index.ts",
  output: { file: "lib/index.d.ts" },
  external: (source) =>
    source.endsWith(".scss") || source.endsWith("/external.d.ts"),
  plugins: [dts({ compilerOptions: { baseUrl: "dts" } })],
  watch: false,
};

const config = [esm, cjs, types];
config.config = { ...esm, output: { ...esm.output, sourcemap: true } };
module.exports = config;
