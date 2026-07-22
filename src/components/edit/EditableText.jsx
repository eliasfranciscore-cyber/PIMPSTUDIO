// =============================================================================
// EditableText — wrapper delgado sobre <Editable> para editar un texto.
// -----------------------------------------------------------------------------
// Se mantiene por retrocompatibilidad: todas las páginas ya lo usan como
//   <EditableText file="home-hero" path="kicker">{texto}</EditableText>
// La lógica real (aplicar overrides, selección, edición inline) vive en
// Editable.jsx. Aquí solo reexponemos la API previa.
//
// `EditContext` se reexporta como alias de `EditingContext` para el código que
// hacía `useContext(EditContext)` (p. ej. Home.jsx lee `editing`).
// =============================================================================

import { Editable } from './Editable.jsx'
import { EditingContext } from './context.js'

export const EditContext = EditingContext

export function EditableText({ file, path, as = 'span', className, children }) {
  return (
    <Editable file={file} path={path} as={as} className={className}>
      {children}
    </Editable>
  )
}

export default EditableText
