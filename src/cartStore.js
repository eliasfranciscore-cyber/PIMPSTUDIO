/* PIMP STUDIO — Carrito local del módulo Essentials (tienda de clientes)
   ------------------------------------------------------------------
   El checkout real con Flow queda para una etapa futura; por ahora el
   carrito es 100% cliente, persistido en localStorage para sobrevivir
   recargas. Mismo estilo de funciones puras que bookingsStore.js. */

const KEY = "ps_cart"

export function readCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] }
}

function writeCart(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
  return items
}

export function addToCart(productId, qty = 1) {
  const items = readCart()
  const existing = items.find((i) => i.productId === productId)
  if (existing) existing.qty += qty
  else items.push({ productId, qty })
  return writeCart(items)
}

export function setQty(productId, qty) {
  const items = readCart()
  if (qty <= 0) return writeCart(items.filter((i) => i.productId !== productId))
  const existing = items.find((i) => i.productId === productId)
  if (existing) existing.qty = qty
  return writeCart(items)
}

export function removeFromCart(productId) {
  return writeCart(readCart().filter((i) => i.productId !== productId))
}

export function clearCart() {
  return writeCart([])
}

export function cartCount(items = readCart()) {
  return items.reduce((n, i) => n + i.qty, 0)
}
