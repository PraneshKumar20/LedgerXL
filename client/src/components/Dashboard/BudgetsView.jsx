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
  Sparkles
} from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"
import { getCategoryStyle } from "../../utils/categoryColors"

// Helper to resolve clean, theme-aligned icons and styles for savings goals
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

// Category progress bar gradient mapping to provide visual distinction
const getCategoryBarGradient = (cat, percent) => {
  if (percent >= 100) {
    return "bg-gradient-to-r from-rose-600 via-red-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.45)]"
  }
  if (percent >= 90) {
    return "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.35)]"
  }
  if (percent >= 80) {
    return "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.35)]"
  }
  switch (cat) {
    case "Travel":
      return "bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
    case "Shopping":
      return "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
    case "Food":
      return "bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
    case "Bills":
      return "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
    case "Entertainment":
      return "bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400 shadow-[0_0_8px_rgba(192,132,252,0.3)]"
    case "Other":
      return "bg-gradient-to-r from-slate-500 via-sky-500 to-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.25)]"
    default:
      return "bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
  }
}

// Percentage status indicator badge style
const getPercentBadge = (percent) => {
  if (percent >= 90) {
    return "bg-rose-500/15 text-rose-400 border-rose-500/30"
  }
  if (percent >= 80) {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30"
  }
  return "bg-surface-2 text-text-primary border-border-default/60"
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
          } catch (e) {}
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
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 lg:p-7 shadow-elevation-sm">
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

          <div className="flex items-center gap-2.5">
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
              className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-hover text-text-primary border border-border-default text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-elevation-sm"
            >
              <Sliders className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Envelope Manager</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-surface-inset/90 border border-border-subtle space-y-1">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.06em]">Total Spent</span>
            <p className="text-[22px] sm:text-[26px] font-extrabold text-text-primary font-mono leading-tight">
              <AnimatedCounter value={totalExpense} prefix={currSym} />
            </p>
            <p className="text-xs text-text-secondary font-normal">Active month outlays</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-surface-inset/90 border border-border-subtle space-y-1">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.06em]">Remaining Buffer</span>
            <p className={`text-[22px] sm:text-[26px] font-extrabold font-mono leading-tight ${
              budgetLimit <= 0
                ? "text-text-muted"
                : (budgetLimit * multiplier - totalExpense) >= 0 ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.25)]' : 'text-rose-600 dark:text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.25)]'
            }`}>
              {budgetLimit <= 0 ? "—" : <AnimatedCounter value={Math.max(0, (budgetLimit * multiplier) - totalExpense)} prefix={currSym} />}
            </p>
            <p className="text-xs text-text-secondary font-normal">{budgetLimit <= 0 ? "No limit configured" : "Remaining before limit"}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-surface-inset/90 border border-border-subtle space-y-1">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.06em]">Quota Utilized</span>
            <p className="text-[22px] sm:text-[26px] font-extrabold text-text-primary font-mono leading-tight">
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
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 lg:p-7 shadow-elevation-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-5">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-tight flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Category Budgets</span>
            </h2>
            <p className="text-xs text-text-secondary font-normal mt-0.5">
              Adjust monthly allowances and monitor category velocity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {categories.map((cat) => {
            const rawLimit = categoryBudgets[cat] || 0
            const limit = rawLimit * multiplier
            const spent = categorySpending[cat] || 0
            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
            const remaining = limit - spent
            const colors = getCategoryStyle(cat)
            const isEditing = editingCategory === cat
            const barGradient = getCategoryBarGradient(cat, percent)
            const percentBadgeClass = getPercentBadge(percent)

            return (
              <div
                key={cat}
                className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-surface-2 to-surface-inset border border-border-subtle hover:border-border-strong transition-all duration-200 space-y-3.5 group hover:shadow-elevation-md dark:hover:shadow-black/40 hover:-translate-y-0.5"
              >
                {/* Header: Category Badge with colored dot + Percentage Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded border ${colors.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                    <span>{cat}</span>
                  </span>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${percentBadgeClass}`}>
                    {percent.toFixed(0)}%
                  </span>
                </div>

                {/* Amount & Limit Row */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline pt-0.5">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-semibold font-mono text-text-secondary">{currSym}</span>
                      <span className="text-[21px] sm:text-[22px] font-bold text-text-primary font-mono tracking-tight leading-none">
                        {formatNumber(spent, currSym, 0, 0)}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-text-secondary flex items-center gap-1">
                      <span className="text-[11px]">of</span>
                      <span className="font-semibold text-text-primary px-1.5 py-0.5 rounded bg-surface-2/60 border border-border-strong/50">
                        {currSym}{formatNumber(limit, currSym, 0, 0)}
                      </span>
                    </div>
                  </div>

                  {/* High fidelity progress bar */}
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-950/80 border border-border-subtle rounded-full overflow-hidden p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barGradient}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Row: Remaining buffer & Edit button */}
                <div className="flex items-center justify-between pt-3 border-t border-border-default/70 text-xs">
                  <div className="flex items-center gap-1.5 font-mono">
                    {remaining >= 0 ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block shrink-0" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currSym}{formatNumber(remaining, currSym, 0, 0)}</span>
                        <span className="text-text-secondary font-normal text-[11px]">left</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 inline-block shrink-0" />
                        <span className="text-rose-600 dark:text-rose-400 font-bold">-{currSym}{formatNumber(Math.abs(remaining), currSym, 0, 0)}</span>
                        <span className="text-rose-600/80 dark:text-rose-400/80 font-normal text-[11px]">over</span>
                      </>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        value={tempLimit}
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
                        className="w-20 bg-surface-3 border border-blue-500/70 rounded-md px-2 py-0.5 text-text-primary text-xs font-mono text-right outline-none ring-1 ring-blue-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null)
                          const val = tempLimit.replace(/[^0-9]/g, '')
                          handleUpdateCategoryBudget(cat, (Number(val) || 0) / multiplier)
                        }}
                        className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors shadow-elevation-sm"
                        title="Save Target (Enter)"
                      >
                        ↵
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(cat, rawLimit)}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium text-text-secondary hover:text-text-primary bg-surface-2/40 hover:bg-surface-hover border border-border-default/40 hover:border-border-strong transition-all flex items-center gap-1 cursor-pointer group/btn shadow-elevation-sm"
                    >
                      <Edit3 className="h-2.5 w-2.5 text-text-secondary group-hover/btn:text-blue-500 dark:group-hover/btn:text-blue-400 transition-colors" />
                      <span>Edit Limit</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Savings Goals & Milestones */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 lg:p-7 shadow-elevation-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-5">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary tracking-tight flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Savings Goals & Milestones</span>
            </h2>
            <p className="text-xs text-text-secondary font-normal mt-0.5">
              Track progress toward wealth targets
            </p>
          </div>
          <button
            onClick={() => setIsSavingsGoalsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold transition-all shadow-elevation-md shadow-blue-600/30 cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => {
              const target = (goal.targetAmount || 1) * multiplier
              const current = (goal.currentAmount || 0) * multiplier
              const percent = Math.min((current / target) * 100, 100)
              const isCompleted = current >= target
              const style = getGoalStyle(goal)

              return (
                <div
                  key={goal.id}
                  className="bg-gradient-to-b from-surface-2 to-surface-inset border border-border-subtle hover:border-border-strong rounded-xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between space-y-4 group hover:shadow-elevation-md dark:hover:shadow-black/40 hover:-translate-y-0.5"
                >
                  {/* Top Header: Icon Squircle + Title & Target Date */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${style.squircle}`}>
                        {style.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-[15px] font-bold text-text-primary leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                          {goal.title}
                        </h3>
                        {goal.targetDate && (
                          <p className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-1.5 font-mono">
                            <Calendar className="h-3 w-3 text-text-muted shrink-0" />
                            <span>{goal.targetDate}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shrink-0 uppercase dark:border-emerald-800/40">
                        Completed
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border shrink-0 ${
                        percent >= 75 ? style.percentBadge : 'bg-surface-2 text-text-primary border-border-default/60'
                      }`}>
                        {percent.toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {/* Progress & Amount Numbers */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline pt-0.5">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xs font-semibold font-mono text-text-secondary">{currSym}</span>
                        <span className="text-[21px] sm:text-[22px] font-bold text-text-primary font-mono tracking-tight leading-none">
                          {formatNumber(current, currSym, 0, 0)}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-text-secondary flex items-center gap-1">
                        <span className="text-[11px]">of</span>
                        <span className="font-semibold text-text-primary px-1.5 py-0.5 rounded bg-surface-2/60 border border-border-strong/50">
                          {currSym}{formatNumber(target, currSym, 0, 0)}
                        </span>
                        <span className={`font-bold ml-1 ${style.accentColor}`}>
                          · {percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-950/80 border border-border-subtle rounded-full overflow-hidden p-[1px]">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]' 
                            : style.barGradient
                        }`}
                      />
                    </div>
                  </div>

                  {/* Bottom Row: Remaining to target & Deposit button */}
                  <div className="flex items-center justify-between pt-3 border-t border-border-default/70 text-xs">
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-text-primary font-semibold">{currSym}{formatNumber(Math.max(0, target - current), currSym, 0, 0)}</span>
                      <span className="text-text-secondary font-normal text-[11px]">to target</span>
                    </div>
                    {!isCompleted && (
                      <button
                        onClick={() => handleQuickDeposit(goal.id, 100)}
                        className="px-2.5 py-1 text-xs font-semibold bg-surface-2 hover:bg-blue-600 hover:text-white active:scale-95 text-text-primary border border-border-default/60 hover:border-blue-500 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-elevation-sm group/dep"
                      >
                        <Plus className="h-3 w-3 text-blue-600 dark:text-blue-400 group-hover/dep:text-white transition-colors" />
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
