import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Layers, X, CheckCircle2, ShieldAlert } from "lucide-react"
import { formatNumber } from "../../utils/formatUtils"
import { getCategoryStyle } from "../../utils/categoryColors"

export default function CategoryEnvelopesModal({ 
  isOpen, 
  onClose, 
  expenses = [], 
  currencySymbol = "₹", 
  multiplier = 1,
  categoryBudgets = {}, 
  onUpdateCategoryBudget
}) {
  const [editingValues, setEditingValues] = useState({})

  const handleCommitCategory = (category) => {
    if (editingValues[category] === undefined) return
    const val = editingValues[category].replace(/[^0-9]/g, '')
    const numVal = (Number(val) || 0) / multiplier
    onUpdateCategoryBudget(category, numVal)
    setEditingValues(prev => {
      const copy = { ...prev }
      delete copy[category]
      return copy
    })
  }

  const handleDone = () => {
    // Commit any unsaved edits quietly before closing
    Object.entries(editingValues).forEach(([cat, val]) => {
      const clean = val.replace(/[^0-9]/g, '')
      const numVal = (Number(clean) || 0) / multiplier
      onUpdateCategoryBudget(cat, numVal)
    })
    setEditingValues({})
    onClose()
  }

  // Calculate actual spend per category
  const categorySpending = useMemo(() => {
    const map = {}
    if (Array.isArray(expenses)) {
      expenses.filter(e => e.type === 'expense').forEach(e => {
        const cat = e.category || 'Other'
        map[cat] = (map[cat] || 0) + (Number(e.amount) || 0)
      })
    }
    return map
  }, [expenses])

  // Aggregate Envelope Stats
  const envelopeStats = useMemo(() => {
    const list = Object.entries(categoryBudgets).map(([cat, baseLimit]) => {
      const limit = baseLimit * multiplier
      const spent = categorySpending[cat] || 0
      const percent = limit > 0 ? (spent / limit) * 100 : 0
      const remaining = limit - spent

      return {
        category: cat,
        baseLimit,
        limit,
        spent,
        percent: Math.min(percent, 100),
        rawPercent: percent,
        remaining,
        isOver: spent > limit,
        theme: getCategoryStyle(cat)
      }
    })

    const totalAllocated = Object.values(categoryBudgets).reduce((a, b) => a + b, 0) * multiplier
    const totalSpentInEnvelopes = list.reduce((a, b) => a + b.spent, 0)
    const overCount = list.filter(i => i.isOver).length

    return {
      list,
      totalAllocated,
      totalSpentInEnvelopes,
      overCount
    }
  }, [categoryBudgets, categorySpending, multiplier])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-overlay backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-surface-2 border border-border-default rounded-modal shadow-elevation-modal overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            <div className="flex flex-col h-full min-h-0">
              
              {/* Header */}
              <div className="p-5 sm:px-6 sm:pt-6 pb-4 shrink-0 border-b border-border-default/60 bg-surface-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-surface-3 text-brand border border-border-default shadow-sm">
                      <Layers className="h-4 w-4" />
                    </div>
                    <h2 className="text-[19px] font-bold text-text-primary tracking-tight">
                      Category Budget Envelopes
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-surface-hover transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:px-6 bg-background space-y-5">
                
                {/* Summary Strip */}
                <div className="flex flex-row items-center justify-between p-3.5 sm:px-5 sm:py-3.5 rounded-xl bg-surface-inset border border-border-subtle shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">Total Allocated</span>
                    <p className="text-[17px] leading-tight font-bold text-text-primary font-mono-nums mt-0.5">
                      {currencySymbol}{formatNumber(envelopeStats.totalAllocated, currencySymbol, 0, 0)}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-border-subtle mx-2 hidden sm:block"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">Envelopes Spent</span>
                    <p className="text-[17px] leading-tight font-bold text-text-primary font-mono-nums mt-0.5">
                      {currencySymbol}{formatNumber(envelopeStats.totalSpentInEnvelopes, currencySymbol, 0, 0)}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-border-subtle mx-2 hidden sm:block"></div>
                  <div className="flex flex-col items-end sm:items-start text-right sm:text-left">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">Threshold Status</span>
                    <p className={`text-[12px] font-semibold mt-1 flex items-center justify-end sm:justify-start gap-1.5 ${envelopeStats.overCount > 0 ? 'text-negative' : 'text-positive'}`}>
                      {envelopeStats.overCount > 0 ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-negative"></span>
                          {envelopeStats.overCount} Exceeded
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-positive"></span>
                          All Healthy
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Envelopes List */}
                <div className="space-y-3 pb-2">
                  {envelopeStats.list.map((item) => {
                    const isDirty = editingValues[item.category] !== undefined
                    const displayValue = isDirty 
                      ? editingValues[item.category] 
                      : formatNumber(Math.round(item.limit), currencySymbol, 0, 0)

                    return (
                      <div 
                        key={item.category}
                        className="p-4 rounded-xl bg-surface-1 border border-border-default hover:border-border-strong transition-colors flex flex-col gap-2.5 group shadow-elevation-sm"
                      >
                        {/* Top Row: Category, Remaining, Target Input */}
                        <div className="flex items-start justify-between gap-3">
                          
                          {/* Left: Category & Remaining */}
                          <div className="flex items-center gap-2.5 min-w-0 pt-1">
                            <span className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-medium border ${item.theme.badge}`}>
                              {item.category}
                            </span>
                            <span className={`truncate text-xs font-medium ${item.isOver ? 'text-negative' : 'text-text-secondary'}`}>
                              {item.isOver ? `Over budget by ${currencySymbol}${formatNumber(Math.abs(item.remaining), currencySymbol, 0, 0)}` : `${currencySymbol}${formatNumber(item.remaining, currencySymbol, 0, 0)} remaining`}
                            </span>
                          </div>

                          {/* Right: Target */}
                          <div className="flex flex-col items-end shrink-0 gap-1.5">
                            <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted leading-none">Target</span>
                            <div className="flex items-center gap-2">
                              <div className={`relative flex items-center h-8 px-2 rounded-md bg-surface-2 border transition-colors ${
                                isDirty ? 'border-brand ring-1 ring-brand/30' : 'border-border-default/60 hover:border-border-default focus-within:border-border-strong'
                              }`}>
                                <span className="text-xs font-mono-nums text-text-muted mr-1">{currencySymbol}</span>
                                <input
                                  type="text"
                                  value={displayValue}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '')
                                    setEditingValues(prev => ({ ...prev, [item.category]: val }))
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      handleCommitCategory(item.category)
                                    }
                                  }}
                                  className="w-[60px] sm:w-[72px] bg-transparent text-[13px] font-mono-nums font-bold text-text-primary text-right outline-none placeholder:text-text-muted"
                                  placeholder="0"
                                />
                              </div>
                              {isDirty && (
                                <button
                                  type="button"
                                  onClick={() => handleCommitCategory(item.category)}
                                  className="h-8 px-2.5 rounded-md bg-brand hover:bg-brand-hover text-white text-[11px] font-semibold flex items-center cursor-pointer transition-colors shadow-sm"
                                >
                                  Save
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Progress & Spent */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1 bg-surface-inset rounded-full overflow-hidden flex">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percent}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={`h-full rounded-full transition-colors opacity-90 ${
                                  item.rawPercent > 100 
                                    ? 'bg-negative' 
                                    : item.rawPercent > 80 
                                      ? 'bg-warning' 
                                      : item.theme.bg
                                }`}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">Spent</span>
                              <span className="text-[14px] font-mono-nums font-bold text-text-primary">
                                {currencySymbol}{formatNumber(item.spent, currencySymbol, 0, 0)}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono-nums text-text-muted font-normal">
                              {formatNumber(item.rawPercent, currencySymbol, 0, 0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 sm:px-6 py-4 border-t border-border-default/60 bg-surface-2 shrink-0 flex items-center justify-between gap-4">
                <p className="text-[11px] font-medium text-text-muted leading-relaxed hidden sm:block">
                  Press Enter or click Save next to an amount to update its target.
                </p>
                <button
                  onClick={handleDone}
                  className="px-6 py-2.5 rounded-control bg-brand hover:bg-brand-hover active:bg-brand-active text-white text-[13px] font-semibold transition-colors shadow-elevation-sm cursor-pointer w-full sm:w-auto"
                >
                  Done
                </button>
              </div>
              
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
