import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["./index.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    minify: true,
    minifySyntax: true,
    minifyWhitespace: true,
    format: "esm",
    outfile: "./dist/index.js",
    banner: {
      js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
    },
  })
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
