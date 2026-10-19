import { useState, useMemo } from "react"
import { formatNumber } from "../../utils/formatUtils"
import confetti from "canvas-confetti"
import { 
  Layers, 
  Target, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Sliders,
  Shield,
  Plane,
  Laptop,
  Edit3,
  TrendingUp,
  Sparkles,
  UtensilsCrossed,
  Receipt,
  Tv,
  ShoppingBag,
  RefreshCw,
  FolderKanban,
  Check,
  X,
  Wallet
} from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

// Helper to resolve theme-aligned icons and styles for savings goals
const getGoalStyle = (goal) => {
  const t = (goal.title || "").toLowerCase()
  if (t.includes("emergency") || t.includes("reserve") || t.includes("shield") || t.includes("safe")) {
    return {
      icon: <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      squircle: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/25 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-[0_0_12px_rgba(59,130,246,0.15)]",
      barGradient: "bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.35)]",
      percentBadge: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/25",
      accentColor: "text-blue-600 dark:text-blue-400",
    }
  }
  if (t.includes("vacation") || t.includes("trip") || t.includes("tokyo") || t.includes("kyoto") || t.includes("travel") || t.includes("flight") || t.includes("holiday")) {
    return {
      icon: <Plane className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
      squircle: "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/25 text-sky-600 dark:text-sky-400 shadow-sm dark:shadow-[0_0_12px_rgba(56,189,248,0.15)]",
      barGradient: "bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-400 shadow-[0_0_10px_rgba(56,189,248,0.35)]",
      percentBadge: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/25",
      accentColor: "text-sky-600 dark:text-sky-400",
    }
  }
  if (t.includes("macbook") || t.includes("laptop") || t.includes("pc") || t.includes("computer") || t.includes("tech") || t.includes("phone")) {
    return {
      icon: <Laptop className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      squircle: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/25 text-indigo-600 dark:text-indigo-400 shadow-sm dark:shadow-[0_0_12px_rgba(99,102,241,0.15)]",
      barGradient: "bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-400 shadow-[0_0_10px_rgba(99,102,241,0.35)]",
      percentBadge: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/25",
      accentColor: "text-indigo-600 dark:text-indigo-400",
    }
  }
  return {
    icon: goal.emoji ? <span className="text-lg leading-none">{goal.emoji}</span> : <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    squircle: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    barGradient: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]",
    percentBadge: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25",
    accentColor: "text-emerald-600 dark:text-emerald-400",
  }
}

// Map Lucide icons per category for high-fidelity visual identity
const getCategoryIcon = (category) => {
  switch (category) {
    case "Food":
      return <UtensilsCrossed className="h-4 w-4" />
    case "Travel":
      return <Plane className="h-4 w-4" />
    case "Bills":
      return <Receipt className="h-4 w-4" />
    case "Subscriptions":
      return <RefreshCw className="h-4 w-4" />
    case "Entertainment":
      return <Tv className="h-4 w-4" />
    case "Shopping":
      return <ShoppingBag className="h-4 w-4" />
    default:
      return <FolderKanban className="h-4 w-4" />
  }
}

// Sophisticated color schemes per category with ambient background glows
const getCategoryCardTheme = (category) => {
  switch (category) {
    case "Food":
      return {
        iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/15",
        glow: "rgba(244, 63, 94, 0.12)",
        bar: "bg-gradient-to-r from-rose-500 to-rose-400",
        accent: "text-rose-500 dark:text-rose-400"
      }
    case "Travel":
      return {
        iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:bg-purple-500/15",
        glow: "rgba(139, 92, 246, 0.12)",
        bar: "bg-gradient-to-r from-purple-500 to-indigo-400",
        accent: "text-purple-600 dark:text-purple-400"
      }
    case "Bills":
      return {
        iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:bg-amber-500/15",
        glow: "rgba(245, 158, 11, 0.12)",
        bar: "bg-gradient-to-r from-amber-500 to-amber-400",
        accent: "text-amber-600 dark:text-amber-400"
      }
    case "Subscriptions":
      return {
        iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 dark:bg-sky-500/15",
        glow: "rgba(56, 189, 248, 0.12)",
        bar: "bg-gradient-to-r from-sky-500 to-cyan-400",
        accent: "text-sky-600 dark:text-sky-400"
      }
    case "Entertainment":
      return {
        iconBg: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20 dark:bg-fuchsia-500/15",
        glow: "rgba(217, 70, 239, 0.12)",
        bar: "bg-gradient-to-r from-fuchsia-500 to-pink-400",
        accent: "text-fuchsia-600 dark:text-fuchsia-400"
      }
    case "Shopping":
      return {
        iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:bg-emerald-500/15",
        glow: "rgba(16, 185, 129, 0.12)",
        bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
        accent: "text-emerald-600 dark:text-emerald-400"
      }
    default:
      return {
        iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:bg-indigo-500/15",
        glow: "rgba(99, 102, 241, 0.12)",
        bar: "bg-gradient-to-r from-indigo-500 to-blue-400",
        accent: "text-indigo-600 dark:text-indigo-400"
      }
  }
}

