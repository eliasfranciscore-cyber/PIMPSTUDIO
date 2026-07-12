// =============================================================================
// EditProvider — modo "Editar" del sitio (solo desarrollo).
// -----------------------------------------------------------------------------
// Aporta la barra flotante, la selección de elementos y el Inspector con
// herramientas (Mover · Fuente · Imagen). Todo lo interactivo vive detrás de
// `import.meta.env.DEV`, así el build de producción no incluye nada: los
// overrides sí se aplican (OverridesProvider), pero la UI de edición desaparece.
//
// Depende de OverridesProvider (debe envolverlo en App.jsx) para leer/guardar
// los overrides y subir imágenes.
// =============================================================================

import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { EditingContext, OverridesContext } from './context.js'
import { beginDrag } from './useDragResize.js'

const SERVER = 'http://localhost:4101'
const IS_DEV = import.meta.env.DEV

export default function EditProvider({ children }) {
  if (!IS_DEV) return children
  return <DevEditProvider>{children}</DevEditProvider>
}

function DevEditProvider({ children }) {
  const { overrides, setOverride, uploadImage, listAssets } = useContext(OverridesContext)

  const [editing, setEditing] = useState(false)
  const [serverUp, setServerUp] = useState(false)
  const [toast, setToast] = useState(null)

  const [selectedId, setSelectedId] = useState(null)
  const [selKind, setSelKind] = useState(null)     // 'img' | 'text'
  const [rect, setRect] = useState(null)
  const selRef = useRef(null)

  // Sonda: ¿está corriendo el servidor de guardado (npm run edit)?
  useEffect(() => {
    let alive = true
    const check = () =>
      fetch(`${SERVER}/ping`)
        .then((r) => alive && setServerUp(r.ok))
        .catch(() => alive && setServerUp(false))
    check()
    const id = setInterval(check, 5000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  const flash = useCallback((msg, ok) => {
    setToast({ msg, ok })
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  // Guarda un override y avisa por toast según resultado.
  const commitOverride = useCallback(
    (id, patch, opts) => {
      const r = setOverride(id, patch, opts)
      if (opts && opts.persist === false) return r
      Promise.resolve(r).then((ok) =>
        flash(ok ? 'Guardado ✓' : 'Servidor apagado — corre  npm run edit', ok)
      )
      return r
    },
    [setOverride, flash]
  )

  // Guardado de texto (contenido) — reutiliza el endpoint /save de siempre.
  const saveText = useCallback(
    async (file, path, value) => {
      try {
        const r = await fetch(`${SERVER}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file, path, value }),
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok || !j.ok) throw new Error(j.error || 'error')
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

  const measure = useCallback(() => {
    const el = selRef.current
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    setRect({ left: r.left, top: r.top, width: r.width, height: r.height })
  }, [])

  const select = useCallback((id, el) => {
    selRef.current = el
    setSelectedId(id)
    setSelKind(el && el.tagName === 'IMG' ? 'img' : 'text')
    requestAnimationFrame(measure)
  }, [measure])

  const clearSelection = useCallback(() => {
    selRef.current = null
    setSelectedId(null)
    setSelKind(null)
    setRect(null)
  }, [])

  // Re-medir en scroll/resize mientras hay selección.
  useEffect(() => {
    if (!selectedId) return
    measure()
    const on = () => measure()
    window.addEventListener('scroll', on, true)
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on, true)
      window.removeEventListener('resize', on)
    }
  }, [selectedId, measure])

  // Esc cierra la selección (salvo que estés escribiendo texto).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !document.activeElement?.isContentEditable) clearSelection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearSelection])

  // Al salir del modo edición, limpiar selección.
  useEffect(() => { if (!editing) clearSelection() }, [editing, clearSelection])

  const ctx = { editing, serverUp, selectedId, select, clearSelection, saveText }
  const ov = selectedId ? overrides[selectedId] || {} : {}

  // --- Arrastre del grip (mover) ---------------------------------------------
  const onGripDown = (e) => {
    if (!selectedId) return
    const cur = overrides[selectedId] || {}
    const abs = cur.absolute
    const base = abs
      ? { x: abs.x, y: abs.y, key: 'absolute' }
      : { x: cur.offset?.x || 0, y: cur.offset?.y || 0, key: 'offset' }
    const patchAt = (dx, dy) => ({ [base.key]: { x: Math.round(base.x + dx), y: Math.round(base.y + dy) } })
    beginDrag(e, {
      onMove: (dx, dy) => { setOverride(selectedId, patchAt(dx, dy), { persist: false }); requestAnimationFrame(measure) },
      onEnd: (dx, dy) => { commitOverride(selectedId, patchAt(dx, dy)); requestAnimationFrame(measure) },
    })
  }

  // --- Arrastre del handle inferior-derecho (redimensionar imagen) -----------
  const onResizeDown = (e) => {
    const el = selRef.current
    if (!el || !selectedId) return
    const cur = overrides[selectedId] || {}
    const baseW = cur.width ?? el.getBoundingClientRect().width
    const hasH = cur.height != null
    const aspect = el.naturalWidth && el.naturalHeight ? el.naturalHeight / el.naturalWidth : null
    const patchAt = (dx) => {
      const w = Math.max(24, Math.round(baseW + dx))
      const p = { width: w }
      if (hasH && aspect) p.height = Math.round(w * aspect)
      return p
    }
    beginDrag(e, {
      onMove: (dx) => { setOverride(selectedId, patchAt(dx), { persist: false }); requestAnimationFrame(measure) },
      onEnd: (dx) => { commitOverride(selectedId, patchAt(dx)); requestAnimationFrame(measure) },
    })
  }

  return (
    <EditingContext.Provider value={ctx}>
      {children}
      <style>{EDITOR_CSS}</style>

      {/* Barra flotante */}
      <div className="tv-bar">
        <span className="tv-dot" data-up={serverUp ? '1' : '0'}
          title={serverUp ? 'Servidor de guardado activo' : 'Servidor apagado — usa  npm run edit'} />
        <button type="button" className="tv-toggle" data-on={editing ? '1' : '0'}
          onClick={() => setEditing((v) => !v)}>
          {editing ? '✓ Listo' : '✎ Editar'}
        </button>
      </div>

      {editing && !selectedId && (
        <div className="tv-hint">
          Haz click en cualquier texto o imagen para seleccionarlo
          {!serverUp && ' · ⚠ inicia  npm run edit  para guardar'}
        </div>
      )}

      {/* Overlay de selección: caja + grip + handle de resize */}
      {editing && selectedId && rect && (
        <div className="tv-ovl" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
          <button className="tv-grip" title="Arrastra para mover" onPointerDown={onGripDown}>✥</button>
          {selKind === 'img' && (
            <button className="tv-handle" title="Arrastra para redimensionar" onPointerDown={onResizeDown} />
          )}
        </div>
      )}

      {/* Inspector de herramientas */}
      {editing && selectedId && (
        <Inspector
          id={selectedId}
          kind={selKind}
          rect={rect}
          ov={ov}
          el={selRef.current}
          commitOverride={commitOverride}
          setOverride={setOverride}
          uploadImage={uploadImage}
          listAssets={listAssets}
          onClose={clearSelection}
          flash={flash}
        />
      )}

      {toast && <div className="tv-toast" data-ok={toast.ok ? '1' : '0'}>{toast.msg}</div>}
    </EditingContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Inspector — panel flotante con las herramientas del elemento seleccionado.
// ---------------------------------------------------------------------------
function Inspector({ id, kind, rect, ov, el, commitOverride, setOverride, uploadImage, listAssets, onClose, flash }) {
  const [tab, setTab] = useState(kind === 'img' ? 'imagen' : 'mover')
  const [assets, setAssets] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => { setTab(kind === 'img' ? 'imagen' : 'mover') }, [id, kind])

  // El panel vive SIEMPRE anclado al botón "Editar" (abajo-derecha), nunca
  // encima del elemento, para no tapar el texto que estás editando.
  const style = { right: 16, bottom: 72, width: 260, maxHeight: '72vh', overflowY: 'auto' }

  const STEP = 6 // px por click en las flechas (visible, no 1px)
  const offX = ov.absolute ? ov.absolute.x : ov.offset?.x || 0
  const offY = ov.absolute ? ov.absolute.y : ov.offset?.y || 0
  const posKey = ov.absolute ? 'absolute' : 'offset'
  const setPos = (nx, ny) => commitOverride(id, { [posKey]: { x: Math.round(nx), y: Math.round(ny) } })

  const rgbToHex = (rgb) => {
    const m = rgb && rgb.match(/\d+/g)
    if (!m) return '#ffffff'
    return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('')
  }
  const fontBase = el ? Math.round(parseFloat(getComputedStyle(el).fontSize)) : 16
  const fontVal = ov.fontSize ?? fontBase
  const colorVal = ov.color || (el ? rgbToHex(getComputedStyle(el).color) : '#ffffff')

  const widthBase = el ? Math.round(el.getBoundingClientRect().width) : 0
  const widthVal = ov.width ?? widthBase

  const toggleAnchor = () => {
    if (ov.absolute) {
      commitOverride(id, { absolute: null }) // vuelve a offset (que se conserva)
    } else {
      // Desanclar: fija posición absoluta ~ donde está ahora (offsetLeft/Top + translate actual).
      const ax = (el?.offsetLeft || 0) + (ov.offset?.x || 0)
      const ay = (el?.offsetTop || 0) + (ov.offset?.y || 0)
      commitOverride(id, { absolute: { x: Math.round(ax), y: Math.round(ay) }, offset: null })
    }
  }

  const resetAll = () =>
    commitOverride(id, { offset: null, absolute: null, fontSize: null, width: null, height: null, src: null, align: null })

  const onPickFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const dataUrl = await new Promise((res) => { const rd = new FileReader(); rd.onload = () => res(rd.result); rd.readAsDataURL(f) })
    const up = await uploadImage(f.name, dataUrl)
    if (up.ok) commitOverride(id, { src: up.url })
    else flash(up.error || 'No se pudo subir', false)
    e.target.value = ''
  }

  const openExisting = async () => {
    if (assets == null) setAssets(await listAssets())
    else setAssets(null)
  }

  return (
    <div className="tv-insp" style={style} onPointerDown={(e) => e.stopPropagation()}>
      <div className="tv-insp-head">
        <span className="tv-insp-id" title={id}>{id}</span>
        <button className="tv-x" onClick={onClose} title="Cerrar (Esc)">✕</button>
      </div>

      <div className="tv-tabs">
        <button data-on={tab === 'mover' ? '1' : '0'} onClick={() => setTab('mover')}>Mover</button>
        {kind !== 'img' && <button data-on={tab === 'fuente' ? '1' : '0'} onClick={() => setTab('fuente')}>Fuente</button>}
        {kind === 'img' && <button data-on={tab === 'imagen' ? '1' : '0'} onClick={() => setTab('imagen')}>Imagen</button>}
      </div>

      {tab === 'mover' && (
        <div className="tv-pane">
          <div className="tv-nudge">
            <button onClick={() => setPos(offX, offY - STEP)} style={{ gridArea: 'u' }}>↑</button>
            <button onClick={() => setPos(offX - STEP, offY)} style={{ gridArea: 'l' }}>←</button>
            <button onClick={() => setPos(offX + STEP, offY)} style={{ gridArea: 'r' }}>→</button>
            <button onClick={() => setPos(offX, offY + STEP)} style={{ gridArea: 'd' }}>↓</button>
          </div>
          <label className="tv-row">X<input type="number" value={offX} onChange={(e) => setPos(+e.target.value, offY)} /></label>
          <label className="tv-row">Y<input type="number" value={offY} onChange={(e) => setPos(offX, +e.target.value)} /></label>
          <button className="tv-link" onClick={toggleAnchor}>
            {ov.absolute ? '⚓ Volver a posición normal' : '⤢ Desanclar (posición libre)'}
          </button>
        </div>
      )}

      {tab === 'fuente' && kind !== 'img' && (
        <div className="tv-pane">
          <label className="tv-row">Tamaño
            <input type="number" value={fontVal} min={8} max={160}
              onChange={(e) => commitOverride(id, { fontSize: +e.target.value })} />
          </label>
          <input type="range" min={8} max={120} value={fontVal}
            onInput={(e) => setOverride(id, { fontSize: +e.target.value }, { persist: false })}
            onChange={(e) => commitOverride(id, { fontSize: +e.target.value })} />
          <div className="tv-align">
            {['left', 'center', 'right'].map((a) => (
              <button key={a} data-on={ov.align === a ? '1' : '0'}
                onClick={() => commitOverride(id, { align: ov.align === a ? null : a })}>
                {a === 'left' ? '⇤' : a === 'center' ? '↔' : '⇥'}
              </button>
            ))}
          </div>
          <label className="tv-row">Color
            <span className="tv-color">
              <input type="color" value={colorVal}
                onInput={(e) => setOverride(id, { color: e.target.value }, { persist: false })}
                onChange={(e) => commitOverride(id, { color: e.target.value })} />
            </span>
          </label>
          <div className="tv-swatches">
            {['#ffffff', '#c9a14e', '#111111', '#d4322c', '#3fce7c', '#5a8dee'].map((c) => (
              <button key={c} className="tv-sw" style={{ background: c }} title={c}
                onClick={() => commitOverride(id, { color: c })} />
            ))}
          </div>
          <button className="tv-link" onClick={() => commitOverride(id, { fontSize: null, color: null })}>Restablecer tamaño y color</button>
        </div>
      )}

      {tab === 'imagen' && kind === 'img' && (
        <div className="tv-pane">
          <label className="tv-row">Ancho<input type="number" value={widthVal}
            onChange={(e) => commitOverride(id, { width: +e.target.value })} /></label>
          <label className="tv-row">Alto<input type="number" placeholder="auto" value={ov.height ?? ''}
            onChange={(e) => commitOverride(id, { height: e.target.value === '' ? null : +e.target.value })} /></label>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
          <button className="tv-btn" onClick={() => fileRef.current?.click()}>⬆ Subir imagen nueva</button>
          <button className="tv-btn" onClick={openExisting}>🖼 {assets ? 'Ocultar' : 'Elegir existente'}</button>
          {assets && (
            <div className="tv-assets">
              {assets.map((a) => (
                <button key={a} className="tv-asset" title={a} onClick={() => commitOverride(id, { src: a })}>
                  <img src={a} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          {ov.src && <button className="tv-link" onClick={() => commitOverride(id, { src: null })}>Restablecer imagen</button>}
        </div>
      )}

      <button className="tv-reset" onClick={resetAll}>↺ Restablecer todo</button>
    </div>
  )
}

const EDITOR_CSS = `
.tv-bar{position:fixed;right:16px;bottom:16px;z-index:99999;display:flex;align-items:center;gap:8px;background:#0b0b0c;border:1px solid rgba(255,255,255,.14);border-radius:9999px;padding:6px 8px 6px 12px;font-family:system-ui,sans-serif}
.tv-dot{width:8px;height:8px;border-radius:9999px;background:#e0a33a}
.tv-dot[data-up="1"]{background:#3fce7c}
.tv-toggle{appearance:none;border:0;cursor:pointer;border-radius:9999px;padding:8px 16px;font-size:13px;font-weight:700;color:#fff;background:#c9a14e}
.tv-toggle[data-on="1"]{background:#1f9d55}
.tv-hint{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99999;background:#0b0b0c;color:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.14);border-radius:9999px;padding:8px 16px;font:500 12px system-ui,sans-serif}
.tv-toast{position:fixed;right:16px;bottom:64px;z-index:100000;background:#0b0b0c;color:#fff;border:1px solid rgba(255,255,255,.14);border-left:3px solid #3fce7c;border-radius:8px;padding:10px 14px;font:600 13px system-ui,sans-serif;animation:tvIn .18s ease}
.tv-toast[data-ok="0"]{border-left-color:#d4322c}
@keyframes tvIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

/* Elementos editables */
.taag-editable{outline:1.5px dashed rgba(201,161,78,.5);outline-offset:3px;border-radius:2px;cursor:pointer;transition:outline-color .12s}
.taag-editable:hover{outline-color:#c9a14e}
.taag-selected{outline:2px solid #c9a14e !important;outline-offset:3px}

/* Overlay de selección */
.tv-ovl{position:fixed;z-index:99997;pointer-events:none;border:0}
.tv-grip{position:absolute;left:-14px;top:-14px;width:26px;height:26px;border-radius:9999px;border:2px solid #fff;background:#c9a14e;color:#111;font-size:13px;line-height:1;cursor:grab;pointer-events:auto;box-shadow:0 2px 6px rgba(0,0,0,.35)}
.tv-grip:active{cursor:grabbing}
.tv-handle{position:absolute;right:-8px;bottom:-8px;width:16px;height:16px;border-radius:3px;border:2px solid #fff;background:#1f9d55;cursor:nwse-resize;pointer-events:auto;box-shadow:0 2px 6px rgba(0,0,0,.35)}

/* Inspector */
.tv-insp{position:fixed;z-index:99998;background:#141416;color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px;font-family:system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.5)}
.tv-insp-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.tv-insp-id{font:600 11px ui-monospace,monospace;color:#c9a14e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}
.tv-x{appearance:none;border:0;background:transparent;color:rgba(255,255,255,.6);cursor:pointer;font-size:14px}
.tv-tabs{display:flex;gap:4px;margin-bottom:8px}
.tv-tabs button{flex:1;appearance:none;border:1px solid rgba(255,255,255,.12);background:#1d1d20;color:#fff;border-radius:8px;padding:6px;font-size:12px;font-weight:600;cursor:pointer}
.tv-tabs button[data-on="1"]{background:#c9a14e;color:#111;border-color:#c9a14e}
.tv-pane{display:flex;flex-direction:column;gap:8px}
.tv-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:rgba(255,255,255,.8)}
.tv-row input{width:96px;background:#0c0c0e;border:1px solid rgba(255,255,255,.14);border-radius:6px;color:#fff;padding:5px 8px;font-size:12px}
.tv-insp input[type=range]{width:100%;accent-color:#c9a14e}
.tv-nudge{display:grid;grid-template-columns:repeat(3,1fr);grid-template-areas:". u ." "l . r" ". d .";gap:3px;width:96px;margin:0 auto}
.tv-nudge button{appearance:none;border:1px solid rgba(255,255,255,.14);background:#1d1d20;color:#fff;border-radius:6px;padding:4px;cursor:pointer;font-size:12px}
.tv-align{display:flex;gap:4px}
.tv-align button{flex:1;appearance:none;border:1px solid rgba(255,255,255,.14);background:#1d1d20;color:#fff;border-radius:6px;padding:5px;cursor:pointer}
.tv-align button[data-on="1"]{background:#c9a14e;color:#111}
.tv-color{display:inline-flex}
.tv-color input[type=color]{width:96px;height:28px;padding:0;border:1px solid rgba(255,255,255,.14);border-radius:6px;background:#0c0c0e;cursor:pointer}
.tv-swatches{display:flex;gap:6px}
.tv-sw{flex:1;height:22px;border:1px solid rgba(255,255,255,.2);border-radius:5px;cursor:pointer;padding:0}
.tv-sw:hover{outline:2px solid #c9a14e;outline-offset:1px}
.tv-btn{appearance:none;border:1px solid rgba(255,255,255,.14);background:#1d1d20;color:#fff;border-radius:8px;padding:8px;font-size:12px;font-weight:600;cursor:pointer}
.tv-btn:hover{border-color:#c9a14e}
.tv-link{appearance:none;border:0;background:transparent;color:#c9a14e;font-size:12px;cursor:pointer;text-align:left;padding:2px 0}
.tv-assets{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;max-height:150px;overflow:auto;padding:2px}
.tv-asset{padding:0;border:1px solid rgba(255,255,255,.14);border-radius:6px;overflow:hidden;cursor:pointer;background:#0c0c0e;aspect-ratio:1}
.tv-asset img{width:100%;height:100%;object-fit:cover;display:block}
.tv-asset:hover{border-color:#c9a14e}
.tv-reset{margin-top:9px;width:100%;appearance:none;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.55);border-radius:8px;padding:6px;font-size:11px;cursor:pointer}
.tv-reset:hover{color:#d4322c;border-color:rgba(212,50,44,.5)}
`
