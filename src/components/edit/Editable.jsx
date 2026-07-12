// =============================================================================
// Editable — primitivo único del editor visual (texto, imagen o caja).
// -----------------------------------------------------------------------------
//   • SIEMPRE aplica su override (posición/tamaño/fuente/src) desde
//     OverridesContext, así el resultado se ve en dev y en producción.
//   • En modo edición (dev): al hacer click se SELECCIONA (el overlay con grip y
//     handles lo dibuja EditProvider). Si es texto y está seleccionado, se puede
//     escribir in-situ y guarda el string a src/data/content.
//
// Uso:
//   <Editable file="home-hero" path="kicker">{HERO.kicker}</Editable>   // texto
//   <Editable editId="home:heroImg" as="img" src="/assets/x.jpg" alt=""/>  // imagen
//
// `EditableText` es un wrapper delgado sobre esto (retrocompatible).
// =============================================================================

import { useContext } from 'react'
import { OverridesContext, EditingContext } from './context.js'

/** Convierte un override en estilo inline. */
export function styleFromOverride(ov, base) {
  const s = { ...(base || {}) }
  if (!ov) return Object.keys(s).length ? s : undefined
  if (ov.fontSize != null) s.fontSize = `${ov.fontSize}px`
  if (ov.color) s.color = ov.color
  if (ov.width != null) s.width = `${ov.width}px`
  if (ov.height != null) s.height = `${ov.height}px`
  if (ov.align) s.textAlign = ov.align
  if (ov.absolute) {
    // Posición libre: fuera del flujo, siempre por encima del resto.
    s.position = 'absolute'
    s.left = `${ov.absolute.x}px`
    s.top = `${ov.absolute.y}px`
    s.margin = 0
    s.zIndex = 50
  } else if (ov.offset && (ov.offset.x || ov.offset.y)) {
    // Desplazamiento no destructivo: no reordena a los vecinos y puede
    // solaparse por encima de ellos (z-index) sin romper el layout.
    s.transform = `translate(${ov.offset.x}px, ${ov.offset.y}px)`
    s.position = s.position || 'relative'
    s.zIndex = 50
  }
  return s
}

export function Editable({
  editId,
  file,
  path,
  as: Tag = 'span',
  className,
  style,
  children,
  src,
  ...rest
}) {
  const { overrides } = useContext(OverridesContext)
  const { editing, selectedId, select, saveText } = useContext(EditingContext)

  const id = editId || (file && path ? `${file}:${path}` : undefined)
  const ov = id ? overrides[id] : undefined
  const isImage = Tag === 'img'
  const isText = Boolean(file && path) && !isImage

  // Estilo final = estilo del autor + override.
  const finalStyle = styleFromOverride(ov, style)
  const finalSrc = isImage ? (ov?.src || src) : undefined

  // --- Fuera de edición (y en producción): render plano con overrides. --------
  if (!editing) {
    if (isImage) return <Tag className={className} style={finalStyle} src={finalSrc} {...rest} />
    return (
      <Tag className={className} style={finalStyle} data-edit-id={id} {...rest}>
        {children}
      </Tag>
    )
  }

  const selected = selectedId === id
  const editCls = [
    'taag-editable',
    selected && 'taag-selected',
    className,
  ].filter(Boolean).join(' ')

  const onSelect = (e) => {
    // En edición, un click nunca navega ni dispara la acción del padre.
    e.preventDefault()
    e.stopPropagation()
    if (id) select(id, e.currentTarget)
  }

  // --- Imagen editable --------------------------------------------------------
  if (isImage) {
    return (
      <Tag
        className={editCls}
        style={finalStyle}
        src={finalSrc}
        data-edit-id={id}
        title={id}
        onClickCapture={onSelect}
        {...rest}
      />
    )
  }

  // --- Texto editable (contentEditable cuando está seleccionado) --------------
  const original = typeof children === 'string' ? children : String(children ?? '')

  async function commit(el) {
    const next = el.innerText.replace(/ /g, ' ').trim()
    if (next === original) return
    if (next === '') { el.innerText = original; return }
    const ok = await saveText(file, path, next)
    if (!ok) el.innerText = original
  }

  return (
    <Tag
      className={editCls}
      style={finalStyle}
      data-edit-id={id}
      title={id}
      contentEditable={isText && selected}
      suppressContentEditableWarning
      spellCheck={false}
      onClickCapture={onSelect}
      onBlur={isText ? (e) => commit(e.currentTarget) : undefined}
      onKeyDown={isText ? (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.blur() }
        else if (e.key === 'Escape') { e.currentTarget.innerText = original; e.currentTarget.blur() }
      } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Editable
