import { useState, useMemo } from "react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Gauge, 
  Activity, 
  Clock, 
  Percent,
  PieChart as PieIcon,
  ChevronRight,
  ArrowRight,
  Edit2,
  Trash2,
  Repeat,
  Sparkles,
  X
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts"
import FinancialHealthCard from "./FinancialHealthCard"
import AnimatedCounter from "../ui/AnimatedCounter"
import { formatNumber } from "../../utils/formatUtils"
import { getCategoryStyle } from "../../utils/categoryColors"
import { useTheme } from "../../context/ThemeContext"

// Custom Chart Tooltip declared outside render to ensure stable identity
const CustomBarTooltip = ({ active, payload, label, currSym = "₹" }) => {
  if (active && payload && payload.length) {
    const inc = payload.find(p => p.dataKey === 'income')?.value || 0
    const exp = payload.find(p => p.dataKey === 'expense')?.value || 0
    return (
      <div className="bg-surface-1 border border-border-default p-3 rounded-xl shadow-elevation-lg min-w-[150px]">
        <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary">Income</span>
            <span className="text-emerald-400 font-mono font-semibold">{currSym}{formatNumber(inc, currSym, 0, 0)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary">Expense</span>
            <span className="text-rose-400 font-mono font-semibold">{currSym}{formatNumber(exp, currSym, 0, 0)}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function OverviewView({
  balance,
  totalIncome,
  totalExpense,
  currSym = "₹",
  multiplier = 1,
  incomeShare = 88,
  budgetPercent = 43,
  budgetLimit = 286541,
  trendData = [],
  categoryData = [],
  totalCategoryExpense = 123737,
  activeCategoryIndex: propActiveCategoryIndex,
  setActiveCategoryIndex: propSetActiveCategoryIndex,
  renderActiveShape: propRenderActiveShape,
  displayExpenses = [],
  openEditModal,
  handleDeleteTransaction,
  setActiveTab,
  savingsRate,
  avgTransaction,
  topCategory
}) {
  const { isDark } = useTheme()
  const [internalActiveIndex, setInternalActiveIndex] = useState(null)
  const activeCategoryIndex = propActiveCategoryIndex !== undefined ? propActiveCategoryIndex : internalActiveIndex
  const setActiveCategoryIndex = propSetActiveCategoryIndex || setInternalActiveIndex

  const [isGuideDismissed, setIsGuideDismissed] = useState(() => {
    try {
      return localStorage.getItem("ledgerxl_hide_guide_banner") === "true"
    } catch {
      return false
    }
  })

  const handleDismissGuide = () => {
    setIsGuideDismissed(true)
    try {
      localStorage.setItem("ledgerxl_hide_guide_banner", "true")
    } catch {
      // Ignore localStorage errors
    }
  }

  // High fidelity active donut slice shape with glowing outer halo
  const renderActiveShape = (props) => {
    if (propRenderActiveShape) return propRenderActiveShape(props)
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
    return (
      <g className="cursor-pointer transition-all duration-300">
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 3}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.35}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  // Y-Axis formatter: dynamically adapts to currency
  const formatYAxis = (val) => {
    if (val === 0) return '0'
    if (val >= 100000 && currSym === '₹') return `₹${Math.round(val / 100000)}L`
    if (val >= 1000) return `${currSym}${Math.round(val / 1000)}k`
    return `${currSym}${val}`
  }

  const effectiveLimit = budgetLimit * multiplier
  const remainingBuffer = Math.max(0, effectiveLimit - totalExpense)
  const expenseRatio = 100 - incomeShare
  const safePercent = Number.isFinite(budgetPercent) ? Math.max(0, budgetPercent) : 0

  const budgetStatusText = safePercent >= 100
    ? "Budget limit exceeded"
    : safePercent >= 85
    ? "Approaching budget limit"
    : "Within budget limit"

  const budgetStatusColorClass = safePercent >= 100
    ? "text-rose-600 dark:text-rose-400"
    : safePercent >= 85
    ? "text-amber-600 dark:text-amber-400"
    : "text-emerald-600 dark:text-emerald-400"

  const budgetProgressBarColorClass = safePercent >= 100
    ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
    : safePercent >= 85
    ? "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
    : "bg-emerald-500 dark:bg-emerald-400"

  // Spend Breakdown computed directly from live categoryData with canonical styling
  const computedCategoryExpense = useMemo(() => {
    return categoryData.reduce((acc, cat) => acc + cat.value, 0)
  }, [categoryData])

  const totalCatExpense = totalCategoryExpense > 0 ? totalCategoryExpense : computedCategoryExpense

  const displayCategories = useMemo(() => {
    if (!categoryData || categoryData.length === 0) return []
    return categoryData.map(cat => ({
      name: cat.name,
      value: cat.value,
      pct: totalCatExpense > 0 ? `${((cat.value / totalCatExpense) * 100).toFixed(1)}%` : "0%",
      color: getCategoryStyle(cat.name).base
    }))
  }, [categoryData, totalCatExpense])

  const categoriesCount = displayCategories.length

  const liveSavingsRate = savingsRate !== undefined ? Number(savingsRate).toFixed(1) : (totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : "0.0")
  const expenseCount = displayExpenses.filter(e => e.type === 'expense').length
  const liveAvgTicket = avgTransaction !== undefined ? avgTransaction : (expenseCount > 0 ? (totalExpense / expenseCount) : 0)
  const liveTopExpenseName = topCategory?.name || (categoryData[0]?.name ?? "None")

  // Recent Transactions Formatting & Top 5 Slice
  const formatTxDate = (dateStr) => {
    if (!dateStr) return "Recent"
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return "Recent"
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const recentTransactions = useMemo(() => {
    if (!Array.isArray(displayExpenses)) return []
    return [...displayExpenses]
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 5)
  }, [displayExpenses])

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Beginner Guide Banner */}
      {!isGuideDismissed && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface-1 border border-border-default shadow-elevation-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary">
                New to LedgerXL?
              </p>
              <p className="text-[11px] text-text-secondary truncate">
                Learn how to track spending, set budgets, and understand your cash flow in 2 minutes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("guide")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-hover border border-border-default text-xs font-semibold text-brand transition-colors cursor-pointer"
            >
              <span>How to use LedgerXL?</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDismissGuide}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
              aria-label="Hide guide banner"
              title="Hide guide banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* LEVEL 1 — FINANCIAL SNAPSHOT                       */}
      {/* Primary financial position: Net Balance & Budget  */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* TOTAL NET BALANCE CARD */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-elevation-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
                TOTAL NET BALANCE
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/40 dark:text-blue-400 flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl sm:text-[38px] font-bold text-text-primary font-mono tracking-tight leading-none truncate">
                <AnimatedCounter 
                  value={balance * multiplier} 
                  currencySymbol={currSym}
                  decimals={2} 
                />
              </div>
              <p className="text-xs sm:text-[13px] text-text-secondary font-normal mt-2">
                Current net position across active accounts
              </p>
            </div>

            {/* Income vs Expense Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  Income • {Math.round(incomeShare)}%
                </span>
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  Expense • {Math.round(expenseRatio)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${incomeShare}%` }} 
                  className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-l-full transition-all duration-500" 
                />
                <div 
                  style={{ width: `${expenseRatio}%` }} 
                  className="bg-rose-500 h-full rounded-r-full transition-all duration-500" 
                />
              </div>
            </div>
          </div>

          {/* Subtotals (Monthly Income & Monthly Expenses) */}
          <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-border-default">
            <div className="min-w-0">
              <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 truncate">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> Monthly Income
              </p>
              <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 leading-tight truncate">
                <AnimatedCounter value={totalIncome} prefix={currSym} decimals={2} />
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 truncate">
                <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" /> Monthly Expenses
              </p>
              <p className="text-lg sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1 leading-tight truncate">
                <AnimatedCounter value={totalExpense} prefix={currSym} decimals={2} />
              </p>
            </div>
          </div>
        </div>

        {/* MONTHLY BUDGET USED CARD */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-elevation-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
                MONTHLY BUDGET USED
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-400 flex items-center justify-center">
                <Gauge className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl sm:text-[38px] font-bold text-text-primary tracking-tight leading-none">
                <AnimatedCounter value={safePercent} decimals={0} />%
              </div>
              <p className="text-xs sm:text-[13px] text-text-secondary font-normal mt-2">
                {currSym}{formatNumber(Math.round(totalExpense), currSym, 0, 0)} spent of {currSym}{formatNumber(Math.round(effectiveLimit), currSym, 0, 0)} monthly allowance
              </p>
            </div>

            {/* Budget Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className={budgetStatusColorClass}>{budgetStatusText}</span>
                <span className="text-text-secondary font-mono">
                  {currSym}{formatNumber(Math.round(remainingBuffer), currSym, 0, 0)} remaining
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, budgetPercent)}%` }} 
                  className={`${budgetProgressBarColorClass} h-full rounded-full transition-all duration-500`} 
                />
              </div>
            </div>
          </div>

          {/* Subtotals (Remaining Budget & Monthly Limit) */}
          <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-border-default">
            <div className="min-w-0">
              <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 truncate">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> Remaining Budget
              </p>
              <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 leading-tight truncate">
                +{currSym}{formatNumber(Math.round(remainingBuffer), currSym, 0, 0)}
              </p>
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5 truncate">
                  <span className="text-xs text-blue-600 dark:text-blue-400">◎</span> Monthly Limit
                </p>
                <button
                  onClick={() => setActiveTab("budgets")}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-0.5 cursor-pointer shrink-0"
                >
                  <span>manage</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-text-primary font-mono mt-1 leading-tight truncate">
                {currSym}{formatNumber(Math.round(effectiveLimit), currSym, 0, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* LEVEL 2 — SPENDING OVERVIEW                        */}
      {/* Spend Wheel + Category Breakdown + 2x2 KPI Grid    */}
      {/* Unified Executive Card                             */}
      {/* ================================================== */}
      <div className="bg-surface-1 border border-border-default rounded-2xl p-5 sm:p-6 shadow-elevation-sm space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Spending Overview
              </h3>
              <p className="text-xs text-text-secondary font-normal">
                Category distribution of outflow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 self-start sm:self-auto">
            <div className="text-xs font-mono text-text-secondary flex items-center gap-2">
              <span className="font-bold text-text-primary">
                {currSym}{formatNumber(Math.round(totalCatExpense), currSym, 0, 0)}
              </span>
              <span className="text-text-muted">·</span>
              <span>{categoriesCount} categories</span>
            </div>

            <button
              onClick={() => setActiveTab("transactions")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/50 transition-colors text-xs font-semibold cursor-pointer"
            >
              <span>View Details</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Sided Layout: Donut & Category List (Left) + 2x2 KPI Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Side: Donut Wheel + Category Breakdown (7 cols on lg/xl) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-6 sm:gap-7">
            {/* Donut Chart with Centered Animated HUD */}
            <div className="relative w-[170px] h-[170px] sm:w-[185px] sm:h-[185px] shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke={isDark ? "#0f1523" : "#ffffff"}
                    strokeWidth={2}
                    activeIndex={activeCategoryIndex !== null ? activeCategoryIndex : -1}
                    activeShape={renderActiveShape}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                    onClick={(_, index) => setActiveCategoryIndex(activeCategoryIndex === index ? null : index)}
                  >
                    {displayCategories.map((entry, index) => {
                      const isSelected = activeCategoryIndex === index
                      const isAnySelected = activeCategoryIndex !== null
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          opacity={!isAnySelected || isSelected ? 1 : 0.35}
                          className="cursor-pointer transition-opacity duration-200"
                        />
                      )
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Animated HUD */}
              <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
                <AnimatePresence mode="wait">
                  {activeCategoryIndex !== null && displayCategories[activeCategoryIndex] ? (
                    <Motion.div
                      key={`active-${displayCategories[activeCategoryIndex].name}`}
                      initial={{ scale: 0.75, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.75, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col items-center justify-center text-center px-1"
                    >
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[95px]"
                        style={{ color: displayCategories[activeCategoryIndex].color }}
                      >
                        {displayCategories[activeCategoryIndex].name}
                      </span>
                      <span className="text-[16px] font-bold text-text-primary font-mono leading-tight mt-0.5">
                        {displayCategories[activeCategoryIndex].pct}
                      </span>
                    </Motion.div>
                  ) : (
                    <Motion.div
                      key="default-center"
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col items-center justify-center text-center"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-text-muted font-semibold">
                        TOTAL OUTFLOW
                      </span>
                      <span className="text-[16px] font-bold text-text-primary font-mono leading-tight mt-0.5">
                        {currSym}{formatNumber(Math.round(totalCatExpense), currSym, 0, 0)}
                      </span>
                      <span className="text-[10px] text-text-secondary mt-0.5 font-medium">
                        {categoriesCount} categories
                      </span>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="flex-1 w-full space-y-2 min-w-0">
              {displayCategories.map((cat, idx) => {
                const isHovered = activeCategoryIndex === idx

                return (
                  <div 
                    key={cat.name} 
                    onClick={() => setActiveCategoryIndex(activeCategoryIndex === idx ? null : idx)}
                    onMouseEnter={() => setActiveCategoryIndex(idx)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                    className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                      isHovered 
                        ? 'bg-surface-2 scale-[1.01]' 
                        : 'hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className={`h-2.5 w-2.5 rounded-full shrink-0 transition-transform duration-150 ${isHovered ? 'scale-125' : ''}`} 
                        style={{ 
                          backgroundColor: cat.color,
                          boxShadow: isHovered ? `0 0 8px ${cat.color}` : undefined
                        }} 
                      />
                      <span className={`text-[13px] font-medium truncate transition-colors ${isHovered ? 'text-text-primary font-semibold' : 'text-text-primary'}`}>
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                      <span className={`min-w-[42px] text-right transition-colors ${isHovered ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {cat.pct}
                      </span>
                      <span className="font-bold text-text-primary min-w-[65px] text-right">
                        {currSym}{formatNumber(cat.value, currSym, 0, 0)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Side: 2x2 Grid of the 4 KPI Cards (5 cols on lg/xl) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. SAVINGS RATE */}
            <div className="bg-surface-2/40 border border-border-default rounded-xl p-3.5 shadow-elevation-xs hover:border-border-strong transition-colors min-w-0 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 shrink-0">
                <Percent className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-secondary block truncate">
                  SAVINGS RATE
                </span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 leading-tight truncate">
                  <AnimatedCounter value={Number(liveSavingsRate)} decimals={1} suffix="%" />
                </p>
                <p className="text-[11px] text-text-secondary font-normal mt-0.5 truncate">
                  % of income saved
                </p>
              </div>
            </div>

            {/* 2. AVERAGE EXPENSE */}
            <div className="bg-surface-2/40 border border-border-default rounded-xl p-3.5 shadow-elevation-xs hover:border-border-strong transition-colors min-w-0 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-secondary block truncate">
                  AVERAGE EXPENSE
                </span>
                <p className="text-xl sm:text-2xl font-bold text-text-primary font-mono mt-0.5 leading-tight truncate">
                  <AnimatedCounter value={liveAvgTicket} prefix={currSym} decimals={2} />
                </p>
                <p className="text-[11px] text-text-secondary font-normal mt-0.5 truncate">
                  Per expense transaction
                </p>
              </div>
            </div>

            {/* 3. TOP SPENDING CATEGORY */}
            <div className="bg-surface-2/40 border border-border-default rounded-xl p-3.5 shadow-elevation-xs hover:border-border-strong transition-colors min-w-0 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40 shrink-0">
                <TrendingDown className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-secondary block truncate">
                  TOP SPENDING CATEGORY
                </span>
                <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 leading-tight truncate">
                  {liveTopExpenseName}
                </p>
                <p className="text-[11px] text-text-secondary font-normal mt-0.5 truncate">
                  Highest category outflow
                </p>
              </div>
            </div>

            {/* 4. CATEGORIES USED */}
            <div className="bg-surface-2/40 border border-border-default rounded-xl p-3.5 shadow-elevation-xs hover:border-border-strong transition-colors min-w-0 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40 shrink-0">
                <PieIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-secondary block truncate">
                  CATEGORIES USED
                </span>
                <p className="text-xl sm:text-2xl font-bold text-text-primary font-mono mt-0.5 leading-tight truncate">
                  {categoriesCount}
                </p>
                <p className="text-[11px] text-text-secondary font-normal mt-0.5 truncate">
                  Active categories
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* LEVEL 3 — FINANCIAL HEALTH                         */}
      {/* Answers: How healthy is my financial behavior?     */}
      {/* ================================================== */}
      <FinancialHealthCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        budgetLimit={effectiveLimit}
        expenses={displayExpenses}
        currencySymbol={currSym}
      />

      {/* ================================================== */}
      {/* LEVEL 4 — SUPPORTING TRENDS                        */}
      {/* Daily spending pace & 7-day flow pattern           */}
      {/* ================================================== */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 shadow-elevation-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight">
                7-Day Spending Trend
              </h3>
              <p className="text-xs text-text-secondary font-normal">
                Daily cash flow and spending pace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span className="text-text-secondary font-sans">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-text-secondary font-sans">Expense</span>
            </div>
            <span className="text-text-muted hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-text-muted font-sans">Daily Pace:</span>
              <span className="font-bold text-text-primary">
                {currSym}{formatNumber(Math.round(trendData.reduce((acc, curr) => acc + (curr.expense || 0), 0) / (trendData.length || 7)), currSym, 0, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="h-[200px] sm:h-[220px] pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={trendData} 
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} opacity={0.7} />
              <XAxis 
                dataKey="date" 
                stroke={isDark ? "#64748b" : "#94a3b8"} 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke={isDark ? "#64748b" : "#94a3b8"} 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={formatYAxis}
              />
              <Tooltip 
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.04)' }}
                content={(props) => <CustomBarTooltip {...props} currSym={currSym} />}
              />
              <Bar 
                dataKey="income" 
                fill="#10B981" 
                radius={[3, 3, 0, 0]} 
                name="Income" 
                barSize={16}
                minPointSize={12}
              />
              <Bar 
                dataKey="expense" 
                fill="#F43F5E" 
                radius={[3, 3, 0, 0]} 
                name="Expense" 
                barSize={16}
                minPointSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================== */}
      {/* LEVEL 5 — RECENT ACTIVITY                          */}
      {/* Answers: What actually happened recently?          */}
      {/* ================================================== */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 shadow-elevation-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight">
              Recent Transactions
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 font-normal">
              Latest entries in your journal
            </p>
          </div>
          <button
            onClick={() => setActiveTab("transactions")}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 font-medium cursor-pointer group"
          >
            <span>View All ({displayExpenses.length})</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-xs font-medium">
            No recent transactions recorded.
          </div>
        ) : (
          <div className="space-y-1">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === "income"
              const categoryStyle = getCategoryStyle(tx.category)
              const txDate = formatTxDate(tx.date)

              return (
                <div
                  key={tx._id || tx.id || `${tx.title}-${tx.date}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-surface-hover group cursor-default"
                >
                  {/* Left Side: Icon + Title/Recurring + Category/Date */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {tx.title}
                        </span>
                        {tx.isRecurring && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/40 dark:text-blue-400">
                            <Repeat className="h-2.5 w-2.5" /> RECURRING
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${categoryStyle.badge}`}
                        >
                          {tx.category}
                        </span>
                        <span className="text-xs text-text-secondary font-normal">
                          {txDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Amount + Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm font-semibold font-mono whitespace-nowrap flex items-center gap-1 ${
                        isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {currSym}
                      {formatNumber(tx.amount, currSym, 2, 2)}
                    </span>

                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {openEditModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(tx)
                          }}
                          className="p-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded"
                          title="Edit transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {handleDeleteTransaction && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTransaction(tx._id || tx.id)
                          }}
                          className="p-1 text-text-secondary hover:text-rose-400 transition-colors cursor-pointer rounded"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
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
