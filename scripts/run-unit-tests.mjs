import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outDir = path.join(root, ".tmp-tests");

fs.rmSync(outDir, { recursive: true, force: true });

execFileSync("pnpm -s exec tsc -p tsconfig.tests.json --outDir .tmp-tests", {
    stdio: "inherit",
    shell: true,
});

await import(pathToFileURL(path.join(outDir, "tests", "swap-utils.test.js")).href);
await import(pathToFileURL(path.join(outDir, "tests", "history-utils.test.js")).href);

fs.rmSync(outDir, { recursive: true, force: true });
console.log("unit tests passed");
