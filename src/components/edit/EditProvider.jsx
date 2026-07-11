// =============================================================================
// EditProvider — envuelve la app y aporta el modo "Editar textos".
// -----------------------------------------------------------------------------
// Todo lo interactivo (barra flotante, guardado, estilos) vive detrás de
// `import.meta.env.DEV`, así el build de producción no incluye nada de esto:
// los textos se renderizan planos (Vite elimina la rama muerta al buildear).
//
// Se monta en App.jsx envolviendo la app.
// =============================================================================

import { useCallback, useEffect, useState } from 'react'
import { EditContext } from './EditableText.jsx'

const SERVER = 'http://localhost:4101'
const IS_DEV = import.meta.env.DEV

export default function EditProvider({ children }) {
  if (!IS_DEV) return children
  return <DevEditProvider>{children}</DevEditProvider>
}

function DevEditProvider({ children }) {
  const [editing, setEditing] = useState(false)
  const [serverUp, setServerUp] = useState(false)
  const [toast, setToast] = useState(null)

  // Sonda: ¿está corriendo el servidor de guardado (npm run edit)?
  useEffect(() => {
    let alive = true
    const check = () =>
      fetch(`${SERVER}/ping`)
        .then((r) => alive && setServerUp(r.ok))
        .catch(() => alive && setServerUp(false))
    check()
    const id = setInterval(check, 5000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  const flash = useCallback((msg, ok) => {
    setToast({ msg, ok })
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  const save = useCallback(
    async (file, path, value) => {
      try {
        const r = await fetch(`${SERVER}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file, path, value }),
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok || !j.ok) throw new Error(j.error || 'error desconocido')
        flash('Guardado ✓', true)
        return true
      } catch (err) {
        const msg = err instanceof Error && err.message.includes('fetch')
          ? 'Servidor apagado — corre  npm run edit'
          : `No se pudo guardar: ${err instanceof Error ? err.message : err}`
        flash(msg, false)
        return false
      }
    },
    [flash]
  )

  return (
    <EditContext.Provider value={{ editing, serverUp, save }}>
      {children}
      <style>{TOOLBAR_CSS}</style>

      <div className="brunetti-edit-bar">
        <span
          className="brunetti-edit-dot"
          data-up={serverUp ? '1' : '0'}
          title={serverUp ? 'Servidor de guardado activo' : 'Servidor apagado — usa  npm run edit  para guardar'}
        />
        <button
          type="button"
          className="brunetti-edit-toggle"
          data-on={editing ? '1' : '0'}
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? '✓ Listo' : '✎ Editar textos'}
        </button>
      </div>

      {editing && (
        <div className="brunetti-edit-hint">
          Haz click en cualquier texto para editarlo · Enter guarda · Esc cancela
          {!serverUp && ' · ⚠ inicia  npm run edit  para que se guarde'}
        </div>
      )}

      {toast && (
        <div className="brunetti-edit-toast" data-ok={toast.ok ? '1' : '0'}>
          {toast.msg}
        </div>
      )}
    </EditContext.Provider>
  )
}

const TOOLBAR_CSS = `
.brunetti-edit-bar{position:fixed;right:16px;bottom:16px;z-index:99999;display:flex;align-items:center;gap:8px;background:#0b0b0c;border:1px solid rgba(255,255,255,.14);border-radius:9999px;padding:6px 8px 6px 12px;font-family:system-ui,sans-serif}
.brunetti-edit-dot{width:8px;height:8px;border-radius:9999px;background:#e0a33a}
.brunetti-edit-dot[data-up="1"]{background:#3fce7c}
.brunetti-edit-toggle{appearance:none;border:0;cursor:pointer;border-radius:9999px;padding:8px 16px;font-size:13px;font-weight:700;color:#fff;background:#c9a14e}
.brunetti-edit-toggle[data-on="1"]{background:#1f9d55}
.brunetti-edit-hint{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99999;background:#0b0b0c;color:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.14);border-radius:9999px;padding:8px 16px;font:500 12px system-ui,sans-serif}
.brunetti-edit-toast{position:fixed;right:16px;bottom:64px;z-index:99999;background:#0b0b0c;color:#fff;border:1px solid rgba(255,255,255,.14);border-left:3px solid #3fce7c;border-radius:8px;padding:10px 14px;font:600 13px system-ui,sans-serif;animation:brunettiToastIn .18s ease}
.brunetti-edit-toast[data-ok="0"]{border-left-color:#d4322c}
@keyframes brunettiToastIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.taag-editing{outline:1.5px dashed rgba(201,161,78,.55);outline-offset:3px;border-radius:2px;cursor:text;transition:outline-color .12s}
.taag-editing:hover{outline-color:#c9a14e}
.taag-editing:focus{outline:2px solid #c9a14e;background:rgba(201,161,78,.08)}
`
