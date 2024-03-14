import esbuild from "esbuild";
import logger from "@dc-lib/logger";

logger.info("Building tokenizer...");

try {
  esbuild.buildSync({
    entryPoints: ["./index.ts"],
    bundle: true,
    minify: process.env.NODE_ENV === "production",
    minifySyntax: process.env.NODE_ENV === "production",
    minifyWhitespace: process.env.NODE_ENV === "production",
    platform: "node",
    target: "node20",
    format: "esm",
    outfile: "./dist/index.js",
  });
  logger.info("Tokenizer built successfully");
} catch (e) {
  logger.error(e);
  process.exit(1);
}