export default function BudgetsView({
  budgetLimit,
  setBudgetLimit,
  budgetPercent,
  totalExpense,
  currSym = "₹",
  multiplier = 1,
  categoryBudgets = {},
  handleUpdateCategoryBudget,
  setIsEnvelopeModalOpen,
  savingsGoals = [],
  handleUpdateSavingsGoals,
  setIsSavingsGoalsOpen,
  displayExpenses = []
}) {
  const [editingCategory, setEditingCategory] = useState(null)
  const [tempLimit, setTempLimit] = useState("")
  const [editingMonthlyLimit, setEditingMonthlyLimit] = useState(null)

  // Calculate actual spend per category
  const categorySpending = useMemo(() => {
    const map = {}
    if (Array.isArray(displayExpenses)) {
      displayExpenses.forEach(tx => {
        if (tx.type === 'expense') {
          map[tx.category] = (map[tx.category] || 0) + (Number(tx.amount) || 0)
        }
      })
    }
    return map
  }, [displayExpenses])

  const categories = Object.keys(categoryBudgets)

  // Quick summary aggregates
  const totalAllocated = useMemo(() => {
    return Object.values(categoryBudgets || {}).reduce((sum, v) => sum + ((Number(v) || 0) * multiplier), 0)
  }, [categoryBudgets, multiplier])

  const budgetedCategoriesCount = useMemo(() => {
    return Object.values(categoryBudgets || {}).filter(v => Number(v) > 0).length
  }, [categoryBudgets])

  const handleStartEdit = (category, currentLimit) => {
    setEditingCategory(category)
    setTempLimit(String(Math.round(currentLimit * multiplier)))
  }

  // Quick Deposit Handler with Confetti on reaching target
  const handleQuickDeposit = (goalId, depositVal = 100) => {
    const updated = savingsGoals.map(g => {
      if (g.id === goalId) {
        const baseDepositVal = depositVal / multiplier
        const nextAmount = Math.min(g.targetAmount, (g.currentAmount || 0) + baseDepositVal)
        if (nextAmount >= g.targetAmount && (g.currentAmount || 0) < g.targetAmount) {
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            })
          } catch { /* confetti may not be available */ }
        }
        return { ...g, currentAmount: nextAmount }
      }
      return g
    })
    handleUpdateSavingsGoals(updated)
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Section: Overall Monthly Budget Status */}
      <div className="bg-surface-1 border border-border-default rounded-2xl p-5 sm:p-6 lg:p-7 shadow-elevation-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div>
            <h2 className="text-[19px] font-bold text-text-primary tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Overall Monthly Budget</span>
            </h2>
            <p className="text-xs text-text-secondary font-normal mt-0.5">
              Target monthly spending ceiling across all categories
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-inset border border-border-default focus-within:border-blue-500/70 transition-colors">
              <span className="text-xs text-text-secondary font-medium">Limit:</span>
              <span className="text-xs font-semibold text-text-primary font-mono">{currSym}</span>
              <input
                type="text"
                placeholder="0"
                value={
                  editingMonthlyLimit !== null
                    ? editingMonthlyLimit
                    : (budgetLimit > 0 ? formatNumber(Math.round(budgetLimit * multiplier), currSym, 0, 0) : "")
                }
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  setEditingMonthlyLimit(val)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingMonthlyLimit !== null) {
                      const val = editingMonthlyLimit.replace(/[^0-9]/g, '')
                      setBudgetLimit((Number(val) || 0) / multiplier)
                      setEditingMonthlyLimit(null)
                    }
                  } else if (e.key === 'Escape') {
                    setEditingMonthlyLimit(null)
                  }
                }}
                className="w-24 bg-transparent text-xs font-mono font-bold text-text-primary text-right outline-none placeholder:text-text-muted"
              />
              {editingMonthlyLimit !== null && (
                <button
                  type="button"
                  onClick={() => {
                    const val = editingMonthlyLimit.replace(/[^0-9]/g, '')
                    setBudgetLimit((Number(val) || 0) / multiplier)
                    setEditingMonthlyLimit(null)
                  }}
                  className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors shadow-elevation-sm ml-1"
                  title="Save Limit (Enter)"
                >
                  ↵
                </button>
              )}
            </div>
            <button
              onClick={() => setIsEnvelopeModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-hover active:bg-surface-active text-text-primary border border-border-default hover:border-border-strong text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-elevation-sm"
            >
              <Sliders className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Envelope Manager</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-4">
          <div className="p-4 rounded-xl bg-surface-inset/90 border border-border-subtle space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.06em]">Total Spent</span>
            <p className="text-[24px] sm:text-[28px] font-extrabold text-text-primary font-mono leading-tight truncate">
              <AnimatedCounter value={totalExpense} prefix={currSym} />
            </p>
            <p className="text-xs text-text-secondary font-normal">Active month outlays</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-inset/90 border border-border-subtle space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.06em]">Remaining Budget</span>
            <p className={`text-[24px] sm:text-[28px] font-extrabold font-mono leading-tight truncate ${
              budgetLimit <= 0
                ? "text-text-muted"
                : (budgetLimit * multiplier - totalExpense) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {budgetLimit <= 0 ? "—" : <AnimatedCounter value={Math.max(0, (budgetLimit * multiplier) - totalExpense)} prefix={currSym} />}
            </p>
            <p className="text-xs text-text-secondary font-normal">{budgetLimit <= 0 ? "No limit configured" : "Remaining before limit"}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-inset/90 border border-border-subtle space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.06em]">Budget Used</span>
            <p className="text-[24px] sm:text-[28px] font-extrabold text-text-primary font-mono leading-tight truncate">
              {budgetLimit <= 0 ? "0%" : <AnimatedCounter value={budgetPercent} decimals={0} suffix="%" />}
            </p>
            <p className="text-xs text-text-secondary font-normal">{budgetLimit <= 0 ? "Of monthly allowance" : "Of monthly limit"}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-950/80 border border-border-subtle rounded-full overflow-hidden p-[1px]">
            <div
              style={{ width: `${budgetPercent}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent > 90
                  ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                  : budgetPercent > 75
                  ? "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                  : "bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
              }`}
            />
          </div>
          {budgetPercent > 90 && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 pt-0.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Notice: Monthly budget limit exceeded</span>
            </p>
          )}
        </div>
      </div>

      {/* Category Envelopes Grid */}
      <div className="bg-surface-1 border border-border-default rounded-2xl p-5 sm:p-6 lg:p-7 shadow-elevation-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                <Sliders className="h-4 w-4" />
              </div>
              <span>Category Budgets</span>
            </h2>
            <p className="text-xs text-text-secondary font-normal mt-1">
              Adjust monthly allowances and monitor category spending across envelopes
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 border border-border-default text-xs">
              <span className="text-text-muted font-normal">Allocated:</span>
              <span className="font-semibold font-mono text-text-primary">
                {currSym}{formatNumber(totalAllocated, currSym, 0, 0)}
              </span>
              <span className="text-text-muted text-[11px]">
                ({budgetedCategoriesCount}/{categories.length} set)
              </span>
            </div>
            <button
              onClick={() => setIsEnvelopeModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-hover active:bg-surface-active text-text-primary border border-border-default hover:border-border-strong text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <Sliders className="h-3.5 w-3.5 text-brand" />
              <span>Manage All</span>
            </button>
          </div>
        </div>

        {/* Premium Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-4.5">
          {categories.map((cat) => {
            const rawLimit = Number(categoryBudgets[cat]) || 0
            const limit = rawLimit * multiplier
            const spent = categorySpending[cat] || 0
            const hasLimit = rawLimit > 0
            const percent = hasLimit ? Math.min((spent / limit) * 100, 100) : 0
            const rawPercent = hasLimit ? (spent / limit) * 100 : 0
            const remaining = limit - spent
            const isEditing = editingCategory === cat
            const theme = getCategoryCardTheme(cat)
            const isOver = hasLimit && spent > limit
            const isNear = hasLimit && rawPercent >= 80 && !isOver

            return (
              <div
                key={cat}
                className={`relative p-5 rounded-2xl bg-surface-2/70 dark:bg-surface-2/40 backdrop-blur-sm border transition-all duration-300 flex flex-col justify-between group overflow-hidden ${
                  isOver
                    ? "border-rose-500/30 hover:border-rose-500/50 shadow-sm shadow-rose-500/5 hover:shadow-elevation-md"
                    : isEditing
                    ? "border-brand shadow-sm ring-2 ring-brand/10"
                    : "border-border-default/80 hover:border-border-strong hover:shadow-elevation-md"
                }`}
              >
                {/* Ambient Category Glow */}
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                  style={{ backgroundColor: theme.glow }}
                />

                {/* Top Row: Category Icon, Name & Status Pill */}
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs transition-transform duration-200 group-hover:scale-105 ${theme.iconBg}`}
                    >
                      {getCategoryIcon(cat)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary tracking-tight truncate">
                        {cat}
                      </h3>
                      <p className="text-[11px] text-text-secondary truncate mt-0.5 font-normal">
                        {spent > 0 ? "Active outlays" : "No outlays yet"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {hasLimit ? (
                    isOver ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {rawPercent.toFixed(0)}%
                      </span>
                    ) : isNear ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {rawPercent.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {rawPercent.toFixed(0)}%
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-surface-3 text-text-muted border border-border-default shrink-0">
                      No limit
                    </span>
                  )}
                </div>

                {/* Middle Row: Primary Spend & Limit */}
                <div className="space-y-2.5 my-4 relative z-10">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-medium text-text-muted mr-1">{currSym}</span>
                      <span className="text-2xl font-bold font-mono tracking-tight text-text-primary leading-none">
                        {formatNumber(spent, currSym, 0, 0)}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-text-secondary text-right">
                      {hasLimit ? (
                        <span>
                          <span className="text-text-muted font-sans mr-1">of</span>
                          <span className="font-semibold text-text-primary">
                            {currSym}{formatNumber(limit, currSym, 0, 0)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-text-muted font-sans">No budget set</span>
                      )}
                    </div>
                  </div>

                  {/* High Fidelity Progress Bar */}
                  <div className="h-2 w-full bg-surface-inset border border-border-subtle/70 rounded-full overflow-hidden p-[1px] relative">
                    {hasLimit ? (
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isOver
                            ? "bg-gradient-to-r from-rose-500 to-red-600 shadow-sm shadow-rose-500/30"
                            : isNear
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm shadow-amber-500/20"
                            : theme.bar
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    ) : (
                      <div className="h-full w-full bg-transparent" />
                    )}
                  </div>
                </div>

                {/* Bottom Row: Remaining Status & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-border-default/70 relative z-10 min-h-[38px]">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-text-muted">
                          {currSym}
                        </span>
                        <input
                          type="text"
                          autoFocus
                          value={tempLimit}
                          placeholder="0"
                          onChange={(e) => setTempLimit(e.target.value.replace(/[^0-9]/g, ''))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingCategory(null)
                              const val = tempLimit.replace(/[^0-9]/g, '')
                              handleUpdateCategoryBudget(cat, (Number(val) || 0) / multiplier)
                            } else if (e.key === 'Escape') {
                              setEditingCategory(null)
                            }
                          }}
                          className="w-full bg-surface-1 border border-brand rounded-lg pl-6 pr-2 py-1 text-xs font-mono font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand/30 shadow-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null)
                          const val = tempLimit.replace(/[^0-9]/g, '')
                          handleUpdateCategoryBudget(cat, (Number(val) || 0) / multiplier)
                        }}
                        className="p-1.5 rounded-lg bg-brand hover:bg-brand-hover active:bg-brand-active text-white cursor-pointer transition-colors shadow-xs"
                        title="Save (Enter)"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="p-1.5 rounded-lg bg-surface-3 hover:bg-surface-hover text-text-muted hover:text-text-primary cursor-pointer transition-colors border border-border-default"
                        title="Cancel (Esc)"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Status Buffer */}
                      <div className="flex items-center gap-1.5 text-xs min-w-0">
                        {hasLimit ? (
                          !isOver ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-text-primary font-medium truncate font-mono">
                                {currSym}{formatNumber(remaining, currSym, 0, 0)}
                              </span>
                              <span className="text-text-muted text-[11px] truncate font-sans">left</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span className="text-rose-500 font-semibold truncate font-mono">
                                {currSym}{formatNumber(Math.abs(remaining), currSym, 0, 0)}
                              </span>
                              <span className="text-rose-400 text-[11px] truncate font-sans">over</span>
                            </>
                          )
                        ) : (
                          <span className="text-[11px] text-text-muted flex items-center gap-1.5 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-border-strong shrink-0" />
                            <span>Unallocated</span>
                          </span>
                        )}
                      </div>

                      {/* Quick Action Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat, rawLimit)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                          hasLimit
                            ? "bg-surface-3 hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-default hover:border-border-strong"
                            : "bg-brand/10 hover:bg-brand/20 active:bg-brand/30 text-brand border border-brand/20 shadow-xs"
                        }`}
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>{hasLimit ? "Edit" : "Set Limit"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Savings Goals & Milestones */}
      <div className="bg-surface-1 border border-border-default rounded-2xl p-5 sm:p-6 lg:p-7 shadow-elevation-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle mb-5">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-tight flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Savings Goals & Milestones</span>
            </h2>
            <p className="text-xs text-text-secondary font-normal mt-0.5">
              Track progress toward wealth targets
            </p>
          </div>
          <button
            onClick={() => setIsSavingsGoalsOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold transition-all shadow-elevation-md shadow-blue-600/30 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Manage Goals</span>
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="text-center py-14 px-4 rounded-xl bg-surface-inset border border-dashed border-border-default space-y-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 inline-flex text-emerald-600 dark:text-emerald-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">No savings goals created yet</p>
              <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
                Define savings targets for upcoming trips, emergency funds, or gadgets and track them in real time.
              </p>
            </div>
            <button
              onClick={() => setIsSavingsGoalsOpen(true)}
              className="mt-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold transition-all shadow-elevation-md shadow-blue-600/30 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Your First Goal</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => {
              const target = (goal.targetAmount || 1) * multiplier
              const current = (goal.currentAmount || 0) * multiplier
              const percent = Math.min((current / target) * 100, 100)
              const isCompleted = current >= target
              const style = getGoalStyle(goal)

              return (
                <div
                  key={goal.id}
                  className="bg-surface-2/70 dark:bg-surface-2/40 border border-border-default/80 hover:border-border-strong rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between space-y-4 group hover:shadow-elevation-sm"
                >
                  {/* Top Header: Icon Squircle + Title & Target Date */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${style.squircle}`}>
                        {style.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-text-primary leading-snug truncate">
                          {goal.title}
                        </h3>
                        {goal.targetDate && (
                          <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{goal.targetDate}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-positive/10 text-positive border border-positive/20 shrink-0 uppercase">
                        Completed
                      </span>
                    ) : (
                      <span className="text-[13px] font-mono font-semibold text-text-secondary shrink-0">
                        {percent.toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {/* Progress & Amount Numbers */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline pt-0.5">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[11px] font-semibold font-mono text-text-muted mr-0.5">{currSym}</span>
                        <span className="text-[20px] font-bold text-text-primary font-mono tracking-tight leading-none">
                          {formatNumber(current, currSym, 0, 0)}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-text-muted flex items-center gap-1.5">
                        <span>of</span>
                        <span className="font-semibold text-text-primary">
                          {currSym}{formatNumber(target, currSym, 0, 0)}
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-surface-inset border border-border-subtle rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-500 opacity-90 ${
                          isCompleted ? 'bg-positive' : style.barGradient
                        }`}
                      />
                    </div>
                  </div>

                  {/* Bottom Row: Remaining to target & Deposit button */}
                  <div className="flex items-center justify-between pt-3 border-t border-border-default/70 text-xs">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-text-primary font-medium">{currSym}{formatNumber(Math.max(0, target - current), currSym, 0, 0)}</span>
                      <span className="text-text-muted font-normal text-[11px]">to target</span>
                    </div>
                    {!isCompleted && (
                      <button
                        onClick={() => handleQuickDeposit(goal.id, 100)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-surface-2 hover:bg-brand hover:text-white active:scale-95 text-text-secondary border border-border-default/60 hover:border-brand rounded-md transition-all cursor-pointer flex items-center gap-1 group/dep"
                      >
                        <Plus className="h-3 w-3 text-text-muted group-hover/dep:text-white transition-colors" />
                        <span>Deposit {currSym}100</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
