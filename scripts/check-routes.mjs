import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "../src/app");

console.log("🔍 Checking Next.js route segments for loading and error coverage...\n");

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = walkDir(appDir);
const pageFiles = allFiles.filter((f) => path.basename(f).startsWith("page."));

let missingLoading = [];
let missingError = [];

console.log(`Found ${pageFiles.length} routed pages in src/app\n`);

pageFiles.forEach((pagePath) => {
  const dir = path.dirname(pagePath);
  const relDir = path.relative(appDir, dir);

  // Skip api routes or dev routes
  if (relDir.startsWith("api") || relDir.startsWith("dev")) {
    return;
  }

  // Check if loading.tsx exists in this dir or parent hierarchy up to root
  let curr = dir;
  let hasLoading = false;
  let hasError = false;

  while (curr.startsWith(appDir)) {
    if (
      fs.existsSync(path.join(curr, "loading.tsx")) ||
      fs.existsSync(path.join(curr, "loading.jsx"))
    ) {
      hasLoading = true;
    }
    if (
      fs.existsSync(path.join(curr, "error.tsx")) ||
      fs.existsSync(path.join(curr, "error.jsx")) ||
      fs.existsSync(path.join(curr, "global-error.tsx"))
    ) {
      hasError = true;
    }
    curr = path.dirname(curr);
  }

  if (!hasLoading) {
    missingLoading.push(relDir || "/");
  }
  if (!hasError) {
    missingError.push(relDir || "/");
  }
});

console.log("--- Route Boundaries Check ---");
console.log(`Pages evaluated: ${pageFiles.length}`);
console.log(`Pages covered with loading boundary: ${pageFiles.length - missingLoading.length}`);
console.log(`Pages covered with error boundary: ${pageFiles.length - missingError.length}\n`);

if (missingLoading.length > 0) {
  console.warn("⚠️ Routes without loading fallback:", missingLoading);
}

if (missingError.length > 0) {
  console.error("❌ Routes without error fallback:", missingError);
  process.exit(1);
} else {
  console.log("✅ All routed sections have active error boundaries!");
}
