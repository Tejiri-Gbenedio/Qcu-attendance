import { readFileSync } from "fs";
const ts = require("typescript");

const files = [
  "lib/google-sheets.ts",
  "app/api/admin/cleanup/route.ts",
];

for (const f of files) {
  try {
    const src = readFileSync(f, "utf-8");
    ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, strict: true, noEmit: true },
    });
    console.log("[OK] " + f);
  } catch (e) {
    console.log("[FAIL] " + f + ": " + e.message);
  }
}
