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

  const CANONICAL_CATEGORIES = useMemo(() => [
    'Food',
    'Travel',
    'Bills',
    'Subscriptions',
    'Entertainment',
    'Shopping',
    'Other'
  ], [])

  const categories = useMemo(() => {
    if (!categoryBudgets || Object.keys(categoryBudgets).length === 0) {
      return CANONICAL_CATEGORIES
    }
    const existingKeys = Object.keys(categoryBudgets)
    const combined = [...CANONICAL_CATEGORIES]
    existingKeys.forEach(k => {
      if (!combined.includes(k)) combined.push(k)
    })
    return combined
  }, [categoryBudgets, CANONICAL_CATEGORIES])

  // Quick summary aggregates: strictly sums positive configured limits
  const totalAllocated = useMemo(() => {
    return Object.values(categoryBudgets || {}).reduce((sum, v) => {
      const val = Number(v) || 0
      return sum + (val > 0 ? val * multiplier : 0)
    }, 0)
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
            <p className="text-xs text-text-secondary font-normal">Total monthly spend</p>
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

      {/* Category Budgets Grid */}
      <div className="bg-surface-1 border border-border-default rounded-2xl p-5 sm:p-6 lg:p-7 shadow-elevation-sm">
        {/* Header Summary: Compact, readable, without excessive pill styling */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                <Sliders className="h-4 w-4" />
              </div>
              <span>Category Budgets</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-text-secondary mt-1 flex-wrap">
              <span>Adjust monthly allowances and monitor category spending</span>
              <span className="text-border-strong hidden sm:inline">•</span>
              <span className="font-semibold text-text-primary font-mono">
                {currSym}{formatNumber(totalAllocated, currSym, 0, 0)} allocated
              </span>
              <span className="text-border-strong">•</span>
              <span className="text-text-secondary">
                {budgetedCategoriesCount} of {categories.length} categories
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsEnvelopeModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-hover active:bg-surface-active text-text-secondary hover:text-text-primary border border-border-default hover:border-border-strong text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Sliders className="h-3.5 w-3.5 text-text-muted" />
              <span>Manage All</span>
            </button>
          </div>
        </div>

        {/* Clean, Consistent Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5">
          {categories.map((cat) => {
            const rawLimit = Number(categoryBudgets[cat]) || 0
            const limit = rawLimit * multiplier
            const spent = categorySpending[cat] || 0
            const hasLimit = rawLimit > 0

            // Budget Threshold Policy:
            // - Over budget: spent > limit (restrained red warning, clamped progress bar)
            // - Budget reached: spent === limit (amber warning, 100% capacity)
            // - Approaching limit: 80% <= percent < 100% (amber notice)
            // - Healthy / Within limit: percent < 80% (calm emerald)
            // - No limit configured: neutral non-progress divider, clear "Set limit" action
            // Robust floating-point and rounding calculations:
            // Guard against epsilon differences (e.g. 2999.9999999 vs 3000)
            const rawPercent = hasLimit ? (spent / limit) * 100 : 0
            const diff = limit - spent
            const isExact = hasLimit && Math.abs(diff) < 0.01
            const isOver = hasLimit && !isExact && spent > limit
            const isNear = hasLimit && !isOver && !isExact && rawPercent >= 80

            // If spending is below limit, cap percent display at 99% to prevent misleading "100% used" with money left
            const percentDisplay = isExact || isOver
              ? Math.round(rawPercent)
              : Math.min(99, Math.round(rawPercent))

            const remaining = isExact ? 0 : Math.max(0, diff)
            const overspent = isExact ? 0 : Math.max(0, spent - limit)

            const isEditing = editingCategory === cat
            const theme = getCategoryCardTheme(cat)

            // Progress bar and status label styling
            let barColor = "bg-emerald-500 dark:bg-emerald-400"
            let statusText = `${percentDisplay}% used`
            let statusColor = "text-text-secondary"

            if (isOver) {
              barColor = "bg-rose-500 dark:bg-rose-400"
              statusText = "Over budget"
              statusColor = "text-rose-600 dark:text-rose-400 font-semibold"
            } else if (isExact) {
              barColor = "bg-amber-500 dark:bg-amber-400"
              statusText = "Budget reached"
              statusColor = "text-amber-600 dark:text-amber-400 font-semibold"
            } else if (isNear) {
              barColor = "bg-amber-500 dark:bg-amber-400"
              statusText = `${percentDisplay}% used`
              statusColor = "text-amber-600 dark:text-amber-400 font-medium"
            }

            return (
              <div
                key={cat}
                className={`p-5 rounded-2xl bg-surface-2/60 dark:bg-surface-2/30 border transition-all duration-200 flex flex-col justify-between ${
                  isOver
                    ? "border-rose-300/80 dark:border-rose-900/60 shadow-xs"
                    : isEditing
                    ? "border-brand ring-2 ring-brand/10 shadow-xs"
                    : "border-border-default/80 hover:border-border-strong shadow-xs"
                }`}
              >
                {/* 1. Category Name, Icon & Top Action */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${theme.iconBg}`}
                    >
                      {getCategoryIcon(cat)}
                    </div>
                    <h3 className="text-base font-bold text-text-primary tracking-tight truncate">
                      {cat}
                    </h3>
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat, rawLimit)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                        hasLimit
                          ? "text-text-secondary hover:text-text-primary hover:bg-surface-3"
                          : "text-brand hover:text-brand-hover hover:bg-brand/10 font-semibold"
                      }`}
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>{hasLimit ? "Edit" : "Set limit"}</span>
                    </button>
                  )}
                </div>

                {/* 2. Primary Financial Value: Spent */}
                <div className="my-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block mb-0.5">
                    Spent
                  </span>
                  <div className="text-2xl sm:text-[26px] font-bold font-mono tracking-tight text-text-primary leading-tight">
                    {currSym}{formatNumber(spent, currSym, 0, 0)}
                  </div>
                </div>

                {/* 3. Monthly Limit (Display or Inline Edit Input) */}
                <div className="mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block mb-0.5">
                    Monthly limit
                  </span>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 mt-1">
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
                    <div className="text-sm font-semibold font-mono text-text-secondary">
                      {hasLimit ? (
                        <span>{currSym}{formatNumber(limit, currSym, 0, 0)}</span>
                      ) : (
                        <span className="text-xs font-normal font-sans text-text-muted">No monthly limit</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Progress Bar & 5. Remaining / Status Row */}
                <div className="pt-1">
                  {hasLimit ? (
                    <div className="space-y-1.5">
                      {/* Slim, Understated Progress Bar (Clamped to 100% max fill) */}
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(100, Math.max(0, rawPercent))}%` }}
                        />
                      </div>

                      {/* Status / % Used on left, Remaining on right */}
                      <div className="flex items-center justify-between text-xs pt-1 min-h-[22px]">
                        <span className={statusColor}>
                          {statusText}
                        </span>
                        <span className={`font-mono font-semibold ${
                          isOver
                            ? "text-rose-600 dark:text-rose-400"
                            : isExact
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {isOver
                            ? `${currSym}${formatNumber(overspent, currSym, 0, 0)} over budget`
                            : isExact
                            ? `${currSym}0 remaining`
                            : `${currSym}${formatNumber(remaining, currSym, 0, 0)} remaining`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {/* Neutral non-progress placeholder preserving consistent card height */}
                      <div className="h-1.5 w-full flex items-center">
                        <div className="w-full border-t border-dashed border-border-default/60" />
                      </div>

                      {/* Unallocated Status Row */}
                      <div className="flex items-center justify-between text-xs pt-1 min-h-[22px]">
                        <span className="text-text-muted font-normal">
                          Unallocated
                        </span>
                        <span className="text-text-muted font-mono">
                          —
                        </span>
                      </div>
                    </div>
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
