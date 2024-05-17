import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import image from "@rollup/plugin-image";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import sass from "rollup-plugin-sass";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        dir: "lib/cjs",
        format: "cjs",
        sourcemap: false,
      },
      {
        dir: "lib/esm",
        format: "esm",
        sourcemap: false,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs({
        // ignore: ["pino-pretty"],
      }),
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      image(),
      json(),
      terser(),
      sass(),
    ],
  },
  {
    input: "src/index.ts",
    output: [{ file: "lib/types.d.ts", format: "es" }],
    plugins: [dts()],
    external: [/\.scss$/],
  },
];
