// =============================================================================
// beginDrag — helper de arrastre con pointer events para el editor visual.
// -----------------------------------------------------------------------------
// Llama a onMove(dx, dy) mientras se arrastra y onEnd(dx, dy) al soltar, con los
// deltas acumulados desde el punto donde empezó. Se usa tanto para MOVER (grip)
// como para REDIMENSIONAR (handles de esquina). Cero dependencias.
// =============================================================================

export function beginDrag(e, { onMove, onEnd } = {}) {
  e.preventDefault()
  e.stopPropagation()
  const startX = e.clientX
  const startY = e.clientY

  const move = (ev) => {
    if (onMove) onMove(ev.clientX - startX, ev.clientY - startY, ev)
  }
  const up = (ev) => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    document.body.style.userSelect = ''
    if (onEnd) onEnd(ev.clientX - startX, ev.clientY - startY, ev)
  }

  document.body.style.userSelect = 'none'
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}
