// =============================================================================
// Lanza a la vez el servidor de Vite (npm run dev) y el servidor de guardado
// del editor de textos. Úsalo con `npm run edit` cuando quieras editar los
// textos del sitio público desde el navegador. Cero dependencias (node:child_process).
//
// Ctrl+C detiene ambos.
// =============================================================================

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";

function run(cmd, args, useShell) {
  return spawn(cmd, args, {
    cwd: ROOT,
    stdio: "inherit",
    // `shell` solo para npm (.cmd en Windows). Para el binario node NO usamos
    // shell: con shell:true la ruta de node.exe (que puede tener espacios) se
    // concatena sin escapar y rompe el arranque.
    shell: useShell,
  });
}

// Servidor de guardado del editor (binario node directo, sin shell).
const editor = run(process.execPath, [join(ROOT, "scripts", "content-server.mjs")], false);

// Vite en modo desarrollo (npm es .cmd en Windows → shell).
const vite = run("npm", ["run", "dev"], isWin);

let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  for (const p of [editor, vite]) {
    if (p && !p.killed) p.kill();
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
vite.on("exit", shutdown);
editor.on("exit", (code) => {
  if (!closing) console.error(`\n  ⚠ El editor de textos se cerró (código ${code}).`);
});
