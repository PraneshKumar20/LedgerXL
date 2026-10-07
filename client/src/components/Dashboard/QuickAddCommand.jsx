import { useState, useEffect, useMemo, useRef } from "react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { Command, ArrowRight, CornerDownLeft, X, CheckCircle2, Calendar, Tag, DollarSign, Repeat } from "lucide-react"
import { parseQuickAdd, CATEGORY_COLORS } from "../../utils/quickAddParser"
import { formatNumber } from "../../utils/formatUtils"

const SAMPLE_PROMPTS = [
  "Spent $45 on groceries yesterday",
  "Uber ride to airport 28 travel",
  "Freelance client design 850 salary",
  "Netflix monthly 15.99 subscription",
  "Electricity bill 115 bills"
]

export default function QuickAddCommand({ isOpen, onClose, onSave, currencySymbol = "₹" }) {
  const [query, setQuery] = useState("")
  const [justRecorded, setJustRecorded] = useState(null)
  const inputRef = useRef(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
        setJustRecorded(null)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setQuery("")
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Natural Language Parser
  const parsedResult = useMemo(() => {
    return parseQuickAdd(query)
  }, [query])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!parsedResult || !parsedResult.isValid) return

    try {
      await onSave({
        title: parsedResult.title,
        amount: parsedResult.amount,
        category: parsedResult.category,
        type: parsedResult.type,
        date: parsedResult.date,
        isRecurring: parsedResult.isRecurring
      })

      setJustRecorded(parsedResult)
      setTimeout(() => {
        onClose()
      }, 600)
    } catch {
      // Keep QuickAdd command open on save failure so user input is preserved for retry
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && parsedResult?.isValid) {
      handleSubmit()
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  const categoryTheme = parsedResult ? (CATEGORY_COLORS[parsedResult.category] || CATEGORY_COLORS.Other) : CATEGORY_COLORS.Other

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-28 px-3 sm:px-4 overflow-y-auto">
          {/* Backdrop Blur */}
          <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-overlay backdrop-blur-sm"
          />

          {/* Omnibar Dialog Card */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-surface-2 border border-border-default rounded-modal shadow-elevation-modal overflow-hidden z-10 max-h-[90dvh] flex flex-col"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-default shrink-0">
              <div className="p-1.5 rounded-control bg-surface-3 text-brand shrink-0">
                <Command className="h-4 w-4" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type naturally... e.g. 'Spent $45 on groceries yesterday'"
                className="w-full bg-transparent text-base sm:text-base text-text-primary font-medium placeholder:text-xs sm:placeholder:text-sm placeholder:text-text-muted outline-none min-w-0"
              />
              <button
                type="button"
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary p-1 rounded-control hover:bg-surface-hover transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Live Parsing Preview Area */}
            <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto overscroll-contain">
              {parsedResult ? (
                <div className="p-3.5 rounded-card bg-surface-3 border border-border-default space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                      Live Parsed Result
                    </span>
                    <span className={`text-[11px] font-semibold font-mono-nums px-2 py-0.5 rounded-badge border ${parsedResult.type === 'income' ? 'bg-positive/10 border-positive/20 text-positive' : 'bg-negative/10 border-negative/20 text-negative'}`}>
                      {parsedResult.type === 'income' ? 'Income (+)' : 'Expense (-)'}
                    </span>
                  </div>

                  {/* Detected Chips Grid */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Amount Chip */}
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-control bg-surface-1 border border-border-subtle text-text-primary font-mono-nums text-sm font-bold shadow-elevation-sm">
                      <DollarSign className="h-3.5 w-3.5 text-brand -mr-1" />
                      <span>{currencySymbol}{formatNumber(parsedResult.amount, currencySymbol)}</span>
                    </div>

                    {/* Category Chip */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-badge border text-xs font-semibold ${categoryTheme.badge} shadow-elevation-sm`}>
                      <Tag className="h-3.5 w-3.5 opacity-80" />
                      <span>{parsedResult.category}</span>
                    </div>

                    {/* Date Chip */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface-1 border border-border-subtle text-text-secondary text-xs font-medium">
                      <Calendar className="h-3.5 w-3.5 text-text-muted" />
                      <span>{parsedResult.dateLabel} ({parsedResult.date})</span>
                    </div>

                    {/* Title Chip */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface-1 border border-border-subtle text-text-secondary text-xs font-medium">
                      <span className="text-text-muted">For:</span>
                      <span className="font-semibold text-text-primary truncate max-w-[150px]">{parsedResult.title}</span>
                    </div>

                    {/* Recurring Badge */}
                    {parsedResult.isRecurring && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-badge bg-brand/10 border border-brand/20 text-brand text-xs font-medium">
                        <Repeat className="h-3 w-3" />
                        <span>Recurring</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Sample Prompts when input is empty */
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                    Quick Suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setQuery(prompt)
                          inputRef.current?.focus()
                        }}
                        className="text-xs text-text-secondary hover:text-text-primary px-2.5 py-1 rounded-control bg-surface-1 hover:bg-surface-hover border border-border-subtle text-left flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ArrowRight className="h-3 w-3 text-text-muted" />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Just recorded feedback banner */}
              {justRecorded && (
                <div className="flex items-center gap-2 p-2.5 rounded-control bg-positive/10 border border-positive/20 text-positive text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4 text-positive" />
                  <span className="font-mono-nums">Recorded: {currencySymbol}{formatNumber(justRecorded.amount, currencySymbol)} for {justRecorded.title}</span>
                </div>
              )}
            </div>

            {/* Footer Bar with Keyboard Shortcuts */}
            <div className="px-4 py-2.5 bg-surface-1 border-t border-border-default flex items-center justify-between gap-2 flex-wrap text-xs text-text-muted shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-badge bg-surface-2 border border-border-default font-mono-nums text-[10px] text-text-secondary">↵ Enter</kbd>
                  <span className="hidden xs:inline">to save</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-badge bg-surface-2 border border-border-default font-mono-nums text-[10px] text-text-secondary">Esc</kbd>
                  <span className="hidden xs:inline">to close</span>
                </span>
              </div>

              {parsedResult?.isValid && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-control bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-medium text-xs transition-colors shadow-elevation-sm cursor-pointer ml-auto sm:ml-0"
                >
                  <span>Confirm Entry</span>
                  <CornerDownLeft className="h-3 w-3" />
                </button>
              )}
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
