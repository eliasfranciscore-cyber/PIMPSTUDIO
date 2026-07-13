import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './ui.jsx'
import { CLP } from '../data.js'
import { CountUp, KpiTile, Donut, ProgressBar } from './DashKit.jsx'

/**
 * ExpensesModule — módulo de gastos rediseñado (estilo Santa Julieta adaptado a
 * tokens Brunetti). Reúne hero KPI, semáforo de presupuestos por categoría,
 * donut de distribución, alta/edición en modal y lista de movimientos.
 *
 * Los presupuestos por categoría llegan de props (`budgets`, persistidos en
 * localStorage y editables en Config → Presupuestos). El mes se filtra con
 * fecha LOCAL (no UTC) para no arrastrar el bug de sumar todos los gastos.
 *
 * Props: { expenses, budgets, onCreate(draft), onUpdate(expense), onDelete(expense), ownerName }
 */

// Icono (del set de ui.jsx) + color por categoría, en tokens Brunetti.
export const CATEGORY_META = {
  Insumos:      { icon: 'scissors', color: '#c9a14e' },
  Equipamiento: { icon: 'grid',     color: '#7ea8ff' },
  Arriendo:     { icon: 'pin',      color: '#b98cff' },
  Marketing:    { icon: 'spark',    color: '#f2a65a' },
  Personal:     { icon: 'users',    color: '#6fbf86' },
  Servicios:    { icon: 'wallet',   color: '#5bc0be' },
  Otros:        { icon: 'gift',     color: '#9aa0a6' },
}
export const EXPENSE_CATEGORIES = Object.keys(CATEGORY_META)
const metaOf = (cat) => CATEGORY_META[cat] || CATEGORY_META.Otros

const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
const daysInMonth = (ym) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate() }
const badgeClass = 'dk-badge'

function exportExpensesCSV(rows, ym) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const toCSV = (headers, list) => [headers.join(','), ...list.map((r) => r.map(esc).join(','))].join('\n')
  const csv = toCSV(['Fecha', 'Categoria', 'Detalle', 'Monto'], rows.map((e) => [e.date, e.category, e.detail, e.amount]))
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `brunetti-gastos-${ym}.csv`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function ExpenseModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState({ date: '', category: 'Insumos', detail: '', amount: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(initial
      ? { date: initial.date, category: initial.category || 'Insumos', detail: initial.detail || '', amount: String(initial.amount || '') }
      : { date: new Date().toISOString().slice(0, 10), category: 'Insumos', detail: '', amount: '' })
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submit = () => {
    const amount = Number(String(form.amount).replace(/\D/g, ''))
    if (!form.detail.trim()) return setError('Escribe un detalle.')
    if (!amount || amount <= 0) return setError('Monto inválido.')
    onSave({ ...(initial || {}), date: form.date, category: form.category, detail: form.detail.trim(), amount })
    onClose()
  }

  return createPortal((
    <div className="psn-modal is-drawer" role="dialog" aria-modal="true">
      <button className="psn-scrim" aria-label="Cerrar" onClick={onClose} />
      <div className="psn-modal-card psn-newbk psn-drawer-card">
        <button className="psn-close" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={17} /></button>
        <h3><Icon name="wallet" size={20} /> {initial ? 'Editar gasto' : 'Nuevo gasto'}</h3>

        <div className="psn-newbk-sec">
          <label className="dk-field-lbl">Categoría</label>
          <div className="dk-cat-grid">
            {EXPENSE_CATEGORIES.map((cat) => {
              const m = metaOf(cat)
              const on = form.category === cat
              return (
                <button key={cat} type="button" className={`dk-cat-btn ${on ? 'is-on' : ''}`} style={{ '--c': m.color }} onClick={() => setForm((f) => ({ ...f, category: cat }))}>
                  <span className="dk-cat-ic"><Icon name={m.icon} size={16} /></span>
                  <span>{cat}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="psn-newbk-sec">
          <label className="dk-field-lbl">Detalle</label>
          <input className="input" placeholder="Detalle del gasto" value={form.detail} onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))} autoFocus />
        </div>

        <div className="psn-newbk-sec" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '.5rem' }}>
          <div><label className="dk-field-lbl">Fecha</label><input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
          <div><label className="dk-field-lbl">Monto</label><input className="input" inputMode="numeric" placeholder="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value.replace(/\D/g, '') }))} /></div>
        </div>

        {error && <p className="psn-newbk-err"><Icon name="close" size={13} /> {error}</p>}

        <div className="psn-confirm-actions">
          <button className="btn btn-ghost btn-block" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold btn-block" onClick={submit}><Icon name="check" size={15} /> {initial ? 'Guardar' : 'Registrar'}</button>
        </div>
      </div>
    </div>
  ), document.body)
}

