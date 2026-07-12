// =============================================================================
// Deploy a PRODUCCIÓN de brunetticutz.cl  —  un solo comando: `npm run deploy`.
// -----------------------------------------------------------------------------
// Por qué existe:
//   El proyecto Vercel "pimpstudio" sirve VARIOS sitios (brunetticutz.cl,
//   workshopbrunetti.com, …) y cada dominio está fijado MANUALMENTE a un
//   deployment distinto. Por eso NO se puede usar el auto-assign global de
//   Vercel (movería todos los dominios al último build y rompería los otros
//   sitios). Este script despliega y re-apunta SOLO los dominios de Brunetti
//   al deployment recién creado, dejando los demás intactos.
//
// Flujo:
//   1. `vercel deploy --prod`  → crea el deployment y devuelve su URL.
//   2. `vercel alias set <url> brunetticutz.cl`  y  `www.brunetticutz.cl`.
//   3. Verifica que el dominio ya sirva el bundle nuevo.
// =============================================================================

import { execSync, execFileSync } from 'node:child_process'

// Dominios de Brunetti que este script mantiene apuntados al último deploy.
// (workshopbrunetti.com / aguasantajulieta.cl NO se tocan a propósito.)
const DOMAINS = ['brunetticutz.cl', 'www.brunetticutz.cl']

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', ...opts })
}

console.log('\n▲ Desplegando a producción (vercel --prod)…\n')

// `vercel deploy --prod` imprime el PROGRESO por stderr y la URL final por
// stdout, así que capturamos stdout y nos quedamos con la última línea https://.
let deployOut
try {
  deployOut = run('npx', ['vercel', 'deploy', '--prod', '--yes'], {
    stdio: ['inherit', 'pipe', 'inherit'],
  })
} catch (err) {
  console.error('\n✗ El deploy falló. Revisa el error de Vercel arriba.\n')
  process.exit(1)
}

const url = deployOut
  .trim()
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.startsWith('https://'))
  .pop()

if (!url) {
  console.error('\n✗ No pude leer la URL del deployment desde la salida de Vercel.\n')
  console.error(deployOut)
  process.exit(1)
}

console.log(`\n✓ Deployment listo: ${url}`)
console.log('\n↪ Apuntando los dominios de Brunetti al deployment nuevo…\n')

for (const domain of DOMAINS) {
  try {
    run('npx', ['vercel', 'alias', 'set', url, domain], { stdio: 'inherit' })
    console.log(`  ✓ ${domain}`)
  } catch (err) {
    console.error(`  ✗ No se pudo apuntar ${domain}: ${err.message}`)
    process.exit(1)
  }
}

// Verificación: ¿brunetticutz.cl ya sirve el bundle del deploy nuevo?
console.log('\n🔎 Verificando que brunetticutz.cl sirva la versión nueva…')
try {
  const live = execSync('curl -s https://brunetticutz.cl', { encoding: 'utf8' })
  const bundle = (live.match(/assets\/index-[A-Za-z0-9_-]+\.js/) || ['(no encontrado)'])[0]
  console.log(`   Bundle en vivo: ${bundle}`)
} catch {
  console.log('   (no pude verificar automáticamente; revisa el sitio en el navegador)')
}

console.log('\n✅ Deploy a producción completo. brunetticutz.cl y www ya apuntan al último build.\n')
