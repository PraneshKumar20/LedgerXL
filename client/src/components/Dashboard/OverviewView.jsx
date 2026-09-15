import { useState, useMemo } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Gauge, 
  Activity, 
  Clock, 
  SlidersHorizontal, 
  Heart, 
  ShieldCheck, 
  PiggyBank, 
  CreditCard, 
  Plane, 
  Grid,
  ChevronRight,
  ArrowRight,
  Edit2,
  Trash2,
  Repeat
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import AnimatedCounter from "../ui/AnimatedCounter"
import { formatNumber } from "../../utils/formatUtils"
import { getCategoryStyle } from "../../utils/categoryColors"
import { useTheme } from "../../context/ThemeContext"

export default function OverviewView({
  balance,
  totalIncome,
  totalExpense,
  currSym = "₹",
  multiplier = 1,
  incomeShare = 88,
  budgetPercent = 43,
  budgetLimit = 286541,
  setBudgetLimit,
  trendData = [],
  categoryData = [],
  totalCategoryExpense = 123737,
  activeCategoryIndex: propActiveCategoryIndex,
  setActiveCategoryIndex: propSetActiveCategoryIndex,
  renderActiveShape: propRenderActiveShape,
  displayExpenses = [],
  openEditModal,
  handleDeleteTransaction,
  setIsEnvelopeModalOpen,
  setActiveTab,
  financialHealth,
  savingsRate,
  avgTransaction,
  topCategory
}) {
  const { isDark } = useTheme()
  const [internalActiveIndex, setInternalActiveIndex] = useState(null)
  const activeCategoryIndex = propActiveCategoryIndex !== undefined ? propActiveCategoryIndex : internalActiveIndex
  const setActiveCategoryIndex = propSetActiveCategoryIndex || setInternalActiveIndex

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

  // Financial Health Live Metrics
  const healthScore = financialHealth?.score ?? 83
  const healthGrade = financialHealth?.grade ?? "A+"
  const healthTitle = financialHealth?.title ?? "Good financial health"

  // Grade color rule: > 80 Green, 60-80 Yellow, < 60 Red
  const healthColor = healthScore >= 80 ? "#10B981" : healthScore >= 60 ? "#F59E0B" : "#F43F5E"
  const healthTextColor = healthScore >= 80 ? "text-emerald-400" : healthScore >= 60 ? "text-amber-400" : "text-rose-400"

  const circleRadius = 24
  const circumference = 2 * Math.PI * circleRadius
  const strokeDashoffset = circumference - (healthScore / 100) * circumference

  const liveSavingsRate = savingsRate !== undefined ? Number(savingsRate).toFixed(1) : (totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : "0.0")
  const expenseCount = displayExpenses.filter(e => e.type === 'expense').length
  const liveAvgTicket = avgTransaction !== undefined ? avgTransaction : (expenseCount > 0 ? (totalExpense / expenseCount) : 0)
  const liveTopExpenseName = topCategory?.name || (categoryData[0]?.name ?? "None")

  // Custom Chart Tooltip
  const CustomBarTooltip = ({ active, payload, label }) => {
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
    <div className="space-y-5">
      {/* 1. Top Row: Two Large Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* TOTAL NET BALANCE CARD */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-6 flex flex-col justify-between shadow-elevation-sm">
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
              <div className="text-3xl sm:text-[38px] font-bold text-text-primary font-mono tracking-tight leading-none">
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
            <div>
              <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Monthly Income
              </p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 leading-tight">
                <AnimatedCounter value={totalIncome} prefix={currSym} decimals={2} />
              </p>
            </div>
            <div>
              <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Monthly Expenses
              </p>
              <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1 leading-tight">
                <AnimatedCounter value={totalExpense} prefix={currSym} decimals={2} />
              </p>
            </div>
          </div>
        </div>

        {/* MONTHLY BUDGET USAGE CARD */}
        <div className="bg-surface-1 border border-border-default rounded-xl p-6 flex flex-col justify-between shadow-elevation-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
                MONTHLY BUDGET USAGE
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
                <span className="text-emerald-600 dark:text-emerald-400">Within budget limit</span>
                <span className="text-text-secondary font-mono">
                  {currSym}{formatNumber(Math.round(remainingBuffer), currSym, 0, 0)} remaining
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, budgetPercent)}%` }} 
                  className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500" 
                />
              </div>
            </div>
          </div>

          {/* Subtotals (Remaining Buffer & Monthly Limit) */}
          <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-border-default">
            <div>
              <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Remaining Buffer
              </p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 leading-tight">
                +{currSym}{formatNumber(Math.round(remainingBuffer), currSym, 0, 0)}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.05em] flex items-center gap-1.5">
                  <span className="text-xs text-blue-600 dark:text-blue-400">◎</span> Monthly Limit
                </p>
                <button
                  onClick={() => setActiveTab("budgets")}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>manage</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-text-primary font-mono mt-1 leading-tight">
                {currSym}{formatNumber(Math.round(effectiveLimit), currSym, 0, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Two Charts with Exact 7:5 Proportions & Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 7-DAY CASHFLOW VELOCITY CARD: 7 cols (~58.3% width) */}
        <div className="lg:col-span-7 bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 shadow-elevation-sm flex flex-col justify-between h-[265px]">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-tight">
                7-Day Cashflow Velocity
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                Velocity (Avg/Day)
              </span>
              <p className="text-xl sm:text-2xl font-bold text-text-primary font-mono mt-1 leading-tight">
                {currSym}{formatNumber(Math.round(trendData.reduce((acc, curr) => acc + (curr.expense || 0), 0) / (trendData.length || 7)), currSym, 0, 0)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-xs font-medium pb-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span className="text-text-secondary">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-text-secondary">Expense</span>
            </div>
          </div>

          <div className="h-[185px] pt-1">
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
                  content={<CustomBarTooltip />}
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

        {/* SPEND BREAKDOWN CARD: 5 cols (~41.7% width) */}
        <div className="lg:col-span-5 bg-surface-1 border border-border-default rounded-xl p-5 sm:p-6 shadow-elevation-sm flex flex-col justify-between h-[265px]">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-tight">
                Spend Breakdown
              </span>
            </div>
            <button 
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              title="Filter"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 sm:gap-6 pt-1 h-[185px]">
            {/* Donut Chart with Centered Animated HUD */}
            <div className="relative w-[155px] h-[155px] shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={2}
                    dataKey="value"
                    stroke={isDark ? "#0f1523" : "#ffffff"}
                    strokeWidth={2}
                    activeIndex={activeCategoryIndex !== null ? activeCategoryIndex : -1}
                    activeShape={renderActiveShape}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1500}
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
                    <motion.div
                      key={`active-${displayCategories[activeCategoryIndex].name}`}
                      initial={{ scale: 0.75, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.75, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col items-center justify-center text-center px-1"
                    >
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[85px]"
                        style={{ color: displayCategories[activeCategoryIndex].color }}
                      >
                        {displayCategories[activeCategoryIndex].name}
                      </span>
                      <span className="text-[14px] font-bold text-text-primary font-mono leading-tight mt-0.5">
                        {displayCategories[activeCategoryIndex].pct}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default-center"
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col items-center justify-center text-center"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-text-muted font-medium">
                        Total Outflow
                      </span>
                      <span className="text-[15px] font-bold text-text-primary font-mono leading-tight mt-0.5">
                        {currSym}{formatNumber(Math.round(totalCatExpense), currSym, 0, 0)}
                      </span>
                      <span className="text-[10px] text-text-secondary mt-0.5">
                        {categoriesCount} categories
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Category Legend & Breakdown List with Proportional Spacing & Synchronized Hover/Click */}
            <div className="flex-1 flex flex-col justify-between h-[160px] pl-1 sm:pl-3">
              {displayCategories.map((cat, idx) => {
                const isHovered = activeCategoryIndex === idx

                return (
                  <div 
                    key={cat.name} 
                    onClick={() => setActiveCategoryIndex(activeCategoryIndex === idx ? null : idx)}
                    onMouseEnter={() => setActiveCategoryIndex(idx)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                    className={`grid grid-cols-[1fr_50px_66px] items-center gap-x-2.5 sm:gap-x-3 px-2.5 py-0.5 rounded-lg transition-all duration-150 cursor-pointer ${
                      isHovered 
                        ? 'bg-surface-2 shadow-elevation-sm scale-[1.02]' 
                        : 'hover:bg-surface-hover'
                    }`}
                  >
                    {/* Dot + Category Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className={`h-2 w-2 rounded-full shrink-0 transition-transform duration-150 ${isHovered ? 'scale-125' : ''}`} 
                        style={{ 
                          backgroundColor: cat.color,
                          boxShadow: isHovered ? `0 0 8px ${cat.color}` : undefined
                        }} 
                      />
                      <span className={`text-[13px] font-medium truncate transition-colors ${isHovered ? 'text-text-primary font-semibold' : 'text-text-primary'}`}>
                        {cat.name}
                      </span>
                    </div>

                    {/* Percentage */}
                    <span className={`text-[12px] font-mono text-right transition-colors ${isHovered ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {cat.pct}
                    </span>

                    {/* Amount */}
                    <span className="text-[12px] font-mono font-bold text-text-primary text-right">
                      {currSym}{formatNumber(cat.value, currSym, 0, 0)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Financial Health & Audit */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 shadow-elevation-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-text-primary tracking-tight">
              Financial Health & Audit
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${healthScore >= 80 ? 'bg-emerald-400' : healthScore >= 60 ? 'bg-amber-400' : 'bg-rose-500'}`} />
              <span className="text-xs font-semibold text-text-secondary">{healthGrade} Grade</span>
            </div>
            <button 
              onClick={() => setActiveTab("analytics")}
              className="text-xs text-blue-400 hover:underline cursor-pointer"
            >
              Details
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {/* Health Score Metric */}
          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-surface-2 border border-border-default/60">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r={circleRadius}
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="4"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={circleRadius}
                  fill="none"
                  stroke={healthColor}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-bold font-mono text-text-primary">
                {healthScore}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">Audit Score</span>
              <span className={`text-xs font-bold ${healthTextColor}`}>{healthTitle}</span>
            </div>
          </div>

          {/* Savings Rate Card */}
          <div 
            onClick={() => setActiveTab("budgets")}
            className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border-default/60 hover:border-border-strong transition-colors cursor-pointer group"
          >
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">Savings Rate</span>
              <span className="text-base font-bold text-text-primary font-mono">{liveSavingsRate}%</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Optimal buffer</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>

          {/* Avg. Ticket Size Card */}
          <div 
            onClick={() => setActiveTab("transactions")}
            className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border-default/60 hover:border-border-strong transition-colors cursor-pointer group"
          >
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">Avg. Ticket Size</span>
              <span className="text-base font-bold text-text-primary font-mono">{currSym}{formatNumber(liveAvgTicket, currSym, 2, 2)}</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5">Per expense</span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/40 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>

          {/* Top Expense Card */}
          <div 
            onClick={() => setActiveTab("analytics")}
            className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border-default/60 hover:border-border-strong transition-colors cursor-pointer group"
          >
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">Top Expense</span>
              <span className="text-base font-bold text-text-primary truncate max-w-[120px] block">{liveTopExpenseName}</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 block mt-0.5">Highest outflow</span>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/40 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Plane className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions Card (Directly Below Financial Health) */}
      <div className="bg-surface-1 border border-border-default rounded-xl p-5 shadow-elevation-sm">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h3 className="text-base font-semibold text-text-primary tracking-tight">
              Recent Transactions
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 font-normal">
              Latest entries in your journal
            </p>
          </div>
          <button
            onClick={() => setActiveTab("transactions")}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium cursor-pointer group"
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
          <div className="mt-2 space-y-1">
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

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
