import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

// Measure shipped files, including their source-map comments. No runtime dependencies.
const root = new URL("../", import.meta.url);
for (const directory of ["dist", "packages/return-fetch-json/dist"]) {
  for (const file of ["index.js", "index.cjs", "index.umd.js"]) {
    const path = `${directory}/${file}`;
    const source = readFileSync(new URL(path, root));
    const gzip = gzipSync(source, { level: 9 }).length;
    console.log(
      `${path}: ${source.length} bytes, ${gzip} bytes gzip (limit: < 900)`,
    );
    if (gzip >= 900) process.exitCode = 1;
  }
}
