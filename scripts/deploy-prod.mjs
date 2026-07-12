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

// `vercel deploy --prod` imprime el progreso por stderr y termina con un
// bloque JSON por stdout (`{ status, deployment: { url, target, ... } }`).
// Parseamos ESE json en vez de buscar líneas "https://" sueltas: el formato
// de texto plano de la CLI ha cambiado más de una vez (labels antes de la
// URL, nueva CLI embebida durante el build, etc.) y romper el matching de
// líneas nos ha dejado con el deploy hecho pero el dominio sin re-apuntar.
let deployOut
try {
  deployOut = run('npx', ['vercel', 'deploy', '--prod', '--yes'], {
    stdio: ['inherit', 'pipe', 'inherit'],
  })
} catch (err) {
  console.error('\n✗ El deploy falló. Revisa el error de Vercel arriba.\n')
  process.exit(1)
}

let url
const jsonMatch = deployOut.match(/\{[\s\S]*\}/)
if (jsonMatch) {
  try {
    const parsed = JSON.parse(jsonMatch[0])
    if (parsed.deployment?.target !== 'production') {
      console.error(`\n✗ El deployment no quedó como "production" (target: ${parsed.deployment?.target}).\n`)
      process.exit(1)
    }
    url = parsed.deployment?.url
  } catch {
    // cae al fallback de abajo
  }
}
if (!url) {
  // Fallback: cualquier URL *.vercel.app del deployment (no del inspector ni del alias corto),
  // buscada como substring en vez de exigir que la línea completa empiece con "https://".
  const matches = [...deployOut.matchAll(/https:\/\/[a-z0-9.-]+\.vercel\.app/gi)]
  url = matches.map((m) => m[0]).find((u) => !u.includes('vercel.com'))
}

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
