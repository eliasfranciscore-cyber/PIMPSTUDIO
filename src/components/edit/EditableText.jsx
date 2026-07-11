// =============================================================================
// EditableText — envoltura de un texto editable desde el navegador.
// -----------------------------------------------------------------------------
// Uso:  <EditableText file="home-hero" path="h1.line">{texto}</EditableText>
//   • En producción / fuera del modo edición: renderiza el texto tal cual.
//   • En modo edición (botón "Editar textos"): el texto se vuelve editable
//     in-situ; al salir del campo (blur) o pulsar Enter, guarda contra el
//     servidor local (scripts/content-server.mjs).
//
// `file`  = nombre del JSON en src/data/content (sin extensión).
// `path`  = ruta dentro del JSON, ej. "h2" o "pillars.0.body".
// `as`    = etiqueta HTML a renderizar (por defecto "span").
// =============================================================================

import { createContext, useContext } from 'react'

export const EditContext = createContext({
  editing: false,
  serverUp: false,
  save: async () => false,
})

export function EditableText({ file, path, as: Tag = 'span', className, children }) {
  const { editing, save } = useContext(EditContext)

  // Texto original como string (los children siempre son texto plano aquí).
  const original = typeof children === 'string' ? children : String(children ?? '')

  if (!editing) {
    return <Tag className={className}>{children}</Tag>
  }

  async function commit(el) {
    const next = el.innerText.replace(/ /g, ' ').trim()
    if (next === original) return
    if (next === '') {
      // No permitimos borrar por completo: revertimos.
      el.innerText = original
      return
    }
    const ok = await save(file, path, next)
    if (!ok) el.innerText = original // revertir si falló el guardado
  }

  return (
    <Tag
      className={`taag-editing ${className ?? ''}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      title={`${file} · ${path}`}
      // En modo edición, un texto dentro de un <a>/<button> no debe navegar
      // ni disparar la acción del padre: solo enfocar para editar.
      onClickCapture={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onBlur={(e) => commit(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          e.currentTarget.blur()
        } else if (e.key === 'Escape') {
          e.currentTarget.innerText = original
          e.currentTarget.blur()
        }
      }}
    >
      {children}
    </Tag>
  )
}
