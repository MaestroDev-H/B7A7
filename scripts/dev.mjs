import { spawn } from "node:child_process";
import path from "node:path";

// Start redirect-5000 helper server
const redirectProcess = spawn("node", ["scripts/redirect-5000.mjs"], {
  stdio: "inherit",
  shell: true,
});

// Start Next.js dev server
const nextProcess = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  redirectProcess.kill();
  nextProcess.kill();
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
