// =============================================================================
// OverridesProvider — capa de layout/estilo del editor visual. SIEMPRE activa.
// -----------------------------------------------------------------------------
// Carga los overrides por página (src/data/overrides/*.json) de forma ESTÁTICA,
// así entran al build de producción igual que el contenido de texto. Cada
// `Editable` lee su override por `editId` desde este contexto y lo aplica como
// estilo inline (transform, font-size, width/height, position absoluta, src…).
//
// En modo edición además guarda cambios contra el servidor local (:4101) y
// mantiene un estado "en vivo" para feedback inmediato mientras arrastras, sin
// esperar al HMR.
// =============================================================================

import { useCallback, useMemo, useState } from 'react'
import { OverridesContext } from './context.js'

const SERVER = 'http://localhost:4101'

// Carga estática de TODOS los overrides. Vite inlinea estos JSON en el bundle
// (dev y prod) y los vigila para HMR. Si la carpeta está vacía → {}.
const MODULES = import.meta.glob('../../data/overrides/*.json', { eager: true })

function loadFileOverrides() {
  const out = {}
  for (const mod of Object.values(MODULES)) {
    Object.assign(out, mod.default || mod)
  }
  return out
}

export default function OverridesProvider({ children }) {
  // Overrides venidos de los JSON (fuente de verdad persistida).
  const fileOverrides = useMemo(loadFileOverrides, [])
  // Cambios de la sesión de edición en curso (feedback inmediato antes del HMR).
  const [live, setLive] = useState({})

  // Mapa final = archivo ⊕ vivo. Nueva referencia cuando `live` cambia para que
  // los Editable afectados re-rendericen.
  const overrides = useMemo(() => {
    if (!Object.keys(live).length) return fileOverrides
    const merged = { ...fileOverrides }
    for (const [id, patch] of Object.entries(live)) {
      merged[id] = { ...(merged[id] || {}), ...patch }
    }
    return merged
  }, [fileOverrides, live])

  // Aplica un patch a un elemento: actualiza el estado vivo (instantáneo) y,
  // salvo persist:false, lo guarda en el servidor. Claves con null se borran.
  const setOverride = useCallback(async (editId, patch, { persist = true } = {}) => {
    setLive((prev) => {
      const next = { ...(prev[editId] || {}) }
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === undefined) delete next[k]
        else next[k] = v
      }
      return { ...prev, [editId]: next }
    })
    if (!persist) return true
    try {
      const r = await fetch(`${SERVER}/save-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editId, patch }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.ok) throw new Error(j.error || 'error desconocido')
      return true
    } catch {
      return false
    }
  }, [])

  const uploadImage = useCallback(async (name, dataBase64) => {
    try {
      const r = await fetch(`${SERVER}/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dataBase64 }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.ok) throw new Error(j.error || 'no se pudo subir')
      return { ok: true, url: j.url }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }, [])

  const listAssets = useCallback(async () => {
    try {
      const r = await fetch(`${SERVER}/list-assets`)
      const j = await r.json().catch(() => ({}))
      return j.ok ? j.assets : []
    } catch {
      return []
    }
  }, [])

  const value = useMemo(
    () => ({ overrides, setOverride, uploadImage, listAssets }),
    [overrides, setOverride, uploadImage, listAssets]
  )

  return <OverridesContext.Provider value={value}>{children}</OverridesContext.Provider>
}