export default function ExpensesModule({ expenses = [], budgets = {}, onCreate = () => {}, onUpdate = () => {}, onDelete = () => {} }) {
  const [modal, setModal] = useState(null)     // null | {} (nuevo) | expense (editar)
  const [confirmDel, setConfirmDel] = useState(null)
  const [ym, setYm] = useState(() => monthKey())
  const [categoryFilter, setCategoryFilter] = useState('all')

  const shiftMonth = (delta) => {
    const [y, m] = ym.split('-').map(Number)
    setYm(monthKey(new Date(y, m - 1 + delta, 1)))
  }
  const monthLabel = (() => {
    const [y, m] = ym.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
  })()

  const monthExpenses = useMemo(
    () => expenses.filter((e) => String(e.date || '').slice(0, 7) === ym),
    [expenses, ym]
  )
  const monthTotal = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const byCategory = useMemo(() => {
    const m = {}
    for (const e of monthExpenses) m[e.category || 'Otros'] = (m[e.category || 'Otros'] || 0) + Number(e.amount || 0)
    return m
  }, [monthExpenses])

  // Días para el promedio diario: si es el mes en curso, los transcurridos;
  // si es un mes pasado, el mes completo (ya cerrado).
  const daysElapsed = ym === monthKey() ? new Date().getDate() : daysInMonth(ym)
  const dailyAvg = daysElapsed ? Math.round(monthTotal / daysElapsed) : 0

  const filteredMovements = useMemo(() => {
    let list = categoryFilter === 'all' ? monthExpenses : monthExpenses.filter((e) => (e.category || 'Otros') === categoryFilter)
    return [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [monthExpenses, categoryFilter])
  const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  const budgetTotal = EXPENSE_CATEGORIES.reduce((s, c) => s + (Number(budgets[c]) || 0), 0)
  const budgetPct = budgetTotal ? (monthTotal / budgetTotal) * 100 : 0

  const donutItems = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, value]) => ({ label: cat, value, color: metaOf(cat).color }))

  const catsWithBudget = EXPENSE_CATEGORIES.filter((c) => Number(budgets[c]) > 0)

  const statusColor = (pct) => pct >= 100 ? '#d99a8f' : pct >= 85 ? 'var(--gold)' : 'var(--green, #6fbf86)'

  return (
    <div className="animate-in" style={{ display: 'grid', gap: '1.1rem' }}>
      {/* (a) HERO */}
      <div className="dk-hero">
        <div className="dk-hero-grid cols-5 dk-stagger">
          <div>
            <div className="dk-month-stepper">
              <button type="button" onClick={() => shiftMonth(-1)} aria-label="Mes anterior"><Icon name="arrowLeft" size={13} /></button>
              <span className="dk-hero-sub">Gastos de {monthLabel}</span>
              <button type="button" onClick={() => shiftMonth(1)} disabled={ym >= monthKey()} aria-label="Mes siguiente"><Icon name="arrowRight" size={13} /></button>
            </div>
            <h2 className="dk-hero-big"><CountUp value={monthTotal} format={CLP} /></h2>
            {budgetTotal > 0 && (
              <div style={{ marginTop: '.4rem', maxWidth: 220 }}>
                <ProgressBar pct={budgetPct} color={statusColor(budgetPct)} />
                <span className="dk-hero-sub" style={{ fontSize: '.7rem' }}>{Math.round(budgetPct)}% de {CLP(budgetTotal)} presupuestado</span>
              </div>
            )}
          </div>
          <KpiTile icon="chart" label="Promedio diario" value={dailyAvg} format={CLP} />
          <KpiTile icon="wallet" label="Movimientos" value={monthExpenses.length} />
          <KpiTile icon="trend" label="Top categoría" value={topCat ? topCat[1] : 0} format={CLP} sub={topCat ? topCat[0] : 'Sin gastos'} color={topCat ? metaOf(topCat[0]).color : 'var(--gold)'} />
          <button className="btn btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', alignSelf: 'center' }} onClick={() => setModal({})}>
            <Icon name="wallet" size={16} /> Nuevo gasto
          </button>
        </div>
      </div>

      {/* (b) SEMÁFORO de presupuestos */}
      {catsWithBudget.length > 0 && (
        <div className="dk-budget-grid">
          {catsWithBudget.map((cat) => {
            const spent = byCategory[cat] || 0
            const budget = Number(budgets[cat]) || 0
            const pct = budget ? (spent / budget) * 100 : 0
            const m = metaOf(cat)
            return (
              <div key={cat} className="dk-budget-card">
                <div className="dk-budget-head">
                  <span className={badgeClass} style={{ '--c': m.color }}><Icon name={m.icon} size={12} /> {cat}</span>
                  <b style={{ color: statusColor(pct) }}>{Math.round(pct)}%</b>
                </div>
                <ProgressBar pct={pct} color={statusColor(pct)} />
                <span className="dk-budget-foot">{CLP(spent)} de {CLP(budget)}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* (c) DONUT de distribución */}
      {donutItems.length > 0 && (
        <div className="dk-panel dk-donut-row">
          <Donut items={donutItems} size={130} centerLabel={CLP(monthTotal)} centerSub="este mes" />
          <div className="dk-legend">
            {donutItems.map((it) => (
              <div key={it.label} className="dk-legend-row">
                <span className="dk-legend-dot" style={{ background: it.color }} />
                <span className="dk-legend-lbl">{it.label}</span>
                <b>{CLP(it.value)}</b>
                <small>{monthTotal ? Math.round((it.value / monthTotal) * 100) : 0}%</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* (e) LISTA de movimientos */}
      <div className="dk-panel">
        <div className="dk-panel-head">
          <h3>Movimientos de {monthLabel}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span className="chip">{filteredMovements.length} de {monthExpenses.length}</span>
            <button type="button" className="btn btn-dark btn-sm" onClick={() => exportExpensesCSV(filteredMovements, ym)}>
              <Icon name="wallet" size={13} /> Exportar CSV
            </button>
          </div>
        </div>
        <div className="dk-cat-filter">
          <button type="button" className={categoryFilter === 'all' ? 'is-on' : ''} onClick={() => setCategoryFilter('all')}>Todas</button>
          {EXPENSE_CATEGORIES.filter((c) => byCategory[c] > 0).map((c) => (
            <button key={c} type="button" className={categoryFilter === c ? 'is-on' : ''} style={{ '--c': metaOf(c).color }} onClick={() => setCategoryFilter((f) => f === c ? 'all' : c)}>
              <Icon name={metaOf(c).icon} size={12} /> {c}
            </button>
          ))}
        </div>
        <div className="dk-mov-list">
          {filteredMovements.length === 0 && <div className="empty-state">Sin gastos que coincidan en {monthLabel}.</div>}
          {filteredMovements.map((e) => {
            const m = metaOf(e.category)
            return (
              <div key={e.id} className="dk-mov-row">
                <span className="dk-mov-ic" style={{ '--c': m.color }}><Icon name={m.icon} size={16} /></span>
                <div className="dk-mov-main">
                  <strong>{e.detail}</strong>
                  <span>{e.category} · {e.date}{e.owner ? ` · ${e.owner}` : ''}</span>
                </div>
                <b className="dk-mov-amt">{CLP(e.amount)}</b>
                <div className="dk-mov-actions">
                  <button className="btn btn-dark btn-sm" title="Editar" onClick={() => setModal(e)}><Icon name="check" size={13} /></button>
                  <button className="btn btn-sm psn-res-delete" title="Eliminar" onClick={() => setConfirmDel(e)}><Icon name="close" size={13} /></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* (d) MODAL alta/edición */}
      <ExpenseModal
        open={modal != null}
        initial={modal && modal.id ? modal : null}
        onClose={() => setModal(null)}
        onSave={(data) => { data.id ? onUpdate(data) : onCreate(data) }}
      />

      {/* CONFIRMAR ELIMINAR */}
      {confirmDel && createPortal((
        <div className="psn-modal psn-modal-top" role="alertdialog" aria-modal="true">
          <button className="psn-scrim" aria-label="Cerrar" onClick={() => setConfirmDel(null)} />
          <div className="psn-modal-card psn-confirm">
            <span className="psn-confirm-ic"><Icon name="close" size={22} /></span>
            <h3 className="font-display">¿Eliminar este gasto?</h3>
            <p>{confirmDel.detail} · {CLP(confirmDel.amount)}. Esta acción no se puede deshacer.</p>
            <div className="psn-confirm-actions">
              <button className="btn btn-ghost btn-block" onClick={() => setConfirmDel(null)}>Volver</button>
              <button className="btn btn-danger btn-block" onClick={() => { onDelete(confirmDel); setConfirmDel(null) }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  )
}
