// =============================================================================
// Contextos compartidos del editor visual. Están en su propio módulo para que
// tanto los providers (OverridesProvider, EditProvider) como los consumidores
// (Editable, Inspector) los importen sin ciclos.
// =============================================================================

import { createContext } from 'react'

// Capa de OVERRIDES — SIEMPRE activa (dev y producción). Aplica posición,
// tamaño de fuente, tamaño/imagen de cada elemento por su `editId`.
export const OverridesContext = createContext({
  overrides: {},                          // { [editId]: { offset, absolute, fontSize, width, height, src, align } }
  setOverride: async () => false,         // (editId, patch, {persist}) → aplica local + guarda
  uploadImage: async () => ({ ok: false }),
  listAssets: async () => [],
})

// Modo EDICIÓN — solo-dev. La UI de edición (selección, inspector) lo alimenta.
// En producción queda con estos valores por defecto (editing:false) y todo lo
// interactivo se apaga solo.
export const EditingContext = createContext({
  editing: false,
  serverUp: false,
  selectedId: null,
  select: () => {},
  clearSelection: () => {},
  saveText: async () => false,            // guarda strings de texto a src/data/content
})
