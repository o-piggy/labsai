import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const src = path.join(
  root,
  "node_modules",
  "pdfjs-dist",
  "legacy",
  "build",
  "pdf.worker.mjs"
);

const dstDir = path.join(root, ".next", "server", "chunks");
const dst = path.join(dstDir, "pdf.worker.mjs");

if (!fs.existsSync(src)) {
  console.warn(`[postbuild] pdfjs worker not found at ${src}`);
  process.exit(0);
}

fs.mkdirSync(dstDir, { recursive: true });
fs.copyFileSync(src, dst);
console.log(`[postbuild] copied pdfjs worker to ${dst}`);

